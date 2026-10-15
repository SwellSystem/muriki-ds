"use client"

/**
 * A revisão do país da cobrança (o B8b da API), no desenho aprovado. A API abre a revisão quando o
 * país declarado no checkout fica de um lado (Brasil ou exterior) e o do endereço de cobrança ou o do
 * cartão, do outro; ela dura 7 dias (`dueAt`).
 *
 * - CountryReviewNotice: o aviso acima do herói da Cobrança. `open` (amarelo): o prazo e o que não
 *   bateu, com "Confirmar o país"; `expired` (vermelho): a assinatura termina no fim do período, e ainda
 *   dá para responder; `moving` (azul): a resposta trocou a moeda, e o owner assina de novo na moeda
 *   nova, com a cobrança nova só no fim do período.
 * - CountryReviewForm: a esquerda da página de resposta, dentro do BillingPageLayout: "Fora do Brasil"
 *   ou "No Brasil" e, conforme a escolha, o documento estrangeiro opcional ou os campos do FiscalForm.
 * - CountryReviewSummary: a direita, "O que encontramos": os países que a API viu e o prazo.
 *
 * Os nomes dos países saem do `Intl.DisplayNames` do `locale`, e as datas, do `formatBillingDate`
 * (uma data inválida some com o trecho dela). Não chama rede: o POST, o checkout na moeda nova e os
 * links são do app.
 */
import { useId } from "react"
import {
  ArrowRightIcon,
  ArrowsLeftRightIcon,
  BuildingsIcon,
  GlobeIcon,
  SpinnerGapIcon,
  WarningIcon,
  type Icon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { BillingFormHeader, SummaryRow, SummarySection } from "./billing-page"
import type { BillingAction } from "./billing-overview"
import { BrazilTaxIdFields } from "./fiscal-form"
import { formatBillingDate } from "./overview"
import {
  COMMON_FOREIGN_TAX_ID_TYPES,
  countryReviewMismatch,
  FOREIGN_TAX_ID_MAX,
  taxIdTypeLabel,
  type CountryReviewErrors,
  type CountryReviewSide,
  type CountryReviewValue,
} from "./review"
import { countryName, isBrazil, type WorkspaceKind } from "./tax-id"

// a frase embaixo do campo, a mesma do FiscalForm (13px)
const DICA = "text-[13px] leading-[18px]"
// o filete entre as partes do formulário, o mesmo do FiscalForm
const FILETE = "border-t border-[color-mix(in_oklab,var(--input)_60%,transparent)] pt-5"

// ── O aviso ─────────────────────────────────────────────────────────────

export interface CountryReviewNoticeProps {
  /**
   * `open`: a revisão aberta (`countryReview.status`); `expired`: vencida, com o `cancelAtPeriodEnd`;
   * `moving`: o `endedByCountryReview` com `moving_to_brl` ou `moving_to_usd`.
   */
  variant: "open" | "expired" | "moving"
  /** O prazo para responder (`countryReview.dueAt`), no `open`. */
  dueAt?: string
  /** O fim da assinatura (o `currentPeriodEnd`), no `expired` e no `moving`. */
  endsAt?: string | null
  /** Os países que a API viu, em ISO 3166-1: a frase do `open` diz quais não bateram com o declarado. */
  declared?: string | null
  billingAddress?: string | null
  card?: string | null
  /** A moeda nova, no `moving`: "Assinar em USD". */
  currency?: "BRL" | "USD"
  /** "Confirmar o país" (o link da página de resposta) ou, no `moving`, "Assinar em …" (o checkout). */
  action?: BillingAction
  /** O idioma das datas e dos países, ex.: `pt-BR`. */
  locale: string
  className?: string
}

const TOM: Record<CountryReviewNoticeProps["variant"], { caixa: string; icone: string; Icone: Icon }> = {
  open: {
    caixa: "bg-tone-yellow shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--tone-yellow-foreground)_22%,transparent)]",
    icone: "text-tone-yellow-foreground",
    Icone: GlobeIcon,
  },
  expired: {
    caixa: "bg-tone-red shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--tone-red-foreground)_22%,transparent)]",
    icone: "text-tone-red-foreground",
    Icone: WarningIcon,
  },
  moving: {
    caixa: "bg-tone-blue shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--tone-blue-foreground)_22%,transparent)]",
    icone: "text-tone-blue-foreground",
    Icone: ArrowsLeftRightIcon,
  },
}

export function CountryReviewNotice({
  variant,
  dueAt,
  endsAt,
  declared,
  billingAddress,
  card,
  currency = "USD",
  action,
  locale,
  className,
}: CountryReviewNoticeProps) {
  const t = useTranslate()
  const k = "platform.billing.country_review.notice"
  const prazo = formatBillingDate(dueAt, locale)
  const fim = formatBillingDate(endsAt, locale)
  const { caixa, icone, Icone } = TOM[variant]

  let titulo: string
  let texto: string
  if (variant === "open") {
    titulo = prazo ? t(`${k}.open.title`, { date: prazo }) : t(`${k}.open.title_no_date`)
    texto = t(`${k}.open.text.${countryReviewMismatch({ declared, billingAddress, card })}`, {
      declared: declared ? countryName(declared, locale) : "",
      address: billingAddress ? countryName(billingAddress, locale) : "",
      card: card ? countryName(card, locale) : "",
    })
  } else if (variant === "expired") {
    titulo = t(`${k}.expired.title`)
    texto = fim ? t(`${k}.expired.text`, { date: fim }) : t(`${k}.expired.text_no_date`)
  } else {
    titulo = t(`${k}.moving.title.${currency.toLowerCase()}`)
    texto = fim ? t(`${k}.moving.text`, { currency, date: fim }) : t(`${k}.moving.text_no_date`, { currency })
  }
  const temAcao = Boolean(action && (action.render || action.onClick))

  return (
    <section
      role="status"
      data-slot="country-review-notice"
      className={cn("flex flex-col gap-3 rounded-[14px] py-4 pr-[18px] pl-5 sm:flex-row sm:items-center sm:gap-4", caixa, className)}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <Icone aria-hidden className={cn("mt-px size-5 shrink-0", icone)} />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[14.5px] leading-5 font-semibold text-foreground-strong">{titulo}</span>
          <span className="text-[13.5px] leading-[19px] text-foreground">{texto}</span>
        </div>
      </div>
      {temAcao ? (
        <Button
          variant="outline"
          size="lg"
          className="shrink-0 self-start sm:self-center"
          {...(action!.render ? { render: action!.render, nativeButton: false } : { type: "button" as const, onClick: action!.onClick })}
        >
          {variant === "moving" ? t(`${k}.moving.action`, { currency }) : t("platform.billing.country_review.confirm")}
          <ArrowRightIcon aria-hidden className="size-3.5" />
        </Button>
      ) : null}
    </section>
  )
}

// ── O formulário ────────────────────────────────────────────────────────

export interface CountryReviewFormProps {
  /** O tipo do workspace: no "No Brasil", `personal` pede o CPF; `team`, o CNPJ e a razão social. */
  kind: WorkspaceKind
  value: CountryReviewValue
  onChange: (value: CountryReviewValue) => void
  /** Os erros no campo, do app (`countryReviewErrors`, ao mandar) ou da API. */
  errors?: CountryReviewErrors
  /** "Confirmar": o app valida, manda o POST …/billing/country-review e volta para a Cobrança. */
  onSubmit: () => void
  /** O POST em curso: o botão gira e não manda de novo. */
  submitting?: boolean
  /**
   * O país declarado (`countryReview.declared`): decide a nota da troca de moeda, no "Fora do Brasil"
   * quando era o Brasil (para USD) e no "No Brasil" quando era outro (para BRL).
   */
  declared?: string | null
  /** O prazo (`dueAt`), na linha de contexto. Sem ele (ex.: a revisão vencida), a frase sai sem a data. */
  dueAt?: string
  /** No `personal`, o perfil já tem um CPF: o campo fica opcional, e a API usa o do perfil. */
  profileHasCpf?: boolean
  /** Os tipos do Stripe na lista do documento estrangeiro; o padrão é `COMMON_FOREIGN_TAX_ID_TYPES`. */
  taxIdTypes?: readonly string[]
  /** O idioma das datas, ex.: `pt-BR`. */
  locale: string
  className?: string
}

const ICONE_DO_LADO: Record<CountryReviewSide, Icon> = { abroad: GlobeIcon, brazil: BuildingsIcon }

export function CountryReviewForm({
  kind,
  value,
  onChange,
  errors = {},
  onSubmit,
  submitting = false,
  declared,
  dueAt,
  profileHasCpf = false,
  taxIdTypes = COMMON_FOREIGN_TAX_ID_TYPES,
  locale,
  className,
}: CountryReviewFormProps) {
  const t = useTranslate()
  const k = "platform.billing.country_review"
  const tipoId = useId()
  const prazo = formatBillingDate(dueAt, locale)
  const titulo = t(`${k}.title`)
  const mudar = (parte: Partial<CountryReviewValue>) => onChange({ ...value, ...parte })
  const mudarEstrangeiro = (parte: Partial<CountryReviewValue["foreignTaxId"]>) =>
    mudar({ foreignTaxId: { ...value.foreignTaxId, ...parte } })
  // a moeda só troca quando a resposta muda de lado em relação ao declarado
  const eraBrasil = declared ? isBrazil(declared) : null

  return (
    <div data-slot="country-review-form" className={cn("flex flex-col gap-[26px]", className)}>
      <BillingFormHeader title={titulo} subtitle={prazo ? t(`${k}.subtitle`, { date: prazo }) : t(`${k}.subtitle_no_date`)} />
      <form
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!submitting && value.side) onSubmit()
        }}
        className="flex flex-col gap-[26px]"
      >
        <div className="flex flex-col gap-[18px]">
          <ChoiceCardGroup
            aria-label={titulo}
            value={value.side}
            onValueChange={(v) => mudar({ side: v as CountryReviewSide })}
            className="[grid-template-columns:1fr_1fr]"
          >
            {(["abroad", "brazil"] as const).map((lado) => {
              const Icone = ICONE_DO_LADO[lado]
              return (
                <ChoiceCard
                  key={lado}
                  value={lado}
                  disabled={submitting}
                  title={
                    <>
                      {t(`${k}.${lado}`)}
                      <Icone
                        aria-hidden
                        weight="duotone"
                        className="absolute top-1/2 right-4 hidden size-6 -translate-y-1/2 text-muted-foreground transition-colors sm:block group-data-[checked]/choice:text-primary"
                      />
                    </>
                  }
                  className="py-3.5 sm:pr-12"
                />
              )
            })}
          </ChoiceCardGroup>

          {value.side === "abroad" ? (
            <>
              {eraBrasil === true ? <p className="text-[13.5px] leading-5 text-foreground">{t(`${k}.abroad_note`)}</p> : null}
              <fieldset disabled={submitting} className={cn("flex min-w-0 flex-col gap-[18px]", FILETE)}>
                <Field disabled={submitting}>
                  <FieldLabel id={tipoId}>
                    {t(`${k}.tax_id.type`)}
                    <span className="font-normal text-muted-foreground">{t("platform.billing.fiscal.optional")}</span>
                  </FieldLabel>
                  <Select
                    value={value.foreignTaxId.type}
                    items={taxIdTypes.map((tipo) => ({ value: tipo, label: taxIdTypeLabel(tipo, t) }))}
                    onValueChange={(tipo) => mudarEstrangeiro({ type: tipo })}
                    disabled={submitting}
                  >
                    <SelectTrigger size="touch" aria-labelledby={tipoId}>
                      <SelectValue placeholder={t(`${k}.tax_id.type_placeholder`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {taxIdTypes.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {taxIdTypeLabel(tipo, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field invalid={errors.foreignTaxId !== undefined} disabled={submitting}>
                  <FieldLabel>{t(`${k}.tax_id.number`)}</FieldLabel>
                  <Input
                    size="touch"
                    value={value.foreignTaxId.value}
                    onChange={(e) => mudarEstrangeiro({ value: e.target.value })}
                    maxLength={FOREIGN_TAX_ID_MAX}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="font-mono"
                  />
                  {errors.foreignTaxId ? (
                    <FieldError className={DICA}>{t(`${k}.tax_id.${errors.foreignTaxId}`)}</FieldError>
                  ) : (
                    <FieldDescription className={DICA}>{t(`${k}.tax_id.hint`)}</FieldDescription>
                  )}
                </Field>
              </fieldset>
            </>
          ) : value.side === "brazil" ? (
            <>
              {eraBrasil === false ? <p className="text-[13.5px] leading-5 text-foreground">{t(`${k}.brazil_note`)}</p> : null}
              <fieldset disabled={submitting} className={cn("flex min-w-0 flex-col gap-[18px]", FILETE)}>
                <BrazilTaxIdFields
                  kind={kind}
                  value={value}
                  onChange={mudar}
                  errors={errors}
                  optional={kind === "personal" && profileHasCpf}
                  disabled={submitting}
                />
              </fieldset>
            </>
          ) : null}
        </div>

        <Button type="submit" variant="solid" size="touch" className="w-full" disabled={submitting || !value.side}>
          {submitting ? <SpinnerGapIcon aria-hidden className="animate-spin" /> : null}
          {t(`${k}.submit`)}
        </Button>
      </form>
    </div>
  )
}

// ── O resumo ────────────────────────────────────────────────────────────

export interface CountryReviewSummaryProps {
  /** Os países que a API viu (`countryReview`), em ISO 3166-1; só os que vieram aparecem. */
  declared?: string | null
  billingAddress?: string | null
  card?: string | null
  /** O prazo para responder (`dueAt`). */
  dueAt?: string
  /** O idioma dos países e da data, ex.: `pt-BR`. */
  locale: string
}

/** "O que encontramos": o país informado, o do endereço, o do cartão, o prazo e a nota do Stripe. */
export function CountryReviewSummary({ declared, billingAddress, card, dueAt, locale }: CountryReviewSummaryProps) {
  const t = useTranslate()
  const k = "platform.billing.country_review.summary"
  const prazo = formatBillingDate(dueAt, locale)
  const linhas: [string, string | null | undefined][] = [
    ["declared", declared],
    ["billing_address", billingAddress],
    ["card", card],
  ]
  const vieram = linhas.filter((l): l is [string, string] => Boolean(l[1]))

  return (
    <>
      <h2 className="text-[13px] leading-[18px] font-medium text-muted-foreground">{t(`${k}.title`)}</h2>
      {vieram.length > 0 ? (
        <SummarySection>
          {vieram.map(([chave, pais]) => (
            <SummaryRow key={chave} label={t(`${k}.${chave}`)} value={countryName(pais, locale)} />
          ))}
        </SummarySection>
      ) : null}
      {prazo ? (
        <SummarySection className="gap-1.5">
          <SummaryRow strong label={t(`${k}.due`)} value={prazo} />
        </SummarySection>
      ) : null}
      <p className="text-[12.5px] leading-[18px] text-muted-foreground">{t(`${k}.note`)}</p>
    </>
  )
}
