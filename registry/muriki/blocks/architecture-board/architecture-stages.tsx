"use client"

/**
 * As etapas da migração (`answerSpec.stages`, `task: "migration"`): a faixa em cima do palco do
 * ArchitectureBoard (`stageBar`), com o desenho de partida, uma aba por etapa e "+ Etapa".
 *
 * - "Início" é o grafo inicial, só para ler: o app passa `readOnly` ao board com ela ativa.
 * - A etapa nova nasce cópia da última (migrar aos poucos é mexer pouco de uma para a outra) e vira
 *   a ativa; remover tira a ativa. Fica entre 1 e `max`: o rascunho aceita menos que `min`, o envio
 *   não, então abaixo do mínimo a faixa diz quantas faltam.
 * - O passo da etapa ativa (o que mudou desde a anterior, ou desde o início na primeira) é a conta
 *   do `stepLimit` da API (`graphStep`): a pessoa vê antes de verificar.
 * - `status` vem da última verificação, por etapa; `invalidStage` marca a etapa do `422
 *   GRAPH_INVALID` (`stageOfPath(details[0].path)`).
 * - Sem etapas, `active` é -1: só aparecem "Início" e "+ Etapa".
 */
import * as React from "react"
import { CheckIcon, LockSimpleIcon, PlusIcon, TrashIcon, WarningIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { graphStep, type ArchitectureGraphV2 } from "./architecture-graph"

export interface ArchitectureStagesProps {
  /** O desenho de partida (`starterGraph`, em v2). */
  starter: ArchitectureGraphV2
  stages: ArchitectureGraphV2[]
  onStagesChange: (stages: ArchitectureGraphV2[]) => void
  /** A aba à vista: -1 é o início; 0 em diante, a etapa. */
  active: number
  onActiveChange: (active: number) => void
  /** `answerSpec.stages`. */
  min: number
  max: number
  /**
   * O resultado da última verificação por etapa: falhou se uma regra dela falhou. Sem item, não
   * verificou. Vai pela posição atual da etapa: o app limpa a cada mudança das etapas
   * (`onStagesChange`), porque o resultado não vale mais para etapas editadas.
   */
  status?: Array<"pass" | "fail" | undefined>
  /**
   * A etapa que a API recusou (`422 GRAPH_INVALID`, `details[].path`), pela posição atual: o app
   * limpa a cada mudança das etapas (`onStagesChange`), como `status`.
   */
  invalidStage?: number
  readOnly?: boolean
  className?: string
}

const ABA =
  "flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"

export function ArchitectureStages({
  starter,
  stages,
  onStagesChange,
  active,
  onActiveChange,
  min,
  max,
  status,
  invalidStage,
  readOnly,
  className,
}: ArchitectureStagesProps) {
  const t = useTranslate()
  const lista = React.useRef<HTMLDivElement>(null)
  const abas = [-1, ...stages.map((_, i) => i)]
  const passo = active >= 0 && stages[active] ? graphStep(stages[active - 1] ?? starter, stages[active]) : null
  const faltam = Math.max(0, min - stages.length)

  const ir = (i: number) => {
    onActiveChange(i)
    lista.current?.querySelector<HTMLButtonElement>(`[data-stage="${i}"]`)?.focus()
  }
  // o botão clicado some (+ Etapa no máximo, a lixeira na última etapa): o foco vai à aba depois do render
  const focarDepois = (i: number) => {
    requestAnimationFrame(() => lista.current?.querySelector<HTMLButtonElement>(`[data-stage="${i}"]`)?.focus())
  }
  const aoTeclar = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).getAttribute("role") !== "tab") return
    const j = abas.indexOf(active)
    const proxima =
      e.key === "ArrowRight" ? abas[(j + 1) % abas.length] : e.key === "ArrowLeft" ? abas[(j - 1 + abas.length) % abas.length] : undefined
    if (proxima === undefined) return
    e.preventDefault()
    ir(proxima)
  }
  const acrescentar = () => {
    const ultima = stages[stages.length - 1] ?? starter
    onStagesChange([...stages, structuredClone(ultima)])
    onActiveChange(stages.length)
    focarDepois(stages.length)
  }
  const remover = () => {
    const proxima = Math.min(active, stages.length - 2)
    onStagesChange(stages.filter((_, i) => i !== active))
    onActiveChange(proxima)
    focarDepois(proxima)
  }

  return (
    <div
      data-slot="architecture-stages"
      className={cn("flex min-h-[41px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-muted py-1.5 pr-2 pl-3", className)}
    >
      <div className="flex min-w-0 items-center gap-1">
        <div
          ref={lista}
          role="tablist"
          aria-label={t("architecture_board.stages.label")}
          onKeyDown={aoTeclar}
          className="muriki-scroll flex min-w-0 items-center gap-1 overflow-x-auto"
        >
          {abas.map((i) => {
            const ativa = i === active
            const estado = i === invalidStage ? "invalid" : i >= 0 ? status?.[i] : undefined
            return (
              <React.Fragment key={i}>
                {i >= 0 ? (
                  <span aria-hidden className="h-px w-2.5 shrink-0 bg-input" />
                ) : null}
                <button
                  type="button"
                  role="tab"
                  data-stage={i}
                  aria-selected={ativa}
                  tabIndex={ativa ? 0 : -1}
                  title={i < 0 ? t("architecture_board.stages.starter_hint") : undefined}
                  onClick={() => onActiveChange(i)}
                  className={cn(
                    ABA,
                    ativa ? "bg-primary-subtle font-medium text-primary-subtle-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    estado === "invalid" && !ativa && "text-destructive"
                  )}
                >
                  {i < 0 ? <LockSimpleIcon aria-hidden weight="fill" className="size-[11px]" /> : null}
                  {i < 0 ? t("architecture_board.stages.starter") : t("architecture_board.stages.stage", { n: i + 1 })}
                  {estado ? <MarcaDaEtapa estado={estado} /> : null}
                </button>
              </React.Fragment>
            )
          })}
        </div>
        {!readOnly && stages.length < max ? (
          <>
            <span aria-hidden className="h-px w-2.5 shrink-0 bg-input" />
            <Button variant="ghost" size="sm" onClick={acrescentar} aria-label={t("architecture_board.stages.add_label")} className="shrink-0">
              <PlusIcon aria-hidden />
              {t("architecture_board.stages.add")}
            </Button>
          </>
        ) : null}
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 text-[11.5px] text-muted-foreground">
        {passo ? (
          <span className="font-mono tabular-nums" aria-live="polite">
            {t(active === 0 ? "architecture_board.stages.step_from_starter" : "architecture_board.stages.step", { ...passo })}
          </span>
        ) : (
          <span>{t("architecture_board.stages.starter_hint")}</span>
        )}
        {faltam > 0 ? (
          <span className="font-medium text-foreground-strong">· {t("architecture_board.stages.missing", { count: faltam })}</span>
        ) : (
          <span>· {t("architecture_board.stages.range", { min, max })}</span>
        )}
        {!readOnly && active >= 0 && stages.length > 1 ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={remover}
            aria-label={t("architecture_board.stages.remove", { n: active + 1 })}
            title={t("architecture_board.stages.remove", { n: active + 1 })}
          >
            <TrashIcon aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function MarcaDaEtapa({ estado }: { estado: "pass" | "fail" | "invalid" }) {
  const t = useTranslate()
  const Icone = estado === "pass" ? CheckIcon : estado === "fail" ? XIcon : WarningIcon
  return (
    <>
      <Icone aria-hidden weight="bold" className={cn("size-3", estado === "pass" ? "text-success" : "text-destructive")} />
      <span className="sr-only">, {t(`architecture_board.stages.state.${estado}`)}</span>
    </>
  )
}
