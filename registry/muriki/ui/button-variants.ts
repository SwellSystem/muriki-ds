import { cva } from "class-variance-authority"

/**
 * Muriki Button.
 *
 * Regra do sistema: botão não tem fill. Seis das sete variantes vivem de
 * filete, tinta e fundo tênue. `solid` existe, mas é exceção declarada —
 * uma por tela. Se aparecem duas, nenhuma é a principal.
 *
 * Raio: altura ÷ 5, arredondado. Não é o `--radius` (esse é do recipiente,
 * 14px). O contraste entre controle seco e recipiente macio é o que o olho
 * lê como intenção.
 */
export const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 select-none items-center justify-center gap-1.5",
    "font-medium tracking-[-0.005em] whitespace-nowrap",
    "transition-[background-color,box-shadow,color] duration-100 outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Ação principal. Azul tingido — o peso vem da tinta, não do bloco. */
        primary:
          "bg-primary-subtle text-primary-subtle-foreground shadow-[inset_0_0_0_1px_var(--primary-subtle-border)] hover:bg-primary-subtle/60 active:bg-primary-subtle",
        /** Ação padrão. Filete de 1px por dentro, nunca `border` — não empurra layout. */
        outline:
          "bg-card text-foreground shadow-[inset_0_0_0_1px_var(--input)] hover:bg-secondary hover:text-foreground-strong",
        /** Em superfície densa, onde mais um filete viraria ruído. */
        secondary: "bg-secondary text-foreground hover:bg-secondary/70 hover:text-foreground-strong",
        /** Terciária e toolbar. */
        ghost: "bg-transparent text-foreground hover:bg-secondary hover:text-foreground-strong",
        /** Navegação inline. */
        link: "bg-transparent text-primary underline-offset-[3px] hover:underline",
        /** Destrutiva. Tingida — o vermelho cheio fica para o diálogo de confirmação. */
        destructive:
          "bg-destructive-subtle text-destructive-subtle-foreground shadow-[inset_0_0_0_1px_var(--destructive-subtle-border)] hover:bg-destructive-subtle/60 focus-visible:ring-destructive/35",
        /** EXCEÇÃO. Uma por tela — o "Entrar", o "Publicar" do diálogo. Nada mais. */
        solid: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary",
      },
      size: {
        xs: "h-6 rounded-[5px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 rounded-[6px] px-2.5 text-[0.78rem] [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-8 rounded-[6px] px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-9 rounded-[7px] px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        /** Piso de toque. No mobile é este, para tudo. */
        touch: "h-11 rounded-[9px] px-[1.125rem] text-[0.9375rem] [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-6 rounded-[5px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-8 rounded-[6px] [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-9 rounded-[7px] [&_svg:not([class*='size-'])]:size-4",
        "icon-touch": "size-11 rounded-[9px] [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [{ variant: "link", size: "default", class: "h-auto px-0" }],
    defaultVariants: { variant: "outline", size: "default" },
  }
)
