// Lista de features do card de plano. Três acentos: `check` para o que o
// plano entrega, `sparkle` para o que ele acrescenta em relação ao anterior,
// `arrow` para o que é condição e não benefício.
import { Check, Sparkle } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export type PlanFeaturesAccent = "check" | "sparkle" | "arrow"

export interface PlanFeaturesProps {
  items: string[]
  /** Título mono opcional acima da lista, ex.: "Tudo do Solo, mais". */
  title?: string
  accent?: PlanFeaturesAccent
  className?: string
}

export function PlanFeatures({
  items,
  title,
  accent = "check",
  className,
}: PlanFeaturesProps) {
  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {title ? (
        <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          {title}
        </p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "flex items-start gap-2 text-sm leading-snug",
              accent === "sparkle"
                ? "font-medium text-foreground-strong"
                : "text-foreground"
            )}
          >
            {accent === "check" ? (
              <Check
                aria-hidden
                size={14}
                weight="bold"
                className="mt-0.5 shrink-0 text-success"
              />
            ) : accent === "sparkle" ? (
              <Sparkle
                aria-hidden
                size={14}
                weight="fill"
                className="mt-0.5 shrink-0 text-primary"
              />
            ) : (
              <span
                aria-hidden
                className="mt-1 shrink-0 font-mono text-xs leading-none text-primary"
              >
                →
              </span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
