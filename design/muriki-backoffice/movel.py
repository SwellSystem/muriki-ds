# ── O Backoffice no celular (390 de largura) ────────────────────────────
# As mesmas telas, com os mesmos dados de telas.py, repensadas para a coluna estreita:
# - a casca vira uma barra de topo de 56px (menu, logo e nome da tela, avatar); o rail vira um sheet
#   que abre da esquerda sobre um véu (quadro MenuMovel);
# - seletores em largura cheia, um embaixo do outro;
# - abas que não cabem rolam na horizontal, com um fade na borda direita e a ativa sempre à vista;
# - tabela vira cartão: o principal em cima, dois ou três fatos em linha, o selo de status e as
#   ações num botão "…"; busca em largura cheia, filtros em chips que rolam, paginação simples;
# - gráficos com poucos rótulos no eixo (os meses de dois em dois) e o resumo em grade 2 × 2;
# - alvo de toque mínimo de 40px e nada de rolagem horizontal da página.
# Cada quadro tem a altura da página rolada inteira (ALTURAS), para ver o fim sem truque.
from telas import *  # noqa: F401,F403
from telas import (ORIGENS, _colunas_origens, _legenda, _agora, _cartao_produto, _inativar_link, _dado_cupom,
                   TESTES_MESES, ATRASO_MESES, MRR_MESES, MESES, ESTADOS, CLIENTES, PAGAMENTOS, CUPONS, USOS,
                   PLANOS, FEATURES, ligadas, selo_produto, PRODUTO)
from pecas import pagina, rail  # noqa: F401

WM = 390
PAD = 16

I.update(menu=svg('<path d="M2.5 4.5h11"/><path d="M2.5 8h11"/><path d="M2.5 11.5h11"/>'))

# a altura de cada quadro: a página rolada inteira (medida no Chrome e arredondada)
ALTURAS = dict(inicio=1810, menu=844, clientes=1360, cliente=1560, metricas=1120, cupons=1450, cupom=1190, planos=1130)


def pagina_movel(titulo, corpo, tema, altura, antes='', valores='', props=None):
    html = pagina(titulo, corpo, tema, antes, valores, props)
    return html.replace(f'"$preview":{{"width":{W},"height":{H}}}', f'"$preview":{{"width":{WM},"height":{altura}}}')


def raiz_movel(k, altura, estilo=''):
    return (f'<div class="mc {{{{temaClasse}}}}" lang="pt-BR" style="position:relative;width:{WM}px;height:{altura}px;overflow:hidden;'
            f'background:{k["bg"]};color:{k["fg"]};font-family:{FONTE};font-size:14px;line-height:20px;{estilo}">')


def _toque(k, icone, rot, cor=None, destino=None):
    # botão só de ícone com o alvo de 40px
    est = (f'display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 auto;border:0;border-radius:10px;'
           f'background:transparent;color:{cor or k["mfg"]};cursor:pointer;')
    if destino:
        return f'<a href="{destino}" aria-label="{rot}" style="{est}">{ic(icone, 18)}</a>'
    return f'<button type="button" aria-label="{rot}" style="{est}">{ic(icone, 18)}</button>'


def topo_movel(k, titulo):
    return (f'<header style="position:relative;z-index:2;display:flex;align-items:center;gap:6px;height:56px;padding:0 8px;'
            f'background:{k["rail"]};box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'{_toque(k, "menu", "Abrir o menu", k["fgs"], href("MenuMovel"))}'
            f'<span style="display:flex;width:26px;height:26px;flex:0 0 auto;">{LOGO}</span>'
            f'<span style="flex:1;min-width:0;font-size:15px;font-weight:600;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{titulo}</span>'
            f'<a href="{href("Conta")}" aria-label="Minha conta" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;">'
            f'{avatar("AL", k, "yellow")}</a></header>')


def app_movel(k, chave, titulo, conteudo, gap=14, sobre=''):
    return (f'{raiz_movel(k, ALTURAS[chave], "display:flex;flex-direction:column;")}{topo_movel(k, titulo)}'
            f'<main style="flex:1;min-height:0;padding:16px {PAD}px 24px;display:flex;flex-direction:column;gap:{gap}px;">'
            f'{conteudo}</main>{sobre}</div>')


def titulo_movel(k, titulo, sub='', contagem='', voltar_para=None, direita=''):
    v = ''
    if voltar_para:
        nome, destino = voltar_para
        v = (f'<a href="{href(destino)}" style="display:inline-flex;align-items:center;gap:6px;height:32px;align-self:flex-start;'
             f'margin-left:-4px;padding:0 4px;font-size:13px;font-weight:500;color:{k["mfg"]};">{ic("esquerda", 14)}{nome}</a>')
    c = (f'<span style="font-family:{MONO};font-size:13px;font-weight:400;color:{k["mfg"]};margin-left:8px;">{contagem}</span>' if contagem else '')
    s = f'<p style="margin:0;font-size:13.5px;line-height:19px;color:{k["mfg"]};">{sub}</p>' if sub else ''
    return (f'<header style="display:flex;flex-direction:column;gap:6px;">{v}'
            f'<div style="display:flex;align-items:center;gap:10px;"><h1 style="margin:0;flex:1;min-width:0;display:flex;align-items:baseline;'
            f'font-size:24px;line-height:30px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{titulo}{c}</h1>{direita}</div>{s}</header>')


def seg_cheio(k, opcoes, ativo, aria):
    # o view-toggle em largura cheia: cada opção divide o trilho, e o trilho tem 40px de alto
    bs = ''
    for o in opcoes:
        at = o == ativo
        est = (f'background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};color:{k["pri"]};'
               if at else f'background:transparent;color:{k["mfg"]};')
        bs += (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="flex:1;min-width:0;height:36px;padding:0 8px;border:0;'
               f'border-radius:999px;{est}font-family:{FONTE};font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;">{o}</button>')
    return (f'<div role="tablist" aria-label="{aria}" style="display:flex;width:100%;padding:2px;border-radius:999px;'
            f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};">{bs}</div>')


def abas_rolaveis(k, abas, ativa, aria='Status'):
    # rolam na horizontal; o fade na borda direita avisa que tem mais, e a ativa fica à vista
    bs = ''
    for nome, n in abas:
        at = nome == ativa
        est = f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};'
        bs += (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:6px;flex:0 0 auto;'
               f'height:40px;padding:0 2px;border:0;background:transparent;{est}font-family:{FONTE};font-size:13.5px;white-space:nowrap;cursor:pointer;">{nome}'
               f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{n}</span></button>')
    return (f'<div style="position:relative;margin:0 -{PAD}px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<div role="tablist" aria-label="{aria}" style="display:flex;gap:20px;overflow:hidden;padding:0 {PAD}px;">{bs}</div>'
            f'<span aria-hidden="true" style="position:absolute;right:0;top:0;bottom:1px;width:44px;pointer-events:none;'
            f'background:linear-gradient(to right, transparent, {k["bg"]});"></span></div>')


def chips_rolaveis(k, chips):
    return (f'<div style="position:relative;margin:0 -{PAD}px;"><div style="display:flex;gap:8px;overflow:hidden;padding:0 {PAD}px;">'
            + ''.join(f'<span style="flex:0 0 auto;display:flex;">{c}</span>' for c in chips) + '</div>'
            f'<span aria-hidden="true" style="position:absolute;right:0;top:0;bottom:0;width:32px;pointer-events:none;'
            f'background:linear-gradient(to right, transparent, {k["bg"]});"></span></div>')


def chip40(k, rot, valor=None):
    # o filtro do resource-table com o alvo de 40px
    return filtro_chip(k, rot, valor).replace('height:32px;', 'height:40px;', 1)


def busca_cheia(k, ph):
    return campo(k, '', ph=ph, icone='busca', alt=40, id_='busca', largura='100%')


def cartao_movel(k, topo_, corpo='', pe='', destino=None, destaque=False):
    # uma linha da tabela como cartão: o principal e as ações em cima, os fatos no meio, o pé embaixo
    tag = 'a' if destino else 'div'
    h_ = f' href="{destino}"' if destino else ''
    return (f'<{tag}{h_} style="display:flex;flex-direction:column;gap:10px;padding:12px 8px 12px 14px;border-radius:12px;color:inherit;'
            f'background:{k["card"]};box-shadow:{k["sombra"]}{", inset 0 0 0 1.5px " + k["pri"] if destaque else ""};">'
            f'<div style="display:flex;align-items:flex-start;gap:10px;">{topo_}{_toque(k, "pontos", "Ações")}</div>'
            + (f'<div style="display:flex;flex-wrap:wrap;gap:6px 14px;padding-right:6px;font-size:12.5px;color:{k["mfg"]};">{corpo}</div>' if corpo else '')
            + (f'<div style="display:flex;align-items:center;gap:8px;padding-right:6px;">{pe}</div>' if pe else '')
            + f'</{tag}>')


def fato(k, rot, valor, mono_=False):
    ff = f'font-family:{MONO};font-size:12px;' if mono_ else ''
    return f'<span>{rot} <b style="font-weight:500;color:{k["fgs"]};{ff}">{valor}</b></span>'


def paginacao_movel(k, tem_anterior=False):
    b = lambda txt, ok: (f'<button type="button" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;height:40px;padding:0 14px;'
                         f'border:0;border-radius:10px;box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};font-family:{FONTE};font-size:13.5px;'
                         f'font-weight:500;color:{k["fgs"]};{"" if ok else "opacity:0.45;"}">{txt}</button>')
    return (f'<nav aria-label="Paginação" style="display:flex;align-items:center;gap:8px;">'
            f'{b(ic("esquerda", 14) + "Anterior", tem_anterior)}<span style="flex:1;text-align:center;font-size:12.5px;color:{k["mfg"]};">Página 1</span>'
            f'{b("Próxima" + ic("direita", 14), True)}</nav>')


def botao_cheio(k, txt, destino='#', var='solid', icone=None):
    return link_botao(k, txt, destino, var, 44, icone, '100%')


def secao(k, titulo, corpo, direita='', pad='14px 16px'):
    return (f'<section aria-label="{titulo}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};padding:{pad};'
            f'display:flex;flex-direction:column;gap:12px;min-width:0;">'
            f'<div style="display:flex;align-items:center;gap:10px;min-height:24px;"><h2 style="margin:0;font-size:14px;font-weight:600;color:{k["fgs"]};">{titulo}</h2>'
            f'<span style="flex:1;"></span>{direita}</div>{corpo}</section>')


def _curva(ps):
    d = f'M{ps[0][0]:.1f},{ps[0][1]:.1f}'
    for a in range(len(ps) - 1):
        p0 = ps[a - 1] if a > 0 else ps[a]
        p1, p2 = ps[a], ps[a + 1]
        p3 = ps[a + 2] if a + 2 < len(ps) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d


def _area_movel(k, valores, teto, gid, aria, tip):
    # a mesma área do Início, no tamanho do celular: três rótulos no eixo, os meses de dois em dois
    # e o tooltip do mês aberto dentro do gráfico
    w, h, esq, topo = 330, 196, 30, 10
    base = h - 24
    x = lambda i: esq + 8 + i * (w - esq - 16) / (len(valores) - 1)
    y = lambda v: base - (base - topo) * v / teto
    pts = [(x(i), y(v)) for i, v in enumerate(valores)]
    area = _curva(pts) + f' L{pts[-1][0]:.1f},{base} L{pts[0][0]:.1f},{base} Z'
    grade = ''.join(f'<line x1="{esq}" x2="{w}" y1="{y(v):.1f}" y2="{y(v):.1f}" style="stroke:var(--muted);stroke-width:1;"/>'
                    f'<text x="{esq - 6}" y="{y(v) + 4:.1f}" text-anchor="end" style="fill:var(--mfg);font-family:{MONO};font-size:10px;">'
                    f'{"0" if v == 0 else f"{int(v) // 1000}k"}</text>' for v in (0, teto / 2, teto))
    meses = ''.join(f'<text x="{px:.1f}" y="{base + 18}" text-anchor="middle" style="fill:var(--mfg);font-family:{MONO};font-size:10px;">{m}</text>'
                    for i, ((px, _), m) in enumerate(zip(pts, MESES)) if i % 2 == 0)
    ti, linhas = tip
    hx, hy = pts[ti]
    lg, al = 132, 20 + 14 * len(linhas)
    caixa_ = (f'<line x1="{hx:.1f}" x2="{hx:.1f}" y1="{topo}" y2="{base}" style="stroke:var(--input);stroke-width:1;stroke-dasharray:3 3;"/>'
              f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="3.5" style="fill:var(--pri);"/>'
              f'<g transform="translate({hx - lg - 10:.1f},{hy + 10:.1f})"><rect width="{lg}" height="{al}" rx="8" style="fill:var(--card);stroke:var(--border);"/>'
              f'<text x="10" y="16" style="fill:var(--mfg);font-family:{MONO};font-size:10px;">{MESES[ti]} 2026</text>'
              + ''.join(f'<text x="10" y="{32 + 14 * n}" style="fill:{"var(--fgs)" if n == 0 else "var(--mfg)"};font-family:{FONTE};'
                        f'font-size:{11.5 if n == 0 else 10.5}px;font-weight:{600 if n == 0 else 400};">{t}</text>' for n, t in enumerate(linhas))
              + '</g>')
    return (f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" role="img" aria-label="{aria}">'
            f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="5%" style="stop-color:var(--pri);stop-opacity:0.8"/><stop offset="95%" style="stop-color:var(--pri);stop-opacity:0.1"/>'
            f'</linearGradient></defs>{grade}<path d="{area}" style="fill:url(#{gid});fill-opacity:0.4;"/>'
            f'<path d="{_curva(pts[:-1])}" style="fill:none;stroke:var(--pri);stroke-width:1;"/>'
            f'<path d="{_curva(pts[-2:])}" style="fill:none;stroke:var(--pri);stroke-width:1;stroke-dasharray:3 3;"/>'
            f'<circle cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="3" style="fill:var(--card);stroke:var(--pri);stroke-width:1.5;"/>'
            f'{meses}{caixa_}</svg>')


def _barras_movel(k, dados, cores, teto, aria):
    # barras agrupadas em largura cheia; os meses de dois em dois e três degraus no eixo
    w, h, esq, topo = 330, 170, 24, 8
    base = h - 22
    passo = (w - esq) / len(dados)
    larg = (passo - 6) / len(dados[0])
    y = lambda v: base - (base - topo) * v / teto
    grade = ''.join(f'<line x1="{esq}" x2="{w}" y1="{y(v):.1f}" y2="{y(v):.1f}" style="stroke:var(--muted);stroke-width:1;"/>'
                    f'<text x="{esq - 5}" y="{y(v) + 4:.1f}" text-anchor="end" style="fill:var(--mfg);font-family:{MONO};font-size:10px;">{int(v)}</text>'
                    for v in (0, teto / 2, teto))
    barras = ''
    for i, trio in enumerate(dados):
        ultimo = i == len(dados) - 1
        for j, v in enumerate(trio):
            bx = esq + i * passo + 3 + j * larg
            by = y(v)
            r = min(2, larg / 2)
            d = (f'M{bx:.1f},{base} V{by + r:.1f} Q{bx:.1f},{by:.1f} {bx + r:.1f},{by:.1f} H{bx + larg - 0.8 - r:.1f} '
                 f'Q{bx + larg - 0.8:.1f},{by:.1f} {bx + larg - 0.8:.1f},{by + r:.1f} V{base} Z')
            barras += f'<path d="{d}" style="fill:{f"color-mix(in oklch, {cores[j]} 45%, transparent)" if ultimo else cores[j]};"/>'
        if i % 2 == 0:
            barras += (f'<text x="{esq + i * passo + passo / 2:.1f}" y="{base + 16}" text-anchor="middle" '
                       f'style="fill:var(--mfg);font-family:{MONO};font-size:10px;">{MESES[i]}</text>')
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" role="img" aria-label="{aria}">{grade}{barras}</svg>'


def resumo_2x2(k, itens):
    return ('<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;">' + ''.join(
        f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0;"><span style="font-size:12px;color:{k["mfg"]};">{r}</span>'
        f'<span style="font-size:18px;font-weight:600;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{v}</span></div>' for r, v in itens) + '</div>')


def ver_tabela():
    return '<a href="#" style="display:inline-flex;align-items:center;min-height:40px;font-size:13px;font-weight:500;">Ver como tabela</a>'


# ── Início ──
def tela_inicio_movel(k):
    neg = lambda t: f'<span style="color:{k["bad"]};font-weight:500;">{t}</span>'
    pos = lambda t: f'<span style="color:{k["ok"]};font-weight:500;">{t}</span>'

    def kpi(rot, valor, linha, selo='', destino=None):
        tag, h_ = ('a', f' href="{destino}"') if destino else ('section', '')
        return (f'<{tag}{h_} aria-label="{rot}" style="min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};color:inherit;'
                f'padding:12px 12px 12px 14px;display:flex;flex-direction:column;gap:4px;">'
                f'<span style="display:flex;align-items:center;flex-wrap:wrap;gap:4px 6px;font-size:12px;font-weight:500;color:{k["mfg"]};">{rot}{selo}</span>'
                f'<span style="font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{valor}</span>'
                f'<span style="display:flex;flex-direction:column;gap:1px;font-size:11.5px;line-height:16px;color:{k["mfg"]};">{linha}</span></{tag}>')
    kpis = ('<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
            + kpi('Líquido', brl(38412, False), f'<span>{brl(40110, False)} recebido</span><span>{neg("−" + brl(1698, False))} reembolsos</span>')
            + kpi('MRR', brl(41920, False), f'<span>{pos("+" + brl(3410, False))} novo</span><span>{neg("−" + brl(720, False))} perdido</span>')
            + kpi('Testes com cartão', brl(4214, False), '<span>86 testes</span>', _agora(k))
            + kpi('Em atraso', brl(3927, False), '<span>41 clientes · o mais antigo há 18 dias</span>', _agora(k), href('MetricasMovel'))
            + '</div>')

    receita = secao(k, 'Receita',
                    _area_movel(k, MRR_MESES, 50000, 'mrrMovel', 'MRR mês a mês, de outubro de 2025 a setembro de 2026: de R$ 18.400 a R$ 41.920.',
                                (10, [brl(MRR_MESES[10], False) + ' de MRR', '802 pagantes', '+61 · −14 canceladas']))
                    + ver_tabela(),
                    _abas_movel(k, ['MRR', 'Vendas'], 'MRR'))

    ini, conv, sem = TESTES_MESES[-2]

    def degrau(rot, n, cor, pct):
        return (f'<div style="display:flex;flex-direction:column;gap:5px;"><span style="display:flex;align-items:baseline;gap:8px;">'
                f'<span style="font-size:13px;color:{k["fgs"]};">{rot}</span><span style="flex:1;"></span>'
                f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};">{n}</span></span>'
                f'<span style="display:block;height:8px;border-radius:3px;background:{k["sunken"]};">'
                f'<span style="display:block;height:8px;width:{pct:.0f}%;border-radius:3px;background:{cor};"></span></span></div>')
    testes = secao(k, 'Testes em agosto', (
        f'<div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:26px;line-height:32px;font-weight:600;color:{k["fgs"]};">{conv / (conv + sem) * 100:.0f}%</span>'
        f'<span style="font-size:12.5px;color:{k["mfg"]};">viraram pagantes</span></div>'
        + degrau('Iniciados', ini, k['pri'], 100) + degrau('Convertidos', conv, k['ok'], conv / ini * 100)
        + degrau('Encerrados sem pagar', sem, k['mfg'], sem / ini * 100)
        + f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">A taxa conta só os que terminaram: {conv} de {conv + sem}. Os outros {ini - conv - sem} ainda estão no teste.</span>'),
        f'<a href="{href("MetricasMovel")}" style="display:inline-flex;align-items:center;min-height:40px;font-size:13px;font-weight:500;">Mês a mês</a>')

    origens = secao(k, 'De onde vêm as contas',
                    f'<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'
                    f'{_legenda(k, [("contas", "color-mix(in oklch, var(--pri) 28%, transparent)"), ("pagantes", k["pri"])])}'
                    f'<span style="font-size:12px;color:{k["mfg"]};">últimos 30 dias</span></div>'
                    + _colunas_origens(k, alto=96, compacto=True) + ver_tabela())

    def atencao(icone, cor, txt, sub, destino, extra=''):
        return (f'<a href="{destino}" style="display:flex;gap:10px;align-items:flex-start;padding:12px 0;min-height:44px;box-shadow:inset 0 -1px 0 {k["muted"]};color:inherit;">'
                f'<span style="margin-top:2px;display:flex;color:{cor};">{ic(icone, 15)}</span>'
                f'<span style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{txt}</span>'
                f'<span style="font-size:12.5px;color:{k["mfg"]};">{sub}</span>{extra}</span>'
                f'<span style="display:flex;color:{k["mfg"]};margin-top:2px;">{ic("direita", 14)}</span></a>')
    divisao = (f'<span style="display:flex;gap:6px;margin-top:3px;">{badge("29 past_due", k, "orange", mono=True)}'
               f'{badge("12 unpaid", k, "red", mono=True)}</span>')
    pendencias = secao(k, 'Pede atenção',
                       f'<div style="display:flex;flex-direction:column;margin-top:-8px;">'
                       f'{atencao("aviso", k["warn"], "41 clientes em atraso", "R$ 3.927 em aberto, o mais antigo há 18 dias", href("ClientesMovel"), divisao)}'
                       f'{atencao("cupom", k["mfg"], "PRO50 perto do fim", "88 de 100 usos, vale até 30 de setembro", href("CupomMovel"))}'
                       f'{atencao("relogio", k["mfg"], "96 testes terminam esta semana", "38 com cartão, 58 sem", href("ClientesMovel"))}</div>',
                       _agora(k), '14px 16px 4px')

    corpo = (titulo_movel(k, 'Bom dia, Ana', 'Quarta, 23 de setembro. Quanto entrou, quanto se repete e o que pede atenção.')
             + f'<div style="display:flex;flex-direction:column;gap:8px;">{seg_cheio(k, ["Muriki Platform", "Muriki Code"], PRODUTO, "Produto")}'
             f'{seg_cheio(k, ["30 dias", "12 meses", "Tudo"], "30 dias", "Período")}</div>'
             + kpis + receita + testes + origens + pendencias)
    return app_movel(k, 'inicio', 'Início', corpo)


def _abas_movel(k, opcoes, ativa):
    return ('<div role="tablist" style="display:flex;gap:14px;">'
            + ''.join(f'<span role="tab" aria-selected="{"true" if o == ativa else "false"}" style="height:40px;display:flex;align-items:center;font-size:13px;'
                      + (f'color:{k["fgs"]};font-weight:500;box-shadow:inset 0 -2px 0 {k["pri"]};' if o == ativa else f'color:{k["mfg"]};')
                      + f'">{o}</span>' for o in opcoes) + '</div>')


# ── Menu (o rail no sheet) ──
def tela_menu_movel(k):
    fundo = tela_inicio_movel(k)
    assert fundo.endswith('</div>')
    MENU_ = [('Início', 'casa', 'InicioMovel', True, ''), ('Clientes', 'pessoas', 'ClientesMovel', False, '1.284'),
             ('Planos', 'plano', 'PlanosMovel', False, ''), ('Cupons', 'cupom', 'CuponsMovel', False, ''),
             ('Relatórios', 'relatorio', 'Relatorios', False, '')]
    EQUIPE_ = [('Equipe', 'pessoa', None), ('Convites', 'envelope', None), ('Auditoria', 'relogio', 'Auditoria')]

    def item(nome, icone, destino, at=False, extra=''):
        f = f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at else f'color:{k["fg"]};'
        b = (f'<span style="position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:999px;background:{k["pri"]};"></span>' if at else '')
        return (f'<a href="{href(destino) if destino else "#"}"{" aria-current=\"page\"" if at else ""} style="position:relative;display:flex;align-items:center;gap:12px;height:44px;'
                f'padding:0 12px;border-radius:10px;font-size:14.5px;{f}">{b}{ic(icone, 17)}<span style="flex:1;">{nome}</span>'
                + (f'<span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};">{extra}</span>' if extra else '') + '</a>')
    nav = ''.join(item(n, i, d, at, e) for n, i, d, at, e in MENU_)
    equipe = ''.join(item(n, i, d) for n, i, d in EQUIPE_)
    sheet_ = (
        f'<nav aria-label="Muriki Backoffice" style="position:absolute;left:0;top:0;bottom:0;width:304px;z-index:31;display:flex;flex-direction:column;'
        f'background:{k["rail"]};box-shadow:8px 0 30px -10px rgba(0,0,0,0.35);">'
        f'<div style="display:flex;align-items:center;gap:10px;height:64px;padding:0 8px 0 16px;">'
        f'<span style="display:flex;width:30px;height:30px;">{LOGO}</span>'
        f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:14px;font-weight:600;color:{k["fgs"]};">Muriki</span>'
        f'<span style="font-size:11.5px;color:{k["mfg"]};">Backoffice</span></span>{_toque(k, "x", "Fechar o menu", k["fgs"], href("InicioMovel"))}</div>'
        f'<div style="padding:4px 12px;display:flex;flex-direction:column;gap:2px;">'
        f'<div style="height:32px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;">{rotulo("Operação", k["mfg"])}'
        f'{badge("prod", k, "green", ponto=True, mono=True)}</div>{nav}'
        f'<div style="height:32px;display:flex;align-items:center;padding:0 12px;margin-top:10px;">{rotulo("Equipe", k["mfg"])}</div>{equipe}</div>'
        f'<div style="flex:1;"></div>'
        f'<div style="padding:10px 12px 16px;display:flex;flex-direction:column;gap:4px;box-shadow:inset 0 1px 0 {k["muted"]};">'
        f'<a href="{href("Conta")}" style="display:flex;align-items:center;gap:10px;min-height:52px;padding:0 6px;color:inherit;">{avatar("AL", k, "yellow", 32)}'
        f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:14px;font-weight:500;color:{k["fgs"]};">Ana Lima</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">Administradora</span></span>{ic("direita", 14, k["mfg"])}</a>'
        f'<div style="display:flex;gap:8px;">'
        f'<button type="button" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border:0;border-radius:10px;'
        f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};font-family:{FONTE};font-size:13.5px;font-weight:500;color:{k["fgs"]};">'
        f'{icone_tema(16)}Tema</button>'
        f'<a href="{href("Entrar")}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:10px;'
        f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};font-size:13.5px;font-weight:500;color:{k["fgs"]};">{ic("sair", 16)}Sair</a>'
        f'</div></div></nav>')
    veu = f'<div aria-hidden="true" style="position:absolute;inset:0;z-index:30;background:{k["veu"]};"></div>'
    # o sheet cobre o que está no topo da página: corta o fundo na altura do quadro
    return fundo.replace(f'height:{ALTURAS["inicio"]}px;', f'height:{ALTURAS["menu"]}px;', 1)[:-6] + veu + sheet_ + '</div>'


# ── Clientes ──
def tela_clientes_movel(k):
    cards = ''
    for i, (ini, tom, nome, email, plano, status, acesso, desde, pago) in enumerate(CLIENTES[:7]):
        topo_ = (f'{avatar(ini, k, tom, 32)}<span style="display:flex;flex-direction:column;gap:1px;flex:1;min-width:0;">'
                 f'<span style="font-size:14px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
                 f'<span style="font-size:12.5px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{email}</span></span>')
        corpo = fato(k, 'Plano', plano) + fato(k, 'Acesso', acesso) + fato(k, 'Pago', brl(pago) if pago else '—', True)
        cards += cartao_movel(k, topo_, corpo, selo_status(k, status), href('ClienteMovel'))
    corpo = (titulo_movel(k, 'Clientes', contagem=milhar(1284),
                          direita=_toque(k, 'baixar', 'Exportar CSV'))
             + seg_cheio(k, ['Muriki Platform', 'Muriki Code'], PRODUTO, 'Produto')
             + busca_cheia(k, 'Buscar por nome ou e-mail')
             + chips_rolaveis(k, [chip40(k, 'Plano'), chip40(k, 'Último acesso'), chip40(k, 'Desde')])
             + abas_rolaveis(k, [(n, milhar(c)) for n, c in ESTADOS], 'Todos')
             + f'<div style="display:flex;flex-direction:column;gap:10px;">{cards}</div>' + paginacao_movel(k))
    return app_movel(k, 'clientes', 'Clientes', corpo, gap=12)


# ── Detalhe do cliente ──
def tela_cliente_movel(k):
    ids = (f'<p style="margin:0;display:flex;flex-direction:column;gap:2px;font-size:13px;color:{k["mfg"]};">'
           f'<span style="font-family:{MONO};">m***@costa.dev</span><span>cliente desde março de 2026 · último acesso há 2 h</span></p>')
    code = _cartao_produto(k, 'Muriki Code', ('Pro', 'mensal · R$ 49,00'), 'Ativo', [
        ('Próxima cobrança', '12 de outubro'), ('Último pagamento', '12 set · R$ 49,00'), ('Desde', 'março de 2026')],
        _inativar_link(k, 'Muriki Code').replace('height:32px;', 'height:40px;'))
    plat = _cartao_produto(k, 'Muriki Platform', ('Pro', 'mensal · R$ 49,00'), 'Ativo', [
        ('Próxima cobrança', '3 de outubro'), ('Último pagamento', '4 ago · R$ 49,00 (2ª tentativa)'), ('Desde', 'abril de 2026')],
        _inativar_link(k, 'Muriki Platform').replace('height:32px;', 'height:40px;'))
    pags = ''
    for d, p, desc, v, st in PAGAMENTOS[:5]:
        topo_ = (f'<span style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;">'
                 f'<span style="display:flex;align-items:center;gap:8px;"><span style="font-family:{MONO};font-size:14px;font-weight:500;color:{k["fgs"]};">{brl(v)}</span>'
                 f'<span style="flex:1;"></span>{selo_status(k, st)}</span>'
                 f'<span style="font-size:12.5px;color:{k["mfg"]};">{d} · {desc}</span></span>')
        pe = (selo_produto(k, p) + '<span style="flex:1;"></span>'
              + (f'<a href="#" style="display:inline-flex;align-items:center;gap:4px;min-height:40px;font-size:13px;font-weight:500;">Recibo{ic("seta", 12)}</a>'
                 if st == 'Pago' else ''))
        pags += cartao_movel(k, topo_, '', pe)
    corpo = (titulo_movel(k, 'Marina Costa', voltar_para=('Clientes', 'ClientesMovel'), direita=_toque(k, 'copiar', 'Copiar ID')) + ids
             + code + plat
             + abas_rolaveis(k, [('Pagamentos', '14'), ('Histórico', '23')], 'Pagamentos', 'Detalhe do cliente')
             + f'<p style="margin:-2px 0 0;font-size:12px;line-height:17px;color:{k["mfg"]};">Os pagamentos aparecem daqui para frente, conforme o Stripe avisa. Os anteriores ficam no Stripe.</p>'
             + f'<div style="display:flex;flex-direction:column;gap:10px;">{pags}</div>' + paginacao_movel(k))
    return app_movel(k, 'cliente', 'Cliente', corpo, gap=12)


# ── Métricas ──
def tela_metricas_movel(k):
    cores_t = [k['pri'], k['ok'], 'var(--mfg)']
    ini, conv, sem = TESTES_MESES[-2]
    legenda_ = lambda itens: f'<div style="display:flex;flex-wrap:wrap;gap:6px 14px;">{_legenda(k, itens)}</div>'
    testes = secao(k, 'Testes por mês',
                   resumo_2x2(k, [('Taxa em agosto', f'{conv / (conv + sem) * 100:.0f}%'), ('Iniciados', str(ini)), ('Convertidos', str(conv)), ('Sem pagar', str(sem))])
                   + legenda_(zip(['Iniciados', 'Convertidos', 'Encerrados sem pagar'], cores_t))
                   + _barras_movel(k, TESTES_MESES, cores_t, 240, 'Testes por mês: iniciados, convertidos e encerrados sem pagar.') + ver_tabela())
    cores_a = [k['warn'], k['ok'], k['bad']]
    ent, rec, perd = ATRASO_MESES[-2]
    atraso = secao(k, 'Atraso por mês',
                   resumo_2x2(k, [('Em aberto agora', brl(3927, False)), ('Entraram em agosto', str(ent)), ('Recuperadas', str(rec)), ('Perdidas', str(perd))])
                   + legenda_(zip(['Entraram em atraso', 'Recuperadas', 'Perdidas'], cores_a))
                   + _barras_movel(k, ATRASO_MESES, cores_a, 40, 'Atraso por mês: entraram, recuperadas e perdidas.') + ver_tabela())
    corpo = (titulo_movel(k, 'Métricas', 'Os últimos 12 meses. Setembro ainda está em curso.', voltar_para=('Início', 'InicioMovel'))
             + seg_cheio(k, ['Muriki Platform', 'Muriki Code'], PRODUTO, 'Produto') + testes + atraso)
    return app_movel(k, 'metricas', 'Métricas', corpo)


# ── Cupons ──
def _usos_barra(k, usados, limite):
    if not limite:
        return f'<span style="font-family:{MONO};font-size:12px;color:{k["fgs"]};">{milhar(usados)} <span style="color:{k["mfg"]};">/ sem limite</span></span>'
    pct = usados / limite
    cor = k['warn'] if 0.8 <= pct < 1 else (k['mfg'] if pct >= 1 else k['pri'])
    return (f'<span style="display:flex;align-items:center;gap:10px;flex:1;">'
            f'<span style="font-family:{MONO};font-size:12px;color:{k["fgs"]};white-space:nowrap;">{milhar(usados)} <span style="color:{k["mfg"]};">/ {milhar(limite)}</span></span>'
            f'<span style="flex:1;display:block;height:4px;border-radius:999px;background:{k["sunken"]};">'
            f'<span style="display:block;height:4px;width:{min(pct, 1) * 100:.0f}%;border-radius:999px;background:{cor};"></span></span></span>')


def tela_cupons_movel(k):
    cards = ''
    for i, (cod, desc, dur, planos, usados, limite, validade, status) in enumerate(CUPONS[:7]):
        encerrado = status in ('Esgotado', 'Expirado')
        topo_ = (f'<span style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;">'
                 f'<span style="display:flex;align-items:center;gap:8px;">{mono(cod, k, k["mfg"] if encerrado else k["fgs"], 14)}'
                 f'<span style="flex:1;"></span>{selo_status(k, status)}</span>'
                 f'<span style="font-size:13px;color:{k["fg"]};"><b style="font-weight:600;color:{k["fgs"]};">{desc}</b> · {dur}</span></span>')
        corpo = (f'<span style="display:flex;gap:4px;">{"".join(badge(p, k, "gray") for p in planos)}</span>'
                 + fato(k, 'Vale até', validade))
        cards += cartao_movel(k, topo_, corpo, _usos_barra(k, usados, limite), href('CupomMovel') if i == 1 else None)
    corpo = (titulo_movel(k, 'Cupons', contagem='9')
             + seg_cheio(k, ['Muriki Platform', 'Muriki Code'], PRODUTO, 'Produto')
             + botao_cheio(k, 'Novo cupom', href('CupomNovo'), 'solid', 'mais')
             + busca_cheia(k, 'Buscar código')
             + chips_rolaveis(k, [chip40(k, 'Plano'), chip40(k, 'Desconto'), chip40(k, 'Validade')])
             + abas_rolaveis(k, [('Todos', '9'), ('Ativos', '5'), ('Pausados', '1'), ('Encerrados', '3')], 'Todos')
             + f'<div style="display:flex;flex-direction:column;gap:10px;">{cards}</div>' + paginacao_movel(k))
    return app_movel(k, 'cupons', 'Cupons', corpo, gap=12)


def tela_cupom_movel(k):
    cod, desc, dur, planos, usados, limite, validade, status = CUPONS[1]
    pct = usados / limite
    barra = (f'<span style="display:block;height:4px;margin-top:2px;border-radius:999px;background:{k["sunken"]};">'
             f'<span style="display:block;height:4px;width:{pct * 100:.0f}%;border-radius:999px;background:{k["warn"]};"></span></span>')
    celula = lambda html, borda: (f'<div style="display:flex;min-width:0;{borda}">{html}</div>')
    d = lambda *a, **kw: _dado_cupom(k, *a, **kw).replace('padding:14px 18px;', 'padding:12px 14px;')
    dados = (f'<section aria-label="O cupom" style="display:grid;grid-template-columns:1fr 1fr;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};">'
             + celula(d('Desconto', desc, f'{dur}, por cobrança'), f'box-shadow:inset -1px -1px 0 {k["muted"]};')
             + celula(d('Onde vale', ' e '.join(planos), 'só no plano mensal'), f'box-shadow:inset 0 -1px 0 {k["muted"]};')
             + celula(d('Vale até', validade, 'faltam 4 dias'), f'box-shadow:inset -1px 0 0 {k["muted"]};')
             + celula(d('Usos', f'<span style="font-family:{MONO};">{usados} <span style="font-weight:400;color:{k["mfg"]};">/ {limite}</span></span>',
                        f'restam {limite - usados}', extra=barra), '')
             + '</section>')
    regra = (f'<p style="margin:0;display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">'
             f'{ic("check", 13)}Vale uma vez por conta e uma vez por CPF.</p>')
    acoes = (f'<div style="display:flex;gap:8px;">{botao_cheio(k, "Duplicar", href("CupomNovo"), "solid", "duplicar")}'
             f'<button type="button" aria-label="Mais ações: copiar código, pausar" style="display:flex;align-items:center;justify-content:center;'
             f'width:44px;height:44px;flex:0 0 auto;border:0;border-radius:11px;box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};color:{k["fgs"]};">'
             f'{ic("pontos", 18)}</button></div>')
    usos = ''
    for ini, tom, nome, email, plano, quando in USOS[:6]:
        topo_ = (f'{avatar(ini, k, tom, 32)}<span style="display:flex;flex-direction:column;gap:1px;flex:1;min-width:0;">'
                 f'<span style="font-size:14px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
                 f'<span style="font-family:{MONO};font-size:12px;color:{k["mfg"]};">{email}</span>'
                 f'<span style="display:flex;align-items:center;gap:8px;margin-top:4px;">{badge(plano, k, "gray")}'
                 f'<span style="font-size:12.5px;color:{k["mfg"]};">{quando}</span></span></span>')
        usos += (f'<a href="{href("ClienteMovel")}" style="display:flex;align-items:center;gap:10px;padding:12px 10px 12px 14px;border-radius:12px;'
                 f'background:{k["card"]};box-shadow:{k["sombra"]};color:inherit;">{topo_}'
                 f'<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;color:{k["mfg"]};">{ic("direita", 16)}</span></a>')
    titulo = (f'<span style="display:flex;align-items:center;gap:10px;"><span style="font-family:{MONO};letter-spacing:0.02em;">{cod}</span>'
              f'{selo_status(k, status)}</span>')
    corpo = (titulo_movel(k, titulo, 'Criado por Ana Lima em 2 de julho de 2026', voltar_para=('Cupons', 'CuponsMovel'))
             + acoes + dados + regra
             + f'<h2 style="margin:8px 0 0;display:flex;align-items:baseline;gap:10px;font-size:16px;font-weight:600;color:{k["fgs"]};">'
             f'Usos<span style="font-family:{MONO};font-size:12px;font-weight:400;color:{k["mfg"]};">{usados}</span></h2>'
             + f'<div style="display:flex;flex-direction:column;gap:10px;">{usos}</div>' + paginacao_movel(k))
    return app_movel(k, 'cupom', 'Cupom', corpo, gap=12)


# ── Planos ──
def tela_planos_movel(k):
    cards = ''
    for i, (nome, slug, mensal, anual, n, mrr, teste, status) in enumerate(PLANOS):
        if mensal is None:
            preco = f'<span style="font-size:13px;color:{k["mfg"]};">sob consulta</span>'
        elif mensal == 0:
            preco = f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Grátis</span>'
        else:
            preco = (f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">{brl(mensal, False)}<span style="font-size:12.5px;font-weight:400;color:{k["mfg"]};">/mês</span></span>'
                     f'<span style="font-size:12.5px;color:{k["mfg"]};">{brl(anual, False)}/ano</span>')
        topo_ = (f'<span style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
                 f'<span style="display:flex;align-items:center;gap:8px;"><span style="font-size:15px;font-weight:600;color:{k["fgs"]};">{nome}</span>'
                 f'{mono(slug, k, k["mfg"], 11.5)}<span style="flex:1;"></span>{selo_status(k, status)}</span>'
                 f'<span style="display:flex;align-items:baseline;gap:10px;">{preco}</span></span>')
        lig = ligadas(i)
        corpo = (fato(k, 'Clientes', milhar(n) if n else '—', True) + fato(k, 'MRR', brl(mrr, False) if mrr else '—', True)
                 + fato(k, 'Teste', f'{teste} dias' if teste else '—'))
        pe = (f'<span style="display:flex;align-items:center;gap:8px;flex:1;"><span style="display:flex;gap:2px;">'
              + ''.join(f'<span style="width:4px;height:12px;border-radius:1px;background:{k["pri"] if j < lig else k["sunken"]};"></span>'
                        for j in range(len(FEATURES)))
              + f'</span><span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};">{lig}/{len(FEATURES)} features</span></span>'
              f'<a href="{href("Plano")}" style="display:inline-flex;align-items:center;min-height:40px;font-size:13px;font-weight:500;">Editar</a>')
        cards += cartao_movel(k, topo_, corpo, pe)

    def regra(icone, tit, txt):
        return (f'<li style="display:flex;gap:10px;align-items:flex-start;">'
                f'<span style="margin-top:2px;display:flex;color:{k["mfg"]};">{ic(icone, 15)}</span>'
                f'<span style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{tit}</span>'
                f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{txt}</span></span></li>')
    regras = (f'<ul style="margin:4px 0 0;padding:16px 0 0;list-style:none;display:flex;flex-direction:column;gap:14px;box-shadow:inset 0 1px 0 {k["muted"]};">'
              + regra('raio', 'Feature nasce uma vez', 'Chave e tipo são do produto. O plano só escolhe o valor: ligada, desligada ou um limite.')
              + regra('relogio', 'Preço novo vale para quem chega', 'Quem já assina mantém o preço que tinha.')
              + regra('bloqueio', 'Plano com cliente não se apaga', 'Arquive: ele sai da página de preços e quem está nele continua.')
              + '</ul>')
    corpo = (titulo_movel(k, 'Planos', contagem=str(len(PLANOS)), direita=_toque(k, 'grade', 'Matriz de features', k['fgs'], href('Features')))
             + botao_cheio(k, 'Novo plano', href('Plano'), 'solid', 'mais')
             + abas_rolaveis(k, [('Todos', '4'), ('Ativos', '3'), ('Rascunhos', '1'), ('Arquivados', '0')], 'Todos')
             + f'<div style="display:flex;flex-direction:column;gap:10px;">{cards}</div>' + regras)
    return app_movel(k, 'planos', 'Planos', corpo, gap=12)


MOVEIS = {
    # id: (função, chave da altura)
    'inicio_movel': (tela_inicio_movel, 'inicio'),
    'menu_movel': (tela_menu_movel, 'menu'),
    'clientes_movel': (tela_clientes_movel, 'clientes'),
    'cliente_movel': (tela_cliente_movel, 'cliente'),
    'metricas_movel': (tela_metricas_movel, 'metricas'),
    'cupons_movel': (tela_cupons_movel, 'cupons'),
    'cupom_movel': (tela_cupom_movel, 'cupom'),
    'planos_movel': (tela_planos_movel, 'planos'),
}


def montar_movel(tela, tema):
    fn, chave = MOVEIS[tela['id']]
    sufixo = '' if tema == 'claro' else 'Escuro'
    return pagina_movel(tela['titulo'], fn(K), tema, ALTURAS[chave]).replace('__SUF__', sufixo)
