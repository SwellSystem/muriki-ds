# A escolha obrigatória de plano (2026-10-03): /plans para quem terminou o onboarding e ainda não
# escolheu. A API responde 403 PLAN_CHOICE_REQUIRED nas rotas do Code e o app segura a pessoa aqui.
# Três opções lado a lado: Starter, o teste do Pro (o recomendado, sem cartão, o único botão sólido)
# e o Pro pago. A faixa "Falta escolher" diz por que a pessoa está aqui, sem alarme.
# É o plans-page do DS (registry/muriki/blocks/plans-page) com o tom "required" do SubscriptionStatus.
from base import *
from movel_code import raiz_movel, topo_movel, PAD

ALTURA_MOVEL = 1680


def _seletor(k):
    seg = lambda txt, ativo, extra='': (
        f'<button type="button" role="radio" aria-checked="{"true" if ativo else "false"}" style="display:inline-flex;align-items:center;gap:6px;'
        f'height:30px;padding:0 16px;border-radius:999px;border:0;font-family:{FONTE};font-size:13px;font-weight:500;'
        + (f'background:{k["card"]};box-shadow:{k["sombra"]};color:{k["pri"]};' if ativo else f'background:transparent;color:{k["mfg"]};')
        + f'">{txt}{extra}</button>')
    return (f'<div role="radiogroup" aria-label="{T("periodo")}" style="display:inline-flex;padding:3px;border-radius:999px;'
            f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);">'
            f'{seg(T("mensal"), True)}{seg(T("anual"), False, badge(T("economia"), k, "green"))}</div>')


def _falta_escolher(k):
    # o tom "required": azul tingido, o selo sem ponto (é um passo, não um estado)
    return (f'<section role="status" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:12px 16px;border-radius:8px;'
            f'background:{k["prisub"]};box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["pri"]} 22%, transparent);">'
            f'{badge(T("faltaEscolher"), k, "blue")}'
            f'<p style="margin:0;flex:1;min-width:220px;font-size:14px;line-height:20px;color:{k["fg"]};">{T("faltaTxt")}</p></section>')


def _item(k, t, tracejado=False):
    if tracejado:
        return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["mfg"]};">'
                f'<span style="flex:1;">{t}</span><span style="margin-top:1px;">{badge(T("aDefinir"), k, tracejado=True)}</span></li>')
    return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["fg"]};">'
            f'<span style="margin-top:3px;">{ic("check", 15, k["ok"])}</span><span>{t}</span></li>')


def _plano(k, aria, nome, preco, nota, itens, acao, destaque=False, selo='', aba='', pad='28px 30px'):
    borda = (f'box-shadow:0 0 0 1.5px color-mix(in oklch, {k["pri"]} 60%, transparent), {k["sombraFlut"]};' if destaque
             else f'box-shadow:{k["sombra"]};')
    brilho = (f'<span aria-hidden="true" style="position:absolute;inset:0 0 auto 0;height:1px;'
              f'background:linear-gradient(to right, transparent, color-mix(in oklch, {k["pri"]} 70%, transparent), transparent);"></span>'
              f'<span aria-hidden="true" style="position:absolute;top:-96px;right:-96px;width:192px;height:192px;border-radius:999px;'
              f'background:color-mix(in oklch, {k["pri"]} 8%, transparent);filter:blur(40px);"></span>') if destaque else ''
    tab = (f'<span style="position:absolute;top:0;right:0;padding:2px 8px;border-bottom-left-radius:8px;background:{k["pri"]};'
           f'color:{k["prifg"]};font-size:10px;font-weight:600;letter-spacing:0.02em;">{aba}</span>') if aba else ''
    return (f'<section aria-label="{aria}" style="position:relative;overflow:hidden;flex:1;min-width:0;background:{k["card"]};border-radius:16px;{borda}'
            f'padding:{pad};display:flex;flex-direction:column;gap:20px;{"transform:scale(1.03);" if destaque and pad == "28px 30px" else ""}">{brilho}{tab}'
            f'<div style="position:relative;display:flex;align-items:center;gap:8px;">'
            f'<h2 style="margin:0;font-size:18px;font-weight:600;color:{k["fgs"]};">{nome}</h2>{selo}</div>'
            f'<div style="position:relative;display:flex;flex-direction:column;gap:4px;">'
            f'<span style="font-size:34px;line-height:40px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.02em;">{preco}</span>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{nota}</span></div>'
            f'<ul style="position:relative;margin:0;padding:18px 0 0;border-top:1px solid {k["muted"]};list-style:none;display:flex;flex-direction:column;gap:12px;flex:1;">{itens}</ul>'
            f'<div style="position:relative;">{acao}</div></section>')


def _tres(k, pad='28px 30px', alt=40):
    starter = _plano(k, T('ariaStarter'), 'Starter', T('gratis'), T('semCartao'),
                     _item(k, T('s1')) + _item(k, T('s2')) + _item(k, T('s3')) + _item(k, T('s4'), tracejado=True),
                     botao(T('ficarStarter'), k, 'outline', alt, largura='100%'), pad=pad)
    teste = _plano(k, T('ariaTeste'), 'Pro', T('gratis'), T('testeNota'),
                   _item(k, T('t1')) + _item(k, T('t2')) + _item(k, T('t3')),
                   botao(T('testarPro'), k, 'solid', alt, largura='100%'),
                   destaque=True, selo=badge(T('testeSelo'), k, 'green'), aba=T('recomendado'), pad=pad)
    pro = _plano(k, T('ariaPro'), 'Pro',
                 f'{T("preco")} <span style="font-size:15px;font-weight:500;letter-spacing:0;color:{k["mfg"]};">{T("porMes")}</span>', T('porAno'),
                 _item(k, T('p1')) + _item(k, T('p2')) + _item(k, T('p3')) + _item(k, T('p4')),
                 botao(T('assinarPro'), k, 'outline', alt, largura='100%'), pad=pad)
    return starter, teste, pro


def _regras(k, coluna=False):
    regra = lambda icone, t: (f'<li style="display:flex;gap:10px;align-items:flex-start;flex:1;font-size:13px;line-height:20px;color:{k["mfg"]};">'
                              f'<span style="margin-top:2px;">{ic(icone, 15, k["mfg"])}</span><span>{t}</span></li>')
    direcao = 'flex-direction:column;gap:12px;' if coluna else 'gap:28px;'
    return (f'<ul style="margin:0;padding:18px 4px 0;list-style:none;display:flex;{direcao}border-top:1px solid {k["muted"]};">'
            f'{regra("relogio", T("r1"))}{regra("troca", T("r2"))}{regra("brilho", T("r3"))}</ul>')


def tela_planos_escolha(k):
    cab = cabecalho(k, None, T('escTitulo'), T('escSub'), direita=_seletor(k))
    starter, teste, pro = _tres(k)
    return app(k, 'plano', cab + _falta_escolher(k)
               + f'<div style="display:flex;gap:24px;align-items:stretch;">{starter}{teste}{pro}</div>' + _regras(k))


def tela_planos_escolha_movel(k):
    # no celular os três empilham na ordem da tela; o seletor vem embaixo do título
    starter, teste, pro = _tres(k, pad='24px 22px', alt=44)
    pagina = (f'<main style="padding:18px {PAD}px 28px;display:flex;flex-direction:column;gap:18px;">'
              f'<div style="display:flex;flex-direction:column;gap:8px;">'
              f'<h1 style="margin:0;font-size:24px;line-height:30px;font-weight:600;color:{k["fgs"]};">{T("escTitulo")}</h1>'
              f'<p style="margin:0;font-size:14px;line-height:20px;color:{k["mfg"]};">{T("escSub")}</p></div>'
              f'<div>{_seletor(k)}</div>{_falta_escolher(k)}{starter}{teste}{pro}{_regras(k, coluna=True)}</main>')
    return f'{raiz_movel(k, ALTURA_MOVEL, "display:flex;flex-direction:column;")}{topo_movel(k, T("escTitulo"))}{pagina}</div>'
