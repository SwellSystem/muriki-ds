from render4 import *

GRUPOS=[
 ('Muriki', 'muriki', [('Meu focus','#1B50C0',True),('Tasks agendadas','#6D9CF8',True)]),
 ('guilherme@gmail.com', 'google', [('Pessoal','#348F4F',True),('Aniversários','#62BB78',False),('Feriados Brasil','#9F9E9A',True)]),
 ('g.santos@swellsystem.com', 'outlook', [('Calendário','#DE6F00',True),('Sala · Reuniões','#F2943C',False)]),
]

def linha_cal(nome,cor,on,k):
    # `display:inline-block` não é enfeite: o trilho está dentro de um span que
    # NÃO é flex, então sem isso ele fica inline, com altura zero, e o fundo
    # não pinta — só o botão, posicionado por absolute, aparecia.
    marca=(f'<span style="display:inline-block;width:34px;height:20px;border-radius:999px;'
      f'flex:0 0 auto;position:relative;'
      f'background:{k["pri"] if on else k["sunken"]};'
      + ('' if on else f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.07), inset 0 0 0 1px {k["border"]};') + '">'
      f'<span style="position:absolute;top:2px;{"right:2px" if on else "left:2px"};width:16px;height:16px;'
      f'border-radius:999px;background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span></span>')
    return (f'<div style="display:flex;align-items:center;gap:11px;height:42px;padding:0 4px;">'
      f'<span style="width:13px;height:13px;border-radius:4px;background:{cor};flex:0 0 auto;'
      + ('' if on else 'opacity:0.4;') + '"></span>'
      f'<span style="font-size:13.5px;color:{k["fg"] if on else k["mfg"]};min-width:0;overflow:hidden;'
      f'text-overflow:ellipsis;white-space:nowrap;">{nome}</span>'
      f'<span style="margin-left:auto;flex:0 0 auto;">{marca}</span></div>')

def sheet_calendarios(tema):
    k=T[tema]
    grupos=''
    for titulo, fonte, cals in GRUPOS:
        linhas=''.join(linha_cal(n,c,o,k) for n,c,o in cals)
        grupos += (f'<div style="display:flex;flex-direction:column;gap:2px;">'
          f'<div style="display:flex;align-items:baseline;gap:10px;height:34px;padding:0 4px;">'
          f'<span style="font-size:12.5px;font-weight:600;color:{k["fgs"]};overflow:hidden;'
          f'text-overflow:ellipsis;white-space:nowrap;">{titulo}</span>'
          f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;'
          f'color:{k["mfg"]};opacity:0.8;flex:0 0 auto;">{fonte}</span>'
          f'<span style="margin-left:auto;font-size:12px;color:{k["mfg"]};flex:0 0 auto;">'
          f'{sum(1 for _,_,o in cals if o)} de {len(cals)}</span></div>'
          f'<span style="height:1px;background:{k["border"]};'
          f'-webkit-mask-image:linear-gradient(to right,transparent,#000 4%,#000 96%,transparent);'
          f'mask-image:linear-gradient(to right,transparent,#000 4%,#000 96%,transparent);"></span>'
          f'{linhas}</div>')
    return (f'<div style="position:relative;height:760px;background:{k["bg"]};font-family:{FONTE};'
      f'font-size:14px;overflow:hidden;display:flex;justify-content:flex-end;">'
      f'<span style="position:absolute;inset:0;background:rgba(28,37,46,0.14);"></span>'
      f'<div style="position:relative;width:420px;height:100%;background:{k["card"]};'
      f'box-shadow:{k["sombraFlut"]};display:flex;flex-direction:column;">'
      f'<div style="display:flex;align-items:center;gap:10px;padding:18px 20px;'
      f'box-shadow:inset 0 -1px 0 {k["border"]};">'
      f'<span style="display:flex;width:16px;height:16px;color:{k["mfg"]};">{I["roda"]}</span>'
      f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Calendários</span>'
      f'<span style="margin-left:auto;display:flex;width:24px;height:24px;align-items:center;'
      f'justify-content:center;color:{k["mfg"]};font-size:16px;">×</span></div>'
      f'<div style="flex:1;display:flex;flex-direction:column;gap:22px;padding:18px 20px;overflow:hidden;">'
      f'<p style="margin:0;font-size:13px;line-height:1.55;color:{k["mfg"]};">'
      f'O que estiver ligado aparece no dia e no mês. A cor aqui é a cor do filete no cartão do evento.</p>'
      f'{grupos}</div>'
      f'<div style="padding:16px 20px;display:flex;align-items:center;gap:10px;'
      f'box-shadow:inset 0 1px 0 {k["border"]};">'
      f'<button style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border:0;'
      f'border-radius:9px;background:{k["prisub"]};color:{k["prisubfg"]};font-family:inherit;font-size:13px;'
      f'font-weight:500;cursor:pointer;">'
      f'<span style="display:flex;width:15px;height:15px;">{I["mais"]}</span>Conectar uma conta</button>'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:9.5px;letter-spacing:0.12em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.75;">google · outlook</span></div>'
      f'</div></div>')

open('Calendarios.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=sheet_calendarios('claro')))
print('Calendarios.dc.html', len(open('Calendarios.dc.html').read()))
