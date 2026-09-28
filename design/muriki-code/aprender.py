# ── Trilhas, catálogo de Exercícios e Peer na web ──────────────────────────
# Trilhas: a lista, com "continue de onde parou" em cima, e o detalhe de uma trilha — o caminho de
# etapas, com o porquê da etapa de agora (o Learning repetiu o tema ou avançou) e o nível daquela
# competência ao lado. Exercícios: o catálogo, com busca, filtros, abas por estado e o uso do mês do
# plano. Peer na web: o histórico das conversas da IDE, a conversa aberta com o trecho que o Peer
# viu e a evidência que ela gerou, e onde o Peer pode olhar (ligado por projeto).
from base import *  # noqa: F401,F403

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


# ── Trilhas ──
TRILHAS_DADOS = [
    # título, texto, competência, nível de/até (1-5), etapas, feitas, horas, pro, para você
    ('t1', 't1Txt', 'Testing', (2, 3), 8, 3, 3, False, True),
    ('t2', 't2Txt', 'Debugging', (2, 3), 6, 1, 2, False, True),
    ('t3', 't3Txt', 'TypeScript', (3, 4), 7, 0, 3, False, False),
    ('t4', 't4Txt', 'APIs', (2, 3), 6, 0, 2, False, False),
    ('t5', 't5Txt', 'Architecture', (1, 2), 9, 0, 4, True, False),
    ('t6', 't6Txt', 'Security', (2, 3), 5, 0, 2, True, False),
]


def tela_trilhas(k, sufixo):
    cab = cabecalho(k, None, T('tTitulo'), T('tSub'))
    destaque = cartao(
        f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("continuar"), k["mfg"])}'
        f'<span style="margin-left:auto;">{badge("Testing", k, "blue")}</span></div>'
        f'<div style="display:flex;align-items:flex-end;gap:24px;">'
        f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
        f'<span style="font-size:13px;color:{k["mfg"]};">{T("t1")} · {T("proxEtapa")}</span>'
        f'<h2 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("e1")}</h2>'
        f'<p style="margin:0;font-size:13.5px;color:{k["mfg"]};">{T("e1Txt")}</p></div>'
        f'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:12px;width:260px;">{_progresso(k, 3, 8)}'
        f'{botao_link(T("continuarBtn"), f"Trilha{sufixo}.dc.html", k, "solid", 40, "seta")}</div></div>',
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
    caminho = cartao(f'{rotulo(T("mapa"), k["mfg"])}<div style="display:flex;flex-direction:column;">{passos}</div>',
                     k, pad='20px 24px', extra='flex:1.7;min-width:0;gap:16px;')

    linha_nivel = lambda rot, n, extra='': (f'<div style="display:flex;align-items:center;gap:10px;">'
                                            f'<span style="width:84px;font-size:12.5px;color:{k["mfg"]};">{rot}</span>{escala(n, k, 18)}'
                                            f'<span style="font-size:12.5px;color:{k["fgs"]};">{NIVEIS[n - 1]}</span>{extra}</div>')
    nivel = cartao(f'{rotulo(T("seuNivel"), k["mfg"])}'
                   + linha_nivel(T('declarado'), 2) + linha_nivel(T('observado'), 2, badge(T('aConfirmar'), k, 'yellow'))
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
