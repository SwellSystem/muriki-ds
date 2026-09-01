// Porte do FocusKanbanBoard do muriki-platform: colunas-bandeja em scroll
// horizontal com snap, cabeçalho mono, coluna vazia poética — e o drag-drop
// inter-colunas via @dnd-kit com o mesmo vocabulário de efeitos: overlay
// clonado com rotação e sombra cinematográfica, original como fantasma
// físico, colunas não-alvo desbotadas, "Solte aqui." no alvo vazio e
// aria-live anunciando o movimento. Sem Yjs: o estado volta pro caller
// via `onTasksChange` (array flat reordenado).
"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { KanbanCard, type KanbanTask } from "./kanban-card";
import {
  flattenColumns,
  moveTaskLocally,
  type KanbanColumnState,
} from "./kanban-drop";

export interface KanbanColumnSpec {
  id: string;
  name: string;
  /** Cor do status (qualquer cor CSS). `null` → ponto tracejado, borda neutra. */
  color: string | null;
}

const EMPTY_VARIANTS = ["Um respiro.", "Vazio por enquanto.", "Silêncio."];

function pickEmptyVariant(columnId: string): string {
  let hash = 0;
  for (let i = 0; i < columnId.length; i++) {
    hash = (hash * 31 + columnId.charCodeAt(i)) | 0;
  }
  return EMPTY_VARIANTS[Math.abs(hash) % EMPTY_VARIANTS.length]!;
}

export interface KanbanBoardProps {
  columns: KanbanColumnSpec[];
  tasks: KanbanTask[];
  /** Recebe o array flat reordenado (statusId já atualizado) após um drop. */
  onTasksChange?: (tasks: KanbanTask[]) => void;
  /** Disparado quando um drop muda a task de coluna. */
  onMoved?: (task: KanbanTask, columnName: string) => void;
  onToggleDone?: (slug: string, next: boolean) => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (task: KanbanTask) => void;
  className?: string;
}

export function KanbanBoard({
  columns: columnSpecs,
  tasks,
  onTasksChange,
  onMoved,
  onToggleDone,
  onAddCard,
  onCardClick,
  className,
}: KanbanBoardProps) {
  const columns: KanbanColumnState[] = useMemo(
    () =>
      columnSpecs.map((spec) => ({
        ...spec,
        tasks: tasks.filter((t) => t.statusId === spec.id),
      })),
    [columnSpecs, tasks]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  // Pattern canônico do @dnd-kit pra boards com containers vazios:
  // pointerWithin primeiro, rectIntersection como fallback.
  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    const intersection = rectIntersection(args);
    const first = getFirstCollision(intersection);
    return first ? intersection : [];
  }, []);

  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  // Espelho local rearranjado em tempo real durante o drag; sincroniza de
  // volta com o snapshot quando não há drag ativo.
  const [localColumns, setLocalColumns] = useState(columns);
  useEffect(() => {
    if (!activeTask) setLocalColumns(columns);
  }, [columns, activeTask]);

  const originalColumnIdRef = useRef<string | null>(null);

  // Cursor `grabbing` no documento inteiro enquanto há drag ativo.
  useEffect(() => {
    if (!activeTask) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [activeTask]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = event.active.data.current?.task as KanbanTask | undefined;
      if (!task) return;
      setActiveTask(task);
      originalColumnIdRef.current =
        columns.find((c) => c.tasks.some((t) => t.slug === task.slug))?.id ??
        null;
    },
    [columns]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    if (over?.id == null) {
      setOverColumnId(null);
      return;
    }
    const overId = String(over.id);

    setLocalColumns((cols) => moveTaskLocally(cols, activeId, overId));
    setLocalColumns((cols) => {
      const colByCard = cols.find((c) =>
        c.tasks.some((t) => t.slug === overId)
      );
      if (colByCard) {
        setOverColumnId(colByCard.id);
        return cols;
      }
      const colDirect = cols.find((c) => c.id === overId);
      setOverColumnId(colDirect?.id ?? null);
      return cols;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    const task = activeTask;
    const original = originalColumnIdRef.current;
    setActiveTask(null);
    setOverColumnId(null);
    originalColumnIdRef.current = null;
    if (!task || !original) return;

    const targetColumn = localColumns.find((c) =>
      c.tasks.some((t) => t.slug === task.slug)
    );
    if (!targetColumn) {
      setLocalColumns(columns);
      return;
    }

    onTasksChange?.(flattenColumns(localColumns));
    if (targetColumn.id !== original) {
      onMoved?.(task, targetColumn.name);
      setLiveMessage(`${task.title} movida para ${targetColumn.name}`);
    }
  }, [activeTask, columns, localColumns, onMoved, onTasksChange]);

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setOverColumnId(null);
    originalColumnIdRef.current = null;
    setLocalColumns(columns);
  }, [columns]);

  // Véus nas bordas + métricas do indicador de scroll (trilho de encaixe
  // desenhado pelo componente — a barra nativa fica oculta).
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = useState({ left: false, right: false });
  const [bar, setBar] = useState({ left: 0, width: 100, overflow: false });
  const [barDragging, setBarDragging] = useState(false);
  // O trilho só se mostra enquanto o board realmente rola; some sozinho.
  const [railActive, setRailActive] = useState(false);
  const railTimer = useRef<number | null>(null);
  const pokeRail = useCallback(() => {
    setRailActive(true);
    if (railTimer.current) window.clearTimeout(railTimer.current);
    railTimer.current = window.setTimeout(() => setRailActive(false), 900);
  }, []);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setFade((f) => (f.left === left && f.right === right ? f : { left, right }));
    const overflow = el.scrollWidth > el.clientWidth + 1;
    const width = overflow
      ? Math.max((el.clientWidth / el.scrollWidth) * 100, 8)
      : 100;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const barLeft =
      overflow && maxScroll > 0
        ? (el.scrollLeft / maxScroll) * (100 - width)
        : 0;
    setBar((b) =>
      b.left === barLeft && b.width === width && b.overflow === overflow
        ? b
        : { left: barLeft, width, overflow }
    );
  }, []);
  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      updateFades();
      pokeRail();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (railTimer.current) window.clearTimeout(railTimer.current);
    };
  }, [updateFades, pokeRail]);

  // Arrasto do thumb: desliga o snap enquanto dura, senão as colunas
  // brigam com o dedo.
  const handleThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const thumbFrac = Math.max(el.clientWidth / el.scrollWidth, 0.08);
    const travel = track.clientWidth * (1 - thumbFrac);
    if (maxScroll <= 0 || travel <= 0) return;
    const startX = e.clientX;
    const startScroll = el.scrollLeft;
    setBarDragging(true);
    const onMove = (ev: PointerEvent) => {
      el.scrollLeft = startScroll + (ev.clientX - startX) * (maxScroll / travel);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setBarDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const handleTrackPointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const thumbFrac = Math.max(el.clientWidth / el.scrollWidth, 0.08);
    const travel = rect.width * (1 - thumbFrac);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (travel <= 0 || maxScroll <= 0) return;
    const target =
      ((e.clientX - rect.left - (rect.width * thumbFrac) / 2) / travel) *
      maxScroll;
    el.scrollTo({
      left: Math.max(0, Math.min(maxScroll, target)),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!barDragging) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [barDragging]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={cn("flex flex-col", className)}>
        <div className="relative">
          <div
            ref={scrollRef}
            role="list"
            aria-label="Board de tasks"
            className={cn(
              "muriki-scroll-x flex items-stretch gap-3 overflow-x-auto px-0.5 pt-1 pb-1",
              "scroll-pl-4",
              barDragging ? "snap-none" : "snap-x snap-mandatory"
            )}
          >
            {localColumns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                index={index}
                hasDragActive={activeTask !== null}
                isOverTarget={overColumnId === column.id}
                onToggleDone={onToggleDone}
                onAddCard={onAddCard}
                onCardClick={onCardClick}
              />
            ))}
          </div>
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent transition-opacity duration-200",
              fade.left ? "opacity-100" : "opacity-0"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent transition-opacity duration-200",
              fade.right ? "opacity-100" : "opacity-0"
            )}
          />
        </div>

        {bar.overflow && (
          <div
            ref={trackRef}
            aria-hidden
            onPointerDown={handleTrackPointerDown}
            onMouseEnter={() => {
              if (railTimer.current) window.clearTimeout(railTimer.current);
              if (railActive) setRailActive(true);
            }}
            onMouseLeave={pokeRail}
            className={cn(
              // trilho: encaixe — recuado, aresta de cima na sombra no claro,
              // fio de luz no topo no escuro
              // claro: encaixe. escuro: chapado — em 10px, relevo vira sujeira
              "relative mt-2 h-2.5 shrink-0 cursor-pointer rounded-full bg-sunken",
              "transition-opacity duration-300",
              railActive || barDragging
                ? "opacity-100"
                : "pointer-events-none opacity-0",
              "shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_var(--border)]",
              "dark:shadow-none"
            )}
          >
            <div
              onPointerDown={handleThumbPointerDown}
              className={cn(
                // thumb: objeto elevado — sobe por sombra no claro, por luz no escuro
                "absolute top-[2px] bottom-[2px] cursor-grab rounded-full active:cursor-grabbing",
                "bg-card shadow-[inset_0_0_0_1px_var(--input),0_1px_2px_rgba(0,0,0,0.22)]",
                "dark:bg-[oklch(0.42_0.006_107)] dark:shadow-none dark:hover:bg-[oklch(0.47_0.006_107)]",
                !barDragging && "transition-[left] duration-75"
              )}
              style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
            />
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <DragPreviewCard task={activeTask} /> : null}
      </DragOverlay>

      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
    </DndContext>
  );
}

interface KanbanColumnProps {
  column: KanbanColumnState;
  index: number;
  hasDragActive: boolean;
  isOverTarget: boolean;
  onToggleDone?: (slug: string, next: boolean) => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (task: KanbanTask) => void;
}

function KanbanColumn({
  column,
  index,
  hasDragActive,
  isOverTarget,
  onToggleDone,
  onAddCard,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const hasTasks = column.tasks.length > 0;
  const isDropTarget = isOverTarget;
  // Durante um drag ativo, colunas que NÃO são alvo ficam sutilmente
  // desbotadas pra focar a atenção no alvo em potencial.
  const isDimmed = hasDragActive && !isDropTarget;

  return (
    <motion.section
      ref={setNodeRef}
      role="listitem"
      aria-label={column.name}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        ease: [0.2, 0.8, 0.2, 1],
        delay: Math.min(index * 0.04, 0.24),
      }}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col rounded-lg bg-muted/40 p-3 ring-1 ring-border/60 transition-[box-shadow,background-color,opacity] duration-200 outline-none focus:outline-none",
        isDropTarget && "bg-primary/5 ring-primary/50",
        isDimmed && "opacity-60"
      )}
      tabIndex={-1}
    >
      <header
        className={cn(
          "flex items-center gap-2 border-b pb-3",
          !column.color && "border-border/40"
        )}
        style={
          column.color
            ? {
                borderColor: `color-mix(in oklch, ${column.color} 35%, transparent)`,
              }
            : undefined
        }
      >
        {column.color ? (
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: column.color }}
          />
        ) : (
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground/40"
          />
        )}
        <h3 className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium tracking-[0.2em] text-foreground uppercase">
          {column.name}
        </h3>
        <span
          aria-label={`${column.tasks.length} tasks`}
          className="shrink-0 font-mono text-[10px] tracking-wider text-muted-foreground/70 tabular-nums"
        >
          {column.tasks.length.toString().padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onAddCard ? () => onAddCard(column.id) : undefined}
          aria-label={`Adicionar card em ${column.name}`}
          disabled={!onAddCard}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={12} weight="bold" aria-hidden="true" />
        </button>
      </header>

      {hasTasks ? (
        <SortableContext
          items={column.tasks.map((t) => t.slug)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 pt-3">
            {column.tasks.map((task) => (
              <SortableKanbanCard
                key={task.slug}
                task={task}
                onToggleDone={onToggleDone}
                onCardClick={onCardClick}
              />
            ))}
          </ul>
        </SortableContext>
      ) : (
        <div
          className={cn(
            "mt-3 flex flex-1 flex-col justify-center gap-2.5 rounded-md border border-dashed px-3 py-6 transition-colors",
            isDropTarget
              ? "border-primary/40 bg-primary/10"
              : "border-muted-foreground/25 bg-transparent"
          )}
        >
          <p
            className={cn(
              "text-center font-serif text-sm italic transition-colors",
              isDropTarget ? "text-primary/80" : "text-muted-foreground/40"
            )}
          >
            {isDropTarget ? "Solte aqui." : pickEmptyVariant(column.id)}
          </p>
        </div>
      )}
    </motion.section>
  );
}

interface SortableKanbanCardProps {
  task: KanbanTask;
  onToggleDone?: (slug: string, next: boolean) => void;
  onCardClick?: (task: KanbanTask) => void;
}

function SortableKanbanCard({
  task,
  onToggleDone,
  onCardClick,
}: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.slug, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = onCardClick
    ? () => {
        if (isDragging) return;
        onCardClick(task);
      }
    : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-roledescription="Card arrastável"
      onClick={handleClick}
      className={cn(
        "group relative cursor-grab outline-none focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset active:cursor-grabbing",
        // Original permanece no lugar como "fantasma físico" enquanto o
        // overlay é arrastado.
        isDragging && "scale-[0.98] opacity-30 blur-[1px] saturate-50"
      )}
    >
      <KanbanCard
        task={task}
        onToggleDone={(next) => onToggleDone?.(task.slug, next)}
      />
    </li>
  );
}

function DragPreviewCard({ task }: { task: KanbanTask }) {
  return (
    <div
      className={cn(
        "pointer-events-none w-72",
        "scale-[1.04] -rotate-2",
        "rounded-md ring-2 ring-primary/40 ring-offset-4 ring-offset-background/60",
        "shadow-[0_20px_60px_-12px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
      )}
    >
      <KanbanCard task={task} />
    </div>
  );
}
