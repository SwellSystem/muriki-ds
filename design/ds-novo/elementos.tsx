import * as React from "react"
import { createRoot } from "react-dom/client"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowRight, CaretDown, CaretRight, Check, DotsThree, MagnifyingGlass, Minus, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react"

/* Os elementos da linguagem das faixas, desenhados do zero: cada peça com
   os estados que importam e o movimento. Os tokens são os de faixas.css.
   As regras: parado é nítido; toda troca passa pelo desfoque; 40px é a
   altura padrão; canto 10 nos controles; rótulo em mono; o azul é o único
   destaque. */

const CURVA = [0.16, 1, 0.3, 1] as [number, number, number, number]
const CHEGADA = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
const ABRE = {
  initial: { opacity: 0, filter: "blur(10px)", y: -6, scale: 0.98 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 },
  exit: { opacity: 0, filter: "blur(10px)", y: -6, scale: 0.98 },
  transition: { duration: 0.32, ease: CURVA },
}
const troca = {
  initial: { opacity: 0, filter: "blur(14px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(14px)", y: -10 },
  transition: { duration: 0.42, ease: CURVA },
}
const v = (n: string) => `var(--ds-${n})`
const halo = (cor = "var(--primary)") => `inset 0 0 0 1.5px ${cor}, 0 0 0 4px color-mix(in oklab, ${cor} 14%, transparent), 0 0 18px color-mix(in oklab, ${cor} 28%, transparent)`

// ── rótulos ──────────────────────────────────────────────────────────────

function Etiqueta({ children, cor = v("tinta-2") }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: v("tinta-2") }}>
      <span className="size-1.5" style={{ background: cor }} />
      {children}
    </span>
  )
}

function Status({ rotulo, tom }: { rotulo: string; tom: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-[7px] px-2.5 text-[12.5px]" style={{ background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` }}>
      <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${tom}-dot)` }} />
      {rotulo}
    </span>
  )
}

function Avatar({ iniciais, tom, tamanho = 32 }: { iniciais: string; tom?: string; tamanho?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-mono ring-1 ring-[var(--ds-fio)]"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.33, ...(tom ? { background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` } : { background: v("placa-2"), color: v("tinta") }) }}
    >
      {iniciais}
    </span>
  )
}

// ── botão ────────────────────────────────────────────────────────────────

type Variante = "solido" | "padrao" | "fantasma" | "perigo"
const ALTURA = { sm: 32, md: 40, lg: 48 }

function Botao({
  children,
  variante = "padrao",
  tamanho = "md",
  icone = false,
  carregando = false,
  desligado = false,
  onClick,
}: {
  children: React.ReactNode
  variante?: Variante
  tamanho?: keyof typeof ALTURA
  icone?: boolean
  carregando?: boolean
  desligado?: boolean
  onClick?: () => void
}) {
  const h = ALTURA[tamanho]
  const estilo: Record<Variante, React.CSSProperties> = {
    solido: { background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" },
    padrao: { background: v("placa-forte"), color: v("tinta-forte"), boxShadow: `inset 0 0 0 1px ${v("fio-forte")}` },
    fantasma: { background: "transparent", color: v("tinta-forte") },
    perigo: { background: "var(--tone-red)", color: "var(--tone-red-foreground)", boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--tone-red-dot) 35%, transparent)" },
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={desligado || carregando}
      whileHover={desligado ? undefined : { y: -1 }}
      whileTap={desligado ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: CURVA }}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap ${variante === "fantasma" ? "hover:bg-[var(--ds-trilho)]" : ""}`}
      style={{
        height: h,
        width: icone ? h : undefined,
        paddingInline: icone ? 0 : h * 0.4,
        borderRadius: h / 4,
        fontSize: tamanho === "sm" ? 13 : tamanho === "lg" ? 15 : 14,
        opacity: desligado ? 0.4 : 1,
        cursor: desligado ? "not-allowed" : "pointer",
        ...estilo[variante],
      }}
    >
      {/* carregando: o texto sai desfocado e o giro entra; quando termina, a volta é pelo mesmo caminho */}
      <AnimatePresence mode="popLayout" initial={false}>
        {carregando ? (
          <motion.span key="giro" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={CHEGADA} className="flex items-center gap-2">
            <motion.span className="block size-4 rounded-full" style={{ border: "2px solid currentColor", borderTopColor: "transparent" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: "linear", repeat: Infinity }} />
            {icone ? null : "Salvando"}
          </motion.span>
        ) : (
          <motion.span key="texto" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={CHEGADA} className="flex items-center gap-2">
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── campo ────────────────────────────────────────────────────────────────

function Campo({
  rotulo,
  placeholder,
  valorInicial = "",
  erro,
  desligado = false,
  prefixo,
  busca = false,
  dica,
}: {
  rotulo: string
  placeholder?: string
  valorInicial?: string
  erro?: string
  desligado?: boolean
  prefixo?: string
  busca?: boolean
  dica?: string
}) {
  const [foco, setFoco] = React.useState(false)
  const [valor, setValor] = React.useState(valorInicial)
  const cor = erro ? "var(--destructive)" : "var(--primary)"
  return (
    <label className="flex flex-col gap-2" style={{ opacity: desligado ? 0.45 : 1 }}>
      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: erro ? "var(--destructive)" : v("tinta-2") }}>
        {rotulo}
      </span>
      <span
        className="flex h-10 items-center gap-2 rounded-[10px] px-3.5 transition-[box-shadow] duration-300"
        style={{ background: v("placa-forte"), boxShadow: foco ? halo(cor) : `inset 0 0 0 1px ${erro ? "var(--destructive)" : v("fio-forte")}` }}
      >
        {busca ? <MagnifyingGlass size={16} style={{ color: v("tinta-2") }} /> : null}
        {prefixo ? (
          <span className="font-mono text-[12.5px]" style={{ color: v("tinta-2") }}>
            {prefixo}
          </span>
        ) : null}
        <input
          value={valor}
          disabled={desligado}
          onChange={(e) => setValor(e.target.value)}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-[var(--ds-tinta-2)]"
          style={{ color: v("tinta-forte"), cursor: desligado ? "not-allowed" : undefined }}
        />
        <AnimatePresence>
          {valor && !desligado && busca ? (
            <motion.button type="button" {...ABRE} onClick={() => setValor("")} aria-label="Limpar" className="grid size-6 place-items-center rounded-full" style={{ background: v("trilho"), color: v("tinta-2") }}>
              <X size={12} />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </span>
      <AnimatePresence mode="wait">
        {erro || dica ? (
          <motion.span key={erro ?? dica} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="text-[12.5px]" style={{ color: erro ? "var(--destructive)" : v("tinta-2") }}>
            {erro ?? dica}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
}

// ── seleção ──────────────────────────────────────────────────────────────

/** O check entra desfocado e assenta; o quadrado acende de leve. */
function Checkbox({ rotulo, inicial = false, desligado = false }: { rotulo: string; inicial?: boolean; desligado?: boolean }) {
  const [on, setOn] = React.useState(inicial)
  return (
    <button type="button" role="checkbox" aria-checked={on} disabled={desligado} onClick={() => setOn(!on)} className="flex h-10 items-center gap-3 text-[14.5px]" style={{ color: v("tinta-forte"), opacity: desligado ? 0.4 : 1 }}>
      <span className="grid size-5 place-items-center rounded-[6px] transition-[background-color,box-shadow] duration-300" style={{ background: on ? "var(--primary)" : v("placa-forte"), boxShadow: on ? "0 0 0 1px var(--primary)" : `inset 0 0 0 1.5px ${v("fio-forte")}`, color: "var(--primary-foreground)" }}>
        <AnimatePresence>
          {on ? (
            <motion.span initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.3, ease: CURVA }}>
              <Check size={13} weight="bold" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      {rotulo}
    </button>
  )
}

function Radio<T extends string>({ opcoes, inicial }: { opcoes: { v: T; rotulo: string }[]; inicial: T }) {
  const [valor, setValor] = React.useState(inicial)
  return (
    <div role="radiogroup" className="flex flex-col">
      {opcoes.map((o) => {
        const on = o.v === valor
        return (
          <button key={o.v} type="button" role="radio" aria-checked={on} onClick={() => setValor(o.v)} className="flex h-10 items-center gap-3 text-[14.5px]" style={{ color: v("tinta-forte") }}>
            <span className="relative grid size-5 place-items-center rounded-full transition-[box-shadow] duration-300" style={{ background: v("placa-forte"), boxShadow: `inset 0 0 0 ${on ? "1.5px var(--primary)" : `1.5px ${v("fio-forte")}`}` }}>
              {on ? <motion.span layoutId="radio" className="size-2.5 rounded-full" style={{ background: "var(--primary)" }} transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} /> : null}
            </span>
            {o.rotulo}
          </button>
        )
      })}
    </div>
  )
}

/** O switch: trilho de 24px, o polegar desliza com mola. */
function Switch({ rotulo, inicial = false }: { rotulo: string; inicial?: boolean }) {
  const [on, setOn] = React.useState(inicial)
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)} className="flex h-10 items-center gap-3 text-[14.5px]" style={{ color: v("tinta-forte") }}>
      <span className="flex h-6 w-11 items-center rounded-full p-[3px] transition-[background-color] duration-300" style={{ background: on ? "var(--primary)" : v("trilho-forte"), justifyContent: on ? "flex-end" : "flex-start", boxShadow: on ? "0 4px 14px -4px color-mix(in oklab, var(--primary) 60%, transparent)" : `inset 0 0 0 1px ${v("fio")}` }}>
        <motion.span layout transition={{ type: "spring", bounce: 0.25, duration: 0.4 }} className="size-[18px] rounded-full" style={{ background: "oklch(0.995 0.003 85)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.25)" }} />
      </span>
      {rotulo}
    </button>
  )
}

/** A escolha entre poucas opções: pílula que desliza; o rótulo novo chega desfocado. */
function Escolha<T extends string>({ id, opcoes, inicial, tamanho = 40, onChange }: { id: string; opcoes: { v: T; rotulo: string; tom?: string }[]; inicial: T; tamanho?: number; onChange?: (v: T) => void }) {
  const [valor, setValorInterno] = React.useState(inicial)
  const setValor = (n: T) => {
    setValorInterno(n)
    onChange?.(n)
  }
  return (
    <div className="flex items-center rounded-[10px] p-1" style={{ height: tamanho, background: v("trilho"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
      {opcoes.map((o) => {
        const ativo = o.v === valor
        return (
          <button key={o.v} type="button" onClick={() => setValor(o.v)} className="relative flex h-full flex-1 items-center justify-center gap-2 px-3.5 text-[13.5px] whitespace-nowrap" style={{ color: ativo ? (o.tom ? `var(--tone-${o.tom}-foreground)` : v("tinta-forte")) : v("tinta-2") }}>
            {ativo ? <motion.span layoutId={`escolha-${id}`} className="absolute inset-0 rounded-[7px]" style={{ background: o.tom ? `var(--tone-${o.tom})` : v("placa-forte"), boxShadow: `0 2px 8px -2px ${v("sombra")}, inset 0 0 0 1px ${v("fio")}` }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} /> : null}
            <motion.span key={ativo ? "a" : "i"} initial={ativo ? { opacity: 0.2, filter: "blur(8px)" } : false} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="relative flex items-center gap-2">
              {o.tom ? <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${o.tom}-dot)` }} /> : null}
              {o.rotulo}
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}

// ── select ───────────────────────────────────────────────────────────────

function Select({ rotulo, opcoes, inicial }: { rotulo: string; opcoes: { v: string; rotulo: string; tom?: string }[]; inicial: string }) {
  const [aberto, setAberto] = React.useState(false)
  const [valor, setValor] = React.useState(inicial)
  const atual = opcoes.find((o) => o.v === valor)!
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAberto(false)
    document.addEventListener("mousedown", fora)
    return () => document.removeEventListener("mousedown", fora)
  }, [aberto])
  return (
    <div ref={ref} className="relative flex flex-col gap-2">
      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: v("tinta-2") }}>
        {rotulo}
      </span>
      <button type="button" onClick={() => setAberto(!aberto)} className="flex h-10 items-center justify-between gap-2 rounded-[10px] px-3.5 text-[14.5px] transition-[box-shadow] duration-300" style={{ background: v("placa-forte"), color: v("tinta-forte"), boxShadow: aberto ? halo() : `inset 0 0 0 1px ${v("fio-forte")}` }}>
        <AnimatePresence mode="wait">
          <motion.span key={valor} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="flex items-center gap-2">
            {atual.tom ? <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${atual.tom}-dot)` }} /> : null}
            {atual.rotulo}
          </motion.span>
        </AnimatePresence>
        <motion.span animate={{ rotate: aberto ? 180 : 0 }} transition={{ duration: 0.3, ease: CURVA }} style={{ color: v("tinta-2") }}>
          <CaretDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence>
        {aberto ? (
          <motion.div
            {...ABRE}
            data-aberto
            className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 flex flex-col gap-0.5 rounded-[12px] p-1.5"
            // opaco: a lista fica por cima de texto, e o que passava atrás atrapalhava ler as opções
            style={{ background: v("placa-solida"), boxShadow: `inset 0 0 0 1px ${v("fio")}, 0 24px 50px -20px ${v("sombra")}` }}
          >
            {opcoes.map((o, i) => (
              <motion.button
                key={o.v}
                type="button"
                initial={{ opacity: 0, filter: "blur(6px)", x: -4 }}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                transition={{ duration: 0.35, ease: CURVA, delay: 0.03 * i }}
                onClick={() => {
                  setValor(o.v)
                  setAberto(false)
                }}
                className="flex h-9 items-center justify-between gap-2 rounded-[8px] px-2.5 text-left text-[14px] hover:bg-[var(--ds-trilho)]"
                style={{ color: v("tinta-forte") }}
              >
                <span className="flex items-center gap-2">
                  {o.tom ? <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${o.tom}-dot)` }} /> : null}
                  {o.rotulo}
                </span>
                {o.v === valor ? <Check size={14} style={{ color: "var(--primary)" }} /> : null}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// ── abas ─────────────────────────────────────────────────────────────────

function Abas() {
  const abas = ["Visão geral", "Atividade", "Arquivos"]
  const [ativa, setAtiva] = React.useState(abas[0])
  const textos: Record<string, string> = {
    "Visão geral": "18 tarefas, 3 bloqueadas. O fluxo de cobrança é o que mais segura o projeto esta semana.",
    Atividade: "Marina moveu MUR-3 para Bloqueada há 2 h. Rafael comentou em MUR-1 há 20 min.",
    Arquivos: "3 arquivos: o contrato do Stripe, a planilha de planos e o print da fatura duplicada.",
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1" style={{ boxShadow: `inset 0 -1px 0 ${v("fio")}` }}>
        {abas.map((a) => {
          const on = a === ativa
          return (
            <button key={a} type="button" onClick={() => setAtiva(a)} className="relative flex h-10 items-center px-3 text-[14px]" style={{ color: on ? v("tinta-forte") : v("tinta-2") }}>
              <motion.span key={on ? "a" : "i"} initial={on ? { opacity: 0.2, filter: "blur(8px)" } : false} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA}>
                {a}
              </motion.span>
              {on ? <motion.span layoutId="aba" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 10px color-mix(in oklab, var(--primary) 60%, transparent)" }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} /> : null}
            </button>
          )
        })}
      </div>
      <div className="min-h-[48px]">
        <AnimatePresence mode="wait">
          <motion.p key={ativa} {...troca} className="text-[14.5px] leading-relaxed" style={{ color: v("tinta") }}>
            {textos[ativa]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── progresso, skeleton, tooltip, aviso ──────────────────────────────────

function Progresso({ valor, tom = "blue", rotulo }: { valor: number; tom?: string; rotulo: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Etiqueta cor={`var(--tone-${tom}-dot)`}>{rotulo}</Etiqueta>
        <span className="font-mono text-[12px] tabular-nums" style={{ color: v("tinta") }}>
          {Math.round(valor * 100)}%
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full" style={{ background: v("trilho-forte") }}>
        <motion.div className="absolute inset-y-0 left-0 rounded-full" initial={{ width: 0 }} whileInView={{ width: `${valor * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.1, ease: CURVA }} style={{ background: `var(--tone-${tom}-dot)` }} />
      </div>
    </div>
  )
}

function Osso({ className = "", azul = false, style }: { className?: string; azul?: boolean; style?: React.CSSProperties }) {
  return (
    <span className={`relative block overflow-hidden rounded-[6px] ${className}`} style={{ background: azul ? v("osso-azul") : v("osso"), filter: "blur(1.5px)", ...style }}>
      <motion.span aria-hidden className="absolute inset-y-0 w-1/2" style={{ background: `linear-gradient(90deg, transparent, ${v("osso-brilho")}, transparent)` }} initial={{ x: "-100%" }} animate={{ x: "300%" }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }} />
    </span>
  )
}

function Tooltip({ texto, children }: { texto: string; children: React.ReactNode }) {
  const [on, setOn] = React.useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)} onFocus={() => setOn(true)} onBlur={() => setOn(false)}>
      {children}
      <AnimatePresence>
        {on ? (
          <motion.span
            initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: 4 }}
            transition={{ duration: 0.28, ease: CURVA }}
            className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 -ml-[60px] w-[120px] rounded-[8px] px-2.5 py-1.5 text-center text-[12.5px]"
            style={{ background: v("tinta-forte"), color: v("chao") }}
          >
            {texto}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}

function useAviso() {
  const [texto, setTexto] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!texto) return
    const t = setTimeout(() => setTexto(null), 2600)
    return () => clearTimeout(t)
  }, [texto])
  const aviso = (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
      <AnimatePresence>
        {texto ? (
          <motion.div key={texto} initial={{ opacity: 0, y: 16, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 8, filter: "blur(12px)" }} transition={{ duration: 0.45, ease: CURVA }} className="pointer-events-auto flex items-center gap-3 rounded-[12px] px-4 py-3 text-[14px]" style={{ background: v("placa-forte"), color: v("tinta-forte"), backdropFilter: "blur(30px)", boxShadow: `inset 0 0 0 1px ${v("fio")}, 0 24px 50px -20px ${v("sombra")}` }}>
            <span className="grid size-6 place-items-center rounded-full" style={{ background: "var(--tone-green)", color: "var(--tone-green-foreground)" }}>
              <Check size={13} weight="bold" />
            </span>
            {texto}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
  return [aviso, setTexto] as const
}

// ── stepper ──────────────────────────────────────────────────────────────

const PASSOS = [
  { t: "Conta", d: "Seu nome e como o time te chama." },
  { t: "Time", d: "Convide quem trabalha com você. Dá para fazer depois." },
  { t: "Plano", d: "Starter de graça, ou Pro com 14 dias de teste." },
  { t: "Pronto", d: "O primeiro quadro já está montado com 3 tarefas de exemplo." },
]

/** Os passos em linha: o trilho enche da esquerda para a direita, como a
    faixa; o número vira check desfocando; o conteúdo troca pelo desfoque. */
function Stepper() {
  const [passo, setPasso] = React.useState(1)
  const ultimo = PASSOS.length - 1
  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex justify-between">
        <div className="absolute top-4 right-4 left-4 h-0.5 rounded-full" style={{ background: v("trilho-forte") }} />
        <motion.div className="absolute top-4 left-4 h-0.5 rounded-full" animate={{ width: `calc((100% - 32px) * ${passo / ultimo})` }} transition={{ duration: 0.6, ease: CURVA }} style={{ background: "var(--primary)", boxShadow: "0 0 10px color-mix(in oklab, var(--primary) 50%, transparent)" }} />
        {PASSOS.map((p, i) => {
          const feito = i < passo
          const atual = i === passo
          return (
            <button key={p.t} type="button" onClick={() => setPasso(i)} className="relative flex flex-col items-center gap-2">
              <span
                className="grid size-8 place-items-center rounded-full font-mono text-[12px] transition-[background-color,box-shadow,color] duration-300"
                style={{
                  background: feito || atual ? "var(--primary)" : v("placa-forte"),
                  color: feito || atual ? "var(--primary-foreground)" : v("tinta-2"),
                  boxShadow: atual ? halo() : feito ? "none" : `inset 0 0 0 1.5px ${v("fio-forte")}`,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={feito ? "check" : "n"} initial={{ opacity: 0, filter: "blur(6px)", scale: 0.7 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(6px)", scale: 0.7 }} transition={{ duration: 0.3, ease: CURVA }}>
                    {feito ? <Check size={14} weight="bold" /> : i + 1}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: atual ? v("tinta-forte") : v("tinta-2") }}>
                {p.t}
              </span>
            </button>
          )
        })}
      </div>
      <div className="min-h-[56px]">
        <AnimatePresence mode="wait">
          <motion.div key={passo} {...troca} className="flex flex-col gap-1">
            <span className="text-[20px] font-light tracking-[-0.01em]" style={{ color: v("tinta-forte") }}>
              {PASSOS[passo].t}
            </span>
            <span className="text-[14px]" style={{ color: v("tinta-2") }}>
              {PASSOS[passo].d}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between">
        <Botao variante="fantasma" desligado={passo === 0} onClick={() => setPasso(Math.max(0, passo - 1))}>
          Voltar
        </Botao>
        <Botao variante="solido" onClick={() => setPasso(Math.min(ultimo, passo + 1))}>
          {passo === ultimo ? "Abrir o quadro" : "Continuar"} <ArrowRight size={16} />
        </Botao>
      </div>
    </div>
  )
}

// ── listbox ──────────────────────────────────────────────────────────────

const PESSOAS = [
  { i: "GT", n: "Guilherme T.", e: "guilherme@muriki.com", tom: "blue" },
  { i: "AM", n: "Ana Moura", e: "ana@muriki.com", tom: "green" },
  { i: "RS", n: "Rafael Silva", e: "rafael@muriki.com", tom: "orange" },
  { i: "LP", n: "Lúcia Prado", e: "lucia@muriki.com", tom: "purple" },
  { i: "CR", n: "Camila Rocha", e: "camila@muriki.com", tom: "pink" },
  { i: "TA", n: "Tiago Albuquerque", e: "tiago@muriki.com", tom: "yellow" },
]

/** A lista para escolher vários: busca em cima, os itens que saem do filtro
    desfocam e os que ficam deslizam para o lugar. */
function Listbox() {
  const [busca, setBusca] = React.useState("")
  const [marcados, setMarcados] = React.useState<Set<string>>(new Set(["GT", "RS"]))
  const [foco, setFoco] = React.useState(false)
  const vis = PESSOAS.filter((p) => (p.n + p.e).toLowerCase().includes(busca.toLowerCase()))
  return (
    <div className="flex flex-col overflow-hidden rounded-[12px]" style={{ background: v("placa-forte"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
      <div className="flex h-11 items-center gap-2 px-3.5 transition-[box-shadow] duration-300" style={{ boxShadow: foco ? `inset 0 -1.5px 0 var(--primary)` : `inset 0 -1px 0 ${v("fio")}` }}>
        <MagnifyingGlass size={16} style={{ color: v("tinta-2") }} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)} placeholder="Buscar pessoa" className="h-full flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-[var(--ds-tinta-2)]" style={{ color: v("tinta-forte") }} />
        <AnimatePresence mode="wait">
          <motion.span key={marcados.size} initial={{ opacity: 0.2, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: "var(--primary)" }}>
            {marcados.size} escolhidos
          </motion.span>
        </AnimatePresence>
      </div>
      <div role="listbox" aria-multiselectable className="flex h-[264px] flex-col p-1.5">
        <AnimatePresence initial={false}>
          {vis.map((p) => {
            const on = marcados.has(p.i)
            return (
              <motion.button
                layout
                key={p.i}
                role="option"
                aria-selected={on}
                type="button"
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: CURVA }}
                onClick={() =>
                  setMarcados((m) => {
                    const n = new Set(m)
                    if (n.has(p.i)) n.delete(p.i)
                    else n.add(p.i)
                    return n
                  })
                }
                className="flex h-11 shrink-0 items-center gap-3 rounded-[8px] px-2.5 text-left transition-colors"
                style={{ background: on ? "color-mix(in oklab, var(--primary) 9%, transparent)" : undefined }}
              >
                <Avatar iniciais={p.i} tom={p.tom} tamanho={28} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px]" style={{ color: v("tinta-forte") }}>
                    {p.n}
                  </span>
                  <span className="truncate text-[12px]" style={{ color: v("tinta-2") }}>
                    {p.e}
                  </span>
                </span>
                <AnimatePresence>
                  {on ? (
                    <motion.span initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.3, ease: CURVA }} style={{ color: "var(--primary)" }}>
                      <Check size={16} weight="bold" />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </AnimatePresence>
        {vis.length === 0 ? (
          <motion.span initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="m-auto text-[13.5px]" style={{ color: v("tinta-2") }}>
            Ninguém com “{busca}” no time.
          </motion.span>
        ) : null}
      </div>
    </div>
  )
}

// ── tabela (a do Platform) ───────────────────────────────────────────────

type StatusT = "aberta" | "fazendo" | "bloqueada" | "feita"
const ST: Record<StatusT, { r: string; tom: string; ordem: number }> = {
  bloqueada: { r: "Bloqueada", tom: "red", ordem: 0 },
  fazendo: { r: "Fazendo", tom: "blue", ordem: 1 },
  aberta: { r: "Aberta", tom: "green", ordem: 2 },
  feita: { r: "Feita", tom: "gray", ordem: 3 },
}
const PR = { urgente: { r: "Urgente", tom: "red", o: 0 }, alta: { r: "Alta", tom: "orange", o: 1 }, media: { r: "Média", tom: "blue", o: 2 }, baixa: { r: "Baixa", tom: "gray", o: 3 } }
interface Linha {
  id: string
  cod: string
  titulo: string
  status: StatusT
  prio: keyof typeof PR
  dono: (typeof PESSOAS)[number]
  prazo: number
}
const GRUPOS_T: { id: string; titulo: string; linhas: Linha[] }[] = [
  {
    id: "cob",
    titulo: "Cobrança recorrente",
    linhas: [
      ["MUR-1", "Revisar o fluxo de cobrança", "fazendo", "urgente", 0, 10],
      ["MUR-2", "Migrar webhooks do Stripe", "aberta", "alta", 1, 11],
      ["MUR-3", "Cobrança duplicada na troca de plano", "bloqueada", "urgente", 2, 9],
      ["MUR-4", "Fatura em PDF com a marca", "feita", "media", 3, 7],
      ["MUR-5", "Aviso de cartão vencendo", "aberta", "baixa", 4, 18],
    ].map(([cod, titulo, status, prio, d, prazo]) => ({ id: cod as string, cod: cod as string, titulo: titulo as string, status: status as StatusT, prio: prio as keyof typeof PR, dono: PESSOAS[d as number], prazo: prazo as number })),
  },
  {
    id: "mem",
    titulo: "Membros e convites",
    linhas: [
      ["MUR-11", "Convite expira em 7 dias", "fazendo", "media", 5, 14],
      ["MUR-12", "Carência de quem passa do limite", "bloqueada", "alta", 1, 12],
      ["MUR-13", "Trocar o dono do workspace", "aberta", "baixa", 0, 21],
    ].map(([cod, titulo, status, prio, d, prazo]) => ({ id: cod as string, cod: cod as string, titulo: titulo as string, status: status as StatusT, prio: prio as keyof typeof PR, dono: PESSOAS[d as number], prazo: prazo as number })),
  },
]
type Coluna = "titulo" | "status" | "prio" | "prazo"
const COLS = "grid-cols-[40px_80px_minmax(0,1fr)_132px_110px_44px_76px_76px]"

/** A tabela de tarefas do Platform nesta linguagem. Parada, ela é calma e
    nítida; tudo que muda passa pelo desfoque: ordenar (as linhas deslizam
    para o lugar novo), filtrar (as que saem desfocam), abrir e fechar o
    grupo, a barra de ações em lote, as ações da linha no hover. */
function Tabela() {
  const [ordem, setOrdem] = React.useState<{ col: Coluna; desc: boolean }>({ col: "status", desc: false })
  const [filtro, setFiltro] = React.useState<"todas" | StatusT>("todas")
  const [marcadas, setMarcadas] = React.useState<Set<string>>(new Set())
  const [fechados, setFechados] = React.useState<Set<string>>(new Set())
  const [aviso, avisar] = useAviso()

  const ordenar = (ls: Linha[]) => {
    const k = (l: Linha) => (ordem.col === "titulo" ? l.titulo : ordem.col === "status" ? ST[l.status].ordem : ordem.col === "prio" ? PR[l.prio].o : l.prazo)
    const r = [...ls].sort((a, b) => (k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0))
    return ordem.desc ? r.reverse() : r
  }
  const todas = GRUPOS_T.flatMap((g) => g.linhas).filter((l) => filtro === "todas" || l.status === filtro)
  const tudoMarcado = todas.length > 0 && todas.every((l) => marcadas.has(l.id))
  const algumMarcado = todas.some((l) => marcadas.has(l.id))
  const alternar = (id: string) =>
    setMarcadas((m) => {
      const n = new Set(m)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const Cab = ({ col, children, direita = false }: { col: Coluna; children: React.ReactNode; direita?: boolean }) => {
    const on = ordem.col === col
    return (
      <button type="button" onClick={() => setOrdem({ col, desc: on ? !ordem.desc : false })} className={`group flex items-center gap-1.5 ${direita ? "justify-end" : ""}`} style={{ color: on ? v("tinta-forte") : v("tinta-2") }}>
        {children}
        <motion.span animate={{ rotate: on && ordem.desc ? 180 : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.3, ease: CURVA }} className="group-hover:opacity-60!" style={{ color: on ? "var(--primary)" : undefined }}>
          <ArrowDown size={12} weight="bold" />
        </motion.span>
      </button>
    )
  }

  const caixa = (on: boolean, meio = false, onClick?: () => void, rotulo = "Selecionar") => (
    <button type="button" role="checkbox" aria-checked={meio ? "mixed" : on} aria-label={rotulo} onClick={(e) => (e.stopPropagation(), onClick?.())} className="grid size-[18px] place-items-center rounded-[5px] transition-[background-color,box-shadow] duration-300" style={{ background: on || meio ? "var(--primary)" : v("placa-forte"), boxShadow: on || meio ? "0 0 0 1px var(--primary)" : `inset 0 0 0 1.5px ${v("fio-forte")}`, color: "var(--primary-foreground)" }}>
      <AnimatePresence mode="wait">
        {on || meio ? (
          <motion.span key={meio ? "m" : "c"} initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.25, ease: CURVA }}>
            {meio ? <Minus size={12} weight="bold" /> : <Check size={12} weight="bold" />}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Escolha
          id="filtro"
          inicial="todas"
          tamanho={36}
          onChange={setFiltro}
          opcoes={[
            { v: "todas", rotulo: "Todas" },
            { v: "bloqueada", rotulo: "Bloqueadas", tom: "red" },
            { v: "fazendo", rotulo: "Fazendo", tom: "blue" },
            { v: "aberta", rotulo: "Abertas", tom: "green" },
          ]}
        />
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: v("tinta-2") }}>
          Clique no cabeçalho para ordenar
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[12px]" style={{ background: v("placa-2"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
        {/* cabeçalho; vira a barra de ações em lote quando há linhas marcadas */}
        <div className="relative h-11" style={{ boxShadow: `inset 0 -1px 0 ${v("fio")}` }}>
          <AnimatePresence mode="wait" initial={false}>
            {algumMarcado ? (
              <motion.div key="lote" {...ABRE} className={`absolute inset-0 grid items-center gap-3 px-3 ${COLS}`} style={{ background: "color-mix(in oklab, var(--primary) 9%, transparent)" }}>
                <span className="grid place-items-center">{caixa(tudoMarcado, !tudoMarcado, () => setMarcadas(tudoMarcado ? new Set() : new Set(todas.map((l) => l.id))), "Selecionar todas")}</span>
                <span className="col-span-7 flex items-center gap-2">
                  <span className="mr-2 font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: "var(--primary)" }}>
                    {[...marcadas].filter((id) => todas.some((l) => l.id === id)).length} marcadas
                  </span>
                  <Botao tamanho="sm" onClick={() => (avisar("Movidas para Fazendo"), setMarcadas(new Set()))}>Mover para Fazendo</Botao>
                  <Botao tamanho="sm" onClick={() => avisar("Responsável trocado")}>Trocar responsável</Botao>
                  <Botao tamanho="sm" variante="perigo" onClick={() => (avisar("Tarefas arquivadas"), setMarcadas(new Set()))}>
                    <Trash size={14} /> Arquivar
                  </Botao>
                  <span className="flex-1" />
                  <Botao tamanho="sm" variante="fantasma" onClick={() => setMarcadas(new Set())}>
                    Limpar
                  </Botao>
                </span>
              </motion.div>
            ) : (
              <motion.div key="cab" {...ABRE} className={`absolute inset-0 grid items-center gap-3 px-3 font-mono text-[10.5px] tracking-[0.1em] uppercase ${COLS}`}>
                <span className="grid place-items-center">{caixa(false, false, () => setMarcadas(new Set(todas.map((l) => l.id))), "Selecionar todas")}</span>
                <span style={{ color: v("tinta-2") }}>Código</span>
                <Cab col="titulo">Tarefa</Cab>
                <Cab col="status">Status</Cab>
                <Cab col="prio">Prioridade</Cab>
                <span />
                <Cab col="prazo" direita>
                  Prazo
                </Cab>
                <span />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={filtro} {...troca}>
            {GRUPOS_T.map((g) => {
              const ls = ordenar(g.linhas.filter((l) => filtro === "todas" || l.status === filtro))
              if (!ls.length) return null
              const aberto = !fechados.has(g.id)
              return (
                <div key={g.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setFechados((f) => {
                        const n = new Set(f)
                        if (n.has(g.id)) n.delete(g.id)
                        else n.add(g.id)
                        return n
                      })
                    }
                    className="flex h-11 w-full items-center gap-3 px-4 text-left"
                    style={{ background: v("trilho"), boxShadow: `inset 0 -1px 0 ${v("fio")}` }}
                  >
                    <motion.span animate={{ rotate: aberto ? 90 : 0 }} transition={{ duration: 0.3, ease: CURVA }} style={{ color: v("tinta-2") }}>
                      <CaretRight size={13} />
                    </motion.span>
                    <Etiqueta cor="var(--primary)">{g.titulo}</Etiqueta>
                    <span className="font-mono text-[11px]" style={{ color: v("tinta-2") }}>
                      {ls.length}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {aberto ? (
                      <motion.div key="corpo" initial={{ height: 0, opacity: 0, filter: "blur(8px)" }} animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }} exit={{ height: 0, opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.4, ease: CURVA }} className="overflow-hidden">
                        {ls.map((l) => {
                          const on = marcadas.has(l.id)
                          const feita = l.status === "feita"
                          return (
                            <motion.div
                              layout
                              key={l.id}
                              transition={{ layout: { duration: 0.5, ease: CURVA } }}
                              onClick={() => alternar(l.id)}
                              className={`group relative grid h-[52px] cursor-pointer items-center gap-3 px-3 transition-colors duration-200 hover:bg-[var(--ds-trilho)] ${COLS}`}
                              style={{ boxShadow: `inset 0 -1px 0 ${v("fio")}`, background: on ? "color-mix(in oklab, var(--primary) 8%, transparent)" : undefined }}
                            >
                              {/* o trilho de status da esquerda acende quando a linha é marcada */}
                              <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full transition-[box-shadow] duration-300" style={{ background: `var(--tone-${ST[l.status].tom}-dot)`, boxShadow: on ? `0 0 8px var(--tone-${ST[l.status].tom}-dot)` : undefined }} />
                              <span className="grid place-items-center">{caixa(on, false, () => alternar(l.id), `Selecionar ${l.cod}`)}</span>
                              <span className="font-mono text-[11.5px]" style={{ color: v("tinta-2") }}>
                                {l.cod}
                              </span>
                              <span className="truncate text-[14.5px]" style={{ color: feita ? v("tinta-2") : v("tinta-forte") }}>
                                {l.titulo}
                              </span>
                              <span>
                                <Status rotulo={ST[l.status].r} tom={ST[l.status].tom} />
                              </span>
                              <span className="flex items-center gap-2 text-[13px]" style={{ color: v("tinta") }}>
                                <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${PR[l.prio].tom}-dot)` }} />
                                {PR[l.prio].r}
                              </span>
                              <Tooltip texto={l.dono.n}>
                                <Avatar iniciais={l.dono.i} tom={l.dono.tom} tamanho={28} />
                              </Tooltip>
                              <span className="text-right font-mono text-[11.5px]" style={{ color: l.prazo < 10 && !feita ? "var(--destructive)" : v("tinta-2") }}>
                                {l.prazo} nov
                              </span>
                              {/* as ações da linha chegam desfocadas no hover */}
                              <span className="flex justify-end gap-1 opacity-0 blur-[4px] transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:blur-0">
                                <button type="button" aria-label="Editar" onClick={(e) => (e.stopPropagation(), avisar(`Editar ${l.cod}`))} className="grid size-8 place-items-center rounded-[8px] hover:bg-[var(--ds-placa-forte)]" style={{ color: v("tinta") }}>
                                  <PencilSimple size={15} />
                                </button>
                                <button type="button" aria-label="Mais" onClick={(e) => e.stopPropagation()} className="grid size-8 place-items-center rounded-[8px] hover:bg-[var(--ds-placa-forte)]" style={{ color: v("tinta") }}>
                                  <DotsThree size={18} weight="bold" />
                                </button>
                              </span>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      {aviso}
    </div>
  )
}

// ── a vitrine ────────────────────────────────────────────────────────────

function Secao({ titulo, nota, children, className = "" }: { titulo: string; nota: string; children: React.ReactNode; className?: string }) {
  return (
    // a seção com algo aberto (o select) sobe: o desfoque de fundo faz de cada seção uma camada, e a de baixo cobria a lista
    <section className={`relative flex flex-col gap-6 rounded-[14px] p-7 has-[[data-aberto]]:z-30 ${className}`} style={{ background: v("placa-1"), backdropFilter: "blur(30px) saturate(1.3)", WebkitBackdropFilter: "blur(30px) saturate(1.3)", boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
      <div className="flex flex-col gap-2">
        <Etiqueta cor="var(--primary)">{titulo}</Etiqueta>
        <p className="max-w-[60ch] text-[13.5px] leading-relaxed" style={{ color: v("tinta-2") }}>
          {nota}
        </p>
      </div>
      {children}
    </section>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: v("tinta-2") }}>
        {rotulo}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function Vitrine() {
  const [escuro, setEscuro] = React.useState(() => location.hash.includes("escuro"))
  const [carregando, setCarregando] = React.useState(false)
  const [aviso, avisar] = useAviso()
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", escuro)
  }, [escuro])

  return (
    <div className="relative min-h-dvh px-10 py-10" style={{ color: v("tinta") }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: v("chao") }}>
        <div className="absolute -inset-[10%] blur-[48px]" style={{ background: `repeating-linear-gradient(104deg, transparent 0 7vw, ${v("luz")} 7vw 12vw, transparent 12vw 19vw, ${v("madeira")} 19vw 21vw, transparent 21vw 30vw)`, opacity: 0.9 }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 80% at 70% -10%, ${v("luz-forte")}, transparent 60%)` }} />
      </div>

      <header className="mx-auto mb-8 flex max-w-[1200px] items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Etiqueta cor="var(--accent)">Linguagem das faixas · elementos</Etiqueta>
          <h1 className="text-[44px] leading-none font-light tracking-[-0.035em]" style={{ color: v("tinta-forte") }}>
            Elementos
          </h1>
        </div>
        <Escolha
          id="tema"
          inicial={escuro ? "escuro" : "claro"}
          opcoes={[
            { v: "claro", rotulo: "Claro" },
            { v: "escuro", rotulo: "Escuro" },
          ]}
          onChange={(t) => setEscuro(t === "escuro")}
        />
      </header>

      <main className="mx-auto grid max-w-[1200px] grid-cols-2 gap-5">
        <Secao className="col-span-2" titulo="Tabela" nota="A peça do Platform. Parada é calma: linhas de 52px, cabeçalho em mono, o trilho de status na esquerda. Tudo que muda passa pelo desfoque: ordenar (as linhas deslizam para o lugar novo), filtrar, abrir e fechar o grupo, a barra de ações em lote no lugar do cabeçalho e as ações da linha no hover.">
          <Tabela />
        </Secao>

        <Secao className="col-span-2" titulo="Botão" nota="Quatro jeitos e três alturas: 32 para dentro de tabela, 40 o padrão, 48 para a ação da tela. O canto é a altura ÷ 4. Sobe 1px no hover, afunda ao apertar. Carregando, o texto sai desfocado e o giro entra.">
          <Linha rotulo="Jeitos">
            <Botao variante="solido" onClick={() => avisar("Tarefa publicada")}>Publicar</Botao>
            <Botao>Salvar rascunho</Botao>
            <Botao variante="fantasma">Cancelar</Botao>
            <Botao variante="perigo">
              <Trash size={16} /> Excluir
            </Botao>
          </Linha>
          <Linha rotulo="Alturas">
            <Botao variante="solido" tamanho="sm">32</Botao>
            <Botao variante="solido">40</Botao>
            <Botao variante="solido" tamanho="lg">
              48 <ArrowRight size={16} />
            </Botao>
            <Botao icone tamanho="sm">
              <Plus size={14} />
            </Botao>
            <Botao icone>
              <Plus size={16} />
            </Botao>
            <Botao icone tamanho="lg">
              <Plus size={18} />
            </Botao>
          </Linha>
          <Linha rotulo="Estados">
            <Botao
              variante="solido"
              carregando={carregando}
              onClick={() => {
                setCarregando(true)
                setTimeout(() => {
                  setCarregando(false)
                  avisar("Salvo")
                }, 1600)
              }}
            >
              Clique para salvar
            </Botao>
            <Botao desligado>Desligado</Botao>
          </Linha>
        </Secao>

        <Secao titulo="Campo" nota="40px, rótulo em mono em cima. Em foco, anel azul com um halo desfocado em volta. O erro chega desfocado embaixo, em vermelho, e o anel vira vermelho.">
          <Campo rotulo="Título" placeholder="O que precisa ser feito" dica="Aparece no quadro e na notificação." />
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="Busca" placeholder="Buscar tarefa" busca valorInicial="cobrança" />
            <Campo rotulo="Valor" prefixo="R$" valorInicial="249,00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Campo rotulo="E-mail" valorInicial="marina@" erro="Esse e-mail não parece completo." />
            <Campo rotulo="Desligado" valorInicial="Plano Pro" desligado />
          </div>
        </Secao>

        <Secao titulo="Seleção" nota="Marcar é uma troca: o check e o ponto entram desfocados e assentam. O switch desliza com mola. Tudo com 40px de área de clique.">
          <div className="grid grid-cols-2 gap-x-6">
            <div className="flex flex-col">
              <Checkbox rotulo="Avisar o time" inicial />
              <Checkbox rotulo="Só para mim" />
              <Checkbox rotulo="Desligado" desligado />
            </div>
            <Radio
              inicial="mensal"
              opcoes={[
                { v: "mensal", rotulo: "Mensal" },
                { v: "anual", rotulo: "Anual · 2 meses grátis" },
                { v: "time", rotulo: "Por assento" },
              ]}
            />
          </div>
          <div className="flex flex-col">
            <Switch rotulo="Bloquear até a revisão" inicial />
            <Switch rotulo="Notificar por e-mail" />
          </div>
        </Secao>

        <Secao titulo="Escolha e select" nota="Poucas opções à vista: a pílula que desliza, e o rótulo novo chega desfocado. Muitas opções: o select, que abre desfocado, com os itens chegando um depois do outro.">
          <Escolha
            id="vista"
            inicial="lista"
            opcoes={[
              { v: "lista", rotulo: "Lista" },
              { v: "quadro", rotulo: "Quadro" },
              { v: "linha", rotulo: "Linha do tempo" },
            ]}
          />
          <Escolha
            id="status"
            inicial="fazendo"
            opcoes={[
              { v: "aberta", rotulo: "Aberta", tom: "green" },
              { v: "fazendo", rotulo: "Fazendo", tom: "blue" },
              { v: "bloqueada", rotulo: "Bloqueada", tom: "red" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              rotulo="Prioridade"
              inicial="media"
              opcoes={[
                { v: "urgente", rotulo: "Urgente", tom: "red" },
                { v: "alta", rotulo: "Alta", tom: "orange" },
                { v: "media", rotulo: "Média", tom: "blue" },
                { v: "baixa", rotulo: "Baixa", tom: "gray" },
              ]}
            />
            <Select
              rotulo="Projeto"
              inicial="cobranca"
              opcoes={[
                { v: "cobranca", rotulo: "Cobrança" },
                { v: "onboarding", rotulo: "Onboarding" },
                { v: "relatorios", rotulo: "Relatórios" },
                { v: "integracoes", rotulo: "Integrações" },
              ]}
            />
          </div>
        </Secao>

        <Secao titulo="Stepper" nota="Os passos em linha. O trilho enche da esquerda para a direita, como a faixa; o passo feito vira check desfocando; o atual tem o halo; o conteúdo troca pelo desfoque.">
          <Stepper />
        </Secao>

        <Secao titulo="Listbox" nota="Para escolher vários de uma lista. A busca filtra: quem sai desfoca, quem fica desliza para o lugar. O check entra desfocado, e a contagem troca pelo desfoque.">
          <Listbox />
        </Secao>

        <Secao titulo="Abas" nota="O traço azul desliza e brilha; o nome da aba nova chega desfocado, e o conteúdo troca pelo desfoque.">
          <Abas />
        </Secao>

        <Secao titulo="Rótulos" nota="Etiqueta em mono com o quadradinho da cor, para títulos de grupo e contexto. Status continua pílula com cor: é o que se acha de relance numa lista.">
          <Linha rotulo="Etiqueta">
            <Etiqueta cor="var(--primary)">Cobrança recorrente</Etiqueta>
            <Etiqueta cor="var(--accent)">18 tarefas · 3 bloqueadas</Etiqueta>
          </Linha>
          <Linha rotulo="Status">
            <Status rotulo="Aberta" tom="green" />
            <Status rotulo="Fazendo" tom="blue" />
            <Status rotulo="Bloqueada" tom="red" />
            <Status rotulo="Em atraso" tom="orange" />
            <Status rotulo="Feita" tom="gray" />
          </Linha>
          <Linha rotulo="Avatar">
            <Tooltip texto="Guilherme T.">
              <Avatar iniciais="GT" tom="blue" />
            </Tooltip>
            <Tooltip texto="Ana M.">
              <Avatar iniciais="AM" tom="green" />
            </Tooltip>
            <Tooltip texto="Rafael S.">
              <Avatar iniciais="RS" tom="orange" />
            </Tooltip>
            <Avatar iniciais="+4" />
            <span className="text-[12.5px]" style={{ color: v("tinta-2") }}>
              passe o mouse: o tooltip chega desfocado
            </span>
          </Linha>
        </Secao>

        <Secao titulo="Progresso e carregando" nota="O progresso enche da esquerda para a direita, como a faixa. O skeleton tem a cor do que vai chegar: texto neutro, e o azul só no que chega com cor.">
          <Progresso rotulo="Cobrança" valor={0.42} />
          <Progresso rotulo="Integrações" valor={0.8} tom="green" />
          <div className="flex flex-col gap-3 rounded-[12px] p-4" style={{ background: v("placa-2"), boxShadow: `inset 0 0 0 1px ${v("fio")}` }}>
            {[70, 52, 63].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <Osso azul className="size-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Osso className="h-3" />
                  <Osso className="h-2" style={{ width: `${w}%` }} />
                </div>
                <Osso azul className="h-7 w-20 rounded-[7px]" />
              </div>
            ))}
          </div>
        </Secao>
      </main>
      {aviso}
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<Vitrine />)
