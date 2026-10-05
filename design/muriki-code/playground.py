# ── Playground com tipos e o desenho livre ──────────────────────────────
# O Playground deixa de ser "em breve" e vira o lugar de criar livre: os tipos no topo (Desenho de
# arquitetura, e Código livre em breve) e "Seus desenhos" embaixo; o limite do Starter só no modal. O
# desenho livre é a bancada sem regras e sem Verificar, com notas. Espelha os blocos playground e
# architecture-board do registry. Contrato: swell-docs/muriki-api/features/arch-cloud/fd-desenho.md.
from base import *
from base import _estilo_botao
from arquitetura import IP, _grupo, _peca, _peca_servico, _chip, _ip, _titulo_secao, _provedor
from desbloqueio import logo_arq

# a nota usa o lápis da base, no traço dos ícones da bancada
IP.setdefault('nota', I['lapis'])
IP.setdefault('decisao', svg('<path d="M8 1.6L14.4 8L8 14.4L1.6 8z"/>'))
IP.setdefault('nuvem', svg('<path d="M4.6 12.6h6.8a3 3 0 00.4-6A4.2 4.2 0 003.6 7.4a2.6 2.6 0 001 5.2z"/>'))
IP.setdefault('codigo', svg('<path d="M5.4 4.6L2 8l3.4 3.4M10.6 4.6L14 8l-3.4 3.4"/>'))
IP.setdefault('conversa', svg('<path d="M2.4 8a5.6 5.6 0 118.6 4.7L8 13.6l-.2-1A5.6 5.6 0 012.4 8z"/>'))


# no escuro, o traço índigo fixo sumia no ladrilho escuro: a mesma variante do BrandLogo sem tile,
# por CSS, porque o tema do quadro troca em tempo de execução
CSS_PLAYGROUND = (
    '\n.escuro .logo-tema [fill="#d7e0ff"]{fill:oklch(0.36 0.09 275);}'
    '\n.escuro .logo-tema [fill="#fff"]{fill:oklch(0.5 0.13 275);}'
    '\n.escuro .logo-tema [stroke="#4147d5"]{stroke:oklch(0.8 0.11 275);}')


def _logo_arq_tema(k, tam):
    return f'<span class="logo-tema" style="display:flex;">{logo_arq(tam)}</span>'


def _ladrilho(k, conteudo, marca=True):
    # o ladrilho no tom da marca (e não branco: no escuro, o branco acendia no cartão)
    fundo = f'background:{k["prisub"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 22%, transparent);' if marca else f'background:{k["sunken"]};color:{k["mfg"]};'
    return (f'<span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:11px;flex:0 0 auto;{fundo}">{conteudo}</span>')


def _pontos(k, itens, apagado=False):
    # o que o tipo faz: ícone num quadradinho e o texto curto
    cor_icone = f'background:{k["sunken"]};color:{k["mfg"]};' if apagado else f'background:{k["prisub"]};color:{k["prisubfg"]};'
    return ('<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
            + ''.join(f'<li style="display:flex;align-items:center;gap:10px;font-size:13px;line-height:18px;color:{k["mfg"] if apagado else k["fg"]};">'
                      f'<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;flex:0 0 auto;{cor_icone}">{_ip(icone, 14)}</span>{T(chave)}</li>'
                      for icone, chave in itens)
            + '</ul>')


def _cartao_tipo_desenho(k):
    # sem contador nem barrinha: o Novo fica sempre ativo, e o limite só aparece se bloquear (o modal)
    pe = (f'<div style="display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:16px;border-top:1px solid {k["muted"]};">'
          f'<span style="margin-left:auto;">{botao(T("pgNovo"), k, "primary", 32)}</span></div>')
    return (f'<div style="display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
            f'<div style="display:flex;align-items:flex-start;gap:14px;">{_ladrilho(k, _logo_arq_tema(k, 24))}'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
            f'<h2 style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("pgDesenho")}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pgDesenhoTxt")}</p></div></div>'
            f'{_pontos(k, [("nuvem", "pgPonto1"), ("nota", "pgPonto2"), ("pulso", "pgPonto3")])}'
            f'{pe}</div>')


def _cartao_tipo_codigo(k):
    # o que ainda não existe: contorno tracejado e os pontos apagados
    return (f'<div aria-disabled="true" style="display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:12px;'
            f'border:1.5px dashed {k["input"]};background:color-mix(in oklab, {k["card"]} 50%, transparent);">'
            f'<div style="display:flex;align-items:flex-start;gap:14px;">{_ladrilho(k, ic("terminal", 20), marca=False)}'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
            f'<h2 style="margin:0;display:flex;align-items:center;gap:8px;font-size:17px;line-height:23px;font-weight:600;color:{k["fg"]};">'
            f'{T("pgCodigo")}{badge(T("pgEmBreve"), k, "gray")}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pgCodigoTxt")}</p></div></div>'
            f'{_pontos(k, [("codigo", "pgPonto4"), ("conversa", "pgPonto5")], apagado=True)}'
            f'<span style="margin-top:auto;padding-top:16px;border-top:1px solid {k["muted"]};font-size:12px;color:{k["mfg"]};">{T("pgAvisamos")}</span></div>')


def _lista(k, desenhos):
    borda = f'border-top:1px solid {k["muted"]};'
    linhas = ''.join(
        f'<li style="display:flex;align-items:center;gap:8px;min-height:64px;padding:0 8px 0 12px;{"" if i == 0 else borda}">'
        f'<a href="DesenhoLivre__SUF__.dc.html" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;color:inherit;">'
        f'<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;background:{k["prisub"]};flex:0 0 auto;">{_logo_arq_tema(k, 18)}</span>'
        f'<span style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;">'
        f'<span style="font-size:14px;line-height:20px;font-weight:500;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{titulo}</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T(criado)}</span></span>'
        f'<span style="font-size:12.5px;color:{k["mfg"]};white-space:nowrap;">{T(salvo)}</span>'
        f'<span style="display:flex;color:{k["mfg"]};">{ic("direita", 14)}</span></a>'
        f'<span role="img" aria-label="{T("pgApagar")}" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{ic("lixeira", 14)}</span></li>'
        for i, (titulo, salvo, criado) in enumerate(desenhos))
    return (f'<ul style="margin:0;padding:0;list-style:none;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};overflow:hidden;">{linhas}</ul>')


DESENHOS = [('Farmácia fora do ar', 'pgSalvo2h', 'pgCriado1'), ('Encurtador de links na AWS', 'pgSalvoOntem', 'pgCriado2'), ('Fila de pedidos com DLQ', 'pgSalvo4d', 'pgCriado3')]


def tela_playground(k, limite=False):
    desenhos = DESENHOS if limite else DESENHOS[:2]
    cab = (f'<header style="display:flex;flex-direction:column;gap:8px;">'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("pgTitulo")}</h1>'
           f'<p style="margin:0;max-width:640px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("pgSub")}</p></header>')
    tipos = (f'<section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">'
             f'{_cartao_tipo_desenho(k)}{_cartao_tipo_codigo(k)}</section>')
    lista = (f'<section style="display:flex;flex-direction:column;gap:8px;">'
             f'<div style="display:flex;align-items:baseline;gap:12px;">'
             f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("pgSeus")}</h2></div>'
             f'{_lista(k, desenhos)}</section>')
    tela = app(k, 'playground', cab + tipos + lista, gap=24)
    if not limite:
        return tela
    # o Novo foi clicado com 3 desenhos no Starter: a API recusa (409 DRAWING_LIMIT_REACHED) e o modal abre
    vagas = (f'<span class="logo-tema" style="display:flex;">{logo_arq(24)}</span>', 3)
    return com_modal(k, tela, modal_limite_plano(k, T('plRotulo'), T('pgLimiteTitulo'), T('pgLimiteTxt'), T('pgLimitePro'), vagas, T('plUso')))


def _nota(k, x, y, chave):
    # o bilhete amarelo do desenho livre: texto solto, sem alça
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:200px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;'
            f'padding:10px 12px;border-radius:10px;background:{k["tyellow"]};color:{k["tyellowfg"]};'
            f'box-shadow:0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px color-mix(in oklab, {k["tyellowfg"]} 18%, transparent);">'
            f'<span style="display:flex;opacity:0.7;">{_ip("nota", 14)}</span>'
            f'<p style="margin:0;font-size:12.5px;line-height:18px;white-space:pre-wrap;">{T(chave)}</p></div>')


def _decisao(k, x, y, rotulo, lado=112):
    # a Decisão: o losango do fluxograma, como o nó do bloco; o rótulo no meio, as saídas nos vértices
    m = lado / 2
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{lado}px;height:{lado}px;display:flex;align-items:center;justify-content:center;">'
            f'<svg viewBox="0 0 {lado} {lado}" width="{lado}" height="{lado}" aria-hidden="true" style="position:absolute;inset:0;overflow:visible;">'
            f'<polygon points="{m},2 {lado - 2},{m} {m},{lado - 2} 2,{m}" stroke-linejoin="round" fill="var(--card)" stroke="var(--input)" stroke-width="1.25"/></svg>'
            f'<span style="position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;max-width:64px;text-align:center;">'
            f'<span style="display:flex;color:{k["pri"]};">{_ip("decisao", 13)}</span>'
            f'<span style="font-size:11.5px;line-height:14px;font-weight:500;color:{k["fgs"]};">{T(rotulo)}</span></span></div>')


def _diagrama_livre(k, destaque=False):
    # palco de 960 × 460, na AWS: o App fora; o balanceador na sub-rede pública; na privada, Pedidos chega à
    # Decisão "Estoque disponível?": sim escreve no Estoque, não chama "Avisar cliente", fora da região
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    seta = 'marker-end="url(#seta-livre)"'
    linha = lambda d: f'<path d="{d}" fill="none" stroke="{traco}" stroke-width="1.25" {seta}/>'
    linhas = (
        f'<svg viewBox="0 0 960 460" width="960" height="460" style="position:absolute;inset:0;overflow:visible;z-index:1;pointer-events:none;" aria-hidden="true">'
        f'<defs><marker id="seta-livre" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
        + linha('M148 246H186Q194 246 194 238V154Q194 146 202 146H222')
        + linha('M390 146H434')
        + linha('M518 172V196')
        + linha('M518 306V346')
        + linha('M574 252H780')
        + '</svg>')
    grupos = (_grupo(k, 190, 40, 560, 410, 'regiao', 'us-east-1')
              + _grupo(k, 206, 76, 196, 132, 'publica')
              + _grupo(k, 420, 76, 316, 360, 'privada'))
    pecas = (_peca(k, -20, 220, 'cliente', T('pCliente'), T('nApp'))
             + _peca_servico(k, 222, 120, 'aws.elb', 'Elastic Load Balancing', T('nEntrada'))
             + _peca_servico(k, 434, 120, 'aws.lambda', 'AWS Lambda', T('nPedidos'))
             + _decisao(k, 462, 196, 'nDecisao')
             + _peca_servico(k, 434, 346, 'aws.rds', 'Amazon RDS', T('nEstoque'))
             + _peca_servico(k, 780, 226, 'aws.ses', 'Amazon SES', T('nAvisar')))
    notas = _nota(k, -20, 40, 'nota1') + _nota(k, 214, 300, 'nota2')
    # o destaque da revisão no Estoque: a moldura solta e cheia, na marca, mais leve que a seleção
    if destaque:
        pecas += (f'<div aria-hidden="true" style="position:absolute;left:428px;top:340px;width:180px;height:64px;box-sizing:border-box;'
                  f'border-radius:14px;border:2px solid color-mix(in oklab, {k["pri"]} 55%, transparent);pointer-events:none;"></div>')
    rotulo = lambda rel, cond: f'{T(rel)} <span style="color:{k["fg"]};">· {T(cond)}</span>'
    chips = (_chip(k, 194, 196, T('chama')) + _chip(k, 412, 146, T('chama')) + _chip(k, 518, 184, T('chama'))
             + _chip(k, 518, 326, rotulo('escreve', 'sim')) + _chip(k, 680, 252, rotulo('chama', 'nao')))
    return f'<div style="position:relative;width:960px;height:460px;zoom:0.84;">{grupos}{linhas}{pecas}{notas}{chips}</div>'


def tela_desenho_livre(k, revisao=False):
    # com a revisão, o "Revisar" com o selo Pro entra à direita do salvo (o slot actions do cabeçalho)
    revisar = (f'<a href="DesenhoRevisao__SUF__.dc.html" style="{_estilo_botao("", k, "outline", 32, None, None)}gap:7px;padding:0 12px;color:{k["fgs"]};">'
               f'{ic("brilho", 15)}{T("drRevisar")}{badge("Pro", k, "blue")}</a>')
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">{voltar(k, T("dlVoltar"), "PlaygroundDesenhos__SUF__.dc.html")}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">Farmácia fora do ar</h1></div>'
           f'<span style="display:inline-flex;align-items:center;gap:12px;padding-bottom:4px;">'
           f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
           f'<span style="width:12px;height:12px;border-radius:999px;background:{k["ok"]};display:inline-flex;"></span>{T("dlSalvo")}</span>{revisar}</span></header>')
    item = lambda icone, nome: (f'<li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:6px;font-size:12.5px;color:{k["fg"]};">'
                                f'{_ip(icone, 15, k["mfg"])}{nome}</li>')
    secao = lambda titulo, conteudo, direita='': (
        f'<div style="border-top:1px solid {k["muted"]};"><div style="display:flex;align-items:center;height:38px;padding:0 12px 0 14px;">'
        f'{_titulo_secao(titulo, k, forte=False)}<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{direita}</span></div>{conteudo}</div>')
    pecas = secao(T('pecasTit'), f'<ul style="margin:0;padding:0 6px 8px;list-style:none;">'
                  + ''.join(item(i, T(n)) for i, n in [('cliente', 'pCliente'), ('decisao', 'pDecisao'), ('balanceador', 'pBalanceador'), ('api', 'pApi'), ('banco', 'pBanco'), ('cache', 'pCache'), ('fila', 'pFila')]) + '</ul>')
    grupos = secao(T('gruposTit'), f'<ul style="margin:0;padding:0 6px 8px;list-style:none;">'
                   + ''.join(item('grupo', T(g)) for g in ('gRegiao', 'gZona', 'gVpc', 'gPublica', 'gPrivada')) + '</ul>')
    notas = secao(T('notasTit'), f'<ul style="margin:0;padding:0 6px 4px;list-style:none;">{item("nota", T("nota"))}</ul>'
                  f'<span style="display:block;padding:0 16px 10px;font-size:11.5px;line-height:16px;color:{k["mfg"]};">{T("notasDica")}</span>', T('notasConta'))
    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;min-height:0;overflow-y:auto;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">{_provedor(k, "aws")}{pecas}{grupos}{notas}</div>')
    # sem regras não há Verificar: Expandir e Simular ficam
    barra = (f'<div style="display:flex;align-items:center;gap:8px;min-height:41px;padding:6px 8px 6px 12px;border-bottom:1px solid {k["muted"]};box-sizing:border-box;">'
             f'<span style="flex:1;min-width:0;font-size:12px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{T("dlDica")}</span>'
             f'<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{_ip("painel", 14)}</span>'
             f'<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;font-size:13px;font-weight:500;color:{k["fgs"]};">{_ip("pulso", 14)}{T("simular")}</span></div>')
    # com a revisão, a visão já foi até o Estoque destacado (o fitView do highlight): o desenho encosta à esquerda
    alinhar = 'flex-start;padding-left:24px' if revisao else 'center'
    palco = (f'<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:{alinhar};overflow:hidden;background-color:{k["card"]};'
             f'background-image:radial-gradient(circle, {k["input"]} 1px, transparent 1.2px);background-size:18px 18px;">{_diagrama_livre(k, destaque=revisao)}</div>')
    status = (f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
              f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;"><span>{T("status")}</span></div>')
    bancada = (f'<section style="flex:1;min-height:0;display:flex;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
               f'{lateral}<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{barra}{palco}{status}</div></section>')
    return app(k, 'playground', cab + bancada, compacto=True, pad='24px 28px', gap=18)


# ── a Revisão do Pro (bloco drawing-review) ─────────────────────────────

def _item_revisao(k, chave, refs=(), padrao=None, marcado=False):
    # o achado ou a sugestão: texto puro; as peças citadas em chips; clicado, o fundo do hover fica
    chips = ''.join(f'<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;font-size:11px;font-weight:500;'
                    f'color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};">{T(r)}</span>' for r in refs)
    chips = f'<span style="display:flex;flex-wrap:wrap;gap:4px;">{chips}</span>' if refs else ''
    fundo = f'background:{k["muted"]};' if marcado else ''
    pad = (f'<span style="display:flex;flex-direction:column;gap:2px;padding:6px 8px;border-radius:7px;background:{k["prisub"]};color:{k["prisubfg"]};font-size:12px;line-height:17px;">'
           f'<span style="display:inline-flex;align-items:center;gap:4px;font-weight:500;">{T(padrao + "Titulo")}{ic("seta", 11)}</span>'
           f'<span style="opacity:0.85;">{T(padrao + "Txt")}</span></span>') if padrao else ''
    return (f'<li style="display:flex;flex-direction:column;gap:4px;">'
            f'<span style="display:flex;flex-direction:column;gap:4px;margin:0 -6px;padding:4px 6px;border-radius:7px;{fundo}">'
            f'<span style="font-size:13px;line-height:19px;color:{k["fg"]};white-space:pre-line;">{T(chave)}</span>{chips}</span>{pad}</li>')


def _pilar(k, nome, status, tom, achados='', sugestoes='', tracejado=False):
    sub = lambda titulo, itens: (f'<div style="display:flex;flex-direction:column;gap:4px;">'
                                 f'<span style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:{k["mfg"]};">{T(titulo)}</span>'
                                 f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;">{itens}</ul></div>') if itens else ''
    return (f'<li style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--divider);">'
            f'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'
            f'<h3 style="margin:0;font-size:13.5px;font-weight:600;color:{k["fgs"]};">{T(nome)}</h3>{badge(T(status), k, tom, tracejado=tracejado)}</div>'
            f'{sub("drAchados", achados)}{sub("drSugestoes", sugestoes)}</li>')


def _painel_revisao(k):
    secao = lambda conteudo, ultima=False: (f'<div style="display:flex;flex-direction:column;gap:12px;padding:16px 20px;'
                                            f'{"" if ultima else "box-shadow:inset 0 -1px 0 var(--divider);"}">{conteudo}</div>')
    cab = (f'<div style="position:relative;display:flex;flex-direction:column;gap:6px;padding:16px 52px 16px 20px;box-shadow:inset 0 -1px 0 var(--divider);">'
           f'<h2 style="margin:0;font-size:16px;line-height:1.25;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("drTitulo")}</h2>'
           f'<p style="margin:0;font-size:13px;line-height:18px;color:{k["mfg"]};">{T("drDescricao")}</p>'
           f'<a href="DesenhoLivre__SUF__.dc.html" aria-label="{T("drFechar")}" style="position:absolute;top:14px;right:14px;display:flex;align-items:center;justify-content:center;'
           f'width:28px;height:28px;border-radius:7px;color:{k["mfg"]};">{ic("x", 16)}</a></div>')
    objetivo = (f'<label style="display:flex;flex-direction:column;gap:6px;">'
                f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{T("drObjetivo")} <span style="font-weight:400;color:{k["mfg"]};">{T("drOpcional")}</span></span>'
                f'<span style="display:block;min-height:56px;box-sizing:border-box;padding:8px 10px;border-radius:8px;background:{k["field"] if "field" in k else k["card"]};'
                f'box-shadow:inset 0 0 0 1px {k["input"]};font-size:13px;line-height:19px;color:{k["fgs"]};">Farmácia que não pode cair no pico das 19 h</span>'
                f'<span style="align-self:flex-end;font-size:11px;color:{k["mfg"]};">43/500</span></label>'
                f'<div style="display:flex;align-items:center;gap:12px;">{botao(T("drRevisar"), k, "primary", 32, "brilho")}'
                f'<span style="font-size:12px;color:{k["mfg"]};">{T("drCusto")}</span></div>')
    confiabilidade = _pilar(k, 'drConfiabilidade', 'drRisco', 'red',
                            achados=_item_revisao(k, 'drAchado1', ('nEstoque',), marcado=True),
                            sugestoes=_item_revisao(k, 'drSugestao1', ('nEstoque',), padrao='drMultiAz'))
    seguranca = _pilar(k, 'drSeguranca', 'drAtencao', 'yellow',
                       achados=_item_revisao(k, 'drAchado2', ('nEntrada',)),
                       sugestoes=_item_revisao(k, 'drSugestao2'))
    ok = ''.join(_pilar(k, n, 'drOk', 'green') for n in ('drPilarCusto', 'drDesempenho', 'drOperacao'))
    revisao = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
               f'<span style="font-size:12px;color:{k["mfg"]};">{T("drQuando")} · Farmácia que não pode cair no pico das 19 h</span>'
               f'<p style="margin:0;font-size:14px;line-height:21px;color:{k["fgs"]};white-space:pre-line;">{T("drResumo")}</p></div>'
               f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;">{confiabilidade}{seguranca}{ok}</ul>')
    historico = (f'<h3 style="margin:0;display:flex;align-items:center;gap:6px;font-family:{MONO};font-size:10.5px;font-weight:500;letter-spacing:0.12em;'
                 f'text-transform:uppercase;color:{k["mfg"]};">{ic("relogio", 14)}{T("drHistorico")}</h3>'
                 f'<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;">'
                 f'<span style="font-size:12px;color:{k["mfg"]};">{T("drQuandoAntes")}</span>'
                 f'<span style="flex:1;min-width:0;font-size:13px;color:{k["fg"]};">{T("drSemObjetivo")}</span>'
                 f'{badge(T("drDesatualizada"), k, tracejado=True)}</div>')
    return (f'<aside role="dialog" aria-modal="true" aria-label="{T("drTitulo")}" style="position:absolute;top:8px;right:8px;bottom:8px;width:500px;'
            f'display:flex;flex-direction:column;overflow:hidden;border-radius:16px;background:{k["card"]};'
            f'box-shadow:0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px {k["border"]};">{cab}'
            f'<div class="muriki-scroll" style="flex:1;min-height:0;overflow-y:auto;">{secao(objetivo)}{secao(revisao)}{secao(historico, ultima=True)}</div></aside>')


def tela_desenho_revisao(k):
    # o editor com a Revisão aberta: o painel da direita sobre o véu leve, e o Estoque destacado no
    # quadro (o achado da confiabilidade foi clicado)
    tela = tela_desenho_livre(k, revisao=True)
    assert tela.endswith('</div>')
    veu = f'<div style="position:absolute;inset:0;z-index:20;background:color-mix(in oklch, {k["bg"]} 30%, transparent);">{_painel_revisao(k)}</div>'
    return tela[:-len('</div>')] + veu + '</div>'
