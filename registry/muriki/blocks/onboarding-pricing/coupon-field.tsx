"use client"

// O cupom da tela de plano. Fechado, é um link ("Tem um cupom?"): quem não
// tem cupom não vê um campo vazio pedindo algo que não tem. Aberto, é o
// campo com "Aplicar". Aplicado, vira o selo com o código e o que ele dá,
// e o card do plano mostra o preço cheio riscado (`originalAmountInCents`
// no PricingPlan). Inválido, o erro fica embaixo do campo.
//
// Controlado por fora: quem valida o código é a API. O campo só guarda o
// que a pessoa digitou e se está aberto. Vai no `toolbar` da PricingScreen,
// na linha do período.
import { useState, type FormEvent } from "react"
import { SpinnerGap } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CouponFieldLabels {
  /** "Tem um cupom?" */
  trigger: string
  /** Rótulo acessível do campo, ex.: "Cupom". */
  field: string
  placeholder?: string
  apply: string
  remove: string
}

export interface CouponFieldProps {
  labels: CouponFieldLabels
  /** Chamado com o código em maiúsculas. A validação é da API. */
  onApply: (code: string) => void
  onRemove?: () => void
  /** O cupom aceito: o código e o que ele dá, ex.: "20% no Pro nos 3 primeiros meses". */
  applied?: { code: string; description?: string } | null
  /** A API recusou o código. */
  error?: string
  /** A validação está em curso. */
  pending?: boolean
  className?: string
}

export function CouponField({
  labels,
  onApply,
  onRemove,
  applied = null,
  error,
  pending = false,
  className,
}: CouponFieldProps) {
  const [aberto, setAberto] = useState(Boolean(error))
  const [codigo, setCodigo] = useState("")

  if (applied) {
    return (
      <div className={cn("flex min-h-9 flex-wrap items-center gap-2.5 text-[13px] text-foreground", className)}>
        <Badge tone="green" size="sm" className="font-mono tracking-[0.08em]">
          {applied.code}
        </Badge>
        {applied.description ? <span>{applied.description}</span> : null}
        {onRemove ? (
          <Button variant="link" size="sm" onClick={onRemove} className="text-muted-foreground">
            {labels.remove}
          </Button>
        ) : null}
      </div>
    )
  }

  if (!aberto) {
    return (
      <Button
        variant="link"
        onClick={() => setAberto(true)}
        className={cn("h-9 self-start font-medium text-primary", className)}
      >
        {labels.trigger}
      </Button>
    )
  }

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const limpo = codigo.trim().toUpperCase()
    if (limpo && !pending) onApply(limpo)
  }

  return (
    <form onSubmit={enviar} className={cn("flex flex-col gap-1.5", className)} noValidate>
      <div className="flex gap-2">
        <Input
          autoFocus
          aria-label={labels.field}
          aria-invalid={error ? true : undefined}
          placeholder={labels.placeholder}
          value={codigo}
          spellCheck={false}
          autoComplete="off"
          onValueChange={(v) => setCodigo(v.toUpperCase())}
          className="w-56 font-mono tracking-[0.08em] uppercase"
        />
        <Button type="submit" variant="outline" disabled={pending || !codigo.trim()}>
          {pending ? <SpinnerGap aria-hidden className="size-4 animate-spin" /> : null}
          {labels.apply}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-[12.5px] text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}
