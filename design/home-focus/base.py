import json
T = json.load(open('tokens.json'))
FONTE = "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
MONO  = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

CASCA = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
  <style>
    body {{ margin: 0; }}
    * {{ box-sizing: border-box; }}
    a {{ color: {pri}; text-decoration: none; }}
    a:hover {{ color: {prisubfg}; }}
  </style>
</helmet>
{corpo}
</x-dc>
</body>
</html>
'''

I = dict(
  sol='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="3.2"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1"/></svg>',
  sem='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="3.5" width="12" height="10.5" rx="2"/><path d="M2 7h12M5.5 1.8v3M10.5 1.8v3"/></svg>',
  prox='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 4v4l2.6 1.6"/><circle cx="8" cy="8" r="6.2"/></svg>',
  task='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.2 4.4l1.6 1.6 2.6-2.8M2.2 11.4l1.6 1.6 2.6-2.8M9 4.6h4.8M9 11.8h4.8"/></svg>',
  cal='<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.4" width="12" height="10.8" rx="1.9" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.9h12M5.4 1.9v2.6M10.6 1.9v2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><text x="8" y="12.4" text-anchor="middle" font-size="5.4" font-weight="700" fill="currentColor" font-family="ui-sans-serif,system-ui,sans-serif">31</text></svg>',
  eng='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.2 4.4h5M9.8 4.4h4M2.2 11.6h4M8.8 11.6h5"/><circle cx="8.4" cy="4.4" r="1.7"/><circle cx="7.4" cy="11.6" r="1.7"/></svg>',
  roda='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.3"/><path d="M12.9 9.8a1.1 1.1 0 00.22 1.21l.04.04a1.33 1.33 0 11-1.88 1.88l-.04-.04a1.1 1.1 0 00-1.21-.22 1.1 1.1 0 00-.67 1v.11a1.33 1.33 0 11-2.66 0v-.06a1.1 1.1 0 00-.72-1 1.1 1.1 0 00-1.21.22l-.04.04A1.33 1.33 0 112.85 11.1l.04-.04a1.1 1.1 0 00.22-1.21 1.1 1.1 0 00-1-.67h-.11a1.33 1.33 0 110-2.66h.06a1.1 1.1 0 001-.72 1.1 1.1 0 00-.22-1.21l-.04-.04A1.33 1.33 0 114.68 2.57l.04.04a1.1 1.1 0 001.21.22h.05a1.1 1.1 0 00.67-1v-.11a1.33 1.33 0 112.66 0v.06a1.1 1.1 0 00.67 1 1.1 1.1 0 001.21-.22l.04-.04a1.33 1.33 0 111.88 1.88l-.04.04a1.1 1.1 0 00-.22 1.21v.05a1.1 1.1 0 001 .67h.11a1.33 1.33 0 010 2.66h-.06a1.1 1.1 0 00-1 .67z"/></svg>',
  seta='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  mais='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 3.2v9.6M3.2 8h9.6"/></svg>',
  rel='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="7" cy="7" r="5.4"/><path d="M7 4.2V7l1.9 1.2"/></svg>',
  alerta='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M7 1.9L12.8 12H1.2L7 1.9z"/><path d="M7 5.9v2.4M7 10.1v.1"/></svg>',
  kan='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1.8" y="2.4" width="3.6" height="11.2" rx="1.2"/><rect x="6.2" y="2.4" width="3.6" height="7.6" rx="1.2"/><rect x="10.6" y="2.4" width="3.6" height="9.4" rx="1.2"/></svg>',
  nota='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11.6 3.4l5 5L8.2 16.8 3 18l1.2-5.2 7.4-7.4z"/><path d="M10.2 4.8l5 5"/></svg>',
  esq='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.6 4L5.6 8l4 4"/></svg>',
  dir='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.4 4l4 4-4 4"/></svg>',
  cam='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.4" y="3.6" width="7.6" height="6.8" rx="1.6"/><path d="M9 6.4l3.6-2v5.2L9 7.6"/></svg>',
  expandir='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.4 1.8H1.8v3.6M8.6 12.2h3.6V8.6M1.8 8.6v3.6h3.6M12.2 5.4V1.8H8.6"/></svg>',
  # origens de task — formas genéricas, não marcas
  o_manual='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 2.2l2.6 2.6-6.6 6.6-3.4.8.8-3.4 6.6-6.6z"/></svg>',
  o_slack='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.6a4.6 4.6 0 118.2 2.9L12 12l-2.6-.5A4.6 4.6 0 012 6.6z"/></svg>',
  o_jira='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.6l5.4 5.4L7 12.4 1.6 7 7 1.6z"/></svg>',
  o_docs='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.6H3.6v10.8h6.8V4L8 1.6z"/><path d="M8 1.6V4h2.4M5.4 7.2h3.2M5.4 9.4h3.2"/></svg>',
  o_ai='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.8l1.5 3.7L12.2 7l-3.7 1.5L7 12.2 5.5 8.5 1.8 7l3.7-1.5L7 1.8z"/></svg>',
  o_work='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.6" y="4.2" width="10.8" height="7.8" rx="1.6"/><path d="M5 4.2V2.8h4v1.4"/></svg>',
)

def rotulo(t, c, tam='10px'):
    return (f'<span style="font-family:{MONO};font-size:{tam};letter-spacing:0.22em;'
            f'text-transform:uppercase;color:{c};">{t}</span>')

def chip(txt, bg, fg, ponto=None, svg=None, mono=False):
    p = (f'<span style="width:6px;height:6px;border-radius:999px;background:{ponto};'
         f'flex:0 0 auto;"></span>') if ponto else ''
    g = (f'<span style="display:flex;width:12px;height:12px;flex:0 0 auto;">{svg}</span>') if svg else ''
    ff = f'font-family:{MONO};letter-spacing:0.04em;' if mono else ''
    return (f'<span style="display:inline-flex;align-items:center;gap:5px;height:22px;'
            f'padding:0 8px;border-radius:4px;background:{bg};color:{fg};font-size:11.5px;'
            f'font-weight:500;{ff}white-space:nowrap;">{p}{g}{txt}</span>')

def prio_chip(p, k):
    m = {'Alta':('torange','torangefg'), 'Média':('tblue','tbluefg'),
         'Baixa':('tgray','tgrayfg'), 'Urgente':('tred','tredfg')}
    a,b = m.get(p, ('tgray','tgrayfg'))
    return chip(p, k[a], k[b])

def origem_task(o, k):
    m = {'manual':('o_manual','Manual'), 'slack':('o_slack','Slack'), 'jira':('o_jira','Jira'),
         'docs':('o_docs','Docs'), 'ai':('o_ai','Muriki AI'), 'work':('o_work','Work')}
    ic, lab = m[o]
    return chip(lab, k['muted'], k['mfg'], svg=I[ic])

# ── mistura em oklab, como o sistema faz ────────────────────────────────
import math as _m
def _srgb_ok(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b=f(r),f(g),f(b)
    l=(0.4122214708*r+0.5363325363*g+0.0514459929*b)**(1/3)
    m=(0.2119034982*r+0.6806995451*g+0.1073969566*b)**(1/3)
    s=(0.0883024619*r+0.2817188376*g+0.6299787005*b)**(1/3)
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s,
            1.9779984951*l-2.4285922050*m+0.4505937099*s,
            0.0259040371*l+0.7827717662*m-0.8086757660*s)
def _ok_srgb(L,a,b):
    l=(L+0.3963377774*a+0.2158037573*b)**3
    m=(L-0.1055613458*a-0.0638541728*b)**3
    s=(L-0.0894841775*a-1.2914855480*b)**3
    r= 4.0767416621*l-3.3077115913*m+0.2309699292*s
    g=-1.2684380046*l+2.6097574011*m-0.3413193965*s
    bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    f=lambda c:12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
    return '#%02X%02X%02X'%tuple(max(0,min(255,round(f(x)*255))) for x in (r,g,bb))
def mistura(cor, base, p):
    """`p` por cento de `cor` sobre `base`, em oklab — o mesmo espaço que o
    sistema usa desde que misturar dois neutros em oklch saiu rosa."""
    A=_srgb_ok(cor); B=_srgb_ok(base); t=p/100
    return _ok_srgb(*[A[i]*t+B[i]*(1-t) for i in range(3)])
