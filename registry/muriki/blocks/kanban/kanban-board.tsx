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
// Arrasto com peso, pela lógica de ponteiro do DS (o @dnd-kit saiu: o
// overlay dele segue o dedo sem atraso e reordena por transform, e os dois
// brigavam com o atraso e o FLIP). O cartão segue o ponteiro com um lerp
// curto, inclina pela velocidade sobre uma base de ±1,6° com sombra funda;
// o espaço cresce no destino, os vizinhos deslizam e o pouso endireita
// (FLIP). Numa coluna recolhida, o cartão voa até a faixa e some nela.
// Perto da borda, o quadro rola sozinho. No teclado, com o cartão em foco:
// Alt+←/→ troca de coluna e Alt+↑/↓ muda a posição; Enter abre.
//
// Para os lados não há barra de rolagem: o fundo arrasta. A navegação é
// escolha de Exibição: lingueta nas bordas (padrão; abre com os nomes
// quando o ponteiro chega perto), páginas na barra de status, lombadas
// (os cabeçalhos que saíram empilham na borda) ou régua de colunas
// (parar sobre uma aba durante o arrasto leva até a coluna). "Visão geral"
// encolhe o quadro inteiro; clique numa coluna para voltar nela. Nenhuma
// coluna começa recolhida: recolher é à mão, no "…" da coluna ou em
// Exibição.
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
"use client"

import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
  EyeIcon,
  KanbanIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import * as React from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { BadgeTone } from "@/components/ui/badge-variants"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export interface KanbanColumnSpec {
  id: KanbanStatus
  label: string
  /** Limite de tarefas: o contador vira "n/limite" e fica laranja quando passa. */
  limit?: number
}

export type KanbanNavigation = "lingueta" | "paginas" | "lombadas" | "regua"

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
  /** Colunas que já começam recolhidas. Padrão: nenhuma. */
  defaultCollapsed?: KanbanStatus[]
  /** Como ir para os lados. Padrão "lingueta"; o menu Exibição troca. */
  navigation?: KanbanNavigation
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
const reduzido = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
const sel = (id: KanbanTask["id"]) => `[data-card="${window.CSS.escape(String(id))}"]`
function retangulos(root: HTMLElement | null) {
  const m: Record<string, DOMRect> = {}
  root?.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
    m[el.dataset.card!] = el.getBoundingClientRect()
  })
  return m
}

type Id = KanbanTask["id"]
interface Arrasto {
  id: Id
  x: number
  y: number
  ox: number
  oy: number
  w: number
  h: number
  col: KanbanStatus
  idx: number
  from: KanbanStatus
  fromIdx: number
  tilt: number
  mini?: boolean
}

export function KanbanBoard({
  tasks,
  columns: colunasProp,
  projects = [],
  onMove,
  onComplete,
  onOpen,
  onCreate,
  defaultCollapsed,
  navigation,
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

  // callbacks e tarefas mais recentes, para os ouvintes de janela e o Desfazer
  const props = React.useRef({ onMove, onOpen })
  props.current = { onMove, onOpen }
  const tasksRef = React.useRef(tasks)
  tasksRef.current = tasks

  const [mini, setMini] = React.useState<Partial<Record<KanbanStatus, boolean>>>(() =>
    Object.fromEntries((defaultCollapsed ?? []).map((id) => [id, true]))
  )
  const miniRef = React.useRef(mini)
  miniRef.current = mini
  const setMiniDe = (id: KanbanStatus, v: boolean) => setMini((m) => ({ ...m, [id]: v }))

  const [nav, setNav] = React.useState<KanbanNavigation>(navigation ?? "lingueta")
  React.useEffect(() => {
    if (navigation) setNav(navigation)
  }, [navigation])

  const [drag, setDrag] = React.useState<Arrasto | null>(null)
  const dragRef = React.useRef<Arrasto | null>(null)
  const [quente, setQuente] = React.useState<KanbanStatus | null>(null)
  const quenteRef = React.useRef<{ id: KanbanStatus | null; t: number }>({ id: null, t: 0 })
  const [criando, setCriando] = React.useState<KanbanStatus | null>(null)
  const [piscando, setPiscando] = React.useState<KanbanStatus | null>(null)
  const [sc, setSc] = React.useState({ sl: 0, cw: 1, sw: 1 })
  const [arrastandoFundo, setArrastandoFundo] = React.useState(false)
  const [perto, setPerto] = React.useState({ l: false, r: false })
  const [geral, setGeral] = React.useState(false)
  const [aviso, setAviso] = React.useState("")

  const boardRef = React.useRef<HTMLDivElement | null>(null)
  const colRefs = React.useRef<Partial<Record<KanbanStatus, HTMLElement | null>>>({})
  const liftRef = React.useRef<HTMLDivElement | null>(null)
  const liftPos = React.useRef<{ x: number; y: number } | null>(null)
  const liftTilt = React.useRef(0)
  const landTilt = React.useRef(0)
  const flip = React.useRef<Record<string, DOMRect> | null>(null)
  const pouso = React.useRef<Id | null>(null)
  const auto = React.useRef(0)
  const focoDepois = React.useRef<Id | null>(null)

  // a tarefa nova (onCreate) entra com desfoque: é a primeira que aparece na coluna depois do pedido
  const pedido = React.useRef<{ col: KanbanStatus; conhecidas: Id[] } | null>(null)
  const nascida = React.useRef<Id | null>(null)
  if (pedido.current) {
    const nova = tasks.find((t) => t.status === pedido.current!.col && !pedido.current!.conhecidas.includes(t.id))
    if (nova) {
      nascida.current = nova.id
      pedido.current = null
    }
  }

  /* deslizar: curto e reto; o cartão que pousa sai da inclinação e da sombra funda */
  const snap = () => {
    flip.current = retangulos(boardRef.current)
  }
  React.useLayoutEffect(() => {
    const antes = flip.current
    flip.current = null
    if (!antes || reduzido()) {
      pouso.current = null
      return
    }
    boardRef.current?.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
      const id = el.dataset.card!
      const a = antes[id]
      if (!a) return
      const b = el.getBoundingClientRect()
      const dx = a.left - b.left
      const dy = a.top - b.top
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      const pousa = pouso.current != null && String(pouso.current) === id
      el.animate(
        pousa
          ? [
              { transform: `translate(${dx}px,${dy}px) rotate(${landTilt.current.toFixed(2)}deg)`, boxShadow: "0 22px 44px -14px rgba(0,0,0,.32)", zIndex: 5 },
              { transform: "none", zIndex: 5 },
            ]
          : [{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }],
        { duration: pousa ? 360 : 240, easing: "cubic-bezier(.2,.8,.2,1)" }
      )
    })
    pouso.current = null
  })

  // o cartão movido pelo teclado volta a ter o foco depois de trocar de coluna
  React.useEffect(() => {
    if (focoDepois.current == null) return
    const el = boardRef.current?.querySelector<HTMLElement>(sel(focoDepois.current))
    focoDepois.current = null
    el?.focus()
  })

  const medir = () => {
    const b = boardRef.current
    if (b) setSc({ sl: b.scrollLeft, cw: b.clientWidth, sw: b.scrollWidth })
  }
  React.useEffect(() => {
    const b = boardRef.current!
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(b)
    const mo = new MutationObserver(medir)
    mo.observe(b, { subtree: true, attributes: true, attributeFilter: ["data-mini"] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  const colEl = (id: KanbanStatus) => colRefs.current[id] ?? null
  const suave = (): ScrollBehavior => (reduzido() ? "auto" : "smooth")
  const piscar = (id: KanbanStatus) => {
    setPiscando(id)
    window.setTimeout(() => setPiscando(null), 900)
  }
  const irPara = (id: KanbanStatus) => {
    const estava = miniRef.current[id]
    if (estava) setMiniDe(id, false)
    window.setTimeout(
      () => {
        const el = colEl(id)
        const b = boardRef.current
        if (!el || !b) return
        const l = el.offsetLeft - 20
        const r = el.offsetLeft + el.offsetWidth + 20 - b.clientWidth
        b.scrollTo({ left: b.scrollLeft > l ? l : b.scrollLeft < r ? r : b.scrollLeft, behavior: suave() })
        piscar(id)
      },
      estava ? 360 : 0
    )
  }

  /* um cartão que entra numa coluna recolhida voa até a faixa e some nela */
  const voarPara = (de: Element | null | undefined, colId: KanbanStatus) => {
    const faixa = colEl(colId)
    if (!de || !faixa || reduzido()) return piscar(colId)
    const r = de.getBoundingClientRect()
    const clone = de.cloneNode(true) as HTMLElement
    clone.classList.add("muriki-kb-fly")
    Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, transformOrigin: "0 0", transform: "none" })
    document.body.appendChild(clone)
    window.setTimeout(() => clone.remove(), 600)
    window.setTimeout(() => {
      const sr = faixa.getBoundingClientRect()
      const dx = sr.left + sr.width / 2 - (r.left + r.width * 0.1)
      const dy = sr.top + 70 - (r.top + r.height * 0.1)
      clone.animate(
        [
          { transform: "none", opacity: 1, filter: "none" },
          { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0, filter: "blur(4px)" },
        ],
        { duration: 520, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }
      )
      window.setTimeout(() => piscar(colId), 380)
    }, 0)
  }

  /* o cartão segue o ponteiro com um atraso mínimo: peso sem elástico */
  const arrastando = !!drag
  React.useEffect(() => {
    if (!arrastando) return
    let raf = 0
    let tilt = 0
    const loop = () => {
      const d = dragRef.current
      const el = liftRef.current
      if (d && el) {
        const tx = d.x - d.ox
        const ty = d.y - d.oy - 2
        const c = liftPos.current ?? (liftPos.current = { x: tx, y: ty })
        const px = c.x
        c.x += (tx - c.x) * 0.38
        c.y += (ty - c.y) * 0.38
        el.style.left = `${c.x}px`
        el.style.top = `${c.y}px`
        // um cartão de verdade inclina para onde é puxado e endireita quando para; a base fica levemente diagonal
        const alvo = Math.max(-6, Math.min(6, d.tilt + (c.x - px) * 0.45))
        tilt += (alvo - tilt) * 0.16
        const card = el.firstElementChild as HTMLElement | null
        if (card) {
          card.style.transform = `rotate(${tilt.toFixed(2)}deg)`
          card.style.setProperty("--sx", `${(-tilt * 2).toFixed(1)}px`)
        }
        liftTilt.current = tilt
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // perto da borda, o quadro rola sozinho
    const rola = window.setInterval(() => {
      if (auto.current && boardRef.current) boardRef.current.scrollLeft += auto.current
    }, 16)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(rola)
      liftPos.current = null
    }
  }, [arrastando])

  /* arrasto */
  const alvo = (x: number, y: number): Pick<Arrasto, "col" | "idx" | "mini"> | null => {
    for (const c of COLS) {
      const el = colEl(c.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left - 9 && x <= r.right + 9) {
        if (miniRef.current[c.id]) return { col: c.id, idx: 0, mini: true }
        const cards = Array.from(el.querySelectorAll("[data-card]"))
        let idx = cards.length
        for (let j = 0; j < cards.length; j++) {
          const cr = cards[j]!.getBoundingClientRect()
          if (y < cr.top + cr.height / 2) {
            idx = j
            break
          }
        }
        return { col: c.id, idx }
      }
    }
    return null
  }
  const pegar = (e: React.PointerEvent<HTMLElement>, t: KanbanTask) => {
    if (e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    const sx = e.clientX
    const sy = e.clientY
    let comecou = false
    const mover = (ev: PointerEvent) => {
      if (!comecou) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return
        comecou = true
        const lista = tasksRef.current.filter((x) => x.status === t.status)
        const idx = lista.findIndex((x) => x.id === t.id)
        const d0: Arrasto = {
          id: t.id, x: ev.clientX, y: ev.clientY, ox: sx - r.left, oy: sy - r.top, w: r.width, h: r.height,
          col: t.status, idx, from: t.status, fromIdx: idx, tilt: ev.clientX >= sx ? 1.6 : -1.6,
        }
        liftPos.current = { x: r.left, y: r.top - 2 }
        dragRef.current = d0
        snap()
        setDrag(d0)
        return
      }
      const d = dragRef.current!
      const tg = alvo(ev.clientX, ev.clientY) ?? { col: d.col, idx: d.idx }
      const nd: Arrasto = { ...d, x: ev.clientX, y: ev.clientY, mini: false, ...tg }
      if (tg.col !== d.col || tg.idx !== d.idx) snap()
      dragRef.current = nd
      setDrag(nd)
      const b = boardRef.current!.getBoundingClientRect()
      auto.current = ev.clientX > b.right - 60 ? 12 : ev.clientX < b.left + 60 ? -12 : 0
      // régua: parar sobre uma aba leva até a coluna
      const aba = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-kb-tab]")
      if (aba) {
        const id = aba.dataset.s as KanbanStatus
        if (quenteRef.current.id !== id) {
          quenteRef.current = { id, t: Date.now() }
          setQuente(id)
        } else if (quenteRef.current.t && Date.now() - quenteRef.current.t > 450) {
          quenteRef.current.t = 0
          irPara(id)
        }
      } else if (quenteRef.current.id) {
        quenteRef.current = { id: null, t: 0 }
        setQuente(null)
      }
    }
    const soltar = () => {
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
      auto.current = 0
      if (!comecou) return props.current.onOpen?.(t.id)
      const d = dragRef.current!
      dragRef.current = null
      const lift = liftRef.current?.firstElementChild
      const lr = lift?.getBoundingClientRect()
      if (d.mini) voarPara(lift, d.col)
      quenteRef.current = { id: null, t: 0 }
      setQuente(null)
      snap()
      if (lr && !d.mini) {
        flip.current![String(d.id)] = lr
        pouso.current = d.id
        landTilt.current = liftTilt.current
      }
      if (d.col !== d.from || d.idx !== d.fromIdx) props.current.onMove?.(d.id, d.col, d.idx)
      setDrag(null)
      if (d.col !== d.from) avisarMovida(t, d.col, d.from, d.fromIdx)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }
  const avisarMovida = (t: KanbanTask, col: KanbanStatus, from: KanbanStatus, fromIdx: number) => {
    const nome = colunaDe(col)?.label ?? col
    setAviso(`${t.title} movida para ${nome}`)
    toast.success(`Movida para ${nome}`, {
      description: rotulo(t),
      action: {
        label: "Desfazer",
        onClick: () => {
          snap()
          props.current.onMove?.(t.id, from, fromIdx)
        },
      },
    })
  }

  /* teclado: Alt+←/→ troca de coluna, Alt+↑/↓ muda a posição */
  const teclado = (e: React.KeyboardEvent<HTMLElement>, t: KanbanTask) => {
    if (e.key === "Enter") return onOpen?.(t.id)
    if (!e.altKey) return
    const naCol = (s: KanbanStatus) => tasksRef.current.filter((x) => x.status === s && x.id !== t.id)
    const ci = COLS.findIndex((c) => c.id === t.status)
    const idx = tasksRef.current.filter((x) => x.status === t.status).findIndex((x) => x.id === t.id)
    let col = t.status
    let to = idx
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const nc = COLS[ci + (e.key === "ArrowRight" ? 1 : -1)]
      if (!nc) return
      col = nc.id
      to = Math.min(idx, naCol(col).length)
    } else if (e.key === "ArrowUp") to = Math.max(0, idx - 1)
    else if (e.key === "ArrowDown") to = Math.min(naCol(col).length, idx + 1)
    else return
    e.preventDefault()
    if (col === t.status && to === idx) return
    if (miniRef.current[col]) setMiniDe(col, false)
    snap()
    focoDepois.current = t.id
    onMove?.(t.id, col, to)
    if (col !== t.status) avisarMovida(t, col, t.status, idx)
    else setAviso(`${t.title}: posição ${to + 1} em ${colunaDe(col)?.label ?? col}`)
  }

  /* concluir e criar */
  const concluir = (t: KanbanTask) => {
    if (t.status === "done") return
    const from = t.status
    const fromIdx = tasksRef.current.filter((x) => x.status === from).findIndex((x) => x.id === t.id)
    if (miniRef.current.done) voarPara(boardRef.current?.querySelector(sel(t.id)), "done")
    else snap()
    onComplete?.(t.id)
    toast.success("Concluída", {
      description: rotulo(t),
      action: {
        label: "Desfazer",
        onClick: () => {
          snap()
          props.current.onMove?.(t.id, from, fromIdx)
        },
      },
    })
  }
  const criar = (status: KanbanStatus, titulo: string) => {
    snap()
    pedido.current = { col: status, conhecidas: tasksRef.current.map((x) => x.id) }
    onCreate?.(status, titulo)
  }
  const primeira = colunaDe("todo") ? "todo" : COLS[0]?.id
  const barra = typeof toolbar === "function" ? toolbar({ add: (s) => setCriando(s ?? primeira ?? null) }) : toolbar

  /* fundo arrasta para rolar */
  const arrastarFundo = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-card], button, textarea, header, [role=menu]")) return
    const b = boardRef.current!
    const sx = e.clientX
    const sl = b.scrollLeft
    let moveu = false
    const mv = (ev: PointerEvent) => {
      const dx = ev.clientX - sx
      if (!moveu && Math.abs(dx) < 4) return
      if (!moveu) {
        moveu = true
        setArrastandoFundo(true)
      }
      b.scrollLeft = sl - dx
    }
    const up = () => {
      window.removeEventListener("pointermove", mv)
      window.removeEventListener("pointerup", up)
      setArrastandoFundo(false)
    }
    window.addEventListener("pointermove", mv)
    window.addEventListener("pointerup", up)
  }
  const naBorda = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const n = { l: e.clientX < r.left + 130, r: e.clientX > r.right - 130 }
    if (n.l !== perto.l || n.r !== perto.r) setPerto(n)
  }
  const teclaQuadro = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== boardRef.current) return
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      boardRef.current!.scrollBy({ left: e.key === "ArrowRight" ? 318 : -318, behavior: suave() })
    }
  }

  /* visão geral, páginas e o que saiu da tela */
  const escalaGeral = Math.min(1, (sc.cw - 8) / Math.max(1, sc.sw))
  const cliqueGeral = (e: React.MouseEvent) => {
    if (!geral) return
    const col = (e.target as HTMLElement).closest<HTMLElement>("section[data-s]")
    e.preventDefault()
    e.stopPropagation()
    setGeral(false)
    if (col) window.setTimeout(() => irPara(col.dataset.s as KanbanStatus), 520)
  }
  const larga = COLS.map((c) => colEl(c.id)).find((el) => el && !el.hasAttribute("data-mini"))
  const porPagina = Math.max(1, Math.floor((sc.cw - 40 + 18) / ((larga?.offsetWidth || 300) + 18)))
  const paginas = Math.ceil(COLS.length / porPagina)
  const primeiraVisivel = Math.max(0, COLS.findIndex((c) => { const el = colEl(c.id); return !!el && el.offsetLeft >= sc.sl + 4 }))
  const pagina = sc.sl + sc.cw >= sc.sw - 4 ? paginas - 1 : Math.min(paginas - 1, Math.floor(primeiraVisivel / porPagina))
  const irPagina = (p: number) => {
    p = Math.max(0, Math.min(paginas - 1, p))
    const b = boardRef.current!
    b.classList.remove("muriki-kb-paging")
    void b.offsetWidth
    b.classList.add("muriki-kb-paging")
    window.setTimeout(() => b.classList.remove("muriki-kb-paging"), 520)
    const el = colEl(COLS[p * porPagina]!.id)
    b.scrollTo({ left: p === 0 ? 0 : (el?.offsetLeft ?? 0) - 20, behavior: suave() })
  }
  const nomesDaPagina = (p: number) => COLS.slice(p * porPagina, p * porPagina + porPagina).map((c) => c.label).join(", ")
  const escondidasD = COLS.filter((c) => { const el = colEl(c.id); return !!el && el.offsetLeft + el.offsetWidth > sc.sl + sc.cw + 8 })
  const escondidasE = COLS.filter((c) => { const el = colEl(c.id); return !!el && el.offsetLeft < sc.sl - 8 })
  const daColuna = (id: KanbanStatus) => tasks.filter((t) => t.status === id)
  const alertasDe = (id: KanbanStatus) => daColuna(id).filter((t) => alertaDe(t)).length

  const total = tasks.filter((t) => t.status !== "canceled").length
  const feitas = tasks.filter((t) => t.status === "done").length
  const vivas = drag ? tasks.filter((x) => x.id !== drag.id) : tasks
  const erguida = drag ? tasks.find((x) => x.id === drag.id) : undefined

  const cartao = (t: KanbanTask) => (
    <KanbanCard
      key={t.id}
      data-card={String(t.id)}
      tabIndex={0}
      aria-label={rotulo(t)}
      aria-roledescription="Cartão arrastável"
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown"
      task={t}
      alert={alertaDe(t)}
      project={projetoDe(t.project)}
      now={now}
      onComplete={concluir}
      className={t.id === nascida.current ? "muriki-kb-born" : undefined}
      onPointerDown={(e) => pegar(e, t)}
      onKeyDown={(e) => teclado(e, t)}
    />
  )

  return (
    <div
      data-slot="kanban"
      className={cn(
        "muriki-kb relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--kb-panel)] text-foreground",
        drag && "muriki-kb-dragging",
        className
      )}
      style={style}
    >
      <div className="flex h-[52px] flex-none items-center gap-2 pr-3 pl-[18px] shadow-[inset_0_-1px_0_var(--kb-hair)]">
        <KanbanIcon className="size-4 text-muted-foreground" />
        {title ? <h2 className="m-0 text-sm font-semibold whitespace-nowrap text-foreground-strong">{title}</h2> : null}
        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] whitespace-nowrap text-muted-foreground">
          <b className="font-semibold text-foreground-strong">{feitas}</b> de {total} concluídas
        </span>
        <span className="flex-1" />
        <Tooltip>
          <TooltipTrigger render={<Button variant={geral ? "secondary" : "ghost"} size="sm" onClick={() => setGeral((v) => !v)} />}>
            {geral ? <ArrowsInSimpleIcon /> : <ArrowsOutSimpleIcon />}
            {geral ? "Sair da visão geral" : "Visão geral"}
          </TooltipTrigger>
          <TooltipContent>{geral ? "Voltar ao tamanho normal" : "Ver o quadro inteiro"}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            <KanbanIcon />
            Colunas
            <CaretDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Ir para a coluna</DropdownMenuLabel>
            {COLS.map((c) => {
              const al = alertasDe(c.id)
              return (
                <DropdownMenuItem key={c.id} onClick={() => irPara(c.id)}>
                  <KanbanStatusIcon status={c.id} />
                  {c.label}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {daColuna(c.id).length}
                    {al ? ` · ${al} com alerta` : ""}
                    {mini[c.id] ? " · recolhida" : ""}
                  </span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            <EyeIcon />
            Exibição
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Exibição</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={nav} onValueChange={(v) => setNav(v as KanbanNavigation)}>
              <DropdownMenuRadioItem value="lingueta">
                Lingueta nas bordas<span className="ml-auto text-xs text-muted-foreground">Padrão</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="paginas">Páginas na barra de status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="lombadas">Lombadas</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="regua">Régua de colunas</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={!!(mini.done && mini.canceled)}
              onCheckedChange={(on) => setMini((m) => ({ ...m, done: on, canceled: on }))}
            >
              Recolher Concluído e Cancelado
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {barra}
      </div>

      {nav === "regua" ? (
        <nav
          data-slot="kanban-ruler"
          aria-label="Colunas do quadro"
          className="flex flex-none animate-[muriki-kb-in_.3s_cubic-bezier(.16,1,.3,1)] gap-1 overflow-hidden px-3 py-2 shadow-[inset_0_-1px_0_var(--kb-hair)] motion-reduce:animate-none"
        >
          {COLS.map((c) => {
            const el = colEl(c.id)
            const vis = !!el && el.offsetLeft + el.offsetWidth > sc.sl + 30 && el.offsetLeft < sc.sl + sc.cw - 30
            return (
              <button
                key={c.id}
                type="button"
                data-kb-tab=""
                data-s={c.id}
                data-vis={vis || undefined}
                data-hot={quente === c.id || undefined}
                aria-current={vis || undefined}
                title={c.label + (mini[c.id] ? " (recolhida)" : "")}
                onClick={() => irPara(c.id)}
                style={tomDaColuna(c.id)}
                className={cn(
                  "relative flex h-8 min-w-0 flex-[1_1_0] cursor-pointer items-center gap-[7px] rounded-[9px] px-2.5 text-[12.5px] text-muted-foreground",
                  "transition-[background,color,box-shadow] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-muted hover:text-foreground-strong",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                  "data-[vis]:bg-card data-[vis]:text-foreground-strong data-[vis]:shadow-[var(--kb-shadow-xs),inset_0_0_0_1px_var(--kb-hair)]",
                  "data-[vis]:after:absolute data-[vis]:after:right-2.5 data-[vis]:after:-bottom-px data-[vis]:after:left-2.5 data-[vis]:after:h-0.5 data-[vis]:after:rounded-sm data-[vis]:after:bg-[var(--tone)]",
                  "data-[hot]:bg-[color-mix(in_oklch,var(--tone)_12%,var(--card))] data-[hot]:shadow-[inset_0_0_0_1.5px_var(--tone)]"
                )}
              >
                <KanbanStatusIcon status={c.id} />
                <span className="min-w-0 truncate">{c.label}</span>
                {alertasDe(c.id) ? <span className="size-1.5 flex-none rounded-full bg-tone-red-dot" /> : null}
                <b className="ml-auto font-semibold tabular-nums">{daColuna(c.id).length}</b>
              </button>
            )
          })}
        </nav>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        <div
          className={cn("relative min-w-0 flex-1 overflow-hidden", geral && "muriki-kb-overview")}
          onPointerMove={naBorda}
          onPointerLeave={() => setPerto({ l: false, r: false })}
        >
          <div
            ref={boardRef}
            data-slot="kanban-board"
            tabIndex={0}
            aria-label={ariaLabel ?? `Quadro com ${COLS.length} colunas`}
            onScroll={medir}
            onKeyDown={teclaQuadro}
            onPointerDown={arrastarFundo}
            onClickCapture={cliqueGeral}
            className={cn(
              "muriki-scroll-x absolute inset-0 overflow-x-auto overflow-y-hidden outline-none",
              geral && "overflow-hidden",
              arrastandoFundo && "muriki-kb-panning"
            )}
          >
            <div
              data-slot="kanban-cols"
              style={geral ? { transform: `scale(${escalaGeral})` } : undefined}
              className="box-border flex h-full w-max origin-top-left items-start gap-[18px] px-5 pt-4 pb-3.5 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
            >
              {COLS.map((c) => {
                const lista = vivas.filter((t) => t.status === c.id)
                const sobre = !!drag && drag.col === c.id
                const count = lista.length + (sobre ? 1 : 0)
                const ref = (el: HTMLElement | null) => {
                  colRefs.current[c.id] = el
                }
                const comum = {
                  ref,
                  "data-s": c.id,
                  "data-over": sobre || undefined,
                  style: tomDaColuna(c.id),
                }
                const alertas = lista.filter((t) => alertaDe(t)).length
                if (mini[c.id])
                  return (
                    <section
                      key={c.id}
                      {...comum}
                      data-mini=""
                      role="button"
                      tabIndex={0}
                      aria-label={`${c.label}, ${count} tarefas. Abrir coluna`}
                      onClick={() => setMiniDe(c.id, false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setMiniDe(c.id, false)
                      }}
                      className={cn(COLUNA, "w-12 cursor-pointer px-0 py-2.5 hover:bg-[color-mix(in_oklch,var(--tone)_12%,var(--kb-panel))]", piscando === c.id && "muriki-kb-flash")}
                    >
                      <div className="flex flex-col items-center gap-2.5 pt-1.5 pb-3">
                        <KanbanStatusIcon status={c.id} size={15} />
                        <span data-n="" className={PILULA}>{count}</span>
                        {alertas ? <span title={`${alertas} com alerta`} className="size-1.5 rounded-full bg-tone-red-dot" /> : null}
                        <b className="text-[13.5px] font-semibold whitespace-nowrap text-foreground-strong [writing-mode:vertical-rl]">{c.label}</b>
                      </div>
                    </section>
                  )
                return (
                  <Coluna
                    key={c.id}
                    comum={comum}
                    col={c}
                    lista={lista}
                    count={count}
                    alertas={alertas}
                    piscando={piscando === c.id}
                    alertaDe={alertaDe}
                    corpo={(() => {
                      const corpo = lista.map(cartao)
                      if (sobre && drag) corpo.splice(Math.min(drag.idx, corpo.length), 0, <div key="ph" className="muriki-kb-ph" style={{ height: drag.h }} />)
                      return corpo
                    })()}
                    sobre={sobre}
                    criando={criando === c.id}
                    podeCriar={!!onCreate}
                    onAbrirCriacao={() => setCriando(c.id)}
                    onFecharCriacao={() => setCriando(null)}
                    onCriar={(v) => criar(c.id, v)}
                    onRecolher={() => setMiniDe(c.id, true)}
                  />
                )
              })}
            </div>
          </div>
          <div aria-hidden data-on={sc.sl > 4 || undefined} className="muriki-kb-edge left-0 bg-gradient-to-r from-[var(--kb-panel)] to-transparent" />
          <div aria-hidden data-on={sc.sl + sc.cw < sc.sw - 4 || undefined} className="muriki-kb-edge right-0 bg-gradient-to-l from-[var(--kb-panel)] to-transparent" />

          {!geral && nav === "lingueta"
            ? (["l", "r"] as const).map((lado) => {
                const lista = lado === "l" ? escondidasE.slice().reverse() : escondidasD
                const on = lista.length > 0
                return (
                  <button
                    key={lado}
                    type="button"
                    data-tongue={lado}
                    data-on={on || undefined}
                    data-open={(on && perto[lado]) || undefined}
                    tabIndex={on ? 0 : -1}
                    aria-label={(lado === "l" ? "Voltar para " : "Ir para ") + (lista[0]?.label ?? "")}
                    onClick={() => lista[0] && irPara(lista[0].id)}
                    className={cn("muriki-kb-tongue", lado === "l" ? "muriki-kb-tongue-l" : "muriki-kb-tongue-r")}
                  >
                    {lado === "l" ? <CaretLeftIcon className="size-[13px]" weight="bold" /> : null}
                    <span className="muriki-kb-tongue-body">
                      <b className="font-semibold tabular-nums">{lista.length}</b>
                      <span className="inline-flex gap-2.5">
                        {lista.slice(0, 3).map((c) => (
                          <span key={c.id} className="inline-flex items-center gap-[5px]">
                            <KanbanStatusIcon status={c.id} size={13} />
                            {c.label}
                          </span>
                        ))}
                      </span>
                    </span>
                    {lado === "r" ? <CaretRightIcon className="size-[13px]" weight="bold" /> : null}
                  </button>
                )
              })
            : null}

          {!geral && nav === "lombadas"
            ? (["l", "r"] as const).map((lado) => {
                const lista = lado === "l" ? escondidasE : escondidasD
                return (
                  <div key={lado} data-spines={lado} className={cn("muriki-kb-spines", lado === "l" ? "left-2" : "right-2")}>
                    {lista.map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        style={{ ...tomDaColuna(c.id), zIndex: lado === "r" ? lista.length - i : i + 1 }}
                        onClick={() => irPara(c.id)}
                        aria-label={`${c.label}, ${daColuna(c.id).length} tarefas`}
                        className="muriki-kb-spine"
                      >
                        <KanbanStatusIcon status={c.id} />
                        <span className="muriki-kb-spine-l">{c.label}</span>
                        <b className="font-semibold tabular-nums">{daColuna(c.id).length}</b>
                      </button>
                    ))}
                  </div>
                )
              })
            : null}
        </div>
      </div>

      {!geral && nav === "paginas" ? (
        <div data-slot="kanban-pages" className="flex h-10 flex-none items-center justify-center gap-2.5 px-4 text-xs text-muted-foreground shadow-[inset_0_1px_0_var(--kb-hair)]">
          <span className="min-w-0 flex-1 truncate text-right">
            {paginas > 1 ? (
              <>
                Página <b className="font-semibold text-foreground-strong">{pagina + 1}</b> de {paginas}
              </>
            ) : (
              "Todas as colunas à vista"
            )}
          </span>
          <Button variant="ghost" size="icon-xs" aria-label="Página anterior" disabled={pagina === 0} onClick={() => irPagina(pagina - 1)}>
            <CaretLeftIcon />
          </Button>
          <div className="flex gap-1.5">
            {Array.from({ length: paginas }, (_, p) => (
              <button
                key={p}
                type="button"
                aria-label={`Página ${p + 1}: ${nomesDaPagina(p)}`}
                aria-current={p === pagina || undefined}
                onClick={() => irPagina(p)}
                className="h-2 w-2 cursor-pointer rounded-full bg-[color-mix(in_oklch,var(--foreground)_18%,transparent)] transition-[width,background] duration-300 ease-[cubic-bezier(.16,1,.3,1)] aria-[current]:w-[22px] aria-[current]:bg-primary"
              />
            ))}
          </div>
          <Button variant="ghost" size="icon-xs" aria-label="Próxima página" disabled={pagina >= paginas - 1} onClick={() => irPagina(pagina + 1)}>
            <CaretRightIcon />
          </Button>
          <span className="min-w-0 flex-1 truncate">{nomesDaPagina(pagina)}</span>
        </div>
      ) : null}

      <div role="status" aria-live="polite" className="sr-only">
        {aviso}
      </div>

      {drag && erguida
        ? createPortal(
            <div
              className="muriki-kb-lift"
              style={{ width: drag.w }}
              ref={(el) => {
                liftRef.current = el
                if (el && liftPos.current && !el.style.left) {
                  el.style.left = `${liftPos.current.x}px`
                  el.style.top = `${liftPos.current.y}px`
                }
              }}
            >
              <KanbanCard
                task={{ ...erguida, status: drag.col }}
                alert={alertaDe({ ...erguida, status: drag.col })}
                project={projetoDe(erguida.project)}
                now={now}
                className="origin-[50%_20%] cursor-grabbing"
              />
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

const COLUNA = cn(
  "relative box-border flex max-h-full w-[300px] flex-none flex-col rounded-2xl px-2.5 pt-3 pb-2.5",
  "bg-[color-mix(in_oklch,var(--tone)_6%,var(--kb-panel))] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--tone)_12%,transparent)]",
  "transition-[width,background,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
  "data-[over]:bg-[color-mix(in_oklch,var(--tone)_12%,var(--kb-panel))] data-[over]:shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--tone)_45%,transparent)]"
)
const PILULA = "box-border inline-grid h-5 min-w-[22px] place-items-center rounded-full bg-[var(--tone-bg)] px-1.5 text-[11.5px] font-semibold text-foreground-strong tabular-nums"

/* ---------- coluna aberta ---------- */
interface ColunaProps {
  comum: { ref: (el: HTMLElement | null) => void; "data-s": KanbanStatus; "data-over"?: boolean; style: React.CSSProperties }
  col: KanbanColumnSpec
  lista: KanbanTask[]
  count: number
  alertas: number
  piscando: boolean
  alertaDe: (t: KanbanTask) => ReturnType<typeof kanbanAlert>
  corpo: React.ReactNode[]
  sobre: boolean
  criando: boolean
  podeCriar: boolean
  onAbrirCriacao: () => void
  onFecharCriacao: () => void
  onCriar: (titulo: string) => void
  onRecolher: () => void
}

function Coluna({ comum, col: c, lista, count, alertas, piscando, alertaDe, corpo, sobre, criando, podeCriar, onAbrirCriacao, onFecharCriacao, onCriar, onRecolher }: ColunaProps) {
  const noPrazo = lista.filter((t) => !alertaDe(t) && t.due).length
  const semPrazo = lista.filter((t) => !alertaDe(t) && !t.due).length
  const comSub = lista.filter((t) => t.sub)
  const pct = comSub.length
    ? Math.round((comSub.reduce((a, t) => a + t.sub![0], 0) / comSub.reduce((a, t) => a + t.sub![1], 0)) * 100)
    : null
  const fechada = c.id === "done" || c.id === "canceled"
  const segs = fechada
    ? [{ n: lista.length, c: "var(--tone)", l: c.id === "done" ? "concluídas" : "canceladas" }]
    : [
        { n: noPrazo, c: "color-mix(in oklch, var(--tone) 70%, transparent)", l: "no prazo" },
        { n: alertas, c: "var(--tone-red-dot)", l: "com alerta" },
        { n: semPrazo, c: "color-mix(in oklch, var(--muted-foreground) 30%, transparent)", l: "sem prazo" },
      ]
  const estourou = !!c.limit && count > c.limit

  return (
    <section {...comum} aria-label={c.label} className={cn(COLUNA, "group/col", piscando && "muriki-kb-flash")}>
      <header className="flex h-[38px] flex-none items-center gap-2 pr-0.5 pb-2.5 pl-1">
        <KanbanStatusIcon status={c.id} size={15} />
        <b className="text-sm font-semibold whitespace-nowrap text-foreground-strong">{c.label}</b>
        <span
          data-n=""
          title={c.limit ? `Limite da coluna: ${c.limit}` : undefined}
          className={cn(PILULA, estourou && "bg-tone-orange text-tone-orange-foreground")}
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
        <span className="flex gap-px opacity-0 transition-opacity duration-150 group-hover/col:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Opções de ${c.label}`} className="text-muted-foreground" />}>
              <DotsThreeIcon weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRecolher}>
                <ArrowsInSimpleIcon />
                Recolher coluna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
        {podeCriar ? (
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon-xs" aria-label={`Nova tarefa em ${c.label}`} onClick={onAbrirCriacao} className="text-muted-foreground" />}
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
        {corpo.length ? corpo : criando ? null : (
          <div className="rounded-xl px-2.5 py-[22px] text-center text-[12.5px] text-muted-foreground shadow-[inset_0_0_0_1.5px_color-mix(in_oklch,var(--tone)_22%,transparent)]">
            {sobre ? "Solte aqui" : "Nenhuma tarefa"}
          </div>
        )}
      </div>

      {lista.length ? (
        <footer className="mt-2.5 grid flex-none gap-[7px] px-1 pt-2.5 pb-0.5 shadow-[inset_0_1px_0_color-mix(in_oklch,var(--tone)_18%,transparent)]">
          <div className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
            <b className="text-[13px] font-semibold text-foreground-strong tabular-nums">{lista.length}</b>
            {lista.length > 1 ? "tarefas" : "tarefa"}
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
