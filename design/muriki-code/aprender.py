# ── Trilhas, catálogo de Exercícios e Peer na web ──────────────────────────
# Trilhas: a lista, com "continue de onde parou" em cima, e o detalhe de uma trilha — o caminho de
# etapas, com o porquê da etapa de agora (o Learning repetiu o tema ou avançou) e o nível daquela
# competência ao lado. Exercícios: o catálogo, com busca, filtros, abas por estado e o uso do mês do
# plano. Peer na web: o histórico das conversas da IDE, a conversa aberta com o trecho que o Peer
# viu e a evidência que ela gerou, e onde o Peer pode olhar (ligado por projeto).
from base import *  # noqa: F401,F403
from logos_marcas import logo_marca, nome_marca

I.update(
    busca=svg('<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/>'),
    filtro=svg('<path d="M2 3.5h12"/><path d="M4.5 8h7"/><path d="M6.5 12.5h3"/>'),
)


def _progresso(k, feitas, total, larg='100%'):
    return (f'<span style="display:flex;align-items:center;gap:10px;width:{larg};">'
            f'<span style="flex:1;display:block;height:6px;border-radius:3px;background:{k["sunken"]};">'
            f'<span style="display:block;height:6px;width:{feitas / total * 100:.0f}%;border-radius:3px;background:{k["pri"]};"></span></span>'
            f'<span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};">{feitas}/{total}</span></span>')


def _chip_filtro(k, txt, ativo=False):
    est = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if ativo
           else f'background:transparent;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};')
    return f'<span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:999px;font-size:13px;{est}">{txt}</span>'


def _filtro(k, txt):
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;font-size:13px;'
            f'color:{k["mfg"]};border:1px dashed {k["input"]};">{ic("filtro", 14)}{txt}</span>')


def _busca(k, ph, largura='300px'):
    return (f'<span style="display:inline-flex;align-items:center;gap:8px;width:{largura};height:32px;padding:0 10px;border-radius:8px;'
            f'background:{k["field"] if "field" in k else k["card"]};box-shadow:inset 0 0 0 1px {k["input"]};font-size:13px;color:{k["mfg"]};">'
            f'{ic("busca", 14)}{T(ph)}</span>')


# ── O minimapa da trilha ──
# O mapa grande em miniatura, para os cartões do topo de Trilhas: as mesmas regiões, o caminho (feito
# cheio, o que falta pontilhado), as estações e as bandeiras; a etapa de agora com o halo e o balão.
# Antes de começar, tudo vazado e "comece aqui" na primeira.
MINI = [(22, 104), (74, 58), (128, 104), (182, 70), (238, 106), (292, 56), (346, 100), (398, 50)]


def _minimapa(k, sufixo, atual, comeco=False):
    w, h = 420, 140
    regioes = ''
    for x0, x1, rot in ((6, 150, 'r1'), (158, 312, 'r2'), (320, 414, 'r3')):
        regioes += (f'<rect x="{x0}" y="22" width="{x1 - x0}" height="110" rx="18" style="fill:color-mix(in oklch, var(--pri) 5%, transparent);'
                    f'stroke:color-mix(in oklch, var(--pri) 18%, transparent);stroke-dasharray:2 5;"/>')

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
               + (f'<path d="{curva(MINI[:atual + 1])}" style="fill:none;stroke:var(--pri);stroke-width:2.5;stroke-linecap:round;"/>' if atual else ''))
    nos = ''
    for n, (x, y) in enumerate(MINI):
        if n < atual:
            nos += (f'<circle cx="{x}" cy="{y}" r="7" style="fill:var(--pri);"/>'
                    f'<path d="M{x - 3},{y} l2,2 l4,-4.5" style="fill:none;stroke:var(--prifg);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;"/>')
        elif n == atual:
            nos += (f'<circle cx="{x}" cy="{y}" r="16" style="fill:color-mix(in oklch, var(--pri) 12%, transparent);"/>'
                    f'<circle cx="{x}" cy="{y}" r="8" style="fill:var(--card);stroke:var(--pri);stroke-width:2.5;"/>')
        else:
            nos += f'<circle cx="{x}" cy="{y}" r="5" style="fill:var(--card);stroke:var(--input);stroke-width:1.4;"/>'
        if n in (5, 7):
            nos += (f'<g transform="translate({x + 7},{y + 2})"><path d="M0,0 V-15" style="stroke:var(--fgs);stroke-width:1.2;"/>'
                    f'<path d="M0,-15 h9 l-2,3.5 l2,3.5 h-9 z" style="fill:var(--accent);stroke:var(--fgs);stroke-width:1;stroke-linejoin:round;"/></g>')
    x, y = MINI[atual]
    txt = T('miniComece' if comeco else 'miniAqui')
    largura_balao = 92
    bx = min(max(x - largura_balao / 2, 2), w - largura_balao - 2)
    # o balão é HTML por cima do SVG: o canvas não preenche {{t.…}} dentro de <text>
    seta = f'<path d="M{x - 4},{y - 18} l4,5 l4,-5 z" style="fill:var(--fgs);"/>'
    balao = (f'<span style="position:absolute;left:{bx / w * 100:.2f}%;top:{y - 38}px;width:{largura_balao}px;height:20px;border-radius:10px;'
             f'background:{k["fgs"]};color:{k["bg"]};display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:600;'
             f'white-space:nowrap;">{txt}</span>')
    svg_ = (f'<span style="position:relative;display:block;">'
            f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" role="img" aria-label="{T("miniTit")}: {atual}/8" style="display:block;">'
            f'{regioes}{caminho}{nos}{seta}</svg>{balao}</span>')
    return (f'<a href="Trilha{sufixo}.dc.html" style="width:440px;flex:0 0 auto;display:flex;flex-direction:column;gap:4px;padding:12px 14px 6px;border-radius:12px;'
            f'background:{k["rail"]};box-shadow:inset 0 0 0 1px {k["border"]};color:inherit;">'
            f'<span style="display:flex;align-items:center;">{rotulo(T("miniTit"), k["mfg"], 9.5)}'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:500;color:{k["pri"]};">{T("miniVer")}{ic("seta", 12)}</span></span>'
            f'{svg_}</a>')


# ── Trilhas ──
TRILHAS_DADOS = [
    # título, texto, competência, nível de/até (1 Fundamentos, 2 Junior, 3 Pleno, 4 Senior), etapas, feitas, horas, pro, para você
    ('t1', 't1Txt', 'Testing', (3, 4), 8, 3, 3, False, True),
    ('t2', 't2Txt', 'Debugging', (3, 4), 6, 1, 2, False, True),
    ('t3', 't3Txt', 'TypeScript', (3, 4), 7, 0, 3, False, False),
    ('t4', 't4Txt', 'APIs', (3, 4), 6, 0, 2, False, False),
    ('t5', 't5Txt', 'Architecture', (2, 3), 9, 0, 4, True, False),
    ('t6', 't6Txt', 'Security', (3, 4), 5, 0, 2, True, False),
]


def tela_trilhas(k, sufixo):
    cab = cabecalho(k, None, T('tTitulo'), T('tSub'))
    destaque = cartao(
        f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("continuar"), k["mfg"])}'
        f'<span style="margin-left:auto;">{badge("Testing", k, "blue")}</span></div>'
        f'<div style="display:flex;align-items:stretch;gap:28px;">'
        f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
        f'<span style="font-size:13px;color:{k["mfg"]};">{T("t1")} · {T("proxEtapa")}</span>'
        f'<h2 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("e1")}</h2>'
        f'<p style="margin:0;font-size:13.5px;color:{k["mfg"]};">{T("e1Txt")}</p>'
        f'<div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;gap:20px;">'
        f'{botao_link(T("continuarBtn"), f"Trilha{sufixo}.dc.html", k, "solid", 40, "seta")}'
        f'<span style="width:200px;">{_progresso(k, 3, 8)}</span></div></div>'
        f'{_minimapa(k, sufixo, 3)}</div>',
        k, pad='20px 24px', extra='gap:12px;')
    filtros = ('<div style="display:flex;gap:8px;">' + _chip_filtro(k, T('filtroTodas'), True) + _chip_filtro(k, T('filtroAndamento'))
               + _chip_filtro(k, T('filtroRecomendadas')) + _chip_filtro(k, T('filtroFeitas')) + '</div>')

    def card(tit, txt, comp, niveis, etapas, feitas, horas, pro, pra_voce):
        de, ate = niveis
        topo_ = (f'<div style="display:flex;align-items:center;gap:8px;">{badge(comp, k, "blue")}'
                 + (badge(T('recomendada'), k, 'green', ponto=True) if pra_voce else '')
                 + (f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;color:{k["mfg"]};">{ic("cadeado", 12)}{T("so_pro")}</span>' if pro else '')
                 + '</div>')
        niv = (f'<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:{k["mfg"]};">{escala(ate, k, 14)}'
               f'{NIVEIS[de - 1]} → {NIVEIS[ate - 1]}</span>')
        pe = (_progresso(k, feitas, etapas) if feitas else
              f'<span style="display:flex;align-items:center;justify-content:space-between;width:100%;font-size:12.5px;color:{k["mfg"]};">'
              f'<span>{etapas} {T("etapas")} · {horas} {T("horas")}</span>'
              f'<span style="font-weight:500;color:{k["mfg"] if pro else k["pri"]};">{T("comecar")}</span></span>')
        href_ = f'Trilha{sufixo}.dc.html' if tit == 't1' else '#'
        return (f'<a href="{href_}" style="display:flex;flex-direction:column;gap:10px;padding:18px 20px;border-radius:12px;background:{k["card"]};'
                f'box-shadow:{k["sombra"]};color:inherit;min-width:0;{"opacity:0.85;" if pro else ""}">{topo_}'
                f'<div style="display:flex;flex-direction:column;gap:4px;"><span style="font-size:16px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T(txt)}</span></div>'
                f'{niv}<div style="margin-top:auto;padding-top:4px;">{pe}</div></a>')
    grade = ('<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">'
             + ''.join(card(*d) for d in TRILHAS_DADOS) + '</div>')
    return app(k, 'trilhas', cab + destaque + filtros + grade, gap=20)


# ── Uma trilha ──
ETAPAS = [
    # título, tipo, minutos, estado, nota
    ('s1', 'leitura', 8, 'feita', None),
    ('s2', 'exercicio', 20, 'feita', 'B+'),
    ('s3', 'exercicio', 25, 'feita', 'C'),
    ('s4', 'exercicio', 25, 'agora', None),
    ('s5', 'exercicio', 30, 'depois', None),
    ('s6', 'exercicio', 20, 'depois', None),
    ('s7', 'leitura', 10, 'depois', None),
    ('s8', 'exercicio', 35, 'depois', None),
]


def tela_trilha(k, sufixo):
    cab = cabecalho(k, [(T('tTitulo'), f'Trilhas{sufixo}.dc.html'), (T('dTitulo'), '')], T('dTitulo'), T('dSub'),
                    direita=botao(T('sair'), k, 'ghost', 32))
    passos = ''
    for n, (tit, tipo, mins, estado, nota) in enumerate(ETAPAS):
        feita, agora = estado == 'feita', estado == 'agora'
        bola = (f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;flex:0 0 auto;'
                + (f'background:{k["pri"]};color:{k["prifg"]};">{ic("check", 13)}' if feita else
                   f'background:{k["card"]};box-shadow:0 0 0 2px {k["pri"]};color:{k["pri"]};font-family:{MONO};font-size:11px;font-weight:600;">{n + 1}' if agora else
                   f'background:{k["sunken"]};color:{k["mfg"]};font-family:{MONO};font-size:11px;">{n + 1}') + '</span>')
        fio = (f'<span style="flex:1;width:2px;min-height:12px;background:{k["pri"] if feita else k["muted"]};"></span>'
               if n < len(ETAPAS) - 1 else '')
        meta = (f'<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:{k["mfg"]};">'
                f'{ic("arquivo" if tipo == "leitura" else "exercicios", 12)}{T("leitura" if tipo == "leitura" else "exercicio")} · {mins} {T("min")}'
                + (f' · {T("nota")} <b style="font-weight:600;color:{k["fgs"]};">{nota}</b>' if nota else '') + '</span>')
        corpo_ = (f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;padding-bottom:14px;">'
                  f'<span style="font-size:14px;font-weight:{600 if agora else 500};color:{k["fgs"] if estado != "depois" else k["mfg"]};">{T(tit)}</span>{meta}'
                  + (f'<div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:10px;background:{k["prisub"]};">'
                     f'<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:{k["prisubfg"]};">{ic("recarregar", 13)}{T("repetiu")}</span>'
                     f'<span style="font-size:13px;line-height:19px;color:{k["fg"]};">{T("repetiuTxt")}</span>'
                     f'<div>{botao_link(T("comecar"), f"Exercicio{sufixo}.dc.html", k, "solid", 36, "seta")}</div></div>' if agora else '')
                  + '</div>')
        passos += (f'<div style="display:flex;gap:14px;"><div style="display:flex;flex-direction:column;align-items:center;gap:4px;">{bola}{fio}</div>'
                   f'{corpo_}</div>')
    caminho = cartao(f'<div style="display:flex;align-items:center;">{rotulo(T("mapa"), k["mfg"])}<span style="margin-left:auto;">{_vista(k, sufixo, "lista")}</span></div>'
                     f'<div style="display:flex;flex-direction:column;">{passos}</div>',
                     k, pad='20px 24px', extra='flex:1.7;min-width:0;gap:16px;')

    linha_nivel = lambda rot, n, extra='': (f'<div style="display:flex;align-items:center;gap:10px;">'
                                            f'<span style="width:84px;font-size:12.5px;color:{k["mfg"]};">{rot}</span>{escala(n, k, 18)}'
                                            f'<span style="font-size:12.5px;color:{k["fgs"]};">{NIVEIS[n - 1]}</span>{extra}</div>')
    nivel = cartao(f'{rotulo(T("seuNivel"), k["mfg"])}'
                   + linha_nivel(T('declarado'), 3) + linha_nivel(T('observado'), 3, badge(T('aConfirmar'), k, 'yellow'))
                   + f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("nivelTxt")}</p>',
                   k, pad='18px 22px', extra='gap:12px;')
    conta_ = cartao(f'{rotulo(T("conta"), k["mfg"])}'
                    f'<div style="display:flex;gap:6px;">{badge("Testing", k, "blue")}{badge("Debugging", k)}</div>'
                    f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("contaTxt")}</p>',
                    k, pad='18px 22px', extra='gap:12px;')
    lado = f'<div style="display:flex;flex-direction:column;gap:16px;flex:1;min-width:0;">{nivel}{conta_}</div>'
    return app(k, 'trilhas', cab + f'<div style="display:flex;gap:16px;align-items:flex-start;">{caminho}{lado}</div>', gap=20)


# ── Catálogo de exercícios ──
EXERCICIOS = [
    # título, competências, nível, linguagem, minutos, estado (novo, andamento, feito, pro), nota, da trilha
    ('x1', ['Testing'], 'Pleno', 'TypeScript', 25, 'andamento', None, True),
    ('x2', ['Testing', 'Debugging'], 'Pleno', 'TypeScript', 20, 'feito', 'C', True),
    ('x3', ['Debugging'], 'Pleno', 'Python', 30, 'novo', None, False),
    ('x4', ['APIs', 'Databases'], 'Senior', 'TypeScript', 35, 'novo', None, False),
    ('x5', ['Security'], 'Pleno', 'Go', 25, 'pro', None, False),
    ('x6', ['TypeScript'], 'Senior', 'TypeScript', 20, 'feito', 'A', False),
    ('x7', ['APIs'], 'Pleno', 'Python', 30, 'novo', None, False),
    ('x8', ['Databases'], 'Senior', 'Go', 40, 'pro', None, False),
]


def tela_catalogo(k, sufixo):
    uso = (f'<div style="display:flex;flex-direction:column;gap:6px;width:220px;">'
           f'<span style="display:flex;justify-content:space-between;font-size:12.5px;color:{k["mfg"]};">'
           f'<span>{T("uso")}</span><span style="font-family:{MONO};color:{k["fgs"]};">37 {T("usoDe")} 100</span></span>'
           f'<span style="display:block;height:6px;border-radius:3px;background:{k["sunken"]};">'
           f'<span style="display:block;height:6px;width:37%;border-radius:3px;background:{k["pri"]};"></span></span></div>')
    cab = cabecalho(k, None, T('cTitulo'), T('cSub'), direita=uso)
    barra = (f'<div style="display:flex;align-items:center;gap:8px;">{_busca(k, "busca")}'
             f'{_filtro(k, T("fCompetencia"))}{_filtro(k, T("fNivel"))}{_filtro(k, T("fLinguagem"))}</div>')
    abas = ''.join(
        f'<span role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:6px;height:36px;font-size:13px;'
        + (f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};')
        + f'">{T(n)}<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{c}</span></span>'
        for n, c, at in [('abaTodos', 48, True), ('abaParaVoce', 6, False), ('abaAndamento', 1, False), ('abaFeitos', 9, False)])
    abas = f'<div role="tablist" style="display:flex;gap:20px;box-shadow:inset 0 -1px 0 {k["muted"]};">{abas}</div>'
    cols = 'minmax(0,1fr) 190px 70px 100px 60px 196px'
    linhas = ''
    for i, (tit, comps, nivel, lg, mins, estado, nota, trilha_) in enumerate(EXERCICIOS):
        selo = {'novo': badge(T('novo'), k, 'gray'), 'andamento': badge(T('andamento'), k, 'blue', ponto=True),
                'feito': badge(T('feito') + f' · {nota}', k, 'green', ponto=True),
                'pro': f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:{k["mfg"]};">{ic("cadeado", 12)}{T("proBloq")}</span>'}[estado]
        acao = {'novo': T('abrir'), 'andamento': T('continuar'), 'feito': T('refazer'), 'pro': T('verPro')}[estado]
        href_ = {'andamento': f'Exercicio{sufixo}.dc.html', 'pro': f'Planos{sufixo}.dc.html'}.get(estado, f'Exercicio{sufixo}.dc.html')
        linhas += (f'<a href="{href_}" style="display:grid;grid-template-columns:{cols};gap:14px;align-items:center;min-height:56px;padding:0 18px;'
                   f'box-shadow:inset 0 -1px 0 {k["muted"]};color:inherit;{"background:" + k["rail"] + ";" if i == 0 else ""}">'
                   f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0;">'
                   f'<span style="font-size:14px;font-weight:500;color:{k["fgs"] if estado != "pro" else k["mfg"]};">{T(tit)}</span>'
                   + (f'<span style="font-size:12px;color:{k["mfg"]};">{T("daTrilha")} · {T("t1")}</span>' if trilha_ else '')
                   + f'</span><span style="display:flex;gap:6px;flex-wrap:wrap;">{"".join(badge(c, k, "blue" if c == "Testing" else "gray") for c in comps)}</span>'
                   f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("pleno") if nivel == "Pleno" else nivel}</span>'
                   f'<span style="display:flex;">{badge(lg, k, mono=True)}</span>'
                   f'<span style="font-family:{MONO};font-size:12px;color:{k["mfg"]};">{mins} min</span>'
                   f'<span style="display:flex;align-items:center;justify-content:space-between;gap:8px;">{selo}'
                   f'<span style="font-size:12.5px;font-weight:500;color:{k["pri"] if estado != "pro" else k["mfg"]};">{acao}</span></span></a>')
    lista = (f'<section style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;display:flex;flex-direction:column;">'
             f'{linhas}</section>')
    return app(k, 'exercicios', cab + barra + abas + lista, gap=18)


# ── Peer na web ──
CONVERSAS = [('hoje', [('c1', 'pExercicios', '14:02', True), ('c2', 'pExercicios', '11:40', False)]),
             ('ontem', [('c3', 'pExercicios', '18:15', False), ('c4', 'pApi', '10:22', False)]),
             ('semana', [('c5', 'pApi', 'seg', False)])]


def tela_peer_web(k, sufixo):
    cab = cabecalho(k, None, T('pTitulo'), T('pSub'))
    lista = ''
    for grupo, itens in CONVERSAS:
        lista += f'<div style="padding:12px 14px 4px;">{rotulo(T(grupo), k["mfg"], 9.5)}</div>'
        for tit, proj, hora, at in itens:
            lista += (f'<div style="display:flex;flex-direction:column;gap:3px;padding:9px 14px;margin:0 6px;border-radius:9px;'
                      + (f'background:{k["prisub"]};' if at else '') + '">'
                      f'<span style="font-size:13px;font-weight:{500 if at else 400};color:{k["prisubfg"] if at else k["fgs"]};'
                      f'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{T(tit)}</span>'
                      f'<span style="display:flex;justify-content:space-between;font-size:11.5px;color:{k["mfg"]};"><span>{T(proj)}</span>'
                      f'<span style="font-family:{MONO};">{hora}</span></span></div>')
    conversas = (f'<section aria-label="{T("conversas")}" style="width:270px;flex:0 0 270px;background:{k["card"]};border-radius:12px;'
                 f'box-shadow:{k["sombra"]};display:flex;flex-direction:column;padding-bottom:8px;">'
                 f'<div style="padding:14px 14px 4px;font-size:14px;font-weight:600;color:{k["fgs"]};">{T("conversas")}</div>{lista}</section>')

    def fala(quem, txt, extra=''):
        peer = quem == 'peer'
        av = (f'<span style="display:flex;width:26px;height:26px;flex:0 0 auto;">{LOGO}</span>' if peer else
              f'<span style="width:26px;height:26px;flex:0 0 auto;border-radius:999px;background:{k["tgreen"]};color:{k["tgreenfg"]};'
              f'display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:600;">RM</span>')
        return (f'<div style="display:flex;gap:10px;align-items:flex-start;">{av}'
                f'<div style="display:flex;flex-direction:column;gap:8px;max-width:78%;">'
                f'<span style="padding:10px 14px;border-radius:12px;font-size:13.5px;line-height:20px;'
                + (f'background:{k["sunken"]};color:{k["fg"]};' if peer else f'background:{k["prisub"]};color:{k["fg"]};')
                + f'">{T(txt)}</span>{extra}</div></div>')
    trecho = (f'<div style="border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1px {k["border"]};">'
              f'<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:{k["rail"]};font-size:11.5px;color:{k["mfg"]};">'
              f'{ic("arquivo", 12)}<span style="font-family:{MONO};">duracao.test.ts:42</span><span style="margin-left:auto;">{T("trecho")}</span></div>'
              f'<pre style="margin:0;padding:10px 12px;font-family:{MONO};font-size:12px;line-height:18px;color:{k["fg"]};background:{k["card"]};">'
              f'it("usa o fuso de São Paulo", () =&gt; {{\n  process.env.TZ = "America/Sao_Paulo"\n  expect(emMinutos("1h30")).toBe(90)\n}})</pre></div>')
    evid = (f'<span style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:12px;color:{k["mfg"]};">'
            f'{ic("evolucao", 12)}{T("evidencia")}</span>')
    compositor = (f'<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;">'
                  f'<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 6px 0 14px;border-radius:12px;'
                  f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};">'
                  f'<span style="flex:1;font-size:13.5px;color:{k["mfg"]};">{T("perguntar")}</span>'
                  f'{botao(T("enviar"), k, "solid", 32, "enviar")}</div>'
                  f'<span style="font-size:12px;color:{k["mfg"]};">{T("perguntarNota")}</span></div>')
    conversa = (f'<section aria-label="{T("c1")}" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
                f'padding:18px 22px;display:flex;flex-direction:column;gap:14px;">'
                f'<div style="display:flex;align-items:center;gap:10px;"><h2 style="margin:0;font-size:15px;font-weight:600;color:{k["fgs"]};">{T("c1")}</h2>'
                f'<span style="margin-left:auto;">{badge(T("pExercicios"), k, mono=True)}</span></div>'
                + fala('peer', 'm1', trecho) + fala('eu', 'm2') + fala('peer', 'm3') + fala('eu', 'm4') + fala('peer', 'm5', evid)
                + compositor + '</section>')

    def projeto(nome, ligado, padrao=False):
        chave = (f'<span style="width:30px;height:18px;border-radius:999px;padding:2px;display:flex;flex:0 0 auto;'
                 f'justify-content:{"flex-end" if ligado else "flex-start"};background:{k["pri"] if ligado else k["sunken"]};">'
                 f'<span style="width:14px;height:14px;border-radius:999px;background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span></span>')
        return (f'<div style="display:flex;align-items:center;gap:10px;height:34px;">{ic("pasta", 14, k["mfg"])}'
                f'<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:{MONO};font-size:12px;'
                f'color:{k["fgs"] if ligado else k["mfg"]};">{T(nome)}</span>'
                + (f'<span style="font-size:11px;color:{k["mfg"]};">{T("padrao")}</span>' if padrao else '') + f'{chave}</div>')
    onde = cartao(f'{rotulo(T("projetos"), k["mfg"])}'
                  f'<div style="display:flex;flex-direction:column;">{projeto("pExercicios", True, True)}{projeto("pApi", True)}{projeto("sitePessoal", False)}</div>'
                  f'<p style="margin:0;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("projetosTxt")}</p>', k, pad='16px 18px', extra='gap:10px;')
    uso = cartao(f'{rotulo(T("usoPeer"), k["mfg"])}'
                 f'<span style="font-size:22px;font-weight:600;color:{k["fgs"]};font-variant-numeric:tabular-nums;">214 '
                 f'<span style="font-size:13px;font-weight:400;color:{k["mfg"]};">{T("usoDe")} 500</span></span>'
                 f'<span style="display:block;height:6px;border-radius:3px;background:{k["sunken"]};">'
                 f'<span style="display:block;height:6px;width:43%;border-radius:3px;background:{k["pri"]};"></span></span>', k, pad='16px 18px', extra='gap:8px;')
    ide = cartao(f'<div style="display:flex;align-items:center;gap:10px;">{ic("laptop", 16, k["ok"])}'
                 f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{T("ide")}</span>'
                 f'<span style="font-size:12px;color:{k["mfg"]};">{T("ideTxt")}</span></span>'
                 f'<a href="Conectar{sufixo}.dc.html" style="font-size:12.5px;">{T("gerenciar")}</a></div>', k, pad='14px 18px')
    lado = f'<div style="width:290px;flex:0 0 290px;display:flex;flex-direction:column;gap:14px;">{onde}{uso}{ide}</div>'
    return app(k, 'peer', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{conversas}{conversa}{lado}</div>', gap=20)


def _lado_trilha(k):
    # o nível na competência e o que a trilha conta: o mesmo lado no mapa e na lista
    linha_nivel = lambda rot, n, extra='': (f'<div style="display:flex;align-items:center;gap:10px;">'
                                            f'<span style="width:84px;font-size:12.5px;color:{k["mfg"]};">{rot}</span>{escala(n, k, 18)}'
                                            f'<span style="font-size:12.5px;color:{k["fgs"]};">{NIVEIS[n - 1]}</span>{extra}</div>')
    nivel = cartao(f'{rotulo(T("seuNivel"), k["mfg"])}'
                   + linha_nivel(T('declarado'), 3) + linha_nivel(T('observado'), 3, badge(T('aConfirmar'), k, 'yellow'))
                   + f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("nivelTxt")}</p>',
                   k, pad='18px 22px', extra='gap:12px;')
    conta_ = cartao(f'{rotulo(T("conta"), k["mfg"])}'
                    f'<div style="display:flex;gap:6px;">{badge("Testing", k, "blue")}{badge("Debugging", k)}</div>'
                    f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("contaTxt")}</p>',
                    k, pad='18px 22px', extra='gap:12px;')
    return nivel, conta_


def _vista(k, sufixo, atual):
    # Mapa | Lista: o mapa é a visão principal; a lista é o mesmo caminho em linha
    op = lambda chave, destino: (f'<a href="{destino}" style="display:inline-flex;align-items:center;height:26px;padding:0 12px;border-radius:999px;'
                                 f'font-size:12px;font-weight:500;'
                                 + (f'background:{k["card"]};color:{k["pri"]};box-shadow:0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px {k["input"]};'
                                    if atual == chave else f'color:{k["mfg"]};')
                                 + f'">{T("vMapa" if chave == "mapa" else "vLista")}</a>')
    return (f'<span role="navigation" style="display:inline-flex;padding:2px;border-radius:999px;background:{k["sunken"]};'
            f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};">'
            + op('mapa', f'Trilha{sufixo}.dc.html') + op('lista', f'TrilhaLista{sufixo}.dc.html') + '</span>')


# as estações do mapa num quadro de 1100 × 360: da esquerda para a direita, subindo e descendo como
# uma trilha; os nomes se alternam em duas alturas para não se encostarem
ESTACOES = [(80, 250), (210, 140), (345, 250), (480, 180), (620, 250), (755, 140), (880, 250), (990, 140)]
ROTULO_EM_CIMA = [False, True, False, False, False, True, False, True]
REGIOES = [('r1', 210, 205, 400, 280), ('r2', 618, 205, 400, 280), ('r3', 950, 205, 250, 280)]
MARCOS = {5: 'marcoPleno', 7: 'marcoSenior'}


def _curva(ps):
    d = f'M{ps[0][0]:.1f},{ps[0][1]:.1f}'
    for a in range(len(ps) - 1):
        p0 = ps[a - 1] if a > 0 else ps[a]
        p1, p2 = ps[a], ps[a + 1]
        p3 = ps[a + 2] if a + 2 < len(ps) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 5, p1[1] + (p2[1] - p0[1]) / 5)
        c2 = (p2[0] - (p3[0] - p1[0]) / 5, p2[1] - (p3[1] - p1[1]) / 5)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d


def _mapa_svg(k):
    # Um mapa de trilha, parado: três regiões em tom de fundo (os módulos), curvas de nível ao fundo, o
    # caminho feito cheio e o que falta pontilhado, as estações (feitas com o check, a de agora com o
    # halo e o "você está aqui", as próximas vazadas) e a bandeira amarela nos marcos de nível.
    w, h = 1100, 360
    fundo = ''.join(f'<path d="M-20,{y} C220,{y - 40} 420,{y + 45} 640,{y - 10} S980,{y - 45} 1120,{y - 15}" '
                    f'style="fill:none;stroke:var(--muted);stroke-width:1;opacity:0.8;"/>' for y in (40, 110, 180, 250, 320))
    # Os textos (nomes, regiões, você está aqui) são HTML por cima do SVG, posicionados em % do quadro:
    # o canvas não preenche {{t.…}} dentro de <text>. O SVG fica só com formas e números.
    textos = []

    def texto(x, y, conteudo, estilo, ancora='middle'):
        tx = {'middle': '-50%', 'start': '0', 'end': '-100%'}[ancora]
        textos.append(f'<span style="position:absolute;left:{x / w * 100:.2f}%;top:{y / h * 100:.2f}%;transform:translate({tx},-78%);'
                      f'white-space:nowrap;{estilo}">{conteudo}</span>')
    halo = f'text-shadow:0 0 3px {k["card"]}, 0 0 3px {k["card"]}, 0 0 3px {k["card"]};'
    regioes = ''
    for chave, cx, cy, rw, rh in REGIOES:
        # o nome da região fica embaixo, à esquerda, longe dos nomes das estações
        regioes += (f'<rect x="{cx - rw / 2}" y="{cy - rh / 2}" width="{rw}" height="{rh}" rx="40" style="fill:color-mix(in oklch, var(--pri) 5%, transparent);'
                    f'stroke:color-mix(in oklch, var(--pri) 20%, transparent);stroke-dasharray:2 6;"/>')
        texto(cx - rw / 2 + 24, cy + rh / 2 - 16, T(chave),
              f'color:{k["mfg"]};font-family:{MONO};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;', 'start')
    atual = 3
    caminho = (f'<path d="{_curva(ESTACOES)}" style="fill:none;stroke:var(--card);stroke-width:10;stroke-linecap:round;"/>'
               f'<path d="{_curva(ESTACOES[atual:])}" style="fill:none;stroke:var(--input);stroke-width:2.5;stroke-dasharray:1 7;stroke-linecap:round;"/>'
               f'<path d="{_curva(ESTACOES[:atual + 1])}" style="fill:none;stroke:var(--pri);stroke-width:3;stroke-linecap:round;"/>')
    nos = ''
    for n, ((x, y), (tit, tipo, mins, estado, nota), cima) in enumerate(zip(ESTACOES, ETAPAS, ROTULO_EM_CIMA)):
        if estado == 'feita':
            no = (f'<circle cx="{x}" cy="{y}" r="13" style="fill:var(--pri);"/>'
                  f'<path d="M{x - 5},{y} l3.5,3.5 l6.5,-7" style="fill:none;stroke:var(--prifg);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"/>')
        elif estado == 'agora':
            no = (f'<circle cx="{x}" cy="{y}" r="30" style="fill:color-mix(in oklch, var(--pri) 9%, transparent);"/>'
                  f'<circle cx="{x}" cy="{y}" r="21" style="fill:color-mix(in oklch, var(--pri) 15%, transparent);"/>'
                  f'<circle cx="{x}" cy="{y}" r="14" style="fill:var(--card);stroke:var(--pri);stroke-width:3;"/>'
                  f'<text x="{x}" y="{y + 4}" text-anchor="middle" style="fill:var(--pri);font-family:{MONO};font-size:11px;font-weight:600;">{n + 1}</text>')
        else:
            no = (f'<circle cx="{x}" cy="{y}" r="11" style="fill:var(--card);stroke:var(--input);stroke-width:1.5;"/>'
                  f'<text x="{x}" y="{y + 4}" text-anchor="middle" style="fill:var(--mfg);font-family:{MONO};font-size:10.5px;">{n + 1}</text>')
        if n in MARCOS:
            # a bandeira do marco de nível, presa na estação
            no += (f'<g transform="translate({x + 14},{y + 6})"><path d="M0,0 V-22" style="stroke:var(--fgs);stroke-width:1.4;"/>'
                   f'<path d="M0,-22 h14 l-3.5,5 l3.5,5 h-14 z" style="fill:var(--accent);stroke:var(--fgs);stroke-width:1.1;stroke-linejoin:round;"/></g>')
        cor = k['fgs'] if estado != 'depois' else k['mfg']
        sub = f'{T("nota")} {nota}' if nota else f'{mins} {T("min")}'
        linhas = [(f'{T(tit)}', f'color:{cor};font-size:12px;font-weight:{600 if estado == "agora" else 500};'),
                  (sub, f'color:{k["mfg"]};font-family:{MONO};font-size:10.5px;')]
        if n in MARCOS:
            linhas.append((T(MARCOS[n]), f'color:{k["fgs"]};font-size:11px;font-weight:600;'))
        base_y = y - 30 - 15 * (len(linhas) - 1) if cima else y + (46 if estado == 'agora' else 32)
        # o halo da cor do cartão: o nome continua legível quando o caminho passa por baixo
        for i, (t, est) in enumerate(linhas):
            texto(x, base_y + 15 * i, t, est + halo)
        nos += f'<g>{no}</g>'
    x, y = ESTACOES[atual]
    aqui = (f'<g transform="translate({x},{y - 44})"><rect x="-58" y="-26" width="116" height="24" rx="12" style="fill:var(--fgs);"/>'
            f'<path d="M-6,-2 l6,7 l6,-7 z" style="fill:var(--fgs);"/></g>')
    texto(x, y - 54, T('vcAqui'), f'color:{k["bg"]};font-size:11.5px;font-weight:600;')
    return (f'<div style="position:relative;width:100%;aspect-ratio:{w} / {h};">'
            f'<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img" aria-label="{T("mapa")}: 3/8" style="position:absolute;inset:0;">'
            f'{fundo}{regioes}{caminho}{nos}{aqui}</svg>{"".join(textos)}</div>')


def tela_trilha_mapa(k, sufixo):
    cab = cabecalho(k, [(T('tTitulo'), f'Trilhas{sufixo}.dc.html'), (T('dTitulo'), '')], T('dTitulo'), T('dSub'),
                    direita=botao(T('sair'), k, 'ghost', 32))
    mapa = cartao(f'<div style="display:flex;align-items:center;">{rotulo(T("mapa"), k["mfg"])}<span style="margin-left:auto;">{_vista(k, sufixo, "mapa")}</span></div>'
                  f'<div style="margin:0 -6px;">{_mapa_svg(k)}</div>', k, pad='18px 22px 10px', extra='gap:2px;')
    agora = cartao(f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("agoraTit"), k["mfg"])}'
                   f'<span style="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:12px;color:{k["prisubfg"]};">{ic("recarregar", 13)}{T("repetiu")}</span></div>'
                   f'<span style="font-size:17px;font-weight:600;color:{k["fgs"]};">{T("s4")}</span>'
                   f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T("repetiuTxt")}</span>'
                   f'<div style="margin-top:auto;">{botao_link(T("comecar"), f"Exercicio{sufixo}.dc.html", k, "solid", 38, "seta")}</div>',
                   k, pad='16px 22px', extra='gap:8px;flex:1.4;min-width:0;')
    linha_nivel = lambda rot, n, extra='': (f'<div style="display:flex;align-items:center;gap:10px;">'
                                            f'<span style="width:84px;font-size:12.5px;color:{k["mfg"]};">{rot}</span>{escala(n, k, 18)}'
                                            f'<span style="font-size:12.5px;color:{k["fgs"]};">{NIVEIS[n - 1]}</span>{extra}</div>')
    nivel = cartao(f'{rotulo(T("seuNivel"), k["mfg"])}'
                   + linha_nivel(T('declarado'), 3) + linha_nivel(T('observado'), 3, badge(T('aConfirmar'), k, 'yellow'))
                   + f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("nivelTxt")}</p>'
                   f'<div style="display:flex;align-items:center;gap:8px;padding-top:10px;box-shadow:inset 0 1px 0 {k["muted"]};">'
                   f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("conta")}</span><span style="flex:1;"></span>'
                   f'{badge("Testing", k, "blue")}{badge("Debugging", k)}</div>',
                   k, pad='16px 22px', extra='gap:10px;flex:1;min-width:0;')
    embaixo = f'<div style="display:flex;gap:16px;align-items:stretch;">{agora}{nivel}</div>'
    return app(k, 'trilhas', cab + mapa + embaixo, gap=18)


# ── Boas-vindas às trilhas ──
CSS_SPLASH = (
    '\n@keyframes mc-splash-in{from{opacity:0;transform:translateY(14px) scale(0.96);}to{opacity:1;transform:none;}}'
    '\n@keyframes mc-veu-in{from{opacity:0;}to{opacity:1;}}'
    '\n@keyframes mc-flutua{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-6px) rotate(-4deg);}}'
    '\n@keyframes mc-chip-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}'
    '\n.mc .splash-veu{animation:mc-veu-in .35s ease-out both;}'
    '\n.mc .splash-modal{animation:mc-splash-in .5s cubic-bezier(.2,.8,.2,1) .08s both;}'
    '\n.mc .splash-mascote{animation:mc-flutua 3.2s ease-in-out .6s infinite;}'
    '\n.mc .splash-chip{animation:mc-chip-in .45s ease-out both;}'
    '\n@media (prefers-reduced-motion: reduce){.mc .splash-veu,.mc .splash-modal,.mc .splash-mascote,.mc .splash-chip{animation:none;}}')

ANTES_BOAS_VINDAS = """const bvP = String(s.passo || this.props.passo || "1");
const bv = { p1: bvP === "1", p2: bvP === "2", p3: bvP === "3", naoP1: bvP !== "1", naoP3: bvP !== "3",
  s2: bvP === "1" ? "var(--sunken)" : "var(--pri)", s3: bvP === "3" ? "var(--pri)" : "var(--sunken)" };"""
VALORES_BOAS_VINDAS = ('bv: bv,\nbvProximo: () => this.setState({ passo: String(Math.min(3, Number(bvP) + 1)) }),\n'
                       'bvVoltar: () => this.setState({ passo: String(Math.max(1, Number(bvP) - 1)) })')
PROPS_BOAS_VINDAS = {'passo': {'editor': 'enum', 'options': ['1', '2', '3'], 'default': '1'}}


def tela_trilha_boas_vindas(k, sufixo):
    h = lambda caminho: '{{' + caminho + '}}'
    se = lambda chave, html, padrao=False: (f'<sc-if value="{h("bv." + chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                            f'{html}</sc-if>')
    fundo = tela_trilhas(k, sufixo)
    assert fundo.endswith('</div>')

    # o splash: a atmosfera da marca, o mascote flutuando e as tecnologias em volta, entrando uma a uma
    # em ladrilhos brancos (lê igual nos dois temas); as da pessoa (TypeScript e Python) vêm maiores
    marcas = [('ts', 170, 44, 40), ('py', 404, 40, 40), ('js', 96, 92, 32), ('go', 470, 104, 32), ('docker', 36, 34, 30),
              ('postgres', 540, 36, 30), ('rust', 118, 20, 26), ('ruby', 556, 116, 26), ('mysql', 30, 126, 28), ('aws', 330, 128, 32)]
    chips = ''.join(
        f'<span class="splash-chip" title="{nome_marca(c)}" style="animation-delay:{0.4 + 0.07 * i:.2f}s;position:absolute;left:{x}px;top:{y}px;'
        f'width:{t}px;height:{t}px;display:flex;align-items:center;justify-content:center;border-radius:{t * 0.28:.0f}px;background:#fff;'
        f'box-shadow:0 6px 16px -6px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06);transform:rotate({[-6, 5, -3, 7, -8, 4, 9, -5, 6, -4][i]}deg);">'
        f'{logo_marca(c, round(t * 0.56))}</span>'
        for i, (c, x, y, t) in enumerate(marcas))
    splash = (f'<div style="position:relative;height:176px;overflow:hidden;'
              f'background:linear-gradient(135deg, color-mix(in oklch, {k["pri"]} 16%, {k["card"]}) 0%, {k["card"]} 55%, '
              f'color-mix(in oklch, {k["accent"]} 30%, {k["card"]}) 100%);">'
              f'<span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:999px;'
              f'background:radial-gradient(circle, color-mix(in oklch, {k["pri"]} 14%, transparent), transparent 70%);"></span>'
              f'<span class="splash-mascote" style="position:absolute;left:50%;top:50%;width:92px;height:92px;margin:-46px 0 0 -46px;display:flex;">{LOGO}</span>'
              f'{chips}</div>')

    def passo(n, chave):
        cor = k['pri'] if n == 1 else h('bv.s' + str(n))
        return (f'<span style="display:flex;flex-direction:column;gap:6px;flex:1;">'
                f'<span style="height:4px;border-radius:999px;background:{cor};"></span>'
                f'<span style="font-size:11.5px;color:{k["mfg"]};">{n}. {T(chave)}</span></span>')
    stepper = f'<div role="list" style="display:flex;gap:10px;">{passo(1, "bvP1")}{passo(2, "bvP2")}{passo(3, "bvP3")}</div>'

    chip = lambda t: (f'<span style="display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;'
                      f'background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;font-weight:500;">{t}</span>')
    chip_marca = lambda c: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px 0 4px;border-radius:999px;'
                            f'background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;font-weight:500;">'
                            f'<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background:#fff;">'
                            f'{logo_marca(c, 12)}</span>{nome_marca(c)}</span>')
    linha = lambda rot, v: (f'<div style="display:flex;align-items:center;gap:12px;"><span style="width:92px;font-size:12.5px;color:{k["mfg"]};">{T(rot)}</span>'
                            f'<span style="display:flex;gap:6px;flex-wrap:wrap;">{v}</span></div>')
    titulo = lambda chave: f'<h2 style="margin:0;font-size:24px;line-height:30px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T(chave)}</h2>'
    texto = lambda chave: f'<p style="margin:0;font-size:14px;color:{k["mfg"]};">{T(chave)}</p>'
    p1 = (titulo('bv1Tit') + texto('bv1Txt')
          + f'<div style="display:flex;flex-direction:column;gap:10px;">'
          + linha('bvExp', chip(T('expContou'))) + linha('bvLing', chip_marca('ts') + chip_marca('py'))
          + linha('bvObj', chip(T('bvAprender')) + chip(T('bvRevisar'))) + '</div>'
          f'<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;background:{k["sunken"]};">'
          f'<span style="display:flex;margin-top:2px;color:{k["pri"]};">{ic("trilhas", 15)}</span>'
          f'<span style="font-size:13.5px;line-height:20px;color:{k["fgs"]};font-weight:500;">{T("bvComeco")}</span></div>')

    def trilha_linha(n, tit, comp, tom, etapas, marca):
        de, ate = next(t[3] for t in TRILHAS_DADOS if t[0] == tit)
        return (f'<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;'
                + (f'box-shadow:inset 0 0 0 1.5px {k["pri"]};background:color-mix(in oklch, {k["pri"]} 5%, {k["card"]});' if n == 1
                   else f'box-shadow:inset 0 0 0 1px {k["border"]};')
                + f'"><span style="font-family:{MONO};font-size:12px;color:{k["mfg"]};width:14px;">{n}</span>'
                f'<span style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">'
                f'<span style="font-size:14px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                f'<span style="font-size:12px;color:{k["mfg"]};">{NIVEIS[de - 1]} → {NIVEIS[ate - 1]} · {etapas} {T("bvEtapas")}</span></span>'
                f'{badge(comp, k, tom)}'
                f'<span style="width:84px;text-align:right;font-size:11.5px;font-weight:{600 if n == 1 else 400};color:{k["pri"] if n == 1 else k["mfg"]};">{T(marca)}</span></div>')
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

    rodape = (f'<div style="display:flex;align-items:center;gap:8px;">'
              f'<a href="Trilhas{sufixo}.dc.html" style="font-size:13.5px;font-weight:500;color:{k["mfg"]};">{T("bvPular")}</a><span style="flex:1;"></span>'
              + se('naoP1', botao(T('bvVoltar'), k, 'ghost', 38, acao='bvVoltar'))
              + se('naoP3', botao(T('bvContinuar'), k, 'solid', 38, 'seta', acao='bvProximo'), True)
              + se('p3', botao_link(T('bvAbrir'), f'Trilha{sufixo}.dc.html', k, 'solid', 38, 'seta')) + '</div>')
    corpo = (f'<div style="display:flex;flex-direction:column;gap:18px;padding:22px 28px 24px;">'
             f'{rotulo(T("bvRotulo"), k["mfg"])}{stepper}'
             f'<div style="display:flex;flex-direction:column;gap:14px;min-height:268px;">'
             + se('p1', p1, True) + se('p2', p2) + se('p3', p3) + f'</div>{rodape}</div>')
    # o véu cobre a tela inteira, o menu junto: desfoca o que está atrás e escurece um pouco
    veu = (f'<div class="splash-veu" style="position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;'
           f'background:color-mix(in oklch, {k["bg"]} 45%, transparent);backdrop-filter:blur(14px) saturate(115%);-webkit-backdrop-filter:blur(14px) saturate(115%);">'
           f'<section role="dialog" aria-modal="true" aria-label="{T("bvRotulo")}" class="splash-modal" style="width:620px;border-radius:18px;background:{k["card"]};'
           f'box-shadow:0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px {k["border"]};overflow:hidden;">{splash}{corpo}</section></div>')
    return fundo[:-6] + veu + '</div>'


def tela_trilhas_vazia(k, sufixo):
    # Nada em andamento ainda: o topo não tem de onde continuar, então vira "por onde começar" — a
    # primeira trilha que as boas-vindas escolheram, com o minimapa do que espera a pessoa — e as
    # recomendadas vêm primeiro, numeradas na ordem, sem barra de progresso
    cab = cabecalho(k, None, T('tTitulo'), T('tSub'))
    destaque = cartao(
        f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("vzRotulo"), k["mfg"])}'
        f'<span style="margin-left:auto;display:flex;gap:6px;">{badge("Testing", k, "blue")}{badge(T("recomendada"), k, "green", ponto=True)}</span></div>'
        f'<div style="display:flex;gap:32px;align-items:stretch;">'
        f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
        f'<span style="font-size:13px;color:{k["mfg"]};">{T("vzPorque")}</span>'
        f'<h2 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("t1")}</h2>'
        f'<p style="margin:0;font-size:13.5px;color:{k["mfg"]};">{T("t1Txt")}</p>'
        f'<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">{escala(4, k, 14)}{NIVEIS[2]} → {NIVEIS[3]} · {T("vzMeta")}</span>'
        f'<div style="display:flex;align-items:center;gap:16px;margin-top:10px;">'
        f'{botao_link(T("vzComecar"), f"Trilha{sufixo}.dc.html", k, "solid", 40, "seta")}'
        f'<a href="TrilhasBoasVindas{sufixo}.dc.html" style="font-size:13px;font-weight:500;">{T("vzRever")}</a></div></div>'
        f'{_minimapa(k, sufixo, 0, comeco=True)}</div>',
        k, pad='20px 24px', extra='gap:14px;')

    def chip(txt, ativo=False, apagado=False, n=None):
        conta = f'<span style="font-family:{MONO};font-size:11px;margin-left:6px;">{n}</span>' if n is not None else ''
        est = (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if ativo
               else f'background:transparent;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};' + ('opacity:0.55;' if apagado else ''))
        return f'<span style="display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:999px;font-size:13px;{est}">{txt}{conta}</span>'
    filtros = ('<div style="display:flex;gap:8px;">' + chip(T('filtroTodas'), True) + chip(T('filtroAndamento'), apagado=True, n=0)
               + chip(T('filtroRecomendadas'), n=3) + chip(T('filtroFeitas'), apagado=True, n=0) + '</div>')

    ordem = {'t1': 1, 't3': 2, 't5': 3}
    dados = sorted(TRILHAS_DADOS, key=lambda d: ordem.get(d[0], 9))

    def card(tit, txt, comp, niveis, etapas_, feitas, horas, pro, pra_voce):
        de, ate = niveis
        n = ordem.get(tit)
        topo_ = (f'<div style="display:flex;align-items:center;gap:8px;">{badge(comp, k, "blue")}'
                 + (badge(T(f'vz{n}'), k, 'green', ponto=True) if n else '')
                 + (f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;color:{k["mfg"]};">{ic("cadeado", 12)}{T("so_pro")}</span>' if pro and not n else '')
                 + '</div>')
        niv = (f'<span style="display:flex;align-items:center;gap:8px;font-size:12px;color:{k["mfg"]};">{escala(ate, k, 14)}'
               f'{NIVEIS[de - 1]} → {NIVEIS[ate - 1]}</span>')
        pe = (f'<span style="display:flex;align-items:center;justify-content:space-between;width:100%;font-size:12.5px;color:{k["mfg"]};">'
              f'<span>{etapas_} {T("etapas")} · {horas} {T("horas")}</span>'
              f'<span style="font-weight:500;color:{k["pri"] if (n or not pro) else k["mfg"]};">{T("comecar")}</span></span>')
        destaque_ = f'box-shadow:{k["sombra"]}, inset 0 0 0 1.5px {k["pri"]};' if n == 1 else f'box-shadow:{k["sombra"]};'
        return (f'<a href="{f"Trilha{sufixo}.dc.html" if n == 1 else "#"}" style="display:flex;flex-direction:column;gap:10px;padding:18px 20px;border-radius:12px;'
                f'background:{k["card"]};{destaque_}color:inherit;min-width:0;{"opacity:0.85;" if pro and not n else ""}">{topo_}'
                f'<div style="display:flex;flex-direction:column;gap:4px;"><span style="font-size:16px;font-weight:600;color:{k["fgs"]};">{T(tit)}</span>'
                f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T(txt)}</span></div>'
                f'{niv}<div style="margin-top:auto;padding-top:4px;">{pe}</div></a>')
    grade = ('<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">'
             + ''.join(card(*d) for d in dados) + '</div>')
    return app(k, 'trilhas', cab + destaque + filtros + grade, gap=20)

