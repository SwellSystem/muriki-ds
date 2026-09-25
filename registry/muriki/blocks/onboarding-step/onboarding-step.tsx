"use client"

// A página de um passo do onboarding: a barra do topo (marca à esquerda,
// idioma e tema à direita), o cabeçalho do passo e, embaixo do conteúdo, a
// ação principal com uma nota ao lado. É a moldura que Verificação, Perfil e
// Preferências usam; a escolha de plano é a PricingScreen, que já traz o
// mesmo cabeçalho.
//
// O cabeçalho é o OnboardingStepHeader do onboarding-pricing, importado de
// lá e não copiado: rótulo mono, barra de passos e título de display são UMA
// peça, e a tela de plano e as outras não podem divergir.
//
// A ação é um <Button> de verdade, com o `loading` do sistema: o passo
// espera a API (verificar o código, salvar o perfil) e o botão trava com o
// spinner no lugar da seta. A nota ao lado é o que a pessoa precisa saber
// antes de clicar ("7 dias grátis; a cobrança só começa depois").
import type { ReactNode } from "react"
import { ArrowRightIcon, SpinnerGapIcon } from "@phosphor-icons/react"

// Do arquivo, nunca do barril: o `shadcn add` reescreve o caminho para o
// alvo do item (ver a nota em pricing-screen.tsx).
import { OnboardingStepHeader } from "@/components/blocks/onboarding-pricing/onboarding-step-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface OnboardingStepAction {
  label: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  /** `submit` quando o conteúdo é um <form> e a ação o envia. */
  type?: "button" | "submit"
  form?: string
}

export interface OnboardingStepProps {
  step: number
  total: number
  /** Rótulo mono acima da barra, ex.: "Primeiro acesso · 2 de 4". */
  stepperLabel?: string
  stepperAriaLabel: string
  title: string
  subtitle?: ReactNode
  /** Canto superior esquerdo — a marca do produto. */
  brand?: ReactNode
  /** Canto superior direito — idioma, tema, a conta. */
  utilities?: ReactNode
  action?: OnboardingStepAction
  /** Ao lado da ação: o que saber antes de clicar. */
  note?: ReactNode
  /** Largura do conteúdo. O cabeçalho acompanha. Padrão: 64rem. */
  className?: string
  children?: ReactNode
}

export function OnboardingStep({
  step,
  total,
  stepperLabel,
  stepperAriaLabel,
  title,
  subtitle,
  brand,
  utilities,
  action,
  note,
  className,
  children,
}: OnboardingStepProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {brand || utilities ? (
        <header className="flex h-16 shrink-0 items-center gap-3 px-6 md:px-8">
          {brand}
          <div className="ml-auto flex items-center gap-1">{utilities}</div>
        </header>
      ) : null}

      <main
        className={cn(
          "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-2 pb-10 md:px-6",
          className
        )}
      >
        <OnboardingStepHeader
          step={step}
          total={total}
          stepperLabel={stepperLabel}
          stepperAriaLabel={stepperAriaLabel}
          title={title}
          subtitle={subtitle}
        />

        {children}

        {action || note ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {action ? (
              <Button
                type={action.type ?? "button"}
                form={action.form}
                variant="solid"
                size="lg"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                aria-disabled={action.disabled || action.loading}
              >
                <span>{action.label}</span>
                {action.loading ? (
                  <SpinnerGapIcon aria-hidden className="size-4 animate-spin" />
                ) : (
                  <ArrowRightIcon aria-hidden className="size-3.5" />
                )}
              </Button>
            ) : null}
            {note ? <p className="text-[12.5px] leading-[18px] text-muted-foreground">{note}</p> : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}
