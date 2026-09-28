"use client"

// O mapa da trilha (design/muriki-code/aprender.py, _mapa_svg): parado, sem animação, para a
// pessoa entender onde está. Curvas de nível ao fundo, as regiões (os módulos) em retângulos
// tracejados no tom da marca, o caminho feito cheio até a etapa de agora e o que falta pontilhado,
// as estações (feita com o check, a de agora com o halo e o balão "você está aqui", as próximas
// vazadas com o número) e a bandeira amarela nos marcos de nível.
//
// As estações se posicionam sozinhas para qualquer quantidade: distribuídas na largura, alternando
// alto e baixo, com o nome em cima das altas e embaixo das baixas, para dois nomes vizinhos nunca
// ficarem na mesma linha. A de agora fica na altura do meio, com o nome embaixo e o balão em cima.
// O nome longo é cortado com reticências pela distância até a próxima estação da mesma linha; o
// nome inteiro vai no aria-label e na lista para o leitor de tela.
//
// SVG próprio, sem biblioteca, falando a língua do tema pelos tokens (claro e escuro).
//
// Acessibilidade: sem `onStepClick`, o SVG é uma imagem com o `ariaLabel`, e uma lista oculta
// descreve cada etapa. Com ele, cada estação é um botão (tabindex itinerante, setas andam) com o
// aria-label "3. Converter duração… — feita, nota C".
//
// `size="mini"` é o mesmo mapa em miniatura (aprender.py, _minimapa), para os cartões do topo de
// Trilhas: sem nomes nem metas, as regiões só como retângulos, estações pequenas, bandeiras menores e
// um balão só — "você está aqui" na etapa de agora, ou "comece aqui" quando nada foi feito ainda.
// Com `href` ou `render`, o mini inteiro vira o link para o mapa.
//
// `orientation="vertical"` é o mapa do celular (design/muriki-code/movel_code.py, _mapa_vertical): o
// caminho desce em zigue-zague numa faixa estreita à esquerda e os nomes ficam todos numa coluna à
// direita, na altura de cada estação, para o caminho nunca passar por cima deles; as regiões viram
// blocos na largura toda, com o rótulo no canto de cima à direita e um respiro entre uma e outra.
// Os nomes quebram linha (são HTML por cima do SVG). `"auto"` fica vertical quando o contêiner tem
// menos de 560px. O mini é sempre horizontal.
import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type TrailMapStepState = "done" | "now" | "later"

export interface TrailMapStep {
  title: string
  /** A linha de baixo, já formatada: "nota B+", "25 min". */
  meta?: string
  state: TrailMapStepState
  /** O marco de nível desta estação, ex.: "confirma Pleno": a bandeira e uma 3ª linha no nome. */
  milestone?: string
}

export interface TrailMapRegion {
  label: string
  /** Índices das etapas, inclusivos. */
  from: number
  to: number
}

export interface TrailMapProps {
  steps: TrailMapStep[]
  /** Os módulos: um retângulo tracejado em volta das etapas de `from` a `to`. */
  regions?: TrailMapRegion[]
  /** O balão da etapa de agora. Sem isto, vem do i18n (trail_map.here). */
  hereLabel?: string
  /** O resumo para o leitor de tela, ex.: "Testes que dão confiança: 3 de 8 etapas feitas". */
  ariaLabel: string
  /** Com isto, cada estação vira um botão. Só no tamanho padrão. */
  onStepClick?: (index: number) => void
  /** "mini": o minimapa dos cartões, sem nomes, com um balão só. */
  size?: "default" | "mini"
  /** "vertical": o mapa do celular. "auto": vertical abaixo de 560px de contêiner. Só no tamanho padrão. */
  orientation?: "horizontal" | "vertical" | "auto"
  /** No mini, o balão quando nada foi feito e a de agora é a primeira. Sem isto, trail_map.start. */
  startLabel?: string
  /** No mini, o destino do link ("Ver o mapa"): um <a href>. */
  href?: string
  /** No mini, o elemento que navega, ex.: <Link to="/trilhas/$id" />. Ganha de `href`. */
  render?: ReactElement
  className?: string
}

const W = 1100
const H = 360
const MARGEM = 80
const ALTO = 140
const BAIXO = 250
const MEIO = 195
const LETRA = 6.4 // largura média de um caractere a 12px, para cortar o nome com reticências

type Ponto = [number, number]

function curva(ps: Ponto[]) {
  if (ps.length < 2) return ""
  let d = `M${ps[0][0]},${ps[0][1]}`
  for (let a = 0; a < ps.length - 1; a++) {
    const p0 = ps[a - 1] ?? ps[a]
    const p1 = ps[a]
    const p2 = ps[a + 1]
    const p3 = ps[a + 2] ?? p2
    const c1: Ponto = [p1[0] + (p2[0] - p0[0]) / 5, p1[1] + (p2[1] - p0[1]) / 5]
    const c2: Ponto = [p2[0] - (p3[0] - p1[0]) / 5, p2[1] - (p3[1] - p1[1]) / 5]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`
  }
  return d
}

function cortar(texto: string, largura: number) {
  const max = Math.max(6, Math.floor(largura / LETRA))
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto
}

export function TrailMap(props: TrailMapProps) {
  if (props.size === "mini") return <TrailMapMini {...props} />
  if (props.orientation === "vertical") return <TrailMapVertical {...props} />
  if (props.orientation === "auto") return <TrailMapAuto {...props} />
  return <TrailMapDefault {...props} />
}

const LIMITE_AUTO = 560

function TrailMapAuto(props: TrailMapProps) {
  // mede o próprio contêiner: um mapa num painel estreito também vira vertical
  const ref = useRef<HTMLDivElement>(null)
  const [estreito, setEstreito] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([e]) => setEstreito(e.contentRect.width < LIMITE_AUTO))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className={cn("w-full min-w-0", props.className)}>
      {estreito ? <TrailMapVertical {...props} className={undefined} /> : <TrailMapDefault {...props} className={undefined} />}
    </div>
  )
}

/** A descrição de cada estação e o foco itinerante: setas, Home, End e Enter. */
function useEstacoes(steps: TrailMapStep[], onStepClick?: (index: number) => void) {
  const t = useTranslate()
  const n = steps.length
  const atual = steps.findIndex((s) => s.state === "now")
  const estado = (s: TrailMapStep) =>
    s.state === "done" ? t("trail_map.done") : s.state === "now" ? t("trail_map.now") : t("trail_map.later")
  const descricao = (s: TrailMapStep, i: number) =>
    `${i + 1}. ${s.title} — ${estado(s)}${s.meta ? `, ${s.meta}` : ""}${s.milestone ? `, ${s.milestone}` : ""}`
  const [foco, setFoco] = useState(Math.max(0, atual))
  const refs = useRef<(SVGGElement | null)[]>([])
  const mover = (e: KeyboardEvent, i: number) => {
    const alvo = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null
    if (alvo === null) {
      if ((e.key === "Enter" || e.key === " ") && onStepClick) {
        e.preventDefault()
        onStepClick(i)
      }
      return
    }
    e.preventDefault()
    const j = Math.min(n - 1, Math.max(0, alvo))
    setFoco(j)
    refs.current[j]?.focus()
  }
  // as props da estação: botão com tabindex itinerante, ou só desenho
  const estacao = (i: number) =>
    onStepClick
      ? {
          ref: (el: SVGGElement | null) => {
            refs.current[i] = el
          },
          role: "button" as const,
          tabIndex: i === foco ? 0 : -1,
          "aria-label": descricao(steps[i], i),
          onClick: () => onStepClick(i),
          onKeyDown: (e: KeyboardEvent) => mover(e, i),
          onFocus: () => setFoco(i),
          className: "cursor-pointer outline-none [&:focus-visible>.foco]:opacity-100",
        }
      : { "aria-hidden": true as const }
  return { atual, descricao, estacao }
}

function TrailMapDefault({ steps, regions = [], hereLabel, ariaLabel, onStepClick, className }: TrailMapProps) {
  const t = useTranslate()
  const aqui = hereLabel ?? t("trail_map.here")
  const n = steps.length
  const passo = n > 1 ? (W - 2 * MARGEM) / (n - 1) : 0
  // alterna baixo/alto; a de agora vai para o meio
  const pontos: Ponto[] = steps.map((s, i) => [
    n > 1 ? MARGEM + i * passo : W / 2,
    s.state === "now" ? MEIO : i % 2 === 0 ? BAIXO : ALTO,
  ])
  const emCima = steps.map((s, i) => s.state !== "now" && i % 2 === 1)
  const atual = steps.findIndex((s) => s.state === "now")
  const ultimaFeita = steps.reduce((acc, s, i) => (s.state === "done" ? i : acc), -1)
  const fimFeito = atual >= 0 ? atual : ultimaFeita
  // dois nomes na mesma linha ficam a duas estações de distância
  const larguraNome = n > 2 ? passo * 2 - 16 : W - 2 * MARGEM

  const { descricao, estacao } = useEstacoes(steps, onStepClick)

  const halo = { paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 4, strokeLinejoin: "round" } as const

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role={onStepClick ? "group" : "img"}
        aria-label={ariaLabel}
        className="block h-auto overflow-visible"
      >
        {/* curvas de nível */}
        {[40, 110, 180, 250, 320].map((y) => (
          <path
            key={y}
            d={`M-20,${y} C220,${y - 40} 420,${y + 45} 640,${y - 10} S980,${y - 45} 1120,${y - 15}`}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={1}
            opacity={0.8}
          />
        ))}

        {/* as regiões: da metade do vão antes da primeira etapa à metade do vão depois da última */}
        {regions.map((r) => {
          const a = pontos[Math.max(0, r.from)]
          const b = pontos[Math.min(n - 1, r.to)]
          if (!a || !b) return null
          // com poucas etapas o vão é largo: a região não passa da borda do mapa
          const meio = passo ? Math.min(passo / 2 - 6, MARGEM - 12) : 60
          const x = Math.max(12, a[0] - meio)
          const w = Math.min(W - 12, b[0] + meio) - x
          return (
            <g key={`${r.label}-${r.from}`} aria-hidden>
              <rect
                x={x}
                y={60}
                width={w}
                height={285}
                rx={40}
                fill="color-mix(in oklch, var(--primary) 5%, transparent)"
                stroke="color-mix(in oklch, var(--primary) 20%, transparent)"
                strokeDasharray="2 6"
              />
              <text
                x={x + 24}
                y={331}
                fill="var(--muted-foreground)"
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}
              >
                {cortar(r.label, w - 48)}
              </text>
            </g>
          )
        })}

        {/* o caminho: um filete do card por baixo, o que falta pontilhado e o feito cheio por cima */}
        <g aria-hidden>
          <path d={curva(pontos)} fill="none" stroke="var(--card)" strokeWidth={10} strokeLinecap="round" />
          <path
            d={curva(pontos.slice(Math.max(0, fimFeito)))}
            fill="none"
            stroke="var(--input)"
            strokeWidth={2.5}
            strokeDasharray="1 7"
            strokeLinecap="round"
          />
          {fimFeito > 0 ? (
            <path d={curva(pontos.slice(0, fimFeito + 1))} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" />
          ) : null}
        </g>

        {steps.map((s, i) => {
          const [x, y] = pontos[i]
          const linhas: { texto: string; estilo: CSSProperties; mono?: boolean }[] = [
            {
              texto: cortar(s.title, larguraNome),
              estilo: {
                fill: s.state === "later" ? "var(--muted-foreground)" : "var(--foreground-strong)",
                fontSize: 12,
                fontWeight: s.state === "now" ? 600 : 500,
              },
            },
          ]
          if (s.meta) linhas.push({ texto: s.meta, estilo: { fill: "var(--muted-foreground)", fontSize: 10.5 }, mono: true })
          if (s.milestone) linhas.push({ texto: cortar(s.milestone, larguraNome), estilo: { fill: "var(--foreground-strong)", fontSize: 11, fontWeight: 600 } })
          const base = emCima[i] ? y - 30 - 15 * (linhas.length - 1) : y + (s.state === "now" ? 46 : 32)
          const interativo = Boolean(onStepClick)
          return (
            <g key={i} {...estacao(i)}>
              {interativo ? (
                <circle className="foco" cx={x} cy={y} r={s.state === "now" ? 20 : 18} fill="none" stroke="var(--ring)" strokeWidth={2} opacity={0} />
              ) : null}
              {s.state === "done" ? (
                <>
                  <circle cx={x} cy={y} r={13} fill="var(--primary)" />
                  <path
                    d={`M${x - 5},${y} l3.5,3.5 l6.5,-7`}
                    fill="none"
                    stroke="var(--primary-foreground)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : s.state === "now" ? (
                <>
                  <circle cx={x} cy={y} r={30} fill="color-mix(in oklch, var(--primary) 9%, transparent)" />
                  <circle cx={x} cy={y} r={21} fill="color-mix(in oklch, var(--primary) 15%, transparent)" />
                  <circle cx={x} cy={y} r={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
                  <text x={x} y={y + 4} textAnchor="middle" fill="var(--primary)" className="font-mono" style={{ fontSize: 11, fontWeight: 600 }}>
                    {i + 1}
                  </text>
                </>
              ) : (
                <>
                  <circle cx={x} cy={y} r={11} fill="var(--card)" stroke="var(--input)" strokeWidth={1.5} />
                  <text x={x} y={y + 4} textAnchor="middle" fill="var(--muted-foreground)" className="font-mono" style={{ fontSize: 10.5 }}>
                    {i + 1}
                  </text>
                </>
              )}
              {s.milestone ? (
                // a bandeira do marco, presa na estação
                <g transform={`translate(${x + 14},${y + 6})`}>
                  <path d="M0,0 V-22" stroke="var(--foreground-strong)" strokeWidth={1.4} />
                  <path
                    d="M0,-22 h14 l-3.5,5 l3.5,5 h-14 z"
                    fill="var(--accent)"
                    stroke="var(--foreground-strong)"
                    strokeWidth={1.1}
                    strokeLinejoin="round"
                  />
                </g>
              ) : null}
              {linhas.map((l, j) => (
                <text key={j} x={x} y={base + 15 * j} textAnchor="middle" className={l.mono ? "font-mono" : undefined} style={{ ...l.estilo, ...halo }}>
                  {l.texto}
                </text>
              ))}
              <title>{descricao(s, i)}</title>
            </g>
          )
        })}

        {atual >= 0 ? (
          <g aria-hidden transform={`translate(${pontos[atual][0]},${pontos[atual][1] - 44})`}>
            <rect x={-(aqui.length * 3.6 + 16)} y={-26} width={aqui.length * 7.2 + 32} height={24} rx={12} fill="var(--foreground-strong)" />
            <text x={0} y={-10} textAnchor="middle" fill="var(--background)" style={{ fontSize: 11.5, fontWeight: 600 }}>
              {aqui}
            </text>
            <path d="M-6,-2 l6,7 l6,-7 z" fill="var(--foreground-strong)" />
          </g>
        ) : null}
      </svg>

      {onStepClick ? null : (
        <ol className="sr-only">
          {steps.map((s, i) => (
            <li key={i}>{descricao(s, i)}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

// o mapa vertical num quadro de 358 de largura: as estações descem num zigue-zague curto na faixa da
// esquerda (46 ↔ 104) e os nomes começam em 140, na altura de cada estação
const VW = 358
const V_X = [46, 104]
const V_Y0 = 76
const V_PASSO = 106
const V_ENTRE = 28 // o respiro a mais entre uma região e a seguinte
const V_NOMES = 140

function TrailMapVertical({ steps, regions = [], hereLabel, ariaLabel, onStepClick, className }: TrailMapProps) {
  const t = useTranslate()
  const aqui = hereLabel ?? t("trail_map.here")
  const n = steps.length
  const { atual, descricao, estacao } = useEstacoes(steps, onStepClick)
  const inicioRegiao = new Set(regions.slice(1).map((r) => r.from))
  const pontos: Ponto[] = []
  let y = V_Y0
  steps.forEach((_, i) => {
    if (i) y += V_PASSO + (inicioRegiao.has(i) ? V_ENTRE : 0)
    pontos.push([V_X[i % 2], y])
  })
  const VH = (pontos[n - 1]?.[1] ?? V_Y0) + 70
  const ultimaFeita = steps.reduce((acc, s, i) => (s.state === "done" ? i : acc), -1)
  const fimFeito = atual >= 0 ? atual : ultimaFeita
  // posição em % do quadro: o SVG escala com a largura e os textos vão junto
  const pos = (px: number, py: number): CSSProperties => ({ left: `${(px / VW) * 100}%`, top: `${(py / VH) * 100}%` })

  return (
    <div className={cn("relative w-full min-w-0", className)} style={{ aspectRatio: `${VW} / ${VH}` }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height="100%"
        role={onStepClick ? "group" : "img"}
        aria-label={ariaLabel}
        className="absolute inset-0 block overflow-visible"
      >
        {/* as regiões: blocos na largura toda, de um pouco acima da primeira etapa a um pouco abaixo da última */}
        {regions.map((r) => {
          const a = pontos[Math.max(0, r.from)]
          const b = pontos[Math.min(n - 1, r.to)]
          if (!a || !b) return null
          const y0 = Math.max(4, a[1] - 62)
          return (
            <rect
              key={`${r.label}-${r.from}`}
              aria-hidden
              x={4}
              y={y0}
              width={VW - 8}
              height={b[1] + 40 - y0}
              rx={26}
              fill="color-mix(in oklch, var(--primary) 5%, transparent)"
              stroke="color-mix(in oklch, var(--primary) 20%, transparent)"
              strokeDasharray="2 6"
            />
          )
        })}

        <g aria-hidden>
          <path d={curva(pontos)} fill="none" stroke="var(--card)" strokeWidth={10} strokeLinecap="round" />
          <path
            d={curva(pontos.slice(Math.max(0, fimFeito)))}
            fill="none"
            stroke="var(--input)"
            strokeWidth={2.5}
            strokeDasharray="1 7"
            strokeLinecap="round"
          />
          {fimFeito > 0 ? (
            <path d={curva(pontos.slice(0, fimFeito + 1))} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" />
          ) : null}
        </g>

        {steps.map((s, i) => {
          const [x, yy] = pontos[i]
          return (
            <g key={i} {...estacao(i)}>
              {onStepClick ? (
                <circle className="foco" cx={x} cy={yy} r={s.state === "now" ? 20 : 18} fill="none" stroke="var(--ring)" strokeWidth={2} opacity={0} />
              ) : null}
              {s.state === "done" ? (
                <>
                  <circle cx={x} cy={yy} r={14} fill="var(--primary)" />
                  <path
                    d={`M${x - 5.5},${yy} l3.8,3.8 l7,-7.5`}
                    fill="none"
                    stroke="var(--primary-foreground)"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : s.state === "now" ? (
                <>
                  <circle cx={x} cy={yy} r={30} fill="color-mix(in oklch, var(--primary) 9%, transparent)" />
                  <circle cx={x} cy={yy} r={21} fill="color-mix(in oklch, var(--primary) 15%, transparent)" />
                  <circle cx={x} cy={yy} r={15} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
                  <text x={x} y={yy + 4} textAnchor="middle" fill="var(--primary)" className="font-mono" style={{ fontSize: 12, fontWeight: 600 }}>
                    {i + 1}
                  </text>
                </>
              ) : (
                <>
                  <circle cx={x} cy={yy} r={12} fill="var(--card)" stroke="var(--input)" strokeWidth={1.5} />
                  <text x={x} y={yy + 4} textAnchor="middle" fill="var(--muted-foreground)" className="font-mono" style={{ fontSize: 11 }}>
                    {i + 1}
                  </text>
                </>
              )}
              {s.milestone ? (
                <g transform={`translate(${x + 13},${yy + 4})`}>
                  <path d="M0,0 V-24" stroke="var(--foreground-strong)" strokeWidth={1.4} />
                  <path
                    d="M0,-24 h15 l-3.5,5.5 l3.5,5.5 h-15 z"
                    fill="var(--accent)"
                    stroke="var(--foreground-strong)"
                    strokeWidth={1.1}
                    strokeLinejoin="round"
                  />
                </g>
              ) : null}
              <title>{descricao(s, i)}</title>
            </g>
          )
        })}

        {atual >= 0 ? (
          <g aria-hidden>
            <path d={`M${pontos[atual][0] - 6},${pontos[atual][1] - 42} l6,7 l6,-7 z`} fill="var(--foreground-strong)" />
          </g>
        ) : null}
      </svg>

      {/* os textos em HTML por cima do SVG: quebram linha e não dependem da escala */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {regions.map((r) => {
          const a = pontos[Math.max(0, r.from)]
          if (!a) return null
          return (
            <span
              key={`${r.label}-${r.from}`}
              className="absolute -translate-x-full -translate-y-1/2 font-mono text-[9.5px] tracking-[0.18em] whitespace-nowrap text-muted-foreground uppercase"
              style={pos(VW - 20, Math.max(4, a[1] - 62) + 16)}
            >
              {r.label}
            </span>
          )
        })}
        {steps.map((s, i) => (
          <span
            key={i}
            className="absolute -translate-y-1/2 [text-shadow:0_0_3px_var(--card),0_0_3px_var(--card),0_0_3px_var(--card)]"
            style={{ ...pos(V_NOMES, pontos[i][1]), width: `${((VW - V_NOMES - 14) / VW) * 100}%` }}
          >
            <span
              className={cn(
                "block text-[13px] leading-[17px]",
                s.state === "now" ? "font-semibold" : "font-medium",
                s.state === "later" ? "text-muted-foreground" : "text-foreground-strong"
              )}
            >
              {s.title}
            </span>
            {s.meta ? <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{s.meta}</span> : null}
            {s.milestone ? <span className="mt-0.5 block text-[11.5px] font-semibold text-foreground-strong">{s.milestone}</span> : null}
          </span>
        ))}
        {atual >= 0 ? (
          <span
            className="absolute flex h-6 -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-foreground-strong px-3.5 text-[11.5px] font-semibold whitespace-nowrap text-background"
            style={pos(pontos[atual][0], pontos[atual][1] - 54)}
          >
            {aqui}
          </span>
        ) : null}
      </div>

      {onStepClick ? null : (
        <ol className="sr-only">
          {steps.map((s, i) => (
            <li key={i}>{descricao(s, i)}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

const MW = 420
const MH = 140
const M_MARGEM = 22
const M_ALTO = 60
const M_BAIXO = 104

function TrailMapMini({ steps, regions = [], hereLabel, startLabel, ariaLabel, href, render, className }: TrailMapProps) {
  const t = useTranslate()
  const n = steps.length
  const passo = n > 1 ? (MW - 2 * M_MARGEM) / (n - 1) : 0
  const pontos: Ponto[] = steps.map((_, i) => [n > 1 ? M_MARGEM + i * passo : MW / 2, i % 2 === 0 ? M_BAIXO : M_ALTO])
  const atual = steps.findIndex((s) => s.state === "now")
  const feitas = steps.filter((s) => s.state === "done").length
  const ultimaFeita = steps.reduce((acc, s, i) => (s.state === "done" ? i : acc), -1)
  const fimFeito = atual >= 0 ? atual : ultimaFeita
  const comeco = feitas === 0 && atual === 0
  const balao = comeco ? (startLabel ?? t("trail_map.start")) : (hereLabel ?? t("trail_map.here"))
  const resumo = `${ariaLabel} · ${t("trail_map.summary", { done: feitas, total: n })}`

  // o balão cabe dentro do mapa: encosta na borda em vez de sair
  const alvo = atual >= 0 ? pontos[atual] : null
  const larguraBalao = balao.length * 6.2 + 24
  const xBalao = alvo ? Math.min(Math.max(alvo[0] - larguraBalao / 2, 2), MW - larguraBalao - 2) : 0

  const mapa = (
    <svg viewBox={`0 0 ${MW} ${MH}`} width="100%" role="img" aria-label={resumo} className="block h-auto">
      {regions.map((r) => {
        const a = pontos[Math.max(0, r.from)]
        const b = pontos[Math.min(n - 1, r.to)]
        if (!a || !b) return null
        const meio = passo ? Math.min(passo / 2 - 4, M_MARGEM - 6) : 30
        const x = Math.max(6, a[0] - meio)
        const w = Math.min(MW - 6, b[0] + meio) - x
        return (
          <rect
            key={`${r.label}-${r.from}`}
            x={x}
            y={22}
            width={w}
            height={110}
            rx={18}
            fill="color-mix(in oklch, var(--primary) 5%, transparent)"
            stroke="color-mix(in oklch, var(--primary) 18%, transparent)"
            strokeDasharray="2 5"
          />
        )
      })}
      <path d={curva(pontos)} fill="none" stroke="var(--card)" strokeWidth={6} strokeLinecap="round" />
      <path
        d={curva(pontos.slice(Math.max(0, fimFeito)))}
        fill="none"
        stroke="var(--input)"
        strokeWidth={2}
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      {fimFeito > 0 ? (
        <path d={curva(pontos.slice(0, fimFeito + 1))} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />
      ) : null}
      {steps.map((s, i) => {
        const [x, y] = pontos[i]
        return (
          <g key={i}>
            {s.state === "done" ? (
              <>
                <circle cx={x} cy={y} r={7} fill="var(--primary)" />
                <path
                  d={`M${x - 3},${y} l2,2 l4,-4.5`}
                  fill="none"
                  stroke="var(--primary-foreground)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : s.state === "now" ? (
              <>
                <circle cx={x} cy={y} r={16} fill="color-mix(in oklch, var(--primary) 12%, transparent)" />
                <circle cx={x} cy={y} r={8} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
              </>
            ) : (
              <circle cx={x} cy={y} r={5} fill="var(--card)" stroke="var(--input)" strokeWidth={1.4} />
            )}
            {s.milestone ? (
              <g transform={`translate(${x + 7},${y + 2})`}>
                <path d="M0,0 V-15" stroke="var(--foreground-strong)" strokeWidth={1.2} />
                <path
                  d="M0,-15 h9 l-2,3.5 l2,3.5 h-9 z"
                  fill="var(--accent)"
                  stroke="var(--foreground-strong)"
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </g>
            ) : null}
          </g>
        )
      })}
      {alvo ? (
        <g aria-hidden>
          <rect x={xBalao} y={alvo[1] - 38} width={larguraBalao} height={20} rx={10} fill="var(--foreground-strong)" />
          <text x={xBalao + larguraBalao / 2} y={alvo[1] - 24} textAnchor="middle" fill="var(--background)" style={{ fontSize: 10.5, fontWeight: 600 }}>
            {balao}
          </text>
          <path d={`M${alvo[0] - 4},${alvo[1] - 18} l4,5 l4,-5 z`} fill="var(--foreground-strong)" />
        </g>
      ) : null}
    </svg>
  )

  const classe = cn(
    "block w-full min-w-0 rounded-[10px] outline-none",
    (href || render) && "focus-visible:ring-2 focus-visible:ring-ring/50",
    className
  )
  if (render) return cloneElement(render as ReactElement<Record<string, unknown>>, { className: classe, children: mapa })
  if (href) return <a href={href} className={classe}>{mapa}</a>
  return <div className={classe}>{mapa}</div>
}

