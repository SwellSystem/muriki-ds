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
 *
 * O MOVIMENTO é uma varredura, não um pulso: uma faixa na cor do card (a
 * superfície logo acima do sunken, nos dois temas) atravessa o buraco em
 * 1,5s. O gradiente é `background-attachment: fixed`, medido na tela e
 * não no bloco, então todos os skeletons de uma página passam a mesma
 * faixa ao mesmo tempo — a tela lê como UMA espera, não como vinte. Com
 * prefers-reduced-motion, fica só o buraco parado. O CSS (.muriki-skeleton
 * e o @keyframes) vem com o item.
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("muriki-skeleton rounded-[8px]", className)}
      {...props}
    />
  )
}

export { Skeleton }
