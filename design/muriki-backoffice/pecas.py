# As peças do backoffice: a base do Muriki Code (tokens, casca, ícones, botão, badge) mais o que
# um backoffice pede e o Code não tinha — rail de operação, campo chapado, switch, tabela de
# recurso, sheet e alert-dialog. A tabela de recurso é o molde do CRUD de todo o projeto.
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, '..', 'muriki-code'))
from base import (TOKENS, K, W, H, FONTE, MONO, LOGO, I, svg, ic, casca, badge, botao, cartao,
                  legenda, rotulo, botao_tema, icone_tema, mono, props_tema)  # noqa: E402,F401

# --field do tema do registry: card no claro, sunken no escuro
TOKENS['claro']['field'] = TOKENS['claro']['card']
TOKENS['escuro']['field'] = TOKENS['escuro']['sunken']
K['field'] = 'var(--field)'

I.update(
    casa=svg('<path d="M2.4 7.2L8 2.6l5.6 4.6"/><path d="M3.8 6.2v7.4h8.4V6.2"/><path d="M6.6 13.6V9.8h2.8v3.8"/>'),
    pessoas=svg('<circle cx="6" cy="5.6" r="2.4"/><path d="M1.8 13.4c.5-2.4 2.2-3.8 4.2-3.8s3.7 1.4 4.2 3.8"/><path d="M10.4 3.4a2.4 2.4 0 010 4.4"/><path d="M11.8 9.8c1.3.5 2.2 1.7 2.4 3.6"/>'),
    cupom=svg('<path d="M8.6 1.9h5.5v5.5l-6.6 6.6-5.5-5.5z"/><circle cx="11.2" cy="4.8" r="1"/>'),
    busca=svg('<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4l3.6 3.6"/>'),
    filtro=svg('<path d="M2 3.5h12"/><path d="M4.5 8h7"/><path d="M6.8 12.5h2.4"/>'),
    mais=svg('<path d="M8 3v10"/><path d="M3 8h10"/>'),
    pontos=svg('<circle cx="3.6" cy="8" r=".9"/><circle cx="8" cy="8" r=".9"/><circle cx="12.4" cy="8" r=".9"/>'),
    chave=svg('<circle cx="5.2" cy="10.8" r="3"/><path d="M7.4 8.6l6-6"/><path d="M11.4 4.6l1.8 1.8"/><path d="M9.8 6.2l1.4 1.4"/>'),
    escudo=svg('<path d="M8 1.8l5.2 2v4c0 3.2-2.2 5.4-5.2 6.4-3-1-5.2-3.2-5.2-6.4v-4z"/><path d="M5.8 8.2l1.6 1.6 3-3"/>'),
    bloqueio=svg('<circle cx="8" cy="8" r="6.2"/><path d="M3.6 3.6l8.8 8.8"/>'),
    baixar=svg('<path d="M8 2.5v8"/><path d="M4.5 7l3.5 3.5L11.5 7"/><path d="M2.5 13.5h11"/>'),
    calendario=svg('<rect x="2" y="3" width="12" height="11" rx="1.8"/><path d="M2 6.6h12"/><path d="M5.2 1.8v2.4M10.8 1.8v2.4"/>'),
    copiar=svg('<rect x="5.2" y="5.2" width="8.6" height="8.6" rx="1.6"/><path d="M10.8 5.2V3.8a1.6 1.6 0 00-1.6-1.6H3.8a1.6 1.6 0 00-1.6 1.6v5.4a1.6 1.6 0 001.6 1.6h1.4"/>'),
    ordenar=svg('<path d="M5 6l3-3 3 3"/><path d="M5 10l3 3 3-3"/>'),
    esquerda=svg('<path d="M9.6 4l-4 4 4 4"/>'),
    aviso=svg('<path d="M8 2.2l6.2 11H1.8z"/><path d="M8 6.6v3"/><path d="M8 11.6v.1"/>'),
    raio=svg('<path d="M9 1.8L3.5 9h4l-.5 5.2L12.5 7h-4z"/>'),
    grade=svg('<rect x="2" y="2" width="12" height="12" rx="1.6"/><path d="M2 6.2h12M2 10h12M6.4 2v12"/>'),
    painel=svg('<rect x="1.8" y="2.6" width="12.4" height="10.8" rx="1.8"/><path d="M5.8 2.6v10.8"/>'),
    lista=svg('<path d="M5.6 4h8.4M5.6 8h8.4M5.6 12h8.4"/><path d="M2.2 4h.1M2.2 8h.1M2.2 12h.1"/>'),
)

LANG = 'pt-BR'


def href(nome):
    # __SUF__ vira '' ou 'Escuro' na montagem: o Play leva ao quadro do mesmo tema
    return f'{nome}__SUF__.dc.html'


def raiz(k, estilo):
    return (f'<div class="mc {{{{temaClasse}}}}" lang="{LANG}" style="position:relative;width:{W}px;height:{H}px;overflow:hidden;'
            f'background:{k["bg"]};color:{k["fg"]};font-family:{FONTE};font-size:14px;line-height:20px;{estilo}">')


def logica(tema, antes='', valores=''):
    return ('renderVals() {\n'
            'const s = this.state || {};\n'
            'const escuroNoSistema = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;\n'
            f'const temaPedido = s.tema || this.props.tema || "{tema}";\n'
            'const tema = temaPedido === "sistema" ? (escuroNoSistema ? "escuro" : "claro") : temaPedido;\n'
            'const recolhido = s.recolhido == null ? this.props.sidebar === "recolhido" : s.recolhido;\n'
            f'{antes}\n'
            'return {\n'
            'temaClasse: tema === "escuro" ? "escuro" : "",\n'
            'temaRotulo: tema === "escuro" ? "Usar tema claro" : "Usar tema escuro",\n'
            'trocarTema: () => this.setState({ tema: tema === "escuro" ? "claro" : "escuro" }),\n'
            'railA: recolhido ? "none" : "flex",\nrailF: recolhido ? "flex" : "none",\n'
            'railRotulo: recolhido ? "Expandir menu" : "Recolher menu",\n'
            'alternarRail: () => this.setState({ recolhido: !recolhido }),\n'
            f'{valores}\n'
            '};\n}')


PROPS_RAIL = {'sidebar': {'editor': 'enum', 'options': ['expandido', 'recolhido'], 'default': 'expandido'}}


def pagina(titulo, corpo, tema, antes='', valores='', props=None):
    extra = PROPS_RAIL if 'railA' in corpo else {}
    return casca(titulo, corpo, logica(tema, antes, valores), {**props_tema(tema), **extra, **(props or {})})


# ── Rail ────────────────────────────────────────────────────────────────
MENU = [('inicio', 'Início', 'casa', 'Inicio'), ('clientes', 'Clientes', 'pessoas', 'Clientes'),
        ('planos', 'Planos', 'plano', 'Planos'), ('cupons', 'Cupons', 'cupom', 'Cupons')]


def avatar(iniciais, k, tom='blue', tam=28):
    a, b = {'blue': ('tblue', 'tbluefg'), 'green': ('tgreen', 'tgreenfg'), 'orange': ('torange', 'torangefg'),
            'yellow': ('tyellow', 'tyellowfg'), 'red': ('tred', 'tredfg'), 'gray': ('tgray', 'tgrayfg')}[tom]
    return (f'<span aria-hidden="true" style="width:{tam}px;height:{tam}px;flex:0 0 auto;border-radius:999px;background:{k[a]};color:{k[b]};'
            f'display:flex;align-items:center;justify-content:center;font-size:{11 if tam < 32 else 13}px;font-weight:600;">{iniciais}</span>')


def _botao_rail(k, tam=32):
    return (f'<button type="button" aria-label="{{{{railRotulo}}}}" title="{{{{railRotulo}}}} (⌘B)" onClick="{{{{alternarRail}}}}" '
            f'style="display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;flex:0 0 auto;border:0;'
            f'border-radius:8px;background:transparent;color:{k["mfg"]};cursor:pointer;">{ic("painel", 16)}</button>')


def rail(k, ativo):
    # o sidebar do DS: 13.75rem (220px) com rótulos, 3.5rem (56px) só ícone; ⌘B alterna
    def item(chave, nome, icone, destino, extra=''):
        at = chave == ativo
        f = f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at else f'color:{k["mfg"]};'
        b = (f'<span style="position:absolute;left:0;top:7px;bottom:7px;width:3px;border-radius:999px;background:{k["pri"]};"></span>'
             if at else '')
        cur = ' aria-current="page"' if at else ''
        return (f'<a href="{href(destino)}"{cur} style="position:relative;display:flex;align-items:center;gap:10px;height:36px;'
                f'padding:0 10px;border-radius:9px;font-size:13px;{f}">{b}{ic(icone)}<span style="flex:1;">{nome}</span>{extra}</a>')

    def item_icone(chave, nome, icone, destino):
        at = chave == ativo
        f = f'background:{k["prisub"]};color:{k["prisubfg"]};' if at else f'color:{k["mfg"]};'
        cur = ' aria-current="page"' if at else ''
        return (f'<a href="{href(destino)}" aria-label="{nome}" title="{nome}"{cur} style="display:flex;align-items:center;justify-content:center;'
                f'width:40px;height:40px;border-radius:10px;{f}">{ic(icone, 17)}</a>')

    conta = lambda n: f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{n}</span>'
    nav = ''.join(item(c, n, i, d, conta('1.284') if c == 'clientes' else '') for c, n, i, d in MENU)
    sair = (f'<a href="{href("Entrar")}" aria-label="Sair" title="Sair" style="display:flex;align-items:center;justify-content:center;'
            f'width:32px;height:32px;border-radius:8px;color:{k["mfg"]};">{ic("sair", 16)}</a>')
    sombra = 'box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);'
    aberto = (
        f'<nav aria-label="Muriki Backoffice" style="width:220px;flex:0 0 220px;background:{k["rail"]};display:{{{{railA}}}};flex-direction:column;{sombra}">'
        f'<div style="padding:12px 8px 6px;"><div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 4px 0 10px;">'
        f'<span style="display:flex;width:30px;height:30px;flex:0 0 auto;">{LOGO}</span>'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Muriki</span>'
        f'<span style="font-size:11px;color:{k["mfg"]};">Backoffice</span></span>{_botao_rail(k)}</div></div>'
        f'<div style="padding:4px 10px;display:flex;flex-direction:column;gap:2px;">'
        f'<div style="height:30px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;">{rotulo("Operação", k["mfg"])}'
        f'{badge("prod", k, "green", ponto=True, mono=True)}</div>{nav}</div>'
        f'<div style="flex:1;"></div>'
        f'<div style="padding:10px;display:flex;flex-direction:column;gap:2px;">'
        f'<div style="height:1px;background:{k["muted"]};margin:8px 4px;"></div>'
        f'<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 0 0 6px;">'
        f'{avatar("AL", k, "yellow")}'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Ana Lima</span>'
        f'<span style="font-size:11px;color:{k["mfg"]};">Administradora</span></span>'
        f'{botao_tema(k, 32)}{sair}</div></div></nav>')
    fechado = (
        f'<nav aria-label="Muriki Backoffice" style="width:56px;flex:0 0 56px;background:{k["rail"]};display:{{{{railF}}}};flex-direction:column;'
        f'align-items:center;gap:4px;padding:18px 0 12px;{sombra}">'
        f'<span style="display:flex;width:30px;height:30px;margin-bottom:6px;">{LOGO}</span>{_botao_rail(k, 36)}'
        f'<span style="width:24px;height:1px;background:{k["muted"]};margin:6px 0;"></span>'
        + ''.join(item_icone(c, n, i, d) for c, n, i, d in MENU)
        + f'<div style="flex:1;"></div>{botao_tema(k, 36)}{sair}'
        f'<span title="Ana Lima · Administradora" style="margin-top:6px;display:flex;">{avatar("AL", k, "yellow")}</span></nav>')
    return aberto + fechado


def app(k, ativo, conteudo, sobre='', pad='28px 40px 24px', gap=20):
    return (f'{raiz(k, "display:flex;")}{rail(k, ativo)}'
            f'<main style="flex:1;min-width:0;padding:{pad};display:flex;flex-direction:column;gap:{gap}px;">'
            f'{conteudo}</main>{sobre}</div>')


def cabecalho(k, titulo, sub='', direita='', trilha=None, contagem=''):
    t = ''
    if trilha:
        partes = [f'<a href="{href(d)}" style="color:{k["mfg"]};">{n}</a>' for n, d in trilha[:-1]]
        partes.append(f'<span style="color:{k["fg"]};">{trilha[-1][0]}</span>')
        sep = f'<span style="display:flex;color:{k["input"]};">{ic("direita", 12)}</span>'
        t = (f'<nav aria-label="Trilha" style="display:flex;gap:6px;align-items:center;font-size:12.5px;">'
             f'{sep.join(partes)}</nav>')
    c = (f'<span style="font-family:{MONO};font-size:14px;font-weight:400;color:{k["mfg"]};margin-left:10px;">{contagem}</span>'
         if contagem else '')
    s = f'<p style="margin:0;font-size:14px;color:{k["mfg"]};max-width:72ch;">{sub}</p>' if sub else ''
    return (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
            f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">{t}'
            f'<h1 style="margin:0;font-size:26px;line-height:32px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;'
            f'display:flex;align-items:baseline;">{titulo}{c}</h1>{s}</div>'
            f'<div style="display:flex;align-items:center;gap:8px;">{direita}</div></header>')


# ── Controles ───────────────────────────────────────────────────────────
def campo(k, rotulo_, valor='', ph='', dica='', icone=None, sufixo='', prefixo='', monoespaco=False, alt=36, erro='',
          id_=None, largura=None, extra_rotulo=''):
    i = id_ or rotulo_.lower().replace(' ', '-')
    ff = f'font-family:{MONO};font-size:13px;letter-spacing:0.02em;' if monoespaco else f'font-family:{FONTE};font-size:14px;'
    borda = k['bad'] if erro else k['input']
    esq = 30 if icone else (12 if not prefixo else 12 + 7.6 * len(prefixo) + 6)
    ico = (f'<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);display:flex;color:{k["mfg"]};">{ic(icone, 15)}</span>'
           if icone else '')
    pre = (f'<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:{k["mfg"]};">{prefixo}</span>'
           if prefixo else '')
    suf = (f'<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12.5px;color:{k["mfg"]};">{sufixo}</span>'
           if sufixo else '')
    v = f' value="{valor}"' if valor else ''
    rot = (f'<div style="display:flex;align-items:center;justify-content:space-between;">'
           f'<label for="{i}" style="font-size:13px;font-weight:500;color:{k["fgs"]};">{rotulo_}</label>{extra_rotulo}</div>'
           if rotulo_ else '')
    d = (f'<span style="font-size:12px;line-height:16px;color:{k["bad"] if erro else k["mfg"]};">{erro or dica}</span>'
         if (dica or erro) else '')
    w = f'width:{largura};' if largura else ''
    return (f'<div style="display:flex;flex-direction:column;gap:6px;min-width:0;{w}">{rot}'
            f'<div style="position:relative;display:flex;align-items:center;">{ico}{pre}'
            f'<input id="{i}"{v} placeholder="{ph}" style="width:100%;height:{alt}px;padding:0 {36 if sufixo else 12}px 0 {esq:g}px;'
            f'border:0;border-radius:{alt / 4:g}px;box-shadow:inset 0 0 0 1px {borda};background:{k["field"]};{ff}color:{k["fgs"]};outline:0;">'
            f'{suf}</div>{d}</div>')


def seletor(k, rotulo_, valor, dica='', alt=36, largura=None, antes=''):
    rot = f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{rotulo_}</span>' if rotulo_ else ''
    d = f'<span style="font-size:12px;line-height:16px;color:{k["mfg"]};">{dica}</span>' if dica else ''
    w = f'width:{largura};' if largura else ''
    return (f'<div style="display:flex;flex-direction:column;gap:6px;min-width:0;{w}">{rot}'
            f'<button type="button" aria-haspopup="listbox" style="display:flex;align-items:center;gap:8px;height:{alt}px;padding:0 10px 0 12px;'
            f'border:0;border-radius:{alt / 4:g}px;box-shadow:inset 0 0 0 1px {k["input"]};background:{k["field"]};'
            f'font-family:{FONTE};font-size:14px;color:{k["fgs"]};text-align:left;cursor:pointer;">{antes}'
            f'<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{valor}</span>{ic("baixo", 14, k["mfg"])}</button>{d}</div>')


def switch(k, ligado, rotulo_='', acao=None):
    trilho = k['pri'] if ligado else k['sunken']
    sombra = '' if ligado else 'box-shadow:inset 0 1px 2px rgba(0,0,0,0.10), inset 0 0 0 1px ' + k['input'] + ';'
    x = 16 if ligado else 2
    a = f' onClick="{{{{{acao}}}}}"' if acao else ''
    return (f'<button type="button" role="switch" aria-checked="{"true" if ligado else "false"}" aria-label="{rotulo_}"{a} '
            f'style="position:relative;width:34px;height:20px;flex:0 0 auto;border:0;border-radius:999px;background:{trilho};{sombra}padding:0;cursor:pointer;">'
            f'<span style="position:absolute;top:2px;left:{x}px;width:16px;height:16px;border-radius:999px;background:#fff;'
            f'box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span></button>')


def switch_dinamico(k, valor, rotulo_, acao):
    # o mesmo switch, com o estado vindo da lógica: {{valor.trilho}}, {{valor.x}}, {{valor.aria}}
    v = lambda c: '{{' + valor + '.' + c + '}}'
    return (f'<button type="button" role="switch" aria-checked="{v("aria")}" aria-label="{rotulo_}" onClick="{{{{{acao}}}}}" '
            f'style="position:relative;width:34px;height:20px;flex:0 0 auto;border:0;border-radius:999px;background:{v("trilho")};'
            f'box-shadow:{v("sombra")};padding:0;cursor:pointer;">'
            f'<span style="position:absolute;top:2px;left:{v("x")};width:16px;height:16px;border-radius:999px;background:#fff;'
            f'box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span></button>')


def caixa(k, marcado=False, rotulo_='', parcial=False):
    if marcado or parcial:
        dentro = ic('check', 12) if marcado else f'<span style="width:8px;height:1.6px;background:currentColor;border-radius:1px;"></span>'
        est = f'background:{k["pri"]};color:{k["prifg"]};'
    else:
        dentro, est = '', f'background:{k["field"]};box-shadow:inset 0 0 0 1px {k["input"]};'
    estado = 'mixed' if parcial else ('true' if marcado else 'false')
    return (f'<span role="checkbox" aria-checked="{estado}" aria-label="{rotulo_}" tabindex="0" style="display:flex;align-items:center;'
            f'justify-content:center;width:16px;height:16px;flex:0 0 auto;border-radius:4px;{est}">{dentro}</span>')


def radio(k, marcado, rotulo_, sub=''):
    bola = (f'<span style="width:16px;height:16px;flex:0 0 auto;border-radius:999px;background:{k["pri"]};display:flex;'
            f'align-items:center;justify-content:center;"><span style="width:6px;height:6px;border-radius:999px;background:{k["prifg"]};"></span></span>'
            if marcado else
            f'<span style="width:16px;height:16px;flex:0 0 auto;border-radius:999px;background:{k["field"]};box-shadow:inset 0 0 0 1px {k["input"]};"></span>')
    s = f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span>' if sub else ''
    return (f'<label role="radio" aria-checked="{"true" if marcado else "false"}" style="display:flex;align-items:flex-start;gap:10px;flex:1;'
            f'padding:10px 12px;border-radius:9px;box-shadow:inset 0 0 0 1px {k["pri"] if marcado else k["input"]};'
            f'background:{k["prisub"] if marcado else k["field"]};cursor:pointer;"><span style="margin-top:2px;display:flex;">{bola}</span>'
            f'<span style="display:flex;flex-direction:column;gap:1px;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{rotulo_}</span>{s}</span></label>')


def segmentado(k, opcoes, ativo, aria):
    # o view-toggle do DS: pill que corre dentro de um encaixe
    bs = ''
    for o in opcoes:
        at = o == ativo
        est = (f'background:{k["card"]};box-shadow:{k["sombra"]}, inset 0 0 0 1px {k["border"]};color:{k["fgs"]};font-weight:500;'
               if at else f'background:transparent;color:{k["mfg"]};')
        bs += (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="height:26px;padding:0 12px;border:0;'
               f'border-radius:6px;{est}font-family:{FONTE};font-size:12.5px;white-space:nowrap;cursor:pointer;">{o}</button>')
    return (f'<div role="tablist" aria-label="{aria}" style="display:inline-flex;gap:2px;padding:3px;border-radius:9px;'
            f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);">{bs}</div>')


def botao_icone(k, icone, rotulo_, href_=None, tam=28, cor=None, destrutivo=False):
    c = k['bad'] if destrutivo else (cor or k['mfg'])
    est = (f'display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;border:0;border-radius:{tam / 4:g}px;'
           f'background:transparent;color:{c};cursor:pointer;')
    if href_:
        return f'<a href="{href_}" aria-label="{rotulo_}" title="{rotulo_}" style="{est}">{ic(icone, 15)}</a>'
    return f'<button type="button" aria-label="{rotulo_}" title="{rotulo_}" style="{est}">{ic(icone, 15)}</button>'


def link_botao(k, txt, href_, var='outline', alt=32, icone=None, largura=None, icone_depois=None):
    raio = alt / 4
    est = {
        'outline': f'background:{k["card"]};color:{k["fgs"]};box-shadow:inset 0 0 0 1px {k["input"]};',
        'primary': f'background:{k["prisub"]};color:{k["prisubfg"]};',
        'solid': f'background:{k["pri"]};color:{k["prifg"]};',
        'ghost': f'background:transparent;color:{k["mfg"]};',
        'destrutivo': f'background:{k["bad"]};color:#fff;',
    }[var]
    w = f'width:{largura};' if largura else ''
    g = ic(icone, 15) if icone else ''
    g2 = ic(icone_depois, 14) if icone_depois else ''
    return (f'<a href="{href_}" style="display:inline-flex;align-items:center;justify-content:center;gap:7px;height:{alt}px;{w}'
            f'padding:0 {14 if alt >= 36 else 12}px;border-radius:{raio:g}px;{est}font-size:{14 if alt >= 36 else 13}px;font-weight:500;'
            f'white-space:nowrap;">{g}{txt}{g2}</a>')


# ── Tabela de recurso: o molde do CRUD ─────────────────────────────────
# Uma tela de recurso é sempre: cabeçalho com contagem e UMA ação sólida (criar), barra de
# busca + abas de status com contagem + filtros, tabela com seleção e row-actions no hover,
# e rodapé com paginação. Criar e editar abrem o mesmo sheet; o que apaga ou tira acesso
# passa por alert-dialog. Clientes, planos e cupons são a mesma peça com colunas diferentes.
def barra_recurso(k, busca_ph, abas, ativa, filtros=''):
    bs = ''
    for nome, n in abas:
        at = nome == ativa
        est = f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};'
        bs += (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:6px;'
               f'height:36px;padding:0 2px;border:0;background:transparent;{est}font-family:{FONTE};font-size:13px;cursor:pointer;">{nome}'
               f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{n}</span></button>')
    abas_html = f'<div role="tablist" aria-label="Status" style="display:flex;gap:20px;">{bs}</div>'
    return (f'<div style="display:flex;flex-direction:column;gap:12px;">'
            f'<div style="display:flex;align-items:center;gap:8px;">'
            f'{campo(k, "", ph=busca_ph, icone="busca", alt=32, id_="busca", largura="320px")}{filtros}'
            f'<span style="flex:1;"></span>{link_botao(k, "Exportar CSV", "#", "ghost", 32, "baixar")}</div>'
            f'<div style="display:flex;box-shadow:inset 0 -1px 0 {k["muted"]};">{abas_html}</div></div>')


def filtro_chip(k, rot, valor=None):
    v = (f'<span style="color:{k["fgs"]};font-weight:500;">{valor}</span>' if valor
         else '')
    borda = f'box-shadow:inset 0 0 0 1px {k["input"]};' if valor else f'box-shadow:inset 0 0 0 1px {k["input"]};border-style:dashed;'
    return (f'<button type="button" style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;border:0;'
            f'border-radius:8px;{borda}background:{k["field"] if valor else "transparent"};font-family:{FONTE};font-size:13px;color:{k["mfg"]};cursor:pointer;">'
            f'{ic("filtro", 14) if not valor else ""}{rot}{": " if valor else ""}{v}{ic("baixo", 13) if valor else ""}</button>')


def tabela(k, colunas, cab, linhas, rodape=''):
    # colunas: grid-template; cab: lista de (rótulo, alinhamento, ordenável); linhas: html de células
    cabs = ''
    for rot, al, ordena in cab:
        o = f'<span style="display:flex;opacity:0.7;">{ic("ordenar", 11)}</span>' if ordena else ''
        j = 'flex-end' if al == 'dir' else 'flex-start'
        cabs += (f'<span role="columnheader" style="display:flex;align-items:center;gap:4px;justify-content:{j};'
                 f'font-size:12px;font-weight:500;color:{k["mfg"]};">{rot}{o}</span>')
    return (f'<section role="table" style="flex:1;min-height:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'display:flex;flex-direction:column;overflow:hidden;">'
            f'<div role="row" style="display:grid;grid-template-columns:{colunas};gap:16px;align-items:center;height:38px;padding:0 16px;'
            f'background:{k["rail"]};box-shadow:inset 0 -1px 0 {k["muted"]};">{cabs}</div>'
            f'<div style="flex:1;min-height:0;overflow:hidden;">{linhas}</div>{rodape}</section>')


def linha_tabela(k, colunas, celulas, hover=False, selecionada=False, altura=52):
    fundo = f'background:{k["prisub"]};' if selecionada else (f'background:{k["muted"]};' if hover else '')
    return (f'<div role="row" style="display:grid;grid-template-columns:{colunas};gap:16px;align-items:center;min-height:{altura}px;'
            f'padding:0 16px;box-shadow:inset 0 -1px 0 {k["muted"]};{fundo}">{"".join(celulas)}</div>')


def acoes_linha(k, visiveis, itens):
    # o row-actions do DS: só ícone, aparece no hover ou no foco; tooltip e aria-label obrigatórios
    if not visiveis:
        return '<span></span>'
    bs = ''.join(botao_icone(k, i, r, h, destrutivo=d) for i, r, h, d in itens)
    return (f'<span role="toolbar" aria-label="Ações da linha" style="display:flex;justify-content:flex-end;gap:2px;">'
            f'<span style="display:flex;gap:2px;padding:2px;border-radius:9px;background:{k["card"]};box-shadow:{k["sombra"]}, inset 0 0 0 1px {k["border"]};">{bs}</span></span>')


def paginacao(k, pagina_=1, tem_proxima=True):
    # a API pagina por cursor: sem total e sem pular página — só anterior, próxima e o tamanho
    ant = 'opacity:0.4;' if pagina_ <= 1 else ''
    prox = '' if tem_proxima else 'opacity:0.4;'
    seta = lambda icone, rot, est: (f'<button type="button" aria-label="{rot}" style="display:inline-flex;align-items:center;gap:6px;height:28px;'
                                    f'padding:0 10px;border:0;border-radius:7px;background:transparent;font-family:{FONTE};font-size:12.5px;color:{k["fg"]};{est}">'
                                    f'{icone}</button>')
    return (f'<footer style="display:flex;align-items:center;gap:12px;height:48px;padding:0 16px;box-shadow:inset 0 1px 0 {k["muted"]};">'
            f'<span style="font-size:12.5px;color:{k["mfg"]};">Página {pagina_}</span><span style="flex:1;"></span>'
            f'<span style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:{k["mfg"]};">Por página '
            f'{seletor(k, "", "50", alt=28, largura="64px")}</span>'
            f'<span style="display:flex;align-items:center;gap:2px;">'
            f'{seta(ic("esquerda", 14) + "Anterior", "Página anterior", ant)}{seta("Próxima" + ic("direita", 14), "Próxima página", prox)}</span></footer>')


def selo_status(k, status):
    tom = {'Ativo': 'green', 'Em teste': 'blue', 'Inadimplente': 'orange', 'Revogado': 'red',
           'Rascunho': 'gray', 'Arquivado': 'gray', 'Pausado': 'yellow', 'Expirado': 'gray', 'Esgotado': 'gray'}[status]
    return f'<span style="display:flex;">{badge(status, k, tom, ponto=True)}</span>'


# ── Superfícies por cima: sheet e alert-dialog ─────────────────────────
def veu(k):
    return f'<div aria-hidden="true" style="position:absolute;inset:0;background:{k["veu"]};"></div>'


def sheet(k, titulo, sub, corpo, rodape, largura=520):
    # anatomia estruturada: título em faixa, seções com filete, rodapé preso; o corpo rola sozinho
    return (f'{veu(k)}<aside role="dialog" aria-modal="true" aria-label="{titulo}" style="position:absolute;top:8px;right:8px;bottom:8px;'
            f'width:{largura}px;background:{k["card"]};border-radius:12px;box-shadow:{k["sombraFlut"]}, inset 0 0 0 1px {k["border"]};'
            f'display:flex;flex-direction:column;overflow:hidden;">'
            f'<header style="display:flex;align-items:flex-start;gap:12px;padding:18px 20px 16px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<div style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">'
            f'<h2 style="margin:0;font-size:16px;line-height:22px;font-weight:600;color:{k["fgs"]};">{titulo}</h2>'
            f'<p style="margin:0;font-size:13px;color:{k["mfg"]};">{sub}</p></div>'
            f'{botao_icone(k, "x", "Fechar", href_="#", tam=30)}</header>'
            f'<div style="flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;">{corpo}</div>'
            f'<footer style="display:flex;align-items:center;gap:8px;padding:14px 20px;box-shadow:inset 0 1px 0 {k["muted"]};">{rodape}</footer></aside>')


def secao_sheet(k, titulo, corpo, sub=''):
    s = f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span>' if sub else ''
    return (f'<section style="display:flex;flex-direction:column;gap:14px;padding:18px 20px 20px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<div style="display:flex;flex-direction:column;gap:2px;">{rotulo(titulo, k["mfg"], 10)}{s}</div>{corpo}</section>')


def alerta(k, titulo, texto, corpo, rodape, icone='aviso'):
    return (f'{veu(k)}<div role="alertdialog" aria-modal="true" aria-label="{titulo}" style="position:absolute;left:50%;top:50%;'
            f'transform:translate(-50%,-50%);width:460px;background:{k["card"]};border-radius:12px;'
            f'box-shadow:{k["sombraFlut"]}, inset 0 0 0 1px {k["border"]};padding:22px 22px 18px;display:flex;flex-direction:column;gap:16px;">'
            f'<div style="display:flex;gap:14px;align-items:flex-start;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex:0 0 auto;border-radius:10px;'
            f'background:{k["tred"]};color:{k["tredfg"]};">{ic(icone, 18)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<h2 style="margin:0;font-size:16px;line-height:22px;font-weight:600;color:{k["fgs"]};">{titulo}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{texto}</p></div></div>'
            f'{corpo}<div style="display:flex;justify-content:flex-end;gap:8px;">{rodape}</div></div>')


def brl(v, centavos=True):
    s = f'{v:,.2f}' if centavos else f'{v:,.0f}'
    return 'R$ ' + s.replace(',', 'X').replace('.', ',').replace('X', '.')


def milhar(n):
    return f'{n:,}'.replace(',', '.')
