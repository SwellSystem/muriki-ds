// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-timeline.html
// @used-by src/routes/_authenticated.$workspaceSlug.projects.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  Circle,
  Flag,
  Warning,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

import type {
  TaskTableKind,
  TaskTableStatus,
  TaskTableTask,
} from "@/components/blocks/task-table/types"

import {
  TaskTimelineToolbar,
  type TaskTimelineToolbarFilter,
} from "./task-timeline-toolbar"
import type { TaskTimelineMilestone, TaskTimelineZoom } from "./types"

const DAY_WIDTH = 36
const ROW_HEIGHT = 36
const SIDEBAR_WIDTH = 340
const HEADER_HEIGHT = 48
const BAR_HEIGHT_SUB = 18
const BAR_HEIGHT_PARENT = 14
const MS_PER_DAY = 86_400_000

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function diffDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY)
}

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const statusBarBg: Record<TaskTableStatus, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-[color-mix(in_oklch,var(--muted-foreground)_70%,var(--card))]",
}

const statusBorderClass: Record<TaskTableStatus, string> = {
  active: "border-success text-success",
  progress: "border-primary text-primary",
  blocked: "border-destructive text-destructive",
  done: "border-muted-foreground/40 text-muted-foreground",
}

const railClass: Record<TaskTableStatus, string> = {
  active: "bg-success",
  progress: "bg-primary",
  blocked: "bg-destructive",
  done: "bg-[color-mix(in_oklch,var(--muted-foreground)_40%,transparent)]",
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
  if (kind === "epic") return <Flag size={12} weight="fill" />
  if (kind === "sub") {
    if (status === "done") return <Check size={12} weight="bold" />
    if (status === "blocked") return <Warning size={12} weight="regular" />
  }
  return <Circle size={12} weight="regular" />
}

export interface TaskTimelineProps {
  tasks: TaskTableTask[]
  milestones?: TaskTimelineMilestone[]
  startDate: string
  endDate: string
  today?: string
  zoom?: TaskTimelineZoom
  onZoomChange?: (zoom: TaskTimelineZoom) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: TaskTimelineToolbarFilter[]
  onFilterClick?: (key: string) => void
  onNewTask?: () => void
  onTaskSelect?: (taskId: string) => void
  periodLabel?: string
  onPreviousPeriod?: () => void
  onNextPeriod?: () => void
  showToolbar?: boolean
  showFooter?: boolean
  height?: number
  className?: string
  /** BCP-47 pros nomes de mês/dia (Intl.DateTimeFormat). Default pt-BR. */
  locale?: string
  /**
   * Habilita arrastar as barras: mover pelo corpo, redimensionar pelas
   * pontas, com snap por dia. Recebe as novas datas ISO inclusivas no
   * drop. Ausente → barras estáticas (comportamento original).
   */
  onTaskDatesChange?: (taskId: string, start: string, end: string) => void
}

export function TaskTimeline({
  tasks,
  milestones = [],
  startDate,
  endDate,
  today,
  zoom = "day",
  onZoomChange,
  searchValue,
  onSearchChange,
  filters,
  onFilterClick,
  onNewTask,
  onTaskSelect,
  periodLabel,
  onPreviousPeriod,
  onNextPeriod,
  showToolbar = true,
  showFooter = true,
  height = 540,
  className,
  locale = "pt-BR",
  onTaskDatesChange,
}: TaskTimelineProps) {
  const t = useTranslate()

  const start = React.useMemo(() => parseISODate(startDate), [startDate])
  const end = React.useMemo(() => parseISODate(endDate), [endDate])
  const todayDate = React.useMemo(
    () => (today ? parseISODate(today) : null),
    [today]
  )

  // Guard: invalid range (endDate before startDate) collapses to a single day
  // so layout math stays safe. Caller error, not a crash surface.
  const rawSpan = diffDays(end, start) + 1
  const totalDays = Math.max(1, rawSpan)
  const gridWidth = totalDays * DAY_WIDTH

  const days = React.useMemo(() => {
    const list: { date: Date; isWeekend: boolean; isToday: boolean }[] = []
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start.getTime() + i * MS_PER_DAY)
      const dow = d.getDay()
      list.push({
        date: d,
        isWeekend: dow === 0 || dow === 6,
        isToday: todayDate
          ? d.toDateString() === todayDate.toDateString()
          : false,
      })
    }
    return list
  }, [start, totalDays, todayDate])

  const monthFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short" }),
    [locale]
  )
  const dowFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale]
  )

  const monthSpans = React.useMemo(() => {
    const spans: { label: string; widthPx: number; year: number }[] = []
    let currentMonth = -1
    let monthStartIndex = 0
    for (let i = 0; i < days.length; i++) {
      const d = days[i]!.date
      const m = d.getMonth()
      if (m !== currentMonth) {
        if (currentMonth !== -1) {
          const lastDate = days[monthStartIndex]!.date
          spans.push({
            label: capitalize(monthFormatter.format(lastDate)),
            widthPx: (i - monthStartIndex) * DAY_WIDTH,
            year: lastDate.getFullYear(),
          })
        }
        currentMonth = m
        monthStartIndex = i
      }
    }
    const lastDate = days[monthStartIndex]!.date
    spans.push({
      label: capitalize(monthFormatter.format(lastDate)),
      widthPx: (days.length - monthStartIndex) * DAY_WIDTH,
      year: lastDate.getFullYear(),
    })
    return spans
  }, [days, monthFormatter])

  // Compute hidden rows from defaultCollapsed parents
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(
    () => {
      const initial = new Set<string>()
      for (const task of tasks) {
        if (task.defaultCollapsed && task.childGroupId) {
          initial.add(task.childGroupId)
        }
      }
      return initial
    }
  )

  const handleToggleCollapse = React.useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const hiddenSet = React.useMemo(() => {
    const byId = new Map(tasks.map((task) => [task.id, task]))
    const hidden = new Set<string>()
    for (const task of tasks) {
      let cursor = task.parentId
      while (cursor) {
        const parent = byId.get(cursor)
        if (parent?.childGroupId && collapsedGroups.has(parent.childGroupId)) {
          hidden.add(task.id)
          break
        }
        cursor = parent?.parentId
      }
    }
    return hidden
  }, [tasks, collapsedGroups])

  const visibleTasks = React.useMemo(
    () => tasks.filter((task) => !hiddenSet.has(task.id)),
    [tasks, hiddenSet]
  )

  const dateToCol = React.useCallback(
    (iso: string) => diffDays(parseISODate(iso), start),
    [start]
  )

  const todayCol = todayDate ? diffDays(todayDate, start) : -1

  // ── Drag das barras (mover / redimensionar), com snap por dia ──────────
  const canDragBars = Boolean(onTaskDatesChange)
  const [barDrag, setBarDrag] = React.useState<{
    id: string
    mode: "move" | "start" | "end"
    delta: number
  } | null>(null)
  // Suprime o click que o navegador dispara logo após o pointerup do drag.
  const draggedRef = React.useRef(false)

  React.useEffect(() => {
    if (!barDrag) return
    const previous = document.body.style.cursor
    document.body.style.cursor = barDrag.mode === "move" ? "grabbing" : "ew-resize"
    return () => {
      document.body.style.cursor = previous
    }
  }, [barDrag])

  const beginBarDrag = React.useCallback(
    (
      e: React.PointerEvent,
      task: TaskTableTask,
      mode: "move" | "start" | "end"
    ) => {
      if (!onTaskDatesChange || !task.start || !task.end) return
      e.preventDefault()
      e.stopPropagation()
      const originX = e.clientX
      setBarDrag({ id: task.id, mode, delta: 0 })
      const handleMove = (ev: PointerEvent) => {
        const delta = Math.round((ev.clientX - originX) / DAY_WIDTH)
        setBarDrag((d) => (d && d.id === task.id ? { ...d, delta } : d))
      }
      const handleUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", handleMove)
        window.removeEventListener("pointerup", handleUp)
        setBarDrag(null)
        const delta = Math.round((ev.clientX - originX) / DAY_WIDTH)
        if (delta === 0) return
        draggedRef.current = true
        let s = parseISODate(task.start!)
        let f = parseISODate(task.end!)
        if (mode !== "end") s = new Date(s.getTime() + delta * MS_PER_DAY)
        if (mode !== "start") f = new Date(f.getTime() + delta * MS_PER_DAY)
        // Redimensionar nunca cruza a outra ponta: colapsa num dia só.
        if (s.getTime() > f.getTime()) {
          if (mode === "start") s = f
          else f = s
        }
        onTaskDatesChange(task.id, toISODate(s), toISODate(f))
      }
      window.addEventListener("pointermove", handleMove)
      window.addEventListener("pointerup", handleUp)
    },
    [onTaskDatesChange]
  )

  const sidebarScrollRef = React.useRef<HTMLDivElement | null>(null)
  const gridScrollRef = React.useRef<HTMLDivElement | null>(null)

  // Vertical scroll sync: when grid scrolls, mirror to sidebar
  React.useEffect(() => {
    const grid = gridScrollRef.current
    const sidebar = sidebarScrollRef.current
    if (!grid || !sidebar) return
    const handler = () => {
      if (sidebar.scrollTop !== grid.scrollTop) {
        sidebar.scrollTop = grid.scrollTop
      }
    }
    grid.addEventListener("scroll", handler, { passive: true })
    return () => {
      grid.removeEventListener("scroll", handler)
    }
  }, [])

  // Wheel on sidebar redirects to grid
  React.useEffect(() => {
    const sidebar = sidebarScrollRef.current
    const grid = gridScrollRef.current
    if (!sidebar || !grid) return
    const handler = (e: WheelEvent) => {
      grid.scrollTop += e.deltaY
      e.preventDefault()
    }
    sidebar.addEventListener("wheel", handler, { passive: false })
    return () => sidebar.removeEventListener("wheel", handler)
  }, [])

  // Initial center on today
  React.useEffect(() => {
    const grid = gridScrollRef.current
    if (!grid || todayCol < 0) return
    grid.scrollLeft = Math.max(
      0,
      todayCol * DAY_WIDTH - grid.clientWidth / 2 + 80
    )
  }, [todayCol])

  const handleTodayClick = React.useCallback(() => {
    const grid = gridScrollRef.current
    if (!grid || todayCol < 0) return
    grid.scrollLeft = Math.max(
      0,
      todayCol * DAY_WIDTH - grid.clientWidth / 2 + 80
    )
  }, [todayCol])

  // Build a map for dep lookup using visibleTasks ordering
  const visibleIndexById = React.useMemo(() => {
    const map = new Map<string, number>()
    visibleTasks.forEach((task, idx) => map.set(task.id, idx))
    return map
  }, [visibleTasks])

  const depEdges = React.useMemo(() => {
    const edges: {
      fromX: number
      fromY: number
      toX: number
      toY: number
    }[] = []
    for (let i = 0; i < visibleTasks.length; i++) {
      const task = visibleTasks[i]!
      if (!task.deps || !task.start || !task.end) continue
      for (const depId of task.deps) {
        const fromIdx = visibleIndexById.get(depId)
        if (fromIdx === undefined) continue
        const fromTask = visibleTasks[fromIdx]!
        if (!fromTask.end || !task.start) continue
        const fromX = (dateToCol(fromTask.end) + 1) * DAY_WIDTH
        const fromY = fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2
        const toX = dateToCol(task.start) * DAY_WIDTH + 4
        const toY = i * ROW_HEIGHT + ROW_HEIGHT / 2
        edges.push({ fromX, fromY, toX, toY })
      }
    }
    return edges
  }, [visibleTasks, visibleIndexById, dateToCol])

  const bodyHeight = visibleTasks.length * ROW_HEIGHT

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {showToolbar && (
        <TaskTimelineToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          filters={filters}
          onFilterClick={onFilterClick}
          zoom={zoom}
          onZoomChange={onZoomChange}
          onTodayClick={handleTodayClick}
          onNewTask={onNewTask}
        />
      )}

      {/* Mobile (<md): o gantt split é desktop-only; abaixo de md mostramos
          uma lista vertical simples (título + prazo), tap → detalhe. */}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 md:hidden">
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={onTaskSelect ? () => onTaskSelect(task.id) : undefined}
              disabled={!onTaskSelect}
              className={cn(
                "relative flex w-full items-center gap-2 overflow-hidden rounded-md border border-border bg-card py-2.5 pr-3 pl-3.5 text-left transition-colors",
                onTaskSelect &&
                  "hover:bg-[color-mix(in_oklch,var(--primary)_4%,var(--card))]",
                "disabled:cursor-default",
                task.depth === 1 && "ml-3",
                task.depth >= 2 && "ml-8"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-2 bottom-2 left-[3px] w-[3px] rounded-full",
                  railClass[task.status]
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-[18px] shrink-0 items-center justify-center rounded-sm",
                  kindIconWrapperClass[task.kind]
                )}
              >
                <KindIcon kind={task.kind} status={task.status} />
              </span>
              <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                {task.code}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px]",
                  task.depth === 0 ? "font-medium" : "font-normal",
                  task.depth > 0 &&
                    task.status === "done" &&
                    "text-muted-foreground line-through decoration-muted-foreground/50"
                )}
              >
                {task.title}
              </span>
              {task.due && (
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {task.due}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div
        className="relative hidden overflow-hidden rounded-lg border border-border bg-card md:grid"
        style={{
          gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
          height,
        }}
      >
        {/* Sidebar */}
        <aside className="z-10 flex flex-col overflow-hidden border-r border-border bg-card">
          <header
            className="flex shrink-0 items-end justify-between border-b border-border bg-[color-mix(in_oklch,var(--muted)_40%,var(--card))] px-3 pb-2 text-[10.5px] font-medium tracking-widest text-muted-foreground uppercase"
            style={{ height: HEADER_HEIGHT }}
          >
            <span>{t("task_timeline.column_task")}</span>
            <span className="w-[54px] text-right">
              {t("task_timeline.column_due")}
            </span>
          </header>
          <div
            ref={sidebarScrollRef}
            className="flex-1 overflow-hidden"
            tabIndex={-1}
          >
            <ul className="m-0 list-none p-0">
              {visibleTasks.map((task) => {
                const indentPx =
                  task.depth === 1 ? 12 : task.depth === 2 ? 32 : 0
                const isParent = task.depth === 0
                const hasChildren = Boolean(task.childGroupId)
                const collapsed = hasChildren
                  ? collapsedGroups.has(task.childGroupId!)
                  : false
                return (
                  <li
                    key={task.id}
                    data-id={task.id}
                    onClick={
                      onTaskSelect ? () => onTaskSelect(task.id) : undefined
                    }
                    className={cn(
                      "group/row relative flex items-center gap-1.5 border-b border-border/60 px-3 transition-colors",
                      "[height:36px]",
                      onTaskSelect && "cursor-pointer",
                      isParent
                        ? "bg-[color-mix(in_oklch,var(--muted)_45%,var(--card))]"
                        : "bg-card",
                      task.selected
                        ? "bg-[color-mix(in_oklch,var(--accent)_22%,var(--card))]"
                        : "hover:bg-[color-mix(in_oklch,var(--primary)_4%,var(--card))]"
                    )}
                    style={{ paddingLeft: 12 + indentPx }}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-2 bottom-2 left-[3px] w-[3px] rounded-full transition-all",
                        "group-hover/row:w-1",
                        railClass[task.status]
                      )}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (hasChildren && task.childGroupId)
                          handleToggleCollapse(task.childGroupId)
                      }}
                      aria-label={
                        collapsed
                          ? t("task_timeline.expand_group")
                          : t("task_timeline.collapse_group")
                      }
                      tabIndex={hasChildren ? 0 : -1}
                      className={cn(
                        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-all",
                        hasChildren
                          ? "hover:bg-muted hover:text-foreground"
                          : "pointer-events-none opacity-0",
                        collapsed && "-rotate-90"
                      )}
                    >
                      <CaretDown size={10} weight="bold" />
                    </button>
                    <span
                      className={cn(
                        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-sm",
                        kindIconWrapperClass[task.kind]
                      )}
                    >
                      <KindIcon kind={task.kind} status={task.status} />
                    </span>
                    <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                      {task.code}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[13px]",
                        isParent ? "font-medium" : "font-normal",
                        !isParent &&
                          task.status === "done" &&
                          "text-muted-foreground line-through decoration-muted-foreground/50"
                      )}
                    >
                      {task.title}
                    </span>
                    {task.due && (
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {task.due}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Grid (scrollable both axes) */}
        <div
          ref={gridScrollRef}
          className="relative overflow-auto bg-card [scrollbar-width:thin]"
        >
          <div style={{ width: gridWidth, minWidth: gridWidth }}>
            {/* Sticky header (months + days) */}
            <div
              className="sticky top-0 z-20 flex flex-col border-b border-border bg-[color-mix(in_oklch,var(--muted)_40%,var(--card))]"
              style={{ height: HEADER_HEIGHT }}
            >
              <div className="flex h-[22px] items-center border-b border-border/50 text-[10.5px] font-medium tracking-widest text-muted-foreground uppercase">
                {monthSpans.map((span, idx) => (
                  <span
                    key={`${span.label}-${idx}`}
                    className="flex h-full shrink-0 items-center border-r border-border/50 px-2.5"
                    style={{ width: span.widthPx }}
                  >
                    {span.label} {span.year}
                  </span>
                ))}
              </div>
              <div className="flex h-[26px] items-center">
                {days.map((day, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex h-full shrink-0 flex-col items-center justify-center border-r border-border/35 text-center font-mono text-[11px] leading-tight",
                      day.isWeekend &&
                        "bg-[color-mix(in_oklch,var(--muted)_35%,transparent)]",
                      day.isToday
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                    )}
                    style={{ width: DAY_WIDTH }}
                  >
                    <span
                      className={cn(
                        "text-[9px] tracking-wider uppercase",
                        day.isToday
                          ? "text-primary"
                          : "text-muted-foreground/70"
                      )}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {dowFormatter
                        .format(day.date)
                        .replace(/\.$/, "")
                        .slice(0, 3)}
                    </span>
                    {day.date.getDate().toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
            </div>

            {/* Body */}
            <div
              className="relative"
              style={{
                width: gridWidth,
                height: bodyHeight,
              }}
            >
              {/* Dependency arrows */}
              {depEdges.length > 0 && (
                <svg
                  className="pointer-events-none absolute inset-0 z-[1]"
                  width={gridWidth}
                  height={bodyHeight}
                >
                  <defs>
                    <marker
                      id="task-timeline-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="M0,0 L10,5 L0,10 z"
                        className="fill-muted-foreground/50"
                      />
                    </marker>
                  </defs>
                  {depEdges.map((edge, idx) => {
                    const midX = Math.max(edge.fromX + 8, edge.toX - 8)
                    const d = `M ${edge.fromX} ${edge.fromY} L ${midX} ${edge.fromY} L ${midX} ${edge.toY} L ${edge.toX - 2} ${edge.toY}`
                    return (
                      <path
                        key={idx}
                        d={d}
                        fill="none"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        className="stroke-muted-foreground/35"
                        markerEnd="url(#task-timeline-arrow)"
                      />
                    )
                  })}
                </svg>
              )}

              {/* Today vertical line */}
              {todayCol >= 0 && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-[1] w-px bg-[color-mix(in_oklch,var(--primary)_60%,transparent)]"
                  style={{ left: todayCol * DAY_WIDTH + 18 }}
                >
                  <span className="absolute -top-1 -left-[3px] size-[7px] rounded-full bg-primary" />
                </div>
              )}

              {/* Rows + bars */}
              {visibleTasks.map((task, idx) => {
                const isParent = task.depth === 0
                const isEpic = task.kind === "epic"
                const top = idx * ROW_HEIGHT

                const hasDates = Boolean(task.start && task.end)
                const drag = barDrag && barDrag.id === task.id ? barDrag : null
                let startCol = task.start ? dateToCol(task.start) : 0
                let endCol = task.end ? dateToCol(task.end) : 0
                if (drag) {
                  if (drag.mode !== "end") startCol += drag.delta
                  if (drag.mode !== "start") endCol += drag.delta
                  if (drag.mode === "start") startCol = Math.min(startCol, endCol)
                  if (drag.mode === "end") endCol = Math.max(endCol, startCol)
                }
                const barLeft = startCol * DAY_WIDTH + 4
                const barWidth = (endCol - startCol + 1) * DAY_WIDTH - 8
                const barHeight = isParent ? BAR_HEIGHT_PARENT : BAR_HEIGHT_SUB
                const barTop = top + (ROW_HEIGHT - barHeight) / 2

                const progress = task.progressRatio ?? 0
                const pctText =
                  progress > 0 && progress < 1
                    ? `${Math.round(progress * 100)}%`
                    : null

                return (
                  <div
                    key={task.id}
                    data-id={task.id}
                    className={cn(
                      "absolute left-0 flex border-b border-border/60",
                      isParent &&
                        "bg-[color-mix(in_oklch,var(--muted)_45%,var(--card))]"
                    )}
                    style={{
                      top,
                      width: gridWidth,
                      height: ROW_HEIGHT,
                    }}
                  >
                    {days.map((day, di) => (
                      <span
                        key={di}
                        aria-hidden
                        className={cn(
                          "shrink-0 border-r border-border/25",
                          day.isWeekend &&
                            "bg-[color-mix(in_oklch,var(--muted)_35%,transparent)]"
                        )}
                        style={{ width: DAY_WIDTH }}
                      />
                    ))}

                    {hasDates && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (draggedRef.current) {
                            draggedRef.current = false
                            return
                          }
                          onTaskSelect?.(task.id)
                        }}
                        onPointerDown={
                          canDragBars
                            ? (e) => beginBarDrag(e, task, "move")
                            : undefined
                        }
                        title={task.title}
                        className={cn(
                          "absolute z-[2] flex items-center overflow-hidden text-[11.5px] font-medium whitespace-nowrap text-primary-foreground transition-all",
                          "shadow-[0_1px_2px_oklch(0_0_0_/_0.12)]",
                          "hover:-translate-y-px hover:shadow-[0_3px_8px_oklch(0_0_0_/_0.18)] hover:brightness-105",
                          isParent
                            ? cn(
                                "border-[1.5px] bg-transparent font-semibold shadow-none",
                                isEpic
                                  ? "border-[var(--chart-3)] text-[var(--chart-3)]"
                                  : statusBorderClass[task.status]
                              )
                            : statusBarBg[task.status],
                          isParent ? "rounded-[3px]" : "rounded-[5px]",
                          canDragBars && "cursor-grab",
                          drag &&
                            "z-[3] shadow-[0_6px_16px_oklch(0_0_0_/_0.28)] brightness-105"
                        )}
                        style={{
                          left: barLeft,
                          top: barTop - top,
                          width: barWidth,
                          height: barHeight,
                          paddingLeft: 8,
                          paddingRight: 8,
                        }}
                      >
                        {canDragBars && (
                          <>
                            <span
                              aria-hidden
                              onPointerDown={(e) => beginBarDrag(e, task, "start")}
                              className="absolute inset-y-0 left-0 z-[3] w-2 cursor-ew-resize"
                            />
                            <span
                              aria-hidden
                              onPointerDown={(e) => beginBarDrag(e, task, "end")}
                              className="absolute inset-y-0 right-0 z-[3] w-2 cursor-ew-resize"
                            />
                          </>
                        )}
                        {progress > 0 && (
                          <span
                            aria-hidden
                            className={cn(
                              "pointer-events-none absolute top-0 bottom-0 left-0 rounded-[inherit]",
                              isParent
                                ? "bg-current opacity-[0.18]"
                                : "bg-white/20"
                            )}
                            style={{ width: `${progress * 100}%` }}
                          />
                        )}
                        {!isParent && task.owner && (
                          <span className="z-[1] mr-1.5 inline-flex size-[14px] shrink-0 items-center justify-center rounded-full bg-white/25 text-[9px] font-semibold">
                            {task.owner.initials}
                          </span>
                        )}
                        <span
                          className={cn(
                            "z-[1] min-w-0 flex-1 truncate",
                            isParent &&
                              "text-[11px] tracking-[0.02em] text-foreground"
                          )}
                        >
                          {task.title}
                        </span>
                        {pctText && (
                          <span
                            className={cn(
                              "z-[1] ml-1.5 font-mono text-[10.5px] opacity-85",
                              isParent && "text-foreground"
                            )}
                          >
                            {pctText}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Milestones (diamonds) */}
              {milestones.map((ms) => {
                const col = dateToCol(ms.date)
                const idx = ms.rowId ? visibleIndexById.get(ms.rowId) : null
                if (idx === undefined || idx === null) return null
                const left = col * DAY_WIDTH + 18
                const top = idx * ROW_HEIGHT + ROW_HEIGHT / 2
                return (
                  <span
                    key={ms.id}
                    title={ms.label}
                    aria-label={ms.label}
                    className="absolute z-[2] block size-[14px] rotate-45 rounded-[2px] bg-accent shadow-[0_1px_3px_oklch(0_0_0_/_0.15)]"
                    style={{
                      left: left - 7,
                      top: top - 7,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showFooter && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-[11.5px] text-muted-foreground">
          <div className="inline-flex flex-wrap items-center gap-3.5">
            <LegendItem
              swatch="bg-primary"
              label={t("task_timeline.legend.progress")}
            />
            <LegendItem
              swatch="bg-success"
              label={t("task_timeline.legend.active")}
            />
            <LegendItem
              swatch="bg-destructive"
              label={t("task_timeline.legend.blocked")}
            />
            <LegendItem
              swatch="bg-[var(--chart-3)]"
              label={t("task_timeline.legend.epic")}
            />
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2 rotate-45 bg-accent"
              />
              {t("task_timeline.legend.milestone")}
            </span>
          </div>

          {(periodLabel || onPreviousPeriod || onNextPeriod) && (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                aria-label={t("task_timeline.previous_period")}
                onClick={onPreviousPeriod}
                disabled={!onPreviousPeriod}
                className={cn(
                  "inline-flex size-[22px] items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                )}
              >
                <CaretLeft size={12} weight="regular" />
              </button>
              {periodLabel && (
                <span className="px-1.5 font-mono text-[11px]">
                  {periodLabel}
                </span>
              )}
              <button
                type="button"
                aria-label={t("task_timeline.next_period")}
                onClick={onNextPeriod}
                disabled={!onNextPeriod}
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

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("inline-block size-2.5 rounded-[2px]", swatch)}
      />
      {label}
    </span>
  )
}
