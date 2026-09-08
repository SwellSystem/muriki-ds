from render6 import *

DIA_EVENTOS=[
  dict(ini=9.0,  fim=9.5,  nome='Daily do time', cal=0, quem=6, conf='Meet'),
  dict(ini=11.0, fim=12.0, nome='Revisão do contrato · OpenAPI', cal=2, quem=3, conf='Teams'),
  dict(ini=13.0, fim=13.75, nome='Almoço com Julia', cal=1, quem=1, conf=''),
  dict(ini=15.0, fim=16.5, nome='1:1 com Mariana', cal=1, quem=1, conf='Meet'),
]
DH0,DH1,DPX=8,18,64

def espinha_cheia(k):
    alt=(DH1-DH0)*DPX
    linhas=''.join(
      f'<div style="position:absolute;top:{(h-DH0)*DPX}px;left:0;right:0;">'
      f'<span style="position:absolute;left:0;top:-7px;font-family:{MONO};font-size:10.5px;'
      f'color:{k["mfg"]};opacity:0.65;">{h:02d}:00</span>'
      f'<span style="position:absolute;left:52px;right:0;top:0;height:1px;background:{k["muted"]};"></span>'
      f'</div>' for h in range(DH0,DH1))
    meias=''.join(
      f'<span style="position:absolute;left:52px;right:0;top:{(h-DH0)*DPX+DPX/2}px;height:1px;'
      f'background:{k["muted"]};opacity:0.45;"></span>' for h in range(DH0,DH1))
    bl=''
    for e in DIA_EVENTOS:
        top=(e['ini']-DH0)*DPX; a=(e['fim']-e['ini'])*DPX-5
        bl += (f'<div style="position:absolute;left:52px;width:62%;top:{top}px;height:{a}px;">'
               f'{cartao_evento(e,k,a)}</div>')
    for t in ENCAIXADAS:
        top=(t['ini']-DH0)*DPX; a=(t['fim']-t['ini'])*DPX-5
        bl += (f'<div style="position:absolute;left:52px;width:62%;top:{top}px;height:{a}px;">'
               f'{cartao_task_cal(t,k,a)}</div>')
    agora=(10.6-DH0)*DPX
    bl += (f'<div style="position:absolute;left:42px;right:0;top:{agora}px;height:0;z-index:2;">'
      f'<span style="position:absolute;left:0;top:-4px;width:8px;height:8px;border-radius:999px;'
      f'background:{k["bad"]};"></span>'
      f'<span style="position:absolute;left:12px;right:0;top:0;height:1px;background:{k["bad"]};opacity:0.45;"></span>'
      f'<span style="position:absolute;right:0;top:-15px;font-family:{MONO};font-size:9.5px;'
      f'letter-spacing:0.12em;text-transform:uppercase;color:{k["bad"]};">agora</span></div>')
    return f'<div style="position:relative;height:{alt}px;">{linhas}{meias}{bl}</div>'

def barra_dia(k):
    def esc(nome,at):
        if at:
            return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{nome}</span>')
        return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
          f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">{nome}</span>')
    seletor=(f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{esc("Mês",False)}{esc("Semana",False)}{esc("Dia",True)}</div>')
    leitura=(f'<span style="display:inline-flex;align-items:center;gap:10px;">'
      f'<span style="font-size:12.5px;color:{k["mfg"]};">'
      f'<strong style="color:{k["bad"]};font-weight:600;">2 vencidas</strong> · '
      f'<strong style="color:{k["warn"]};font-weight:600;">6h20</strong> de task para 4h20 livres</span>'
      f'<span style="position:relative;width:120px;height:5px;border-radius:999px;background:{k["sunken"]};">'
      f'<span style="position:absolute;left:0;top:0;bottom:0;width:68%;border-radius:999px;background:{k["pri"]};"></span>'
      f'<span style="position:absolute;left:68%;top:0;bottom:0;width:32%;border-radius:0 999px 999px 0;'
      f'background:repeating-linear-gradient(45deg,{k["warn"]},{k["warn"]} 2px,transparent 2px,transparent 5px);"></span>'
      f'</span></span>')
    return (f'<div style="display:flex;align-items:center;gap:14px;padding:14px 22px;'
      f'background:{k["card"]};flex:0 0 auto;">'
      f'<span style="font-size:17px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">Quinta, 11 de junho</span>'
      f'<span style="display:flex;gap:2px;color:{k["mfg"]};">'
      f'<span style="display:flex;width:24px;height:24px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["esq"]}</span></span>'
      f'<span style="display:flex;width:24px;height:24px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["dir"]}</span></span></span>'
      f'<span style="margin-left:24px;">{leitura}</span>'
      f'<span style="margin-left:auto;display:flex;align-items:center;gap:10px;">{seletor}'
      f'<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;'
      f'border-radius:8px;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};">'
      f'<span style="display:flex;width:15px;height:15px;">{I["roda"]}</span></span>'
      f'<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;'
      f'border-radius:8px;background:{k["prisub"]};color:{k["prisubfg"]};">'
      f'<span style="display:flex;width:15px;height:15px;">{I["expandir"]}</span></span></span></div>')

def tela_dia_cheia(tema):
    k=T[tema]
    return (f'<div style="position:relative;display:flex;height:820px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail_var(k,"rotulos")}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["bg"]};overflow:hidden;">'
      f'{barra_dia(k)}<div style="flex:1;padding:20px 24px;overflow:hidden;">{espinha_cheia(k)}</div>'
      f'</div>{fab(k)}</div>')

open('CheioDia.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=tela_dia_cheia('claro')))
print('CheioDia.dc.html', len(open('CheioDia.dc.html').read()))
