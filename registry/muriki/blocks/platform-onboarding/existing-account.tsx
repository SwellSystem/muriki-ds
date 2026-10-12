"use client"

/**
 * "Você já tem conta Muriki" (CA17), o OnboardingContaMuriki do canvas: quem já usa o Muriki Code
 * entra no Platform com o mesmo login. O @usuário já existe e vem junto, então o campo não aparece;
 * falta só aceitar os termos do Platform e criar o workspace.
 *
 * É o passo de identidade (PlatformOnboardingIdentity) sem o @usuário e com o aviso da conta no
 * topo, montado com as mesmas peças do platform-identity: a moldura, a prévia (que já mostra o
 * @usuário da conta), os cartões de para quem é, o WorkspaceForm e o aceite dos termos. O passo
 * padrão é 2 de 3, porque quem vem do Code entra por login e passa antes pelo código por e-mail.
 *
 * O botão só liga com o nome válido, o endereço livre (`available`) ou não conferido (`unchecked`),
 * valendo para o valor da tela (`slugStatusFor`), e os termos aceitos. O componente só junta os
 * campos e chama `onSubmit`: a ordem das chamadas (o aceite com o `onboardingToken`, depois o
 * workspace) é do app, e o erro que voltar chega por `error`.
 */
import { useId, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon, SpinnerGapIcon, UserIcon, UsersThreeIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { handleReady, handleStatus, workspaceNameIssue } from "@/components/blocks/platform-identity/handles"
import { PlatformOnboardingFrame } from "@/components/blocks/platform-identity/platform-onboarding-frame"
import type {
  PlatformOnboardingAudience,
  PlatformOnboardingTerms,
} from "@/components/blocks/platform-identity/platform-onboarding-identity"
import { WorkspaceForm, type WorkspaceFormProps } from "@/components/blocks/platform-identity/workspace-form"
import { WorkspacePreview, type WorkspaceAudience } from "@/components/blocks/platform-identity/workspace-preview"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"

// os mesmos espaços e ícones do PlatformOnboardingIdentity
const ENTRE_CAMPOS = "gap-[clamp(1rem,2.6vh,1.75rem)]"
const ICONE_PUBLICO = { team: UsersThreeIcon, personal: UserIcon } as const

export interface PlatformExistingAccountProps {
  /** O @usuário que a conta já tem (sem o @). A prévia o mostra; não há campo para ele. */
  username: string
  /** Para quem é o workspace: os dois cartões no topo. O app manda o valor no envio como `kind`. */
  audience: PlatformOnboardingAudience
  workspace: Omit<WorkspaceFormProps, "disabled" | "className" | "audience">
  terms: PlatformOnboardingTerms
  onSubmit: () => void
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app. */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 2 de 3 (depois do código por e-mail). */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformExistingAccount({
  username,
  audience,
  workspace,
  terms,
  onSubmit,
  submitting = false,
  error,
  step = 2,
  total = 3,
  brand,
  utilities,
}: PlatformExistingAccountProps) {
  const t = useTranslate()
  const formId = useId()
  const pessoal = audience.value === "personal"

  const pronto =
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
    <PlatformOnboardingFrame
      brand={brand}
      utilities={utilities}
      stage={
        <WorkspacePreview
          audience={audience.value}
          workspaceName={workspace.name}
          username={username || undefined}
          className="max-h-full w-full max-w-[54rem]"
        />
      }
    >
      <OnboardingStepHeader
        step={step}
        total={total}
        stepperLabel={t("platform.identity.stepper", { step, total })}
        stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
        title={t("platform.identity.title")}
      />

      {/* o aviso da conta: a mesma do Code, com o @usuário junto */}
      <div
        role="note"
        className="flex items-start gap-3.5 rounded-[12px] bg-card px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <MurikiLogo className="size-8 shrink-0" />
        <span className="flex flex-col gap-0.5">
          <span className="text-[14.5px] leading-5 font-semibold text-foreground-strong">
            {t("platform.onboarding.existing_account.title")}
          </span>
          <span className="text-[13px] leading-[19px] text-muted-foreground">{t("platform.onboarding.existing_account.text")}</span>
        </span>
      </div>

      <form
        id={formId}
        onSubmit={enviar}
        noValidate
        data-slot="platform-existing-account"
        className={`flex flex-col ${ENTRE_CAMPOS}`}
      >
        <ChoiceCardGroup
          aria-label={t("platform.identity.audience.label")}
          value={audience.value}
          onValueChange={(v) => audience.onChange(v as WorkspaceAudience)}
          className="[grid-template-columns:1fr_1fr]"
        >
          {(["team", "personal"] as const).map((v) => {
            const Icone = ICONE_PUBLICO[v]
            return (
              <ChoiceCard
                key={v}
                value={v}
                disabled={submitting}
                title={
                  <>
                    {t(`platform.identity.audience.${v}`)}
                    <Icone
                      aria-hidden
                      weight="duotone"
                      className="absolute top-1/2 right-4 hidden size-6 -translate-y-1/2 text-muted-foreground transition-colors sm:block group-data-[checked]/choice:text-primary"
                    />
                  </>
                }
                className="py-[clamp(0.625rem,1.6vh,1rem)] sm:pr-12"
              />
            )
          })}
        </ChoiceCardGroup>

        <WorkspaceForm {...workspace} audience={audience.value} disabled={submitting} className={ENTRE_CAMPOS} />

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

      <div>
        <Button
          className="w-full"
          type="submit"
          form={formId}
          variant="solid"
          size="touch"
          disabled={!pronto || submitting}
          aria-disabled={!pronto || submitting}
        >
          <span>{t(pessoal ? "platform.identity.submit_personal" : "platform.identity.submit")}</span>
          {submitting ? (
            <SpinnerGapIcon aria-hidden className="size-4 animate-spin" />
          ) : (
            <ArrowRightIcon aria-hidden className="size-3.5" />
          )}
        </Button>
      </div>
    </PlatformOnboardingFrame>
  )
}
