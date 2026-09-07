"use client"

/**
 * Muriki Input.
 *
 * O campo padrão é CHAPADO, com filete de 1px por dentro — sem sulco, sem
 * sombra (prancha de Campos). A superfície é o token --field: card no
 * claro, sunken no escuro. É o "campo fica mais escuro que o card" da
 * regra do dark, carregado por token e não por classe `dark:`.
 *
 * `underline` é a variante editorial: só o fio de baixo. Serve às telas
 * de entrada (login, onboarding), onde o campo vive sobre papel ao lado
 * de um título grande e um retângulo competiria com ele. Não é para
 * formulário denso — ali o filete fechado é o que separa campo de texto.
 *
 * Raio pela mesma razão do botão: altura ÷ 5. Base UI por baixo: dentro
 * de um <Field> o id, o label e o aria-describedby vêm de graça.
 */
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const inputVariants = cva(
  [
    "w-full min-w-0 bg-field text-foreground outline-none",
    "transition-[background-color,box-shadow] duration-100",
    "placeholder:text-muted-foreground/70",
    "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-70",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Prancha de Campos: chapado, filete por dentro. Hover escurece o filete, foco troca por tinta da marca. */
        default: [
          "shadow-[inset_0_0_0_1px_var(--input)]",
          "hover:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--input)_86%,var(--foreground))]",
          "focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] focus-visible:ring-[3px] focus-visible:ring-ring/20",
          "aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
          "data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] data-invalid:ring-[3px] data-invalid:ring-destructive/15",
        ].join(" "),
        /** Editorial: só o fio de baixo, sem fundo. Para login e onboarding. */
        underline: [
          "bg-transparent",
          "shadow-[inset_0_-1px_0_var(--input)]",
          "hover:shadow-[inset_0_-1px_0_color-mix(in_oklch,var(--input)_86%,var(--foreground))]",
          "focus-visible:shadow-[inset_0_-1px_0_var(--primary)]",
          "aria-invalid:shadow-[inset_0_-1px_0_var(--destructive)]",
          "data-invalid:shadow-[inset_0_-1px_0_var(--destructive)]",
        ].join(" "),
      },
      size: {
        sm: "h-7 rounded-[6px] px-2.5 text-[0.78rem]",
        default: "h-8 rounded-[6px] px-[11px] text-[0.8125rem]",
        lg: "h-9 rounded-[7px] px-3 text-sm",
        /** Piso de toque. `text-base` no mobile evita o zoom do iOS ao focar. */
        touch: "h-11 rounded-[9px] px-3.5 text-base md:text-[0.9375rem]",
      },
    },
    compoundVariants: [{ variant: "underline", class: "rounded-none px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  }
)

/** `size` nativo do <input> (largura em caracteres) sai da API: aqui `size` é a altura. */
export type InputProps = Omit<React.ComponentProps<typeof InputPrimitive>, "size"> &
  VariantProps<typeof inputVariants>

function Input({ className, variant = "default", size = "default", ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Input }
