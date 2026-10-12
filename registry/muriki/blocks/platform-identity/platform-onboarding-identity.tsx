"use client"

/**
 * O passo de identidade do onboarding do Platform, numa tela só: o @usuário, o workspace (nome e
 * endereço) e o aceite dos termos, dentro do OnboardingStep. Não pede CPF nem plano: o documento
 * só aparece no checkout de um plano pago.
 *
 * O botão só liga com os três campos no formato, o @usuário e o endereço livres (`available`) ou
 * não conferidos (`unchecked`, a API confere no envio), cada status valendo para o valor da tela
 * (`statusFor`), e os termos aceitos. Sem `username` (a pessoa já tem @usuário, por exemplo quem
 * vem do Code), o campo não aparece e o botão não conta com ele. O componente só junta os campos e
 * chama `onSubmit`: a ordem das chamadas (o aceite, o @usuário, o workspace) é do app, e o erro
 * que voltar chega por `error`.
 */
import { useId, type FormEvent, type ReactNode } from "react"

import { OnboardingStep } from "@/components/blocks/onboarding-step/onboarding-step"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { useTranslate } from "@/lib/i18n"

import { handleReady, handleStatus, workspaceNameIssue } from "./handles"
import { UsernameField, type UsernameFieldProps } from "./username-field"
import { WorkspaceForm, type WorkspaceFormProps } from "./workspace-form"

export interface PlatformOnboardingTerms {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Os endereços dos documentos atuais. Abrem em outra aba. */
  links: { terms: string; privacy: string }
}

export interface PlatformOnboardingIdentityProps {
  /** Sem isto, o campo do @usuário não aparece: a pessoa já tem um. */
  username?: Pick<UsernameFieldProps, "value" | "onChange" | "status" | "statusFor">
  workspace: Omit<WorkspaceFormProps, "disabled" | "className">
  terms: PlatformOnboardingTerms
  onSubmit: () => void
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app. */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 1 de 2 (depois vem convidar). */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformOnboardingIdentity({
  username,
  workspace,
  terms,
  onSubmit,
  submitting = false,
  error,
  step = 1,
  total = 2,
  brand,
  utilities,
}: PlatformOnboardingIdentityProps) {
  const t = useTranslate()
  const formId = useId()

  const pronto =
    (!username || handleReady(handleStatus("username", username.value, username.status, username.statusFor))) &&
    workspaceNameIssue(workspace.name) === null &&
    handleReady(handleStatus("slug", workspace.slug, workspace.slugStatus, workspace.slugStatusFor)) &&
    terms.checked

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (pronto && !submitting) onSubmit()
  }

  const link = (href: string, texto: string) => (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-2 hover:underline">
      {texto}
    </a>
  )

  return (
    <OnboardingStep
      step={step}
      total={total}
      stepperLabel={t("platform.identity.stepper", { step, total })}
      stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
      title={t("platform.identity.title")}
      subtitle={t("platform.identity.subtitle")}
      brand={brand}
      utilities={utilities}
      action={{
        label: t("platform.identity.submit"),
        type: "submit",
        form: formId,
        loading: submitting,
        disabled: !pronto,
      }}
    >
      <form id={formId} onSubmit={enviar} noValidate data-slot="platform-onboarding-identity" className="flex flex-col gap-8">
        {username ? (
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <Legenda>{t("platform.identity.section_you")}</Legenda>
            <UsernameField {...username} disabled={submitting} />
          </fieldset>
        ) : null}

        <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
          <Legenda>{t("platform.identity.section_workspace")}</Legenda>
          <WorkspaceForm {...workspace} disabled={submitting} />
        </fieldset>

        <Field className="flex-row items-start gap-2.5" disabled={submitting}>
          <Checkbox checked={terms.checked} onCheckedChange={(checked) => terms.onChange(checked)} className="mt-0.5" />
          <FieldLabel className="cursor-pointer text-sm leading-5 font-normal text-muted-foreground">
            <span>
              {t("platform.identity.terms_prefix")} {link(terms.links.terms, t("platform.identity.terms"))}{" "}
              {t("platform.identity.terms_and")} {link(terms.links.privacy, t("platform.identity.privacy"))}.
            </span>
          </FieldLabel>
        </Field>

        {error ? (
          <p role="alert" className="text-[13px] leading-[19px] text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </OnboardingStep>
  )
}

function Legenda({ children }: { children: ReactNode }) {
  // a legenda de grupo das telas de entrada: mono, caixa alta, espaçada
  return (
    <legend className="mb-3 p-0 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">{children}</legend>
  )
}
