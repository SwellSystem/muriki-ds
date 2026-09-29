"use client"

// O mapa da trilha: um lugar, não um circuito. Cada região (tier) é um terreno no seu tom — campo,
// colinas com árvores, montanhas, picos — com a placa na entrada; a estrada serpenteia de uma à outra,
// com o feito em azul até a etapa de agora, onde fica o Muriki com o balão; no fim, a chegada com a
// bandeira ("você chegou" quando tudo foi feito).
//
// Três formas, as mesmas peças (Estrada, DesenhoDaEstacao, Chegada, MurikiAqui):
// - o mapa horizontal: estações com o vão fixo e o nome inteiro (até duas linhas). Quando não cabe,
//   abre centrado na etapa de agora e anda só pelas setas ‹ › (nem barra, nem roda) e pelo foco;
// - `orientation="vertical"`, o do celular: a estrada desce numa faixa à esquerda e os nomes ficam
//   numa coluna à direita; `"auto"` fica vertical abaixo de 560px de contêiner;
// - `size="mini"`, o dos cartões: sem nomes, só o trecho de até 9 estações em volta da etapa de agora,
//   com a estrada saindo pela borda esmaecida. Com `href` ou `render`, vira o link para o mapa.
//
// Movimento nas classes muriki-trail-* (css do item): a estrada feita se desenha, as estações aparecem
// em sequência, o halo pulsa, o Muriki balança, as nuvens andam e a bandeira tremula. Tudo desligado
// com prefers-reduced-motion.
//
// Acessibilidade: sem `onStepClick`, o SVG é uma imagem com o `ariaLabel`, e uma lista oculta descreve
// cada etapa. Com ele, cada estação é um botão (tabindex itinerante, setas andam) com o aria-label
// "3. Converter duração… — feita, nota C".
import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react"

import { MurikiLogo } from "@/components/ui/muriki-logo"
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

// O foco numa estação nunca rola a página: o focus() vai com preventScroll, e o próprio mapa traz a
// estação para a vista — no horizontal, centrando no contêiner dele (scrollLeft); no vertical, só na
// direção de cima e de baixo. Sem isso o navegador rolava todos os ancestrais, a página junto.
function mostrarEstacao(el: SVGGElement) {
  const caixa = el.closest<HTMLElement>(".muriki-trail-scroll")
  const reduzir = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  if (caixa) {
    const r = el.getBoundingClientRect()
    const c = caixa.getBoundingClientRect()
    caixa.scrollTo({ left: caixa.scrollLeft + r.left + r.width / 2 - (c.left + c.width / 2), behavior: reduzir ? "auto" : "smooth" })
    return
  }
  const r = el.getBoundingClientRect()
  if (r.top < 0 || r.bottom > window.innerHeight) {
    window.scrollBy({ top: r.top + r.height / 2 - window.innerHeight / 2, behavior: reduzir ? "auto" : "smooth" })
  }
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
    const el = refs.current[j]
    if (el) {
      el.focus({ preventScroll: true })
      mostrarEstacao(el)
    }
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

// ── O mapa (horizontal) ─────────────────────────────────────────────────
// Um lugar, não um circuito: cada região (tier) é um terreno no seu tom — campo, colinas com árvores,
// montanhas, picos —, com a placa na entrada; o caminho é uma estrada que serpenteia de uma à outra,
// e as estações ficam espaçadas o bastante para o nome aparecer inteiro (até duas linhas). Quando não
// cabe, o mapa abre centrado na etapa de agora, com o Muriki em cima dela. No
// fim, a chegada com a bandeira. O mapa não rola na mão: as setas ‹ › andam 70% da largura, e o
// foco de uma estação (setas do teclado) a traz para a vista.
//
// Movimento (muriki-trail-*, no css do item): a estrada feita se desenha até a etapa de agora, as
// estações aparecem em sequência, o halo pulsa, o Muriki balança, as nuvens andam e a bandeira
// tremula. prefers-reduced-motion desliga tudo e deixa o desenho final.

const ALTURA = 440
const MEIO_Y = 232
const ONDA = 66
const PASSO_MIN = 164
const PASSO_MAX = 230
const BORDA = 96
const FIM = 120
const ESTRADA = 22

const TERRENOS = [
  { tom: "green", enfeite: "campo" },
  { tom: "cyan", enfeite: "arvores" },
  { tom: "blue", enfeite: "montanhas" },
  { tom: "purple", enfeite: "picos" },
] as const

// o mesmo sorteio a cada render: a paisagem não muda de lugar
function sorteio(semente: number) {
  const x = Math.sin(semente * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function Enfeite({ tipo, x, y, escala, tom }: { tipo: (typeof TERRENOS)[number]["enfeite"]; x: number; y: number; escala: number; tom: string }) {
  const cor = `var(--tone-${tom}-dot)`
  if (tipo === "campo")
    return (
      <g transform={`translate(${x},${y}) scale(${escala})`} opacity={0.5}>
        <path d="M0,0 q4,-10 8,0 M6,0 q3,-7 6,0 M-6,0 q3,-8 6,0" fill="none" stroke={cor} strokeWidth={1.6} strokeLinecap="round" />
        <circle cx={4} cy={-11} r={2.4} fill="var(--tone-yellow-dot)" opacity={0.8} />
      </g>
    )
  if (tipo === "arvores")
    return (
      <g transform={`translate(${x},${y}) scale(${escala})`}>
        <path d="M0,0 v-8" stroke={cor} strokeWidth={2} opacity={0.45} strokeLinecap="round" />
        <path d="M-9,-6 L0,-26 L9,-6 Z" fill={cor} opacity={0.32} />
        <path d="M-7,-14 L0,-32 L7,-14 Z" fill={cor} opacity={0.42} />
      </g>
    )
  if (tipo === "montanhas")
    return (
      <g transform={`translate(${x},${y}) scale(${escala})`}>
        <path d="M-30,0 L-6,-38 L6,-22 L14,-30 L34,0 Z" fill={cor} opacity={0.26} />
        <path d="M-6,-38 L-12,-28 L-4,-30 L0,-24 L4,-29 Z" fill="var(--card)" opacity={0.9} />
      </g>
    )
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <path d="M-26,0 L-2,-52 L22,0 Z" fill={cor} opacity={0.3} />
      <path d="M-2,-52 L-10,-35 L-3,-38 L2,-31 L7,-37 Z" fill="var(--card)" opacity={0.95} />
      <path d="M8,0 L24,-30 L40,0 Z" fill={cor} opacity={0.22} />
    </g>
  )
}

function Nuvem({ x, y, escala, atraso }: { x: number; y: number; escala: number; atraso: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <g className="muriki-trail-cloud" style={{ animationDelay: `${-atraso}s` }}>
        <path
          d="M0,0 h46 a10,10 0 0 0 0,-20 a14,14 0 0 0 -24,-8 a12,12 0 0 0 -20,8 a10,10 0 0 0 -2,20 z"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={1}
          opacity={0.95}
        />
      </g>
    </g>
  )
}

// o topo de um terreno: colinas suaves, uma a cada ~260px, na altura `y` com a amplitude `a`
function colinas(x: number, w: number, y: number, a: number, semente: number, fundo = ALTURA) {
  const partes = Math.max(1, Math.round(w / 260))
  const passo = w / partes
  let d = `M${x},${fundo} V${y}`
  for (let p = 0; p < partes; p++) {
    const x0 = x + p * passo
    const alto = y - a * (0.6 + sorteio(semente * 7 + p) * 0.8)
    d += ` C${x0 + passo * 0.3},${alto} ${x0 + passo * 0.7},${alto} ${x0 + passo},${y}`
  }
  return `${d} V${fundo} Z`
}


// ── As peças que os três mapas dividem ──────────────────────────────────

/** A estrada: a borda, o leito, a faixa tracejada no meio e, por cima, o feito se desenhando. */
function Estrada({ caminho, feito, largura = ESTRADA }: { caminho: string; feito: string; largura?: number }) {
  return (
    <g aria-hidden>
      <path d={caminho} fill="none" stroke="var(--border)" strokeWidth={largura + 4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={caminho} fill="none" stroke="var(--card)" strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" />
      {largura >= 14 ? (
        <path d={caminho} fill="none" stroke="var(--input)" strokeWidth={2} strokeDasharray="7 9" strokeLinecap="round" />
      ) : null}
      {feito ? (
        <path
          d={feito}
          pathLength={1}
          className="muriki-trail-draw"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={Math.max(3, largura * 0.28)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  )
}

/** A chegada: o morrinho, o mastro e a bandeira, que tremula quando a trilha acabou. */
function Chegada({ ponto, chegou, escala = 1 }: { ponto: Ponto; chegou: boolean; escala?: number }) {
  return (
    <g aria-hidden transform={`translate(${ponto[0]},${ponto[1]}) scale(${escala})`}>
      <ellipse cx={0} cy={4} rx={30} ry={9} fill={chegou ? "var(--accent)" : "var(--muted)"} opacity={chegou ? 0.5 : 1} />
      <path d="M0,4 V-54" stroke="var(--foreground-strong)" strokeWidth={2.2} strokeLinecap="round" />
      <g className={chegou ? "muriki-trail-wave" : undefined}>
        <path d="M1,-54 h30 l-7,10 l7,10 h-30 z" fill="var(--accent)" stroke="var(--foreground-strong)" strokeWidth={1.4} strokeLinejoin="round" />
      </g>
    </g>
  )
}

/** Uma estação: feita (check), a de agora (halo que pulsa) ou a seguir (vazada com o número). */
function DesenhoDaEstacao({
  passo: s,
  indice: i,
  ponto: [x, y],
  interativo,
  escala = 1,
  numero = true,
}: {
  passo: TrailMapStep
  indice: number
  ponto: Ponto
  interativo?: boolean
  escala?: number
  numero?: boolean
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <g className="muriki-trail-station" style={{ animationDelay: `${Math.min(i, 14) * 45}ms` }}>
        {interativo ? (
          <circle className="foco" r={s.state === "now" ? 24 : 21} fill="none" stroke="var(--ring)" strokeWidth={2.5} opacity={0} />
        ) : null}
        {s.state === "done" ? (
          <>
            <circle r={15} fill="var(--primary)" stroke="var(--card)" strokeWidth={3} />
            <path d="M-5.5,0 l3.8,3.8 l7,-7.5" fill="none" stroke="var(--primary-foreground)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : s.state === "now" ? (
          <>
            <circle className="muriki-trail-pulse" r={30} fill="var(--primary)" opacity={0.18} />
            <circle r={24} fill="color-mix(in oklch, var(--primary) 16%, var(--card))" />
            <circle r={17} fill="var(--card)" stroke="var(--primary)" strokeWidth={3.5} />
            {numero ? (
              <text y={4.5} textAnchor="middle" fill="var(--primary)" className="font-mono" style={{ fontSize: 12.5, fontWeight: 700 }}>
                {i + 1}
              </text>
            ) : null}
          </>
        ) : (
          <>
            <circle r={13} fill="var(--card)" stroke="var(--input)" strokeWidth={2} />
            {numero ? (
              <text y={4} textAnchor="middle" fill="var(--muted-foreground)" className="font-mono" style={{ fontSize: 11 }}>
                {i + 1}
              </text>
            ) : null}
          </>
        )}
        {s.milestone ? (
          <g transform="translate(15,4)">
            <path d="M0,0 V-26" stroke="var(--foreground-strong)" strokeWidth={1.5} />
            <path d="M0,-26 h16 l-4,6 l4,6 h-16 z" fill="var(--accent)" stroke="var(--foreground-strong)" strokeWidth={1.1} strokeLinejoin="round" />
          </g>
        ) : null}
      </g>
    </g>
  )
}

/** O Muriki com o balão, em cima da etapa de agora. */
function MurikiAqui({ rotulo, pequeno }: { rotulo: string; pequeno?: boolean }) {
  return (
    <span className="muriki-trail-enter flex flex-col items-center gap-1">
      <span
        className={cn(
          "flex items-center rounded-full bg-foreground-strong font-semibold whitespace-nowrap text-background shadow-[var(--float)]",
          pequeno ? "h-5 px-2.5 text-[10.5px]" : "h-6 px-3 text-[11.5px]"
        )}
      >
        {rotulo}
      </span>
      <span className="muriki-trail-bob flex">
        <MurikiLogo className={cn(pequeno ? "size-6" : "size-9", "drop-shadow-[0_2px_2px_rgba(0,0,0,0.18)]")} />
      </span>
    </span>
  )
}

/** Mede o contêiner e cuida da rolagem: centra na etapa de agora e diz se ainda há caminho de cada lado. */
function useRolagem(centro: number | null, aoMedir: (largura: number) => void) {
  // o contêiner chega por callback ref num estado: nada de ref.current lido no render
  const [el, prender] = useState<HTMLDivElement | null>(null)
  const [lados, setLados] = useState({ antes: false, depois: false })
  const centrado = useRef(false)
  const medirLados = () => {
    if (!el) return
    setLados({ antes: el.scrollLeft > 4, depois: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }
  useEffect(() => {
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      aoMedir(e.contentRect.width)
      if (!centrado.current && centro !== null && e.contentRect.width) {
        el.scrollLeft = Math.max(0, centro - el.clientWidth / 2)
        centrado.current = true
      }
      setLados({ antes: el.scrollLeft > 4, depois: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [el, centro, aoMedir])
  const andar = (sentido: 1 | -1) => {
    if (!el) return
    const reduzir = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: sentido * el.clientWidth * 0.7, behavior: reduzir ? "auto" : "smooth" })
  }
  return { prender, lados, medirLados, andar }
}

function TrailMapDefault({ steps, regions = [], hereLabel, ariaLabel, onStepClick, className }: TrailMapProps) {
  const t = useTranslate()
  const aqui = hereLabel ?? t("trail_map.here")
  const n = steps.length
  const { atual, descricao, estacao } = useEstacoes(steps, onStepClick)
  const chegou = n > 0 && steps.every((s) => s.state === "done")
  const ultimaFeita = steps.reduce((acc, s, i) => (s.state === "done" ? i : acc), -1)
  const fimFeito = chegou ? n : atual >= 0 ? atual : ultimaFeita

  // o vão entre as estações: cabe na largura quando dá; senão fica no mínimo e o mapa rola
  // o centro inicial vem da etapa de agora, calculado com a largura da vez; o hook só centra uma vez
  const [largura, setLargura] = useState(0)
  const disponivel = largura || 1100
  const livre = n > 1 ? (disponivel - 2 * BORDA - FIM) / (n - 1) : PASSO_MAX
  const passo = Math.min(PASSO_MAX, Math.max(PASSO_MIN, livre))
  const larguraTotal = Math.max(disponivel, 2 * BORDA + FIM + Math.max(0, n - 1) * passo)
  const x0 = (larguraTotal - (Math.max(0, n - 1) * passo + FIM)) / 2

  const pontos: Ponto[] = steps.map((_, i) => [x0 + i * passo, Math.round(MEIO_Y + ONDA * Math.sin(i * 0.95 + 0.6))])
  const chegada: Ponto = [(pontos[n - 1]?.[0] ?? x0) + FIM, MEIO_Y + 6]
  const caminho = curva([[0, pontos[0]?.[1] ?? MEIO_Y], ...pontos, chegada])
  const feito = fimFeito >= 0 ? curva([[0, pontos[0]?.[1] ?? MEIO_Y], ...(fimFeito >= n ? [...pontos, chegada] : pontos.slice(0, fimFeito + 1))]) : ""
  const alvo = atual >= 0 ? pontos[atual] : chegou ? chegada : null

  const { prender, lados, medirLados, andar } = useRolagem(alvo ? alvo[0] : null, setLargura)

  // as regiões viram terrenos: da metade do vão antes da primeira etapa à metade do vão depois da última
  const terrenos = regions.map((r, k) => {
    const a = pontos[Math.max(0, r.from)]
    const b = pontos[Math.min(n - 1, r.to)]
    if (!a || !b) return null
    const x = k === 0 ? 0 : a[0] - passo / 2
    const fim = k === regions.length - 1 ? larguraTotal : b[0] + passo / 2
    return { ...r, x, w: fim - x, ...TERRENOS[k % TERRENOS.length] }
  })

  const lado = (i: number) => (steps[i].state === "now" ? "baixo" : pontos[i][1] < MEIO_Y ? "cima" : "baixo")
  const larguraNome = Math.min(passo - 14, 176)

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div
        ref={prender}
        onScroll={medirLados}
        // sem rolagem da pessoa (nem barra, nem roda, nem arrastar): só as setas e o foco andam
        className="muriki-trail-scroll overflow-hidden rounded-[inherit]"
        style={{
          maskImage: `linear-gradient(to right, ${lados.antes ? "transparent" : "#000"}, #000 48px, #000 calc(100% - 48px), ${lados.depois ? "transparent" : "#000"})`,
        }}
      >
        <div className="relative" style={{ width: larguraTotal, height: ALTURA }}>
          <svg
            width={larguraTotal}
            height={ALTURA}
            viewBox={`0 0 ${larguraTotal} ${ALTURA}`}
            role={onStepClick ? "group" : "img"}
            aria-label={ariaLabel}
            className="absolute inset-0 block overflow-visible"
          >
            {/* o céu, para as nuvens aparecerem sobre ele */}
            <rect
              x={0}
              y={0}
              width={larguraTotal}
              height={ALTURA}
              fill="color-mix(in oklch, var(--tone-blue) 60%, var(--card))"
              aria-hidden
            />

            {/* os terrenos: a faixa de cada nível com o topo em colinas e a paisagem dele */}
            {terrenos.map((r, k) =>
              r ? (
                <g key={`${r.label}-${r.from}`} aria-hidden>
                  <path
                    d={colinas(r.x, r.w, 118, 18, k)}
                    fill={`color-mix(in oklch, var(--tone-${r.tom}) 70%, var(--card))`}
                  />
                  <path
                    d={`M${r.x},${ALTURA} V${ALTURA - 58} C${r.x + r.w * 0.3},${ALTURA - 86} ${r.x + r.w * 0.6},${ALTURA - 40} ${r.x + r.w},${ALTURA - 70} V${ALTURA} Z`}
                    fill={`var(--tone-${r.tom})`}
                  />
                  {/* a paisagem mora na faixa de baixo, longe da estrada e dos nomes */}
                  {Array.from({ length: Math.max(3, Math.round(r.w / 70)) }, (_, j) => {
                    const sx = r.x + 70 + sorteio(k * 97 + j) * Math.max(10, r.w - 100)
                    const sy = ALTURA - 12 - sorteio(j * 13 + k) * 30
                    return <Enfeite key={j} tipo={r.enfeite} x={sx} y={sy} escala={0.8 + sorteio(j + k * 11) * 0.55} tom={r.tom} />
                  })}
                </g>
              ) : null
            )}

            {/* as nuvens no céu, andando devagar */}
            {Array.from({ length: Math.max(2, Math.round(larguraTotal / 420)) }, (_, j) => (
              <Nuvem key={j} x={60 + j * 420 + sorteio(j) * 160} y={46 + sorteio(j * 3) * 28} escala={0.8 + sorteio(j * 7) * 0.5} atraso={j * 7} />
            ))}

            <Estrada caminho={caminho} feito={feito} />

            {/* as placas na entrada de cada região */}
            {terrenos.map((r) =>
              r ? (
                <g key={`placa-${r.label}`} aria-hidden transform={`translate(${r.x + 30},${ALTURA - 28})`}>
                  <path d="M0,0 V-46" stroke="var(--foreground-strong)" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
                </g>
              ) : null
            )}

            <Chegada ponto={chegada} chegou={chegou} />

            {steps.map((s, i) => (
              <g key={i} {...estacao(i)}>
                <DesenhoDaEstacao passo={s} indice={i} ponto={pontos[i]} interativo={Boolean(onStepClick)} />
                <title>{descricao(s, i)}</title>
              </g>
            ))}
          </svg>

          {/* os textos em HTML por cima do SVG: o nome inteiro, quebrando em até duas linhas */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {terrenos.map((r) =>
              r ? (
                <span
                  key={`rot-${r.label}`}
                  className="absolute rounded-[5px] border border-border bg-card px-2 py-[3px] font-mono text-[10px] font-medium tracking-[0.16em] whitespace-nowrap text-foreground-strong uppercase shadow-xs"
                  style={{ left: r.x + 20, top: ALTURA - 96 }}
                >
                  {r.label}
                </span>
              ) : null
            )}
            {steps.map((s, i) => {
              const [x, y] = pontos[i]
              const emCima = lado(i) === "cima"
              return (
                <span
                  key={i}
                  className="absolute flex flex-col items-center text-center [text-shadow:0_0_4px_var(--card),0_0_4px_var(--card),0_0_2px_var(--card)]"
                  style={{
                    left: x - larguraNome / 2,
                    width: larguraNome,
                    ...(emCima ? { bottom: ALTURA - (y - 26) } : { top: y + (s.state === "now" ? 34 : 24) }),
                  }}
                >
                  <span
                    className={cn(
                      "line-clamp-2 text-[12.5px] leading-[16px]",
                      s.state === "now" ? "font-semibold text-foreground-strong" : "font-medium",
                      s.state === "later" ? "text-muted-foreground" : "text-foreground-strong"
                    )}
                  >
                    {s.title}
                  </span>
                  {s.meta ? <span className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{s.meta}</span> : null}
                  {s.milestone ? <span className="mt-0.5 text-[11px] font-semibold text-foreground-strong">{s.milestone}</span> : null}
                </span>
              )
            })}
            <span
              className="absolute -translate-x-1/2 font-mono text-[10.5px] font-semibold tracking-[0.14em] whitespace-nowrap text-foreground-strong uppercase [text-shadow:0_0_4px_var(--card),0_0_4px_var(--card)]"
              style={{ left: chegada[0], top: chegada[1] + 20 }}
            >
              {chegou ? t("trail_map.arrived") : t("trail_map.finish")}
            </span>
            {alvo ? (
              // o Muriki em cima da etapa de agora (ou na chegada, quando tudo foi feito), com o balão
              <span className="absolute -translate-x-1/2" style={{ left: alvo[0], bottom: ALTURA - (alvo[1] - (chegou ? 60 : 30)) }}>
                <MurikiAqui rotulo={chegou ? t("trail_map.arrived") : aqui} />
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {lados.antes ? (
        <button
          type="button"
          onClick={() => andar(-1)}
          aria-label={t("trail_map.scroll_prev")}
          className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--float)] hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
        </button>
      ) : null}
      {lados.depois ? (
        <button
          type="button"
          onClick={() => andar(1)}
          aria-label={t("trail_map.scroll_next")}
          className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-[var(--float)] hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 3.5 4.5 4.5L6 12.5" />
          </svg>
        </button>
      ) : null}

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

// ── O mapa do celular (vertical) ────────────────────────────────────────
// O mesmo lugar, descendo: a estrada serpenteia numa faixa à esquerda e os nomes ficam numa coluna à
// direita, na altura de cada estação, para a estrada nunca passar por cima deles. Cada região é um
// terreno na largura toda, com as colinas no topo, a placa no canto e a paisagem no pé. O Muriki fica
// em cima da etapa de agora, e a chegada, embaixo da última. Os nomes são HTML e quebram linha.
const VW = 358
const V_X = [52, 108]
const V_Y0 = 104
const V_PASSO = 108
const V_ENTRE = 64 // o respiro entre uma região e a seguinte: as colinas, a placa e a paisagem
const V_NOMES = 146
const V_FIM = 96

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
  const ultimo = pontos[n - 1] ?? [V_X[0], V_Y0]
  const chegada: Ponto = [VW / 2 - 60, ultimo[1] + V_FIM]
  const VH = chegada[1] + 80
  const chegou = n > 0 && steps.every((s) => s.state === "done")
  const ultimaFeita = steps.reduce((acc, s, i) => (s.state === "done" ? i : acc), -1)
  const fimFeito = chegou ? n : atual >= 0 ? atual : ultimaFeita
  const inicio: Ponto = [pontos[0]?.[0] ?? V_X[0], 0]
  const caminho = curva([inicio, ...pontos, chegada])
  const feito = fimFeito >= 0 ? curva([inicio, ...(fimFeito >= n ? [...pontos, chegada] : pontos.slice(0, fimFeito + 1))]) : ""
  const alvo = atual >= 0 ? pontos[atual] : chegou ? chegada : null

  // cada região vai do meio do respiro de cima ao meio do respiro de baixo
  const terrenos = regions.map((r, k) => {
    const a = pontos[Math.max(0, r.from)]
    const b = pontos[Math.min(n - 1, r.to)]
    if (!a || !b) return null
    const y0 = k === 0 ? 0 : a[1] - V_ENTRE / 2 - V_PASSO / 2
    const y1 = k === regions.length - 1 ? VH : b[1] + V_PASSO / 2 + V_ENTRE / 2
    return { ...r, y0, y1, ...TERRENOS[k % TERRENOS.length] }
  })

  return (
    <div className={cn("relative w-full min-w-0 overflow-hidden rounded-[inherit]", className)} style={{ aspectRatio: `${VW} / ${VH}` }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        height="100%"
        role={onStepClick ? "group" : "img"}
        aria-label={ariaLabel}
        className="absolute inset-0 block"
      >
        <rect x={0} y={0} width={VW} height={VH} fill="color-mix(in oklch, var(--tone-blue) 60%, var(--card))" aria-hidden />
        {terrenos.map((r, k) =>
          r ? (
            <g key={`${r.label}-${r.from}`} aria-hidden>
              <path d={colinas(0, VW, r.y0 + 26, 16, k, r.y1)} fill={`color-mix(in oklch, var(--tone-${r.tom}) 70%, var(--card))`} />
              {/* a paisagem no pé da região, à direita, embaixo dos nomes */}
              {Array.from({ length: 4 }, (_, j) => (
                <Enfeite
                  key={j}
                  tipo={r.enfeite}
                  x={190 + j * 44 + sorteio(k * 17 + j) * 16}
                  y={r.y1 - 8 - sorteio(j * 5 + k) * 10}
                  escala={0.6 + sorteio(j + k * 3) * 0.35}
                  tom={r.tom}
                />
              ))}
            </g>
          ) : null
        )}
        <Nuvem x={220} y={40} escala={0.7} atraso={3} />
        <Estrada caminho={caminho} feito={feito} largura={18} />
        <Chegada ponto={chegada} chegou={chegou} escala={0.85} />
        {steps.map((s, i) => (
          <g key={i} {...estacao(i)}>
            <DesenhoDaEstacao passo={s} indice={i} ponto={pontos[i]} interativo={Boolean(onStepClick)} />
            <title>{descricao(s, i)}</title>
          </g>
        ))}
      </svg>

      {/* os textos em HTML por cima do SVG: quebram linha e não dependem da escala */}
      {(() => {
        const pos = (px: number, py: number): CSSProperties => ({ left: `${(px / VW) * 100}%`, top: `${(py / VH) * 100}%` })
        return (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {terrenos.map((r) =>
              r ? (
                <span
                  key={`rot-${r.label}`}
                  className="absolute -translate-x-full rounded-[5px] border border-border bg-card px-2 py-[3px] font-mono text-[9.5px] font-medium tracking-[0.16em] whitespace-nowrap text-foreground-strong uppercase shadow-xs"
                  style={pos(VW - 14, r.y0 + 32)}
                >
                  {r.label}
                </span>
              ) : null
            )}
            {steps.map((s, i) => (
              <span
                key={i}
                className="absolute -translate-y-1/2 [text-shadow:0_0_4px_var(--card),0_0_4px_var(--card),0_0_2px_var(--card)]"
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
            <span
              className="absolute -translate-x-1/2 font-mono text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-foreground-strong uppercase [text-shadow:0_0_4px_var(--card),0_0_4px_var(--card)]"
              style={pos(chegada[0], chegada[1] + 16)}
            >
              {chegou ? t("trail_map.arrived") : t("trail_map.finish")}
            </span>
            {alvo ? (
              <span className="absolute -translate-x-1/2 -translate-y-full" style={pos(alvo[0], alvo[1] - (chegou ? 56 : 28))}>
                <MurikiAqui rotulo={chegou ? t("trail_map.arrived") : aqui} pequeno />
              </span>
            ) : null}
          </div>
        )
      })()}

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

// ── O minimapa ──────────────────────────────────────────────────────────
// O mesmo lugar em miniatura, para os cartões de Trilhas: sem nomes, e com no máximo 9 estações — o
// trecho em volta da etapa de agora. Quando o caminho continua para um lado, a estrada sai pela borda
// esmaecida. A chegada aparece quando o trecho chega ao fim.
const MW = 420
const MH = 140
const M_JANELA = 9
const M_BORDA = 30
const M_MEIO = 84
const M_ONDA = 22

function TrailMapMini({ steps, regions = [], hereLabel, startLabel, ariaLabel, href, render, className }: TrailMapProps) {
  const t = useTranslate()
  const n = steps.length
  const atual = steps.findIndex((s) => s.state === "now")
  const feitas = steps.filter((s) => s.state === "done").length
  const chegou = n > 0 && feitas === n
  const comeco = feitas === 0 && atual === 0
  const balao = chegou ? t("trail_map.arrived") : comeco ? (startLabel ?? t("trail_map.start")) : (hereLabel ?? t("trail_map.here"))
  const resumo = `${ariaLabel} · ${t("trail_map.summary", { done: feitas, total: n })}`

  // a janela: até 9 estações, com a de agora a 3 do começo
  const foco = atual >= 0 ? atual : chegou ? n - 1 : 0
  const de = n <= M_JANELA ? 0 : Math.min(Math.max(0, foco - 3), n - M_JANELA)
  const ate = Math.min(n, de + M_JANELA)
  const antes = de > 0
  const depois = ate < n
  const mostraFim = !depois
  const k = ate - de
  const vaos = Math.max(1, k - 1 + (mostraFim ? 0.8 : 0))
  const passo = (MW - 2 * M_BORDA) / vaos
  const pontos: Ponto[] = Array.from({ length: k }, (_, j) => [
    M_BORDA + j * passo,
    Math.round(M_MEIO + M_ONDA * Math.sin((de + j) * 0.95 + 0.6)),
  ])
  const chegada: Ponto = [MW - M_BORDA + 4, M_MEIO + 4]
  const naBorda = (p?: Ponto): Ponto[] => (p ? [p] : [])
  const inicio = antes ? naBorda([0, pontos[0]?.[1] ?? M_MEIO]) : []
  const final = depois ? naBorda([MW, pontos[k - 1]?.[1] ?? M_MEIO]) : [chegada]
  const caminho = curva([...inicio, ...pontos, ...final])
  const fimLocal = chegou ? k : atual >= 0 ? atual - de : feitas > 0 ? Math.min(k - 1, feitas - 1 - de) : -1
  const feito = fimLocal >= 0 ? curva([...inicio, ...(chegou ? [...pontos, ...final] : pontos.slice(0, fimLocal + 1))]) : ""
  const alvo = atual >= 0 ? pontos[atual - de] : chegou ? chegada : null

  const terrenos = regions
    .map((r, idx) => {
      const a = Math.max(r.from, de)
      const b = Math.min(r.to, ate - 1)
      if (a > b) return null
      const x = a === de ? 0 : pontos[a - de][0] - passo / 2
      const fim = b === ate - 1 ? MW : pontos[b - de][0] + passo / 2
      return { ...r, x, w: fim - x, ...TERRENOS[idx % TERRENOS.length] }
    })
    .filter(Boolean) as ({ x: number; w: number } & TrailMapRegion & (typeof TERRENOS)[number])[]

  const mapa = (
    <span className="relative block">
      <svg
        viewBox={`0 0 ${MW} ${MH}`}
        width="100%"
        role="img"
        aria-label={resumo}
        className="block h-auto"
        style={{
          maskImage: `linear-gradient(to right, ${antes ? "transparent" : "#000"}, #000 36px, #000 calc(100% - 36px), ${depois ? "transparent" : "#000"})`,
        }}
      >
        <rect x={0} y={0} width={MW} height={MH} fill="color-mix(in oklch, var(--tone-blue) 60%, var(--card))" />
        {terrenos.map((r, idx) => (
          <path key={`${r.label}-${r.from}`} d={colinas(r.x, r.w, 34, 8, idx, MH)} fill={`color-mix(in oklch, var(--tone-${r.tom}) 70%, var(--card))`} />
        ))}
        <Estrada caminho={caminho} feito={feito} largura={10} />
        {mostraFim ? <Chegada ponto={chegada} chegou={chegou} escala={0.55} /> : null}
        {pontos.map((p, j) => (
          <DesenhoDaEstacao key={de + j} passo={steps[de + j]} indice={de + j} ponto={p} escala={0.5} numero={false} />
        ))}
      </svg>
      {alvo ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${(Math.min(Math.max(alvo[0], 60), MW - 60) / MW) * 100}%`, top: `${((alvo[1] - (chegou ? 30 : 12)) / MH) * 100}%` }}
        >
          <MurikiAqui rotulo={balao} pequeno />
        </span>
      ) : null}
    </span>
  )

  const classe = cn(
    "block w-full min-w-0 overflow-hidden rounded-[10px] outline-none",
    (href || render) && "focus-visible:ring-2 focus-visible:ring-ring/50",
    className
  )
  if (render) return cloneElement(render as ReactElement<Record<string, unknown>>, { className: classe, children: mapa })
  if (href) return <a href={href} className={classe}>{mapa}</a>
  return <div className={classe}>{mapa}</div>
}
