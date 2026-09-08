import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * O escopo do acrílico. É ele que carrega os tokens e pinta o vazio — sem
 * ele, botão e cartão não têm cor, nem fundo para o vidro refratar.
 *
 * Envolva a REGIÃO que é vidro, não a página inteira por reflexo: uma tela
 * pode ter o papel quente do Muriki em volta e uma área de acrílico dentro,
 * e as duas línguas não se misturam porque os tokens de uma param na borda
 * do escopo da outra.
 *
 * `tone`: "dark" é o vidro — a fisionomia desta língua. "light" é acrílico
 * fosco, placa a 64% de branco; existe para quando a região de vidro mora
 * numa tela clara e não pode ser um buraco escuro no meio dela. "ink" é a
 * tinta: o chão do tema dark do sistema, sem as luzes — o tom do HUD de
 * linha, onde nada precisa refratar.
 *
 * Tem foto ou vídeo atrás? Passe `background` pelo style ou className — o
 * gradiente padrão é só o mínimo para o vidro ter o que borrar.
 */
interface AcrylicScopeProps extends React.ComponentProps<"div"> {
  tone?: "dark" | "light" | "ink"
}

function AcrylicScope({ className, tone = "dark", ...props }: AcrylicScopeProps) {
  return (
    <div
      data-slot="acrylic-scope"
      data-tone={tone}
      className={cn("muriki-acrylic", className)}
      {...props}
    />
  )
}

export { AcrylicScope }
export type { AcrylicScopeProps }
