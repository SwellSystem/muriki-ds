/**
 * Força de senha.
 *
 * A régua é a mesma do cadastro, do login e do backend: 8+ caracteres,
 * um número, uma minúscula, uma maiúscula. Quatro requisitos, quatro
 * degraus, quatro segmentos na barra. Não é medida de entropia — é o
 * checklist que o servidor vai exigir, mostrado antes do erro.
 */
export type PasswordStrength = "empty" | "weak" | "medium" | "strong" | "very-strong"

export type PasswordRequirementId = "length" | "number" | "lowercase" | "uppercase"

export interface PasswordRequirement {
  id: PasswordRequirementId
  test: (password: string) => boolean
}

export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  { id: "length", test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { id: "number", test: (p) => /\d/.test(p) },
  { id: "lowercase", test: (p) => /[a-z]/.test(p) },
  { id: "uppercase", test: (p) => /[A-Z]/.test(p) },
]

export function checkPasswordRequirements(
  password: string
): Array<{ id: PasswordRequirementId; met: boolean }> {
  return PASSWORD_REQUIREMENTS.map((req) => ({ id: req.id, met: req.test(password) }))
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty"
  const met = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length
  if (met <= 1) return "weak"
  if (met === 2) return "medium"
  if (met === 3) return "strong"
  return "very-strong"
}

const SEGMENTS: Record<PasswordStrength, number> = {
  empty: 0,
  weak: 1,
  medium: 2,
  strong: 3,
  "very-strong": 4,
}

export function getStrengthSegments(strength: PasswordStrength): number {
  return SEGMENTS[strength]
}
