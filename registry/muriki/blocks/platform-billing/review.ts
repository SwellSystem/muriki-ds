/**
 * As contas puras da revisão do país (country-review, o B8b da API): qual país não bateu com o
 * declarado, o rótulo do tipo de documento estrangeiro e os erros do formulário antes de mandar. Sem
 * rede: quem decide é a API, que valida de novo.
 *
 * A revisão abre quando o país declarado no checkout fica de um lado (Brasil ou exterior) e o do
 * endereço de cobrança ou o do cartão, do outro. Dois países do mesmo lado (ex.: os EUA e Portugal)
 * não abrem revisão: o que conta é o lado.
 */
import type { TranslateFn } from "@/lib/i18n"

import { fiscalErrors, isBrazil, normalizeTaxId, type FiscalErrors, type WorkspaceKind } from "./tax-id"

/** Os países que a API viu (`countryReview` do GET …/billing), em ISO 3166-1, ou null. */
export interface CountryReviewCountries {
  declared?: string | null
  billingAddress?: string | null
  card?: string | null
}

/**
 * O que não bateu com o declarado, para a frase do aviso: só o endereço, só o cartão, os dois no mesmo
 * país (`both_same`) ou os dois em países diferentes (`both`). `unknown` quando falta o declarado ou
 * nada destoa nos dados que vieram: a frase fica genérica.
 */
export type CountryReviewMismatch = "address" | "card" | "both" | "both_same" | "unknown"

export function countryReviewMismatch({ declared, billingAddress, card }: CountryReviewCountries): CountryReviewMismatch {
  if (!declared) return "unknown"
  const lado = isBrazil(declared)
  const endereco = Boolean(billingAddress) && isBrazil(billingAddress!) !== lado
  const cartao = Boolean(card) && isBrazil(card!) !== lado
  if (endereco && cartao) return billingAddress!.toUpperCase() === card!.toUpperCase() ? "both_same" : "both"
  if (endereco) return "address"
  if (cartao) return "card"
  return "unknown"
}

/**
 * A lista curta dos tipos de documento estrangeiro, os do Stripe que mais aparecem, para quando o app
 * não passa a dele. Os brasileiros (`br_cpf`, `br_cnpj`) ficam de fora: a API responde `TAX_ID_INVALID`.
 */
export const COMMON_FOREIGN_TAX_ID_TYPES = [
  "eu_vat",
  "gb_vat",
  "us_ein",
  "ca_bn",
  "au_abn",
  "ar_cuit",
  "mx_rfc",
  "cl_tin",
  "co_nit",
  "ch_vat",
  "no_vat",
  "in_gst",
  "jp_cn",
] as const

/** O tamanho máximo do número estrangeiro, como a API aceita. */
export const FOREIGN_TAX_ID_MAX = 64

/**
 * O rótulo do tipo de documento: "EIN dos EUA" pela chave i18n do tipo e, sem ela, o código em
 * maiúsculas ("US_EIN"). Sem a chave, o `t` devolve a própria chave (o padrão do DS e do i18next).
 */
export function taxIdTypeLabel(type: string, t: TranslateFn): string {
  const chave = `platform.billing.country_review.tax_id_types.${type}`
  const rotulo = t(chave)
  return rotulo && rotulo !== chave ? rotulo : type.toUpperCase()
}

/** Onde o workspace é cobrado, na resposta: fora do Brasil ou no Brasil. */
export type CountryReviewSide = "abroad" | "brazil"

/** O que o CountryReviewForm guarda. Os campos do lado não escolhido ficam como estão e não vão no POST. */
export interface CountryReviewValue {
  /** A escolha; `null` antes de a pessoa escolher (o "Confirmar" fica desligado). */
  side: CountryReviewSide | null
  /** No "Fora do Brasil": o tipo do Stripe (ex.: `us_ein`) e o número, os dois opcionais. */
  foreignTaxId: { type: string | null; value: string }
  /** No "No Brasil": o CPF ou o CNPJ normalizado, como o FiscalForm devolve. */
  taxId: string
  /** No "No Brasil", no `team`: a razão social. */
  legalName: string
}

/**
 * Os erros no campo: os do FiscalForm, no "No Brasil", mais o documento estrangeiro (`type_required`:
 * o número sem o tipo; `invalid`: o `422 TAX_ID_INVALID` da API no "Fora do Brasil").
 */
export interface CountryReviewErrors extends FiscalErrors {
  foreignTaxId?: "type_required" | "invalid"
}

/**
 * Os erros antes de mandar, com as regras da API. Fora do Brasil, o documento é opcional, mas o número
 * pede o tipo. No Brasil, os do FiscalForm (`fiscalErrors`); no `personal` com o CPF no perfil
 * (`profileHasCpf`), o CPF em branco vale. Sem erro, devolve `{}`.
 */
export function countryReviewErrors(
  kind: WorkspaceKind,
  value: CountryReviewValue,
  { profileHasCpf = false }: { profileHasCpf?: boolean } = {}
): CountryReviewErrors {
  if (value.side === "abroad") {
    return value.foreignTaxId.value.trim() && !value.foreignTaxId.type ? { foreignTaxId: "type_required" } : {}
  }
  if (value.side !== "brazil") return {}
  const erros: CountryReviewErrors = fiscalErrors(kind, { country: "BR", taxId: value.taxId, legalName: value.legalName })
  if (kind === "personal" && profileHasCpf && !normalizeTaxId(value.taxId)) delete erros.taxId
  return erros
}
