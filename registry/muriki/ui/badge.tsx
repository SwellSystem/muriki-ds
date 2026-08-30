import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { badgeVariants } from "./badge-variants"

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  /** Ponto saturado à esquerda. Devolve a cor onde ela custa barato. */
  dot?: boolean
  /** Só em badge de filtro — o único caso em que um badge é acionável. */
  onRemove?: () => void
  /** Rótulo do botão de remover. Obrigatório quando `onRemove` é passado. */
  removeLabel?: string
}

function Badge({
  className, tone, variant, size, count, dot = false, onRemove, removeLabel, children, ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, variant, size, count }), className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "size-[5px] shrink-0 rounded-full",
            tone === "blue" && "bg-tone-blue-dot",
            tone === "cyan" && "bg-tone-cyan-dot",
            tone === "green" && "bg-tone-green-dot",
            tone === "yellow" && "bg-tone-yellow-dot",
            tone === "orange" && "bg-tone-orange-dot",
            tone === "red" && "bg-tone-red-dot",
            tone === "pink" && "bg-tone-pink-dot",
            tone === "purple" && "bg-tone-purple-dot",
            (!tone || tone === "gray") && "bg-tone-gray-dot"
          )}
        />
      ) : null}
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="-mr-0.5 ml-0.5 inline-flex opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
        >
          <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      ) : null}
    </span>
  )
}

export { Badge, badgeVariants }
