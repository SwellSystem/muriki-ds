/**
 * Muriki Alert.
 *
 * A faixa de aviso DENTRO da página: o contrato desincronizou, a tarefa está
 * bloqueada há 3 dias, o pagamento falhou. Não some sozinha — para o que
 * passa, é toast; para a tela inteira, é `@muriki/notice-page`.
 *
 * Os tons são os do notice-page: neutro na superfície secundária, sucesso
 * verde, atenção amarelo (suspenso, pendente, cancelado sem cobrança — não é
 * erro) e erro vermelho. O tipo é dito pelo ícone cheio à esquerda, e o fundo
 * inteiro no tom claro; não tem borda, o tom já desenha a faixa.
 *
 * Erro anuncia como `alert` (o leitor de tela interrompe); os outros como
 * `status`. `actions` fica à direita, centrado; no celular desce para baixo
 * do texto. `onDismiss` põe o X.
 */
import * as React from "react"
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export type AlertTone = "neutral" | "success" | "attention" | "danger"

const TOM: Record<AlertTone, string> = {
  neutral: "bg-secondary text-foreground [--alert-icon:var(--muted-foreground)]",
  success: "bg-tone-green text-tone-green-foreground [--alert-icon:currentColor]",
  attention: "bg-tone-yellow text-tone-yellow-foreground [--alert-icon:currentColor]",
  danger: "bg-tone-red text-tone-red-foreground [--alert-icon:currentColor]",
}

const ICONE: Record<AlertTone, React.ElementType> = {
  neutral: InfoIcon,
  success: CheckCircleIcon,
  attention: WarningIcon,
  danger: WarningCircleIcon,
}

export interface AlertProps extends Omit<React.ComponentProps<"div">, "title"> {
  tone?: AlertTone
  title?: React.ReactNode
  /** Troca o ícone do tom. */
  icon?: React.ReactNode
  /** Botões à direita (no celular, embaixo do texto). */
  actions?: React.ReactNode
  /** Põe o X de dispensar. */
  onDismiss?: () => void
  dismissLabel?: string
}

function Alert({
  tone = "neutral",
  title,
  icon,
  actions,
  onDismiss,
  dismissLabel = "Dispensar",
  className,
  children,
  ...props
}: AlertProps) {
  const Icone = ICONE[tone]
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex flex-wrap items-start gap-2.5 rounded-xl py-3 pr-3 pl-3.5 sm:flex-nowrap", TOM[tone], className)}
      {...props}
    >
      <span aria-hidden className="grid h-5 shrink-0 place-items-center text-(--alert-icon) [&_svg]:size-4">
        {icon ?? <Icone weight="fill" />}
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        {title ? <p className="text-sm leading-5 font-semibold">{title}</p> : null}
        {children ? <div className="text-[13px] leading-[19px] opacity-85">{children}</div> : null}
      </div>
      {actions ? (
        <div className="order-3 flex w-full shrink-0 items-center gap-1.5 self-center pl-[26px] sm:order-none sm:w-auto sm:pl-0">{actions}</div>
      ) : null}
      {onDismiss ? (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="grid size-6 shrink-0 place-items-center rounded-md opacity-70 hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring [&_svg]:size-3.5"
        >
          <XIcon />
        </button>
      ) : null}
    </div>
  )
}

export { Alert }
