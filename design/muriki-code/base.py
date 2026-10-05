import json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
TOKENS = json.load(open(os.path.join(AQUI, '..', 'home-focus', 'tokens.json')))
TOKENS['claro']['logo'] = 'rgb(36,36,33)'
TOKENS['escuro']['logo'] = '#E7E6E3'
# amarelo da marca (o --accent do tema do registry) e o véu do guia de primeira vez
TOKENS['claro']['accent'] = 'oklch(0.878 0.18 93.9)'
TOKENS['escuro']['accent'] = 'oklch(0.83 0.165 93)'
TOKENS['claro']['veu'] = 'rgba(20,24,30,0.46)'
TOKENS['escuro']['veu'] = 'rgba(0,0,0,0.62)'
assert set(TOKENS['claro']) == set(TOKENS['escuro'])
K = {nome: f'var(--{nome})' for nome in TOKENS['claro']}

FONTE = "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
W, H = 1440, 900


def _logo(nome='aberto'):
    # o logo da marca: vetorizado dos PNGs de public/assets (design/logo-aberto.svg e
    # logo-fechado.svg, os mesmos do muriki-logo do registry). As cores não mudam com o tema.
    svg = open(os.path.join(AQUI, '..', f'logo-{nome}.svg')).read()
    return svg.replace('<svg ', '<svg width="100%" height="100%" aria-hidden="true" ', 1).strip()


LOGO = _logo()
LOGO_FECHADO = _logo('fechado')


def T(chave):
    return '{{t.' + chave + '}}'


def _vars(d):
    return ''.join(f'--{n}:{v};' for n, v in d.items())


# o flyout do app-shell recolhido (os dois canvas): o grupo é o gatilho (mouse ou foco), e o cartão do popover
# (--float, raio de recipiente) abre à direita com o rótulo e os itens clicáveis; o rail não se mexe
CSS_FLYOUT = (
    '.mc nav:has(.grupo){position:relative;z-index:20;}'
    '.mc .grupo{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;}'
    '.mc .flyout{position:absolute;left:calc(100% + 12px);top:0;z-index:50;width:224px;padding:6px;border-radius:14px;'
    'background:var(--card);box-shadow:var(--sombraFlut),inset 0 0 0 1px var(--border);display:flex;flex-direction:column;gap:2px;'
    'opacity:0;visibility:hidden;transform:scale(0.95);transform-origin:left top;'
    'transition:opacity 100ms ease-out,transform 100ms ease-out,visibility 0s linear 100ms;}'
    '.mc .flyout::before{content:"";position:absolute;right:100%;top:0;bottom:0;width:14px;}'
    '.mc .grupo:is(:hover,:focus-within)>.flyout{opacity:1;visibility:visible;transform:none;transition-delay:90ms,90ms,0s;}'
    '@media (prefers-reduced-motion: reduce){.mc .flyout{transition:none;}}'
)

def casca(titulo, corpo, logica, props, css=''):
    if 'class="grupo"' in corpo:
        css += CSS_FLYOUT
    dados = dict(props)
    dados['$preview'] = dict(width=W, height=H)
    dados = json.dumps(dados, ensure_ascii=False, separators=(',', ':')).replace('&', '&amp;').replace("'", '&#39;')
    c, e = TOKENS['claro'], TOKENS['escuro']
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{titulo}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500&amp;display=swap">
<style>
body{{margin:0;background:{c["bg"]};font-family:{FONTE};}}
body:has(.mc.escuro){{background:{e["bg"]};}}
*{{box-sizing:border-box;}}
.mc{{color-scheme:light;{_vars(c)}}}
.mc.escuro{{color-scheme:dark;{_vars(e)}}}
.mc a{{color:var(--pri);text-decoration:none;}}
.mc a:hover{{color:var(--prisubfg);}}
.mc nav a svg,.mc [data-motion]{{transition:transform 180ms cubic-bezier(0.16,1,0.3,1);}}
.mc nav a:hover svg{{transform:translateY(-1px) scale(1.06);}}
.mc nav a:active svg{{transform:scale(0.92);transition-duration:80ms;}}
.mc :is(a,button):hover [data-motion="turn"]{{transform:rotate(60deg);}}
.mc :is(a,button):hover [data-motion="swing"]{{transform:rotate(-14deg);}}
.mc :is(a,button):hover [data-motion="nudge"]{{transform:translateX(2px);}}
@media (prefers-reduced-motion: reduce){{.mc nav a svg,.mc [data-motion]{{transition:none;transform:none !important;}}}}{css}
.mc.escuro .so-claro,.mc:not(.escuro) .so-escuro{{display:none !important;}}
</style>
</helmet>
{corpo}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{dados}'>
class Component extends DCLogic {{
{logica}
}}
</script>
</body>
</html>
'''


_LOGICA = '''renderVals() {
const s = this.state || {};
const escuroNoSistema = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const temaPedido = s.tema || this.props.tema || "__TEMA__";
const tema = temaPedido === "sistema" ? (escuroNoSistema ? "escuro" : "claro") : temaPedido;
const TEXTOS = __TEXTOS__;
const ORDEM = ["pt-BR", "en-US", "es-ES"];
const nav = ((typeof navigator !== "undefined" && ((navigator.languages && navigator.languages[0]) || navigator.language)) || "").toLowerCase();
const doNavegador = nav.indexOf("pt") === 0 ? "pt-BR" : nav.indexOf("es") === 0 ? "es-ES" : "en-US";
const pedido = s.idioma || this.props.idioma || "navegador";
const idioma = TEXTOS[pedido] ? pedido : doNavegador;
const t = TEXTOS[idioma];
__ANTES__
return {
t: t,
temaClasse: tema === "escuro" ? "escuro" : "",
temaRotulo: tema === "escuro" ? t.paraClaro : t.paraEscuro,
trocarTema: () => this.setState({ tema: tema === "escuro" ? "claro" : "escuro" }),
menuIdioma: !!s.menuIdioma,
abrirIdioma: () => this.setState({ menuIdioma: !s.menuIdioma }),
idiomas: ORDEM.map((l) => ({ lang: l, nome: TEXTOS[l].idiomaNome, atual: l === idioma, escolher: () => this.setState({ idioma: l, menuIdioma: false }) })),
__VALORES__
};
}'''


def logica(textos, tema, antes='', valores=''):
    js = json.dumps(textos, ensure_ascii=False).replace('</', '<\\/')
    return (_LOGICA.replace('__TEMA__', tema).replace('__TEXTOS__', js)
            .replace('__ANTES__', antes).replace('__VALORES__', valores))


def logica_so_tema(tema):
    return ('renderVals() {\n'
            'const s = this.state || {};\n'
            'const escuroNoSistema = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;\n'
            f'const temaPedido = s.tema || this.props.tema || "{tema}";\n'
            'const tema = temaPedido === "sistema" ? (escuroNoSistema ? "escuro" : "claro") : temaPedido;\n'
            'return { temaClasse: tema === "escuro" ? "escuro" : "" };\n'
            '}')


def props_tema(tema):
    return {'tema': {'editor': 'enum', 'options': ['sistema', 'claro', 'escuro'], 'default': tema}}


PROPS_IDIOMA = {'idioma': {'editor': 'enum', 'options': ['navegador', 'pt-BR', 'en-US', 'es-ES'], 'default': 'navegador'}}


def svg(d, extra=''):
    return (f'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" '
            f'stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true">{d}{extra}</svg>')


I = dict(
    evolucao=svg('<path d="M2 12l4-4 3 3 5-6"/><path d="M10.5 5H14v3.5"/>'),
    # trilha é o mapa (MapTrifoldIcon no app); exercício é o alvo (TargetIcon), para não somar mais
    # um ícone de código ao lado do terminal do Playground
    trilhas=svg('<path d="M2 3.8l3.9-1.3 4.2 1.4 3.9-1.3v9.6l-3.9 1.3-4.2-1.4L2 13.4z"/><path d="M5.9 2.5v9.6"/><path d="M10.1 3.9v9.6"/>'),
    exercicios=svg('<circle cx="7.6" cy="8.4" r="5.6"/><circle cx="7.6" cy="8.4" r="2.8"/><path d="M7.6 8.4l5.6-5.6"/><path d="M11.1 2.8h2.1v2.1"/>'),
    avaliacoes=svg('<circle cx="8" cy="6.8" r="4.4"/><path d="M6.1 6.8l1.3 1.3 2.5-2.5"/><path d="M5.7 10.6l-.9 3.4L8 12.8l3.2 1.2-.9-3.4"/>'),
    peer=svg('<path d="M2.4 7.6a5.5 5.5 0 119.9 3.3l.9 2.6-2.8-.8A5.5 5.5 0 012.4 7.6z"/>'),
    plano=svg('<rect x="1.8" y="3.5" width="12.4" height="9" rx="1.8"/><path d="M1.8 6.6h12.4"/><path d="M4.4 10h2.6"/>'),
    laptop=svg('<rect x="3" y="3.4" width="10" height="7" rx="1.2"/><path d="M1.5 12.6h13"/>'),
    cadeado=svg('<rect x="3" y="7" width="10" height="7" rx="1.6"/><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2"/>'),
    check=svg('<path d="M3 8.5l3 3 7-7"/>'),
    brilho=svg('<path d="M8 2l1.4 4.6L14 8l-4.6 1.4L8 14l-1.4-4.6L2 8l4.6-1.4z"/>'),
    x=svg('<path d="M4.5 4.5l7 7"/><path d="M11.5 4.5l-7 7"/>'),
    baixo=svg('<path d="M4 6l4 4 4-4"/>'),
    troca=svg('<path d="M3 5.5h9.5L10 3"/><path d="M13 10.5H3.5L6 13"/>'),
    arquivo=svg('<path d="M9 1.8H4v12.4h8V4.8L9 1.8z"/><path d="M9 1.8v3h3"/>'),
    pasta=svg('<path d="M1.8 4.2h4l1.5 1.5h6.9v7.3H1.8z"/>'),
    rodar=svg('<path d="M5 3.5l7 4.5-7 4.5z"/>'),
    dica=svg('<path d="M6 12.4h4"/><path d="M6.6 14.4h2.8"/><path d="M8 1.8a4.2 4.2 0 00-2.5 7.6c.6.5.9 1 .9 1.6h3.2c0-.6.3-1.1.9-1.6A4.2 4.2 0 008 1.8z"/>'),
    enviar=svg('<path d="M8 13V3.5"/><path d="M4 7l4-4 4 4"/>'),
    seta=svg('<path d="M3 8h10"/><path d="M9 4l4 4-4 4"/>'),
    sair=svg('<path d="M6 2.5H3.5v11H6"/><path d="M10 5l3 3-3 3"/><path d="M13 8H6.5"/>'),
    olho=svg('<path d="M1.6 8s2.4-4.6 6.4-4.6S14.4 8 14.4 8s-2.4 4.6-6.4 4.6S1.6 8 1.6 8z"/><circle cx="8" cy="8" r="1.9"/>'),
    relogio=svg('<circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.3 1.4"/>'),
    alvo=svg('<circle cx="8" cy="8" r="6.2"/><circle cx="8" cy="8" r="3.2"/><circle cx="8" cy="8" r=".6"/>'),
    arquivo_mais=svg('<path d="M9 1.8H4v12.4h8V4.8L9 1.8z"/><path d="M9 1.8v3h3"/><path d="M8 7.4v4.2M5.9 9.5h4.2"/>'),
    pasta_mais=svg('<path d="M1.8 4.2h4l1.5 1.5h6.9v7.3H1.8z"/><path d="M8 7.6v3.6M6.2 9.4h3.6"/>'),
    recolher=svg('<path d="M4.5 6.5L8 3l3.5 3.5"/><path d="M4.5 13L8 9.5l3.5 3.5"/>'),
    lapis=svg('<path d="M10.6 2.6l2.8 2.8-7.6 7.6-3.6.8.8-3.6 7.6-7.6z"/>'),
    lixeira=svg('<path d="M2.8 4.4h10.4"/><path d="M6.2 4.4V2.8h3.6v1.6"/><path d="M4.2 4.4l.7 9h6.2l.7-9"/>'),
    direita=svg('<path d="M6.4 4l4 4-4 4"/>'),
    globo=svg('<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4"/><path d="M8 1.8c1.8 1.8 2.6 3.9 2.6 6.2S9.8 12.4 8 14.2C6.2 12.4 5.4 10.3 5.4 8S6.2 3.6 8 1.8z"/>'),
    lua=svg('<path d="M13.3 9.7A5.6 5.6 0 016.3 2.7a5.6 5.6 0 107 7z"/>'),
    sol=svg('<circle cx="8" cy="8" r="2.8"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/>'),
    envelope=svg('<rect x="1.8" y="3.4" width="12.4" height="9.2" rx="1.6"/><path d="M2.4 4.4L8 8.8l5.6-4.4"/>'),
    recarregar=svg('<path d="M13.2 7.4A5.2 5.2 0 1 0 12 11.2"/><path d="M13.4 3.6v3.8H9.6"/>'),
    aviso=svg('<path d="M8 2.4L14 13H2z"/><path d="M8 6.6v3"/><path d="M8 11.4v.2"/>'),
    semrede=svg('<path d="M1.6 5.8a9.4 9.4 0 0 1 4-2.2"/><path d="M9.4 3.4a9.4 9.4 0 0 1 5 2.4"/><path d="M4 8.4a6 6 0 0 1 2.4-1.4"/><path d="M10.6 7.4a6 6 0 0 1 1.4 1"/><path d="M6.4 10.8a2.4 2.4 0 0 1 3.2 0"/><path d="M8 13.2v.1"/><path d="M2.4 2.4l11.2 11.2"/>'),
    bussola=svg('<circle cx="8" cy="8" r="6.2"/><path d="M10.6 5.4L9.2 9.2 5.4 10.6 6.8 6.8z"/>'),
    casa=svg('<path d="M2.4 7.2L8 2.6l5.6 4.6"/><path d="M3.8 6.2v7.4h8.4V6.2"/><path d="M6.6 13.6V9.8h2.8v3.8"/>'),
    pessoa=svg('<circle cx="8" cy="5.4" r="2.8"/><path d="M2.8 14c.6-2.8 2.7-4.4 5.2-4.4s4.6 1.6 5.2 4.4"/>'),
    olho_fechado=svg('<path d="M1.6 8s2.4-4.6 6.4-4.6S14.4 8 14.4 8s-2.4 4.6-6.4 4.6S1.6 8 1.6 8z"/><circle cx="8" cy="8" r="1.9"/><path d="M2.6 2.6l10.8 10.8"/>'),
    circulo=svg('<circle cx="8" cy="8" r="4.4"/>'),
    google=svg('<path d="M11.96 4.04A5.6 5.6 0 1 0 13.6 8H8.4"/>'),
    digital=svg('<path d="M3.2 6.2a5.2 5.2 0 019.6 0"/><path d="M5 12.6c.5-1 .8-2.2.8-3.6a2.2 2.2 0 014.4 0c0 1.6-.3 3.1-.9 4.4"/><path d="M8 9c0 2-.5 3.8-1.4 5.2"/><path d="M12.4 9.6c0 1.5-.3 2.9-.8 4.1"/><path d="M3.4 9.4c0 1.2-.2 2.2-.6 3"/>'),
    github=('<svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" aria-hidden="true">'
            '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'),
    terminal=svg('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.8"/><path d="M4.6 6.4L6.8 8l-2.2 1.6"/><path d="M8.4 10h3"/>'),
    # engrenagem com dentes de verdade: os raios soltos liam como sol, ao lado do sol do tema
    engrenagem=svg('<circle cx="8" cy="8" r="2"/><path d="M8 1.5l1.05 1.55 1.8-.5.5 1.8L13 5.4l-.5 1.8L13.5 8l-1 .8.5 1.8-1.65.85-.5 1.8-1.8-.5L8 14.5l-1.05-1.55-1.8.5-.5-1.8L3 10.6l.5-1.8L2.5 8l1-.8L3 5.4l1.65-.85.5-1.8 1.8.5z"/>'),
)


# o movimento com significado do tema do DS (data-motion): engrenagem gira, sol e lua balançam, seta anda
MOVIMENTO = dict(engrenagem='turn', sol='swing', lua='swing', seta='nudge')


def ic(nome, tam=16, cor=None):
    c = f'color:{cor};' if cor else ''
    m = f' data-motion="{MOVIMENTO[nome]}"' if nome in MOVIMENTO else ''
    return f'<span{m} style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;{c}">{I[nome]}</span>'


def legenda(t, k, espaco='0.25em'):
    # a voz editorial das telas de acesso: mono, caixa alta, espaçada
    return (f'<span style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:{espaco};'
            f'text-transform:uppercase;color:{k["mfg"]};">{t}</span>')


def rotulo(t, c, tam=10):
    return (f'<span style="font-family:{MONO};font-size:{tam}px;letter-spacing:0.2em;'
            f'text-transform:uppercase;color:{c};">{t}</span>')


TONS = dict(blue=('tblue', 'tbluefg'), green=('tgreen', 'tgreenfg'), red=('tred', 'tredfg'),
            orange=('torange', 'torangefg'), yellow=('tyellow', 'tyellowfg'), gray=('tgray', 'tgrayfg'))


def badge(txt, k, tom='gray', ponto=False, mono=False, tracejado=False):
    if tracejado:
        est = f'background:transparent;color:{k["mfg"]};border:1px dashed {k["input"]};'
    else:
        a, b = TONS[tom]
        est = f'background:{k[a]};color:{k[b]};'
    p = f'<span style="width:6px;height:6px;border-radius:999px;background:currentColor;opacity:0.75;"></span>' if ponto else ''
    ff = f'font-family:{MONO};font-size:11px;letter-spacing:0.02em;' if mono else 'font-size:11.5px;'
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;'
            f'border-radius:4px;{est}{ff}font-weight:500;white-space:nowrap;">{p}{txt}</span>')


def _estilo_botao(txt, k, var, alt, icone, largura):
    raio = alt / 4
    est = {
        'outline': f'background:{k["card"]};color:{k["fgs"]};border:1px solid {k["input"]};',
        'primary': f'background:{k["prisub"]};color:{k["prisubfg"]};border:1px solid transparent;',
        'solid': f'background:{k["pri"]};color:{k["prifg"]};border:1px solid transparent;',
        'ghost': f'background:transparent;color:{k["mfg"]};border:1px solid transparent;',
    }[var]
    w = f'width:{largura};' if largura else ''
    pad = '0' if (icone and not txt) else ('0 14px' if alt >= 36 else '0 12px')
    wq = f'width:{alt}px;' if (icone and not txt) else w
    return (f'display:inline-flex;align-items:center;justify-content:center;gap:7px;'
            f'height:{alt}px;{wq}padding:{pad};border-radius:{raio:g}px;{est}font-family:{FONTE};'
            f'font-size:{13 if alt < 36 else 14}px;font-weight:500;white-space:nowrap;')


def botao_link(txt, href, k, var='outline', alt=32, icone=None, largura=None):
    # para o Play: um <a> com cara de botão leva ao próximo quadro
    g = ic(icone, 15) if icone else ''
    return f'<a href="{href}" style="{_estilo_botao(txt, k, var, alt, icone, largura)}">{txt}{g}</a>'


def botao(txt, k, var='outline', alt=32, icone=None, largura=None, aria=None, desativado=False, acao=None):
    raio = alt / 4
    est = {
        'outline': f'background:{k["card"]};color:{k["fgs"]};border:1px solid {k["input"]};',
        'primary': f'background:{k["prisub"]};color:{k["prisubfg"]};border:1px solid transparent;',
        'solid': f'background:{k["pri"]};color:{k["prifg"]};border:1px solid transparent;',
        'ghost': f'background:transparent;color:{k["mfg"]};border:1px solid transparent;',
    }[var]
    w = f'width:{largura};' if largura else ''
    pad = '0' if (icone and not txt) else ('0 14px' if alt >= 36 else '0 12px')
    wq = f'width:{alt}px;' if (icone and not txt) else w
    g = ic(icone, 15) if icone else ''
    a = f' aria-label="{aria}"' if aria else ''
    a += f' onClick="{{{{{acao}}}}}"' if acao else ''
    d = ' disabled' if desativado else ''
    op = 'opacity:0.55;' if desativado else ''
    return (f'<button type="button"{a}{d} style="display:inline-flex;align-items:center;justify-content:center;gap:7px;'
            f'height:{alt}px;{wq}padding:{pad};border-radius:{raio:g}px;{est}font-family:{FONTE};'
            f'font-size:{13 if alt < 36 else 14}px;font-weight:500;white-space:nowrap;{op}">{g}{txt}</button>')


def cartao(conteudo, k, pad='20px 22px', extra=''):
    return (f'<div style="background:{k["card"]};border-radius:12px;padding:{pad};'
            f'box-shadow:{k["sombra"]};display:flex;flex-direction:column;gap:14px;{extra}">{conteudo}</div>')


def filete(k):
    return f'<div style="height:1px;background:{k["muted"]};"></div>'


# a escala da muriki-api (GET /code/competencies): fundamentos, junior, pleno, senior
NIVEIS = [T('fundamentos'), T('junior'), T('pleno'), T('senior')]


def escala(n, k, larg=20):
    segs = ''
    for i in range(len(NIVEIS)):
        if i < n:
            s = f'background:{k["pri"]};'
        else:
            s = f'background:{k["sunken"]};box-shadow:inset 0 1px 1px rgba(0,0,0,0.06);'
        segs += f'<span style="width:{larg}px;height:6px;border-radius:2px;{s}"></span>'
    return f'<span style="display:flex;gap:3px;align-items:center;">{segs}</span>'


PRODUTO_ITENS = [
    ('inicio', 'casa'),
    ('evolucao', 'evolucao'),
    ('trilhas', 'trilhas'),
    ('exercicios', 'exercicios'),
    ('avaliacoes', 'avaliacoes'),
    ('playground', 'terminal'),
]

# para onde cada item do menu leva no Play; __SUF__ vira '' ou 'Escuro' na montagem, e o tema segue junto
DESTINOS = dict(inicio='Inicio', evolucao='Main', trilhas='Trilhas', exercicios='Exercicios', avaliacoes='Avaliacao', playground='PlaygroundDesenhos',
                peer='Conectar', plano='Planos')


def destino(chave):
    return f'{DESTINOS[chave]}__SUF__.dc.html' if chave in DESTINOS else '#'


def icone_tema(tam=16):
    # a lua chama o escuro quando o tema está claro; o sol chama o claro quando está escuro
    return (f'<span class="so-claro" style="display:flex;">{ic("lua", tam)}</span>'
            f'<span class="so-escuro" style="display:flex;">{ic("sol", tam)}</span>')


def botao_tema(k, tam=36):
    return (f'<button type="button" aria-label="{{{{temaRotulo}}}}" onClick="{{{{trocarTema}}}}" '
            f'style="display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;flex:0 0 auto;'
            f'border:0;border-radius:9px;background:transparent;color:{k["mfg"]};cursor:pointer;">{icone_tema()}</button>')


def botao_idioma(k, alt=36, extra='', abre='baixo', compacto=False):
    # menu, não ciclo: o clique abre a lista inteira, cada idioma no próprio idioma
    lugar = {'baixo': 'top:calc(100% + 6px);right:0;',
             'cima': 'bottom:calc(100% + 6px);left:0;',
             'lado': 'left:calc(100% + 8px);bottom:0;'}[abre]
    if compacto:
        botao = (f'<button type="button" aria-label="{T("trocarIdioma")}" aria-haspopup="menu" aria-expanded="{{{{menuIdioma}}}}" '
                 f'onClick="{{{{abrirIdioma}}}}" style="display:flex;flex-direction:column;align-items:center;gap:2px;width:44px;padding:6px 0;'
                 f'border:0;border-radius:10px;background:transparent;color:{k["mfg"]};font-family:{MONO};font-size:10px;letter-spacing:0.08em;cursor:pointer;">'
                 f'{ic("globo", 16)}{T("idiomaCurto")}</button>')
    else:
        botao = (f'<button type="button" aria-label="{T("trocarIdioma")}" aria-haspopup="menu" aria-expanded="{{{{menuIdioma}}}}" '
                 f'onClick="{{{{abrirIdioma}}}}" style="display:flex;align-items:center;gap:8px;width:100%;height:{alt}px;padding:0 10px;border:0;'
                 f'border-radius:9px;background:transparent;color:{k["mfg"]};font-family:{FONTE};font-size:13px;cursor:pointer;">'
                 f'{ic("globo", 16)}<span>{T("idiomaNome")}</span><span style="display:flex;opacity:0.6;">{ic("baixo", 12)}</span></button>')
    menu = (f'<sc-if value="{{{{menuIdioma}}}}" hint-placeholder-val="{{{{ false }}}}">'
            f'<div role="menu" aria-label="{T("idiomaMenu")}" style="position:absolute;{lugar}z-index:20;min-width:176px;padding:4px;'
            f'border-radius:12px;background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, {k["sombraFlut"]};display:flex;flex-direction:column;">'
            f'<span style="padding:6px 8px;font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;'
            f'color:{k["mfg"]};">{T("idiomaMenu")}</span>'
            f'<sc-for list="{{{{idiomas}}}}" as="i" hint-placeholder-count="3">'
            f'<button type="button" role="menuitemradio" aria-checked="{{{{i.atual}}}}" lang="{{{{i.lang}}}}" onClick="{{{{i.escolher}}}}" '
            f'style="display:flex;align-items:center;justify-content:space-between;gap:8px;height:32px;padding:0 8px;border:0;border-radius:6px;'
            f'background:transparent;color:{k["fg"]};font-family:{FONTE};font-size:13px;text-align:left;cursor:pointer;">'
            f'<span>{{{{i.nome}}}}</span>'
            f'<sc-if value="{{{{i.atual}}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display:flex;color:{k["pri"]};">{ic("check", 14)}</span></sc-if>'
            f'</button></sc-for></div></sc-if>')
    return f'<span style="position:relative;display:flex;{extra}">{botao}{menu}</span>'


def _item_rail(k, chave, icone, at, direita=''):
    f = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at
         else f'color:{k["mfg"]};')
    b = (f'<span style="position:absolute;left:0;top:7px;bottom:7px;width:3px;border-radius:999px;'
         f'background:{k["pri"]};"></span>') if at else ''
    cur = ' aria-current="page"' if at else ''
    return (f'<a href="{destino(chave)}"{cur} style="position:relative;display:flex;align-items:center;gap:10px;height:36px;'
            f'padding:0 10px;border-radius:9px;font-size:13px;{f}">{b}{ic(icone)}'
            f'<span style="flex:1;">{T(chave)}</span>{direita}</a>')


def _em_breve_rail(k, chave, icone):
    # a tela ainda não existe: esmaecido, com o selo mono, sem navegar (o soon do app-shell)
    return (f'<span aria-disabled="true" style="display:flex;align-items:center;gap:10px;height:36px;padding:0 10px;'
            f'border-radius:9px;font-size:13px;color:{k["mfg"]};opacity:0.75;"><span style="display:flex;opacity:0.7;">{ic(icone)}</span>'
            f'<span style="flex:1;">{T(chave)}</span>'
            f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;">{T("emBreveRail")}</span></span>')


def rail(k, ativo):
    item = lambda chave, icone, at, direita='': _item_rail(k, chave, icone, at, direita)
    em_breve = lambda chave, icone: _em_breve_rail(k, chave, icone)

    nav = ''.join(item(c, i, c == ativo) for c, i in PRODUTO_ITENS)
    # o Peer na IDE ainda está em construção; a tela Conectar segue no canvas como desenho do que vem
    peer = item('peer', 'peer', True) if ativo == 'peer' else em_breve('peer', 'peer')
    base = peer + item('plano', 'plano', ativo == 'plano', badge('Pro', k, 'blue'))
    return (
        f'<nav aria-label="Muriki Code" style="width:232px;flex:0 0 232px;background:{k["rail"]};display:flex;'
        f'flex-direction:column;box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">'
        f'<div style="padding:12px 10px 6px;">'
        f'<button type="button" aria-label="{T("trocarProduto")}" style="display:flex;align-items:center;gap:10px;'
        f'width:100%;height:48px;padding:0 10px;border-radius:11px;border:0;background:transparent;'
        f'font-family:{FONTE};text-align:left;cursor:pointer;">'
        f'<span style="display:flex;width:30px;height:30px;flex:0 0 auto;">{LOGO}</span>'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Muriki Code</span>'
        f'<span style="font-size:11px;color:{k["mfg"]};">{T("contaMuriki")}</span></span>'
        f'{ic("troca", 14, k["mfg"])}</button></div>'
        f'<div style="padding:4px 10px;display:flex;flex-direction:column;gap:2px;">'
        f'<div style="height:30px;display:flex;align-items:center;padding:0 10px;">{rotulo(T("aprender"), k["mfg"])}</div>'
        f'{nav}</div>'
        f'<div style="flex:1;"></div>'
        f'<div style="padding:10px;display:flex;flex-direction:column;gap:2px;">{base}'
        f'<div style="height:1px;background:{k["muted"]};margin:8px 4px;"></div>'
        f'<div style="display:flex;align-items:center;gap:2px;">{botao_idioma(k, extra="flex:1;", abre="cima")}{botao_tema(k)}</div>'
        f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 10px;">'
        f'<span style="width:28px;height:28px;border-radius:999px;background:{k["tgreen"]};color:{k["tgreenfg"]};'
        f'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">RM</span>'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Rafael Moura</span>'
        f'<span style="font-size:11px;color:{k["mfg"]};">rafael@moura.dev</span></span>'
        f'<a href="ContaDados__SUF__.dc.html" aria-label="{T("config")}" title="{T("config")}" style="display:flex;align-items:center;justify-content:center;'
        f'width:28px;height:28px;border-radius:8px;color:{k["mfg"]};">'
        f'{ic("engrenagem", 15)}</a></div></div></nav>'
    )


def rail_compacto(k, ativo):
    def item(chave, icone, at):
        f = f'background:{k["prisub"]};color:{k["prisubfg"]};' if at else f'color:{k["mfg"]};'
        cur = ' aria-current="page"' if at else ''
        return (f'<a href="{destino(chave)}" aria-label="{T(chave)}"{cur} style="display:flex;align-items:center;justify-content:center;'
                f'width:40px;height:40px;border-radius:10px;{f}">{ic(icone, 17)}</a>')
    def grupo(titulo, quadrados, linhas):
        # o flyout do app-shell: mouse ou foco no grupo abre o cartão com os itens clicáveis
        cab = (f'<div style="height:30px;display:flex;align-items:center;padding:0 10px;">{rotulo(titulo, k["mfg"])}</div>'
               if titulo else '')
        return f'<div class="grupo">{quadrados}<div class="flyout" aria-hidden="true">{cab}{linhas}</div></div>'

    nav = grupo(T('aprender'), ''.join(item(c, i, c == ativo) for c, i in PRODUTO_ITENS),
                ''.join(_item_rail(k, c, i, c == ativo) for c, i in PRODUTO_ITENS))
    peer = _item_rail(k, 'peer', 'peer', True) if ativo == 'peer' else _em_breve_rail(k, 'peer', 'peer')
    base = grupo('', item('peer', 'peer', False) + item('plano', 'plano', ativo == 'plano'),
                 peer + _item_rail(k, 'plano', 'plano', ativo == 'plano', badge('Pro', k, 'blue')))
    idioma = botao_idioma(k, extra='margin-top:6px;', abre='lado', compacto=True)
    return (
        f'<nav aria-label="Muriki Code" style="width:64px;flex:0 0 64px;background:{k["rail"]};display:flex;'
        f'flex-direction:column;align-items:center;gap:4px;padding:14px 0 12px;box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">'
        f'<span style="display:flex;width:30px;height:30px;margin-bottom:14px;">{LOGO}</span>{nav}'
        f'<div style="flex:1;"></div>{base}{idioma}{botao_tema(k, 40)}'
        f'<span style="margin-top:8px;width:30px;height:30px;border-radius:999px;background:{k["tgreen"]};color:{k["tgreenfg"]};'
        f'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">RM</span></nav>')


def raiz(k, estilo, lang=None):
    l = lang or T('lang')
    return (f'<div class="mc {{{{temaClasse}}}}" lang="{l}" style="position:relative;width:{W}px;height:{H}px;overflow:hidden;'
            f'background:{k["bg"]};color:{k["fg"]};font-family:{FONTE};font-size:14px;line-height:20px;{estilo}">')


def app(k, ativo, conteudo, compacto=False, pad='32px 40px', gap=24):
    r = rail_compacto(k, ativo) if compacto else rail(k, ativo)
    return (f'{raiz(k, "display:flex;")}{r}'
            f'<main style="flex:1;min-width:0;padding:{pad};display:flex;flex-direction:column;gap:{gap}px;">'
            f'{conteudo}</main></div>')


def topo(k, produto, email='rafael@moura.dev'):
    return (f'<header style="display:flex;align-items:center;gap:10px;height:64px;flex:0 0 auto;padding:0 24px 0 32px;">'
            f'<span style="display:flex;width:28px;height:28px;">{LOGO}</span>'
            f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{produto}</span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;">{botao_idioma(k)}{botao_tema(k)}'
            f'<span style="width:1px;height:20px;margin:0 10px;background:{k["input"]};"></span>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{email}</span></span></header>')


def voltar(k, rotulo_, href):
    # o voltar da tela de detalhe (BackLink do DS): seta + para onde volta, um nível acima
    return (f'<a href="{href}" style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;height:28px;margin-left:-4px;'
            f'padding:0 4px;border-radius:6px;font-size:13px;font-weight:500;color:{k["mfg"]};">'
            f'<span style="display:flex;transform:rotate(180deg);">{ic("seta", 14)}</span>{rotulo_}</a>')


def trilha_nav(k, trilha):
    # trilha = [(rótulo, destino), ...]; o último é a página atual
    partes = [f'<a href="{d}" style="color:{k["mfg"]};">{n}</a>' for n, d in trilha[:-1]]
    partes.append(f'<span style="color:{k["fg"]};">{trilha[-1][0]}</span>')
    sep = f'<span style="color:{k["input"]};">/</span>'
    return (f'<nav aria-label="{T("trilhaAria")}" style="display:flex;gap:8px;align-items:center;font-size:12.5px;">'
            f'{sep.join(partes)}</nav>')


def topo_detalhe(k, trilha):
    # dois níveis: só "← pai". Três ou mais: o voltar sobe um e a trilha fica ao lado
    if len(trilha) <= 2:
        return voltar(k, *trilha[0])
    return (f'<div style="display:flex;align-items:center;gap:14px;">{voltar(k, *trilha[-2])}'
            f'<span style="width:1px;height:14px;background:{k["input"]};"></span>{trilha_nav(k, trilha)}</div>')


def cabecalho(k, trilha, titulo, sub='', direita='', chips=''):
    t = topo_detalhe(k, trilha) if trilha else ''
    s = f'<p style="margin:0;font-size:14px;color:{k["mfg"]};max-width:70ch;">{sub}</p>' if sub else ''
    c = f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div>' if chips else ''
    return (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{t}'
            f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{titulo}</h1>'
            f'{s}{c}</div>{direita}</header>')


def mono(t, k, cor=None, tam=12.5):
    return f'<code style="font-family:{MONO};font-size:{tam}px;color:{cor or k["fgs"]};">{t}</code>'


# O que só algumas telas usam, fora do CSS comum: o --divider e o skeleton do DS (o item skeleton
# traz o mesmo @keyframes). Entra pelo `css` da casca para não mexer nas telas que não usam.
CSS_DIVIDER_SKELETON = (
    '\n.mc{--divider:oklch(0.32 0.02 248.5 / 0.06);}.mc.escuro{--divider:oklch(0.925 0.004 100 / 0.055);}'
    '\n@keyframes muriki-shimmer{from{background-position:-100vw 0;}to{background-position:100vw 0;}}'
    '\n.mc .muriki-skeleton{border-radius:8px;background-color:var(--sunken);background-image:linear-gradient(100deg, transparent 35%, '
    'color-mix(in oklab, var(--card) 85%, transparent) 50%, transparent 65%);background-size:200vw 100%;background-repeat:no-repeat;'
    'background-attachment:fixed;animation:muriki-shimmer 1.5s ease-in-out infinite;}'
    '\n.mc.escuro .muriki-skeleton{background-image:linear-gradient(100deg, transparent 35%, color-mix(in oklab, var(--card) 70%, transparent) 50%, transparent 65%);}'
    '\n@media (prefers-reduced-motion: reduce){.mc .muriki-skeleton{animation:none;background-image:none;}}')


def modal_limite_plano(k, titulo, descricao, beneficio=None, oferta=True, razao=None, rotulos=('plAgoraNao', 'plConhecerPro', 'plEntendi')):
    # o PlanLimitDialog do registry: só aparece quando a ação bate no plano. O que bateu, o que o Pro
    # dá (no quadro com o selo PRO) e "Conhecer o Pro" ao lado de "Agora não"; sem oferta, "Entendi".
    # `razao` é a linha de cima de quem chegou por redirecionamento (o TrackLanguageSwitch).
    ladrilho = (f'<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;'
                + (f'background:{k["prisub"]};color:{k["pri"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 22%, transparent);">{ic("brilho", 20)}'
                   if oferta else f'background:{k["sunken"]};color:{k["mfg"]};">{ic("dica", 20)}')
                + '</span>')
    linha = (f'<p style="margin:0;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{razao}</p>') if razao else ''
    quadro = (f'<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;background:{k["prisub"]};'
              f'color:{k["prisubfg"]};font-size:13.5px;line-height:20px;box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 22%, transparent);">'
              f'<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;background:{k["tblue"]};color:{k["tbluefg"]};'
              f'font-family:{MONO};font-size:11px;letter-spacing:0.08em;font-weight:500;">PRO</span>{beneficio}</div>') if oferta and beneficio else ''
    agora, conhecer, entendi = rotulos
    botoes = (f'{botao(T(agora), k, "ghost", 32)}{botao(T(conhecer), k, "primary", 32, icone="brilho")}' if oferta
              else botao(T(entendi), k, 'primary', 32))
    return (f'<section role="dialog" aria-modal="true" aria-label="{titulo}" style="position:relative;width:440px;max-width:calc(100% - 32px);box-sizing:border-box;'
            f'display:flex;flex-direction:column;gap:20px;padding:20px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombraFlut"]}, inset 0 0 0 1px {k["border"]};">'
            f'<span aria-hidden="true" style="position:absolute;top:14px;right:14px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{ic("x", 16)}</span>'
            f'{ladrilho}<div style="display:flex;flex-direction:column;gap:6px;padding-right:32px;">{linha}'
            f'<h2 style="margin:0;font-size:17px;line-height:23px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{titulo}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{descricao}</p></div>'
            f'{quadro}<div style="display:flex;justify-content:flex-end;gap:8px;">{botoes}</div></section>')


def com_modal(k, tela, modal):
    # o véu do Dialog (--scrim) por cima da tela inteira, o rail junto, e o modal no centro
    assert tela.endswith('</div>')
    return tela[:-len('</div>')] + (f'<div style="position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;'
                                     f'background:{k["veu"]};">{modal}</div></div>')
