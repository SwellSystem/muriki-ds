"use client"

/**
 * Muriki LoginPage — a tela de entrada, herdada do platform e vestida
 * com a paleta.
 *
 * Layout editorial em duas metades: à esquerda o painel-encaixe (sunken)
 * com a atmosfera azul-e-amarelo da marca, o pitch e o mascote espiando
 * pelo canto; à direita o formulário. No mobile o painel some e a
 * atmosfera vira um véu no topo.
 *
 * O bloco não conhece roteador, i18next nem API: recebe callbacks, slots
 * e o mascote por prop — o registry não carrega binário. `brandHidden` é
 * o mascote de olhos fechados: entra quando a senha fica visível.
 *
 * Só um botão sólido na tela: o "Entrar". Todo o resto é filete.
 */
import { useState, type ReactNode } from "react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { CAPTION, LoginForm } from "./login-form"
import type { LoginPageProps } from "./types"

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

export function LoginPage({
  brand,
  brandHidden,
  mascot,
  mascotHidden,
  utilities,
  year = new Date().getFullYear(),
  className,
  ...form
}: LoginPageProps) {
  const t = useTranslate()
  const [passwordVisible, setPasswordVisible] = useState(false)

  const mark = passwordVisible && brandHidden ? brandHidden : brand
  const peekDefault = mascot ?? brand
  const peekHidden = mascotHidden ?? brandHidden
  const peek = passwordVisible && peekHidden ? peekHidden : peekDefault

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
            <span className={CAPTION}>{t("login.brand_index")}</span>
          </div>

          <div className="relative z-10 flex max-w-lg flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className={cn(CAPTION, "tracking-[0.3em]")}>{t("login.section_access")}</span>
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
            <p className={CAPTION}>{copyright}</p>
          </div>
        </aside>

        {/* formulário */}
        <main className="relative flex min-h-svh flex-col">
          <header className="relative z-10 flex items-center justify-between px-5 pt-6 md:px-10 md:pt-8 lg:justify-end lg:px-12 lg:pt-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Mark node={mark} className="size-7" />
              <span className={CAPTION}>{t("login.brand_index")}</span>
            </div>
            {utilities ? <div className="flex items-center gap-2">{utilities}</div> : null}
          </header>

          {/* véu — só onde o painel não existe */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-linear-to-b from-primary/[0.05] via-primary/[0.02] to-transparent lg:hidden" />
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[280px] w-full max-w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px] lg:hidden" />

          <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 md:px-10 md:py-12 [@media(min-height:781px)_and_(max-height:900px)]:py-6 [@media(max-height:780px)]:py-4 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,440px)_minmax(0,1fr)] lg:content-center lg:px-12 xl:px-20">
            <LoginForm
              {...form}
              onPasswordVisibilityChange={setPasswordVisible}
              className="mx-auto w-full max-w-[440px] lg:col-start-2 lg:mx-0"
            />
          </div>

          <footer className="relative z-10 px-5 py-4 shadow-[inset_0_1px_0_var(--border)] md:px-10 lg:hidden">
            <p className={cn(CAPTION, "text-center text-[9px] tracking-[0.3em] text-muted-foreground/70")}>
              {copyright}
            </p>
          </footer>
        </main>
      </div>
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
