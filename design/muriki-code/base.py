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


def _logo():
    svg = open(os.path.join(AQUI, '..', 'logo.svg')).read()
    svg = re.sub(r'<svg[^>]*>', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000" width="100%" height="100%" aria-hidden="true">', svg, count=1)
    # a única diferença entre logo.svg e logo-dark.svg é a tinta do primeiro traço
    svg = svg.replace('fill="rgb(36,36,33)"', 'style="fill:var(--logo)"', 1)
    return svg.strip()


LOGO = _logo()


def T(chave):
    return '{{t.' + chave + '}}'


def _vars(d):
    return ''.join(f'--{n}:{v};' for n, v in d.items())


def casca(titulo, corpo, logica, props):
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
trocarIdioma: () => this.setState({ idioma: ORDEM[(ORDEM.indexOf(idioma) + 1) % ORDEM.length] }),
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
    trilhas=svg('<path d="M2.5 3.5h3.8a1.9 1.9 0 011.7 1.9v8.1a1.5 1.5 0 00-1.5-1.5h-4z"/><path d="M13.5 3.5H9.7A1.9 1.9 0 008 5.4v8.1a1.5 1.5 0 011.5-1.5h4z"/>'),
    exercicios=svg('<path d="M5.5 4.5L2 8l3.5 3.5"/><path d="M10.5 4.5L14 8l-3.5 3.5"/>'),
    avaliacoes=svg('<circle cx="8" cy="6.8" r="4.4"/><path d="M6.1 6.8l1.3 1.3 2.5-2.5"/><path d="M5.7 10.6l-.9 3.4L8 12.8l3.2 1.2-.9-3.4"/>'),
    peer=svg('<path d="M2.4 7.6a5.5 5.5 0 119.9 3.3l.9 2.6-2.8-.8A5.5 5.5 0 012.4 7.6z"/>'),
    plano=svg('<rect x="1.8" y="3.5" width="12.4" height="9" rx="1.8"/><path d="M1.8 6.6h12.4"/><path d="M4.4 10h2.6"/>'),
    laptop=svg('<rect x="3" y="3.4" width="10" height="7" rx="1.2"/><path d="M1.5 12.6h13"/>'),
    cadeado=svg('<rect x="3" y="7" width="10" height="7" rx="1.6"/><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2"/>'),
    check=svg('<path d="M3 8.5l3 3 7-7"/>'),
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
    pessoa=svg('<circle cx="8" cy="5.4" r="2.8"/><path d="M2.8 14c.6-2.8 2.7-4.4 5.2-4.4s4.6 1.6 5.2 4.4"/>'),
    olho_fechado=svg('<path d="M1.6 8s2.4-4.6 6.4-4.6S14.4 8 14.4 8s-2.4 4.6-6.4 4.6S1.6 8 1.6 8z"/><circle cx="8" cy="8" r="1.9"/><path d="M2.6 2.6l10.8 10.8"/>'),
    circulo=svg('<circle cx="8" cy="8" r="4.4"/>'),
    google=svg('<path d="M11.96 4.04A5.6 5.6 0 1 0 13.6 8H8.4"/>'),
    digital=svg('<path d="M3.2 6.2a5.2 5.2 0 019.6 0"/><path d="M5 12.6c.5-1 .8-2.2.8-3.6a2.2 2.2 0 014.4 0c0 1.6-.3 3.1-.9 4.4"/><path d="M8 9c0 2-.5 3.8-1.4 5.2"/><path d="M12.4 9.6c0 1.5-.3 2.9-.8 4.1"/><path d="M3.4 9.4c0 1.2-.2 2.2-.6 3"/>'),
    github=('<svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%" aria-hidden="true">'
            '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>'),
    terminal=svg('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.8"/><path d="M4.6 6.4L6.8 8l-2.2 1.6"/><path d="M8.4 10h3"/>'),
    engrenagem=svg('<circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.8M8 12.6v1.8M14.4 8h-1.8M3.4 8H1.6M12.5 3.5l-1.3 1.3M4.8 11.2l-1.3 1.3M12.5 12.5l-1.3-1.3M4.8 4.8L3.5 3.5"/>'),
)


def ic(nome, tam=16, cor=None):
    c = f'color:{cor};' if cor else ''
    return f'<span style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;{c}">{I[nome]}</span>'


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


NIVEIS = ['Junior', 'Pleno', 'Senior', 'Tech Lead', 'Architect']


def escala(n, k, larg=20):
    segs = ''
    for i in range(5):
        if i < n:
            s = f'background:{k["pri"]};'
        else:
            s = f'background:{k["sunken"]};box-shadow:inset 0 1px 1px rgba(0,0,0,0.06);'
        segs += f'<span style="width:{larg}px;height:6px;border-radius:2px;{s}"></span>'
    return f'<span style="display:flex;gap:3px;align-items:center;">{segs}</span>'


PRODUTO_ITENS = [
    ('evolucao', 'evolucao'),
    ('trilhas', 'trilhas'),
    ('exercicios', 'exercicios'),
    ('avaliacoes', 'avaliacoes'),
    ('playground', 'terminal'),
]

# para onde cada item do menu leva no Play; __SUF__ vira '' ou 'Escuro' na montagem, e o tema segue junto
DESTINOS = dict(evolucao='Main', exercicios='Exercicio', avaliacoes='Avaliacao', playground='Playground',
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


def botao_idioma(k, alt=36, extra=''):
    return (f'<button type="button" aria-label="{T("trocarIdioma")}" onClick="{{{{trocarIdioma}}}}" '
            f'style="display:flex;align-items:center;gap:8px;height:{alt}px;padding:0 10px;border:0;border-radius:9px;'
            f'background:transparent;color:{k["mfg"]};font-family:{FONTE};font-size:13px;cursor:pointer;{extra}">'
            f'{ic("globo", 16)}<span>{T("idiomaNome")}</span></button>')


def rail(k, ativo):
    def item(chave, icone, at, direita=''):
        f = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at
             else f'color:{k["mfg"]};')
        b = (f'<span style="position:absolute;left:0;top:7px;bottom:7px;width:3px;border-radius:999px;'
             f'background:{k["pri"]};"></span>') if at else ''
        cur = ' aria-current="page"' if at else ''
        return (f'<a href="{destino(chave)}"{cur} style="position:relative;display:flex;align-items:center;gap:10px;height:36px;'
                f'padding:0 10px;border-radius:9px;font-size:13px;{f}">{b}{ic(icone)}'
                f'<span style="flex:1;">{T(chave)}</span>{direita}</a>')

    nav = ''.join(item(c, i, c == ativo) for c, i in PRODUTO_ITENS)
    ponto = f'<span style="width:7px;height:7px;border-radius:999px;background:{k["ok"]};"></span>'
    base = (item('peer', 'peer', ativo == 'peer', ponto)
            + item('plano', 'plano', ativo == 'plano', badge('Starter', k, 'gray')))
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
        f'<div style="display:flex;align-items:center;gap:2px;">{botao_idioma(k, extra="flex:1;")}{botao_tema(k)}</div>'
        f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 10px;">'
        f'<span style="width:28px;height:28px;border-radius:999px;background:{k["tgreen"]};color:{k["tgreenfg"]};'
        f'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">RM</span>'
        f'<span style="display:flex;flex-direction:column;min-width:0;flex:1;">'
        f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Rafael Moura</span>'
        f'<span style="font-size:11px;color:{k["mfg"]};">rafael@moura.dev</span></span>'
        f'<span title="{T("config")}" style="display:flex;">{ic("engrenagem", 15, k["mfg"])}</span></div></div></nav>'
    )


def rail_compacto(k, ativo):
    def item(chave, icone, at):
        f = f'background:{k["prisub"]};color:{k["prisubfg"]};' if at else f'color:{k["mfg"]};'
        cur = ' aria-current="page"' if at else ''
        return (f'<a href="{destino(chave)}" aria-label="{T(chave)}"{cur} style="display:flex;align-items:center;justify-content:center;'
                f'width:40px;height:40px;border-radius:10px;{f}">{ic(icone, 17)}</a>')
    nav = ''.join(item(c, i, c == ativo) for c, i in PRODUTO_ITENS)
    idioma = (f'<button type="button" aria-label="{T("trocarIdioma")}" onClick="{{{{trocarIdioma}}}}" '
              f'style="display:flex;flex-direction:column;align-items:center;gap:2px;width:44px;padding:6px 0;margin-top:6px;'
              f'border:0;border-radius:10px;background:transparent;color:{k["mfg"]};font-family:{MONO};font-size:10px;letter-spacing:0.08em;cursor:pointer;">'
              f'{ic("globo", 16)}{T("idiomaCurto")}</button>')
    return (
        f'<nav aria-label="Muriki Code" style="width:64px;flex:0 0 64px;background:{k["rail"]};display:flex;'
        f'flex-direction:column;align-items:center;gap:4px;padding:14px 0 12px;box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">'
        f'<span style="display:flex;width:30px;height:30px;margin-bottom:14px;">{LOGO}</span>{nav}'
        f'<div style="flex:1;"></div>{item("peer", "peer", False)}{item("plano", "plano", False)}{idioma}{botao_tema(k, 40)}'
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


def cabecalho(k, trilha, titulo, sub='', direita='', chips=''):
    t = ''
    if trilha:
        partes = []
        for i, p in enumerate(trilha):
            if i < len(trilha) - 1:
                partes.append(f'<a href="#" style="color:{k["mfg"]};">{p}</a>')
            else:
                partes.append(f'<span style="color:{k["fg"]};">{p}</span>')
        sep = f'<span style="color:{k["input"]};">/</span>'
        t = (f'<nav aria-label="Trilha" style="display:flex;gap:8px;align-items:center;font-size:12.5px;">'
             f'{sep.join(partes)}</nav>')
    s = f'<p style="margin:0;font-size:14px;color:{k["mfg"]};max-width:70ch;">{sub}</p>' if sub else ''
    c = f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div>' if chips else ''
    return (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{t}'
            f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{titulo}</h1>'
            f'{s}{c}</div>{direita}</header>')


def mono(t, k, cor=None, tam=12.5):
    return f'<code style="font-family:{MONO};font-size:{tam}px;color:{cor or k["fgs"]};">{t}</code>'
