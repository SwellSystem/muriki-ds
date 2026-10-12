"use client"

/**
 * O passo do convidado (CA19), o OnboardingConvidado do canvas: quem chegou por um convite e ainda
 * não tem o onboarding do Platform ou o @usuário escolhe o @ e aceita os termos, e entra no
 * workspace. Não cria workspace, não pede CPF nem plano: é a tela curta que vem antes do aceite,
 * quando a API pede o onboarding (403 ONBOARDING_REQUIRED) ou o @ (409 USERNAME_REQUIRED).
 *
 * Montado com as peças do primeiro acesso (a moldura, o cabeçalho de passo, o UsernameField e o
 * aceite dos termos do PlatformOnboardingIdentity) e com o palco do convite (a janela do workspace
 * com o lugar esperando, como no PlatformInvitationAccept). Com o @ livre para o valor da tela, a
 * frase do palco diz "esperando por @usuario"; fora disso, "esperando por você".
 *
 * O botão só liga com o @ no formato (F1), livre (`available`) ou não conferido (`unchecked`, a API
 * confere no envio), valendo para o valor da tela (`statusFor`), e os termos aceitos: a mesma regra
 * do PlatformOnboardingIdentity. O componente só chama `onSubmit`: a ordem das chamadas (o
 * `complete`, o `PUT /account/username` e o aceite do convite) é do app, e o erro que voltar chega
 * por `error`. O token do convite nunca entra aqui.
 *
 * Quem já tem o @ (a conta do Code) não escolhe outro: com `existingUsername`, o campo some, o @ entra
 * na frase do palco e no subtítulo, o título vira "aceite os termos" e o botão só depende dos termos.
 *
 * O passo padrão é 1 de 1; depois do código por e-mail, o app passa 2 de 2.
 */
import { useId, type FormEvent, type ReactNode } from "react"
import { ArrowRightIcon, SpinnerGapIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { handleReady, handleStatus } from "@/components/blocks/platform-identity/handles"
import { PlatformOnboardingFrame } from "@/components/blocks/platform-identity/platform-onboarding-frame"
import type { PlatformOnboardingTerms } from "@/components/blocks/platform-identity/platform-onboarding-identity"
import { UsernameField, type UsernameFieldProps } from "@/components/blocks/platform-identity/username-field"
import { WorkspacePreview } from "@/components/blocks/platform-identity/workspace-preview"
import type { WorkspaceRole } from "@/components/blocks/platform-members/roles"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { MurikiI18nProvider, useTranslate, type TranslateFn } from "@/lib/i18n"

// o mesmo espaço entre os campos do PlatformOnboardingIdentity
const ENTRE_CAMPOS = "gap-[clamp(1rem,2.6vh,1.75rem)]"

export interface PlatformInviteeIdentityProps {
  /** O workspace do convite, da prévia (`POST /platform/invitations/preview`). */
  workspaceName: string
  /** O papel do convite. */
  role: WorkspaceRole
  /** Quem convidou, só o nome de exibição (`''` quando a API não acha a conta). Acende o lugar dele no palco. */
  invitedBy?: { name: string }
  /**
   * O campo do @, para quem ainda não tem um. Passe este ou `existingUsername`; sem nenhum dos dois o
   * componente lança um erro. Com os dois, vale `existingUsername` e este é ignorado.
   */
  username?: Pick<UsernameFieldProps, "value" | "onChange" | "status" | "statusFor">
  /**
   * O @ que a conta já tem (`GET /account/username`, a conta do Code), sem o "@". Tem precedência
   * sobre `username`: o campo não aparece, o @ vai para o palco e o subtítulo, e o botão só depende
   * dos termos. O app não chama o `PUT /account/username` nesse caso.
   */
  existingUsername?: string
  terms: PlatformOnboardingTerms
  onSubmit: () => void
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app. */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 1 de 1; depois do código por e-mail, 2 de 2. */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformInviteeIdentity({
  workspaceName,
  role,
  invitedBy,
  username,
  existingUsername,
  terms,
  onSubmit,
  submitting = false,
  error,
  step = 1,
  total = 1,
  brand,
  utilities,
}: PlatformInviteeIdentityProps) {
  const t = useTranslate()
  const formId = useId()

  if (existingUsername === undefined && !username) {
    throw new Error("PlatformInviteeIdentity: passe `username` ou `existingUsername`")
  }
  // com o @ da conta, o campo some e o botão só depende dos termos
  const campo = existingUsername === undefined ? username : undefined
  const statusUsuario = campo ? handleStatus("username", campo.value, campo.status, campo.statusFor) : undefined
  // o @ que vai para o palco: o da conta, ou o da tela quando está livre
  const arroba = existingUsername ?? (statusUsuario === "available" ? campo?.value : undefined)
  const pronto = (statusUsuario === undefined || handleReady(statusUsuario)) && terms.checked

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (pronto && !submitting) onSubmit()
  }

  const link = (href: string, texto: string) => (
    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-2 hover:underline">
      {texto}
    </a>
  )

  const papel = t(`platform.members.role.${role}`)

  // o palco é o do convite: a frase do time vira a do lugar esperando, com o @ só quando ele é da
  // conta ou está livre. O `username` da prévia só acende o lugar no time (o @, ou quem convidou),
  // por isso a frase é escolhida aqui e não pela chave que a prévia pede
  const tPalco: TranslateFn = (key, params) =>
    key === "platform.identity.preview.team" || key === "platform.identity.preview.team_user"
      ? arroba
        ? t("platform.onboarding.invitee.preview", { username: `@${arroba}` })
        : t("platform.onboarding.invitation.preview")
      : t(key, params)
  const lugar = arroba || invitedBy?.name.trim() || workspaceName

  return (
    <PlatformOnboardingFrame
      brand={brand}
      utilities={utilities}
      stage={
        <MurikiI18nProvider t={tPalco}>
          <WorkspacePreview
            audience="team"
            workspaceName={workspaceName}
            username={lugar}
            className="max-h-full w-full max-w-[54rem]"
          />
        </MurikiI18nProvider>
      }
    >
      <OnboardingStepHeader
        step={step}
        total={total}
        stepperLabel={t("platform.identity.stepper", { step, total })}
        stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
        title={t(existingUsername === undefined ? "platform.onboarding.invitee.title" : "platform.onboarding.invitee.title_existing")}
        subtitle={
          <>
            {t("platform.onboarding.invitee.subtitle_prefix")}{" "}
            <b className="font-medium text-foreground-strong">{workspaceName}</b>{" "}
            {t("platform.onboarding.invitee.subtitle_role")} <b className="font-medium text-foreground-strong">{papel}</b>
            {existingUsername === undefined ? null : (
              <>
                , {t("platform.onboarding.invitee.subtitle_existing")}{" "}
                <b className="font-medium text-foreground-strong">@{existingUsername}</b>
              </>
            )}
            .
          </>
        }
      />

      <form
        id={formId}
        onSubmit={enviar}
        noValidate
        data-slot="platform-invitee-identity"
        className={`flex flex-col ${ENTRE_CAMPOS}`}
      >
        {campo ? <UsernameField {...campo} disabled={submitting} /> : null}

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
          {/* o nome do workspace pode ser longo: corta na linha do botão */}
          <span className="min-w-0 truncate">{t("platform.onboarding.invitee.submit", { workspace: workspaceName })}</span>
          {submitting ? (
            <SpinnerGapIcon aria-hidden className="size-4 shrink-0 animate-spin" />
          ) : (
            <ArrowRightIcon aria-hidden className="size-3.5 shrink-0" />
          )}
        </Button>
      </div>
    </PlatformOnboardingFrame>
  )
}
