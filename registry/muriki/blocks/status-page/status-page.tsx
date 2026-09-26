"use client"

// As páginas de sistema do hub (design/muriki-code/sistema.py): sem internet, página não
// encontrada, erro inesperado, sessão expirada e manutenção — as mesmas no Code, no Backoffice
// e no Platform; muda o nome do produto na legenda.
//
// A linguagem é a do login: a atmosfera da marca no fundo, a legenda mono com o filete, o título
// editorial em duas linhas com a segunda no azul e o botão com a seta no círculo. À direita, o
// palco: o código gigante com o mascote no lugar do zero (4-0-4, 5-0-0, 4-0-1, 5-0-3, O-FF), com
// a cara do que houve. Nenhuma culpa a pessoa, e toda tela diz o que fazer.
//
// Sem roteador nem API: as ações chegam por prop, com o elemento que navega em `render` (o
// <Link> do app) ou um `onClick`. Os textos vêm do i18n (status_page.*), e o app pode trocar
// qualquer um por prop.
import { cloneElement, type ReactElement, type ReactNode } from "react"
import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react"

import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { StatusMascot, type StatusMascotFace } from "./status-mascot"

export type StatusPageKind = "offline" | "not-found" | "error" | "session-expired" | "maintenance"

const PAGINAS: Record<StatusPageKind, { codigo: string; cara: StatusMascotFace; chave: string }> = {
  offline: { codigo: "OFF", cara: "offline", chave: "offline" },
  "not-found": { codigo: "404", cara: "not-found", chave: "not_found" },
  error: { codigo: "500", cara: "error", chave: "error" },
  "session-expired": { codigo: "401", cara: "locked", chave: "session_expired" },
  maintenance: { codigo: "503", cara: "warning", chave: "maintenance" },
}

export interface StatusPageAction {
  /** Sem rótulo, vem o do i18n para a página (ex.: "Tentar de novo"). */
  label?: string
  /** O elemento que navega, ex.: <Link to="/" />. Ganha de `href`. */
  render?: ReactElement
  href?: string
  onClick?: () => void
}

export interface StatusPageProps {
  kind: StatusPageKind
  /** O produto na legenda: "code" vira "muriki / code". */
  product: string
  /** O logo do topo, normalmente <MurikiLogo />. */
  logo?: ReactNode
  /** Idioma e tema, à direita no topo. */
  utilities?: ReactNode
  /** O email da conta, depois de um filete. Sem conta (sessão expirada), não passe. */
  account?: ReactNode
  /** A ação principal: o botão com a seta. */
  action?: StatusPageAction
  /** A saída ao lado, sem peso: "Voltar", "Ir para o início". */
  secondaryAction?: StatusPageAction
  /** A linha de baixo: o endereço que falhou, o código do erro, o status dos serviços. */
  note?: ReactNode
  /** Troca os textos do i18n. */
  label?: string
  title?: [ReactNode, ReactNode]
  description?: ReactNode
  className?: string
}

export function StatusPage({
  kind,
  product,
  logo,
  utilities,
  account,
  action,
  secondaryAction,
  note,
  label,
  title,
  description,
  className,
}: StatusPageProps) {
  const t = useTranslate()
  const pagina = PAGINAS[kind]
  const k = `status_page.${pagina.chave}`
  const [linhaA, linhaB] = title ?? [t(`${k}.title_a`), t(`${k}.title_b`)]
  // sem internet já traz a nota de que a página volta sozinha
  const nota =
    note ??
    (kind === "offline" ? (
      <>
        <ClockIcon aria-hidden className="size-3.5" />
        {t("status_page.offline.note")}
      </>
    ) : null)

  return (
    <div className={cn("relative flex min-h-svh flex-col overflow-hidden bg-background", className)}>
      <Atmosfera />

      <header className="relative z-10 flex h-[72px] shrink-0 items-center gap-3 px-6 md:px-14">
        {logo ? <span className="flex size-8 [&>*]:size-full">{logo}</span> : null}
        <Legenda>{`muriki / ${product}`}</Legenda>
        <div className="ml-auto flex items-center gap-1">
          {utilities}
          {account ? (
            <>
              <span aria-hidden className="mx-2.5 hidden h-5 w-px bg-input sm:block" />
              <span className="hidden truncate text-[13px] text-muted-foreground sm:block">{account}</span>
            </>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 grid flex-1 grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-[minmax(0,560px)_minmax(0,1fr)] md:py-0 md:pr-16 md:pl-[120px]">
        <div className="order-2 flex min-w-0 flex-col gap-6 md:order-1">
          <div className="flex items-center gap-3">
            <Legenda largo>{label ?? t(`${k}.label`)}</Legenda>
            <span aria-hidden className="h-px w-16 bg-primary" />
          </div>
          <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.03em] text-foreground-strong md:text-[72px]">
            {linhaA}
            <br />
            <span className="text-primary">{linhaB}</span>
          </h1>
          <p className="max-w-[440px] text-[17px] leading-[1.6] text-muted-foreground">
            {description ?? t(`${k}.description`)}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
            <Acao acao={action} rotulo={t(`${k}.action`)} principal />
            {secondaryAction ? <Acao acao={secondaryAction} rotulo={t(`${k}.secondary`)} /> : null}
          </div>
          {nota ? <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">{nota}</div> : null}
        </div>

        <div className="order-1 flex min-w-0 justify-center md:order-2">
          <Palco codigo={pagina.codigo} cara={pagina.cara} />
        </div>
      </main>

      <footer className="relative z-10 flex h-16 shrink-0 items-center px-6 md:px-14">
        <Legenda>{`© ${new Date().getFullYear()} Muriki`}</Legenda>
      </footer>
    </div>
  )
}

function Palco({ codigo, cara }: { codigo: string; cara: StatusMascotFace }) {
  // O mascote entra no lugar do primeiro 0 (ou O). Tudo em em: o tamanho do palco é o
  // font-size, e dígitos e mascote crescem juntos com a tela.
  const i = codigo.includes("0") ? codigo.indexOf("0") : codigo.indexOf("O")
  return (
    <div
      aria-hidden
      className="flex items-end justify-center text-[clamp(120px,17vw,260px)] font-semibold tracking-[-0.04em] text-primary/20"
    >
      {Array.from(codigo).map((c, j) =>
        j === i ? (
          <StatusMascot key={j} face={cara} className="mx-[0.01em] h-[0.8em] w-[0.855em] -rotate-6" />
        ) : (
          <span key={j} className="h-[0.73em] leading-[0.73em]">
            {c}
          </span>
        )
      )}
    </div>
  )
}

function Acao({ acao, rotulo, principal = false }: { acao?: StatusPageAction; rotulo: string; principal?: boolean }) {
  const texto = acao?.label ?? rotulo
  const classe = principal
    ? "inline-flex h-12 items-center justify-between gap-7 rounded-[12px] bg-primary pr-2.5 pl-[22px] text-[15px] font-medium tracking-[0.02em] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
    : "inline-flex h-12 items-center rounded-[12px] px-4 text-[15px] font-medium text-foreground-strong outline-none transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/40"
  const conteudo = principal ? (
    <>
      {texto}
      <span className="flex size-[30px] items-center justify-center rounded-full bg-primary-foreground/15">
        <ArrowRightIcon aria-hidden className="size-3.5" data-motion="nudge" />
      </span>
    </>
  ) : (
    texto
  )
  const props = { className: classe, onClick: acao?.onClick, children: conteudo }
  if (acao?.render) return cloneElement(acao.render, props)
  if (acao?.href) return <a href={acao.href} {...props} />
  return <button type="button" {...props} />
}

function Legenda({ children, largo = false }: { children: ReactNode; largo?: boolean }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-medium text-muted-foreground uppercase",
        largo ? "tracking-[0.3em]" : "tracking-[0.25em]"
      )}
    >
      {children}
    </span>
  )
}

function Atmosfera() {
  // o degradê do login: o azul no canto de cima, o amarelo embaixo
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent via-45% to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-30 size-[620px] rounded-full bg-primary/18 blur-[170px]" />
      <div aria-hidden className="pointer-events-none absolute -right-30 -bottom-44 size-[560px] rounded-full bg-accent/26 blur-[140px]" />
    </>
  )
}
