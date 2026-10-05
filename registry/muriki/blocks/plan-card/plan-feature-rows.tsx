// As linhas de recursos do plano (design/muriki-code, tela_planos e tela_plano_inicial).
//
// Os recursos chegam tipados do GET /plans (`kind`, `value`, `unit`) e o
// componente formata: "50 por mês", "7 dias", o selo "sem limite" quando o
// limite é null, o check do boolean ligado e o "—" apagado do desligado.
// Cada cartão mostra AS MESMAS linhas, na mesma ordem, para comparar de olho;
// com `compareTo` (os recursos do plano de base), o que melhora sai na cor
// da marca, com o ícone tingido. Nada de "nome: valor" montado na mão, nem
// de listar só o que mudou.
import type { ReactNode } from "react"
import { CheckIcon } from "@phosphor-icons/react"

import { Skeleton } from "@/components/ui/skeleton"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type PlanFeatureUnit = "per_month" | "per_day" | "days" | "months" | "people"

interface PlanFeatureBase {
  key: string
  /** O nome curto, sem a unidade, ex.: "Interações com a IA". */
  name: string
  /** O ícone do recurso, do app (ex.: <ChatCircleTextIcon />). Sem ele, a linha não tem o quadradinho. */
  icon?: ReactNode
}

export type PlanFeature =
  | (PlanFeatureBase & { kind: "boolean"; value: boolean })
  | (PlanFeatureBase & { kind: "limit"; value: number | null; unit?: PlanFeatureUnit | null })
  | (PlanFeatureBase & { kind: "value"; value: string })

/** Se o recurso é melhor que o do plano de base: mais limite, sem limite ou ligado. */
export function planFeatureImproves(feature: PlanFeature, base?: PlanFeature) {
  if (!base || base.kind !== feature.kind) return false
  if (feature.kind === "boolean") return feature.value && !base.value
  if (feature.kind === "limit" && base.kind === "limit") {
    if (feature.value === null) return base.value !== null
    return base.value !== null && feature.value > base.value
  }
  return false
}

export interface PlanFeatureRowsProps {
  features: PlanFeature[]
  /** Os recursos do plano de base (o mais barato): o que melhora em relação a ele sai em destaque. */
  compareTo?: PlanFeature[]
  /** O título mono acima, ex.: "O que vem no plano". */
  title?: string
  locale?: string
  className?: string
}

export function PlanFeatureRows({ features, compareTo, title, locale = "pt-BR", className }: PlanFeatureRowsProps) {
  const t = useTranslate()
  const numero = new Intl.NumberFormat(locale)

  const valor = (f: PlanFeature, melhora: boolean) => {
    if (f.kind === "boolean") {
      return f.value ? (
        <CheckIcon aria-label={t("plan_features.included")} size={16} weight="bold" className="shrink-0 text-success" />
      ) : (
        <span aria-label={t("plan_features.not_included")} className="text-sm text-muted-foreground">
          —
        </span>
      )
    }
    if (f.kind === "limit" && f.value === null) {
      return (
        <span className="inline-flex h-[22px] shrink-0 items-center rounded-full bg-primary-subtle px-2 text-xs font-semibold whitespace-nowrap text-primary-subtle-foreground">
          {t("plan_features.unlimited")}
        </span>
      )
    }
    const texto =
      f.kind === "limit"
        ? f.unit
          ? t(`plan_features.${f.unit}`, { count: f.value as number, value: numero.format(f.value as number) })
          : numero.format(f.value as number)
        : f.value
    return (
      <span
        className={cn(
          "text-right text-[13.5px] font-semibold whitespace-nowrap tabular-nums",
          melhora ? "text-primary" : "text-foreground-strong"
        )}
      >
        {texto}
      </span>
    )
  }

  return (
    <div data-slot="plan-feature-rows" className={cn("flex flex-col gap-1", className)}>
      {title ? (
        <p className="pt-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">{title}</p>
      ) : null}
      <ul className="flex flex-col">
        {features.map((f, i) => {
          const melhora = planFeatureImproves(f, compareTo?.find((b) => b.key === f.key))
          const falta = f.kind === "boolean" && !f.value
          return (
            <li
              key={f.key}
              className={cn("flex min-h-11 items-center gap-3 py-1", i > 0 && "border-t border-muted")}
            >
              {f.icon ? (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[8px] [&>svg]:size-[15px]",
                    melhora ? "bg-primary-subtle text-primary-subtle-foreground" : "bg-sunken text-muted-foreground"
                  )}
                >
                  {f.icon}
                </span>
              ) : null}
              <span
                className={cn(
                  "min-w-0 flex-1 text-[13.5px] leading-[19px]",
                  falta ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {f.name}
              </span>
              {valor(f, melhora)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** A silhueta das linhas: o quadradinho, o nome e o valor, com larguras diferentes. */
export function PlanFeatureRowsSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  const larguras: [number, number][] = [[62, 64], [48, 24], [56, 52], [70, 60], [58, 112], [66, 18]]
  return (
    <div aria-hidden className={cn("flex flex-col gap-1", className)}>
      <Skeleton className="mt-3 h-2.5 w-[124px]" />
      <ul className="flex flex-col">
        {Array.from({ length: rows }, (_, i) => {
          const [nome, valor] = larguras[i % larguras.length]
          return (
            <li key={i} className={cn("flex min-h-11 items-center gap-3 py-1", i > 0 && "border-t border-muted")}>
              <Skeleton className="size-7 shrink-0" />
              <span className="flex-1">
                <Skeleton className="h-3" style={{ width: `${nome}%` }} />
              </span>
              <Skeleton className="h-3" style={{ width: valor }} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
