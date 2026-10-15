# As telas do Muriki Platform. Cada uma é o desenho de um bloco do registry nos estados que o
# produto precisa ver; o estado é fixo por quadro (o canvas mostra um quadro por estado) e o
# idioma e o tema trocam no próprio quadro.
from pecas import (K, T, ic, pagina, pagina_identidade, cabecalho_passo, campo, caixa_marcar, botao_passo,  # noqa: F401
                   cartoes_escolha, esc, previa_workspace, PRODUTOS, previa_movimento, CSS_MOVIMENTO, casca, logica,
                   juntar, COMUM, PROPS_IDIOMA, props_tema)
from textos_identidade import IDENTIDADE, MOVIMENTO
from textos_entrada import ENTRADA, CONVIDAR
from entrada import TELAS_A2, COM_IDENTIDADE, COM_CONVIDAR, _adicionar, _lista_convidados
from textos_membros import MEMBROS
from acesso import montar_acesso
from cobranca import TELAS_C, pagina_cb
from textos_cobranca import COBRANCA
from pecas import raiz, topo, PRODUTO, EMAIL, FONTE, I, svg
from base import badge  # noqa: E402


# ── Onboarding · @usuário e workspace (bloco platform-identity) ─────────
# PlatformOnboardingIdentity: para quem é (Com o meu time / Só para mim), o @usuário, o nome e o
# endereço do workspace e o aceite dos termos, numa tela só e sem CPF nem plano. O formato é do
# componente; livre, ocupado e reservado vêm do app. O botão só liga com tudo livre e os termos
# aceitos. A partir do lg, a tela tem a altura da janela, sem rolar, do lado do login: no palco à
# esquerda (o palco azul com as manchas desfocadas), a WorkspacePreview com os mesmos valores
# (CA4b, CA4c), no estado final; o formulário à direita.
IDENTIDADE_ESTADOS = {
    # para quem, usuário, status, nome, slug, status do slug, termos, a frase da prévia. O @ ocupado não
    # entra na prévia: a frase sai sem ele e o lugar "você" fica neutro
    'vazio': ('team', '', 'idle', '', '', 'idle', False, 'previaVazio'),
    'ocupado': ('team', 'rafael', 'taken', 'Muriki', 'muriki', 'reserved', True, 'fraseTime'),
    'livre': ('team', 'rafael.moura', 'available', 'Moura & Filhos', 'moura-filhos', 'available', True, 'fraseLivre'),
    'foco': ('personal', 'rafael.moura', 'available', 'Rafael Moura', 'rafael-moura', 'available', True, 'fraseFoco'),
}


def tela_identidade(k, estado):
    publico, usuario, st_usuario, nome, slug, st_slug, termos, frase = IDENTIDADE_ESTADOS[estado]
    frase_usuario = {'idle': T('usuarioDica'), 'available': f'@{usuario} {T("usuarioLivre")}',
                     'taken': T('usuarioOcupado'), 'reserved': T('usuarioReservado')}[st_usuario]
    frase_slug = {'idle': T('enderecoDica'), 'available': T('enderecoLivre'),
                  'reserved': T('enderecoReservado')}[st_slug]
    pessoal = publico == 'personal'
    # o @ aparece na prévia só livre (no canvas não há verificando nem não conferido)
    voce = st_usuario == 'available'
    exemplo = T('exemploFoco' if pessoal else 'exemploTime')
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    formulario = (
        cabecalho_passo(k, 1, 2, T('titulo'))
        + '<form style="margin:0;display:flex;flex-direction:column;gap:23px;">'
        + cartoes_escolha(k, T('paraQuem'), [('team', T('comTime'), 'pessoas'),
                                              ('personal', T('soMim'), 'pessoa')], publico)
        + campo(k, 'usuario', T('usuario'), usuario, st_usuario, frase_usuario, afixo='@', mono=True)
        + campo(k, 'nome', T('nomeEspaco' if pessoal else 'nomeWorkspace'), nome, placeholder=f'{T("exemploPh")} {exemplo}')
        + campo(k, 'endereco', T('endereco'), slug, st_slug, frase_slug, afixo='platform.muriki.app/', mono=True)
        + caixa_marcar(k, termos, f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.')
        + '</form>'
        + botao_passo(k, T('criarEspaco' if pessoal else 'criar'), estado in ('livre', 'foco'))
    )
    return pagina_identidade(k, formulario, previa_workspace(k, publico, nome, exemplo, T(frase), voce))


# ── Onboarding · movimento (Play) ───────────────────────────────────────
# O mesmo passo, sozinho: no Play do canvas o roteiro digita o @usuário (verificando, livre), o nome do
# workspace (o endereço acompanha, verificando, livre), marca os termos, vai para "Só para mim" e
# volta; pausa e recomeça. A prévia anima como o componente (CSS_MOVIMENTO). Os dois cartões trocam
# o produto na hora (o roteiro espera 6 s) e "Recomeçar" volta ao começo. Cada estado do campo é uma
# variante com <sc-if>: o hole é só lookup, então o ícone, o anel e a frase vêm prontos de campo().
def _variantes(pares):
    return ''.join(f'<sc-if value="{{{{{cond}}}}}" hint-placeholder-val="{{{{ {"true" if i == 0 else "false"} }}}}">{html}</sc-if>'
                   for i, (cond, html) in enumerate(pares))


def tela_movimento(k):
    usuario = _variantes([
        (f'mv.u.{st}', campo(k, 'usuario', T('usuario'), '{{usuario}}', st, frase, afixo='@', mono=True))
        for st, frase in [('idle', T('usuarioDica')), ('checking', T('verificando')),
                          ('available', f'@{{{{usuario}}}} {T("usuarioLivre")}')]])
    endereco = _variantes([
        (f'mv.e.{st}', campo(k, 'endereco', T('endereco'), '{{slug}}', st, frase, afixo='platform.muriki.app/', mono=True))
        for st, frase in [('idle', T('enderecoDica')), ('checking', T('verificando')), ('available', T('enderecoLivre'))]])
    link = lambda txt: f'<a href="#" style="color:{k["fg"]};font-weight:500;">{txt}</a>'
    termos = f'{T("termosA")} {link(T("termos"))} {T("termosE")} {link(T("privacidade"))}.'
    acoes = {'team': '{{escolherTime}}', 'personal': '{{escolherFoco}}'}
    opcoes = [('team', T('comTime'), 'pessoas'), ('personal', T('soMim'), 'pessoa')]
    formulario = (
        cabecalho_passo(k, 1, 2, T('titulo'))
        + '<form style="margin:0;display:flex;flex-direction:column;gap:23px;">'
        + _variantes([(f'mv.{c}', cartoes_escolha(k, T('paraQuem'), opcoes, v, acoes)) for c, v in [('time', 'team'), ('foco', 'personal')]])
        + usuario
        + campo(k, 'nome', '{{rotuloNome}}', '{{nome}}', placeholder=f'{T("exemploPh")} {{{{exemplo}}}}')
        + endereco
        + _variantes([('mv.semTermos', caixa_marcar(k, False, termos)), ('mv.termos', caixa_marcar(k, True, termos))])
        + '</form>'
        + _variantes([('mv.desligado', botao_passo(k, '{{rotuloBotao}}', False)), ('mv.ligado', botao_passo(k, '{{rotuloBotao}}', True))])
    )
    return pagina_identidade(k, formulario, previa_movimento(k))


# o estado vem do roteiro (ou do clique); renderVals só deriva o que a marcação lê
MOV_ANTES = """const pub = s.publico || "team";
const foco = pub === "personal";
const usuario = s.usuario || "";
const stU = s.stU || "idle";
const nome = s.nome || "";
const stS = s.stS || "idle";
const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const vivo = nome.trim() !== "";
const comArroba = stU === "checking" || stU === "available";
const fr = !vivo ? "vazio" : (foco ? "foco" : "time") + (comArroba ? "U" : "");
const on = (c) => (c ? "on" : "");
const ligado = vivo && stU === "available" && stS === "available" && !!s.termos;"""

MOV_VALORES = """usuario: usuario,
nome: nome,
slug: slug,
rotuloNome: foco ? t.nomeEspaco : t.nomeWorkspace,
exemplo: foco ? t.exemploFoco : t.exemploTime,
rotuloBotao: foco ? t.criarEspaco : t.criar,
mv: {
time: !foco, foco: foco, vivo: vivo, vazio: !vivo,
letras: Array.from(nome).map((c, i) => ({ c: c, key: i + ":" + c })),
u: { idle: stU === "idle", checking: stU === "checking", available: stU === "available" },
e: { idle: stS === "idle", checking: stS === "checking", available: stS === "available" },
termos: !!s.termos, semTermos: !s.termos, ligado: ligado, desligado: !ligado,
projects: on(!foco), focus: on(foco), lugares: on(!foco),
frase: { vazio: on(fr === "vazio"), time: on(fr === "time"), timeU: on(fr === "timeU"), foco: on(fr === "foco"), focoU: on(fr === "focoU") },
previa: (vivo ? "vivo " : "") + (comArroba ? "voce" : ""),
saindo: s.saindo ? "saindo" : "",
},
escolherTime: () => this.escolher("team"),
escolherFoco: () => this.escolher("personal"),
recomecar: () => this.recomecar(),"""

# o roteiro em loop: cada passo é um estado e quanto tempo fica nele
MOV_METODOS = r"""
roteiro() {
if (this._roteiro) return this._roteiro;
const p = [{ publico: "team", st: { usuario: "", stU: "idle", nome: "", stS: "idle", termos: false }, ms: 1000 }];
const u = "rafael.moura";
for (let i = 1; i <= u.length; i++) p.push({ st: { usuario: u.slice(0, i) }, ms: i === u.length ? 450 : 85 });
p.push({ st: { stU: "checking" }, ms: 800 }, { st: { stU: "available" }, ms: 700 });
const n = Array.from("Moura & Filhos");
for (let i = 1; i <= n.length; i++) p.push({ st: { nome: n.slice(0, i).join("") }, ms: i === n.length ? 450 : 95 });
p.push({ st: { stS: "checking" }, ms: 800 }, { st: { stS: "available" }, ms: 700 }, { st: { termos: true }, ms: 1600 });
p.push({ publico: "personal", ms: 2600 }, { publico: "team", ms: 3000 });
this._roteiro = p;
return p;
}
tocar() {
if (this._parado) return;
const agora = Date.now();
if (this._pausaAte && agora < this._pausaAte) {
this._relogio = setTimeout(() => this.tocar(), this._pausaAte - agora);
return;
}
const passos = this.roteiro();
const passo = passos[this._passo || 0];
this._passo = ((this._passo || 0) + 1) % passos.length;
if (passo.st) this.setState(passo.st);
if (passo.publico) this.trocar(passo.publico);
this._relogio = setTimeout(() => this.tocar(), passo.ms);
}
trocar(pub) {
const s = this.state || {};
if ((s.publico || "team") === pub && !this._trocando) return;
clearTimeout(this._troca);
const reduzir = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduzir) {
this._trocando = false;
this.setState({ publico: pub, saindo: false });
return;
}
this._trocando = true;
this.setState({ saindo: true });
this._troca = setTimeout(() => {
this._trocando = false;
this.setState({ publico: pub, saindo: false });
}, 170);
}
escolher(pub) {
clearTimeout(this._relogio);
this._pausaAte = Date.now() + 6000;
this.trocar(pub);
this._relogio = setTimeout(() => this.tocar(), 6000);
}
recomecar() {
clearTimeout(this._relogio);
this._pausaAte = 0;
this._passo = 0;
this.tocar();
}
componentDidMount() {
this._parado = false;
this._passo = 0;
this.tocar();
}
componentWillUnmount() {
this._parado = true;
clearTimeout(this._relogio);
clearTimeout(this._troca);
}"""


# ── Workspace · membros e convites (bloco platform-members) ─────────────
# Dentro do produto, nas configurações do workspace: a barra do topo do Platform e o título da página,
# sem navegação de funcionalidades (ainda não definidas). As tabelas são a ResourceTable do DS: o
# cabeçalho na faixa do rail, linhas de 52px, as ações da linha no hover (o "…" do RowActions) e o
# destrutivo no menu. O que cada papel vê é o memberActions (F6); os convites seguem F7.
def pagina_produto(k, titulo, sub, conteudo, largura=1040):
    cabeca_ = (f'<header style="display:flex;flex-direction:column;gap:6px;">'
               f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.01em;color:{k["fgs"]};">{titulo}</h1>'
               + (f'<p style="margin:0;font-size:14px;line-height:20px;color:{k["mfg"]};">{sub}</p>' if sub else '') + '</header>')
    return (f'{raiz(k, "display:flex;flex-direction:column;")}{topo(k, PRODUTO, EMAIL)}'
            f'<main style="display:flex;flex-direction:column;gap:24px;width:{largura}px;margin:0 auto;padding:24px 0 40px;">'
            f'{cabeca_}{conteudo}</main></div>')


def _tabela(k, rotulo_, colunas, cabecalhos, linhas):
    cabs = ''.join(f'<span role="columnheader" style="font-size:12px;font-weight:500;color:{k["mfg"]};">{c}</span>' for c in cabecalhos)
    return (f'<section role="table" aria-label="{rotulo_}" style="display:flex;flex-direction:column;border-radius:12px;background:{k["card"]};'
            f'box-shadow:{k["sombra"]};">'
            f'<div role="row" style="display:grid;grid-template-columns:{colunas};gap:20px;align-items:center;height:38px;padding:0 16px;'
            f'border-radius:12px 12px 0 0;background:{k["rail"]};box-shadow:inset 0 -1px 0 {k["border"]};">{cabs}</div>'
            f'{"".join(linhas)}</section>')


def _linha(k, colunas, celulas, hover=False, apagada=False, ultima=False):
    fundo = f'background:{k["muted"]};' if hover else ''
    cor = f'color:{k["mfg"]};' if apagada else ''
    sombra = '' if ultima else f'box-shadow:inset 0 -1px 0 {k["border"]};'
    return (f'<div role="row" style="position:relative;display:grid;grid-template-columns:{colunas};gap:20px;align-items:center;height:52px;'
            f'padding:0 16px;font-size:13px;{sombra}{fundo}{cor}">{"".join(celulas)}</div>')


def _iniciais(k, txt, tracejado=False):
    est = (f'border:1.5px dashed {k["input"]};color:{k["mfg"]};text-transform:uppercase;' if tracejado
           else f'background:{k["muted"]};color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["border"]};')
    return (f'<span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;'
            f'box-sizing:border-box;border-radius:50%;{est}font-size:11px;font-weight:600;">{txt}</span>')


def _seletor(k, valor, aria):
    # o Select do DS, tamanho sm: o gatilho é campo (--field, o filete), o caret parado
    return (f'<button type="button" aria-label="{aria}" aria-haspopup="listbox" style="display:flex;align-items:center;gap:6px;width:132px;'
            f'height:28px;padding:0 8px 0 10px;border:0;border-radius:7px;background:{k["field"]};box-shadow:inset 0 0 0 1px {k["input"]};'
            f'font-family:{FONTE};font-size:12.5px;color:{k["fg"]};cursor:pointer;">{valor}'
            f'<span style="display:flex;margin-left:auto;opacity:0.6;">{ic("baixo", 12)}</span></button>')


def _mais(k, aberto=False, fim=True):
    fundo = f'background:{k["sunken"]};' if aberto else ''
    pontos = ''.join(f'<span style="width:3px;height:3px;border-radius:50%;background:currentColor;"></span>' for _ in range(3))
    return (f'<span style="display:flex;{"justify-content:flex-end;" if fim else ""}"><button type="button" aria-label="{T("mbMais")}" aria-expanded="{"true" if aberto else "false"}" '
            f'style="display:flex;align-items:center;justify-content:center;gap:2px;width:28px;height:28px;padding:0;border:0;border-radius:7px;'
            f'{fundo}color:{k["mfg"]};cursor:pointer;">{pontos}</button></span>')


def _menu(k, itens, topo_):
    # o DropdownMenu do row-actions: superfície flutuante, item de 28px, o destrutivo tingido; o
    # desligado meio apagado, com o motivo no rótulo
    def item(icone, txt, desligado):
        op = 'opacity:0.5;' if desligado else ''
        d = ' aria-disabled="true"' if desligado else ''
        return (f'<div role="menuitem"{d} style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;border-radius:6px;'
                f'font-size:13px;line-height:18px;color:{k["bad"]};{op}"><span style="display:flex;margin-top:1px;">{ic(icone, 15)}</span>{txt}</div>')
    return (f'<div role="menu" style="position:absolute;right:12px;top:{topo_}px;z-index:3;width:208px;padding:4px;border-radius:12px;'
            f'background:{k["card"]};box-shadow:{k["sombraFlut"]}, 0 0 0 1px {k["border"]};">'
            + ''.join(item(*i) for i in itens) + '</div>')


I.update(
    remover_pessoa=svg('<circle cx="6.4" cy="5.6" r="2.6"/><path d="M1.8 13.4c.5-2.5 2.4-3.9 4.6-3.9s4.1 1.4 4.6 3.9"/><path d="M11 7.4h3.6"/>'),
    proibido=svg('<circle cx="8" cy="8" r="6"/><path d="M3.8 3.8l8.4 8.4"/>'),
)

PESSOAS = [  # id, nome, @usuário, papel, data
    ('u1', 'Rafael Moura', 'rafael.moura', 'owner', 'mbD1'),
    ('u2', 'Ana Lima', 'ana.lima', 'maintainer', 'mbD2'),
    ('u3', 'João Pereira', 'joao', 'member', 'mbD3'),
    ('u4', 'Bia Costa', 'bia.costa', 'member', 'mbD4'),
    ('u5', 'Carlos Souza', 'carlos_s', 'guest', 'mbD5'),
]
PAPEL = {'owner': 'cvOwner', 'maintainer': 'papelMaintainer', 'member': 'papelMember', 'guest': 'papelGuest'}
# o que cada papel gere (F6): o select aparece nessas linhas, o "…" com Remover também
GERE = {'owner': {'owner', 'maintainer', 'member', 'guest'}, 'maintainer': {'member', 'guest'}}


def tela_membros(k, quem):
    # quem vê: o owner (Rafael, o único owner: o "Sair" dele aparece desligado, com o motivo, no menu
    # aberto) ou a maintainer (Ana: gere só member e guest; o menu aberto na linha da Bia)
    eu = {'owner': 'u1', 'maintainer': 'u2'}[quem]
    menu_em = {'owner': 'u1', 'maintainer': 'u4'}[quem]
    colunas = 'minmax(0,1fr) 148px 168px 28px'
    linhas = []
    for i, (id_, nome, usuario, papel, data) in enumerate(PESSOAS):
        voce = id_ == eu
        marca = (f'<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;'
                 f'box-shadow:inset 0 0 0 1px {k["input"]};font-size:11px;font-weight:500;color:{k["mfg"]};">{T("mbVoce")}</span>' if voce else '')
        pessoa = (f'<span style="display:flex;align-items:center;gap:10px;min-width:0;">'
                  f'{_iniciais(k, "".join(p[0] for p in nome.split()[:2]))}'
                  f'<span style="display:flex;flex-direction:column;min-width:0;">'
                  f'<span style="display:flex;align-items:center;gap:6px;"><span style="font-weight:500;color:{k["fgs"]};">{nome}</span>{marca}</span>'
                  f'<span style="font-size:12px;color:{k["mfg"]};">@{usuario}</span></span></span>')
        gere = not voce and papel in GERE[quem]
        papel_ = _seletor(k, T(PAPEL[papel]), nome) if gere else f'<span style="display:flex;">{badge(T(PAPEL[papel]), k)}</span>'
        aberto = id_ == menu_em
        acoes = _mais(k, aberto) if aberto else '<span></span>'
        linhas.append(_linha(k, colunas, [pessoa, papel_, f'<span style="color:{k["mfg"]};">{T(data)}</span>', acoes],
                             hover=aberto, ultima=i == len(PESSOAS) - 1))
    if quem == 'owner':
        menu = _menu(k, [('sair', T('mbSairUltimo'), True)], 38 + 52 - 6)
    else:
        menu = _menu(k, [('remover_pessoa', T('mbRemover'), False)], 38 + 4 * 52 - 6)
    tabela = (f'<div style="position:relative;">'
              f'{_tabela(k, T("mbTabelaMembros"), colunas, [T("mbPessoa"), T("papel"), T("mbEntrou"), ""], linhas)}{menu}</div>')
    return pagina_produto(k, T('mbMembros'), T('mbMembrosSub'), tabela)


CONVITES = [  # e-mail, papel, estado, prazo, quem convidou, data, hover
    ('duda@moura.dev', 'member', 'pendente', 'mbVenceEm', 'Rafael Moura', 'mbI1', False),
    ('eva@moura.dev', 'guest', 'venceu', 'mbVenceuHa', 'Ana Lima', 'mbI2', True),
    ('bia@moura.dev', 'member', 'aceito', None, 'Rafael Moura', 'mbI3', False),
    ('fabio@moura.dev', 'maintainer', 'revogado', None, 'Rafael Moura', 'mbI4', False),
    ('gabi@moura.dev', 'member', 'substituido', None, 'Rafael Moura', 'mbI5', False),
]
ESTADO = {'pendente': ('mbPendente', 'blue'), 'venceu': ('mbVenceu', 'orange'), 'aceito': ('mbAceito', 'green'),
          'revogado': ('mbRevogado', 'gray'), 'substituido': ('mbSubstituido', 'gray')}


def tela_convites(k):
    # os quatro estados da API e o "venceu" (um pendente com expiresAt no passado); Reenviar (o ícone)
    # e Revogar (no "…") só no pendente, vencido ou não: o vencido está com o cursor em cima
    colunas = 'minmax(0,1fr) 104px 236px 140px 140px 68px'
    linhas = []
    for i, (email, papel, estado, prazo, por, data, hover) in enumerate(CONVITES):
        apagada = estado in ('revogado', 'substituido')
        rot, tom = ESTADO[estado]
        mail = (f'<span style="display:flex;align-items:center;gap:10px;min-width:0;">{_iniciais(k, email[0], True)}'
                f'<span style="font-weight:500;color:{k["mfg"] if apagada else k["fgs"]};">{email}</span></span>')
        selo = (f'<span style="display:flex;align-items:center;gap:8px;">{badge(T(rot), k, tom, ponto=True)}'
                + (f'<span style="font-size:12px;color:{k["mfg"]};white-space:nowrap;">{T(prazo)}</span>' if prazo else '') + '</span>')
        acoes = '<span></span>'
        if hover:
            reenviar = (f'<button type="button" aria-label="{T("mbReenviar")}" style="display:flex;align-items:center;justify-content:center;'
                        f'width:28px;height:28px;padding:0;border:0;border-radius:7px;background:transparent;color:{k["mfg"]};">{ic("recarregar", 15)}</button>')
            acoes = (f'<span style="display:flex;align-items:center;justify-content:flex-end;gap:1px;">{reenviar}'
                     f'<span style="width:1px;height:16px;margin:0 4px;background:{k["border"]};"></span>{_mais(k, fim=False)}</span>')
        linhas.append(_linha(k, colunas, [mail, f'<span>{T(PAPEL[papel])}</span>', selo, f'<span>{por}</span>',
                                          f'<span style="color:{k["mfg"]};">{T(data)}</span>', acoes],
                             hover=hover, apagada=apagada, ultima=i == len(CONVITES) - 1))
    tabela = _tabela(k, T('mbTabelaConvites'), colunas,
                     [T('mbEmail'), T('papel'), T('mbEstado'), T('mbPor'), T('mbEnviado'), ''], linhas)
    return pagina_produto(k, T('mbConvites'), T('mbConvitesSub'), tabela, largura=1120)


def tela_convidar_limite(k):
    # o InviteForm dentro do produto, com o limite do Free e do Pro: 5 pessoas no plano, 4 no workspace
    # (ativos e convites pendentes) e 3 na lista; o aviso diz quantas tirar, e o envio desliga
    aviso = (f'<p role="status" style="margin:0;display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:10px;'
             f'background:{k["torange"]};color:{k["torangefg"]};font-size:13px;line-height:19px;">'
             f'<span style="display:flex;margin-top:2px;">{ic("aviso", 14)}</span><span>{T("mbLimite")}</span></p>')
    botao = (f'<div style="display:flex;justify-content:flex-end;padding-top:4px;"><button type="submit" disabled aria-disabled="true" '
             f'style="display:inline-flex;align-items:center;height:32px;padding:0 12px;border:0;border-radius:8px;background:{k["pri"]};'
             f'color:{k["prifg"]};font-family:{FONTE};font-size:13px;font-weight:500;opacity:0.45;">{T("cvBotao")}</button></div>')
    form = (f'<form style="margin:0;display:flex;flex-direction:column;gap:12px;width:560px;">{_adicionar(k)}'
            f'{_lista_convidados(k, invalido_="")}{aviso}{botao}</form>')
    return pagina_produto(k, T('mbConvidar'), T('cvSub'), form)


# ── Workspace · acima do limite de pessoas (B9b) ────────────────────────
# O plano passou a um limite menor que os membros ativos (aqui, o Free, 5 pessoas, com 7 no workspace):
# a API abre 7 dias de carência. O aviso (MemberOverflowNotice) fica acima da tabela; o owner escolhe
# quem tem prioridade (MemberPriorityDialog: os owners fixos, o contador e a prévia do fim do prazo em
# cada linha); no fim, quem passa do limite fica suspenso, apagado e com o selo, e o owner ainda o
# remove ou troca o papel, nunca para owner.
PESSOAS_B9 = PESSOAS + [
    ('u6', 'Duda Rocha', 'duda', 'member', 'mbD6'),
    ('u7', 'Eva Martins', 'eva.m', 'member', 'mbD7'),
]
ESCOLHIDOS = {'u2', 'u4', 'u6'}   # Ana, Bia e Duda: 1 owner + 3 = 4 de 5; o lugar que sobra vai para o João
SUSPENSOS = {'u5', 'u7'}          # Carlos e Eva, os mais novos fora da escolha


def _aviso_carencia(k):
    return (f'<section role="status" style="display:flex;align-items:center;gap:16px;padding:16px 18px 16px 20px;border-radius:14px;'
            f'background:{k["tyellow"]};box-shadow:inset 0 0 0 1px color-mix(in oklab, {k["tyellowfg"]} 22%, transparent);">'
            f'<span style="display:flex;width:20px;height:20px;flex:0 0 auto;align-self:flex-start;margin-top:1px;color:{k["tyellowfg"]};">{ic("pessoas", 20)}</span>'
            f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
            f'<span style="font-size:14.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("mbCarTit")}</span>'
            f'<span style="font-size:13.5px;line-height:19px;color:{k["fg"]};">{T("mbCarTxt")}</span></div>'
            f'<button type="button" style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border:0;border-radius:9px;flex:0 0 auto;'
            f'background:{k["card"]};color:{k["fg"]};box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:13.5px;font-weight:500;'
            f'white-space:nowrap;">{T("mbEscolher")}</button></section>')


def _pessoa_b9(k, nome, usuario, voce=False, suspenso=False, sub=None):
    marca = (f'<span style="display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:4px;'
             f'box-shadow:inset 0 0 0 1px {k["input"]};font-size:11px;font-weight:500;color:{k["mfg"]};">{T("mbVoce")}</span>' if voce else '')
    selo = badge(T('mbSuspenso'), k, 'orange', ponto=True) if suspenso else ''
    return (f'<span style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">'
            f'{_iniciais(k, "".join(p[0] for p in nome.split()[:2]))}'
            f'<span style="display:flex;flex-direction:column;min-width:0;">'
            f'<span style="display:flex;align-items:center;gap:6px;"><span style="font-weight:500;color:{k["mfg"] if suspenso else k["fgs"]};">{nome}</span>{marca}{selo}</span>'
            f'<span style="font-size:12px;color:{k["mfg"]};">{sub or "@" + usuario}</span></span></span>')


def _tabela_b9(k, suspensos, aberto=None):
    colunas = 'minmax(0,1fr) 148px 168px 28px'
    linhas = []
    for i, (id_, nome, usuario, papel, data) in enumerate(PESSOAS_B9):
        susp = id_ in suspensos
        papel_ = (_seletor(k, T(PAPEL[papel]), nome) if id_ != 'u1'
                  else f'<span style="display:flex;">{badge(T(PAPEL[papel]), k)}</span>')
        linhas.append(_linha(k, colunas, [_pessoa_b9(k, nome, usuario, voce=id_ == 'u1', suspenso=susp), papel_,
                                          f'<span style="color:{k["mfg"]};">{T(data)}</span>',
                                          _mais(k) if id_ == aberto else '<span></span>'],
                             hover=id_ == aberto, apagada=susp, ultima=i == len(PESSOAS_B9) - 1))
    return _tabela(k, T('mbTabelaMembros'), colunas, [T('mbPessoa'), T('papel'), T('mbEntrou'), ''], linhas)


def _lista_papeis(k, topo_, escolhido):
    # o SelectContent aberto na linha da suspensa: Maintainer, Member e Guest, sem Owner
    def op(papel):
        on = papel == escolhido
        return (f'<div role="option" aria-selected="{"true" if on else "false"}" style="display:flex;align-items:center;justify-content:space-between;'
                f'height:28px;padding:0 8px;border-radius:6px;font-size:13px;color:{k["fg"]};{"background:" + k["muted"] + ";" if on else ""}">'
                f'{T(PAPEL[papel])}{ic("check", 13) if on else ""}</div>')
    return (f'<div role="listbox" style="position:absolute;right:{16 + 28 + 20 + 168 + 20 + (148 - 132)}px;top:{topo_}px;z-index:3;width:132px;padding:4px;'
            f'border-radius:10px;background:{k["card"]};box-shadow:{k["sombraFlut"]}, 0 0 0 1px {k["border"]};">'
            + ''.join(op(p) for p in ('maintainer', 'member', 'guest')) + '</div>')


def tela_membros_carencia(k):
    return pagina_produto(k, T('mbMembros'), T('mbMembrosSub'), _aviso_carencia(k) + _tabela_b9(k, set()))


def tela_membros_suspensos(k):
    # a carência fechou: Carlos e Eva passaram do limite; o select da Eva aberto, sem Owner
    tabela = (f'<div style="position:relative;">{_tabela_b9(k, SUSPENSOS, aberto="u7")}'
              f'{_lista_papeis(k, 38 + 7 * 52 - 10, "member")}</div>')
    return pagina_produto(k, T('mbMembros'), T('mbMembrosSub'), tabela)


def _caixa(k, marcada, desligada=False):
    op = 'opacity:0.5;' if desligada else ''
    if marcada:
        return (f'<span role="checkbox" aria-checked="true"{" aria-disabled=\"true\"" if desligada else ""} style="display:flex;align-items:center;'
                f'justify-content:center;width:16px;height:16px;flex:0 0 auto;border-radius:4px;background:{k["pri"]};color:{k["prifg"]};{op}">{ic("check", 11)}</span>')
    return (f'<span role="checkbox" aria-checked="false" style="display:flex;width:16px;height:16px;flex:0 0 auto;border-radius:4px;'
            f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.12);{op}"></span>')


def tela_membros_escolha(k):
    # o MemberPriorityDialog sobre a página com o aviso: Rafael fixo; Ana, Bia e Duda marcados; o João fica
    # pela antiguidade no lugar que sobra; Carlos e Eva ficariam suspensos
    fundo = tela_membros_carencia(k)
    linha = lambda caixa, pessoa, fim: (f'<li style="display:flex;align-items:center;gap:12px;padding:8px 0;font-size:13px;">{caixa}{pessoa}'
                                        f'<span style="flex:0 0 auto;">{fim}</span></li>')
    nota = lambda txt: f'<span style="font-size:12px;color:{k["mfg"]};">{txt}</span>'
    owners = linha(_caixa(k, True, True), _pessoa_b9(k, 'Rafael Moura', 'rafael.moura', voce=True, sub=f'@rafael.moura · {T(PAPEL["owner"])}'),
                   nota(T('mbFicaSempre')))
    outros = []
    for id_, nome, usuario, papel, _ in PESSOAS_B9[1:]:
        marcado = id_ in ESCOLHIDOS
        fim = '' if marcado else (badge(T('mbFicaSusp'), k, 'orange', ponto=True) if id_ in SUSPENSOS else nota(T('mbFicaAntig')))
        outros.append(linha(_caixa(k, marcado), _pessoa_b9(k, nome, usuario, sub=f'@{usuario} · {T(PAPEL[papel])}'), fim))
    botao = lambda txt, est: (f'<button type="button" style="display:inline-flex;align-items:center;height:36px;padding:0 14px;border:0;border-radius:9px;'
                              f'{est}font-family:{FONTE};font-size:13.5px;font-weight:500;">{txt}</button>')
    dialogo = (f'<div style="position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:{k["veu"]};">'
               f'<div role="dialog" aria-modal="true" aria-label="{T("mbEscTit")}" style="position:relative;display:flex;flex-direction:column;width:520px;'
               f'border-radius:14px;background:{k["card"]};box-shadow:{k["sombraFlut"]};overflow:hidden;">'
               f'<header style="display:flex;flex-direction:column;gap:6px;padding:16px 52px 16px 20px;box-shadow:inset 0 -1px 0 {k["border"]};">'
               f'<h2 style="margin:0;font-size:16px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("mbEscTit")}</h2>'
               f'<p style="margin:0;font-size:13px;line-height:18px;color:{k["mfg"]};">{T("mbEscDesc")}</p>'
               f'<button type="button" aria-label="{T("mbFechar")}" style="position:absolute;top:14px;right:14px;display:flex;align-items:center;justify-content:center;'
               f'width:28px;height:28px;padding:0;border:0;border-radius:7px;background:transparent;color:{k["mfg"]};">{ic("x", 16)}</button></header>'
               f'<div style="padding:16px 20px 8px;font-size:13px;font-weight:500;color:{k["fgs"]};">{T("mbEscConta")}</div>'
               f'<ul aria-label="{T("mbEscOwners")}" style="margin:0;padding:4px 20px;list-style:none;">{owners}</ul>'
               f'<ul aria-label="{T("mbEscCandidatos")}" style="margin:0;padding:4px 20px 12px;list-style:none;box-shadow:inset 0 1px 0 {k["border"]};">{"".join(outros)}</ul>'
               f'<footer style="display:flex;justify-content:flex-end;gap:8px;padding:16px 20px;box-shadow:inset 0 1px 0 {k["border"]};">'
               f'{botao(T("mbCancelar"), "background:" + k["card"] + ";color:" + k["fg"] + ";box-shadow:inset 0 0 0 1px " + k["input"] + ";")}'
               f'{botao(T("mbSalvar"), "background:" + k["pri"] + ";color:" + k["prifg"] + ";")}</footer></div></div>')
    # o diálogo vai dentro da raiz (posição relativa), por cima da página
    return fundo[:-len('</div>')] + dialogo + '</div>'


TELAS_B = {
    'membros_owner': lambda k: tela_membros(k, 'owner'),
    'membros_maintainer': lambda k: tela_membros(k, 'maintainer'),
    'convites': tela_convites,
    'convidar_limite': tela_convidar_limite,
    'membros_carencia': tela_membros_carencia,
    'membros_escolha': tela_membros_escolha,
    'membros_suspensos': tela_membros_suspensos,
}


def montar(tela, tema):
    i = tela['id']
    if i in ('entrar', 'criar_conta'):
        return montar_acesso(tela, tema)
    if i == 'identidade_movimento':
        textos = juntar(COMUM, IDENTIDADE, MOVIMENTO)
        return casca(tela['titulo'], tela_movimento(K), logica(textos, tema, MOV_ANTES, MOV_VALORES) + MOV_METODOS,
                     {**PROPS_IDIOMA, **props_tema(tema)}, CSS_MOVIMENTO)
    if i.startswith('identidade_'):
        return pagina(tela['titulo'], tela_identidade(K, i.split('_', 1)[1]), tema, IDENTIDADE)
    if i in TELAS_B:
        return pagina(tela['titulo'], TELAS_B[i](K), tema, juntar(ENTRADA, CONVIDAR, MEMBROS))
    if i in TELAS_C:
        return pagina_cb(tela['titulo'], TELAS_C[i](K), tema, COBRANCA)
    if i in TELAS_A2:
        textos = juntar(IDENTIDADE, ENTRADA) if i in COM_IDENTIDADE else ENTRADA
        if i in COM_CONVIDAR:
            textos = juntar(IDENTIDADE, ENTRADA, CONVIDAR)
        return pagina(tela['titulo'], TELAS_A2[i](K), tema, textos)
    raise ValueError(f'tela desconhecida: {i}')
