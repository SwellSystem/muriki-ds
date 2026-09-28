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
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

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
  /** Com isto, cada estação vira um botão. */
  onStepClick?: (index: number) => void
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

export function TrailMap({ steps, regions = [], hereLabel, ariaLabel, onStepClick, className }: TrailMapProps) {
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
            <g
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              role={interativo ? "button" : undefined}
              tabIndex={interativo ? (i === foco ? 0 : -1) : undefined}
              aria-label={interativo ? descricao(s, i) : undefined}
              aria-hidden={interativo ? undefined : true}
              onClick={interativo ? () => onStepClick?.(i) : undefined}
              onKeyDown={interativo ? (e) => mover(e, i) : undefined}
              onFocus={interativo ? () => setFoco(i) : undefined}
              className={cn(interativo && "cursor-pointer outline-none [&:focus-visible>.foco]:opacity-100")}
            >
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
