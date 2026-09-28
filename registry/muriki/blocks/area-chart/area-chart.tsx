"use client"

// Área por período, o "Area Chart - Gradient" do shadcn vestido com a casa: a linha natural na cor
// da série e o preenchimento em degradê vertical (0.8 no topo, 0.1 embaixo), a grade só horizontal,
// o eixo de baixo sem linha nem traço. A API é a do bar-chart, para trocar um pelo outro sem mexer
// nos dados: labels, series, formatValue, formatTick, current, extra, ariaLabel, loading.
//
// O período em curso ainda não fechou e não deve ser lido como queda: o último trecho da linha sai
// tracejado, o preenchimento dele mais fraco, e o ponto do mês fica vazado.
//
// Negativos (um reembolso maior que as vendas do mês): o eixo inclui o zero e o que está abaixo, a
// área preenche até o zero, e a linha do zero aparece.
//
// Acessibilidade: o recharts com `accessibilityLayer` (setas andam pelos meses e abrem o tooltip),
// o resumo em `ariaLabel`, e "Ver como tabela" troca o gráfico pela mesma informação em tabela.
//
// Séries dividem UMA escala: não misture moedas. Cada moeda vai no seu gráfico, ou o card ganha um
// seletor de produto.
import { useId, useState, type ReactNode } from "react"
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface AreaChartSeries {
  key: string
  label: string
  /** Um valor por rótulo, na unidade do eixo (ex.: reais, não centavos). */
  values: number[]
  /** Uma cor CSS; sem ela, a série pega a da vez (azul da marca, âmbar, índigo). */
  color?: string
}

export interface AreaChartProps {
  /** Um rótulo por ponto, ex.: "out", "nov". */
  labels: string[]
  series: AreaChartSeries[]
  /** O valor no tooltip e na tabela, ex.: (v) => brl.format(v). */
  formatValue: (value: number) => string
  /** O rótulo do eixo; sem ele, a forma compacta ("10k", "1,2M"). */
  formatTick?: (value: number) => string
  /** Índice do período em curso: o último trecho tracejado e o selo "em curso". */
  current?: number
  /** Uma linha a mais no tooltip e na tabela, ex.: (serie, i) => `${count[i]} vendas`. */
  extra?: (series: AreaChartSeries, index: number) => ReactNode
  /** O resumo para o leitor de tela, ex.: "Vendas por mês, de out a set. Pico em ago." */
  ariaLabel: string
  loading?: boolean
  /** Altura do gráfico em px. */
  height?: number
  className?: string
}

const CORES = ["var(--primary)", "var(--chart-1)", "var(--chart-3)"]
const EM_CURSO = "__em_curso"

export function AreaChart({
  labels,
  series,
  formatValue,
  formatTick = compacto,
  current,
  extra,
  ariaLabel,
  loading = false,
  height = 230,
  className,
}: AreaChartProps) {
  const t = useTranslate()
  const [comoTabela, setComoTabela] = useState(false)
  const idBase = useId().replace(/:/g, "")

  if (loading) return <AreaChartSkeleton height={height} className={className} />

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
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: cores[i] }])
  )
  // O em curso só separa se não for o primeiro ponto: a linha fechada vai até o anterior e o trecho
  // tracejado liga o anterior ao atual.
  const separa = current !== undefined && current > 0 && current < labels.length
  const dados = labels.map((rotulo, i) => {
    const linha: Record<string, string | number | null> = { rotulo, i }
    for (const s of series) {
      const v = s.values[i] ?? 0
      linha[s.key] = separa && i > current - 1 ? null : v
      if (separa) linha[s.key + EM_CURSO] = i >= current - 1 && i <= current ? v : null
    }
    return linha
  })
  const todos = series.flatMap((s) => s.values)
  const minimo = Math.min(0, ...todos)
  const temNegativo = minimo < 0

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
        <figure aria-label={ariaLabel} className="m-0">
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
            <RechartsAreaChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`${idBase}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} fontSize={10.5} />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={10.5}
                domain={[minimo, "auto"]}
                tickFormatter={(v: number) => formatTick(v)}
              />
              {temNegativo ? <ReferenceLine y={0} stroke="var(--input)" /> : null}
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, label, payload }) => {
                  const i = Number(payload?.[0]?.payload?.i ?? -1)
                  if (!active || i < 0) return null
                  return <Dica {...{ i, rotulo: String(label), series, cores, formatValue, extra, current }} />
                }}
              />
              {series.map((s) => (
                <Area
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  type="natural"
                  baseValue={0}
                  fill={`url(#${idBase}-${s.key})`}
                  fillOpacity={0.4}
                  stroke={`var(--color-${s.key})`}
                  strokeWidth={2}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              ))}
              {separa
                ? series.map((s) => (
                    <Area
                      key={s.key + EM_CURSO}
                      dataKey={s.key + EM_CURSO}
                      name={s.label}
                      type="natural"
                      baseValue={0}
                      fill={`url(#${idBase}-${s.key})`}
                      fillOpacity={0.18}
                      stroke={`var(--color-${s.key})`}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      isAnimationActive={false}
                      activeDot={false}
                      // o ponto do mês em curso, vazado
                      dot={(p: { index?: number; cx?: number; cy?: number }) =>
                        p.index === current && p.cx !== undefined && p.cy !== undefined ? (
                          <circle
                            key={`${s.key}-curso`}
                            cx={p.cx}
                            cy={p.cy}
                            r={3.5}
                            fill="var(--card)"
                            stroke={`var(--color-${s.key})`}
                            strokeWidth={2}
                          />
                        ) : (
                          <g key={`${s.key}-${p.index}`} />
                        )
                      }
                    />
                  ))
                : null}
            </RechartsAreaChart>
          </ChartContainer>
        </figure>
      )}
    </div>
  )
}

function Dica({
  i,
  rotulo,
  series,
  cores,
  formatValue,
  extra,
  current,
}: {
  i: number
  rotulo: string
  series: AreaChartSeries[]
  cores: string[]
  formatValue: (v: number) => string
  extra?: AreaChartProps["extra"]
  current?: number
}) {
  // o tooltip dos popovers do DS; lê dos valores de origem, e não do payload, para o ponto que é
  // fim de um trecho e começo do tracejado não aparecer duas vezes
  const t = useTranslate()
  return (
    <div className="grid min-w-36 gap-1.5 rounded-[10px] bg-card px-3 py-2 text-[12px] shadow-float">
      <div className="flex items-center gap-2 font-medium text-foreground-strong">
        <span className="font-mono">{rotulo}</span>
        {i === current ? (
          <span className="rounded-full bg-sunken px-1.5 text-[10px] font-normal text-muted-foreground">
            {t("bar_chart.current")}
          </span>
        ) : null}
      </div>
      {series.map((s, j) => (
        <div key={s.key} className="grid gap-0.5">
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-2 shrink-0 rounded-[3px]" style={{ background: cores[j] }} />
            {series.length > 1 ? <span className="text-muted-foreground">{s.label}</span> : null}
            <span className="ml-auto pl-3 font-medium text-foreground-strong tabular-nums">
              {formatValue(s.values[i] ?? 0)}
            </span>
          </div>
          {extra ? <span className="pl-4 text-[11px] text-muted-foreground">{extra(s, i)}</span> : null}
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
}: Pick<AreaChartProps, "labels" | "series" | "formatValue" | "current" | "extra" | "ariaLabel">) {
  // a mesma tabela do bar-chart
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

export function AreaChartSkeleton({ height = 230, className }: { height?: number; className?: string }) {
  // a mesma silhueta: a linha da ferramenta e uma área em onda subindo para a direita
  return (
    <div aria-hidden className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex h-6 items-center justify-end">
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="relative pl-11" style={{ height: height - 26 }}>
        <Skeleton
          className="absolute inset-y-0 right-0 left-11 rounded-none"
          style={{
            clipPath:
              "polygon(0% 78%, 10% 70%, 20% 72%, 30% 60%, 40% 58%, 50% 46%, 60% 48%, 70% 34%, 80% 30%, 90% 22%, 100% 28%, 100% 100%, 0% 100%)",
          }}
        />
      </div>
      <div className="h-px bg-muted" style={{ marginTop: -12, marginLeft: 44 }} />
    </div>
  )
}

function compacto(v: number) {
  const a = Math.abs(v)
  const sinal = v < 0 ? "−" : ""
  const curto = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",")
  if (a >= 1e6) return `${sinal}${curto(a / 1e6)}M`
  if (a >= 1e3) return `${sinal}${curto(a / 1e3)}k`
  return `${sinal}${curto(a)}`
}
