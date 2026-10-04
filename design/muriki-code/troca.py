# ── Troca de linguagem da trilha ────────────────────────────────────────
# No Starter a pessoa estuda uma família de linguagem por vez. Em "Começar a trilha" numa trilha de outra
# linguagem (access "switch" no GET /code/tracks), o app abre este modal por cima de Trilhas; na confirmação
# chama PUT /code/language-choice. Com access "not_in_plan", a troca só libera em changeAllowedAt. O Pro
# nunca vê o modal.
#
# O gesto: a trilha da linguagem de agora congela (o gelo desce por cima, a cor sai, "Guardado · 5 de 12
# etapas": nada se perde) e a da nova se abre (o primeiro ponto acende, "comece aqui"). No meio, o logo da
# linguagem ativa vira o da nova, e as setas fazem a passagem de um lado para o outro. Na volta, o mesmo
# gesto ao contrário: a que estava guardada descongela "de onde parou" e a de agora congela.
#
# Três fases no mesmo quadro: confirmar (o que acontece, Trocar ou Continuar na atual), trocando (a
# animação, ~2,4 s) e concluído (Começar ou Continuar a trilha). Com prefers-reduced-motion, cada fase
# aparece no estado final direto.
import math

from base import *
from logos import logo_linguagem
from logos_marcas import logo_marca
from aprender import tela_trilhas
from desbloqueio import TRILHAS as TRILHAS_JS, _cartao_trilha
from movel_code import PAD, raiz_movel, topo_movel

ALTURA_MOVEL = 844

CSS_TROCA = (
    '\n@keyframes tl-veu{from{opacity:0;}to{opacity:1;}}'
    '\n@keyframes tl-entra{from{opacity:0;transform:translateY(16px) scale(0.96);}to{opacity:1;transform:none;}}'
    '\n@keyframes tl-sobe{from{transform:translateY(100%);}to{transform:none;}}'
    '\n@keyframes tl-texto{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}'
    '\n@keyframes tl-fluxo{0%,100%{opacity:0.22;transform:translateX(-2px);}45%{opacity:1;transform:translateX(2px);}}'
    '\n@keyframes tl-congela{from{opacity:0;clip-path:inset(0 0 100% 0);}to{opacity:1;clip-path:inset(0 0 0 0);}}'
    '\n@keyframes tl-derrete{from{opacity:1;clip-path:inset(0 0 0 0);}to{opacity:0;clip-path:inset(100% 0 0 0);}}'
    '\n@keyframes tl-sai{from{opacity:1;transform:none;}to{opacity:0;transform:rotateY(90deg) scale(0.8);}}'
    '\n@keyframes tl-gira{from{opacity:0;transform:rotateY(-90deg) scale(0.8);}to{opacity:1;transform:none;}}'
    '\n@keyframes tl-onda{from{opacity:0.55;transform:scale(1);}to{opacity:0;transform:scale(1.5);}}'
    '\n@keyframes tl-acende{0%{fill:var(--card);stroke:var(--input);transform:scale(0.7);}60%{fill:var(--pri);stroke:var(--pri);transform:scale(1.5);}100%{fill:var(--pri);stroke:var(--pri);transform:none;}}'
    '\n@keyframes tl-pop{from{opacity:0;transform:translate(var(--ax),calc(-100% - 4px));}to{opacity:1;transform:translate(var(--ax),calc(-100% - 10px));}}'
    '\n@keyframes tl-previa-de{0%{opacity:1;transform:none;}15%,77%{opacity:0;transform:rotateY(90deg) scale(0.8);}92%,100%{opacity:1;transform:none;}}'
    '\n@keyframes tl-previa-para{0%,15%{opacity:0;transform:rotateY(-90deg) scale(0.8);}32%,62%{opacity:1;transform:none;}77%,100%{opacity:0;transform:rotateY(90deg) scale(0.8);}}'
    '\n@keyframes tl-nega-de{0%,100%{opacity:1;transform:none;}22%,62%{opacity:0;transform:rotateY(90deg) scale(0.8);}}'
    '\n@keyframes tl-nega-cadeado{0%,22%{opacity:0;transform:rotateY(-90deg) scale(0.8);}36%,50%{opacity:1;transform:none;}62%,100%{opacity:0;transform:rotateY(90deg) scale(0.8);}}'
    '\n.mc .tl-veu{animation:tl-veu .3s ease-out both;}'
    '\n.mc .tl-entra{animation:tl-entra .5s cubic-bezier(.2,.8,.2,1) .1s both;}'
    '\n.mc .tl-folha{animation:tl-sobe .42s cubic-bezier(.2,.8,.2,1) both;}'
    '\n.mc .tl-texto{animation:tl-texto .4s ease-out both;}'
    # as setas: na confirmação, uma onda lenta da linguagem de agora para a nova; trocando, rápida
    '\n.mc .tl-seta{opacity:0.35;}'
    '\n.mc .tl-confirmar .tl-seta{animation:tl-fluxo 2s ease-in-out calc(var(--i) * .16s) infinite;}'
    '\n.mc .tl-trocando .tl-seta{animation:tl-fluxo .6s ease-in-out calc(var(--i) * .07s) 3;}'
    '\n.mc .tl-concluido .tl-seta{opacity:0.5;}'
    '\n.mc .tl-plano .tl-seta{opacity:0.18;}'
    # a de agora congela: o gelo desce, a cor sai e o cartão recua um pouco
    '\n.mc .tl-card{box-shadow:inset 0 0 0 1px var(--input);transition:box-shadow .6s ease,transform .6s ease,opacity .6s ease;}'
    '\n.mc .tl-conteudo{transition:filter .8s ease,opacity .8s ease;}'
    '\n.mc .tl-de .tl-gelo{opacity:0;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-de .tl-gelo{opacity:1;}'
    '\n.mc .tl-trocando .tl-de .tl-gelo{animation:tl-congela 1s cubic-bezier(.3,.7,.2,1) .15s both;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-de .tl-conteudo{filter:saturate(0.1);opacity:0.7;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-de{transform:scale(0.97);}'
    # a nova se abre; a que volta descongela
    '\n.mc .tl-nova{opacity:0.62;}'
    '\n.mc .tl-nova .tl-conteudo{filter:saturate(0.35);}'
    '\n.mc .tl-volta .tl-conteudo{filter:saturate(0.1);opacity:0.7;}'
    '\n.mc .tl-volta .tl-gelo{opacity:1;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-para{opacity:1;transform:translateY(-3px);'
    'box-shadow:0 0 0 2px var(--pri),0 14px 30px -12px color-mix(in oklch, var(--pri) 45%, transparent);}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-para .tl-conteudo{filter:none;opacity:1;}'
    '\n.mc .tl-trocando .tl-para,.mc .tl-trocando .tl-para .tl-conteudo{transition-delay:1s;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-volta .tl-gelo{opacity:0;}'
    '\n.mc .tl-trocando .tl-volta .tl-gelo{animation:tl-derrete .9s cubic-bezier(.4,0,.2,1) .95s both;}'
    '\n.mc .tl-acende{transform-box:fill-box;transform-origin:center;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-acende{fill:var(--pri);stroke:var(--pri);}'
    '\n.mc .tl-trocando .tl-acende{animation:tl-acende .45s cubic-bezier(.2,.8,.2,1.3) 1.45s both;}'
    '\n.mc .tl-aqui{opacity:0;transform:translate(var(--ax),calc(-100% - 10px));}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-aqui{opacity:1;}'
    '\n.mc .tl-trocando .tl-aqui{animation:tl-pop .4s ease-out 1.6s both;}'
    # no meio, o logo da linguagem ativa gira e vira o da nova, com uma onda
    '\n.mc .tl-logo-para,.mc .tl-onda,.mc .tl-cadeado{opacity:0;}'
    # ao abrir, uma prévia só: o logo gira para o da nova e volta (no not_in_plan, para o cadeado e volta)
    '\n.mc .tl-confirmar .tl-logo-de{animation:tl-previa-de 2s ease-in-out .7s;}'
    '\n.mc .tl-confirmar .tl-logo-para{animation:tl-previa-para 2s ease-in-out .7s;}'
    '\n.mc .tl-plano .tl-logo-de{animation:tl-nega-de 1.6s ease-in-out .7s;}'
    '\n.mc .tl-plano .tl-cadeado{animation:tl-nega-cadeado 1.6s ease-in-out .7s;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-logo-de{opacity:0;}'
    '\n.mc :is(.tl-trocando,.tl-concluido) .tl-logo-para{opacity:1;}'
    '\n.mc .tl-trocando .tl-logo-de{animation:tl-sai .3s ease-in .6s both;}'
    '\n.mc .tl-trocando .tl-logo-para{animation:tl-gira .35s cubic-bezier(.2,.8,.2,1) .85s both;}'
    '\n.mc .tl-trocando .tl-onda{animation:tl-onda .8s ease-out .9s both;}'
    '\n@media (prefers-reduced-motion: reduce){'
    '.mc :is(.tl-veu,.tl-entra,.tl-folha,.tl-texto,.tl-seta,.tl-gelo,.tl-acende,.tl-aqui,.tl-logo-de,.tl-logo-para,.tl-cadeado,.tl-onda){animation:none !important;}'
    '.mc :is(.tl-card,.tl-conteudo){transition:none !important;}.mc .tl-confirmar .tl-seta{opacity:0.5;}}')

ANTES_TROCA = """const tlF = s.fase || this.props.fase || "confirmar";
const tl = { fase: tlF, confirmar: tlF === "confirmar", trocando: tlF === "trocando", concluido: tlF === "concluido" };"""
VALORES_TROCA = ('tl: tl,\n'
                 'tlTrocar: () => { const rm = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;\n'
                 'this.setState({ fase: "trocando" }); clearTimeout(this.tlTempo);\n'
                 'this.tlTempo = setTimeout(() => this.setState({ fase: "concluido" }), rm ? 400 : 2400); },\n'
                 'tlFicar: () => { clearTimeout(this.tlTempo); this.setState({ fase: "confirmar" }); }')
PROPS_TROCA = {'fase': {'editor': 'enum', 'options': ['confirmar', 'trocando', 'concluido'], 'default': 'confirmar'}}

# o floco do gelo: três eixos com as pontas em V
FLOCO = svg('<path d="M8 1.5v13M2.4 4.75l11.2 6.5M13.6 4.75L2.4 11.25"/>'
            '<path d="M6.4 2.6L8 3.9l1.6-1.3M6.4 13.4L8 12.1l1.6 1.3"/>'
            '<path d="M2.5 6.6l1.9-.7-.3-2M13.5 9.4l-1.9.7.3 2M13.5 6.6l-1.9-.7.3-2M2.5 9.4l1.9.7-.3 2"/>')
SETA = ('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg>')

NOMES = dict(js='JavaScript', py='Python')
# o caminho mini do cartão: 9 estações numa estrada que ondula, num viewBox de 220 × 52
VB_W, VB_H = 220, 52
PONTOS = [(10 + i * 25, 26 + round(13 * math.sin(i * 0.85 + 0.4))) for i in range(9)]


def _logo(ling, tam):
    return logo_marca('js', tam) if ling == 'js' else logo_linguagem('py', tam)


def _caminho(k, agora, nova=False, balao=None):
    # feito em azul até a de agora; a de agora com o anel; na trilha nova, o primeiro ponto acende
    estrada = 'M' + ' L'.join(f'{x} {y}' for x, y in PONTOS)
    feito = 'M' + ' L'.join(f'{x} {y}' for x, y in PONTOS[:agora + 1]) if agora > 0 else ''
    pontos = ''
    for i, (x, y) in enumerate(PONTOS):
        if nova and i == 0:
            pontos += f'<circle class="tl-acende" cx="{x}" cy="{y}" r="5.5" fill="var(--card)" stroke="var(--input)" stroke-width="2"/>'
        elif i < agora:
            pontos += f'<circle cx="{x}" cy="{y}" r="4" fill="var(--pri)"/>'
        elif i == agora and not nova:
            pontos += f'<circle cx="{x}" cy="{y}" r="5.5" fill="var(--card)" stroke="var(--pri)" stroke-width="2.5"/>'
        else:
            pontos += f'<circle cx="{x}" cy="{y}" r="4" fill="var(--card)" stroke="var(--input)" stroke-width="1.5"/>'
    x, y = PONTOS[agora]
    # perto das pontas, o balão se apoia no ponto em vez de centrar, para não sair do cartão
    ax = '-10px' if x < VB_W * 0.2 else ('calc(-100% + 10px)' if x > VB_W * 0.8 else '-50%')
    b = (f'<span class="tl-aqui" style="--ax:{ax};position:absolute;left:{x / VB_W * 100:.1f}%;top:{y / VB_H * 100:.1f}%;padding:2px 8px;'
         f'border-radius:999px;background:{k["fgs"]};color:{k["card"]};font-size:11px;line-height:16px;font-weight:500;white-space:nowrap;">'
         f'{T(balao)}</span>') if balao else ''
    return (f'<div style="position:relative;margin-top:14px;">'
            f'<svg viewBox="0 0 {VB_W} {VB_H}" width="100%" aria-hidden="true" style="display:block;max-width:240px;overflow:visible;">'
            f'<path d="{estrada}" fill="none" stroke="var(--sunken)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
            + (f'<path d="{feito}" fill="none" stroke="var(--pri)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' if feito else '')
            + f'{pontos}</svg>{b}</div>')


def _gelo(k, feitas):
    # o gelo por cima do cartão: azul tingido e translúcido, o floco, "Guardado" e quanto ficou guardado
    flocos = ''.join(f'<span style="position:absolute;{pos};display:flex;width:{t}px;height:{t}px;opacity:0.35;">{FLOCO}</span>'
                     for pos, t in (('left:12px;top:10px', 14), ('right:14px;bottom:12px', 18), ('right:30px;top:16px', 10)))
    return (f'<div class="tl-gelo" aria-hidden="true" style="position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;'
            f'align-items:center;justify-content:center;gap:4px;color:{k["tbluefg"]};'
            f'background:linear-gradient(160deg, color-mix(in oklch, {k["tblue"]} 90%, transparent), color-mix(in oklch, {k["tblue"]} 64%, transparent));'
            f'backdrop-filter:blur(2.5px);-webkit-backdrop-filter:blur(2.5px);'
            f'box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["bluedot"]} 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.45);">'
            f'{flocos}<span style="display:flex;width:26px;height:26px;">{FLOCO}</span>'
            f'<span style="font-size:14px;font-weight:600;">{T("tlGuardado")}</span>'
            f'<span style="font-size:12px;">{T(feitas)}</span></div>')


def _cartao(k, papel, ling, trilha, meta, agora, gelo=None, nova=False, balao=None, selo='', movel=False):
    chip = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px 0 6px;border-radius:6px;'
            f'background:{k["tgray"]};color:{k["tgrayfg"]};font-size:12px;font-weight:500;white-space:nowrap;">{_logo(ling, 14)}{NOMES[ling]}</span>')
    conteudo = (f'<div class="tl-conteudo" style="display:flex;flex-direction:column;gap:6px;">'
                f'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;">{chip}'
                + (f'<span style="margin-left:auto;">{selo}</span>' if selo else '') + '</div>'
                f'<span style="font-size:15px;line-height:21px;font-weight:600;color:{k["fgs"]};">{T(trilha)}</span>'
                f'{_caminho(k, agora, nova, balao)}'
                f'<span style="font-size:12px;line-height:17px;color:{k["mfg"]};">{T(meta)}</span></div>')
    pad = '12px 14px' if movel else '14px 16px'
    return (f'<div class="tl-card {papel}" style="position:relative;flex:1;min-width:0;padding:{pad};border-radius:12px;'
            f'background:{k["rail"]};">{conteudo}{_gelo(k, gelo) if gelo else ""}</div>')


def _centro(k, de, para, movel=False, plano=False):
    # as setas dos dois lados do logo; no celular os cartões empilham e as setas apontam para baixo
    giro = 'transform:rotate(90deg);' if movel else ''
    grupo = lambda i0: (f'<span style="display:flex;flex-direction:{"column" if movel else "row"};align-items:center;gap:1px;">'
                        + ''.join(f'<span style="display:flex;{giro}"><span class="tl-seta" style="--i:{i};display:flex;color:{k["pri"]};">{SETA}</span></span>'
                                  for i in range(i0, i0 + 3)) + '</span>')
    camada = lambda cls, ling: (f'<span class="{cls}" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">'
                                f'{_logo(ling, 30)}</span>')
    logo = (f'<span style="position:relative;display:flex;width:56px;height:56px;flex:0 0 auto;perspective:240px;">'
            f'<span aria-hidden="true" style="position:absolute;inset:-18px;border-radius:999px;'
            f'background:radial-gradient(circle, color-mix(in oklch, {k["pri"]} 16%, transparent), transparent 70%);"></span>'
            f'<span class="tl-onda" style="position:absolute;inset:0;border-radius:16px;box-shadow:0 0 0 2px {k["pri"]};"></span>'
            f'<span style="position:absolute;inset:0;border-radius:16px;background:#fff;'
            f'box-shadow:0 8px 20px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06);"></span>'
            f'{camada("tl-logo-de", de)}{camada("tl-logo-para", para)}'
            + (f'<span class="tl-cadeado" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:{k["mfg"]};">'
               f'<span style="display:flex;width:26px;height:26px;">{I["cadeado"]}</span></span>' if plano else '') + '</span>')
    return (f'<div aria-hidden="true" style="display:flex;align-items:center;justify-content:center;gap:{10 if movel else 6}px;flex:0 0 auto;">'
            f'{grupo(0)}{logo}{grupo(3)}</div>')


def _selo_libera(k):
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:4px;'
            f'box-shadow:inset 0 0 0 1px {k["input"]};color:{k["mfg"]};font-size:11.5px;font-weight:500;white-space:nowrap;">'
            f'{ic("cadeado", 11)}{T("tlLiberaEm")}</span>')


def _palco(k, cenario, movel=False):
    if cenario == 'volta':
        de = _cartao(k, 'tl-de', 'py', 'tlPyTrilha', 'tlPyMeta', 1, gelo='tlPyFeitas', movel=movel)
        para = _cartao(k, 'tl-para tl-volta', 'js', 'tlJsTrilha', 'tlJsMeta', 3, gelo='tlJsFeitas', balao='tlDeOndeParou', movel=movel)
        centro = _centro(k, 'py', 'js', movel)
    else:
        de = _cartao(k, 'tl-de', 'js', 'tlJsTrilha', 'tlJsMeta', 3, gelo='tlJsFeitas', movel=movel)
        if cenario == 'plano':
            para = _cartao(k, 'tl-para tl-nova', 'py', 'tlPyTrilha', 'tlPyMetaNova', 0, selo=_selo_libera(k), movel=movel)
        else:
            para = _cartao(k, 'tl-para tl-nova', 'py', 'tlPyTrilha', 'tlPyMetaNova', 0, nova=True, balao='tlComeceAqui', movel=movel)
        centro = _centro(k, 'js', 'py', movel, plano=cenario == 'plano')
    direcao = 'flex-direction:column;align-items:stretch;gap:8px;' if movel else 'align-items:center;gap:14px;'
    return f'<div style="display:flex;{direcao}">{de}{centro}{para}</div>'


h = lambda caminho: '{{' + caminho + '}}'
se = lambda chave, html, padrao=False: (f'<sc-if value="{h(chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                        f'{html}</sc-if>')


def _texto(k, tit, txt, movel=False):
    tam = 'font-size:21px;line-height:27px;' if movel else 'font-size:24px;line-height:30px;'
    return (f'<div class="tl-texto" style="display:flex;flex-direction:column;gap:8px;">'
            f'<h2 style="margin:0;{tam}font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};text-wrap:balance;">{T(tit)}</h2>'
            f'<p style="margin:0;font-size:14.5px;line-height:22px;color:{k["fg"]};text-wrap:pretty;">{T(txt)}</p></div>')


def _botao_seta(txt, k, alt, largura=None, acao=None):
    # o principal com a seta depois do texto, como o Button do DS
    b = botao(txt, k, 'solid', alt, largura=largura, acao=acao)
    return b[:-len('</button>')] + ic('seta', 15) + '</button>'


def _rodape(k, principal, secundario, link=None, movel=False):
    # no modal: o link do Pro à esquerda, os botões à direita; na folha, o principal em largura cheia em cima
    if movel:
        return (f'<div style="display:flex;flex-direction:column;align-items:stretch;gap:6px;">{principal}{secundario}'
                + (f'<a href="Planos__SUF__.dc.html" style="align-self:center;padding-top:6px;font-size:13.5px;font-weight:500;">{T(link)}</a>' if link else '')
                + '</div>')
    esq = f'<a href="Planos__SUF__.dc.html" style="font-size:13.5px;font-weight:500;">{T(link)}</a>' if link else ''
    return (f'<div style="display:flex;align-items:center;gap:10px;">{esq}<span style="flex:1;"></span>{secundario}{principal}</div>')


def _fases(k, cenario, movel=False):
    alt = 48 if movel else 40
    alt2 = 44 if movel else 40
    larg = '100%' if movel else None
    if cenario == 'plano':
        return (_texto(k, 'tlPlanoTit', 'tlPlanoTxt', movel)
                + f'<p style="margin:-6px 0 0;font-size:13.5px;color:{k["mfg"]};">{T("tlPlanoPro")}</p>'
                + _rodape(k, botao(T('tlFicarJs'), k, 'solid', alt, largura=larg),
                          botao_link(T('tlVerPro'), 'Planos__SUF__.dc.html', k, 'outline', alt2, largura=larg), movel=movel))
    ida = cenario == 'ida'
    confirmar = (_texto(k, 'tlIdaTit' if ida else 'tlVoltaTit', 'tlIdaTxt' if ida else 'tlVoltaTxt', movel)
                 + _rodape(k, _botao_seta(T('tlTrocarPy' if ida else 'tlVoltarJs'), k, alt, larg, 'tlTrocar'),
                           botao(T('tlFicarJs' if ida else 'tlFicarPy'), k, 'ghost', alt2, largura=larg), 'tlProLink', movel))
    trocando = (f'<div role="status" style="display:contents;">'
                + _texto(k, 'tlIdaTrocandoTit' if ida else 'tlVoltaTrocandoTit', 'tlIdaTrocandoTxt' if ida else 'tlVoltaTrocandoTxt', movel)
                + '</div>')
    concluido = (_texto(k, 'tlIdaFimTit' if ida else 'tlVoltaFimTit', 'tlIdaFimTxt' if ida else 'tlVoltaFimTxt', movel)
                 + _rodape(k, botao_link(T('tlComecar' if ida else 'tlContinuar'), 'Trilha__SUF__.dc.html', k, 'solid', alt, 'seta', larg), '', movel=movel))
    return se('tl.confirmar', confirmar, True) + se('tl.trocando', trocando) + se('tl.concluido', concluido)


def _classe_fase(cenario):
    return 'tl-plano' if cenario == 'plano' else 'tl-' + h('tl.fase')


def _modal(k, cenario):
    return (f'<section role="dialog" aria-modal="true" aria-label="{T("tlRotulo")}" class="tl-entra {_classe_fase(cenario)}" '
            f'style="width:720px;max-width:calc(100% - 32px);display:flex;flex-direction:column;gap:22px;padding:26px 32px 28px;'
            f'border-radius:18px;background:{k["card"]};box-shadow:0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px {k["border"]};">'
            f'{rotulo(T("tlRotulo"), k["mfg"])}{_palco(k, cenario)}'
            f'<div style="display:flex;flex-direction:column;gap:18px;min-height:156px;">{_fases(k, cenario)}</div></section>')


def tela_troca(k, sufixo, cenario):
    # por cima de Trilhas, o véu das boas-vindas: desfoca a janela inteira, o menu junto
    fundo = tela_trilhas(k, sufixo)
    assert fundo.endswith('</div>')
    veu = (f'<div class="tl-veu" style="position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;'
           f'background:color-mix(in oklch, {k["bg"]} 45%, transparent);backdrop-filter:blur(14px) saturate(115%);'
           f'-webkit-backdrop-filter:blur(14px) saturate(115%);">{_modal(k, cenario)}</div>')
    return fundo[:-len('</div>')] + veu + '</div>'


def tela_troca_movel(k):
    # no celular, a folha que sobe de baixo; os cartões empilham e as setas descem de um para o outro
    folha = (f'<section role="dialog" aria-modal="true" aria-label="{T("tlRotulo")}" class="tl-folha {_classe_fase("ida")}" '
             f'style="position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;flex-direction:column;gap:16px;'
             f'padding:10px {PAD + 4}px 28px;border-radius:20px 20px 0 0;background:{k["card"]};box-shadow:{k["sombraFlut"]};">'
             f'<span style="align-self:center;width:40px;height:4px;border-radius:999px;background:{k["input"]};"></span>'
             f'{rotulo(T("tlRotulo"), k["mfg"])}{_palco(k, "ida", movel=True)}'
             f'<div style="display:flex;flex-direction:column;gap:16px;min-height:200px;">{_fases(k, "ida", movel=True)}</div></section>')
    pagina = (f'<main style="padding:18px {PAD}px;display:flex;flex-direction:column;gap:16px;">'
              f'<h1 style="margin:0;font-size:24px;line-height:30px;font-weight:600;color:{k["fgs"]};">{T("trTitulo")}</h1>'
              + ''.join(_cartao_trilha(k, *t) for t in TRILHAS_JS[:3]) + '</main>')
    return (f'{raiz_movel(k, ALTURA_MOVEL, "display:flex;flex-direction:column;")}{topo_movel(k, T("trTitulo"))}{pagina}'
            f'<div class="tl-veu" style="position:absolute;inset:0;z-index:4;background:color-mix(in oklch, {k["bg"]} 45%, transparent);'
            f'backdrop-filter:blur(14px) saturate(115%);-webkit-backdrop-filter:blur(14px) saturate(115%);"></div>{folha}</div>')
