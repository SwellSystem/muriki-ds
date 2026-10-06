# O Peer dentro do exercício (2026-10-03). Não é chat: o Peer acompanha (POST .../events com
# paused, tests_ran, unit_closed) e fala pouco; quando fala, é uma frase no lugar onde a coisa
# aconteceu, e o próximo degrau é um botão (pergunta, depois dica, depois explicação; o gabarito
# nunca). Três lugares, uma voz só:
#   1. na hora: no painel de testes, embaixo do teste que falhou (tests_ran), ou numa faixa acima da
#      barra de status do editor (paused, unit_closed);
#   2. guardado: a aba Peer no cartão do enunciado (2026-10-06). Antes era um cartão embaixo das
#      dicas que crescia a cada fala e espremia o enunciado ("odeio ler enunciado pela metade");
#      agora o enunciado tem a coluna toda, a aba mostra quantas falas houve e acende um ponto quando
#      chega fala nova com ela fechada. A coluna muda de largura pela alça (320 a 560px);
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
    # terceiro (explicar) como botão. As ações vêm embaixo do texto: ao lado, elas tiravam largura
    # da frase, que quebrava em três linhas estreitas
    return (f'<div role="note" style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-top:1px solid {k["muted"]};'
            f'background:{k["prisub"]};">{_avatar(k, 22)}'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">{_cabeca(k, tipo)}'
            f'<span style="font-size:13.5px;line-height:20px;color:{k["fgs"]};">{T(texto)}</span>'
            f'<span style="display:flex;gap:12px;padding-top:2px;">{_acao(k, T(proximo))}{_acao(k, T("entendi"), False)}</span></div></div>')


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


def _lista(k, itens):
    # itens: [(hora, gatilho, tipo, texto)], do mais recente para o mais antigo; a primeira sem fio
    return ('<ol style="margin:0;padding:0;list-style:none;">' + ''.join(
        f'<li style="display:flex;flex-direction:column;gap:4px;padding:{"4px 0 10px" if i == 0 else "10px 0"};'
        f'{"" if i == 0 else "border-top:1px solid " + k["muted"] + ";"}">'
        f'<span style="display:flex;align-items:center;gap:8px;font-size:11.5px;color:{k["mfg"]};">'
        f'<span style="font-family:{MONO};">{T(hora)}</span><span>{T(gatilho)}</span>'
        f'<span style="margin-left:auto;">{badge(T(tipo), k, "blue")}</span></span>'
        f'<span style="font-size:13px;line-height:19px;color:{k["fg"]};">{T(texto)}</span></li>'
        for i, (hora, gatilho, tipo, texto) in enumerate(itens)) + '</ol>')


def abas(k, itens, ativa='enunciado', nova=False, acoes='', corpo=None):
    # o cartão do enunciado com as abas Enunciado | Peer: ocupa a altura que sobra na coluna e só o
    # corpo rola. A aba Peer leva o número de falas e, com fala nova não vista, o ponto da marca.
    # acoes: à direita das abas; corpo: no lugar do enunciado de sempre (design/muriki-code/enunciado.py)
    def aba(txt, on, extra=''):
        cor = (f'color:{k["fgs"]};text-decoration:underline;text-decoration-color:{k["pri"]};text-decoration-thickness:2px;'
               f'text-underline-offset:7px;' if on else f'color:{k["mfg"]};')
        return (f'<button type="button" role="tab" aria-selected="{"true" if on else "false"}" style="display:inline-flex;align-items:center;gap:6px;'
                f'height:26px;padding:0 6px;border:0;border-radius:6px;background:transparent;font-family:{MONO};font-size:10.5px;'
                f'font-weight:600;letter-spacing:0.16em;text-transform:uppercase;{cor}">{txt}{extra}</button>')
    conta = (f'<span style="font-weight:400;letter-spacing:0;color:{k["mfg"]};">{len(itens)}</span>'
             + (f'<span style="width:6px;height:6px;border-radius:999px;background:{k["pri"]};"></span>' if nova else ''))

    def cartao_(corpo_enunciado):
        corpo_ = (f'<div style="display:flex;flex-direction:column;gap:12px;">{corpo or corpo_enunciado}</div>' if ativa == 'enunciado'
                  else _lista(k, itens))
        return (f'<section style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;border-radius:12px;'
                f'background:{k["card"]};box-shadow:{k["sombra"]};">'
                f'<div style="display:flex;align-items:center;gap:4px;height:38px;padding:0 6px 0 10px;flex:0 0 auto;">'
                f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;color:{k["mfg"]};">{ic("baixo", 12)}</span>'
                f'<div role="tablist" style="display:flex;align-items:center;gap:2px;">'
                f'{aba(T("enunciado"), ativa == "enunciado")}{aba(T("peerNome"), ativa == "peer", conta)}</div>'
                f'{f"<span style=\"margin-left:auto;display:flex;align-items:center;gap:2px;\">{acoes}</span>" if acoes else ""}</div>'
                f'<div style="flex:1;min-height:0;overflow:hidden;padding:4px 20px 16px;">{corpo_}</div></section>')
    return cartao_


def alca(k, largura):
    # a alça entre a coluna e o editor, como fica no arrasto: o fio na cor da marca e a largura
    return (f'<div aria-hidden="true" style="position:absolute;top:0;bottom:0;right:-16px;width:16px;cursor:col-resize;">'
            f'<span style="position:absolute;top:12px;bottom:12px;left:7px;width:2px;border-radius:2px;background:{k["pri"]};"></span>'
            f'<span style="position:absolute;top:50%;right:14px;transform:translateY(-50%);padding:3px 6px;border-radius:6px;'
            f'background:{k["fgs"]};color:{k["bg"]};font-family:{MONO};font-size:11px;white-space:nowrap;">{largura}px</span></div>')


H_TESTES = ('h1hora', 'h1Gatilho', 'tipoPergunta', 'peerTestes')
H_PAUSA = ('h2hora', 'h2Gatilho', 'tipoPergunta', 'peerPausa')
H_DICA = ('h1hora', 'h2Gatilho', 'tipoDica', 'peerDica')


def tela_peer_testes(k):
    return tela_exercicio(k, peer=dict(testes=nota_testes(k), abas=abas(k, [H_TESTES, H_PAUSA]), status=status(k)))


def tela_peer_faixa(k):
    # a dica acabou de chegar: a aba Peer acende o ponto, e o enunciado segue aberto
    return tela_exercicio(k, peer=dict(faixa=faixa(k), abas=abas(k, [H_DICA, H_PAUSA], nova=True), status=status(k)))


def tela_peer_aba(k):
    # a aba Peer aberta, com a coluna alargada pela alça (arrastando, 460px)
    return tela_exercicio(k, peer=dict(abas=abas(k, [H_DICA, H_PAUSA, H_TESTES], ativa='peer'), status=status(k),
                                       largura=460, alca=alca(k, 460)))


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
    fundo = tela_exercicio(k, peer=dict(abas=abas(k, [H_DICA, H_PAUSA]), status=status(k)))
    assert fundo.endswith('</div>')
    veu = (f'<div style="position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:{k["veu"]};">'
           f'{_modal_retorno(k)}</div>')
    return fundo[:-len('</div>')] + veu + '</div>'
