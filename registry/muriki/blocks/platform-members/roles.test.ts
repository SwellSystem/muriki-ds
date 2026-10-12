import { describe, expect, test } from "bun:test"

import {
  INVITE_PARSE_MAX,
  calendarDaysFrom,
  formatCalendarDays,
  invitableRoles,
  invitationActions,
  invitationState,
  inviteRoleFor,
  inviteRowsToSend,
  isInviteEmail,
  managesInvitation,
  memberActions,
  normalizeInviteRows,
  parseInviteEmails,
  type MemberActions,
  type WorkspaceRole,
} from "./roles"

const NADA: MemberActions = { roleOptions: [], remove: "hidden", leave: "hidden" }
const GERE_TUDO: MemberActions = { roleOptions: ["owner", "maintainer", "member", "guest"], remove: "allowed", leave: "hidden" }
const GERE_BASE: MemberActions = { roleOptions: ["member", "guest"], remove: "allowed", leave: "hidden" }

// F6: um caso por par (quem vê × o alvo), com dois owners no workspace (o alvo owner não é o último)
const PARES: [WorkspaceRole, WorkspaceRole, MemberActions][] = [
  ["owner", "owner", GERE_TUDO],
  ["owner", "maintainer", GERE_TUDO],
  ["owner", "member", GERE_TUDO],
  ["owner", "guest", GERE_TUDO],
  ["maintainer", "owner", NADA],
  ["maintainer", "maintainer", NADA],
  ["maintainer", "member", GERE_BASE],
  ["maintainer", "guest", GERE_BASE],
  ["member", "owner", NADA],
  ["member", "maintainer", NADA],
  ["member", "member", NADA],
  ["member", "guest", NADA],
  ["guest", "owner", NADA],
  ["guest", "maintainer", NADA],
  ["guest", "member", NADA],
  ["guest", "guest", NADA],
]

describe("memberActions (F6): quem vê × o alvo", () => {
  test.each(PARES)("%p vendo %p", (quemVe, alvo, esperado) => {
    expect(memberActions(quemVe, alvo, { isSelf: false, ownerCount: 2 })).toEqual(esperado)
  })
})

describe("memberActions (F6): a própria linha", () => {
  test.each(["owner", "maintainer", "member", "guest"] as const)("%p só pode sair, sem trocar o papel", (papel) => {
    expect(memberActions(papel, papel, { isSelf: true, ownerCount: 2 })).toEqual({
      roleOptions: [],
      remove: "hidden",
      leave: "allowed",
    })
  })
})

describe("memberActions (F6): o último owner", () => {
  test("sair sendo o único owner aparece desligado, com o motivo", () => {
    expect(memberActions("owner", "owner", { isSelf: true, ownerCount: 1 })).toEqual({
      roleOptions: [],
      remove: "hidden",
      leave: "last_owner",
    })
  })

  test("com outro owner, o owner sai", () => {
    expect(memberActions("owner", "owner", { isSelf: true, ownerCount: 2 }).leave).toBe("allowed")
  })

  test("remover o último owner aparece desligado e o papel dele não troca", () => {
    expect(memberActions("owner", "owner", { isSelf: false, ownerCount: 1 })).toEqual({
      roleOptions: [],
      remove: "last_owner",
      leave: "hidden",
    })
  })

  test("quem não gere owner não vê nem o caso do último owner", () => {
    expect(memberActions("maintainer", "owner", { isSelf: false, ownerCount: 1 })).toEqual(NADA)
  })

  test("o último owner não trava a linha de quem não é owner", () => {
    expect(memberActions("owner", "member", { isSelf: false, ownerCount: 1 })).toEqual(GERE_TUDO)
  })
})

describe("invitableRoles (F6): ninguém convida owner", () => {
  test.each([
    ["owner", ["maintainer", "member", "guest"]],
    ["maintainer", ["member", "guest"]],
    ["member", []],
    ["guest", []],
  ] as const)("%p convida %p", (papel, esperado) => {
    expect(invitableRoles(papel)).toEqual([...esperado])
  })
})

describe("invitationState e invitationActions (F7)", () => {
  const agora = new Date("2026-10-12T12:00:00Z")

  test("pendente dentro do prazo", () => {
    expect(invitationState({ status: "pending", expiresAt: "2026-10-15T12:00:00Z" }, agora)).toBe("pending")
  })

  test("vencido é um pendente com expiresAt no passado", () => {
    expect(invitationState({ status: "pending", expiresAt: "2026-10-12T11:59:59Z" }, agora)).toBe("expired")
  })

  test.each(["accepted", "revoked", "superseded"] as const)("%p não vence: fica como veio", (status) => {
    expect(invitationState({ status, expiresAt: "2026-10-01T00:00:00Z" }, agora)).toBe(status)
  })

  test.each([
    ["pending", { resend: true, revoke: true }],
    ["expired", { resend: true, revoke: true }],
    ["accepted", { resend: false, revoke: false }],
    ["revoked", { resend: false, revoke: false }],
    ["superseded", { resend: false, revoke: false }],
  ] as const)("%p: ações %p", (estado, esperado) => {
    expect(invitationActions(estado, { viewerRole: "owner", invitationRole: "member" })).toEqual(esperado)
  })
})

describe("managesInvitation e invitationActions (F6): quem vê o convite", () => {
  test.each([
    ["owner", "maintainer", true],
    ["owner", "member", true],
    ["owner", "guest", true],
    ["maintainer", "maintainer", false],
    ["maintainer", "member", true],
    ["maintainer", "guest", true],
    ["member", "member", false],
    ["member", "guest", false],
    ["guest", "guest", false],
  ] as const)("%p gere convite de %p: %p", (quemVe, papel, esperado) => {
    expect(managesInvitation(quemVe, papel)).toBe(esperado)
    expect(invitationActions("pending", { viewerRole: quemVe, invitationRole: papel })).toEqual({ resend: esperado, revoke: esperado })
  })

  test("a maintainer não reenvia nem revoga o convite vencido de outra maintainer", () => {
    expect(invitationActions("expired", { viewerRole: "maintainer", invitationRole: "maintainer" })).toEqual({ resend: false, revoke: false })
  })
})

describe("calendarDaysFrom e formatCalendarDays: o prazo do convite", () => {
  // datas locais: o teste vale em qualquer fuso
  const agora = new Date(2026, 9, 12, 9, 0)

  test.each([
    [new Date(2026, 9, 12, 23, 59), 0],
    [new Date(2026, 9, 12, 0, 1), 0],
    [new Date(2026, 9, 13, 0, 30), 1],
    [new Date(2026, 9, 11, 23, 30), -1],
    [new Date(2026, 9, 19, 9, 0), 7],
    [new Date(2026, 9, 8, 9, 0), -4],
  ])("%p está a %p dias", (data, esperado) => {
    expect(calendarDaysFrom(data, agora)).toBe(esperado)
  })

  test("na virada do dia: 1 hora depois já é amanhã, 1 hora antes ainda é hoje", () => {
    const tarde = new Date(2026, 9, 12, 23, 30)
    expect(calendarDaysFrom(new Date(2026, 9, 13, 0, 30), tarde)).toBe(1)
    expect(calendarDaysFrom(new Date(2026, 9, 12, 22, 30), tarde)).toBe(0)
  })

  test.each([
    ["pt-BR", 3, "em 3 dias"],
    ["pt-BR", 1, "em 1 dia"],
    ["pt-BR", -1, "há 1 dia"],
    ["pt-BR", -4, "há 4 dias"],
    ["en-US", 3, "in 3 days"],
    ["en-US", 1, "in 1 day"],
    ["en-US", -1, "1 day ago"],
    ["en-US", -4, "4 days ago"],
    ["es-ES", 3, "dentro de 3 días"],
    ["es-ES", 1, "dentro de 1 día"],
    ["es-ES", -1, "hace 1 día"],
    ["es-ES", -4, "hace 4 días"],
  ] as const)("%p, %p dias: %p (sempre com número, nunca amanhã/ontem)", (locale, dias, esperado) => {
    expect(formatCalendarDays(dias, locale)).toBe(esperado)
  })
})

describe("inviteRoleFor (F6): o papel que a linha pode levar", () => {
  test.each([
    ["owner", "owner", "member"],
    ["owner", "maintainer", "maintainer"],
    ["owner", "guest", "guest"],
    ["maintainer", "owner", "member"],
    ["maintainer", "maintainer", "member"],
    ["maintainer", "guest", "guest"],
    ["member", "member", null],
    ["guest", "member", null],
  ] as const)("%p convidando com %p: %p", (quemVe, papel, esperado) => {
    expect(inviteRoleFor(quemVe, papel)).toBe(esperado)
  })
})

describe("normalizeInviteRows e inviteRowsToSend (F6): o papel saneado", () => {
  const linhas = [
    { email: "ana@moura.dev", role: "owner" as WorkspaceRole },
    { email: "bia@moura.dev", role: "maintainer" as WorkspaceRole },
    { email: "carlos@", role: "guest" as WorkspaceRole },
    { email: "du@moura.dev", role: "guest" as WorkspaceRole },
  ]

  test("owner: o owner recebido vira Member; maintainer e guest ficam", () => {
    expect(normalizeInviteRows(linhas, "owner").map((r) => r.role)).toEqual(["member", "maintainer", "guest", "guest"])
  })

  test("maintainer: owner e maintainer viram Member", () => {
    expect(normalizeInviteRows(linhas, "maintainer").map((r) => r.role)).toEqual(["member", "member", "guest", "guest"])
  })

  test.each(["member", "guest"] as const)("%p não convida ninguém: nenhuma linha", (papel) => {
    expect(normalizeInviteRows(linhas, papel)).toEqual([])
    expect(inviteRowsToSend(linhas, papel)).toEqual([])
  })

  test("o envio nunca leva owner, nem maintainer quando quem vê é maintainer; o inválido fica de fora", () => {
    expect(inviteRowsToSend(linhas, "maintainer")).toEqual([
      { email: "ana@moura.dev", role: "member" },
      { email: "bia@moura.dev", role: "member" },
      { email: "du@moura.dev", role: "guest" },
    ])
    expect(inviteRowsToSend(linhas, "owner").some((r) => r.role === "owner")).toBe(false)
  })

  test("a linha com erro da API fica de fora do envio", () => {
    expect(inviteRowsToSend(linhas, "owner", { "bia@moura.dev": "já faz parte do workspace" }).map((r) => r.email)).toEqual([
      "ana@moura.dev",
      "du@moura.dev",
    ])
  })
})

describe("parseInviteEmails: o que a pessoa cola", () => {
  test("vírgula, ponto e vírgula, espaço e linha", () => {
    expect(parseInviteEmails("ana@moura.dev, joao@moura.dev;bia@moura.dev\ncarlos@moura.dev\tdu@moura.dev  eva@moura.dev")).toEqual([
      "ana@moura.dev",
      "joao@moura.dev",
      "bia@moura.dev",
      "carlos@moura.dev",
      "du@moura.dev",
      "eva@moura.dev",
    ])
  })

  test("o “Nome <email>” dos clientes de e-mail", () => {
    expect(parseInviteEmails('Ana Souza <ana@moura.dev>, "Moura, João" <joao@moura.dev>\nbia@moura.dev')).toEqual([
      "ana@moura.dev",
      "joao@moura.dev",
      "bia@moura.dev",
    ])
  })

  test("minúsculas e sem repetição, ficando a primeira", () => {
    expect(parseInviteEmails("Ana@Moura.dev ana@moura.dev ANA@MOURA.DEV bia@moura.dev")).toEqual(["ana@moura.dev", "bia@moura.dev"])
  })

  test("vazio, só separadores e o ponto final da frase", () => {
    expect(parseInviteEmails("")).toEqual([])
    expect(parseInviteEmails(" ,; \n ")).toEqual([])
    expect(parseInviteEmails("convide ana@moura.dev.")).toEqual(["convide", "ana@moura.dev"])
  })

  test("o inválido não some: vira uma linha para a pessoa ver", () => {
    expect(parseInviteEmails("ana@moura.dev carlos@")).toEqual(["ana@moura.dev", "carlos@"])
  })

  test("o separador dentro de aspas e de <> não corta, e vários Nome <email> na mesma linha", () => {
    expect(parseInviteEmails('"Souza; Ana" <ana@moura.dev> Bia <bia@moura.dev>; du@moura.dev')).toEqual([
      "ana@moura.dev",
      "bia@moura.dev",
      "du@moura.dev",
    ])
  })

  test("o < sem fechar no fim vira o e-mail", () => {
    expect(parseInviteEmails("Ana <ana@moura.dev")).toEqual(["ana@moura.dev"])
  })

  test(`para em ${INVITE_PARSE_MAX} e-mails`, () => {
    const texto = Array.from({ length: INVITE_PARSE_MAX + 50 }, (_, i) => `p${i}@moura.dev`).join(" ")
    expect(parseInviteEmails(texto)).toHaveLength(INVITE_PARSE_MAX)
  })

  test("linear: 20.000 endereços separados por espaço em menos de 50 ms", () => {
    const texto = Array.from({ length: 20_000 }, (_, i) => `pessoa${i}@moura.dev`).join(" ")
    const inicio = performance.now()
    parseInviteEmails(texto)
    expect(performance.now() - inicio).toBeLessThan(50)
  })

  test.each([
    ["aspas sem fechar", '"'.repeat(1) + "a".repeat(200_000)],
    ["< sem fechar", "<".repeat(1) + "a,".repeat(100_000)],
    ["nomes sem e-mail", "Nome ".repeat(40_000) + "<ana@moura.dev>"],
    ["pontas", ".".repeat(100_000) + "a" + ".".repeat(100_000)],
  ])("linear no pior caso (%p) em menos de 50 ms", (_, texto) => {
    const inicio = performance.now()
    parseInviteEmails(texto)
    expect(performance.now() - inicio).toBeLessThan(50)
  })
})

describe("isInviteEmail", () => {
  test.each(["ana@moura.dev", "joao.silva+time@empresa.com.br", "a@b.co"])("aceita %p", (v) => {
    expect(isInviteEmail(v)).toBe(true)
  })

  test.each(["", "carlos@", "@moura.dev", "ana@moura", "ana moura@x.com", "ana@@moura.dev", "ana@moura.dev.", `${"a".repeat(250)}@x.com`])(
    "recusa %p",
    (v) => {
      expect(isInviteEmail(v)).toBe(false)
    }
  )
})
