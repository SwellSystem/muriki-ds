/**
 * O palco da marca: as telas da entrada que ainda não têm um workspace para mostrar (o código por
 * e-mail e o convite inválido) põem no palco azul as janelas dos dois produtos, o Muriki Projects
 * atrás, à esquerda, e o Muriki Focus na frente, à direita, como o `palco_marca` do canvas.
 *
 * Só esqueleto: no lugar do nome do workspace, duas barras; sem nome de funcionalidade nem número.
 * As partes azuis já acesas, parado (nada está carregando nem nascendo aqui). A marca fica só na
 * barra do topo. Decorativo: `aria-hidden`, nada focável.
 */
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { AUDIENCE_PRODUCT, type WorkspaceAudience } from "@/components/blocks/platform-identity/workspace-preview"
import { cn } from "@/lib/utils"

// as partes azuis, no tom da prévia acesa (WorkspacePreview com o nome escrito)
const AZUL = "bg-primary/25"
const AZUL_FORTE = "bg-primary/60"

export function PlatformBrandStage({ className }: { className?: string }) {
  return (
    <div aria-hidden data-slot="platform-brand-stage" className={cn("pointer-events-none grid w-full max-w-[42rem] select-none", className)}>
      <Janela publico="team" className="mr-[18%] mb-[22%]" />
      <Janela publico="personal" className="mt-[22%] ml-[18%]" />
    </div>
  )
}

function Barra({ className }: { className?: string }) {
  return <span className={cn("block h-2 shrink-0 rounded-full bg-sunken", className)} />
}

/** Uma janela de produto reduzida: a moldura, a cabeça em esqueleto, a barra de ferramentas e o corpo. */
function Janela({ publico, className }: { publico: WorkspaceAudience; className?: string }) {
  const time = publico === "team"
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-float)] bg-card shadow-float ring-1 ring-border [grid-area:1/1]",
        // a da frente por cima da de trás
        time ? "z-0" : "z-10",
        className
      )}
    >
      <div className="relative flex h-8 shrink-0 items-center justify-center border-b border-divider px-3">
        <div className="absolute left-3 flex gap-1">
          <span className="size-1.5 rounded-full bg-sunken" />
          <span className="size-1.5 rounded-full bg-sunken" />
          <span className="size-1.5 rounded-full bg-sunken" />
        </div>
        <div className="flex items-center gap-1.5">
          <MurikiLogo className="size-3.5" />
          <span className="text-[13px] font-semibold whitespace-nowrap text-foreground-strong">{AUDIENCE_PRODUCT[publico]}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        {/* no lugar do nome do workspace e da frase, duas barras */}
        <div className="flex flex-col gap-2.5">
          <Barra className="h-4 w-[38%] rounded-[6px]" />
          <Barra className="h-1.5 w-[58%] bg-sunken/70" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-4 w-10 rounded-[5px]", AZUL)} />
          <span className="h-4 w-7 rounded-[5px] bg-sunken" />
          {time ? <span className="h-4 w-9 rounded-[5px] bg-sunken" /> : null}
          <span className={cn("ml-auto h-4 w-16 rounded-[6px]", AZUL_FORTE)} />
        </div>
        {time ? <Quadro /> : <Lista />}
      </div>
    </div>
  )
}

const CARTAO = "flex flex-col gap-1.5 rounded-[7px] bg-card p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"

/** O Projects: três colunas de cartões; o primeiro com a orelha azul. */
function Quadro() {
  return (
    <div className="grid grid-cols-3 items-start gap-2">
      {[3, 2, 2].map((cartoes, c) => (
        <div key={c} className="flex flex-col gap-1.5 rounded-[9px] bg-sunken/55 p-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className={cn("size-1.5 rounded-full", c === 0 ? AZUL_FORTE : "bg-input/70")} />
            <Barra className="h-1.5 w-10" />
          </div>
          {Array.from({ length: cartoes }, (_, i) => {
            const destaque = c === 0 && i === 0
            return (
              <div key={i} className={cn(CARTAO, "relative h-12 overflow-hidden", destaque && "ring-1 ring-primary/55")}>
                {destaque ? <span className={cn("absolute top-0 right-0 h-2 w-8 rounded-bl-[5px]", AZUL)} /> : null}
                <Barra className="h-1.5 w-[80%]" />
                <Barra className="h-1.5 w-[50%] bg-sunken/70" />
                <span className={cn("mt-auto size-2.5 rounded-full", destaque ? AZUL_FORTE : "bg-sunken")} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** O Focus: a lista de tarefas, com a última marcada em azul, e o dia ao lado. */
function Lista() {
  return (
    <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-2">
      <div className="flex flex-col gap-1.5 rounded-[9px] bg-sunken/55 p-1.5">
        <div className="flex items-center gap-1.5 px-0.5">
          <span className={cn("size-1.5 rounded-full", AZUL_FORTE)} />
          <Barra className="h-1.5 w-10" />
        </div>
        {["72%", "58%", "80%", "46%", "64%"].map((largura, i) => (
          <div key={largura} className="flex h-6 items-center gap-2 rounded-[6px] bg-card px-2">
            <span className={cn("size-2.5 shrink-0 rounded-[3px]", i === 4 ? AZUL_FORTE : "shadow-[inset_0_0_0_1px_var(--input)]")} />
            <span style={{ width: largura }} className="block h-1.5 rounded-full bg-sunken" />
            <span className={cn("ml-auto h-2.5 w-6 shrink-0 rounded-full", i === 2 ? AZUL : "bg-sunken")} />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-2.5 rounded-[9px] bg-sunken/55 p-3">
        <svg viewBox="0 0 100 100" className="aspect-square w-[45%] -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-card" />
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" pathLength={100} strokeDasharray="38 100" className="stroke-primary/60" />
        </svg>
        <Barra className="h-1.5 w-[60%]" />
        <span className={cn("h-3.5 w-[60%] rounded-[5px]", AZUL)} />
      </div>
    </div>
  )
}
