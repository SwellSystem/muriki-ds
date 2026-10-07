"use client"

/**
 * Muriki ExerciseWorkspace — a tela de exercício do Code (design/muriki-code/telas.py,
 * tela_exercicio, e primeira=True para o primeiro exercício).
 *
 * Só apresentação: nada chama API nem roda código. As peças se montam como no desenho:
 *
 *   <ExerciseWorkspace header={<ExerciseHeader …/>} side={<ExerciseStatement …/>}
 *     foot={<><ExerciseExplanation …/><ExerciseHints …/></>}
 *     editor={<ExerciseEditor sidebar={<><ExerciseFileTree …/><ExerciseTests …/></>}>{editor}</ExerciseEditor>} />
 *
 * No desktop (lg), a lateral é uma coluna de 372px (420px a partir do 2xl) com cartões recolhíveis,
 * como Código e Testes no rail: o enunciado aberto ocupa o que sobra e só o corpo dele rola, com o
 * cartão parado; a explicação e as dicas vêm embaixo, no tamanho delas. Recolhido, o enunciado vira
 * só o título e os outros sobem. A alça entre a coluna e o editor muda a largura (arrastar ou setas,
 * de 320 a 560px; dois cliques voltam ao padrão), e `sideWidth` deixa o app lembrar por pessoa.
 *
 * O Peer mora numa aba do cartão do enunciado (ExerciseStatement `peer`, com <PeerHistory
 * variant="tab" />), e não embaixo dele: o histórico crescia e espremia o enunciado. A aba Peer
 * acende um ponto quando chega fala nova com ela fechada.
 *
 * O enunciado (ExerciseStatement) começa pelo objetivo numa frase (`objective`, que fica à vista com
 * o cartão recolhido), e no cabeçalho traz a lição, o guia de sintaxe e "Ler em tela cheia", que abre
 * o mesmo texto no painel lateral do guia de sintaxe, pela esquerda, na medida de leitura.
 * O editor ocupa o resto, na altura que o app der à tela (a moldura estica). Abaixo de lg, tudo
 * empilha: cabeçalho, painel (na altura do conteúdo, sem rolar por dentro), editor, e dentro do
 * editor a árvore e os testes sobem para cima do código.
 *
 * O guia do primeiro exercício (`guide`) cobre a tela com o véu e sobe, um de cada vez, o editor
 * (passo 1), os testes (2) e a explicação (3), cada um com o anel e o balão ao lado.
 *
 * Expandir: o botão na barra do editor recolhe a coluna da esquerda e o editor fica com a largura
 * toda (só no desktop). A tela sempre abre como hoje; `expanded` controla, se o app quiser lembrar.
 *
 * Console: com `output`, o ExerciseEditor mostra embaixo do código o que ele imprimiu ao rodar os
 * testes, agrupado por teste, e o teste que falhou nos Testes aponta para as linhas dele.
 */
import * as React from "react"
import { createPortal } from "react-dom"
import {
  ArrowsOutSimpleIcon,
  BookOpenIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleIcon,
  FileIcon,
  InfoIcon,
  LaptopIcon,
  LightbulbIcon,
  LockIcon,
  PaperPlaneTiltIcon,
  PlayIcon,
  SidebarSimpleIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react"

import { BackLink } from "@/components/ui/back-link"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// ── Guia do primeiro exercício ──────────────────────────────────────────

export interface ExerciseGuide {
  /** 1, 2 ou 3 mostra aquele passo; 0 (ou fora disso) esconde o guia. */
  step: number
  onStepChange: (step: number) => void
  /** Pular e Esc. */
  onSkip: () => void
  /** "Começar", no último passo. */
  onFinish: () => void
}

const GuiaContexto = React.createContext<ExerciseGuide | null>(null)

const PASSOS = 3

// O balão mora num portal no body, com a posição tirada da área do passo: dentro dela, a lateral
// do editor tem overflow e cortava o balão (e dava rolagem horizontal à página). No passo 1 ele
// fica dentro do editor, no alto; nos outros, ao lado da área, ou embaixo quando não cabe.
const LARGURA_DO_BALAO = 320
const MARGEM = 16

type Lugar = "dentro" | "lado"

function posicionar(area: DOMRect, lugar: Lugar, altura: number) {
  const largura = Math.min(LARGURA_DO_BALAO, window.innerWidth - 2 * MARGEM)
  const esquerda = (left: number) => Math.max(MARGEM, Math.min(left, window.innerWidth - largura - MARGEM))
  // sempre inteiro na tela: sobe o que passar da borda de baixo
  const alto = (top: number) => Math.max(MARGEM, Math.min(top, window.innerHeight - altura - MARGEM))
  if (lugar === "dentro") return { top: alto(area.top + 96), left: esquerda(area.left + 56) }
  if (area.right + 14 + largura <= window.innerWidth - MARGEM) return { top: alto(area.top), left: area.right + 14 }
  // sem lado: embaixo da área, ou em cima dela quando embaixo não cabe
  const embaixo = area.bottom + 12
  const top = embaixo + altura <= window.innerHeight - MARGEM ? embaixo : area.top - 12 - altura
  return { top: alto(top), left: esquerda(area.left) }
}

/**
 * O que a área do passo `n` precisa: subir acima do véu com o anel, e o balão ao lado dela. A área
 * chega por callback ref num estado (e não num useRef lido no render, que o react-hooks/refs barra).
 */
function usePassoDoGuia<T extends HTMLElement>(n: 1 | 2 | 3, anel: "inset" | "fora" = "inset", lugar: Lugar = "lado") {
  const guia = React.useContext(GuiaContexto)
  const ativo = guia?.step === n
  const [area, setArea] = React.useState<T | null>(null)
  return {
    ancorar: setArea,
    classe: ativo
      ? cn(
          "relative z-[41]",
          anel === "inset" ? "shadow-[inset_0_0_0_2px_var(--primary)]" : "ring-2 ring-primary"
        )
      : undefined,
    balao: ativo && guia && area ? <BalaoDoGuia n={n} guia={guia} area={area} lugar={lugar} /> : null,
  }
}

function BalaoDoGuia({
  n,
  guia,
  area,
  lugar,
}: {
  n: 1 | 2 | 3
  guia: ExerciseGuide
  area: HTMLElement
  lugar: Lugar
}) {
  const t = useTranslate()
  const ultimo = n === PASSOS
  const principal = React.useRef<HTMLButtonElement>(null)
  const balao = React.useRef<HTMLDivElement>(null)
  const id = React.useId()
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null)

  // a área rola com a página e muda com a janela: a posição segue
  React.useEffect(() => {
    const el = area
    const medir = () => setPos(posicionar(el.getBoundingClientRect(), lugar, balao.current?.offsetHeight ?? 200))
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    window.addEventListener("resize", medir)
    window.addEventListener("scroll", medir, true)
    return () => {
      observador.disconnect()
      window.removeEventListener("resize", medir)
      window.removeEventListener("scroll", medir, true)
    }
  }, [area, lugar, n])

  // cada passo novo leva a área para a tela e o foco ao botão que segue
  React.useEffect(() => {
    area.scrollIntoView({ block: "nearest" })
    principal.current?.focus({ preventScroll: true })
  }, [area, n])

  if (typeof document === "undefined") return null
  return createPortal(
    <div
      ref={balao}
      role="dialog"
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}
      className="fixed z-[42] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl bg-card px-[18px] pt-[18px] pb-3.5 text-left whitespace-normal shadow-[0_0_0_1px_var(--input),var(--float)]"
    >
      <span className="font-mono text-[11px] tracking-[0.08em] text-primary">
        {t("exercise_workspace.guide.step", { n, total: PASSOS })}
      </span>
      <span id={`${id}-t`} className="text-[15px] leading-[21px] font-semibold text-foreground-strong">
        {t(`exercise_workspace.guide.s${n}_title`)}
      </span>
      <p id={`${id}-d`} className="m-0 text-[13.5px] leading-5 text-foreground">
        {t(`exercise_workspace.guide.s${n}_text`)}
      </p>
      <div className="flex items-center gap-2 pt-1.5">
        {ultimo ? null : (
          <Button variant="ghost" onClick={guia.onSkip}>
            {t("exercise_workspace.guide.skip")}
          </Button>
        )}
        <Button
          ref={principal}
          variant="solid"
          className="ml-auto"
          onClick={ultimo ? guia.onFinish : () => guia.onStepChange(n + 1)}
        >
          {ultimo ? t("exercise_workspace.guide.finish") : t("exercise_workspace.guide.next")}
        </Button>
      </div>
    </div>,
    document.body
  )
}

// ── Moldura ─────────────────────────────────────────────────────────────

// o editor lê daqui se a coluna da esquerda está recolhida, e o botão de expandir a recolhe
const ExpandirContexto = React.createContext<{ expandido: boolean; mudar: (v: boolean) => void } | null>(null)

export interface ExerciseWorkspaceProps {
  header: React.ReactNode
  /** O que ocupa o painel da esquerda e rola por dentro: o enunciado. */
  side: React.ReactNode
  /** O que fica fixo embaixo do painel: a explicação e as dicas. */
  foot?: React.ReactNode
  editor: React.ReactNode
  /** O guia do primeiro exercício. Sem isto, nada de véu. */
  guide?: ExerciseGuide
  /**
   * A coluna da esquerda recolhida e o editor na largura toda (só no desktop). Controlado, se o app
   * quiser lembrar por pessoa; sem isto, a tela abre como sempre e o botão do editor alterna.
   */
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /**
   * A largura da coluna da esquerda, em px (só no desktop). Sem isto, 372px, ou 420px a partir do 2xl.
   * A pessoa muda pela alça, entre 320 e 560.
   */
  sideWidth?: number
  defaultSideWidth?: number
  /** Ao soltar a alça e a cada seta; `undefined` quando os dois cliques voltam ao padrão. */
  onSideWidthChange?: (width: number | undefined) => void
  className?: string
}

const LARGURA_MIN = 320
const LARGURA_MAX = 560
const PASSO_DA_SETA = 16

function limitar(largura: number) {
  return Math.round(Math.min(LARGURA_MAX, Math.max(LARGURA_MIN, largura)))
}

export function ExerciseWorkspace({
  header,
  side,
  foot,
  editor,
  guide,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  sideWidth,
  defaultSideWidth,
  onSideWidthChange,
  className,
}: ExerciseWorkspaceProps) {
  const t = useTranslate()
  const ativo = !!guide && guide.step >= 1 && guide.step <= PASSOS
  const [expandido, mudarExpandido] = useAberta(expanded, defaultExpanded, onExpandedChange)
  // a largura: a do app, a escolhida aqui, ou nenhuma (o padrão do css, que muda no 2xl). Durante o
  // arrasto vale a do arrasto, e o app só fica sabendo ao soltar.
  const [larguraSolta, setLarguraSolta] = React.useState(defaultSideWidth)
  const [arrasto, setArrasto] = React.useState<number | null>(null)
  const largura = arrasto ?? sideWidth ?? larguraSolta
  const coluna = React.useRef<HTMLDivElement>(null)
  const inicio = React.useRef<{ x: number; largura: number } | null>(null)
  const fixar = (v: number | undefined) => {
    if (sideWidth === undefined) setLarguraSolta(v)
    onSideWidthChange?.(v)
  }
  const atual = () => largura ?? coluna.current?.offsetWidth ?? 372
  // o guia aponta para a explicação no passo 3: com ele na tela, a coluna não some
  const recolhida = expandido && !ativo
  React.useEffect(() => {
    if (!ativo || !guide) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") guide.onSkip()
    }
    window.addEventListener("keydown", aoTeclar)
    return () => window.removeEventListener("keydown", aoTeclar)
  }, [ativo, guide])
  return (
    <GuiaContexto.Provider value={ativo ? guide! : null}>
      <ExpandirContexto.Provider value={{ expandido: recolhida, mudar: mudarExpandido }}>
      <div
        data-slot="exercise-workspace"
        className={cn("flex min-w-0 flex-col gap-[18px] lg:h-full lg:min-h-0", className)}
      >
        {header}
        <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-0">
          {/* Só o corpo do enunciado rola, dentro do cartão dele: os cartões ficam parados.
              Recolhida, a coluna desliza: a largura e a margem vão a zero e o conteúdo some aos poucos;
              por dentro ele fica na largura de sempre, para não refluir no caminho. `invisible` (só no
              desktop, onde ela recolhe) tira o que sumiu do Tab e do leitor no fim da transição. Com
              reduzir movimento, só troca. */}
          {/* A largura mora em --side-w; o vão de 16px até o editor é a alça. Arrastando, sem transição. */}
          <div
            data-slot="exercise-side"
            data-state={recolhida ? "collapsed" : "open"}
            data-resizing={arrasto !== null || undefined}
            style={largura !== undefined ? ({ "--side-w": `${largura}px` } as React.CSSProperties) : undefined}
            className={cn(
              "relative flex min-w-0 flex-col lg:min-h-0 lg:shrink-0 lg:overflow-hidden lg:[--side-w:372px] 2xl:[--side-w:420px]",
              "lg:transition-[width,padding,opacity,visibility] lg:duration-300 lg:ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:motion-reduce:transition-none lg:data-resizing:transition-none",
              recolhida ? "lg:invisible lg:w-0 lg:pr-0 lg:opacity-0" : "lg:w-[calc(var(--side-w)+1rem)] lg:pr-4 lg:opacity-100"
            )}
          >
            <div ref={coluna} className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:w-(--side-w) lg:flex-1">
              {side}
              {foot}
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label={t("exercise_workspace.resize")}
              aria-valuemin={LARGURA_MIN}
              aria-valuemax={LARGURA_MAX}
              aria-valuenow={largura}
              data-resizing={arrasto !== null || undefined}
              tabIndex={0}
              onPointerDown={(e) => {
                if (e.button !== 0) return
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                inicio.current = { x: e.clientX, largura: atual() }
                setArrasto(inicio.current.largura)
              }}
              onPointerMove={(e) => {
                if (inicio.current) setArrasto(limitar(inicio.current.largura + e.clientX - inicio.current.x))
              }}
              onPointerUp={() => {
                if (!inicio.current) return
                inicio.current = null
                if (arrasto !== null) fixar(arrasto)
                setArrasto(null)
              }}
              onPointerCancel={() => {
                inicio.current = null
                setArrasto(null)
              }}
              onDoubleClick={() => fixar(undefined)}
              onKeyDown={(e) => {
                const nova =
                  e.key === "ArrowLeft" ? atual() - PASSO_DA_SETA
                  : e.key === "ArrowRight" ? atual() + PASSO_DA_SETA
                  : e.key === "Home" ? LARGURA_MIN
                  : e.key === "End" ? LARGURA_MAX
                  : null
                if (nova === null) return
                e.preventDefault()
                fixar(limitar(nova))
              }}
              className="group absolute inset-y-0 right-0 w-4 cursor-col-resize touch-none outline-none max-lg:hidden"
            >
              <span
                aria-hidden
                className="absolute inset-y-3 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-colors group-hover:bg-input group-focus-visible:bg-primary group-data-resizing:bg-primary"
              />
              {arrasto !== null ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md bg-foreground-strong px-1.5 py-[3px] font-mono text-[11px] whitespace-nowrap text-background tabular-nums"
                >
                  {arrasto}px
                </span>
              ) : null}
            </div>
          </div>
          {editor}
        </div>
        {/* o véu cobre a tela; só a área do passo atual sobe acima dele */}
        {ativo ? <div aria-hidden className="fixed inset-0 z-40 bg-scrim" /> : null}
      </div>
      </ExpandirContexto.Provider>
    </GuiaContexto.Provider>
  )
}

// ── Cabeçalho ───────────────────────────────────────────────────────────

// ── O estado do rascunho ────────────────────────────────────────────────

export type ExerciseSaveState = "saving" | "saved" | "error"

export interface ExerciseSaveStatusProps {
  state: ExerciseSaveState
  savedAt?: Date | string | number
  locale?: string
  className?: string
}

/**
 * O estado do rascunho, no cabeçalho, ao lado das ações. Um estado, não um relógio: "Salvando…" em
 * cinza enquanto a pessoa digita; "Salvo" com o check verde (só o ícone tem cor, para não brigar com
 * "Enviar solução") quando ela para, e a hora fixa ("salvo às 21:42") só ao passar ou focar nele;
 * "Não salvo" no tom de aviso, com a dica, quando o rascunho local falhou. O check entra de leve
 * (muriki-saved-in, no css do item); com prefers-reduced-motion, só aparece.
 */
export function ExerciseSaveStatus({ state, savedAt, locale = "pt-BR", className }: ExerciseSaveStatusProps) {
  const t = useTranslate()
  if (state === "saving")
    return (
      <span role="status" data-slot="exercise-save-status" data-state={state} className={cn("text-xs text-muted-foreground", className)}>
        {t("exercise_workspace.save.saving")}
      </span>
    )
  if (state === "error")
    return (
      <span role="status" data-slot="exercise-save-status" data-state={state} className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
        <WarningCircleIcon aria-hidden weight="fill" className="size-3.5 shrink-0 text-warning" />
        <span className="font-medium text-foreground-strong">{t("exercise_workspace.save.error")}</span>
        <span className="text-muted-foreground max-sm:hidden">{t("exercise_workspace.save.error_hint")}</span>
      </span>
    )
  const hora =
    savedAt !== undefined
      ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(savedAt))
      : null
  const salvo = (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <CheckCircleIcon key={String(savedAt)} aria-hidden weight="fill" className="muriki-saved-in size-3.5 shrink-0 text-success" />
      {t("exercise_workspace.save.saved")}
    </span>
  )
  if (!hora)
    return (
      <span role="status" data-slot="exercise-save-status" data-state={state} className={className}>
        {salvo}
      </span>
    )
  return (
    <span role="status" data-slot="exercise-save-status" data-state={state} className={cn("inline-flex", className)}>
      <Tooltip>
        <TooltipTrigger
          render={<span tabIndex={0} />}
          aria-label={t("exercise_workspace.save.saved_at", { time: hora })}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          {salvo}
        </TooltipTrigger>
        <TooltipContent>{t("exercise_workspace.save.saved_at", { time: hora })}</TooltipContent>
      </Tooltip>
    </span>
  )
}

export interface ExerciseCrumb {
  label: string
  /** O link do roteador, ex.: <Link to="/exercises" />. Ganha de `href`. */
  render?: React.ReactElement
  href?: string
}

export interface ExerciseHeaderProps {
  /** Exercícios › skill › slug. O último é a página atual; o penúltimo vira o "voltar". */
  breadcrumb: ExerciseCrumb[]
  title: React.ReactNode
  /** Os chips: competências, nível e estado (Badge). */
  chips?: React.ReactNode
  /** O rascunho: "saving" (Salvando…), "saved" (o check e "Salvo") ou "error" (Não salvo). Sem isto, nada, como antes da primeira edição. */
  saveState?: ExerciseSaveState
  /** Quando salvou. Aparece fixo só ao passar ou focar no "Salvo": "salvo às 21:42". */
  savedAt?: Date | string | number
  /** O locale do app (i18n.language), para a hora. */
  locale?: string
  /** @deprecated Texto pronto, ex.: "salvo há 5 s". Use `saveState` e `savedAt`. */
  savedLabel?: React.ReactNode
  /** Ao lado do "salvo há": o <PeerStatus />. */
  peerStatus?: React.ReactNode
  onContinueInIde?: () => void
  /** Desativa "Continuar na IDE" com o selo "em breve". */
  continueInIdeSoon?: boolean
  onSubmit?: () => void
  submitSoon?: boolean
  submitting?: boolean
  className?: string
}

function destino(crumb: ExerciseCrumb) {
  return crumb.render ?? (crumb.href ? <a href={crumb.href} /> : undefined)
}

export function ExerciseHeader({
  breadcrumb,
  title,
  chips,
  saveState,
  savedAt,
  locale,
  savedLabel,
  peerStatus,
  onContinueInIde,
  continueInIdeSoon,
  onSubmit,
  submitSoon,
  submitting,
  className,
}: ExerciseHeaderProps) {
  const t = useTranslate()
  const pai = breadcrumb.length >= 2 ? breadcrumb[breadcrumb.length - 2] : undefined
  return (
    <header
      data-slot="exercise-header"
      className={cn("flex flex-col gap-4 md:flex-row md:items-end md:gap-6", className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* dois níveis: só o voltar; três ou mais, o voltar sobe um e a trilha fica ao lado */}
        {pai ? (
          <div className="flex min-w-0 items-center gap-3.5">
            <BackLink render={destino(pai)}>{pai.label}</BackLink>
            {breadcrumb.length >= 3 ? (
              <>
                <span aria-hidden className="h-3.5 w-px shrink-0 bg-input max-sm:hidden" />
                <Breadcrumb className="min-w-0 max-sm:hidden">
                  <BreadcrumbList>
                    {breadcrumb.map((crumb, i) => {
                      const ultimo = i === breadcrumb.length - 1
                      return (
                        <React.Fragment key={`${i}:${crumb.label}`}>
                          <BreadcrumbItem>
                            {ultimo ? (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink render={destino(crumb)}>{crumb.label}</BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {ultimo ? null : <BreadcrumbSeparator />}
                        </React.Fragment>
                      )
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            ) : null}
          </div>
        ) : null}
        <h1 className="m-0 text-2xl leading-8 font-semibold tracking-[-0.01em] text-foreground-strong md:text-[28px] md:leading-[34px]">
          {title}
        </h1>
        {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {peerStatus ? <span className="mr-2.5 flex">{peerStatus}</span> : null}
        {saveState ? (
          <ExerciseSaveStatus state={saveState} savedAt={savedAt} locale={locale} className="mr-1.5" />
        ) : savedLabel ? (
          <span className="mr-1.5 text-xs text-muted-foreground">{savedLabel}</span>
        ) : null}
        <Button variant="ghost" size="lg" onClick={onContinueInIde} disabled={continueInIdeSoon}>
          <LaptopIcon aria-hidden />
          {t("exercise_workspace.continue_in_ide")}
          {continueInIdeSoon ? <EmBreve /> : null}
        </Button>
        <Button variant="solid" size="lg" onClick={onSubmit} disabled={submitSoon} loading={submitting}>
          <PaperPlaneTiltIcon aria-hidden />
          {t("exercise_workspace.submit")}
          {submitSoon ? <EmBreve /> : null}
        </Button>
      </div>
    </header>
  )
}

function EmBreve() {
  const t = useTranslate()
  return (
    <span className="font-mono text-[9.5px] tracking-[0.08em] uppercase opacity-80">
      <span className="sr-only">, </span>
      {t("exercise_workspace.soon")}
    </span>
  )
}

// ── Painel da esquerda ──────────────────────────────────────────────────

/** Cada seção da coluna é um cartão. A pele é a do editor ao lado. */
export const CARTAO = "shrink-0 overflow-hidden rounded-xl bg-card shadow-xs"

/** O título da seção na coluna fala mais alto que no rail: ao lado de texto corrido de 14px, o
 *  rótulo cinza de 9,5px some, e o negrito do próprio enunciado passava a parecer o título. */
export const TITULO_DO_CARTAO = "text-[10.5px] font-semibold tracking-[0.16em] text-foreground-strong"

/** Aberta ou recolhida (ou a aba): controlada por `open`, ou solta a partir de `defaultOpen`. */
function useAberta<T = boolean>(open: T | undefined, defaultOpen: T, onOpenChange?: (open: T) => void) {
  const [solta, setSolta] = React.useState(defaultOpen)
  const aberta = open ?? solta
  const mudar = (v: T) => {
    if (open === undefined) setSolta(v)
    onOpenChange?.(v)
  }
  return [aberta, mudar] as const
}

/** O que toda seção do painel aceita para recolher. O app lembra o estado por pessoa, se quiser. */
export interface ExerciseCollapsibleProps {
  open?: boolean
  /** Sem isto, aberta. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ExerciseSideTab = "statement" | "peer"

/** Uma regra do enunciado, como a API manda em `rules`. */
export interface ExerciseRule {
  id: string
  text: React.ReactNode
  /** Os nomes dos testes visíveis que cobrem a regra (os do TestReport). */
  tests: string[]
  /** Quantos testes ocultos cobrem a regra: rodam só no envio. */
  hiddenCount: number
}

type EstadoDaRegra = "pass" | "fail" | "pending" | "hidden"

/** O estado da regra pelos testes visíveis: um que falhou basta; sem visíveis, ela espera o envio. */
function estadoDaRegra(regra: ExerciseRule, resultados?: Record<string, "pass" | "fail">): EstadoDaRegra {
  if (regra.tests.length === 0) return "hidden"
  const rodados = regra.tests.map((nome) => resultados?.[nome])
  if (rodados.includes("fail")) return "fail"
  return rodados.every((r) => r === "pass") ? "pass" : "pending"
}

export interface ExerciseStatementProps extends ExerciseCollapsibleProps {
  /** O enunciado já renderizado (o app transforma o Markdown). */
  children: React.ReactNode
  /** O rótulo mono. Sem isto, "Enunciado". */
  label?: string
  /**
   * O que a pessoa tem que entregar, numa frase: vem em cima, em destaque, e fica à vista com o
   * cartão recolhido. Sem isto, o enunciado começa direto nos filhos.
   */
  objective?: React.ReactNode
  /**
   * As regras ("O que precisa acontecer"), logo depois do objetivo, cada uma com o estado dos testes
   * que a cobrem: passou, falhou, ainda não rodou ou oculto (só no envio). Vazio ou sem isto, nada.
   */
  rules?: ExerciseRule[]
  /** O que a última rodada deu, por nome de teste ({ [name]: "pass" | "fail" }). Sem isto, nada rodou. */
  testResults?: Record<string, "pass" | "fail">
  /** A regra que o Peer apontou: acende e vem para a vista. */
  highlightRule?: string
  /** O ícone "Abrir a lição" no cabeçalho do cartão. Sem isto, não aparece. */
  onOpenLesson?: () => void
  /** O ícone "Guia de sintaxe" no cabeçalho do cartão. Sem isto, não aparece. */
  onOpenSyntaxGuide?: () => void
  /** O ícone "Ler em tela cheia": o mesmo enunciado num painel lateral pela esquerda, na medida de leitura. Sem isto, aparece. */
  fullScreen?: boolean
  /**
   * O Peer como segunda aba do cartão: <PeerHistory variant="tab" />. Com isto, o título vira as abas
   * Enunciado | Peer, e o enunciado não divide a altura com o histórico.
   */
  peer?: React.ReactNode
  /** Quantas falas o Peer teve neste exercício. As que chegam com a aba fechada acendem o ponto nela. */
  peerCount?: number
  tab?: ExerciseSideTab
  /** Sem isto, o enunciado. */
  defaultTab?: ExerciseSideTab
  onTabChange?: (tab: ExerciseSideTab) => void
  className?: string
}

const CORPO_QUE_ROLA = "muriki-scroll lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
// os filhos não encolhem: um <pre> com overflow ficaria esmagado em 20px
const CORPO_DO_ENUNCIADO = cn(CORPO_QUE_ROLA, "flex flex-col gap-3 px-5 pt-1 pb-4 [&>*]:shrink-0 text-sm leading-[22px] text-foreground")
const ABA = "flex h-[26px] items-center gap-1.5 rounded-md px-1.5 font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"

/**
 * O cartão do enunciado: o objetivo em cima, o texto, e no cabeçalho a lição, o guia de sintaxe e a
 * tela cheia. Com `peer`, o título vira as abas Enunciado | Peer. Aberto, ocupa o que sobra da
 * coluna (encolhe até umas cinco linhas) e só o corpo rola; recolhido, guarda a frase do objetivo.
 */
export function ExerciseStatement({
  children,
  label,
  objective,
  onOpenLesson,
  onOpenSyntaxGuide,
  fullScreen = true,
  rules,
  testResults,
  highlightRule,
  peer,
  peerCount = 0,
  tab,
  defaultTab = "statement",
  onTabChange,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseStatementProps) {
  const t = useTranslate()
  const id = React.useId()
  const titulo = label ?? t("exercise_workspace.statement")
  const comPeer = peer !== undefined
  const [aberta, mudarAberta] = useAberta(open, defaultOpen, onOpenChange)
  const [aba, mudarAba] = useAberta<ExerciseSideTab>(tab, defaultTab, onTabChange)
  const [telaCheia, setTelaCheia] = React.useState(false)
  // as falas que já estavam ao abrir a tela contam como vistas; as que chegam depois, com a aba
  // fechada, acendem o ponto até a pessoa passar por ela
  const [vistas, setVistas] = React.useState(peerCount)
  const naAba = comPeer ? aba : "statement"
  const novas = naAba === "peer" && aberta ? 0 : Math.max(0, peerCount - vistas)
  const lista = React.useRef<HTMLDivElement>(null)
  const Seta = aberta ? CaretDownIcon : CaretRightIcon
  const abas: Array<{ valor: ExerciseSideTab; rotulo: string }> = [
    { valor: "statement", rotulo: titulo },
    { valor: "peer", rotulo: t("exercise_workspace.peer.name") },
  ]

  const ir = (nova: ExerciseSideTab) => {
    setVistas(peerCount)
    if (nova !== aba) mudarAba(nova)
    if (!aberta) mudarAberta(true)
  }
  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    const j = (abas.findIndex((a) => a.valor === aba) + 1) % abas.length
    ir(abas[j].valor)
    lista.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[j]?.focus()
  }
  const recolher = () => {
    if (aberta && naAba === "peer") setVistas(peerCount)
    mudarAberta(!aberta)
  }

  const objetivo = objective ? (
    <p className="m-0 text-[15.5px] leading-6 font-medium text-pretty text-foreground-strong">{objective}</p>
  ) : null
  const acoes = (
    <>
      {onOpenLesson ? <IconeDoCartao rotulo={t("exercise_workspace.statement_lesson")} onClick={onOpenLesson} icone={BookOpenIcon} /> : null}
      {onOpenSyntaxGuide ? <IconeDoCartao rotulo={t("exercise_workspace.statement_syntax")} onClick={onOpenSyntaxGuide} icone={InfoIcon} /> : null}
      {fullScreen ? <IconeDoCartao rotulo={t("exercise_workspace.statement_full_screen")} onClick={() => setTelaCheia(true)} icone={ArrowsOutSimpleIcon} /> : null}
    </>
  )

  return (
    <section
      data-slot="exercise-statement"
      data-state={aberta ? "open" : "closed"}
      data-tab={naAba}
      className={cn(
        "relative flex flex-col",
        CARTAO,
        "lg:data-[state=open]:min-h-[160px] lg:data-[state=open]:flex-1 lg:data-[state=open]:shrink",
        className
      )}
    >
      <div className="flex h-[38px] shrink-0 items-center gap-1 pr-1.5 pl-2.5">
        {comPeer ? (
          <>
            <button
              type="button"
              aria-expanded={aberta}
              aria-controls={`${id}-${naAba}`}
              aria-label={titulo}
              onClick={recolher}
              className="flex size-[26px] items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              <Seta aria-hidden className="size-3" />
            </button>
            <div ref={lista} role="tablist" onKeyDown={aoTeclar} className="flex items-center gap-0.5">
              {abas.map((a) => {
                const ativa = a.valor === aba
                return (
                  <button
                    key={a.valor}
                    id={`${id}-${a.valor}-tab`}
                    type="button"
                    role="tab"
                    aria-selected={ativa}
                    aria-controls={`${id}-${a.valor}`}
                    tabIndex={ativa ? 0 : -1}
                    onClick={() => ir(a.valor)}
                    className={cn(
                      ABA,
                      TITULO_DO_CARTAO,
                      ativa ? "underline decoration-primary decoration-2 underline-offset-[7px]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {a.rotulo}
                    {a.valor === "peer" && peerCount > 0 ? (
                      <span className="font-normal tracking-normal text-muted-foreground tabular-nums">{peerCount}</span>
                    ) : null}
                    {a.valor === "peer" && novas > 0 ? (
                      <>
                        <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                        <span className="sr-only">, {t("exercise_workspace.peer.new", { count: novas })}</span>
                      </>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <button
            type="button"
            aria-expanded={aberta}
            aria-controls={`${id}-statement`}
            onClick={recolher}
            className="flex h-[26px] items-center gap-1.5 rounded-md px-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <Seta aria-hidden className="size-3" />
            <span className={cn("font-mono text-[9.5px] font-medium tracking-[0.2em] uppercase", TITULO_DO_CARTAO)}>{titulo}</span>
          </button>
        )}
        <span className="ml-auto flex items-center gap-0.5">{acoes}</span>
      </div>
      {/* recolhido, o cartão não vira só o título: a frase do objetivo fica */}
      {!aberta && objective ? (
        // o respiro fica fora do <p>: com padding nele, a linha cortada vazava no espaço de baixo
        <div className="pr-4 pb-3 pl-[42px]">
          <p className="m-0 line-clamp-2 text-[13px] leading-[19px] text-foreground">{objective}</p>
        </div>
      ) : null}
      <div
        id={`${id}-statement`}
        role={comPeer ? "tabpanel" : undefined}
        aria-labelledby={comPeer ? `${id}-statement-tab` : undefined}
        hidden={!aberta || naAba !== "statement"}
        className={CORPO_DO_ENUNCIADO}
      >
        {objetivo}
        {rules && rules.length > 0 ? <RegrasDoEnunciado rules={rules} results={testResults} highlight={highlightRule} /> : null}
        {children}
      </div>
      {/* a aba fechada fica montada: cada uma volta para onde a pessoa parou de ler */}
      {comPeer ? (
        <div
          id={`${id}-peer`}
          role="tabpanel"
          aria-labelledby={`${id}-peer-tab`}
          hidden={!aberta || aba !== "peer"}
          className={cn(CORPO_QUE_ROLA, "px-5 pt-1 pb-4")}
        >
          {peer}
        </div>
      ) : null}
      {fullScreen ? (
        // o mesmo painel do guia de sintaxe e da lição (Sheet framed, max-w-xl, flutuando), mas pela
        // esquerda: sai de onde o enunciado mora e deixa o código à vista, à direita
        <Sheet open={telaCheia} onOpenChange={setTelaCheia}>
          <SheetContent side="left" anatomy="framed" closeLabel={t("exercise_workspace.statement_close")} className="max-w-xl">
            <SheetHeader>
              <SheetTitle>{titulo}</SheetTitle>
            </SheetHeader>
            <SheetBody>
              {/* a medida de leitura: umas 65 letras por linha, a letra e o respiro maiores */}
              <div className="flex flex-col gap-4 px-5 py-4 text-[15px] leading-[26px] text-foreground [&>*]:shrink-0">
                {objective ? (
                  <p className="m-0 text-[17px] leading-7 font-medium text-pretty text-foreground-strong">{objective}</p>
                ) : null}
                {rules && rules.length > 0 ? <RegrasDoEnunciado rules={rules} results={testResults} grande /> : null}
                {children}
              </div>
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}
    </section>
  )
}

const MARCA_DA_REGRA: Record<EstadoDaRegra, { icone: React.ElementType; cor: string }> = {
  pass: { icone: CheckIcon, cor: "text-success" },
  fail: { icone: XIcon, cor: "text-destructive" },
  pending: { icone: CircleIcon, cor: "text-muted-foreground" },
  hidden: { icone: LockIcon, cor: "text-muted-foreground" },
}

function RegrasDoEnunciado({
  rules,
  results,
  highlight,
  grande,
}: {
  rules: ExerciseRule[]
  results?: Record<string, "pass" | "fail">
  highlight?: string
  grande?: boolean
}) {
  const t = useTranslate()
  const [lista, setLista] = React.useState<HTMLUListElement | null>(null)
  const estados = rules.map((r) => estadoDaRegra(r, results))
  const cumpridas = estados.filter((e) => e === "pass").length
  // a regra que o Peer apontou vem para a vista dentro do corpo que rola
  React.useEffect(() => {
    if (!highlight || !lista) return
    lista.querySelector(`[data-rule="${CSS.escape(highlight)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [highlight, lista])
  return (
    <div data-slot="exercise-rules" className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h2 className={cn("m-0 font-semibold text-foreground-strong", grande ? "text-[14px] leading-5" : "text-[13px] leading-[18px]")}>
          {t("exercise_workspace.rules.title")}
        </h2>
        <span
          aria-label={t("exercise_workspace.rules.count_label", { done: cumpridas, total: rules.length })}
          className="ml-auto rounded-[5px] bg-muted px-1.5 py-px font-mono text-[11px] text-muted-foreground tabular-nums"
        >
          {t("exercise_workspace.rules.count", { done: cumpridas, total: rules.length })}
        </span>
      </div>
      <ul ref={setLista} className="m-0 flex list-none flex-col gap-0.5 p-0">
        {rules.map((regra, i) => {
          const estado = estados[i]
          const { icone: Icone, cor } = MARCA_DA_REGRA[estado]
          const falharam = regra.tests.filter((n) => results?.[n] === "fail").length
          const meta =
            estado === "hidden"
              ? t("exercise_workspace.rules.hidden", { count: regra.hiddenCount })
              : estado === "fail"
                ? t("exercise_workspace.rules.failed", { count: falharam })
                : estado === "pass"
                  ? t("exercise_workspace.rules.passed", { count: regra.tests.length })
                  : t("exercise_workspace.rules.not_run")
          const mais = estado !== "hidden" && regra.hiddenCount > 0 ? t("exercise_workspace.rules.plus_hidden", { count: regra.hiddenCount }) : null
          return (
            <li
              key={regra.id}
              data-rule={regra.id}
              data-state={estado}
              className={cn(
                "-mx-2 flex items-start gap-2.5 rounded-lg px-2 py-1.5",
                regra.id === highlight && "bg-primary-subtle shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_45%,transparent)]"
              )}
            >
              <Icone aria-hidden weight={estado === "pending" ? "regular" : "bold"} className={cn("mt-1 size-3 shrink-0", cor)} />
              <span className="flex min-w-0 flex-col gap-px">
                <span
                  className={cn(
                    grande ? "text-[14.5px] leading-6" : "text-[13px] leading-5",
                    estado === "fail" ? "text-foreground-strong" : "text-foreground"
                  )}
                >
                  <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                  {regra.text}
                </span>
                <span className={cn("text-[11.5px] leading-4", estado === "fail" ? "text-destructive" : "text-muted-foreground")}>
                  <span className="sr-only">{t(`exercise_workspace.rules.state.${estado}`)}: </span>
                  {meta}
                  {mais ? <span className="text-muted-foreground"> · {mais}</span> : null}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function IconeDoCartao({ rotulo, onClick, icone: Icone }: { rotulo: string; onClick: () => void; icone: React.ElementType }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label={rotulo} onClick={onClick} className="text-muted-foreground" />}>
        <Icone aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

export interface ExerciseExplanationProps extends ExerciseCollapsibleProps {
  /** A pergunta que a pessoa responde, ex.: "Por que o texto vazio lança erro…?" */
  question: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** A nota embaixo. Sem isto, "Entra na avaliação e no seu perfil". */
  note?: React.ReactNode
  /** O selo à direita do rótulo. Sem isto, "vai para a avaliação"; `null` tira. */
  badge?: React.ReactNode | null
  className?: string
}

export function ExerciseExplanation({
  question,
  value,
  onChange,
  placeholder,
  note,
  badge,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseExplanationProps) {
  const t = useTranslate()
  const id = React.useId()
  const { ancorar, classe: destaque, balao: balaoDoGuia } = usePassoDoGuia<HTMLElement>(3)
  const [aberta, mudar] = useAberta(open, defaultOpen, onOpenChange)
  // o passo 3 do guia aponta a explicação: recolhida, ela abre enquanto o passo durar
  const noGuia = React.useContext(GuiaContexto)?.step === 3
  const mostrar = aberta || noGuia
  // recolhida com texto, o selo vira o aviso de que há rascunho: ninguém esquece que ele vai junto
  const fim =
    !mostrar && value.trim() ? (
      <span className="flex items-center gap-1.5 pr-1 text-[11.5px] text-muted-foreground">
        <span aria-hidden className="size-1.5 rounded-full bg-success" />
        {t("exercise_workspace.explain_draft")}
      </span>
    ) : badge === null ? null : (
      (badge ?? <Badge tone="blue">{t("exercise_workspace.goes_to_review")}</Badge>)
    )
  return (
    <ExerciseSection
      ref={ancorar}
      data-slot="exercise-explanation"
      title={t("exercise_workspace.explain")}
      end={fim}
      divider={false}
      titleClassName={TITULO_DO_CARTAO}
      open={mostrar}
      onOpenChange={mudar}
      className={cn(CARTAO, destaque, className)}
      bodyClassName="flex flex-col gap-2.5 px-5 pb-4"
    >
      <label htmlFor={id} className="text-sm leading-[21px] font-medium text-foreground-strong">
        {question}
      </label>
      {/* cresce com o texto até umas sete linhas e depois rola por dentro: não esmaga o enunciado */}
      <Textarea
        id={id}
        rows={4}
        autoResize
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("exercise_workspace.explain_placeholder")}
        className="muriki-scroll max-h-40 resize-none"
        style={{ overflowY: "auto" }}
      />
      <span className="text-xs text-muted-foreground">{note ?? t("exercise_workspace.explain_note")}</span>
      {balaoDoGuia}
    </ExerciseSection>
  )
}

// ── Responda (as perguntas numéricas) ─────────────────────────────────────

/** Uma pergunta numérica de `answerSpec.numbers`, com o texto já traduzido e o que a pessoa digitou. */
export interface ExerciseAnswerNumber {
  id: string
  prompt: React.ReactNode
  /** Como está no campo; `parseAnswerNumber` converte (vírgula ou ponto). */
  value: string
}

/** "1,5", "1.5" e "-2" viram número; vazio ou outra coisa, `null`. */
export function parseAnswerNumber(value: string): number | null {
  const limpo = value.trim().replace(/\s/g, "").replace(",", ".")
  if (!/^-?\d+(\.\d+)?$/.test(limpo)) return null
  return Number(limpo)
}

export interface ExerciseAnswerNumbersProps extends ExerciseCollapsibleProps {
  questions: ExerciseAnswerNumber[]
  onChange: (id: string, value: string) => void
  /** A nota embaixo. Sem isto, "Vai junto com o envio". */
  note?: React.ReactNode
  readOnly?: boolean
  className?: string
}

/**
 * O cartão "Responda", na coluna da esquerda entre o enunciado e a explicação: cada pergunta com o
 * campo dela. Aceita vírgula ou ponto; o que não é número fica marcado, sem bloquear a digitação.
 */
export function ExerciseAnswerNumbers({
  questions,
  onChange,
  note,
  readOnly,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseAnswerNumbersProps) {
  const t = useTranslate()
  const base = React.useId()
  const [aberta, mudar] = useAberta(open, defaultOpen, onOpenChange)
  const faltam = questions.filter((q) => parseAnswerNumber(q.value) === null).length
  return (
    <ExerciseSection
      data-slot="exercise-answer-numbers"
      title={t("exercise_workspace.answer.title")}
      end={
        <span className="pr-1 font-mono text-[11px] text-muted-foreground">
          {t("exercise_workspace.answer.count", { count: questions.length - faltam, total: questions.length })}
        </span>
      }
      divider={false}
      titleClassName={TITULO_DO_CARTAO}
      open={aberta}
      onOpenChange={mudar}
      className={cn(CARTAO, className)}
      bodyClassName="flex flex-col gap-3.5 px-4 pb-4"
    >
      {questions.map((q) => {
        const id = `${base}-${q.id}`
        const invalido = q.value.trim() !== "" && parseAnswerNumber(q.value) === null
        return (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[13.5px] leading-5 font-medium text-foreground-strong">
              {q.prompt}
            </label>
            <Input
              id={id}
              inputMode="decimal"
              autoComplete="off"
              value={q.value}
              readOnly={readOnly}
              aria-invalid={invalido || undefined}
              aria-describedby={invalido ? `${id}-erro` : undefined}
              onChange={(e) => onChange(q.id, e.target.value)}
              placeholder={t("exercise_workspace.answer.placeholder")}
              className="max-w-[200px] font-mono tabular-nums"
            />
            {invalido ? (
              <span id={`${id}-erro`} className="text-xs text-destructive">
                {t("exercise_workspace.answer.invalid")}
              </span>
            ) : null}
          </div>
        )
      })}
      <span className="text-xs text-muted-foreground">{note ?? t("exercise_workspace.answer.note")}</span>
    </ExerciseSection>
  )
}

/** `open`, `defaultOpen` e `onOpenChange` ficam por compatibilidade: as dicas são uma linha só e não recolhem. */
export interface ExerciseHintsProps extends ExerciseCollapsibleProps {
  /** Quantas dicas o exercício tem. */
  total: number
  /** Quantas a pessoa já revelou. */
  used: number
  /** Pedir a primeira ou a próxima. */
  onRequest?: () => void
  /** "Ver a dica": abre o painel do app com as reveladas. */
  onView?: () => void
  loading?: boolean
  className?: string
}

export function ExerciseHints({
  total,
  used,
  onRequest,
  onView,
  loading,
  className,
}: ExerciseHintsProps) {
  const t = useTranslate()
  if (total <= 0) return null
  const acabou = used >= total
  return (
    // uma linha só, sem o título: o ícone já diz o que é, e o cabeçalho de 38px comia a coluna
    <section
      data-slot="exercise-hints"
      aria-label={t("exercise_workspace.hints.title")}
      className={cn(CARTAO, "flex items-center gap-2.5 py-2.5 pr-3 pl-4", className)}
    >
      <LightbulbIcon aria-hidden className="size-4 shrink-0 text-warning" />
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="text-[13px] text-foreground" aria-live="polite">
          {used === 0
            ? t("exercise_workspace.hints.available", { count: total })
            : t("exercise_workspace.hints.used", { used, total })}
        </span>
        {used > 0 && onView ? (
          <button
            type="button"
            onClick={onView}
            className="text-xs text-primary underline-offset-[3px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            {used === 1 ? t("exercise_workspace.hints.view_one") : t("exercise_workspace.hints.view_other")}
          </button>
        ) : null}
      </span>
      {acabou || !onRequest ? null : (
        <Button variant="outline" onClick={onRequest} loading={loading}>
          {used === 0 ? t("exercise_workspace.hints.request") : t("exercise_workspace.hints.next")}
        </Button>
      )}
    </section>
  )
}

// ── Seção recolhível (o painel da esquerda e o rail do editor) ──────────

export interface ExerciseSectionProps extends ExerciseCollapsibleProps {
  ref?: React.Ref<HTMLElement>
  title: string
  /** À direita do título: ações ou o resumo. */
  end?: React.ReactNode
  /** O fio em cima. */
  divider?: boolean
  className?: string
  /** O corpo, abaixo do título. */
  bodyClassName?: string
  /** O título; sem isto, o rótulo mono cinza do rail. */
  titleClassName?: string
  "data-slot"?: string
  children: React.ReactNode
}

/** A seção recolhível: título mono com a seta, e o que vem à direita. Serve ao rail (Código, Testes) e ao painel. */
export function ExerciseSection({
  ref,
  title,
  end,
  divider = true,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  bodyClassName,
  titleClassName,
  "data-slot": slot,
  children,
}: ExerciseSectionProps) {
  const [aberta, mudar] = useAberta(open, defaultOpen, onOpenChange)
  const id = React.useId()
  const Seta = aberta ? CaretDownIcon : CaretRightIcon
  return (
    <section
      ref={ref}
      data-slot={slot}
      data-state={aberta ? "open" : "closed"}
      className={cn("relative flex flex-col", divider && "border-t border-muted", className)}
    >
      <div className="flex h-[38px] shrink-0 items-center gap-1.5 pr-1.5 pl-2.5">
        <button
          type="button"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => mudar(!aberta)}
          className="flex h-[26px] items-center gap-1.5 rounded-md px-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <Seta aria-hidden className="size-3" />
          <span className={cn("font-mono text-[9.5px] font-medium tracking-[0.2em] uppercase", titleClassName)}>{title}</span>
        </button>
        {end ? <span className="ml-auto flex items-center gap-0.5">{end}</span> : null}
      </div>
      <div id={id} hidden={!aberta} className={bodyClassName}>
        {children}
      </div>
    </section>
  )
}

export interface ExerciseTestItem {
  /** O nome que o runner põe no TestReport: liga o teste ao Console, à fala do Peer e ao onOpenTest. */
  name: string
  /** O que a pessoa lê (o `testLabels` da API, na língua do exercício). Sem isto, o `name`. */
  label?: string
  /** Sem status, o teste ainda não rodou. */
  status?: "pass" | "fail"
  expected?: string
  received?: string
}

export interface ExerciseTestsProps {
  /** `null` = ainda não rodou. */
  summary: { passing: number; total: number } | null
  items: ExerciseTestItem[]
  /** Falha de execução: o runner não chegou ao fim (timeout, build, runtime, unavailable…). */
  error?: { kind: string; message: string } | null
  /** Texto pronto, ex.: "rodou há 40 s". */
  ranAt?: React.ReactNode
  onOpenTest?: (name: string) => void
  /** A fala do Peer depois de rodar os testes, embaixo do teste `test`: <PeerNote variant="inline" />. */
  peerNote?: { test: string; node: React.ReactNode } | null
  className?: string
}

const TIPOS_DE_ERRO = new Set(["timeout", "build", "runtime", "unavailable"])

export function ExerciseTests({ summary, items, error, ranAt, onOpenTest, peerNote, className }: ExerciseTestsProps) {
  const t = useTranslate()
  const console_ = React.useContext(ConsoleContexto)
  const { ancorar, classe: destaque, balao: balaoDoGuia } = usePassoDoGuia<HTMLElement>(2)

  let resumo: React.ReactNode
  if (error) resumo = <Badge tone="red" dot>{t("exercise_workspace.tests.error_badge")}</Badge>
  else if (!summary) resumo = <Badge tone="gray">{t("exercise_workspace.tests.not_run")}</Badge>
  else
    resumo = (
      <Badge tone={summary.passing === summary.total ? "green" : "red"} dot>
        {t("exercise_workspace.tests.passing", { passing: summary.passing, total: summary.total })}
      </Badge>
    )

  return (
    <ExerciseSection
      ref={ancorar}
      title={t("exercise_workspace.tests.title")}
      end={resumo}
      className={cn("bg-rail", destaque, className)}
    >
      {error ? (
        <div role="alert" className="mx-2 mb-1.5 flex flex-col gap-1 rounded-lg bg-destructive-subtle px-3 py-2.5 text-destructive-subtle-foreground">
          <span className="text-[12.5px] font-medium">
            {TIPOS_DE_ERRO.has(error.kind) ? t(`exercise_workspace.tests.error.${error.kind}`) : error.kind}
          </span>
          <span className="font-mono text-[11px] leading-4 break-words whitespace-pre-wrap">{error.message}</span>
        </div>
      ) : null}
      <ul aria-label={t("exercise_workspace.tests.title")} className="m-0 flex list-none flex-col gap-px px-1.5">
        {items.map((item) => (
          <li key={item.name}>
            <button
              type="button"
              onClick={() => onOpenTest?.(item.name)}
              title={t("exercise_workspace.tests.open")}
              className="flex w-full flex-col gap-[3px] rounded-md px-2 py-1.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              <span className="flex items-start gap-2">
                <MarcaDoTeste status={item.status} />
                <span
                  className={cn(
                    "text-[12.5px] leading-[17px]",
                    item.status === "fail" ? "text-foreground-strong" : "text-foreground"
                  )}
                >
                  {item.label ?? item.name}
                </span>
              </span>
              {item.status === "fail" && (item.expected !== undefined || item.received !== undefined) ? (
                <span className="flex flex-col pl-5 font-mono text-[11px] leading-4 text-muted-foreground">
                  {item.expected !== undefined ? (
                    <span>
                      {t("exercise_workspace.tests.expected")}{" "}
                      <span className="text-foreground-strong">{item.expected}</span>
                    </span>
                  ) : null}
                  {item.received !== undefined ? (
                    <span>
                      {t("exercise_workspace.tests.received")} <span className="text-destructive">{item.received}</span>
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
            {item.status === "fail" && console_ && console_.linhasDe(item.name) > 0 ? (
              // o atalho do teste que falhou para o que ele imprimiu
              <button
                type="button"
                onClick={() => console_.mostrar(item.name)}
                className="ml-5 mb-1 flex items-center gap-1 rounded-[4px] px-1 font-mono text-[11px] leading-4 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                {t("exercise_workspace.console.in_console", { count: console_.linhasDe(item.name) })}
              </button>
            ) : null}
            {peerNote && peerNote.test === item.name ? <div className="pt-0.5 pr-1 pb-1.5 pl-6">{peerNote.node}</div> : null}
          </li>
        ))}
      </ul>
      <span className="block px-4 pt-1.5 pb-2.5 text-[11.5px] text-muted-foreground">
        {summary || error ? ranAt : t("exercise_workspace.tests.run_hint")}
      </span>
      {balaoDoGuia}
    </ExerciseSection>
  )
}

function MarcaDoTeste({ status }: { status?: "pass" | "fail" }) {
  const t = useTranslate()
  const classe = "mt-0.5 size-3 shrink-0"
  if (status === "pass")
    return (
      <>
        <CheckIcon aria-hidden weight="bold" className={cn(classe, "text-success")} />
        <span className="sr-only">{t("exercise_workspace.tests.pass")}</span>
      </>
    )
  if (status === "fail")
    return (
      <>
        <XIcon aria-hidden weight="bold" className={cn(classe, "text-destructive")} />
        <span className="sr-only">{t("exercise_workspace.tests.fail")}</span>
      </>
    )
  return <CircleIcon aria-hidden className={cn(classe, "text-muted-foreground")} />
}

// ── Editor ──────────────────────────────────────────────────────────────

export interface ExerciseTab {
  path: string
  readOnly?: boolean
}

/** Uma linha do que o código imprimiu. `test` é o `name` do teste em ExerciseTests; sem ele, saiu ao carregar o arquivo. */
export interface ExerciseLog {
  test?: string
  level: "log" | "warn" | "error"
  text: string
}

/** O que o código imprimiu ao rodar os testes, na ordem em que saiu. `truncated`: o runner cortou. */
export interface ExerciseOutput {
  logs: ExerciseLog[]
  truncated?: boolean
  /** Os rótulos dos testes ({ [name]: texto }, o `testLabels` da API), para o título de cada grupo. Sem o rótulo, o nome. */
  labels?: Record<string, string>
}

// os Testes (no rail) e o Console (embaixo do código) conversam por aqui, dentro do ExerciseEditor
const ConsoleContexto = React.createContext<{ linhasDe: (test: string) => number; mostrar: (test: string) => void } | null>(null)

export interface ExerciseEditorProps {
  /** Os arquivos abertos, em ordem. */
  tabs: ExerciseTab[]
  activeTab: string
  onTabChange?: (path: string) => void
  onRun?: () => void
  running?: boolean
  /** Desativa "Rodar testes" e diz por quê ao lado, ex.: "em breve". */
  runDisabledReason?: string
  /** A lateral: <ExerciseFileTree/> e <ExerciseTests/>. */
  sidebar?: React.ReactNode
  /** O começo da barra de status, ex.: "src/solution.js · 11:18". */
  status?: React.ReactNode
  /** "⌘ ↵ roda os testes". `null` tira. */
  shortcutLabel?: React.ReactNode | null
  /** A ponta da barra: "sem autocompletar…". `null` tira. */
  statusEnd?: React.ReactNode | null
  /** A legenda do cadeado e do ponto verde, no pé da lateral. */
  legend?: boolean
  /** Acima da barra de status: a fala do Peer de uma pausa, <PeerNote variant="bar" />. */
  peerBar?: React.ReactNode
  /**
   * O que o código imprimiu ao rodar os testes. Com isto (inclusive `null`, ainda não rodou), o
   * Console aparece embaixo do código. Sem isto, nada de Console.
   */
  output?: ExerciseOutput | null
  /** O editor do app (CodeMirror, por exemplo). */
  children: React.ReactNode
  className?: string
}

function nomeDoArquivo(path: string) {
  return path.slice(path.lastIndexOf("/") + 1)
}

export function ExerciseEditor({
  tabs,
  activeTab,
  onTabChange,
  onRun,
  running,
  runDisabledReason,
  sidebar,
  status,
  shortcutLabel,
  statusEnd,
  legend = true,
  peerBar,
  output,
  children,
  className,
}: ExerciseEditorProps) {
  const t = useTranslate()
  // o Console abre sozinho quando chega saída; a escolha da pessoa vale até a próxima rodada
  const [escolha, setEscolha] = React.useState<{ para: ExerciseOutput | null | undefined; aberto: boolean } | null>(null)
  const consoleAberto = escolha && escolha.para === output ? escolha.aberto : !!output?.logs.length
  const [foco, setFoco] = React.useState<string | null>(null)
  const corpoDoConsole = React.useRef<HTMLDivElement>(null)
  const consoleCtx = output
    ? {
        linhasDe: (test: string) => output.logs.filter((l) => l.test === test).length,
        mostrar: (test: string) => {
          setEscolha({ para: output, aberto: true })
          setFoco(test)
          // depois de abrir, o grupo do teste sobe para a vista
          requestAnimationFrame(() =>
            corpoDoConsole.current
              ?.querySelector(`[data-test="${CSS.escape(test)}"]`)
              ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
          )
        },
      }
    : null
  const { ancorar, classe: destaque, balao: balaoDoGuia } = usePassoDoGuia<HTMLDivElement>(1, "inset", "dentro")
  const podeRodar = !!onRun && !runDisabledReason && !running
  const listaDeAbas = React.useRef<HTMLDivElement>(null)

  // ⌘ ↵ (Ctrl ↵) em qualquer lugar da moldura, o editor junto
  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && podeRodar) {
      e.preventDefault()
      onRun?.()
    }
  }

  // setas entre as abas, como pede o padrão de tablist
  const aoTeclarNasAbas = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    const i = tabs.findIndex((tab) => tab.path === activeTab)
    const j = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    onTabChange?.(tabs[j].path)
    listaDeAbas.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[j]?.focus()
  }

  return (
    <ConsoleContexto.Provider value={consoleCtx}>
    <section
      data-slot="exercise-editor"
      aria-label={t("exercise_workspace.editor.label")}
      onKeyDown={aoTeclar}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs lg:flex-1 lg:flex-row",
        className
      )}
    >
      {sidebar ? (
        <div className="muriki-scroll flex shrink-0 flex-col border-muted bg-rail max-lg:border-b lg:w-[248px] lg:overflow-y-auto lg:border-r">
          {sidebar}
          <div className="flex-1" />
          {legend ? (
            <div className="flex flex-col gap-1 border-t border-muted px-3.5 pt-2.5 pb-3 text-[11.5px] leading-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <LockIcon aria-hidden className="size-[11px]" />
                {t("exercise_workspace.tree.read_only")}
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="mx-[2.5px] size-1.5 rounded-full bg-success" />
                {t("exercise_workspace.tree.created_by_user")}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-0.5 border-b border-muted pr-2 pl-1">
          <div
            ref={listaDeAbas}
            role="tablist"
            aria-label={t("exercise_workspace.editor.open_files")}
            onKeyDown={aoTeclarNasAbas}
            className="flex min-w-0 overflow-x-auto"
          >
            {tabs.map((tab) => {
              const ativa = tab.path === activeTab
              return (
                <button
                  key={tab.path}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  tabIndex={ativa ? 0 : -1}
                  title={tab.path}
                  onClick={() => onTabChange?.(tab.path)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-[7px] px-[13px] font-mono text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-inset",
                    ativa
                      ? "bg-card text-foreground-strong shadow-[inset_0_-2px_0_var(--primary)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileIcon aria-hidden className="size-[13px]" />
                  {nomeDoArquivo(tab.path)}
                  {tab.readOnly ? (
                    <>
                      <LockIcon aria-hidden className="size-[11px] text-muted-foreground" />
                      <span className="sr-only">{t("exercise_workspace.tree.read_only")}</span>
                    </>
                  ) : null}
                </button>
              )
            })}
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-2 py-1.5">
            <ExerciseExpandButton />
            {runDisabledReason ? (
              <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
                {runDisabledReason}
              </span>
            ) : null}
            <Button
              variant="primary"
              onClick={onRun}
              disabled={!onRun || !!runDisabledReason}
              loading={running}
            >
              <PlayIcon aria-hidden weight="fill" />
              {t("exercise_workspace.editor.run")}
            </Button>
          </span>
        </div>
        <div
          ref={ancorar}
          role="tabpanel"
          aria-label={activeTab}
          className={cn("relative flex min-h-0 flex-1 flex-col bg-card", destaque)}
        >
          {children}
          {balaoDoGuia}
        </div>
        {output !== undefined ? (
          <ExerciseConsole
            output={output}
            open={consoleAberto}
            onOpenChange={(aberto) => setEscolha({ para: output, aberto })}
            focus={foco}
            bodyRef={corpoDoConsole}
          />
        ) : null}
        {peerBar}
        <div className="flex h-[30px] shrink-0 items-center gap-3.5 overflow-hidden border-t border-muted px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
          {status ? <span className="truncate">{status}</span> : null}
          {shortcutLabel === null ? null : (
            <span className="max-sm:hidden">{shortcutLabel ?? t("exercise_workspace.editor.shortcut")}</span>
          )}
          {statusEnd === null ? null : (
            <span className="ml-auto truncate max-md:hidden">{statusEnd ?? t("exercise_workspace.editor.no_autocomplete")}</span>
          )}
        </div>
      </div>
    </section>
    </ConsoleContexto.Provider>
  )
}

// ── Expandir ────────────────────────────────────────────────────────────

/**
 * O botão que recolhe a coluna da esquerda do ExerciseWorkspace e devolve: o ExerciseEditor já traz,
 * e qualquer outro editor no slot `editor` (o ArchitectureBoard) põe na barra dele. Fora de um
 * ExerciseWorkspace, e abaixo de lg, não aparece.
 */
export function ExerciseExpandButton({ className }: { className?: string }) {
  const t = useTranslate()
  const expandir = React.useContext(ExpandirContexto)
  if (!expandir) return null
  const rotulo = t(expandir.expandido ? "exercise_workspace.editor.collapse" : "exercise_workspace.editor.expand")
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={expandir.expandido}
            aria-label={rotulo}
            onClick={() => expandir.mudar(!expandir.expandido)}
            className={cn("max-lg:hidden", className)}
          />
        }
      >
        <SidebarSimpleIcon aria-hidden weight={expandir.expandido ? "fill" : "regular"} />
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

// ── Console ─────────────────────────────────────────────────────────────

const COR_DO_NIVEL: Record<ExerciseLog["level"], string> = {
  log: "text-foreground",
  warn: "bg-tone-yellow/60 text-tone-yellow-foreground",
  error: "bg-destructive-subtle text-destructive-subtle-foreground",
}

/**
 * A faixa embaixo do código, como o terminal de uma IDE: o que saiu ao carregar o arquivo e depois o
 * que cada teste imprimiu, na ordem. Recolhe pelo título; a altura é limitada e o corpo rola.
 */
function ExerciseConsole({
  output,
  open,
  onOpenChange,
  focus,
  bodyRef,
}: {
  output: ExerciseOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  focus: string | null
  bodyRef: React.Ref<HTMLDivElement>
}) {
  const t = useTranslate()
  const id = React.useId()
  const Seta = open ? CaretDownIcon : CaretRightIcon
  // os grupos na ordem em que apareceram; "ao carregar" (sem teste) primeiro
  const grupos: Array<{ test?: string; logs: ExerciseLog[] }> = []
  for (const log of output?.logs ?? []) {
    const grupo = grupos.find((g) => g.test === log.test)
    if (grupo) grupo.logs.push(log)
    else grupos.push({ test: log.test, logs: [log] })
  }
  grupos.sort((a, b) => Number(a.test !== undefined) - Number(b.test !== undefined))
  const total = output?.logs.length ?? 0
  return (
    <section data-slot="exercise-console" data-state={open ? "open" : "closed"} className="flex shrink-0 flex-col border-t border-muted bg-rail">
      <div className="flex h-[34px] shrink-0 items-center gap-1.5 pr-3 pl-2.5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => onOpenChange(!open)}
          className="flex h-[26px] items-center gap-1.5 rounded-md px-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <Seta aria-hidden className="size-3" />
          <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] uppercase">{t("exercise_workspace.console.title")}</span>
        </button>
        {output ? (
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {total ? t("exercise_workspace.console.lines", { count: total }) : t("exercise_workspace.console.empty_badge")}
          </span>
        ) : null}
      </div>
      <div
        id={id}
        ref={bodyRef}
        hidden={!open}
        role="log"
        aria-label={t("exercise_workspace.console.title")}
        className="muriki-scroll max-h-[220px] overflow-y-auto px-4 pb-3 font-mono text-[12px] leading-[18px]"
      >
        {!output ? (
          <span className="font-sans text-[12.5px] text-muted-foreground">{t("exercise_workspace.console.not_run")}</span>
        ) : !total ? (
          <span className="font-sans text-[12.5px] text-muted-foreground">{t("exercise_workspace.console.empty")}</span>
        ) : (
          <div className="flex flex-col gap-2">
            {grupos.map((g) => (
              <div
                key={g.test ?? ""}
                data-test={g.test}
                className={cn("flex flex-col rounded-md", g.test !== undefined && g.test === focus && "ring-2 ring-primary/35 ring-offset-2 ring-offset-rail")}
              >
                <span className="font-sans text-[11.5px] font-medium text-muted-foreground">
                  {g.test !== undefined ? (output.labels?.[g.test] ?? g.test) : t("exercise_workspace.console.on_load")}
                </span>
                {g.logs.map((log, i) => (
                  <span
                    key={i}
                    className={cn("rounded-[3px] px-1.5 break-words whitespace-pre-wrap", COR_DO_NIVEL[log.level])}
                  >
                    {log.level !== "log" ? <span className="sr-only">{t(`exercise_workspace.console.level.${log.level}`)}: </span> : null}
                    {log.text}
                  </span>
                ))}
              </div>
            ))}
            {output.truncated ? (
              <span className="flex items-center gap-1.5 font-sans text-[12px] text-muted-foreground">
                <WarningCircleIcon aria-hidden className="size-3.5" />
                {t("exercise_workspace.console.truncated", { count: total })}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
