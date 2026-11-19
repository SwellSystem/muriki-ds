// O quadro aprovado no Muriki DS (prototipos/kanban), no lugar das
// colunas-bandeja do platform. Colunas sem caixa, só tingidas pela cor do
// status: o fio colorido embaixo do cabeçalho diz de que coluna é cada
// cartão mesmo com o nome fora da tela. O contador vira "n/limite" e fica
// laranja quando a coluna passa do limite — WIP estourado é aviso, não erro.
// O rodapé resume a coluna sem abrir nada: quantas, quanto das subtarefas
// já foi, e a barra no prazo · com alerta · sem prazo.
//
// Criar é no topo da coluna (o "+" do cabeçalho ou `add()` da barra): a
// tarefa nova nasce onde o olho já está, e Enter cria e continua.
//
// O quadro é controlado. As tarefas vêm de fora e cada gesto volta por
// callback: `onMove(id, status, index)` (use `placeTask` para aplicar),
// `onComplete`, `onOpen`, `onCreate`. Mover e concluir avisam com Desfazer
// pelo sonner — monte um `<Toaster />` na página.
//
// API nova (troca a do bloco antigo): `columns` é `{ id, label, limit? }`
// com `id` sendo um dos status do DS (a cor vem dele, não de `color`);
// `onTasksChange`/`onMoved` viram `onMove`, `onToggleDone` vira
// `onComplete`, `onAddCard` vira `onCreate(status, title)` e
// `onCardClick` vira `onOpen(id)`.
//
// Arrasto: @dnd-kit, como antes (teclado incluso: Espaço pega e solta).
// O cartão erguido inclina 1,6° com a sombra funda; no lugar dele fica o
// espaço tingido da coluna.
"use client"

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanIcon, PlusIcon, WarningCircleIcon } from "@phosphor-icons/react"
import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import {
  KanbanCard,
  KanbanStatusIcon,
  kanbanAlert,
  kanbanNoon,
  type KanbanProject,
  type KanbanStatus,
  type KanbanTask,
} from "./kanban-card"
import { moveTaskLocally, type KanbanColumnState } from "./kanban-drop"

export interface KanbanColumnSpec {
  id: KanbanStatus
  label: string
  /** Limite de tarefas: o contador vira "n/limite" e fica laranja quando passa. */
  limit?: number
}

export interface KanbanBoardProps {
  tasks: KanbanTask[]
  /** Padrão: os seis status do DS, na ordem. */
  columns?: KanbanColumnSpec[]
  projects?: KanbanProject[]
  /** Soltou o cartão: `index` é a posição na coluna de destino, sem contar a própria. O Desfazer chama de novo com a posição antiga. */
  onMove?: (taskId: KanbanTask["id"], toStatus: KanbanStatus, index: number) => void
  /** Clique no status do cartão. O Desfazer chama `onMove` com a coluna e a posição antigas. */
  onComplete?: (taskId: KanbanTask["id"]) => void
  /** Clique (sem arrastar) ou Enter no cartão. */
  onOpen?: (taskId: KanbanTask["id"]) => void
  /** Liga o "+" das colunas e a criação rápida no topo da coluna. */
  onCreate?: (status: KanbanStatus, title: string) => void
  title?: React.ReactNode
  /** Nós extras no fim da barra. Como função, recebe `add(status?)`, que abre a criação rápida. */
  toolbar?: React.ReactNode | ((api: { add: (status?: KanbanStatus) => void }) => React.ReactNode)
  now?: Date
  "aria-label"?: string
  className?: string
  style?: React.CSSProperties
}

const STATUS: KanbanColumnSpec[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "A fazer" },
  { id: "progress", label: "Em andamento" },
  { id: "review", label: "Em revisão" },
  { id: "done", label: "Concluído" },
  { id: "canceled", label: "Cancelado" },
]

const TOM: Record<KanbanStatus, BadgeTone> = {
  backlog: "gray",
  todo: "gray",
  progress: "blue",
  review: "purple",
  done: "green",
  canceled: "red",
}
const tomDaColuna = (id: KanbanStatus) =>
  ({ "--tone": `var(--tone-${TOM[id] ?? "gray"}-dot)`, "--tone-bg": `var(--tone-${TOM[id] ?? "gray"})` }) as React.CSSProperties

const rotulo = (t: KanbanTask) => (t.code ? `${t.code} · ` : "") + t.title

export function KanbanBoard({
  tasks,
  columns: colunasProp,
  projects = [],
  onMove,
  onComplete,
  onOpen,
  onCreate,
  title,
  toolbar,
  now,
  "aria-label": ariaLabel,
  className,
  style,
}: KanbanBoardProps) {
  const COLS = colunasProp ?? STATUS
  const noon = kanbanNoon(now)
  const alertaDe = (t: KanbanTask) => kanbanAlert(t, noon, tasks)
  const projetoDe = (id?: string) => projects.find((p) => p.id === id) ?? null
  const colunaDe = (id: KanbanStatus) => COLS.find((c) => c.id === id)

  const tasksRef = React.useRef(tasks)
  tasksRef.current = tasks
  const onMoveRef = React.useRef(onMove)
  onMoveRef.current = onMove

  const [criando, setCriando] = React.useState<KanbanStatus | null>(null)
  // a tarefa nova (onCreate) entra com desfoque: é a primeira que aparece na coluna depois do pedido
  const pedido = React.useRef<{ col: KanbanStatus; conhecidas: KanbanTask["id"][] } | null>(null)
  const nascida = React.useRef<KanbanTask["id"] | null>(null)
  if (pedido.current) {
    const nova = tasks.find((t) => t.status === pedido.current!.col && !pedido.current!.conhecidas.includes(t.id))
    if (nova) {
      nascida.current = nova.id
      pedido.current = null
    }
  }

  /* ---------- arrasto (@dnd-kit) ---------- */
  const colunas: KanbanColumnState[] = React.useMemo(
    () => COLS.map((c) => ({ id: c.id, tasks: tasks.filter((t) => t.status === c.id) })),
    [COLS, tasks]
  )
  const [local, setLocal] = React.useState(colunas)
  const [ativo, setAtivo] = React.useState<{ task: KanbanTask; h: number; w: number; from: KanbanStatus; fromIdx: number } | null>(null)
  React.useEffect(() => {
    if (!ativo) setLocal(colunas)
  }, [colunas, ativo])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    // Espaço pega e solta; Enter fica livre para abrir o cartão
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    })
  )
  // board com coluna vazia: ponteiro dentro primeiro, interseção de retângulos como reserva
  const colisao = React.useCallback<CollisionDetection>((args) => {
    const dentro = pointerWithin(args)
    if (dentro.length > 0) return dentro
    const inter = rectIntersection(args)
    return getFirstCollision(inter) ? inter : []
  }, [])

  const inicio = (e: DragStartEvent) => {
    const task = e.active.data.current?.task as KanbanTask | undefined
    if (!task) return
    // mede o próprio cartão: o rect do @dnd-kit ainda é nulo no início
    const r = document.querySelector(`[data-card="${window.CSS.escape(String(task.id))}"]`)?.getBoundingClientRect()
    const lista = tasks.filter((x) => x.status === task.status)
    setAtivo({ task, h: r?.height ?? 80, w: r?.width ?? 280, from: task.status, fromIdx: lista.findIndex((x) => x.id === task.id) })
  }
  const sobre = (e: DragOverEvent) => {
    if (e.over?.id == null) return
    setLocal((cols) => moveTaskLocally(cols, e.active.id, e.over!.id))
  }
  const fim = (_e: DragEndEvent) => {
    const a = ativo
    setAtivo(null)
    if (!a) return
    const col = local.find((c) => c.tasks.some((t) => t.id === a.task.id))
    if (!col) return setLocal(colunas)
    const idx = col.tasks.findIndex((t) => t.id === a.task.id)
    if (col.id === a.from && idx === a.fromIdx) return
    onMove?.(a.task.id, col.id, idx)
    if (col.id !== a.from) {
      toast.success(`Movida para ${colunaDe(col.id)?.label ?? col.id}`, {
        description: rotulo(a.task),
        action: { label: "Desfazer", onClick: () => onMoveRef.current?.(a.task.id, a.from, a.fromIdx) },
      })
    }
  }
  const cancela = () => {
    setAtivo(null)
    setLocal(colunas)
  }
  const sobreColuna = ativo ? local.find((c) => c.tasks.some((t) => t.id === ativo.task.id))?.id : undefined

  /* ---------- concluir e criar ---------- */
  const concluir = (t: KanbanTask) => {
    if (t.status === "done") return
    const from = t.status
    const fromIdx = tasksRef.current.filter((x) => x.status === from).findIndex((x) => x.id === t.id)
    onComplete?.(t.id)
    toast.success("Concluída", {
      description: rotulo(t),
      action: { label: "Desfazer", onClick: () => onMoveRef.current?.(t.id, from, fromIdx) },
    })
  }
  const criar = (status: KanbanStatus, titulo: string) => {
    pedido.current = { col: status, conhecidas: tasksRef.current.map((x) => x.id) }
    onCreate?.(status, titulo)
  }
  const primeira = colunaDe("todo") ? "todo" : COLS[0]?.id
  const barra = typeof toolbar === "function" ? toolbar({ add: (s) => setCriando(s ?? primeira ?? null) }) : toolbar

  const total = tasks.filter((t) => t.status !== "canceled").length
  const feitas = tasks.filter((t) => t.status === "done").length

  return (
    <div
      data-slot="kanban"
      className={cn("muriki-kb relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--kb-panel)] text-foreground", className)}
      style={style}
    >
      <div className="flex h-[52px] flex-none items-center gap-2 pr-3 pl-[18px] shadow-[inset_0_-1px_0_var(--kb-hair)]">
        <KanbanIcon className="size-4 text-muted-foreground" />
        {title ? <h2 className="m-0 text-sm font-semibold whitespace-nowrap text-foreground-strong">{title}</h2> : null}
        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] whitespace-nowrap text-muted-foreground">
          <b className="font-semibold text-foreground-strong">{feitas}</b> de {total} concluídas
        </span>
        <span className="flex-1" />
        {barra}
      </div>

      <DndContext sensors={sensors} collisionDetection={colisao} onDragStart={inicio} onDragOver={sobre} onDragEnd={fim} onDragCancel={cancela}>
        <div className="relative flex min-h-0 flex-1">
          <div
            data-slot="kanban-board"
            tabIndex={0}
            aria-label={ariaLabel ?? `Quadro com ${COLS.length} colunas`}
            className="muriki-scroll-x absolute inset-0 overflow-x-auto overflow-y-hidden outline-none"
          >
            <div className="box-border flex h-full w-max items-start gap-[18px] px-5 pt-4 pb-3.5">
              {COLS.map((c) => {
                const lista = local.find((x) => x.id === c.id)?.tasks ?? []
                return (
                  <Coluna
                    key={c.id}
                    col={c}
                    lista={lista}
                    sobre={sobreColuna === c.id}
                    arrastando={ativo?.task.id}
                    alturaArrasto={ativo?.h ?? 0}
                    alertaDe={alertaDe}
                    projetoDe={projetoDe}
                    now={now}
                    nascida={nascida.current}
                    criando={criando === c.id}
                    podeCriar={!!onCreate}
                    onAbrirCriacao={() => setCriando(c.id)}
                    onFecharCriacao={() => setCriando(null)}
                    onCriar={(v) => criar(c.id, v)}
                    onConcluir={concluir}
                    onOpen={onOpen}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {ativo ? (
            <div style={{ width: ativo.w }} className="muriki-kb-lift">
              <KanbanCard
                task={ativo.task}
                alert={alertaDe(ativo.task)}
                project={projetoDe(ativo.task.project)}
                now={now}
                className="cursor-grabbing"
                style={{ transform: "rotate(1.6deg)", transformOrigin: "50% 20%" }}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

/* ---------- coluna ---------- */
interface ColunaProps {
  col: KanbanColumnSpec
  lista: KanbanTask[]
  sobre: boolean
  arrastando?: KanbanTask["id"]
  alturaArrasto: number
  alertaDe: (t: KanbanTask) => ReturnType<typeof kanbanAlert>
  projetoDe: (id?: string) => KanbanProject | null
  now?: Date
  nascida: KanbanTask["id"] | null
  criando: boolean
  podeCriar: boolean
  onAbrirCriacao: () => void
  onFecharCriacao: () => void
  onCriar: (titulo: string) => void
  onConcluir: (t: KanbanTask) => void
  onOpen?: (id: KanbanTask["id"]) => void
}

function Coluna({ col: c, lista, sobre, arrastando, alturaArrasto, alertaDe, projetoDe, now, nascida, criando, podeCriar, onAbrirCriacao, onFecharCriacao, onCriar, onConcluir, onOpen }: ColunaProps) {
  const { setNodeRef } = useDroppable({ id: c.id })
  // o cartão erguido não conta: o resumo é do que fica na coluna
  const fica = lista.filter((t) => t.id !== arrastando)
  const count = lista.length
  const alertas = fica.filter((t) => alertaDe(t)).length
  const noPrazo = fica.filter((t) => !alertaDe(t) && t.due).length
  const semPrazo = fica.filter((t) => !alertaDe(t) && !t.due).length
  const comSub = fica.filter((t) => t.sub)
  const pct = comSub.length
    ? Math.round((comSub.reduce((a, t) => a + t.sub![0], 0) / comSub.reduce((a, t) => a + t.sub![1], 0)) * 100)
    : null
  const fechada = c.id === "done" || c.id === "canceled"
  const segs = fechada
    ? [{ n: fica.length, c: "var(--tone)", l: c.id === "done" ? "concluídas" : "canceladas" }]
    : [
        { n: noPrazo, c: "color-mix(in oklch, var(--tone) 70%, transparent)", l: "no prazo" },
        { n: alertas, c: "var(--tone-red-dot)", l: "com alerta" },
        { n: semPrazo, c: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)", l: "sem prazo" },
      ]
  const estourou = !!c.limit && count > c.limit

  return (
    <section
      ref={setNodeRef}
      data-s={c.id}
      data-over={sobre || undefined}
      aria-label={c.label}
      style={tomDaColuna(c.id)}
      className={cn(
        "relative box-border flex max-h-full w-[300px] flex-none flex-col rounded-2xl px-2.5 pt-3 pb-2.5",
        "bg-[color-mix(in_oklch,var(--tone)_6%,var(--kb-panel))] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--tone)_12%,transparent)]",
        "transition-[width,background,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
        "data-[over]:bg-[color-mix(in_oklch,var(--tone)_12%,var(--kb-panel))] data-[over]:shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--tone)_45%,transparent)]",
        "group/col"
      )}
    >
      <header className="flex h-[38px] flex-none items-center gap-2 pr-0.5 pb-2.5 pl-1">
        <KanbanStatusIcon status={c.id} size={15} />
        <b className="text-sm font-semibold whitespace-nowrap text-foreground-strong">{c.label}</b>
        <span
          title={c.limit ? `Limite da coluna: ${c.limit}` : undefined}
          className={cn(
            "box-border inline-grid h-5 min-w-[22px] place-items-center rounded-full px-1.5 text-[11.5px] font-semibold tabular-nums",
            estourou ? "bg-tone-orange text-tone-orange-foreground" : "bg-[var(--tone-bg)] text-foreground-strong"
          )}
        >
          {c.limit ? `${count}/${c.limit}` : count}
        </span>
        <span className="flex-1" />
        {alertas ? (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex items-center gap-1 text-xs font-semibold text-tone-red-foreground" />}>
              <WarningCircleIcon className="size-[13px]" weight="fill" />
              {alertas}
            </TooltipTrigger>
            <TooltipContent>{alertas > 1 ? `${alertas} tarefas pedem atenção` : "1 tarefa pede atenção"}</TooltipContent>
          </Tooltip>
        ) : null}
        {podeCriar ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" aria-label={`Nova tarefa em ${c.label}`} onClick={onAbrirCriacao} className="text-muted-foreground" />
              }
            >
              <PlusIcon />
            </TooltipTrigger>
            <TooltipContent>{`Nova tarefa em ${c.label}`}</TooltipContent>
          </Tooltip>
        ) : null}
      </header>
      <div className={cn("mx-1 mb-3 h-[3px] flex-none rounded-[3px]", estourou ? "bg-tone-orange-dot" : "bg-[var(--tone)]")} />

      <div className="muriki-scroll-x -mx-0.5 flex min-h-0 flex-auto flex-col gap-2 overflow-y-auto p-0.5">
        {criando ? <CriacaoRapida onAdd={onCriar} onClose={onFecharCriacao} /> : null}
        <SortableContext items={lista.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {lista.map((t) => (
            <CartaoArrastavel
              key={t.id}
              task={t}
              alturaArrasto={alturaArrasto}
              nascida={t.id === nascida}
              alert={alertaDe(t)}
              project={projetoDe(t.project)}
              now={now}
              onConcluir={onConcluir}
              onOpen={onOpen}
            />
          ))}
        </SortableContext>
        {!lista.length && !criando ? (
          <div className="rounded-xl px-2.5 py-[22px] text-center text-[12.5px] text-muted-foreground shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--tone)_22%,transparent)]">
            {sobre ? "Solte aqui" : "Nenhuma tarefa"}
          </div>
        ) : null}
      </div>

      {fica.length ? (
        <footer className="mt-2.5 grid flex-none gap-[7px] px-1 pt-2.5 pb-0.5 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--tone)_18%,transparent)]">
          <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
            <b className="text-[13px] font-semibold text-foreground-strong tabular-nums">{fica.length}</b>
            {fica.length > 1 ? "tarefas" : "tarefa"}
            {pct != null ? (
              <span className="ml-auto">
                <b className="text-[13px] font-semibold text-foreground-strong tabular-nums">{pct}%</b> das subtarefas
              </span>
            ) : null}
          </div>
          <div className="flex h-1 gap-0.5">
            {segs.filter((s) => s.n).map((s) => (
              <span key={s.l} className="rounded-[9px] transition-[flex-grow] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ flexGrow: s.n, background: s.c }} />
            ))}
          </div>
          {fechada ? null : (
            <div className="flex flex-wrap gap-x-3 gap-y-[3px] text-[11.5px] text-muted-foreground">
              {segs.filter((s) => s.n).map((s) => (
                <span key={s.l} className="inline-flex items-center gap-[5px]">
                  <i className="size-1.5 rounded-[2px]" style={{ background: s.c }} />
                  {s.n} {s.l}
                </span>
              ))}
            </div>
          )}
        </footer>
      ) : null}
    </section>
  )
}

/* ---------- cartão no @dnd-kit ---------- */
function CartaoArrastavel({
  task,
  alturaArrasto,
  nascida,
  alert,
  project,
  now,
  onConcluir,
  onOpen,
}: {
  task: KanbanTask
  alturaArrasto: number
  nascida: boolean
  alert: ReturnType<typeof kanbanAlert>
  project: KanbanProject | null
  now?: Date
  onConcluir: (t: KanbanTask) => void
  onOpen?: (id: KanbanTask["id"]) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } })
  const style = { transform: CSS.Transform.toString(transform), transition }
  // erguido, o lugar dele vira o espaço tingido da coluna
  if (isDragging) return <div ref={setNodeRef} style={{ ...style, height: alturaArrasto }} className="muriki-kb-ph" />
  return (
    <KanbanCard
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-card={String(task.id)}
      aria-roledescription="Cartão arrastável"
      aria-label={rotulo(task)}
      task={task}
      alert={alert}
      project={project}
      now={now}
      onComplete={onConcluir}
      className={nascida ? "muriki-kb-born" : undefined}
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.(task.id)
        listeners?.onKeyDown?.(e)
      }}
    />
  )
}

/* ---------- criação rápida no topo ---------- */
function CriacaoRapida({ onAdd, onClose }: { onAdd: (v: string) => void; onClose: () => void }) {
  const [v, setV] = React.useState("")
  return (
    <div className="flex-none animate-[muriki-kb-in_.3s_cubic-bezier(.16,1,.3,1)_both] rounded-xl bg-card px-3 py-2.5 shadow-[var(--kb-shadow-sm),inset_0_0_0_1.5px_color-mix(in_oklch,var(--primary)_45%,transparent)] motion-reduce:animate-none">
      <textarea
        autoFocus
        rows={2}
        value={v}
        placeholder="Título da tarefa"
        aria-label="Título da tarefa"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (v.trim()) {
              onAdd(v.trim())
              setV("")
            }
          }
          if (e.key === "Escape") onClose()
        }}
        onBlur={() => {
          if (!v.trim()) onClose()
        }}
        className="w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-[19px] font-medium text-foreground-strong outline-0 placeholder:text-muted-foreground"
      />
      <small className="mt-1.5 block text-[11px] text-muted-foreground">Enter cria e continua. Esc fecha.</small>
    </div>
  )
}
