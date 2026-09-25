/**
 * Força de senha.
 *
 * A régua é a mesma do cadastro, do login e do backend: 8+ caracteres,
 * um número, uma minúscula, uma maiúscula. Quatro requisitos, quatro
 * degraus, quatro segmentos na barra. Não é medida de entropia — é o
 * checklist que o servidor vai exigir, mostrado antes do erro.
 *
 * Nem toda API cobra a composição. `{ minLength, composition: false }` é a
 * régua de quem só pede tamanho (a do Code: 12 a 128, fora de vazamentos):
 * o requisito vira só o tamanho e a força sobe com ele — no mínimo é média,
 * quatro a mais é forte, oito a mais é muito forte.
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

export interface PasswordPolicy {
  /** Tamanho mínimo. Padrão: 8. */
  minLength?: number
  /** Cobra número, minúscula e maiúscula. Padrão: true. */
  composition?: boolean
}

function requisitos({ minLength = PASSWORD_MIN_LENGTH, composition = true }: PasswordPolicy = {}) {
  const tamanho: PasswordRequirement = { id: "length", test: (p) => p.length >= minLength }
  return composition ? [tamanho, ...PASSWORD_REQUIREMENTS.slice(1)] : [tamanho]
}

export function checkPasswordRequirements(
  password: string,
  policy?: PasswordPolicy
): Array<{ id: PasswordRequirementId; met: boolean }> {
  return requisitos(policy).map((req) => ({ id: req.id, met: req.test(password) }))
}

export function getPasswordStrength(password: string, policy?: PasswordPolicy): PasswordStrength {
  if (!password) return "empty"
  if (policy?.composition === false) {
    const min = policy.minLength ?? PASSWORD_MIN_LENGTH
    const n = password.length
    return n < min ? "weak" : n < min + 4 ? "medium" : n < min + 8 ? "strong" : "very-strong"
  }
  const met = requisitos(policy).filter((req) => req.test(password)).length
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
