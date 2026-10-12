"use client"

/**
 * O passo de identidade do onboarding do Platform, numa tela só: para quem é o workspace, o
 * @usuário, o workspace (nome e endereço) e o aceite dos termos. Não pede CPF nem plano: o
 * documento só aparece no checkout de um plano pago.
 *
 * Para quem é (CA4c): dois cartões no topo, "Com o meu time" (`team`, o padrão do app) e "Só para
 * mim" (`personal`). A escolha troca o produto da prévia (Muriki Projects ou Muriki Focus) e o app
 * a manda no envio como `kind`; não mexe no plano.
 *
 * O botão só liga com os três campos no formato, o @usuário e o endereço livres (`available`) ou
 * não conferidos (`unchecked`, a API confere no envio), cada status valendo para o valor da tela
 * (`statusFor`), e os termos aceitos. Sem `username` (a pessoa já tem @usuário, por exemplo quem
 * vem do Code), o campo não aparece e o botão não conta com ele. O componente só junta os campos e
 * chama `onSubmit`: a ordem das chamadas (o aceite, o @usuário, o workspace) é do app, e o erro
 * que voltar chega por `error`.
 *
 * Layout: as mesmas peças do OnboardingStep (a barra do topo, o cabeçalho de passo e a ação), mas
 * medidas pela altura da janela. A partir do `lg` a tela é uma grade da altura da viewport, sem
 * rolar de 1280×720 a 1920×1080: o formulário à esquerda e, à direita, um palco azul com a
 * WorkspacePreview do tamanho que sobrar; espaços e tamanhos em `clamp()` com `vh`, o título também
 * (40px em 720 de altura, 52px de 930 para cima). Abaixo do `lg`
 * a prévia some e o passo é a coluna de formulário de sempre, que pode rolar.
 */
import { useId, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon, SpinnerGapIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { useTranslate } from "@/lib/i18n"

import { handleReady, handleStatus, workspaceNameIssue } from "./handles"
import { UsernameField, type UsernameFieldProps } from "./username-field"
import { WorkspaceForm, type WorkspaceFormProps } from "./workspace-form"
import { AUDIENCE_PRODUCT, WorkspacePreview, type WorkspaceAudience } from "./workspace-preview"

// o espaço vertical entre os campos: 14px em 720 de altura, 24px de 1080 para cima
const ENTRE_CAMPOS = "gap-[clamp(0.875rem,2.2vh,1.5rem)]"

export interface PlatformOnboardingTerms {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Os endereços dos documentos atuais. Abrem em outra aba. */
  links: { terms: string; privacy: string }
}

export interface PlatformOnboardingAudience {
  /** `team` (padrão do app): Muriki Projects. `personal`: Muriki Focus. */
  value: WorkspaceAudience
  onChange: (value: WorkspaceAudience) => void
}

export interface PlatformOnboardingIdentityProps {
  /** Sem isto, o campo do @usuário não aparece: a pessoa já tem um. */
  username?: Pick<UsernameFieldProps, "value" | "onChange" | "status" | "statusFor">
  /** Para quem é o workspace: os dois cartões no topo. O app manda o valor no envio. */
  audience: PlatformOnboardingAudience
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
  audience,
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
    <div className="relative flex min-h-svh flex-col bg-background lg:grid lg:h-dvh lg:min-h-[40rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {brand || utilities ? (
        <header className="z-10 flex h-16 shrink-0 items-center gap-3 px-6 md:px-8 lg:absolute lg:inset-x-0 lg:top-0">
          {brand}
          <div className="ml-auto flex items-center gap-1">{utilities}</div>
        </header>
      ) : null}

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-9 px-4 pt-8 pb-10 md:px-6 lg:max-w-[32rem] lg:justify-center lg:[&_h1]:text-[clamp(2.25rem,5.6vh,3.25rem)] lg:gap-[clamp(1.25rem,3.6vh,2.5rem)] lg:px-0 lg:pt-16 lg:pb-[clamp(1rem,3vh,2.5rem)]">
        <OnboardingStepHeader
          step={step}
          total={total}
          stepperLabel={t("platform.identity.stepper", { step, total })}
          stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
          title={t("platform.identity.title")}
        />

        <form
          id={formId}
          onSubmit={enviar}
          noValidate
          data-slot="platform-onboarding-identity"
          className={`flex flex-col ${ENTRE_CAMPOS}`}
        >
          <ChoiceCardGroup
            aria-label={t("platform.identity.audience.label")}
            value={audience.value}
            onValueChange={(v) => audience.onChange(v as WorkspaceAudience)}
            className="[grid-template-columns:1fr_1fr]"
          >
            {(["team", "personal"] as const).map((v) => (
              <ChoiceCard
                key={v}
                value={v}
                disabled={submitting}
                title={t(`platform.identity.audience.${v}`)}
                description={AUDIENCE_PRODUCT[v]}
                className="py-[clamp(0.625rem,1.6vh,1rem)]"
              />
            ))}
          </ChoiceCardGroup>

          {username ? <UsernameField {...username} disabled={submitting} /> : null}

          <WorkspaceForm {...workspace} disabled={submitting} className={ENTRE_CAMPOS} />

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

        {/* a ação do OnboardingStep: o Button com o loading do sistema */}
        <div>
          <Button
            type="submit"
            form={formId}
            variant="solid"
            size="touch"
            disabled={!pronto || submitting}
            aria-disabled={!pronto || submitting}
          >
            <span>{t("platform.identity.submit")}</span>
            {submitting ? (
              <SpinnerGapIcon aria-hidden className="size-4 animate-spin" />
            ) : (
              <ArrowRightIcon aria-hidden className="size-3.5" />
            )}
          </Button>
        </div>
      </main>

      {/* o palco da prévia: a faixa azul da altura da tela, com a janela do tamanho que sobrar */}
      <div className="hidden min-h-0 items-center justify-center bg-primary-subtle bg-[radial-gradient(var(--primary-subtle-border)_1px,transparent_1.5px)] bg-[size:22px_22px] px-[clamp(2rem,4vw,5rem)] pt-16 pb-[clamp(1.5rem,5vh,4rem)] lg:flex">
        <WorkspacePreview
          audience={audience.value}
          workspaceName={workspace.name}
          username={username?.value}
          className="h-full max-h-[46rem] w-full max-w-[54rem]"
        />
      </div>
    </div>
  )
}
