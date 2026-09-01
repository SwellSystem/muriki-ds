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

import { cn } from "@/lib/utils"

import type {
  TaskTableAvatarTone,
  TaskTableKind,
  TaskTablePriority,
  TaskTableStatus,
  TaskTableTask,
} from "./types"

const avatarToneClass: Record<TaskTableAvatarTone, string> = {
  a1: "bg-primary/14 text-primary",
  a2: "bg-[color-mix(in_oklch,var(--chart-3)_14%,var(--card))] text-[var(--chart-3)]",
  a3: "bg-[color-mix(in_oklch,var(--chart-1)_24%,var(--card))] text-[oklch(0.42_0.1_70)]",
  a4: "bg-muted text-muted-foreground",
}

const statusRailClass: Record<TaskTableStatus, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-[color-mix(in_oklch,var(--muted-foreground)_40%,transparent)]",
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
  epic: "bg-[color-mix(in_oklch,var(--chart-3)_14%,transparent)] text-[var(--chart-3)]",
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

  if (priority === "none") {
    return (
      <span className="text-muted-foreground">
        {t("task_table.priority.none")}
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

function getRowBgClass(task: TaskTableTask): string {
  if (task.selected)
    return "bg-[color-mix(in_oklch,var(--accent)_22%,var(--card))]"
  if (task.depth === 0)
    return "bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))]"
  if (task.depth === 2)
    return "bg-[color-mix(in_oklch,var(--muted)_30%,var(--card))]"
  return "bg-card"
}

const hoverBgClass =
  "group-hover/row:bg-[color-mix(in_oklch,var(--primary)_5%,var(--card))]"

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

  const tdBgClass = getRowBgClass(task)
  const cellClass = cn("relative", tdBgClass, hoverBgClass, "transition-colors")

  return (
    <tr
      data-id={task.id}
      data-depth={task.depth}
      data-parent={task.parentId}
      onClick={onSelect ? () => onSelect(task.id) : undefined}
      className={cn(
        "group/row",
        hidden && "hidden",
        onSelect && "cursor-pointer"
      )}
    >
      <td className={cn(cellClass, "w-[22px] py-[10px] pl-3")}>
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

      {showOwnerColumn && (
        <td className={cn(cellClass, "px-2.5 py-[10px]")}>
          {task.owner && (
            <span
              title={task.owner.name}
              aria-label={task.owner.name}
              className={cn(
                "inline-flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold",
                avatarToneClass[task.owner.tone ?? "a4"]
              )}
            >
              {task.owner.initials}
            </span>
          )}
        </td>
      )}

      <td className={cn(cellClass, "px-2.5 py-[10px]")}>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
            statusTextClass[task.status]
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-[7px] shrink-0 rounded-full",
              statusDotClass[task.status],
              "shadow-[0_0_0_3px_color-mix(in_oklch,currentColor_15%,transparent)]"
            )}
          />
          {t(`task_table.status.${task.status}`)}
        </span>
      </td>

      <td className={cn(cellClass, "px-2.5 py-[10px]")}>
        <PriorityCell priority={task.priority ?? "none"} />
      </td>

      <td className={cn(cellClass, "px-2.5 py-[10px]")}>
        {task.depth === 0 && task.progress ? (
          <ProgressCell done={task.progress.done} total={task.progress.total} />
        ) : null}
      </td>

      <td
        className={cn(
          cellClass,
          "px-2.5 py-[10px] font-mono text-[12px] text-muted-foreground"
        )}
      >
        {task.due}
      </td>

      <td className={cn(cellClass, "w-0 py-[10px] pr-1 whitespace-nowrap")}>
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
