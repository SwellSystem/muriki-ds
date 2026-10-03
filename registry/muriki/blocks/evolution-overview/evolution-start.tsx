"use client"

/**
 * Muriki EvolutionStart — o primeiro dia da Evolução (canvas: PerfilVazio), no lugar do "No tempo"
 * e da trajetória enquanto nada foi confirmado.
 *
 * Um cartão só, ao lado do "Nas trilhas": o título, a frase que diz que o histórico começa no
 * primeiro nível confirmado e o botão sólido para o primeiro exercício. É o único botão sólido da
 * tela.
 */
import * as React from "react"
import { ArrowRightIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface EvolutionStartProps {
  /** O botão, como link do roteador, ex.: <Link to="/exercises/$slug" params={…} />. */
  actionRender?: React.ReactElement
  onAction?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  actionLabel?: React.ReactNode
  className?: string
}

export function EvolutionStart({ actionRender, onAction, title, description, actionLabel, className }: EvolutionStartProps) {
  const t = useTranslate()
  const tituloId = React.useId()
  return (
    <section
      data-slot="evolution-start"
      aria-labelledby={tituloId}
      className={cn("flex min-w-0 flex-col gap-2.5 rounded-xl bg-card px-5 pt-4 pb-[18px] shadow-xs", className)}
    >
      <h2 id={tituloId} className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">
        {title ?? t("evolution_start.title")}
      </h2>
      <p className="m-0 text-[13px] leading-[19px] text-pretty text-muted-foreground">{description ?? t("evolution_start.description")}</p>
      {actionRender || onAction ? (
        <span className="pt-1">
          <Button variant="solid" size="lg" render={actionRender} nativeButton={!actionRender} onClick={onAction}>
            {actionLabel ?? t("evolution_start.action")}
            <ArrowRightIcon aria-hidden data-motion="nudge" />
          </Button>
        </span>
      ) : null}
    </section>
  )
}
