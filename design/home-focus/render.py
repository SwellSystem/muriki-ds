from montar import *

def cartao_fila(t,k):
    marca=''
    if t['estado']=='vencida': marca=chip('vencida',k['tred'],k['tredfg'],k['reddot'])
    elif t['estado']=='bloqueada': marca=chip('bloqueada',k['tyellow'],k['tyellowfg'])
    return (f'<div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;'
      f'background:{k["card"]};box-shadow:{k["sombra"]};">'
      f'<div style="display:flex;align-items:baseline;gap:8px;">'
      f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};">{t["cod"]}</span>'
      f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};line-height:1.35;">{t["nome"]}</span></div>'
      f'<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
      f'{prio_chip(t["prio"],k)}{marca}{origem_task(t["orig"],k)}'
      f'<span style="display:inline-flex;align-items:center;gap:4px;margin-left:auto;'
      f'font-family:{MONO};font-size:10.5px;color:{k["mfg"]};">'
      f'<span style="display:flex;width:12px;height:12px;">{I["rel"]}</span>{t["est"]}</span></div></div>')

def coluna_esq(k):
    # 4 · O mês e as tasks moram na mesma coluna, nessa ordem: primeiro QUANDO,
    # depois O QUE. As tasks embaixo do mês é onde o olho já está.
    cards=''.join(cartao_fila(t,k) for t in FILA)
    # 1 · O "nova task" cola no fim da lista. Empurrado para o pé da coluna ele
    # ficava a meia tela do último cartão — longe da coisa que ele cria.
    # Desenhado como a linha de adicionar que aparece no hover da lista.
    add=(f'<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 12px;'
      f'border-radius:10px;color:{k["mfg"]};font-size:13px;'
      f'box-shadow:inset 0 0 0 1px {k["input"]};background:{k["card"]};">'
      f'<span style="display:flex;width:15px;height:15px;">{I["mais"]}</span>Nova task'
      f'<span style="margin-left:auto;font-family:{MONO};font-size:9.5px;letter-spacing:0.12em;'
      f'text-transform:uppercase;opacity:0.7;">no hover</span></div>')
    return (f'<div style="width:300px;flex:0 0 300px;display:flex;flex-direction:column;gap:16px;">'
      f'<div style="padding:16px;border-radius:14px;background:{k["card"]};'
      f'box-shadow:{k["sombra"]};">{mini_mes(k)}</div>'
      f'<div style="display:flex;flex-direction:column;gap:10px;">'
      f'<div style="display:flex;align-items:baseline;gap:10px;padding:0 2px;">'
      f'{rotulo("Para encaixar",k["mfg"])}'
      f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};opacity:0.6;margin-left:auto;">4</span></div>'
      f'{cards}{add}</div></div>')

def coluna_dir(k):
    cards=''.join(cartao_fila(t,k) for t in FILA)
    return (f'<div style="width:288px;flex:0 0 288px;align-self:stretch;display:flex;'
      f'flex-direction:column;gap:12px;">'
      f'<div style="display:flex;align-items:baseline;gap:10px;">{rotulo("Para encaixar",k["mfg"])}'
      f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};opacity:0.6;margin-left:auto;">4</span></div>'
      f'<div style="display:flex;flex-direction:column;gap:10px;">{cards}</div>'
      f'<div style="flex:1;min-height:12px;"></div>'
      f'<button style="display:flex;align-items:center;justify-content:center;gap:8px;height:36px;'
      f'border:0;border-radius:9px;background:{k["prisub"]};color:{k["prisubfg"]};font-family:inherit;'
      f'font-size:13px;font-weight:500;cursor:pointer;">'
      f'<span style="display:flex;width:16px;height:16px;">{I["mais"]}</span>Nova task</button></div>')

def centro(k):
    return (f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;">'
      f'<div style="display:flex;align-items:center;gap:12px;">'
      f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">Quinta, 12</span>'
      f'<span style="display:flex;gap:2px;color:{k["mfg"]};">'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["esq"]}</span></span>'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["dir"]}</span></span></span>'
      f'<span style="margin-left:auto;display:flex;align-items:center;gap:10px;">{seletor_escala(k)}'
      f'<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;'
      f'border-radius:8px;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {k["input"]};">'
      f'<span style="display:flex;width:14px;height:14px;">{I["expandir"]}</span></span></span></div>'
      f'<div style="padding:16px 18px;border-radius:14px;background:{k["card"]};'
      f'box-shadow:{k["sombra"]};">{espinha(k)}</div></div>')

def tela_calendario(tema):
    k=T[tema]
    return (f'<div style="position:relative;display:flex;height:1000px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail(k)}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:18px;padding:26px 30px;overflow:hidden;">'
      f'{topo(k,"calendario")}{banner(k)}'
      f'<div style="display:flex;gap:22px;align-items:flex-start;">{coluna_esq(k)}{centro(k)}</div>'
      f'</div>{fab(k)}</div>')

open('Main.dc.html','w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=tela_calendario('claro')))
print('Main.dc.html', len(open('Main.dc.html').read()))
