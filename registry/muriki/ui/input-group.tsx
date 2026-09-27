"use client"

/**
 * Muriki InputGroup — o Input com um afixo por dentro: "R$" à esquerda,
 * "%" ou "meses" à direita, ou um ícone.
 *
 * O afixo diz a unidade sem virar rótulo: fica em muted-foreground, dentro
 * do mesmo filete do campo, e não recebe foco. Por isso a caixa é o grupo,
 * e não o <input>: o filete, a superfície e o anel de foco do Input moram
 * no invólucro, e o <input> por dentro é transparente. O foco do campo
 * acende o grupo inteiro (`has-focus-visible`), e o erro também.
 *
 * Clicar no afixo foca o campo, como clicar em qualquer ponto da caixa —
 * o afixo é pedaço do campo, não um botão ao lado dele.
 *
 * `className` vai para o grupo (largura, margem); o resto das props vai
 * para o <input>, com o `size` do Input como altura. Dentro de um <Field>
 * o id, o label e o aria-describedby continuam vindo do Base UI.
 */
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

type Size = "sm" | "default" | "lg" | "touch"

const alturas: Record<Size, string> = {
  sm: "h-7 gap-1.5 rounded-[7px] px-2.5 text-[0.78rem]",
  default: "h-8 gap-2 rounded-[8px] px-[11px] text-[0.8125rem]",
  lg: "h-9 gap-2 rounded-[9px] px-3 text-sm",
  touch: "h-11 gap-2.5 rounded-[11px] px-3.5 text-base md:text-[0.9375rem]",
}

export type InputGroupProps = Omit<React.ComponentProps<typeof InputPrimitive>, "size"> & {
  /** O afixo à esquerda, ex.: "R$" ou um ícone. */
  start?: React.ReactNode
  /** O afixo à direita, ex.: "%" ou "meses". */
  end?: React.ReactNode
  size?: Size
}

function InputGroup({ start, end, size = "default", className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      // o afixo não rouba o clique: fora do <input>, a caixa manda o foco para ele
      onMouseDown={(event) => {
        const campo = event.currentTarget.querySelector("input")
        if (!campo || event.target === campo) return
        event.preventDefault()
        campo.focus()
      }}
      className={cn(
        "flex w-full min-w-0 cursor-text items-center bg-field text-foreground",
        "transition-[background-color,box-shadow] duration-100",
        // os mesmos estados do Input `default`, lidos do <input> de dentro
        "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--input)_45%,var(--field))]",
        "hover:shadow-[inset_0_0_0_1px_var(--input)]",
        "has-focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/20",
        "has-aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/15",
        "has-data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] has-data-invalid:ring-[3px] has-data-invalid:ring-destructive/15",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:bg-secondary has-disabled:opacity-70",
        alturas[size],
        className
      )}
    >
      {start ? <Afixo>{start}</Afixo> : null}
      <InputPrimitive
        data-slot="input"
        className="h-full w-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
        {...props}
      />
      {end ? <Afixo>{end}</Afixo> : null}
    </div>
  )
}

function Afixo({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="input-group-addon"
      className="flex shrink-0 items-center text-muted-foreground select-none [&_svg]:size-4"
    >
      {children}
    </span>
  )
}

export { InputGroup }
