// O cartão de cada assunto da conta: título, uma linha de contexto, a ação
// à direita do título e o conteúdo. `danger` é o de excluir conta: o
// contorno ganha um vermelho tênue, e o vermelho cheio fica só no botão.
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface AccountCardProps {
  title: string
  description?: ReactNode
  /** À direita do título, ex.: "Trocar email", "Adicionar passkey". */
  action?: ReactNode
  tone?: "default" | "danger"
  className?: string
  children?: ReactNode
}

export function AccountCard({
  title,
  description,
  action,
  tone = "default",
  className,
  children,
}: AccountCardProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-3.5 rounded-lg bg-card px-5 py-4 shadow-sm",
        tone === "danger" && "ring-1 ring-destructive/35",
        className
      )}
    >
      <header className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground-strong">{title}</h2>
          {description ? (
            <p className="text-[12.5px] leading-[18px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
