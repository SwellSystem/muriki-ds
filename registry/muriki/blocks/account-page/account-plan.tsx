"use client"

// A aba Plano: o resumo da assinatura do Code e as faturas.
//
// O resumo é o nome do plano com o selo do estado, as linhas (situação,
// período, próxima cobrança) e as ações — o portal do Stripe (cartão,
// faturas, cancelar) e "Ver planos". O estado detalhado, quando pede ação,
// é o SubscriptionStatus do plans-page, que o app põe acima.
//
// As faturas (GET /billing/payments) vêm por cursor, o mais recente
// primeiro: descrição, data, valor, o status em selo e o link da fatura no
// Stripe, quando houver. "Carregar mais" e o vazio ficam aqui.
import type { ReactNode } from "react"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export interface AccountPlanSummaryProps {
  planName: string
  /** O selo ao lado do nome, ex.: <Badge tone="blue" dot>Teste grátis</Badge>. */
  badge?: ReactNode
  /** Já formatadas, ex.: [{ label: "Período", value: "Mensal" }]. */
  rows: { label: string; value: ReactNode }[]
  /** Ex.: o botão do portal (primary) e "Ver planos" (outline). */
  actions?: ReactNode
  note?: ReactNode
  className?: string
}

export function AccountPlanSummary({ planName, badge, rows, actions, note, className }: AccountPlanSummaryProps) {
  const t = useTranslate()
  return (
    <AccountCard title={t("account.plan.title")} description={t("account.plan.description")} className={className}>
      <div className="flex items-center gap-2.5">
        <span className="text-[22px] font-semibold tracking-[-0.01em] text-foreground-strong">{planName}</span>
        {badge}
      </div>
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className="flex min-h-11 items-center justify-between gap-4 text-[13.5px] shadow-[inset_0_-1px_0_var(--muted)]">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right text-foreground-strong">{row.value}</dd>
          </div>
        ))}
      </dl>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      {note ? <p className="text-[12.5px] leading-[18px] text-muted-foreground">{note}</p> : null}
    </AccountCard>
  )
}

export type InvoiceStatus = "paid" | "failed" | "refunded"

export interface AccountInvoice {
  id: string
  /** Já montada, ex.: "Pro · mensal · com cupom". */
  description: string
  /** Já formatados. */
  amount: string
  date: string
  status: InvoiceStatus
  receiptUrl?: string | null
}

const TOM = { paid: "green", failed: "red", refunded: "gray" } as const

export interface AccountInvoicesProps {
  invoices: AccountInvoice[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
  className?: string
}

export function AccountInvoices({
  invoices,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  className,
}: AccountInvoicesProps) {
  const t = useTranslate()
  return (
    <AccountCard title={t("account.invoices.title")} description={t("account.invoices.description")} className={className}>
      {loading ? (
        <div className="flex flex-col gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <p className="rounded-[10px] bg-secondary px-4 py-6 text-center text-[13px] text-muted-foreground">
          {t("account.invoices.empty")}
        </p>
      ) : (
        <ul className="flex flex-col">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex min-h-12 items-center gap-3 py-1.5 shadow-[inset_0_-1px_0_var(--muted)]">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13.5px] text-foreground-strong">{inv.description}</span>
                <span className="text-xs text-muted-foreground">{inv.date}</span>
              </span>
              <Badge tone={TOM[inv.status]} dot>
                {t(`account.invoices.status.${inv.status}`)}
              </Badge>
              <span className="w-24 text-right font-mono text-[12.5px] text-foreground-strong tabular-nums">{inv.amount}</span>
              <span className="flex w-20 justify-end">
                {inv.receiptUrl ? (
                  <a
                    href={inv.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[12.5px] text-primary hover:underline"
                  >
                    {t("account.invoices.open")}
                    <ArrowSquareOutIcon aria-hidden className="size-3" />
                    <span className="sr-only">{t("account.invoices.new_tab")}</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {hasMore && onLoadMore ? (
        <Button variant="ghost" className="self-center" loading={loadingMore} onClick={onLoadMore}>
          {t("account.invoices.load_more")}
        </Button>
      ) : null}
    </AccountCard>
  )
}
