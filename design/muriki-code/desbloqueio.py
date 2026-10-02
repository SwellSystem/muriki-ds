# ── Trilha bloqueada e ganho de trilha ──────────────────────────────────
# A regra (swell-docs/muriki-api/ideas/2026-10-01-desbloqueio-de-trilha.md): desbloqueio suave. A trilha
# acima do nível da pessoa aparece bloqueada, com o caminho até lá, e ainda abre (com o aviso above_level);
# nada trava. Quando o nível alcança o startTier, a pessoa vê uma vez o momento de ganho. Quem já começa no
# nível não vê desbloqueio. Nunca comparação com outras pessoas.
#
# Os quadros seguem o app de hoje (Trilhas com "Por onde começar" e os cartões com o chip de linguagem), com
# as trilhas e as etapas reais do conteúdo. O mapa é um caminho simplificado: o TrailMap do DS não roda aqui.
from base import *
from movel_code import WM, PAD, raiz_movel, topo_movel

ALTURA_MOVEL = 844

# O movimento conta a história do ganho, em ordem: o véu e o diálogo entram, o mascote salta e flutua, os
# brilhos piscam, o selo "libera em Pleno" sai e o "liberada" entra, e o traço de Pleno da escala se enche.
# No cartão liberado, um anel pulsa duas vezes; no aviso above_level, só uma entrada discreta. Com
# prefers-reduced-motion nada se mexe e o estado final aparece direto.
CSS_DESBLOQUEIO = (
    '\n@keyframes db-veu{from{opacity:0;}to{opacity:1;}}'
    '\n@keyframes db-entra{from{opacity:0;transform:translateY(16px) scale(0.96);}to{opacity:1;transform:none;}}'
    '\n@keyframes db-mascote{0%{opacity:0;transform:scale(0.6) rotate(-8deg);}60%{opacity:1;transform:scale(1.08) rotate(3deg);}100%{opacity:1;transform:none;}}'
    '\n@keyframes db-flutua{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}'
    '\n@keyframes db-halo{from{opacity:0;transform:scale(0.7);}to{opacity:1;transform:none;}}'
    '\n@keyframes db-brilho{0%,100%{opacity:0.25;transform:scale(0.6);}50%{opacity:1;transform:scale(1);}}'
    '\n@keyframes db-sai{to{opacity:0;transform:translateY(-6px);}}'
    '\n@keyframes db-surge{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}'
    '\n@keyframes db-enche{from{width:0;}to{width:100%;}}'
    '\n@keyframes db-anel{from{box-shadow:0 0 0 0 color-mix(in oklch, var(--pri) 45%, transparent), var(--sombra);}to{box-shadow:0 0 0 14px transparent, var(--sombra);}}'
    '\n@keyframes db-aviso{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:none;}}'
    '\n.mc .db-veu{animation:db-veu .3s ease-out both;}'
    '\n.mc .db-modal{animation:db-entra .5s cubic-bezier(.2,.8,.2,1) .1s both;}'
    '\n.mc .db-mascote{animation:db-mascote .7s cubic-bezier(.2,.8,.2,1) .35s both, db-flutua 3.2s ease-in-out 1.2s infinite;}'
    '\n.mc .db-halo{animation:db-halo .6s ease-out .3s both;}'
    '\n.mc .db-brilho{animation:db-brilho 1.8s ease-in-out infinite both;}'
    '\n.mc .db-antes{grid-area:1/1;animation:db-sai .3s ease-in 1.1s both;}'
    '\n.mc .db-depois{grid-area:1/1;animation:db-surge .35s ease-out 1.35s both;}'
    '\n.mc .db-enche{animation:db-enche .6s cubic-bezier(.2,.8,.2,1) 1.4s both;}'
    '\n.mc .db-anel{animation:db-anel 1.1s ease-out 1.8s 2;}'
    '\n.mc .db-aviso{animation:db-aviso .4s ease-out .2s both;}'
    '\n@media (prefers-reduced-motion: reduce){.mc .db-veu,.mc .db-modal,.mc .db-mascote,.mc .db-halo,.mc .db-brilho,'
    '.mc .db-depois,.mc .db-enche,.mc .db-anel,.mc .db-aviso{animation:none;}.mc .db-antes{display:none !important;}}')

# os cubos da Arquitetura (Streamline Color, CC BY 4.0), o mesmo brand="architecture" do BrandLogo do DS
_CUBOS = '''<path fill="#d7e0ff" fill-rule="evenodd" d="M.65 8.074v3.62l3.167 1.357l3.167-1.357l3.166 1.357l3.167-1.357v-3.62l-.008-.003l-3.159 1.353l-3.166-1.357l3.166-1.35l.002-3.621l-.002.026L6.983 4.48L3.82 3.123l-.002 3.594l3.167 1.35l-3.167 1.359z" clip-rule="evenodd"/><path fill="#fff" d="m6.985 1.738l3.167 1.357l-.002.027l-3.167 1.357l-3.166-1.357l.002-.027zm3.165 4.979l3.158 1.354l-3.158 1.353l-3.166-1.357l-3.167 1.359L.65 8.074l3.167-1.357l3.167 1.35z"/><path stroke="#4147d5" stroke-linecap="round" stroke-linejoin="round" d="m.65 8.067l3.167 1.357l3.167-1.357M3.817 3.122l3.166 1.357l3.167-1.357"/><path stroke="#4147d5" stroke-linecap="round" stroke-linejoin="round" d="m6.983 8.067l3.167 1.357l3.167-1.357M.65 11.694v-3.62l3.167-1.357l3.167 1.357v3.62L3.817 13.05z"/><path stroke="#4147d5" stroke-linecap="round" stroke-linejoin="round" d="M3.819 6.715v-3.62l3.166-1.357l3.167 1.357v3.62L6.985 8.072zm3.164 4.979v-3.62l3.167-1.357l3.167 1.357v3.62L10.15 13.05zM3.817 9.426v3.625m6.335-3.625v3.625M6.983 4.48v3.624"/>'''


def logo_js(tam=16):
    return (f'<span aria-hidden="true" style="display:flex;align-items:flex-end;justify-content:flex-end;width:{tam}px;height:{tam}px;'
            f'flex:0 0 auto;background:#F7DF1E;color:#000;font-family:{MONO};font-weight:700;font-size:{tam * 0.5:.0f}px;'
            f'line-height:1;padding:0 1px 1px 0;box-sizing:border-box;">JS</span>')


def logo_arq(tam=16):
    return f'<svg viewBox="0 0 14 14" width="{tam}" height="{tam}" aria-hidden="true" style="display:block;flex:0 0 auto;">{_CUBOS}</svg>'


def chip_ling(k, logo, nome):
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px 0 5px;border-radius:4px;'
            f'background:{k["tgray"]};color:{k["tgrayfg"]};font-size:11.5px;font-weight:500;white-space:nowrap;">{logo}{nome}</span>')


def _cadeado_badge(k):
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:4px;'
            f'box-shadow:inset 0 0 0 1px {k["input"]};color:{k["mfg"]};font-size:11.5px;font-weight:500;white-space:nowrap;">'
            f'{ic("cadeado", 11)}{T("liberaEm")}</span>')


def _liberada_badge(k):
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:4px;'
            f'background:{k["tgreen"]};color:{k["tgreenfg"]};font-size:11.5px;font-weight:500;white-space:nowrap;">'
            f'{ic("check", 11)}{T("liberadaSelo")}</span>')


def _selo_trocando(k):
    # o cadeado sai e o "liberada" entra no mesmo lugar (as duas camadas na mesma célula do grid)
    return (f'<span style="display:inline-grid;align-items:center;">'
            f'<span class="db-antes" style="display:flex;">{_cadeado_badge(k)}</span>'
            f'<span class="db-depois" style="display:flex;">{_liberada_badge(k)}</span></span>')


def _escala_enchendo(k, larg=18):
    # Junior cheio; o traço de Pleno se enche (o startTier); Senior vazio
    seg = lambda conteudo='': (f'<span style="position:relative;width:{larg}px;height:6px;border-radius:2px;overflow:hidden;'
                               f'background:{k["sunken"]};">{conteudo}</span>')
    cheio = f'<span style="position:absolute;inset:0;background:{k["pri"]};"></span>'
    enche = f'<span class="db-enche" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:{k["pri"]};"></span>'
    return f'<span style="display:flex;gap:3px;align-items:center;">{seg(cheio)}{seg(cheio)}{seg(enche)}{seg()}</span>'


def _caminho_mini(k, largura=520, altura=150, ate=0, total=4):
    # o caminho do "Por onde começar": estrada simples com as estações e o mascote na de agora
    xs = [40 + i * (largura - 120) / (total - 1) for i in range(total)]
    ys = [altura * 0.62, altura * 0.68, altura * 0.6, altura * 0.66]
    estrada = f'<path d="M{xs[0]:.0f} {ys[0]:.0f}' + ''.join(f' L{x:.0f} {y:.0f}' for x, y in zip(xs[1:], ys[1:])) + f' L{largura - 40} {altura * 0.58:.0f}" fill="none" stroke="var(--sunken)" stroke-width="12" stroke-linecap="round"/>'
    pontos = ''.join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{9 if i == ate else 7}" fill="var(--card)" stroke="var(--{"pri" if i == ate else "input"})" stroke-width="2.5"/>'
                     for i, (x, y) in enumerate(zip(xs, ys)))
    bandeira = (f'<path d="M{largura - 40} {altura * 0.58 - 34:.0f} V{altura * 0.58:.0f}" stroke="var(--fgs)" stroke-width="2"/>'
                f'<path d="M{largura - 40} {altura * 0.58 - 34:.0f} h18 l-6 7 l6 7 h-18 z" fill="var(--accent)"/>')
    return (f'<div style="position:relative;width:{largura}px;height:{altura}px;border-radius:12px;background:{k["rail"]};'
            f'box-shadow:inset 0 0 0 1px {k["border"]};overflow:hidden;flex:0 0 auto;">'
            f'<svg viewBox="0 0 {largura} {altura}" width="{largura}" height="{altura}" aria-hidden="true" style="position:absolute;inset:0;">'
            f'{estrada}{pontos}{bandeira}</svg>'
            f'<span style="position:absolute;left:{xs[ate] - 15:.0f}px;top:{ys[ate] - 44:.0f}px;display:flex;width:30px;height:30px;">{LOGO}</span></div>')


TRILHAS = [
    # (logo, chave do nome da linguagem, trilha, público, estado, (feitas, total))
    ('js', 'jsNome', 'JavaScript do zero', 'Nunca programou, ou vem de produto e quer escrever o próprio código', 'andamento', (3, 12)),
    ('js', 'jsNome', 'JavaScript idiomático', 'Já usa JavaScript no trabalho e quer fechar os buracos', 'livre', None),
    ('js', 'jsNome', 'JavaScript para quem vem de outra linguagem', 'Programa em outra linguagem (Go, Python, Java) e quer o que é diferente em JavaScript', 'livre', None),
    ('arq', 'arqNome', 'Arquitetura de sistemas', 'Já programa com autonomia e quer desenhar como as peças de um sistema web conversam', 'bloqueada', None),
]


def _cartao_trilha(k, logo, ling, nome, publico, estado, prog, href='#'):
    marca = logo_js(14) if logo == 'js' else logo_arq(14)
    topo = (f'<div style="display:flex;align-items:center;gap:8px;">{chip_ling(k, marca, T(ling))}'
            + (f'<span style="margin-left:auto;">{_cadeado_badge(k)}</span>' if estado == 'bloqueada' else '') + '</div>')
    corpo = (f'<div style="display:flex;flex-direction:column;gap:6px;">'
             f'<span style="font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{nome}</span>'
             f'<span style="font-size:13.5px;line-height:20px;color:{k["mfg"]};">{publico}</span></div>')
    if estado == 'bloqueada':
        # o caminho até o startTier, numa linha: o nível que libera, a escala e o que falta
        caminho = (f'<div style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:10px;background:{k["sunken"]};">'
                   f'<span style="font-size:12.5px;font-weight:500;color:{k["fgs"]};">{T("paraLiberar")}</span>'
                   f'<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">{escala(2, k, 14)}'
                   f'<span style="font-size:12px;color:{k["mfg"]};">{T("faltam")} · Compor funções · Event loop e ordem de execução · {T("maisDuas")}</span></span></div>')
        pe = (f'<a href="DesbloqueioTrilha__SUF__.dc.html" style="display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;'
              f'color:{k["mfg"]};">{T("abrirMesmo")}{ic("seta", 14)}</a>')
        return (f'<div style="display:flex;flex-direction:column;gap:12px;padding:18px 20px;border-radius:12px;background:{k["card"]};'
                f'box-shadow:{k["sombra"]};min-width:0;">{topo}{corpo}{caminho}<div style="margin-top:auto;">{pe}</div></div>')
    if estado == 'liberada':
        topo = (f'<div style="display:flex;align-items:center;gap:8px;">{chip_ling(k, marca, T(ling))}'
                f'<span style="margin-left:auto;">{_liberada_badge(k)}</span></div>')
        pe = f'<span style="display:flex;justify-content:flex-end;font-size:13.5px;font-weight:500;color:{k["pri"]};">{T("comecar")}</span>'
        return (f'<a href="{href}" class="db-anel" style="display:flex;flex-direction:column;gap:12px;padding:18px 20px;border-radius:12px;'
                f'background:{k["card"]};box-shadow:{k["sombra"]};color:inherit;min-width:0;">{topo}{corpo}<div style="margin-top:auto;">{pe}</div></a>')
    if prog:
        feitas, total = prog
        pe = (f'<div style="display:flex;align-items:center;gap:12px;">'
              f'<span style="flex:1;height:6px;border-radius:3px;background:{k["sunken"]};overflow:hidden;">'
              f'<span style="display:block;width:{feitas / total * 100:.0f}%;height:100%;background:{k["pri"]};"></span></span>'
              f'<span style="font-family:{MONO};font-size:11.5px;color:{k["mfg"]};">{feitas} {T("de")} {total} {T("feitasDe")}</span>'
              f'<span style="font-size:13.5px;font-weight:500;color:{k["pri"]};">{T("continuar")}</span></div>')
    else:
        pe = f'<span style="display:flex;justify-content:flex-end;font-size:13.5px;font-weight:500;color:{k["pri"]};">{T("comecar")}</span>'
    return (f'<a href="{href}" style="display:flex;flex-direction:column;gap:12px;padding:18px 20px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombra"]};color:inherit;min-width:0;">{topo}{corpo}<div style="margin-top:auto;">{pe}</div></a>')


def _cabecalho_trilhas(k):
    return (f'<header style="display:flex;flex-direction:column;gap:8px;">'
            f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("trTitulo")}</h1>'
            f'<p style="margin:0;max-width:640px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("trSub")}</p></header>')


def _destaque(k):
    return (f'<section style="display:flex;gap:28px;align-items:stretch;padding:20px 24px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
            f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">'
            f'<div style="display:flex;align-items:center;gap:10px;">{rotulo(T("porOnde"), k["mfg"])}'
            f'<span style="margin-left:auto;">{chip_ling(k, logo_js(14), T("jsNome"))}</span></div>'
            f'<h2 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">JavaScript do zero</h2>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["mfg"]};">Nunca programou, ou vem de produto e quer escrever o próprio código</p>'
            f'<div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;gap:18px;">'
            f'{botao(T("continuar"), k, "solid", 40, "seta")}'
            f'<a href="#" style="font-size:13.5px;font-weight:500;">{T("verBoasVindas")}</a></div></div>'
            f'<div style="display:flex;flex-direction:column;gap:8px;">'
            f'<div style="display:flex;align-items:center;">{rotulo(T("oCaminho"), k["mfg"])}'
            f'<a href="#" style="margin-left:auto;font-size:12.5px;">{T("verMapa")}</a></div>{_caminho_mini(k, ate=1)}</div></section>')


def _trilhas_corpo(k, liberada=False):
    trilhas = [t[:4] + ('liberada',) + t[5:] if liberada and t[4] == 'bloqueada' else t for t in TRILHAS]
    grade = ('<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">'
             + ''.join(_cartao_trilha(k, *t) for t in trilhas) + '</div>')
    return _cabecalho_trilhas(k) + _destaque(k) + grade


def tela_trilhas_bloqueada(k):
    return app(k, 'trilhas', _trilhas_corpo(k), gap=20)


# ── a trilha aberta mesmo assim: o aviso above_level ──
ETAPAS_ARQ = ['Cliente, API e banco de dados', 'Leituras rápidas com cópia', 'Trabalho lento em segundo plano']


def tela_trilha_acima(k):
    cab = (f'<header style="display:flex;flex-direction:column;gap:8px;">{voltar(k, T("voltarTrilhas"), "DesbloqueioTrilhas__SUF__.dc.html")}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">Arquitetura de sistemas</h1>'
           f'<div style="display:flex;align-items:center;gap:8px;">{chip_ling(k, logo_arq(14), T("arqNome"))}{_cadeado_badge(k)}</div></header>')
    # o aviso não é alarme: é o fato e o caminho. Fica no topo da trilha até a pessoa dispensar
    aviso = (f'<section role="note" class="db-aviso" style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:12px;'
             f'background:{k["prisub"]};box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["pri"]} 22%, transparent);">'
             f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;flex:0 0 auto;'
             f'background:{k["card"]};color:{k["pri"]};">{ic("bussola", 17)}</span>'
             f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
             f'<span style="font-size:14.5px;font-weight:600;color:{k["prisubfg"]};">{T("avisoTit")}</span>'
             f'<span style="max-width:720px;font-size:13.5px;line-height:20px;color:{k["fg"]};">{T("avisoTxt")}</span>'
             f'<div style="display:flex;align-items:center;gap:16px;padding-top:4px;">'
             f'<a href="Main__SUF__.dc.html" style="font-size:13.5px;font-weight:500;">{T("verCaminho")}</a>'
             f'<span style="font-size:13.5px;font-weight:500;color:{k["mfg"]};">{T("entendi")}</span></div></div></section>')
    linhas = ''.join(
        f'<li style="display:flex;align-items:center;gap:12px;min-height:44px;border-top:1px solid {k["muted"]};">'
        f'<span style="width:22px;height:22px;border-radius:999px;flex:0 0 auto;'
        + (f'box-shadow:inset 0 0 0 2.5px {k["pri"]};' if i == 0 else f'box-shadow:inset 0 0 0 1.5px {k["input"]};')
        + f'"></span><span style="flex:1;font-size:14px;color:{k["fgs"] if i == 0 else k["fg"]};">{nome}</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("aProxima") if i == 0 else T("depois")}</span></li>'
        for i, nome in enumerate(ETAPAS_ARQ))
    caminho = (f'<section style="display:flex;flex-direction:column;gap:4px;padding:16px 20px 10px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
               f'<div style="display:flex;align-items:center;gap:10px;padding-bottom:8px;">{rotulo(T("oCaminho"), k["mfg"])}'
               f'<span style="margin-left:auto;font-size:12px;color:{k["mfg"]};">{T("nivelPleno")} · {T("etapas3")}</span></div>'
               f'<ul style="margin:0;padding:0;list-style:none;">{linhas}</ul>'
               f'<div style="padding:14px 0 6px;">{botao(T("comecar"), k, "solid", 38, "seta")}</div></section>')
    return app(k, 'trilhas', cab + aviso + caminho, gap=20)


# ── o ganho de trilha: uma vez, quando o nível alcança o startTier ──
def _mascote_festa(tam=96):
    # o mascote de olhos abertos num halo da marca, com brilhos azul e amarelo; nada de confete solto
    brilho = lambda x, y, s, cor, atraso: (f'<span class="db-brilho" style="position:absolute;left:{x}%;top:{y}%;display:flex;width:{s}px;height:{s}px;'
                                           f'color:{cor};animation-delay:{atraso}s;">{I["brilho"]}</span>')
    return (f'<div style="position:relative;width:{tam + 56}px;height:{tam + 40}px;display:flex;align-items:center;justify-content:center;">'
            f'<span class="db-halo" style="position:absolute;inset:6px 14px;border-radius:999px;background:radial-gradient(circle, color-mix(in oklch, var(--accent) 34%, transparent) 0%, transparent 68%);"></span>'
            f'<span class="db-mascote" style="position:relative;display:flex;width:{tam}px;height:{tam}px;">{LOGO}</span>'
            + brilho(6, 14, 16, 'var(--accent)', 0.9) + brilho(84, 8, 12, 'var(--pri)', 1.2) + brilho(88, 70, 14, 'var(--accent)', 1.5) + brilho(2, 72, 10, 'var(--pri)', 1.0)
            + '</div>')


def _modal_liberada(k, largura=480):
    return (f'<div role="dialog" aria-modal="true" aria-labelledby="liberada-tit" class="db-modal" style="position:relative;width:{largura}px;max-width:100%;box-sizing:border-box;'
            f'display:flex;flex-direction:column;align-items:center;gap:12px;padding:28px 32px 26px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombraFlut"]};text-align:center;">{_mascote_festa()}'
            f'<span style="display:flex;align-items:center;gap:8px;">{rotulo(T("trilhaLiberada"), k["pri"])}</span>'
            f'<h2 id="liberada-tit" style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};text-wrap:balance;">{T("liberadaTit")}</h2>'
            f'<p style="margin:0;max-width:380px;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("liberadaTxt")}</p>'
            f'<div style="display:flex;align-items:center;gap:8px;padding:4px 0 6px;flex-wrap:wrap;justify-content:center;">'
            f'{chip_ling(k, logo_arq(14), T("arqNome"))}{_selo_trocando(k)}{_escala_enchendo(k)}'
            f'<span style="font-size:12px;color:{k["mfg"]};">{T("nivelPleno")} · {T("etapas3")}</span></div>'
            f'<div style="display:flex;flex-direction:column;align-items:stretch;gap:6px;width:100%;padding-top:6px;">'
            f'{botao(T("comecarTrilha"), k, "solid", 44, "seta")}{botao(T("agoraNao"), k, "ghost", 36)}</div></div>')


def tela_trilha_liberada(k):
    fundo = app(k, 'trilhas', _trilhas_corpo(k, liberada=True), gap=20)
    assert fundo.endswith('</div>')
    veu = (f'<div class="db-veu" style="position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:{k["veu"]};">'
           f'{_modal_liberada(k)}</div>')
    return fundo[:-len('</div>')] + veu + '</div>'


def tela_trilha_liberada_movel(k):
    # no celular, a mesma coisa numa folha que sobe de baixo, por cima do Início
    folha = (f'<div class="db-modal" style="position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;flex-direction:column;align-items:center;gap:12px;'
             f'padding:10px {PAD + 4}px 28px;border-radius:16px 16px 0 0;background:{k["card"]};box-shadow:{k["sombraFlut"]};text-align:center;">'
             f'<span style="width:36px;height:4px;border-radius:999px;background:{k["input"]};margin-bottom:4px;"></span>'
             f'{_mascote_festa(80)}{rotulo(T("trilhaLiberada"), k["pri"])}'
             f'<h2 style="margin:0;font-size:21px;line-height:27px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};text-wrap:balance;">{T("liberadaTit")}</h2>'
             f'<p style="margin:0;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("liberadaTxt")}</p>'
             f'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;">'
             f'{chip_ling(k, logo_arq(14), T("arqNome"))}{_selo_trocando(k)}{_escala_enchendo(k, 16)}</div>'
             f'<div style="display:flex;flex-direction:column;align-items:stretch;gap:6px;width:100%;padding-top:6px;">'
             f'{botao(T("comecarTrilha"), k, "solid", 48, "seta")}{botao(T("agoraNao"), k, "ghost", 44)}</div></div>')
    pagina = (f'<main style="padding:18px {PAD}px;display:flex;flex-direction:column;gap:16px;">'
              f'<h1 style="margin:0;font-size:24px;line-height:30px;font-weight:600;color:{k["fgs"]};">{T("trTitulo")}</h1>'
              + ''.join(_cartao_trilha(k, *t) for t in TRILHAS[:2]) + '</main>')
    return (f'{raiz_movel(k, ALTURA_MOVEL, "display:flex;flex-direction:column;")}{topo_movel(k, T("trTitulo"))}{pagina}'
            f'<div class="db-veu" style="position:absolute;inset:0;z-index:4;background:{k["veu"]};"></div>{folha}</div>')
