import type { ReactNode } from "react"

import type { PlanCurrency } from "./plan-price"

export interface PricingPlan {
  id: string
  name: string
  description?: string
  /** Valor em centavos no período selecionado. Zero cai no rótulo grátis. */
  amountInCents: number
  currency?: PlanCurrency
  /** Linha pequena abaixo do preço, ex.: "por usuário, cobrado mensal". */
  priceNote?: string
  features: string[]
  /** Título mono da lista, ex.: "Tudo do Solo, mais". */
  featuresTitle?: string
  /** Texto do selo de teste grátis, ex.: "14 dias grátis". */
  trial?: string
  /** Selo do canto, ex.: "Recomendado". Só um plano deveria ter. */
  badge?: string
  /** Plano de "fale com vendas": esconde o preço. */
  contactSales?: boolean
  ctaLabel: string
  /** Link discreto sob a CTA, ex.: "Começar sem cartão". */
  secondaryCtaLabel?: string
  /** Conteúdo extra abaixo das features. */
  extra?: ReactNode
}
