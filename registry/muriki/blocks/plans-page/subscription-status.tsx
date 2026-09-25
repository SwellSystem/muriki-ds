// O estado da assinatura, numa faixa acima dos cards de plano: um selo
// que diz O QUE a assinatura é agora, uma frase que diz o que acontece
// depois, e a ação que resolve, quando há uma. Quatro tons, porque são
// quatro conversas: teste (azul), em dia (neutro), cancelamento marcado
// (amarelo) e pagamento em atraso (vermelho, a única que pede ação já).
import { SpinnerGap } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SubscriptionStatusTone = "trial" | "active" | "canceling" | "overdue"

const TOM = {
  trial: "blue",
  active: "gray",
  canceling: "yellow",
  overdue: "red",
} as const

export interface SubscriptionStatusProps {
  tone: SubscriptionStatusTone
  /** O selo, ex.: "Teste grátis", "Pagamento em atraso". */
  label: string
  /** A frase, ex.: "O Pro fica até 1º de outubro. Depois você volta ao Starter." */
  description: string
  /** Ex.: "Gerenciar assinatura", que abre o portal do Stripe. */
  action?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  className?: string
}

export function SubscriptionStatus({
  tone,
  label,
  description,
  action,
  className,
}: SubscriptionStatusProps) {
  return (
    <section
      role={tone === "overdue" ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:gap-4",
        tone === "overdue" ? "border-destructive/40" : "border-border",
        className
      )}
    >
      <Badge tone={TOM[tone]} dot className="self-start sm:self-auto">
        {label}
      </Badge>
      <p className="flex-1 text-sm leading-snug text-foreground">{description}</p>
      {action ? (
        <Button
          type="button"
          // Em atraso, a ação é a saída do problema: ganha peso. Nos outros
          // casos é um caminho para o portal, e fica no contorno.
          variant={tone === "overdue" ? "primary" : "outline"}
          onClick={action.onClick}
          disabled={action.loading}
          aria-busy={action.loading}
          className="self-start sm:self-auto"
        >
          {action.loading ? (
            <SpinnerGap aria-hidden size={14} className="animate-spin" />
          ) : null}
          {action.label}
        </Button>
      ) : null}
    </section>
  )
}
