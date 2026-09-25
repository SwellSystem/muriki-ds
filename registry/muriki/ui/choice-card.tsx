"use client"

/**
 * Muriki ChoiceCard — a opção que é um cartão: título e uma linha que diz o
 * que ela significa. Para quando o rótulo sozinho não basta para escolher
 * ("Intermediário" só decide com "trabalho com código todo dia").
 *
 * UM componente, dois comportamentos, escolhidos no grupo: `single` é
 * RadioGroup do Base UI (setas navegam, uma marcada), `multiple` é
 * CheckboxGroup (cada uma liga e desliga). O cartão não finge ser outra
 * coisa: o indicador é a bolinha do radio ou o quadrado do checkbox, para
 * que "escolha uma" e "escolha várias" se leiam antes de clicar.
 *
 * `min` e `max` valem no múltiplo: no teto, as desmarcadas travam (e
 * esmaecem: não estão disponíveis); no piso, a última marcada não sai, mas
 * continua com a cara de marcada — esmaecer uma escolha feita a faria
 * parecer desligada. A regra fica visível em vez de virar erro.
 *
 * No single, `value={null}` é controlado e vazio: nada escolhido ainda, sem
 * o grupo trocar de não controlado para controlado quando a pessoa escolhe.
 *
 * Marcado, o cartão ganha o anel da marca por fora — o mesmo destaque do
 * plan-card escolhido — e não um fundo tingido, que em grade de quatro
 * pesaria como um botão apertado.
 */
import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { CheckIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

type Contexto = { tipo: "single" | "multiple"; travadas: (v: string) => boolean }
const ChoiceCardContext = React.createContext<Contexto>({ tipo: "single", travadas: () => false })

const CARTAO = [
  "group/choice relative flex cursor-pointer flex-col gap-1 rounded-[12px] bg-card p-4 text-left outline-none",
  "shadow-sm ring-1 ring-border transition-[box-shadow] duration-150",
  "hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50",
  "data-[checked]:ring-[1.5px] data-[checked]:ring-primary data-[checked]:shadow-md",
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:shadow-sm",
].join(" ")

type Base = {
  "aria-label"?: string
  className?: string
  children: React.ReactNode
}

export type ChoiceCardGroupProps =
  | (Base & { type?: "single"; value?: string | null; defaultValue?: string; onValueChange?: (value: string) => void })
  | (Base & {
      type: "multiple"
      value?: string[]
      defaultValue?: string[]
      onValueChange?: (value: string[]) => void
      /** Mínimo marcado: a última que chega ao piso não desmarca. */
      min?: number
      /** Máximo marcado: no teto, as desmarcadas travam. */
      max?: number
    })

function ChoiceCardGroup(props: ChoiceCardGroupProps) {
  const grade = cn("grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]", props.className)
  // o estado interno do múltiplo mora fora do if: hooks não podem ser condicionais
  const [interno, setInterno] = React.useState<string[]>(
    props.type === "multiple" ? (props.defaultValue ?? []) : []
  )

  if (props.type === "multiple") {
    const { value, onValueChange, min = 0, max = Infinity } = props
    const atual = value ?? interno
    // só as desmarcadas travam (no teto); a marcada no piso fica livre e
    // o onValueChange abaixo recusa a saída dela
    const travadas = (v: string) => !atual.includes(v) && atual.length >= max
    return (
      <ChoiceCardContext.Provider value={{ tipo: "multiple", travadas }}>
        <CheckboxGroupPrimitive
          data-slot="choice-card-group"
          aria-label={props["aria-label"]}
          value={atual}
          onValueChange={(next) => {
            if (next.length < min || next.length > max) return
            if (value === undefined) setInterno(next)
            onValueChange?.(next)
          }}
          className={grade}
        >
          {props.children}
        </CheckboxGroupPrimitive>
      </ChoiceCardContext.Provider>
    )
  }

  const { value, defaultValue, onValueChange } = props
  return (
    <ChoiceCardContext.Provider value={{ tipo: "single", travadas: () => false }}>
      <RadioGroupPrimitive
        data-slot="choice-card-group"
        aria-label={props["aria-label"]}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => onValueChange?.(v as string)}
        className={grade}
      >
        {props.children}
      </RadioGroupPrimitive>
    </ChoiceCardContext.Provider>
  )
}

export interface ChoiceCardProps {
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}

function ChoiceCard({ value, title, description, disabled, className }: ChoiceCardProps) {
  const { tipo, travadas } = React.useContext(ChoiceCardContext)
  const conteudo = (indicador: React.ReactNode) => (
    <>
      <span className="flex items-center gap-2">
        {indicador}
        <span className="text-[14.5px] leading-5 font-semibold text-foreground-strong">{title}</span>
      </span>
      {description ? (
        <span className="text-[12.5px] leading-[17px] text-muted-foreground">{description}</span>
      ) : null}
    </>
  )

  if (tipo === "multiple") {
    return (
      <CheckboxPrimitive.Root
        data-slot="choice-card"
        value={value}
        disabled={disabled || travadas(value)}
        className={cn(CARTAO, className)}
      >
        {conteudo(
          <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-card text-primary-foreground shadow-[inset_0_0_0_1.5px_var(--input)] group-data-[checked]/choice:bg-primary group-data-[checked]/choice:shadow-none">
            <CheckboxPrimitive.Indicator>
              <CheckIcon weight="bold" className="size-3" />
            </CheckboxPrimitive.Indicator>
          </span>
        )}
      </CheckboxPrimitive.Root>
    )
  }

  return (
    <RadioPrimitive.Root data-slot="choice-card" value={value} disabled={disabled} className={cn(CARTAO, className)}>
      {conteudo(
        <span className="flex size-3.5 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--input)] group-data-[checked]/choice:shadow-[inset_0_0_0_4px_var(--primary)]" />
      )}
    </RadioPrimitive.Root>
  )
}

export { ChoiceCardGroup, ChoiceCard }
