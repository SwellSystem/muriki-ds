// Porte da lógica pura de drop do muriki-platform (kanban-drop.ts),
// adaptada ao POC: a chave é sempre `slug`, toda coluna aceita drop e a
// ordem é posicional (índice no array), não fracional — o estado final
// volta pro caller como um array flat já reordenado.
import type { KanbanTask } from "./kanban-card";

export interface KanbanColumnState {
  id: string;
  name: string;
  color: string | null;
  tasks: KanbanTask[];
}

/**
 * Move uma task entre colunas no estado local, produzindo um snapshot novo
 * pronto pra render. Usado pelo `onDragOver` do board pra dar feedback
 * visual fluido enquanto o drag está em andamento.
 *
 * `overId` pode ser:
 * - slug de outra task (drop sobre um card) — insere na posição dela.
 * - id de uma coluna (drop no espaço vazio) — insere no fim.
 */
export function moveTaskLocally(
  columns: readonly KanbanColumnState[],
  activeSlug: string,
  overId: string
): KanbanColumnState[] {
  if (activeSlug === overId) return columns.slice();

  let activeColIdx = -1;
  let activeTaskIdx = -1;
  for (let i = 0; i < columns.length; i++) {
    const idx = columns[i]!.tasks.findIndex((t) => t.slug === activeSlug);
    if (idx !== -1) {
      activeColIdx = i;
      activeTaskIdx = idx;
      break;
    }
  }
  if (activeColIdx === -1) return columns.slice();

  const activeCol = columns[activeColIdx]!;
  const activeTask = activeCol.tasks[activeTaskIdx]!;

  let overColIdx = columns.findIndex((c) => c.id === overId);
  let overTaskIdx = -1;
  if (overColIdx === -1) {
    for (let i = 0; i < columns.length; i++) {
      const idx = columns[i]!.tasks.findIndex((t) => t.slug === overId);
      if (idx !== -1) {
        overColIdx = i;
        overTaskIdx = idx;
        break;
      }
    }
  }
  if (overColIdx === -1) return columns.slice();

  // Intra-coluna: move do índice atual pro alvo.
  if (activeColIdx === overColIdx) {
    if (overTaskIdx === -1 || overTaskIdx === activeTaskIdx)
      return columns.slice();
    const tasks = [...activeCol.tasks];
    const [moved] = tasks.splice(activeTaskIdx, 1);
    tasks.splice(overTaskIdx, 0, moved!);
    return columns.map((c, i) => (i === activeColIdx ? { ...c, tasks } : c));
  }

  // Cross-coluna: remove da origem + insere na alvo.
  const newActiveTasks = activeCol.tasks.filter((t) => t.slug !== activeSlug);
  const overCol = columns[overColIdx]!;
  const insertAt = overTaskIdx === -1 ? overCol.tasks.length : overTaskIdx;
  const newOverTasks = [
    ...overCol.tasks.slice(0, insertAt),
    activeTask,
    ...overCol.tasks.slice(insertAt),
  ];
  return columns.map((c, i) => {
    if (i === activeColIdx) return { ...c, tasks: newActiveTasks };
    if (i === overColIdx) return { ...c, tasks: newOverTasks };
    return c;
  });
}

/** Achata as colunas de volta num array flat, com `statusId` atualizado. */
export function flattenColumns(
  columns: readonly KanbanColumnState[]
): KanbanTask[] {
  return columns.flatMap((col) =>
    col.tasks.map((t) => (t.statusId === col.id ? t : { ...t, statusId: col.id }))
  );
}
