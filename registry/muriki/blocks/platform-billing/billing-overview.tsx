"use client"

/**
 * A página de Cobrança do workspace (C3, CA10), no desenho aprovado: abre com a próxima cobrança em
 * destaque e, abaixo, os assentos à esquerda e, à direita, o que mudou no período e os dados fiscais.
 *
 * - NextInvoiceHero: a folhinha do calendário (o mês em cima e o dia grande; a data inteira no
 *   aria-label), "Próxima cobrança", o valor e "N assentos × preço"; à direita, o plano, os selos de
 *   status e de período, "Gerenciar no Stripe" e "Ver planos". No Free, sem selo de status e "Nenhuma
 *   cobrança prevista.". No teste, a folhinha verde traz o fim do teste, e o herói vira a contagem dos
 *   dias com a barra e o "Escolher um plano", que leva aos planos (ou, já assinado, "A assinatura
 *   começa em …").
 * - SeatsSummary: "N ativos | M pagos neste período", a barra com um segmento por assento pago (o
 *   mínimo do plano à parte; quem sai, hachurado), os dois avisos (quem entra paga proporcional na
 *   hora; quem sai deixa de ser cobrado só na renovação), as pessoas com o Code Pro de cada uma (quem
 *   sai, tracejado, "pago até") e "Muriki Code Pro para os N ativos". No teste, ninguém paga; no Free,
 *   só os ativos; no `personal`, sem os avisos de quem entra e quem sai. O Code Pro segue o direito (R37), que o app passa em `codePro`.
 * - SeatChangesCard: "Neste período", as entradas e saídas (`seatChanges` do GET …/billing, no máximo
 *   10, só o nome de exibição). Com a lista vazia, o app não renderiza o cartão.
 * - TrialSubscribeCard: no teste, "Se assinar o Pro" com "N pessoas × preço = total/mês".
 * - FiscalDataCard: o CPF ou o CNPJ como vem da API, já mascarado, e a razão social.
 * - BillingOverview: a composição da página (o título, o herói e a grade de duas colunas), por slots.
 *
 * O componente só mostra: o valor da próxima cobrança vem pronto da API (`nextInvoice.amountInCents`,
 * F12), e o "N assentos × preço" é texto do que a API manda, sem conta. As barras saem de
 * `overview.ts` (os segmentos dos assentos e os dias do teste), só para exibir; as datas passam pelo
 * `formatBillingDate`, e uma data inválida some com o trecho dela. Não chama rede: o
 * portal do Stripe, os planos, a assinatura e a edição fiscal são callbacks ou links do app.
 */
import type { ReactElement, ReactNode } from "react"
import { ArrowClockwiseIcon, ArrowSquareOutIcon, CloudSlashIcon, LockSimpleIcon, SparkleIcon, UserMinusIcon, UserPlusIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { formatSeatPrice } from "@/components/blocks/platform-members/invite-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { formatBillingDate, SEAT_BAR_MAX_SEGMENTS, seatBarSegments, seatGrid, trialProgress, type SeatSegmentKind } from "./overview"
import type { SeatPlanPeriod } from "./plans"
import { isBrazil } from "./tax-id"

/** O status da assinatura do workspace, como o GET …/billing manda. */
export type BillingStatus = "trialing" | "free" | "active" | "past_due" | "unpaid" | "canceled"

/** A fatura prevista do Stripe (`nextInvoice` do GET …/billing): nula no Free, no teste sem assinatura e com o Stripe fora. */
export interface NextInvoice {
  /** O valor que o Stripe vai cobrar, em centavos, pronto (F12): o DS não calcula. */
  amountInCents: number
  currency: string
  /** A data da cobrança, ISO. */
  date: string
}

/**
 * Um botão do app: `onClick` como callback, ou `render` com o link do roteador ou o `<a>` do portal
 * (vence o `onClick`). Sem nenhum dos dois, o botão não aparece.
 */
export interface BillingAction {
  onClick?: () => void
  render?: ReactElement
}

// ── Herói: a próxima cobrança ───────────────────────────────────────────

export interface NextInvoiceHeroProps {
  /** O plano assinado, ex.: `{ key: "platform_pro", name: "Pro" }`. */
  plan: { key: string; name: string }
  status: BillingStatus
  /** O selo do período ("Mensal" / "Anual"). */
  period?: SeatPlanPeriod
  /** A fatura prevista; sem ela (e fora do teste), ou no Free, "Nenhuma cobrança prevista." no lugar do valor. */
  nextInvoice?: NextInvoice | null
  /**
   * O Stripe não respondeu (`nextInvoiceUnavailable` do GET …/billing): no lugar do valor, a folhinha
   * sem data e "Não deu para buscar a próxima cobrança agora.", com o `retry`. Fora do Free e do teste.
   */
  nextInvoiceUnavailable?: boolean
  /** "Tentar de novo", com o Stripe fora: o app busca o resumo de novo. */
  retry?: BillingAction
  /**
   * O "6 assentos × R$ 29" embaixo do valor: os assentos da fatura e o preço por pessoa do período, em
   * centavos, como a API manda. É só texto: o valor de cima não sai desta conta.
   */
  breakdown?: { seats: number; pricePerSeatInCents: number }
  /**
   * O teste em curso: o herói vira a contagem até `endsAt`, com a barra dos dias e o "Escolher um plano".
   * `subscribed`: já assinou durante o teste (a assinatura paga começa no fim dele); a contagem continua,
   * e a direita troca a nota e o "Escolher um plano" por "A assinatura começa em <fim>." e o "Gerenciar no Stripe".
   */
  trial?: { endsAt: string; days?: number; subscribed?: boolean }
  /** "Gerenciar no Stripe": o portal é do app (FE4). Fora do teste, ou no teste já assinado. */
  manage?: BillingAction
  /** "Ver planos". Fora do teste. */
  viewPlans?: BillingAction
  /**
   * "Escolher um plano", no teste ainda sem assinatura: o link para os planos. O teste é do plano de
   * topo (o Enterprise no `team`, o Ultimate no `personal`), e o plano a assinar se escolhe lá.
   */
  subscribe?: BillingAction
  /** Agora, para contar os dias do teste (o padrão é o relógio da máquina). */
  now?: string | Date
  /** O idioma dos valores e das datas, ex.: `pt-BR`. */
  locale: string
  className?: string
}

// o Free não leva selo: o nome do plano já diz
const TOM_DO_STATUS: Record<Exclude<BillingStatus, "free">, BadgeTone> = {
  active: "green",
  trialing: "green",
  past_due: "yellow",
  unpaid: "red",
  canceled: "gray",
}

export function NextInvoiceHero({
  plan,
  status,
  period,
  nextInvoice,
  breakdown,
  trial,
  manage,
  viewPlans,
  subscribe,
  nextInvoiceUnavailable = false,
  retry,
  now,
  locale,
  className,
}: NextInvoiceHeroProps) {
  const t = useTranslate()
  const noTeste = trial !== undefined
  const fatura = status === "free" ? null : nextInvoice
  const indisponivel = nextInvoiceUnavailable && status !== "free" && !fatura
  const dataDaFatura = fatura ? formatBillingDate(fatura.date, locale, { year: true }) : null
  const comecaEm = trial?.subscribed ? formatBillingDate(trial.endsAt, locale, { year: true }) : null

  return (
    <section
      aria-label={noTeste ? t("platform.billing.overview.hero.trial.label", { plan: plan.name }) : t("platform.billing.overview.hero.next")}
      className={cn(
        "relative grid grid-cols-1 overflow-hidden rounded-2xl bg-card lg:grid-cols-[minmax(0,1fr)_340px]",
        "shadow-sm ring-1 ring-[color-mix(in_oklab,var(--primary)_22%,transparent)]",
        className
      )}
    >
      {/* o filete degradê de 1px no topo, sem desfoque */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
      <div className="flex items-center gap-5 px-5 py-6 sm:gap-7 sm:px-8 sm:py-7">
        {noTeste ? (
          <ContagemDoTeste plano={plan.name} trial={trial} now={now} locale={locale} />
        ) : indisponivel ? (
          <>
            <FolhinhaVazia aria={t("platform.billing.overview.hero.unavailable_date")} />
            <div className="flex min-w-0 flex-col items-start gap-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">
                  {t("platform.billing.overview.hero.next")}
                </span>
                <span className="text-[20px] leading-[26px] font-semibold tracking-[-0.01em] text-balance text-foreground-strong sm:text-[22px] sm:leading-7">
                  {t("platform.billing.overview.hero.unavailable")}
                </span>
                <span className="text-[13.5px] leading-[19px] text-muted-foreground">
                  {t("platform.billing.overview.hero.unavailable_note")}
                </span>
              </div>
              <Acao acao={retry} variant="outline">
                {t("platform.billing.overview.hero.retry")}
                <ArrowClockwiseIcon aria-hidden className="size-3.5" />
              </Acao>
            </div>
          </>
        ) : fatura ? (
          <>
            {dataDaFatura ? (
              <Folhinha
                data={fatura.date}
                locale={locale}
                tom="primary"
                aria={t("platform.billing.overview.hero.next_date", { date: dataDaFatura })}
              />
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">
                {t("platform.billing.overview.hero.next")}
              </span>
              <span className="text-[44px] leading-[1.05] font-semibold tracking-[-0.035em] text-foreground-strong tabular-nums sm:text-[56px]">
                {formatSeatPrice(fatura.amountInCents, fatura.currency, locale)}
              </span>
              {breakdown ? (
                <span className="text-[13.5px] leading-[19px] text-muted-foreground tabular-nums">
                  {t("platform.billing.overview.hero.breakdown", {
                    count: breakdown.seats,
                    price: formatSeatPrice(breakdown.pricePerSeatInCents, fatura.currency, locale),
                  })}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">
              {t("platform.billing.overview.hero.next")}
            </span>
            <span className="text-[15px] leading-[22px] text-foreground">{t("platform.billing.overview.hero.none")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-3.5 px-5 py-6 shadow-[inset_0_1px_0_var(--muted)] sm:px-7 lg:shadow-[inset_1px_0_0_var(--muted)]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-foreground-strong">{plan.name}</span>
          {status !== "free" ? (
            <Badge tone={TOM_DO_STATUS[status]} dot>
              {t(`platform.billing.overview.hero.status.${status}`)}
            </Badge>
          ) : null}
          {period && !noTeste ? <Badge>{t(`platform.billing.plans.${period}`)}</Badge> : null}
        </div>
        {trial?.subscribed ? (
          <>
            {comecaEm ? (
              <p className="text-[13px] leading-[19px] text-foreground">
                {t("platform.billing.overview.hero.trial.subscribed", { date: comecaEm })}
              </p>
            ) : null}
            <Acao acao={manage} variant="primary" className="self-start">
              {t("platform.billing.overview.hero.manage")}
              <ArrowSquareOutIcon aria-hidden className="size-3.5" />
            </Acao>
          </>
        ) : noTeste ? (
          <>
            <p className="text-[13px] leading-[19px] text-foreground">{t("platform.billing.overview.hero.trial.note")}</p>
            <Acao acao={subscribe} variant="solid" className="h-10 w-full rounded-[10px]">
              {t("platform.billing.overview.hero.trial.choose")}
            </Acao>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-[19px] text-muted-foreground">{t("platform.billing.overview.hero.manage_note")}</p>
            {manage || viewPlans ? (
              <div className="flex flex-wrap gap-2">
                <Acao acao={manage} variant="primary">
                  {t("platform.billing.overview.hero.manage")}
                  <ArrowSquareOutIcon aria-hidden className="size-3.5" />
                </Acao>
                <Acao acao={viewPlans} variant="outline">
                  {t("platform.billing.overview.hero.plans")}
                </Acao>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function ContagemDoTeste({
  plano,
  trial,
  now,
  locale,
}: {
  plano: string
  trial: { endsAt: string; days?: number; subscribed?: boolean }
  now?: string | Date
  locale: string
}) {
  const t = useTranslate()
  const p = trialProgress(trial.endsAt, now ?? new Date(), trial.days)
  const fim = formatBillingDate(trial.endsAt, locale)
  const fimLongo = formatBillingDate(trial.endsAt, locale, { year: true })
  // o rótulo "hoje" fica sob o dia de hoje; perto do fim, cede o lugar à data do fim
  const hojeEmPct = p.todayIndex === null ? null : (p.todayIndex / p.total) * 100
  const mostraFim = hojeEmPct === null || hojeEmPct < 70

  return (
    <>
      {fimLongo ? (
        <Folhinha
          data={trial.endsAt}
          locale={locale}
          tom="success"
          aria={t("platform.billing.overview.hero.trial.ends", { plan: plano, date: fimLongo })}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">
            {t("platform.billing.overview.hero.trial.label", { plan: plano })}
          </span>
          <span className="flex items-baseline gap-2.5">
            <span className="text-[44px] leading-none font-semibold tracking-[-0.035em] text-foreground-strong tabular-nums sm:text-[56px]">
              {p.remaining}
            </span>
            <span className="text-base text-foreground">
              {t("platform.billing.overview.hero.trial.days", { count: p.remaining })}
            </span>
          </span>
        </div>
        <div className="flex max-w-[420px] flex-col gap-1.5">
          <div
            role="img"
            aria-label={t("platform.billing.overview.hero.trial.progress", { remaining: p.remaining, total: p.total })}
            className="flex gap-1"
          >
            {p.days.map((dia, i) => (
              <span
                key={i}
                className={cn("h-2 flex-1 rounded-[3px]", dia === "left" ? "bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))]" : "bg-primary")}
              />
            ))}
          </div>
          <div aria-hidden className="relative flex h-4 justify-end text-xs leading-4 text-muted-foreground">
            {hojeEmPct !== null ? (
              <span className="absolute top-0" style={{ left: `${hojeEmPct}%`, transform: `translateX(-${hojeEmPct}%)` }}>
                {t("platform.billing.overview.hero.trial.today")}
              </span>
            ) : null}
            {mostraFim && fim ? <span>{fim}</span> : null}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * A folhinha do calendário: o mês em cima, na cor do tom, e o dia grande. A data inteira vai no `aria`.
 * Só com data válida: quem chama confere antes (formatBillingDate).
 */
function Folhinha({ data, locale, tom, aria }: { data: string; locale: string; tom: "primary" | "success"; aria: string }) {
  const d = new Date(data)
  return (
    <span
      role="img"
      aria-label={aria}
      className="flex w-[72px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_1px_var(--border),0_10px_24px_-12px_rgba(0,0,0,0.3)] sm:w-[84px]"
    >
      <span
        aria-hidden
        className={cn(
          "flex h-[26px] items-center justify-center text-[12.5px] font-semibold text-primary-foreground",
          tom === "success" ? "bg-success" : "bg-primary"
        )}
      >
        {new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}
      </span>
      <span
        aria-hidden
        className="flex h-[52px] items-center justify-center text-[30px] font-semibold tracking-[-0.02em] text-foreground-strong tabular-nums sm:h-[60px] sm:text-[36px]"
      >
        {new Intl.DateTimeFormat(locale, { day: "numeric" }).format(d)}
      </span>
    </span>
  )
}

// a folhinha sem data: o topo apagado e a nuvem cortada no lugar do dia (o Stripe não respondeu)
function FolhinhaVazia({ aria }: { aria: string }) {
  return (
    <span
      role="img"
      aria-label={aria}
      className="flex w-[72px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_1px_var(--border),0_10px_24px_-12px_rgba(0,0,0,0.3)] sm:w-[84px]"
    >
      <span aria-hidden className="h-[26px] bg-sunken shadow-[inset_0_-1px_0_var(--border)]" />
      <span aria-hidden className="flex h-[52px] items-center justify-center text-muted-foreground sm:h-[60px]">
        <CloudSlashIcon className="size-7" />
      </span>
    </span>
  )
}

function Acao({
  acao,
  variant,
  className,
  children,
}: {
  acao?: BillingAction
  variant: "primary" | "outline" | "solid"
  className?: string
  children: ReactNode
}) {
  if (!acao || (!acao.render && !acao.onClick)) return null
  return (
    <Button
      variant={variant}
      size="lg"
      className={className}
      {...(acao.render ? { render: acao.render, nativeButton: false } : { type: "button" as const, onClick: acao.onClick })}
    >
      {children}
    </Button>
  )
}

// ── Assentos (CA10) ─────────────────────────────────────────────────────

export interface SeatPerson {
  id?: string
  /** O nome de exibição; a inicial vira o avatar. */
  name: string
  /** A própria conta: ganha o "você" e o avatar cheio. */
  you?: boolean
}

/** Acima disso, a grade mostra as primeiras pessoas e um "mais N pessoas". */
export const SEATS_GRID_MAX = 12

export interface SeatsSummaryProps {
  /** Os assentos do GET …/billing: os ativos e os pagos neste período (quem sai continua pago até a renovação). */
  seats: { active: number; paid: number }
  /**
   * As pessoas ativas, você primeiro (dos membros do workspace). Pode ser só uma página: o "mais N" sai
   * de `seats.active`, não do tamanho da lista.
   */
  people: SeatPerson[]
  /** Quem sai na renovação (os `leaving` do `seatChanges`): tracejado, "pago até". Sempre antes do corte. */
  leaving?: SeatPerson[]
  /** O fim do período pago (a data da próxima cobrança), no "pago até <data>". */
  paidUntil?: string
  /** O nome do plano, em "incluso na assinatura do Pro". */
  planName: string
  /**
   * O mínimo cobrado do plano (`platform.min_seats`, o Enterprise 10, R24): os assentos do mínimo que
   * passam dos ativos aparecem à parte na barra, como "mínimo do plano".
   */
  minSeats?: number | null
  /**
   * O Muriki Code Pro pelo direito (R37), não pela feature do plano: `'active'` (assinatura `active`, ou
   * `past_due` dentro da carência) põe o selo em cada pessoa e "para os N ativos"; `'pending'` (teste,
   * `unpaid` ou `canceled` num plano com o Code) fica apagado, "O Code Pro entra com a assinatura paga.";
   * ausente (Free), o Code Pro não aparece.
   */
  codePro?: "active" | "pending"
  /** No teste: ninguém paga e as pessoas ficam "No teste". */
  trial?: boolean
  /** No Free: só "N ativos", sem os pagos, a barra e os avisos do CA10, que falam de cobrança. */
  free?: boolean
  /**
   * No workspace `personal` (1 assento, ninguém entra nem sai): sem os avisos do CA10 de quem entra e
   * de quem sai.
   */
  personal?: boolean
  locale: string
  className?: string
}

// a hachura de quem sai: listras diagonais na cor primary a 45%, com o contorno do mesmo tom
const HACHURA = {
  backgroundImage:
    "repeating-linear-gradient(135deg, color-mix(in oklab, var(--primary) 45%, transparent) 0 3px, transparent 3px 6px)",
  boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--primary) 45%, transparent)",
}

const COR_DO_SEGMENTO: Record<SeatSegmentKind, string> = {
  active: "bg-primary",
  // o mínimo do plano: pago sem ninguém no assento, o azul pela metade
  minimum: "bg-[color-mix(in_oklab,var(--primary)_45%,var(--card))]",
  leaving: "",
  trial: "bg-[color-mix(in_oklab,var(--primary)_22%,var(--card))]",
}

export function SeatsSummary({
  seats,
  people,
  leaving = [],
  paidUntil,
  planName,
  minSeats,
  codePro,
  trial = false,
  free = false,
  personal = false,
  locale,
  className,
}: SeatsSummaryProps) {
  const t = useTranslate()
  const segmentos = seatBarSegments({ ...seats, trial, minSeats })
  // acima do máximo a barra agrupa por tipo, e cada grupo ganha uma largura mínima visível
  const agrupada = segmentos.reduce((soma, s) => soma + s.weight, 0) > SEAT_BAR_MAX_SEGMENTS
  const tem = (kind: SeatSegmentKind) => segmentos.some((s) => s.kind === kind)
  const pagos = trial ? 0 : seats.paid
  const grade = seatGrid(
    { people: people.map((p) => ({ ...p, sai: false })), leaving: trial ? [] : leaving.map((p) => ({ ...p, sai: true })), active: seats.active },
    SEATS_GRID_MAX
  )
  const visiveis = [...grade.people, ...grade.leaving]
  const pagoAte = formatBillingDate(paidUntil, locale)
  const ateQuando = pagoAte ? t("platform.billing.overview.seats.paid_until", { date: pagoAte }) : null

  return (
    <Cartao className={className}>
      <h2 className="text-sm leading-5 font-semibold text-foreground-strong">{t("platform.billing.overview.seats.title")}</h2>

      <div className="flex items-stretch gap-7">
        <Numero valor={seats.active} rotulo={t("platform.billing.overview.seats.active", { count: seats.active })} />
        {free ? null : (
          <>
            {/* no teste, o canvas não tem o divisor */}
            {trial ? null : <span aria-hidden className="w-px bg-muted" />}
            <Numero
              valor={pagos}
              apagado={trial}
              rotulo={t(trial ? "platform.billing.overview.seats.paid_trial" : "platform.billing.overview.seats.paid", { count: pagos })}
            />
          </>
        )}
      </div>

      {free ? null : (
        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={
              trial
                ? t("platform.billing.overview.seats.bar_trial", { active: seats.active })
                : t("platform.billing.overview.seats.bar", { active: seats.active, count: seats.paid })
            }
            className="flex gap-1"
          >
            {segmentos.map((s, i) => (
              <span
                key={i}
                className={cn("h-2.5 rounded-[3px]", agrupada && "min-w-1.5", COR_DO_SEGMENTO[s.kind])}
                style={{ flexGrow: s.weight, flexBasis: 0, ...(s.kind === "leaving" ? HACHURA : null) }}
              />
            ))}
          </div>
          {trial ? (
            <p className="text-[12.5px] leading-[17px] text-muted-foreground">
              {t("platform.billing.overview.seats.trial_note", { count: seats.active, plan: planName })}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-[12.5px] leading-[17px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-3.5 rounded-[2px] bg-primary" />
                  {t("platform.billing.overview.seats.legend_active")}
                </span>
                {tem("minimum") ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-2 w-3.5 rounded-[2px]", COR_DO_SEGMENTO.minimum)} />
                    {t("platform.billing.overview.seats.legend_minimum")}
                  </span>
                ) : null}
                {tem("leaving") ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-3.5 rounded-[2px]" style={HACHURA} />
                    {t("platform.billing.overview.seats.legend_leaving")}
                  </span>
                ) : null}
              </div>
              {personal ? null : (
                <p className="text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.overview.seats.rules")}</p>
              )}
            </>
          )}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
        {visiveis.map((p, i) => (
          <li
            key={p.id ?? `${p.name}-${i}`}
            className={cn(
              "flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2",
              p.sai ? "shadow-[inset_0_0_0_1px_var(--input)]" : "bg-sunken"
            )}
          >
            <Inicial nome={p.name} voce={p.you === true} sai={p.sai} />
            <span className="flex min-w-0 flex-col">
              <span
                className={cn(
                  "flex min-w-0 items-center gap-1.5 text-[13px] leading-[17px] font-medium",
                  p.sai ? "text-muted-foreground" : "text-foreground-strong"
                )}
              >
                <span className="truncate">{p.name}</span>
                {p.you ? (
                  <Badge variant="outline" size="sm" className="h-[15px] rounded-[4px] px-[5px] font-normal">
                    {t("platform.billing.overview.seats.you")}
                  </Badge>
                ) : null}
              </span>
              {p.sai ? (
                <span className="truncate text-xs leading-4 text-muted-foreground">
                  {ateQuando ?? t("platform.billing.overview.seats.leaving")}
                </span>
              ) : trial ? (
                <span className="text-xs leading-4 text-muted-foreground">{t("platform.billing.overview.seats.in_trial")}</span>
              ) : codePro === "active" ? (
                <span className="inline-flex items-center gap-1 text-xs leading-4 text-primary-subtle-foreground">
                  <SparkleIcon aria-hidden className="size-[11px]" />
                  {t("platform.billing.overview.seats.code_pro")}
                </span>
              ) : null}
            </span>
          </li>
        ))}
        {grade.more > 0 ? (
          <li className="flex items-center rounded-xl bg-sunken px-3 py-2 text-[13px] leading-[17px] text-muted-foreground">
            {t("platform.billing.overview.seats.more", { count: grade.more })}
          </li>
        ) : null}
      </ul>

      {codePro ? (
        <div className="flex items-center gap-3 border-t border-muted pt-4">
          <span
            aria-hidden
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-[9px]",
              codePro === "pending" ? "bg-sunken text-muted-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            <SparkleIcon className="size-4" />
          </span>
          <span className="flex flex-col">
            <span className="text-[13.5px] leading-[19px] font-medium text-foreground-strong">
              {codePro === "pending"
                ? t("platform.billing.overview.seats.code_pro_pending_title")
                : t("platform.billing.overview.seats.code_pro_active", { count: seats.active })}
            </span>
            <span className="text-[12.5px] leading-[17px] text-muted-foreground">
              {codePro === "pending"
                ? t("platform.billing.overview.seats.code_pro_pending")
                : t("platform.billing.overview.seats.code_pro_included", { plan: planName })}
            </span>
          </span>
        </div>
      ) : null}
    </Cartao>
  )
}

function Numero({ valor, rotulo, apagado = false }: { valor: number; rotulo: string; apagado?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-[34px] leading-[38px] font-semibold tracking-[-0.025em] tabular-nums",
          apagado ? "text-muted-foreground" : "text-foreground-strong"
        )}
      >
        {valor}
      </span>
      <span className="text-[13px] leading-[18px] text-muted-foreground">{rotulo}</span>
    </div>
  )
}

/** A inicial no círculo: você no azul cheio, os outros no azul claro, quem sai tracejado e apagado. */
function Inicial({ nome, voce, sai }: { nome: string; voce: boolean; sai: boolean }) {
  const inicial = Array.from(nome.trim())[0]?.toLocaleUpperCase() ?? "?"
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        sai
          ? "border-[1.5px] border-dashed border-muted-foreground text-muted-foreground opacity-60"
          : voce
            ? "bg-primary text-primary-foreground"
            : "bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] text-primary-subtle-foreground"
      )}
    >
      {inicial}
    </span>
  )
}

// ── Neste período ───────────────────────────────────────────────────────

/** Uma mudança de assento no período (`seatChanges` do GET …/billing): só o nome de exibição. */
export interface SeatChange {
  kind: "joined" | "leaving"
  name: string
  /** Quando entrou, ou quando foi removido, ISO. */
  at: string
  /** Quem entrou foi cobrado proporcional, na hora. */
  prorated?: boolean
}

/** O máximo de mudanças que a API manda (e que o cartão mostra). */
export const SEAT_CHANGES_MAX = 10

export interface SeatChangesCardProps {
  /** As mudanças, da mais antiga à mais nova. Com a lista vazia, o app não renderiza o cartão. */
  changes: SeatChange[]
  /** O período corrente, no canto ("12 de out. a 12 de nov."). */
  period?: { start: string; end: string }
  /** O fim do período pago, no "pago até" de quem sai (a data da próxima cobrança). */
  paidUntil?: string
  locale: string
  className?: string
}

export function SeatChangesCard({ changes, period, paidUntil, locale, className }: SeatChangesCardProps) {
  const t = useTranslate()
  const lista = changes.slice(0, SEAT_CHANGES_MAX)
  const inicio = period ? formatBillingDate(period.start, locale) : null
  const fim = period ? formatBillingDate(period.end, locale) : null
  const ate = formatBillingDate(paidUntil, locale)
  return (
    <Cartao className={className}>
      <header className="flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm leading-5 font-semibold text-foreground-strong">{t("platform.billing.overview.changes.title")}</h2>
        {inicio && fim ? (
          <span className="text-[12.5px] text-muted-foreground">
            {t("platform.billing.overview.changes.period", { start: inicio, end: fim })}
          </span>
        ) : null}
      </header>
      {lista.length === 0 ? (
        <p className="text-[13px] leading-[19px] text-muted-foreground">{t("platform.billing.overview.changes.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {lista.map((m, i) => {
            const entrou = m.kind === "joined"
            // uma data inválida some com o trecho dela, sem derrubar a lista
            const quando = formatBillingDate(m.at, locale)
            const nota = entrou
              ? m.prorated
                ? t("platform.billing.overview.changes.joined_prorated")
                : null
              : quando && ate
                ? t("platform.billing.overview.changes.leaving_note", { date: quando, until: ate })
                : quando
                  ? t("platform.billing.overview.changes.leaving_note_short", { date: quando })
                  : ate
                    ? t("platform.billing.overview.seats.paid_until", { date: ate })
                    : null
            const Icone = entrou ? UserPlusIcon : UserMinusIcon
            return (
              <li key={`${m.kind}-${m.name}-${m.at}-${i}`} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg",
                    entrou ? "bg-tone-green text-tone-green-foreground" : "bg-sunken text-muted-foreground"
                  )}
                >
                  <Icone className="size-[15px]" />
                </span>
                <span className="flex min-w-0 flex-col gap-px pt-px">
                  <span className="text-[13.5px] leading-[19px] font-medium text-foreground-strong">
                    {entrou
                      ? quando
                        ? t("platform.billing.overview.changes.joined", { name: m.name, date: quando })
                        : t("platform.billing.overview.changes.joined_no_date", { name: m.name })
                      : t("platform.billing.overview.changes.leaving", { name: m.name })}
                  </span>
                  {nota ? <span className="text-[12.5px] leading-[17px] text-muted-foreground">{nota}</span> : null}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Cartao>
  )
}

// ── Se assinar (no teste) ───────────────────────────────────────────────

export interface TrialSubscribeCardProps {
  /** O plano do teste, ex.: `{ key: "platform_pro", name: "Pro" }`. */
  plan: { key: string; name: string }
  /** As pessoas ativas hoje (os ativos do GET …/billing). */
  people: number
  /** O preço por pessoa do período, em centavos, como o GET /plans manda. */
  pricePerSeat: { amountInCents: number; currency: string }
  /** O período da conta; o padrão é o mensal. */
  period?: SeatPlanPeriod
  /** O mínimo de assentos do plano: a conta usa max(pessoas, minSeats), como a API cobra (R24/R28). */
  minSeats?: number | null
  /** O plano inclui o Code Pro: a linha "inclui Muriki Code Pro · na assinatura paga". */
  includesCodePro?: boolean
  /** "Assinar o Pro". */
  subscribe?: BillingAction
  locale: string
  className?: string
}

/**
 * "Se assinar o Pro", no teste: a conta com as pessoas de hoje, "N pessoas × preço = total/mês". É a
 * mesma exceção de exibição da F12 do CheckoutSummary (N × o preço que a API mandou, com N nunca abaixo
 * do mínimo); o valor cobrado de verdade sai da API no checkout.
 */
export function TrialSubscribeCard({
  plan,
  people,
  pricePerSeat,
  period = "monthly",
  minSeats,
  includesCodePro = false,
  subscribe,
  locale,
  className,
}: TrialSubscribeCardProps) {
  const t = useTranslate()
  const pessoas = Number.isFinite(people) && people > 0 ? Math.floor(people) : 0
  const cobradas = Math.max(pessoas, minSeats ?? 1)
  const preco = (centavos: number) => formatSeatPrice(centavos, pricePerSeat.currency, locale)
  return (
    <Cartao className={className}>
      <h2 className="text-sm leading-5 font-semibold text-foreground-strong">
        {t("platform.billing.overview.subscribe_card.title", { plan: plan.name })}
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-sm text-foreground tabular-nums">
          {t("platform.billing.checkout.seats_line", { count: cobradas, price: preco(pricePerSeat.amountInCents) })}
        </span>
        <span aria-hidden className="text-sm text-muted-foreground">
          =
        </span>
        <span className="inline-flex items-baseline gap-0.5">
          <span className="text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground-strong tabular-nums">
            {preco(pricePerSeat.amountInCents * cobradas)}
          </span>
          <span className="text-sm text-muted-foreground">{t(`platform.billing.overview.subscribe_card.per.${period}`)}</span>
        </span>
      </p>
      <p className="-mt-2 text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.overview.subscribe_card.note")}</p>
      {includesCodePro ? (
        <p className="flex items-start gap-[9px] border-t border-dashed border-input pt-3 text-sm leading-5 font-medium text-foreground-strong">
          <SparkleIcon aria-hidden weight="fill" className="mt-[2.5px] size-[15px] shrink-0 text-primary" />
          <span className="flex flex-col">
            {t("platform.billing.plans.code_pro")}
            <span className="text-[12.5px] leading-[17px] font-normal text-muted-foreground">
              {t("platform.billing.plans.code_pro_note")}
            </span>
          </span>
        </p>
      ) : null}
      <Acao acao={subscribe} variant="solid" className="h-10 w-full rounded-[10px]">
        {t("platform.billing.overview.hero.trial.subscribe", { plan: plan.name })}
      </Acao>
    </Cartao>
  )
}

// ── Dados fiscais ───────────────────────────────────────────────────────

export interface FiscalDataCardProps {
  /** O documento como a API manda, já mascarado (ex.: `***.***.247-25` no CPF; no CNPJ, só os dois primeiros e os dois últimos dígitos à vista); nunca o valor inteiro. */
  taxId?: { kind: "cpf" | "cnpj"; masked: string } | null
  /** A razão social, no CNPJ. */
  legalName?: string | null
  /**
   * O país declarado (`billing.country`, ISO 3166-1). Sem documento: fora do Brasil, a nota de que o
   * Stripe pede o número fiscal; no Brasil, ou sem país, "Nenhum documento informado.".
   */
  country?: string | null
  /** "Editar": o app abre a edição (vale a partir da próxima cobrança). */
  onEdit?: () => void
  /** No teste, os dados são pedidos ao assinar. */
  trial?: boolean
  className?: string
}

export function FiscalDataCard({ taxId, legalName, country, onEdit, trial = false, className }: FiscalDataCardProps) {
  const t = useTranslate()
  const titulo = (
    <h2 className="text-sm leading-5 font-semibold text-foreground-strong">{t("platform.billing.fiscal.title")}</h2>
  )

  if (trial) {
    return (
      <Cartao className={className}>
        {titulo}
        <p className="flex items-start gap-2 text-[13px] leading-[19px] text-muted-foreground">
          <LockSimpleIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {t("platform.billing.overview.fiscal.trial")}
        </p>
      </Cartao>
    )
  }

  return (
    <Cartao className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {titulo}
          <p className="text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.overview.fiscal.applies")}</p>
        </div>
        {onEdit ? (
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            {t("platform.billing.overview.fiscal.edit")}
          </Button>
        ) : null}
      </div>
      {taxId ? (
        <dl className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[12.5px] leading-[17px] text-muted-foreground">{t(`platform.billing.fiscal.${taxId.kind}.label`)}</dt>
            <dd className="font-mono text-[13px] leading-[19px] text-foreground-strong">{taxId.masked}</dd>
          </div>
          {legalName ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-[12.5px] leading-[17px] text-muted-foreground">{t("platform.billing.fiscal.legal_name.label")}</dt>
              <dd className="text-[13.5px] leading-[19px] text-foreground-strong">{legalName}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="text-[13px] leading-[19px] text-muted-foreground">
          {country && !isBrazil(country) ? t("platform.billing.fiscal.outside_brazil") : t("platform.billing.overview.fiscal.none")}
        </p>
      )}
    </Cartao>
  )
}

// ── A página ────────────────────────────────────────────────────────────

export interface BillingOverviewProps {
  /** O `<NextInvoiceHero />`. */
  hero: ReactNode
  /** O `<SeatsSummary />`, na coluna larga. */
  seats: ReactNode
  /**
   * A coluna estreita: o `<SeatChangesCard />` (quando há `seatChanges`) e o `<FiscalDataCard />`; no
   * teste, o `<TrialSubscribeCard />` acima dos dados fiscais.
   */
  aside?: ReactNode
  /** O título da página; o padrão é "Cobrança". */
  title?: ReactNode
  /** A linha de contexto; o padrão é "O plano do workspace, os assentos e os dados da cobrança." */
  subtitle?: ReactNode
  className?: string
}

/** A composição da página: o título, o herói e a grade de duas colunas (abaixo de `lg`, uma só). */
export function BillingOverview({ hero, seats, aside, title, subtitle, className }: BillingOverviewProps) {
  const t = useTranslate()
  return (
    <div data-slot="billing-overview" className={cn("mx-auto flex w-full max-w-[1040px] flex-col gap-6", className)}>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
          {title ?? t("platform.billing.overview.title")}
        </h1>
        <p className="text-sm leading-5 text-muted-foreground">{subtitle ?? t("platform.billing.overview.subtitle")}</p>
      </header>
      {hero}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {seats}
        {aside ? <div className="flex flex-col gap-5">{aside}</div> : null}
      </div>
    </div>
  )
}

// ── Peças ───────────────────────────────────────────────────────────────

function Cartao({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-[18px] rounded-[14px] bg-card px-[22px] py-5 shadow-sm", className)}>{children}</section>
  )
}
