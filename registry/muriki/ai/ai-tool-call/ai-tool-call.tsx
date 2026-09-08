"use client"

/**
 * Muriki AI — Chamada de ferramenta.
 *
 * Afunda pelo mesmo motivo do raciocínio: é meio, não é resposta. O que muda
 * é o SELO — o nome da ferramenta usa a mesma tipografia do slug do card do
 * kanban (mono, 9,5px, tracking 0.18em, caixa alta). Não é citação: é o que
 * faz uma peça que nasceu hoje parecer da mesma casa de uma que nasceu no
 * primeiro dia. Identificador técnico no sistema tem uma forma só.
 *
 * O status vem dos nove tons do badge, não de cores inventadas aqui — azul
 * correndo, verde concluído, vermelho falhou. Mesma decisão do status-pill:
 * o mapa de estado para tom mora num lugar, e não em cada tela.
 */
import * as React from "react"
import { CaretRight, CircleNotch } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useAiLabel } from "@/components/ai/ai-labels"

export type AiToolStatus = "running" | "done" | "error"

const TOM: Record<AiToolStatus, string> = {
  running: "bg-tone-blue text-tone-blue-foreground",
  done: "bg-tone-green text-tone-green-foreground",
  error: "bg-tone-red text-tone-red-foreground",
}

export interface AiToolCallProps {
  /** Nome da ferramenta, como o modelo a chamou. */
  name: string
  status: AiToolStatus
  /** Argumentos. String já formatada ou objeto — o bloco serializa. */
  input?: unknown
  /** Retorno. Mesmo contrato do input. */
  output?: unknown
  /** Uma linha de resumo no cabeçalho ("3 arquivos", "142 linhas"). */
  summary?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

function serialize(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    // Referência circular no retorno de uma tool acontece. Melhor mostrar
    // que existe algo e não dá pra ler do que derrubar a thread inteira.
    return String(value)
  }
}

export function AiToolCall({
  name,
  status,
  input,
  output,
  summary,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: AiToolCallProps) {
  const label = useAiLabel()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const bodyId = React.useId()

  const inputText = serialize(input)
  const outputText = serialize(output)
  const hasBody = Boolean(inputText || outputText)

  function toggle() {
    if (!hasBody) return
    const next = !open
    if (!isControlled) setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <section
      data-slot="ai-tool-call"
      data-status={status}
      className={cn("w-full max-w-[68ch] overflow-hidden rounded-md bg-sunken", className)}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={hasBody ? open : undefined}
        aria-controls={hasBody ? bodyId : undefined}
        // Sem corpo não há o que abrir: o cabeçalho vira legenda, e legenda
        // não recebe foco nem cursor de clique.
        disabled={!hasBody}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
          hasBody ? "transition-colors hover:bg-foreground/[0.03]" : "cursor-default"
        )}
      >
        {hasBody ? (
          <CaretRight
            aria-hidden
            size={11}
            weight="bold"
            className={cn(
              "shrink-0 text-muted-foreground/50 transition-transform duration-150",
              open && "rotate-90"
            )}
          />
        ) : (
          <span aria-hidden className="w-[11px] shrink-0" />
        )}

        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-[3px] px-1.5 py-0.5",
            "font-mono text-[9.5px] tracking-[0.18em] uppercase",
            TOM[status]
          )}
        >
          {name}
        </span>

        {status === "running" ? (
          <CircleNotch
            aria-hidden
            size={11}
            weight="bold"
            className="shrink-0 text-muted-foreground/50 motion-safe:animate-spin"
          />
        ) : null}

        <span className="truncate text-[11.5px] text-muted-foreground/70">
          {summary ?? label(`ai.tool.${status}`)}
        </span>
      </button>

      {hasBody && open ? (
        <div id={bodyId} data-slot="ai-tool-call-body" className="space-y-2 px-3 pb-3 pl-[25px]">
          {inputText ? <Pane title={label("ai.tool.input")} body={inputText} /> : null}
          {outputText ? <Pane title={label("ai.tool.output")} body={outputText} /> : null}
        </div>
      ) : null}
    </section>
  )
}

function Pane({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[9.5px] tracking-[0.18em] text-muted-foreground/45 uppercase">
        {title}
      </p>
      {/* O bloco de código rola SOZINHO no eixo x. Um JSON de uma linha
          longa não pode empurrar a largura da thread. */}
      <pre className="muriki-scroll-x overflow-x-auto rounded-[6px] bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {body}
      </pre>
    </div>
  )
}
