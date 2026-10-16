# O primeiro acesso que falta e o convite do Platform (bloco A2). Seguem a linguagem do primeiro
# acesso do bloco A, do lado do login: o palco azul com as manchas desfocadas à esquerda e o
# formulário à direita.
# No código por e-mail e no convite inválido o palco mostra as janelas dos dois produtos (Projects e
# Focus) em esqueleto, sem nome de funcionalidade nem número; a marca fica só na barra do topo.
# Nos outros, o palco mostra a janela do workspace, como a prévia do bloco A.
# As telas de entrada (entrar, passkey, segundo fator, criar conta, a senha) não são desenhadas aqui:
# o app usa a tela de login compartilhada do DS (auth-page + login-page), só com a marca.
# Sem CPF e sem plano. O token do convite nunca aparece na tela nem em link.
from pecas import (K, T, I, svg, ic, FONTE, MONO, LOGO, PRODUTO, EMAIL, raiz, topo,  # noqa: F401
                   palco, cabecalho_passo, campo, caixa_marcar, botao_passo, previa_workspace, esc,
                   PRODUTOS, _barra, _quadro, _lista, _moldura, _nome_produto, _azul, pagina_identidade)
# depois de pecas, que põe o canvas do Code no caminho
from base import botao_idioma, botao_tema  # noqa: E402

WORKSPACE = 'Moura & Filhos'
EMAIL_MASCARADO = 'r•••@moura.dev'
# o invitedBy.name da prévia do convite
CONVIDOU = 'Rafael Moura'
# o nome da conta: o nome do espaço pessoal que nasce no primeiro acesso
CONTA = 'Rafael Moura'


# ── A moldura ───────────────────────────────────────────────────────────
def topo_entrada(k):
    # quem ainda não entrou: a marca, idioma e tema, sem o e-mail
    return (f'<header style="display:flex;align-items:center;gap:10px;height:64px;flex:0 0 auto;padding:0 24px 0 32px;">'
            f'<span style="display:flex;width:28px;height:28px;">{LOGO}</span>'
            f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{PRODUTO}</span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;">{botao_idioma(k)}{botao_tema(k)}</span></header>')


def pagina_a2(k, formulario, palco_, logado=False, largura=440, email=EMAIL):
    # a grade do primeiro acesso (1.2fr / 1fr), a barra do topo por cima das duas colunas, o palco à
    # esquerda e o formulário numa coluna centrada na vertical, à direita
    barra = topo(k, PRODUTO, email) if logado else topo_entrada(k)
    return (f'{raiz(k, "display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);")}'
            f'<div style="position:absolute;inset:0 0 auto 0;z-index:1;">{barra}</div>'
            f'{palco(k, palco_)}'
            f'<main style="display:flex;flex-direction:column;justify-content:center;gap:28px;width:{largura}px;justify-self:center;'
            f'padding:64px 0 27px;">{formulario}</main></div>')


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
    escala = 0.66
    # cada janela numa camada própria: os cartões da de trás são position:relative e passariam por cima da da frente
    janela = lambda publico, estilo: (f'<div style="position:relative;grid-area:1/1;{estilo}">'
                                      f'<div style="width:864px;zoom:{escala};">{_janela_produto(k, publico)}</div></div>')
    janelas = (f'<div style="display:grid;">'
               + janela('team', 'z-index:1;padding:0 96px 120px 0;')
               + janela('personal', 'z-index:2;padding:120px 0 0 96px;') + '</div>')
    # só as janelas: a marca já está na barra do topo, e repetir o nome no palco ecoava
    return (f'<div aria-hidden="true" style="display:flex;flex-direction:column;align-items:center;pointer-events:none;user-select:none;">'
            f'{janelas}</div>')


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
    # passo 1 de 4, só quando falta a prova da caixa (o GET /onboarding devolve challengeRequired)
    ajuda = (f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["mfg"]};">{T("naoChegou")} '
             f'<span aria-disabled="true" style="font-weight:500;">{T("reenviarEm")}</span><br>{T("spam")}</p>')
    form = (cabecalho_passo(k, 1, 4, T('codigoTit'), f'{T("codigoSubA")} {forte(k, EMAIL)}.')
            + f'<form style="margin:0;display:flex;flex-direction:column;gap:16px;">'
            + caixas_codigo(k, ['4', '8', '2', '9', '1', ''], foco=5, aria=T('codigoAria'))
            + nota(k, T('expira')) + '<span style="height:4px;"></span>'
            + botao_passo(k, T('verificarBotao'), True) + '</form>' + ajuda)
    return pagina_a2(k, form, palco_marca(k), logado=True, largura=512)


def tela_ja_tem_conta(k):
    # quem vem do Code: o @usuário já existe, então o campo some e fica só o aceite dos termos (2 de 4,
    # depois do código por e-mail); o espaço pessoal nasce sozinho, e a prévia o mostra
    aviso = (f'<div role="note" style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;border-radius:12px;'
             f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);">'
             f'<span style="display:flex;width:32px;height:32px;flex:0 0 auto;">{LOGO}</span>'
             f'<span style="display:flex;flex-direction:column;gap:3px;">'
             f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("jaContaTit")}</span>'
             f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T("jaContaTxt")}</span></span></div>')
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    formulario = (
        cabecalho_passo(k, 2, 4, T('titulo'), T('subtitulo'))
        + aviso
        + '<form style="margin:0;display:flex;flex-direction:column;gap:23px;">'
        + caixa_marcar(k, False, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
        + '</form>'
        + botao_passo(k, T('criarEspaco'), False)
    )
    return pagina_identidade(k, formulario, previa_workspace(k, 'personal', CONTA, '', T('fraseFoco'), True))


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


# ── Convidar o time ─────────────────────────────────────────────────────
# O passo final do primeiro acesso, leve: um campo para adicionar (cola vários de uma vez: vírgula,
# espaço ou linha) e, logo abaixo, a lista de quem vai ser convidado, uma linha por pessoa: a inicial
# com o anel tracejado de pendente, o e-mail, o papel (Member por padrão; Maintainer ou Guest, nunca
# Owner) e o ×. O inválido fica na própria linha, em vermelho, sem papel. A lista rola por dentro
# quando cresce, para a tela caber sem rolar. Embaixo, as pessoas no plano (o Free e o Pro de empresa
# vão até 5; o teste de 14 dias é de Pro, que cobra por pessoa) e o botão, que conta só os válidos. À direita, a janela do
# workspace com você e quem está chegando, cada um com o papel.
CONVIDADOS = [('ana@moura.dev', 'Maintainer'), ('joao@moura.dev', 'Member'), ('bia@moura.dev', 'Member')]
INVALIDO = 'carlos@'
I['mais'] = svg('<path d="M8 3v10M3 8h10"/>')


def _avatar(k, letra, voce=False, tam=28, pendente=False):
    # você em azul cheio; quem foi convidado, azul claro com a inicial e, pendente, o anel tracejado
    fundo = k['pri'] if voce else f'color-mix(in oklab, {k["pri"]} 16%, {k["card"]})'
    cor = k['prifg'] if voce else k['prisubfg']
    anel = f'outline:1.5px dashed color-mix(in oklab, {k["pri"]} 55%, transparent);outline-offset:2px;' if pendente else ''
    return (f'<span style="display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;flex:0 0 auto;'
            f'border-radius:50%;background:{fundo};color:{cor};font-size:{round(tam * 0.43)}px;font-weight:600;{anel}">{letra}</span>')


def _adicionar(k):
    # o InputGroup touch com o envelope e o botão Adicionar ao lado; aceita colar vários de uma vez
    entrada = (f'<span style="display:flex;color:{k["mfg"]};">{ic("envelope", 16)}</span>'
               f'<input id="convidar-emails" type="text" inputmode="email" placeholder="{T("cvPh")}" aria-describedby="convidar-dica" '
               f'style="flex:1;min-width:0;height:100%;padding:0;border:0;background:transparent;outline:0;'
               f'font-family:{FONTE};font-size:15px;color:{k["fgs"]};">')
    botao = (f'<button type="button" style="display:inline-flex;align-items:center;justify-content:center;gap:7px;height:44px;'
             f'padding:0 16px 0 14px;border:0;border-radius:11px;background:{k["card"]};'
             f'box-shadow:inset 0 0 0 1px {k["input"]}, 0 1px 2px rgba(0,0,0,0.05);font-family:{FONTE};font-size:14.5px;'
             f'font-weight:500;color:{k["fgs"]};cursor:pointer;">{ic("mais", 14)}{T("cvAdicionar")}</button>')
    return (f'<div style="display:flex;flex-direction:column;gap:8px;">'
            f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;">'
            f'<label for="convidar-emails" style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T("cvCampo")}</label>'
            f'<span id="convidar-dica" style="font-size:13px;line-height:14px;color:{k["mfg"]};">{T("cvDica")}</span></div>'
            f'<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;">{caixa_campo(k, entrada)}{botao}</div></div>')


def _papel(k, i, papel):
    # o seletor de papel da linha: Maintainer, Member ou Guest (nunca Owner)
    return (f'<button type="button" aria-label="{T("papel")} {i}" aria-haspopup="listbox" style="display:flex;align-items:center;gap:6px;'
            f'width:100%;height:32px;padding:0 8px 0 10px;border:0;border-radius:8px;background:{k["field"]};'
            f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});font-family:{FONTE};font-size:13.5px;'
            f'color:{k["fgs"]};cursor:pointer;">{T("papel" + papel)}'
            f'<span style="display:flex;margin-left:auto;opacity:0.55;">{ic("baixo", 11)}</span></button>')


def _lista_convidados(k, convidados=CONVIDADOS, invalido_=INVALIDO):
    # uma linha por pessoa, alinhadas em colunas (inicial, e-mail, papel, ×) e separadas por fio fino; a
    # altura máxima acompanha a da janela e, passando dela, a lista rola por dentro. Sem `invalido_`,
    # só as linhas válidas (o convidar dentro do produto)
    colunas = 'grid-template-columns:28px minmax(0,1fr) 128px 28px;gap:12px;'
    filete = f'box-shadow:inset 0 1px 0 color-mix(in oklab, {k["fg"]} 8%, transparent);'

    def remover(rotulo_, cor):
        return (f'<button type="button" aria-label="{T("remover")} {rotulo_}" style="display:flex;align-items:center;justify-content:center;'
                f'width:28px;height:28px;padding:0;border:0;border-radius:7px;background:transparent;color:{cor};cursor:pointer;">'
                f'{ic("x", 13)}</button>')

    def linha(i, email, papel):
        return (f'<li style="display:grid;{colunas}align-items:center;height:48px;padding:0 8px 0 12px;{filete if i else ""}">'
                f'{_avatar(k, email[0].upper(), tam=26, pendente=True)}'
                f'<span style="font-size:14.5px;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{email}</span>'
                f'{_papel(k, i + 1, papel)}{remover(email, k["mfg"])}</li>')

    invalido = '' if not invalido_ else (f'<li aria-invalid="true" aria-describedby="convidar-invalido" style="display:grid;{colunas}align-items:center;height:48px;'
                f'padding:0 8px 0 12px;background:color-mix(in oklch, {k["bad"]} 8%, transparent);{filete}">'
                f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;'
                f'outline:1.5px dashed color-mix(in oklch, {k["bad"]} 60%, transparent);outline-offset:2px;color:{k["bad"]};">{ic("alerta", 13)}</span>'
                f'<span style="font-size:14.5px;font-weight:500;color:{k["bad"]};">{invalido_}</span>'
                f'<span id="convidar-invalido" style="font-size:13px;color:{k["bad"]};">{T("cvInvalido")}</span>'
                f'{remover(invalido_, k["bad"])}</li>')
    linhas = ''.join(linha(i, e, p) for i, (e, p) in enumerate(convidados)) + invalido
    return (f'<ul aria-label="{T("cvLista")}" style="margin:0;padding:0;list-style:none;max-height:clamp(96px, calc(100vh - 580px), 240px);'
            f'overflow-y:auto;border-radius:12px;background:{k["card"]};'
            f'box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);">{linhas}</ul>')


def _medidor(k):
    # quantas pessoas, os 5 lugares do Free e do Pro de empresa (F0) e a conta do Pro depois do teste
    pessoas = [('R', True), ('A', False), ('J', False), ('B', False)]
    vazio = (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;">'
             f'<span style="width:22px;height:22px;border-radius:50%;box-sizing:border-box;border:1.5px dashed {k["input"]};"></span></span>')
    celulas = ''.join(f'<span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;">{_avatar(k, l, v, 22)}</span>'
                      for l, v in pessoas) + vazio * (5 - len(pessoas))
    # a régua: um lugar por pessoa, na faixa azul do plano, e o lugar vago tracejado
    regua = (f'<div style="display:flex;flex-direction:column;gap:5px;">'
             f'<div style="display:flex;border-radius:9px;background:color-mix(in oklab, {k["pri"]} 12%, transparent);'
             f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 45%, transparent);">{celulas}</div>'
             f'<span style="font-size:12px;line-height:16px;font-weight:500;color:{k["prisubfg"]};">{T("cvZona")}</span></div>')
    return (f'<div role="status" style="display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:inset 0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);">'
            f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;">'
            f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("cvMedidorA")} {esc(WORKSPACE)}</span>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{T("cvMedidorConta")}</span></div>'
            f'{regua}'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["fg"]};">{T("cvMedidorPreco")}</p></div>')


def _previa_chegando(k):
    # a janela do workspace com quem está chegando: você (Owner) e os convidados, cada um com o papel
    titulo = (f'<h2 style="margin:0;font-size:41px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;color:{k["fgs"]};">'
              f'{esc(WORKSPACE)}</h2>')
    pilha = (f'<div style="display:flex;align-items:center;margin-top:8px;flex:0 0 auto;">'
             + _avatar(k, 'R', True, 32)
             + ''.join(f'<span style="display:flex;margin-left:8px;">{_avatar(k, e[0].upper(), tam=32, pendente=True)}</span>'
                       for e, _ in CONVIDADOS) + '</div>')
    cabeca_ = (f'<div style="display:flex;align-items:flex-start;gap:24px;">'
               f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{titulo}'
               f'<p style="margin:0;max-width:52ch;font-size:15px;line-height:20px;color:{k["mfg"]};text-wrap:pretty;">{T("cvFrase")}</p></div>'
               f'{pilha}</div>')
    pessoa = lambda letra, nome, papel, voce=False: (
        f'<div style="display:flex;align-items:center;gap:10px;min-width:0;padding:8px 10px;border-radius:10px;'
        f'background:color-mix(in oklab, {k["sunken"]} {70 if voce else 45}%, transparent);">'
        f'{_avatar(k, letra, voce, 26, pendente=not voce)}'
        f'<span style="display:flex;flex-direction:column;min-width:0;">'
        f'<span style="font-size:13px;line-height:17px;font-weight:500;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{nome}</span>'
        f'<span style="font-size:11.5px;line-height:15px;color:{k["mfg"]};">{papel}</span></span></div>')
    time = (f'<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">'
            + pessoa('R', T('cvVoce'), T('cvOwner'), True)
            + ''.join(pessoa(e[0].upper(), e.split('@')[0], T('papel' + p)) for e, p in CONVIDADOS) + '</div>')
    return _moldura(k, _nome_produto(k, PRODUTOS['team']), cabeca_ + time + _quadro(k, True))


def tela_convidar(k):
    acoes = (f'<div style="display:flex;flex-direction:column;gap:4px;">{botao_passo(k, T("cvBotao"), True)}'
             f'<a href="#" style="display:flex;align-items:center;justify-content:center;height:36px;border-radius:11px;'
             f'font-size:14px;font-weight:500;color:{k["mfg"]};">{T("pular")}</a></div>')
    # o espaço entre os blocos encolhe com a altura da janela (32px em 900, 16px em 720), como os clamp() do passo
    formulario = (f'<div style="display:flex;flex-direction:column;gap:clamp(16px, calc(100vh - 868px), 32px);">'
                  + cabecalho_passo(k, 3, 3, T('convidarTit'), T('cvSub'))
                  + f'<form style="margin:0;display:flex;flex-direction:column;gap:12px;">{_adicionar(k)}{_lista_convidados(k)}'
                  + f'<span style="height:4px;"></span>{_medidor(k)}</form>'
                  + acoes + '</div>')
    return pagina_identidade(k, formulario, _previa_chegando(k))


# ── Convite ─────────────────────────────────────────────────────────────
# O preview da API é { workspace: { name }, role, email mascarado, invitedBy: { name } } (acerto de
# 2026-10-12): o título diz quem convidou, só pelo nome de exibição. O token vem
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
    form = (cabeca(k, f'{CONVIDOU} {T("conviteTitA")} {esc(WORKSPACE)}', f'{T("conviteSubA")} {forte(k, T("papelMember"))}.')
            + cartao + acoes + nota(k, T('validade'), 'relogio'))
    return pagina_a2(k, form, _previa_time(k, T('convitePrevia'), 1, 2), logado=logado)


# ── O passo do convidado ────────────────────────────────────────────────
# Quem chega por convite e ainda não concluiu o onboarding do Platform, ou não tem o @usuário, passa
# por aqui antes do aceite (a API exige os dois). Não cria workspace: só o @usuário (o UsernameField)
# e os termos do PlatformOnboardingIdentity, no molde do primeiro acesso. "1 de 1"; "2 de 2" quando
# antes veio o código por e-mail. O palco é a prévia do convite, e o @ entra na frase quando está
# livre (ocupado, a frase volta para "você", como na identidade). A convidada é a Renata, dona do
# r•••@moura.dev do convite.
CONVIDADA = 'renata@moura.dev'
CONVIDADO_ESTADOS = {'livre': ('renata.moura', 'available'), 'ocupado': ('renata', 'taken')}


def tela_convidado(k, estado):
    usuario, st = CONVIDADO_ESTADOS[estado]
    livre = st == 'available'
    frase_usuario = f'@{usuario} {T("usuarioLivre")}' if livre else T('usuarioOcupado')
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    sub = f'{T("convidadoSubA")} {forte(k, esc(WORKSPACE))} {T("convidadoSubB")} {forte(k, T("papelMember"))}.'
    form = (cabecalho_passo(k, 1, 1, T('convidadoTit'), sub)
            + '<form style="margin:0;display:flex;flex-direction:column;gap:23px;">'
            + campo(k, 'usuario', T('usuario'), usuario, st, frase_usuario, afixo='@', mono=True)
            + caixa_marcar(k, True, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
            + '</form>'
            + botao_passo(k, f'{T("convidadoBotao")} {esc(WORKSPACE)}', livre))
    frase = f'{T("convidadoPreviaA")} @{usuario}.' if livre else T('convitePrevia')
    return pagina_a2(k, form, _previa_time(k, frase, 1, 2), logado=True, largura=512, email=CONVIDADA)


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
    'convidado': lambda k: tela_convidado(k, 'livre'),
    'convidado_ocupado': lambda k: tela_convidado(k, 'ocupado'),
    'convite_invalido': tela_convite_invalido,
}
# as telas que usam os textos do passo de identidade (o contador de passos e a tela do bloco A)
COM_IDENTIDADE = {'codigo', 'ja_tem_conta', 'convidar', 'convidado', 'convidado_ocupado'}
# convidar o time: também os textos de CONVIDAR
COM_CONVIDAR = {'convidar'}
