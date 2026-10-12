# As peças do Muriki Platform: a base do Muriki Code (tokens, casca, lógica de idioma e tema,
# ícones, topo) mais o que as telas do Platform pedem. Os campos seguem os do registry: o
# InputGroup no tamanho touch (44px), com o afixo dentro do mesmo filete, e a frase do estado
# embaixo, ligada ao campo.
import os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
# no fim do caminho, não no começo: textos.py e telas.py daqui têm o mesmo nome que os do Code
sys.path.append(os.path.join(AQUI, '..', 'muriki-code'))
from base import (TOKENS, K, W, H, FONTE, MONO, I, svg, ic, casca, logica, props_tema, PROPS_IDIOMA, T, raiz,  # noqa: E402,F401
                  topo, rotulo)

from textos import COMUM, juntar  # noqa: E402

# --field do tema do registry: card no claro, sunken no escuro
TOKENS['claro']['field'] = TOKENS['claro']['card']
TOKENS['escuro']['field'] = TOKENS['escuro']['sunken']
K['field'] = 'var(--field)'
# as linhas de esqueleto do rail na prévia: sunken no claro; no escuro o rail é quase o sunken e elas
# sobem para o muted (o `bg-sunken dark:bg-muted` da WorkspacePreview)
TOKENS['claro']['railLinha'] = TOKENS['claro']['sunken']
TOKENS['escuro']['railLinha'] = TOKENS['escuro']['muted']
K['railLinha'] = 'var(--railLinha)'
# os tons do Badge que a base do Code não traz, para o avatar do workspace (os --tone-* do muriki.css)
for tom, claro, claro_fg, escuro, escuro_fg in [
    ('cyan', 'oklch(0.935 0.045 205)', 'oklch(0.42 0.09 205)', 'oklch(0.29 0.05 205)', 'oklch(0.85 0.065 205)'),
    ('pink', 'oklch(0.935 0.04 350)', 'oklch(0.43 0.15 350)', 'oklch(0.29 0.055 350)', 'oklch(0.85 0.075 350)'),
    ('purple', 'oklch(0.935 0.045 300)', 'oklch(0.43 0.15 300)', 'oklch(0.29 0.055 300)', 'oklch(0.85 0.075 300)'),
]:
    TOKENS['claro'][f't{tom}'], TOKENS['claro'][f't{tom}fg'] = claro, claro_fg
    TOKENS['escuro'][f't{tom}'], TOKENS['escuro'][f't{tom}fg'] = escuro, escuro_fg
    K[f't{tom}'], K[f't{tom}fg'] = f'var(--t{tom})', f'var(--t{tom}fg)'

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
# O OnboardingStep do registry: o topo com a marca, idioma e tema; o cabeçalho de passo (rótulo
# mono, barra e título de display) e o conteúdo numa coluna de 672px.
def cabecalho_passo(k, n, total, titulo, sub):
    passos = ''.join(f'<span style="height:4px;flex:1;border-radius:2px;background:{k["pri"] if i < n else k["sunken"]};"></span>'
                     for i in range(total))
    legenda_ = f'{T("passoRotulo")} · {n} {T("de")} {total}'
    return (f'<header style="display:flex;flex-direction:column;gap:16px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;width:100%;">{rotulo(legenda_, k["mfg"])}'
            f'<div role="progressbar" aria-valuemin="1" aria-valuemax="{total}" aria-valuenow="{n}" '
            f'aria-label="{T("passosAria")} {n} {T("de")} {total}" style="display:flex;gap:6px;width:100%;">{passos}</div></div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;">'
            f'<h1 style="margin:0;font-size:52px;line-height:1.02;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{titulo}</h1>'
            f'<p style="margin:0;max-width:65ch;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p></div></header>')


def pagina_passo(k, corpo, largura=720):
    # 672px de conteúdo + 24px de cada lado: o max-w-2xl do OnboardingStep `form`; 1024 é o max-w-5xl
    # (o `wide`, que o passo de identidade abre a partir do lg)
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, PRODUTO, EMAIL)}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;gap:36px;width:{largura}px;align-self:center;'
            f'padding:32px 24px 40px;">{corpo}</main></div>')


def legenda_grupo(k, texto):
    return (f'<legend style="margin:0 0 12px;padding:0;font-family:{MONO};font-size:10px;letter-spacing:0.25em;'
            f'text-transform:uppercase;color:{k["mfg"]};">{texto}</legend>')


def grupo(k, legenda, filhos):
    return (f'<fieldset style="margin:0;padding:0;border:0;display:flex;flex-direction:column;gap:20px;">'
            f'{legenda_grupo(k, legenda)}{filhos}</fieldset>')


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


# ── A prévia ao vivo (WorkspacePreview) ─────────────────────────────────
# O app do Platform em miniatura: a barra de endereço, o rail com o avatar e o nome do workspace e
# linhas de esqueleto sem nome, o palco com a saudação e blocos de esqueleto. Decorativa.
TONS = ['blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']


def tom_workspace(nome):
    # o workspaceTone de handles.ts: hash dos code points do nome aparado, em minúsculas
    n = nome.strip().lower()
    if not n:
        return None
    h = 0
    for c in n:
        h = (h * 31 + ord(c)) % 2**32
    return TONS[h % len(TONS)]


def sigla_workspace(nome):
    # o workspaceInitials: a primeira letra das duas primeiras palavras
    palavras = [p for p in nome.split() if p[0].isalnum()]
    return ''.join(p[0] for p in palavras[:2]).upper()


def _barra(k, largura, alt=8, cor=None, raio=999):
    return f'<span style="display:block;height:{alt}px;width:{largura};border-radius:{raio}px;background:{cor or k["sunken"]};"></span>'


def previa_workspace(k, nome, slug, usuario, ph_nome, ph_slug, ola, ola_so):
    tom = tom_workspace(nome)
    avatar = (f'<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;'
              + (f'border-radius:8px;background:{k["t" + tom]};color:{k["t" + tom + "fg"]};font-size:11.5px;font-weight:600;">'
                 f'{esc(sigla_workspace(nome))}</span>' if tom else
                 f'border-radius:8px;border:1px dashed {k["input"]};"></span>'))
    nome_ = (f'<span style="font-size:13px;font-weight:600;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{esc(nome)}</span>'
             if nome else f'<span style="font-size:13px;font-weight:500;color:{k["mfg"]};opacity:0.6;">{ph_nome}</span>')
    slug_ = (f'<span style="color:{k["fgs"]};">{esc(slug)}</span>' if slug
             else f'<span style="color:{k["mfg"]};opacity:0.6;">{ph_slug}</span>')
    pontos = ''.join(f'<span style="width:10px;height:10px;border-radius:50%;background:{k["sunken"]};"></span>' for _ in range(3))
    barra_janela = (f'<div style="display:flex;align-items:center;gap:12px;height:40px;padding:0 14px;'
                    f'border-bottom:1px solid color-mix(in oklab, {k["fg"]} 7%, transparent);">'
                    f'<div style="display:flex;gap:6px;width:48px;flex:0 0 auto;">{pontos}</div>'
                    f'<div style="margin:0 auto;display:flex;align-items:center;height:24px;padding:0 12px;border-radius:8px;'
                    f'background:{k["sunken"]};font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;">'
                    f'platform.muriki.app/{slug_}</div><div style="width:48px;flex:0 0 auto;"></div></div>')
    linhas = ''.join(f'<div style="display:flex;align-items:center;gap:10px;">'
                     f'<span style="width:14px;height:14px;border-radius:4px;background:{k["railLinha"]};flex:0 0 auto;"></span>'
                     f'{_barra(k, w, cor=k["railLinha"])}</div>' for w in ('62%', '48%', '70%', '40%'))
    rail_ = (f'<div style="display:flex;flex-direction:column;gap:20px;width:38%;flex:0 0 auto;padding:14px 12px;background:{k["rail"]};'
             f'box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">'
             f'<div style="display:flex;align-items:center;gap:10px;min-width:0;">{avatar}{nome_}</div>'
             f'<div style="display:flex;flex-direction:column;gap:14px;padding:0 4px;">{linhas}</div></div>')
    saudacao = f'{ola} @{esc(usuario)}' if usuario else ola_so
    cartao_ = lambda filhos, extra='': (f'<div style="display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:10px;'
                                        f'background:{k["card"]};box-shadow:{k["sombra"]};{extra}">{filhos}</div>')
    palco = (f'<div style="display:flex;flex-direction:column;gap:16px;flex:1;min-width:0;padding:20px;background:{k["bg"]};">'
             f'<p style="margin:0;font-size:17px;line-height:24px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};'
             f'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{saudacao}</p>'
             f'<div style="margin-top:-4px;">{_barra(k, "40%")}</div>'
             f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
             + cartao_(_barra(k, '60%') + _barra(k, '40%', 20, raio=6)) * 2 + '</div>'
             + cartao_(_barra(k, '72%') + _barra(k, '54%') + _barra(k, '64%'), 'flex:1;gap:12px;')
             + '</div>')
    return (f'<div aria-hidden="true" style="overflow:hidden;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombraFlut"]}, 0 0 0 1px color-mix(in oklab, {k["fg"]} 8%, transparent);pointer-events:none;user-select:none;">'
            f'{barra_janela}<div style="display:flex;height:352px;">{rail_}{palco}</div></div>')
