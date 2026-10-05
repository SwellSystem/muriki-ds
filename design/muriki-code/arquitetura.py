# ── Exercício de arquitetura: a bancada ─────────────────────────────────
# O mesmo esqueleto da tela de exercício de código (cabeçalho, coluna da esquerda em cartões
# recolhíveis, moldura à direita), com a bancada no lugar do editor: o rail traz Peças e Regras no
# lugar de Código e Testes, a barra de cima traz a ação da seleção e "Verificar", e o canvas mostra
# o diagrama. Espelha o bloco architecture-board do registry. Plano:
# swell-docs/muriki-code-platform/features/exercicio-arquitetura.
#
# O SVG do diagrama só desenha linhas e setas, com números literais: no canvas, {{t.…}} dentro de
# <text> sai vazio. Peças e rótulos das ligações são HTML por cima, em posições absolutas.
#
# Grafo v2 (2026-10-04, swell-docs/muriki-api/features/arch-cloud/cl-desenho.md): o rail ganha
# Provedor e Grupos. O quadro na nuvem mostra o mesmo exercício na AWS, com região, VPC e sub-redes
# (a caixa genérica, diferenciada pelo contorno), os ícones oficiais dos serviços e o inspetor do
# serviço aberto na barra.
import os, re
from base import *

_ICONES_NUVEM = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'registry', 'muriki', 'cloud-service-icons')


def _icone_servico(servico, tam=28):
    # o SVG oficial, sem mudar o desenho; os ids internos ganham prefixo, porque o pacote da AWS
    # repete id="linearGradient-1" e, inline na mesma página, um ícone pintaria o outro
    provedor, nome = servico.split('.', 1)
    svg_ = open(os.path.join(_ICONES_NUVEM, provedor, f'{nome}.svg')).read()
    svg_ = re.sub(r'<\?xml[^>]*\?>|<!--.*?-->|<title>.*?</title>', '', svg_, flags=re.S)
    pre = servico.replace('.', '-') + '-'
    svg_ = re.sub(r'id="([^"]+)"', lambda m: f'id="{pre}{m.group(1)}"', svg_)
    svg_ = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{pre}{m.group(1)})', svg_)
    svg_ = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{pre}{m.group(1)}"', svg_)
    svg_ = re.sub(r'<svg([^>]*?)\swidth="[^"]*"', r'<svg\1', svg_, count=1)
    svg_ = re.sub(r'<svg([^>]*?)\sheight="[^"]*"', r'<svg\1', svg_, count=1)
    svg_ = svg_.replace('<svg', f'<svg width="{tam}" height="{tam}" aria-hidden="true"', 1)
    return f'<span style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;">{svg_.strip()}</span>'

# ícones das peças, no traço dos ícones do gerador (viewBox 16, stroke 1.4)
IP = dict(
    cliente=svg('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/><path d="M1.8 5.8h12.4"/><path d="M4 4.3h.1M5.6 4.3h.1"/>'),
    api=svg('<path d="M6 1.8v3M10 1.8v3"/><path d="M4.4 4.8h7.2v2.6A3.6 3.6 0 018 11a3.6 3.6 0 01-3.6-3.6z"/><path d="M8 11v3.2"/>'),
    banco=svg('<ellipse cx="8" cy="3.8" rx="5" ry="2"/><path d="M3 3.8v8.4c0 1.1 2.2 2 5 2s5-.9 5-2V3.8"/><path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"/>'),
    cache=svg('<path d="M9 1.6L3.6 9h4l-1 5.4L12.4 7h-4z"/>'),
    fila=svg('<path d="M2.4 4h11.2M2.4 8h11.2M2.4 12h6"/><path d="M11 10.6l2 1.4-2 1.4"/>'),
    worker=I['engrenagem'],
    cdn=I['globo'],
    balanceador=svg('<path d="M8 1.8v4.4"/><path d="M8 6.2L3.4 10.6M8 6.2l4.6 4.4"/><circle cx="3.4" cy="12.2" r="1.6"/><circle cx="12.6" cy="12.2" r="1.6"/><circle cx="8" cy="1.8" r=".1"/>'),
    grupo=svg('<rect x="2" y="2" width="12" height="12" rx="1.6"/><path d="M8 2v12"/><path d="M8 5h6M8 8h6M8 11h6"/>'),
    ligar=svg('<path d="M6.6 9.4l2.8-2.8"/><path d="M7.4 4.6l1.2-1.2a2.6 2.6 0 013.7 3.7l-1.2 1.2M8.6 11.4l-1.2 1.2a2.6 2.6 0 01-3.7-3.7l1.2-1.2"/>'),
    mover=svg('<path d="M8 1.8v12.4M1.8 8h12.4"/><path d="M6.2 3.6L8 1.8l1.8 1.8M6.2 12.4L8 14.2l1.8-1.8M3.6 6.2L1.8 8l1.8 1.8M12.4 6.2L14.2 8l-1.8 1.8"/>'),
    caret=svg('<path d="M4.5 6.5L8 10l3.5-3.5"/>'),
    pulso=svg('<path d="M1.6 8h3l1.8-4.4 3.2 8.8L11.4 8h3"/>'),
    painel=svg('<rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6"/><path d="M6 2.8v10.4"/>'),
    levantar=svg('<path d="M3.2 6.2A5 5 0 1 1 3 9.6"/><path d="M3.2 2.8v3.4h3.4"/>'),
)


def _ip(nome, tam=16, cor=None):
    c = f'color:{cor};' if cor else ''
    return f'<span style="display:flex;width:{tam}px;height:{tam}px;flex:0 0 auto;{c}">{IP[nome]}</span>'


def _titulo_secao(texto, k, forte=True, aberto=True):
    # a seção recolhível do DS: a seta e o rótulo mono; na coluna da esquerda o rótulo fala mais alto
    seta = ic('baixo', 11, k['mfg']) if aberto else ic('direita', 11, k['mfg'])
    cor = k['fgs'] if forte else k['mfg']
    peso = '600' if forte else '500'
    tam = '10.5px' if forte else '9.5px'
    return (f'<span style="display:flex;align-items:center;gap:7px;">{seta}'
            f'<span style="font-family:{MONO};font-size:{tam};font-weight:{peso};letter-spacing:0.16em;'
            f'text-transform:uppercase;color:{cor};">{texto}</span></span>')


def _cartao_secao(k, titulo, corpo, direita='', extra=''):
    topo = (f'<div style="display:flex;align-items:center;height:38px;padding:0 10px 0 14px;">'
            f'{_titulo_secao(titulo, k)}<span style="margin-left:auto;">{direita}</span></div>')
    return (f'<section style="background:{k["card"]};border-radius:12px;box-shadow:{k["sombra"]};'
            f'display:flex;flex-direction:column;overflow:hidden;{extra}">{topo}{corpo}</section>')


def _peca(k, x, y, icone, tipo, nome, estado=''):
    # a peça do diagrama: o ícone num quadrado tingido, o tipo em mono e o rótulo da pessoa.
    # estado (Simular): 'caida' fica cinza com o X vermelho; 'apagada' o pulso não alcança
    fundo = k['muted'] if estado == 'caida' else k['card']
    conteudo = 'opacity:0.6;filter:grayscale(1);' if estado == 'caida' else ''
    marca = (f'<span style="position:absolute;top:-8px;right:-8px;display:flex;align-items:center;justify-content:center;width:20px;height:20px;'
             f'border-radius:999px;background:{k["card"]};box-shadow:0 0 0 1px {k["input"]};color:{k["bad"]};">{ic("x", 12)}</span>') if estado == 'caida' else ''
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:168px;min-height:52px;box-sizing:border-box;'
            f'display:flex;align-items:center;gap:10px;padding:8px 10px 8px 8px;border-radius:10px;background:{fundo};'
            f'box-shadow:0 0 0 {"2px " + k["pri"] if estado == "caida" else "1px " + k["input"]}, 0 1px 2px rgba(0,0,0,0.06);'
            f'{"opacity:0.35;" if estado == "apagada" else ""}">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;'
            f'background:{k["prisub"]};color:{k["prisubfg"]};flex:0 0 auto;{conteudo}">{_ip(icone, 16)}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0;{conteudo}">'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:{k["mfg"]};">{tipo}</span>'
            f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["fgs"]};white-space:nowrap;">{nome}</span></span>{marca}</div>')


def _peca_servico(k, x, y, servico, nome_servico, nome, marcado=False, aprox=False):
    # a peça com serviço: o ícone oficial como veio, o nome oficial ao lado (até duas linhas, nunca
    # dentro do ícone) e o rótulo da pessoa
    sombra = f'0 0 0 2px {k["pri"]}' if marcado else f'0 0 0 1px {k["input"]}'
    marca = (f'<span title="{T("aproximadoDica")}" style="flex:0 0 auto;padding:0 4px;border-radius:4px;background:{k["tyellow"]};'
             f'color:{k["tyellowfg"]};font-size:10px;line-height:14px;font-weight:500;">≈</span>') if aprox else ''
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:168px;min-height:52px;box-sizing:border-box;'
            f'display:flex;align-items:center;gap:10px;padding:8px 10px 8px 8px;border-radius:10px;background:{k["card"]};'
            f'box-shadow:{sombra}, 0 1px 2px rgba(0,0,0,0.06);">'
            f'<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;flex:0 0 auto;">{_icone_servico(servico, 28)}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0;">'
            f'<span style="display:flex;align-items:flex-start;gap:4px;"><span style="font-size:10.5px;line-height:13px;font-weight:500;color:{k["mfg"]};">{nome_servico}</span>{marca}</span>'
            f'<span style="font-size:13px;line-height:18px;font-weight:500;color:{k["fgs"]};white-space:nowrap;">{nome}</span></span></div>')


# a caixa de grupo genérica: região e zona tracejadas, VPC e sub-redes em linha cheia, a pública num tom
# verde e a privada num tom azul; o fundo translúcido deixa ver a ligação que passa por baixo
def _grupo(k, x, y, w, h, tipo, rotulo=''):
    pele = {
        'regiao': f'border:1.5px dashed color-mix(in oklab, {k["mfg"]} 45%, transparent);background:color-mix(in oklab, {k["mfg"]} 2.5%, transparent);',
        'vpc': f'border:1.5px solid color-mix(in oklab, {k["mfg"]} 40%, transparent);background:color-mix(in oklab, {k["mfg"]} 3%, transparent);',
        'publica': f'border:1.5px solid color-mix(in oklab, {k["ok"]} 45%, transparent);background:color-mix(in oklab, {k["ok"]} 6%, transparent);',
        'privada': f'border:1.5px solid color-mix(in oklab, {k["pri"]} 40%, transparent);background:color-mix(in oklab, {k["pri"]} 5%, transparent);',
    }[tipo]
    titulo = {'regiao': T('gRegiao'), 'vpc': T('gVpc'), 'publica': T('gPublica'), 'privada': T('gPrivada')}[tipo]
    nome = f'<span style="font-size:12px;line-height:16px;font-weight:500;color:{k["fgs"]};">{rotulo}</span>' if rotulo else ''
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;box-sizing:border-box;border-radius:12px;{pele}">'
            f'<span style="position:absolute;top:8px;left:10px;display:flex;align-items:center;gap:6px;padding:2px 6px;border-radius:6px;'
            f'background:color-mix(in oklab, {k["card"]} 90%, transparent);box-shadow:0 0 0 1px {k["input"]};">'
            f'<span style="font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:{k["mfg"]};">{titulo}</span>'
            f'{nome}</span></div>')


def _chip(k, x, y, texto, marcado=False):
    borda = f'0 0 0 1.5px {k["pri"]}' if marcado else f'0 0 0 1px {k["input"]}'
    cor = k['pri'] if marcado else k['mfg']
    return (f'<span style="position:absolute;left:{x}px;top:{y}px;transform:translate(-50%,-50%);display:inline-flex;'
            f'align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;background:{k["card"]};box-shadow:{borda};'
            f'font-size:11px;color:{cor};white-space:nowrap;">{texto}</span>')


def _diagrama(k, simular=False):
    # palco de 640 × 400: Navegador → API, a API lê o Redis e escreve no Postgres (selecionada).
    # Simular: a API caiu; o pulso sai do Navegador e para nela; Redis e Postgres ficam apagados
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    if simular:
        apagado = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
        linhas = (
            f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
            f'<defs><marker id="seta-sim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
            f'<path d="M0 0L10 5L0 10z" fill="var(--pri)"/></marker>'
            f'<marker id="seta-sim-apagada" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
            f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
            f'<path d="M188 200H232" fill="none" stroke="var(--pri)" stroke-width="1.5" marker-end="url(#seta-sim)"/>'
            f'<circle cx="214" cy="200" r="4" fill="var(--pri)"/>'
            f'<g opacity="0.25"><path d="M400 200H418Q426 200 426 192V94Q426 86 434 86H444" fill="none" stroke="{apagado}" stroke-width="1.25" marker-end="url(#seta-sim-apagada)"/>'
            f'<path d="M400 200H418Q426 200 426 208V306Q426 314 434 314H444" fill="none" stroke="{apagado}" stroke-width="1.25" marker-end="url(#seta-sim-apagada)"/></g>'
            f'</svg>')
        pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'))
                 + _peca(k, 232, 174, 'api', T('pApi'), T('nApi'), 'caida')
                 + _peca(k, 444, 60, 'cache', T('pCache'), T('nRedis'), 'apagada')
                 + _peca(k, 444, 288, 'banco', T('pBanco'), T('nPostgres'), 'apagada'))
        chips = (_chip(k, 210, 200, T('chama'))
                 + '<span style="opacity:0.4;">' + _chip(k, 426, 140, f'{T("le")} · {T("rotuloCache")}') + _chip(k, 426, 262, T('escreve')) + '</span>')
        return f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>'
    linhas = (
        f'<svg viewBox="0 0 640 400" width="640" height="400" style="position:absolute;inset:0;overflow:visible;" aria-hidden="true">'
        f'<defs>'
        f'<marker id="seta-arq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker>'
        f'<marker id="seta-arq-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--pri)"/></marker></defs>'
        f'<path d="M188 200H232" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-arq)"/>'
        f'<path d="M400 200H418Q426 200 426 192V94Q426 86 434 86H444" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-arq)"/>'
        f'<path d="M400 200H418Q426 200 426 208V306Q426 314 434 314H444" fill="none" stroke="var(--pri)" stroke-width="1.75" marker-end="url(#seta-arq-sel)"/>'
        f'</svg>')
    pecas = (_peca(k, 20, 174, 'cliente', T('pCliente'), T('nNavegador'))
             + _peca(k, 232, 174, 'api', T('pApi'), T('nApi'))
             + _peca(k, 444, 60, 'cache', T('pCache'), T('nRedis'))
             + _peca(k, 444, 288, 'banco', T('pBanco'), T('nPostgres')))
    # a peça selecionada (a ligação "escreve") tem as alças à mostra nas duas pontas
    chips = (_chip(k, 210, 200, T('chama'))
             + _chip(k, 426, 140, f'{T("le")} <span style="color:{k["fg"]};">· {T("rotuloCache")}</span>')
             + _chip(k, 426, 262, T('escreve'), marcado=True))
    return (f'<div style="position:relative;width:640px;height:400px;">{linhas}{pecas}{chips}</div>')


def _diagrama_nuvem(k):
    # palco de 720 × 420, na AWS: o Navegador fora da região; o balanceador na sub-rede pública; a API
    # (selecionada), o Redis e o Postgres na privada. A API lê o Redis e escreve no Postgres
    traco = 'color-mix(in oklab, var(--mfg) 70%, transparent)'
    linhas = (
        f'<svg viewBox="0 0 720 420" width="720" height="420" style="position:absolute;inset:0;overflow:visible;z-index:1;pointer-events:none;" aria-hidden="true">'
        f'<defs>'
        f'<marker id="seta-nuvem" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0 0L10 5L0 10z" fill="var(--mfg)"/></marker></defs>'
        f'<path d="M168 232H186Q194 232 194 224V174Q194 166 202 166H222" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-nuvem)"/>'
        f'<path d="M390 166H434" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-nuvem)"/>'
        f'<path d="M518 192V230" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-nuvem)"/>'
        f'<path d="M602 166H664Q672 166 672 174V340Q672 348 664 348H604" fill="none" stroke="{traco}" stroke-width="1.25" marker-end="url(#seta-nuvem)"/>'
        f'</svg>')
    grupos = (_grupo(k, 190, 8, 522, 404, 'regiao', 'us-east-1')
              + _grupo(k, 206, 44, 490, 352, 'vpc', T('nProducao'))
              + _grupo(k, 214, 82, 196, 132, 'publica')
              + _grupo(k, 420, 82, 266, 304, 'privada'))
    pecas = (_peca(k, 0, 206, 'cliente', T('pCliente'), T('nNavegador'))
             + _peca_servico(k, 222, 140, 'aws.elb', 'Elastic Load Balancing', T('nEntrada'))
             + _peca_servico(k, 434, 140, 'aws.lambda', 'AWS Lambda', T('nApi'), marcado=True)
             + _peca_servico(k, 434, 232, 'aws.elasticache', 'Amazon ElastiCache', T('nRedis'))
             + _peca_servico(k, 434, 322, 'aws.rds', 'Amazon RDS', T('nPostgres')))
    chips = (_chip(k, 194, 196, T('chama'))
             + _chip(k, 412, 166, T('chama'))
             + _chip(k, 518, 212, f'{T("le")} <span style="color:{k["fg"]};">· {T("rotuloCache")}</span>')
             + _chip(k, 672, 258, T('escreve')))
    # o bloco encaixa o desenho na vista (fitView); aqui, o palco encolhe para caber na área do diagrama
    return (f'<div style="position:relative;width:720px;height:420px;zoom:0.86;">{grupos}{linhas}{pecas}{chips}</div>')


def _provedor(k, atual):
    # o ViewToggle do DS no topo do rail: trilho afundado e a pílula (no bloco, ela desliza);
    # "Genérico" ganha mais espaço que as siglas
    opcao = lambda chave, marcada: (
        f'<span style="display:flex;align-items:center;justify-content:center;height:30px;border-radius:999px;font-size:12px;font-weight:500;'
        + (f'background:{k["card"]};color:{k["pri"]};box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};'
           if marcada else f'color:{k["mfg"]};')
        + f'">{T(chave)}</span>')
    dica = T('provedorDica') if atual != 'generico' else T('provedorDicaGenerico')
    return (f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("provedor"), k, forte=False)}</div>'
            f'<div style="display:flex;flex-direction:column;gap:6px;padding:0 12px 12px;">'
            f'<div role="tablist" aria-label="{T("provedor")}" style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;padding:2px;border-radius:999px;background:{k["sunken"]};'
            f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};">'
            + ''.join(opcao(c, c == atual) for c in ('generico', 'aws', 'gcp', 'azure'))
            + f'</div><span style="padding:0 4px;font-size:11.5px;line-height:16px;color:{k["mfg"]};">{dica}</span></div>')


def _popover_servico(k):
    # o inspetor do serviço aberto: os serviços do tipo API na AWS, o atual marcado
    linha = lambda servico, nome, atual=False: (
        f'<li style="display:flex;align-items:center;gap:10px;height:36px;padding:0 6px;border-radius:6px;font-size:12.5px;color:{k["fg"]};'
        + (f'background:{k["muted"]};' if atual else '') + f'">'
        f'{_icone_servico(servico, 24)}<span style="flex:1;">{nome}</span>'
        + (ic('check', 14, k['pri']) if atual else '') + '</li>')
    return (f'<div style="position:absolute;top:44px;left:8px;width:288px;z-index:5;padding:8px;box-sizing:border-box;border-radius:12px;'
            f'background:{k["card"]};box-shadow:0 0 0 1px {k["input"]}, 0 10px 26px rgba(0,0,0,0.12);">'
            f'<span style="display:block;padding:2px 6px 6px;font-family:{MONO};font-size:9.5px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:{k["mfg"]};">{T("servico")}</span>'
            f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:1px;">'
            f'{linha("aws.lambda", "AWS Lambda", True)}{linha("aws.ecs", "Amazon ECS")}{linha("aws.eks", "Amazon EKS")}{linha("aws.ec2", "Amazon EC2")}'
            f'</ul></div>')


def tela_exercicio_arquitetura(k, nuvem=False, simular=False):
    chips = (badge(T('chipSD'), k, 'blue') + badge(T('nivel'), k, 'gray') + badge(T('andamento'), k, 'yellow', ponto=True))
    trilha = topo_detalhe(k, [(T('trilhaArq'), '#'), (T('titulo'), '')])
    cab = (f'<header style="display:flex;align-items:flex-end;gap:24px;">'
           f'<div style="display:flex;flex-direction:column;gap:8px;flex:1;min-width:0;">{trilha}'
           f'<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;color:{k["fgs"]};letter-spacing:-0.01em;">{T("titulo")}</h1>'
           f'<div style="display:flex;gap:6px;flex-wrap:wrap;">{chips}</div></div>'
           f'<div style="display:flex;align-items:center;gap:8px;">'
           f'<span style="font-size:12px;color:{k["mfg"]};margin-right:6px;">{T("salvo")}</span>'
           f'{botao(T("continuarIde"), k, "ghost", 36, "laptop")}{botao(T("enviar"), k, "solid", 36, "enviar")}</div></header>')

    req = lambda conteudo: (f'<li style="display:flex;gap:10px;align-items:flex-start;">'
                            f'<span style="margin-top:8px;width:5px;height:5px;border-radius:999px;background:{k["mfg"]};flex:0 0 auto;"></span>'
                            f'<span>{conteudo}</span></li>')
    enunciado = _cartao_secao(k, T('enunciado'), (
        f'<div style="display:flex;flex-direction:column;gap:12px;padding:0 16px 16px;font-size:14px;line-height:22px;color:{k["fg"]};">'
        f'<p style="margin:0;">{T("enunciadoTexto")}</p>'
        f'<div style="display:flex;flex-direction:column;gap:6px;">'
        f'<h2 style="margin:0;font-size:13px;line-height:18px;font-weight:600;color:{k["fgs"]};">{T("precisa")}</h2>'
        f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:20px;">'
        f'{req(T("req1"))}{req(T("req2"))}{req(T("req3"))}</ul></div></div>'), extra='flex:1;min-height:0;')
    explicacao = _cartao_secao(k, T('explique'), (
        f'<div style="display:flex;flex-direction:column;gap:10px;padding:0 16px 16px;">'
        f'<label for="explicacao-arq" style="font-size:14px;line-height:21px;font-weight:500;color:{k["fgs"]};">{T("pergunta")}</label>'
        f'<textarea id="explicacao-arq" rows="3" placeholder="{T("placeholder")}" '
        f'style="resize:none;width:100%;box-sizing:border-box;padding:10px 12px;border:0;border-radius:8px;background:{k["sunken"]};'
        f'box-shadow:inset 0 0 0 1px {k["input"]};font-family:{FONTE};font-size:13.5px;line-height:20px;color:{k["fgs"]};outline:0;"></textarea>'
        f'<span style="font-size:12px;color:{k["mfg"]};">{T("nota")}</span></div>'), direita=badge(T('vaiAvaliacao'), k, 'blue'))
    dicas = _cartao_secao(k, T('dicas'), (
        f'<div style="display:flex;align-items:center;gap:10px;padding:0 12px 12px 16px;">'
        f'{ic("dica", 16, k["warn"])}<span style="flex:1;font-size:13px;color:{k["fg"]};">{T("dicasDisp")}</span>'
        f'{botao(T("pedirDica"), k, "outline", 32)}</div>'))
    esquerda = (f'<div style="width:372px;flex:0 0 372px;display:flex;flex-direction:column;gap:12px;min-height:0;">'
                f'{enunciado}{explicacao}{dicas}</div>')

    item_peca = lambda icone, nome: (
        f'<li style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:6px;font-size:12.5px;color:{k["fg"]};">'
        f'{_ip(icone, 15, k["mfg"])}{nome}</li>')
    pecas = (f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("pecas"), k, forte=False)}</div>'
             f'<ul style="margin:0;padding:0 6px 8px;list-style:none;display:flex;flex-direction:column;gap:1px;">'
             f'{item_peca("cliente", T("pCliente"))}{item_peca("api", T("pApi"))}{item_peca("banco", T("pBanco"))}'
             f'{item_peca("cache", T("pCache"))}{item_peca("fila", T("pFila"))}{item_peca("worker", T("pWorker"))}{item_peca("cdn", T("pCdn"))}'
             f'{item_peca("balanceador", T("pBalanceador"))}</ul>')
    grupos = (f'<div style="border-top:1px solid {k["muted"]};">'
              f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("grupos"), k, forte=False)}</div>'
              f'<ul style="margin:0;padding:0 6px 4px;list-style:none;display:flex;flex-direction:column;gap:1px;">'
              + ''.join(item_peca('grupo', T(g)) for g in ('gRegiao', 'gZona', 'gVpc', 'gPublica', 'gPrivada'))
              + f'</ul><span style="display:block;padding:2px 16px 10px;font-size:11.5px;line-height:16px;color:{k["mfg"]};">{T("gruposDica")}</span></div>')
    regra = lambda ok, texto: (
        f'<li style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;">'
        f'{ic("check" if ok else "x", 12, k["ok"] if ok else k["bad"])}'
        f'<span style="font-size:12.5px;line-height:17px;color:{k["fg"] if ok else k["fgs"]};">{texto}</span></li>')
    regras = (f'<div style="border-top:1px solid {k["muted"]};">'
              f'<div style="display:flex;align-items:center;height:38px;padding:0 6px 0 14px;">{_titulo_secao(T("regras"), k, forte=False)}'
              f'<span style="margin-left:auto;">{badge(T("passam"), k, "red", ponto=True)}</span></div>'
              f'<ul style="margin:0;padding:0 6px;list-style:none;display:flex;flex-direction:column;gap:1px;">'
              f'{regra(True, T("r1"))}{regra(True, T("r2"))}{regra(False, T("r3"))}</ul>'
              f'<span style="display:block;padding:6px 16px 10px;font-size:11.5px;color:{k["mfg"]};">{T("dicaVerificar")}</span></div>')
    provedor = _provedor(k, 'aws' if nuvem else 'generico')
    pecas = f'<div style="border-top:1px solid {k["muted"]};">{pecas}</div>'
    if simular:
        # durante a simulação o desenho não se edita: a paleta fica apagada
        provedor, pecas, grupos = (f'<div style="opacity:0.5;">{x}</div>' for x in (provedor, pecas, grupos))
    # o rail rola, como no bloco: as seções não se espremem para caber
    lateral = (f'<div style="width:248px;flex:0 0 248px;display:flex;flex-direction:column;min-height:0;overflow-y:auto;background:{k["rail"]};'
               f'border-right:1px solid {k["muted"]};">{provedor}{pecas}{grupos}{regras}</div>')

    # os tipos de ligação no ViewToggle do DS, como o provedor
    rel = lambda chave, at=False: (
        f'<span style="display:inline-flex;align-items:center;height:30px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:500;'
        + (f'background:{k["card"]};color:{k["pri"]};box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};'
           if at else f'color:{k["mfg"]};')
        + f'">{T(chave)}</span>')
    trilho = lambda conteudo: (f'<span role="tablist" style="display:inline-flex;align-items:center;padding:2px;border-radius:999px;background:{k["sunken"]};'
                               f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};">{conteudo}</span>')
    acao = lambda icone, texto: (f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;border-radius:7px;'
                                 f'font-size:13px;font-weight:500;color:{k["fgs"]};">{_ip(icone, 14)}{texto}</span>')
    if simular:
        # o modo Simular com a API derrubada e selecionada: Levantar, Levantar tudo, e o botão aceso
        selecao = (f'{acao("levantar", T("levantarApi"))}{acao("levantar", T("levantarTudo"))}')
    elif nuvem:
        # a peça API selecionada: o serviço (com o inspetor aberto), Ligar a…, Mover para…, Renomear e Apagar
        selecao = (f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;border-radius:7px;'
                   f'background:{k["muted"]};font-size:13px;font-weight:500;color:{k["fgs"]};">{_icone_servico("aws.lambda", 16)}AWS Lambda{_ip("caret", 12, k["mfg"])}</span>'
                   f'{acao("ligar", T("ligarA"))}{acao("mover", T("moverPara"))}'
                   f'{botao(T("renomear"), k, "ghost", 28, "lapis")}{botao(T("apagar"), k, "ghost", 28, "lixeira")}')
    else:
        selecao = (trilho(f'{rel("chama")}{rel("le")}{rel("escreve", True)}{rel("publica")}{rel("consome")}')
                   + f'<span style="width:1px;height:16px;margin:0 4px;background:{k["input"]};"></span>'
                   f'{botao(T("renomear"), k, "ghost", 28, "lapis")}{botao(T("apagar"), k, "ghost", 28, "lixeira")}')
    # dois lados que não disputam espaço: à esquerda a seleção, que quebra a linha por dentro; à
    # direita Expandir, Simular (sempre com o nome) e Verificar, na primeira linha
    expandir = (f'<span role="img" aria-label="{T("expandir")}" title="{T("expandir")}" style="display:inline-flex;align-items:center;justify-content:center;'
                f'width:28px;height:28px;border-radius:7px;color:{k["mfg"]};">{_ip("painel", 14)}</span>')
    barra = (f'<div style="position:relative;display:flex;align-items:flex-start;gap:8px;min-height:41px;padding:6px 8px 6px 12px;border-bottom:1px solid {k["muted"]};box-sizing:border-box;">'
             f'<div style="flex:1;min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;">{selecao}</div>'
             f'<span style="flex:0 0 auto;display:flex;align-items:center;gap:6px;">{expandir}'
             + f'<span aria-pressed="{"true" if simular else "false"}" style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:8px;'
             + (f'background:{k["muted"]};' if simular else '')
             + f'font-size:13px;font-weight:500;color:{k["fgs"]};">{_ip("pulso", 14)}{T("sairSim") if simular else T("simular")}</span>'
             + f'{botao(T("verificar"), k, "primary", 30, "check")}</span>'
             + (_popover_servico(k) if nuvem else '') + '</div>')
    # na simulação o palco ganha o tom da marca e uma moldura: não é o desenho em edição
    fundo_palco = (f'background-color:color-mix(in oklab, {k["prisub"]} 50%, {k["card"]});box-shadow:inset 0 0 0 2px color-mix(in oklab, {k["pri"]} 40%, transparent);'
                   if simular else f'background-color:{k["card"]};')
    canvas_ = (f'<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;'
               f'{fundo_palco}background-image:radial-gradient(circle, {k["input"]} 1px, transparent 1.2px);'
               f'background-size:18px 18px;">{_diagrama_nuvem(k) if nuvem else _diagrama(k, simular)}</div>')
    # a faixa no topo do palco diz o que é o modo antes do resultado
    resumo = (f'<div role="status" style="display:flex;align-items:flex-start;gap:8px;min-height:34px;padding:7px 16px;box-sizing:border-box;'
              f'border-bottom:1px solid color-mix(in oklab, {k["pri"]} 22%, transparent);background:{k["prisub"]};color:{k["prisubfg"]};font-size:12.5px;line-height:18px;">'
              f'<span style="margin-top:2px;display:flex;">{_ip("pulso", 14)}</span><span><b>{T("simTit")}</b> · {T("simNaoSalvo")} <b>{T("simCaidas")}</b> · {T("simSemCaminho")}</span></div>') if simular else ''
    status = (f'<div style="display:flex;align-items:center;gap:14px;height:30px;padding:0 16px;border-top:1px solid {k["muted"]};'
              f'font-family:{MONO};font-size:11px;color:{k["mfg"]};white-space:nowrap;overflow:hidden;">'
              f'<span>{T("statusNuvem") if nuvem else T("status")}</span><span>{T("atalho")}</span></div>')
    bancada = (f'<section aria-label="{T("bancada")}" style="flex:1;min-width:0;display:flex;background:{k["card"]};'
               f'border-radius:12px;box-shadow:{k["sombra"]};overflow:hidden;">{lateral}'
               f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{barra}{resumo}{canvas_}{status}</div></section>')

    return app(k, 'exercicios', cab + f'<div style="display:flex;gap:16px;flex:1;min-height:0;">{esquerda}{bancada}</div>',
               compacto=True, pad='24px 28px', gap=18)
