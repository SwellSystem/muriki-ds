"use client"

// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-table.html
// @used-by src/routes/_authenticated.$workspaceSlug.projects.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  flattenTasks,
  groupTasks,
  TASK_TABLE_EMPTY_GROUP,
  type TaskTableGroup,
} from "./task-table-groups"

import { TaskTableRow } from "./task-table-row"
import {
  TaskTableToolbar,
  type TaskTableToolbarFilter,
} from "./task-table-toolbar"
import type { TaskTableGroupBy, TaskTableTask } from "./types"

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
  /** Coluna Projeto. Subtarefas herdam o projeto da mãe. Default: false. */
  showProjectColumn?: boolean

  /**
   * Agrupa as tarefas-raiz (a subtarefa vai junto com a mãe). Com a prop,
   * inclusive "none", a tabela vira a do DS: preenche o pai (dê altura a ele)
   * e rola sozinha, com o cabeçalho de colunas preso no topo, as fileiras em
   * três faixas por grupo e as faixas de grupo presas logo abaixo, empilhando
   * ao rolar ("+N grupos acima" quando passam de ~28% da altura).
   * Sem a prop, nada muda.
   */
  groupBy?: TaskTableGroupBy
}

/** Alturas do cabeçalho de colunas e da faixa de grupo: a pilha soma as duas. */
const HEAD_H = 36
const GROUP_H = 36

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  )
}

const groupDotClass: Record<string, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-muted-foreground/60",
}

function buildHasChildrenMap(tasks: TaskTableTask[]): Set<string> {
  const set = new Set<string>()
  for (const task of tasks) {
    if (task.parentId) set.add(task.parentId)
  }
  return set
}

export function TaskTable({
  tasks: tasksIn,
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
  showProjectColumn = false,
  groupBy,
}: TaskTableProps) {
  const t = useTranslate()
  // `children` vira fileira embaixo da mãe; a subtarefa herda o projeto.
  const tasks = React.useMemo(() => flattenTasks(tasksIn), [tasksIn])
  const isOwnLayout = groupBy !== undefined
  const COL_SPAN =
    7 + (showOwnerColumn ? 1 : 0) + (showProjectColumn ? 1 : 0)

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

  // Accordion: abrir = as fileiras chegam desfocadas; fechar = desfocam e
  // só então somem. Chave "g:<grupo>" ou "c:<childGroupId>".
  const [motion, setMotion] = React.useState<Record<string, "in" | "out">>({})
  const accToggle = React.useCallback(
    (key: string, isOpen: boolean, apply: () => void) => {
      if (prefersReducedMotion()) return apply()
      const limpar = () =>
        setMotion((m) => {
          const next = { ...m }
          delete next[key]
          return next
        })
      if (isOpen) {
        setMotion((m) => ({ ...m, [key]: "out" }))
        window.setTimeout(() => {
          apply()
          limpar()
        }, 300)
      } else {
        apply()
        setMotion((m) => ({ ...m, [key]: "in" }))
        window.setTimeout(limpar, 460)
      }
    },
    []
  )

  const handleToggleCollapse = React.useCallback(
    (groupId: string) => {
      if (isControlledCollapse) {
        // Modo controlado: delega ao pai; não toca no estado interno.
        controlledOnToggleCollapse!(groupId)
      } else {
        // Modo uncontrolled: gerencia internamente.
        accToggle(
          "c:" + groupId,
          !uncontrolledCollapsedGroups.has(groupId),
          () =>
            setUncontrolledCollapsedGroups((prev) => {
              const next = new Set(prev)
              if (next.has(groupId)) {
                next.delete(groupId)
              } else {
                next.add(groupId)
              }
              return next
            })
        )
      }
    },
    [
      isControlledCollapse,
      controlledOnToggleCollapse,
      accToggle,
      uncontrolledCollapsedGroups,
    ]
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

  // ── Grupos (só com `groupBy`) ─────────────────────────────────────────────
  const isGrouped = groupBy !== undefined && groupBy !== "none"
  const groups = React.useMemo<TaskTableGroup[]>(
    () => (groupBy ? groupTasks(tasks, groupBy) : []),
    [tasks, groupBy]
  )
  const [closed, setClosed] = React.useState<Set<string>>(() => new Set())
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const groupLabel = (g: TaskTableGroup): string => {
    const empty = g.key === TASK_TABLE_EMPTY_GROUP
    switch (groupBy) {
      case "status":
        return t(`task_table.status.${g.key}`)
      case "priority":
        return g.key === "none"
          ? t("task_table.priority_empty")
          : t(`task_table.priority.${g.key}`)
      case "project":
        return empty
          ? t("task_table.project_personal")
          : (g.root.project?.name ?? g.key)
      case "assignee":
        return empty ? t("task_table.group.no_owner") : g.key
      default:
        return ""
    }
  }

  // Pilha das faixas presas: as que já passaram do topo ficam empilhadas sob
  // o cabeçalho, até ~28% da altura visível; dali em diante as mais antigas
  // viram uma faixa só, "+N grupos acima", com menu para pular.
  const [stack, setStack] = React.useState<{ passed: string[]; max: number }>({
    passed: [],
    max: 3,
  })
  const measure = React.useCallback(() => {
    const sc = scrollRef.current
    if (!sc || !isGrouped) return
    const top = sc.getBoundingClientRect().top
    const max = Math.max(2, Math.floor((sc.clientHeight * 0.28) / GROUP_H))
    const passed = Array.from(
      sc.querySelectorAll<HTMLElement>("tbody[data-gkey]")
    )
      .filter(
        (b, i) =>
          b.getBoundingClientRect().top - top <= HEAD_H + i * GROUP_H + 1
      )
      .map((b) => b.dataset.gkey ?? "")
    setStack((x) =>
      x.max === max && x.passed.join() === passed.join() ? x : { passed, max }
    )
  }, [isGrouped])
  React.useEffect(measure)

  // A faixa do grupo fica parada ao rolar para o lado: largura = área visível.
  React.useEffect(() => {
    const sc = scrollRef.current
    if (!sc || !isOwnLayout || typeof ResizeObserver === "undefined") return
    const put = () => sc.style.setProperty("--vw", sc.clientWidth + "px")
    const ro = new ResizeObserver(put)
    ro.observe(sc)
    put()
    return () => ro.disconnect()
  }, [isOwnLayout])

  const goToGroup = (key: string) => {
    const sc = scrollRef.current
    if (!sc) return
    const bodies = Array.from(
      sc.querySelectorAll<HTMLElement>("tbody[data-gkey]")
    )
    const i = bodies.findIndex((b) => b.dataset.gkey === key)
    if (i < 0) return
    sc.scrollTo({
      top:
        bodies[i].getBoundingClientRect().top -
        sc.getBoundingClientRect().top +
        sc.scrollTop -
        (HEAD_H + i * GROUP_H),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }

  const overflow =
    stack.passed.length > stack.max ? stack.passed.length - stack.max + 1 : 0
  const stackOffset = overflow ? overflow - 1 : 0

  const taskById = React.useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks]
  )

  const renderRow = (
    task: TaskTableTask,
    stripe?: 0 | 1 | 2,
    groupMotion?: "in" | "out"
  ) => {
    const groupHeader = renderGroupHeaderBefore?.(task.id)
    const afterRow = renderAfterRow?.(task.id)
    const parentGroup = task.parentId
      ? taskById.get(task.parentId)?.childGroupId
      : undefined
    const rowMotion =
      groupMotion ?? (parentGroup ? motion["c:" + parentGroup] : undefined)

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
            task.childGroupId ? collapsedGroups.has(task.childGroupId) : false
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
          showProjectColumn={showProjectColumn}
          stripe={stripe}
          motion={rowMotion}
        />
        {afterRow != null && (
          <tr>
            <td colSpan={COL_SPAN}>{afterRow}</td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  const renderGroupHead = (g: TaskTableGroup, gi: number) => {
    const label = groupLabel(g)
    const isClosed = closed.has(g.key)
    const stuck = stack.passed.includes(g.key)
    const toggle = () =>
      accToggle("g:" + g.key, !isClosed, () =>
        setClosed((c) => {
          const next = new Set(c)
          if (next.has(g.key)) next.delete(g.key)
          else next.add(g.key)
          return next
        })
      )
    const total = g.rows.length
    const done = g.rows.filter((r) => r.status === "done").length
    const late = g.rows.filter(
      (r) => r.dueState === "overdue" && r.status !== "done"
    ).length
    const roots = g.rows.filter(
      (r) => !r.parentId || !taskById.has(r.parentId)
    ).length

    let icon: React.ReactNode = null
    if (groupBy === "status")
      icon = (
        <span className={cn("size-[7px] rounded-full", groupDotClass[g.key])} />
      )
    else if (groupBy === "project" && g.root.project)
      icon = (
        <span
          className="size-2 rounded-full"
          style={{
            background: `var(--tone-${g.root.project.tone ?? "gray"}-dot)`,
          }}
        />
      )
    else if (groupBy === "assignee" && g.root.owner)
      icon = (
        <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
          {g.root.owner.initials}
        </span>
      )

    return (
      <tr>
        <th
          colSpan={COL_SPAN}
          scope="rowgroup"
          style={{ top: HEAD_H + Math.max(0, gi - stackOffset) * GROUP_H }}
          className="sticky z-[3] h-9 bg-muted p-0 text-left font-normal shadow-[inset_0_-1px_0_var(--divider)]"
        >
          <span className="sticky left-0 box-border flex h-9 w-[var(--vw,100%)] items-center gap-0.5 px-3.5">
            <button
              type="button"
              aria-expanded={!isClosed}
              aria-label={`${t(isClosed ? "task_table.expand_group" : "task_table.collapse_group")}: ${label}`}
              onClick={toggle}
              className="inline-flex h-7 w-[22px] shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground-strong focus-visible:outline-2 focus-visible:outline-ring"
            >
              <CaretDownIcon
                size={14}
                className={cn(
                  "transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
                  isClosed && "-rotate-90"
                )}
              />
            </button>
            <button
              type="button"
              data-stuck={stuck || undefined}
              title={
                stuck ? t("task_table.group.go_to_start", { group: label }) : undefined
              }
              onClick={() => (stuck ? goToGroup(g.key) : toggle())}
              className="inline-flex h-7 min-w-0 items-center gap-[7px] rounded-[7px] pr-2 pl-1 text-[13.5px] font-semibold text-foreground-strong hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring data-[stuck]:hover:underline data-[stuck]:hover:underline-offset-3"
            >
              {icon && (
                <span className="inline-flex w-4 shrink-0 justify-center">
                  {icon}
                </span>
              )}
              <span className="truncate">{label}</span>
              <span className="font-normal text-muted-foreground">{roots}</span>
            </button>
            <span className="ml-auto inline-flex items-center gap-2.5 pl-4 text-[12.5px] whitespace-nowrap text-muted-foreground tabular-nums">
              {late > 0 && (
                <span className="font-medium text-destructive">
                  {t("task_table.group.late", { count: late })}
                </span>
              )}
              <span>{t("task_table.group.progress", { done, total })}</span>
              <span
                aria-hidden
                className="hidden h-1 w-14 overflow-hidden rounded bg-foreground/10 sm:block"
              >
                <span
                  className="block h-full rounded bg-success transition-[width] duration-500"
                  style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                />
              </span>
            </span>
          </span>
        </th>
      </tr>
    )
  }

  /** Revezamento das 3 faixas, contando só as fileiras visíveis do grupo. */
  const renderStriped = (rows: TaskTableTask[], groupMotion?: "in" | "out") => {
    let i = 0
    return rows.map((task) => {
      const stripe = hiddenSet.has(task.id)
        ? undefined
        : ((i++ % 3) as 0 | 1 | 2)
      return renderRow(task, stripe ?? 1, groupMotion)
    })
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        isOwnLayout && "h-full min-h-0",
        className
      )}
    >
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

      <div
        ref={scrollRef}
        onScroll={isGrouped ? measure : undefined}
        className={cn(
          "relative w-full",
          isOwnLayout
            ? "muriki-scroll min-h-0 flex-1 overflow-auto"
            : "overflow-x-auto"
        )}
      >
        {overflow > 0 && (
          <div className="sticky top-9 left-0 z-[5] h-0 w-[var(--vw,100%)]">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="muriki-tt-swap relative flex h-9 w-full items-center gap-2 bg-[color-mix(in_oklab,var(--muted),var(--foreground)_5%)] px-4 text-[12.5px] text-muted-foreground shadow-[inset_0_-1px_0_var(--divider)] hover:text-foreground-strong focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <CaretUpIcon size={13} />
                    {t("task_table.group.above", { count: overflow })}
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{t("task_table.group.jump")}</DropdownMenuLabel>
                {stack.passed.slice(0, overflow).map((key) => {
                  const g = groups.find((x) => x.key === key)
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => window.setTimeout(() => goToGroup(key), 60)}
                    >
                      {g ? groupLabel(g) : key}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <table
          className={cn(
            "w-full min-w-[680px]",
            isOwnLayout
              ? "border-separate border-spacing-0 [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-[4] [&_thead_th]:h-9 [&_thead_th]:bg-card"
              : "border-collapse"
          )}
        >
          {/* O cabeçalho separa por SUPERFÍCIE, não por linha. Ele tinha um
              `border-b` em `--border` em cada célula — nove linhas desenhadas
              lado a lado para formar uma só, e com o filete recuado na rampa
              nova ela ficou a 0,45 de brilho da página, ou seja, invisível.
              Agora é uma faixa um degrau abaixo da fileira mais escura da
              tabela: o cabeçalho é o topo da superfície, não um rótulo com
              um traço embaixo. */}
          <thead className="[&_th]:bg-[color-mix(in_oklab,var(--muted)_85%,var(--card))]">
            <tr>
              <th
                scope="col"
                className="w-[22px] px-2.5 py-2 pl-3 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
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
                className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.task")}
              </th>
              {showOwnerColumn && (
                <th
                  scope="col"
                  className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
                >
                  {t("task_table.column.owner")}
                </th>
              )}
              <th
                scope="col"
                className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.status")}
              </th>
              {showProjectColumn && (
                <th
                  scope="col"
                  className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
                >
                  {t("task_table.column.project")}
                </th>
              )}
              <th
                scope="col"
                className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.priority")}
              </th>
              <th
                scope="col"
                className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.subtasks")}
              </th>
              <th
                scope="col"
                className="px-2.5 py-2 text-left text-[10.5px] font-medium tracking-[.08em] text-muted-foreground uppercase"
              >
                {t("task_table.column.due")}
              </th>
              <th
                scope="col"
                className="w-0 px-1 py-2"
              />
            </tr>
          </thead>
          {isOwnLayout ? (
            groups.map((g, gi) => {
              const gMotion = motion["g:" + g.key]
              const isClosed = closed.has(g.key) && gMotion !== "out"
              return (
                <tbody
                  key={g.key}
                  data-gkey={isGrouped ? g.key : undefined}
                  data-closed={closed.has(g.key) || undefined}
                >
                  {isGrouped && renderGroupHead(g, gi)}
                  {!isClosed && renderStriped(g.rows, gMotion)}
                </tbody>
              )
            })
          ) : (
            <tbody>{tasks.map((task) => renderRow(task))}</tbody>
          )}
          {trailingRows && trailingRows.length > 0 && (
            <tbody>
              {trailingRows.map((row) => (
                <tr key={row.id}>
                  <td colSpan={COL_SPAN}>{row.content}</td>
                </tr>
              ))}
            </tbody>
          )}
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
