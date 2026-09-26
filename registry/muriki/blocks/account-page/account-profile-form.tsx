"use client"

// Os dados pessoais da conta Muriki: apelido, nome completo e telefone
// editáveis; o CPF só leitura (é a chave do cupom e do teste, e muda pelo
// suporte). O telefone vem mascarado da API, então o campo não mostra o
// atual: a dica diz como ele termina e o campo recebe o novo.
//
// Devolve por `onSubmit` só o que mudou, que é o que o PATCH do perfil
// espera. Erros por campo vêm de fora (o details[].path do 422).
import { useState, type FormEvent } from "react"
import { LockSimpleIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export interface AccountProfileValues {
  displayName: string
  fullName: string
}

export interface AccountProfileChanges {
  displayName?: string
  fullName?: string
  /** Só vem quando a pessoa digitou um número novo ou pediu para remover (null). */
  phone?: string | null
}

export interface AccountProfileFormProps {
  values: AccountProfileValues
  /** O telefone atual mascarado, ex.: "**********5678". Null quando não há. */
  maskedPhone: string | null
  /** O CPF mascarado, ex.: "***.***.247-25". */
  maskedCpf: string
  onSubmit: (changes: AccountProfileChanges) => void
  saving?: boolean
  errors?: Partial<Record<"displayName" | "fullName" | "phone", string>>
  className?: string
}

export function AccountProfileForm({
  values,
  maskedPhone,
  maskedCpf,
  onSubmit,
  saving = false,
  errors = {},
  className,
}: AccountProfileFormProps) {
  const t = useTranslate()
  const [apelido, setApelido] = useState(values.displayName)
  const [nome, setNome] = useState(values.fullName)
  const [telefone, setTelefone] = useState("")
  const [removerTelefone, setRemoverTelefone] = useState(false)

  const mudancas: AccountProfileChanges = {}
  if (apelido.trim() !== values.displayName) mudancas.displayName = apelido.trim()
  if (nome.trim() !== values.fullName) mudancas.fullName = nome.trim()
  if (removerTelefone) mudancas.phone = null
  else if (telefone.trim()) mudancas.phone = telefone.trim()
  const mudou = Object.keys(mudancas).length > 0

  function descartar() {
    setApelido(values.displayName)
    setNome(values.fullName)
    setTelefone("")
    setRemoverTelefone(false)
  }

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (mudou) onSubmit(mudancas)
  }

  const final = maskedPhone ? maskedPhone.replace(/\D/g, "").slice(-4) : null

  return (
    <AccountCard
      title={t("account.profile.title")}
      description={t("account.profile.description")}
      className={className}
    >
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field invalid={!!errors.displayName}>
            <FieldLabel>{t("account.profile.display_name")}</FieldLabel>
            <Input value={apelido} onChange={(e) => setApelido(e.target.value)} maxLength={60} autoComplete="nickname" />
            {errors.displayName ? <FieldError>{errors.displayName}</FieldError> : null}
          </Field>
          <Field invalid={!!errors.fullName}>
            <FieldLabel>{t("account.profile.full_name")}</FieldLabel>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoComplete="name" />
            {errors.fullName ? <FieldError>{errors.fullName}</FieldError> : null}
          </Field>
        </div>

        <Field invalid={!!errors.phone}>
          <FieldLabel>
            {t("account.profile.phone")}{" "}
            <span className="font-normal text-muted-foreground">{t("account.profile.optional")}</span>
          </FieldLabel>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("account.profile.phone_placeholder")}
            value={telefone}
            disabled={removerTelefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          {errors.phone ? (
            <FieldError>{errors.phone}</FieldError>
          ) : (
            <FieldDescription>
              {removerTelefone
                ? t("account.profile.phone_removing")
                : final
                  ? t("account.profile.phone_hint", { last: final })
                  : t("account.profile.phone_none")}
            </FieldDescription>
          )}
        </Field>
        {maskedPhone ? (
          <Button
            type="button"
            variant="link"
            className="-mt-2 self-start"
            onClick={() => {
              setRemoverTelefone(!removerTelefone)
              setTelefone("")
            }}
          >
            {removerTelefone ? t("account.profile.phone_keep") : t("account.profile.phone_remove")}
          </Button>
        ) : null}

        <Field>
          <FieldLabel>{t("account.profile.cpf")}</FieldLabel>
          <div className="relative">
            <Input value={maskedCpf} readOnly aria-readonly className="bg-secondary pr-9 font-mono text-muted-foreground" />
            <LockSimpleIcon aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FieldDescription>{t("account.profile.cpf_hint")}</FieldDescription>
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={descartar} disabled={!mudou || saving}>
            {t("account.discard")}
          </Button>
          <Button type="submit" variant="primary" loading={saving} disabled={!mudou}>
            {t("account.save")}
          </Button>
        </div>
      </form>
    </AccountCard>
  )
}
