import { cva } from "class-variance-authority"

/**
 * Muriki Acrílico — Botão.
 *
 * O botão do papel não tem preenchimento; o botão do vidro não tem COR. A
 * placa é branca a 7% sobre o que estiver atrás, e é o fundo que a colore.
 * Quatro variantes, e só uma acende:
 *
 *   glass   A placa. O botão comum desta língua — vidro, grão, rim, reflexo.
 *   accent  A placa acesa: tinta de acento e brilho para fora. UMA por tela,
 *           pelo mesmo motivo do `solid` do papel — duas luzes e nenhuma é
 *           a principal.
 *   solid   Acento opaco. Para quando o que passa atrás é caótico demais
 *           para confiar no vidro (vídeo, foto movimentada) e a ação
 *           principal não pode depender do fundo.
 *   ghost   Sem placa, sem blur. Para barras densas: backdrop-filter custa,
 *           e vinte deles numa toolbar é jank garantido. O ghost ganha um
 *           filete no hover e nada mais.
 *
 * FOCO É OUTLINE, NÃO RING. O ring do Tailwind escreve box-shadow, e o
 * box-shadow da placa é onde moram o rim, o filete e a sombra — um ring
 * apagaria o vidro no exato momento em que o teclado chega nele.
 *
 * Raio: 12 no controle contra 16 no cartão. Mesma ideia do papel — a
 * diferença de raio é o que o olho lê como diferença de função.
 */
export const acrylicButtonVariants = cva(
  [
    "group/acrylic-button inline-flex shrink-0 select-none items-center justify-center gap-2",
    "font-medium tracking-[0.01em] whitespace-nowrap",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acr-accent)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        glass: "acr-pane acr-pane-interactive text-[var(--acr-ink)]",
        accent: "acr-pane acr-pane-interactive acr-pane-accent text-[var(--acr-ink)]",
        solid: [
          "bg-[var(--acr-accent)] text-[var(--acr-accent-ink)]",
          "shadow-[inset_0_1px_0_oklch(1_0_0/0.35),0_0_28px_var(--acr-glow),var(--acr-shadow)]",
          "transition-[filter,transform,box-shadow] duration-150",
          "hover:brightness-110 hover:-translate-y-px",
          "hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.4),0_0_40px_var(--acr-glow-strong),var(--acr-shadow-lift)]",
          "active:brightness-95 active:translate-y-0",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--acr-ink-dim)]",
          "transition-[background-color,color,box-shadow] duration-120",
          "hover:bg-[var(--acr-tint)] hover:text-[var(--acr-ink)]",
          "hover:shadow-[inset_0_0_0_1px_var(--acr-edge)]",
          "active:bg-[var(--acr-tint-press)]",
        ].join(" "),
      },
      size: {
        sm: "h-8 rounded-[10px] px-3 text-[12.5px] [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-10 rounded-[var(--acr-radius-control)] px-4 text-[13.5px] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 rounded-[14px] px-5 text-[15px] [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-10 rounded-[var(--acr-radius-control)] [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 rounded-[10px] [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "default",
    },
  }
)
