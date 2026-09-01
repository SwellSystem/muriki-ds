// Runtime mínimo de labels dos blocks: defaults pt-BR embutidos, sem
// dependência de i18next. Apps com i18n injetam o próprio `t` (assinatura
// compatível com react-i18next) via <MurikiI18nProvider t={t}>.
import * as React from "react"

export type TranslateFn = (
  key: string,
  params?: Record<string, unknown>
) => string

const STRINGS: Record<string, unknown> = {
  composer: {
    placeholder: "Mensagem para Muriki…",
    send: "Enviar",
    stop: "Parar",
    attach: "Anexar arquivo",
    voice: "Gravar áudio",
    settings: "Configurações",
    streaming_hint: "Pensando…",
    keyboard_hint: "⌘ + ↵ para enviar",
    retry: "Tentar novamente",
    remove_attachment: "Remover anexo",
  },
  task_table: {
    search_placeholder: "Buscar tasks, subtasks, responsáveis…",
    filter: {
      status_label: "Status",
      status_value_active: "Ativas",
      group_label: "Agrupar",
      group_value_none: "Nenhum",
      sort_label: "Ordenar",
      sort_value_priority: "Prioridade",
    },
    cta_new_task: "Nova task",
    column: {
      task: "Task",
      owner: "Responsável",
      status: "Status",
      priority: "Prioridade",
      subtasks: "Subtasks",
      due: "Prazo",
    },
    status: {
      active: "Aberta",
      progress: "Em progresso",
      blocked: "Bloqueada",
      done: "Concluído",
    },
    priority: {
      urgent: "Urgente",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
      none: "—",
    },
    row_action: {
      add_subtask: "Adicionar subtask",
      edit: "Editar",
      more: "Mais opções",
      unblock: "Desbloquear",
      complete: "Concluir",
      cancel: "Cancelar task",
    },
    select_row: "Selecionar task",
    select_all: "Selecionar todas",
    toggle_done: "Concluir tarefa",
    toggle_reopen: "Reabrir tarefa",
    expand_group: "Expandir grupo",
    collapse_group: "Recolher grupo",
    summary_zero: "Nenhuma selecionada · {{tasks}} tasks · {{subtasks}} subtasks",
    summary_one: "{{count}} selecionada · {{tasks}} tasks · {{subtasks}} subtasks",
    summary_other:
      "{{count}} selecionadas · {{tasks}} tasks · {{subtasks}} subtasks",
    pagination_previous: "Página anterior",
    pagination_next: "Próxima página",
    progress_count: "{{done}}/{{total}}",
  },
  task_timeline: {
    search_placeholder: "Buscar tasks, subtasks, responsáveis…",
    filter: {
      status_label: "Status",
      status_value_active: "Ativas",
      group_label: "Agrupar",
      group_value_epic: "Epic",
      sort_label: "Ordenar",
      sort_value_start: "Início",
    },
    cta_new_task: "Nova task",
    today_jump: "Hoje",
    zoom: {
      week: "Sem",
      day: "Dias",
      month: "Mês",
    },
    column_task: "Task",
    column_due: "Prazo",
    legend: {
      progress: "Em progresso",
      active: "Aberta",
      blocked: "Bloqueada",
      epic: "Epic",
      milestone: "Marco",
    },
    previous_period: "Período anterior",
    next_period: "Próximo período",
    expand_group: "Expandir grupo",
    collapse_group: "Recolher grupo",
  },
}

function lookup(key: string): string | undefined {
  let node: unknown = STRINGS
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === "string" ? node : undefined
}

function interpolate(
  template: string,
  params?: Record<string, unknown>
): string {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}

export const defaultTranslate: TranslateFn = (key, params) => {
  let template = lookup(key)
  if (template === undefined && params && typeof params.count === "number") {
    const suffix =
      params.count === 0 ? "zero" : params.count === 1 ? "one" : "other"
    template = lookup(`${key}_${suffix}`) ?? lookup(`${key}_other`)
  }
  return template !== undefined ? interpolate(template, params) : key
}

const TranslateContext = React.createContext<TranslateFn>(defaultTranslate)

export interface MurikiI18nProviderProps {
  /** `t` compatível com react-i18next (namespace "blocks"). */
  t: TranslateFn
  children: React.ReactNode
}

export function MurikiI18nProvider({ t, children }: MurikiI18nProviderProps) {
  return (
    <TranslateContext.Provider value={t}>{children}</TranslateContext.Provider>
  )
}

export function useTranslate(): TranslateFn {
  return React.useContext(TranslateContext)
}
