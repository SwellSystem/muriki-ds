"use client"

/**
 * O checkout do workspace, em página de dentro do produto (não é etapa do onboarding). CheckoutPage é
 * a moldura (BillingPageLayout) com o formulário à esquerda: o caminho "← Planos / Assinar o X /
 * Pagamento no Stripe", o título, o período (Mensal / Anual −10%), os dados fiscais (o FiscalForm, no
 * slot `fiscal`), "Continuar para o pagamento" e a nota do Stripe. O resumo vem no slot `summary`.
 *
 * O subtítulo e o resumo seguem o tipo do workspace (`kind`): no `team`, cada pessoa é um assento; no
 * `personal`, o workspace é só da pessoa e paga 1 assento. O plano aparece pelo nome que vem por prop.
 *
 * CheckoutSummary é o resumo da faixa da direita: o plano com o ícone e o período, as pessoas do
 * workspace (os avatares e "N pessoas no <workspace> · você + N"; no `personal`, "Só você" e o seu
 * nome), as linhas "N pessoas × preço" e
 * "Muriki Code Pro … incluso" (na assinatura paga), o cupom (o CouponField do onboarding-pricing, só no
 * mensal: a API recusa cupom no anual) e o total.
 *
 * O componente só mostra: o preço por pessoa vem da API, em centavos, por período (o anual por
 * pessoa/ano, sem dividir por 12). O "N × preço = total" é a única conta, só exibição, a mesma exceção
 * do SeatsPreview (F12), com N = max(pessoas, minSeats), como a API cobra. Com o cupom aplicado, o desconto e o total com desconto vêm prontos do app (a
 * API valida e calcula); aqui eles só aparecem, com o total cheio riscado. Não chama rede: o envio, o
 * cupom e a volta para os planos são callbacks.
 */
import type { ReactElement, ReactNode } from "react"
import { ArrowRightIcon, LockSimpleIcon, SparkleIcon, SpinnerGapIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { CouponField } from "@/components/blocks/onboarding-pricing/coupon-field"
import { formatSeatPrice } from "@/components/blocks/platform-members/invite-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  BillingFormHeader,
  BillingPageLayout,
  SummaryCheckItem,
  SummaryChecklist,
  SummaryHeader,
  SummaryRow,
  SummarySection,
} from "./billing-page"
import type { SeatPlanPeriod } from "./plans"
import type { WorkspaceKind } from "./tax-id"

export interface CheckoutPageProps {
  /** O tipo do workspace: a linha de contexto diz "cada pessoa ocupa um assento" (`team`) ou "um assento" (`personal`). */
  kind: WorkspaceKind
  /** O nome do plano, no título "Assinar o Pro". */
  planName: string
  period: SeatPlanPeriod
  onPeriodChange: (period: SeatPlanPeriod) => void
  /** Os dados fiscais: o `<FiscalForm />`. */
  fiscal: ReactNode
  /** "Continuar para o pagamento": o app valida (`fiscalErrors`), chama o checkout e segue para o Stripe. */
  onSubmit: () => void
  /** O checkout está em curso: o botão gira e não manda de novo. */
  submitting?: boolean
  /** O resumo da direita: o `<CheckoutSummary />`. */
  summary: ReactNode
  /** O "← Planos" como botão. */
  onBack?: () => void
  /** O "← Planos" como o link do roteador do app (vence o `onBack`). */
  backRender?: ReactElement
  className?: string
}

export function CheckoutPage({
  kind,
  planName,
  period,
  onPeriodChange,
  fiscal,
  onSubmit,
  submitting = false,
  summary,
  onBack,
  backRender,
  className,
}: CheckoutPageProps) {
  const t = useTranslate()
  const titulo = t("platform.billing.checkout.title", { plan: planName })

  return (
    <BillingPageLayout
      current={titulo}
      next={
        <>
          <LockSimpleIcon aria-hidden />
          {t("platform.billing.checkout.trail_stripe")}
        </>
      }
      onBack={onBack}
      backRender={backRender}
      aside={summary}
      className={className}
    >
      <BillingFormHeader title={titulo} subtitle={t(`platform.billing.checkout.subtitle.${kind}`)} />
      <form
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!submitting) onSubmit()
        }}
        className="flex flex-col gap-[26px]"
      >
        <div className="flex flex-col gap-2.5">
          <span className="text-sm leading-none font-medium text-foreground-strong">{t("platform.billing.checkout.period")}</span>
          <ViewToggle<SeatPlanPeriod>
            ariaLabel={t("platform.billing.plans.period_label")}
            value={period}
            onChange={onPeriodChange}
            className="self-start"
            options={[
              { value: "monthly", label: t("platform.billing.plans.monthly") },
              {
                value: "yearly",
                label: t("platform.billing.plans.yearly"),
                badge: <Badge tone="green">{t("platform.billing.plans.yearly_discount")}</Badge>,
              },
            ]}
          />
        </div>
        {fiscal}
        <div className="flex flex-col gap-2.5">
          <Button type="submit" variant="solid" size="touch" className="w-full" disabled={submitting}>
            {submitting ? <SpinnerGapIcon aria-hidden className="animate-spin" /> : null}
            {t("platform.billing.checkout.submit")}
            {submitting ? null : <ArrowRightIcon aria-hidden className="size-[15px]" />}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[12.5px] leading-4 text-muted-foreground">
            <LockSimpleIcon aria-hidden className="size-[13px]" />
            {t("platform.billing.checkout.stripe_note")}
          </p>
        </div>
      </form>
    </BillingPageLayout>
  )
}

// ── O resumo ────────────────────────────────────────────────────────────

export interface CheckoutCoupon {
  /** Chamado com o código em maiúsculas; quem valida é a API (no Platform, o cupom é só percentual). */
  onApply: (code: string) => void
  onRemove?: () => void
  /** A API recusou o código. */
  error?: string
  /** A validação está em curso. */
  pending?: boolean
  /**
   * O cupom aceito, com os valores prontos da API, em centavos: o desconto do período e o total com
   * ele. `durationInMonths` é por quantos meses vale (sem ele, para sempre): entra na nota do total.
   */
  applied?: {
    code: string
    /** O que ele dá, ex.: "20% nos 3 primeiros meses". */
    description?: string
    discountInCents: number
    totalInCents: number
    durationInMonths?: number | null
  } | null
}

export interface CheckoutSummaryProps {
  /** A chave do plano (escolhe o ícone) e o nome. */
  plan: { key: string; name: string }
  /**
   * O tipo do workspace. Padrão: `team`, que cobra uma pessoa por assento. No `personal`, o resumo é
   * "Só você", com 1 assento, mesmo que `people` traga mais alguém.
   */
  kind?: WorkspaceKind
  period: SeatPlanPeriod
  workspaceName: string
  /** Quem conta como assento, você primeiro (as iniciais saem do nome). */
  people: { name: string }[]
  /** O preço por pessoa no período, da API (F12): o anual por pessoa/ano. */
  pricePerSeat: { amountInCents: number; currency: string }
  /** O mínimo de assentos do plano, do admin (o Enterprise tem): a conta cobra max(pessoas, minSeats). */
  minSeats?: number | null
  /** A linha "Muriki Code Pro … incluso", com "na assinatura paga" (Pro e Enterprise). */
  includesCodePro: boolean
  /** A lista com o check no pé, do app, ex.: "Até 5 pessoas". */
  features?: string[]
  /**
   * O campo do cupom; sem ele, o resumo não tem cupom (o app só o liga quando a API aceitar). Só vale no
   * mensal: no anual, o campo, a linha e o total com cupom não aparecem (a API responde COUPON_INVALID).
   */
  coupon?: CheckoutCoupon
  /** O idioma dos valores, ex.: `pt-BR`. */
  locale: string
  className?: string
}

// quantos avatares a pilha desenha antes do "+N"
const AVATARES = 6

export function CheckoutSummary({
  plan,
  kind = "team",
  period,
  workspaceName,
  people,
  pricePerSeat,
  minSeats,
  includesCodePro,
  features = [],
  coupon,
  locale,
  className,
}: CheckoutSummaryProps) {
  const t = useTranslate()
  // o `personal` é só a pessoa: 1 assento, e só ela no resumo
  const pessoal = kind === "personal"
  const pessoas = pessoal ? people.slice(0, 1) : people
  const total = pessoas.length
  const preco = (centavos: number) => formatSeatPrice(centavos, pricePerSeat.currency, locale)
  const noPeriodo = (centavos: number) => t(`platform.billing.checkout.amount.${period}`, { price: preco(centavos) })
  // a única conta, só exibição (F12): N × o preço por pessoa que a API mandou, com N nunca abaixo do
  // mínimo do plano, como a API cobra (max(ativos, min_seats)); o `personal` paga sempre 1
  const cobradas = pessoal ? 1 : Math.max(total, minSeats ?? 1)
  const totalCheio = pricePerSeat.amountInCents * cobradas
  // o cupom só vale no mensal (a API recusa no anual)
  const comCupom = coupon && period === "monthly" ? coupon : undefined
  const aplicado = comCupom?.applied ?? null
  const desenhados = total > AVATARES ? pessoas.slice(0, AVATARES - 1) : pessoas

  return (
    <div data-slot="checkout-summary" className={cn("flex flex-col gap-5", className)}>
      <SummaryHeader
        planKey={plan.key}
        name={plan.name}
        badge={<Badge>{t(`platform.billing.plans.${period}`)}</Badge>}
      />

      <div className="flex items-center gap-3">
        <span aria-hidden className="flex shrink-0">
          {desenhados.map((p, i) => (
            <span
              key={i}
              className={cn(
                "flex size-[30px] items-center justify-center rounded-full text-xs font-semibold uppercase ring-[2.5px] ring-rail",
                i > 0 && "-ml-2",
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] text-primary-subtle-foreground"
              )}
            >
              {[...p.name.trim()][0]}
            </span>
          ))}
          {total > desenhados.length ? (
            <span className="-ml-2 flex size-[30px] items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground tabular-nums ring-[2.5px] ring-rail">
              +{total - desenhados.length}
            </span>
          ) : null}
        </span>
        <span className="flex min-w-0 flex-col">
          {/* só você (o `personal`, ou um time de 1): "Só você" e o seu nome; com mais gente, as pessoas
              do workspace e "você + N"; sem ninguém na lista, só o nome do workspace */}
          <span className="truncate text-sm leading-5 font-medium text-foreground-strong">
            {total === 0
              ? workspaceName
              : total === 1
                ? t("platform.billing.checkout.just_you")
                : t("platform.members.seats.title", { count: total, workspace: workspaceName })}
          </span>
          {total > 0 ? (
            <span className="truncate text-[12.5px] leading-[17px] text-muted-foreground">
              {total === 1 ? pessoas[0].name : t("platform.members.seats.count", { count: total - 1 })}
            </span>
          ) : null}
        </span>
      </div>

      <SummarySection>
        <SummaryRow
          label={t("platform.billing.checkout.seats_line", { count: cobradas, price: preco(pricePerSeat.amountInCents) })}
          value={noPeriodo(totalCheio)}
        />
        {includesCodePro ? (
          <SummaryRow
            label={
              <span className="inline-flex flex-col">
                <span className="inline-flex items-center gap-1.5">
                  <SparkleIcon aria-hidden weight="fill" className="size-[13px] text-primary" />
                  {t("platform.billing.checkout.code_pro")}
                </span>
                {/* quem assina no teste fica no teste até o fim dele, e o teste não dá o Code (R37) */}
                <span className="text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.checkout.code_pro_note")}</span>
              </span>
            }
            value={t("platform.billing.checkout.included")}
          />
        ) : null}
        {aplicado ? (
          <SummaryRow
            label={
              <>
                {t("platform.billing.coupon.line")}{" "}
                <span className="font-mono text-[12.5px] tracking-[0.04em]">{aplicado.code}</span>
              </>
            }
            value={<span className="text-success">−{preco(aplicado.discountInCents)}</span>}
          />
        ) : null}
      </SummarySection>

      {comCupom ? (
        <CouponField
          labels={{
            trigger: t("platform.billing.coupon.trigger"),
            field: t("platform.billing.coupon.field"),
            placeholder: t("platform.billing.coupon.placeholder"),
            apply: t("platform.billing.coupon.apply"),
            remove: t("platform.billing.coupon.remove"),
          }}
          onApply={comCupom.onApply}
          onRemove={comCupom.onRemove}
          applied={aplicado ? { code: aplicado.code, description: aplicado.description } : null}
          error={comCupom.error}
          pending={comCupom.pending}
          className="-my-1 [&>button]:ml-auto [&>button]:px-0"
        />
      ) : null}

      <SummarySection className="gap-1.5">
        <SummaryRow
          strong
          label={t(`platform.billing.checkout.total.${period}`)}
          value={
            aplicado ? (
              <span className="inline-flex items-baseline gap-2">
                <s className="font-normal text-muted-foreground">{preco(totalCheio)}</s>
                {preco(aplicado.totalInCents)}
              </span>
            ) : (
              preco(totalCheio)
            )
          }
        />
        {aplicado?.durationInMonths ? (
          <p className="text-right text-[12.5px] leading-[17px] text-muted-foreground">
            {t("platform.billing.coupon.note", { count: aplicado.durationInMonths, total: noPeriodo(totalCheio) })}
          </p>
        ) : null}
      </SummarySection>

      {features.length > 0 ? (
        <SummaryChecklist>
          {features.map((f) => (
            <SummaryCheckItem key={f}>{f}</SummaryCheckItem>
          ))}
        </SummaryChecklist>
      ) : null}
    </div>
  )
}
