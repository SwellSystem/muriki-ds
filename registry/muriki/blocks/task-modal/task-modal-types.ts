// Portado do muriki-platform sem redesenhar: o desenho é o de lá,
// as dependências é que passaram a ser as da casa.
//
// Tipos do bloco `task-modal`. O componente é **apresentacional e controlado**
// — não conhece Yjs nem a focus-api. Cada módulo (focus, projects) monta um
// container fino que mapeia seus dados para estes tipos e liga o `onChange`.
import type { StatusKind } from "@/components/blocks/status-pill/status-pill"

/** Os três modos de apresentação do mesmo formulário. */
export type TaskModalMode = "central" | "drawer" | "full"

/** Visões do modal. `detail` (abas, GitHub, etc.) virá numa leva futura. */
export type TaskModalView = "create"

/** Níveis de prioridade — espelham `TaskFields["priority"]` do domínio focus. */
export type TaskModalPriority = "none" | "low" | "medium" | "high" | "urgent"

/** Opção de status passada pelo consumidor (já resolvida do domínio). */
export interface TaskModalStatusOption {
  id: string
  name: string
  /** Família visual usada pelo `StatusPill`. */
  kind: StatusKind
}

/** Pessoa atribuível (responsável). `initials` é derivado pelo consumidor. */
export interface TaskModalPersonOption {
  id: string
  name: string
  initials: string
}

/** Destino de projeto (módulo projects). Opcional no focus pessoal. */
export interface TaskModalProjectOption {
  id: string
  name: string
}

/** Etiqueta/label disponível. `color` é um valor CSS (token-resolved no consumidor). */
export interface TaskModalTagOption {
  id: string
  label: string
  color?: string
}

/** Subtask inline. `slug` ausente/null => exibe id pendente. */
export interface TaskModalSubtask {
  id: string
  title: string
  done: boolean
  slug?: string | null
}

/** Anexo já listado (upload real fica a cargo do consumidor). */
export interface TaskModalAttachment {
  id: string
  name: string
  size?: string
}

/**
 * Rascunho da task — o estado de domínio do formulário. O consumidor é dono
 * deste objeto e recebe patches via `onChange`. Campos opcionais (`projectId`,
 * `points`) só renderizam linha quando a opção correspondente é fornecida.
 */
export interface TaskDraft {
  title: string
  description: string
  statusId: string
  priority: TaskModalPriority
  assigneeIds: string[]
  /** ISO date (`yyyy-mm-dd`) ou `null`. */
  startDate: string | null
  /** ISO date (`yyyy-mm-dd`) ou `null`. */
  dueDate: string | null
  projectId: string | null
  tagIds: string[]
  points: number | null
  subtasks: TaskModalSubtask[]
  attachments: TaskModalAttachment[]
}

/** Cria um rascunho vazio com defaults seguros. */
export function emptyTaskDraft(statusId = ""): TaskDraft {
  return {
    title: "",
    description: "",
    statusId,
    priority: "none",
    assigneeIds: [],
    startDate: null,
    dueDate: null,
    projectId: null,
    tagIds: [],
    points: null,
    subtasks: [],
    attachments: [],
  }
}

/** Estimativas oferecidas no picker de pontos (story points fibonacci-ish). */
export const TASK_POINT_OPTIONS = [1, 2, 3, 5, 8, 13] as const
