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
 * muted-foreground, vira aviso nos últimos 10% e vermelho no limite.
 *
 * Com o contador, a conta é em caracteres de verdade (code points), como a
 * API conta: um emoji vale 1, e não 2 como no `maxLength` nativo, que mede
 * em UTF-16 e cortaria a nota antes do limite. Por isso o limite passa a
 * ser do componente — o texto que passa do máximo é aparado antes do
 * onChange — e o contador fica ligado ao campo por aria-describedby.
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
  const contadorId = React.useId()
  const { maxLength, onChange, ...resto } = props
  // controlado, o tamanho vem do `value`; solto, do que a pessoa digitou
  const [digitado, setDigitado] = React.useState(() => caracteres(String(props.defaultValue ?? "")))
  const contar = showCount && maxLength !== undefined
  const usados = typeof props.value === "string" ? caracteres(props.value) : digitado

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
      {...resto}
      // sem contador, o limite é o nativo, como sempre; com ele, é o aparo em code points
      maxLength={contar ? undefined : maxLength}
      aria-describedby={contar ? [props["aria-describedby"], contadorId].filter(Boolean).join(" ") : props["aria-describedby"]}
      onChange={(event) => {
        if (contar) {
          const pontos = Array.from(event.currentTarget.value)
          if (pontos.length > maxLength) event.currentTarget.value = pontos.slice(0, maxLength).join("")
        }
        onChange?.(event)
      }}
      onInput={(event) => {
        ajustar()
        // o aparo pode rodar depois deste evento: o contador nunca passa do máximo
        setDigitado(Math.min(caracteres(event.currentTarget.value), maxLength ?? Infinity))
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

  const max = maxLength
  return (
    <div data-slot="textarea-count-wrapper" className="flex w-full min-w-0 flex-col gap-1">
      {campo}
      <span
        id={contadorId}
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

/** Caracteres como a pessoa (e a API) conta: um emoji é um, não dois. */
function caracteres(texto: string) {
  return Array.from(texto).length
}

export { Textarea }
