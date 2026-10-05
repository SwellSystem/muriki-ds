"use client"

/**
 * Muriki ArchitectureBoard — a bancada do exercício de arquitetura do Code
 * (plano: swell-docs/muriki-code-platform/features/exercicio-arquitetura; grafo v2:
 * swell-docs/muriki-api/features/arch-cloud/cl-desenho.md).
 *
 * Entra no slot `editor` do ExerciseWorkspace, no lugar do editor de código, e tem a mesma pele
 * dele: a moldura de cartão, o rail à esquerda (Provedor, Peças, Grupos e Regras), a barra de cima
 * com a ação principal ("Verificar", no lugar de "Rodar testes") e a barra de status.
 *
 * O GRAFO É DA MURIKI, O MOTOR É TROCÁVEL. O bloco recebe e devolve o ArchitectureGraph v2
 * (architecture-graph.ts: peças tipadas, ligações de cinco tipos, grupos aninhados, provedor e
 * serviço) e nunca o formato do React Flow. A posição é só desenho: não conta na correção. Quem
 * está dentro de quem é o `parent`, que o bloco decide quando a peça ou o grupo é solto.
 *
 * VOCABULÁRIO FECHADO. Só se põem peças da `palette` e grupos de `groups`, do exercício. A ligação
 * nasce "chama" e troca entre os cinco tipos. O grupo só entra onde a tabela de aninhamento deixa
 * (`canNest`), e nunca recebe ligação.
 *
 * PROVEDOR É APARÊNCIA. A regra olha o kind; o serviço (Amazon SQS, Pub/Sub…) é o nome que a
 * pessoa reconhece. Escolher um provedor dá a cada peça o primeiro serviço do tipo; a pessoa troca
 * no inspetor. Genérico tira todos.
 *
 * SIMULAR É PASSAGEIRO. O modo Simular executa o desenho (`simulateFlow`): um pulso parte das peças
 * Cliente e anda pelas ligações no sentido do trabalho; derrubar uma peça, uma zona ou uma região
 * mostra até onde ele ainda chega. Nada disso vai para o grafo, e sair do modo volta tudo. Durante a
 * simulação, o desenho não se edita.
 *
 * TUDO TEM CAMINHO DE TECLADO. Selecionada uma peça, a barra de cima mostra "Serviço",
 * "Ligar a…", "Mover para…", "Renomear" e "Apagar"; um grupo, "Mover para…", "Renomear" e
 * "Apagar"; uma ligação, os cinco tipos. Arrastar é atalho, não o único jeito. ⌘↵ (Ctrl↵) em
 * qualquer lugar da moldura chama `onCheck`.
 *
 * Só apresentação: nada chama API e nada avalia regra. Quem avalia é a API.
 */
import "@xyflow/react/dist/base.css"

import * as React from "react"
import {
  Archive,
  ArrowsOutCardinal,
  ArrowsSplit,
  ArrowCounterClockwise,
  Bell,
  Broadcast,
  Browser,
  CaretDown,
  ChartLine,
  Check,
  Circle,
  Clock,
  Copy,
  Cube,
  Database,
  Door,
  Gear,
  Globe,
  Handshake,
  IdentificationBadge,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  PencilSimple,
  Plug,
  Pulse,
  Queue,
  ShareNetwork,
  Square,
  SquareHalf,
  Trash,
  Tray,
  Vault,
  X,
  XCircle,
} from "@phosphor-icons/react"
import {
  Background,
  BaseEdge,
  ConnectionMode,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  NodeResizeControl,
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
import { CloudServiceIcon } from "@/components/ui/cloud-service-icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ExerciseSection } from "@/components/blocks/exercise-workspace/exercise-workspace"

import {
  GRAPH_LIMITS,
  PROVIDERS,
  RELATIONS,
  absoluteOf,
  canNest,
  chainOf,
  deleteGroup,
  nextId,
  reparent,
  simulateFlow,
  subtreeOf,
  type ArchitectureGraphV2,
  type FlowSimulation,
  type CloudProvider,
  type GraphEdge,
  type GraphGroup,
  type GraphNode,
  type GroupType,
  type Relation,
} from "./architecture-graph"

export * from "./architecture-graph"

// ── o que vem do exercício ──────────────────────────────────────────────

/** Um serviço de nuvem que serve a uma peça (`palette[].services` do exercício). */
export interface PaletteService {
  /** `<provedor>.<serviço>`, ex.: "aws.sqs". */
  id: string
  /** O nome oficial, sem tradução: "Amazon SQS". */
  name: string
  /** O serviço não é equivalente fiel do tipo (o Logic Apps como agendador). */
  approximate?: boolean
}

export interface PaletteItem {
  id: string
  title: string
  description?: string
  /** Os serviços dos três provedores que servem a este tipo, na ordem do catálogo. */
  services?: PaletteService[]
}

/** Um tipo de grupo do exercício (`groups`). */
export interface GroupPaletteItem {
  id: GroupType
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
  /** Sempre v2. Rascunho v1: passe por `toV2`. */
  graph: ArchitectureGraphV2
  onGraphChange: (graph: ArchitectureGraphV2) => void
  palette: PaletteItem[]
  /** Os grupos que o exercício deixa usar. Vazio (ou ausente) esconde a seção de Grupos. */
  groups?: GroupPaletteItem[]
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
  // as peças do pacote 2026.10.03-3
  "api-gateway": Door,
  "identity-provider": IdentificationBadge,
  "search-index": MagnifyingGlass,
  "read-replica": Copy,
  scheduler: Clock,
  "dead-letter-queue": Tray,
  telemetry: ChartLine,
  alerting: Bell,
  // as peças do pacote 2026.10.04-2
  "event-bus": ShareNetwork,
  "third-party": Handshake,
  "secrets-vault": Vault,
  "realtime-gateway": Broadcast,
}

function IconeDaPeca({ kind, className }: { kind: string; className?: string }) {
  const Icone = ICONES[kind] ?? Square
  return <Icone aria-hidden className={className} />
}

/** Os serviços de um tipo num provedor, na ordem do catálogo. */
function servicosDe(item: PaletteItem | undefined, provider: CloudProvider | undefined) {
  if (!item?.services || !provider) return []
  return item.services.filter((s) => s.id.startsWith(`${provider}.`))
}

// A ligação sai do lado da peça que dá para a outra, e entra pelo lado oposto. É só desenho: o
// grafo não guarda alça, e a mesma ligação muda de lado quando a peça é arrastada.
const LARGURA_DA_PECA = 168
const ALTURA_DA_PECA = 52

function lados(de: { x: number; y: number }, para: { x: number; y: number }) {
  const dx = para.x - de.x
  const dy = para.y - de.y
  if (Math.abs(dx) >= Math.abs(dy) * (LARGURA_DA_PECA / ALTURA_DA_PECA) * 0.5)
    return dx >= 0 ? { saida: "r", entrada: "l" } : { saida: "l", entrada: "r" }
  return dy >= 0 ? { saida: "b", entrada: "t" } : { saida: "t", entrada: "b" }
}

function rotuloLimpo(texto: string) {
  // sem caractere de controle e no limite do schema; vazio vira "sem rótulo"
  const limpo = texto.replace(/\p{Cc}/gu, "").trim().slice(0, GRAPH_LIMITS.label)
  return limpo || undefined
}

// ── a geometria dos grupos ──────────────────────────────────────────────

// o canto de cima fica para o chip com o tipo; nada de dentro entra nele
const MARGEM = 16
const TOPO = 34
const GRUPO_MINIMO = { w: 180, h: 110 }
const TAMANHO_NOVO: Record<GroupType, { w: number; h: number }> = {
  region: { w: 640, h: 420 },
  vpc: { w: 520, h: 340 },
  zone: { w: 400, h: 260 },
  "public-subnet": { w: 300, h: 170 },
  "private-subnet": { w: 300, h: 170 },
}

/** O tamanho mínimo de um grupo: a caixa que envolve o que está dentro, com a margem. */
function minimoDoGrupo(graph: ArchitectureGraphV2, id: string, alturas: Map<string, number>) {
  let w = GRUPO_MINIMO.w
  let h = GRUPO_MINIMO.h
  for (const n of graph.nodes)
    if (n.parent === id) {
      w = Math.max(w, n.x + LARGURA_DA_PECA + MARGEM)
      h = Math.max(h, n.y + (alturas.get(n.id) ?? ALTURA_DA_PECA) + MARGEM)
    }
  for (const g of graph.groups)
    if (g.parent === id) {
      w = Math.max(w, g.x + g.w + MARGEM)
      h = Math.max(h, g.y + g.h + MARGEM)
    }
  return { w, h }
}

/**
 * Depois de soltar algo num grupo: o que entrou é trazido para dentro da caixa (abaixo do chip e
 * dentro da margem). Só se não couber de jeito nenhum o grupo (e os de cima) cresce. Nada fica fora
 * da caixa, e o grupo não cresce por cima dos vizinhos à toa.
 */
function acomodar(
  graph: ArchitectureGraphV2,
  item: { kind: "node" | "group"; id: string },
  alturas: Map<string, number>
): ArchitectureGraphV2 {
  let g = graph
  const lista = item.kind === "node" ? g.nodes : g.groups
  const atual = lista.find((x) => x.id === item.id)
  if (!atual?.parent) return g
  const pai = g.groups.find((x) => x.id === atual.parent)
  const largura = item.kind === "node" ? LARGURA_DA_PECA : (atual as GraphGroup).w
  const altura = item.kind === "node" ? (alturas.get(item.id) ?? ALTURA_DA_PECA) : (atual as GraphGroup).h
  const x = Math.max(MARGEM, Math.min(atual.x, (pai?.w ?? Infinity) - largura - MARGEM))
  const y = Math.max(TOPO, Math.min(atual.y, (pai?.h ?? Infinity) - altura - MARGEM))
  if (x !== atual.x || y !== atual.y) {
    g =
      item.kind === "node"
        ? { ...g, nodes: g.nodes.map((n) => (n.id === item.id ? { ...n, x, y } : n)) }
        : { ...g, groups: g.groups.map((n) => (n.id === item.id ? { ...n, x, y } : n)) }
  }
  return crescer(g, atual.parent, alturas)
}

/** O grupo e os de cima crescem até caber o que está dentro. */
function crescer(graph: ArchitectureGraphV2, groupId: string | undefined, alturas: Map<string, number>) {
  let g = graph
  for (let acima = groupId; acima; acima = g.groups.find((x) => x.id === acima)?.parent) {
    const min = minimoDoGrupo(g, acima, alturas)
    const grupo = g.groups.find((x) => x.id === acima)
    if (!grupo || (grupo.w >= min.w && grupo.h >= min.h)) break
    g = {
      ...g,
      groups: g.groups.map((x) => (x.id === acima ? { ...x, w: Math.max(x.w, min.w), h: Math.max(x.h, min.h) } : x)),
    }
  }
  return g
}

/** Onde entra, pelo clique ou pelo teclado, algo novo num grupo: embaixo do que já está lá. */
function lugarLivre(graph: ArchitectureGraphV2, groupId: string, alturas: Map<string, number>, fora?: string) {
  let y = TOPO
  for (const n of graph.nodes)
    if (n.parent === groupId && n.id !== fora) y = Math.max(y, n.y + (alturas.get(n.id) ?? ALTURA_DA_PECA) + MARGEM)
  for (const x of graph.groups) if (x.parent === groupId && x.id !== fora) y = Math.max(y, x.y + x.h + MARGEM)
  return { x: MARGEM, y }
}

/** O grupo mais fundo cuja caixa (na tela) contém o ponto, fora os de `excluir`. */
function grupoNoPonto(graph: ArchitectureGraphV2, ponto: { x: number; y: number }, excluir: Set<string>) {
  let melhor: GraphGroup | undefined
  let profundidade = -1
  for (const g of graph.groups) {
    if (excluir.has(g.id)) continue
    const a = absoluteOf(graph.groups, g.id)
    if (ponto.x < a.x || ponto.y < a.y || ponto.x > a.x + g.w || ponto.y > a.y + g.h) continue
    const p = chainOf(graph.groups, g.id).length
    if (p > profundidade) {
      melhor = g
      profundidade = p
    }
  }
  return melhor
}

/** O grupo e todos os de dentro. */
function descendentes(groups: GraphGroup[], id: string): Set<string> {
  const ids = new Set([id])
  let cresceu = true
  while (cresceu) {
    cresceu = false
    for (const g of groups)
      if (g.parent && ids.has(g.parent) && !ids.has(g.id)) {
        ids.add(g.id)
        cresceu = true
      }
  }
  return ids
}

// ── o que as peças, os grupos e as ligações leem do bloco ───────────────

interface Bancada {
  tituloDe: (kind: string) => string
  tituloDoGrupo: (type: GroupType) => string
  servicoDe: (id: string | undefined) => PaletteService | undefined
  minimoDe: (groupId: string) => { w: number; h: number }
  editando: string | null
  setEditando: (id: string | null) => void
  renomear: (id: string, texto: string) => void
  selecionarLigacao: (id: string) => void
  readOnly: boolean
  /** A simulação em curso, ou `null` fora do modo Simular. */
  sim: Simulacao | null
}

interface Simulacao {
  resultado: FlowSimulation
  gruposDerrubados: Set<string>
  /** Quanto dura uma volta do pulso, em segundos, e quanto leva cada passo. */
  ciclo: number
  passo: number
}

// cada passo do pulso leva isto; no fim da volta, uma pausa antes de recomeçar
const PASSO_DO_PULSO = 0.7
const PAUSA_DO_PULSO = 0.9

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

/** O "≈" do serviço aproximado: o nome continua o oficial, a marca diz que não é equivalente fiel. */
function MarcaAproximado({ className }: { className?: string }) {
  const t = useTranslate()
  return (
    <span
      title={t("architecture_board.approximate_hint")}
      className={cn("shrink-0 rounded-[4px] bg-tone-yellow px-1 text-[10px] leading-[14px] font-medium text-tone-yellow-foreground", className)}
    >
      ≈<span className="sr-only"> {t("architecture_board.approximate")}</span>
    </span>
  )
}

// ── a peça ──────────────────────────────────────────────────────────────

type PecaNode = Node<{ kind: string; label?: string; service?: string }, "peca">

const ALCAS = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
]

function Peca({ id, data, selected }: NodeProps<PecaNode>) {
  const { tituloDe, servicoDe, editando, setEditando, readOnly, sim } = useBancada()
  const t = useTranslate()
  const servico = servicoDe(data.service)
  const derrubada = !!sim?.resultado.down.has(id)
  // na simulação: fora do ar, cinza com o X; sem caminho a partir do Cliente, apagada
  const apagada = !!sim && !derrubada && !sim.resultado.reached.has(id)
  return (
    <div
      onDoubleClick={() => !readOnly && setEditando(id)}
      title={servico ? tituloDe(data.kind) : undefined}
      data-sim={derrubada ? "down" : apagada ? "unreached" : sim ? "reached" : undefined}
      className={cn(
        "group relative flex w-[168px] min-h-[52px] items-center gap-2.5 rounded-[10px] bg-card py-2 pr-2.5 pl-2 text-left transition-opacity",
        "shadow-[0_0_0_1px_var(--input),0_1px_2px_oklch(0_0_0/0.06)]",
        selected && "shadow-[0_0_0_2px_var(--primary),0_1px_2px_oklch(0_0_0/0.06)]",
        // o cinza vale para o conteúdo; o X continua vermelho
        derrubada && "bg-muted [&>:not([data-x]):not([data-alca])]:opacity-60 [&>:not([data-x]):not([data-alca])]:grayscale",
        apagada && "opacity-35"
      )}
    >
      {derrubada ? (
        <span data-x className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-card text-destructive shadow-[0_0_0_1px_var(--input)]">
          <XCircle aria-hidden weight="fill" className="size-4" />
          <span className="sr-only">{t("architecture_board.sim.down")}</span>
        </span>
      ) : null}
      {servico ? (
        // o ícone oficial como veio do pacote, sem fundo nem cor por cima
        <span className="flex size-8 shrink-0 items-center justify-center">
          <CloudServiceIcon service={servico.id} className="size-7" />
        </span>
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary-subtle text-primary-subtle-foreground">
          <IconeDaPeca kind={data.kind} className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {servico ? (
          // o nome oficial perto do ícone, nunca dentro dele, e sem caixa alta (é o nome)
          // em até duas linhas: cortar o nome oficial no meio confunde ("Elastic Load Balan…")
          <span className="flex min-w-0 items-start gap-1">
            <span className="line-clamp-2 text-[10.5px] leading-[13px] font-medium break-words text-muted-foreground">
              {servico.name}
            </span>
            {servico.approximate ? <MarcaAproximado /> : null}
          </span>
        ) : (
          <span className="truncate font-mono text-[9.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {tituloDe(data.kind)}
          </span>
        )}
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
          data-alca
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

// ── o grupo ─────────────────────────────────────────────────────────────

type GrupoNode = Node<{ type: GroupType; label?: string }, "grupo">

// Genérico para AWS, GCP e Azure: o contorno diz o tipo. Região e zona tracejadas (são lugar),
// VPC e sub-redes em linha cheia (são rede); a sub-rede pública num tom verde e a privada num tom
// azul, a convenção dos três. O fundo é translúcido: a ligação que passa por baixo continua à vista.
const PELE_DO_GRUPO: Record<GroupType, string> = {
  region: "border-dashed border-muted-foreground/45 bg-muted-foreground/[0.025]",
  zone: "border-dashed border-muted-foreground/35 bg-transparent",
  vpc: "border-solid border-muted-foreground/40 bg-muted-foreground/[0.03]",
  "public-subnet": "border-solid border-success/45 bg-success/[0.06]",
  "private-subnet": "border-solid border-primary/40 bg-primary/[0.05]",
}

function Grupo({ id, data, selected }: NodeProps<GrupoNode>) {
  const { tituloDoGrupo, minimoDe, editando, setEditando, readOnly, sim } = useBancada()
  const t = useTranslate()
  const min = minimoDe(id)
  const derrubado = !!sim?.gruposDerrubados.has(id)
  return (
    <div
      data-sim={derrubado ? "down" : undefined}
      className={cn(
        "relative size-full rounded-[12px] border-[1.5px]",
        PELE_DO_GRUPO[data.type],
        derrubado && "border-muted-foreground/50 bg-muted-foreground/[0.08]",
        selected && "outline-2 outline-offset-2 outline-primary"
      )}
    >
      <span
        onDoubleClick={() => !readOnly && setEditando(id)}
        className="absolute top-2 left-2.5 flex max-w-[calc(100%-20px)] items-center gap-1.5 rounded-[6px] bg-card/90 px-1.5 py-0.5 shadow-[0_0_0_1px_var(--input)]"
      >
        {derrubado ? (
          <>
            <XCircle aria-hidden weight="fill" className="size-3.5 shrink-0 text-destructive" />
            <span className="sr-only">{t("architecture_board.sim.down")}</span>
          </>
        ) : null}
        <span className="shrink-0 font-mono text-[9.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {tituloDoGrupo(data.type)}
        </span>
        {editando === id ? (
          <CampoDeRotulo id={id} valor={data.label} className="w-28 text-[12px]" />
        ) : data.label ? (
          <span className="truncate text-[12px] leading-4 font-medium text-foreground-strong">{data.label}</span>
        ) : null}
      </span>
      {selected && !readOnly ? (
        <>
          {(["right", "bottom"] as const).map((p) => (
            <NodeResizeControl
              key={p}
              position={p}
              variant={"line" as never}
              minWidth={min.w}
              minHeight={min.h}
              maxWidth={GRAPH_LIMITS.size}
              maxHeight={GRAPH_LIMITS.size}
              className="!border-primary/0 hover:!border-primary/60"
            />
          ))}
          <NodeResizeControl
            position="bottom-right"
            minWidth={min.w}
            minHeight={min.h}
            maxWidth={GRAPH_LIMITS.size}
            maxHeight={GRAPH_LIMITS.size}
            className="!size-2.5 !rounded-[3px] !border-2 !border-card !bg-primary"
          />
        </>
      ) : null}
    </div>
  )
}

// ── a ligação ───────────────────────────────────────────────────────────

type LigacaoEdge = Edge<{ relation: Relation; label?: string }, "ligacao">

/**
 * O pulso numa ligação percorrida: um ponto que anda no sentido do trabalho (em `consumes`, contra a
 * seta) no passo dele da volta, e some fora dele. Com prefers-reduced-motion, nada se mexe: fica o
 * estado final, a ligação acesa.
 */
function Pulso({ caminho, inverso, inicio, sim }: { caminho: string; inverso: boolean; inicio: number; sim: Simulacao }) {
  const a = (inicio * sim.passo) / sim.ciclo
  const b = ((inicio + 1) * sim.passo) / sim.ciclo
  const pontos = inverso ? "1;1;0;0" : "0;0;1;1"
  return (
    <g className="motion-reduce:hidden">
      <circle r={4} fill="var(--primary)" opacity={0}>
        <animateMotion
          dur={`${sim.ciclo}s`}
          repeatCount="indefinite"
          path={caminho}
          keyPoints={pontos}
          keyTimes={`0;${a};${b};1`}
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          dur={`${sim.ciclo}s`}
          repeatCount="indefinite"
          values={a > 0 ? "0;1;0" : "1;0"}
          keyTimes={a > 0 ? `0;${a};${b}` : `0;${b}`}
          calcMode="discrete"
        />
      </circle>
    </g>
  )
}

function Ligacao(props: EdgeProps<LigacaoEdge>) {
  const { id, data, selected, markerEnd, source, target } = props
  const { editando, setEditando, selecionarLigacao, readOnly, sim } = useBancada()
  const t = useTranslate()
  const [caminho, x, y] = getSmoothStepPath({ ...props, borderRadius: 10 })
  const relation = data?.relation ?? "calls"
  const percorrida = !!sim?.resultado.edges.has(id)
  // o pulso parte de quem faz o trabalho: em `consumes`, de quem publica (o destino da seta)
  const origem = relation === "consumes" ? target : source
  return (
    <>
      <BaseEdge
        id={id}
        path={caminho}
        markerEnd={markerEnd}
        style={{
          stroke: selected || percorrida ? "var(--primary)" : "color-mix(in oklab, var(--muted-foreground) 70%, transparent)",
          strokeWidth: selected ? 1.75 : percorrida ? 1.5 : 1.25,
          opacity: sim && !percorrida ? 0.25 : 1,
        }}
      />
      {sim && percorrida ? (
        <Pulso caminho={caminho} inverso={relation === "consumes"} inicio={sim.resultado.depth.get(origem) ?? 0} sim={sim} />
      ) : null}
      <EdgeLabelRenderer>
        <div
          className={cn("nodrag nopan pointer-events-auto absolute", sim && !percorrida && "opacity-40")}
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
const TIPOS_DE_NO = { peca: Peca, grupo: Grupo }
const TIPOS_DE_LIGACAO = { ligacao: Ligacao }

// ── a bancada ───────────────────────────────────────────────────────────

type Selecao = { tipo: "peca" | "grupo" | "ligacao"; id: string } | null

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
  groups: paletaDeGrupos = [],
  rules,
  summary,
  onCheck,
  checking,
  checkDisabledReason,
  checkError,
  readOnly: soLeitura = false,
  className,
}: ArchitectureBoardProps) {
  const t = useTranslate()
  const { screenToFlowPosition } = useReactFlow()
  // o modo Simular: o que caiu é estado passageiro, e o desenho não se edita enquanto ele dura
  const [simulando, setSimulando] = React.useState(false)
  const [derrubados, setDerrubados] = React.useState<{ nodes: string[]; groups: string[] }>({ nodes: [], groups: [] })
  const readOnly = soLeitura || simulando
  const palco = React.useRef<HTMLDivElement>(null)
  const [selecao, setSelecao] = React.useState<Selecao>(null)
  const [editando, setEditando] = React.useState<string | null>(null)
  // o React Flow mede cada peça e precisa receber a medida de volta; ela não é do grafo, e fica em
  // estado (não numa ref lida no render, que o react-hooks/refs dos apps barra)
  const [medidas, setMedidas] = React.useState(() => new Map<string, { width: number; height: number }>())
  // onde estava o que começou a ser arrastado: se o lugar de soltar não vale, volta para lá
  const [arrasto, setArrasto] = React.useState<{ id: string; x: number; y: number } | null>(null)

  const itens = React.useMemo(() => new Map(palette.map((p) => [p.id, p])), [palette])
  const titulosDeGrupo = React.useMemo(() => new Map(paletaDeGrupos.map((g) => [g.id, g.title])), [paletaDeGrupos])
  const servicos = React.useMemo(
    () => new Map(palette.flatMap((p) => (p.services ?? []).map((s) => [s.id, s] as const))),
    [palette]
  )
  const alturas = new Map(graph.nodes.map((n) => [n.id, medidas.get(n.id)?.height ?? ALTURA_DA_PECA]))
  const cheioDePecas = graph.nodes.length >= GRAPH_LIMITS.nodes
  const cheioDeLigacoes = graph.edges.length >= GRAPH_LIMITS.edges
  const cheioDeGrupos = graph.groups.length >= GRAPH_LIMITS.groups

  const mudar = (g: ArchitectureGraphV2) => onGraphChange(g)
  const tituloDoGrupo = (type: GroupType) => titulosDeGrupo.get(type) ?? t(`architecture_board.group_types.${type}`)

  // os grupos vêm antes, do topo para dentro: o React Flow pede o pai antes do filho
  const profundidade = new Map(graph.groups.map((g) => [g.id, chainOf(graph.groups, g.id).length]))
  const gruposEmOrdem = [...graph.groups].sort((a, b) => (profundidade.get(a.id) ?? 0) - (profundidade.get(b.id) ?? 0))
  const nodes: Array<PecaNode | GrupoNode> = [
    ...gruposEmOrdem.map(
      (g): GrupoNode => ({
        id: g.id,
        type: "grupo",
        position: { x: g.x, y: g.y },
        parentId: g.parent,
        width: g.w,
        height: g.h,
        data: { type: g.type, label: g.label },
        selected: selecao?.tipo === "grupo" && selecao.id === g.id,
        connectable: false,
      })
    ),
    ...graph.nodes.map(
      (n): PecaNode => ({
        id: n.id,
        type: "peca",
        position: { x: n.x, y: n.y },
        parentId: n.parent,
        data: { kind: n.kind, label: n.label, service: n.service },
        selected: selecao?.tipo === "peca" && selecao.id === n.id,
        measured: medidas.get(n.id),
      })
    ),
  ]
  const naTela = (n: GraphNode) => {
    const a = absoluteOf(graph.groups, n.parent)
    return { x: a.x + n.x, y: a.y + n.y }
  }
  const porId = new Map(graph.nodes.map((n) => [n.id, n]))
  const edges: LigacaoEdge[] = graph.edges.map((e) => {
    const marcada = selecao?.tipo === "ligacao" && selecao.id === e.id
    const de = porId.get(e.from)
    const para = porId.get(e.to)
    const lado = de && para ? lados(naTela(de), naTela(para)) : undefined
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

  const centroDaVista = () => {
    const caixa = palco.current?.getBoundingClientRect()
    return caixa
      ? screenToFlowPosition({ x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2 })
      : { x: 0, y: 0 }
  }

  const porPeca = (kind: string, ponto?: { x: number; y: number }) => {
    if (readOnly || cheioDePecas) return
    let posicao = ponto
    if (!posicao) {
      // pelo clique, a peça nasce no meio da vista; se o lugar está ocupado, desce uma peça, e
      // depois de quatro tentativas anda uma coluna: nunca nasce em cima de outra
      const centro = centroDaVista()
      const ocupado = (x: number, y: number) =>
        graph.nodes.some((n) => {
          const p = naTela(n)
          return Math.abs(p.x - x) < LARGURA_DA_PECA && Math.abs(p.y - y) < ALTURA_DA_PECA + 12
        })
      let tentativa = 0
      do {
        posicao = {
          x: centro.x - LARGURA_DA_PECA / 2 + Math.floor(tentativa / 4) * (LARGURA_DA_PECA + 40),
          y: centro.y - ALTURA_DA_PECA / 2 + (tentativa % 4) * (ALTURA_DA_PECA + 24),
        }
        tentativa++
      } while (ocupado(posicao.x, posicao.y) && tentativa < 24)
    }
    // nasce dentro do grupo mais fundo que contém o centro dela
    const pai = grupoNoPonto(
      graph,
      { x: posicao.x + LARGURA_DA_PECA / 2, y: posicao.y + ALTURA_DA_PECA / 2 },
      new Set()
    )
    const base = absoluteOf(graph.groups, pai?.id)
    const id = nextId("n", graph)
    // com provedor, a peça nasce com o primeiro serviço do tipo (D6)
    const service = servicosDe(itens.get(kind), graph.provider)[0]?.id
    const no: GraphNode = { id, kind, x: Math.round(posicao.x - base.x), y: Math.round(posicao.y - base.y) }
    if (service) no.service = service
    if (pai) no.parent = pai.id
    mudar(acomodar({ ...graph, nodes: [...graph.nodes, no] }, { kind: "node", id }, alturas))
    setSelecao({ tipo: "peca", id })
  }

  /** Onde um grupo novo do tipo pode entrar: dentro do grupo selecionado, se a tabela deixa, ou no topo. */
  const lugarDoGrupo = (type: GroupType): { parent?: string } | null => {
    const vazio = { type, children: [] }
    const dentro = selecao?.tipo === "grupo" ? selecao.id : selecao?.tipo === "peca" ? porId.get(selecao.id)?.parent : undefined
    if (dentro && canNest(chainOf(graph.groups, dentro), vazio)) return { parent: dentro }
    if (canNest([], vazio)) return {}
    return null
  }

  const porGrupo = (type: GroupType, ponto?: { x: number; y: number }) => {
    if (readOnly || cheioDeGrupos) return
    const tamanho = TAMANHO_NOVO[type]
    let parent: string | undefined
    let canto: { x: number; y: number }
    if (ponto) {
      // arrastado: entra no grupo mais fundo sob o ponto, se a tabela deixa; senão, não entra
      const alvo = grupoNoPonto(graph, ponto, new Set())
      if (!canNest(chainOf(graph.groups, alvo?.id), { type, children: [] })) return
      parent = alvo?.id
      canto = { x: ponto.x - 40, y: ponto.y - 20 }
    } else {
      const lugar = lugarDoGrupo(type)
      if (!lugar) return
      parent = lugar.parent
      if (parent) {
        const a = absoluteOf(graph.groups, parent)
        const livre = lugarLivre(graph, parent, alturas)
        canto = { x: a.x + livre.x, y: a.y + livre.y }
      } else {
        const c = centroDaVista()
        canto = { x: c.x - tamanho.w / 2, y: c.y - tamanho.h / 2 }
      }
    }
    const base = absoluteOf(graph.groups, parent)
    const id = nextId("g", graph)
    const grupo: GraphGroup = {
      id,
      type,
      x: Math.round(canto.x - base.x),
      y: Math.round(canto.y - base.y),
      w: tamanho.w,
      h: tamanho.h,
    }
    if (parent) grupo.parent = parent
    const g = { ...graph, groups: [...graph.groups, grupo] }
    // pelo clique, o pai cresce para caber; arrastado, o grupo é trazido para dentro da caixa
    mudar(ponto ? acomodar(g, { kind: "group", id }, alturas) : crescer(g, parent, alturas))
    setSelecao({ tipo: "grupo", id })
  }

  const ligar = (from: string, to: string, relation: Relation = "calls") => {
    if (readOnly || cheioDeLigacoes || from === to) return
    // grupo nunca recebe ligação
    if (!porId.has(from) || !porId.has(to)) return
    if (graph.edges.some((e) => e.from === from && e.to === to && e.relation === relation)) return
    const id = nextId("e", graph)
    mudar({ ...graph, edges: [...graph.edges, { id, from, to, relation }] })
    setSelecao({ tipo: "ligacao", id })
  }

  const apagar = (sel: NonNullable<Selecao>) => {
    if (readOnly) return
    if (sel.tipo === "peca")
      mudar({
        ...graph,
        nodes: graph.nodes.filter((n) => n.id !== sel.id),
        edges: graph.edges.filter((e) => e.from !== sel.id && e.to !== sel.id),
      })
    else if (sel.tipo === "grupo") mudar(deleteGroup(graph, sel.id))
    else mudar({ ...graph, edges: graph.edges.filter((e) => e.id !== sel.id) })
    setSelecao(null)
  }

  /** Move uma peça ou um grupo para dentro de `parent` (ou para o topo), se a tabela deixa. */
  const moverPara = (item: { kind: "node" | "group"; id: string }, parent: string | undefined, porTeclado = false) => {
    if (readOnly) return false
    if (item.kind === "group" && !canNest(chainOf(graph.groups, parent), subtreeOf(graph.groups, item.id))) return false
    let g = reparent(graph, item, parent)
    if (parent && porTeclado) {
      // pelo teclado, o que entra num grupo vai para baixo do que já está lá, e o grupo cresce
      const livre = lugarLivre(g, parent, alturas, item.id)
      const colocar = <T extends { id: string; x: number; y: number }>(n: T): T =>
        n.id === item.id ? { ...n, ...livre } : n
      g = item.kind === "node" ? { ...g, nodes: g.nodes.map(colocar) } : { ...g, groups: g.groups.map(colocar) }
      mudar(crescer(g, parent, alturas))
    } else mudar(acomodar(g, item, alturas))
    return true
  }

  const trocarRelacao = (id: string, relation: Relation) => {
    const atual = graph.edges.find((e) => e.id === id)
    if (!atual || atual.relation === relation) return
    // trocar para um tipo que já existe entre as mesmas peças repetiria a ligação
    if (graph.edges.some((e) => e.id !== id && e.from === atual.from && e.to === atual.to && e.relation === relation))
      return
    mudar({ ...graph, edges: graph.edges.map((e) => (e.id === id ? { ...e, relation } : e)) })
  }

  const trocarServico = (id: string, service: string) =>
    mudar({ ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, service } : n)) })

  // D6: ao escolher um provedor, cada peça vira o primeiro serviço do tipo; Genérico tira todos
  const trocarProvedor = (provider: CloudProvider | undefined) => {
    if (readOnly || provider === graph.provider) return
    const nodes = graph.nodes.map((n) => {
      const novo = { ...n }
      delete novo.service
      const service = servicosDe(itens.get(n.kind), provider)[0]?.id
      if (service) novo.service = service
      return novo
    })
    const novo: ArchitectureGraphV2 = { ...graph, nodes }
    if (provider) novo.provider = provider
    else delete novo.provider
    mudar(novo)
  }

  const renomear = (id: string, texto: string) => {
    const label = rotuloLimpo(texto)
    const comRotulo = <T extends { id: string; label?: string }>(x: T): T => {
      if (x.id !== id) return x
      const novo = { ...x, label }
      if (label === undefined) delete novo.label
      return novo
    }
    mudar({
      ...graph,
      nodes: graph.nodes.map(comRotulo),
      edges: graph.edges.map(comRotulo),
      groups: graph.groups.map(comRotulo),
    })
    setEditando(null)
  }

  const ehGrupo = (id: string) => graph.groups.some((g) => g.id === id)

  const aoMudarNos = (changes: NodeChange<PecaNode | GrupoNode>[]) => {
    let g = graph
    let mudou = false
    const medidasNovas: [string, { width: number; height: number }][] = []
    for (const c of changes) {
      if (c.type === "dimensions" && c.dimensions) {
        if (ehGrupo(c.id)) {
          // só o redimensionar muda o tamanho do grupo; a medida do React Flow é a que mandamos
          if (c.resizing !== undefined && c.setAttributes && !readOnly) {
            const { width, height } = c.dimensions
            g = {
              ...g,
              groups: g.groups.map((x) =>
                x.id === c.id ? { ...x, w: Math.round(width), h: Math.round(height) } : x
              ),
            }
            mudou = true
          }
        } else medidasNovas.push([c.id, c.dimensions])
      } else if (c.type === "position" && c.position && !readOnly) {
        const { x, y } = c.position
        const mover = <T extends { id: string; x: number; y: number }>(n: T): T =>
          n.id === c.id ? { ...n, x: Math.round(x), y: Math.round(y) } : n
        g = ehGrupo(c.id) ? { ...g, groups: g.groups.map(mover) } : { ...g, nodes: g.nodes.map(mover) }
        mudou = true
      } else if (c.type === "select") {
        const tipo = ehGrupo(c.id) ? "grupo" : "peca"
        if (c.selected) setSelecao({ tipo, id: c.id })
        else setSelecao((s) => (s?.tipo === tipo && s.id === c.id ? null : s))
      }
      // "remove" não chega: o Delete é da bancada (o React Flow apagaria os filhos junto)
    }
    if (medidasNovas.length) setMedidas((antes) => new Map([...antes, ...medidasNovas]))
    if (mudou) mudar(g)
  }

  // ao soltar, a peça ou o grupo entra no grupo mais fundo sob o centro dele; o grupo só entra onde
  // a tabela deixa, e senão volta para onde estava
  const aoSoltar = (id: string) => {
    if (readOnly) return
    const grupo = graph.groups.find((x) => x.id === id)
    const no = graph.nodes.find((x) => x.id === id)
    const atual = grupo ?? no
    if (!atual) return
    const base = absoluteOf(graph.groups, atual.parent)
    const largura = grupo ? grupo.w : LARGURA_DA_PECA
    const altura = grupo ? grupo.h : (alturas.get(id) ?? ALTURA_DA_PECA)
    const centro = { x: base.x + atual.x + largura / 2, y: base.y + atual.y + altura / 2 }
    const alvo = grupoNoPonto(graph, centro, grupo ? descendentes(graph.groups, id) : new Set())
    const item = { kind: grupo ? ("group" as const) : ("node" as const), id }
    if (alvo?.id === atual.parent) {
      mudar(acomodar(graph, item, alturas))
    } else if (!moverPara(item, alvo?.id) && arrasto?.id === id) {
      const voltar = <T extends { id: string; x: number; y: number }>(n: T): T =>
        n.id === id ? { ...n, x: arrasto.x, y: arrasto.y } : n
      mudar(grupo ? { ...graph, groups: graph.groups.map(voltar) } : { ...graph, nodes: graph.nodes.map(voltar) })
    }
    setArrasto(null)
  }

  const aoMudarLigacoes = (changes: EdgeChange<LigacaoEdge>[]) => {
    for (const c of changes) {
      if (c.type === "select") {
        if (c.selected) setSelecao({ tipo: "ligacao", id: c.id })
        else setSelecao((s) => (s?.tipo === "ligacao" && s.id === c.id ? null : s))
      }
    }
  }

  const resultado = simulando ? simulateFlow(graph, derrubados) : null
  const sim: Simulacao | null = resultado
    ? {
        resultado,
        gruposDerrubados: new Set(
          graph.groups.filter((g) => derrubados.groups.some((d) => g.id === d || chainOfIds(graph.groups, g.id).includes(d))).map((g) => g.id)
        ),
        passo: PASSO_DO_PULSO,
        ciclo: (Math.max(0, ...resultado.depth.values()) + 1) * PASSO_DO_PULSO + PAUSA_DO_PULSO,
      }
    : null
  const alternarSimulacao = () => {
    setSimulando((v) => !v)
    setDerrubados({ nodes: [], groups: [] })
    setEditando(null)
  }
  const derrubar = (item: { tipo: "peca" | "grupo"; id: string }) =>
    setDerrubados((d) => {
      const lista = item.tipo === "peca" ? d.nodes : d.groups
      const nova = lista.includes(item.id) ? lista.filter((x) => x !== item.id) : [...lista, item.id]
      return item.tipo === "peca" ? { ...d, nodes: nova } : { ...d, groups: nova }
    })

  const bancada: Bancada = {
    tituloDe: (kind) => itens.get(kind)?.title ?? kind,
    tituloDoGrupo,
    servicoDe: (id) => (id ? servicos.get(id) : undefined),
    minimoDe: (groupId) => minimoDoGrupo(graph, groupId, alturas),
    editando,
    setEditando,
    renomear,
    selecionarLigacao: (id) => setSelecao({ tipo: "ligacao", id }),
    readOnly,
    sim,
  }

  const pecaSelecionada = selecao?.tipo === "peca" ? graph.nodes.find((n) => n.id === selecao.id) : undefined
  const grupoSelecionado = selecao?.tipo === "grupo" ? graph.groups.find((g) => g.id === selecao.id) : undefined
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
            return
          }
          // o Delete apaga a seleção pela regra da bancada; dentro de um campo, é do campo
          const alvo = e.target as HTMLElement
          if ((e.key === "Backspace" || e.key === "Delete") && selecao && !editando && !alvo.closest("input, textarea, [contenteditable]")) {
            e.preventDefault()
            apagar(selecao)
          }
        }}
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs lg:flex-1 lg:flex-row",
          className
        )}
      >
        <div className="muriki-scroll flex shrink-0 flex-col border-muted bg-rail max-lg:border-b lg:w-[248px] lg:overflow-y-auto lg:border-r">
          <ExerciseSection title={t("architecture_board.provider")} divider={false}>
            <Provedores atual={graph.provider} readOnly={readOnly} onTrocar={trocarProvedor} />
          </ExerciseSection>
          <ExerciseSection title={t("architecture_board.pieces")}>
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
          {paletaDeGrupos.length ? (
            <ExerciseSection title={t("architecture_board.groups")}>
              <ul className="m-0 flex list-none flex-col gap-px px-1.5 pb-2">
                {paletaDeGrupos.map((g) => {
                  const semLugar = !lugarDoGrupo(g.id)
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        draggable={!readOnly && !cheioDeGrupos}
                        disabled={readOnly || cheioDeGrupos}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/x-muriki-group", g.id)
                          e.dataTransfer.effectAllowed = "copy"
                        }}
                        onClick={() => porGrupo(g.id)}
                        title={semLugar ? t("architecture_board.group_needs_place", { name: g.title }) : g.description}
                        aria-label={t("architecture_board.add_group", { name: g.title })}
                        aria-disabled={semLugar || undefined}
                        className={cn(
                          "flex h-8 w-full cursor-grab items-center gap-2 rounded-md px-2 text-left text-[12.5px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 active:cursor-grabbing disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent",
                          semLugar && "text-muted-foreground"
                        )}
                      >
                        <SquareHalf aria-hidden className="size-[15px] text-muted-foreground" />
                        <span className="truncate">{g.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <span className="block px-4 pb-2.5 text-[11.5px] leading-4 text-muted-foreground">
                {cheioDeGrupos
                  ? t("architecture_board.limit_groups", { max: GRAPH_LIMITS.groups })
                  : t("architecture_board.groups_hint")}
              </span>
            </ExerciseSection>
          ) : null}
          <Regras rules={rules} summary={summary} checkError={checkError} />
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
          {/* estreita, a barra quebra a linha em vez de sobrepor: Verificar desce para a direita */}
          <div className="@container/barra flex min-h-[41px] flex-wrap items-center gap-1.5 border-b border-muted py-1.5 pr-2 pl-3">
            {sim ? (
              <AcoesDaSimulacao
                peca={pecaSelecionada}
                grupo={grupoSelecionado}
                derrubados={derrubados}
                temQuedas={derrubados.nodes.length + derrubados.groups.length > 0}
                tituloDe={bancada.tituloDe}
                tituloDoGrupo={tituloDoGrupo}
                onDerrubar={derrubar}
                onLevantarTudo={() => setDerrubados({ nodes: [], groups: [] })}
              />
            ) : (
            <Acoes
              peca={pecaSelecionada}
              grupo={grupoSelecionado}
              ligacao={ligacaoSelecionada}
              graph={graph}
              readOnly={readOnly}
              tituloDe={bancada.tituloDe}
              tituloDoGrupo={tituloDoGrupo}
              servicos={pecaSelecionada ? servicosDe(itens.get(pecaSelecionada.kind), graph.provider) : []}
              onServico={trocarServico}
              onLigar={ligar}
              onMover={(item, parent) => moverPara(item, parent, true)}
              onRelacao={trocarRelacao}
              onRenomear={(id) => setEditando(id)}
              onApagar={() => selecao && apagar(selecao)}
            />
            )}
            <span className="ml-auto flex shrink-0 items-center gap-2">
              <Button
                variant={simulando ? "secondary" : "ghost"}
                aria-pressed={simulando}
                onClick={alternarSimulacao}
                disabled={graph.nodes.length === 0}
                title={t(simulando ? "architecture_board.sim.exit" : "architecture_board.sim.start")}
              >
                <Pulse aria-hidden weight={simulando ? "bold" : "regular"} />
                {/* com a seleção de uma ligação, a barra enche: estreita, fica o ícone e o nome vai para o leitor */}
                <span className="@max-[760px]/barra:sr-only">
                  {t(simulando ? "architecture_board.sim.exit" : "architecture_board.sim.start")}
                </span>
              </Button>
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
              const tipos = e.dataTransfer.types
              if (tipos.includes("application/x-muriki-piece") || tipos.includes("application/x-muriki-group")) {
                e.preventDefault()
                e.dataTransfer.dropEffect = "copy"
              }
            }}
            onDrop={(e) => {
              const ponto = screenToFlowPosition({ x: e.clientX, y: e.clientY })
              const kind = e.dataTransfer.getData("application/x-muriki-piece")
              if (kind && itens.has(kind)) {
                e.preventDefault()
                porPeca(kind, { x: ponto.x - LARGURA_DA_PECA / 2, y: ponto.y - ALTURA_DA_PECA / 2 })
                return
              }
              const tipo = e.dataTransfer.getData("application/x-muriki-group") as GroupType
              if (tipo && titulosDeGrupo.has(tipo)) {
                e.preventDefault()
                porGrupo(tipo, ponto)
              }
            }}
          >
            <ReactFlow<PecaNode | GrupoNode, LigacaoEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={TIPOS_DE_NO}
              edgeTypes={TIPOS_DE_LIGACAO}
              onNodesChange={aoMudarNos}
              onEdgesChange={aoMudarLigacoes}
              onNodeDragStart={(_, n) => {
                const atual = graph.groups.find((x) => x.id === n.id) ?? graph.nodes.find((x) => x.id === n.id)
                if (atual) setArrasto({ id: n.id, x: atual.x, y: atual.y })
              }}
              onNodeDragStop={(_, n) => aoSoltar(n.id)}
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
              // a seleção é uma de cada vez, e o grupo selecionado não sobe por cima do resto
              selectionKeyCode={null}
              multiSelectionKeyCode={null}
              elevateNodesOnSelect={false}
              deleteKeyCode={null}
              fitView
              fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
              minZoom={0.3}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              aria-label={t("architecture_board.canvas")}
              className="bg-card"
            >
              <Background gap={18} size={1} color="var(--input)" />
            </ReactFlow>
            {graph.nodes.length === 0 && graph.groups.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <span className="max-w-[260px] text-center text-[13px] leading-5 text-muted-foreground">
                  {t("architecture_board.empty")}
                </span>
              </div>
            ) : null}
          </div>

          {resultado ? (
            <ResumoDaSimulacao
              graph={graph}
              resultado={resultado}
              tituloDe={bancada.tituloDe}
            />
          ) : null}
          <div className="flex h-[30px] shrink-0 items-center gap-3.5 overflow-hidden border-t border-muted px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
            <span className="truncate">
              {graph.groups.length
                ? t("architecture_board.status_groups", {
                    nodes: graph.nodes.length,
                    edges: graph.edges.length,
                    groups: graph.groups.length,
                  })
                : t("architecture_board.status", { nodes: graph.nodes.length, edges: graph.edges.length })}
            </span>
            <span className="max-sm:hidden">{t("architecture_board.shortcut")}</span>
          </div>
        </div>
      </section>
    </BancadaContexto.Provider>
  )
}

/** Os ids dos ancestrais de um grupo, do pai ao topo. */
function chainOfIds(groups: GraphGroup[], id: string): string[] {
  const porId = new Map(groups.map((g) => [g.id, g]))
  const ids: string[] = []
  for (let g = porId.get(id)?.parent; g && !ids.includes(g); g = porId.get(g)?.parent) ids.push(g)
  return ids
}

// ── a simulação ─────────────────────────────────────────────────────────

/** Só zona e região caem inteiras: são lugar. VPC e sub-rede são rede, e não caem sozinhas. */
const GRUPOS_QUE_CAEM: GroupType[] = ["zone", "region"]

function AcoesDaSimulacao({
  peca,
  grupo,
  derrubados,
  temQuedas,
  tituloDe,
  tituloDoGrupo,
  onDerrubar,
  onLevantarTudo,
}: {
  peca?: GraphNode
  grupo?: GraphGroup
  derrubados: { nodes: string[]; groups: string[] }
  temQuedas: boolean
  tituloDe: (kind: string) => string
  tituloDoGrupo: (type: GroupType) => string
  onDerrubar: (item: { tipo: "peca" | "grupo"; id: string }) => void
  onLevantarTudo: () => void
}) {
  const t = useTranslate()
  const alvo = peca
    ? { tipo: "peca" as const, id: peca.id, nome: peca.label ?? tituloDe(peca.kind), caido: derrubados.nodes.includes(peca.id) }
    : grupo && GRUPOS_QUE_CAEM.includes(grupo.type)
      ? {
          tipo: "grupo" as const,
          id: grupo.id,
          nome: grupo.label ? `${tituloDoGrupo(grupo.type)} ${grupo.label}` : tituloDoGrupo(grupo.type),
          caido: derrubados.groups.includes(grupo.id),
        }
      : null
  return (
    <span className="flex min-w-0 items-center gap-1">
      {alvo ? (
        <Button variant="ghost" size="sm" onClick={() => onDerrubar(alvo)}>
          {alvo.caido ? <ArrowCounterClockwise aria-hidden /> : <XCircle aria-hidden />}
          <span className="max-w-[220px] truncate">
            {t(alvo.caido ? "architecture_board.sim.restore" : "architecture_board.sim.take_down", { name: alvo.nome })}
          </span>
        </Button>
      ) : (
        <span className="truncate text-[12px] text-muted-foreground">{t("architecture_board.sim.hint")}</span>
      )}
      {temQuedas ? (
        <Button variant="ghost" size="sm" onClick={onLevantarTudo}>
          <ArrowCounterClockwise aria-hidden />
          {t("architecture_board.sim.restore_all")}
        </Button>
      ) : null}
    </span>
  )
}

/** O resumo da simulação, acima da barra de status: o que ficou de fora, em palavras. */
function ResumoDaSimulacao({
  graph,
  resultado,
  tituloDe,
}: {
  graph: ArchitectureGraphV2
  resultado: FlowSimulation
  tituloDe: (kind: string) => string
}) {
  const t = useTranslate()
  const nome = (id: string) => {
    const n = graph.nodes.find((x) => x.id === id)
    return n ? (n.label ?? tituloDe(n.kind)) : id
  }
  const clientes = graph.nodes.filter((n) => n.kind === "client")
  const de = clientes.length === 1 ? nome(clientes[0].id) : tituloDe("client")
  const fora = resultado.unreachable
  let texto: string
  if (!clientes.length) texto = t("architecture_board.sim.no_client", { client: tituloDe("client") })
  else if (!fora.length) texto = t("architecture_board.sim.all_reached", { from: de })
  else if (fora.length <= 2)
    texto = t("architecture_board.sim.unreachable", { count: fora.length, names: fora.map(nome).join(t("architecture_board.sim.and")), from: de })
  else
    texto = t("architecture_board.sim.unreachable_many", {
      names: fora.slice(0, 2).map(nome).join(", "),
      rest: fora.length - 2,
      from: de,
    })
  return (
    <div
      role="status"
      data-slot="architecture-board-simulation"
      className="flex min-h-[34px] shrink-0 items-center gap-2 border-t border-muted bg-primary-subtle px-4 py-1.5 text-[12.5px] leading-[18px] text-primary-subtle-foreground"
    >
      <Pulse aria-hidden weight="bold" className="size-3.5 shrink-0" />
      <span className="min-w-0">
        {resultado.down.size ? <span className="font-medium">{t("architecture_board.sim.down_count", { count: resultado.down.size })} · </span> : null}
        {texto}
      </span>
    </div>
  )
}

// ── o provedor ──────────────────────────────────────────────────────────

function Provedores({
  atual,
  readOnly,
  onTrocar,
}: {
  atual?: CloudProvider
  readOnly: boolean
  onTrocar: (provider: CloudProvider | undefined) => void
}) {
  const t = useTranslate()
  const opcoes: Array<CloudProvider | undefined> = [undefined, ...PROVIDERS]
  return (
    <div className="flex flex-col gap-1.5 px-3 pb-3">
      <span
        role="radiogroup"
        aria-label={t("architecture_board.provider")}
        // "Genérico" é a palavra mais longa: ganha mais espaço que as siglas
        className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-0.5 rounded-[9px] bg-sunken p-0.5"
      >
        {opcoes.map((p) => (
          <button
            key={p ?? "generic"}
            type="button"
            role="radio"
            aria-checked={atual === p}
            disabled={readOnly}
            onClick={() => onTrocar(p)}
            className={cn(
              "h-7 min-w-0 truncate rounded-[7px] px-1 text-[11.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-default",
              atual === p
                ? "bg-card font-medium text-foreground-strong shadow-[0_0_0_1px_var(--input),0_1px_2px_oklch(0_0_0/0.06)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`architecture_board.providers.${p ?? "generic"}`)}
          </button>
        ))}
      </span>
      <span className="px-1 text-[11.5px] leading-4 text-muted-foreground">
        {t(atual ? "architecture_board.provider_hint" : "architecture_board.provider_hint_generic")}
      </span>
    </div>
  )
}

// ── a barra de ações da seleção ─────────────────────────────────────────

function Acoes({
  peca,
  grupo,
  ligacao,
  graph,
  readOnly,
  tituloDe,
  tituloDoGrupo,
  servicos,
  onServico,
  onLigar,
  onMover,
  onRelacao,
  onRenomear,
  onApagar,
}: {
  peca?: GraphNode
  grupo?: GraphGroup
  ligacao?: GraphEdge
  graph: ArchitectureGraphV2
  readOnly: boolean
  tituloDe: (kind: string) => string
  tituloDoGrupo: (type: GroupType) => string
  servicos: PaletteService[]
  onServico: (id: string, service: string) => void
  onLigar: (from: string, to: string, relation: Relation) => void
  onMover: (item: { kind: "node" | "group"; id: string }, parent: string | undefined) => boolean
  onRelacao: (id: string, relation: Relation) => void
  onRenomear: (id: string) => void
  onApagar: () => void
}) {
  const t = useTranslate()
  if (readOnly || (!peca && !grupo && !ligacao))
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

  if (grupo)
    return (
      <span className="flex min-w-0 items-center gap-1">
        <MoverPara item={{ kind: "group", id: grupo.id }} graph={graph} tituloDoGrupo={tituloDoGrupo} onMover={onMover} />
        {comuns(grupo.id)}
      </span>
    )

  return (
    <span className="flex min-w-0 items-center gap-1">
      {servicos.length ? <Servico peca={peca!} servicos={servicos} onServico={onServico} /> : null}
      <LigarA peca={peca!} graph={graph} tituloDe={tituloDe} onLigar={onLigar} />
      {graph.groups.length ? (
        <MoverPara item={{ kind: "node", id: peca!.id }} graph={graph} tituloDoGrupo={tituloDoGrupo} onMover={onMover} />
      ) : null}
      {comuns(peca!.id)}
    </span>
  )
}

/** O inspetor do serviço: o atual, com ícone e nome, e os outros do mesmo tipo no provedor. */
function Servico({
  peca,
  servicos,
  onServico,
}: {
  peca: GraphNode
  servicos: PaletteService[]
  onServico: (id: string, service: string) => void
}) {
  const t = useTranslate()
  const [aberto, setAberto] = React.useState(false)
  const atual = servicos.find((s) => s.id === peca.service)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" aria-label={t("architecture_board.service_of", { name: atual?.name ?? "" })} />}
      >
        {atual ? <CloudServiceIcon service={atual.id} className="size-4" /> : null}
        <span className="max-w-[160px] truncate">{atual?.name ?? t("architecture_board.service")}</span>
        {atual?.approximate ? <MarcaAproximado /> : null}
        <CaretDown aria-hidden className="size-3 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <span className="block px-1.5 pt-0.5 pb-1.5 font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {t("architecture_board.service")}
        </span>
        <ul role="listbox" aria-label={t("architecture_board.service")} className="m-0 flex list-none flex-col gap-px p-0">
          {servicos.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                role="option"
                aria-selected={s.id === peca.service}
                onClick={() => {
                  onServico(peca.id, s.id)
                  setAberto(false)
                }}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-md px-1.5 text-left text-[12.5px] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  s.id === peca.service && "bg-muted"
                )}
              >
                <CloudServiceIcon service={s.id} className="size-6" />
                <span className="min-w-0 flex-1 truncate text-foreground">{s.name}</span>
                {s.approximate ? (
                  <span className="shrink-0 text-[11px] text-muted-foreground">{t("architecture_board.approximate")}</span>
                ) : null}
                {s.id === peca.service ? <Check aria-hidden weight="bold" className="size-3.5 shrink-0 text-primary" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/** "Mover para…": os grupos onde cabe, e "Fora dos grupos". O caminho de teclado do arrastar. */
function MoverPara({
  item,
  graph,
  tituloDoGrupo,
  onMover,
}: {
  item: { kind: "node" | "group"; id: string }
  graph: ArchitectureGraphV2
  tituloDoGrupo: (type: GroupType) => string
  onMover: (item: { kind: "node" | "group"; id: string }, parent: string | undefined) => boolean
}) {
  const t = useTranslate()
  const [aberto, setAberto] = React.useState(false)
  const atual = (item.kind === "node" ? graph.nodes : graph.groups).find((x) => x.id === item.id)
  const fora = item.kind === "group" ? descendentes(graph.groups, item.id) : new Set<string>()
  const sub = item.kind === "group" ? subtreeOf(graph.groups, item.id) : null
  const cabe = (parent: string | undefined) => !sub || canNest(chainOf(graph.groups, parent), sub)
  const destinos = graph.groups.filter((g) => !fora.has(g.id) && g.id !== atual?.parent && cabe(g.id))
  const podeSair = atual?.parent !== undefined && cabe(undefined)
  const nome = (g: GraphGroup) => (g.label ? `${tituloDoGrupo(g.type)} · ${g.label}` : tituloDoGrupo(g.type))
  const linha =
    "flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left text-[12.5px] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger render={<Button variant="ghost" size="sm" disabled={!destinos.length && !podeSair} />}>
        <ArrowsOutCardinal aria-hidden />
        {t("architecture_board.move_to")}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <ul className="muriki-scroll m-0 flex max-h-64 list-none flex-col gap-px overflow-y-auto p-0">
          {podeSair ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  onMover(item, undefined)
                  setAberto(false)
                }}
                className={linha}
              >
                <Square aria-hidden className="size-[15px] shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{t("architecture_board.top_level")}</span>
              </button>
            </li>
          ) : null}
          {destinos.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => {
                  onMover(item, g.id)
                  setAberto(false)
                }}
                // o recuo mostra a profundidade
                style={{ paddingLeft: 6 + (chainOf(graph.groups, g.id).length - 1) * 12 }}
                className={linha}
              >
                <SquareHalf aria-hidden className="size-[15px] shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{nome(g)}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function LigarA({
  peca,
  graph,
  tituloDe,
  onLigar,
}: {
  peca: GraphNode
  graph: ArchitectureGraphV2
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
                {n.service ? (
                  <CloudServiceIcon service={n.service} className="size-[15px]" />
                ) : (
                  <IconeDaPeca kind={n.kind} className="size-[15px] shrink-0 text-muted-foreground" />
                )}
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
