"use client"

/**
 * Muriki PlanLimitDialog — a ação que o plano não deixa fazer agora (design/muriki-code/playground.py,
 * tela_limite_do_plano).
 *
 * O LIMITE SÓ APARECE QUANDO BLOQUEIA. Nada de contador nem barrinha antes da hora: a pessoa clica,
 * a API diz que não (no Playground, 409 DRAWING_LIMIT_REACHED) e o app abre este modal. Ele diz o
 * que bateu (`title`, `description`), o que o Pro dá (`benefit`) e oferece "Conhecer o Pro"
 * (`upgradeRender`) ao lado de "Agora não".
 *
 * Sem `upgradeRender`, é só o aviso, com "Entendi": o teto técnico de quem já é Pro e o billing fora
 * do ar nunca oferecem upgrade. Os textos são do app, caso a caso; o bloco serve para o próximo
 * limite que bloquear uma ação. Avisos passivos, que não bloqueiam nada (a janela de 7 dias da
 * Evolução, a revisão da IA no Peer), não usam este modal.
 *
 * As duas partes do Pro saem também soltas, para quem já tem o próprio modal (o estado travado do
 * TrackLanguageSwitch): `PlanLimitBenefit`, o quadro com o selo PRO, e `PlanLimitActions`, o
 * "Agora não" e o "Conhecer o Pro".
 */
import * as React from "react"
import { InfoIcon, SparkleIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface PlanLimitDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  /** O que bateu, ex.: "O Starter guarda até 3 desenhos". */
  title: string
  /** O que fazer agora, ex.: "Todos continuam abertos e editáveis. Para criar outro, apague um ou assine o Pro." */
  description: string
  /** O que o Pro dá, no quadro do Pro, ex.: "Desenhe sem limite". Só aparece com `upgradeRender`. */
  benefit?: string
  /** "Conhecer o Pro" como link do app, ex.: <Link to="/plans" />, ou `onUpgrade`. Sem os dois, o modal é só o aviso. */
  upgradeRender?: React.ReactElement
  onUpgrade?: () => void
  labels?: Partial<Record<"upgrade" | "dismiss" | "ok" | "close", string>>
  className?: string
}

/** O que o Pro dá, no quadro tingido com o selo PRO. */
export function PlanLimitBenefit({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="plan-limit-benefit"
      className={cn(
        "flex items-center gap-2.5 rounded-[10px] bg-primary-subtle px-3.5 py-3 text-[13.5px] leading-5 text-primary-subtle-foreground shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]",
        className
      )}
    >
      <Badge tone="blue" size="sm" className="shrink-0 font-mono tracking-[0.08em]">
        PRO
      </Badge>
      {children}
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
  size?: "default" | "lg"
  className?: string
  /** Nos dois botões, ex.: largura cheia na folha do celular. */
  buttonClassName?: string
}

/** "Agora não" e "Conhecer o Pro", nessa ordem: o Pro é o principal, à direita. */
export function PlanLimitActions({
  upgradeRender,
  onUpgrade,
  onDismiss,
  labels,
  size = "default",
  className,
  buttonClassName,
}: PlanLimitActionsProps) {
  const t = useTranslate()
  return (
    <div data-slot="plan-limit-actions" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>
      <Button variant="ghost" size={size} onClick={onDismiss} className={buttonClassName}>
        {labels?.dismiss ?? t("plan_limit.dismiss")}
      </Button>
      <Button variant="primary" size={size} onClick={onUpgrade} render={upgradeRender} nativeButton={!upgradeRender} className={buttonClassName}>
        <SparkleIcon aria-hidden weight="fill" />
        {labels?.upgrade ?? t("plan_limit.upgrade")}
      </Button>
    </div>
  )
}

export function PlanLimitDialog({
  open,
  onOpenChange,
  title,
  description,
  benefit,
  upgradeRender,
  onUpgrade,
  labels,
  className,
}: PlanLimitDialogProps) {
  const t = useTranslate()
  const oferta = !!(upgradeRender || onUpgrade)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="plan-limit-dialog"
        closeLabel={labels?.close ?? t("plan_limit.close")}
        className={cn("gap-5 sm:max-w-[440px]", className)}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-10 items-center justify-center rounded-[10px]",
            oferta
              ? "bg-primary-subtle text-primary shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]"
              : "bg-sunken text-muted-foreground"
          )}
        >
          {oferta ? <SparkleIcon weight="fill" className="size-5" /> : <InfoIcon className="size-5" />}
        </span>
        <DialogHeader>
          <DialogTitle className="text-[17px] leading-[23px]">{title}</DialogTitle>
          <DialogDescription className="text-[13.5px] leading-5">{description}</DialogDescription>
        </DialogHeader>
        {oferta && benefit ? <PlanLimitBenefit>{benefit}</PlanLimitBenefit> : null}
        {oferta ? (
          <PlanLimitActions upgradeRender={upgradeRender} onUpgrade={onUpgrade} onDismiss={() => onOpenChange?.(false)} labels={labels} />
        ) : (
          <DialogFooter>
            <Button variant="primary" onClick={() => onOpenChange?.(false)}>
              {labels?.ok ?? t("plan_limit.ok")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
