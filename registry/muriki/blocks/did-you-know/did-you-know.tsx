"use client"

/**
 * Muriki DidYouKnow — o "Você sabia?": uma particularidade da linguagem, curta (canvas:
 * LicaoPassoAPasso, GuiaVoceSabia).
 *
 * O MESMO CARTÃO EM TRÊS LUGARES: na lição da skill, no guia de sintaxe (junto do recurso) e,
 * quando o Peer acha a armadilha no código, como fala dele (PeerInsight, no exercise-workspace).
 * Usa o amarelo da marca (o --accent) tingindo o fundo, o brilho e o rótulo mono, para não se
 * confundir com a dica (o aviso) nem com o Peer (o azul).
 *
 * O título e o corpo vêm do pacote de conteúdo (catalog/insights), em Markdown, no idioma da
 * pessoa. O app renderiza o Markdown com o leitor dele e passa como `children`; o cartão cuida do
 * resto: parágrafos, código em linha e blocos de código no fundo afundado.
 */
import * as React from "react"
import { SparkleIcon } from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface DidYouKnowProps {
  /** O título do insight, já renderizado (pode ter código em linha). */
  title: React.ReactNode
  /** O corpo, o Markdown já renderizado pelo app. */
  children: React.ReactNode
  /** Embaixo do texto, ex.: "Ver na lição". */
  footer?: React.ReactNode
  /** Troca "Você sabia?". */
  label?: React.ReactNode
  className?: string
}

/** As cores do "Você sabia?", para quem monta outra forma dele (a fala do Peer). */
export const DID_YOU_KNOW_TONE = {
  surface: "bg-[color-mix(in_oklch,var(--accent)_14%,var(--card))]",
  ring: "shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--accent)_45%,transparent)]",
  ink: "text-tone-yellow-foreground",
}

export function DidYouKnow({ title, children, footer, label, className }: DidYouKnowProps) {
  const t = useTranslate()
  const tituloId = React.useId()
  return (
    <aside
      data-slot="did-you-know"
      aria-labelledby={tituloId}
      className={cn("flex min-w-0 flex-col gap-2 rounded-[10px] px-4 py-3.5", DID_YOU_KNOW_TONE.surface, DID_YOU_KNOW_TONE.ring, className)}
    >
      <span className={cn("flex items-center gap-2", DID_YOU_KNOW_TONE.ink)}>
        <SparkleIcon aria-hidden weight="fill" className="size-3.5" />
        <span className="font-mono text-[9.5px] font-semibold tracking-[0.16em] uppercase">{label ?? t("did_you_know.label")}</span>
      </span>
      <span id={tituloId} className="text-sm leading-5 font-semibold text-foreground-strong [&_code]:font-mono [&_code]:text-[0.92em]">
        {title}
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-col gap-2 text-[13px] leading-5 text-foreground",
          "[&_p]:m-0 [&_p]:text-pretty",
          "[&_:not(pre)>code]:rounded-[4px] [&_:not(pre)>code]:bg-sunken [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.92em]",
          "[&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-sunken [&_pre]:px-3 [&_pre]:py-2.5 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-[19px]"
        )}
      >
        {children}
      </div>
      {footer ? <div className="pt-0.5">{footer}</div> : null}
    </aside>
  )
}
