from base import *

# ── calendários e suas origens ──────────────────────────────────────────
CALENDARIOS = [
  dict(nome='Meu focus',        cor='#1B50C0', fonte='muriki',  conta=''),
  dict(nome='guilherme@gmail',  cor='#348F4F', fonte='google',  conta='pessoal'),
  dict(nome='g.santos@swell',   cor='#DE6F00', fonte='outlook', conta='trabalho'),
]

EVENTOS = [
  dict(ini=9.0,  fim=9.5,  nome='Daily do time', cal=0, quem=6, conf='Meet'),
  dict(ini=11.0, fim=12.0, nome='Revisão do contrato · OpenAPI', cal=2, quem=3, conf='Teams'),
  dict(ini=15.0, fim=16.5, nome='1:1 com Mariana', cal=1, quem=1, conf='Meet'),
]
ENCAIXADAS = [
  dict(ini=9.75, fim=11.0, cod='MUR-216', nome='Implementar validação de email', prio='Alta', orig='jira'),
  dict(ini=12.5, fim=14.0, cod='MUR-301', nome='Revisar copy da tela de pricing', prio='Média', orig='docs'),
]
FILA = [
  dict(cod='MUR-219', nome='Integração com SSO', est='2h', prio='Alta', estado='vencida', orig='jira'),
  dict(cod='MUR-412', nome='Pricing engine refactor', est='3h', prio='Alta', estado='', orig='manual'),
  dict(cod='MUR-218', nome='Email de confirmação', est='45min', prio='Média', estado='bloqueada', orig='slack'),
  dict(cod='MUR-502', nome='QA · regressão release 4.2', est='1h30', prio='Baixa', estado='', orig='ai'),
]

# A espinha do dia é dimensionada para PREENCHER a tela, não para caber. Com a
# saudação em cima sobram cerca de 712px para o painel: dez horas a 68px dão
# 680, mais o padding. Antes eram nove horas a 56, e o painel morria no meio da
# tela com um vazio embaixo do tamanho do próprio calendário.
H0, H1, PXH = 8, 18, 68

def hhmm(v):
    return f'{int(v):02d}:{int(round((v%1)*60)):02d}'

# ── CARTÃO DE EVENTO — refeito ──────────────────────────────────────────
def cartao_evento(e, k, altura):
    cal = CALENDARIOS[e['cal']]
    # Três densidades, porque a altura do cartão é a duração e não uma escolha:
    #   < 46px  → uma linha: hora e título
    #   < 74px  → hora, fonte e título
    #   senão   → tudo, com conferência e participantes
    curto = altura < 46
    medio = 46 <= altura < 74
    # SEM BARRA NA ESQUERDA. Ela era uma borda com outro nome: um traço colado
    # na aresta, do tamanho do cartão, que é exatamente a marcação que a gente
    # tirou de todo o resto do sistema. A cor do calendário agora vem de um
    # PONTO na linha da hora — o mesmo ponto que o Badge e a lista de
    # calendários já usam — somado ao tingimento do fundo. Dois sinais suaves
    # no lugar de um traço duro.
    ponto = (f'<span style="display:inline-block;width:7px;height:7px;border-radius:999px;'
             f'background:{cal["cor"]};flex:0 0 auto;"></span>')
    fonte_tag = ('' if cal['fonte']=='muriki' else
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.8;">{cal["fonte"]}</span>')
    conf = (f'<span style="display:inline-flex;align-items:center;gap:4px;color:{k["mfg"]};'
      f'font-size:11px;"><span style="display:flex;width:12px;height:12px;">{I["cam"]}</span>{e["conf"]}</span>'
      ) if e.get('conf') else ''
    quem = (f'<span style="font-size:11px;color:{k["mfg"]};">{e["quem"]} pessoas</span>'
            if e['quem']>1 else '')
    if curto:
        corpo = (f'<div style="display:flex;align-items:center;gap:8px;min-width:0;height:100%;">'
          f'{ponto}'
          f'<span style="font-family:{MONO};font-size:10.5px;color:{k["mfg"]};flex:0 0 auto;">{hhmm(e["ini"])}</span>'
          f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};overflow:hidden;'
          f'text-overflow:ellipsis;white-space:nowrap;">{e["nome"]}</span>'
          f'<span style="margin-left:auto;flex:0 0 auto;">{fonte_tag}</span></div>')
    elif medio:
        corpo = (f'<div style="display:flex;flex-direction:column;gap:3px;min-width:0;">'
          f'<div style="display:flex;align-items:center;gap:7px;">{ponto}'
          f'<span style="font-family:{MONO};font-size:10.5px;color:{k["mfg"]};flex:0 0 auto;">'
          f'{hhmm(e["ini"])}–{hhmm(e["fim"])}</span>{fonte_tag}</div>'
          f'<div style="font-size:13.5px;font-weight:600;color:{k["fgs"]};line-height:1.25;'
          f'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{e["nome"]}</div></div>')
    else:
        corpo = (f'<div style="display:flex;flex-direction:column;gap:5px;min-width:0;">'
          f'<div style="display:flex;align-items:center;gap:7px;">{ponto}'
          f'<span style="font-family:{MONO};font-size:10.5px;color:{k["mfg"]};flex:0 0 auto;">'
          f'{hhmm(e["ini"])}–{hhmm(e["fim"])}</span>{fonte_tag}</div>'
          f'<div style="font-size:13.5px;font-weight:600;color:{k["fgs"]};line-height:1.25;'
          f'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{e["nome"]}</div>'
          f'<div style="display:flex;align-items:center;gap:12px;margin-top:1px;">{conf}{quem}</div></div>')
    fundo = mistura(cal['cor'], k['card'], 9)
    return (f'<div style="height:100%;border-radius:10px;background:{fundo};padding:8px 12px;'
      f'box-shadow:{k["sombra"]};overflow:hidden;">{corpo}</div>')

# ── CARTÃO DE TASK NO CALENDÁRIO — outra natureza, outro desenho ────────
def cartao_task_cal(t, k, altura):
    # A task não leva ponto de cor: ela não vem de calendário nenhum. O que a
    # distingue do evento é o círculo de concluir e a superfície afundada — o
    # traço tracejado da esquerda saiu junto com a barra do evento.
    return (f'<div style="height:100%;border-radius:10px;background:{k["muted"]};padding:8px 12px;'
      f'overflow:hidden;display:flex;flex-direction:column;gap:5px;">'
      f'<div style="display:flex;align-items:center;gap:7px;min-width:0;">'
      f'<span style="display:inline-block;width:13px;height:13px;border-radius:999px;flex:0 0 auto;'
      f'box-shadow:inset 0 0 0 1.4px {k["input"]};"></span>'
      f'<span style="font-family:{MONO};font-size:10.5px;color:{k["mfg"]};">{t["cod"]}</span>'
      f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};overflow:hidden;'
      f'text-overflow:ellipsis;white-space:nowrap;">{t["nome"]}</span></div>'
      f'<div style="display:flex;align-items:center;gap:6px;">{prio_chip(t["prio"],k)}{origem_task(t["orig"],k)}'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:10px;color:{k["mfg"]};">'
      f'{hhmm(t["ini"])}–{hhmm(t["fim"])}</span></div></div>')
