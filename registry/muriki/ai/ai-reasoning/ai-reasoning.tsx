"use client"

/**
 * Muriki AI — Raciocínio.
 *
 * O RACIOCÍNIO AFUNDA. Ele usa `--sunken`, a única superfície do tema que é
 * mais escura que o fundo NOS DOIS temas (o `--muted` não serve: no dark ele
 * é mais claro que o card e o relevo inverteria). Isso não é escolha de cor,
 * é semântica: a resposta é a página, o pensamento fica abaixo dela. Nada
 * que o modelo pensou compete com o que ele respondeu.
 *
 * E é a única peça do muriki-ds-ai que usa o ÂMBAR do sistema, no ponto que
 * pulsa enquanto pensa. O accent é o recurso mais escasso do tema — gastar
 * ele aqui só funciona porque é um ponto de 5px que apaga sozinho quando o
 * raciocínio termina. Ele nunca fica aceso na tela parada.
 *
 * Fechado por padrão, sempre. Quem quer ver o raciocínio abre; quem quer a
 * resposta não deveria precisar rolar por cima dela.
 */
import * as React from "react"
import { CaretRight } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useAiLabel } from "@/components/ai/ai-labels"

export interface AiReasoningProps {
  /** O texto do raciocínio. */
  children?: React.ReactNode
  /** Ainda pensando: ponto pulsando, sem duração, sem contagem final. */
  thinking?: boolean
  /** Segundos que o raciocínio levou. Só aparece depois que termina. */
  seconds?: number
  /** Começa aberto. Default: fechado — ver o cabeçalho deste arquivo. */
  defaultOpen?: boolean
  /** Controlado: quando vier, `defaultOpen` é ignorado. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function AiReasoning({
  children,
  thinking = false,
  seconds,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: AiReasoningProps) {
  const label = useAiLabel()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const bodyId = React.useId()

  function toggle() {
    const next = !open
    if (!isControlled) setUncontrolled(next)
    onOpenChange?.(next)
  }

  const title = thinking ? label("ai.reasoning.thinking") : label("ai.reasoning.done")

  return (
    <section
      data-slot="ai-reasoning"
      data-thinking={thinking || undefined}
      className={cn("w-full max-w-[68ch] overflow-hidden rounded-md bg-sunken", className)}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label={open ? label("ai.reasoning.collapse") : label("ai.reasoning.expand")}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left",
          "transition-colors hover:bg-foreground/[0.03]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none"
        )}
      >
        <CaretRight
          aria-hidden
          size={11}
          weight="bold"
          className={cn(
            "shrink-0 text-muted-foreground/50 transition-transform duration-150",
            open && "rotate-90"
          )}
        />
        {thinking ? (
          <span
            aria-hidden
            className="size-[5px] shrink-0 rounded-full bg-accent motion-safe:animate-pulse"
          />
        ) : null}
        <span className="text-[11.5px] font-medium tracking-tight text-muted-foreground">
          {title}
        </span>
        {!thinking && seconds !== undefined ? (
          <span className="font-mono text-[10px] text-muted-foreground/45 tabular-nums">
            {label("ai.reasoning.duration", { seconds })}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={bodyId}
          data-slot="ai-reasoning-body"
          className={cn(
            "px-3 pt-0.5 pb-3 pl-[25px]",
            // Um grau abaixo do corpo da resposta em tamanho e em tinta. O
            // raciocínio é rascunho, e rascunho não se lê com o mesmo peso
            // do texto final.
            "text-[12.5px] leading-relaxed whitespace-pre-wrap text-muted-foreground/80",
            "[&_p+p]:mt-2"
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}
