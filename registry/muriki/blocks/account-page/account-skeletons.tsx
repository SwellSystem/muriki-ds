/**
 * Minha conta carregando, com o formato dos cartões dela: Seus dados (o formulário em duas colunas),
 * Aprendizado (as perguntas, os chips de linguagem e os objetivos) e as listas de Segurança
 * (passkeys e sessões, com a linha de 48 ou 44px, o ícone, o nome e a ação).
 *
 * Mesma moldura do AccountCard (px-5 py-4, gap-3.5) e linhas com a altura do texto real. Tudo é
 * aria-hidden; o movimento é o do Skeleton, parado com prefers-reduced-motion.
 */
import type * as React from "react"

import { ChoiceChipsSkeleton } from "@/components/ui/choice-chips"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function LinhaDeTexto({ h, className }: { h: number; className?: string }) {
  return (
    <span className="flex items-center" style={{ height: h }}>
      <Skeleton className={cn("h-[0.7em] min-h-2", className)} style={{ fontSize: h * 0.75 }} />
    </span>
  )
}

/** A moldura do AccountCard carregando: o título, a descrição (opcional) e o corpo. */
export function AccountCardSkeleton({
  description = true,
  action = false,
  className,
  children,
}: {
  description?: boolean
  action?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div aria-hidden data-slot="account-card-skeleton" className={cn("flex flex-col gap-3.5 rounded-lg bg-card px-5 py-4 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <LinhaDeTexto h={20} className="w-32" />
          {description ? <LinhaDeTexto h={18} className="w-[70%]" /> : null}
        </div>
        {action ? <Skeleton className="h-8 w-28 rounded-[8px]" /> : null}
      </div>
      {children}
    </div>
  )
}

function Campo({ largura = "w-20" }: { largura?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <LinhaDeTexto h={18} className={largura} />
      <Skeleton className="h-8 w-full rounded-[8px]" />
    </div>
  )
}

/** Seus dados carregando: apelido e nome lado a lado, o telefone, o CPF e o salvar. */
export function AccountProfileFormSkeleton({ className }: { className?: string }) {
  return (
    <AccountCardSkeleton className={className}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo largura="w-16" />
          <Campo largura="w-28" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Campo largura="w-20" />
          <LinhaDeTexto h={18} className="w-[50%]" />
        </div>
        <Campo largura="w-10" />
        <div className="flex justify-end gap-2 pt-1">
          <Skeleton className="h-8 w-24 rounded-[8px]" />
        </div>
      </div>
    </AccountCardSkeleton>
  )
}

/** Aprendizado carregando: a experiência em cartões, as linguagens em chips e os objetivos. */
export function AccountLearningFormSkeleton({ className }: { className?: string }) {
  const cartoes = (n: number) => (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-xl px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--input)]">
          <LinhaDeTexto h={20} className={["w-24", "w-28", "w-20"][i % 3]} />
          <LinhaDeTexto h={17} className="w-[80%]" />
        </div>
      ))}
    </div>
  )
  return (
    <AccountCardSkeleton className={className}>
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-col gap-3">
          <LinhaDeTexto h={15} className="w-40" />
          {cartoes(6)}
        </div>
        <div className="flex flex-col gap-3">
          <LinhaDeTexto h={15} className="w-44" />
          <ChoiceChipsSkeleton />
        </div>
        <div className="flex flex-col gap-3">
          <LinhaDeTexto h={15} className="w-36" />
          {cartoes(4)}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24 rounded-[8px]" />
        </div>
      </div>
    </AccountCardSkeleton>
  )
}

export interface AccountListSkeletonProps {
  /** `passkeys`: linha de 48px com o nome e a data embaixo; `sessions`: linha de 44px com o aparelho, o IP e a data. */
  kind: "passkeys" | "sessions"
  rows?: number
  className?: string
}

/** As listas de Segurança carregando, no lugar do "nenhuma ainda" falso: o cartão e as linhas. */
export function AccountListSkeleton({ kind, rows = 2, className }: AccountListSkeletonProps) {
  const passkeys = kind === "passkeys"
  return (
    <AccountCardSkeleton action className={className}>
      <div className="flex flex-col">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-3 shadow-[inset_0_-1px_0_var(--muted)]", passkeys ? "min-h-12 py-1.5" : "min-h-11 py-1")}
          >
            <Skeleton className="size-4 shrink-0 rounded-[4px]" />
            <span className="flex min-w-0 flex-1 flex-col">
              <LinhaDeTexto h={20} className={["w-[52%]", "w-[40%]", "w-[60%]"][i % 3]} />
              {passkeys ? <LinhaDeTexto h={16} className="w-24" /> : null}
            </span>
            {passkeys ? null : <Skeleton className="hidden h-3 w-24 md:block" />}
            <Skeleton className="hidden h-3 w-32 sm:block" />
            <span className="flex w-28 justify-end">
              <Skeleton className="h-7 w-20 rounded-[7px]" />
            </span>
          </div>
        ))}
      </div>
    </AccountCardSkeleton>
  )
}
