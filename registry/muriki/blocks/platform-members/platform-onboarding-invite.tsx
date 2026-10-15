"use client"

/**
 * O passo de convidar do primeiro acesso do Platform (CA8), no desenho aprovado em 2026-10-12 (o
 * OnboardingConvidar do canvas): a mesma moldura do PlatformOnboardingIdentity
 * (PlatformOnboardingFrame), do lado do login.
 *
 * - À esquerda, o palco azul com a WorkspacePreview do time: você (com o seu papel) e as pessoas
 *   chegando, cada uma com o papel (só as linhas que vão no envio).
 * - À direita: o passo (3 de 3), "Chame o seu time", o InviteForm, o cartão de pessoas no plano
 *   (SeatsPreview, com `seats`), "Convidar N pessoas" (só os válidos) e "Pular por agora", que não
 *   exige nada.
 *
 * Sem uma equipe criada no passo anterior (PlatformOnboardingTeam), o app não mostra este passo. Quem cria o workspace é owner:
 * o papel de quem convida é `owner` por padrão, e as linhas nunca oferecem owner. O componente só
 * junta as linhas e chama `onSubmit` com as que vão; o envio e o erro (MEMBER_LIMIT_REACHED vira
 * `limit`, 409 ALREADY_MEMBER vira `rowErrors`) são do app.
 *
 * `limit` vem quando o plano limita: no workspace de empresa, o Free e o Pro vão até o mesmo número de
 * pessoas, e o cartão de pessoas mostra os mesmos lugares na régua; o teste é do Enterprise, sem
 * limite. O teste segue pelo `trialDays` e o `trialPlanName`, com ou sem `limit`.
 */
import type { ReactNode } from "react"
import { ArrowRightIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { PlatformOnboardingFrame } from "@/components/blocks/platform-identity/platform-onboarding-frame"
import { WorkspacePreview } from "@/components/blocks/platform-identity/workspace-preview"
import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"

import { InviteForm, SeatsPreview, type InviteRow, type SeatsPreviewProps } from "./invite-form"
import { inviteRowsToSend, type WorkspaceRole } from "./roles"

// o espaço entre os blocos encolhe com a altura da janela: 16px em 720, 32px de 900 para cima
const ENTRE_BLOCOS = "lg:gap-[clamp(1rem,calc(100vh-54.25rem),2rem)]"

export interface PlatformOnboardingInviteProps {
  workspaceName: string
  /** Quem convida: o nome (a inicial na régua) e o @usuário (a inicial na prévia). */
  viewer: { name: string; username?: string }
  /** O papel de quem convida. Padrão: `owner` (quem acabou de criar o workspace). */
  viewerRole?: WorkspaceRole
  rows: InviteRow[]
  onRowsChange: (rows: InviteRow[]) => void
  /** Recebe só as linhas válidas. */
  onSubmit: (rows: InviteRow[]) => void
  onSkip: () => void
  /**
   * O cartão de pessoas no plano. Sem isto, o cartão não aparece. `freeLimit` é o limite do plano,
   * lido do admin, `planName` o plano pago com limite ("Pro") e `trialPlanName` o plano de topo do
   * teste ("Enterprise"). Sem `trialDays`, o workspace nasceu no Free (o trial é um por pessoa).
   */
  seats?: Pick<SeatsPreviewProps, "freeLimit" | "planName" | "trialPlanName" | "trialDays">
  /** O limite do plano, quando ele limita: `used` = ativos + convites pendentes, da API. */
  limit?: { max: number; used: number }
  /** O erro da API em cada linha, pelo e-mail em minúsculas (ex.: 409 ALREADY_MEMBER). */
  rowErrors?: Record<string, ReactNode>
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app. */
  error?: ReactNode
  /** O passo no onboarding. Padrão: 3 de 3. */
  step?: number
  total?: number
  /** A marca, no canto de cima à esquerda. */
  brand?: ReactNode
  /** Idioma, tema e a conta, no canto de cima à direita. */
  utilities?: ReactNode
}

export function PlatformOnboardingInvite({
  workspaceName,
  viewer,
  viewerRole = "owner",
  rows,
  onRowsChange,
  onSubmit,
  onSkip,
  seats,
  limit,
  rowErrors,
  submitting = false,
  error,
  step = 3,
  total = 3,
  brand,
  utilities,
}: PlatformOnboardingInviteProps) {
  const t = useTranslate()
  // as linhas que vão no envio, com o papel saneado: as mesmas na prévia e no cartão de pessoas
  const validas = inviteRowsToSend(rows, viewerRole, rowErrors)

  return (
    <PlatformOnboardingFrame
      brand={brand}
      utilities={utilities}
      stage={
        <WorkspacePreview
          audience="team"
          workspaceName={workspaceName}
          username={viewer.username}
          youRole={t(`platform.members.role.${viewerRole}`)}
          people={validas.map((r) => ({ id: r.email, name: r.email.split("@")[0], role: t(`platform.members.role.${r.role}`) }))}
          className="max-h-full w-full max-w-[54rem]"
        />
      }
    >
      <div className={`flex flex-col gap-9 ${ENTRE_BLOCOS}`}>
        <OnboardingStepHeader
          step={step}
          total={total}
          stepperLabel={t("platform.identity.stepper", { step, total })}
          stepperAriaLabel={t("platform.identity.stepper_aria", { step, total })}
          title={t("platform.members.onboarding.title")}
          subtitle={t("platform.members.onboarding.subtitle")}
        />

        <InviteForm
          rows={rows}
          onRowsChange={onRowsChange}
          viewerRole={viewerRole}
          onSubmit={onSubmit}
          limit={limit}
          rowErrors={rowErrors}
          submitting={submitting}
          error={error}
          // a lista acompanha a altura da janela (128px em 720, 240px de 832 para cima) e rola por dentro
          listClassName="max-h-60 lg:max-h-[clamp(6rem,calc(100vh-37rem),15rem)]"
          footer={({ count, disabled }) => (
            <div className={`flex flex-col gap-9 pt-1 ${ENTRE_BLOCOS}`}>
              {seats ? (
                <SeatsPreview
                  workspaceName={workspaceName}
                  people={[{ name: viewer.name }, ...validas.map((r) => ({ name: r.email }))]}
                  {...seats}
                />
              ) : null}
              <div className="flex flex-col gap-1">
                <Button
                  className="w-full"
                  type="submit"
                  variant="solid"
                  size="touch"
                  loading={submitting}
                  disabled={disabled}
                >
                  <span>{t("platform.members.invite.submit", { count })}</span>
                  {submitting ? null : <ArrowRightIcon aria-hidden className="size-3.5" />}
                </Button>
                <Button type="button" variant="ghost" className="h-9 w-full text-muted-foreground" onClick={onSkip} disabled={submitting}>
                  {t("platform.members.onboarding.skip")}
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    </PlatformOnboardingFrame>
  )
}
