from render2 import *

def linha_meta(rot, val, k):
    return (f'<div style="display:flex;align-items:baseline;gap:14px;">'
      f'<span style="width:96px;flex:0 0 auto;font-family:{MONO};font-size:10px;letter-spacing:0.16em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.85;">{rot}</span>'
      f'<span style="min-width:0;font-size:13.5px;color:{k["fg"]};line-height:1.5;">{val}</span></div>')

def modal_evento(tema):
    k=T[tema]
    cal=CALENDARIOS[2]
    pessoas=''.join(
      f'<span style="display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 10px 0 3px;'
      f'border-radius:999px;background:{k["muted"]};font-size:12px;color:{k["fg"]};">'
      f'<span style="width:20px;height:20px;border-radius:999px;background:{c};color:#fff;'
      f'display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;">{i}</span>{n}</span>'
      for i,n,c in (('MR','Mariana','#348F4F'),('JC','Julia','#DE6F00'),('GT','Você','#1B50C0')))
    acoes=(f'<div style="display:flex;flex-direction:column;gap:12px;">'
      f'<div style="display:flex;align-items:center;gap:10px;">'
      f'<button style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border:0;'
      f'border-radius:9px;background:{k["pri"]};color:{k["prifg"]};font-family:inherit;font-size:14px;'
      f'font-weight:500;cursor:pointer;white-space:nowrap;">'
      f'<span style="display:flex;width:16px;height:16px;">{I["cam"]}</span>Entrar no Teams</button>'
      f'<button style="height:36px;padding:0 14px;border:0;border-radius:9px;background:transparent;'
      f'color:{k["fg"]};font-family:inherit;font-size:14px;cursor:pointer;'
      f'box-shadow:inset 0 0 0 1px {k["input"]};white-space:nowrap;">Editar</button>'
      f'<button style="height:36px;padding:0 14px;border:0;border-radius:9px;background:transparent;'
      f'color:{k["mfg"]};font-family:inherit;font-size:14px;cursor:pointer;white-space:nowrap;">Abrir no Outlook</button>'
      f'</div>'
      f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.14em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.7;">somente leitura · o evento vem do outlook</span></div>')
    return (f'<div style="height:640px;background:{k["bg"]};font-family:{FONTE};font-size:14px;'
      f'display:flex;align-items:center;justify-content:center;padding:28px;">'
      f'<div style="width:100%;max-width:660px;border-radius:{"12px"};background:{k["card"]};'
      f'box-shadow:{k["sombraFlut"]}, inset 0 0 0 1px {k["input"]};overflow:hidden;">'
      # cabeçalho
      f'<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;'
      f'box-shadow:inset 0 -1px 0 {k["border"]};">'
      f'<span style="width:11px;height:11px;border-radius:4px;background:{cal["cor"]};"></span>'
      f'<span style="font-size:12.5px;color:{k["fg"]};">{cal["nome"]}</span>'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.8;">{cal["fonte"]}</span>'
      f'<span style="margin-left:auto;display:flex;width:24px;height:24px;align-items:center;'
      f'justify-content:center;color:{k["mfg"]};font-size:16px;">×</span></div>'
      # corpo
      f'<div style="padding:22px 20px;display:flex;flex-direction:column;gap:20px;">'
      f'<div style="display:flex;flex-direction:column;gap:7px;">'
      f'<h2 style="margin:0;font-size:24px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;'
      f'color:{k["fgs"]};">Revisão do contrato · OpenAPI</h2>'
      f'<div style="display:flex;align-items:center;gap:10px;">'
      f'<span style="font-size:14px;color:{k["fg"]};">Quinta, 12 de junho · 11:00–12:00</span>'
      f'{chip("Teams",k["tblue"],k["tbluefg"],svg=I["cam"])}</div></div>'
      f'<span style="height:1px;background:{k["border"]};'
      f'-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);'
      f'mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);"></span>'
      f'<div style="display:flex;flex-direction:column;gap:14px;">'
      f'{linha_meta("Participantes", f'<span style="display:flex;gap:6px;flex-wrap:wrap;">{pessoas}</span>', k)}'
      f'{linha_meta("Task ligada", f'<span style="display:inline-flex;align-items:center;gap:8px;">'
        f'<span style="font-family:{MONO};font-size:11px;color:{k["mfg"]};">MUR-216</span>'
        f'Implementar validação de email {origem_task("jira",k)}</span>', k)}'
      f'{linha_meta("Notas", "Fechar os nomes dos campos antes de gerar o client. Julia traz o diff da última versão.", k)}'
      f'</div>'
      f'<span style="height:1px;background:{k["border"]};'
      f'-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);'
      f'mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);"></span>'
      f'{acoes}</div></div></div>')

open('Evento.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=modal_evento('claro')))
print('Evento.dc.html', len(open('Evento.dc.html').read()))
