// Porte fiel do KanbanCard do muriki-platform (focus/overview/kanban-card.tsx):
// layout editorial — checkbox circular + selo do slug, título, descrição com
// tooltip, hairline e strip de metadata. Adaptações do POC: labels pt-BR
// fixos, `timeLabel` pré-computado e sem OriginIcon.
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PriorityFlag,
  type PriorityLevel,
} from "@/components/blocks/priority-flag/priority-flag";

export interface KanbanTask {
  slug: string;
  title: string;
  description?: string;
  priority: PriorityLevel | "none";
  /** 100 = concluída (o checkbox espelha isso, como no platform). */
  progress: number;
  /** Tempo em aberto, já formatado ("3d", "2sem", "agora"). */
  timeLabel?: string;
  statusId: string;
}

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export interface KanbanCardProps {
  task: KanbanTask;
  onToggleDone?: (next: boolean) => void;
  className?: string;
}

export function KanbanCard({ task, onToggleDone, className }: KanbanCardProps) {
  const done = task.progress === 100;
  const showPriority = task.priority !== "none";

  return (
    <article
      data-slot="kanban-card"
      className={cn(
        "group/kanban-card relative rounded-md px-3 py-3 transition-[box-shadow,transform,opacity]",
        "bg-card shadow-sm dark:bg-muted dark:shadow-md",
        "md:hover:-translate-y-px md:hover:shadow-md",
        done && "opacity-70",
        className
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <label
            className="inline-flex shrink-0 cursor-pointer items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => onToggleDone?.(e.target.checked)}
              aria-label={done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
              className={cn(
                "peer size-[14px] shrink-0 cursor-pointer appearance-none rounded-full",
                "border-[1.5px] border-muted-foreground/35 bg-transparent",
                "transition-colors",
                "checked:border-success checked:bg-success",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              )}
            />
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none -ml-[14px] size-[14px] text-white opacity-0 peer-checked:opacity-100"
              aria-hidden
            >
              <path
                d="M3.5 8.5L6.5 11.5L12.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <span
            className={cn(
              "inline-flex items-center rounded-[3px] px-1.5 py-0.5",
              "bg-muted/60 ring-1 ring-border/60 ring-inset dark:bg-background/50",
              "truncate font-mono text-[9.5px] tracking-[0.18em] uppercase tabular-nums",
              done ? "text-muted-foreground/40" : "text-muted-foreground/70"
            )}
          >
            {task.slug}
          </span>
        </div>
        {task.timeLabel ? (
          <span
            aria-label={`Aberta há ${task.timeLabel}`}
            className="shrink-0 font-mono text-[10px] text-muted-foreground/45 tabular-nums"
          >
            {task.timeLabel}
          </span>
        ) : null}
      </header>

      <div className="mt-2.5 pl-[22px]">
        <h3
          className={cn(
            "text-[14px] leading-snug font-medium tracking-tight text-foreground",
            done && "text-muted-foreground/80 line-through decoration-1"
          )}
        >
          {task.title}
        </h3>
        {task.description ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <p
                  className={cn(
                    "mt-1 cursor-default truncate text-[11.5px] leading-relaxed text-muted-foreground/60",
                    done && "text-muted-foreground/45"
                  )}
                />
              }
            >
              {task.description}
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-sm text-[11.5px] leading-relaxed whitespace-normal"
            >
              {task.description}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div aria-hidden className="mt-2.5 ml-[22px] border-t border-border/40" />

      {showPriority && (
        <footer className="mt-2 flex items-center gap-2 pl-[22px]">
          <PriorityFlag
            level={task.priority as PriorityLevel}
            variant="pill"
            className="text-[10px]"
            label={PRIORITY_LABEL[task.priority as PriorityLevel]}
          />
        </footer>
      )}
    </article>
  );
}
