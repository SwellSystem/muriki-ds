import type { ReactNode } from "react"

import type { PlanFeature } from "@/components/blocks/plan-card/plan-feature-rows"

import type { PlanCurrency } from "./plan-price"

export interface PricingPlan {
  id: string
  name: string
  description?: string
  /** Valor em centavos no período selecionado. Zero cai no rótulo grátis. */
  amountInCents: number
  /** O preço cheio quando um cupom baixou o valor: aparece riscado. */
  originalAmountInCents?: number
  currency?: PlanCurrency
  /** Linha pequena abaixo do preço, ex.: "por usuário, cobrado mensal". */
  priceNote?: string
  features: string[]
  /**
   * Os recursos tipados do GET /plans, em linhas iguais em todos os cards
   * (PlanFeatureRows), com `featureLayout="rows"` no PricingScreen. O que o
   * primeiro plano não tem ou tem menos sai em destaque.
   */
  featureRows?: PlanFeature[]
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
