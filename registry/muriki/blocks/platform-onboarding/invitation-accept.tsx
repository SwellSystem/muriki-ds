"use client"

/**
 * O aceite de convite do Platform (CA17), as telas Convite, ConviteLogado e ConviteInvalido do
 * canvas, na moldura do primeiro acesso (PlatformOnboardingFrame), do lado do login.
 *
 * O app lê o token do fragmento do link (`/invite#token=…`), chama `POST /platform/invitations/preview`
 * e passa a resposta em `invitation`: `{ workspace: { name }, role, email, invitedBy: { name } }`,
 * com o e-mail já mascarado pela API e só o nome de exibição de quem convidou. O token nunca entra
 * aqui: a tela não o mostra, não o põe em link e não o guarda.
 *
 * Quatro estados (`state`):
 * - `loading`: enquanto o preview não volta, um esqueleto no lugar do formulário e o palco da marca;
 * - `signed-out`: "Entrar" (`onSignIn`) e "Criar conta" (`onSignUp`), com o aviso de que o aceite
 *   é só da conta daquele e-mail;
 * - `signed-in`: "Aceitar convite" (`onAccept`), com `accepting` e o `error` do app
 *   (409 MEMBER_LIMIT_REACHED, ALREADY_MEMBER…, já traduzidos);
 * - `invalid`: o 422 INVITATION_INVALID uniforme. Vencido, usado, revogado, substituído ou de outra
 *   conta dão a mesma tela, sem o motivo, com "Entrar no Muriki Platform" (`onSignIn`). Sem
 *   `invitation` (fora do `loading`), a tela também é esta. Quando a tela vira esta, o título
 *   recebe o foco, para o leitor de tela anunciar a troca.
 *
 * O palco mostra a janela do workspace com o lugar esperando ("Um lugar no time está esperando por
 * você."); no inválido, as janelas dos dois produtos em esqueleto. Sem o nome de quem convidou
 * (a API manda `''` quando não acha a conta), o título diz só o workspace.
 */
import { useEffect, useRef, type ReactNode, type Ref } from "react"
import { ArrowRightIcon, ClockIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { PlatformOnboardingFrame } from "@/components/blocks/platform-identity/platform-onboarding-frame"
import { WorkspacePreview } from "@/components/blocks/platform-identity/workspace-preview"
import type { WorkspaceRole } from "@/components/blocks/platform-members/roles"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MurikiI18nProvider, useTranslate, type TranslateFn } from "@/lib/i18n"

import { PlatformBrandStage } from "./brand-stage"

export type PlatformInvitationState = "loading" | "signed-out" | "signed-in" | "invalid"

/** A resposta de `POST /platform/invitations/preview`, como vem da API. */
export interface PlatformInvitationPreview {
  workspace: { name: string }
  role: WorkspaceRole
  /** Já mascarado pela API (ex.: `r•••@moura.dev`). */
  email: string
  /** Só o nome de exibição; `''` quando a API não acha a conta. */
  invitedBy: { name: string }
}

export interface PlatformInvitationAcceptProps {
  state: PlatformInvitationState
  /** A prévia do convite. Obrigatória em `signed-out` e `signed-in`; sem ela, a tela é a do convite indisponível. */
  invitation?: PlatformInvitationPreview
  /** "Entrar" (sem sessão) e "Entrar no Muriki Platform" (inválido). */
  onSignIn?: () => void
  /** "Criar conta" (sem sessão). */
  onSignUp?: () => void
  /** "Aceitar convite" (com sessão). */
  onAccept?: () => void
  /** O aceite está saindo. */
  accepting?: boolean
  /** O erro do aceite, já traduzido pelo app. */
  error?: ReactNode
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

// o cabeçalho das telas de convite, sem contador de passos: o título é um degrau menor que o dos passos
// (40px, como no canvas), porque leva dois nomes e quebra em várias linhas. O `!` vence o tamanho que
// a moldura dá a todo h1 a partir do `lg`
// O `titleRef` é o do inválido: o título recebe o foco (`tabIndex={-1}`) quando a tela vira esta
function Cabecalho({ title, subtitle, titleRef }: { title: string; subtitle: ReactNode; titleRef?: Ref<HTMLHeadingElement> }) {
  return (
    <header className="flex flex-col gap-3">
      <h1
        ref={titleRef}
        tabIndex={titleRef ? -1 : undefined}
        className="text-[clamp(2rem,8vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-foreground-strong outline-none lg:text-[2.5rem]!"
      >
        {title}
      </h1>
      <p className="text-base leading-6 text-pretty text-muted-foreground">{subtitle}</p>
    </header>
  )
}

export function PlatformInvitationAccept({
  state,
  invitation,
  onSignIn,
  onSignUp,
  onAccept,
  accepting = false,
  error,
  brand,
  utilities,
}: PlatformInvitationAcceptProps) {
  const t = useTranslate()
  const invalido = state === "invalid" || (state !== "loading" && !invitation)

  // quando a tela vira a do inválido (do `loading` ou de um aceite que voltou 422), o título recebe o
  // foco para o leitor de tela anunciar a troca; numa tela que já nasce inválida, o foco fica onde está
  const tituloInvalido = useRef<HTMLHeadingElement>(null)
  const eraInvalido = useRef(invalido)
  useEffect(() => {
    if (invalido && !eraInvalido.current) tituloInvalido.current?.focus()
    eraInvalido.current = invalido
  }, [invalido])

  if (state === "loading") {
    return (
      <PlatformOnboardingFrame brand={brand} utilities={utilities} stage={<PlatformBrandStage />}>
        <div
          role="status"
          aria-label={t("platform.onboarding.invitation.loading")}
          className="flex flex-col gap-7"
          data-slot="platform-invitation-accept"
          data-state="loading"
        >
          {/* a anatomia do convite: o título em duas linhas, a frase, o cartão do papel e do e-mail e os botões */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-[88%] rounded-[10px]" />
            <Skeleton className="h-9 w-[56%] rounded-[10px]" />
            <Skeleton className="mt-2 h-4 w-[44%]" />
          </div>
          <Skeleton className="h-[98px] w-full rounded-[12px]" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-[82%]" />
            <div className="grid grid-cols-2 gap-2.5">
              <Skeleton className="h-11 rounded-[11px]" />
              <Skeleton className="h-11 rounded-[11px]" />
            </div>
          </div>
        </div>
      </PlatformOnboardingFrame>
    )
  }

  if (invalido || !invitation) {
    return (
      <PlatformOnboardingFrame brand={brand} utilities={utilities} stage={<PlatformBrandStage />}>
        <div className="flex flex-col gap-7" data-slot="platform-invitation-accept" data-state="invalid">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]">
            <EnvelopeSimpleIcon aria-hidden className="size-[26px]" />
          </span>
          <Cabecalho
            titleRef={tituloInvalido}
            title={t("platform.onboarding.invitation.invalid_title")}
            subtitle={t("platform.onboarding.invitation.invalid_text")}
          />
          <Button className="w-full" variant="solid" size="touch" onClick={onSignIn}>
            <span>{t("platform.onboarding.invitation.invalid_action")}</span>
            <ArrowRightIcon aria-hidden className="size-3.5" />
          </Button>
        </div>
      </PlatformOnboardingFrame>
    )
  }

  const papel = t(`platform.members.role.${invitation.role}`)
  const quem = invitation.invitedBy.name.trim()
  const titulo = quem
    ? t("platform.onboarding.invitation.title", { name: quem, workspace: invitation.workspace.name })
    : t("platform.onboarding.invitation.title_anonymous", { workspace: invitation.workspace.name })
  const email = <span className="font-mono text-[13px] text-foreground-strong">{invitation.email}</span>

  // a prévia fala do lugar esperando, não do workspace nascendo: a frase do time vira a do convite
  const tPalco: TranslateFn = (key, params) =>
    key === "platform.identity.preview.team" || key === "platform.identity.preview.team_user"
      ? t("platform.onboarding.invitation.preview")
      : t(key, params)

  return (
    <PlatformOnboardingFrame
      brand={brand}
      utilities={utilities}
      stage={
        <MurikiI18nProvider t={tPalco}>
          {/* o `username` só acende o lugar de quem convidou; a frase é a do convite */}
          <WorkspacePreview
            audience="team"
            workspaceName={invitation.workspace.name}
            username={quem || invitation.workspace.name}
            className="max-h-full w-full max-w-[54rem]"
          />
        </MurikiI18nProvider>
      }
    >
      <div className="flex flex-col gap-7" data-slot="platform-invitation-accept" data-state={state}>
        <Cabecalho
          title={titulo}
          subtitle={
            <>
              {t("platform.onboarding.invitation.subtitle")} <b className="font-medium text-foreground-strong">{papel}</b>.
            </>
          }
        />

        <dl className="flex flex-col rounded-[12px] bg-card shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-[13px] text-muted-foreground">{t("platform.onboarding.invitation.role")}</dt>
            <dd className="text-sm font-medium text-foreground-strong">{papel}</dd>
          </div>
          <span aria-hidden className="mx-4 h-px bg-foreground/8" />
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-[13px] text-muted-foreground">{t("platform.onboarding.invitation.sent_to")}</dt>
            <dd className="min-w-0 truncate">{email}</dd>
          </div>
        </dl>

        {state === "signed-in" ? (
          <div className="flex flex-col gap-3">
            <Button className="w-full" variant="solid" size="touch" loading={accepting} onClick={onAccept}>
              <span>{t("platform.onboarding.invitation.accept")}</span>
              {accepting ? null : <ArrowRightIcon aria-hidden className="size-3.5" />}
            </Button>
            {error ? (
              <p role="alert" className="text-[13px] leading-[19px] text-destructive">
                {error}
              </p>
            ) : (
              <p className="text-[13px] leading-[19px] text-muted-foreground">{t("platform.onboarding.invitation.accept_note")}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-[21px] text-muted-foreground">
              {t("platform.onboarding.invitation.signed_out_prefix")} {email} {t("platform.onboarding.invitation.signed_out_suffix")}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="solid" size="touch" onClick={onSignIn}>
                {t("platform.onboarding.invitation.sign_in")}
              </Button>
              <Button variant="outline" size="touch" onClick={onSignUp}>
                {t("platform.onboarding.invitation.sign_up")}
              </Button>
            </div>
          </div>
        )}

        <p className="flex items-center gap-2 text-[13px] leading-[19px] text-muted-foreground">
          <ClockIcon aria-hidden className="size-3.5 shrink-0" />
          {t("platform.onboarding.invitation.validity")}
        </p>
      </div>
    </PlatformOnboardingFrame>
  )
}
