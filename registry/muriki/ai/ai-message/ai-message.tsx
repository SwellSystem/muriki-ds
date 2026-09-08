"use client"

/**
 * Muriki AI — Turno da conversa.
 *
 * AQUI MORA A TESE DO muriki-ds-ai, e ela é uma assimetria.
 *
 * O platform é uma superfície de OBJETOS: card, linha de tabela, coluna de
 * board. Tudo tem aresta, tudo pode ser arrastado, tudo é uma coisa que você
 * manipula. Conversa não é isso. Conversa é PÁGINA.
 *
 * Então o turno do assistente NÃO TEM CARTÃO: é tinta no papel, na medida da
 * coluna de texto, sem borda e sem sombra. Ele não é um objeto na tela — ele
 * é a tela. Só o turno do usuário ganha superfície, porque a fala dele é uma
 * coisa que ele colocou ali, e ela precisa ter começo e fim visíveis.
 *
 * Essa assimetria não é decoração: é o que faz uma thread longa descansar.
 * Se os dois lados tivessem balão, a página viraria uma escada de caixas e
 * ler dez turnos seguidos cansaria. Com um lado só desenhado, o olho corre a
 * resposta como corre um texto, e volta a enxergar onde ele mesmo falou.
 *
 * O cartão do usuário usa a MESMA receita do card do kanban
 * (`bg-card shadow-sm dark:bg-muted dark:shadow-md`) — é o mesmo sistema,
 * não um balão de chat emprestado de outro lugar.
 */
import * as React from "react"
import { WarningCircle } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useAiLabel } from "@/components/ai/ai-labels"
import { AiMessageActions } from "@/components/ai/ai-message/ai-message-actions"

export type AiRole = "user" | "assistant"

export interface AiMessageProps {
  role: AiRole
  /** O corpo já renderizado — markdown, texto, o que o app decidir. */
  children?: React.ReactNode
  /**
   * Peças que nascem ANTES do corpo e pertencem ao mesmo turno: o raciocínio
   * e as chamadas de ferramenta. Ficam aqui em vez de virarem turnos soltos
   * porque a thread precisa saber que aquilo tudo é uma resposta só.
   */
  before?: React.ReactNode
  /** Resposta ainda chegando: acende o cursor e cala as ações. */
  streaming?: boolean
  /** A geração parou no meio. Troca o corpo pela linha de erro. */
  error?: boolean
  /** Identidade à esquerda do turno do assistente. */
  avatar?: React.ReactNode
  /** Nome exibido. Default: "Você" / "Muriki". */
  name?: string
  /** Carimbo já formatado ("agora", "14:32"). */
  timeLabel?: string
  /** Texto puro para o botão de copiar. Sem isso o botão não aparece. */
  copyText?: string
  onRetry?: () => void
  onFeedback?: (kind: "good" | "bad") => void
  className?: string
}

export function AiMessage({
  role,
  children,
  before,
  streaming = false,
  error = false,
  avatar,
  name,
  timeLabel,
  copyText,
  onRetry,
  onFeedback,
  className,
}: AiMessageProps) {
  const label = useAiLabel()
  const isUser = role === "user"
  const displayName = name ?? label(isUser ? "ai.role.user" : "ai.role.assistant")

  return (
    <article
      data-slot="ai-message"
      data-role={role}
      className={cn(
        "group/ai-message flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && avatar ? (
        <div className="mt-0.5 shrink-0" aria-hidden>
          {avatar}
        </div>
      ) : null}

      <div className={cn("flex min-w-0 flex-col", isUser ? "max-w-[78%] items-end" : "w-full")}>
        {/* Cabeçalho só quando há o que dizer. Nome repetido em todo turno
            de uma conversa de duas pessoas é ruído, não informação. */}
        {(!isUser && (name || timeLabel)) || (isUser && timeLabel) ? (
          <header className="mb-1.5 flex items-baseline gap-2">
            {!isUser && name ? (
              <span className="text-[12.5px] font-medium tracking-tight text-foreground-strong">
                {displayName}
              </span>
            ) : null}
            {timeLabel ? (
              <span className="font-mono text-[10px] text-muted-foreground/45 tabular-nums">
                {timeLabel}
              </span>
            ) : null}
          </header>
        ) : null}

        {before ? <div className="mb-2 w-full">{before}</div> : null}

        {isUser ? (
          <div
            data-slot="ai-message-body"
            className={cn(
              "rounded-lg px-3.5 py-2.5",
              "bg-card shadow-sm dark:bg-muted dark:shadow-md",
              "text-[14px] leading-relaxed break-words text-foreground"
            )}
          >
            {children}
          </div>
        ) : error ? (
          <p
            data-slot="ai-message-body"
            className="flex items-center gap-2 text-[13px] leading-relaxed text-destructive-subtle-foreground"
          >
            <WarningCircle aria-hidden size={15} weight="bold" className="shrink-0" />
            {label("ai.message.error")}
          </p>
        ) : (
          <div
            data-slot="ai-message-body"
            className={cn(
              // A medida. Uma resposta que atravessa 1200px não se lê — o
              // olho perde a linha na volta. 68ch é a coluna de texto do
              // sistema, e é ela que define a largura da conversa inteira.
              "max-w-[68ch] text-[14px] leading-[1.65] break-words text-foreground",
              "[&_p+p]:mt-3 [&_code]:font-mono [&_code]:text-[12.5px]",
              "[&_code]:rounded-[4px] [&_code]:bg-sunken [&_code]:px-1 [&_code]:py-0.5"
            )}
          >
            {children}
            {streaming ? <AiCaret /> : null}
          </div>
        )}

        {/* As ações só existem depois que a resposta terminou. Botão de
            copiar em cima de texto que ainda cresce copia pela metade. */}
        {!isUser && !streaming ? (
          <AiMessageActions
            copyText={copyText}
            onRetry={onRetry}
            onFeedback={onFeedback}
            className="mt-2"
          />
        ) : null}
      </div>
    </article>
  )
}

/**
 * O cursor. Fica na cor da tinta, não no accent: ele marca ONDE o texto está,
 * e um traço âmbar piscando no meio do parágrafo puxa mais atenção que a
 * própria frase. O âmbar do sistema fica reservado pro raciocínio.
 */
function AiCaret() {
  return (
    <span
      aria-hidden
      data-slot="ai-caret"
      className={cn(
        "ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] rounded-full",
        "bg-foreground/70 motion-safe:animate-pulse"
      )}
    />
  )
}
