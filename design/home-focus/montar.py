from telas import *

# NÃO EXISTE ROTA DE CALENDÁRIO. O calendário É a home: o item "Hoje" abre a
# home, a home tem as duas visões no segmentado (calendário e kanban), a visão
# de calendário tem as três escalas, e o cheio é um MODO dela, não um destino.
# Semana, Próximas e Calendário eram rotas que eu inventei — um nav que promete
# lugares onde não se chega.
def rail(k, ativo='Hoje'):
    itens=[('Hoje',I['sol']),('Tasks',I['task'])]
    def item(t,s,at):
        f=(f'background:{k["prisub"]};color:{k["prisubfg"]};' if at else f'color:{k["mfg"]};')
        b=(f'<span style="position:absolute;left:0;top:6px;bottom:6px;width:3px;border-radius:999px;'
           f'background:{k["pri"]};"></span>') if at else ''
        return (f'<div style="position:relative;display:flex;align-items:center;gap:10px;height:36px;'
                f'padding:0 10px;border-radius:9px;font-size:13px;{f}">{b}'
                f'<span style="display:flex;width:16px;height:16px;flex:0 0 auto;">{s}</span>{t}</div>')
    nav=''.join(item(t,s,t==ativo) for t,s in itens)
    return (f'<div style="width:220px;flex:0 0 220px;background:{k["rail"]};display:flex;'
      f'flex-direction:column;box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">'
      f'<div style="padding:10px;"><div style="display:flex;align-items:center;gap:10px;height:44px;'
      f'padding:0 10px;border-radius:11px;">'
      f'<span style="width:26px;height:26px;border-radius:999px;background:{k["pri"]};color:{k["prifg"]};'
      f'display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;">MK</span>'
      f'<span style="display:flex;flex-direction:column;min-width:0;">'
      f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Muriki</span>'
      f'<span style="font-size:11px;color:{k["mfg"]};">swellsystem</span></span></div></div>'
      f'<div style="padding:8px 10px;display:flex;flex-direction:column;gap:2px;">'
      f'<div style="height:32px;display:flex;align-items:center;padding:0 8px;">{rotulo("Focus", k["mfg"])}</div>{nav}</div>'
      f'<div style="flex:1;"></div><div style="padding:10px;">{item("Configurações",I["eng"],False)}</div></div>')

def banner(k):
    c=[chip('2 vencidas',k['tred'],k['tredfg'],k['reddot']),
       chip('1 bloqueada',k['tyellow'],k['tyellowfg']),
       chip('3 sem prazo',k['tgray'],k['tgrayfg'])]
    barra=(f'<div style="display:flex;align-items:center;gap:12px;margin-left:auto;">'
      f'<span style="font-size:12.5px;color:{k["mfg"]};">'
      f'<strong style="color:{k["warn"]};font-weight:600;">6h20</strong> de task para 4h20 livres</span>'
      f'<span style="position:relative;width:150px;height:6px;border-radius:999px;background:{k["sunken"]};'
      f'box-shadow:inset 0 1px 2px rgba(0,0,0,0.06);">'
      f'<span style="position:absolute;left:0;top:0;bottom:0;width:68%;border-radius:999px;background:{k["pri"]};"></span>'
      f'<span style="position:absolute;left:68%;top:0;bottom:0;width:32%;border-radius:0 999px 999px 0;'
      f'background:repeating-linear-gradient(45deg,{k["warn"]},{k["warn"]} 2px,transparent 2px,transparent 5px);"></span>'
      f'</span></div>')
    return (f'<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;'
      f'background:{k["card"]};box-shadow:{k["sombra"]}, inset 0 0 0 1px {k["border"]};">'
      f'<span style="display:flex;width:14px;height:14px;color:{k["mfg"]};flex:0 0 auto;">{I["alerta"]}</span>'
      f'{"".join(c)}{barra}</div>')

def topo(k, visao='calendario'):
    def vt(nome, svg, at):
        if at:
            return (f'<span style="height:28px;display:flex;align-items:center;gap:7px;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">'
              f'<span style="display:flex;width:15px;height:15px;">{svg}</span>{nome}</span>')
        return (f'<span style="height:28px;display:flex;align-items:center;gap:7px;padding:0 12px;'
          f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">'
          f'<span style="display:flex;width:15px;height:15px;">{svg}</span>{nome}</span>')
    toggle=(f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{vt("Calendário",I["cal"],visao=="calendario")}{vt("Kanban",I["kan"],visao=="kanban")}</div>')
    # O focus é PESSOAL. O segmentado meu/time saiu: prometia uma visão que
    # não existe, e um controle que não leva a lugar nenhum é pior que a
    # ausência dele.
    botao=(f'<button style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;'
      f'border:0;border-radius:9px;background:{k["pri"]};color:{k["prifg"]};font-family:inherit;'
      f'font-size:14px;font-weight:500;cursor:pointer;">'
      f'<span style="display:flex;width:16px;height:16px;">{I["seta"]}</span>Começar o dia</button>')
    return (f'<div style="display:flex;flex-direction:column;gap:16px;">'
      f'<div style="display:flex;align-items:center;gap:14px;">{rotulo("Quinta · 12 de junho", k["mfg"])}'
      f'<span style="height:1px;width:40px;background:{k["pri"]};opacity:0.5;"></span>'
      f'<span style="height:1px;width:120px;background:{k["border"]};"></span>'
      f'<span style="margin-left:auto;">{toggle}</span></div>'
      f'<div style="display:flex;align-items:flex-end;gap:24px;">'
      f'<div style="display:flex;flex-direction:column;gap:8px;min-width:0;">'
      f'<h1 style="margin:0;font-size:32px;line-height:1.05;font-weight:600;letter-spacing:-0.03em;'
      f'color:{k["fgs"]};">Bom dia, Guilherme.</h1>'
      f'<p style="margin:0;font-size:15px;color:{k["mfg"]};line-height:1.5;">'
      f'Três compromissos e sete tasks. Sobram <strong style="color:{k["fgs"]};font-weight:600;">4h20</strong> livres no dia.</p></div>'
      f'<span style="margin-left:auto;flex:0 0 auto;">{botao}</span></div></div>')

def fab(k):
    return (f'<div style="position:absolute;right:26px;bottom:26px;width:48px;height:48px;border-radius:999px;'
      f'background:{k["pri"]};color:{k["prifg"]};display:flex;align-items:center;justify-content:center;'
      f'box-shadow:{k["sombraFlut"]};"><span style="display:flex;width:20px;height:20px;">{I["nota"]}</span></div>')
