import { describe, expect, test } from "bun:test"
import { createElement, type ReactElement } from "react"
import { renderToString } from "react-dom/server"

import {
  FiscalDataCard,
  NextInvoiceHero,
  SeatChangesCard,
  SeatsSummary,
  TrialSubscribeCard,
  type BillingStatus,
  type NextInvoiceHeroProps,
  type SeatsSummaryProps,
} from "./billing-overview"
import { formatBillingDate, SEAT_BAR_MAX_SEGMENTS, seatBarSegments, seatGrid, trialProgress } from "./overview"

const tipos = (s: { kind: string }[]) => s.map((x) => x.kind)

describe("seatBarSegments", () => {
  test("um segmento por assento pago, e quem sai (pagos − ativos) no fim", () => {
    const s = seatBarSegments({ active: 6, paid: 7 })
    expect(tipos(s)).toEqual(["active", "active", "active", "active", "active", "active", "leaving"])
    expect(s.every((x) => x.weight === 1)).toBe(true)
  })
  test("sem ninguém saindo, todos ativos", () => {
    expect(tipos(seatBarSegments({ active: 3, paid: 3 }))).toEqual(["active", "active", "active"])
  })
  test("pagos abaixo de ativos não inventa assento: só os pagos aparecem", () => {
    expect(tipos(seatBarSegments({ active: 4, paid: 2 }))).toEqual(["active", "active"])
  })
  test("no teste, um segmento por ativo, mesmo com 0 pagos", () => {
    expect(tipos(seatBarSegments({ active: 6, paid: 0, trial: true }))).toEqual(Array(6).fill("trial"))
  })
  test("acima do máximo, um segmento por tipo, com o peso", () => {
    expect(seatBarSegments({ active: 120, paid: 125 })).toEqual([
      { kind: "active", weight: 120 },
      { kind: "leaving", weight: 5 },
    ])
    expect(seatBarSegments({ active: SEAT_BAR_MAX_SEGMENTS + 1, paid: SEAT_BAR_MAX_SEGMENTS + 1 })).toEqual([
      { kind: "active", weight: SEAT_BAR_MAX_SEGMENTS + 1 },
    ])
  })
  test("o mínimo do plano: Enterprise com 6 ativos e 10 pagos tem 4 de mínimo e ninguém saindo", () => {
    expect(tipos(seatBarSegments({ active: 6, paid: 10, minSeats: 10 }))).toEqual([
      ...Array(6).fill("active"),
      ...Array(4).fill("minimum"),
    ])
  })
  test("quem sai é pagos − max(ativos, mínimo)", () => {
    expect(tipos(seatBarSegments({ active: 6, paid: 12, minSeats: 10 }))).toEqual([
      ...Array(6).fill("active"),
      ...Array(4).fill("minimum"),
      "leaving",
      "leaving",
    ])
    // acima do mínimo, o mínimo não aparece
    expect(tipos(seatBarSegments({ active: 11, paid: 12, minSeats: 10 }))).toEqual([...Array(11).fill("active"), "leaving"])
    // mínimo ausente, nulo ou 1 é o de sempre
    expect(tipos(seatBarSegments({ active: 2, paid: 3, minSeats: null }))).toEqual(["active", "active", "leaving"])
    expect(tipos(seatBarSegments({ active: 2, paid: 3, minSeats: 1 }))).toEqual(["active", "active", "leaving"])
  })
  test("o mínimo também agrupa acima do máximo", () => {
    expect(seatBarSegments({ active: 6, paid: 50, minSeats: 45 })).toEqual([
      { kind: "active", weight: 6 },
      { kind: "minimum", weight: 39 },
      { kind: "leaving", weight: 5 },
    ])
  })
  test("valores fora do contrato (negativo, fração, NaN) não quebram", () => {
    expect(seatBarSegments({ active: -1, paid: Number.NaN })).toEqual([])
    expect(tipos(seatBarSegments({ active: 2.7, paid: 3.2 }))).toEqual(["active", "active", "leaving"])
  })
})

describe("trialProgress", () => {
  const fim = "2026-10-26T12:00:00Z"
  test("com 14 dias até o fim, hoje é o primeiro da barra", () => {
    const p = trialProgress(fim, "2026-10-12T12:00:00Z")
    expect(p.remaining).toBe(14)
    expect(p.todayIndex).toBe(0)
    expect(p.days).toEqual(["today", ...Array(13).fill("left")])
  })
  test("no meio do teste, os dias passados, o de hoje e os que faltam", () => {
    const p = trialProgress(fim, "2026-10-19T15:00:00Z")
    expect(p.remaining).toBe(7)
    expect(p.todayIndex).toBe(7)
    expect(p.days.filter((d) => d === "past")).toHaveLength(7)
    expect(p.days[7]).toBe("today")
    expect(p.days.filter((d) => d === "left")).toHaveLength(6)
  })
  test("no último dia, hoje é o último segmento", () => {
    const p = trialProgress(fim, "2026-10-26T08:00:00Z")
    expect(p.remaining).toBe(1)
    expect(p.todayIndex).toBe(13)
  })
  test("acabado, nenhum dia de hoje e todos passados", () => {
    const p = trialProgress(fim, "2026-10-27T00:00:00Z")
    expect(p.remaining).toBe(0)
    expect(p.todayIndex).toBeNull()
    expect(p.days.every((d) => d === "past")).toBe(true)
  })
  test("um fim além do total não passa dos 14", () => {
    expect(trialProgress(fim, "2026-10-01T00:00:00Z").remaining).toBe(14)
  })
  test("data inválida dá teste acabado, sem quebrar", () => {
    expect(trialProgress("x", "2026-10-12T12:00:00Z").remaining).toBe(0)
  })
  test("aceita outro total de dias", () => {
    expect(trialProgress(fim, "2026-10-19T12:00:00Z", 7).days).toHaveLength(7)
  })
})

describe("seatGrid", () => {
  const p = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`)
  test("até o máximo, todo mundo, sem o mais", () => {
    expect(seatGrid({ people: p(6), leaving: ["s"], active: 6 }, 12)).toEqual({ people: p(6), leaving: ["s"], more: 0 })
  })
  test("o mais sai dos ativos da API, não do tamanho da lista (o app passou só uma página)", () => {
    const g = seatGrid({ people: p(20), leaving: [], active: 150 }, 12)
    expect(g.people).toHaveLength(11)
    expect(g.more).toBe(139)
  })
  test("quem sai sempre aparece antes do corte", () => {
    const g = seatGrid({ people: p(30), leaving: ["s1", "s2"], active: 30 }, 12)
    expect(g.leaving).toEqual(["s1", "s2"])
    expect(g.people).toHaveLength(9)
    expect(g.more).toBe(21)
    expect(g.people.length + g.leaving.length + (g.more > 0 ? 1 : 0)).toBe(12)
  })
  test("lista menor que os ativos, mesmo abaixo do máximo, mostra o mais", () => {
    expect(seatGrid({ people: p(3), leaving: [], active: 6 }, 12).more).toBe(3)
  })
})

describe("formatBillingDate", () => {
  test("data válida, curta e com o ano", () => {
    expect(formatBillingDate("2026-11-12T12:00:00Z", "pt-BR")).toBe("12 de nov.")
    expect(formatBillingDate("2026-11-12T12:00:00Z", "pt-BR", { year: true })).toBe("12 de nov. de 2026")
  })
  test("inválida, vazia ou ausente dá null", () => {
    expect(formatBillingDate("amanhã", "pt-BR")).toBeNull()
    expect(formatBillingDate("", "pt-BR")).toBeNull()
    expect(formatBillingDate(undefined, "pt-BR")).toBeNull()
    expect(formatBillingDate(null, "pt-BR")).toBeNull()
  })
})

// a renderização, sem o DOM: nenhuma chave crua e nenhuma data inválida derrubando a página
const html = (el: ReactElement) => renderToString(el)
const crua = /platform\.billing\./
const PESSOAS = ["Rafael Moura", "Ana Lima"].map((name, i) => ({ id: String(i), name, you: i === 0 }))
const heroi = (props: Partial<NextInvoiceHeroProps>) =>
  createElement(NextInvoiceHero, {
    plan: { key: "platform_team", name: "Team" },
    status: "active",
    period: "monthly",
    nextInvoice: { amountInCents: 17400, currency: "BRL", date: "2026-11-12T12:00:00Z" },
    breakdown: { seats: 6, pricePerSeatInCents: 2900 },
    manage: { onClick: () => {} },
    viewPlans: { onClick: () => {} },
    subscribe: { onClick: () => {} },
    now: "2026-10-12T12:00:00Z",
    locale: "pt-BR",
    ...props,
  })
const assentos = (props: Partial<SeatsSummaryProps>) =>
  createElement(SeatsSummary, {
    seats: { active: 2, paid: 3 },
    people: PESSOAS,
    leaving: [{ name: "Carlos Souza" }],
    paidUntil: "2026-11-12T12:00:00Z",
    planName: "Team",
    codePro: "active",
    locale: "pt-BR",
    ...props,
  })

describe("render", () => {
  const STATUS: BillingStatus[] = ["trialing", "free", "active", "past_due", "unpaid", "canceled"]
  test.each(STATUS)("nenhuma chave crua no status %s", (status) => {
    const teste = status === "trialing"
    const free = status === "free"
    const saida =
      html(heroi({ status, trial: teste ? { endsAt: "2026-10-26T12:00:00Z" } : undefined })) +
      html(assentos({ trial: teste, free, codePro: free ? undefined : status === "active" || status === "past_due" ? "active" : "pending", seats: { active: 2, paid: teste ? 0 : 1 } }))
    expect(saida).not.toMatch(crua)
  })
  test("o Free: sem selo de status, sem cobrança prevista, só os ativos", () => {
    const h = html(heroi({ status: "free", period: undefined }))
    expect(h).toContain("Nenhuma cobrança prevista.")
    expect(h).not.toContain("R$")
    expect(h).not.toContain("Ativa")
    const a = html(assentos({ free: true, codePro: undefined, seats: { active: 2, paid: 0 }, leaving: [] }))
    expect(a).toContain("ativos")
    expect(a).not.toContain("pagos")
    expect(a).not.toContain('role="img"')
    expect(a).not.toContain("Quem entra")
    expect(a).not.toContain("Code Pro")
  })
  test("1 pago no singular", () => {
    expect(html(assentos({ seats: { active: 1, paid: 1 }, leaving: [] }))).toContain("pago neste período<")
  })
  test("o Code Pro pelo direito: active, pending e ausente", () => {
    expect(html(assentos({ codePro: "active" }))).toContain("para os 2 ativos")
    const pendente = html(assentos({ codePro: "pending" }))
    expect(pendente).toContain("O Code Pro entra com a assinatura paga.")
    expect(pendente).not.toContain("para os 2 ativos")
    expect(html(assentos({ codePro: undefined }))).not.toContain("Code Pro")
  })
  test("o mínimo do plano na legenda", () => {
    const a = html(assentos({ seats: { active: 6, paid: 10 }, minSeats: 10, leaving: [] }))
    expect(a).toContain("mínimo do plano")
    expect(a).not.toContain("pago até a renovação")
  })
  test("assinou no teste: a contagem continua e a direita diz quando começa", () => {
    const h = html(heroi({ status: "trialing", trial: { endsAt: "2026-10-26T12:00:00Z", subscribed: true } }))
    expect(h).toContain("dias de teste")
    expect(h).toContain("A assinatura começa em 26 de out. de 2026.")
    expect(h).toContain("Gerenciar no Stripe")
    expect(h).not.toContain("Assinar o Team")
    expect(h).not.toContain("volta para o Free")
  })
  test("datas inválidas não derrubam a página e somem com o trecho", () => {
    const h = html(heroi({ nextInvoice: { amountInCents: 17400, currency: "BRL", date: "x" } }))
    expect(h).toContain("174")
    expect(h).not.toContain("Próxima cobrança em")
    expect(html(heroi({ status: "trialing", trial: { endsAt: "x", subscribed: true } }))).not.toContain("começa em")
    expect(html(assentos({ paidUntil: "x" }))).toContain("sai na renovação")
    const m = html(
      createElement(SeatChangesCard, {
        changes: [
          { kind: "joined", name: "Bia Costa", at: "x" },
          { kind: "leaving", name: "Carlos Souza", at: "x" },
        ],
        period: { start: "x", end: "2026-11-12T12:00:00Z" },
        paidUntil: "x",
        locale: "pt-BR",
      })
    )
    expect(m).toContain("Bia Costa entrou<")
    expect(m).not.toContain("Invalid")
    expect(m).not.toContain(" a 12 de nov.")
    expect(m).not.toMatch(crua)
  })
  test("dados fiscais sem documento: fora do Brasil, a nota; no Brasil ou sem país, nenhum documento", () => {
    const f = (country?: string) => html(createElement(FiscalDataCard, { taxId: null, country, onEdit: () => {} }))
    expect(f("US")).toContain("Fora do Brasil")
    expect(f("BR")).toContain("Nenhum documento informado.")
    expect(f()).toContain("Nenhum documento informado.")
    expect(f("BR")).toContain("Editar")
  })
  test("se assinar: a conta com o mínimo e o Code Pro na assinatura paga", () => {
    const c = html(
      createElement(TrialSubscribeCard, {
        plan: { key: "platform_team", name: "Team" },
        people: 6,
        pricePerSeat: { amountInCents: 2900, currency: "BRL" },
        includesCodePro: true,
        subscribe: { onClick: () => {} },
        locale: "pt-BR",
      })
    )
    expect(c).toContain("Se assinar o Team")
    expect(c).toContain("6 pessoas × R$")
    expect(c).toContain("174")
    expect(c).toContain("na assinatura paga")
    expect(c).toContain("Assinar o Team")
    const e = html(
      createElement(TrialSubscribeCard, {
        plan: { key: "platform_enterprise", name: "Enterprise" },
        people: 6,
        minSeats: 10,
        pricePerSeat: { amountInCents: 4900, currency: "BRL" },
        locale: "pt-BR",
      })
    )
    expect(e).toContain("10 pessoas × R$")
    expect(e).toContain("490")
  })
})
