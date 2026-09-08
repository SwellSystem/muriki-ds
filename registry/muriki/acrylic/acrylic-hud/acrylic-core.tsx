import * as React from "react"

/**
 * O reator: o logo dentro de um disco de vidro, os dois anéis do loader do
 * platform-old em volta, um brilho atrás. É o mesmo núcleo na órbita e no
 * arco — mora num arquivo só para os dois não divergirem.
 *
 * O LOGO ENTRA POR PROP. O registry não carrega binário nem marca. O
 * mascote do Muriki tem cores próprias e vai assim; um símbolo monocromático
 * passa com fill="currentColor" e herda a tinta do disco.
 */
function AcrylicHudCore({ logo }: { logo: React.ReactNode }) {
  return (
    <div className="acr-orbit-core" aria-hidden>
      <div className="acr-orbit-glow" />
      <div className="acr-orbit-ring-outer" />
      <div className="acr-orbit-ring-inner" />
      <div className="acr-orbit-disc acr-pane">
        <div className="acr-orbit-logo">{logo}</div>
      </div>
    </div>
  )
}

export { AcrylicHudCore }
