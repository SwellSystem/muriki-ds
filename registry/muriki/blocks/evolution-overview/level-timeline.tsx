"use client"

/**
 * Muriki LevelTimeline — a Evolução no tempo: o nível confirmado de cada competência, semana a
 * semana (canvas: EvolucaoNoTempo, "Evolução no tempo").
 *
 * QUATRO FAIXAS, UMA POR NÍVEL, e doze semanas até hoje. Cada linha começa no ponto de partida
 * da competência (o primeiro confirmado, um quadrado) e sobe a cada confirmação (um círculo). Só
 * sobe: a API nunca devolve descida. Com só o ponto de partida, a linha segue reta até hoje. Se a
 * partida veio antes da janela, a linha já entra pela borda, no nível em que estava.
 *
 * MUITAS COMPETÊNCIAS, CINCO LINHAS. O conteúdo tem dez competências, e dez linhas em quatro
 * faixas não se leem. Por isso a legenda é o seletor: cada competência é um botão; aparecem até
 * cinco linhas, cada uma com a sua cor, e começam as cinco com mudança mais recente. Passar por um
 * botão realça a linha dele. Competência sem nível confirmado fica no seletor, desligada.
 *
 * É a forma de GET /code/evolution/level-changes, agrupada por competência pelo app. Para quem
 * não enxerga o desenho, a mesma informação vai numa lista escondida.
 */
import * as React from "react"

import { LEVELS, useLevelName, type Level } from "@/components/ui/level-scale"
import { formatShortDate } from "@/lib/date-format"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface LevelTimelineChange {
  from: Level | null
  to: Level
  cause: "baseline" | "assessment"
  /** ISO 8601. */
  occurredAt: string
}

export interface LevelTimelineSeries {
  id: string
  title: string
  changes: LevelTimelineChange[]
}

export interface LevelTimelineProps {
  series: LevelTimelineSeries[]
  /** O fim da janela (ISO 8601). Sem isto, agora. */
  until?: string
  weeks?: number
  /** Quantas linhas ao mesmo tempo, até 5. */
  max?: number
  /** O locale do app (i18n.language), para os meses e as datas. */
  locale?: string
  /** Troca "Evolução no tempo"; `null` tira o título e a frase. */
  title?: React.ReactNode | null
  className?: string
}

// a primeira é o azul da marca; as outras, da paleta de gráfico (o chart-3 fica de fora: é azul)
const CORES = ["var(--primary)", "var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)"]
const ALTURA = 200
const FAIXA = ALTURA / 4
const DIA = 86_400_000

type Marca = { x: number; nivel: Level; partida: boolean }
type Desenho = { h: Array<[number, number, Level]>; v: Array<[number, Level, Level]>; marcas: Marca[] }

const tempo = (iso: string) => Date.parse(iso)
const yDe = (nivel: Level, desloca: number) => ALTURA - (LEVELS.indexOf(nivel) + 0.5) * FAIXA + desloca

function desenhar(changes: LevelTimelineChange[], ini: number, fim: number): Desenho | null {
  const x = (t: number) => ((t - ini) / (fim - ini)) * 100
  const ordem = [...changes].sort((a, b) => tempo(a.occurredAt) - tempo(b.occurredAt))
  const antes = ordem.filter((c) => tempo(c.occurredAt) <= ini)
  let dentro = ordem.filter((c) => tempo(c.occurredAt) > ini && tempo(c.occurredAt) <= fim)
  const d: Desenho = { h: [], v: [], marcas: [] }
  let nivel: Level | null = antes.length ? antes[antes.length - 1].to : null
  let atual = 0
  if (nivel === null) {
    if (dentro.length === 0) return null
    const primeiro = dentro[0]
    nivel = primeiro.to
    atual = x(tempo(primeiro.occurredAt))
    d.marcas.push({ x: atual, nivel, partida: primeiro.cause === "baseline" })
    dentro = dentro.slice(1)
  }
  for (const c of dentro) {
    const xc = x(tempo(c.occurredAt))
    d.h.push([atual, xc, nivel])
    d.v.push([xc, nivel, c.to])
    d.marcas.push({ x: xc, nivel: c.to, partida: c.cause === "baseline" })
    nivel = c.to
    atual = xc
  }
  d.h.push([atual, 100, nivel])
  return d
}

export function LevelTimeline({
  series,
  until,
  weeks = 12,
  max = 5,
  locale = "pt-BR",
  title,
  className,
}: LevelTimelineProps) {
  const t = useTranslate()
  const nome = useLevelName()
  const [hoje] = React.useState(() => Date.now())
  const fim = until ? tempo(until) : hoje
  const ini = fim - weeks * 7 * DIA
  const limite = Math.min(max, CORES.length)

  const desenhos = new Map<string, Desenho>()
  for (const s of series) {
    const d = desenhar(s.changes, ini, fim)
    if (d) desenhos.set(s.id, d)
  }
  const ultima = (s: LevelTimelineSeries) => Math.max(0, ...s.changes.map((c) => tempo(c.occurredAt)))
  const padrao = series
    .filter((s) => desenhos.has(s.id))
    .sort((a, b) => ultima(b) - ultima(a))
    .slice(0, limite)
    .map((s) => s.id)

  // cada linha guarda a cor (o lugar) enquanto está ligada; null = a escolha padrão
  const [lugares, setLugares] = React.useState<Array<string | null> | null>(null)
  const [realce, setRealce] = React.useState<string | null>(null)
  const ocupados = lugares ?? Array.from({ length: limite }, (_, i) => padrao[i] ?? null)
  const lugarDe = (id: string) => ocupados.indexOf(id)
  const cheio = !ocupados.includes(null)

  const alternar = (id: string) => {
    const proximo = [...ocupados]
    const i = proximo.indexOf(id)
    if (i >= 0) proximo[i] = null
    else {
      const livre = proximo.indexOf(null)
      if (livre < 0) return
      proximo[livre] = id
    }
    setLugares(proximo)
  }

  const ligadas = series.filter((s) => lugarDe(s.id) >= 0 && desenhos.has(s.id))
  const meses: Array<{ x: number; rotulo: string }> = []
  const mes = new Date(ini)
  mes.setDate(1)
  mes.setHours(0, 0, 0, 0)
  for (mes.setMonth(mes.getMonth() + 1); mes.getTime() <= fim; mes.setMonth(mes.getMonth() + 1)) {
    meses.push({
      x: ((mes.getTime() - ini) / (fim - ini)) * 100,
      rotulo: new Intl.DateTimeFormat(locale, { month: "short" }).format(mes).replace(/\.$/, ""),
    })
  }

  return (
    <section
      data-slot="level-timeline"
      aria-label={typeof title === "string" ? title : t("level_timeline.title")}
      className={cn("flex min-w-0 flex-col gap-3.5 rounded-xl bg-card px-5 pt-4 pb-[18px] shadow-xs", className)}
    >
      {title === null ? null : (
        <div className="flex flex-col gap-[3px]">
          <h2 className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">{title ?? t("level_timeline.title")}</h2>
          <p className="m-0 text-[13px] leading-[19px] text-pretty text-muted-foreground">{t("level_timeline.subtitle")}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div role="group" aria-label={t("level_timeline.pick")} className="flex flex-wrap gap-1.5">
          {series.map((s) => {
            const lugar = lugarDe(s.id)
            const ligada = lugar >= 0 && desenhos.has(s.id)
            const sem = !desenhos.has(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={ligada}
                disabled={sem || (!ligada && cheio)}
                title={sem ? t("level_timeline.no_level") : !ligada && cheio ? t("level_timeline.full", { count: limite }) : undefined}
                onClick={() => alternar(s.id)}
                onPointerEnter={() => ligada && setRealce(s.id)}
                onPointerLeave={() => setRealce(null)}
                onFocus={() => ligada && setRealce(s.id)}
                onBlur={() => setRealce(null)}
                className={cn(
                  "inline-flex h-7 items-center gap-2 rounded-full px-2.5 text-[12.5px] outline-none transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:cursor-not-allowed",
                  ligada
                    ? "bg-secondary text-foreground-strong"
                    : "text-muted-foreground shadow-[inset_0_0_0_1px_var(--input)] hover:text-foreground-strong disabled:opacity-55 disabled:hover:text-muted-foreground"
                )}
              >
                <span
                  aria-hidden
                  className="h-0 w-3.5 border-t-[2.5px]"
                  style={{ borderColor: ligada ? CORES[lugar] : "var(--input)" }}
                />
                {s.title}
              </button>
            )
          })}
        </div>
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-[9px] rounded-[2px] bg-muted-foreground" />
            {t("level_timeline.baseline")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-[9px] rounded-full shadow-[inset_0_0_0_2px_var(--muted-foreground)]" />
            {t("level_timeline.confirmation")}
          </span>
          {series.filter((s) => desenhos.has(s.id)).length > limite ? (
            <span>{t("level_timeline.full", { count: limite })}</span>
          ) : null}
        </span>
      </div>

      <div className="flex">
        <div aria-hidden className="relative w-[72px] shrink-0 sm:w-[86px]" style={{ height: ALTURA }}>
          {LEVELS.map((n, i) => (
            <span
              key={n}
              className="absolute right-2.5 -translate-y-1/2 font-mono text-[10.5px] whitespace-nowrap text-muted-foreground"
              style={{ top: `${(3 - i) * 25 + 12.5}%` }}
            >
              {nome(n)}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <svg aria-hidden width="100%" height={ALTURA} className="block overflow-visible rounded-md">
            {LEVELS.map((n, i) => (
              <rect key={n} x="0" y={i * FAIXA} width="100%" height={FAIXA} fill={i % 2 ? "var(--sunken)" : "var(--card)"} />
            ))}
            {Array.from({ length: weeks }, (_, i) => (
              <line key={i} x1={`${(i / weeks) * 100}%`} x2={`${(i / weeks) * 100}%`} y1="0" y2={ALTURA} stroke="var(--muted)" />
            ))}
            {ligadas.map((s) => {
              const d = desenhos.get(s.id)!
              const lugar = lugarDe(s.id)
              const cor = CORES[lugar]
              const desloca = (lugar - (limite - 1) / 2) * 4
              const apagada = realce !== null && realce !== s.id
              return (
                <g key={s.id} opacity={apagada ? 0.2 : 1} style={{ transition: "opacity 150ms" }}>
                  {d.h.map(([x1, x2, n], i) => (
                    <line key={`h${i}`} x1={`${x1}%`} x2={`${x2}%`} y1={yDe(n, desloca)} y2={yDe(n, desloca)} stroke={cor} strokeWidth={2.25} strokeLinecap="round" />
                  ))}
                  {d.v.map(([x, de, para], i) => (
                    <line key={`v${i}`} x1={`${x}%`} x2={`${x}%`} y1={yDe(de, desloca)} y2={yDe(para, desloca)} stroke={cor} strokeWidth={2.25} strokeLinecap="round" />
                  ))}
                  {d.marcas.map((m, i) => (
                    <svg key={`m${i}`} x={`${m.x}%`} y={yDe(m.nivel, desloca)} width="1" height="1" overflow="visible">
                      {m.partida ? (
                        <rect x={-4.5} y={-4.5} width={9} height={9} rx={1.5} fill={cor} />
                      ) : (
                        <circle r={5} fill="var(--card)" stroke={cor} strokeWidth={2.25} />
                      )}
                    </svg>
                  ))}
                </g>
              )
            })}
          </svg>
          <div aria-hidden className="relative h-4">
            {meses.map((m) => (
              <span key={m.x} className="absolute -translate-x-1/2 text-[11px] text-muted-foreground" style={{ left: `${m.x}%` }}>
                {m.rotulo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* a mesma informação, para leitor de tela */}
      <ul className="sr-only">
        {ligadas.map((s) => (
          <li key={s.id}>
            {s.title}:{" "}
            {[...s.changes]
              .sort((a, b) => tempo(a.occurredAt) - tempo(b.occurredAt))
              .map((c) => t("level_timeline.point", { level: nome(c.to), date: formatShortDate(c.occurredAt, locale) }))
              .join(", ")}
          </li>
        ))}
      </ul>
    </section>
  )
}
