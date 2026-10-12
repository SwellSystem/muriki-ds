# As peças do Muriki Platform: a base do Muriki Code (tokens, casca, lógica de idioma e tema,
# ícones, topo) mais o que as telas do Platform pedem. Os campos seguem os do registry: o
# InputGroup no tamanho touch (44px), com o afixo dentro do mesmo filete, e a frase do estado
# embaixo, ligada ao campo.
import os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
# no fim do caminho, não no começo: textos.py e telas.py daqui têm o mesmo nome que os do Code
sys.path.append(os.path.join(AQUI, '..', 'muriki-code'))
from base import (TOKENS, K, W, H, FONTE, MONO, I, svg, ic, casca, logica, props_tema, PROPS_IDIOMA, T, raiz,  # noqa: E402,F401
                  topo, rotulo, LOGO)

from textos import COMUM, juntar  # noqa: E402

# --field do tema do registry: card no claro, sunken no escuro
TOKENS['claro']['field'] = TOKENS['claro']['card']
TOKENS['escuro']['field'] = TOKENS['escuro']['sunken']
K['field'] = 'var(--field)'

I.update(
    # os estados do campo de nome único: cheios, como os do Phosphor no bloco (weight="fill")
    livre=svg('<circle cx="8" cy="8" r="6.6" fill="currentColor" stroke="none"/>'
              '<path d="M5.3 8.2l1.8 1.8 3.6-3.8" stroke="var(--field)" stroke-width="1.6"/>'),
    ocupado=svg('<circle cx="8" cy="8" r="6.6" fill="currentColor" stroke="none"/>'
                '<path d="M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2" stroke="var(--field)" stroke-width="1.6"/>'),
    reservado=svg('<rect x="3.4" y="7" width="9.2" height="7" rx="1.6"/><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>'),
    alerta=svg('<path d="M8 2.2l6.2 11H1.8z"/><path d="M8 6.6v3"/><path d="M8 11.6v.1"/>'),
    # os ícones dos cartões de "para quem é": o grupo (UsersThree) e a pessoa (User) do Phosphor
    pessoas=svg('<circle cx="8" cy="7.4" r="2.1"/><path d="M4.6 12.8c.6-1.6 1.9-2.5 3.4-2.5s2.8.9 3.4 2.5"/>'
                '<circle cx="3.7" cy="4.6" r="1.6"/><path d="M1.2 8.6c.4-1.1 1.3-1.8 2.5-1.8.6 0 1.1.2 1.5.5"/>'
                '<circle cx="12.3" cy="4.6" r="1.6"/><path d="M14.8 8.6c-.4-1.1-1.3-1.8-2.5-1.8-.6 0-1.1.2-1.5.5"/>'),
    # o verificando do campo (SpinnerGap no bloco): gira pelo CSS da tela em movimento (.giro)
    girando=svg('<g class="giro"><path d="M8 2.2a5.8 5.8 0 1 1-5.8 5.8"/></g>'),
)

PRODUTO = 'Muriki Platform'
EMAIL = 'rafael@moura.dev'


def esc(txt):
    return txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def pagina(titulo, corpo, tema, textos):
    return casca(titulo, corpo, logica(juntar(COMUM, textos), tema), {**PROPS_IDIOMA, **props_tema(tema)})


# ── Onboarding ──────────────────────────────────────────────────────────
# O OnboardingStep do registry (o título em 50px: o clamp por altura do passo de identidade em 900): o topo com a marca, idioma e tema; o cabeçalho de passo (rótulo
# mono, barra e título de display) e o conteúdo numa coluna de 672px.
def cabecalho_passo(k, n, total, titulo, sub=''):
    passos = ''.join(f'<span style="height:4px;flex:1;border-radius:2px;background:{k["pri"] if i < n else k["sunken"]};"></span>'
                     for i in range(total))
    legenda_ = f'{T("passoRotulo")} · {n} {T("de")} {total}'
    return (f'<header style="display:flex;flex-direction:column;gap:16px;">'
            f'<div style="display:flex;flex-direction:column;gap:8px;width:100%;">{rotulo(legenda_, k["mfg"])}'
            f'<div role="progressbar" aria-valuemin="1" aria-valuemax="{total}" aria-valuenow="{n}" '
            f'aria-label="{T("passosAria")} {n} {T("de")} {total}" style="display:flex;gap:6px;width:100%;">{passos}</div></div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;">'
            f'<h1 style="margin:0;font-size:50px;line-height:1.02;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{titulo}</h1>'
            + (f'<p style="margin:0;max-width:65ch;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p>' if sub else '')
            + '</div></header>')


def manchas(k):
    # as manchas desfocadas da marca no fundo do palco, as mesmas do componente (MANCHAS): espelhadas para
    # o palco à esquerda, e a borda que encosta no formulário termina num degradê para o fundo da página
    return (f'linear-gradient(to right, transparent calc(100% - 176px), {k["bg"]}), '
            f'radial-gradient(45% 55% at 72% 22%, color-mix(in oklch, {k["pri"]} 44%, transparent), transparent 70%), '
            f'radial-gradient(50% 60% at 12% 82%, color-mix(in oklch, {k["pri"]} 36%, transparent), transparent 70%), '
            f'radial-gradient(35% 40% at 22% 12%, color-mix(in oklch, {k["pri"]} 24%, transparent), transparent 70%)')


def palco(k, conteudo):
    # o lado visual, à esquerda: o palco azul (primary-subtle com as manchas desfocadas da marca) e, por
    # cima, o conteúdo (a janela do produto). O que é absoluto no conteúdo (o Recomeçar da tela em
    # movimento) se mede pelo palco
    return (f'<div style="position:relative;display:flex;align-items:center;justify-content:center;min-height:0;'
            f'padding:64px 58px 45px;background-color:{k["prisub"]};background-image:{manchas(k)};">{conteudo}</div>')


def pagina_identidade(k, formulario, previa):
    # o PlatformOnboardingIdentity a partir do lg, medido em 1440×900: a grade 1.2fr / 1fr da altura da
    # janela, a barra do topo por cima das duas colunas, o palco com a janela da prévia à esquerda (o
    # lado do login) e o formulário numa coluna de 512px centrada na vertical, à direita.
    # Os clamp() do componente, resolvidos para 900 de altura
    return (f'{raiz(k, "display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);")}'
            f'<div style="position:absolute;inset:0 0 auto 0;z-index:1;">{topo(k, PRODUTO, EMAIL)}</div>'
            f'{palco(k, previa)}'
            f'<main style="display:flex;flex-direction:column;justify-content:center;gap:32px;width:512px;justify-self:center;'
            f'padding:64px 0 27px;">{formulario}</main></div>')


# o estado do campo: (ícone no fim, cor do ícone, a frase é erro?)
ESTADOS = {
    'idle': (None, None, False),
    'available': ('livre', 'ok', False),
    'taken': ('ocupado', 'bad', True),
    'reserved': ('reservado', 'bad', True),
    'checking': ('girando', 'mfg', False),
}


def campo(k, id_, rotulo_, valor, estado='idle', frase='', afixo='', mono=False, placeholder=''):
    icone, cor, erro = ESTADOS[estado]
    anel = (f'box-shadow:inset 0 0 0 1px {k["bad"]}, 0 0 0 3px color-mix(in oklch, {k["bad"]} 15%, transparent);' if erro
            else f'box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["input"]} 45%, {k["field"]});')
    pre = (f'<span style="display:flex;align-items:center;flex:0 0 auto;font-family:{MONO};font-size:12.5px;color:{k["mfg"]};">{afixo}</span>'
           if afixo else '')
    fim = f'<span style="display:flex;color:{k[cor]};">{ic(icone, 15)}</span>' if icone else ''
    msg_id = f'{id_}-msg'
    inv = ' aria-invalid="true"' if erro else ''
    entrada = (f'<input id="{id_}" value="{esc(valor)}" placeholder="{placeholder}" aria-describedby="{msg_id}"{inv} '
               f'style="flex:1;min-width:0;height:100%;padding:0;border:0;background:transparent;outline:0;'
               f'font-family:{MONO if mono else FONTE};font-size:15px;color:{k["fgs"]};">')
    caixa = (f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 14px;border-radius:11px;'
             f'background:{k["field"]};{anel}">{pre}{entrada}{fim}</div>')
    if not frase:
        nota = ''
    elif erro:
        nota = (f'<p id="{msg_id}" role="alert" style="margin:0;display:flex;align-items:center;gap:6px;font-size:13px;line-height:18px;'
                f'color:{k["bad"]};">{ic("alerta", 13)}<span>{frase}</span></p>')
    else:
        c = k['ok'] if estado == 'available' else k['mfg']
        nota = f'<p id="{msg_id}" aria-live="polite" style="margin:0;font-size:13px;line-height:18px;color:{c};">{frase}</p>'
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
            f'<label for="{id_}" style="font-size:14px;line-height:14px;font-weight:500;color:{k["fgs"]};">{rotulo_}</label>'
            f'{caixa}{nota}</div>')


def caixa_marcar(k, marcada, rotulo_):
    if marcada:
        caixa = (f'<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;'
                 f'background:{k["pri"]};color:{k["prifg"]};">{ic("check", 11)}</span>')
    else:
        caixa = (f'<span style="display:flex;width:16px;height:16px;border-radius:4px;background:{k["sunken"]};'
                 f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.12);"></span>')
    return (f'<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:20px;color:{k["mfg"]};cursor:pointer;">'
            f'<span role="checkbox" aria-checked="{"true" if marcada else "false"}" style="display:flex;margin-top:2px;flex:0 0 auto;">{caixa}</span>'
            f'<span>{rotulo_}</span></label>')


def botao_passo(k, txt, ligado):
    # a ação do OnboardingStep: Button solid touch com a seta, da largura dos campos; desligado, meio apagado
    op = '' if ligado else 'opacity:0.5;'
    d = '' if ligado else ' disabled aria-disabled="true"'
    return (f'<div style="display:flex;">'
            f'<button type="submit"{d} style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;'
            f'padding:0 18px;border:0;border-radius:11px;background:{k["pri"]};color:{k["prifg"]};font-family:{FONTE};font-size:15px;'
            f'font-weight:500;{op}">{txt}{ic("seta", 14)}</button></div>')




def cartoes_escolha(k, aria, opcoes, escolhida, acoes=None):
    # o ChoiceCardGroup single do registry: dois cartões lado a lado, o marcado com o anel da marca; o
    # ícone de cada um no canto direito, azul no marcado; sem a linha do produto (quem o mostra é a prévia). `acoes`: {valor: hole do clique} (a tela em movimento)
    def cartao(valor, titulo, icone):
        clique = f' onClick="{acoes[valor]}"' if acoes else ''
        marcado = valor == escolhida
        anel = (f'box-shadow:0 0 0 1.5px {k["pri"]}, 0 4px 10px -2px rgba(0,0,0,0.10);' if marcado
                else f'box-shadow:0 0 0 1px {k["border"]}, 0 1px 2px rgba(0,0,0,0.05);')
        bolinha = f'inset 0 0 0 4px {k["pri"]}' if marcado else f'inset 0 0 0 1.5px {k["input"]}'
        return (f'<button type="button" role="radio" aria-checked="{"true" if marcado else "false"}"{clique} '
                f'style="position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 48px 14px 16px;border:0;border-radius:12px;background:{k["card"]};'
                f'{anel}text-align:left;font-family:{FONTE};cursor:pointer;">'
                f'<span style="display:flex;align-items:center;gap:8px;">'
                f'<span style="width:14px;height:14px;flex:0 0 auto;border-radius:50%;box-shadow:{bolinha};"></span>'
                f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{titulo}</span></span>'
                                f'<span style="position:absolute;top:50%;right:16px;display:flex;transform:translateY(-50%);'
                f'color:{k["pri"] if marcado else k["mfg"]};">{ic(icone, 24)}</span></button>')
    return (f'<div role="radiogroup" aria-label="{aria}" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
            + ''.join(cartao(*o) for o in opcoes) + '</div>')


# ── A prévia ao vivo (WorkspacePreview) ─────────────────────────────────
# A janela do produto que nasce, no estado final (no canvas a animação não roda): sem barra de
# endereço; no topo os três pontos e, no meio, a logo da Muriki e o produto (Muriki Projects ou
# Muriki Focus); embaixo, o nome do workspace em destaque, a frase do que nasce e os lugares. O
# resto são esqueletos sem nome, com as partes azuis acesas quando há nome (primary a 25% e a 60%).
# Os clamp() do componente, resolvidos para 1440×900. Decorativa.
PRODUTOS = {'team': 'Muriki Projects', 'personal': 'Muriki Focus'}


def _barra(k, largura, alt=8, cor=None, raio=999, extra=''):
    return (f'<span style="display:block;flex:0 0 auto;height:{alt}px;width:{largura};border-radius:{raio}px;'
            f'background:{cor or k["sunken"]};{extra}"></span>')


# `vivo` é True ou False no quadro parado; VIVO_CSS deixa a cor para as variáveis da tela em movimento
# (--azul, --azulForte, --anel, --arco), que trocam com a classe `vivo` e passam por transição
VIVO_CSS = 'css'


def _azul(k, vivo, forte=False):
    if vivo == VIVO_CSS:
        return f'var(--azul{"Forte" if forte else ""})'
    if not vivo:
        return k['sunken']
    return f'color-mix(in oklab, {k["pri"]} {60 if forte else 25}%, transparent)'


def _faixa(k, vivo, abas):
    pilulas = ''.join(_barra(k, w, 24, _azul(k, vivo) if i == 0 else k['sunken'], 7) for i, w in enumerate(abas))
    return (f'<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto;">{pilulas}'
            f'<span style="margin-left:auto;width:96px;height:28px;border-radius:8px;background:{_azul(k, vivo, True)};"></span></div>')


def _painel(k, filhos, extra=''):
    return (f'<div style="display:flex;flex-direction:column;gap:12px;min-height:0;padding:10px;border-radius:12px;'
            f'background:color-mix(in oklab, {k["sunken"]} 55%, transparent);{extra}">{filhos}</div>')


def _topo_painel(k, ponto, titulo):
    return (f'<div style="display:flex;align-items:center;gap:8px;padding:2px 4px 0;">'
            f'<span style="width:8px;height:8px;border-radius:50%;background:{ponto};"></span>{_barra(k, titulo)}'
            f'<span style="margin-left:auto;width:20px;height:16px;border-radius:999px;background:{k["card"]};"></span></div>')


def _quadro(k, vivo):
    # cada coluna termina no último cartão, como num quadro de verdade (align-items:start); o cartão
    # tem 99px (11vh em 900)
    colunas = [([('78%', '52%'), ('64%', '40%'), ('70%', '46%')], '64px'),
               ([('58%', '72%'), ('82%', '36%')], '80px'),
               ([('66%', '48%')], '48px')]
    html = ''
    for c, (cartoes, titulo) in enumerate(colunas):
        filhos = _topo_painel(k, _azul(k, vivo, True) if c == 0 else f'color-mix(in oklab, {k["input"]} 70%, transparent)', titulo)
        for i, (a, b) in enumerate(cartoes):
            destaque = c == 0 and i == 0
            anel = f'0 0 0 1px color-mix(in oklab, {k["pri"]} 60%, transparent)' if destaque and vivo else '0 1px 2px rgba(0,0,0,0.05)'
            if destaque and vivo == VIVO_CSS:
                anel = 'var(--anel)'
            selo = (f'<span style="position:absolute;top:0;right:0;width:48px;height:14px;border-bottom-left-radius:7px;'
                    f'background:{_azul(k, vivo)};"></span>' if destaque else '')
            filhos += (f'<div style="position:relative;display:flex;flex-direction:column;gap:8px;flex:0 0 auto;height:99px;box-sizing:border-box;'
                       f'padding:12px;overflow:hidden;border-radius:9px;background:{k["card"]};box-shadow:{anel};">{selo}'
                       f'{_barra(k, a)}{_barra(k, b, cor=f"color-mix(in oklab, {k["sunken"]} 70%, transparent)")}'
                       f'<div style="margin-top:auto;display:flex;align-items:center;gap:6px;">'
                       f'<span style="width:16px;height:16px;border-radius:50%;background:{_azul(k, vivo, True) if destaque else k["sunken"]};"></span>'
                       f'{_barra(k, "32px", 6)}</div></div>')
        html += _painel(k, filhos)
    return (f'<div style="display:flex;flex-direction:column;gap:18px;">{_faixa(k, vivo, ["64px", "48px", "56px"])}'
            f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:start;gap:12px;">{html}</div></div>')


def _lista(k, vivo):
    # Muriki Focus: a lista de tarefas (seis, de 49px: 5.4vh em 900) e, ao lado, o anel do dia e a agenda
    # de hoje embaixo; as duas colunas com a altura da lista
    linhas = _topo_painel(k, _azul(k, vivo, True), '56px')
    for i, w in enumerate(['68%', '54%', '76%', '44%', '60%', '50%']):
        feita = i == 0
        caixa = (f'background:{_azul(k, vivo, True)};' if feita else f'box-shadow:inset 0 0 0 1.5px {k["input"]};')
        linhas += (f'<div style="display:flex;align-items:center;gap:12px;flex:0 0 auto;height:49px;padding:0 12px;box-sizing:border-box;'
                   f'border-radius:9px;background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.05);">'
                   f'<span style="width:16px;height:16px;flex:0 0 auto;border-radius:5px;{caixa}"></span>'
                   f'{_barra(k, w, cor=f"color-mix(in oklab, {k["sunken"]} 60%, transparent)" if feita else None, extra="flex:0 1 auto;min-width:0;")}'
                   f'<span style="margin-left:auto;width:40px;height:16px;flex:0 0 auto;border-radius:999px;'
                   f'background:{_azul(k, vivo) if i == 1 else k["sunken"]};"></span></div>')
    # o anel do dia: 38% da volta de um círculo de raio 42 (só formas no SVG, nada de texto)
    volta = 2 * 3.141592653589793 * 42
    arco = f'color-mix(in oklab, {k["pri"]} 70%, transparent)' if vivo else f'color-mix(in oklab, {k["input"]} 60%, transparent)'
    if vivo == VIVO_CSS:
        arco = 'var(--arco)'
    anel = (f'<svg viewBox="0 0 100 100" style="width:108px;height:108px;transform:rotate(-90deg);">'
            f'<circle cx="50" cy="50" r="42" fill="none" stroke-width="9" style="stroke:{k["card"]};"/>'
            f'<circle cx="50" cy="50" r="42" fill="none" stroke-width="9" stroke-linecap="round" '
            f'stroke-dasharray="{volta * 0.38:.2f} {volta:.2f}" style="stroke:{arco};"/></svg>')
    dia = (f'{anel}<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;">'
           f'{_barra(k, "55%")}{_barra(k, "38%", cor=f"color-mix(in oklab, {k["sunken"]} 70%, transparent)")}</div>'
           f'<span style="width:60%;height:28px;border-radius:8px;background:{_azul(k, vivo)};"></span>')
    # a agenda de hoje: duas horas marcadas, a primeira tingida
    agenda = (f'<div style="display:flex;align-items:center;gap:8px;padding:2px 4px 0;">'
              f'<span style="width:8px;height:8px;border-radius:50%;background:color-mix(in oklab, {k["input"]} 70%, transparent);"></span>'
              f'{_barra(k, "48px")}</div>')
    for i, w in enumerate(['62%', '48%']):
        agenda += (f'<div style="display:flex;align-items:center;gap:10px;height:28px;padding:0 10px;border-radius:8px;background:{k["card"]};">'
                   f'<span style="width:4px;height:14px;flex:0 0 auto;border-radius:999px;background:{_azul(k, vivo, True) if i == 0 else k["sunken"]};"></span>'
                   f'{_barra(k, w, extra="flex:0 1 auto;min-width:0;")}</div>')
    direita = (f'<div style="display:flex;flex-direction:column;gap:12px;min-height:0;">'
               f'{_painel(k, dia, "flex:1;align-items:center;justify-content:center;gap:18px;padding:16px;")}'
               f'{_painel(k, agenda, "gap:8px;")}</div>')
    return (f'<div style="display:flex;flex-direction:column;gap:18px;">{_faixa(k, vivo, ["56px", "40px"])}'
            f'<div style="display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:12px;">'
            f'{_painel(k, linhas, "gap:10px;")}{direita}</div></div>')


def _moldura(k, produto, conteudo, extra=''):
    # a janela: os três pontos e, no meio, a logo e o produto; embaixo, o conteúdo
    pontos = ''.join(f'<span style="width:10px;height:10px;border-radius:50%;background:{k["sunken"]};"></span>' for _ in range(3))
    barra_janela = (f'<div style="position:relative;display:flex;align-items:center;justify-content:center;height:44px;flex:0 0 auto;padding:0 16px;'
                    f'border-bottom:1px solid color-mix(in oklab, {k["fg"]} 7%, transparent);">'
                    f'<div style="position:absolute;left:16px;display:flex;gap:6px;">{pontos}</div>'
                    f'<div style="display:flex;align-items:center;gap:8px;"><span style="display:flex;width:20px;height:20px;">{LOGO}</span>'
                    f'{produto}</div></div>')
    # a altura é a do conteúdo, e a janela fica no meio do palco
    return (f'<div aria-hidden="true"{extra} style="display:flex;flex-direction:column;width:100%;max-width:864px;max-height:100%;'
            f'overflow:hidden;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombraFlut"]}, 0 0 0 1px color-mix(in oklab, {k["fg"]} 8%, transparent);pointer-events:none;user-select:none;">'
            f'{barra_janela}<div style="display:flex;flex-direction:column;gap:23px;padding:27px 32px;">'
            f'{conteudo}</div></div>')


def _nome_produto(k, nome, extra=''):
    return f'<span{extra} style="font-size:13px;font-weight:600;color:{k["fgs"]};white-space:nowrap;">{nome}</span>'


def _lugares(k, cor_voce, extra=''):
    # os lugares do time: você e os três vazios de quem chega no próximo passo
    vazio = f'border:1.5px dashed {k["input"]};'
    return (f'<div{extra} style="display:flex;align-items:center;margin-top:8px;flex:0 0 auto;">'
            f'<span style="width:32px;height:32px;border-radius:50%;background:{cor_voce};"></span>'
            + ''.join(f'<span style="width:32px;height:32px;margin-left:6px;border-radius:50%;box-sizing:border-box;{vazio}"></span>'
                      for _ in range(3)) + '</div>')


def previa_workspace(k, publico, nome, exemplo, frase, voce):
    # sem nome, o exemplo do campo, apagado; `voce`: o @ aparece na frase, e o lugar "você" do time acende.
    # Os lugares são só do time: o Focus é de uma pessoa
    vivo = bool(nome)
    titulo = (f'<h2 style="margin:0;font-size:41px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;'
              + (f'color:{k["fgs"]};">{esc(nome)}</h2>' if vivo else
                 f'color:color-mix(in oklab, {k["mfg"]} 45%, transparent);">{exemplo}</h2>'))
    lugares = _lugares(k, _azul(k, voce, True)) if publico == 'team' else ''
    cabeca = (f'<div style="display:flex;align-items:flex-start;gap:24px;">'
              f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{titulo}'
              f'<p style="margin:0;min-height:40px;max-width:52ch;font-size:15px;line-height:20px;color:{k["mfg"]};text-wrap:pretty;">{frase}</p></div>'
              f'{lugares}</div>')
    corpo = _quadro(k, vivo) if publico == 'team' else _lista(k, vivo)
    return _moldura(k, _nome_produto(k, PRODUTOS[publico]), cabeca + corpo)


# ── A prévia em movimento (a tela de Play) ──────────────────────────────
# A mesma janela, com o estado nos holes da lógica (mv.*) e o movimento do componente no CSS da tela
# (CSS_MOVIMENTO): o nome letra a letra, a frase e o produto em cross-fade, os lugares saindo no Focus,
# as partes azuis acendendo por transição de cor e o conteúdo saindo e entrando na troca de produto.
def previa_movimento(k):
    produto = ('<span style="display:grid;justify-items:start;">'
               + _nome_produto(k, PRODUTOS['team'], ' class="mv-troca {{mv.projects}}"')
               + _nome_produto(k, PRODUTOS['personal'], ' class="mv-troca {{mv.focus}}"') + '</span>')
    titulo = (f'<h2 style="margin:0;min-height:43px;font-size:41px;line-height:1.05;font-weight:600;letter-spacing:-0.035em;">'
              f'<sc-if value="{{{{mv.vivo}}}}" hint-placeholder-val="{{{{ false }}}}"><span style="color:{k["fgs"]};">'
              f'<sc-for list="{{{{mv.letras}}}}" as="l" hint-placeholder-count="6"><span class="mv-letra">{{{{l.c}}}}</span></sc-for>'
              f'</span></sc-if>'
              f'<sc-if value="{{{{mv.vazio}}}}" hint-placeholder-val="{{{{ true }}}}">'
              f'<span style="color:color-mix(in oklab, {k["mfg"]} 45%, transparent);">{{{{exemplo}}}}</span></sc-if></h2>')
    frases = ''.join(f'<p class="mv-troca {{{{mv.frase.{chave}}}}}" style="grid-area:1/1;margin:0;max-width:52ch;text-wrap:pretty;">{T(texto)}</p>'
                     for chave, texto in [('vazio', 'previaVazio'), ('time', 'fraseTime'), ('timeU', 'fraseLivre'),
                                          ('foco', 'fraseFocoSem'), ('focoU', 'fraseFoco')])
    cabeca = (f'<div style="display:flex;align-items:flex-start;gap:24px;">'
              f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{titulo}'
              f'<div style="display:grid;min-height:40px;font-size:15px;line-height:20px;color:{k["mfg"]};">{frases}</div></div>'
              f'{_lugares(k, "var(--voce)", " class=\"mv-lugares {{mv.lugares}}\"")}</div>')
    corpo = (f'<sc-if value="{{{{mv.time}}}}" hint-placeholder-val="{{{{ true }}}}"><div class="mv-corpo {{{{mv.saindo}}}}">{_quadro(k, VIVO_CSS)}</div></sc-if>'
             f'<sc-if value="{{{{mv.foco}}}}" hint-placeholder-val="{{{{ false }}}}"><div class="mv-corpo {{{{mv.saindo}}}}">{_lista(k, VIVO_CSS)}</div></sc-if>')
    janela = _moldura(k, produto, cabeca + corpo, ' class="mv-previa {{mv.previa}}"')
    # fora da janela (que é decorativa): o Recomeçar, discreto, no canto do palco
    recomecar = (f'<button type="button" onClick="{{{{recomecar}}}}" style="position:absolute;right:24px;bottom:16px;z-index:2;display:flex;'
                 f'align-items:center;gap:6px;height:30px;padding:0 12px;border:0;border-radius:8px;'
                 f'background:color-mix(in oklab, {k["card"]} 70%, transparent);color:{k["mfg"]};font-family:{FONTE};font-size:12.5px;'
                 f'cursor:pointer;">{ic("recarregar", 13)}{T("recomecar")}</button>')
    return janela + recomecar


_CURVA = 'cubic-bezier(0.16,1,0.3,1)'
CSS_MOVIMENTO = (
    # as letras do nome: sobem e saem do desfoque (o Letreiro)
    f'.mv-letra{{display:inline-block;white-space:pre;animation:mv-letra 320ms {_CURVA} both;}}'
    '@keyframes mv-letra{from{opacity:0;transform:translateY(0.3em);filter:blur(6px);}}'
    # o produto, a frase e os lugares: cross-fade com um passo vertical (horizontal nos lugares)
    f'.mv-troca{{grid-area:1/1;opacity:0;transform:translateY(-7px);transition:opacity 320ms {_CURVA},transform 320ms {_CURVA};}}'
    '.mv-troca.on{opacity:1;transform:none;}'
    f'.mv-lugares{{opacity:0;transform:translateX(-10px);transition:opacity 320ms {_CURVA},transform 320ms {_CURVA};}}'
    '.mv-lugares.on{opacity:1;transform:none;}'
    # as partes azuis: cinza à espera, tingidas quando o nome chega; o "você" quando o @ aparece
    '.mv-previa{--azul:var(--sunken);--azulForte:var(--sunken);--voce:var(--sunken);'
    '--anel:0 1px 2px rgba(0,0,0,0.05);--arco:color-mix(in oklab, var(--input) 60%, transparent);}'
    '.mv-previa.vivo{--azul:color-mix(in oklab, var(--pri) 25%, transparent);--azulForte:color-mix(in oklab, var(--pri) 60%, transparent);'
    '--anel:0 0 0 1px color-mix(in oklab, var(--pri) 60%, transparent);--arco:color-mix(in oklab, var(--pri) 70%, transparent);}'
    '.mv-previa.voce{--voce:color-mix(in oklab, var(--pri) 60%, transparent);}'
    '.mv-corpo :is(span,div,circle),.mv-lugares>span{transition:background-color 500ms ease,box-shadow 500ms ease,stroke 500ms ease;}'
    # Projects↔Focus: o conteúdo sai (160ms) e o novo entra, item a item
    '.mv-corpo{transition:opacity 160ms ease,transform 160ms ease;}'
    '.mv-corpo.saindo{opacity:0;transform:translateY(-10px);}'
    f'.mv-corpo>div>div:first-child,.mv-corpo>div>div:nth-child(2)>*{{animation:mv-item 320ms {_CURVA} both;}}'
    '.mv-corpo>div>div:nth-child(2)>:nth-child(1){animation-delay:50ms;}'
    '.mv-corpo>div>div:nth-child(2)>:nth-child(2){animation-delay:100ms;}'
    '.mv-corpo>div>div:nth-child(2)>:nth-child(3){animation-delay:150ms;}'
    '@keyframes mv-item{from{opacity:0;transform:translateY(14px) scale(0.97);}}'
    # o verificando dos campos
    '.giro{transform-origin:8px 8px;animation:mv-giro 800ms linear infinite;}'
    '@keyframes mv-giro{to{transform:rotate(360deg);}}'
    # sem movimento: tudo troca na hora
    '@media (prefers-reduced-motion: reduce){.mc *{animation:none !important;transition:none !important;}}'
)
