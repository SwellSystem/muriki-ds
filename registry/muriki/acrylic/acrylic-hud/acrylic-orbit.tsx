import * as React from "react"

import { cn } from "@/lib/utils"
import { AcrylicHudCore } from "@/components/acrylic/acrylic-hud/acrylic-core"

/**
 * Muriki Acrílico — Órbita. O núcleo com o logo e os nós que nascem dentro
 * dele e viram o nav.
 *
 * O núcleo (logo + anéis) mora em acrylic-core.tsx — é o mesmo do arco.
 *
 * A GEOMETRIA É DERIVADA DA CONTAGEM: n itens viram n vértices de um
 * polígono regular com o primeiro no topo. Cinco é o número que a ideia
 * pediu e o que cabe bem num palco de 760px; seis ainda cabe; acima disso
 * os cartões se encostam. O raio da órbita é um número só (ORBIT_R), que o
 * componente escreve nos dois sistemas de coordenadas — cqw no CSS, viewBox
 * no SVG — para as amarras acabarem exatamente onde o cartão está.
 */
export interface AcrylicOrbitItem {
  id: string
  /** O ícone do módulo. É a semente: a primeira coisa que aparece, dentro
   *  do anel, antes de o cartão existir. 16px; phosphor ou qualquer svg. */
  icon?: React.ReactNode
  /** Rótulo mono em caixa alta acima do título. */
  eyebrow?: string
  title: string
  /** Uma linha: um número, um estado, o que o módulo tem a dizer agora. */
  detail?: string
  href?: string
  onSelect?: () => void
}

export interface AcrylicOrbitProps {
  logo: React.ReactNode
  items: AcrylicOrbitItem[]
  /** aria-label do nav. */
  label?: string
  className?: string
}

/** Raio da órbita, em % da largura do palco (cqw no CSS, unidades no SVG). */
const ORBIT_R = 36
/** Cartão em cqw — o meio do clamp de --acr-orbit-card-w/h no CSS. Serve
 *  para a amarra parar na borda do cartão em vez de atravessá-lo. */
const CARD_W = 30
const CARD_H = 14

function angleOf(index: number, count: number) {
  return -90 + (index * 360) / count
}

/** Onde o raio do centro ao nó cruza a borda do cartão, em unidades do SVG. */
function tetherEnd(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const halfW = Math.abs(cos) < 1e-6 ? Infinity : CARD_W / 2 / Math.abs(cos)
  const halfH = Math.abs(sin) < 1e-6 ? Infinity : CARD_H / 2 / Math.abs(sin)
  const len = ORBIT_R - Math.min(halfW, halfH) - 1
  return { x: 50 + cos * len, y: 50 + sin * len }
}

function AcrylicOrbit({ logo, items, label = "Módulos", className }: AcrylicOrbitProps) {
  const count = items.length

  return (
    <nav
      data-slot="acrylic-orbit"
      aria-label={label}
      className={cn("acr-orbit", className)}
      style={{ "--acr-orbit-r": `${ORBIT_R}cqw` } as React.CSSProperties}
    >
      <svg className="acr-orbit-tethers" viewBox="0 0 100 100" aria-hidden>
        <circle className="acr-orbit-ring" cx="50" cy="50" r={ORBIT_R / 2} />
        <circle className="acr-orbit-ring acr-orbit-ring--orbit" cx="50" cy="50" r={ORBIT_R} />
        <circle className="acr-orbit-ring" cx="50" cy="50" r={ORBIT_R * 1.42} />
        {items.map((item, i) => {
          const { x, y } = tetherEnd(angleOf(i, count))
          return (
            <g key={item.id}>
              <line className="acr-orbit-tether" x1="50" y1="50" x2={x} y2={y} />
              <line
                className="acr-orbit-pulse"
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                pathLength={1}
                style={{ "--i": i } as React.CSSProperties}
              />
              <circle className="acr-orbit-port" cx={x} cy={y} r="0.55" />
            </g>
          )
        })}
      </svg>

      <AcrylicHudCore logo={logo} />

      {items.map((item, i) => {
        const style = { "--i": i, "--a": `${angleOf(i, count)}deg` } as React.CSSProperties
        const body = (
          <>
            <span className="acr-orbit-seed" aria-hidden>
              {item.icon}
            </span>
            <span className="acr-orbit-card acr-pane acr-pane-interactive">
              {item.eyebrow ? <span className="acr-orbit-eyebrow">{item.eyebrow}</span> : null}
              <span className="acr-orbit-title">{item.title}</span>
              {item.detail ? <span className="acr-orbit-detail">{item.detail}</span> : null}
            </span>
          </>
        )
        return item.href ? (
          <a
            key={item.id}
            data-slot="acrylic-orbit-node"
            className="acr-orbit-node"
            style={style}
            href={item.href}
            onClick={item.onSelect}
          >
            {body}
          </a>
        ) : (
          <button
            key={item.id}
            type="button"
            data-slot="acrylic-orbit-node"
            className="acr-orbit-node"
            style={style}
            onClick={item.onSelect}
          >
            {body}
          </button>
        )
      })}
    </nav>
  )
}

export { AcrylicOrbit, ORBIT_R }
