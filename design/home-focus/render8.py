from render7 import *

# ── painel de quick notes ───────────────────────────────────────────────
NOTAS=[
  dict(txt='Perguntar pra Julia se o diff do contrato já subiu. Ela falou que ia\nmandar antes da revisão.', quando='há 12 min', virou=None),
  dict(txt='Ideia: o banner de capacidade podia aparecer também na semana, não só no dia.', quando='hoje, 09:40', virou='MUR-511'),
  dict(txt='Cancelar a sala de reunião de sexta — a 1:1 mudou pra remoto.', quando='ontem', virou=None),
]
def painel_notas(tema):
    k=T[tema]
    def nota(n):
        rodape=(f'<span style="display:inline-flex;align-items:center;gap:6px;font-family:{MONO};'
          f'font-size:10px;color:{k["mfg"]};">{n["quando"]}</span>')
        virou=(chip(f'virou {n["virou"]}', k['prisub'], k['prisubfg']) if n['virou'] else
          f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;'
          f'border-radius:4px;color:{k["mfg"]};font-size:11.5px;">'
          f'<span style="display:flex;width:12px;height:12px;">{I["task"]}</span>virar task</span>')
        return (f'<div style="display:flex;flex-direction:column;gap:9px;padding:13px 14px;'
          f'border-radius:12px;background:{k["card"]};box-shadow:{k["sombra"]};">'
          f'<p style="margin:0;font-size:13.5px;line-height:1.5;color:{k["fg"]};'
          f'white-space:pre-line;">{n["txt"]}</p>'
          f'<div style="display:flex;align-items:center;gap:8px;">{rodape}'
          f'<span style="margin-left:auto;">{virou}</span></div></div>')
    lista=''.join(nota(n) for n in NOTAS)
    compositor=(f'<div style="display:flex;flex-direction:column;gap:10px;padding:14px;'
      f'border-radius:12px;background:{k["card"]};box-shadow:{k["sombraFlut"]};">'
      f'<span style="font-size:13.5px;color:{k["mfg"]};opacity:0.75;">Escreva sem sair do dia…</span>'
      f'<div style="display:flex;align-items:center;gap:8px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.7;">⌘ + ↵ salva</span>'
      f'<button style="margin-left:auto;height:32px;padding:0 14px;border:0;border-radius:8px;'
      f'background:{k["pri"]};color:{k["prifg"]};font-family:inherit;font-size:13px;font-weight:500;'
      f'cursor:pointer;">Salvar nota</button></div></div>')
    return (f'<div style="position:relative;height:760px;background:{k["bg"]};font-family:{FONTE};'
      f'font-size:14px;overflow:hidden;display:flex;justify-content:flex-end;">'
      f'<span style="position:absolute;inset:0;background:rgba(28,37,46,0.10);"></span>'
      f'<div style="position:relative;width:400px;height:100%;background:{k["rail"]};'
      f'box-shadow:{k["sombraFlut"]};display:flex;flex-direction:column;">'
      f'<div style="display:flex;align-items:center;gap:10px;padding:18px 18px 14px;">'
      f'<span style="display:flex;width:17px;height:17px;color:{k["mfg"]};">{I["nota"]}</span>'
      f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Quick notes</span>'
      f'<span style="margin-left:auto;display:flex;width:24px;height:24px;align-items:center;'
      f'justify-content:center;color:{k["mfg"]};font-size:16px;">×</span></div>'
      f'<div style="padding:0 18px 14px;">{compositor}</div>'
      f'<div style="flex:1;display:flex;flex-direction:column;gap:10px;padding:4px 18px 18px;'
      f'overflow:hidden;">'
      f'<div style="display:flex;align-items:baseline;padding:0 2px;">{rotulo("Recentes",k["mfg"])}'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:10px;color:{k["mfg"]};'
      f'opacity:0.6;">3</span></div>{lista}</div></div></div>')

open('QuickNotes.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=painel_notas('claro')))
print('QuickNotes.dc.html', len(open('QuickNotes.dc.html').read()))
