import { describe, expect, test } from "bun:test"

import {
  badCharacter,
  handleReady,
  handleStatus,
  nextSlugOnNameChange,
  normalizeHandle,
  slugIssue,
  suggestSlug,
  usernameIssue,
  workspaceNameIssue,
  type HandleIssue,
} from "./handles"

describe("normalizeHandle", () => {
  test("apara e passa para minúsculas", () => {
    expect(normalizeHandle("  Gui.Teodoro ")).toBe("gui.teodoro")
  })
})

describe("usernameIssue (F1)", () => {
  test.each(["gui", "gui.teodoro", "gui_teodoro", "g1.t2_3", "a".repeat(30), " Gui.Teodoro "])("aceita %p", (v) => {
    expect(usernameIssue(v)).toBeNull()
  })

  test.each([
    ["", "too_short"],
    ["gu", "too_short"],
    ["  gu  ", "too_short"],
    ["a".repeat(31), "too_long"],
    ["1gui", "format"],
    ["_gui", "format"],
    [".gui", "format"],
    ["gui.", "format"],
    ["gui_", "format"],
    ["gui..t", "format"],
    ["gui._t", "format"],
    ["gui__t", "format"],
    ["gui-t", "character"],
    ["gui t", "character"],
    ["joão", "character"],
    ["JOÃO", "character"],
    ["rafael!", "character"],
    ["a".repeat(30) + "!", "too_long"],
    ["!a", "too_short"],
  ])("recusa %p como %p", (v, motivo) => {
    expect(usernameIssue(v)).toBe(motivo as HandleIssue)
  })
})

describe("badCharacter", () => {
  test.each([
    ["username", "JOÃO", "ã"],
    ["username", "jo\u0061\u0303o", "ã"],
    ["username", "gui-t", "-"],
    ["username", "rafael!", "!"],
    ["slug", "acme_labs", "_"],
    ["slug", "rafael!", "!"],
    ["username", "gui.t", null],
    ["slug", "acme-labs", null],
  ] as const)("%p %p → %p", (tipo, v, c) => {
    expect(badCharacter(tipo, v)).toBe(c)
  })
})

describe("slugIssue (F2)", () => {
  test.each(["acme", "acme-labs", "a1-b2-c3", "a".repeat(40), " Acme-Labs "])("aceita %p", (v) => {
    expect(slugIssue(v)).toBeNull()
  })

  test.each([
    ["", "too_short"],
    ["ac", "too_short"],
    ["a".repeat(41), "too_long"],
    ["1acme", "format"],
    ["-acme", "format"],
    ["acme-", "format"],
    ["acme--labs", "format"],
    ["acme_labs", "character"],
    ["acme.labs", "character"],
    ["açaí", "character"],
    ["rafael!", "character"],
  ])("recusa %p como %p", (v, motivo) => {
    expect(slugIssue(v)).toBe(motivo as HandleIssue)
  })
})

describe("handleStatus", () => {
  test("vazio é idle, mesmo com status velho", () => {
    expect(handleStatus("username", "", "taken", "rafael")).toBe("idle")
  })

  test("formato errado é invalid e ignora o app", () => {
    expect(handleStatus("username", "jo", "available", "jo")).toBe("invalid")
  })

  test("o status vale só para o valor que a API respondeu", () => {
    expect(handleStatus("username", "rafael", "available", "rafael")).toBe("available")
    expect(handleStatus("username", "rafaelm", "available", "rafael")).toBe("checking")
    expect(handleStatus("slug", "acme-labs", "taken", "acme")).toBe("checking")
    expect(handleStatus("slug", "acme", "unchecked", "acme")).toBe("unchecked")
  })

  test("sem statusFor, o status vale como veio", () => {
    expect(handleStatus("username", "rafael", "available")).toBe("available")
  })

  test("livre e não conferido liberam o envio", () => {
    expect(handleReady("available")).toBe(true)
    expect(handleReady("unchecked")).toBe(true)
    for (const s of ["idle", "checking", "taken", "reserved", "invalid"] as const) expect(handleReady(s)).toBe(false)
  })
})

describe("workspaceNameIssue (F5)", () => {
  test.each(["A", "Acme Labs", "  Moura & Filhos  ", "🚀".repeat(41), "x".repeat(80), "🚀".repeat(80)])("aceita %p", (v) => {
    expect(workspaceNameIssue(v)).toBeNull()
  })

  test.each([
    ["", "length"],
    ["   ", "length"],
    ["x".repeat(81), "length"],
    ["🚀".repeat(81), "length"],
    ["\u200b", "character"],
    ["Acme\u200bLabs", "character"],
    ["Acme\u0007", "character"],
    ["Acme\ud800", "character"],
  ])("recusa %p como %p", (v, motivo) => {
    expect(workspaceNameIssue(v)).toBe(motivo as "length" | "character")
  })
})

describe("nextSlugOnNameChange (F4)", () => {
  test("vazio segue o nome", () => {
    expect(nextSlugOnNameChange("", "", "Acme")).toBe("acme")
  })

  test("a sugestão do nome anterior segue o nome", () => {
    expect(nextSlugOnNameChange("Acme", "acme", "Acme Labs")).toBe("acme-labs")
  })

  test("slug da pessoa fica", () => {
    expect(nextSlugOnNameChange("Acme", "meu-time", "Acme Labs")).toBe("meu-time")
  })

  test("rascunho restaurado depois da montagem: segue se é a sugestão, fica se não é", () => {
    expect(nextSlugOnNameChange("Moura & Filhos", "moura-filhos", "Moura & Filhas")).toBe("moura-filhas")
    expect(nextSlugOnNameChange("Moura & Filhos", "moura", "Moura & Filhas")).toBe("moura")
  })

  test("o slug apagado volta a seguir o nome", () => {
    expect(nextSlugOnNameChange("Acme", "", "Acme Labs")).toBe("acme-labs")
  })

  test("formulário zerado volta a seguir", () => {
    expect(nextSlugOnNameChange("", "", "N")).toBe("")
    expect(nextSlugOnNameChange("", "", "Novo")).toBe("novo")
  })
})

describe("suggestSlug (F4)", () => {
  test("tira acentos e troca espaço e pontuação por um hífen só", () => {
    expect(suggestSlug("Açaí & Cia — São Paulo")).toBe("acai-cia-sao-paulo")
  })

  test("apara os hífens das pontas", () => {
    expect(suggestSlug("  ...Acme Labs!!  ")).toBe("acme-labs")
  })

  test("corta em 40 e tira o hífen que o corte deixar", () => {
    const nome = "a".repeat(39) + " bcd"
    expect(suggestSlug(nome)).toBe("a".repeat(39))
    expect(suggestSlug("x".repeat(60))).toBe("x".repeat(40))
  })

  test("sai vazia quando começa por dígito", () => {
    expect(suggestSlug("99 Problemas")).toBe("")
  })

  test("sai vazia quando fica curta", () => {
    expect(suggestSlug("Ó")).toBe("")
    expect(suggestSlug("A!")).toBe("")
    expect(suggestSlug("")).toBe("")
  })

  test("o que sugere sempre passa em F2", () => {
    for (const nome of ["Muriki", "Equipe de Produto 2026", "ÉÇÃ", "a-b", "Ünïcödé Lâbs"]) {
      const slug = suggestSlug(nome)
      if (slug) expect(slugIssue(slug)).toBeNull()
    }
  })
})
