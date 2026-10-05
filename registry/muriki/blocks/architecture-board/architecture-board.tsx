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
 * LIGAR É PELA PEÇA, NÃO SÓ PELA ALÇA. Puxar da alça e soltar em qualquer parte de outra peça liga,
 * e a ponta de uma ligação se arrasta para outra peça. ⌘C/⌘V (Ctrl fora do Mac) copia e cola a peça
 * ou o grupo selecionado, com o que está dentro.
 *
 * DESENHO LIVRE. Sem `rules`, somem as Regras e o Verificar: é o Playground. Com `annotations`, o
 * palco aceita notas (bilhetes amarelos de texto, que não ligam a nada e não contam em regra). A
 * peça cujo tipo ou serviço saiu do catálogo ganha um aviso, porque a API recusa salvar até a troca.
 *
 * PEÇAS TRANCADAS (EX-C). `locked` são as peças do desenho de partida que a pessoa não pode apagar
 * nem trocar de tipo (o tipo já não se troca na bancada). Rótulo, posição, grupo e serviço seguem
 * livres, e as ligações também. A peça trancada mostra o cadeado, e na barra o "Apagar" dá lugar a
 * "Do enunciado"; o Delete do teclado também não apaga. Se mesmo assim o grafo chegar quebrado, a
 * API responde 422 GRAPH_INVALID com `locked_node_missing` ou `locked_node_changed`.
 *
 * ACHAR O DEFEITO. Com `pick`, a pessoa marca até `max` peças como a causa do defeito, separado
 * da seleção e da edição: "Marcar como defeito" na barra da peça selecionada (também com o desenho
 * só leitura), a moldura vermelha tracejada com a bandeira na peça e a seção "Defeito" no rail.
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
  Flag,
  Lightning,
  LinkSimple,
  NotePencil,
  ArrowSquareOut,
  Warning,
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
  LockSimple,
  Vault,
  Diamond,
  Package,
  PaperPlaneTilt,
  ShieldCheck,
  Signpost,
  Stack,
  Warehouse,
  Waves,
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
import { ViewToggle } from "@/components/ui/view-toggle"
import { ExerciseExpandButton, ExerciseSection } from "@/components/blocks/exercise-workspace/exercise-workspace"

import {
  ANNOTATION_LIMITS,
  GRAPH_LIMITS,
  PROVIDERS,
  cleanAnnotationText,
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
  type GraphAnnotation,
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
  /**
   * As regras visíveis do exercício, com o status da última verificação. Sem isto (o desenho livre
   * do Playground), somem a seção de Regras e o Verificar.
   */
  rules?: BoardRule[]
  /** `null` = ainda não verificou. */
  summary?: { passing: number; total: number } | null
  onCheck?: () => void
  checking?: boolean
  /** Texto curto no lugar do "Verificar" ativo, ex.: "em breve". */
  checkDisabledReason?: string
  checkError?: { kind: "invalid" | "rate_limit" | "network"; message?: string; retryIn?: number } | null
  readOnly?: boolean
  /** As notas do desenho livre. Com isto, o palco aceita notas e a paleta ganha "Nota". */
  annotations?: GraphAnnotation[]
  onAnnotationsChange?: (annotations: GraphAnnotation[]) => void
  /**
   * "Achar o defeito" (`answerSpec.pick`): as peças marcadas como causa, até `max`. `candidates`
   * (os ids do grafo inicial) limita o que pode ser marcado; sem isto, qualquer peça.
   */
  pick?: { max: number; selected: string[]; onChange: (ids: string[]) => void; candidates?: string[] }
  /**
   * As peças do desenho de partida que não se apagam (`locked` do exercício): o cadeado na peça e o
   * "Apagar" desligado. Rótulo, posição, grupo, serviço e ligações seguem livres.
   */
  locked?: string[]
  /** "Abrir no desenho livre", na barra: o app cria um desenho com o grafo atual. */
  onOpenInPlayground?: () => void
  /**
   * Peças, grupos e notas em destaque (as `refs` de um achado da Revisão do Pro): um contorno solto,
   * diferente da seleção, e a visão vai até elas quando a lista muda. Id desconhecido é ignorado;
   * vazio (ou ausente) não destaca nada.
   */
  highlight?: string[]
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
  // as peças do pacote 2026.10.05-1
  dns: Signpost,
  waf: ShieldCheck,
  stream: Waves,
  "data-warehouse": Warehouse,
  notification: PaperPlaneTilt,
  "container-registry": Package,
  "batch-job": Stack,
  decision: Diamond,
}

/** O cadeado da peça do enunciado (`locked`): pequeno, ao lado do tipo, com o porquê no title. */
function Cadeado() {
  const t = useTranslate()
  return (
    <span title={t("architecture_board.locked_hint")} className="flex shrink-0 text-muted-foreground">
      <LockSimple aria-hidden weight="fill" className="size-[11px]" />
      <span className="sr-only">{t("architecture_board.locked")}</span>
    </span>
  )
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
  /** Grava o texto da nota; `undefined` (vazio) apaga a nota. */
  escreverNota: (id: string, texto: string) => void
  /** As peças marcadas como defeito. */
  marcadas: Set<string>
  /** As peças, grupos e notas em destaque (`highlight`). */
  destacadas: Set<string>
  /** As peças cujo tipo ou serviço saiu do catálogo. */
  foraDoCatalogo: Set<string>
  /** As peças do enunciado, que não se apagam (`locked`). */
  trancadas: Set<string>
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

type PecaNode = Node<{ kind: string; label?: string; service?: string }, "peca" | "decisao">

const ALCAS = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
]

/** O destaque da revisão: moldura cheia e solta da peça, no tom da marca, mais leve que a seleção. */
const DESTAQUE = "outline-2 outline-offset-4 outline-primary/55"

function Peca({ id, data, selected }: NodeProps<PecaNode>) {
  const { tituloDe, servicoDe, editando, setEditando, readOnly, sim, foraDoCatalogo, marcadas, destacadas, trancadas } =
    useBancada()
  const marcada = marcadas.has(id)
  const trancada = trancadas.has(id)
  const t = useTranslate()
  const servico = servicoDe(data.service)
  const derrubada = !!sim?.resultado.down.has(id)
  const fora = foraDoCatalogo.has(id)
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
        fora && !selected && "shadow-[0_0_0_1.5px_var(--destructive),0_1px_2px_oklch(0_0_0/0.06)]",
        apagada && "opacity-35",
        // a marca do defeito: moldura tracejada por fora, que não some com a seleção
        marcada && "outline-2 outline-offset-[3px] outline-destructive outline-dashed",
        // o destaque da revisão: moldura solta e cheia, que convive com a seleção
        destacadas.has(id) && !marcada && DESTAQUE
      )}
    >
      {marcada ? (
        <span data-x className="absolute -top-2.5 left-2 flex h-5 items-center gap-1 rounded-full bg-destructive px-1.5 text-[10.5px] font-semibold text-destructive-foreground shadow-[0_0_0_2px_var(--card)]">
          <Flag aria-hidden weight="fill" className="size-3" />
          {t("architecture_board.pick.badge")}
        </span>
      ) : null}
      {fora ? (
        <span data-x className="absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full bg-card text-destructive shadow-[0_0_0_1px_var(--input)]">
          <Warning aria-hidden weight="fill" className="size-3.5" />
          <span className="sr-only">{t("architecture_board.catalog.badge")}</span>
        </span>
      ) : null}
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
            {trancada ? <Cadeado /> : null}
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-mono text-[9.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              {tituloDe(data.kind)}
            </span>
            {trancada ? <Cadeado /> : null}
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
            selected && "opacity-100",
            // só leitura (ou simulando), não dá para ligar: a alça não aparece
            readOnly && "!invisible"
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
  const { tituloDoGrupo, minimoDe, editando, setEditando, readOnly, sim, destacadas } = useBancada()
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
        selected && "outline-2 outline-offset-2 outline-primary",
        destacadas.has(id) && !selected && DESTAQUE
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

// ── a nota ──────────────────────────────────────────────────────────────

type NotaNode = Node<{ text: string }, "nota">

const LARGURA_DA_NOTA = 200

/**
 * O bilhete do desenho livre: texto solto no tom amarelo, sem alça, que não liga a nada. Dois
 * cliques editam; Esc desfaz; sair do campo ou ⌘↵ grava; vazio apaga.
 */
function Nota({ id, data, selected }: NodeProps<NotaNode>) {
  const { editando, setEditando, readOnly, destacadas } = useBancada()
  return (
    <div
      onDoubleClick={() => !readOnly && setEditando(id)}
      className={cn(
        "flex w-[200px] flex-col gap-1 rounded-[10px] bg-tone-yellow px-3 py-2.5 text-tone-yellow-foreground",
        "shadow-[0_1px_2px_oklch(0_0_0/0.08),0_0_0_1px_color-mix(in_oklab,var(--tone-yellow-foreground)_18%,transparent)]",
        selected && "shadow-[0_0_0_2px_var(--primary),0_1px_2px_oklch(0_0_0/0.08)]",
        destacadas.has(id) && DESTAQUE
      )}
    >
      <NotePencil aria-hidden className="size-3.5 shrink-0 opacity-70" />
      {editando === id ? (
        <CampoDaNota id={id} texto={data.text} />
      ) : (
        <p className="m-0 text-[12.5px] leading-[18px] break-words whitespace-pre-wrap">{data.text}</p>
      )}
    </div>
  )
}

/** O campo da nota: monta ao começar a editar, então parte sempre do texto atual. */
function CampoDaNota({ id, texto }: { id: string; texto: string }) {
  const { setEditando, escreverNota } = useBancada()
  const t = useTranslate()
  const [rascunho, setRascunho] = React.useState(texto)
  const campo = React.useRef<HTMLTextAreaElement>(null)
  // autoFocus não basta: o React Flow monta o nó escondido até medir, e escondido não recebe foco.
  // Tenta a cada quadro, por pouco tempo, até o campo aparecer.
  React.useEffect(() => {
    let tentativas = 0
    let quadro = 0
    const focar = () => {
      const el = campo.current
      if (!el) return
      el.focus()
      if (document.activeElement !== el && tentativas++ < 20) quadro = requestAnimationFrame(focar)
    }
    quadro = requestAnimationFrame(focar)
    return () => cancelAnimationFrame(quadro)
  }, [])
  return (
        <>
          <textarea
            ref={campo}
            value={rascunho}
            maxLength={ANNOTATION_LIMITS.text}
            rows={Math.min(8, Math.max(3, rascunho.split("\n").length))}
            aria-label={t("architecture_board.note")}
            placeholder={t("architecture_board.note_placeholder")}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Escape") {
                setEditando(null)
                if (!texto) escreverNota(id, "")
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) escreverNota(id, rascunho)
            }}
            onBlur={() => escreverNota(id, rascunho)}
            className="nodrag nowheel w-full resize-none rounded-[5px] bg-card/70 px-1.5 py-1 text-[12.5px] leading-[18px] text-foreground-strong outline-none ring-1 ring-primary"
          />
          <span className="text-right font-mono text-[10px] opacity-70">
            {rascunho.length}/{ANNOTATION_LIMITS.text}
          </span>
        </>
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
// ── a decisão ───────────────────────────────────────────────────────────

/**
 * A Decisão (kind `decision`, só no desenho livre): o losango do fluxograma. O caminho se divide
 * aqui, e a condição de cada caminho vai no rótulo da ligação que sai (a barra sugere "sim", "não",
 * "erro"). As alças ficam nos quatro vértices.
 */
const LADO_DA_DECISAO = 112

function Decisao({ id, data, selected }: NodeProps<PecaNode>) {
  const { tituloDe, editando, setEditando, readOnly, sim, marcadas, destacadas } = useBancada()
  const t = useTranslate()
  const derrubada = !!sim?.resultado.down.has(id)
  const apagada = !!sim && !derrubada && !sim.resultado.reached.has(id)
  const L = LADO_DA_DECISAO
  return (
    <div
      onDoubleClick={() => !readOnly && setEditando(id)}
      data-sim={derrubada ? "down" : apagada ? "unreached" : sim ? "reached" : undefined}
      title={tituloDe(data.kind)}
      className={cn("group relative flex items-center justify-center transition-opacity", apagada && "opacity-35")}
      style={{ width: L, height: L }}
    >
      <svg aria-hidden viewBox={`0 0 ${L} ${L}`} width={L} height={L} className="absolute inset-0 overflow-visible">
        <polygon
          points={`${L / 2},2 ${L - 2},${L / 2} ${L / 2},${L - 2} 2,${L / 2}`}
          strokeLinejoin="round"
          className={cn(
            derrubada ? "fill-muted" : "fill-card",
            selected ? "stroke-primary [stroke-width:2]" : "stroke-input [stroke-width:1.25]",
            marcadas.has(id) && "stroke-destructive [stroke-dasharray:5_4] [stroke-width:2]",
            destacadas.has(id) && !marcadas.has(id) && "stroke-primary [stroke-width:3]"
          )}
          style={{ filter: "drop-shadow(0 1px 1px oklch(0 0 0 / 0.06))" }}
        />
      </svg>
      <span className={cn("relative flex max-w-[64px] flex-col items-center gap-0.5 text-center", derrubada && "opacity-60 grayscale")}>
        <Diamond aria-hidden weight="fill" className="size-3.5 text-primary" />
        {editando === id ? (
          <CampoDeRotulo id={id} valor={data.label} className="w-24 text-center text-[11.5px]" />
        ) : (
          <span
            className={cn(
              "line-clamp-2 text-[11.5px] leading-[14px] break-words",
              data.label ? "font-medium text-foreground-strong" : "text-muted-foreground"
            )}
          >
            {data.label ?? tituloDe(data.kind)}
          </span>
        )}
      </span>
      {derrubada ? (
        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-card text-destructive shadow-[0_0_0_1px_var(--input)]">
          <XCircle aria-hidden weight="fill" className="size-4" />
          <span className="sr-only">{t("architecture_board.sim.down")}</span>
        </span>
      ) : null}
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
            selected && "opacity-100",
            readOnly && "!invisible"
          )}
        />
      ))}
    </div>
  )
}

const TIPOS_DE_NO = { peca: Peca, grupo: Grupo, nota: Nota, decisao: Decisao }
const TIPOS_DE_LIGACAO = { ligacao: Ligacao }

// ── a bancada ───────────────────────────────────────────────────────────

type Selecao = { tipo: "peca" | "grupo" | "ligacao" | "nota"; id: string } | null

/** O que ⌘C guardou: a peça, ou o grupo com o que está dentro e as ligações entre essas peças. */
interface Copia {
  raiz: { kind: "node" | "group" | "note"; id: string }
  nodes: GraphNode[]
  groups: GraphGroup[]
  edges: GraphEdge[]
  notas: GraphAnnotation[]
}

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
  annotations,
  onAnnotationsChange,
  onOpenInPlayground,
  pick,
  locked,
  highlight,
  className,
}: ArchitectureBoardProps) {
  const t = useTranslate()
  const { screenToFlowPosition, fitView } = useReactFlow()
  // o destaque muda pela lista, não pela referência: o app pode recriar o array a cada render
  const chaveDoDestaque = (highlight ?? []).join(" ")
  const destacadas = React.useMemo(() => new Set(chaveDoDestaque ? chaveDoDestaque.split(" ") : []), [chaveDoDestaque])
  React.useEffect(() => {
    if (!destacadas.size) return
    const parado = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    void fitView({ nodes: [...destacadas].map((id) => ({ id })), padding: 0.5, maxZoom: 1, duration: parado ? 0 : 300 })
  }, [destacadas, fitView])
  // o modo Simular: o que caiu é estado passageiro, e o desenho não se edita enquanto ele dura
  const [simulando, setSimulando] = React.useState(false)
  const [derrubados, setDerrubados] = React.useState<{ nodes: string[]; groups: string[] }>({ nodes: [], groups: [] })
  const readOnly = soLeitura || simulando
  // o que ⌘C guardou: estado do board, não a área de transferência do sistema (é desenho, não texto)
  const [copia, setCopia] = React.useState<Copia | null>(null)
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

  // ── as notas (desenho livre) ──
  const comNotas = annotations !== undefined && !!onAnnotationsChange
  const notas = annotations ?? []
  // a nota recém-criada fica aqui até ganhar texto: a API recusa nota vazia
  const [notaNova, setNotaNova] = React.useState<GraphAnnotation | null>(null)
  const notasNaTela = notaNova ? [...notas, notaNova] : notas
  const mudarNotas = (lista: GraphAnnotation[]) => onAnnotationsChange?.(lista)
  const ehNota = (id: string) => notasNaTela.some((a) => a.id === id)
  const cheioDeNotas = notas.length >= ANNOTATION_LIMITS.count
  const idDeNota = () => {
    let maior = 0
    for (const { id } of notasNaTela) {
      const m = /^a-(\d+)$/.exec(id)
      if (m) maior = Math.max(maior, Number(m[1]))
    }
    return `a-${maior + 1}`
  }
  const escreverNota = (id: string, texto: string) => {
    const limpo = cleanAnnotationText(texto)
    setEditando(null)
    if (notaNova?.id === id) {
      if (limpo) mudarNotas([...notas, { ...notaNova, text: limpo }])
      setNotaNova(null)
      if (!limpo) setSelecao(null)
      return
    }
    if (!limpo) {
      mudarNotas(notas.filter((a) => a.id !== id))
      setSelecao(null)
    } else if (notas.find((a) => a.id === id)?.text !== limpo) {
      mudarNotas(notas.map((a) => (a.id === id ? { ...a, text: limpo } : a)))
    }
  }
  /** Depois de apagar grupos: a nota cujo pai sumiu sobe para o ancestral que restou, no mesmo lugar. */
  const notasDepoisDe = (antes: ArchitectureGraphV2, depois: ArchitectureGraphV2) =>
    notas.map((a) => {
      if (!a.parent || depois.groups.some((g) => g.id === a.parent)) return a
      let pai = antes.groups.find((g) => g.id === a.parent)?.parent
      while (pai && !depois.groups.some((g) => g.id === pai)) pai = antes.groups.find((g) => g.id === pai)?.parent
      const de = absoluteOf(antes.groups, a.parent)
      const para = absoluteOf(depois.groups, pai)
      const nova = { ...a, x: a.x + de.x - para.x, y: a.y + de.y - para.y, parent: pai }
      if (!pai) delete nova.parent
      return nova
    })

  // ── o catálogo: a peça cujo tipo ou serviço não está mais na paleta ──
  const foraDoCatalogo = new Set(
    graph.nodes.filter((n) => !itens.has(n.kind) || (n.service && !servicos.has(n.service))).map((n) => n.id)
  )
  const tituloDoGrupo = (type: GroupType) => titulosDeGrupo.get(type) ?? t(`architecture_board.group_types.${type}`)

  // os grupos vêm antes, do topo para dentro: o React Flow pede o pai antes do filho
  const profundidade = new Map(graph.groups.map((g) => [g.id, chainOf(graph.groups, g.id).length]))
  const gruposEmOrdem = [...graph.groups].sort((a, b) => (profundidade.get(a.id) ?? 0) - (profundidade.get(b.id) ?? 0))
  const nodes: Array<PecaNode | GrupoNode | NotaNode> = [
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
        // a Decisão tem o nó próprio, o losango; o resto da peça é igual
        type: n.kind === "decision" ? "decisao" : "peca",
        position: { x: n.x, y: n.y },
        parentId: n.parent,
        data: { kind: n.kind, label: n.label, service: n.service },
        selected: selecao?.tipo === "peca" && selecao.id === n.id,
        measured: medidas.get(n.id),
      })
    ),
    ...notasNaTela.map(
      (a): NotaNode => ({
        id: a.id,
        type: "nota",
        position: { x: a.x, y: a.y },
        parentId: a.parent,
        data: { text: a.text },
        selected: selecao?.tipo === "nota" && selecao.id === a.id,
        measured: medidas.get(a.id),
        connectable: false,
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
    // pelo centro de cada nó (a Decisão é quadrada, a peça é larga)
    const centro = (n: GraphNode) => {
      const p = naTela(n)
      return n.kind === "decision"
        ? { x: p.x + LADO_DA_DECISAO / 2, y: p.y + LADO_DA_DECISAO / 2 }
        : { x: p.x + LARGURA_DA_PECA / 2, y: p.y + ALTURA_DA_PECA / 2 }
    }
    const lado = de && para ? lados(centro(de), centro(para)) : undefined
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

  const trancadas = new Set(locked ?? [])
  const apagar = (sel: NonNullable<Selecao>) => {
    if (readOnly) return
    // a peça do enunciado não sai, nem pela barra nem pelo teclado
    if (sel.tipo === "peca" && trancadas.has(sel.id)) return
    // a peça apagada sai também das marcadas
    if (sel.tipo === "peca" && pick?.selected.includes(sel.id)) pick.onChange(pick.selected.filter((x) => x !== sel.id))
    if (sel.tipo === "peca")
      mudar({
        ...graph,
        nodes: graph.nodes.filter((n) => n.id !== sel.id),
        edges: graph.edges.filter((e) => e.from !== sel.id && e.to !== sel.id),
      })
    else if (sel.tipo === "grupo") {
      const depois = deleteGroup(graph, sel.id)
      mudar(depois)
      // as notas de dentro sobem como as peças: nunca somem
      if (notas.some((a) => a.parent)) mudarNotas(notasDepoisDe(graph, depois))
    } else if (sel.tipo === "nota") {
      if (notaNova?.id === sel.id) setNotaNova(null)
      else mudarNotas(notas.filter((a) => a.id !== sel.id))
    } else mudar({ ...graph, edges: graph.edges.filter((e) => e.id !== sel.id) })
    setSelecao(null)
  }

  /** "Nota": nasce no meio da vista (no grupo sob o centro, se houver) e já em edição. */
  const porNota = () => {
    if (readOnly || !comNotas || cheioDeNotas || notaNova) return
    // como a peça: no meio da vista, e se o lugar está ocupado (peça ou nota), desce e depois anda
    const c = centroDaVista()
    const caixas = [
      ...graph.nodes.map((n) => ({ ...naTela(n), w: LARGURA_DA_PECA, h: alturas.get(n.id) ?? ALTURA_DA_PECA })),
      ...notas.map((a) => {
        const b = absoluteOf(graph.groups, a.parent)
        return { x: b.x + a.x, y: b.y + a.y, w: LARGURA_DA_NOTA, h: medidas.get(a.id)?.height ?? 80 }
      }),
    ]
    const ocupado = (x: number, y: number) =>
      caixas.some((k) => x < k.x + k.w + 12 && k.x < x + LARGURA_DA_NOTA + 12 && y < k.y + k.h + 12 && k.y < y + 80 + 12)
    let canto = { x: c.x - LARGURA_DA_NOTA / 2, y: c.y - 40 }
    for (let i = 0; ocupado(canto.x, canto.y) && i < 24; i++)
      canto = { x: c.x - LARGURA_DA_NOTA / 2 + Math.floor((i + 1) / 4) * (LARGURA_DA_NOTA + 40), y: c.y - 40 + ((i + 1) % 4) * 100 }
    const pai = grupoNoPonto(graph, { x: canto.x + LARGURA_DA_NOTA / 2, y: canto.y + 40 }, new Set())
    const base = absoluteOf(graph.groups, pai?.id)
    const nota: GraphAnnotation = { id: idDeNota(), text: "", x: Math.round(canto.x - base.x), y: Math.round(canto.y - base.y) }
    if (pai) nota.parent = pai.id
    setNotaNova(nota)
    setSelecao({ tipo: "nota", id: nota.id })
    setEditando(nota.id)
  }

  /** A nota entra no grupo mais fundo sob o centro dela, mantendo o lugar na tela. */
  const soltarNota = (id: string) => {
    const nota = notas.find((a) => a.id === id)
    if (!nota) return
    const base = absoluteOf(graph.groups, nota.parent)
    const altura = medidas.get(id)?.height ?? 80
    const centro = { x: base.x + nota.x + LARGURA_DA_NOTA / 2, y: base.y + nota.y + altura / 2 }
    const alvo = grupoNoPonto(graph, centro, new Set())
    if (alvo?.id === nota.parent) return
    const para = absoluteOf(graph.groups, alvo?.id)
    const nova = { ...nota, x: Math.round(nota.x + base.x - para.x), y: Math.round(nota.y + base.y - para.y), parent: alvo?.id }
    if (!alvo) delete nova.parent
    else {
      // como a peça: entra inteira na caixa, abaixo do chip
      nova.x = Math.max(MARGEM, Math.min(nova.x, alvo.w - LARGURA_DA_NOTA - MARGEM))
      nova.y = Math.max(TOPO, Math.min(nova.y, alvo.h - altura - MARGEM))
    }
    mudarNotas(notas.map((a) => (a.id === id ? nova : a)))
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

  /** Move uma ponta da ligação, com as regras de criar: sem repetida, sem ela mesma, só entre peças. */
  const religar = (id: string, from: string, to: string) => {
    const atual = graph.edges.find((e) => e.id === id)
    if (readOnly || !atual || from === to || !porId.has(from) || !porId.has(to)) return
    if (atual.from === from && atual.to === to) return
    if (graph.edges.some((e) => e.id !== id && e.from === from && e.to === to && e.relation === atual.relation)) return
    mudar({ ...graph, edges: graph.edges.map((e) => (e.id === id ? { ...e, from, to } : e)) })
    setSelecao({ tipo: "ligacao", id })
  }

  // soltar fora de uma alça: vale a peça sob o ponteiro, se houver uma
  const pecaNoPonto = (e: MouseEvent | TouchEvent) => {
    const ponto = "changedTouches" in e ? e.changedTouches[0] : e
    const id = document.elementFromPoint(ponto.clientX, ponto.clientY)?.closest<HTMLElement>(".react-flow__node")?.dataset.id
    return id && porId.has(id) ? id : undefined
  }

  const copiar = () => {
    if (!selecao || selecao.tipo === "ligacao") return
    if (selecao.tipo === "peca") {
      const no = porId.get(selecao.id)
      if (no) setCopia({ raiz: { kind: "node", id: no.id }, nodes: [no], groups: [], edges: [], notas: [] })
      return
    }
    if (selecao.tipo === "nota") {
      const nota = notas.find((a) => a.id === selecao.id)
      if (nota) setCopia({ raiz: { kind: "note", id: nota.id }, nodes: [], groups: [], edges: [], notas: [nota] })
      return
    }
    // o grupo leva o que está dentro, em qualquer nível, e as ligações entre essas peças
    const dentro = descendentes(graph.groups, selecao.id)
    const nodes = graph.nodes.filter((n) => n.parent && dentro.has(n.parent))
    const ids = new Set(nodes.map((n) => n.id))
    setCopia({
      raiz: { kind: "group", id: selecao.id },
      groups: graph.groups.filter((g) => dentro.has(g.id)),
      nodes,
      edges: graph.edges.filter((e) => ids.has(e.from) && ids.has(e.to)),
      notas: notas.filter((a) => a.parent && dentro.has(a.parent)),
    })
  }

  const colar = () => {
    if (readOnly || !copia) return
    if (copia.notas.length && (!comNotas || notas.length + copia.notas.length > ANNOTATION_LIMITS.count)) return
    if (copia.raiz.kind === "note") {
      const nota = copia.notas[0]
      const pai = nota.parent && graph.groups.some((g) => g.id === nota.parent) ? nota.parent : undefined
      const nova: GraphAnnotation = { ...nota, id: idDeNota(), x: nota.x + 24, y: nota.y + 24, parent: pai }
      if (!pai) delete nova.parent
      mudarNotas([...notas, nova])
      setSelecao({ tipo: "nota", id: nova.id })
      setCopia({ ...copia, notas: [{ ...nota, x: nota.x + 24, y: nota.y + 24 }] })
      return
    }
    if (
      graph.nodes.length + copia.nodes.length > GRAPH_LIMITS.nodes ||
      graph.groups.length + copia.groups.length > GRAPH_LIMITS.groups ||
      graph.edges.length + copia.edges.length > GRAPH_LIMITS.edges
    )
      return
    const original = (copia.raiz.kind === "node" ? copia.nodes : copia.groups).find((x) => x.id === copia.raiz.id)
    if (!original) return
    // no mesmo pai do original, se ele ainda existe; senão no topo, se a tabela deixar
    const pai = original.parent && graph.groups.some((g) => g.id === original.parent) ? original.parent : undefined
    if (copia.raiz.kind === "group" && !canNest(chainOf(graph.groups, pai), subtreeOf(copia.groups, copia.raiz.id))) return
    let g = graph
    const novo = new Map<string, string>()
    for (const x of copia.groups) {
      const id = nextId("g", g)
      novo.set(x.id, id)
      g = { ...g, groups: [...g.groups, { ...x, id }] }
    }
    for (const x of copia.nodes) {
      const id = nextId("n", g)
      novo.set(x.id, id)
      g = { ...g, nodes: [...g.nodes, { ...x, id }] }
    }
    for (const x of copia.edges) {
      const id = nextId("e", g)
      g = { ...g, edges: [...g.edges, { ...x, id, from: novo.get(x.from)!, to: novo.get(x.to)! }] }
    }
    // os de dentro apontam para os pais novos; a raiz vai 24px para o lado e para baixo, no pai certo
    const raiz = novo.get(copia.raiz.id)!
    const reparentar = <T extends { id: string; parent?: string; x: number; y: number }>(x: T): T => {
      if (!novo.has(x.id) && ![...novo.values()].includes(x.id)) return x
      if (x.id === raiz) {
        const r = { ...x, x: x.x + 24, y: x.y + 24, parent: pai }
        if (pai === undefined) delete r.parent
        return r
      }
      return x.parent && novo.has(x.parent) ? { ...x, parent: novo.get(x.parent) } : x
    }
    g = { ...g, groups: g.groups.map(reparentar), nodes: g.nodes.map(reparentar) }
    mudar(acomodar(g, { kind: copia.raiz.kind, id: raiz }, alturas))
    if (copia.notas.length) {
      // as notas do grupo vêm junto, nos grupos novos
      let maior = Math.max(0, ...notasNaTela.map((a) => Number(/^a-(\d+)$/.exec(a.id)?.[1] ?? 0)))
      mudarNotas([
        ...notas,
        ...copia.notas.map((a) => ({ ...a, id: `a-${++maior}`, parent: a.parent ? novo.get(a.parent) : undefined })),
      ])
    }
    setSelecao({ tipo: copia.raiz.kind === "node" ? "peca" : "grupo", id: raiz })
    // a próxima colagem cai 24px adiante, e não em cima desta
    setCopia({
      ...copia,
      nodes: copia.nodes.map((n) => (n.id === copia.raiz.id ? { ...n, x: n.x + 24, y: n.y + 24 } : n)),
      groups: copia.groups.map((x) => (x.id === copia.raiz.id ? { ...x, x: x.x + 24, y: x.y + 24 } : x)),
    })
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

  const aoMudarNos = (changes: NodeChange<PecaNode | GrupoNode | NotaNode>[]) => {
    let g = graph
    let mudou = false
    let ns = notas
    let mudaramNotas = false
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
        if (ehNota(c.id)) {
          if (notaNova?.id === c.id) setNotaNova(mover(notaNova))
          else {
            ns = ns.map(mover)
            mudaramNotas = true
          }
        } else {
          g = ehGrupo(c.id) ? { ...g, groups: g.groups.map(mover) } : { ...g, nodes: g.nodes.map(mover) }
          mudou = true
        }
      } else if (c.type === "select") {
        const tipo = ehGrupo(c.id) ? "grupo" : ehNota(c.id) ? "nota" : "peca"
        if (c.selected) setSelecao({ tipo, id: c.id })
        else setSelecao((s) => (s?.tipo === tipo && s.id === c.id ? null : s))
      }
      // "remove" não chega: o Delete é da bancada (o React Flow apagaria os filhos junto)
    }
    if (medidasNovas.length) setMedidas((antes) => new Map([...antes, ...medidasNovas]))
    if (mudou) mudar(g)
    if (mudaramNotas) mudarNotas(ns)
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
    minimoDe: (groupId) => {
      // as notas de dentro também seguram o tamanho do grupo
      const min = minimoDoGrupo(graph, groupId, alturas)
      for (const a of notasNaTela)
        if (a.parent === groupId) {
          min.w = Math.max(min.w, a.x + LARGURA_DA_NOTA + MARGEM)
          min.h = Math.max(min.h, a.y + (medidas.get(a.id)?.height ?? 80) + MARGEM)
        }
      return min
    },
    editando,
    setEditando,
    renomear,
    selecionarLigacao: (id) => setSelecao({ tipo: "ligacao", id }),
    readOnly,
    sim,
    escreverNota,
    foraDoCatalogo,
    marcadas: new Set(pick?.selected ?? []),
    destacadas,
    trancadas,
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
          const noCampo = !!alvo.closest("input, textarea, [contenteditable]")
          if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && !noCampo && !editando) {
            const tecla = e.key.toLowerCase()
            if (tecla === "c" && selecao && selecao.tipo !== "ligacao" && notaNova?.id !== selecao.id) {
              e.preventDefault()
              copiar()
              return
            }
            if (tecla === "v" && copia && !readOnly) {
              e.preventDefault()
              colar()
              return
            }
          }
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
          {comNotas ? (
            <ExerciseSection
              title={t("architecture_board.notes")}
              end={
                <span className="font-mono text-[11px] text-muted-foreground">
                  {t("architecture_board.notes_count", { count: notas.length, max: ANNOTATION_LIMITS.count })}
                </span>
              }
            >
              <div className="px-1.5 pb-2">
                <button
                  type="button"
                  onClick={porNota}
                  disabled={readOnly || cheioDeNotas || !!notaNova}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <NotePencil aria-hidden className="size-[15px] text-muted-foreground" />
                  {t("architecture_board.add_note")}
                </button>
              </div>
              <span className="block px-4 pb-2.5 text-[11.5px] leading-4 text-muted-foreground">
                {cheioDeNotas
                  ? t("architecture_board.limit_notes", { max: ANNOTATION_LIMITS.count })
                  : t("architecture_board.notes_hint")}
              </span>
            </ExerciseSection>
          ) : null}
          {pick ? (
            <Defeito
              pick={pick}
              nome={(id) => {
                const n = porId.get(id)
                return n ? (n.label ? `${bancada.tituloDe(n.kind)} · ${n.label}` : bancada.tituloDe(n.kind)) : id
              }}
              onMostrar={(id) => setSelecao({ tipo: "peca", id })}
            />
          ) : null}
          {rules ? <Regras rules={rules} summary={summary ?? null} checkError={checkError} /> : null}
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
          {/* dois lados que não disputam espaço: à esquerda a dica ou as ações da seleção, que encolhem
              (a dica trunca, as ações quebram a linha por dentro); à direita Expandir, Simular e
              Verificar, sempre na primeira linha */}
          <div className="flex min-h-[41px] items-start gap-2 border-b border-muted py-1.5 pr-2 pl-3">
            <div className="flex min-h-7 min-w-0 flex-1 items-center">
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
              nota={selecao?.tipo === "nota" ? notasNaTela.find((a) => a.id === selecao.id) : undefined}
              dicaDoDefeito={!!pick && readOnly}
              marcar={
                pick && pecaSelecionada && (!pick.candidates || pick.candidates.includes(pecaSelecionada.id))
                  ? {
                      marcada: pick.selected.includes(pecaSelecionada.id),
                      cheio: pick.selected.length >= pick.max,
                      onToggle: () =>
                        pick.onChange(
                          pick.selected.includes(pecaSelecionada.id)
                            ? pick.selected.filter((x) => x !== pecaSelecionada.id)
                            : pick.selected.length < pick.max
                              ? [...pick.selected, pecaSelecionada.id]
                              : pick.selected
                        ),
                    }
                  : undefined
              }
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
              onRotular={renomear}
              onRenomear={(id) => setEditando(id)}
              onApagar={() => selecao && apagar(selecao)}
              trancada={!!pecaSelecionada && trancadas.has(pecaSelecionada.id)}
            />
            )}
            </div>
            <span className="flex shrink-0 items-center gap-1.5">
              <ExerciseExpandButton />
              {onOpenInPlayground ? (
                <Button
                  variant="ghost"
                  onClick={onOpenInPlayground}
                  title={t("architecture_board.open_in_playground")}
                  aria-label={t("architecture_board.open_in_playground")}
                >
                  <ArrowSquareOut aria-hidden />
                  {t("architecture_board.open_in_playground_short")}
                </Button>
              ) : null}
              {/* sempre com o nome: só o ícone, o modo passava despercebido */}
              <Button
                variant={simulando ? "secondary" : "ghost"}
                aria-pressed={simulando}
                onClick={alternarSimulacao}
                disabled={graph.nodes.length === 0}
              >
                <Pulse aria-hidden weight={simulando ? "bold" : "regular"} />
                {t(simulando ? "architecture_board.sim.exit" : "architecture_board.sim.start")}
              </Button>
              {/* o desenho livre não tem regras, e então não tem Verificar */}
              {rules && checkDisabledReason ? (
                <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
                  {checkDisabledReason}
                </span>
              ) : null}
              {rules ? (
                <Button
                  variant="primary"
                  onClick={onCheck}
                  disabled={!onCheck || !!checkDisabledReason}
                  loading={checking}
                >
                  <Check aria-hidden weight="bold" />
                  {t("architecture_board.check")}
                </Button>
              ) : null}
            </span>
          </div>

          {foraDoCatalogo.size && !resultado ? (
            <ForaDoCatalogo
              pecas={graph.nodes.filter((n) => foraDoCatalogo.has(n.id))}
              itens={itens}
              tituloDe={bancada.tituloDe}
              onMostrar={(id) => setSelecao({ tipo: "peca", id })}
            />
          ) : null}
          {resultado ? (
            <ResumoDaSimulacao
              graph={graph}
              resultado={resultado}
              tituloDe={bancada.tituloDe}
            />
          ) : null}
          <div
            ref={palco}
            data-sim={simulando ? "" : undefined}
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
            <ReactFlow<PecaNode | GrupoNode | NotaNode, LigacaoEdge>
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
              onNodeDragStop={(_, n) => (ehNota(n.id) ? soltarNota(n.id) : aoSoltar(n.id))}
              onConnect={(c: Connection) => ligar(c.source, c.target)}
              onConnectEnd={(e, estado) => {
                if (estado.isValid || !estado.fromNode) return
                const alvo = pecaNoPonto(e)
                if (alvo) ligar(estado.fromNode.id, alvo)
              }}
              edgesReconnectable={!readOnly}
              onReconnect={(velha, nova) => religar(velha.id, nova.source, nova.target)}
              onReconnectEnd={(e, ligacao, ponta, estado) => {
                if (estado.isValid) return
                const alvo = pecaNoPonto(e)
                if (!alvo) return
                // `ponta` é a que fica parada: a outra é a que foi arrastada
                if (ponta === "source") religar(ligacao.id, ligacao.source, alvo)
                else religar(ligacao.id, alvo, ligacao.target)
              }}
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
              // na simulação, o palco ganha o tom da marca: não é o desenho em edição
              className={simulando ? "bg-primary-subtle/50" : "bg-card"}
            >
              <Background gap={18} size={1} color="var(--input)" />
            </ReactFlow>
            {simulando ? (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_0_2px_color-mix(in_oklab,var(--primary)_40%,transparent)]" />
            ) : null}
            {graph.nodes.length === 0 && graph.groups.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <span className="max-w-[260px] text-center text-[13px] leading-5 text-muted-foreground">
                  {t("architecture_board.empty")}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex h-[30px] shrink-0 items-center gap-3.5 overflow-hidden border-t border-muted px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
            <span className="truncate">
              {graph.groups.length
                ? t("architecture_board.status_groups", {
                    nodes: graph.nodes.length,
                    edges: graph.edges.length,
                    groups: graph.groups.length,
                  })
                : t("architecture_board.status", { nodes: graph.nodes.length, edges: graph.edges.length })}
              {notas.length ? ` · ${t("architecture_board.status_notes", { count: notas.length })}` : null}
            </span>
            {rules ? <span className="max-sm:hidden">{t("architecture_board.shortcut")}</span> : null}
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
    <span className="flex min-w-0 flex-wrap items-center gap-1">
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
      className="flex min-h-[34px] shrink-0 items-start gap-2 border-b border-primary-subtle-border bg-primary-subtle px-4 py-1.5 text-[12.5px] leading-[18px] text-primary-subtle-foreground"
    >
      <Pulse aria-hidden weight="bold" className="mt-0.5 size-3.5 shrink-0" />
      <span className="min-w-0">
        {/* o modo diz o que é antes do resultado: nada aqui vai para o desenho */}
        <span className="font-semibold">{t("architecture_board.sim.title")}</span> · {t("architecture_board.sim.not_saved")}{" "}
        {resultado.down.size ? <span className="font-medium">{t("architecture_board.sim.down_count", { count: resultado.down.size })} · </span> : null}
        {texto}
      </span>
    </div>
  )
}

/** A seção "Defeito" do rail: o que está marcado, quantas faltam, e o desmarcar. */
function Defeito({
  pick,
  nome,
  onMostrar,
}: {
  pick: NonNullable<ArchitectureBoardProps["pick"]>
  nome: (id: string) => string
  onMostrar: (id: string) => void
}) {
  const t = useTranslate()
  const cheio = pick.selected.length >= pick.max
  return (
    <ExerciseSection
      title={t("architecture_board.pick.title")}
      end={
        <span className={cn("font-mono text-[11px]", pick.selected.length ? "text-destructive" : "text-muted-foreground")}>
          {t("architecture_board.pick.count", { count: pick.selected.length, max: pick.max })}
        </span>
      }
    >
      {pick.selected.length ? (
        <ul className="m-0 flex list-none flex-col gap-px px-1.5 pb-1">
          {pick.selected.map((id) => (
            <li key={id} className="flex items-center gap-1 rounded-md pr-1 pl-2 hover:bg-muted">
              <button
                type="button"
                onClick={() => onMostrar(id)}
                className="flex h-8 min-w-0 flex-1 items-center gap-2 text-left text-[12.5px] text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <Flag aria-hidden weight="fill" className="size-[13px] shrink-0 text-destructive" />
                <span className="truncate">{nome(id)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={t("architecture_board.pick.remove", { name: nome(id) })}
                onClick={() => pick.onChange(pick.selected.filter((x) => x !== id))}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="block px-4 pb-2.5 text-[11.5px] leading-4 text-muted-foreground">
        {cheio ? t("architecture_board.pick.full", { max: pick.max }) : t("architecture_board.pick.hint")}
      </span>
    </ExerciseSection>
  )
}

/**
 * O aviso da peça que saiu do catálogo: o desenho abre, mas a API recusa salvar até a troca. Diz
 * qual é, o que fazer (trocar o serviço, ou apagar a peça cujo tipo não existe mais) e leva até ela.
 */
function ForaDoCatalogo({
  pecas,
  itens,
  tituloDe,
  onMostrar,
}: {
  pecas: GraphNode[]
  itens: Map<string, PaletteItem>
  tituloDe: (kind: string) => string
  onMostrar: (id: string) => void
}) {
  const t = useTranslate()
  return (
    <div
      role="alert"
      data-slot="architecture-board-catalog"
      className="flex shrink-0 flex-col gap-1 border-b border-destructive-subtle-border bg-destructive-subtle px-4 py-2 text-[12.5px] leading-[18px] text-destructive-subtle-foreground"
    >
      <span className="flex items-center gap-1.5 font-semibold">
        <Warning aria-hidden weight="bold" className="size-3.5 shrink-0" />
        {t("architecture_board.catalog.title", { count: pecas.length })}
      </span>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0 pl-5">
        {pecas.map((n) => (
          <li key={n.id} className="flex flex-wrap items-baseline gap-x-2">
            <span>
              <span className="font-medium">{n.label ?? tituloDe(n.kind)}</span> ·{" "}
              {t(itens.has(n.kind) ? "architecture_board.catalog.change_service" : "architecture_board.catalog.remove_piece")}
            </span>
            <button
              type="button"
              onClick={() => onMostrar(n.id)}
              className="rounded-[4px] font-medium underline-offset-[3px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              {t("architecture_board.catalog.show")}
            </button>
          </li>
        ))}
      </ul>
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
  // o segmentado do DS: o cursor desliza entre as opções (e só pula, com reduzir movimento)
  return (
    <div className="flex flex-col gap-1.5 px-3 pb-3">
      <ViewToggle
        ariaLabel={t("architecture_board.provider")}
        size="sm"
        value={atual ?? "generic"}
        onChange={readOnly ? undefined : (v) => onTrocar(v === "generic" ? undefined : v)}
        options={(["generic", ...PROVIDERS] as const).map((p) => ({
          value: p,
          label: t(`architecture_board.providers.${p}`),
        }))}
        // as quatro dividem o rail; "Genérico" é a mais longa e ganha mais espaço
        className={cn(
          "flex w-full [&>button]:min-w-0 [&>button]:flex-1 [&>button]:px-1.5 [&>button:nth-of-type(1)]:flex-[1.5]",
          readOnly && "pointer-events-none opacity-60"
        )}
      />
      <span className="px-1 text-[11.5px] leading-4 text-muted-foreground">
        {t(atual ? "architecture_board.provider_hint" : "architecture_board.provider_hint_generic")}
      </span>
    </div>
  )
}

// ── a barra de ações da seleção ─────────────────────────────────────────

function Acoes({
  onRotular,
  dicaDoDefeito,
  marcar,
  nota,
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
  trancada = false,
}: {
  /** Dá o rótulo a uma ligação (a condição sugerida na saída de uma Decisão); vazio tira. */
  onRotular?: (id: string, label: string) => void
  /** Só leitura com o marcar: a dica é marcar, não desenhar. */
  dicaDoDefeito?: boolean
  marcar?: { marcada: boolean; cheio: boolean; onToggle: () => void }
  nota?: GraphAnnotation
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
  /** A peça selecionada é do enunciado (`locked`): sem o Apagar. */
  trancada?: boolean
}) {
  const t = useTranslate()
  // marcar como defeito vale mesmo com o desenho só leitura: é a resposta, não a edição
  const botaoMarcar = marcar ? (
    <Button
      variant={marcar.marcada ? "secondary" : "ghost"}
      size="sm"
      aria-pressed={marcar.marcada}
      onClick={marcar.onToggle}
      disabled={!marcar.marcada && marcar.cheio}
      title={!marcar.marcada && marcar.cheio ? t("architecture_board.pick.full_hint") : undefined}
      className={cn(marcar.marcada && "text-destructive")}
    >
      <Flag aria-hidden weight={marcar.marcada ? "fill" : "regular"} />
      {t(marcar.marcada ? "architecture_board.pick.unmark" : "architecture_board.pick.mark")}
    </Button>
  ) : null
  if (readOnly && peca && botaoMarcar) return <span className="flex min-w-0 flex-wrap items-center gap-1">{botaoMarcar}</span>
  if (!readOnly && nota)
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onRenomear(nota.id)}>
          <PencilSimple aria-hidden />
          {t("architecture_board.edit_note")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onApagar}>
          <Trash aria-hidden />
          {t("architecture_board.delete")}
        </Button>
      </span>
    )
  if (readOnly || (!peca && !grupo && !ligacao))
    return (
      <span className="truncate text-[12px] text-muted-foreground">
        {t(dicaDoDefeito ? "architecture_board.pick.bar_hint" : "architecture_board.hint")}
      </span>
    )

  const comuns = (id: string) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => onRenomear(id)}>
        <PencilSimple aria-hidden />
        {t("architecture_board.rename")}
      </Button>
      {trancada && id === peca?.id ? (
        // a peça do enunciado não se apaga: no lugar do botão, o porquê
        <span title={t("architecture_board.locked_hint")} className="flex h-7 items-center gap-1.5 px-2 text-[12.5px] text-muted-foreground">
          <LockSimple aria-hidden weight="fill" className="size-3.5" />
          {t("architecture_board.locked")}
        </span>
      ) : (
        <Button variant="ghost" size="sm" onClick={onApagar}>
          <Trash aria-hidden />
          {t("architecture_board.delete")}
        </Button>
      )}
    </>
  )

  if (ligacao) {
    // a ligação que sai de uma Decisão leva a condição no rótulo: a barra sugere as comuns
    const daDecisao = graph.nodes.find((n) => n.id === ligacao.from)?.kind === "decision"
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1">
        <TiposDeLigacao valor={ligacao.relation} onTrocar={(r) => onRelacao(ligacao.id, r)} />
        <span aria-hidden className="mx-1 h-4 w-px bg-input" />
        {daDecisao && onRotular ? (
          <span role="group" aria-label={t("architecture_board.condition")} className="flex items-center gap-1">
            <span className="font-mono text-[9.5px] tracking-[0.12em] text-muted-foreground uppercase">
              {t("architecture_board.condition")}
            </span>
            {(["yes", "no", "error"] as const).map((c) => {
              const rotulo = t(`architecture_board.conditions.${c}`)
              return (
                <Button
                  key={c}
                  variant={ligacao.label === rotulo ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={ligacao.label === rotulo}
                  onClick={() => onRotular(ligacao.id, ligacao.label === rotulo ? "" : rotulo)}
                >
                  {rotulo}
                </Button>
              )
            })}
            <span aria-hidden className="mx-1 h-4 w-px bg-input" />
          </span>
        ) : null}
        {comuns(ligacao.id)}
      </span>
    )
  }

  if (grupo)
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1">
        <MoverPara item={{ kind: "group", id: grupo.id }} graph={graph} tituloDoGrupo={tituloDoGrupo} onMover={onMover} />
        {comuns(grupo.id)}
      </span>
    )

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1">
      {botaoMarcar}
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

/** Os cinco tipos de ligação no segmentado do DS. `cheio`: dividem a largura (no popover do Ligar a…). */
function TiposDeLigacao({ valor, onTrocar, cheio }: { valor: Relation; onTrocar: (r: Relation) => void; cheio?: boolean }) {
  const t = useTranslate()
  return (
    <ViewToggle
      ariaLabel={t("architecture_board.relation")}
      size="sm"
      value={valor}
      onChange={onTrocar}
      options={RELATIONS.map((r) => ({ value: r, label: t(`architecture_board.relations.${r}`) }))}
      className={cn("[&>button]:px-2.5", cheio && "flex w-full [&>button]:min-w-0 [&>button]:flex-1 [&>button]:px-1")}
    />
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
      <PopoverContent align="start" className="w-80 p-2">
        <span className="block px-1.5 pt-0.5 pb-1.5 font-mono text-[9.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {t("architecture_board.relation")}
        </span>
        <div className="px-1 pb-2">
          <TiposDeLigacao valor={relacao} onTrocar={setRelacao} cheio />
        </div>
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
}: { rules: BoardRule[]; summary: ArchitectureBoardProps["summary"]; checkError: ArchitectureBoardProps["checkError"] }) {
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
