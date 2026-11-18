"use client"

// @component-doc
// @source custom: Muriki DS — TaskTable aprovado (prototipos/tabela)
// @used-by src/components/blocks/task-table/task-table.tsx
//
// As peças do modo do DS (com `groupBy`) que não existem no modo antigo:
// cabeçalho de coluna que ordena, arrasta e redimensiona; a linha de
// cálculos do grupo; o paginador; a barra da seleção; o skeleton e o menu
// do botão direito. Ficam aqui para o task-table.tsx continuar legível.
import * as React from "react"
import { ContextMenu } from "@base-ui/react/context-menu"
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  DotsSixVerticalIcon,
  XIcon,
} from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { RowAction } from "@/components/blocks/row-actions/row-actions"

import type { TaskTableColumnId, TaskTableTask } from "./types"

export type TaskTableColumnKey = "task" | TaskTableColumnId
export type TaskTableCalc = "none" | "count" | "filled" | "empty"
export interface TaskTableSort {
  id: TaskTableColumnKey
  dir: "asc" | "desc"
}

export const COLUMN_WIDTH: Record<TaskTableColumnKey, number> = {
  task: 360,
  owner: 120,
  status: 150,
  project: 150,
  priority: 130,
  subtasks: 130,
  due: 150,
}
export const SELECT_WIDTH = 44

/** O valor de uma coluna, para "Preenchidos" e "Vazios". */
function filled(task: TaskTableTask, id: TaskTableColumnKey): boolean {
  switch (id) {
    case "task":
      return Boolean(task.title)
    case "owner":
      return Boolean(task.owner)
    case "status":
      return true
    case "project":
      return Boolean(task.project)
    case "priority":
      return Boolean(task.priority && task.priority !== "none")
    case "subtasks":
      return Boolean(task.progress?.total)
    case "due":
      return Boolean(task.due)
  }
}

export function computeCalc(
  tasks: TaskTableTask[],
  id: TaskTableColumnKey,
  kind: TaskTableCalc
): number {
  if (kind === "count") return tasks.length
  const n = tasks.filter((t) => filled(t, id)).length
  return kind === "filled" ? n : tasks.length - n
}

// ── Cabeçalho de coluna ─────────────────────────────────────────────────────

export interface HeaderCellProps {
  id: TaskTableColumnKey
  label: string
  width: number
  sort?: TaskTableSort
  onSort: () => void
  /** Arrastar e Alt+←/→. A coluna Task fica fixa na frente. */
  movable: boolean
  dragging: boolean
  drop?: "before" | "after"
  moved: boolean
  onDragStart: () => void
  onDragOver: (side: "before" | "after") => void
  onDragLeave: () => void
  onDrop: () => void
  onDragEnd: () => void
  onMove: (delta: -1 | 1) => void
  onResize: (width: number) => void
}

export function HeaderCell(p: HeaderCellProps) {
  const t = useTranslate()
  const sorted = p.sort?.id === p.id
  const [resizing, setResizing] = React.useState(false)

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const x0 = e.clientX
    const w0 = p.width
    setResizing(true)
    const mv = (ev: MouseEvent) => p.onResize(Math.max(80, w0 + ev.clientX - x0))
    const up = () => {
      setResizing(false)
      window.removeEventListener("mousemove", mv)
      window.removeEventListener("mouseup", up)
    }
    window.addEventListener("mousemove", mv)
    window.addEventListener("mouseup", up)
  }

  return (
    <th
      scope="col"
      data-col={p.id}
      data-drop={p.drop}
      draggable={p.movable}
      aria-sort={
        sorted ? (p.sort?.dir === "asc" ? "ascending" : "descending") : undefined
      }
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", p.id)
        p.onDragStart()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        const r = e.currentTarget.getBoundingClientRect()
        p.onDragOver(
          !p.movable || e.clientX >= r.left + r.width / 2 ? "after" : "before"
        )
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) p.onDragLeave()
      }}
      onDrop={(e) => {
        e.preventDefault()
        p.onDrop()
      }}
      onDragEnd={p.onDragEnd}
      className={cn(
        "group/th relative px-2.5 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase select-none",
        p.movable && "hover:cursor-grab hover:bg-muted active:cursor-grabbing",
        p.dragging && "opacity-40",
        p.drop && "bg-primary-subtle"
      )}
    >
      <span
        className={cn(
          "flex h-full min-w-0 items-center gap-1.5 transition-transform duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)]",
          p.drop === "before" && "translate-x-2.5",
          p.drop === "after" && "-translate-x-2.5",
          p.moved && "muriki-tt-colin"
        )}
      >
        <button
          type="button"
          title={p.movable ? t("task_table.column_hint") : undefined}
          data-sorted={sorted || undefined}
          onClick={p.onSort}
          onKeyDown={(e) => {
            if (!p.movable || !e.altKey) return
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
            e.preventDefault()
            p.onMove(e.key === "ArrowLeft" ? -1 : 1)
          }}
          className="-mx-1.5 inline-flex h-[26px] min-w-0 items-center gap-1.5 rounded-md px-1.5 uppercase hover:bg-muted hover:text-foreground-strong focus-visible:outline-2 focus-visible:outline-ring data-[sorted]:text-foreground-strong"
        >
          {p.movable && (
            <DotsSixVerticalIcon
              size={12}
              weight="bold"
              aria-hidden
              className="-ml-1 hidden shrink-0 group-hover/th:inline"
            />
          )}
          <span className="truncate">{p.label}</span>
          {sorted &&
            (p.sort?.dir === "asc" ? (
              <CaretUpIcon size={12} className="shrink-0 text-primary" />
            ) : (
              <CaretDownIcon size={12} className="shrink-0 text-primary" />
            ))}
        </button>
      </span>
      <span
        aria-hidden
        title={t("task_table.resize_hint")}
        data-on={resizing || undefined}
        onMouseDown={startResize}
        className="absolute top-1.5 right-0 bottom-1.5 z-[2] w-[7px] cursor-col-resize after:absolute after:inset-y-0 after:right-[3px] after:w-0.5 after:rounded-sm after:transition-colors group-hover/th:after:bg-divider hover:after:!bg-primary data-[on]:after:!bg-primary"
      />
    </th>
  )
}

// ── Cálculo de uma coluna, na última linha do grupo ─────────────────────────

const CALCS: TaskTableCalc[] = ["none", "count", "filled", "empty"]

export function CalcButton({
  label,
  kind,
  value,
  onKindChange,
}: {
  label: string
  kind: TaskTableCalc
  value: number
  onKindChange: (kind: TaskTableCalc) => void
}) {
  const t = useTranslate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t("task_table.calc.of", { column: label })}
            data-set={kind !== "none" || undefined}
            className="-mx-1.5 inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[12px] text-muted-foreground opacity-0 transition-opacity group-hover/calc:opacity-100 hover:bg-muted hover:text-foreground-strong focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring data-[popup-open]:opacity-100 data-[set]:opacity-100"
          >
            {kind === "none" ? (
              t("task_table.calc.label")
            ) : (
              <>
                <span>{t(`task_table.calc.${kind}`)}</span>
                <b className="font-semibold text-foreground-strong tabular-nums">
                  {value}
                </b>
              </>
            )}
          </button>
        }
      />
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>{t("task_table.calc.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={kind}
          onValueChange={(v) => onKindChange(v as TaskTableCalc)}
        >
          {CALCS.map((k) => (
            <DropdownMenuRadioItem key={k} value={k}>
              {t(`task_table.calc.${k}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Paginador (sem grupo) ───────────────────────────────────────────────────

/** Primeira, última, a atual e vizinhas; o resto vira "…" com menu. */
function pageList(n: number, c: number): (number | number[])[] {
  const keep = [0, n - 1, c - 1, c, c + 1].filter((i) => i >= 0 && i < n)
  const out: (number | number[])[] = []
  let gap: number[] = []
  for (let i = 0; i < n; i++) {
    if (!keep.includes(i)) {
      gap.push(i)
      continue
    }
    if (gap.length === 1) out.push(gap[0])
    else if (gap.length) out.push(gap)
    gap = []
    out.push(i)
  }
  return out
}

const PG_BTN =
  "inline-grid h-[30px] min-w-[30px] place-items-center rounded-lg px-1.5 tabular-nums text-foreground hover:bg-muted hover:text-foreground-strong focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 aria-[current=page]:bg-primary-subtle aria-[current=page]:font-medium aria-[current=page]:text-primary-subtle-foreground"

export function Pager({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPage: (page: number) => void
}) {
  const t = useTranslate()
  return (
    <nav
      aria-label={t("task_table.pager.label")}
      className="sticky bottom-0 left-0 z-[6] box-border flex h-12 w-[var(--vw,100%)] shrink-0 items-center gap-4 bg-card px-4 text-[13px] text-muted-foreground shadow-[inset_0_1px_0_var(--divider)]"
    >
      <span className="tabular-nums">
        {t("task_table.pager.showing", {
          from: page * pageSize + 1,
          to: Math.min(total, page * pageSize + pageSize),
          total,
        })}
      </span>
      <span className="mx-auto inline-flex items-center gap-0.5">
        <button
          type="button"
          className={PG_BTN}
          disabled={page === 0}
          aria-label={t("task_table.pagination_previous")}
          onClick={() => onPage(page - 1)}
        >
          <CaretLeftIcon size={13} />
        </button>
        {pageList(pageCount, page).map((i) =>
          Array.isArray(i) ? (
            <DropdownMenu key={"g" + i[0]}>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={PG_BTN}
                    aria-label={t("task_table.pager.range", {
                      from: i[0] + 1,
                      to: i[i.length - 1] + 1,
                    })}
                  >
                    …
                  </button>
                }
              />
              <DropdownMenuContent className="w-40">
                <DropdownMenuLabel>{t("task_table.pager.go_to")}</DropdownMenuLabel>
                {i.map((x) => (
                  <DropdownMenuItem key={x} onClick={() => onPage(x)}>
                    {t("task_table.pager.page", { page: x + 1 })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={i}
              type="button"
              className={PG_BTN}
              aria-current={i === page ? "page" : undefined}
              aria-label={t("task_table.pager.page", { page: i + 1 })}
              onClick={() => onPage(i)}
            >
              {i + 1}
            </button>
          )
        )}
        <button
          type="button"
          className={PG_BTN}
          disabled={page >= pageCount - 1}
          aria-label={t("task_table.pagination_next")}
          onClick={() => onPage(page + 1)}
        >
          <CaretRightIcon size={13} />
        </button>
      </span>
    </nav>
  )
}

// ── Barra da seleção ────────────────────────────────────────────────────────

/**
 * Escura, embaixo no centro. Ela cobre o canto onde o Sonner põe os avisos:
 * enquanto houver seleção, passe ao `<Toaster>` um `offset` (ex.:
 * `offset={{ bottom: 88 }}`) para os toasts subirem para cima dela.
 */
export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children?: React.ReactNode
}) {
  const t = useTranslate()
  return (
    <div
      role="toolbar"
      aria-label={t("task_table.bulk.label")}
      className="muriki-tt-swap absolute bottom-4 left-1/2 z-[8] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[oklch(24%_0.02_250)] py-1.5 pr-1.5 pl-3.5 text-[oklch(97%_0.003_100)] shadow-[0_10px_28px_oklch(32%_0.02_248.5/0.28)] dark:bg-popover dark:text-popover-foreground dark:shadow-[inset_0_0_0_1px_var(--border),0_12px_30px_oklch(0%_0_0/0.5)] [&_button]:text-inherit"
    >
      <b className="text-[12.5px] font-medium whitespace-nowrap">
        {t("task_table.bulk.selected", { count })}
      </b>
      {children}
      <span aria-hidden className="h-4 w-px bg-current opacity-25" />
      <button
        type="button"
        aria-label={t("task_table.bulk.clear")}
        onClick={onClear}
        className="inline-grid size-[26px] place-items-center rounded-md opacity-70 hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring dark:hover:bg-foreground/10"
      >
        <XIcon size={14} />
      </button>
    </div>
  )
}

// ── Skeleton com a forma da tabela ──────────────────────────────────────────

const STRIPES = [
  "bg-[color-mix(in_oklab,var(--background),var(--muted))]",
  "bg-card",
  "bg-[color-mix(in_oklab,var(--card)_50%,var(--primary-subtle))]",
]

export function SkeletonRows({
  columns,
  rows,
  seed,
}: {
  columns: TaskTableColumnKey[]
  rows: number
  seed: number
}) {
  const bone = (id: TaskTableColumnKey, l: number) => {
    if (id === "task")
      return (
        <span className="flex items-center gap-2.5 pl-6">
          <Skeleton className="size-[18px] rounded-full" />
          <Skeleton className="h-[9px] w-[42px]" />
          <Skeleton
            className="h-[11px]"
            style={{ width: `${45 + ((l * 17 + seed * 11) % 35)}%` }}
          />
        </span>
      )
    if (id === "owner") return <Skeleton className="size-[22px] rounded-full" />
    if (id === "status" || id === "priority" || id === "due")
      return <Skeleton className="h-[22px] w-[82px] rounded-[7px]" />
    return (
      <Skeleton
        className="h-[9px]"
        style={{ width: 60 + ((l * 13 + id.length * 7) % 30) }}
      />
    )
  }
  return (
    <>
      {Array.from({ length: rows }, (_, l) => (
        <tr key={l} className="h-[42px]">
          <td className={STRIPES[l % 3]} />
          {columns.map((id) => (
            <td key={id} className={cn("px-2.5", STRIPES[l % 3])}>
              {bone(id, l)}
            </td>
          ))}
          <td className={STRIPES[l % 3]} />
        </tr>
      ))}
    </>
  )
}

// ── Menu do botão direito ───────────────────────────────────────────────────

/**
 * O mesmo menu das ações da linha, no clique direito. Fora de uma fileira,
 * o menu do navegador continua valendo.
 */
export function RowContextMenu({
  actions,
  onRow,
  children,
}: {
  actions: RowAction[]
  onRow: (taskId: string) => void
  children: React.ReactNode
}) {
  return (
    <div
      onContextMenuCapture={(e) => {
        const tr = (e.target as HTMLElement).closest<HTMLElement>(
          "tr[data-id]"
        )
        if (!tr?.dataset.id) {
          e.stopPropagation()
          return
        }
        onRow(tr.dataset.id)
      }}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger render={<div />}>{children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Positioner className="isolate z-50 outline-none">
            <ContextMenu.Popup className="max-h-(--available-height) w-52 min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto muriki-scroll rounded-[var(--radius-float)] bg-popover p-1 text-popover-foreground shadow-[var(--float)] outline-none transition-[opacity,transform] duration-100 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              {actions.map((a, i) => (
                <React.Fragment key={a.id}>
                  {a.destructive && i > 0 && !actions[i - 1]?.destructive && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    disabled={a.disabled || a.loading}
                    onClick={a.onSelect}
                    variant={a.destructive ? "destructive" : "default"}
                  >
                    <a.icon className="size-4" />
                    {a.label}
                    {a.shortcut ? (
                      <DropdownMenuShortcut>{a.shortcut}</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </div>
  )
}
