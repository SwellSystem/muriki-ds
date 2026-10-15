"use client"

/**
 * A moldura das páginas de cobrança de dentro do workspace (o checkout, o "Falar com o comercial" e
 * a resposta à revisão do país), no jeito do Linear e do Stripe: o caminho leve em cima ("← Planos /
 * Assinar o Pro / Pagamento no Stripe"), o formulário à esquerda e o resumo à direita, numa faixa de
 * superfície própria que vai até o pé. Abaixo de `lg`, o resumo desce para baixo do formulário. Nada de Dialog nem Sheet: o desenho
 * aprovado é página.
 *
 * O DS não tem roteador: o "← Planos" chama `onBack`, ou vira o link do app com `backRender`.
 *
 * Aqui moram também as peças comuns dos dois resumos (o cabeçalho com o plano, as seções com o filete,
 * as linhas "rótulo … valor" e a lista com o check), usadas por `checkout-page` e `contact-sales`.
 */
import type { ReactElement, ReactNode } from "react"
import { CheckIcon } from "@phosphor-icons/react"

import { BackLink } from "@/components/ui/back-link"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { SeatPlanIcon } from "./plan-cards"

export interface BillingPageLayoutProps {
  /** O passo de agora no caminho, ex.: "Assinar o Pro". */
  current: string
  /** O passo que vem depois, apagado, ex.: o cadeado com "Pagamento no Stripe". */
  next?: ReactNode
  /** O rótulo da volta; o padrão é "Planos". A revisão do país volta para a "Cobrança". */
  backLabel?: ReactNode
  /** O "← Planos" como botão. */
  onBack?: () => void
  /** O "← Planos" como o link do roteador do app (vence o `onBack`), ex.: `<Link to="../plans" />`. */
  backRender?: ReactElement
  /** O resumo, na faixa da direita. */
  aside: ReactNode
  /** O formulário, à esquerda, abaixo do caminho. */
  children: ReactNode
  className?: string
}

export function BillingPageLayout({
  current,
  next,
  backLabel,
  onBack,
  backRender,
  aside,
  children,
  className,
}: BillingPageLayoutProps) {
  const t = useTranslate()
  return (
    <div
      data-slot="billing-page"
      className={cn("grid min-h-full grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]", className)}
    >
      <div className="flex justify-center px-4 pt-8 pb-10 sm:px-8 lg:justify-end lg:pt-9 lg:pr-24 lg:pb-10">
        <div className="flex w-full max-w-[440px] flex-col gap-[26px]">
          <nav
            aria-label={t("platform.billing.checkout.trail_label")}
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] leading-[18px]"
          >
            <BackLink
              render={backRender ?? <button type="button" onClick={onBack} />}
              className="h-auto text-[13.5px]"
            >
              {backLabel ?? t("platform.billing.checkout.back")}
            </BackLink>
            <Separador />
            <span aria-current="page" className="font-medium text-foreground-strong">
              {current}
            </span>
            {next ? (
              <>
                <Separador />
                <span className="inline-flex items-center gap-1.5 text-muted-foreground [&_svg]:size-[13px]">{next}</span>
              </>
            ) : null}
          </nav>
          {children}
        </div>
      </div>
      <aside
        className={cn(
          "flex justify-center bg-rail px-4 pt-8 pb-10 shadow-[inset_0_1px_0_var(--border)] sm:px-8",
          "lg:justify-start lg:pt-[92px] lg:pr-8 lg:pl-[88px] lg:shadow-[inset_1px_0_0_var(--border)]"
        )}
      >
        <div className="flex w-full max-w-[380px] flex-col gap-5">{aside}</div>
      </aside>
    </div>
  )
}

function Separador() {
  return (
    <span aria-hidden className="text-input">
      /
    </span>
  )
}

// ── As peças dos resumos (internas ao bloco) ────────────────────────────

/** O título e a linha de contexto do formulário. */
export function BillingFormHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-[30px] leading-9 font-semibold tracking-[-0.02em] text-foreground-strong">{title}</h1>
      {subtitle ? <p className="text-[14.5px] leading-[21px] text-muted-foreground">{subtitle}</p> : null}
    </header>
  )
}

/** "Resumo", e o plano com o ícone no quadradinho azul, o nome e um selo opcional (o período). */
export function SummaryHeader({ planKey, name, badge }: { planKey: string; name: string; badge?: ReactNode }) {
  const t = useTranslate()
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[13px] leading-[18px] font-medium text-muted-foreground">{t("platform.billing.checkout.summary")}</h2>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"
        >
          <SeatPlanIcon planKey={planKey} className="size-[18px]" />
        </span>
        <span className="text-[22px] leading-7 font-semibold text-foreground-strong">{name}</span>
        {badge}
      </div>
    </div>
  )
}

/** Um bloco do resumo, separado do anterior pelo filete. */
export function SummarySection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--input)_60%,transparent)] pt-[18px]", className)}>
      {children}
    </div>
  )
}

/** "6 pessoas × R$ 29 … R$ 174/mês": o rótulo à esquerda e o valor à direita, em números tabulares. */
export function SummaryRow({ label, value, strong = false }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        strong ? "text-[15px] font-semibold text-foreground-strong" : "text-sm text-foreground"
      )}
    >
      <span className="min-w-0">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  )
}

/** A lista com o check, como a do cartão de plano. */
export function SummaryChecklist({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-2.5">{children}</ul>
}

export function SummaryCheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-[9px] text-sm leading-5 text-foreground">
      <CheckIcon aria-hidden weight="bold" className="mt-[2.5px] size-[15px] shrink-0 text-success" />
      <span>{children}</span>
    </li>
  )
}
