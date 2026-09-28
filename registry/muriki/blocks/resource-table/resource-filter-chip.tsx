"use client"

// O chip de filtro da barra (design/muriki-backoffice, filtro_chip): vazio, é
// o rótulo com o funil num contorno tracejado, um convite; com valor, vira
// "Plano: Pro" no contorno cheio, com a seta de que abre. O menu é o
// dropdown-menu do DS, com a marca da escolha à direita, e "Limpar filtro"
// no fim quando há o que limpar — um X dentro do gatilho seria botão dentro
// de botão.
//
// Controlado. Opção única por padrão (`value: string | null`, o menu fecha
// na escolha); com `multiple`, `value` é a lista e o menu fica aberto para
// marcar mais de uma.
import { CaretDownIcon, FunnelSimpleIcon } from "@phosphor-icons/react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useResourceLabel } from "./labels"

export interface ResourceFilterOption {
  value: string
  label: string
}

interface BaseProps {
  /** O nome do filtro, ex.: "Plano". */
  label: string
  options: ResourceFilterOption[]
  className?: string
}

export type ResourceFilterChipProps = BaseProps &
  (
    | { multiple?: false; value: string | null; onValueChange: (value: string | null) => void }
    | { multiple: true; value: string[]; onValueChange: (value: string[]) => void }
  )

export function ResourceFilterChip(props: ResourceFilterChipProps) {
  const { label, options, className } = props
  const t = useResourceLabel()
  const rotulo = (v: string) => options.find((o) => o.value === v)?.label ?? v

  const escolhidos = props.multiple ? props.value : props.value === null ? [] : [props.value]
  const ativo = escolhidos.length > 0
  // na múltipla, "Plano: Pro +1" para a barra não crescer a cada marca
  const resumo = ativo
    ? rotulo(escolhidos[0]) + (escolhidos.length > 1 ? ` +${escolhidos.length - 1}` : "")
    : null

  const limpar = () => (props.multiple ? props.onValueChange([]) : props.onValueChange(null))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="resource-filter-chip"
        data-active={ativo || undefined}
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-dashed max-md:h-10 max-md:rounded-[10px] border-input bg-transparent px-2.5 text-[13px] text-muted-foreground outline-none transition-colors",
          "hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[popup-open]:bg-secondary",
          "data-active:border-solid data-active:bg-field",
          className
        )}
      >
        {ativo ? null : <FunnelSimpleIcon aria-hidden className="size-3.5" />}
        <span>
          {label}
          {resumo ? ":" : null}
        </span>
        {resumo ? (
          <>
            <span className="font-medium text-foreground-strong">{resumo}</span>
            <CaretDownIcon aria-hidden className="size-3" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {props.multiple ? (
          options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={props.value.includes(o.value)}
              onCheckedChange={(marcado) =>
                props.onValueChange(
                  marcado ? [...props.value, o.value] : props.value.filter((v) => v !== o.value)
                )
              }
            >
              {o.label}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup
            value={props.value ?? ""}
            onValueChange={(v) => props.onValueChange(String(v))}
          >
            {options.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value} closeOnClick>
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        {ativo ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={limpar}>{t("resource.clear_filter")}</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
