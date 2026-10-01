# ── Evolução ─────────────────────────────────────────────────────────────
# As cinco visões da Evolução, no contrato aprovado da API (swell-docs/muriki-api/features/code-evolution),
# com as competências, as trilhas e as etapas reais do conteúdo. Sempre contra o próprio histórico: nada de
# ranking, comparação com outras pessoas ou seta de queda, e o nível nunca desce.
#
# - Perfil (GET /code/evolution/profile): declarado, confirmado (ou vazio) e o próximo nível com as etapas
#   que faltam. A escala é cheia até o confirmado e em contorno até o declarado.
# - Trilha (GET /code/tracks/{id}, com demonstratedBy): feitas por exercício, puladas pelo exercício de
#   entrada, cobertas pelo nível e pendentes.
# - No tempo (level-changes): só o confirmado, a partir da linha de partida (baseline). O declarado não
#   entra no tempo.
# - Trajetória (trajectories/{skill}): a primeira aprovação ao lado da mais recente, pelas medidas. Nunca
#   mostra código.
#
# O gráfico é SVG só de formas e números literais; os rótulos traduzíveis são HTML por cima (no canvas,
# {{t.…}} dentro de <text> sai vazio).
from base import *
from movel_code import PAD, ALTURAS, raiz_movel, topo_movel, titulo_movel, card

# a página passa de 900: no canvas ela vira dois quadros, o topo e a página rolada
ROLAGEM = 640

# o Rafael declarou menos de 2 anos de código no primeiro acesso: Junior em tudo; depois, os exercícios
# confirmaram. (competência, declarado, confirmado ou None, próximo: (tier, etapas que faltam) ou None)
JS = [
    ('Primeiros passos', 2, 3, ('nivelSenior', 0)),
    ('Funções e escopo', 2, 3, ('nivelSenior', 0)),
    ('Listas e objetos', 2, None, ('nivelPleno', 2)),
    ('Texto', 2, None, ('nivelPleno', 3)),
    ('Dados e referências', 2, None, ('nivelPleno', 1)),
    ('Erros e depuração', 2, 2, ('nivelPleno', 3)),
    ('Organização do código', 2, None, ('nivelPleno', 2)),
    ('Classes e protótipos', 2, None, ('nivelPleno', 3)),
    ('Assincronia', 2, 3, ('nivelSenior', 0)),
]
ARQ = [('Sistemas web', 2, None, ('nivelPleno', 3))]

# (trilha, feitas, puladas pelo exercício de entrada, cobertas pelo nível, pendentes)
TRILHAS_EV = [('JavaScript do zero', 11, 3, 9, 3), ('JavaScript idiomático', 5, 1, 12, 14), ('Arquitetura de sistemas', 1, 0, 0, 7)]

COLUNAS = 'minmax(0,1.35fr) 92px minmax(0,1fr) minmax(0,0.85fr) minmax(0,1.15fr) 16px'
TOM_PULADA = 'color-mix(in oklch, var(--pri) 55%, transparent)'
TOM_COBERTA = 'color-mix(in oklch, var(--pri) 25%, transparent)'
NIVEL = {1: 'nivelFund', 2: 'nivelJunior', 3: 'nivelPleno', 4: 'nivelSenior'}


def _escala(k, conf, decl, larg=20):
    # cheio até o confirmado, contorno até o declarado, encaixe no resto
    segs = ''
    for i in range(4):
        if conf and i < conf:
            s = f'background:{k["pri"]};'
        elif decl and i < decl:
            s = f'box-shadow:inset 0 0 0 1px {k["pri"]};'
        else:
            s = f'background:{k["sunken"]};'
        segs += f'<span style="width:{larg}px;height:6px;border-radius:2px;{s}"></span>'
    return f'<span style="display:flex;gap:3px;align-items:center;">{segs}</span>'


def _confirmado(k, conf):
    if conf:
        return badge(f'{T(NIVEL[conf])} {T("confirmadoSuf")}', k, 'blue', ponto=True)
    return f'<span style="font-size:12px;color:{k["mfg"]};">{T("naoConfirmado")}</span>'


def _declarado(k, decl):
    return f'<span style="font-size:12px;color:{k["mfg"]};">{T(NIVEL[decl])} {T("declaradoSuf")}</span>'


def _proximo(k, prox):
    if prox is None:
        return f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("noTopo")}</span>'
    tier, n = prox
    if n == 0:
        return f'<span style="font-size:12px;color:{k["mfg"]};">{T(tier)}: {T("semEtapas")}</span>'
    palavra = (f'{T("falta")} ' if n == 1 else f'{T("faltam")} ')
    return (f'<span style="font-size:12.5px;color:{k["fg"]};">{T(tier)}: {palavra}'
            f'<span style="font-family:{MONO};font-size:12px;color:{k["fgs"]};">{n}</span> {T("etapa") if n == 1 else T("etapas")}</span>')


def _linha(k, nome, decl, conf, prox, primeira):
    borda = '' if primeira else f'border-top:1px solid {k["muted"]};'
    return (f'<a href="Competencia__SUF__.dc.html" style="display:grid;grid-template-columns:{COLUNAS};gap:14px;align-items:center;'
            f'min-height:44px;padding:6px 18px;{borda}color:inherit;text-decoration:none;">'
            f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
            f'{_escala(k, conf, decl)}<span>{_confirmado(k, conf)}</span><span>{_declarado(k, decl)}</span>'
            f'<span>{_proximo(k, prox)}</span><span style="display:flex;color:{k["mfg"]};">{ic("direita", 14)}</span></a>')


def _grupo(k, titulo, itens):
    return (f'<div style="display:flex;align-items:center;height:30px;padding:0 18px;background:{k["rail"]};'
            f'border-top:1px solid {k["muted"]};">{rotulo(titulo, k["mfg"], 9.5)}</div>'
            + ''.join(_linha(k, *c, i == 0) for i, c in enumerate(itens)))


def _perfil(k, js=None, arq=None):
    cab = (f'<div style="display:grid;grid-template-columns:{COLUNAS};gap:14px;align-items:center;height:36px;padding:0 18px;">'
           + ''.join(rotulo(T(c), k['mfg'], 9.5) for c in ('colComp', 'colNivel', 'colConfirmado', 'colDeclarado', 'colProximo'))
           + '<span></span></div>')
    return (f'<section aria-label="{T("competencias")}" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;'
            f'box-shadow:{k["sombra"]};display:flex;flex-direction:column;overflow:hidden;">'
            f'<div style="display:flex;align-items:center;padding:16px 18px 6px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("competencias")}</h2></div>'
            f'{cab}{_grupo(k, T("grupoJs"), js or JS)}{_grupo(k, T("grupoArq"), arq or ARQ)}</section>')


PARTES = [('feitas', 'pri'), ('puladas', TOM_PULADA), ('cobertas', TOM_COBERTA), ('pendentes', 'sunken')]


def _cor(k, c):
    return k[c] if c in k else c


def _barra(k, numeros, alt=8):
    seg = lambda n, cor: (f'<span style="flex:{n} 1 0;min-width:3px;height:{alt}px;background:{cor};"></span>' if n else '')
    return (f'<span style="display:flex;gap:2px;overflow:hidden;border-radius:3px;" role="img" '
            f'aria-label="{", ".join(f"{n} {T(p)}" for n, (p, _) in zip(numeros, PARTES))}">'
            + ''.join(seg(n, _cor(k, c)) for n, (_, c) in zip(numeros, PARTES)) + '</span>')


def _trilha(k, nome, feitas, puladas, cobertas, pendentes, primeira):
    borda = '' if primeira else f'border-top:1px solid {k["muted"]};'
    numeros = (feitas, puladas, cobertas, pendentes)
    conta = lambda n, chave, cor: (f'<span style="display:inline-flex;align-items:center;gap:6px;">'
                                   f'<span style="width:8px;height:8px;border-radius:2px;background:{cor};"></span>'
                                   f'<span style="font-family:{MONO};font-size:11.5px;color:{k["fgs"]};">{n}</span>'
                                   f'<span style="font-size:12px;color:{k["mfg"]};">{T(chave)}</span></span>')
    return (f'<div style="display:flex;flex-direction:column;gap:9px;padding:14px 0;{borda}">'
            f'<a href="Trilha__SUF__.dc.html" style="font-size:13.5px;font-weight:500;color:{k["fgs"]};text-decoration:none;">{nome}</a>'
            f'{_barra(k, numeros)}<span style="display:flex;flex-wrap:wrap;gap:6px 14px;">'
            + ''.join(conta(n, p, _cor(k, c)) for n, (p, c) in zip(numeros, PARTES)) + '</span></div>')


def _trilhas(k, largura='360px', trilhas=None):
    itens = ''.join(_trilha(k, *t, i == 0) for i, t in enumerate(trilhas or TRILHAS_EV))
    return (f'<section aria-label="{T("nasTrilhas")}" style="width:{largura};flex:0 0 auto;align-self:flex-start;box-sizing:border-box;'
            f'background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};padding:16px 20px 6px;display:flex;flex-direction:column;">'
            f'<h2 style="margin:0 0 2px;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("nasTrilhas")}</h2>'
            f'{itens}</section>')


# no tempo: 12 semanas e quatro faixas de nível. Cada linha começa na linha de partida (baseline) da
# competência e sobe a cada confirmação; antes da partida, não há linha.
SEMANAS = 12
LINHAS_GRAFICO = [
    # (competência, cor, semana da partida, nível na partida, [(semana, nível confirmado)])
    ('Funções e escopo', 'pri', 0, 2, [(5, 3)]),
    ('Assincronia', 'warn', 2, 2, [(7, 3)]),
    ('Primeiros passos', 'ok', 1, 3, []),
]


def _grafico(k, larg, alt, rot_esq=86):
    faixa = alt / 4
    x = lambda i: i * (larg / (SEMANAS - 1))
    y = lambda nivel, desloc: alt - (nivel - 0.5) * faixa + desloc
    faixas = ''.join(f'<rect x="0" y="{i * faixa:.1f}" width="{larg}" height="{faixa:.1f}" fill="var(--{"sunken" if i % 2 else "card"})"/>'
                     for i in range(4))
    grade = ''.join(f'<line x1="{x(i):.1f}" y1="0" x2="{x(i):.1f}" y2="{alt}" stroke="var(--muted)" stroke-width="1"/>' for i in range(SEMANAS))
    tracos, marcas = '', ''
    for j, (_, cor, inicio, nivel0, subidas) in enumerate(LINHAS_GRAFICO):
        d = (j - 1) * 5  # as linhas da mesma faixa não se cobrem
        pts, nivel = f'M{x(inicio):.1f} {y(nivel0, d):.1f}', nivel0
        for semana, novo in subidas:
            pts += f' H{x(semana):.1f} V{y(novo, d):.1f}'
            nivel = novo
        pts += f' H{x(SEMANAS - 1):.1f}'
        tracos += f'<path d="{pts}" fill="none" stroke="var(--{cor})" stroke-width="2.25" stroke-linejoin="round"/>'
        # a partida é um quadrado; cada confirmação, um ponto
        marcas += (f'<rect x="{x(inicio) - 4.5:.1f}" y="{y(nivel0, d) - 4.5:.1f}" width="9" height="9" rx="1.5" '
                   f'fill="var(--{cor})"/>')
        for semana, novo in subidas:
            marcas += f'<circle cx="{x(semana):.1f}" cy="{y(novo, d):.1f}" r="5" fill="var(--card)" stroke="var(--{cor})" stroke-width="2.25"/>'
    svg_ = (f'<svg viewBox="0 0 {larg} {alt}" width="100%" height="{alt}" preserveAspectRatio="none" aria-hidden="true" '
            f'style="display:block;border-radius:6px;overflow:visible;">{faixas}{grade}{tracos}{marcas}</svg>')
    niveis = ''.join(f'<span style="position:absolute;right:10px;top:{(3 - i) * 25 + 12.5}%;transform:translateY(-50%);'
                     f'font-family:{MONO};font-size:10.5px;color:{k["mfg"]};white-space:nowrap;">{T(n)}</span>'
                     for i, n in enumerate(('nivelFund', 'nivelJunior', 'nivelPleno', 'nivelSenior')))
    meses = ''.join(f'<span style="position:absolute;left:{p}%;font-size:11px;color:{k["mfg"]};">{T(m)}</span>'
                    for m, p in (('jul', 0), ('ago', 36), ('set', 73)))
    return (f'<div style="display:flex;">'
            f'<div style="position:relative;width:{rot_esq}px;flex:0 0 auto;height:{alt}px;">{niveis}</div>'
            f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">{svg_}'
            f'<div style="position:relative;height:16px;">{meses}</div></div></div>')


def _legenda_grafico(k):
    item = lambda nome, cor: (f'<span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:{k["fg"]};">'
                              f'<span style="width:18px;height:0;border-top:2.5px solid var(--{cor});"></span>{nome}</span>')
    return (f'<span style="display:flex;flex-wrap:wrap;gap:8px 18px;">'
            + ''.join(item(n, c) for n, c, *_ in LINHAS_GRAFICO)
            + f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
              f'<span style="width:9px;height:9px;border-radius:2px;background:{k["mfg"]};"></span>{T("legPartida")}</span>'
            + f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
              f'<span style="width:9px;height:9px;border-radius:99px;box-shadow:inset 0 0 0 2px {k["mfg"]};"></span>{T("legConfirmacao")}</span></span>')


def _no_tempo(k, larg=900, alt=200, rot_esq=86):
    return (f'<section aria-label="{T("noTempo")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:14px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("noTempo")}</h2>'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("noTempoSub")}</p></div>'
            f'{_legenda_grafico(k)}{_grafico(k, larg, alt, rot_esq)}</section>')


# a trajetória da etapa Closures: a primeira aprovação (contador de cliques) e a mais recente (memoize)
APROVACOES = [('Contador de cliques', 'dJul2'), ('Memoize', 'dSet18')]
MEDIDAS = [('mTentativas', '4', '1'), ('mDicas', '2', '0'), ('mExplicacao', '1 {de2}', '2 {de2}'),
           ('mTempo', '18 {minutos}', '4 {minutos}'), ('mPeer', '6', '1')]


def _valor(v):
    return v.replace('{de2}', T('de2')).replace('{minutos}', T('minutos'))


def _trajetoria(k, estreito=False):
    cab_col = lambda rot, titulo, data: (f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0;">'
                                         f'{rotulo(T(rot), k["mfg"], 9.5)}'
                                         f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{titulo}</span>'
                                         f'<span style="font-size:12px;color:{k["mfg"]};">{T(data)}</span></span>')
    colunas = 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)' if not estreito else 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)'
    topo = (f'<div style="display:grid;grid-template-columns:{colunas};gap:14px;align-items:end;padding-bottom:10px;">'
            f'<span></span>{cab_col("primeira", *APROVACOES[0])}{cab_col("recente", *APROVACOES[1])}</div>')
    linhas = ''.join(
        f'<div style="display:grid;grid-template-columns:{colunas};gap:14px;align-items:center;min-height:38px;border-top:1px solid {k["muted"]};">'
        f'<span style="font-size:13px;color:{k["fg"]};">{T(m)}</span>'
        f'<span style="font-family:{MONO};font-size:12.5px;color:{k["mfg"]};">{_valor(a)}</span>'
        f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};">{_valor(b)}</span></div>'
        for m, a, b in MEDIDAS)
    return (f'<section aria-label="{T("trajetoria")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 12px;display:flex;flex-direction:column;gap:14px;">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("trajetoria")}</h2>'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("trajetoriaSub")}</p></div>'
            f'{badge("Closures", k, "blue")}</div><div>{topo}{linhas}</div></section>')


def _cabecalho(k, sub):
    return (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
            f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
            f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("evTitulo")}</h1>'
            f'<p style="margin:0;max-width:720px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T(sub)}</p></div>'
            f'{botao(T("comoMedido"), k, "ghost")}</header>')


def _pagina(k, conteudo, desloca=''):
    return (f'{raiz(k, "display:flex;")}{rail(k, "evolucao")}'
            f'<main style="flex:1;min-width:0;padding:32px 40px;display:flex;flex-direction:column;gap:20px;{desloca}">{conteudo}</main></div>')


def tela_evolucao_nova(k, rolada=False):
    topo = f'<div style="display:flex;gap:20px;align-items:flex-start;">{_perfil(k)}{_trilhas(k)}</div>'
    # rolada, o menu fica e o conteúdo sobe, como na tela de verdade
    return _pagina(k, _cabecalho(k, 'evSub') + topo + _no_tempo(k) + _trajetoria(k),
                   f'margin-top:-{ROLAGEM}px;' if rolada else '')


# ── celular ──
def _cartao_comp(k, nome, decl, conf, prox):
    return (f'<a href="Competencia__SUF__.dc.html" style="display:flex;flex-direction:column;gap:8px;padding:14px 0;'
            f'border-top:1px solid {k["muted"]};color:inherit;text-decoration:none;">'
            f'<span style="display:flex;align-items:center;gap:10px;">'
            f'<span style="flex:1;min-width:0;font-size:14.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
            f'{_escala(k, conf, decl, 16)}</span>'
            f'<span style="display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;">{_confirmado(k, conf)}{_declarado(k, decl)}'
            f'{_proximo(k, prox)}</span></a>')


def tela_evolucao_movel(k):
    grupo = lambda titulo, itens: (f'<div style="display:flex;flex-direction:column;">'
                                   f'<span style="padding:6px 0 4px;">{rotulo(titulo, k["mfg"], 9.5)}</span>'
                                   + ''.join(_cartao_comp(k, *c) for c in itens) + '</div>')
    perfil = card(k, f'<h2 style="margin:0;font-size:16px;line-height:21px;font-weight:600;color:{k["fgs"]};">{T("competencias")}</h2>'
                     f'{grupo(T("grupoJs"), JS)}{grupo(T("grupoArq"), ARQ)}', gap=6)
    conteudo = (titulo_movel(k, T('evTitulo'), T('evSub')) + perfil + _trilhas(k, '100%')
                + _no_tempo(k, larg=300, alt=170, rot_esq=64) + _trajetoria(k, estreito=True))
    return (f'{raiz_movel(k, ALTURAS["evolucao"], "display:flex;flex-direction:column;")}{topo_movel(k, T("evTitulo"))}'
            f'<main style="flex:1;min-height:0;padding:18px {PAD}px 28px;display:flex;flex-direction:column;gap:16px;">{conteudo}</main></div>')


# ── uma competência: o caminho na trilha, o histórico e a trajetória ──
# as etapas reais de js.functions no conteúdo, com o status do caminho da trilha e o demonstratedBy
ETAPAS_FUNCOES = [
    ('nivelFund', [('Escrever funções', 'coberta')]),
    ('nivelJunior', [('Escopo e visibilidade', 'feita'), ('Funções como valores', 'feita'), ('Closures', 'feita'),
                     ('Recursão', 'pulada')]),
    ('nivelPleno', [('Compor funções', 'feita')]),
]


def _marca_etapa(k, estado):
    if estado == 'feita':
        return (f'<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;'
                f'background:{k["pri"]};color:{k["prifg"]};flex:0 0 auto;">{ic("check", 11)}</span>')
    if estado == 'pulada':
        return (f'<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;'
                f'background:{TOM_PULADA};color:{k["prifg"]};flex:0 0 auto;">{ic("direita", 11)}</span>')
    return f'<span style="width:20px;height:20px;border-radius:999px;flex:0 0 auto;background:{TOM_COBERTA};"></span>'


def _caminho_competencia(k):
    rot = {'feita': 'estFeita', 'pulada': 'estPulada', 'coberta': 'estCoberta'}
    grupos = ''
    for nivel, etapas in ETAPAS_FUNCOES:
        linhas = ''.join(
            f'<li style="display:flex;align-items:center;gap:12px;min-height:40px;padding:4px 0;border-top:1px solid {k["muted"]};">'
            f'{_marca_etapa(k, est)}<span style="flex:1;min-width:0;font-size:13.5px;color:{k["fgs"] if est == "feita" else k["fg"]};">{nome}</span>'
            f'<span style="font-size:12px;color:{k["mfg"]};">{T(rot[est])}</span></li>' for nome, est in etapas)
        grupos += (f'<div style="display:flex;flex-direction:column;"><span style="padding:10px 0 6px;">{rotulo(T(nivel), k["mfg"], 9.5)}</span>'
                   f'<ul style="margin:0;padding:0;list-style:none;">{linhas}</ul></div>')
    grupos += (f'<div style="display:flex;flex-direction:column;"><span style="padding:10px 0 6px;">{rotulo(T("nivelSenior"), k["mfg"], 9.5)}</span>'
               f'<p style="margin:0;padding:10px 0 2px;border-top:1px solid {k["muted"]};font-size:13px;line-height:19px;color:{k["mfg"]};">{T("seniorSem")}</p></div>')
    return (f'<section aria-label="{T("caminhoTit")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:4px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("caminhoTit")}</h2>'
            f'<p style="margin:0 0 4px;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("caminhoSub")}</p>{grupos}</section>')


def _historico(k):
    def marco(data, titulo, txt, partida, ultimo=False):
        ponto = (f'border-radius:2px;background:{k["pri"]};' if partida
                 else f'border-radius:999px;background:{k["card"]};box-shadow:inset 0 0 0 2px {k["pri"]};')
        trilho = '' if ultimo else f'<span style="flex:1;width:1px;background:{k["input"]};margin-top:4px;"></span>'
        return (f'<li style="display:grid;grid-template-columns:52px 14px minmax(0,1fr);gap:12px;">'
                f'<span style="font-family:{MONO};font-size:11.5px;line-height:20px;color:{k["mfg"]};">{data}</span>'
                f'<span style="display:flex;flex-direction:column;align-items:center;padding-top:5px;">'
                f'<span style="width:10px;height:10px;{ponto}"></span>{trilho}</span>'
                f'<span style="display:flex;flex-direction:column;gap:3px;padding-bottom:14px;">'
                f'<span style="font-size:13.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{titulo}</span>'
                f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{txt}</span></span></li>')
    return (f'<section aria-label="{T("historicoTit")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 6px;display:flex;flex-direction:column;gap:12px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("historicoTit")}</h2>'
            f'<ol style="margin:0;padding:0;list-style:none;">'
            f'{marco(T("dAgo"), T("hPlenoConf"), T("hPlenoConfTxt"), False)}'
            f'{marco(T("dJul2"), T("hPartida"), T("hPartidaTxt"), True, ultimo=True)}</ol></section>')


def tela_competencia_nova(k):
    cab = (f'<header style="display:flex;flex-direction:column;gap:8px;">{voltar(k, T("voltarEvolucao"), "Main__SUF__.dc.html")}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">Funções e escopo</h1>'
           f'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">{_escala(k, 3, 2, 22)}'
           f'{_confirmado(k, 3)}{_declarado(k, 2)}<span style="font-size:12.5px;color:{k["mfg"]};">· {T("grupoJs")}</span></div></header>')
    esquerda = f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:20px;">{_caminho_competencia(k)}</div>'
    direita = f'<div style="width:520px;flex:0 0 520px;display:flex;flex-direction:column;gap:20px;">{_historico(k)}{_trajetoria(k)}</div>'
    return _pagina(k, f'{cab}<div style="display:flex;gap:20px;align-items:flex-start;">{esquerda}{direita}</div>')


# ── o primeiro dia: só o declarado, nada confirmado nem feito ──
ETAPAS_DE_PLENO = {'Primeiros passos': 2, 'Funções e escopo': 1, 'Listas e objetos': 5, 'Texto': 4, 'Dados e referências': 3,
                   'Erros e depuração': 3, 'Organização do código': 2, 'Classes e protótipos': 3, 'Assincronia': 4, 'Sistemas web': 3}
JS_VAZIO = [(n, 2, None, ('nivelPleno', ETAPAS_DE_PLENO[n])) for n, *_ in JS]
ARQ_VAZIO = [(n, 2, None, ('nivelPleno', ETAPAS_DE_PLENO[n])) for n, *_ in ARQ]
TRILHAS_VAZIO = [('JavaScript do zero', 0, 0, 21, 5), ('JavaScript idiomático', 0, 0, 14, 18), ('Arquitetura de sistemas', 0, 0, 0, 8)]


def tela_evolucao_vazia(k):
    vazio = (f'<section aria-label="{T("vazioTempoTit")}" style="width:360px;box-sizing:border-box;background:{k["card"]};border-radius:12px;'
             f'box-shadow:{k["sombra"]};padding:16px 20px 18px;display:flex;flex-direction:column;gap:10px;">'
             f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("vazioTempoTit")}</h2>'
             f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("vazioTempoTxt")}</p>'
             f'<span>{botao_link(T("comecarPrimeiro"), "PrimeiroExercicio__SUF__.dc.html", k, "solid", 36)}</span></section>')
    lado = f'<div style="display:flex;flex-direction:column;gap:20px;flex:0 0 auto;">{_trilhas(k, trilhas=TRILHAS_VAZIO)}{vazio}</div>'
    return _pagina(k, _cabecalho(k, 'vazioSub')
                   + f'<div style="display:flex;gap:20px;align-items:flex-start;">{_perfil(k, JS_VAZIO, ARQ_VAZIO)}{lado}</div>')
