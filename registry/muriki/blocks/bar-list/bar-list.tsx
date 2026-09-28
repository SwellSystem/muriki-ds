"use client"

// A lista com barra do Início do Backoffice ("De onde vêm as contas", em
// design/muriki-backoffice/telas.py). A barra tem duas camadas na mesma escala: `value` no tom claro
// da marca (as contas) e `part` no cheio (quem paga) — a parte se lê como fatia do todo, sem uma
// segunda escala. Item `muted` (ex.: "Não informada") fica com o rótulo esmaecido.
//
// Dois layouts. `rows` (o padrão): uma linha por item, com o rótulo, a barra deitada, o número e uma
// coluna à direita. `columns` (_colunas_origens do desenho): uma coluna em pé por item, o número em
// cima, a barra crescendo de baixo, e embaixo o ícone num quadradinho, o rótulo e a coluna
// secundária. Em colunas estreitas (`compact`, ou o contêiner com menos de 520px) o rótulo sai e fica
// só o ícone, com o nome no title.
//
// Acessibilidade: cada item é um item de lista com uma frase para o leitor de tela ("Google: 412
// contas, 198 pagantes (48%)"); rótulo, barra e números visíveis ficam aria-hidden. Com
// `tableToggle`, "Ver como tabela" troca a lista pela mesma informação em tabela.
import { useState, type ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface BarListItem {
  key: string
  label: string
  /** A barra clara, ex.: contas. */
  value: number
  /** A parte cheia, na mesma escala, ex.: pagantes. */
  part?: number
  /** Rótulo esmaecido, ex.: a origem "Não informada". */
  muted?: boolean
  /** O ícone do item, ex.: <GoogleLogoIcon />. Aparece embaixo da coluna no layout `columns`. */
  icon?: ReactNode
}

export interface BarListProps {
  items: BarListItem[]
  /** `rows`: barras deitadas (padrão). `columns`: colunas em pé, com o ícone embaixo. */
  layout?: "rows" | "columns"
  /** No layout `columns`, esconde o rótulo e deixa só o ícone (o nome vai no title). */
  compact?: boolean
  /** A altura da barra no layout `columns`, em px. */
  columnHeight?: number
  /** O número do item; padrão: número com o locale do navegador. */
  formatValue?: (value: number) => string
  /** A coluna secundária, ex.: (i) => `${Math.round((i.part! / i.value) * 100)}%`. */
  formatSecondary?: (item: BarListItem) => ReactNode
  /** O cabeçalho da coluna secundária na tabela, ex.: "pagam". */
  secondaryLabel?: string
  /** O que cada camada é, ex.: { value: "contas", part: "pagantes" }. Vira a legenda e a frase lida. */
  legend?: { value: string; part?: string }
  /** O topo da escala; padrão: o maior `value`. */
  max?: number
  /** A frase de cada item para o leitor de tela, se a padrão não servir. */
  itemLabel?: (item: BarListItem) => string
  /** Mostra o "Ver como tabela", que troca a lista pela tabela. */
  tableToggle?: boolean
  loading?: boolean
  loadingCount?: number
  className?: string
}

const LINHA = "grid grid-cols-[minmax(84px,110px)_minmax(0,1fr)_3.5rem_4rem] items-center gap-3"

export function BarList({
  items,
  layout = "rows",
  compact = false,
  columnHeight = 128,
  formatValue = (v) => new Intl.NumberFormat().format(v),
  formatSecondary,
  secondaryLabel,
  legend,
  max,
  itemLabel,
  tableToggle = false,
  loading = false,
  loadingCount,
  className,
}: BarListProps) {
  const t = useTranslate()
  const [comoTabela, setComoTabela] = useState(false)
  if (loading) {
    return layout === "columns" ? (
      <BarListSkeleton layout="columns" count={loadingCount ?? 9} columnHeight={columnHeight} className={className} />
    ) : (
      <BarListSkeleton count={loadingCount ?? 6} className={className} />
    )
  }
  if (items.length === 0 || items.every((i) => i.value === 0)) {
    return (
      <div
        className={cn(
          "flex min-h-32 items-center justify-center rounded-lg border border-dashed border-input px-4 text-center text-[13px] text-muted-foreground",
          className
        )}
      >
        {t("bar_list.empty")}
      </div>
    )
  }

  const topo = max ?? Math.max(...items.map((i) => i.value))
  const pct = (v: number) => `${topo > 0 ? Math.min(100, Math.max(0, (v / topo) * 100)) : 0}%`
  const frase = (i: BarListItem) => {
    if (itemLabel) return itemLabel(i)
    const partes = [`${formatValue(i.value)}${legend ? ` ${legend.value}` : ""}`]
    if (i.part !== undefined) partes.push(`${formatValue(i.part)}${legend?.part ? ` ${legend.part}` : ""}`)
    const extra = formatSecondary?.(i)
    return `${i.label}: ${partes.join(", ")}${typeof extra === "string" || typeof extra === "number" ? ` (${extra})` : ""}`
  }

  const legenda = legend ? (
    <span aria-hidden className="flex gap-3.5 text-[12px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-[2px] bg-primary/30" />
        {legend.value}
      </span>
      {legend.part ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-primary" />
          {legend.part}
        </span>
      ) : null}
    </span>
  ) : null

  // No compacto (`compact`, ou o contêiner com menos de 520px) o "Ver como tabela" desce para baixo,
  // à esquerda, e a legenda fica sozinha em cima, também à esquerda. Por container query.
  const noTopo = compact ? "hidden" : "@max-[519px]:hidden"
  const embaixo = compact ? undefined : "hidden @max-[519px]:inline-flex"
  const alternar = (onde: string | undefined, extra?: string) =>
    tableToggle ? (
      <button
        type="button"
        onClick={() => setComoTabela((v) => !v)}
        className={cn(
          "rounded-[6px] px-1.5 text-[12px] font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40",
          extra,
          onde
        )}
      >
        {comoTabela ? t("bar_list.as_list") : t("bar_list.as_table")}
      </button>
    ) : null
  const topoDaLista =
    legend || tableToggle ? (
      <div
        className={cn(
          "flex items-center gap-3",
          compact ? "justify-start" : "justify-end @max-[519px]:justify-start",
          !legend || comoTabela ? noTopo : undefined
        )}
      >
        {comoTabela ? null : legenda}
        {alternar(noTopo)}
      </div>
    ) : null

  let corpo: ReactNode
  if (comoTabela) {
    corpo = <Tabela {...{ items, formatValue, formatSecondary, secondaryLabel, legend }} />
  } else if (layout === "columns") {
    corpo = (
      <ul className="flex items-end gap-1 @[520px]:gap-2">
        {items.map((i) => (
          <li key={i.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className="sr-only">{frase(i)}</span>
            <span aria-hidden className="font-mono text-[11px] text-foreground-strong tabular-nums @[520px]:text-[12px]">
              {formatValue(i.value)}
            </span>
            <span
              aria-hidden
              className="relative block w-4 rounded-[5px] bg-sunken @[520px]:w-[26px]"
              style={{ height: columnHeight }}
            >
              <span className="absolute inset-x-0 bottom-0 rounded-[5px] bg-primary/30" style={{ height: pct(i.value) }} />
              {i.part !== undefined ? (
                <span className="absolute inset-x-0 bottom-0 rounded-[5px] bg-primary" style={{ height: pct(i.part) }} />
              ) : null}
            </span>
            {i.icon ? (
              <span
                aria-hidden
                title={i.label}
                className={cn(
                  "flex size-6 items-center justify-center rounded-[8px] bg-sunken [&_svg]:size-[13px] @[520px]:size-7 @[520px]:[&_svg]:size-[15px]",
                  i.muted ? "text-muted-foreground" : "text-foreground-strong"
                )}
              >
                {i.icon}
              </span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                "max-w-full truncate text-[11.5px] text-muted-foreground",
                compact ? "hidden" : i.icon ? "hidden @[520px]:block" : "block"
              )}
            >
              {i.label}
            </span>
            {formatSecondary ? (
              <span aria-hidden className="font-mono text-[10.5px] text-muted-foreground tabular-nums @[520px]:text-[11px]">
                {formatSecondary(i)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    )
  } else {
    corpo = (
      <ul className="flex flex-col gap-1">
        {items.map((i) => (
          <li key={i.key} className={cn(LINHA, "h-5")}>
            <span className="sr-only">{frase(i)}</span>
            <span
              aria-hidden
              className={cn(
                "flex min-w-0 items-center gap-1.5 truncate text-[13px] [&_svg]:size-3.5 [&_svg]:shrink-0",
                i.muted ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {i.icon}
              <span className="truncate">{i.label}</span>
            </span>
            <span aria-hidden className="relative block h-2.5 rounded-[3px] bg-sunken">
              <span className="absolute inset-y-0 left-0 rounded-[3px] bg-primary/30" style={{ width: pct(i.value) }} />
              {i.part !== undefined ? (
                <span className="absolute inset-y-0 left-0 rounded-[3px] bg-primary" style={{ width: pct(i.part) }} />
              ) : null}
            </span>
            <span aria-hidden className="text-right font-mono text-[12px] text-foreground-strong tabular-nums">
              {formatValue(i.value)}
            </span>
            <span aria-hidden className="text-right font-mono text-[12px] text-muted-foreground tabular-nums">
              {formatSecondary?.(i)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={cn("@container flex min-w-0 flex-col gap-2", className)}>
      {topoDaLista}
      {corpo}
      {alternar(embaixo, "-ml-1.5 self-start")}
    </div>
  )
}

function Tabela({
  items,
  formatValue,
  formatSecondary,
  secondaryLabel,
  legend,
}: Pick<BarListProps, "items" | "formatSecondary" | "secondaryLabel" | "legend"> & {
  formatValue: (value: number) => string
}) {
  const t = useTranslate()
  const temParte = items.some((i) => i.part !== undefined)
  return (
    <div className="overflow-x-auto rounded-[10px] shadow-[inset_0_0_0_1px_var(--border)]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[12px] text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">
              {t("bar_list.item")}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {legend?.value ?? t("bar_list.value")}
            </th>
            {temParte ? (
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {legend?.part ?? t("bar_list.part")}
              </th>
            ) : null}
            {formatSecondary ? (
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {secondaryLabel ?? ""}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.key} className="shadow-[inset_0_1px_0_var(--muted)]">
              <th
                scope="row"
                className={cn(
                  "px-3 py-2 text-left font-normal",
                  i.muted ? "text-muted-foreground" : "text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-2 [&_svg]:size-3.5">
                  {i.icon ? <span aria-hidden className="flex">{i.icon}</span> : null}
                  {i.label}
                </span>
              </th>
              <td className="px-3 py-2 text-right font-mono text-[12px] text-foreground-strong tabular-nums">
                {formatValue(i.value)}
              </td>
              {temParte ? (
                <td className="px-3 py-2 text-right font-mono text-[12px] text-foreground tabular-nums">
                  {i.part !== undefined ? formatValue(i.part) : "—"}
                </td>
              ) : null}
              {formatSecondary ? (
                <td className="px-3 py-2 text-right font-mono text-[12px] text-muted-foreground tabular-nums">
                  {formatSecondary(i)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BarListSkeleton({
  count = 6,
  layout = "rows",
  columnHeight = 128,
  className,
}: {
  count?: number
  layout?: "rows" | "columns"
  columnHeight?: number
  className?: string
}) {
  // a mesma silhueta: rótulo, barra de comprimentos variados e os dois números
  const larguras = [92, 70, 48, 36, 28, 22, 16, 12, 10]
  if (layout === "columns") {
    return (
      <div aria-hidden className={cn("@container flex min-w-0 items-end gap-1 pt-6 @[520px]:gap-2", className)}>
        {Array.from({ length: count }, (_, n) => (
          <div key={n} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <Skeleton className="h-3 w-6" />
            <div className="flex w-4 items-end @[520px]:w-[26px]" style={{ height: columnHeight }}>
              <Skeleton className="w-full rounded-[5px]" style={{ height: `${larguras[n % larguras.length]}%` }} />
            </div>
            <Skeleton className="size-6 rounded-[8px] @[520px]:size-7" />
            <Skeleton className="h-2.5 w-7" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div aria-hidden className={cn("flex min-w-0 flex-col gap-1 pt-6", className)}>
      {Array.from({ length: count }, (_, n) => (
        <div key={n} className={cn(LINHA, "h-5")}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2.5 rounded-[3px]" style={{ width: `${larguras[n % larguras.length]}%` }} />
          <Skeleton className="ml-auto h-3 w-8" />
          <Skeleton className="ml-auto h-3 w-8" />
        </div>
      ))}
    </div>
  )
}
