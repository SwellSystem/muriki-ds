# ── Exercício de arquitetura: a bancada ─────────────────────────────────
# O mesmo esqueleto da tela de exercício de código (cabeçalho, coluna da esquerda em cartões
# recolhíveis, moldura à direita), com a bancada no lugar do editor: o rail traz Peças e Regras no
# lugar de Código e Testes, a barra de cima traz a ação da seleção e "Verificar", e o canvas mostra
# o diagrama. Espelha o bloco architecture-board do registry. Plano:
# swell-docs/muriki-code-platform/features/exercicio-arquitetura.
#
# O SVG do diagrama só desenha linhas e setas, com números literais: no canvas, {{t.…}} dentro de
# <text> sai vazio. Peças e rótulos das ligações são HTML por cima, em posições absolutas.
from base import *

# ícones das peças, no traço dos ícones do gerador (viewBox 16, stroke 1.4)
IP = dict(
    cliente=svg('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/><path d="M1.8 5.8h12.4"/><path d="M4 4.3h.1M5.6 4.3h.1"/>'),
    api=svg('<path d="M6 1.8v3M10 1.8v3"/><path d="M4.4 4.8h7.2v2.6A3.6 3.6 0 018 11a3.6 3.6 0 01-3.6-3.6z"/><path d="M8 11v3.2"/>'),
    banco=svg('<ellipse cx="8" cy="3.8" rx="5" ry="2"/><path d="M3 3.8v8.4c0 1.1 2.2 2 5 2s5-.9 5-2V3.8"/><path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"/>'),
    cache=svg('<path d="M9 1.6L3.6 9h4l-1 5.4L12.4 7h-4z"/>'),
    fila=svg('<path d="M2.4 4h11.2M2.4 8h11.2M2.4 12h6"/><path d="M11 10.6l2 1.4-2 1.4"/>'),
    worker=I['engrenagem'],
    cdn=I['globo'],
)


def _ip(nome, tam=16, cor=None):
    c = f'color:{cor};' if cor else ''
    return f'<span style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;{c}">{IP[nome]}</span>'


def _titulo_secao(texto, k, forte=True, aberto=True):
    # a seção recolhível do DS: a seta e o rótulo mono; na coluna da esquerda o rótulo fala mais alto
    seta = ic('baixo', 11, k['mfg']) if aberto else ic('direita', 11, k['mfg'])
    cor = k['fgs'] if forte else k['mfg']
    peso = '600' if forte else '500'
    tam = '10.5px' if forte else '9.5px'
    return (f'<span style="display:flex;align-items:center;gap:7px;">{seta}'
            f'<span style="font-family:{MONO};font-size:{tam};font-weight:{peso};letter-spacing:0.16em;'
            f'text-transform:uppercase;color:{cor};">{texto}</span></span>')


def _cartao_secao(k, titulo, corpo, direita='', extra=''):
    topo = (f'<div style="display:flex;align-items:center;height:38px;padding:0 10px 0 14px;">'
            f'{_titulo_secao(titulo, k)}<span style="margin-left:auto;">{direita}</span></div>')
    return (f'<section style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'display:flex;flex-direction:column;overflow:hidden;{extra}">{topo}{corpo}</section>')


def _peca(k, x, y, icone, tipo, nome):
    # a peça do diagrama: o ícone num quadrado tingido, o tipo em mono e o rótulo da pessoa
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:168px;min-height:52px;box-sizing:border-box;'
            f'display:flex;align-items:center;gap:10px;padding:8px 10px 8px 8px;border-radius:10px;background:{k["card"]};'
            f'box-shadow:0 0 0 1px {k["input"]}, 0 1px 2px rgba(0,0,0,0.06);">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;'
            f'background:{k["prisub"]};color:{k["prisubfg"]};flex:0 0 auto;">{_ip(icone, 16)}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0;">'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:{k["mfg"]};">{tipo}</span>'
            f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["fgs"]};white-space:nowrap;">{nome}</span></span></div>')


def _chip(k, x, y, texto, marcado=False):
    borda = f'0 0 0 1.5px {k["pri"]}' if marcado else f'0 0 0 1px {k["input"]}'
    cor = k['pri'] if marcado else k['mfg']
    return (f'<span style="position:absolute;left:{x}px;top:{y}px;transform:translate(-50%,-50%);display:inline-flex;'
            f'align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;background:{k["card"]};box-shadow:{borda};'
            f'font-size:11px;color:{cor};white-space:nowrap;">{texto}</span>')


def _diagrama(k):
    # palco de 640 × 400: Navegador → API, a API lê o Redis e escreve no Postgres (selecionada)
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (
        f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
        f'<defs>'
        f'<marker id="seta-arq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker>'
        f'<marker id="seta-arq-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--pri)"/></marker></defs>'
        f'<path d="M188 200H232" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-arq)"/>'
        f'<path d="M400 200H418Q426 200 426 192V94Q426 86 434 86H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-arq)"/>'
        f'<path d="M400 200H418Q426 200 426 208V306Q426 314 434 314H444" fill="none" stroke="var(--pri)" stroke-width="1.75" marker-end="url(#seta-arq-sel)"/>'
        f'</svg>')
    pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'))
             + _peca(k, 232, 174, 'api', T('pApi'), T('nApi'))
             + _peca(k, 444, 60, 'cache', T('pCache'), T('nRedis'))
             + _peca(k, 444, 288, 'banco', T('pBanco'), T('nPostgres')))
    # a peça selecionada (a ligação "escreve") tem as alças à mostra nas duas pontas
    chips = (_chip(k, 210, 200, T('chama'))
             + _chip(k, 426, 140, f'{T("le")} <span style="color:{k["fg"]};">· {T("rotuloCache")}</span>')
             + _chip(k, 426, 262, T('escreve'), marcado=True))
    return (f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>')


def tela_exercicio_arquitetura(k):
    chips = (badge(T('chipSD'), k, 'blue') + badge(T('nivel'), k, 'gray') + badge(T('andamento'), k, 'yellow', ponto=True))
    trilha = topo_detalhe(k, [(T('trilhaArq'), '#'), (T('titulo'), '')])
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{trilha}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div></div>'
           f'<div style="display:flex;align-items:center;gap:8px;">'
           f'<span style="font-size:12px;color:{k["mfg"]};margin-right:6px;">{T("salvo")}</span>'
           f'{botao(T("continuarIde"), k, "ghost", 36, "laptop")}{botao(T("enviar"), k, "solid", 36, "enviar")}</div></header>')

    req = lambda conteudo: (f'<li style="display:flex;gap:10px;align-items:flex-start;">'
                            f'<span style="margin-top:8px;width:5px;height:5px;border-radius:999px;background:{k["mfg"]};flex:0 0 auto;"></span>'
                            f'<span>{conteudo}</span></li>')
    enunciado = _cartao_secao(k, T('enunciado'), (
        f'<div style="display:flex;flex-direction:column;gap:12px;padding:0 16px 16px;font-size:14px;line-height:22px;color:{k["fg"]};">'
        f'<p style="margin:0;">{T("enunciadoTexto")}</p>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:13px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T("precisa")}</h2>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:20px;">'
        f'{req(T("req1"))}{req(T("req2"))}{req(T("req3"))}</ul></div></div>'), extra='flex:1;min-height:0;')
    explicacao = _cartao_secao(k, T('explique'), (
        f'<div style="display:flex;flex-direction:column;gap:10px;padding:0 16px 16px;">'
        f'<label for="explicacao-arq" style="font-size:14px;line-height:21px;font-weight:500;color:{k["fgs"]};">{T("pergunta")}</label>'
        f'<textarea id="explicacao-arq" rows="3" placeholder="{T("placeholder")}" '
        f'style="resize:none;width:100%;box-sizing:border-box;padding:10px 12px;border:0;border-radius:8px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:13.5px;line-height:20px;color:{k["fgs"]};outline:0;"></textarea>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("nota")}</span></div>'), direita=badge(T('vaiAvaliacao'), k, 'blue'))
    dicas = _cartao_secao(k, T('dicas'), (
        f'<div style="display:flex;align-items:center;gap:10px;padding:0 12px 12px 16px;">'
        f'{ic("dica", 16, k["warn"])}<span style="flex:1;font-size:13px;color:{k["fg"]};">{T("dicasDisp")}</span>'
        f'{botao(T("pedirDica"), k, "outline", 32)}</div>'))
    esquerda = (f'<div style="width:372px;flex:0 0 372px;display:flex;flex-direction:column;gap:12px;min-height:0;">'
                f'{enunciado}{explicacao}{dicas}</div>')

    item_peca = lambda icone, nome: (
        f'<li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:6px;font-size:12.5px;color:{k["fg"]};">'
        f'{_ip(icone, 15, k["mfg"])}{nome}</li>')
    pecas = (f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("pecas"), k, forte=False)}</div>'
             f'<ul style="margin:0;padding:0 6px 8px;list-style:none;display:flex;flex-direction:column;gap:1px;">'
             f'{item_peca("cliente", T("pCliente"))}{item_peca("api", T("pApi"))}{item_peca("banco", T("pBanco"))}'
             f'{item_peca("cache", T("pCache"))}{item_peca("fila", T("pFila"))}{item_peca("worker", T("pWorker"))}{item_peca("cdn", T("pCdn"))}</ul>')
    regra = lambda ok, texto: (
        f'<li style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;">'
        f'{ic("check" if ok else "x", 12, k["ok"] if ok else k["bad"])}'
        f'<span style="font-size:12.5px;line-height:17px;color:{k["fg"] if ok else k["fgs"]};">{texto}</span></li>')
    regras = (f'<div style="border-top:1px solid {k["muted"]};">'
              f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("regras"), k, forte=False)}'
              f'<span style="margin-left:auto;">{badge(T("passam"), k, "red", ponto=True)}</span></div>'
              f'<ul style="margin:0;padding:0 6px;list-style:none;display:flex;flex-direction:column;gap:1px;">'
              f'{regra(True, T("r1"))}{regra(True, T("r2"))}{regra(False, T("r3"))}</ul>'
              f'<span style="display:block;padding:6px 16px 10px;font-size:11.5px;color:{k["mfg"]};">{T("dicaVerificar")}</span></div>')
    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">{pecas}{regras}</div>')

    rel = lambda chave, at=False: (
        f'<span style="display:inline-flex;align-items:center;height:28px;padding:0 8px;border-radius:7px;font-size:12px;'
        + (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if at else f'color:{k["mfg"]};')
        + f'">{T(chave)}</span>')
    barra = (f'<div style="display:flex;align-items:center;gap:4px;min-height:41px;padding:6px 8px 6px 12px;border-bottom:1px solid {k["muted"]};box-sizing:border-box;">'
             f'{rel("chama")}{rel("le")}{rel("escreve", True)}{rel("publica")}{rel("consome")}'
             f'<span style="width:1px;height:16px;margin:0 4px;background:{k["input"]};"></span>'
             f'{botao(T("renomear"), k, "ghost", 28, "lapis")}{botao(T("apagar"), k, "ghost", 28, "lixeira")}'
             f'<span style="margin-left:auto;">{botao(T("verificar"), k, "primary", 30, "check")}</span></div>')
    canvas_ = (f'<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;'
               f'background-color:{k["card"]};background-image:radial-gradient(circle, {k["input"]} 1px, transparent 1.2px);'
               f'background-size:18px 18px;">{_diagrama(k)}</div>')
    status = (f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
              f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
              f'<span>{T("status")}</span><span>{T("atalho")}</span></div>')
    bancada = (f'<section aria-label="{T("bancada")}" style="flex:1;min-width:0;display:flex;background:{k["card"]};'
               f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">{lateral}'
               f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{barra}{canvas_}{status}</div></section>')

    return app(k, 'exercicios', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{esquerda}{bancada}</div>',
               compacto=True, pad='24px 28px', gap=18)
