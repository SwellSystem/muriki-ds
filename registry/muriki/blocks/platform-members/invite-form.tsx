"use client"

/**
 * Convidar pessoas para o workspace (CA8): o desenho aprovado em 2026-10-12 (o OnboardingConvidar
 * do canvas).
 *
 * InviteForm: um campo "E-mails" com "Adicionar" e, logo abaixo, a lista de quem vai ser convidado.
 * - O campo aceita colar vários de uma vez (vírgula, ponto e vírgula, espaço ou linha) e o "Nome
 *   <email>" dos clientes de e-mail (`parseInviteEmails`); colar substitui o trecho selecionado.
 *   Enter, vírgula e espaço também adicionam. O repetido não entra de novo.
 * - A lista tem no máximo `INVITE_MAX_ROWS` (20, os convites por hora que a API aceita); o
 *   excedente não entra, e um aviso diz quantos ficaram de fora.
 * - A lista é de verdade: uma linha por pessoa, com a inicial e o anel tracejado de pendente, o
 *   e-mail, o papel e o ×. O papel é limitado pelo de quem convida (`invitableRoles`: nunca owner) e
 *   começa em Member; a linha que chega com um papel que quem vê não pode dar aparece e vai como
 *   Member (`normalizeInviteRows`). O e-mail inválido e o erro da API na linha (`rowErrors`) ficam
 *   na própria linha, em vermelho, sem papel, e não vão no envio. A lista rola por dentro, com
 *   altura máxima (`listClassName`). Tirar uma linha leva o foco para a próxima (ou para o campo).
 * - Com `limit` (o plano limita: `used` são os ativos mais os convites pendentes, como a API conta
 *   no MEMBER_LIMIT_REACHED), passar do limite mostra o aviso e desliga o envio.
 * - O que está digitado no campo e ainda não virou linha conta: no "Convidar N pessoas", no botão
 *   e no envio. Depois do envio o campo limpa.
 * - Quem vê é member ou guest: não convida ninguém, e o formulário não aparece (devolve `null`).
 * - O envio manda só as linhas que vão (`inviteRowsToSend`). Sem `footer`, o botão é "Convidar N
 *   pessoas"; o passo do primeiro acesso passa o próprio pé (o cartão de pessoas e o "Pular por
 *   agora"), como função que recebe a contagem e se o envio está desligado.
 *
 * As linhas são do app (`rows` + `onRowsChange`): o passo do primeiro acesso as mostra também na
 * prévia e no cartão de pessoas. O que ainda está no campo é do componente.
 *
 * SeatsPreview: o cartão de pessoas no plano. "N pessoas no <workspace> · você + M", a régua com os
 * lugares do limite (`freeLimit`, o mesmo do Free e do plano pago no workspace de empresa, lido do
 * plano), um por pessoa e os vagos tracejados, e a frase. Com `trialDays`, "N dias de <plano> grátis",
 * que depois do teste as pessoas cabem no Free e a conta para seguir no plano pago; sem (o workspace
 * nasceu no Free, porque o trial é um por pessoa), nada de grátis: só que cabem no Free. Acima do
 * limite, o time precisa do Enterprise. O preço vem do app (F12): o componente só formata e multiplica
 * pelo número de pessoas para mostrar o total previsto. O assento só conta quem aceitar o convite.
 * Sem ninguém em `people`, só a régua e a faixa, sem a frase. Com o limite acima dos 10 lugares da
 * régua, quem não cabe vira "+N" e, enquanto houver vaga, o último lugar fica vago.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { EnvelopeSimpleIcon, PlusIcon, WarningIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldHeader, FieldLabel } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  INVITE_MAX_ROWS,
  invitableRoles,
  inviteRowsToSend,
  isInviteEmail,
  normalizeInviteRows,
  parseInviteEmails,
  type WorkspaceRole,
} from "./roles"

export interface InviteRow {
  email: string
  role: WorkspaceRole
}

/** O que o pé do formulário precisa saber para o botão de enviar. */
export interface InviteFormFooterState {
  /** Quantas pessoas vão no envio (as linhas que vão e o e-mail válido ainda no campo). */
  count: number
  /** O envio está desligado: ninguém para convidar, passou do limite ou enviando. */
  disabled: boolean
}

export interface InviteFormProps {
  rows: InviteRow[]
  onRowsChange: (rows: InviteRow[]) => void
  /** O papel de quem convida: limita os papéis das linhas (F6). Member e guest: o formulário não aparece. */
  viewerRole: WorkspaceRole
  /** Recebe só as linhas que vão: o e-mail no formato, sem erro na linha e o papel saneado. */
  onSubmit: (rows: InviteRow[]) => void
  /**
   * O limite de pessoas do plano, só quando o plano limita (Free sem trial): `max` no plano e
   * `used` = ativos + convites pendentes, da API (não o tamanho da página de membros).
   */
  limit?: { max: number; used: number }
  /** O erro da API em cada linha, pelo e-mail em minúsculas, já traduzido (ex.: 409 ALREADY_MEMBER). */
  rowErrors?: Record<string, ReactNode>
  submitting?: boolean
  /** O erro do envio, já traduzido pelo app. */
  error?: ReactNode
  /**
   * O pé do formulário, no lugar do botão "Convidar N pessoas". Um botão `type="submit"` nele envia.
   * Como função, recebe a contagem e se o envio está desligado.
   */
  footer?: ReactNode | ((state: InviteFormFooterState) => ReactNode)
  /** A altura máxima da lista (ela rola por dentro). Padrão: `max-h-60`. */
  listClassName?: string
  className?: string
}

const SEPARADOR = /[\s,;]/
const SEPARADORES = new Set([",", ";", " ", "\t", "\n", "\r"])

/** As linhas que serão enviadas: o e-mail no formato. */
export function validInviteRows(rows: InviteRow[]) {
  return rows.filter((r) => isInviteEmail(r.email))
}

export function InviteForm({
  rows,
  onRowsChange,
  viewerRole,
  onSubmit,
  limit,
  rowErrors,
  submitting = false,
  error,
  footer,
  listClassName,
  className,
}: InviteFormProps) {
  const t = useTranslate()
  const id = useId()
  const [rascunho, setRascunho] = useState("")
  // quantos e-mails ficaram de fora do teto na última vez que algo entrou
  const [deFora, setDeFora] = useState(0)
  const campo = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  // a linha que recebe o foco depois de tirar uma: a que ocupou o lugar dela
  const focarLinha = useRef<number | null>(null)

  useEffect(() => {
    const i = focarLinha.current
    if (i === null) return
    focarLinha.current = null
    const botoes = lista.current?.querySelectorAll<HTMLButtonElement>('[data-slot="invite-row-remove"]')
    ;(botoes?.[i] ?? campo.current)?.focus()
  }, [rows])

  const papeis = invitableRoles(viewerRole)
  // member e guest não convidam ninguém
  if (papeis.length === 0) return null
  const padrao: WorkspaceRole = papeis.includes("member") ? "member" : papeis[0]

  // junta o texto às linhas, sem repetir e-mail que já está na lista e até o teto
  function juntar(texto: string): { linhas: InviteRow[]; fora: number } {
    const ja = new Set(rows.map((r) => r.email))
    const novas = parseInviteEmails(texto).filter((email) => !ja.has(email))
    const cabem = Math.max(INVITE_MAX_ROWS - rows.length, 0)
    const entram = novas.slice(0, cabem)
    return {
      linhas: entram.length > 0 ? [...rows, ...entram.map((email) => ({ email, role: padrao }))] : rows,
      fora: novas.length - entram.length,
    }
  }

  // o e-mail ainda no campo entra na conta do botão, como se já fosse linha
  const previstas = rascunho.trim() ? juntar(rascunho).linhas : rows
  const envio = inviteRowsToSend(previstas, viewerRole, rowErrors)
  const vaga = limit ? Math.max(limit.max - limit.used, 0) : Infinity
  const passou = envio.length > vaga
  const pronto = envio.length > 0 && !passou

  function adicionar(texto: string) {
    const { linhas, fora } = juntar(texto)
    if (linhas !== rows) onRowsChange(linhas)
    setDeFora(fora)
    setRascunho("")
  }

  // digitou um separador: o que vem antes vira linha, o resto fica no campo
  function mudar(valor: string) {
    let ultimo = valor.length - 1
    while (ultimo >= 0 && !SEPARADORES.has(valor[ultimo])) ultimo--
    if (ultimo < 0) return setRascunho(valor)
    const { linhas, fora } = juntar(valor.slice(0, ultimo))
    if (linhas !== rows) onRowsChange(linhas)
    setDeFora(fora)
    setRascunho(valor.slice(ultimo + 1))
  }

  function colar(event: ClipboardEvent<HTMLInputElement>) {
    // o campo de uma linha engole as quebras do texto colado: a lista vem do texto do clipboard
    const texto = event.clipboardData.getData("text")
    if (!SEPARADOR.test(texto.trim())) return
    event.preventDefault()
    // o colado entra no lugar da seleção, como no colar de sempre
    const { selectionStart, selectionEnd } = event.currentTarget
    adicionar(rascunho.slice(0, selectionStart ?? rascunho.length) + texto + rascunho.slice(selectionEnd ?? rascunho.length))
  }

  function tecla(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    adicionar(rascunho)
  }

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    // o que ficou no campo também conta; o campo limpa mesmo quando repetia uma linha
    let todas = rows
    if (rascunho.trim()) {
      const junta = juntar(rascunho)
      todas = junta.linhas
      setDeFora(junta.fora)
      if (todas !== rows) onRowsChange(todas)
    }
    setRascunho("")
    const linhas = inviteRowsToSend(todas, viewerRole, rowErrors)
    if (linhas.length > 0 && linhas.length <= vaga) onSubmit(linhas)
  }

  const trocarPapel = (i: number, role: WorkspaceRole) => onRowsChange(rows.map((r, j) => (j === i ? { ...r, role } : r)))
  const tirar = (i: number) => {
    focarLinha.current = i
    setDeFora(0)
    onRowsChange(rows.filter((_, j) => j !== i))
  }
  const nomePapel = (r: WorkspaceRole) => t(`platform.members.role.${r}`)
  // o papel que a linha mostra e leva: o que quem vê pode dar
  const exibidas = normalizeInviteRows(rows, viewerRole)
  const estadoPe: InviteFormFooterState = { count: envio.length, disabled: !pronto || submitting }
  const aviso = "flex items-start gap-2 rounded-[10px] bg-tone-orange px-3 py-2.5 text-[13px] leading-[19px] text-tone-orange-foreground"

  return (
    <form onSubmit={enviar} noValidate data-slot="invite-form" className={cn("flex flex-col gap-3", className)}>
      <Field disabled={submitting}>
        <FieldHeader>
          <FieldLabel>{t("platform.members.invite.emails_label")}</FieldLabel>
          <FieldDescription className="text-[13px] leading-[14px]">{t("platform.members.invite.emails_hint")}</FieldDescription>
        </FieldHeader>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <InputGroup
            ref={campo}
            size="touch"
            start={<EnvelopeSimpleIcon aria-hidden />}
            value={rascunho}
            onChange={(e) => mudar(e.target.value)}
            onPaste={colar}
            onKeyDown={tecla}
            type="text"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            placeholder={t("platform.members.invite.emails_placeholder")}
          />
          <Button type="button" variant="outline" size="touch" onClick={() => adicionar(rascunho)} disabled={submitting} className="px-4">
            <PlusIcon aria-hidden className="size-3.5" />
            {t("platform.members.invite.add")}
          </Button>
        </div>
      </Field>

      {exibidas.length > 0 ? (
        <ul
          ref={lista}
          aria-label={t("platform.members.invite.list_label")}
          className={cn(
            "muriki-scroll flex flex-col overflow-y-auto rounded-[12px] bg-card shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]",
            listClassName ?? "max-h-60"
          )}
        >
          {exibidas.map((r, i) => {
            const valido = isInviteEmail(r.email)
            const problema = valido ? rowErrors?.[r.email] : t("platform.members.invite.invalid")
            const idErro = `${id}-erro-${i}`
            return (
              <li
                key={r.email}
                className={cn(
                  "grid h-12 shrink-0 grid-cols-[1.75rem_minmax(0,1fr)_8rem_1.75rem] items-center gap-3 pr-2 pl-3",
                  i > 0 && "shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]",
                  problema && "bg-destructive/[0.08]"
                )}
              >
                {problema ? (
                  <span
                    aria-hidden
                    className="flex size-[26px] items-center justify-center rounded-full text-destructive outline-[1.5px] outline-offset-2 outline-destructive/60 outline-dashed"
                  >
                    <WarningIcon className="size-[13px]" />
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="flex size-[26px] items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] text-[11px] font-semibold text-primary-subtle-foreground uppercase outline-[1.5px] outline-offset-2 outline-primary/55 outline-dashed"
                  >
                    {r.email[0]}
                  </span>
                )}
                <span className={cn("truncate text-[14.5px]", problema ? "font-medium text-destructive" : "text-foreground-strong")}>
                  {r.email}
                </span>
                {problema ? (
                  <span id={idErro} className="text-[13px] leading-4 text-balance text-destructive">
                    {problema}
                  </span>
                ) : (
                  <Select
                    value={r.role}
                    items={papeis.map((p) => ({ value: p, label: nomePapel(p) }))}
                    onValueChange={(p) => p && trocarPapel(i, p)}
                    disabled={submitting}
                  >
                    <SelectTrigger aria-label={t("platform.members.invite.role_aria", { email: r.email })}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {papeis.map((p) => (
                        <SelectItem key={p} value={p}>
                          {nomePapel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  data-slot="invite-row-remove"
                  aria-label={t("platform.members.invite.remove", { email: r.email })}
                  aria-describedby={problema ? idErro : undefined}
                  onClick={() => tirar(i)}
                  disabled={submitting}
                  className={problema ? "text-destructive" : "text-muted-foreground"}
                >
                  <XIcon className="size-[13px]" />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {/* a região viva fica sempre montada (o leitor de tela só anuncia o que muda nela); vazia, não ocupa o espaço entre os blocos */}
      <div role="status" className="flex flex-col gap-3 empty:-mt-3">
        {passou && limit ? (
          <p className={aviso}>
            <WarningIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {vaga <= 0
                ? t("platform.members.invite.limit_full", { max: limit.max })
                : t("platform.members.invite.limit", { max: limit.max, free: vaga, count: envio.length - vaga })}
            </span>
          </p>
        ) : null}
        {deFora > 0 ? (
          <p className={aviso}>
            <WarningIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>{t("platform.members.invite.max_rows", { max: INVITE_MAX_ROWS, count: deFora })}</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-[13px] leading-[19px] text-destructive">
          {error}
        </p>
      ) : null}

      {typeof footer === "function"
        ? footer(estadoPe)
        : (footer ?? (
            <div className="flex justify-end pt-1">
              <Button type="submit" variant="solid" disabled={estadoPe.disabled} loading={submitting}>
                {t("platform.members.invite.submit", { count: envio.length })}
              </Button>
            </div>
          ))}
    </form>
  )
}

// ── O cartão de pessoas no plano ────────────────────────────────────────

export interface SeatsPreviewProps {
  workspaceName: string
  /** Quem vai contar, você primeiro (as iniciais da régua saem do nome). */
  people: { name: string }[]
  /**
   * Até quantas pessoas o workspace cabe no Free e no plano pago (`platform.max_members`, do admin; 5
   * hoje). É o número de lugares da régua.
   */
  freeLimit: number
  /** O nome do plano pago do teste e da conta, ex.: "Pro". */
  planName: string
  /** O preço do plano pago por pessoa por mês, do app (F12). */
  pricePerSeat: { amountInCents: number; currency: string }
  /**
   * Os dias de teste do plano pago. Sem (`undefined` ou `null`): o workspace nasceu no Free, sem trial
   * (o trial é um por pessoa, R12), e o cartão não promete nada grátis.
   */
  trialDays?: number | null
  locale: string
  className?: string
}

// quantos lugares a régua desenha no máximo; acima, o último vira "+N"
const LUGARES_MAX = 10

/** O valor em centavos na moeda, sem casas quando é inteiro ("R$ 29", "US$ 16,50"). Só formata (F12). */
export function formatSeatPrice(amountInCents: number, currency: string, locale: string) {
  const casas = amountInCents % 100 === 0 ? 0 : 2
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(amountInCents / 100)
}

export function SeatsPreview({
  workspaceName,
  people,
  freeLimit,
  planName,
  pricePerSeat,
  trialDays,
  locale,
  className,
}: SeatsPreviewProps) {
  const t = useTranslate()
  const total = people.length
  const passa = total > freeLimit
  // a régua tem os lugares do limite (ou as pessoas, se passarem dele), até LUGARES_MAX; quem não cabe
  // no desenho vira o "+N". Enquanto houver vaga no limite, o último lugar fica vago: com o limite
  // acima de LUGARES_MAX, a régua nunca parece lotada com vaga sobrando
  const lugares = Math.min(Math.max(freeLimit, total), LUGARES_MAX)
  const espaco = total < freeLimit ? lugares - 1 : lugares
  const transborda = total > espaco
  const desenhadas = transborda ? people.slice(0, espaco - 1) : people
  const vagos = lugares - desenhadas.length - (transborda ? 1 : 0)
  const preco = (centavos: number) => formatSeatPrice(centavos, pricePerSeat.currency, locale)
  const totalMes = t("platform.members.seats.per_month", { price: preco(pricePerSeat.amountInCents * total) })

  const lugar = (nome: string, i: number) => (
    <span key={i} className="flex h-8 flex-1 items-center justify-center">
      <span
        className={cn(
          "flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold uppercase",
          i === 0 ? "bg-primary text-primary-foreground" : "bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] text-primary-subtle-foreground"
        )}
      >
        {[...nome.trim()][0]}
      </span>
    </span>
  )
  const vazio = (i: number) => (
    <span key={`v${i}`} className="flex h-8 flex-1 items-center justify-center">
      <span className="size-[22px] rounded-full border-[1.5px] border-dashed border-input" />
    </span>
  )

  return (
    // sem região viva: o cartão muda a cada linha, e o botão "Convidar N pessoas" já diz a contagem
    <div
      data-slot="seats-preview"
      className={cn(
        "flex flex-col gap-2.5 rounded-[12px] bg-card px-3.5 pt-3 pb-3.5 shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[14.5px] leading-5 font-semibold text-foreground-strong">
          {t("platform.members.seats.title", { count: total, workspace: workspaceName })}
        </span>
        {/* "você + N" só com você na lista: sem ninguém, não há o que contar */}
        {total > 0 ? (
          <span className="shrink-0 text-[13px] text-muted-foreground">{t("platform.members.seats.count", { count: total - 1 })}</span>
        ) : null}
      </div>

      {/* a régua: um lugar por pessoa, na faixa azul do plano, e os lugares vagos tracejados */}
      <div aria-hidden className="flex min-w-0 flex-col gap-[5px]">
        <div className="flex rounded-[9px] bg-primary/12 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
          {desenhadas.map((p, i) => lugar(p.name, i))}
          {transborda ? (
            <span className="flex h-8 flex-1 items-center justify-center text-[11px] font-semibold text-primary-subtle-foreground tabular-nums">
              +{total - desenhadas.length}
            </span>
          ) : null}
          {Array.from({ length: vagos }, (_, i) => vazio(i))}
        </div>
        <span className="text-[12px] leading-4 font-medium text-primary-subtle-foreground">
          {t("platform.members.seats.zone", { max: freeLimit, plan: planName })}
        </span>
      </div>

      {/* sem ninguém, só a faixa: a frase de preço sairia "1 × R$ 29 = R$ 0" */}
      {total < 1 ? null : (
        <p className="text-[13px] leading-[19px] text-foreground">
          {passa
            ? t("platform.members.seats.over_limit", { max: freeLimit, count: total, plan: planName })
            : trialDays
              ? t("platform.members.seats.price", {
                  trial: trialDays,
                  plan: planName,
                  count: total,
                  price: preco(pricePerSeat.amountInCents),
                  total: totalMes,
                })
              : t("platform.members.seats.price_no_trial", { max: freeLimit })}
        </p>
      )}
    </div>
  )
}
