import json
from base import *
from textos import (COMUM, EVOLUCAO, AVALIACAO, CONECTAR, PLANOS, PLANO_INICIAL, ACESSO, PRIMEIRO, PERFIL_VAZIO,
                    COMPETENCIA, PLAYGROUND, juntar)
from textos_exercicio import TEXTOS as EXERCICIO
from textos_onboarding import COMUM_ONB, VERIFICACAO, PREFERENCIAS, PAGAMENTO, PERFIL as PERFIL_ONB
from onboarding import (cabecalho_passo, tela_verificacao, tela_perfil, tela_preferencias, tela_pagamento,
                        ANTES_VERIFICACAO, PROPS_VERIFICACAO, ANTES_PREFERENCIAS, VALORES_PREFERENCIAS,
                        PROPS_PREFERENCIAS, ANTES_PAGAMENTO, VALORES_PAGAMENTO, PROPS_PAGAMENTO)
from logos import logo_linguagem


def nivel_nome(n):
    return T('pleno') if n == 2 else NIVEIS[n - 1]


# ── 1 · Evolução: declarado e observado convivem, por competência ──────
# Estados de cada linha: confirmado, a confirmar, próximo nível em progresso, declarado (sem evidência
# forte ainda) e não uso (linguagem que a pessoa não marcou). Nunca "rebaixado", nunca seta para baixo.
LINGUAGENS = ['TypeScript', 'Python', 'Go']
ENGENHARIA = ['Testing', 'Debugging', 'Architecture', 'APIs', 'Databases', 'Security',
              'Design Patterns', 'System Design', 'DDD', 'Observability']

# nome: (declarado, observado, evidências, estado, alvo)  — declarado None = não uso; observado 0 = sem confirmação
# O declarado nasce da experiência escolhida nas Preferências e vale para todas as competências: a API
# guarda um nível só (experience), não um por competência. Aprendendo e Iniciante → Junior,
# Intermediário → Pleno, Avançado → Senior; Tech Lead e Architect só se observam. O Rafael escolheu
# Intermediário, então tudo começa em Pleno, e o que passa disso vem das evidências.
PERFIL = {
    'TypeScript': (2, 3, 64, 'confirmado', None),
    'Python': (2, 0, 3, 'declarado', None),
    'Go': (None, 0, 0, 'naoUso', None),
    'Testing': (2, 2, 41, 'progresso', 3),
    'Debugging': (2, 2, 37, 'progresso', 3),
    'Architecture': (2, 1, 9, 'aConfirmar', 2),
    'APIs': (2, 2, 28, 'confirmado', None),
    'Databases': (2, 2, 15, 'confirmado', None),
    'Security': (2, 0, 6, 'declarado', None),
    'Design Patterns': (2, 2, 12, 'confirmado', None),
    'System Design': (2, 0, 4, 'declarado', None),
    'DDD': (2, 0, 0, 'declarado', None),
    'Observability': (2, 0, 3, 'declarado', None),
}
# o dia do primeiro acesso: só o declarado, Pleno em tudo (Intermediário), e Go fora das linguagens marcadas
PERFIL_INICIAL = {nome: (2, 0, 0, 'declarado', None) for nome in LINGUAGENS + ENGENHARIA}
PERFIL_INICIAL.update(Go=(None, 0, 0, 'naoUso', None))

COLUNAS_PERFIL = '160px 112px 92px 116px minmax(0,1fr)'


def escala_perfil(decl, obs, progresso, k, larg=20):
    # preenchido = observado; contorno = declarado acima do observado; meio-tom = próximo nível em progresso
    segs = ''
    for i in range(5):
        if i < obs:
            s = f'background:{k["pri"]};'
        elif progresso and i == obs:
            s = f'background:color-mix(in oklch, {k["pri"]} 35%, transparent);'
        elif decl and i < decl:
            s = f'background:transparent;box-shadow:inset 0 0 0 1px {k["pri"]};'
        else:
            s = f'background:{k["sunken"]};box-shadow:inset 0 1px 1px rgba(0,0,0,0.06);'
        segs += f'<span style="width:{larg}px;height:6px;border-radius:2px;{s}"></span>'
    op = 'opacity:0.5;' if decl is None else ''
    return f'<span style="display:flex;gap:3px;align-items:center;{op}">{segs}</span>'


def tabela_perfil(k, perfil, dica=None):
    dica = dica or {}

    def linha(nome):
        decl, obs, ev, estado, alvo = perfil[nome]
        link_nome = 'Competencia__SUF__.dc.html' if nome == 'Testing' else '#'
        segunda = ''
        if estado == 'confirmado':
            selo = badge(T('estConfirmado'), k, 'green')
        elif estado == 'aConfirmar':
            selo = badge(f'{nivel_nome(alvo)} {T("aConfirmar")}', k, 'yellow', ponto=True)
            chave = 'confirmam3' if alvo == 3 else 'confirmam2'
            segunda = (f'<a href="{link_nome}" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;">'
                       f'{T(chave)}{ic("direita", 12)}</a>')
        elif estado == 'progresso':
            selo = badge(f'{nivel_nome(alvo)} {T("emProgresso")}', k, 'blue', ponto=True)
            if link_nome != '#':
                segunda = (f'<a href="{link_nome}" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;">'
                           f'{T("confirmam3")}{ic("direita", 12)}</a>')
            else:
                segunda = f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("doisDeTres")}</span>'
        elif estado == 'naoUso':
            selo = badge(T('estNaoUso'), k, tracejado=True)
            segunda = f'<a href="#" style="font-size:12px;">{T("adicionar")}</a>'
        else:
            selo = badge(T('estDeclarado'), k, tracejado=True)
        if nome in dica:
            segunda = f'<span style="font-size:12px;color:{k["pri"]};">{T(dica[nome])}</span>'
        declarado = (f'<span style="font-size:13px;color:{k["fg"]};">{nivel_nome(decl)}</span>' if decl
                     else f'<span style="color:{k["mfg"]};">—</span>')
        observado = (f'<span style="display:flex;align-items:baseline;gap:8px;">'
                     + (f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">{nivel_nome(obs)}</span>' if obs
                        else f'<span style="color:{k["mfg"]};">—</span>')
                     + f'{mono(str(ev), k, k["mfg"], 11.5)}</span>')
        cor_nome = k['mfg'] if decl is None else k['fgs']
        nome_html = (f'<a href="{link_nome}" style="font-size:13.5px;font-weight:500;color:{cor_nome};">{nome}</a>' if link_nome != '#'
                     else f'<span style="font-size:13.5px;font-weight:500;color:{cor_nome};">{nome}</span>')
        return (f'<div style="display:grid;grid-template-columns:{COLUNAS_PERFIL};align-items:center;gap:12px;'
                f'min-height:40px;padding:5px 18px;border-top:1px solid {k["muted"]};">'
                f'{nome_html}{escala_perfil(decl, obs, estado == "progresso", k)}{declarado}{observado}'
                f'<span style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">{selo}{segunda}</span></div>')

    def grupo(titulo, nomes):
        return (f'<div style="display:flex;align-items:center;height:28px;padding:0 18px;border-top:1px solid {k["muted"]};'
                f'background:{k["rail"]};">{rotulo(titulo, k["mfg"], 9.5)}</div>' + ''.join(linha(n) for n in nomes))

    cab_tab = (f'<div style="display:grid;grid-template-columns:{COLUNAS_PERFIL};gap:12px;align-items:center;height:34px;padding:0 18px;">'
               + ''.join(rotulo(T(c), k['mfg'], 9.5) for c in ['colComp', 'colEscala', 'colDecl', 'colObs', 'colEstado'])
               + '</div>')
    item = lambda amostra, txt: (f'<span style="display:flex;align-items:center;gap:8px;">{amostra}'
                                 f'<span style="font-size:12px;color:{k["mfg"]};">{txt}</span></span>')
    amostra = lambda estilo: f'<span style="width:14px;height:6px;border-radius:2px;{estilo}"></span>'
    legenda_ = (f'<div style="display:flex;align-items:center;gap:18px;padding:10px 18px 0;border-top:1px solid {k["muted"]};">'
                f'{item(amostra("background:" + k["pri"] + ";"), T("legObs"))}'
                f'{item(amostra("box-shadow:inset 0 0 0 1px " + k["pri"] + ";"), T("legDecl"))}'
                f'{item(amostra("background:color-mix(in oklch, " + k["pri"] + " 35%, transparent);"), T("legProg"))}'
                f'<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">'
                f'Junior · {T("pleno")} · Senior · Tech Lead · Architect</span></div>')
    return (f'<section aria-label="{T("competencias")}" style="flex:1;min-width:0;background:{k["card"]};border-radius:12px;'
            f'box-shadow:{k["sombra"]};padding:4px 0 12px;display:flex;flex-direction:column;overflow:hidden;">'
            f'{cab_tab}{grupo(T("grupoLing"), LINGUAGENS)}{grupo(T("grupoEng"), ENGENHARIA)}{legenda_}</section>')


def item_evidencia(k, fonte, forte, txt, onde, quando, borda):
    b = f'border-top:1px solid {k["muted"]};' if borda else ''
    peso = badge(T('pesoForte'), k, 'blue') if forte else badge(T('pesoLeve'), k, tracejado=True)
    return (f'<li style="display:flex;flex-direction:column;gap:4px;padding:9px 0;{b}">'
            f'<div style="display:flex;align-items:center;gap:6px;">{badge(T(fonte), k, "gray", mono=True)}{peso}'
            f'<span style="margin-left:auto;font-size:11.5px;color:{k["mfg"]};">{quando}</span></div>'
            f'<span style="font-size:13px;color:{k["fg"]};">{txt}</span>'
            + (f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{onde}</span>' if onde else '') + '</li>')


EVIDENCIAS = [
    ('fontePeer', False, T('ev1'), 'agenda-slots · IDE', T('q1')),
    ('fontePlayground', False, T('ev2'), 'horas.py', T('q2')),
    ('fonteExercicio', True, T('ev3'), 'Testing · Design Patterns', T('q3')),
    ('fonteExplicacao', True, T('ev4'), 'Testing', T('q4')),
]


def tela_evolucao(k):
    cab = cabecalho(
        k, None, T('titulo'), T('sub'),
        direita=(f'<div style="display:flex;gap:8px;">{botao_link(T("trajetoria"), "Competencia__SUF__.dc.html", k, "outline", 32, "relogio")}'
                 f'{botao(T("comoMedido"), k, "ghost")}</div>'))

    proximo = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("proximoPasso"), k["mfg"])}'
        f'{badge("Testing · " + T("confirma") + " Senior", k, "yellow")}</div>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("proxTitulo")}</h2>'
        f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("proxTxt")}</p></div>'
        f'<div style="display:flex;gap:8px;">{botao(T("comecar"), k, "solid", 36)}'
        f'{botao_link(T("verOsTres"), "Competencia__SUF__.dc.html", k, "ghost", 36)}</div>', k, pad='18px 22px', extra='gap:12px;')

    ev_linhas = ''.join(item_evidencia(k, f, forte, txt, onde, quando, i > 0)
                        for i, (f, forte, txt, onde, quando) in enumerate(EVIDENCIAS))
    recente = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("evRecente"), k["mfg"])}'
        f'<a href="#" style="font-size:12.5px;">{T("verTodas")}</a></div>'
        f'<ul style="margin:-6px 0 -8px;padding:0;list-style:none;">{ev_linhas}</ul>', k, pad='16px 22px', extra='gap:12px;')

    trajetoria = cartao(
        f'{rotulo(T("trajTit"), k["mfg"])}'
        f'<div style="display:flex;align-items:baseline;gap:10px;">'
        f'<span style="font-size:22px;line-height:26px;font-weight:600;color:{k["mfg"]};">{T("trajAntes")}</span>'
        f'<span style="display:flex;width:16px;height:16px;color:{k["mfg"]};align-self:center;">{I["seta"]}</span>'
        f'<span style="font-size:22px;line-height:26px;font-weight:600;color:{k["fgs"]};">{T("trajDepois")}</span></div>'
        f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("trajTxt")}</p>'
        f'<a href="Competencia__SUF__.dc.html" style="font-size:12.5px;">{T("trajLink")}</a>', k, pad='16px 22px', extra='gap:8px;')

    lado = f'<aside style="width:348px;flex:0 0 348px;display:flex;flex-direction:column;gap:14px;">{proximo}{recente}{trajetoria}</aside>'
    return app(k, 'evolucao', cab + f'<div style="display:flex;gap:20px;align-items:flex-start;flex:1;min-height:0;">'
                               f'{tabela_perfil(k, PERFIL)}{lado}</div>', gap=20)


# ── 1b · Uma competência: o caminho para confirmar, o histórico e a trajetória ──
def tela_competencia(k):
    chips = (badge(f'{T("pleno")} {T("declaradoSuf")}', k, tracejado=True)
             + badge(f'{T("pleno")} {T("confirmadoPor")}', k, 'green')
             + badge(f'Senior {T("emProgressoSuf")}', k, 'blue', ponto=True))
    # o declarado não se edita por competência (a API guarda uma experiência só): muda nas Preferências
    cab = cabecalho(k, [(T('evolucao'), destino('evolucao')), ('Testing', '')], 'Testing', chips=chips,
                    direita=botao_link(T('mudarExp'), 'Preferencias__SUF__.dc.html', k, 'outline', 36, 'lapis'))

    def exercicio(n, titulo, proximo):
        numero = (f'<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;flex:0 0 auto;'
                  f'border-radius:999px;font-family:{MONO};font-size:12px;'
                  + (f'background:{k["prisub"]};color:{k["prisubfg"]};">' if proximo
                     else f'box-shadow:inset 0 0 0 1px {k["input"]};color:{k["mfg"]};">') + f'{n}</span>')
        acao = (f'<span style="display:flex;align-items:center;gap:8px;">{badge(T("proximo"), k, "blue")}'
                f'{botao(T("comecar"), k, "solid", 32)}</span>' if proximo else '')
        return (f'<li style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid {k["muted"]};">{numero}'
                f'<span style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
                f'<span style="font-size:14px;font-weight:500;color:{k["fgs"] if proximo else k["fg"]};">{titulo}</span>'
                f'<span style="display:flex;gap:6px;">{badge("Testing", k, "gray")}{badge("Senior", k, "gray")}</span></span>{acao}</li>')

    caminho = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">'
        f'{rotulo(T("caminhoTit") + " Senior", k["mfg"])}{mono(T("zeroDeTres"), k, k["mfg"], 12)}</div>'
        f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["fg"]};">{T("caminhoTxt")}</p>'
        f'<ol style="margin:0;padding:0;list-style:none;">{exercicio(1, T("exA"), True)}{exercicio(2, T("exB"), False)}{exercicio(3, T("exC"), False)}</ol>'
        f'<p style="margin:0;display:flex;align-items:center;gap:8px;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
        f'{ic("dica", 14, k["mfg"])}<span><a href="Avaliacao__SUF__.dc.html" style="font-family:{MONO};font-size:12px;">agenda-slots</a> '
        f'{T("agendaNota")}</span></p>', k, pad='18px 22px', extra='gap:12px;')

    ref = lambda t: (f'<a href="#" style="display:inline-flex;align-items:center;height:22px;padding:0 7px;border-radius:4px;'
                     f'background:{k["muted"]};font-family:{MONO};font-size:11.5px;color:{k["fgs"]};">{t}</a>')

    def marco(data, titulo, tom, desc, refs='', ultimo=False):
        ponto = {'yellow': f'background:{k["warn"]};', 'green': f'background:{k["ok"]};', 'blue': f'background:{k["pri"]};',
                 'dashed': f'box-shadow:inset 0 0 0 1.5px {k["mfg"]};'}[tom]
        trilho = '' if ultimo else f'<span style="flex:1;width:1px;background:{k["input"]};margin-top:4px;"></span>'
        return (f'<li style="display:grid;grid-template-columns:56px 14px minmax(0,1fr);gap:12px;">'
                f'<span style="font-family:{MONO};font-size:11.5px;line-height:20px;color:{k["mfg"]};">{data}</span>'
                f'<span style="display:flex;flex-direction:column;align-items:center;padding-top:5px;">'
                f'<span style="width:10px;height:10px;border-radius:999px;{ponto}"></span>{trilho}</span>'
                f'<span style="display:flex;flex-direction:column;gap:4px;padding-bottom:16px;">'
                f'<span style="font-size:13.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{titulo}</span>'
                f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{desc}</span>'
                + (f'<span style="display:flex;gap:6px;flex-wrap:wrap;padding-top:2px;">{refs}</span>' if refs else '')
                + '</span></li>')

    historico = cartao(
        f'{rotulo(T("historicoTit"), k["mfg"])}'
        f'<ol style="margin:0;padding:0;list-style:none;">'
        f'{marco(T("d1"), "Senior " + T("emProgressoSuf"), "blue", T("h1d"))}'
        f'{marco(T("d3"), T("pleno") + " " + T("confirmadoSuf"), "green", T("h3d"), ref("fila-emails") + ref("cadastro-usuarios") + ref("parse-duration"))}'
        f'{marco(T("d4"), T("pleno") + " " + T("declaradoSuf"), "dashed", T("h4d"), ultimo=True)}'
        f'</ol>', k, pad='18px 22px', extra='gap:14px;')

    def fonte(nome, forte, n):
        peso = badge(T('pesoForte'), k, 'blue') if forte else badge(T('pesoLeve'), k, tracejado=True)
        return (f'<li style="display:grid;grid-template-columns:minmax(0,1fr) auto 36px;align-items:center;gap:12px;height:38px;'
                f'border-top:1px solid {k["muted"]};"><span style="font-size:13.5px;color:{k["fg"]};">{T(nome)}</span>{peso}'
                f'<span style="text-align:right;">{mono(str(n), k, k["fgs"], 13)}</span></li>')
    fontes = cartao(
        f'{rotulo(T("fontesTit"), k["mfg"])}'
        f'<ul style="margin:-4px 0 0;padding:0;list-style:none;">'
        f'{fonte("fonteExercicio", True, 6)}{fonte("fonteExplicacao", True, 6)}{fonte("fontePeer", False, 26)}{fonte("fontePlayground", False, 3)}'
        f'<li style="display:grid;grid-template-columns:minmax(0,1fr) 36px;align-items:center;gap:12px;height:38px;border-top:1px solid {k["input"]};">'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">{T("total")}</span>'
        f'<span style="text-align:right;">{mono("41", k, k["fgs"], 13)}</span></li></ul>'
        f'<p style="margin:0;font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("fontesNota")}</p>', k, pad='18px 22px', extra='gap:12px;')

    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'

    def codigo(titulo, linhas):
        corpo = ''.join(f'<span style="white-space:pre;">{l}</span>' for l in linhas)
        return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{titulo}</span>'
                f'<div style="display:flex;flex-direction:column;padding:10px 12px;border-radius:8px;background:{k["sunken"]};'
                f'font-family:{MONO};font-size:11.5px;line-height:18px;color:{k["fg"]};">{corpo}</div></div>')
    antes = codigo(f'{T("junho")} · fila-emails.test.ts', [
        f'{fn("test")}({st("&quot;envia&quot;")}, {kw("async")} () =&gt; {{',
        f'  {kw("const")} r = {kw("await")} enviar(fila)',
        f'  {fn("expect")}(r).toBeTruthy()',
        '})'])
    depois = codigo(f'{T("hoje")} · agenda-slots.test.ts', [
        f'{fn("test")}({st("&quot;slots do expediente&quot;")}, () =&gt; {{',
        f'  {kw("const")} slots = gerarSlots(dia)',
        f'  {fn("expect")}(slots).toHaveLength(18)',
        f'  {fn("expect")}(slots[0].inicio).toBe({st("&quot;09:00&quot;")})',
        '})'])
    trajetoria = cartao(
        f'<div style="display:flex;flex-direction:column;gap:4px;">{rotulo(T("trajTit"), k["mfg"])}'
        f'<span style="font-size:13px;color:{k["mfg"]};">{T("trajSub")}</span></div>'
        f'<div style="display:flex;align-items:baseline;gap:10px;"><span style="font-size:13px;color:{k["fg"]};">{T("trajMetric")}</span>'
        f'<span style="font-size:17px;font-weight:600;color:{k["mfg"]};">{T("trajAntes")}</span>'
        f'<span style="display:flex;width:14px;height:14px;color:{k["mfg"]};align-self:center;">{I["seta"]}</span>'
        f'<span style="font-size:17px;font-weight:600;color:{k["fgs"]};">{T("trajDepois")}</span></div>'
        f'{antes}{depois}', k, pad='18px 22px', extra='gap:12px;')

    esquerda = f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">{caminho}{historico}</div>'
    direita = f'<div style="width:440px;flex:0 0 440px;display:flex;flex-direction:column;gap:16px;">{fontes}{trajetoria}</div>'
    return app(k, 'evolucao', cab + f'<div style="display:flex;gap:20px;align-items:flex-start;flex:1;min-height:0;">{esquerda}{direita}</div>')


# ── 2 · Exercício: escrever, montar o projeto, rodar os testes e explicar ──
# `primeira=True` é o mesmo exercício recém-aberto, com o guia de três passos por cima.
TESTES = [
    (True, 'converte horas e minutos', None),
    (True, 'converte só minutos', None),
    (True, 'converte só horas', None),
    (False, 'rejeita texto vazio', ('DurationVazia', '0')),
    (False, 'arredonda segundos para o minuto', ('2', '1.5')),
]


def editor_linhas(k, primeira=False):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    ty = lambda t: f'<span style="color:{k["tbluefg"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    nu = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["fgs"]};font-weight:500;">{t}</span>'
    cursor = (f'<span aria-hidden="true" style="display:inline-block;width:2px;height:17px;margin-left:1px;'
              f'vertical-align:-3px;background:{k["pri"]};"></span>')
    if primeira:
        return [
            f'{kw("export class")} {ty("DurationVazia")} {kw("extends")} {ty("Error")} {{}}',
            '',
            f'{kw("export function")} {fn("parseDuration")}(texto: {ty("string")}): {ty("number")} {{',
            f'  {cursor}',
            '}',
        ]
    return [
        f'{kw("import")} {{ UNIDADES }} {kw("from")} {st("&quot;./unidades&quot;")}',
        '',
        f'{kw("export class")} {ty("DurationVazia")} {kw("extends")} {ty("Error")} {{}}',
        '',
        f'{kw("export function")} {fn("parseDuration")}(texto: {ty("string")}): {ty("number")} {{',
        f'  {kw("const")} partes = texto.matchAll({st("/(\\d+)(h|min|s)/g")})',
        f'  {kw("let")} total = {nu("0")}',
        f'  {kw("for")} ({kw("const")} [, valor, unidade] {kw("of")} partes) {{',
        f'    total += {ty("Number")}(valor) * UNIDADES[unidade]',
        '  }',
        f'  {kw("return")} Math.rou{cursor}',
        '}',
    ]

ARVORE = [
    ('parse-duration', 0, 'pasta', ''),
    ('src', 1, 'pasta', ''),
    ('parse-duration.ts', 2, 'arquivo', 'aberto'),
    ('unidades.ts', 2, 'arquivo', 'novo-hover'),
    ('erros.ts', 2, 'arquivo', 'criando'),
    ('test', 1, 'pasta', ''),
    ('parse-duration.test.ts', 2, 'arquivo', ''),
    ('package.json', 1, 'arquivo', 'travado'),
    ('tsconfig.json', 1, 'arquivo', 'travado'),
    ('README.md', 1, 'arquivo', 'travado'),
]
ARVORE_PRIMEIRA = [a for a in ARVORE if a[3] not in ('novo-hover', 'criando')]


def acao_icone(k, icone, rot, tam=24):
    return (f'<button type="button" aria-label="{rot}" style="display:flex;align-items:center;justify-content:center;'
            f'width:{tam}px;height:{tam}px;border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">{ic(icone, 14)}</button>')


def secao(k, titulo, direita, corpo, borda=True, extra='', dentro=''):
    b = f'border-top:1px solid {k["muted"]};' if borda else ''
    return (f'<section style="display:flex;flex-direction:column;{b}{extra}">'
            f'<div style="display:flex;align-items:center;gap:6px;height:38px;padding:0 6px 0 10px;">'
            f'<button type="button" aria-expanded="true" style="display:flex;align-items:center;gap:6px;height:26px;padding:0 4px;'
            f'border:0;border-radius:6px;background:transparent;color:{k["mfg"]};">'
            f'<span style="display:flex;width:12px;height:12px;">{I["baixo"]}</span>{rotulo(titulo, k["mfg"], 9.5)}</button>'
            f'<span style="margin-left:auto;display:flex;align-items:center;gap:2px;">{direita}</span></div>'
            f'{corpo}{dentro}</section>')


def arvore(k, primeira=False):
    linhas = ''
    for nome, nivel, tipo, estado in (ARVORE_PRIMEIRA if primeira else ARVORE):
        recuo = 10 + nivel * 12
        seta = (f'<span style="display:flex;width:12px;height:12px;color:{k["mfg"]};">{I["baixo"]}</span>' if tipo == 'pasta'
                else '<span style="width:12px;flex:0 0 auto;"></span>')
        icone = ic(tipo, 14, k['mfg'])
        if estado == 'criando':
            linhas += (
                f'<li style="padding:2px 8px 4px {recuo}px;display:flex;flex-direction:column;gap:3px;">'
                f'<span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;flex:0 0 auto;"></span>{icone}'
                f'<input type="text" aria-label="{T("nomeNovo")}" value="{{{{novoArquivo}}}}" onChange="{{{{mudarNome}}}}" '
                f'style="flex:1;min-width:0;height:24px;padding:0 6px;border:0;border-radius:5px;'
                f'background:{k["card"]};box-shadow:inset 0 0 0 1.5px {k["pri"]};font-family:{FONTE};font-size:12.5px;color:{k["fgs"]};outline:0;"></span>'
                f'<span style="padding-left:38px;font-family:{MONO};font-size:10.5px;color:{k["mfg"]};">{T("criaCancela")}</span></li>')
            continue
        fundo, direita, cor = '', '', k['fg']
        if estado == 'aberto':
            fundo, cor = f'background:{k["prisub"]};', k['prisubfg']
        elif estado == 'novo-hover':
            fundo = f'background:{k["muted"]};'
            direita = (f'<span style="margin-left:auto;display:flex;align-items:center;gap:2px;">'
                       f'{acao_icone(k, "lapis", T("renomear") + " " + nome, 22)}{acao_icone(k, "lixeira", T("excluir") + " " + nome, 22)}</span>')
        elif estado == 'travado':
            cor = k['mfg']
            direita = f'<span style="margin-left:auto;" title="{T("travado")}">{ic("cadeado", 12, k["mfg"])}</span>'
        peso = 'font-weight:600;' if nivel == 0 else ''
        novo = (f'<span title="{T("seu")}" style="margin-left:4px;width:6px;height:6px;border-radius:999px;background:{k["ok"]};flex:0 0 auto;"></span>'
                if estado == 'novo-hover' else '')
        linhas += (f'<li style="display:flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 {recuo}px;border-radius:6px;'
                   f'font-size:12.5px;color:{cor};{fundo}{peso}">{seta}{icone}<span style="white-space:nowrap;">{nome}</span>{novo}{direita}</li>')
    acoes = (acao_icone(k, 'arquivo_mais', T('novoArquivo')) + acao_icone(k, 'pasta_mais', T('novaPasta'))
             + acao_icone(k, 'recolher', T('recolher')))
    return secao(k, T('codigo'), acoes,
                 f'<ul aria-label="{T("estrutura")}" style="margin:0;padding:0 6px 8px;list-style:none;display:flex;flex-direction:column;gap:1px;">{linhas}</ul>',
                 borda=False)


def painel_testes(k, primeira=False, extra='', dentro=''):
    linhas = ''
    for ok, nome, det in TESTES:
        if primeira:
            marca, cor_nome, extra_det = ic('circulo', 12, k['mfg']), k['fg'], ''
        else:
            marca = ic('check' if ok else 'x', 12, k['ok'] if ok else k['bad'])
            cor_nome = k['fgs'] if not ok else k['fg']
            extra_det = ''
            if det:
                extra_det = (f'<span style="display:flex;flex-direction:column;padding-left:20px;font-family:{MONO};font-size:11px;line-height:16px;color:{k["mfg"]};">'
                             f'<span>{T("esperado")} <span style="color:{k["fgs"]};">{det[0]}</span></span>'
                             f'<span>{T("recebido")} <span style="color:{k["bad"]};">{det[1]}</span></span></span>')
        linhas += (f'<li><button type="button" title="{T("abrirTeste")}" style="display:flex;flex-direction:column;gap:3px;width:100%;'
                   f'padding:6px 8px;border:0;border-radius:6px;background:transparent;text-align:left;font-family:{FONTE};">'
                   f'<span style="display:flex;align-items:flex-start;gap:8px;">'
                   f'<span style="margin-top:2px;">{marca}</span>'
                   f'<span style="font-size:12.5px;line-height:17px;color:{cor_nome};">{nome}</span></span>{extra_det}</button></li>')
    if primeira:
        resumo = badge(T('naoRodou'), k, 'gray')
        rodape = T('rodeCom')
    else:
        resumo = (f'<span style="display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:4px;'
                  f'background:{k["tred"]};color:{k["tredfg"]};font-size:11px;font-weight:500;">'
                  f'<span style="width:5px;height:5px;border-radius:999px;background:currentColor;"></span>{T("passam")}</span>')
        rodape = T('rodou')
    corpo = (f'<ul aria-label="{T("testes")}" style="margin:0;padding:0 6px;list-style:none;display:flex;flex-direction:column;gap:1px;">{linhas}</ul>'
             f'<span style="padding:6px 16px 10px;font-size:11.5px;color:{k["mfg"]};">{rodape}</span>')
    return secao(k, T('testes'), resumo, corpo, extra=extra, dentro=dentro)


def balao_guia(k, n, posicao):
    # o balão mora dentro da área que ele explica: a posição vem do próprio elemento, não de coordenada solta
    ultimo = n == 3
    pular = '' if ultimo else botao(T('pular'), k, 'ghost', 32, acao='g.fechar')
    seguir = botao(T('comecarGuia') if ultimo else T('proximo'), k, 'solid', 32, acao='g.fechar' if ultimo else 'g.avancar')
    return (f'<sc-if value="{{{{g.passo{n}}}}}" hint-placeholder-val="{{{{ {"true" if n == 1 else "false"} }}}}">'
            f'<div role="dialog" aria-label="{T("guiaAria")}" style="position:absolute;{posicao}z-index:7;width:320px;'
            f'display:flex;flex-direction:column;gap:8px;padding:18px 18px 14px;border-radius:12px;background:{k["card"]};'
            f'box-shadow:0 0 0 1px {k["input"]}, {k["sombraFlut"]};font-family:{FONTE};text-align:left;white-space:normal;">'
            f'<span style="font-family:{MONO};font-size:11px;letter-spacing:0.08em;color:{k["pri"]};">{n} {T("de3")}</span>'
            f'<span style="font-size:15px;line-height:21px;font-weight:600;color:{k["fgs"]};">{T(f"g{n}t")}</span>'
            f'<p style="margin:0;font-size:13.5px;line-height:20px;color:{k["fg"]};">{T(f"g{n}d")}</p>'
            f'<div style="display:flex;align-items:center;gap:8px;padding-top:6px;">{pular}'
            f'<span style="margin-left:auto;display:flex;">{seguir}</span></div></div></sc-if>')


def tela_exercicio(k, primeira=False):
    realce = lambda n: f'position:relative;z-index:{{{{g.z{n}}}}};box-shadow:{{{{g.anel{n}}}}};' if primeira else ''
    chips = (badge('Testing', k, 'blue') + badge('Debugging', k, 'blue') + badge(T('nivel'), k, 'gray')
             + (badge(T('primeiroChip'), k, 'blue', ponto=True) if primeira else badge(T('andamento'), k, 'yellow', ponto=True)))
    trilha = topo_detalhe(k, [(T('exercicios'), '#'), ('Testing', '#'), ('parse-duration', '')])
    salvo = '' if primeira else f'<span style="font-size:12px;color:{k["mfg"]};margin-right:6px;">{T("salvo")}</span>'
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{trilha}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div></div>'
           f'<div style="display:flex;align-items:center;gap:8px;">{salvo}'
           f'{botao(T("continuarIde"), k, "ghost", 36, "laptop")}'
           f'{botao(T("enviar"), k, "solid", 36, "enviar")}</div></header>')

    exemplo = lambda e, r: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:5px;'
                            f'background:{k["sunken"]};font-family:{MONO};font-size:11.5px;color:{k["fg"]};">'
                            f'<span style="color:{k["ok"]};">"{e}"</span><span style="color:{k["mfg"]};">→</span>{r}</span>')
    exemplos = (f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{exemplo("1h30", "90")}{exemplo("45min", "45")}'
                f'{exemplo("90s", "2")}{exemplo("", "DurationVazia")}</div>')
    req = lambda conteudo: (f'<li style="display:flex;gap:10px;align-items:flex-start;">'
                            f'<span style="margin-top:8px;width:5px;height:5px;border-radius:999px;background:{k["mfg"]};flex:0 0 auto;"></span>'
                            f'<span>{conteudo}</span></li>')
    reqs = (req(T('req1')) + req(T('req2')) + req(f'{T("req3")} {mono("DurationVazia", k, None, 12)}.') + req(T('req4')))
    enunciado = cartao(
        f'{rotulo(T("enunciado"), k["mfg"])}'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("enunciadoTexto")}</p>'
        f'{exemplos}'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:13px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T("precisa")}</h2>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:20px;">{reqs}</ul></div>',
        k, pad='16px 20px', extra='gap:12px;')

    explicacao = cartao(
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("explique"), k["mfg"])}'
        f'<span style="margin-left:auto;">{badge(T("vaiAvaliacao"), k, "blue")}</span></div>'
        f'<label for="explicacao" style="font-size:14px;line-height:21px;font-weight:500;color:{k["fgs"]};">{T("pergunta")}</label>'
        f'<textarea id="explicacao" rows="4" value="{{{{resposta}}}}" onChange="{{{{mudarResposta}}}}" placeholder="{T("placeholder")}" '
        f'style="resize:none;width:100%;padding:10px 12px;border:0;border-radius:8px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:13.5px;line-height:20px;color:{k["fgs"]};outline:0;"></textarea>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("nota")}</span>'
        + (balao_guia(k, 3, 'top:0;left:calc(100% + 16px);') if primeira else ''),
        k, pad='16px 20px', extra='gap:10px;' + realce(3))

    if primeira:
        dicas_txt = f'<span style="font-size:13px;color:{k["fg"]};">{T("dicasDisp")}</span>'
        dicas_botao = botao(T('pedirDica'), k, 'outline', 32)
    else:
        dicas_txt = (f'<span style="font-size:13px;color:{k["fg"]};">{T("dicaUsada")}</span>'
                     f'<a href="#" style="font-size:12px;">{T("verDica")}</a>')
        dicas_botao = botao(T('proximaDica'), k, 'outline', 32)
    dicas = (f'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
             f'{ic("dica", 16, k["warn"])}<span style="display:flex;flex-direction:column;flex:1;min-width:0;">{dicas_txt}</span>'
             f'{dicas_botao}</div>')

    esquerda = (f'<div style="width:372px;flex:0 0 372px;display:flex;flex-direction:column;gap:12px;">'
                f'{enunciado}{explicacao}{dicas}</div>')

    arquivos = ([('parse-duration.ts', True), ('parse-duration.test.ts', False)] if primeira
                else [('parse-duration.ts', True), ('unidades.ts', False), ('parse-duration.test.ts', False)])
    abas = ''
    for nome, at in arquivos:
        f = (f'background:{k["card"]};color:{k["fgs"]};box-shadow:inset 0 -2px 0 {k["pri"]};' if at
             else f'color:{k["mfg"]};')
        cur = ' aria-selected="true"' if at else ' aria-selected="false"'
        abas += (f'<button type="button" role="tab"{cur} style="display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;'
                 f'border:0;background:transparent;font-family:{MONO};font-size:12px;{f}">{ic("arquivo", 13)}{nome}</button>')
    atual = 3 if primeira else 10
    codigo = ''.join(
        f'<div style="display:flex;{"background:" + k["prisub"] + ";" if i == atual else ""}">'
        f'<span style="width:48px;flex:0 0 auto;text-align:right;padding-right:16px;color:{k["mfg"]};opacity:{1 if i == atual else 0.55};">{i + 1}</span>'
        f'<span style="white-space:pre;">{l}</span></div>'
        for i, l in enumerate(editor_linhas(k, primeira)))

    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">'
               f'{arvore(k, primeira)}'
               + painel_testes(k, primeira, extra=(f'background:{k["rail"]};' + realce(2)) if primeira else '',
                               dentro=balao_guia(k, 2, 'top:0;left:calc(100% + 14px);') if primeira else '')
               + f'<div style="flex:1;"></div>'
               f'<div style="display:flex;flex-direction:column;gap:4px;padding:10px 14px 12px;border-top:1px solid {k["muted"]};font-size:11.5px;line-height:16px;color:{k["mfg"]};">'
               f'<span style="display:flex;align-items:center;gap:6px;">{ic("cadeado", 11)}{T("travado")}</span>'
               f'<span style="display:flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;margin:0 2.5px;border-radius:999px;background:{k["ok"]};"></span>{T("seu")}</span></div></div>')

    area = (f'<div style="flex:1;min-height:0;padding:14px 0;font-family:{MONO};font-size:13px;line-height:24px;color:{k["fg"]};'
            f'background:{k["card"]};{realce(1)}">{codigo}'
            + (balao_guia(k, 1, 'top:164px;left:56px;') if primeira else '') + '</div>')
    posicao = 'src/parse-duration.ts · 4:3' if primeira else 'src/parse-duration.ts · 11:18'
    editor = (
        f'<section aria-label="{T("editor")}" style="flex:1;min-width:0;display:flex;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">{lateral}'
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">'
        f'<div style="display:flex;align-items:center;gap:2px;padding:0 8px 0 4px;border-bottom:1px solid {k["muted"]};">'
        f'<div role="tablist" aria-label="{T("abertos")}" style="display:flex;">{abas}</div>'
        f'<span style="margin-left:auto;">{botao(T("rodar"), k, "primary", 30, "rodar")}</span></div>'
        f'{area}'
        f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
        f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
        f'<span>{posicao}</span><span>{T("atalho")}</span>'
        f'<span style="margin-left:auto;">{T("semAuto")}</span></div></div></section>')

    corpo = app(k, 'exercicios', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{esquerda}{editor}</div>',
                compacto=True, pad='24px 28px', gap=18)
    if primeira:
        # o véu cobre a tela; só a área do passo atual sobe acima dele
        veu = (f'<sc-if value="{{{{g.ativo}}}}" hint-placeholder-val="{{{{ true }}}}">'
               f'<div aria-hidden="true" style="position:absolute;inset:0;z-index:5;background:{k["veu"]};"></div></sc-if>')
        corpo = corpo[:-len('</div>')] + veu + '</div>'
    return corpo


VALORES_EXERCICIO = """novoArquivo: s.novoArquivo == null ? "erros.ts" : s.novoArquivo,
resposta: s.resposta == null ? t.resposta : s.resposta,
mudarNome: (e) => this.setState({ novoArquivo: e.target.value }),
mudarResposta: (e) => this.setState({ resposta: e.target.value })"""

ANTES_PRIMEIRO = """const pp = this.props.passo;
const passo = s.passo != null ? s.passo : (pp === 0 || pp ? Number(pp) : 1);
const g = {
ativo: passo >= 1 && passo <= 3,
passo1: passo === 1, passo2: passo === 2, passo3: passo === 3,
z1: passo === 1 ? 6 : "auto", z2: passo === 2 ? 6 : "auto", z3: passo === 3 ? 6 : "auto",
anel1: passo === 1 ? "inset 0 0 0 2px var(--pri)" : "none",
anel2: passo === 2 ? "inset 0 0 0 2px var(--pri)" : "none",
anel3: passo === 3 ? "0 0 0 2px var(--pri), var(--sombra)" : "var(--sombra)",
avancar: () => this.setState({ passo: passo + 1 }),
fechar: () => this.setState({ passo: 0 })
};"""

VALORES_PRIMEIRO = """g: g,
novoArquivo: s.novoArquivo == null ? "" : s.novoArquivo,
resposta: s.resposta == null ? "" : s.resposta,
mudarNome: (e) => this.setState({ novoArquivo: e.target.value }),
mudarResposta: (e) => this.setState({ resposta: e.target.value })"""

PROPS_PRIMEIRO = {'passo': {'editor': 'int', 'min': 0, 'max': 3, 'default': 1}}


# ── 3 · Avaliação: a nota é número, o porquê é texto ───────────────────
RUBRICA = [
    ('c1', 4, 'atende', 'green'),
    ('c2', 3, 'atende', 'green'),
    ('c3', 4, 'atende', 'green'),
    ('c4', 2, 'parcial', 'yellow'),
    ('c5', 1, 'naoAtende', 'red'),
]


def barra4(n, k, cor):
    s = ''
    for i in range(4):
        st = f'background:{cor};' if i < n else f'background:{k["sunken"]};box-shadow:inset 0 1px 1px rgba(0,0,0,0.06);'
        s += f'<span style="flex:1;height:6px;border-radius:2px;{st}"></span>'
    return f'<span style="display:flex;gap:3px;width:120px;">{s}</span>'


def tela_avaliacao(k):
    chips = (badge('Testing', k, 'blue') + badge('Design Patterns', k, 'blue') + badge(T('nivelSenior'), k, 'gray')
             + badge(T('enviada'), k, 'gray'))
    cab = cabecalho(k, [(T('avaliacoes'), '#'), ('agenda-slots', '')], T('titulo'), chips=chips,
                    direita=f'<div style="display:flex;gap:8px;">{botao(T("verSolucao"), k, "outline", 36)}</div>')

    cores = dict(green=k['ok'], yellow=k['warn'], red=k['bad'])
    linhas = ''
    for crit, n, estado, tom in RUBRICA:
        linhas += (f'<li style="display:grid;grid-template-columns:minmax(0,1fr) 120px 96px;align-items:center;gap:16px;'
                   f'min-height:48px;padding:0 20px;border-top:1px solid {k["muted"]};">'
                   f'<span style="font-size:13.5px;color:{k["fgs"]};">{T(crit)}</span>{barra4(n, k, cores[tom])}'
                   f'<span style="display:flex;justify-content:flex-end;">{badge(T(estado), k, tom)}</span></li>')
    rubrica = (f'<section aria-label="{T("rubricaAria")}" style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
               f'padding:18px 0 6px;display:flex;flex-direction:column;gap:12px;">'
               f'<div style="display:flex;align-items:center;gap:10px;padding:0 20px;">{rotulo(T("rubricaTesting"), k["mfg"])}'
               f'<span style="margin-left:auto;font-size:13px;color:{k["fg"]};"><b style="font-weight:600;">{T("tresDeCinco")}</b> {T("atendidos")}</span></div>'
               f'<ul style="margin:0;padding:0;list-style:none;">{linhas}</ul></section>')

    def efeito(icone, titulo, txt):
        return (f'<li style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid {k["muted"]};">'
                f'<span style="margin-top:2px;">{ic(icone, 16, k["mfg"])}</span>'
                f'<span style="display:flex;flex-direction:column;gap:2px;">'
                f'<span style="font-size:13px;font-weight:600;color:{k["fgs"]};">{titulo}</span>'
                f'<span style="font-size:13px;color:{k["mfg"]};">{txt}</span></span></li>')
    efeitos = cartao(
        f'{rotulo(T("oQueMuda"), k["mfg"])}'
        f'<ul style="margin:-4px 0 -10px;padding:0;list-style:none;">'
        f'{efeito("evolucao", T("efPerfil"), T("efPerfilTxt"))}'
        f'{efeito("trilhas", T("efTrilhas"), T("efTrilhasTxt"))}'
        f'{efeito("relogio", T("efTraj"), T("efTrajTxt"))}'
        f'</ul>'
        f'<div style="display:flex;gap:8px;padding-top:6px;">{botao(T("irProximo"), k, "solid", 36, "seta")}</div>', k)

    esquerda = f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;">{rubrica}{efeitos}</div>'

    ref = lambda t: (f'<a href="#" style="display:inline-flex;align-items:center;height:22px;padding:0 7px;border-radius:4px;'
                     f'background:{k["muted"]};font-family:{MONO};font-size:11.5px;color:{k["fgs"]};">{t}</a>')
    porque = (
        f'<article aria-label="{T("porQue")}" style="width:520px;flex:0 0 520px;display:flex;flex-direction:column;gap:16px;padding:6px 8px 0 4px;">'
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("porQue"), k["mfg"])}</div>'
        f'<div style="display:flex;flex-direction:column;gap:14px;font-size:15px;line-height:25px;color:{k["fg"]};max-width:68ch;">'
        f'<p style="margin:0;">{T("p1")}</p>'
        f'<p style="margin:0;">{T("p2a")} {mono("gerarSlots", k, None, 13.5)} {T("p2b")} {mono("Date.now()", k, None, 13.5)} '
        f'{T("p2c")} {mono("relogioFixo", k, None, 13.5)}{T("p2d")}</p>'
        f'<p style="margin:0;">{T("p3")}</p></div>'
        f'<div style="display:flex;flex-direction:column;gap:8px;">'
        f'<span style="font-size:12.5px;color:{k["mfg"]};">{T("ondeOlhar")}</span>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{ref("agenda-slots.test.ts:18")}{ref("agenda-slots.test.ts:41")}{ref("agenda-slots.ts:7")}</div></div>'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid {k["muted"]};">'
        f'<div style="display:flex;align-items:center;gap:8px;">{rotulo(T("explicacaoTit"), k["mfg"])}{badge(T("parcial"), k, "yellow")}</div>'
        f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};">{T("perguntaEx")}</span>'
        f'<p style="margin:0;padding:8px 12px;border-radius:8px;background:{k["sunken"]};font-size:14px;line-height:21px;color:{k["fgs"]};">{T("respostaEx")}</p>'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};max-width:68ch;">{T("porqueEx")}</p></div>'
        f'</article>')
    return app(k, 'avaliacoes', cab + f'<div style="display:flex;gap:32px;flex:1;min-height:0;">{esquerda}{porque}</div>')


# ── 4 · Peer na IDE: quieto quase sempre, pergunta antes de explicar ───
# Segue o tema e o idioma da IDE: sem seletor próprio, copy em pt-BR.
def linha_cod(n, html, k, destaque=False):
    fundo = f'background:{k["tred"]};' if destaque else ''
    return (f'<div style="display:flex;{fundo}"><span style="width:44px;flex:0 0 auto;text-align:right;padding-right:14px;'
            f'color:{k["mfg"]};opacity:0.6;">{n}</span><span style="white-space:pre;">{html}</span></div>')


def tela_peer(k):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    linhas = [
        f'{kw("import")} {{ gerarSlots }} {kw("from")} {st("&quot;../src/agenda-slots&quot;")}',
        '',
        f'{fn("describe")}({st("&quot;gerarSlots&quot;")}, () =&gt; {{',
        f'  {fn("test")}({st("&quot;devolve slots de 30 min no expediente&quot;")}, () =&gt; {{',
        f'    {kw("const")} slots = gerarSlots({{ inicio: {st("&quot;09:00&quot;")}, fim: {st("&quot;18:00&quot;")} }})',
        f'    {fn("expect")}(slots).toHaveLength(18)',
        '  })',
        '',
        f'  {fn("test")}({st("&quot;slots do fim do dia&quot;")}, () =&gt; {{',
        f'    {kw("const")} slots = gerarSlots({{ inicio: {st("&quot;17:00&quot;")}, fim: {st("&quot;18:00&quot;")} }})',
        f'    {fn("expect")}(slots[0].disponivel).toBe({kw("true")})',
        '  })',
        '})',
    ]
    cod = ''.join(linha_cod(i + 1, l, k, destaque=(i == 10)) for i, l in enumerate(linhas))

    arvore = ''
    for nome, nivel, icone, at in [('agenda-slots', 0, 'pasta', False), ('src', 1, 'pasta', False),
                                   ('agenda-slots.ts', 2, 'arquivo', False), ('test', 1, 'pasta', False),
                                   ('agenda-slots.test.ts', 2, 'arquivo', True)]:
        f = f'background:{k["muted"]};color:{k["fgs"]};' if at else f'color:{k["mfg"]};'
        arvore += (f'<div style="display:flex;align-items:center;gap:7px;height:26px;padding-left:{10 + nivel * 14}px;'
                   f'font-size:12.5px;border-radius:5px;{f}">{ic(icone, 13)}{nome}</div>')

    ide = (
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["bg"]};">'
        f'<div style="height:38px;flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:0 14px;'
        f'border-bottom:1px solid {k["border"]};font-size:12px;color:{k["mfg"]};">'
        f'<span style="display:flex;gap:6px;">'
        + ''.join(f'<span style="width:10px;height:10px;border-radius:999px;background:{k["muted"]};"></span>' for _ in range(3))
        + f'</span><span style="margin-left:8px;">agenda-slots · exercícios Muriki</span></div>'
        f'<div style="flex:1;min-height:0;display:flex;">'
        f'<div style="width:220px;flex:0 0 auto;padding:10px 8px;border-right:1px solid {k["border"]};background:{k["rail"]};'
        f'display:flex;flex-direction:column;gap:2px;">'
        f'<div style="padding:4px 10px 8px;">{rotulo("Arquivos", k["mfg"], 9.5)}</div>{arvore}</div>'
        f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">'
        f'<div style="height:34px;display:flex;align-items:flex-end;padding:0 8px;border-bottom:1px solid {k["border"]};">'
        f'<span style="display:flex;align-items:center;gap:7px;height:30px;padding:0 12px;border-radius:6px 6px 0 0;'
        f'background:{k["card"]};font-size:12px;color:{k["fgs"]};">{ic("arquivo", 12)}agenda-slots.test.ts</span></div>'
        f'<div style="flex:1;padding:14px 0;background:{k["card"]};font-family:{MONO};font-size:12.5px;line-height:22px;color:{k["fg"]};">{cod}</div>'
        f'<div style="height:220px;flex:0 0 auto;border-top:1px solid {k["border"]};background:{k["rail"]};padding:10px 16px;'
        f'font-family:{MONO};font-size:12px;line-height:20px;color:{k["fg"]};display:flex;flex-direction:column;">'
        f'<div style="display:flex;gap:16px;margin-bottom:8px;font-family:{FONTE};font-size:11.5px;">'
        f'<span style="color:{k["fgs"]};border-bottom:1px solid {k["fgs"]};padding-bottom:4px;">Terminal</span>'
        f'<span style="color:{k["mfg"]};">Problemas</span></div>'
        f'<span style="color:{k["mfg"]};">$ bun test</span>'
        f'<span><span style="color:{k["ok"]};">✓</span> gerarSlots &gt; devolve slots de 30 min no expediente</span>'
        f'<span><span style="color:{k["bad"]};">✗</span> gerarSlots &gt; slots do fim do dia</span>'
        f'<span style="color:{k["mfg"]};">    Expected: true</span>'
        f'<span style="color:{k["mfg"]};">    Received: <span style="color:{k["bad"]};">false</span></span>'
        f'<span style="color:{k["mfg"]};">    at agenda-slots.test.ts:11</span>'
        f'<span style="margin-top:6px;"><span style="color:{k["ok"]};">1 pass</span>  <span style="color:{k["bad"]};">1 fail</span></span>'
        f'</div></div></div></div>')

    degraus = ''
    for i, t in enumerate(['pergunta', 'dica', 'explicação']):
        at = i == 0
        f = (f'background:{k["prisub"]};color:{k["prisubfg"]};' if at
             else f'color:{k["mfg"]};border:1px dashed {k["input"]};')
        degraus += f'<span style="display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:4px;font-size:11.5px;{f}">{t}</span>'
        if i < 2:
            degraus += f'<span style="display:flex;width:12px;height:12px;color:{k["mfg"]};">{I["seta"]}</span>'

    pergunta = ('O teste <b style="font-weight:600;">slots do fim do dia</b> passou às 14h e falhou agora, '
                'sem você mexer no código. O que muda entre as duas execuções que o código não controla?')
    fala_peer = lambda t: f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};max-width:68ch;">{t}</p>'
    painel = (
        f'<aside aria-label="Peer" style="width:420px;flex:0 0 420px;background:{k["rail"]};border-left:1px solid {k["border"]};'
        f'display:flex;flex-direction:column;">'
        f'<header style="display:flex;align-items:center;gap:10px;height:52px;padding:0 16px;border-bottom:1px solid {k["border"]};">'
        f'<span style="display:flex;width:24px;height:24px;">{LOGO}</span>'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Peer</span>'
        f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
        f'<span style="width:7px;height:7px;border-radius:999px;background:{k["ok"]};"></span>observando</span>'
        f'<span style="margin-left:auto;">{badge("Testing · Pleno", k, "blue")}</span></header>'
        f'<div style="flex:1;min-height:0;padding:18px 18px;display:flex;flex-direction:column;gap:16px;overflow:hidden;">'
        f'<div style="display:flex;align-items:center;gap:6px;">{degraus}</div>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">test.failed · agenda-slots.test.ts:11</span>'
        f'{fala_peer(pergunta)}'
        f'</div>'
        f'<div style="align-self:flex-end;max-width:320px;padding:10px 13px;border-radius:12px 12px 4px 12px;'
        f'background:{k["card"]};box-shadow:{k["sombra"]};font-size:14px;line-height:21px;color:{k["fgs"]};">'
        f'o horário da máquina? to usando Date.now() dentro do gerarSlots</div>'
        f'{fala_peer("Isso. Se o horário entrasse como parâmetro em vez de ser lido lá dentro, como ficaria esse teste?")}'
        f'<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:{k["sunken"]};">'
        f'{badge("peer.interaction", k, "gray", mono=True)}<span style="font-size:12px;color:{k["mfg"]};">registrada como evidência de Testing</span></div>'
        f'</div>'
        f'<div style="padding:14px 16px;border-top:1px solid {k["border"]};display:flex;flex-direction:column;gap:10px;">'
        f'<label for="peer-msg" style="font-size:12px;color:{k["mfg"]};">Pergunte ao Peer</label>'
        f'<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};">'
        f'<textarea id="peer-msg" rows="2" placeholder="Escreva o que você está pensando" style="resize:none;border:0;outline:0;'
        f'background:transparent;font-family:{FONTE};font-size:14px;line-height:21px;color:{k["fgs"]};"></textarea>'
        f'<div style="display:flex;align-items:center;gap:8px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">⌘ ↵ envia</span>'
        f'<span style="margin-left:auto;">{botao("", k, "primary", 30, "enviar", aria="Enviar ao Peer")}</span></div></div>'
        f'<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:{k["mfg"]};">'
        f'{ic("cadeado", 13)}<span style="flex:1;">Ligado neste projeto. Só o trecho em volta do evento é enviado.</span>'
        f'<a href="#" style="font-size:12px;">Desligar</a></div></div>'
        f'</aside>')

    return f'{raiz(k, "display:flex;", lang="pt-BR")}{ide}{painel}</div>'


# ── 5 · Conectar a IDE: o código aparece na IDE, a confirmação é no navegador
def tela_conectar(k):
    pode = lambda t, ok: (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:20px;color:{k["fg"]};">'
                          f'<span style="margin-top:2px;">{ic("check" if ok else "x", 14, k["ok"] if ok else k["bad"])}</span>{t}</li>')
    codigo = ''.join(
        f'<span style="display:flex;align-items:center;justify-content:center;width:44px;height:56px;border-radius:8px;'
        f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);font-family:{MONO};font-size:26px;font-weight:500;color:{k["fgs"]};">{c}</span>'
        if c != '-' else f'<span style="width:14px;height:2px;background:{k["input"]};"></span>'
        for c in 'K7QM-4TXD')
    card = (
        f'<section aria-labelledby="conectar-titulo" style="width:560px;background:{k["card"]};border-radius:16px;box-shadow:{k["sombraFlut"]};'
        f'padding:32px 36px;display:flex;flex-direction:column;gap:22px;">'
        f'<div style="display:flex;flex-direction:column;gap:8px;">{rotulo(T("rotulo"), k["mfg"])}'
        f'<h1 id="conectar-titulo" style="margin:0;font-size:24px;line-height:30px;font-weight:600;color:{k["fgs"]};">{T("titulo")}</h1>'
        f'<p style="margin:0;font-size:14px;color:{k["mfg"]};">{T("pedidoA")} '
        f'<b style="font-weight:500;color:{k["fg"]};">{T("pedidoIde")}</b>{T("pedidoB")}</p></div>'
        f'<div style="display:flex;align-items:center;gap:8px;">{codigo}</div>'
        f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:20px;padding-top:4px;border-top:1px solid {k["muted"]};">'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;">'
        f'<span style="font-size:12.5px;font-weight:600;color:{k["fgs"]};">{T("vaiPoder")}</span>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
        f'{pode(T("pode1"), True)}'
        f'{pode(T("pode2"), True)}</ul></div>'
        f'<div style="display:flex;flex-direction:column;gap:10px;padding-top:16px;">'
        f'<span style="font-size:12.5px;font-weight:600;color:{k["fgs"]};">{T("nunca")}</span>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">'
        f'{pode(T("nunca1"), False)}'
        f'{pode(T("nunca2"), False)}</ul></div></div>'
        f'<div style="display:flex;gap:10px;">{botao(T("conectar"), k, "solid", 40)}{botao(T("naoFuiEu"), k, "outline", 40)}</div>'
        f'</section>')

    disp = lambda nome, sub: (
        f'<li style="display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid {k["muted"]};">'
        f'<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:{k["muted"]};">{ic("laptop", 16, k["mfg"])}</span>'
        f'<span style="display:flex;flex-direction:column;flex:1;"><span style="font-size:13.5px;font-weight:500;color:{k["fgs"]};">{nome}</span>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{sub}</span></span>'
        f'{botao(T("desconectar"), k, "ghost", 30, "sair")}</li>')
    dispositivos = (
        f'<section aria-label="{T("dispositivos")}" style="width:560px;display:flex;flex-direction:column;gap:6px;">'
        f'<div style="display:flex;align-items:center;justify-content:space-between;padding:0 2px 6px;">'
        f'{rotulo(T("jaConectadas"), k["mfg"])}<span style="font-size:12px;color:{k["mfg"]};">{T("cadaIde")}</span></div>'
        f'<ul style="margin:0;padding:0;list-style:none;">'
        f'{disp("Cursor · Linux", T("cursorSub"))}</ul></section>')

    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki")}'
            f'<main style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding-bottom:64px;">'
            f'{card}{dispositivos}</main></div>')


# ── 6 · Planos: dois, e independentes do Platform ──────────────────────
def tela_planos(k):
    toggle = (f'<div role="radiogroup" aria-label="{T("periodo")}" style="display:inline-flex;padding:3px;border-radius:999px;'
              f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);">'
              f'<button type="button" role="radio" aria-checked="true" style="height:30px;padding:0 16px;border-radius:999px;border:0;'
              f'background:{k["card"]};box-shadow:{k["sombra"]};font-family:{FONTE};font-size:13px;font-weight:500;color:{k["fgs"]};">{T("mensal")}</button>'
              f'<button type="button" role="radio" aria-checked="false" style="height:30px;padding:0 16px;border-radius:999px;border:0;'
              f'background:transparent;font-family:{FONTE};font-size:13px;color:{k["mfg"]};">{T("anual")}</button></div>')
    cab = cabecalho(k, None, T('titulo'), T('sub'), direita=toggle)

    def item(t, ok=True, tracejado=False):
        if tracejado:
            marca = f'<span style="margin-top:1px;">{badge(T("aDefinir"), k, tracejado=True)}</span>'
            return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["mfg"]};">'
                    f'<span style="flex:1;">{t}</span>{marca}</li>')
        return (f'<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:22px;color:{k["fg"]};">'
                f'<span style="margin-top:3px;">{ic("check", 15, k["ok"])}</span><span>{t}</span></li>')

    def plano(nome, aria, preco, sub, itens, acao, destaque=False, selo=''):
        borda = f'box-shadow:0 0 0 1.5px {k["pri"]}, {k["sombraFlut"]};' if destaque else f'box-shadow:{k["sombra"]};'
        return (f'<section aria-label="{aria}" style="flex:1;min-width:0;background:{k["card"]};border-radius:16px;{borda}'
                f'padding:28px 30px;display:flex;flex-direction:column;gap:20px;">'
                f'<div style="display:flex;align-items:center;gap:8px;">'
                f'<h2 style="margin:0;font-size:18px;font-weight:600;color:{k["fgs"]};">{nome}</h2>{selo}</div>'
                f'<div style="display:flex;flex-direction:column;gap:4px;">'
                f'<span style="font-size:34px;line-height:40px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.02em;">{preco}</span>'
                f'<span style="font-size:13px;color:{k["mfg"]};">{sub}</span></div>'
                f'<ul style="margin:0;padding:18px 0 0;border-top:1px solid {k["muted"]};list-style:none;display:flex;flex-direction:column;gap:12px;flex:1;">{itens}</ul>'
                f'{acao}</section>')

    starter = plano(
        'Starter', T('ariaStarter'), T('gratis'), T('semCartao'),
        item(T('s1'))
        + item(T('s2'))
        + item(T('s3'))
        + item(T('s4'), tracejado=True)
        + item(T('peer'), tracejado=True),
        botao(T('mudarStarter'), k, 'outline', 40, largura='100%'))
    pro = plano(
        'Pro', T('ariaPro'), f'{T("preco")}<span style="font-size:15px;font-weight:500;color:{k["mfg"]};">{T("porMes")}</span>',
        f'{T("porAno")} · <b style="font-weight:500;color:{k["ok"]};">{T("testeAte")}</b>',
        item(T('p1'))
        + item(T('p2'))
        + item(T('p3'))
        + item(T('p4'))
        + item(T('p5'), tracejado=True),
        botao(T('atualBotao'), k, 'outline', 40, largura='100%', desativado=True),
        destaque=True, selo=badge(T('atual'), k, 'blue'))

    regra = lambda icone, t: (f'<li style="display:flex;gap:10px;align-items:flex-start;flex:1;font-size:13px;line-height:20px;color:{k["mfg"]};">'
                              f'<span style="margin-top:2px;">{ic(icone, 15, k["mfg"])}</span><span>{t}</span></li>')
    regras = (f'<ul style="margin:0;padding:18px 4px 0;list-style:none;display:flex;gap:28px;border-top:1px solid {k["muted"]};">'
              f'{regra("relogio", T("r1"))}'
              f'{regra("troca", T("r2"))}'
              f'{regra("peer", T("r3"))}</ul>')
    return app(k, 'plano', cab + f'<div style="display:flex;gap:24px;max-width:980px;">{starter}{pro}</div>{regras}')


# ── Entrar e criar conta: o bloco login-page do DS, com a mensagem do Code ──
# Estrutura, medidas e hierarquia vêm de registry/muriki/blocks/login-page; o que é do Code
# é o texto (o bloco lê tudo do i18n do app) e os provedores: GitHub na frente, sem SSO nem
# Microsoft, porque o Code não tem organização.
def tela_acesso(k, modo, sufixo):
    criar = modo == 'criar'
    h = lambda caminho: '{{' + caminho + '}}'
    linha = lambda cor, largura: f'<span style="height:1px;{largura}background:{cor};"></span>'

    decoracao = (
        f'<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;'
        f'background:linear-gradient(to bottom right, color-mix(in oklch, {k["pri"]} 15%, transparent), transparent 50%, transparent);"></div>'
        f'<div aria-hidden="true" style="position:absolute;top:-96px;left:-96px;width:520px;height:520px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["pri"]} 20%, transparent);filter:blur(160px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:0;bottom:0;width:420px;height:420px;border-radius:999px;'
        f'transform:translate(33.333%, 25%);background:color-mix(in oklch, {k["accent"]} 25%, transparent);filter:blur(120px);pointer-events:none;"></div>'
        f'<div aria-hidden="true" style="position:absolute;right:-40px;bottom:-64px;width:480px;height:480px;display:flex;'
        f'opacity:0.08;transform:rotate(-6deg);pointer-events:none;">'
        f'<span style="display:{{{{senha.olhoA}}}};width:100%;height:100%;">{LOGO}</span><span style="display:{{{{senha.olhoF}}}};width:100%;height:100%;">{LOGO_FECHADO}</span>'
        f'</div>')
    painel = (
        f'<aside style="position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;'
        f'padding:64px;background:{k["sunken"]};box-shadow:inset -1px 0 0 {k["border"]};">{decoracao}'
        f'<div style="position:relative;z-index:1;display:flex;align-items:center;gap:10px;">'
        f'<span style="display:flex;width:36px;height:36px;">'
        f'<span style="display:{{{{senha.olhoA}}}};width:100%;height:100%;">{LOGO}</span><span style="display:{{{{senha.olhoF}}}};width:100%;height:100%;">{LOGO_FECHADO}</span>'
        f'</span>{legenda("muriki / code", k)}</div>'
        f'<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:24px;max-width:512px;">'
        f'<div style="display:flex;align-items:center;gap:12px;">{legenda(T("acesso"), k, "0.3em")}{linha(k["pri"], "width:64px;")}</div>'
        f'<h2 style="margin:0;font-size:72px;line-height:0.95;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
        f'{T("pitch1")}<br><span style="color:{k["pri"]};">{T("pitch2")}.</span></h2>'
        f'<p style="margin:0;max-width:384px;font-size:16px;line-height:1.625;color:{k["mfg"]};">{T("pitchTxt")}</p></div>'
        f'<div style="position:relative;z-index:1;">{legenda(T("direitos"), k)}</div></aside>')

    def provedor_largo(icone, nome):
        return (f'<button type="button" aria-label="{T("criarCom" if criar else "entrarCom")} {nome}" style="display:flex;align-items:center;'
                f'justify-content:center;gap:10px;width:100%;height:44px;border-radius:10px;border:1px solid {k["input"]};'
                f'background:{k["card"]};font-family:{FONTE};cursor:pointer;">'
                f'<span style="display:flex;width:18px;height:18px;color:{k["fgs"]};">{I[icone]}</span>'
                f'<span style="font-size:14px;font-weight:500;letter-spacing:-0.01em;color:{k["fgs"]};">{nome}</span></button>')

    def campo(id_, rotulo_, icone, tipo, valor, mudar, ph, cabeca='', depois='', olho=False, auto=''):
        botao_olho = ''
        if olho:
            botao_olho = (f'<button type="button" aria-label="{h("senha.olhoRotulo")}" aria-pressed="{h("senha.verSenha")}" '
                          f'onClick="{h("alternarSenha")}" style="position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;'
                          f'align-items:center;justify-content:center;width:32px;height:32px;border:0;background:transparent;color:{k["mfg"]};cursor:pointer;">'
                          f'<sc-if value="{h("senha.naoVer")}" hint-placeholder-val="{{{{ true }}}}">{ic("olho", 18)}</sc-if>'
                          f'<sc-if value="{h("senha.verSenha")}" hint-placeholder-val="{{{{ false }}}}">{ic("olho_fechado", 18)}</sc-if></button>')
        return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
                f'<div style="display:flex;align-items:center;justify-content:space-between;">'
                f'<label for="{id_}" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.25em;'
                f'text-transform:uppercase;color:{k["mfg"]};">{rotulo_}</label>{cabeca}</div>'
                f'<div style="position:relative;display:flex;align-items:center;">'
                f'<span style="position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;opacity:0.6;color:{k["mfg"]};">{ic(icone, 18)}</span>'
                f'<input id="{id_}" type="{tipo}" autocomplete="{auto}" placeholder="{ph}" value="{h(valor)}" onChange="{h(mudar)}" '
                f'style="width:100%;height:44px;padding:0 {36 if olho else 0}px 0 28px;border:0;border-bottom:1px solid {k["input"]};'
                f'border-radius:0;background:transparent;font-family:{FONTE};font-size:16px;color:{k["fgs"]};outline:0;">'
                f'{botao_olho}</div>{depois}</div>')

    # a mesma régua do DS: 8 caracteres, número, minúscula e maiúscula; vazia, a barra guarda o lugar
    forca = (
        f'<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px;visibility:{h("senha.visivel")};">'
        f'<div role="meter" aria-label="{T("forcaAria")}" aria-valuemin="0" aria-valuemax="4" aria-valuenow="{h("senha.feitos")}" '
        f'aria-valuetext="{h("senha.rotulo")}" style="display:flex;gap:6px;">'
        + ''.join(f'<span style="height:4px;flex:1;border-radius:999px;background:{h(f"senha.s{x}")};"></span>' for x in range(1, 5))
        + f'</div><ul aria-label="{T("reqAria")}" style="margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:4px 10px;">'
        f'<sc-for list="{h("senha.req")}" as="r" hint-placeholder-count="4">'
        f'<li style="display:flex;align-items:center;gap:4px;font-family:{MONO};font-size:10px;line-height:14px;letter-spacing:0.025em;color:{h("r.cor")};">'
        f'<sc-if value="{h("r.ok")}" hint-placeholder-val="{{{{ true }}}}">{ic("check", 12)}</sc-if>'
        f'<sc-if value="{h("r.nao")}" hint-placeholder-val="{{{{ false }}}}"><span style="display:flex;opacity:0.6;">{ic("x", 12)}</span></sc-if>'
        f'<span>{h("r.txt")}</span></li></sc-for></ul></div>')

    enviar = lambda txt, href: (
        f'<a href="{href}" style="display:flex;align-items:center;justify-content:space-between;height:44px;padding:0 20px;'
        f'border-radius:10px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;letter-spacing:0.025em;">'
        f'<span>{txt}</span><span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;'
        f'background:color-mix(in oklch, {k["prifg"]} 15%, transparent);">{ic("seta", 14)}</span></a>')

    if criar:
        rotulo_, hero_a, hero_b = T('rotuloCriar'), T('heroCriarA'), T('heroCriarB')
        sub = f'{T("subCriar")} <a href="Entrar{sufixo}.dc.html" style="font-weight:500;color:{k["fg"]};">{T("entrarLink")}</a>'
        com = T('criarCom')
        campos = (campo('nome', T('nomeLabel'), 'pessoa', 'text', 'nome', 'mudarNome', T('nomePh'), auto='name')
                  + campo('email', T('emailLabel'), 'envelope', 'email', 'email', 'mudarEmail', T('emailPh'), auto='email')
                  + campo('senha', T('senhaLabel'), 'cadeado', h('senha.tipo'), 'senha.valor', 'mudarSenha', T('senhaNovaPh'),
                          depois=forca, olho=True, auto='new-password'))
        # o aceite dos termos mora no Perfil: é onde a API o registra
        fim = (enviar(T('criarBotao'), f'PlanoInicial{sufixo}.dc.html')
               + f'<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
                 f'{ic("cadeado", 13)}{T("semTreino")}</span>')
        gap_form = 20
    else:
        rotulo_, hero_a, hero_b = T('entrar'), T('heroA'), T('heroB')
        sub = f'{T("subEntrar")} <a href="CriarConta{sufixo}.dc.html" style="font-weight:500;color:{k["fg"]};">{T("criarLink")}</a>'
        com = T('entrarCom')
        esqueci = (f'<a href="#" style="font-family:{MONO};font-size:10px;font-weight:500;letter-spacing:0.2em;'
                   f'text-transform:uppercase;color:{k["mfg"]};">{T("esqueci")}</a>')
        campos = (campo('email', T('emailLabel'), 'envelope', 'email', 'email', 'mudarEmail', T('emailPh'), auto='email webauthn')
                  + campo('senha', T('senhaLabel'), 'cadeado', h('senha.tipo'), 'senha.valor', 'mudarSenha', T('senhaPh'),
                          cabeca=esqueci, olho=True, auto='current-password'))
        # sem "lembrar de mim": todo login do Code já é persistente
        fim = enviar(T('entrar'), f'Main{sufixo}.dc.html')
        gap_form = 24
    if modo == 'passkey':
        rotulo_, hero_a, hero_b, sub = T('rotuloPasskey'), T('heroPasskeyA'), T('heroPasskeyB'), T('subPasskey')

    if modo == 'passkey':
        # o mesmo pedido da passkey do backoffice: o navegador abre o pedido e a tela espera
        aneis = ''.join(
            f'<span aria-hidden="true" style="position:absolute;inset:{-i * 14}px;border-radius:999px;'
            f'box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["pri"]} {40 - i * 12}%, transparent);"></span>' for i in (1, 2, 3))
        corpo = (
            f'<div role="status" style="display:flex;flex-direction:column;align-items:center;gap:22px;padding:34px 24px 26px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:inset 0 0 0 1px {k["border"]}, {k["sombra"]};">'
            f'<span style="position:relative;display:flex;align-items:center;justify-content:center;width:72px;height:72px;margin:18px 0;'
            f'border-radius:999px;background:{k["prisub"]};color:{k["pri"]};">{aneis}<span style="display:flex;width:34px;height:34px;">{I["digital"]}</span></span>'
            f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;">'
            f'<span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:{k["fgs"]};">'
            f'<span style="width:7px;height:7px;border-radius:999px;background:{k["warn"]};"></span>{T("aguardando")}</span>'
            f'<span style="font-size:13px;line-height:19px;color:{k["mfg"]};max-width:320px;">{T("aguardandoTxt")}</span></div>'
            f'<a href="#" style="display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 12px;border-radius:8px;'
            f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};color:{k["fgs"]};font-size:13px;font-weight:500;">'
            f'{ic("troca", 14)}{T("pedirDeNovo")}</a></div>'
            f'<div style="display:flex;align-items:flex-start;gap:10px;font-size:12.5px;line-height:18px;color:{k["mfg"]};">'
            f'<span style="display:flex;margin-top:1px;color:{k["ok"]};">{ic("cadeado", 15)}</span><span>{T("passkeyNota")}</span></div>'
            f'<a href="Entrar{sufixo}.dc.html" style="display:inline-flex;align-items:center;gap:6px;align-self:flex-start;'
            f'font-size:13px;font-weight:500;color:{k["mfg"]};"><span style="display:flex;transform:rotate(180deg);">{ic("seta", 13)}</span>'
            f'{T("usarEmail")}</a>')
    else:
        # a API do Code entra por email e senha ou por passkey, sem GitHub nem Google; a passkey só
        # existe depois da conta criada, então o criar conta fica só com o formulário
        entrada = ''
        if not criar:
            entrada = (
                f'<div style="display:flex;flex-direction:column;gap:10px;">{legenda(com, k)}'
                f'<a href="Passkey{sufixo}.dc.html" style="display:grid;">{provedor_largo("digital", "Passkey")}</a>'
                f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{T("passkeyDica")}</span></div>'
                f'<div style="display:flex;align-items:center;gap:12px;">{linha(k["input"], "flex:1;")}{legenda(T("ou"), k)}{linha(k["input"], "flex:1;")}</div>')
        corpo = f'{entrada}<form style="display:flex;flex-direction:column;gap:{gap_form}px;margin:0;">{campos}{fim}</form>'

    formulario = (
        f'<div style="grid-column:2;display:flex;flex-direction:column;gap:20px;">'
        f'<div style="display:flex;align-items:center;gap:12px;">{legenda(rotulo_, k)}{linha(k["pri"], "width:40px;")}{linha(k["input"], "flex:1;")}</div>'
        f'<div style="display:flex;flex-direction:column;gap:12px;">'
        f'<h1 style="margin:0;font-size:36px;line-height:1;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">'
        f'{hero_a}<br><span style="color:{k["pri"]};">{hero_b}</span></h1>'
        f'<p style="margin:0;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p></div>'
        f'{corpo}</div>')

    lado = (f'<main style="position:relative;display:flex;flex-direction:column;min-width:0;">'
            f'<header style="display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:32px 48px 0;">'
            f'{botao_idioma(k)}{botao_tema(k)}</header>'
            f'<div style="flex:1;display:grid;grid-template-columns:minmax(0, 0.8fr) minmax(0, 440px) minmax(0, 1fr);'
            f'align-content:center;padding:24px 80px;">{formulario}</div></main>')
    return f'{raiz(k, "display:grid;grid-template-columns:1.05fr 1fr;")}{painel}{lado}</div>'


def antes_acesso(nome, email, senha):
    return f"""const nome = s.nome == null ? {json.dumps(nome)} : s.nome;
const email = s.email == null ? {json.dumps(email)} : s.email;
const valor = s.senha == null ? {json.dumps(senha)} : s.senha;
const ver = !!s.verSenha;
const REQ = [["req8", valor.length >= 8], ["reqNum", /\\d/.test(valor)], ["reqMin", /[a-z]/.test(valor)], ["reqMai", /[A-Z]/.test(valor)]];
const feitos = REQ.filter((r) => r[1]).length;
const forca = !valor ? "" : feitos <= 1 ? "Fraca" : feitos === 2 ? "Media" : feitos === 3 ? "Forte" : "MuitoForte";
const cor = forca === "Fraca" ? "var(--bad)" : forca === "Media" ? "var(--warn)" : "var(--ok)";
const seg = (x) => (valor && x < feitos ? cor : "var(--sunken)");
const senha = {{
valor: valor, tipo: ver ? "text" : "password", verSenha: ver, naoVer: !ver,
olhoA: ver ? "none" : "flex", olhoF: ver ? "flex" : "none",
olhoRotulo: ver ? t.ocultarSenha : t.mostrarSenha,
visivel: valor ? "visible" : "hidden", feitos: valor ? feitos : 0, rotulo: forca ? t["forca" + forca] : "",
s1: seg(0), s2: seg(1), s3: seg(2), s4: seg(3),
req: REQ.map((r) => ({{ txt: t[r[0]], ok: r[1], nao: !r[1], cor: r[1] ? "var(--ok)" : "var(--mfg)" }}))
}};"""


VALORES_ACESSO = """nome: nome,
email: email,
senha: senha,
mudarNome: (e) => this.setState({ nome: e.target.value }),
mudarEmail: (e) => this.setState({ email: e.target.value }),
mudarSenha: (e) => this.setState({ senha: e.target.value }),
alternarSenha: () => this.setState({ verSenha: !ver })"""


# ── Perfil vazio: o que a pessoa vê antes da primeira evidência ─────────
def tela_perfil_vazio(k, sufixo):
    cab = cabecalho(k, None, T('titulo'), T('subVazio'),
                    direita=f'<div style="display:flex;gap:8px;">{botao(T("comoMedido"), k, "ghost")}</div>')
    tabela = tabela_perfil(k, PERFIL_INICIAL, dica={'Testing': 'entraPrimeiro', 'Debugging': 'entraPrimeiro'})

    proximo = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("proximoPasso"), k["mfg"])}'
        f'{badge("Testing · Debugging", k, "blue")}</div>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:17px;line-height:23px;font-weight:600;color:{k["fgs"]};">{T("primeiroTitulo")}</h2>'
        f'<p style="margin:0;font-size:13px;color:{k["mfg"]};">{T("primeiroTxt")}</p></div>'
        f'<div style="display:flex;gap:8px;">{botao_link(T("comecar"), f"PrimeiroExercicio{sufixo}.dc.html", k, "solid", 36)}'
        f'{botao_link(T("trocarJornada"), f"Preferencias{sufixo}.dc.html", k, "ghost", 36)}</div>', k)
    fontes = ''.join(badge(T(f), k, mono=True, tracejado=True)
                     for f in ['fonteExercicio', 'fonteExplicacao', 'fontePeer', 'fontePlayground'])
    recente = cartao(
        f'{rotulo(T("evRecente"), k["mfg"])}'
        f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["fg"]};">{T("nadaAinda")}</p>'
        f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{fontes}</div>', k, pad='18px 22px')
    trajetoria = cartao(
        f'{rotulo(T("trajetoria"), k["mfg"])}'
        f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["fg"]};">{T("trajVazio")}</p>', k, pad='18px 22px')
    lado = f'<aside style="width:348px;flex:0 0 348px;display:flex;flex-direction:column;gap:14px;">{proximo}{recente}{trajetoria}</aside>'
    return app(k, 'evolucao', cab + f'<div style="display:flex;gap:20px;align-items:flex-start;flex:1;min-height:0;">{tabela}{lado}</div>', gap=20)


# ── Primeiro acesso, passo 1: o plano (só a escolha) ───────────────────
# Vem logo depois de criar a conta. A API só cobra depois das preferências (checkout exige o
# onboarding concluído), então aqui é só a escolha; quem escolheu Pro paga no fim, com 7 dias grátis.
# A PricingScreen do DS (onboarding-pricing + plan-card), a mesma do Platform: barra de passos,
# título de display, rótulo de seção, período à direita e os cards com a CTA de cada um. O Starter
# é tingido e o Pro, recomendado, é o único sólido. `estado: carregando` mostra o skeleton do plan-card.
def tela_plano_inicial(k, sufixo):
    h = lambda caminho: '{{' + caminho + '}}'
    sk = lambda estilo: f'<span class="muriki-skeleton" style="display:block;{estilo}"></span>'
    regua = (f'<span aria-hidden="true" style="display:block;height:1px;background:{"var(--divider)"};'
             f'-webkit-mask-image:linear-gradient(to right,transparent,black 12%,black 88%,transparent);'
             f'mask-image:linear-gradient(to right,transparent,black 12%,black 88%,transparent);"></span>')

    cab = cabecalho_passo(k, 1, T('tituloInicial'), T('subInicial'))

    secao = (f'<div style="display:flex;align-items:center;gap:12px;">'
             f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:{k["mfg"]};">{T("secaoPlanos")}</span>'
             f'<span style="height:1px;width:32px;background:color-mix(in oklch, {k["pri"]} 60%, transparent);"></span>'
             f'<span style="height:1px;width:128px;background:{"var(--divider)"};"></span></div>')
    seg = lambda v, txt, extra='': (
        f'<button type="button" role="tab" aria-selected="{h("per." + v)}" onClick="{h("per.ir_" + v)}" '
        f'style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 14px;border:0;border-radius:999px;'
        f'background:{h("per.fundo_" + v)};box-shadow:{h("per.sombra_" + v)};color:{h("per.cor_" + v)};'
        f'font-family:{FONTE};font-size:13px;font-weight:500;cursor:pointer;">{txt}{extra}</button>')
    periodo = (f'<div role="tablist" aria-label="{T("periodo")}" style="margin-left:auto;display:inline-flex;gap:2px;padding:3px;'
               f'border-radius:999px;background:{k["sunken"]};">'
               f'{seg("mes", T("mensal"))}{seg("ano", T("anual"), badge(T("economia"), k, "green"))}</div>')
    # o Pro pode ter só mensal (GET /plans): com um período só, o seletor some
    controles = (f'<div style="display:flex;align-items:center;gap:12px;min-height:36px;">'
                 f'<sc-if value="{h("doisPeriodos")}" hint-placeholder-val="{{{{ true }}}}">{periodo}</sc-if></div>')

    def feature(t, faisca=False):
        if faisca:
            return (f'<li style="display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:19px;font-weight:500;color:{k["fgs"]};">'
                    f'<span style="margin-top:2px;display:flex;color:{k["pri"]};">{ic("brilho", 14)}</span><span>{t}</span></li>')
        return (f'<li style="display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:19px;color:{k["fg"]};">'
                f'<span style="margin-top:2px;display:flex;color:{k["ok"]};">{ic("check", 14)}</span><span>{t}</span></li>')

    def card(nome, desc, selo, preco, nota, feats, titulo_feats, cta, destaque, teste=''):
        borda = (f'border:1px solid {k["pri"]};box-shadow:0 4px 12px rgba(0,0,0,0.08);transform:scale(1.03);' if destaque
                 else f'border:1px solid {k["border"]};box-shadow:{k["sombra"]};')
        botao_ = (f'background:{k["pri"]};color:{k["prifg"]};' if destaque
                  else f'background:{k["prisub"]};color:{k["prisubfg"]};')
        tf = (f'<p style="margin:0;font-family:{MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:{k["mfg"]};">{titulo_feats}</p>'
              if titulo_feats else '')
        return (f'<article aria-label="{nome}" style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:14px;background:{k["card"]};{borda}">'
                f'<header style="display:flex;flex-direction:column;gap:6px;">'
                f'<div style="display:flex;align-items:center;height:22px;">{selo}</div>'
                f'<h3 style="margin:0;font-size:28px;line-height:1.05;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{nome}</h3>'
                f'<p style="margin:0;font-size:14px;line-height:1.35;color:{k["mfg"]};">{desc}</p></header>'
                f'{regua}<div style="display:flex;flex-direction:column;gap:6px;">{teste}'
                f'<p style="margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px;">{preco}</p>'
                f'<span style="font-size:12.5px;color:{k["mfg"]};">{nota}</span></div>'
                f'{regua}<div style="flex:1;display:flex;flex-direction:column;gap:8px;">{tf}'
                f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">{feats}</ul></div>'
                f'<a href="Verificacao{sufixo}.dc.html" style="display:flex;align-items:center;justify-content:center;height:36px;'
                f'border-radius:9px;{botao_}font-size:14px;font-weight:500;">{cta}</a></article>')

    valor = lambda v: f'<span style="font-size:30px;line-height:1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};font-variant-numeric:tabular-nums;">{v}</span>'
    starter = card('Starter', T('descStarter'), '', valor(T('gratis')), T('notaStarter'),
                   feature(T('s1')) + feature(T('s2')) + feature(T('s3')), '', T('ctaStarter'), False)
    pro = card('Pro', T('descPro'), badge(T('recomendado'), k, 'blue'),
               valor(h('per.preco')) + f'<span style="font-size:14px;color:{k["mfg"]};">/{h("per.intervalo")}</span>', h('per.nota'),
               feature(T('p2'), True) + feature(T('p3'), True) + feature(T('p4'), True), T('tudoStarter'), T('ctaPro'), True,
               teste=(f'<span style="align-self:flex-start;">{badge(T("teste"), k, "green", mono=True)}</span>'))

    def esqueleto(destaque):
        borda = f'border:1px solid {k["pri"]};' if destaque else f'border:1px solid {k["border"]};'
        sel = sk(f'height:18px;width:96px;border-radius:4px;background-color:color-mix(in oklch, {k["pri"]} 25%, transparent);') if destaque else ''
        return (f'<div aria-hidden="true" style="display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:14px;background:{k["card"]};{borda}box-shadow:{k["sombra"]};">'
                f'<div style="display:flex;align-items:center;height:22px;">{sel}</div>'
                f'<div style="display:flex;flex-direction:column;gap:8px;">{sk("height:20px;width:144px;")}{sk("height:12px;width:176px;")}</div>'
                f'{sk("height:20px;width:112px;border-radius:999px;")}'
                f'<div style="display:flex;flex-direction:column;gap:8px;">{sk("height:40px;width:176px;")}{sk("height:12px;width:64px;")}</div>'
                f'<div style="flex:1;display:flex;flex-direction:column;gap:10px;padding-top:4px;">'
                f'{sk("height:12px;width:85%;")}{sk("height:12px;width:72%;")}{sk("height:12px;width:78%;")}{sk("height:12px;width:60%;")}</div>'
                + sk(f'height:40px;width:100%;' + (f'background-color:color-mix(in oklch, {k["pri"]} 25%, transparent);' if destaque else '')) + '</div>')

    grade = lambda filhos: (f'<div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:24px;width:672px;margin:0 auto;">{filhos}</div>')
    planos = (f'<sc-if value="{h("pronto")}" hint-placeholder-val="{{{{ true }}}}">{grade(starter + pro)}</sc-if>'
              f'<sc-if value="{h("carregando")}" hint-placeholder-val="{{{{ false }}}}">{grade(esqueleto(False) + esqueleto(True))}</sc-if>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;gap:36px;width:1024px;align-self:center;padding:32px 24px 40px;">'
            f'{cab}<div style="display:flex;flex-direction:column;gap:20px;">{secao}{controles}{planos}</div></main></div>')


ANTES_PLANO_INICIAL = """const per0 = (s.periodos || this.props.periodos) === "só mensal" ? "mes" : (s.periodo || "mes");
const carregando = (s.estado || this.props.estado) === "carregando";
const ativo = (v) => per0 === v;
const per = {
mes: ativo("mes"), ano: ativo("ano"),
ir_mes: () => this.setState({ periodo: "mes" }), ir_ano: () => this.setState({ periodo: "ano" }),
fundo_mes: ativo("mes") ? "var(--card)" : "transparent", fundo_ano: ativo("ano") ? "var(--card)" : "transparent",
sombra_mes: ativo("mes") ? "var(--sombra)" : "none", sombra_ano: ativo("ano") ? "var(--sombra)" : "none",
cor_mes: ativo("mes") ? "var(--fgs)" : "var(--mfg)", cor_ano: ativo("ano") ? "var(--fgs)" : "var(--mfg)",
preco: ativo("ano") ? (t.lang === "en-US" ? "R$499" : "R$ 499") : t.preco,
intervalo: ativo("ano") ? t.anoCurto : t.mesCurto,
nota: ativo("ano") ? t.notaAnual : t.notaMensal
};"""

VALORES_PLANO_INICIAL = """per: per,
doisPeriodos: (s.periodos || this.props.periodos) !== "só mensal",
pronto: !carregando,
carregando: carregando"""




# ── Playground: código livre, o Peer ao lado, evidência leve ───────────
def linhas_playground(k):
    kw = lambda t: f'<span style="color:{k["pri"]};">{t}</span>'
    ty = lambda t: f'<span style="color:{k["tbluefg"]};">{t}</span>'
    st = lambda t: f'<span style="color:{k["ok"]};">{t}</span>'
    nu = lambda t: f'<span style="color:{k["warn"]};">{t}</span>'
    fn = lambda t: f'<span style="color:{k["fgs"]};font-weight:500;">{t}</span>'
    py = [
        f'{kw("import")} csv',
        f'{kw("from")} datetime {kw("import")} timedelta',
        '',
        f'{kw("def")} {fn("total_por_pessoa")}(caminho: {ty("str")}) -&gt; {ty("dict")}[{ty("str")}, {ty("timedelta")}]:',
        f'    totais: {ty("dict")}[{ty("str")}, {ty("timedelta")}] = {{}}',
        f'    {kw("with")} open(caminho) {kw("as")} arquivo:',
        f'        {kw("for")} linha {kw("in")} csv.DictReader(arquivo):',
        f'            minutos = {ty("int")}(linha[{st("&quot;minutos&quot;")}])',
        f'            pessoa = linha[{st("&quot;pessoa&quot;")}]',
        f'            totais[pessoa] = totais.get(pessoa, timedelta()) + timedelta(minutes=minutos)',
        f'    {kw("return")} totais',
        '',
        f'print(total_por_pessoa({st("&quot;horas.csv&quot;")}))',
    ]
    ts = [
        f'{kw("import")} {{ readFileSync }} {kw("from")} {st("&quot;node:fs&quot;")}',
        '',
        f'{kw("function")} {fn("totalPorPessoa")}(caminho: {ty("string")}): {ty("Map")}&lt;{ty("string")}, {ty("number")}&gt; {{',
        f'  {kw("const")} totais = {kw("new")} {ty("Map")}&lt;{ty("string")}, {ty("number")}&gt;()',
        f'  {kw("const")} linhas = readFileSync(caminho, {st("&quot;utf8&quot;")}).trim().split({st("&quot;\\n&quot;")}).slice({nu("1")})',
        f'  {kw("for")} ({kw("const")} linha {kw("of")} linhas) {{',
        f'    {kw("const")} [pessoa, minutos] = linha.split({st("&quot;,&quot;")})',
        f'    totais.set(pessoa, (totais.get(pessoa) ?? {nu("0")}) + {ty("Number")}(minutos))',
        '  }',
        f'  {kw("return")} totais',
        '}',
        '',
        f'console.log(totalPorPessoa({st("&quot;horas.csv&quot;")}))',
    ]
    go = [
        f'{kw("package")} main',
        '',
        f'{kw("import")} (',
        f'    {st("&quot;encoding/csv&quot;")}',
        f'    {st("&quot;fmt&quot;")}',
        f'    {st("&quot;os&quot;")}',
        f'    {st("&quot;strconv&quot;")}',
        ')',
        '',
        f'{kw("func")} {fn("main")}() {{',
        f'    arquivo, _ := os.Open({st("&quot;horas.csv&quot;")})',
        f'    linhas, _ := csv.NewReader(arquivo).ReadAll()',
        f'    totais := {kw("map")}[{ty("string")}]{ty("int")}{{}}',
        f'    {kw("for")} _, l := {kw("range")} linhas[{nu("1")}:] {{',
        f'        minutos, _ := strconv.Atoi(l[{nu("1")}])',
        f'        totais[l[{nu("0")}]] += minutos',
        '    }',
        f'    fmt.Println(totais)',
        '}',
    ]
    return dict(py=(py, 7), ts=(ts, 7), go=(go, 14))


SAIDAS = {
    'py': ['Traceback (most recent call last):', '  File "horas.py", line 13, in &lt;module&gt;',
           '  File "horas.py", line 8, in total_por_pessoa', "ValueError: invalid literal for int() with base 10: ''"],
    'ts': ["Map(3) { 'ana' =&gt; 150, 'bruno' =&gt; 40, 'carla' =&gt; 95 }"],
    'go': ['map[ana:150 bruno:40 carla:95]'],
}


def tela_playground(k):
    h = lambda caminho: '{{' + caminho + '}}'
    def opcao(chave, nome, altura):
        o = f'sel.{chave}'
        return (f'<button type="button" role="radio" aria-checked="{h(o + ".marcado")}" onClick="{h(o + ".escolher")}" '
                f'style="display:flex;align-items:center;gap:8px;height:30px;padding:0 12px 0 10px;border:0;border-radius:7px;'
                f'background:{h(o + ".fundo")};color:{h(o + ".cor")};box-shadow:{h(o + ".sombra")};font-family:{FONTE};font-size:13px;'
                f'font-weight:{h(o + ".peso")};cursor:pointer;">{logo_linguagem(chave, altura)}{nome}</button>')
    seletor = (f'<div role="radiogroup" aria-label="{T("linguagemAria")}" style="display:flex;gap:2px;padding:3px;border-radius:10px;background:{k["sunken"]};">'
               f'{opcao("ts", "TypeScript", 16)}{opcao("py", "Python", 16)}{opcao("go", "Go", 11)}</div>')
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;">'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<p style="margin:0;font-size:14px;color:{k["mfg"]};">{T("sub")}</p></div>'
           f'<div style="display:flex;align-items:center;gap:10px;">{seletor}{botao(T("rodar"), k, "primary", 36, "rodar")}</div></header>')

    blocos = ''
    for chave, (linhas, marcada) in linhas_playground(k).items():
        codigo = ''.join(
            f'<div style="display:flex;{"background:" + k["prisub"] + ";" if i == marcada else ""}">'
            f'<span style="width:48px;flex:0 0 auto;text-align:right;padding-right:16px;color:{k["mfg"]};opacity:{1 if i == marcada else 0.55};">{i + 1}</span>'
            f'<span style="white-space:pre;">{l}</span></div>' for i, l in enumerate(linhas))
        blocos += f'<sc-if value="{h("lg." + chave)}" hint-placeholder-val="{{{{ {"true" if chave == "py" else "false"} }}}}">{codigo}</sc-if>'
    aba = lambda nome, at: (f'<button type="button" role="tab" aria-selected="{"true" if at else "false"}" style="display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;'
                            f'border:0;background:transparent;font-family:{MONO};font-size:12px;'
                            + (f'background:{k["card"]};color:{k["fgs"]};box-shadow:inset 0 -2px 0 {k["pri"]};' if at else f'color:{k["mfg"]};')
                            + f'">{ic("arquivo", 13)}{nome}</button>')
    editor = (
        f'<section aria-label="{T("editorAria")}" style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
        f'<div style="display:flex;align-items:center;gap:2px;padding:0 8px 0 4px;border-bottom:1px solid {k["muted"]};">'
        f'<div role="tablist" aria-label="{T("abertos")}" style="display:flex;">{aba(h("lg.arquivo"), True)}{aba("horas.csv", False)}</div>'
        f'<span style="margin-left:auto;">{acao_icone(k, "arquivo_mais", T("novoArquivo"), 28)}</span></div>'
        f'<div style="flex:1;min-height:0;padding:14px 0;font-family:{MONO};font-size:13px;line-height:24px;color:{k["fg"]};">{blocos}</div>'
        f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
        f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
        f'<span>{h("lg.arquivo")}</span><span>{T("atalho")}</span><span style="margin-left:auto;">{T("semAuto")}</span></div></section>')

    saidas = ''.join(
        f'<sc-if value="{h("lg." + chave)}" hint-placeholder-val="{{{{ {"true" if chave == "py" else "false"} }}}}">'
        + ''.join(f'<span style="white-space:pre-wrap;overflow-wrap:anywhere;{"color:" + k["bad"] + ";" if chave == "py" and i == len(ls) - 1 else ""}">{l}</span>'
                  for i, l in enumerate(ls)) + '</sc-if>'
        for chave, ls in SAIDAS.items())
    saida = cartao(
        f'<div style="display:flex;align-items:center;justify-content:space-between;">{rotulo(T("saida"), k["mfg"])}'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("rodouAgora")}</span></div>'
        f'<div style="display:flex;flex-direction:column;padding:10px 12px;border-radius:8px;background:{k["sunken"]};'
        f'font-family:{MONO};font-size:11.5px;line-height:18px;color:{k["fg"]};overflow:hidden;">{saidas}</div>', k, pad='16px 18px', extra='gap:10px;')

    peer = (
        f'<section aria-label="Peer" style="flex:1;min-height:0;display:flex;flex-direction:column;background:{k["card"]};'
        f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">'
        f'<header style="display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border-bottom:1px solid {k["muted"]};">'
        f'<span style="display:flex;width:22px;height:22px;">{LOGO}</span>'
        f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">Peer</span>'
        f'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:{k["mfg"]};">'
        f'<span style="width:7px;height:7px;border-radius:999px;background:{k["ok"]};"></span>{T("observando")}</span>'
        f'<span style="margin-left:auto;font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("contexto")}</span></header>'
        f'<div style="flex:1;min-height:0;padding:16px;display:flex;flex-direction:column;gap:12px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">playground.run · horas.csv:7</span>'
        f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("pergunta")}</p>'
        f'<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:{k["sunken"]};">'
        f'{badge("playground.run", k, "gray", mono=True)}'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("registrada")} {h("lg.nome")}</span></div></div>'
        f'<div style="padding:12px 16px 14px;border-top:1px solid {k["muted"]};display:flex;flex-direction:column;gap:8px;">'
        f'<label for="peer-msg" style="font-size:12px;color:{k["mfg"]};">{T("perguntePeer")}</label>'
        f'<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:10px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};">'
        f'<textarea id="peer-msg" rows="2" placeholder="{T("placeholderPeer")}" style="resize:none;border:0;outline:0;'
        f'background:transparent;font-family:{FONTE};font-size:14px;line-height:21px;color:{k["fgs"]};"></textarea>'
        f'<div style="display:flex;align-items:center;gap:8px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">{T("enviaAtalho")}</span>'
        f'<span style="margin-left:auto;">{botao("", k, "primary", 30, "enviar", aria=T("enviarAria"))}</span></div></div></div></section>')

    nota = (f'<p style="margin:0;display:flex;align-items:center;gap:8px;font-size:12.5px;color:{k["mfg"]};">'
            f'{ic("olho", 14, k["mfg"])}{T("nota")}</p>')
    lado = f'<aside style="width:400px;flex:0 0 400px;display:flex;flex-direction:column;gap:12px;">{saida}{peer}</aside>'
    return app(k, 'playground', cab + nota + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{editor}{lado}</div>',
               compacto=True, pad='24px 28px', gap=14)


ANTES_PLAYGROUND = """const LINGUAS = [["ts", "TypeScript", "horas.ts"], ["py", "Python", "horas.py"], ["go", "Go", "horas.go"]];
const atual = s.lingua || this.props.lingua || "py";
const achada = LINGUAS.find((l) => l[0] === atual) || LINGUAS[1];
const lg = { nome: achada[1], arquivo: achada[2], ts: achada[0] === "ts", py: achada[0] === "py", go: achada[0] === "go" };
const linguas = LINGUAS.map((l) => {
const on = l[0] === achada[0];
return {
nome: l[1], marcado: on,
fundo: on ? "var(--card)" : "transparent", cor: on ? "var(--fgs)" : "var(--mfg)",
sombra: on ? "var(--sombra)" : "none", peso: on ? 500 : 400,
escolher: () => this.setState({ lingua: l[0] })
};
});
const sel = {};
LINGUAS.forEach((l, i) => { sel[l[0]] = linguas[i]; });"""

PROPS_PLAYGROUND = {'lingua': {'editor': 'enum', 'options': ['ts', 'py', 'go'], 'default': 'py'}}


# ── Montagem: cada tela sai em claro e em escuro ───────────────────────
def montar(tela, tema):
    sufixo = '' if tema == 'claro' else 'Escuro'
    return _montar(tela, tema, sufixo).replace('__SUF__', sufixo)


def _montar(tela, tema, sufixo):
    web = lambda textos, corpo, antes='', valores='', props=None, css='': casca(
        tela['titulo'], corpo, logica(juntar(COMUM, textos), tema, antes, valores),
        {**PROPS_IDIOMA, **props_tema(tema), **(props or {})}, css)
    k = K
    if tela['id'] == 'competencia':
        return web(COMPETENCIA, tela_competencia(k))
    if tela['id'] == 'plano_inicial':
        textos = {l: {**COMUM_ONB[l], **PLANOS[l], **PLANO_INICIAL[l]} for l in PLANOS}
        return web(textos, tela_plano_inicial(k, sufixo), ANTES_PLANO_INICIAL, VALORES_PLANO_INICIAL,
                   {'estado': {'editor': 'enum', 'options': ['pronto', 'carregando'], 'default': 'pronto'},
                    'periodos': {'editor': 'enum', 'options': ['mensal e anual', 'só mensal'], 'default': 'mensal e anual'}},
                   CSS_DIVIDER_SKELETON)
    onb = lambda textos: {l: {**COMUM_ONB[l], **textos[l]} for l in textos}
    if tela['id'] == 'verificacao':
        return web(onb(VERIFICACAO), tela_verificacao(k, sufixo), ANTES_VERIFICACAO, 'v: v', PROPS_VERIFICACAO, CSS_DIVIDER_SKELETON)
    if tela['id'] == 'perfil':
        return web(onb(PERFIL_ONB), tela_perfil(k, sufixo), css=CSS_DIVIDER_SKELETON)
    if tela['id'] == 'preferencias':
        return web(onb(PREFERENCIAS), tela_preferencias(k, sufixo), ANTES_PREFERENCIAS, VALORES_PREFERENCIAS,
                   PROPS_PREFERENCIAS, CSS_DIVIDER_SKELETON)
    if tela['id'] == 'pagamento':
        return web(onb(PAGAMENTO), tela_pagamento(k, sufixo), ANTES_PAGAMENTO, VALORES_PAGAMENTO, PROPS_PAGAMENTO)
    if tela['id'] == 'playground':
        return web(PLAYGROUND, tela_playground(k), ANTES_PLAYGROUND, 'lg: lg,\nlinguas: linguas,\nsel: sel', PROPS_PLAYGROUND)
    if tela['id'] == 'entrar':
        return web(ACESSO, tela_acesso(k, 'entrar', sufixo), antes_acesso('', '', ''), VALORES_ACESSO)
    if tela['id'] == 'passkey':
        return web(ACESSO, tela_acesso(k, 'passkey', sufixo), antes_acesso('', '', ''), VALORES_ACESSO)
    if tela['id'] == 'criar':
        return web(ACESSO, tela_acesso(k, 'criar', sufixo), antes_acesso('Rafael Moura', 'rafael@moura.dev', 'murikicode26'), VALORES_ACESSO)
    if tela['id'] == 'primeiro':
        return web(juntar(EXERCICIO, PRIMEIRO), tela_exercicio(k, primeira=True), ANTES_PRIMEIRO, VALORES_PRIMEIRO, PROPS_PRIMEIRO)
    if tela['id'] == 'vazio':
        return web(juntar(EVOLUCAO, PERFIL_VAZIO), tela_perfil_vazio(k, sufixo))
    if tela['id'] == 'evolucao':
        return web(EVOLUCAO, tela_evolucao(k))
    if tela['id'] == 'exercicio':
        return web(EXERCICIO, tela_exercicio(k), valores=VALORES_EXERCICIO)
    if tela['id'] == 'avaliacao':
        return web(AVALIACAO, tela_avaliacao(k))
    if tela['id'] == 'peer':
        return casca(tela['titulo'], tela_peer(k), logica_so_tema(tema), props_tema(tema))
    if tela['id'] == 'conectar':
        return web(CONECTAR, tela_conectar(k))
    if tela['id'] == 'planos':
        return web(PLANOS, tela_planos(k))
    raise KeyError(tela['id'])
