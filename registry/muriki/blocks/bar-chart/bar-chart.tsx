"use client"

// Barras por período (design/muriki-backoffice/telas.py, _grafico_vendas): magnitude no tempo, uma
// cor por série, a grade leve com os rótulos mono à esquerda, os meses embaixo e o rótulo direto só
// no pico. A barra tem 4px arredondados só na ponta e fica ancorada na linha do zero; negativa (um
// reembolso), desce do zero com o arredondado embaixo. O período em curso sai na cor da série a 45%:
// ainda não fechou, e não deve ser lido como queda.
//
// SVG próprio, sem biblioteca: o gráfico é pequeno e fala a língua do tema pelos tokens. A largura é
// medida no container e o desenho é refeito nela, para o texto nunca esticar.
//
// Acessibilidade: o SVG é uma imagem com o resumo em `ariaLabel`. Por cima dele, cada período é um
// botão transparente (tabindex itinerante, setas andam) que abre o tooltip no foco e no hover. E
// "Ver como tabela" troca o gráfico pela mesma informação em tabela.
//
// Séries dividem UMA escala: não misture moedas. BRL e USD na mesma escala enganam; cada moeda vai
// num gráfico, ou o card ganha um seletor de produto.
//
// Compacto (o celular): abaixo de 480px de largura o gráfico liga sozinho 3 degraus no eixo (0, meio
// e teto) e os rótulos de baixo de 2 em 2, contados a partir do último, para o período em curso nunca
// sumir. `yTicks` e `xTickEvery` mandam quando o app passa; `compact` força ou desliga.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface BarChartSeries {
  key: string
  label: string
  /** Um valor por rótulo, na unidade do eixo (ex.: reais, não centavos). */
  values: number[]
  /** Uma cor CSS; sem ela, a série pega a da vez (azul da marca, âmbar, índigo). */
  color?: string
}

export interface BarChartProps {
  /** Um rótulo por barra, ex.: "out", "nov". */
  labels: string[]
  series: BarChartSeries[]
  /** O valor no tooltip, no pico e na tabela, ex.: (v) => brl.format(v). */
  formatValue: (value: number) => string
  /** O rótulo do eixo; sem ele, a forma compacta ("10k", "1,2M"). */
  formatTick?: (value: number) => string
  /** Índice do período em curso: cor a 45% e o selo "em curso". */
  current?: number
  /** Uma linha a mais no tooltip e na tabela, ex.: (serie, i) => `${count[i]} vendas`. */
  extra?: (series: BarChartSeries, index: number) => ReactNode
  /** O resumo do SVG para o leitor de tela, ex.: "Vendas por mês, de out a set. Pico em ago." */
  ariaLabel: string
  loading?: boolean
  /** Altura do gráfico em px. */
  height?: number
  /**
   * Compacto: 3 degraus no eixo e os rótulos de 2 em 2. "auto" (padrão) liga abaixo de 480px de
   * largura; true força, false desliga.
   */
  compact?: boolean | "auto"
  /** Quantos degraus no eixo Y (0, meio e teto são 3). Ganha do compacto. */
  yTicks?: number
  /** Rótulo do eixo X de N em N, contando do último para trás. Ganha do compacto. */
  xTickEvery?: number
  className?: string
}

const CORES = ["var(--primary)", "var(--chart-1)", "var(--chart-3)"]
const ESQ = 44 // espaço dos rótulos do eixo
const TOPO = 22 // folga do rótulo do pico
const RODAPE = 26 // os meses
const LARGURA_COMPACTA = 480

export function BarChart({
  labels,
  series,
  formatValue,
  formatTick = compacto,
  current,
  extra,
  ariaLabel,
  loading = false,
  height = 230,
  compact = "auto",
  yTicks,
  xTickEvery,
  className,
}: BarChartProps) {
  const t = useTranslate()
  const [comoTabela, setComoTabela] = useState(false)

  if (loading) return <BarChartSkeleton height={height} className={className} />

  const vazio = labels.length === 0 || series.every((s) => s.values.every((v) => !v))
  if (vazio) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[10px] border border-dashed border-input text-[13px] text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        {t("bar_chart.empty")}
      </div>
    )
  }

  const cores = series.map((s, i) => s.color ?? CORES[i % CORES.length])
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex min-h-6 items-center gap-4">
        {series.length > 1 ? (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            {series.map((s, i) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: cores[i] }} />
                {s.label}
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => setComoTabela((v) => !v)}
          className="ml-auto rounded-[6px] px-1.5 text-[12px] font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {comoTabela ? t("bar_chart.as_chart") : t("bar_chart.as_table")}
        </button>
      </div>
      {comoTabela ? (
        <Tabela {...{ labels, series, formatValue, current, extra, ariaLabel }} />
      ) : (
        <Grafico
          {...{ labels, series, cores, formatValue, formatTick, current, extra, ariaLabel, height, compact, yTicks, xTickEvery }}
        />
      )}
    </div>
  )
}

function Grafico({
  labels,
  series,
  cores,
  formatValue,
  formatTick,
  current,
  extra,
  ariaLabel,
  height,
  compact,
  yTicks,
  xTickEvery,
}: Required<Pick<BarChartProps, "labels" | "series" | "formatValue" | "formatTick" | "ariaLabel" | "height">> &
  Pick<BarChartProps, "current" | "extra" | "compact" | "yTicks" | "xTickEvery"> & { cores: string[] }) {
  const t = useTranslate()
  const caixa = useRef<HTMLDivElement>(null)
  const botoes = useRef<(HTMLButtonElement | null)[]>([])
  const [largura, setLargura] = useState(700)
  const [ativo, setAtivo] = useState<number | null>(null)
  const [foco, setFoco] = useState(labels.length - 1)

  useEffect(() => {
    const el = caixa.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([e]) => setLargura(Math.max(240, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const compacto_ = compact === true || (compact === "auto" && largura < LARGURA_COMPACTA)
  const degraus = yTicks ?? (compacto_ ? 3 : undefined)
  const cada = Math.max(1, xTickEvery ?? (compacto_ ? 2 : 1))
  // de N em N a partir do último: o período em curso (o mais recente) sempre tem rótulo
  const rotulado = (i: number) => (labels.length - 1 - i) % cada === 0

  const todos = series.flatMap((s) => s.values)
  const { piso, teto, passoGrade } = escala(Math.min(0, ...todos), Math.max(0, ...todos), degraus)
  const base = height - RODAPE
  const y = (v: number) => TOPO + ((teto - v) / (teto - piso)) * (base - TOPO)
  const n = labels.length
  const passo = (largura - ESQ) / n
  const folga = Math.min(7, passo * 0.18)
  const grupo = passo - folga * 2
  const vao = series.length > 1 ? Math.min(3, grupo * 0.08) : 0
  const barra = (grupo - vao * (series.length - 1)) / series.length

  const ticks: number[] = []
  for (let v = piso; v <= teto + passoGrade / 2; v += passoGrade) ticks.push(Math.round(v * 1e6) / 1e6)

  // o pico: o maior valor positivo de todas as séries, com o rótulo direto
  const pico = series
    .flatMap((s, si) => s.values.map((v, i) => ({ si, i, v })))
    .reduce<{ si: number; i: number; v: number } | null>((m, p) => (p.v > 0 && (!m || p.v > m.v) ? p : m), null)
  const xBarra = (i: number, si: number) => ESQ + i * passo + folga + si * (barra + vao)

  function mover(e: KeyboardEvent, i: number) {
    const alvo = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key]
    if (alvo === undefined) return
    e.preventDefault()
    const j = Math.max(0, Math.min(n - 1, alvo))
    setFoco(j)
    botoes.current[j]?.focus()
  }

  const topoDoGrupo = (i: number) => Math.min(...series.map((s) => y(Math.max(0, s.values[i] ?? 0))))

  return (
    <div ref={caixa} className="relative w-full min-w-0" onMouseLeave={() => setAtivo(null)}>
      <svg
        viewBox={`0 0 ${largura} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={ariaLabel}
        className="block overflow-visible"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={ESQ}
              x2={largura}
              y1={y(v)}
              y2={y(v)}
              stroke={v === 0 ? "var(--input)" : "var(--muted)"}
              strokeWidth={1}
            />
            <text
              x={ESQ - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[10.5px]"
            >
              {v === 0 ? "0" : formatTick(v)}
            </text>
          </g>
        ))}
        {labels.map((rotulo, i) => (
          <g key={rotulo + i}>
            {ativo === i ? (
              <rect
                x={ESQ + i * passo + 2}
                y={TOPO - 6}
                width={passo - 4}
                height={base - TOPO + 6}
                rx={6}
                fill="var(--muted)"
                opacity={0.6}
              />
            ) : null}
            {series.map((s, si) => {
              const v = s.values[i] ?? 0
              if (!v) return null
              return (
                <path
                  key={s.key}
                  d={caminho(xBarra(i, si), barra, y(0), y(v))}
                  fill={i === current ? `color-mix(in oklch, ${cores[si]} 45%, transparent)` : cores[si]}
                />
              )
            })}
            <text
              x={ESQ + i * passo + passo / 2}
              y={base + 18}
              textAnchor="middle"
              className={cn("font-mono text-[10.5px]", ativo === i ? "fill-foreground-strong" : "fill-muted-foreground")}
            >
              {rotulado(i) || ativo === i ? rotulo : null}
            </text>
          </g>
        ))}
        {pico ? (
          <text
            x={xBarra(pico.i, pico.si) + barra / 2}
            y={y(pico.v) - 8}
            textAnchor="middle"
            className="fill-foreground-strong text-[11.5px] font-medium"
          >
            {formatValue(pico.v)}
          </text>
        ) : null}
      </svg>

      {/* Os períodos para o teclado e o mouse: um botão transparente por coluna, por cima do SVG. */}
      <div className="absolute top-0 right-0" style={{ left: ESQ, height: base }}>
        {labels.map((rotulo, i) => (
          <button
            key={rotulo + i}
            ref={(el) => {
              botoes.current[i] = el
            }}
            type="button"
            tabIndex={i === foco ? 0 : -1}
            aria-label={resumo(rotulo, i, series, formatValue, i === current ? t("bar_chart.current") : null)}
            onMouseEnter={() => setAtivo(i)}
            onFocus={() => {
              setAtivo(i)
              setFoco(i)
            }}
            onBlur={() => setAtivo(null)}
            onKeyDown={(e) => mover(e, i)}
            className="absolute top-0 bottom-0 cursor-default rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{ left: i * passo, width: passo }}
          />
        ))}
      </div>

      {ativo !== null ? (
        <Dica
          x={ESQ + ativo * passo + passo / 2}
          y={topoDoGrupo(ativo)}
          lado={ativo < n * 0.2 ? "inicio" : ativo > n * 0.8 ? "fim" : "meio"}
          rotulo={labels[ativo]}
          emCurso={ativo === current ? t("bar_chart.current") : null}
          linhas={series.map((s, si) => ({
            key: s.key,
            label: series.length > 1 ? s.label : null,
            cor: cores[si],
            valor: formatValue(s.values[ativo] ?? 0),
            extra: extra?.(s, ativo),
          }))}
        />
      ) : null}
    </div>
  )
}

function Dica({
  x,
  y,
  lado,
  rotulo,
  emCurso,
  linhas,
}: {
  x: number
  y: number
  lado: "inicio" | "meio" | "fim"
  rotulo: string
  emCurso: string | null
  linhas: { key: string; label: string | null; cor: string; valor: string; extra?: ReactNode }[]
}) {
  // acima da barra mais alta do período; nas pontas, alinha para dentro para não sair do card
  const desloca = { inicio: "-16px", meio: "-50%", fim: "calc(-100% + 16px)" }[lado]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 min-w-[128px] rounded-[10px] bg-card px-3 py-2 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.25),inset_0_0_0_1px_var(--border)]"
      style={{ left: x, top: y - 10, transform: `translate(${desloca}, -100%)` }}
    >
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        {rotulo}
        {emCurso ? <span className="rounded-full bg-sunken px-1.5 text-[10px]">{emCurso}</span> : null}
      </p>
      {linhas.map((l) => (
        <div key={l.key} className="flex flex-col">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden className="size-2 rounded-[2px]" style={{ background: l.cor }} />
            {l.label ? <span className="text-muted-foreground">{l.label}</span> : null}
            <span className="ml-auto pl-2 font-medium text-foreground-strong tabular-nums">{l.valor}</span>
          </span>
          {l.extra ? <span className="pl-3.5 text-[11px] text-muted-foreground">{l.extra}</span> : null}
        </div>
      ))}
    </div>
  )
}

function Tabela({
  labels,
  series,
  formatValue,
  current,
  extra,
  ariaLabel,
}: Pick<BarChartProps, "labels" | "series" | "formatValue" | "current" | "extra" | "ariaLabel">) {
  const t = useTranslate()
  return (
    <div className="overflow-x-auto rounded-[10px] shadow-[inset_0_0_0_1px_var(--border)]">
      <table className="w-full text-[13px]">
        <caption className="sr-only">{ariaLabel}</caption>
        <thead>
          <tr className="text-left text-[12px] text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">
              {t("bar_chart.period")}
            </th>
            {series.map((s) => (
              <th key={s.key} scope="col" className="px-3 py-2 text-right font-medium">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((rotulo, i) => (
            <tr key={rotulo + i} className="shadow-[inset_0_1px_0_var(--muted)]">
              <th scope="row" className="px-3 py-2 text-left font-mono text-[12px] font-normal text-foreground">
                {rotulo}
                {i === current ? (
                  <span className="ml-2 rounded-full bg-sunken px-1.5 text-[10px] text-muted-foreground">
                    {t("bar_chart.current")}
                  </span>
                ) : null}
              </th>
              {series.map((s) => (
                <td key={s.key} className="px-3 py-2 text-right tabular-nums">
                  <span className="text-foreground-strong">{formatValue(s.values[i] ?? 0)}</span>
                  {extra ? <span className="block text-[11px] text-muted-foreground">{extra(s, i)}</span> : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BarChartSkeleton({ height = 230, className }: { height?: number; className?: string }) {
  // a mesma silhueta: a linha da ferramenta, doze barras de alturas variadas e a base
  const alturas = [38, 52, 46, 61, 58, 70, 66, 78, 74, 85, 90, 48]
  return (
    <div aria-hidden className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex h-6 items-center justify-end">
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="flex items-end gap-[14px] pl-11" style={{ height: height - RODAPE }}>
        {alturas.map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-b-none rounded-t-[4px]" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="h-px bg-muted" style={{ marginTop: -12, marginLeft: 44 }} />
    </div>
  )
}

/** A barra: 4px arredondados só na ponta (em cima se positiva, embaixo se negativa). */
function caminho(x: number, w: number, zero: number, ponta: number) {
  const r = Math.min(4, w / 2, Math.abs(zero - ponta))
  if (ponta <= zero) {
    return `M${x},${zero} V${ponta + r} Q${x},${ponta} ${x + r},${ponta} H${x + w - r} Q${x + w},${ponta} ${x + w},${ponta + r} V${zero} Z`
  }
  return `M${x},${zero} V${ponta - r} Q${x},${ponta} ${x + r},${ponta} H${x + w - r} Q${x + w},${ponta} ${x + w},${ponta - r} V${zero} Z`
}

/** Grade "redonda": passos de 1, 2, 2,5 ou 5 vezes uma potência de 10, uns cinco degraus. */
function escala(min: number, max: number, degraus?: number) {
  if (degraus && degraus >= 2) return escalaFixa(min, max, degraus)
  const bruto = (max - min) / 5 || 1
  const pot = 10 ** Math.floor(Math.log10(bruto))
  const passoGrade = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= bruto) ?? 10 * pot
  return { piso: Math.floor(min / passoGrade) * passoGrade, teto: Math.ceil(max / passoGrade) * passoGrade, passoGrade }
}

/** Exatamente N degraus redondos cobrindo [min, max]: o teto arredonda para cima. */
function escalaFixa(min: number, max: number, degraus: number) {
  const bruto = (max - min) / (degraus - 1) || 1
  let pot = 10 ** Math.floor(Math.log10(bruto))
  for (;;) {
    for (const m of [1, 2, 2.5, 5]) {
      const passoGrade = m * pot
      const piso = Math.floor(min / passoGrade) * passoGrade
      if (piso + passoGrade * (degraus - 1) >= max) return { piso, teto: piso + passoGrade * (degraus - 1), passoGrade }
    }
    pot *= 10
  }
}

function compacto(v: number) {
  const a = Math.abs(v)
  const sinal = v < 0 ? "−" : ""
  const curto = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",")
  if (a >= 1e6) return `${sinal}${curto(a / 1e6)}M`
  if (a >= 1e3) return `${sinal}${curto(a / 1e3)}k`
  return `${sinal}${curto(a)}`
}

function resumo(
  rotulo: string,
  i: number,
  series: BarChartSeries[],
  formatValue: (v: number) => string,
  emCurso: string | null
) {
  const valores = series.map((s) => (series.length > 1 ? `${s.label}: ` : "") + formatValue(s.values[i] ?? 0))
  return [rotulo + (emCurso ? ` (${emCurso})` : ""), ...valores].join(", ")
}
