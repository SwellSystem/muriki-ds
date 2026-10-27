import * as React from "react"
import { createPortal } from "react-dom"
import { createRoot } from "react-dom/client"
import { AnimatePresence, motion } from "framer-motion"
import {
  AddressBook,
  CalendarBlank,
  CaretRight,
  ChartBar,
  Check,
  CircleNotch,
  DotsThree,
  Flag,
  House,
  Kanban,
  LinkSimple,
  ListChecks,
  LockOpen,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  TreeStructure,
  Users,
  X,
} from "@phosphor-icons/react"

import { MurikiLogo } from "@/components/ui/muriki-logo"
import type { TaskTableStatus, TaskTableTask } from "@/components/blocks/task-table"

/* Estudo livre do DS novo, na linguagem que nasceu da rivio.com.br:
   camadas, atmosfera, calma, e o desfoque nas trocas. Duas telas do mesmo
   padrão — as tarefas do Platform e os clientes do Backoffice — para ver se
   as faixas deitadas servem de molde de cadastro. Não usa os componentes do
   ui/ de propósito: primeiro a forma, depois os componentes. */

const CURVA = [0.16, 1, 0.3, 1] as [number, number, number, number]
/* A troca de um item pequeno (o nome no nav, a opção escolhida): mais
   longa e suave que a CURVA, que resolve quase tudo no começo — com ela o
   desfoque de um texto curto sumia em ~60ms e ninguém via. */
const CHEGADA = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }

/* O desfoque das trocas: o que sai desfoca e sobe, o que entra chega
   desfocado e assenta. */
const troca = {
  initial: { opacity: 0, filter: "blur(14px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(14px)", y: -10 },
  transition: { duration: 0.42, ease: CURVA },
}

const placa = (fundo = "var(--ds-placa-1)") => ({
  background: fundo,
  backdropFilter: "blur(30px) saturate(1.3)",
  WebkitBackdropFilter: "blur(30px) saturate(1.3)",
  boxShadow: "inset 0 0 0 1px var(--ds-fio)",
})

/** Carregando por um instante sempre que a chave muda: abrir a tela,
    trocar de faixa, trocar de vista. Simula a ida ao servidor. */
function useCarregando(chave: string, ms = 750) {
  const [carregando, setCarregando] = React.useState(true)
  React.useEffect(() => {
    setCarregando(true)
    const t = setTimeout(() => setCarregando(false), ms)
    return () => clearTimeout(t)
  }, [chave, ms])
  return carregando
}

// ── peças ────────────────────────────────────────────────────────────────

/** A atmosfera: luz quente entrando em faixas, como sol por persiana. */
function Atmosfera() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--ds-chao)]">
      <div
        className="absolute -inset-[10%] blur-[48px]"
        style={{
          background:
            "repeating-linear-gradient(104deg, transparent 0 7vw, var(--ds-luz) 7vw 12vw, transparent 12vw 19vw, var(--ds-madeira) 19vw 21vw, transparent 21vw 30vw)",
          opacity: 0.9,
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 70% -10%, var(--ds-luz-forte), transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--ds-chao), transparent 45%)" }} />
    </div>
  )
}

function Etiqueta({ children, cor = "var(--ds-tinta-2)" }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: "var(--ds-tinta-2)" }}>
      <span className="size-1.5" style={{ background: cor }} />
      {children}
    </span>
  )
}

function Selo({ rotulo, tom }: { rotulo: string; tom: string }) {
  return (
    <span
      className="inline-flex h-7 w-fit items-center gap-2 rounded-[7px] px-2.5 text-[12.5px]"
      style={{ background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${tom}-dot)` }} />
      {rotulo}
    </span>
  )
}

function Avatar({ iniciais, tom }: { iniciais: string; tom?: string }) {
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full font-mono text-[10.5px] ring-1 ring-[var(--ds-fio)]"
      style={tom ? { background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` } : { background: "var(--ds-placa-2)", color: "var(--ds-tinta)" }}
    >
      {iniciais}
    </span>
  )
}

function Caixa({ marcada, onChange }: { marcada: boolean; onChange: () => void }) {
  return (
    <button
      role="checkbox"
      aria-checked={marcada}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className="grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-colors"
      style={{
        background: marcada ? "var(--primary)" : "transparent",
        boxShadow: marcada ? "0 0 0 1px var(--primary)" : "inset 0 0 0 1.5px var(--ds-fio-forte)",
        color: "var(--primary-foreground)",
      }}
    >
      {marcada ? <Check size={12} weight="bold" /> : null}
    </button>
  )
}

function Botao({ children, solido = false, onClick }: { children: React.ReactNode; solido?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[14px] whitespace-nowrap transition-[background-color,box-shadow,transform] active:scale-[0.98]"
      style={
        solido
          ? { background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" }
          : { background: "var(--ds-placa-2)", color: "var(--ds-tinta)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }
      }
    >
      {children}
    </button>
  )
}

function Busca({ texto }: { texto: string }) {
  return (
    <div className="flex h-10 w-64 items-center gap-2 rounded-[10px] px-3.5 text-[14px] whitespace-nowrap" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)", color: "var(--ds-tinta-2)" }}>
      <MagnifyingGlass size={16} /> {texto}
    </div>
  )
}

/** A troca de vista: pílula que desliza num trilho, 40px de altura. */
function Vistas({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const opcoes = [
    { v: "lista", rotulo: "Lista", icone: <ListChecks size={16} /> },
    { v: "quadro", rotulo: "Quadro", icone: <Kanban size={16} /> },
    { v: "linha", rotulo: "Linha do tempo", icone: <CalendarBlank size={16} /> },
  ]
  return (
    <div className="flex h-10 items-center rounded-[10px] p-1" style={{ background: "var(--ds-trilho)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
      {opcoes.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className="relative flex h-8 items-center gap-2 px-3.5 text-[13.5px]" style={{ color: valor === o.v ? "var(--ds-tinta-forte)" : "var(--ds-tinta-2)" }}>
          {valor === o.v ? (
            <motion.span layoutId="vista" className="absolute inset-0 rounded-[7px]" style={{ background: "var(--ds-placa-forte)", boxShadow: "0 2px 8px -2px var(--ds-sombra), inset 0 0 0 1px var(--ds-fio)" }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
          ) : null}
          <span className="relative flex items-center gap-2">
            {o.icone}
            {o.rotulo}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── o skeleton ───────────────────────────────────────────────────────────

/** Um osso: a forma do que vai chegar, desfocada, com um brilho passando
    da esquerda para a direita — a mesma direção da faixa carregando.
    `azul` para o que chega com cor (status, avatar, andamento); o texto
    fica no papel neutro. */
function Osso({ className = "", style, azul = false }: { className?: string; style?: React.CSSProperties; azul?: boolean }) {
  return (
    <span className={`relative block overflow-hidden rounded-[6px] ${className}`} style={{ background: azul ? "var(--ds-osso-azul)" : "var(--ds-osso)", filter: "blur(1.5px)", ...style }}>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 w-1/2"
        style={{ background: "linear-gradient(90deg, transparent, var(--ds-osso-brilho), transparent)" }}
        initial={{ x: "-100%" }}
        animate={{ x: "300%" }}
        transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
      />
    </span>
  )
}

/** O esqueleto da lista: o mesmo contorno das placas e das linhas, com
    ossos no lugar do texto. Quando o conteúdo chega, ele assenta por cima
    com o desfoque da troca. */
function EsqueletoLista({ grupos = 2, linhas = 5, colunas }: { grupos?: number; linhas?: number; colunas: string }) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: grupos }, (_, g) => (
        <section key={g} className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
          <header className="flex h-12 items-center justify-between px-5">
            <Osso className="h-2.5 w-40" />
            <Osso azul className="h-1.5 w-24" />
          </header>
          {Array.from({ length: linhas }, (_, l) => (
            <div key={l} className={`grid h-[52px] items-center gap-4 px-5 ${colunas}`} style={{ borderTop: "1px solid var(--ds-fio)" }}>
              <Osso className="size-[18px]" />
              <Osso className="h-2.5 w-14" />
              <Osso className="h-3" style={{ width: `${55 + ((l * 17 + g * 11) % 35)}%` }} />
              <Osso azul className="h-7 w-24 rounded-[7px]" />
              <Osso className="h-2.5 w-14" />
              <Osso azul className="size-7 rounded-full" />
              <Osso className="ml-auto h-2.5 w-12" />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

// ── o formulário ─────────────────────────────────────────────────────────

/** Um campo: o rótulo em mono em cima, o controle, e o erro que chega
    desfocado embaixo. */
function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string | null; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ color: erro ? "var(--destructive)" : "var(--ds-tinta-2)" }}>
        {rotulo}
      </span>
      {children}
      <AnimatePresence>
        {erro ? (
          <motion.span initial={{ opacity: 0, filter: "blur(6px)", y: -4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.3, ease: CURVA }} className="text-[12.5px]" style={{ color: "var(--destructive)" }}>
            {erro}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
}

/** O campo de texto: 40px, e em foco o anel azul com um halo desfocado. */
function Entrada({ valor, onChange, placeholder, erro = false, autoFocus = false, area = false }: { valor: string; onChange: (v: string) => void; placeholder?: string; erro?: boolean; autoFocus?: boolean; area?: boolean }) {
  const comum = {
    value: valor,
    placeholder,
    autoFocus,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: `w-full rounded-[10px] px-3.5 text-[14.5px] outline-none transition-[box-shadow] duration-200 placeholder:text-[var(--ds-tinta-2)] ${area ? "min-h-[96px] resize-none py-3 leading-relaxed" : "h-10"}`,
    style: { background: "var(--ds-placa-forte)", color: "var(--ds-tinta-forte)", ["--anel" as string]: erro ? "var(--destructive)" : "var(--primary)", boxShadow: `inset 0 0 0 1px ${erro ? "var(--destructive)" : "var(--ds-fio-forte)"}` },
    onFocus: (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.boxShadow = "inset 0 0 0 1.5px var(--anel), 0 0 0 4px color-mix(in oklab, var(--anel) 14%, transparent), 0 0 18px color-mix(in oklab, var(--anel) 28%, transparent)"),
    onBlur: (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${erro ? "var(--destructive)" : "var(--ds-fio-forte)"}`),
  }
  return area ? <textarea {...comum} /> : <input {...comum} />
}

/** A escolha entre poucas opções: pílula que desliza num trilho, 40px.
    Com tom, a opção escolhida leva a cor dela. */
function Escolha<V extends string>({ id, opcoes, valor, onChange }: { id: string; opcoes: { v: V; rotulo: string; tom?: string }[]; valor: V; onChange: (v: V) => void }) {
  return (
    <div className="flex h-10 items-center rounded-[10px] p-1" style={{ background: "var(--ds-trilho)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
      {opcoes.map((o) => {
        const ativo = o.v === valor
        return (
          <button key={o.v} type="button" onClick={() => onChange(o.v)} className="relative flex h-8 flex-1 items-center justify-center gap-2 px-3 text-[13.5px] whitespace-nowrap" style={{ color: ativo ? (o.tom ? `var(--tone-${o.tom}-foreground)` : "var(--ds-tinta-forte)") : "var(--ds-tinta-2)" }}>
            {ativo ? (
              <motion.span layoutId={`escolha-${id}`} className="absolute inset-0 rounded-[7px]" style={{ background: o.tom ? `var(--tone-${o.tom})` : "var(--ds-placa-forte)", boxShadow: "0 2px 8px -2px var(--ds-sombra), inset 0 0 0 1px var(--ds-fio)" }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
            ) : null}
            {/* a opção que acaba de ser escolhida chega desfocada: a troca é sempre pelo desfoque */}
            <motion.span
              key={ativo ? "ativo" : "inativo"}
              initial={ativo ? { opacity: 0.2, filter: "blur(8px)" } : false}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={CHEGADA}
              className="relative flex items-center gap-2"
            >
              {o.tom ? <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${o.tom}-dot)` }} /> : null}
              {o.rotulo}
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}

/** Quem: os avatares em fila; o escolhido acende com o anel azul. */
function Pessoas({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {DONOS.map((d) => (
        <button key={d} type="button" onClick={() => onChange(d)} className="rounded-full transition-[box-shadow] duration-200" style={{ boxShadow: d === valor ? "0 0 0 2px var(--ds-placa-forte), 0 0 0 4px var(--primary), 0 0 16px color-mix(in oklab, var(--primary) 40%, transparent)" : undefined }} aria-pressed={d === valor}>
          <Avatar iniciais={d} tom={d === valor ? "blue" : undefined} />
        </button>
      ))}
    </div>
  )
}

/** O aviso: placa pequena que chega desfocada no canto e vai embora sozinha. */
function useAviso() {
  const [texto, setTexto] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!texto) return
    const t = setTimeout(() => setTexto(null), 2600)
    return () => clearTimeout(t)
  }, [texto])
  const aviso = (
    // centrado embaixo, num trilho que não pega clique: no canto ele caía em cima dos botões da frente
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
    <AnimatePresence>
      {texto ? (
        <motion.div
          key={texto}
          initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, filter: "blur(12px)" }}
          transition={{ duration: 0.45, ease: CURVA }}
          className="pointer-events-auto flex items-center gap-3 rounded-[12px] px-4 py-3 text-[14px]"
          style={{ ...placa("var(--ds-placa-forte)"), boxShadow: "inset 0 0 0 1px var(--ds-fio), 0 24px 50px -20px var(--ds-sombra)", color: "var(--ds-tinta-forte)" }}
        >
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

// ── as faixas deitadas ───────────────────────────────────────────────────

interface ItemFaixa {
  id: string
  nome: string
  tom: string
  /** O que a faixa fechada diz em mono, ao lado do nome. */
  resumo: string
  /** O quanto a faixa enche, de 0 a 1. */
  fracao: number
  /** O número da ponta direita. */
  valor: string
}

/** O item recolhido: faixa deitada com o número, o nome e a fração
    carregando da esquerda para a direita. Clicada, cresce até virar a área. */
function Faixa({ item, n, abrir }: { item: ItemFaixa; n: number; abrir: () => void }) {
  return (
    <motion.button
      layoutId={`faixa-${item.id}`}
      onClick={abrir}
      transition={{ duration: 0.55, ease: CURVA }}
      whileHover={{ scale: 1.005 }}
      className="relative flex h-16 shrink-0 items-center gap-5 overflow-hidden rounded-[14px] px-8 text-left"
      style={{ ...placa(), color: "var(--ds-tinta-forte)" }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(item.fracao, 0.02) * 100}%` }}
        transition={{ duration: 1.1, ease: CURVA, delay: 0.2 + n * 0.08 }}
        style={{ background: `color-mix(in oklab, var(--tone-${item.tom}) 70%, transparent)` }}
      />
      <motion.span className="relative flex flex-1 items-center gap-5" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.5, delay: 0.1 + n * 0.05 }}>
        <span className="w-6 text-[22px] font-light tabular-nums" style={{ color: "var(--ds-tinta-2)" }}>
          {n}
        </span>
        <span className="flex items-center gap-2 font-mono text-[12px] tracking-[0.14em] uppercase">
          <span className="size-1.5" style={{ background: `var(--tone-${item.tom}-dot)` }} />
          {item.nome}
        </span>
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: "var(--ds-tinta-2)" }}>
          {item.resumo}
        </span>
        <span className="ml-auto font-mono text-[12px] tabular-nums" style={{ color: "var(--ds-tinta)" }}>
          {item.valor}
        </span>
      </motion.span>
    </motion.button>
  )
}

/** A pilha: o item em foco cresce na vertical e abre o corpo; os outros
    ficam em faixas finas acima e abaixo. Faixa e área são a mesma peça
    (layoutId). Recua e desfoca quando algo abre na frente. */
function Faixas({
  itens,
  focoId,
  onFoco,
  recua,
  onFundo,
  acoes,
  corpo,
}: {
  itens: ItemFaixa[]
  focoId: string
  onFoco: (id: string) => void
  recua: boolean
  onFundo: () => void
  acoes: React.ReactNode
  corpo: (item: ItemFaixa) => React.ReactNode
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
      {itens.map((item, i) =>
        item.id === focoId ? (
          <motion.main
            key={item.id}
            layoutId={`faixa-${item.id}`}
            animate={recua ? { filter: "blur(3px)", scale: 0.985, opacity: 0.7 } : { filter: "blur(0px)", scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: CURVA }}
            onClick={() => recua && onFundo()}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[14px]"
            style={placa()}
          >
            <motion.header {...troca} className="flex items-end justify-between gap-6 px-8 pt-6 pb-5">
              <div className="flex items-baseline gap-4">
                <span className="text-[22px] font-light tabular-nums" style={{ color: "var(--ds-tinta-2)" }}>
                  {i + 1}
                </span>
                <div className="flex flex-col gap-2">
                  <Etiqueta cor={`var(--tone-${item.tom}-dot)`}>
                    {item.resumo} · {item.valor}
                  </Etiqueta>
                  <h1 className="text-[38px] leading-none font-light tracking-[-0.035em]" style={{ color: "var(--ds-tinta-forte)" }}>
                    {item.nome}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">{acoes}</div>
            </motion.header>
            <div className="min-h-0 flex-1 overflow-auto px-8 pb-8">{corpo(item)}</div>
          </motion.main>
        ) : (
          <Faixa key={item.id} item={item} n={i + 1} abrir={() => onFoco(item.id)} />
        )
      )}
    </div>
  )
}

/** A camada da frente: o que foi aberto, sobre a área que recuou. */
function Frente({ children }: { children: React.ReactNode }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 40, filter: "blur(16px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 40, filter: "blur(16px)" }}
      transition={{ duration: 0.45, ease: CURVA }}
      className="muriki-scroll absolute inset-y-4 right-4 z-20 flex w-[440px] flex-col gap-6 overflow-y-auto rounded-[14px] p-7"
      style={{ ...placa("var(--ds-placa-forte)"), boxShadow: "inset 0 0 0 1px var(--ds-fio), 0 40px 80px -30px var(--ds-sombra)" }}
    >
      {children}
    </motion.aside>
  )
}

function CabecalhoFrente({ etiqueta, tom, titulo, fechar }: { etiqueta: string; tom: string; titulo: string; fechar: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Etiqueta cor={`var(--tone-${tom}-dot)`}>{etiqueta}</Etiqueta>
        <button onClick={fechar} className="grid size-9 place-items-center rounded-[9px]" style={{ background: "var(--ds-trilho)", color: "var(--ds-tinta)" }} aria-label="Fechar">
          <X size={16} />
        </button>
      </div>
      <h2 className="text-[28px] leading-[1.15] font-light tracking-[-0.02em]" style={{ color: "var(--ds-tinta-forte)" }}>
        {titulo}
      </h2>
    </>
  )
}

function Ficha({ linhas }: { linhas: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[120px_1fr] items-center gap-y-4 text-[14px]">
      {linhas.map(([r, v]) => (
        <React.Fragment key={r}>
          <dt style={{ color: "var(--ds-tinta-2)" }}>{r}</dt>
          <dd className="flex items-center gap-2" style={{ color: "var(--ds-tinta-forte)" }}>
            {v}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

// ── tela 1: tarefas ──────────────────────────────────────────────────────

type Status = "aberta" | "fazendo" | "bloqueada" | "feita"
const DONOS = ["GT", "AM", "RS", "LP"]
const PRIORIDADES = ["urgente", "alta", "media", "baixa"] as const
const TOM: Record<Status, { rotulo: string; tom: string }> = {
  aberta: { rotulo: "Aberta", tom: "green" },
  fazendo: { rotulo: "Fazendo", tom: "blue" },
  bloqueada: { rotulo: "Bloqueada", tom: "red" },
  feita: { rotulo: "Feita", tom: "gray" },
}
const PRIO = { urgente: "Urgente", alta: "Alta", media: "Média", baixa: "Baixa" }
const COLS_TAREFA = "grid-cols-[18px_88px_1fr_140px_110px_60px_70px]"

const PROJETOS: ItemFaixa[] = [
  { id: "cobranca", nome: "Cobrança", tom: "blue", resumo: "18 tarefas · 3 bloqueadas", fracao: 0.42, valor: "42%" },
  { id: "onboarding", nome: "Onboarding", tom: "purple", resumo: "12 tarefas · 1 bloqueada", fracao: 0.68, valor: "68%" },
  { id: "relatorios", nome: "Relatórios", tom: "yellow", resumo: "9 tarefas · 0 bloqueadas", fracao: 0.25, valor: "25%" },
  { id: "integracoes", nome: "Integrações", tom: "green", resumo: "15 tarefas · 2 bloqueadas", fracao: 0.8, valor: "80%" },
  { id: "site", nome: "Site", tom: "orange", resumo: "7 tarefas · 0 bloqueadas", fracao: 0.12, valor: "12%" },
]

/** Nova tarefa: o formulário na camada da frente. */
function NovaTarefa({ projeto, fechar, criar }: { projeto: ItemFaixa; fechar: () => void; criar: (titulo: string) => void }) {
  const [titulo, setTitulo] = React.useState("")
  const [status, setStatus] = React.useState<Status>("aberta")
  const [prioridade, setPrioridade] = React.useState<(typeof PRIORIDADES)[number]>("media")
  const [dono, setDono] = React.useState("GT")
  const [prazo, setPrazo] = React.useState("")
  const [descricao, setDescricao] = React.useState("")
  const [tentou, setTentou] = React.useState(false)
  const erroTitulo = tentou && !titulo.trim() ? "Dê um título para a tarefa." : null
  return (
    <>
      <CabecalhoFrente etiqueta={`Nova tarefa · ${projeto.nome}`} tom={projeto.tom} titulo="O que precisa ser feito?" fechar={fechar} />
      <form
        className="flex flex-1 flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setTentou(true)
          if (titulo.trim()) criar(titulo.trim())
        }}
      >
        <Campo rotulo="Título" erro={erroTitulo}>
          <Entrada valor={titulo} onChange={setTitulo} placeholder="Ex.: revisar o fluxo de cobrança" erro={Boolean(erroTitulo)} autoFocus />
        </Campo>
        <Campo rotulo="Status">
          <Escolha id="status" valor={status} onChange={setStatus} opcoes={(["aberta", "fazendo", "bloqueada"] as Status[]).map((v) => ({ v, rotulo: TOM[v].rotulo, tom: TOM[v].tom }))} />
        </Campo>
        <Campo rotulo="Prioridade">
          <Escolha id="prioridade" valor={prioridade} onChange={setPrioridade} opcoes={PRIORIDADES.map((v) => ({ v, rotulo: PRIO[v] }))} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo rotulo="Responsável">
            <Pessoas valor={dono} onChange={setDono} />
          </Campo>
          <Campo rotulo="Prazo">
            <Entrada valor={prazo} onChange={setPrazo} placeholder="20 nov" />
          </Campo>
        </div>
        <Campo rotulo="Descrição">
          <Entrada valor={descricao} onChange={setDescricao} placeholder="O que é, e por quê" area />
        </Campo>
        <div className="mt-auto flex gap-2 pt-2">
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[14px] active:scale-[0.98]" style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" }}>
            Criar tarefa
          </button>
          <Botao onClick={fechar}>Cancelar</Botao>
        </div>
      </form>
    </>
  )
}

// ── a família de tarefas: TaskTableTask, como o Platform manda ───────────

const ST_F: Record<TaskTableStatus, { rotulo: string; tom: string }> = {
  active: { rotulo: "Aberta", tom: "green" },
  progress: { rotulo: "Fazendo", tom: "blue" },
  blocked: { rotulo: "Bloqueada", tom: "red" },
  done: { rotulo: "Feita", tom: "gray" },
}
const TOM_DONO = { a1: "blue", a2: "purple", a3: "orange", a4: "gray" } as const
const NOME_DONO: Record<string, string> = { GT: "Guilherme T.", AM: "Ana Moura", RS: "Rafael Silva", LP: "Lúcia Prado" }
const tk = (o: Partial<TaskTableTask> & Pick<TaskTableTask, "id" | "code" | "title" | "depth" | "kind" | "status">): TaskTableTask => o
const FAMILIA: TaskTableTask[] = [
  tk({ id: "e1", code: "MUR-1", title: "Cobrança recorrente", depth: 0, kind: "epic", status: "progress", childGroupId: "e1", progress: { done: 2, total: 5 }, start: "2026-11-02", end: "2026-11-24", progressRatio: 0.4 }),
  tk({ id: "t1", code: "MUR-2", title: "Revisar o fluxo de cobrança", depth: 1, kind: "task", status: "progress", parentId: "e1", childGroupId: "t1", owner: { initials: "GT", tone: "a1" }, priority: "urgent", due: "10 nov", start: "2026-11-02", end: "2026-11-10", progressRatio: 0.6, progress: { done: 1, total: 2 } }),
  tk({ id: "s1", code: "MUR-3", title: "Mapear quem é cobrado duas vezes", depth: 2, kind: "sub", status: "done", parentId: "t1", owner: { initials: "AM", tone: "a2" }, priority: "high", due: "5 nov", start: "2026-11-02", end: "2026-11-05", progressRatio: 1 }),
  tk({ id: "s2", code: "MUR-4", title: "Ajustar o cálculo proporcional", depth: 2, kind: "sub", status: "progress", parentId: "t1", lastChild: true, owner: { initials: "GT", tone: "a1" }, priority: "medium", due: "10 nov", start: "2026-11-05", end: "2026-11-10", progressRatio: 0.3, deps: ["s1"] }),
  tk({ id: "t2", code: "MUR-5", title: "Migrar webhooks do Stripe", depth: 1, kind: "task", status: "blocked", parentId: "e1", owner: { initials: "RS", tone: "a3" }, priority: "high", due: "16 nov", start: "2026-11-10", end: "2026-11-16", progressRatio: 0.1, deps: ["t1"] }),
  tk({ id: "t3", code: "MUR-6", title: "Aviso de cartão vencendo", depth: 1, kind: "task", status: "active", parentId: "e1", owner: { initials: "LP", tone: "a4" }, priority: "low", due: "20 nov", start: "2026-11-14", end: "2026-11-20", progressRatio: 0 }),
  tk({ id: "t4", code: "MUR-7", title: "Fatura em PDF com a marca", depth: 1, kind: "task", status: "done", parentId: "e1", lastChild: true, owner: { initials: "AM", tone: "a2" }, priority: "medium", due: "8 nov", start: "2026-11-03", end: "2026-11-08", progressRatio: 1 }),
  tk({ id: "e2", code: "MUR-10", title: "Membros e convites", depth: 0, kind: "epic", status: "active", childGroupId: "e2", progress: { done: 0, total: 3 }, start: "2026-11-12", end: "2026-11-28", progressRatio: 0.1 }),
  tk({ id: "t5", code: "MUR-11", title: "Convite expira em 7 dias", depth: 1, kind: "task", status: "progress", parentId: "e2", owner: { initials: "RS", tone: "a3" }, priority: "medium", due: "18 nov", start: "2026-11-12", end: "2026-11-18", progressRatio: 0.5 }),
  tk({ id: "t6", code: "MUR-12", title: "Carência de quem passa do limite", depth: 1, kind: "task", status: "blocked", parentId: "e2", owner: { initials: "GT", tone: "a1" }, priority: "high", due: "24 nov", start: "2026-11-18", end: "2026-11-24", progressRatio: 0, deps: ["t5", "t2"] }),
  tk({ id: "t7", code: "MUR-13", title: "Trocar o dono do workspace", depth: 1, kind: "task", status: "active", parentId: "e2", lastChild: true, owner: { initials: "LP", tone: "a4" }, priority: "low", due: "28 nov", start: "2026-11-22", end: "2026-11-28", progressRatio: 0 }),
]
const PRIO_F: Record<string, string> = { urgent: "Urgente", high: "Alta", medium: "Média", low: "Baixa", none: "—" }
const INICIO_MES = new Date("2026-11-01")
const DIAS_MES = 30
const HOJE_DIA = 9
const diaDe = (iso?: string) => (iso ? Math.round((new Date(iso).getTime() - INICIO_MES.getTime()) / 86400000) : 0)
const filhosDe = (id: string) => FAMILIA.filter((x) => x.parentId === id)

/** Tooltip que chega desfocado: o nome do atalho, já que o atalho é só ícone. */
function Dica({ texto, children }: { texto: string; children: React.ReactNode }) {
  // num portal no body: dentro da linha (que corta o que passa da borda) a dica saía pela metade
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  return (
    <span
      className="inline-flex"
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({ x: r.left + r.width / 2, y: r.top })
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {pos ? (
            <motion.span initial={{ opacity: 0, filter: "blur(8px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(8px)", y: 4 }} transition={{ duration: 0.25, ease: CURVA }} className="pointer-events-none fixed z-50 rounded-[7px] px-2 py-1 text-[12px] whitespace-nowrap" style={{ left: pos.x, top: pos.y - 8, translate: "-50% -100%", background: "var(--ds-tinta-forte)", color: "var(--ds-chao)" }}>
              {texto}
            </motion.span>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </span>
  )
}

/** Os atalhos da linha: só ícone, com dica. Chegam desfocados quando o
    ponteiro entra na linha (ou quando ela recebe foco de teclado). */
function Atalhos({ t, acao }: { t: TaskTableTask; acao: (o: string, t: TaskTableTask) => void }) {
  const itens: [string, React.ReactNode][] = [
    ...(t.depth < 2 ? [["Adicionar subtarefa", <TreeStructure key="s" size={15} />] as [string, React.ReactNode]] : []),
    ["Editar", <PencilSimple key="e" size={15} />],
    ...(t.status === "blocked" ? [["Desbloquear", <LockOpen key="d" size={15} />] as [string, React.ReactNode]] : []),
    ["Mais", <DotsThree key="m" size={18} weight="bold" />],
  ]
  return (
    <span className="flex justify-end gap-0.5 opacity-0 blur-[5px] transition-[opacity,filter] duration-300 group-focus-within:opacity-100 group-focus-within:blur-none group-hover:opacity-100 group-hover:blur-none">
      {itens.map(([r, i]) => (
        <Dica key={r} texto={r}>
          <button type="button" aria-label={r} onClick={(e) => (e.stopPropagation(), acao(r, t))} className="grid size-8 place-items-center rounded-[8px] transition-colors hover:bg-[var(--ds-placa-forte)]" style={{ color: "var(--ds-tinta)" }}>
            {i}
          </button>
        </Dica>
      ))}
    </span>
  )
}

function Concluir({ feita, salvando, onClick }: { feita: boolean; salvando: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={feita ? "Reabrir" : "Concluir"} onClick={(e) => (e.stopPropagation(), onClick())} className="grid size-5 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-300" style={{ background: feita ? "var(--success)" : "transparent", boxShadow: feita ? "0 0 0 1px var(--success)" : "inset 0 0 0 1.5px var(--ds-fio-forte)", color: "white" }}>
      <AnimatePresence mode="wait" initial={false}>
        {salvando ? (
          <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} exit={{ opacity: 0 }} transition={{ rotate: { duration: 0.8, ease: "linear", repeat: Infinity }, default: { duration: 0.2 } }} style={{ color: feita ? "white" : "var(--ds-tinta-2)" }}>
            <CircleNotch size={13} weight="bold" />
          </motion.span>
        ) : feita ? (
          <motion.span key="c" initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.3, ease: CURVA }}>
            <Check size={11} weight="bold" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}

/** O status troca pelo desfoque; a saída é curta para a confirmação chegar logo. */
function SeloTroca({ status }: { status: TaskTableStatus }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={status} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA}>
        <Selo {...ST_F[status]} />
      </motion.span>
    </AnimatePresence>
  )
}

function IndicadorSalvo({ estado }: { estado: "ocioso" | "salvando" | "salvo" }) {
  return (
    <div className="flex h-10 min-w-[104px] items-center justify-end">
      <AnimatePresence mode="wait">
        {estado === "ocioso" ? null : (
          <motion.span key={estado} initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA} className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase" style={{ color: estado === "salvo" ? "var(--success)" : "var(--ds-tinta-2)" }}>
            {estado === "salvando" ? <motion.span className="size-1.5 rounded-full" style={{ background: "var(--primary)" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} /> : <Check size={12} weight="bold" />}
            {estado === "salvando" ? "Salvando…" : "Salvo"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

/** O cabeçalho das colunas, sem barra: os rótulos soltos em mono, presos no
    topo ao rolar, e o desfoque se dissolvendo por cima da lista — o mesmo
    cabeçalho que some da linguagem. A coluna ordenada leva o quadradinho azul. */
function CabecalhoColunas({ colunas, grade, ordem, ordenar }: { colunas: { k: string; r: string; direita?: boolean }[]; grade: string; ordem: string; ordenar: (k: string) => void }) {
  return (
    <div className="sticky top-0 z-10 -mx-8 px-8" style={{ isolation: "isolate" }}>
      <span aria-hidden className="absolute inset-x-0 top-0 -bottom-5 -z-10" style={{ background: "linear-gradient(to bottom, var(--ds-placa-1) 35%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to bottom, black 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)" }} />
      <div className={`grid h-10 items-center gap-4 px-5 ${grade}`}>
        {colunas.map((c) =>
          c.r ? (
            <button key={c.k} type="button" onClick={() => ordenar(c.k)} className={`group relative flex items-center font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors ${c.direita ? "justify-end" : ""}`} style={{ color: ordem === c.k ? "var(--ds-tinta-forte)" : "var(--ds-tinta-2)" }}>
              {/* o quadradinho fica fora do fluxo, à esquerda: o rótulo alinha com o conteúdo da coluna */}
              <span className="relative">
                {ordem === c.k ? <motion.span layoutId="ordem" className="absolute top-1/2 -left-3.5 size-1.5 -translate-y-1/2" style={{ background: "var(--primary)" }} transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} /> : <span className="absolute top-1/2 -left-3.5 size-1.5 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-40" style={{ background: "var(--ds-tinta-2)" }} />}
                {c.r}
              </span>
            </button>
          ) : (
            <span key={c.k} />
          )
        )}
      </div>
    </div>
  )
}

const GRADE_ARVORE = "grid-cols-[minmax(0,1fr)_120px_96px_44px_70px_140px]"

/** A lista em árvore: cada épico é uma placa dentro da placa; tarefa e
    subtarefa penduradas no fio; atalhos no hover. */
function ArvoreFamilia({
  fechados,
  alternar,
  feitas,
  salvando,
  concluir,
  abrir,
  acao,
}: {
  fechados: Set<string>
  alternar: (id: string) => void
  feitas: Set<string>
  salvando: string | null
  concluir: (id: string) => void
  abrir: (t: TaskTableTask) => void
  acao: (o: string, t: TaskTableTask) => void
}) {
  const [ordem, setOrdem] = React.useState("tarefa")
  const ORD: Record<string, (t: TaskTableTask) => string | number> = {
    tarefa: (t) => t.code.padStart(8, "0"),
    status: (t) => ({ blocked: 0, progress: 1, active: 2, done: 3 })[feitas.has(t.id) ? "done" : t.status],
    prioridade: (t) => ({ urgent: 0, high: 1, medium: 2, low: 3, none: 4 })[t.priority ?? "none"],
    prazo: (t) => diaDe(t.end),
  }
  const ordena = (ls: TaskTableTask[]) => [...ls].sort((a, b) => (ORD[ordem](a) < ORD[ordem](b) ? -1 : ORD[ordem](a) > ORD[ordem](b) ? 1 : 0))
  const linha = (t: TaskTableTask, ultimo: boolean): React.ReactNode => {
    const st: TaskTableStatus = feitas.has(t.id) ? "done" : t.status
    const grupo = t.childGroupId
    const fechado = grupo ? fechados.has(grupo) : false
    const filhos = grupo ? ordena(filhosDe(t.id)) : []
    return (
      <React.Fragment key={t.id}>
        <motion.div
          layout
          initial={{ opacity: 0, height: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, height: 52, filter: "blur(0px)" }}
          exit={{ opacity: 0, height: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: CURVA }}
          onClick={() => abrir(t)}
          tabIndex={0}
          className={`group relative grid cursor-pointer items-center gap-4 overflow-hidden px-5 outline-none transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--primary)_5%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--primary)_5%,transparent)] ${GRADE_ARVORE}`}
          style={{ borderTop: "1px solid var(--ds-fio)" }}
        >
          <span className="relative flex min-w-0 items-center gap-2.5" style={{ paddingLeft: (t.depth - 1) * 26 }}>
            {t.depth === 2 ? (
              <>
                <span aria-hidden className="absolute top-[-26px] left-[10px] w-px" style={{ height: ultimo ? 26 : 52, background: "var(--ds-fio-forte)" }} />
                <span aria-hidden className="absolute top-0 left-[10px] h-px w-3" style={{ background: "var(--ds-fio-forte)" }} />
              </>
            ) : null}
            {grupo ? (
              <button type="button" onClick={(e) => (e.stopPropagation(), alternar(grupo))} aria-label={fechado ? "Abrir subtarefas" : "Recolher subtarefas"} className="grid size-5 shrink-0 place-items-center rounded-[5px] hover:bg-[var(--ds-trilho)]" style={{ color: "var(--ds-tinta-2)" }}>
                <motion.span animate={{ rotate: fechado ? 0 : 90 }} transition={{ duration: 0.3, ease: CURVA }}>
                  <CaretRight size={12} weight="bold" />
                </motion.span>
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}
            <Concluir feita={st === "done"} salvando={salvando === t.id} onClick={() => concluir(t.id)} />
            <span className="shrink-0 font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
              {t.code}
            </span>
            <span className="truncate text-[14.5px] transition-colors duration-300" style={{ color: st === "done" ? "var(--ds-tinta-2)" : "var(--ds-tinta-forte)" }}>
              {t.title}
            </span>
            {t.progress && grupo ? (
              <span className="shrink-0 font-mono text-[10.5px]" style={{ color: "var(--ds-tinta-2)" }}>
                {t.progress.done}/{t.progress.total}
              </span>
            ) : null}
            {t.deps?.length ? (
              <span className="flex shrink-0 items-center gap-1 rounded-[6px] px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "var(--ds-trilho)", color: "var(--ds-tinta-2)" }}>
                <LinkSimple size={11} /> {t.deps.length}
              </span>
            ) : null}
          </span>
          <SeloTroca status={st} />
          <span className="text-[13px]" style={{ color: "var(--ds-tinta-2)" }}>
            {PRIO_F[t.priority ?? "none"]}
          </span>
          {t.owner ? <Avatar iniciais={t.owner.initials} tom={TOM_DONO[t.owner.tone ?? "a4"]} /> : <span />}
          <span className="text-right font-mono text-[11.5px]" style={{ color: "var(--ds-tinta-2)" }}>
            {t.due}
          </span>
          <Atalhos t={{ ...t, status: st }} acao={acao} />
        </motion.div>
        <AnimatePresence initial={false}>{!fechado ? filhos.map((f, i) => linha(f, i === filhos.length - 1)) : null}</AnimatePresence>
      </React.Fragment>
    )
  }
  return (
    <div className="flex flex-col">
      <CabecalhoColunas
        grade={GRADE_ARVORE}
        ordem={ordem}
        ordenar={setOrdem}
        colunas={[
          { k: "tarefa", r: "Tarefa" },
          { k: "status", r: "Status" },
          { k: "prioridade", r: "Prioridade" },
          { k: "dono", r: "" },
          { k: "prazo", r: "Prazo", direita: true },
          { k: "atalhos", r: "" },
        ]}
      />
      <div className="flex flex-col gap-5">
        {FAMILIA.filter((e) => e.depth === 0).map((e) => {
          const fechado = fechados.has(e.id)
          const filhos = ordena(filhosDe(e.id))
          return (
            <section key={e.id} className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
              <header className="group flex h-12 items-center justify-between px-5">
                <button type="button" onClick={() => alternar(e.id)} className="flex items-center gap-3">
                  <motion.span animate={{ rotate: fechado ? 0 : 90 }} transition={{ duration: 0.3, ease: CURVA }} style={{ color: "var(--ds-tinta-2)" }}>
                    <CaretRight size={13} weight="bold" />
                  </motion.span>
                  <Flag size={14} weight="fill" style={{ color: "var(--primary)" }} />
                  <span className="font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
                    {e.code}
                  </span>
                  <Etiqueta cor="var(--primary)">{e.title}</Etiqueta>
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-24 overflow-hidden rounded-full" style={{ background: "var(--ds-trilho)" }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(e.progressRatio ?? 0) * 100}%` }} transition={{ duration: 1, ease: CURVA }} style={{ background: "var(--primary)" }} />
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
                    {e.progress?.done}/{e.progress?.total}
                  </span>
                </div>
              </header>
              <AnimatePresence initial={false}>{!fechado ? filhos.map((f, i) => linha(f, i === filhos.length - 1)) : null}</AnimatePresence>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** O quadro da família: as tarefas (sem os épicos) por status. */
function QuadroFamilia({ feitas, abrir }: { feitas: Set<string>; abrir: (t: TaskTableTask) => void }) {
  const ts = FAMILIA.filter((t) => t.depth > 0).map((t) => ({ ...t, status: (feitas.has(t.id) ? "done" : t.status) as TaskTableStatus }))
  return (
    <div className="grid grid-cols-4 gap-4">
      {(["active", "progress", "blocked", "done"] as TaskTableStatus[]).map((c) => (
        <div key={c} className="flex flex-col gap-3 rounded-[12px] p-3" style={{ background: "var(--ds-trilho)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
          <div className="flex h-9 items-center justify-between px-2">
            <Etiqueta cor={`var(--tone-${ST_F[c].tom}-dot)`}>{ST_F[c].rotulo}</Etiqueta>
            <span className="font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
              {ts.filter((t) => t.status === c).length}
            </span>
          </div>
          {ts
            .filter((t) => t.status === c)
            .map((t) => (
              <button key={t.id} type="button" onClick={() => abrir(t)} className="flex flex-col gap-3 rounded-[10px] p-4 text-left transition-transform duration-300 hover:-translate-y-0.5" style={{ background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1px var(--ds-fio), 0 10px 24px -18px var(--ds-sombra)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
                    {t.code}
                    {t.depth === 2 ? " · sub" : ""}
                  </span>
                  {t.owner ? <Avatar iniciais={t.owner.initials} tom={TOM_DONO[t.owner.tone ?? "a4"]} /> : null}
                </div>
                <span className="text-[14.5px] leading-snug" style={{ color: "var(--ds-tinta-forte)" }}>
                  {t.title}
                </span>
                <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: "var(--ds-tinta-2)" }}>
                  {PRIO_F[t.priority ?? "none"]} · {t.due}
                  {t.deps?.length ? (
                    <span className="flex items-center gap-1">
                      · <LinkSimple size={11} /> {t.deps.length}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
        </div>
      ))}
    </div>
  )
}

/** A linha do tempo da família, no tom das faixas: por épico, uma placa;
    à esquerda o nome, à direita a barra enchendo; vínculos tracejados; o
    hoje em azul. Hover numa tarefa acende ela e os vínculos. */
function LinhaFamilia({ feitas, abrir }: { feitas: Set<string>; abrir: (t: TaskTableTask) => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [larg, setLarg] = React.useState(700)
  const [foco, setFoco] = React.useState<string | null>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setLarg(el.clientWidth - 260))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const px = Math.max(larg, 200) / DIAS_MES
  const ligados = foco ? new Set([foco, ...(FAMILIA.find((x) => x.id === foco)?.deps ?? []), ...FAMILIA.filter((x) => x.deps?.includes(foco)).map((x) => x.id)]) : null
  const ordemLinhas = FAMILIA
  const H = 44
  const posY = new Map<string, number>()
  return (
    <div ref={ref} className="flex flex-col gap-5">
      <div className="sticky top-0 z-10 -mx-8 px-8" style={{ isolation: "isolate" }}>
        <span aria-hidden className="absolute inset-x-0 top-0 -bottom-5 -z-10" style={{ background: "linear-gradient(to bottom, var(--ds-placa-1) 35%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to bottom, black 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)" }} />
        <div className="relative ml-[260px] h-10">
          {[0, 7, 14, 21, 28].map((d) => (
            <span key={d} className="absolute top-1/2 -translate-y-1/2 font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ left: d * px, color: "var(--ds-tinta-2)" }}>
              {d + 1} nov
            </span>
          ))}
          <span className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] uppercase" style={{ left: HOJE_DIA * px - 3, color: "var(--primary)" }}>
            <span className="size-1.5" style={{ background: "var(--primary)" }} /> hoje
          </span>
        </div>
      </div>
      {FAMILIA.filter((e) => e.depth === 0).map((e) => {
        const linhas = ordemLinhas.filter((x) => x.depth > 0 && (x.parentId === e.id || FAMILIA.find((p) => p.id === x.parentId)?.parentId === e.id))
        linhas.forEach((x, i) => posY.set(x.id, i))
        return (
          <section key={e.id} className="relative overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
            <header className="flex h-12 items-center gap-3 px-5" style={{ borderBottom: "1px solid var(--ds-fio)" }}>
              <Flag size={14} weight="fill" style={{ color: "var(--primary)" }} />
              <Etiqueta cor="var(--primary)">{e.title}</Etiqueta>
            </header>
            <div className="relative">
              {/* o hoje atravessa a placa */}
              <span className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5" style={{ left: 260 + HOJE_DIA * px, background: "var(--primary)", boxShadow: "0 0 10px color-mix(in oklab, var(--primary) 60%, transparent)" }} />
              <svg className="pointer-events-none absolute top-0 left-[260px] z-0 overflow-visible" width={larg} height={linhas.length * H}>
                {linhas.flatMap((t) =>
                  (t.deps ?? []).map((d) => {
                    const de = FAMILIA.find((x) => x.id === d)
                    const a = posY.get(d)
                    const b = posY.get(t.id)
                    if (!de || a === undefined || b === undefined) return null
                    const x1 = (diaDe(de.end) + 1) * px
                    const x2 = diaDe(t.start) * px
                    const y1 = a * H + H / 2
                    const y2 = b * H + H / 2
                    const meio = Math.max(x1 + 10, (x1 + x2) / 2)
                    const aceso = ligados ? ligados.has(t.id) && ligados.has(d) : false
                    return (
                      <motion.path key={`${d}-${t.id}`} d={`M ${x1} ${y1} H ${meio} V ${y2} H ${x2 - 3}`} fill="none" strokeDasharray="4 4" animate={{ opacity: ligados && !aceso ? 0.15 : 1, stroke: aceso ? "var(--primary)" : "var(--ds-fio-forte)" }} transition={{ duration: 0.3 }} />
                    )
                  })
                )}
              </svg>
              {linhas.map((t, i) => {
                const st: TaskTableStatus = feitas.has(t.id) ? "done" : t.status
                const tom = ST_F[st].tom
                const ini = diaDe(t.start)
                const fim = diaDe(t.end) + 1
                const recua = ligados && !ligados.has(t.id)
                const prog = feitas.has(t.id) ? 1 : (t.progressRatio ?? 0)
                return (
                  <motion.div key={t.id} onClick={() => abrir(t)} onMouseEnter={() => setFoco(t.id)} onMouseLeave={() => setFoco(null)} animate={{ opacity: recua ? 0.35 : 1 }} transition={{ duration: 0.3 }} className="relative flex cursor-pointer items-center" style={{ height: H, borderTop: i ? "1px solid var(--ds-fio)" : undefined }}>
                    <span className="flex w-[260px] shrink-0 items-center gap-2 truncate px-5 text-[13.5px]" style={{ paddingLeft: t.depth === 2 ? 44 : 20, color: st === "done" ? "var(--ds-tinta-2)" : "var(--ds-tinta-forte)" }}>
                      <span className="font-mono text-[10.5px]" style={{ color: "var(--ds-tinta-2)" }}>
                        {t.code}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </span>
                    <motion.span
                      className="absolute z-[1] overflow-hidden rounded-[8px]"
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, ease: CURVA, delay: 0.05 * i }}
                      style={{ left: 260 + ini * px, width: (fim - ini) * px - 3, top: 10, height: 24, background: `var(--tone-${tom})`, boxShadow: foco === t.id ? `0 0 0 1.5px var(--tone-${tom}-dot), 0 8px 20px -8px var(--tone-${tom}-dot)` : `inset 0 0 0 1px color-mix(in oklab, var(--tone-${tom}-dot) 28%, transparent)` }}
                    >
                      <motion.span className="absolute inset-y-0 left-0" initial={{ width: 0 }} animate={{ width: `${prog * 100}%` }} transition={{ duration: 1.1, ease: CURVA, delay: 0.15 + 0.06 * i }} style={{ background: `color-mix(in oklab, var(--tone-${tom}-dot) 35%, transparent)` }} />
                    </motion.span>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** A tarefa aberta, na frente: a ficha, as subtarefas e os vínculos. */
function DetalheFamilia({ t, feitas, fechar, abrir }: { t: TaskTableTask; feitas: Set<string>; fechar: () => void; abrir: (t: TaskTableTask) => void }) {
  const st: TaskTableStatus = feitas.has(t.id) ? "done" : t.status
  const subs = filhosDe(t.id)
  const depende = (t.deps ?? []).map((d) => FAMILIA.find((x) => x.id === d)!).filter(Boolean)
  const segura = FAMILIA.filter((x) => x.deps?.includes(t.id))
  const mini = (x: TaskTableTask) => (
    <button key={x.id} type="button" onClick={() => abrir(x)} className="flex h-10 items-center gap-3 rounded-[8px] px-2 text-left text-[13.5px] transition-colors hover:bg-[var(--ds-placa-forte)]" style={{ color: "var(--ds-tinta-forte)" }}>
      <span className="size-1.5 rounded-full" style={{ background: `var(--tone-${ST_F[feitas.has(x.id) ? "done" : x.status].tom}-dot)` }} />
      <span className="font-mono text-[11px]" style={{ color: "var(--ds-tinta-2)" }}>
        {x.code}
      </span>
      <span className="truncate">{x.title}</span>
    </button>
  )
  const bloco = (rotulo: string, xs: TaskTableTask[]) =>
    xs.length ? (
      <div className="flex flex-col gap-1 rounded-[12px] p-3" style={{ background: "var(--ds-trilho)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
        <span className="px-2 pb-1">
          <Etiqueta cor="var(--primary)">{rotulo}</Etiqueta>
        </span>
        {xs.map(mini)}
      </div>
    ) : null
  return (
    <AnimatePresence mode="wait">
      <motion.div key={t.id} {...troca} className="flex flex-1 flex-col gap-6">
        <CabecalhoFrente etiqueta={t.depth === 2 ? `${t.code} · subtarefa` : t.code} tom={ST_F[st].tom} titulo={t.title} fechar={fechar} />
        <Ficha
          linhas={[
            ["Status", <SeloTroca key="s" status={st} />],
            ["Responsável", t.owner ? <><Avatar iniciais={t.owner.initials} tom={TOM_DONO[t.owner.tone ?? "a4"]} /> {NOME_DONO[t.owner.initials]}</> : "—"],
            ["Prazo", <><CalendarBlank size={16} /> {t.due}</>],
            ["Prioridade", PRIO_F[t.priority ?? "none"]],
          ]}
        />
        {bloco(`Subtarefas · ${subs.length}`, subs)}
        {bloco("Depende de", depende)}
        {bloco("Segura", segura)}
      </motion.div>
    </AnimatePresence>
  )
}

function TelaTarefas() {
  const [foco, setFoco] = React.useState("cobranca")
  const [vista, setVista] = React.useState(() => (location.hash.includes("quadro") ? "quadro" : "lista"))
  const [aberta, setAberta] = React.useState<TaskTableTask | null>(() => (location.hash.includes("aberta") ? FAMILIA[1] : null))
  const [nova, setNova] = React.useState(() => location.hash.includes("nova"))
  const [fechados, setFechados] = React.useState<Set<string>>(new Set())
  const [feitas, setFeitas] = React.useState<Set<string>>(new Set())
  const [salvando, setSalvando] = React.useState<string | null>(null)
  const [estado, setEstado] = React.useState<"ocioso" | "salvando" | "salvo">("ocioso")
  const [aviso, avisar] = useAviso()
  const carregando = useCarregando(`${foco}-${vista}`)
  const projeto = PROJETOS.find((p) => p.id === foco)!
  const alternar = (id: string) =>
    setFechados((m) => {
      const n = new Set(m)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  // concluir: gira enquanto salva, o status troca pelo desfoque, o indicador diz Salvo
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
  const acao = (o: string, t: TaskTableTask) => {
    if (o === "Editar") setAberta(t)
    else if (o === "Desbloquear") avisar(`${t.code} desbloqueada`)
    else if (o === "Adicionar subtarefa") avisar(`Nova subtarefa em ${t.code}`)
  }
  return (
    <>
      <Faixas
        itens={PROJETOS}
        focoId={foco}
        onFoco={setFoco}
        recua={aberta !== null || nova}
        onFundo={() => {
          setAberta(null)
          setNova(false)
        }}
        acoes={
          <>
            <IndicadorSalvo estado={estado} />
            <Vistas valor={vista} onChange={setVista} />
            <Botao solido onClick={() => setNova(true)}>
              <Plus size={16} /> Nova tarefa
            </Botao>
          </>
        }
        corpo={() => (
          <AnimatePresence mode="wait">
            <motion.div key={carregando ? "carregando" : `${foco}-${vista}`} {...troca}>
              {carregando ? (
                <EsqueletoLista colunas={COLS_TAREFA} />
              ) : vista === "lista" ? (
                <ArvoreFamilia fechados={fechados} alternar={alternar} feitas={feitas} salvando={salvando} concluir={concluir} abrir={setAberta} acao={acao} />
              ) : vista === "quadro" ? (
                <QuadroFamilia feitas={feitas} abrir={setAberta} />
              ) : (
                <LinhaFamilia feitas={feitas} abrir={setAberta} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      />
      <AnimatePresence>
        {nova ? (
          <Frente key="nova">
            <NovaTarefa
              projeto={projeto}
              fechar={() => setNova(false)}
              criar={(t) => {
                setNova(false)
                avisar(`“${t}” entrou em ${projeto.nome}`)
              }}
            />
          </Frente>
        ) : null}
        {aberta ? (
          <Frente key="tarefa">
            <DetalheFamilia t={aberta} feitas={feitas} fechar={() => setAberta(null)} abrir={setAberta} />
            <div className="mt-auto flex gap-2">
              <Botao solido onClick={() => concluir(aberta.id)}>{feitas.has(aberta.id) || aberta.status === "done" ? "Reabrir" : "Concluir tarefa"}</Botao>
              <Botao>Comentar</Botao>
            </div>
          </Frente>
        ) : null}
      </AnimatePresence>
      {aviso}
    </>
  )
}

// ── tela 2: clientes (o molde do CRUD do Backoffice) ─────────────────────

interface Cliente {
  id: string
  iniciais: string
  tom: string
  nome: string
  email: string
  plano: string
  acesso: string
  desde: string
  pago: number
}
const TOTAL_CLIENTES = 1284
const ESTADOS: (ItemFaixa & { qtd: number; seloTom: string; rotulo: string })[] = [
  { id: "pagantes", nome: "Pagantes", rotulo: "Pagante", tom: "green", seloTom: "green", qtd: 771, resumo: "R$ 41.920 por mês", fracao: 771 / TOTAL_CLIENTES, valor: "771" },
  { id: "teste", nome: "Em teste", rotulo: "Em teste", tom: "blue", seloTom: "blue", qtd: 58, resumo: "12 terminam esta semana", fracao: 58 / TOTAL_CLIENTES, valor: "58" },
  { id: "cartao", nome: "Teste com cartão", rotulo: "Teste com cartão", tom: "cyan", seloTom: "cyan", qtd: 38, resumo: "viram pagantes sozinhos", fracao: 38 / TOTAL_CLIENTES, valor: "38" },
  { id: "atraso", nome: "Em atraso", rotulo: "Em atraso", tom: "orange", seloTom: "orange", qtd: 41, resumo: "R$ 3.927 em aberto", fracao: 41 / TOTAL_CLIENTES, valor: "41" },
  { id: "gratis", nome: "Grátis", rotulo: "Grátis", tom: "gray", seloTom: "gray", qtd: 338, resumo: "plano Starter", fracao: 338 / TOTAL_CLIENTES, valor: "338" },
  { id: "cancelados", nome: "Cancelados", rotulo: "Cancelado", tom: "red", seloTom: "red", qtd: 38, resumo: "7 este mês", fracao: 38 / TOTAL_CLIENTES, valor: "38" },
]
const PESSOAS = [
  ["MC", "Marina Costa", "marina@costa.dev"],
  ["RM", "Rafael Moura", "rafael@moura.dev"],
  ["BN", "Beatriz Nunes", "bia@nunes.io"],
  ["TA", "Tiago Albuquerque", "tiago@albuquerque.com"],
  ["LF", "Lucas Ferraz", "lucas.ferraz@gmail.com"],
  ["CR", "Camila Rocha", "camila@rocha.design"],
  ["HD", "Helena Duarte", "helena@duarte.app"],
  ["OP", "Otávio Prado", "otavio.prado@outlook.com"],
  ["SM", "Sofia Martins", "sofia@martins.co"],
]
const TONS_AVATAR = ["blue", "green", "orange", "yellow", "purple", "cyan"]
const ACESSOS = ["agora", "há 12 min", "há 2 h", "ontem", "há 3 dias", "há 6 dias", "há 2 meses"]
function clientesDe(estado: string): Cliente[] {
  const desloca = ESTADOS.findIndex((e) => e.id === estado) * 2
  const pagos = estado === "pagantes" || estado === "atraso" || estado === "cancelados"
  return Array.from({ length: 7 }, (_, i) => {
    const [iniciais, nome, email] = PESSOAS[(i + desloca) % PESSOAS.length]
    return {
      id: `${estado}-${i}`,
      iniciais,
      tom: TONS_AVATAR[(i + desloca) % TONS_AVATAR.length],
      nome,
      email,
      plano: ["Pro", "Team", "Pro", "Starter"][(i + desloca) % 4],
      acesso: ACESSOS[(i + desloca) % ACESSOS.length],
      desde: ["mar 2026", "jan 2026", "nov 2025", "set 2026", "jul 2026"][(i + desloca) % 5],
      pago: pagos ? [343, 470, 1341, 1788, 196][(i + desloca) % 5] : 0,
    }
  })
}
const COLS_CLIENTE = "grid-cols-[18px_minmax(0,2.4fr)_90px_120px_110px_110px]"
const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`

function ListaClientes({ estado, abrir }: { estado: string; abrir: (c: Cliente) => void }) {
  const [marcados, setMarcados] = React.useState<Set<string>>(new Set())
  return (
    <section className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
      <header className={`grid h-11 items-center gap-4 px-5 font-mono text-[10.5px] tracking-[0.1em] uppercase ${COLS_CLIENTE}`} style={{ color: "var(--ds-tinta-2)" }}>
        <span />
        <span>Cliente</span>
        <span>Plano</span>
        <span>Último acesso</span>
        <span>Desde</span>
        <span className="text-right">Total pago</span>
      </header>
      {clientesDe(estado).map((c) => {
        const marcado = marcados.has(c.id)
        return (
          <div
            key={c.id}
            onClick={() => abrir(c)}
            className={`grid h-[60px] cursor-pointer items-center gap-4 px-5 transition-colors duration-300 ${COLS_CLIENTE}`}
            style={{ borderTop: "1px solid var(--ds-fio)", background: marcado ? "color-mix(in oklab, var(--primary) 8%, transparent)" : undefined }}
          >
            <Caixa
              marcada={marcado}
              onChange={() =>
                setMarcados((m) => {
                  const n = new Set(m)
                  if (n.has(c.id)) n.delete(c.id)
                  else n.add(c.id)
                  return n
                })
              }
            />
            <span className="flex min-w-0 items-center gap-3">
              <Avatar iniciais={c.iniciais} tom={c.tom} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[14.5px]" style={{ color: "var(--ds-tinta-forte)" }}>
                  {c.nome}
                </span>
                <span className="truncate text-[12.5px]" style={{ color: "var(--ds-tinta-2)" }}>
                  {c.email}
                </span>
              </span>
            </span>
            <span className="text-[13.5px]" style={{ color: "var(--ds-tinta)" }}>
              {c.plano}
            </span>
            <span className="text-[13px]" style={{ color: "var(--ds-tinta-2)" }}>
              {c.acesso}
            </span>
            <span className="text-[13px]" style={{ color: "var(--ds-tinta-2)" }}>
              {c.desde}
            </span>
            <span className="text-right font-mono text-[12.5px]" style={{ color: c.pago ? "var(--ds-tinta-forte)" : "var(--ds-tinta-2)" }}>
              {c.pago ? reais(c.pago) : "—"}
            </span>
          </div>
        )
      })}
    </section>
  )
}

function EsqueletoClientes() {
  return (
    <section className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }} aria-busy="true" aria-label="Carregando">
      <header className={`grid h-11 items-center gap-4 px-5 ${COLS_CLIENTE}`}>
        <span />
        {[16, 10, 18, 10, 16].map((w, i) => (
          <Osso key={i} className="h-2" style={{ width: `${w * 4}px` }} />
        ))}
      </header>
      {Array.from({ length: 7 }, (_, l) => (
        <div key={l} className={`grid h-[60px] items-center gap-4 px-5 ${COLS_CLIENTE}`} style={{ borderTop: "1px solid var(--ds-fio)" }}>
          <Osso className="size-[18px]" />
          <span className="flex items-center gap-3">
            <Osso azul className="size-8 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Osso className="h-3" style={{ width: `${40 + ((l * 13) % 30)}%` }} />
              <Osso className="h-2" style={{ width: `${30 + ((l * 7) % 25)}%` }} />
            </span>
          </span>
          <Osso className="h-2.5 w-12" />
          <Osso className="h-2.5 w-16" />
          <Osso className="h-2.5 w-14" />
          <Osso className="ml-auto h-2.5 w-14" />
        </div>
      ))}
    </section>
  )
}

function EditarCliente({ cliente, salvar, cancelar }: { cliente: Cliente; salvar: (c: Cliente) => void; cancelar: () => void }) {
  const [nome, setNome] = React.useState(cliente.nome)
  const [email, setEmail] = React.useState(cliente.email)
  const [plano, setPlano] = React.useState(cliente.plano)
  const erroEmail = email.includes("@") ? null : "Esse e-mail não parece completo."
  return (
    <form
      className="flex flex-1 flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!erroEmail && nome.trim()) salvar({ ...cliente, nome: nome.trim(), email, plano })
      }}
    >
      <Campo rotulo="Nome">
        <Entrada valor={nome} onChange={setNome} autoFocus />
      </Campo>
      <Campo rotulo="E-mail" erro={erroEmail}>
        <Entrada valor={email} onChange={setEmail} erro={Boolean(erroEmail)} />
      </Campo>
      <Campo rotulo="Plano">
        <Escolha id="plano" valor={plano} onChange={setPlano} opcoes={["Starter", "Pro", "Team"].map((v) => ({ v, rotulo: v }))} />
      </Campo>
      <div className="mt-auto flex gap-2 pt-2">
        <button type="submit" className="inline-flex h-10 items-center rounded-[10px] px-4 text-[14px] active:scale-[0.98]" style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" }}>
          Salvar
        </button>
        <Botao onClick={cancelar}>Cancelar</Botao>
      </div>
    </form>
  )
}

function TelaClientes() {
  const [foco, setFoco] = React.useState("pagantes")
  const [aberto, setAberto] = React.useState<Cliente | null>(null)
  const [editando, setEditando] = React.useState(false)
  const [aviso, avisar] = useAviso()
  const carregando = useCarregando(foco)
  const estado = ESTADOS.find((e) => e.id === foco)!
  return (
    <>
      <Faixas
        itens={ESTADOS}
        focoId={foco}
        onFoco={setFoco}
        recua={aberto !== null}
        onFundo={() => {
          setAberto(null)
          setEditando(false)
        }}
        acoes={
          <>
            <Busca texto="Buscar por nome ou e-mail" />
            <Botao>Exportar</Botao>
          </>
        }
        corpo={() => (
          <AnimatePresence mode="wait">
            <motion.div key={carregando ? "carregando" : foco} {...troca}>
              {carregando ? <EsqueletoClientes /> : <ListaClientes estado={foco} abrir={setAberto} />}
            </motion.div>
          </AnimatePresence>
        )}
      />
      <AnimatePresence>
        {aberto ? (
          <Frente key={aberto.id}>
            <CabecalhoFrente etiqueta={editando ? "Editando" : `Cliente desde ${aberto.desde}`} tom={estado.tom} titulo={aberto.nome} fechar={() => { setAberto(null); setEditando(false) }} />
            <AnimatePresence mode="wait">
            {editando ? (
              <motion.div key="editar" {...troca} className="flex flex-1 flex-col">
                <EditarCliente
                  cliente={aberto}
                  cancelar={() => setEditando(false)}
                  salvar={(c) => {
                    setAberto(c)
                    setEditando(false)
                    avisar("Dados do cliente salvos")
                  }}
                />
              </motion.div>
            ) : (
            <motion.div key="ficha" {...troca} className="flex flex-1 flex-col gap-6">
            <Ficha
              linhas={[
                ["E-mail", aberto.email],
                ["Status", <Selo key="s" rotulo={estado.rotulo} tom={estado.seloTom} />],
                ["Plano", aberto.plano],
                ["Último acesso", aberto.acesso],
                ["Total pago", aberto.pago ? reais(aberto.pago) : "—"],
              ]}
            />
            <div className="flex flex-col gap-3 rounded-[12px] p-4" style={{ background: "var(--ds-trilho)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
              <Etiqueta cor="var(--primary)">Últimos pagamentos</Etiqueta>
              {["out 2026", "set 2026", "ago 2026"].map((m) => (
                <div key={m} className="flex items-center justify-between text-[13.5px]">
                  <span style={{ color: "var(--ds-tinta)" }}>{m}</span>
                  <span className="font-mono text-[12.5px]" style={{ color: "var(--ds-tinta-forte)" }}>
                    {aberto.pago ? reais(Math.round(aberto.pago / 6)) : "—"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex gap-2">
              <Botao solido onClick={() => setEditando(true)}>Editar</Botao>
              <Botao>Ver pagamentos</Botao>
            </div>
            </motion.div>
            )}
            </AnimatePresence>
          </Frente>
        ) : null}
      </AnimatePresence>
      {aviso}
    </>
  )
}

// ── tela 3: membros por time (Platform) ──────────────────────────────────

type Papel = "admin" | "membro" | "convidado"
const PAPEL: Record<Papel, { rotulo: string; tom: string }> = {
  admin: { rotulo: "Admin", tom: "blue" },
  membro: { rotulo: "Membro", tom: "gray" },
  convidado: { rotulo: "Convidado", tom: "yellow" },
}
interface Membro {
  id: string
  iniciais: string
  tom: string
  nome: string
  email: string
  papel: Papel
  acesso: string
  pendente: boolean
}
const TIMES: (ItemFaixa & { assentos: number; pessoas: number })[] = [
  { id: "produto", nome: "Produto", tom: "blue", assentos: 8, pessoas: 6, resumo: "6 de 8 assentos", fracao: 6 / 8, valor: "6" },
  { id: "engenharia", nome: "Engenharia", tom: "purple", assentos: 14, pessoas: 12, resumo: "12 de 14 assentos", fracao: 12 / 14, valor: "12" },
  { id: "design", nome: "Design", tom: "pink", assentos: 6, pessoas: 4, resumo: "4 de 6 assentos", fracao: 4 / 6, valor: "4" },
  { id: "comercial", nome: "Comercial", tom: "orange", assentos: 6, pessoas: 5, resumo: "5 de 6 assentos", fracao: 5 / 6, valor: "5" },
  { id: "convites", nome: "Convites pendentes", tom: "yellow", assentos: 3, pessoas: 3, resumo: "esperando aceite", fracao: 1, valor: "3" },
]
function membrosDe(time: string): Membro[] {
  const t = TIMES.find((x) => x.id === time)!
  const desloca = TIMES.indexOf(t) * 3
  return Array.from({ length: t.pessoas }, (_, i) => {
    const [iniciais, nome, email] = PESSOAS[(i + desloca) % PESSOAS.length]
    const pendente = time === "convites"
    return {
      id: `${time}-${i}`,
      iniciais,
      tom: TONS_AVATAR[(i + desloca) % TONS_AVATAR.length],
      nome,
      email,
      papel: pendente ? "convidado" : i === 0 ? "admin" : "membro",
      acesso: pendente ? "convite enviado há " + (i + 2) + " dias" : ACESSOS[(i + desloca) % ACESSOS.length],
      pendente,
    }
  })
}
const COLS_MEMBRO = "grid-cols-[minmax(0,2.4fr)_130px_150px_90px]"

function ListaMembros({ time, abrir }: { time: string; abrir: (m: Membro) => void }) {
  return (
    <section className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
      <header className={`grid h-11 items-center gap-4 px-5 font-mono text-[10.5px] tracking-[0.1em] uppercase ${COLS_MEMBRO}`} style={{ color: "var(--ds-tinta-2)" }}>
        <span>Pessoa</span>
        <span>Papel</span>
        <span>Último acesso</span>
        <span className="text-right">2FA</span>
      </header>
      {membrosDe(time).map((m) => (
        <div key={m.id} onClick={() => abrir(m)} className={`grid h-[60px] cursor-pointer items-center gap-4 px-5 ${COLS_MEMBRO}`} style={{ borderTop: "1px solid var(--ds-fio)", opacity: m.pendente ? 0.75 : 1 }}>
          <span className="flex min-w-0 items-center gap-3">
            <Avatar iniciais={m.iniciais} tom={m.pendente ? undefined : m.tom} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[14.5px]" style={{ color: "var(--ds-tinta-forte)" }}>
                {m.nome}
              </span>
              <span className="truncate text-[12.5px]" style={{ color: "var(--ds-tinta-2)" }}>
                {m.email}
              </span>
            </span>
          </span>
          <Selo {...PAPEL[m.papel]} />
          <span className="text-[13px]" style={{ color: "var(--ds-tinta-2)" }}>
            {m.acesso}
          </span>
          <span className="text-right font-mono text-[11.5px] tracking-[0.08em] uppercase" style={{ color: m.pendente ? "var(--ds-tinta-2)" : "var(--success)" }}>
            {m.pendente ? "—" : "Ativo"}
          </span>
        </div>
      ))}
    </section>
  )
}

function EsqueletoMembros() {
  return (
    <section className="overflow-hidden rounded-[12px]" style={{ background: "var(--ds-placa-2)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }} aria-busy="true" aria-label="Carregando">
      <header className={`grid h-11 items-center gap-4 px-5 ${COLS_MEMBRO}`}>
        {[16, 10, 22, 6].map((w, i) => (
          <Osso key={i} className={`h-2 ${i === 3 ? "ml-auto" : ""}`} style={{ width: `${w * 4}px` }} />
        ))}
      </header>
      {Array.from({ length: 5 }, (_, l) => (
        <div key={l} className={`grid h-[60px] items-center gap-4 px-5 ${COLS_MEMBRO}`} style={{ borderTop: "1px solid var(--ds-fio)" }}>
          <span className="flex items-center gap-3">
            <Osso azul className="size-8 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Osso className="h-3" style={{ width: `${35 + ((l * 13) % 30)}%` }} />
              <Osso className="h-2" style={{ width: `${28 + ((l * 7) % 25)}%` }} />
            </span>
          </span>
          <Osso azul className="h-7 w-20 rounded-[7px]" />
          <Osso className="h-2.5 w-20" />
          <Osso className="ml-auto h-2.5 w-10" />
        </div>
      ))}
    </section>
  )
}

function TelaMembros() {
  const [foco, setFoco] = React.useState("produto")
  const [aberto, setAberto] = React.useState<Membro | null>(null)
  const [aviso, avisar] = useAviso()
  const carregando = useCarregando(foco)
  const time = TIMES.find((t) => t.id === foco)!
  return (
    <>
      <Faixas
        itens={TIMES}
        focoId={foco}
        onFoco={setFoco}
        recua={aberto !== null}
        onFundo={() => setAberto(null)}
        acoes={
          <>
            <Busca texto="Buscar pessoa" />
            <Botao solido onClick={() => avisar(`Convite pronto para ${time.nome}`)}>
              <Plus size={16} /> Convidar
            </Botao>
          </>
        }
        corpo={() => (
          <AnimatePresence mode="wait">
            <motion.div key={carregando ? "carregando" : foco} {...troca}>
              {carregando ? <EsqueletoMembros /> : <ListaMembros time={foco} abrir={setAberto} />}
            </motion.div>
          </AnimatePresence>
        )}
      />
      <AnimatePresence>
        {aberto ? (
          <Frente key={aberto.id}>
            <CabecalhoFrente etiqueta={`${time.nome} · ${aberto.pendente ? "convite pendente" : "membro"}`} tom={time.tom} titulo={aberto.nome} fechar={() => setAberto(null)} />
            <Ficha
              linhas={[
                [
                  "Papel",
                  <AnimatePresence key="p" mode="wait">
                    <motion.span key={aberto.papel} initial={{ opacity: 0, filter: "blur(8px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(8px)", y: -4 }} transition={{ duration: 0.35, ease: CURVA }}>
                      <Selo {...PAPEL[aberto.papel]} />
                    </motion.span>
                  </AnimatePresence>,
                ],
                ["E-mail", aberto.email],
                ["Último acesso", aberto.acesso],
                ["Time", time.nome],
              ]}
            />
            {/* o papel muda direto aqui: a escolha é o próprio controle, sem modo de edição */}
            <Campo rotulo="Papel no time">
              <Escolha
                id="papel"
                valor={aberto.papel}
                onChange={(papel) => {
                  setAberto({ ...aberto, papel })
                  avisar(`${aberto.nome.split(" ")[0]} agora é ${PAPEL[papel].rotulo.toLowerCase()}`)
                }}
                opcoes={(Object.keys(PAPEL) as Papel[]).map((v) => ({ v, rotulo: PAPEL[v].rotulo, tom: PAPEL[v].tom }))}
              />
            </Campo>
            <div className="mt-auto flex gap-2">
              {aberto.pendente ? <Botao solido onClick={() => avisar("Convite reenviado")}>Reenviar convite</Botao> : <Botao solido>Mudar de time</Botao>}
              <Botao>Remover do time</Botao>
            </div>
          </Frente>
        ) : null}
      </AnimatePresence>
      {aviso}
    </>
  )
}

// ── o app ────────────────────────────────────────────────────────────────

function App() {
  const [escuro, setEscuro] = React.useState(() => location.hash.includes("escuro"))
  const [tela, setTela] = React.useState(() => (location.hash.includes("clientes") ? "clientes" : location.hash.includes("membros") ? "membros" : "tarefas"))
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", escuro)
  }, [escuro])

  const nav = [
    { id: "inicio", i: <House size={18} />, r: "Início" },
    { id: "tarefas", i: <ListChecks size={18} />, r: "Tarefas" },
    { id: "quadros", i: <Kanban size={18} />, r: "Quadros" },
    { id: "clientes", i: <AddressBook size={18} />, r: "Clientes" },
    { id: "membros", i: <Users size={18} />, r: "Membros" },
    { id: "relatorios", i: <ChartBar size={18} />, r: "Relatórios" },
  ]

  return (
    <div className="flex h-dvh gap-4 p-4 text-[var(--ds-tinta)]">
      <Atmosfera />

      {/* Camada 1: a sidebar, placa fosca sobre a luz. */}
      <nav className="flex w-[232px] shrink-0 flex-col gap-1 rounded-[14px] p-3" style={placa()}>
        <div className="flex h-12 items-center gap-2.5 px-2 text-[15px]" style={{ color: "var(--ds-tinta-forte)" }}>
          <MurikiLogo className="size-7" /> muriki
        </div>
        <div className="px-2 pt-3 pb-2">
          <Etiqueta>Trabalho</Etiqueta>
        </div>
        {nav.map((n) => {
          const ativo = n.id === tela
          const vivo = n.id === "tarefas" || n.id === "clientes" || n.id === "membros"
          return (
            <button
              key={n.id}
              onClick={() => vivo && setTela(n.id)}
              className="relative flex h-10 items-center gap-3 rounded-[9px] px-3 text-left text-[14px] transition-colors"
              style={{ color: ativo ? "var(--ds-tinta-forte)" : "var(--ds-tinta-2)" }}
            >
              {ativo ? (
                <motion.span layoutId="nav" className="absolute inset-0 rounded-[9px]" style={{ background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1px var(--ds-fio), 0 4px 14px -8px var(--ds-sombra)" }} transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
              ) : null}
              {/* o item que acaba de ser escolhido chega desfocado, junto com a pílula que desliza */}
              <motion.span
                key={ativo ? "ativo" : "inativo"}
                initial={ativo ? { opacity: 0.2, filter: "blur(8px)", x: -4 } : false}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                transition={CHEGADA}
                className="relative flex items-center gap-3"
              >
                {n.i}
                {n.r}
              </motion.span>
            </button>
          )
        })}
        <div className="mt-auto flex items-center justify-between rounded-[10px] p-2" style={{ background: "var(--ds-trilho)" }}>
          <span className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ds-tinta-forte)" }}>
            <Avatar iniciais="GT" /> Guilherme T.
          </span>
          <button onClick={() => setEscuro(!escuro)} className="h-8 rounded-[8px] px-2.5 font-mono text-[10.5px] tracking-[0.08em] uppercase" style={{ background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1px var(--ds-fio)", color: "var(--ds-tinta)" }}>
            {escuro ? "Claro" : "Escuro"}
          </button>
        </div>
      </nav>

      {/* Camada 2 e 3: a tela da vez, trocando com o desfoque. */}
      <div className="relative flex min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={tela} {...troca} className="relative flex min-w-0 flex-1">
            {tela === "tarefas" ? <TelaTarefas /> : tela === "clientes" ? <TelaClientes /> : <TelaMembros />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
