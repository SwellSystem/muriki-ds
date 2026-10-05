// O skeleton TEM A ANATOMIA do card: nome curto, descrição longa, selo,
// preço grande, quatro linhas de feature com larguras diferentes e o botão.
// É isso que faz a espera parecer o conteúdo chegando em vez de blocos
// piscando — larguras iguais denunciam a preguiça.
import { Skeleton } from "@/components/ui/skeleton"
import { PlanFeatureRowsSkeleton } from "./plan-feature-rows"
import { cn } from "@/lib/utils"

export interface PlanCardSkeletonProps {
  emphasized?: boolean
  /** A silhueta das linhas de recursos (PlanFeatureRows) no lugar das quatro frases. */
  featureRows?: boolean
  className?: string
}

export function PlanCardSkeleton({
  emphasized = false,
  featureRows = false,
  className,
}: PlanCardSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        // Veio do platform na letra, e acompanha o card: o anel do
        // destaque e a aba do selo no canto.
        "relative flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:p-6",
        emphasized ? "border-primary/60 ring-1 ring-primary/20" : "border-border/70",
        className
      )}
    >
      {/* A aba do selo, no canto, como no card. */}
      {emphasized ? (
        <Skeleton className="absolute top-0 right-0 h-[18px] w-20 rounded-none rounded-bl-lg bg-primary/25!" />
      ) : null}

      <div className="space-y-2">
        <Skeleton className="h-5 w-32 md:w-36" />
        <Skeleton className="h-3 w-44" />
      </div>

      <Skeleton className="h-5 w-28 rounded-full" />

      <div className="space-y-2">
        <Skeleton className="h-9 w-36 md:h-10 md:w-44" />
        <Skeleton className="h-3 w-16" />
      </div>

      {featureRows ? (
        <PlanFeatureRowsSkeleton className="flex-1" />
      ) : (
        <div className="flex-1 space-y-2.5 pt-1">
          <Skeleton className="h-3 w-[85%]" />
          <Skeleton className="h-3 w-[72%]" />
          <Skeleton className="h-3 w-[78%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      )}

      <Skeleton className={cn("h-10 w-full", emphasized && "bg-primary/25!")} />
    </div>
  )
}
