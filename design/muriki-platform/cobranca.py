# As telas de planos e cobrança do Platform (bloco C, item platform-billing), dentro do produto: a
# mesma moldura das telas de membros (a barra do topo do Platform e o título da página). Cada peça
# desenha o bloco do registry que o componente vai usar: os cartões são o PlanCard na PlanGrid, o
# preço é o do PlanPrice com o formatSeatPrice (sem casas quando o valor é inteiro), as trocas são o
# ViewToggle, o checkout é uma página de dentro do workspace e os campos são os do onboarding (InputGroup touch). O DS só formata o que a API manda: o anual aparece por pessoa/ano,
# como vem, e não dividido por 12 (F12); o "a partir de" do Enterprise é a única conta, só exibição.
from pecas import K, T, ic, svg, I, campo, esc, raiz, topo, PRODUTO, EMAIL, FONTE, MONO, casca, logica, juntar, COMUM, PROPS_IDIOMA, props_tema
from base import badge, diamante, CSS_DIVIDER_SKELETON

I.update(
    # ArrowSquareOut (o link do portal) e UserPlus / UserMinus (os dois avisos dos assentos)
    externo=svg('<path d="M9.4 2.4h4.2v4.2"/><path d="M13.6 2.4L7.8 8.2"/><path d="M12 9.4v3a1.2 1.2 0 0 1-1.2 1.2H3.6a1.2 1.2 0 0 1-1.2-1.2V5.2A1.2 1.2 0 0 1 3.6 4h3"/>'),
    pessoa_mais=svg('<circle cx="6.4" cy="5.6" r="2.6"/><path d="M1.8 13.4c.5-2.5 2.4-3.9 4.6-3.9s4.1 1.4 4.6 3.9"/><path d="M12.8 5.6v3.6M11 7.4h3.6"/>'),
    # CloudSlash (a folhinha sem data, com o Stripe fora); o tentar de novo usa o recarregar das peças
    nuvem_off=svg('<path d="M2.4 2.4l11.2 11.2"/><path d="M5.2 5.4A3.6 3.6 0 0 0 4.6 12.4h6.6"/><path d="M7.4 4.5A4 4 0 0 1 12.6 7.9 2.3 2.3 0 0 1 13.6 11.6"/>'),
    pessoa_menos=svg('<circle cx="6.4" cy="5.6" r="2.6"/><path d="M1.8 13.4c.5-2.5 2.4-3.9 4.6-3.9s4.1 1.4 4.6 3.9"/><path d="M11 7.4h3.6"/>'),
)

# o ViewToggle (default): o trilho afundado e o cursor elevado; no escuro o relevo inverte (as
# mesmas cores do componente, a única exceção a dark: do sistema)
CSS_COBRANCA = (
    '.vt{background:var(--sunken);box-shadow:inset 0 1px 2px rgba(0,0,0,0.07),inset 0 0 0 1px var(--border);}'
    '.mc.escuro .vt{background:oklch(0.26 0.005 107);box-shadow:inset 0 1px 0 rgba(255,255,255,0.045),inset 0 0 0 1px oklch(0.325 0.006 107);}'
    '.vt-op{background:transparent;color:var(--mfg);}.vt-op.vt-on{color:var(--pri);}'
    '.vt-on{background:var(--card);box-shadow:0 1px 2px rgba(0,0,0,0.14),0 2px 6px rgba(0,0,0,0.07),inset 0 0 0 1px var(--input);}'
    '.mc.escuro .vt-on{background:oklch(0.172 0.004 107);box-shadow:inset 0 1px 3px rgba(0,0,0,0.65),inset 0 -1px 0 rgba(255,255,255,0.06),'
    'inset 0 0 0 1px oklch(0.135 0.004 107);}'
) + CSS_DIVIDER_SKELETON


def pagina_cb(titulo, corpo, tema, textos):
    return casca(titulo, corpo, logica(juntar(COMUM, textos), tema), {**PROPS_IDIOMA, **props_tema(tema)}, CSS_COBRANCA)


def pagina_produto(k, titulo, sub, conteudo, largura):
    # a mesma de telas.py (membros): o título e a linha de contexto, o conteúdo embaixo
    cabeca_ = (f'<header style="display:flex;flex-direction:column;gap:6px;">'
               f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{titulo}</h1>'
               + (f'<p style="margin:0;font-size:14px;line-height:20px;color:{k["mfg"]};">{sub}</p>' if sub else '') + '</header>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, PRODUTO, EMAIL)}'
            f'<main style="display:flex;flex-direction:column;gap:24px;width:{largura}px;margin:0 auto;padding:24px 0 40px;">'
            f'{cabeca_}{conteudo}</main></div>')


def troca(k, aria, opcoes, escolhida):
    # o ViewToggle md: opção de 36px, a escolhida em azul sobre o cursor. `escolhida` é o valor, ou
    # None quando a escolha vem do idioma (a moeda: BRL no pt, USD no en e no es): aí cada opção lê a
    # classe e o aria-selected dos textos (t.cbOn<valor>, t.cbSel<valor>)
    def opcao(valor, rotulo_, extra=''):
        if escolhida is None:
            cls, sel = f'{{{{t.cbOn{valor}}}}}', f'{{{{t.cbSel{valor}}}}}'
        else:
            on = valor == escolhida
            cls, sel = ('vt-on' if on else ''), ('true' if on else 'false')
        return (f'<button type="button" role="tab" aria-selected="{sel}" class="vt-op {cls}" '
                f'style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:0;border-radius:999px;'
                f'font-family:{FONTE};font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;">{rotulo_}{extra}</button>')
    return (f'<div role="tablist" aria-label="{aria}" class="vt" style="display:inline-flex;align-items:center;padding:2px;border-radius:999px;">'
            + ''.join(opcao(*o) for o in opcoes) + '</div>')


# ── Planos (SeatPlanCards) ──────────────────────────────────────────────
# Os planos são Free, Pro e Enterprise, os mesmos para todo workspace; o tipo decide o que aparece (F0):
# no `team` são três cartões (Free e Pro até 5 pessoas; o Enterprise sem limite, cobrando no mínimo 10); no
# `personal` são dois (Free e Pro, só a pessoa, sem o Enterprise). O Pro é o recomendado e o plano do
# teste de 14 dias. Em cima, as trocas de período (com o selo "−10%" no anual) e de moeda; com a moeda
# travada, no lugar da troca fica a moeda da assinatura, com o cadeado.
# O cartão segue o PlanCard do platform antigo (o filete degradê de 1px no topo do destaque, o título
# grande, o preço e a lista com o check; o CTA muted nos comuns e primary no destaque), sem manchas nem
# desfoque. No cabeçalho, o ícone do plano num quadradinho e, no Pro, o selo "Recomendado"; o estado
# (No teste / Plano atual) é um selo discreto ao lado do nome. O Pro sobe além da fileira e tem a
# sombra mais funda. As linhas se alinham pela grade (subgrid: o cabeçalho, o preço, a lista e o
# botão). A lista só diz o que o produto sustenta: o limite de pessoas, o teste de 14 dias, o assento só
# de quem aceitou o convite, o −10% do anual, o mínimo e o contrato do Enterprise e o Code Pro.
I.update(
    # os ícones dos planos, no traço dos outros: a folha (Free), o prédio (Enterprise); a pessoa e as
    # pessoas já existem
    folha=svg('<path d="M13.4 2.6C7.2 2.6 3.2 5.4 3.2 10c0 1.3.4 2.3 1 3"/><path d="M13.4 2.6c0 6.3-2.9 10.2-7.4 10.2-1 0-1.8-.2-2.4-.6"/>'
              '<path d="M3 13.4l6.2-6.2"/>'),
    predio=svg('<path d="M2.6 13.6h10.8"/><path d="M3.8 13.6V3a.8.8 0 0 1 .8-.8h4.8a.8.8 0 0 1 .8.8v10.6"/><path d="M10.2 6.4h1.4a.6.6 0 0 1 .6.6v6.6"/>'
               '<path d="M5.8 4.8h2.4M5.8 7.2h2.4M5.8 9.6h2.4"/>'),
)
PLANOS = {
    # chave, nome, ícone, descrição, preço (mês, ano), nota do Enterprise (mês, ano)
    'team': [
        ('free', 'Free', 'folha', 'cbDescFree', None, None),
        ('pro', 'Pro', 'diamante', 'cbDescPro', ('cbPrecoPro', 'cbAnoPro'), None),
        ('enterprise', 'Enterprise', 'predio', 'cbDescEnt', ('cbPrecoEnt', 'cbAnoEnt'), ('cbEntMes', 'cbEntAno')),
    ],
    'personal': [
        ('free', 'Free', 'folha', 'cbDescFreePessoal', None, None),
        ('pro', 'Pro', 'diamante', 'cbDescProPessoal', ('cbPrecoPro', 'cbAnoPro'), None),
    ],
}
# os itens de cada cartão: (texto, nota embaixo ou None; 'TESTE' é o teste, que só aparece no
# estado de teste); o Code Pro e a nota do pé vêm à parte
ITENS = {
    'team': {
        'free': [('cbItAte5', None)],
        'pro': [('cbItAte5', None), ('cbItTeste', 'TESTE'), ('cbItAceito', None), ('cbItAnual', None)],
        'enterprise': [('cbItSemLimite', None), ('cbItMin10', None), ('cbItContrato', None), ('cbItAnual', None)],
    },
    'personal': {
        'free': [('cbItSoVoce', None)],
        'pro': [('cbItSoVoce', None), ('cbItTeste', 'TESTE'), ('cbItAnual', None)],
    },
}
CODE_PRO = {'pro', 'enterprise'}
# a nota do pé: no `team`, quem passa de 5 vai para o Enterprise; no `personal`, o Code Pro do Pro
PE = {'team': {'free': 'cbPeEnt'}, 'personal': {'free': 'cbPeFree'}}
# o recomendado sobe e desce além da fileira
ERGUE = 22


def _item(k, txt, nota=None):
    return (f'<li style="display:flex;align-items:flex-start;gap:9px;font-size:14px;line-height:20px;color:{k["fg"]};">'
            f'<span style="display:flex;width:15px;height:15px;margin-top:2.5px;flex:0 0 auto;color:{k["ok"]};">'
            f'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" '
            f'width="100%" height="100%" aria-hidden="true"><path d="M3.2 8.4l3 3 6.6-7"/></svg></span>'
            f'<span style="display:flex;flex-direction:column;">{T(txt)}'
            + (f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{nota}</span>' if nota else '') + '</span></li>')


FAISCA = ('<svg viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor" aria-hidden="true">'
          '<path d="M8 1.2l1.7 4.6 4.6 1.7-4.6 1.7L8 13.8l-1.7-4.6-4.6-1.7 4.6-1.7z"/></svg>')


def _item_code(k, texto='cbCodePro', filete=True):
    # o Code Pro com a faísca (o accent "sparkle" do PlanCardFeatures): texto forte, a ressalva embaixo
    sep = f'margin-top:4px;padding-top:12px;border-top:1px dashed {k["input"]};' if filete else ''
    return (f'<li style="display:flex;align-items:flex-start;gap:9px;{sep}'
            f'font-size:14px;line-height:20px;font-weight:500;color:{k["fgs"]};">'
            f'<span style="display:flex;width:15px;height:15px;margin-top:2.5px;flex:0 0 auto;color:{k["pri"]};">{FAISCA}</span>'
            f'<span style="display:flex;flex-direction:column;">{T(texto)}'
            f'<span style="font-size:12.5px;line-height:17px;font-weight:400;color:{k["mfg"]};">{T("cbNaPaga")}</span></span></li>')


def _icone_plano(k, icone, destaque):
    # o Pro leva o diamante do Pro do Code (preenchido); os outros, os ícones de linha
    g = diamante(17) if icone == 'diamante' else ic(icone, 18)
    cor = (f'background:{k["pri"]};color:{k["prifg"]};' if destaque
           else f'background:{k["sunken"]};color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["border"]};')
    return (f'<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;flex:0 0 auto;'
            f'border-radius:10px;{cor}"><span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;">{g}</span></span>')


def _selo_recomendado(k):
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:999px;'
            f'background:{k["prisub"]};color:{k["prisubfg"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 30%, transparent);'
            f'font-size:11.5px;font-weight:600;white-space:nowrap;">'
            f'<span style="display:flex;width:11px;height:11px;">{FAISCA}</span>{T("cbRecomendado")}</span>')


def _moldura_cartao(k, destaque, esqueleto=False):
    base = ('position:relative;grid-row:span 4;display:grid;grid-template-rows:subgrid;row-gap:0;overflow:hidden;'
            f'border-radius:14px;padding:22px 24px 24px;background:{k["card"]};')
    if destaque:
        anel = (f'border:1px solid {k["pri"]};box-shadow:0 0 0 3px color-mix(in oklab, {k["pri"]} 20%, transparent), '
                f'0 30px 60px -24px rgba(0,0,0,0.30), 0 12px 24px -12px rgba(0,0,0,0.14);'
                if esqueleto else
                f'border:1px solid color-mix(in oklab, {k["pri"]} 65%, transparent);'
                f'box-shadow:0 0 0 1px color-mix(in oklab, {k["pri"]} 15%, transparent), '
                f'0 32px 64px -24px color-mix(in oklab, {k["pri"]} 40%, rgba(0,0,0,0.45)), 0 14px 28px -14px rgba(0,0,0,0.22);')
        return base + f'margin:-{ERGUE}px 0;padding-top:{ERGUE + 22}px;padding-bottom:{ERGUE + 24}px;z-index:1;' + anel
    return base + f'border:1px solid color-mix(in oklab, {k["border"]} 70%, transparent);box-shadow:{k["sombra"]};'


def cartao_plano(k, plano, anual, teste, cta, tipo='team'):
    chave, nome, icone, desc, precos, nota_ent = plano
    destaque = chave == 'pro'
    filete = f'border-top:1px solid color-mix(in oklab, {k["border"]} 60%, transparent);'
    if precos is None:
        preco = (f'<p style="margin:0;font-size:32px;line-height:38px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{T("cbGratis")}</p>'
                 f'<p style="margin:0;font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbNotaFree")}</p>')
    else:
        valor = T(precos[1] if anual else precos[0])
        # no `personal` o preço é da pessoa só (1 assento): "por mês", sem o "por pessoa"
        unidade = ('cbPorAno' if anual else 'cbPorMes') if tipo == 'team' else ('cbPorAnoSo' if anual else 'cbPorMesSo')
        nota = T(nota_ent[1] if anual else nota_ent[0]) if nota_ent else T('cbNotaAno' if anual else 'cbNotaMes')
        preco = (f'<p style="margin:0;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:6px;">'
                 f'<span style="font-size:32px;line-height:38px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};'
                 f'font-variant-numeric:tabular-nums;white-space:nowrap;">{valor}</span>'
                 f'<span style="font-size:14px;color:{k["mfg"]};white-space:nowrap;">{T(unidade)}</span></p>'
                 f'<p style="margin:0;font-size:12.5px;line-height:17px;color:{k["mfg"]};">{nota}</p>')
    itens = ''.join(_item(k, t, (T('cbTermina') if teste else None) if n == 'TESTE' else None) for t, n in ITENS[tipo][chave] if teste or n != 'TESTE')
    if chave in CODE_PRO:
        itens += _item_code(k)
    pe = (f'<p style="margin:0;padding:10px 12px;border-radius:10px;background:{k["sunken"]};font-size:12.5px;line-height:17px;color:{k["mfg"]};">'
          f'{T(PE[tipo][chave])}</p>') if chave in PE[tipo] else ''
    rotulo_cta, variante = cta
    botao_ = (f'<button type="button" style="display:flex;align-items:center;justify-content:center;width:100%;height:40px;padding:0 14px;'
              f'border:0;border-radius:10px;font-family:{FONTE};font-size:14px;font-weight:500;'
              + (f'background:{k["pri"]};color:{k["prifg"]};' if variante == 'solid' else f'background:{k["muted"]};color:{k["fg"]};')
              + f'">{T(rotulo_cta)}</button>')
    luz = (f'<span aria-hidden="true" style="position:absolute;inset:0 0 auto 0;height:1px;'
           f'background:linear-gradient(to right, transparent, color-mix(in oklab, {k["pri"]} 70%, transparent), transparent);"></span>') if destaque else ''
    # o estado do plano atual: no teste (verde) ou a assinatura (neutro), ao lado do nome
    estado = ''
    if destaque:
        estado = badge(T('cbNoTeste'), k, 'green', ponto=True) if teste else badge(T('cbPlanoAtual'), k)
    return (f'<article aria-label="{nome}" style="{_moldura_cartao(k, destaque)}">{luz}'
            f'<header style="display:flex;flex-direction:column;gap:6px;padding-bottom:16px;">'
            f'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">'
            f'{_icone_plano(k, icone, destaque)}{_selo_recomendado(k) if destaque else ""}</div>'
            f'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;">'
            f'<h3 style="margin:0;font-size:28px;line-height:1.05;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{nome}</h3>{estado}</div>'
            f'<p style="margin:0;font-size:14px;line-height:19px;color:{k["mfg"]};">{T(desc)}</p></header>'
            f'<div style="display:flex;flex-direction:column;justify-content:flex-end;gap:4px;padding:14px 0 16px;{filete}">{preco}</div>'
            f'<div style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;padding:16px 0 20px;{filete}">'
            f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">{itens}</ul>{pe}</div>'
            f'<div style="display:flex;align-items:flex-end;">{botao_}</div></article>')


def _esqueleto_plano(k, destaque):
    # o PlanCardSkeleton no molde do cartão: o recomendado erguido, com o contorno primary e o ring
    # primary/20, o quadradinho do ícone, o selo e o botão em primary/25; as silhuetas do nome e da
    # descrição, do preço e de quatro linhas
    sk = lambda estilo: f'<span class="muriki-skeleton" style="display:block;{estilo}"></span>'
    tinta = f'background-color:color-mix(in oklab, {k["pri"]} 25%, transparent);' if destaque else ''
    filete = f'border-top:1px solid color-mix(in oklab, {k["border"]} 60%, transparent);'
    linhas = ''.join(sk(f'height:12px;width:{w}%;') for w in (85, 72, 78, 60))
    selo = sk('width:104px;height:22px;border-radius:999px;' + tinta) if destaque else ''
    return (f'<div aria-hidden="true" style="{_moldura_cartao(k, destaque, esqueleto=True)}">'
            f'<div style="display:flex;flex-direction:column;gap:10px;padding-bottom:16px;">'
            f'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
            f'{sk("width:34px;height:34px;border-radius:10px;" + tinta)}{selo}</div>'
            f'{sk("height:24px;width:120px;")}{sk("height:12px;width:80%;")}</div>'
            f'<div style="display:flex;flex-direction:column;gap:10px;padding:14px 0 16px;{filete}">'
            f'{sk("height:34px;width:150px;")}{sk("height:12px;width:64px;")}</div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;padding:18px 0 20px;{filete}">{linhas}</div>'
            f'<div style="display:flex;align-items:flex-end;">{sk("height:40px;width:100%;" + tinta)}</div></div>')


def tela_planos(k, estado, tipo='team'):
    # 'teste': mensal, no teste do Pro (o plano atual), a moeda ainda troca (antes da primeira compra)
    # 'anual': anual, o workspace já assina o Pro mensal, a moeda travada
    # 'carregando': o GET /plans ainda não voltou: as trocas já estão, os cartões em silhueta
    # `tipo`: 'team' (três cartões) ou 'personal' (Free e Pro, só a pessoa)
    anual = estado == 'anual'
    planos = PLANOS[tipo]
    periodo = troca(k, T('cbPeriodoAria'), [('mensal', T('cbMensal')),
                                            ('anual', T('cbAnual'), badge('−10%', k, 'green'))], 'anual' if anual else 'mensal')
    if anual:
        moeda = (f'<span style="display:inline-flex;align-items:center;gap:8px;font-size:13px;color:{k["mfg"]};">'
                 f'{ic("cadeado", 14)}{T("cbMoedaTravada")}</span>')
    else:
        moeda = troca(k, T('cbMoedaAria'), [('BRL', 'BRL'), ('USD', 'USD')], None)
    ctas = {'free': ('cbMudarFree', 'secondary'), 'pro': ('cbMudarAnual' if anual else 'cbAssinarPro', 'solid'),
            'enterprise': ('cbFalar', 'secondary')}
    grade = (f'display:grid;grid-template-columns:repeat({len(planos)},minmax(0,1fr));grid-template-rows:auto auto 1fr auto;'
             f'column-gap:24px;margin-top:{ERGUE}px;')
    if estado == 'carregando':
        cartoes = (f'<div role="status" aria-label="{T("cbCarregando")}" style="{grade}">'
                   + ''.join(_esqueleto_plano(k, p[0] == 'pro') for p in planos) + '</div>')
    else:
        cartoes = (f'<div style="{grade}">'
                   + ''.join(cartao_plano(k, p, anual, not anual, ctas[p[0]], tipo) for p in planos) + '</div>')
    conteudo = f'<div style="display:flex;align-items:center;justify-content:space-between;">{periodo}{moeda}</div>{cartoes}'
    # três cartões na largura da página; dois, numa coluna mais estreita, para não esticar
    return pagina_produto(k, T('cbPlanos'), T('cbPlanosSubPago' if anual else 'cbPlanosSubTeste'), conteudo,
                          1040 if tipo == 'team' else 760)


# ── Peças comuns do checkout ────────────────────────────────────────────
# o Moura & Filhos no Pro: 4 pessoas, dentro do limite de 5 do Free e do Pro de empresa
PESSOAS_WS = ['Rafael Moura', 'Ana Lima', 'João Pereira', 'Bia Costa']


def _avatar(k, nome, i, tam=28, apagado=False):
    # a inicial no círculo, como o lugar do SeatsPreview: você no azul cheio, os outros no azul claro
    if apagado:
        cor = f'background:transparent;color:{k["mfg"]};box-shadow:inset 0 0 0 1.5px {k["input"]};border-style:dashed;'
    elif i == 0:
        cor = f'background:{k["pri"]};color:{k["prifg"]};'
    else:
        cor = f'background:color-mix(in oklab, {k["pri"]} 16%, {k["card"]});color:{k["prisubfg"]};'
    return (f'<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;flex:0 0 auto;'
            f'border-radius:50%;{cor}font-size:{round(tam * 0.4)}px;font-weight:600;">{nome[0]}</span>')


def _pilha(k, nomes, tam=30):
    # os avatares encostados, cada um com o anel da superfície
    return ('<span style="display:flex;">' + ''.join(
        f'<span style="display:flex;margin-left:{0 if i == 0 else -8}px;border-radius:50%;box-shadow:0 0 0 2.5px {k["card"]};">'
        f'{_avatar(k, n, i, tam)}</span>' for i, n in enumerate(nomes)) + '</span>')


def _conta(k, conta, total, periodo, grande=34):
    # "6 pessoas × R$ 29 = R$ 174/mês": a conta em texto, o total em destaque. O total previsto é a
    # mesma exceção de exibição do SeatsPreview (o preço por pessoa vem da API, F12)
    return (f'<p style="margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;">'
            f'<span style="font-size:14px;color:{k["fg"]};font-variant-numeric:tabular-nums;">{T(conta)}</span>'
            f'<span aria-hidden="true" style="font-size:14px;color:{k["mfg"]};">=</span>'
            f'<span style="display:inline-flex;align-items:baseline;gap:2px;">'
            f'<span style="font-size:{grande}px;line-height:1.1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{T(total)}</span>'
            f'<span style="font-size:14px;color:{k["mfg"]};">{T(periodo)}</span></span></p>')


def _seletor_pais(k, valor):
    # o Select do DS no tamanho touch (o gatilho é campo, o caret parado)
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<label style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T("cbPais")}</label>'
            f'<button type="button" aria-haspopup="listbox" style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 14px;'
            f'border:0;border-radius:11px;background:{k["field"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});'
            f'font-family:{FONTE};font-size:15px;color:{k["fgs"]};">{T(valor)}'
            f'<span style="display:flex;width:14px;height:14px;margin-left:auto;color:{k["mfg"]};">{ic("baixo", 14)}</span></button></div>')


def _botao_largo(k, txt, icone=None, var='solid'):
    est = (f'background:{k["pri"]};color:{k["prifg"]};' if var == 'solid'
           else f'background:{k["card"]};color:{k["fg"]};box-shadow:inset 0 0 0 1px {k["input"]};')
    return (f'<button type="submit" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:44px;border:0;'
            f'border-radius:11px;{est}font-family:{FONTE};font-size:15px;font-weight:500;">'
            f'{txt}{ic(icone, 15) if icone else ""}</button>')


def _nota_stripe(k):
    return (f'<p style="margin:0;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;line-height:16px;color:{k["mfg"]};">'
            f'<span style="display:flex;width:13px;height:13px;">{ic("cadeado", 13)}</span>{T("cbNoStripe")}</p>')


def _campos_fiscais(k, variante):
    # o FiscalForm: só no Brasil. O documento sai do tipo do workspace, não do plano: `personal` pede o
    # CPF; `team`, o CNPJ e a razão social
    if variante == 'pessoal':
        return _seletor_pais(k, 'cbBrasil') + campo(k, 'cpf', T('cbCpf'), '123.456.789-09', frase=T('cbCpfDica'), mono=True)
    if variante == 'eua':
        return (_seletor_pais(k, 'cbEua')
                + f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("cbSemFiscal")}</p>')
    erro = variante == 'erro'
    return (_seletor_pais(k, 'cbBrasil')
            + campo(k, 'cnpj', T('cbCnpj'), '12.ABC.345/01DE-36' if erro else '12.ABC.345/01DE-35', 'taken' if erro else 'idle',
                    T('cbCnpjInvalido') if erro else T('cbCnpjDica'), mono=True)
            + campo(k, 'razao', T('cbRazao'), 'Moura & Filhos Tecnologia Ltda.'))


def _numero_conta(variante):
    if variante == 'pessoal':
        return 'cbContaPessoal', 'cbTotalPessoal', 'cbAno'
    if variante == 'eua':
        return 'cbContaEua', 'cbTotalEua', 'cbMes'
    return 'cbContaPro', 'cbTotalPro', 'cbMes'


I.update(
    # Minus do Phosphor, para o seletor de pessoas (o Plus, "mais", é o do convidar, em entrada.py)
    menos=svg('<path d="M3 8h10"/>'),
)


# ── O checkout em página ────────────────────────────────────────────────
# Uma página de dentro do workspace (não é etapa do onboarding), aberta a partir de Planos, no jeito do
# Linear e do Stripe: a barra do topo, o caminho leve (← Planos / Assinar / Pagamento no Stripe), o
# formulário à esquerda e o resumo fixo à direita, numa faixa afundada que vai até o pé da janela. O
# "Falar com o comercial" usa a mesma página, com o resumo do Enterprise.
FILETE = 'color-mix(in oklab, {input} 60%, transparent)'


def _trilha(k, passos):
    # o caminho: "← Planos" é o link de volta; o passo de agora em destaque; o que vem depois apagado
    sep = f'<span aria-hidden="true" style="color:{k["input"]};">/</span>'
    partes = [f'<a href="#" style="display:inline-flex;align-items:center;gap:6px;font-weight:500;color:{k["mfg"]};">'
              f'<span style="display:flex;width:14px;height:14px;transform:scaleX(-1);">{ic("seta", 14)}</span>{T("cbPlanos")}</a>']
    for txt, atual, icone in passos:
        cor = f'font-weight:500;color:{k["fgs"]};' if atual else f'color:{k["mfg"]};'
        g = f'<span style="display:flex;width:13px;height:13px;">{ic(icone, 13)}</span>' if icone else ''
        ac = 'aria-current="page" ' if atual else ''
        partes.append(f'<span {ac}style="display:inline-flex;align-items:center;gap:6px;{cor}">{g}{txt}</span>')
    return (f'<nav aria-label="{T("cbTrilhaAria")}" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:13.5px;line-height:18px;">'
            + sep.join(partes) + '</nav>')


def _pagina_checkout(k, form, resumo):
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, PRODUTO, EMAIL)}'
            f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);">'
            f'<main style="display:flex;justify-content:flex-end;padding:36px 96px 40px 0;">{form}</main>'
            f'<aside style="display:flex;justify-content:flex-start;padding:92px 0 40px 88px;background:{k["rail"]};'
            f'box-shadow:inset 1px 0 0 {k["border"]};">{resumo}</aside></div></div>')


def _cabeca_form(k, titulo, sub):
    return (f'<header style="display:flex;flex-direction:column;gap:8px;">'
            f'<h1 style="margin:0;font-size:30px;line-height:36px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{titulo}</h1>'
            f'<p style="margin:0;font-size:14.5px;line-height:21px;color:{k["mfg"]};">{sub}</p></header>')


def _linha(k, a, b, forte=False):
    est = f'font-size:15px;font-weight:600;color:{k["fgs"]};' if forte else f'font-size:14px;color:{k["fg"]};'
    return (f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;{est}">'
            f'<span>{a}</span><span style="font-variant-numeric:tabular-nums;text-align:right;">{b}</span></div>')


def _bloco(k, filhos, gap=12):
    f = FILETE.format(input=k['input'])
    return f'<div style="display:flex;flex-direction:column;gap:{gap}px;padding-top:18px;border-top:1px solid {f};">{filhos}</div>'


def _cabeca_resumo(k, icone, nome, selo='', direita=''):
    return (f'<div style="display:flex;flex-direction:column;gap:16px;">'
            f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["mfg"]};">{T("cbResumoRot")}</span>'
            f'<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">'
            f'<span style="display:flex;align-items:center;gap:12px;">{_icone_plano(k, icone, True)}'
            f'<span style="font-size:22px;line-height:28px;font-weight:600;color:{k["fgs"]};">{nome}</span>{selo}</span>{direita}</div></div>')


def _cupom(k, aplicado):
    # o CouponField do DS: fechado, o link "Tem um cupom?"; aplicado, o selo verde mono com o código e o
    # que ele dá, e "Remover". No Platform o cupom é só percentual (R32); quem valida é a API
    if not aplicado:
        return (f'<button type="button" style="align-self:flex-start;display:inline-flex;align-items:center;height:28px;padding:0;border:0;'
                f'background:transparent;font-family:{FONTE};font-size:13.5px;font-weight:500;color:{k["pri"]};">{T("cbTemCupom")}</button>')
    return (f'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;min-height:28px;font-size:13px;color:{k["fg"]};">'
            f'{badge("LANCAMENTO20", k, "green", mono=True)}<span>{T("cbCupomDesc")}</span>'
            f'<button type="button" style="margin-left:auto;padding:0;border:0;background:transparent;font-family:{FONTE};font-size:13px;'
            f'color:{k["mfg"]};">{T("cbRemover")}</button></div>')


def pagina_assinar(k, variante, cupom=None):
    # sempre o Pro. 'team' (CNPJ e razão social, por assento), 'pessoal' (o workspace `personal`: CPF e
    # 1 assento, no anual), 'erro' (o CNPJ com o DV errado) e 'eua' (uma empresa dos EUA: sem campo
    # fiscal, o resumo em USD). `cupom`: None (sem o campo, no quadro do erro do CNPJ, para não
    # misturar, e no pessoal anual: o cupom só vale no mensal), 'fechado' (o link) ou 'aplicado'
    solo = variante == 'pessoal'
    titulo = T('cbAssinarPro')
    f = FILETE.format(input=k['input'])
    periodo = troca(k, T('cbPeriodoAria'), [('mensal', T('cbMensal')),
                                            ('anual', T('cbAnual'), badge('−10%', k, 'green'))], 'anual' if solo else 'mensal')
    trilha = _trilha(k, [(titulo, True, None), (T('cbTrilhaStripe'), False, 'cadeado')])
    form = (f'<div style="display:flex;flex-direction:column;gap:26px;width:440px;">{trilha}'
            f'{_cabeca_form(k, titulo, T("cbAssinarSubPessoal" if solo else "cbAssinarSubTeam"))}'
            f'<div style="display:flex;flex-direction:column;gap:10px;">'
            f'<span style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T("cbPeriodoRot")}</span>'
            f'<div style="display:flex;">{periodo}</div></div>'
            f'<form autocomplete="off" style="margin:0;display:flex;flex-direction:column;gap:18px;">'
            f'<h2 style="margin:0;padding-top:20px;border-top:1px solid {f};font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("cbFiscal")}</h2>'
            f'{_campos_fiscais(k, variante)}</form>'
            f'<div style="display:flex;flex-direction:column;gap:10px;">{_botao_largo(k, T("cbPagar"), "seta")}{_nota_stripe(k)}</div></div>')
    conta, total, per = _numero_conta(variante)
    nomes = PESSOAS_WS[:1] if solo else PESSOAS_WS
    quem = (f'<div style="display:flex;align-items:center;gap:12px;">{_pilha(k, nomes, 30)}'
            f'<span style="display:flex;flex-direction:column;">'
            f'<span style="font-size:14px;line-height:20px;font-weight:500;color:{k["fgs"]};">{T("cbResumoPessoal" if solo else "cbResumoTeam")}</span>'
            f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbResumoPessoalQuem" if solo else "cbVoceMais3")}</span></span></div>')
    linhas = _linha(k, T(conta), T(total) + T(per))
    # o Code Pro (nos dois tipos) com a ressalva do cartão: quem assina no teste fica no teste até o fim, e o teste não dá o Code (R37)
    linhas += _linha(k, f'<span style="display:inline-flex;flex-direction:column;">'
                        f'<span style="display:inline-flex;align-items:center;gap:6px;"><span style="display:flex;width:13px;height:13px;'
                        f'color:{k["pri"]};">{FAISCA}</span>{T("cbCodeProCurto")}</span>'
                        f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbNaPaga")}</span></span>', T('cbIncluso'))
    aplicado = cupom == 'aplicado'
    if aplicado:
        # o desconto e o total com cupom vêm da API (F12); aqui, só o desenho, com as 2 casas
        linhas += _linha(k, f'<span>{T("cbCupom")} <span style="font-family:{MONO};font-size:12.5px;letter-spacing:0.04em;">LANCAMENTO20</span></span>',
                         f'<span style="color:{k["ok"]};">{T("cbDescontoCupom")}</span>')
        valor_total = (f'<span style="display:inline-flex;align-items:baseline;gap:8px;">'
                       f'<s style="font-weight:400;color:{k["mfg"]};">{T(total)}</s>{T("cbTotalCupom")}</span>')
        total_bloco = (_linha(k, T('cbTotalPorMes'), valor_total, True)
                       + f'<p style="margin:0;font-size:12.5px;line-height:17px;color:{k["mfg"]};text-align:right;">{T("cbCupomNota")}</p>')
    else:
        total_bloco = _linha(k, T('cbTotalPorAno' if solo else 'cbTotalPorMes'), T(total), True)
    campo_cupom = _cupom(k, aplicado) if cupom else ''
    itens = (_item(k, 'cbItSoVoce') + _item(k, 'cbItAnual')) if solo else (_item(k, 'cbItAte5') + _item(k, 'cbItAceito'))
    resumo = (f'<div style="display:flex;flex-direction:column;gap:20px;width:380px;">'
              f'{_cabeca_resumo(k, "diamante", "Pro", badge(T("cbAnual" if solo else "cbMensal"), k))}'
              f'{quem}{_bloco(k, linhas)}{campo_cupom}'
              f'{_bloco(k, total_bloco, gap=6)}'
              f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">{itens}</ul></div>')
    return _pagina_checkout(k, form, resumo)


def _passos_depois(k, enviado):
    # o que acontece depois: é uma sequência de verdade, então vai numerada; enviado, o primeiro passo
    # vira o check e o segundo é o de agora
    passos = ['cbPasso1', 'cbPasso2', 'cbPasso3']

    def marca(i):
        if enviado and i == 0:
            return (f'<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;flex:0 0 auto;border-radius:50%;'
                    f'background:{k["tgreen"]};color:{k["tgreenfg"]};"><span style="display:flex;width:13px;height:13px;">{ic("check", 13)}</span></span>')
        agora = (enviado and i == 1) or (not enviado and i == 0)
        est = (f'background:{k["pri"]};color:{k["prifg"]};' if agora
               else f'background:{k["card"]};color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};')
        return (f'<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;flex:0 0 auto;border-radius:50%;{est}'
                f'font-size:12px;font-weight:600;">{i + 1}</span>')
    itens = ''.join(
        f'<li style="position:relative;display:flex;align-items:flex-start;gap:12px;padding-bottom:{0 if i == 2 else 16}px;">'
        + (f'<span aria-hidden="true" style="position:absolute;left:11.5px;top:26px;bottom:2px;width:1px;background:{k["input"]};"></span>' if i < 2 else '')
        + f'{marca(i)}<span style="padding-top:2px;font-size:13.5px;line-height:20px;'
          f'color:{k["fgs"] if (enviado and i == 1) or (not enviado and i == 0) else k["fg"]};">{T(p)}</span></li>'
        for i, p in enumerate(passos))
    return (f'<div style="display:flex;flex-direction:column;gap:14px;">'
            f'<span style="font-size:13px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T("cbDepois")}</span>'
            f'<ol style="margin:0;padding:0;list-style:none;">{itens}</ol></div>')


def _resumo_enterprise(k, enviado):
    linhas = (_linha(k, T('cbPrecoPessoa'), T('cbPrecoEntBr') + T('cbMes'))
              + _linha(k, T('cbMinimo'), T('cbMinimoVal')))
    estimativa = (f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["mfg"]};">{T("cbEstimativaRot")}</span>'
                  + _linha(k, T('cbContaEnt'), T('cbTotalEnt') + T('cbMes'), True))
    itens = _item(k, 'cbItContrato') + _item_code(k, 'cbCodePara40', filete=False)
    return (f'<div style="display:flex;flex-direction:column;gap:20px;width:380px;">'
            f'{_cabeca_resumo(k, "predio", "Enterprise")}'
            f'{_bloco(k, linhas)}{_bloco(k, estimativa, gap=8)}'
            f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">{itens}</ul>'
            f'{_bloco(k, _passos_depois(k, enviado))}</div>')


def pagina_comercial(k, estado):
    enviado = estado == 'enviado'
    trilha = _trilha(k, [(T('cbFalar'), True, None)])
    if enviado:
        recibo = (f'<div style="display:flex;flex-direction:column;gap:10px;padding:16px 18px;border-radius:12px;background:{k["card"]};'
                  f'box-shadow:inset 0 0 0 1px {k["border"]}, {k["sombra"]};">'
                  f'<span style="font-size:12.5px;line-height:16px;font-weight:500;color:{k["mfg"]};">{T("cbSeuPedido")}</span>'
                  f'<span style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:{k["fgs"]};">'
                  f'<span style="display:flex;width:16px;height:16px;color:{k["mfg"]};">{ic("pessoas", 16)}</span>{T("cbPedidoPessoas")}</span>'
                  f'<blockquote style="margin:2px 0 0;padding:0 0 0 12px;box-shadow:inset 2px 0 0 color-mix(in oklab, {k["pri"]} 40%, transparent);'
                  f'font-size:14px;line-height:21px;color:{k["fg"]};">{T("cbMsg")}</blockquote></div>')
        corpo = (f'<div role="status" style="display:flex;flex-direction:column;gap:22px;">'
                 f'<span style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;'
                 f'background:{k["tgreen"]};color:{k["tgreenfg"]};box-shadow:0 0 0 8px color-mix(in oklab, {k["tgreen"]} 40%, transparent);">'
                 f'<span style="display:flex;width:26px;height:26px;">{ic("check", 26)}</span></span>'
                 f'<div style="display:flex;flex-direction:column;gap:8px;">'
                 f'<h1 style="margin:0;font-size:30px;line-height:36px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{T("cbEnviado")}</h1>'
                 f'<p style="margin:0;font-size:15px;line-height:23px;color:{k["fg"]};">{T("cbEnviadoTxt")}</p></div>'
                 f'{recibo}'
                 f'<p style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13.5px;line-height:20px;color:{k["mfg"]};">'
                 f'<span style="display:flex;width:15px;height:15px;margin-top:2px;flex:0 0 auto;">{ic("relogio", 15)}</span>{T("cbEnquanto")}</p>'
                 f'{_botao_largo(k, T("cbVoltarPlanos"))}</div>')
    else:
        passo = lambda icone, aria: (f'<button type="button" aria-label="{T(aria)}" style="display:flex;align-items:center;justify-content:center;'
                                     f'width:44px;height:100%;padding:0;border:0;background:transparent;color:{k["fg"]};">'
                                     f'<span style="display:flex;width:16px;height:16px;">{ic(icone, 16)}</span></button>')
        filete_v = f'<span style="width:1px;align-self:stretch;margin:8px 0;background:color-mix(in oklab, {k["input"]} 45%, {k["field"]});"></span>'
        seletor = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                   f'<label for="assentos" style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T("cbQuantas")}</label>'
                   f'<div style="display:flex;align-items:center;width:200px;height:44px;border-radius:11px;background:{k["field"]};'
                   f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});">'
                   f'{passo("menos", "cbMenos")}{filete_v}'
                   f'<input id="assentos" inputmode="numeric" value="40" aria-describedby="assentos-msg" style="flex:1;min-width:0;height:100%;padding:0;border:0;'
                   f'background:transparent;outline:0;text-align:center;font-family:{FONTE};font-size:17px;font-weight:600;color:{k["fgs"]};'
                   f'font-variant-numeric:tabular-nums;">{filete_v}{passo("mais", "cbMaisUma")}</div>'
                   f'<p id="assentos-msg" style="margin:0;font-size:13px;line-height:18px;color:{k["mfg"]};">{T("cbQuantasDica")}</p></div>')
        mensagem = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                    f'<label for="mensagem" style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T("cbMensagem")} '
                    f'<span style="font-weight:400;color:{k["mfg"]};">({T("cbOpcional")})</span></label>'
                    f'<div id="mensagem" role="textbox" aria-multiline="true" aria-describedby="mensagem-n" style="min-height:132px;padding:11px 14px;'
                    f'border-radius:11px;background:{k["field"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});'
                    f'font-size:15px;line-height:22px;color:{k["fgs"]};">{T("cbMsg")}</div>'
                    f'<span id="mensagem-n" style="align-self:flex-end;font-size:11.5px;line-height:15px;color:{k["mfg"]};'
                    f'font-variant-numeric:tabular-nums;">{T("cbContador")}</span></div>')
        corpo = (f'{_cabeca_form(k, T("cbFalar"), T("cbComercialSub"))}'
                 f'<form style="margin:0;display:flex;flex-direction:column;gap:22px;">{seletor}{mensagem}'
                 f'{_botao_largo(k, T("cbEnviar"))}</form>')
    form = f'<div style="display:flex;flex-direction:column;gap:26px;width:440px;">{trilha}{corpo}</div>'
    return _pagina_checkout(k, form, _resumo_enterprise(k, enviado))


# ── Cobrança (SeatsSummary) ─────────────────────────────────────────────
# Abre com a próxima cobrança: a folhinha traz a data, e ao lado o valor que a API manda (nextInvoice,
# ainda mock; o DS não calcula, F12), o plano e o status; o Stripe à direita. No teste, o mesmo herói
# vira a contagem até o fim do teste. Abaixo, à esquerda, os assentos: ativos × pagos numa barra (o
# pago até a renovação hachurado), as pessoas uma a uma e o Code Pro; à direita, o que mudou no período
# e os dados fiscais mascarados, num cartão próprio.
def _botao(k, txt, var, icone=None):
    est = {'primary': f'background:{k["prisub"]};color:{k["prisubfg"]};',
           'solid': f'background:{k["pri"]};color:{k["prifg"]};',
           'outline': f'background:{k["card"]};color:{k["fg"]};box-shadow:inset 0 0 0 1px {k["input"]};'}[var]
    return (f'<button type="button" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;padding:0 14px;border:0;border-radius:9px;'
            f'{est}font-family:{FONTE};font-size:13.5px;font-weight:500;white-space:nowrap;">{txt}'
            + (f'<span style="display:flex;width:14px;height:14px;">{ic(icone, 14)}</span>' if icone else '') + '</button>')


def _cartao(k, filhos, extra=''):
    return (f'<section style="display:flex;flex-direction:column;gap:18px;padding:20px 22px;border-radius:14px;background:{k["card"]};'
            f'box-shadow:{k["sombra"]};{extra}">{filhos}</section>')


def _h2(k, txt, canto=''):
    return (f'<header style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:28px;">'
            f'<h2 style="margin:0;font-size:14px;line-height:20px;font-weight:600;color:{k["fgs"]};">{txt}</h2>'
            + (f'<span style="display:flex;align-items:center;font-size:12.5px;color:{k["mfg"]};">{canto}</span>' if canto else '') + '</header>')


def _folha(k, mes, dia, cor_topo, aria):
    # a folhinha do calendário: o mês em cima, o dia grande (texto em HTML, traduzível); a data
    # inteira vai no aria-label
    return (f'<span role="img" aria-label="{aria}" style="display:flex;flex-direction:column;width:84px;flex:0 0 auto;overflow:hidden;border-radius:14px;'
            f'background:{k["card"]};box-shadow:0 0 0 1px {k["border"]}, 0 10px 24px -12px rgba(0,0,0,0.3);">'
            f'<span style="display:flex;align-items:center;justify-content:center;height:26px;background:{cor_topo};color:{k["prifg"]};'
            f'font-size:12.5px;font-weight:600;">{mes}</span>'
            f'<span style="display:flex;align-items:center;justify-content:center;height:60px;font-size:36px;font-weight:600;letter-spacing:-0.02em;'
            f'color:{k["fgs"]};font-variant-numeric:tabular-nums;">{dia}</span></span>')


def _heroi(k, esquerda, direita):
    return (f'<section style="position:relative;display:grid;grid-template-columns:minmax(0,1fr) 340px;overflow:hidden;border-radius:16px;'
            f'background:{k["card"]};box-shadow:0 0 0 1px color-mix(in oklab, {k["pri"]} 22%, transparent), {k["sombra"]};">'
            f'<span aria-hidden="true" style="position:absolute;inset:0 0 auto 0;height:1px;'
            f'background:linear-gradient(to right, transparent, color-mix(in oklab, {k["pri"]} 70%, transparent), transparent);"></span>'
            f'<div style="display:flex;align-items:center;gap:28px;padding:28px 32px;">{esquerda}</div>'
            f'<div style="display:flex;flex-direction:column;justify-content:center;gap:14px;padding:24px 28px;'
            f'box-shadow:inset 1px 0 0 {k["muted"]};">{direita}</div></section>')


def _plano_status(k, selos):
    return (f'<div style="display:flex;align-items:center;gap:10px;">'
            f'<span style="font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">Pro</span>{selos}</div>')


def _evento(k, icone, cor, titulo, nota):
    return (f'<li style="display:flex;align-items:flex-start;gap:12px;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;border-radius:8px;{cor}">'
            f'<span style="display:flex;width:15px;height:15px;">{ic(icone, 15)}</span></span>'
            f'<span style="display:flex;flex-direction:column;gap:1px;padding-top:1px;">'
            f'<span style="font-size:13.5px;line-height:19px;font-weight:500;color:{k["fgs"]};">{T(titulo)}</span>'
            f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T(nota)}</span></span></li>')


HACHURA = 'repeating-linear-gradient(135deg, {a} 0 3px, transparent 3px 6px)'


def _assentos(k, teste):
    # ativos × pagos: os dois números, uma barra com um segmento por assento pago (o que sai na
    # renovação hachurado) e as pessoas, uma por linha curta, com o estado; o Code Pro fecha o cartão
    pessoas = PESSOAS_WS + ([] if teste else ['Carlos Souza'])
    n = len(pessoas)

    def numero(valor, rot, cor):
        return (f'<div style="display:flex;flex-direction:column;gap:2px;">'
                f'<span style="font-size:34px;line-height:38px;font-weight:600;letter-spacing:-0.025em;color:{cor};font-variant-numeric:tabular-nums;">{valor}</span>'
                f'<span style="font-size:13px;line-height:18px;color:{k["mfg"]};">{T(rot)}</span></div>')

    seg = lambda sai: (f'<span style="flex:1;height:10px;border-radius:3px;'
                       + (f'background:{HACHURA.format(a="color-mix(in oklab, " + k["pri"] + " 45%, transparent)")};'
                          f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 45%, transparent);' if sai else
                          (f'background:color-mix(in oklab, {k["pri"]} 22%, {k["card"]});' if teste else f'background:{k["pri"]};'))
                       + '"></span>')
    barra = (f'<div role="img" aria-label="{T("cbBarraAria" if not teste else "cbBarraTesteAria")}" style="display:flex;gap:4px;">'
             + ''.join(seg(p == 'Carlos Souza') for p in pessoas) + '</div>')
    if teste:
        topo_ = (f'<div style="display:flex;align-items:flex-end;gap:28px;">{numero(len(PESSOAS_WS), "cbAtivos", k["fgs"])}'
                 f'{numero(0, "cbPagosTeste", k["mfg"])}</div>')
        legenda = f'<span>{T("cbTesteAssentos")}</span>'
    else:
        topo_ = (f'<div style="display:flex;align-items:flex-end;gap:28px;">{numero(len(PESSOAS_WS), "cbAtivos", k["fgs"])}'
                 f'<span aria-hidden="true" style="width:1px;align-self:stretch;background:{k["muted"]};"></span>'
                 f'{numero(n, "cbPagosPeriodo", k["fgs"])}</div>')
        pt = lambda est, txt: (f'<span style="display:inline-flex;align-items:center;gap:6px;">'
                               f'<span style="width:14px;height:8px;border-radius:2px;{est}"></span>{T(txt)}</span>')
        legenda = (pt(f'background:{k["pri"]};', 'cbLegAtivo')
                   + pt(f'background:{HACHURA.format(a="color-mix(in oklab, " + k["pri"] + " 45%, transparent)")};'
                        f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 45%, transparent);', 'cbLegSai'))

    def pessoa(nome, i):
        # cada assento: a pessoa e, embaixo, o que o assento traz (o Code Pro) ou até quando é pago
        sai = nome == 'Carlos Souza'
        if sai:
            sub = f'<span style="font-size:12px;line-height:16px;color:{k["mfg"]};">{T("cbAteRenov")}</span>'
        elif teste:
            sub = f'<span style="font-size:12px;line-height:16px;color:{k["mfg"]};">{T("cbNoTeste")}</span>'
        else:
            sub = (f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;line-height:16px;color:{k["prisubfg"]};">'
                   f'<span style="display:flex;width:11px;height:11px;">{ic("brilho", 11)}</span>Code Pro</span>')
        voce = (f'<span style="font-size:11px;line-height:14px;padding:0 5px;border-radius:4px;box-shadow:inset 0 0 0 1px {k["input"]};'
                f'color:{k["mfg"]};">{T("cbVoce")}</span>') if i == 0 else ''
        return (f'<li style="display:flex;align-items:center;gap:10px;min-width:0;padding:8px 10px;border-radius:12px;'
                + (f'box-shadow:inset 0 0 0 1px {k["input"]};border:0;' if sai else f'background:{k["sunken"]};')
                + f'"><span style="display:flex;{"opacity:0.6;" if sai else ""}">{_avatar(k, nome, i, 28, apagado=sai)}</span>'
                f'<span style="display:flex;flex-direction:column;min-width:0;">'
                f'<span style="display:flex;align-items:center;gap:6px;font-size:13px;line-height:17px;font-weight:500;'
                f'color:{k["mfg"] if sai else k["fgs"]};white-space:nowrap;">{nome}{voce}</span>{sub}</span></li>')

    lista = ('<ul style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">'
             + ''.join(pessoa(p, i) for i, p in enumerate(pessoas)) + '</ul>')
    code_cor = f'background:{k["pri"]};color:{k["prifg"]};' if not teste else f'background:{k["sunken"]};color:{k["mfg"]};'
    code = (f'<div style="display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid {k["muted"]};">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;flex:0 0 auto;border-radius:9px;{code_cor}">'
            f'<span style="display:flex;width:16px;height:16px;">{ic("brilho", 16)}</span></span>'
            f'<span style="display:flex;flex-direction:column;">'
            f'<span style="font-size:13.5px;line-height:19px;font-weight:500;color:{k["fgs"]};">{T("cbCodeTesteTit" if teste else "cbCodeAtivos")}</span>'
            f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbCodeNaAssinatura" if teste else "cbCodeAtivosNota")}</span></span></div>')
    return _cartao(k, (
        f'{_h2(k, T("cbAssentos"))}{topo_}'
        f'<div style="display:flex;flex-direction:column;gap:8px;">{barra}'
        f'<div style="display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;line-height:17px;color:{k["mfg"]};">{legenda}</div></div>'
        f'{lista}{code}'))


def _fiscal(k, teste):
    if teste:
        corpo = (f'<p style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:19px;color:{k["mfg"]};">'
                 f'<span style="display:flex;width:14px;height:14px;margin-top:2px;flex:0 0 auto;">{ic("cadeado", 14)}</span>{T("cbFiscalNoTeste")}</p>')
        return _cartao(k, f'{_h2(k, T("cbDadosFiscais"))}{corpo}')
    linha = lambda r, v: (f'<div style="display:flex;flex-direction:column;gap:2px;">'
                          f'<dt style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{r}</dt>'
                          f'<dd style="margin:0;font-size:13.5px;line-height:19px;color:{k["fgs"]};">{v}</dd></div>')
    editar = (f'<button type="button" style="display:inline-flex;align-items:center;height:28px;padding:0 10px;border:0;border-radius:7px;'
              f'background:transparent;box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:12.5px;font-weight:500;color:{k["fg"]};">'
              f'{T("cbEditarFiscal")}</button>')
    dl = (f'<dl style="margin:0;display:flex;flex-direction:column;gap:12px;">'
          + linha('CNPJ', f'<span style="font-family:{MONO};font-size:13px;">12.***.***/****-35</span>')
          + linha(T('cbRazao'), 'Moura &amp; Filhos Tecnologia Ltda.') + '</dl>')
    cab = (f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">'
           f'<div style="display:flex;flex-direction:column;gap:2px;">'
           f'<h2 style="margin:0;font-size:14px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("cbDadosFiscais")}</h2>'
           f'<p style="margin:0;font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbFiscalValem")}</p></div>{editar}</div>')
    return _cartao(k, f'{cab}{dl}')


def _folha_vazia(k):
    # a folhinha sem data: o topo apagado e a nuvem cortada no lugar do dia (o Stripe não respondeu)
    return (f'<span role="img" aria-label="{T("cbIndispAria")}" style="display:flex;flex-direction:column;width:84px;flex:0 0 auto;overflow:hidden;border-radius:14px;'
            f'background:{k["card"]};box-shadow:0 0 0 1px {k["border"]}, 0 10px 24px -12px rgba(0,0,0,0.3);">'
            f'<span style="height:26px;background:{k["sunken"]};box-shadow:inset 0 -1px 0 {k["border"]};"></span>'
            f'<span style="display:flex;align-items:center;justify-content:center;height:60px;color:{k["mfg"]};">'
            f'<span style="display:flex;width:28px;height:28px;">{ic("nuvem_off", 28)}</span></span></span>')


def tela_cobranca(k, teste=False, sem_stripe=False):
    if teste:
        dias = ''.join(f'<span style="flex:1;height:8px;border-radius:3px;background:'
                       f'{k["pri"] if i == 0 else "color-mix(in oklab, " + k["pri"] + " 16%, " + k["card"] + ")"};"></span>' for i in range(14))
        esquerda = (f'{_folha(k, T("cbMesOut"), "26", k["ok"], T("cbTesteTermina"))}'
                    f'<div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0;">'
                    f'<div style="display:flex;flex-direction:column;gap:4px;">'
                    f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["mfg"]};">{T("cbTesteRot")}</span>'
                    f'<span style="display:flex;align-items:baseline;gap:10px;">'
                    f'<span style="font-size:56px;line-height:1;font-weight:600;letter-spacing:-0.035em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{T("cbTesteDias")}</span>'
                    f'<span style="font-size:16px;color:{k["fg"]};">{T("cbTesteDiasRot")}</span></span></div>'
                    f'<div style="display:flex;flex-direction:column;gap:6px;max-width:420px;">'
                    f'<div aria-hidden="true" style="display:flex;gap:4px;">{dias}</div>'
                    f'<div style="display:flex;justify-content:space-between;font-size:12px;line-height:16px;color:{k["mfg"]};">'
                    f'<span>{T("cbTesteHoje")}</span><span>{T("cbTesteFim")}</span></div></div></div>')
        direita = (f'{_plano_status(k, badge(T("cbNoTeste"), k, "green", ponto=True))}'
                   f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["fg"]};">{T("cbTesteSemCobranca")}</p>'
                   f'<button type="button" style="display:flex;align-items:center;justify-content:center;gap:8px;height:40px;border:0;border-radius:10px;'
                   f'background:{k["pri"]};color:{k["prifg"]};font-family:{FONTE};font-size:14px;font-weight:500;">{T("cbAssinarPro")}</button>')
        lado = _cartao(k, (
            f'{_h2(k, T("cbSeAssinar"))}'
            f'{_conta(k, "cbContaPro", "cbTotalPro", "cbMes", grande=28)}'
            f'<p style="margin:0;font-size:12.5px;line-height:17px;color:{k["mfg"]};">{T("cbSeAssinarNota")}</p>'))
    elif sem_stripe:
        # nextInvoiceUnavailable: o resto do resumo responde; só o valor e a data da próxima cobrança faltam
        esquerda = (f'{_folha_vazia(k)}'
                    f'<div style="display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0;">'
                    f'<div style="display:flex;flex-direction:column;gap:4px;">'
                    f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["mfg"]};">{T("cbProxima")}</span>'
                    f'<span style="font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};text-wrap:balance;">{T("cbIndisp")}</span>'
                    f'<span style="font-size:13.5px;line-height:19px;color:{k["mfg"]};">{T("cbIndispNota")}</span></div>'
                    f'{_botao(k, T("cbTentar"), "outline", "recarregar")}</div>')
    if not teste:
        if not sem_stripe:
            esquerda = (f'{_folha(k, T("cbMesCurto"), "12", k["pri"], T("cbProxData"))}'
                        f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
                        f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["mfg"]};">{T("cbProxima")}</span>'
                        f'<span style="font-size:56px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{T("cbProxValor")}</span>'
                        f'<span style="font-size:13.5px;line-height:19px;color:{k["mfg"]};">{T("cbProxConta")}</span></div>')
        direita = (f'{_plano_status(k, badge(T("cbAtiva"), k, "green", ponto=True) + badge(T("cbMensal"), k))}'
                   f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("cbStripeNota")}</p>'
                   f'<div style="display:flex;gap:8px;">{_botao(k, T("cbStripe"), "primary", "externo")}{_botao(k, T("cbVerPlanos"), "outline")}</div>')
        lado = _cartao(k, (
            f'{_h2(k, T("cbNestePeriodo"), T("cbPeriodoDatas"))}'
            f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px;">'
            f'{_evento(k, "pessoa_mais", "background:" + k["tgreen"] + ";color:" + k["tgreenfg"] + ";", "cbEvEntrou", "cbEvEntrouNota")}'
            f'{_evento(k, "pessoa_menos", "background:" + k["sunken"] + ";color:" + k["mfg"] + ";", "cbEvSai", "cbEvSaiNota")}</ul>'))
    conteudo = (f'{_heroi(k, esquerda, direita)}'
                f'<div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start;">'
                f'{_assentos(k, teste)}<div style="display:flex;flex-direction:column;gap:20px;">{lado}{_fiscal(k, teste)}</div></div>')
    return pagina_produto(k, T('cbCobranca'), T('cbCobrancaSub'), conteudo, 1040)


TELAS_C = {
    'planos_teste': lambda k: tela_planos(k, 'teste'),
    'planos_anual': lambda k: tela_planos(k, 'anual'),
    'planos_carregando': lambda k: tela_planos(k, 'carregando'),
    'planos_pessoal': lambda k: tela_planos(k, 'teste', 'personal'),
    'assinar_pro': lambda k: pagina_assinar(k, 'team', 'fechado'),
    'assinar_cupom': lambda k: pagina_assinar(k, 'team', 'aplicado'),
    'assinar_pessoal': lambda k: pagina_assinar(k, 'pessoal'),
    'assinar_erro': lambda k: pagina_assinar(k, 'erro'),
    'assinar_eua': lambda k: pagina_assinar(k, 'eua', 'fechado'),
    'comercial': lambda k: pagina_comercial(k, 'aberto'),
    'comercial_enviado': lambda k: pagina_comercial(k, 'enviado'),
    'cobranca': lambda k: tela_cobranca(k),
    'cobranca_teste': lambda k: tela_cobranca(k, teste=True),
    'cobranca_sem_stripe': lambda k: tela_cobranca(k, sem_stripe=True),
}
