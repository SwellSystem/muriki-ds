// O skeleton TEM A ANATOMIA do card: nome curto, descrição longa, selo,
// preço grande, quatro linhas de feature com larguras diferentes e o botão.
// É isso que faz a espera parecer o conteúdo chegando em vez de blocos
// piscando — larguras iguais denunciam a preguiça.
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface PlanCardSkeletonProps {
  emphasized?: boolean
  className?: string
}

export function PlanCardSkeleton({
  emphasized = false,
  className,
}: PlanCardSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        // Veio do platform na letra, e acompanha o card quando ele muda: o
        // anel do destaque saiu junto com o do card, e a linha do selo virou
        // altura reservada em vez de peça absoluta no canto.
        "relative flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:p-6",
        emphasized ? "border-primary" : "border-border",
        className
      )}
    >
      {/* A linha do selo é reservada em TODOS, com ou sem selo — é o que o
          card faz, e é o que impede o título de pular quando o conteúdo
          chega. */}
      <div className="flex h-[22px] items-center">
        {emphasized ? (
          <Skeleton className="h-[18px] w-24 rounded-[4px] bg-primary/25" />
        ) : null}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32 md:w-36" />
        <Skeleton className="h-3 w-44" />
      </div>

      <Skeleton className="h-5 w-28 rounded-full" />

      <div className="space-y-2">
        <Skeleton className="h-9 w-36 md:h-10 md:w-44" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-[72%]" />
        <Skeleton className="h-3 w-[78%]" />
        <Skeleton className="h-3 w-[60%]" />
      </div>

      <Skeleton className={cn("h-10 w-full", emphasized && "bg-primary/25")} />
    </div>
  )
}
