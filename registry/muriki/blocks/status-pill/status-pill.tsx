// Camada semântica sobre o Badge: o status da task tem cinco famílias, e o
// mapa de família para tom mora aqui em vez de espalhado nas telas. Sem isto,
// cada consumidor decide sozinho que "bloqueada" é amarelo — e uma hora não é.
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusKind = "backlog" | "todo" | "doing" | "done" | "blocked"

const TOM = {
  backlog: "gray",
  todo: "gray",
  doing: "blue",
  done: "green",
  blocked: "yellow",
} as const

export interface StatusPillProps {
  status: StatusKind
  label: string
  /** Esconde o ponto — em lista densa ele vira ruído. */
  hideDot?: boolean
  size?: "sm" | "default"
  className?: string
}

export function StatusPill({
  status,
  label,
  hideDot = false,
  size = "default",
  className,
}: StatusPillProps) {
  return (
    <Badge
      tone={TOM[status]}
      dot={!hideDot}
      size={size}
      className={cn("rounded-full", className)}
    >
      {label}
    </Badge>
  )
}
