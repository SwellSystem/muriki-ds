# O primeiro acesso que falta e o convite do Platform (bloco A2). Seguem a linguagem do primeiro
# acesso do bloco A: o formulário à esquerda e, à direita, o palco azul com as manchas desfocadas.
# No código por e-mail e no convite inválido o palco mostra a marca: a logo, "Muriki Platform" e as
# janelas dos dois produtos (Projects e Focus) em esqueleto, sem nome de funcionalidade nem número.
# Nos outros, o palco mostra a janela do workspace, como a prévia do bloco A.
# As telas de entrada (entrar, passkey, segundo fator, criar conta, a senha) não são desenhadas aqui:
# o app usa a tela de login compartilhada do DS (auth-page + login-page), só com a marca.
# Sem CPF e sem plano. O token do convite nunca aparece na tela nem em link.
from pecas import (K, T, ic, FONTE, MONO, LOGO, PRODUTO, EMAIL, raiz, topo,  # noqa: F401
                   manchas, cabecalho_passo, campo, caixa_marcar, botao_passo, cartoes_escolha, previa_workspace, esc,
                   PRODUTOS, _barra, _quadro, _lista, _moldura, _nome_produto, _azul, pagina_identidade)
# depois de pecas, que põe o canvas do Code no caminho
from base import botao_idioma, botao_tema  # noqa: E402

WORKSPACE = 'Moura & Filhos'
EMAIL_MASCARADO = 'r•••@moura.dev'


# ── A moldura ───────────────────────────────────────────────────────────
def topo_entrada(k):
    # quem ainda não entrou: a marca, idioma e tema, sem o e-mail
    return (f'<header style="display:flex;align-items:center;gap:10px;height:64px;flex:0 0 auto;padding:0 24px 0 32px;">'
            f'<span style="display:flex;width:28px;height:28px;">{LOGO}</span>'
            f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{PRODUTO}</span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;">{botao_idioma(k)}{botao_tema(k)}</span></header>')


def pagina_a2(k, formulario, palco, logado=False, largura=440):
    # a grade do primeiro acesso (1fr / 1.2fr), a barra do topo por cima das duas colunas, o formulário
    # numa coluna centrada na vertical e o palco azul à direita
    barra = topo(k, PRODUTO, EMAIL) if logado else topo_entrada(k)
    return (f'{raiz(k, "display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);")}'
            f'<div style="position:absolute;inset:0 0 auto 0;z-index:1;">{barra}</div>'
            f'<main style="display:flex;flex-direction:column;justify-content:center;gap:28px;width:{largura}px;justify-self:center;'
            f'padding:64px 0 27px;">{formulario}</main>'
            f'<div style="position:relative;display:flex;align-items:center;justify-content:center;min-height:0;padding:64px 58px 45px;'
            f'background-color:{k["prisub"]};background-image:{manchas(k)};">{palco}</div></div>')


# ── O palco da marca ────────────────────────────────────────────────────
# A logo e "Muriki Platform" em cima e, embaixo, as duas janelas da prévia do bloco A, reduzidas e
# sobrepostas: o Projects atrás, à esquerda, e o Focus na frente, à direita. Sem o nome do workspace:
# no lugar dele, duas barras de esqueleto. As partes azuis acesas. Decorativo.
def _janela_produto(k, publico):
    cabeca = (f'<div style="display:flex;flex-direction:column;gap:12px;">{_barra(k, "38%", 26, raio=8)}'
              f'{_barra(k, "58%", 10, cor=f"color-mix(in oklab, {k["sunken"]} 70%, transparent)")}</div>')
    corpo = _quadro(k, True) if publico == 'team' else _lista(k, True)
    # o nome do produto maior que o da prévia, para continuar legível com a janela reduzida
    nome = f'<span style="font-size:21px;font-weight:600;color:{k["fgs"]};white-space:nowrap;">{PRODUTOS[publico]}</span>'
    return _moldura(k, nome, cabeca + corpo)


def palco_marca(k):
    escala = 0.62
    # cada janela numa camada própria: os cartões da de trás são position:relative e passariam por cima da da frente
    janela = lambda publico, estilo: (f'<div style="position:relative;grid-area:1/1;{estilo}">'
                                      f'<div style="width:864px;zoom:{escala};">{_janela_produto(k, publico)}</div></div>')
    janelas = (f'<div style="display:grid;">'
               + janela('team', 'z-index:1;padding:0 128px 132px 0;')
               + janela('personal', 'z-index:2;padding:132px 0 0 128px;') + '</div>')
    marca = (f'<div style="display:flex;align-items:center;gap:14px;">'
             f'<span style="display:flex;width:52px;height:52px;">{LOGO}</span>'
             f'<span style="font-size:30px;line-height:1;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{PRODUTO}</span></div>')
    return (f'<div aria-hidden="true" style="display:flex;flex-direction:column;align-items:center;gap:40px;pointer-events:none;user-select:none;">'
            f'{marca}{janelas}</div>')


# ── As peças do formulário ──────────────────────────────────────────────
# No traço do primeiro acesso: o InputGroup touch (44px, raio 11, --field, o filete por dentro), o
# rótulo em cima e o botão sólido da largura dos campos.
def cabeca(k, titulo, sub=''):
    return (f'<header style="display:flex;flex-direction:column;gap:12px;">'
            f'<h1 style="margin:0;font-size:40px;line-height:1.05;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};text-wrap:balance;">{titulo}</h1>'
            + (f'<p style="margin:0;font-size:16px;line-height:24px;color:{k["mfg"]};text-wrap:pretty;">{sub}</p>' if sub else '')
            + '</header>')


def forte(k, txt):
    return f'<b style="font-weight:500;color:{k["fgs"]};">{txt}</b>'


def caixa_campo(k, conteudo, erro=False):
    anel = (f'box-shadow:inset 0 0 0 1px {k["bad"]}, 0 0 0 3px color-mix(in oklch, {k["bad"]} 15%, transparent);' if erro
            else f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});')
    return (f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;border-radius:11px;'
            f'background:{k["field"]};{anel}">{conteudo}</div>')


def botao_solido(k, txt, href='#', seta=True):
    return (f'<a href="{href}" style="display:flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;'
            f'border-radius:11px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;">'
            f'{txt}{ic("seta", 14) if seta else ""}</a>')


def botao_contorno(k, txt, href='#', icone=None):
    return (f'<a href="{href}" style="display:flex;align-items:center;justify-content:center;gap:9px;height:44px;padding:0 18px;'
            f'border-radius:11px;background:{k["card"]};box-shadow:inset 0 0 0 1px {k["input"]}, 0 1px 2px rgba(0,0,0,0.05);'
            f'color:{k["fgs"]};font-size:15px;font-weight:500;">{ic(icone, 17) if icone else ""}{txt}</a>')


def nota(k, txt, icone=None, cor=None):
    marca = f'<span style="display:flex;margin-top:2px;color:{cor or k["mfg"]};">{ic(icone, 14)}</span>' if icone else ''
    return (f'<p style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:19px;color:{k["mfg"]};">'
            f'{marca}<span>{txt}</span></p>')


def caixas_codigo(k, digitos, foco=None, aria=''):
    def caixa(i):
        anel = (f'inset 0 0 0 1.5px {k["pri"]}, 0 0 0 3px color-mix(in oklch, {k["pri"]} 20%, transparent)' if i == foco
                else f'inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]})')
        return (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;height:56px;border-radius:12px;'
                f'background:{k["field"]};box-shadow:{anel};font-family:{MONO};font-size:24px;font-weight:500;color:{k["fgs"]};">'
                f'{digitos[i]}</span>')
    traco = f'<span style="width:12px;flex:0 0 12px;height:2px;border-radius:1px;background:{k["input"]};"></span>'
    return (f'<div role="group" aria-label="{aria}" style="display:flex;align-items:center;gap:8px;width:100%;">'
            + ''.join(caixa(i) for i in range(3)) + traco + ''.join(caixa(i) for i in range(3, 6)) + '</div>')


# ── Primeiro acesso ─────────────────────────────────────────────────────
def tela_codigo(k):
    # passo 1 de 3, só quando falta a prova da caixa (o GET /onboarding devolve challengeRequired)
    ajuda = (f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["mfg"]};">{T("naoChegou")} '
             f'<span aria-disabled="true" style="font-weight:500;">{T("reenviarEm")}</span><br>{T("spam")}</p>')
    form = (cabecalho_passo(k, 1, 3, T('codigoTit'), f'{T("codigoSubA")} {forte(k, EMAIL)}.')
            + f'<form style="margin:0;display:flex;flex-direction:column;gap:16px;">'
            + caixas_codigo(k, ['4', '8', '2', '9', '1', ''], foco=5, aria=T('codigoAria'))
            + nota(k, T('expira')) + '<span style="height:4px;"></span>'
            + botao_passo(k, T('verificarBotao'), True) + '</form>' + ajuda)
    return pagina_a2(k, form, palco_marca(k), logado=True, largura=512)


def tela_ja_tem_conta(k):
    # quem vem do Code: o @usuário já existe, então o campo some; o resto é a tela do bloco A (2 de 3,
    # depois do código por e-mail)
    aviso = (f'<div role="note" style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:12px;'
             f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);">'
             f'<span style="display:flex;width:32px;height:32px;flex:0 0 auto;">{LOGO}</span>'
             f'<span style="display:flex;flex-direction:column;gap:3px;">'
             f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("jaContaTit")}</span>'
             f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T("jaContaTxt")}</span></span></div>')
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    formulario = (
        cabecalho_passo(k, 2, 3, T('titulo'))
        + aviso
        + '<form style="margin:0;display:flex;flex-direction:column;gap:23px;">'
        + cartoes_escolha(k, T('paraQuem'), [('team', T('comTime'), 'pessoas'), ('personal', T('soMim'), 'pessoa')], 'team')
        + campo(k, 'nome', T('nomeWorkspace'), WORKSPACE)
        + campo(k, 'endereco', T('endereco'), 'moura-filhos', 'available', T('enderecoLivre'), afixo='platform.muriki.app/', mono=True)
        + caixa_marcar(k, False, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
        + '</form>'
        + botao_passo(k, T('criar'), False)
    )
    return pagina_identidade(k, formulario, previa_workspace(k, 'team', WORKSPACE, T('exemploTime'), T('fraseLivre'), True))


# a janela do workspace com os lugares do time: você e os convidados que se preenchem
def _previa_time(k, frase, convidados, vazios):
    titulo = (f'<h2 style="margin:0;font-size:41px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;color:{k["fgs"]};">'
              f'{esc(WORKSPACE)}</h2>')
    lugar = lambda estilo, ml=True: (f'<span style="width:32px;height:32px;{"margin-left:6px;" if ml else ""}border-radius:50%;'
                                     f'box-sizing:border-box;{estilo}"></span>')
    lugares = (f'<div style="display:flex;align-items:center;margin-top:8px;flex:0 0 auto;">'
               + lugar(f'background:{_azul(k, True, True)};', False)
               + ''.join(lugar(f'background:{_azul(k, True)};box-shadow:inset 0 0 0 1.5px color-mix(in oklab, {k["pri"]} 60%, transparent);')
                         for _ in range(convidados))
               + ''.join(lugar(f'border:1.5px dashed {k["input"]};') for _ in range(vazios)) + '</div>')
    cabeca_ = (f'<div style="display:flex;align-items:flex-start;gap:24px;">'
               f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{titulo}'
               f'<p style="margin:0;min-height:40px;max-width:52ch;font-size:15px;line-height:20px;color:{k["mfg"]};text-wrap:pretty;">{frase}</p></div>'
               f'{lugares}</div>')
    return _moldura(k, _nome_produto(k, PRODUTOS['team']), cabeca_ + _quadro(k, True))


def tela_convidar(k):
    # o passo final (o componente vem no bloco B): linhas de e-mail e papel, nunca Owner; pular não exige nada
    seta = f'<span style="display:flex;margin-left:auto;opacity:0.6;">{ic("baixo", 12)}</span>'

    def linha(i, email, papel):
        entrada = (f'<input aria-label="{T("emailPessoa")} {i}" type="email" value="{email}" placeholder="{T("emailPessoaPh")}" '
                   f'style="flex:1;min-width:0;height:100%;padding:0;border:0;background:transparent;outline:0;'
                   f'font-family:{FONTE};font-size:15px;color:{k["fgs"]};">')
        seletor = (f'<button type="button" aria-label="{T("papel")} {i}" aria-haspopup="listbox" style="display:flex;align-items:center;gap:8px;'
                   f'width:100%;height:100%;padding:0;border:0;background:transparent;font-family:{FONTE};font-size:14px;'
                   f'color:{k["fgs"]};cursor:pointer;">{T("papel" + papel)}{seta}</button>')
        remover = (f'<button type="button" aria-label="{T("remover")} {i}" style="display:flex;align-items:center;justify-content:center;'
                   f'width:32px;height:44px;flex:0 0 auto;padding:0;border:0;background:transparent;color:{k["mfg"]};cursor:pointer;">'
                   f'{ic("x", 14)}</button>')
        return (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 148px 32px;gap:8px;align-items:center;">'
                f'{caixa_campo(k, entrada)}{caixa_campo(k, seletor)}{remover}</div>')

    cabecalhos = (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 148px 32px;gap:8px;font-size:14px;line-height:14px;'
                  f'font-weight:500;color:{k["fgs"]};"><span>{T("emailPessoa")}</span><span>{T("papel")}</span><span></span></div>')
    linhas = (linha(1, 'ana@moura.dev', 'Maintainer') + linha(2, 'joao@moura.dev', 'Member') + linha(3, '', 'Member'))
    adicionar = (f'<a href="#" style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:13px;font-weight:500;'
                 f'color:{k["pri"]};"><span style="display:flex;font-size:16px;line-height:1;">+</span>{T("adicionarPessoa")}</a>')
    acoes = (f'<div style="display:flex;flex-direction:column;gap:10px;">{botao_passo(k, T("convidarBotao"), True)}'
             f'<a href="#" style="display:flex;align-items:center;justify-content:center;height:40px;border-radius:11px;'
             f'font-size:14px;font-weight:500;color:{k["mfg"]};">{T("pular")}</a></div>')
    formulario = (cabecalho_passo(k, 3, 3, T('convidarTit'), T('convidarSub'))
                  + f'<form style="margin:0;display:flex;flex-direction:column;gap:10px;">{cabecalhos}{linhas}{adicionar}</form>'
                  + acoes)
    return pagina_identidade(k, formulario, _previa_time(k, T('fraseConvites'), 2, 1))


# ── Convite ─────────────────────────────────────────────────────────────
# O preview da API é { workspace: { name }, role, email mascarado }: sem quem convidou. O token vem
# do fragmento da URL (/invite#token=…) e fica no app: a tela não mostra nem põe em link.
def tela_convite(k, logado):
    detalhe = lambda rot, valor: (f'<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 16px;">'
                                  f'<span style="font-size:13px;color:{k["mfg"]};">{rot}</span>'
                                  f'<span style="font-size:14px;font-weight:500;color:{k["fgs"]};">{valor}</span></div>')
    mascarado = f'<span style="font-family:{MONO};font-size:13px;">{EMAIL_MASCARADO}</span>'
    filete = f'<span style="height:1px;margin:0 16px;background:color-mix(in oklab, {k["fg"]} 8%, transparent);"></span>'
    cartao = (f'<div style="display:flex;flex-direction:column;border-radius:12px;background:{k["card"]};'
              f'box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);">'
              f'{detalhe(T("papel"), T("papelMember"))}{filete}'
              f'{detalhe(T("enviadoPara"), mascarado)}</div>')
    if logado:
        acoes = (f'<div style="display:flex;flex-direction:column;gap:12px;">{botao_solido(k, T("aceitarBotao"))}'
                 f'{nota(k, T("conviteLogado"))}</div>')
    else:
        acoes = (f'<p style="margin:0;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("conviteDeslogadoA")} '
                 f'<span style="font-family:{MONO};font-size:13px;color:{k["fgs"]};">{EMAIL_MASCARADO}</span> {T("conviteDeslogadoB")}</p>'
                 f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
                 f'{botao_solido(k, T("entrarBotao"), seta=False)}{botao_contorno(k, T("criarBotao"))}</div>')
    form = (cabeca(k, f'{T("conviteTitA")} {esc(WORKSPACE)}', f'{forte(k, esc(WORKSPACE))} {T("conviteSubA")} {forte(k, T("papelMember"))}.')
            + cartao + acoes + nota(k, T('validade'), 'relogio'))
    return pagina_a2(k, form, _previa_time(k, T('convitePrevia'), 1, 2), logado=logado)


def tela_convite_invalido(k):
    # o 422 uniforme: vencido, usado, cancelado ou de outra conta dão a mesma tela, sem o motivo
    marca = (f'<span style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;'
             f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);color:{k["mfg"]};">'
             f'{ic("envelope", 26)}</span>')
    form = (marca + cabeca(k, T('invalidoTit'), T('invalidoTxt')) + botao_solido(k, T('irEntrar')))
    return pagina_a2(k, form, palco_marca(k))


TELAS_A2 = {
    'codigo': tela_codigo,
    'ja_tem_conta': tela_ja_tem_conta,
    'convidar': tela_convidar,
    'convite': lambda k: tela_convite(k, False),
    'convite_logado': lambda k: tela_convite(k, True),
    'convite_invalido': tela_convite_invalido,
}
# as telas que usam os textos do passo de identidade (o contador de passos e a tela do bloco A)
COM_IDENTIDADE = {'codigo', 'ja_tem_conta', 'convidar'}
