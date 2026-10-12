"use client"

/**
 * Falar com o comercial (CA13), aberto a partir do Enterprise, na mesma moldura do checkout
 * (BillingPageLayout): o ContactSalesForm à esquerda e o ContactSalesSummary à direita.
 *
 * ContactSalesForm: quantas pessoas, com − e + (um inteiro de 1 a 100.000, F11), e a mensagem
 * opcional de até 2.000 caracteres com o contador (o `showCount` do Textarea, que conta como a API).
 * Enviado, a confirmação toma o lugar do formulário, com o pedido citado (a mensagem como texto puro,
 * escapada pelo React) e "Voltar para os planos"; o foco vai para o título dela.
 *
 * ContactSalesSummary: o preço por pessoa, o mínimo, a estimativa (N × preço, nunca abaixo do mínimo:
 * a conta é só exibição, como a do SeatsPreview, F12), o contrato, o Code Pro para as pessoas pedidas
 * (cada membro ativo recebe o Code Pro) e "O que acontece
 * depois" em 3 passos, com o passo de agora.
 *
 * Controlado por fora e sem rede: o app guarda `value`, manda o POST …/sales-contact no `onSubmit` e
 * passa `submitting` e `sent`.
 */
import { useEffect, useId, useRef, type ReactElement } from "react"
import { CheckIcon, ClockIcon, MinusIcon, PlusIcon, SparkleIcon, SpinnerGapIcon, UsersIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { formatSeatPrice } from "@/components/blocks/platform-members/invite-form"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  BillingFormHeader,
  SummaryCheckItem,
  SummaryChecklist,
  SummaryHeader,
  SummaryRow,
  SummarySection,
} from "./billing-page"

/** F11: as pessoas vão de 1 a 100.000, e a mensagem até 2.000 caracteres. */
export const SALES_SEATS_MIN = 1
export const SALES_SEATS_MAX = 100_000
export const SALES_MESSAGE_MAX = 2_000

export interface ContactSalesValue {
  /** `null` é o campo vazio, enquanto a pessoa apaga para digitar outro número. */
  seats: number | null
  message: string
}

export interface ContactSalesFormProps {
  value: ContactSalesValue
  onChange: (value: ContactSalesValue) => void
  /** "Enviar": o app manda `{ seats, message? }` (a mensagem vazia não vai). Sem pessoas, o botão fica desligado. */
  onSubmit: () => void
  submitting?: boolean
  /** O pedido foi aceito (202): a confirmação toma o lugar do formulário. */
  sent?: boolean
  /** O e-mail em que o comercial responde, na confirmação. */
  email: string
  /** O mínimo do Enterprise, na linha de contexto (10). */
  minSeats?: number
  /** O fim do teste do Team, se houver: a confirmação diz que ele segue até lá. */
  trialEndsAt?: string
  /** O idioma da data do teste, ex.: `pt-BR`. */
  locale: string
  /** "Voltar para os planos", na confirmação, como botão. */
  onBack?: () => void
  /** O mesmo, como o link do roteador do app (vence o `onBack`). */
  backRender?: ReactElement
  className?: string
}

export function ContactSalesForm({
  value,
  onChange,
  onSubmit,
  submitting = false,
  sent = false,
  email,
  minSeats = 10,
  trialEndsAt,
  locale,
  onBack,
  backRender,
  className,
}: ContactSalesFormProps) {
  const t = useTranslate()
  const { seats, message } = value
  const idMensagem = useId()
  const tituloEnviado = useRef<HTMLHeadingElement>(null)

  // o formulário some ao enviar: o foco vai para o título da confirmação, e não para o body
  useEffect(() => {
    if (sent) tituloEnviado.current?.focus()
  }, [sent])

  if (sent) {
    const mensagem = message.trim()
    return (
      <div role="status" data-slot="contact-sales-sent" className={cn("flex flex-col gap-[22px]", className)}>
        <span
          aria-hidden
          className="flex size-14 items-center justify-center rounded-2xl bg-tone-green text-tone-green-foreground shadow-[0_0_0_8px_color-mix(in_oklab,var(--tone-green)_40%,transparent)]"
        >
          <CheckIcon className="size-[26px]" />
        </span>
        <header className="flex flex-col gap-2">
          <h1
            ref={tituloEnviado}
            tabIndex={-1}
            className="text-[30px] leading-9 font-semibold tracking-[-0.02em] text-foreground-strong outline-none"
          >
            {t("platform.billing.sales.sent.title")}
          </h1>
        </header>
        <p className="-mt-3.5 text-[15px] leading-[23px] text-foreground">{t("platform.billing.sales.sent.text", { email })}</p>
        <div className="flex flex-col gap-2.5 rounded-xl bg-card px-[18px] py-4 shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]">
          <span className="text-[12.5px] leading-4 font-medium text-muted-foreground">{t("platform.billing.sales.sent.request")}</span>
          <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground-strong">
            <UsersIcon aria-hidden className="size-4 text-muted-foreground" />
            {t("platform.billing.sales.sent.seats", { count: seats ?? 0 })}
          </span>
          {mensagem ? (
            <blockquote className="mt-0.5 pl-3 text-sm leading-[21px] break-words whitespace-pre-line text-foreground shadow-[inset_2px_0_0_color-mix(in_oklab,var(--primary)_40%,transparent)]">
              {mensagem}
            </blockquote>
          ) : null}
        </div>
        <p className="flex items-start gap-2 text-[13.5px] leading-5 text-muted-foreground">
          <ClockIcon aria-hidden className="mt-0.5 size-[15px] shrink-0" />
          {trialEndsAt
            ? t("platform.billing.sales.sent.note_trial", { date: dataCurta(trialEndsAt, locale) })
            : t("platform.billing.sales.sent.note")}
        </p>
        <Button
          variant="solid"
          size="touch"
          className="w-full"
          {...(backRender ? { render: backRender, nativeButton: false } : { type: "button" as const, onClick: onBack })}
        >
          {t("platform.billing.sales.sent.back")}
        </Button>
      </div>
    )
  }

  const valido = seats !== null && seats >= SALES_SEATS_MIN && seats <= SALES_SEATS_MAX
  const mudarPessoas = (n: number | null) => onChange({ ...value, seats: n })

  return (
    <div data-slot="contact-sales-form" className={cn("flex flex-col gap-[26px]", className)}>
      <BillingFormHeader title={t("platform.billing.sales.title")} subtitle={t("platform.billing.sales.subtitle", { min: minSeats })} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (valido && !submitting) onSubmit()
        }}
        className="flex flex-col gap-[22px]"
      >
        <Field invalid={seats !== null && !valido} disabled={submitting}>
          <FieldLabel>{t("platform.billing.sales.seats.label")}</FieldLabel>
          <div
            className={cn(
              "flex h-11 w-[200px] items-center rounded-[11px] bg-field",
              "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--input)_45%,var(--field))]",
              "has-focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/20",
              "has-data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] has-data-invalid:ring-[3px] has-data-invalid:ring-destructive/15"
            )}
          >
            <Passo
              rotulo={t("platform.billing.sales.seats.less")}
              desligado={submitting || seats === null || seats <= SALES_SEATS_MIN}
              onClick={() => mudarPessoas(Math.min(Math.max((seats ?? SALES_SEATS_MIN) - 1, SALES_SEATS_MIN), SALES_SEATS_MAX))}
              className="rounded-l-[11px]"
            >
              <MinusIcon />
            </Passo>
            <Filete />
            {/* o Input do DS, sem a caixa (ela é o invólucro): dentro do Field, o rótulo e a dica vêm ligados */}
            <Input
              inputMode="numeric"
              value={seats === null ? "" : String(seats)}
              onChange={(e) => mudarPessoas(lerPessoas(e.target.value))}
              autoComplete="off"
              className={cn(
                "h-full flex-1 rounded-none bg-transparent px-1 text-center text-[17px] font-semibold text-foreground-strong tabular-nums",
                "shadow-none hover:shadow-none focus-visible:shadow-none focus-visible:ring-0",
                "aria-invalid:shadow-none aria-invalid:ring-0 data-invalid:shadow-none data-invalid:ring-0"
              )}
            />
            <Filete />
            <Passo
              rotulo={t("platform.billing.sales.seats.more")}
              desligado={submitting || (seats ?? 0) >= SALES_SEATS_MAX}
              onClick={() => mudarPessoas(Math.min((seats ?? 0) + 1, SALES_SEATS_MAX))}
              className="rounded-r-[11px]"
            >
              <PlusIcon />
            </Passo>
          </div>
          <FieldDescription className="text-[13px] leading-[18px]">{t("platform.billing.sales.seats.hint")}</FieldDescription>
        </Field>

        {/* o Textarea é nativo, fora do Field do Base UI: o rótulo vai ligado pelo id */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={idMensagem} className="text-sm leading-none font-medium text-foreground-strong">
            {t("platform.billing.sales.message")}{" "}
            <span className="font-normal text-muted-foreground">({t("platform.billing.sales.optional")})</span>
          </label>
          <Textarea
            id={idMensagem}
            value={message}
            onChange={(e) => onChange({ ...value, message: e.target.value })}
            maxLength={SALES_MESSAGE_MAX}
            showCount
            rows={5}
            disabled={submitting}
            className="min-h-[132px] rounded-[11px] px-3.5 py-[11px] text-base leading-[22px] md:text-[0.9375rem]"
          />
        </div>

        <Button type="submit" variant="solid" size="touch" className="w-full" disabled={!valido || submitting}>
          {submitting ? <SpinnerGapIcon aria-hidden className="animate-spin" /> : null}
          {t("platform.billing.sales.submit")}
        </Button>
      </form>
    </div>
  )
}

// o − e o + dentro da caixa
function Passo({
  rotulo,
  desligado,
  onClick,
  className,
  children,
}: {
  rotulo: string
  desligado: boolean
  onClick: () => void
  className: string
  children: ReactElement
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={rotulo}
      disabled={desligado}
      onClick={onClick}
      className={cn("h-full w-11 shrink-0 px-0 [&_svg]:size-4", className)}
    >
      {children}
    </Button>
  )
}

// o filete entre o botão e o número
function Filete() {
  return <span aria-hidden className="my-2 w-px self-stretch bg-[color-mix(in_oklab,var(--input)_45%,var(--field))]" />
}

// só os dígitos, no máximo o teto; vazio é `null` (a pessoa apagou para digitar outro)
function lerPessoas(texto: string): number | null {
  const digitos = texto.replace(/\D/g, "").slice(0, 6)
  if (!digitos) return null
  return Math.min(Number(digitos), SALES_SEATS_MAX)
}

// "26 de out." no Intl do idioma
function dataCurta(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso))
}

// ── O resumo do Enterprise ──────────────────────────────────────────────

export interface ContactSalesSummaryProps {
  /** A chave do plano (o ícone) e o nome, ex.: `{ key: "platform_enterprise", name: "Enterprise" }`. */
  plan: { key: string; name: string }
  /** O preço por pessoa por mês, da API (F12). */
  pricePerSeat: { amountInCents: number; currency: string }
  /** O mínimo de assentos (10). */
  minSeats: number
  /** As pessoas do formulário: a estimativa usa o número, nunca abaixo do mínimo; o Code Pro, o número pedido. */
  seats: number | null
  /** A linha "inclui Muriki Code Pro para as N · na assinatura paga". */
  includesCodePro: boolean
  /** O e-mail do 2º passo: "O comercial responde em …". */
  email: string
  /** O pedido foi enviado: o 1º passo vira o check e o 2º é o de agora. */
  sent?: boolean
  /** O idioma dos valores, ex.: `pt-BR`. */
  locale: string
  className?: string
}

export function ContactSalesSummary({
  plan,
  pricePerSeat,
  minSeats,
  seats,
  includesCodePro,
  email,
  sent = false,
  locale,
  className,
}: ContactSalesSummaryProps) {
  const t = useTranslate()
  const preco = (centavos: number) => formatSeatPrice(centavos, pricePerSeat.currency, locale)
  const porMes = (centavos: number) => t("platform.billing.checkout.amount.monthly", { price: preco(centavos) })
  // a estimativa, só exibição (F12): o Enterprise cobra no mínimo `minSeats`
  const contadas = Math.max(seats ?? 0, minSeats)
  const agora = sent ? 1 : 0
  const passos = [
    t("platform.billing.sales.steps.count"),
    t("platform.billing.sales.steps.reply", { email }),
    t("platform.billing.sales.steps.contract"),
  ]

  return (
    <div data-slot="contact-sales-summary" className={cn("flex flex-col gap-5", className)}>
      <SummaryHeader planKey={plan.key} name={plan.name} />

      <SummarySection>
        <SummaryRow label={t("platform.billing.sales.summary.price_per_seat")} value={porMes(pricePerSeat.amountInCents)} />
        <SummaryRow label={t("platform.billing.sales.summary.minimum")} value={t("platform.billing.sales.summary.people", { count: minSeats })} />
      </SummarySection>

      <SummarySection className="gap-2">
        <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">{t("platform.billing.sales.summary.estimate")}</span>
        <SummaryRow
          strong
          label={t("platform.billing.checkout.seats_line", { count: contadas, price: preco(pricePerSeat.amountInCents) })}
          value={porMes(pricePerSeat.amountInCents * contadas)}
        />
      </SummarySection>

      <SummaryChecklist>
        <SummaryCheckItem>{t("platform.billing.plans.features.contract")}</SummaryCheckItem>
        {includesCodePro ? (
          <li className="flex items-start gap-[9px] text-sm leading-5 font-medium text-foreground-strong">
            <SparkleIcon aria-hidden weight="fill" className="mt-[2.5px] size-[15px] shrink-0 text-primary" />
            <span className="flex flex-col">
              {/* cada membro ativo recebe o Code Pro (code-bundle): as pessoas pedidas, não o piso */}
              {t("platform.billing.sales.summary.code_pro", { count: seats ?? contadas })}
              <span className="text-[12.5px] leading-[17px] font-normal text-muted-foreground">
                {t("platform.billing.plans.code_pro_note")}
              </span>
            </span>
          </li>
        ) : null}
      </SummaryChecklist>

      <SummarySection className="gap-3.5">
        <h3 className="text-[13px] leading-[18px] font-semibold text-foreground-strong">{t("platform.billing.sales.steps.title")}</h3>
        <ol>
          {passos.map((texto, i) => {
            const feito = i < agora
            const atual = i === agora
            return (
              <li
                key={i}
                aria-current={atual ? "step" : undefined}
                className={cn("relative flex items-start gap-3", i < passos.length - 1 && "pb-4")}
              >
                {i < passos.length - 1 ? (
                  <span aria-hidden className="absolute top-[26px] bottom-0.5 left-[11.5px] w-px bg-input" />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    feito
                      ? "bg-tone-green text-tone-green-foreground"
                      : atual
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--input)]"
                  )}
                >
                  {feito ? <CheckIcon className="size-[13px]" /> : i + 1}
                </span>
                <span className={cn("pt-0.5 text-[13.5px] leading-5", atual ? "text-foreground-strong" : "text-foreground")}>
                  {feito ? <span className="sr-only">{t("platform.billing.sales.steps.done")} </span> : null}
                  {texto}
                </span>
              </li>
            )
          })}
        </ol>
      </SummarySection>
    </div>
  )
}
