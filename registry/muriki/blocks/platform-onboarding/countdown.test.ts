import { describe, expect, test } from "bun:test"

import { formatCountdown } from "./countdown"

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
