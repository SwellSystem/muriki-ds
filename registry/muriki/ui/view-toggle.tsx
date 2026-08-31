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
 * O relevo é o mesmo nos dois temas; o MEIO de produzi-lo não é.
 * O trilho usa --sunken, que é mais escuro que o fundo no claro E no
 * escuro — esse lado é simétrico de verdade.
 *
 * O cursor não: no claro ele sobe por SOMBRA, no escuro por LUZ. Sombra
 * preta sobre fundo quase preto não existe. É a única exceção legítima a
 * uma classe `dark:` no sistema — nos outros casos, precisar de `dark:`
 * quer dizer que falta um token.
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
        // Trilho AFUNDADO — a sombra interna é a mesma nos dois temas porque
        // --sunken já é mais escuro que o fundo em ambos. Sem dark: aqui.
        appearance === "default"
          ? "bg-sunken shadow-[inset_0_1px_2px_rgba(0,0,0,0.07),inset_0_0_0_1px_var(--border)]"
          // plain flutua sobre conteúdo — aí o vidro rende. Translúcido e
          // desfocado nos DOIS temas, com o mesmo anel.
          : "gap-1 bg-sunken/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.07),inset_0_0_0_1px_var(--border)] backdrop-blur-md",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {pillStyle ? (
          <motion.span
            aria-hidden="true"
            layout
            className={cn(
              // Cursor ELEVADO — e aqui a exceção que vale para todo o sistema:
              // sombra é uma linguagem de tema CLARO. Preto sobre quase-preto
              // é invisível. No escuro a elevação se expressa por LUZ: a
              // pastilha sobe de luminosidade e ganha um filete mais claro.
              "absolute top-0.5 bottom-0.5 rounded-full",
              "bg-card shadow-[0_1px_2px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.07),inset_0_0_0_1px_var(--input)]",
              "dark:bg-[oklch(0.30_0.011_250)] dark:shadow-[inset_0_0_0_1px_oklch(0.42_0.014_250)]"
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
