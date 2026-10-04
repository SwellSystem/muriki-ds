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
 * As trilhas de arquitetura pedem antes Pleno numa linguagem (`gate.language`). Com ele, o caminho
 * tem duas etapas: primeiro a linguagem, depois o que falta na trilha.
 *
 * Regra de produto: swell-docs/muriki-api/ideas/2026-10-01-desbloqueio-de-trilha.md.
 */
import * as React from "react"
import { CompassIcon, LockSimpleIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { BRANDS, brandName, type Brand } from "@/components/ui/brand-logo"
import { LEVELS, LevelScale, useLevelName, type Level } from "@/components/ui/level-scale"
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

/** `gate.language` (GET /code/tracks): o caminho até Pleno numa família de linguagem. */
export interface LevelGateLanguage {
  /** A família, ex.: "js". */
  family: string
  /** O nome na frase. Sem isto, o da marca ("JavaScript"), ou a própria família. */
  name?: string
  /** As competências da família abaixo de Pleno, no mesmo formato de `gate.competencies`. */
  competencies: LevelGateCompetency[]
}

/** A linguagem sempre pede Pleno. */
const LANGUAGE_LEVEL: Level = "pleno"

const nomeDaLinguagem = (l: LevelGateLanguage) =>
  l.name ?? ((BRANDS as readonly string[]).includes(l.family) ? brandName(l.family as Brand) : l.family)

/** O `gate.language` que conta: sem competências, a linguagem já está em Pleno. */
const linguagemQueFalta = (l?: LevelGateLanguage | null) => (l && l.competencies.length > 0 ? l : null)

const somaDeEtapas = (competencies: LevelGateCompetency[]) => competencies.reduce((soma, c) => soma + c.missing.length, 0)

export interface LevelGatePathProps {
  /** O `startTier` da trilha. */
  level: Level
  /** `gate.competencies`: as competências abaixo do `startTier`. Quase sempre uma. */
  competencies: LevelGateCompetency[]
  /** `gate.language`: com ele, o caminho começa pela linguagem e a trilha vira a etapa seguinte. */
  language?: LevelGateLanguage | null
  className?: string
}

/** A escala e o que falta, numa linha: o primeiro item é a contagem, depois até dois nomes e "+N". */
function Linha({ level, declared, count, names }: { level: Level | null; declared?: Level | null; count: string; names: string[] }) {
  const resto = names.length - 2
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <LevelScale
        level={level}
        declared={declared}
        size="sm"
        label
        // no fundo afundado, o traço vazio (bg-sunken) sumiria: ganha a cor do filete
        className="[&>.bg-sunken]:bg-input"
      />
      <span className="text-xs text-muted-foreground">
        {[count, ...names.slice(0, 2), ...(resto > 0 ? [`+${resto}`] : [])].join(" · ")}
      </span>
    </span>
  )
}

const ordem = (l: Level | null) => (l ? LEVELS.indexOf(l) : -1)

/** A linha de um grupo de competências: com uma, as skills que faltam; com mais, a soma e os nomes. */
function LinhaDoGrupo({ competencies }: { competencies: LevelGateCompetency[] }) {
  const t = useTranslate()
  const uma = competencies.length === 1 ? competencies[0] : undefined
  if (uma) {
    return (
      <Linha
        level={uma.confirmed !== undefined ? uma.confirmed : uma.current}
        declared={uma.confirmed !== undefined ? uma.current : undefined}
        count={t("level_gate.missing", { count: uma.missing.length })}
        names={uma.missing.map((m) => m.title)}
      />
    )
  }
  const menor = competencies.reduce((a, c) => (ordem(c.current) < ordem(a.current) ? c : a))
  return (
    <Linha
      level={menor.current}
      count={t("level_gate.missing_in", { count: somaDeEtapas(competencies), competencies: competencies.length })}
      names={competencies.map((c) => c.title)}
    />
  )
}

/** "1" e "2" das etapas. A de agora em tinta forte; a seguinte apagada. */
function Numero({ n, depois }: { n: number; depois?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-semibold tabular-nums",
        depois ? "text-muted-foreground" : "text-foreground-strong"
      )}
    >
      {n}
    </span>
  )
}

/**
 * O caminho até o `startTier`, no fundo afundado do cartão, sempre em duas linhas, para o cartão
 * bloqueado ter a altura dos outros. Uma competência: a frase diz onde ("chegue a Pleno em
 * JavaScript") e a linha traz as skills que faltam. Mais de uma: a frase para no nível, a escala
 * mostra o menor nível entre elas e a linha soma as etapas e nomeia as competências. O detalhe por
 * competência fica para dentro da trilha.
 */
export function LevelGatePath({ level, competencies, language, className }: LevelGatePathProps) {
  const t = useTranslate()
  const nome = useLevelName()
  const lingua = linguagemQueFalta(language)
  const caixa = cn("flex flex-col gap-2 rounded-[10px] bg-sunken px-3.5 py-3", className)
  const frase = "text-[12.5px] font-medium text-foreground-strong"

  // Só a linguagem falta (a trilha já está no nível): uma etapa, como sempre.
  if (lingua && competencies.length === 0) {
    return (
      <div data-slot="level-gate-path" className={caixa}>
        <span className={frase}>
          {t("level_gate.reach_via", { level: nome(LANGUAGE_LEVEL), via: nomeDaLinguagem(lingua) })}
        </span>
        <LinhaDoGrupo competencies={lingua.competencies} />
      </div>
    )
  }
  if (competencies.length === 0) return null
  const uma = competencies.length === 1 ? competencies[0] : undefined

  // As duas etapas: a linguagem inteira, agora; a trilha numa linha só, depois. O cartão fica uma
  // linha mais alto que os outros.
  if (lingua) {
    const etapas = somaDeEtapas(competencies)
    const falta = uma
      ? t("level_gate.missing", { count: etapas })
      : t("level_gate.missing_in", { count: etapas, competencies: competencies.length })
    return (
      <div data-slot="level-gate-path" className={caixa}>
        <div className="flex items-start gap-2.5">
          <Numero n={1} />
          <div className="flex min-w-0 flex-col gap-2">
            <span className={frase}>
              {t("level_gate.step_reach_via", { level: nome(LANGUAGE_LEVEL), via: nomeDaLinguagem(lingua) })}
            </span>
            <LinhaDoGrupo competencies={lingua.competencies} />
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Numero n={2} depois />
          <span className="pt-px text-xs text-muted-foreground">
            {uma
              ? t("level_gate.then_via", { level: nome(level), via: uma.title, missing: falta })
              : t("level_gate.then", { level: nome(level), missing: falta })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div data-slot="level-gate-path" className={caixa}>
      <span className={frase}>
        {uma
          ? t("level_gate.reach_via", { level: nome(level), via: uma.title })
          : t("level_gate.reach", { level: nome(level) })}
      </span>
      <LinhaDoGrupo competencies={competencies} />
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
  /**
   * `gate.language`, direto da API. Com ele, o texto vira as duas etapas: Pleno na linguagem, depois
   * o que falta na trilha. `current`, `missing` e `via` deixam de valer.
   */
  language?: LevelGateLanguage | null
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

/** As frases das etapas do aviso com `gate.language`. */
function etapasDoAviso(
  t: (key: string, params?: Record<string, unknown>) => string,
  nome: (level: Level) => string,
  lingua: LevelGateLanguage,
  competencies: LevelGateCompetency[],
  level: Level
) {
  const uma = competencies.length === 1 ? competencies[0] : undefined
  const etapas = [
    t("level_gate.notice_step", {
      level: nome(LANGUAGE_LEVEL),
      via: nomeDaLinguagem(lingua),
      count: somaDeEtapas(lingua.competencies),
    }),
  ]
  if (competencies.length > 0) {
    etapas.push(
      t(uma ? "level_gate.notice_then_via" : "level_gate.notice_then", {
        level: nome(level),
        via: uma?.title ?? "",
        count: somaDeEtapas(competencies),
      })
    )
  }
  return etapas
}

/** O aviso `above_level` no topo da trilha aberta mesmo assim. */
export function LevelGate({
  level,
  competencies,
  language,
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
  const lingua = linguagemQueFalta(language)
  const etapas = lingua ? etapasDoAviso(t, nome, lingua, competencies ?? [], level) : null
  const texto =
    description ??
    (etapas ? t("level_gate.notice_go_on") : null) ??
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
        {etapas && !description ? (
          <ol className="flex max-w-[720px] flex-col gap-1.5 pt-0.5">
            {etapas.map((etapa, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-5 text-pretty text-foreground">
                <Numero n={i + 1} depois={i > 0} />
                <span>{etapa}</span>
              </li>
            ))}
          </ol>
        ) : null}
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
