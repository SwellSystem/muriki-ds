import * as React from "react"
import { createRoot } from "react-dom/client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { MetricCard } from "@/components/blocks/metric-card/metric-card"
import { StatusPill } from "@/components/blocks/status-pill/status-pill"
import { KanbanCard } from "@/components/blocks/kanban/kanban-card"

/* Tela de entrada do Platform no estilo da rivio.com.br, com a paleta e os
   componentes do Muriki. É página de teste: os efeitos que precisam de JS
   (a revelação por palavra, as camadas) vivem aqui, não no DS, até alguém
   aprovar a direção e eles virarem componente. */

function useRolagem() {
  const [y, setY] = React.useState(0)
  React.useEffect(() => {
    const ao = () => setY(scrollY)
    addEventListener("scroll", ao, { passive: true })
    return () => removeEventListener("scroll", ao)
  }, [])
  return y
}

/** O cabeçalho: sem placa, só o desfoque sumindo para baixo (data-blur). */
function Nav({ escuro }: { escuro: boolean }) {
  return (
    <header
      data-blur
      // Sobre o topo grafite o cabeçalho leva a classe dark: o véu do desfoque usa --background, e sem ela era uma faixa clara em cima do escuro.
      className={`fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-8 text-foreground ${escuro ? "dark" : ""}`}
    >
      <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
        <MurikiLogo className="size-6" /> muriki
      </div>
      <nav className="flex gap-8 text-[13px] opacity-80">
        <a href="#">Produto</a>
        <a href="#">Times</a>
        <a href="#">Preços</a>
        <a href="#">Contato</a>
      </nav>
      <Button size="sm" variant={escuro ? "secondary" : "outline"}>
        Entrar
      </Button>
    </header>
  )
}

/** O topo em grafite: o nome enorme se dissolvendo, a frase embaixo à esquerda. */
function Hero() {
  return (
    <section className="dark relative flex h-dvh flex-col justify-end overflow-hidden bg-background px-8 pb-14 text-foreground">
      {/* O nome ao fundo, enorme, nítido no meio e desfocado nas pontas. */}
      <TituloDissolvido
        texto="muriki platform"
        className="absolute inset-x-0 top-[34%] -translate-y-1/2 text-center text-[13vw] leading-none font-medium tracking-[-0.04em] text-foreground/12"
      />
      <div className="absolute inset-x-0 top-[34%] h-px -translate-y-[7vw] bg-white/10" />
      <div className="absolute inset-x-0 top-[34%] h-px translate-y-[7vw] bg-white/10" />
      <div className="relative flex items-end justify-between gap-10">
        <div className="flex flex-col gap-5">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            <span className="size-1.5 bg-accent" /> Muriki · gestão de trabalho
          </span>
          <h1 className="max-w-[14ch] text-[56px] leading-[1.05] font-normal tracking-[-0.03em] text-foreground-strong">
            O trabalho do time, num lugar só.
          </h1>
        </div>
        <div className="flex max-w-[300px] flex-col gap-4 pb-2 text-[13px] leading-relaxed text-muted-foreground">
          <p>Tarefas, quadros e cobrança no mesmo lugar, com o que está travando à vista antes de travar.</p>
          <span className="text-foreground">↓ Role para ver</span>
        </div>
      </div>
    </section>
  )
}

/** Texto nítido no meio e desfocado nas pontas: duas cópias, máscaras opostas. */
function TituloDissolvido({ texto, className = "", style }: { texto: string; className?: string; style?: React.CSSProperties }) {
  const borda = "linear-gradient(to right, black 0%, transparent 22%, transparent 78%, black 100%)"
  const meio = "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)"
  return (
    <div className={className} style={style} aria-label={texto}>
      <div className="relative">
        <span aria-hidden className="block" style={{ maskImage: meio, WebkitMaskImage: meio }}>
          {texto}
        </span>
        <span aria-hidden className="absolute inset-0 block blur-[10px]" style={{ maskImage: borda, WebkitMaskImage: borda }}>
          {texto}
        </span>
      </div>
    </div>
  )
}

/** A frase que se revela palavra por palavra: desfocada e clara até a rolagem chegar nela. */
function Revelacao({ frase }: { frase: string }) {
  const ref = React.useRef<HTMLElement>(null)
  const y = useRolagem()
  const palavras = frase.split(" ")
  let progresso = 0
  if (ref.current) {
    const topo = ref.current.offsetTop
    const curso = ref.current.offsetHeight - innerHeight
    progresso = Math.min(1, Math.max(0, (y - topo) / curso))
  }
  const andou = progresso * (palavras.length + 2)
  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center px-8">
        <p className="max-w-[22ch] text-center text-[52px] leading-[1.18] font-normal tracking-[-0.025em]">
          {palavras.map((p, i) => {
            const t = Math.min(1, Math.max(0, andou - i))
            const daVez = t > 0 && t < 1
            return (
              <span
                key={i}
                style={{
                  filter: `blur(${(1 - t) * 8}px)`,
                  opacity: 0.16 + t * 0.84,
                  color: daVez ? "var(--primary)" : "var(--foreground-strong)",
                  transition: "color 200ms",
                }}
              >
                {p}{" "}
              </span>
            )
          })}
        </p>
      </div>
    </section>
  )
}

/** A cena do produto: o que fica atrás das camadas. Componentes reais. */
function Cena() {
  const col = (nome: string, cor: string, cards: { t: string; p: "urgent" | "high" | "medium" | "low" }[]) => (
    <div className="flex w-64 shrink-0 flex-col gap-2.5 rounded-[var(--radius)] bg-muted/50 p-3">
      <span className="flex items-center gap-2 px-1 font-mono text-[11px] tracking-[0.12em] uppercase">
        <span className="size-2 rounded-full" style={{ background: cor }} /> {nome}
      </span>
      {cards.map((c, i) => (
        <KanbanCard key={i} task={{ slug: `MUR-${nome.length * 7 + i}`, title: c.t, priority: c.p, progress: 20, timeLabel: `${i + 2}d`, statusId: nome }} />
      ))}
    </div>
  )
  return (
    <div className="absolute inset-0 flex flex-col gap-5 overflow-hidden bg-[oklch(0.94_0.02_85)] p-10">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Receita do mês" value="R$ 41.920" detail="recebido até hoje" trend={{ value: "+6,8%", direction: "up" }} />
        <MetricCard label="Tarefas abertas" value="128" detail="em 9 projetos" trend={{ value: "−12", direction: "down", good: true }} />
        <MetricCard label="Pessoas ativas" value="37" detail="de 40 no plano" live />
      </div>
      <div className="flex gap-4">
        {col("A fazer", "var(--tone-gray-dot)", [{ t: "Migrar webhooks do Stripe", p: "high" }, { t: "Atalho para nova tarefa", p: "low" }])}
        {col("Fazendo", "var(--tone-blue-dot)", [{ t: "Revisar o fluxo de cobrança", p: "urgent" }, { t: "Tela de membros", p: "medium" }])}
        {col("Revisão", "var(--tone-purple-dot)", [{ t: "Exportar relatório em PDF", p: "medium" }, { t: "Filtro por prazo", p: "low" }])}
        {col("Feito", "var(--tone-green-dot)", [{ t: "Onboarding do time", p: "low" }])}
      </div>
    </div>
  )
}

const CAMADAS = [
  { titulo: "Tarefas", texto: "A lista do time inteiro, com épicos, subtarefas, prazos e quem está em cada coisa.", tom: "blue" },
  { titulo: "Quadros", texto: "O kanban que mostra onde o trabalho parou, e há quanto tempo está parado.", tom: "purple" },
  { titulo: "Cobrança", texto: "Plano, membros e fatura no mesmo lugar, sem planilha do lado.", tom: "yellow" },
  { titulo: "Relatórios", texto: "Receita, ritmo e gargalo do mês, prontos para levar à reunião.", tom: "green" },
  { titulo: "Integrações", texto: "Stripe, GitHub e o resto do que o time já usa, conversando com o quadro.", tom: "orange" },
] as const

/** As camadas: faixas de vidro fosco sobre a cena. A ativa abre nítida. */
function Camadas() {
  const [ativa, setAtiva] = React.useState(0)
  const c = CAMADAS[ativa]
  return (
    <section className="flex flex-col">
      <div className="relative h-[78vh] overflow-hidden">
        <Cena />
        <div className="absolute inset-0 flex">
          {CAMADAS.map((cam, i) =>
            i === ativa ? (
              <div key={i} className="relative flex-1 transition-[flex] duration-500" />
            ) : (
              <button
                key={i}
                onClick={() => setAtiva(i)}
                className="relative flex w-[88px] shrink-0 flex-col items-center justify-end gap-3 pb-8 text-foreground-strong transition-[width] duration-500"
                style={{
                  background: `color-mix(in oklab, var(--tone-${cam.tom}) 45%, transparent)`,
                  backdropFilter: "blur(22px) saturate(1.3)",
                  WebkitBackdropFilter: "blur(22px) saturate(1.3)",
                  boxShadow: "inset 1px 0 0 oklch(1 0 0 / 0.35)",
                }}
              >
                <span className="text-[22px] font-light tabular-nums">{i + 1}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase [writing-mode:vertical-rl] rotate-180">{cam.titulo}</span>
              </button>
            )
          )}
        </div>
      </div>
      <div className="flex items-end justify-between gap-8 px-8 py-8">
        <div className="flex max-w-[560px] flex-col gap-2">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-warning uppercase">
            <span className="size-1.5 bg-warning" /> Camada {ativa + 1}
          </span>
          <h3 className="text-[26px] font-normal tracking-[-0.02em] text-foreground-strong">{c.titulo}</h3>
          <p className="text-[14px] leading-relaxed text-muted-foreground">{c.texto}</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
          <button onClick={() => setAtiva((ativa + CAMADAS.length - 1) % CAMADAS.length)}>Anterior</button>
          <span className="flex gap-1">
            {CAMADAS.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i === ativa ? "w-8 bg-foreground/50" : "w-1 bg-foreground/20"}`} />
            ))}
          </span>
          <button onClick={() => setAtiva((ativa + 1) % CAMADAS.length)}>Próxima</button>
        </div>
      </div>
    </section>
  )
}

/** O título grande, quente, com as pontas desfocadas, entrando com a rolagem. */
function Assinatura() {
  return (
    <section className="flex flex-col items-start gap-6 overflow-hidden px-8 py-28">
      <TituloDissolvido
        texto="Feito para times que entregam"
        className="text-[6.6vw] leading-none font-normal tracking-[-0.04em] whitespace-nowrap"
        style={{
          background: "linear-gradient(90deg, oklch(0.42 0.05 60), oklch(0.32 0.02 248.5) 55%, oklch(0.5 0.06 70))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      />
    </section>
  )
}

function Fim() {
  return (
    <section className="flex flex-col items-center gap-6 px-8 pt-10 pb-32 text-center">
      <div className="flex gap-2">
        <StatusPill status="doing" label="Em uso por 37 pessoas" />
        <Badge tone="yellow">Teste grátis de 14 dias</Badge>
      </div>
      <h2 className="max-w-[18ch] text-[40px] leading-[1.1] font-normal tracking-[-0.025em] text-foreground-strong">
        Traga o time. O quadro já está pronto.
      </h2>
      <div className="flex gap-2">
        <Button variant="solid" size="lg">
          Começar agora
        </Button>
        <Button size="lg">Falar com a gente</Button>
      </div>
    </section>
  )
}

function Entrada() {
  const y = useRolagem()
  const escuro = y < innerHeight - 64
  React.useLayoutEffect(() => {
    document.documentElement.classList.add("muriki-blur")
  }, [])
  return (
    <div className="bg-background text-foreground">
      <Nav escuro={escuro} />
      <Hero />
      <Revelacao frase="O Muriki junta tarefas, quadros e cobrança num lugar só, e mostra o que está travando antes de travar." />
      <Assinatura />
      <Camadas />
      <Fim />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<Entrada />)
