import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Muriki Acrílico — Cartão.
 *
 * A placa grande. Mesma receita do botão (é o mesmo `.acr-pane`), raio 16
 * em vez de 12, e um eixo a mais: `interactive`. Um cartão que é link ou
 * botão inclina contra a luz no hover como a placa pequena; um cartão que
 * só apresenta conteúdo fica parado — reflexo em cartão que não faz nada é
 * promessa falsa.
 *
 * O EYEBROW é a marca tipográfica desta língua: mono, caixa alta, tracking
 * largo, tinta fraca. É o que faz um cartão de vidro parecer instrumento
 * em vez de post-it. Um por cartão, sempre em cima do título.
 *
 * SÓ FUNCIONA DENTRO DE UM <AcrylicScope> — ver o botão.
 */
const acrylicCardVariants = cva("acr-pane flex flex-col gap-5 py-5 text-[var(--acr-ink)]", {
  variants: {
    tone: {
      glass: "",
      accent: "acr-pane-accent",
    },
    interactive: {
      true: "acr-pane-interactive cursor-pointer",
      false: "",
    },
  },
  defaultVariants: {
    tone: "glass",
    interactive: false,
  },
})

function AcrylicCard({
  className,
  tone = "glass",
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof acrylicCardVariants>) {
  return (
    <div
      data-slot="acrylic-card"
      data-tone={tone}
      className={cn(acrylicCardVariants({ tone, interactive, className }))}
      {...props}
    />
  )
}

function AcrylicCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="acrylic-card-header"
      className={cn("flex flex-col gap-1.5 px-5", className)}
      {...props}
    />
  )
}

function AcrylicCardEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="acrylic-card-eyebrow"
      className={cn(
        "font-mono text-[10px] tracking-[0.18em] text-[var(--acr-ink-faint)] uppercase",
        className
      )}
      {...props}
    />
  )
}

function AcrylicCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="acrylic-card-title"
      className={cn(
        "text-[16px] leading-snug font-medium tracking-[0.005em] text-[var(--acr-ink)]",
        className
      )}
      {...props}
    />
  )
}

function AcrylicCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="acrylic-card-description"
      className={cn("text-[13px] leading-relaxed text-[var(--acr-ink-dim)]", className)}
      {...props}
    />
  )
}

function AcrylicCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="acrylic-card-content" className={cn("px-5", className)} {...props} />
}

/**
 * O rodapé tem um filete em cima: dentro do vidro a única separação
 * possível é um traço de luz, nunca uma cor de fundo diferente — trocar a
 * tinta de uma faixa quebraria a placa em duas.
 */
function AcrylicCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="acrylic-card-footer"
      className={cn(
        "flex items-center gap-2 px-5 pt-4",
        "shadow-[inset_0_1px_0_var(--acr-edge)]",
        className
      )}
      {...props}
    />
  )
}

export {
  AcrylicCard,
  AcrylicCardHeader,
  AcrylicCardEyebrow,
  AcrylicCardTitle,
  AcrylicCardDescription,
  AcrylicCardContent,
  AcrylicCardFooter,
  acrylicCardVariants,
}
