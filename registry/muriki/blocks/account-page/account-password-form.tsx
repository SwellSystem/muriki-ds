"use client"

// Trocar a senha: a atual e a nova, com a régua da casa só no tamanho
// (12 a 128 caracteres; a checagem de vazamento é da API e volta como
// erro no campo). A API encerra as outras sessões na troca, e o cartão
// avisa antes.
import { useState, type FormEvent } from "react"

import { PasswordStrengthBar } from "@/components/blocks/password-strength/password-strength-bar"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export interface AccountPasswordFormProps {
  onSubmit: (values: { currentPassword: string; newPassword: string }) => void
  saving?: boolean
  /** INVALID_PASSWORD vai em `current`; PASSWORD_COMPROMISED e tamanho vão em `new`. */
  errors?: { current?: string; new?: string }
  /** Mude a chave (ex.: um contador) para limpar os campos depois do sucesso. */
  resetKey?: string | number
  className?: string
}

const MIN = 12
const MAX = 128

export function AccountPasswordForm(props: AccountPasswordFormProps) {
  // o resetKey remonta o formulário e limpa os campos
  return <Formulario key={props.resetKey} {...props} />
}

function Formulario({ onSubmit, saving = false, errors = {}, className }: AccountPasswordFormProps) {
  const t = useTranslate()
  const [atual, setAtual] = useState("")
  const [nova, setNova] = useState("")
  const pronta = atual.length > 0 && nova.length >= MIN && nova.length <= MAX

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (pronta) onSubmit({ currentPassword: atual, newPassword: nova })
  }

  return (
    <AccountCard title={t("account.password.title")} description={t("account.password.description")} className={className}>
      <form onSubmit={enviar} className="flex flex-col gap-3.5">
        <Field invalid={!!errors.current}>
          <FieldLabel>{t("account.password.current")}</FieldLabel>
          <Input type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} className="font-mono" />
          {errors.current ? <FieldError>{errors.current}</FieldError> : null}
        </Field>
        <Field invalid={!!errors.new}>
          <FieldLabel>{t("account.password.new")}</FieldLabel>
          <Input
            type="password"
            autoComplete="new-password"
            maxLength={MAX}
            placeholder={t("account.password.new_placeholder")}
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            className="font-mono"
          />
          <PasswordStrengthBar password={nova} minLength={MIN} composition={false} />
          {errors.new ? <FieldError>{errors.new}</FieldError> : <FieldDescription>{t("account.password.rule")}</FieldDescription>}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={saving} disabled={!pronta}>
            {t("account.password.submit")}
          </Button>
        </div>
      </form>
    </AccountCard>
  )
}
