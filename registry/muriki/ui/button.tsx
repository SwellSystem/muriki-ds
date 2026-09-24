import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { buttonVariants } from "./button-variants"

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /**
     * Enviando: o spinner entra no lugar do ícone da esquerda (ou na frente
     * do texto, se não houver ícone), o botão trava e ganha aria-busy. O
     * rótulo fica — "Salvando…" é opcional, o spinner já diz que está indo.
     */
    loading?: boolean
  }

/**
 * Muriki Button. Base UI por baixo — use `render` para trocar o elemento
 * (`render={<a href="..." />}`), não `asChild`.
 */
function Button({
  className,
  variant = "outline",
  size = "default",
  effect = "none",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size, effect, className }),
        // carregando não é desabilitado: o botão não esmaece, só trava
        // o ícone da esquerda sai de cena enquanto o spinner ocupa o lugar dele
        loading && "disabled:opacity-100 [&>[data-slot=spinner]+svg]:hidden"
      )}
      {...props}
    >
      {loading ? <Spinner size={size === "xs" || size === "sm" ? "sm" : "default"} /> : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button }
