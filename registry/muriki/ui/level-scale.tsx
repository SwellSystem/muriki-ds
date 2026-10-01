"use client"

/**
 * Muriki LevelScale e LevelOrigin — o nível de uma competência e de onde ele vem.
 *
 * A ESCALA SÃO QUATRO TRAÇOS, um por nível (Fundamentos, Junior, Pleno, Senior). O traço CHEIO é o
 * nível confirmado nos exercícios; o traço em CONTORNO, acima dele, é o declarado que ainda não foi
 * confirmado (o ponto de partida que a pessoa trouxe); o resto é encaixe vazio, o que ainda vem.
 * Não tem número nem porcentagem: o nível é um degrau, e nunca desce.
 *
 * A ORIGEM SÓ VIRA SELO QUANDO ALGUÉM AFIRMOU: confirmado nos exercícios (azul, com o ponto) ou o
 * que a pessoa contou (cinza). O nível que veio do tempo de código é uma estimativa, e por isso é
 * uma nota em texto, não um selo: selo para tudo é selo para nada. É a leitura do `source` de
 * GET /code/competencies; a Evolução usa `declared` e `confirmed` direto na escala.
 *
 * Os valores são os da API, em texto, sem conversão.
 */
import { Badge } from "@/components/ui/badge"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export const LEVELS = ["fundamentos", "junior", "pleno", "senior"] as const

export type Level = (typeof LEVELS)[number]

export type LevelSource = "declared_from_experience" | "declared" | "assessed"

const TAMANHOS = {
  sm: "h-1 w-3",
  default: "h-1.5 w-[18px]",
  lg: "h-2 w-6",
}

export interface LevelScaleProps {
  /** O nível que conta: cheio até ele. `null` = nada confirmado ainda. */
  level: Level | null
  /** O declarado: acima do `level`, os traços até ele ficam em contorno. */
  declared?: Level | null
  size?: keyof typeof TAMANHOS
  /** Sem isto, a escala é só desenho (aria-hidden) e o nível precisa estar escrito ao lado. */
  label?: boolean
  className?: string
}

export function LevelScale({ level, declared, size = "default", label = false, className }: LevelScaleProps) {
  const t = useTranslate()
  const cheio = level ? LEVELS.indexOf(level) + 1 : 0
  const contorno = declared ? LEVELS.indexOf(declared) + 1 : 0
  const nome = (l: Level) => t(`level_scale.levels.${l}`)
  const rotulo = level
    ? declared && contorno > cheio
      ? t("level_scale.label_both", { level: nome(level), declared: nome(declared) })
      : t("level_scale.label", { level: nome(level) })
    : declared
      ? t("level_scale.label_declared", { declared: nome(declared) })
      : t("level_scale.label_none")
  return (
    <span
      data-slot="level-scale"
      role={label ? "img" : undefined}
      aria-label={label ? rotulo : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 gap-[3px]", className)}
    >
      {LEVELS.map((chave, i) => (
        <span
          key={chave}
          className={cn(
            "rounded-[2px]",
            TAMANHOS[size],
            i < cheio ? "bg-primary" : i < contorno ? "shadow-[inset_0_0_0_1px_var(--primary)]" : "bg-sunken"
          )}
        />
      ))}
    </span>
  )
}

export interface LevelOriginProps {
  source: LevelSource
  /** O nível do tempo de código vira nota; `false` some com ela (o selo das outras origens fica). */
  showEstimate?: boolean
  className?: string
}

export function LevelOrigin({ source, showEstimate = true, className }: LevelOriginProps) {
  const t = useTranslate()
  if (source === "assessed")
    return (
      <Badge tone="blue" dot className={className}>
        {t("level_scale.source.assessed")}
      </Badge>
    )
  if (source === "declared")
    return (
      <Badge tone="gray" className={className}>
        {t("level_scale.source.declared")}
      </Badge>
    )
  if (!showEstimate) return null
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {t("level_scale.source.declared_from_experience")}
    </span>
  )
}

/** O nome do nível no idioma do app, para quem precisa escrevê-lo ao lado da escala. */
export function useLevelName() {
  const t = useTranslate()
  return (level: Level) => t(`level_scale.levels.${level}`)
}
