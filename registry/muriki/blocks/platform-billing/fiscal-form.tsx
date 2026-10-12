"use client"

/**
 * Os dados fiscais do checkout (CA12). Primeiro o país da empresa; o formulário fiscal só existe para
 * o Brasil, e fora dele fica só o país, com a nota de que o Stripe pede o número fiscal. No Brasil, o
 * Solo pede o CPF, e o Team e o Enterprise pedem o CNPJ e a razão social (F8–F10).
 *
 * É controlado por fora: o app guarda `value` (o documento normalizado, sem máscara, como volta no
 * `onChange`) e passa os `errors`, os dele (`fiscalErrors`, ao mandar) ou os da API
 * (`TAX_ID_REQUIRED` → `taxId: "required"`, `TAX_ID_INVALID` → `"invalid"`, `LEGAL_NAME_REQUIRED` →
 * `legalName: "required"`). A máscara entra enquanto a pessoa digita; o CNPJ aceita letras nos 12
 * primeiros, minúsculas e a máscara ao colar. O caret fica onde a pessoa está ao editar no meio, e o
 * Backspace logo depois de um separador ("." "/" "-") apaga o caractere antes dele.
 *
 * O documento é dado sensível: o campo tem `autoComplete="off"`, e o componente nunca o põe em URL nem
 * no armazenamento do navegador; o valor só existe no estado do app.
 */
import { useId, useLayoutEffect, useRef, type KeyboardEvent } from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  countryName,
  fiscalDocument,
  formatCnpj,
  formatCpf,
  isBrazil,
  LEGAL_NAME_MAX,
  normalizeTaxId,
  sanitizeCnpj,
  sanitizeCpf,
  type FiscalErrors,
  type FiscalPlan,
  type FiscalValue,
} from "./tax-id"

// a frase embaixo do campo, a mesma do primeiro acesso (13px): explica a regra e precisa ser lida
const DICA = "text-[13px] leading-[18px]"

export interface FiscalFormProps {
  /** O plano do checkout: o Solo pede o CPF; o Team e o Enterprise, o CNPJ e a razão social. */
  plan: FiscalPlan
  value: FiscalValue
  /** Devolve o valor inteiro, com o documento já normalizado (sem máscara, em maiúsculas). */
  onChange: (value: FiscalValue) => void
  /** Os erros no campo, do app ou da API. Sem eles, cada campo mostra a dica. */
  errors?: FiscalErrors
  /** Os países da lista, em ISO 3166-1 (ex.: `["BR", "US", "PT"]`); o nome sai no Intl do `locale`. */
  countries: string[]
  /** O idioma dos nomes dos países, ex.: `pt-BR`. */
  locale: string
  disabled?: boolean
  className?: string
}

export function FiscalForm({
  plan,
  value,
  onChange,
  errors = {},
  countries,
  locale,
  disabled,
  className,
}: FiscalFormProps) {
  const t = useTranslate()
  const legenda = useId()
  const nomes = nomesDosPaises(countries, locale)
  const documento = fiscalDocument(plan)
  const brasil = isBrazil(value.country)
  const mudar = (parte: Partial<FiscalValue>) => onChange({ ...value, ...parte })
  const limpar = documento === "cpf" ? sanitizeCpf : sanitizeCnpj
  const formatar = documento === "cpf" ? formatCpf : formatCnpj

  // o caret depois da máscara: quantos caracteres do documento ficam antes dele. O evento guarda, e o
  // efeito o põe no lugar depois do commit (a máscara nova já está no campo)
  const campo = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null)
  useLayoutEffect(() => {
    const el = campo.current
    if (caret.current === null || !el) return
    const posicao = posicaoNaMascara(el.value, caret.current)
    caret.current = null
    el.setSelectionRange(posicao, posicao)
  })

  const digitar = (texto: string, fim: number | null) => {
    const novo = limpar(texto)
    caret.current = Math.min(limpar(texto.slice(0, fim ?? texto.length)).length, novo.length)
    mudar({ taxId: novo })
  }

  // o Backspace logo depois de um separador apaga o caractere antes dele, e não fica parado no "."
  const apagarSeparador = (e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const i = el.selectionStart
    if (e.key !== "Backspace" || i === null || i === 0 || i !== el.selectionEnd || /[0-9A-Z]/i.test(el.value[i - 1])) return
    e.preventDefault()
    const antes = normalizeTaxId(el.value.slice(0, i)).length
    if (antes === 0) return
    caret.current = antes - 1
    const doc = normalizeTaxId(el.value)
    mudar({ taxId: limpar(doc.slice(0, antes - 1) + doc.slice(antes)) })
  }

  return (
    <fieldset
      data-slot="fiscal-form"
      aria-labelledby={legenda}
      disabled={disabled}
      className={cn(
        "flex min-w-0 flex-col gap-[18px] border-t border-[color-mix(in_oklab,var(--input)_60%,transparent)] pt-5",
        className
      )}
    >
      {/* a legenda como h2 da página: o <legend> não aceita o layout em coluna do fieldset */}
      <h2 id={legenda} className="text-[15px] leading-5 font-semibold text-foreground-strong">
        {t("platform.billing.fiscal.title")}
      </h2>

      <Field disabled={disabled}>
        <FieldLabel>{t("platform.billing.fiscal.country")}</FieldLabel>
        <Select
          value={value.country}
          items={countries.map((c) => ({ value: c, label: nomes[c] }))}
          onValueChange={(pais) => pais && mudar({ country: pais })}
          disabled={disabled}
        >
          <SelectTrigger size="touch">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {nomes[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {!brasil ? (
        <p className="text-[13px] leading-[19px] text-muted-foreground">{t("platform.billing.fiscal.outside_brazil")}</p>
      ) : (
        <>
          <Field invalid={errors.taxId !== undefined} disabled={disabled}>
            <FieldLabel>{t(`platform.billing.fiscal.${documento}.label`)}</FieldLabel>
            <InputGroup
              size="touch"
              ref={campo}
              value={formatar(value.taxId)}
              onChange={(e) => digitar(e.target.value, e.target.selectionStart)}
              onKeyDown={apagarSeparador}
              placeholder={t(`platform.billing.fiscal.${documento}.placeholder`)}
              // o CPF só tem dígitos: o teclado numérico; o CNPJ tem letras
              inputMode={documento === "cpf" ? "numeric" : "text"}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="font-mono"
            />
            {errors.taxId ? (
              <FieldError className={DICA}>{t(`platform.billing.fiscal.${documento}.${errors.taxId}`)}</FieldError>
            ) : (
              <FieldDescription className={DICA}>{t(`platform.billing.fiscal.${documento}.hint`)}</FieldDescription>
            )}
          </Field>

          {documento === "cnpj" ? (
            <Field invalid={errors.legalName !== undefined} disabled={disabled}>
              <FieldLabel>{t("platform.billing.fiscal.legal_name.label")}</FieldLabel>
              <Input
                size="touch"
                value={value.legalName}
                onChange={(e) => mudar({ legalName: e.target.value })}
                maxLength={LEGAL_NAME_MAX}
                autoComplete="off"
              />
              {errors.legalName ? (
                <FieldError className={DICA}>{t("platform.billing.fiscal.legal_name.required")}</FieldError>
              ) : null}
            </Field>
          ) : null}
        </>
      )}
    </fieldset>
  )
}

// "BR" → "Brasil" no pt-BR, "Brazil" no en-US; um código que o Intl não conhece, ou malformado, fica como veio
function nomesDosPaises(codigos: string[], locale: string): Record<string, string> {
  return Object.fromEntries(codigos.map((c) => [c, countryName(c, locale)]))
}

// a posição no texto mascarado logo depois do n-ésimo caractere do documento (0: o começo)
function posicaoNaMascara(texto: string, n: number): number {
  if (n <= 0) return 0
  let contados = 0
  for (let i = 0; i < texto.length; i++) {
    if (/[0-9A-Z]/i.test(texto[i]) && ++contados === n) return i + 1
  }
  return texto.length
}
