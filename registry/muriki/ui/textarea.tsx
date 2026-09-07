"use client"

/**
 * Muriki Textarea.
 *
 * O mesmo campo do Input — superfície `--field`, filete de 1px por dentro,
 * sem sulco — só que alto. As variantes e os estados são compartilhados
 * com ele por `inputVariants`: se o campo mudar, os dois mudam juntos, e é
 * isso que impede a caixa de texto de virar um primo distante.
 *
 * O que é próprio daqui é o comportamento do redimensionamento: `resize-y`
 * por padrão, e `autoResize` para os campos que devem crescer com o texto
 * — descrição de task cresce, campo de busca não.
 */
import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { inputVariants } from "./input"

export type TextareaProps = Omit<React.ComponentProps<"textarea">, "size"> &
  Omit<VariantProps<typeof inputVariants>, "size"> & {
    /** Cresce com o conteúdo e some com a barra de rolagem. */
    autoResize?: boolean
    rows?: number
  }

function Textarea({
  className,
  variant = "default",
  autoResize = false,
  rows = 3,
  ...props
}: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const ajustar = React.useCallback(() => {
    const el = ref.current
    if (!el || !autoResize) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [autoResize])

  // Reajusta quando o valor vem de fora (controlado), não só ao digitar.
  React.useEffect(ajustar, [ajustar, props.value])

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      rows={rows}
      onInput={(event) => {
        ajustar()
        props.onInput?.(event)
      }}
      className={cn(
        inputVariants({ variant }),
        "min-h-16 rounded-[8px] px-[11px] py-2 text-[0.8125rem] leading-5",
        autoResize ? "resize-none overflow-hidden" : "resize-y",
        variant === "underline" && "rounded-none px-0",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
