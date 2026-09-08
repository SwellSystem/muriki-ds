from render3 import *

# ── 3 · o calendário em mês, ocupando a tela ────────────────────────────
DIA_EV = {
  3:[('Retro do time','#1B50C0')], 5:[('Planning','#1B50C0'),('Dentista','#348F4F')],
  9:[('Daily','#1B50C0')], 11:[('Revisão de contrato','#DE6F00')],
  12:[('Daily','#1B50C0'),('Revisão do contrato','#DE6F00'),('1:1 com Mariana','#348F4F')],
  16:[('Sprint review','#1B50C0')],
  18:[('Onboarding · SSO','#DE6F00'),('Almoço com Julia','#348F4F'),('Revisão de design','#1B50C0'),('Retro','#1B50C0'),('Fechamento do mês','#DE6F00')],
  24:[('Planning','#1B50C0')], 26:[('Fechamento','#DE6F00')],
}
DIA_TASK = {3:1, 9:2, 12:2, 17:1, 18:3, 20:1, 25:2}

def celula_mes(n, k, alt=104, teto=3):
    hoje = n==12
    evs=''.join(
      f'<div style="display:flex;align-items:center;gap:6px;min-width:0;height:19px;'
      f'padding:0 7px;border-radius:5px;background:{k["card"]};">'
      f'<span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:{c};flex:0 0 auto;"></span>'
      f'<span style="font-size:11px;color:{k["fg"]};overflow:hidden;text-overflow:ellipsis;'
      f'white-space:nowrap;">{t}</span></div>' for t,c in DIA_EV.get(n,[])[:teto])
    sobra = max(0, len(DIA_EV.get(n,[])) - teto)
    mais = (f'<div style="display:flex;align-items:center;height:18px;padding:0 7px;'
      f'font-size:10.5px;color:{k["mfg"]};">+{sobra} evento{"s" if sobra>1 else ""}</div>') if sobra else ''
    tk = DIA_TASK.get(n)
    tchip=(f'<div style="display:flex;align-items:center;gap:5px;height:18px;padding:0 6px;'
      f'border-radius:5px;background:{k["muted"]};">'
      f'<span style="width:9px;height:9px;border-radius:999px;box-shadow:inset 0 0 0 1.2px {k["input"]};"></span>'
      f'<span style="font-size:10.5px;color:{k["mfg"]};">{tk} task{"s" if tk>1 else ""}</span></div>') if tk else ''
    num=(f'<span style="width:22px;height:22px;border-radius:999px;display:flex;align-items:center;'
      f'justify-content:center;font-size:12px;'
      + (f'background:{k["pri"]};color:{k["prifg"]};font-weight:600;' if hoje else f'color:{k["fg"]};')
      + f'">{n}</span>')
    return (f'<div style="min-height:{alt}px;display:flex;flex-direction:column;gap:4px;padding:7px;'
      f'border-radius:10px;background:{k["bg"] if not hoje else k["prisub"]};">'
      f'{num}{evs}{mais}{tchip}</div>')

def tela_mes(tema):
    k=T[tema]
    dias=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
    cab=''.join(f'<span style="font-family:{MONO};font-size:10px;letter-spacing:0.16em;'
      f'text-transform:uppercase;color:{k["mfg"]};opacity:0.75;padding:0 8px;">{d}</span>' for d in dias)
    cels=''.join(celula_mes(n,k,alt=118,teto=4) for n in range(1,31))
    def esc(nome,at):
        if at:
            return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{nome}</span>')
        return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
          f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">{nome}</span>')
    seletor=(f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{esc("Mês",True)}{esc("Semana",False)}{esc("Dia",False)}</div>')
    return (f'<div style="position:relative;display:flex;height:940px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail(k,"Hoje")}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px;padding:26px 30px;overflow:hidden;">'
      f'<div style="display:flex;align-items:center;gap:14px;">'
      f'<h1 style="margin:0;font-size:26px;font-weight:600;letter-spacing:-0.025em;color:{k["fgs"]};">Junho 2026</h1>'
      f'<span style="display:flex;gap:2px;color:{k["mfg"]};">'
      f'<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:15px;height:15px;">{I["esq"]}</span></span>'
      f'<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:15px;height:15px;">{I["dir"]}</span></span></span>'
      f'<span style="height:28px;display:flex;align-items:center;padding:0 12px;border-radius:8px;'
      f'font-size:12.5px;color:{k["fg"]};box-shadow:inset 0 0 0 1px {k["input"]};">Hoje</span>'
      f'<span style="margin-left:auto;display:flex;align-items:center;gap:10px;">{seletor}'
      f'<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;'
      f'border-radius:8px;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};">'
      f'<span style="display:flex;width:15px;height:15px;">{I["roda"]}</span></span></span></div>'
      f'<div style="flex:1;display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:14px;'
      f'background:{k["card"]};box-shadow:{k["sombra"]};">'
      f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;">{cab}</div>'
      f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;">{cels}</div></div>'
      f'</div>{fab(k)}</div>')

open('Mes.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=tela_mes('claro')))
print('Mes.dc.html', len(open('Mes.dc.html').read()))
