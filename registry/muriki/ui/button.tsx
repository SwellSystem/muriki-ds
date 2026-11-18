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
    /**
     * Com texto de carregando, a troca é no lugar: o rótulo sai desfocado
     * subindo e o spinner + "Salvando" entra desfocado de baixo, os dois na
     * mesma célula de grid — o botão fica com a largura do maior e não pula.
     * Passe sempre que o botão carrega (não só quando `loading`), para a
     * largura já estar reservada antes do clique.
     */
    loadingText?: React.ReactNode
  }

// o desfoque de sempre: sai subindo, entra de baixo; com "reduzir movimento", só troca
const TROCA =
  "inline-flex items-center gap-[inherit] [grid-area:1/1] transition-[opacity,filter,translate] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
const FORA = "opacity-0 blur-[6px]"

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
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const spinner = <Spinner size={size === "xs" || size === "sm" ? "sm" : "default"} />
  const troca = loadingText != null && !String(size).startsWith("icon")
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
      {troca ? (
        <span className="inline-grid place-items-center gap-[inherit]">
          <span className={cn(TROCA, loading && `${FORA} -translate-y-[3px]`)} aria-hidden={loading || undefined}>
            {children}
          </span>
          <span className={cn(TROCA, !loading && `${FORA} translate-y-[3px]`)} aria-hidden={!loading || undefined}>
            {spinner}
            {loadingText}
          </span>
        </span>
      ) : (
        <>
          {loading ? spinner : null}
          {children}
        </>
      )}
    </ButtonPrimitive>
  )
}

export { Button }
