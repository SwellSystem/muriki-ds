// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-table.html
// @used-by src/components/blocks/task-table/task-table.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import {
  ArrowsDownUp,
  Check,
  FunnelSimple,
  MagnifyingGlass,
  Plus,
  Stack,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface TaskTableToolbarFilter {
  key: string
  label: string
  value: string
  active?: boolean
  icon?: React.ReactNode
  /** Quando presente, o chip abre um menu de opções em vez de só clicar. */
  menu?: {
    items: { id: string; label: string }[]
    selected: string
    onSelect: (id: string) => void
  }
}

export interface TaskTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: TaskTableToolbarFilter[]
  onFilterClick?: (key: string) => void
  onNewTask?: () => void
  newTaskLabel?: string
  className?: string
}

function ToolbarSeparator() {
  return (
    <span aria-hidden className="mx-[9px] text-muted-foreground/45">
      ·
    </span>
  )
}

export function TaskTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterClick,
  onNewTask,
  newTaskLabel,
  className,
}: TaskTableToolbarProps) {
  const t = useTranslate()
  const resolvedPlaceholder =
    searchPlaceholder ?? t("task_table.search_placeholder")
  const resolvedCtaLabel = newTaskLabel ?? t("task_table.cta_new_task")

  const resolvedFilters: TaskTableToolbarFilter[] = filters ?? [
    {
      key: "status",
      label: t("task_table.filter.status_label"),
      value: t("task_table.filter.status_value_active"),
      active: true,
      icon: <FunnelSimple size={13} weight="regular" />,
    },
    {
      key: "group",
      label: t("task_table.filter.group_label"),
      value: t("task_table.filter.group_value_none"),
      icon: <Stack size={13} weight="regular" />,
    },
    {
      key: "sort",
      label: t("task_table.filter.sort_label"),
      value: t("task_table.filter.sort_value_priority"),
      icon: <ArrowsDownUp size={13} weight="regular" />,
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-2 px-0.5 py-1 text-[12.5px] text-muted-foreground",
        className
      )}
    >
      <label className="inline-flex max-w-[240px] min-w-[180px] flex-1 items-center gap-1.5 sm:flex-initial">
        <span className="sr-only">{resolvedPlaceholder}</span>
        <MagnifyingGlass
          size={14}
          weight="regular"
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={resolvedPlaceholder}
          aria-label={resolvedPlaceholder}
          className={cn(
            "w-full min-w-0 truncate border-none bg-transparent py-0.5 text-[13px] text-foreground outline-none",
            "placeholder:text-muted-foreground"
          )}
        />
      </label>

      {resolvedFilters.map((filter) => {
        const chip = (
          <button
            type="button"
            onClick={
              filter.menu ? undefined : () => onFilterClick?.(filter.key)
            }
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-[5px] px-0.5 py-0.5 transition-colors",
              "text-foreground hover:text-primary",
              filter.active && "text-primary"
            )}
          >
            {filter.icon && (
              <span
                className={cn(
                  "inline-flex text-muted-foreground transition-colors group-hover:text-primary",
                  filter.active && "text-primary"
                )}
              >
                {filter.icon}
              </span>
            )}
            <span className="font-normal text-muted-foreground">
              {filter.label}
            </span>
            <span className="font-medium">{filter.value}</span>
          </button>
        )
        return (
          <React.Fragment key={filter.key}>
            <ToolbarSeparator />
            {filter.menu ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={chip} />
                <DropdownMenuContent align="start" className="w-44">
                  {filter.menu.items.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => filter.menu!.onSelect(item.id)}
                    >
                      <span className="flex-1">{item.label}</span>
                      {item.id === filter.menu!.selected ? (
                        <Check size={13} weight="bold" aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              chip
            )}
          </React.Fragment>
        )
      })}

      <span className="ml-auto" aria-hidden />

      <Button variant="solid" onClick={onNewTask} className="ml-2">
        <Plus weight="bold" aria-hidden />
        {resolvedCtaLabel}
      </Button>
    </div>
  )
}
