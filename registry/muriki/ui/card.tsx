/**
 * Muriki Card.
 *
 * A superfície do cartão que os blocos já usam (`rounded-xl bg-card
 * shadow-xs`), agora como peça: SEM BORDA — a sombra leve e o papel um tom
 * acima da página já desenham o contorno.
 *
 * O cabeçalho é opcional: `title` (14px semibold), `description` e `action`
 * no canto direito. O rodapé entra depois de um `Separator soft`: dentro de
 * peça com contorno, a linha separa sem fechar (veja o separator).
 *
 * `padding`: `md` (20px, padrão), `sm` (14px) e `none` — para lista ou
 * tabela que vai até a borda; aí cabeçalho e rodapé guardam o próprio
 * respiro.
 *
 * Cartão é agrupamento, não botão. Se o cartão inteiro leva a algum lugar,
 * ponha um link no título.
 */
import * as React from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const PAD = { md: "[--card-pad:20px]", sm: "[--card-pad:14px]", none: "[--card-pad:0px]" } as const

export interface CardProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Canto direito do cabeçalho. */
  action?: React.ReactNode
  /** Linha de baixo, depois do filete soft. */
  footer?: React.ReactNode
  padding?: keyof typeof PAD
}

function Card({ title, description, action, footer, padding = "md", className, children, ...props }: CardProps) {
  const cabeca = title || description || action
  const nada = padding === "none"
  return (
    <section
      data-slot="card"
      data-padding={padding}
      className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs", PAD[padding], className)}
      {...props}
    >
      {cabeca ? (
        <header className={cn("flex items-start gap-3", nada ? "px-4 pt-3.5" : "px-(--card-pad) pt-(--card-pad)")}>
          <div className="grid min-w-0 flex-1 gap-0.5">
            {title ? <h3 className="text-sm leading-5 font-semibold text-foreground-strong">{title}</h3> : null}
            {description ? <p className="text-[13px] leading-[18px] text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="-mt-1 -mr-1.5 flex shrink-0 gap-1">{action}</div> : null}
        </header>
      ) : null}
      {children != null ? <div className={cn("min-w-0 p-(--card-pad)", cabeca && "pt-3")}>{children}</div> : null}
      {footer ? (
        <>
          <Separator shape="soft" />
          <footer className={cn("flex items-center gap-2", nada ? "px-4 py-2.5" : "px-(--card-pad) py-3")}>{footer}</footer>
        </>
      ) : null}
    </section>
  )
}

export { Card }
