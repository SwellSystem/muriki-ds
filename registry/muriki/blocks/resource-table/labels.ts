// Chão de rótulos do resource-table — o mesmo acordo do ai-labels.
//
// O `t` do app GANHA quando responde; o default pt-BR entra quando ele
// devolve a chave crua. Assim o bloco instala e funciona sem ninguém editar o
// i18n do sistema, e quem tem i18n traduz pelas mesmas chaves.
import { useTranslate } from "@/lib/i18n"

export const RESOURCE_STRINGS: Record<string, string> = {
  "resource.search": "Buscar",
  "resource.select_all": "Selecionar todas as linhas",
  "resource.select_row": "Selecionar linha",
  "resource.row_actions": "Ações da linha",
  "resource.more_actions": "Mais ações",
  "resource.selected_one": "1 selecionado",
  "resource.selected_other": "{{count}} selecionados",
  "resource.clear_selection": "Limpar seleção",
  "resource.sort_asc": "Ordenado do menor para o maior",
  "resource.sort_desc": "Ordenado do maior para o menor",
  "resource.empty_title": "Nada por aqui",
  "resource.empty_hint": "Ajuste a busca ou os filtros, ou crie o primeiro.",
  "resource.range": "{{from}}–{{to}} de {{total}}",
  "resource.range_empty": "0 de {{total}}",
  "resource.pagination": "Paginação",
  "resource.per_page": "Por página",
  "resource.previous_page": "Página anterior",
  "resource.next_page": "Próxima página",
  "resource.page": "Página {{page}}",
  "resource.previous": "Anterior",
  "resource.next": "Próxima",
  "resource.cancel": "Cancelar",
  "resource.save": "Salvar",
  "resource.saving": "Salvando…",
  "resource.confirm": "Confirmar",
  "resource.confirming": "Aguarde…",
}

function interpolate(template: string, params?: Record<string, unknown>) {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}

export type ResourceLabelFn = (key: string, params?: Record<string, unknown>) => string

/** `t` do sistema com o chão do resource-table atrás. */
export function useResourceLabel(): ResourceLabelFn {
  const t = useTranslate()
  return (key, params) => {
    const fromApp = t(key, params)
    if (fromApp !== key) return fromApp
    let fallback = RESOURCE_STRINGS[key]
    if (fallback === undefined && params && typeof params.count === "number") {
      fallback = RESOURCE_STRINGS[`${key}_${params.count === 1 ? "one" : "other"}`]
    }
    return fallback === undefined ? key : interpolate(fallback, params)
  }
}

/** Número no formato do idioma do documento, com separador de milhar. */
export function formatCount(n: number) {
  const lang = typeof document !== "undefined" ? document.documentElement.lang || undefined : undefined
  return new Intl.NumberFormat(lang).format(n)
}
