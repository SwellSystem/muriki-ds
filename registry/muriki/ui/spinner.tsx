/**
 * Muriki Spinner.
 *
 * Para espera CURTA e SEM FORMA conhecida: um botão enviando, uma ação na
 * linha. Quando se sabe o que vai chegar (uma lista, um card, uma página),
 * é skeleton — ele já mostra a forma e não pula quando o conteúdo entra.
 *
 * Anel de 2px na tinta atual (currentColor): o trilho a 20%, e um arco de
 * um quarto girando. Herda a cor de quem o contém, então dentro do botão
 * sólido ele sai claro, e no ghost sai na tinta do texto.
 *
 * Com prefers-reduced-motion o giro desacelera em vez de sumir: parado,
 * ele deixaria de dizer "estou trabalhando".
 */
import { cn } from "@/lib/utils"

const TAMANHO = { sm: "size-3.5", default: "size-4", lg: "size-5" } as const

export interface SpinnerProps extends Omit<React.ComponentProps<"span">, "children"> {
  size?: keyof typeof TAMANHO
  /** Texto para leitor de tela. Sem ele, o spinner é decorativo (o botão já diz o que acontece). */
  label?: string
}

function Spinner({ size = "default", label, className, ...props }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0", TAMANHO[size], className)}
      {...props}
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-full animate-spin motion-reduce:[animation-duration:2.4s]">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export { Spinner }
