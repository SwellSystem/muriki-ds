"use client"

/**
 * A régua de ações do turno do assistente.
 *
 * Ela aparece no hover e some no resto do tempo — mas NUNCA com
 * `opacity-0` puro sem foco: quem navega por teclado precisa alcançar
 * copiar e regerar, e um botão invisível que ainda recebe Tab é pior que
 * botão nenhum. Daí o `group-focus-within` junto do `group-hover`, e a
 * régua fixa no touch, onde hover não existe.
 */
import * as React from "react"
import { ArrowClockwise, Check, Copy, ThumbsDown, ThumbsUp } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAiLabel } from "@/components/ai/ai-labels"

export interface AiMessageActionsProps {
  copyText?: string
  onRetry?: () => void
  onFeedback?: (kind: "good" | "bad") => void
  className?: string
}

export function AiMessageActions({
  copyText,
  onRetry,
  onFeedback,
  className,
}: AiMessageActionsProps) {
  const label = useAiLabel()
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  async function copy() {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard negado (http, permissão): o botão simplesmente não
      // confirma. Sem toast de erro — ninguém precisa de um alerta modal
      // porque um copiar falhou.
    }
  }

  const hasAny = Boolean(copyText || onRetry || onFeedback)
  if (!hasAny) return null

  return (
    <div
      data-slot="ai-message-actions"
      className={cn(
        "flex items-center gap-0.5 transition-opacity",
        "opacity-0 group-hover/ai-message:opacity-100 group-focus-within/ai-message:opacity-100",
        "[@media(hover:none)]:opacity-100",
        className
      )}
    >
      {copyText ? (
        <ActionButton
          label={copied ? label("ai.message.copied") : label("ai.message.copy")}
          onClick={copy}
        >
          {copied ? (
            <Check size={13} weight="bold" className="text-success" />
          ) : (
            <Copy size={13} weight="regular" />
          )}
        </ActionButton>
      ) : null}

      {onRetry ? (
        <ActionButton label={label("ai.message.retry")} onClick={onRetry}>
          <ArrowClockwise size={13} weight="regular" />
        </ActionButton>
      ) : null}

      {onFeedback ? (
        <>
          <ActionButton label={label("ai.message.good")} onClick={() => onFeedback("good")}>
            <ThumbsUp size={13} weight="regular" />
          </ActionButton>
          <ActionButton label={label("ai.message.bad")} onClick={() => onFeedback("bad")}>
            <ThumbsDown size={13} weight="regular" />
          </ActionButton>
        </>
      ) : null}
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={onClick}
            className="size-7 rounded-[7px] text-muted-foreground/70 hover:text-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
