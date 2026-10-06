# O enunciado lido inteiro (2026-10-06), depois do relato "odeio ler enunciado pela metade":
#   1. ordem fixa: o objetivo numa frase em cima, os exemplos, as regras e o porquê no fim. A lição
#      e o guia de sintaxe saem do topo do texto e viram ícones no cabeçalho do cartão;
#   2. as regras ligadas aos testes: cada uma com o estado do teste que a cobre (passou, falhou ou
#      oculto, que só roda no envio), e o Peer aponta a regra no texto ("Ver no enunciado"). Depende
#      do conteúdo dizer qual teste cobre qual regra;
#   3. ler em tela cheia: o mesmo enunciado num painel largo por cima da tela, na medida de leitura;
#   4. recolhido, o cartão guarda a frase do objetivo e a conta das regras.
from base import *
from telas import tela_exercicio, TESTES
from peer_exercicio import abas, faixa, status, _avatar, _acao, _cabeca, H_PAUSA, H_TESTES

_svg = lambda d: (f'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" '
                  f'stroke-linejoin="round" width="100%" height="100%" aria-hidden="true">{d}</svg>')
ICONES = dict(
    livro=_svg('<path d="M2.5 3.5c2-.8 3.8-.6 5.5.8v9c-1.7-1.4-3.5-1.6-5.5-.8z"/><path d="M13.5 3.5c-2-.8-3.8-.6-5.5.8v9c1.7-1.4 3.5-1.6 5.5-.8z"/>'),
    info=_svg('<circle cx="8" cy="8" r="6"/><path d="M8 7.2v3.6"/><circle cx="8" cy="5.2" r=".4" fill="currentColor"/>'),
    ampliar=_svg('<path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9"/>'),
    copiar=_svg('<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-2a1 1 0 00-1-1h-6a1 1 0 00-1 1v6a1 1 0 001 1h2"/>'),
)


def _ic(nome, tam=14, cor=None):
    c = f'color:{cor};' if cor else ''
    return f'<span style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;{c}">{ICONES[nome]}</span>'


def _icone(k, nome, rotulo):
    # botão só de ícone no cabeçalho do cartão, com o nome no aria-label e no title
    return (f'<button type="button" aria-label="{T(rotulo)}" title="{T(rotulo)}" style="display:flex;align-items:center;justify-content:center;'
            f'width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">{_ic(nome, 15)}</button>')


def acoes(k, fechar=False):
    base_ = _icone(k, 'livro', 'abrirLicao') + _icone(k, 'info', 'guiaSintaxe')
    if fechar:
        return (base_ + f'<span style="width:1px;height:16px;margin:0 6px;background:{k["input"]};"></span>'
                f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};margin-right:4px;">{T("escFecha")}</span>'
                f'<button type="button" aria-label="{T("fechar")}" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;'
                f'border:0;border-radius:6px;background:transparent;color:{k["fgs"]};">{ic("x", 14)}</button>')
    return base_ + _icone(k, 'ampliar', 'telaCheia')


# cada regra e o que os testes dizem dela: 'ok' passou, 'falha' falhou, 'oculto' só roda no envio
REGRAS = [('req1', 'ok', 'r1Testes'), ('req2', 'falha', 'r2Testes'), ('req3', 'falha', 'r3Testes'), ('req4', 'oculto', 'r4Testes')]


def _marca(k, estado):
    if estado == 'ok':
        return ic('check', 12, k['ok'])
    if estado == 'falha':
        return ic('x', 12, k['bad'])
    return ic('cadeado', 12, k['mfg'])


def corpo(k, grande=False, destaque=None):
    # grande: a leitura em tela cheia, com a letra e o respiro maiores; destaque: a regra que o Peer apontou
    f, lh = (15.5, 26) if grande else (14, 22)
    exemplo = lambda e, r: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:{28 if grande else 24}px;padding:0 8px;border-radius:5px;'
                            f'background:{k["sunken"]};font-family:{MONO};font-size:{12.5 if grande else 11.5}px;color:{k["fg"]};">'
                            f'<span style="color:{k["ok"]};">"{e}"</span><span style="color:{k["mfg"]};">→</span>{r}</span>')
    titulo = lambda t, fim='': (f'<div style="display:flex;align-items:center;gap:8px;">'
                                f'<h2 style="margin:0;font-size:{14 if grande else 13}px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T(t)}</h2>{fim}</div>')
    regras = ''
    for i, (chave, estado, rot) in enumerate(REGRAS, 1):
        texto = f'{T(chave)} {mono("DurationVazia", k, None, 12)}.' if chave == 'req3' else T(chave)
        cor_meta = {'ok': k['mfg'], 'falha': k['bad'], 'oculto': k['mfg']}[estado]
        fundo = f'background:{k["prisub"]};box-shadow:0 0 0 2px color-mix(in oklch, {k["pri"]} 45%, transparent);' if chave == destaque else ''
        regras += (f'<li style="display:flex;gap:10px;align-items:flex-start;padding:6px 8px;margin:0 -8px;border-radius:8px;{fundo}">'
                   f'<span style="margin-top:{5 if grande else 4}px;">{_marca(k, estado)}</span>'
                   f'<span style="display:flex;flex-direction:column;gap:1px;min-width:0;">'
                   f'<span style="font-size:{f - 1}px;line-height:{lh - 2}px;color:{k["fgs"] if estado == "falha" else k["fg"]};">'
                   f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};margin-right:6px;">{i}</span>{texto}</span>'
                   f'<span style="font-size:11.5px;line-height:16px;color:{cor_meta};padding-left:{14}px;">{T(rot)}</span></span></li>')
    copiar = (f'<button type="button" aria-label="{T("copiar")}" title="{T("copiar")}" style="margin-left:auto;display:flex;align-items:center;'
              f'justify-content:center;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">{_ic("copiar", 13)}</button>')
    return (f'<p style="margin:0;font-size:{f + 1.5}px;line-height:{lh + 2}px;font-weight:500;color:{k["fgs"]};text-wrap:pretty;">{T("objetivo")}</p>'
            f'<div style="display:flex;flex-direction:column;gap:8px;">{titulo("exemplosTit", copiar)}'
            f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{exemplo("1h30", "90")}{exemplo("45min", "45")}'
            f'{exemplo("90s", "2")}{exemplo("", "DurationVazia")}</div></div>'
            f'<div style="display:flex;flex-direction:column;gap:4px;">'
            f'{titulo("precisa", "<span style=" + chr(34) + "margin-left:auto;" + chr(34) + ">" + badge(T("regrasConta"), k, "gray", mono=True) + "</span>")}'
            f'<ul aria-label="{T("regrasContaRot")}" style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px;">{regras}</ul></div>'
            f'<div style="display:flex;flex-direction:column;gap:6px;">{titulo("porqueTit")}'
            f'<p style="margin:0;font-size:{f - 0.5}px;line-height:{lh}px;color:{k["fg"]};">{T("porqueTexto")}</p></div>')


def _faixa_regra(k):
    # o Peer fala da regra e leva até ela: "Ver no enunciado" acende a regra 2 na coluna
    return (f'<div role="note" style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-top:1px solid {k["muted"]};'
            f'background:{k["prisub"]};">{_avatar(k, 22)}'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">{_cabeca(k, "tipoPergunta")}'
            f'<span style="font-size:13.5px;line-height:20px;color:{k["fgs"]};">{T("peerRegra")}</span>'
            f'<span style="display:flex;gap:12px;padding-top:2px;">{_acao(k, T("verNoEnunciado"))}{_acao(k, T("meDaDica"))}{_acao(k, T("entendi"), False)}</span></div></div>')


def explicacao_recolhida(k):
    # a explicação recolhida com rascunho: o ponto verde lembra que ela vai junto no envio
    return (f'<section style="display:flex;align-items:center;gap:4px;height:42px;padding:0 14px 0 10px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:{k["sombra"]};flex:0 0 auto;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;color:{k["mfg"]};transform:rotate(-90deg);">{ic("baixo", 12)}</span>'
            f'<span style="font-family:{MONO};font-size:10.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:{k["fgs"]};padding:0 6px;">{T("explique")}</span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11.5px;color:{k["mfg"]};">'
            f'<span style="width:6px;height:6px;border-radius:999px;background:{k["ok"]};"></span>{T("rascunho")}</span></section>')


def tela_enunciado(k):
    # a pessoa recolheu a explicação para trabalhar nos testes: o enunciado cabe inteiro na coluna
    return tela_exercicio(k, peer=dict(abas=abas(k, [H_TESTES, H_PAUSA], acoes=acoes(k), corpo=corpo(k, destaque='req2')),
                                       explicacao=explicacao_recolhida(k), faixa=_faixa_regra(k), status=status(k)))


def tela_enunciado_foco(k):
    fundo = tela_exercicio(k, peer=dict(abas=abas(k, [H_TESTES, H_PAUSA], acoes=acoes(k), corpo=corpo(k)), status=status(k)))
    assert fundo.endswith('</div>')
    # o painel cobre a coluna e boa parte do editor, mas deixa o código à vista na direita: a pessoa
    # lê e olha o que escreveu sem fechar
    painel = (f'<div style="position:absolute;inset:0;z-index:5;background:{k["veu"]};"></div>'
              f'<section role="dialog" aria-modal="true" aria-label="{T("enunciado")}" style="position:absolute;z-index:6;top:24px;bottom:24px;left:92px;'
              f'width:760px;display:flex;flex-direction:column;border-radius:14px;background:{k["card"]};box-shadow:{k["sombraFlut"]};overflow:hidden;">'
              f'<div style="display:flex;align-items:center;gap:8px;height:52px;padding:0 12px 0 28px;border-bottom:1px solid {k["muted"]};flex:0 0 auto;">'
              f'<span style="font-family:{MONO};font-size:10.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:{k["fgs"]};">{T("enunciado")}</span>'
              f'<span style="font-size:13px;color:{k["mfg"]};margin-left:6px;">{T("titulo")}</span>'
              f'<span style="margin-left:auto;display:flex;align-items:center;gap:2px;">{acoes(k, fechar=True)}</span></div>'
              f'<div style="flex:1;min-height:0;overflow:hidden;padding:28px 0 32px;">'
              f'<div style="max-width:620px;margin:0 auto;display:flex;flex-direction:column;gap:22px;">{corpo(k, grande=True)}</div></div></section>')
    return fundo[:-len('</div>')] + painel + '</div>'


def _recolhido(k):
    # recolhido, o cartão não vira só "Enunciado": guarda o objetivo e a conta das regras
    return (f'<section style="display:flex;flex-direction:column;gap:2px;padding:10px 12px 12px 10px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:{k["sombra"]};flex:0 0 auto;">'
            f'<div style="display:flex;align-items:center;gap:4px;height:26px;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;color:{k["mfg"]};transform:rotate(-90deg);">{ic("baixo", 12)}</span>'
            f'<span style="font-family:{MONO};font-size:10.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:{k["fgs"]};padding:0 6px;">{T("enunciado")}</span>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:6px;">{badge(T("regrasConta"), k, "gray", mono=True)}{_icone(k, "ampliar", "telaCheia")}</span></div>'
            f'<p style="margin:0;padding-left:32px;font-size:13px;line-height:19px;color:{k["fg"]};display:-webkit-box;-webkit-line-clamp:2;'
            f'-webkit-box-orient:vertical;overflow:hidden;">{T("objetivo")}</p></section>')


def tela_enunciado_recolhido(k):
    return tela_exercicio(k, peer=dict(abas=lambda _corpo: _recolhido(k), faixa=faixa(k), status=status(k)))
