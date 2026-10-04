"use client"

/**
 * Muriki CodeTrace — a execução passo a passo de um exemplo de lição (canvas: LicaoPassoAPasso,
 * LicaoMovel).
 *
 * Os passos vêm prontos do pacote de conteúdo (um bloco `js trace`): cada um tem a linha que vai
 * rodar (`null` no fim), as variáveis visíveis com o valor já formatado ("'Ana'", "[1, 2]", "NaN")
 * e o que a linha imprimiu. De 1 a 200 passos. O componente só mostra; nada roda aqui.
 *
 * - O código, com a linha da vez marcada (o ▸ e o fundo azul). No fim, nenhuma.
 * - As variáveis do passo, na ordem em que aparecem no exemplo. O que mudou neste passo ganha o
 *   fundo e "mudou"; a que surgiu agora, "nova". O valor vem como texto, sem conversão.
 * - O console acumulado até aqui, com a linha impressa neste passo em destaque.
 * - Recomeçar, anterior, tocar (anda sozinho e vira "pausar"), a barra de progresso e próximo. As
 *   setas do teclado também andam, com o foco no componente.
 *
 * Por container query: com espaço, variáveis e console lado a lado; estreito, empilham. Quem lê
 * com leitor de tela ouve o passo, a linha e o que mudou. O passo pode ser controlado (`step`).
 */
import * as React from "react"
import { ArrowCounterClockwiseIcon, ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface CodeTraceStep {
  /** A linha que vai rodar, contando de 1. `null` no último passo. */
  line: number | null
  /** As variáveis visíveis, com o valor já formatado. */
  state: Readonly<Record<string, string>>
  /** O que a linha imprimiu. */
  output?: readonly string[]
}

export interface CodeTraceProps {
  /** O código do bloco, como está na lição. */
  code: string
  steps: readonly CodeTraceStep[]
  /** As linhas já coloridas pelo app (uma por linha do `code`). Sem isto, o texto puro. */
  highlightedLines?: React.ReactNode[]
  /** O passo atual, contando de 0. Sem isto, o componente guarda o passo. */
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  /** O intervalo do "tocar", em ms. */
  playInterval?: number
  /** Troca "Passo a passo"; `null` tira. */
  title?: React.ReactNode | null
  className?: string
}

export function CodeTrace({
  code,
  steps,
  highlightedLines,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  playInterval = 900,
  title,
  className,
}: CodeTraceProps) {
  const t = useTranslate()
  const n = steps.length
  const [interno, setInterno] = React.useState(defaultStep)
  const [tocando, setTocando] = React.useState(false)
  const i = Math.min(Math.max(stepProp ?? interno, 0), Math.max(n - 1, 0))
  const ultimo = i >= n - 1

  const irPara = React.useCallback(
    (proximo: number) => {
      const p = Math.min(Math.max(proximo, 0), n - 1)
      if (stepProp === undefined) setInterno(p)
      onStepChange?.(p)
    },
    [n, onStepChange, stepProp]
  )

  // tocar: um passo por intervalo; para no fim. O setState mora no callback do timer, não no efeito.
  const atualRef = React.useRef(i)
  React.useEffect(() => {
    atualRef.current = i
  }, [i])
  React.useEffect(() => {
    if (!tocando) return
    const id = window.setInterval(() => {
      const proximo = atualRef.current + 1
      if (proximo >= n) {
        setTocando(false)
        return
      }
      irPara(proximo)
    }, playInterval)
    return () => window.clearInterval(id)
  }, [tocando, n, playInterval, irPara])

  if (n === 0) return null
  const atual = steps[i]
  const antes = i > 0 ? steps[i - 1].state : {}
  const linhas = code.replace(/\n$/, "").split("\n")

  const ordem: string[] = []
  for (const p of steps) for (const k of Object.keys(p.state)) if (!ordem.includes(k)) ordem.push(k)
  const vars = ordem
    .filter((k) => k in atual.state)
    .map((k) => {
      const nova = !(k in antes)
      return { nome: k, valor: atual.state[k], nova, mudou: !nova && antes[k] !== atual.state[k] }
    })
  const saida = steps.slice(0, i + 1).flatMap((p, j) => (p.output ?? []).map((texto) => ({ texto, agora: j === i })))

  const mudancas = vars.filter((v) => v.nova || v.mudou).map((v) => `${v.nome} = ${v.valor}`)
  const anuncio = [
    atual.line === null ? t("code_trace.end") : t("code_trace.announce", { step: i + 1, total: n, line: atual.line }),
    mudancas.length ? t("code_trace.announce_changed", { changes: mudancas.join(", ") }) : null,
    (atual.output ?? []).length ? t("code_trace.announce_output", { output: (atual.output ?? []).join(" ") }) : null,
  ]
    .filter(Boolean)
    .join(". ")

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      irPara(i + 1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      irPara(i - 1)
    } else if (e.key === "Home") {
      e.preventDefault()
      irPara(0)
    }
  }

  return (
    <section
      data-slot="code-trace"
      aria-label={typeof title === "string" ? title : t("code_trace.title")}
      onKeyDown={teclas}
      className={cn("@container/ct flex min-w-0 flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_0_0_1px_var(--border)]", className)}
    >
      <div className="flex items-center gap-2.5 border-b border-muted px-3.5 py-2.5">
        {title === null ? null : (
          <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {title ?? t("code_trace.title")}
          </span>
        )}
        <span className="ml-auto font-mono text-[11.5px] text-muted-foreground tabular-nums">
          {atual.line === null ? t("code_trace.end_label") : t("code_trace.step", { step: i + 1, total: n })}
        </span>
      </div>

      <div className="muriki-scroll overflow-x-auto bg-card py-2.5 font-mono text-[12.5px] leading-[22px] text-foreground">
        {linhas.map((texto, j) => {
          const agora = atual.line === j + 1
          return (
            <div key={j} aria-current={agora ? "step" : undefined} className={cn("flex min-w-max", agora && "bg-primary-subtle")}>
              <span className="flex w-10 shrink-0 items-center justify-end gap-1 pr-3 text-muted-foreground tabular-nums">
                <span aria-hidden className={cn("text-primary", agora ? "opacity-100" : "opacity-0")}>
                  ▸
                </span>
                {j + 1}
              </span>
              <span className="pr-4 whitespace-pre">{highlightedLines?.[j] ?? texto}</span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col border-t border-muted bg-rail @[28rem]/ct:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3.5 py-2.5">
          <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {t("code_trace.variables")}
          </span>
          {vars.length === 0 ? (
            <span className="text-xs text-muted-foreground">{t("code_trace.no_variables")}</span>
          ) : (
            <dl className="m-0 flex flex-col gap-0.5">
              {vars.map((v) => (
                <div
                  key={v.nome}
                  className={cn("-mx-2 flex h-[26px] items-center gap-2.5 rounded-md px-2", (v.nova || v.mudou) && "bg-primary-subtle")}
                >
                  <dt className="font-mono text-xs text-foreground">{v.nome}</dt>
                  <dd className="m-0 min-w-0 truncate font-mono text-xs font-semibold text-foreground-strong">{v.valor}</dd>
                  {v.nova || v.mudou ? (
                    <span className="ml-auto shrink-0 text-[11px] font-medium text-primary">
                      {t(v.nova ? "code_trace.new" : "code_trace.changed")}
                    </span>
                  ) : null}
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 border-t border-muted px-3.5 py-2.5 @[28rem]/ct:border-t-0 @[28rem]/ct:border-l">
          <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {t("code_trace.console")}
          </span>
          {saida.length === 0 ? (
            <span className="text-xs text-muted-foreground">{t("code_trace.no_output")}</span>
          ) : (
            <div className="flex flex-col gap-0.5 font-mono text-xs">
              {saida.map((o, j) => (
                <span
                  key={j}
                  className={cn(
                    "-mx-2 rounded-md px-2 py-0.5 break-words whitespace-pre-wrap",
                    o.agora ? "bg-primary-subtle text-foreground-strong" : "text-foreground"
                  )}
                >
                  <span aria-hidden className="text-muted-foreground">
                    ›{" "}
                  </span>
                  {o.texto}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-muted px-2.5 py-2">
        <Button variant="ghost" size="icon-sm" aria-label={t("code_trace.restart")} title={t("code_trace.restart")} onClick={() => { setTocando(false); irPara(0) }}>
          <ArrowCounterClockwiseIcon aria-hidden />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => irPara(i - 1)} disabled={i === 0}>
          <ArrowLeftIcon aria-hidden />
          <span className="max-[400px]:sr-only">{t("code_trace.previous")}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={tocando}
          onClick={() => {
            if (ultimo) irPara(0)
            setTocando(!tocando)
          }}
        >
          {tocando ? <PauseIcon aria-hidden weight="fill" /> : <PlayIcon aria-hidden weight="fill" />}
          <span className="max-[400px]:sr-only">{t(tocando ? "code_trace.pause" : "code_trace.play")}</span>
        </Button>
        <span
          role="progressbar"
          aria-label={t("code_trace.progress")}
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={i + 1}
          className="mx-2 h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-sunken"
        >
          <span
            className="block h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${n > 1 ? (i / (n - 1)) * 100 : 100}%` }}
          />
        </span>
        <Button variant="primary" size="sm" onClick={() => irPara(i + 1)} disabled={ultimo}>
          <span className="max-[400px]:sr-only">{t("code_trace.next")}</span>
          <ArrowRightIcon aria-hidden />
        </Button>
      </div>

      <span aria-live="polite" className="sr-only">
        {anuncio}
      </span>
    </section>
  )
}
