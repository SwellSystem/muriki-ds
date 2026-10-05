"use client"

/**
 * Muriki TrackLanguageSwitch — a troca de linguagem da trilha no Starter (design/muriki-code/troca.py,
 * quadros TrocaLinguagem, TrocaLinguagemVolta, TrocaLinguagemPlano e TrocaLinguagemMovel).
 *
 * No Starter a pessoa estuda uma família de linguagem por vez. Em "Começar a trilha" numa trilha de outra
 * linguagem (`access: "switch"` no GET /code/tracks), o app abre este modal; na confirmação o componente
 * chama `onConfirm` (o PUT /code/language-choice do app). Com `access: "not_in_plan"`, a troca só libera
 * em `changeAllowedAt`: o modal só diz a data quando a pessoa clica (o cartão da trilha não antecipa o
 * limite) e usa as peças do PlanLimitDialog, o quadro do Pro e "Agora não" com "Conhecer o Pro". O Pro
 * nunca vê. `reason` é a linha de cima de quem chegou por redirecionamento (403 LANGUAGE_NOT_IN_PLAN).
 *
 * Por cima do véu desfocado, como as boas-vindas: as duas trilhas lado a lado, a de agora à esquerda e a
 * clicada à direita, e no meio o logo da linguagem ativa com as setas fazendo a passagem. Três fases:
 * - confirmar: o que acontece, Trocar e Continuar na atual (e o link do Pro, se o app passar);
 * - trocando: a de agora congela (o gelo desce, a cor sai, "Guardado · 5 de 12 etapas": o histórico fica,
 *   nada é apagado), o logo do meio gira e vira o da nova, e a nova se abre do começo — o primeiro ponto
 *   acende com "comece aqui". Dura o tempo do `onConfirm`, e no mínimo ~2,2 s;
 * - concluído: "Começar a trilha".
 *
 * Regra B do Starter: voltar para uma linguagem deixada recomeça do zero (a "época" da API; nada é apagado e
 * o Pro vê tudo). Por isso nada aqui promete voltar de onde parou: a confirmação avisa o recomeço, e a
 * trilha clicada sempre abre do começo (o `done` de `to` não conta).
 *
 * Se `onConfirm` rejeitar, volta para a confirmação com o aviso de erro. Trocando, Esc e clique fora não
 * fecham; na confirmação e no not_in_plan são "Continuar na atual" (`onDismiss`).
 *
 * Movimento no css do item (`muriki-langswitch-*`). Com prefers-reduced-motion, nada se mexe: cada fase
 * aparece no estado final e a troca espera só o `onConfirm`. Ao abrir, o logo do meio dá uma prévia da
 * troca, uma vez (gira para a nova e volta; no not_in_plan, para o cadeado e volta). No celular (abaixo de
 * md), a folha que sobe de baixo, com os cartões empilhados e as setas descendo de um para o outro; `variant` fixa um dos dois.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ArrowCounterClockwiseIcon, ArrowRightIcon, CaretRightIcon, LockSimpleIcon, SnowflakeIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { BrandLogo, brandName, type Brand } from "@/components/ui/brand-logo"
import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { PlanLimitActions, PlanLimitBenefit } from "@/components/blocks/plan-limit-dialog/plan-limit-dialog"

export interface TrackLanguageSwitchTrack {
  /** A linguagem da trilha, para o logo e o chip ("js", "py"…). */
  brand: Brand
  /** O nome no chip. Sem isto, brandName(brand): "JavaScript", "Python". */
  language?: string
  /** O nome da trilha, ex.: "JavaScript do zero". */
  title: string
  /** Etapas feitas. Só conta em `from`: a trilha clicada sempre abre do começo no Starter. */
  done: number
  total: number
  /** A etapa de agora, ex.: "Funções e escopo". Vai na linha de baixo do cartão. */
  current?: string
}

export type TrackLanguageSwitchPhase = "confirm" | "switching" | "done"

export interface TrackLanguageSwitchProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  /** A trilha da linguagem de agora: é ela que congela. */
  from: TrackLanguageSwitchTrack
  /** A trilha clicada, de outra linguagem: abre do começo, mesmo na volta (regra B). */
  to: TrackLanguageSwitchTrack
  /** O `access` da trilha clicada no GET /code/tracks. */
  access: "switch" | "not_in_plan"
  /** Com not_in_plan: quando a troca libera (`changeAllowedAt`). */
  changeAllowedAt?: string | Date
  /**
   * Por que o modal abriu sem a pessoa clicar numa trilha: a linha de cima, antes do título. Ex.: o
   * link direto que a API recusou (403 LANGUAGE_NOT_IN_PLAN) e o app trouxe para Trilhas:
   * "Esse conteúdo é de Python, e o seu plano estuda uma linguagem por vez."
   */
  reason?: string
  /** O idioma do app (i18n.language), para a data. */
  locale?: string
  /** A troca (PUT /code/language-choice). A animação dura o tempo da promessa; se rejeitar, volta. */
  onConfirm?: () => Promise<unknown> | void
  /** "Começar a trilha" ou "Continuar a trilha", no fim. `startRender` é o link do roteador. */
  onStart?: () => void
  startRender?: React.ReactElement
  /** "Continuar em JavaScript", Esc e clique fora (na confirmação e no not_in_plan). */
  onDismiss?: () => void
  /**
   * O link "No Pro as duas ficam abertas" na confirmação e, no not_in_plan, o quadro do Pro com
   * "Conhecer o Pro" (as peças do PlanLimitDialog). Sem nenhum dos dois, o Pro some.
   */
  onSeePro?: () => void
  proRender?: React.ReactElement
  /** A fase em que abre (prévias e testes). */
  defaultPhase?: TrackLanguageSwitchPhase
  /** "auto": folha abaixo de md, diálogo acima. "dialog" e "sheet" fixam um dos dois. */
  variant?: "auto" | "dialog" | "sheet"
  className?: string
}

// O tempo mínimo da troca: o gelo desce, o logo gira, a nova abre e o balão aparece (o css do item).
const DURACAO = 2200

// As classes de cada forma, escritas por inteiro: o Tailwind só gera o que lê.
const FORMA = {
  auto: {
    popup:
      "muriki-langswitch-modal muriki-langswitch-auto max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92dvh] max-md:w-full max-md:rounded-t-[20px] max-md:px-5 max-md:pt-2.5 max-md:pb-[calc(1.75rem+env(safe-area-inset-bottom))] md:top-1/2 md:left-1/2 md:max-h-[calc(100dvh-2rem)] md:w-[min(720px,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[18px] md:px-8 md:pt-[26px] md:pb-7",
    alca: "md:hidden",
    palco: "flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3.5",
    grupo: "flex flex-col md:flex-row",
    giro: "rotate-90 md:rotate-0",
    titulo: "text-[21px] leading-[27px] md:text-2xl md:leading-[30px]",
    fases: "md:min-h-[220px]",
    rodape: "flex flex-col-reverse items-stretch gap-1.5 md:flex-row md:items-center md:gap-2.5",
    pro: "self-center pt-1.5 md:mr-auto md:self-auto md:pt-0",
    botao: "h-12 md:h-10",
  },
  dialog: {
    popup:
      "muriki-langswitch-modal top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[18px] px-8 pt-[26px] pb-7",
    alca: "hidden",
    palco: "flex items-center gap-3.5",
    grupo: "flex",
    giro: "",
    titulo: "text-2xl leading-[30px]",
    fases: "min-h-[220px]",
    rodape: "flex items-center gap-2.5",
    pro: "mr-auto",
    botao: "h-10",
  },
  sheet: {
    popup:
      "muriki-langswitch-sheet inset-x-0 bottom-0 max-h-[92dvh] w-full rounded-t-[20px] px-5 pt-2.5 pb-[calc(1.75rem+env(safe-area-inset-bottom))]",
    alca: "",
    palco: "flex flex-col items-stretch gap-2",
    grupo: "flex flex-col",
    giro: "rotate-90",
    titulo: "text-[21px] leading-[27px]",
    fases: "",
    rodape: "flex flex-col-reverse items-stretch gap-1.5",
    pro: "self-center pt-1.5",
    botao: "h-12",
  },
} as const

// O caminho mini do cartão: 9 estações numa estrada que ondula, num viewBox de 220 × 52.
const VB_W = 220
const VB_H = 52
const PONTOS = Array.from({ length: 9 }, (_, i) => [10 + i * 25, 26 + Math.round(13 * Math.sin(i * 0.85 + 0.4))] as const)

// A estação de agora pelo quanto foi feito; a trilha nova fica na primeira.
function estacao(done: number, total: number) {
  if (done <= 0 || total <= 0) return 0
  return Math.min(PONTOS.length - 1, Math.max(1, Math.round((done / total) * (PONTOS.length - 1))))
}

function Caminho({ agora, nova, balao }: { agora: number; nova?: boolean; balao?: string }) {
  const linha = (n: number) => "M" + PONTOS.slice(0, n).map(([x, y]) => `${x} ${y}`).join(" L")
  const [bx, by] = PONTOS[agora]
  // perto das pontas, o balão se apoia no ponto em vez de centrar, para não sair do cartão
  const ax = bx < VB_W * 0.2 ? "-10px" : bx > VB_W * 0.8 ? "calc(-100% + 10px)" : "-50%"
  return (
    <div className="relative mt-3.5">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden className="block w-full max-w-[240px] overflow-visible">
        <path d={linha(PONTOS.length)} fill="none" stroke="var(--sunken)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        {agora > 0 ? (
          <path d={linha(agora + 1)} fill="none" stroke="var(--primary)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {PONTOS.map(([x, y], i) =>
          nova && i === 0 ? (
            <circle key={i} className="muriki-langswitch-light" cx={x} cy={y} r={5.5} fill="var(--card)" stroke="var(--input)" strokeWidth={2} />
          ) : i < agora ? (
            <circle key={i} cx={x} cy={y} r={4} fill="var(--primary)" />
          ) : i === agora ? (
            <circle key={i} cx={x} cy={y} r={5.5} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
          ) : (
            <circle key={i} cx={x} cy={y} r={4} fill="var(--card)" stroke="var(--input)" strokeWidth={1.5} />
          )
        )}
      </svg>
      {balao ? (
        <span
          aria-hidden
          className="muriki-langswitch-here absolute rounded-full bg-foreground-strong px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap text-card"
          style={{ left: `${(bx / VB_W) * 100}%`, top: `${(by / VB_H) * 100}%`, "--muriki-langswitch-ax": ax } as React.CSSProperties}
        >
          {balao}
        </span>
      ) : null}
    </div>
  )
}

function Cartao({
  track,
  papel,
  selo,
  balao,
}: {
  track: TrackLanguageSwitchTrack
  /** from: a de agora (congela). new: a nova (abre do começo). locked: not_in_plan. */
  papel: "from" | "new" | "locked"
  selo?: string
  balao?: string
}) {
  const t = useTranslate()
  const feitas = papel === "from" ? track.done : 0
  const progresso = feitas > 0 ? t("track_language_switch.progress", { done: track.done, total: track.total }) : null
  const meta = progresso
    ? [progresso, track.current].filter(Boolean).join(" · ")
    : t("track_language_switch.steps", { count: track.total })
  return (
    <div
      data-slot="track-language-switch-track"
      data-role={papel}
      className={cn(
        "muriki-langswitch-card relative min-w-0 flex-1 rounded-[12px] bg-rail px-4 py-3.5",
        papel === "from" ? "muriki-langswitch-from" : "muriki-langswitch-to"
      )}
    >
      <div className="muriki-langswitch-body flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <Badge tone="gray" className="pl-[5px]">
            <BrandLogo brand={track.brand} size={14} />
            {track.language ?? brandName(track.brand)}
          </Badge>
          {selo ? (
            <Badge variant="outline" className="ml-auto">
              <LockSimpleIcon aria-hidden className="size-[11px]" />
              {selo}
            </Badge>
          ) : null}
        </div>
        <span className="text-[15px] leading-[21px] font-semibold text-foreground-strong">{track.title}</span>
        <Caminho agora={estacao(feitas, track.total)} nova={papel === "new"} balao={balao} />
        <span className="text-xs leading-[17px] text-muted-foreground">{meta}</span>
      </div>
      {papel === "from" ? (
        // o gelo: azul tingido e translúcido por cima, o floco, "Guardado" e quanto ficou guardado
        <div
          aria-hidden
          className="muriki-langswitch-ice absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[12px] text-tone-blue-foreground"
        >
          <SnowflakeIcon className="absolute top-2.5 left-3 size-3.5 opacity-35" />
          <SnowflakeIcon className="absolute right-3.5 bottom-3 size-[18px] opacity-35" />
          <SnowflakeIcon className="absolute top-4 right-[30px] size-2.5 opacity-35" />
          <SnowflakeIcon className="size-[26px]" />
          <span className="text-sm font-semibold">{t("track_language_switch.saved")}</span>
          <span className="text-xs">{t("track_language_switch.progress", { done: track.done, total: track.total })}</span>
        </div>
      ) : null}
    </div>
  )
}

function Passagem({ de, para, travado, f }: { de: Brand; para: Brand; travado?: boolean; f: (typeof FORMA)[keyof typeof FORMA] }) {
  // as setas dos dois lados do logo da linguagem ativa; a onda vai da de agora para a nova. Ao abrir, o
  // logo dá uma prévia só: gira para o da nova e volta (no not_in_plan, para o cadeado e volta)
  const grupo = (i0: number) => (
    <span className={cn("items-center gap-px", f.grupo)}>
      {[0, 1, 2].map((n) => (
        <span key={n} className={cn("flex", f.giro)}>
          <CaretRightIcon
            weight="bold"
            className="muriki-langswitch-arrow size-4 text-primary"
            style={{ "--muriki-langswitch-i": i0 + n } as React.CSSProperties}
          />
        </span>
      ))}
    </span>
  )
  return (
    <div aria-hidden className="flex shrink-0 items-center justify-center gap-2.5 md:gap-1.5">
      {grupo(0)}
      <span className="relative flex size-14 shrink-0 [perspective:240px]">
        <span className="absolute -inset-[18px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)]" />
        <span className="muriki-langswitch-wave absolute inset-0 rounded-[16px] shadow-[0_0_0_2px_var(--primary)]" />
        <span className="absolute inset-0 rounded-[16px] bg-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.06)]" />
        <span className="muriki-langswitch-logo-from absolute inset-0 flex items-center justify-center">
          <BrandLogo brand={de} size={30} />
        </span>
        <span className="muriki-langswitch-logo-to absolute inset-0 flex items-center justify-center">
          <BrandLogo brand={para} size={30} />
        </span>
        {travado ? (
          <span className="muriki-langswitch-lock absolute inset-0 flex items-center justify-center text-muted-foreground">
            <LockSimpleIcon className="size-[26px]" />
          </span>
        ) : null}
      </span>
      {grupo(3)}
    </div>
  )
}

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function TrackLanguageSwitch({
  open,
  onOpenChange,
  from,
  to,
  access,
  changeAllowedAt,
  reason,
  locale = "pt-BR",
  onConfirm,
  onStart,
  startRender,
  onDismiss,
  onSeePro,
  proRender,
  defaultPhase = "confirm",
  variant = "auto",
  className,
}: TrackLanguageSwitchProps) {
  const f = FORMA[variant]
  const t = useTranslate()
  const [fase, setFase] = React.useState<TrackLanguageSwitchPhase>(defaultPhase)
  const [erro, setErro] = React.useState(false)
  // cada vez que abre, começa de novo na fase pedida
  const [abertoAntes, setAbertoAntes] = React.useState(open)
  if (open !== abertoAntes) {
    setAbertoAntes(open)
    if (open) {
      setFase(defaultPhase)
      setErro(false)
    }
  }
  // o foco vai para o título a cada fase: quem usa teclado ou leitor de tela lê o que mudou
  const tituloRef = React.useRef<HTMLHeadingElement>(null)
  React.useEffect(() => {
    if (open) tituloRef.current?.focus()
  }, [fase, open])

  const bloqueado = access === "not_in_plan"
  const nomeDe = from.language ?? brandName(from.brand)
  const nomePara = to.language ?? brandName(to.brand)
  const temPro = !!(onSeePro || proRender)
  const data = changeAllowedAt ? new Date(changeAllowedAt) : null
  const dataLonga = data ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(data) : ""
  const dataCurta = data ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(data) : ""

  const ficar = () => {
    onDismiss?.()
    onOpenChange?.(false)
  }
  const trocar = async () => {
    setErro(false)
    setFase("switching")
    const calmo = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    try {
      await Promise.all([onConfirm?.(), espera(calmo ? 0 : DURACAO)])
      setFase("done")
    } catch {
      setFase("confirm")
      setErro(true)
    }
  }

  const k = (chave: string) => `track_language_switch.${chave}`
  const nomes = { from: nomeDe, to: nomePara }
  const textos = bloqueado
    ? { titulo: t(k("locked_title"), { to: nomePara, date: dataLonga }), texto: t(k("locked_text"), nomes) }
    : fase === "switching"
      ? { titulo: t(k("switching_title"), nomes), texto: t(k("switching_text"), nomes) }
      : fase === "done"
        ? { titulo: t(k("done_title"), nomes), texto: t(k("done_text"), nomes) }
        : { titulo: t(k("confirm_title"), nomes), texto: t(k("confirm_text"), nomes) }
  // o recomeço do zero, dito antes de trocar (e no not_in_plan, para quando trocar)
  const aviso = bloqueado ? t(k("locked_note"), nomes) : fase === "confirm" ? t(k("note"), nomes) : null

  const linkPro = temPro ? (
    <Button variant="ghost" size="lg" onClick={onSeePro} render={proRender} nativeButton={!proRender} className={cn("px-0 text-primary hover:bg-transparent", f.pro)}>
      {t(k("pro_link"))}
    </Button>
  ) : null

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(proximo) => {
        if (proximo) onOpenChange?.(true)
        else if (fase === "confirm" || bloqueado) ficar()
        else if (fase === "done") onOpenChange?.(false)
        // trocando: Esc e clique fora não fecham, o PUT está no meio
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="track-language-switch-veil"
          className="muriki-langswitch-veil fixed inset-0 z-50 bg-[color-mix(in_oklch,var(--background)_45%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.15]"
        />
        <DialogPrimitive.Popup
          data-slot="track-language-switch"
          data-variant={variant}
          data-phase={bloqueado ? "locked" : fase}
          data-error={erro || undefined}
          initialFocus={tituloRef}
          className={cn(
            "muriki-scroll fixed z-50 flex flex-col gap-4 overflow-y-auto bg-card text-card-foreground outline-none md:gap-[22px]",
            "shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45),0_0_0_1px_var(--border)]",
            f.popup,
            className
          )}
        >
          <span aria-hidden className={cn("h-1 w-10 shrink-0 self-center rounded-full bg-input", f.alca)} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{t(k("eyebrow"))}</span>

          <div className={f.palco}>
            <Cartao track={from} papel="from" />
            <Passagem de={from.brand} para={to.brand} travado={bloqueado} f={f} />
            <Cartao
              track={to}
              papel={bloqueado ? "locked" : "new"}
              selo={bloqueado ? t(k("unlocks_at"), { date: dataCurta }) : undefined}
              balao={bloqueado ? undefined : t(k("here_start"))}
            />
          </div>

          <div className={cn("flex flex-col gap-4 md:gap-[18px]", f.fases)}>
            <div key={bloqueado ? "locked" : fase} className="muriki-langswitch-copy flex flex-col gap-2">
              {reason && (bloqueado || fase === "confirm") ? (
                <p data-slot="track-language-switch-reason" className="m-0 text-[13px] leading-[19px] text-muted-foreground">
                  {reason}
                </p>
              ) : null}
              <DialogPrimitive.Title
                ref={tituloRef}
                tabIndex={-1}
                className={cn("m-0 font-semibold tracking-[-0.01em] text-balance text-foreground-strong outline-none", f.titulo)}
              >
                {textos.titulo}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="m-0 text-[14.5px] leading-[22px] text-pretty text-foreground">
                {textos.texto}
              </DialogPrimitive.Description>
              {aviso ? (
                <p className="m-0 flex items-start gap-2.5 rounded-[10px] bg-sunken px-3 py-2.5 text-[13.5px] leading-5 text-foreground">
                  <ArrowCounterClockwiseIcon aria-hidden className="mt-0.5 size-[15px] shrink-0 text-muted-foreground" />
                  {aviso}
                </p>
              ) : null}
              {bloqueado && temPro ? <PlanLimitBenefit>{t(k("locked_pro"))}</PlanLimitBenefit> : null}
              {erro ? (
                <p role="alert" className="m-0 text-[13.5px] text-destructive">
                  {t(k("error"))}
                </p>
              ) : null}
            </div>

            {bloqueado ? (
              temPro ? (
                // o mesmo rodapé do limite do plano: "Agora não" e "Conhecer o Pro"
                <PlanLimitActions
                  onUpgrade={onSeePro}
                  upgradeRender={proRender}
                  onDismiss={ficar}
                  buttonClassName={f.botao}
                />
              ) : (
                <div className={f.rodape}>
                  <Button variant="solid" size="lg" onClick={ficar} className={cn(f.botao, "md:ml-auto")}>
                    {t(k("stay"), { from: nomeDe })}
                  </Button>
                </div>
              )
            ) : fase === "confirm" ? (
              <div className={f.rodape}>
                {linkPro}
                <Button variant="ghost" size="lg" onClick={ficar} className={cn(f.botao, !temPro && "md:ml-auto")}>
                  {t(k("stay"), { from: nomeDe })}
                </Button>
                <Button variant="solid" size="lg" onClick={trocar} className={f.botao}>
                  {t(k("switch"), nomes)}
                  <ArrowRightIcon aria-hidden data-motion="nudge" />
                </Button>
              </div>
            ) : fase === "done" ? (
              <div className={f.rodape}>
                <Button
                  variant="solid"
                  size="lg"
                  onClick={() => {
                    onStart?.()
                    onOpenChange?.(false)
                  }}
                  render={startRender}
                  nativeButton={!startRender}
                  className={cn(f.botao, "md:ml-auto")}
                >
                  {t(k("start"))}
                  <ArrowRightIcon aria-hidden data-motion="nudge" />
                </Button>
              </div>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { TrackLanguageSwitch }
