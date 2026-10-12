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
