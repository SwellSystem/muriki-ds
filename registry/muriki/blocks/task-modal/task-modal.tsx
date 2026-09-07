// Portado do muriki-platform sem redesenhar: o desenho é o de lá,
// as dependências é que passaram a ser as da casa.
//
// `TaskModal` — modal de CRIAÇÃO de task em 3 modos (central, lateral, tela
// cheia), com o seletor de modo embutido no topo. É apresentacional e
// controlado: recebe `value`/`onChange` e dispara `onSubmit`. Reutilizável por
// focus e projects — cada módulo passa as opções (statuses, pessoas, projetos,
// tags) que possui e liga o submit ao seu data layer.
import { CaretRight, Check, Plus } from "@phosphor-icons/react"
import { useState, type KeyboardEvent, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { TaskModalAttachments } from "./task-modal-attachments"
import { TaskModalDescription } from "./task-modal-description"
import { TaskModalPropertyList } from "./task-modal-property-list"
import { TaskModalSubtasks } from "./task-modal-subtasks"
import { TaskModalTitle } from "./task-modal-title"
import type {
  TaskDraft,
  TaskModalMode,
  TaskModalPersonOption,
  TaskModalProjectOption,
  TaskModalStatusOption,
  TaskModalTagOption,
} from "./task-modal-types"
import { TaskModeSwitch } from "./task-mode-switch"

export interface TaskModalSubmitOptions {
  /** `true` quando o usuário marcou "Criar mais" — consumidor mantém aberto. */
  createMore: boolean
}

export interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: TaskModalMode
  onModeChange: (mode: TaskModalMode) => void
  value: TaskDraft
  onChange: (patch: Partial<TaskDraft>) => void
  statuses: TaskModalStatusOption[]
  people?: TaskModalPersonOption[]
  projects?: TaskModalProjectOption[]
  tags?: TaskModalTagOption[]
  showPoints?: boolean
  /**
   * Mostra a seção de subtasks no form de criação. Default `true`. O focus
   * passa `false`: sub-recursos só existem após o slug (são pós-criação), então
   * mostrar aqui levaria a dados digitados e descartados no submit.
   */
  showSubtasks?: boolean
  /** Mostra a seção de anexos no form de criação. Default `true` (ver acima). */
  showAttachments?: boolean
  slug?: string | null
  contextLabel?: string
  submitting?: boolean
  requireStatus?: boolean
  requirePriority?: boolean
  requireDueDate?: boolean
  dueDateError?: string | null
  onSubmit: (options: TaskModalSubmitOptions) => void | Promise<void>
}

const CARD_BASE =
  "flex flex-col gap-0 overflow-hidden border-[0.5px] border-foreground/8 bg-card p-0 text-foreground shadow-2xl"

export function TaskModal({
  open,
  onOpenChange,
  mode,
  onModeChange,
  value,
  onChange,
  statuses,
  people,
  projects,
  tags,
  showPoints,
  showSubtasks = true,
  showAttachments = true,
  slug,
  contextLabel,
  submitting = false,
  requireStatus = false,
  requirePriority = false,
  requireDueDate = false,
  dueDateError = null,
  onSubmit,
}: TaskModalProps) {
  const t = useTranslate()
  const [createMore, setCreateMore] = useState(false)

  const canSubmit =
    value.title.trim().length > 0 &&
    !submitting &&
    (!requireStatus || value.statusId.length > 0) &&
    (!requirePriority || value.priority !== "none") &&
    (!requireDueDate || (value.dueDate !== null && value.dueDate.length > 0))

  const submit = () => {
    if (!canSubmit) return
    void onSubmit({ createMore })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      submit()
    }
  }

  const header = (
    <div className="flex items-center gap-2 border-b border-border/70 px-5 py-2.5 pr-12">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="inline-flex h-[22px] items-center gap-1.5 rounded-sm bg-primary/12 px-2 font-mono text-[11px] font-semibold text-primary">
          {contextLabel ?? t("task_modal.context_default")}
        </span>
        <CaretRight
          size={11}
          aria-hidden
          className="text-muted-foreground/70"
        />
        <span className="truncate font-semibold text-foreground">
          {t("task_modal.new_task")}
        </span>
      </div>
      <TaskModeSwitch mode={mode} onModeChange={onModeChange} />
    </div>
  )

  const footer = (
    <div className="flex items-center gap-2.5 border-t border-border/70 bg-muted/40 px-5 py-3">
      <label className="inline-flex cursor-pointer items-center gap-2 text-[11.5px] text-muted-foreground select-none">
        <span
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-[5px] border-[1.5px] transition-colors",
            createMore
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-transparent"
          )}
        >
          <Check size={10} weight="bold" aria-hidden />
        </span>
        <input
          type="checkbox"
          checked={createMore}
          onChange={(event) => setCreateMore(event.currentTarget.checked)}
          className="sr-only"
        />
        {t("task_modal.create_more")}
      </label>
      <span className="flex-1" />
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        {t("task_modal.cancel")}
      </Button>
      <Button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        data-testid="task-modal-submit"
      >
        <Plus weight="bold" data-icon="inline-start" />
        {t("task_modal.create")}
      </Button>
    </div>
  )

  const sections = (titleSize: "mid" | "big" | "huge") => (
    <>
      <TaskModalTitle
        value={value.title}
        onChange={(next) => onChange({ title: next })}
        slug={slug}
        size={titleSize}
      />
      <TaskModalPropertyList
        value={value}
        onChange={onChange}
        statuses={statuses}
        people={people}
        projects={projects}
        tags={tags}
        showPoints={showPoints}
        requireStatus={requireStatus}
        requirePriority={requirePriority}
        requireDueDate={requireDueDate}
        dueDateError={dueDateError}
      />
      <TaskModalDescription
        value={value.description}
        onChange={(next) => onChange({ description: next })}
      />
      {showSubtasks && (
        <TaskModalSubtasks
          subtasks={value.subtasks}
          onChange={(next) => onChange({ subtasks: next })}
        />
      )}
      {showAttachments && (
        <TaskModalAttachments
          attachments={value.attachments}
          onRemove={(id) =>
            onChange({
              attachments: value.attachments.filter(
                (attachment) => attachment.id !== id
              ),
            })
          }
        />
      )}
    </>
  )

  // ── stacked body (central / drawer) ──────────────────────────────────────
  const stackedBody = (titleSize: "mid" | "big") => (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {sections(titleSize)}
    </div>
  )

  // ── fullscreen body (Notion page: main + side properties) ─────────────────
  const fullscreenBody = (
    <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_312px]">
      <div className="min-h-0 overflow-y-auto pb-10">
        <TaskModalTitle
          value={value.title}
          onChange={(next) => onChange({ title: next })}
          slug={slug}
          size="huge"
        />
        <TaskModalDescription
          value={value.description}
          onChange={(next) => onChange({ description: next })}
        />
        {showSubtasks && (
          <TaskModalSubtasks
            subtasks={value.subtasks}
            onChange={(next) => onChange({ subtasks: next })}
          />
        )}
        {showAttachments && (
          <TaskModalAttachments
            attachments={value.attachments}
            onRemove={(id) =>
              onChange({
                attachments: value.attachments.filter(
                  (attachment) => attachment.id !== id
                ),
              })
            }
          />
        )}
      </div>
      <aside className="min-h-0 overflow-y-auto border-t border-border/70 bg-muted/25 md:border-t-0 md:border-l">
        <p className="px-5 pt-4 pb-1 font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
          {t("task_modal.properties")}
        </p>
        <TaskModalPropertyList
          value={value}
          onChange={onChange}
          statuses={statuses}
          people={people}
          projects={projects}
          tags={tags}
          showPoints={showPoints}
          requireStatus={requireStatus}
          requirePriority={requirePriority}
          requireDueDate={requireDueDate}
          dueDateError={dueDateError}
        />
      </aside>
    </div>
  )

  const a11yTitle = t("task_modal.a11y_title")
  const a11yDescription = t("task_modal.a11y_description")

  // ── drawer (lateral) → base-ui Sheet ─────────────────────────────────────
  if (mode === "drawer") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            CARD_BASE,
            "w-full rounded-none data-[side=right]:w-full data-[side=right]:sm:max-w-[468px]"
          )}
          data-testid="task-modal-drawer"
        >
          <SheetTitle className="sr-only">{a11yTitle}</SheetTitle>
          <SheetDescription className="sr-only">
            {a11yDescription}
          </SheetDescription>
          <ModalShell onKeyDown={handleKeyDown}>
            {header}
            {stackedBody("mid")}
            {footer}
          </ModalShell>
        </SheetContent>
      </Sheet>
    )
  }

  // ── central / full → radix Dialog ────────────────────────────────────────
  const isFull = mode === "full"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          CARD_BASE,
          isFull
            ? "h-screen max-h-none w-screen max-w-none rounded-none border-0 sm:max-w-none"
            : "max-h-[86vh] w-full rounded-xl sm:max-w-[600px]"
        )}
        data-testid={isFull ? "task-modal-full" : "task-modal-central"}
      >
        <DialogTitle className="sr-only">{a11yTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {a11yDescription}
        </DialogDescription>
        <ModalShell onKeyDown={handleKeyDown}>
          {header}
          {isFull ? fullscreenBody : stackedBody("big")}
          {footer}
        </ModalShell>
      </DialogContent>
    </Dialog>
  )
}

function ModalShell({
  children,
  onKeyDown,
}: {
  children: ReactNode
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      {children}
    </div>
  )
}
