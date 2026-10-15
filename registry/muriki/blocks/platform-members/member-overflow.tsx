"use client"

/**
 * A carência de pessoas acima do limite do plano (o B9b da API). Quando o plano do workspace passa a
 * um limite menor que os membros ativos, abre um prazo de 7 dias; no fim, quem passa do limite fica
 * suspenso (sem acesso, sem assento, continua listado) e volta sozinho quando abre vaga.
 *
 * - MemberOverflowNotice: o aviso da página de membros enquanto a carência está aberta (`overflow` do
 *   GET /platform/workspaces/:id, que todo membro recebe): quantas pessoas passam do limite e o prazo;
 *   para o owner, "Escolher quem fica".
 * - MemberPriorityDialog: o owner escolhe quem tem prioridade para ficar. Os owners aparecem fixos
 *   (ficam sempre), os outros ativos numa lista de marcar, com o contador "3 de 5 lugares" e, em cada
 *   linha, a prévia do fim do prazo (`membersStaying`): quem fica pela antiguidade e quem fica suspenso.
 *
 * Só mostra: o PUT …/members/active, a lista inteira de membros e a escolha anterior são do app, e a
 * API confere de novo (403 FORBIDDEN para quem não é owner, 404 MEMBER_OVERFLOW_NOT_FOUND com a carência
 * fechada, 422 ACTIVE_MEMBERS_INVALID).
 */
import { UsersThreeIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatShortDate } from "@/lib/date-format"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { memberInitials, type WorkspaceMember } from "./members-table"
import {
  membersStaying,
  overflowExcess,
  priorityCandidates,
  priorityCount,
  priorityMemberIds,
  togglePriority,
  type MemberOverflow,
} from "./overflow"
import type { WorkspaceRole } from "./roles"

// a data do prazo; inválida, o trecho some
function prazoDe(dueAt: string | undefined, locale: string): string | null {
  if (!dueAt) return null
  const d = new Date(dueAt)
  return Number.isFinite(d.getTime()) ? formatShortDate(d, locale) : null
}

// ── O aviso ─────────────────────────────────────────────────────────────

export interface MemberOverflowNoticeProps {
  /** A carência aberta (`workspace.overflow`); com `null` o aviso não aparece. */
  overflow: MemberOverflow | null
  /** O papel de quem vê: só o owner escolhe, e o texto muda para os outros. */
  viewerRole: WorkspaceRole
  /** "Escolher quem fica", só para o owner: o app abre o MemberPriorityDialog. */
  onChoosePriority?: () => void
  /** O idioma da data, ex.: `pt-BR`. */
  locale: string
  className?: string
}

export function MemberOverflowNotice({ overflow, viewerRole, onChoosePriority, locale, className }: MemberOverflowNoticeProps) {
  const t = useTranslate()
  if (!overflow) return null
  const k = "platform.members.overflow.notice"
  const excesso = overflowExcess(overflow)
  const prazo = prazoDe(overflow.dueAt, locale)
  const owner = viewerRole === "owner"
  const texto = t(`${k}.${owner ? "owner" : "member"}${prazo ? "" : "_no_date"}`, { date: prazo ?? "", limit: overflow.limit })

  return (
    <section
      role="status"
      data-slot="member-overflow-notice"
      className={cn(
        "flex flex-col gap-3 rounded-[14px] bg-tone-yellow py-4 pr-[18px] pl-5 sm:flex-row sm:items-center sm:gap-4",
        "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--tone-yellow-foreground)_22%,transparent)]",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <UsersThreeIcon aria-hidden className="mt-px size-5 shrink-0 text-tone-yellow-foreground" />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[14.5px] leading-5 font-semibold text-foreground-strong">
            {t(`${k}.title`, { count: excesso, limit: overflow.limit })}
          </span>
          <span className="text-[13.5px] leading-[19px] text-foreground">{texto}</span>
        </div>
      </div>
      {owner && onChoosePriority ? (
        <Button variant="outline" size="lg" className="shrink-0 self-start sm:self-center" onClick={onChoosePriority}>
          {t("platform.members.overflow.choose")}
        </Button>
      ) : null}
    </section>
  )
}

// ── A escolha ───────────────────────────────────────────────────────────

export interface MemberPriorityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * TODOS os membros do workspace (todas as páginas do GET …/members): a lista leva todo owner ativo,
   * e faltando um a API responde 422. Os suspensos são ignorados.
   */
  members: WorkspaceMember[]
  /** O limite do plano (`overflow.limit`). */
  limit: number
  /** O fim do prazo (`overflow.dueAt`), na descrição. */
  dueAt?: string
  /**
   * Os ids marcados (só não owners). Controlado: o app abre com
   * `initialPrioritySelection(billing.overflow.chosenMemberIds, members)`.
   */
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  /** Recebe o corpo do PUT …/members/active: os owners e os marcados (`priorityMemberIds`). */
  onConfirm: (memberIds: string[]) => void
  /** O PUT em curso: o botão gira e a lista trava. */
  pending?: boolean
  /** O erro da API, já traduzido (ex.: 422 ACTIVE_MEMBERS_INVALID). */
  error?: string
  /** Quem vê: a linha dele leva "você". */
  viewerId?: string
  /** O idioma da data, ex.: `pt-BR`. */
  locale: string
}

export function MemberPriorityDialog({
  open,
  onOpenChange,
  members,
  limit,
  dueAt,
  selected,
  onSelectedChange,
  onConfirm,
  pending = false,
  error,
  viewerId,
  locale,
}: MemberPriorityDialogProps) {
  const t = useTranslate()
  const k = "platform.members.overflow.picker"
  const { owners, candidates } = priorityCandidates(members)
  const marcados = new Set(selected.filter((id) => candidates.some((c) => c.id === id)))
  const conta = priorityCount(limit, owners.length, marcados.size)
  const ficam = membersStaying(members, [...marcados], limit)
  const prazo = prazoDe(dueAt, locale)
  const papel = (r: WorkspaceRole) => t(`platform.members.role.${r}`)

  const pessoa = (m: WorkspaceMember) => (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]"
      >
        {memberInitials(m.name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13.5px] font-medium text-foreground-strong">{m.name}</span>
          {m.id === viewerId ? (
            <Badge size="sm" variant="outline">
              {t("platform.members.table.you")}
            </Badge>
          ) : null}
        </span>
        <span className="truncate text-[12px] text-muted-foreground">
          {m.username ? `@${m.username} · ` : ""}
          {papel(m.role)}
        </span>
      </span>
    </span>
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent anatomy="framed" className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t(`${k}.title`)}</DialogTitle>
          <DialogDescription>{prazo ? t(`${k}.description`, { date: prazo }) : t(`${k}.description_no_date`)}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
            <span className="text-[13px] font-medium text-foreground-strong tabular-nums" aria-live="polite">
              {t(`${k}.count`, { used: conta.used, limit })}
            </span>
            {conta.places === 0 ? (
              <span className="text-[12.5px] text-muted-foreground">{t(`${k}.owners_full`)}</span>
            ) : null}
          </div>
          <ul aria-label={t(`${k}.owners_label`)} className="m-0 flex list-none flex-col px-5 py-1">
            {owners.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2">
                <Checkbox checked disabled aria-label={t(`${k}.owner_fixed`, { name: m.name })} />
                {pessoa(m)}
                <span className="shrink-0 text-[12px] text-muted-foreground">{t(`${k}.always`)}</span>
              </li>
            ))}
          </ul>
          <ul
            aria-label={t(`${k}.candidates_label`)}
            className="m-0 flex list-none flex-col px-5 pt-1 pb-3 shadow-[inset_0_1px_0_var(--divider)]"
          >
            {candidates.map((m) => {
              const marcado = marcados.has(m.id)
              const desligado = pending || (!marcado && conta.full)
              const fica = ficam.has(m.id)
              return (
                <li key={m.id}>
                  <label className={cn("flex items-center gap-3 py-2", desligado ? "cursor-not-allowed" : "cursor-pointer")}>
                    <Checkbox
                      checked={marcado}
                      disabled={desligado}
                      onCheckedChange={() => onSelectedChange(togglePriority([...marcados], m.id))}
                    />
                    {pessoa(m)}
                    {marcado ? null : fica ? (
                      <span className="shrink-0 text-[12px] text-muted-foreground">{t(`${k}.stays_by_seniority`)}</span>
                    ) : (
                      <Badge size="sm" tone="orange" dot className="shrink-0">
                        {t(`${k}.will_be_suspended`)}
                      </Badge>
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        </DialogBody>
        <div className="flex flex-col gap-1.5 px-5 pb-3 empty:hidden">
          {conta.over ? (
            <p role="alert" className="m-0 text-[13px] leading-[18px] text-destructive">
              {t(`${k}.over`, { count: conta.places })}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="m-0 text-[13px] leading-[18px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={pending}>
            {t(`${k}.cancel`)}
          </Button>
          <Button
            type="button"
            variant="solid"
            size="lg"
            loading={pending}
            disabled={conta.over}
            onClick={() => !pending && !conta.over && onConfirm(priorityMemberIds(members, [...marcados]))}
          >
            {t(`${k}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
