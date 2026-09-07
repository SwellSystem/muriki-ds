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
        // Os nove tons do sistema, não a escala crua do Tailwind. Cada tom
        // já tem tinta e fundo calibrados nos dois temas (L 43% / L 93,5%,
        // espelhados no escuro) — usar sky/amber/orange trazia uma segunda
        // paleta para dentro da casa e quebrava no dark.
        low: "text-tone-gray-foreground",
        medium: "text-tone-blue-foreground",
        high: "text-tone-orange-foreground",
        urgent: "text-tone-red-foreground",
      },
      variant: {
        icon: "",
        pill: "rounded-full px-2 py-0.5 ring-1 ring-inset",
      },
    },
    compoundVariants: [
      // Fundo do próprio tom + fio interno na cor do ponto daquele tom.
      { variant: "pill", level: "low", class: "bg-tone-gray ring-tone-gray-dot/25" },
      { variant: "pill", level: "medium", class: "bg-tone-blue ring-tone-blue-dot/25" },
      { variant: "pill", level: "high", class: "bg-tone-orange ring-tone-orange-dot/25" },
      { variant: "pill", level: "urgent", class: "bg-tone-red ring-tone-red-dot/30" },
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
