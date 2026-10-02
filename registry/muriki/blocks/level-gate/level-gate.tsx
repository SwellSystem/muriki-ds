"use client"

/**
 * Muriki LevelGate — a trilha que começa acima do nível da pessoa (design/muriki-code/desbloqueio.py).
 *
 * O DESBLOQUEIO É SUAVE: nada trava. A trilha com `startTier` acima do nível da conta aparece
 * bloqueada, com o caminho até lá, e abre mesmo assim. Três peças, uma para cada lugar:
 *
 * - `LevelGateBadge`, o selo "libera em Pleno", com o cadeado, no canto do cartão da trilha;
 * - `LevelGatePath`, o caminho dentro do cartão: o nível que libera, a escala de onde a pessoa está
 *   e o que falta (as etapas da Evolução);
 * - `LevelGate`, o aviso `above_level` no topo da trilha aberta mesmo assim. Não é alarme: é o fato
 *   e o caminho, em azul tingido, com a bússola. Entra uma vez, devagar, e sai quando a pessoa
 *   dispensa. Com prefers-reduced-motion, só aparece.
 *
 * Regra de produto: swell-docs/muriki-api/ideas/2026-10-01-desbloqueio-de-trilha.md.
 */
import * as React from "react"
import { CompassIcon, LockSimpleIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { LevelScale, useLevelName, type Level } from "@/components/ui/level-scale"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface LevelGateBadgeProps {
  /** O `startTier` da trilha. */
  level: Level
  className?: string
}

/** "libera em Pleno", em contorno, com o cadeado. */
export function LevelGateBadge({ level, className }: LevelGateBadgeProps) {
  const t = useTranslate()
  const nome = useLevelName()
  return (
    <Badge variant="outline" data-slot="level-gate-badge" className={className}>
      <LockSimpleIcon aria-hidden className="size-[11px]" />
      {t("level_gate.unlocks_at", { level: nome(level) })}
    </Badge>
  )
}

export interface LevelGatePathProps {
  /** O `startTier` da trilha. */
  level: Level
  /** O nível confirmado da pessoa na competência que libera (`null` = nada confirmado). */
  current: Level | null
  /** Onde o nível se confirma, ex.: "JavaScript". Sem isto, a frase para no nível. */
  via?: string
  /** As etapas que faltam, na ordem (os nomes vêm da API). Mostra as duas primeiras e "+N". */
  missing?: string[]
  className?: string
}

/** O caminho até o `startTier`, no fundo afundado do cartão. */
export function LevelGatePath({ level, current, via, missing = [], className }: LevelGatePathProps) {
  const t = useTranslate()
  const nome = useLevelName()
  const resto = missing.length - 2
  return (
    <div data-slot="level-gate-path" className={cn("flex flex-col gap-2 rounded-[10px] bg-sunken px-3.5 py-3", className)}>
      <span className="text-[12.5px] font-medium text-foreground-strong">
        {via
          ? t("level_gate.reach_via", { level: nome(level), via })
          : t("level_gate.reach", { level: nome(level) })}
      </span>
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <LevelScale level={current} size="sm" label />
        {missing.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {[
              t("level_gate.missing", { count: missing.length }),
              ...missing.slice(0, 2),
              ...(resto > 0 ? [`+${resto}`] : []),
            ].join(" · ")}
          </span>
        ) : null}
      </span>
    </div>
  )
}

export interface LevelGateProps {
  /** O `startTier` da trilha. */
  level: Level
  /** O nível da pessoa, para a frase "Você está em Junior". `null` tira a frase. */
  current?: Level | null
  /** Quantas etapas faltam para chegar ao `level` (o `next.missing` da Evolução). */
  missing?: number
  /** Onde elas estão, ex.: "JavaScript" vira "nas trilhas de JavaScript". */
  via?: string
  /** Troca o texto inteiro. O título continua o padrão, a menos que `title` venha. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** O link "Ver o caminho na Evolução": o link do roteador, ou `pathHref`. */
  pathRender?: React.ReactElement
  pathHref?: string
  /** "Entendi". Sem isto, o aviso não tem como ser dispensado (fica até a pessoa chegar ao nível). */
  onDismiss?: () => void
  labels?: Partial<Record<"path" | "dismiss", string>>
  className?: string
}

/** O aviso `above_level` no topo da trilha aberta mesmo assim. */
export function LevelGate({
  level,
  current,
  missing,
  via,
  title,
  description,
  pathRender,
  pathHref,
  onDismiss,
  labels,
  className,
}: LevelGateProps) {
  const t = useTranslate()
  const nome = useLevelName()
  const texto =
    description ??
    [
      current ? t("level_gate.notice_current", { current: nome(current) }) : null,
      t("level_gate.notice_go_on"),
      missing
        ? t(via ? "level_gate.notice_missing_via" : "level_gate.notice_missing", {
            level: nome(level),
            count: missing,
            via: via ?? "",
          })
        : null,
    ]
      .filter(Boolean)
      .join(" ")
  const link = pathRender ?? (pathHref ? <a href={pathHref} /> : null)
  const acao =
    "rounded-[4px] text-[13.5px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35"
  return (
    <section
      role="note"
      data-slot="level-gate"
      className={cn(
        "muriki-level-gate flex items-start gap-3.5 rounded-[12px] bg-primary-subtle px-[18px] py-4 shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]",
        className
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-primary">
        <CompassIcon aria-hidden className="size-[17px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-[14.5px] font-semibold text-primary-subtle-foreground">
          {title ?? t("level_gate.notice_title", { level: nome(level) })}
        </span>
        <span className="max-w-[720px] text-[13.5px] leading-5 text-pretty text-foreground">{texto}</span>
        {link || onDismiss ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            {link
              ? React.cloneElement(link, {
                  className: cn(acao, "text-primary underline-offset-[3px] hover:underline"),
                  children: labels?.path ?? t("level_gate.see_path"),
                } as React.HTMLAttributes<HTMLElement>)
              : null}
            {onDismiss ? (
              <button type="button" onClick={onDismiss} className={cn(acao, "text-muted-foreground hover:text-foreground-strong")}>
                {labels?.dismiss ?? t("level_gate.dismiss")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
