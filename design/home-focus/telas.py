from pecas import *

# ── mini mês ────────────────────────────────────────────────────────────
def mini_mes(k):
    dias = ['S','T','Q','Q','S','S','D']
    cab = ''.join(f'<span style="font-family:{MONO};font-size:9.5px;color:{k["mfg"]};'
                  f'opacity:0.7;text-align:center;">{d}</span>' for d in dias)
    cels=''
    # junho de 2026 começa numa segunda
    marcados={3,5,9,11,12,16,18,24}
    for n in range(1,31):
        hoje = n==12
        tem = n in marcados
        est = (f'background:{k["pri"]};color:{k["prifg"]};font-weight:600;' if hoje
               else f'color:{k["fg"]};')
        pt = (f'<span style="position:absolute;left:50%;bottom:2px;transform:translateX(-50%);'
              f'width:3px;height:3px;border-radius:999px;background:'
              f'{k["prifg"] if hoje else k["pri"]};opacity:{0.9 if hoje else 0.55};"></span>') if tem else ''
        cels += (f'<span style="position:relative;height:26px;display:flex;align-items:center;'
                 f'justify-content:center;border-radius:7px;font-size:11.5px;{est}">{n}{pt}</span>')
    return (f'<div style="display:flex;flex-direction:column;gap:8px;">'
      f'<div style="display:flex;align-items:center;gap:6px;">'
      f'<span style="font-size:13px;font-weight:600;color:{k["fgs"]};">Junho 2026</span>'
      f'<span style="margin-left:auto;display:flex;gap:2px;align-items:center;">'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;'
      f'border-radius:6px;color:{k["mfg"]};"><span style="display:flex;width:14px;height:14px;">{I["esq"]}</span></span>'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;'
      f'border-radius:6px;color:{k["mfg"]};"><span style="display:flex;width:14px;height:14px;">{I["dir"]}</span></span>'
      f'<span style="width:1px;height:14px;background:{k["border"]};margin:0 3px;"></span>'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;'
      f'border-radius:6px;color:{k["mfg"]};"><span style="display:flex;width:14px;height:14px;">{I["roda"]}</span></span>'
      f'</span></div>'
      f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;">{cab}</div>'
      f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;">{cels}</div></div>')

def _lista_calendarios_antiga(k):
    linhas=''
    for c in CALENDARIOS:
        conta = (f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.08em;'
                 f'text-transform:uppercase;color:{k["mfg"]};opacity:0.7;">{c["fonte"]}</span>') if c['conta'] else ''
        linhas += (f'<div style="display:flex;align-items:center;gap:9px;height:30px;">'
          f'<span style="width:13px;height:13px;border-radius:4px;background:{c["cor"]};flex:0 0 auto;"></span>'
          f'<span style="font-size:12.5px;color:{k["fg"]};overflow:hidden;text-overflow:ellipsis;'
          f'white-space:nowrap;">{c["nome"]}</span>'
          f'<span style="margin-left:auto;flex:0 0 auto;">{conta}</span></div>')
    return (f'<div style="display:flex;flex-direction:column;gap:6px;">'
      f'<div style="display:flex;align-items:baseline;">{rotulo("Calendários", k["mfg"])}'
      f'<span style="margin-left:auto;display:flex;width:14px;height:14px;color:{k["mfg"]};">{I["mais"]}</span></div>'
      f'{linhas}</div>')

# ── espinha do dia ──────────────────────────────────────────────────────
def espinha(k):
    alt=(H1-H0)*PXH
    horas=''.join(
      f'<div style="position:absolute;top:{(h-H0)*PXH}px;left:0;right:0;height:{PXH}px;">'
      f'<span style="position:absolute;left:0;top:-6px;font-family:{MONO};font-size:10px;'
      f'color:{k["mfg"]};opacity:0.6;">{h:02d}:00</span>'
      f'<span style="position:absolute;left:46px;right:0;top:0;height:1px;background:{k["border"]};'
      f'-webkit-mask-image:linear-gradient(to right,transparent,#000 2%,#000 98%,transparent);'
      f'mask-image:linear-gradient(to right,transparent,#000 2%,#000 98%,transparent);"></span></div>'
      for h in range(H0,H1))
    bl=''
    for e in EVENTOS:
        top=(e['ini']-H0)*PXH; a=(e['fim']-e['ini'])*PXH-4
        bl += f'<div style="position:absolute;left:46px;right:0;top:{top}px;height:{a}px;">{cartao_evento(e,k,a)}</div>'
    for t in ENCAIXADAS:
        top=(t['ini']-H0)*PXH; a=(t['fim']-t['ini'])*PXH-4
        bl += f'<div style="position:absolute;left:46px;right:0;top:{top}px;height:{a}px;">{cartao_task_cal(t,k,a)}</div>'
    agora=(10.6-H0)*PXH
    bl += (f'<div style="position:absolute;left:36px;right:0;top:{agora}px;height:0;z-index:2;">'
      f'<span style="position:absolute;left:0;top:-3px;width:6px;height:6px;border-radius:999px;background:{k["bad"]};"></span>'
      f'<span style="position:absolute;left:10px;right:0;top:0;height:1px;background:{k["bad"]};opacity:0.5;"></span></div>')
    return f'<div style="position:relative;height:{alt}px;">{horas}{bl}</div>'

def seletor_escala(k):
    op=[('Mês',0),('Semana',0),('Dia',1)]
    itens=''
    for nome,at in op:
        if at:
            itens += (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{nome}</span>')
        else:
            itens += (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">{nome}</span>')
    return (f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">{itens}</div>')


# 5 · a engrenagem no lugar da lista. O que era uma lista sempre aberta vira
# um gesto: a maioria dos dias ninguém mexe em qual calendário aparece.
def engrenagem(k):
    return (f'<span style="display:flex;width:24px;height:24px;align-items:center;justify-content:center;'
      f'border-radius:7px;color:{k["mfg"]};"><span style="display:flex;width:15px;height:15px;">{I["roda"]}</span></span>')
