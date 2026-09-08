from render5 import *

# ── rail em três estados ────────────────────────────────────────────────
def rail_var(k, estado='rotulos', ativo='Hoje'):
    # Dois itens, e só. Ver a nota em montar.py: o calendário é a home.
    itens=[('Hoje',I['sol']),('Tasks',I['task'])]
    icone_so = estado=='icones'
    larg = 56 if icone_so else 220
    def item(t,s,at):
        f=(f'background:{k["prisub"]};color:{k["prisubfg"]};' if at else f'color:{k["mfg"]};')
        b=('' if icone_so else (f'<span style="position:absolute;left:0;top:6px;bottom:6px;width:3px;'
           f'border-radius:999px;background:{k["pri"]};"></span>') if at else '')
        if icone_so:
            return (f'<div style="position:relative;display:flex;align-items:center;justify-content:center;'
                    f'width:36px;height:36px;margin:0 auto;border-radius:9px;{f}">'
                    f'<span style="display:flex;width:16px;height:16px;">{s}</span></div>')
        return (f'<div style="position:relative;display:flex;align-items:center;gap:10px;height:36px;'
                f'padding:0 10px;border-radius:9px;font-size:13px;{f}">{b}'
                f'<span style="display:flex;width:16px;height:16px;flex:0 0 auto;">{s}</span>{t}</div>')
    nav=''.join(item(t,s,t==ativo) for t,s in itens)
    marca=(f'<div style="display:flex;align-items:center;justify-content:center;height:44px;">'
      f'<span style="width:26px;height:26px;border-radius:999px;background:{k["pri"]};color:{k["prifg"]};'
      f'display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;">MK</span></div>'
      if icone_so else
      f'<div style="display:flex;align-items:center;gap:10px;height:44px;padding:0 10px;border-radius:11px;">'
      f'<span style="width:26px;height:26px;border-radius:999px;background:{k["pri"]};color:{k["prifg"]};'
      f'display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;">MK</span>'
      f'<span style="display:flex;flex-direction:column;min-width:0;">'
      f'<span style="font-size:13px;font-weight:500;color:{k["fgs"]};">Muriki</span>'
      f'<span style="font-size:11px;color:{k["mfg"]};">swellsystem</span></span></div>')
    rot=('' if icone_so else f'<div style="height:32px;display:flex;align-items:center;padding:0 8px;">'
         f'{rotulo("Focus", k["mfg"])}</div>')
    miolo=(f'<div style="padding:10px;">{marca}</div>'
      f'<div style="padding:8px 10px;display:flex;flex-direction:column;gap:2px;">{rot}{nav}</div>'
      f'<div style="flex:1;"></div>'
      f'<div style="padding:10px;">{item("Configurações",I["eng"],False)}</div>')
    if estado=='flutuante':
        return (f'<div style="width:{larg+16}px;flex:0 0 {larg+16}px;padding:8px 0 8px 8px;">'
          f'<div style="height:100%;border-radius:{"12px"};background:{k["rail"]};display:flex;'
          f'flex-direction:column;box-shadow:{k["sombraFlut"]};">{miolo}</div></div>')
    return (f'<div style="width:{larg}px;flex:0 0 {larg}px;background:{k["rail"]};display:flex;'
      f'flex-direction:column;box-shadow:2px 0 10px -7px rgba(0,0,0,0.30);">{miolo}</div>')

# ── semana por horário, o calendário cheio ──────────────────────────────
DIAS=[('Seg',8),('Ter',9),('Qua',10),('Qui',11),('Sex',12),('Sáb',13),('Dom',14)]
SEMANA={
 0:[(9,9.5,'Daily',0),(14,15.5,'Planning',0)],
 1:[(9,9.5,'Daily',0),(11,12,'Dentista',1)],
 2:[(9,9.5,'Daily',0),(16,17,'Retro',0)],
 3:[(9,9.5,'Daily',0),(11,12,'Revisão do contrato',2),(15,16.5,'1:1 com Mariana',1)],
 4:[(9,9.5,'Daily',0),(13,14,'Almoço com Julia',1)],
 5:[], 6:[],
}
SEMANA_TASK={0:[(10,11.5,'MUR-412')],2:[(13,14.5,'MUR-502')],3:[(9.75,11,'MUR-216'),(12.5,14,'MUR-301')]}
WH0,WH1,WPX=8,18,52

def coluna_semana(idx, nome, num, k, hoje=False):
    blocos=''
    for ini,fim,titulo,cal in SEMANA[idx]:
        top=(ini-WH0)*WPX; a=(fim-ini)*WPX-3
        c=CALENDARIOS[cal]['cor']
        curto = a < 40
        pt=(f'<span style="display:inline-block;width:7px;height:7px;border-radius:999px;'
            f'background:{c};flex:0 0 auto;"></span>')
        conteudo=(f'<div style="display:flex;align-items:center;gap:6px;min-width:0;height:100%;">{pt}'
          f'<span style="font-size:11.5px;font-weight:500;color:{k["fgs"]};overflow:hidden;'
          f'text-overflow:ellipsis;white-space:nowrap;">{titulo}</span></div>' if curto else
          f'<div style="display:flex;flex-direction:column;gap:2px;">'
          f'<span style="display:flex;align-items:center;gap:6px;">{pt}'
          f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};">{hhmm(ini)}</span></span>'
          f'<span style="font-size:11.5px;font-weight:600;color:{k["fgs"]};line-height:1.25;overflow:hidden;'
          f'text-overflow:ellipsis;white-space:nowrap;">{titulo}</span></div>')
        fundo = mistura(c, k['card'], 9)
        blocos += (f'<div style="position:absolute;left:2px;right:2px;top:{top}px;height:{a}px;'
          f'border-radius:8px;background:{fundo};box-shadow:{k["sombra"]};padding:5px 8px;'
          f'overflow:hidden;">{conteudo}</div>')
    for ini,fim,cod in SEMANA_TASK.get(idx,[]):
        top=(ini-WH0)*WPX; a=(fim-ini)*WPX-3
        blocos += (f'<div style="position:absolute;left:2px;right:2px;top:{top}px;height:{a}px;'
          f'border-radius:8px;background:{k["muted"]};padding:5px 9px;overflow:hidden;">'
          f'<div style="display:flex;align-items:center;gap:6px;">'
          f'<span style="display:inline-block;width:11px;height:11px;border-radius:999px;flex:0 0 auto;'
          f'box-shadow:inset 0 0 0 1.3px {k["input"]};"></span>'
          f'<span style="font-family:{MONO};font-size:10px;color:{k["mfg"]};">{cod}</span></div></div>')
    # A linha da hora não é decoração: é a régua contra a qual se lê a duração.
    # No `--border`, que recuou, ela sumia contra a página. Aqui ela usa o
    # `--muted`, um degrau abaixo do fundo — a exceção declarada à regra do
    # filete recuado, porque aqui a linha carrega significado.
    linhas=''.join(f'<span style="position:absolute;left:0;right:0;top:{(h-WH0)*WPX}px;height:1px;'
      f'background:{k["muted"]};"></span>' for h in range(WH0,WH1))
    cab=(f'<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 0 10px;">'
      f'<span style="font-family:{MONO};font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;'
      f'color:{k["mfg"]};opacity:0.8;">{nome}</span>'
      f'<span style="width:26px;height:26px;border-radius:999px;display:flex;align-items:center;'
      f'justify-content:center;font-size:13px;'
      + (f'background:{k["pri"]};color:{k["prifg"]};font-weight:600;' if hoje else f'color:{k["fgs"]};')
      + f'">{num}</span></div>')
    return (f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;">{cab}'
      f'<div style="position:relative;height:{(WH1-WH0)*WPX}px;">{linhas}{blocos}</div></div>')

def barra_cheia(k, estado):
    def esc(nome,at):
        if at:
            return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
              f'border-radius:999px;background:{k["card"]};color:{k["pri"]};font-size:12.5px;font-weight:500;'
              f'box-shadow:0 1px 2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), inset 0 0 0 1px {k["input"]};">{nome}</span>')
        return (f'<span style="height:26px;display:flex;align-items:center;padding:0 12px;'
          f'border-radius:999px;color:{k["mfg"]};font-size:12.5px;">{nome}</span>')
    seletor=(f'<div style="display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:999px;'
      f'background:{k["sunken"]};box-shadow:inset 0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 1px {k["border"]};">'
      f'{esc("Mês",False)}{esc("Semana",True)}{esc("Dia",False)}</div>')
    # o banner colapsa numa linha só: em modo cheio ele não pode virar caixa
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
      f'<span style="font-size:17px;font-weight:600;letter-spacing:-0.02em;color:{k["fgs"]};">8 – 14 de junho</span>'
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

def tela_cheia(tema, estado):
    k=T[tema]
    # O cabeçalho da coluna mede 61px. O offset entra no `top` de cada rótulo,
    # e não em padding: `padding-top` não desloca filho posicionado por
    # absolute — ele conta a partir da caixa de padding, não do conteúdo.
    CAB=61
    gutter=''.join(f'<span style="position:absolute;right:8px;top:{CAB+(h-WH0)*WPX-6}px;'
      f'font-family:{MONO};font-size:10px;color:{k["mfg"]};opacity:0.6;">{h:02d}:00</span>'
      for h in range(WH0,WH1))
    cols=''.join(coluna_semana(i,n,d,k,i==3) for i,(n,d) in enumerate(DIAS))
    grade=(f'<div style="flex:1;display:flex;min-height:0;">'
      f'<div style="width:52px;flex:0 0 52px;position:relative;">{gutter}</div>'
      f'<div style="flex:1;min-width:0;display:flex;">{cols}</div></div>')
    return (f'<div style="position:relative;display:flex;height:820px;background:{k["bg"]};color:{k["fg"]};'
      f'font-family:{FONTE};font-size:14px;overflow:hidden;">{rail_var(k,estado)}'
      f'<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:{k["bg"]};'
      f'overflow:hidden;">{barra_cheia(k,estado)}{grade}</div>{fab(k)}</div>')

for arq, est in (('Cheio.dc.html','rotulos'), ('CheioIcones.dc.html','icones'), ('CheioFlutuante.dc.html','flutuante')):
    open(arq,'w').write(CASCA.format(pri=T['claro']['pri'], prisubfg=T['claro']['prisubfg'], corpo=tela_cheia('claro',est)))
    print(arq, len(open(arq).read()))
