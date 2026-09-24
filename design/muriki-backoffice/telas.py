import json
from pecas import *  # noqa: F401,F403
from pecas import (K, W, H, FONTE, MONO, LOGO, I, ic, badge, legenda, rotulo, mono, raiz, app, cabecalho, campo, seletor,
                   switch, switch_dinamico, caixa, radio, segmentado, botao_icone, link_botao, barra_recurso, filtro_chip,
                   tabela, linha_tabela, acoes_linha, paginacao, selo_status, sheet, secao_sheet, alerta, avatar, href,
                   brl, milhar, botao_tema)


# ── Entrada: o bloco login-page do DS, com a mensagem do backoffice ─────
# Estrutura e medidas vêm de registry/muriki/blocks/login-page. O que é do backoffice: sem
# criar conta (a equipe entra por convite), sem provedor social e sem passkey — a API da equipe
# não tem. São dois passos na tela (senha, depois código em quadrados), mas um POST só: a API
# recebe e-mail, senha e código juntos, e qualquer um errado volta o mesmo 401.
def _painel(k):
    linha = lambda cor, larg: f'<span style="height:1px;{larg}background:{cor};"></span>'
    deco = (
        f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;'
        f'background:linear-gradient(to bottom right, color-mix(in oklch, {k["pri"]} 15%, transparent), transparent 50%, transparent);"></div>'
        f'<div aria-hidden="true" style="position:absolute;top:-96px;left:-96px;width:520px;height:520px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["pri"]} 20%, transparent);filter:blur(160px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:0;bottom:0;width:420px;height:420px;border-radius:999px;'
        f'transform:translate(33.333%, 25%);background:color-mix(in oklch, {k["accent"]} 25%, transparent);filter:blur(120px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:-40px;bottom:-64px;width:480px;height:480px;display:flex;'
        f'opacity:0.08;transform:rotate(-6deg);pointer-events:none;">{LOGO}</div>')
    return (
        f'<aside style="position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;'
        f'padding:64px;background:{k["sunken"]};box-shadow:inset -1px 0 0 {k["border"]};">{deco}'
        f'<div style="position:relative;z-index:1;display:flex;align-items:center;gap:10px;">'
        f'<span style="display:flex;width:36px;height:36px;">{LOGO}</span>{legenda("muriki / backoffice", k)}</div>'
        f'<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:24px;max-width:512px;">'
        f'<div style="display:flex;align-items:center;gap:12px;">{legenda("Uso interno", k, "0.3em")}{linha(k["pri"], "width:64px;")}</div>'
        f'<h2 style="margin:0;font-size:72px;line-height:0.95;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
        f'A operação<br><span style="color:{k["pri"]};">inteira.</span></h2>'
        f'<p style="margin:0;max-width:384px;font-size:16px;line-height:1.625;color:{k["mfg"]};">'
        f'Clientes, planos e cupons do Muriki num lugar só. Cada mudança fica registrada com quem fez e quando.</p></div>'
        f'<div style="position:relative;z-index:1;">{legenda("© 2026 Muriki · acesso restrito à equipe", k)}</div></aside>')


def _campo_editorial(k, id_, rot, icone, tipo, valor, ph, cabeca='', olho=False, auto='', extra_input=''):
    o = (f'<span aria-hidden="true" style="position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;'
         f'width:32px;height:32px;align-items:center;justify-content:center;color:{k["mfg"]};">{ic("olho", 18)}</span>') if olho else ''
    v = f' value="{valor}"' if valor else ''
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<div style="display:flex;align-items:center;justify-content:space-between;">'
            f'<label for="{id_}" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.25em;'
            f'text-transform:uppercase;color:{k["mfg"]};">{rot}</label>{cabeca}</div>'
            f'<div style="position:relative;display:flex;align-items:center;">'
            f'<span style="position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;opacity:0.6;color:{k["mfg"]};">{ic(icone, 18)}</span>'
            f'<input id="{id_}" type="{tipo}" autocomplete="{auto}" placeholder="{ph}"{v}{extra_input} '
            f'style="width:100%;height:44px;padding:0 {36 if olho else 0}px 0 28px;border:0;border-bottom:1px solid {k["input"]};'
            f'border-radius:0;background:transparent;font-family:{FONTE};font-size:16px;color:{k["fgs"]};outline:0;">{o}</div></div>')


def _enviar(k, txt, destino):
    return (f'<a href="{destino}" style="display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 20px;'
            f'border-radius:10px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;letter-spacing:0.025em;">'
            f'<span>{txt}</span><span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["prifg"]} 15%, transparent);">{ic("seta", 14)}</span></a>')


def _voltar(k, txt, destino):
    return (f'<a href="{destino}" style="align-self:flex-start;font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.2em;'
            f'text-transform:uppercase;color:{k["mfg"]};">{txt}</a>')


def tela_acesso(k, modo):
    linha = lambda cor, larg: f'<span style="height:1px;{larg}background:{cor};"></span>'
    titulo_legenda, hero_a, hero_b, sub = {
        'entrar': ('Entrar', 'Backoffice', 'Muriki.', 'Só para a equipe. Sem acesso? Peça um convite a quem administra. Depois da senha, o código do app autenticador.'),
        'totp': ('Segundo fator', 'Mais um', 'passo.', 'Agora o código do seu app autenticador. A gente confere tudo junto.'),
    }[modo]

    if modo == 'entrar':
        esqueci = (f'<a href="#" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.2em;'
                   f'text-transform:uppercase;color:{k["mfg"]};">Esqueci a senha</a>')
        corpo = (
            f'<form style="display:flex;flex-direction:column;gap:24px;margin:0;">'
            f'{_campo_editorial(k, "email", "E-mail", "envelope", "email", "", "voce@muriki.app", auto="username")}'
            f'{_campo_editorial(k, "senha", "Senha", "cadeado", "password", "", "Sua senha", cabeca=esqueci, olho=True, auto="current-password")}'
            f'{_enviar(k, "Continuar", href("SegundoFator"))}</form>')
    else:
        codigo = '{{codigo}}'
        corpo = (
            f'<div style="display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:8px;background:{k["card"]};'
            f'box-shadow:inset 0 0 0 1px {k["border"]};">'
            f'<span style="margin-top:2px;display:flex;color:{k["pri"]};">{ic("escudo", 18)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0;">'
            f'<div><p style="margin:0;font-size:14px;font-weight:500;color:{k["fgs"]};">Verificação em duas etapas</p>'
            f'<p style="margin:4px 0 0;font-size:12px;color:{k["mfg"]};">Abra o app autenticador e digite o código de {{{{n}}}} dígitos.</p>'
            f'<p style="margin:4px 0 0;font-family:{MONO};font-size:11px;color:{k["mfg"]};">ana.lima@muriki.app</p></div>'
            f'<div style="display:flex;flex-direction:column;gap:8px;">'
            f'<label for="codigo" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:{k["mfg"]};">Código</label>'
            # um <input> de verdade por cima dos quadrados: é ele que recebe o teclado, o colar e o autocomplete do SMS/app
            f'<div style="position:relative;display:flex;gap:8px;">'
            f'<sc-for list="{{{{caixas}}}}" as="q" hint-placeholder-count="6">'
            f'<span aria-hidden="true" style="flex:1;max-width:52px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:10px;'
            f'background:{k["field"]};box-shadow:{{{{q.sombra}}}};font-family:{MONO};font-size:22px;font-weight:500;color:{k["fgs"]};">{{{{q.c}}}}</span>'
            f'</sc-for>'
            f'<input id="codigo" inputmode="numeric" autocomplete="one-time-code" aria-describedby="codigo-dica" maxlength="{{{{n}}}}" value="{codigo}" onChange="{{{{mudarCodigo}}}}" '
            f'style="position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0;font-size:16px;cursor:text;"></div>'
            f'<span id="codigo-dica" style="font-size:12px;color:{k["mfg"]};">{{{{dica}}}}</span></div>'
            f'{_voltar(k, "Voltar para a senha", href("Entrar"))}</div></div>'
            f'{_enviar(k, "Verificar", href("Inicio"))}'
            f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">Perdeu o app? '
            f'<a href="#" style="font-weight:500;color:{k["fg"]};">Use um código de recuperação</a>.</span>')

    formulario = (
        f'<div style="grid-column:2;display:flex;flex-direction:column;gap:20px;">'
        f'<div style="display:flex;align-items:center;gap:12px;">{legenda(titulo_legenda, k)}{linha(k["pri"], "width:40px;")}{linha(k["input"], "flex:1;")}</div>'
        f'<div style="display:flex;flex-direction:column;gap:12px;">'
        f'<h1 style="margin:0;font-size:36px;line-height:1;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
        f'{hero_a}<br><span style="color:{k["pri"]};">{hero_b}</span></h1>'
        f'<p style="margin:0;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p></div>{corpo}</div>')
    lado = (f'<main style="position:relative;display:flex;flex-direction:column;min-width:0;">'
            f'<header style="display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:32px 48px 0;">{botao_tema(k)}</header>'
            f'<div style="flex:1;display:grid;grid-template-columns:minmax(0, 0.8fr) minmax(0, 440px) minmax(0, 1fr);'
            f'align-content:center;padding:24px 80px 56px;">{formulario}</div></main>')
    return f'{raiz(k, "display:grid;grid-template-columns:1.05fr 1fr;")}{_painel(k)}{lado}</div>'


ANTES_TOTP = """const n = Number(this.props.digitos || 6);
const codigo = (s.codigo == null ? "4829" : s.codigo).slice(0, n);
const ativo = Math.min(codigo.length, n - 1);
const caixas = Array.from({ length: n }, (_, i) => ({
  c: codigo[i] || "",
  sombra: i === ativo && codigo.length < n
    ? "inset 0 0 0 1px var(--pri), 0 0 0 3px color-mix(in oklch, var(--pri) 20%, transparent)"
    : codigo[i] ? "inset 0 0 0 1px var(--input)" : "inset 0 0 0 1px color-mix(in oklch, var(--input) 55%, transparent)"
}));
const falta = n - codigo.length;
const dica = falta === 0 ? "Pronto. Verificar manda e-mail, senha e código juntos." : "Faltam " + falta + (falta === 1 ? " dígito." : " dígitos.");"""
VALORES_TOTP = 'n: n,\ncodigo: codigo,\ncaixas: caixas,\ndica: dica,\nmudarCodigo: (e) => this.setState({ codigo: e.target.value.replace(/\\D/g, "").slice(0, n) })'
PROPS_TOTP = {'digitos': {'editor': 'enum', 'options': ['4', '6'], 'default': '6'}}


# ── Dados de exemplo, um conjunto só para todas as telas ───────────────
PLANOS = [
    # nome, slug, mensal, anual, clientes, mrr, teste, status
    ('Starter', 'starter', 0, 0, 472, 0, None, 'Ativo'),
    ('Pro', 'pro', 49, 470, 764, 34768, 14, 'Ativo'),
    ('Team', 'team', 149, 1430, 48, 7152, 14, 'Ativo'),
    ('Enterprise', 'enterprise', None, None, 0, 0, None, 'Rascunho'),
]
TOTAL_CLIENTES = sum(p[4] for p in PLANOS)
MRR = sum(p[5] for p in PLANOS)

# vendas fechadas por mês, em reais, de out/2025 a set/2026 (set parcial)
MESES = ['out', 'nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set']
VENDAS = [8240, 11530, 14870, 17810, 21390, 25320, 29610, 33790, 38140, 41720, 44930, 36180]
VENDIDO = sum(VENDAS)

CLIENTES = [
    # iniciais, tom, nome, email, plano, status, último acesso, desde, total pago
    ('MC', 'blue', 'Marina Costa', 'marina@costa.dev', 'Pro', 'Ativo', 'há 2 h', 'mar 2026', 343),
    ('RM', 'green', 'Rafael Moura', 'rafael@moura.dev', 'Pro', 'Ativo', 'há 20 min', 'jan 2026', 470),
    ('BN', 'orange', 'Beatriz Nunes', 'bia@nunes.io', 'Team', 'Inadimplente', 'há 6 dias', 'nov 2025', 1341),
    ('TA', 'yellow', 'Tiago Albuquerque', 'tiago@albuquerque.com', 'Pro', 'Em teste', 'ontem', 'set 2026', 0),
    ('LF', 'blue', 'Lucas Ferraz', 'lucas.ferraz@gmail.com', 'Starter', 'Ativo', 'há 3 dias', 'jul 2026', 0),
    ('CR', 'green', 'Camila Rocha', 'camila@rocha.design', 'Team', 'Ativo', 'há 1 h', 'out 2025', 1788),
    ('JL', 'gray', 'João Pedro Lima', 'jp@lima.dev', 'Pro', 'Revogado', 'há 2 meses', 'fev 2026', 196),
    ('HD', 'yellow', 'Helena Duarte', 'helena@duarte.app', 'Pro', 'Ativo', 'agora', 'abr 2026', 470),
    ('OP', 'orange', 'Otávio Prado', 'otavio.prado@outlook.com', 'Starter', 'Ativo', 'há 5 h', 'ago 2026', 0),
    ('SM', 'blue', 'Sofia Martins', 'sofia@martins.co', 'Pro', 'Em teste', 'há 12 min', 'set 2026', 0),
]


# ── Início ──────────────────────────────────────────────────────────────
def _kpi(k, rot, valor, detalhe, sub, hero=False):
    tam = 34 if hero else 28
    return (f'<section aria-label="{rot}" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:18px 20px;display:flex;flex-direction:column;gap:8px;">'
            f'<span style="font-size:13px;font-weight:500;color:{k["mfg"]};">{rot}</span>'
            f'<span style="font-size:{tam}px;line-height:{tam + 6}px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};'
            f'font-variant-numeric:tabular-nums;">{valor}</span>'
            f'<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">{detalhe}{sub}</span></section>')


def _delta(k, txt):
    return (f'<span style="display:inline-flex;align-items:center;gap:3px;font-weight:500;color:{k["ok"]};">'
            f'{ic("evolucao", 13)}{txt}</span>')


def _grafico_vendas(k):
    # uma série só, magnitude no tempo: barras numa cor, sem legenda, rótulo direto só no mês corrente
    w, h, esq, base, topo = 700, 230, 44, 204, 12
    teto = 50000
    passo = (w - esq) / len(VENDAS)
    larg = passo - 14
    y = lambda v: base - (base - topo) * v / teto
    grade = ''
    for v in (0, 10000, 20000, 30000, 40000, 50000):
        grade += (f'<line x1="{esq}" x2="{w}" y1="{y(v):.1f}" y2="{y(v):.1f}" style="stroke:var(--muted);stroke-width:1;"/>'
                  f'<text x="{esq - 8}" y="{y(v) + 4:.1f}" text-anchor="end" style="fill:var(--mfg);font-family:{MONO};font-size:10.5px;">'
                  f'{"0" if v == 0 else f"{v // 1000}k"}</text>')
    barras = ''
    for i, (m, v) in enumerate(zip(MESES, VENDAS)):
        x = esq + i * passo + 7
        yy = y(v)
        ultimo = i == len(VENDAS) - 1
        # 4px arredondados só no topo, ancorado na linha de base
        d = (f'M{x:.1f},{base} V{yy + 4:.1f} Q{x:.1f},{yy:.1f} {x + 4:.1f},{yy:.1f} H{x + larg - 4:.1f} '
             f'Q{x + larg:.1f},{yy:.1f} {x + larg:.1f},{yy + 4:.1f} V{base} Z')
        est = ('fill:color-mix(in oklch, var(--pri) 45%, transparent);' if ultimo else 'fill:var(--pri);')
        barras += (f'<g><title>{m}: {brl(v, False)}{" (mês em curso)" if ultimo else ""}</title>'
                   f'<rect x="{x - 4:.1f}" y="{topo}" width="{larg + 8:.1f}" height="{base - topo}" style="fill:transparent;"/>'
                   f'<path d="{d}" style="{est}"/></g>'
                   f'<text x="{x + larg / 2:.1f}" y="{base + 18}" text-anchor="middle" style="fill:var(--mfg);font-family:{MONO};font-size:10.5px;">{m}</text>')
    pico = VENDAS.index(max(VENDAS))
    xp = esq + pico * passo + 7 + larg / 2
    rotulo_pico = (f'<text x="{xp:.1f}" y="{y(max(VENDAS)) - 8:.1f}" text-anchor="middle" style="fill:var(--fgs);font-family:{FONTE};'
                   f'font-size:11.5px;font-weight:500;">{brl(max(VENDAS), False)}</text>')
    return (f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" role="img" '
            f'aria-label="Vendas por mês, de outubro de 2025 a setembro de 2026. Pico em agosto, {brl(max(VENDAS), False)}.">'
            f'{grade}{barras}{rotulo_pico}</svg>')


def tela_inicio(k):
    cab = cabecalho(k, 'Bom dia, Ana', 'Quarta, 23 de setembro. Quem está com a gente e quanto já entrou.',
                    direita=segmentado(k, ['30 dias', '12 meses', 'Tudo'], 'Tudo', 'Período'))
    kpis = (f'<div style="display:flex;gap:16px;">'
            + _kpi(k, 'Clientes', milhar(TOTAL_CLIENTES), _delta(k, '+46'), 'nos últimos 30 dias', hero=True)
            + _kpi(k, 'Vendido até agora', brl(VENDIDO), '', 'desde o lançamento, já sem os descontos de cupom', hero=True)
            + _kpi(k, 'Receita recorrente (MRR)', brl(MRR, False), _delta(k, '+6,8%'), 'sobre agosto')
            + '</div>')

    grafico = (f'<section aria-label="Vendas por mês" style="flex:2;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
               f'padding:16px 20px 12px;display:flex;flex-direction:column;gap:10px;">'
               f'<div style="display:flex;align-items:baseline;gap:10px;"><h2 style="margin:0;font-size:14px;font-weight:600;color:{k["fgs"]};">Vendas por mês</h2>'
               f'<span style="font-size:12.5px;color:{k["mfg"]};">últimos 12 meses · setembro em curso</span>'
               f'<span style="flex:1;"></span><a href="#" style="font-size:12.5px;">Ver como tabela</a></div>{_grafico_vendas(k)}</section>')

    maior = max(p[4] for p in PLANOS)
    linhas_planos = ''
    for nome, slug, mensal, anual, n, mrr, teste, status in PLANOS:
        if status != 'Ativo':
            continue
        pct = n / TOTAL_CLIENTES * 100
        linhas_planos += (
            f'<a href="{href("Plano") if nome == "Pro" else "#"}" style="display:flex;flex-direction:column;gap:6px;color:inherit;">'
            f'<span style="display:flex;align-items:baseline;gap:8px;">'
            f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
            f'<span style="font-size:12px;color:{k["mfg"]};">{brl(mensal, False) + "/mês" if mensal else "grátis"}</span>'
            f'<span style="flex:1;"></span><span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};">{milhar(n)}</span>'
            f'<span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};width:40px;text-align:right;">{pct:.0f}%</span></span>'
            f'<span style="display:block;height:8px;border-radius:3px;background:{k["sunken"]};">'
            f'<span style="display:block;height:8px;width:{n / maior * 100:.1f}%;border-radius:3px;background:{k["pri"]};"></span></span>'
            f'<span style="font-size:12px;color:{k["mfg"]};">{brl(mrr, False) + " de MRR" if mrr else "sem receita, porta de entrada"}</span></a>')
    planos = (f'<section aria-label="Clientes por plano" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
              f'padding:16px 20px;display:flex;flex-direction:column;gap:16px;">'
              f'<div style="display:flex;align-items:baseline;"><h2 style="margin:0;font-size:14px;font-weight:600;color:{k["fgs"]};">Clientes por plano</h2>'
              f'<span style="flex:1;"></span><a href="{href("Planos")}" style="font-size:12.5px;">Planos</a></div>{linhas_planos}'
              f'<span style="margin-top:auto;font-size:12px;color:{k["mfg"]};">Enterprise está em rascunho e não aparece na página de preços.</span></section>')

    vendas = [('HD', 'yellow', 'Helena Duarte', 'Pro anual', None, 470, 'agora'),
              ('SM', 'blue', 'Sofia Martins', 'Pro mensal', 'BEMVINDO20', 39.2, 'há 12 min'),
              ('CR', 'green', 'Camila Rocha', 'Team mensal', None, 149, 'há 1 h'),
              ('MC', 'blue', 'Marina Costa', 'Pro mensal', None, 49, 'há 2 h')]
    lv = ''
    for ini, tom, nome, plano, cupom, valor, quando in vendas:
        c = badge(cupom, k, 'yellow', mono=True) if cupom else ''
        lv += (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 210px 110px 80px;gap:12px;align-items:center;height:44px;'
               f'box-shadow:inset 0 -1px 0 {k["muted"]};">'
               f'<span style="display:flex;align-items:center;gap:10px;min-width:0;">{avatar(ini, k, tom, 26)}'
               f'<span style="font-size:13.5px;color:{k["fgs"]};">{nome}</span></span>'
               f'<span style="display:flex;align-items:center;gap:6px;font-size:13px;color:{k["fg"]};white-space:nowrap;">{plano}{c}</span>'
               f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};text-align:right;">{brl(valor)}</span>'
               f'<span style="font-size:12px;color:{k["mfg"]};text-align:right;">{quando}</span></div>')
    recentes = (f'<section aria-label="Vendas recentes" style="flex:2;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
                f'padding:16px 20px 8px;display:flex;flex-direction:column;">'
                f'<div style="display:flex;align-items:baseline;padding-bottom:6px;"><h2 style="margin:0;font-size:14px;font-weight:600;color:{k["fgs"]};">Vendas recentes</h2>'
                f'<span style="flex:1;"></span><a href="{href("Clientes")}" style="font-size:12.5px;">Clientes</a></div>{lv}</section>')

    def atencao(icone, cor, txt, sub, destino):
        return (f'<a href="{destino}" style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;box-shadow:inset 0 -1px 0 {k["muted"]};color:inherit;">'
                f'<span style="margin-top:2px;display:flex;color:{cor};">{ic(icone, 15)}</span>'
                f'<span style="display:flex;flex-direction:column;gap:1px;flex:1;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{txt}</span>'
                f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span></span>'
                f'<span style="display:flex;color:{k["mfg"]};margin-top:2px;">{ic("direita", 13)}</span></a>')
    pendencias = (f'<section aria-label="Pede atenção" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
                  f'padding:16px 20px 6px;display:flex;flex-direction:column;">'
                  f'<h2 style="margin:0 0 4px;font-size:14px;font-weight:600;color:{k["fgs"]};">Pede atenção</h2>'
                  f'{atencao("aviso", k["warn"], "41 clientes inadimplentes", "R$ 3.927 em aberto, o mais antigo há 18 dias", href("Clientes"))}'
                  f'{atencao("cupom", k["mfg"], "PRO50 perto do fim", "88 de 100 usos, vale até 30 de setembro", href("Cupons"))}'
                  f'{atencao("relogio", k["mfg"], "96 testes terminam esta semana", "Pro e Team, 14 dias sem cartão", href("Clientes"))}</section>')

    corpo = (cab + kpis + f'<div style="display:flex;gap:16px;">{grafico}{planos}</div>'
             + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{recentes}{pendencias}</div>')
    return app(k, 'inicio', corpo, gap=18)


# ── Clientes: a tela que vira o molde do CRUD ──────────────────────────
COLS_CLIENTES = '16px minmax(0,2.4fr) 96px 132px 120px 96px 110px 100px'


def tela_clientes(k, hover=2, sobre=''):
    cab = cabecalho(k, 'Clientes', contagem=milhar(TOTAL_CLIENTES),
                    direita=link_botao(k, 'Novo cliente', href('ClienteEditar'), 'solid', 36, 'mais'))
    barra = barra_recurso(k, 'Buscar por nome, e-mail ou documento',
                          [('Todos', '1.284'), ('Ativos', '1.108'), ('Em teste', '96'), ('Inadimplentes', '41'), ('Revogados', '39')],
                          'Todos', filtro_chip(k, 'Plano') + filtro_chip(k, 'Último acesso'))
    cab_t = [(caixa(k, False, 'Selecionar todos'), 'esq', False), ('Cliente', 'esq', True), ('Plano', 'esq', True),
             ('Status', 'esq', True), ('Último acesso', 'esq', True), ('Desde', 'esq', True), ('Total pago', 'dir', True), ('', 'dir', False)]
    linhas = ''
    for i, (ini, tom, nome, email, plano, status, acesso, desde, pago) in enumerate(CLIENTES):
        revogado = status == 'Revogado'
        cor = k['mfg'] if revogado else k['fgs']
        if revogado:
            itens = [('chave', 'Devolver acesso', '#', False), ('lapis', 'Editar', href('ClienteEditar'), False), ('pontos', 'Mais ações', None, False)]
        else:
            itens = [('lapis', 'Editar', href('ClienteEditar'), False), ('bloqueio', 'Revogar acesso', href('Revogar'), True),
                     ('pontos', 'Mais ações', None, False)]
        cel = [
            caixa(k, False, f'Selecionar {nome}'),
            f'<a href="{href("ClienteEditar")}" style="display:flex;align-items:center;gap:10px;min-width:0;color:inherit;">'
            f'{avatar(ini, k, "gray" if revogado else tom)}<span style="display:flex;flex-direction:column;min-width:0;">'
            f'<span style="font-size:13.5px;font-weight:500;color:{cor};">{nome}</span>'
            f'<span style="font-size:12px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{email}</span></span></a>',
            f'<span style="font-size:13px;color:{k["fg"]};">{plano}</span>',
            selo_status(k, status),
            f'<span style="font-size:13px;color:{k["mfg"]};">{acesso}</span>',
            f'<span style="font-size:13px;color:{k["mfg"]};">{desde}</span>',
            f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"] if pago else k["mfg"]};text-align:right;">{brl(pago) if pago else "—"}</span>',
            acoes_linha(k, i == hover, itens),
        ]
        linhas += linha_tabela(k, COLS_CLIENTES, cel, hover=i == hover)
    t = tabela(k, COLS_CLIENTES, cab_t, linhas, paginacao(k, '1–10 de 1.284', 1, 129))
    return app(k, 'clientes', cab + barra + t, sobre=sobre, gap=16)


def tela_cliente_editar(k):
    duas = lambda a, b: f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">{a}{b}</div>'
    dados = secao_sheet(k, 'Dados', (
        duas(campo(k, 'Nome', 'Marina Costa', id_='nome'), campo(k, 'E-mail', 'marina@costa.dev', id_='email'))
        + f'<span style="margin-top:-6px;font-size:12px;color:{k["mfg"]};">O e-mail é também o login. Mudar pede confirmação no endereço novo.</span>'
        + duas(campo(k, 'CPF ou CNPJ', '412.887.310-54', monoespaco=True, id_='doc'),
               campo(k, 'Telefone', '+55 11 98812-4471', id_='tel'))))
    plano = secao_sheet(k, 'Assinatura', (
        duas(seletor(k, 'Plano', 'Pro · R$ 49/mês'), seletor(k, 'Ciclo', 'Mensal'))
        + campo(k, 'Cupom', 'BEMVINDO20', monoespaco=True, dica='20% nos 3 primeiros meses · falta 1 mês', id_='cupom',
                sufixo='')
        + f'<span style="font-size:12px;color:{k["mfg"]};">Próxima cobrança em 12 de outubro, {brl(39.2)}. '
          f'Troca de plano vale no próximo ciclo.</span>'))

    def linha_acesso(rot, sub, controle):
        return (f'<div style="display:flex;align-items:center;gap:12px;">'
                f'<span style="display:flex;flex-direction:column;gap:1px;flex:1;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{rot}</span>'
                f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span></span>{controle}</div>')
    acesso = secao_sheet(k, 'Acesso', (
        linha_acesso('Acesso ao produto', 'Último acesso há 2 h · Chrome no macOS', badge('Liberado', k, 'green', ponto=True))
        + linha_acesso('Verificação em duas etapas', 'App autenticador desde abril', badge('Ativa', k, 'gray'))
        + linha_acesso('Sessões abertas', '2 dispositivos', link_botao(k, 'Encerrar sessões', '#', 'ghost', 28))
        + f'<div style="display:flex;gap:8px;">{link_botao(k, "Enviar redefinição de senha", "#", "outline", 32, "envelope")}</div>'
        + f'<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:9px;box-shadow:inset 0 0 0 1px {k["tred"]};">'
          f'<span style="display:flex;flex-direction:column;gap:1px;flex:1;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">Revogar acesso</span>'
          f'<span style="font-size:12px;color:{k["mfg"]};">Derruba as sessões e bloqueia o login. A assinatura fica como está.</span></span>'
          f'<a href="{href("Revogar")}" style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;'
          f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};color:{k["bad"]};font-size:13px;font-weight:500;">'
          f'{ic("bloqueio", 14)}Revogar</a></div>'))
    rodape = (f'<span style="font-size:12px;color:{k["mfg"]};flex:1;">Editado por Ana Lima há 3 dias</span>'
              f'{link_botao(k, "Cancelar", href("Clientes"), "ghost", 36)}{link_botao(k, "Salvar alterações", href("Clientes"), "solid", 36)}')
    s = sheet(k, 'Editar cliente', 'Marina Costa · cliente desde março de 2026', dados + acesso + plano, rodape)
    return tela_clientes(k, hover=0, sobre=s)


def tela_revogar(k):
    corpo = (seletor(k, 'Motivo', 'Pedido do próprio cliente', dica='Fica no histórico do cliente, junto com seu nome.')
             + f'<label style="display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:19px;color:{k["fg"]};cursor:pointer;">'
               f'<span style="margin-top:2px;display:flex;">{caixa(k, False, "Cancelar a assinatura")}</span>'
               f'<span>Cancelar também a assinatura no fim do ciclo <span style="color:{k["mfg"]};">(12 de outubro)</span></span></label>')
    rodape = (link_botao(k, 'Cancelar', href('Clientes'), 'outline', 36)
              + link_botao(k, 'Revogar acesso', href('Clientes'), 'destrutivo', 36))
    a = alerta(k, 'Revogar o acesso de Marina Costa?',
               'Ela sai de todas as sessões agora e não entra de novo até alguém devolver o acesso. '
               'Assinatura, faturas e histórico ficam como estão.', corpo, rodape, icone='bloqueio')
    return tela_clientes(k, hover=0, sobre=a)


# ── Planos e features ──────────────────────────────────────────────────
# Feature é uma chave com tipo — liga/desliga ou limite — criada uma vez para o produto
# inteiro. O plano não cria feature: só escolhe o valor de cada uma.
FEATURES = [
    # grupo, nome, chave, tipo, valores (Starter, Pro, Team, Enterprise); limite: número, 'inf' ou None (depende)
    ('Aprender', 'Exercícios por mês', 'exercicios.mes', 'limite', [10, 60, 'inf', 'inf'], ''),
    ('Aprender', 'Trilhas', 'trilhas', 'bool', [True, True, True, True], ''),
    ('Aprender', 'Avaliação com rubrica', 'avaliacao.rubrica', 'bool', [False, True, True, True], ''),
    ('Aprender', 'Playground', 'playground', 'bool', [True, True, True, True], ''),
    ('Peer', 'Peer na IDE', 'peer.ide', 'bool', [False, True, True, True], ''),
    ('Peer', 'Mensagens com o Peer', 'peer.mensagens', 'limite', [None, 'inf', 'inf', 'inf'], 'por dia'),
    ('Peer', 'Modelos avançados', 'peer.modelos_avancados', 'bool', [False, False, True, True], ''),
    ('Conta', 'Assentos', 'conta.assentos', 'limite', [1, 1, 10, 'inf'], 'pessoas'),
    ('Conta', 'Histórico de evidências', 'evidencias.historico', 'limite', [3, 12, 'inf', 'inf'], 'meses'),
    ('Conta', 'Exportar relatório', 'relatorio.exportar', 'bool', [False, True, True, True], ''),
    ('Conta', 'SSO', 'conta.sso', 'bool', [False, False, False, True], ''),
    ('Conta', 'Suporte prioritário', 'suporte.prioritario', 'bool', [False, False, True, True], ''),
]
NOMES_PLANOS = [p[0] for p in PLANOS]


def _ligada(v):
    return v is not None and v is not False


def ligadas(idx):
    return sum(1 for f in FEATURES if _ligada(f[4][idx]))


COLS_PLANOS = 'minmax(0,1.5fr) 150px 90px 110px 120px 90px 110px 100px'


def tela_planos(k):
    cab = cabecalho(k, 'Planos', contagem=str(len(PLANOS)),
                    direita=link_botao(k, 'Matriz de features', href('Features'), 'outline', 36, 'grade')
                    + link_botao(k, 'Novo plano', href('Plano'), 'solid', 36, 'mais'))
    barra = barra_recurso(k, 'Buscar plano', [('Todos', '4'), ('Ativos', '3'), ('Rascunhos', '1'), ('Arquivados', '0')], 'Todos')
    cab_t = [('Plano', 'esq', True), ('Preço', 'esq', False), ('Clientes', 'dir', True), ('MRR', 'dir', True),
             ('Features', 'esq', False), ('Teste', 'esq', False), ('Status', 'esq', False), ('', 'dir', False)]
    linhas = ''
    for i, (nome, slug, mensal, anual, n, mrr, teste, status) in enumerate(PLANOS):
        if mensal is None:
            preco = f'<span style="font-size:13px;color:{k["mfg"]};">sob consulta</span>'
        elif mensal == 0:
            preco = f'<span style="font-size:13px;color:{k["fg"]};">Grátis</span>'
        else:
            preco = (f'<span style="display:flex;flex-direction:column;"><span style="font-size:13px;color:{k["fgs"]};">{brl(mensal, False)}/mês</span>'
                     f'<span style="font-size:12px;color:{k["mfg"]};">{brl(anual, False)}/ano</span></span>')
        lig = ligadas(i)
        barra_f = (f'<span style="display:flex;align-items:center;gap:8px;"><span style="display:flex;gap:2px;">'
                   + ''.join(f'<span style="width:4px;height:12px;border-radius:1px;background:{k["pri"] if j < lig else k["sunken"]};"></span>'
                             for j in range(len(FEATURES)))
                   + f'</span><span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};">{lig}/{len(FEATURES)}</span></span>')
        itens = [('lapis', 'Editar', href('Plano'), False), ('copiar', 'Duplicar', None, False), ('pontos', 'Mais ações', None, False)]
        cel = [
            f'<a href="{href("Plano")}" style="display:flex;flex-direction:column;color:inherit;">'
            f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>{mono(slug, k, k["mfg"], 11.5)}</a>',
            preco,
            f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};text-align:right;">{milhar(n) if n else "—"}</span>',
            f'<span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"] if mrr else k["mfg"]};text-align:right;">{brl(mrr, False) if mrr else "—"}</span>',
            barra_f,
            f'<span style="font-size:13px;color:{k["mfg"]};">{f"{teste} dias" if teste else "—"}</span>',
            selo_status(k, status),
            acoes_linha(k, i == 1, itens),
        ]
        linhas += linha_tabela(k, COLS_PLANOS, cel, hover=i == 1, altura=60)
    t = tabela(k, COLS_PLANOS, cab_t, linhas).replace('flex:1;min-height:0;background', 'background', 1)

    def regra(icone, tit, txt):
        return (f'<li style="display:flex;gap:10px;align-items:flex-start;flex:1;">'
                f'<span style="margin-top:2px;display:flex;color:{k["mfg"]};">{ic(icone, 15)}</span>'
                f'<span style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{tit}</span>'
                f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{txt}</span></span></li>')
    regras = (f'<ul style="margin:0;padding:18px 4px 0;list-style:none;display:flex;gap:28px;box-shadow:inset 0 1px 0 {k["muted"]};">'
              + regra('raio', 'Feature nasce uma vez', 'Chave e tipo são do produto. O plano só escolhe o valor: ligada, desligada ou um limite.')
              + regra('relogio', 'Preço novo vale para quem chega', 'Quem já assina mantém o preço até você migrar a base, com aviso de 30 dias.')
              + regra('bloqueio', 'Plano com cliente não se apaga', 'Arquive: ele sai da página de preços e quem está nele continua.')
              + '</ul>')
    return app(k, 'planos', cab + barra + t + regras, gap=16)


def _controle_feature(k, tipo, v, unidade, dinamico=None):
    if tipo == 'bool':
        if dinamico:
            return switch_dinamico(k, dinamico, 'Ligada', 'alternar_' + dinamico)
        return switch(k, bool(v), 'Ligada')
    if v is None:
        return f'<span title="Depende de Peer na IDE" style="font-size:12.5px;color:{k["mfg"]};">depende</span>'
    ilim = v == 'inf'
    num = (f'<input aria-label="Limite" value="{"" if ilim else v}" placeholder="{"∞" if ilim else ""}"{" disabled" if ilim else ""} '
           f'style="width:64px;height:28px;padding:0 8px;border:0;border-radius:7px;box-shadow:inset 0 0 0 1px {k["input"]};'
           f'background:{k["sunken"] if ilim else k["field"]};font-family:{MONO};font-size:12.5px;color:{k["fgs"]};text-align:right;outline:0;">')
    u = f'<span style="font-size:12px;color:{k["mfg"]};width:48px;">{singular(unidade) if v == 1 else unidade}</span>'
    return (f'<span style="display:flex;align-items:center;gap:8px;">{num}{u}'
            f'<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:{k["mfg"]};">{caixa(k, ilim, "Ilimitado")}Ilimitado</label></span>')


def tela_plano(k):
    idx = 1  # Pro
    cab = cabecalho(k, f'Pro <span style="margin-left:10px;display:inline-flex;align-self:center;">{selo_status(k, "Ativo")}</span>',
                    '764 clientes. Preço novo vale para novas assinaturas; quem já assina mantém o atual até você migrar.',
                    direita=link_botao(k, 'Arquivar', '#', 'ghost', 36) + link_botao(k, 'Salvar', href('Planos'), 'solid', 36),
                    trilha=[('Planos', 'Planos'), ('Pro', 'Plano')])
    duas = lambda a, b: f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">{a}{b}</div>'
    dados = (f'<section aria-label="Dados do plano" style="width:360px;flex:0 0 360px;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
             f'padding:18px 20px;display:flex;flex-direction:column;gap:14px;">'
             f'{rotulo("Dados", k["mfg"])}'
             + duas(campo(k, 'Nome', 'Pro', id_='nome'), campo(k, 'Slug', 'pro', monoespaco=True, id_='slug'))
             + campo(k, 'Descrição', 'Para quem estuda toda semana e quer o Peer na IDE.', id_='desc')
             + duas(campo(k, 'Preço mensal', '49,00', prefixo='R$', id_='mensal'),
                    campo(k, 'Preço anual', '470,00', prefixo='R$', id_='anual'))
             + f'<span style="margin-top:-6px;font-size:12px;color:{k["mfg"]};">O anual sai por 9,6 mensalidades: 20% de desconto.</span>'
             + campo(k, 'Teste grátis', '14', sufixo='dias', dica='Sem cartão. Zero desliga o teste.', id_='teste')
             + f'<div style="height:1px;background:{k["muted"]};"></div>'
             + f'<div style="display:flex;align-items:center;gap:12px;"><span style="display:flex;flex-direction:column;flex:1;">'
               f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">Na página de preços</span>'
               f'<span style="font-size:12px;color:{k["mfg"]};">Desligado, só entra por link ou pela equipe.</span></span>{switch(k, True, "Na página de preços")}</div>'
             + f'<div style="display:flex;align-items:center;gap:12px;"><span style="display:flex;flex-direction:column;flex:1;">'
               f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">Destaque</span>'
               f'<span style="font-size:12px;color:{k["mfg"]};">O selo “Recomendado” no card.</span></span>{switch(k, True, "Destaque")}</div>'
             + '</section>')

    grupo_atual, linhas = None, ''
    for j, (grupo, nome, chave, tipo, valores, unidade) in enumerate(FEATURES):
        if grupo != grupo_atual:
            grupo_atual = grupo
            linhas += (f'<div style="display:flex;align-items:center;height:28px;padding:0 18px;background:{k["rail"]};'
                       f'box-shadow:inset 0 -1px 0 {k["muted"]}, inset 0 1px 0 {k["muted"]};">{rotulo(grupo, k["mfg"], 9.5)}</div>')
        tipo_selo = f'<span style="display:flex;">{badge("liga/desliga" if tipo == "bool" else "limite", k, "gray" if tipo == "bool" else "blue", mono=True)}</span>'
        dyn = f'f{j}' if tipo == 'bool' else None
        linhas += (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 100px 250px;gap:12px;align-items:center;min-height:44px;'
                   f'padding:0 18px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
                   f'<span style="display:flex;flex-direction:column;"><span style="font-size:13.5px;color:{k["fgs"]};">{nome}</span>'
                   f'{mono(chave, k, k["mfg"], 11)}</span>{tipo_selo}'
                   f'<span style="display:flex;justify-content:flex-end;">{_controle_feature(k, tipo, valores[idx], unidade, dyn)}</span></div>')
    features = (f'<section aria-label="Features do plano" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
                f'display:flex;flex-direction:column;overflow:hidden;">'
                f'<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;">'
                f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:14px;font-weight:600;color:{k["fgs"]};">Features</span>'
                f'<span style="font-size:12.5px;color:{k["mfg"]};">{{{{ligadasTxt}}}} · a chave é a que o produto consulta</span></span>'
                f'{link_botao(k, "Comparar planos", href("Features"), "ghost", 32, "grade")}'
                f'{link_botao(k, "Nova feature", "#", "outline", 32, "mais")}</div>'
                f'<div style="flex:1;min-height:0;overflow:hidden;">{linhas}</div></section>')
    return app(k, 'planos', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{dados}{features}</div>', gap=18)


def antes_plano():
    bools = {f'f{j}': f[4][1] for j, f in enumerate(FEATURES) if f[3] == 'bool'}
    limites = sum(1 for f in FEATURES if f[3] == 'limite' and _ligada(f[4][1]))
    return (f'const BASE = {json.dumps(bools)};\n'
            'const liga = Object.assign({}, BASE, s.liga || {});\n'
            'const sw = (on) => ({ aria: on ? "true" : "false", trilho: on ? "var(--pri)" : "var(--sunken)", x: on ? "16px" : "2px",\n'
            '  sombra: on ? "none" : "inset 0 1px 2px rgba(0,0,0,0.10), inset 0 0 0 1px var(--input)" });\n'
            f'const n = Object.keys(liga).filter((c) => liga[c]).length + {limites};\n'
            f'const ligadasTxt = n + " de {len(FEATURES)} ligadas";')


def valores_plano():
    vs = ['ligadasTxt: ligadasTxt']
    for j, f in enumerate(FEATURES):
        if f[3] == 'bool':
            vs.append(f'f{j}: sw(liga.f{j})')
            vs.append(f'alternar_f{j}: () => this.setState({{ liga: Object.assign({{}}, liga, {{ f{j}: !liga.f{j} }}) }})')
    return ',\n'.join(vs)


def singular(u):
    return {'pessoas': 'pessoa', 'meses': 'mês'}.get(u, u)


def tela_features(k):
    cab = cabecalho(k, 'Matriz de features',
                    'Cada linha é uma feature, cada coluna um plano. Mudou aqui, vale para o plano inteiro.',
                    direita=segmentado(k, ['Ativos', 'Todos'], 'Todos', 'Planos na matriz')
                    + link_botao(k, 'Nova feature', '#', 'solid', 36, 'mais'),
                    trilha=[('Planos', 'Planos'), ('Matriz de features', 'Features')])
    cols = 'minmax(0,1.6fr) 110px repeat(4, minmax(0,1fr))'

    def cel_plano(i, conteudo):
        destaque = f'background:{k["prisub"]};' if i == 1 else ''
        return (f'<span style="display:flex;align-items:center;justify-content:center;align-self:stretch;{destaque}">{conteudo}</span>')

    def valor(tipo, v, unidade):
        if tipo == 'bool':
            return switch(k, bool(v), 'Ligada')
        if v is None:
            return f'<span title="Depende de Peer na IDE" style="font-size:12.5px;color:{k["mfg"]};">—</span>'
        if v == 'inf':
            return f'<span style="font-size:13px;color:{k["fgs"]};">Ilimitado</span>'
        return (f'<span style="display:inline-flex;align-items:baseline;gap:4px;height:28px;padding:0 10px;border-radius:7px;align-items:center;'
                f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["field"]};"><span style="font-family:{MONO};font-size:12.5px;color:{k["fgs"]};">{v}</span>'
                f'<span style="font-size:11.5px;color:{k["mfg"]};">{singular(unidade) if v == 1 else (unidade or "/mês")}</span></span>')

    topo = (f'<div role="row" style="display:grid;grid-template-columns:{cols};gap:0 12px;align-items:stretch;height:54px;padding:0 18px;'
            f'background:{k["rail"]};box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<span style="display:flex;align-items:center;font-size:12px;font-weight:500;color:{k["mfg"]};">Feature</span>'
            f'<span style="display:flex;align-items:center;font-size:12px;font-weight:500;color:{k["mfg"]};">Tipo</span>')
    for i, (nome, slug, mensal, anual, n, mrr, teste, status) in enumerate(PLANOS):
        sub = 'rascunho' if status == 'Rascunho' else f'{milhar(n)} clientes'
        topo += cel_plano(i, f'<span style="display:flex;flex-direction:column;align-items:center;">'
                             f'<a href="{href("Plano") if nome == "Pro" else "#"}" style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">{nome}</a>'
                             f'<span style="font-size:11.5px;color:{k["mfg"]};">{sub}</span></span>')
    topo += '</div>'
    grupo_atual, linhas = None, ''
    for grupo, nome, chave, tipo, valores, unidade in FEATURES:
        if grupo != grupo_atual:
            grupo_atual = grupo
            linhas += (f'<div style="display:flex;align-items:center;height:28px;padding:0 18px;background:{k["rail"]};'
                       f'box-shadow:inset 0 -1px 0 {k["muted"]};">{rotulo(grupo, k["mfg"], 9.5)}</div>')
        tipo_selo = f'<span style="display:flex;">{badge("liga/desliga" if tipo == "bool" else "limite", k, "gray" if tipo == "bool" else "blue", mono=True)}</span>'
        linhas += (f'<div role="row" style="display:grid;grid-template-columns:{cols};gap:0 12px;align-items:stretch;min-height:44px;padding:0 18px;'
                   f'box-shadow:inset 0 -1px 0 {k["muted"]};">'
                   f'<span style="display:flex;flex-direction:column;justify-content:center;"><span style="font-size:13.5px;color:{k["fgs"]};">{nome}</span>'
                   f'{mono(chave, k, k["mfg"], 11)}</span><span style="display:flex;align-items:center;">{tipo_selo}</span>'
                   + ''.join(cel_plano(i, valor(tipo, v, unidade)) for i, v in enumerate(valores)) + '</div>')
    rodape = (f'<footer style="display:flex;align-items:center;gap:10px;padding:12px 18px;box-shadow:inset 0 1px 0 {k["muted"]};'
              f'font-size:12.5px;color:{k["mfg"]};">{ic("dica", 14)}'
              f'<span>“—” é feature que depende de outra: Mensagens com o Peer só existe onde Peer na IDE está ligada.</span></footer>')
    matriz = (f'<section role="table" aria-label="Features por plano" style="flex:1;min-height:0;background:{k["card"]};border-radius:12px;'
              f'box-shadow:{k["sombra"]};display:flex;flex-direction:column;overflow:hidden;">{topo}'
              f'<div style="flex:1;min-height:0;overflow:hidden;">{linhas}</div>{rodape}</section>')
    return app(k, 'planos', cab + matriz, gap=18)


# ── Cupons ─────────────────────────────────────────────────────────────
CUPONS = [
    # código, desconto, duração, planos, usados, limite, validade, status
    ('BEMVINDO20', '20%', '3 meses', ['Pro'], 212, None, '31 dez 2026', 'Ativo'),
    ('PRO50', 'R$ 50', 'uma vez', ['Pro'], 88, 100, '30 set 2026', 'Ativo'),
    ('TEAMANUAL', '15%', 'sempre', ['Team'], 12, 50, 'sem validade', 'Ativo'),
    ('UNIVERSIDADE', '50%', 'sempre', ['Pro'], 41, None, 'sem validade', 'Ativo'),
    ('INDICA10', '10%', '12 meses', ['Pro', 'Team'], 64, None, 'sem validade', 'Ativo'),
    ('PARCEIRO25', '25%', '6 meses', ['Pro', 'Team'], 19, 200, '31 mar 2027', 'Pausado'),
    ('DEVWEEK', '30%', '1 mês', ['Pro', 'Team'], 300, 300, '20 set 2026', 'Esgotado'),
    ('BLACK2025', '40%', '3 meses', ['Pro', 'Team'], 510, None, '1 dez 2025', 'Expirado'),
    ('LANCAMENTO', '50%', '1 mês', ['Pro'], 1000, 1000, '31 out 2025', 'Esgotado'),
]
COLS_CUPONS = '16px minmax(0,1.3fr) 150px minmax(0,1fr) 150px 120px 110px 100px'


def tela_cupons(k, hover=1, sobre=''):
    cab = cabecalho(k, 'Cupons', contagem=str(len(CUPONS)),
                    direita=link_botao(k, 'Novo cupom', href('CupomNovo'), 'solid', 36, 'mais'))
    barra = barra_recurso(k, 'Buscar código', [('Todos', '9'), ('Ativos', '5'), ('Pausados', '1'), ('Encerrados', '3')], 'Todos',
                          filtro_chip(k, 'Plano'))
    cab_t = [(caixa(k, False, 'Selecionar todos'), 'esq', False), ('Código', 'esq', True), ('Desconto', 'esq', False),
             ('Planos', 'esq', False), ('Usos', 'esq', True), ('Validade', 'esq', True), ('Status', 'esq', False), ('', 'dir', False)]
    linhas = ''
    for i, (cod, desc, dur, planos, usados, limite, validade, status) in enumerate(CUPONS):
        encerrado = status in ('Esgotado', 'Expirado')
        if limite:
            pct = usados / limite
            cor = k['warn'] if 0.8 <= pct < 1 else (k['mfg'] if pct >= 1 else k['pri'])
            usos = (f'<span style="display:flex;flex-direction:column;gap:4px;">'
                    f'<span style="font-family:{MONO};font-size:12px;color:{k["fgs"]};">{milhar(usados)} <span style="color:{k["mfg"]};">/ {milhar(limite)}</span></span>'
                    f'<span style="display:block;height:4px;border-radius:999px;background:{k["sunken"]};">'
                    f'<span style="display:block;height:4px;width:{min(pct, 1) * 100:.0f}%;border-radius:999px;background:{cor};"></span></span></span>')
        else:
            usos = (f'<span style="font-family:{MONO};font-size:12px;color:{k["fgs"]};">{milhar(usados)} '
                    f'<span style="color:{k["mfg"]};">/ sem limite</span></span>')
        itens = [('lapis', 'Editar', href('CupomNovo'), False), ('copiar', 'Copiar código', None, False), ('pontos', 'Mais ações', None, False)]
        cel = [
            caixa(k, False, f'Selecionar {cod}'),
            f'<span style="display:flex;align-items:center;gap:8px;">'
            f'{mono(cod, k, k["mfg"] if encerrado else k["fgs"], 13)}</span>',
            f'<span style="display:flex;flex-direction:column;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{desc}</span>'
            f'<span style="font-size:12px;color:{k["mfg"]};">{dur}</span></span>',
            f'<span style="display:flex;gap:4px;flex-wrap:wrap;">{"".join(badge(p, k, "gray") for p in planos)}</span>',
            usos,
            f'<span style="font-size:13px;color:{k["mfg"]};">{validade}</span>',
            selo_status(k, status),
            acoes_linha(k, i == hover, itens),
        ]
        linhas += linha_tabela(k, COLS_CUPONS, cel, hover=i == hover, altura=54)
    t = tabela(k, COLS_CUPONS, cab_t, linhas, paginacao(k, '1–9 de 9', 1, 1))
    return app(k, 'cupons', cab + barra + t, sobre=sobre, gap=16)


def tela_cupom_novo(k):
    codigo = secao_sheet(k, 'Código', (
        f'<div style="display:flex;gap:8px;align-items:flex-end;">'
        + campo(k, 'Código', 'OUTUBRO15', monoespaco=True, id_='codigo', largura='100%')
        + link_botao(k, 'Gerar', '#', 'outline', 36, 'raio') + '</div>'
        + f'<span style="margin-top:-6px;font-size:12px;color:{k["mfg"]};">Letras e números, sem espaço. O cliente digita sem se preocupar com maiúscula.</span>'))
    desconto = secao_sheet(k, 'Desconto', (
        f'<div role="radiogroup" aria-label="Tipo de desconto" style="display:flex;gap:8px;">'
        + radio(k, True, 'Percentual', 'sobre o preço do plano') + radio(k, False, 'Valor fixo', 'em reais, por cobrança') + '</div>'
        + f'<div style="display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:end;">'
        + campo(k, 'Valor', '15', sufixo='%', id_='valor')
        + f'<div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Duração</span>'
          f'<div style="display:flex;align-items:center;gap:8px;">{segmentado(k, ["Uma vez", "Por meses", "Para sempre"], "Por meses", "Duração")}'
          f'{campo(k, "", "3", sufixo="meses", id_="meses", largura="96px")}</div></div></div>'
        + f'<span style="font-size:12px;color:{k["mfg"]};">No Pro mensal: {brl(41.65)} nos 3 primeiros meses, depois {brl(49)}.</span>'))

    def plano_check(nome, marcado, sub, desativado=False):
        op = 'opacity:0.55;' if desativado else ''
        return (f'<label style="display:flex;align-items:center;gap:10px;{op}">{caixa(k, marcado, nome)}'
                f'<span style="font-size:13.5px;color:{k["fgs"]};flex:1;">{nome}</span><span style="font-size:12px;color:{k["mfg"]};">{sub}</span></label>')
    onde = secao_sheet(k, 'Onde vale', (
        plano_check('Starter', False, 'grátis, sem cobrança', True) + plano_check('Pro', True, '764 clientes')
        + plano_check('Team', True, '48 clientes') + plano_check('Enterprise', False, 'rascunho', True)
        + seletor(k, 'Ciclo', 'Mensal e anual')))
    limites = secao_sheet(k, 'Limites', (
        f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
        + campo(k, 'Usos no total', '200', dica='Vazio é sem limite.', id_='usos')
        + campo(k, 'Vale até', '31/10/2026', icone='calendario', dica='Até 23:59, horário de Brasília.', id_='validade') + '</div>'
        + f'<div style="display:flex;align-items:center;gap:12px;"><span style="display:flex;flex-direction:column;flex:1;">'
          f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">Um por cliente</span>'
          f'<span style="font-size:12px;color:{k["mfg"]};">Quem já usou não usa de novo, nem em outra conta com o mesmo documento.</span></span>'
          f'{switch(k, True, "Um por cliente")}</div>'
        + f'<div style="display:flex;align-items:center;gap:12px;"><span style="display:flex;flex-direction:column;flex:1;">'
          f'<span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">Só primeira assinatura</span>'
          f'<span style="font-size:12px;color:{k["mfg"]};">Não vale para quem já pagou algum plano.</span></span>'
          f'{switch(k, False, "Só primeira assinatura")}</div>'))
    rodape = (f'<span style="flex:1;"></span>{link_botao(k, "Cancelar", href("Cupons"), "ghost", 36)}'
              f'{link_botao(k, "Criar cupom", href("Cupons"), "solid", 36)}')
    s = sheet(k, 'Novo cupom', 'O código passa a valer quando você criar.', codigo + desconto + onde + limites, rodape, largura=540)
    return tela_cupons(k, hover=-1, sobre=s)


# ── Montagem ───────────────────────────────────────────────────────────
def montar(tela, tema):
    sufixo = '' if tema == 'claro' else 'Escuro'
    return _montar(tela, tema).replace('__SUF__', sufixo)


def _montar(tela, tema):
    k, t = K, tela['titulo']
    i = tela['id']
    if i == 'entrar':
        return pagina(t, tela_acesso(k, 'entrar'), tema)
    if i == 'totp':
        return pagina(t, tela_acesso(k, 'totp'), tema, ANTES_TOTP, VALORES_TOTP, PROPS_TOTP)
    if i == 'inicio':
        return pagina(t, tela_inicio(k), tema)
    if i == 'clientes':
        return pagina(t, tela_clientes(k), tema)
    if i == 'cliente':
        return pagina(t, tela_cliente_editar(k), tema)
    if i == 'revogar':
        return pagina(t, tela_revogar(k), tema)
    if i == 'planos':
        return pagina(t, tela_planos(k), tema)
    if i == 'plano':
        return pagina(t, tela_plano(k), tema, antes_plano(), valores_plano())
    if i == 'features':
        return pagina(t, tela_features(k), tema)
    if i == 'cupons':
        return pagina(t, tela_cupons(k), tema)
    if i == 'cupom':
        return pagina(t, tela_cupom_novo(k), tema)
    raise KeyError(i)
