"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { AcrylicHudCore } from "@/components/acrylic/acrylic-hud/acrylic-core"
import { useAcrylicPhase } from "@/components/acrylic/acrylic-hud/acrylic-hud"

/**
 * Muriki Acrílico — Teclado. O corpo do Jarvis, página inteira, e a
 * história sai do loading.
 *
 * O LOGO MORA NO CANTO INFERIOR ESQUERDO — é a Muriki IA: clicar liga o
 * modo ouvindo. Em volta dele, a volta grande: módulos e dados em arcos
 * que entram pela borda esquerda e saem pela de baixo. As fileiras de
 * ações são ARCOS ELÍPTICOS (curva forte perto do cluster, plana na
 * direita) com o centro fora da tela; cada fileira começa onde sai do
 * círculo do cluster e chega à borda direita. No topo, quatro
 * INSTRUMENTOS traçados no SVG — anel, pontos, grade, manômetro — cada um
 * na forma que o dado pede, na mesma linha e no mesmo mono das teclas.
 *
 * A ESCRITA ACOMPANHA O FORMATO: ícone e nome giram com a tecla — pela
 * tangente do arco no círculo, pela tangente da fileira no teclado.
 *
 * NO BOOT, logo e órbita nascem no centro da tela; quando a fase abre, o
 * reator atraca no canto (CSS) e este componente mede onde cada ícone
 * está na órbita e onde a tecla dele espera, escreve --dx/--dy (já no
 * referencial girado da tecla) e dispara o voo. O resto é CSS.
 *
 * O palco é 200×100. As constantes abaixo são a geometria inteira.
 */
export interface AcrylicKey {
  id: string
  label: string
  /** Rótulo curto embaixo do ícone; default: label. */
  short?: string
  /** Um phosphor com size={16}, ou qualquer svg 16×16. */
  icon?: React.ReactNode
  detail?: string
  href?: string
  onSelect?: () => void
  /** Quantas unidades da fileira a tecla ocupa. Default 1; a tecla da IA
   *  é 2 — a barra larga do teclado, como no do Stark. */
  span?: number
}

export interface AcrylicDataCell {
  id: string
  label: string
  value: string
  /** Um ícone ao lado do valor — a pessoa, a organização, a versão. Um
   *  phosphor com size={16}, ou qualquer svg 16×16. */
  icon?: React.ReactNode
}

export interface AcrylicChartSegment {
  id: string
  label: string
  value: number
  display?: string
}

export interface AcrylicChart {
  id: string
  title: string
  /** O número grande, já formatado ("18", "5h12"). */
  value: string
  unit?: string
  /** A forma que o dado pede: anel (partes de um todo), pontos (um por
   *  pessoa), grade (uma célula por item), manômetro (quanto de um total).
   *  Default: anel. */
  form?: "ring" | "dots" | "waffle" | "gauge"
  /** O todo, para manômetro/pontos/grade. Default: a soma dos segmentos. */
  total?: number
  /** Até quatro. A ordem é a ordem de presença: o primeiro é o mais aceso. */
  segments: AcrylicChartSegment[]
  /** Onde o painel senta: a fileira do topo (até quatro, da esquerda) ou a
   *  de baixo (até dois, encostados no fim das teclas, no vão que a volta
   *  do teclado deixa embaixo à direita). Default: topo. */
  place?: "top" | "bottom"
}

export interface AcrylicKeyboardProps {
  logo: React.ReactNode
  modules: AcrylicKey[]
  data?: AcrylicDataCell[]
  rows: AcrylicKey[][]
  charts?: AcrylicChart[]
  /** O logo como assistente de voz: clicar alterna o modo ouvindo. */
  core?: { label: string; detail?: string; listeningLabel?: string; onSelect?: (listening: boolean) => void }
  readout?: string
  legend?: string
  label?: string
  className?: string
}

const CORE: [number, number] = [20, 78]
/** A volta grande: maior que a tela — a borda esquerda e a de baixo
 *  cortam os anéis, e o círculo vira diagonal. */
const MODULES_R: [number, number] = [22, 36]
const MODULES_SPAN: [number, number] = [-120, 40]
const DATA_R: [number, number] = [38, 48]
const DATA_SPAN: [number, number] = [-122, 38]
const RULER_R = 51
const EDGE_R = 52.25
const RULER_SPAN: [number, number] = [-150, 60]
/** A volta do teclado: elipse com centro fora da tela, rx = KX · ry. O
 *  centro fica na borda direita — o ápice da curva é lá, então a fileira
 *  sobe o tempo todo: íngreme perto do círculo, suave no fim. */
const ROWS_CENTER: [number, number] = [205, 172]
const ROWS_KX = 1.7
const ROW_RY: [number, number][] = [
  [126, 138],
  [110, 122],
]
/** Vão entre teclas e respiro entre o círculo e a primeira tecla, em
 *  unidades de comprimento de arco. As linhas das arestas não respiram:
 *  encontram o círculo. */
const ROW_KEY_GAP = 0.7
const ROW_START_GAP = 5
/** As arestas das fileiras passam do palco: a de baixo desce até encontrar
 *  o círculo (que fica abaixo da linha y=100), e as duas seguem pela
 *  direita até a borda da TELA, não do SVG. O svg tem overflow visível e o
 *  palco corta na borda da tela — é ele que termina a linha. */
const EDGE_REACH = 16
const ORBIT_R: [number, number] = [14, 17.5]
const VOICE = { x0: 8, x1: 32, y: 95.5 }
const SEG_PRESENCE = [0.92, 0.6, 0.36, 0.22]
/** Os painéis, em unidades do viewBox. A fileira do topo se espalha pela
 *  largura inteira, de x0 a right, com vão igual. A de baixo fica
 *  alinhada à direita no fim das teclas, com vão fixo: a aresta de baixo
 *  do teclado desce para a esquerda e não deixa espalhar. */
const PANEL = { x0: 8, y0: 0, right: 192, y1: 81, right1: 198, w: 38, h: 18, gap: 4, inst: 16 }
function panelSlots(charts: AcrylicChart[]): { chart: AcrylicChart; x0: number; y0: number }[] {
  const top = charts.filter((c) => c.place !== "bottom").slice(0, 4)
  const bottom = charts.filter((c) => c.place === "bottom").slice(0, 2)
  const topGap = top.length > 1 ? (PANEL.right - PANEL.x0 - top.length * PANEL.w) / (top.length - 1) : 0
  return [
    ...top.map((chart, i) => ({ chart, x0: PANEL.x0 + i * (PANEL.w + topGap), y0: PANEL.y0 })),
    ...bottom.map((chart, i) => ({ chart, x0: PANEL.right1 - (bottom.length - i) * (PANEL.w + PANEL.gap) + PANEL.gap, y0: PANEL.y1 })),
  ]
}

function polar(c: [number, number], r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [c[0] + r * Math.cos(rad), c[1] + r * Math.sin(rad)]
}
function sectorPath(c: [number, number], r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0
  const [x0, y0] = polar(c, r1, a0)
  const [x1, y1] = polar(c, r1, a1)
  const [x2, y2] = polar(c, r0, a1)
  const [x3, y3] = polar(c, r0, a0)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r1} ${r1} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} A${r0} ${r0} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`
}
function arcPath(c: [number, number], r: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0
  const [x0, y0] = polar(c, r, a0)
  const [x1, y1] = polar(c, r, a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}
/** Ponto na elipse das fileiras. */
function epoint(ry: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [ROWS_CENTER[0] + ROWS_KX * ry * Math.cos(rad), ROWS_CENTER[1] + ry * Math.sin(rad)]
}
function esectorPath(ry0: number, ry1: number, a0: number, a1: number) {
  const [x0, y0] = epoint(ry1, a0)
  const [x1, y1] = epoint(ry1, a1)
  const [x2, y2] = epoint(ry0, a1)
  const [x3, y3] = epoint(ry0, a0)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${(ROWS_KX * ry1).toFixed(2)} ${ry1} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} A${(ROWS_KX * ry0).toFixed(2)} ${ry0} 0 0 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`
}
function earcPath(ry: number, a0: number, a1: number) {
  const [x0, y0] = epoint(ry, a0)
  const [x1, y1] = epoint(ry, a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${(ROWS_KX * ry).toFixed(2)} ${ry} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}
/** Onde uma fileira sai do círculo do cluster (mais um respiro) e onde
 *  chega à borda direita, em graus da elipse. */
function rowSpan(ry: number, gap = 0, reach = 0): [number, number] {
  let start = 190
  let end = 270
  for (let a = 190; a <= 270; a += 0.25) {
    const [x, y] = epoint(ry, a)
    const inside = Math.hypot(x - CORE[0], y - CORE[1]) < EDGE_R + 0.5 + gap || x < 1 - reach || y > 99 + reach
    if (inside) start = a
    if (x <= 198 + reach && y >= 1 - reach) end = a
  }
  return [start, end]
}
/** Divide um trecho da elipse em n teclas do MESMO comprimento de arco
 *  (por ângulo, as da direita saíam mais largas). Devolve [a0, a1] de cada. */
/** As teclas de uma fileira: a fileira é dividida em unidades iguais (a
 *  soma dos spans) e cada tecla consome as suas — uma tecla dupla é duas
 *  unidades com o vão entre elas absorvido. */
function keyArcs(ry: number, from: number, to: number, row: AcrylicKey[], gapLen: number): [number, number][] {
  const spans = row.map((k) => Math.max(1, Math.round(k.span ?? 1)))
  const units = equalArcs(ry, from, to, Math.max(spans.reduce((a, b) => a + b, 0), 1), gapLen)
  let at = 0
  return spans.map((n) => {
    const a0 = units[Math.min(at, units.length - 1)][0]
    const a1 = units[Math.min(at + n - 1, units.length - 1)][1]
    at += n
    return [a0, a1] as [number, number]
  })
}
function equalArcs(ry: number, from: number, to: number, n: number, gapLen: number): [number, number][] {
  const samples: { a: number; s: number }[] = []
  let s = 0
  let [px, py] = epoint(ry, from)
  samples.push({ a: from, s: 0 })
  for (let a = from + 0.1; a <= to + 1e-9; a += 0.1) {
    const [x, y] = epoint(ry, a)
    s += Math.hypot(x - px, y - py)
    px = x
    py = y
    samples.push({ a, s })
  }
  const total = s
  const angleAt = (len: number) => {
    const i = samples.findIndex((p) => p.s >= len)
    if (i <= 0) return samples[0].a
    const p0 = samples[i - 1]
    const p1 = samples[i]
    const f = (len - p0.s) / (p1.s - p0.s || 1)
    return p0.a + (p1.a - p0.a) * f
  }
  const keyLen = (total - gapLen * (n - 1)) / n
  const out: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const s0 = i * (keyLen + gapLen)
    out.push([angleAt(s0), angleAt(s0 + keyLen)])
  }
  return out
}
/** Tangente da elipse em θ, como rotação de texto legível (-90..90). */
function etangent(ry: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  let t = (Math.atan2(ry * Math.cos(rad), -ROWS_KX * ry * Math.sin(rad)) * 180) / Math.PI
  while (t > 90) t -= 180
  while (t <= -90) t += 180
  return t
}
/** Tangente do círculo do cluster em a. Sem virar para "ficar em pé": a
 *  leitura segue o sentido horário com o topo das letras voltado para o
 *  centro, como num mostrador — é assim no teclado do Stark. */
function ctangent(a: number) {
  return a + 90
}
function voicePath(t: number, amp: number) {
  let d = ""
  for (let x = VOICE.x0; x <= VOICE.x1; x += 0.5) {
    const env = Math.sin(((x - VOICE.x0) / (VOICE.x1 - VOICE.x0)) * Math.PI)
    const y = VOICE.y + amp * env * (Math.sin(x * 1.9 + t * 9) * 0.5 + Math.sin(x * 3.1 - t * 13) * 0.3 + Math.sin(x * 1.1 + t * 5) * 0.2)
    d += `${x === VOICE.x0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d
}

/** O ícone numa tecla (slot) ou na órbita (orbiter). Quem anima é o <g>. */
function Icon({ id, icon, x, y, size, orbiter, rot = 0 }: { id: string; icon: React.ReactNode; x: number; y: number; size: number; orbiter?: boolean; rot?: number }) {
  const svg = (
    <svg className="acr-kbd-icon" x={x - size / 2} y={y - size / 2} width={size} height={size} viewBox="0 0 16 16">
      {icon}
    </svg>
  )
  return orbiter ? (
    <g className="acr-kbd-orbiter" data-orbiter={id} style={{ transformOrigin: `${x}px ${y}px` }}>
      {svg}
    </g>
  ) : (
    <g className="acr-kbd-slot" data-icon={id} data-rot={rot}>
      {svg}
    </g>
  )
}

function KeyShell({ item, className, style, onActive, children }: { item: AcrylicKey; className: string; style: React.CSSProperties; onActive: (item: AcrylicKey | null) => void; children: React.ReactNode }) {
  const shared = {
    className,
    style,
    onMouseEnter: () => onActive(item),
    onMouseLeave: () => onActive(null),
    onFocus: () => onActive(item),
    onBlur: () => onActive(null),
  }
  const body = (
    <>
      <title>{item.label}</title>
      {children}
    </>
  )
  return item.href ? (
    <a href={item.href} onClick={item.onSelect} aria-label={item.label} {...shared}>
      {body}
    </a>
  ) : (
    <g
      role="button"
      tabIndex={0}
      aria-label={item.label}
      onClick={item.onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          item.onSelect?.()
        }
      }}
      {...shared}
    >
      {body}
    </g>
  )
}

/** Um instrumento: painel traçado como uma tecla, o gráfico na forma que
 *  o dado pede, o número grande, a legenda ao lado. `index` é a ordem de
 *  entrada na sequência; onde ele senta vem de panelSlots. */
function Instrument({ chart, index, x0, y0, onHint }: { chart: AcrylicChart; index: number; x0: number; y0: number; onHint: (text: string | null) => void }) {
  const [hi, setHi] = React.useState<number | null>(null)
  const segs = chart.segments.slice(0, 4)
  const sum = segs.reduce((acc, s) => acc + s.value, 0)
  const total = chart.total ?? sum
  const form = chart.form ?? "ring"
  const cx = x0 + 2 + PANEL.inst / 2
  const cy = y0 + 11
  const hintOf = (seg: AcrylicChartSegment) => `${seg.label} · ${seg.display ?? seg.value}`
  const hover = (j: number | null, seg?: AcrylicChartSegment) => ({
    onMouseEnter: () => {
      setHi(j)
      onHint(seg ? hintOf(seg) : null)
    },
    onMouseLeave: () => {
      setHi(null)
      onHint(null)
    },
  })
  const numberInside = form === "ring" || form === "gauge"

  let graphic: React.ReactNode = null
  if (form === "ring" || form === "gauge") {
    const r = 5.6
    const [from, sweep] = form === "gauge" ? [135, 270] : [-90, 360]
    const denom = total || 1
    let cursor = from
    graphic = (
      <>
        <path className="acr-kbd-inst-track" d={form === "gauge" ? arcPath([cx, cy], r, from, from + sweep) : ""} />
        {form === "ring" ? <circle className="acr-kbd-inst-track" cx={cx} cy={cy} r={r} /> : null}
        {segs.map((seg, j) => {
          const span = (seg.value / denom) * sweep
          const gap = form === "ring" ? 4 : 2.5
          const a0 = cursor + gap / 2
          const a1 = cursor + span - gap / 2
          cursor += span
          if (a1 <= a0) return null
          return (
            <path key={seg.id} className="acr-kbd-inst-seg" data-j={j} d={arcPath([cx, cy], r, a0, a1)} pathLength={1} style={{ "--seg": SEG_PRESENCE[j], "--j": j } as React.CSSProperties} {...hover(j, seg)}>
              <title>{hintOf(seg)}</title>
            </path>
          )
        })}
      </>
    )
  } else {
    // pontos (um por pessoa) ou grade (uma célula por item): cada unidade
    // pertence a um segmento, na ordem
    const count = Math.max(1, Math.min(24, Math.round(total)))
    const owner: number[] = []
    segs.forEach((seg, j) => {
      for (let k = 0; k < Math.round(seg.value); k++) owner.push(j)
    })
    const cols = form === "dots" ? Math.min(count, 6) : 6
    const rowsN = Math.ceil(count / cols)
    const pitch = form === "dots" ? 2.6 : 2.5
    const gx = cx - ((cols - 1) * pitch) / 2
    const gy = y0 + 6.2
    graphic = (
      <>
        {Array.from({ length: count }, (_, k) => {
          const j = owner[k] ?? -1
          const seg = j >= 0 ? segs[j] : undefined
          const px = gx + (k % cols) * pitch
          const py = gy + Math.floor(k / cols) * pitch
          const style = { "--seg": j >= 0 ? SEG_PRESENCE[j] : 0, "--k": k } as React.CSSProperties
          return form === "dots" ? (
            <circle key={k} className="acr-kbd-inst-dot" data-j={j} cx={px} cy={py} r="0.95" style={style} {...hover(j, seg)}>
              {seg ? <title>{hintOf(seg)}</title> : null}
            </circle>
          ) : (
            <rect key={k} className="acr-kbd-inst-cell" data-j={j} x={px - 1} y={py - 1} width="2" height="2" style={style} {...hover(j, seg)}>
              {seg ? <title>{hintOf(seg)}</title> : null}
            </rect>
          )
        })}
      </>
    )
  }
  const numberY = numberInside ? cy : y0 + 6.2 + Math.ceil(Math.min(24, Math.round(total)) / (form === "dots" ? Math.min(Math.round(total), 6) : 6)) * 2.5 + 2.2

  return (
    <g className="acr-kbd-panel" style={{ "--i": index } as React.CSSProperties} data-hi={hi ?? undefined} aria-label={`${chart.title}: ${chart.value} ${chart.unit ?? ""}`}>
      <rect className="acr-kbd-face" x={x0} y={y0} width={PANEL.w} height={PANEL.h} pathLength={1} />
      <text className="acr-kbd-inst-title acr-kbd-inst-text" x={x0 + 2} y={y0 + 2.6}>
        {chart.title}
      </text>
      {graphic}
      <g className="acr-kbd-inst-text">
        <text className="acr-kbd-inst-value" x={cx} y={numberY - 0.3}>
          {chart.value}
        </text>
        {chart.unit ? (
          <text className="acr-kbd-inst-unit" x={cx} y={numberY + 1.7}>
            {chart.unit}
          </text>
        ) : null}
      </g>
      <g className="acr-kbd-inst-text">
        {segs.map((seg, j) => {
          const y = y0 + 7.6 + j * 3.1
          return (
            <g key={seg.id} className="acr-kbd-inst-row" data-j={j} {...hover(j, seg)}>
              <rect className="acr-kbd-inst-swatch" data-j={j} x={x0 + 2 + PANEL.inst + 1.5} y={y - 0.6} width="1.2" height="1.2" style={{ "--seg": SEG_PRESENCE[j] } as React.CSSProperties} />
              <text className="acr-kbd-inst-name" x={x0 + 2 + PANEL.inst + 3.6} y={y}>
                {seg.label}
              </text>
              <text className="acr-kbd-inst-num" x={x0 + PANEL.w - 2} y={y}>
                {seg.display ?? seg.value}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}

function AcrylicKeyboard({ logo, modules, data = [], rows, charts = [], core, readout, legend, label = "Muriki", className }: AcrylicKeyboardProps) {
  const phase = useAcrylicPhase()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const voiceRef = React.useRef<SVGPathElement>(null)
  const [active, setActive] = React.useState<AcrylicKey | null>(null)
  const [hint, setHint] = React.useState<string | null>(null)
  const [coreHot, setCoreHot] = React.useState(false)
  const [listening, setListening] = React.useState(false)
  const listeningRef = React.useRef(false)
  listeningRef.current = listening
  const maskId = React.useId()

  const modStep = (MODULES_SPAN[1] - MODULES_SPAN[0]) / Math.max(modules.length, 1)
  const datStep = (DATA_SPAN[1] - DATA_SPAN[0]) / Math.max(data.length, 1)
  const actions = rows.flat()

  // O voo: mede na hora, porque a órbita gira e a tecla só está no lugar
  // depois que o reator atracou e o leque abriu. O delta medido na tela
  // é levado para o referencial girado da tecla (data-rot).
  React.useEffect(() => {
    const svg = svgRef.current
    if (phase !== "open" || !svg) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t0 = parseFloat(getComputedStyle(svg.parentElement as Element).getPropertyValue("--acr-kbd-t0")) || 650
    const timers: number[] = []
    const launch = (id: string) => {
      const target = svg.querySelector<SVGGElement>(`[data-icon="${id}"]`)
      if (!target) return
      const orb = svg.querySelector<SVGGElement>(`[data-orbiter="${id}"]`)
      if (orb) {
        const box = svg.getBoundingClientRect()
        const k = 200 / box.width
        const a = orb.getBoundingClientRect()
        const b = target.getBoundingClientRect()
        const dx = (a.left + a.width / 2 - (b.left + b.width / 2)) * k
        const dy = (a.top + a.height / 2 - (b.top + b.height / 2)) * k
        const rot = (-(Number(target.dataset.rot) || 0) * Math.PI) / 180
        const lx = dx * Math.cos(rot) - dy * Math.sin(rot)
        const ly = dx * Math.sin(rot) + dy * Math.cos(rot)
        target.style.setProperty("--dx", `${lx.toFixed(2)}px`)
        target.style.setProperty("--dy", `${ly.toFixed(2)}px`)
        orb.classList.add("is-gone")
      }
      target.classList.add("is-flying")
    }
    modules.forEach((m) => timers.push(window.setTimeout(() => launch(m.id), t0 + 830)))
    actions.forEach((k, i) => timers.push(window.setTimeout(() => launch(k.id), t0 + 1350 + i * 35)))
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      svg.querySelectorAll(".is-flying, .is-gone").forEach((el) => el.classList.remove("is-flying", "is-gone"))
      svg.querySelectorAll<SVGElement>("[data-icon]").forEach((el) => {
        el.style.removeProperty("--dx")
        el.style.removeProperty("--dy")
      })
    }
  }, [phase, modules, actions])

  // A voz: só existe ouvindo; vibra como voz.
  React.useEffect(() => {
    const path = voiceRef.current
    if (!path || !listening) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = (now - start) / 1000
      const amp = 1.1 * (0.55 + 0.45 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1)))
      path.setAttribute("d", voicePath(still ? 0 : t, amp))
      if (!still) raf = window.requestAnimationFrame(frame)
    }
    raf = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(raf)
  }, [listening])

  const ticks = React.useMemo(() => {
    const out: { key: number; d: string; major: boolean }[] = []
    // A RÉGUA É DENSA, como a do Stark: tick a cada 2°, maior a cada 10°,
    // numa faixa fechada por dois trilhos — o de dentro é o rail, o de
    // fora é a própria aresta do cluster.
    for (let a = RULER_SPAN[0]; a <= RULER_SPAN[1]; a += 2) {
      const major = Math.round((a - RULER_SPAN[0]) / 2) % 5 === 0
      const [x1, y1] = polar(CORE, RULER_R - (major ? 1.25 : 0.55), a)
      const [x2, y2] = polar(CORE, RULER_R + (major ? 0.75 : 0.45), a)
      out.push({ key: a, d: `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`, major })
    }
    return out
  }, [])

  function toggleListening() {
    const next = !listening
    setListening(next)
    core?.onSelect?.(next)
  }

  const readoutText =
    hint ?? (listening ? (core?.listeningLabel ?? "ouvindo…") : active ? (active.detail ?? active.label) : coreHot && core ? (core.detail ?? core.label) : (readout ?? ""))

  return (
    <nav
      data-slot="acrylic-keyboard"
      aria-label={label}
      className={cn("acr-kbd", className)}
      data-listening={listening || undefined}
    >
      <svg ref={svgRef} className="acr-kbd-svg" viewBox="0 0 200 100">
        <defs>
          <mask id={maskId}>
            <rect x="-20" y="-20" width="240" height="140" fill="white" />
            <circle cx={CORE[0]} cy={CORE[1]} r={EDGE_R} fill="black" />
          </mask>
        </defs>

        {legend ? (
          <text className="acr-kbd-legend" x="2.5" y="3">
            {legend}
          </text>
        ) : null}

        <g className="acr-kbd-ticks" aria-hidden>
          {ticks.map((t) => (
            <path key={t.key} className={cn("acr-kbd-tick", t.major && "acr-kbd-tick--major")} d={t.d} />
          ))}
        </g>
        <path className="acr-kbd-edge acr-kbd-edge--static acr-kbd-rail" d={arcPath(CORE, RULER_R - 1.7, RULER_SPAN[0], RULER_SPAN[1])} aria-hidden />
        <path className="acr-kbd-edge" d={arcPath(CORE, EDGE_R, RULER_SPAN[0], RULER_SPAN[1])} pathLength={1} style={{ "--e": 0 } as React.CSSProperties} />
        <circle className="acr-kbd-seat" cx={CORE[0]} cy={CORE[1]} r={MODULES_R[0] - 2.5} aria-hidden />
        <path className="acr-kbd-sweep" d={arcPath(CORE, RULER_R, -96, -84)} aria-hidden />

        {/* a órbita do boot */}
        <g className="acr-kbd-orbit" aria-hidden>
          <g className="acr-kbd-orbit-ring" style={{ "--acr-orbit-speed": "9s" } as React.CSSProperties}>
            {modules.map((m, i) => {
              const [x, y] = polar(CORE, ORBIT_R[0], -90 + (i * 360) / Math.max(modules.length, 1))
              return m.icon ? <Icon key={m.id} id={m.id} icon={m.icon} x={x} y={y} size={2.2} orbiter /> : null
            })}
          </g>
          <g className="acr-kbd-orbit-ring acr-kbd-orbit-ring--reverse" style={{ "--acr-orbit-speed": "15s" } as React.CSSProperties}>
            {actions.map((k, i) => {
              const [x, y] = polar(CORE, ORBIT_R[1], -90 + (i * 360) / Math.max(actions.length, 1))
              return k.icon ? <Icon key={k.id} id={k.id} icon={k.icon} x={x} y={y} size={1.8} orbiter /> : null
            })}
          </g>
        </g>

        {/* anel de dentro: módulos — a escrita segue o arco */}
        <g className="acr-kbd-ring acr-kbd-ring--modules" style={{ "--ring": 0 } as React.CSSProperties}>
          {modules.map((item, i) => {
            const a0 = MODULES_SPAN[0] + i * modStep + 0.6
            const a1 = a0 + modStep - 1.2
            const mid = (a0 + a1) / 2
            const [px, py] = polar(CORE, (MODULES_R[0] + MODULES_R[1]) / 2, mid)
            const rot = ctangent(mid)
            const c = modules.length - 1
            const style = { "--i": i, "--c": c, "--step": `${modStep}deg`, "--d": c - i } as React.CSSProperties
            const d = sectorPath(CORE, MODULES_R[0], MODULES_R[1], a0, a1)
            return (
              <KeyShell key={item.id} item={item} className="acr-kbd-key acr-kbd-key--arc" style={style} onActive={setActive}>
                <path className="acr-kbd-face" d={d} pathLength={1} />
                <path className="acr-kbd-run" d={d} pathLength={1} aria-hidden />
                <g className="acr-kbd-face-content" transform={`rotate(${rot.toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})`}>
                  {item.icon ? <Icon id={item.id} icon={item.icon} x={px} y={py - 1.9} size={2.8} rot={rot} /> : null}
                  <text className="acr-kbd-label" x={px} y={py + 2.2}>
                    {item.short ?? item.label}
                  </text>
                </g>
              </KeyShell>
            )
          })}
        </g>

        {/* anel de fora: dados */}
        <g className="acr-kbd-ring acr-kbd-ring--data" style={{ "--ring": 1 } as React.CSSProperties} aria-hidden>
          {data.map((cell, i) => {
            const a0 = DATA_SPAN[0] + i * datStep + 0.5
            const a1 = a0 + datStep - 1
            const mid = (a0 + a1) / 2
            const [px, py] = polar(CORE, (DATA_R[0] + DATA_R[1]) / 2, mid)
            const rot = ctangent(mid)
            const c = data.length - 1
            const style = { "--i": i, "--c": c, "--step": `${datStep}deg`, "--d": c - i } as React.CSSProperties
            return (
              <g key={cell.id} className="acr-kbd-key acr-kbd-key--arc" style={style}>
                <path className="acr-kbd-face" d={sectorPath(CORE, DATA_R[0], DATA_R[1], a0, a1)} pathLength={1} />
                <g className="acr-kbd-face-content" transform={`rotate(${rot.toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})`}>
                  {cell.icon ? (
                    // ícone ao lado do valor; a largura do valor é estimada pelo mono (0,62 em)
                    <>
                      <text className="acr-kbd-cell-label" x={px} y={py - 1.6}>
                        {cell.label}
                      </text>
                      <g className="acr-kbd-cell-icon">
                        <svg className="acr-kbd-icon" x={px - (2.9 + cell.value.length * 1.12) / 2} y={py + 0.3} width={2.2} height={2.2} viewBox="0 0 16 16">
                          {cell.icon}
                        </svg>
                      </g>
                      <text className="acr-kbd-cell-value" x={px - (2.9 + cell.value.length * 1.12) / 2 + 2.9} y={py + 1.4} style={{ textAnchor: "start" }}>
                        {cell.value}
                      </text>
                    </>
                  ) : (
                    <>
                      <text className="acr-kbd-cell-label" x={px} y={py - 1.2}>
                        {cell.label}
                      </text>
                      <text className="acr-kbd-cell-value" x={px} y={py + 1.3}>
                        {cell.value}
                      </text>
                    </>
                  )}
                </g>
              </g>
            )
          })}
        </g>

        {/* as fileiras: a volta do teclado, nascendo no cluster */}
        <g className="acr-kbd-rows" mask={`url(#${maskId})`}>
          {rows.map((row, r) => {
            const [ry0, ry1] = ROW_RY[r] ?? ROW_RY[ROW_RY.length - 1]
            const ryMid = (ry0 + ry1) / 2
            const [from, to] = rowSpan(ryMid, ROW_START_GAP)
            const arcs = keyArcs(ryMid, from, to, row, ROW_KEY_GAP)
            return (
              <g key={r}>
                {row.map((item, i) => {
                  const [a0, a1] = arcs[i]
                  const mid = (a0 + a1) / 2
                  const [px, py] = epoint(ryMid, mid)
                  const rot = etangent(ryMid, mid)
                  const style = { "--row": r, "--i": i } as React.CSSProperties
                  const d = esectorPath(ry0, ry1, a0, a1)
                  return (
                    <KeyShell key={item.id} item={item} className="acr-kbd-key acr-kbd-key--row" style={style} onActive={setActive}>
                      <path className="acr-kbd-face" d={d} pathLength={1} />
                      <path className="acr-kbd-run" d={d} pathLength={1} aria-hidden />
                      <g className="acr-kbd-face-content" transform={`rotate(${rot.toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})`}>
                        {/* só ícone, no centro; o nome aparece embaixo no hover, e o ícone sobe para dar lugar */}
                        {item.icon ? <Icon id={item.id} icon={item.icon} x={px} y={py - 0.3} size={3.6} rot={rot} /> : null}
                        <text className="acr-kbd-sublabel" x={px} y={py + 3.4}>
                          {item.short ?? item.label}
                        </text>
                      </g>
                    </KeyShell>
                  )
                })}
              </g>
            )
          })}
          {/* as arestas nascem DENTRO do círculo; a máscara corta exatamente na linha dele — encostam.
              E passam do palco (EDGE_REACH): a de baixo encontra o círculo abaixo de y=100, as duas
              chegam à borda da tela pela direita. */}
          <path className="acr-kbd-edge acr-kbd-edge--static" d={earcPath(ROW_RY[0][1] + 2.5, ...rowSpan(ROW_RY[0][1] + 2.5, -2, EDGE_REACH))} />
          <path className="acr-kbd-edge acr-kbd-edge--static" d={earcPath(ROW_RY[Math.min(rows.length, ROW_RY.length) - 1][0] - 2.5, ...rowSpan(ROW_RY[Math.min(rows.length, ROW_RY.length) - 1][0] - 2.5, -2, EDGE_REACH))} />
        </g>

        {/* os instrumentos: a fileira do topo e a de baixo */}
        {panelSlots(charts).map(({ chart, x0, y0 }, i) => (
          <Instrument key={chart.id} chart={chart} index={i} x0={x0} y0={y0} onHint={setHint} />
        ))}

        {/* a voz do logo */}
        <path ref={voiceRef} className="acr-kbd-voice" d={voicePath(0, 0)} aria-hidden />
      </svg>


      {core ? (
        <button
          type="button"
          className="acr-kbd-core-button"
          aria-label={core.label}
          aria-pressed={listening}
          onClick={toggleListening}
          onMouseEnter={() => setCoreHot(true)}
          onMouseLeave={() => setCoreHot(false)}
          onFocus={() => setCoreHot(true)}
          onBlur={() => setCoreHot(false)}
        />
      ) : null}
      <AcrylicHudCore logo={logo} />
      <p className="acr-kbd-readout" aria-live="polite">
        {readoutText}
      </p>
    </nav>
  )
}

export { AcrylicKeyboard }
