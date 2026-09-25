// A tela de Planos de dentro do app (design/muriki-code, tela_planos):
// não é a do onboarding. Não tem trilha de passos, tem o plano ATUAL
// marcado com o botão desligado, o estado da assinatura acima dos cards e
// as regras embaixo. O card, a grade, o preço e as features são os mesmos
// do onboarding: uma tela a mais, nenhuma peça nova de plano.
//
// Controlada e sem API: recebe os planos já precificados no período e
// devolve a escolha por `onSelectPlan`.
import type { ReactNode } from "react"

// Um arquivo por import, nunca o barril: o `shadcn add` reescreve o caminho
// para o alvo de cada arquivo.
import { PlanPrice, type PlanCurrency, type PlanInterval } from "@/components/blocks/onboarding-pricing/plan-price"
import { PlanFeatures } from "@/components/blocks/onboarding-pricing/plan-features"
import { PlanTrialBadge } from "@/components/blocks/onboarding-pricing/plan-trial-badge"
import { PlanCard } from "@/components/blocks/plan-card/plan-card"
import { PlanCardSkeleton } from "@/components/blocks/plan-card/plan-card-skeleton"
import { PlanGrid } from "@/components/blocks/plan-card/plan-grid"
import { Badge } from "@/components/ui/badge"
import { ViewToggle } from "@/components/ui/view-toggle"
import { cn } from "@/lib/utils"

export interface PlansPagePlan {
  id: string
  name: string
  description?: string
  /** Valor em centavos no período selecionado. Zero cai no rótulo grátis. */
  amountInCents: number
  originalAmountInCents?: number
  currency?: PlanCurrency
  /** Linha pequena abaixo do preço, ex.: "ou R$ 499 por ano". */
  priceNote?: string
  /** Selo de teste acima do preço, ex.: "grátis até 1º de outubro". */
  trial?: string
  features: string[]
  /** O que ainda não tem número: aparece esmaecido, com o selo tracejado. */
  pendingFeatures?: string[]
  /** O plano de quem está vendo: selo "atual" e botão desligado. */
  current?: boolean
  ctaLabel: string
}

export interface PlansPageLabels {
  title: string
  subtitle?: ReactNode
  periodAria: string
  periodMonth: string
  periodYear: string
  /** Selo no segmento anual, ex.: "-17%". */
  periodSaveBadge?: string
  intervalMonth: string
  intervalYear: string
  free: string
  /** O selo do plano atual, ex.: "atual". */
  current: string
  /** O selo tracejado das features sem número, ex.: "a definir". */
  pending: string
}

export interface PlansPageRule {
  icon: ReactNode
  text: ReactNode
}

export interface PlansPageProps {
  labels: PlansPageLabels
  plans: PlansPagePlan[]
  onSelectPlan: (planId: string) => void
  /** Id do plano cuja CTA está em espera. */
  pendingPlanId?: string | null
  period: PlanInterval
  onPeriodChange: (next: PlanInterval) => void
  /** `false` quando só há um período à venda. */
  showPeriodToggle?: boolean
  /** A faixa acima dos cards, normalmente o <SubscriptionStatus />. */
  status?: ReactNode
  /** As regras embaixo, uma por coluna: cancelar, produtos, limites. */
  rules?: PlansPageRule[]
  loading?: boolean
  loadingCount?: number
  locale?: string
  className?: string
}

export function PlansPage({
  labels,
  plans,
  onSelectPlan,
  pendingPlanId = null,
  period,
  onPeriodChange,
  showPeriodToggle = true,
  status,
  rules = [],
  loading = false,
  loadingCount = 2,
  locale = "pt-BR",
  className,
}: PlansPageProps) {
  const intervalLabel =
    period === "year" ? labels.intervalYear : labels.intervalMonth

  return (
    <div className={cn("flex w-full max-w-5xl flex-col gap-6", className)}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
            {labels.title}
          </h1>
          {labels.subtitle ? (
            <p className="max-w-[70ch] text-sm text-muted-foreground">
              {labels.subtitle}
            </p>
          ) : null}
        </div>
        {showPeriodToggle ? (
          <ViewToggle<PlanInterval>
            ariaLabel={labels.periodAria}
            value={period}
            onChange={onPeriodChange}
            options={[
              { value: "month", label: labels.periodMonth },
              {
                value: "year",
                label: labels.periodYear,
                badge: labels.periodSaveBadge ? (
                  <Badge tone="green" size="sm">
                    {labels.periodSaveBadge}
                  </Badge>
                ) : undefined,
              },
            ]}
          />
        ) : null}
      </header>

      {status}

      <PlanGrid className="mx-0 max-w-none md:max-w-[980px]">
        {loading
          ? Array.from({ length: loadingCount }, (_, i) => (
              <PlanCardSkeleton key={i} />
            ))
          : plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                // O atual é o marcado: anel da seleção, não o destaque de
                // venda. Aqui ninguém está sendo convencido de nada.
                selected={plan.current}
                badgeSlot={
                  plan.current ? (
                    <Badge tone="blue" size="sm">
                      {labels.current}
                    </Badge>
                  ) : undefined
                }
                trialBadgeSlot={
                  plan.trial ? <PlanTrialBadge label={plan.trial} /> : undefined
                }
                priceSlot={
                  <PlanPrice
                    amountInCents={plan.amountInCents}
                    originalAmountInCents={plan.originalAmountInCents}
                    currency={plan.currency}
                    intervalLabel={intervalLabel}
                    noteLabel={plan.priceNote}
                    freeLabel={labels.free}
                    locale={locale}
                  />
                }
                featuresSlot={<PlanFeatures items={plan.features} />}
                extraSlots={
                  plan.pendingFeatures?.length ? (
                    <ul className="flex flex-col gap-2">
                      {plan.pendingFeatures.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm leading-snug text-muted-foreground"
                        >
                          <span className="flex-1">{item}</span>
                          <Badge variant="dashed" size="sm">
                            {labels.pending}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : undefined
                }
                cta={{
                  label: plan.ctaLabel,
                  onClick: () => onSelectPlan(plan.id),
                  loading: plan.id === pendingPlanId,
                  disabled:
                    plan.current === true ||
                    (pendingPlanId !== null && plan.id !== pendingPlanId),
                }}
              />
            ))}
      </PlanGrid>

      {rules.length > 0 ? (
        <ul className="grid gap-4 border-t border-muted pt-5 md:max-w-[980px] md:grid-cols-3 md:gap-7">
          {rules.map((rule, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13px] leading-5 text-muted-foreground [&>svg]:mt-0.5 [&>svg]:size-[15px] [&>svg]:shrink-0"
            >
              {rule.icon}
              <span>{rule.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
