// Portado do muriki-platform sem redesenhar.
import type { Icon } from "@phosphor-icons/react"
import type { ReactNode } from "react"

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
      <header className="mb-3 flex items-center gap-2 border-b border-border/70 pb-2 font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
        <IconComponent size={13} aria-hidden />
        <span>{title}</span>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[10px] text-foreground/80 normal-case">
            {count}
          </span>
        )}
      </header>
      {children}
    </section>
  )
}
