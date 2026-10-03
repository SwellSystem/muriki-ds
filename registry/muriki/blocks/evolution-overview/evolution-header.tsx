"use client"

/**
 * Muriki EvolutionHeader e EvolutionHowMeasured — o topo da Evolução do Code e o "Como o nível é
 * medido" (canvas: Main, EvolucaoNoTempo e PerfilVazio).
 *
 * O cabeçalho é o título com, ao lado, o botão que abre o painel, e embaixo a frase. O botão tem
 * contorno e o ícone de informação: solto na ponta direita, sem contorno, ele se lia como uma frase
 * (decisão do Guilherme, 2026-10-03). A frase muda no primeiro dia (sem exercício enviado): o app
 * passa a outra.
 *
 * O PAINEL EXPLICA, NÃO VENDE. É o painel lateral de conteúdo do sistema, o mesmo do Backoffice:
 * solto 8px das bordas e em faixas (floating, anatomy framed), cada parte numa seção com filete.
 * Abre do lado direito (no celular, ocupa a largura) com cinco partes
 * curtas: declarado e confirmado, só sobe, as marcas do caminho, a trajetória e "só você". É o
 * que a pessoa precisa para ler a página, na língua do produto: nada de fórmula nem de número.
 * O conteúdo vem do i18n (evolution_how.*) e pode ser trocado por `sections`.
 */
import * as React from "react"
import { InfoIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSection,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const PARTES = ["levels", "only_up", "marks", "trajectory", "only_you"] as const

export interface EvolutionHowMeasuredProps {
  /** O botão que abre. Sem isto, o botão com contorno e o ícone, "Como o nível é medido". */
  trigger?: React.ReactElement
  /** Troca as cinco partes. */
  sections?: Array<{ title: React.ReactNode; text: React.ReactNode }>
}

export function EvolutionHowMeasured({ trigger, sections }: EvolutionHowMeasuredProps) {
  const t = useTranslate()
  const partes = sections ?? PARTES.map((p) => ({ title: t(`evolution_how.${p}.title`), text: t(`evolution_how.${p}.text`) }))
  return (
    <Sheet>
      {trigger ? (
        <SheetTrigger render={trigger} />
      ) : (
        <SheetTrigger render={<Button variant="outline" size="sm" />}>
          <InfoIcon aria-hidden />
          {t("evolution_how.open")}
        </SheetTrigger>
      )}
      <SheetContent side="right" anatomy="framed" floating closeLabel={t("evolution_how.close")}>
        <SheetHeader>
          <SheetTitle>{t("evolution_how.title")}</SheetTitle>
          <SheetDescription>{t("evolution_how.description")}</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <dl className="m-0">
            {partes.map((p, i) => (
              <SheetSection key={i} className="gap-1.5">
                <dt className="text-sm font-semibold text-foreground-strong">{p.title}</dt>
                <dd className="m-0 text-[13.5px] leading-[21px] text-pretty text-muted-foreground">{p.text}</dd>
              </SheetSection>
            ))}
          </dl>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

export interface EvolutionHeaderProps {
  /** Sem isto, "Evolução". */
  title?: React.ReactNode
  /** Sem isto, a frase de sempre; no primeiro dia, passe t("evolution_header.subtitle_empty"). */
  subtitle?: React.ReactNode
  /** O "Como o nível é medido". `null` tira. */
  howMeasured?: React.ReactNode | null
  className?: string
}

export function EvolutionHeader({ title, subtitle, howMeasured, className }: EvolutionHeaderProps) {
  const t = useTranslate()
  return (
    <header data-slot="evolution-header" className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="m-0 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
          {title ?? t("evolution_header.title")}
        </h1>
        {howMeasured === null ? null : (howMeasured ?? <EvolutionHowMeasured />)}
      </div>
      <p className="m-0 max-w-[720px] text-sm leading-[21px] text-pretty text-muted-foreground">
        {subtitle ?? t("evolution_header.subtitle")}
      </p>
    </header>
  )
}
