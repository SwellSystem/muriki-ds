"use client"

/**
 * Os planos do workspace do Platform (CA9): os quatro cartões numa fileira, com as trocas de período
 * (Mensal / Anual, com o selo "−10%") e de moeda (BRL / USD) em cima. Sem `onCurrencyChange` a moeda
 * está travada (depois da primeira compra): no lugar da troca fica a moeda da assinatura, com o cadeado.
 *
 * O cartão é próprio, e não o PlanCard: este tem o brilho desfocado no canto, e a cobrança não tem
 * desfoque nem manchas (decisão de 2026-10-12). No cabeçalho, o ícone do plano num quadradinho e, ao
 * lado do nome, o selo de estado ("No teste" ou "Plano atual"). O recomendado tem o selo
 * "Recomendado", o contorno primary, o filete degradê no topo e a sombra funda, e na fileira de quatro
 * sobe e desce além dela. As linhas (cabeçalho, preço, lista e botão) se alinham por subgrid.
 *
 * O componente só mostra: o preço por pessoa vem pronto da API, em centavos, e sai no
 * `formatSeatPrice` (sem casas quando é inteiro, F12). O anual aparece por pessoa/ano, como vem, sem
 * dividir por 12. A única conta é o "a partir de" do plano com mínimo de assentos, só exibição. Os
 * itens da lista, a nota do pé e o rótulo do botão vêm do app (os padrões ficam em
 * `platform.billing.plans.{cta,features,footnote}`, para o app passar no `t()`): nada de recurso inventado aqui. O
 * Code Pro é a linha à parte, abaixo do tracejado, nos planos com `includesCodePro`.
 */
import type { ComponentType } from "react"
import {
  BuildingsIcon,
  CheckIcon,
  LeafIcon,
  LockSimpleIcon,
  SparkleIcon,
  UserIcon,
  UsersIcon,
  type IconProps,
} from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { RollingPrice } from "@/components/blocks/onboarding-pricing/plan-price"
import { formatSeatPrice } from "@/components/blocks/platform-members/invite-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { seatPlanFloor, seatPlanStatus, type SeatPlanPeriod } from "./plans"

export type SeatPlanCurrency = "BRL" | "USD"

export interface SeatPlanFeature {
  label: string
  /** A linha pequena embaixo, ex.: "termina em 26 de out. de 2026" no teste. */
  note?: string
}

export interface SeatPlan {
  /** A chave do plano na API, ex.: `platform_team`. Escolhe o ícone e volta no `onChoose`. */
  key: string
  name: string
  description: string
  /** Por pessoa, em centavos, na `currency` escolhida, como a API manda. `null` é o grátis. */
  pricePerSeat: { monthly: number; yearly: number } | null
  /** O mínimo de assentos (10 no Enterprise): acima de 1, o preço ganha o "a partir de". */
  minSeats?: number | null
  /** A linha "inclui Muriki Code Pro · na assinatura paga", abaixo do tracejado. */
  includesCodePro: boolean
  /** O botão vira "Falar com o comercial" e chama `onContactSales`; nunca o `onChoose` (sem ele, desabilitado). */
  contactSales?: boolean
  /** A lista com o check, do app: só o que o produto sustenta. */
  features: SeatPlanFeature[]
  /** A nota no pé da lista, ex.: "Precisa de mais gente? O Team não tem limite." */
  footnote?: string
  /** O rótulo do botão, do app, porque depende do estado ("Assinar o Team", "Mudar para o anual"). */
  ctaLabel: string
}

export interface SeatPlanCardsProps {
  plans: SeatPlan[]
  period: SeatPlanPeriod
  onPeriodChange: (period: SeatPlanPeriod) => void
  currency: SeatPlanCurrency
  /** Sem ele, a moeda está travada (a da assinatura) e aparece com o cadeado. */
  onCurrencyChange?: (currency: SeatPlanCurrency) => void
  /** A chave do plano assinado: ganha o selo "Plano atual". */
  currentPlan?: string
  /** O teste em curso: o plano ganha o selo "No teste", com a data de fim só para o leitor de tela. */
  trial?: { plan: string; endsAt: string }
  /** A chave do plano em destaque (o Team). */
  recommendedPlan?: string
  onChoose: (key: string) => void
  /** Chamado no botão dos planos com `contactSales`; sem ele, o botão desses planos fica desabilitado. */
  onContactSales?: () => void
  /** O idioma dos valores e da data, ex.: `pt-BR`. */
  locale: string
  /** O GET /plans ainda não voltou: as trocas já aparecem, e os cartões em silhueta. */
  loading?: boolean
  className?: string
}

// o ícone de cada plano, pela chave sem o prefixo
const ICONES: Record<string, ComponentType<IconProps>> = {
  free: LeafIcon,
  solo: UserIcon,
  team: UsersIcon,
  enterprise: BuildingsIcon,
}

/** O ícone do plano pela chave, com ou sem o prefixo `platform_` (o mesmo do cartão, no resumo do checkout). */
export function SeatPlanIcon({ planKey, className }: { planKey: string; className?: string }) {
  const Icone = ICONES[planKey.replace(/^platform_/, "")] ?? UsersIcon
  return <Icone aria-hidden className={className} />
}

// a fileira de quatro, do xl para cima; abaixo, duas colunas e depois uma
const GRADE = "grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-4"

// com recomendado, a grade abre os 22px que o cartão erguido passa da fileira, em cima e embaixo
const GRADE_ERGUIDA = "xl:mt-[22px] xl:mb-[22px]"

// o cartão ocupa as quatro linhas da grade e herda as trilhas dela (subgrid)
const MOLDURA = "relative row-span-4 grid grid-rows-subgrid gap-y-0 overflow-hidden rounded-[14px] bg-card px-6 pt-[22px] pb-6"

// o recomendado sobe e desce 22px além da fileira, e o respiro de dentro cresce o mesmo tanto
const ERGUIDO = "z-10 xl:-my-[22px] xl:pt-[44px] xl:pb-[46px]"

const COMUM = "border border-border/70 shadow-sm"

const DESTAQUE = cn(
  "border border-primary/65",
  "shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_15%,transparent),0_32px_64px_-24px_color-mix(in_oklab,var(--primary)_40%,rgba(0,0,0,0.45)),0_14px_28px_-14px_rgba(0,0,0,0.22)]"
)

const FILETE = "border-t border-border/60"

export function SeatPlanCards({
  plans,
  period,
  onPeriodChange,
  currency,
  onCurrencyChange,
  currentPlan,
  trial,
  recommendedPlan,
  onChoose,
  onContactSales,
  locale,
  loading = false,
  className,
}: SeatPlanCardsProps) {
  const t = useTranslate()
  const destaque = plans.findIndex((p) => p.key === recommendedPlan)
  // carregando, os planos podem não ter vindo: com recomendado, ele fica no lugar do Team (o 3º); sem, nenhum
  const destaqueNoEsqueleto = recommendedPlan === undefined ? -1 : destaque >= 0 ? destaque : 2

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewToggle<SeatPlanPeriod>
          ariaLabel={t("platform.billing.plans.period_label")}
          value={period}
          onChange={onPeriodChange}
          options={[
            { value: "monthly", label: t("platform.billing.plans.monthly") },
            {
              value: "yearly",
              label: t("platform.billing.plans.yearly"),
              badge: <Badge tone="green">{t("platform.billing.plans.yearly_discount")}</Badge>,
            },
          ]}
        />
        {onCurrencyChange ? (
          <ViewToggle<SeatPlanCurrency>
            ariaLabel={t("platform.billing.plans.currency_label")}
            value={currency}
            onChange={onCurrencyChange}
            options={[
              { value: "BRL", label: "BRL" },
              { value: "USD", label: "USD" },
            ]}
          />
        ) : (
          <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
            <LockSimpleIcon aria-hidden className="size-3.5" />
            {t(`platform.billing.plans.currency_locked.${currency}`)}
          </span>
        )}
      </div>

      {loading ? (
        <SeatPlanCardsSkeleton recommendedIndex={destaqueNoEsqueleto} />
      ) : (
        <div className={cn(GRADE, destaque >= 0 && GRADE_ERGUIDA)}>
          {plans.map((plano) => (
            <CartaoPlano
              key={plano.key}
              plano={plano}
              period={period}
              currency={currency}
              locale={locale}
              destaque={plano.key === recommendedPlan}
              estado={seatPlanStatus(plano.key, { currentPlan, trialPlan: trial?.plan })}
              fimDoTeste={trial?.endsAt}
              onChoose={onChoose}
              onContactSales={onContactSales}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CartaoPlano({
  plano,
  period,
  currency,
  locale,
  destaque,
  estado,
  fimDoTeste,
  onChoose,
  onContactSales,
}: {
  plano: SeatPlan
  period: SeatPlanPeriod
  currency: SeatPlanCurrency
  locale: string
  destaque: boolean
  estado: ReturnType<typeof seatPlanStatus>
  fimDoTeste?: string
  onChoose: (key: string) => void
  onContactSales?: () => void
}) {
  const t = useTranslate()
  const Icone = ICONES[plano.key.replace(/^platform_/, "")] ?? UsersIcon
  const piso = seatPlanFloor(plano.pricePerSeat, plano.minSeats, period)
  // o plano comercial nunca vai para o checkout: sem onContactSales, o botão fica desabilitado
  const comercial = plano.contactSales === true

  return (
    <article aria-label={plano.name} className={cn(MOLDURA, destaque ? [DESTAQUE, ERGUIDO] : COMUM)}>
      {destaque ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />
      ) : null}

      <header className="flex flex-col gap-1.5 pb-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span
            aria-hidden
            className={cn(
              "flex size-[34px] shrink-0 items-center justify-center rounded-[10px]",
              destaque
                ? "bg-primary text-primary-foreground"
                : "bg-sunken text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]"
            )}
          >
            <Icone className="size-[18px]" />
          </span>
          {destaque ? (
            <span className="inline-flex h-[22px] items-center gap-[5px] rounded-full bg-primary-subtle px-[9px] text-[11.5px] font-semibold whitespace-nowrap text-primary-subtle-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]">
              <SparkleIcon aria-hidden weight="fill" className="size-[11px]" />
              {t("platform.billing.plans.recommended")}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className="text-[28px] leading-[1.05] font-semibold tracking-[-0.02em] text-foreground-strong">
            {plano.name}
          </h3>
          {estado === "trial" ? (
            <Badge tone="green" dot>
              {t("platform.billing.plans.status.trial")}
              {fimDoTeste ? (
                <span className="sr-only">
                  {" "}
                  {t("platform.billing.plans.status.trial_until", { date: formatarData(fimDoTeste, locale) })}
                </span>
              ) : null}
            </Badge>
          ) : estado === "current" ? (
            <Badge>{t("platform.billing.plans.status.current")}</Badge>
          ) : null}
        </div>
        <p className="text-sm leading-[19px] text-muted-foreground">{plano.description}</p>
      </header>

      <div className={cn("flex flex-col justify-end gap-1 pt-3.5 pb-4", FILETE)}>
        {plano.pricePerSeat ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <RollingPrice
                value={formatSeatPrice(plano.pricePerSeat[period], currency, locale)}
                className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] whitespace-nowrap text-foreground-strong"
              />
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                {t(`platform.billing.plans.per_seat.${period}`)}
              </span>
            </p>
            <p className="text-[12.5px] leading-[17px] text-muted-foreground">
              {piso !== null
                ? t(`platform.billing.plans.from.${period}`, { price: formatSeatPrice(piso, currency, locale) })
                : t(`platform.billing.plans.billed.${period}`)}
            </p>
          </>
        ) : (
          <>
            <p className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-foreground-strong">
              {t("platform.billing.plans.free")}
            </p>
            <p className="text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.plans.free_note")}</p>
          </>
        )}
      </div>

      <div className={cn("flex flex-col justify-between gap-4 pt-4 pb-5", FILETE)}>
        <ul className="flex flex-col gap-2.5">
          {plano.features.map((item) => (
            <li key={item.label} className="flex items-start gap-[9px] text-sm leading-5 text-foreground">
              <CheckIcon aria-hidden weight="bold" className="mt-[2.5px] size-[15px] shrink-0 text-success" />
              <span className="flex flex-col">
                {item.label}
                {item.note ? (
                  <span className="text-[12.5px] leading-[17px] text-muted-foreground">{item.note}</span>
                ) : null}
              </span>
            </li>
          ))}
          {plano.includesCodePro ? (
            <li className="mt-1 flex items-start gap-[9px] border-t border-dashed border-input pt-3 text-sm leading-5 font-medium text-foreground-strong">
              <SparkleIcon aria-hidden weight="fill" className="mt-[2.5px] size-[15px] shrink-0 text-primary" />
              <span className="flex flex-col">
                {t("platform.billing.plans.code_pro")}
                <span className="text-[12.5px] leading-[17px] font-normal text-muted-foreground">
                  {t("platform.billing.plans.code_pro_note")}
                </span>
              </span>
            </li>
          ) : null}
        </ul>
        {plano.footnote ? (
          <p className="rounded-[10px] bg-sunken px-3 py-2.5 text-[12.5px] leading-[17px] text-muted-foreground">
            {plano.footnote}
          </p>
        ) : null}
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant={destaque ? "solid" : "secondary"}
          size="lg"
          className="h-10 w-full rounded-[10px]"
          disabled={comercial && !onContactSales}
          onClick={() => (comercial ? onContactSales?.() : onChoose(plano.key))}
        >
          {plano.ctaLabel}
        </Button>
      </div>
    </article>
  )
}

// a data do fim do teste no Intl do idioma ("26 de out. de 2026")
function formatarData(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso))
}

export interface SeatPlanCardsSkeletonProps {
  /** Quantos cartões em silhueta (4). */
  count?: number
  /** Qual deles é o recomendado, com o azul (2, o Team); -1 ou ausente, nenhum. */
  recommendedIndex?: number
  className?: string
}

/**
 * A espera dos planos, no molde do cartão: o recomendado erguido, com o contorno primary e o anel
 * primary/20, e o quadradinho, o selo e o botão em primary/25 (o azul do PlanCardSkeleton do platform
 * antigo). As silhuetas do nome e da descrição, do preço e de quatro linhas.
 */
export function SeatPlanCardsSkeleton({ count = 4, recommendedIndex, className }: SeatPlanCardsSkeletonProps) {
  const t = useTranslate()
  const erguida = recommendedIndex !== undefined && recommendedIndex >= 0 && recommendedIndex < count
  return (
    <div
      role="status"
      aria-label={t("platform.billing.plans.loading")}
      className={cn(GRADE, erguida && GRADE_ERGUIDA, className)}
    >
      {Array.from({ length: count }, (_, i) => {
        const destaque = i === recommendedIndex
        const tinta = destaque && "bg-primary/25!"
        return (
          <div
            key={i}
            aria-hidden
            className={cn(
              MOLDURA,
              destaque
                ? [
                    "border border-primary ring-[3px] ring-primary/20",
                    "shadow-[0_30px_60px_-24px_rgba(0,0,0,0.30),0_12px_24px_-12px_rgba(0,0,0,0.14)]",
                    ERGUIDO,
                  ]
                : COMUM
            )}
          >
            <div className="flex flex-col gap-2.5 pb-4">
              <div className="mb-2.5 flex items-center justify-between">
                <Skeleton className={cn("size-[34px] rounded-[10px]", tinta)} />
                {destaque ? <Skeleton className={cn("h-[22px] w-[104px] rounded-full", tinta)} /> : null}
              </div>
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
            <div className={cn("flex flex-col gap-2.5 pt-3.5 pb-4", FILETE)}>
              <Skeleton className="h-[34px] w-[150px]" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className={cn("flex flex-col gap-3 pt-[18px] pb-5", FILETE)}>
              <Skeleton className="h-3 w-[85%]" />
              <Skeleton className="h-3 w-[72%]" />
              <Skeleton className="h-3 w-[78%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
            <div className="flex items-end">
              <Skeleton className={cn("h-10 w-full rounded-[10px]", tinta)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
