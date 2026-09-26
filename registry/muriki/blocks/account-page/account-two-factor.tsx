"use client"

// A verificação em duas etapas: o cartão (ativa ou desligada) e os dois
// diálogos que ele abre.
//
// Ativar é um fluxo de três passos, na ordem da API: senha (enable devolve
// a URI e os códigos) → QR com a chave manual e o código de 6 dígitos
// (verify-totp) → os dez códigos, uma vez só. Controlado pelo app, que diz
// em que passo está.
//
// Gerar códigos novos (POST /auth/two-factor/backup-codes) pede step-up e
// só existe com o 2FA ativo: o cartão desligado nem oferece.
import { useState, type FormEvent } from "react"
import { ArrowsClockwiseIcon, CheckIcon, LockSimpleIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { QrCode } from "@/components/ui/qr-code"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { AccountCard } from "./account-card"
import { RecoveryCodes, type RecoveryCodesProps } from "./recovery-codes"

export interface AccountTwoFactorCardProps {
  enabled: boolean
  /** Já formatado, ex.: "21 de setembro de 2026". */
  enabledAt?: string
  onEnable: () => void
  onDisable: () => void
  onRegenerateCodes: () => void
  className?: string
}

export function AccountTwoFactorCard({
  enabled,
  enabledAt,
  onEnable,
  onDisable,
  onRegenerateCodes,
  className,
}: AccountTwoFactorCardProps) {
  const t = useTranslate()
  return (
    <AccountCard title={t("account.two_factor.title")} description={t("account.two_factor.description")} className={className}>
      <div className="flex items-center gap-3 rounded-[10px] bg-secondary px-3.5 py-3">
        <LockSimpleIcon aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13.5px] font-medium text-foreground-strong">{t("account.two_factor.app")}</span>
          {enabled && enabledAt ? (
            <span className="text-xs text-muted-foreground">{t("account.two_factor.enabled_at", { date: enabledAt })}</span>
          ) : null}
        </span>
        {enabled ? (
          <Badge tone="green" dot>
            {t("account.two_factor.on")}
          </Badge>
        ) : (
          <Badge variant="dashed">{t("account.two_factor.off")}</Badge>
        )}
      </div>
      {enabled ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onRegenerateCodes}>
              <ArrowsClockwiseIcon />
              {t("account.two_factor.regenerate")}
            </Button>
            <Button variant="ghost" onClick={onDisable}>
              {t("account.two_factor.disable")}
            </Button>
          </div>
          <p className="text-xs leading-[17px] text-muted-foreground">{t("account.two_factor.regenerate_hint")}</p>
        </>
      ) : (
        <>
          <Button variant="primary" className="self-start" onClick={onEnable}>
            {t("account.two_factor.enable")}
          </Button>
          <p className="text-xs leading-[17px] text-muted-foreground">{t("account.two_factor.enable_hint")}</p>
        </>
      )}
    </AccountCard>
  )
}

export type EnableTwoFactorStep = "password" | "scan" | "codes"

export interface EnableTwoFactorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: EnableTwoFactorStep
  pending?: boolean
  /** Passo 1. */
  onSubmitPassword: (password: string) => void
  passwordError?: string
  /** Passo 2: a totpURI que o enable devolve, e a chave (o secret dela) para quem não escaneia. */
  otpauthUri?: string
  secret?: string
  qrLogo?: React.ReactNode
  onVerify: (code: string) => void
  verifyError?: string
  /** Passo 3. */
  codes?: readonly string[]
  codesActions?: Pick<RecoveryCodesProps, "onCopy" | "onDownloadPdf" | "downloadingPdf">
  onDone: () => void
}

export function EnableTwoFactorDialog({
  open,
  onOpenChange,
  step,
  pending = false,
  onSubmitPassword,
  passwordError,
  otpauthUri,
  secret,
  qrLogo,
  onVerify,
  verifyError,
  codes = [],
  codesActions,
  onDone,
}: EnableTwoFactorDialogProps) {
  const t = useTranslate()
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")
  const [guardei, setGuardei] = useState(false)

  function fechar(next: boolean) {
    // os códigos aparecem uma vez: no último passo, fechar é o mesmo que concluir
    if (!next && step === "codes") onDone()
    if (!next) {
      setSenha("")
      setCodigo("")
      setGuardei(false)
    }
    onOpenChange(next)
  }

  function enviarSenha(event: FormEvent) {
    event.preventDefault()
    if (senha) onSubmitPassword(senha)
  }

  const indice = step === "password" ? 0 : step === "scan" ? 1 : 2
  const descricao =
    step === "password"
      ? t("account.two_factor.step_password_hint")
      : step === "scan"
        ? t("account.two_factor.step_scan_hint")
        : t("account.two_factor.step_codes_hint")

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="gap-3">
          <Passos atual={indice} />
          <DialogTitle>{t("account.two_factor.enable_title")}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        {step === "password" ? (
          <form onSubmit={enviarSenha} className="flex flex-col gap-4">
            <DialogBody>
              <Field invalid={!!passwordError}>
                <FieldLabel>{t("account.step_up.password")}</FieldLabel>
                <Input type="password" autoComplete="current-password" autoFocus value={senha} onChange={(e) => setSenha(e.target.value)} className="font-mono" />
                {passwordError ? <FieldError>{passwordError}</FieldError> : null}
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="lg" onClick={() => fechar(false)}>
                {t("account.cancel")}
              </Button>
              <Button type="submit" variant="solid" size="lg" loading={pending} disabled={!senha}>
                {t("account.two_factor.continue")}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {step === "scan" ? (
          <>
            <DialogBody className="flex flex-col gap-4">
              <div className="flex items-center gap-4.5">
                {otpauthUri ? <QrCode value={otpauthUri} size={136} logo={qrLogo} label={t("account.two_factor.qr_label")} /> : null}
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[12.5px] text-muted-foreground">{t("account.two_factor.manual_key")}</span>
                  {secret ? (
                    <code className="rounded-[8px] bg-secondary px-2.5 py-1.5 font-mono text-[12.5px] tracking-[0.08em] break-all text-foreground-strong">
                      {secret.replace(/(.{4})/g, "$1 ").trim()}
                    </code>
                  ) : null}
                </div>
              </div>
              <Field invalid={!!verifyError}>
                <FieldLabel>{t("account.step_up.code")}</FieldLabel>
                <OtpInput
                  length={6}
                  autoFocus
                  value={codigo}
                  onValueChange={setCodigo}
                  onComplete={(v) => !pending && onVerify(v)}
                  invalid={!!verifyError}
                  disabled={pending}
                />
                {verifyError ? <FieldError>{verifyError}</FieldError> : null}
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" size="lg" onClick={() => fechar(false)}>
                {t("account.cancel")}
              </Button>
              <Button variant="solid" size="lg" loading={pending} disabled={codigo.length < 6} onClick={() => onVerify(codigo)}>
                {t("account.two_factor.activate")}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "codes" ? (
          <>
            <DialogBody>
              <RecoveryCodes codes={codes} onSavedChange={setGuardei} {...codesActions} />
            </DialogBody>
            <DialogFooter>
              <Button variant="solid" size="lg" disabled={!guardei} onClick={() => fechar(false)}>
                {t("account.recovery.done")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export interface RecoveryCodesDialogProps extends Pick<RecoveryCodesProps, "onCopy" | "onDownloadPdf" | "downloadingPdf"> {
  open: boolean
  onOpenChange: (open: boolean) => void
  codes: readonly string[]
}

/** Os códigos novos, depois do step-up: os antigos já não valem. */
export function RecoveryCodesDialog({ open, onOpenChange, codes, ...acoes }: RecoveryCodesDialogProps) {
  const t = useTranslate()
  const [guardei, setGuardei] = useState(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{t("account.two_factor.regenerate")}</DialogTitle>
          <DialogDescription>{t("account.recovery.new_hint")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <RecoveryCodes codes={codes} onSavedChange={setGuardei} {...acoes} />
        </DialogBody>
        <DialogFooter>
          <Button variant="solid" size="lg" disabled={!guardei} onClick={() => onOpenChange(false)}>
            {t("account.recovery.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Passos({ atual }: { atual: number }) {
  const t = useTranslate()
  const itens = [t("account.two_factor.step_password"), t("account.two_factor.step_scan"), t("account.two_factor.step_codes")]
  return (
    <ol aria-label={t("account.two_factor.enable_title")} className="flex items-center gap-2">
      {itens.map((item, i) => (
        <li key={item} className="flex items-center gap-2">
          <span
            aria-current={i === atual ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 text-[12.5px]",
              i === atual ? "font-medium text-foreground-strong" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full font-mono text-[10.5px] font-medium",
                i === atual && "bg-primary text-primary-foreground",
                i < atual && "bg-primary-subtle text-primary-subtle-foreground",
                i > atual && "bg-secondary text-muted-foreground shadow-[inset_0_0_0_1px_var(--input)]"
              )}
            >
              {i < atual ? <CheckIcon aria-hidden className="size-[11px]" /> : i + 1}
            </span>
            {item}
          </span>
          {i < itens.length - 1 ? <span aria-hidden className="h-px w-7 bg-input" /> : null}
        </li>
      ))}
    </ol>
  )
}
