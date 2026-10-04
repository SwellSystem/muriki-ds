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
 *
 * No Starter, com `historyFrom`, a API só devolve os últimos dias: embaixo do último marco, a borda
 * "desde 28 de set."; sem marco na janela, a frase diz que nada mudou nesses dias e que o nível de
 * agora conta tudo. O aviso com o Pro é o HistoryWindowNote, embaixo do cabeçalho da página.
 */
import * as React from "react"
import { ClockIcon } from "@phosphor-icons/react"

import { useLevelName, type Level } from "@/components/ui/level-scale"
import { formatShortDate } from "@/lib/date-format"
import { Skeleton } from "@/components/ui/skeleton"
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
  /** O `historyFrom` da API no Starter (ISO 8601). `null` no Pro. */
  historyFrom?: string | null
  /** Quantos dias a janela tem (o code.history_days do plano). */
  days?: number
  className?: string
}

export function LevelHistory({ changes, locale = "pt-BR", title, historyFrom, days = 7, className }: LevelHistoryProps) {
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
      {marcos.length === 0 && historyFrom ? (
        <p className="m-0 mb-3 flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-[13px] leading-[19px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--muted)]">
          <ClockIcon aria-hidden className="mt-px size-[15px] shrink-0" />
          {t("level_history.window_empty", { count: days })}
        </p>
      ) : marcos.length === 0 ? (
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
      {marcos.length > 0 && historyFrom ? (
        <p className="m-0 -mt-1.5 pb-3 pl-[calc(5.5rem+26px+0.75rem)] font-mono text-[11px] text-muted-foreground">
          {t("history_window.since", {
            date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(historyFrom)),
          })}
        </p>
      ) : null}
    </section>
  )
}

// ── Carregando ──────────────────────────────────────────────────────────────

/** Uma linha de texto carregando: a caixa tem a altura da linha real; a barra, a da letra. */
function LinhaDeTexto({ h, className }: { h: number; className?: string }) {
  return (
    <span className="flex items-center" style={{ height: h }}>
      <Skeleton className={cn("h-[0.7em] min-h-2", className)} style={{ fontSize: h * 0.75 }} />
    </span>
  )
}

/** O LevelHistory carregando: o título e os marcos (`items`), com a data, o ponto e as duas linhas. */
export function LevelHistorySkeleton({ items = 2, className }: { items?: number; className?: string }) {
  return (
    <div aria-hidden data-slot="level-history-skeleton" className={cn("@container flex min-w-0 flex-col gap-3 rounded-xl bg-card px-5 pt-4 pb-1.5 shadow-xs", className)}>
      <LinhaDeTexto h={20} className="w-36" />
      <div>
        {Array.from({ length: items }, (_, i) => (
          <div key={i} className="grid grid-cols-[5.5rem_14px_minmax(0,1fr)] gap-3">
            <LinhaDeTexto h={20} className="w-16" />
            <span className="flex flex-col items-center pt-[5px]">
              <Skeleton className="size-2.5 shrink-0 rounded-full" />
              {i === items - 1 ? null : <span className="mt-1 w-px flex-1 bg-input" />}
            </span>
            <span className="flex flex-col gap-[3px] pb-3.5">
              <LinhaDeTexto h={20} className="w-36" />
              <LinhaDeTexto h={19} className="w-[92%]" />
              {/* o ponto de partida, o último, tem a frase mais longa: ela quebra */}
              {i === items - 1 ? <LinhaDeTexto h={19} className="w-[40%]" /> : null}
              {/* no estreito, todas quebram uma linha a mais */}
              <span className="@[30rem]:hidden">
                <LinhaDeTexto h={19} className="w-[55%]" />
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
