# ── Os limites do Starter no exercício e na Evolução ────────────────────
# A API (muriki-api 2bebe4d) tem dois limites do Starter que aparecem na tela:
# - code.review: o Peer do Starter não consulta a IA nos eventos do editor (pausa, trecho fechado, testes
#   rodados). A pergunta livre, a dica, as armadilhas da linguagem e o retorno do envio seguem iguais. O
#   aviso mora fixo no "Peer acompanhando" do cabeçalho, nunca como fala a cada evento: não é erro.
# - code.history_days: a Evolução mostra só os últimos 7 dias (historyFrom). O nível, os desbloqueios e o
#   catálogo continuam calculados de tudo. Um aviso só, embaixo do cabeçalho; na linha do tempo, o que vem
#   antes da janela fica hachurado, e a linha entra pela borda no nível de antes da mudança; a trajetória
#   fora da janela (404) e o histórico sem mudança na janela têm frase própria.
from base import *
from telas import tela_exercicio
from evolucao import (_cabecalho, _pagina, _caminho_competencia, _escala, _confirmado, _declarado,
                      SEMANAS)

# o Assincronia subiu de Junior para Pleno dentro da janela; o resto mudou antes dela
JANELA = SEMANAS - 2  # a borda: hoje menos 7 dias, na grade de semanas
MUDANCA = SEMANAS - 1.4


def _no_starter(k, html):
    # o selo do plano no menu: estas telas são de quem está no Starter
    pro = badge('Pro', k, 'blue')
    assert pro in html
    return html.replace(pro, badge('Starter', k, 'gray'))


def status_starter(k):
    # o "Peer acompanhando" de sempre, com o complemento fixo e discreto; o link leva aos planos
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;margin-right:10px;font-size:12px;color:{k["pri"]};">'
            f'<span style="width:6px;height:6px;border-radius:999px;background:{k["pri"]};"></span>{T("peerAcompanhando")}'
            f'<span style="color:{k["mfg"]};">·</span>'
            f'<a href="Planos__SUF__.dc.html" style="color:{k["mfg"]};text-decoration:underline;text-underline-offset:3px;'
            f'text-decoration-color:color-mix(in oklch, {k["mfg"]} 40%, transparent);">{T("stRevisaoPro")}</a></span>')


def tela_exercicio_starter(k):
    return _no_starter(k, tela_exercicio(k, peer=dict(status=status_starter(k))))


def nota_janela(k):
    # um aviso só, embaixo do cabeçalho: o fato, a data e o Pro; tom de informação, nunca de alerta
    return (f'<div role="note" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;'
            f'background:{k["sunken"]};">'
            f'<span style="display:flex;color:{k["mfg"]};">{ic("relogio", 16)}</span>'
            f'<span style="flex:1;min-width:0;font-size:13.5px;line-height:20px;color:{k["fg"]};">{T("stJanela")}</span>'
            f'<a href="Planos__SUF__.dc.html" style="font-size:13.5px;font-weight:500;white-space:nowrap;">{T("stVerPro")}</a></div>')


def _grafico_janela(k, larg=900, alt=200, rot_esq=86):
    faixa = alt / 4
    x = lambda i: i * (larg / (SEMANAS - 1))
    y = lambda nivel: alt - (nivel - 0.5) * faixa
    faixas = ''.join(f'<rect x="0" y="{i * faixa:.1f}" width="{larg}" height="{faixa:.1f}" fill="var(--{"sunken" if i % 2 else "card"})"/>'
                     for i in range(4))
    grade = ''.join(f'<line x1="{x(i):.1f}" y1="0" x2="{x(i):.1f}" y2="{alt}" stroke="var(--muted)" stroke-width="1"/>' for i in range(SEMANAS))
    # antes da janela: hachurado e apagado, com a borda marcada; não é "nada aconteceu", é "fora da vista"
    hachura = (f'<defs><pattern id="st-hachura" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
               f'<line x1="0" y1="0" x2="0" y2="7" stroke="var(--input)" stroke-width="1.5"/></pattern></defs>'
               f'<rect x="0" y="0" width="{x(JANELA):.1f}" height="{alt}" fill="var(--card)" opacity="0.55"/>'
               f'<rect x="0" y="0" width="{x(JANELA):.1f}" height="{alt}" fill="url(#st-hachura)" opacity="0.7"/>'
               f'<line x1="{x(JANELA):.1f}" y1="0" x2="{x(JANELA):.1f}" y2="{alt}" stroke="var(--mfg)" stroke-width="1" stroke-dasharray="3 3"/>')
    linha = (f'<path d="M{x(JANELA):.1f} {y(2):.1f} H{x(MUDANCA):.1f} V{y(3):.1f} H{x(SEMANAS - 1):.1f}" fill="none" '
             f'stroke="var(--warn)" stroke-width="2.25" stroke-linejoin="round"/>'
             f'<circle cx="{x(MUDANCA):.1f}" cy="{y(3):.1f}" r="5" fill="var(--card)" stroke="var(--warn)" stroke-width="2.25"/>')
    svg_ = (f'<svg viewBox="0 0 {larg} {alt}" width="100%" height="{alt}" preserveAspectRatio="none" aria-hidden="true" '
            f'style="display:block;border-radius:6px;overflow:visible;">{faixas}{grade}{hachura}{linha}</svg>')
    borda = (f'<span style="position:absolute;right:calc(100% - {x(JANELA) / larg * 100:.2f}% + 8px);top:8px;padding:1px 6px;border-radius:4px;'
             f'background:{k["card"]};font-family:{MONO};font-size:10.5px;color:{k["mfg"]};white-space:nowrap;">{T("stDesde")}</span>')
    niveis = ''.join(f'<span style="position:absolute;right:10px;top:{(3 - i) * 25 + 12.5}%;transform:translateY(-50%);'
                     f'font-family:{MONO};font-size:10.5px;color:{k["mfg"]};white-space:nowrap;">{T(n)}</span>'
                     for i, n in enumerate(('nivelFund', 'nivelJunior', 'nivelPleno', 'nivelSenior')))
    meses = ''.join(f'<span style="position:absolute;left:{p}%;font-size:11px;color:{k["mfg"]};">{T(m)}</span>'
                    for m, p in (('jul', 0), ('ago', 36), ('set', 73)))
    return (f'<div style="display:flex;">'
            f'<div style="position:relative;width:{rot_esq}px;flex:0 0 auto;height:{alt}px;">{niveis}</div>'
            f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;">'
            f'<div style="position:relative;">{svg_}{borda}</div>'
            f'<div style="position:relative;height:16px;">{meses}</div></div></div>')


def _no_tempo_janela(k):
    legenda = (f'<span style="display:flex;flex-wrap:wrap;gap:8px 18px;">'
               f'<span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:{k["fg"]};">'
               f'<span style="width:18px;height:0;border-top:2.5px solid var(--warn);"></span>Assincronia</span>'
               f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
               f'<span style="width:9px;height:9px;border-radius:99px;box-shadow:inset 0 0 0 2px {k["mfg"]};"></span>{T("legConfirmacao")}</span></span>')
    return (f'<section aria-label="{T("noTempo")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:14px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("noTempo")}</h2>'
            f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("stTempoSubJanela")}</p></div>'
            f'{legenda}{_grafico_janela(k)}</section>')


def _cartao_vazio(k, titulo, sub, frase, selo=''):
    # o mesmo cartão de sempre, com a frase da janela no lugar do conteúdo
    return (f'<section aria-label="{T(titulo)}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'padding:16px 20px 18px;display:flex;flex-direction:column;gap:12px;">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;">'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
            f'<h2 style="margin:0;font-size:15px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T(titulo)}</h2>'
            + (f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T(sub)}</p>' if sub else '')
            + f'</div>{selo}</div>'
            f'<p style="margin:0;display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;'
            f'box-shadow:inset 0 0 0 1px {k["muted"]};font-size:13px;line-height:19px;color:{k["mfg"]};">'
            f'<span style="display:flex;margin-top:1px;">{ic("relogio", 15)}</span><span>{T(frase)}</span></p></section>')


def _trajetoria_vazia(k):
    return _cartao_vazio(k, 'trajetoria', 'trajetoriaSub', 'stTrajVazia', badge('Closures', k, 'blue'))


def tela_evolucao_starter(k):
    return _no_starter(k, _pagina(k, _cabecalho(k, 'evSub') + nota_janela(k) + _no_tempo_janela(k) + _trajetoria_vazia(k)))


def tela_competencia_starter(k):
    cab = (f'<header style="display:flex;flex-direction:column;gap:8px;">{voltar(k, T("voltarEvolucao"), "EvolucaoStarter__SUF__.dc.html")}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">Funções e escopo</h1>'
           f'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">{_escala(k, 3, 2, 22)}'
           f'{_confirmado(k, 3)}{_declarado(k, 2)}<span style="font-size:12.5px;color:{k["mfg"]};">· {T("grupoJs")}</span></div></header>')
    esquerda = f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:20px;">{_caminho_competencia(k)}</div>'
    direita = (f'<div style="width:520px;flex:0 0 520px;display:flex;flex-direction:column;gap:20px;">'
               f'{_cartao_vazio(k, "historicoTit", None, "stHistVazio")}{_trajetoria_vazia(k)}</div>')
    return _no_starter(k, _pagina(k, f'{cab}{nota_janela(k)}<div style="display:flex;gap:20px;align-items:flex-start;">{esquerda}{direita}</div>'))
