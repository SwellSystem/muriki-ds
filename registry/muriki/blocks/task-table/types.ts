export type TaskTableStatus = "active" | "progress" | "blocked" | "done"

export type TaskTableKind = "epic" | "task" | "sub"

export type TaskTablePriority = "urgent" | "high" | "medium" | "low" | "none"

export type TaskTableAvatarTone = "a1" | "a2" | "a3" | "a4"

export interface TaskTableOwner {
  initials: string
  tone?: TaskTableAvatarTone
  name?: string
}

/** Tom do ponto do projeto: um dos nove tons do sistema. */
export type TaskTableTone =
  | "gray"
  | "blue"
  | "cyan"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "pink"
  | "purple"

export interface TaskTableProject {
  id: string
  name: string
  tone?: TaskTableTone
}

/**
 * Estado do prazo, que pinta o pill da data (mesma escala do DueDate do DS).
 * Calcular é do caller, como já era formatar `due`.
 */
export type TaskTableDueState =
  | "overdue"
  | "today"
  | "tomorrow"
  | "week"
  | "later"
  | "done"

/** Agrupamento interno da tabela (`TaskTableProps.groupBy`). */
export type TaskTableGroupBy =
  | "none"
  | "status"
  | "priority"
  | "project"
  | "assignee"

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
  /** Pinta o pill do prazo. Sem ele, o pill fica neutro. */
  dueState?: TaskTableDueState
  /** Sem projeto, a coluna mostra "Pessoal". Subtarefas herdam o da mãe. */
  project?: TaskTableProject
  /**
   * Subtarefas aninhadas, na mesma forma. A tabela as achata embaixo da mãe
   * (depth, parentId, childGroupId e lastChild são preenchidos), herdando o
   * projeto. Alternativa a mandar a árvore já achatada.
   */
  children?: TaskTableSubtask[]
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

/** Subtarefa em `children`: profundidade e tipo vêm da mãe. */
export type TaskTableSubtask = Omit<TaskTableTask, "depth" | "kind"> &
  Partial<Pick<TaskTableTask, "depth" | "kind">>
