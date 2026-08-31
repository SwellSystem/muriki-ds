/**
 * Muriki Switch.
 *
 * O TRILHO é um encaixe: recuado nos dois temas, com a aresta de cima na
 * sombra no claro e um fio de luz no topo no escuro — a mesma direção de
 * luz do ViewToggle.
 *
 * O THUMB não inverte, e a distinção importa: o pill do ViewToggle é uma
 * SUPERFÍCIE (carrega o rótulo dentro), então virar encaixe funciona. O
 * thumb daqui é um OBJETO — um botão físico que não carrega nada. Como
 * encaixe ele sumiria. Fica elevado nos dois, subindo por sombra no claro
 * e por luz no escuro.
 */
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & { size?: "sm" | "default" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all outline-none",
        // área de toque de 44px sem inchar a caixa
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "data-[size=default]:h-5 data-[size=default]:w-[34px] data-[size=sm]:h-4 data-[size=sm]:w-[28px]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // desligado: encaixe
        "data-unchecked:bg-sunken data-unchecked:shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_var(--border)]",
        "dark:data-unchecked:shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_0_0_1px_oklch(0.325_0.006_107)]",
        // ligado: a marca preenche o sulco
        "data-checked:bg-primary data-checked:shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full transition-transform",
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "group-data-[size=default]/switch:translate-x-0.5 group-data-[size=sm]/switch:translate-x-0.5",
          "data-checked:translate-x-[calc(100%+2px)]",
          // objeto elevado: sombra no claro, luz no escuro
          "bg-card shadow-[0_1px_2px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(0,0,0,0.06)]",
          "dark:bg-[oklch(0.86_0.004_100)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.5)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
