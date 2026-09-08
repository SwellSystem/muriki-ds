"use client"

import * as React from "react"
import { CirclesThree } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

/**
 * Muriki Acrílico — O leque do canto. Um gatilho redondo no canto inferior
 * direito e três pílulas que sobem uma escada diagonal para cima e para a
 * esquerda. É o menu do SISTEMA — tema, integrações, configurações — e por
 * isso fica fora da órbita: a órbita é o que você faz, o canto é onde você
 * ajusta a máquina.
 *
 * Abre sozinho no fim da sequência (`defaultOpen`), e o gatilho recolhe e
 * reabre. Fechado, as pílulas voltam para dentro do gatilho — a escada se
 * recolhe, não desaparece.
 */
export interface AcrylicCornerItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onSelect?: () => void
}

export interface AcrylicCornerMenuProps {
  items: AcrylicCornerItem[]
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Ícone do gatilho. Default: três círculos. */
  trigger?: React.ReactNode
  /** aria-label do gatilho. */
  label?: string
  className?: string
}

function AcrylicCornerMenu({
  items,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  trigger,
  label = "Sistema",
  className,
}: AcrylicCornerMenuProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled

  function toggle() {
    const next = !open
    if (!isControlled) setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <div
      data-slot="acrylic-corner"
      data-open={open || undefined}
      className={cn("acr-corner", className)}
    >
      {items.map((item, j) => {
        // j+1: o degrau zero é o próprio gatilho.
        const style = { "--j": j + 1 } as React.CSSProperties
        const body = (
          <>
            {item.icon}
            <span>{item.label}</span>
          </>
        )
        return item.href ? (
          <a
            key={item.id}
            className="acr-corner-item acr-pane acr-pane-interactive"
            style={style}
            href={item.href}
            onClick={item.onSelect}
            tabIndex={open ? 0 : -1}
          >
            {body}
          </a>
        ) : (
          <button
            key={item.id}
            type="button"
            className="acr-corner-item acr-pane acr-pane-interactive"
            style={style}
            onClick={item.onSelect}
            tabIndex={open ? 0 : -1}
          >
            {body}
          </button>
        )
      })}
      <button
        type="button"
        className="acr-corner-trigger acr-pane acr-pane-interactive"
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
      >
        {trigger ?? <CirclesThree weight="bold" />}
      </button>
    </div>
  )
}

export { AcrylicCornerMenu }
