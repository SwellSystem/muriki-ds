/**
 * O CPF e o CNPJ do checkout (F8 e F9): funções puras, sem rede. A validação aqui é conveniência,
 * para a resposta imediata no campo; quem decide é a API, que valida de novo (R33).
 *
 * O valor que o app guarda e manda é o normalizado (sem máscara, em maiúsculas); a máscara é só de
 * exibição. O CNPJ é o alfanumérico da Receita: os 12 primeiros em `[0-9A-Z]` e os 2 DV numéricos,
 * cada caractere valendo `ASCII − 48` no módulo 11.
 */

export const CPF_LENGTH = 11
export const CNPJ_LENGTH = 14

/** Tira a máscara e o que não for letra ou número, e passa para maiúsculas: "12.abc.345/01de-35" → "12ABC34501DE35". */
export function normalizeTaxId(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "")
}

/**
 * O que a pessoa digitou ou colou, reduzido ao que cabe num CPF: só dígitos, no máximo 11. É o valor
 * que o campo devolve no `onChange`.
 */
export function sanitizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, CPF_LENGTH)
}

/**
 * O mesmo para o CNPJ: os 12 primeiros aceitam letra ou número, os 2 últimos (os DV) só número, no
 * máximo 14. A máscara e as minúsculas, ao colar, saem aqui.
 */
export function sanitizeCnpj(value: string): string {
  let limpo = ""
  for (const c of normalizeTaxId(value)) {
    if (limpo.length === CNPJ_LENGTH) break
    if (limpo.length < 12 || /\d/.test(c)) limpo += c
  }
  return limpo
}

// encaixa os caracteres na máscara até onde houver: serve ao valor completo e ao que ainda está sendo digitado
function mascarar(caracteres: string, grupos: number[], separadores: string[]): string {
  let saida = ""
  let i = 0
  grupos.forEach((tamanho, g) => {
    const pedaco = caracteres.slice(i, i + tamanho)
    if (!pedaco) return
    if (g > 0) saida += separadores[g - 1]
    saida += pedaco
    i += tamanho
  })
  return saida
}

/** `000.000.000-00`; com menos dígitos, a máscara até onde eles vão ("123.45"). */
export function formatCpf(value: string): string {
  return mascarar(sanitizeCpf(value), [3, 3, 3, 2], [".", ".", "-"])
}

/** `XX.XXX.XXX/XXXX-DD`; com menos caracteres, a máscara até onde eles vão ("12.ABC.3"). */
export function formatCnpj(value: string): string {
  return mascarar(sanitizeCnpj(value), [2, 3, 3, 4, 2], [".", ".", "/", "-"])
}

// "00000000000", "AAAAAAAAAAAAAA": passa no módulo 11 (ou quase) e não é documento de ninguém
function repetido(valor: string) {
  return /^(.)\1*$/.test(valor)
}

// o DV do módulo 11: o resto 0 ou 1 dá 0; os outros, 11 − resto
function digito(valores: number[], pesos: number[]) {
  const soma = valores.reduce((total, v, i) => total + v * pesos[i], 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

/** F8: 11 dígitos (com ou sem máscara), os dois DV do módulo 11 e nada de sequência repetida. */
export function isValidCpf(value: string): boolean {
  const cpf = normalizeTaxId(value)
  if (!/^\d{11}$/.test(cpf) || repetido(cpf)) return false
  const n = [...cpf].map(Number)
  const dv1 = digito(n.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const dv2 = digito(n.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return dv1 === n[9] && dv2 === n[10]
}

const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_CNPJ_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

/**
 * F9 (R33): 12 caracteres em `[0-9A-Z]` e 2 DV numéricos, cada caractere valendo `ASCII − 48`, os
 * pesos da Receita e nada de sequência repetida. Aceita a máscara e as minúsculas.
 */
export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeTaxId(value)
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || repetido(cnpj)) return false
  const n = [...cnpj].map((c) => c.charCodeAt(0) - 48)
  const dv1 = digito(n.slice(0, 12), PESOS_CNPJ_1)
  const dv2 = digito(n.slice(0, 13), PESOS_CNPJ_2)
  return dv1 === n[12] && dv2 === n[13]
}

// ── O formulário fiscal (FiscalForm) ────────────────────────────────────

/**
 * O tipo do workspace, que decide o documento (e não o plano): `personal` é só a pessoa, `team` é a
 * empresa. É o `kind` gravado no workspace.
 */
export type WorkspaceKind = "personal" | "team"

/** O que o FiscalForm guarda: o país (ISO 3166-1, ex.: `BR`), o documento normalizado e a razão social. */
export interface FiscalValue {
  country: string
  taxId: string
  legalName: string
}

/** Os erros no campo, do app ou da API (`TAX_ID_REQUIRED`, `TAX_ID_INVALID` e `LEGAL_NAME_REQUIRED`). */
export interface FiscalErrors {
  taxId?: "required" | "invalid"
  legalName?: "required"
}

export const LEGAL_NAME_MAX = 150

/** O país é o Brasil? Compara em maiúsculas: "br" também é. */
export function isBrazil(country: string): boolean {
  return country.toUpperCase() === "BR"
}

/**
 * O nome do país no Intl do idioma: "BR" → "Brasil" no pt-BR. Um código que o Intl não conhece fica
 * como veio, e um malformado (ex.: "BRA", que faz o Intl lançar erro) também.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
  } catch {
    return code
  }
}

/** O documento que o tipo do workspace pede no Brasil: o `personal`, o CPF; o `team`, o CNPJ (com a razão social). */
export function fiscalDocument(kind: WorkspaceKind): "cpf" | "cnpj" {
  return kind === "personal" ? "cpf" : "cnpj"
}

/**
 * Os erros do formulário antes de mandar, com as mesmas regras da API: fora do Brasil não há o que
 * pedir (o Stripe coleta); no Brasil, o documento do tipo do workspace (F8/F9) e, no CNPJ, a razão social de 1 a
 * 150 caracteres depois do trim (F10). Sem erro, devolve `{}`.
 */
export function fiscalErrors(kind: WorkspaceKind, value: FiscalValue): FiscalErrors {
  if (!isBrazil(value.country)) return {}
  const erros: FiscalErrors = {}
  const documento = fiscalDocument(kind)
  if (!normalizeTaxId(value.taxId)) erros.taxId = "required"
  else if (!(documento === "cpf" ? isValidCpf(value.taxId) : isValidCnpj(value.taxId))) erros.taxId = "invalid"
  if (documento === "cnpj") {
    const nome = value.legalName.trim()
    if (!nome || Array.from(nome).length > LEGAL_NAME_MAX) erros.legalName = "required"
  }
  return erros
}
