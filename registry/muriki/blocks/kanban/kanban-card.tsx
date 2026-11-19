// Cartão do Kanban aprovado no Muriki DS (prototipos/kanban). O cartão diz
// de relance o que importa e nada além: status clicável (concluir é um
// clique, sem abrir nada), código e prioridade; o título em até três linhas;
// o PRÓXIMO PASSO com o anel das subtarefas, porque "2 de 4" sozinho não diz
// o que fazer agora; projeto e etiquetas; e no pé quem, quando e a conversa.
//
// Alerta é contorno + faixa embaixo, nunca fundo tingido: numa coluna de
// dez cartões, fundo vermelho vira mancha e o título some. Atrasada é
// vermelha, "vence hoje" é laranja com texto escuro (branco no laranja não
// lê) e bloqueada é listrada — a única que muda o fundo, de leve, porque
// bloqueio é estado e não prazo. Os seletores de alerta moram no campo `css`
// do item (`.muriki-kb-card[data-k]`): listra e sombra colorida não cabem
// bem em classe utilitária.
//
// API nova (troca o cartão editorial antigo): a tarefa usa `id`/`code`/
// `status` no lugar de `slug`/`statusId`, e `onComplete` no lugar de
// `onToggleDone` (concluir não desfaz por aqui; o Desfazer mora no aviso).
"use client"

import * as React from "react"
import {
  CalendarBlankIcon,
  ChatCircleIcon,
  ClockIcon,
  LockSimpleIcon,
  PaperclipIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PriorityFlag, type PriorityLevel } from "@/components/blocks/priority-flag/priority-flag"

/** Os seis status do DS. A coluna é um status; a cor vem dele. */
export type KanbanStatus = "backlog" | "todo" | "progress" | "review" | "done" | "canceled"

export interface KanbanTask {
  id: string | number
  /** Código curto ("APP-148"). Aparece em mono no topo e no aviso. */
  code?: string
  title: string
  /** id da coluna em que a tarefa está. */
  status: KanbanStatus
  priority?: PriorityLevel | "none"
  /** Nome de quem é responsável. */
  assignee?: string | null
  /** Com hora, o "vence hoje" diz a hora. */
  due?: Date | null
  /** id do projeto (em `projects`). */
  project?: string
  labels?: { label: string; tone?: BadgeTone }[]
  /** Subtarefas: [feitas, total]. */
  sub?: [number, number] | null
  /** Próxima subtarefa; aparece enquanto houver subtarefa aberta. */
  next?: string | null
  comments?: number
  attachments?: number
  /** Comentários novos para quem usa: o ícone fica cheio e azul. */
  unread?: boolean
  /** `by`: código da tarefa que bloqueia; `title`: o nome dela (se faltar, procura nas tarefas). */
  blocked?: { by?: string; title?: string } | null
}

export interface KanbanProject {
  id: string
  name: string
  tone?: BadgeTone
}

export type KanbanAlertKind = "overdue" | "today" | "blocked"
export interface KanbanAlert {
  k: KanbanAlertKind
  text: string
  sub?: string
}

const DIA = 864e5
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

/** Meio-dia de hoje: a conta de dias não pode depender da hora do prazo. */
export function kanbanNoon(now?: Date) {
  const d = new Date(now ?? Date.now())
  d.setHours(12, 0, 0, 0)
  return +d
}
function dias(d: Date, noon: number) {
  return Math.round((new Date(d).setHours(12, 0, 0, 0) - noon) / DIA)
}

/** O alerta do cartão, ou null. Fechada (concluída/cancelada) nunca alerta. */
export function kanbanAlert(t: KanbanTask, noon: number, tasks: readonly KanbanTask[]): KanbanAlert | null {
  if (t.status === "done" || t.status === "canceled") return null
  if (t.blocked) {
    const by = t.blocked.by
    const b = by ? tasks.find((x) => x.code === by) : undefined
    return { k: "blocked", text: by ? `Bloqueada por ${by}` : "Bloqueada", sub: t.blocked.title || b?.title || "" }
  }
  if (!t.due) return null
  const n = dias(t.due, noon)
  if (n < 0) return { k: "overdue", text: `Atrasada ${-n}${n === -1 ? " dia" : " dias"}` }
  if (n === 0) {
    const d = new Date(t.due)
    const hr = d.getHours()
    const mi = d.getMinutes()
    return { k: "today", text: "Vence hoje" + (hr || mi ? ` às ${hr}h${mi ? String(mi).padStart(2, "0") : ""}` : "") }
  }
  return null
}

/* ---------- ícone de status (a forma diz o estado; a cor só reforça) ---------- */
const STATUS_COR: Record<KanbanStatus, string> = {
  backlog: "var(--tone-gray-dot)",
  todo: "var(--tone-gray-foreground)",
  progress: "var(--tone-blue-dot)",
  review: "var(--tone-purple-dot)",
  done: "var(--tone-green-dot)",
  canceled: "var(--tone-gray-dot)",
}

export function KanbanStatusIcon({ status, size = 14, className }: { status: KanbanStatus; size?: number; className?: string }) {
  // o "corte" do check/x usa a cor de quem está atrás; o cartão sobrescreve
  const corte = "var(--kb-cut, var(--background))"
  const anel = <circle cx={7} cy={7} r={5.5} fill="none" stroke="currentColor" strokeWidth={1.5} />
  let forma: React.ReactNode = anel
  if (status === "backlog") forma = <circle cx={7} cy={7} r={5.5} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray="2.2 2" />
  if (status === "progress") forma = <>{anel}<path d="M7 3.5 A3.5 3.5 0 0 1 7 10.5 Z" fill="currentColor" /></>
  if (status === "review") forma = <>{anel}<path d="M7 7 L7 3.5 A3.5 3.5 0 1 1 3.5 7 Z" fill="currentColor" /></>
  if (status === "done")
    forma = <><circle cx={7} cy={7} r={6.25} fill="currentColor" /><path d="M4.4 7.2 L6.2 9 L9.6 5.4" fill="none" stroke={corte} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></>
  if (status === "canceled")
    forma = <><circle cx={7} cy={7} r={6.25} fill="currentColor" /><path d="M5 5 L9 9 M9 5 L5 9" fill="none" stroke={corte} strokeWidth={1.5} strokeLinecap="round" /></>
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} aria-hidden className={cn("block flex-none", className)} style={{ color: STATUS_COR[status] ?? STATUS_COR.todo }}>
      {forma}
    </svg>
  )
}

/* ---------- peças pequenas ---------- */
function Anel({ sub }: { sub: [number, number] }) {
  const r = 5.5
  const c = 2 * Math.PI * r
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden className="block flex-none -rotate-90">
      <circle cx={7} cy={7} r={r} fill="none" strokeWidth={2.2} className="stroke-[color-mix(in_oklch,var(--foreground)_14%,transparent)]" />
      <circle
        cx={7} cy={7} r={r} fill="none" strokeWidth={2.2} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - sub[0] / sub[1])}
        className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      />
    </svg>
  )
}

const TOM_AVATAR: BadgeTone[] = ["blue", "green", "purple", "orange", "cyan", "pink", "yellow", "red"]
function tomDe(nome: string) {
  let s = 0
  for (let i = 0; i < nome.length; i++) s = (s * 31 + nome.charCodeAt(i)) >>> 0
  return TOM_AVATAR[s % TOM_AVATAR.length]!
}
function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return "?"
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase()
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase()
}

/** Dica de um pedaço do cartão. */
function Dica({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("inline-flex", className)} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Prazo em chip: hoje laranja, amanhã amarelo, na semana neutro forte. */
function Prazo({ date, now, done }: { date: Date; now?: Date; done: boolean }) {
  const agora = now ?? new Date()
  const n = dias(date, kanbanNoon(agora))
  const estado = done ? "done" : n < 0 ? "overdue" : n === 0 ? "today" : n === 1 ? "tomorrow" : n <= 6 ? "week" : "later"
  let texto =
    n < 0
      ? n === -1 ? "Ontem" : estado === "overdue" ? `Atrasada ${-n} dias` : `${date.getDate()} ${MESES[date.getMonth()]}`
      : n === 0 ? "Hoje"
      : n === 1 ? "Amanhã"
      : n <= 6 ? SEMANA[date.getDay()]!.replace(/^./, (c) => c.toUpperCase())
      : `${date.getDate()} ${MESES[date.getMonth()]}${date.getFullYear() !== agora.getFullYear() ? ` ${date.getFullYear()}` : ""}`
  if ((date.getHours() || date.getMinutes()) && n >= 0 && n <= 1)
    texto += `, ${date.getHours()}${date.getMinutes() ? `:${String(date.getMinutes()).padStart(2, "0")}` : "h"}`
  return (
    <span
      data-state={estado}
      className={cn(
        "inline-flex h-[22px] items-center gap-[5px] rounded-[6px] pr-[7px] pl-1.5 text-xs leading-4 font-medium whitespace-nowrap text-muted-foreground tabular-nums",
        estado === "overdue" && "bg-tone-red text-tone-red-foreground",
        estado === "today" && "bg-tone-orange text-tone-orange-foreground",
        estado === "tomorrow" && "bg-tone-yellow text-tone-yellow-foreground",
        estado === "week" && "bg-muted text-foreground-strong",
        estado === "done" && "line-through"
      )}
    >
      {estado === "overdue" ? <WarningCircleIcon className="size-[13px]" /> : <CalendarBlankIcon className="size-[13px]" />}
      {texto}
    </span>
  )
}

const PRIORIDADE: Record<PriorityLevel, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" }
const ICONE_ALERTA = { overdue: WarningCircleIcon, today: ClockIcon, blocked: LockSimpleIcon }

export interface KanbanCardProps extends Omit<React.ComponentProps<"article">, "children"> {
  task: KanbanTask
  /** Calcule com `kanbanAlert`; o board já passa. */
  alert?: KanbanAlert | null
  project?: KanbanProject | null
  now?: Date
  /** Clique no status. Sem ele o status vira só ícone. */
  onComplete?: (task: KanbanTask) => void
}

export function KanbanCard({ task: t, alert: a = null, project: p = null, now, onComplete, className, ...rest }: KanbanCardProps) {
  const done = t.status === "done"
  const labels = t.labels ?? []
  const pri = t.priority && t.priority !== "none" ? t.priority : null
  const sub = t.sub
  const mostraProximo = !!(sub && t.next && sub[0] < sub[1] && !done)
  const AlertaIcone = a ? ICONE_ALERTA[a.k] : null
  return (
    <article
      data-slot="kanban-card"
      data-k={a?.k}
      data-done={done || undefined}
      className={cn(
        "muriki-kb-card relative grid flex-none cursor-pointer touch-none gap-2 overflow-hidden rounded-[12px] bg-card px-3 py-[11px] select-none [--kb-cut:var(--card)]",
        "shadow-[var(--kb-shadow-xs),inset_0_0_0_1px_var(--kb-hair)] transition-shadow duration-200 ease-[cubic-bezier(.16,1,.3,1)]",
        "hover:shadow-[var(--kb-shadow-sm),inset_0_0_0_1px_var(--kb-hair-strong)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...rest}
    >
      <div className="flex h-[18px] min-w-0 items-center gap-[7px]">
        {onComplete ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  key={t.status}
                  aria-label={done ? "Concluída" : `Concluir ${t.code || t.title}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete(t)
                  }}
                  className="-m-[3px] inline-grid size-[22px] flex-none cursor-pointer place-items-center rounded-[6px] text-inherit hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring [&_svg]:animate-[muriki-kb-swap_.4s_cubic-bezier(.16,1,.3,1)] motion-reduce:[&_svg]:animate-none"
                />
              }
            >
              <KanbanStatusIcon status={t.status} size={15} />
            </TooltipTrigger>
            <TooltipContent>{done ? "Concluída" : "Concluir"}</TooltipContent>
          </Tooltip>
        ) : (
          <KanbanStatusIcon status={t.status} size={15} />
        )}
        {t.code ? <span className="font-mono text-[11.5px] font-medium text-muted-foreground">{t.code}</span> : null}
        {pri ? (
          <Dica label={`Prioridade ${PRIORIDADE[pri]}`} className="ml-auto">
            <PriorityFlag level={pri} label="" className="[&_svg]:size-3.5" />
          </Dica>
        ) : null}
      </div>

      <h3
        className={cn(
          "m-0 line-clamp-3 text-[13.5px] leading-[19px] font-medium text-pretty text-foreground-strong",
          (done || a?.k === "blocked") && "text-muted-foreground"
        )}
      >
        {t.title}
      </h3>

      {mostraProximo && sub ? (
        <div
          className={cn(
            "-mx-0.5 flex min-w-0 items-center gap-[7px] rounded-lg px-2 py-1.5 text-xs text-foreground",
            a ? "bg-[color-mix(in_oklch,var(--card)_70%,transparent)]" : "bg-[color-mix(in_oklch,var(--muted)_70%,var(--card))]",
            a?.k === "blocked" && "text-muted-foreground"
          )}
        >
          <Anel sub={sub} />
          <span className="min-w-0 truncate">
            <em className="text-muted-foreground not-italic">Próximo: </em>
            {t.next}
          </span>
          <span className="ml-auto flex-none text-[11.5px] text-muted-foreground tabular-nums">
            {sub[0]} de {sub[1]}
          </span>
        </div>
      ) : null}

      {p || labels.length ? (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {p ? (
            <span className="inline-flex items-center gap-[5px] text-xs text-muted-foreground">
              <i className="size-[7px] rounded-[2px]" style={{ background: `var(--tone-${p.tone ?? "gray"}-dot)` }} />
              {p.name}
            </span>
          ) : null}
          {labels.map((l) => (
            <Badge key={l.label} tone={l.tone ?? "gray"} size="sm" className="h-5">
              {l.label}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex min-h-[22px] items-center gap-1.5">
        {t.assignee ? (
          <Dica label={t.assignee}>
            <Avatar size="sm" className="data-[size=sm]:size-5 after:hidden">
              <AvatarFallback
                className="text-[9px] font-semibold group-data-[size=sm]/avatar:text-[9px]"
                style={{ background: `var(--tone-${tomDe(t.assignee)})`, color: `var(--tone-${tomDe(t.assignee)}-foreground)` }}
              >
                {iniciais(t.assignee)}
              </AvatarFallback>
            </Avatar>
          </Dica>
        ) : (
          <Dica label="Sem responsável">
            <span className="inline-block size-5 rounded-full border-[1.5px] border-dashed border-[var(--kb-hair-strong)]" />
          </Dica>
        )}
        {t.due && !(a && (a.k === "overdue" || a.k === "today")) ? <Prazo date={new Date(t.due)} now={now} done={done} /> : null}
        <span className="ml-auto inline-flex items-center gap-2.5">
          {t.attachments ? (
            <Dica label={`${t.attachments} ${t.attachments > 1 ? "anexos" : "anexo"}`}>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <PaperclipIcon className="size-3.5" />
                {t.attachments}
              </span>
            </Dica>
          ) : null}
          {t.comments ? (
            <Dica label={`${t.comments} comentários${t.unread ? ", com novos para você" : ""}`}>
              <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", t.unread ? "text-primary" : "text-muted-foreground")}>
                <ChatCircleIcon className="size-3.5" weight={t.unread ? "fill" : "regular"} />
                {t.comments}
              </span>
            </Dica>
          ) : null}
        </span>
      </div>

      {a && AlertaIcone ? (
        <div data-k={a.k} className="muriki-kb-say -mx-3 mt-0.5 -mb-[11px] flex min-w-0 items-center gap-1.5 px-3 py-[7px] text-xs font-semibold">
          <AlertaIcone className="size-3.5 flex-none" weight="fill" />
          <span className="min-w-0 truncate">
            {a.text}
            {a.sub ? <em className="font-normal not-italic"> · {a.sub}</em> : null}
          </span>
        </div>
      ) : null}
    </article>
  )
}
