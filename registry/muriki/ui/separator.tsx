/**
 * Muriki Separator.
 *
 * O filete do sistema, na cor `--border`. Nas superfícies que já carregam
 * filete por sombra interna (diálogo estruturado, sheet), prefira aquele:
 * dois meios de desenhar a mesma linha acabam divergindo de espessura.
 */
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
