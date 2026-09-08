import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Muriki Acrílico — HUD. O painel de comando: um palco que segura a órbita
 * no centro e o leque no canto, e que carrega a FASE.
 *
 * `open` é o único estado: false enquanto o sistema carrega (os anéis do
 * núcleo são o loader), true quando está pronto — e é aí que o CSS roda a
 * sequência inteira, uma vez. Deixe em false o tempo que o carregamento
 * real levar; a coreografia não sabe nem precisa saber o que estava
 * carregando.
 *
 * `material` escolhe o que os cartões e o canto são feitos: "glass" é a
 * placa de vidro da língua; "hologram" é linha e luz — quase sem fundo,
 * filete no acento, cantoneiras, sem blur. Vidro é o padrão e é o certo
 * no tom claro; no escuro, onde a placa vira bloco fosco sem nada atrás
 * para refratar, o holograma é o Jarvis. O núcleo é vidro nos dois — é o
 * reator.
 *
 * Vai dentro de um <AcrylicScope>, como tudo nesta língua. Ocupa a altura
 * do pai: numa tela de entrada, dê ao escopo `min-h-dvh`.
 */
type AcrylicPhase = "boot" | "open"

/** A fase, para quem precisa reagir a ela em JS — o teclado mede o voo dos
 *  ícones no instante em que a fase vira "open". O CSS lê data-phase. */
const AcrylicPhaseContext = React.createContext<AcrylicPhase>("boot")

function useAcrylicPhase() {
  return React.useContext(AcrylicPhaseContext)
}

interface AcrylicHudProps extends React.ComponentProps<"div"> {
  open?: boolean
  material?: "glass" | "hologram"
}

function AcrylicHud({
  open = false,
  material = "glass",
  className,
  children,
  ...props
}: AcrylicHudProps) {
  return (
    <AcrylicPhaseContext.Provider value={open ? "open" : "boot"}>
      <div
        data-slot="acrylic-hud"
        data-phase={open ? "open" : "boot"}
        data-material={material}
        className={cn("acr-hud", className)}
        {...props}
      >
        {children}
      </div>
    </AcrylicPhaseContext.Provider>
  )
}

export { AcrylicHud, useAcrylicPhase }
export type { AcrylicHudProps, AcrylicPhase }
