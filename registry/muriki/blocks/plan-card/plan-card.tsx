// Portado do muriki-platform e vestido com a casa: o card é composto por
// slots, então preço, features e selos são do consumidor.
import { useId, type ReactNode } from "react"
import { ArrowRight, SpinnerGap } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PlanCardCta {
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
}

export interface PlanCardProps {
  name: string
  description?: string
  priceSlot: ReactNode
  featuresSlot: ReactNode
  /**
   * Slots adicionais renderizados abaixo do `featuresSlot` — usado pra
   * sections como "Destaques" ou "Ideal para" sem inflar a API do card.
   */
  extraSlots?: ReactNode
  badgeSlot?: ReactNode
  trialBadgeSlot?: ReactNode
  cta: PlanCardCta
  /**
   * CTA secundária opcional renderizada como link discreto abaixo do
   * bloco de CTA. Demovida visualmente (link em vez de botão) pra evitar
   * compet ir com a primária — padrão de SaaS focado em conversão de trial.
   */
  secondaryCta?: PlanCardCta
  emphasized?: boolean
  selected?: boolean
  className?: string
}

export function PlanCard({
  name,
  description,
  priceSlot,
  featuresSlot,
  extraSlots,
  badgeSlot,
  trialBadgeSlot,
  cta,
  secondaryCta,
  emphasized = false,
  selected = false,
  className,
}: PlanCardProps) {
  const nameId = useId()
  const isLoading = cta.loading === true
  const isDisabled = cta.disabled === true || isLoading
  const isSecondaryLoading = secondaryCta?.loading === true
  const isSecondaryDisabled =
    secondaryCta?.disabled === true || isSecondaryLoading

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg bg-card p-4 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5",
        emphasized
          ? "shadow-[var(--float),inset_0_0_0_1px_var(--primary-subtle-border)] hover:shadow-[var(--float-strong),inset_0_0_0_1px_var(--primary-subtle-border)] md:scale-[1.03]"
          : "shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[var(--float)]",
        selected &&
          "border-primary ring-2 ring-primary/25 hover:ring-primary/35",
        className
      )}
    >
      {emphasized ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />
      ) : null}
      {emphasized ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl"
        />
      ) : null}

      {/* Aba grudada no contorno top-right do card */}
      {badgeSlot ? (
        // Sem fundo próprio: o slot recebe um Badge, que já traz o dele. A
        // faixa azul de antes empilhava dois fundos e ainda era cortada pelo
        // overflow do card.
        <div className="absolute top-3 right-3 z-10">{badgeSlot}</div>
      ) : null}

      <div className="relative flex flex-1 flex-col gap-3">
        <header className="space-y-1.5">
          <h3
            id={nameId}
            className="text-2xl leading-[1.05] font-semibold tracking-[-0.02em] text-foreground-strong md:text-[28px]"
          >
            {name}
          </h3>
          {description ? (
            <p className="text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>

        <div className="space-y-2 border-t border-border/60 pt-3">
          {trialBadgeSlot}
          {priceSlot}
        </div>

        <div className="flex-1 space-y-4 border-t border-border/60 pt-3">
          {featuresSlot}
          {extraSlots}
        </div>

        <div className="space-y-3">
          {/* O card em destaque é o ÚNICO da grade com botão sólido — é a
              exceção declarada da regra do botão, gasta uma vez na tela. Os
              outros ficam em `primary`, que é tingido: continuam sendo a
              ação principal do próprio card por massa, sem disputar com o
              recomendado. */}
          <Button
            type="button"
            size="lg"
            onClick={cta.onClick}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            variant={emphasized ? "solid" : "primary"}
            className="w-full"
          >
            {isLoading ? (
              <SpinnerGap
                aria-hidden="true"
                size={16}
                className="animate-spin"
              />
            ) : null}
            <span>{cta.label}</span>
          </Button>

          {/* CTA secundaria como LINK sutil — disponivel mas nao compete
              com a primaria. Padrao SaaS de alta conversao (Linear, Vercel). */}
          {secondaryCta ? (
            <button
              type="button"
              onClick={secondaryCta.onClick}
              disabled={isSecondaryDisabled}
              aria-disabled={isSecondaryDisabled}
              className="group/secondary mx-auto flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSecondaryLoading ? (
                <SpinnerGap
                  aria-hidden="true"
                  size={14}
                  className="animate-spin"
                />
              ) : null}
              <span className="underline-offset-2 group-hover/secondary:underline">
                {secondaryCta.label}
              </span>
              {!isSecondaryLoading ? (
                <ArrowRight
                  aria-hidden="true"
                  weight="bold"
                  className="size-3 transition-transform group-hover/secondary:translate-x-0.5"
                />
              ) : null}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
