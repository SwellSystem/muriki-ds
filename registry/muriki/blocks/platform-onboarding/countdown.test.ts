import { describe, expect, test } from "bun:test"

import { formatCountdown, formatInvitationExpiry } from "./countdown"

describe("formatCountdown", () => {
  test("minutos e segundos com dois dígitos", () => {
    expect(formatCountdown(48)).toBe("0:48")
    expect(formatCountdown(5)).toBe("0:05")
    expect(formatCountdown(60)).toBe("1:00")
    expect(formatCountdown(125)).toBe("2:05")
  })

  test("fração arredonda para cima: nunca 0:00 enquanto falta espera", () => {
    expect(formatCountdown(0.2)).toBe("0:01")
    expect(formatCountdown(47.5)).toBe("0:48")
  })

  test("zero, negativo e inválido são 0:00", () => {
    expect(formatCountdown(0)).toBe("0:00")
    expect(formatCountdown(-3)).toBe("0:00")
    expect(formatCountdown(Number.NaN)).toBe("0:00")
    expect(formatCountdown(Number.POSITIVE_INFINITY)).toBe("0:00")
  })
})

describe("formatInvitationExpiry", () => {
  const now = new Date(2026, 9, 12, 10, 0)

  test("dia, mês e hora no idioma, sem o ano corrente", () => {
    // a pontuação entre a data e a hora muda com o ICU do runtime: confere as partes
    const pt = formatInvitationExpiry(new Date(2026, 9, 19, 14, 30).toISOString(), "pt-BR", now)!
    expect(pt).toStartWith("19 de out.")
    expect(pt).toEndWith("14:30")
    expect(pt).not.toContain("2026")
    const en = formatInvitationExpiry(new Date(2026, 9, 19, 14, 30).toISOString(), "en-US", now)!
    expect(en).toStartWith("Oct 19")
    expect(en).toEndWith("2:30 PM")
  })

  test("o ano aparece quando vira o ano", () => {
    expect(formatInvitationExpiry(new Date(2027, 0, 2, 9, 0).toISOString(), "pt-BR", now)).toStartWith("2 de jan. de 2027")
  })

  test("vazio ou inválido é null", () => {
    expect(formatInvitationExpiry(undefined, "pt-BR", now)).toBeNull()
    expect(formatInvitationExpiry("", "pt-BR", now)).toBeNull()
    expect(formatInvitationExpiry("ontem", "pt-BR", now)).toBeNull()
  })
})
