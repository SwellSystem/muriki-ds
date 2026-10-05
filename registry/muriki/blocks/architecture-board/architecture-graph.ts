/**
 * O ArchitectureGraph da Muriki e as regras de contenção que o board aplica antes de a API ver.
 *
 * Funções puras, sem React: o board usa, e o app pode usar também (converter rascunho v1, testar).
 * A API repete a checagem no `parseGraph` como barreira; a tabela aqui é a mesma de lá
 * (muriki-api src/modules/code/domain/architecture-graph.ts, `allowedParents`).
 *
 * CONTENÇÃO É SÓ O `parent`. A posição é desenho: a API nunca recalcula quem está dentro de quem
 * pela geometria. O board decide o `parent` quando a peça é solta (o grupo mais fundo que contém o
 * centro dela) e guarda `x`, `y` relativos ao pai.
 */

export type Relation = "calls" | "reads" | "writes" | "publishes" | "consumes"

export const RELATIONS: Relation[] = ["calls", "reads", "writes", "publishes", "consumes"]

export type CloudProvider = "aws" | "gcp" | "azure"

export const PROVIDERS: CloudProvider[] = ["aws", "gcp", "azure"]

export type GroupType = "region" | "zone" | "vpc" | "public-subnet" | "private-subnet"

export const GROUP_TYPES: GroupType[] = ["region", "zone", "vpc", "public-subnet", "private-subnet"]

export interface GraphNode {
  id: string
  kind: string
  label?: string
  /** Relativo ao pai, se houver. */
  x: number
  y: number
  /** `<provedor>.<serviço>`; só com `provider` no grafo, e com o mesmo prefixo. */
  service?: string
  /** O id de um grupo. */
  parent?: string
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  relation: Relation
  label?: string
}

export interface GraphGroup {
  id: string
  type: GroupType
  label?: string
  parent?: string
  /** Relativos ao pai, se houver. */
  x: number
  y: number
  w: number
  h: number
}

export interface ArchitectureGraphV1 {
  v: 1
  nodes: Array<Omit<GraphNode, "service" | "parent">>
  edges: GraphEdge[]
}

export interface ArchitectureGraphV2 {
  v: 2
  /** Ausente = genérico, e nenhuma peça tem `service`. */
  provider?: CloudProvider
  nodes: GraphNode[]
  edges: GraphEdge[]
  groups: GraphGroup[]
}

/** Os limites do schema v2: o board não deixa passar deles, e a API recusa o que passar. */
export const GRAPH_LIMITS = {
  nodes: 40,
  edges: 80,
  groups: 20,
  label: 60,
  coordinate: 100_000,
  size: 100_000,
  serializedLength: 24_000,
} as const

/** O v1 vira v2 sem mudar nada do desenho: sem grupos, sem provedor. */
export function toV2(graph: ArchitectureGraphV1 | ArchitectureGraphV2): ArchitectureGraphV2 {
  if (graph.v === 2) return graph
  return { v: 2, nodes: graph.nodes.map((n) => ({ ...n })), edges: graph.edges.map((e) => ({ ...e })), groups: [] }
}

// ── o aninhamento ───────────────────────────────────────────────────────

const SUBNETS: GroupType[] = ["public-subnet", "private-subnet"]

/** Uma tabela só, para AWS, GCP e Azure. `null` é o topo do desenho. */
const PAIS_PERMITIDOS: Record<GroupType, Array<GroupType | null>> = {
  region: [null, "vpc"],
  vpc: [null, "region"],
  zone: [null, "region", "vpc"],
  "public-subnet": ["vpc", "region", "zone"],
  "private-subnet": ["vpc", "region", "zone"],
}

/** Uma subárvore de grupos: o grupo que se move, com os grupos de dentro. Peças não entram. */
export interface GroupSubtree {
  type: GroupType
  children: GroupSubtree[]
}

/**
 * Pode `subtree` ficar dentro da cadeia `parentChain` (do topo até o pai; `[]` é o topo)?
 * Confere a subárvore inteira contra a tabela: pai permitido por tipo, nenhum tipo repetido numa
 * cadeia e toda sub-rede com uma VPC acima. A profundidade não tem checagem própria: a tabela já
 * limita a cadeia a quatro grupos.
 */
export function canNest(parentChain: GroupType[], subtree: GroupSubtree): boolean {
  const pai = parentChain.length ? parentChain[parentChain.length - 1] : null
  if (!PAIS_PERMITIDOS[subtree.type].includes(pai)) return false
  if (parentChain.includes(subtree.type)) return false
  if (SUBNETS.includes(subtree.type) && !parentChain.includes("vpc")) return false
  const cadeia = [...parentChain, subtree.type]
  return subtree.children.every((filho) => canNest(cadeia, filho))
}

/** A cadeia de tipos do topo até o grupo `id`, ele incluído. */
export function chainOf(groups: GraphGroup[], id: string | undefined): GroupType[] {
  const porId = new Map(groups.map((g) => [g.id, g]))
  const cadeia: GroupType[] = []
  const vistos = new Set<string>()
  for (let g = id ? porId.get(id) : undefined; g && !vistos.has(g.id); g = g.parent ? porId.get(g.parent) : undefined) {
    vistos.add(g.id)
    cadeia.unshift(g.type)
  }
  return cadeia
}

/** O grupo `id` com os grupos de dentro, como `canNest` pede. */
export function subtreeOf(groups: GraphGroup[], id: string): GroupSubtree {
  const g = groups.find((x) => x.id === id)
  if (!g) throw new Error(`grupo ${id} não existe`)
  return { type: g.type, children: groups.filter((x) => x.parent === id).map((x) => subtreeOf(groups, x.id)) }
}

/** A posição absoluta de um grupo (soma das posições até o topo). */
export function absoluteOf(groups: GraphGroup[], id: string | undefined): { x: number; y: number } {
  const porId = new Map(groups.map((g) => [g.id, g]))
  let x = 0
  let y = 0
  const vistos = new Set<string>()
  for (let g = id ? porId.get(id) : undefined; g && !vistos.has(g.id); g = g.parent ? porId.get(g.parent) : undefined) {
    vistos.add(g.id)
    x += g.x
    y += g.y
  }
  return { x, y }
}

/** Troca o pai de uma peça ou de um grupo mantendo o lugar na tela (a posição relativa é refeita). */
export function reparent(
  graph: ArchitectureGraphV2,
  item: { kind: "node" | "group"; id: string },
  parent: string | undefined
): ArchitectureGraphV2 {
  const lista = item.kind === "node" ? graph.nodes : graph.groups
  const atual = lista.find((x) => x.id === item.id)
  if (!atual || atual.parent === parent) return graph
  const antes = absoluteOf(graph.groups, atual.parent)
  const depois = absoluteOf(graph.groups, parent)
  const mover = <T extends { id: string; x: number; y: number; parent?: string }>(x: T): T => {
    if (x.id !== item.id) return x
    const novo = { ...x, x: x.x + antes.x - depois.x, y: x.y + antes.y - depois.y, parent }
    if (parent === undefined) delete novo.parent
    return novo
  }
  return item.kind === "node"
    ? { ...graph, nodes: graph.nodes.map(mover) }
    : { ...graph, groups: graph.groups.map(mover) }
}

/**
 * Apaga um grupo (regra da API, revisão do front de 2026-10-04):
 * - cada grupo de dentro sobe para o avô, se ali ficar válido; senão continua subindo até achar um
 *   lugar válido. Se nem o topo serve (sub-rede sem VPC acima), ele também é apagado, com a mesma
 *   regra para os grupos de dentro dele;
 * - peças nunca são apagadas: sobem para o ancestral mais próximo que restar, ou vão para o topo.
 * Tudo mantém o lugar na tela.
 */
export function deleteGroup(graph: ArchitectureGraphV2, id: string): ArchitectureGraphV2 {
  const alvo = graph.groups.find((g) => g.id === id)
  if (!alvo) return graph
  // os ancestros do grupo apagado, do mais perto ao topo; `undefined` é o topo
  const subidas: Array<string | undefined> = []
  for (let p = alvo.parent; p !== undefined; p = graph.groups.find((g) => g.id === p)?.parent) subidas.push(p)
  subidas.push(undefined)

  let g: ArchitectureGraphV2 = graph
  // os de dentro mudam antes de o grupo sair da lista: a posição na tela ainda passa por ele
  const apagar = (grupoId: string) => {
    for (const filho of g.groups.filter((x) => x.parent === grupoId)) {
      const sub = subtreeOf(g.groups, filho.id)
      const i = subidas.findIndex((d) => canNest(chainOf(g.groups, d), sub))
      if (i >= 0) g = reparent(g, { kind: "group", id: filho.id }, subidas[i])
      else apagar(filho.id)
    }
    for (const no of g.nodes.filter((n) => n.parent === grupoId)) {
      g = reparent(g, { kind: "node", id: no.id }, subidas[0])
    }
    g = { ...g, groups: g.groups.filter((x) => x.id !== grupoId) }
  }
  apagar(id)
  return g
}

/** O próximo id livre com o prefixo (`n-3`, `e-7`, `g-2`), único entre peças, ligações e grupos. */
export function nextId(prefix: string, graph: Pick<ArchitectureGraphV2, "nodes" | "edges" | "groups">) {
  let maior = 0
  for (const { id } of [...graph.nodes, ...graph.edges, ...graph.groups]) {
    const m = new RegExp(`^${prefix}-(\\d+)$`).exec(id)
    if (m) maior = Math.max(maior, Number(m[1]))
  }
  return `${prefix}-${maior + 1}`
}

// ── a simulação ─────────────────────────────────────────────────────────

/** O resultado de `simulateFlow`. `depth` é a quantos passos do Cliente cada peça alcançada está. */
export interface FlowSimulation {
  reached: Set<string>
  /** As ligações que o pulso percorre, inclusive a que chega numa peça derrubada (ele para ali). */
  edges: Set<string>
  /** As peças fora do ar e sem caminho a partir de um Cliente (as derrubadas não entram). */
  unreachable: string[]
  /** As peças derrubadas, direto ou por estarem dentro de um grupo derrubado, em qualquer nível. */
  down: Set<string>
  depth: Map<string, number>
}

/**
 * Executa o desenho: um pulso parte de toda peça `client` e anda pelas ligações no sentido do
 * trabalho, o mesmo do `flow` da API (muriki-api graph-rules.ts, `workArcs`): a seta conta, e
 * `consumes` anda ao contrário, de quem publica para quem consome. A peça derrubada sai do caminho,
 * e o grupo derrubado derruba tudo o que está dentro dele pelo `parent`, nunca pela posição.
 * Estado passageiro: nada disto vai para o grafo.
 */
export function simulateFlow(
  graph: Pick<ArchitectureGraphV2, "nodes" | "edges" | "groups">,
  down: { nodes: string[]; groups: string[] }
): FlowSimulation {
  const gruposFora = new Set<string>()
  for (const id of down.groups) for (const g of descendantsOf(graph.groups, id)) gruposFora.add(g)
  const fora = new Set(down.nodes)
  for (const n of graph.nodes) if (n.parent && gruposFora.has(n.parent)) fora.add(n.id)

  const arcos = new Map<string, Array<{ to: string; edge: string }>>()
  for (const e of graph.edges) {
    const [de, para] = e.relation === "consumes" ? [e.to, e.from] : [e.from, e.to]
    // o pulso não sai de quem caiu; chega até quem caiu, e para ali
    if (fora.has(de)) continue
    arcos.set(de, [...(arcos.get(de) ?? []), { to: para, edge: e.id }])
  }
  const depth = new Map<string, number>()
  const edges = new Set<string>()
  let fronteira = graph.nodes.filter((n) => n.kind === "client" && !fora.has(n.id)).map((n) => n.id)
  for (const id of fronteira) depth.set(id, 0)
  for (let passo = 1; fronteira.length; passo++) {
    const proxima: string[] = []
    for (const at of fronteira)
      for (const { to, edge } of arcos.get(at) ?? []) {
        edges.add(edge)
        if (fora.has(to)) continue
        if (!depth.has(to)) {
          depth.set(to, passo)
          proxima.push(to)
        }
      }
    fronteira = proxima
  }
  const reached = new Set(depth.keys())
  return {
    reached,
    edges,
    unreachable: graph.nodes.filter((n) => !reached.has(n.id) && !fora.has(n.id)).map((n) => n.id),
    down: fora,
    depth,
  }
}

/** O grupo e todos os de dentro, em qualquer nível. */
function descendantsOf(groups: GraphGroup[], id: string): Set<string> {
  const ids = new Set([id])
  for (let cresceu = true; cresceu; ) {
    cresceu = false
    for (const g of groups)
      if (g.parent && ids.has(g.parent) && !ids.has(g.id)) {
        ids.add(g.id)
        cresceu = true
      }
  }
  return ids
}
