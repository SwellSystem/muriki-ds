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

/** Uma competência de `gate.competencies` (GET /code/tracks), no formato da API. */
export interface LevelGateCompetency {
  id: string
  /** O nome da competência, ex.: "JavaScript". */
  title: string
  /** O nível efetivo (o maior entre declarado e confirmado), `gate.competencies[].current`. */
  current: Level | null
  /**
   * O confirmado, se o app tiver (vem da Evolução, não do gate). Com ele, a escala fica cheia até
   * o confirmado e em contorno até o efetivo; sem ele, cheia até o efetivo.
   */
  confirmed?: Level | null
  /** As skills que faltam até o `startTier`, em ordem de catálogo. */
  missing: Array<{ skillId: string; title: string }>
}

export interface LevelGatePathProps {
  /** O `startTier` da trilha. */
  level: Level
  /** `gate.competencies`: as competências abaixo do `startTier`. Quase sempre uma. */
  competencies: LevelGateCompetency[]
  className?: string
}

function Faltam({ c }: { c: LevelGateCompetency }) {
  const t = useTranslate()
  const resto = c.missing.length - 2
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <LevelScale
        level={c.confirmed !== undefined ? c.confirmed : c.current}
        declared={c.confirmed !== undefined ? c.current : undefined}
        size="sm"
        label
        // no fundo afundado, o traço vazio (bg-sunken) sumiria: ganha a cor do filete
        className="[&>.bg-sunken]:bg-input"
      />
      {c.missing.length > 0 ? (
        <span className="text-xs text-muted-foreground">
          {[
            t("level_gate.missing", { count: c.missing.length }),
            ...c.missing.slice(0, 2).map((m) => m.title),
            ...(resto > 0 ? [`+${resto}`] : []),
          ].join(" · ")}
        </span>
      ) : null}
    </span>
  )
}

/**
 * O caminho até o `startTier`, no fundo afundado do cartão. Uma competência: a frase diz onde
 * ("chegue a Pleno em JavaScript") e vem uma linha. Mais de uma: a frase para no nível e cada
 * linha leva o nome da competência.
 */
export function LevelGatePath({ level, competencies, className }: LevelGatePathProps) {
  const t = useTranslate()
  const nome = useLevelName()
  if (competencies.length === 0) return null
  const uma = competencies.length === 1
  return (
    <div data-slot="level-gate-path" className={cn("flex flex-col gap-2 rounded-[10px] bg-sunken px-3.5 py-3", className)}>
      <span className="text-[12.5px] font-medium text-foreground-strong">
        {uma
          ? t("level_gate.reach_via", { level: nome(level), via: competencies[0].title })
          : t("level_gate.reach", { level: nome(level) })}
      </span>
      {uma ? (
        <Faltam c={competencies[0]} />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {competencies.map((c) => (
            <li key={c.id} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground">{c.title}</span>
              <Faltam c={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export interface LevelGateProps {
  /** O `startTier` da trilha. */
  level: Level
  /**
   * `gate.competencies`, direto da API. Preenche `current`, `missing` e `via` quando eles não vêm:
   * com uma competência, os três; com mais, só a soma das etapas.
   */
  competencies?: LevelGateCompetency[]
  /** O nível efetivo da pessoa (o maior entre declarado e confirmado), para "Você está em Junior". `null` tira a frase. */
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
  competencies,
  current: currentProp,
  missing: missingProp,
  via: viaProp,
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
  const uma = competencies?.length === 1 ? competencies[0] : undefined
  const current = currentProp !== undefined ? currentProp : uma?.current
  const missing = missingProp ?? competencies?.reduce((soma, c) => soma + c.missing.length, 0)
  const via = viaProp ?? uma?.title
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
