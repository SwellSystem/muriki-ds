"use client"

/**
 * Muriki HistoryWindowNote — o aviso da janela do Starter na Evolução (canvas: EvolucaoStarter e
 * CompetenciaStarter).
 *
 * No Starter, GET /code/evolution/level-changes, /trajectories e /trajectories/:skillId mostram só os
 * últimos dias (`historyFrom`; null no Pro). O nível, os desbloqueios e o catálogo continuam
 * calculados de tudo. Por isso é um aviso só, embaixo do cabeçalho da Evolução e da página da
 * competência, em tom de informação e não de alerta: "No Starter você vê os últimos 7 dias (desde 28
 * de set.). No Pro, o histórico inteiro." e "Ver o Pro", se o app passar. Sem `historyFrom`, nada.
 *
 * Os gráficos não repetem o aviso: LevelTimeline e LevelHistory marcam a borda com `historyFrom`, e a
 * trajetória fora da janela (404) é a SkillTrajectoryOutOfWindow.
 */
import type * as React from "react"
import { ClockIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface HistoryWindowNoteProps {
  /** O `historyFrom` da API (ISO 8601). `null` ou ausente (o Pro): o aviso não aparece. */
  historyFrom?: string | Date | null
  /** Quantos dias a janela tem (o code.history_days do plano). */
  days?: number
  /** O locale do app (i18n.language), para a data. */
  locale?: string
  /** "Ver o Pro". Sem nenhum dos dois, o link some. */
  onSeePro?: () => void
  proRender?: React.ReactElement
  className?: string
}

/** A data curta da borda da janela, sem o ano: "28 de set." em pt-BR, "Sep 28" em en. */
export function formatHistoryFrom(historyFrom: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(historyFrom))
}

export function HistoryWindowNote({ historyFrom, days = 7, locale = "pt-BR", onSeePro, proRender, className }: HistoryWindowNoteProps) {
  const t = useTranslate()
  if (!historyFrom) return null
  return (
    <div
      role="note"
      data-slot="history-window-note"
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] bg-sunken px-3.5 py-2.5", className)}
    >
      <ClockIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 text-[13.5px] leading-5 text-pretty text-foreground">
        {t("history_window.note", { count: days, date: formatHistoryFrom(historyFrom, locale) })}
      </span>
      {onSeePro || proRender ? (
        <Button variant="link" size="sm" onClick={onSeePro} render={proRender} nativeButton={!proRender} className="h-auto px-0 text-[13.5px]">
          {t("history_window.see_pro")}
        </Button>
      ) : null}
    </div>
  )
}
