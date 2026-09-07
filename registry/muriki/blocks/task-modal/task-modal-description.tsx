// Portado do muriki-platform sem redesenhar.
import {
  At,
  Code,
  Link,
  ListBullets,
  ListChecks,
  TextB,
  TextItalic,
} from "@phosphor-icons/react"
import { useEffect, useRef } from "react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const TOOLBAR = [
  { Icon: TextB, key: "bold" },
  { Icon: TextItalic, key: "italic" },
  { Icon: ListBullets, key: "list" },
  { Icon: ListChecks, key: "checklist" },
  { divider: true as const, key: "div-1" },
  { Icon: Code, key: "code" },
  { Icon: Link, key: "link" },
  { Icon: At, key: "mention" },
]

export interface TaskModalDescriptionProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

/**
 * Editor de descrição: barra de formatação (decorativa nesta leva — o rich
 * text real entra com o editor de blocos) + textarea auto-crescente.
 */
export function TaskModalDescription({
  value,
  onChange,
  placeholder,
}: TaskModalDescriptionProps) {
  const t = useTranslate()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="px-5 pt-1.5 pb-5">
      <div className="mb-1.5 flex w-max items-center gap-px rounded-sm border border-border/70 bg-card p-0.5">
        {TOOLBAR.map((item) =>
          "divider" in item ? (
            <span key={item.key} className="mx-1 h-4 w-px bg-border" />
          ) : (
            <button
              key={item.key}
              type="button"
              tabIndex={-1}
              aria-label={t(`task_modal.description.${item.key}`)}
              className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.Icon size={14} aria-hidden />
            </button>
          )
        )}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder ?? t("task_modal.description.placeholder")}
        aria-label={t("task_modal.description.label")}
        className={cn(
          "min-h-[74px] w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground/90 outline-none",
          "placeholder:text-muted-foreground/70"
        )}
      />
      <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
        {t("task_modal.description.hint")}
      </p>
    </div>
  )
}
