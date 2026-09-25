# Onboarding do Code no contrato da muriki-api (develop @ 789252c):
# 1 Código por email → 2 Perfil (conclui o onboarding e começa os 7 dias de Pro para todos)
# → 3 Plano (Starter ou Pro, com cupom) → pagamento no Stripe, se Pro.
# Depois, fora do onboarding e sem contador: o perfil de aprendizado do primeiro acesso
# (experiência, linguagens e objetivos, tudo opcional) → Primeiro exercício.
# O cabeçalho de passo é o OnboardingStepHeader do DS (o mesmo da PricingScreen).
from base import *  # noqa: F401,F403

TOTAL = 3
h = lambda caminho: '{{' + caminho + '}}'


def cabecalho_passo(k, n, titulo, sub, tamanho=52, centro=False):
    passos = ''.join(f'<span style="height:4px;flex:1;border-radius:2px;background:{k["pri"] if i < n else k["sunken"]};"></span>'
                     for i in range(TOTAL))
    legenda_ = f'{T("passoRotulo")} · {n} {T("de")} {TOTAL}'
    alinha = 'text-align:center;align-items:center;' if centro else ''
    return (f'<header style="display:flex;flex-direction:column;gap:16px;{alinha}">'
            f'<div style="display:flex;flex-direction:column;gap:8px;width:100%;{alinha}">{rotulo(legenda_, k["mfg"])}'
            f'<div role="progressbar" aria-valuemin="1" aria-valuemax="{TOTAL}" aria-valuenow="{n}" '
            f'aria-label="{T("passosAria")} {n} {T("de")} {TOTAL}" style="display:flex;gap:6px;width:100%;">{passos}</div></div>'
            f'<div style="display:flex;flex-direction:column;gap:12px;{alinha}">'
            f'<h1 style="margin:0;font-size:{tamanho}px;line-height:1.02;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{titulo}</h1>'
            f'<p style="margin:0;max-width:65ch;font-size:16px;line-height:24px;color:{k["mfg"]};">{sub}</p></div></header>')


def pagina_passo(k, corpo, largura=1024):
    # a largura vale para o cabeçalho e o conteúdo juntos: barra de passos e campos terminam no mesmo lugar
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;gap:36px;width:{largura}px;align-self:center;padding:32px 24px 40px;">'
            f'{corpo}</main></div>')


FORM = 720  # 672px de conteúdo + 24px de cada lado: o max-w-2xl do Platform


def legenda_campo(k, texto):
    return (f'<legend style="padding:0 0 4px;font-family:{MONO};font-size:10px;letter-spacing:0.25em;text-transform:uppercase;'
            f'color:{k["mfg"]};">{texto}</legend>')


def botao_touch(k, txt, href):
    return (f'<a href="{href}" style="align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;gap:8px;'
            f'height:44px;padding:0 18px;border-radius:11px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;">'
            f'{txt}{ic("seta", 15)}</a>')


def botao_ir(k, txt, href, solido=True):
    est = (f'background:{k["pri"]};color:{k["prifg"]};' if solido
           else f'background:transparent;color:{k["mfg"]};')
    return (f'<a href="{href}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 18px;'
            f'border-radius:10px;{est}font-size:14px;font-weight:500;white-space:nowrap;">{txt}'
            + (ic('seta', 14) if solido else '') + '</a>')


def secao(k, titulo, extra=''):
    return (f'<div style="display:flex;align-items:center;gap:12px;">'
            f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:{k["mfg"]};">{titulo}</span>'
            f'<span style="height:1px;width:32px;background:color-mix(in oklch, {k["pri"]} 60%, transparent);"></span>'
            f'<span style="height:1px;width:128px;background:var(--divider);"></span>{extra}</div>')


# ── 2 · Verificação por email ───────────────────────────────────────────
# POST /onboarding/code/challenge manda o código; /verify troca por um onboardingToken.
# `estado` mostra os três casos da API: digitando, código inválido e muitas tentativas.
def tela_verificacao(k, sufixo):
    # Pouco conteúdo pede o centro: uma coluna de 480px no meio da tela, o código na largura toda,
    # o botão largo e a ajuda embaixo. É o formato de tela de código; à esquerda, numa coluna
    # larga, ele virava um canto ocupado e o resto vazio.
    caixa = lambda i: (f'<span style="flex:1;display:flex;align-items:center;justify-content:center;height:56px;border-radius:12px;'
                       f'background:{k["card"]};box-shadow:{h(f"v.anel{i}")};font-family:{MONO};font-size:26px;font-weight:500;'
                       f'color:{h("v.cor")};">{h(f"v.d{i}")}</span>')
    codigo = (f'<div role="group" aria-label="{T("codigoAria")}" style="display:flex;align-items:center;gap:8px;width:100%;">'
              f'{caixa(0)}{caixa(1)}{caixa(2)}<span style="width:12px;flex:0 0 12px;height:2px;border-radius:1px;background:{k["input"]};"></span>'
              f'{caixa(3)}{caixa(4)}{caixa(5)}</div>')
    aviso = (f'<sc-if value="{h("v.temErro")}" hint-placeholder-val="{{{{ false }}}}">'
             f'<p role="alert" style="margin:0;font-size:13px;line-height:19px;color:{k["bad"]};">{h("v.erro")}</p></sc-if>')
    validade = f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("expira")}</p>'
    botao = (f'<a href="Perfil{sufixo}.dc.html" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;'
             f'height:44px;border-radius:11px;background:{k["pri"]};color:{k["prifg"]};font-size:15px;font-weight:500;">'
             f'{T("verificar")}{ic("seta", 15)}</a>')
    ajuda = (f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["mfg"]};">{T("naoChegou")} '
             f'<button type="button" aria-disabled="{h("v.esperando")}" style="border:0;padding:0;background:transparent;'
             f'font-family:{FONTE};font-size:13px;line-height:20px;font-weight:500;color:{h("v.reenviarCor")};">{h("v.reenviar")}</button>'
             f'<br>{T("spam")}</p>')
    corpo = (cabecalho_passo(k, 1, T('titulo'),
                             f'{T("sub")}<br><b style="font-weight:500;color:{k["fgs"]};">rafael@moura.dev</b>', tamanho=40, centro=True)
             + f'<div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;">'
               f'{codigo}{validade}{aviso}<div style="height:6px;"></div>{botao}{ajuda}</div>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:36px;width:528px;'
            f'align-self:center;padding:0 24px 96px;">{corpo}</main></div>')


ANTES_VERIFICACAO = """const estado = s.estado || this.props.estado || "digitando";
const DIG = estado === "digitando" ? ["4", "8", "2", "9", "1", ""] : ["4", "8", "2", "9", "1", "7"];
const erro = estado === "invalido" ? t.invalido : estado === "bloqueado" ? t.bloqueado : "";
const anel = (i) => erro ? "inset 0 0 0 1.5px var(--bad)" : (i === 5 && estado === "digitando" ? "inset 0 0 0 1.5px var(--pri), 0 0 0 3px color-mix(in oklch, var(--pri) 20%, transparent)" : "inset 0 0 0 1px var(--input)");
const v = {
d0: DIG[0], d1: DIG[1], d2: DIG[2], d3: DIG[3], d4: DIG[4], d5: DIG[5],
anel0: anel(0), anel1: anel(1), anel2: anel(2), anel3: anel(3), anel4: anel(4), anel5: anel(5),
cor: estado === "bloqueado" ? "var(--mfg)" : "var(--fgs)",
temErro: !!erro, erro: erro,
reenviar: estado === "bloqueado" ? t.reenviar : t.reenviarEm,
reenviarCor: estado === "bloqueado" ? "var(--pri)" : "var(--mfg)",
esperando: estado !== "bloqueado"
};"""
PROPS_VERIFICACAO = {'estado': {'editor': 'enum', 'options': ['digitando', 'invalido', 'bloqueado'], 'default': 'digitando'}}


# ── 3 · Perfil (o mesmo do Platform) ───────────────────────────────────
# POST /onboarding/code/profile: displayName, fullName, cpf, phone opcional e o aceite das versões
# atuais dos termos e da privacidade. Com o perfil já completo no Platform, o passo é pulado.
def tela_perfil(k, sufixo):
    # o DataPane do Platform: campos empilhados no tamanho touch (44px), legenda mono por grupo
    def campo(id_, rotulo_, valor, ph, extra='', nota='', prefixo='', mono=False):
        pre = (f'<span style="display:flex;align-items:center;height:100%;padding:0 12px 0 14px;'
               f'box-shadow:inset -1px 0 0 {k["input"]};font-size:15px;color:{k["mfg"]};">{prefixo}</span>') if prefixo else ''
        n = f'<span style="font-size:12.5px;line-height:18px;color:{k["mfg"]};">{nota}</span>' if nota else ''
        return (f'<div style="display:flex;flex-direction:column;gap:8px;">'
                f'<label for="{id_}" style="display:flex;align-items:baseline;gap:6px;font-size:13.5px;font-weight:500;color:{k["fgs"]};">{rotulo_}{extra}</label>'
                f'<div style="display:flex;align-items:center;height:44px;border-radius:11px;background:{k["card"]};box-shadow:inset 0 0 0 1px {k["input"]};overflow:hidden;">'
                f'{pre}<input id="{id_}" value="{valor}" placeholder="{ph}" style="flex:1;min-width:0;height:100%;padding:0 14px;border:0;'
                f'background:transparent;font-family:{MONO if mono else FONTE};font-size:15px;color:{k["fgs"]};outline:0;"></div>{n}</div>')
    opcional = f'<span style="font-size:12.5px;font-weight:400;color:{k["mfg"]};">{T("opcional")}</span>'
    # dois campos por linha dentro dos 672px: o formulário inteiro cabe sem rolar
    grupo = lambda leg, filhos, colunas=2: (f'<fieldset style="margin:0;padding:0;border:0;display:grid;'
                                            f'grid-template-columns:repeat({colunas}, minmax(0, 1fr));gap:16px 20px;align-items:start;">'
                                            f'{legenda_campo(k, leg)}{filhos}</fieldset>')
    voce = grupo(T('grupoVoce'), campo('apelido', T('apelido'), 'Rafael', T('apelidoPh'))
                 + campo('nome', T('nome'), 'Rafael Moura', T('nomePh')))
    contato = grupo(T('grupoDocs'), campo('cpf', T('cpf'), '123.456.789-09', T('cpfPh'), nota=T('cpfNota'), mono=True)
                    + campo('telefone', T('telefone'), '', T('telefonePh'), extra=opcional, prefixo='+55'))
    # como conheceu (referralSource) é opcional: um select, com as origens que a API aceita
    origem = (f'<div style="display:flex;flex-direction:column;gap:8px;">'
              f'<label for="origem" style="display:flex;align-items:baseline;gap:6px;font-size:13.5px;font-weight:500;color:{k["fgs"]};">'
              f'{T("origem")}{opcional}</label>'
              f'<div style="position:relative;display:flex;align-items:center;height:44px;border-radius:11px;background:{k["card"]};'
              f'box-shadow:inset 0 0 0 1px {k["input"]};">'
              f'<span id="origem" role="combobox" aria-expanded="false" style="flex:1;padding:0 14px;font-size:15px;color:{k["mfg"]};">{T("origemPh")}</span>'
              f'<span style="display:flex;margin-right:14px;color:{k["mfg"]};">{ic("baixo", 14)}</span></div></div>')
    termos = (f'<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:20px;color:{k["mfg"]};cursor:pointer;">'
              f'<input type="checkbox" checked style="width:16px;height:16px;margin:2px 0 0;flex:0 0 auto;accent-color:{k["pri"]};">'
              f'<span>{T("termosA")} <a href="#" style="color:{k["fg"]};font-weight:500;">{T("termos")}</a> {T("termosE")} '
              f'<a href="#" style="color:{k["fg"]};font-weight:500;">{T("privacidade")}</a>.</span></label>')
    teste = (f'<p style="margin:0;display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:19px;color:{k["mfg"]};">'
             f'{badge(T("teste"), k, "green", mono=True)}<span>{T("testeNota")}</span></p>')
    rodape = f'<div style="display:flex;flex-direction:column;gap:14px;">{botao_touch(k, T("continuar"), f"PlanoInicial{sufixo}.dc.html")}{teste}</div>'
    formulario = (f'<form style="margin:0;display:flex;flex-direction:column;gap:22px;">'
                  f'{voce}{contato}{grupo(T("grupoOrigem"), origem, 1)}{termos}{rodape}</form>')
    # quem já tem perfil (vindo do Platform) só confirma: POST /onboarding/code/complete, sem formulário
    linha = lambda r, v, mono=False: (f'<div style="display:flex;justify-content:space-between;gap:16px;padding:12px 0;'
                                      f'border-top:1px solid var(--divider);font-size:14px;">'
                                      f'<span style="color:{k["mfg"]};">{r}</span>'
                                      f'<span style="color:{k["fgs"]};font-weight:500;{"font-family:" + MONO + ";" if mono else ""}">{v}</span></div>')
    resumo = (f'<div style="display:flex;flex-direction:column;padding:4px 18px;border-radius:12px;background:{k["card"]};'
              f'box-shadow:inset 0 0 0 1px {k["border"]}, {k["sombra"]};">'
              f'<div style="margin:0 -18px;padding:0 18px;">'
              # a API expõe do perfil existente só o nome e o email; CPF e telefone ficam onde estão
              + linha(T('nome'), 'Rafael Moura').replace('border-top:1px solid var(--divider);', '', 1)
              + linha(T('emailRotulo'), 'rafael@moura.dev', True)
              + '</div></div>')
    confirmar = (f'<div style="display:flex;flex-direction:column;gap:24px;">{resumo}'
                 f'<p style="margin:0;font-size:13px;line-height:19px;color:{k["mfg"]};">{T("confirmarNota")}</p>'
                 f'<div style="display:flex;flex-direction:column;gap:14px;">'
                 f'{botao_touch(k, T("confirmar"), f"PlanoInicial{sufixo}.dc.html")}{teste}</div></div>')
    se = lambda chave, html, padrao=False: (f'<sc-if value="{h("pf." + chave)}" hint-placeholder-val="{{{{ {"true" if padrao else "false"} }}}}">'
                                            f'{html}</sc-if>')
    corpo = (se('novo', cabecalho_passo(k, 2, T('titulo'), T('sub')) + formulario, True)
             + se('confirmar', cabecalho_passo(k, 2, T('tituloConfirmar'), T('subConfirmar')) + confirmar))
    return pagina_passo(k, corpo, FORM)


ANTES_PERFIL = """const est = s.estado || this.props.estado || "novo";
const pf = { novo: est === "novo", confirmar: est === "confirmar" };"""
PROPS_PERFIL = {'estado': {'editor': 'enum', 'options': ['novo', 'confirmar'], 'default': 'novo'}}


# ── Primeiro acesso: o perfil de aprendizado (fora do onboarding, sem contador) ──
# Tudo opcional: experience (junior, mid, senior, tech_lead, architect ou unknown = "ainda não
# sei"), languages (0 a 30, de GET /code/languages; supported=false aparece "em breve") e goals
# (0 a 3). "Pular por agora" não grava nada; o declarado do perfil vem da experience.
EXPERIENCIAS = ['junior', 'mid', 'senior', 'tech_lead', 'architect', 'unknown']
OBJETIVOS = ['learn', 'ship_faster', 'review_code']
# exemplo do que GET /onboarding/code/languages devolve: (nome, categoria, supported)
LINGUAGENS_API = [
    ('TypeScript', 'mainstream', True), ('JavaScript', 'mainstream', True), ('Python', 'mainstream', True),
    ('Java', 'mainstream', True), ('C#', 'mainstream', False), ('Go', 'mainstream', True),
    ('PHP', 'web', False), ('Ruby', 'web', False),
    ('Kotlin', 'mobile', False), ('Swift', 'mobile', False), ('Dart', 'mobile', False),
    ('Rust', 'systems', True), ('C', 'systems', False), ('C++', 'systems', False),
]


def campos_preferencias(k):
    # experiência, linguagens e objetivos: os mesmos no primeiro acesso e na aba Aprendizado de Minha conta
    exp = (f'<div role="radiogroup" aria-label="{T("experiencia")}" style="display:grid;grid-template-columns:repeat(6, minmax(0, 1fr));gap:10px;">'
           f'<sc-for list="{h("exps")}" as="e" hint-placeholder-count="6">'
           f'<button type="button" role="radio" aria-checked="{h("e.marcado")}" onClick="{h("e.escolher")}" '
           f'style="display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:0;border-radius:12px;background:{k["card"]};'
           f'box-shadow:{h("e.borda")};text-align:left;font-family:{FONTE};cursor:pointer;">'
           f'<span style="display:flex;align-items:center;gap:8px;">'
           f'<span style="width:14px;height:14px;border-radius:999px;box-shadow:{h("e.radio")};"></span>'
           f'<span style="font-size:14.5px;font-weight:600;color:{k["fgs"]};">{h("e.nome")}</span></span>'
           f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{h("e.desc")}</span></button></sc-for></div>')
    ling = (f'<div style="display:flex;flex-direction:column;gap:10px;">'
            f'<sc-for list="{h("grupos")}" as="g" hint-placeholder-count="4">'
            f'<div style="display:flex;align-items:center;gap:14px;">'
            f'<span style="width:84px;flex:0 0 auto;font-size:12px;color:{k["mfg"]};">{h("g.nome")}</span>'
            f'<div style="display:flex;flex-wrap:wrap;gap:6px;">'
            f'<sc-for list="{h("g.itens")}" as="l" hint-placeholder-count="5">'
            f'<button type="button" aria-pressed="{h("l.marcado")}" aria-disabled="{h("l.breve")}" onClick="{h("l.alternar")}" '
            f'style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:0;border-radius:999px;'
            f'background:{h("l.fundo")};box-shadow:{h("l.borda")};color:{h("l.cor")};font-family:{FONTE};font-size:13px;font-weight:500;cursor:pointer;">'
            f'<sc-if value="{h("l.marcado")}" hint-placeholder-val="{{{{ false }}}}">{ic("check", 12)}</sc-if>{h("l.nome")}'
            f'<sc-if value="{h("l.breve")}" hint-placeholder-val="{{{{ false }}}}">'
            f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;color:{k["mfg"]};">{T("emBreve")}</span></sc-if>'
            f'</button></sc-for></div></div></sc-for></div>')
    obj = (f'<div role="group" aria-label="{T("objetivos")}" style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:12px;">'
           f'<sc-for list="{h("objs")}" as="o" hint-placeholder-count="3">'
           f'<button type="button" role="checkbox" aria-checked="{h("o.marcado")}" onClick="{h("o.alternar")}" '
           f'style="display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border:0;border-radius:12px;background:{k["card"]};'
           f'box-shadow:{h("o.borda")};text-align:left;font-family:{FONTE};cursor:pointer;">'
           f'<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-top:2px;flex:0 0 auto;'
           f'border-radius:4px;background:{h("o.caixa")};box-shadow:{h("o.caixaBorda")};color:{k["prifg"]};">'
           f'<sc-if value="{h("o.marcado")}" hint-placeholder-val="{{{{ false }}}}">{ic("check", 11)}</sc-if></span>'
           f'<span style="display:flex;flex-direction:column;gap:3px;">'
           f'<span style="font-size:14.5px;font-weight:600;color:{k["fgs"]};">{h("o.nome")}</span>'
           f'<span style="font-size:12.5px;line-height:17px;color:{k["mfg"]};">{h("o.desc")}</span></span></button></sc-for></div>')
    return exp, ling, obj


def tela_preferencias(k, sufixo):
    exp, ling, obj = campos_preferencias(k)
    rodape = (f'<div style="display:flex;align-items:center;gap:8px;">'
              f'{botao_touch(k, T("comecar"), f"PrimeiroExercicio{sufixo}.dc.html")}'
              f'{botao_ir(k, T("pular"), f"PrimeiroExercicio{sufixo}.dc.html", False)}'
              f'<span style="margin-left:8px;font-size:12.5px;color:{k["mfg"]};">{T("nadaObrigatorio")}</span></div>')
    contador = f'<span style="margin-left:auto;font-size:12px;color:{k["mfg"]};">{T("umATres")}</span>'
    # sem barra de passos: o onboarding acabou; é o primeiro acesso, e tudo aqui é opcional
    cabeca = (f'<header style="display:flex;flex-direction:column;gap:12px;">{rotulo(T("rotuloAprendizado"), k["mfg"])}'
              f'<h1 style="margin:0;font-size:44px;line-height:1.04;font-weight:600;letter-spacing:-0.03em;color:{k["fgs"]};">{T("titulo")}</h1>'
              f'<p style="margin:0;max-width:70ch;font-size:16px;line-height:24px;color:{k["mfg"]};">{T("sub")}</p></header>')
    corpo = (cabeca
             + f'<div style="display:flex;flex-direction:column;gap:14px;">{secao(k, T("experiencia"))}{exp}</div>'
             + f'<div style="display:flex;flex-direction:column;gap:14px;">{secao(k, T("linguagens"))}{ling}</div>'
             + f'<div style="display:flex;flex-direction:column;gap:14px;">{secao(k, T("objetivos"), contador)}{obj}</div>'
             + rodape)
    return pagina_passo(k, corpo)


ANTES_PREFERENCIAS = """const EXP = __EXP__;
const OBJ = __OBJ__;
const LING = __LING__;
const CATS = ["mainstream", "web", "mobile", "systems"];
const exp = s.exp || "mid";
const langs = s.langs || ["TypeScript", "Python"];
const objs = s.objs || ["learn", "ship_faster"];
const exps = EXP.map((id) => ({
nome: t[id], desc: t[id + "Desc"], marcado: id === exp,
borda: id === exp ? "0 0 0 1.5px var(--pri), var(--sombra)" : "inset 0 0 0 1px var(--border), var(--sombra)",
radio: id === exp ? "inset 0 0 0 4px var(--pri)" : "inset 0 0 0 1.5px var(--input)",
escolher: () => this.setState({ exp: id })
}));
const grupos = CATS.map((c) => ({
nome: t[c],
itens: LING.filter((l) => l[1] === c).map((l) => {
const on = langs.indexOf(l[0]) >= 0;
return {
nome: l[0], marcado: on, breve: !l[2],
fundo: on ? "var(--prisub)" : (l[2] ? "var(--card)" : "transparent"),
borda: on ? "inset 0 0 0 1px var(--pri)" : (l[2] ? "inset 0 0 0 1px var(--input)" : "inset 0 0 0 1px var(--divider)"),
cor: on ? "var(--prisubfg)" : (l[2] ? "var(--fg)" : "var(--mfg)"),
alternar: () => { if (!l[2]) return; this.setState({ langs: on ? langs.filter((x) => x !== l[0]) : langs.concat([l[0]]) }); }
};
})
}));
const objsV = OBJ.map((id) => {
const on = objs.indexOf(id) >= 0;
return {
nome: t[id], desc: t[id + "Desc"], marcado: on,
borda: on ? "0 0 0 1.5px var(--pri), var(--sombra)" : "inset 0 0 0 1px var(--border), var(--sombra)",
caixa: on ? "var(--pri)" : "var(--card)", caixaBorda: on ? "none" : "inset 0 0 0 1.5px var(--input)",
alternar: () => {
if (!on && objs.length === 3) return;
this.setState({ objs: on ? objs.filter((x) => x !== id) : objs.concat([id]) });
}
};
});
""".replace('__EXP__', json.dumps(EXPERIENCIAS)).replace('__OBJ__', json.dumps(OBJETIVOS)).replace(
    '__LING__', json.dumps(LINGUAGENS_API))
VALORES_PREFERENCIAS = 'exps: exps,\ngrupos: grupos,\nobjs: objsV'


# ── Volta do Stripe ────────────────────────────────────────────────────
# Depois do checkout (POST /billing/checkout → url do Stripe) a pessoa volta confirmada ou cancelada.
def tela_pagamento(k, sufixo):
    def estado(chave, icone, cor, fundo, acoes):
        return (f'<sc-if value="{h(chave)}" hint-placeholder-val="{{{{ {"true" if chave == "confirmado" else "false"} }}}}">'
                f'<div role="status" style="display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;">'
                f'<span style="display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:999px;'
                f'background:{fundo};color:{cor};">{ic(icone, 28)}</span>'
                f'<div style="display:flex;flex-direction:column;gap:10px;max-width:460px;">'
                f'<h1 style="margin:0;font-size:32px;line-height:1.1;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">{T(chave + "Titulo")}</h1>'
                f'<p style="margin:0;font-size:15px;line-height:23px;color:{k["mfg"]};">{T(chave + "Sub")}</p></div>'
                f'<div style="display:flex;align-items:center;gap:8px;">{acoes}</div></div></sc-if>')
    confirmado = estado('confirmado', 'check', k['ok'], k['tgreen'],
                        botao_ir(k, T('comecarPrimeiro'), f'Preferencias{sufixo}.dc.html'))
    cancelado = estado('cancelado', 'x', k['warn'], k['torange'],
                       botao_ir(k, T('tentarDeNovo'), '#') + botao_ir(k, T('seguirStarter'), f'Preferencias{sufixo}.dc.html', False))
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, "Muriki Code")}'
            f'<main style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px 80px;">'
            f'{confirmado}{cancelado}</main></div>')


ANTES_PAGAMENTO = 'const estado = s.estado || this.props.estado || "confirmado";'
VALORES_PAGAMENTO = 'confirmado: estado === "confirmado",\ncancelado: estado === "cancelado"'
PROPS_PAGAMENTO = {'estado': {'editor': 'enum', 'options': ['confirmado', 'cancelado'], 'default': 'confirmado'}}
