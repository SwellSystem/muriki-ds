/**
 * A espera do reenviar, em minutos e segundos ("0:48"). Os segundos vêm do app (o que falta até a
 * API aceitar um código novo); o componente só formata. Fração arredonda para cima, para nunca
 * mostrar "0:00" enquanto ainda falta espera; negativo, zero ou inválido é "0:00".
 */
export function formatCountdown(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0
  const minutos = Math.floor(total / 60)
  const resto = total % 60
  return `${minutos}:${String(resto).padStart(2, "0")}`
}

/**
 * O fim do convite ("19 de out., 14:30"), do `expiresAt` da prévia (ISO com hora), no fuso de quem abre.
 * Com a hora: o convite vence no meio do dia, e "até 19 de out." prometeria o dia inteiro.
 * Ano só quando não é o de `now`. Vazio ou inválido é `null`: a tela volta à frase sem data.
 */
export function formatInvitationExpiry(expiresAt: string | null | undefined, locale: string, now: Date = new Date()): string | null {
  if (!expiresAt) return null
  const d = new Date(expiresAt)
  if (!Number.isFinite(d.getTime())) return null
  const ano = d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : null
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", ...ano, hour: "numeric", minute: "2-digit" }).format(d)
}
