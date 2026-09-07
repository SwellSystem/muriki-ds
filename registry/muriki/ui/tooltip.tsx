"use client"

/**
 * Muriki Tooltip.
 *
 * O tooltip é a única superfície flutuante que INVERTE: fundo de tinta,
 * texto de papel. Ele não é um recipiente onde se opera — é uma etiqueta
 * que passa, e por isso não usa `--float`, que é a linguagem de quem fica.
 * Contraste alto é o que faz uma etiqueta de 12px ser lida de relance.
 *
 * A seta é obrigatória: sem ela um retângulo escuro flutuando não diz de
 * qual botão está falando, e a barra de ações de linha tem seis botões
 * encostados um no outro.
 *
 * Base UI. A transição é CSS pura via data-starting-style/data-ending-style
 * — sem tailwindcss-animate, que o sistema não carrega.
 */
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({ delay = 400, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5",
            "rounded-md bg-foreground-strong px-2.5 py-1.5 text-xs text-background",
            "transition-[opacity,transform] duration-100 ease-out",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className={cn(
              "size-2 rotate-45 rounded-[1px] bg-foreground-strong",
              "data-[side=top]:-bottom-1 data-[side=bottom]:-top-1",
              "data-[side=left]:-right-1 data-[side=right]:-left-1"
            )}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
