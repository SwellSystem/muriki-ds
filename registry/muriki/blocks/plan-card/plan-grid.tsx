// A grade que o platform usa para montar a listagem — e é ela que dá a
// medida do skeleton: três cards, o do meio em destaque. Portado sem mudar.
import { Children, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface PlanGridProps {
  children: ReactNode
  className?: string
}

export function PlanGrid({ children, className }: PlanGridProps) {
  const count = Children.count(children)

  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6",
        count === 1 && "mx-auto max-w-xs grid-cols-1",
        count === 2 && "mx-auto max-w-2xl grid-cols-1 md:grid-cols-2",
        count >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}
