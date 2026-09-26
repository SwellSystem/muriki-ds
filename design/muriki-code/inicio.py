# ── Início no primeiro dia ────────────────────────────────────────────────
# A pessoa terminou o onboarding e ainda não praticou nada. A tela orienta o que fazer agora e
# mostra o que existe, sem virar vitrine: o próximo passo em destaque (o primeiro exercício), o
# que ela contou no primeiro acesso com "ajustar" (ou o convite, se pulou: GET
# /code/learning-profile 404), o mapa do Code com o que ainda vem "em breve", e os dois estados
# que se enchem com a prática — o perfil de competência e o plano em teste, numa linha só.
from base import *  # noqa: F401,F403

h = lambda caminho: '{{' + caminho + '}}'
se = lambda chave, html, padrao=False: (f'<sc-if value="{h(chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                        f'{html}</sc-if>')


def _chip(k, txt):
    return (f'<span style="display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;'
            f'background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;font-weight:500;">{txt}</span>')


def _em_breve(k, chave='emBreve'):
    return (f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;'
            f'color:{k["mfg"]};">{T(chave)}</span>')


def tela_inicio(k, sufixo):
    cab = cabecalho(k, None, T('titulo'), T('sub'))

    proximo = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("proximo"), k["mfg"])}'
        f'{badge("Testing · Debugging", k, "blue")}</div>'
        f'<div style="display:flex;flex-direction:column;gap:8px;">'
        f'<h2 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{T("exTitulo")}</h2>'
        f'<p style="margin:0;max-width:62ch;font-size:14px;line-height:21px;color:{k["mfg"]};">{T("exTxt")}</p></div>'
        f'<div style="display:flex;align-items:center;gap:10px;">'
        f'{botao_link(T("comecar"), f"PrimeiroExercicio{sufixo}.dc.html", k, "solid", 40, "seta")}'
        f'<button type="button" aria-disabled="true" style="display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 12px;border:0;'
        f'border-radius:10px;background:transparent;font-family:{FONTE};font-size:14px;color:{k["mfg"]};cursor:default;opacity:0.8;">'
        f'{T("trilha")}{_em_breve(k)}</button></div>', k, pad='22px 24px', extra='gap:16px;flex:1.6;min-width:0;')

    linha = lambda rot, valor: (f'<div style="display:flex;flex-direction:column;gap:6px;">{rotulo(rot, k["mfg"], 9.5)}'
                                f'<div style="display:flex;flex-wrap:wrap;gap:6px;">{valor}</div></div>')
    contou = (linha(T('nivel'), _chip(k, T('pleno')))
              + linha(T('linguas'), _chip(k, 'TypeScript') + _chip(k, 'Python'))
              + linha(T('objetivos'), _chip(k, T('oAprender')) + _chip(k, T('oEntregar'))))
    pulou = (f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("pulouTxt")}</p>'
             + botao_link(T('contarAgora'), f'ContaAprendizado{sufixo}.dc.html', k, 'outline', 32))
    perfil_card = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("contou"), k["mfg"])}'
        + se('ini.contou', f'<a href="ContaAprendizado{sufixo}.dc.html" style="font-size:12.5px;">{T("ajustar")}</a>', True)
        + '</div>'
        + se('ini.contou', f'<div style="display:flex;flex-direction:column;gap:12px;">{contou}</div>', True)
        + se('ini.pulou', f'<div style="display:flex;flex-direction:column;align-items:flex-start;gap:12px;">{pulou}</div>'),
        k, pad='18px 22px', extra='gap:14px;flex:1;min-width:0;')

    def tile(icone, titulo, txt, pe):
        return (f'<div style="display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:12px;background:{k["card"]};'
                f'box-shadow:{k["sombra"]};min-width:0;">'
                f'<div style="display:flex;align-items:center;gap:8px;color:{k["fgs"]};">{ic(icone, 16)}'
                f'<span style="font-size:14px;font-weight:600;">{T(titulo)}</span></div>'
                f'<p style="margin:0;flex:1;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T(txt)}</p>'
                f'<div style="display:flex;align-items:center;min-height:24px;">{pe}</div></div>')
    link = lambda txt, href: f'<a href="{href}" style="display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:500;">{T(txt)}{ic("seta", 12)}</a>'
    mapa = (f'<section aria-label="{T("mapa")}" style="display:flex;flex-direction:column;gap:10px;">{rotulo(T("mapa"), k["mfg"])}'
            f'<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;">'
            + tile('exercicios', 'mExercicios', 'mExerciciosTxt', link('comecar', f'PrimeiroExercicio{sufixo}.dc.html').replace(T('comecar'), T('abrir')))
            + tile('trilhas', 'mTrilhas', 'mTrilhasTxt', _em_breve(k))
            + tile('avaliacoes', 'mAvaliacoes', 'mAvaliacoesTxt', _em_breve(k, 'depoisPrimeiro'))
            + tile('peer', 'mPeer', 'mPeerTxt', link('conectar', f'Conectar{sufixo}.dc.html'))
            + tile('terminal', 'mPlayground', 'mPlaygroundTxt', link('abrir', f'Playground{sufixo}.dc.html'))
            + '</div></section>')

    escala_vazia = ''.join(f'<span style="width:18px;height:6px;border-radius:2px;'
                           + (f'background:transparent;box-shadow:inset 0 0 0 1px {k["pri"]};' if i < 2 else f'background:{k["sunken"]};')
                           + '"></span>' for i in range(5))
    competencia = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("perfil"), k["mfg"])}'
        f'<a href="PerfilVazio{sufixo}.dc.html" style="font-size:12.5px;">{T("verPerfil")}</a></div>'
        f'<div style="display:flex;align-items:center;gap:14px;"><span style="display:flex;gap:3px;">{escala_vazia}</span>'
        f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("perfilTxt")}</p></div>',
        k, pad='16px 22px', extra='gap:10px;flex:1.6;min-width:0;')
    plano = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("planoRot"), k["mfg"])}'
        f'<a href="Planos{sufixo}.dc.html" style="font-size:12.5px;">{T("verPlanos")}</a></div>'
        f'<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Pro</span>'
        f'{badge(T("diasRestantes"), k, "blue", ponto=True)}</div>'
        f'<p style="margin:0;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("planoTxt")}</p>',
        k, pad='16px 22px', extra='gap:8px;flex:1;min-width:0;')

    corpo = (cab
             + f'<div style="display:flex;gap:16px;align-items:stretch;">{proximo}{perfil_card}</div>'
             + mapa
             + f'<div style="display:flex;gap:16px;align-items:stretch;">{competencia}{plano}</div>')
    return app(k, 'inicio', corpo, gap=22)


ANTES_INICIO = """const iniE = s.estado || this.props.estado || "contou";
const ini = { contou: iniE === "contou", pulou: iniE === "pulou" };"""
PROPS_INICIO = {'estado': {'editor': 'enum', 'options': ['contou', 'pulou'], 'default': 'contou'}}
