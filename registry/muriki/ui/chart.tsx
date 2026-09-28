"use client"

/**
 * Muriki Chart — a base dos gráficos com recharts: o chart.tsx do shadcn,
 * vestido com a casa.
 *
 * `ChartContainer` recebe o `config` (uma entrada por série: rótulo e cor)
 * e publica cada cor como `--color-<chave>` no próprio container, para o
 * gráfico pintar com `var(--color-<chave>)` e trocar de tema sem JS. As
 * cores vêm dos tokens (`var(--primary)`, `var(--chart-1)`…), nunca de hex
 * solto; `theme: { light, dark }` fica para o raro caso de cor por tema.
 *
 * O texto do recharts (eixos, grade, cursor) é repintado pelos tokens aqui,
 * e o tooltip é o dos popovers do DS: superfície de cartão, a sombra
 * flutuante, 12px, rótulo em cima e uma linha por série com o marcador.
 */
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipContentProps } from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart precisa estar dentro de um <ChartContainer />")
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          // o recharts pinta em cinza fixo (#ccc, #fff); aqui tudo volta para os tokens
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:font-mono",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-muted",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-input",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-input",
          "[&_.recharts-dot[stroke='#fff']]:stroke-card",
          "[&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const cores = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!cores.length) return null
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([tema, prefixo]) =>
              `${prefixo} [data-chart=${id}] {\n${cores
                .map(([chave, c]) => {
                  const cor = c.theme?.[tema as keyof typeof THEMES] || c.color
                  return cor ? `  --color-${chave}: ${cor};` : null
                })
                .filter(Boolean)
                .join("\n")}\n}`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = Partial<TooltipContentProps> & {
  className?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

/** O tooltip dos popovers do DS: rótulo em cima, uma linha por série com o marcador e o valor. */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  formatter,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  const rotulo = (() => {
    if (hideLabel) return null
    const item = payload[0]
    const chave = `${labelKey || item?.dataKey || item?.name || "value"}`
    const valor = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : config[chave]?.label
    if (labelFormatter) return labelFormatter(valor ?? label, payload)
    return valor ?? null
  })()

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 rounded-[10px] bg-card px-3 py-2 text-[12px] shadow-float",
        className
      )}
    >
      {rotulo ? <div className="font-medium text-foreground-strong">{rotulo}</div> : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const chave = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = config[chave]
          const cor = item.color ?? item.payload?.fill
          return (
            <div key={`${item.dataKey}-${index}`} className="flex items-center gap-2">
              {hideIndicator ? null : (
                <span
                  aria-hidden
                  className={cn(
                    "shrink-0",
                    indicator === "dot" && "size-2 rounded-[3px]",
                    indicator === "line" && "h-3 w-1 rounded-full",
                    indicator === "dashed" && "h-0 w-3 border-t-2 border-dashed"
                  )}
                  style={indicator === "dashed" ? { borderColor: cor } : { background: cor }}
                />
              )}
              {formatter && item.value !== undefined && item.name !== undefined ? (
                formatter(item.value, item.name, item, index, payload)
              ) : (
                <>
                  <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                  <span className="ml-auto pl-3 font-medium text-foreground-strong tabular-nums">
                    {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                  </span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

/** A legenda: o marcador e o rótulo de cada série do `config`. */
function ChartLegendContent({
  className,
  payload,
  nameKey,
}: {
  className?: string
  payload?: ReadonlyArray<{ value?: unknown; dataKey?: unknown; color?: string }>
  nameKey?: string
}) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground", className)}>
      {payload.map((item) => {
        const chave = `${nameKey || item.dataKey || "value"}`
        const itemConfig = config[chave]
        return (
          <li key={String(item.value)} className="flex items-center gap-1.5">
            {itemConfig?.icon ? (
              <itemConfig.icon />
            ) : (
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
            )}
            {itemConfig?.label ?? String(item.value)}
          </li>
        )
      })}
    </ul>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle, useChart }
