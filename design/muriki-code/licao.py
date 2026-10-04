# A execução passo a passo e o "Você sabia?" (2026-10-03), pedido da API e decidido pelo Guilherme.
# Os dados vêm do pacote de conteúdo (muriki-content): um bloco `js trace` da lição gera os passos,
# cada um com a linha que vai rodar (null no fim), as variáveis visíveis já formatadas e o que a
# linha imprimiu; um "Você sabia?" é um título e um texto em Markdown (catalog/insights).
#
# PASSO A PASSO: o código com a linha atual marcada; ao lado (ou embaixo, no estreito) as variáveis,
# com "mudou" e "nova" no que mudou neste passo, e o console acumulado, com a linha nova em
# destaque; embaixo, recomeçar, anterior, tocar, próximo e a barra de progresso. O quadro anda de
# verdade: o estado mora no canvas (ANTES_LICAO).
#
# VOCÊ SABIA?: o mesmo cartão em três lugares, com a cor de destaque da marca (o amarelo), para não
# se confundir com a dica (o aviso) nem com o Peer (o azul): na lição, no guia de sintaxe (junto do
# recurso) e, quando o Peer acha a armadilha no código, como fala dele, na faixa.
import json

from base import *
from movel_code import raiz_movel, topo_movel, PAD
from telas import tela_exercicio

ALTURA_MOVEL = 1000

# lessons/js.variables.md, o bloco 5, e os passos dele (pt)
CODIGO = [
    ('let', ' original = ', '10', ';', ''),
    ('let', ' copy = original;', '', '', ' // copy recebe o valor 10'),
    ('', 'original = ', '20', ';', ' // muda original, e nada mais'),
    ('', '', '', '', ''),
    ('', 'console.log(original);', '', '', ' // 20'),
    ('', 'console.log(copy);', '', '', ' // 10'),
]
PASSOS = [{"line": 1, "state": {}}, {"line": 2, "state": {"original": "10"}},
          {"line": 3, "state": {"copy": "10", "original": "10"}},
          {"line": 5, "output": ["20"], "state": {"copy": "10", "original": "20"}},
          {"line": 6, "output": ["10"], "state": {"copy": "10", "original": "20"}},
          {"line": None, "state": {"copy": "10", "original": "20"}}]
PASSO_INICIAL = 2  # o quadro abre no passo 3: original acabou de ser copiado


def _linha_codigo(k, n, partes):
    kw, meio, num, fim, com = partes
    h = lambda caminho: '{{' + caminho + '}}'
    texto = (f'<span style="color:{k["pri"]};">{kw}</span>{meio}<span style="color:{k["warn"]};">{num}</span>{fim}'
             f'<span style="color:{k["mfg"]};">{com}</span>')
    return (f'<div style="display:flex;background:{h(f"cod.l{n}")};">'
            f'<span style="display:flex;align-items:center;justify-content:flex-end;gap:4px;width:40px;flex:0 0 auto;padding-right:12px;'
            f'color:{k["mfg"]};font-variant-numeric:tabular-nums;">'
            f'<span style="color:{k["pri"]};opacity:{h(f"cod.m{n}")};">▸</span>{n}</span>'
            f'<span style="white-space:pre;">{texto}</span></div>')


def passo_a_passo(k, estreito=False):
    h = lambda caminho: '{{' + caminho + '}}'
    codigo = ''.join(_linha_codigo(k, i + 1, p) for i, p in enumerate(CODIGO))
    cab = (f'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid {k["muted"]};">'
           f'{rotulo(T("execTit"), k["mfg"], 9.5)}'
           f'<span style="margin-left:auto;font-family:{MONO};font-size:11.5px;color:{k["mfg"]};font-variant-numeric:tabular-nums;">{h("px.rotulo")}</span></div>')
    area = (f'<div style="padding:10px 0;overflow-x:auto;font-family:{MONO};font-size:12.5px;line-height:22px;color:{k["fg"]};background:{k["card"]};">{codigo}</div>')
    var = (f'<div style="display:flex;flex-direction:column;gap:6px;padding:10px 14px;min-width:0;flex:1;">{rotulo(T("variaveis"), k["mfg"], 9.5)}'
           f'<sc-if value="{h("px.semVars")}" hint-placeholder-val="{{{{ false }}}}">'
           f'<span style="font-size:12px;color:{k["mfg"]};">{T("semVariaveis")}</span></sc-if>'
           f'<div style="display:flex;flex-direction:column;gap:2px;">'
           f'<sc-for list="{h("px.vars")}" as="v" hint-placeholder-count="2">'
           f'<div style="display:flex;align-items:center;gap:10px;height:26px;padding:0 8px;margin:0 -8px;border-radius:6px;background:{h("v.fundo")};">'
           f'<span style="font-family:{MONO};font-size:12px;color:{k["fg"]};">{h("v.nome")}</span>'
           f'<span style="font-family:{MONO};font-size:12px;font-weight:600;color:{k["fgs"]};">{h("v.valor")}</span>'
           f'<span style="margin-left:auto;font-size:11px;font-weight:500;color:{k["pri"]};">{h("v.tag")}</span></div></sc-for></div></div>')
    con = (f'<div style="display:flex;flex-direction:column;gap:6px;padding:10px 14px;min-width:0;flex:1;'
           + (f'border-top:1px solid {k["muted"]};' if estreito else f'border-left:1px solid {k["muted"]};')
           + f'">{rotulo(T("console_"), k["mfg"], 9.5)}'
           f'<sc-if value="{h("px.semSaida")}" hint-placeholder-val="{{{{ false }}}}">'
           f'<span style="font-size:12px;color:{k["mfg"]};">{T("semSaida")}</span></sc-if>'
           f'<div style="display:flex;flex-direction:column;gap:2px;font-family:{MONO};font-size:12px;">'
           f'<sc-for list="{h("px.saida")}" as="o" hint-placeholder-count="1">'
           f'<span style="display:block;padding:2px 8px;margin:0 -8px;border-radius:6px;background:{h("o.fundo")};color:{h("o.cor")};">'
           f'<span style="color:{k["mfg"]};">›</span> {h("o.texto")}</span></sc-for></div></div>')
    meio = (f'<div style="display:flex;{"flex-direction:column;" if estreito else ""}border-top:1px solid {k["muted"]};background:{k["rail"]};">{var}{con}</div>')
    bt = lambda txt, icone, acao, op, forte=False: (
        f'<button type="button" onClick="{h(acao)}" aria-label="{txt}" style="display:inline-flex;align-items:center;gap:6px;height:30px;'
        f'padding:0 {"10px" if not icone or forte else "8px"};border:0;border-radius:8px;opacity:{h(op) if op else 1};'
        + (f'background:{k["prisub"]};color:{k["prisubfg"]};' if forte else f'background:transparent;color:{k["fg"]};')
        + f'font-family:{FONTE};font-size:12.5px;font-weight:500;cursor:pointer;">{ic(icone, 14) if icone else ""}'
        f'{txt if (forte or not icone) else ""}</button>')
    controles = (f'<div style="display:flex;align-items:center;gap:4px;padding:8px 10px;border-top:1px solid {k["muted"]};">'
                 f'{bt(T("reiniciar"), "troca", "px.reini", "")}'
                 f'{bt(T("anterior"), "", "px.ant", "px.antOp")}'
                 f'{bt(T("tocar"), "", "px.prox", "px.proxOp")}'
                 f'<span style="flex:1;height:4px;margin:0 8px;border-radius:999px;background:{k["sunken"]};overflow:hidden;">'
                 f'<span style="display:block;height:100%;width:{h("px.barra")};background:{k["pri"]};"></span></span>'
                 f'{bt(T("proximo"), "seta", "px.prox", "px.proxOp", forte=True)}</div>')
    # o "Tocar" do canvas avança um passo; o de verdade anda sozinho e vira "Pausar"
    return (f'<section aria-label="{T("execTit")}" style="display:flex;flex-direction:column;overflow:hidden;border-radius:10px;'
            f'background:{k["card"]};box-shadow:0 0 0 1px {k["border"]};">{cab}{area}{meio}{controles}</section>')


ANTES_LICAO = """const P = __PASSOS__;
const n = P.length;
const i = Math.min(Math.max(s.passo == null ? __INICIAL__ : s.passo, 0), n - 1);
const atual = P[i];
const antes = i > 0 ? P[i - 1].state : {};
const ordem = [];
for (const p of P) for (const k of Object.keys(p.state)) if (!ordem.includes(k)) ordem.push(k);
const vars = ordem.filter((k) => k in atual.state).map((k) => {
  const nova = !(k in antes);
  const mudou = !nova && antes[k] !== atual.state[k];
  return { nome: k, valor: atual.state[k], fundo: nova || mudou ? "__PRISUB__" : "transparent",
           tag: nova ? t.nova : mudou ? t.mudou : "" };
});
const saida = [];
P.slice(0, i + 1).forEach((p, j) => (p.output || []).forEach((o) => saida.push({
  texto: o, cor: j === i ? "__FGS__" : "__FG__", fundo: j === i ? "__PRISUB__" : "transparent" })));
const cod = {};
for (let l = 1; l <= __LINHAS__; l++) {
  cod["l" + l] = atual.line === l ? "__PRISUB__" : "transparent";
  cod["m" + l] = atual.line === l ? 1 : 0;
}
const ir = (p) => this.setState({ passo: Math.min(Math.max(p, 0), n - 1) });
const px = {
  rotulo: atual.line == null ? t.fim : t.passo + " " + (i + 1) + " " + t.de + " " + n,
  vars: vars, semVars: vars.length === 0, saida: saida, semSaida: saida.length === 0,
  ant: () => ir(i - 1), prox: () => ir(i + 1), reini: () => ir(0),
  antOp: i === 0 ? 0.4 : 1, proxOp: i === n - 1 ? 0.4 : 1,
  barra: (n > 1 ? (i / (n - 1)) * 100 : 100) + "%"
};"""

VALORES_LICAO = """px: px,
cod: cod"""


def antes_licao(k):
    return (ANTES_LICAO.replace('__PASSOS__', json.dumps(PASSOS)).replace('__INICIAL__', str(PASSO_INICIAL))
            .replace('__LINHAS__', str(len(CODIGO))).replace('__PRISUB__', k['prisub']).replace('__FGS__', k['fgs']).replace('__FG__', k['fg']))


def _codigo_md(k, linhas):
    return (f'<pre style="margin:0;padding:10px 12px;border-radius:8px;background:{k["sunken"]};font-family:{MONO};font-size:12px;'
            f'line-height:19px;color:{k["fg"]};white-space:pre;overflow:hidden;">{linhas}</pre>')


def voce_sabia(k, titulo, a, codigo, b, rodape=''):
    # o cartão: o amarelo da marca (accent) tingindo o fundo, o brilho e o rótulo mono
    return (f'<aside aria-label="{T("voceSabia")}" style="display:flex;flex-direction:column;gap:8px;padding:14px 16px;border-radius:10px;'
            f'background:color-mix(in oklch, {k["accent"]} 14%, {k["card"]});box-shadow:inset 0 0 0 1px color-mix(in oklch, {k["accent"]} 45%, transparent);">'
            f'<span style="display:flex;align-items:center;gap:8px;">'
            f'<span style="display:flex;color:{k["tyellowfg"]};">{ic("brilho", 14)}</span>'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;'
            f'color:{k["tyellowfg"]};">{T("voceSabia")}</span></span>'
            f'<span style="font-size:14px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T(titulo)}</span>'
            f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["fg"]};">{T(a)}</p>{_codigo_md(k, codigo)}'
            f'<p style="margin:0;font-size:13px;line-height:20px;color:{k["fg"]};">{T(b)}</p>{rodape}</aside>')


COD_VS1 = 'const cart = { total: 10 };\ncart.total = 25;\nconsole.log(cart.total); // 25'
COD_VS2 = "console.log(0 == ''); // true\nconsole.log('1' == 1); // true\nconsole.log(null == 0); // false"


def _painel(k, titulo, desc, corpo, largura=560):
    # o painel lateral de conteúdo do sistema: solto 8px das bordas, em faixas (o sheet floating framed)
    return (f'<div role="dialog" aria-modal="true" aria-label="{T(titulo)}" style="position:absolute;top:8px;right:8px;bottom:8px;width:{largura}px;'
            f'display:flex;flex-direction:column;overflow:hidden;border-radius:14px;background:{k["card"]};box-shadow:{k["sombraFlut"]};">'
            f'<div style="display:flex;align-items:flex-start;gap:12px;padding:16px 20px;box-shadow:inset 0 -1px 0 {k["muted"]};">'
            f'<div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:0;">'
            f'<span style="font-size:16px;line-height:22px;font-weight:600;color:{k["fgs"]};">{T(titulo)}</span>'
            f'<span style="font-size:13px;color:{k["mfg"]};">{T(desc)}</span></div>'
            f'<span style="display:flex;color:{k["mfg"]};">{ic("x", 16)}</span></div>'
            f'<div style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:14px;padding:16px 20px;">{corpo}</div></div>')


def _sobre_exercicio(k, conteudo):
    fundo = tela_exercicio(k)
    assert fundo.endswith('</div>')
    return fundo[:-len('</div>')] + f'<div style="position:absolute;inset:0;z-index:5;background:{k["veu"]};">{conteudo}</div></div>'


def tela_licao(k):
    corpo = (f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">{T("licaoSecao")}</span>'
             f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("licaoTxt")}</p>'
             f'{passo_a_passo(k)}'
             f'{voce_sabia(k, "vs1Tit", "vs1a", COD_VS1, "vs1b")}')
    return _sobre_exercicio(k, _painel(k, 'licaoTit', 'licaoDesc', corpo))


def tela_guia_voce_sabia(k):
    rec = lambda nome, txt, cod: (f'<li style="display:flex;flex-direction:column;gap:4px;">'
                                  f'<span style="font-size:13.5px;font-weight:600;color:{k["fgs"]};">{T(nome)}</span>'
                                  f'<span style="font-size:13px;line-height:20px;color:{k["fg"]};">{T(txt)}</span>{_codigo_md(k, cod)}</li>')
    corpo = (f'{rotulo(T("guiaGrupo"), k["mfg"], 9.5)}'
             f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px;">'
             + rec('recIgual', 'recIgualTxt', "total === 10 // true\n'10' === 10 // false")
             + f'<li>{voce_sabia(k, "vs2Tit", "vs2a", COD_VS2, "vs2b")}</li>'
             + rec('recMaior', 'recMaiorTxt', "3 > 2 // true\n'b' > 'a' // true")
             + '</ul>')
    return _sobre_exercicio(k, _painel(k, 'guiaTit', 'guiaDesc', corpo))


def tela_peer_voce_sabia(k):
    # quando o Peer acha a armadilha no código (aqui, == na linha 4), a fala dele é o "Você sabia?"
    from peer_exercicio import _avatar, _acao, status, historico, H_PAUSA
    faixa = (f'<div role="note" style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-top:1px solid {k["muted"]};'
             f'background:color-mix(in oklch, {k["accent"]} 14%, {k["card"]});">{_avatar(k, 22)}'
             f'<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">'
             f'<span style="display:flex;align-items:center;gap:6px;font-family:{MONO};font-size:9.5px;font-weight:600;letter-spacing:0.16em;'
             f'text-transform:uppercase;color:{k["tyellowfg"]};">'
             f'<span style="display:flex;">{ic("brilho", 12)}</span>{T("peerNome")} · {T("voceSabia")}</span>'
             f'<span style="font-size:13.5px;line-height:20px;font-weight:600;color:{k["fgs"]};">{T("vs2Tit")}</span>'
             f'<span style="font-size:13px;line-height:19px;color:{k["fg"]};">{T("peerVsTxt")}</span></div>'
             f'<span style="display:flex;gap:14px;align-items:center;align-self:center;">{_acao(k, T("lerNoGuia"))}{_acao(k, T("entendi"), False)}</span></div>')
    return tela_exercicio(k, peer=dict(recolher=True, faixa=faixa, historico=historico(k, [H_PAUSA]), status=status(k)))


def tela_licao_movel(k):
    # no celular, a lição é a tela inteira; o passo a passo empilha variáveis e console
    corpo = (f'<main style="padding:16px {PAD}px 28px;display:flex;flex-direction:column;gap:14px;">'
             f'<h1 style="margin:0;font-size:22px;line-height:28px;font-weight:600;color:{k["fgs"]};">{T("licaoTit")}</h1>'
             f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">{T("licaoSecao")}</span>'
             f'<p style="margin:0;font-size:14px;line-height:22px;color:{k["fg"]};">{T("licaoTxt")}</p>'
             f'{passo_a_passo(k, estreito=True)}{voce_sabia(k, "vs1Tit", "vs1a", COD_VS1, "vs1b")}</main>')
    return f'{raiz_movel(k, ALTURA_MOVEL, "display:flex;flex-direction:column;")}{topo_movel(k, T("licaoTit"))}{corpo}</div>'
