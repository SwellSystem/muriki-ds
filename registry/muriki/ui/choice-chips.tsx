"use client"

/**
 * Muriki ChoiceChips — escolha múltipla em chips, agrupada por categoria:
 * "que linguagens você usa", "que áreas interessam". Para quando as opções
 * são muitas e curtas, e um cartão por opção viraria uma parede.
 *
 * Cada grupo é uma linha: o nome da categoria à esquerda, os chips à
 * direita. Um só ToggleGroup `multiple` do Base UI por grupo, com o valor
 * total guardado aqui, então setas e espaço funcionam como num grupo de
 * botões de alternância e o leitor de tela anuncia "pressionado".
 *
 * Marcado, o chip é tingido com a marca e ganha o check — a forma muda,
 * não só a cor. `soon` é a opção que existe mas ainda não está disponível:
 * aparece, travada, com o selo mono ("em breve"), porque esconder faria a
 * pessoa achar que a linguagem dela não está no plano.
 */
import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { CheckIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export interface ChoiceChip {
  value: string
  label: string
  /** Existe, mas ainda não está disponível: aparece travado com `soonLabel`. */
  soon?: boolean
}

export interface ChoiceChipGroup {
  label: string
  items: ChoiceChip[]
}

export interface ChoiceChipsProps {
  groups: ChoiceChipGroup[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** "em breve", no idioma do app. */
  soonLabel: string
  "aria-label"?: string
  className?: string
}

function ChoiceChips({
  groups,
  value,
  defaultValue = [],
  onValueChange,
  soonLabel,
  className,
  ...props
}: ChoiceChipsProps) {
  const [interno, setInterno] = React.useState(defaultValue)
  const atual = value ?? interno

  function mudarGrupo(itens: ChoiceChip[], marcadosNoGrupo: string[]) {
    const doGrupo = new Set(itens.map((i) => i.value))
    const next = atual.filter((v) => !doGrupo.has(v)).concat(marcadosNoGrupo)
    if (value === undefined) setInterno(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="choice-chips"
      role="group"
      aria-label={props["aria-label"]}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {groups.map((g) => (
        <div key={g.label} className="flex items-start gap-3.5">
          <span className="w-24 shrink-0 pt-1.5 text-xs text-muted-foreground">{g.label}</span>
          <ToggleGroupPrimitive
            multiple
            aria-label={g.label}
            value={atual.filter((v) => g.items.some((i) => i.value === v))}
            onValueChange={(next) => mudarGrupo(g.items, next as string[])}
            className="flex flex-wrap gap-1.5"
          >
            {g.items.map((item) => (
              <TogglePrimitive
                key={item.value}
                value={item.value}
                disabled={item.soon}
                className={cn(
                  "inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium outline-none",
                  "bg-card text-foreground shadow-[inset_0_0_0_1px_var(--input)] transition-[background-color,box-shadow,color]",
                  "hover:shadow-[inset_0_0_0_1px_var(--foreground)] focus-visible:ring-2 focus-visible:ring-ring/50",
                  "data-[pressed]:bg-primary-subtle data-[pressed]:text-primary-subtle-foreground data-[pressed]:shadow-[inset_0_0_0_1px_var(--primary)]",
                  "data-[disabled]:cursor-not-allowed data-[disabled]:bg-transparent data-[disabled]:text-muted-foreground data-[disabled]:shadow-[inset_0_0_0_1px_var(--divider)]"
                )}
              >
                {atual.includes(item.value) ? <CheckIcon aria-hidden weight="bold" className="size-3" /> : null}
                {item.label}
                {item.soon ? (
                  <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
                    {soonLabel}
                  </span>
                ) : null}
              </TogglePrimitive>
            ))}
          </ToggleGroupPrimitive>
        </div>
      ))}
    </div>
  )
}

export { ChoiceChips }
