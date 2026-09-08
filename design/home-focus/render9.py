from render8 import *

def campo(rot, valor, k, largura='1', placeholder=False, mono=False):
    ff=f'font-family:{MONO};' if mono else ''
    cor = k['mfg'] if placeholder else k['fgs']
    return (f'<label style="flex:{largura};min-width:0;display:flex;flex-direction:column;gap:6px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.85;">{rot}</span>'
      f'<span style="display:flex;align-items:center;height:36px;padding:0 12px;border-radius:9px;'
      f'background:{k["card"]};color:{cor};font-size:13.5px;{ff}'
      f'box-shadow:inset 0 0 0 1px {mistura(k["input"], k["card"], 45)};">{valor}</span></label>')

def criar_evento(tema):
    k=T[tema]
    cal=CALENDARIOS[0]
    seletor_cal=(f'<label style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.85;">Calendário</span>'
      f'<span style="display:flex;align-items:center;gap:9px;height:36px;padding:0 12px;border-radius:9px;'
      f'background:{k["card"]};font-size:13.5px;color:{k["fgs"]};'
      f'box-shadow:inset 0 0 0 1px {mistura(k["input"], k["card"], 45)};">'
      f'<span style="display:inline-block;width:9px;height:9px;border-radius:999px;background:{cal["cor"]};"></span>'
      f'{cal["nome"]}'
      f'<span style="margin-left:auto;display:flex;width:14px;height:14px;color:{k["mfg"]};'
      f'transform:rotate(90deg);">{I["dir"]}</span></span></label>')
    conf=(f'<div style="display:flex;flex-direction:column;gap:8px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.85;">Conferência</span>'
      f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};width:fit-content;">'
      + ''.join(
        (f'<span style="height:26px;display:flex;align-items:center;gap:6px;padding:0 12px;border-radius:999px;'
         f'background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
         f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{n}</span>'
         if at else
         f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;border-radius:999px;'
         f'color:{k["mfg"]};font-size:12.5px;">{n}</span>')
        for n,at in (('Sem link',False),('Meet',True),('Teams',False),('Zoom',False)))
      + f'</div></div>')
    pessoas=(f'<div style="display:flex;flex-direction:column;gap:8px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.85;">Participantes</span>'
      f'<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">'
      + ''.join(f'<span style="display:inline-flex;align-items:center;gap:7px;height:28px;'
        f'padding:0 11px 0 3px;border-radius:999px;background:{k["muted"]};font-size:12.5px;color:{k["fg"]};">'
        f'<span style="width:22px;height:22px;border-radius:999px;background:{c};color:#fff;'
        f'display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;">{i}</span>{n}'
        f'<span style="color:{k["mfg"]};font-size:14px;margin-left:2px;">×</span></span>'
        for i,n,c in (('MR','Mariana','#348F4F'),('JC','Julia','#DE6F00')))
      + f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;'
      f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;'
      f'box-shadow:inset 0 0 0 1px {mistura(k["input"], k["bg"], 45)};">'
      f'<span style="display:flex;width:13px;height:13px;">{I["mais"]}</span>convidar</span></div></div>')
    tarefa=(f'<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;'
      f'background:{k["prisub"]};">'
      f'<span style="display:flex;width:15px;height:15px;color:{k["prisubfg"]};">{I["task"]}</span>'
      f'<span style="font-size:13px;color:{k["prisubfg"]};">Bloquear este horário como task no focus</span>'
      f'<span style="margin-left:auto;display:inline-block;width:34px;height:20px;border-radius:999px;'
      f'background:{k["pri"]};position:relative;flex:0 0 auto;">'
      f'<span style="position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:999px;'
      f'background:{k["card"]};box-shadow:0 1px 2px rgba(0,0,0,0.2);"></span></span></div>')
    return (f'<div style="height:720px;background:{k["bg"]};font-family:{FONTE};font-size:14px;'
      f'display:flex;align-items:center;justify-content:center;padding:26px;">'
      f'<div style="width:100%;max-width:640px;border-radius:12px;background:{k["rail"]};'
      f'box-shadow:{k["sombraFlut"]};overflow:hidden;display:flex;flex-direction:column;">'
      f'<div style="display:flex;align-items:center;gap:10px;padding:16px 20px;">'
      f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Novo evento</span>'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.75;">quinta, 11 de junho</span>'
      f'<span style="margin-left:auto;display:flex;width:24px;height:24px;align-items:center;'
      f'justify-content:center;color:{k["mfg"]};font-size:16px;">×</span></div>'
      f'<div style="padding:4px 20px 20px;display:flex;flex-direction:column;gap:18px;">'
      f'{campo("Título","Alinhamento do contrato",k)}'
      f'<div style="display:flex;gap:12px;">{campo("Início","11:00",k,"1",mono=True)}'
      f'{campo("Fim","12:00",k,"1",mono=True)}{seletor_cal}</div>'
      f'{conf}{pessoas}'
      f'{campo("Notas","O que precisa estar decidido ao fim da reunião",k,placeholder=True)}'
      f'{tarefa}</div>'
      f'<div style="margin-top:auto;padding:16px 20px;display:flex;align-items:center;gap:10px;">'
      f'<button style="height:36px;padding:0 18px;border:0;border-radius:9px;background:{k["pri"]};'
      f'color:{k["prifg"]};font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;'
      f'white-space:nowrap;">Criar evento</button>'
      f'<button style="height:36px;padding:0 14px;border:0;border-radius:9px;background:transparent;'
      f'color:{k["mfg"]};font-family:inherit;font-size:14px;cursor:pointer;">Cancelar</button>'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:9.5px;letter-spacing:0.12em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.7;">vai para o meu focus</span></div>'
      f'</div></div>')

open('CriarEvento.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=criar_evento('claro')))
print('CriarEvento.dc.html', len(open('CriarEvento.dc.html').read()))
# escuro: a tela do dia cheio
open('DiaEscuro.dc.html','w').write(CASCA.format(pri=T['escuro']['pri'], prisubfg=T['escuro']['prisubfg'], corpo=tela_dia_cheia('escuro')))
print('DiaEscuro.dc.html', len(open('DiaEscuro.dc.html').read()))
