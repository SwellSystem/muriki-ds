"use client"

// O email da conta e a troca. Três momentos: o atual (com "Trocar email"),
// digitando o novo, e a troca pendente — o link foi para o email novo e
// vale até `pending.until`; dá para reenviar ou cancelar (DELETE
// /auth/email-change). A API responde 202 sempre, exista ou não conta com
// aquele email, então a tela nunca diz "enviado para x" como fato: diz
// "se o email puder ser usado".
//
// O step-up (403 REAUTHENTICATION_REQUIRED) é do app: ele abre o
// StepUpDialog e repete o pedido.
import { useState, type FormEvent } from "react"
import { ClockIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export interface AccountEmailCardProps {
  email: string
  verified?: boolean
  /** A troca esperando confirmação: o email novo e até quando o link vale (já formatado). */
  pending?: { email: string; until: string } | null
  onRequestChange: (newEmail: string) => void
  requesting?: boolean
  requestError?: string
  onCancelPending: () => void
  cancelling?: boolean
  onResend: () => void
  resending?: boolean
  className?: string
}

export function AccountEmailCard({
  email,
  verified = true,
  pending = null,
  onRequestChange,
  requesting = false,
  requestError,
  onCancelPending,
  cancelling = false,
  onResend,
  resending = false,
  className,
}: AccountEmailCardProps) {
  const t = useTranslate()
  const [editando, setEditando] = useState(false)
  const [novo, setNovo] = useState("")

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (novo.trim()) onRequestChange(novo.trim())
  }

  // quando a troca vira pendente, o formulário sai de cena
  const mostraForm = editando && !pending

  return (
    <AccountCard
      title={t("account.email.title")}
      description={t("account.email.description")}
      className={className}
      action={
        !mostraForm && !pending ? (
          <Button onClick={() => setEditando(true)}>{t("account.email.change")}</Button>
        ) : null
      }
    >
      <div className="flex items-center gap-3 rounded-[10px] bg-secondary px-3.5 py-3">
        <EnvelopeSimpleIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground-strong">{email}</span>
        {verified ? (
          <Badge tone="green" dot>
            {t("account.email.verified")}
          </Badge>
        ) : null}
      </div>

      {mostraForm ? (
        <form onSubmit={enviar} className="flex flex-col gap-3">
          <Field invalid={!!requestError}>
            <FieldLabel>{t("account.email.new")}</FieldLabel>
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              value={novo}
              placeholder={t("account.email.new_placeholder")}
              onChange={(e) => setNovo(e.target.value)}
              className="font-mono"
            />
            {requestError ? (
              <FieldError>{requestError}</FieldError>
            ) : (
              <FieldDescription>{t("account.email.change_hint")}</FieldDescription>
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditando(false)
                setNovo("")
              }}
            >
              {t("account.cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={requesting} disabled={!novo.trim()}>
              {t("account.email.send_link")}
            </Button>
          </div>
        </form>
      ) : null}

      {pending ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-[10px] bg-tone-yellow px-3.5 py-3 text-tone-yellow-foreground sm:flex-row sm:items-start"
        >
          <ClockIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-[13px] leading-[19px]">
            <span>
              {t("account.email.pending")}{" "}
              <b className="font-mono font-medium">{pending.email}</b>
            </span>
            <span className="opacity-85">{t("account.email.pending_hint", { until: pending.until })}</span>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button size="sm" variant="ghost" loading={cancelling} onClick={onCancelPending}>
              {t("account.email.cancel_change")}
            </Button>
            <Button size="sm" loading={resending} onClick={onResend}>
              {t("account.email.resend")}
            </Button>
          </div>
        </div>
      ) : null}
    </AccountCard>
  )
}
