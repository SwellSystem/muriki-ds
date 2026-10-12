import { describe, expect, test } from "bun:test"

import { seatPlanFloor, seatPlanStatus } from "./plans"

describe("seatPlanStatus", () => {
  test("o plano do teste mostra o teste, mesmo sendo o plano atual", () => {
    expect(seatPlanStatus("platform_team", { currentPlan: "platform_team", trialPlan: "platform_team" })).toBe("trial")
  })
  test("o plano assinado mostra o plano atual", () => {
    expect(seatPlanStatus("platform_team", { currentPlan: "platform_team" })).toBe("current")
  })
  test("os outros planos não têm selo", () => {
    expect(seatPlanStatus("platform_solo", { currentPlan: "platform_team", trialPlan: "platform_team" })).toBeNull()
    expect(seatPlanStatus("platform_free", {})).toBeNull()
  })
  test("o workspace que nasceu no Free (sem teste) marca o Free como atual", () => {
    expect(seatPlanStatus("platform_free", { currentPlan: "platform_free", trialPlan: null })).toBe("current")
  })
  test("o teste num plano e o atual em outro: cada um com o seu selo", () => {
    const estado = { currentPlan: "platform_free", trialPlan: "platform_team" }
    expect(seatPlanStatus("platform_team", estado)).toBe("trial")
    expect(seatPlanStatus("platform_free", estado)).toBe("current")
    expect(seatPlanStatus("platform_solo", estado)).toBeNull()
  })
})

describe("seatPlanFloor", () => {
  const ent = { monthly: 4900, yearly: 52920 }
  test("mínimo × preço por pessoa, no período escolhido", () => {
    expect(seatPlanFloor(ent, 10, "monthly")).toBe(49000)
    expect(seatPlanFloor(ent, 10, "yearly")).toBe(529200)
  })
  test("sem mínimo ou sem preço, não há piso", () => {
    expect(seatPlanFloor({ monthly: 2900, yearly: 31320 }, 1, "monthly")).toBeNull()
    expect(seatPlanFloor(null, 10, "monthly")).toBeNull()
  })
  test("mínimo ausente, nulo, zero ou não finito não vira NaN: não há piso", () => {
    for (const min of [undefined, null, 0, 1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(seatPlanFloor(ent, min, "monthly")).toBeNull()
    }
  })
})
