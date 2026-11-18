/**
 * Loading Screen — a tela inteira enquanto o app abre ou uma rota inteira
 * carrega sem forma conhecida.
 *
 * Quando se sabe o que vai chegar, é skeleton (veja `@muriki/screen-skeletons`);
 * quando a navegação é entre telas já montadas, é a `@muriki/route-progress`.
 * Esta é a terceira espera: a do começo, antes de existir tela.
 *
 * O desenho: um orbe de dois anéis girando em sentidos opostos — o de fora na
 * tinta da marca, o de dentro no amarelo da casa — sobre um disco de cartão,
 * com um ponto azul pulsando no centro e um halo desfocado atrás. Embaixo, o
 * título, uma linha de apoio e uma barra fina com uma luz atravessando.
 *
 * O fundo é o papel a 40% com desfoque de 12px: o que estava atrás continua
 * lá, embaçado, e a troca para a tela pronta não pisca. `inline` prende a
 * camada no contêiner (position: absolute) em vez da janela.
 *
 * Com "reduzir movimento", os anéis desaceleram, o ponto e a luz param.
 */
import { cn } from "@/lib/utils"

export interface LoadingScreenProps {
  title?: string
  subtitle?: string
  /** Cobre só o contêiner (que precisa de position: relative), não a janela. */
  inline?: boolean
  className?: string
}

export function LoadingScreen({
  title = "Carregando",
  subtitle = "Isso leva só alguns segundos",
  inline = false,
  className,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy
      data-slot="loading-screen"
      className={cn(
        "muriki-loading-screen inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md",
        inline ? "absolute" : "fixed",
        className
      )}
    >
      <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-10">
        <div aria-hidden className={cn("relative size-28", !inline && "md:size-32")}>
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-[40px] dark:bg-primary/15" />
          <div className="muriki-loading-ring absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 [animation-duration:1.2s]" />
          <div className="muriki-loading-ring absolute inset-3 rounded-full border-2 border-transparent border-b-accent border-l-accent/70 [animation-direction:reverse] [animation-duration:1.6s]" />
          <div className={cn("absolute inset-6 rounded-full border border-border/50 bg-card/95 backdrop-blur-sm", !inline && "md:inset-7")} />
          <div className="muriki-loading-dot pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          </div>
        </div>
        <div className="grid gap-1.5 text-center">
          <p className={cn("muriki-loading-title text-sm font-semibold text-foreground", !inline && "md:text-base")}>{title}</p>
          <p className={cn("text-xs text-muted-foreground", !inline && "md:text-sm")}>{subtitle}</p>
        </div>
        <div aria-hidden className={cn("h-1.5 w-56 overflow-hidden rounded-full bg-muted/80", !inline && "md:w-64")}>
          <span className="muriki-loading-light block h-full w-3/5 rounded-full bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>
    </div>
  )
}
