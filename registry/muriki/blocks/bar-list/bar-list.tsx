"use client"

// A lista com barra horizontal do Início do Backoffice ("De onde vêm as contas", em
// design/muriki-backoffice/telas.py): uma linha por item, com o rótulo, a barra, o número e uma
// coluna à direita. A barra tem duas camadas na mesma escala: `value` no tom claro da marca (as
// contas) e `part` no cheio por cima (quem paga) — a parte se lê como fatia do todo, sem uma
// segunda escala. Item `muted` (ex.: "Não informada") fica com o rótulo esmaecido.
//
// Acessibilidade: cada linha é um item de lista com uma frase para o leitor de tela ("Google: 412
// contas, 198 pagantes (48%)"); rótulo, barra e números visíveis ficam aria-hidden.
import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface BarListItem {
  key: string
  label: string
  /** A barra clara, ex.: contas. */
  value: number
  /** A parte cheia por cima, na mesma escala, ex.: pagantes. */
  part?: number
  /** Rótulo esmaecido, ex.: a origem "Não informada". */
  muted?: boolean
}

export interface BarListProps {
  items: BarListItem[]
  /** O número à direita da barra; padrão: número com o locale do navegador. */
  formatValue?: (value: number) => string
  /** A última coluna, ex.: (i) => `${Math.round((i.part! / i.value) * 100)}%`. */
  formatSecondary?: (item: BarListItem) => ReactNode
  /** O que cada camada é, ex.: { value: "contas", part: "pagantes" }. Vira a legenda e a frase lida. */
  legend?: { value: string; part?: string }
  /** O topo da escala; padrão: o maior `value`. */
  max?: number
  /** A frase de cada linha para o leitor de tela, se a padrão não servir. */
  itemLabel?: (item: BarListItem) => string
  loading?: boolean
  loadingCount?: number
  className?: string
}

const COLUNAS = "grid grid-cols-[minmax(84px,110px)_minmax(0,1fr)_3.5rem_4rem] items-center gap-3"

export function BarList({
  items,
  formatValue = (v) => new Intl.NumberFormat().format(v),
  formatSecondary,
  legend,
  max,
  itemLabel,
  loading = false,
  loadingCount = 6,
  className,
}: BarListProps) {
  const t = useTranslate()
  if (loading) return <BarListSkeleton count={loadingCount} className={className} />
  if (items.length === 0 || items.every((i) => i.value === 0)) {
    return (
      <div
        className={cn(
          "flex min-h-32 items-center justify-center rounded-lg border border-dashed border-input px-4 text-center text-[13px] text-muted-foreground",
          className
        )}
      >
        {t("bar_list.empty")}
      </div>
    )
  }

  const topo = max ?? Math.max(...items.map((i) => i.value))
  const pct = (v: number) => `${topo > 0 ? Math.min(100, Math.max(0, (v / topo) * 100)) : 0}%`
  const frase = (i: BarListItem) => {
    if (itemLabel) return itemLabel(i)
    const partes = [`${formatValue(i.value)}${legend ? ` ${legend.value}` : ""}`]
    if (i.part !== undefined) partes.push(`${formatValue(i.part)}${legend?.part ? ` ${legend.part}` : ""}`)
    const extra = formatSecondary?.(i)
    return `${i.label}: ${partes.join(", ")}${typeof extra === "string" || typeof extra === "number" ? ` (${extra})` : ""}`
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {legend ? (
        <div aria-hidden className="flex justify-end gap-3.5 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-primary/30" />
            {legend.value}
          </span>
          {legend.part ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-[2px] bg-primary" />
              {legend.part}
            </span>
          ) : null}
        </div>
      ) : null}
      <ul className="flex flex-col gap-1">
        {items.map((i) => (
          <li key={i.key} className={cn(COLUNAS, "h-5")}>
            <span className="sr-only">{frase(i)}</span>
            <span
              aria-hidden
              className={cn("truncate text-[13px]", i.muted ? "text-muted-foreground" : "text-foreground")}
            >
              {i.label}
            </span>
            <span aria-hidden className="relative block h-2.5 rounded-[3px] bg-sunken">
              <span className="absolute inset-y-0 left-0 rounded-[3px] bg-primary/30" style={{ width: pct(i.value) }} />
              {i.part !== undefined ? (
                <span className="absolute inset-y-0 left-0 rounded-[3px] bg-primary" style={{ width: pct(i.part) }} />
              ) : null}
            </span>
            <span aria-hidden className="text-right font-mono text-[12px] text-foreground-strong tabular-nums">
              {formatValue(i.value)}
            </span>
            <span aria-hidden className="text-right font-mono text-[12px] text-muted-foreground tabular-nums">
              {formatSecondary?.(i)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BarListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  // a mesma silhueta: rótulo, barra de comprimentos variados e os dois números
  const larguras = [92, 70, 48, 36, 28, 22, 16, 12, 10]
  return (
    <div aria-hidden className={cn("flex min-w-0 flex-col gap-1 pt-6", className)}>
      {Array.from({ length: count }, (_, n) => (
        <div key={n} className={cn(COLUNAS, "h-5")}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2.5 rounded-[3px]" style={{ width: `${larguras[n % larguras.length]}%` }} />
          <Skeleton className="ml-auto h-3 w-8" />
          <Skeleton className="ml-auto h-3 w-8" />
        </div>
      ))}
    </div>
  )
}
