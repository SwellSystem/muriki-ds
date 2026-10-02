"use client"

/**
 * Muriki ComingSoon — o "em breve" de dentro do app: o lugar existe, o que vai nele ainda não.
 * Serve ao item de menu em breve, à trilha ou à etapa sem exercício, e ao exercício de um tipo que
 * ainda não abre (o de arquitetura, antes da bancada).
 *
 * MORA NO PALCO DO APPSHELL, não fora dele. A notice-page é a tela fora do app (acesso suspenso,
 * volta do pagamento); a status-page é o erro de sistema. Aqui nada deu errado: a pessoa está no
 * app, então o rail fica, o voltar leva de onde ela veio e o texto diz de onde ela veio.
 *
 * POUCO CONTEÚDO VAI NO CENTRO, numa coluna estreita: em cima, o voltar, alinhado com o resto do
 * palco; no meio, o mascote de olhos fechados (descansando, à espera; nunca olhos desenhados),
 * o selo "em breve", o título, uma frase e, se houver, a ação.
 *
 * Os textos vêm do app: o título diz o que vem e de onde ("Os exercícios da trilha Arquitetura de
 * sistemas chegam em breve"). O selo tem o texto padrão; `label` troca, `null` tira.
 */
import * as React from "react"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { BackLink } from "@/components/ui/back-link"
import { MurikiLogo } from "@/components/ui/muriki-logo"

export interface ComingSoonProps {
  /** O voltar: de onde a pessoa veio. `render` é o link do roteador e ganha de `href`. */
  backLink?: { label: React.ReactNode; render?: React.ReactElement; href?: string }
  title: React.ReactNode
  description?: React.ReactNode
  /** O selo acima do título. Sem isto, "em breve"; `null` tira. */
  label?: React.ReactNode | null
  /** As ações, ex.: <Button variant="outline" render={<Link to="/tracks" />}>Ver a trilha</Button>. */
  actions?: React.ReactNode
  /** No lugar do mascote, ex.: a ilustração do que vem. */
  illustration?: React.ReactNode
  className?: string
}

export function ComingSoon({ backLink, title, description, label, actions, illustration, className }: ComingSoonProps) {
  const t = useTranslate()
  return (
    <div data-slot="coming-soon" className={cn("flex min-h-[min(70svh,640px)] flex-col gap-6", className)}>
      {backLink ? (
        <BackLink render={backLink.render ?? (backLink.href ? <a href={backLink.href} /> : undefined)} className="self-start">
          {backLink.label}
        </BackLink>
      ) : null}
      <section className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
        {illustration ?? <MurikiLogo eyes="closed" className="size-16" />}
        {label === null ? null : <Badge tone="gray">{label ?? t("coming_soon.label")}</Badge>}
        <h1 className="m-0 text-[22px] leading-7 font-semibold tracking-[-0.01em] text-balance text-foreground-strong md:text-2xl md:leading-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="m-0 max-w-[44ch] text-sm leading-[22px] text-pretty text-muted-foreground">{description}</p>
        ) : null}
        {actions ? <div className="flex flex-wrap items-center justify-center gap-2 pt-2">{actions}</div> : null}
      </section>
    </div>
  )
}
