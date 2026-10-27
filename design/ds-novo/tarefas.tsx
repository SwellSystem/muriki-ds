import * as React from "react"
import { createRoot } from "react-dom/client"
import { AnimatePresence, motion } from "framer-motion"
import { CaretRight, Check, Flag, LinkSimple, ListChecks, Plus, Rows, SquareHalf, CircleNotch } from "@phosphor-icons/react"

import type { TaskTableStatus, TaskTableTask } from "@/components/blocks/task-table"

/* A família de tarefas na linguagem das faixas: a tabela em árvore (épico,
   tarefa, subtarefa) e a linha do tempo ao lado, alinhadas linha a linha,
   com os vínculos. Os dados são TaskTableTask, o tipo real do task-table e
   do task-timeline: a API não muda, muda o desenho e o movimento. */

const CURVA = [0.16, 1, 0.3, 1] as [number, number, number, number]
const CHEGADA = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
const troca = {
  initial: { opacity: 0, filter: "blur(14px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(14px)", y: -10 },
  transition: { duration: 0.42, ease: CURVA },
}
const v = (n: string) => `var(--ds-${n})`
const LINHA = 48

const ST: Record<TaskTableStatus, { r: string; tom: string }> = {
  active: { r: "Aberta", tom: "green" },
  progress: { r: "Fazendo", tom: "blue" },
  blocked: { r: "Bloqueada", tom: "red" },
  done: { r: "Feita", tom: "gray" },
}
const TOM_DONO = { a1: "blue", a2: "purple", a3: "orange", a4: "gray" } as const

// ── os dados: TaskTableTask, como o Platform manda ───────────────────────

const t = (o: Partial<TaskTableTask> & Pick<TaskTableTask, "id" | "code" | "title" | "depth" | "kind" | "status">): TaskTableTask => o
const TAREFAS: TaskTableTask[] = [
  t({ id: "e1", code: "MUR-1", title: "Cobrança recorrente", depth: 0, kind: "epic", status: "progress", childGroupId: "e1", progress: { done: 2, total: 5 }, start: "2026-11-02", end: "2026-11-24", progressRatio: 0.4 }),
  t({ id: "t1", code: "MUR-2", title: "Revisar o fluxo de cobrança", depth: 1, kind: "task", status: "progress", parentId: "e1", childGroupId: "t1", owner: { initials: "GT", tone: "a1" }, due: "10 nov", start: "2026-11-02", end: "2026-11-10", progressRatio: 0.6, progress: { done: 1, total: 2 } }),
  t({ id: "s1", code: "MUR-3", title: "Mapear quem é cobrado duas vezes", depth: 2, kind: "sub", status: "done", parentId: "t1", owner: { initials: "AM", tone: "a2" }, due: "5 nov", start: "2026-11-02", end: "2026-11-05", progressRatio: 1 }),
  t({ id: "s2", code: "MUR-4", title: "Ajustar o cálculo proporcional", depth: 2, kind: "sub", status: "progress", parentId: "t1", lastChild: true, owner: { initials: "GT", tone: "a1" }, due: "10 nov", start: "2026-11-05", end: "2026-11-10", progressRatio: 0.3, deps: ["s1"] }),
  t({ id: "t2", code: "MUR-5", title: "Migrar webhooks do Stripe", depth: 1, kind: "task", status: "blocked", parentId: "e1", owner: { initials: "RS", tone: "a3" }, due: "16 nov", start: "2026-11-10", end: "2026-11-16", progressRatio: 0.1, deps: ["t1"] }),
  t({ id: "t3", code: "MUR-6", title: "Aviso de cartão vencendo", depth: 1, kind: "task", status: "active", parentId: "e1", owner: { initials: "LP", tone: "a4" }, due: "20 nov", start: "2026-11-14", end: "2026-11-20", progressRatio: 0 }),
  t({ id: "t4", code: "MUR-7", title: "Fatura em PDF com a marca", depth: 1, kind: "task", status: "done", parentId: "e1", lastChild: true, owner: { initials: "AM", tone: "a2" }, due: "8 nov", start: "2026-11-03", end: "2026-11-08", progressRatio: 1 }),
  t({ id: "e2", code: "MUR-10", title: "Membros e convites", depth: 0, kind: "epic", status: "active", childGroupId: "e2", progress: { done: 0, total: 3 }, start: "2026-11-12", end: "2026-11-28", progressRatio: 0.1 }),
  t({ id: "t5", code: "MUR-11", title: "Convite expira em 7 dias", depth: 1, kind: "task", status: "progress", parentId: "e2", owner: { initials: "RS", tone: "a3" }, due: "18 nov", start: "2026-11-12", end: "2026-11-18", progressRatio: 0.5 }),
  t({ id: "t6", code: "MUR-12", title: "Carência de quem passa do limite", depth: 1, kind: "task", status: "blocked", parentId: "e2", owner: { initials: "GT", tone: "a1" }, due: "24 nov", start: "2026-11-18", end: "2026-11-24", progressRatio: 0, deps: ["t5", "t2"] }),
  t({ id: "t7", code: "MUR-13", title: "Trocar o dono do workspace", depth: 1, kind: "task", status: "active", parentId: "e2", lastChild: true, owner: { initials: "LP", tone: "a4" }, due: "28 nov", start: "2026-11-22", end: "2026-11-28", progressRatio: 0 }),
]
const INICIO = new Date("2026-11-01")
const DIAS = 30
const HOJE = 9
const dia = (iso?: string) => (iso ? Math.round((new Date(iso).getTime() - INICIO.getTime()) / 86400000) : 0)

// ── peças ────────────────────────────────────────────────────────────────

function Etiqueta({ children, cor = v("tinta-2") }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: v("tinta-2") }}>
      <span className="size-1.5" style={{ background: cor }} />
      {children}
    </span>
  )
}

/** O status troca pelo desfoque quando muda (ex.: concluir a tarefa). */
function Status({ status }: { status: TaskTableStatus }) {
  const { r, tom } = ST[status]
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={status} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA} className="inline-flex h-7 items-center gap-2 rounded-[7px] px-2.5 text-[12.5px]" style={{ background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` }}>
        <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${tom}-dot)` }} />
        {r}
      </motion.span>
    </AnimatePresence>
  )
}

function Avatar({ iniciais, tom }: { iniciais: string; tom: string }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full font-mono text-[10px] ring-1 ring-[var(--ds-fio)]" style={{ background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` }}>
      {iniciais}
    </span>
  )
}

/** Concluir: o círculo vira check desfocando. Enquanto salva, gira. */
function Concluir({ feita, salvando, onClick }: { feita: boolean; salvando: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={feita ? "Reabrir" : "Concluir"} onClick={(e) => (e.stopPropagation(), onClick())} className="grid size-[20px] shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-300" style={{ background: feita ? "var(--success)" : "transparent", boxShadow: feita ? "0 0 0 1px var(--success)" : `inset 0 0 0 1.5px ${v("fio-forte")}`, color: "white" }}>
      <AnimatePresence mode="wait" initial={false}>
        {salvando ? (
          <motion.span key="giro" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)", rotate: 360 }} exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ rotate: { duration: 0.8, ease: "linear", repeat: Infinity }, default: { duration: 0.2 } }} style={{ color: feita ? "white" : v("tinta-2") }}>
            <CircleNotch size={13} weight="bold" />
          </motion.span>
        ) : feita ? (
          <motion.span key="check" initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.3, ease: CURVA }}>
            <Check size={11} weight="bold" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}

/** O indicador do que salva sozinho: "Salvando…" com o ponto pulsando, depois
    "Salvo" com o check, depois some. Cada troca pelo desfoque. */
function IndicadorSalvo({ estado }: { estado: "ocioso" | "salvando" | "salvo" }) {
  return (
    <div className="flex h-8 min-w-[120px] items-center justify-end">
      <AnimatePresence mode="wait">
        {estado === "ocioso" ? null : (
          <motion.span key={estado} initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA} className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: estado === "salvo" ? "var(--success)" : v("tinta-2") }}>
            {estado === "salvando" ? <motion.span className="size-1.5 rounded-full" style={{ background: "var(--primary)" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} /> : <Check size={12} weight="bold" />}
            {estado === "salvando" ? "Salvando…" : "Salvo"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── a tabela em árvore ───────────────────────────────────────────────────

const COLS = "grid-cols-[minmax(0,1fr)_118px_44px_64px]"

function Arvore({
  visiveis,
  fechados,
  alternarGrupo,
  foco,
  setFoco,
  feitas,
  salvando,
  concluir,
}: {
  visiveis: TaskTableTask[]
  fechados: Set<string>
  alternarGrupo: (id: string) => void
  foco: string | null
  setFoco: (id: string | null) => void
  feitas: Set<string>
  salvando: string | null
  concluir: (id: string) => void
}) {
  const ligados = foco ? ligadosA(foco) : null
  return (
    <div className="min-w-0">
      <div className={`grid h-11 items-center gap-3 px-4 font-mono text-[10.5px] tracking-[0.1em] uppercase ${COLS}`} style={{ color: v("tinta-2"), boxShadow: `inset 0 -1px 0 ${v("fio")}` }}>
        <span>Tarefa</span>
        <span>Status</span>
        <span />
        <span className="text-right">Prazo</span>
      </div>
      <AnimatePresence initial={false}>
        {visiveis.map((tk) => {
          const status: TaskTableStatus = feitas.has(tk.id) ? "done" : tk.status
          const grupo = tk.childGroupId
          const fechado = grupo ? fechados.has(grupo) : false
          const recua = ligados && !ligados.has(tk.id)
          const epico = tk.depth === 0
          return (
            <motion.div
              key={tk.id}
              layout
              initial={{ opacity: 0, height: 0, filter: "blur(8px)" }}
              animate={{ opacity: recua ? 0.35 : 1, height: LINHA, filter: "blur(0px)" }}
              exit={{ opacity: 0, height: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: CURVA }}
              onMouseEnter={() => setFoco(tk.id)}
              onMouseLeave={() => setFoco(null)}
              className={`relative grid items-center gap-3 overflow-hidden px-4 ${COLS}`}
              style={{ boxShadow: `inset 0 -1px 0 ${v("fio")}`, background: epico ? v("trilho") : foco === tk.id ? "color-mix(in oklab, var(--primary) 6%, transparent)" : undefined }}
            >
              <span className="flex min-w-0 items-center gap-2" style={{ paddingLeft: tk.depth * 22 }}>
                {/* o fio da árvore: subtarefa pendurada na tarefa */}
                {tk.depth > 0 ? <span aria-hidden className="absolute top-0 bottom-0 w-px" style={{ left: 16 + tk.depth * 22 - 12, background: v("fio-forte"), height: tk.lastChild ? LINHA / 2 : LINHA }} /> : null}
                {tk.depth > 0 ? <span aria-hidden className="absolute h-px w-2.5" style={{ left: 16 + tk.depth * 22 - 12, top: LINHA / 2, background: v("fio-forte") }} /> : null}
                {grupo ? (
                  <button type="button" onClick={() => alternarGrupo(grupo)} aria-label={fechado ? "Abrir" : "Recolher"} className="grid size-5 shrink-0 place-items-center rounded-[5px] hover:bg-[var(--ds-trilho)]" style={{ color: v("tinta-2") }}>
                    <motion.span animate={{ rotate: fechado ? 0 : 90 }} transition={{ duration: 0.3, ease: CURVA }}>
                      <CaretRight size={12} weight="bold" />
                    </motion.span>
                  </button>
                ) : (
                  <span className="w-5 shrink-0" />
                )}
                {epico ? (
                  <Flag size={15} weight="fill" style={{ color: "var(--primary)" }} />
                ) : (
                  <Concluir feita={status === "done"} salvando={salvando === tk.id} onClick={() => concluir(tk.id)} />
                )}
                <span className="shrink-0 font-mono text-[11px]" style={{ color: v("tinta-2") }}>
                  {tk.code}
                </span>
                {epico ? (
                  <span className="truncate font-mono text-[12px] tracking-[0.08em] uppercase" style={{ color: v("tinta-forte") }}>
                    {tk.title}
                  </span>
                ) : (
                  <span className="truncate text-[14px] transition-colors duration-300" style={{ color: status === "done" ? v("tinta-2") : v("tinta-forte") }}>
                    {tk.title}
                  </span>
                )}
                {tk.deps?.length ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-[6px] px-1.5 py-0.5 font-mono text-[10px]" style={{ background: v("trilho"), color: v("tinta-2") }} title={`Depende de ${tk.deps.map((d) => TAREFAS.find((x) => x.id === d)?.code).join(", ")}`}>
                    <LinkSimple size={11} /> {tk.deps.length}
                  </span>
                ) : null}
                {epico && tk.progress ? (
                  <span className="ml-1 font-mono text-[11px]" style={{ color: v("tinta-2") }}>
                    {tk.progress.done}/{tk.progress.total}
                  </span>
                ) : null}
              </span>
              <span>{epico ? null : <Status status={status} />}</span>
              <span>{tk.owner ? <Avatar iniciais={tk.owner.initials} tom={TOM_DONO[tk.owner.tone ?? "a4"]} /> : null}</span>
              <span className="text-right font-mono text-[11.5px]" style={{ color: v("tinta-2") }}>
                {tk.due ?? ""}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/** Quem está ligado a uma tarefa: ela, as que ela depende e as que dependem dela. */
function ligadosA(id: string) {
  const s = new Set([id])
  const tk = TAREFAS.find((x) => x.id === id)
  tk?.deps?.forEach((d) => s.add(d))
  TAREFAS.forEach((x) => x.deps?.includes(id) && s.add(x.id))
  return s
}

// ── a linha do tempo ─────────────────────────────────────────────────────

function Linha({ visiveis, foco, setFoco, feitas }: { visiveis: TaskTableTask[]; foco: string | null; setFoco: (id: string | null) => void; feitas: Set<string> }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [larg, setLarg] = React.useState(600)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setLarg(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const px = larg / DIAS
  const linhaDe = new Map(visiveis.map((tk, i) => [tk.id, i]))
  const ligados = foco ? ligadosA(foco) : null
  const altura = visiveis.length * LINHA

  return (
    <div ref={ref} className="relative min-w-0" style={{ boxShadow: `inset 1px 0 0 ${v("fio")}` }}>
      {/* a régua dos dias */}
      <div className="relative h-11" style={{ boxShadow: `inset 0 -1px 0 ${v("fio")}` }}>
        {Array.from({ length: DIAS }, (_, d) =>
          d % 3 === 0 ? (
            <span key={d} className="absolute top-1/2 -translate-y-1/2 font-mono text-[10px]" style={{ left: d * px + 4, color: d === HOJE ? "var(--primary)" : v("tinta-2") }}>
              {d + 1}
            </span>
          ) : null
        )}
      </div>
      <motion.div className="relative" animate={{ height: altura }} transition={{ duration: 0.4, ease: CURVA }}>
        {/* as semanas e o hoje */}
        {Array.from({ length: DIAS }, (_, d) => (d % 7 === 0 ? <span key={d} className="absolute top-0 bottom-0 w-px" style={{ left: d * px, background: v("fio") }} /> : null))}
        <span className="absolute top-0 bottom-0 w-0.5" style={{ left: HOJE * px, background: "var(--primary)", boxShadow: "0 0 10px color-mix(in oklab, var(--primary) 60%, transparent)" }} />

        {/* os vínculos: tracejado de quem é dependido até quem depende */}
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={larg} height={altura}>
          <AnimatePresence>
            {visiveis.flatMap((tk) =>
              (tk.deps ?? []).map((dep) => {
                const de = TAREFAS.find((x) => x.id === dep)
                const a = linhaDe.get(dep)
                const b = linhaDe.get(tk.id)
                if (!de || a === undefined || b === undefined) return null
                const x1 = (dia(de.end) + 1) * px
                const y1 = a * LINHA + LINHA / 2
                const x2 = dia(tk.start) * px
                const y2 = b * LINHA + LINHA / 2
                const meio = Math.max(x1 + 10, (x1 + x2) / 2)
                const aceso = ligados ? ligados.has(tk.id) && ligados.has(dep) : false
                return (
                  <motion.path
                    key={`${dep}-${tk.id}`}
                    d={`M ${x1} ${y1} H ${meio} V ${y2} H ${x2 - 4}`}
                    fill="none"
                    strokeDasharray="4 4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: ligados && !aceso ? 0.15 : 1, stroke: aceso ? "var(--primary)" : "var(--ds-fio-forte)", strokeWidth: aceso ? 1.6 : 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: CURVA }}
                    markerEnd="url(#seta)"
                  />
                )
              })
            )}
          </AnimatePresence>
          <defs>
            <marker id="seta" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--ds-fio-forte)" />
            </marker>
          </defs>
        </svg>

        {/* as barras: entram desfocadas, e o progresso enche da esquerda para a direita, como a faixa */}
        <AnimatePresence initial={false}>
          {visiveis.map((tk, i) => {
            const st: TaskTableStatus = feitas.has(tk.id) ? "done" : tk.status
            const ini = dia(tk.start)
            const fim = dia(tk.end) + 1
            const epico = tk.depth === 0
            const recua = ligados && !ligados.has(tk.id)
            const prog = feitas.has(tk.id) ? 1 : (tk.progressRatio ?? 0)
            const tom = ST[st].tom
            return (
              <motion.div
                key={tk.id}
                layout
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: recua ? 0.3 : 1, filter: "blur(0px)", top: i * LINHA + (epico ? 17 : 11) }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: CURVA }}
                onMouseEnter={() => setFoco(tk.id)}
                onMouseLeave={() => setFoco(null)}
                className="absolute overflow-hidden"
                style={{
                  left: ini * px,
                  width: (fim - ini) * px - 2,
                  height: epico ? 14 : 26,
                  borderRadius: epico ? 4 : 8,
                  background: epico ? v("trilho-forte") : `var(--tone-${tom})`,
                  boxShadow: foco === tk.id ? `0 0 0 1.5px var(--tone-${tom}-dot), 0 8px 20px -8px var(--tone-${tom}-dot)` : `inset 0 0 0 1px color-mix(in oklab, var(--tone-${tom}-dot) 30%, transparent)`,
                }}
              >
                <motion.span className="absolute inset-y-0 left-0" initial={{ width: 0 }} animate={{ width: `${prog * 100}%` }} transition={{ duration: 1, ease: CURVA, delay: 0.1 + i * 0.04 }} style={{ background: epico ? "var(--primary)" : `color-mix(in oklab, var(--tone-${tom}-dot) 35%, transparent)` }} />
                {!epico && (fim - ini) * px > 70 ? (
                  <span className="relative flex h-full items-center px-2 font-mono text-[10.5px]" style={{ color: `var(--tone-${tom}-foreground)` }}>
                    {tk.code}
                  </span>
                ) : null}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ── a tela ───────────────────────────────────────────────────────────────

function Tela() {
  const [escuro, setEscuro] = React.useState(() => location.hash.includes("escuro"))
  const [vista, setVista] = React.useState<"tabela" | "lado">(() => (location.hash.includes("tabela") ? "tabela" : "lado"))
  const [fechados, setFechados] = React.useState<Set<string>>(new Set())
  const [foco, setFoco] = React.useState<string | null>(null)
  const [feitas, setFeitas] = React.useState<Set<string>>(new Set())
  const [salvando, setSalvando] = React.useState<string | null>(null)
  const [estado, setEstado] = React.useState<"ocioso" | "salvando" | "salvo">("ocioso")
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", escuro)
  }, [escuro])

  // a árvore visível: some quem tem um ancestral recolhido
  const visiveis = TAREFAS.filter((tk) => {
    let p = tk.parentId
    while (p) {
      if (fechados.has(p)) return false
      p = TAREFAS.find((x) => x.id === p)?.parentId
    }
    return true
  })

  const alternarGrupo = (id: string) =>
    setFechados((f) => {
      const n = new Set(f)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  // concluir: gira enquanto "salva", troca o status pelo desfoque, o indicador diz Salvo
  const concluir = (id: string) => {
    if (salvando) return
    setSalvando(id)
    setEstado("salvando")
    setTimeout(() => {
      setFeitas((f) => {
        const n = new Set(f)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      })
      setSalvando(null)
      setEstado("salvo")
      setTimeout(() => setEstado("ocioso"), 1600)
    }, 900)
  }

  return (
    <div className="flex min-h-dvh flex-col gap-6 px-10 py-9" style={{ color: v("tinta") }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: v("chao") }}>
        <div className="absolute -inset-[10%] blur-[48px]" style={{ background: `repeating-linear-gradient(104deg, transparent 0 7vw, ${v("luz")} 7vw 12vw, transparent 12vw 19vw, ${v("madeira")} 19vw 21vw, transparent 21vw 30vw)`, opacity: 0.9 }} />
      </div>

      <header className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Etiqueta cor="var(--accent)">Família de tarefas · TaskTableTask</Etiqueta>
          <h1 className="text-[40px] leading-none font-light tracking-[-0.035em]" style={{ color: v("tinta-forte") }}>
            Cobrança
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <IndicadorSalvo estado={estado} />
          <div className="flex h-10 items-center rounded-[10px] p-1" style={{ background: v("trilho"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
            {(
              [
                ["tabela", "Tabela", <Rows key="r" size={16} />],
                ["lado", "Tabela + linha do tempo", <SquareHalf key="s" size={16} />],
              ] as const
            ).map(([k, r, i]) => (
              <button key={k} type="button" onClick={() => setVista(k)} className="relative flex h-8 items-center gap-2 px-3.5 text-[13.5px]" style={{ color: vista === k ? v("tinta-forte") : v("tinta-2") }}>
                {vista === k ? <motion.span layoutId="vista" className="absolute inset-0 rounded-[7px]" style={{ background: v("placa-forte"), boxShadow: `0 2px 8px -2px ${v("sombra")}, inset 0 0 0 1px ${v("fio")}` }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} /> : null}
                <motion.span key={vista === k ? "a" : "i"} initial={vista === k ? { opacity: 0.2, filter: "blur(8px)" } : false} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="relative flex items-center gap-2">
                  {i}
                  {r}
                </motion.span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEscuro(!escuro)} className="h-10 rounded-[10px] px-3.5 font-mono text-[11px] tracking-[0.08em] uppercase" style={{ background: v("placa-forte"), color: v("tinta"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
            {escuro ? "Claro" : "Escuro"}
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[14px]" style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" }}>
            <Plus size={16} /> Nova tarefa
          </button>
        </div>
      </header>

      <p className="-mt-2 max-w-[80ch] text-[13.5px] leading-relaxed" style={{ color: v("tinta-2") }}>
        Passe o mouse numa tarefa: ela e os vínculos dela ficam à frente, o resto recua. Recolha um épico ou uma tarefa com subtarefas: as linhas saem desfocando, nas duas metades juntas. Conclua uma tarefa no círculo: gira enquanto salva, o status troca pelo desfoque e o indicador diz Salvo.
      </p>

      <section className="overflow-hidden rounded-[14px]" style={{ background: v("placa-2"), backdropFilter: "blur(30px) saturate(1.3)", WebkitBackdropFilter: "blur(30px) saturate(1.3)", boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
        <motion.div layout className="grid" style={{ gridTemplateColumns: vista === "lado" ? "minmax(0,1.05fr) minmax(0,1fr)" : "minmax(0,1fr)" }} transition={{ duration: 0.5, ease: CURVA }}>
          <Arvore visiveis={visiveis} fechados={fechados} alternarGrupo={alternarGrupo} foco={foco} setFoco={setFoco} feitas={feitas} salvando={salvando} concluir={concluir} />
          <AnimatePresence>
            {vista === "lado" ? (
              <motion.div key="linha" {...troca}>
                <Linha visiveis={visiveis} foco={foco} setFoco={setFoco} feitas={feitas} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </section>

      <div className="flex items-center gap-6 font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: v("tinta-2") }}>
        <span className="flex items-center gap-2">
          <ListChecks size={14} /> {TAREFAS.filter((x) => x.depth > 0).length} tarefas
        </span>
        <span className="flex items-center gap-2">
          <LinkSimple size={14} /> {TAREFAS.reduce((n, x) => n + (x.deps?.length ?? 0), 0)} vínculos
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-0.5" style={{ background: "var(--primary)" }} /> hoje, 10 nov
        </span>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<Tela />)
