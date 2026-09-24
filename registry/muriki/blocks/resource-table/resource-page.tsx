"use client"

/**
 * O resto da tela de recurso: o cabeçalho e a barra de busca e filtros.
 *
 * Cabeçalho: título com a contagem em mono ao lado, e à direita as ações —
 * UMA delas sólida, a de criar. Barra: busca, filtros (os chips são do
 * caller), um espaço, o que for secundário (exportar), e embaixo as abas de
 * status com contagem. Aba, não view-toggle: cada aba mostra OUTRAS linhas.
 */
import * as React from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { formatCount, useResourceLabel } from "./labels"
import type { ResourceStatusTab } from "./types"

export interface ResourcePageHeaderProps extends Omit<React.ComponentProps<"header">, "title"> {
  title: React.ReactNode
  /** Total do recurso. Vai em mono, ao lado do título. */
  count?: number
  description?: React.ReactNode
  /** Trilha acima do título (o Breadcrumb do DS). */
  breadcrumb?: React.ReactNode
  /** À direita. Uma ação sólida por tela: a de criar. */
  actions?: React.ReactNode
}

export function ResourcePageHeader({
  title,
  count,
  description,
  breadcrumb,
  actions,
  className,
  ...props
}: ResourcePageHeaderProps) {
  return (
    <header data-slot="resource-page-header" className={cn("flex flex-wrap items-end gap-x-6 gap-y-3", className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {breadcrumb}
        <h1 className="flex items-baseline gap-2.5 text-[26px] leading-8 font-semibold tracking-[-0.01em] text-foreground-strong">
          {title}
          {count != null ? (
            <span className="font-mono text-sm font-normal tracking-normal text-muted-foreground">{formatCount(count)}</span>
          ) : null}
        </h1>
        {description ? <p className="max-w-[72ch] text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export interface ResourceToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /** Chips de filtro, à direita da busca. */
  filters?: React.ReactNode
  /** Na ponta direita: exportar, densidade… */
  trailing?: React.ReactNode
  /** Abas de status com contagem. Sem elas, a barra é uma linha só. */
  tabs?: ResourceStatusTab[]
  tab?: string
  onTabChange?: (value: string) => void
  className?: string
}

export function ResourceToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  trailing,
  tabs,
  tab,
  onTabChange,
  className,
}: ResourceToolbarProps) {
  const t = useResourceLabel()
  const ph = searchPlaceholder ?? t("resource.search")
  return (
    <div data-slot="resource-toolbar" className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange ? (
          <label className="relative w-full sm:w-80">
            <span className="sr-only">{ph}</span>
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-[15px] -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={ph}
              className="pl-8"
            />
          </label>
        ) : null}
        {filters}
        {trailing ? <div className="ml-auto flex items-center gap-1.5">{trailing}</div> : null}
      </div>
      {tabs && tabs.length > 0 ? (
        <Tabs value={tab ?? tabs[0].value} onValueChange={(v) => onTabChange?.(String(v))}>
          <TabsList aria-label="Status" className="gap-5">
            {tabs.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label}
                {s.count != null ? (
                  <span className="font-mono text-[11px] font-normal text-muted-foreground">{formatCount(s.count)}</span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}

export interface ResourcePageSkeletonProps {
  /** Quantas abas de status desenhar; 0 esconde a faixa. */
  tabs?: number
  /** Quantas colunas depois da primeira. */
  columns?: number
  rows?: number
  className?: string
}

/**
 * A tela de recurso inteira enquanto a rota carrega — o `pendingComponent`
 * do router. Mesma anatomia da página pronta: título com contagem, a ação
 * à direita, busca e filtros, abas, e a tabela com as linhas de skeleton do
 * próprio ResourceTable. Nada pula quando o conteúdo entra.
 */
export function ResourcePageSkeleton({ tabs = 4, columns = 4, rows = 8, className }: ResourcePageSkeletonProps) {
  const larguras = ["w-3/5", "w-2/3", "w-1/2", "w-3/4"]
  return (
    <div data-slot="resource-page-skeleton" aria-busy className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-end gap-6">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-44" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-full sm:w-80" />
        <Skeleton className="hidden h-8 w-20 sm:block" />
        <Skeleton className="hidden h-8 w-24 sm:block" />
      </div>
      {tabs > 0 ? (
        <div className="flex gap-5 pb-2">
          {Array.from({ length: tabs }, (_, i) => (
            <Skeleton key={i} className={cn("h-4", i === 0 ? "w-14" : "w-20")} />
          ))}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[12px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex h-[38px] items-center gap-4 bg-rail px-4 shadow-[inset_0_-1px_0_var(--border)]">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="ml-auto h-3 w-16 first-of-type:ml-auto" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex h-[52px] items-center gap-4 px-4 shadow-[inset_0_-1px_0_var(--border)]">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className={cn("h-3", larguras[i % larguras.length])} />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
            {Array.from({ length: columns }, (_, j) => (
              <Skeleton key={j} className="hidden h-3 w-16 md:block" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
