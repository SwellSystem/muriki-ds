"use client"

/**
 * Muriki Playground — o lugar de criar livre do Code (muriki-api features/arch-cloud/fd-desenho.md).
 *
 * O Playground tem tipos. O primeiro é o Desenho de arquitetura (o desenho livre, no
 * ArchitectureBoard sem regras); o Código livre aparece "em breve". Três peças:
 *
 * - `PlaygroundPage`, a tela: os tipos no topo, "Seus desenhos" embaixo;
 * - `PlaygroundDrawingHeader`, o cabeçalho do editor: voltar, título editável e o estado de salvo;
 * - `PlaygroundConflict`, o aviso de que o desenho mudou em outro aparelho (409 DRAWING_CONFLICT).
 *
 * O LIMITE DO PLANO SÓ APARECE QUANDO BLOQUEIA. O "Novo desenho" fica sempre ativo, sem contador:
 * quando a API recusa (409 DRAWING_LIMIT_REACHED, DRAWING_CEILING_REACHED ou o billing fora do ar),
 * o app abre o `PlanLimitDialog` com os textos de `playground.limit`. Só o Starter recebe a oferta do
 * Pro; o teto técnico e o billing fora do ar avisam sem ela. Quem desceu do Pro e tem mais que o
 * limite vê e edita todos; só criar bate no modal.
 *
 * Só apresentação: nada chama API.
 */
import * as React from "react"
import {
  ArrowClockwiseIcon,
  CaretRightIcon,
  ChatCircleTextIcon,
  CloudIcon,
  CodeIcon,
  NotePencilIcon,
  PlusIcon,
  PulseIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { BackLink } from "@/components/ui/back-link"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ExerciseSaveStatus, type ExerciseSaveState } from "@/components/blocks/exercise-workspace/exercise-workspace"

// ── o tempo relativo ────────────────────────────────────────────────────

/** "há 2 h", "ontem", "há 3 dias": o salvo em de cada desenho, na língua do app. */
export function formatSavedAgo(savedAt: Date | string | number, locale = "pt-BR", now = Date.now()) {
  const s = (new Date(savedAt).getTime() - now) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" })
  const abs = Math.abs(s)
  if (abs < 45) return rtf.format(0, "second")
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour")
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day")
  if (abs < 86400 * 365) return rtf.format(Math.round(s / (86400 * 30)), "month")
  return rtf.format(Math.round(s / (86400 * 365)), "year")
}

// ── a tela ──────────────────────────────────────────────────────────────

export interface PlaygroundDrawing {
  id: string
  title: string
  savedAt: Date | string | number
  /** Quando foi criado: a segunda linha do desenho na lista. */
  createdAt?: Date | string | number
}

/** "2 de out.": o dia em que o desenho nasceu, na língua do app. */
export function formatCreatedOn(createdAt: Date | string | number, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(createdAt))
}

/** Os pontos do que o tipo faz: ícone e texto curto, um por linha. */
function Pontos({ itens, apagado }: { itens: Array<{ icone: React.ElementType; texto: string }>; apagado?: boolean }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {itens.map(({ icone: Icone, texto }) => (
        <li key={texto} className={cn("flex items-center gap-2.5 text-[13px] leading-[18px]", apagado ? "text-muted-foreground" : "text-foreground")}>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-[7px]",
              apagado ? "bg-sunken text-muted-foreground" : "bg-primary-subtle text-primary-subtle-foreground"
            )}
          >
            <Icone aria-hidden className="size-3.5" />
          </span>
          {texto}
        </li>
      ))}
    </ul>
  )
}

export interface PlaygroundPageProps {
  /** Os desenhos da pessoa (`GET /code/drawings`); `null` enquanto carrega. */
  drawings: PlaygroundDrawing[] | null
  onNewDrawing?: () => void
  creating?: boolean
  /** O link para abrir um desenho (o <Link> do roteador), ou `onOpen`. */
  renderOpen?: (drawing: PlaygroundDrawing) => React.ReactElement
  onOpen?: (drawing: PlaygroundDrawing) => void
  /** Apagar, depois da confirmação. */
  onDelete?: (drawing: PlaygroundDrawing) => void
  locale?: string
  className?: string
}

export function PlaygroundPage({
  drawings,
  onNewDrawing,
  creating,
  renderOpen,
  onOpen,
  onDelete,
  locale = "pt-BR",
  className,
}: PlaygroundPageProps) {
  const t = useTranslate()
  return (
    <div data-slot="playground" className={cn("flex min-w-0 flex-col gap-6", className)}>
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
          {t("playground.title")}
        </h1>
        <p className="m-0 max-w-[640px] text-sm leading-[21px] text-muted-foreground">{t("playground.subtitle")}</p>
      </header>

      <section aria-label={t("playground.types")} className="grid gap-4 md:grid-cols-2">
        {/* o tipo que existe: o desenho livre */}
        <article className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            {/* o ladrilho no tom da marca, e não branco: no escuro, o branco acendia no cartão */}
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-primary-subtle shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]">
              <BrandLogo brand="architecture" size={24} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="m-0 text-[17px] leading-[23px] font-semibold text-foreground-strong">{t("playground.drawing.title")}</h2>
              <p className="m-0 text-[13.5px] leading-5 text-muted-foreground">{t("playground.drawing.description")}</p>
            </div>
          </div>
          <Pontos
            itens={[
              { icone: CloudIcon, texto: t("playground.drawing.point_providers") },
              { icone: NotePencilIcon, texto: t("playground.drawing.point_groups") },
              { icone: PulseIcon, texto: t("playground.drawing.point_simulate") },
            ]}
          />
          {/* o pé: o Novo, sempre ativo; o limite do plano só aparece se bloquear (PlanLimitDialog) */}
          <div className="mt-auto flex items-center gap-3 border-t border-muted pt-4">
            <Button
              variant="primary"
              onClick={onNewDrawing}
              disabled={!onNewDrawing}
              loading={creating}
              className="ml-auto"
            >
              <PlusIcon aria-hidden weight="bold" />
              {t("playground.drawing.new")}
            </Button>
          </div>
        </article>

        {/* o tipo que vem: o código livre, com o contorno tracejado do que ainda não existe */}
        <article
          aria-disabled
          className="flex flex-col gap-4 rounded-xl border-[1.5px] border-dashed border-input bg-card/50 p-5"
        >
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-sunken text-muted-foreground">
              <CodeIcon aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="m-0 flex flex-wrap items-center gap-2 text-[17px] leading-[23px] font-semibold text-foreground">
                {t("playground.code.title")}
                <Badge tone="gray">{t("playground.soon")}</Badge>
              </h2>
              <p className="m-0 text-[13.5px] leading-5 text-muted-foreground">{t("playground.code.description")}</p>
            </div>
          </div>
          <Pontos
            apagado
            itens={[
              { icone: CodeIcon, texto: t("playground.code.point_languages") },
              { icone: ChatCircleTextIcon, texto: t("playground.code.point_peer") },
            ]}
          />
          <span className="mt-auto border-t border-muted pt-4 text-[12px] text-muted-foreground">{t("playground.code.notify")}</span>
        </article>
      </section>

      <section aria-labelledby="playground-lista" className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <h2 id="playground-lista" className="m-0 text-[15px] leading-5 font-semibold text-foreground-strong">
            {t("playground.list.title")}
          </h2>
        </div>
        <ListaDeDesenhos
          drawings={drawings}
          renderOpen={renderOpen}
          onOpen={onOpen}
          onDelete={onDelete}
          locale={locale}
        />
      </section>
    </div>
  )
}

function ListaDeDesenhos({
  drawings,
  renderOpen,
  onOpen,
  onDelete,
  locale,
}: Pick<PlaygroundPageProps, "drawings" | "renderOpen" | "onOpen" | "onDelete"> & { locale: string }) {
  const t = useTranslate()
  const [apagando, setApagando] = React.useState<PlaygroundDrawing | null>(null)
  if (!drawings)
    return (
      <div aria-busy className="flex flex-col overflow-hidden rounded-xl bg-card shadow-xs">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-14 items-center gap-4 border-t border-muted px-4 first:border-t-0">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="ml-auto h-3 w-24" />
          </div>
        ))}
      </div>
    )
  if (!drawings.length)
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl bg-card px-6 py-10 text-center shadow-xs">
        <span className="text-[14px] font-medium text-foreground-strong">{t("playground.list.empty_title")}</span>
        <span className="max-w-[380px] text-[13px] leading-5 text-muted-foreground">{t("playground.list.empty")}</span>
      </div>
    )
  return (
    <>
      <ul className="m-0 flex list-none flex-col overflow-hidden rounded-xl bg-card p-0 shadow-xs">
        {drawings.map((d) => (
          <li key={d.id} className="group/linha flex min-h-16 items-center gap-2 border-t border-muted pr-2 pl-3 first:border-t-0 hover:bg-muted/50">
            <Abrir drawing={d} renderOpen={renderOpen} onOpen={onOpen}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-primary-subtle">
                <BrandLogo brand="architecture" size={18} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[14px] leading-5 font-medium text-foreground-strong">{d.title}</span>
                {d.createdAt !== undefined ? (
                  <span className="truncate text-[12px] text-muted-foreground">
                    {t("playground.list.created", { date: formatCreatedOn(d.createdAt, locale) })}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[12.5px] text-muted-foreground max-sm:hidden">
                {t("playground.list.saved", { ago: formatSavedAgo(d.savedAt, locale) })}
              </span>
              <CaretRightIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/linha:translate-x-0.5"
              />
            </Abrir>
            {onDelete ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("playground.list.delete", { title: d.title })}
                      onClick={() => setApagando(d)}
                    />
                  }
                >
                  <TrashIcon aria-hidden />
                </TooltipTrigger>
                <TooltipContent>{t("playground.list.delete_short")}</TooltipContent>
              </Tooltip>
            ) : null}
          </li>
        ))}
      </ul>
      <AlertDialog open={!!apagando} onOpenChange={(aberto) => !aberto && setApagando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("playground.confirm.title", { title: apagando?.title ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("playground.confirm.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("playground.confirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => apagando && onDelete?.(apagando)}>{t("playground.confirm.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** A linha inteira abre o desenho: o link do roteador, ou um botão. */
function Abrir({
  drawing,
  renderOpen,
  onOpen,
  children,
}: {
  drawing: PlaygroundDrawing
  renderOpen?: (drawing: PlaygroundDrawing) => React.ReactElement
  onOpen?: (drawing: PlaygroundDrawing) => void
  children: React.ReactNode
}) {
  return useRender({
    defaultTagName: "button",
    render: renderOpen?.(drawing),
    props: mergeProps<"button">(
      {
        className:
          "flex min-w-0 flex-1 items-center gap-4 self-stretch rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
        children,
      },
      renderOpen ? {} : { type: "button", onClick: () => onOpen?.(drawing) }
    ),
  })
}

// ── o editor ────────────────────────────────────────────────────────────

export const DRAWING_TITLE_MAX = 80

export interface PlaygroundDrawingHeaderProps {
  /** O link de volta ao Playground (o <Link> do roteador). */
  backRender?: React.ReactElement
  title: string
  /** O título novo, já sem espaços nas pontas e entre 1 e 80 caracteres. Vazio volta ao anterior. */
  onTitleChange?: (title: string) => void
  saveState?: ExerciseSaveState
  savedAt?: Date | string | number
  locale?: string
  /** À direita do estado de salvo: ações do app (a Revisão do Pro, quando vier). */
  actions?: React.ReactNode
  className?: string
}

/** O cabeçalho do desenho livre: voltar, o título (um clique edita) e o estado de salvo. */
export function PlaygroundDrawingHeader({
  backRender,
  title,
  onTitleChange,
  saveState,
  savedAt,
  locale,
  actions,
  className,
}: PlaygroundDrawingHeaderProps) {
  const t = useTranslate()
  const [editando, setEditando] = React.useState(false)
  return (
    <header data-slot="playground-drawing-header" className={cn("flex flex-wrap items-end gap-x-6 gap-y-2", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <BackLink render={backRender}>{t("playground.title")}</BackLink>
        {editando && onTitleChange ? (
          <CampoDoTitulo
            titulo={title}
            onFim={(novo) => {
              setEditando(false)
              if (novo && novo !== title) onTitleChange(novo)
            }}
          />
        ) : (
          <h1 className="m-0 min-w-0 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong">
            {onTitleChange ? (
              <button
                type="button"
                onClick={() => setEditando(true)}
                title={t("playground.editor.rename")}
                className="-mx-1 max-w-full truncate rounded-md px-1 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                {title}
              </button>
            ) : (
              <span className="truncate">{title}</span>
            )}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3 pb-1">
        {saveState ? <ExerciseSaveStatus state={saveState} savedAt={savedAt} locale={locale} /> : null}
        {actions}
      </div>
    </header>
  )
}

function CampoDoTitulo({ titulo, onFim }: { titulo: string; onFim: (novo: string | null) => void }) {
  const t = useTranslate()
  const limpo = (v: string) => v.replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, "").trim().slice(0, DRAWING_TITLE_MAX)
  return (
    <input
      autoFocus
      defaultValue={titulo}
      maxLength={DRAWING_TITLE_MAX}
      aria-label={t("playground.editor.title_label")}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") onFim(limpo(e.currentTarget.value) || null)
        if (e.key === "Escape") onFim(null)
      }}
      onBlur={(e) => onFim(limpo(e.currentTarget.value) || null)}
      className="-mx-1 w-full max-w-[640px] rounded-md bg-field px-1 text-[28px] leading-[34px] font-semibold tracking-[-0.01em] text-foreground-strong outline-none ring-2 ring-primary"
    />
  )
}

export interface PlaygroundConflictProps {
  /** Carregar a versão gravada em outro aparelho (o que está aqui é descartado). */
  onReload: () => void
  /** Manter o que está aqui e gravar por cima, se o app oferecer. */
  onKeepMine?: () => void
  className?: string
}

/** 409 DRAWING_CONFLICT: o desenho mudou em outro aparelho e o que está aqui não foi salvo. */
export function PlaygroundConflict({ onReload, onKeepMine, className }: PlaygroundConflictProps) {
  const t = useTranslate()
  return (
    <div
      role="alert"
      data-slot="playground-conflict"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-destructive-subtle px-4 py-3 text-destructive-subtle-foreground shadow-[inset_0_0_0_1px_var(--destructive-subtle-border)]",
        className
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-2 text-[13.5px] leading-5">
        <WarningCircleIcon aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-semibold">{t("playground.conflict.title")}</span> {t("playground.conflict.description")}
        </span>
      </span>
      <span className="flex items-center gap-2">
        {onKeepMine ? (
          <Button variant="ghost" onClick={onKeepMine}>
            {t("playground.conflict.keep")}
          </Button>
        ) : null}
        <Button variant="primary" onClick={onReload}>
          <ArrowClockwiseIcon aria-hidden />
          {t("playground.conflict.reload")}
        </Button>
      </span>
    </div>
  )
}
