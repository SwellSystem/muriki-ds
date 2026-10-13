import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

import { SeatsPreview, type SeatsPreviewProps } from "./invite-form"

// o cartão de pessoas no plano (F1): o limite vem do plano, o plano pago e o de topo do teste vêm por prop
const cartao = (props: Partial<SeatsPreviewProps>) =>
  renderToString(
    createElement(SeatsPreview, {
      workspaceName: "Moura & Filhos",
      people: ["Rafael Moura", "ana@moura.dev", "joao@moura.dev", "bia@moura.dev"].map((name) => ({ name })),
      freeLimit: 5,
      planName: "Pro",
      trialPlanName: "Enterprise",
      trialDays: 14,
      ...props,
    })
  )
const vagos = (h: string) => h.split("border-dashed").length - 1

describe("SeatsPreview", () => {
  test("com trial: os dias do plano de topo grátis e o Free depois, sem preço", () => {
    const h = cartao({})
    expect(h).toContain("14 dias de Enterprise grátis. Depois do teste, até 5 pessoas cabem no Free.")
    expect(h).toContain("Até 5 pessoas no Free e no Pro")
    expect(h).not.toContain("R$")
    expect(h).not.toContain("Team")
    expect(h).not.toMatch(/platform\.members\./)
  })
  test("a régua tem os lugares do limite, com os vagos tracejados", () => {
    expect(vagos(cartao({}))).toBe(1)
    expect(vagos(cartao({ freeLimit: 8 }))).toBe(4)
    expect(cartao({ freeLimit: 8 })).toContain("Até 8 pessoas")
  })
  test("só você, com trial", () => {
    const h = cartao({ people: [{ name: "Rafael Moura" }] })
    expect(h).toContain("1 pessoa no")
    expect(h).toContain("só você")
    expect(h).toContain("14 dias de Enterprise grátis. Depois do teste, até 5 pessoas cabem no Free.")
  })
  test("com trial e sem o trialPlanName, o teste fala do planName, nunca do bloqueio", () => {
    const seis = Array.from({ length: 6 }, (_, i) => ({ name: `Pessoa ${i}` }))
    const h = cartao({ trialPlanName: undefined, people: seis })
    expect(h).toContain("14 dias de Pro grátis")
    expect(h).not.toContain("precisa do Enterprise")
  })
  test("sem trial, nada de grátis", () => {
    const h = cartao({ trialDays: null })
    expect(h).toContain("Até 5 pessoas cabem no Free.")
    expect(h).not.toContain("grátis")
  })
  test("acima do limite, no teste: sem bloqueio, só o depois do teste", () => {
    const pessoas = Array.from({ length: 12 }, (_, i) => ({ name: `p${i}@moura.dev` }))
    const h = cartao({ people: pessoas })
    expect(h).toContain("14 dias de Enterprise grátis. Depois do teste, até 5 pessoas cabem no Free; com 12, o time precisa de um plano pago.")
    expect(h).not.toContain("vão até")
  })
  test("acima do limite, sem trial, o Enterprise; a régua guarda o +N", () => {
    const pessoas = Array.from({ length: 12 }, (_, i) => ({ name: `p${i}@moura.dev` }))
    const h = cartao({ people: pessoas, trialDays: null })
    expect(h).toContain("O Free e o Pro vão até 5 pessoas. Com 12, o time precisa do Enterprise.")
    expect(h).toMatch(/>\+(<!-- -->)?3</)
    expect(vagos(h)).toBe(0)
  })
  test("sem ninguém, só a faixa, sem a frase", () => {
    const h = cartao({ people: [] })
    expect(h).toContain("Até 5 pessoas no Free e no Pro")
    expect(h).not.toContain("grátis")
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
