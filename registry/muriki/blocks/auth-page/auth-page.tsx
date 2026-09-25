"use client"

/**
 * Muriki AuthPage — a moldura das telas de conta, tirada do LoginPage para
 * as outras telas usarem a mesma: criar conta, criar e redefinir senha,
 * esqueci a senha, o segundo fator.
 *
 * Duas metades: à esquerda o painel-encaixe (sunken) com a atmosfera da
 * marca, o pitch e o mascote espiando; à direita a coluna de 440px com o
 * conteúdo. No mobile o painel some e a atmosfera vira um véu no topo. O
 * LoginPage é esta moldura com o LoginForm dentro.
 *
 * `hidden` é o mascote de olhos fechados (`brandHidden`/`mascotHidden`):
 * a tela liga quando a senha fica visível.
 *
 * AuthHeading é o cabeçalho da coluna — legenda mono com o filete, título
 * de duas linhas (a segunda na tinta da marca) e o subtítulo — o mesmo do
 * formulário de entrada. AuthNotice é o estado "mandamos um email": o que
 * a pessoa faz agora (reenviar, voltar) e uma nota.
 */
import { type ReactNode } from "react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** A legenda mono espaçada das telas de conta. */
export const AUTH_CAPTION =
  "font-mono text-[10px] font-medium tracking-[0.25em] text-muted-foreground uppercase"

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export interface AuthPageProps {
  /** Marca no canto — normalmente o mascote. O registry não carrega binário: vem do app. */
  brand?: ReactNode
  /** Entra no lugar de `brand` com `hidden` (o mascote fecha os olhos). */
  brandHidden?: ReactNode
  /** O mascote grande espiando pelo canto do painel. Padrão: `brand`. */
  mascot?: ReactNode
  /** Padrão: `brandHidden`. */
  mascotHidden?: ReactNode
  /** Olhos fechados: a senha está visível. */
  hidden?: boolean
  /** Canto superior direito — troca de tema, idioma. */
  utilities?: ReactNode
  year?: number
  className?: string
  children: ReactNode
}

export function AuthPage({
  brand,
  brandHidden,
  mascot,
  mascotHidden,
  hidden = false,
  utilities,
  year = new Date().getFullYear(),
  className,
  children,
}: AuthPageProps) {
  const t = useTranslate()
  const mark = hidden && brandHidden ? brandHidden : brand
  const peekDefault = mascot ?? brand
  const peekHidden = mascotHidden ?? brandHidden
  const peek = hidden && peekHidden ? peekHidden : peekDefault
  const copyright = t("login.footer_copyright", { year })

  return (
    <div className={cn("relative min-h-svh bg-background text-foreground", className)}>
      <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
        {/* painel editorial — só desktop */}
        <aside className="relative hidden overflow-hidden bg-sunken shadow-[inset_-1px_0_0_var(--border)] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-transparent" />
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-[520px] rounded-full bg-primary/20 blur-[160px]" />
          <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 size-[420px] translate-x-1/3 translate-y-1/4 rounded-full bg-accent/25 blur-[120px]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <Mark node={mark} className="size-9" />
            <span className={AUTH_CAPTION}>{t("login.brand_index")}</span>
          </div>

          <div className="relative z-10 flex max-w-lg flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className={cn(AUTH_CAPTION, "tracking-[0.3em]")}>{t("login.section_access")}</span>
              <span className="h-px w-16 bg-primary" />
            </div>
            <h2 className="text-[clamp(3rem,5vw,5rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-foreground-strong">
              {t("login.pitch_line1")}
              <br />
              <span className="text-primary">{t("login.pitch_line2")}.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              {t("login.pitch_description")}
            </p>
          </div>

          {peek ? (
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -bottom-24 z-0 opacity-[0.06] transition-opacity duration-500 xl:-right-10 xl:-bottom-16 xl:opacity-[0.08]"
            >
              <Mark node={peek} className="size-[480px] -rotate-6" />
            </div>
          ) : null}

          <div className="relative z-10">
            <p className={AUTH_CAPTION}>{copyright}</p>
          </div>
        </aside>

        {/* conteúdo */}
        <main className="relative flex min-h-svh flex-col">
          <header className="relative z-10 flex items-center justify-between px-5 pt-6 md:px-10 md:pt-8 lg:justify-end lg:px-12 lg:pt-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Mark node={mark} className="size-7" />
              <span className={AUTH_CAPTION}>{t("login.brand_index")}</span>
            </div>
            {utilities ? <div className="flex items-center gap-2">{utilities}</div> : null}
          </header>

          {/* véu — só onde o painel não existe */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-linear-to-b from-primary/[0.05] via-primary/[0.02] to-transparent lg:hidden" />
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[280px] w-full max-w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px] lg:hidden" />

          <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 md:px-10 md:py-12 [@media(min-height:781px)_and_(max-height:900px)]:py-6 [@media(max-height:780px)]:py-4 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,440px)_minmax(0,1fr)] lg:content-center lg:px-12 xl:px-20">
            <div className="mx-auto w-full max-w-[440px] lg:col-start-2 lg:mx-0">{children}</div>
          </div>

          <footer className="relative z-10 px-5 py-4 shadow-[inset_0_1px_0_var(--border)] md:px-10 lg:hidden">
            <p className={cn(AUTH_CAPTION, "text-center text-[9px] tracking-[0.3em] text-muted-foreground/70")}>
              {copyright}
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}

export interface AuthHeadingProps {
  /** Legenda mono acima, ex.: "Criar senha". */
  label: string
  /** Primeira linha do título. */
  title: ReactNode
  /** Segunda linha, na tinta da marca. */
  titleAccent?: ReactNode
  subtitle?: ReactNode
  className?: string
}

export function AuthHeading({ label, title, titleAccent, subtitle, className }: AuthHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center gap-3">
        <span className={AUTH_CAPTION}>{label}</span>
        <span className="h-px w-10 bg-primary" />
        <span className="h-px flex-1 bg-divider" />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] text-foreground-strong">
          {title}
          {titleAccent ? (
            <>
              <br />
              <span className="text-primary">{titleAccent}</span>
            </>
          ) : null}
        </h1>
        {subtitle ? <p className="text-base leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export interface AuthNoticeProps {
  /** Ações: reenviar (secundário), usar outro email. */
  actions?: ReactNode
  /** A nota de baixo, ex.: "Não chegou? Olhe o spam". */
  note?: ReactNode
  /** Um link de volta, por último. */
  back?: ReactNode
  className?: string
}

export function AuthNotice({ actions, note, back, className }: AuthNoticeProps) {
  return (
    <div role="status" className={cn("flex flex-col gap-3.5", className)}>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      {note ? <p className="text-[12.5px] leading-[18px] text-muted-foreground">{note}</p> : null}
      {back}
    </div>
  )
}

/** Dá tamanho ao slot sem saber se veio <img>, <svg> ou componente. */
function Mark({ node, className }: { node: ReactNode; className?: string }) {
  if (!node) return null
  return (
    <span className={cn("block shrink-0 [&>*]:size-full [&>*]:object-contain", className)}>
      {node}
    </span>
  )
}
