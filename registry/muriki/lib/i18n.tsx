"use client"

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
  account: {
    save: "Salvar alterações",
    discard: "Descartar",
    cancel: "Cancelar",
    profile: {
      title: "Dados pessoais",
      description: "Valem para a sua conta Muriki inteira, no Code e no Platform.",
      display_name: "Como quer ser chamado",
      full_name: "Nome completo",
      phone: "Telefone",
      optional: "opcional",
      phone_placeholder: "(11) 91234-5678",
      phone_hint: "O atual termina em {{last}}. Para trocar, digite o novo.",
      phone_none: "Nenhum telefone cadastrado.",
      phone_remove: "Remover telefone",
      phone_keep: "Manter o telefone",
      phone_removing: "O telefone será removido ao salvar.",
      cpf: "CPF",
      cpf_hint: "O CPF não muda por aqui: é um teste grátis do Pro por CPF. Está errado? Fale com o suporte.",
    },
    email: {
      title: "Email",
      description: "É com ele que você entra e recebe os avisos da conta.",
      verified: "Verificado",
      change: "Trocar email",
      new: "Email novo",
      new_placeholder: "voce@exemplo.com",
      change_hint: "Antes, pedimos a sua senha. Se o email puder ser usado, mandamos um link para ele, que vale por 30 minutos. Até você abrir, nada muda.",
      send_link: "Enviar link",
      pending: "Aguardando a confirmação em",
      pending_hint: "O link vale até {{until}}. Ao abrir, todas as sessões caem e você entra com o email novo.",
      cancel_change: "Cancelar troca",
      resend: "Reenviar link",
    },
    step_up: {
      title: "Confirme que é você",
      description: "Esta ação é sensível. A confirmação vale por 5 minutos.",
      password: "Senha",
      code: "Código do app",
      use_code: "Usar o código do app",
      use_password: "Usar a senha",
      confirm: "Confirmar",
    },
    password: {
      title: "Senha",
      description: "Trocar a senha encerra as suas outras sessões.",
      current: "Senha atual",
      new: "Senha nova",
      new_placeholder: "Pelo menos 12 caracteres",
      rule: "De 12 a 128 caracteres, fora de vazamentos conhecidos.",
      submit: "Trocar senha",
    },
    two_factor: {
      title: "Verificação em duas etapas",
      description: "Ao entrar, além da senha, um código do app autenticador.",
      app: "App autenticador",
      enabled_at: "Ativada em {{date}}",
      on: "Ativa",
      off: "Desligada",
      regenerate: "Gerar códigos de backup novos",
      regenerate_hint: "Os códigos novos substituem os antigos, que param de valer.",
      disable: "Desligar",
      enable: "Ativar",
      enable_hint: "Pedimos a sua senha, você escaneia o QR no app e recebe dez códigos de backup, que aparecem uma vez só.",
      enable_title: "Ativar a verificação em duas etapas",
      step_password: "Confirmar que é você",
      step_scan: "Ligar o app",
      step_codes: "Guardar os códigos",
      step_password_hint: "Digite a sua senha para começar.",
      step_scan_hint: "Escaneie com o app autenticador, como o Google Authenticator, o 1Password ou o Authy. Depois, digite o código de 6 dígitos que o app mostra.",
      step_codes_hint: "Estes dez códigos entram quando você estiver sem o app. Cada um vale uma vez, e esta é a única vez que aparecem.",
      continue: "Continuar",
      activate: "Ativar",
      qr_label: "QR code para o app autenticador",
      manual_key: "Não dá para escanear? Digite a chave:",
    },
    recovery: {
      list: "Códigos de backup",
      download_pdf: "Baixar PDF",
      copy: "Copiar",
      saved: "Guardei os códigos num lugar seguro",
      done: "Concluir",
      new_hint: "Os antigos já não valem. Guarde estes: cada um vale uma vez, e esta é a única vez que aparecem.",
    },
    passkeys: {
      title: "Passkeys",
      description: "Entrar com a digital, o rosto ou uma chave de segurança, sem senha nem código.",
      add: "Adicionar passkey",
      add_hint: "A passkey fica guardada no aparelho ou na chave, e só você destrava.",
      empty: "Nenhuma passkey ainda.",
      unnamed: "Passkey sem nome",
      synced: "Sincronizada entre aparelhos",
      this_device: "Só neste aparelho",
      created_at: "Criada em {{date}}",
      rename: "Renomear",
      remove: "Remover",
      name: "Nome",
      name_hint: "Para você reconhecer depois. Dá para mudar.",
      save_name: "Salvar nome",
      where: "Onde guardar",
      platform: "Neste aparelho",
      platform_hint: "Touch ID, Face ID ou Windows Hello. Sincroniza pelo iCloud ou pelo Google, se estiver ligado.",
      key: "Chave de segurança",
      key_hint: "Uma chave física, como a YubiKey, pela USB ou por NFC.",
      create: "Criar passkey",
      browser_title: "Siga o seu navegador",
      browser_hint: "O navegador abriu a janela da passkey. Confirme com a digital, o rosto ou tocando na chave.",
      done_title: "Passkey criada",
      done_hint: "Da próxima vez, entre com a passkey “{{name}}”, sem senha nem código.",
      done: "Pronto",
      cancelled_title: "Nada foi criado",
      cancelled_hint: "A janela do navegador foi fechada ou o tempo acabou. Tente de novo quando quiser.",
      retry: "Tentar de novo",
      remove_title: "Remover a passkey “{{name}}”?",
      remove_hint: "Você não vai mais conseguir entrar com ela. A senha, o segundo fator e as outras passkeys continuam valendo.",
    },
    sessions: {
      title: "Sessões",
      description: "Onde a sua conta está conectada. Encerrar derruba o acesso naquele aparelho na hora.",
      current: "Esta sessão",
      revoke: "Encerrar",
      revoke_others: "Encerrar as outras",
      last_seen: "Último uso: {{when}}",
      revoke_title: "Encerrar a sessão do {{device}}?",
      revoke_hint: "Esse aparelho sai agora e pede para entrar de novo. As outras sessões continuam.",
      revoke_confirm: "Encerrar sessão",
      revoke_others_title_one: "Encerrar a outra sessão?",
      revoke_others_title_other: "Encerrar as outras {{count}} sessões?",
      revoke_others_hint: "{{devices}} saem agora e pedem para entrar de novo. Esta sessão continua.",
      revoke_others_confirm_one: "Encerrar 1 sessão",
      revoke_others_confirm_other: "Encerrar {{count}} sessões",
    },
    learning: {
      title: "Perfil de aprendizado",
      description: "Ajuda o Code a escolher trilhas e o Peer a falar no seu nível. Nada aqui é obrigatório.",
      experience: "Experiência",
      exp: {
        junior: "Junior",
        junior_hint: "Já programo e quero autonomia.",
        mid: "Pleno",
        mid_hint: "Entrego sozinho; quero decidir melhor.",
        senior: "Senior",
        senior_hint: "Decido no código; quero levar ao time.",
        tech_lead: "Tech Lead",
        tech_lead_hint: "Lidero um time e seus limites.",
        architect: "Architect",
        architect_hint: "Desenho sistemas e reviso decisões.",
        unknown: "Ainda não sei",
        unknown_hint: "Os primeiros exercícios mostram.",
      },
      declared_note: "O declarado da Evolução vem da experiência: mudar aqui muda o declarado de todas as competências. O observado continua vindo das suas evidências.",
      languages: "Linguagens que você usa",
      soon: "em breve",
      goals: "O que você quer daqui",
      goals_limit: "até 3, se quiser",
      goal: {
        learn: "Aprender",
        learn_hint: "Entender o porquê, não só fazer passar.",
        ship_faster: "Entregar mais rápido",
        ship_faster_hint: "Menos ida e volta entre teste e revisão.",
        review_code: "Revisar código",
        review_code_hint: "Ler o código dos outros com critério.",
      },
    },
    plan: {
      title: "Plano do Code",
      description: "A assinatura do Code é separada da do Platform.",
    },
    invoices: {
      title: "Faturas",
      description: "As cobranças do Code, da mais recente para a mais antiga.",
      empty: "Nenhuma cobrança ainda.",
      open: "Abrir",
      new_tab: "(abre numa aba nova)",
      load_more: "Carregar mais",
      status: {
        paid: "Paga",
        failed: "Falhou",
        refunded: "Reembolsada",
      },
    },
    delete: {
      title: "Excluir conta",
      description: "Apaga a sua conta Muriki no Code e no Platform. Não dá para desfazer.",
      button: "Excluir minha conta",
      confirm_title: "Excluir a sua conta Muriki?",
      confirm_description: "Apaga o seu perfil, o perfil de aprendizado, a senha, as passkeys e o segundo fator, no Code e no Platform, e encerra todas as sessões. O Pro é cancelado agora, sem reembolso do período. Para confirmar, digite a sua senha.",
      confirm: "Excluir a conta",
    },
  },
  status_page: {
    offline: {
      label: "Sem conexão",
      title_a: "Você está",
      title_b: "sem internet.",
      description: "Precisamos de conexão para salvar o que você faz. O que já foi enviado está guardado.",
      note: "Assim que a conexão voltar, a página recarrega sozinha.",
      action: "Tentar de novo",
      secondary: "Ir para o início",
    },
    not_found: {
      label: "Erro 404",
      title_a: "Esta página",
      title_b: "não existe.",
      description: "O link pode estar errado, ou a página mudou de lugar. O resto continua onde estava.",
      action: "Ir para o início",
      secondary: "Voltar",
    },
    error: {
      label: "Erro 500",
      title_a: "Algo deu errado",
      title_b: "do nosso lado.",
      description: "Não foi você. Tente de novo em alguns instantes; se continuar, fale com o suporte e passe o código.",
      action: "Tentar de novo",
      secondary: "Ir para o início",
      code: "código",
      support: "Falar com o suporte",
    },
    session_expired: {
      label: "Sessão",
      title_a: "Sua sessão",
      title_b: "terminou.",
      description: "Por segurança, a sessão acaba depois de um tempo sem uso ou quando é encerrada em outro aparelho. Entre de novo e continue de onde parou.",
      action: "Entrar de novo",
      secondary: "Ir para o início",
    },
    maintenance: {
      label: "Manutenção",
      title_a: "Voltamos",
      title_b: "já, já.",
      description: "Estamos melhorando algumas coisas. O que você fez está salvo.",
      action: "Tentar de novo",
      secondary: "Status dos serviços",
    },
  },
  app_shell: {
    soon: "em breve",
    sign_out: "Sair da conta",
  },
  sidebar: {
    collapse: "Recolher menu",
    expand: "Expandir menu",
    pin: "Fixar menu",
    unpin: "Soltar menu",
    mobile_title: "Menu",
    mobile_description: "Navegação principal.",
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
      length: "{{min}} caracteres",
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
      use_backup: "Usar um código de backup",
      use_app: "Usar o app autenticador",
      backup_label: "Código de backup",
      backup_placeholder: "xxxxx-xxxxx",
      backup_description: "Cada código de backup vale uma vez.",
      verify_submit: "Verificar código",
      verifying: "Verificando...",
    },
    passkey: {
      label: "Passkey",
      title: "Confirme no",
      title_accent: "seu dispositivo.",
      subtitle: "O navegador abriu o pedido da sua chave de acesso.",
      waiting: "Aguardando a confirmação",
      waiting_description:
        "Use Touch ID, Windows Hello ou a chave física que você cadastrou. Se a janela do navegador sumiu, peça de novo.",
      retry: "Pedir de novo",
      note: "A passkey já é o segundo fator: quem entra por ela não digita código.",
      use_password: "Usar email e senha",
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
