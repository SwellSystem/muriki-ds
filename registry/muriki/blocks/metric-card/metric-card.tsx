"use client"

// O cartão de número do Início do Backoffice (design/muriki-backoffice/telas.py, `kpi` em
// tela_inicio): o rótulo em cima, o número grande em tabular e a linha de baixo que explica de onde
// ele vem. Opcionais: a variação (verde ou vermelha conforme ela é boa, não conforme sobe) e o selo
// "agora", para o número que é retrato do momento e não segue o seletor de período — sem o selo,
// quem troca "30 dias" por "12 meses" acha que ele devia ter mudado.
//
// Com `href` ou `render` (o <Link> do app), o cartão inteiro vira o link e ganha a seta no canto.
// Nesse caso o selo não é focável (nada interativo dentro de um link): o aviso vai num texto só
// para o leitor de tela, dentro do próprio selo, e o tooltip aparece no hover.
import type { ReactElement, ReactNode } from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { CaretRightIcon, ClockIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface MetricTrend {
  /** Já formatado, ex.: "+6,8%" ou "−R$ 720". */
  value: string
  direction: "up" | "down"
  /** A variação é boa? Decide a cor: MRR perdido sobe e é ruim. Sem isto, subir é bom. */
  good?: boolean
}

export interface MetricCardProps {
  label: ReactNode
  /** O número já formatado, ex.: "R$ 41.920". */
  value: ReactNode
  /** A linha de baixo; aceita duas linhas (ex.: recebido e reembolsos). */
  detail?: ReactNode
  trend?: MetricTrend
  /** Retrato de agora: não muda com o período. Põe o selo "agora". */
  live?: boolean
  href?: string
  /** O elemento que navega, ex.: <Link to="/metrics" />. Ganha de `href`. */
  render?: ReactElement
  loading?: boolean
  className?: string
}

export function MetricCard({
  label,
  value,
  detail,
  trend,
  live = false,
  href,
  render,
  loading = false,
  className,
}: MetricCardProps) {
  const link = Boolean(render || href)
  const classe = cn(
    "flex min-w-0 flex-col gap-1.5 rounded-xl bg-card px-5 py-4 shadow-sm",
    link && "outline-none transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40",
    className
  )

  const conteudo = loading ? (
    <>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-1 h-8 w-36" />
      <Skeleton className="h-3.5 w-48" />
    </>
  ) : (
    <>
      <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <span className="truncate">{label}</span>
        {live ? <SeloAgora interativo={!link} /> : null}
        {link ? <CaretRightIcon aria-hidden className="ml-auto size-3.5 shrink-0" /> : null}
      </span>
      <span className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-foreground-strong tabular-nums">
        {value}
      </span>
      {trend || detail ? (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-muted-foreground">
          {trend ? <Variacao trend={trend} /> : null}
          {detail}
        </span>
      ) : null}
    </>
  )

  return useRender({
    render: render ?? (href ? <a href={href} /> : undefined),
    defaultTagName: "section",
    props: mergeProps<"section">(
      { className: classe, "aria-busy": loading || undefined },
      { children: conteudo }
    ),
  })
}

function Variacao({ trend }: { trend: MetricTrend }) {
  const boa = trend.good ?? trend.direction === "up"
  const Icone = trend.direction === "up" ? TrendUpIcon : TrendDownIcon
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", boa ? "text-success" : "text-destructive")}>
      <Icone aria-hidden className="size-3.5" />
      {trend.value}
    </span>
  )
}

function SeloAgora({ interativo }: { interativo: boolean }) {
  const t = useTranslate()
  const selo = (
    <span className="inline-flex h-[18px] shrink-0 items-center gap-1 rounded-[4px] px-1.5 font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase shadow-[inset_0_0_0_1px_var(--input)]">
      <ClockIcon aria-hidden className="size-[11px]" />
      {t("metric_card.live")}
      <span className="sr-only">{`: ${t("metric_card.live_hint")}`}</span>
    </span>
  )
  return (
    <Tooltip>
      <TooltipTrigger render={interativo ? <span tabIndex={0} className="rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40" /> : <span />}>
        {selo}
      </TooltipTrigger>
      <TooltipContent>{t("metric_card.live_hint")}</TooltipContent>
    </Tooltip>
  )
}

/** A fileira de cartões: um por linha no celular, dois no tablet, quatro no desktop. */
export function MetricGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
}
