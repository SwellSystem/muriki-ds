import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { acrylicButtonVariants } from "./acrylic-button-variants"

/**
 * Muriki Acrílico — Botão. Base UI por baixo, como o botão do papel: use
 * `render` para trocar o elemento (`render={<a href="..." />}`).
 *
 * SÓ FUNCIONA DENTRO DE UM <AcrylicScope>. Fora dele não há tokens, não há
 * fundo para o vidro refratar, e a placa sai como um retângulo sem cor. Não
 * é bug — é o material dizendo que precisa de algo atrás.
 */
function AcrylicButton({
  className,
  variant = "glass",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof acrylicButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="acrylic-button"
      data-variant={variant}
      className={cn(acrylicButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { AcrylicButton }
