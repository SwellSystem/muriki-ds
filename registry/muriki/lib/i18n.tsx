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
  priority_flag: {
    none: "Sem prioridade",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  },
  task_modal: {
    a11y_title: "Criar task",
    a11y_description: "Formulário de criação de task, com título, propriedades e descrição.",
    context_default: "Focus",
    new_task: "Nova task",
    properties: "Propriedades",
    create: "Criar task",
    cancel: "Cancelar",
    create_more: "Criar mais",
    title_label: "Título da task",
    title_placeholder: "O que precisa ser feito?",
    priority: { none: "Sem prioridade" },
    mode: {
      group: "Modo de apresentação",
      central: "Central",
      drawer: "Painel lateral",
      full: "Tela cheia",
    },
    slug: {
      pending: "sem ID",
      pending_hint: "O ID é atribuído quando a task é criada.",
      hint: "Identificador da task",
    },
    props: {
      status: "Status",
      status_required: "Escolha um status",
      priority: "Prioridade",
      assignees: "Responsáveis",
      no_people: "Ninguém disponível",
      start: "Início",
      due: "Prazo",
      project: "Projeto",
      choose_project: "Escolher projeto",
      no_projects: "Nenhum projeto",
      tags: "Etiquetas",
      add_tags: "Adicionar etiquetas",
      no_tags: "Nenhuma etiqueta",
      points: "Pontos",
      points_value: "{{points}} pontos",
      empty: "Vazio",
    },
    description: {
      label: "Descrição",
      placeholder: "Escreva o que precisa ser feito, o porquê e o que fica de fora…",
      hint: "A barra de formatação chega com o editor de blocos.",
      bold: "Negrito",
      italic: "Itálico",
      list: "Lista",
      checklist: "Checklist",
      code: "Código",
      link: "Link",
      mention: "Mencionar alguém",
    },
    subtasks: {
      title: "Subtasks",
      add_placeholder: "Adicionar subtask e pressionar Enter",
      mark_done: "Marcar como concluída",
      mark_undone: "Reabrir",
      remove: "Remover subtask",
    },
    attachments: {
      title: "Anexos",
      cta: "Escolher arquivos",
      drop_hint: "Arraste arquivos aqui ou",
      constraints: "Até 25 MB por arquivo.",
      remove: "Remover anexo",
    },
    quick_add: {
      placeholder: "Nova task… descreva em uma linha",
      add_details: "Abrir detalhes",
      ai_split: "Quebrar em subtasks",
      set_due: "Definir prazo",
      clear_due: "Limpar prazo",
      close_aria: "Fechar criação rápida",
      esc_hint: "Esc para fechar · ⌘↵ para criar",
    },
  },
  password_strength: {
    meter: "Força da senha",
    requirements: "Requisitos da senha",
    weak: "Fraca",
    medium: "Média",
    strong: "Forte",
    "very-strong": "Muito forte",
    // Rótulos curtos: os requisitos são uma fileira só embaixo da barra,
    // e a frase inteira ("Pelo menos 1 número") quebraria em duas linhas.
    requirement: {
      length: "8 caracteres",
      number: "1 número",
      lowercase: "1 minúscula",
      uppercase: "1 maiúscula",
    },
  },
  login: {
    brand_index: "muriki / 01",
    section_access: "Acesso",
    pitch_line1: "Notas viram tarefas,",
    pitch_line2: "equipes viram tribos",
    pitch_description:
      "Colaboração natural para equipes que fluem. Organize tarefas, crie calendários e transforme anotações em ações concretas.",
    footer_copyright: "© {{year}} Muriki — Todos os direitos",
    hero_line1: "Bem-vindo",
    hero_line2: "de volta.",
    subtitle: "Não tem uma conta?",
    create_account_link: "Crie uma conta aqui",
    section_signin_with: "Entrar com",
    section_or: "ou email",
    email_label: "Email",
    email_placeholder: "seu@email.com",
    email_invalid: "Digite um email válido",
    password_label: "Senha",
    password_placeholder: "Sua senha",
    password_min_length: "A senha deve ter no mínimo {{min}} caracteres",
    forgot_password: "Esqueci a senha",
    show_password: "Mostrar senha",
    hide_password: "Esconder senha",
    remember_me: "Lembrar de mim",
    submit: "Entrar",
    submitting: "Entrando...",
    invalid_credentials:
      "Email ou senha incorretos. Verifique os dados e tente novamente.",
    failed: "Não foi possível entrar. Tente novamente.",
    busy: "Preparando seu workspace...",
    totp: {
      title: "Verificação em duas etapas",
      description: "Abra seu app autenticador e informe o código temporário.",
      code_label: "Código",
      code_placeholder: "123456",
      code_invalid: "Informe um código válido do app autenticador.",
      trust_device: "Confiar neste dispositivo por 30 dias",
      back_to_password: "Voltar para senha",
      verify_submit: "Verificar código",
      verifying: "Verificando...",
    },
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
