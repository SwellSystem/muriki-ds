// Portado do muriki-platform sem redesenhar.
import { ArrowUpRight, Plus, TreeStructure, X } from "@phosphor-icons/react"
import { useState } from "react"

import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { TaskModalSection } from "./task-modal-section"
import type { TaskModalSubtask } from "./task-modal-types"

export interface TaskModalSubtasksProps {
  subtasks: TaskModalSubtask[]
  onChange: (next: TaskModalSubtask[]) => void
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `st_${Math.random().toString(36).slice(2)}`
}

/**
 * Lista de subtasks inline: barra de progresso, checkbox, slug + título como
 * link e linha de adição. Tudo controlado via `onChange`.
 */
export function TaskModalSubtasks({
  subtasks,
  onChange,
}: TaskModalSubtasksProps) {
  const t = useTranslate()
  const [draft, setDraft] = useState("")

  const done = subtasks.filter((subtask) => subtask.done).length
  const total = subtasks.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  const add = () => {
    const title = draft.trim()
    if (title.length === 0) return
    onChange([...subtasks, { id: generateId(), title, done: false }])
    setDraft("")
  }

  const toggle = (id: string) => {
    onChange(
      subtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, done: !subtask.done } : subtask
      )
    )
  }

  const remove = (id: string) => {
    onChange(subtasks.filter((subtask) => subtask.id !== id))
  }

  return (
    <TaskModalSection
      icon={TreeStructure}
      title={t("task_modal.subtasks.title")}
      count={total === 0 ? undefined : total}
    >
      {total > 0 && (
        <div
          className="mb-2.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
          data-testid="task-modal-subtasks-progress"
        >
          <Progress value={percent} className="flex-1" aria-label={t("task_modal.subtasks.title")} />
          <span>{percent}%</span>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group/sub flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-secondary"
          >
            <Checkbox
              checked={subtask.done}
              onCheckedChange={() => toggle(subtask.id)}
              aria-label={
                subtask.done
                  ? t("task_modal.subtasks.mark_undone")
                  : t("task_modal.subtasks.mark_done")
              }
            />

            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              {subtask.slug != null && subtask.slug.length > 0 && (
                <Badge size="sm" className="shrink-0 font-mono tracking-tight">
                  {subtask.slug}
                </Badge>
              )}
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px] text-foreground",
                  subtask.done && "text-muted-foreground/70 line-through"
                )}
              >
                {subtask.title}
              </span>
              <ArrowUpRight
                size={12}
                aria-hidden
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/sub:opacity-70"
              />
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => remove(subtask.id)}
              aria-label={t("task_modal.subtasks.remove")}
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/sub:opacity-100 hover:bg-destructive-subtle hover:text-destructive-subtle-foreground"
            >
              <X size={13} aria-hidden />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-muted-foreground focus-within:bg-secondary">
          <Plus size={15} aria-hidden className="shrink-0" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                add()
              }
            }}
            placeholder={t("task_modal.subtasks.add_placeholder")}
            aria-label={t("task_modal.subtasks.add_placeholder")}
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>
    </TaskModalSection>
  )
}
