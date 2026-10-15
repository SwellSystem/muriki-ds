/**
 * As contas puras da carência de pessoas acima do limite (o B9b da API): quantas passam do limite,
 * quantos lugares o owner tem para escolher, quem fica no fim do prazo e o que vai no
 * PUT …/members/active. Sem React, sem rede: testadas em overflow.test.ts.
 *
 * A regra é da API, e ela confere de novo (422 ACTIVE_MEMBERS_INVALID):
 * - a escolha diz quem tem PRIORIDADE, não quem sai: a lista leva todo owner ativo e no máximo
 *   `max(0, limite − owners)` não owners, e pode ter menos que isso;
 * - no fim do prazo ficam os owners (sempre, mesmo acima do limite), depois os escolhidos que ainda
 *   estão ativos, do mais antigo ao mais novo, e, nas vagas que sobram, os mais antigos não escolhidos;
 *   o resto fica `suspended` (sem acesso, sem assento, continua listado);
 * - ninguém é removido pelo sistema, e o suspenso volta sozinho quando abre vaga.
 */
import type { WorkspaceRole } from "./roles"

/** O vínculo do membro: `suspended` passou do limite no fim da carência (sem acesso, sem assento). */
export type MemberStatus = "active" | "suspended"

/** A carência aberta (`overflow` do GET /platform/workspaces/:id); `null` fora dela. */
export interface MemberOverflow {
  /** ISO 8601: o fim do prazo de 7 dias. */
  dueAt: string
  /** O limite de pessoas do plano (`platform.max_members`). */
  limit: number
  /** Os membros ativos agora. */
  active: number
}

/** O mínimo de um membro que as contas da carência leem. */
export interface OverflowMember {
  id: string
  role: WorkspaceRole
  /** Sem status, ativo (o formato antigo do MembersTable). */
  status?: MemberStatus
  /** ISO 8601: desempata quem fica pela antiguidade. */
  joinedAt: string
}

/** Quantas pessoas passam do limite (`active − limit`), nunca negativo. */
export function overflowExcess({ limit, active }: Pick<MemberOverflow, "limit" | "active">): number {
  return Math.max(0, active - limit)
}

/** Os lugares que o owner escolhe: o limite menos os owners, que ficam sempre. Nunca negativo. */
export function priorityPlaces(limit: number, ownerCount: number): number {
  return Math.max(0, limit - ownerCount)
}

const ativo = (m: OverflowMember) => (m.status ?? "active") === "active"
const porEntrada = <T extends OverflowMember>(a: T, b: T) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()

/**
 * Os membros ativos separados como o seletor mostra: os owners (fixos, ficam sempre) e os
 * candidatos (os outros papéis), do mais antigo ao mais novo. O suspenso não entra em nenhum.
 */
export function priorityCandidates<T extends OverflowMember>(members: T[]): { owners: T[]; candidates: T[] } {
  const ativos = members.filter(ativo).sort(porEntrada)
  return {
    owners: ativos.filter((m) => m.role === "owner"),
    candidates: ativos.filter((m) => m.role !== "owner"),
  }
}

/**
 * A escolha que o seletor abre marcada: o `chosenMemberIds` da API (do GET …/billing ou da resposta
 * do PUT) só com os candidatos de agora, na ordem deles; `null` (ninguém escolheu) abre vazia. Um
 * escolhido que saiu, foi suspenso ou virou owner sai da marcação.
 */
export function initialPrioritySelection(chosenMemberIds: readonly string[] | null | undefined, members: OverflowMember[]): string[] {
  if (!chosenMemberIds) return []
  const escolhidos = new Set(chosenMemberIds)
  return priorityCandidates(members)
    .candidates.filter((m) => escolhidos.has(m.id))
    .map((m) => m.id)
}

/** Marca ou desmarca um candidato, sem repetir. */
export function togglePriority(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
}

export interface PriorityCount {
  /** Os lugares do plano (o limite). */
  limit: number
  /** Os lugares já tomados: os owners mais os escolhidos. */
  used: number
  /** Os lugares que o owner escolhe (`priorityPlaces`). */
  places: number
  /** Quantos escolhidos. */
  chosen: number
  /** Escolheu mais que os lugares: a API responderia 422 ACTIVE_MEMBERS_INVALID. */
  over: boolean
  /** Os lugares escolhíveis tomados: os candidatos ainda não marcados ficam desligados. */
  full: boolean
}

/** O contador do seletor ("3 de 5 lugares") e se a escolha cabe. */
export function priorityCount(limit: number, ownerCount: number, selectedCount: number): PriorityCount {
  const places = priorityPlaces(limit, ownerCount)
  return {
    limit,
    used: ownerCount + selectedCount,
    places,
    chosen: selectedCount,
    over: selectedCount > places,
    full: selectedCount >= places,
  }
}

/**
 * O corpo do PUT …/members/active: todo owner ativo e os escolhidos que ainda são candidatos, sem
 * repetição. A lista de membros tem de estar inteira (todas as páginas do GET …/members): faltando um
 * owner, a API responde 422 ACTIVE_MEMBERS_INVALID.
 */
export function priorityMemberIds(members: OverflowMember[], selected: readonly string[]): string[] {
  const { owners, candidates } = priorityCandidates(members)
  const marcados = new Set(selected)
  return [...owners.map((m) => m.id), ...candidates.filter((m) => marcados.has(m.id)).map((m) => m.id)]
}

/**
 * Quem fica ativo no fim do prazo com a escolha `selected`, como a API decide: os owners, depois os
 * escolhidos do mais antigo ao mais novo e, nas vagas que sobram até o limite, os mais antigos não
 * escolhidos. Quem não está no conjunto seria suspenso. É uma prévia: a API decide de novo no fim,
 * com os membros e o limite daquela hora.
 */
export function membersStaying(members: OverflowMember[], selected: readonly string[], limit: number): Set<string> {
  const { owners, candidates } = priorityCandidates(members)
  let vagas = priorityPlaces(limit, owners.length)
  const ficam = new Set(owners.map((m) => m.id))
  const marcados = new Set(selected)
  for (const m of candidates) {
    if (vagas > 0 && marcados.has(m.id)) {
      ficam.add(m.id)
      vagas--
    }
  }
  for (const m of candidates) {
    if (vagas > 0 && !ficam.has(m.id)) {
      ficam.add(m.id)
      vagas--
    }
  }
  return ficam
}
