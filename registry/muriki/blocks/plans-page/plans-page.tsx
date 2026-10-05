// A tela de Planos de dentro do app (design/muriki-code, tela_planos e o
// quadro PlanosCarregando).
// Não é a do onboarding, e por isso o card também não é o PlanCard: aquele
// tem a hierarquia de quem está ESCOLHENDO (nome grande, preço que rola,
// selo de teste acima do preço, botão tingido). Aqui a pessoa já tem um
// plano e está conferindo, e o cartão é compacto: nome de 16px com o selo
// "atual" na mesma linha, a descrição curta, preço de 28px, o teste como
// texto verde na linha de baixo, o botão logo abaixo do preço e, por
// último, os recursos em linhas (PlanFeatureRows), as mesmas nos dois
// cartões, para comparar de olho. O destaque do card, esse
// sim, é o mesmo do PlanCard: anel, fio de luz no topo, brilho no canto e
// a aba, para /plans falar a língua do onboarding.
//
// Cabeçalho, faixa de status, cards e regras moram numa coluna só: até
// 880px com dois cards (cada um perto de 430px; mais que isso, o preço e a
// lista se perdem no meio do cartão) e até 1200px com três. O seletor de
// período termina alinhado com a borda do último card.
//
// A escolha pode ser obrigatória (conta nova que ainda não escolheu: a API
// responde 403 PLAN_CHOICE_REQUIRED e o app segura a pessoa em /plans). Aí
// vêm três cards, Starter, o teste do Pro e o Pro pago, e a faixa de status
// no tom "required": informativa, sem alarme. Três cards ficam lado a lado
// só do lg para cima; abaixo, empilham, para nenhum ficar sozinho na linha.
//
// Controlada e sem API: recebe os planos já precificados no período e
// devolve a escolha por `onSelectPlan`.
import { useId, type ReactNode } from "react"
import { CheckIcon, SpinnerGap } from "@phosphor-icons/react"

import { RollingPrice } from "@/components/blocks/onboarding-pricing/plan-price"
import {
  PlanFeatureRows,
  PlanFeatureRowsSkeleton,
  type PlanFeature,
} from "@/components/blocks/plan-card/plan-feature-rows"
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
  /** A frase curta abaixo do nome (o `description` do plano). */
  description?: string
  /** Valor em centavos no período selecionado. Zero cai no rótulo grátis. */
  amountInCents: number
  /** O preço cheio quando um cupom baixou o valor: aparece riscado acima. */
  originalAmountInCents?: number
  currency?: PlansPageCurrency
  /** A linha de baixo do preço, ex.: "ou R$ 499 por ano", "para sempre, sem cartão". */
  priceNote?: string
  /** O teste, em verde depois da nota, ex.: "grátis até 1º de outubro". */
  trial?: string
  /**
   * Os recursos tipados do GET /plans, em linhas: o que o plano de base (o
   * primeiro) não tem ou tem menos sai em destaque. Com eles, `features` não
   * aparece.
   */
  featureRows?: PlanFeature[]
  /** A lista antiga, de frases com o check. */
  features?: string[]
  /** O que ainda não tem número: esmaecido, com o selo tracejado. */
  pendingFeatures?: string[]
  /** O selo verde ao lado do nome, ex.: "teste grátis" no card do teste do Pro. */
  badge?: string
  /** O plano de quem está vendo: botão desligado e, fora do destacado, o selo "atual". */
  current?: boolean
  /** O destaque do onboarding (anel, fio de luz, brilho, leve scale no md), normalmente o Pro.
   * O botão sai sólido quando o card não é o atual. Um por tela. */
  emphasized?: boolean
  /** A aba no canto de cima, ex.: "Atual" ou "Recomendado". */
  tab?: string
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
  /** O título mono acima das linhas de recursos, ex.: "O que vem no plano". */
  featuresTitle?: string
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
  const quantos = loading ? loadingCount : plans.length
  const base = plans[0]?.featureRows

  return (
    <div className={cn("flex w-full flex-col gap-6", quantos >= 3 ? "max-w-[1200px]" : "max-w-[880px]", className)}>
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

      <div className="flex w-full flex-col gap-6">
        {status}

        <div
          className={cn(
            "grid items-start gap-5",
            quantos >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"
          )}
        >
          {loading
            ? Array.from({ length: loadingCount }, (_, i) => (
                // o destaque fica onde o Pro costuma estar: o último de dois, o do meio de três
                <PlanTileSkeleton key={i} emphasized={i === (loadingCount >= 3 ? 1 : loadingCount - 1)} />
              ))
            : plans.map((plan) => (
                <PlanTile
                  key={plan.id}
                  plan={plan}
                  labels={labels}
                  intervalo={intervalo}
                  locale={locale}
                  base={base}
                  pending={plan.id === pendingPlanId}
                  blocked={pendingPlanId !== null && plan.id !== pendingPlanId}
                  onSelect={() => onSelectPlan(plan.id)}
                />
              ))}
        </div>

        {rules.length > 0 ? (
          <ul className="grid gap-4 border-t border-muted px-0.5 pt-4 md:grid-cols-3 md:gap-6">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[12.5px] leading-[19px] text-muted-foreground [&>svg]:mt-0.5 [&>svg]:size-[14px] [&>svg]:shrink-0"
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
  base,
  pending,
  blocked,
  onSelect,
}: {
  plan: PlansPagePlan
  labels: PlansPageLabels
  intervalo: string
  locale: string
  base?: PlanFeature[]
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
        "relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl bg-card px-6 pt-[22px] pb-3",
        plan.emphasized ? "shadow-float ring-[1.5px] ring-primary/60" : "shadow-sm"
      )}
    >
      {/* O mesmo destaque do PlanCard recomendado. */}
      {plan.emphasized ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/[0.08] blur-3xl"
          />
        </>
      ) : null}
      {plan.tab ? (
        <div className="absolute top-0 right-5 z-10 rounded-b-lg bg-primary px-2.5 py-[3px] text-[11.5px] font-semibold text-primary-foreground">
          {plan.tab}
        </div>
      ) : null}

      <div className="relative flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 id={nameId} className="text-base leading-[22px] font-semibold text-foreground-strong">
            {plan.name}
          </h2>
          {/* No destacado quem diz "atual" é a aba; aqui fica só a marca discreta. */}
          {plan.current && !plan.emphasized ? (
            <Badge tone="blue">{labels.current}</Badge>
          ) : null}
          {plan.badge ? <Badge tone="green">{plan.badge}</Badge> : null}
        </div>
        {plan.description ? (
          <p className="text-[13px] leading-[19px] text-muted-foreground">{plan.description}</p>
        ) : null}
      </div>

      <div className="relative flex flex-col gap-0.5">
        {!gratis &&
        plan.originalAmountInCents !== undefined &&
        plan.originalAmountInCents > plan.amountInCents ? (
          <s className="text-sm text-muted-foreground tabular-nums">
            {preco(plan.originalAmountInCents, plan.currency ?? "BRL", locale)}
          </s>
        ) : null}
        {/* O preço rola os dígitos na troca Mensal/Anual, o mesmo do onboarding. */}
        <p className="flex flex-wrap items-baseline gap-x-1 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-foreground-strong">
          {gratis ? (
            labels.free
          ) : (
            <>
              <RollingPrice value={preco(plan.amountInCents, plan.currency ?? "BRL", locale)} />
              <span className="text-sm font-medium tracking-normal text-muted-foreground">
                /{intervalo}
              </span>
            </>
          )}
        </p>
        {plan.priceNote || plan.trial ? (
          <span className="text-[12.5px] leading-[18px] text-muted-foreground">
            {plan.priceNote}
            {plan.priceNote && plan.trial ? " · " : null}
            {plan.trial ? <b className="font-medium text-success">{plan.trial}</b> : null}
          </span>
        ) : null}
      </div>

      <Button
        type="button"
        size="lg"
        variant={plan.emphasized && !plan.current ? "solid" : "outline"}
        className="relative h-[38px] w-full"
        onClick={onSelect}
        disabled={desligado}
        aria-busy={pending}
      >
        {pending ? <SpinnerGap aria-hidden size={16} className="animate-spin" /> : null}
        {plan.ctaLabel}
      </Button>
      {plan.featureRows ? (
        <PlanFeatureRows
          features={plan.featureRows}
          compareTo={plan.featureRows === base ? undefined : base}
          title={labels.featuresTitle}
          locale={locale}
          className="relative border-t border-muted"
        />
      ) : (
        <ul className="relative flex flex-1 flex-col gap-3 border-t border-muted pt-4 pb-3">
          {plan.features?.map((item) => (
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
      )}
    </section>
  )
}

function PlanTileSkeleton({ emphasized = false }: { emphasized?: boolean }) {
  // A mesma silhueta do card: nome e descrição, preço e nota, o botão e as
  // linhas de recursos. O destacado já vem com o anel, a aba e o botão
  // tingidos, para o olho saber onde vai estar o Pro (como o esqueleto do
  // onboarding do platform).
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl bg-card px-6 pt-[22px] pb-3",
        emphasized ? "shadow-sm ring-[1.5px] ring-primary/35" : "shadow-sm"
      )}
    >
      {emphasized ? <Skeleton className="absolute top-0 right-5 h-5 w-24 rounded-t-none rounded-b-lg bg-primary/25!" /> : null}
      <div className="flex flex-col gap-2 pt-0.5">
        <Skeleton className="h-4 w-[72px]" />
        <Skeleton className="h-3 w-[78%]" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-[30px] w-[116px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <Skeleton className={cn("h-[38px] w-full", emphasized && "bg-primary/25!")} />
      <PlanFeatureRowsSkeleton className="border-t border-muted" />
    </div>
  )
}
