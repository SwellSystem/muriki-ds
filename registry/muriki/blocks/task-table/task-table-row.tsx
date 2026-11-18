// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-table.html
// @used-by src/components/blocks/task-table/task-table.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import {
  CaretDown,
  Check,
  Circle,
  DotsThree,
  Equals,
  Flag,
  LockOpen,
  PencilSimple,
  Plus,
  SealWarning,
  TrendDown,
  TrendUp,
  Warning,
  X,
} from "@phosphor-icons/react"
import { CalendarBlankIcon, WarningCircleIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  RowActions,
  type RowAction,
} from "@/components/blocks/row-actions/row-actions"

import type {
  TaskTableAvatarTone,
  TaskTableColumnId,
  TaskTableDueState,
  TaskTableKind,
  TaskTableOwner,
  TaskTablePatch,
  TaskTablePriority,
  TaskTableStatus,
  TaskTableTask,
  TaskTableTone,
} from "./types"

const avatarToneClass: Record<TaskTableAvatarTone, string> = {
  a1: "bg-primary/14 text-primary",
  a2: "bg-[color-mix(in_oklab,var(--chart-3)_14%,var(--card))] text-[var(--chart-3)]",
  a3: "bg-[color-mix(in_oklab,var(--chart-1)_24%,var(--card))] text-[oklch(0.42_0.1_70)]",
  a4: "bg-muted text-muted-foreground",
}

const statusRailClass: Record<TaskTableStatus, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-[color-mix(in_oklab,var(--muted-foreground)_40%,transparent)]",
}

const statusTextClass: Record<TaskTableStatus, string> = {
  active: "text-success",
  progress: "text-primary",
  blocked: "text-destructive",
  done: "text-muted-foreground",
}

const statusDotClass: Record<TaskTableStatus, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-muted-foreground/60",
}

const kindIconWrapperClass: Record<TaskTableKind, string> = {
  epic: "bg-[color-mix(in_oklab,var(--chart-3)_14%,transparent)] text-[var(--chart-3)]",
  task: "bg-primary/14 text-primary",
  sub: "bg-muted text-muted-foreground",
}

function KindIcon({
  kind,
  status,
}: {
  kind: TaskTableKind
  status: TaskTableStatus
}) {
  if (kind === "epic") {
    return <Flag size={12} weight="fill" />
  }
  if (kind === "sub") {
    if (status === "done") return <Check size={12} weight="bold" />
    if (status === "blocked") return <Warning size={12} weight="regular" />
    return <Circle size={12} weight="regular" />
  }
  return <Circle size={12} weight="regular" />
}

const PRIORITY_CELL_CONFIG: Record<
  TaskTablePriority,
  {
    icon: React.ElementType | null
    weight: "fill" | "regular"
    colorClass: string
  }
> = {
  urgent: {
    icon: SealWarning,
    weight: "fill",
    colorClass: "text-destructive",
  },
  high: {
    icon: TrendUp,
    weight: "fill",
    colorClass: "text-orange-600 dark:text-orange-400",
  },
  medium: {
    icon: Equals,
    weight: "regular",
    colorClass: "text-amber-600 dark:text-amber-400",
  },
  low: {
    icon: TrendDown,
    weight: "regular",
    colorClass: "text-sky-600 dark:text-sky-400",
  },
  none: {
    icon: null,
    weight: "regular",
    colorClass: "text-muted-foreground",
  },
}

function PriorityCell({ priority }: { priority: TaskTablePriority }) {
  const t = useTranslate()
  const config = PRIORITY_CELL_CONFIG[priority]
  const IconComponent = config.icon

  // Sem prioridade é só o ícone de três traços (o PriorityIcon do DS): o
  // texto repetido em toda fileira vazia virava ruído, e o traço "—" sozinho
  // parecia dado faltando, não uma prioridade escolhida.
  if (priority === "none") {
    const label = t("task_table.priority_empty")
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className="inline-flex text-muted-foreground/60"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={1.5 + i * 4}
              y={6.25}
              width={3}
              height={1.5}
              rx={0.75}
              fill="currentColor"
            />
          ))}
        </svg>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[12.5px] ${config.colorClass}`}
    >
      {IconComponent && (
        <IconComponent size={12} weight={config.weight} aria-hidden />
      )}
      {t(`task_table.priority.${priority}`)}
    </span>
  )
}

function OwnerAvatar({ owner }: { owner: TaskTableOwner }) {
  return (
    <span
      title={owner.name}
      aria-label={owner.name}
      className={cn(
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
        avatarToneClass[owner.tone ?? "a4"]
      )}
    >
      {owner.initials}
    </span>
  )
}

function StatusView({ status }: { status: TaskTableStatus }) {
  const t = useTranslate()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
        statusTextClass[status]
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-[7px] shrink-0 rounded-full",
          statusDotClass[status],
          "shadow-[0_0_0_3px_color-mix(in_oklab,currentColor_15%,transparent)]"
        )}
      />
      {t(`task_table.status.${status}`)}
    </span>
  )
}

function ProgressCell({ done, total }: { done: number; total: number }) {
  const t = useTranslate()
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
      <span className="block h-1 w-[54px] overflow-hidden rounded-sm bg-muted">
        <span
          className="block h-full rounded-sm bg-primary"
          style={{ width: `${pct}%` }}
        />
      </span>
      {t("task_table.progress_count", { done, total })}
    </span>
  )
}

/** Ordem padrão das colunas que andam, igual à de antes. */
export function defaultColumns(
  showOwner: boolean,
  showProject: boolean
): TaskTableColumnId[] {
  const out: TaskTableColumnId[] = []
  if (showOwner) out.push("owner")
  out.push("status")
  if (showProject) out.push("project")
  out.push("priority", "subtasks", "due")
  return out
}

const STATUSES: TaskTableStatus[] = ["active", "progress", "blocked", "done"]
const PRIORITIES: TaskTablePriority[] = ["urgent", "high", "medium", "low", "none"]

/**
 * Picker dentro da célula: com `onChange`, o valor vira gatilho de um menu
 * de opções no lugar. O clique não chega na fileira (que abriria a tarefa).
 */
function CellPicker({
  label,
  value,
  options,
  onValueChange,
  children,
}: {
  label: string
  value: string
  options: { value: string; label: React.ReactNode }[]
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            className="-mx-1.5 inline-flex h-[26px] max-w-[calc(100%+12px)] min-w-0 items-center rounded-md px-1.5 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring data-[popup-open]:bg-foreground/5"
          >
            {children}
          </button>
        }
      />
      <DropdownMenuContent className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onValueChange(String(v))}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * O pill do prazo. O valor é `flex: 0 1 auto` e o pill não tem largura 100%:
 * com largura cheia, uma coluna estreita cortava "Hoje" em "Hoj" mesmo com
 * espaço sobrando, porque o texto encolhia junto com a célula.
 */
const dueStateClass: Record<TaskTableDueState, string> = {
  overdue: "bg-tone-red text-tone-red-foreground",
  today: "bg-tone-orange text-tone-orange-foreground",
  tomorrow: "bg-tone-yellow text-tone-yellow-foreground",
  week: "bg-muted text-foreground-strong",
  later: "text-muted-foreground",
  done: "text-muted-foreground line-through",
}

function DuePill({ due, state }: { due: string; state?: TaskTableDueState }) {
  const Icone = state === "overdue" ? WarningCircleIcon : CalendarBlankIcon
  return (
    <span
      data-state={state}
      className={cn(
        "inline-flex h-[22px] max-w-full items-center gap-[5px] rounded-sm pr-[7px] pl-1.5 text-[12px] font-medium whitespace-nowrap tabular-nums",
        dueStateClass[state ?? "later"]
      )}
    >
      <Icone size={13} className="shrink-0" aria-hidden />
      <span className="min-w-0 flex-[0_1_auto] truncate">{due}</span>
    </span>
  )
}

const projectDotClass: Record<TaskTableTone, string> = {
  gray: "bg-tone-gray-dot",
  blue: "bg-tone-blue-dot",
  cyan: "bg-tone-cyan-dot",
  green: "bg-tone-green-dot",
  yellow: "bg-tone-yellow-dot",
  orange: "bg-tone-orange-dot",
  red: "bg-tone-red-dot",
  pink: "bg-tone-pink-dot",
  purple: "bg-tone-purple-dot",
}

/**
 * As três faixas do modo agrupado: off-white → card → azul suave, contando
 * só as fileiras de cada grupo. No lugar do degrau por profundidade, porque
 * com grupos a árvore já se lê pelo recuo e pelo fio, e o revezamento é o que
 * guia o olho numa fileira longa sem régua.
 */
const stripeBgClass = [
  "bg-[color-mix(in_oklab,var(--background),var(--muted))]",
  "bg-card",
  "bg-[color-mix(in_oklab,var(--card)_50%,var(--primary-subtle))]",
] as const
const stripeSelectedClass =
  "bg-[color-mix(in_oklab,var(--primary-subtle)_88%,var(--primary)_12%)]"

/**
 * O tingimento da fileira é a ÚNICA coisa que separa uma linha da outra —
 * a tabela não tem régua entre fileiras, de propósito.
 *
 * As três misturas partem todas do CARD, que é a superfície da tabela.
 * A de profundidade 0 partia de `--background`, e quando a página desceu na
 * rampa a fileira desceu junto: as tasks de topo ficaram na mesma cor do
 * papel atrás da tabela, que passou a não ter superfície. Amarrado ao card,
 * o degrau interno não depende de onde a página está.
 *
 * E a ordem passou a ser monótona. Era 0,962 → 0,993 → 0,982 do topo para o
 * fundo da árvore: subia e voltava, então a cor não dizia profundidade
 * nenhuma. Agora cada nível se aproxima do card, e o mais fundo É o card. A
 * direção do brilho troca entre os temas porque no escuro o card é mais
 * escuro que o muted, mas a regra é a mesma: mais fundo, mais perto do card.
 */
function getRowBgClass(task: TaskTableTask): string {
  if (task.selected)
    return "bg-[color-mix(in_oklab,var(--accent)_22%,var(--card))]"
  if (task.depth === 0)
    return "bg-[color-mix(in_oklab,var(--muted)_60%,var(--card))]"
  if (task.depth === 1)
    return "bg-[color-mix(in_oklab,var(--muted)_25%,var(--card))]"
  return "bg-card"
}

const hoverBgClass =
  "group-hover/row:bg-[color-mix(in_oklab,var(--primary)_5%,var(--card))]"

export interface TaskTableRowProps {
  task: TaskTableTask
  hidden?: boolean
  collapsed?: boolean
  hasChildren?: boolean
  onToggleCollapse?: (groupId: string) => void
  checked?: boolean
  onCheckedChange?: (next: boolean) => void
  onToggleDone?: (taskId: string, done: boolean) => void
  onSelect?: (taskId: string) => void
  onAddSubtask?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  onUnblock?: (taskId: string) => void
  onMore?: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onCancel?: (taskId: string) => void
  renderRowMenu?: (taskId: string) => React.ReactNode
  showOwnerColumn?: boolean
  /** Coluna Projeto (sem projeto, "Pessoal"). Default: false. */
  showProjectColumn?: boolean
  /**
   * Faixa da fileira no modo agrupado (0, 1, 2). Sem ela, vale o degrau por
   * profundidade de antes.
   */
  stripe?: 0 | 1 | 2
  /** Grupo ou subtarefas abrindo ("in") ou fechando ("out"): a fileira entra e sai desfocada. */
  motion?: "in" | "out"
  /** Ordem das colunas que andam. Default: a de sempre. */
  columns?: TaskTableColumnId[]
  /** Liga os pickers de Status, Prioridade e (com `people`) Responsável. */
  onChange?: (taskId: string, patch: TaskTablePatch) => void
  people?: TaskTableOwner[]
  /** Ações presas na ponta direita (RowActions) — substituem os botões antigos. */
  rowActions?: RowAction[]
}

export function TaskTableRow({
  task,
  hidden,
  collapsed,
  hasChildren,
  onToggleCollapse,
  checked,
  onCheckedChange,
  onToggleDone,
  onSelect,
  onAddSubtask,
  onEdit,
  onUnblock,
  onMore,
  onComplete,
  onCancel,
  renderRowMenu,
  showOwnerColumn = true,
  showProjectColumn = false,
  stripe,
  motion,
  columns,
  onChange,
  people,
  rowActions,
}: TaskTableRowProps) {
  const t = useTranslate()

  // Modo done: checkbox representa conclusão; ignora seleção.
  const isDoneMode = Boolean(onToggleDone)
  const doneChecked = isDoneMode ? task.status === "done" : Boolean(checked)

  const isParent = task.depth === 0
  const isSub = !isParent
  const isLastChild = Boolean(task.lastChild)

  const indentPx = task.depth === 1 ? 22 : task.depth === 2 ? 44 : 0
  const connectorLeft = task.depth === 2 ? 50 : 28

  const titleClass = cn(
    "min-w-0 truncate",
    isParent ? "font-medium" : "font-normal",
    (isSub && task.status === "done") || task.cancelled
      ? "text-muted-foreground line-through decoration-muted-foreground/50"
      : null
  )

  const isStriped = stripe !== undefined
  const tdBgClass = isStriped
    ? checked || task.selected
      ? stripeSelectedClass
      : stripeBgClass[stripe]
    : getRowBgClass(task)
  const cellClass = cn(
    "relative",
    tdBgClass,
    isStriped ? "group-hover/row:bg-muted" : hoverBgClass,
    "transition-colors"
  )

  const cells: Record<TaskTableColumnId, React.ReactNode> = {
    owner: (
      <td key="owner" className={cn(cellClass, "px-2.5 py-[10px]")}>
        {onChange && people ? (
          <CellPicker
            label={t("task_table.column.owner")}
            value={task.owner ? (task.owner.name ?? task.owner.initials) : ""}
            options={[
              { value: "", label: t("task_table.group.no_owner") },
              ...people.map((p) => ({
                value: p.name ?? p.initials,
                label: (
                  <span className="inline-flex items-center gap-2">
                    <OwnerAvatar owner={p} />
                    {p.name ?? p.initials}
                  </span>
                ),
              })),
            ]}
            onValueChange={(v) =>
              onChange(task.id, {
                owner: people.find((p) => (p.name ?? p.initials) === v),
              })
            }
          >
            {task.owner ? (
              <OwnerAvatar owner={task.owner} />
            ) : (
              <span className="inline-flex size-[22px] rounded-full border border-dashed border-muted-foreground/40" />
            )}
          </CellPicker>
        ) : (
          task.owner && <OwnerAvatar owner={task.owner} />
        )}
      </td>
    ),
    status: (
      <td key="status" className={cn(cellClass, "px-2.5 py-[10px]")}>
        {onChange ? (
          <CellPicker
            label={t("task_table.column.status")}
            value={task.status}
            options={STATUSES.map((st) => ({
              value: st,
              label: <StatusView status={st} />,
            }))}
            onValueChange={(v) =>
              onChange(task.id, { status: v as TaskTableStatus })
            }
          >
            <StatusView status={task.status} />
          </CellPicker>
        ) : (
          <StatusView status={task.status} />
        )}
      </td>
    ),
    project: (
      <td key="project" className={cn(cellClass, "px-2.5 py-[10px] text-[12.5px]")}>
        {task.project ? (
          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                projectDotClass[task.project.tone ?? "gray"]
              )}
            />
            <span className="truncate">{task.project.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/60">
            {t("task_table.project_personal")}
          </span>
        )}
      </td>
    ),
    priority: (
      <td key="priority" className={cn(cellClass, "px-2.5 py-[10px]")}>
        {onChange ? (
          <CellPicker
            label={t("task_table.column.priority")}
            value={task.priority ?? "none"}
            options={PRIORITIES.map((pr) => ({
              value: pr,
              label:
                pr === "none" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <PriorityCell priority="none" />
                    {t("task_table.priority_empty")}
                  </span>
                ) : (
                  <PriorityCell priority={pr} />
                ),
            }))}
            onValueChange={(v) =>
              onChange(task.id, { priority: v as TaskTablePriority })
            }
          >
            <PriorityCell priority={task.priority ?? "none"} />
          </CellPicker>
        ) : (
          <PriorityCell priority={task.priority ?? "none"} />
        )}
      </td>
    ),
    subtasks: (
      <td key="subtasks" className={cn(cellClass, "px-2.5 py-[10px]")}>
        {task.depth === 0 && task.progress ? (
          <ProgressCell done={task.progress.done} total={task.progress.total} />
        ) : null}
      </td>
    ),
    due: (
      <td key="due" className={cn(cellClass, "px-2.5 py-[10px] whitespace-nowrap")}>
        {task.due ? <DuePill due={task.due} state={task.dueState} /> : null}
      </td>
    ),
  }

  return (
    <tr
      data-id={task.id}
      data-depth={task.depth}
      data-parent={task.parentId}
      data-st={stripe}
      onClick={onSelect ? () => onSelect(task.id) : undefined}
      className={cn(
        "group/row",
        hidden && "hidden",
        motion === "in" && "muriki-tt-in",
        motion === "out" && "muriki-tt-out",
        onSelect && "cursor-pointer"
      )}
    >
      <td
        className={cn(
          cellClass,
          "w-[22px] py-[10px] pl-3",
          isStriped &&
            (checked || task.selected) &&
            "shadow-[inset_3px_0_0_var(--primary)]"
        )}
      >
        {/* status rail */}
        <span
          aria-hidden
          className={cn(
            "absolute top-2.5 bottom-2.5 left-[3px] w-[3px] rounded-full transition-all",
            "group-hover/row:w-[5px]",
            statusRailClass[task.status]
          )}
        />
        <input
          type="checkbox"
          checked={doneChecked}
          onChange={(e) => {
            if (isDoneMode) {
              // Modo done: propaga intenção de conclusão/reabertura ao pai
              onToggleDone!(task.id, e.target.checked)
            } else {
              onCheckedChange?.(e.target.checked)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={
            isDoneMode
              ? doneChecked
                ? t("task_table.toggle_reopen")
                : t("task_table.toggle_done")
              : t("task_table.select_row")
          }
          className={cn(
            "size-[13px] cursor-pointer appearance-none rounded-[3px] border-[1.5px] border-muted-foreground/50 bg-transparent align-[-1px]",
            "checked:border-primary checked:bg-primary",
            "relative checked:after:absolute checked:after:top-[-0.5px] checked:after:left-[2.5px] checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-[1.6px] checked:after:border-t-0 checked:after:border-l-0 checked:after:border-white checked:after:content-['']"
          )}
        />
      </td>

      <td className={cn(cellClass, "px-2.5 py-[10px] text-[13.5px]")}>
        {/* connector lines for sub rows */}
        {isSub && (
          <>
            <span
              aria-hidden
              className={cn(
                "absolute top-0 w-px bg-muted-foreground/15",
                isLastChild ? "bottom-1/2" : "bottom-0"
              )}
              style={{ left: connectorLeft }}
            />
            <span
              aria-hidden
              className="absolute top-1/2 h-px w-[10px] bg-muted-foreground/15"
              style={{ left: connectorLeft }}
            />
          </>
        )}

        <div
          className="relative flex min-w-0 items-center gap-2"
          style={{ paddingLeft: indentPx }}
        >
          <span className="relative inline-flex shrink-0 items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (task.childGroupId) onToggleCollapse?.(task.childGroupId)
              }}
              aria-label={
                collapsed
                  ? t("task_table.expand_group")
                  : t("task_table.collapse_group")
              }
              tabIndex={hasChildren ? 0 : -1}
              className={cn(
                "inline-flex size-[18px] items-center justify-center rounded-sm text-muted-foreground transition-all",
                hasChildren
                  ? "hover:bg-muted hover:text-foreground"
                  : "pointer-events-none opacity-0",
                collapsed && "-rotate-90"
              )}
            >
              <CaretDown size={11} weight="bold" />
            </button>
            <span
              className={cn(
                "ml-1 inline-flex size-[18px] shrink-0 items-center justify-center rounded-sm",
                kindIconWrapperClass[task.kind]
              )}
            >
              <KindIcon kind={task.kind} status={task.status} />
            </span>
          </span>

          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {task.code}
          </span>
          <span className={titleClass}>{task.title}</span>
        </div>
      </td>

      {(columns ?? defaultColumns(showOwnerColumn, showProjectColumn)).map(
        (id) => cells[id]
      )}

      <td
        className={cn(
          cellClass,
          "w-0 py-[10px] pr-1 whitespace-nowrap",
          rowActions && "sticky right-0 z-[2] bg-transparent p-0 group-hover/row:bg-transparent"
        )}
      >
        {rowActions ? (
          // Presas na ponta direita da área visível, mesmo com a tabela
          // rolando para o lado; o vidro separa os ícones do texto embaixo.
          <span
            onClick={(e) => e.stopPropagation()}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:bg-card/85 group-hover/row:opacity-100 group-hover/row:shadow-xs group-hover/row:backdrop-blur-sm has-[[data-menu-open]]:opacity-100"
          >
            <RowActions actions={rowActions} alwaysVisible />
          </span>
        ) : (
        <div
          className={cn(
            "absolute top-0 right-1.5 bottom-0 flex items-center gap-0.5",
            "pointer-events-none translate-x-1.5 opacity-0 transition-all",
            "group-hover/row:pointer-events-auto group-hover/row:translate-x-0 group-hover/row:opacity-100",
            "group-focus-within/row:pointer-events-auto group-focus-within/row:translate-x-0 group-focus-within/row:opacity-100"
          )}
        >
          {task.status === "blocked" && onUnblock && (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onUnblock(task.id)
              }}
              label={t("task_table.row_action.unblock")}
            >
              <LockOpen size={14} weight="regular" />
            </RowActionButton>
          )}
          {onComplete && task.status !== "done" && (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onComplete(task.id)
              }}
              label={t("task_table.row_action.complete")}
              className="hover:text-success"
            >
              <Check size={14} weight="regular" />
            </RowActionButton>
          )}
          {onCancel && task.cancelled !== true && (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onCancel(task.id)
              }}
              label={t("task_table.row_action.cancel")}
              className="hover:text-destructive"
            >
              <X size={14} weight="regular" />
            </RowActionButton>
          )}
          {onAddSubtask && !isSub && (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onAddSubtask(task.id)
              }}
              label={t("task_table.row_action.add_subtask")}
            >
              <Plus size={14} weight="regular" />
            </RowActionButton>
          )}
          {onEdit && (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task.id)
              }}
              label={t("task_table.row_action.edit")}
            >
              <PencilSimple size={14} weight="regular" />
            </RowActionButton>
          )}
          {renderRowMenu ? (
            renderRowMenu(task.id)
          ) : onMore ? (
            <RowActionButton
              onClick={(e) => {
                e.stopPropagation()
                onMore(task.id)
              }}
              label={t("task_table.row_action.more")}
            >
              <DotsThree size={14} weight="regular" />
            </RowActionButton>
          ) : null}
        </div>
        )}
      </td>
    </tr>
  )
}

function RowActionButton({
  onClick,
  label,
  children,
  className,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-[26px] items-center justify-center rounded-md text-muted-foreground",
        "bg-card/80 shadow-xs backdrop-blur-sm",
        "transition-colors hover:bg-card hover:text-primary",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {children}
    </button>
  )
}
