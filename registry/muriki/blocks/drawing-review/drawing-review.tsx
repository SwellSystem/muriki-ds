"use client"

/**
 * Muriki Drawing Review — a Revisão do Pro no desenho livre (canvas: DesenhoRevisao; contrato:
 * swell-docs/muriki-api/features/arch-cloud/fd-desenho.md, seção 4).
 *
 * Duas peças:
 *
 * - `DrawingReviewTrigger`, o "Revisar" com o selo Pro, no slot `actions` do PlaygroundDrawingHeader;
 * - `DrawingReviewSheet`, o painel da direita: o objetivo (opcional), o "Revisar", a revisão
 *   escolhida (o resumo e os cinco pilares do Well-Architected, cada um com o status, os achados e
 *   as sugestões) e o histórico das anteriores.
 *
 * O QUADRO CONTINUA À VISTA. Clicar num achado chama `onHighlight` com as refs que o desenho ainda
 * tem, e o app passa essas ids ao `highlight` do ArchitectureBoard. Ref que sumiu do desenho e
 * padrão que saiu do catálogo são ignorados, sem aviso: uma revisão antiga pode citar os dois.
 *
 * TEXTO PURO, SEMPRE. O resumo, o objetivo e cada achado vêm de uma IA que leu notas da pessoa: são
 * renderizados como texto do React, com as quebras de linha, e nunca viram link, markdown ou HTML.
 * O único link do painel é o `source` do padrão, que vem do catálogo, não da revisão.
 *
 * Só apresentação: nada chama API. Os erros (cota, limite por minuto, IA fora) chegam prontos em
 * `error`; o plano que não inclui a revisão é o PlanLimitDialog do app, não este painel.
 */
import * as React from "react"
import { ArrowSquareOutIcon, ClockCounterClockwiseIcon, SparkleIcon, WarningCircleIcon } from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetSection, SheetTitle } from "@/components/ui/sheet"

export type ReviewPillarName = "reliability" | "security" | "cost" | "performance" | "operations"
export type ReviewStatus = "ok" | "attention" | "risk" | "not_assessable"

export interface ReviewItem {
  text: string
  /** Ids de peças, grupos ou notas do desenho. */
  refs: string[]
  /** Id de um padrão do catálogo (`GET /code/cloud-services` `patterns`), ou `null`. */
  pattern: string | null
}

export interface DrawingReviewData {
  id: string
  /** Se o grafo e as notas de hoje ainda são os que a revisão leu (o título não conta). */
  current: boolean
  goal: string | null
  summary: string
  completedAt: string
  pillars: { pillar: ReviewPillarName; status: ReviewStatus; findings: ReviewItem[]; suggestions: ReviewItem[] }[]
}

export interface ReviewPatternInfo {
  id: string
  title: string
  description: string
  /** A página oficial do padrão (https), do catálogo. */
  source: string
}

/** O tamanho do objetivo, como a API conta. */
export const REVIEW_GOAL_MAX = 500

const TOM_DO_STATUS: Record<ReviewStatus, BadgeTone> = {
  ok: "green",
  attention: "yellow",
  risk: "red",
  not_assessable: "gray",
}

// ── o botão do cabeçalho ────────────────────────────────────────────────

export interface DrawingReviewTriggerProps {
  onClick: () => void
  className?: string
}

/** "Revisar" com o selo Pro: abre o painel. No Starter abre igual; o plano bloqueia no pedido. */
export function DrawingReviewTrigger({ onClick, className }: DrawingReviewTriggerProps) {
  const t = useTranslate()
  return (
    <Button data-slot="drawing-review-trigger" onClick={onClick} className={className}>
      <SparkleIcon aria-hidden />
      {t("drawing_review.trigger")}
      <Badge tone="purple" size="sm">
        Pro
      </Badge>
    </Button>
  )
}

// ── o painel ────────────────────────────────────────────────────────────

export interface DrawingReviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `undefined` = carregando a lista (esqueleto); `[]` = nenhuma revisão ainda. Mais nova primeiro. */
  reviews: DrawingReviewData[] | undefined
  /** O catálogo de padrões; id desconhecido é ignorado. */
  patterns: ReviewPatternInfo[]
  /** Id do desenho → rótulo legível (peça, grupo ou nota); ref desconhecida é ignorada. */
  refLabels: Record<string, string>
  /** Clicar num achado ou sugestão destaca essas peças no quadro; `[]` limpa. */
  onHighlight: (ids: string[]) => void
  goal: string
  onGoalChange: (goal: string) => void
  onRequest: () => void
  requesting: boolean
  /** Texto curto no lugar do "Revisar" ativo, ex.: "Salvando…". */
  requestDisabledReason?: string
  /** O que deu errado (cota, limite por minuto, IA fora), já traduzido. */
  error?: string | null
  locale: string
}

export function DrawingReviewSheet({
  open,
  onOpenChange,
  reviews,
  patterns,
  refLabels,
  onHighlight,
  goal,
  onGoalChange,
  onRequest,
  requesting,
  requestDisabledReason,
  error,
  locale,
}: DrawingReviewSheetProps) {
  const t = useTranslate()
  const [escolhida, setEscolhida] = React.useState<string | null>(null)
  // uma revisão nova chega no topo: o painel volta para ela
  const maisNova = reviews?.[0]?.id ?? null
  const [vista, setVista] = React.useState(maisNova)
  if (maisNova !== vista) {
    setVista(maisNova)
    setEscolhida(null)
  }
  const revisao = reviews?.find((r) => r.id === escolhida) ?? reviews?.[0]
  const anteriores = reviews?.filter((r) => r.id !== revisao?.id) ?? []
  const padroes = React.useMemo(() => new Map(patterns.map((p) => [p.id, p])), [patterns])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent anatomy="framed" closeLabel={t("drawing_review.close")} className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("drawing_review.title")}</SheetTitle>
          <SheetDescription>{t("drawing_review.description")}</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <SheetSection>
            <form
              className="flex flex-col gap-2.5"
              onSubmit={(e) => {
                e.preventDefault()
                onRequest()
              }}
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-foreground-strong">
                  {t("drawing_review.goal_label")}{" "}
                  <span className="font-normal text-muted-foreground">{t("drawing_review.optional")}</span>
                </span>
                <Textarea
                  value={goal}
                  onChange={(e) => onGoalChange(e.currentTarget.value)}
                  maxLength={REVIEW_GOAL_MAX}
                  showCount
                  autoResize
                  rows={2}
                  placeholder={t("drawing_review.goal_placeholder")}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" loading={requesting} disabled={!!requestDisabledReason}>
                  {!requesting ? <SparkleIcon aria-hidden /> : null}
                  {requesting ? t("drawing_review.requesting") : t("drawing_review.request")}
                </Button>
                {requestDisabledReason && !requesting ? (
                  <span className="text-[12px] text-muted-foreground">{requestDisabledReason}</span>
                ) : (
                  <span className="text-[12px] text-muted-foreground">{t("drawing_review.cost")}</span>
                )}
              </div>
              {error ? (
                <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] leading-[18px] text-destructive">
                  <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
                  {error}
                </p>
              ) : null}
            </form>
          </SheetSection>

          {reviews === undefined ? (
            <SheetSection aria-busy="true">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </SheetSection>
          ) : !revisao ? (
            <SheetSection>
              <p className="m-0 text-[13px] font-medium text-foreground-strong">{t("drawing_review.empty_title")}</p>
              <p className="m-0 text-[13px] leading-[19px] text-muted-foreground">{t("drawing_review.empty")}</p>
            </SheetSection>
          ) : (
            <>
              <SheetSection>
                <RevisaoEscolhida
                  revisao={revisao}
                  padroes={padroes}
                  refLabels={refLabels}
                  onHighlight={onHighlight}
                  locale={locale}
                />
              </SheetSection>
              {anteriores.length ? (
                <SheetSection>
                  <h3 className="m-0 flex items-center gap-1.5 font-mono text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                    <ClockCounterClockwiseIcon aria-hidden className="size-3.5" />
                    {t("drawing_review.history")}
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {anteriores.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setEscolhida(r.id)
                            onHighlight([])
                          }}
                          className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                        >
                          <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                            {formatReviewedAt(r.completedAt, locale)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                            {r.goal ?? t("drawing_review.no_goal")}
                          </span>
                          {!r.current ? (
                            <Badge variant="dashed" size="sm">
                              {t("drawing_review.outdated_badge")}
                            </Badge>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </SheetSection>
              ) : null}
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

/** "5 de out., 14:32": quando a revisão terminou, na língua do app. */
export function formatReviewedAt(completedAt: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(completedAt)
  )
}

function RevisaoEscolhida({
  revisao,
  padroes,
  refLabels,
  onHighlight,
  locale,
}: {
  revisao: DrawingReviewData
  padroes: Map<string, ReviewPatternInfo>
  refLabels: Record<string, string>
  onHighlight: (ids: string[]) => void
  locale: string
}) {
  const t = useTranslate()
  return (
    <div data-slot="drawing-review" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {formatReviewedAt(revisao.completedAt, locale)}
          {revisao.goal ? " · " : null}
          {revisao.goal ? <span className="whitespace-pre-line">{revisao.goal}</span> : null}
        </span>
        {!revisao.current ? (
          <p className="m-0 flex items-start gap-1.5 rounded-[8px] bg-tone-yellow px-2.5 py-2 text-[12.5px] leading-[18px] text-tone-yellow-foreground">
            <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
            {t("drawing_review.outdated")}
          </p>
        ) : null}
        <p className="m-0 text-[14px] leading-[21px] whitespace-pre-line text-foreground-strong">{revisao.summary}</p>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {revisao.pillars.map((p) => (
          <li key={p.pillar} className="flex flex-col gap-2 rounded-[10px] p-3 shadow-[inset_0_0_0_1px_var(--divider)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="m-0 text-[13.5px] font-semibold text-foreground-strong">
                {t(`drawing_review.pillar.${p.pillar}`)}
              </h3>
              <Badge
                tone={TOM_DO_STATUS[p.status]}
                variant={p.status === "not_assessable" ? "dashed" : "soft"}
                size="sm"
              >
                {t(`drawing_review.status.${p.status}`)}
              </Badge>
            </div>
            <Itens titulo={t("drawing_review.findings")} itens={p.findings} {...{ padroes, refLabels, onHighlight }} />
            <Itens titulo={t("drawing_review.suggestions")} itens={p.suggestions} {...{ padroes, refLabels, onHighlight }} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Itens({
  titulo,
  itens,
  padroes,
  refLabels,
  onHighlight,
}: {
  titulo: string
  itens: ReviewItem[]
  padroes: Map<string, ReviewPatternInfo>
  refLabels: Record<string, string>
  onHighlight: (ids: string[]) => void
}) {
  const t = useTranslate()
  if (!itens.length) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{titulo}</span>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {itens.map((item, i) => {
          const refs = item.refs.filter((id) => id in refLabels)
          const padrao = item.pattern ? padroes.get(item.pattern) : undefined
          const conteudo = (
            <>
              <span className="text-[13px] leading-[19px] whitespace-pre-line text-foreground">{item.text}</span>
              {refs.length ? (
                <span className="flex flex-wrap gap-1">
                  {refs.map((id) => (
                    <Badge key={id} variant="outline" size="sm" className="max-w-[160px]">
                      <span className="truncate">{refLabels[id]}</span>
                    </Badge>
                  ))}
                </span>
              ) : null}
            </>
          )
          return (
            <li key={i} className="flex flex-col gap-1">
              {refs.length ? (
                <button
                  type="button"
                  onClick={() => onHighlight(refs)}
                  title={t("drawing_review.show_on_board")}
                  className="-mx-1.5 flex flex-col items-start gap-1 rounded-[7px] px-1.5 py-1 text-left hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                >
                  {conteudo}
                </button>
              ) : (
                <div className="flex flex-col gap-1 py-1">{conteudo}</div>
              )}
              {padrao ? (
                <span className="flex flex-col gap-0.5 rounded-[7px] bg-primary-subtle px-2 py-1.5 text-[12px] leading-[17px] text-primary-subtle-foreground">
                  <a
                    href={padrao.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1 font-medium underline-offset-[3px] hover:underline"
                  >
                    {padrao.title}
                    <ArrowSquareOutIcon aria-hidden className="size-3" />
                  </a>
                  <span className="opacity-85">{padrao.description}</span>
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
