"use client"

/**
 * Muriki WelcomeDialog — as boas-vindas em passos, a primeira vez que a pessoa chega numa área
 * (design/muriki-code/aprender.py, tela_trilha_boas_vindas).
 *
 * O véu cobre a janela inteira, o rail junto, e desfoca o que está atrás (blur de 14px sobre o
 * --background a 45%): a pessoa ainda vê onde está, mas nada ali pede atenção. Por cima, o modal:
 * no topo o splash (o degradê da marca, o mascote flutuando e as tecnologias em ladrilhos brancos,
 * entrando uma a uma), depois o rótulo mono, o stepper, o conteúdo do passo e o rodapé com Pular à
 * esquerda, Voltar a partir do segundo passo e Continuar — no último, o botão final.
 *
 * O conteúdo de cada passo é do app (`steps[].content`); o componente cuida do resto. Movimento: o
 * véu aparece, o modal sobe e cresce, o mascote flutua e os ladrilhos entram escalonados — tudo
 * desligado com prefers-reduced-motion (as animações moram no css do item, em `muriki-welcome-*`).
 *
 * Esc e clique fora são Pular: fechar sem terminar é pular, e o app decide se mostra de novo.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ArrowRightIcon } from "@phosphor-icons/react"

import { BrandLogo, type Brand } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface WelcomeDialogStep {
  /** O rótulo curto do stepper, ex.: "Seu ponto de partida". */
  label: string
  content: React.ReactNode
}

export interface WelcomeDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  steps: WelcomeDialogStep[]
  /** Passo atual (0 é o primeiro). Sem isto, o diálogo guarda o passo sozinho. */
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  /** O rótulo mono acima do stepper, ex.: "Trilhas · primeira vez". Também é o nome do diálogo. */
  eyebrow: string
  /** As tecnologias em volta do mascote, até 10. As de `highlight` (as da pessoa) vêm maiores. */
  brands?: Brand[]
  highlight?: Brand[]
  /** Troca o splash inteiro. `null` tira o splash. */
  splash?: React.ReactNode | null
  labels?: Partial<Record<"skip" | "back" | "next" | "finish", string>>
  /** Pular, Esc e clique fora. */
  onSkip?: () => void
  /** O botão final do último passo. */
  onFinish?: () => void
  /** O botão final como link do app, ex.: <Link to="/tracks/$id" params={…} />. */
  finishRender?: React.ReactElement
  className?: string
}

// Os lugares do desenho num splash de 620 × 176: esquerda, topo, lado do ladrilho e giro. Os maiores
// primeiro, perto do mascote; as tecnologias em destaque ficam com eles.
const LUGARES: [number, number, number, number][] = [
  [170, 44, 40, -6], [404, 40, 40, 5], [96, 92, 32, -3], [470, 104, 32, 7], [330, 128, 32, -4],
  [36, 34, 30, -8], [540, 36, 30, 4], [30, 126, 28, 6], [118, 20, 26, 9], [556, 116, 26, -5],
]

function Splash({ brands, highlight }: { brands: Brand[]; highlight: Brand[] }) {
  const ordem = [...brands.filter((b) => highlight.includes(b)), ...brands.filter((b) => !highlight.includes(b))].slice(
    0,
    LUGARES.length
  )
  return (
    <div
      aria-hidden
      data-slot="welcome-dialog-splash"
      className="relative h-44 shrink-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 16%, var(--card)) 0%, var(--card) 55%, color-mix(in oklch, var(--accent) 30%, var(--card)) 100%)",
      }}
    >
      <span className="absolute top-1/2 left-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]" />
      <span className="muriki-welcome-mascot absolute top-1/2 left-1/2 -mt-[46px] -ml-[46px] flex size-[92px]">
        <MurikiLogo className="size-full" />
      </span>
      {ordem.map((brand, i) => {
        const [x, y, lado, giro] = LUGARES[i]
        return (
          <span
            key={brand}
            className="muriki-welcome-tile absolute"
            style={
              {
                left: `${(x / 620) * 100}%`,
                top: `${(y / 176) * 100}%`,
                "--muriki-welcome-turn": `${giro}deg`,
                transform: `rotate(${giro}deg)`,
                animationDelay: `${0.4 + 0.07 * i}s`,
              } as React.CSSProperties
            }
          >
            <BrandLogo brand={brand} size={lado} tile />
          </span>
        )
      })}
    </div>
  )
}

function WelcomeDialog({
  open,
  onOpenChange,
  steps,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  eyebrow,
  brands = [],
  highlight = [],
  splash,
  labels,
  onSkip,
  onFinish,
  finishRender,
  className,
}: WelcomeDialogProps) {
  const t = useTranslate()
  const [stepInterno, setStepInterno] = React.useState(defaultStep)
  const atual = Math.min(Math.max(stepProp ?? stepInterno, 0), steps.length - 1)
  const ultimo = atual === steps.length - 1
  const conteudoRef = React.useRef<HTMLDivElement>(null)
  const primeiroRender = React.useRef(true)

  const irPara = (n: number) => {
    if (stepProp === undefined) setStepInterno(n)
    onStepChange?.(n)
  }

  // o foco acompanha o passo: quem usa teclado ou leitor de tela começa pelo conteúdo novo
  React.useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false
      return
    }
    conteudoRef.current?.focus()
  }, [atual])

  const rotulo = (k: "skip" | "back" | "next" | "finish") => labels?.[k] ?? t(`welcome_dialog.${k}`)
  const pular = () => {
    onSkip?.()
    onOpenChange?.(false)
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(proximo) => {
        if (!proximo) pular()
        else onOpenChange?.(true)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="welcome-dialog-veil"
          className="muriki-welcome-veil fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--background)_45%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.15]"
        />
        <DialogPrimitive.Popup
          data-slot="welcome-dialog"
          aria-label={eyebrow}
          initialFocus={conteudoRef}
          className={cn(
            "muriki-welcome-modal fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden",
            "rounded-[18px] bg-card text-card-foreground outline-none",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_var(--border)]",
            className
          )}
        >
          {splash === undefined ? <Splash brands={brands} highlight={highlight} /> : splash}

          <div className="muriki-scroll flex min-h-0 flex-col gap-[18px] overflow-y-auto px-7 pt-[22px] pb-6">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{eyebrow}</span>

            <ol className="flex gap-2.5" aria-label={t("welcome_dialog.step", { n: atual + 1, total: steps.length })}>
              {steps.map((s, i) => (
                <li key={i} aria-current={i === atual ? "step" : undefined} className="flex flex-1 flex-col gap-1.5">
                  <span
                    className={cn(
                      "h-1 rounded-full transition-colors duration-300",
                      i <= atual ? "bg-primary" : "bg-sunken"
                    )}
                  />
                  <span className="text-[11.5px] text-muted-foreground">
                    {i + 1}. {s.label}
                  </span>
                </li>
              ))}
            </ol>

            <div
              ref={conteudoRef}
              tabIndex={-1}
              data-slot="welcome-dialog-content"
              className="flex min-h-[268px] flex-col gap-3.5 outline-none"
            >
              {steps[atual]?.content}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={pular}
                className="rounded-[6px] text-[13.5px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground-strong focus-visible:ring-[3px] focus-visible:ring-ring/35"
              >
                {rotulo("skip")}
              </button>
              <span className="flex-1" />
              {atual > 0 ? (
                <Button variant="ghost" size="lg" onClick={() => irPara(atual - 1)}>
                  {rotulo("back")}
                </Button>
              ) : null}
              {ultimo ? (
                <Button variant="solid" size="lg" onClick={onFinish} render={finishRender}>
                  {rotulo("finish")}
                  <ArrowRightIcon aria-hidden data-motion="nudge" />
                </Button>
              ) : (
                <Button variant="solid" size="lg" onClick={() => irPara(atual + 1)}>
                  {rotulo("next")}
                  <ArrowRightIcon aria-hidden data-motion="nudge" />
                </Button>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { WelcomeDialog }
