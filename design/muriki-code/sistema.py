# ── Páginas de sistema ────────────────────────────────────────────────────
# Sem internet, página não encontrada (404), erro inesperado (500), sessão expirada e manutenção.
# Todas no formato do acesso suspenso (o notice-page do DS): fora do rail, pouco conteúdo no
# centro, um ícone no círculo tingido, o título, uma frase e a saída. Nenhuma culpa a pessoa;
# toda uma diz o que fazer agora. O erro mostra o código (o requestId da API) para o suporte.
from base import *  # noqa: F401,F403


def _aviso(k, icone, tom, tit, txt, acoes, rodape='', email='rafael@moura.dev'):
    fundo, cor = {'neutro': (k['sunken'], k['mfg']), 'atencao': (k['tyellow'], k['tyellowfg']),
                  'erro': (k['tred'], k['tredfg'])}[tom]
    corpo = (f'<div role="status" style="display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;">'
             f'<span style="display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:999px;'
             f'background:{fundo};color:{cor};">{ic(icone, 28)}</span>'
             f'<div style="display:flex;flex-direction:column;gap:10px;max-width:460px;">'
             f'<h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{T(tit)}</h1>'
             f'<p style="margin:0;font-size:15px;line-height:23px;color:{k["mfg"]};">{T(txt)}</p></div>'
             f'<div style="display:flex;flex-direction:column;align-items:stretch;gap:8px;width:320px;">{acoes}</div>'
             f'{rodape}</div>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code", email)}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px 80px;">'
            f'{corpo}</main></div>')


def _principal(k, txt, href='#', icone=None):
    g = ic(icone, 15) if icone else ''
    return (f'<a href="{href}" style="display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:11px;'
            f'background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;">{g}{T(txt)}</a>')


def _saida(k, txt, href='#', icone=None):
    g = ic(icone, 15) if icone else ''
    return (f'<a href="{href}" style="display:flex;align-items:center;justify-content:center;gap:8px;height:40px;border-radius:10px;'
            f'color:{k["mfg"]};font-size:14px;font-weight:500;">{g}{T(txt)}</a>')


def _nota(k, html):
    return f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{html}</p>'


def tela_sistema(k, qual, sufixo):
    inicio = f'Inicio{sufixo}.dc.html'
    if qual == 'offline':
        return _aviso(k, 'semrede', 'neutro', 'offTit', 'offTxt', _principal(k, 'tentar', icone='recarregar'),
                      _nota(k, T('offNota')))
    if qual == '404':
        return _aviso(k, 'bussola', 'neutro', 'naoTit', 'naoTxt',
                      _principal(k, 'irInicio', inicio) + _saida(k, 'voltar'),
                      _nota(k, f'<code style="font-family:{MONO};font-size:12.5px;color:{k["mfg"]};">muriki.dev/code/trilhas/typescrpt</code>'))
    if qual == '500':
        return _aviso(k, 'aviso', 'atencao', 'erroTit', 'erroTxt',
                      _principal(k, 'tentar', icone='recarregar') + _saida(k, 'irInicio', inicio),
                      _nota(k, f'{T("erroCodigo")}: <b style="font-family:{MONO};font-weight:500;color:{k["fgs"]};">req_7f3a91c2</b> · '
                               f'<a href="#">{T("suporte")}</a>'))
    if qual == 'sessao':
        # a sessão acabou: não há conta no topo, a pessoa não está mais conectada
        return _aviso(k, 'relogio', 'neutro', 'sessaoTit', 'sessaoTxt', _principal(k, 'entrar', f'Entrar{sufixo}.dc.html'), email='')
    return _aviso(k, 'engrenagem', 'atencao', 'manTit', 'manTxt', _principal(k, 'tentar', icone='recarregar'))


SISTEMA_TELAS = {'sem_internet': 'offline', 'nao_encontrada': '404', 'erro': '500', 'sessao': 'sessao', 'manutencao': 'manutencao'}
