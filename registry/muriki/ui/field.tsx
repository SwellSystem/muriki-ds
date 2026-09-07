"use client"

/**
 * Muriki Field.
 *
 * O campo não é só o input: é label, controle, dica e erro, ligados por
 * id e aria-describedby. Base UI Field faz essa amarração — qualquer
 * controle Base UI (Input, Checkbox, Select) dentro do Root já sai
 * rotulado e descrito, sem useId manual.
 *
 * Duas vozes de label. `default` é a da prancha: 14/500, tinta forte,
 * para formulário. `editorial` é caption mono em caixa alta, para as
 * telas de entrada, onde o label é uma legenda e o campo é `underline`.
 *
 * O erro vem controlado de fora: `invalid` no Root e um <FieldError>
 * renderizado só quando existe mensagem. É o caminho para qualquer
 * validação que não seja a nativa do browser — zod, servidor, o que for.
 */
import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "@/lib/utils"

export type FieldVariant = "default" | "editorial"

export type FieldProps = React.ComponentProps<typeof FieldPrimitive.Root> & {
  variant?: FieldVariant
}

function Field({ className, variant = "default", ...props }: FieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-variant={variant}
      className={cn("group/field flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium text-foreground-strong select-none",
        "group-data-[variant=editorial]/field:font-mono group-data-[variant=editorial]/field:text-[10px] group-data-[variant=editorial]/field:tracking-[0.25em] group-data-[variant=editorial]/field:text-muted-foreground group-data-[variant=editorial]/field:uppercase",
        "group-data-disabled/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** Linha do label com uma ação à direita — "Esqueci a senha", "Limpar". */
function FieldHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-header"
      className={cn("flex items-baseline justify-between gap-3", className)}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-[11.5px] leading-[15px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * `match` vem `true` por padrão: o erro aparece sempre que for
 * renderizado, e quem decide se renderiza é o dono do estado.
 */
function FieldError({
  className,
  children,
  match = true,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Error>) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      match={match}
      role="alert"
      className={cn(
        "flex items-center gap-1.5 text-[11.5px] leading-[15px] text-destructive",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[13px] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 8v5" />
        <circle cx="12" cy="16.6" r="0.6" fill="currentColor" />
        <path d="M10.3 3.9 2.5 18a1.9 1.9 0 0 0 1.7 2.9h15.6a1.9 1.9 0 0 0 1.7-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
      </svg>
      <span>{children}</span>
    </FieldPrimitive.Error>
  )
}

export { Field, FieldLabel, FieldHeader, FieldDescription, FieldError }
