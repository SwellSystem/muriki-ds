import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"

import type { HandleStatus } from "@/components/blocks/platform-identity/handles"

import { PlatformInviteeIdentity, type PlatformInviteeIdentityProps } from "./invitee-identity"

const nada = () => {}

function tela(extra: Partial<PlatformInviteeIdentityProps> = {}) {
  return renderToString(
    createElement(PlatformInviteeIdentity, {
      workspaceName: "Moura & Filhos",
      role: "member",
      invitedBy: { name: "Rafael Moura" },
      terms: { checked: true, onChange: nada, links: { terms: "/termos", privacy: "/privacidade" } },
      onSubmit: nada,
      ...extra,
    })
  )
}

function campo(value: string, status: HandleStatus, statusFor: string | undefined = value) {
  return { username: { value, onChange: nada, status, statusFor } }
}

// o <button type="submit"> inteiro, para ler o `disabled`
function botao(html: string) {
  const b = html.match(/<button[^>]*type="submit"[^>]*>/)
  if (!b) throw new Error("sem botão de enviar")
  return b[0]
}
const ligado = (html: string) => !/\sdisabled=""/.test(botao(html))

// o texto sem as tags, para as frases com negrito no meio
const texto = (html: string) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")

describe("PlatformInviteeIdentity: o botão", () => {
  test("liga com o @ livre (available) para o valor da tela e os termos aceitos", () => {
    expect(ligado(tela(campo("renata.moura", "available")))).toBe(true)
  })
  test("liga com o @ não conferido (unchecked): a API confere no envio", () => {
    expect(ligado(tela(campo("renata.moura", "unchecked")))).toBe(true)
  })
  test("não liga com o status de um valor antigo (statusFor diferente do valor)", () => {
    expect(ligado(tela(campo("renata.m", "available", "renata")))).toBe(false)
  })
  test("não liga com o @ ocupado (taken)", () => {
    expect(ligado(tela(campo("renata", "taken")))).toBe(false)
  })
  test("não liga com o @ fora do formato, mesmo com status livre", () => {
    expect(ligado(tela(campo("Renata Moura!", "available")))).toBe(false)
  })
  test("não liga sem os termos", () => {
    expect(
      ligado(tela({ ...campo("renata.moura", "available"), terms: { checked: false, onChange: nada, links: { terms: "#", privacy: "#" } } }))
    ).toBe(false)
  })
  test("não liga enquanto envia (submitting)", () => {
    expect(ligado(tela({ ...campo("renata.moura", "available"), submitting: true }))).toBe(false)
  })
})

describe("PlatformInviteeIdentity: a frase do palco", () => {
  test("com o @ livre, o lugar espera pelo @", () => {
    expect(texto(tela(campo("renata.moura", "available")))).toContain("Um lugar no time está esperando por @renata.moura.")
  })
  test("fora disso, o lugar espera por você", () => {
    for (const c of [campo("renata", "taken"), campo("renata.moura", "unchecked"), campo("renata.m", "available", "renata")]) {
      const t = texto(tela(c))
      expect(t).toContain("Um lugar no time está esperando por você.")
      expect(t).not.toContain("esperando por @")
    }
  })
})

describe("PlatformInviteeIdentity: existingUsername", () => {
  const html = tela({ existingUsername: "renata" })
  test("sem o campo do @", () => {
    expect(html).not.toContain('data-slot="handle-field"')
  })
  test("o título dos termos, o @ no subtítulo e no palco", () => {
    const t = texto(html)
    expect(t).toContain("Quase lá: aceite os termos do Platform")
    expect(t).not.toContain("escolha seu @usuário")
    expect(t).toContain("Depois disso, você entra no Moura & Filhos como Member, com a sua conta @renata.")
    expect(t).toContain("Um lugar no time está esperando por @renata.")
  })
  test("o botão só depende dos termos", () => {
    expect(ligado(html)).toBe(true)
    expect(ligado(tela({ existingUsername: "renata", terms: { checked: false, onChange: nada, links: { terms: "#", privacy: "#" } } }))).toBe(false)
  })
  test("tem precedência sobre username", () => {
    const t = texto(tela({ existingUsername: "renata", ...campo("outro", "taken") }))
    expect(t).toContain("Quase lá: aceite os termos do Platform")
    expect(t).toContain("esperando por @renata.")
  })
  test("sem username e sem existingUsername é erro de uso", () => {
    expect(() => tela()).toThrow(/username/)
  })
  test("sem existingUsername, o campo aparece, o título é o do @ e o subtítulo não fala de conta", () => {
    const html = tela(campo("renata.moura", "available"))
    expect(html).toContain('data-slot="handle-field"')
    const t = texto(html)
    expect(t).toContain("Quase lá: escolha seu @usuário")
    expect(t).toContain("Depois disso, você entra no Moura & Filhos como Member.")
  })
})

describe("PlatformInviteeIdentity: o passo", () => {
  test("1 de 1 por padrão", () => {
    expect(texto(tela(campo("renata.moura", "available")))).toContain("Primeiro acesso · 1 de 1")
  })
  test("2 de 2 depois do código", () => {
    expect(texto(tela({ ...campo("renata.moura", "available"), step: 2, total: 2 }))).toContain("Primeiro acesso · 2 de 2")
  })
})
