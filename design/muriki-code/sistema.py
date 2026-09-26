# ── Páginas de sistema do hub ─────────────────────────────────────────────
# Sem internet, página não encontrada (404), erro inesperado (500), sessão expirada (401) e
# manutenção (503) — as mesmas no Code, no Backoffice e no Platform; muda só o nome do produto.
#
# A linguagem é a do login: o fundo com a atmosfera da marca (o azul no canto de cima, o amarelo
# embaixo), o título editorial em duas linhas com a segunda no azul, a legenda mono com o filete.
# À direita, o palco: o código gigante com o mascote no lugar do zero, com a cara do que houve e
# a boca triste — X sem internet, a interrogação no 404, a espiral de tonto no erro, o cadeado na
# sessão expirada (401) e o alerta de pontas arredondadas na manutenção (503). As caras moram em
# design/logo-*.svg, feitas das camadas do logo. Nenhuma culpa a pessoa, e toda tela diz o que
# fazer agora.
from base import *  # noqa: F401,F403
from base import _logo

CARAS = {nome: _logo(nome) for nome in ('x', 'interrogacao', 'tonto', 'cadeado', 'alerta')}

# qual: (rótulo, linha A, linha B, texto, código do palco, cara do mascote)
PAGINAS = {
    'offline': ('offRot', 'offA', 'offB', 'offTxt', 'OFF', 'x'),
    '404': ('naoRot', 'naoA', 'naoB', 'naoTxt', '404', 'interrogacao'),
    '500': ('erroRot', 'erroA', 'erroB', 'erroTxt', '500', 'tonto'),
    'sessao': ('sessaoRot', 'sessaoA', 'sessaoB', 'sessaoTxt', '401', 'cadeado'),
    'manutencao': ('manRot', 'manA', 'manB', 'manTxt', '503', 'alerta'),
}


def _fundo(k):
    return (f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;'
            f'background:linear-gradient(to bottom right, color-mix(in oklch, {k["pri"]} 12%, transparent), transparent 45%);"></div>'
            f'<div aria-hidden="true" style="position:absolute;top:-160px;left:-120px;width:620px;height:620px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["pri"]} 18%, transparent);filter:blur(170px);pointer-events:none;"></div>'
            f'<div aria-hidden="true" style="position:absolute;right:-120px;bottom:-180px;width:560px;height:560px;border-radius:999px;'
            f'background:color-mix(in oklch, {k["accent"]} 26%, transparent);filter:blur(140px);pointer-events:none;"></div>')


def _palco(k, codigo, olhos):
    # o mascote é o zero: todo código tem um 0 ou um O (4-0-4, 5-0-0, 4-0-1, 5-0-3, O-FF), e ele
    # entra no lugar desse caractere, na altura dos dígitos e um pouco de lado. Os outros dígitos são
    # cheios, num tom leve da marca: o número é o elemento forte da tela, não um rascunho.
    i = codigo.index('0') if '0' in codigo else codigo.index('O')
    partes = ''
    for j, c in enumerate(codigo):
        if j == i:
            partes += (f'<span style="display:flex;width:222px;height:208px;flex:0 0 auto;margin:0 2px;transform:rotate(-6deg);">'
                       f'{CARAS[olhos]}</span>')
        else:
            partes += (f'<span style="font-family:{FONTE};font-size:260px;line-height:190px;height:190px;font-weight:600;'
                       f'letter-spacing:-0.04em;color:color-mix(in oklch, {k["pri"]} 18%, transparent);">{c}</span>')
    return (f'<div aria-hidden="true" style="display:flex;align-items:flex-end;justify-content:center;flex:0 0 auto;">'
            f'{partes}</div>')


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
            # duas colunas: o texto à esquerda, o palco centrado na metade da direita, seja qual for a largura do código
            f'<main style="position:relative;z-index:1;flex:1;min-height:0;display:grid;grid-template-columns:560px minmax(0,1fr);'
            f'align-items:center;gap:40px;padding:0 64px 0 120px;">{texto}'
            f'<div style="display:flex;justify-content:center;min-width:0;">{_palco(k, codigo, olhos)}</div></main>{rodape}</div>')


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
