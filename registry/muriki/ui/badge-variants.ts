import { cva } from "class-variance-authority"

/**
 * Muriki Badge.
 *
 * Aqui mora o preenchimento — botão não tem, badge tem. Cor cheia comunica
 * o que uma coisa É, não o que você pode fazer com ela.
 *
 * Os nove tons têm fundo em L 93,5% e tinta em L 43% (invertidos no dark).
 * Só a matiz muda. É por isso que três badges cabem na mesma linha sem
 * nenhum roubar a cena do título.
 */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center whitespace-nowrap font-medium tracking-[-0.002em] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        gray: "bg-tone-gray text-tone-gray-foreground",
        blue: "bg-tone-blue text-tone-blue-foreground",
        cyan: "bg-tone-cyan text-tone-cyan-foreground",
        green: "bg-tone-green text-tone-green-foreground",
        yellow: "bg-tone-yellow text-tone-yellow-foreground",
        orange: "bg-tone-orange text-tone-orange-foreground",
        red: "bg-tone-red text-tone-red-foreground",
        pink: "bg-tone-pink text-tone-pink-foreground",
        purple: "bg-tone-purple text-tone-purple-foreground",
      },
      variant: {
        soft: "",
        /** Para label do usuário, onde o fundo cheio competiria com o status. */
        outline: "bg-transparent text-muted-foreground shadow-[inset_0_0_0_1px_var(--input)]",
        /**
         * AUSÊNCIA. Contorno tracejado é o sinal do sistema para "não existe
         * ainda" — sem label, sem responsável, sem prazo, campo por preencher.
         * Sempre neutro: ausência não tem cor, então `tone` é ignorado aqui.
         */
        dashed: "border border-dashed border-input bg-transparent text-muted-foreground",
      },
      size: {
        /** Dentro de linha de tabela. */
        sm: "h-[18px] gap-1 rounded-[4px] px-1.5 text-[11px]",
        /** Padrão. */
        default: "h-[22px] gap-1.5 rounded-[4px] px-2 text-[11.5px]",
      },
      count: { true: "justify-center px-1.5 font-semibold tabular-nums", false: "" },
    },
    compoundVariants: [
      { count: true, size: "sm", class: "min-w-[18px]" },
      { count: true, size: "default", class: "min-w-[22px]" },
    ],
    defaultVariants: { tone: "gray", variant: "soft", size: "default", count: false },
  }
)

export const BADGE_TONES = [
  "gray", "blue", "cyan", "green", "yellow", "orange", "red", "pink", "purple",
] as const
export type BadgeTone = (typeof BADGE_TONES)[number]
