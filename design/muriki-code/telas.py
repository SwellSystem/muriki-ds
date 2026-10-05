import json
from base import *
from textos import (COMUM, AVALIACAO, CONECTAR, PLANOS, PLANO_INICIAL, ACESSO, PRIMEIRO, PLAYGROUND, juntar)
from textos_exercicio import TEXTOS as EXERCICIO
from textos_arquitetura import TEXTOS as ARQUITETURA
from arquitetura import tela_exercicio_arquitetura
from textos_evolucao import TEXTOS as EVOLUCAO_NOVA
from evolucao import tela_evolucao_nova, tela_evolucao_movel, tela_competencia_nova, tela_evolucao_vazia
from textos_desbloqueio import TEXTOS as DESBLOQUEIO
from textos_troca import TEXTOS as TROCA
from troca import tela_troca, tela_troca_movel, ALTURA_MOVEL as ALTURA_TROCA, CSS_TROCA, ANTES_TROCA, VALORES_TROCA, PROPS_TROCA
from textos_planos_escolha import TEXTOS as PLANOS_ESCOLHA
from planos_escolha import tela_planos_escolha, tela_planos_escolha_movel, ALTURA_MOVEL as ALTURA_PLANOS_ESCOLHA
from desbloqueio import (tela_trilhas_bloqueada, tela_trilha_acima, tela_trilha_liberada, tela_trilha_liberada_movel,
                         ALTURA_MOVEL as ALTURA_LIBERADA, CSS_DESBLOQUEIO)
from textos_conta import CONTA
from textos_onboarding import COMUM_ONB, VERIFICACAO, PREFERENCIAS, PAGAMENTO, PERFIL as PERFIL_ONB
from onboarding import (cabecalho_passo, tela_verificacao, tela_perfil, tela_preferencias, tela_pagamento,
                        ANTES_VERIFICACAO, PROPS_VERIFICACAO, ANTES_PREFERENCIAS, VALORES_PREFERENCIAS,
                        ANTES_PERFIL, PROPS_PERFIL, ANTES_PAGAMENTO, VALORES_PAGAMENTO, PROPS_PAGAMENTO)
from logos import logo_linguagem
from textos_minha_conta import MINHA_CONTA, SUSPENSO
from textos_inicio import INICIO
from textos_sistema import SISTEMA
from sistema import tela_sistema, SISTEMA_TELAS
from inicio import tela_inicio as tela_inicio_primeiro_dia, ANTES_INICIO, PROPS_INICIO
from textos_aprender import TRILHAS, TRILHA, CATALOGO, PEER_WEB, MAPA, BOAS_VINDAS, TRILHAS_VAZIA
from textos_movel import MOVEL
from movel_code import (ALTURAS as ALTURAS_MOVEL, casca_movel, tela_menu_movel, tela_inicio_movel, tela_trilhas_movel, tela_trilha_movel, tela_trilha_lista_movel,
                   tela_exercicios_movel, tela_conta_movel, tela_boas_vindas_movel)
from aprender import (tela_trilhas, tela_trilhas_vazia, tela_trilha, tela_catalogo, tela_peer_web, tela_trilha_mapa, tela_trilha_boas_vindas,
                      ANTES_ETAPAS, VALORES_ETAPAS, PROPS_ETAPAS, CSS_ETAPAS,
                      ANTES_BOAS_VINDAS, VALORES_BOAS_VINDAS, PROPS_BOAS_VINDAS, CSS_SPLASH)
from textos_onboarding import PREFERENCIAS
from onboarding import VALORES_PREFERENCIAS, PROPS_PREFERENCIAS
from conta import (tela_suspenso, tela_conta_dados, tela_conta_aprendizado, tela_conta_seguranca, tela_conta_plano, tela_confirmar_email,
                   ANTES_CONTA_DADOS, VALORES_CONTA_DADOS, PROPS_CONTA_DADOS, ANTES_CONTA_SEGURANCA,
                   VALORES_CONTA_SEGURANCA, PROPS_CONTA_SEGURANCA, ANTES_CONFIRMAR_EMAIL, PROPS_CONFIRMAR_EMAIL,
                   FLUXOS, antes_fluxo, VALORES_FLUXO, props_fluxo)


# ── 2 · Exercício: escrever, montar o projeto, rodar os testes e explicar ──
# `primeira=True` é o mesmo exercício recém-aberto, com o guia de três passos por cima.
TESTES = [
    (True, 'converte horas e minutos', None),
    (True, 'converte só minutos', None),
    (True, 'converte só horas', None),
    (False, 'rejeita texto vazio', ('DurationVazia', '0')),
    (False, 'arredonda segundos para o minuto', ('2', '1.5')),
]


def editor_linhas(k, primeira=False):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    ty = lambda t: f'<span style="color:{k["tbluefg"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    nu = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["fgs"]};font-weight:500;">{t}</span>'
    cursor = (f'<span aria-hidden="true" style="display:inline-block;width:2px;height:17px;margin-left:1px;'
              f'vertical-align:-3px;background:{k["pri"]};"></span>')
    if primeira:
        return [
            f'{kw("export class")} {ty("DurationVazia")} {kw("extends")} {ty("Error")} {{}}',
            '',
            f'{kw("export function")} {fn("parseDuration")}(texto: {ty("string")}): {ty("number")} {{',
            f'  {cursor}',
            '}',
        ]
    return [
        f'{kw("import")} {{ UNIDADES }} {kw("from")} {st("&quot;./unidades&quot;")}',
        '',
        f'{kw("export class")} {ty("DurationVazia")} {kw("extends")} {ty("Error")} {{}}',
        '',
        f'{kw("export function")} {fn("parseDuration")}(texto: {ty("string")}): {ty("number")} {{',
        f'  {kw("const")} partes = texto.matchAll({st("/(\\d+)(h|min|s)/g")})',
        f'  {kw("let")} total = {nu("0")}',
        f'  {kw("for")} ({kw("const")} [, valor, unidade] {kw("of")} partes) {{',
        f'    total += {ty("Number")}(valor) * UNIDADES[unidade]',
        '  }',
        f'  {kw("return")} Math.rou{cursor}',
        '}',
    ]

ARVORE = [
    ('parse-duration', 0, 'pasta', ''),
    ('src', 1, 'pasta', ''),
    ('parse-duration.ts', 2, 'arquivo', 'aberto'),
    ('unidades.ts', 2, 'arquivo', 'novo-hover'),
    ('erros.ts', 2, 'arquivo', 'criando'),
    ('test', 1, 'pasta', ''),
    ('parse-duration.test.ts', 2, 'arquivo', ''),
    ('package.json', 1, 'arquivo', 'travado'),
    ('tsconfig.json', 1, 'arquivo', 'travado'),
    ('README.md', 1, 'arquivo', 'travado'),
]
ARVORE_PRIMEIRA = [a for a in ARVORE if a[3] not in ('novo-hover', 'criando')]


def acao_icone(k, icone, rot, tam=24):
    return (f'<button type="button" aria-label="{rot}" style="display:flex;align-items:center;justify-content:center;'
            f'width:{tam}px;height:{tam}px;border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">{ic(icone, 14)}</button>')


def secao(k, titulo, direita, corpo, borda=True, extra='', dentro=''):
    b = f'border-top:1px solid {k["muted"]};' if borda else ''
    return (f'<section style="display:flex;flex-direction:column;{b}{extra}">'
            f'<div style="display:flex;align-items:center;gap:6px;height:38px;padding:0 6px 0 10px;">'
            f'<button type="button" aria-expanded="true" style="display:flex;align-items:center;gap:6px;height:26px;padding:0 4px;'
            f'border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">'
            f'<span style="display:flex;width:12px;height:12px;">{I["baixo"]}</span>{rotulo(titulo, k["mfg"], 9.5)}</button>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:2px;">{direita}</span></div>'
            f'{corpo}{dentro}</section>')


def arvore(k, primeira=False):
    linhas = ''
    for nome, nivel, tipo, estado in (ARVORE_PRIMEIRA if primeira else ARVORE):
        recuo = 10 + nivel * 12
        seta = (f'<span style="display:flex;width:12px;height:12px;color:{k["mfg"]};">{I["baixo"]}</span>' if tipo == 'pasta'
                else '<span style="width:12px;flex:0 0 auto;"></span>')
        icone = ic(tipo, 14, k['mfg'])
        if estado == 'criando':
            linhas += (
                f'<li style="padding:2px 8px 4px {recuo}px;display:flex;flex-direction:column;gap:3px;">'
                f'<span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;flex:0 0 auto;"></span>{icone}'
                f'<input type="text" aria-label="{T("nomeNovo")}" value="{{{{novoArquivo}}}}" onChange="{{{{mudarNome}}}}" '
                f'style="flex:1;min-width:0;height:24px;padding:0 6px;border:0;border-radius:5px;'
                f'background:{k["card"]};box-shadow:inset 0 0 0 1.5px {k["pri"]};font-family:{FONTE};font-size:12.5px;color:{k["fgs"]};outline:0;"></span>'
                f'<span style="padding-left:38px;font-family:{MONO};font-size:10.5px;color:{k["mfg"]};">{T("criaCancela")}</span></li>')
            continue
        fundo, direita, cor = '', '', k['fg']
        if estado == 'aberto':
            fundo, cor = f'background:{k["prisub"]};', k['prisubfg']
        elif estado == 'novo-hover':
            fundo = f'background:{k["muted"]};'
            direita = (f'<span style="margin-left:auto;display:flex;align-items:center;gap:2px;">'
                       f'{acao_icone(k, "lapis", T("renomear") + " " + nome, 22)}{acao_icone(k, "lixeira", T("excluir") + " " + nome, 22)}</span>')
        elif estado == 'travado':
            cor = k['mfg']
            direita = f'<span style="margin-left:auto;" title="{T("travado")}">{ic("cadeado", 12, k["mfg"])}</span>'
        peso = 'font-weight:600;' if nivel == 0 else ''
        novo = (f'<span title="{T("seu")}" style="margin-left:4px;width:6px;height:6px;border-radius:999px;background:{k["ok"]};flex:0 0 auto;"></span>'
                if estado == 'novo-hover' else '')
        linhas += (f'<li style="display:flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 {recuo}px;border-radius:6px;'
                   f'font-size:12.5px;color:{cor};{fundo}{peso}">{seta}{icone}<span style="white-space:nowrap;">{nome}</span>{novo}{direita}</li>')
    acoes = (acao_icone(k, 'arquivo_mais', T('novoArquivo')) + acao_icone(k, 'pasta_mais', T('novaPasta'))
             + acao_icone(k, 'recolher', T('recolher')))
    return secao(k, T('codigo'), acoes,
                 f'<ul aria-label="{T("estrutura")}" style="margin:0;padding:0 6px 8px;list-style:none;display:flex;flex-direction:column;gap:1px;">{linhas}</ul>',
                 borda=False)


def painel_testes(k, primeira=False, extra='', dentro='', nota_peer='', no_console=None):
    # nota_peer: a fala do Peer depois de rodar os testes, embaixo do primeiro teste que falhou
    # no_console: {nome do teste: chave do texto}, o atalho do teste que falhou para o que ele imprimiu
    linhas, nota_posta = '', False
    for ok, nome, det in TESTES:
        if primeira:
            marca, cor_nome, extra_det = ic('circulo', 12, k['mfg']), k['fg'], ''
        else:
            marca = ic('check' if ok else 'x', 12, k['ok'] if ok else k['bad'])
            cor_nome = k['fgs'] if not ok else k['fg']
            extra_det = ''
            if det:
                extra_det = (f'<span style="display:flex;flex-direction:column;padding-left:20px;font-family:{MONO};font-size:11px;line-height:16px;color:{k["mfg"]};">'
                             f'<span>{T("esperado")} <span style="color:{k["fgs"]};">{det[0]}</span></span>'
                             f'<span>{T("recebido")} <span style="color:{k["bad"]};">{det[1]}</span></span></span>')
        linhas += (f'<li><button type="button" title="{T("abrirTeste")}" style="display:flex;flex-direction:column;gap:3px;width:100%;'
                   f'padding:6px 8px;border:0;border-radius:6px;background:transparent;text-align:left;font-family:{FONTE};">'
                   f'<span style="display:flex;align-items:flex-start;gap:8px;">'
                   f'<span style="margin-top:2px;">{marca}</span>'
                   f'<span style="font-size:12.5px;line-height:17px;color:{cor_nome};">{nome}</span></span>{extra_det}</button></li>')
        if no_console and not ok and nome in no_console:
            linhas += (f'<li style="padding:0 0 4px 28px;"><a href="#" style="font-family:{MONO};font-size:11px;line-height:16px;">'
                       f'{T(no_console[nome])}</a></li>')
        if nota_peer and not ok and not nota_posta and not primeira:
            linhas += f'<li style="padding:2px 4px 6px 24px;">{nota_peer}</li>'
            nota_posta = True
    if primeira:
        resumo = badge(T('naoRodou'), k, 'gray')
        rodape = T('rodeCom')
    else:
        resumo = (f'<span style="display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:4px;'
                  f'background:{k["tred"]};color:{k["tredfg"]};font-size:11px;font-weight:500;">'
                  f'<span style="width:5px;height:5px;border-radius:999px;background:currentColor;"></span>{T("passam")}</span>')
        rodape = T('rodou')
    corpo = (f'<ul aria-label="{T("testes")}" style="margin:0;padding:0 6px;list-style:none;display:flex;flex-direction:column;gap:1px;">{linhas}</ul>'
             f'<span style="padding:6px 16px 10px;font-size:11.5px;color:{k["mfg"]};">{rodape}</span>')
    return secao(k, T('testes'), resumo, corpo, extra=extra, dentro=dentro)


def botao_expandir(k, expandido=False):
    # o painel lateral: recolhe a coluna da esquerda (preenchido quando ela está recolhida)
    cor = k['fgs'] if expandido else k['mfg']
    fundo = f'background:{k["muted"]};' if expandido else 'background:transparent;'
    icone = (f'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">'
             f'<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/>'
             + (f'<path d="M2.5 3.5h3.5v9H2.5z" fill="currentColor" stroke="none"/>' if expandido else '')
             + f'<path d="M6 2.8v10.4"/></svg>')
    rotulo_ = T('mostrarEnunciado') if expandido else T('expandir')
    return (f'<button type="button" aria-label="{rotulo_}" aria-pressed="{"true" if expandido else "false"}" title="{rotulo_}" '
            f'style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:7px;{fundo}color:{cor};">{icone}</button>')


def balao_guia(k, n, posicao):
    # o balão mora dentro da área que ele explica: a posição vem do próprio elemento, não de coordenada solta
    ultimo = n == 3
    pular = '' if ultimo else botao(T('pular'), k, 'ghost', 32, acao='g.fechar')
    seguir = botao(T('comecarGuia') if ultimo else T('proximo'), k, 'solid', 32, acao='g.fechar' if ultimo else 'g.avancar')
    return (f'<sc-if value="{{{{g.passo{n}}}}}" hint-placeholder-val="{{{{ {"true" if n == 1 else "false"} }}}}">'
            f'<div role="dialog" aria-label="{T("guiaAria")}" style="position:absolute;{posicao}z-index:7;width:320px;'
            f'display:flex;flex-direction:column;gap:8px;padding:18px 18px 14px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:0 0 0 1px {k["input"]}, {k["sombraFlut"]};font-family:{FONTE};text-align:left;white-space:normal;">'
            f'<span style="font-family:{MONO};font-size:11px;letter-spacing:0.08em;color:{k["pri"]};">{n} {T("de3")}</span>'
            f'<span style="font-size:15px;line-height:21px;font-weight:600;color:{k["fgs"]};">{T(f"g{n}t")}</span>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["fg"]};">{T(f"g{n}d")}</p>'
            f'<div style="display:flex;align-items:center;gap:8px;padding-top:6px;">{pular}'
            f'<span style="margin-left:auto;display:flex;">{seguir}</span></div></div></sc-if>')


# o que o código imprimiu ao rodar os testes: (teste ou None para "ao carregar", nível, texto)
SAIDA_DO_CONSOLE = [
    (None, 'log', 'unidades carregadas: h, min, s'),
    ('rejeita texto vazio', 'log', 'texto: ""'),
    ('rejeita texto vazio', 'error', "TypeError: Cannot read properties of null (reading 'groups')\n    at parseDuration (parse-duration.ts:6:18)"),
    ('arredonda segundos para o minuto', 'log', "partes: [ '90', 's' ]"),
    ('arredonda segundos para o minuto', 'warn', 'segundos não inteiros: 1.5'),
]


def faixa_console(k, saida):
    # a faixa embaixo do código, como o terminal de uma IDE: ao carregar primeiro, depois cada teste
    grupos = []
    for teste, nivel, texto in saida:
        if not grupos or grupos[-1][0] != teste:
            grupos.append((teste, []))
        grupos[-1][1].append((nivel, texto))
    cor = {'log': f'color:{k["fg"]};', 'warn': f'background:{k["tyellow"]};color:{k["tyellowfg"]};',
           'error': f'background:{k["tred"]};color:{k["tredfg"]};'}
    corpo = ''.join(
        f'<div style="display:flex;flex-direction:column;">'
        f'<span style="font-family:{FONTE};font-size:11.5px;font-weight:500;color:{k["mfg"]};">{teste or T("aoCarregar")}</span>'
        + ''.join(f'<span style="padding:0 6px;border-radius:3px;white-space:pre-wrap;{cor[n]}">{t}</span>' for n, t in linhas)
        + '</div>'
        for teste, linhas in grupos)
    return (f'<section style="display:flex;flex-direction:column;border-top:1px solid {k["muted"]};background:{k["rail"]};">'
            f'<div style="display:flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 14px;">{ic("baixo", 12, k["mfg"])}'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:{k["mfg"]};">{T("consoleTit")}</span>'
            f'<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("consoleLinhas")}</span></div>'
            f'<div role="log" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding:0 16px 12px;'
            f'font-family:{MONO};font-size:12px;line-height:18px;">{corpo}</div></section>')


def tela_exercicio(k, primeira=False, peer=None, console=False):
    # console: a coluna da esquerda recolhida (o editor expandido) e o Console embaixo do código
    # peer (design/muriki-code/peer_exercicio.py): dict com 'testes' (a fala no painel de testes),
    # 'faixa' (a fala acima da barra de status), 'historico' (o cartão na coluna) e 'status'
    peer = peer or {}
    realce = lambda n: f'position:relative;z-index:{{{{g.z{n}}}}};box-shadow:{{{{g.anel{n}}}}};' if primeira else ''
    chips = (badge('Testing', k, 'blue') + badge('Debugging', k, 'blue') + badge(T('nivel'), k, 'gray')
             + (badge(T('primeiroChip'), k, 'blue', ponto=True) if primeira else badge(T('andamento'), k, 'yellow', ponto=True)))
    trilha = topo_detalhe(k, [(T('exercicios'), '#'), ('Testing', '#'), ('parse-duration', '')])
    salvo = '' if primeira else f'<span style="font-size:12px;color:{k["mfg"]};margin-right:6px;">{T("salvo")}</span>'
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{trilha}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div></div>'
           f'<div style="display:flex;align-items:center;gap:8px;">{peer.get("status", "")}{salvo}'
           f'{botao(T("continuarIde"), k, "ghost", 36, "laptop")}'
           f'{botao(T("enviar"), k, "solid", 36, "enviar")}</div></header>')

    exemplo = lambda e, r: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:5px;'
                            f'background:{k["sunken"]};font-family:{MONO};font-size:11.5px;color:{k["fg"]};">'
                            f'<span style="color:{k["ok"]};">"{e}"</span><span style="color:{k["mfg"]};">→</span>{r}</span>')
    exemplos = (f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{exemplo("1h30", "90")}{exemplo("45min", "45")}'
                f'{exemplo("90s", "2")}{exemplo("", "DurationVazia")}</div>')
    req = lambda conteudo: (f'<li style="display:flex;gap:10px;align-items:flex-start;">'
                            f'<span style="margin-top:8px;width:5px;height:5px;border-radius:999px;background:{k["mfg"]};flex:0 0 auto;"></span>'
                            f'<span>{conteudo}</span></li>')
    reqs = (req(T('req1')) + req(T('req2')) + req(f'{T("req3")} {mono("DurationVazia", k, None, 12)}.') + req(T('req4')))
    enunciado = cartao(
        f'{rotulo(T("enunciado"), k["mfg"])}'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("enunciadoTexto")}</p>'
        f'{exemplos}'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:13px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T("precisa")}</h2>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:20px;">{reqs}</ul></div>',
        k, pad='16px 20px', extra='gap:12px;')

    explicacao = cartao(
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("explique"), k["mfg"])}'
        f'<span style="margin-left:auto;">{badge(T("vaiAvaliacao"), k, "blue")}</span></div>'
        f'<label for="explicacao" style="font-size:14px;line-height:21px;font-weight:500;color:{k["fgs"]};">{T("pergunta")}</label>'
        f'<textarea id="explicacao" rows="4" value="{{{{resposta}}}}" onChange="{{{{mudarResposta}}}}" placeholder="{T("placeholder")}" '
        f'style="resize:none;width:100%;padding:10px 12px;border:0;border-radius:8px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:13.5px;line-height:20px;color:{k["fgs"]};outline:0;"></textarea>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("nota")}</span>'
        + (balao_guia(k, 3, 'top:0;left:calc(100% + 16px);') if primeira else ''),
        k, pad='16px 20px', extra='gap:10px;' + realce(3))

    if primeira:
        dicas_txt = f'<span style="font-size:13px;color:{k["fg"]};">{T("dicasDisp")}</span>'
        dicas_botao = botao(T('pedirDica'), k, 'outline', 32)
    else:
        dicas_txt = (f'<span style="font-size:13px;color:{k["fg"]};">{T("dicaUsada")}</span>'
                     f'<a href="#" style="font-size:12px;">{T("verDica")}</a>')
        dicas_botao = botao(T('proximaDica'), k, 'outline', 32)
    dicas = (f'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
             f'{ic("dica", 16, k["warn"])}<span style="display:flex;flex-direction:column;flex:1;min-width:0;">{dicas_txt}</span>'
             f'{dicas_botao}</div>')

    if peer.get('recolher'):
        # o enunciado recolhido, como a pessoa deixa depois de ler: só o cabeçalho do cartão
        enunciado = cartao(f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("enunciado"), k["mfg"])}'
                           f'<span style="margin-left:auto;display:flex;color:{k["mfg"]};transform:rotate(-90deg);">{ic("baixo", 12)}</span></div>',
                           k, pad='14px 20px')
    esquerda = (f'<div style="width:372px;flex:0 0 372px;display:flex;flex-direction:column;gap:12px;">'
                f'{enunciado}{explicacao}{dicas}{peer.get("historico", "")}</div>')
    if console:
        esquerda = ''

    arquivos = ([('parse-duration.ts', True), ('parse-duration.test.ts', False)] if primeira
                else [('parse-duration.ts', True), ('unidades.ts', False), ('parse-duration.test.ts', False)])
    abas = ''
    for nome, at in arquivos:
        f = (f'background:{k["card"]};color:{k["fgs"]};box-shadow:inset 0 -2px 0 {k["pri"]};' if at
             else f'color:{k["mfg"]};')
        cur = ' aria-selected="true"' if at else ' aria-selected="false"'
        abas += (f'<button type="button" role="tab"{cur} style="display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;'
                 f'border:0;background:transparent;font-family:{MONO};font-size:12px;{f}">{ic("arquivo", 13)}{nome}</button>')
    atual = 3 if primeira else 10
    codigo = ''.join(
        f'<div style="display:flex;{"background:" + k["prisub"] + ";" if i == atual else ""}">'
        f'<span style="width:48px;flex:0 0 auto;text-align:right;padding-right:16px;color:{k["mfg"]};opacity:{1 if i == atual else 0.55};">{i + 1}</span>'
        f'<span style="white-space:pre;">{l}</span></div>'
        for i, l in enumerate(editor_linhas(k, primeira)))

    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">'
               f'{arvore(k, primeira)}'
               + painel_testes(k, primeira, extra=(f'background:{k["rail"]};' + realce(2)) if primeira else '',
                               dentro=balao_guia(k, 2, 'top:0;left:calc(100% + 14px);') if primeira else '',
                               nota_peer=peer.get('testes', ''),
                               no_console={'rejeita texto vazio': 'noConsole2', 'arredonda segundos para o minuto': 'noConsole2'} if console else None)
               + f'<div style="flex:1;"></div>'
               f'<div style="display:flex;flex-direction:column;gap:4px;padding:10px 14px 12px;border-top:1px solid {k["muted"]};font-size:11.5px;line-height:16px;color:{k["mfg"]};">'
               f'<span style="display:flex;align-items:center;gap:6px;">{ic("cadeado", 11)}{T("travado")}</span>'
               f'<span style="display:flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;margin:0 2.5px;border-radius:999px;background:{k["ok"]};"></span>{T("seu")}</span></div></div>')

    area = (f'<div style="flex:1;min-height:0;padding:14px 0;font-family:{MONO};font-size:13px;line-height:24px;color:{k["fg"]};'
            f'background:{k["card"]};{realce(1)}">{codigo}'
            + (balao_guia(k, 1, 'top:164px;left:56px;') if primeira else '') + '</div>')
    posicao = 'src/parse-duration.ts · 4:3' if primeira else 'src/parse-duration.ts · 11:18'
    editor = (
        f'<section aria-label="{T("editor")}" style="flex:1;min-width:0;display:flex;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">{lateral}'
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">'
        f'<div style="display:flex;align-items:center;gap:2px;padding:0 8px 0 4px;border-bottom:1px solid {k["muted"]};">'
        f'<div role="tablist" aria-label="{T("abertos")}" style="display:flex;">{abas}</div>'
        f'<span style="margin-left:auto;display:flex;align-items:center;gap:8px;">{botao_expandir(k, console)}{botao(T("rodar"), k, "primary", 30, "rodar")}</span></div>'
        f'{area}{faixa_console(k, SAIDA_DO_CONSOLE) if console else ""}{peer.get("faixa", "")}'
        f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
        f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
        f'<span>{posicao}</span><span>{T("atalho")}</span>'
        f'<span style="margin-left:auto;">{T("semAuto")}</span></div></div></section>')

    corpo = app(k, 'exercicios', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{esquerda}{editor}</div>',
                compacto=True, pad='24px 28px', gap=18)
    if primeira:
        # o véu cobre a tela; só a área do passo atual sobe acima dele
        veu = (f'<sc-if value="{{{{g.ativo}}}}" hint-placeholder-val="{{{{ true }}}}">'
               f'<div aria-hidden="true" style="position:absolute;inset:0;z-index:5;background:{k["veu"]};"></div></sc-if>')
        corpo = corpo[:-len('</div>')] + veu + '</div>'
    return corpo


VALORES_EXERCICIO = """novoArquivo: s.novoArquivo == null ? "erros.ts" : s.novoArquivo,
resposta: s.resposta == null ? t.resposta : s.resposta,
mudarNome: (e) => this.setState({ novoArquivo: e.target.value }),
mudarResposta: (e) => this.setState({ resposta: e.target.value })"""

ANTES_PRIMEIRO = """const pp = this.props.passo;
const passo = s.passo != null ? s.passo : (pp === 0 || pp ? Number(pp) : 1);
const g = {
ativo: passo >= 1 && passo <= 3,
passo1: passo === 1, passo2: passo === 2, passo3: passo === 3,
z1: passo === 1 ? 6 : "auto", z2: passo === 2 ? 6 : "auto", z3: passo === 3 ? 6 : "auto",
anel1: passo === 1 ? "inset 0 0 0 2px var(--pri)" : "none",
anel2: passo === 2 ? "inset 0 0 0 2px var(--pri)" : "none",
anel3: passo === 3 ? "0 0 0 2px var(--pri), var(--sombra)" : "var(--sombra)",
avancar: () => this.setState({ passo: passo + 1 }),
fechar: () => this.setState({ passo: 0 })
};"""

VALORES_PRIMEIRO = """g: g,
novoArquivo: s.novoArquivo == null ? "" : s.novoArquivo,
resposta: s.resposta == null ? "" : s.resposta,
mudarNome: (e) => this.setState({ novoArquivo: e.target.value }),
mudarResposta: (e) => this.setState({ resposta: e.target.value })"""

PROPS_PRIMEIRO = {'passo': {'editor': 'int', 'min': 0, 'max': 3, 'default': 1}}


# ── 3 · Avaliação: a nota é número, o porquê é texto ───────────────────
RUBRICA = [
    ('c1', 4, 'atende', 'green'),
    ('c2', 3, 'atende', 'green'),
    ('c3', 4, 'atende', 'green'),
    ('c4', 2, 'parcial', 'yellow'),
    ('c5', 1, 'naoAtende', 'red'),
]


def barra4(n, k, cor):
    s = ''
    for i in range(4):
        st = f'background:{cor};' if i < n else f'background:{k["sunken"]};box-shadow:inset 0 1px 1px rgba(0,0,0,0.06);'
        s += f'<span style="flex:1;height:6px;border-radius:2px;{st}"></span>'
    return f'<span style="display:flex;gap:3px;width:120px;">{s}</span>'


def tela_avaliacao(k):
    chips = (badge('Testing', k, 'blue') + badge('Design Patterns', k, 'blue') + badge(T('nivelSenior'), k, 'gray')
             + badge(T('enviada'), k, 'gray'))
    cab = cabecalho(k, [(T('avaliacoes'), '#'), ('agenda-slots', '')], T('titulo'), chips=chips,
                    direita=f'<div style="display:flex;gap:8px;">{botao(T("verSolucao"), k, "outline", 36)}</div>')

    cores = dict(green=k['ok'], yellow=k['warn'], red=k['bad'])
    linhas = ''
    for crit, n, estado, tom in RUBRICA:
        linhas += (f'<li style="display:grid;grid-template-columns:minmax(0,1fr) 120px 96px;align-items:center;gap:16px;'
                   f'min-height:48px;padding:0 20px;border-top:1px solid {k["muted"]};">'
                   f'<span style="font-size:13.5px;color:{k["fgs"]};">{T(crit)}</span>{barra4(n, k, cores[tom])}'
                   f'<span style="display:flex;justify-content:flex-end;">{badge(T(estado), k, tom)}</span></li>')
    rubrica = (f'<section aria-label="{T("rubricaAria")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
               f'padding:18px 0 6px;display:flex;flex-direction:column;gap:12px;">'
               f'<div style="display:flex;align-items:center;gap:10px;padding:0 20px;">{rotulo(T("rubricaTesting"), k["mfg"])}'
               f'<span style="margin-left:auto;font-size:13px;color:{k["fg"]};"><b style="font-weight:600;">{T("tresDeCinco")}</b> {T("atendidos")}</span></div>'
               f'<ul style="margin:0;padding:0;list-style:none;">{linhas}</ul></section>')

    def efeito(icone, titulo, txt):
        return (f'<li style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid {k["muted"]};">'
                f'<span style="margin-top:2px;">{ic(icone, 16, k["mfg"])}</span>'
                f'<span style="display:flex;flex-direction:column;gap:2px;">'
                f'<span style="font-size:13px;font-weight:600;color:{k["fgs"]};">{titulo}</span>'
                f'<span style="font-size:13px;color:{k["mfg"]};">{txt}</span></span></li>')
    efeitos = cartao(
        f'{rotulo(T("oQueMuda"), k["mfg"])}'
        f'<ul style="margin:-4px 0 -10px;padding:0;list-style:none;">'
        f'{efeito("evolucao", T("efPerfil"), T("efPerfilTxt"))}'
        f'{efeito("trilhas", T("efTrilhas"), T("efTrilhasTxt"))}'
        f'{efeito("relogio", T("efTraj"), T("efTrajTxt"))}'
        f'</ul>'
        f'<div style="display:flex;gap:8px;padding-top:6px;">{botao(T("irProximo"), k, "solid", 36, "seta")}</div>', k)

    esquerda = f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">{rubrica}{efeitos}</div>'

    ref = lambda t: (f'<a href="#" style="display:inline-flex;align-items:center;height:22px;padding:0 7px;border-radius:4px;'
                     f'background:{k["muted"]};font-family:{MONO};font-size:11.5px;color:{k["fgs"]};">{t}</a>')
    porque = (
        f'<article aria-label="{T("porQue")}" style="width:520px;flex:0 0 520px;display:flex;flex-direction:column;gap:16px;padding:6px 8px 0 4px;">'
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("porQue"), k["mfg"])}</div>'
        f'<div style="display:flex;flex-direction:column;gap:14px;font-size:15px;line-height:25px;color:{k["fg"]};max-width:68ch;">'
        f'<p style="margin:0;">{T("p1")}</p>'
        f'<p style="margin:0;">{T("p2a")} {mono("gerarSlots", k, None, 13.5)} {T("p2b")} {mono("Date.now()", k, None, 13.5)} '
        f'{T("p2c")} {mono("relogioFixo", k, None, 13.5)}{T("p2d")}</p>'
        f'<p style="margin:0;">{T("p3")}</p></div>'
        f'<div style="display:flex;flex-direction:column;gap:8px;">'
        f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("ondeOlhar")}</span>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{ref("agenda-slots.test.ts:18")}{ref("agenda-slots.test.ts:41")}{ref("agenda-slots.ts:7")}</div></div>'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid {k["muted"]};">'
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("explicacaoTit"), k["mfg"])}{badge(T("parcial"), k, "yellow")}</div>'
        f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T("perguntaEx")}</span>'
        f'<p style="margin:0;padding:8px 12px;border-radius:8px;background:{k["sunken"]};font-size:14px;line-height:21px;color:{k["fgs"]};">{T("respostaEx")}</p>'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};max-width:68ch;">{T("porqueEx")}</p></div>'
        f'</article>')
    return app(k, 'avaliacoes', cab + f'<div style="display:flex;gap:32px;flex:1;min-height:0;">{esquerda}{porque}</div>')


# ── 4 · Peer na IDE: quieto quase sempre, pergunta antes de explicar ───
# Segue o tema e o idioma da IDE: sem seletor próprio, copy em pt-BR.
def linha_cod(n, html, k, destaque=False):
    fundo = f'background:{k["tred"]};' if destaque else ''
    return (f'<div style="display:flex;{fundo}"><span style="width:44px;flex:0 0 auto;text-align:right;padding-right:14px;'
            f'color:{k["mfg"]};opacity:0.6;">{n}</span><span style="white-space:pre;">{html}</span></div>')


def tela_peer(k):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    linhas = [
        f'{kw("import")} {{ gerarSlots }} {kw("from")} {st("&quot;../src/agenda-slots&quot;")}',
        '',
        f'{fn("describe")}({st("&quot;gerarSlots&quot;")}, () =&gt; {{',
        f'  {fn("test")}({st("&quot;devolve slots de 30 min no expediente&quot;")}, () =&gt; {{',
        f'    {kw("const")} slots = gerarSlots({{ inicio: {st("&quot;09:00&quot;")}, fim: {st("&quot;18:00&quot;")} }})',
        f'    {fn("expect")}(slots).toHaveLength(18)',
        '  })',
        '',
        f'  {fn("test")}({st("&quot;slots do fim do dia&quot;")}, () =&gt; {{',
        f'    {kw("const")} slots = gerarSlots({{ inicio: {st("&quot;17:00&quot;")}, fim: {st("&quot;18:00&quot;")} }})',
        f'    {fn("expect")}(slots[0].disponivel).toBe({kw("true")})',
        '  })',
        '})',
    ]
    cod = ''.join(linha_cod(i + 1, l, k, destaque=(i == 10)) for i, l in enumerate(linhas))

    arvore = ''
    for nome, nivel, icone, at in [('agenda-slots', 0, 'pasta', False), ('src', 1, 'pasta', False),
                                   ('agenda-slots.ts', 2, 'arquivo', False), ('test', 1, 'pasta', False),
                                   ('agenda-slots.test.ts', 2, 'arquivo', True)]:
        f = f'background:{k["muted"]};color:{k["fgs"]};' if at else f'color:{k["mfg"]};'
        arvore += (f'<div style="display:flex;align-items:center;gap:7px;height:26px;padding-left:{10 + nivel * 14}px;'
                   f'font-size:12.5px;border-radius:5px;{f}">{ic(icone, 13)}{nome}</div>')

    ide = (
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["bg"]};">'
        f'<div style="height:38px;flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:0 14px;'
        f'border-bottom:1px solid {k["border"]};font-size:12px;color:{k["mfg"]};">'
        f'<span style="display:flex;gap:6px;">'
        + ''.join(f'<span style="width:10px;height:10px;border-radius:999px;background:{k["muted"]};"></span>' for _ in range(3))
        + f'</span><span style="margin-left:8px;">agenda-slots · exercícios Muriki</span></div>'
        f'<div style="flex:1;min-height:0;display:flex;">'
        f'<div style="width:220px;flex:0 0 auto;padding:10px 8px;border-right:1px solid {k["border"]};background:{k["rail"]};'
        f'display:flex;flex-direction:column;gap:2px;">'
        f'<div style="padding:4px 10px 8px;">{rotulo("Arquivos", k["mfg"], 9.5)}</div>{arvore}</div>'
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">'
        f'<div style="height:34px;display:flex;align-items:flex-end;padding:0 8px;border-bottom:1px solid {k["border"]};">'
        f'<span style="display:flex;align-items:center;gap:7px;height:30px;padding:0 12px;border-radius:6px 6px 0 0;'
        f'background:{k["card"]};font-size:12px;color:{k["fgs"]};">{ic("arquivo", 12)}agenda-slots.test.ts</span></div>'
        f'<div style="flex:1;padding:14px 0;background:{k["card"]};font-family:{MONO};font-size:12.5px;line-height:22px;color:{k["fg"]};">{cod}</div>'
        f'<div style="height:220px;flex:0 0 auto;border-top:1px solid {k["border"]};background:{k["rail"]};padding:10px 16px;'
        f'font-family:{MONO};font-size:12px;line-height:20px;color:{k["fg"]};display:flex;flex-direction:column;">'
        f'<div style="display:flex;gap:16px;margin-bottom:8px;font-family:{FONTE};font-size:11.5px;">'
        f'<span style="color:{k["fgs"]};border-bottom:1px solid {k["fgs"]};padding-bottom:4px;">Terminal</span>'
        f'<span style="color:{k["mfg"]};">Problemas</span></div>'
        f'<span style="color:{k["mfg"]};">$ bun test</span>'
        f'<span><span style="color:{k["ok"]};">✓</span> gerarSlots &gt; devolve slots de 30 min no expediente</span>'
        f'<span><span style="color:{k["bad"]};">✗</span> gerarSlots &gt; slots do fim do dia</span>'
        f'<span style="color:{k["mfg"]};">    Expected: true</span>'
        f'<span style="color:{k["mfg"]};">    Received: <span style="color:{k["bad"]};">false</span></span>'
        f'<span style="color:{k["mfg"]};">    at agenda-slots.test.ts:11</span>'
        f'<span style="margin-top:6px;"><span style="color:{k["ok"]};">1 pass</span>  <span style="color:{k["bad"]};">1 fail</span></span>'
        f'</div></div></div></div>')

    degraus = ''
    for i, t in enumerate(['pergunta', 'dica', 'explicação']):
        at = i == 0
        f = (f'background:{k["prisub"]};color:{k["prisubfg"]};' if at
             else f'color:{k["mfg"]};border:1px dashed {k["input"]};')
        degraus += f'<span style="display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:4px;font-size:11.5px;{f}">{t}</span>'
        if i < 2:
            degraus += f'<span style="display:flex;width:12px;height:12px;color:{k["mfg"]};">{I["seta"]}</span>'

    pergunta = ('O teste <b style="font-weight:600;">slots do fim do dia</b> passou às 14h e falhou agora, '
                'sem você mexer no código. O que muda entre as duas execuções que o código não controla?')
    fala_peer = lambda t: f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};max-width:68ch;">{t}</p>'
    painel = (
        f'<aside aria-label="Peer" style="width:420px;flex:0 0 420px;background:{k["rail"]};border-left:1px solid {k["border"]};'
        f'display:flex;flex-direction:column;">'
        f'<header style="display:flex;align-items:center;gap:10px;height:52px;padding:0 16px;border-bottom:1px solid {k["border"]};">'
        f'<span style="display:flex;width:24px;height:24px;">{LOGO}</span>'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Peer</span>'
        f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
        f'<span style="width:7px;height:7px;border-radius:999px;background:{k["ok"]};"></span>observando</span>'
        f'<span style="margin-left:auto;">{badge("Testing · Pleno", k, "blue")}</span></header>'
        f'<div style="flex:1;min-height:0;padding:18px 18px;display:flex;flex-direction:column;gap:16px;overflow:hidden;">'
        f'<div style="display:flex;align-items:center;gap:6px;">{degraus}</div>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">test.failed · agenda-slots.test.ts:11</span>'
        f'{fala_peer(pergunta)}'
        f'</div>'
        f'<div style="align-self:flex-end;max-width:320px;padding:10px 13px;border-radius:12px 12px 4px 12px;'
        f'background:{k["card"]};box-shadow:{k["sombra"]};font-size:14px;line-height:21px;color:{k["fgs"]};">'
        f'o horário da máquina? to usando Date.now() dentro do gerarSlots</div>'
        f'{fala_peer("Isso. Se o horário entrasse como parâmetro em vez de ser lido lá dentro, como ficaria esse teste?")}'
        f'<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:{k["sunken"]};">'
        f'{badge("peer.interaction", k, "gray", mono=True)}<span style="font-size:12px;color:{k["mfg"]};">registrada como evidência de Testing</span></div>'
        f'</div>'
        f'<div style="padding:14px 16px;border-top:1px solid {k["border"]};display:flex;flex-direction:column;gap:10px;">'
        f'<label for="peer-msg" style="font-size:12px;color:{k["mfg"]};">Pergunte ao Peer</label>'
        f'<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};">'
        f'<textarea id="peer-msg" rows="2" placeholder="Escreva o que você está pensando" style="resize:none;border:0;outline:0;'
        f'background:transparent;font-family:{FONTE};font-size:14px;line-height:21px;color:{k["fgs"]};"></textarea>'
        f'<div style="display:flex;align-items:center;gap:8px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">⌘ ↵ envia</span>'
        f'<span style="margin-left:auto;">{botao("", k, "primary", 30, "enviar", aria="Enviar ao Peer")}</span></div></div>'
        f'<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:{k["mfg"]};">'
        f'{ic("cadeado", 13)}<span style="flex:1;">Ligado neste projeto. Só o trecho em volta do evento é enviado.</span>'
        f'<a href="#" style="font-size:12px;">Desligar</a></div></div>'
        f'</aside>')

    return f'{raiz(k, "display:flex;", lang="pt-BR")}{ide}{painel}</div>'


# ── 5 · Conectar a IDE: o código aparece na IDE, a confirmação é no navegador
def tela_conectar(k):
    pode = lambda t, ok: (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:20px;color:{k["fg"]};">'
                          f'<span style="margin-top:2px;">{ic("check" if ok else "x", 14, k["ok"] if ok else k["bad"])}</span>{t}</li>')
    codigo = ''.join(
        f'<span style="display:flex;align-items:center;justify-content:center;width:44px;height:56px;border-radius:8px;'
        f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);font-family:{MONO};font-size:26px;font-weight:500;color:{k["fgs"]};">{c}</span>'
        if c != '-' else f'<span style="width:14px;height:2px;background:{k["input"]};"></span>'
        for c in 'K7QM-4TXD')
    card = (
        f'<section aria-labelledby="conectar-titulo" style="width:560px;background:{k["card"]};border-radius:16px;box-shadow:{k["sombraFlut"]};'
        f'padding:32px 36px;display:flex;flex-direction:column;gap:22px;">'
        f'<div style="display:flex;flex-direction:column;gap:8px;">{rotulo(T("rotulo"), k["mfg"])}'
        f'<h1 id="conectar-titulo" style="margin:0;font-size:24px;line-height:30px;font-weight:600;color:{k["fgs"]};">{T("titulo")}</h1>'
        f'<p style="margin:0;font-size:14px;color:{k["mfg"]};">{T("pedidoA")} '
        f'<b style="font-weight:500;color:{k["fg"]};">{T("pedidoIde")}</b>{T("pedidoB")}</p></div>'
        f'<div style="display:flex;align-items:center;gap:8px;">{codigo}</div>'
        f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:20px;padding-top:4px;border-top:1px solid {k["muted"]};">'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;">'
        f'<span style="font-size:12.5px;font-weight:600;color:{k["fgs"]};">{T("vaiPoder")}</span>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
        f'{pode(T("pode1"), True)}'
        f'{pode(T("pode2"), True)}</ul></div>'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;">'
        f'<span style="font-size:12.5px;font-weight:600;color:{k["fgs"]};">{T("nunca")}</span>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
        f'{pode(T("nunca1"), False)}'
        f'{pode(T("nunca2"), False)}</ul></div></div>'
        f'<div style="display:flex;gap:10px;">{botao(T("conectar"), k, "solid", 40)}{botao(T("naoFuiEu"), k, "outline", 40)}</div>'
        f'</section>')

    disp = lambda nome, sub: (
        f'<li style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid {k["muted"]};">'
        f'<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:{k["muted"]};">{ic("laptop", 16, k["mfg"])}</span>'
        f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span></span>'
        f'{botao(T("desconectar"), k, "ghost", 30, "sair")}</li>')
    dispositivos = (
        f'<section aria-label="{T("dispositivos")}" style="width:560px;display:flex;flex-direction:column;gap:6px;">'
        f'<div style="display:flex;align-items:center;justify-content:space-between;padding:0 2px 6px;">'
        f'{rotulo(T("jaConectadas"), k["mfg"])}<span style="font-size:12px;color:{k["mfg"]};">{T("cadaIde")}</span></div>'
        f'<ul style="margin:0;padding:0;list-style:none;">'
        f'{disp("Cursor · Linux", T("cursorSub"))}</ul></section>')

    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki")}'
            f'<main style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding-bottom:64px;">'
            f'{card}{dispositivos}</main></div>')


# ── 6 · Planos: dois, e independentes do Platform ──────────────────────
def tela_planos(k):
    toggle = (f'<div role="radiogroup" aria-label="{T("periodo")}" style="display:inline-flex;padding:3px;border-radius:999px;'
              f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);">'
              f'<button type="button" role="radio" aria-checked="true" style="height:30px;padding:0 16px;border-radius:999px;border:0;'
              f'background:{k["card"]};box-shadow:{k["sombra"]};font-family:{FONTE};font-size:13px;font-weight:500;color:{k["fgs"]};">{T("mensal")}</button>'
              f'<button type="button" role="radio" aria-checked="false" style="height:30px;padding:0 16px;border-radius:999px;border:0;'
              f'background:transparent;font-family:{FONTE};font-size:13px;color:{k["mfg"]};">{T("anual")}</button></div>')
    cab = cabecalho(k, None, T('titulo'), T('sub'), direita=toggle)

    def item(t, ok=True, tracejado=False):
        if tracejado:
            marca = f'<span style="margin-top:1px;">{badge(T("aDefinir"), k, tracejado=True)}</span>'
            return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["mfg"]};">'
                    f'<span style="flex:1;">{t}</span>{marca}</li>')
        return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["fg"]};">'
                f'<span style="margin-top:3px;">{ic("check", 15, k["ok"])}</span><span>{t}</span></li>')

    def plano(nome, aria, preco, sub, itens, acao, destaque=False, selo=''):
        borda = f'box-shadow:0 0 0 1.5px {k["pri"]}, {k["sombraFlut"]};' if destaque else f'box-shadow:{k["sombra"]};'
        return (f'<section aria-label="{aria}" style="flex:1;min-width:0;background:{k["card"]};border-radius:16px;{borda}'
                f'padding:28px 30px;display:flex;flex-direction:column;gap:20px;">'
                f'<div style="display:flex;align-items:center;gap:8px;">'
                f'<h2 style="margin:0;font-size:18px;font-weight:600;color:{k["fgs"]};">{nome}</h2>{selo}</div>'
                f'<div style="display:flex;flex-direction:column;gap:4px;">'
                f'<span style="font-size:34px;line-height:40px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.02em;">{preco}</span>'
                f'<span style="font-size:13px;color:{k["mfg"]};">{sub}</span></div>'
                f'<ul style="margin:0;padding:18px 0 0;border-top:1px solid {k["muted"]};list-style:none;display:flex;flex-direction:column;gap:12px;flex:1;">{itens}</ul>'
                f'{acao}</section>')

    starter = plano(
        'Starter', T('ariaStarter'), T('gratis'), T('semCartao'),
        item(T('s1'))
        + item(T('s2'))
        + item(T('s3'))
        + item(T('s4'), tracejado=True)
        + item(T('peer'), tracejado=True),
        botao(T('mudarStarter'), k, 'outline', 40, largura='100%'))
    pro = plano(
        'Pro', T('ariaPro'), f'{T("preco")}<span style="font-size:15px;font-weight:500;color:{k["mfg"]};">{T("porMes")}</span>',
        f'{T("porAno")} · <b style="font-weight:500;color:{k["ok"]};">{T("testeAte")}</b>',
        item(T('p1'))
        + item(T('p2'))
        + item(T('p3'))
        + item(T('p4'))
        + item(T('p5'), tracejado=True),
        botao(T('atualBotao'), k, 'outline', 40, largura='100%', desativado=True),
        destaque=True, selo=badge(T('atual'), k, 'blue'))

    regra = lambda icone, t: (f'<li style="display:flex;gap:10px;align-items:flex-start;flex:1;font-size:13px;line-height:20px;color:{k["mfg"]};">'
                              f'<span style="margin-top:2px;">{ic(icone, 15, k["mfg"])}</span><span>{t}</span></li>')
    regras = (f'<ul style="margin:0;padding:18px 4px 0;list-style:none;display:flex;gap:28px;border-top:1px solid {k["muted"]};">'
              f'{regra("relogio", T("r1"))}'
              f'{regra("troca", T("r2"))}'
              f'{regra("peer", T("r3"))}</ul>')
    return app(k, 'plano', cab + f'<div style="display:flex;gap:24px;max-width:980px;">{starter}{pro}</div>{regras}')


# ── Entrar e criar conta: o bloco login-page do DS, com a mensagem do Code ──
# Estrutura, medidas e hierarquia vêm de registry/muriki/blocks/login-page; o que é do Code
# é o texto (o bloco lê tudo do i18n do app) e os provedores: GitHub na frente, sem SSO nem
# Microsoft, porque o Code não tem organização.
def tela_acesso(k, modo, sufixo):
    criar = modo == 'criar'
    h = lambda caminho: '{{' + caminho + '}}'
    linha = lambda cor, largura: f'<span style="height:1px;{largura}background:{cor};"></span>'

    decoracao = (
        f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;'
        f'background:linear-gradient(to bottom right, color-mix(in oklch, {k["pri"]} 15%, transparent), transparent 50%, transparent);"></div>'
        f'<div aria-hidden="true" style="position:absolute;top:-96px;left:-96px;width:520px;height:520px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["pri"]} 20%, transparent);filter:blur(160px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:0;bottom:0;width:420px;height:420px;border-radius:999px;'
        f'transform:translate(33.333%, 25%);background:color-mix(in oklch, {k["accent"]} 25%, transparent);filter:blur(120px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:-40px;bottom:-64px;width:480px;height:480px;display:flex;'
        f'opacity:0.08;transform:rotate(-6deg);pointer-events:none;">'
        f'<span style="display:{{{{senha.olhoA}}}};width:100%;height:100%;">{LOGO}</span><span style="display:{{{{senha.olhoF}}}};width:100%;height:100%;">{LOGO_FECHADO}</span>'
        f'</div>')
    painel = (
        f'<aside style="position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;'
        f'padding:64px;background:{k["sunken"]};box-shadow:inset -1px 0 0 {k["border"]};">{decoracao}'
        f'<div style="position:relative;z-index:1;display:flex;align-items:center;gap:10px;">'
        f'<span style="display:flex;width:36px;height:36px;">'
        f'<span style="display:{{{{senha.olhoA}}}};width:100%;height:100%;">{LOGO}</span><span style="display:{{{{senha.olhoF}}}};width:100%;height:100%;">{LOGO_FECHADO}</span>'
        f'</span>{legenda("muriki / code", k)}</div>'
        f'<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:24px;max-width:512px;">'
        f'<div style="display:flex;align-items:center;gap:12px;">{legenda(T("acesso"), k, "0.3em")}{linha(k["pri"], "width:64px;")}</div>'
        f'<h2 style="margin:0;font-size:72px;line-height:0.95;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
        f'{T("pitch1")}<br><span style="color:{k["pri"]};">{T("pitch2")}.</span></h2>'
        f'<p style="margin:0;max-width:384px;font-size:16px;line-height:1.625;color:{k["mfg"]};">{T("pitchTxt")}</p></div>'
        f'<div style="position:relative;z-index:1;">{legenda(T("direitos"), k)}</div></aside>')

    def provedor_largo(icone, nome):
        return (f'<button type="button" aria-label="{T("criarCom" if criar else "entrarCom")} {nome}" style="display:flex;align-items:center;'
                f'justify-content:center;gap:10px;width:100%;height:44px;border-radius:10px;border:1px solid {k["input"]};'
                f'background:{k["card"]};font-family:{FONTE};cursor:pointer;">'
                f'<span style="display:flex;width:18px;height:18px;color:{k["fgs"]};">{I[icone]}</span>'
                f'<span style="font-size:14px;font-weight:500;letter-spacing:-0.01em;color:{k["fgs"]};">{nome}</span></button>')

    def campo(id_, rotulo_, icone, tipo, valor, mudar, ph, cabeca='', depois='', olho=False, auto=''):
        botao_olho = ''
        if olho:
            botao_olho = (f'<button type="button" aria-label="{h("senha.olhoRotulo")}" aria-pressed="{h("senha.verSenha")}" '
                          f'onClick="{h("alternarSenha")}" style="position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;'
                          f'align-items:center;justify-content:center;width:32px;height:32px;border:0;background:transparent;color:{k["mfg"]};cursor:pointer;">'
                          f'<sc-if value="{h("senha.naoVer")}" hint-placeholder-val="{{{{ true }}}}">{ic("olho", 18)}</sc-if>'
                          f'<sc-if value="{h("senha.verSenha")}" hint-placeholder-val="{{{{ false }}}}">{ic("olho_fechado", 18)}</sc-if></button>')
        return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                f'<div style="display:flex;align-items:center;justify-content:space-between;">'
                f'<label for="{id_}" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.25em;'
                f'text-transform:uppercase;color:{k["mfg"]};">{rotulo_}</label>{cabeca}</div>'
                f'<div style="position:relative;display:flex;align-items:center;">'
                f'<span style="position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;opacity:0.6;color:{k["mfg"]};">{ic(icone, 18)}</span>'
                f'<input id="{id_}" type="{tipo}" autocomplete="{auto}" placeholder="{ph}" value="{h(valor)}" onChange="{h(mudar)}" '
                f'style="width:100%;height:44px;padding:0 {36 if olho else 0}px 0 28px;border:0;border-bottom:1px solid {k["input"]};'
                f'border-radius:0;background:transparent;font-family:{FONTE};font-size:16px;color:{k["fgs"]};outline:0;">'
                f'{botao_olho}</div>{depois}</div>')

    # a mesma régua do DS: 8 caracteres, número, minúscula e maiúscula; vazia, a barra guarda o lugar
    forca = (
        f'<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px;visibility:{h("senha.visivel")};">'
        f'<div role="meter" aria-label="{T("forcaAria")}" aria-valuemin="0" aria-valuemax="4" aria-valuenow="{h("senha.feitos")}" '
        f'aria-valuetext="{h("senha.rotulo")}" style="display:flex;gap:6px;">'
        + ''.join(f'<span style="height:4px;flex:1;border-radius:999px;background:{h(f"senha.s{x}")};"></span>' for x in range(1, 5))
        + f'</div><ul aria-label="{T("reqAria")}" style="margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:4px 10px;">'
        f'<sc-for list="{h("senha.req")}" as="r" hint-placeholder-count="4">'
        f'<li style="display:flex;align-items:center;gap:4px;font-family:{MONO};font-size:10px;line-height:14px;letter-spacing:0.025em;color:{h("r.cor")};">'
        f'<sc-if value="{h("r.ok")}" hint-placeholder-val="{{{{ true }}}}">{ic("check", 12)}</sc-if>'
        f'<sc-if value="{h("r.nao")}" hint-placeholder-val="{{{{ false }}}}"><span style="display:flex;opacity:0.6;">{ic("x", 12)}</span></sc-if>'
        f'<span>{h("r.txt")}</span></li></sc-for></ul></div>')

    enviar = lambda txt, href: (
        f'<a href="{href}" style="display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 20px;'
        f'border-radius:10px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;letter-spacing:0.025em;">'
        f'<span>{txt}</span><span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["prifg"]} 15%, transparent);">{ic("seta", 14)}</span></a>')

    if criar:
        rotulo_, hero_a, hero_b = T('rotuloCriar'), T('heroCriarA'), T('heroCriarB')
        sub = f'{T("subCriar")} <a href="Entrar{sufixo}.dc.html" style="font-weight:500;color:{k["fg"]};">{T("entrarLink")}</a>'
        com = T('criarCom')
        # o formulário do criar conta é montado no modo 'criar', mais abaixo (sem senha: ela vem pelo email)
        campos, fim, gap_form = '', '', 20
    else:
        rotulo_, hero_a, hero_b = T('entrar'), T('heroA'), T('heroB')
        sub = f'{T("subEntrar")} <a href="CriarConta{sufixo}.dc.html" style="font-weight:500;color:{k["fg"]};">{T("criarLink")}</a>'
        com = T('entrarCom')
        esqueci = (f'<a href="EsqueciSenha{sufixo}.dc.html" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.2em;'
                   f'text-transform:uppercase;color:{k["mfg"]};">{T("esqueci")}</a>')
        campos = (campo('email', T('emailLabel'), 'envelope', 'email', 'email', 'mudarEmail', T('emailPh'), auto='email webauthn')
                  + campo('senha', T('senhaLabel'), 'cadeado', h('senha.tipo'), 'senha.valor', 'mudarSenha', T('senhaPh'),
                          cabeca=esqueci, olho=True, auto='current-password'))
        # sem "lembrar de mim": todo login do Code já é persistente
        fim = enviar(T('entrar'), f'Main{sufixo}.dc.html')
        gap_form = 24
    if modo == 'passkey':
        rotulo_, hero_a, hero_b, sub = T('rotuloPasskey'), T('heroPasskeyA'), T('heroPasskeyB'), T('subPasskey')

    if modo == 'passkey':
        # o mesmo pedido da passkey do backoffice: o navegador abre o pedido e a tela espera
        aneis = ''.join(
            f'<span aria-hidden="true" style="position:absolute;inset:{-i * 14}px;border-radius:999px;'
            f'box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["pri"]} {40 - i * 12}%, transparent);"></span>' for i in (1, 2, 3))
        corpo = (
            f'<div role="status" style="display:flex;flex-direction:column;align-items:center;gap:22px;padding:34px 24px 26px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, {k["sombra"]};">'
            f'<span style="position:relative;display:flex;align-items:center;justify-content:center;width:72px;height:72px;margin:18px 0;'
            f'border-radius:999px;background:{k["prisub"]};color:{k["pri"]};">{aneis}<span style="display:flex;width:34px;height:34px;">{I["digital"]}</span></span>'
            f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;">'
            f'<span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:{k["fgs"]};">'
            f'<span style="width:7px;height:7px;border-radius:999px;background:{k["warn"]};"></span>{T("aguardando")}</span>'
            f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};max-width:320px;">{T("aguardandoTxt")}</span></div>'
            f'<a href="#" style="display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 12px;border-radius:8px;'
            f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};color:{k["fgs"]};font-size:13px;font-weight:500;">'
            f'{ic("troca", 14)}{T("pedirDeNovo")}</a></div>'
            f'<div style="display:flex;align-items:flex-start;gap:10px;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
            f'<span style="display:flex;margin-top:1px;color:{k["ok"]};">{ic("cadeado", 15)}</span><span>{T("passkeyNota")}</span></div>'
            f'<a href="Entrar{sufixo}.dc.html" style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;'
            f'font-size:13px;font-weight:500;color:{k["mfg"]};"><span style="display:flex;transform:rotate(180deg);">{ic("seta", 13)}</span>'
            f'{T("usarEmail")}</a>')
    else:
        # a API do Code entra por email e senha ou por passkey, sem GitHub nem Google; a passkey só
        # existe depois da conta criada, então o criar conta fica só com o formulário
        entrada = ''
        if not criar:
            entrada = (
                f'<div style="display:flex;flex-direction:column;gap:10px;">{legenda(com, k)}'
                f'<a href="Passkey{sufixo}.dc.html" style="display:grid;">{provedor_largo("digital", "Passkey")}</a>'
                f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("passkeyDica")}</span></div>'
                f'<div style="display:flex;align-items:center;gap:12px;">{linha(k["input"], "flex:1;")}{legenda(T("ou"), k)}{linha(k["input"], "flex:1;")}</div>')
        corpo = f'{entrada}<form style="display:flex;flex-direction:column;gap:{gap_form}px;margin:0;">{campos}{fim}</form>'

    def formulario_de(rotulo_, hero_a, hero_b, sub, corpo):
        segunda = f'<br><span style="color:{k["pri"]};">{hero_b}</span>' if hero_b else ''
        return (
            f'<div style="grid-column:2;display:flex;flex-direction:column;gap:20px;">'
            f'<div style="display:flex;align-items:center;gap:12px;">{legenda(rotulo_, k)}{linha(k["pri"], "width:40px;")}{linha(k["input"], "flex:1;")}</div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;">'
            f'<h1 style="margin:0;font-size:36px;line-height:1;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
            f'{hero_a}{segunda}</h1>'
            f'<p style="margin:0;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p></div>'
            f'{corpo}</div>')

    se = lambda chave, html, padrao=False: (f'<sc-if value="{h("e." + chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                            f'{html}</sc-if>')
    enviar_acao = lambda txt, acao: (
        f'<button type="button" onClick="{h(acao)}" style="display:flex;align-items:center;justify-content:space-between;width:100%;height:44px;'
        f'padding:0 20px;border:0;border-radius:10px;background:{k["pri"]};color:{k["prifg"]};font-family:{FONTE};font-size:15px;'
        f'font-weight:500;letter-spacing:0.025em;cursor:pointer;">'
        f'<span>{txt}</span><span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["prifg"]} 15%, transparent);">{ic("seta", 14)}</span></button>')
    nota = lambda txt, icone=None: (f'<span style="display:flex;align-items:flex-start;gap:8px;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
                                   + (f'<span style="display:flex;margin-top:2px;">{ic(icone, 13)}</span>' if icone else '') + f'<span>{txt}</span></span>')
    link_voltar = lambda txt, href='', acao='': (
        f'<a href="{href or "#"}"' + (f' onClick="{h(acao)}"' if acao else '') + f' style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;'
        f'font-size:13px;font-weight:500;color:{k["mfg"]};"><span style="display:flex;transform:rotate(180deg);">{ic("seta", 13)}</span>{txt}</a>')
    botao_sec = lambda txt, acao='', icone='troca': (
        f'<button type="button"' + (f' onClick="{h(acao)}"' if acao else '') + f' style="display:inline-flex;align-items:center;justify-content:center;gap:8px;'
        f'height:44px;padding:0 16px;border:0;border-radius:10px;box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};'
        f'color:{k["fgs"]};font-family:{FONTE};font-size:14px;font-weight:500;cursor:pointer;">{ic(icone, 15)}{txt}</button>')
    email_b = f'<b style="font-weight:500;color:{k["fgs"]};">{h("email")}</b>'
    erro = lambda txt: (f'<p role="alert" style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:19px;color:{k["bad"]};">'
                        f'<span style="display:flex;margin-top:3px;">{ic("x", 12)}</span><span>{txt}</span></p>')

    if modo == 'criar':
        # a API cria a conta sem senha: nome, email e o captcha; a senha vem pelo link do email
        captcha = (f'<div aria-label="{T("captcha")}" style="display:flex;align-items:center;gap:12px;height:64px;padding:0 14px;border-radius:8px;'
                   f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};">'
                   f'<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:999px;'
                   f'background:{k["tgreen"]};color:{k["ok"]};">{ic("check", 13)}</span>'
                   f'<span style="font-size:14px;color:{k["fgs"]};">{T("captchaOk")}</span>'
                   f'<span style="margin-left:auto;font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;color:{k["mfg"]};'
                   f'text-align:right;">Cloudflare Turnstile</span></div>')
        form_corpo = (f'<form style="display:flex;flex-direction:column;gap:20px;margin:0;">'
                      + campo('nome', T('nomeLabel'), 'pessoa', 'text', 'nome', 'mudarNome', T('nomePh'), auto='name')
                      + campo('email', T('emailLabel'), 'envelope', 'email', 'email', 'mudarEmail', T('emailPh'), auto='email')
                      + captcha + enviar_acao(T('criarEnviar'), 'e.enviarForm') + nota(T('semTreino'), 'cadeado') + '</form>')
        enviado_corpo = (f'<div style="display:flex;flex-direction:column;gap:14px;">'
                         f'<div style="display:flex;gap:8px;flex-wrap:wrap;">{botao_sec(T("reenviar"))}</div>'
                         f'{nota(T("naoChegou"))}{link_voltar(T("outroEmail"), acao="e.voltarForm")}</div>')
        sub_criar = f'{T("subCriar")} <a href="Entrar{sufixo}.dc.html" style="font-weight:500;color:{k["fg"]};">{T("entrarLink")}</a>'
        formulario = (se('formulario', formulario_de(T('rotuloCriar'), T('heroCriarA'), T('heroCriarB'), sub_criar, form_corpo), True)
                      + se('enviado', formulario_de(T('enviadoRotulo'), T('enviadoA'), T('enviadoB'),
                                                    f'{T("enviadoSub")} {email_b} {T("enviadoTxt")}', enviado_corpo)))
    elif modo in ('criarSenha', 'redefinir'):
        # 12 a 128 caracteres e fora de vazamentos (PASSWORD_COMPROMISED); o link vale 24 h e uma vez
        rot = T('criarSenhaRotulo') if modo == 'criarSenha' else T('redefinirRotulo')
        ha, hb = (T('criarSenhaA'), T('criarSenhaB')) if modo == 'criarSenha' else (T('redefinirA'), T('redefinirB'))
        form_corpo = (f'<form style="display:flex;flex-direction:column;gap:20px;margin:0;">'
                      + campo('senha', T('novaSenha'), 'cadeado', h('senha.tipo'), 'senha.valor', 'mudarSenha', T('novaSenhaPh'),
                              depois=forca, olho=True, auto='new-password')
                      + se('vazada', erro(T('vazada')))
                      + enviar(T('salvarSenha'), f'Entrar{sufixo}.dc.html') + nota(T('depoisEntrar')) + '</form>')
        expirado_corpo = (f'<div style="display:flex;flex-direction:column;gap:14px;">'
                          f'{enviar(T("pedirNovo"), f"EsqueciSenha{sufixo}.dc.html")}{link_voltar(T("voltarEntrar"), f"Entrar{sufixo}.dc.html")}</div>')
        formulario = (se('formulario', formulario_de(rot, ha, hb, f'{T("criarSenhaSub")} {email_b}.', form_corpo), True)
                      + se('expirado', formulario_de(rot, T('expiradoTit'), '', T('expiradoTxt'), expirado_corpo)))
    elif modo == 'esqueci':
        form_corpo = (f'<form style="display:flex;flex-direction:column;gap:20px;margin:0;">'
                      + campo('email', T('emailLabel'), 'envelope', 'email', 'email', 'mudarEmail', T('emailPh'), auto='email')
                      + enviar_acao(T('enviarLink'), 'e.enviarForm') + link_voltar(T('voltarEntrar'), f'Entrar{sufixo}.dc.html') + '</form>')
        enviado_corpo = (f'<div style="display:flex;flex-direction:column;gap:14px;">'
                         f'<div style="display:flex;gap:8px;flex-wrap:wrap;">{botao_sec(T("reenviar"))}</div>'
                         f'{nota(T("naoChegou"))}{link_voltar(T("voltarEntrar"), f"Entrar{sufixo}.dc.html")}</div>')
        formulario = (se('formulario', formulario_de(T('esqueciRotulo'), T('esqueciA'), T('esqueciB'), T('esqueciSub'), form_corpo), True)
                      + se('enviado', formulario_de(T('esqueciRotulo'), T('esqueciEnviadoA'), T('esqueciEnviadoB'), T('esqueciEnviadoTxt'), enviado_corpo)))
    elif modo == 'codigo':
        # o passo do código no login: 6 dígitos do app, ou um código de backup (vale uma vez)
        caixa = lambda i: (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;height:56px;border-radius:12px;'
                           f'background:{k["card"]};box-shadow:{h("e.anel")};font-family:{MONO};font-size:24px;font-weight:500;color:{k["fgs"]};">'
                           f'{h(f"e.d{i}")}</span>')
        quadros = (f'<div role="group" aria-label="{T("codigoLegenda")}" style="display:flex;align-items:center;gap:8px;">'
                   f'{caixa(0)}{caixa(1)}{caixa(2)}<span style="width:12px;flex:0 0 12px;height:2px;border-radius:1px;background:{k["input"]};"></span>'
                   f'{caixa(3)}{caixa(4)}{caixa(5)}</div>')
        leg = lambda t: (f'<span style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;'
                         f'color:{k["mfg"]};">{t}</span>')
        troca = lambda txt, acao: (f'<button type="button" onClick="{h(acao)}" style="align-self:flex-start;border:0;padding:0;background:transparent;'
                                   f'font-family:{FONTE};font-size:13px;font-weight:500;color:{k["pri"]};cursor:pointer;">{txt}</button>')
        totp = (f'<div style="display:flex;flex-direction:column;gap:10px;">{leg(T("codigoLegenda"))}{quadros}'
                + se('invalido', erro(T('codigoInvalido'))) + f'</div>'
                + enviar(T('verificar'), f'Main{sufixo}.dc.html') + troca(T('usarBackup'), 'e.modoBackup') + nota(T('naoConsegue')))
        backup = (f'<div style="display:flex;flex-direction:column;gap:10px;">{leg(T("backupLegenda"))}'
                  f'<input aria-label="{T("backupLegenda")}" autocomplete="one-time-code" spellcheck="false" value="8f3k-2m9q" placeholder="{T("backupPh")}" '
                  f'style="height:56px;padding:0 16px;border:0;border-radius:12px;box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};'
                  f'font-family:{MONO};font-size:22px;letter-spacing:0.12em;color:{k["fgs"]};outline:0;">'
                  f'{nota(T("backupNota"))}</div>'
                  + enviar(T('verificar'), f'Main{sufixo}.dc.html') + troca(T('usarApp'), 'e.modoApp'))
        corpo_codigo = (f'<div style="display:flex;flex-direction:column;gap:18px;">'
                        + se('totp', totp, True) + se('backup', backup) + '</div>')
        formulario = formulario_de(T('codigoRotulo'), T('codigoA'), T('codigoB'),
                                   f'{T("codigoSub")} <span style="font-family:{MONO};font-size:13px;color:{k["fg"]};">rafael@moura.dev</span>', corpo_codigo)
    else:
        formulario = formulario_de(rotulo_, hero_a, hero_b, sub, corpo)

    lado = (f'<main style="position:relative;display:flex;flex-direction:column;min-width:0;">'
            f'<header style="display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:32px 48px 0;">'
            f'{botao_idioma(k)}{botao_tema(k)}</header>'
            f'<div style="flex:1;display:grid;grid-template-columns:minmax(0, 0.8fr) minmax(0, 440px) minmax(0, 1fr);'
            f'align-content:center;padding:24px 80px;">{formulario}</div></main>')
    return f'{raiz(k, "display:grid;grid-template-columns:1.05fr 1fr;")}{painel}{lado}</div>'


def antes_acesso(nome, email, senha, modo='entrar', estado='formulario'):
    # senha nova (criar e redefinir): a régua da API é só o tamanho, 12 a 128; a força sobe com ele
    nova = modo in ('criarSenha', 'redefinir')
    regua = ("""const REQ = [["req12", valor.length >= 12]];
const feitos = !valor ? 0 : valor.length >= 20 ? 4 : valor.length >= 16 ? 3 : valor.length >= 12 ? 2 : 1;""" if nova else
             """const REQ = [["req8", valor.length >= 8], ["reqNum", /\\d/.test(valor)], ["reqMin", /[a-z]/.test(valor)], ["reqMai", /[A-Z]/.test(valor)]];
const feitos = REQ.filter((r) => r[1]).length;""")
    return f"""const nome = s.nome == null ? {json.dumps(nome)} : s.nome;
const email = s.email == null ? {json.dumps(email)} : s.email;
const valor = s.senha == null ? {json.dumps(senha)} : s.senha;
const ver = !!s.verSenha;
{regua}
const est = s.estado || this.props.estado || {json.dumps(estado)};
const DIG = est === "invalido" ? ["4", "8", "2", "9", "1", "7"] : ["4", "8", "2", "9", "1", ""];
const e = {{
formulario: est === "formulario" || est === "vazada", enviado: est === "enviado", vazada: est === "vazada", expirado: est === "expirado",
totp: est !== "backup", backup: est === "backup", invalido: est === "invalido",
anel: est === "invalido" ? "inset 0 0 0 1.5px var(--bad)" : "inset 0 0 0 1px var(--input)",
d0: DIG[0], d1: DIG[1], d2: DIG[2], d3: DIG[3], d4: DIG[4], d5: DIG[5],
enviarForm: () => this.setState({{ estado: "enviado" }}), voltarForm: () => this.setState({{ estado: "formulario" }}),
modoBackup: () => this.setState({{ estado: "backup" }}), modoApp: () => this.setState({{ estado: "totp" }})
}};
const forca = !valor ? "" : feitos <= 1 ? "Fraca" : feitos === 2 ? "Media" : feitos === 3 ? "Forte" : "MuitoForte";
const cor = forca === "Fraca" ? "var(--bad)" : forca === "Media" ? "var(--warn)" : "var(--ok)";
const seg = (x) => (valor && x < feitos ? cor : "var(--sunken)");
const senha = {{
valor: valor, tipo: ver ? "text" : "password", verSenha: ver, naoVer: !ver,
olhoA: ver ? "none" : "flex", olhoF: ver ? "flex" : "none",
olhoRotulo: ver ? t.ocultarSenha : t.mostrarSenha,
visivel: valor ? "visible" : "hidden", feitos: valor ? feitos : 0, rotulo: forca ? t["forca" + forca] : "",
s1: seg(0), s2: seg(1), s3: seg(2), s4: seg(3),
req: REQ.map((r) => ({{ txt: t[r[0]], ok: r[1], nao: !r[1], cor: r[1] ? "var(--ok)" : "var(--mfg)" }}))
}};"""


VALORES_ACESSO = """e: e,
nome: nome,
email: email,
senha: senha,
mudarNome: (e) => this.setState({ nome: e.target.value }),
mudarEmail: (e) => this.setState({ email: e.target.value }),
mudarSenha: (e) => this.setState({ senha: e.target.value }),
alternarSenha: () => this.setState({ verSenha: !ver })"""


# ── Primeiro acesso, passo 3: o plano ──────────────────────────────────
# Vem depois do perfil, que conclui o onboarding e já dá 7 dias de Pro a todos. Aqui a pessoa
# escolhe como continuar depois deles: fica no Starter (sem cartão) ou assina o Pro, com cupom.
# A PricingScreen do DS (onboarding-pricing + plan-card), a mesma do Platform: barra de passos,
# título de display, rótulo de seção, período à direita e os cards com a CTA de cada um. O Starter
# é tingido e o Pro, recomendado, é o único sólido. `estado: carregando` mostra o skeleton do plan-card.
def tela_plano_inicial(k, sufixo):
    h = lambda caminho: '{{' + caminho + '}}'
    sk = lambda estilo: f'<span class="muriki-skeleton" style="display:block;{estilo}"></span>'
    regua = (f'<span aria-hidden="true" style="display:block;height:1px;background:{"var(--divider)"};'
             f'-webkit-mask-image:linear-gradient(to right,transparent,black 12%,black 88%,transparent);'
             f'mask-image:linear-gradient(to right,transparent,black 12%,black 88%,transparent);"></span>')

    cab = cabecalho_passo(k, 3, T('tituloInicial'), T('subInicial'))

    secao = (f'<div style="display:flex;align-items:center;gap:12px;">'
             f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:{k["mfg"]};">{T("secaoPlanos")}</span>'
             f'<span style="height:1px;width:32px;background:color-mix(in oklch, {k["pri"]} 60%, transparent);"></span>'
             f'<span style="height:1px;width:128px;background:{"var(--divider)"};"></span></div>')
    seg = lambda v, txt, extra='': (
        f'<button type="button" role="tab" aria-selected="{h("per." + v)}" onClick="{h("per.ir_" + v)}" '
        f'style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 14px;border:0;border-radius:999px;'
        f'background:{h("per.fundo_" + v)};box-shadow:{h("per.sombra_" + v)};color:{h("per.cor_" + v)};'
        f'font-family:{FONTE};font-size:13px;font-weight:500;cursor:pointer;">{txt}{extra}</button>')
    periodo = (f'<div role="tablist" aria-label="{T("periodo")}" style="margin-left:auto;display:inline-flex;gap:2px;padding:3px;'
               f'border-radius:999px;background:{k["sunken"]};">'
               f'{seg("mes", T("mensal"))}{seg("ano", T("anual"), badge(T("economia"), k, "green"))}</div>')
    # o Pro pode ter só mensal (GET /plans): com um período só, o seletor some. O cupom mora na mesma
    # linha, à esquerda: perto dos preços que ele muda, sem empurrar a grade
    controles = lambda cupom_: (f'<div style="display:flex;align-items:flex-start;gap:12px;min-height:36px;">{cupom_}'
                                f'<span style="margin-left:auto;"><sc-if value="{h("doisPeriodos")}" hint-placeholder-val="{{{{ true }}}}">{periodo}</sc-if></span></div>')

    def feature(t, faisca=False):
        if faisca:
            return (f'<li style="display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:19px;font-weight:500;color:{k["fgs"]};">'
                    f'<span style="margin-top:2px;display:flex;color:{k["pri"]};">{ic("brilho", 14)}</span><span>{t}</span></li>')
        return (f'<li style="display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:19px;color:{k["fg"]};">'
                f'<span style="margin-top:2px;display:flex;color:{k["ok"]};">{ic("check", 14)}</span><span>{t}</span></li>')

    def card(nome, desc, selo, preco, nota, feats, titulo_feats, cta, destaque, teste='', destino=''):
        borda = (f'border:1px solid {k["pri"]};box-shadow:0 4px 12px rgba(0,0,0,0.08);transform:scale(1.03);' if destaque
                 else f'border:1px solid {k["border"]};box-shadow:{k["sombra"]};')
        botao_ = (f'background:{k["pri"]};color:{k["prifg"]};' if destaque
                  else f'background:{k["prisub"]};color:{k["prisubfg"]};')
        tf = (f'<p style="margin:0;font-family:{MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:{k["mfg"]};">{titulo_feats}</p>'
              if titulo_feats else '')
        return (f'<article aria-label="{nome}" style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:14px;background:{k["card"]};{borda}">'
                f'<header style="display:flex;flex-direction:column;gap:6px;">'
                f'<div style="display:flex;align-items:center;height:22px;">{selo}</div>'
                f'<h3 style="margin:0;font-size:28px;line-height:1.05;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{nome}</h3>'
                f'<p style="margin:0;font-size:14px;line-height:1.35;color:{k["mfg"]};">{desc}</p></header>'
                f'{regua}<div style="display:flex;flex-direction:column;gap:6px;">{teste}'
                f'<p style="margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px;">{preco}</p>'
                f'<span style="font-size:12.5px;color:{k["mfg"]};">{nota}</span></div>'
                f'{regua}<div style="flex:1;display:flex;flex-direction:column;gap:8px;">{tf}'
                f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">{feats}</ul></div>'
                f'<a href="{destino}" style="display:flex;align-items:center;justify-content:center;height:36px;'
                f'border-radius:9px;{botao_}font-size:14px;font-weight:500;">{cta}</a></article>')

    valor = lambda v: f'<span style="font-size:30px;line-height:1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{v}</span>'
    starter = card('Starter', T('descStarter'), '', valor(T('gratis')), T('notaStarter'),
                   feature(T('s1')) + feature(T('s2')) + feature(T('s3')), '', T('ctaStarter'), False,
                   destino=f'Preferencias{sufixo}.dc.html')
    pro = card('Pro', T('descPro'), badge(T('recomendado'), k, 'blue'),
               f'<sc-if value="{h("cp.aplicado")}" hint-placeholder-val="{{{{ false }}}}">'
               f'<s style="width:100%;font-size:14px;color:{k["mfg"]};">{h("per.cheio")}</s></sc-if>'
               + valor(h('per.preco')) + f'<span style="font-size:14px;color:{k["mfg"]};">/{h("per.intervalo")}</span>', h('per.nota'),
               feature(T('p2'), True) + feature(T('p3'), True) + feature(T('p4'), True), T('tudoStarter'), T('ctaPro'), True,
               teste=(f'<span style="align-self:flex-start;">{badge(T("teste"), k, "green", mono=True)}</span>'),
               destino=f'Pagamento{sufixo}.dc.html')

    def esqueleto(destaque):
        borda = f'border:1px solid {k["pri"]};' if destaque else f'border:1px solid {k["border"]};'
        sel = sk(f'height:18px;width:96px;border-radius:4px;background-color:color-mix(in oklch, {k["pri"]} 25%, transparent);') if destaque else ''
        return (f'<div aria-hidden="true" style="display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:14px;background:{k["card"]};{borda}box-shadow:{k["sombra"]};">'
                f'<div style="display:flex;align-items:center;height:22px;">{sel}</div>'
                f'<div style="display:flex;flex-direction:column;gap:8px;">{sk("height:20px;width:144px;")}{sk("height:12px;width:176px;")}</div>'
                f'{sk("height:20px;width:112px;border-radius:999px;")}'
                f'<div style="display:flex;flex-direction:column;gap:8px;">{sk("height:40px;width:176px;")}{sk("height:12px;width:64px;")}</div>'
                f'<div style="flex:1;display:flex;flex-direction:column;gap:10px;padding-top:4px;">'
                f'{sk("height:12px;width:85%;")}{sk("height:12px;width:72%;")}{sk("height:12px;width:78%;")}{sk("height:12px;width:60%;")}</div>'
                + sk(f'height:40px;width:100%;' + (f'background-color:color-mix(in oklch, {k["pri"]} 25%, transparent);' if destaque else '')) + '</div>')

    grade = lambda filhos: (f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:24px;width:672px;margin:0 auto;">{filhos}</div>')
    # o cupom vale para o Pro (POST /billing/checkout aceita coupon): fica embaixo da grade, na largura dela
    campo_cupom = lambda borda: (f'<div style="display:flex;gap:8px;">'
                                 f'<input aria-label="{T("cupomLabel")}" value="{h("cp.codigo")}" placeholder="{T("cupomPh")}" spellcheck="false" '
                                 f'style="width:220px;height:36px;padding:0 12px;border:0;border-radius:9px;box-shadow:inset 0 0 0 1px {borda};'
                                 f'background:{k["card"]};font-family:{MONO};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:{k["fgs"]};outline:0;">'
                                 f'<button type="button" onClick="{h("cp.aplicar")}" style="height:36px;padding:0 14px;border:0;border-radius:9px;'
                                 f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};color:{k["fgs"]};font-family:{FONTE};font-size:13px;'
                                 f'font-weight:500;cursor:pointer;">{T("aplicar")}</button></div>')
    cupom = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
             f'<sc-if value="{h("cp.fechado")}" hint-placeholder-val="{{{{ true }}}}">'
             f'<button type="button" onClick="{h("cp.abrir")}" style="align-self:flex-start;height:36px;border:0;padding:0;background:transparent;'
             f'font-family:{FONTE};font-size:13px;font-weight:500;color:{k["pri"]};cursor:pointer;">{T("temCupom")}</button></sc-if>'
             f'<sc-if value="{h("cp.aberto")}" hint-placeholder-val="{{{{ false }}}}">{campo_cupom(k["input"])}</sc-if>'
             f'<sc-if value="{h("cp.invalido")}" hint-placeholder-val="{{{{ false }}}}">{campo_cupom(k["bad"])}'
             f'<p role="alert" style="margin:0;font-size:12.5px;color:{k["bad"]};">{T("cupomInvalido")}</p></sc-if>'
             f'<sc-if value="{h("cp.aplicado")}" hint-placeholder-val="{{{{ false }}}}">'
             f'<div style="display:flex;align-items:center;gap:10px;min-height:36px;font-size:13px;color:{k["fg"]};">'
             f'{badge("MURIKI20", k, "green", mono=True)}<span>{T("cupomDesc")}</span>'
             f'<button type="button" onClick="{h("cp.remover")}" style="border:0;padding:0;background:transparent;font-family:{FONTE};'
             f'font-size:13px;font-weight:500;color:{k["mfg"]};cursor:pointer;">{T("remover")}</button></div></sc-if></div>')
    planos = (f'<sc-if value="{h("pronto")}" hint-placeholder-val="{{{{ true }}}}">{grade(starter + pro)}</sc-if>'
              f'<sc-if value="{h("carregando")}" hint-placeholder-val="{{{{ false }}}}">{grade(esqueleto(False) + esqueleto(True))}</sc-if>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;gap:36px;width:1024px;align-self:center;padding:32px 24px 40px;">'
            f'{cab}<div style="display:flex;flex-direction:column;gap:20px;">{secao}{controles(cupom)}{planos}</div></main></div>')


ANTES_PLANO_INICIAL = """const per0 = (s.periodos || this.props.periodos) === "só mensal" ? "mes" : (s.periodo || "mes");
const carregando = (s.estado || this.props.estado) === "carregando";
const cupom = s.cupom || this.props.cupom || "fechado";
const cp = {
fechado: cupom === "fechado", aberto: cupom === "aberto", invalido: cupom === "invalido", aplicado: cupom === "aplicado",
codigo: cupom === "invalido" ? "NATAL10" : "MURIKI20",
abrir: () => this.setState({ cupom: "aberto" }), aplicar: () => this.setState({ cupom: "aplicado" }),
remover: () => this.setState({ cupom: "fechado" })
};
const ativo = (v) => per0 === v;
const per = {
mes: ativo("mes"), ano: ativo("ano"),
ir_mes: () => this.setState({ periodo: "mes" }), ir_ano: () => this.setState({ periodo: "ano" }),
fundo_mes: ativo("mes") ? "var(--card)" : "transparent", fundo_ano: ativo("ano") ? "var(--card)" : "transparent",
sombra_mes: ativo("mes") ? "var(--sombra)" : "none", sombra_ano: ativo("ano") ? "var(--sombra)" : "none",
cor_mes: ativo("mes") ? "var(--fgs)" : "var(--mfg)", cor_ano: ativo("ano") ? "var(--fgs)" : "var(--mfg)",
cheio: ativo("ano") ? (t.lang === "en-US" ? "R$499" : "R$ 499") : t.preco,
preco: cupom === "aplicado" ? (ativo("ano") ? (t.lang === "en-US" ? "R$399.20" : "R$ 399,20") : (t.lang === "en-US" ? "R$39.92" : "R$ 39,92"))
  : (ativo("ano") ? (t.lang === "en-US" ? "R$499" : "R$ 499") : t.preco),
intervalo: ativo("ano") ? t.anoCurto : t.mesCurto,
nota: ativo("ano") ? t.notaAnual : t.notaMensal
};"""

VALORES_PLANO_INICIAL = """per: per,
cp: cp,
doisPeriodos: (s.periodos || this.props.periodos) !== "só mensal",
pronto: !carregando,
carregando: carregando"""




# ── Playground: código livre, o Peer ao lado, evidência leve ───────────
def linhas_playground(k):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    ty = lambda t: f'<span style="color:{k["tbluefg"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    nu = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["fgs"]};font-weight:500;">{t}</span>'
    py = [
        f'{kw("import")} csv',
        f'{kw("from")} datetime {kw("import")} timedelta',
        '',
        f'{kw("def")} {fn("total_por_pessoa")}(caminho: {ty("str")}) -&gt; {ty("dict")}[{ty("str")}, {ty("timedelta")}]:',
        f'    totais: {ty("dict")}[{ty("str")}, {ty("timedelta")}] = {{}}',
        f'    {kw("with")} open(caminho) {kw("as")} arquivo:',
        f'        {kw("for")} linha {kw("in")} csv.DictReader(arquivo):',
        f'            minutos = {ty("int")}(linha[{st("&quot;minutos&quot;")}])',
        f'            pessoa = linha[{st("&quot;pessoa&quot;")}]',
        f'            totais[pessoa] = totais.get(pessoa, timedelta()) + timedelta(minutes=minutos)',
        f'    {kw("return")} totais',
        '',
        f'print(total_por_pessoa({st("&quot;horas.csv&quot;")}))',
    ]
    ts = [
        f'{kw("import")} {{ readFileSync }} {kw("from")} {st("&quot;node:fs&quot;")}',
        '',
        f'{kw("function")} {fn("totalPorPessoa")}(caminho: {ty("string")}): {ty("Map")}&lt;{ty("string")}, {ty("number")}&gt; {{',
        f'  {kw("const")} totais = {kw("new")} {ty("Map")}&lt;{ty("string")}, {ty("number")}&gt;()',
        f'  {kw("const")} linhas = readFileSync(caminho, {st("&quot;utf8&quot;")}).trim().split({st("&quot;\\n&quot;")}).slice({nu("1")})',
        f'  {kw("for")} ({kw("const")} linha {kw("of")} linhas) {{',
        f'    {kw("const")} [pessoa, minutos] = linha.split({st("&quot;,&quot;")})',
        f'    totais.set(pessoa, (totais.get(pessoa) ?? {nu("0")}) + {ty("Number")}(minutos))',
        '  }',
        f'  {kw("return")} totais',
        '}',
        '',
        f'console.log(totalPorPessoa({st("&quot;horas.csv&quot;")}))',
    ]
    go = [
        f'{kw("package")} main',
        '',
        f'{kw("import")} (',
        f'    {st("&quot;encoding/csv&quot;")}',
        f'    {st("&quot;fmt&quot;")}',
        f'    {st("&quot;os&quot;")}',
        f'    {st("&quot;strconv&quot;")}',
        ')',
        '',
        f'{kw("func")} {fn("main")}() {{',
        f'    arquivo, _ := os.Open({st("&quot;horas.csv&quot;")})',
        f'    linhas, _ := csv.NewReader(arquivo).ReadAll()',
        f'    totais := {kw("map")}[{ty("string")}]{ty("int")}{{}}',
        f'    {kw("for")} _, l := {kw("range")} linhas[{nu("1")}:] {{',
        f'        minutos, _ := strconv.Atoi(l[{nu("1")}])',
        f'        totais[l[{nu("0")}]] += minutos',
        '    }',
        f'    fmt.Println(totais)',
        '}',
    ]
    return dict(py=(py, 7), ts=(ts, 7), go=(go, 14))


SAIDAS = {
    'py': ['Traceback (most recent call last):', '  File "horas.py", line 13, in &lt;module&gt;',
           '  File "horas.py", line 8, in total_por_pessoa', "ValueError: invalid literal for int() with base 10: ''"],
    'ts': ["Map(3) { 'ana' =&gt; 150, 'bruno' =&gt; 40, 'carla' =&gt; 95 }"],
    'go': ['map[ana:150 bruno:40 carla:95]'],
}


def tela_playground(k):
    h = lambda caminho: '{{' + caminho + '}}'
    def opcao(chave, nome, altura):
        o = f'sel.{chave}'
        return (f'<button type="button" role="radio" aria-checked="{h(o + ".marcado")}" onClick="{h(o + ".escolher")}" '
                f'style="display:flex;align-items:center;gap:8px;height:30px;padding:0 12px 0 10px;border:0;border-radius:7px;'
                f'background:{h(o + ".fundo")};color:{h(o + ".cor")};box-shadow:{h(o + ".sombra")};font-family:{FONTE};font-size:13px;'
                f'font-weight:{h(o + ".peso")};cursor:pointer;">{logo_linguagem(chave, altura)}{nome}</button>')
    seletor = (f'<div role="radiogroup" aria-label="{T("linguagemAria")}" style="display:flex;gap:2px;padding:3px;border-radius:10px;background:{k["sunken"]};">'
               f'{opcao("ts", "TypeScript", 16)}{opcao("py", "Python", 16)}{opcao("go", "Go", 11)}</div>')
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<p style="margin:0;font-size:14px;color:{k["mfg"]};">{T("sub")}</p></div>'
           f'<div style="display:flex;align-items:center;gap:10px;">{seletor}{botao(T("rodar"), k, "primary", 36, "rodar")}</div></header>')

    blocos = ''
    for chave, (linhas, marcada) in linhas_playground(k).items():
        codigo = ''.join(
            f'<div style="display:flex;{"background:" + k["prisub"] + ";" if i == marcada else ""}">'
            f'<span style="width:48px;flex:0 0 auto;text-align:right;padding-right:16px;color:{k["mfg"]};opacity:{1 if i == marcada else 0.55};">{i + 1}</span>'
            f'<span style="white-space:pre;">{l}</span></div>' for i, l in enumerate(linhas))
        blocos += f'<sc-if value="{h("lg." + chave)}" hint-placeholder-val="{{{{ {"true" if chave == "py" else "false"} }}}}">{codigo}</sc-if>'
    aba = lambda nome, at: (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;'
                            f'border:0;background:transparent;font-family:{MONO};font-size:12px;'
                            + (f'background:{k["card"]};color:{k["fgs"]};box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};')
                            + f'">{ic("arquivo", 13)}{nome}</button>')
    editor = (
        f'<section aria-label="{T("editorAria")}" style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
        f'<div style="display:flex;align-items:center;gap:2px;padding:0 8px 0 4px;border-bottom:1px solid {k["muted"]};">'
        f'<div role="tablist" aria-label="{T("abertos")}" style="display:flex;">{aba(h("lg.arquivo"), True)}{aba("horas.csv", False)}</div>'
        f'<span style="margin-left:auto;">{acao_icone(k, "arquivo_mais", T("novoArquivo"), 28)}</span></div>'
        f'<div style="flex:1;min-height:0;padding:14px 0;font-family:{MONO};font-size:13px;line-height:24px;color:{k["fg"]};">{blocos}</div>'
        f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
        f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
        f'<span>{h("lg.arquivo")}</span><span>{T("atalho")}</span><span style="margin-left:auto;">{T("semAuto")}</span></div></section>')

    saidas = ''.join(
        f'<sc-if value="{h("lg." + chave)}" hint-placeholder-val="{{{{ {"true" if chave == "py" else "false"} }}}}">'
        + ''.join(f'<span style="white-space:pre-wrap;overflow-wrap:anywhere;{"color:" + k["bad"] + ";" if chave == "py" and i == len(ls) - 1 else ""}">{l}</span>'
                  for i, l in enumerate(ls)) + '</sc-if>'
        for chave, ls in SAIDAS.items())
    saida = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("saida"), k["mfg"])}'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("rodouAgora")}</span></div>'
        f'<div style="display:flex;flex-direction:column;padding:10px 12px;border-radius:8px;background:{k["sunken"]};'
        f'font-family:{MONO};font-size:11.5px;line-height:18px;color:{k["fg"]};overflow:hidden;">{saidas}</div>', k, pad='16px 18px', extra='gap:10px;')

    peer = (
        f'<section aria-label="Peer" style="flex:1;min-height:0;display:flex;flex-direction:column;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
        f'<header style="display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border-bottom:1px solid {k["muted"]};">'
        f'<span style="display:flex;width:22px;height:22px;">{LOGO}</span>'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Peer</span>'
        f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
        f'<span style="width:7px;height:7px;border-radius:999px;background:{k["ok"]};"></span>{T("observando")}</span>'
        f'<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("contexto")}</span></header>'
        f'<div style="flex:1;min-height:0;padding:16px;display:flex;flex-direction:column;gap:12px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">playground.run · horas.csv:7</span>'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("pergunta")}</p>'
        f'<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:{k["sunken"]};">'
        f'{badge("playground.run", k, "gray", mono=True)}'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("registrada")} {h("lg.nome")}</span></div></div>'
        f'<div style="padding:12px 16px 14px;border-top:1px solid {k["muted"]};display:flex;flex-direction:column;gap:8px;">'
        f'<label for="peer-msg" style="font-size:12px;color:{k["mfg"]};">{T("perguntePeer")}</label>'
        f'<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};">'
        f'<textarea id="peer-msg" rows="2" placeholder="{T("placeholderPeer")}" style="resize:none;border:0;outline:0;'
        f'background:transparent;font-family:{FONTE};font-size:14px;line-height:21px;color:{k["fgs"]};"></textarea>'
        f'<div style="display:flex;align-items:center;gap:8px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("enviaAtalho")}</span>'
        f'<span style="margin-left:auto;">{botao("", k, "primary", 30, "enviar", aria=T("enviarAria"))}</span></div></div></div></section>')

    nota = (f'<p style="margin:0;display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">'
            f'{ic("olho", 14, k["mfg"])}{T("nota")}</p>')
    lado = f'<aside style="width:400px;flex:0 0 400px;display:flex;flex-direction:column;gap:12px;">{saida}{peer}</aside>'
    return app(k, 'playground', cab + nota + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{editor}{lado}</div>',
               compacto=True, pad='24px 28px', gap=14)


ANTES_PLAYGROUND = """const LINGUAS = [["ts", "TypeScript", "horas.ts"], ["py", "Python", "horas.py"], ["go", "Go", "horas.go"]];
const atual = s.lingua || this.props.lingua || "py";
const achada = LINGUAS.find((l) => l[0] === atual) || LINGUAS[1];
const lg = { nome: achada[1], arquivo: achada[2], ts: achada[0] === "ts", py: achada[0] === "py", go: achada[0] === "go" };
const linguas = LINGUAS.map((l) => {
const on = l[0] === achada[0];
return {
nome: l[1], marcado: on,
fundo: on ? "var(--card)" : "transparent", cor: on ? "var(--fgs)" : "var(--mfg)",
sombra: on ? "var(--sombra)" : "none", peso: on ? 500 : 400,
escolher: () => this.setState({ lingua: l[0] })
};
});
const sel = {};
LINGUAS.forEach((l, i) => { sel[l[0]] = linguas[i]; });"""

PROPS_PLAYGROUND = {'lingua': {'editor': 'enum', 'options': ['ts', 'py', 'go'], 'default': 'py'}}


# ── Montagem: cada tela sai em claro e em escuro ───────────────────────
def montar(tela, tema):
    sufixo = '' if tema == 'claro' else 'Escuro'
    return _montar(tela, tema, sufixo).replace('__SUF__', sufixo)


def _montar(tela, tema, sufixo):
    web = lambda textos, corpo, antes='', valores='', props=None, css='': casca(
        tela['titulo'], corpo, logica(juntar(COMUM, textos), tema, antes, valores),
        {**PROPS_IDIOMA, **props_tema(tema), **(props or {})}, css)
    k = K
    if tela['id'] == 'competencia':
        return web(EVOLUCAO_NOVA, tela_competencia_nova(k))
    if tela['id'] == 'plano_inicial':
        textos = {l: {**COMUM_ONB[l], **PLANOS[l], **PLANO_INICIAL[l]} for l in PLANOS}
        return web(textos, tela_plano_inicial(k, sufixo), ANTES_PLANO_INICIAL, VALORES_PLANO_INICIAL,
                   {'estado': {'editor': 'enum', 'options': ['pronto', 'carregando'], 'default': 'pronto'},
                    'periodos': {'editor': 'enum', 'options': ['mensal e anual', 'só mensal'], 'default': 'mensal e anual'},
                    'cupom': {'editor': 'enum', 'options': ['fechado', 'aberto', 'aplicado', 'invalido'], 'default': 'fechado'}},
                   CSS_DIVIDER_SKELETON)
    onb = lambda textos: {l: {**COMUM_ONB[l], **textos[l]} for l in textos}
    if tela['id'] == 'verificacao':
        return web(onb(VERIFICACAO), tela_verificacao(k, sufixo), ANTES_VERIFICACAO, 'v: v', PROPS_VERIFICACAO, CSS_DIVIDER_SKELETON)
    if tela['id'] == 'perfil':
        return web(onb(PERFIL_ONB), tela_perfil(k, sufixo), ANTES_PERFIL, 'pf: pf', PROPS_PERFIL, CSS_DIVIDER_SKELETON)
    if tela['id'] == 'preferencias':
        return web(onb(PREFERENCIAS), tela_preferencias(k, sufixo), ANTES_PREFERENCIAS, VALORES_PREFERENCIAS, PROPS_PREFERENCIAS,
                   css=CSS_DIVIDER_SKELETON)
    if tela['id'] == 'pagamento':
        return web(onb(PAGAMENTO), tela_pagamento(k, sufixo), ANTES_PAGAMENTO, VALORES_PAGAMENTO, PROPS_PAGAMENTO)
    if tela['id'] == 'playground':
        return web(PLAYGROUND, tela_playground(k), ANTES_PLAYGROUND, 'lg: lg,\nlinguas: linguas,\nsel: sel', PROPS_PLAYGROUND)
    if tela['id'] == 'entrar':
        return web(ACESSO, tela_acesso(k, 'entrar', sufixo), antes_acesso('', '', ''), VALORES_ACESSO)
    if tela['id'] == 'passkey':
        return web(ACESSO, tela_acesso(k, 'passkey', sufixo), antes_acesso('', '', ''), VALORES_ACESSO)
    conta = {l: {**ACESSO[l], **CONTA[l]} for l in ACESSO}
    estados = lambda *o: {'estado': {'editor': 'enum', 'options': list(o), 'default': o[0]}}
    if tela['id'] == 'criar':
        return web(conta, tela_acesso(k, 'criar', sufixo), antes_acesso('Rafael Moura', 'rafael@moura.dev', '', 'criar'),
                   VALORES_ACESSO, estados('formulario', 'enviado'))
    if tela['id'] in ('criarSenha', 'redefinir'):
        return web(conta, tela_acesso(k, tela['id'], sufixo), antes_acesso('', 'rafael@moura.dev', 'murikicode2026', tela['id']),
                   VALORES_ACESSO, estados('formulario', 'vazada', 'expirado'))
    if tela['id'] == 'esqueci':
        return web(conta, tela_acesso(k, 'esqueci', sufixo), antes_acesso('', 'rafael@moura.dev', '', 'esqueci'),
                   VALORES_ACESSO, estados('formulario', 'enviado'))
    if tela['id'] == 'codigo':
        return web(conta, tela_acesso(k, 'codigo', sufixo), antes_acesso('', 'rafael@moura.dev', '', 'codigo', 'totp'),
                   VALORES_ACESSO, estados('totp', 'invalido', 'backup'))
    if tela['id'] == 'primeiro':
        return web(juntar(EXERCICIO, PRIMEIRO), tela_exercicio(k, primeira=True), ANTES_PRIMEIRO, VALORES_PRIMEIRO, PROPS_PRIMEIRO)
    if tela['id'] == 'vazio':
        return web(EVOLUCAO_NOVA, tela_evolucao_vazia(k))
    if tela['id'] in ('evolucao', 'evolucao_tempo'):
        return web(EVOLUCAO_NOVA, tela_evolucao_nova(k, rolada=tela['id'] == 'evolucao_tempo'))
    if tela['id'] in ('licao', 'guia_voce_sabia', 'peer_voce_sabia', 'licao_movel'):
        from textos_licao import TEXTOS as LICAO
        from textos_peer_exercicio import TEXTOS as PEER_EXERCICIO
        import licao as li
        if tela['id'] == 'licao_movel':
            return casca_movel(web(juntar(LICAO, MOVEL), li.tela_licao_movel(k), li.antes_licao(k), li.VALORES_LICAO), li.ALTURA_MOVEL)
        if tela['id'] == 'licao':
            return web(juntar(EXERCICIO, LICAO), li.tela_licao(k), li.antes_licao(k), VALORES_EXERCICIO + ',\n' + li.VALORES_LICAO)
        if tela['id'] == 'guia_voce_sabia':
            return web(juntar(EXERCICIO, LICAO), li.tela_guia_voce_sabia(k), valores=VALORES_EXERCICIO)
        return web(juntar(EXERCICIO, LICAO, {l: {kk: v for kk, v in PEER_EXERCICIO[l].items() if kk in ('peerNome', 'entendi', 'peerAcompanhando', 'historicoTit', 'h2hora', 'h2Gatilho', 'tipoPergunta', 'peerPausa')} for l in PEER_EXERCICIO}),
                   li.tela_peer_voce_sabia(k), valores=VALORES_EXERCICIO)
    if tela['id'] in ('peer_testes', 'peer_faixa', 'peer_retorno'):
        from textos_peer_exercicio import TEXTOS as PEER_EXERCICIO
        import peer_exercicio as pe
        fazer = {'peer_testes': pe.tela_peer_testes, 'peer_faixa': pe.tela_peer_faixa, 'peer_retorno': pe.tela_peer_retorno}[tela['id']]
        return web(juntar(EXERCICIO, PEER_EXERCICIO), fazer(k), valores=VALORES_EXERCICIO)
    if tela['id'] in ('starter_exercicio', 'starter_evolucao', 'starter_competencia'):
        from textos_peer_exercicio import TEXTOS as PEER_EXERCICIO
        from textos_starter import TEXTOS as STARTER
        import starter as st
        if tela['id'] == 'starter_exercicio':
            peer = {l: {kk: v for kk, v in PEER_EXERCICIO[l].items() if kk == 'peerAcompanhando'} for l in PEER_EXERCICIO}
            return web(juntar(EXERCICIO, peer, STARTER), st.tela_exercicio_starter(k), valores=VALORES_EXERCICIO)
        fazer = st.tela_evolucao_starter if tela['id'] == 'starter_evolucao' else st.tela_competencia_starter
        return web(juntar(EVOLUCAO_NOVA, STARTER), fazer(k))
    if tela['id'] == 'exercicio':
        return web(EXERCICIO, tela_exercicio(k), valores=VALORES_EXERCICIO)
    if tela['id'] == 'exercicio_console':
        return web(EXERCICIO, tela_exercicio(k, console=True), valores=VALORES_EXERCICIO)
    if tela['id'] == 'arquitetura':
        return web(ARQUITETURA, tela_exercicio_arquitetura(k))
    if tela['id'] == 'arquitetura_simular':
        return web(ARQUITETURA, tela_exercicio_arquitetura(k, simular=True))
    if tela['id'] in ('playground_desenhos', 'playground_limite', 'desenho_livre'):
        from textos_playground import TEXTOS as PLAYGROUND_TEXTOS
        import playground as pg
        if tela['id'] == 'desenho_livre':
            return web(PLAYGROUND_TEXTOS, pg.tela_desenho_livre(k))
        return web(PLAYGROUND_TEXTOS, pg.tela_playground(k, limite=tela['id'] == 'playground_limite'), css=pg.CSS_PLAYGROUND)
    if tela['id'] == 'arquitetura_defeito':
        from arquitetura import tela_exercicio_defeito
        return web(ARQUITETURA, tela_exercicio_defeito(k))
    if tela['id'] == 'arquitetura_nuvem':
        return web(ARQUITETURA, tela_exercicio_arquitetura(k, nuvem=True))
    if tela['id'] == 'desb_trilhas':
        return web(DESBLOQUEIO, tela_trilhas_bloqueada(k))
    if tela['id'] == 'desb_trilha':
        return web(DESBLOQUEIO, tela_trilha_acima(k), css=CSS_DESBLOQUEIO)
    if tela['id'] == 'desb_liberada':
        return web(DESBLOQUEIO, tela_trilha_liberada(k), css=CSS_DESBLOQUEIO)
    if tela['id'] in ('troca_ida', 'troca_volta'):
        return web(juntar(TRILHAS, TROCA), tela_troca(k, sufixo, tela['id'][6:]), ANTES_TROCA, VALORES_TROCA, PROPS_TROCA, CSS_TROCA)
    if tela['id'] == 'troca_plano':
        return web(juntar(TRILHAS, TROCA), tela_troca(k, sufixo, 'plano'), css=CSS_TROCA)
    if tela['id'] == 'troca_movel':
        return casca_movel(web(juntar(DESBLOQUEIO, TROCA, MOVEL), tela_troca_movel(k), ANTES_TROCA, VALORES_TROCA, PROPS_TROCA, CSS_TROCA),
                           ALTURA_TROCA)
    if tela['id'] == 'planos_escolha':
        return web(PLANOS_ESCOLHA, tela_planos_escolha(k))
    if tela['id'] == 'planos_escolha_movel':
        return casca_movel(web(juntar(PLANOS_ESCOLHA, MOVEL), tela_planos_escolha_movel(k)), ALTURA_PLANOS_ESCOLHA)
    if tela['id'] == 'liberada_movel':
        return casca_movel(web(juntar(DESBLOQUEIO, MOVEL), tela_trilha_liberada_movel(k), css=CSS_DESBLOQUEIO), ALTURA_LIBERADA)
    if tela['id'] == 'avaliacao':
        return web(AVALIACAO, tela_avaliacao(k))
    if tela['id'] == 'peer':
        return casca(tela['titulo'], tela_peer(k), logica_so_tema(tema), props_tema(tema))
    if tela['id'] == 'conectar':
        return web(CONECTAR, tela_conectar(k))
    if tela['id'] == 'planos':
        return web(PLANOS, tela_planos(k))
    if tela['id'] == 'conta_dados':
        return web(MINHA_CONTA, tela_conta_dados(k), ANTES_CONTA_DADOS, VALORES_CONTA_DADOS, PROPS_CONTA_DADOS)
    if tela['id'] == 'conta_aprendizado':
        return web(juntar(MINHA_CONTA, PREFERENCIAS), tela_conta_aprendizado(k), ANTES_PREFERENCIAS, VALORES_PREFERENCIAS, PROPS_PREFERENCIAS)
    if tela['id'] == 'conta_seguranca':
        return web(MINHA_CONTA, tela_conta_seguranca(k), ANTES_CONTA_SEGURANCA, VALORES_CONTA_SEGURANCA, PROPS_CONTA_SEGURANCA)
    if tela['id'] in SISTEMA_TELAS:
        qual, produto, idiomas, email = SISTEMA_TELAS[tela['id']]
        return web(SISTEMA, tela_sistema(k, qual, sufixo, produto, idiomas, email))
    if tela['id'] == 'inicio':
        return web(INICIO, tela_inicio_primeiro_dia(k, sufixo), ANTES_INICIO, 'ini: ini', PROPS_INICIO)
    if tela['id'] == 'trilhas':
        return web(TRILHAS, tela_trilhas(k, sufixo))
    if tela['id'] == 'trilhas_vazia':
        return web(juntar(TRILHAS, TRILHA, TRILHAS_VAZIA), tela_trilhas_vazia(k, sufixo))
    if tela['id'] == 'trilha':
        return web(juntar(TRILHAS, TRILHA, MAPA), tela_trilha_mapa(k, sufixo))
    if tela['id'] == 'trilha_lista':
        return web(juntar(TRILHAS, TRILHA, MAPA), tela_trilha(k, sufixo), ANTES_ETAPAS, VALORES_ETAPAS, PROPS_ETAPAS, CSS_ETAPAS)
    if tela['id'] == 'trilhas_boas_vindas':
        return web(juntar(TRILHAS, BOAS_VINDAS), tela_trilha_boas_vindas(k, sufixo), ANTES_BOAS_VINDAS, VALORES_BOAS_VINDAS,
                   PROPS_BOAS_VINDAS, CSS_SPLASH)
    if tela['id'] == 'catalogo':
        return web(juntar(CATALOGO, {l: {'t1': TRILHAS[l]['t1']} for l in TRILHAS}), tela_catalogo(k, sufixo))
    if tela['id'] == 'peer_web':
        return web(PEER_WEB, tela_peer_web(k, sufixo))
    # o Code no celular (390): o casca fixa o $preview em W × H, e casca_movel troca pela altura da página
    moveis = {
        'menu_movel': ('menu', lambda: web(juntar(INICIO, MOVEL), tela_menu_movel(k, sufixo), ANTES_INICIO, 'ini: ini', PROPS_INICIO)),
        'inicio_movel': ('inicio', lambda: web(juntar(INICIO, MOVEL), tela_inicio_movel(k, sufixo), ANTES_INICIO, 'ini: ini', PROPS_INICIO)),
        'trilhas_movel': ('trilhas', lambda: web(juntar(TRILHAS, MOVEL), tela_trilhas_movel(k, sufixo))),
        'trilha_movel': ('trilha', lambda: web(juntar(TRILHAS, TRILHA, MAPA, MOVEL), tela_trilha_movel(k, sufixo))),
        'trilha_lista_movel': ('trilha_lista', lambda: web(juntar(TRILHAS, TRILHA, MAPA, MOVEL), tela_trilha_lista_movel(k, sufixo),
                                                           ANTES_ETAPAS, VALORES_ETAPAS, PROPS_ETAPAS, CSS_ETAPAS)),
        'exercicios_movel': ('exercicios', lambda: web(juntar(CATALOGO, {l: {'t1': TRILHAS[l]['t1']} for l in TRILHAS}, MOVEL),
                                                       tela_exercicios_movel(k, sufixo))),
        'conta_movel': ('conta', lambda: web(juntar(MINHA_CONTA, MOVEL), tela_conta_movel(k, sufixo))),
        'evolucao_movel': ('evolucao', lambda: web(juntar(EVOLUCAO_NOVA, MOVEL), tela_evolucao_movel(k))),
        'boas_vindas_movel': ('boas_vindas', lambda: web(juntar(TRILHAS, BOAS_VINDAS, MOVEL), tela_boas_vindas_movel(k, sufixo),
                                                         ANTES_BOAS_VINDAS, VALORES_BOAS_VINDAS, PROPS_BOAS_VINDAS, CSS_SPLASH)),
    }
    if tela['id'] in moveis:
        chave, fazer = moveis[tela['id']]
        return casca_movel(fazer(), ALTURAS_MOVEL[chave])
    if tela['id'] == 'suspenso':
        return web(SUSPENSO, tela_suspenso(k, sufixo))
    if tela['id'] in FLUXOS:
        fluxo, opcoes, segundo_fator, editar_pk = FLUXOS[tela['id']]
        return web(MINHA_CONTA, tela_conta_seguranca(k, fluxo(k), editar_pk), antes_fluxo(opcoes), VALORES_FLUXO,
                   props_fluxo(opcoes, segundo_fator))
    if tela['id'] == 'conta_plano':
        return web(MINHA_CONTA, tela_conta_plano(k))
    if tela['id'] == 'confirmar_email':
        return web(MINHA_CONTA, tela_confirmar_email(k, sufixo), ANTES_CONFIRMAR_EMAIL, 'ce: ce', PROPS_CONFIRMAR_EMAIL)
    raise KeyError(tela['id'])
