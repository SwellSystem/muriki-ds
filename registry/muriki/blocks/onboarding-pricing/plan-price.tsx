// Portado do muriki-platform SEM o framer-motion. O original rolava os
// dígitos com <motion.span animate={{ y }} />; aqui a mesma rolagem sai de
// uma transform com transition em CSS. O sistema inteiro não tinha essa
// dependência, e uma casa de animação nova entra quando houver um movimento
// que o CSS não dê conta — este dá.
//
// As chaves usam a posição a partir da DIREITA. É o que faz "R$ 49,00" virar
// "R$ 588,00" com os centavos e a vírgula parados: os dígitos análogos
// mantêm a identidade entre os dois formatos e só rolam os que mudaram.
import { cn } from "@/lib/utils"

export type PlanCurrency = "BRL" | "USD" | "EUR"
export type PlanInterval = "month" | "year"

export interface PlanPriceProps {
  /** Valor em centavos. Zero cai no `freeLabel`. */
  amountInCents: number
  currency?: PlanCurrency
  /** Sufixo do preço, ex.: "mês". Vira "/mês". */
  intervalLabel: string
  /** Linha pequena abaixo, ex.: "por usuário, cobrado mensalmente". */
  noteLabel?: string
  freeLabel: string
  /** BCP-47 para o Intl.NumberFormat. */
  locale?: string
  /** Plano de "fale com vendas": mostra o rótulo no lugar do preço. */
  contactSales?: boolean
  contactSalesLabel?: string
  className?: string
}

const format = (cents: number, currency: PlanCurrency, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)

export function PlanPrice({
  amountInCents,
  currency = "BRL",
  intervalLabel,
  noteLabel,
  freeLabel,
  locale = "pt-BR",
  contactSales = false,
  contactSalesLabel,
  className,
}: PlanPriceProps) {
  const nota = noteLabel ? (
    <p className="text-xs text-muted-foreground">{noteLabel}</p>
  ) : null

  if (contactSales || amountInCents === 0) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <p className="text-3xl leading-none font-semibold tracking-[-0.02em] text-foreground-strong md:text-4xl">
          {contactSales ? (contactSalesLabel ?? freeLabel) : freeLabel}
        </p>
        {nota}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* flex-wrap para o "/mês" não ser cortado pelo overflow do card
          quando o preço anual fica longo (ex.: R$ 1.200,00). */}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <RollingPrice
          value={format(amountInCents, currency, locale)}
          className="text-3xl font-semibold tracking-[-0.02em] text-foreground-strong"
        />
        <span className="text-sm text-muted-foreground">/{intervalLabel}</span>
      </p>
      {nota}
    </div>
  )
}

const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function RollingPrice({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const chars = Array.from(value)
  const ultimo = chars.length - 1
  return (
    <span
      aria-label={value}
      role="text"
      className={cn("inline-flex items-baseline tabular-nums", className)}
    >
      {chars.map((char, i) => {
        const key = `pos-${ultimo - i}`
        return /\d/.test(char) ? (
          <RollingDigit key={key} digit={Number(char)} />
        ) : (
          <span key={key} aria-hidden>
            {char}
          </span>
        )
      })}
    </span>
  )
}

function RollingDigit({ digit }: { digit: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-[1em] overflow-hidden leading-none"
    >
      {/* Fantasma que segura a largura do dígito mais largo da fonte. */}
      <span className="invisible">0</span>
      <span
        className="absolute inset-x-0 top-0 block leading-none transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(-${digit}em)` }}
      >
        {DIGITOS.map((n) => (
          <span key={n} className="block h-[1em]">
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}
