/**
 * Muriki Separator.
 *
 * O filete do sistema, na cor `--border`. Nas superfícies que já carregam
 * filete por sombra interna (diálogo estruturado, sheet), prefira aquele:
 * dois meios de desenhar a mesma linha acabam divergindo de espessura.
 *
 * DUAS FORMAS, e a escolha não é de gosto. `full` é a linha inteira, de
 * ponta a ponta — ela SEPARA e também FECHA, porque tem começo e fim. Serve
 * onde o fechamento é o ponto: a base de um cabeçalho, o topo de um rodapé,
 * a divisão entre duas fileiras de uma tabela.
 *
 * `soft` é a mesma linha com as pontas dissolvidas. Separa sem fechar, e é a
 * que serve DENTRO de uma peça que já tem contorno — um cartão, um painel,
 * um diálogo. Uma linha inteira ali desenha uma caixa dentro de outra, e é
 * disso que vem a cara de sistema antigo: não é a força da linha, é ela ter
 * canto.
 *
 * A dissolução é máscara, não gradiente de cor: o filete continua sendo
 * `--border` no meio, então não perde contraste onde precisa ser lido.
 */
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

export interface SeparatorProps extends SeparatorPrimitive.Props {
  /**
   * `full` fecha, `soft` só separa. Dentro de peça com contorno, `soft`.
   * Padrão `full`, que é o comportamento que já existia.
   */
  shape?: "full" | "soft"
}

const DISSOLVE_H =
  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)"
const DISSOLVE_V =
  "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)"

function Separator({
  className,
  orientation = "horizontal",
  shape = "full",
  style,
  ...props
}: SeparatorProps) {
  const mask =
    shape === "soft"
      ? orientation === "vertical"
        ? DISSOLVE_V
        : DISSOLVE_H
      : undefined

  return (
    <SeparatorPrimitive
      data-slot="separator"
      data-shape={shape}
      orientation={orientation}
      style={
        mask
          ? { maskImage: mask, WebkitMaskImage: mask, ...style }
          : style
      }
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
