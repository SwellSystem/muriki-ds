from render9 import *

def seletor_escala_at(k, atual):
    def esc(nome):
        if nome==atual:
            return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{nome}</span>')
        return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
          f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">{nome}</span>')
    return (f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{esc("Mês")}{esc("Semana")}{esc("Dia")}</div>')

def cabeca_painel(k, titulo, escala):
    return (f'<div style="display:flex;align-items:center;gap:12px;">'
      f'<span style="font-size:15px;font-weight:600;color:{k["fgs"]};">{titulo}</span>'
      f'<span style="display:flex;gap:2px;color:{k["mfg"]};">'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["esq"]}</span></span>'
      f'<span style="display:flex;width:22px;height:22px;align-items:center;justify-content:center;">'
      f'<span style="display:flex;width:14px;height:14px;">{I["dir"]}</span></span></span>'
      f'<span style="margin-left:auto;display:flex;align-items:center;gap:10px;">{seletor_escala_at(k,escala)}'
      f'<span style="display:flex;width:28px;height:28px;align-items:center;justify-content:center;'
      f'border-radius:8px;color:{k["mfg"]};box-shadow:inset 0 0 0 1px {mistura(k["input"],k["bg"],45)};">'
      f'<span style="display:flex;width:14px;height:14px;">{I["expandir"]}</span></span></span></div>')

# ── semana compacta, dentro da home ─────────────────────────────────────
SH0,SH1,SPX=8,17,52
def semana_compacta(k):
    def col(idx, nome, num, hoje):
        bl=''
        for ini,fim,titulo,cal in SEMANA[idx]:
            top=(ini-SH0)*SPX; a=(fim-ini)*SPX-3
            c=CALENDARIOS[cal]['cor']; fundo=mistura(c,k['card'],9)
            bl += (f'<div style="position:absolute;left:2px;right:2px;top:{top}px;height:{a}px;'
              f'border-radius:7px;background:{fundo};box-shadow:{k["sombra"]};padding:4px 7px;overflow:hidden;">'
              f'<div style="display:flex;align-items:center;gap:5px;min-width:0;">'
              f'<span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:{c};'
              f'flex:0 0 auto;"></span>'
              f'<span style="font-size:11px;font-weight:500;color:{k["fgs"]};overflow:hidden;'
              f'text-overflow:ellipsis;white-space:nowrap;">{titulo}</span></div></div>')
        for ini,fim,cod in SEMANA_TASK.get(idx,[]):
            top=(ini-SH0)*SPX; a=(fim-ini)*SPX-3
            bl += (f'<div style="position:absolute;left:2px;right:2px;top:{top}px;height:{a}px;'
              f'border-radius:7px;background:{k["muted"]};padding:4px 7px;overflow:hidden;">'
              f'<div style="display:flex;align-items:center;gap:5px;">'
              f'<span style="display:inline-block;width:9px;height:9px;border-radius:999px;flex:0 0 auto;'
              f'box-shadow:inset 0 0 0 1.2px {k["input"]};"></span>'
              f'<span style="font-family:{MONO};font-size:9.5px;color:{k["mfg"]};">{cod}</span></div></div>')
        linhas=''.join(f'<span style="position:absolute;left:0;right:0;top:{(h-SH0)*SPX}px;height:1px;'
          f'background:{k["muted"]};"></span>' for h in range(SH0,SH1))
        cab=(f'<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0 8px;">'
          f'<span style="font-family:{MONO};font-size:9px;letter-spacing:0.14em;text-transform:uppercase;'
          f'color:{k["mfg"]};opacity:0.8;">{nome}</span>'
          f'<span style="width:22px;height:22px;border-radius:999px;display:flex;align-items:center;'
          f'justify-content:center;font-size:12px;'
          + (f'background:{k["pri"]};color:{k["prifg"]};font-weight:600;' if hoje else f'color:{k["fgs"]};')
          + f'">{num}</span></div>')
        return (f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{cab}'
          f'<div style="position:relative;height:{(SH1-SH0)*SPX}px;">{linhas}{bl}</div></div>')
    gut=''.join(f'<span style="position:absolute;right:6px;top:{54+(h-SH0)*SPX-6}px;font-family:{MONO};'
      f'font-size:9.5px;color:{k["mfg"]};opacity:0.6;">{h:02d}:00</span>' for h in range(SH0,SH1))
    cols=''.join(col(i,n,d,i==3) for i,(n,d) in enumerate(DIAS))
    return (f'<div style="display:flex;">'
      f'<div style="width:44px;flex:0 0 44px;position:relative;">{gut}</div>'
      f'<div style="flex:1;min-width:0;display:flex;">{cols}</div></div>')

# A saudação vale 114px mais um vão de 18 — uma fileira inteira do mês. Ela
# fica no DIA, onde o calendário é estreito e sobra espaço, e recolhe na semana
# e no mês: ali você não está sendo cumprimentado, está planejando. O eyebrow,
# o resumo, a faixa de atenção e o botão viram uma linha só.
def topo_compacto(k):
    def vt(nome, svg, at):
        base=(f'height:28px;display:flex;align-items:center;gap:7px;padding:0 12px;'
              f'border-radius:999px;font-size:12.5px;')
        if at:
            return (f'<span style="{base}background:{k["card"]};color:{k["pri"]};font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">'
              f'<span style="display:flex;width:15px;height:15px;">{svg}</span>{nome}</span>')
        return (f'<span style="{base}color:{k["mfg"]};">'
          f'<span style="display:flex;width:15px;height:15px;">{svg}</span>{nome}</span>')
    toggle=(f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{vt("Calendário",I["cal"],True)}{vt("Kanban",I["kan"],False)}</div>')
    chips=''.join((chip('2 vencidas',k['tred'],k['tredfg'],k['reddot']),
                   chip('1 bloqueada',k['tyellow'],k['tyellowfg']),
                   chip('3 sem prazo',k['tgray'],k['tgrayfg'])))
    barra=(f'<span style="position:relative;display:inline-block;width:120px;height:6px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);flex:0 0 auto;">'
      f'<span style="position:absolute;left:0;top:0;bottom:0;width:68%;border-radius:999px;background:{k["pri"]};"></span>'
      f'<span style="position:absolute;left:68%;top:0;bottom:0;width:32%;border-radius:0 999px 999px 0;'
      f'background:repeating-linear-gradient(45deg,{k["warn"]},{k["warn"]} 2px,transparent 2px,transparent 5px);"></span>'
      f'</span>')
    botao=(f'<button style="display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 15px;'
      f'border:0;border-radius:9px;background:{k["pri"]};color:{k["prifg"]};font-family:inherit;'
      f'font-size:13.5px;font-weight:500;cursor:pointer;white-space:nowrap;">'
      f'<span style="display:flex;width:15px;height:15px;">{I["seta"]}</span>Começar o dia</button>')
    return (f'<div style="display:flex;flex-direction:column;gap:12px;">'
      f'<div style="display:flex;align-items:center;gap:14px;">'
      f'{rotulo("Quinta · 12 de junho", k["mfg"])}'
      f'<span style="height:1px;width:36px;background:{k["pri"]};opacity:0.5;"></span>'
      f'<span style="margin-left:auto;">{toggle}</span></div>'
      f'<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;'
      f'background:{k["card"]};box-shadow:{k["sombra"]};">'
      f'<span style="font-size:13.5px;color:{k["mfg"]};white-space:nowrap;">'
      f'Sobram <strong style="color:{k["fgs"]};font-weight:600;">4h20</strong> livres hoje</span>'
      f'<span style="width:1px;height:18px;background:{k["muted"]};"></span>'
      f'{chips}{barra}'
      f'<span style="margin-left:auto;flex:0 0 auto;">{botao}</span></div></div>')

def home(tema, escala):
    k=T[tema]
    if escala=='Dia':
        titulo='Quinta, 12'; miolo=espinha(k)
    elif escala=='Semana':
        titulo='8 – 14 de junho'; miolo=semana_compacta(k)
    else:
        titulo='Junho 2026'
        dias=['S','T','Q','Q','S','S','D']
        cab=''.join(f'<span style="font-family:{MONO};font-size:9px;letter-spacing:0.14em;'
          f'text-transform:uppercase;color:{k["mfg"]};opacity:0.75;padding:0 6px;">{d}</span>' for d in dias)
        cels=''.join(celula_mes(n,k,alt=132,teto=4) for n in range(1,31))
        miolo=(f'<div style="display:flex;flex-direction:column;gap:6px;">'
          f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;">{cab}</div>'
          f'<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;">{cels}</div></div>')
    centro=(f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;">'
      f'{cabeca_painel(k,titulo,escala)}'
      f'<div style="padding:16px 18px;border-radius:14px;background:{k["card"]};'
      f'box-shadow:{k["sombra"]};">{miolo}</div></div>')
    return (f'<div style="position:relative;display:flex;height:1000px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail(k)}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:18px;padding:26px 30px;overflow:hidden;">'
      + (f'{topo(k,"calendario")}{banner(k)}' if escala=='Dia' else f'{topo_compacto(k)}')
      + f'<div style="display:flex;gap:22px;align-items:flex-start;">{coluna_esq(k)}{centro}</div>'
      f'</div>{fab(k)}</div>')

for arq, esc in (('HomeSemana.dc.html','Semana'), ('HomeMes.dc.html','Mês')):
    open(arq,'w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=home('claro',esc)))
    print(arq, len(open(arq).read()))
