"use client"

/**
 * Os convites do workspace (CA7), sobre a ResourceTable: o e-mail convidado, o papel, o estado,
 * quem convidou e quando foi enviado.
 *
 * Os estados são os quatro da API e o "venceu" (F7): vencido é um `pending` com `expiresAt` no
 * passado, nunca um estado à parte (`invitationState`). O pendente diz quando vence; o vencido,
 * quando venceu, em dias de calendário no fuso local ("vence hoje", "vence em 3 dias", "venceu há
 * 1 dia"; `calendarDaysFrom`). "Reenviar" (o ícone) e "Revogar" (no "…", destrutiva) só aparecem
 * no pendente, vencido ou não, e só para quem gere o papel do convite (`viewerRole`, F6: o owner
 * todos; a maintainer só os de member e guest; member e guest, nenhum); reenviar substitui o
 * convite, e o antigo volta da API como `superseded`. Aceito, revogado e substituído não têm ação,
 * e os dois últimos ficam apagados.
 *
 * A lista vem paginada por cursor da API: `pagination` vai direto para a ResourceTable.
 *
 * O e-mail convidado só aparece para quem gere o workspace (owner e maintainer): quem decide é o
 * app, que nem monta a tabela para os outros. O token do convite nunca passa por aqui.
 *
 * `now` fixa o relógio (o canvas, os testes); sem ele, vale a hora em que a tabela montou.
 */
import { useState } from "react"
import { ArrowClockwiseIcon, ProhibitIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { ResourceTable } from "@/components/blocks/resource-table/resource-table"
import type { ResourceColumn, ResourcePagination, RowAction } from "@/components/blocks/resource-table/types"
import { Badge } from "@/components/ui/badge"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { useTranslate } from "@/lib/i18n"

import {
  calendarDaysFrom,
  formatCalendarDays,
  invitationActions,
  invitationState,
  type InvitationState,
  type InvitationStatus,
  type WorkspaceRole,
} from "./roles"

export interface WorkspaceInvitation {
  id: string
  email: string
  role: WorkspaceRole
  status: InvitationStatus
  /** ISO 8601. */
  invitedAt: string
  /** ISO 8601. Passou e o status é `pending`: venceu. */
  expiresAt: string
  invitedBy: { username: string; name: string }
}

export interface InvitationsTableProps {
  invitations: WorkspaceInvitation[]
  /** O papel de quem vê: decide em quais convites Reenviar e Revogar aparecem (F6). */
  viewerRole: WorkspaceRole
  onResend: (id: string) => void
  onRevoke: (id: string) => void
  /** O relógio, em ms ou Date. Sem ele, a hora em que a tabela montou. */
  now?: number | Date
  /** O idioma das datas, ex.: `pt-BR`. */
  locale: string
  /** O convite que está sendo reenviado: o ícone vira spinner. */
  resendingId?: string
  /** A paginação por cursor da API (GET …/invitations), repassada à ResourceTable. */
  pagination?: ResourcePagination
  loading?: boolean
  className?: string
}

const TOM: Record<InvitationState, BadgeTone> = {
  pending: "blue",
  expired: "orange",
  accepted: "green",
  revoked: "gray",
  superseded: "gray",
}

export function InvitationsTable({
  invitations,
  viewerRole,
  onResend,
  onRevoke,
  now,
  locale,
  resendingId,
  pagination,
  loading,
  className,
}: InvitationsTableProps) {
  const t = useTranslate()
  // o relógio de quando montou: ler a hora a cada render deixaria a renderização impura
  const [montou] = useState(() => Date.now())
  const agora = now === undefined ? montou : new Date(now).getTime()
  const data = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })
  const estado = (c: WorkspaceInvitation) => invitationState(c, agora)
  // o prazo em dias de calendário no fuso local: no mesmo dia, "vence hoje" / "venceu hoje"; fora
  // dele, sempre com número ("em 1 dia", "há 3 dias"), nunca o "amanhã" do numeric: "auto"
  const prazoDe = (c: WorkspaceInvitation, vencido: boolean) => {
    const dias = calendarDaysFrom(c.expiresAt, agora)
    if (dias === 0) return t(vencido ? "platform.members.invitations.expired_today" : "platform.members.invitations.expires_today")
    const when = formatCalendarDays(dias, locale)
    return t(vencido ? "platform.members.invitations.expired_at" : "platform.members.invitations.expires", { when })
  }

  const columns: ResourceColumn<WorkspaceInvitation>[] = [
    {
      id: "email",
      header: t("platform.members.invitations.email"),
      mobile: "title",
      cell: (c) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-input text-[11px] font-semibold text-muted-foreground uppercase"
          >
            {c.email[0]}
          </span>
          <span className="truncate font-medium text-foreground-strong">{c.email}</span>
        </div>
      ),
    },
    {
      id: "role",
      header: t("platform.members.invitations.role"),
      width: "120px",
      mobile: "meta",
      cell: (c) => t(`platform.members.role.${c.role}`),
    },
    {
      id: "status",
      header: t("platform.members.invitations.status_label"),
      width: "220px",
      mobile: "status",
      cell: (c) => {
        const e = estado(c)
        const prazo = e === "pending" || e === "expired" ? prazoDe(c, e === "expired") : null
        return (
          <span className="flex min-w-0 items-center gap-2">
            <Badge tone={TOM[e]} dot>
              {t(`platform.members.invitations.status.${e}`)}
            </Badge>
            {prazo ? <span className="truncate text-[12px] text-muted-foreground max-md:hidden">{prazo}</span> : null}
          </span>
        )
      },
    },
    {
      id: "invited_by",
      header: t("platform.members.invitations.invited_by"),
      width: "160px",
      hideBelow: "lg",
      mobile: "meta",
      cell: (c) => <span className="truncate">{c.invitedBy.name}</span>,
    },
    {
      id: "sent",
      header: t("platform.members.invitations.sent"),
      width: "152px",
      mobile: "meta",
      cell: (c) => <span className="text-muted-foreground tabular-nums">{data.format(new Date(c.invitedAt))}</span>,
    },
  ]

  function rowActions(c: WorkspaceInvitation): RowAction[] {
    const acoes = invitationActions(estado(c), { viewerRole, invitationRole: c.role })
    const lista: RowAction[] = []
    if (acoes.resend) {
      lista.push({
        id: "resend",
        label: t("platform.members.invitations.resend"),
        icon: ArrowClockwiseIcon,
        loading: resendingId === c.id,
        onSelect: () => onResend(c.id),
      })
    }
    if (acoes.revoke) {
      lista.push({
        id: "revoke",
        label: t("platform.members.invitations.revoke"),
        icon: ProhibitIcon,
        destructive: true,
        onSelect: () => onRevoke(c.id),
      })
    }
    return lista
  }

  return (
    <ResourceTable
      label={t("platform.members.invitations.label")}
      columns={columns}
      rows={invitations}
      getRowId={(c) => c.id}
      rowActions={rowActions}
      inlineActions={1}
      isRowMuted={(c) => c.status === "revoked" || c.status === "superseded"}
      loading={loading}
      skeletonRows={pagination?.pageSize ?? (invitations.length || 5)}
      pagination={pagination}
      empty={
        <div className="mx-auto flex max-w-sm flex-col gap-1">
          <p className="text-sm font-medium text-foreground-strong">{t("platform.members.invitations.empty_title")}</p>
          <p className="text-[13px] text-muted-foreground">{t("platform.members.invitations.empty_hint")}</p>
        </div>
      }
      className={className}
    />
  )
}
