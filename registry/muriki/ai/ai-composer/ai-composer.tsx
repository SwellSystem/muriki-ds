"use client"

/**
 * Muriki AI — Composer.
 *
 * O CAMPO É UM SÓ OBJETO, e é por isso que ele não usa o Input nem o
 * Textarea do sistema. Aqueles são controles de formulário: altura fixa,
 * label ao lado, um por linha. Aqui a moldura precisa conter anexo, texto
 * que cresce e uma régua de botões — se o textarea desenhasse a própria
 * borda, veríamos duas caixas encaixadas, e o composer viraria um form.
 * Então a moldura é do <div>, e o textarea entra sem contorno nenhum.
 *
 * A superfície é `--field`, o token que já resolve a troca: no claro o campo
 * é o objeto MAIS CLARO da página; no escuro ele é um encaixe, mais escuro
 * que o card. Isso vive no tema, não numa classe `dark:` aqui.
 *
 * ENTER QUEBRA LINHA, ⌘+↵ ENVIA. É o que a dica de teclado do i18n do
 * sistema já prometia (`composer.keyboard_hint`), e é a escolha certa para
 * uma caixa onde se cola trecho de código: perder um parágrafo porque o
 * Enter enviou é pior que um atalho a mais para aprender.
 */
import * as React from "react"
import { Microphone, PaperPlaneTilt, Paperclip, Stop } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAiLabel } from "@/components/ai/ai-labels"
import {
  AiComposerAttachments,
  type AiAttachment,
} from "@/components/ai/ai-composer/ai-composer-attachments"

export interface AiComposerProps {
  value: string
  onValueChange: (value: string) => void
  onSubmit: (value: string) => void
  /** Resposta em curso: o botão de enviar vira o de parar. */
  streaming?: boolean
  onStop?: () => void
  disabled?: boolean
  placeholder?: string
  attachments?: AiAttachment[]
  onRemoveAttachment?: (id: string) => void
  onAttach?: () => void
  onVoice?: () => void
  /** Chips de sugestão, atalhos, seletor de modelo — o que o app quiser. */
  toolbarStart?: React.ReactNode
  /** Esconde a dica de atalho. Em mobile ela não faz sentido. */
  hideKeyboardHint?: boolean
  /** Teto de altura do textarea antes de virar rolagem. Default: 8 linhas. */
  maxRows?: number
  className?: string
}

export function AiComposer({
  value,
  onValueChange,
  onSubmit,
  streaming = false,
  onStop,
  disabled = false,
  placeholder,
  attachments = [],
  onRemoveAttachment,
  onAttach,
  onVoice,
  toolbarStart,
  hideKeyboardHint = false,
  maxRows = 8,
  className,
}: AiComposerProps) {
  const label = useAiLabel()
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Autogrow: zera a altura antes de medir, senão o scrollHeight só cresce e
  // o campo nunca encolhe quando o texto some.
  React.useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 21
    const max = lineHeight * maxRows
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden"
  }, [value, maxRows])

  const canSend = value.trim().length > 0 || attachments.length > 0

  function submit() {
    if (!canSend || disabled || streaming) return
    onSubmit(value)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div
      data-slot="ai-composer"
      data-streaming={streaming || undefined}
      className={cn(
        "w-full max-w-[68ch] rounded-lg bg-field",
        "shadow-[inset_0_0_0_1px_var(--input)] transition-shadow",
        // O anel de foco é da MOLDURA, não do textarea — o objeto que recebe
        // foco visualmente é a caixa inteira.
        "focus-within:shadow-[inset_0_0_0_1px_var(--ring)]",
        disabled && "opacity-60",
        className
      )}
    >
      {attachments.length > 0 ? (
        <AiComposerAttachments
          items={attachments}
          onRemove={onRemoveAttachment}
          className="px-2.5 pt-2.5"
        />
      ) : null}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={placeholder ?? label("composer.placeholder")}
        aria-label={placeholder ?? label("composer.placeholder")}
        className={cn(
          "muriki-scroll-x block w-full resize-none bg-transparent px-3.5 pt-3 pb-1",
          "text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/50",
          "outline-none disabled:cursor-not-allowed"
        )}
      />

      <div className="flex items-center gap-1 px-2 pt-0.5 pb-2">
        {onAttach ? (
          <IconAction label={label("composer.attach")} onClick={onAttach} disabled={disabled}>
            <Paperclip size={15} weight="regular" />
          </IconAction>
        ) : null}
        {onVoice ? (
          <IconAction label={label("composer.voice")} onClick={onVoice} disabled={disabled}>
            <Microphone size={15} weight="regular" />
          </IconAction>
        ) : null}

        {toolbarStart}

        <div className="ml-auto flex items-center gap-2">
          {!hideKeyboardHint && !streaming ? (
            <span
              aria-hidden
              className="hidden font-mono text-[10px] text-muted-foreground/40 sm:inline"
            >
              {label("composer.keyboard_hint")}
            </span>
          ) : null}
          {streaming ? (
            <span className="font-mono text-[10px] text-muted-foreground/50">
              {label("composer.streaming_hint")}
            </span>
          ) : null}

          {streaming && onStop ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={onStop}
              aria-label={label("composer.stop")}
              className="size-8 rounded-[8px]"
            >
              <Stop size={13} weight="fill" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="icon"
              onClick={submit}
              disabled={!canSend || disabled}
              aria-label={label("composer.send")}
              className="size-8 rounded-[8px]"
            >
              <PaperPlaneTilt size={14} weight="fill" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function IconAction({
  label: text,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
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
            onClick={onClick}
            disabled={disabled}
            aria-label={text}
            className="size-8 rounded-[8px] text-muted-foreground/70 hover:text-foreground"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  )
}
