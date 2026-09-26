"use client"

// A tela de aviso: pouco conteúdo, no centro da tela, fora do shell do app.
// Um ícone num círculo tingido, o título, uma frase, as ações empilhadas na
// largura da coluna e, embaixo, a conta em que a pessoa está. No topo, a
// marca à esquerda e idioma, tema e o email à direita, como nas telas de
// onboarding.
//
// Serve ao acesso suspenso (/suspended), à volta do pagamento e à
// confirmação de email: tudo o que é "aconteceu isto, o próximo passo é
// aquele". Pouco conteúdo pede o centro; à esquerda de uma coluna larga,
// ele vira um canto ocupado e o resto vazio.
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type NoticePageTone = "neutral" | "success" | "attention" | "danger"

const TOM: Record<NoticePageTone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  success: "bg-tone-green text-tone-green-foreground",
  // atenção, não erro: suspenso, pendente, cancelado sem cobrança
  attention: "bg-tone-yellow text-tone-yellow-foreground",
  danger: "bg-tone-red text-tone-red-foreground",
}

export interface NoticePageProps {
  /** Canto superior esquerdo: a marca do produto. */
  brand?: ReactNode
  /** Canto superior direito: idioma e tema. */
  utilities?: ReactNode
  /** O email da conta, à direita das utilidades, depois de um filete. */
  account?: ReactNode
  /** Um ícone do Phosphor; ganha 28px e o círculo no tom. */
  icon: ReactNode
  tone?: NoticePageTone
  title: ReactNode
  description?: ReactNode
  /**
   * As ações, empilhadas na largura da coluna: a principal primeiro
   * (<Button variant="solid" size="touch">), a saída depois (ghost).
   */
  actions?: ReactNode
  /** Embaixo das ações, ex.: "Você está na conta rafael@moura.dev". */
  footer?: ReactNode
  className?: string
  children?: ReactNode
}

export function NoticePage({
  brand,
  utilities,
  account,
  icon,
  tone = "neutral",
  title,
  description,
  actions,
  footer,
  className,
  children,
}: NoticePageProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {brand || utilities || account ? (
        <header className="flex h-16 shrink-0 items-center gap-3 px-6 md:px-8">
          {brand}
          <div className="ml-auto flex items-center gap-1">
            {utilities}
            {account ? (
              <>
                <span aria-hidden className="mx-2.5 h-5 w-px bg-input" />
                <span className="truncate text-[13px] text-muted-foreground">{account}</span>
              </>
            ) : null}
          </div>
        </header>
      ) : null}

      <main
        className={cn(
          "mx-auto flex w-full max-w-[32rem] flex-1 flex-col items-center justify-center gap-5 px-4 pb-20 text-center md:px-6",
          className
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-16 items-center justify-center rounded-full [&_svg]:size-7",
            TOM[tone]
          )}
        >
          {icon}
        </span>
        <div role="status" className="flex flex-col gap-2.5">
          <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground-strong">
            {title}
          </h1>
          {description ? (
            <p className="text-[15px] leading-[23px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
        {actions ? (
          <div className="flex w-full max-w-80 flex-col items-stretch gap-2">{actions}</div>
        ) : null}
        {footer ? <p className="text-[13px] text-muted-foreground">{footer}</p> : null}
      </main>
    </div>
  )
}
