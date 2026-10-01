"use client"

/**
 * Muriki LevelProfile — as competências da pessoa, agrupadas (por linguagem), com o nível declarado,
 * o confirmado e o que falta para o próximo. É a primeira visão da Evolução do Code, na forma de
 * GET /code/evolution/profile (canvas: "Evolução · fatia 1").
 *
 * SEMPRE CONTRA O PRÓPRIO HISTÓRICO. Nada de ranking, média de outras pessoas ou seta de queda: o
 * nível só sobe, e a linha mostra onde a pessoa está e o que vem, nunca o que perdeu.
 *
 * DECLARADO E CONFIRMADO CONVIVEM. A escala é cheia até o confirmado e em contorno até o declarado;
 * ao lado, os dois por escrito. O declarado é o ponto de partida que a pessoa trouxe; só o
 * confirmado vem dos exercícios.
 *
 * O PRÓXIMO É O DA API: o tier seguinte e as etapas que faltam nas trilhas ("Senior: faltam 3
 * etapas"). Sem próximo, a competência está no topo.
 *
 * LINHA QUANDO CABE, CARTÃO QUANDO NÃO. Por container query, não por viewport: o mesmo bloco numa
 * coluna estreita do desktop vira cartão, como no celular.
 */
import * as React from "react"
import { CaretRightIcon } from "@phosphor-icons/react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { LevelScale, type Level } from "@/components/ui/level-scale"

export interface LevelProfileNext {
  tier: Level
  missing: Array<{ skillId: string; title: string; tier: Level }>
}

export interface LevelProfileItem {
  id: string
  title: string
  declared: Level
  confirmed: Level | null
  /** `null` = no topo. */
  next: LevelProfileNext | null
  /** O link do roteador para a competência, ex.: <Link to="/evolution/$id" />. Ganha de `href`. */
  render?: React.ReactElement
  href?: string
}

export interface LevelProfileGroup {
  id: string
  /** O rótulo mono do grupo, ex.: "JavaScript". */
  label: string
  items: LevelProfileItem[]
}

export interface LevelProfileProps {
  groups: LevelProfileGroup[]
  /** O título do cartão. Sem isto, "Suas competências"; `null` tira. */
  title?: React.ReactNode | null
  className?: string
}

const COLUNAS =
  "@[44rem]/lp:grid @[44rem]/lp:grid-cols-[minmax(0,1.4fr)_88px_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_16px] @[44rem]/lp:items-center @[44rem]/lp:gap-3.5"

export function LevelProfile({ groups, title, className }: LevelProfileProps) {
  const t = useTranslate()
  return (
    <section
      data-slot="level-profile"
      aria-label={typeof title === "string" ? title : t("level_profile.title")}
      className={cn("@container/lp flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs", className)}
    >
      {title === null ? null : (
        <h2 className="m-0 px-[18px] pt-4 pb-1.5 text-[15px] leading-5 font-semibold text-foreground-strong">
          {title ?? t("level_profile.title")}
        </h2>
      )}
      <div aria-hidden className={cn("hidden h-9 px-[18px]", COLUNAS)}>
        {(["competency", "level", "confirmed", "declared", "next"] as const).map((c) => (
          <span key={c} className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {t(`level_profile.columns.${c}`)}
          </span>
        ))}
        <span />
      </div>
      {groups.map((g) => (
        <div key={g.id} role="group" aria-label={g.label} className="flex flex-col">
          <div className="flex h-[30px] items-center border-t border-muted bg-rail px-[18px]">
            <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {g.label}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col p-0">
            {g.items.map((item, i) => (
              <li key={item.id} className={cn(i > 0 && "border-t border-muted")}>
                <Linha item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

function Linha({ item }: { item: LevelProfileItem }) {
  const t = useTranslate()
  const nome = (l: Level) => t(`level_scale.levels.${l}`)
  const navega = !!(item.render || item.href)
  const proximo = item.next
    ? item.next.missing.length
      ? t("level_profile.next_missing", { tier: nome(item.next.tier), count: item.next.missing.length })
      : t("level_profile.next_none", { tier: nome(item.next.tier) })
    : t("level_profile.top")
  const conteudo = (
    <>
      <span className="flex items-center gap-2.5 @[44rem]/lp:contents">
        <span className="min-w-0 flex-1 text-[14px] font-medium text-foreground-strong @[44rem]/lp:text-[13.5px]">
          {item.title}
        </span>
        <LevelScale level={item.confirmed} declared={item.declared} label />
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 @[44rem]/lp:contents">
        <span className="flex">
          {item.confirmed ? (
            <Badge tone="blue" dot>
              {t("level_profile.confirmed_as", { level: nome(item.confirmed) })}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{t("level_profile.not_confirmed")}</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("level_profile.declared_as", { level: nome(item.declared) })}
        </span>
        <span className="text-[12.5px] text-foreground">{proximo}</span>
      </span>
      {navega ? (
        <CaretRightIcon aria-hidden className="hidden size-3.5 text-muted-foreground @[44rem]/lp:block" />
      ) : (
        <span className="hidden @[44rem]/lp:block" />
      )}
    </>
  )
  return useRender({
    render: item.render ?? (item.href ? <a href={item.href} /> : undefined),
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex flex-col gap-2 px-[18px] py-3.5 text-inherit no-underline @[44rem]/lp:min-h-11 @[44rem]/lp:py-1.5",
          COLUNAS,
          navega && "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-inset"
        ),
      },
      { children: conteudo }
    ),
  })
}
