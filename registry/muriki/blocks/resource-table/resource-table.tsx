"use client"

/**
 * Resource Table — a tabela do CRUD.
 *
 * Todo recurso do backoffice (clientes, planos, cupons…) é a mesma peça com
 * colunas diferentes: cartão com cabeçalho em faixa de rail, linha de 52px,
 * seleção opcional, ações da linha que aparecem no hover (o RowActions do
 * DS) e paginação no pé. A tabela é APRESENTACIONAL e controlada: busca,
 * ordenação, filtro e página são do caller — que em geral é a API.
 *
 * É uma <table> de verdade. Leitor de tela anda por linha e coluna, e o
 * `group/row` no <tr> é o que o RowActions usa para aparecer.
 */
import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowsDownUpIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

import { RowActions } from "@/components/blocks/row-actions/row-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { formatCount, useResourceLabel } from "./labels"
import type { ResourceColumn, ResourcePagination, ResourceSort, RowAction } from "./types"

const HIDE: Record<NonNullable<ResourceColumn<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
}

/** Clique que nasce num controle da linha não abre a linha. */
const INTERATIVO = "a,button,input,label,select,textarea,[role=checkbox],[data-slot=row-actions]"

export interface ResourceTableProps<T> {
  columns: ResourceColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Nome da tabela para leitor de tela (vira <caption> escondido). */
  label: string

  /** Liga a coluna de seleção. Controlada por `selectedIds`. */
  selectable?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  /** O que fazer com a seleção: aparece numa faixa acima das linhas quando há algo marcado. */
  bulkActions?: (ids: string[]) => React.ReactNode

  /** Ações de cada linha. O destrutivo vai para o menu de "mais", depois de um filete. */
  rowActions?: (row: T) => RowAction[]
  /** Quantas ações ficam como ícone antes do menu. */
  inlineActions?: number
  onRowClick?: (row: T) => void
  /** Linha apagada (ex.: acesso revogado): continua na lista, mas recua. */
  isRowMuted?: (row: T) => boolean

  sort?: ResourceSort | null
  onSortChange?: (sort: ResourceSort | null) => void

  loading?: boolean
  /** Quantas linhas de skeleton enquanto carrega. Use o `pageSize`. */
  skeletonRows?: number
  /** Estado vazio. Sem ele, entra o texto padrão. */
  empty?: React.ReactNode

  pagination?: ResourcePagination
  className?: string
}

export function ResourceTable<T>({
  columns,
  rows,
  getRowId,
  label,
  selectable = false,
  selectedIds,
  onSelectedIdsChange,
  bulkActions,
  rowActions,
  inlineActions = 3,
  onRowClick,
  isRowMuted,
  sort,
  onSortChange,
  loading = false,
  skeletonRows = 8,
  empty,
  pagination,
  className,
}: ResourceTableProps<T>) {
  const t = useResourceLabel()
  const selected = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const pageIds = rows.map(getRowId)
  const marcados = pageIds.filter((id) => selected.has(id)).length
  const todos = pageIds.length > 0 && marcados === pageIds.length
  const alguns = marcados > 0 && !todos
  const temAcoes = !!rowActions
  const totalColunas = columns.length + (selectable ? 1 : 0) + (temAcoes ? 1 : 0)

  function alternarTodos(marcar: boolean) {
    if (!onSelectedIdsChange) return
    const fora = (selectedIds ?? []).filter((id) => !pageIds.includes(id))
    onSelectedIdsChange(marcar ? [...fora, ...pageIds] : fora)
  }

  function alternar(id: string, marcar: boolean) {
    if (!onSelectedIdsChange) return
    const atual = selectedIds ?? []
    onSelectedIdsChange(marcar ? [...atual, id] : atual.filter((x) => x !== id))
  }

  function ordenar(coluna: ResourceColumn<T>) {
    if (!onSortChange || !coluna.sortable) return
    if (sort?.columnId !== coluna.id) return onSortChange({ columnId: coluna.id, direction: "asc" })
    if (sort.direction === "asc") return onSortChange({ columnId: coluna.id, direction: "desc" })
    onSortChange(null)
  }

  const selecao = selectedIds ?? []

  return (
    <section
      data-slot="resource-table"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[12px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        "dark:shadow-[inset_0_0_0_1px_var(--border)]",
        className
      )}
    >
      {bulkActions && selecao.length > 0 ? (
        <div
          data-slot="resource-table-bulk"
          className="flex h-11 shrink-0 items-center gap-2 bg-primary-subtle px-4 text-[13px] text-primary-subtle-foreground shadow-[inset_0_-1px_0_var(--border)]"
        >
          <span className="font-medium">{t("resource.selected", { count: selecao.length })}</span>
          <span aria-hidden className="mx-1 h-4 w-px bg-primary-subtle-border" />
          <div className="flex items-center gap-1.5">{bulkActions(selecao)}</div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onSelectedIdsChange?.([])}>
            {t("resource.clear_selection")}
          </Button>
        </div>
      ) : null}

      <div className="muriki-scroll min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-[13px]">
          <caption className="sr-only">{label}</caption>
          <colgroup>
            {selectable ? <col className="w-12" /> : null}
            {columns.map((c) => (
              <col key={c.id} style={c.width ? { width: c.width } : undefined} />
            ))}
            {temAcoes ? <col className="w-[104px]" /> : null}
          </colgroup>
          <thead className="sticky top-0 z-[1] bg-rail">
            <tr className="h-[38px] shadow-[inset_0_-1px_0_var(--border)]">
              {selectable ? (
                <th scope="col" className="pl-4">
                  <Checkbox
                    aria-label={t("resource.select_all")}
                    checked={todos}
                    indeterminate={alguns}
                    disabled={!onSelectedIdsChange || pageIds.length === 0}
                    onCheckedChange={(v) => alternarTodos(!!v)}
                  />
                </th>
              ) : null}
              {columns.map((c, i) => {
                const ativo = sort?.columnId === c.id
                const aria = ativo ? (sort.direction === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined
                const Icone = !ativo ? ArrowsDownUpIcon : sort.direction === "asc" ? ArrowUpIcon : ArrowDownIcon
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={aria}
                    className={cn(
                      "px-2.5 text-[12px] font-medium whitespace-nowrap text-muted-foreground",
                      c.align === "end" ? "text-right" : "text-left",
                      i === 0 && !selectable && "pl-4",
                      i > 0 && c.hideBelow && HIDE[c.hideBelow]
                    )}
                  >
                    {c.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => ordenar(c)}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded-[6px] px-1 py-0.5 outline-none transition-colors",
                          "hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35",
                          ativo && "text-foreground-strong",
                          c.align === "end" && "flex-row-reverse"
                        )}
                      >
                        {c.header}
                        <Icone aria-hidden className={cn("size-3", !ativo && "opacity-60")} />
                        {ativo ? (
                          <span className="sr-only">{t(sort.direction === "asc" ? "resource.sort_asc" : "resource.sort_desc")}</span>
                        ) : null}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
              {temAcoes ? (
                <th scope="col" className="pr-4">
                  <span className="sr-only">{t("resource.row_actions")}</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={`sk-${i}`} aria-hidden className="h-[52px] shadow-[inset_0_-1px_0_var(--border)]">
                    {selectable ? (
                      <td className="pl-4">
                        <Skeleton className="size-4 rounded-[4px]" />
                      </td>
                    ) : null}
                    {columns.map((c, j) => (
                      <td
                        key={c.id}
                        className={cn("px-2.5", j === 0 && !selectable && "pl-4", j > 0 && c.hideBelow && HIDE[c.hideBelow])}
                      >
                        {j === 0 ? (
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="size-7 shrink-0 rounded-full" />
                            <div className="flex flex-1 flex-col gap-1.5">
                              <Skeleton className="h-3 w-3/5" />
                              <Skeleton className="h-2.5 w-2/5" />
                            </div>
                          </div>
                        ) : (
                          <Skeleton className={cn("h-3", c.align === "end" ? "ml-auto w-1/2" : "w-2/3")} />
                        )}
                      </td>
                    ))}
                    {temAcoes ? <td /> : null}
                  </tr>
                ))
              : null}

            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={totalColunas} className="px-4 py-16 text-center">
                  {empty ?? (
                    <div className="mx-auto flex max-w-sm flex-col gap-1">
                      <p className="text-sm font-medium text-foreground-strong">{t("resource.empty_title")}</p>
                      <p className="text-[13px] text-muted-foreground">{t("resource.empty_hint")}</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : null}

            {!loading
              ? rows.map((row) => {
                  const id = getRowId(row)
                  const marcado = selected.has(id)
                  const apagada = isRowMuted?.(row) ?? false
                  return (
                    <tr
                      key={id}
                      data-state={marcado ? "selected" : undefined}
                      data-muted={apagada || undefined}
                      onClick={
                        onRowClick
                          ? (e) => {
                              // O menu de overflow e os diálogos das ações são portais: no
                              // DOM moram no body, mas o clique do React sobe pela árvore de
                              // componentes até aqui. Clique que não nasceu dentro da linha
                              // não abre a linha.
                              if (!e.currentTarget.contains(e.target as Node)) return
                              if ((e.target as HTMLElement).closest(INTERATIVO)) return
                              onRowClick(row)
                            }
                          : undefined
                      }
                      className={cn(
                        "group/row h-[52px] shadow-[inset_0_-1px_0_var(--border)] transition-colors",
                        "hover:bg-muted data-[state=selected]:bg-primary-subtle",
                        onRowClick && "cursor-pointer"
                      )}
                    >
                      {selectable ? (
                        <td className="pl-4">
                          <Checkbox
                            aria-label={t("resource.select_row")}
                            checked={marcado}
                            disabled={!onSelectedIdsChange}
                            onCheckedChange={(v) => alternar(id, !!v)}
                          />
                        </td>
                      ) : null}
                      {columns.map((c, j) => (
                        <td
                          key={c.id}
                          className={cn(
                            "px-2.5 py-2 align-middle text-foreground",
                            c.align === "end" && "text-right tabular-nums",
                            j === 0 && !selectable && "pl-4",
                            j > 0 && c.hideBelow && HIDE[c.hideBelow],
                            apagada && "text-muted-foreground"
                          )}
                        >
                          {c.cell(row)}
                        </td>
                      ))}
                      {rowActions ? (
                        <td className="pr-3 text-right">
                          <RowActions
                            actions={rowActions(row)}
                            inlineCount={inlineActions}
                            moreLabel={t("resource.more_actions")}
                          />
                        </td>
                      ) : null}
                    </tr>
                  )
                })
              : null}
          </tbody>
        </table>
      </div>

      {pagination ? <ResourcePaginationBar {...pagination} /> : null}
    </section>
  )
}

/** Páginas visíveis: a primeira, a última e duas em volta da atual, com reticências no meio. */
function janela(pagina: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const meio = [pagina - 1, pagina, pagina + 1].filter((p) => p > 1 && p < total)
  const saida: (number | "…")[] = [1]
  if (meio[0] > 2) saida.push("…")
  saida.push(...meio)
  if (meio[meio.length - 1] < total - 1) saida.push("…")
  saida.push(total)
  return saida
}

export function ResourcePaginationBar(props: ResourcePagination) {
  const t = useResourceLabel()
  const { pageSize, pageSizeOptions = [10, 25, 50, 100], onPageSizeChange } = props

  const tamanho = onPageSizeChange ? (
    <label className="hidden items-center gap-2 sm:flex">
      {t("resource.per_page")}
      <Select
        value={pageSize}
        items={pageSizeOptions.map((n) => ({ value: n, label: String(n) }))}
        onValueChange={(v) => v != null && onPageSizeChange(v)}
      >
        <SelectTrigger size="sm" className="w-[68px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((n) => (
            <SelectItem key={n} value={n}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  ) : null

  const barra = "flex h-12 shrink-0 items-center gap-3 px-4 text-[12.5px] text-muted-foreground shadow-[inset_0_1px_0_var(--border)]"

  if (props.mode === "cursor") {
    // Sem total: nada de faixa "de N" nem números. Anterior e próxima, com texto — sozinhas, setas mudas não dizem o bastante.
    const { page, hasPrevious, hasNext, onPrevious, onNext } = props
    return (
      <nav data-slot="resource-pagination" data-mode="cursor" aria-label={t("resource.pagination")} className={barra}>
        {page != null ? <span className="tabular-nums">{t("resource.page", { page })}</span> : null}
        <span className="flex-1" />
        {tamanho}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" disabled={!hasPrevious} onClick={onPrevious} aria-label={t("resource.previous_page")}>
            <CaretLeftIcon />
            {t("resource.previous")}
          </Button>
          <Button variant="ghost" size="sm" disabled={!hasNext} onClick={onNext} aria-label={t("resource.next_page")}>
            {t("resource.next")}
            <CaretRightIcon />
          </Button>
        </div>
      </nav>
    )
  }

  const { page, total, onPageChange } = props
  const paginas = Math.max(1, Math.ceil(total / pageSize))
  const de = total === 0 ? 0 : (page - 1) * pageSize + 1
  const ate = Math.min(total, page * pageSize)

  return (
    <nav data-slot="resource-pagination" data-mode="page" aria-label={t("resource.page", { page })} className={barra}>
      <span className="tabular-nums">
        {total === 0
          ? t("resource.range_empty", { total: 0 })
          : t("resource.range", { from: formatCount(de), to: formatCount(ate), total: formatCount(total) })}
      </span>
      <span className="flex-1" />
      {tamanho}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("resource.previous_page")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <CaretLeftIcon />
        </Button>
        {janela(page, paginas).map((p, i) =>
          p === "…" ? (
            <span key={`r-${i}`} aria-hidden className="w-5 text-center">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              aria-label={t("resource.page", { page: p })}
              onClick={() => onPageChange(p)}
              className={cn(
                "inline-flex h-7 min-w-7 items-center justify-center rounded-[7px] px-1.5 font-mono text-[12px] outline-none transition-colors",
                "focus-visible:ring-[3px] focus-visible:ring-ring/35",
                p === page
                  ? "bg-primary-subtle font-medium text-primary-subtle-foreground"
                  : "hover:bg-secondary hover:text-foreground"
              )}
            >
              {p}
            </button>
          )
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("resource.next_page")}
          disabled={page >= paginas}
          onClick={() => onPageChange(page + 1)}
        >
          <CaretRightIcon />
        </Button>
      </div>
    </nav>
  )
}
