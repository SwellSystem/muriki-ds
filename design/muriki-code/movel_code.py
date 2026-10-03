# ── O Code no celular (390 de largura) ──────────────────────────────────
# As mesmas telas, com os dados e os textos de sempre, repensadas para a coluna estreita, no molde do
# Backoffice no celular (design/muriki-backoffice/movel.py):
# - a casca vira uma barra de topo de 56px (menu, logo e nome da tela, avatar); o rail vira uma gaveta
#   que abre da esquerda sobre um véu (quadro MenuMovel);
# - tudo empilhado; abas e filtros que não cabem rolam na horizontal, com fade na borda;
# - a trilha vira um mapa vertical: o caminho desce em zigue-zague e os nomes ficam ao lado;
# - as boas-vindas viram uma folha que sobe de baixo;
# - alvo de toque mínimo de 40px e nada de rolagem horizontal da página.
# Textos com T() nunca dentro de <text> de SVG: o canvas não os preenche (vão em HTML por cima).
# Cada quadro tem a altura da página rolada inteira (ALTURAS), medida no Chrome.
import os

from base import *  # noqa: F401,F403
from aprender import (linha_etapa, TRILHAS_DADOS, ETAPAS, EXERCICIOS, MINI, MARCOS, _progresso, CSS_SPLASH,
                      ANTES_BOAS_VINDAS, VALORES_BOAS_VINDAS, PROPS_BOAS_VINDAS)
from conta import _cartao, _campo, _botao_perigo, ABAS
from inicio import _chip, _em_breve, ANTES_INICIO, PROPS_INICIO  # noqa: F401
from logos_marcas import logo_marca, nome_marca

WM = 390
PAD = 16

I.update(
    menu=svg('<path d="M2.5 4.5h11"/><path d="M2.5 8h11"/><path d="M2.5 11.5h11"/>'),
    busca=svg('<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/>'),
    filtro=svg('<path d="M2 3.5h12"/><path d="M4.5 8h7"/><path d="M6.5 12.5h3"/>'),
)

# a altura de cada quadro: a página rolada inteira (medida no Chrome e arredondada)
ALTURAS = dict(menu=844, inicio=1600, trilhas=1900, trilha=1710, trilha_lista=1064, exercicios=1850, conta=1420, boas_vindas=844,
               evolucao=2460, liberada=844, planos_escolha=1680)
# MEDIR=1 solta a altura (para medir a página no Chrome)
MEDIR = os.environ.get('MEDIR') == '1'

h = lambda caminho: '{{' + caminho + '}}'
se = lambda chave, html, padrao=False: (f'<sc-if value="{h(chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                        f'{html}</sc-if>')


def casca_movel(html, altura):
    # o casca fixa o $preview em W × H; o quadro do celular é 390 × a altura da página
    return html.replace(f'"$preview":{{"width":{W},"height":{H}}}', f'"$preview":{{"width":{WM},"height":{altura}}}')


def raiz_movel(k, altura, estilo=''):
    alt = 'auto' if MEDIR else f'{altura}px'
    return (f'<div class="mc {{{{temaClasse}}}}" lang="{T("lang")}" style="position:relative;width:{WM}px;height:{alt};overflow:hidden;'
            f'background:{k["bg"]};color:{k["fg"]};font-family:{FONTE};font-size:14px;line-height:20px;{estilo}">')


def _toque(k, icone, rot, cor=None, destino=None):
    # botão só de ícone com o alvo de 40px
    est = (f'display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 auto;border:0;border-radius:10px;'
           f'background:transparent;color:{cor or k["mfg"]};cursor:pointer;')
    if destino:
        return f'<a href="{destino}" aria-label="{rot}" style="{est}">{ic(icone, 18)}</a>'
    return f'<button type="button" aria-label="{rot}" style="{est}">{ic(icone, 18)}</button>'


def _avatar(k, tam=28):
    return (f'<span style="width:{tam}px;height:{tam}px;border-radius:999px;background:{k["tgreen"]};color:{k["tgreenfg"]};flex:0 0 auto;'
            f'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">RM</span>')


def topo_movel(k, titulo):
    return (f'<header style="position:relative;z-index:2;display:flex;align-items:center;gap:6px;height:56px;flex:0 0 auto;padding:0 8px;'
            f'background:{k["rail"]};box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'{_toque(k, "menu", T("abrirMenu"), k["fgs"], "MenuMovel__SUF__.dc.html")}'
            f'<span style="display:flex;width:26px;height:26px;flex:0 0 auto;">{LOGO}</span>'
            f'<span style="flex:1;min-width:0;font-size:15px;font-weight:600;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{titulo}</span>'
            f'<a href="ContaMovel__SUF__.dc.html" aria-label="{T("minhaConta")}" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;">'
            f'{_avatar(k)}</a></header>')


def app_movel(k, chave, titulo, conteudo, gap=16, sobre=''):
    return (f'{raiz_movel(k, ALTURAS[chave], "display:flex;flex-direction:column;")}{topo_movel(k, titulo)}'
            f'<main style="flex:1;min-height:0;padding:18px {PAD}px 28px;display:flex;flex-direction:column;gap:{gap}px;">'
            f'{conteudo}</main>{sobre}</div>')


def titulo_movel(k, titulo, sub='', voltar_para=None, direita=''):
    v = ''
    if voltar_para:
        nome, destino = voltar_para
        v = (f'<a href="{destino}" style="display:inline-flex;align-items:center;gap:6px;height:32px;align-self:flex-start;'
             f'margin-left:-4px;padding:0 4px;font-size:13px;font-weight:500;color:{k["mfg"]};">'
             f'<span style="display:flex;transform:rotate(180deg);">{ic("seta", 14)}</span>{nome}</a>')
    s = f'<p style="margin:0;font-size:13.5px;line-height:19px;color:{k["mfg"]};">{sub}</p>' if sub else ''
    return (f'<header style="display:flex;flex-direction:column;gap:6px;">{v}'
            f'<div style="display:flex;align-items:center;gap:10px;"><h1 style="margin:0;flex:1;min-width:0;'
            f'font-size:24px;line-height:30px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{titulo}</h1>{direita}</div>{s}</header>')


def rolavel(k, itens, gap=8):
    # uma linha que rola na horizontal; o fade na borda direita avisa que tem mais
    return (f'<div style="position:relative;margin:0 -{PAD}px;"><div style="display:flex;gap:{gap}px;overflow:hidden;padding:0 {PAD}px;">'
            + ''.join(f'<span style="flex:0 0 auto;display:flex;">{c}</span>' for c in itens) + '</div>'
            f'<span aria-hidden="true" style="position:absolute;right:0;top:0;bottom:0;width:36px;pointer-events:none;'
            f'background:linear-gradient(to right, transparent, {k["bg"]});"></span></div>')


def abas_rolaveis(k, abas, aria):
    # abas = [(rótulo, contagem ou '', ativa, destino)]; rolam, e a ativa fica à vista
    bs = ''
    for rot, n, at, destino in abas:
        est = f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};'
        conta = f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{n}</span>' if n != '' else ''
        bs += (f'<a href="{destino}" role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:6px;flex:0 0 auto;'
               f'height:40px;padding:0 2px;{est}font-size:13.5px;white-space:nowrap;">{rot}{conta}</a>')
    return (f'<div style="position:relative;margin:0 -{PAD}px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<div role="tablist" aria-label="{aria}" style="display:flex;gap:20px;overflow:hidden;padding:0 {PAD}px;">{bs}</div>'
            f'<span aria-hidden="true" style="position:absolute;right:0;top:0;bottom:1px;width:44px;pointer-events:none;'
            f'background:linear-gradient(to right, transparent, {k["bg"]});"></span></div>')


def chip(k, txt, ativo=False, apagado=False, n=None):
    conta = f'<span style="font-family:{MONO};font-size:11px;margin-left:6px;">{n}</span>' if n is not None else ''
    est = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if ativo
           else f'background:transparent;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};' + ('opacity:0.55;' if apagado else ''))
    return (f'<span style="display:inline-flex;align-items:center;height:40px;padding:0 14px;border-radius:999px;font-size:13.5px;'
            f'white-space:nowrap;{est}">{txt}{conta}</span>')


def filtro40(k, txt):
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;border-radius:9px;font-size:13.5px;'
            f'white-space:nowrap;color:{k["mfg"]};border:1px dashed {k["input"]};">{ic("filtro", 14)}{txt}</span>')


def busca_cheia(k, ph):
    return (f'<span style="display:flex;align-items:center;gap:8px;width:100%;height:40px;padding:0 12px;border-radius:10px;'
            f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["input"]};font-size:14px;color:{k["mfg"]};">{ic("busca", 15)}{T(ph)}</span>')


def botao_cheio(txt, destino, k, var='solid', icone='seta'):
    return botao_link(txt, destino, k, var, 44, icone, '100%')


def card(k, conteudo, pad='16px', gap=12, extra=''):
    return (f'<section style="background:{k["card"]};border-radius:14px;box-shadow:{k["sombra"]};padding:{pad};'
            f'display:flex;flex-direction:column;gap:{gap}px;{extra}">{conteudo}</section>')


# ── Menu ──
def tela_menu_movel(k, sufixo):
    fundo = tela_inicio_movel(k, sufixo, altura_fixa=ALTURAS['menu'])
    assert fundo.endswith('</div>')

    def item(chave, icone, at=False, direita=''):
        f = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at else f'color:{k["fg"]};')
        b = (f'<span style="position:absolute;left:0;top:9px;bottom:9px;width:3px;border-radius:999px;background:{k["pri"]};"></span>' if at else '')
        return (f'<a href="{destino(chave)}" style="position:relative;display:flex;align-items:center;gap:12px;height:44px;padding:0 12px;'
                f'border-radius:10px;font-size:14.5px;{f}">{b}{ic(icone, 18)}<span style="flex:1;">{T(chave)}</span>{direita}</a>')

    def em_breve(chave, icone):
        return (f'<span aria-disabled="true" style="display:flex;align-items:center;gap:12px;height:44px;padding:0 12px;border-radius:10px;'
                f'font-size:14.5px;color:{k["mfg"]};opacity:0.8;"><span style="display:flex;opacity:0.7;">{ic(icone, 18)}</span>'
                f'<span style="flex:1;">{T(chave)}</span>'
                f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">{T("emBreveRail")}</span></span>')
    nav = ''.join(item(c, i, c == 'inicio') for c, i in PRODUTO_ITENS)
    gaveta = (
        f'<nav aria-label="Muriki Code" style="position:absolute;left:0;top:0;bottom:0;z-index:31;width:312px;display:flex;flex-direction:column;'
        f'background:{k["rail"]};box-shadow:0 20px 60px -10px rgba(0,0,0,0.45);">'
        f'<div style="display:flex;align-items:center;gap:4px;padding:10px 8px 6px 12px;">'
        f'<button type="button" aria-label="{T("trocarProduto")}" style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;height:52px;'
        f'padding:0 8px;border:0;border-radius:11px;background:transparent;font-family:{FONTE};text-align:left;cursor:pointer;">'
        f'<span style="display:flex;width:32px;height:32px;flex:0 0 auto;">{LOGO}</span>'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">Muriki Code</span>'
        f'<span style="font-size:11.5px;color:{k["mfg"]};">{T("contaMuriki")}</span></span>{ic("troca", 14, k["mfg"])}</button>'
        f'{_toque(k, "x", T("fecharMenu"), k["mfg"], "InicioMovel__SUF__.dc.html")}</div>'
        f'<div style="padding:4px 12px;display:flex;flex-direction:column;gap:2px;">'
        f'<div style="height:32px;display:flex;align-items:center;padding:0 12px;">{rotulo(T("aprender"), k["mfg"])}</div>{nav}</div>'
        f'<div style="flex:1;"></div>'
        f'<div style="padding:10px 12px 14px;display:flex;flex-direction:column;gap:2px;">'
        + em_breve('peer', 'peer') + item('plano', 'plano', False, badge('Pro', k, 'blue'))
        + f'<div style="height:1px;background:{k["muted"]};margin:8px 4px;"></div>'
        f'<div style="display:flex;align-items:center;gap:4px;">{botao_idioma(k, 44, "flex:1;", "cima")}{botao_tema(k, 44)}</div>'
        f'<div style="display:flex;align-items:center;gap:10px;height:52px;padding:0 4px 0 12px;">{_avatar(k, 32)}'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:14px;font-weight:500;color:{k["fgs"]};">Rafael Moura</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">rafael@moura.dev</span></span>'
        f'{_toque(k, "engrenagem", T("config"), k["mfg"], "ContaMovel__SUF__.dc.html")}</div></div></nav>')
    veu = f'<div aria-hidden="true" style="position:absolute;inset:0;z-index:30;background:{k["veu"]};"></div>'
    return fundo[:-6] + veu + gaveta + '</div>'


# ── Início ──
def tela_inicio_movel(k, sufixo, altura_fixa=None):
    cab = titulo_movel(k, T('titulo'), T('sub'))
    proximo = card(k,
                   f'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">{rotulo(T("proximo"), k["mfg"])}'
                   f'{badge("Testing · Debugging", k, "blue")}</div>'
                   f'<h2 style="margin:0;font-size:20px;line-height:26px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("exTitulo")}</h2>'
                   f'<p style="margin:0;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("exTxt")}</p>'
                   + botao_cheio(T('comecar'), f'PrimeiroExercicio{sufixo}.dc.html', k)
                   + f'<span style="display:flex;align-items:center;justify-content:center;gap:8px;height:40px;font-size:14px;color:{k["mfg"]};">'
                     f'{T("trilha")}{_em_breve(k)}</span>', pad='18px 16px', gap=12)

    linha = lambda rot, valor: (f'<div style="display:flex;flex-direction:column;gap:6px;">{rotulo(rot, k["mfg"], 9.5)}'
                                f'<div style="display:flex;flex-wrap:wrap;gap:6px;">{valor}</div></div>')
    contou = (linha(T('nivel'), _chip(k, T('expContou')))
              + linha(T('linguas'), _chip(k, 'TypeScript') + _chip(k, 'Python'))
              + linha(T('objetivos'), _chip(k, T('oAprender')) + _chip(k, T('oEntregar'))))
    pulou = (f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pulouTxt")}</p>'
             + botao_cheio(T('contarAgora'), f'ContaAprendizado{sufixo}.dc.html', k, 'outline', None))
    perfil_card = card(k,
                       f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("contou"), k["mfg"])}'
                       + se('ini.contou', f'<a href="ContaMovel{sufixo}.dc.html" style="display:flex;align-items:center;height:40px;font-size:13.5px;">{T("ajustar")}</a>', True)
                       + '</div>'
                       + se('ini.contou', f'<div style="display:flex;flex-direction:column;gap:12px;">{contou}</div>', True)
                       + se('ini.pulou', f'<div style="display:flex;flex-direction:column;gap:12px;">{pulou}</div>'), gap=10)

    def tile(icone, titulo, txt, pe, largo=False):
        return (f'<div style="display:flex;flex-direction:column;gap:6px;padding:14px;border-radius:12px;background:{k["card"]};'
                f'box-shadow:{k["sombra"]};min-width:0;{"grid-column:1 / -1;" if largo else ""}">'
                f'<div style="display:flex;align-items:center;gap:8px;color:{k["fgs"]};">{ic(icone, 16)}'
                f'<span style="font-size:14px;font-weight:600;">{T(titulo)}</span></div>'
                f'<p style="margin:0;flex:1;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T(txt)}</p>'
                f'<div style="display:flex;align-items:center;min-height:28px;">{pe}</div></div>')
    link = lambda txt, destino_: (f'<a href="{destino_}" style="display:inline-flex;align-items:center;gap:4px;height:28px;'
                                  f'font-size:13px;font-weight:500;">{T(txt)}{ic("seta", 12)}</a>')
    mapa = (f'<section aria-label="{T("mapa")}" style="display:flex;flex-direction:column;gap:10px;">{rotulo(T("mapa"), k["mfg"])}'
            f'<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">'
            + tile('exercicios', 'mExercicios', 'mExerciciosTxt', link('abrir', f'ExerciciosMovel{sufixo}.dc.html'))
            + tile('trilhas', 'mTrilhas', 'mTrilhasTxt', link('abrir', f'TrilhasMovel{sufixo}.dc.html'))
            + tile('avaliacoes', 'mAvaliacoes', 'mAvaliacoesTxt', _em_breve(k, 'depoisPrimeiro'))
            + tile('peer', 'mPeer', 'mPeerTxt', _em_breve(k))
            + tile('evolucao', 'evolucao', 'mEvolucaoTxt', link('ver', f'PerfilVazio{sufixo}.dc.html'), largo=True)
            + '</div></section>')
    escala_vazia = ''.join(f'<span style="width:18px;height:6px;border-radius:2px;'
                           + (f'background:transparent;box-shadow:inset 0 0 0 1px {k["pri"]};' if i < 3 else f'background:{k["sunken"]};')
                           + '"></span>' for i in range(len(NIVEIS)))
    competencia = card(k, f'{rotulo(T("perfil"), k["mfg"])}<span style="display:flex;gap:3px;">{escala_vazia}</span>'
                          f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("perfilTxt")}</p>', gap=10)
    playground = card(k,
                      f'<div style="display:flex;align-items:center;gap:8px;color:{k["fgs"]};">{ic("terminal", 16)}'
                      f'<span style="font-size:14px;font-weight:600;">{T("pgTit")}</span>'
                      f'<span style="margin-left:auto;display:flex;gap:6px;">{badge("TypeScript", k, mono=True)}{badge("Python", k, mono=True)}</span></div>'
                      f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pgTxt")}</p>'
                      + botao_cheio(T('pgAbrir'), f'Playground{sufixo}.dc.html', k, 'outline'), gap=10)
    corpo = cab + proximo + perfil_card + mapa + competencia + playground
    if altura_fixa:
        # o fundo do menu: a mesma página, cortada na altura da tela
        return (f'{raiz_movel(k, altura_fixa, "display:flex;flex-direction:column;").replace("height:auto", f"height:{altura_fixa}px")}'
                f'{topo_movel(k, T("inicio"))}'
                f'<main style="flex:1;min-height:0;padding:18px {PAD}px 28px;display:flex;flex-direction:column;gap:16px;">{corpo}</main></div>')
    return app_movel(k, 'inicio', T('inicio'), corpo)


# ── Trilhas ──
def _minimapa_movel(k, sufixo, atual):
    # o minimapa do desktop em largura cheia: o SVG escala junto com o quadro (aspect-ratio), e o balão
    # é HTML por cima, posicionado em % — nunca {{t.…}} dentro de <text>
    w, hh = 420, 140
    regioes = ''.join(f'<rect x="{x0}" y="22" width="{x1 - x0}" height="110" rx="18" style="fill:color-mix(in oklch, var(--pri) 5%, transparent);'
                      f'stroke:color-mix(in oklch, var(--pri) 18%, transparent);stroke-dasharray:2 5;"/>'
                      for x0, x1 in ((6, 150), (158, 312), (320, 414)))

    def curva(ps):
        d = f'M{ps[0][0]},{ps[0][1]}'
        for a in range(len(ps) - 1):
            p0 = ps[a - 1] if a > 0 else ps[a]
            p1, p2 = ps[a], ps[a + 1]
            p3 = ps[a + 2] if a + 2 < len(ps) else p2
            d += (f' C{p1[0] + (p2[0] - p0[0]) / 5:.1f},{p1[1] + (p2[1] - p0[1]) / 5:.1f} '
                  f'{p2[0] - (p3[0] - p1[0]) / 5:.1f},{p2[1] - (p3[1] - p1[1]) / 5:.1f} {p2[0]},{p2[1]}')
        return d
    caminho = (f'<path d="{curva(MINI)}" style="fill:none;stroke:var(--card);stroke-width:6;stroke-linecap:round;"/>'
               f'<path d="{curva(MINI[atual:])}" style="fill:none;stroke:var(--input);stroke-width:2;stroke-dasharray:1 5;stroke-linecap:round;"/>'
               f'<path d="{curva(MINI[:atual + 1])}" style="fill:none;stroke:var(--pri);stroke-width:2.5;stroke-linecap:round;"/>')
    nos = ''
    for n, (x, y) in enumerate(MINI):
        if n < atual:
            nos += (f'<circle cx="{x}" cy="{y}" r="8" style="fill:var(--pri);"/>'
                    f'<path d="M{x - 3.5},{y} l2.5,2.5 l4.5,-5" style="fill:none;stroke:var(--prifg);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;"/>')
        elif n == atual:
            nos += (f'<circle cx="{x}" cy="{y}" r="17" style="fill:color-mix(in oklch, var(--pri) 12%, transparent);"/>'
                    f'<circle cx="{x}" cy="{y}" r="9" style="fill:var(--card);stroke:var(--pri);stroke-width:2.5;"/>')
        else:
            nos += f'<circle cx="{x}" cy="{y}" r="6" style="fill:var(--card);stroke:var(--input);stroke-width:1.4;"/>'
        if n in MARCOS:
            nos += (f'<g transform="translate({x + 7},{y + 2})"><path d="M0,0 V-16" style="stroke:var(--fgs);stroke-width:1.2;"/>'
                    f'<path d="M0,-16 h10 l-2.5,3.5 l2.5,3.5 h-10 z" style="fill:var(--accent);stroke:var(--fgs);stroke-width:1;stroke-linejoin:round;"/></g>')
    x, y = MINI[atual]
    seta = f'<path d="M{x - 4},{y - 19} l4,5 l4,-5 z" style="fill:var(--fgs);"/>'
    balao = (f'<span style="position:absolute;left:{x / w * 100:.2f}%;top:{(y - 20) / hh * 100:.2f}%;transform:translate(-50%,-100%);'
             f'height:22px;padding:0 10px;border-radius:11px;background:{k["fgs"]};color:{k["bg"]};display:flex;align-items:center;'
             f'font-size:11px;font-weight:600;white-space:nowrap;">{T("miniAqui")}</span>')
    return (f'<a href="TrilhaMovel{sufixo}.dc.html" style="display:flex;flex-direction:column;gap:6px;padding:12px 12px 8px;border-radius:12px;'
            f'background:{k["rail"]};box-shadow:inset 0 0 0 1px {k["border"]};color:inherit;">'
            f'<span style="display:flex;align-items:center;">{rotulo(T("miniTit"), k["mfg"], 9.5)}'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;min-height:24px;font-size:12.5px;font-weight:500;color:{k["pri"]};">'
            f'{T("miniVer")}{ic("seta", 12)}</span></span>'
            f'<span style="position:relative;display:block;width:100%;aspect-ratio:{w} / {hh};">'
            f'<svg viewBox="0 0 {w} {hh}" width="100%" height="100%" role="img" aria-label="{T("miniTit")}: {atual}/8" style="position:absolute;inset:0;">'
            f'{regioes}{caminho}{nos}{seta}</svg>{balao}</span></a>')


def tela_trilhas_movel(k, sufixo):
    cab = titulo_movel(k, T('tTitulo'), T('tSub'))
    destaque = card(k,
                    f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("continuar"), k["mfg"])}'
                    f'<span style="margin-left:auto;">{badge("Testing", k, "blue")}</span></div>'
                    f'<div style="display:flex;flex-direction:column;gap:4px;">'
                    f'<span style="font-size:13px;color:{k["mfg"]};">{T("t1")} · {T("proxEtapa")}</span>'
                    f'<h2 style="margin:0;font-size:20px;line-height:26px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("e1")}</h2>'
                    f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("e1Txt")}</p></div>'
                    + _minimapa_movel(k, sufixo, 3)
                    + _progresso(k, 3, 8)
                    + botao_cheio(T('continuarBtn'), f'TrilhaMovel{sufixo}.dc.html', k), pad='18px 16px', gap=14)
    filtros = rolavel(k, [chip(k, T('filtroTodas'), True), chip(k, T('filtroAndamento')), chip(k, T('filtroRecomendadas')), chip(k, T('filtroFeitas'))])

    def cartao_trilha(tit, txt, comp, niveis, etapas, feitas, horas, pro, pra_voce):
        de, ate = niveis
        topo_ = (f'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">{badge(comp, k, "blue")}'
                 + (badge(T('recomendada'), k, 'green', ponto=True) if pra_voce else '')
                 + (f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;color:{k["mfg"]};">{ic("cadeado", 12)}{T("so_pro")}</span>' if pro else '')
                 + '</div>')
        niv = (f'<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">{escala(ate, k, 14)}'
               f'{NIVEIS[de - 1]} → {NIVEIS[ate - 1]}</span>')
        pe = (_progresso(k, feitas, etapas) if feitas else
              f'<span style="display:flex;align-items:center;justify-content:space-between;width:100%;min-height:24px;font-size:13px;color:{k["mfg"]};">'
              f'<span>{etapas} {T("etapas")} · {horas} {T("horas")}</span>'
              f'<span style="font-weight:500;color:{k["mfg"] if pro else k["pri"]};">{T("comecar")}</span></span>')
        return (f'<a href="{f"TrilhaMovel{sufixo}.dc.html" if tit == "t1" else "#"}" style="display:flex;flex-direction:column;gap:10px;padding:16px;'
                f'border-radius:14px;background:{k["card"]};box-shadow:{k["sombra"]};color:inherit;{"opacity:0.85;" if pro else ""}">{topo_}'
                f'<div style="display:flex;flex-direction:column;gap:4px;"><span style="font-size:16px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                f'<span style="font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T(txt)}</span></div>{niv}{pe}</a>')
    lista = '<div style="display:flex;flex-direction:column;gap:12px;">' + ''.join(cartao_trilha(*d) for d in TRILHAS_DADOS) + '</div>'
    return app_movel(k, 'trilhas', T('tTitulo'), cab + destaque + filtros + lista)


# ── Uma trilha: o mapa vertical ──
# as estações descem num zigue-zague curto, na faixa da esquerda de um quadro de 358; os nomes ficam
# todos numa coluna à direita, e o caminho nunca passa por cima deles
MV_W = 358
MV_X = [46, 104, 46, 104, 46, 104, 46, 104]
MV_Y0, MV_PASSO, MV_ENTRE = 76, 106, 28
MV_NOMES = 140
MV_REGIOES = [('r1', 0, 2), ('r2', 3, 5), ('r3', 6, 7)]


def _mapa_vertical(k):
    # entre uma região e outra, um respiro a mais: o nome da região não encosta no da estação
    inicio_regiao = {a for _, a, _ in MV_REGIOES[1:]}
    pts, y = [], MV_Y0
    for i, x in enumerate(MV_X):
        if i:
            y += MV_PASSO + (MV_ENTRE if i in inicio_regiao else 0)
        pts.append((x, y))
    hh = pts[-1][1] + 70
    textos = []

    def texto(x, y, conteudo, estilo, ancora='start'):
        tx = {'middle': '-50%', 'start': '0', 'end': '-100%'}[ancora]
        textos.append(f'<span style="position:absolute;left:{x / MV_W * 100:.2f}%;top:{y / hh * 100:.2f}%;transform:translate({tx},-50%);{estilo}">{conteudo}</span>')

    faixas = ''
    for chave, a, b in MV_REGIOES:
        y0 = pts[a][1] - 62
        y1 = pts[b][1] + 40
        faixas += (f'<rect x="4" y="{y0}" width="{MV_W - 8}" height="{y1 - y0}" rx="26" style="fill:color-mix(in oklch, var(--pri) 5%, transparent);'
                   f'stroke:color-mix(in oklch, var(--pri) 20%, transparent);stroke-dasharray:2 6;"/>')
        # o nome da região no canto de cima, à direita: longe do caminho e do balão
        texto(MV_W - 20, y0 + 16, T(chave), f'color:{k["mfg"]};font-family:{MONO};font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;'
                                            f'white-space:nowrap;', 'end')

    def curva(ps):
        d = f'M{ps[0][0]},{ps[0][1]}'
        for a in range(len(ps) - 1):
            p0 = ps[a - 1] if a > 0 else ps[a]
            p1, p2 = ps[a], ps[a + 1]
            p3 = ps[a + 2] if a + 2 < len(ps) else p2
            d += (f' C{p1[0] + (p2[0] - p0[0]) / 5:.1f},{p1[1] + (p2[1] - p0[1]) / 5:.1f} '
                  f'{p2[0] - (p3[0] - p1[0]) / 5:.1f},{p2[1] - (p3[1] - p1[1]) / 5:.1f} {p2[0]},{p2[1]}')
        return d
    atual = 3
    caminho = (f'<path d="{curva(pts)}" style="fill:none;stroke:var(--card);stroke-width:10;stroke-linecap:round;"/>'
               f'<path d="{curva(pts[atual:])}" style="fill:none;stroke:var(--input);stroke-width:2.5;stroke-dasharray:1 7;stroke-linecap:round;"/>'
               f'<path d="{curva(pts[:atual + 1])}" style="fill:none;stroke:var(--pri);stroke-width:3;stroke-linecap:round;"/>')
    halo = f'text-shadow:0 0 3px {k["card"]}, 0 0 3px {k["card"]}, 0 0 3px {k["card"]};'
    nos = ''
    for n, ((x, y), (tit, tipo, mins, estado, nota)) in enumerate(zip(pts, ETAPAS)):
        if estado == 'feita':
            nos += (f'<circle cx="{x}" cy="{y}" r="14" style="fill:var(--pri);"/>'
                    f'<path d="M{x - 5.5},{y} l3.8,3.8 l7,-7.5" style="fill:none;stroke:var(--prifg);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;"/>')
        elif estado == 'agora':
            nos += (f'<circle cx="{x}" cy="{y}" r="30" style="fill:color-mix(in oklch, var(--pri) 9%, transparent);"/>'
                    f'<circle cx="{x}" cy="{y}" r="21" style="fill:color-mix(in oklch, var(--pri) 15%, transparent);"/>'
                    f'<circle cx="{x}" cy="{y}" r="15" style="fill:var(--card);stroke:var(--pri);stroke-width:3;"/>'
                    f'<text x="{x}" y="{y + 4}" text-anchor="middle" style="fill:var(--pri);font-family:{MONO};font-size:12px;font-weight:600;">{n + 1}</text>')
        else:
            nos += (f'<circle cx="{x}" cy="{y}" r="12" style="fill:var(--card);stroke:var(--input);stroke-width:1.5;"/>'
                    f'<text x="{x}" y="{y + 4}" text-anchor="middle" style="fill:var(--mfg);font-family:{MONO};font-size:11px;">{n + 1}</text>')
        if n in MARCOS:
            nos += (f'<g transform="translate({x + 13},{y + 4})"><path d="M0,0 V-24" style="stroke:var(--fgs);stroke-width:1.4;"/>'
                    f'<path d="M0,-24 h15 l-3.5,5.5 l3.5,5.5 h-15 z" style="fill:var(--accent);stroke:var(--fgs);stroke-width:1.1;stroke-linejoin:round;"/></g>')
        # o nome na coluna da direita, na altura da estação
        cor = k['fgs'] if estado != 'depois' else k['mfg']
        sub = f'{T("nota")} {nota}' if nota else f'{mins} {T("min")}'
        marco = (f'<span style="display:block;margin-top:2px;font-size:11.5px;font-weight:600;color:{k["fgs"]};">{T(MARCOS[n])}</span>' if n in MARCOS else '')
        bloco = (f'<span style="display:block;font-size:13px;line-height:17px;font-weight:{600 if estado == "agora" else 500};color:{cor};">{T(tit)}</span>'
                 f'<span style="display:block;margin-top:2px;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{sub}</span>{marco}')
        texto(MV_NOMES, y, bloco, f'width:{(MV_W - MV_NOMES - 14) / MV_W * 100:.1f}%;text-align:left;{halo}', 'start')
    x, y = pts[atual]
    aqui = (f'<g><rect x="{x - 58}" y="{y - 66}" width="116" height="24" rx="12" style="fill:var(--fgs);"/>'
            f'<path d="M{x - 6},{y - 42} l6,7 l6,-7 z" style="fill:var(--fgs);"/></g>')
    texto(x, y - 54, T('vcAqui'), f'color:{k["bg"]};font-size:11.5px;font-weight:600;white-space:nowrap;', 'middle')
    return (f'<div style="position:relative;width:100%;aspect-ratio:{MV_W} / {hh};">'
            f'<svg viewBox="0 0 {MV_W} {hh}" width="100%" height="100%" role="img" aria-label="{T("mapa")}: 3/8" style="position:absolute;inset:0;">'
            f'{faixas}{caminho}{nos}{aqui}</svg>{"".join(textos)}</div>')


def _vista_movel(k, sufixo, atual='mapa'):
    op = lambda chave, dest, at: (f'<a href="{dest}" style="flex:1;display:flex;align-items:center;justify-content:center;height:36px;border-radius:999px;'
                                  f'font-size:13px;font-weight:500;'
                                  + (f'background:{k["card"]};color:{k["pri"]};box-shadow:0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px {k["input"]};' if at
                                     else f'color:{k["mfg"]};') + f'">{T(chave)}</a>')
    return (f'<span role="navigation" style="display:flex;width:100%;padding:2px;border-radius:999px;background:{k["sunken"]};'
            f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};">'
            + op('vMapa', f'TrilhaMovel{sufixo}.dc.html', atual == 'mapa')
            + op('vLista', f'TrilhaListaMovel{sufixo}.dc.html', atual == 'lista') + '</span>')


def tela_trilha_movel(k, sufixo):
    cab = titulo_movel(k, T('dTitulo'), T('dSub'), voltar_para=(T('tTitulo'), f'TrilhasMovel{sufixo}.dc.html'))
    agora = card(k,
                 f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("agoraTit"), k["mfg"])}</div>'
                 f'<span style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:{k["prisubfg"]};">{ic("recarregar", 13)}{T("repetiu")}</span>'
                 f'<span style="font-size:17px;font-weight:600;color:{k["fgs"]};">{T("s4")}</span>'
                 f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("repetiuTxt")}</p>'
                 + botao_cheio(T('comecar'), f'Exercicio{sufixo}.dc.html', k), gap=10)
    mapa = card(k, f'<div style="display:flex;align-items:center;">{rotulo(T("mapa"), k["mfg"])}</div>{_vista_movel(k, sufixo)}{_mapa_vertical(k)}',
                pad='16px 16px 12px', gap=12)
    linha_nivel = lambda rot, n, extra='': (f'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
                                            f'<span style="width:82px;font-size:13px;color:{k["mfg"]};">{rot}</span>{escala(n, k, 16)}'
                                            f'<span style="font-size:13px;color:{k["fgs"]};">{NIVEIS[n - 1]}</span>{extra}</div>')
    nivel = card(k, f'{rotulo(T("seuNivel"), k["mfg"])}'
                    + linha_nivel(T('declarado'), 3) + linha_nivel(T('observado'), 3, badge(T('aConfirmar'), k, 'yellow'))
                    + f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("nivelTxt")}</p>'
                    f'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:10px;box-shadow:inset 0 1px 0 {k["muted"]};">'
                    f'<span style="font-size:13px;color:{k["mfg"]};flex:1;min-width:140px;">{T("conta")}</span>'
                    f'{badge("Testing", k, "blue")}{badge("Debugging", k)}</div>', gap=10)
    return app_movel(k, 'trilha', T('tTitulo'), cab + agora + mapa + nivel)


def tela_trilha_lista_movel(k, sufixo):
    # a mesma lista do desktop: a linha inteira abre o exercício, a seta à direita, alvo de 48px;
    # sem hover no toque, o rótulo da ação não aparece, a seta basta
    cab = titulo_movel(k, T('dTitulo'), T('dSub'), voltar_para=(T('tTitulo'), f'TrilhasMovel{sufixo}.dc.html'))
    passos = ''.join(linha_etapa(k, n, sufixo, movel=True, exercicio=f'Exercicio{sufixo}.dc.html') for n in range(len(ETAPAS)))
    lista = card(k, f'<div style="display:flex;align-items:center;">{rotulo(T("mapa"), k["mfg"])}</div>{_vista_movel(k, sufixo, "lista")}'
                    f'<div style="display:flex;flex-direction:column;">{passos}</div>', pad='16px 16px 8px', gap=12)
    return app_movel(k, 'trilha_lista', T('tTitulo'), cab + lista)


# ── Exercícios ──
def tela_exercicios_movel(k, sufixo):
    cab = titulo_movel(k, T('cTitulo'), T('cSub'))
    uso = card(k, f'<span style="display:flex;justify-content:space-between;font-size:13px;color:{k["mfg"]};">'
                  f'<span>{T("uso")}</span><span style="font-family:{MONO};color:{k["fgs"]};">37 {T("usoDe")} 100</span></span>'
                  f'<span style="display:block;height:6px;border-radius:3px;background:{k["sunken"]};">'
                  f'<span style="display:block;height:6px;width:37%;border-radius:3px;background:{k["pri"]};"></span></span>', pad='12px 14px', gap=8)
    filtros = rolavel(k, [filtro40(k, T('fCompetencia')), filtro40(k, T('fNivel')), filtro40(k, T('fLinguagem'))])
    abas = abas_rolaveis(k, [(T('abaTodos'), 48, True, '#'), (T('abaParaVoce'), 6, False, '#'),
                             (T('abaAndamento'), 1, False, '#'), (T('abaFeitos'), 9, False, '#')], T('cTitulo'))
    cartoes = ''
    for tit, comps, nivel, lg, mins, estado, nota, trilha_ in EXERCICIOS:
        selo = {'novo': badge(T('novo'), k, 'gray'), 'andamento': badge(T('andamento'), k, 'blue', ponto=True),
                'feito': badge(T('feito') + f' · {nota}', k, 'green', ponto=True),
                'pro': f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:{k["mfg"]};">{ic("cadeado", 12)}{T("proBloq")}</span>'}[estado]
        acao = {'novo': T('abrir'), 'andamento': T('continuar'), 'feito': T('refazer'), 'pro': T('verPro')}[estado]
        dest = f'Planos{sufixo}.dc.html' if estado == 'pro' else f'Exercicio{sufixo}.dc.html'
        cartoes += (f'<a href="{dest}" style="display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:14px;background:{k["card"]};'
                    f'box-shadow:{k["sombra"]};color:inherit;">'
                    f'<div style="display:flex;flex-direction:column;gap:2px;">'
                    f'<span style="font-size:15px;font-weight:600;line-height:20px;color:{k["fgs"] if estado != "pro" else k["mfg"]};">{T(tit)}</span>'
                    + (f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("daTrilha")} · {T("t1")}</span>' if trilha_ else '')
                    + '</div>'
                    f'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">{"".join(badge(c, k, "blue" if c == "Testing" else "gray") for c in comps)}'
                    f'{_linguagem(k, lg)}</div>'
                    f'<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">'
                    f'<span>{T("pleno") if nivel == "Pleno" else nivel}</span><span>·</span><span style="font-family:{MONO};">{mins} min</span></div>'
                    f'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:10px;box-shadow:inset 0 1px 0 {k["muted"]};">'
                    f'{selo}<span style="display:flex;align-items:center;gap:4px;min-height:32px;font-size:13.5px;font-weight:500;'
                    f'color:{k["pri"] if estado != "pro" else k["mfg"]};">{acao}{ic("seta", 12)}</span></div></a>')
    lista = f'<div style="display:flex;flex-direction:column;gap:12px;">{cartoes}</div>'
    return app_movel(k, 'exercicios', T('cTitulo'), cab + uso + busca_cheia(k, 'busca') + filtros + abas + lista, gap=14)


def _linguagem(k, nome):
    # a linguagem com o logo: não se confunde com a competência de mesmo nome (TypeScript)
    chave = {'TypeScript': 'ts', 'Python': 'py', 'Go': 'go'}[nome]
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px 0 4px;border-radius:4px;'
            f'box-shadow:inset 0 0 0 1px {k["border"]};font-family:{MONO};font-size:11px;color:{k["fg"]};">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;background:#fff;">'
            f'{logo_marca(chave, 11)}</span>{nome}</span>')


# ── Minha conta ──
def tela_conta_movel(k, sufixo):
    cab = titulo_movel(k, T('contaTitulo'), T('contaSub'))
    abas = abas_rolaveis(k, [(T(texto), '', chave == 'dados', f'{quadro}{sufixo}.dc.html') for chave, texto, quadro in ABAS], T('abasAria'))
    opcional = f'<span style="font-size:12px;font-weight:400;color:{k["mfg"]};">{T("opcional")}</span>'
    alto = lambda html: html.replace('height:36px;border-radius:9px;', 'height:44px;border-radius:10px;')
    dados = _cartao(k, T('dadosTit'), T('dadosSub'), (
        f'<form style="margin:0;display:flex;flex-direction:column;gap:14px;">'
        + alto(_campo(k, 'apelido', T('apelido'), 'Rafael'))
        + alto(_campo(k, 'nome', T('nome'), 'Rafael Moura'))
        + alto(_campo(k, 'telefone', T('telefone'), '', T('telefonePh'), T('telefoneNota'), opcional, '+55'))
        + f'<a href="#" style="display:flex;align-items:center;align-self:flex-start;min-height:32px;margin-top:-8px;font-size:13px;">{T("removerTelefone")}</a>'
        + alto(_campo(k, 'cpf', T('cpf'), '***.***.247-25', nota=T('cpfNota'), mono=True, so_leitura=True))
        + f'<div style="display:flex;gap:8px;padding-top:4px;">'
          f'{botao(T("descartar"), k, "ghost", 44, largura="100%")}{botao(T("salvar"), k, "primary", 44, largura="100%")}</div></form>'),
        extra='padding:16px;')
    atual = (f'<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:10px;background:{k["sunken"]};">'
             f'<span style="display:flex;color:{k["mfg"]};">{ic("envelope", 16)}</span>'
             f'<span style="flex:1;min-width:0;font-family:{MONO};font-size:13px;color:{k["fgs"]};overflow:hidden;text-overflow:ellipsis;">rafael@moura.dev</span>'
             f'{badge(T("verificado"), k, "green", ponto=True)}</div>')
    email = _cartao(k, T('emailTit'), T('emailSub'), atual + botao(T('trocarEmail'), k, 'outline', 44, largura='100%'), extra='padding:16px;')
    termos = _cartao(k, T('termosTit'), '', (
        f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("termosTxt")}</p>'
        f'<div style="display:flex;gap:18px;font-size:13.5px;"><a href="#" style="display:flex;align-items:center;min-height:32px;">{T("verTermos")}</a>'
        f'<a href="#" style="display:flex;align-items:center;min-height:32px;">{T("verPrivacidade")}</a></div>'), extra='padding:16px;')
    excluir = _cartao(k, T('excluirTit'), T('excluirSub'),
                      f'<div style="display:flex;">{_botao_perigo(k, T("excluir")).replace("height:32px", "height:44px")}</div>',
                      extra=f'padding:16px;box-shadow:{k["sombra"]}, inset 0 0 0 1px color-mix(in oklch, {k["bad"]} 35%, transparent);')
    return app_movel(k, 'conta', T('contaTitulo'), cab + abas + dados + email + termos + excluir, gap=16)


# ── Boas-vindas às trilhas: a folha que sobe de baixo ──
def tela_boas_vindas_movel(k, sufixo):
    fundo = tela_trilhas_movel(k, sufixo).replace(f'height:{ALTURAS["trilhas"]}px', f'height:{ALTURAS["boas_vindas"]}px', 1)
    if MEDIR:
        fundo = fundo.replace('height:auto', f'height:{ALTURAS["boas_vindas"]}px', 1)
    assert fundo.endswith('</div>')
    marcas = [('ts', 96, 30, 36), ('py', 262, 26, 36), ('js', 40, 84, 28), ('go', 312, 90, 28),
              ('docker', 150, 108, 24), ('rust', 22, 24, 24), ('postgres', 340, 30, 24), ('aws', 222, 112, 26)]
    chips = ''.join(
        f'<span class="splash-chip" title="{nome_marca(c)}" style="animation-delay:{0.4 + 0.07 * i:.2f}s;position:absolute;left:{x}px;top:{y}px;'
        f'width:{t}px;height:{t}px;display:flex;align-items:center;justify-content:center;border-radius:{t * 0.28:.0f}px;background:#fff;'
        f'box-shadow:0 6px 16px -6px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06);transform:rotate({[-6, 5, -3, 7, -8, 4, 9, -5][i]}deg);">'
        f'{logo_marca(c, round(t * 0.56))}</span>'
        for i, (c, x, y, t) in enumerate(marcas))
    splash = (f'<div style="position:relative;height:148px;overflow:hidden;'
              f'background:linear-gradient(135deg, color-mix(in oklch, {k["pri"]} 16%, {k["card"]}) 0%, {k["card"]} 55%, '
              f'color-mix(in oklch, {k["accent"]} 30%, {k["card"]}) 100%);">'
              f'<span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:999px;'
              f'background:radial-gradient(circle, color-mix(in oklch, {k["pri"]} 14%, transparent), transparent 70%);"></span>'
              f'<span class="splash-mascote" style="position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;display:flex;">{LOGO}</span>'
              f'{chips}</div>')

    def passo(n, chave):
        cor = k['pri'] if n == 1 else h('bv.s' + str(n))
        return (f'<span style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
                f'<span style="height:4px;border-radius:999px;background:{cor};"></span>'
                f'<span style="font-size:11px;line-height:14px;color:{k["mfg"]};">{n}. {T(chave)}</span></span>')
    stepper = f'<div role="list" style="display:flex;gap:8px;">{passo(1, "bvP1")}{passo(2, "bvP2")}{passo(3, "bvP3")}</div>'
    chip_ = lambda t: (f'<span style="display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;'
                       f'background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;font-weight:500;">{t}</span>')
    chip_marca = lambda c: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px 0 4px;border-radius:999px;'
                            f'background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;font-weight:500;">'
                            f'<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background:#fff;">'
                            f'{logo_marca(c, 12)}</span>{nome_marca(c)}</span>')
    linha = lambda rot, v: (f'<div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12.5px;color:{k["mfg"]};">{T(rot)}</span>'
                            f'<span style="display:flex;gap:6px;flex-wrap:wrap;">{v}</span></div>')
    titulo = lambda chave: f'<h2 style="margin:0;font-size:21px;line-height:27px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T(chave)}</h2>'
    texto = lambda chave: f'<p style="margin:0;font-size:14px;line-height:20px;color:{k["mfg"]};">{T(chave)}</p>'
    p1 = (titulo('bv1Tit') + texto('bv1Txt')
          + f'<div style="display:flex;flex-direction:column;gap:10px;">'
          + linha('bvExp', chip_(T('expContou'))) + linha('bvLing', chip_marca('ts') + chip_marca('py'))
          + linha('bvObj', chip_(T('bvAprender')) + chip_(T('bvRevisar'))) + '</div>'
          f'<div style="display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:10px;background:{k["sunken"]};">'
          f'<span style="display:flex;margin-top:2px;color:{k["pri"]};">{ic("trilhas", 15)}</span>'
          f'<span style="font-size:13.5px;line-height:20px;color:{k["fgs"]};font-weight:500;">{T("bvComeco")}</span></div>')

    def trilha_linha(n, tit, comp, tom, etapas, marca):
        return (f'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;'
                + (f'box-shadow:inset 0 0 0 1.5px {k["pri"]};background:color-mix(in oklch, {k["pri"]} 5%, {k["card"]});' if n == 1
                   else f'box-shadow:inset 0 0 0 1px {k["border"]};')
                + f'"><span style="font-family:{MONO};font-size:12px;color:{k["mfg"]};width:12px;">{n}</span>'
                f'<span style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;">'
                f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                f'<span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">{badge(comp, k, tom)}'
                f'<span style="font-size:12px;color:{k["mfg"]};">{etapas} {T("bvEtapas")}</span>'
                f'<span style="font-size:11.5px;font-weight:{600 if n == 1 else 400};color:{k["pri"] if n == 1 else k["mfg"]};">· {T(marca)}</span></span></span></div>')
    p2 = (titulo('bv2Tit') + texto('bv2Txt')
          + f'<div style="display:flex;flex-direction:column;gap:8px;">'
          + trilha_linha(1, 't1', 'Testing', 'blue', 8, 'bvComecaAqui') + trilha_linha(2, 't3', 'TypeScript', 'gray', 7, 'bvDepois')
          + trilha_linha(3, 't5', 'Architecture', 'yellow', 9, 'bvDepois') + '</div>')
    item = lambda icone, tit, txt: (f'<div style="display:flex;gap:12px;align-items:flex-start;">'
                                     f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;flex:0 0 auto;'
                                     f'background:{k["prisub"]};color:{k["prisubfg"]};">{ic(icone, 16)}</span>'
                                     f'<span style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                                     f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T(txt)}</span></span></div>')
    p3 = (titulo('bv3Tit') + texto('bv3Txt')
          + f'<div style="display:flex;flex-direction:column;gap:14px;">'
          + item('exercicios', 'bvI1', 'bvI1Txt') + item('recarregar', 'bvI2', 'bvI2Txt') + item('evolucao', 'bvI3', 'bvI3Txt') + '</div>')
    cheio = lambda html: html.replace('display:inline-flex;', 'display:flex;width:100%;', 1)
    # o estado do passo mora em bv (ANTES_BOAS_VINDAS), como nas boas-vindas do desktop
    sb = lambda chave, html, padrao=False: se('bv.' + chave, html, padrao)
    rodape = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
              + sb('naoP3', cheio(botao(T('bvContinuar'), k, 'solid', 44, 'seta', acao='bvProximo')), True)
              + sb('p3', botao_cheio(T('bvAbrir'), f'TrilhaMovel{sufixo}.dc.html', k))
              + f'<div style="display:flex;align-items:center;justify-content:space-between;">'
                f'<a href="TrilhasMovel{sufixo}.dc.html" style="display:flex;align-items:center;height:44px;padding:0 4px;font-size:14px;font-weight:500;color:{k["mfg"]};">{T("bvPular")}</a>'
              + sb('naoP1', botao(T('bvVoltar'), k, 'ghost', 44, acao='bvVoltar')) + '</div></div>')
    corpo = (f'<div style="display:flex;flex-direction:column;gap:16px;padding:18px {PAD + 4}px 20px;">'
             f'{rotulo(T("bvRotulo"), k["mfg"])}{stepper}'
             f'<div style="display:flex;flex-direction:column;gap:12px;">'
             + sb('p1', p1, True) + sb('p2', p2) + sb('p3', p3) + f'</div>{rodape}</div>')
    alca = (f'<span aria-hidden="true" style="position:absolute;left:50%;top:8px;z-index:2;width:40px;height:4px;margin-left:-20px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["fgs"]} 30%, transparent);"></span>')
    veu = (f'<div class="splash-veu" style="position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;justify-content:flex-end;'
           f'background:color-mix(in oklch, {k["bg"]} 45%, transparent);backdrop-filter:blur(14px) saturate(115%);-webkit-backdrop-filter:blur(14px) saturate(115%);">'
           f'<section role="dialog" aria-modal="true" aria-label="{T("bvRotulo")}" class="splash-modal" style="position:relative;max-height:92%;overflow:hidden;'
           f'border-radius:22px 22px 0 0;background:{k["card"]};box-shadow:0 -20px 60px -20px rgba(0,0,0,0.45), 0 0 0 1px {k["border"]};">'
           f'{alca}{splash}{corpo}</section></div>')
    return fundo[:-6] + veu + '</div>'
