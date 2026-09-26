# ── Páginas de sistema do hub ─────────────────────────────────────────────
# Sem internet, página não encontrada (404), erro inesperado (500), sessão expirada (401) e
# manutenção (503) — as mesmas no Code, no Backoffice e no Platform; muda só o nome do produto.
#
# A linguagem é a do login: o fundo com a atmosfera da marca (o azul no canto de cima, o amarelo
# embaixo), o título editorial em duas linhas com a segunda no azul, a legenda mono com o filete.
# À direita, o palco: o código gigante vazado e o mascote na frente — de olhos abertos quando
# procura (404, 500), fechados quando dorme (sem internet, manutenção, sessão). Nenhuma culpa a
# pessoa, e toda tela diz o que fazer agora.
from base import *  # noqa: F401,F403

# qual: (rótulo, linha A, linha B, texto, código do palco, olhos, tom da legenda)
PAGINAS = {
    'offline': ('offRot', 'offA', 'offB', 'offTxt', 'OFF', 'fechado'),
    '404': ('naoRot', 'naoA', 'naoB', 'naoTxt', '404', 'aberto'),
    '500': ('erroRot', 'erroA', 'erroB', 'erroTxt', '500', 'aberto'),
    'sessao': ('sessaoRot', 'sessaoA', 'sessaoB', 'sessaoTxt', '401', 'fechado'),
    'manutencao': ('manRot', 'manA', 'manB', 'manTxt', '503', 'fechado'),
}


def _fundo(k):
    return (f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;'
            f'background:linear-gradient(to bottom right, color-mix(in oklch, {k["pri"]} 12%, transparent), transparent 45%);"></div>'
            f'<div aria-hidden="true" style="position:absolute;top:-160px;left:-120px;width:620px;height:620px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["pri"]} 18%, transparent);filter:blur(170px);pointer-events:none;"></div>'
            f'<div aria-hidden="true" style="position:absolute;right:-120px;bottom:-180px;width:560px;height:560px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["accent"]} 26%, transparent);filter:blur(140px);pointer-events:none;"></div>')


def _palco(k, codigo, olhos):
    mascote = LOGO if olhos == 'aberto' else LOGO_FECHADO
    return (f'<div aria-hidden="true" style="position:relative;width:620px;height:520px;flex:0 0 auto;display:flex;'
            f'align-items:center;justify-content:center;">'
            # o código vazado: filete na cor da marca, sem preenchimento, atrás de tudo
            f'<span style="position:absolute;top:40px;left:0;right:0;text-align:center;font-family:{FONTE};font-size:300px;line-height:1;'
            f'font-weight:600;letter-spacing:-0.06em;color:transparent;'
            f'-webkit-text-stroke:1.5px color-mix(in oklch, {k["pri"]} 45%, transparent);">{codigo}</span>'
            # a sombra no chão e o mascote na frente, meio de lado
            f'<span style="position:absolute;bottom:58px;left:50%;width:220px;height:26px;transform:translateX(-50%);border-radius:999px;'
            f'background:color-mix(in oklch, {k["fgs"]} 14%, transparent);filter:blur(10px);"></span>'
            f'<span style="position:absolute;bottom:64px;left:50%;width:230px;height:216px;display:flex;'
            f'transform:translateX(-50%) rotate(-6deg);">{mascote}</span></div>')


def _botao(k, txt, href='#'):
    # o botão do login: o rótulo à esquerda, a seta num círculo à direita
    return (f'<a href="{href}" style="display:inline-flex;align-items:center;justify-content:space-between;gap:28px;height:48px;'
            f'padding:0 10px 0 22px;border-radius:12px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;'
            f'letter-spacing:0.02em;">{T(txt)}<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;'
            f'border-radius:999px;background:color-mix(in oklch, {k["prifg"]} 15%, transparent);">{ic("seta", 14)}</span></a>')


def _secundario(k, txt, href='#'):
    return (f'<a href="{href}" style="display:inline-flex;align-items:center;height:48px;padding:0 16px;border-radius:12px;'
            f'color:{k["fgs"]};font-size:15px;font-weight:500;">{T(txt)}</a>')


def tela_sistema(k, qual, sufixo, produto='code', idiomas=True, email='rafael@moura.dev'):
    rot, a, b, txt, codigo, olhos = PAGINAS[qual]
    inicio = f'Inicio{sufixo}.dc.html'
    acoes, nota = {
        'offline': (_botao(k, 'tentar'), f'{ic("relogio", 14)}<span>{T("offNota")}</span>'),
        '404': (_botao(k, 'irInicio', inicio) + _secundario(k, 'voltar'),
                f'<code style="font-family:{MONO};font-size:12px;">muriki.dev/{produto}/trilhas/typescrpt</code>'),
        '500': (_botao(k, 'tentar') + _secundario(k, 'irInicio', inicio),
                f'<span>{T("erroCodigo")}</span><code style="font-family:{MONO};font-size:12px;color:{k["fgs"]};">req_7f3a91c2</code>'
                f'<span style="color:{k["input"]};">·</span><a href="#">{T("suporte")}</a>'),
        'sessao': (_botao(k, 'entrar', f'Entrar{sufixo}.dc.html'), ''),
        'manutencao': (_botao(k, 'tentar'), f'<a href="#">{T("status")}</a>'),
    }[qual]

    topo_ = (f'<header style="position:relative;z-index:1;display:flex;align-items:center;gap:12px;height:72px;padding:0 56px;">'
             f'<span style="display:flex;width:32px;height:32px;">{LOGO}</span>{legenda(f"muriki / {produto}", k)}'
             f'<span style="margin-left:auto;display:flex;align-items:center;gap:4px;">'
             + (botao_idioma(k) if idiomas else '') + botao_tema(k)
             + (f'<span style="width:1px;height:20px;margin:0 10px;background:{k["input"]};"></span>'
                f'<span style="font-size:13px;color:{k["mfg"]};">{email}</span>' if email else '')
             + '</span></header>')
    texto = (f'<div style="display:flex;flex-direction:column;gap:26px;width:560px;flex:0 0 auto;">'
             f'<div style="display:flex;align-items:center;gap:12px;">{legenda(T(rot), k, "0.3em")}'
             f'<span style="height:1px;width:64px;background:{k["pri"]};"></span></div>'
             f'<h1 style="margin:0;font-size:72px;line-height:0.95;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
             f'{T(a)}<br><span style="color:{k["pri"]};">{T(b)}</span></h1>'
             f'<p style="margin:0;max-width:440px;font-size:17px;line-height:1.6;color:{k["mfg"]};">{T(txt)}</p>'
             f'<div style="display:flex;align-items:center;gap:6px;padding-top:6px;">{acoes}</div>'
             + (f'<p style="margin:0;display:flex;align-items:center;gap:8px;font-size:13px;color:{k["mfg"]};">{nota}</p>' if nota else '')
             + '</div>')
    rodape = (f'<footer style="position:relative;z-index:1;display:flex;align-items:center;height:64px;padding:0 56px;">'
              f'{legenda(T("direitos"), k)}</footer>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{_fundo(k)}{topo_}'
            f'<main style="position:relative;z-index:1;flex:1;min-height:0;display:flex;align-items:center;justify-content:space-between;'
            f'gap:40px;padding:0 56px 0 120px;">{texto}{_palco(k, codigo, olhos)}</main>{rodape}</div>')


# id da tela → (página, produto, com seletor de idioma, conta no topo)
SISTEMA_TELAS = {
    'sem_internet': ('offline', 'code', True, 'rafael@moura.dev'),
    'nao_encontrada': ('404', 'code', True, 'rafael@moura.dev'),
    'erro': ('500', 'code', True, 'rafael@moura.dev'),
    'sessao': ('sessao', 'code', True, ''),
    'manutencao': ('manutencao', 'code', True, ''),
    # a mesma página no Backoffice: só pt-BR e a conta da equipe
    'nao_encontrada_backoffice': ('404', 'backoffice', False, 'ana.lima@muriki.app'),
}
