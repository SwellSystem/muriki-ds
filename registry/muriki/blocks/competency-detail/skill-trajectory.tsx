"use client"

/**
 * Muriki SkillTrajectory — a mesma etapa, a primeira aprovação ao lado da mais recente (canvas:
 * Competencia e Evolução, "Trajetória").
 *
 * SEM NOTA NEM COMPARAÇÃO. São cinco medidas por escrito (tentativas, dicas, explicação, tempo e
 * conversas com o Peer), sem seta, sem verde nem vermelho: a pessoa lê o próprio caminho. A coluna
 * da mais recente vem com a tinta mais forte só porque é o agora.
 *
 * É a forma de GET /code/evolution/trajectories/{skillId}. Com uma aprovação só (`latest` null), a
 * segunda coluna vira a frase que diz que a próxima aparece ao lado. Explicação sem nota
 * (`understanding` null) é um traço; tempo sem medida (`secondsToPass` null) também, com o porquê
 * no title e para leitor de tela. Exercício que saiu do catálogo (`retired`) leva a nota.
 */
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/date-format"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface SkillTrajectoryPass {
  exercise: { slug: string; title: string; retired: boolean }
  /** ISO 8601. */
  passedAt: string
  attempts: number
  hintsRevealed: number
  /** A nota da explicação, de 0 a 2; `null` quando não houve. */
  understanding: 0 | 1 | 2 | null
  /** `null` quando o envio que passou foi a primeira atividade no exercício: não há como medir. */
  secondsToPass: number | null
  peerInteractions: number
}

export interface SkillTrajectoryProps {
  /** O nome da etapa, no selo do canto, ex.: "Closures". */
  skill: string
  first: SkillTrajectoryPass
  /** `null` com uma aprovação só. */
  latest: SkillTrajectoryPass | null
  /** O locale do app (i18n.language), para a data. */
  locale?: string
  /** Troca "Trajetória"; `null` tira o título e a frase. */
  title?: React.ReactNode | null
  className?: string
}

const MEDIDAS = ["attempts", "hints", "understanding", "time", "peer"] as const

export function SkillTrajectory({ skill, first, latest, locale = "pt-BR", title, className }: SkillTrajectoryProps) {
  const t = useTranslate()
  const valor = (p: SkillTrajectoryPass, m: (typeof MEDIDAS)[number]): React.ReactNode => {
    if (m === "attempts") return String(p.attempts)
    if (m === "hints") return String(p.hintsRevealed)
    if (m === "peer") return String(p.peerInteractions)
    if (m === "understanding") return p.understanding === null ? "—" : t("skill_trajectory.of_two", { value: p.understanding })
    if (p.secondsToPass === null)
      return (
        <span title={t("skill_trajectory.time_unknown")}>
          <span aria-hidden>—</span>
          <span className="sr-only">{t("skill_trajectory.time_unknown")}</span>
        </span>
      )
    return p.secondsToPass < 60
      ? t("skill_trajectory.seconds", { count: p.secondsToPass })
      : t("skill_trajectory.minutes", { count: Math.round(p.secondsToPass / 60) })
  }
  const colunas = latest ? "grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]"
  const cabeca = (rotulo: string, p: SkillTrajectoryPass) => (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">{rotulo}</span>
      <span className="text-[13.5px] font-medium text-foreground-strong">{p.exercise.title}</span>
      <span className="text-xs text-muted-foreground">
        <time dateTime={p.passedAt}>{formatShortDate(p.passedAt, locale)}</time>
        {p.exercise.retired ? ` · ${t("skill_trajectory.retired")}` : null}
      </span>
    </span>
  )
  return (
    <section
      data-slot="skill-trajectory"
      aria-label={typeof title === "string" ? title : t("skill_trajectory.title")}
      className={cn("flex min-w-0 flex-col gap-3.5 rounded-xl bg-card px-5 pt-4 pb-3 shadow-xs", className)}
    >
      <div className="flex items-start gap-3">
        {title === null ? (
          <span className="flex-1" />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <h2 className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">{title ?? t("skill_trajectory.title")}</h2>
            <p className="m-0 text-[13px] leading-[19px] text-muted-foreground">{t("skill_trajectory.subtitle")}</p>
          </div>
        )}
        <Badge tone="blue">{skill}</Badge>
      </div>
      <div>
        <div className={cn("grid items-end gap-3.5 pb-2.5", colunas)}>
          <span />
          {cabeca(t("skill_trajectory.first"), first)}
          {latest ? cabeca(t("skill_trajectory.latest"), latest) : null}
        </div>
        {MEDIDAS.map((m) => (
          <div key={m} className={cn("grid min-h-[38px] items-center gap-3.5 border-t border-muted", colunas)}>
            <span className="text-[13px] text-foreground">{t(`skill_trajectory.metrics.${m}`)}</span>
            <span className={cn("font-mono text-[12.5px] tabular-nums", latest ? "text-muted-foreground" : "text-foreground-strong")}>
              {valor(first, m)}
            </span>
            {latest ? (
              <span className="font-mono text-[12.5px] text-foreground-strong tabular-nums">{valor(latest, m)}</span>
            ) : null}
          </div>
        ))}
        {latest ? null : (
          <p className="m-0 border-t border-muted pt-2.5 pb-1 text-[13px] leading-[19px] text-muted-foreground">
            {t("skill_trajectory.only_one")}
          </p>
        )}
      </div>
    </section>
  )
}
