/**
 * Muriki ViewToggle — controle segmentado com pill animada.
 *
 * Uma exceção deliberada à regra do raio: o sistema reserva o pill para
 * badge e avatar, mas aqui ele é FUNCIONAL, não decorativo — o fundo é
 * um trilho e a pill é um cursor que desliza entre as opções. Quadrar
 * isso mataria a leitura do movimento.
 *
 * Acessibilidade não é opcional aqui: `role="tablist"` no container,
 * `role="tab"` + `aria-selected` em cada opção, e `ariaLabel` obrigatório
 * no tipo. Opção sem `label` visível exige `ariaLabel` próprio — ícone
 * sozinho é adivinhação, a mesma regra do RowActions.
 *
 * A pill é medida por `getBoundingClientRect` e reposicionada por
 * `ResizeObserver`, então ela acompanha mudança de largura (fullWidth no
 * mobile, label que troca por i18n) sem recalculo manual.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface ViewToggleOption<V extends string> {
  value: V
  label?: ReactNode
  icon?: ReactNode
  ariaLabel?: string
  badge?: ReactNode
}

export interface ViewToggleProps<V extends string> {
  value: V
  onChange: (next: V) => void
  options: ViewToggleOption<V>[]
  ariaLabel: string
  size?: "sm" | "md"
  appearance?: "default" | "plain"
  className?: string
  iconClassName?: string
}

export function ViewToggle<V extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
  appearance = "default",
  className,
  iconClassName,
}: ViewToggleProps<V>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Map<V, HTMLButtonElement>>(new Map())
  const [pillStyle, setPillStyle] = useState<{
    left: number
    width: number
  } | null>(null)

  const updatePill = useCallback(() => {
    const btn = buttonRefs.current.get(value)
    const container = containerRef.current
    if (!btn || !container) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    setPillStyle({
      left: bRect.left - cRect.left - container.clientLeft,
      width: bRect.width,
    })
  }, [value])

  useEffect(updatePill, [updatePill, options])

  // Recalcula a pill quando o container redimensiona (ex: fullWidth no mobile)
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(updatePill)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updatePill])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center rounded-full p-0.5",
        appearance === "default"
          ? "border border-border/60 bg-muted/60 shadow-xs"
          : "gap-1 border border-border/60 bg-background/70 shadow-xs backdrop-blur-md dark:border-border/50 dark:bg-background/25 dark:shadow-lg dark:shadow-background/20",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {pillStyle ? (
          <motion.span
            aria-hidden="true"
            layout
            className={cn(
              "absolute top-0.5 bottom-0.5 rounded-full bg-background shadow-sm",
              appearance === "plain" &&
                "dark:bg-card/70 dark:shadow-md dark:ring-1 dark:shadow-background/30 dark:ring-border/50"
            )}
            initial={false}
            animate={{
              left: pillStyle.left,
              width: pillStyle.width,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        ) : null}
      </AnimatePresence>

      {options.map((option) => {
        const selected = option.value === value
        const iconOnly = option.icon && !option.label
        return (
          <button
            key={option.value}
            ref={(el) => {
              if (el) buttonRefs.current.set(option.value, el)
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={option.ariaLabel}
            data-state={selected ? "active" : "inactive"}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0 focus-visible:outline-none",
              size === "sm"
                ? iconOnly
                  ? "size-[30px]"
                  : "h-[30px] px-3 text-xs"
                : iconOnly
                  ? "size-8 md:size-9"
                  : "h-8 px-3.5 text-[13px] md:h-9 md:px-4",
              selected
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.icon ? (
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-4 items-center justify-center [&_svg]:size-4",
                  iconClassName
                )}
              >
                {option.icon}
              </span>
            ) : null}
            {option.label}
            {option.badge}
          </button>
        )
      })}
    </div>
  )
}
