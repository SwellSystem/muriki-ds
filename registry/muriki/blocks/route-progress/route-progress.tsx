"use client"

/**
 * Route Progress — a barra fina no topo enquanto a próxima tela carrega.
 *
 * Com loader de rota (TanStack Router, Remix, Next), a tela antiga fica
 * parada até os dados chegarem. Sem sinal, o clique parece não ter pegado.
 * A barra é o sinal: 2px na tinta da marca, colada no topo, por cima de
 * tudo e sem roubar clique.
 *
 * Três regras de tempo, que é onde uma barra dessas acerta ou irrita:
 * - só aparece depois de 120ms, porque navegação rápida não pisca;
 * - sobe depressa até ~30% e depois vai freando, sem nunca chegar ao fim
 *   sozinha, porque ninguém sabe quanto falta;
 * - quando termina, completa até 100% e some em 200ms, em vez de sumir no
 *   meio do caminho.
 *
 * Controlada: passe `active` a partir do estado do router. No TanStack:
 *   const carregando = useRouterState({ select: (s) => s.isLoading })
 *   <RouteProgress active={carregando} />
 */
import * as React from "react"

import { cn } from "@/lib/utils"

export interface RouteProgressProps {
  active: boolean
  /** Espera antes de aparecer, em ms. */
  delay?: number
  label?: string
  className?: string
}

export function RouteProgress({ active, delay = 120, label = "Carregando a página", className }: RouteProgressProps) {
  const [largura, setLargura] = React.useState(0)
  const [visivel, setVisivel] = React.useState(false)

  React.useEffect(() => {
    if (active) {
      let passo: ReturnType<typeof setInterval> | undefined
      const inicio = setTimeout(() => {
        setVisivel(true)
        setLargura(30)
        // freia: cada passo anda 8% do que falta até 90
        passo = setInterval(() => setLargura((w) => w + (90 - w) * 0.08), 300)
      }, delay)
      return () => {
        clearTimeout(inicio)
        if (passo) clearInterval(passo)
      }
    }
    if (!visivel) return
    setLargura(100)
    const fim = setTimeout(() => {
      setVisivel(false)
      setLargura(0)
    }, 200)
    return () => clearTimeout(fim)
    // `visivel` fica de fora de propósito: a troca de active é que dirige a barra
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, delay])

  return (
    <div
      data-slot="route-progress"
      role="progressbar"
      aria-label={label}
      aria-hidden={visivel ? undefined : true}
      aria-busy={active || undefined}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 transition-opacity duration-200",
        visivel ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--primary)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
        style={{ width: `${largura}%` }}
      />
    </div>
  )
}
