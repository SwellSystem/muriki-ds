"use client"

// Portado do muriki-platform sem redesenhar: o desenho é o de lá,
// as dependências é que passaram a ser as da casa.
//
// `TaskModal` — modal de CRIAÇÃO de task em 3 modos (central, lateral, tela
// cheia), com o seletor de modo embutido no topo. É apresentacional e
// controlado: recebe `value`/`onChange` e dispara `onSubmit`. Reutilizável por
// focus e projects — cada módulo passa as opções (statuses, pessoas, projetos,
// tags) que possui e liga o submit ao seu data layer.
//
// O corpo segue a direção D aprovada no protótipo da tarefa (pílulas abaixo
// do título + trilho de propriedades ao lado, decidido pelo espaço). O seletor
// de modo vai do painel ao modal e à tela cheia; só o modal central desfoca o
// fundo (classe `muriki-task-modal-central`, CSS no item do registry).
import { CaretRight, Plus } from "@phosphor-icons/react"
import { useState, type KeyboardEvent, type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  TaskModalPropertyList,
  type TaskModalPropertyField,
} from "./task-modal-property-list"
import { TaskModalSubtasks } from "./task-modal-subtasks"
import { TaskModalTitle, type TaskTitleSize } from "./task-modal-title"
import type {
  TaskDraft,
  TaskModalMode,
  TaskModalPersonOption,
  TaskModalProjectOption,
  TaskModalStatusOption,
  TaskModalTagOption,
} from "./task-modal-types"
import { TaskModeSwitch } from "./task-mode-switch"

// O que muda toda hora vai nas pílulas; o resto, na lista curta do estreito.
const PILL_FIELDS: TaskModalPropertyField[] = [
  "status",
  "priority",
  "assignees",
  "due",
]
const SHORT_FIELDS: TaskModalPropertyField[] = [
  "start",
  "project",
  "tags",
  "points",
]

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

// Nada de pele aqui. Superfície, sombra, raio e filete vêm do Dialog e do
// Sheet da casa via `anatomy="framed"` — o que sobrou desta constante é só
// largura e altura, que são decisão DESTE modal e de mais nenhum.
//
// A versão anterior trazia `border-[0.5px] border-foreground/8`, `bg-card`,
// `shadow-2xl`, `p-0` e `rounded-none` do platform. O resultado é que o
// painel lateral do modal de task saía com raio zero e uma borda a mais por
// cima do filete do token: um Sheet que não parecia o Sheet.

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
  const [scrolled, setScrolled] = useState(false)

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
    <div
      className={cn(
        "relative z-10 flex items-center gap-2 px-5 py-2.5 pr-12 transition-shadow duration-200",
        scrolled && "shadow-[0_1px_0_var(--border)]"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Badge tone="blue" className="font-mono">
          {contextLabel ?? t("task_modal.context_default")}
        </Badge>
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
    <div className="flex items-center gap-2.5 bg-secondary/40 px-5 py-3 shadow-[inset_0_1px_0_var(--border)]">
      <label className="inline-flex cursor-pointer items-center gap-2 text-[11.5px] text-muted-foreground select-none">
        <Checkbox checked={createMore} onCheckedChange={setCreateMore} />
        {t("task_modal.create_more")}
      </label>
      <span className="flex-1" />
      <Button type="button" variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
        {t("task_modal.cancel")}
      </Button>
      <Button
        type="button"
        variant="solid"
        size="lg"
        onClick={submit}
        disabled={!canSubmit}
        data-testid="task-modal-submit"
      >
        <Plus weight="bold" data-icon="inline-start" />
        {t("task_modal.create")}
      </Button>
    </div>
  )

  // ── corpo (direção D aprovada em prototipos/tarefa-v2) ──────────────────
  // Um corpo só para os três modos; quem decide o desenho é o ESPAÇO, por
  // container query, e não o modo: a partir de 760px de corpo aparece o
  // trilho com todas as propriedades (modal central e tela cheia); mais
  // estreito (painel), o trilho some e vira uma lista curta abaixo das
  // pílulas, só com o que as pílulas não têm.
  //
  // As pílulas (status, prioridade, responsáveis, prazo) repetem o trilho de
  // propósito: o que muda toda hora fica à mão, logo abaixo do título. É o
  // mesmo `value`, então mudar num lugar muda no outro.
  //
  // Cada coluna rola sozinha; a moldura fica parada. O cabeçalho ganha o
  // filete só quando a coluna principal saiu do topo.
  const propertyProps = {
    value,
    onChange,
    statuses,
    people,
    projects,
    tags,
    showPoints,
    requireStatus,
    requirePriority,
    requireDueDate,
    dueDateError,
  }

  const body = (titleSize: TaskTitleSize) => (
    <div className="@container/task flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 @min-[760px]/task:grid-cols-[minmax(0,1fr)_clamp(280px,30%,330px)]">
        <div
          className="muriki-scroll min-h-0 overflow-x-hidden overflow-y-auto pb-6"
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        >
          <div className="mx-auto w-full max-w-[760px]">
            <TaskModalTitle
              value={value.title}
              onChange={(next) => onChange({ title: next })}
              slug={slug}
              size={titleSize}
            />
            <TaskModalPropertyList
              {...propertyProps}
              variant="pills"
              fields={PILL_FIELDS}
            />
            <div className="@min-[760px]/task:hidden">
              <TaskModalPropertyList
                {...propertyProps}
                fields={SHORT_FIELDS}
              />
            </div>
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
        </div>
        <aside
          aria-label={t("task_modal.properties")}
          className="muriki-scroll hidden min-h-0 overflow-y-auto bg-sunken/60 shadow-[inset_1px_0_0_var(--border)] @min-[760px]/task:block"
        >
          <p className="px-5 pt-4 pb-1 font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
            {t("task_modal.properties")}
          </p>
          <TaskModalPropertyList {...propertyProps} />
        </aside>
      </div>
    </div>
  )

  const a11yTitle = t("task_modal.a11y_title")
  const a11yDescription = t("task_modal.a11y_description")

  // ── drawer (lateral) → Sheet da casa (Base UI) ──────────────────────────
  if (mode === "drawer") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          anatomy="framed"
          className="sm:max-w-[468px]"
          data-testid="task-modal-drawer"
        >
          <SheetTitle className="sr-only">{a11yTitle}</SheetTitle>
          <SheetDescription className="sr-only">
            {a11yDescription}
          </SheetDescription>
          <ModalShell onKeyDown={handleKeyDown}>
            {header}
            {body("mid")}
            {footer}
          </ModalShell>
        </SheetContent>
      </Sheet>
    )
  }

  // ── central / full → Dialog da casa (Base UI) ───────────────────────────
  const isFull = mode === "full"
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        anatomy="framed"
        fullscreen={isFull}
        className={
          isFull
            ? undefined
            : "muriki-task-modal-central max-h-[86vh] sm:max-w-[min(980px,calc(100vw-2rem))]"
        }
        data-testid={isFull ? "task-modal-full" : "task-modal-central"}
      >
        <DialogTitle className="sr-only">{a11yTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {a11yDescription}
        </DialogDescription>
        <ModalShell onKeyDown={handleKeyDown}>
          {header}
          {body(isFull ? "huge" : "big")}
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
