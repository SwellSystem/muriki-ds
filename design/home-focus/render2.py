from render import *

COLUNAS=[
 ('A fazer', '#DCDBD4', [
   dict(cod='MUR-219', nome='Integração com SSO (Google, Apple)', prio='Alta', orig='jira', prazo='25 Abr', venc=True, quem='AL'),
   dict(cod='MUR-412', nome='Pricing engine refactor', prio='Alta', orig='manual', prazo='13 Mai', venc=False, quem='JC'),
   dict(cod='MUR-502', nome='QA · regressão release 4.2', prio='Baixa', orig='ai', prazo='21 Mai', venc=False, quem='MR')]),
 ('Em progresso', '#1B50C0', [
   dict(cod='MUR-216', nome='Implementar validação de email', prio='Alta', orig='jira', prazo='18 Abr', venc=False, quem='JC'),
   dict(cod='MUR-301', nome='Revisar copy da tela de pricing', prio='Média', orig='docs', prazo='30 Abr', venc=False, quem='MR')]),
 ('Bloqueada', '#DE6F00', [
   dict(cod='MUR-218', nome='Email de confirmação (template + envio)', prio='Média', orig='slack', prazo='17 Abr', venc=True, quem='JC')]),
 ('Concluída', '#348F4F', [
   dict(cod='MUR-215', nome='Wireframes da tela de signup', prio='Baixa', orig='manual', prazo='10 Abr', venc=False, quem='MR')]),
]

AVA={'AL':'#1B50C0','JC':'#DE6F00','MR':'#348F4F'}

def card_kanban(t,k):
    venc=(chip(t['prazo'],k['tred'],k['tredfg'],k['reddot']) if t['venc']
          else f'<span style="font-family:{MONO};font-size:10.5px;color:{k["mfg"]};">{t["prazo"]}</span>')
    return (f'<div style="display:flex;flex-direction:column;gap:9px;padding:12px;border-radius:12px;'
      f'background:{k["card"]};box-shadow:{k["sombra"]}, inset 0 0 0 1px {k["border"]};">'
      f'<div style="display:flex;align-items:center;gap:8px;">'
      f'<span style="width:13px;height:13px;border-radius:999px;flex:0 0 auto;'
      f'box-shadow:inset 0 0 0 1.4px {k["input"]};"></span>'
      f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};">{t["cod"]}</span>'
      f'<span style="margin-left:auto;width:20px;height:20px;border-radius:999px;flex:0 0 auto;'
      f'background:{AVA[t["quem"]]};color:#fff;display:flex;align-items:center;justify-content:center;'
      f'font-size:9px;font-weight:600;">{t["quem"]}</span></div>'
      f'<div style="font-size:13.5px;font-weight:500;line-height:1.35;color:{k["fgs"]};">{t["nome"]}</div>'
      f'<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
      f'{prio_chip(t["prio"],k)}{origem_task(t["orig"],k)}'
      f'<span style="margin-left:auto;">{venc}</span></div></div>')

def coluna_kanban(nome,cor,ts,k):
    cards=''.join(card_kanban(t,k) for t in ts)
    return (f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;">'
      f'<div style="display:flex;align-items:center;gap:8px;padding:0 2px;">'
      f'<span style="width:8px;height:8px;border-radius:999px;background:{cor};"></span>'
      f'{rotulo(nome,k["fg"],"10.5px")}'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:10px;color:{k["mfg"]};'
      f'opacity:0.7;">{len(ts):02d}</span>'
      f'<span style="display:flex;width:14px;height:14px;color:{k["mfg"]};">{I["mais"]}</span></div>'
      f'<span style="height:1px;background:{cor};opacity:0.35;"></span>'
      f'<div style="display:flex;flex-direction:column;gap:10px;">{cards}</div></div>')

def tela_kanban(tema):
    k=T[tema]
    cols=''.join(coluna_kanban(n,c,ts,k) for n,c,ts in COLUNAS)
    filtros=(f'<div style="display:flex;align-items:center;gap:10px;">'
      f'{chip("Todas as tasks",k["prisub"],k["prisubfg"])}'
      f'<span style="font-size:12.5px;color:{k["mfg"]};">Agrupar por <strong '
      f'style="color:{k["fgs"]};font-weight:600;">status</strong></span>'
      f'<span style="font-size:12.5px;color:{k["mfg"]};">Origem <strong '
      f'style="color:{k["fgs"]};font-weight:600;">qualquer</strong></span></div>')
    return (f'<div style="position:relative;display:flex;height:1000px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail(k,"Hoje")}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:18px;padding:26px 30px;overflow:hidden;">'
      f'{topo(k,"kanban")}{banner(k)}{filtros}'
      f'<div style="display:flex;gap:18px;align-items:flex-start;">{cols}</div></div>{fab(k)}</div>')

open('Kanban.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=tela_kanban('claro')))
print('Kanban.dc.html', len(open('Kanban.dc.html').read()))
