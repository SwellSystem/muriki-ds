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
