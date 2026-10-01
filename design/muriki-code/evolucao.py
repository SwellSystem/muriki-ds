# ── Evolução, refeita em 2026-10-01 ─────────────────────────────────────
# As cinco visões da Evolução (swell-docs/muriki-api/features/code/features.md), com as competências e as
# trilhas reais do conteúdo. Sempre contra o próprio histórico: nada de ranking, comparação com outras
# pessoas ou seta de queda, e o nível nunca desce.
#
# Fatia 1, com o que a API já tem (GET /code/competencies e os caminhos das trilhas): o perfil por
# competência, com o nível, a origem e o caminho na trilha, e o progresso nas trilhas.
# Fatia 2, com a rota de histórico: a evolução no tempo e a trajetória.
#
# O gráfico é SVG só de formas e números literais; os rótulos traduzíveis são HTML por cima (no canvas,
# {{t.…}} dentro de <text> sai vazio).
from base import *
from movel_code import WM, PAD, ALTURAS, raiz_movel, topo_movel, titulo_movel, card

# a página passa de 900: no canvas ela vira dois quadros, o topo (fatia 1) e a página rolada (fatia 2)
ROLAGEM = 640

# (competência, nível 1..4, origem, caminho): caminho = (nível das etapas, feitas, total) ou None (sem etapas)
JS = [
    ('Primeiros passos', 3, 'assessed', ('nivelSenior', 0, 0)),
    ('Funções e escopo', 3, 'assessed', ('nivelSenior', 0, 0)),
    ('Listas e objetos', 3, 'declared_from_experience', ('nivelPleno', 3, 5)),
    ('Texto', 2, 'declared', ('nivelPleno', 1, 4)),
    ('Dados e referências', 3, 'declared_from_experience', ('nivelPleno', 2, 3)),
    ('Erros e depuração', 2, 'assessed', ('nivelPleno', 0, 3)),
    ('Organização do código', 3, 'declared_from_experience', ('nivelPleno', 2, 2)),
    ('Classes e protótipos', 2, 'declared_from_experience', ('nivelPleno', 0, 3)),
    ('Assincronia', 2, 'assessed', ('nivelPleno', 1, 4)),
]
ARQ = [('Sistemas web', 2, 'declared', ('nivelPleno', 0, 3))]

# (trilha, feitas, cobertas pelo nível, pendentes)
TRILHAS_EV = [('JavaScript do zero', 14, 9, 3), ('JavaScript idiomático', 6, 12, 14), ('Arquitetura de sistemas', 1, 0, 7)]

COLUNAS = 'minmax(0,1.3fr) 104px minmax(0,1.1fr) minmax(0,1.2fr) 16px'


def _origem(k, origem):
    # selo só para o confirmado e o que a pessoa contou; o tempo de código é uma nota, não selo
    if origem == 'assessed':
        return badge(T('origemConfirmado'), k, 'green', ponto=True)
    if origem == 'declared':
        return badge(T('origemContou'), k, 'gray')
    return f'<span style="font-size:12px;color:{k["mfg"]};">{T("origemTempo")}</span>'


def _caminho(k, caminho):
    nivel, feitas, total = caminho
    if total == 0:
        return f'<span style="font-size:12px;color:{k["mfg"]};">{T(nivel)} · {T("semEtapas")}</span>'
    cor = k['fgs'] if feitas < total else k['mfg']
    return (f'<span style="font-size:12.5px;color:{k["fg"]};">{T("etapasDe")} {T(nivel)}: '
            f'<span style="font-family:{MONO};font-size:12px;color:{cor};">{feitas} {T("de")} {total}</span></span>')


def _linha(k, nome, nivel, origem, caminho, primeira):
    borda = '' if primeira else f'border-top:1px solid {k["muted"]};'
    return (f'<a href="Competencia__SUF__.dc.html" style="display:grid;grid-template-columns:{COLUNAS};gap:14px;align-items:center;'
            f'min-height:44px;padding:6px 18px;{borda}color:inherit;text-decoration:none;">'
            f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
            f'{escala(nivel, k, 20)}<span>{_origem(k, origem)}</span><span>{_caminho(k, caminho)}</span>'
            f'<span style="display:flex;color:{k["mfg"]};">{ic("direita", 14)}</span></a>')


def _grupo(k, titulo, itens):
    return (f'<div style="display:flex;align-items:center;height:30px;padding:0 18px;background:{k["rail"]};'
            f'border-top:1px solid {k["muted"]};">{rotulo(titulo, k["mfg"], 9.5)}</div>'
            + ''.join(_linha(k, *c, i == 0) for i, c in enumerate(itens)))


def _perfil(k):
    cab = (f'<div style="display:grid;grid-template-columns:{COLUNAS};gap:14px;align-items:center;height:36px;padding:0 18px;">'
           + ''.join(rotulo(T(c), k['mfg'], 9.5) for c in ('colComp', 'colNivel', 'colOrigem', 'colCaminho')) + '<span></span></div>')
    return (f'<section aria-label="{T("competencias")}" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;'
            f'box-shadow:{k["sombra"]};display:flex;flex-direction:column;overflow:hidden;">'
            f'<div style="display:flex;align-items:center;padding:16px 18px 6px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("competencias")}</h2></div>'
            f'{cab}{_grupo(k, T("grupoJs"), JS)}{_grupo(k, T("grupoArq"), ARQ)}</section>')


def _barra(k, feitas, cobertas, pendentes, alt=8):
    total = feitas + cobertas + pendentes
    seg = lambda n, cor: (f'<span style="flex:{n} 1 0;min-width:{3 if n else 0}px;height:{alt}px;background:{cor};"></span>' if n else '')
    return (f'<span style="display:flex;gap:2px;overflow:hidden;border-radius:3px;" role="img" '
            f'aria-label="{feitas} {T("feitas")}, {cobertas} {T("cobertas")}, {pendentes} {T("pendentes")}">'
            f'{seg(feitas, k["pri"])}{seg(cobertas, "color-mix(in oklch, " + k["pri"] + " 35%, transparent)")}'
            f'{seg(pendentes, k["sunken"])}</span>')


def _trilha(k, nome, feitas, cobertas, pendentes, primeira):
    borda = '' if primeira else f'border-top:1px solid {k["muted"]};'
    conta = lambda n, chave, cor: (f'<span style="display:inline-flex;align-items:center;gap:6px;">'
                                   f'<span style="width:8px;height:8px;border-radius:2px;background:{cor};"></span>'
                                   f'<span style="font-family:{MONO};font-size:11.5px;color:{k["fgs"]};">{n}</span>'
                                   f'<span style="font-size:12px;color:{k["mfg"]};">{T(chave)}</span></span>')
    return (f'<div style="display:flex;flex-direction:column;gap:9px;padding:14px 0;{borda}">'
            f'<a href="Trilha__SUF__.dc.html" style="font-size:13.5px;font-weight:500;color:{k["fgs"]};text-decoration:none;">{nome}</a>'
            f'{_barra(k, feitas, cobertas, pendentes)}'
            f'<span style="display:flex;flex-wrap:wrap;gap:6px 14px;">'
            f'{conta(feitas, "feitas", k["pri"])}{conta(cobertas, "cobertas", "color-mix(in oklch, " + k["pri"] + " 35%, transparent)")}'
            f'{conta(pendentes, "pendentes", k["sunken"])}</span></div>')


def _trilhas(k, largura='360px'):
    itens = ''.join(_trilha(k, *t, i == 0) for i, t in enumerate(TRILHAS_EV))
    return (f'<section aria-label="{T("nasTrilhas")}" style="width:{largura};flex:0 0 auto;align-self:flex-start;box-sizing:border-box;'
            f'background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};padding:16px 20px 6px;display:flex;flex-direction:column;">'
            f'<h2 style="margin:0 0 2px;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("nasTrilhas")}</h2>'
            f'{itens}</section>')


# o gráfico: 12 semanas, quatro faixas de nível (de baixo para cima: Fundamentos, Junior, Pleno, Senior)
SEMANAS = 12
LINHAS_GRAFICO = [
    # (competência, cor, [nível por semana], semanas confirmadas, declarado?)
    ('Funções e escopo', 'pri', [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3], [5], False),
    ('Assincronia', 'warn', [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2], [7], False),
    ('Sistemas web', 'ok', [2] * 12, [], True),
]


def _grafico(k, larg, alt, rot_esq=86):
    faixa = alt / 4
    x = lambda i: i * (larg / (SEMANAS - 1))
    y = lambda nivel, desloc: alt - (nivel - 0.5) * faixa + desloc
    faixas = ''.join(f'<rect x="0" y="{i * faixa:.1f}" width="{larg}" height="{faixa:.1f}" fill="var(--{"sunken" if i % 2 else "card"})"/>'
                     for i in range(4))
    grade = ''.join(f'<line x1="{x(i):.1f}" y1="0" x2="{x(i):.1f}" y2="{alt}" stroke="var(--muted)" stroke-width="1"/>' for i in range(SEMANAS))
    tracos, pontos = '', ''
    for j, (_, cor, niveis, conf, decl) in enumerate(LINHAS_GRAFICO):
        d = (j - 1) * 5  # as linhas da mesma faixa não se cobrem
        pts = f'M{x(0):.1f} {y(niveis[0], d):.1f}'
        for i in range(1, SEMANAS):
            if niveis[i] != niveis[i - 1]:
                pts += f' H{x(i):.1f} V{y(niveis[i], d):.1f}'
        pts += f' H{x(SEMANAS - 1):.1f}'
        tracej = ' stroke-dasharray="5 4"' if decl else ''
        tracos += f'<path d="{pts}" fill="none" stroke="var(--{cor})" stroke-width="2.25" stroke-linejoin="round"{tracej}/>'
        for i in conf:
            pontos += (f'<circle cx="{x(i):.1f}" cy="{y(niveis[i], d):.1f}" r="5" fill="var(--card)" stroke="var(--{cor})" stroke-width="2.25"/>')
    svg_ = (f'<svg viewBox="0 0 {larg} {alt}" width="100%" height="{alt}" preserveAspectRatio="none" aria-hidden="true" '
            f'style="display:block;border-radius:6px;overflow:visible;">{faixas}{grade}{tracos}{pontos}</svg>')
    # rótulos em HTML: as faixas à esquerda, os meses embaixo
    niveis = ''.join(f'<span style="position:absolute;right:10px;top:{(3 - i) * 25 + 12.5}%;transform:translateY(-50%);'
                     f'font-family:{MONO};font-size:10.5px;color:{k["mfg"]};white-space:nowrap;">{T(n)}</span>'
                     for i, n in enumerate(('nivelFund', 'nivelJunior', 'nivelPleno', 'nivelSenior')))
    meses = ''.join(f'<span style="position:absolute;left:{p}%;font-size:11px;color:{k["mfg"]};">{T(m)}</span>'
                    for m, p in (('jul', 0), ('ago', 36), ('set', 73)))
    return (f'<div style="display:flex;gap:0;">'
            f'<div style="position:relative;width:{rot_esq}px;flex:0 0 auto;height:{alt}px;">{niveis}</div>'
            f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">{svg_}'
            f'<div style="position:relative;height:16px;">{meses}</div></div></div>')


def _legenda_grafico(k):
    item = lambda nome, cor, decl: (f'<span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:{k["fg"]};">'
                                    f'<span style="width:18px;height:0;border-top:2.5px {"dashed" if decl else "solid"} var(--{cor});"></span>{nome}</span>')
    return (f'<span style="display:flex;flex-wrap:wrap;gap:8px 18px;">'
            + ''.join(item(n, c, d) for n, c, _, _, d in LINHAS_GRAFICO)
            + f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
              f'<span style="width:9px;height:9px;border-radius:99px;box-shadow:inset 0 0 0 2px {k["mfg"]};"></span>{T("legConfirmado")}</span>'
            + f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
              f'<span style="width:14px;height:0;border-top:2px dashed {k["mfg"]};"></span>{T("legDeclarado")}</span></span>')


def _no_tempo(k, larg=900, alt=200, rot_esq=86):
    return (f'<section aria-label="{T("noTempo")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:14px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("noTempo")}</h2>'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("noTempoSub")}</p></div>'
            f'{_legenda_grafico(k)}{_grafico(k, larg, alt, rot_esq)}</section>')


CODIGO_ANTES = ['let count = 0', '', 'export function increment() {', '  count = count + 1', '  return count', '}']
CODIGO_AGORA = ['export function memoize(fn) {', '  const cache = new Map()', '  return (key) => {',
                '    if (!cache.has(key)) cache.set(key, fn(key))', '    return cache.get(key)', '  }', '}']


def _codigo(k, titulo, linhas):
    corpo = ''.join(f'<span style="display:block;white-space:pre;">{l or " "}</span>' for l in linhas)
    return (f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">'
            f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{titulo}</span>'
            f'<pre style="margin:0;padding:12px 14px;border-radius:8px;background:{k["sunken"]};font-family:{MONO};font-size:12px;'
            f'line-height:19px;color:{k["fg"]};overflow:hidden;">{corpo}</pre></div>')


def _trajetoria(k, empilhar=False):
    medida = (f'<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">'
              f'<span style="font-size:13px;color:{k["mfg"]};">{T("medida")}</span>'
              f'<span style="font-size:20px;line-height:24px;font-weight:600;color:{k["mfg"]};">{T("medidaAntes")}</span>'
              f'<span style="display:flex;width:14px;height:14px;color:{k["mfg"]};align-self:center;">{I["seta"]}</span>'
              f'<span style="font-size:20px;line-height:24px;font-weight:600;color:{k["fgs"]};">{T("medidaAgora")}</span></div>')
    lados = (f'<div style="display:flex;{"flex-direction:column;" if empilhar else ""}gap:16px;">'
             f'{_codigo(k, T("antes"), CODIGO_ANTES)}{_codigo(k, T("agora"), CODIGO_AGORA)}</div>')
    return (f'<section aria-label="{T("trajetoria")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:14px;">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("trajetoria")}</h2>'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("trajetoriaSub")}</p></div>'
            f'{badge("Funções e escopo", k, "blue")}</div>{medida}{lados}</section>')


def tela_evolucao_nova(k, rolada=False):
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("evTitulo")}</h1>'
           f'<p style="margin:0;max-width:640px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("evSub")}</p></div>'
           f'{botao(T("comoMedido"), k, "ghost")}</header>')
    topo = f'<div style="display:flex;gap:20px;align-items:flex-start;">{_perfil(k)}{_trilhas(k)}</div>'
    conteudo = cab + topo + _no_tempo(k) + _trajetoria(k)
    # rolada, o menu fica e o conteúdo sobe, como na tela de verdade
    desloca = f'margin-top:-{ROLAGEM}px;' if rolada else ''
    return (f'{raiz(k, "display:flex;")}{rail(k, "evolucao")}'
            f'<main style="flex:1;min-width:0;padding:32px 40px;display:flex;flex-direction:column;gap:20px;{desloca}">{conteudo}</main></div>')


# ── celular ──
def _cartao_comp(k, nome, nivel, origem, caminho):
    return (f'<a href="Competencia__SUF__.dc.html" style="display:flex;flex-direction:column;gap:8px;padding:14px 0;'
            f'border-top:1px solid {k["muted"]};color:inherit;text-decoration:none;">'
            f'<span style="display:flex;align-items:center;gap:10px;">'
            f'<span style="flex:1;min-width:0;font-size:14.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
            f'{escala(nivel, k, 16)}</span>'
            f'<span style="display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;">{_origem(k, origem)}{_caminho(k, caminho)}</span></a>')


def tela_evolucao_movel(k):
    grupo = lambda titulo, itens: (f'<div style="display:flex;flex-direction:column;">'
                                   f'<span style="padding:6px 0 4px;">{rotulo(titulo, k["mfg"], 9.5)}</span>'
                                   + ''.join(_cartao_comp(k, *c) for c in itens) + '</div>')
    perfil = card(k, f'<h2 style="margin:0;font-size:16px;line-height:21px;font-weight:600;color:{k["fgs"]};">{T("competencias")}</h2>'
                     f'{grupo(T("grupoJs"), JS)}{grupo(T("grupoArq"), ARQ)}', gap=6)
    conteudo = (titulo_movel(k, T('evTitulo'), T('evSub')) + perfil + _trilhas(k, '100%')
                + _no_tempo(k, larg=300, alt=170, rot_esq=64) + _trajetoria(k, empilhar=True))
    return (f'{raiz_movel(k, ALTURAS['evolucao'], "display:flex;flex-direction:column;")}{topo_movel(k, T("evTitulo"))}'
            f'<main style="flex:1;min-height:0;padding:18px {PAD}px 28px;display:flex;flex-direction:column;gap:16px;">{conteudo}</main></div>')
