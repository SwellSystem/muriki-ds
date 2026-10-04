# O Peer dentro do exercício (2026-10-03). Não é chat: o Peer acompanha (POST .../events com
# paused, tests_ran, unit_closed) e fala pouco; quando fala, é uma frase no lugar onde a coisa
# aconteceu, e o próximo degrau é um botão (pergunta, depois dica, depois explicação; o gabarito
# nunca). Três lugares, uma voz só:
#   1. na hora: no painel de testes, embaixo do teste que falhou (tests_ran), ou numa faixa acima da
#      barra de status do editor (paused, unit_closed);
#   2. guardado: o cartão "Peer neste exercício" na coluna da esquerda, embaixo das dicas;
#   3. no envio: o retorno da avaliação com a voz e o ícone do Peer.
# A barra de status diz que o Peer está acompanhando, mesmo quando ele fica quieto (o normal).
from base import *
from telas import tela_exercicio


def _avatar(k, tam=20):
    return (f'<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;width:{tam}px;height:{tam}px;'
            f'flex:0 0 auto;border-radius:999px;background:{k["card"]};color:{k["pri"]};'
            f'box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["pri"]} 30%, transparent);">{ic("peer", int(tam * 0.6))}</span>')


def _acao(k, txt, forte=True):
    return (f'<button type="button" style="height:24px;padding:0 6px;margin-left:-6px;border:0;border-radius:6px;background:transparent;'
            f'font-family:{FONTE};font-size:12.5px;font-weight:500;color:{k["pri"] if forte else k["mfg"]};">{txt}</button>')


def _cabeca(k, tipo):
    return (f'<span style="display:flex;align-items:center;gap:6px;">'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:{k["pri"]};">'
            f'{T("peerNome")} · {T(tipo)}</span></span>')


def nota_testes(k):
    # embaixo do teste que falhou: o fato é o teste, a fala é uma pergunta sobre ele
    return (f'<div role="note" style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-radius:8px;'
            f'background:{k["prisub"]};">{_avatar(k, 18)}'
            f'<div style="display:flex;flex-direction:column;gap:3px;min-width:0;">{_cabeca(k, "tipoPergunta")}'
            f'<span style="font-size:12.5px;line-height:18px;color:{k["fgs"]};white-space:normal;">{T("peerTestes")}</span>'
            f'<span style="display:flex;gap:12px;padding-top:2px;">{_acao(k, T("meDaDica"))}{_acao(k, T("entendi"), False)}</span></div></div>')


def faixa(k, tipo='tipoDica', texto='peerDica', proximo='explica'):
    # acima da barra de status: a fala de uma pausa. Aqui, já no segundo degrau (a dica), com o
    # terceiro (explicar) como botão
    return (f'<div role="note" style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-top:1px solid {k["muted"]};'
            f'background:{k["prisub"]};">{_avatar(k, 22)}'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">{_cabeca(k, tipo)}'
            f'<span style="font-size:13.5px;line-height:20px;color:{k["fgs"]};">{T(texto)}</span></div>'
            f'<span style="display:flex;gap:14px;align-items:center;align-self:center;">{_acao(k, T(proximo))}{_acao(k, T("entendi"), False)}</span></div>')


def status(k):
    # no cabeçalho, ao lado do "salvo há": o outro estado da tela que a pessoa não precisa olhar
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;margin-right:10px;font-size:12px;color:{k["pri"]};">'
            f'<span style="width:6px;height:6px;border-radius:999px;background:{k["pri"]};"></span>{T("peerAcompanhando")}</span>')


def historico(k, itens):
    # itens: [(hora, gatilho, tipo, texto)], do mais recente para o mais antigo
    linhas = ''.join(
        f'<li style="display:flex;flex-direction:column;gap:4px;padding:10px 0;border-top:1px solid {k["muted"]};">'
        f'<span style="display:flex;align-items:center;gap:8px;font-size:11.5px;color:{k["mfg"]};">'
        f'<span style="font-family:{MONO};">{T(hora)}</span><span>{T(gatilho)}</span>'
        f'<span style="margin-left:auto;">{badge(T(tipo), k, "blue")}</span></span>'
        f'<span style="font-size:13px;line-height:19px;color:{k["fg"]};">{T(texto)}</span></li>'
        for hora, gatilho, tipo, texto in itens)
    return (f'<section aria-label="{T("historicoTit")}" style="display:flex;flex-direction:column;padding:12px 16px 4px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:{k["sombra"]};">'
            f'<div style="display:flex;align-items:center;gap:8px;padding-bottom:8px;">{_avatar(k, 20)}'
            f'{rotulo(T("historicoTit"), k["mfg"])}<span style="margin-left:auto;display:flex;color:{k["mfg"]};">{ic("baixo", 12)}</span></div>'
            f'<ol style="margin:0;padding:0;list-style:none;">{linhas}</ol></section>')


H_TESTES = ('h1hora', 'h1Gatilho', 'tipoPergunta', 'peerTestes')
H_PAUSA = ('h2hora', 'h2Gatilho', 'tipoPergunta', 'peerPausa')
H_DICA = ('h1hora', 'h2Gatilho', 'tipoDica', 'peerDica')


def tela_peer_testes(k):
    return tela_exercicio(k, peer=dict(recolher=True, testes=nota_testes(k), historico=historico(k, [H_TESTES, H_PAUSA]), status=status(k)))


def tela_peer_faixa(k):
    return tela_exercicio(k, peer=dict(recolher=True, faixa=faixa(k), historico=historico(k, [H_DICA, H_PAUSA]), status=status(k)))


def _modal_retorno(k):
    oculto = lambda nome: (f'<li style="display:flex;align-items:center;gap:8px;font-size:13px;color:{k["fg"]};">'
                           f'{ic("check", 12, k["ok"])}{T(nome)}</li>')
    return (f'<div role="dialog" aria-modal="true" aria-labelledby="ret-tit" style="width:520px;max-width:100%;box-sizing:border-box;'
            f'display:flex;flex-direction:column;gap:18px;padding:22px 24px 20px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombraFlut"]};">'
            f'<div style="display:flex;gap:12px;align-items:flex-start;">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;flex:0 0 auto;'
            f'background:{k["tgreen"]};color:{k["tgreenfg"]};">{ic("check", 16)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:3px;">'
            f'<h2 id="ret-tit" style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("resultadoTit")}</h2>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{T("resultadoSub")}</span>'
            f'<span style="padding-top:4px;">{badge(T("skillConf"), k, "blue", ponto=True)}</span></div></div>'
            f'<div style="display:flex;flex-direction:column;gap:8px;">{rotulo(T("ocultos"), k["mfg"], 9.5)}'
            f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;">{oculto("o1")}{oculto("o2")}</ul></div>'
            # o retorno é a fala do Peer: o mesmo ícone e o mesmo tom da coluna, para a IA ser uma presença só
            f'<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;background:{k["prisub"]};">{_avatar(k, 24)}'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0;">'
            f'<span style="font-size:13px;font-weight:600;color:{k["prisubfg"]};">{T("retornoPeer")}</span>'
            f'<p style="margin:0;font-size:13.5px;line-height:21px;color:{k["fg"]};">{T("retornoTxt")}</p></div></div>'
            f'<div style="display:flex;flex-direction:column;gap:6px;">{rotulo(T("explicacaoRot"), k["mfg"], 9.5)}'
            f'<span style="display:flex;align-items:center;gap:8px;font-size:13px;color:{k["fg"]};">'
            f'<span style="display:flex;gap:3px;"><span style="width:18px;height:6px;border-radius:2px;background:{k["pri"]};"></span>'
            f'<span style="width:18px;height:6px;border-radius:2px;background:{k["sunken"]};"></span></span>{T("explicacaoNota")}</span></div>'
            f'<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:4px;">'
            f'{botao(T("verSolucao"), k, "ghost", 36)}{botao(T("continuarTrilha"), k, "solid", 36, "seta")}</div></div>')


def tela_peer_retorno(k):
    fundo = tela_exercicio(k, peer=dict(recolher=True, historico=historico(k, [H_DICA, H_PAUSA]), status=status(k)))
    assert fundo.endswith('</div>')
    veu = (f'<div style="position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:{k["veu"]};">'
           f'{_modal_retorno(k)}</div>')
    return fundo[:-len('</div>')] + veu + '</div>'
