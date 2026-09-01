export interface TaskTimelineMilestone {
  id: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Optional task id to anchor the milestone to a specific row. */
  rowId?: string
  label: string
}

export type TaskTimelineZoom = "week" | "day" | "month"
