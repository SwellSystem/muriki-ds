/**
 * Muriki BackLink.
 *
 * O "voltar" da tela de detalhe: "← Planos", acima do título. Diz PARA
 * ONDE volta, que é o que um ícone sozinho não diz, e é um alvo de
 * verdade — a trilha de 12px cinza não era.
 *
 * Um nível acima, sempre, e para um lugar fixo: não é `history.back()`.
 * Quem chegou pelo link direto também precisa de uma saída, e ela é a
 * lista de onde o item vem. Com 3+ níveis, a trilha (Breadcrumb) fica e o
 * BackLink sobe um.
 *
 * `render` troca o `<a>` pelo link do roteador, como no BreadcrumbLink.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { ArrowLeftIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

function BackLink({
  className,
  children,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "group/back -ml-1 inline-flex h-7 items-center gap-1.5 self-start rounded-md px-1",
          "text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground-strong",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          className
        ),
        children: (
          <>
            <ArrowLeftIcon
              aria-hidden
              className="size-3.5 transition-transform group-hover/back:-translate-x-0.5"
            />
            {children}
          </>
        ),
      },
      props
    ),
    render,
    state: {
      slot: "back-link",
    },
  })
}

export { BackLink }
