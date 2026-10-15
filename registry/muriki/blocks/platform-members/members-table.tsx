"use client"

/**
 * Os membros do workspace (CA6), sobre a ResourceTable: a pessoa (as iniciais, o nome e o
 * @usuário), o papel e a data de entrada. No celular, a ResourceTable vira cartões.
 *
 * O que cada linha mostra sai de `memberActions` (F6), pelo papel de quem vê (`viewer.role`) e o da
 * linha:
 * - quem gere o papel da linha troca o papel por um select, limitado às opções de F6; quem não
 *   gere vê o papel como selo;
 * - "Remover do workspace" e, na própria linha, "Sair do workspace" ficam no "…" (destrutivas);
 * - a ação que o papel não permite não aparece. O último owner é a exceção: "Sair" aparece
 *   desligado, e o rótulo diz o motivo e o que fazer.
 *
 * O componente só mostra: quem autoriza é a API (403, 409 LAST_OWNER, 409 CONFLICT, 404), e o erro
 * dela volta pelo app. O e-mail não aparece (a API ainda não manda nos membros).
 *
 * A lista vem paginada por cursor da API: `pagination` vai direto para a ResourceTable, e o
 * `ownerCount` é o total de owners do workspace, da API, nunca contado na página. Trocar o papel e
 * remover devolvem o membro inteiro: o app manda o `version` dele no PATCH e no DELETE.
 *
 * O membro suspenso (B9b: passou do limite do plano no fim da carência) continua na lista, com o selo
 * "Suspenso" e a linha apagada; quem gere o papel dele ainda o remove e troca o papel, menos para
 * owner (409 MEMBER_SUSPENDED). Sem `status`, o membro é ativo.
 */
import { SignOutIcon, UserMinusIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o alvo do item
import { ResourceTable } from "@/components/blocks/resource-table/resource-table"
import type { ResourceColumn, ResourcePagination, RowAction } from "@/components/blocks/resource-table/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import type { MemberStatus } from "./overflow"
import { memberActions, type WorkspaceRole } from "./roles"

export interface WorkspaceMember {
  id: string
  username: string
  /** O nome da conta (o `name` do cadastro). As iniciais saem dele. */
  name: string
  role: WorkspaceRole
  /** ISO 8601. */
  joinedAt: string
  /** A versão otimista do membro (R18): vai no PATCH e no DELETE; cópia velha responde 409 CONFLICT. */
  version: number
  /** O `status` do GET …/members: `suspended` passou do limite do plano (B9b). Sem ele, `active`. */
  status?: MemberStatus
}

export interface MembersTableProps {
  members: WorkspaceMember[]
  /** Quem está vendo: a linha dele é a "você", e o papel dele decide as ações. */
  viewer: { id: string; role: WorkspaceRole }
  /**
   * Quantos owners o workspace tem, no total, da API (o último owner não sai nem é removido). Nunca
   * contado em `members`: a lista é uma página.
   */
  ownerCount: number
  /** Recebe o membro inteiro: o app manda `role` e `member.version` no PATCH. */
  onRoleChange: (member: WorkspaceMember, role: WorkspaceRole) => void
  /** Recebe o membro inteiro: o app manda `member.version` no DELETE. */
  onRemove: (member: WorkspaceMember) => void
  onLeave: () => void
  /** O idioma das datas, ex.: `pt-BR`. */
  locale: string
  /** A paginação por cursor da API (GET …/members), repassada à ResourceTable. */
  pagination?: ResourcePagination
  loading?: boolean
  className?: string
}

/** As iniciais do nome: a primeira e a última palavra ("Rafael Moura" → "RM"). */
export function memberInitials(name: string) {
  const partes = name.trim().split(/\s+/).filter(Boolean)
  const primeira = [...(partes[0] ?? "")][0] ?? ""
  const ultima = partes.length > 1 ? ([...partes[partes.length - 1]][0] ?? "") : ""
  return (primeira + ultima).toUpperCase()
}

export function MembersTable({
  members,
  viewer,
  ownerCount,
  onRoleChange,
  onRemove,
  onLeave,
  locale,
  pagination,
  loading,
  className,
}: MembersTableProps) {
  const t = useTranslate()
  const data = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })
  const papel = (r: WorkspaceRole) => t(`platform.members.role.${r}`)
  const suspenso = (m: WorkspaceMember) => m.status === "suspended"
  const acoesDe = (m: WorkspaceMember) =>
    memberActions(viewer.role, m.role, { isSelf: m.id === viewer.id, ownerCount, suspended: suspenso(m) })

  const columns: ResourceColumn<WorkspaceMember>[] = [
    {
      id: "person",
      header: t("platform.members.table.person"),
      mobile: "title",
      cell: (m) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px] font-semibold">{memberInitials(m.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={cn("truncate font-medium", suspenso(m) ? "text-muted-foreground" : "text-foreground-strong")}>{m.name}</span>
              {m.id === viewer.id ? (
                <Badge size="sm" variant="outline">
                  {t("platform.members.table.you")}
                </Badge>
              ) : null}
              {suspenso(m) ? (
                <Badge size="sm" tone="orange" dot>
                  {t("platform.members.table.suspended")}
                </Badge>
              ) : null}
            </span>
            <span className="truncate text-[12px] text-muted-foreground">@{m.username}</span>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: t("platform.members.table.role"),
      width: "168px",
      mobile: "status",
      cell: (m) => {
        const opcoes = acoesDe(m).roleOptions
        if (opcoes.length === 0) return <Badge>{papel(m.role)}</Badge>
        return (
          <Select
            value={m.role}
            items={opcoes.map((r) => ({ value: r, label: papel(r) }))}
            onValueChange={(r) => r && r !== m.role && onRoleChange(m, r)}
          >
            <SelectTrigger size="sm" className="w-[132px]" aria-label={t("platform.members.table.role_aria", { name: m.name })}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opcoes.map((r) => (
                <SelectItem key={r} value={r}>
                  {papel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      id: "joined",
      header: t("platform.members.table.joined"),
      width: "140px",
      mobile: "meta",
      cell: (m) => <span className="text-muted-foreground tabular-nums">{data.format(new Date(m.joinedAt))}</span>,
    },
  ]

  function rowActions(m: WorkspaceMember): RowAction[] {
    const acoes = acoesDe(m)
    const lista: RowAction[] = []
    if (acoes.remove !== "hidden") {
      const ultimo = acoes.remove === "last_owner"
      lista.push({
        id: "remove",
        label: t(ultimo ? "platform.members.actions.remove_last_owner" : "platform.members.actions.remove"),
        icon: UserMinusIcon,
        destructive: true,
        disabled: ultimo,
        onSelect: () => onRemove(m),
      })
    }
    if (acoes.leave !== "hidden") {
      const ultimo = acoes.leave === "last_owner"
      lista.push({
        id: "leave",
        label: t(ultimo ? "platform.members.actions.leave_last_owner" : "platform.members.actions.leave"),
        icon: SignOutIcon,
        destructive: true,
        disabled: ultimo,
        onSelect: onLeave,
      })
    }
    return lista
  }

  return (
    <ResourceTable
      label={t("platform.members.table.label")}
      columns={columns}
      rows={members}
      getRowId={(m) => m.id}
      isRowMuted={suspenso}
      rowActions={rowActions}
      // as duas ações são destrutivas: vão sempre para o "…"
      inlineActions={0}
      loading={loading}
      skeletonRows={pagination?.pageSize ?? (members.length || 5)}
      pagination={pagination}
      className={className}
    />
  )
}
