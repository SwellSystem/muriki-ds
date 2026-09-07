/**
 * Muriki Skeleton.
 *
 * Um skeleton é um BURACO onde o conteúdo vai entrar, então ele usa a
 * superfície afundada do sistema — a mesma do trilho de toggle e do campo
 * de busca. Sobre o papel ele afunda; sobre o card, também. Não inventa
 * cinza próprio.
 *
 * Raio de controle, não de recipiente: o que está sendo esperado é quase
 * sempre um controle, um texto ou um selo, e um retângulo muito macio
 * promete uma forma que não vai chegar.
 *
 * A regra de uso vale mais que o componente: skeleton bom TEM A ANATOMIA
 * do que substitui. Larguras iguais em linhas de texto denunciam a
 * preguiça; larguras variadas leem como parágrafo. Veja o
 * `@muriki/plan-card`, que traz o próprio.
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-[8px] bg-sunken", className)}
      {...props}
    />
  )
}

export { Skeleton }
