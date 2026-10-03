"use client"

/**
 * Muriki TrackUnlock — o ganho de trilha (design/muriki-code/desbloqueio.py, TrilhaLiberada).
 *
 * Quando o nível da conta sobe e alcança o `startTier` de uma trilha, a pessoa vê UMA VEZ este
 * momento. Quem já começou no nível nunca vê (a trilha nasce liberada). O app decide quando abrir e
 * marca como visto ao fechar; o componente só desenha.
 *
 * Por cima de Trilhas, o véu e o diálogo (no celular, a folha que sobe de baixo): o mascote
 * comemorando num halo da marca, com brilhos; o rótulo "Trilha liberada"; o título; uma frase; a
 * linha da trilha, em que o selo "libera em Pleno" vira "liberada" e o traço do nível se enche; e
 * "Começar a trilha" com "Agora não". Esc e clique fora são "Agora não".
 *
 * Movimento (no css do item, `muriki-unlock-*`): o véu aparece, o diálogo sobe e cresce, o mascote
 * salta e flutua, os brilhos piscam, o selo troca e o traço se enche. Depois de fechar, o cartão da
 * trilha liberada pode pulsar duas vezes com `TRACK_UNLOCK_RING`. Com prefers-reduced-motion, o
 * estado final direto: só o selo "liberada" e a escala cheia.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ArrowRightIcon, CheckIcon, SparkleIcon } from "@phosphor-icons/react"

import { LevelGateBadge } from "@/components/blocks/level-gate"
import { Badge } from "@/components/ui/badge"
import { BrandLogo, type Brand } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { LEVELS, LevelScale, useLevelName, type Level } from "@/components/ui/level-scale"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** A classe do cartão da trilha recém-liberada, em Trilhas: um anel que pulsa duas vezes. */
export const TRACK_UNLOCK_RING = "muriki-unlock-ring"

export interface TrackUnlockProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  track: {
    /** O nome da trilha, ex.: "Arquitetura de sistemas". */
    title: string
    /** O nome curto do chip, ex.: "Arquitetura". */
    label: string
    brand?: Brand
  }
  /** O `startTier` da trilha, o nível que a pessoa acabou de alcançar. */
  level: Level
  /** Onde o nível foi confirmado, ex.: "JavaScript" vira "Você confirmou Pleno em JavaScript." */
  via?: string
  /** Quantas etapas a trilha tem no `level`, ex.: 3 vira "Pleno · 3 etapas". */
  steps?: number
  /** Troca o título ("{track} está liberada") ou a frase. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** "Começar a trilha". `startRender` é o link do roteador. */
  onStart?: () => void
  startRender?: React.ReactElement
  /** "Agora não", Esc e clique fora. */
  onDismiss?: () => void
  labels?: Partial<Record<"eyebrow" | "start" | "dismiss", string>>
  /** "auto": folha abaixo de md, diálogo acima. "dialog" e "sheet" fixam um dos dois. */
  variant?: "auto" | "dialog" | "sheet"
  className?: string
}

// As classes de cada forma, escritas por inteiro: o Tailwind só gera o que lê.
const FORMA = {
  auto: {
    popup:
      "muriki-unlock-modal muriki-unlock-auto max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92dvh] max-md:w-full max-md:rounded-t-[16px] max-md:px-5 max-md:pt-2.5 max-md:pb-[calc(1.75rem+env(safe-area-inset-bottom))] md:top-1/2 md:left-1/2 md:w-[min(480px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[12px] md:px-8 md:pt-7 md:pb-[26px]",
    alca: "md:hidden",
    mascote: "size-20 md:size-24",
    caixa: "h-[120px] w-[136px] md:h-[136px] md:w-[152px]",
    titulo: "text-[21px] leading-[27px] md:text-[22px] md:leading-7",
    botao: "h-12 md:h-11",
    agoraNao: "h-11 md:h-9",
  },
  dialog: {
    popup:
      "muriki-unlock-modal top-1/2 left-1/2 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[12px] px-8 pt-7 pb-[26px]",
    alca: "hidden",
    mascote: "size-24",
    caixa: "h-[136px] w-[152px]",
    titulo: "text-[22px] leading-7",
    botao: "h-11",
    agoraNao: "h-9",
  },
  sheet: {
    popup:
      "muriki-unlock-sheet inset-x-0 bottom-0 max-h-[92dvh] w-full rounded-t-[16px] px-5 pt-2.5 pb-[calc(1.75rem+env(safe-area-inset-bottom))]",
    alca: "",
    mascote: "size-20",
    caixa: "h-[120px] w-[136px]",
    titulo: "text-[21px] leading-[27px]",
    botao: "h-12",
    agoraNao: "h-11",
  },
} as const

// Os brilhos em volta do mascote: esquerda e topo (%), lado (px), cor e atraso (s).
const BRILHOS: [number, number, number, "accent" | "primary", number][] = [
  [6, 14, 16, "accent", 0.9],
  [84, 8, 12, "primary", 1.2],
  [88, 70, 14, "accent", 1.5],
  [2, 72, 10, "primary", 1.0],
]

function TrackUnlock({
  open,
  onOpenChange,
  track,
  level,
  via,
  steps,
  title,
  description,
  onStart,
  startRender,
  onDismiss,
  labels,
  variant = "auto",
  className,
}: TrackUnlockProps) {
  const f = FORMA[variant]
  const t = useTranslate()
  const nome = useLevelName()
  // o foco abre no título, não no botão: o anel de foco no "Começar" acenderia antes de a pessoa ler
  const tituloRef = React.useRef<HTMLHeadingElement>(null)
  const agoraNao = () => {
    onDismiss?.()
    onOpenChange?.(false)
  }
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(proximo) => {
        if (!proximo) agoraNao()
        else onOpenChange?.(true)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="track-unlock-veil"
          className="muriki-unlock-veil fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--background)_45%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.15]"
        />
        <DialogPrimitive.Popup
          data-slot="track-unlock"
          data-variant={variant}
          initialFocus={tituloRef}
          className={cn(
            "muriki-scroll fixed z-50 flex flex-col items-center gap-3 overflow-y-auto bg-card text-center text-card-foreground outline-none",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_var(--border)]",
            f.popup,
            className
          )}
        >
          <span aria-hidden className={cn("mb-1 h-1 w-9 shrink-0 rounded-full bg-input", f.alca)} />

          {/* o mascote de olhos abertos num halo da marca, com brilhos; nada de confete solto */}
          <div aria-hidden className={cn("relative flex shrink-0 items-center justify-center", f.caixa)}>
            <span className="muriki-unlock-halo absolute inset-x-3.5 inset-y-1.5 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--accent)_34%,transparent)_0%,transparent_68%)]" />
            <span className={cn("muriki-unlock-mascot relative flex", f.mascote)}>
              <MurikiLogo className="size-full" />
            </span>
            {BRILHOS.map(([x, y, lado, cor, atraso], i) => (
              <SparkleIcon
                key={i}
                weight="fill"
                className={cn("muriki-unlock-sparkle absolute", cor === "accent" ? "text-accent" : "text-primary")}
                style={{ left: `${x}%`, top: `${y}%`, width: lado, height: lado, animationDelay: `${atraso}s` }}
              />
            ))}
          </div>

          <span className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-primary uppercase">
            {labels?.eyebrow ?? t("track_unlock.eyebrow")}
          </span>
          <DialogPrimitive.Title
            ref={tituloRef}
            tabIndex={-1}
            className={cn("m-0 font-semibold outline-none tracking-[-0.01em] text-balance text-foreground-strong", f.titulo)}
          >
            {title ?? t("track_unlock.title", { track: track.title })}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="m-0 max-w-[380px] text-sm leading-[21px] text-pretty text-muted-foreground">
            {description ??
              (via
                ? t("track_unlock.description_via", { level: nome(level), via })
                : t("track_unlock.description", { level: nome(level) }))}
          </DialogPrimitive.Description>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1.5">
            <Badge tone="gray" className="pl-[5px]">
              {track.brand ? <BrandLogo brand={track.brand} size={14} /> : null}
              {track.label}
            </Badge>
            {/* o selo "libera em" sai e o "liberada" entra no mesmo lugar, no meio da célula */}
            <span className="inline-grid items-center justify-items-center">
              <span aria-hidden className="muriki-unlock-before col-start-1 row-start-1 flex">
                <LevelGateBadge level={level} />
              </span>
              <Badge tone="green" className="muriki-unlock-after col-start-1 row-start-1">
                <CheckIcon aria-hidden weight="bold" className="size-[11px]" />
                {t("track_unlock.unlocked")}
              </Badge>
            </span>
            <span data-fill={LEVELS.indexOf(level) + 1} className="muriki-unlock-scale flex">
              <LevelScale level={level} label />
            </span>
            {steps ? (
              <span className="text-xs text-muted-foreground">
                {nome(level)} ·{" "}
                {t("track_unlock.steps", { count: steps })}
              </span>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-stretch gap-1.5 pt-1.5">
            <Button
              variant="solid"
              size="lg"
              onClick={() => {
                onStart?.()
                onOpenChange?.(false)
              }}
              render={startRender}
              nativeButton={!startRender}
              className={f.botao}
            >
              {labels?.start ?? t("track_unlock.start")}
              <ArrowRightIcon aria-hidden data-motion="nudge" />
            </Button>
            <Button variant="ghost" size="lg" onClick={agoraNao} className={f.agoraNao}>
              {labels?.dismiss ?? t("track_unlock.dismiss")}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { TrackUnlock }
