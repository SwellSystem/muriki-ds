// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-table.html
// @used-by src/routes/_authenticated.$workspaceSlug.projects.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

import { TaskTableRow } from "./task-table-row"
import {
  TaskTableToolbar,
  type TaskTableToolbarFilter,
} from "./task-table-toolbar"
import type { TaskTableTask } from "./types"

export interface TaskTablePagination {
  page: number
  totalPages: number
  onPageChange?: (next: number) => void
}

export interface TaskTableSummary {
  selected: number
  tasks: number
  subtasks: number
}

export interface TaskTableProps {
  tasks: TaskTableTask[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: TaskTableToolbarFilter[]
  onFilterClick?: (key: string) => void
  onNewTask?: () => void
  newTaskLabel?: string
  checkedTaskIds?: Set<string> | string[]
  onCheckedChange?: (taskId: string, checked: boolean) => void
  onTaskSelect?: (taskId: string) => void
  onAddSubtask?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  onUnblock?: (taskId: string) => void
  onMore?: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onCancel?: (taskId: string) => void
  renderRowMenu?: (taskId: string) => React.ReactNode
  pagination?: TaskTablePagination
  summary?: TaskTableSummary
  showToolbar?: boolean
  showFooter?: boolean
  className?: string

  // ── Props novas (todas opcionais, fallback = comportamento atual) ──────────

  /**
   * Modo collapse controlado (focus view).
   * Quando `onToggleCollapse` é fornecido, o TaskTable entra em modo controlado:
   *   - NÃO filtra linhas internamente (o pai, via flattenVisibleTree, já manda
   *     somente as rows visíveis).
   *   - `collapsedGroups` é usado APENAS para o estado visual do caret (rotação).
   *   - Clique no caret chama `onToggleCollapse(childGroupId)`.
   * Quando ausente, o comportamento uncontrolled original é mantido intacto.
   */
  collapsedGroups?: Set<string>
  onToggleCollapse?: (groupId: string) => void

  /**
   * Slot de cabeçalho de grupo antes de uma row.
   * Retorne um React.ReactNode para renderizar um <tr> full-width (colSpan 8 com owner, 7 sem)
   * antes da row da task indicada. Sem a prop → nada muda.
   */
  renderGroupHeaderBefore?: (taskId: string) => React.ReactNode

  /**
   * Slot após uma row (ex.: input inline de subtask no focus).
   * Retorne um React.ReactNode para renderizar um <tr> full-width após a row.
   * Sem a prop → nada muda.
   */
  renderAfterRow?: (taskId: string) => React.ReactNode

  /**
   * Modo conclusão (todo-list do focus).
   * Quando fornecido:
   *   - O checkbox da row representa CONCLUSÃO (checked = status "done").
   *   - Clique chama onToggleDone(id, !done) — não dispara onCheckedChange.
   *   - O checkbox "select-all" do header é OCULTADO (seleção em massa não se
   *     aplica ao todo-list pessoal).
   * Quando ausente, o checkbox mantém semântica de SELEÇÃO (comportamento atual).
   */
  onToggleDone?: (taskId: string, done: boolean) => void

  trailingRows?: { id: string; content: React.ReactNode }[]
  /**
   * Oculta a coluna Responsável. Default: true (visível).
   * Focus pessoal passa false — sem owners multi-usuário.
   */
  showOwnerColumn?: boolean
}

function buildHasChildrenMap(tasks: TaskTableTask[]): Set<string> {
  const set = new Set<string>()
  for (const task of tasks) {
    if (task.parentId) set.add(task.parentId)
  }
  return set
}

export function TaskTable({
  tasks,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterClick,
  onNewTask,
  newTaskLabel,
  checkedTaskIds,
  onCheckedChange,
  onTaskSelect,
  onAddSubtask,
  onEdit,
  onUnblock,
  onMore,
  onComplete,
  onCancel,
  renderRowMenu,
  pagination,
  summary,
  showToolbar = true,
  showFooter = true,
  className,
  collapsedGroups: controlledCollapsedGroups,
  onToggleCollapse: controlledOnToggleCollapse,
  renderGroupHeaderBefore,
  renderAfterRow,
  onToggleDone,
  trailingRows,
  showOwnerColumn = true,
}: TaskTableProps) {
  const t = useTranslate()

  // Modo controlado: pai gerencia collapse (ex.: focus view com flattenVisibleTree)
  const isControlledCollapse = Boolean(controlledOnToggleCollapse)

  const checkedSet = React.useMemo(() => {
    if (!checkedTaskIds) return new Set<string>()
    if (checkedTaskIds instanceof Set) return checkedTaskIds
    return new Set(checkedTaskIds)
  }, [checkedTaskIds])

  // Estado interno de collapse — usado APENAS no modo uncontrolled (sem onToggleCollapse).
  const [uncontrolledCollapsedGroups, setUncontrolledCollapsedGroups] =
    React.useState<Set<string>>(() => {
      const initial = new Set<string>()
      for (const task of tasks) {
        if (task.defaultCollapsed && task.childGroupId) {
          initial.add(task.childGroupId)
        }
      }
      return initial
    })

  // O conjunto ativo de collapsed groups depende do modo.
  const collapsedGroups = isControlledCollapse
    ? (controlledCollapsedGroups ?? new Set<string>())
    : uncontrolledCollapsedGroups

  const hasChildrenSet = React.useMemo(
    () => buildHasChildrenMap(tasks),
    [tasks]
  )

  const handleToggleCollapse = React.useCallback(
    (groupId: string) => {
      if (isControlledCollapse) {
        // Modo controlado: delega ao pai; não toca no estado interno.
        controlledOnToggleCollapse!(groupId)
      } else {
        // Modo uncontrolled: gerencia internamente.
        setUncontrolledCollapsedGroups((prev) => {
          const next = new Set(prev)
          if (next.has(groupId)) {
            next.delete(groupId)
          } else {
            next.add(groupId)
          }
          return next
        })
      }
    },
    [isControlledCollapse, controlledOnToggleCollapse]
  )

  // Modo uncontrolled: filtra as rows ocultas por collapse interno.
  // Modo controlado: NÃO filtra — o pai já mandou somente as rows visíveis.
  const hiddenSet = React.useMemo(() => {
    if (isControlledCollapse) return new Set<string>()
    const taskById = new Map(tasks.map((t) => [t.id, t]))
    const hidden = new Set<string>()
    for (const task of tasks) {
      let cursor = task.parentId
      while (cursor) {
        const parentTask = taskById.get(cursor)
        if (
          parentTask?.childGroupId &&
          uncontrolledCollapsedGroups.has(parentTask.childGroupId)
        ) {
          hidden.add(task.id)
          break
        }
        cursor = parentTask?.parentId
      }
    }
    return hidden
  }, [tasks, isControlledCollapse, uncontrolledCollapsedGroups])

  const visibleTasks = React.useMemo(
    () => tasks.filter((task) => !hiddenSet.has(task.id)),
    [tasks, hiddenSet]
  )

  // Modo done: seleção em massa não se aplica — header checkbox é ocultado.
  const isDoneMode = Boolean(onToggleDone)

  const allChecked =
    !isDoneMode &&
    visibleTasks.length > 0 &&
    visibleTasks.every((task) => checkedSet.has(task.id))
  const someChecked =
    !isDoneMode &&
    !allChecked &&
    visibleTasks.some((task) => checkedSet.has(task.id))

  const headerCheckboxRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someChecked
    }
  }, [someChecked])

  const handleSelectAll = React.useCallback(() => {
    if (!onCheckedChange) return
    const next = !allChecked
    for (const task of visibleTasks) {
      onCheckedChange(task.id, next)
    }
  }, [allChecked, onCheckedChange, visibleTasks])

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {showToolbar && (
        <TaskTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          onFilterClick={onFilterClick}
          onNewTask={onNewTask}
          newTaskLabel={newTaskLabel}
        />
      )}

      <div className="relative w-full overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-[22px] border-b border-border px-2.5 py-2 pl-3 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {/* No modo done (onToggleDone presente), seleção em massa não se aplica */}
                {!isDoneMode && (
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    aria-label={t("task_table.select_all")}
                    checked={allChecked}
                    onChange={handleSelectAll}
                    disabled={!onCheckedChange || visibleTasks.length === 0}
                    className={cn(
                      "size-[13px] cursor-pointer appearance-none rounded-[3px] border-[1.5px] border-muted-foreground/50 bg-transparent align-[-1px]",
                      "checked:border-primary checked:bg-primary",
                      "indeterminate:border-primary indeterminate:bg-primary/50",
                      "relative checked:after:absolute checked:after:top-[-0.5px] checked:after:left-[2.5px] checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-[1.6px] checked:after:border-t-0 checked:after:border-l-0 checked:after:border-white checked:after:content-['']",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  />
                )}
              </th>
              <th
                scope="col"
                className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.task")}
              </th>
              {showOwnerColumn && (
                <th
                  scope="col"
                  className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
                >
                  {t("task_table.column.owner")}
                </th>
              )}
              <th
                scope="col"
                className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.status")}
              </th>
              <th
                scope="col"
                className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.priority")}
              </th>
              <th
                scope="col"
                className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.subtasks")}
              </th>
              <th
                scope="col"
                className="border-b border-border px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.due")}
              </th>
              <th
                scope="col"
                className="w-0 border-b border-border px-1 py-2"
              />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const COL_SPAN = showOwnerColumn ? 8 : 7
              const groupHeader = renderGroupHeaderBefore?.(task.id)
              const afterRow = renderAfterRow?.(task.id)

              return (
                <React.Fragment key={task.id}>
                  {groupHeader != null && (
                    <tr>
                      <td colSpan={COL_SPAN}>{groupHeader}</td>
                    </tr>
                  )}
                  <TaskTableRow
                    task={task}
                    hidden={hiddenSet.has(task.id)}
                    collapsed={
                      task.childGroupId
                        ? collapsedGroups.has(task.childGroupId)
                        : false
                    }
                    hasChildren={
                      task.childGroupId
                        ? isControlledCollapse || hasChildrenSet.has(task.id)
                        : false
                    }
                    onToggleCollapse={handleToggleCollapse}
                    checked={checkedSet.has(task.id)}
                    onCheckedChange={
                      onCheckedChange
                        ? (next) => onCheckedChange(task.id, next)
                        : undefined
                    }
                    onToggleDone={onToggleDone}
                    onSelect={onTaskSelect}
                    onAddSubtask={onAddSubtask}
                    onEdit={onEdit}
                    onUnblock={onUnblock}
                    onMore={onMore}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    renderRowMenu={renderRowMenu}
                    showOwnerColumn={showOwnerColumn}
                  />
                  {afterRow != null && (
                    <tr>
                      <td colSpan={COL_SPAN}>{afterRow}</td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {trailingRows?.map((row) => (
              <tr key={row.id}>
                <td colSpan={showOwnerColumn ? 8 : 7}>{row.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFooter && (summary || pagination) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11.5px] text-muted-foreground">
          {summary && (
            <span>
              {t("task_table.summary", {
                count: summary.selected,
                tasks: summary.tasks,
                subtasks: summary.subtasks,
              })}
            </span>
          )}
          {pagination && (
            <div className="ml-auto inline-flex items-center gap-[3px]">
              <button
                type="button"
                aria-label={t("task_table.pagination_previous")}
                disabled={pagination.page <= 1}
                onClick={() =>
                  pagination.onPageChange?.(Math.max(1, pagination.page - 1))
                }
                className={cn(
                  "inline-flex size-[22px] items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                )}
              >
                <CaretLeft size={12} weight="regular" />
              </button>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => pagination.onPageChange?.(page)}
                  aria-current={page === pagination.page ? "page" : undefined}
                  className={cn(
                    "inline-flex size-[22px] items-center justify-center rounded-sm text-[11.5px] transition-colors",
                    page === pagination.page
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                aria-label={t("task_table.pagination_next")}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  pagination.onPageChange?.(
                    Math.min(pagination.totalPages, pagination.page + 1)
                  )
                }
                className={cn(
                  "inline-flex size-[22px] items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                )}
              >
                <CaretRight size={12} weight="regular" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
