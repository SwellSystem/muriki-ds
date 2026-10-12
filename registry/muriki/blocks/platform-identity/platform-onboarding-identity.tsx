"use client"

/**
 * O passo de identidade do onboarding do Platform, numa tela só: para quem é o workspace, o
 * @usuário, o workspace (nome e endereço) e o aceite dos termos. Não pede CPF nem plano: o
 * documento só aparece no checkout de um plano pago.
 *
 * Para quem é (CA4c): dois cartões no topo, "Com o meu time" (`team`, o padrão do app) e "Só para
 * mim" (`personal`). A escolha troca o produto da prévia (Muriki Projects ou Muriki Focus) e o app
 * a manda no envio como `kind`; não mexe no plano. Com `personal`, o nome é o "do seu espaço" e o
 * botão diz "Criar meu espaço". Cada cartão tem o seu ícone: um grupo no time, uma pessoa no pessoal.
 *
 * A prévia mostra o @usuário só quando ele pode aparecer: o status vale para o valor da tela e é
 * livre, verificando ou não conferido. Ocupado, reservado ou com o formato errado, a frase sai sem
 * @ (a prévia não repete o que o campo já diz que não serve).
 *
 * O botão só liga com os três campos no formato, o @usuário e o endereço livres (`available`) ou
 * não conferidos (`unchecked`, a API confere no envio), cada status valendo para o valor da tela
 * (`statusFor`), e os termos aceitos. Sem `username`, o campo não aparece e o botão não conta com
 * ele; quem vem do Code e já tem @usuário usa o PlatformExistingAccount (`platform-onboarding`),
 * com o aviso da conta Muriki e o @ na prévia. O componente só junta os campos e
 * chama `onSubmit`: a ordem das chamadas (o aceite, o @usuário, o workspace) é do app, e o erro
 * que voltar chega por `error`.
 *
 * Layout: as mesmas peças do OnboardingStep (a barra do topo, o cabeçalho de passo e a ação), mas
 * medidas pela altura da janela, dentro da PlatformOnboardingFrame (a moldura que o convidar também
 * usa): a partir do `lg`, sem rolar de 1280×720 a 1920×1080, do mesmo lado do login, com o palco
 * azul e a WorkspacePreview da altura do conteúdo à esquerda e o formulário à direita. Abaixo do
 * `lg` o palco some e o passo é a coluna de formulário de sempre, que pode rolar.
 */
import { useId, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon, SpinnerGapIcon, UserIcon, UsersThreeIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { useTranslate } from "@/lib/i18n"

import { handleReady, handleStatus, workspaceNameIssue, type HandleStatus } from "./handles"
import { PlatformOnboardingFrame } from "./platform-onboarding-frame"
import { UsernameField, type UsernameFieldProps } from "./username-field"
import { WorkspaceForm, type WorkspaceFormProps } from "./workspace-form"
import { WorkspacePreview, type WorkspaceAudience } from "./workspace-preview"

// o espaço vertical entre os campos: 19px em 720 de altura, 28px de 1080 para cima
const ENTRE_CAMPOS = "gap-[clamp(1rem,2.6vh,1.75rem)]"

// o @ entra na prévia com estes estados: os que não dizem que o @ não serve
const MOSTRA_NA_PREVIA: HandleStatus[] = ["available", "checking", "unchecked"]

const ICONE_PUBLICO = { team: UsersThreeIcon, personal: UserIcon } as const

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
  workspace: Omit<WorkspaceFormProps, "disabled" | "className" | "audience">
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

  const statusUsuario = username && handleStatus("username", username.value, username.status, username.statusFor)
  const pessoal = audience.value === "personal"

  const pronto =
    (!statusUsuario || handleReady(statusUsuario)) &&
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
          username={statusUsuario && MOSTRA_NA_PREVIA.includes(statusUsuario) ? username?.value : undefined}
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
                    {/* no canto do cartão (o cartão é relative); acende com a escolha. No celular não cabe ao
                        lado do título e sai */}
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

        {username ? <UsernameField {...username} disabled={submitting} /> : null}

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

      {/* a ação do OnboardingStep: o Button com o loading do sistema, da largura dos campos */}
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
