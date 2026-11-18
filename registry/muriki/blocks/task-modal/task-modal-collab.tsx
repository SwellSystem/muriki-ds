"use client"

// A colaboração da task, embaixo do detalhe (direção D aprovada em
// prototipos/tarefa-v2): duas abas, Conversa e Histórico.
//
// A Conversa só tem comentários; os eventos (criou, mudou o status) ficam no
// Histórico, pequenos e cinzas, e eventos seguidos da mesma pessoa viram
// "Ana fez 3 alterações", que abre e fecha — dez linhas de "mudou o prazo"
// não empurram a conversa para longe.
//
// Task pessoal (só a pessoa vê): a aba vira Notas, o campo pede "Anotar…" e
// somem @menção, reações e respostas. Mencionar avisaria alguém sobre algo
// que essa pessoa não consegue abrir.
//
// Apresentacional como o resto do bloco: quem guarda e envia é o consumidor
// (`onComment`, `onReply`, `onReact`). Sem `onComment` não há campo.
import {
  ArrowBendUpLeft,
  At,
  CaretRight,
  ChatCircle,
  ClockCounterClockwise,
  PaperPlaneRight,
  PencilSimple,
  Smiley,
} from "@phosphor-icons/react"
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import type {
  TaskModalActivity,
  TaskModalComment,
  TaskModalEvent,
  TaskModalPersonOption,
} from "./task-modal-types"

const EMOJIS = ["👍", "🎯", "🎉", "❤️", "👀", "🙏"]

export interface TaskModalCollabProps {
  activity: TaskModalActivity[]
  /** Quem pode ser mencionado com @ (e cujos nomes ficam destacados). */
  people?: TaskModalPersonOption[]
  /** Nome de quem está usando: marca a própria reação e o "Você" na menção. */
  me?: string
  /** Task pessoal: Notas, sem menção, reações nem respostas. */
  personal?: boolean
  onComment?: (text: string) => void
  onReply?: (commentId: string, text: string) => void
  onReact?: (commentId: string, emoji: string) => void
}

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase()

function Pessoa({ nome, pequena = false }: { nome: string; pequena?: boolean }) {
  return (
    <Avatar size="sm" className={pequena ? "size-5" : undefined}>
      <AvatarFallback className="bg-primary-subtle text-[9px] font-semibold text-primary-subtle-foreground">
        {iniciais(nome)}
      </AvatarFallback>
    </Avatar>
  )
}

function Acao({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            onClick={onClick}
            className="text-muted-foreground"
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Nomes (inteiros e primeiro nome) que viram destaque depois de um @. */
function regexDeMencao(people: TaskModalPersonOption[]) {
  const nomes = [
    ...new Set(people.flatMap((p) => [p.name, p.name.split(" ")[0] ?? ""])),
  ]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  return nomes.length ? new RegExp(`(@(?:${nomes.join("|")}))`, "g") : null
}

function textoRico(texto: string, re: RegExp | null) {
  if (re === null) return texto
  return texto.split(re).map((parte, i) =>
    i % 2 ? (
      <span
        key={i}
        className="-mx-px rounded-[5px] bg-primary-subtle px-[3px] font-medium text-primary-subtle-foreground"
      >
        {parte}
      </span>
    ) : (
      parte
    )
  )
}

// ── campo de comentário ────────────────────────────────────────────────────
function Composer({
  people,
  me,
  semMencao = false,
  placeholder,
  autoFocus = false,
  onSend,
  onCancel,
}: {
  people: TaskModalPersonOption[]
  me?: string
  semMencao?: boolean
  placeholder: string
  autoFocus?: boolean
  onSend: (text: string) => void
  onCancel?: () => void
}) {
  const t = useTranslate()
  const [texto, setTexto] = useState("")
  const [ativo, setAtivo] = useState(0)
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (el === null) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [texto])

  // A lista abre enquanto a última palavra começa com @.
  const busca = semMencao ? null : /(^|\s)@([\wÀ-ú]*)$/.exec(texto)?.[2]
  const q = busca?.toLowerCase()
  const lista =
    q === undefined
      ? []
      : people
          .filter((p) => {
            const n = p.name.toLowerCase()
            return n.startsWith(q) || n.includes(` ${q}`)
          })
          .slice(0, 6)

  const escolher = (p: TaskModalPersonOption) => {
    setTexto(texto.replace(/@([\wÀ-ú]*)$/, `@${p.name.split(" ")[0]} `))
    setAtivo(0)
    ref.current?.focus()
  }
  const enviar = () => {
    const x = texto.trim()
    if (!x) return
    onSend(x)
    setTexto("")
  }

  return (
    <div className="relative grid gap-1.5 rounded-[14px] bg-card py-2 pr-2 pl-3 shadow-[inset_0_0_0_1px_var(--input),var(--shadow-xs)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_var(--primary),0_0_0_3px_color-mix(in_oklch,var(--primary)_14%,transparent)]">
      {lista.length > 0 && (
        <div
          role="listbox"
          aria-label={t("task_modal.collab.mention")}
          className="muriki-task-in absolute bottom-[calc(100%+6px)] left-2 z-10 min-w-[220px] rounded-xl bg-popover p-1 shadow-[var(--float-strong)]"
        >
          {lista.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={i === ativo}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => escolher(p)}
              className={cn(
                "flex h-[34px] w-full items-center gap-2 rounded-lg px-2 text-left text-[13.5px] hover:bg-secondary",
                i === ativo && "bg-secondary"
              )}
            >
              <Pessoa nome={p.name} pequena />
              {p.name}
              {p.name === me && (
                <small className="ml-auto text-xs text-muted-foreground">
                  {t("task_modal.collab.you")}
                </small>
              )}
            </button>
          ))}
        </div>
      )}
      <textarea
        ref={ref}
        rows={1}
        value={texto}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => {
          setTexto(event.currentTarget.value)
          setAtivo(0)
        }}
        onKeyDown={(event) => {
          if (lista.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault()
            const passo = event.key === "ArrowDown" ? 1 : -1
            setAtivo((ativo + passo + lista.length) % lista.length)
            return
          }
          if (lista.length && (event.key === "Enter" || event.key === "Tab")) {
            event.preventDefault()
            const p = lista[ativo]
            if (p) escolher(p)
            return
          }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            // Para aqui: o ⌘↵ do modal é "criar task", não "enviar comentário".
            event.preventDefault()
            event.stopPropagation()
            enviar()
          }
          if (event.key === "Escape" && onCancel) {
            event.stopPropagation()
            onCancel()
          }
        }}
        className="max-h-40 min-h-[22px] w-full resize-none overflow-y-auto bg-transparent pt-1 text-sm leading-[21px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-0.5">
        {!semMencao && (
          <Acao
            label={t("task_modal.collab.mention")}
            onClick={() => {
              setTexto(texto + (texto && !/\s$/.test(texto) ? " @" : "@"))
              ref.current?.focus()
            }}
          >
            <At />
          </Acao>
        )}
        <span className="mr-2 ml-auto text-[11.5px] text-muted-foreground">
          {onCancel
            ? t("task_modal.collab.hint_reply")
            : t("task_modal.collab.hint")}
        </span>
        <button
          type="button"
          aria-label={t("task_modal.collab.send")}
          disabled={!texto.trim()}
          onClick={enviar}
          className="grid size-[30px] place-items-center rounded-[9px] bg-primary text-primary-foreground transition-[opacity,transform] outline-none not-disabled:hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-35"
        >
          <PaperPlaneRight weight="fill" className="size-[15px]" />
        </button>
      </div>
    </div>
  )
}

// ── comentário ─────────────────────────────────────────────────────────────
function Comentario({
  c,
  me,
  re,
  people,
  aninhado = false,
  onReply,
  onReact,
}: {
  c: TaskModalComment
  me?: string
  re: RegExp | null
  people: TaskModalPersonOption[]
  aninhado?: boolean
  onReply?: (commentId: string, text: string) => void
  onReact?: (commentId: string, emoji: string) => void
}) {
  const t = useTranslate()
  const [emojis, setEmojis] = useState(false)
  const [respondendo, setRespondendo] = useState(false)
  const reacoes = Object.entries(c.reactions ?? {}).filter(([, quem]) => quem.length)
  const respostas = c.replies ?? []
  const podeResponder = !aninhado && onReply !== undefined
  const botaoResponder = (
    <button
      type="button"
      onClick={() => setRespondendo(true)}
      className="justify-self-start rounded-[5px] px-1 py-0.5 text-[12.5px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {t("task_modal.collab.reply")}
    </button>
  )

  return (
    <article
      aria-label={t("task_modal.collab.comment_by", { who: c.who })}
      className={cn(
        "group/cm relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-2.5 gap-y-1",
        aninhado ? "py-1.5" : "py-2.5"
      )}
    >
      <Pessoa nome={c.who} />
      <div className="flex min-w-0 items-baseline gap-2 text-[13px]">
        <b className="font-semibold text-foreground-strong">{c.who}</b>
        <time className="text-xs text-muted-foreground">{c.when}</time>
        {c.fresh && (
          <span className="font-mono text-[10px] font-semibold tracking-[.08em] text-primary uppercase">
            {t("task_modal.collab.new")}
          </span>
        )}
      </div>
      <p className="col-start-2 m-0 text-sm leading-[21px] [overflow-wrap:anywhere] whitespace-pre-wrap text-foreground">
        {textoRico(c.text, re)}
      </p>

      {(onReact || podeResponder) && (
        <div className="absolute top-1 right-0 flex gap-0.5 rounded-[9px] bg-card p-0.5 opacity-0 shadow-[inset_0_0_0_1px_var(--border),var(--shadow-sm)] transition-opacity group-hover/cm:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
          {onReact && (
            <Acao label={t("task_modal.collab.react")} onClick={() => setEmojis(!emojis)}>
              <Smiley />
            </Acao>
          )}
          {podeResponder && (
            <Acao label={t("task_modal.collab.reply")} onClick={() => setRespondendo(true)}>
              <ArrowBendUpLeft />
            </Acao>
          )}
        </div>
      )}
      {emojis && onReact && (
        <div
          role="menu"
          aria-label={t("task_modal.collab.reactions")}
          className="muriki-task-in absolute top-[34px] right-0 z-10 flex gap-0.5 rounded-xl bg-popover p-1 shadow-[var(--float-strong)]"
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              role="menuitem"
              aria-label={t("task_modal.collab.react_with", { emoji: e })}
              onClick={() => {
                onReact(c.id, e)
                setEmojis(false)
              }}
              className="grid size-[30px] place-items-center rounded-lg text-[17px] hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {(reacoes.length > 0 || (podeResponder && !respostas.length && !respondendo)) && (
        <div className="col-start-2 mt-1 flex flex-wrap items-center gap-1.5">
          {reacoes.map(([e, quem]) => {
            const minha = me !== undefined && quem.includes(me)
            return (
              <button
                key={e}
                type="button"
                aria-pressed={minha}
                title={quem.join(", ")}
                disabled={!onReact}
                onClick={() => onReact?.(c.id, e)}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full bg-secondary px-2 text-[12.5px] text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default",
                  minha &&
                    "bg-primary-subtle text-primary-subtle-foreground shadow-[inset_0_0_0_1px_var(--primary-subtle-border)]"
                )}
              >
                {e}
                <span>{quem.length}</span>
              </button>
            )
          })}
          {podeResponder && !respostas.length && !respondendo && botaoResponder}
        </div>
      )}

      {!aninhado && (respostas.length > 0 || respondendo) && (
        <div className="col-start-2 mt-1.5 grid gap-1.5 pl-3 shadow-[inset_2px_0_0_var(--border)]">
          {respostas.map((r) => (
            <Comentario
              key={r.id}
              c={r}
              me={me}
              re={re}
              people={people}
              aninhado
              onReact={onReact}
            />
          ))}
          {respondendo && onReply ? (
            <Composer
              people={people}
              me={me}
              autoFocus
              placeholder={t("task_modal.collab.reply_placeholder")}
              onSend={(x) => {
                onReply(c.id, x)
                setRespondendo(false)
              }}
              onCancel={() => setRespondendo(false)}
            />
          ) : (
            podeResponder && botaoResponder
          )}
        </div>
      )}
    </article>
  )
}

// ── histórico ──────────────────────────────────────────────────────────────
function Eventos({ grupo }: { grupo: TaskModalEvent[] }) {
  const t = useTranslate()
  const [aberto, setAberto] = useState(false)
  const linha = (e: TaskModalEvent, i: number) => (
    <div key={e.id ?? i} className="flex min-h-[30px] items-center gap-2.5 text-[12.5px] text-muted-foreground">
      <span className="grid w-7 shrink-0 place-items-center">
        <i className="size-1.5 rounded-full bg-[var(--input)]" />
      </span>
      <span>
        <b className="font-medium text-foreground">{e.who}</b> {e.text}
      </span>
      <time className="ml-auto text-xs whitespace-nowrap">{e.when}</time>
    </div>
  )
  const primeiro = grupo[0]
  const ultimo = grupo[grupo.length - 1]
  if (primeiro === undefined || ultimo === undefined) return null
  if (grupo.length === 1) return linha(primeiro, 0)
  return (
    <>
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        className="flex min-h-[30px] w-full items-center gap-2.5 rounded-md text-left text-[12.5px] text-muted-foreground hover:text-foreground-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="grid w-7 shrink-0 place-items-center">
          <CaretRight
            className={cn(
              "size-[13px] transition-transform duration-[250ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
              aberto && "rotate-90"
            )}
          />
        </span>
        <span>
          <b className="font-medium text-foreground">{primeiro.who}</b>{" "}
          {t("task_modal.collab.changes", { count: grupo.length })}
        </span>
        <time className="ml-auto text-xs whitespace-nowrap">{ultimo.when}</time>
      </button>
      {aberto && <div className="muriki-task-in grid">{grupo.map(linha)}</div>}
    </>
  )
}

export function TaskModalCollab({
  activity,
  people = [],
  me,
  personal = false,
  onComment,
  onReply,
  onReact,
}: TaskModalCollabProps) {
  const t = useTranslate()
  const re = useMemo(() => (personal ? null : regexDeMencao(people)), [people, personal])

  const comentarios = activity.filter(
    (a): a is { type: "comment" } & TaskModalComment => a.type === "comment"
  )
  const total = comentarios.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)
  // Eventos seguidos da mesma pessoa viram um grupo só.
  const grupos: TaskModalEvent[][] = []
  for (const a of activity) {
    if (a.type !== "event") continue
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo[0]?.who === a.who) ultimo.push(a)
    else grupos.push([a])
  }

  return (
    <section className="px-5 pt-4">
      <Tabs defaultValue="talk" className="gap-1.5">
        <TabsList aria-label={t("task_modal.collab.label")}>
          <TabsTrigger value="talk" className="gap-1.5">
            {personal ? <PencilSimple /> : <ChatCircle />}
            {personal ? t("task_modal.collab.notes") : t("task_modal.collab.talk")}
            {total > 0 && (
              <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-[5px] font-mono text-[10.5px] font-medium text-primary-foreground">
                {total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <ClockCounterClockwise />
            {t("task_modal.collab.history")}
          </TabsTrigger>
        </TabsList>

        <TabsPanel value="talk" className="muriki-task-in grid">
          {comentarios.length ? (
            comentarios.map((c) => (
              <Comentario
                key={c.id}
                c={c}
                me={me}
                re={re}
                people={people}
                onReply={personal ? undefined : onReply}
                onReact={personal ? undefined : onReact}
              />
            ))
          ) : (
            <p className="my-2 text-[13.5px] text-muted-foreground">
              {personal
                ? t("task_modal.collab.empty_notes")
                : t("task_modal.collab.empty_talk")}
            </p>
          )}
          {onComment && (
            // Preso embaixo da coluna enquanto a conversa rola por trás.
            <div className="sticky bottom-0 z-[2] bg-[linear-gradient(transparent,var(--popover)_14px)] pt-3 pb-1">
              <Composer
                people={people}
                me={me}
                semMencao={personal}
                placeholder={
                  personal
                    ? t("task_modal.collab.notes_placeholder")
                    : t("task_modal.collab.placeholder")
                }
                onSend={onComment}
              />
            </div>
          )}
        </TabsPanel>

        <TabsPanel value="history" className="muriki-task-in grid">
          {grupos.length ? (
            grupos.map((g, i) => <Eventos key={i} grupo={g} />)
          ) : (
            <p className="my-2 text-[13.5px] text-muted-foreground">
              {t("task_modal.collab.empty_history")}
            </p>
          )}
        </TabsPanel>
      </Tabs>
    </section>
  )
}
