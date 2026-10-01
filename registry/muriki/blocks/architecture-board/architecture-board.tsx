"use client"

/**
 * Muriki ArchitectureBoard — a bancada do exercício de arquitetura do Code
 * (plano: swell-docs/muriki-code-platform/features/exercicio-arquitetura).
 *
 * Entra no slot `editor` do ExerciseWorkspace, no lugar do editor de código, e tem a mesma pele
 * dele: a moldura de cartão, o rail à esquerda (Peças e Regras, no lugar de Código e Testes), a
 * barra de cima com a ação principal ("Verificar", no lugar de "Rodar testes") e a barra de status.
 *
 * O GRAFO É DA MURIKI, O MOTOR É TROCÁVEL. O bloco recebe e devolve o ArchitectureGraph v1
 * (peças tipadas, ligações de cinco tipos, rótulo livre curto) e nunca o formato do React Flow.
 * A posição é só desenho: não conta na correção.
 *
 * VOCABULÁRIO FECHADO. Só se põem peças da `palette` do exercício, e a ligação nasce "chama" e
 * troca entre os cinco tipos. Nada de peça ou relação inventada: é isso que deixa a regra checar.
 *
 * TUDO TEM CAMINHO DE TECLADO. Selecionada uma peça, a barra de cima mostra "Ligar a…",
 * "Renomear" e "Apagar"; selecionada uma ligação, os cinco tipos. Arrastar é atalho, não o único
 * jeito. ⌘↵ (Ctrl↵) em qualquer lugar da moldura chama `onCheck`.
 *
 * Só apresentação: nada chama API e nada avalia regra. Quem avalia é a API.
 */
import "@xyflow/react/dist/base.css"

import * as React from "react"
import {
  Archive,
  ArrowsSplit,
  Browser,
  Check,
  Circle,
  Cube,
  Database,
  Gear,
  Globe,
  Lightning,
  LinkSimple,
  PencilSimple,
  Plug,
  Queue,
  Square,
  Trash,
  X,
} from "@phosphor-icons/react"
import {
  Background,
  BaseEdge,
  ConnectionMode,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ExerciseSection } from "@/components/blocks/exercise-workspace/exercise-workspace"

// ── o grafo ─────────────────────────────────────────────────────────────

export type Relation = "calls" | "reads" | "writes" | "publishes" | "consumes"

export const RELATIONS: Relation[] = ["calls", "reads", "writes", "publishes", "consumes"]

export interface GraphNode {
  id: string
  kind: string
  label?: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  relation: Relation
  label?: string
}

export interface ArchitectureGraph {
  v: 1
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/** Os limites do schema: o bloco não deixa passar deles, e a API recusa o que passar. */
export const GRAPH_LIMITS = { nodes: 40, edges: 80, label: 60 }

export interface PaletteItem {
  id: string
  title: string
  description?: string
}

export interface BoardRule {
  id: string
  title: string
  /** Sem status, a regra ainda não foi verificada. */
  status?: "pass" | "fail"
}

export interface ArchitectureBoardProps {
  graph: ArchitectureGraph
  onGraphChange: (graph: ArchitectureGraph) => void
  palette: PaletteItem[]
  /** As regras visíveis do exercício, com o status da última verificação. */
  rules: BoardRule[]
  /** `null` = ainda não verificou. */
  summary: { passing: number; total: number } | null
  onCheck?: () => void
  checking?: boolean
  /** Texto curto no lugar do "Verificar" ativo, ex.: "em breve". */
  checkDisabledReason?: string
  checkError?: { kind: "invalid" | "rate_limit" | "network"; message?: string; retryIn?: number } | null
  readOnly?: boolean
  className?: string
}

// cada peça da paleta neutra tem o seu ícone; id desconhecido cai no quadrado
const ICONES: Record<string, React.ElementType> = {
  client: Browser,
  api: Plug,
  service: Cube,
  database: Database,
  cache: Lightning,
  queue: Queue,
  worker: Gear,
  cdn: Globe,
  "load-balancer": ArrowsSplit,
  "object-storage": Archive,
}

function IconeDaPeca({ kind, className }: { kind: string; className?: string }) {
  const Icone = ICONES[kind] ?? Square
  return <Icone aria-hidden className={className} />
}

function proximoId(prefixo: string, existentes: { id: string }[]) {
  let maior = 0
  for (const { id } of existentes) {
    const m = new RegExp(`^${prefixo}-(\\d+)$`).exec(id)
    if (m) maior = Math.max(maior, Number(m[1]))
  }
  return `${prefixo}-${maior + 1}`
}

// A ligação sai do lado da peça que dá para a outra, e entra pelo lado oposto. É só desenho: o
// grafo não guarda alça, e a mesma ligação muda de lado quando a peça é arrastada.
const LARGURA_DA_PECA = 168
const ALTURA_DA_PECA = 52

function lados(de: GraphNode, para: GraphNode) {
  const dx = para.x - de.x
  const dy = para.y - de.y
  if (Math.abs(dx) >= Math.abs(dy) * (LARGURA_DA_PECA / ALTURA_DA_PECA) * 0.5)
    return dx >= 0 ? { saida: "r", entrada: "l" } : { saida: "l", entrada: "r" }
  return dy >= 0 ? { saida: "b", entrada: "t" } : { saida: "t", entrada: "b" }
}

function rotuloLimpo(texto: string) {
  // sem caractere de controle e no limite do schema; vazio vira "sem rótulo"
  const limpo = texto.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, GRAPH_LIMITS.label)
  return limpo || undefined
}

// ── o que as peças e as ligações leem do bloco ──────────────────────────

interface Bancada {
  tituloDe: (kind: string) => string
  editando: string | null
  setEditando: (id: string | null) => void
  renomear: (id: string, texto: string) => void
  selecionarLigacao: (id: string) => void
  readOnly: boolean
}

const BancadaContexto = React.createContext<Bancada | null>(null)

function useBancada() {
  const b = React.useContext(BancadaContexto)
  if (!b) throw new Error("ArchitectureBoard: peça fora da bancada")
  return b
}

function CampoDeRotulo({ id, valor, className }: { id: string; valor?: string; className?: string }) {
  const { renomear, setEditando } = useBancada()
  const t = useTranslate()
  return (
    <input
      autoFocus
      defaultValue={valor ?? ""}
      maxLength={GRAPH_LIMITS.label}
      aria-label={t("architecture_board.label")}
      placeholder={t("architecture_board.no_label")}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === "Enter") renomear(id, e.currentTarget.value)
        if (e.key === "Escape") setEditando(null)
      }}
      onBlur={(e) => renomear(id, e.currentTarget.value)}
      className={cn(
        "nodrag min-w-0 rounded-[5px] bg-field px-1 text-[13px] text-foreground-strong outline-none ring-1 ring-primary",
        className
      )}
    />
  )
}

// ── a peça ──────────────────────────────────────────────────────────────

type PecaNode = Node<{ kind: string; label?: string }, "peca">

const ALCAS = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
]

function Peca({ id, data, selected }: NodeProps<PecaNode>) {
  const { tituloDe, editando, setEditando, readOnly } = useBancada()
  const t = useTranslate()
  return (
    <div
      onDoubleClick={() => !readOnly && setEditando(id)}
      className={cn(
        "group flex w-[168px] min-h-[52px] items-center gap-2.5 rounded-[10px] bg-card py-2 pr-2.5 pl-2 text-left",
        "shadow-[0_0_0_1px_var(--input),0_1px_2px_oklch(0_0_0/0.06)]",
        selected && "shadow-[0_0_0_2px_var(--primary),0_1px_2px_oklch(0_0_0/0.06)]"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary-subtle text-primary-subtle-foreground">
        <IconeDaPeca kind={data.kind} className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-mono text-[9.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {tituloDe(data.kind)}
        </span>
        {editando === id ? (
          <CampoDeRotulo id={id} valor={data.label} />
        ) : (
          <span
            className={cn(
              "truncate text-[13px] leading-[18px]",
              data.label ? "font-medium text-foreground-strong" : "text-muted-foreground/80"
            )}
          >
            {data.label ?? t("architecture_board.no_label")}
          </span>
        )}
      </span>
      {ALCAS.map((a) => (
        <Handle
          key={a.id}
          id={a.id}
          type="source"
          position={a.position}
          isConnectable={!readOnly}
          className={cn(
            "!size-2.5 !rounded-full !border-2 !border-card !bg-primary opacity-0 transition-opacity",
            "group-hover:opacity-100",
            selected && "opacity-100"
          )}
        />
      ))}
    </div>
  )
}

// ── a ligação ───────────────────────────────────────────────────────────

type LigacaoEdge = Edge<{ relation: Relation; label?: string }, "ligacao">

function Ligacao(props: EdgeProps<LigacaoEdge>) {
  const { id, data, selected, markerEnd } = props
  const { editando, setEditando, selecionarLigacao, readOnly } = useBancada()
  const t = useTranslate()
  const [caminho, x, y] = getSmoothStepPath({ ...props, borderRadius: 10 })
  const relation = data?.relation ?? "calls"
  return (
    <>
      <BaseEdge
        id={id}
        path={caminho}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "var(--primary)" : "color-mix(in oklab, var(--muted-foreground) 70%, transparent)",
          strokeWidth: selected ? 1.75 : 1.25,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
        >
          {editando === id ? (
            <CampoDeRotulo id={id} valor={data?.label} className="w-36 text-[11.5px]" />
          ) : (
            <button
              type="button"
              onClick={() => selecionarLigacao(id)}
              onDoubleClick={() => !readOnly && setEditando(id)}
              className={cn(
                "flex max-w-[200px] items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[11px] leading-4 whitespace-nowrap",
                "shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                selected ? "text-primary shadow-[0_0_0_1.5px_var(--primary)]" : "text-muted-foreground"
              )}
            >
              <span className="font-medium">{t(`architecture_board.relations.${relation}`)}</span>
              {data?.label ? <span className="truncate text-foreground">· {data.label}</span> : null}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

// fora do componente: o React Flow pede o mesmo objeto em todo render
const TIPOS_DE_PECA = { peca: Peca }
const TIPOS_DE_LIGACAO = { ligacao: Ligacao }

// ── a bancada ───────────────────────────────────────────────────────────

type Selecao = { tipo: "peca" | "ligacao"; id: string } | null

export function ArchitectureBoard(props: ArchitectureBoardProps) {
  return (
    <ReactFlowProvider>
      <Moldura {...props} />
    </ReactFlowProvider>
  )
}

function Moldura({
  graph,
  onGraphChange,
  palette,
  rules,
  summary,
  onCheck,
  checking,
  checkDisabledReason,
  checkError,
  readOnly = false,
  className,
}: ArchitectureBoardProps) {
  const t = useTranslate()
  const { screenToFlowPosition } = useReactFlow()
  const palco = React.useRef<HTMLDivElement>(null)
  const [selecao, setSelecao] = React.useState<Selecao>(null)
  const [editando, setEditando] = React.useState<string | null>(null)
  // o React Flow mede cada peça e precisa receber a medida de volta; ela não é do grafo
  const medidas = React.useRef(new Map<string, { width: number; height: number }>())
  const [, remedir] = React.useReducer((n: number) => n + 1, 0)

  const titulos = React.useMemo(() => new Map(palette.map((p) => [p.id, p.title])), [palette])
  const cheioDePecas = graph.nodes.length >= GRAPH_LIMITS.nodes
  const cheioDeLigacoes = graph.edges.length >= GRAPH_LIMITS.edges

  const mudar = (nodes: GraphNode[], edges: GraphEdge[]) => onGraphChange({ v: 1, nodes, edges })

  const nodes: PecaNode[] = graph.nodes.map((n) => ({
    id: n.id,
    type: "peca",
    position: { x: n.x, y: n.y },
    data: { kind: n.kind, label: n.label },
    selected: selecao?.tipo === "peca" && selecao.id === n.id,
    measured: medidas.current.get(n.id),
  }))
  const porId = new Map(graph.nodes.map((n) => [n.id, n]))
  const edges: LigacaoEdge[] = graph.edges.map((e) => {
    const marcada = selecao?.tipo === "ligacao" && selecao.id === e.id
    const de = porId.get(e.from)
    const para = porId.get(e.to)
    const lado = de && para ? lados(de, para) : undefined
    return {
      id: e.id,
      type: "ligacao",
      source: e.from,
      target: e.to,
      sourceHandle: lado?.saida,
      targetHandle: lado?.entrada,
      data: { relation: e.relation, label: e.label },
      selected: marcada,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: marcada ? "var(--primary)" : "var(--muted-foreground)",
      },
    }
  })

  const porPeca = (kind: string, ponto?: { x: number; y: number }) => {
    if (readOnly || cheioDePecas) return
    let posicao = ponto
    if (!posicao) {
      // pelo clique, a peça nasce no meio da vista; se o lugar está ocupado, desce uma peça, e
      // depois de quatro tentativas anda uma coluna: nunca nasce em cima de outra
      const caixa = palco.current?.getBoundingClientRect()
      const centro = caixa
        ? screenToFlowPosition({ x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2 })
        : { x: 0, y: 0 }
      const ocupado = (x: number, y: number) =>
        graph.nodes.some((n) => Math.abs(n.x - x) < LARGURA_DA_PECA && Math.abs(n.y - y) < ALTURA_DA_PECA + 12)
      let tentativa = 0
      do {
        posicao = {
          x: centro.x - LARGURA_DA_PECA / 2 + Math.floor(tentativa / 4) * (LARGURA_DA_PECA + 40),
          y: centro.y - ALTURA_DA_PECA / 2 + (tentativa % 4) * (ALTURA_DA_PECA + 24),
        }
        tentativa++
      } while (ocupado(posicao.x, posicao.y) && tentativa < 24)
    }
    const id = proximoId("n", graph.nodes)
    mudar([...graph.nodes, { id, kind, x: Math.round(posicao.x), y: Math.round(posicao.y) }], graph.edges)
    setSelecao({ tipo: "peca", id })
  }

  const ligar = (from: string, to: string, relation: Relation = "calls") => {
    if (readOnly || cheioDeLigacoes || from === to) return
    if (graph.edges.some((e) => e.from === from && e.to === to && e.relation === relation)) return
    const id = proximoId("e", graph.edges)
    mudar(graph.nodes, [...graph.edges, { id, from, to, relation }])
    setSelecao({ tipo: "ligacao", id })
  }

  const apagar = (sel: NonNullable<Selecao>) => {
    if (sel.tipo === "peca")
      mudar(
        graph.nodes.filter((n) => n.id !== sel.id),
        graph.edges.filter((e) => e.from !== sel.id && e.to !== sel.id)
      )
    else
      mudar(
        graph.nodes,
        graph.edges.filter((e) => e.id !== sel.id)
      )
    setSelecao(null)
  }

  const trocarRelacao = (id: string, relation: Relation) => {
    const atual = graph.edges.find((e) => e.id === id)
    if (!atual || atual.relation === relation) return
    // trocar para um tipo que já existe entre as mesmas peças repetiria a ligação
    if (graph.edges.some((e) => e.id !== id && e.from === atual.from && e.to === atual.to && e.relation === relation))
      return
    mudar(
      graph.nodes,
      graph.edges.map((e) => (e.id === id ? { ...e, relation } : e))
    )
  }

  const renomear = (id: string, texto: string) => {
    const label = rotuloLimpo(texto)
    if (graph.nodes.some((n) => n.id === id))
      mudar(
        graph.nodes.map((n) => (n.id === id ? { ...n, label } : n)),
        graph.edges
      )
    else
      mudar(
        graph.nodes,
        graph.edges.map((e) => (e.id === id ? { ...e, label } : e))
      )
    setEditando(null)
  }

  const aoMudarPecas = (changes: NodeChange<PecaNode>[]) => {
    let nos = graph.nodes
    let mudou = false
    let removidos: string[] = []
    for (const c of changes) {
      if (c.type === "dimensions" && c.dimensions) {
        medidas.current.set(c.id, c.dimensions)
        remedir()
      } else if (c.type === "position" && c.position && !readOnly) {
        const { x, y } = c.position
        nos = nos.map((n) => (n.id === c.id ? { ...n, x: Math.round(x), y: Math.round(y) } : n))
        mudou = true
      } else if (c.type === "select") {
        if (c.selected) setSelecao({ tipo: "peca", id: c.id })
        else setSelecao((s) => (s?.tipo === "peca" && s.id === c.id ? null : s))
      } else if (c.type === "remove" && !readOnly) {
        removidos = [...removidos, c.id]
      }
    }
    if (removidos.length) {
      nos = nos.filter((n) => !removidos.includes(n.id))
      mudar(
        nos,
        graph.edges.filter((e) => !removidos.includes(e.from) && !removidos.includes(e.to))
      )
      setSelecao(null)
    } else if (mudou) mudar(nos, graph.edges)
  }

  const aoMudarLigacoes = (changes: EdgeChange<LigacaoEdge>[]) => {
    let removidas: string[] = []
    for (const c of changes) {
      if (c.type === "select") {
        if (c.selected) setSelecao({ tipo: "ligacao", id: c.id })
        else setSelecao((s) => (s?.tipo === "ligacao" && s.id === c.id ? null : s))
      } else if (c.type === "remove" && !readOnly) removidas = [...removidas, c.id]
    }
    if (removidas.length) {
      mudar(
        graph.nodes,
        graph.edges.filter((e) => !removidas.includes(e.id))
      )
      setSelecao(null)
    }
  }

  const bancada: Bancada = {
    tituloDe: (kind) => titulos.get(kind) ?? kind,
    editando,
    setEditando,
    renomear,
    selecionarLigacao: (id) => setSelecao({ tipo: "ligacao", id }),
    readOnly,
  }

  const pecaSelecionada = selecao?.tipo === "peca" ? graph.nodes.find((n) => n.id === selecao.id) : undefined
  const ligacaoSelecionada = selecao?.tipo === "ligacao" ? graph.edges.find((e) => e.id === selecao.id) : undefined

  return (
    <BancadaContexto.Provider value={bancada}>
      <section
        data-slot="architecture-board"
        aria-label={t("architecture_board.label_board")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onCheck && !checkDisabledReason) {
            e.preventDefault()
            onCheck()
          }
        }}
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs lg:flex-1 lg:flex-row",
          className
        )}
      >
        <div className="muriki-scroll flex shrink-0 flex-col border-muted bg-rail max-lg:border-b lg:w-[248px] lg:overflow-y-auto lg:border-r">
          <ExerciseSection title={t("architecture_board.pieces")} divider={false}>
            <ul className="m-0 flex list-none flex-col gap-px px-1.5 pb-2">
              {palette.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    draggable={!readOnly && !cheioDePecas}
                    disabled={readOnly || cheioDePecas}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/x-muriki-piece", p.id)
                      e.dataTransfer.effectAllowed = "copy"
                    }}
                    onClick={() => porPeca(p.id)}
                    title={p.description}
                    aria-label={t("architecture_board.add_piece", { name: p.title })}
                    className="flex h-8 w-full cursor-grab items-center gap-2 rounded-md px-2 text-left text-[12.5px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 active:cursor-grabbing disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <IconeDaPeca kind={p.id} className="size-[15px] text-muted-foreground" />
                    <span className="truncate">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            {cheioDePecas ? (
              <span className="block px-4 pb-2.5 text-[11.5px] text-muted-foreground">
                {t("architecture_board.limit_nodes", { max: GRAPH_LIMITS.nodes })}
              </span>
            ) : null}
          </ExerciseSection>
          <Regras rules={rules} summary={summary} checkError={checkError} />
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
          <div className="flex min-h-[41px] items-center gap-1.5 border-b border-muted py-1.5 pr-2 pl-3">
            <Acoes
              peca={pecaSelecionada}
              ligacao={ligacaoSelecionada}
              graph={graph}
              readOnly={readOnly}
              tituloDe={bancada.tituloDe}
              onLigar={ligar}
              onRelacao={trocarRelacao}
              onRenomear={(id) => setEditando(id)}
              onApagar={() => selecao && apagar(selecao)}
            />
            <span className="ml-auto flex shrink-0 items-center gap-2">
              {checkDisabledReason ? (
                <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
                  {checkDisabledReason}
                </span>
              ) : null}
              <Button
                variant="primary"
                onClick={onCheck}
                disabled={!onCheck || !!checkDisabledReason}
                loading={checking}
              >
                <Check aria-hidden weight="bold" />
                {t("architecture_board.check")}
              </Button>
            </span>
          </div>

          <div
            ref={palco}
            className="relative min-h-0 flex-1"
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("application/x-muriki-piece")) {
                e.preventDefault()
                e.dataTransfer.dropEffect = "copy"
              }
            }}
            onDrop={(e) => {
              const kind = e.dataTransfer.getData("application/x-muriki-piece")
              if (!kind || !titulos.has(kind)) return
              e.preventDefault()
              const ponto = screenToFlowPosition({ x: e.clientX, y: e.clientY })
              porPeca(kind, { x: ponto.x - 84, y: ponto.y - 26 })
            }}
          >
            <ReactFlow<PecaNode, LigacaoEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={TIPOS_DE_PECA}
              edgeTypes={TIPOS_DE_LIGACAO}
              onNodesChange={aoMudarPecas}
              onEdgesChange={aoMudarLigacoes}
              onConnect={(c: Connection) => ligar(c.source, c.target)}
              onPaneClick={() => {
                setSelecao(null)
                setEditando(null)
              }}
              connectionMode={ConnectionMode.Loose}
              connectionLineStyle={{ stroke: "var(--primary)", strokeWidth: 1.5 }}
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              elementsSelectable
              deleteKeyCode={readOnly ? null : ["Backspace", "Delete"]}
              fitView
              fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
              minZoom={0.4}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              aria-label={t("architecture_board.canvas")}
              className="bg-card"
            >
              <Background gap={18} size={1} color="var(--input)" />
            </ReactFlow>
            {graph.nodes.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <span className="max-w-[260px] text-center text-[13px] leading-5 text-muted-foreground">
                  {t("architecture_board.empty")}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex h-[30px] shrink-0 items-center gap-3.5 overflow-hidden border-t border-muted px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
            <span className="truncate">
              {t("architecture_board.status", { nodes: graph.nodes.length, edges: graph.edges.length })}
            </span>
            <span className="max-sm:hidden">{t("architecture_board.shortcut")}</span>
          </div>
        </div>
      </section>
    </BancadaContexto.Provider>
  )
}

// ── a barra de ações da seleção ─────────────────────────────────────────

function Acoes({
  peca,
  ligacao,
  graph,
  readOnly,
  tituloDe,
  onLigar,
  onRelacao,
  onRenomear,
  onApagar,
}: {
  peca?: GraphNode
  ligacao?: GraphEdge
  graph: ArchitectureGraph
  readOnly: boolean
  tituloDe: (kind: string) => string
  onLigar: (from: string, to: string, relation: Relation) => void
  onRelacao: (id: string, relation: Relation) => void
  onRenomear: (id: string) => void
  onApagar: () => void
}) {
  const t = useTranslate()
  if (readOnly || (!peca && !ligacao))
    return <span className="truncate text-[12px] text-muted-foreground">{t("architecture_board.hint")}</span>

  const comuns = (id: string) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => onRenomear(id)}>
        <PencilSimple aria-hidden />
        {t("architecture_board.rename")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onApagar}>
        <Trash aria-hidden />
        {t("architecture_board.delete")}
      </Button>
    </>
  )

  if (ligacao)
    return (
      <span className="flex min-w-0 items-center gap-1">
        <span role="radiogroup" aria-label={t("architecture_board.relation")} className="flex items-center gap-0.5">
          {RELATIONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={ligacao.relation === r}
              onClick={() => onRelacao(ligacao.id, r)}
              className={cn(
                "h-7 rounded-[7px] px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                ligacao.relation === r
                  ? "bg-primary-subtle font-medium text-primary-subtle-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(`architecture_board.relations.${r}`)}
            </button>
          ))}
        </span>
        <span aria-hidden className="mx-1 h-4 w-px bg-input" />
        {comuns(ligacao.id)}
      </span>
    )

  return (
    <span className="flex min-w-0 items-center gap-1">
      <LigarA peca={peca!} graph={graph} tituloDe={tituloDe} onLigar={onLigar} />
      {comuns(peca!.id)}
    </span>
  )
}

function LigarA({
  peca,
  graph,
  tituloDe,
  onLigar,
}: {
  peca: GraphNode
  graph: ArchitectureGraph
  tituloDe: (kind: string) => string
  onLigar: (from: string, to: string, relation: Relation) => void
}) {
  const t = useTranslate()
  const [aberto, setAberto] = React.useState(false)
  const [relacao, setRelacao] = React.useState<Relation>("calls")
  const destinos = graph.nodes.filter((n) => n.id !== peca.id)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger render={<Button variant="ghost" size="sm" disabled={destinos.length === 0} />}>
        <LinkSimple aria-hidden />
        {t("architecture_board.connect_to")}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <span className="block px-1.5 pt-0.5 pb-1.5 font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {t("architecture_board.relation")}
        </span>
        <span role="radiogroup" aria-label={t("architecture_board.relation")} className="flex flex-wrap gap-1 px-1 pb-2">
          {RELATIONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={relacao === r}
              onClick={() => setRelacao(r)}
              className={cn(
                "h-7 rounded-[7px] px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                relacao === r
                  ? "bg-primary-subtle font-medium text-primary-subtle-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(`architecture_board.relations.${r}`)}
            </button>
          ))}
        </span>
        <span className="block border-t border-muted px-1.5 pt-2 pb-1 font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {t("architecture_board.target")}
        </span>
        <ul className="muriki-scroll m-0 flex max-h-56 list-none flex-col gap-px overflow-y-auto p-0">
          {destinos.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  onLigar(peca.id, n.id, relacao)
                  setAberto(false)
                }}
                className="flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left text-[12.5px] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <IconeDaPeca kind={n.kind} className="size-[15px] shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{n.label ?? tituloDe(n.kind)}</span>
                {n.label ? <span className="truncate text-[11px] text-muted-foreground">{tituloDe(n.kind)}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

// ── as regras visíveis ──────────────────────────────────────────────────

function Regras({
  rules,
  summary,
  checkError,
}: Pick<ArchitectureBoardProps, "rules" | "summary" | "checkError">) {
  const t = useTranslate()
  let resumo: React.ReactNode
  if (checkError) resumo = <Badge tone="red" dot>{t("architecture_board.error_badge")}</Badge>
  else if (!summary) resumo = <Badge tone="gray">{t("architecture_board.not_checked")}</Badge>
  else
    resumo = (
      <Badge tone={summary.passing === summary.total ? "green" : "red"} dot>
        {t("architecture_board.passing", { passing: summary.passing, total: summary.total })}
      </Badge>
    )
  return (
    <ExerciseSection title={t("architecture_board.rules")} end={resumo} className="bg-rail">
      {checkError ? (
        <div
          role="alert"
          className="mx-2 mb-1.5 flex flex-col gap-1 rounded-lg bg-destructive-subtle px-3 py-2.5 text-destructive-subtle-foreground"
        >
          <span className="text-[12.5px] font-medium">
            {checkError.kind === "rate_limit" && checkError.retryIn
              ? t("architecture_board.errors.rate_limit_wait", { seconds: checkError.retryIn })
              : t(`architecture_board.errors.${checkError.kind}`)}
          </span>
          {checkError.message ? (
            <span className="text-[11.5px] leading-4 break-words">{checkError.message}</span>
          ) : null}
        </div>
      ) : null}
      <ul aria-label={t("architecture_board.rules")} className="m-0 flex list-none flex-col gap-px px-1.5">
        {rules.map((r) => (
          <li key={r.id} className="flex items-start gap-2 rounded-md px-2 py-1.5">
            {r.status === "pass" ? (
              <>
                <Check aria-hidden weight="bold" className="mt-0.5 size-3 shrink-0 text-success" />
                <span className="sr-only">{t("architecture_board.pass")}</span>
              </>
            ) : r.status === "fail" ? (
              <>
                <X aria-hidden weight="bold" className="mt-0.5 size-3 shrink-0 text-destructive" />
                <span className="sr-only">{t("architecture_board.fail")}</span>
              </>
            ) : (
              <Circle aria-hidden className="mt-0.5 size-3 shrink-0 text-muted-foreground/60" />
            )}
            <span
              className={cn(
                "text-[12.5px] leading-[17px]",
                r.status === "fail" ? "text-foreground-strong" : "text-foreground"
              )}
            >
              {r.title}
            </span>
          </li>
        ))}
      </ul>
      <span className="block px-4 pt-1.5 pb-2.5 text-[11.5px] text-muted-foreground">
        {t("architecture_board.check_hint")}
      </span>
    </ExerciseSection>
  )
}
