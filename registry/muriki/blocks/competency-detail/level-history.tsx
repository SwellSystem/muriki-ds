"use client"

/**
 * Muriki LevelHistory — o histórico do nível de uma competência, numa linha do tempo (canvas:
 * Competencia, "Histórico do nível").
 *
 * SÓ SOBE. O mais recente em cima. O ponto de partida (cause "baseline", o primeiro nível
 * confirmado, com `from` vazio) é um quadrado cheio: o chão. Cada confirmação depois dele
 * (cause "assessment") é um círculo em contorno. Um trilho liga os marcos. Sem queda, sem número:
 * a API nunca devolve descida.
 *
 * É a forma de GET /code/evolution/level-changes?competencyId. Sem nenhum marco, a frase diz que o
 * histórico começa no primeiro nível confirmado.
 */
import * as React from "react"

import { useLevelName, type Level } from "@/components/ui/level-scale"
import { formatShortDate } from "@/lib/date-format"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface LevelChange {
  from: Level | null
  to: Level
  cause: "baseline" | "assessment"
  /** ISO 8601. */
  occurredAt: string
}

export interface LevelHistoryProps {
  changes: LevelChange[]
  /** O locale do app (i18n.language), para a data. */
  locale?: string
  /** Troca "Histórico do nível"; `null` tira. */
  title?: React.ReactNode | null
  className?: string
}

export function LevelHistory({ changes, locale = "pt-BR", title, className }: LevelHistoryProps) {
  const t = useTranslate()
  const nome = useLevelName()
  const marcos = [...changes].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  return (
    <section
      data-slot="level-history"
      aria-label={typeof title === "string" ? title : t("level_history.title")}
      className={cn("flex min-w-0 flex-col gap-3 rounded-xl bg-card px-5 pt-4 pb-1.5 shadow-xs", className)}
    >
      {title === null ? null : (
        <h2 className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">{title ?? t("level_history.title")}</h2>
      )}
      {marcos.length === 0 ? (
        <p className="m-0 pb-3 text-[13px] leading-[19px] text-muted-foreground">{t("level_history.empty")}</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {marcos.map((m, i) => {
            const partida = m.cause === "baseline"
            const ultimo = i === marcos.length - 1
            return (
              <li key={`${m.occurredAt}-${m.to}`} className="grid grid-cols-[5.5rem_14px_minmax(0,1fr)] gap-3">
                <time dateTime={m.occurredAt} className="font-mono text-[11.5px] leading-5 text-muted-foreground tabular-nums">
                  {formatShortDate(m.occurredAt, locale)}
                </time>
                <span aria-hidden className="flex flex-col items-center pt-[5px]">
                  <span
                    className={cn(
                      "size-2.5 shrink-0",
                      partida ? "rounded-[2px] bg-primary" : "rounded-full bg-card shadow-[inset_0_0_0_2px_var(--primary)]"
                    )}
                  />
                  {ultimo ? null : <span className="mt-1 w-px flex-1 bg-input" />}
                </span>
                <span className="flex flex-col gap-[3px] pb-3.5">
                  <span className="text-[13.5px] leading-5 font-semibold text-foreground-strong">
                    {partida
                      ? t("level_history.baseline", { level: nome(m.to) })
                      : t("level_history.confirmed", { level: nome(m.to) })}
                  </span>
                  <span className="text-[13px] leading-[19px] text-muted-foreground">
                    {partida
                      ? t("level_history.baseline_text")
                      : m.from
                        ? t("level_history.confirmed_from", { from: nome(m.from), level: nome(m.to) })
                        : t("level_history.confirmed_text")}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
