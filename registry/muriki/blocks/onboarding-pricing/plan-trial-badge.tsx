// Selo de teste grátis. No platform era uma pílula própria — `bg-success/10`,
// `text-success`, `rounded-full` — desenhada à mão ao lado de um Badge que
// já existia. Aqui é o Badge da casa no tom verde, com a letra mono
// espaçada que dá o ar editorial do onboarding.
//
// Bloco portado veste a pele da casa: quem decide fundo, tinta e raio é o
// Badge; o que este arquivo acrescenta é só o tratamento tipográfico.
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PlanTrialBadgeProps {
  label: string
  className?: string
}

export function PlanTrialBadge({ label, className }: PlanTrialBadgeProps) {
  return (
    <Badge
      tone="green"
      size="sm"
      className={cn(
        "font-mono tracking-[0.18em] uppercase",
        className
      )}
    >
      {label}
    </Badge>
  )
}
