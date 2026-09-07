// Portado do muriki-platform sem redesenhar.
import type { Icon } from "@phosphor-icons/react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

export interface TaskModalSectionProps {
  icon: Icon
  title: string
  count?: number
  children: ReactNode
}

/**
 * Seção do corpo do modal: cabeçalho mono-uppercase com ícone + contagem
 * opcional, seguido do conteúdo. Espelha `.sect` / `.sect-h` do design.
 */
export function TaskModalSection({
  icon: IconComponent,
  title,
  count,
  children,
}: TaskModalSectionProps) {
  return (
    <section className="px-5 pt-1.5 pb-5">
      <header className="mb-3 flex items-center gap-2 pb-2 font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase shadow-[inset_0_-1px_0_var(--border)]">
        <IconComponent size={13} aria-hidden />
        <span>{title}</span>
        {count !== undefined && count > 0 && (
          <Badge size="sm" count className="normal-case">
            {count}
          </Badge>
        )}
      </header>
      {children}
    </section>
  )
}
