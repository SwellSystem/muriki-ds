// @component-doc
// @source custom: Claude Design handoff (vVSr672L5kIdNwUplOSvOQ) — components-timeline.html
// @used-by src/components/blocks/task-timeline/task-timeline.tsx
import * as React from "react"
import { useTranslate } from "@/lib/i18n"
import {
  ArrowsDownUp,
  ArrowsOutLineHorizontal,
  FunnelSimple,
  MagnifyingGlass,
  Plus,
  Stack,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import type { TaskTimelineZoom } from "./types"

export interface TaskTimelineToolbarFilter {
  key: string
  label: string
  value: string
  active?: boolean
  icon?: React.ReactNode
}

export interface TaskTimelineToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: TaskTimelineToolbarFilter[]
  onFilterClick?: (key: string) => void
  zoom?: TaskTimelineZoom
  onZoomChange?: (zoom: TaskTimelineZoom) => void
  onTodayClick?: () => void
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

export function TaskTimelineToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterClick,
  zoom = "day",
  onZoomChange,
  onTodayClick,
  onNewTask,
  newTaskLabel,
  className,
}: TaskTimelineToolbarProps) {
  const t = useTranslate()
  const resolvedPlaceholder =
    searchPlaceholder ?? t("task_timeline.search_placeholder")
  const resolvedCtaLabel = newTaskLabel ?? t("task_timeline.cta_new_task")

  const resolvedFilters: TaskTimelineToolbarFilter[] = filters ?? [
    {
      key: "status",
      label: t("task_timeline.filter.status_label"),
      value: t("task_timeline.filter.status_value_active"),
      active: true,
      icon: <FunnelSimple size={13} weight="regular" />,
    },
    {
      key: "group",
      label: t("task_timeline.filter.group_label"),
      value: t("task_timeline.filter.group_value_epic"),
      icon: <Stack size={13} weight="regular" />,
    },
    {
      key: "sort",
      label: t("task_timeline.filter.sort_label"),
      value: t("task_timeline.filter.sort_value_start"),
      icon: <ArrowsDownUp size={13} weight="regular" />,
    },
  ]

  const zoomOptions: { key: TaskTimelineZoom; label: string }[] = [
    { key: "week", label: t("task_timeline.zoom.week") },
    { key: "day", label: t("task_timeline.zoom.day") },
    { key: "month", label: t("task_timeline.zoom.month") },
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

      {resolvedFilters.map((filter) => (
        <React.Fragment key={filter.key}>
          <ToolbarSeparator />
          <button
            type="button"
            onClick={() => onFilterClick?.(filter.key)}
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
        </React.Fragment>
      ))}

      <span className="ml-auto" aria-hidden />

      <button
        type="button"
        onClick={onTodayClick}
        className={cn(
          "ml-2 inline-flex items-center gap-1.5 rounded-[5px] px-0.5 py-0.5 transition-colors",
          "text-foreground hover:text-primary"
        )}
      >
        <ArrowsOutLineHorizontal
          size={13}
          weight="regular"
          className="text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
        <span className="font-normal text-muted-foreground">
          {t("task_timeline.today_jump")}
        </span>
      </button>

      <div
        className="ml-2 inline-flex gap-0 rounded-md bg-muted p-0.5"
        role="group"
      >
        {zoomOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onZoomChange?.(option.key)}
            aria-pressed={zoom === option.key}
            className={cn(
              "rounded-[4px] px-2 py-0.5 font-normal text-muted-foreground transition-colors",
              "text-[12px]",
              zoom === option.key
                ? "bg-card text-foreground shadow-xs"
                : "hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Button variant="solid" onClick={onNewTask} className="ml-2">
        <Plus weight="bold" aria-hidden />
        {resolvedCtaLabel}
      </Button>
    </div>
  )
}
