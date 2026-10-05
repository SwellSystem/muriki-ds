# ── Playground com tipos e o desenho livre ──────────────────────────────
# O Playground deixa de ser "em breve" e vira o lugar de criar livre: os tipos no topo (Desenho de
# arquitetura, e Código livre em breve) e "Seus desenhos" embaixo, com o limite do Starter. O
# desenho livre é a bancada sem regras e sem Verificar, com notas. Espelha os blocos playground e
# architecture-board do registry. Contrato: swell-docs/muriki-api/features/arch-cloud/fd-desenho.md.
from base import *
from arquitetura import IP, _grupo, _peca, _peca_servico, _chip, _ip, _titulo_secao, _provedor
from desbloqueio import logo_arq

# a nota usa o lápis da base, no traço dos ícones da bancada
IP.setdefault('nota', I['lapis'])


def _cartao_tipo_desenho(k, limite=False):
    oferta = (f'<div style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:10px;background:{k["prisub"]};'
              f'color:{k["prisubfg"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["pri"]} 22%, transparent);">'
              f'<span style="font-size:13px;line-height:19px;">{T("pgLimite")}</span>'
              f'<a href="#" style="font-size:13px;font-weight:500;">{T("pgConhecerPro")}</a></div>') if limite else ''
    return (f'<div style="display:flex;flex-direction:column;gap:12px;padding:20px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:#fff;'
            f'box-shadow:0 1px 2px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.06);flex:0 0 auto;">{logo_arq(22)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
            f'<h2 style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("pgDesenho")}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pgDesenhoTxt")}</p></div></div>'
            f'{oferta}<div style="display:flex;justify-content:flex-end;margin-top:auto;padding-top:4px;">'
            f'{botao(T("pgNovo"), k, "primary", 32, "mais" if "mais" in I else None, desativado=limite)}</div></div>')


def _cartao_tipo_codigo(k):
    return (f'<div aria-disabled="true" style="display:flex;flex-direction:column;gap:12px;padding:20px;border-radius:12px;'
            f'background:color-mix(in oklab, {k["card"]} 60%, transparent);box-shadow:{k["sombra"]};">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:{k["sunken"]};'
            f'color:{k["mfg"]};flex:0 0 auto;">{ic("terminal", 20)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
            f'<h2 style="margin:0;display:flex;align-items:center;gap:8px;font-size:17px;line-height:23px;font-weight:600;color:{k["fg"]};">'
            f'{T("pgCodigo")}{badge(T("pgEmBreve"), k, "gray")}</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">{T("pgCodigoTxt")}</p></div></div></div>')


def _lista(k, desenhos):
    borda = f'border-top:1px solid {k["muted"]};'
    linhas = ''.join(
        f'<li style="display:flex;align-items:center;gap:12px;min-height:56px;padding:0 8px 0 16px;{"" if i == 0 else borda}">'
        f'<a href="DesenhoLivre__SUF__.dc.html" style="display:flex;align-items:center;gap:16px;flex:1;min-width:0;color:inherit;">'
        f'<span style="font-size:14px;font-weight:500;color:{k["fgs"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{titulo}</span>'
        f'<span style="margin-left:auto;font-size:12.5px;color:{k["mfg"]};white-space:nowrap;">{T(salvo)}</span></a>'
        f'<span role="img" aria-label="{T("pgApagar")}" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{ic("lixeira", 14)}</span></li>'
        for i, (titulo, salvo) in enumerate(desenhos))
    return (f'<ul style="margin:0;padding:0;list-style:none;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};overflow:hidden;">{linhas}</ul>')


DESENHOS = [('Farmácia fora do ar', 'pgSalvo2h'), ('Encurtador de links na AWS', 'pgSalvoOntem'), ('Fila de pedidos com DLQ', 'pgSalvo4d')]


def tela_playground(k, limite=False):
    desenhos = DESENHOS if limite else DESENHOS[:2]
    cab = (f'<header style="display:flex;flex-direction:column;gap:8px;">'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("pgTitulo")}</h1>'
           f'<p style="margin:0;max-width:640px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("pgSub")}</p></header>')
    tipos = (f'<section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">'
             f'{_cartao_tipo_desenho(k, limite)}{_cartao_tipo_codigo(k)}</section>')
    lista = (f'<section style="display:flex;flex-direction:column;gap:8px;">'
             f'<div style="display:flex;align-items:baseline;gap:12px;">'
             f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("pgSeus")}</h2>'
             f'<span style="font-family:{MONO};font-size:11.5px;color:{k["fgs"] if limite else k["mfg"]};">{T("pgConta3") if limite else T("pgConta2")}</span></div>'
             f'{_lista(k, desenhos)}</section>')
    return app(k, 'playground', cab + tipos + lista, gap=24)


def _nota(k, x, y, chave):
    # o bilhete amarelo do desenho livre: texto solto, sem alça
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:200px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;'
            f'padding:10px 12px;border-radius:10px;background:{k["tyellow"]};color:{k["tyellowfg"]};'
            f'box-shadow:0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px color-mix(in oklab, {k["tyellowfg"]} 18%, transparent);">'
            f'<span style="display:flex;opacity:0.7;">{_ip("nota", 14)}</span>'
            f'<p style="margin:0;font-size:12.5px;line-height:18px;white-space:pre-wrap;">{T(chave)}</p></div>')


def _diagrama_livre(k):
    # palco de 760 × 440, na AWS: o App fora; o balanceador na sub-rede pública; Pedidos e o Estoque na privada; duas notas
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (
        f'<svg viewBox="0 0 760 440" width="760" height="440" style="position:absolute;inset:0;overflow:visible;z-index:1;pointer-events:none;" aria-hidden="true">'
        f'<defs><marker id="seta-livre" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
        f'<path d="M168 246H186Q194 246 194 238V200Q194 192 202 192H222" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-livre)"/>'
        f'<path d="M390 192H434" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-livre)"/>'
        f'<path d="M518 218V280" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-livre)"/>'
        f'</svg>')
    grupos = (_grupo(k, 190, 60, 520, 360, 'regiao', 'us-east-1')
              + _grupo(k, 206, 96, 196, 150, 'publica')
              + _grupo(k, 420, 96, 274, 300, 'privada'))
    pecas = (_peca(k, 0, 220, 'cliente', T('pCliente'), T('nApp'))
             + _peca_servico(k, 222, 166, 'aws.elb', 'Elastic Load Balancing', T('nEntrada'))
             + _peca_servico(k, 434, 166, 'aws.lambda', 'AWS Lambda', T('nPedidos'))
             + _peca_servico(k, 434, 282, 'aws.rds', 'Amazon RDS', T('nEstoque')))
    notas = _nota(k, 0, 0, 'nota1') + _nota(k, 214, 280, 'nota2')
    chips = (_chip(k, 194, 220, T('chama')) + _chip(k, 412, 192, T('chama')) + _chip(k, 518, 250, T('escreve')))
    return f'<div style="position:relative;width:760px;height:440px;zoom:0.86;">{grupos}{linhas}{pecas}{notas}{chips}</div>'


def tela_desenho_livre(k):
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">{voltar(k, T("dlVoltar"), "PlaygroundDesenhos__SUF__.dc.html")}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">Farmácia fora do ar</h1></div>'
           f'<span style="display:inline-flex;align-items:center;gap:6px;padding-bottom:6px;font-size:12px;color:{k["mfg"]};">'
           f'<span style="width:12px;height:12px;border-radius:999px;background:{k["ok"]};display:inline-flex;"></span>{T("dlSalvo")}</span></header>')
    item = lambda icone, nome: (f'<li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:6px;font-size:12.5px;color:{k["fg"]};">'
                                f'{_ip(icone, 15, k["mfg"])}{nome}</li>')
    secao = lambda titulo, conteudo, direita='': (
        f'<div style="border-top:1px solid {k["muted"]};"><div style="display:flex;align-items:center;height:38px;padding:0 12px 0 14px;">'
        f'{_titulo_secao(titulo, k, forte=False)}<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{direita}</span></div>{conteudo}</div>')
    pecas = secao(T('pecasTit'), f'<ul style="margin:0;padding:0 6px 8px;list-style:none;">'
                  + ''.join(item(i, T(n)) for i, n in [('cliente', 'pCliente'), ('balanceador', 'pBalanceador'), ('api', 'pApi'), ('banco', 'pBanco'), ('cache', 'pCache'), ('fila', 'pFila')]) + '</ul>')
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
    palco = (f'<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background-color:{k["card"]};'
             f'background-image:radial-gradient(circle, {k["input"]} 1px, transparent 1.2px);background-size:18px 18px;">{_diagrama_livre(k)}</div>')
    status = (f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
              f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;"><span>{T("status")}</span></div>')
    bancada = (f'<section style="flex:1;min-height:0;display:flex;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
               f'{lateral}<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{barra}{palco}{status}</div></section>')
    return app(k, 'playground', cab + bancada, compacto=True, pad='24px 28px', gap=18)
