"use client"

/**
 * Muriki CompetencyPath — as etapas de uma competência nas trilhas, nível por nível (canvas:
 * Competencia, "Caminho na trilha"). A primeira peça da página da competência na Evolução.
 *
 * QUATRO MARCAS, as mesmas cores do TrackProgress. Feita (done por exercício): azul cheio com o
 * check. Pulada (done pelo exercício de entrada): o azul mais claro, com a seta. Coberta (presumed,
 * o nível da pessoa dispensa): mais clara ainda, sem ícone. Pendente (todo e diagnostic): o encaixe
 * vazio. Ao lado, a marca por escrito, porque cor sozinha não basta.
 *
 * Os quatro níveis aparecem sempre, na ordem. Nível sem etapa nas trilhas diz isso numa frase, em
 * vez de sumir: a pessoa vê que o caminho continua, só não tem conteúdo ainda.
 *
 * O app agrupa por tier as etapas do caminho da trilha (GET /code/tracks/{id}) que são desta
 * competência, com o status e o demonstratedBy como vêm. Eletiva fica de fora.
 */
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react"

import { LEVELS, useLevelName, type Level } from "@/components/ui/level-scale"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface CompetencyPathStep {
  id: string
  title: string
  /** O status do caminho da trilha. */
  status: "done" | "todo" | "presumed" | "diagnostic"
  /** Em done: "exercise" é feita, "diagnostic" é pulada pelo exercício de entrada. */
  demonstratedBy?: "exercise" | "diagnostic" | null
  /** O link do roteador para a etapa. Ganha de `href`. */
  render?: React.ReactElement
  href?: string
}

export interface CompetencyPathTier {
  tier: Level
  steps: CompetencyPathStep[]
}

export interface CompetencyPathProps {
  tiers: CompetencyPathTier[]
  /** Troca "Caminho na trilha"; `null` tira o título e a frase. */
  title?: React.ReactNode | null
  className?: string
}

type Marca = "done" | "skipped" | "covered" | "todo"

const marcaDe = (s: CompetencyPathStep): Marca =>
  s.status === "done" ? (s.demonstratedBy === "diagnostic" ? "skipped" : "done") : s.status === "presumed" ? "covered" : "todo"

const BOLINHA: Record<Marca, string> = {
  done: "bg-primary text-primary-foreground",
  skipped: "bg-primary/55 text-primary-foreground",
  covered: "bg-primary/25",
  todo: "shadow-[inset_0_0_0_1.5px_var(--input)]",
}

export function CompetencyPath({ tiers, title, className }: CompetencyPathProps) {
  const t = useTranslate()
  const nome = useLevelName()
  return (
    <section
      data-slot="competency-path"
      aria-label={typeof title === "string" ? title : t("competency_path.title")}
      className={cn("flex min-w-0 flex-col gap-1 rounded-xl bg-card px-5 pt-4 pb-[18px] shadow-xs", className)}
    >
      {title === null ? null : (
        <>
          <h2 className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">{title ?? t("competency_path.title")}</h2>
          <p className="m-0 mb-1 text-[13px] leading-[19px] text-muted-foreground">{t("competency_path.subtitle")}</p>
        </>
      )}
      {LEVELS.map((nivel) => {
        const etapas = tiers.find((g) => g.tier === nivel)?.steps ?? []
        return (
          <div key={nivel} role="group" aria-label={nome(nivel)} className="flex flex-col">
            <span className="pt-2.5 pb-1.5 font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {nome(nivel)}
            </span>
            {etapas.length === 0 ? (
              <p className="m-0 border-t border-muted pt-2.5 pb-0.5 text-[13px] leading-[19px] text-muted-foreground">
                {t("competency_path.empty_tier", { tier: nome(nivel) })}
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {etapas.map((etapa) => (
                  <li key={etapa.id} className="border-t border-muted">
                    <Etapa etapa={etapa} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}

function Etapa({ etapa }: { etapa: CompetencyPathStep }) {
  const t = useTranslate()
  const marca = marcaDe(etapa)
  const navega = !!(etapa.render || etapa.href)
  return useRender({
    render: etapa.render ?? (etapa.href ? <a href={etapa.href} /> : undefined),
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex min-h-10 items-center gap-3 py-1 text-inherit no-underline",
          navega && "-mx-2 rounded-md px-2 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        ),
      },
      {
        children: (
          <>
            <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-full", BOLINHA[marca])}>
              {marca === "done" ? <CheckIcon weight="bold" className="size-[11px]" /> : null}
              {marca === "skipped" ? <CaretRightIcon weight="bold" className="size-[11px]" /> : null}
            </span>
            <span className={cn("min-w-0 flex-1 text-[13.5px]", marca === "done" ? "text-foreground-strong" : "text-foreground")}>
              {etapa.title}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{t(`competency_path.states.${marca}`)}</span>
          </>
        ),
      }
    ),
  })
}
