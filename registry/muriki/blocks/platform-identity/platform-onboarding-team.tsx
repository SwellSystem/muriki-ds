"use client"

/**
 * O passo opcional do primeiro acesso do Platform: criar um workspace de equipe. Vem depois da
 * identidade (o workspace pessoal já nasceu na API) e antes do convidar, que só aparece se a
 * equipe for criada.
 *
 * A mesma moldura dos outros passos (PlatformOnboardingFrame): à esquerda a WorkspacePreview do
 * Muriki Projects com o nome que a pessoa escreve e o @usuário; à direita o passo, o título, o
 * WorkspaceForm (nome e endereço, com os estados do slug), "Criar workspace" e "Pular", que leva ao
 * workspace pessoal e não exige nada.
 *
 * O botão só liga com o nome válido e o endereço livre (`available`) ou não conferido
 * (`unchecked`), valendo para o valor da tela (`slugStatusFor`). O componente só junta os campos e
 * chama `onSubmit`: a chamada é do app, e o erro que voltar chega por `error`, já traduzido (o 409
 * FREE_WORKSPACE_LIMIT tem o texto em `platform.identity.team.free_limit`; o app pode juntar o
 * link da cobrança).
 */
import { useId, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"

import { handleReady, handleStatus, workspaceNameIssue } from "./handles"
import { PlatformOnboardingFrame } from "./platform-onboarding-frame"
import { WorkspaceForm, type WorkspaceFormProps } from "./workspace-form"
import { WorkspacePreview } from "./workspace-preview"

// o mesmo espaço entre os campos do PlatformOnboardingIdentity
const ENTRE_CAMPOS = "gap-[clamp(1rem,2.6vh,1.75rem)]"

export interface PlatformOnboardingTeamProps {
  workspace: Omit<WorkspaceFormProps, "disabled" | "className" | "audience">
  /** O @usuário da conta (sem o @), na prévia. */
  username?: string
  onSubmit: () => void
  /** Pula a equipe e leva ao workspace pessoal. */
  onSkip: () => void
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app (ex.: 409 FREE_WORKSPACE_LIMIT). */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 2 de 3 (depois vem o convite). */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformOnboardingTeam({
  workspace,
  username,
  onSubmit,
  onSkip,
  submitting = false,
  error,
  step = 2,
  total = 3,
  brand,
  utilities,
}: PlatformOnboardingTeamProps) {
  const t = useTranslate()
  const formId = useId()

  const pronto =
    workspaceNameIssue(workspace.name) === null &&
    handleReady(handleStatus("slug", workspace.slug, workspace.slugStatus, workspace.slugStatusFor))

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (pronto && !submitting) onSubmit()
  }

  return (
    <PlatformOnboardingFrame
      brand={brand}
      utilities={utilities}
      stage={
        <WorkspacePreview
          audience="team"
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
        title={t("platform.identity.team.title")}
        subtitle={t("platform.identity.team.subtitle")}
      />

      <form
        id={formId}
        onSubmit={enviar}
        noValidate
        data-slot="platform-onboarding-team"
        className={`flex flex-col ${ENTRE_CAMPOS}`}
      >
        <WorkspaceForm {...workspace} disabled={submitting} className={ENTRE_CAMPOS} />

        {error ? (
          <p role="alert" className="text-[13px] leading-[19px] text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {/* a ação do convidar: criar, e embaixo o pular, que não exige nada */}
      <div className="flex flex-col gap-1">
        <Button
          className="w-full"
          type="submit"
          form={formId}
          variant="solid"
          size="touch"
          loading={submitting}
          disabled={!pronto || submitting}
        >
          <span>{t("platform.identity.team.submit")}</span>
          {submitting ? null : <ArrowRightIcon aria-hidden className="size-3.5" />}
        </Button>
        <Button type="button" variant="ghost" className="h-9 w-full text-muted-foreground" onClick={onSkip} disabled={submitting}>
          {t("platform.identity.team.skip")}
        </Button>
      </div>
    </PlatformOnboardingFrame>
  )
}
