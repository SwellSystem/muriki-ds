/**
 * Muriki Accordion.
 *
 * As seções que recolhem, no desenho da `ExerciseSection` do exercise-workspace:
 * cabeçalho de 38px com a seta e o título em rótulo mono maiúsculo, contagem
 * opcional ao lado e um canto direito (`end`) para ações da seção. Entre uma
 * seção e outra, o filete `--muted`.
 *
 * `type="multiple"` (padrão) deixa várias abertas — começam todas abertas;
 * `type="single"` fecha a anterior ao abrir outra. Controlado com
 * `value`/`onValueChange`, ou solto com `defaultValue`.
 *
 * Ao abrir, o corpo chega com o desfoque de sempre e a seta gira 90°. Com
 * "reduzir movimento", só troca.
 */
import * as React from "react"
import { CaretRightIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export interface AccordionItem {
  id: string
  title: React.ReactNode
  /** Ao lado do título, em mono (ex.: quantos itens a seção tem). */
  count?: React.ReactNode
  /** Canto direito do cabeçalho: ações da seção. */
  end?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

type Comum = { items: AccordionItem[]; className?: string }
export type AccordionProps = Comum &
  (
    | { type?: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
    | { type: "single"; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
  )

function Accordion(props: AccordionProps) {
  const { items, className } = props
  const multiple = props.type !== "single"
  const controlado = props.value !== undefined
  const [solto, setSolto] = React.useState<string[] | string | null>(() =>
    props.defaultValue !== undefined ? props.defaultValue : multiple ? items.map((it) => it.id) : null
  )
  const atual = controlado ? props.value : solto
  const abertas: string[] = multiple ? ((atual as string[] | undefined) ?? []) : atual != null ? [atual as string] : []
  const base = React.useId()

  function alternar(id: string) {
    const aberta = abertas.includes(id)
    const prox = multiple ? (aberta ? abertas.filter((x) => x !== id) : [...abertas, id]) : aberta ? null : id
    if (!controlado) setSolto(prox)
    ;(props.onValueChange as ((v: string[] | string | null) => void) | undefined)?.(prox)
  }

  return (
    <div data-slot="accordion" className={cn("flex flex-col", className)}>
      {items.map((it, i) => {
        const aberta = abertas.includes(it.id)
        const corpo = `${base}-${i}`
        return (
          <section
            key={it.id}
            data-slot="accordion-item"
            data-state={aberta ? "open" : "closed"}
            className="group/acc [&+&]:border-t [&+&]:border-muted"
          >
            <div className="flex h-[38px] items-center gap-1.5 pr-1.5 pl-2.5">
              <button
                type="button"
                aria-expanded={aberta}
                aria-controls={corpo}
                disabled={it.disabled}
                onClick={() => alternar(it.id)}
                className="flex h-[26px] items-center gap-1.5 rounded-md px-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none disabled:cursor-default disabled:opacity-45"
              >
                <CaretRightIcon
                  aria-hidden
                  className="size-3 transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] group-data-[state=open]/acc:rotate-90 motion-reduce:transition-none"
                />
                <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] uppercase">{it.title}</span>
                {it.count != null ? <span className="font-mono text-[10px] text-muted-foreground opacity-80">{it.count}</span> : null}
              </button>
              {it.end ? <span className="ml-auto flex items-center gap-0.5">{it.end}</span> : null}
            </div>
            <div id={corpo} hidden={!aberta} className="muriki-accordion-body">
              {it.content}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export { Accordion }
