// Portado do muriki-platform sem redesenhar.
import { Hash } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { useEffect, useRef } from "react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type TaskTitleSize = "mid" | "big" | "huge"

const SIZE_CLASS: Record<TaskTitleSize, string> = {
  mid: "text-xl",
  big: "text-2xl",
  huge: "text-4xl",
}

export interface TaskModalTitleProps {
  value: string
  onChange: (next: string) => void
  /** Slug canônico (ex.: `MUR-301`). `null`/undefined => badge pendente. */
  slug?: string | null
  size?: TaskTitleSize
}

/**
 * Bloco de título: badge de slug (mono; tracejado quando o ID ainda não foi
 * atribuído pelo servidor) + textarea de título que cresce com o conteúdo,
 * em fonte display (Geist).
 */
export function TaskModalTitle({
  value,
  onChange,
  slug,
  size = "big",
}: TaskModalTitleProps) {
  const t = useTranslate()
  const ref = useRef<HTMLTextAreaElement>(null)
  const pending = slug == null || slug.length === 0

  useEffect(() => {
    const el = ref.current
    if (el === null) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value, size])

  return (
    <div className="flex flex-col gap-2.5 px-5 pt-5 pb-1.5">
      <Badge
        variant={pending ? "dashed" : "soft"}
        className="w-fit font-mono tracking-tight"
        title={pending ? t("task_modal.slug.pending_hint") : t("task_modal.slug.hint")}
      >
        <Hash size={12} aria-hidden className="text-muted-foreground" />
        {pending ? t("task_modal.slug.pending") : slug}
      </Badge>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={t("task_modal.title_placeholder")}
        aria-label={t("task_modal.title_label")}
        className={cn(
          "w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-serif font-semibold tracking-tight text-foreground outline-none",
          "placeholder:text-muted-foreground/70",
          SIZE_CLASS[size]
        )}
      />
    </div>
  )
}
