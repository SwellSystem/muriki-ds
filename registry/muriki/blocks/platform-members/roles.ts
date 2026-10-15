/**
 * As regras puras do bloco de membros e convites: o que cada papel vê (F6), o estado e as ações de
 * um convite (F7) e o parse dos e-mails colados no convidar. Sem React, sem rede: testadas em
 * roles.test.ts.
 *
 * `memberActions` decide só o que APARECE. Quem autoriza é a API (403, 409 LAST_OWNER e 404 para
 * quem não é membro): ação escondida não é proteção, e o app nunca trata "não apareceu" como "não
 * é possível".
 */

/** Os papéis do workspace, com o nome do produto (não traduz). */
export const WORKSPACE_ROLES = ["owner", "maintainer", "member", "guest"] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

/**
 * Uma ação da linha: `hidden` não aparece; `allowed` aparece e funciona; `last_owner` aparece
 * desligada, com o motivo (sair ou remover o único owner).
 */
export type MemberActionState = "hidden" | "allowed" | "last_owner"

export interface MemberActions {
  /** Os papéis do select da linha. Vazio: o papel é só leitura. Inclui o papel atual do alvo. */
  roleOptions: WorkspaceRole[]
  remove: MemberActionState
  /** Só na própria linha. */
  leave: MemberActionState
}

// quem cada papel gere (troca o papel, remove) e convida. Ninguém convida owner
const GERE: Record<WorkspaceRole, WorkspaceRole[]> = {
  owner: ["owner", "maintainer", "member", "guest"],
  maintainer: ["member", "guest"],
  member: [],
  guest: [],
}

/** Os papéis que quem vê pode dar num convite (F6): nunca `owner`. */
export function invitableRoles(viewerRole: WorkspaceRole): WorkspaceRole[] {
  return GERE[viewerRole].filter((papel) => papel !== "owner")
}

/**
 * O que a linha de `targetRole` mostra para quem tem `viewerRole` (F6). Na própria linha só existe
 * "Sair" (ninguém troca o próprio papel); sair sendo o último owner, ou remover o último owner,
 * aparece desligado com o motivo (`last_owner`). O membro suspenso (B9b) segue a mesma matriz, menos
 * a promoção a owner: um owner nunca é suspenso, e a API responde 409 MEMBER_SUSPENDED.
 */
export function memberActions(
  viewerRole: WorkspaceRole,
  targetRole: WorkspaceRole,
  { isSelf, ownerCount, suspended = false }: { isSelf: boolean; ownerCount: number; suspended?: boolean }
): MemberActions {
  const ultimoOwner = targetRole === "owner" && ownerCount <= 1

  if (isSelf) {
    return { roleOptions: [], remove: "hidden", leave: ultimoOwner ? "last_owner" : "allowed" }
  }

  const gere = GERE[viewerRole]
  if (!gere.includes(targetRole)) return { roleOptions: [], remove: "hidden", leave: "hidden" }

  return {
    // rebaixar o último owner é o mesmo que tirá-lo: o select some e a remoção fica desligada
    roleOptions: ultimoOwner ? [] : suspended ? gere.filter((papel) => papel !== "owner") : gere,
    remove: ultimoOwner ? "last_owner" : "allowed",
    leave: "hidden",
  }
}

// ── Convites (F7) ───────────────────────────────────────────────────────

/** O estado na API. Vencido não é estado: é um `pending` com `expiresAt` no passado. */
export type InvitationStatus = "pending" | "accepted" | "revoked" | "superseded"
/** O estado que a tela mostra: os quatro da API mais o `expired`. */
export type InvitationState = InvitationStatus | "expired"

export function invitationState(
  invitation: { status: InvitationStatus; expiresAt: string | Date },
  now: number | Date
): InvitationState {
  if (invitation.status !== "pending") return invitation.status
  return new Date(invitation.expiresAt).getTime() < new Date(now).getTime() ? "expired" : "pending"
}

/**
 * Se quem vê gere um convite de `invitationRole` (F6): o owner gere todos; o maintainer só os de
 * member e guest; member e guest, nenhum.
 */
export function managesInvitation(viewerRole: WorkspaceRole, invitationRole: WorkspaceRole): boolean {
  return GERE[viewerRole].includes(invitationRole)
}

/**
 * Reenviar em qualquer pendente (vencido ou não), e a API marca o antigo como `superseded`; revogar
 * só no pendente (F7). As duas só para quem gere o papel do convite (`managesInvitation`).
 */
export function invitationActions(
  state: InvitationState,
  { viewerRole, invitationRole }: { viewerRole: WorkspaceRole; invitationRole: WorkspaceRole }
): { resend: boolean; revoke: boolean } {
  const pode = (state === "pending" || state === "expired") && managesInvitation(viewerRole, invitationRole)
  return { resend: pode, revoke: pode }
}

const DIA = 24 * 60 * 60 * 1000

/**
 * Quantos dias de calendário, no fuso local, vão de `now` até `date`: 0 é hoje, 1 amanhã, -1 ontem.
 * Conta de início do dia a início do dia (o arredondamento absorve a hora a mais ou a menos do
 * horário de verão).
 */
export function calendarDaysFrom(date: string | Date, now: number | Date): number {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((inicio(new Date(date)) - inicio(new Date(now))) / DIA)
}

/**
 * Os dias de `calendarDaysFrom` como texto, sempre com número ("em 3 dias", "há 1 dia"): o "hoje"
 * (0) tem frase própria no componente, e o `numeric: "auto"` não entra para não dizer "amanhã" de
 * um prazo que vence daqui a 1 hora.
 */
export function formatCalendarDays(days: number, locale: string): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(days, "day")
}

// ── O papel das linhas do convidar ──────────────────────────────────────

/**
 * O papel que a linha do convidar pode levar: o recebido, se quem vê pode dá-lo (`invitableRoles`);
 * senão o padrão, Member (ou o primeiro que quem vê pode dar). Nunca owner. Para quem não convida
 * ninguém (member, guest), devolve `null`.
 */
export function inviteRoleFor(viewerRole: WorkspaceRole, role: WorkspaceRole): WorkspaceRole | null {
  const papeis = invitableRoles(viewerRole)
  if (papeis.includes(role)) return role
  return papeis.includes("member") ? "member" : (papeis[0] ?? null)
}

/**
 * As linhas do convidar com o papel saneado (`inviteRoleFor`): o papel que quem vê não pode dar
 * (owner, ou maintainer para uma maintainer) vira o padrão, Member. Para quem não convida ninguém,
 * nenhuma linha.
 */
export function normalizeInviteRows<T extends { role: WorkspaceRole }>(rows: T[], viewerRole: WorkspaceRole): T[] {
  const linhas: T[] = []
  for (const r of rows) {
    const role = inviteRoleFor(viewerRole, r.role)
    if (role !== null) linhas.push(role === r.role ? r : { ...r, role })
  }
  return linhas
}

/**
 * O que vai no envio: as linhas com o papel saneado, o e-mail no formato e sem erro da API na
 * linha (`rowErrors`, pelo e-mail em minúsculas). Nunca leva owner, nem maintainer quando quem vê é
 * maintainer.
 */
export function inviteRowsToSend<T extends { email: string; role: WorkspaceRole }>(
  rows: T[],
  viewerRole: WorkspaceRole,
  rowErrors?: Record<string, unknown>
): T[] {
  return normalizeInviteRows(rows, viewerRole).filter((r) => isInviteEmail(r.email) && !rowErrors?.[r.email])
}

// ── E-mails colados no convidar ─────────────────────────────────────────

// o limite de um endereço (RFC 5321) e a forma mínima: algo@algo.algo, sem espaço
const EMAIL_MAX = 254
const FORMA_EMAIL = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:".]+$/

/** O e-mail que dá para convidar: a forma `nome@dominio.tld`, até 254 caracteres. A API valida de novo. */
export function isInviteEmail(email: string): boolean {
  return email.length <= EMAIL_MAX && FORMA_EMAIL.test(email)
}

/**
 * O teto de linhas da lista do convidar: os 20 convites por hora que a API aceita de uma conta.
 * Acima disso o excedente não entra, e o formulário avisa.
 */
export const INVITE_MAX_ROWS = 20

/**
 * O teto do parse: no máximo 500 e-mails de um texto (bem acima das 20 linhas da lista); o resto
 * do texto não é lido. O laço é linear no tamanho do texto, então colar muito não trava a tela.
 */
export const INVITE_PARSE_MAX = 500

// os separadores: vírgula, ponto e vírgula e linha fecham um endereço; espaço e tab só separam palavras
const FECHA = new Set([",", ";", "\n", "\r"])
const ESPACO = new Set([" ", "\t", "\f", "\v", "\u00a0"])
// o que sai das pontas de uma palavra: as aspas, os parênteses e o ponto final da frase
const PONTA_INICIO = new Set(['"', "'", "(", "<"])
const PONTA_FIM = new Set([">", ")", '"', "'", "."])

function aparar(palavra: string) {
  let i = 0
  let f = palavra.length
  while (i < f && PONTA_INICIO.has(palavra[i])) i++
  while (f > i && PONTA_FIM.has(palavra[f - 1])) f--
  return palavra.slice(i, f)
}

/**
 * Os e-mails de um texto colado ou digitado, num laço só, sem regex:
 * 1. separa por vírgula, ponto e vírgula, linha, espaço e tab, sem cortar o que está entre `"..."`
 *    e `<...>`;
 * 2. do "Nome <email>" dos clientes de e-mail fica só o `<email>`: as palavras antes dele, desde o
 *    último separador de endereço (vírgula, ponto e vírgula, linha) ou o último `<...>`, são o nome;
 * 3. passa para minúsculas e tira as repetições (a primeira fica), até `INVITE_PARSE_MAX`.
 * Não descarta o inválido: ele vira uma linha em vermelho, para a pessoa ver o que colou errado.
 */
export function parseInviteEmails(text: string): string[] {
  const vistos = new Set<string>()
  const emails: string[] = []
  // as palavras do endereço em curso: viram e-mails, a não ser que um <email> chegue (aí eram o nome)
  let pendentes: string[] = []
  let palavra = ""
  let angulo: string | null = null
  let aspas = false

  const emitir = (bruto: string) => {
    const email = aparar(bruto.trim()).toLowerCase()
    if (email === "" || vistos.has(email) || emails.length >= INVITE_PARSE_MAX) return
    vistos.add(email)
    emails.push(email)
  }
  const fecharPalavra = () => {
    if (palavra !== "") pendentes.push(palavra)
    palavra = ""
  }
  const fecharEndereco = () => {
    fecharPalavra()
    for (const p of pendentes) emitir(p)
    pendentes = []
  }

  for (let i = 0; i < text.length && emails.length < INVITE_PARSE_MAX; i++) {
    const c = text[i]
    if (angulo !== null) {
      if (c === ">") {
        // o <email> chegou: o que vinha antes era o nome
        pendentes = []
        emitir(angulo)
        angulo = null
      } else angulo += c
      continue
    }
    if (aspas) {
      palavra += c
      if (c === '"') aspas = false
      continue
    }
    if (c === '"') {
      aspas = true
      palavra += c
    } else if (c === "<") {
      fecharPalavra()
      angulo = ""
    } else if (FECHA.has(c)) fecharEndereco()
    else if (ESPACO.has(c)) fecharPalavra()
    else palavra += c
  }
  // o "<" sem ">" no fim: o que veio depois dele é o e-mail
  if (angulo !== null) {
    pendentes = []
    emitir(angulo)
  }
  fecharEndereco()
  return emails
}
