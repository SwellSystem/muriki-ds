# ── Exercício de arquitetura: as tarefas novas (F1) ─────────────────────
# Incidente, escalar e migração (swell-docs/muriki-api/features/arch-tasks-def/). O mesmo esqueleto
# do exercício de arquitetura (arquitetura.py), com as partes novas da resposta, que espelham os
# blocos do registry:
# - incidente: o defeito marcado no rail, o cartão Ordene (ExerciseAnswerOrder) e a explicação
#   obrigatória (ExerciseExplanation required);
# - escalar: o Responda (números) e o cartão Marque (ExerciseAnswerChoices);
# - migração: a faixa das etapas em cima do palco (ArchitectureStages, no stageBar do board), as regras
#   da etapa à vista, e o resultado do envio com as regras por etapa (ExerciseSubmission).
from base import *
from arquitetura import _cartao_secao, _chip, _ip, _peca, _peca_marcada, _provedor, _titulo_secao, IP

IP.update(
    porta=svg('<rect x="3" y="1.8" width="10" height="12.4" rx="1"/><path d="M10 8h.1"/>'),
    servico=svg('<path d="M8 1.8l5.6 3.1v6.2L8 14.2l-5.6-3.1V4.9z"/><path d="M2.4 4.9L8 8l5.6-3.1M8 8v6.2"/>'),
    replica=svg('<rect x="4.6" y="4.6" width="9.6" height="9.6" rx="1.4"/><path d="M11.4 4.6V3.2a1.4 1.4 0 00-1.4-1.4H3.2a1.4 1.4 0 00-1.4 1.4V10a1.4 1.4 0 001.4 1.4h1.4"/>'),
    mais=svg('<path d="M8 2.6v10.8M2.6 8h10.8"/>'),
    alca=svg('<circle cx="6" cy="3.6" r=".9" fill="currentColor"/><circle cx="10" cy="3.6" r=".9" fill="currentColor"/><circle cx="6" cy="8" r=".9" fill="currentColor"/>'
             '<circle cx="10" cy="8" r=".9" fill="currentColor"/><circle cx="6" cy="12.4" r=".9" fill="currentColor"/><circle cx="10" cy="12.4" r=".9" fill="currentColor"/>', 'stroke="none"'),
    cima=svg('<path d="M8 13.4V2.6M3.6 7L8 2.6 12.4 7"/>'),
    baixo=svg('<path d="M8 2.6v10.8M3.6 9L8 13.4 12.4 9"/>'),
)

COLUNA = 'width:372px;flex:0 0 372px;display:flex;flex-direction:column;gap:12px;min-height:0;overflow-y:auto;'


def _cabecalho(k, titulo, chips):
    trilha = topo_detalhe(k, [(T('trilhaArq'), '#'), (T(titulo), '')])
    return (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{trilha}'
            f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T(titulo)}</h1>'
            f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div></div>'
            f'<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:{k["mfg"]};margin-right:6px;">{T("salvo")}</span>'
            f'{botao(T("continuarIde"), k, "ghost", 36, "laptop")}{botao(T("enviar"), k, "solid", 36, "enviar")}</div></header>')


def _enunciado(k, texto):
    return _cartao_secao(k, T('enunciado'), (
        f'<div style="padding:0 16px 16px;font-size:14px;line-height:22px;color:{k["fg"]};"><p style="margin:0;">{T(texto)}</p></div>'),
        extra='flex:1 0 auto;min-height:160px;')


def _explicacao(k, pergunta, obrigatoria=False):
    selo = badge(T('obrigatoria'), k, 'yellow') if obrigatoria else badge(T('vaiAvaliacao'), k, 'blue')
    return _cartao_secao(k, T('explique'), (
        f'<div style="display:flex;flex-direction:column;gap:10px;padding:0 16px 16px;">'
        f'<label style="font-size:14px;line-height:21px;font-weight:500;color:{k["fgs"]};">{T(pergunta)}</label>'
        f'<span style="display:block;height:66px;border-radius:8px;background:{k["sunken"]};box-shadow:inset 0 0 0 1px {k["input"]};'
        f'padding:10px 12px;box-sizing:border-box;font-size:13.5px;color:{k["mfg"]};">{T("placeholder")}</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("notaObrigatoria") if obrigatoria else T("nota")}</span></div>'), direita=selo, extra='flex-shrink:0;')


def _conta(k, texto):
    return f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T(texto)}</span>'


def _ordene(k):
    # o item 2 está sendo arrastado: sobe do fundo afundado para o cartão, com a sombra
    def item(n, chave, arrastando=False):
        fundo = f'background:{k["card"]};box-shadow:{k["sombraFlut"]};' if arrastando else f'background:{k["sunken"]};'
        seta = lambda nome, desligada: (f'<span aria-label="{T("subir" if nome == "cima" else "descer")}" style="display:flex;align-items:center;justify-content:center;'
                                        f'width:28px;height:28px;border-radius:7px;color:{k["fg"]};{"opacity:0.35;" if desligada else ""}">{_ip(nome, 14)}</span>')
        return (f'<li style="display:flex;align-items:center;gap:6px;padding:4px;border-radius:8px;{fundo}font-size:13.5px;line-height:20px;color:{k["fg"]};">'
                f'<span style="display:flex;width:20px;justify-content:center;color:{k["mfg"]};">{_ip("alca", 14)}</span>'
                f'<span style="width:16px;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{n}</span>'
                f'<span style="flex:1;min-width:0;padding:4px 0;">{T(chave)}</span>{seta("cima", n == 1)}{seta("baixo", n == 4)}</li>')
    return _cartao_secao(k, T('ordene'), (
        f'<div style="display:flex;flex-direction:column;gap:10px;padding:0 16px 16px;">'
        f'<span style="font-size:13.5px;line-height:20px;font-weight:500;color:{k["fgs"]};">{T("ordemPergunta")}</span>'
        f'<ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;">'
        f'{item(1, "o1")}{item(2, "o2", arrastando=True)}{item(3, "o3")}{item(4, "o4")}</ol>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("ordemNota")}</span></div>'), direita=_conta(k, 'ordeneConta'), extra='flex-shrink:0;')


def _caixa(k, marcada):
    if marcada:
        return (f'<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-top:2px;flex:0 0 auto;border-radius:4px;'
                f'background:{k["pri"]};color:{k["prifg"] if "prifg" in k else "#fff"};">{ic("check", 11)}</span>')
    return (f'<span style="width:16px;height:16px;margin-top:2px;flex:0 0 auto;border-radius:4px;background:{k["sunken"]};'
            f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.1), inset 0 0 0 1px {k["input"]};"></span>')


def _marque(k):
    opcao = lambda chave, marcada: (f'<label style="display:flex;align-items:flex-start;gap:10px;padding:6px 8px;margin:0 -8px;border-radius:8px;'
                                    f'font-size:13.5px;line-height:20px;color:{k["fg"]};">{_caixa(k, marcada)}<span>{T(chave)}</span></label>')
    return _cartao_secao(k, T('marque'), (
        f'<fieldset style="display:flex;flex-direction:column;gap:2px;margin:0;padding:0 16px 16px;border:0;">'
        f'<legend style="padding:0 0 6px;font-size:13.5px;line-height:20px;font-weight:500;color:{k["fgs"]};">{T("marquePergunta")}</legend>'
        f'{opcao("c1", True)}{opcao("c2", False)}{opcao("c3", True)}{opcao("c4", False)}'
        f'<span style="padding-top:6px;font-size:12px;color:{k["mfg"]};">{T("marqueNota")}</span></fieldset>'), direita=_conta(k, 'marqueConta'), extra='flex-shrink:0;')


def _responda(k):
    campo = lambda valor='': (f'<span style="display:flex;align-items:center;width:200px;height:36px;padding:0 10px;box-sizing:border-box;border-radius:8px;'
                              f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["input"]};font-family:{MONO};font-size:13px;'
                              f'color:{k["fgs"] if valor else k["mfg"]};">{valor or T("numero")}</span>')
    pergunta = lambda chave, valor='': (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                                       f'<span style="font-size:13.5px;line-height:20px;font-weight:500;color:{k["fgs"]};">{T(chave)}</span>{campo(valor)}</div>')
    return _cartao_secao(k, T('responda'), (
        f'<div style="display:flex;flex-direction:column;gap:14px;padding:0 16px 16px;">{pergunta("escQ1", "2")}{pergunta("escQ2")}'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("escRespondaNota")}</span></div>'), direita=_conta(k, 'respondaConta'), extra='flex-shrink:0;')


def _regras(k, regras, conta, tom, nota=None):
    regra = lambda ok, chave: (f'<li style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;">{ic("check" if ok else "x", 12, k["ok"] if ok else k["bad"])}'
                               f'<span style="font-size:12.5px;line-height:17px;color:{k["fg"] if ok else k["fgs"]};">{T(chave)}</span></li>')
    return (f'<div style="border-top:1px solid {k["muted"]};">'
            f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("regras"), k, forte=False)}'
            f'<span style="margin-left:auto;">{badge(T(conta), k, tom, ponto=True)}</span></div>'
            f'<ul style="margin:0;padding:0 6px;list-style:none;display:flex;flex-direction:column;gap:1px;">{"".join(regra(ok, c) for ok, c in regras)}</ul>'
            f'<span style="display:block;padding:6px 16px 10px;font-size:11.5px;line-height:16px;color:{k["mfg"]};">{T(nota or "dicaVerificar")}</span></div>')


def _pecas(k, itens):
    item = lambda icone, nome: (f'<li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:6px;font-size:12.5px;color:{k["fg"]};">'
                                f'{_ip(icone, 15, k["mfg"])}{T(nome)}</li>')
    return (f'<div style="border-top:1px solid {k["muted"]};"><div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("pecas"), k, forte=False)}</div>'
            f'<ul style="margin:0;padding:0 6px 8px;list-style:none;">{"".join(item(i, n) for i, n in itens)}</ul></div>')


def _bancada(k, rail, diagrama, status, faixa='', selecao=''):
    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;min-height:0;overflow-y:auto;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">{_provedor(k, "generico")}{rail}</div>')
    dica = f'<span style="font-size:12px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{T("dicaVerificar")}</span>'
    barra = (f'<div style="display:flex;align-items:center;gap:8px;min-height:41px;padding:6px 8px 6px 12px;border-bottom:1px solid {k["muted"]};box-sizing:border-box;">'
             f'<div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;">{selecao or dica}</div>'
             f'<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{_ip("painel", 14)}</span>'
             f'<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;font-size:13px;font-weight:500;color:{k["fgs"]};">{_ip("pulso", 14)}{T("simular")}</span>'
             f'{botao(T("verificar"), k, "primary", 30, "check")}</div>')
    palco = (f'<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background-color:{k["card"]};'
             f'background-image:radial-gradient(circle, {k["input"]} 1px, transparent 1.2px);background-size:18px 18px;">{diagrama}</div>')
    rodape = (f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
              f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;"><span>{T(status)}</span><span>{T("atalho")}</span></div>')
    return (f'<section aria-label="{T("bancada")}" style="flex:1;min-width:0;display:flex;background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
            f'{lateral}<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{faixa}{barra}{palco}{rodape}</div></section>')


def _tela(k, cabecalho, esquerda, bancada):
    return app(k, 'exercicios', cabecalho + f'<div style="display:flex;gap:16px;flex:1;min-height:0;"><div style="{COLUNA}">{esquerda}</div>{bancada}</div>',
               compacto=True, pad='24px 28px', gap=18)


# ── incidente ──
def _diagrama_incidente(k):
    # o desenho já corrigido: o checkout escreve no banco (o defeito marcado) e o relatório lê a réplica
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
              f'<defs><marker id="seta-inc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
              f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
              f'<path d="M188 200H232" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-inc)"/>'
              f'<path d="M400 200H418Q426 200 426 192V94Q426 86 434 86H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-inc)"/>'
              f'<path d="M400 314H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-inc)"/>'
              f'<path d="M528 118V286" fill="none" stroke="{traco}" stroke-width="1.25" stroke-dasharray="3 3" marker-end="url(#seta-inc)"/>'
              f'</svg>')
    pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'))
             + _peca(k, 232, 174, 'api', T('pApi'), 'Checkout')
             + _peca(k, 232, 288, 'worker', T('pWorker'), T('nRelatorio'))
             + _peca(k, 444, 288, 'replica', T('pReplica'), T('nReplica'))
             + _peca_marcada(k, 444, 60, 'banco', T('pBanco'), T('nPostgres'), selecionada=True))
    chips = (_chip(k, 210, 200, T('chama')) + _chip(k, 426, 140, T('escreve')) + _chip(k, 422, 314, T('le')))
    return f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>'


def tela_incidente(k):
    chips = badge(T('chipIncidente'), k, 'red', ponto=True) + badge(T('chipSD'), k, 'blue') + badge(T('nivelSenior'), k, 'gray')
    defeito = (f'<div style="border-top:1px solid {k["muted"]};"><div style="display:flex;align-items:center;height:38px;padding:0 12px 0 14px;">{_titulo_secao(T("defeitoTit"), k, forte=False)}'
               f'<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["bad"]};">{T("incDefeitoConta")}</span></div>'
               f'<ul style="margin:0;padding:0 6px 8px;list-style:none;"><li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 6px 0 8px;font-size:12.5px;color:{k["fgs"]};">'
               f'<span style="display:flex;color:{k["bad"]};">{_ip("bandeira", 13)}</span><span style="flex:1;">{T("pBanco")} · {T("nPostgres")}</span>{ic("x", 12, k["mfg"])}</li></ul></div>')
    rail = (_pecas(k, [('cliente', 'pCliente'), ('api', 'pApi'), ('banco', 'pBanco'), ('replica', 'pReplica'), ('worker', 'pWorker')])
            + defeito + _regras(k, [(True, 'incR1'), (True, 'incR2')], 'incPassam', 'green'))
    esquerda = _enunciado(k, 'incEnunciado') + _ordene(k) + _explicacao(k, 'incPergunta', obrigatoria=True)
    return _tela(k, _cabecalho(k, 'incTitulo', chips), esquerda, _bancada(k, rail, _diagrama_incidente(k), 'incStatus'))


# ── escalar ──
def _diagrama_escalar(k):
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
              f'<defs><marker id="seta-esc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
              f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
              f'<path d="M188 200H232" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-esc)"/>'
              f'<path d="M400 200H418Q426 200 426 192V68Q426 60 434 60H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-esc)"/>'
              f'<path d="M400 200H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-esc)"/>'
              f'<path d="M400 200H418Q426 200 426 208V332Q426 340 434 340H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-esc)"/>'
              f'<path d="M316 226V312" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-esc)"/>'
              f'<path d="M528 226V312" fill="none" stroke="{traco}" stroke-width="1.25" stroke-dasharray="3 3" marker-end="url(#seta-esc)"/>'
              f'<path d="M470 226V292Q470 300 462 300H390Q382 300 382 308V312" fill="none" stroke="{traco}" stroke-width="1.25" stroke-dasharray="3 3" marker-end="url(#seta-esc)"/>'
              f'</svg>')
    pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'))
             + _peca(k, 232, 174, 'api', T('pApi'), 'Feed')
             + _peca(k, 444, 34, 'cache', T('pCache'), T('nRedis'))
             + _peca(k, 444, 174, 'banco', T('pBanco'), T('nPostgres'))
             + _peca(k, 232, 314, 'replica', T('pReplica'), f'{T("nReplica")} 1')
             + _peca(k, 444, 314, 'replica', T('pReplica'), f'{T("nReplica")} 2'))
    chips = (_chip(k, 210, 200, T('chama')) + _chip(k, 426, 120, T('le')) + _chip(k, 422, 200, T('escreve')) + _chip(k, 426, 260, T('le'))
             + _chip(k, 316, 260, T('le')))
    return f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>'


def tela_escalar(k):
    chips = badge(T('chipEscalar'), k, 'orange', ponto=True) + badge(T('chipSD'), k, 'blue') + badge(T('nivelSenior'), k, 'gray')
    rail = (_pecas(k, [('cliente', 'pCliente'), ('api', 'pApi'), ('banco', 'pBanco'), ('replica', 'pReplica'), ('cache', 'pCache'), ('balanceador', 'pBalanceador')])
            + _regras(k, [(True, 'escR1'), (True, 'escR2')], 'escPassam', 'green'))
    esquerda = _enunciado(k, 'escEnunciado') + _responda(k) + _marque(k) + _explicacao(k, 'escPergunta')
    return _tela(k, _cabecalho(k, 'escTitulo', chips), esquerda, _bancada(k, rail, _diagrama_escalar(k), 'escStatus'))


# ── migração ──
def _faixa_etapas(k):
    # a faixa do ArchitectureStages: o início trancado, as etapas com a marca da última verificação,
    # "+ Etapa", e à direita o passo da etapa à vista e a lixeira
    fio = f'<span style="width:10px;height:1px;background:{k["input"]};flex:0 0 auto;"></span>'
    aba = lambda conteudo, ativa=False: (f'<span role="tab" aria-selected="{"true" if ativa else "false"}" style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;border-radius:7px;font-size:12.5px;white-space:nowrap;'
                                         + (f'background:{k["prisub"]};color:{k["prisubfg"]};font-weight:500;' if ativa else f'color:{k["mfg"]};') + f'">{conteudo}</span>')
    marca = lambda ok: ic('check' if ok else 'x', 12, k['ok'] if ok else k['bad'])
    abas = (aba(f'{ic("cadeado", 11)}{T("etInicio")}') + fio + aba(f'{T("etapa1")}{marca(True)}') + fio + aba(f'{T("etapa2")}{marca(False)}', ativa=True) + fio
            + f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:7px;font-size:12.5px;font-weight:500;color:{k["fgs"]};">{_ip("mais", 13)}{T("etMais")}</span>')
    return (f'<div style="display:flex;flex-wrap:wrap;align-items:center;column-gap:12px;row-gap:2px;min-height:41px;padding:6px 8px 6px 12px;border-bottom:1px solid {k["muted"]};box-sizing:border-box;">'
            f'<div role="tablist" aria-label="{T("etapas")}" style="display:flex;align-items:center;gap:4px;">{abas}</div>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:11.5px;color:{k["mfg"]};white-space:nowrap;">'
            f'<span style="font-family:{MONO};">{T("etPasso")}</span><span>{T("etFaixa")}</span>'
            f'<span aria-label="{T("etRemover")}" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;color:{k["mfg"]};">{ic("lixeira", 14)}</span></span></div>')


def _diagrama_migracao(k):
    # a etapa 2: o gateway na frente, o monólito ainda atende o resto e o serviço de notas novo já
    # recebe /notas
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
              f'<defs><marker id="seta-mig" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
              f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker>'
              f'<marker id="seta-mig-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
              f'<path d="M0 0L10 5L0 10z" fill="var(--pri)"/></marker></defs>'
              f'<path d="M188 200H232" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-mig)"/>'
              f'<path d="M400 200H418Q426 200 426 192V104Q426 96 434 96H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-mig)"/>'
              f'<path d="M400 200H418Q426 200 426 208V296Q426 304 434 304H444" fill="none" stroke="var(--pri)" stroke-width="1.75" marker-end="url(#seta-mig-sel)"/>'
              f'</svg>')
    pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'), trancada=True)
             + _peca(k, 232, 174, 'porta', T('pGateway'), 'Edge')
             + _peca(k, 444, 70, 'servico', T('pServico'), T('nMonolito'), trancada=True)
             + _peca(k, 444, 278, 'servico', T('pServico'), T('nNotas')))
    chips = (_chip(k, 210, 200, T('chama')) + _chip(k, 426, 150, T('chama')) + _chip(k, 426, 252, f'{T("chama")} · {T("rotaNotas")}', marcado=True)
    )
    return f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>'


def tela_migracao(k):
    chips = badge(T('chipMigracao'), k, 'yellow', ponto=True) + badge(T('chipSD'), k, 'blue') + badge(T('nivelSenior'), k, 'gray')
    rail = (_pecas(k, [('cliente', 'pCliente'), ('porta', 'pGateway'), ('servico', 'pServico'), ('banco', 'pBanco'), ('fila', 'pFila')])
            + _regras(k, [(True, 'migR1'), (True, 'migR2'), (False, 'migFinal')], 'migPassam', 'red', nota='migRegrasNota'))
    esquerda = _enunciado(k, 'migEnunciado') + _explicacao(k, 'migPergunta', obrigatoria=True) + _cartao_secao(k, T('dicas'), (
        f'<div style="display:flex;align-items:center;gap:10px;padding:0 12px 12px 16px;">'
        f'{ic("dica", 16, k["warn"])}<span style="flex:1;font-size:13px;color:{k["fg"]};">{T("dicasDisp")}</span>{botao(T("pedirDica"), k, "outline", 32)}</div>'), extra='flex-shrink:0;')
    return _tela(k, _cabecalho(k, 'migTitulo', chips), esquerda,
                 _bancada(k, rail, _diagrama_migracao(k), 'migStatus', faixa=_faixa_etapas(k)))


def _modal_etapas(k):
    # as visíveis por etapa, cada uma com a conta; a oculta vem uma vez, sem etapa (product-rules 10),
    # no grupo "Regras ocultas" depois das etapas
    regra = lambda ok, chave: (f'<li style="display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:18px;">{ic("check" if ok else "x", 13, k["ok"] if ok else k["bad"])}'
                               f'<span style="color:{k["fg"] if ok else k["fgs"]};">{T(chave)}</span></li>')
    etapa = lambda titulo, conta, itens: (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                                         f'<span style="display:flex;align-items:center;gap:8px;">{rotulo(T(titulo), k["mfg"], 9.5)}'
                                         + (f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T(conta)}</span>' if conta
                                            else f'<span style="display:flex;color:{k["mfg"]};">{ic("cadeado", 12)}</span>') + '</span>'
                                         f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;">{itens}</ul></div>')
    return (f'<div role="dialog" aria-modal="true" aria-labelledby="mig-tit" style="width:520px;max-width:100%;box-sizing:border-box;'
            f'display:flex;flex-direction:column;gap:18px;padding:22px 24px 20px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombraFlut"]};">'
            f'<div style="display:flex;gap:12px;align-items:center;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;flex:0 0 auto;'
            f'background:{k["tred"]};color:{k["tredfg"]};">{ic("x", 18)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:2px;">'
            f'<h2 id="mig-tit" style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("resTit")}</h2>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{T("resSub")}</span></div></div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;">'
            + etapa('resEtapa1', 'resConta1', regra(True, 'migR1') + regra(True, 'migR2'))
            + etapa('resEtapa2', 'resConta2', regra(True, 'migR1') + regra(True, 'migR2') + regra(False, 'migFinal'))
            + etapa('regrasOcultas', None, regra(False, 'migOculta'))
            + f'<span style="font-size:12px;color:{k["mfg"]};">{T("ocultasNota")}</span></div>'
            f'<div style="display:flex;flex-direction:column;gap:6px;padding-top:14px;border-top:1px solid {k["muted"]};">{rotulo(T("explicacaoRot"), k["mfg"], 9.5)}'
            f'<span style="display:flex;align-items:center;gap:8px;font-size:13px;color:{k["fg"]};">'
            f'<span style="display:flex;gap:3px;"><span style="width:20px;height:6px;border-radius:2px;background:{k["pri"]};"></span>'
            f'<span style="width:20px;height:6px;border-radius:2px;background:{k["sunken"]};"></span></span>{T("explicacaoNota")}</span></div>'
            f'<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:4px;">{botao(T("voltarDesenho"), k, "solid", 40)}</div></div>')


def tela_migracao_resultado(k):
    fundo = tela_migracao(k)
    assert fundo.endswith('</div>')
    veu = (f'<div style="position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:{k["veu"]};">'
           f'{_modal_etapas(k)}</div>')
    return fundo[:-len('</div>')] + veu + '</div>'
