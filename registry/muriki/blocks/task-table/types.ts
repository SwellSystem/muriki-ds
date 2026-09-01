export type TaskTableStatus = "active" | "progress" | "blocked" | "done"

export type TaskTableKind = "epic" | "task" | "sub"

export type TaskTablePriority = "urgent" | "high" | "medium" | "low" | "none"

export type TaskTableAvatarTone = "a1" | "a2" | "a3" | "a4"

export interface TaskTableOwner {
  initials: string
  tone?: TaskTableAvatarTone
  name?: string
}

export interface TaskTableProgress {
  done: number
  total: number
}

export interface TaskTableTask {
  id: string
  code: string
  title: string
  depth: 0 | 1 | 2
  kind: TaskTableKind
  status: TaskTableStatus
  owner?: TaskTableOwner
  priority?: TaskTablePriority
  /** Display-ready due date string (e.g. "22 Abr"). Formatting is the caller's responsibility. */
  due?: string
  parentId?: string
  childGroupId?: string
  progress?: TaskTableProgress
  lastChild?: boolean
  selected?: boolean
  defaultCollapsed?: boolean
  /** Inclusive ISO date (YYYY-MM-DD) — used by TaskTimeline to position the bar. */
  start?: string
  /** Inclusive ISO date (YYYY-MM-DD). */
  end?: string
  /** Fraction 0..1 used by TaskTimeline to render the progress overlay on the bar. */
  progressRatio?: number
  /** IDs of tasks this task depends on (drawn as dashed connector arrows). */
  deps?: string[]
  /** True when the underlying status type is "cancelled" — drives strikethrough on title. */
  cancelled?: boolean
}
