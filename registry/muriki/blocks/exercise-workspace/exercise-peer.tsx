"use client"

/**
 * O Peer dentro do exercício (canvas: ExercicioPeerTestes, ExercicioPeerFaixa, ExercicioPeerRetorno).
 *
 * NÃO É CHAT. O Peer acompanha (o app manda POST .../events: tests_ran, paused, unit_closed) e
 * fala pouco: na maior parte do tempo a decisão da API é `none`. Quando fala, é uma frase no lugar
 * onde a coisa aconteceu, e o próximo degrau é um botão, nunca um campo de texto: pergunta, depois
 * dica, depois explicação. O gabarito nunca.
 *
 * - `PeerNote`: a fala. `inline` mora no painel de testes, embaixo do teste que falhou
 *   (ExerciseTests `peerNote`); `bar` é a faixa acima da barra de status do editor
 *   (ExerciseEditor `peerBar`), para o que veio de uma pausa.
 * - `PeerStatus`: "Peer acompanhando" no cabeçalho, ao lado do "salvo há" (ExerciseHeader
 *   `peerStatus`); "Peer em pausa" quando a cota ou o orçamento acabou.
 * - `PeerHistory`: o cartão "Peer neste exercício" na coluna da esquerda, embaixo das dicas, com o
 *   que ele disse, do mais recente para o mais antigo.
 *
 * O retorno do envio (ExerciseSubmission) fala com a mesma voz e o mesmo ícone, para a IA ser uma
 * presença só. Regras: swell-docs/muriki-api/features/code/execucao-no-browser-e-peer.md.
 */
import { ChatTeardropTextIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { CARTAO, ExerciseSection, TITULO_DO_CARTAO, type ExerciseCollapsibleProps } from "./exercise-workspace"

/** O `action` de POST .../events, menos `none` e `off_topic`, que não viram fala na tela. */
export type PeerAction = "question" | "hint" | "explanation" | "answer"

/** O `kind` do evento que fez o Peer falar. */
export type PeerTrigger = "tests_ran" | "paused" | "unit_closed" | "question"

export interface PeerMessage {
  id: string
  action: PeerAction
  text: string
  /** ISO 8601. */
  at: string
  trigger?: PeerTrigger
}

/** O ícone do Peer, num círculo com o fio da marca. */
export function PeerAvatar({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary)_30%,transparent)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <ChatTeardropTextIcon style={{ width: size * 0.6, height: size * 0.6 }} />
    </span>
  )
}

const PROXIMO: Partial<Record<PeerAction, "hint" | "explanation">> = { question: "hint", hint: "explanation" }

export interface PeerNoteProps {
  message: Pick<PeerMessage, "action" | "text">
  /** `inline` no painel de testes; `bar` na faixa acima da barra de status. */
  variant?: "inline" | "bar"
  /** O próximo degrau: "Me dá uma dica" depois da pergunta, "Explica" depois da dica. Sem isto, some. */
  onEscalate?: (next: "hint" | "explanation") => void
  escalating?: boolean
  /** "Entendi": guarda a fala no histórico e tira daqui. */
  onDismiss?: () => void
  className?: string
}

export function PeerNote({ message, variant = "inline", onEscalate, escalating, onDismiss, className }: PeerNoteProps) {
  const t = useTranslate()
  const proximo = PROXIMO[message.action]
  const barra = variant === "bar"
  const acao =
    "-ml-1.5 h-6 rounded-md px-1.5 text-[12.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:opacity-55"
  const acoes =
    (proximo && onEscalate) || onDismiss ? (
      <span className={cn("flex items-center gap-3", barra ? "shrink-0 self-center" : "pt-0.5")}>
        {proximo && onEscalate ? (
          <button type="button" onClick={() => onEscalate(proximo)} disabled={escalating} className={cn(acao, "text-primary hover:underline underline-offset-[3px]")}>
            {t(`exercise_workspace.peer.escalate.${proximo}`)}
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className={cn(acao, "text-muted-foreground hover:text-foreground-strong")}>
            {t("exercise_workspace.peer.dismiss")}
          </button>
        ) : null}
      </span>
    ) : null
  return (
    <div
      role="note"
      aria-live="polite"
      data-slot="peer-note"
      data-variant={variant}
      className={cn(
        "flex items-start bg-primary-subtle",
        barra ? "gap-3 border-t border-muted px-4 py-2.5 max-sm:flex-wrap" : "gap-2 rounded-lg px-2.5 py-2",
        className
      )}
    >
      <PeerAvatar size={barra ? 22 : 18} />
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="font-mono text-[9.5px] font-medium tracking-[0.16em] text-primary uppercase">
          {t("exercise_workspace.peer.name")} · {t(`exercise_workspace.peer.action.${message.action}`)}
        </span>
        <span className={cn("text-pretty text-foreground-strong", barra ? "text-[13.5px] leading-5" : "text-[12.5px] leading-[18px]")}>
          {message.text}
        </span>
        {barra ? null : acoes}
      </div>
      {barra ? acoes : null}
    </div>
  )
}

export interface PeerStatusProps {
  /** `paused`: a cota do mês ou o orçamento acabou; o Peer volta sozinho. */
  state?: "following" | "paused"
  className?: string
}

export function PeerStatus({ state = "following", className }: PeerStatusProps) {
  const t = useTranslate()
  const pausa = state === "paused"
  return (
    <span
      data-slot="peer-status"
      className={cn("inline-flex items-center gap-1.5 text-xs", pausa ? "text-muted-foreground" : "text-primary", className)}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", pausa ? "bg-muted-foreground" : "bg-primary")} />
      {t(pausa ? "exercise_workspace.peer.paused" : "exercise_workspace.peer.following")}
    </span>
  )
}

export interface PeerHistoryProps extends ExerciseCollapsibleProps {
  /** As falas do exercício, em qualquer ordem: o cartão mostra a mais recente em cima. */
  messages: PeerMessage[]
  /** O locale do app (i18n.language), para a hora. */
  locale?: string
  className?: string
}

export function PeerHistory({ messages, locale = "pt-BR", open, defaultOpen = true, onOpenChange, className }: PeerHistoryProps) {
  const t = useTranslate()
  if (messages.length === 0) return null
  const hora = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" })
  const ordem = [...messages].sort((a, b) => b.at.localeCompare(a.at))
  return (
    <ExerciseSection
      data-slot="peer-history"
      title={t("exercise_workspace.peer.history")}
      divider={false}
      titleClassName={TITULO_DO_CARTAO}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn(CARTAO, className)}
      bodyClassName="px-4 pb-1"
    >
      <ol className="m-0 list-none p-0">
        {ordem.map((m) => (
          <li key={m.id} className="flex flex-col gap-1 border-t border-muted py-2.5">
            <span className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <time dateTime={m.at} className="font-mono tabular-nums">
                {hora.format(new Date(m.at))}
              </time>
              {m.trigger ? <span>{t(`exercise_workspace.peer.trigger.${m.trigger}`)}</span> : null}
              <Badge tone="blue" className="ml-auto">
                {t(`exercise_workspace.peer.action.${m.action}`)}
              </Badge>
            </span>
            <span className="text-[13px] leading-[19px] text-pretty text-foreground">{m.text}</span>
          </li>
        ))}
      </ol>
    </ExerciseSection>
  )
}
