import { describe, expect, test } from "bun:test"

import {
  countryName,
  fiscalDocument,
  fiscalErrors,
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  isBrazil,
  normalizeTaxId,
  sanitizeCnpj,
  sanitizeCpf,
} from "./tax-id"

describe("normalizeTaxId", () => {
  test("tira a máscara e passa para maiúsculas", () => {
    expect(normalizeTaxId("12.abc.345/01de-35")).toBe("12ABC34501DE35")
    expect(normalizeTaxId(" 123.456.789-09 ")).toBe("12345678909")
  })
})

describe("CPF (F8)", () => {
  test("válido, com e sem máscara", () => {
    expect(isValidCpf("123.456.789-09")).toBe(true)
    expect(isValidCpf("52998224725")).toBe(true)
  })

  test("inválido: o DV errado, o tamanho errado e letra", () => {
    expect(isValidCpf("123.456.789-08")).toBe(false)
    expect(isValidCpf("529.982.247-52")).toBe(false)
    expect(isValidCpf("1234567890")).toBe(false)
    expect(isValidCpf("123456789091")).toBe(false)
    expect(isValidCpf("1234567890A")).toBe(false)
    expect(isValidCpf("")).toBe(false)
  })

  test("recusa sequência repetida", () => {
    for (const d of "0123456789") expect(isValidCpf(d.repeat(11))).toBe(false)
    expect(isValidCpf("111.111.111-11")).toBe(false)
  })

  test("a máscara 000.000.000-00, também enquanto a pessoa digita", () => {
    expect(formatCpf("12345678909")).toBe("123.456.789-09")
    expect(formatCpf("123")).toBe("123")
    expect(formatCpf("1234")).toBe("123.4")
    expect(formatCpf("1234567890")).toBe("123.456.789-0")
    expect(formatCpf("")).toBe("")
  })

  test("o que entra no campo: só dígitos, até 11", () => {
    expect(sanitizeCpf("123.456.789-0912")).toBe("12345678909")
    expect(sanitizeCpf("12a3")).toBe("123")
  })
})

describe("CNPJ alfanumérico (F9, R33)", () => {
  test("numérico válido", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true)
    expect(isValidCnpj("11222333000181")).toBe(true)
  })

  test("o exemplo da Receita, 12.ABC.345/01DE-35", () => {
    expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true)
    expect(isValidCnpj("12ABC34501DE35")).toBe(true)
  })

  test("aceita minúsculas e a máscara ao colar", () => {
    expect(isValidCnpj("12.abc.345/01de-35")).toBe(true)
    expect(isValidCnpj("12abc34501de35")).toBe(true)
  })

  test("inválido: o DV errado, letra no DV e o tamanho errado", () => {
    expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false)
    expect(isValidCnpj("11.222.333/0001-80")).toBe(false)
    expect(isValidCnpj("12ABC34501DE3A")).toBe(false)
    expect(isValidCnpj("12ABC34501DE3")).toBe(false)
    expect(isValidCnpj("")).toBe(false)
  })

  test("recusa sequência repetida", () => {
    expect(isValidCnpj("00000000000000")).toBe(false)
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false)
  })

  test("a máscara XX.XXX.XXX/XXXX-DD, também enquanto a pessoa digita", () => {
    expect(formatCnpj("12abc34501de35")).toBe("12.ABC.345/01DE-35")
    expect(formatCnpj("12A")).toBe("12.A")
    expect(formatCnpj("12ABC345")).toBe("12.ABC.345")
    expect(formatCnpj("12ABC3450")).toBe("12.ABC.345/0")
    expect(formatCnpj("12ABC34501DE3")).toBe("12.ABC.345/01DE-3")
  })

  test("o que entra no campo: letra só nos 12 primeiros, até 14", () => {
    expect(sanitizeCnpj("12.abc.345/01de-35")).toBe("12ABC34501DE35")
    expect(sanitizeCnpj("12ABC34501DEX3Y5Z")).toBe("12ABC34501DE35")
    expect(sanitizeCnpj("12ABC34501DE3599")).toBe("12ABC34501DE35")
  })
})

describe("fiscalErrors", () => {
  const br = { country: "BR", taxId: "", legalName: "" }

  test("o Solo pede o CPF; o Team e o Enterprise, o CNPJ", () => {
    expect(fiscalDocument("platform_solo")).toBe("cpf")
    expect(fiscalDocument("platform_team")).toBe("cnpj")
    expect(fiscalDocument("platform_enterprise")).toBe("cnpj")
  })

  test("fora do Brasil não há o que pedir", () => {
    expect(fiscalErrors("platform_team", { ...br, country: "US" })).toEqual({})
  })

  test("o país em minúsculas ainda é o Brasil", () => {
    expect(isBrazil("br")).toBe(true)
    expect(isBrazil("BR")).toBe(true)
    expect(isBrazil("BRA")).toBe(false)
    expect(fiscalErrors("platform_solo", { ...br, country: "br" })).toEqual({ taxId: "required" })
  })

  test("no Brasil, vazio é required e o DV errado é invalid", () => {
    expect(fiscalErrors("platform_solo", br)).toEqual({ taxId: "required" })
    expect(fiscalErrors("platform_solo", { ...br, taxId: "12345678908" })).toEqual({ taxId: "invalid" })
    expect(fiscalErrors("platform_solo", { ...br, taxId: "12345678909" })).toEqual({})
    expect(fiscalErrors("platform_team", br)).toEqual({ taxId: "required", legalName: "required" })
    expect(fiscalErrors("platform_team", { ...br, taxId: "12ABC34501DE36", legalName: "Moura & Filhos" })).toEqual({ taxId: "invalid" })
  })

  test("a razão social vai de 1 a 150 depois do trim (F10)", () => {
    const cnpj = "12ABC34501DE35"
    expect(fiscalErrors("platform_enterprise", { ...br, taxId: cnpj, legalName: "   " })).toEqual({ legalName: "required" })
    expect(fiscalErrors("platform_enterprise", { ...br, taxId: cnpj, legalName: "a".repeat(150) })).toEqual({})
    expect(fiscalErrors("platform_enterprise", { ...br, taxId: cnpj, legalName: "a".repeat(151) })).toEqual({ legalName: "required" })
  })
})

describe("countryName", () => {
  test("o nome no Intl do idioma", () => {
    expect(countryName("BR", "pt-BR")).toBe("Brasil")
    expect(countryName("BR", "en-US")).toBe("Brazil")
  })

  test("o código malformado, que faz o Intl lançar erro, fica como veio", () => {
    expect(() => new Intl.DisplayNames(["pt-BR"], { type: "region" }).of("BRA")).toThrow()
    expect(countryName("BRA", "pt-BR")).toBe("BRA")
  })
})
