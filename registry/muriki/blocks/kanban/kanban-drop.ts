// Lógica pura de mover tarefa. A ordem é posicional: a ordem do array é a
// ordem dentro da coluna. O board pede `onMove(id, status, index)` e quem
// usa o bloco aplica com `placeTask` — ou com a regra que o servidor tiver.
import type { KanbanStatus, KanbanTask } from "./kanban-card"

type Id = KanbanTask["id"]

/**
 * Põe a tarefa `id` na coluna `status`, antes da que hoje está em `index`
 * nessa coluna (sem contar a própria). `index` além do fim = no fim.
 * `patch` entra junto (ex.: zerar as subtarefas ao concluir).
 */
export function placeTask<T extends KanbanTask>(
  tasks: readonly T[],
  id: Id,
  status: KanbanStatus,
  index: number,
  patch?: Partial<T>
): T[] {
  const atual = tasks.find((x) => x.id === id)
  if (!atual) return tasks.slice()
  const eu = { ...atual, ...patch, status } as T
  const resto = tasks.filter((x) => x.id !== id)
  const naColuna = resto.filter((x) => x.status === status)
  const ancora = naColuna[index]
  const at = ancora
    ? resto.indexOf(ancora)
    : naColuna.length
      ? resto.indexOf(naColuna[naColuna.length - 1]!) + 1
      : resto.length
  resto.splice(at, 0, eu)
  return resto
}

export interface KanbanColumnState {
  id: KanbanStatus
  tasks: KanbanTask[]
}

/**
 * Espelho local durante o arrasto (@dnd-kit): move a tarefa para a posição
 * do alvo. `overId` é o id de outra tarefa (entra no lugar dela) ou de uma
 * coluna (entra no fim).
 */
export function moveTaskLocally(
  columns: readonly KanbanColumnState[],
  activeId: Id,
  overId: Id
): KanbanColumnState[] {
  if (activeId === overId) return columns.slice()
  const ci = columns.findIndex((c) => c.tasks.some((t) => t.id === activeId))
  if (ci === -1) return columns.slice()
  const ti = columns[ci]!.tasks.findIndex((t) => t.id === activeId)
  const task = columns[ci]!.tasks[ti]!

  let oi = columns.findIndex((c) => c.id === overId)
  let oti = -1
  if (oi === -1) {
    oi = columns.findIndex((c) => c.tasks.some((t) => t.id === overId))
    if (oi === -1) return columns.slice()
    oti = columns[oi]!.tasks.findIndex((t) => t.id === overId)
  }

  if (ci === oi) {
    if (oti === -1 || oti === ti) return columns.slice()
    const tasks = [...columns[ci]!.tasks]
    tasks.splice(ti, 1)
    tasks.splice(oti, 0, task)
    return columns.map((c, i) => (i === ci ? { ...c, tasks } : c))
  }

  const destino = [...columns[oi]!.tasks]
  destino.splice(oti === -1 ? destino.length : oti, 0, task)
  return columns.map((c, i) =>
    i === ci ? { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) } : i === oi ? { ...c, tasks: destino } : c
  )
}
