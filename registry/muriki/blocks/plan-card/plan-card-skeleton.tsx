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
        "relative flex flex-col gap-4 rounded-lg bg-card p-4 md:p-6",
        emphasized
          ? "shadow-[var(--float),inset_0_0_0_1px_var(--primary-subtle-border)]"
          : "shadow-[inset_0_0_0_1px_var(--border)]",
        className
      )}
    >
      {emphasized ? (
        <Skeleton className="absolute top-3 right-3 h-[22px] w-24 rounded-full bg-primary-subtle" />
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

      <div className="flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-[72%]" />
        <Skeleton className="h-3 w-[78%]" />
        <Skeleton className="h-3 w-[60%]" />
      </div>

      <Skeleton className={cn("h-10 w-full", emphasized && "bg-primary-subtle")} />
    </div>
  )
}
