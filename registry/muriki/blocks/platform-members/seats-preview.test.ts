import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

import { SeatsPreview, type SeatsPreviewProps } from "./invite-form"

// o cartão de pessoas no plano (F1): o limite vem do plano, o nome do plano pago vem por prop
const cartao = (props: Partial<SeatsPreviewProps>) =>
  renderToString(
    createElement(SeatsPreview, {
      workspaceName: "Moura & Filhos",
      people: ["Rafael Moura", "ana@moura.dev", "joao@moura.dev", "bia@moura.dev"].map((name) => ({ name })),
      freeLimit: 5,
      planName: "Pro",
      pricePerSeat: { amountInCents: 2900, currency: "BRL" },
      trialDays: 14,
      locale: "pt-BR",
      ...props,
    })
  )
const vagos = (h: string) => h.split("border-dashed").length - 1

describe("SeatsPreview", () => {
  test("com trial: os dias do plano grátis, o Free depois e a conta para seguir no plano", () => {
    const h = cartao({})
    expect(h).toContain("14 dias de Pro grátis. Depois do teste, as 4 pessoas cabem no Free; para seguir no Pro, 4 × R$")
    expect(h).toContain("Até 5 pessoas no Free e no Pro")
    expect(h).not.toContain("Team")
    expect(h).not.toMatch(/platform\.members\./)
  })
  test("a régua tem os lugares do limite, com os vagos tracejados", () => {
    expect(vagos(cartao({}))).toBe(1)
    expect(vagos(cartao({ freeLimit: 8 }))).toBe(4)
    expect(cartao({ freeLimit: 8 })).toContain("Até 8 pessoas")
  })
  test("só você, com trial", () => {
    expect(cartao({ people: [{ name: "Rafael Moura" }] })).toContain("Depois do teste, você cabe no Free; para seguir no Pro, 1 × R$")
  })
  test("sem trial, nada de grátis", () => {
    const h = cartao({ trialDays: null })
    expect(h).toContain("Até 5 pessoas cabem no Free.")
    expect(h).not.toContain("grátis")
  })
  test("acima do limite, o Enterprise; a régua guarda o +N", () => {
    const pessoas = Array.from({ length: 12 }, (_, i) => ({ name: `p${i}@moura.dev` }))
    const h = cartao({ people: pessoas })
    expect(h).toContain("O Free e o Pro vão até 5 pessoas. Com 12, o time precisa do Enterprise.")
    expect(h).toMatch(/>\+(<!-- -->)?3</)
    expect(vagos(h)).toBe(0)
  })
  test("sem ninguém, só a faixa: nada de \"1 × R$ 29 = R$ 0\"", () => {
    const h = cartao({ people: [] })
    expect(h).toContain("Até 5 pessoas no Free e no Pro")
    expect(h).not.toContain("×")
    expect(h).not.toContain("grátis")
    expect(h).not.toContain("R$")
    expect(vagos(h)).toBe(5)
  })
  test("limite acima dos 10 lugares: as pessoas, o +N e um vago enquanto houver vaga", () => {
    const pessoas = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `p${i}@moura.dev` }))
    // 12 de 20: 8 desenhadas, "+4" e 1 vago
    const h = cartao({ freeLimit: 20, people: pessoas(12) })
    expect(h).toMatch(/>\+(<!-- -->)?4</)
    expect(vagos(h)).toBe(1)
    expect(h).toContain("Até 20 pessoas")
    // 9 de 20: as 9 cabem, e o décimo lugar fica vago
    const nove = cartao({ freeLimit: 20, people: pessoas(9) })
    expect(nove).not.toMatch(/>\+(<!-- -->)?\d/)
    expect(vagos(nove)).toBe(1)
    // 20 de 20: lotado de verdade, sem vago
    expect(vagos(cartao({ freeLimit: 20, people: pessoas(20) }))).toBe(0)
  })
})
