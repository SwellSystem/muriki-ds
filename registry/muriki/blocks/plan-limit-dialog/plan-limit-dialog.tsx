"use client"

/**
 * Muriki PlanLimitDialog — a ação que o plano não deixa fazer agora (design/muriki-code/playground.py,
 * quadro PlaygroundLimite).
 *
 * O LIMITE SÓ APARECE QUANDO BLOQUEIA. Nada de contador nem barrinha antes da hora: a pessoa clica,
 * a API diz que não (no Playground, 409 DRAWING_LIMIT_REACHED) e o app abre este modal.
 *
 * É da família das boas-vindas e da troca de linguagem: o véu desfoca a janela inteira, o modal sobe
 * e, no topo, o palco no degradê da marca mostra o que bateu. Com `usage`, as vagas do plano: as
 * ocupadas em ladrilhos (o ícone do app, ex.: o logo de arquitetura), a próxima tracejada com o
 * cadeado, que balança uma vez, e o selo do Pro brilhando ao lado. Sem `usage`, o mascote com o selo.
 * Depois o rótulo mono, o título, o texto, o quadro do Pro (`benefit`) e o rodapé: "Agora não" à
 * esquerda e "Conhecer o Pro" (`upgradeRender` ou `onUpgrade`) à direita.
 *
 * Sem upgrade é só o aviso, com "Entendi": o teto técnico de quem já é Pro e o billing fora do ar
 * nunca oferecem o Pro (o selo some do palco). Os textos são do app, caso a caso; o bloco serve
 * para o próximo limite que bloquear uma ação. Avisos passivos, que não bloqueiam nada (a janela de
 * 7 dias da Evolução, a revisão da IA no Peer), não usam este modal.
 *
 * As partes do Pro saem também soltas, para quem já tem o próprio modal (o estado travado do
 * TrackLanguageSwitch): `PlanLimitBenefit`, o quadro do Pro, e `PlanLimitActions`, o rodapé.
 *
 * No celular (abaixo de md), a folha que sobe de baixo, com o principal em largura cheia. Movimento no
 * css do item (`muriki-planlimit-*`), desligado com prefers-reduced-motion.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ArrowRightIcon, LockSimpleIcon, SparkleIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface PlanLimitUsage {
  /** Quantos a pessoa já tem (pode passar do limite, para quem desceu do Pro). */
  used: number
  /** Quantos o plano guarda. */
  limit: number
  /** O ícone de cada vaga ocupada, ex.: <BrandLogo brand="architecture" size={24} />. */
  icon?: React.ReactNode
}

export interface PlanLimitDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  /** O rótulo mono do topo, ex.: "Playground · Starter". Padrão: "Limite do plano". */
  eyebrow?: string
  /** O que bateu, ex.: "O Starter guarda até 3 desenhos". */
  title: string
  /** O que fazer agora, ex.: "Para criar outro, apague um dos seus desenhos ou assine o Pro." */
  description: string
  /** O que o Pro dá, no quadro do Pro, ex.: "No Pro, desenhe sem limite." Só aparece com o upgrade. */
  benefit?: string
  /** As vagas do plano, no palco. Sem isto, o mascote. */
  usage?: PlanLimitUsage
  /** "Conhecer o Pro" como link do app, ex.: <Link to="/plans" />, ou `onUpgrade`. Sem os dois, é só o aviso. */
  upgradeRender?: React.ReactElement
  onUpgrade?: () => void
  labels?: Partial<Record<"upgrade" | "dismiss" | "ok" | "close" | "eyebrow", string>>
  className?: string
}

/** O selo do Pro: o ladrilho no degradê da marca, com o brilho e "PRO" em mono. */
function SeloPro({ grande = false }: { grande?: boolean }) {
  return (
    <span
      className={cn(
        "muriki-planlimit-pro relative flex shrink-0 flex-col items-center justify-center gap-0.5 text-primary-foreground",
        grande ? "size-[68px] rounded-[18px]" : "size-14 rounded-[15px]"
      )}
      style={{
        background: "linear-gradient(145deg, color-mix(in oklch, var(--primary) 78%, white) 0%, var(--primary) 55%, color-mix(in oklch, var(--primary) 70%, black) 100%)",
        boxShadow: "0 12px 26px -10px color-mix(in oklch, var(--primary) 70%, transparent), inset 0 1px 0 rgba(255,255,255,0.28)",
      }}
    >
      <SparkleIcon aria-hidden weight="fill" className={grande ? "size-6" : "size-5"} />
      <span className="font-mono text-[10px] leading-none font-semibold tracking-[0.16em]">PRO</span>
    </span>
  )
}

function Palco({ usage, oferta }: { usage?: PlanLimitUsage; oferta: boolean }) {
  const t = useTranslate()
  const cheias = usage ? Math.min(usage.used, usage.limit) : 0
  const sobra = usage ? Math.max(usage.used - usage.limit, 0) : 0
  return (
    <div
      aria-hidden
      data-slot="plan-limit-stage"
      className="relative flex h-[148px] shrink-0 items-center justify-center overflow-hidden md:h-44"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 16%, var(--card)) 0%, var(--card) 55%, color-mix(in oklch, var(--accent) 30%, var(--card)) 100%)",
      }}
    >
      <span className="absolute top-1/2 left-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]" />
      {usage ? (
        <div className="relative flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5 md:gap-3">
            {Array.from({ length: cheias }, (_, i) => (
              <span
                key={i}
                className="muriki-planlimit-slot flex size-12 items-center justify-center rounded-[13px] bg-card shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35),0_0_0_1px_var(--border)] md:size-[52px] md:rounded-[14px]"
                style={{ animationDelay: `${0.25 + 0.08 * i}s` }}
              >
                {usage.icon}
              </span>
            ))}
            {/* a próxima vaga: é aqui que bateu */}
            <span
              className="muriki-planlimit-next flex size-12 items-center justify-center rounded-[13px] text-muted-foreground shadow-[inset_0_0_0_1.5px_var(--input)] [background:color-mix(in_oklch,var(--card)_55%,transparent)] md:size-[52px] md:rounded-[14px]"
              style={{ animationDelay: `${0.25 + 0.08 * cheias}s` }}
            >
              <LockSimpleIcon className="size-5" />
            </span>
            {oferta ? (
              <>
                <span className="mx-0.5 flex items-center gap-0.5 text-primary/60 md:mx-1">
                  <ArrowRightIcon className="size-3.5" />
                </span>
                <SeloPro />
              </>
            ) : null}
          </div>
          <span className="rounded-full bg-card/80 px-2.5 py-0.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground shadow-[0_0_0_1px_var(--border)]">
            {sobra > 0
              ? t("plan_limit.usage_over", { used: usage.used, limit: usage.limit })
              : t("plan_limit.usage", { used: usage.used, limit: usage.limit })}
          </span>
        </div>
      ) : (
        <div className="relative flex items-end">
          <span className="muriki-planlimit-mascot flex size-[76px] md:size-[88px]">
            <MurikiLogo className="size-full" />
          </span>
          {oferta ? (
            <span className="-ml-3 mb-1 rotate-[8deg]">
              <SeloPro />
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

/** O que o Pro dá: o quadro tingido com o brilho e o texto. */
export function PlanLimitBenefit({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="plan-limit-benefit"
      className={cn(
        "flex items-center gap-3 rounded-[12px] px-3.5 py-3 text-[14px] leading-5 font-medium text-foreground-strong shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]",
        className
      )}
      style={{
        background: "linear-gradient(100deg, var(--primary-subtle) 0%, color-mix(in oklch, var(--primary-subtle) 40%, var(--card)) 100%)",
      }}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
        <SparkleIcon aria-hidden weight="fill" className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-pretty">{children}</span>
    </div>
  )
}

export interface PlanLimitActionsProps {
  /** "Conhecer o Pro": o link do app ou o clique. */
  upgradeRender?: React.ReactElement
  onUpgrade?: () => void
  /** "Agora não". */
  onDismiss?: () => void
  labels?: Partial<Record<"upgrade" | "dismiss", string>>
  className?: string
  /** Nos dois botões, ex.: a altura da folha do celular. */
  buttonClassName?: string
}

/**
 * "Agora não" e "Conhecer o Pro", como o rodapé das boas-vindas: o principal à direita, com a seta.
 * Abaixo de md, o principal em largura cheia em cima e "Agora não" embaixo.
 */
export function PlanLimitActions({ upgradeRender, onUpgrade, onDismiss, labels, className, buttonClassName }: PlanLimitActionsProps) {
  const t = useTranslate()
  return (
    <div
      data-slot="plan-limit-actions"
      className={cn("flex flex-col-reverse items-stretch gap-1.5 md:flex-row md:items-center md:justify-end md:gap-2", className)}
    >
      <Button variant="ghost" size="lg" onClick={onDismiss} className={cn("h-11 md:h-10", buttonClassName)}>
        {labels?.dismiss ?? t("plan_limit.dismiss")}
      </Button>
      <Button
        variant="solid"
        size="lg"
        onClick={onUpgrade}
        render={upgradeRender}
        nativeButton={!upgradeRender}
        className={cn("h-12 md:h-10", buttonClassName)}
      >
        {labels?.upgrade ?? t("plan_limit.upgrade")}
        <ArrowRightIcon aria-hidden data-motion="nudge" />
      </Button>
    </div>
  )
}

export function PlanLimitDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  benefit,
  usage,
  upgradeRender,
  onUpgrade,
  labels,
  className,
}: PlanLimitDialogProps) {
  const t = useTranslate()
  const oferta = !!(upgradeRender || onUpgrade)
  const fechar = () => onOpenChange?.(false)
  // o foco abre no título, e não no X nem num botão: quem usa teclado ou leitor de tela lê o que bateu
  const tituloRef = React.useRef<HTMLHeadingElement>(null)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="plan-limit-dialog-veil"
          className="muriki-planlimit-veil fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--background)_45%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.15]"
        />
        <DialogPrimitive.Popup
          data-slot="plan-limit-dialog"
          initialFocus={tituloRef}
          className={cn(
            "muriki-planlimit-modal fixed z-50 flex flex-col overflow-hidden bg-card text-card-foreground outline-none",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_var(--border)]",
            "max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92dvh] max-md:w-full max-md:rounded-t-[20px]",
            "md:top-1/2 md:left-1/2 md:max-h-[calc(100dvh-2rem)] md:w-[min(520px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[18px]",
            className
          )}
        >
          <span aria-hidden className="absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/20 md:hidden" />
          <DialogPrimitive.Close
            aria-label={labels?.close ?? t("plan_limit.close")}
            className="absolute top-3.5 right-3.5 z-10 inline-flex size-8 items-center justify-center rounded-[8px] bg-card/70 text-muted-foreground outline-none backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground-strong focus-visible:ring-[3px] focus-visible:ring-ring/35 max-md:hidden"
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>

          <Palco usage={usage} oferta={oferta} />

          <div className="muriki-scroll flex min-h-0 flex-col gap-[18px] overflow-y-auto px-5 pt-[18px] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-7 md:pt-[22px] md:pb-6">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {eyebrow ?? labels?.eyebrow ?? t("plan_limit.eyebrow")}
              </span>
              <DialogPrimitive.Title ref={tituloRef} tabIndex={-1} className="m-0 outline-none text-[21px] leading-[27px] font-semibold tracking-[-0.01em] text-balance text-foreground-strong md:text-2xl md:leading-[30px]">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="m-0 text-[14.5px] leading-[22px] text-pretty text-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>
            {oferta && benefit ? <PlanLimitBenefit>{benefit}</PlanLimitBenefit> : null}
            {oferta ? (
              <PlanLimitActions upgradeRender={upgradeRender} onUpgrade={onUpgrade} onDismiss={fechar} labels={labels} />
            ) : (
              <div className="flex flex-col items-stretch md:flex-row md:justify-end">
                <Button variant="solid" size="lg" onClick={fechar} className="h-12 md:h-10">
                  {labels?.ok ?? t("plan_limit.ok")}
                </Button>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
