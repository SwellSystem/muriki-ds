// Cabeçalho editorial do passo. O original abria com `font-serif`, que no
// platform apontava para o Geist e aqui cairia na serifada do navegador —
// a mesma armadilha que já pegou o login e o modal de task. O título usa a
// tipografia de display da casa: peso semibold e tracking negativo, igual
// ao herói da tela de entrada.
import type { ReactNode } from "react"

import { OnboardingStepper } from "./onboarding-stepper"

export interface OnboardingStepHeaderProps {
  step: number
  total?: number
  stepperLabel?: string
  stepperAriaLabel: string
  title: string
  subtitle?: ReactNode
}

export function OnboardingStepHeader({
  step,
  total,
  stepperLabel,
  stepperAriaLabel,
  title,
  subtitle,
}: OnboardingStepHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <OnboardingStepper
        step={step}
        total={total}
        label={stepperLabel}
        ariaLabel={stepperAriaLabel}
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(2rem,6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground-strong">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  )
}
