# As peças do Muriki Platform: a base do Muriki Code (tokens, casca, lógica de idioma e tema,
# ícones, topo) mais o que as telas do Platform pedem. Os campos seguem os do registry: o
# InputGroup no tamanho touch (44px), com o afixo dentro do mesmo filete, e a frase do estado
# embaixo, ligada ao campo.
import os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
# no fim do caminho, não no começo: textos.py e telas.py daqui têm o mesmo nome que os do Code
sys.path.append(os.path.join(AQUI, '..', 'muriki-code'))
from base import (TOKENS, K, W, H, FONTE, MONO, I, svg, ic, casca, logica, props_tema, PROPS_IDIOMA, T, raiz,  # noqa: E402,F401
                  topo, rotulo, LOGO)

from textos import COMUM, juntar  # noqa: E402

# --field do tema do registry: card no claro, sunken no escuro
TOKENS['claro']['field'] = TOKENS['claro']['card']
TOKENS['escuro']['field'] = TOKENS['escuro']['sunken']
K['field'] = 'var(--field)'
# a borda do primary-subtle (--primary-subtle-border do muriki.css): os pontos do palco da prévia
TOKENS['claro']['prisubborda'] = 'oklch(0.87 0.055 262.6)'
TOKENS['escuro']['prisubborda'] = 'oklch(0.375 0.085 262.6)'
K['prisubborda'] = 'var(--prisubborda)'

I.update(
    # os estados do campo de nome único: cheios, como os do Phosphor no bloco (weight="fill")
    livre=svg('<circle cx="8" cy="8" r="6.6" fill="currentColor" stroke="none"/>'
              '<path d="M5.3 8.2l1.8 1.8 3.6-3.8" stroke="var(--field)" stroke-width="1.6"/>'),
    ocupado=svg('<circle cx="8" cy="8" r="6.6" fill="currentColor" stroke="none"/>'
                '<path d="M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2" stroke="var(--field)" stroke-width="1.6"/>'),
    reservado=svg('<rect x="3.4" y="7" width="9.2" height="7" rx="1.6"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>'),
    alerta=svg('<path d="M8 2.2l6.2 11H1.8z"/><path d="M8 6.6v3"/><path d="M8 11.6v.1"/>'),
)

PRODUTO = 'Muriki Platform'
EMAIL = 'rafael@moura.dev'


def esc(txt):
    return txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def pagina(titulo, corpo, tema, textos):
    return casca(titulo, corpo, logica(juntar(COMUM, textos), tema), {**PROPS_IDIOMA, **props_tema(tema)})


# ── Onboarding ──────────────────────────────────────────────────────────
# O OnboardingStep do registry (o título em 50px: o clamp por altura do passo de identidade em 900): o topo com a marca, idioma e tema; o cabeçalho de passo (rótulo
# mono, barra e título de display) e o conteúdo numa coluna de 672px.
def cabecalho_passo(k, n, total, titulo, sub=''):
    passos = ''.join(f'<span style="height:4px;flex:1;border-radius:2px;background:{k["pri"] if i < n else k["sunken"]};"></span>'
                     for i in range(total))
    legenda_ = f'{T("passoRotulo")} · {n} {T("de")} {total}'
    return (f'<header style="display:flex;flex-direction:column;gap:16px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;width:100%;">{rotulo(legenda_, k["mfg"])}'
            f'<div role="progressbar" aria-valuemin="1" aria-valuemax="{total}" aria-valuenow="{n}" '
            f'aria-label="{T("passosAria")} {n} {T("de")} {total}" style="display:flex;gap:6px;width:100%;">{passos}</div></div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;">'
            f'<h1 style="margin:0;font-size:50px;line-height:1.02;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{titulo}</h1>'
            + (f'<p style="margin:0;max-width:65ch;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p>' if sub else '')
            + '</div></header>')


def pagina_identidade(k, formulario, previa):
    # o PlatformOnboardingIdentity a partir do lg, medido em 1440×900: a grade 1fr / 1.2fr da altura da
    # janela, a barra do topo por cima das duas colunas, o formulário numa coluna de 512px centrada na
    # vertical e, à direita, o palco azul (primary-subtle com a grade de pontos) com a janela da prévia.
    # Os clamp() do componente, resolvidos para 900 de altura
    pontos = f'radial-gradient({k["prisubborda"]} 1px, transparent 1.5px)'
    return (f'{raiz(k, "display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);")}'
            f'<div style="position:absolute;inset:0 0 auto 0;z-index:1;">{topo(k, PRODUTO, EMAIL)}</div>'
            f'<main style="display:flex;flex-direction:column;justify-content:center;gap:32px;width:512px;justify-self:center;'
            f'padding:64px 0 27px;">{formulario}</main>'
            f'<div style="display:flex;align-items:center;justify-content:center;min-height:0;padding:64px 58px 45px;'
            f'background-color:{k["prisub"]};background-image:{pontos};background-size:22px 22px;">{previa}</div></div>')


# o estado do campo: (ícone no fim, cor do ícone, a frase é erro?)
ESTADOS = {
    'idle': (None, None, False),
    'available': ('livre', 'ok', False),
    'taken': ('ocupado', 'bad', True),
    'reserved': ('reservado', 'bad', True),
}


def campo(k, id_, rotulo_, valor, estado='idle', frase='', afixo='', mono=False, placeholder=''):
    icone, cor, erro = ESTADOS[estado]
    anel = (f'box-shadow:inset 0 0 0 1px {k["bad"]}, 0 0 0 3px color-mix(in oklch, {k["bad"]} 15%, transparent);' if erro
            else f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});')
    pre = (f'<span style="display:flex;align-items:center;flex:0 0 auto;font-family:{MONO};font-size:12.5px;color:{k["mfg"]};">{afixo}</span>'
           if afixo else '')
    fim = f'<span style="display:flex;color:{k[cor]};">{ic(icone, 15)}</span>' if icone else ''
    msg_id = f'{id_}-msg'
    inv = ' aria-invalid="true"' if erro else ''
    entrada = (f'<input id="{id_}" value="{esc(valor)}" placeholder="{placeholder}" aria-describedby="{msg_id}"{inv} '
               f'style="flex:1;min-width:0;height:100%;padding:0;border:0;background:transparent;outline:0;'
               f'font-family:{MONO if mono else FONTE};font-size:15px;color:{k["fgs"]};">')
    caixa = (f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;border-radius:11px;'
             f'background:{k["field"]};{anel}">{pre}{entrada}{fim}</div>')
    if not frase:
        nota = ''
    elif erro:
        nota = (f'<p id="{msg_id}" role="alert" style="margin:0;display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:15px;'
                f'color:{k["bad"]};">{ic("alerta", 13)}<span>{frase}</span></p>')
    else:
        c = k['ok'] if estado == 'available' else k['mfg']
        nota = f'<p id="{msg_id}" aria-live="polite" style="margin:0;font-size:11.5px;line-height:15px;color:{c};">{frase}</p>'
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<label for="{id_}" style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{rotulo_}</label>'
            f'{caixa}{nota}</div>')


def caixa_marcar(k, marcada, rotulo_):
    if marcada:
        caixa = (f'<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;'
                 f'background:{k["pri"]};color:{k["prifg"]};">{ic("check", 11)}</span>')
    else:
        caixa = (f'<span style="display:flex;width:16px;height:16px;border-radius:4px;background:{k["sunken"]};'
                 f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.12);"></span>')
    return (f'<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:20px;color:{k["mfg"]};cursor:pointer;">'
            f'<span role="checkbox" aria-checked="{"true" if marcada else "false"}" style="display:flex;margin-top:2px;flex:0 0 auto;">{caixa}</span>'
            f'<span>{rotulo_}</span></label>')


def botao_passo(k, txt, ligado):
    # a ação do OnboardingStep: Button solid touch com a seta; desligado, meio apagado
    op = '' if ligado else 'opacity:0.5;'
    d = '' if ligado else ' disabled aria-disabled="true"'
    return (f'<div style="display:flex;align-items:center;gap:16px;">'
            f'<button type="submit"{d} style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;'
            f'padding:0 18px;border:0;border-radius:11px;background:{k["pri"]};color:{k["prifg"]};font-family:{FONTE};font-size:15px;'
            f'font-weight:500;{op}">{txt}{ic("seta", 14)}</button></div>')




def cartoes_escolha(k, aria, opcoes, escolhida):
    # o ChoiceCardGroup single do registry: dois cartões lado a lado, o marcado com o anel da marca
    def cartao(valor, titulo, desc):
        marcado = valor == escolhida
        anel = (f'box-shadow:0 0 0 1.5px {k["pri"]}, 0 4px 10px -2px rgba(0,0,0,0.10);' if marcado
                else f'box-shadow:0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);')
        bolinha = f'inset 0 0 0 4px {k["pri"]}' if marcado else f'inset 0 0 0 1.5px {k["input"]}'
        return (f'<button type="button" role="radio" aria-checked="{"true" if marcado else "false"}" '
                f'style="display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:0;border-radius:12px;background:{k["card"]};'
                f'{anel}text-align:left;font-family:{FONTE};cursor:pointer;">'
                f'<span style="display:flex;align-items:center;gap:8px;">'
                f'<span style="width:14px;height:14px;flex:0 0 auto;border-radius:50%;box-shadow:{bolinha};"></span>'
                f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{titulo}</span></span>'
                f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{desc}</span></button>')
    return (f'<div role="radiogroup" aria-label="{aria}" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
            + ''.join(cartao(*o) for o in opcoes) + '</div>')


# ── A prévia ao vivo (WorkspacePreview) ─────────────────────────────────
# A janela do produto que nasce, no estado final (no canvas a animação não roda): sem barra de
# endereço; no topo os três pontos e, no meio, a logo da Muriki e o produto (Muriki Projects ou
# Muriki Focus); embaixo, o nome do workspace em destaque, a frase do que nasce e os lugares. O
# resto são esqueletos sem nome, com as partes azuis acesas quando há nome (primary a 25% e a 60%).
# Os clamp() do componente, resolvidos para 1440×900. Decorativa.
PRODUTOS = {'team': 'Muriki Projects', 'personal': 'Muriki Focus'}


def _barra(k, largura, alt=8, cor=None, raio=999, extra=''):
    return (f'<span style="display:block;flex:0 0 auto;height:{alt}px;width:{largura};border-radius:{raio}px;'
            f'background:{cor or k["sunken"]};{extra}"></span>')


def _azul(k, vivo, forte=False):
    if not vivo:
        return k['sunken']
    return f'color-mix(in oklab, {k["pri"]} {60 if forte else 25}%, transparent)'


def _faixa(k, vivo, abas):
    pilulas = ''.join(_barra(k, w, 24, _azul(k, vivo) if i == 0 else k['sunken'], 7) for i, w in enumerate(abas))
    return (f'<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto;">{pilulas}'
            f'<span style="margin-left:auto;width:96px;height:28px;border-radius:8px;background:{_azul(k, vivo, True)};"></span></div>')


def _painel(k, filhos, extra=''):
    return (f'<div style="display:flex;flex-direction:column;gap:12px;min-height:0;padding:10px;border-radius:12px;'
            f'background:color-mix(in oklab, {k["sunken"]} 55%, transparent);{extra}">{filhos}</div>')


def _topo_painel(k, ponto, titulo):
    return (f'<div style="display:flex;align-items:center;gap:8px;padding:2px 4px 0;">'
            f'<span style="width:8px;height:8px;border-radius:50%;background:{ponto};"></span>{_barra(k, titulo)}'
            f'<span style="margin-left:auto;width:20px;height:16px;border-radius:999px;background:{k["card"]};"></span></div>')


def _quadro(k, vivo):
    colunas = [([('78%', '52%'), ('64%', '40%'), ('70%', '46%')], '64px'),
               ([('58%', '72%'), ('82%', '36%')], '80px'),
               ([('66%', '48%')], '48px')]
    html = ''
    for c, (cartoes, titulo) in enumerate(colunas):
        filhos = _topo_painel(k, _azul(k, vivo, True) if c == 0 else f'color-mix(in oklab, {k["input"]} 70%, transparent)', titulo)
        for i, (a, b) in enumerate(cartoes):
            destaque = c == 0 and i == 0
            anel = f'0 0 0 1px color-mix(in oklab, {k["pri"]} 60%, transparent)' if destaque and vivo else '0 1px 2px rgba(0,0,0,0.05)'
            selo = (f'<span style="position:absolute;top:0;right:0;width:48px;height:14px;border-bottom-left-radius:7px;'
                    f'background:{_azul(k, vivo)};"></span>' if destaque else '')
            filhos += (f'<div style="position:relative;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;max-height:112px;'
                       f'padding:12px;overflow:hidden;border-radius:9px;background:{k["card"]};box-shadow:{anel};">{selo}'
                       f'{_barra(k, a)}{_barra(k, b, cor=f"color-mix(in oklab, {k["sunken"]} 70%, transparent)")}'
                       f'<div style="margin-top:auto;display:flex;align-items:center;gap:6px;">'
                       f'<span style="width:16px;height:16px;border-radius:50%;background:{_azul(k, vivo, True) if destaque else k["sunken"]};"></span>'
                       f'{_barra(k, "32px", 6)}</div></div>')
        html += _painel(k, filhos)
    return (f'<div style="display:flex;flex-direction:column;gap:18px;flex:1;min-height:0;">{_faixa(k, vivo, ["64px", "48px", "56px"])}'
            f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;flex:1;min-height:0;">{html}</div></div>')


def _lista(k, vivo):
    linhas = _topo_painel(k, _azul(k, vivo, True), '56px')
    for i, w in enumerate(['68%', '54%', '76%', '44%', '60%']):
        feita = i == 0
        caixa = (f'background:{_azul(k, vivo, True)};' if feita else f'box-shadow:inset 0 0 0 1.5px {k["input"]};')
        linhas += (f'<div style="display:flex;align-items:center;gap:12px;flex:1;min-height:0;max-height:56px;padding:0 12px;'
                   f'border-radius:9px;background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.05);">'
                   f'<span style="width:16px;height:16px;flex:0 0 auto;border-radius:5px;{caixa}"></span>'
                   f'{_barra(k, w, cor=f"color-mix(in oklab, {k["sunken"]} 60%, transparent)" if feita else None, extra="flex:0 1 auto;min-width:0;")}'
                   f'<span style="margin-left:auto;width:40px;height:16px;flex:0 0 auto;border-radius:999px;'
                   f'background:{_azul(k, vivo) if i == 1 else k["sunken"]};"></span></div>')
    # o anel do dia: 38% da volta de um círculo de raio 42 (só formas no SVG, nada de texto)
    volta = 2 * 3.141592653589793 * 42
    arco = f'color-mix(in oklab, {k["pri"]} 70%, transparent)' if vivo else f'color-mix(in oklab, {k["input"]} 60%, transparent)'
    anel = (f'<svg viewBox="0 0 100 100" style="width:128px;height:128px;transform:rotate(-90deg);">'
            f'<circle cx="50" cy="50" r="42" fill="none" stroke-width="9" style="stroke:{k["card"]};"/>'
            f'<circle cx="50" cy="50" r="42" fill="none" stroke-width="9" stroke-linecap="round" '
            f'stroke-dasharray="{volta * 0.38:.2f} {volta:.2f}" style="stroke:{arco};"/></svg>')
    dia = (f'{anel}<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">'
           f'{_barra(k, "55%")}{_barra(k, "38%", cor=f"color-mix(in oklab, {k["sunken"]} 70%, transparent)")}</div>'
           f'<span style="width:60%;height:28px;border-radius:8px;background:{_azul(k, vivo)};"></span>')
    return (f'<div style="display:flex;flex-direction:column;gap:18px;flex:1;min-height:0;">{_faixa(k, vivo, ["56px", "40px"])}'
            f'<div style="display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:12px;flex:1;min-height:0;">'
            f'{_painel(k, linhas, "gap:8px;")}'
            f'{_painel(k, dia, "align-items:center;justify-content:center;gap:18px;padding:16px;")}</div></div>')


def previa_workspace(k, publico, nome, ph_nome, frase):
    vivo = bool(nome)
    pontos = ''.join(f'<span style="width:10px;height:10px;border-radius:50%;background:{k["sunken"]};"></span>' for _ in range(3))
    barra_janela = (f'<div style="position:relative;display:flex;align-items:center;justify-content:center;height:44px;flex:0 0 auto;padding:0 16px;'
                    f'border-bottom:1px solid color-mix(in oklab, {k["fg"]} 7%, transparent);">'
                    f'<div style="position:absolute;left:16px;display:flex;gap:6px;">{pontos}</div>'
                    f'<div style="display:flex;align-items:center;gap:8px;"><span style="display:flex;width:20px;height:20px;">{LOGO}</span>'
                    f'<span style="font-size:13px;font-weight:600;color:{k["fgs"]};white-space:nowrap;">{PRODUTOS[publico]}</span></div></div>')
    titulo = (f'<h2 style="margin:0;font-size:41px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;'
              + (f'color:{k["fgs"]};">{esc(nome)}</h2>' if vivo else
                 f'color:color-mix(in oklab, {k["mfg"]} 45%, transparent);">{ph_nome}</h2>'))
    vazio = f'border:1.5px dashed {k["input"]};'
    lugares = (f'<span style="width:32px;height:32px;border-radius:50%;background:{_azul(k, vivo, True)};"></span>'
               + (''.join(f'<span style="width:32px;height:32px;margin-left:6px;border-radius:50%;box-sizing:border-box;{vazio}"></span>'
                          for _ in range(3)) if publico == 'team' else ''))
    cabeca = (f'<div style="display:flex;align-items:flex-start;gap:24px;">'
              f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{titulo}'
              f'<p style="margin:0;min-height:40px;max-width:52ch;font-size:15px;line-height:20px;color:{k["mfg"]};text-wrap:pretty;">{frase}</p></div>'
              f'<div style="display:flex;align-items:center;margin-top:8px;flex:0 0 auto;">{lugares}</div></div>')
    corpo = _quadro(k, vivo) if publico == 'team' else _lista(k, vivo)
    return (f'<div aria-hidden="true" style="display:flex;flex-direction:column;width:100%;height:100%;max-width:864px;max-height:736px;'
            f'overflow:hidden;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombraFlut"]}, 0 0 0 1px color-mix(in oklab, {k["fg"]} 8%, transparent);pointer-events:none;user-select:none;">'
            f'{barra_janela}<div style="display:flex;flex-direction:column;gap:23px;flex:1;min-height:0;padding:27px 32px;">'
            f'{cabeca}{corpo}</div></div>')
