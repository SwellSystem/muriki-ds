# Minha conta do Code: quatro abas, cada uma um quadro, e as abas levam de um quadro a outro no Play.
# Contrato da muriki-api (develop @ 38c772f):
# - Meus dados: GET /onboarding/profile (CPF e telefone mascarados) e GET /auth/get-session. Editar
#   nome, apelido e telefone e trocar o email seguem o contrato pedido à API (abaixo). O CPF não muda:
#   correção vai pelo suporte.
#   Excluir: POST /auth/account/delete com step-up; cancela a assinatura sem reembolso proporcional.
# - Aprendizado: GET/PUT /code/learning-profile, os mesmos campos do primeiro acesso.
# - Segurança: POST /auth/password/change (encerra as outras sessões); TOTP enable/verify/disable
#   (disable com step-up); passkeys: listar, adicionar e remover com step-up; sessões: listar,
#   encerrar uma e encerrar as outras.
# Pedido à API em 2026-09-25 e em implementação (nomes finais quando sair o commit): PATCH
#   /onboarding/profile; /auth/email-change/request (step-up, 202 sempre) e /confirm (todas as sessões
#   caem; DELETE /auth/email-change cancela a pendente); pendingEmailChange no GET do perfil;
#   POST /auth/two-factor/backup-codes (só com TOTP ativo); PATCH /auth/passkeys/:id.
# - Plano: GET /billing/subscriptions/code; cartão, faturas e cancelar só no portal do Stripe.
from base import *  # noqa: F401,F403
from onboarding import campos_preferencias

h = lambda caminho: '{{' + caminho + '}}'
se = lambda chave, html, padrao=False: (f'<sc-if value="{h(chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                        f'{html}</sc-if>')

ABAS = [('dados', 'abaDados', 'ContaDados'), ('aprendizado', 'abaAprendizado', 'ContaAprendizado'),
        ('seguranca', 'abaSeguranca', 'ContaSeguranca'), ('plano', 'abaPlano', 'ContaPlano')]


def _abas(k, ativa):
    itens = ''
    for chave, texto, quadro in ABAS:
        at = chave == ativa
        est = (f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if at
               else f'color:{k["mfg"]};')
        cur = ' aria-current="page"' if at else ''
        itens += (f'<a href="{quadro}__SUF__.dc.html"{cur} style="display:flex;align-items:center;height:40px;padding:0 2px;'
                  f'font-size:13.5px;{est}">{T(texto)}</a>')
    return (f'<nav aria-label="{T("abasAria")}" style="display:flex;gap:24px;box-shadow:inset 0 -1px 0 {k["muted"]};">{itens}</nav>')


def _pagina(k, ativa, corpo, dialogo=''):
    cab = cabecalho(k, None, T('contaTitulo'), T('contaSub'))
    return app(k, None, f'{cab}{_abas(k, ativa)}{corpo}{dialogo}', gap=20)


def _cartao(k, titulo, sub, corpo, direita='', extra=''):
    s_ = f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{sub}</span>' if sub else ''
    return (f'<section aria-label="{titulo}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px;display:flex;flex-direction:column;gap:14px;{extra}">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;"><span style="display:flex;flex-direction:column;gap:2px;flex:1;">'
            f'<h2 style="margin:0;font-size:14px;font-weight:600;color:{k["fgs"]};">{titulo}</h2>{s_}</span>{direita}</div>{corpo}</section>')


def _campo(k, id_, rotulo_, valor='', ph='', nota='', extra='', prefixo='', mono=False, tipo='text', so_leitura=False):
    pre = (f'<span style="display:flex;align-items:center;height:100%;padding:0 10px 0 12px;'
           f'box-shadow:inset -1px 0 0 {k["input"]};font-size:13.5px;color:{k["mfg"]};">{prefixo}</span>') if prefixo else ''
    n = f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">{nota}</span>' if nota else ''
    fundo = k['sunken'] if so_leitura else k['card']
    ro = ' readonly' if so_leitura else ''
    cadeado = f'<span style="display:flex;margin-right:12px;color:{k["mfg"]};">{ic("cadeado", 14)}</span>' if so_leitura else ''
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<label for="{id_}" style="display:flex;align-items:baseline;gap:6px;font-size:13px;font-weight:500;color:{k["fgs"]};">{rotulo_}{extra}</label>'
            f'<div style="display:flex;align-items:center;height:36px;border-radius:9px;background:{fundo};box-shadow:inset 0 0 0 1px {k["input"]};overflow:hidden;">'
            f'{pre}<input id="{id_}" type="{tipo}" value="{valor}" placeholder="{ph}"{ro} style="flex:1;min-width:0;height:100%;padding:0 12px;border:0;'
            f'background:transparent;font-family:{MONO if mono else FONTE};font-size:13.5px;color:{k["fgs"] if not so_leitura else k["mfg"]};outline:0;">'
            f'{cadeado}</div>{n}</div>')


def _botao_perigo(k, txt, acao=None, href='#'):
    est = (f'display:inline-flex;align-items:center;justify-content:center;gap:7px;height:32px;padding:0 12px;border-radius:8px;'
           f'background:{k["bad"]};color:#fff;border:0;font-family:{FONTE};font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;')
    if acao:
        return f'<button type="button" onClick="{h(acao)}" style="{est}">{txt}</button>'
    return f'<a href="{href}" style="{est}">{txt}</a>'


def _veu(k):
    return f'<div aria-hidden="true" style="position:absolute;inset:0;background:{k["veu"]};z-index:30;"></div>'


def _dialogo(k, titulo, texto, corpo, rodape, icone='cadeado', perigo=False, largura=460, topo=''):
    fundo, cor = (k['tred'], k['tredfg']) if perigo else (k['prisub'], k['prisubfg'])
    return (f'{_veu(k)}<div role="alertdialog" aria-modal="true" aria-label="{titulo}" style="position:absolute;left:50%;top:50%;z-index:31;'
            f'transform:translate(-50%,-50%);width:{largura}px;background:{k["card"]};border-radius:12px;'
            f'box-shadow:{k["sombraFlut"]}, inset 0 0 0 1px {k["border"]};padding:22px 22px 18px;display:flex;flex-direction:column;gap:16px;">'
            f'{topo}<div style="display:flex;gap:14px;align-items:flex-start;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex:0 0 auto;border-radius:10px;'
            f'background:{fundo};color:{cor};">{ic(icone, 18)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<h2 style="margin:0;font-size:16px;line-height:22px;font-weight:600;color:{k["fgs"]};">{titulo}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{texto}</p></div></div>'
            f'{corpo}<div style="display:flex;justify-content:flex-end;gap:8px;">{rodape}</div></div>')


def _senha_confirma(k, id_, rotulo_):
    return (_campo(k, id_, rotulo_, '••••••••••••••', tipo='password', mono=True)
            + f'<a href="#" style="align-self:flex-start;margin-top:-8px;font-size:12.5px;">{T("usarCodigo")}</a>')


# ── Meus dados ───────────────────────────────────────────────────────────
def tela_conta_dados(k):
    opcional = f'<span style="font-size:12px;font-weight:400;color:{k["mfg"]};">{T("opcional")}</span>'
    dados = _cartao(k, T('dadosTit'), T('dadosSub'), (
        f'<form style="margin:0;display:flex;flex-direction:column;gap:16px;">'
        f'<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;">'
        + _campo(k, 'apelido', T('apelido'), 'Rafael')
        + _campo(k, 'nome', T('nome'), 'Rafael Moura') + '</div>'
        + _campo(k, 'telefone', T('telefone'), '', T('telefonePh'), T('telefoneNota'), opcional, '+55')
        + f'<a href="#" style="align-self:flex-start;margin-top:-8px;font-size:12.5px;">{T("removerTelefone")}</a>'
        + _campo(k, 'cpf', T('cpf'), '***.***.247-25', nota=T('cpfNota'), mono=True, so_leitura=True)
        + f'<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:4px;">'
          f'{botao(T("descartar"), k, "ghost")}{botao(T("salvar"), k, "primary")}</div></form>'))

    atual = (f'<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:{k["sunken"]};">'
             f'<span style="display:flex;color:{k["mfg"]};">{ic("envelope", 16)}</span>'
             f'<span style="flex:1;font-family:{MONO};font-size:13px;color:{k["fgs"]};">rafael@moura.dev</span>'
             f'{badge(T("verificado"), k, "green", ponto=True)}</div>')
    trocando = (f'<div style="display:flex;flex-direction:column;gap:12px;">'
                + _campo(k, 'email-novo', T('novoEmail'), 'rafael@muriki.dev', T('novoEmailPh'), T('trocarNota'), mono=True, tipo='email')
                + f'<div style="display:flex;justify-content:flex-end;gap:8px;">'
                  f'{botao(T("cancelar"), k, "ghost", acao="emailAtual")}{botao(T("enviarLink"), k, "primary", acao="emailPendente")}</div></div>')
    pendente = (f'<div role="status" style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:10px;'
                f'background:{k["tyellow"]};color:{k["tyellowfg"]};">'
                f'<span style="display:flex;margin-top:2px;">{ic("relogio", 16)}</span>'
                f'<span style="display:flex;flex-direction:column;gap:4px;flex:1;font-size:13px;line-height:19px;">'
                f'<span>{T("pendenteA")} <b style="font-family:{MONO};font-weight:500;">rafael@muriki.dev</b></span>'
                f'<span style="opacity:0.85;">{T("pendenteB")}</span></span>'
                f'<span style="display:flex;gap:6px;">{botao(T("cancelarTroca"), k, "ghost", 28, acao="emailAtual")}'
                f'{botao(T("reenviar"), k, "outline", 28)}</span></div>')
    email = _cartao(k, T('emailTit'), T('emailSub'),
                    atual + se('em.trocando', trocando) + se('em.pendente', pendente),
                    direita=se('em.atual', botao(T('trocarEmail'), k, 'outline', 32, acao='emailTrocar'), True))

    termos = _cartao(k, T('termosTit'), '', (
        f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("termosTxt")}</p>'
        f'<div style="display:flex;gap:16px;font-size:13px;"><a href="#">{T("verTermos")}</a><a href="#">{T("verPrivacidade")}</a></div>'))
    excluir = _cartao(k, T('excluirTit'), T('excluirSub'), '',
                      direita=_botao_perigo(k, T('excluir'), acao='abrirExcluir'),
                      extra=f'box-shadow:{k["sombra"]}, inset 0 0 0 1px color-mix(in oklch, {k["bad"]} 35%, transparent);')

    dialogo = se('dl.excluir', _dialogo(
        k, T('excluirPergunta'), T('excluirTxt'),
        f'<div style="display:flex;flex-direction:column;gap:14px;">{_senha_confirma(k, "senha-excluir", T("confirmeSenha"))}</div>',
        botao(T('cancelar'), k, 'outline', 36, acao='fecharDialogo') + _botao_perigo(k, T('excluirDefinitivo'), acao='fecharDialogo'),
        icone='lixeira', perigo=True))
    corpo = (f'<div style="display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start;max-width:1080px;">'
             f'{dados}<div style="display:flex;flex-direction:column;gap:16px;">{email}{termos}{excluir}</div></div>')
    return _pagina(k, 'dados', corpo, dialogo)


ANTES_CONTA_DADOS = """const emE = s.email || this.props.email || "atual";
const dlE = s.dialogo || this.props.dialogo || "nenhum";
const em = { atual: emE === "atual", trocando: emE === "trocando", pendente: emE === "pendente" };
const dl = { excluir: dlE === "excluir" };"""
VALORES_CONTA_DADOS = """em: em,
dl: dl,
emailTrocar: () => this.setState({ email: "trocando" }),
emailAtual: () => this.setState({ email: "atual" }),
emailPendente: () => this.setState({ email: "pendente" }),
abrirExcluir: () => this.setState({ dialogo: "excluir" }),
fecharDialogo: () => this.setState({ dialogo: "nenhum" })"""
PROPS_CONTA_DADOS = {'email': {'editor': 'enum', 'options': ['atual', 'trocando', 'pendente'], 'default': 'atual'},
                     'dialogo': {'editor': 'enum', 'options': ['nenhum', 'excluir'], 'default': 'nenhum'}}


# ── Aprendizado ──────────────────────────────────────────────────────────
def tela_conta_aprendizado(k):
    exp, ling, obj = campos_preferencias(k)
    bloco = lambda titulo, html, extra='': (f'<div style="display:flex;flex-direction:column;gap:12px;">'
                                            f'<div style="display:flex;align-items:center;">{rotulo(titulo, k["mfg"])}{extra}</div>{html}</div>')
    contador = f'<span style="margin-left:auto;font-size:12px;color:{k["mfg"]};">{T("umATres")}</span>'
    nota = (f'<p style="margin:0;display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
            f'<span style="display:flex;margin-top:1px;">{ic("evolucao", 14)}</span><span>{T("declaradoNota")}</span></p>')
    corpo = _cartao(k, T('aprTit'), T('aprSub'), (
        bloco(T('experiencia'), exp) + nota + filete(k) + bloco(T('linguagens'), ling) + filete(k)
        + bloco(T('objetivos'), obj, contador)
        + f'<div style="display:flex;justify-content:flex-end;gap:8px;">{botao(T("descartar"), k, "ghost")}{botao(T("salvar"), k, "primary")}</div>'),
        extra='gap:18px;')
    return _pagina(k, 'aprendizado', corpo)


# ── Segurança ────────────────────────────────────────────────────────────
def tela_conta_seguranca(k, sobre='', editar_pk=False):
    senha = _cartao(k, T('senhaTit'), T('senhaSub'), (
        f'<form style="margin:0;display:flex;flex-direction:column;gap:14px;">'
        + _campo(k, 'senha-atual', T('senhaAtual'), '••••••••••••••', tipo='password', mono=True)
        + _campo(k, 'senha-nova', T('senhaNova'), '', T('senhaNovaPh'), T('senhaReq'), tipo='password', mono=True)
        + f'<div style="display:flex;justify-content:flex-end;">{botao(T("trocarSenha"), k, "primary")}</div></form>'))

    linha_app = lambda selo: (f'<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;background:{k["sunken"]};">'
                              f'<span style="display:flex;color:{k["mfg"]};">{ic("cadeado", 18)}</span>'
                              f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{T("appAutenticador")}</span>'
                              + (f'<span style="font-size:12px;color:{k["mfg"]};">{T("ativadaEm")}</span>' if selo == 'ativa' else '')
                              + f'</span>{badge(T("ativa"), k, "green", ponto=True) if selo == "ativa" else badge(T("desligada"), k, tracejado=True)}</div>')
    ativo = (linha_app('ativa')
             + f'<div style="display:flex;gap:8px;flex-wrap:wrap;">{botao_link(T("codigosNovos"), "ContaCodigos__SUF__.dc.html", k, "outline", 32, "troca")}'
               f'{botao(T("desligar"), k, "ghost", 32, acao="abrirConfirmar")}</div>'
             + f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">{T("codigosNota")}</span>')
    desligado = (linha_app('desligada')
                 + f'<div style="display:flex;">{botao_link(T("ligar"), "ContaAtivar2FA__SUF__.dc.html", k, "primary", 32)}</div>'
                 + f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">{T("ligarNota")}</span>')
    dois = _cartao(k, T('doisTit'), T('doisSub'), se('sf.ativo', ativo, True) + se('sf.desligado', desligado))

    pks = [('MacBook Pro', 'sincronizada', 'pq1'), ('YubiKey 5C', 'nesteAparelho', 'pq2')]
    icone_pk = lambda nome, rot, icone, estado: (
        f'<a href="ContaPasskeyEditar__SUF__.dc.html" aria-label="{T(rot)} {nome}" title="{T(rot)}" style="display:flex;align-items:center;'
        f'justify-content:center;width:32px;height:32px;border-radius:8px;color:{k["mfg"]};">{ic(icone, 15)}</a>')

    def linha_pk(nome, tipo, quando):
        return (f'<div style="display:grid;grid-template-columns:24px minmax(0,1fr) auto 32px 32px;gap:8px 12px;align-items:center;min-height:48px;'
                f'box-shadow:inset 0 -1px 0 {k["muted"]};">'
                f'<span style="display:flex;color:{k["mfg"]};">{ic("digital", 16)}</span>'
                f'<span style="display:flex;flex-direction:column;"><span style="font-size:13.5px;color:{k["fgs"]};">{nome}</span>'
                f'<span style="font-size:12px;color:{k["mfg"]};">{T(tipo)}</span></span>'
                f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("criadaEm")} {T(quando)}</span>'
                f'{icone_pk(nome, "renomear", "lapis", "renomear")}{icone_pk(nome, "remover", "lixeira", "remover")}</div>')

    def renomeando(nome):
        # PATCH /auth/passkeys/:id { name }: o nome vira campo na própria linha, 1 a 120 caracteres
        return (f'<div style="display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:48px;padding:6px 0;'
                f'box-shadow:inset 0 -1px 0 {k["muted"]};">'
                f'<span style="display:flex;color:{k["mfg"]};">{ic("digital", 16)}</span>'
                f'<input aria-label="{T("pkNome")}" value="{nome}" maxlength="120" style="height:32px;padding:0 10px;border:0;border-radius:8px;'
                f'background:{k["card"]};box-shadow:inset 0 0 0 1.5px {k["pri"]}, 0 0 0 3px color-mix(in oklch, {k["pri"]} 20%, transparent);'
                f'font-family:{FONTE};font-size:13.5px;color:{k["fgs"]};outline:0;">'
                f'<span style="display:flex;gap:6px;">{botao_link(T("cancelar"), "ContaSeguranca__SUF__.dc.html", k, "ghost", 32)}'
                f'{botao_link(T("salvarNome"), "ContaSeguranca__SUF__.dc.html", k, "primary", 32)}</span></div>')

    linhas_pk = linha_pk(*pks[0])
    if editar_pk:
        linhas_pk += se('fx.renomear', renomeando(pks[1][0]), True) + se('fx.remover', linha_pk(*pks[1]))
    else:
        linhas_pk += linha_pk(*pks[1])
    passkeys = _cartao(k, T('passkeysTit'), T('passkeysSub'), f'<div style="display:flex;flex-direction:column;">{linhas_pk}</div>',
                       direita=botao_link(T('adicionarPasskey'), 'ContaPasskey__SUF__.dc.html', k, 'outline', 32))

    sess = [('Chrome · macOS', '189.40.12.7', 'sq1', True), ('Safari · iOS', '177.8.40.21', 'sq2', False),
            ('Firefox · Windows', '45.231.9.14', 'sq3', False)]
    linhas_s = ''
    for disp, ip, quando, atual in sess:
        acao = (badge(T('estaSessao'), k, 'green', ponto=True) if atual
                else botao_link(T('encerrar'), 'ContaSessoes__SUF__.dc.html', k, 'ghost', 28))
        linhas_s += (f'<div style="display:grid;grid-template-columns:24px minmax(0,1fr) 110px 180px 110px;gap:12px;align-items:center;'
                     f'min-height:44px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
                     f'<span style="display:flex;color:{k["mfg"]};">{ic("laptop", 16)}</span>'
                     f'<span style="font-size:13.5px;color:{k["fgs"]};">{disp}</span>'
                     f'<span style="font-family:{MONO};font-size:12px;color:{k["mfg"]};">{ip}</span>'
                     f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("ultimoUso")}: {T(quando)}</span>'
                     f'<span style="display:flex;justify-content:flex-end;">{acao}</span></div>')
    sessoes = _cartao(k, T('sessoesTit'), T('sessoesSub'), f'<div style="display:flex;flex-direction:column;">{linhas_s}</div>',
                      direita=botao_link(T('encerrarOutras'), 'ContaSessoes__SUF__.dc.html', k, 'outline', 32, 'sair'))

    dialogo = se('dl.confirmar', _dialogo(
        k, T('stepTit'), T('stepTxt'),
        f'<div style="display:flex;flex-direction:column;gap:14px;">{_senha_confirma(k, "senha-step", T("stepSenha"))}</div>',
        botao(T('cancelar'), k, 'outline', 36, acao='fecharDialogo') + botao(T('confirmar'), k, 'solid', 36, acao='fecharDialogo')))
    corpo = (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start;">'
             f'<div style="display:flex;flex-direction:column;gap:16px;">{senha}</div>'
             f'<div style="display:flex;flex-direction:column;gap:16px;">{dois}{passkeys}</div></div>{sessoes}'
             f'<p style="margin:0;font-size:12px;color:{k["mfg"]};">{T("protegido")}</p>')
    return _pagina(k, 'seguranca', corpo, dialogo + sobre)


ANTES_CONTA_SEGURANCA = """const sfE = s.segundoFator || this.props.segundoFator || "ativo";
const dlE = s.dialogo || this.props.dialogo || "nenhum";
const sf = { ativo: sfE === "ativo", desligado: sfE === "desligado" };
const dl = { confirmar: dlE === "confirmar" };"""
VALORES_CONTA_SEGURANCA = """sf: sf,
dl: dl,
abrirConfirmar: () => this.setState({ dialogo: "confirmar" }),
fecharDialogo: () => this.setState({ dialogo: "nenhum" })"""
PROPS_CONTA_SEGURANCA = {'segundoFator': {'editor': 'enum', 'options': ['ativo', 'desligado'], 'default': 'ativo'},
                         'dialogo': {'editor': 'enum', 'options': ['nenhum', 'confirmar'], 'default': 'nenhum'}}


# ── Os fluxos da Segurança: cada um é a aba Segurança com o diálogo por cima, num quadro próprio,
# e um `estado` para cada passo. ─────────────────────────────────────────────────────────────
VOLTA = 'ContaSeguranca__SUF__.dc.html'
CODIGOS = ['aB3dE-fG7hJ', 'Kp9Qr-2sTuV', 'mN4xY-zW8cL', 'Rt6Gh-J1kPq', 'vB2nM-8XcZa',
           'Lq7Wd-E3rTy', 'Hs5Fj-K9mNb', 'pZ1aX-cV4bG', 'Yu8Io-P2lKj', 'dF6gH-3jKwE']


def _ir(k, txt, estado, var='solid'):
    return botao(txt, k, var, 36, acao=f'ir.{estado}')


def _voltar(k, txt, var='outline'):
    return botao_link(txt, VOLTA, k, var, 36)


def _qr(k, tam=136):
    # o estilo do qr-code do DS, o mesmo do Backoffice: módulos em ponto, olhos arredondados no azul
    # da marca e o logo no meio. Placa sempre branca, no escuro também. A matriz é de mentira, fixa.
    import random
    r, N = random.Random(11), 29
    cel = tam / N
    olho = lambda x, y: (x < 8 and y < 8) or (x >= N - 8 and y < 8) or (x < 8 and y >= N - 8)
    c0, c1 = N // 2 - 4, N // 2 + 4
    meio = lambda x, y: c0 <= x <= c1 and c0 <= y <= c1
    pontos = ''.join(f'<circle cx="{(x + .5) * cel:.2f}" cy="{(y + .5) * cel:.2f}" r="{cel * .42:.2f}"/>'
                     for y in range(N) for x in range(N)
                     if not (olho(x, y) or meio(x, y) or r.random() > 0.5))
    canto = lambda x, y: (f'<rect x="{(x + .5) * cel:.2f}" y="{(y + .5) * cel:.2f}" width="{6 * cel:.2f}" height="{6 * cel:.2f}" rx="{2.1 * cel:.2f}" '
                          f'fill="none" stroke="#1B50C0" stroke-width="{cel:.2f}"/>'
                          f'<rect x="{(x + 2) * cel:.2f}" y="{(y + 2) * cel:.2f}" width="{3 * cel:.2f}" height="{3 * cel:.2f}" rx="{1.1 * cel:.2f}" fill="#1B50C0"/>')
    lado = (c1 - c0 + 1) * cel
    logo = (f'<rect x="{c0 * cel:.2f}" y="{c0 * cel:.2f}" width="{lado:.2f}" height="{lado:.2f}" rx="{lado * .28:.2f}" fill="#fff"/>'
            f'<svg x="{(c0 + .9) * cel:.2f}" y="{(c0 + .9) * cel:.2f}" width="{lado - 1.8 * cel:.2f}" height="{lado - 1.8 * cel:.2f}" viewBox="0 0 932 874">'
            + LOGO.split('>', 1)[1].rsplit('</svg>', 1)[0] + '</svg>')
    return (f'<div style="padding:10px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px {k["border"]};flex:0 0 auto;">'
            f'<svg role="img" aria-label="QR code" viewBox="0 0 {tam} {tam}" width="{tam}" height="{tam}" style="display:block;">'
            f'<g fill="#243040">{pontos}</g>{canto(0, 0)}{canto(N - 7, 0)}{canto(0, N - 7)}{logo}</svg></div>')


def _caixas(k, erro=False):
    anel = f'inset 0 0 0 1.5px {k["bad"]}' if erro else f'inset 0 0 0 1px {k["input"]}'
    caixa = lambda d: (f'<span aria-hidden="true" style="flex:1;height:48px;display:flex;align-items:center;justify-content:center;border-radius:10px;'
                       f'background:{k["card"]};box-shadow:{anel};font-family:{MONO};font-size:20px;font-weight:500;color:{k["fgs"]};">{d}</span>')
    e = (f'<p role="alert" style="margin:0;font-size:12.5px;line-height:18px;color:{k["bad"]};">{T("tfInvalido")}</p>' if erro else '')
    return (f'<div style="display:flex;flex-direction:column;gap:8px;">'
            f'<label for="codigo-totp" style="font-size:13px;font-weight:500;color:{k["fgs"]};">{T("codigoRot")}</label>'
            f'<div style="position:relative;display:flex;gap:8px;">{"".join(caixa(d) for d in "482917")}'
            f'<input id="codigo-totp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="482917" '
            f'style="position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0;"></div>{e}</div>')


def _codigos(k):
    # os dez códigos aparecem uma vez: PDF (o pdf-recovery-codes do DS), copiar e o "guardei" antes de concluir
    grade = ''.join(f'<li style="font-family:{MONO};font-size:14px;letter-spacing:0.04em;color:{k["fgs"]};">{c}</li>' for c in CODIGOS)
    return (f'<ol style="margin:0;padding:14px 18px;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;border-radius:10px;'
            f'background:{k["sunken"]};box-shadow:inset 0 0 0 1px {k["border"]};">{grade}</ol>'
            f'<div style="display:flex;gap:8px;">{botao(T("baixarPdf"), k, "outline", 32)}{botao(T("copiar"), k, "ghost", 32)}</div>'
            f'<label style="display:flex;align-items:center;gap:10px;font-size:13.5px;color:{k["fg"]};cursor:pointer;">'
            f'<input type="checkbox" checked style="width:16px;height:16px;margin:0;accent-color:{k["pri"]};">{T("guardei")}</label>')


def _passos(k, atual):
    itens = ['tfP1', 'tfP2', 'tfP3']
    h_ = ''
    for i, t in enumerate(itens):
        feito, at = i < atual, i == atual
        bola = (f'<span style="width:20px;height:20px;border-radius:999px;display:flex;align-items:center;justify-content:center;'
                f'font-family:{MONO};font-size:10.5px;font-weight:500;'
                + (f'background:{k["pri"]};color:{k["prifg"]};' if at else
                   f'background:{k["prisub"]};color:{k["prisubfg"]};' if feito else
                   f'background:{k["sunken"]};color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};')
                + f'">{ic("check", 11) if feito else i + 1}</span>')
        cor = f'color:{k["fgs"]};font-weight:500;' if at else f'color:{k["mfg"]};'
        h_ += f'<li style="display:flex;align-items:center;gap:8px;font-size:12.5px;{cor}">{bola}{T(t)}</li>'
        if i < len(itens) - 1:
            h_ += f'<li aria-hidden="true" style="flex:1;height:1px;background:{k["input"]};max-width:28px;"></li>'
    return f'<ol aria-label="{T("tfTit")}" style="margin:0;padding:0;list-style:none;display:flex;align-items:center;gap:8px;">{h_}</ol>'


def _confirma_senha(k, titulo, texto, botao_txt, proximo, perigo=False, icone='cadeado'):
    corpo = f'<div style="display:flex;flex-direction:column;gap:14px;">{_senha_confirma(k, "senha-fluxo", T("stepSenha"))}</div>'
    acao = (botao(botao_txt, k, 'solid', 36, acao=f'ir.{proximo}') if not perigo else _botao_perigo(k, botao_txt, acao=f'ir.{proximo}'))
    return _dialogo(k, titulo, texto, corpo, _voltar(k, T('cancelar')) + acao, icone=icone, perigo=perigo)


def fluxo_passkey(k):
    # step-up → nome e onde guardar → a janela do navegador (generate-register-options → startRegistration
    # → verify-registration) → pronta; cancelar no navegador chega como NotAllowedError
    opcao = lambda titulo, desc, marcado: (
        f'<button type="button" role="radio" aria-checked="{"true" if marcado else "false"}" style="flex:1;display:flex;flex-direction:column;gap:4px;'
        f'padding:12px 14px;border:0;border-radius:10px;background:{k["card"]};text-align:left;font-family:{FONTE};cursor:pointer;'
        f'box-shadow:{"0 0 0 1.5px " + k["pri"] if marcado else "inset 0 0 0 1px " + k["input"]};">'
        f'<span style="display:flex;align-items:center;gap:8px;"><span style="width:14px;height:14px;border-radius:999px;'
        f'box-shadow:{"inset 0 0 0 4px " + k["pri"] if marcado else "inset 0 0 0 1.5px " + k["input"]};"></span>'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">{titulo}</span></span>'
        f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">{desc}</span></button>')
    nome = _dialogo(k, T('pkTit'), T('pkSub'), (
        f'<div style="display:flex;flex-direction:column;gap:14px;">'
        + _campo(k, 'pk-nome', T('pkNome'), 'MacBook Air', nota=T('pkNomeNota'))
        + f'<div role="radiogroup" aria-label="{T("pkOnde")}" style="display:flex;flex-direction:column;gap:8px;">'
          f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{T("pkOnde")}</span>'
          f'<div style="display:flex;gap:10px;">{opcao(T("pkEste"), T("pkEsteDesc"), True)}{opcao(T("pkChave"), T("pkChaveDesc"), False)}</div></div></div>'),
        _voltar(k, T('cancelar')) + _ir(k, T('pkCriar'), 'navegador'), icone='digital', largura=520)
    aviso = lambda chave, icone, acoes, perigo=False: _dialogo(k, T(chave + 'Tit'), T(chave + 'Txt'), '', acoes, icone=icone, perigo=perigo)
    return (se('fx.confirmar', _confirma_senha(k, T('stepTit'), T('stepTxt'), T('confirmar'), 'nome'), True)
            + se('fx.nome', nome)
            + se('fx.navegador', aviso('pkNav', 'digital', _ir(k, T('cancelar'), 'cancelada', 'outline')))
            + se('fx.pronta', aviso('pkPronta', 'check', _voltar(k, T('pronto'), 'solid')))
            + se('fx.cancelada', aviso('pkCancelada', 'x', _voltar(k, T('cancelar')) + _ir(k, T('tentarDeNovo'), 'navegador'))))


def fluxo_ativar_2fa(k):
    # enable { password } → { totpURI, backupCodes } → verify-totp { code }: os códigos só aparecem
    # depois que o app confirma, e nunca mais
    senha = _dialogo(k, T('tfTit'), T('tfSenhaTxt'),
                     f'<div style="display:flex;flex-direction:column;gap:14px;">{_senha_confirma(k, "senha-2fa", T("stepSenha"))}</div>',
                     _voltar(k, T('cancelar')) + _ir(k, T('continuar'), 'qr'), largura=540, topo=_passos(k, 0))

    def qr(erro):
        corpo = (f'<div style="display:flex;gap:18px;align-items:center;">{_qr(k)}'
                 f'<div style="display:flex;flex-direction:column;gap:8px;min-width:0;">'
                 f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("tfChave")}</span>'
                 f'<code style="padding:7px 10px;border-radius:8px;background:{k["sunken"]};font-family:{MONO};font-size:12.5px;letter-spacing:0.08em;color:{k["fgs"]};">'
                 f'KRSX G5CT MVRX EZLU</code>'
                 f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("tfCodigoTxt")}</span></div></div>'
                 + _caixas(k, erro))
        return _dialogo(k, T('tfTit'), T('tfQrTxt'), corpo, _voltar(k, T('cancelar')) + _ir(k, T('tfAtivar'), 'codigos'),
                        largura=540, topo=_passos(k, 1))
    codigos = _dialogo(k, T('tfTit'), T('tfCodigosTxt'), _codigos(k), _voltar(k, T('concluir'), 'solid'),
                       icone='check', largura=540, topo=_passos(k, 2))
    return (se('fx.senha', senha, True) + se('fx.qr', qr(False)) + se('fx.invalido', qr(True)) + se('fx.codigos', codigos))


def fluxo_codigos(k):
    # POST /auth/two-factor/backup-codes com step-up: os dez novos substituem os antigos
    codigos = _dialogo(k, T('cnTit'), T('cnCodigosTxt'), _codigos(k), _voltar(k, T('concluir'), 'solid'), icone='check', largura=540)
    return (se('fx.confirmar', _confirma_senha(k, T('cnTit'), T('cnTxt'), T('cnGerar'), 'codigos', icone='troca'), True)
            + se('fx.codigos', codigos))


def fluxo_passkey_editar(k):
    # renomear é na própria linha (tela_conta_seguranca com editar_pk); remover pede a senha: DELETE com step-up
    remover = _dialogo(k, T('rmTit'), T('rmTxt'),
                       f'<div style="display:flex;flex-direction:column;gap:14px;">{_senha_confirma(k, "senha-rm", T("stepSenha"))}</div>',
                       _voltar(k, T('cancelar')) + _botao_perigo(k, T('rmBotao'), href=VOLTA), icone='lixeira', perigo=True)
    return se('fx.remover', remover)


def fluxo_sessoes(k):
    # DELETE /auth/sessions/{id} e POST /auth/sessions/revoke-others: sem step-up
    d = lambda chave: _dialogo(k, T(chave + 'Tit'), T(chave + 'Txt'), '',
                               _voltar(k, T('cancelar')) + _botao_perigo(k, T(chave + 'Botao'), href=VOLTA), icone='sair', perigo=True)
    return se('fx.uma', d('s1'), True) + se('fx.outras', d('so'))


def antes_fluxo(opcoes):
    return (ANTES_CONTA_SEGURANCA + '\n'
            + f'const fxE = s.estado || this.props.estado || "{opcoes[0]}";\n'
            + 'const fx = {' + ', '.join(f'{o}: fxE === "{o}"' for o in opcoes) + '};\n'
            + 'const ir = {' + ', '.join(f'{o}: () => this.setState({{ estado: "{o}" }})' for o in opcoes) + '};')


VALORES_FLUXO = VALORES_CONTA_SEGURANCA + ',\nfx: fx,\nir: ir'


def props_fluxo(opcoes, segundo_fator='ativo'):
    return {'estado': {'editor': 'enum', 'options': opcoes, 'default': opcoes[0]},
            'segundoFator': {'editor': 'enum', 'options': ['ativo', 'desligado'], 'default': segundo_fator}}


FLUXOS = {
    'conta_passkey': (fluxo_passkey, ['confirmar', 'nome', 'navegador', 'pronta', 'cancelada'], 'ativo', False),
    'conta_2fa': (fluxo_ativar_2fa, ['senha', 'qr', 'invalido', 'codigos'], 'desligado', False),
    'conta_codigos': (fluxo_codigos, ['confirmar', 'codigos'], 'ativo', False),
    'conta_passkey_editar': (fluxo_passkey_editar, ['renomear', 'remover'], 'ativo', True),
    'conta_sessoes': (fluxo_sessoes, ['uma', 'outras'], 'ativo', False),
}


# ── Plano ────────────────────────────────────────────────────────────────
def tela_conta_plano(k):
    linha = lambda r, v: (f'<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:44px;'
                          f'box-shadow:inset 0 -1px 0 {k["muted"]};font-size:13.5px;">'
                          f'<span style="color:{k["mfg"]};">{r}</span><span style="display:flex;align-items:center;gap:8px;color:{k["fgs"]};">{v}</span></div>')
    resumo = (f'<div style="display:flex;align-items:center;gap:10px;">'
              f'<span style="font-size:22px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">Pro</span>{badge(T("emTeste"), k, "blue", ponto=True)}</div>'
              f'<div style="display:flex;flex-direction:column;">'
              + linha(T('situacao'), f'{T("emTeste")} {T("testeAte")}')
              + linha(T('periodoRot'), T('mensalV'))
              + linha(T('cobranca'), T('cobrancaV'))
              + '</div>'
              f'<div style="display:flex;gap:8px;">{botao(T("portal"), k, "primary", 36)}'
              f'{botao_link(T("verPlanos"), "Planos__SUF__.dc.html", k, "outline", 36)}</div>'
              f'<p style="margin:0;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("portalNota")}</p>')
    plano = _cartao(k, T('planoTit'), T('planoSub'), resumo, extra='max-width:640px;')
    nota = (f'<p style="margin:0;max-width:640px;display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
            f'<span style="display:flex;margin-top:1px;">{ic("relogio", 14)}</span><span>{T("cancelouNota")}</span></p>')
    return _pagina(k, 'plano', plano + nota)


# ── /confirm-email: o link que chega no email novo ───────────────────────
# Lê o token de location.hash e chama /auth/email-change/confirm: 204 derruba todas as sessões;
# 422 LINK_TOKEN_INVALID (inválido, usado ou vencido); 409 EMAIL_TAKEN. Pouco conteúdo: no centro.
def tela_confirmar_email(k, sufixo):
    def estado(chave, icone, cor, fundo, acao, padrao=False):
        return se(f'ce.{chave}', (
            f'<div role="status" style="display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:999px;'
            f'background:{fundo};color:{cor};">{ic(icone, 28)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:10px;max-width:440px;">'
            f'<h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{T(chave + "Tit")}</h1>'
            f'<p style="margin:0;font-size:15px;line-height:23px;color:{k["mfg"]};">{T(chave + "Txt")}</p></div>{acao}</div>'), padrao)
    ir = lambda txt, href: (f'<a href="{href}" style="display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;'
                            f'border-radius:10px;background:{k["pri"]};color:{k["prifg"]};font-size:14px;font-weight:500;">{txt}{ic("seta", 14)}</a>')
    corpo = (estado('ceConfirmando', 'relogio', k['mfg'], k['sunken'], '')
             + estado('ceOk', 'check', k['ok'], k['tgreen'], ir(T('ceEntrar'), f'Entrar{sufixo}.dc.html'), True)
             + estado('ceInvalido', 'x', k['warn'], k['torange'], ir(T('ceIrConta'), f'ContaDados{sufixo}.dc.html'))
             + estado('ceTomado', 'x', k['warn'], k['torange'], ir(T('ceIrConta'), f'ContaDados{sufixo}.dc.html')))
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code", "")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px 80px;">'
            f'{corpo}</main></div>')


ANTES_CONFIRMAR_EMAIL = """const ceE = s.estado || this.props.estado || "confirmado";
const ce = { ceConfirmando: ceE === "confirmando", ceOk: ceE === "confirmado", ceInvalido: ceE === "invalido", ceTomado: ceE === "emUso" };"""
PROPS_CONFIRMAR_EMAIL = {'estado': {'editor': 'enum', 'options': ['confirmado', 'confirmando', 'invalido', 'emUso'], 'default': 'confirmado'}}
