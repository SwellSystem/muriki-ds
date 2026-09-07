// Portado do muriki-platform e vestido com a casa: a trilha vazia era
// `bg-muted`, que no escuro fica quase igual ao fundo e some. Aqui ela é
// `--sunken` — o mesmo afundado que os campos usam, então a barra cheia
// tem contra o que se destacar nos dois temas.
import { cn } from "@/lib/utils"

export interface OnboardingStepperProps {
  /** Passo atual, começando em 1. */
  step: number
  /** Total de passos. O platform fixava em 5; aqui é do consumidor. */
  total?: number
  /** Rótulo mono acima da barra, ex.: "Passo 2 de 5". */
  label?: string
  ariaLabel: string
  className?: string
}

export function OnboardingStepper({
  step,
  total = 5,
  label,
  ariaLabel,
  className,
}: OnboardingStepperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={ariaLabel}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-sm transition-colors duration-300",
              i < step ? "bg-primary" : "bg-sunken"
            )}
          />
        ))}
      </div>
    </div>
  )
}
