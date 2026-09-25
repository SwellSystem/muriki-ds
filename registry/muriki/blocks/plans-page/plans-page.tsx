// A tela de Planos de dentro do app (design/muriki-code, tela_planos).
// Não é a do onboarding, e por isso o card também não é o PlanCard: aquele
// tem a hierarquia de quem está ESCOLHENDO (nome grande, preço que rola,
// selo de teste acima do preço, botão tingido). Aqui a pessoa já tem um
// plano e está conferindo: nome pequeno com o selo "atual" na mesma
// linha, preço de 34px, o teste como texto verde na linha de baixo, a
// lista com filete em cima e o botão no contorno.
//
// Cards, faixa de status e regras dividem a mesma largura (980px) e
// começam e terminam juntos.
//
// Controlada e sem API: recebe os planos já precificados no período e
// devolve a escolha por `onSelectPlan`.
import { useId, type ReactNode } from "react"
import { CheckIcon, SpinnerGap } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewToggle } from "@/components/ui/view-toggle"
import { cn } from "@/lib/utils"

export type PlansPageInterval = "month" | "year"
export type PlansPageCurrency = "BRL" | "USD" | "EUR"

export interface PlansPagePlan {
  id: string
  name: string
  /** Valor em centavos no período selecionado. Zero cai no rótulo grátis. */
  amountInCents: number
  currency?: PlansPageCurrency
  /** A linha de baixo do preço, ex.: "ou R$ 499 por ano", "para sempre, sem cartão". */
  priceNote?: string
  /** O teste, em verde depois da nota, ex.: "grátis até 1º de outubro". */
  trial?: string
  features: string[]
  /** O que ainda não tem número: esmaecido, com o selo tracejado. */
  pendingFeatures?: string[]
  /** O plano de quem está vendo: anel, selo "atual" e botão desligado. */
  current?: boolean
  /** O botão sai sólido, ex.: o Pro para quem está no Starter. Um por tela. */
  emphasized?: boolean
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
  /** Sufixo do preço, ex.: "mês" vira " /mês". */
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
  period: PlansPageInterval
  onPeriodChange: (next: PlansPageInterval) => void
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

const preco = (cents: number, currency: PlansPageCurrency, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)

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
  const intervalo = period === "year" ? labels.intervalYear : labels.intervalMonth

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
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
          <ViewToggle<PlansPageInterval>
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

      <div className="flex w-full max-w-[980px] flex-col gap-6">
        {status}

        <div className="grid gap-6 md:grid-cols-2">
          {loading
            ? Array.from({ length: loadingCount }, (_, i) => <PlanTileSkeleton key={i} />)
            : plans.map((plan) => (
                <PlanTile
                  key={plan.id}
                  plan={plan}
                  labels={labels}
                  intervalo={intervalo}
                  locale={locale}
                  pending={plan.id === pendingPlanId}
                  blocked={pendingPlanId !== null && plan.id !== pendingPlanId}
                  onSelect={() => onSelectPlan(plan.id)}
                />
              ))}
        </div>

        {rules.length > 0 ? (
          <ul className="grid gap-4 border-t border-muted px-1 pt-5 md:grid-cols-3 md:gap-7">
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
    </div>
  )
}

function PlanTile({
  plan,
  labels,
  intervalo,
  locale,
  pending,
  blocked,
  onSelect,
}: {
  plan: PlansPagePlan
  labels: PlansPageLabels
  intervalo: string
  locale: string
  pending: boolean
  blocked: boolean
  onSelect: () => void
}) {
  const nameId = useId()
  const gratis = plan.amountInCents === 0
  const desligado = plan.current === true || pending || blocked

  return (
    <section
      aria-labelledby={nameId}
      className={cn(
        "flex min-w-0 flex-col gap-5 rounded-2xl bg-card px-[30px] py-7",
        plan.current
          ? "shadow-float ring-[1.5px] ring-primary"
          : "shadow-sm"
      )}
    >
      <div className="flex items-center gap-2">
        <h2 id={nameId} className="text-lg font-semibold text-foreground-strong">
          {plan.name}
        </h2>
        {plan.current ? <Badge tone="blue">{labels.current}</Badge> : null}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[34px] leading-10 font-semibold tracking-[-0.02em] text-foreground-strong">
          {gratis ? labels.free : preco(plan.amountInCents, plan.currency ?? "BRL", locale)}
          {gratis ? null : (
            <span className="text-[15px] font-medium tracking-normal text-muted-foreground">
              {` /${intervalo}`}
            </span>
          )}
        </span>
        {plan.priceNote || plan.trial ? (
          <span className="text-[13px] text-muted-foreground">
            {plan.priceNote}
            {plan.priceNote && plan.trial ? " · " : null}
            {plan.trial ? <b className="font-medium text-success">{plan.trial}</b> : null}
          </span>
        ) : null}
      </div>

      <ul className="flex flex-1 flex-col gap-3 border-t border-muted pt-[18px]">
        {plan.features.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-[22px] text-foreground">
            <CheckIcon aria-hidden size={15} className="mt-[3px] shrink-0 text-success" />
            <span>{item}</span>
          </li>
        ))}
        {plan.pendingFeatures?.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-[22px] text-muted-foreground">
            <span className="flex-1">{item}</span>
            <Badge variant="dashed" className="mt-px">
              {labels.pending}
            </Badge>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        size="lg"
        variant={plan.emphasized && !plan.current ? "solid" : "outline"}
        className="h-10 w-full"
        onClick={onSelect}
        disabled={desligado}
        aria-busy={pending}
      >
        {pending ? <SpinnerGap aria-hidden size={16} className="animate-spin" /> : null}
        {plan.ctaLabel}
      </Button>
    </section>
  )
}

function PlanTileSkeleton() {
  // A mesma silhueta do card: nome, preço, quatro features e o botão.
  return (
    <div aria-hidden className="flex flex-col gap-5 rounded-2xl bg-card px-[30px] py-7 shadow-sm">
      <Skeleton className="h-5 w-24" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-3.5 w-48" />
      </div>
      <div className="flex flex-col gap-3 border-t border-muted pt-[18px]">
        {[72, 88, 64, 80].map((w) => (
          <Skeleton key={w} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
