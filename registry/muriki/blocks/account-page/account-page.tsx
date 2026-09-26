"use client"

// A página de conta dentro do app-shell (design/muriki-code, conta.py):
// título, a frase de baixo e as abas por LINK — cada aba é uma rota
// (/account, /account/learning, /account/security, /account/plan), então
// voltar e compartilhar funcionam. O conteúdo de cada aba é do app,
// montado com os cartões deste bloco.
import { cloneElement, type ReactElement, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface AccountPageTab {
  key: string
  label: string
  active?: boolean
  /** O elemento que navega, ex.: <Link to="/account/security" />. Ganha de `href`. */
  render?: ReactElement
  href?: string
}

export interface AccountPageProps {
  title: ReactNode
  subtitle?: ReactNode
  tabs: AccountPageTab[]
  /** Nome da navegação das abas para leitor de tela, ex.: "Seções da conta". */
  tabsLabel: string
  className?: string
  children: ReactNode
}

export function AccountPage({
  title,
  subtitle,
  tabs,
  tabsLabel,
  className,
  children,
}: AccountPageProps) {
  return (
    <div className={cn("flex w-full max-w-[1080px] flex-col gap-5", className)}>
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-[70ch] text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      <nav
        aria-label={tabsLabel}
        className="flex gap-6 overflow-x-auto shadow-[inset_0_-1px_0_var(--muted)]"
      >
        {tabs.map((tab) => (
          <Aba key={tab.key} tab={tab} />
        ))}
      </nav>
      {children}
    </div>
  )
}

function Aba({ tab }: { tab: AccountPageTab }) {
  const props = {
    "aria-current": tab.active ? ("page" as const) : undefined,
    className: cn(
      "flex h-10 shrink-0 items-center px-0.5 text-[13.5px] whitespace-nowrap outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring/35",
      tab.active
        ? "font-medium text-foreground-strong shadow-[inset_0_-2px_0_var(--primary)]"
        : "text-muted-foreground hover:text-foreground"
    ),
    children: tab.label,
  }
  if (tab.render) return cloneElement(tab.render, props)
  return <a href={tab.href} {...props} />
}
