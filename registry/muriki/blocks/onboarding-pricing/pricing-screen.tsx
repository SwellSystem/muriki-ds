// A tela de escolha de plano do onboarding, portada do muriki-platform e
// vestida com a casa.
//
// É apresentacional e controlada: recebe os planos já precificados no
// período selecionado e devolve a escolha por `onSelectPlan`. Quem sabe
// converter moeda, aplicar desconto anual e falar com a API é o consumidor.
//
// Dois wrappers do platform NÃO vieram. `BillingPeriodToggle` e
// `AccountTypeToggle` eram trinta linhas cada em volta do ViewToggle, sem
// acrescentar comportamento. Aqui os dois segmentados são o ViewToggle
// direto, montado nesta tela: um componente a menos para manter, e a mesma
// peça que o resto do sistema já usa.
//
// A grade e o card vêm do bloco `plan-card`, e o skeleton dele é o que
// aparece enquanto `loading`. Skeleton tem a anatomia do que substitui.
import type { ReactNode } from "react"

// Cada peça vem do seu arquivo, nunca do barril: o `shadcn add` reescreve
// o caminho do import para o alvo do item no registry, e um barril vira o
// primeiro arquivo da lista — PlanGrid passaria a ser procurado dentro de
// plan-card.tsx, onde não existe.
import { PlanCard } from "@/components/blocks/plan-card/plan-card"
import { PlanCardSkeleton } from "@/components/blocks/plan-card/plan-card-skeleton"
import { PlanGrid } from "@/components/blocks/plan-card/plan-grid"
import { Badge } from "@/components/ui/badge"
import { ViewToggle } from "@/components/ui/view-toggle"
import { cn } from "@/lib/utils"

import { OnboardingSectionLabel } from "./onboarding-section-label"
import { OnboardingStepHeader } from "./onboarding-step-header"
import { PlanFeatures } from "./plan-features"
import { PlanPrice, type PlanInterval } from "./plan-price"
import { PlanTrialBadge } from "./plan-trial-badge"
import type { PricingPlan } from "./types"

export type AccountType = "personal" | "business"

export interface PricingScreenLabels {
  stepper?: string
  stepperAria: string
  title: string
  subtitle?: ReactNode
  sectionLabel?: string
  accountAria: string
  accountPersonal: string
  accountBusiness: string
  periodAria: string
  periodMonth: string
  periodYear: string
  /** Selo verde no segmento anual, ex.: "-20%". */
  periodSaveBadge?: string
  /** Sufixo do preço mensal e anual, ex.: "mês" / "ano". */
  intervalMonth: string
  intervalYear: string
  free: string
  contactSales?: string
}

export interface PricingScreenProps {
  step?: number
  totalSteps?: number
  labels: PricingScreenLabels
  plans: PricingPlan[]
  /** Plano marcado como escolhido. */
  selectedPlanId?: string | null
  onSelectPlan: (planId: string) => void
  /** Id do plano cuja CTA está em espera. */
  pendingPlanId?: string | null
  onSecondaryCta?: (planId: string) => void
  period: PlanInterval
  onPeriodChange: (next: PlanInterval) => void
  /** Sem `onAccountTypeChange` o segmentado de conta não aparece. */
  accountType?: AccountType
  onAccountTypeChange?: (next: AccountType) => void
  /** Faixa acima da grade, ex.: o banner de retomar onboarding. */
  banner?: ReactNode
  loading?: boolean
  /** Quantos esqueletos mostrar enquanto carrega. Padrão 3. */
  loadingCount?: number
  locale?: string
  className?: string
}

export function PricingScreen({
  step = 2,
  totalSteps = 5,
  labels,
  plans,
  selectedPlanId = null,
  onSelectPlan,
  pendingPlanId = null,
  onSecondaryCta,
  period,
  onPeriodChange,
  accountType = "personal",
  onAccountTypeChange,
  banner,
  loading = false,
  loadingCount = 3,
  locale = "pt-BR",
  className,
}: PricingScreenProps) {
  const intervalLabel =
    period === "year" ? labels.intervalYear : labels.intervalMonth

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:gap-10 md:px-6 md:py-14",
        className
      )}
    >
      <OnboardingStepHeader
        step={step}
        total={totalSteps}
        stepperLabel={labels.stepper}
        stepperAriaLabel={labels.stepperAria}
        title={labels.title}
        subtitle={labels.subtitle}
      />

      {banner}

      <div className="flex flex-col gap-5">
        {labels.sectionLabel ? (
          <OnboardingSectionLabel label={labels.sectionLabel} />
        ) : null}

        {/* Os dois segmentados moram na mesma linha mas em pontas opostas.
            Lado a lado com o gap de sempre eles liam como UM controle de
            quatro segmentos, e a conta parecia um filtro do período. */}
        <div className="flex flex-wrap items-center gap-3">
          {onAccountTypeChange ? (
            <ViewToggle<AccountType>
              ariaLabel={labels.accountAria}
              value={accountType}
              onChange={onAccountTypeChange}
              options={[
                { value: "personal", label: labels.accountPersonal },
                { value: "business", label: labels.accountBusiness },
              ]}
            />
          ) : null}
          <ViewToggle<PlanInterval>
            className="md:ml-auto"
            ariaLabel={labels.periodAria}
            value={period}
            onChange={onPeriodChange}
            options={[
              { value: "month", label: labels.periodMonth },
              {
                value: "year",
                label: labels.periodYear,
                // O desconto anual é o que uma coisa É, não o que você faz
                // com ela — então é Badge, e não um segundo rótulo.
                badge: labels.periodSaveBadge ? (
                  <Badge tone="green" size="sm">
                    {labels.periodSaveBadge}
                  </Badge>
                ) : undefined,
              },
            ]}
          />
        </div>

        <PlanGrid>
          {loading
            ? Array.from({ length: loadingCount }, (_, i) => (
                <PlanCardSkeleton key={i} emphasized={i === 1} />
              ))
            : plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  description={plan.description}
                  emphasized={Boolean(plan.badge)}
                  selected={plan.id === selectedPlanId}
                  badgeSlot={
                    plan.badge ? (
                      <Badge tone="blue" size="sm">
                        {plan.badge}
                      </Badge>
                    ) : undefined
                  }
                  trialBadgeSlot={
                    plan.trial ? <PlanTrialBadge label={plan.trial} /> : undefined
                  }
                  priceSlot={
                    <PlanPrice
                      amountInCents={plan.amountInCents}
                      currency={plan.currency}
                      intervalLabel={intervalLabel}
                      noteLabel={plan.priceNote}
                      freeLabel={labels.free}
                      locale={locale}
                      contactSales={plan.contactSales}
                      contactSalesLabel={labels.contactSales}
                    />
                  }
                  featuresSlot={
                    <PlanFeatures
                      items={plan.features}
                      title={plan.featuresTitle}
                      accent={plan.badge ? "sparkle" : "check"}
                    />
                  }
                  extraSlots={plan.extra}
                  cta={{
                    label: plan.ctaLabel,
                    onClick: () => onSelectPlan(plan.id),
                    loading: plan.id === pendingPlanId,
                    disabled: pendingPlanId !== null && plan.id !== pendingPlanId,
                  }}
                  secondaryCta={
                    plan.secondaryCtaLabel && onSecondaryCta
                      ? {
                          label: plan.secondaryCtaLabel,
                          onClick: () => onSecondaryCta(plan.id),
                        }
                      : undefined
                  }
                />
              ))}
        </PlanGrid>
      </div>
    </div>
  )
}
