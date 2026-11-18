// @component-doc
// @source custom: Muriki DS — TaskTable aprovado (prototipos/tabela)
// @used-by src/components/blocks/task-table/task-table.tsx
//
// Por que a árvore é achatada aqui e não na fileira: a tabela já sabe abrir e
// fechar subtarefas pela lista plana (depth, parentId, childGroupId). Quem
// manda `children` cai no mesmo caminho, sem um segundo jeito de desenhar a
// árvore. E o agrupamento olha só as tarefas-raiz: a subtarefa viaja com a mãe
// mesmo que o status dela seja outro, senão o grupo "Concluído" ganharia
// fileiras soltas, sem a mãe por perto.
import type {
  TaskTableGroupBy,
  TaskTablePriority,
  TaskTableStatus,
  TaskTableSubtask,
  TaskTableTask,
} from "./types"

/**
 * Achata `children` embaixo da mãe e faz a subtarefa herdar o projeto. Vale
 * também para a árvore já achatada (por `parentId`): a subtarefa sem projeto
 * herda o da mãe, e nunca aparece como "Pessoal" dentro de um projeto.
 */
export function flattenTasks(tasks: TaskTableTask[]): TaskTableTask[] {
  const out: TaskTableTask[] = []
  const push = (task: TaskTableTask) => {
    const kids = task.children ?? []
    if (!kids.length) {
      out.push(task)
      return
    }
    const done = kids.filter((k) => k.status === "done").length
    const groupId = task.childGroupId ?? task.id
    out.push({
      ...task,
      childGroupId: groupId,
      progress: task.progress ?? { done, total: kids.length },
    })
    kids.forEach((kid: TaskTableSubtask, i) =>
      push({
        ...kid,
        depth: kid.depth ?? (Math.min(task.depth + 1, 2) as 1 | 2),
        kind: kid.kind ?? "sub",
        parentId: task.id,
        lastChild: i === kids.length - 1,
        project: kid.project ?? task.project,
      })
    )
  }
  tasks.forEach(push)

  // Árvore achatada pelo caller: a mãe vem antes, então uma passada resolve.
  const byId = new Map<string, TaskTableTask>()
  return out.map((task) => {
    let next = task
    if (!task.project && task.parentId) {
      const mae = byId.get(task.parentId)
      if (mae?.project) next = { ...task, project: mae.project }
    }
    byId.set(next.id, next)
    return next
  })
}

const STATUS_ORDER: TaskTableStatus[] = ["active", "progress", "blocked", "done"]
const PRIORITY_ORDER: TaskTablePriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
]

/** Chave vazia: tarefa sem projeto ou sem responsável. Vai para o fim. */
export const TASK_TABLE_EMPTY_GROUP = "__none"

export interface TaskTableGroup {
  key: string
  /** A primeira tarefa-raiz do grupo: de onde sai o nome do projeto/pessoa. */
  root: TaskTableTask
  rows: TaskTableTask[]
}

function groupKey(task: TaskTableTask, groupBy: TaskTableGroupBy): string {
  switch (groupBy) {
    case "status":
      return task.status
    case "priority":
      return task.priority ?? "none"
    case "project":
      return task.project?.id ?? TASK_TABLE_EMPTY_GROUP
    case "assignee":
      return task.owner
        ? (task.owner.name ?? task.owner.initials)
        : TASK_TABLE_EMPTY_GROUP
    default:
      return "all"
  }
}

/** Separa as fileiras em grupos pela tarefa-raiz. Grupos vazios não entram. */
export function groupTasks(
  rows: TaskTableTask[],
  groupBy: TaskTableGroupBy
): TaskTableGroup[] {
  const ids = new Set(rows.map((r) => r.id))
  const groups = new Map<string, TaskTableGroup>()
  let atual: TaskTableGroup | undefined
  for (const row of rows) {
    const isRoot = !row.parentId || !ids.has(row.parentId)
    if (isRoot || !atual) {
      const key = groupKey(row, groupBy)
      atual = groups.get(key)
      if (!atual) {
        atual = { key, root: row, rows: [] }
        groups.set(key, atual)
      }
    }
    atual.rows.push(row)
  }

  const fixed =
    groupBy === "status"
      ? (STATUS_ORDER as string[])
      : groupBy === "priority"
        ? (PRIORITY_ORDER as string[])
        : null
  const list = [...groups.values()]
  if (fixed) return list.sort((a, b) => fixed.indexOf(a.key) - fixed.indexOf(b.key))
  // Projeto e responsável: na ordem em que aparecem, e o "sem" por último.
  return list.sort(
    (a, b) =>
      Number(a.key === TASK_TABLE_EMPTY_GROUP) -
      Number(b.key === TASK_TABLE_EMPTY_GROUP)
  )
}
