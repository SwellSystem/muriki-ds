// @component-doc
// @source custom: Claude Design handoff (CTzYxZ-bWe2zLpsv3aXERg)
// @used-by —
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Equals,
  SealWarning,
  TrendDown,
  TrendUp,
  type Icon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const priorityFlagVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      level: {
        // Cores semânticas por level. Urgent usa o token `destructive`
        // da paleta; os demais usam escala Tailwind (sky/amber/orange)
        // pra diferenciar a hierarquia de forma instantânea — a paleta
        // taupe base-nova do projeto não tem equivalentes pra "info"
        // e "warning" nesse grau.
        low: "text-sky-600 dark:text-sky-400",
        medium: "text-amber-600 dark:text-amber-400",
        high: "text-orange-600 dark:text-orange-400",
        urgent: "text-destructive",
      },
      variant: {
        icon: "",
        pill: "rounded-full px-2 py-0.5 ring-1 ring-inset",
      },
    },
    compoundVariants: [
      // Fundos tintados pela cor do level + ring interno sutil.
      {
        variant: "pill",
        level: "low",
        class: "bg-sky-500/10 ring-sky-500/25",
      },
      {
        variant: "pill",
        level: "medium",
        class: "bg-amber-500/10 ring-amber-500/25",
      },
      {
        variant: "pill",
        level: "high",
        class: "bg-orange-500/12 ring-orange-500/30",
      },
      {
        variant: "pill",
        level: "urgent",
        class: "bg-destructive/12 ring-destructive/30",
      },
    ],
    defaultVariants: { level: "medium", variant: "icon" },
  }
)

export type PriorityLevel = "low" | "medium" | "high" | "urgent"

/**
 * Mapping de ícone Phosphor por level. Setas pra low/high (tendência),
 * `Equals` pra medium (neutro), `SealWarning` pra urgent (quebra o
 * pattern da escala — urgent vira categoria, não mais "uma posição").
 */
const PRIORITY_ICON: Record<PriorityLevel, Icon> = {
  low: TrendDown,
  medium: Equals,
  high: TrendUp,
  urgent: SealWarning,
}

export interface PriorityFlagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof priorityFlagVariants> {
  level: PriorityLevel
  label: string
  hideIcon?: boolean
}

export function PriorityFlag({
  level,
  variant,
  label,
  hideIcon = false,
  className,
  ...rest
}: PriorityFlagProps) {
  const filled = level === "urgent" || level === "high"
  const IconComponent = PRIORITY_ICON[level]
  return (
    <span
      className={cn(priorityFlagVariants({ level, variant }), className)}
      {...rest}
    >
      {!hideIcon && (
        <IconComponent
          size={12}
          weight={filled ? "fill" : "regular"}
          aria-hidden
        />
      )}
      {label}
    </span>
  )
}
