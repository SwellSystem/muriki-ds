// Chão de rótulos do muriki-ds-ai.
//
// O @muriki/i18n devolve A PRÓPRIA CHAVE quando não conhece a string, e o
// STRINGS dele nasceu antes destes blocos — de tudo que a conversa precisa,
// só o namespace `composer` já mora lá. Sem um chão, uma tela recém-instalada
// mostraria "ai.message.copy" no lugar de "Copiar", e um bloco que só
// funciona depois que você edita o i18n do sistema não é um bloco, é uma
// pendência.
//
// A regra é uma só: o `t` do app GANHA quando responde; o default entra
// quando ele devolve a chave crua. Quem já tem i18n não perde nada, quem não
// tem instala e usa. As chaves de `composer` abaixo são cópia fiel do que já
// está no i18n — o bloco se comporta igual com ou sem provider.
import { useTranslate } from "@/lib/i18n"

export const AI_STRINGS: Record<string, string> = {
  "composer.placeholder": "Mensagem para Muriki…",
  "composer.send": "Enviar",
  "composer.stop": "Parar",
  "composer.attach": "Anexar arquivo",
  "composer.voice": "Gravar áudio",
  "composer.settings": "Configurações",
  "composer.streaming_hint": "Pensando…",
  "composer.keyboard_hint": "⌘ + ↵ para enviar",
  "composer.retry": "Tentar novamente",
  "composer.remove_attachment": "Remover anexo",

  "ai.role.user": "Você",
  "ai.role.assistant": "Muriki",
  "ai.message.copy": "Copiar resposta",
  "ai.message.copied": "Copiado",
  "ai.message.retry": "Gerar de novo",
  "ai.message.good": "Boa resposta",
  "ai.message.bad": "Resposta ruim",
  "ai.message.edit": "Editar mensagem",
  "ai.message.error": "A resposta foi interrompida.",

  "ai.reasoning.thinking": "Pensando…",
  "ai.reasoning.done": "Raciocínio",
  "ai.reasoning.duration": "{{seconds}}s",
  "ai.reasoning.expand": "Ver o raciocínio",
  "ai.reasoning.collapse": "Esconder o raciocínio",

  "ai.tool.running": "Executando",
  "ai.tool.done": "Concluído",
  "ai.tool.error": "Falhou",
  "ai.tool.input": "Entrada",
  "ai.tool.output": "Saída",
  "ai.tool.expand": "Ver a chamada",
  "ai.tool.collapse": "Esconder a chamada",

  "ai.thread.empty_title": "Comece a conversa",
  "ai.thread.empty_hint": "Pergunte, cole um trecho ou peça para quebrar uma task.",
  "ai.thread.to_bottom": "Ir para a última mensagem",
}

function interpolate(template: string, params?: Record<string, unknown>) {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}

export type AiLabelFn = (
  key: string,
  params?: Record<string, unknown>
) => string

/**
 * `t` do sistema com o chão do muriki-ds-ai atrás. Use em todo bloco de AI
 * no lugar do `useTranslate` cru.
 */
export function useAiLabel(): AiLabelFn {
  const t = useTranslate()
  return (key, params) => {
    const fromApp = t(key, params)
    // O i18n só devolve a chave quando não achou a string — é o sinal de
    // "não sei", e é exatamente aí que o default entra.
    if (fromApp !== key) return fromApp
    const fallback = AI_STRINGS[key]
    return fallback === undefined ? key : interpolate(fallback, params)
  }
}
