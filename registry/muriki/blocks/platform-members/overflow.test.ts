import { describe, expect, test } from "bun:test"

import { memberActions } from "./roles"
import {
  initialPrioritySelection,
  membersStaying,
  overflowExcess,
  priorityCandidates,
  priorityCount,
  priorityMemberIds,
  priorityPlaces,
  togglePriority,
  type OverflowMember,
} from "./overflow"

// sete ativos e um suspenso, fora da ordem de entrada (a conta ordena pelo joinedAt)
const MEMBROS: OverflowMember[] = [
  { id: "m4", role: "member", joinedAt: "2026-09-21T00:00:00Z" },
  { id: "o1", role: "owner", joinedAt: "2026-09-02T00:00:00Z" },
  { id: "m2", role: "maintainer", status: "active", joinedAt: "2026-09-04T00:00:00Z" },
  { id: "m3", role: "member", joinedAt: "2026-09-10T00:00:00Z" },
  { id: "s1", role: "member", status: "suspended", joinedAt: "2026-08-01T00:00:00Z" },
  { id: "m5", role: "guest", joinedAt: "2026-10-01T00:00:00Z" },
  { id: "o2", role: "owner", joinedAt: "2026-10-02T00:00:00Z" },
  { id: "m6", role: "member", joinedAt: "2026-10-05T00:00:00Z" },
]

describe("overflowExcess e priorityPlaces", () => {
  test("quantos passam do limite, nunca negativo", () => {
    expect(overflowExcess({ limit: 5, active: 8 })).toBe(3)
    expect(overflowExcess({ limit: 5, active: 5 })).toBe(0)
    expect(overflowExcess({ limit: 5, active: 2 })).toBe(0)
  })

  test("os lugares escolhíveis são o limite menos os owners, nunca negativo", () => {
    expect(priorityPlaces(5, 2)).toBe(3)
    expect(priorityPlaces(2, 3)).toBe(0)
    expect(priorityPlaces(0, 0)).toBe(0)
  })
})

describe("priorityCandidates", () => {
  test("separa os owners dos candidatos, só ativos, do mais antigo ao mais novo", () => {
    const { owners, candidates } = priorityCandidates(MEMBROS)
    expect(owners.map((m) => m.id)).toEqual(["o1", "o2"])
    expect(candidates.map((m) => m.id)).toEqual(["m2", "m3", "m4", "m5", "m6"])
  })
})

describe("initialPrioritySelection", () => {
  test("null abre vazia", () => {
    expect(initialPrioritySelection(null, MEMBROS)).toEqual([])
    expect(initialPrioritySelection(undefined, MEMBROS)).toEqual([])
  })

  test("tira o owner, o suspenso e quem já saiu, e segue a ordem de entrada", () => {
    expect(initialPrioritySelection(["m6", "o1", "s1", "fora", "m3"], MEMBROS)).toEqual(["m3", "m6"])
  })
})

describe("togglePriority", () => {
  test("marca e desmarca sem repetir", () => {
    expect(togglePriority(["m3"], "m4")).toEqual(["m3", "m4"])
    expect(togglePriority(["m3", "m4"], "m3")).toEqual(["m4"])
  })
})

describe("priorityCount", () => {
  test("conta os owners nos lugares tomados", () => {
    expect(priorityCount(5, 2, 1)).toEqual({ limit: 5, used: 3, places: 3, chosen: 1, over: false, full: false })
  })

  test("cheio quando os escolhidos tomam os lugares; acima, a API recusaria", () => {
    expect(priorityCount(5, 2, 3)).toMatchObject({ full: true, over: false })
    expect(priorityCount(5, 2, 4)).toMatchObject({ full: true, over: true })
  })

  test("com os owners acima do limite, não há lugar para escolher, e a lista vazia vale", () => {
    expect(priorityCount(2, 3, 0)).toMatchObject({ places: 0, full: true, over: false, used: 3 })
  })
})

describe("priorityMemberIds (o corpo do PUT)", () => {
  test("leva todo owner ativo e só os escolhidos que ainda são candidatos", () => {
    expect(priorityMemberIds(MEMBROS, ["m5", "s1", "o2", "m3"])).toEqual(["o1", "o2", "m3", "m5"])
  })

  test("sem escolha, só os owners", () => {
    expect(priorityMemberIds(MEMBROS, [])).toEqual(["o1", "o2"])
  })
})

describe("membersStaying (a prévia do fim do prazo)", () => {
  test("os owners, os escolhidos e, nas vagas que sobram, os mais antigos", () => {
    // limite 5: 2 owners e 3 lugares; escolheu só o m6, sobram 2 para os mais antigos (m2, m3)
    expect([...membersStaying(MEMBROS, ["m6"], 5)].sort()).toEqual(["m2", "m3", "m6", "o1", "o2"])
  })

  test("sem escolha, os mais antigos", () => {
    expect([...membersStaying(MEMBROS, [], 4)].sort()).toEqual(["m2", "m3", "o1", "o2"])
  })

  test("escolhidos acima dos lugares: ficam os mais antigos deles", () => {
    expect([...membersStaying(MEMBROS, ["m6", "m5", "m4"], 4)].sort()).toEqual(["m4", "m5", "o1", "o2"])
  })

  test("os owners ficam mesmo acima do limite, e nenhum outro", () => {
    expect([...membersStaying(MEMBROS, ["m2"], 1)].sort()).toEqual(["o1", "o2"])
  })

  test("o suspenso nunca entra na prévia", () => {
    expect(membersStaying(MEMBROS, ["s1"], 10).has("s1")).toBe(false)
  })
})

describe("memberActions com o suspenso", () => {
  test("o owner remove e troca o papel do suspenso, nunca para owner", () => {
    expect(memberActions("owner", "member", { isSelf: false, ownerCount: 1, suspended: true })).toEqual({
      roleOptions: ["maintainer", "member", "guest"],
      remove: "allowed",
      leave: "hidden",
    })
  })

  test("a maintainer segue a mesma matriz sobre member e guest", () => {
    expect(memberActions("maintainer", "guest", { isSelf: false, ownerCount: 1, suspended: true })).toEqual({
      roleOptions: ["member", "guest"],
      remove: "allowed",
      leave: "hidden",
    })
  })

  test("sem o suspended, o owner continua na lista", () => {
    expect(memberActions("owner", "member", { isSelf: false, ownerCount: 1 }).roleOptions).toContain("owner")
  })
})
