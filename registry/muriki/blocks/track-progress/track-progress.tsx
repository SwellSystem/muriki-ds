"use client"

/**
 * Muriki TrackProgress — o progresso em cada trilha, numa barra de quatro partes: feitas, puladas
 * pelo exercício de entrada, cobertas pelo nível da pessoa e pendentes. É a segunda visão da Evolução do Code (canvas: "Evolução ·
 * fatia 1", o cartão "Nas trilhas").
 *
 * COBERTA NÃO É FEITA. Feita é a etapa que um exercício demonstrou (done com demonstratedBy
 * exercise): azul cheio. Pulada é a que o exercício de entrada mostrou que a pessoa já sabia (done
 * com demonstratedBy diagnostic): o mesmo azul, mais claro. Coberta é a que o nível da pessoa
 * dispensa (presumed): mais clara ainda, chão e não prática. Pendente é o encaixe vazio. Eletiva não
 * entra na conta: é leitura opcional.
 *
 * O bloco só desenha: o app conta os status do caminho da trilha (GET /code/tracks/{id}) e passa
 * os números.
 */
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Skeleton } from "@/components/ui/skeleton"

export interface TrackProgressItem {
  id: string
  title: string
  /** done com demonstratedBy "exercise". */
  done: number
  /** done com demonstratedBy "diagnostic": pulada pelo exercício de entrada. */
  skipped: number
  /** presumed: coberta pelo nível. */
  covered: number
  /** todo e diagnostic. */
  todo: number
  /** O link do roteador para a trilha, ex.: <Link to="/tracks/$id" />. Ganha de `href`. */
  render?: React.ReactElement
  href?: string
}

export interface TrackProgressProps {
  tracks: TrackProgressItem[]
  /** O título do cartão. Sem isto, "Nas trilhas"; `null` tira. */
  title?: React.ReactNode | null
  className?: string
}

const COR = {
  done: "bg-primary",
  skipped: "bg-primary/55",
  covered: "bg-primary/25",
  todo: "bg-sunken",
}

const PARTES = ["done", "skipped", "covered", "todo"] as const

export function TrackProgress({ tracks, title, className }: TrackProgressProps) {
  const t = useTranslate()
  return (
    <section
      data-slot="track-progress"
      aria-label={typeof title === "string" ? title : t("track_progress.title")}
      className={cn("flex min-w-0 flex-col rounded-xl bg-card px-5 pt-4 pb-1.5 shadow-xs", className)}
    >
      {title === null ? null : (
        <h2 className="m-0 mb-0.5 text-[15px] leading-5 font-semibold text-foreground-strong">
          {title ?? t("track_progress.title")}
        </h2>
      )}
      <ul className="m-0 flex list-none flex-col p-0">
        {tracks.map((track, i) => (
          <li key={track.id} className={cn("flex flex-col gap-2.5 py-3.5", i > 0 && "border-t border-muted")}>
            <Titulo track={track} />
            <Barra track={track} />
            <span className="flex flex-wrap gap-x-3.5 gap-y-1.5">
              {PARTES.map((parte) => (
                <span key={parte} className="inline-flex items-center gap-1.5">
                  <span aria-hidden className={cn("size-2 rounded-[2px]", COR[parte])} />
                  <span className="font-mono text-[11.5px] text-foreground-strong">{track[parte]}</span>
                  <span className="text-xs text-muted-foreground">{t(`track_progress.${parte}`)}</span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Titulo({ track }: { track: TrackProgressItem }) {
  return useRender({
    render: track.render ?? (track.href ? <a href={track.href} /> : undefined),
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "self-start text-[13.5px] font-medium text-foreground-strong no-underline",
          (track.render || track.href) &&
            "underline-offset-[3px] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        ),
      },
      { children: track.title }
    ),
  })
}

function Barra({ track }: { track: TrackProgressItem }) {
  const t = useTranslate()
  const total = track.done + track.skipped + track.covered + track.todo
  const rotulo = t("track_progress.summary", {
    done: track.done,
    skipped: track.skipped,
    covered: track.covered,
    todo: track.todo,
  })
  return (
    <span role="img" aria-label={rotulo} className="flex h-2 gap-0.5 overflow-hidden rounded-[3px]">
      {total === 0 ? <span className={cn("flex-1", COR.todo)} /> : null}
      {PARTES.map((parte) =>
        track[parte] > 0 ? (
          <span key={parte} className={cn("min-w-[3px]", COR[parte])} style={{ flex: `${track[parte]} 1 0` }} />
        ) : null
      )}
    </span>
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

export interface TrackProgressSkeletonProps {
  /** Quantas trilhas. Padrão: 3. */
  tracks?: number
  className?: string
}

/** O TrackProgress carregando: o título, e por trilha o nome, a barra e a legenda de quatro partes. */
export function TrackProgressSkeleton({ tracks = 3, className }: TrackProgressSkeletonProps) {
  return (
    <div aria-hidden data-slot="track-progress-skeleton" className={cn("flex min-w-0 flex-col rounded-xl bg-card px-5 pt-4 pb-1.5 shadow-xs", className)}>
      <div className="mb-0.5">
        <LinhaDeTexto h={20} className="w-28" />
      </div>
      {Array.from({ length: tracks }, (_, i) => (
        <div key={i} className={cn("flex flex-col gap-2.5 py-3.5", i > 0 && "border-t border-muted")}>
          <LinhaDeTexto h={20} className={["w-[52%]", "w-[64%]", "w-[44%]"][i % 3]} />
          <Skeleton className="h-2 w-full rounded-[3px]" />
          {/* as larguras das quatro partes da legenda, para quebrar onde a real quebra */}
          <span className="flex flex-wrap gap-x-3.5 gap-y-1.5">
            {["w-[64px]", "w-[214px]", "w-[156px]", "w-[86px]"].map((w, j) => (
              <LinhaDeTexto key={j} h={16} className={w} />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
