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
 * No desktop (lg), a lateral é um painel de 372px com a mesma pele do editor e três seções
 * recolhíveis, como Código e Testes no rail: o enunciado ocupa o que sobra e só o corpo dele rola;
 * a explicação e as dicas ficam fixas embaixo. Quem quer mais espaço para ler recolhe a explicação.
 * O editor ocupa o resto, na altura que o app der à tela (a moldura estica). Abaixo de lg, tudo
 * empilha: cabeçalho, painel (na altura do conteúdo, sem rolar por dentro), editor, e dentro do
 * editor a árvore e os testes sobem para cima do código.
 *
 * O guia do primeiro exercício (`guide`) cobre a tela com o véu e sobe, um de cada vez, o editor
 * (passo 1), os testes (2) e a explicação (3), cada um com o anel e o balão ao lado.
 */
import * as React from "react"
import { createPortal } from "react-dom"
import {
  CaretDownIcon,
  CaretRightIcon,
  CheckIcon,
  CircleIcon,
  FileIcon,
  LaptopIcon,
  LightbulbIcon,
  LockIcon,
  PaperPlaneTiltIcon,
  PlayIcon,
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
import { Textarea } from "@/components/ui/textarea"
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

export interface ExerciseWorkspaceProps {
  header: React.ReactNode
  /** O que ocupa o painel da esquerda e rola por dentro: o enunciado. */
  side: React.ReactNode
  /** O que fica fixo embaixo do painel: a explicação e as dicas. */
  foot?: React.ReactNode
  editor: React.ReactNode
  /** O guia do primeiro exercício. Sem isto, nada de véu. */
  guide?: ExerciseGuide
  className?: string
}

export function ExerciseWorkspace({ header, side, foot, editor, guide, className }: ExerciseWorkspaceProps) {
  const ativo = !!guide && guide.step >= 1 && guide.step <= PASSOS
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
      <div
        data-slot="exercise-workspace"
        className={cn("flex min-w-0 flex-col gap-[18px] lg:h-full lg:min-h-0", className)}
      >
        {header}
        <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
          {/* Só o corpo do enunciado rola. A rolagem do painel inteiro é a rede para a tela baixa
              demais, em que o enunciado já está no mínimo e o pé não cabe: aí ele rola junto. */}
          <div
            data-slot="exercise-side"
            className="muriki-scroll flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs lg:min-h-0 lg:w-[372px] lg:shrink-0 lg:overflow-y-auto"
          >
            <div className="flex flex-col lg:flex-1">{side}</div>
            {foot ? <div className="flex shrink-0 flex-col">{foot}</div> : null}
          </div>
          {editor}
        </div>
        {/* o véu cobre a tela; só a área do passo atual sobe acima dele */}
        {ativo ? <div aria-hidden className="fixed inset-0 z-40 bg-scrim" /> : null}
      </div>
    </GuiaContexto.Provider>
  )
}

// ── Cabeçalho ───────────────────────────────────────────────────────────

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
  /** Texto pronto, ex.: "salvo há 5 s". */
  savedLabel?: React.ReactNode
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
  savedLabel,
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
        {savedLabel ? <span className="mr-1.5 text-xs text-muted-foreground">{savedLabel}</span> : null}
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

/** Aberta ou recolhida: controlada por `open`, ou solta a partir de `defaultOpen`. */
function useAberta(open: boolean | undefined, defaultOpen: boolean, onOpenChange?: (open: boolean) => void) {
  const [solta, setSolta] = React.useState(defaultOpen)
  const aberta = open ?? solta
  const mudar = (v: boolean) => {
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

export interface ExerciseStatementProps extends ExerciseCollapsibleProps {
  /** O enunciado já renderizado (o app transforma o Markdown). */
  children: React.ReactNode
  /** O rótulo mono. Sem isto, "Enunciado". */
  label?: string
  className?: string
}

export function ExerciseStatement({
  children,
  label,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseStatementProps) {
  const t = useTranslate()
  return (
    <ExerciseSection
      data-slot="exercise-statement"
      title={label ?? t("exercise_workspace.statement")}
      divider={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      // aberto, nunca menos que umas cinco linhas de leitura, por menor que seja a tela
      className={cn("lg:flex-1 lg:data-[state=open]:min-h-[160px]", className)}
      bodyClassName="muriki-scroll flex flex-col gap-3 px-4 pb-4 text-sm leading-[22px] text-foreground lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
    >
      {children}
    </ExerciseSection>
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
      open={mostrar}
      onOpenChange={mudar}
      className={cn("bg-card", destaque, className)}
      bodyClassName="flex flex-col gap-2.5 px-4 pb-4"
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
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseHintsProps) {
  const t = useTranslate()
  if (total <= 0) return null
  const acabou = used >= total
  return (
    <ExerciseSection
      data-slot="exercise-hints"
      title={t("exercise_workspace.hints.title")}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={className}
      bodyClassName="flex items-center gap-2.5 pr-3 pb-3 pl-4"
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
    </ExerciseSection>
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
          <span className="font-mono text-[9.5px] font-medium tracking-[0.2em] uppercase">{title}</span>
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
  name: string
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
  className?: string
}

const TIPOS_DE_ERRO = new Set(["timeout", "build", "runtime", "unavailable"])

export function ExerciseTests({ summary, items, error, ranAt, onOpenTest, className }: ExerciseTestsProps) {
  const t = useTranslate()
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
                  {item.name}
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
  children,
  className,
}: ExerciseEditorProps) {
  const t = useTranslate()
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
  )
}
