# As telas do Muriki Platform. Cada uma é o desenho de um bloco do registry nos estados que o
# produto precisa ver; o estado é fixo por quadro (o canvas mostra um quadro por estado) e o
# idioma e o tema trocam no próprio quadro.
from pecas import (K, T, ic, pagina, pagina_identidade, cabecalho_passo, campo, caixa_marcar, botao_passo,  # noqa: F401
                   cartoes_escolha, esc, previa_workspace, PRODUTOS, previa_movimento, CSS_MOVIMENTO, casca, logica,
                   juntar, COMUM, PROPS_IDIOMA, props_tema)
from textos_identidade import IDENTIDADE, MOVIMENTO
from textos_entrada import ENTRADA, CONVIDAR
from entrada import TELAS_A2, COM_IDENTIDADE, COM_CONVIDAR
from acesso import montar_acesso


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
    if i in TELAS_A2:
        textos = juntar(IDENTIDADE, ENTRADA) if i in COM_IDENTIDADE else ENTRADA
        if i in COM_CONVIDAR:
            textos = juntar(IDENTIDADE, ENTRADA, CONVIDAR)
        return pagina(tela['titulo'], TELAS_A2[i](K), tema, textos)
    raise ValueError(f'tela desconhecida: {i}')
