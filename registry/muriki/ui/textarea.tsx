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
 *
 * `showCount` com `maxLength` põe o contador "n/max" logo abaixo do campo,
 * à direita — fora da caixa, para nunca cobrir o texto quando ele rola.
 * Ele fica calado até perto do fim: em
 * muted-foreground, vira aviso nos últimos 10% e vermelho no limite. É só
 * visual (aria-hidden); o limite de verdade é o `maxLength` nativo, que o
 * leitor de tela já anuncia.
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
    /** Com `maxLength`, mostra "n/max" no canto de baixo. */
    showCount?: boolean
  }

function Textarea({
  className,
  variant = "default",
  autoResize = false,
  rows = 3,
  showCount = false,
  ...props
}: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  // controlado, o tamanho vem do `value`; solto, do que a pessoa digitou
  const [digitado, setDigitado] = React.useState(() => String(props.defaultValue ?? "").length)
  const contar = showCount && props.maxLength !== undefined
  const usados = typeof props.value === "string" ? props.value.length : digitado

  const ajustar = React.useCallback(() => {
    const el = ref.current
    if (!el || !autoResize) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [autoResize])

  // Reajusta quando o valor vem de fora (controlado), não só ao digitar.
  React.useEffect(ajustar, [ajustar, props.value])

  const campo = (
    <textarea
      ref={ref}
      data-slot="textarea"
      rows={rows}
      {...props}
      onInput={(event) => {
        ajustar()
        setDigitado(event.currentTarget.value.length)
        props.onInput?.(event)
      }}
      className={cn(
        inputVariants({ variant }),
        "min-h-16 rounded-[8px] px-[11px] py-2 text-[0.8125rem] leading-5",
        autoResize ? "resize-none overflow-hidden" : "resize-y",
        variant === "underline" && "rounded-none px-0",
        className
      )}
    />
  )
  if (!contar) return campo

  const max = props.maxLength as number
  return (
    <div data-slot="textarea-count-wrapper" className="flex w-full min-w-0 flex-col gap-1">
      {campo}
      <span
        aria-hidden
        data-slot="textarea-count"
        className={cn(
          "self-end font-mono text-[11px] leading-4 tabular-nums text-muted-foreground",
          usados >= max ? "text-destructive" : usados >= max * 0.9 && "text-warning"
        )}
      >
        {usados}/{max}
      </span>
    </div>
  )
}

export { Textarea }
