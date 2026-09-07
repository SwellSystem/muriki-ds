import {
  ArrowsOutSimple,
  CalendarBlank,
  ListChecks,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react"
import { format, parse } from "date-fns"
import { enUS, es, ptBR } from "date-fns/locale"
import { useState } from "react"
import type { Locale } from "date-fns"

import {
  PriorityFlag,
  type PriorityLevel,
} from "@/components/blocks/priority-flag/priority-flag"
import { StatusPill } from "@/components/blocks/status-pill/status-pill"
import { useTranslate } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import type {
  TaskDraft,
  TaskModalPriority,
  TaskModalStatusOption,
} from "./task-modal-types"

const PRIORITY_ORDER: TaskModalPriority[] = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]

const LOCALE_MAP: Record<string, Locale> = {
  "pt-BR": ptBR,
  pt: ptBR,
  "en-US": enUS,
  en: enUS,
  "es-ES": es,
  es: es,
}

const chipTrigger =
  "inline-flex h-7 w-fit items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground shadow-none transition-colors hover:bg-secondary hover:text-foreground"

export interface TaskQuickAddProps {
  value: TaskDraft
  onChange: (patch: Partial<TaskDraft>) => void
  statuses: TaskModalStatusOption[]
  onExpand: () => void
  onCreate: () => void
  onCancel?: () => void
  onClose?: () => void
  submitting?: boolean
  requireStatus?: boolean
  requirePriority?: boolean
  /** Locale das datas. Padrão pt-BR; apps com i18n passam `i18n.language`. */
  localeTag?: string
}

export function TaskQuickAdd({
  value,
  onChange,
  statuses,
  onExpand,
  onCreate,
  onCancel,
  onClose,
  submitting = false,
  requireStatus = false,
  requirePriority = false,
  localeTag = "pt-BR",
}: TaskQuickAddProps) {
  const t = useTranslate()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const statusMissing = requireStatus && value.statusId.length === 0
  const priorityMissing = requirePriority && value.priority === "none"
  const canSubmit =
    value.title.trim().length > 0 &&
    !submitting &&
    !statusMissing &&
    !priorityMissing
  const currentStatus = statuses.find((status) => status.id === value.statusId)
  // O bloco não conhece o i18n do app: a locale de data vem por prop, com
  // pt-BR como padrão. Quem tem i18next passa `i18n.language` aqui.
  const locale = LOCALE_MAP[localeTag] ?? ptBR

  const selectedDate =
    value.dueDate !== null
      ? parse(value.dueDate, "yyyy-MM-dd", new Date())
      : undefined

  const dueDateLabel =
    selectedDate !== undefined
      ? format(selectedDate, "d MMM", { locale })
      : t("task_modal.quick_add.set_due")

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[var(--radius-float)] bg-popover shadow-[var(--float)]"
      data-testid="task-quick-add"
    >
      <div className="flex items-center gap-2.5 p-3.5">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary-subtle text-primary-subtle-foreground">
          <ListChecks size={17} aria-hidden />
        </span>
        <input
          autoFocus
          value={value.title}
          onChange={(event) => onChange({ title: event.currentTarget.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) {
              event.preventDefault()
              onCreate()
            }
          }}
          placeholder={t("task_modal.quick_add.placeholder")}
          aria-label={t("task_modal.title_label")}
          className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("task_modal.quick_add.close_aria")}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X size={15} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-3.5 pb-3">
        <Select
          value={value.statusId.length === 0 ? null : value.statusId}
          onValueChange={(next) => onChange({ statusId: next ?? "" })}
        >
          <SelectTrigger
            className={cn(
              chipTrigger,
              statusMissing && "border-destructive/50 bg-destructive/5"
            )}
            aria-label={t("task_modal.props.status")}
            aria-invalid={statusMissing ? true : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              {currentStatus ? (
                <StatusPill
                  status={currentStatus.kind}
                  label={currentStatus.name}
                  size="sm"
                />
              ) : (
                t("task_modal.props.status")
              )}
            </span>
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                <StatusPill status={status.kind} label={status.name} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.priority}
          onValueChange={(next) =>
            onChange({ priority: next as TaskModalPriority })
          }
        >
          <SelectTrigger
            className={cn(
              chipTrigger,
              priorityMissing && "border-destructive/50 bg-destructive/5"
            )}
            aria-label={t("task_modal.props.priority")}
            aria-invalid={priorityMissing ? true : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              {value.priority === "none" ? (
                t("task_modal.props.priority")
              ) : (
                <PriorityFlag
                  level={value.priority as PriorityLevel}
                  label={t(`priority_flag.${value.priority}`)}
                />
              )}
            </span>
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_ORDER.map((level) => (
              <SelectItem key={level} value={level}>
                {level === "none" ? (
                  <span className="text-muted-foreground">
                    {t("task_modal.priority.none")}
                  </span>
                ) : (
                  <PriorityFlag
                    level={level as PriorityLevel}
                    label={t(`priority_flag.${level}`)}
                  />
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger
            className={cn(chipTrigger, "cursor-pointer")}
            aria-label={t("task_modal.props.due")}
          >
            <CalendarBlank size={13} aria-hidden />
            <span>{dueDateLabel}</span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onChange({
                  dueDate:
                    date !== undefined ? format(date, "yyyy-MM-dd") : null,
                })
                setDatePickerOpen(false)
              }}
              locale={locale}
            />
            {value.dueDate !== null && (
              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ dueDate: null })
                    setDatePickerOpen(false)
                  }}
                  className="w-full rounded-sm px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {t("task_modal.quick_add.clear_due")}
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="flex items-center gap-2 border-t border-dashed border-border px-3.5 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        data-testid="task-quick-add-ai"
      >
        <Sparkle
          size={15}
          weight="fill"
          aria-hidden
          className="shrink-0 text-primary"
        />
        <span className="min-w-0 flex-1 truncate">
          {t("task_modal.quick_add.ai_split")}
        </span>
        <kbd className="shrink-0 rounded-[6px] bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
          ⌘J
        </kbd>
      </button>

      <div className="flex items-center gap-2 border-t border-border bg-secondary/40 px-3.5 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={onExpand}>
          <ArrowsOutSimple data-icon="inline-start" aria-hidden />
          {t("task_modal.quick_add.add_details")}
        </Button>
        <span className="flex-1" />
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t("task_modal.cancel")}
          </Button>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <kbd className="rounded border border-border bg-background px-1.5 py-px font-mono text-[10px] leading-4">
            Esc
          </kbd>
          <span className="leading-none">
            {t("task_modal.quick_add.esc_hint")}
          </span>
        </span>
        <Button
          type="button"
          size="sm"
          onClick={onCreate}
          disabled={!canSubmit}
          data-testid="task-quick-add-submit"
        >
          <Plus weight="bold" data-icon="inline-start" aria-hidden />
          {t("task_modal.create")}
        </Button>
      </div>
    </div>
  )
}
