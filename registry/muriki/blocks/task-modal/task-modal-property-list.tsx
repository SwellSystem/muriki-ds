// Portado do muriki-platform sem redesenhar.
import {
  CalendarBlank,
  CalendarCheck,
  CellSignalFull,
  Check,
  ChartBar,
  CircleHalf,
  Plus,
  Stack,
  Tag as TagIcon,
  User,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"

import {
  PriorityFlag,
  type PriorityLevel,
} from "@/components/blocks/priority-flag/priority-flag"
import { StatusPill } from "@/components/blocks/status-pill/status-pill"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import type {
  TaskDraft,
  TaskModalPersonOption,
  TaskModalPriority,
  TaskModalProjectOption,
  TaskModalStatusOption,
  TaskModalTagOption,
} from "./task-modal-types"
import { TASK_POINT_OPTIONS } from "./task-modal-types"

const PRIORITY_ORDER: TaskModalPriority[] = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]

const cellClass =
  "inline-flex min-h-[26px] max-w-full items-center gap-1.5 rounded-sm border border-transparent px-2 py-0.5 text-[12.5px] text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

const ghostTriggerClass = cn(
  cellClass,
  "h-auto w-fit border-transparent bg-transparent shadow-none data-[placeholder]:text-muted-foreground/70"
)

function PropRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-[30px] grid-cols-[128px_1fr] items-start gap-2 rounded-sm transition-colors hover:bg-muted/55 md:grid-cols-[148px_1fr]">
      <div className="flex h-[30px] items-center gap-2 pl-1.5 text-[12.5px] font-medium text-muted-foreground select-none">
        <span className="flex w-[17px] shrink-0 justify-center text-muted-foreground">
          {icon}
        </span>
        {label}
      </div>
      <div className="flex min-h-[30px] min-w-0 flex-wrap items-center gap-1.5">
        {children}
      </div>
    </div>
  )
}

export interface TaskModalPropertyListProps {
  value: TaskDraft
  onChange: (patch: Partial<TaskDraft>) => void
  statuses: TaskModalStatusOption[]
  people?: TaskModalPersonOption[]
  projects?: TaskModalProjectOption[]
  tags?: TaskModalTagOption[]
  showPoints?: boolean
  requireStatus?: boolean
  requirePriority?: boolean
  requireDueDate?: boolean
  dueDateError?: string | null
}

/**
 * Lista de propriedades estilo Notion. Cada linha é label (ícone) + controle.
 * Linhas de Projeto/Tags/Estimativa só aparecem quando as opções
 * correspondentes são fornecidas pelo consumidor — é assim que focus
 * (pessoal) e projects (equipe) reaproveitam o mesmo componente.
 */
export function TaskModalPropertyList({
  value,
  onChange,
  statuses,
  people,
  projects,
  tags,
  showPoints = false,
  requireStatus = false,
  requirePriority = false,
  requireDueDate = false,
  dueDateError = null,
}: TaskModalPropertyListProps) {
  const t = useTranslate()

  const currentStatus = statuses.find((status) => status.id === value.statusId)
  const selectedPeople = (people ?? []).filter((person) =>
    value.assigneeIds.includes(person.id)
  )
  const selectedTags = (tags ?? []).filter((tag) =>
    value.tagIds.includes(tag.id)
  )

  const toggleAssignee = (id: string) => {
    const next = value.assigneeIds.includes(id)
      ? value.assigneeIds.filter((assigneeId) => assigneeId !== id)
      : [...value.assigneeIds, id]
    onChange({ assigneeIds: next })
  }

  const toggleTag = (id: string) => {
    const next = value.tagIds.includes(id)
      ? value.tagIds.filter((tagId) => tagId !== id)
      : [...value.tagIds, id]
    onChange({ tagIds: next })
  }

  return (
    <div
      className="flex flex-col gap-0.5 px-5 py-2"
      data-testid="task-modal-properties"
    >
      {/* Status */}
      <PropRow
        icon={<CircleHalf size={15} />}
        label={t("task_modal.props.status")}
      >
        <Select
          value={value.statusId.length === 0 ? null : value.statusId}
          onValueChange={(next) => onChange({ statusId: next ?? "" })}
        >
          <SelectTrigger
            className={cn(
              ghostTriggerClass,
              requireStatus &&
                value.statusId.length === 0 &&
                "border-destructive/50 bg-destructive/5"
            )}
            aria-label={t("task_modal.props.status")}
            aria-invalid={
              requireStatus && value.statusId.length === 0 ? true : undefined
            }
            aria-errormessage={
              requireStatus && value.statusId.length === 0
                ? "task-modal-status-error"
                : undefined
            }
          >
            <span className="inline-flex items-center gap-1.5">
              {currentStatus ? (
                <StatusPill
                  status={currentStatus.kind}
                  label={currentStatus.name}
                />
              ) : (
                <span className="text-muted-foreground/70">
                  {t("task_modal.props.empty")}
                </span>
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
        {requireStatus && value.statusId.length === 0 && (
          <p
            id="task-modal-status-error"
            role="alert"
            className="mt-1 text-xs text-destructive"
          >
            {t("task_modal.props.status_required")}
          </p>
        )}
      </PropRow>

      {/* Priority */}
      <PropRow
        icon={<CellSignalFull size={15} />}
        label={t("task_modal.props.priority")}
      >
        <Select
          value={value.priority}
          onValueChange={(next) =>
            onChange({ priority: next as TaskModalPriority })
          }
        >
          <SelectTrigger
            className={cn(
              ghostTriggerClass,
              requirePriority &&
                value.priority === "none" &&
                "border-destructive/50 bg-destructive/5"
            )}
            aria-label={t("task_modal.props.priority")}
            aria-invalid={
              requirePriority && value.priority === "none" ? true : undefined
            }
          >
            <span className="inline-flex items-center gap-1.5">
              {value.priority === "none" ? (
                <span className="text-muted-foreground/70">
                  {t("task_modal.priority.none")}
                </span>
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
      </PropRow>

      {/* Assignees */}
      {people !== undefined && (
        <PropRow
          icon={<User size={15} />}
          label={t("task_modal.props.assignees")}
        >
          <Popover>
            <PopoverTrigger
              className={cn(cellClass, "cursor-pointer")}
              aria-label={t("task_modal.props.assignees")}
            >
              {selectedPeople.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                  <Plus size={14} aria-hidden />
                  {t("task_modal.props.empty")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center">
                    {selectedPeople.slice(0, 4).map((person) => (
                      <Avatar
                        key={person.id}
                        className="-ml-1.5 size-5 ring-2 ring-card first:ml-0"
                      >
                        <AvatarFallback className="bg-primary text-[9px] text-primary-foreground">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </span>
                  {selectedPeople.length === 1 && (
                    <span className="truncate">{selectedPeople[0]?.name}</span>
                  )}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 gap-0.5 p-1.5">
              {(people ?? []).length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t("task_modal.props.no_people")}
                </p>
              )}
              {(people ?? []).map((person) => {
                const active = value.assigneeIds.includes(person.id)
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleAssignee(person.id)}
                    className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-muted"
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="bg-primary text-[9px] text-primary-foreground">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate">
                      {person.name}
                    </span>
                    {active && (
                      <Check size={14} className="text-primary" aria-hidden />
                    )}
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>
        </PropRow>
      )}

      {/* Start date */}
      <PropRow
        icon={<CalendarCheck size={15} />}
        label={t("task_modal.props.start")}
      >
        <input
          type="date"
          value={value.startDate ?? ""}
          onChange={(event) =>
            onChange({
              startDate:
                event.currentTarget.value.length === 0
                  ? null
                  : event.currentTarget.value,
            })
          }
          aria-label={t("task_modal.props.start")}
          className={cn(cellClass, "cursor-pointer font-mono text-[12px]")}
        />
      </PropRow>

      {/* Due date */}
      <PropRow
        icon={<CalendarBlank size={15} />}
        label={t("task_modal.props.due")}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <input
            type="date"
            value={value.dueDate ?? ""}
            onChange={(event) =>
              onChange({
                dueDate:
                  event.currentTarget.value.length === 0
                    ? null
                    : event.currentTarget.value,
              })
            }
            aria-label={t("task_modal.props.due")}
            aria-invalid={
              (requireDueDate && value.dueDate === null) ||
              dueDateError !== null
                ? true
                : undefined
            }
            aria-describedby={
              dueDateError !== null ? "due-date-error" : undefined
            }
            required={requireDueDate}
            className={cn(
              cellClass,
              "cursor-pointer font-mono text-[12px]",
              ((requireDueDate && value.dueDate === null) ||
                dueDateError !== null) &&
                "border-destructive/50 bg-destructive/5"
            )}
          />
          {dueDateError !== null && (
            <span
              id="due-date-error"
              role="alert"
              className="pl-2 text-[11px] text-destructive"
            >
              {dueDateError}
            </span>
          )}
        </div>
      </PropRow>

      {/* Project (optional) */}
      {projects !== undefined && (
        <PropRow
          icon={<Stack size={15} />}
          label={t("task_modal.props.project")}
        >
          <Select
            value={value.projectId}
            onValueChange={(next) =>
              onChange({ projectId: next === null || next.length === 0 ? null : next })
            }
          >
            <SelectTrigger
              size="sm"
              className={ghostTriggerClass}
              aria-label={t("task_modal.props.project")}
            >
              {value.projectId === null ? (
                <span className="text-muted-foreground/70">
                  {t("task_modal.props.choose_project")}
                </span>
              ) : (
                <span>
                  {projects.find((project) => project.id === value.projectId)
                    ?.name ?? value.projectId}
                </span>
              )}
            </SelectTrigger>
            <SelectContent>
              {projects.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t("task_modal.props.no_projects")}
                </p>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </PropRow>
      )}

      {/* Tags (optional) */}
      {tags !== undefined && (
        <PropRow
          icon={<TagIcon size={15} />}
          label={t("task_modal.props.tags")}
        >
          <Popover>
            <PopoverTrigger
              className={cn(cellClass, "cursor-pointer")}
              aria-label={t("task_modal.props.tags")}
            >
              {selectedTags.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                  <Plus size={14} aria-hidden />
                  {t("task_modal.props.add_tags")}
                </span>
              ) : (
                <span className="flex flex-wrap items-center gap-1">
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} size="sm" tone="gray" className="rounded-full">
                      {tag.color !== undefined && (
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: tag.color }}
                          aria-hidden
                        />
                      )}
                      {tag.label}
                    </Badge>
                  ))}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 gap-0.5 p-1.5">
              {(tags ?? []).length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t("task_modal.props.no_tags")}
                </p>
              )}
              {(tags ?? []).map((tag) => {
                const active = value.tagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-muted"
                  >
                    {tag.color !== undefined && (
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color }}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{tag.label}</span>
                    {active && (
                      <Check size={14} className="text-primary" aria-hidden />
                    )}
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>
        </PropRow>
      )}

      {/* Estimate / points (optional) */}
      {showPoints && (
        <PropRow
          icon={<ChartBar size={15} />}
          label={t("task_modal.props.points")}
        >
          <Select
            value={value.points === null ? null : String(value.points)}
            onValueChange={(next) =>
              onChange({ points: next === null || next.length === 0 ? null : Number(next) })
            }
          >
            <SelectTrigger
              size="sm"
              className={ghostTriggerClass}
              aria-label={t("task_modal.props.points")}
            >
              {value.points === null ? (
                <span className="text-muted-foreground/70">
                  {t("task_modal.props.empty")}
                </span>
              ) : (
                <span className="font-mono">
                  {t("task_modal.props.points_value", { count: value.points })}
                </span>
              )}
            </SelectTrigger>
            <SelectContent>
              {TASK_POINT_OPTIONS.map((point) => (
                <SelectItem key={point} value={String(point)}>
                  {t("task_modal.props.points_value", { count: point })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PropRow>
      )}
    </div>
  )
}
