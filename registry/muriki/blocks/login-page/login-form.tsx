"use client"

/**
 * Muriki LoginForm — o miolo da tela de login.
 *
 * O bloco cuida da EXPERIÊNCIA: hierarquia de provedores (um primário
 * largo, os outros numa fileira compacta), campos editoriais com ícone,
 * força de senha, segundo fator inline, "lembrar de mim" e o único botão
 * sólido da tela. O app cuida da REDE: `onSubmit` e `onVerifyCode`
 * devolvem um LoginResult, e é só isso que o bloco sabe do backend.
 *
 * O erro de credenciais mora embaixo da senha, não num toast — é a mesma
 * regra do FieldError: o erro fica onde a pessoa vai corrigir.
 */
import { useRef, useState, type FormEvent } from "react"
import {
  ArrowRight,
  Buildings,
  Envelope,
  Eye,
  EyeSlash,
  Fingerprint,
  GithubLogo,
  GoogleLogo,
  Lock,
  LockOpen,
  ShieldCheck,
  SpinnerGap,
} from "@phosphor-icons/react"

import { PasswordStrengthBar } from "@/components/blocks/password-strength/password-strength-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldHeader, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { MicrosoftLogo } from "./microsoft-logo"
import type { LoginFormProps, LoginProvider, LoginResult } from "./types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PASSWORD_MIN_LENGTH = 8

export const GOOGLE_PROVIDER: LoginProvider = { id: "google", label: "Google", icon: GoogleLogo }

export const DEFAULT_PROVIDERS: LoginProvider[] = [
  { id: "microsoft", label: "Microsoft", icon: MicrosoftLogo },
  { id: "github", label: "GitHub", icon: GithubLogo },
  { id: "passkey", label: "Passkey", icon: Fingerprint },
  { id: "sso", label: "SSO", icon: Buildings },
]

/** Legenda mono em caixa alta — a voz editorial da tela. */
export const CAPTION =
  "font-mono text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase"

type Step = "credentials" | "code"

interface Errors {
  email?: string
  password?: string
  code?: string
  form?: string
}

export function LoginForm({
  onSubmit,
  onVerifyCode,
  primaryProvider = GOOGLE_PROVIDER,
  providers = DEFAULT_PROVIDERS,
  onProvider,
  onForgotPassword,
  onCreateAccount,
  busy = false,
  busyLabel,
  passwordMinLength = PASSWORD_MIN_LENGTH,
  onPasswordVisibilityChange,
  className,
}: LoginFormProps) {
  const t = useTranslate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<Step>("credentials")
  const [code, setCode] = useState("")
  const [trustDevice, setTrustDevice] = useState(true)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const submitting = pending || busy

  const togglePassword = () => {
    const next = !showPassword
    setShowPassword(next)
    onPasswordVisibilityChange?.(next)
  }

  const applyFailure = (result: Extract<LoginResult, { ok: false }>) => {
    if (result.reason === "credentials") {
      setErrors({ password: result.message ?? t("login.invalid_credentials") })
      passwordRef.current?.focus()
      return
    }
    if (result.reason === "code") {
      setErrors({ code: result.message ?? t("login.totp.code_invalid") })
      return
    }
    setErrors({ form: result.message ?? t("login.failed") })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (step === "code") {
      const trimmed = code.trim()
      if (trimmed.length < 6) {
        setErrors({ code: t("login.totp.code_invalid") })
        return
      }
      if (!onVerifyCode) return
      setErrors({})
      setPending(true)
      try {
        const result = await onVerifyCode({ code: trimmed, trustDevice })
        if (!result.ok) applyFailure(result)
      } finally {
        setPending(false)
      }
      return
    }

    const next: Errors = {}
    if (!EMAIL_PATTERN.test(email.trim())) next.email = t("login.email_invalid")
    if (password.length < passwordMinLength) {
      next.password = t("login.password_min_length", { min: passwordMinLength })
    }
    if (next.email || next.password) {
      setErrors(next)
      ;(next.email ? emailRef : passwordRef).current?.focus()
      return
    }

    setErrors({})
    setPending(true)
    try {
      const result = await onSubmit({ email: email.trim(), password, rememberMe })
      if (!result.ok) {
        applyFailure(result)
        return
      }
      if (result.twoFactor) {
        setStep("code")
        setCode("")
      }
    } finally {
      setPending(false)
    }
  }

  const backToPassword = () => {
    setStep("credentials")
    setCode("")
    setErrors({})
  }

  const ctaLabel = submitting
    ? busy
      ? (busyLabel ?? t("login.busy"))
      : step === "code"
        ? t("login.totp.verifying")
        : t("login.submitting")
    : step === "code"
      ? t("login.totp.verify_submit")
      : t("login.submit")

  // No passo do código, a credencial já foi aceita: manter e-mail, senha e
  // provedores na tela só empurra o botão para fora da dobra.
  const credenciais = step === "credentials"

  const PasswordIcon = showPassword ? LockOpen : Lock
  const EyeIcon = showPassword ? EyeSlash : Eye
  const PrimaryIcon = primaryProvider?.icon

  return (
    // O ritmo responde à ALTURA da janela, não só à largura: esta é uma
    // tela de viewport inteiro, e numa janela baixa a folga que sobra em
    // cima é o botão de entrar que falta embaixo.
    <div className={cn("flex flex-col gap-7 md:gap-8 [@media(min-height:781px)_and_(max-height:900px)]:gap-5 [@media(max-height:780px)]:gap-4", className)}>
      {/* rótulo de seção */}
      <div className="flex items-center gap-3">
        <span className={CAPTION}>{t("login.submit")}</span>
        <span className="h-px w-10 bg-primary" />
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* título */}
      <div className="flex flex-col gap-4 [@media(max-height:900px)]:gap-3">
        <h1 className="text-[clamp(2.5rem,9vw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-foreground-strong md:text-5xl [@media(max-height:900px)]:text-4xl">
          {t("login.hero_line1")}
          <br />
          <span className="text-primary">{t("login.hero_line2")}</span>
        </h1>
        {credenciais ? (
        <p className="text-sm text-muted-foreground md:text-base">
          {t("login.subtitle")}{" "}
          <Button
            variant="link"
            onClick={onCreateAccount}
            className="text-sm font-medium text-foreground hover:text-primary md:text-base"
          >
            {t("login.create_account_link")}
          </Button>
        </p>
        ) : null}
      </div>

      {/* provedores — um primário largo, os outros numa fileira.
          No passo do código eles somem: credencial já foi. */}
      {credenciais && (primaryProvider || providers.length > 0) ? (
        <div className="flex flex-col gap-2.5">
          <span className={CAPTION}>{t("login.section_signin_with")}</span>

          {primaryProvider && PrimaryIcon ? (
            <Button
              type="button"
              variant="outline"
              size="touch"
              effect="wipe"
              disabled={submitting}
              onClick={() => onProvider?.(primaryProvider.id)}
              aria-label={`${t("login.section_signin_with")} ${primaryProvider.label}`}
              className="w-full gap-2.5"
            >
              <PrimaryIcon size={18} weight="bold" className="size-[18px] text-foreground/85" />
              <span className="text-sm font-medium tracking-tight">{primaryProvider.label}</span>
            </Button>
          ) : null}

          {providers.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {providers.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  size="lg"
                  effect="wipe"
                  disabled={submitting}
                  onClick={() => onProvider?.(id)}
                  aria-label={`${t("login.section_signin_with")} ${label}`}
                  className="h-10 w-full gap-1.5 font-mono text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
                >
                  <Icon size={14} weight="bold" className="size-3.5 text-foreground/70" />
                  {label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* divisor */}
      {credenciais ? (
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className={CAPTION}>{t("login.section_or")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* email + senha: só enquanto a credencial é o assunto */}
        {credenciais ? (
        <>
        <Field variant="editorial" invalid={!!errors.email}>
          <FieldLabel>{t("login.email_label")}</FieldLabel>
          <div className="relative">
            <Envelope
              aria-hidden
              size={18}
              className="pointer-events-none absolute top-1/2 left-0 size-[18px] -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              ref={emailRef}
              type="email"
              variant="underline"
              size="touch"
              autoFocus
              autoComplete="email webauthn"
              placeholder={t("login.email_placeholder")}
              value={email}
              onValueChange={setEmail}
              className="pl-7"
            />
          </div>
          {errors.email ? <FieldError>{errors.email}</FieldError> : null}
        </Field>

        {/* senha */}
        <Field variant="editorial" invalid={!!errors.password}>
          <FieldHeader>
            <FieldLabel>{t("login.password_label")}</FieldLabel>
            {onForgotPassword ? (
              <button
                type="button"
                onClick={onForgotPassword}
                className={cn(CAPTION, "cursor-pointer tracking-[0.2em] transition-colors hover:text-foreground")}
              >
                {t("login.forgot_password")}
              </button>
            ) : null}
          </FieldHeader>
          <div className="relative">
            <PasswordIcon
              aria-hidden
              size={18}
              className="pointer-events-none absolute top-1/2 left-0 size-[18px] -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              variant="underline"
              size="touch"
              autoComplete="current-password"
              placeholder={t("login.password_placeholder")}
              value={password}
              onValueChange={setPassword}
              className="pr-9 pl-7"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={showPassword}
              aria-label={showPassword ? t("login.hide_password") : t("login.show_password")}
              onClick={togglePassword}
              className="absolute top-1/2 right-0 -translate-y-1/2 text-muted-foreground/70 hover:bg-transparent hover:text-foreground"
            >
              <EyeIcon aria-hidden size={18} className="size-[18px]" />
            </Button>
          </div>
          {errors.password ? <FieldError>{errors.password}</FieldError> : null}
          <PasswordStrengthBar password={password} requirements className="pt-1" />
        </Field>
        </>
        ) : null}

        {/* segundo fator */}
        {step === "code" ? (
          <div className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
            <ShieldCheck aria-hidden size={18} className="mt-0.5 size-[18px] shrink-0 text-primary" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-foreground-strong">{t("login.totp.title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("login.totp.description")}</p>
                {email.trim() ? (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{email.trim()}</p>
                ) : null}
              </div>
              <Field variant="editorial" invalid={!!errors.code}>
                <FieldLabel>{t("login.totp.code_label")}</FieldLabel>
                <Input
                  size="lg"
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={t("login.totp.code_placeholder")}
                  value={code}
                  onValueChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 8))}
                  className="font-mono tracking-[0.25em]"
                />
                {errors.code ? <FieldError>{errors.code}</FieldError> : null}
              </Field>
              <Field className="flex-row items-center gap-2.5">
                <Checkbox checked={trustDevice} onCheckedChange={(checked) => setTrustDevice(checked)} />
                <FieldLabel className="cursor-pointer text-xs font-normal text-muted-foreground">
                  {t("login.totp.trust_device")}
                </FieldLabel>
              </Field>
              <button
                type="button"
                onClick={backToPassword}
                className={cn(CAPTION, "cursor-pointer self-start tracking-[0.2em] transition-colors hover:text-foreground")}
              >
                {t("login.totp.back_to_password")}
              </button>
            </div>
          </div>
        ) : null}

        {/* lembrar de mim */}
        {credenciais ? (
        <Field className="flex-row items-center gap-2.5">
          <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked)} />
          <FieldLabel className="cursor-pointer text-sm font-normal text-muted-foreground">
            {t("login.remember_me")}
          </FieldLabel>
        </Field>
        ) : null}

        {errors.form ? (
          <p role="alert" className="text-[11.5px] leading-[15px] text-destructive">
            {errors.form}
          </p>
        ) : null}

        {/* o único sólido da tela */}
        <Button
          type="submit"
          variant="solid"
          size="touch"
          disabled={submitting}
          className="w-full justify-between px-5"
        >
          <span className="font-medium tracking-wide">{ctaLabel}</span>
          {submitting ? (
            <SpinnerGap aria-hidden size={18} className="size-[18px] animate-spin" />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform group-hover/button:translate-x-0.5">
              <ArrowRight aria-hidden size={14} weight="bold" className="size-3.5" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
