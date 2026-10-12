/**
 * As regras de forma do @usuário e do slug do workspace no Platform, as mesmas da muriki-api
 * (identity/domain/username.ts e o slug do workspace): o componente valida antes do envio e a API
 * valida de novo. Nunca relaxe aqui o que a API exige.
 *
 * Só forma. Ocupado e reservado vêm da API (a lista de nomes reservados muda lá, e uma cópia
 * aqui ficaria velha).
 */

/** Por que o valor não serve, na ordem em que a pessoa precisa saber. */
export type HandleIssue = "too_short" | "too_long" | "character" | "format"

/**
 * O estado do campo. O app manda `checking`, `available`, `taken`, `reserved`, `invalid` (a API
 * recusou o formato) e `unchecked` (a consulta falhou, 429 ou 503: não é erro, a API confere no
 * envio). `idle` é o campo vazio, e `invalid` também aparece sozinho quando o formato falha.
 */
export type HandleStatus = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid" | "unchecked"

export type HandleKind = "username" | "slug"

// começa por letra; um . ou _ só entre dois caracteres, nunca no fim nem dois seguidos
const USUARIO = /^[a-z](?:[._]?[a-z0-9])*$/
// começa por letra; um - só entre dois caracteres, nunca no fim nem dois seguidos
const SLUG = /^[a-z](?:-?[a-z0-9])*$/

export const USERNAME_LIMITS = { min: 3, max: 30 } as const
export const SLUG_LIMITS = { min: 3, max: 40 } as const

const REGRAS = {
  // o primeiro caractere fora do conjunto: o resto da forma é com USUARIO e SLUG
  username: { limites: USERNAME_LIMITS, fora: /[^a-z0-9._]/u, forma: USUARIO },
  slug: { limites: SLUG_LIMITS, fora: /[^a-z0-9-]/u, forma: SLUG },
} as const

/** `trim` + minúsculas: o campo mostra isto enquanto a pessoa digita e o app guarda isto. */
export function normalizeHandle(v: string): string {
  return v.trim().toLowerCase()
}

/** O motivo, nesta ordem: tamanho (curto, longo), caractere fora do conjunto, formato. */
export function handleIssue(kind: HandleKind, v: string): HandleIssue | null {
  const { limites, fora, forma } = REGRAS[kind]
  const n = normalizeHandle(v)
  if (n.length < limites.min) return "too_short"
  if (n.length > limites.max) return "too_long"
  if (fora.test(n)) return "character"
  return forma.test(n) ? null : "format"
}

/** O primeiro caractere que não pode (em NFC, para o "ã" sair inteiro na frase), ou null. */
export function badCharacter(kind: HandleKind, v: string): string | null {
  return normalizeHandle(v).normalize("NFC").match(REGRAS[kind].fora)?.[0] ?? null
}

/** F1: de 3 a 30, letras, números e um `.` ou `_` entre eles. */
export function usernameIssue(v: string): HandleIssue | null {
  return handleIssue("username", v)
}

/** F2: de 3 a 40, letras, números e um `-` entre eles. */
export function slugIssue(v: string): HandleIssue | null {
  return handleIssue("slug", v)
}

/**
 * O estado que o campo mostra para `value`. Vazio é `idle`; formato errado é `invalid`, e o
 * `status` do app nem conta. Com o formato certo, o `status` só vale para o valor que a API
 * respondeu (`statusFor`, o `username` ou `slug` da resposta): com outro valor, o campo está
 * `checking`, e nunca mostra "livre" de um valor que não é o da tela. Sem `statusFor`, o `status`
 * vale como veio.
 */
export function handleStatus(kind: HandleKind, value: string, status: HandleStatus, statusFor?: string): HandleStatus {
  if (!value) return "idle"
  if (handleIssue(kind, value)) return "invalid"
  if (statusFor !== undefined && statusFor !== value) return "checking"
  return status
}

/** O valor pode seguir para o envio: livre, ou não conferido (a API confere no envio). */
export function handleReady(status: HandleStatus): boolean {
  return status === "available" || status === "unchecked"
}

/** F5: o nome do workspace, como o isPlainText da API: de 1 a 80 code points depois do `trim`. */
export const WORKSPACE_NAME_MAX = 80

// controle e invisível, como a API; \p{Cs} é o surrogate solto (o isWellFormed da API)
const INVISIVEL = /[\p{Cc}\p{Cf}\p{Cs}]/u

/** F5: `length` fora de 1 a 80 code points; `character` com caractere de controle ou invisível. */
export function workspaceNameIssue(name: string): "length" | "character" | null {
  const n = name.trim()
  const tamanho = [...n].length
  if (tamanho < 1 || tamanho > WORKSPACE_NAME_MAX) return "length"
  return INVISIVEL.test(n) ? "character" : null
}

/**
 * F4 ao mudar o nome: o slug segue o nome enquanto está vazio ou é a sugestão do nome anterior;
 * fora disso o slug é da pessoa e fica. Derivado a cada mudança, sem estado de "editado": vale
 * para o rascunho restaurado a qualquer hora e para o formulário zerado.
 */
export function nextSlugOnNameChange(name: string, slug: string, newName: string): string {
  return slug === "" || slug === suggestSlug(name) ? suggestSlug(newName) : slug
}

/**
 * F4: o slug a partir do nome do workspace. Tira os acentos, troca o que não é [a-z0-9] por um
 * `-` só, apara as pontas e corta em 40. Se o resultado não passa em F2 (começa por dígito, ficou
 * curto), a sugestão sai vazia: melhor um campo vazio do que um slug que a API recusa.
 */
export function suggestSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_LIMITS.max)
    .replace(/-+$/, "")
  return slugIssue(slug) === null ? slug : ""
}

/** A sigla do workspace na prévia: a primeira letra das duas primeiras palavras, ou só a da única. */
export function workspaceInitials(name: string): string {
  const palavras = name.trim().split(/\s+/).filter((p) => /^[\p{L}\p{N}]/u.test(p))
  return palavras
    .slice(0, 2)
    .map((p) => [...p][0])
    .join("")
    .toLocaleUpperCase()
}

/** Os tons do Badge que o avatar do workspace usa; o cinza fica de fora, é o tom de "nada ainda". */
export const WORKSPACE_TONES = ["blue", "cyan", "green", "yellow", "orange", "red", "pink", "purple"] as const
export type WorkspaceTone = (typeof WORKSPACE_TONES)[number]

/**
 * A cor do avatar do workspace, estável para o mesmo nome: um hash dos code points do nome aparado
 * e em minúsculas escolhe um tom. O mesmo nome dá a mesma cor na prévia e no app. Vazio é `null`.
 */
export function workspaceTone(name: string): WorkspaceTone | null {
  const n = name.trim().toLowerCase()
  if (!n) return null
  let h = 0
  for (const c of n) h = (h * 31 + c.codePointAt(0)!) >>> 0
  return WORKSPACE_TONES[h % WORKSPACE_TONES.length]
}
