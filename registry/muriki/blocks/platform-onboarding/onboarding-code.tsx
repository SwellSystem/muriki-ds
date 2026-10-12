"use client"

/**
 * O código por e-mail do primeiro acesso do Platform (CA17), o OnboardingCodigo do canvas: só para
 * quem entrou por login sem a prova da caixa (o `GET /onboarding` devolve `challengeRequired`).
 * Quem acabou de criar a senha pelo link já tem a prova e pula este passo.
 *
 * Na moldura do primeiro acesso (PlatformOnboardingFrame): o palco da marca à esquerda (as janelas
 * do Projects e do Focus em esqueleto) e, à direita, o passo (1 de 3 por padrão), "Confirme seu
 * e-mail" com o e-mail da sessão (inteiro, como no canvas: é o da própria pessoa), os seis
 * quadrados do OtpInput (com o `autocomplete="one-time-code"` dele), "Verificar" e o reenviar.
 *
 * O reenviar espera: o app passa em `resendIn` os segundos que faltam e atualiza o valor. O
 * componente não tem relógio: só mostra "Reenviar em 0:48" (desligado) ou, com zero, o botão que
 * chama `onResend`. O código digitado fica aqui dentro, ou com o app quando ele passa `code` e
 * `onCodeChange` (para limpar os quadrados ao reenviar ou quando o código volta errado); "Verificar"
 * liga com os 6 dígitos e chama `onSubmit(code)`. A chamada (`POST /onboarding/platform/challenge/verify`),
 * o "verificando" e o erro (422 CHALLENGE_CODE_INVALID ou CHALLENGE_CODE_EXHAUSTED, já traduzidos)
 * são do app.
 *
 * O campo é um Field: o rótulo (só para o leitor de tela), a dica ("vale por 10 minutos") e o erro
 * ficam ligados ao input. Verificando, o campo fica `readOnly` e `aria-busy`, não `disabled`: o
 * foco continua nele em vez de cair no `body`.
 */
import { useId, useState, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { PlatformOnboardingFrame } from "@/components/blocks/platform-identity/platform-onboarding-frame"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { OtpInput } from "@/components/ui/otp-input"
import { useTranslate } from "@/lib/i18n"

import { PlatformBrandStage } from "./brand-stage"
import { formatCountdown } from "./countdown"

const DIGITOS = 6

export interface PlatformOnboardingCodeProps {
  /** O e-mail da sessão, inteiro (ex.: `rafael@moura.dev`): é o da própria pessoa. */
  email: string
  /** O código digitado, quando o app quer controlar (para limpar ao reenviar ou no erro). Sem isto, fica aqui dentro. */
  code?: string
  /** Recebe cada mudança do código. Vai junto com `code`. */
  onCodeChange?: (code: string) => void
  /** Recebe os 6 dígitos. */
  onSubmit: (code: string) => void
  /** Pede um código novo (`POST /onboarding/platform/challenge`). */
  onResend: () => void
  /** Os segundos que faltam para poder reenviar. Com 0 ou sem isto, o reenviar fica livre. */
  resendIn?: number
  /** O pedido de um código novo está saindo. */
  resending?: boolean
  /** O código está sendo conferido. */
  verifying?: boolean
  /** O erro da conferência ou do reenvio, já traduzido pelo app. Pinta os quadrados de vermelho. */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 1 de 3. */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformOnboardingCode({
  email,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  resendIn = 0,
  resending = false,
  verifying = false,
  error,
  step = 1,
  total = 3,
  brand,
  utilities,
}: PlatformOnboardingCodeProps) {
  const t = useTranslate()
  const formId = useId()
  const [interno, setInterno] = useState("")
  const codigo = code ?? interno
  const completo = codigo.length === DIGITOS
  const esperando = resendIn > 0

  function mudar(valor: string) {
    if (code === undefined) setInterno(valor)
    onCodeChange?.(valor)
  }

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (completo && !verifying) onSubmit(codigo)
  }

  return (
    <PlatformOnboardingFrame brand={brand} utilities={utilities} stage={<PlatformBrandStage />}>
      <OnboardingStepHeader
        step={step}
        total={total}
        stepperLabel={t("platform.identity.stepper", { step, total })}
        stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
        title={t("platform.onboarding.code.title")}
        subtitle={
          <>
            {t("platform.onboarding.code.subtitle")} <b className="font-medium text-foreground-strong">{email}</b>.
          </>
        }
      />

      <form id={formId} onSubmit={enviar} noValidate data-slot="platform-onboarding-code" className="flex flex-col gap-4">
        <Field invalid={!!error} className="gap-4">
          <FieldLabel className="sr-only">{t("platform.onboarding.code.label")}</FieldLabel>
          <OtpInput
            length={DIGITOS}
            size="lg"
            groupSize={3}
            fullWidth
            autoFocus
            value={codigo}
            onValueChange={mudar}
            invalid={!!error}
            readOnly={verifying}
            aria-busy={verifying || undefined}
          />
          {error ? (
            <FieldError className="text-[13px] leading-[19px]">{error}</FieldError>
          ) : (
            <FieldDescription className="text-[13px] leading-[19px]">{t("platform.onboarding.code.expires")}</FieldDescription>
          )}
        </Field>
      </form>

      <div className="flex flex-col gap-6">
        <Button
          className="w-full"
          type="submit"
          form={formId}
          variant="solid"
          size="touch"
          loading={verifying}
          disabled={!completo}
        >
          <span>{t("platform.onboarding.code.submit")}</span>
          {verifying ? null : <ArrowRightIcon aria-hidden className="size-3.5" />}
        </Button>

        <p className="text-[13px] leading-5 text-muted-foreground">
          {t("platform.onboarding.code.not_received")}{" "}
          {esperando ? (
            <span aria-disabled="true" className="font-medium tabular-nums">
              {t("platform.onboarding.code.resend_in", { time: formatCountdown(resendIn) })}
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resending || verifying}
              className="font-medium text-foreground underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-60"
            >
              {t("platform.onboarding.code.resend")}
            </button>
          )}
          <br />
          {t("platform.onboarding.code.spam")}
        </p>
      </div>
    </PlatformOnboardingFrame>
  )
}
