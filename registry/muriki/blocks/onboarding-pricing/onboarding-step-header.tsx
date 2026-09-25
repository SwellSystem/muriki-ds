// Cabeçalho editorial do passo. O original abria com `font-serif`, que no
// platform apontava para o Geist e aqui cairia na serifada do navegador —
// a mesma armadilha que já pegou o login e o modal de task. O título usa a
// tipografia de display da casa: peso semibold e tracking negativo, igual
// ao herói da tela de entrada.
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { OnboardingStepper } from "./onboarding-stepper"

export interface OnboardingStepHeaderProps {
  step: number
  total?: number
  stepperLabel?: string
  stepperAriaLabel: string
  title: string
  subtitle?: ReactNode
  /**
   * `center` para passo de pouco conteúdo numa coluna estreita (o código por
   * email): rótulo, título e subtítulo no eixo, e o título um degrau menor
   * (40px) para caber em 480px sem quebrar. Padrão: `start`.
   */
  align?: "start" | "center"
}

export function OnboardingStepHeader({
  step,
  total,
  stepperLabel,
  stepperAriaLabel,
  title,
  subtitle,
  align = "start",
}: OnboardingStepHeaderProps) {
  const centro = align === "center"
  return (
    <header className={cn("flex flex-col gap-4", centro && "items-stretch text-center")}>
      <OnboardingStepper
        step={step}
        total={total}
        label={stepperLabel}
        ariaLabel={stepperAriaLabel}
      />
      <div className="flex flex-col gap-3">
        <h1
          className={cn(
            "leading-[1.02] font-semibold tracking-[-0.03em] text-foreground-strong",
            centro ? "text-[clamp(2rem,6vw,2.5rem)]" : "text-[clamp(2rem,6vw,3.25rem)]"
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className={cn("max-w-prose text-sm text-muted-foreground md:text-base", centro && "mx-auto")}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  )
}
