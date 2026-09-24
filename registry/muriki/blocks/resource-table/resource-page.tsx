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
