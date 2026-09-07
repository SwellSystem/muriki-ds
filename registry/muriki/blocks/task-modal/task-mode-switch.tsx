// Portado do muriki-platform sem redesenhar.
import { CardsThree, FrameCorners, SidebarSimple } from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import type { TaskModalMode } from "./task-modal-types"

interface ModeOption {
  mode: TaskModalMode
  Icon: typeof CardsThree
  labelKey: string
}

const MODE_OPTIONS: ModeOption[] = [
  { mode: "central", Icon: CardsThree, labelKey: "mode.central" },
  { mode: "drawer", Icon: SidebarSimple, labelKey: "mode.drawer" },
  { mode: "full", Icon: FrameCorners, labelKey: "mode.full" },
]

export interface TaskModeSwitchProps {
  mode: TaskModalMode
  onModeChange: (mode: TaskModalMode) => void
  className?: string
}

/**
 * Seletor de apresentação que vive **dentro** do topo do modal. Cápsula com
 * fundo sutil; o ativo vira chip branco elevado + ícone `fill` na cor da marca
 * (a forma nunca muda — só preenchimento + cor sinalizam o estado), conforme
 * as iterações do design.
 */
export function TaskModeSwitch({
  mode,
  onModeChange,
  className,
}: TaskModeSwitchProps) {
  const t = useTranslate()
  return (
    <div
      role="group"
      aria-label={t("task_modal.mode.group")}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border/50 bg-muted/80 p-0.5",
        "shadow-[inset_0_1px_2px_oklch(0_0_0/0.04)]",
        className
      )}
    >
      {MODE_OPTIONS.map(({ mode: optionMode, Icon, labelKey }) => {
        const active = mode === optionMode
        const label = t(`task_modal.${labelKey}`)
        return (
          <button
            key={optionMode}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => onModeChange(optionMode)}
            className={cn(
              "inline-flex h-7 w-8 items-center justify-center rounded-full transition-all",
              "text-muted-foreground hover:text-foreground",
              "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active &&
                "bg-card text-primary shadow-[0_1px_2px_oklch(0_0_0/0.16),0_2px_7px_oklch(0_0_0/0.08)] hover:text-primary"
            )}
          >
            <Icon size={16} weight={active ? "fill" : "regular"} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
