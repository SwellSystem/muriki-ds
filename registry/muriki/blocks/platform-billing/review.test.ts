import { describe, expect, test } from "bun:test"

import { defaultTranslate } from "@/lib/i18n"

import {
  COMMON_FOREIGN_TAX_ID_TYPES,
  countryReviewErrors,
  countryReviewMismatch,
  taxIdTypeLabel,
  type CountryReviewValue,
} from "./review"

describe("countryReviewMismatch", () => {
  test("o Brasil declarado e o endereço e o cartão nos EUA: os dois no mesmo país", () => {
    expect(countryReviewMismatch({ declared: "BR", billingAddress: "US", card: "US" })).toBe("both_same")
  })
  test("os dois de fora, em países diferentes", () => {
    expect(countryReviewMismatch({ declared: "BR", billingAddress: "US", card: "PT" })).toBe("both")
  })
  test("só o endereço ou só o cartão", () => {
    expect(countryReviewMismatch({ declared: "BR", billingAddress: "US", card: "BR" })).toBe("address")
    expect(countryReviewMismatch({ declared: "US", billingAddress: "PT", card: "BR" })).toBe("card")
  })
  test("o que conta é o lado: dois países de fora não destoam", () => {
    expect(countryReviewMismatch({ declared: "US", billingAddress: "PT", card: "DE" })).toBe("unknown")
  })
  test("o país que não veio não destoa", () => {
    expect(countryReviewMismatch({ declared: "BR", billingAddress: null, card: "US" })).toBe("card")
    expect(countryReviewMismatch({ declared: "BR", billingAddress: "US" })).toBe("address")
  })
  test("compara em maiúsculas", () => {
    expect(countryReviewMismatch({ declared: "br", billingAddress: "us", card: "US" })).toBe("both_same")
  })
  test("sem o declarado, a frase fica genérica", () => {
    expect(countryReviewMismatch({ declared: null, billingAddress: "US", card: "US" })).toBe("unknown")
  })
})

describe("taxIdTypeLabel", () => {
  test("com a chave i18n, o rótulo dela", () => {
    expect(taxIdTypeLabel("us_ein", defaultTranslate)).toBe("EIN dos EUA")
  })
  test("sem a chave, o código em maiúsculas", () => {
    expect(taxIdTypeLabel("za_vat", defaultTranslate)).toBe("ZA_VAT")
  })
  test("o `t` que devolve vazio também cai no código", () => {
    expect(taxIdTypeLabel("us_ein", () => "")).toBe("US_EIN")
  })
  test("toda a lista padrão tem rótulo no pt, e nenhum tipo brasileiro entra nela", () => {
    for (const tipo of COMMON_FOREIGN_TAX_ID_TYPES) {
      expect(taxIdTypeLabel(tipo, defaultTranslate)).not.toBe(tipo.toUpperCase())
      expect(tipo.startsWith("br_")).toBe(false)
    }
  })
})

const vazio: CountryReviewValue = { side: null, foreignTaxId: { type: null, value: "" }, taxId: "", legalName: "" }

describe("countryReviewErrors", () => {
  test("sem escolha, nada a apontar (o Confirmar fica desligado)", () => {
    expect(countryReviewErrors("team", vazio)).toEqual({})
  })
  test("fora do Brasil, o documento é opcional", () => {
    expect(countryReviewErrors("team", { ...vazio, side: "abroad" })).toEqual({})
    expect(countryReviewErrors("team", { ...vazio, side: "abroad", foreignTaxId: { type: "us_ein", value: "12-3456789" } })).toEqual({})
  })
  test("fora do Brasil, o número sem o tipo pede o tipo; só espaços não contam", () => {
    expect(countryReviewErrors("team", { ...vazio, side: "abroad", foreignTaxId: { type: null, value: "12-3456789" } })).toEqual({
      foreignTaxId: "type_required",
    })
    expect(countryReviewErrors("team", { ...vazio, side: "abroad", foreignTaxId: { type: null, value: "   " } })).toEqual({})
  })
  test("no Brasil, no team, o CNPJ e a razão social", () => {
    expect(countryReviewErrors("team", { ...vazio, side: "brazil" })).toEqual({ taxId: "required", legalName: "required" })
  })
  test("no Brasil, no personal, o CPF, inválido ou em branco", () => {
    expect(countryReviewErrors("personal", { ...vazio, side: "brazil" })).toEqual({ taxId: "required" })
    expect(countryReviewErrors("personal", { ...vazio, side: "brazil", taxId: "12345678908" })).toEqual({ taxId: "invalid" })
    expect(countryReviewErrors("personal", { ...vazio, side: "brazil", taxId: "52998224725" })).toEqual({})
  })
  test("com o CPF no perfil, em branco vale; preenchido, ainda é conferido", () => {
    expect(countryReviewErrors("personal", { ...vazio, side: "brazil" }, { profileHasCpf: true })).toEqual({})
    expect(countryReviewErrors("personal", { ...vazio, side: "brazil", taxId: "12345678908" }, { profileHasCpf: true })).toEqual({
      taxId: "invalid",
    })
  })
  test("o CPF do perfil não vale no team", () => {
    expect(countryReviewErrors("team", { ...vazio, side: "brazil" }, { profileHasCpf: true }).taxId).toBe("required")
  })
})
