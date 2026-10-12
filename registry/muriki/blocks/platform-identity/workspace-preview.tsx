"use client"

/**
 * A prévia ao vivo do primeiro acesso (CA4b, CA4c): a janela do produto que está nascendo, montando-se
 * enquanto a pessoa preenche. Sem barra de endereço (o endereço fica só no campo do slug): no topo,
 * a logo da Muriki e o produto da escolha, Muriki Projects (`team`) ou Muriki Focus (`personal`);
 * logo abaixo, o nome do workspace em destaque e uma frase que diz o que nasce, com o @usuário.
 *
 * O resto são esqueletos sem nome (as funcionalidades não estão definidas e a prévia não promete
 * nada), com a anatomia do produto: colunas e lugares para o time no Projects, uma lista de tarefas
 * pessoais no Focus. As partes azuis (como o Pro de "Planos carregando") só ganham a cor quando o
 * nome chega: antes disso a janela é toda cinza, à espera. Esqueleto parado, sem a varredura do
 * Skeleton, porque aqui nada está carregando.
 *
 * O movimento responde a cada dado: as letras do nome entram uma a uma, a frase troca com um
 * cross-fade quando o @ aparece, e a troca Projects↔Focus sai e entra em sequência. Com
 * `prefers-reduced-motion`, tudo troca na hora, sem animação.
 *
 * Ocupa a altura que o pai der (`h-full`): os esqueletos se esticam e encolhem com ela, sem corte.
 * É decorativa: `aria-hidden`, nada focável, sem clique. O leitor de tela já tem os campos.
 */
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Transition, type Variants } from "framer-motion"

import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type WorkspaceAudience = "team" | "personal"

/** O produto que cada escolha abre. Nome de marca: não traduz. */
export const AUDIENCE_PRODUCT: Record<WorkspaceAudience, string> = {
  team: "Muriki Projects",
  personal: "Muriki Focus",
}

// a curva de saída da casa (a do flyout e dos ícones do rail)
const SUAVE: Transition = { duration: 0.32, ease: [0.16, 1, 0.3, 1] }

export interface WorkspacePreviewProps {
  /** Para quem é: Muriki Projects (`team`) ou Muriki Focus (`personal`). */
  audience: WorkspaceAudience
  workspaceName: string
  /** Sem ela, a frase fica sem @. */
  username?: string
  className?: string
}

export function WorkspacePreview({ audience, workspaceName, username, className }: WorkspacePreviewProps) {
  const t = useTranslate()
  const reduzir = useReducedMotion() ?? false
  const nome = workspaceName.trim()
  // o dado chegou: as partes azuis acendem
  const vivo = nome !== ""
  const frase = !vivo ? "empty" : `${audience}${username ? "_user" : ""}`

  return (
    <MotionConfig transition={reduzir ? { duration: 0 } : SUAVE}>
      <div
        aria-hidden
        data-slot="workspace-preview"
        data-audience={audience}
        className={cn(
          "pointer-events-none flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-float)] bg-card shadow-float ring-1 ring-border select-none",
          className
        )}
      >
        {/* a moldura da janela: os três pontos e, no meio, a marca e o produto */}
        <div className="relative flex h-11 shrink-0 items-center justify-center border-b border-divider px-4">
          <div className="absolute left-4 flex gap-1.5">
            <span className="size-2.5 rounded-full bg-sunken" />
            <span className="size-2.5 rounded-full bg-sunken" />
            <span className="size-2.5 rounded-full bg-sunken" />
          </div>
          <div className="flex items-center gap-2">
            <MurikiLogo className="size-5" />
            <span className="relative grid text-[13px] font-semibold text-foreground-strong">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={audience}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="whitespace-nowrap"
                >
                  {AUDIENCE_PRODUCT[audience]}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[clamp(1rem,2.6vh,1.75rem)] px-[clamp(1.25rem,2.2vw,2.25rem)] py-[clamp(1.1rem,3vh,2rem)]">
          {/* o nome em destaque, a frase e os lugares */}
          <div className="flex items-start gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h2
                className={cn(
                  "line-clamp-2 leading-[1.05] font-semibold tracking-[-0.035em] break-words",
                  [...nome].length > 26 ? "text-[clamp(1.4rem,3.4vh,2rem)]" : "text-[clamp(1.75rem,4.6vh,2.75rem)]",
                  vivo ? "text-foreground-strong" : "text-muted-foreground/45"
                )}
              >
                {vivo ? <Letreiro texto={nome} reduzir={reduzir} /> : t("platform.identity.preview.name_placeholder")}
              </h2>
              <div className="grid min-h-10 text-[clamp(0.8125rem,1.7vh,0.9375rem)] leading-5 text-muted-foreground">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.p
                    key={frase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="line-clamp-2 max-w-[52ch] text-pretty [grid-area:1/1]"
                  >
                    {t(`platform.identity.preview.${frase}`, { username: `@${username}` })}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <Lugares audience={audience} vivo={vivo} />
          </div>

          <AnimatePresence initial={false} mode="wait">
            {audience === "team" ? (
              <Quadro key="team" vivo={vivo} reduzir={reduzir} />
            ) : (
              <Lista key="personal" vivo={vivo} reduzir={reduzir} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  )
}

/** O nome, letra a letra: a letra nova entra subindo e saindo do desfoque; as que já estavam ficam. */
function Letreiro({ texto, reduzir }: { texto: string; reduzir: boolean }) {
  // as palavras não quebram no meio, a não ser que não caibam na linha (flex-wrap dentro da palavra)
  const palavras: { palavra: string; inicio: number }[] = []
  for (const palavra of texto.split(" ")) {
    const anterior = palavras.at(-1)
    palavras.push({ palavra, inicio: anterior ? anterior.inicio + [...anterior.palavra].length + 1 : 0 })
  }
  return (
    <>
      {palavras.map(({ palavra, inicio }, p) => (
        <span key={inicio} className="inline-flex max-w-full flex-wrap">
          {[...palavra].map((letra, j) => (
            <motion.span
              key={`${inicio + j}:${letra}`}
              initial={reduzir ? false : { opacity: 0, y: "0.3em", filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="inline-block"
            >
              {letra}
            </motion.span>
          ))}
          {p < palavras.length - 1 ? <span className="inline-block w-[0.26em]" /> : null}
        </span>
      ))}
    </>
  )
}

// a cor das partes azuis: tingidas com o dado, cinza antes dele. A troca é de cor, em CSS (o motion
// não interpola var()); `delay` escalona o acender
function azul(vivo: boolean, forte = false) {
  return cn(
    "transition-colors duration-500 motion-reduce:transition-none",
    vivo ? (forte ? "bg-primary/60" : "bg-primary/25") : "bg-sunken"
  )
}

/** Os lugares no canto: você (azul) e, no time, os lugares vazios de quem vem no próximo passo. */
function Lugares({ audience, vivo }: { audience: WorkspaceAudience; vivo: boolean }) {
  return (
    <div className="mt-2 flex shrink-0 items-center">
      <motion.span layout className={cn("size-8 rounded-full", azul(vivo, true))} />
      <AnimatePresence initial={false}>
        {audience === "team"
          ? [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                layout
                initial={{ opacity: 0, x: -10, scale: 0.6 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.06 * i } }}
                exit={{ opacity: 0, x: -10, scale: 0.6 }}
                className="ml-1.5 size-8 rounded-full border-[1.5px] border-dashed border-input"
              />
            ))
          : null}
      </AnimatePresence>
    </div>
  )
}

function variantes(reduzir: boolean): { grupo: Variants; item: Variants } {
  return {
    grupo: {
      oculto: { opacity: 0 },
      visivel: { opacity: 1, transition: reduzir ? { duration: 0 } : { staggerChildren: 0.05 } },
      saida: { opacity: 0, y: -10, transition: reduzir ? { duration: 0 } : { duration: 0.16 } },
    },
    item: {
      oculto: { opacity: 0, y: 14, scale: 0.97 },
      visivel: { opacity: 1, y: 0, scale: 1 },
    },
  }
}

function Barra({ largura, className }: { largura?: string; className?: string }) {
  return <span style={{ width: largura }} className={cn("block h-2 shrink-0 rounded-full bg-sunken", className)} />
}

// a faixa de cima: as abas (a primeira, a atual, em azul) e o botão principal, também azul
function Faixa({ vivo, abas, item }: { vivo: boolean; abas: string[]; item: Variants }) {
  return (
    <motion.div variants={item} className="flex shrink-0 items-center gap-2">
      {abas.map((largura, i) => (
        <span
          key={largura}
          style={{ transitionDelay: `${i * 60}ms` }}
          className={cn("h-6 rounded-[7px]", largura, i === 0 ? azul(vivo) : "bg-sunken")}
        />
      ))}
      <span style={{ transitionDelay: "200ms" }} className={cn("ml-auto h-7 w-24 rounded-[8px]", azul(vivo, true))} />
    </motion.div>
  )
}

/** Muriki Projects: colunas de cartões, com um cartão em destaque (o anel e o selo azuis). */
function Quadro({ vivo, reduzir }: { vivo: boolean; reduzir: boolean }) {
  const { grupo, item } = variantes(reduzir)
  const colunas = [
    { cartoes: [["78%", "52%"], ["64%", "40%"], ["70%", "46%"]], titulo: "w-16" },
    { cartoes: [["58%", "72%"], ["82%", "36%"]], titulo: "w-20" },
    { cartoes: [["66%", "48%"]], titulo: "w-12" },
  ]
  return (
    <motion.div
      variants={grupo}
      initial="oculto"
      animate="visivel"
      exit="saida"
      className="flex min-h-0 flex-1 flex-col gap-[clamp(0.75rem,2vh,1.25rem)]"
    >
      <Faixa vivo={vivo} abas={["w-16", "w-12", "w-14"]} item={item} />
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        {colunas.map((coluna, c) => (
          <motion.div
            key={c}
            variants={item}
            className="flex min-h-0 flex-col gap-[clamp(0.5rem,1.4vh,0.75rem)] rounded-[12px] bg-sunken/55 p-2.5"
          >
            <div className="flex shrink-0 items-center gap-2 px-1 pt-0.5">
              <span className={cn("size-2 rounded-full", c === 0 ? azul(vivo, true) : "bg-input/70")} />
              <Barra className={coluna.titulo} />
              <span className="ml-auto h-4 w-5 rounded-full bg-card" />
            </div>
            {coluna.cartoes.map(([a, b], i) => {
              const destaque = c === 0 && i === 0
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex max-h-28 min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[9px] bg-card p-[clamp(0.5rem,1.3vh,0.75rem)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                    destaque && vivo && "ring-1 ring-primary/60",
                    "transition-shadow duration-500 motion-reduce:transition-none"
                  )}
                >
                  {destaque ? (
                    <span className={cn("absolute top-0 right-0 h-3.5 w-12 rounded-bl-[7px]", azul(vivo))} />
                  ) : null}
                  <Barra largura={a} />
                  <Barra largura={b} className="bg-sunken/70" />
                  <div className="mt-auto flex items-center gap-1.5">
                    <span className={cn("size-4 rounded-full", destaque ? azul(vivo, true) : "bg-sunken")} />
                    <span className="h-1.5 w-8 rounded-full bg-sunken" />
                  </div>
                </div>
              )
            })}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Muriki Focus: o trabalho de uma pessoa. À esquerda, a lista de tarefas (a primeira feita, em azul);
 * à direita, o anel do dia com o arco azul e a ação principal.
 */
function Lista({ vivo, reduzir }: { vivo: boolean; reduzir: boolean }) {
  const { grupo, item } = variantes(reduzir)
  const tarefas = ["68%", "54%", "76%", "44%", "60%"]
  // o arco do anel: 38% da volta de um círculo de raio 42
  const volta = 2 * Math.PI * 42
  return (
    <motion.div
      variants={grupo}
      initial="oculto"
      animate="visivel"
      exit="saida"
      className="flex min-h-0 flex-1 flex-col gap-[clamp(0.75rem,2vh,1.25rem)]"
    >
      <Faixa vivo={vivo} abas={["w-14", "w-10"]} item={item} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-3">
        <motion.div
          variants={item}
          className="flex min-h-0 flex-col gap-[clamp(0.375rem,1.1vh,0.625rem)] rounded-[12px] bg-sunken/55 p-2.5"
        >
          <div className="flex shrink-0 items-center gap-2 px-1 pt-0.5 pb-0.5">
            <span className={cn("size-2 rounded-full", azul(vivo, true))} />
            <Barra className="w-14" />
            <span className="ml-auto h-4 w-5 rounded-full bg-card" />
          </div>
          {tarefas.map((largura, i) => {
            const feita = i === 0
            return (
              <div
                key={largura}
                className="flex max-h-14 min-h-0 flex-1 items-center gap-3 rounded-[9px] bg-card px-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <span
                  className={cn(
                    "size-4 shrink-0 rounded-[5px]",
                    feita ? azul(vivo, true) : "shadow-[inset_0_0_0_1.5px_var(--input)]"
                  )}
                />
                <Barra largura={largura} className={cn("min-w-0 shrink", feita && "bg-sunken/60")} />
                <span className={cn("ml-auto h-4 w-10 shrink-0 rounded-full", i === 1 ? azul(vivo) : "bg-sunken")} />
              </div>
            )
          })}
        </motion.div>
        <motion.div
          variants={item}
          className="flex min-h-0 flex-col items-center justify-center gap-[clamp(0.75rem,2vh,1.25rem)] rounded-[12px] bg-sunken/55 p-4"
        >
          <svg viewBox="0 0 100 100" className="aspect-square w-[min(70%,clamp(5rem,16vh,9rem))] -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-card" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${volta * 0.38} ${volta}`}
              className={cn(
                "transition-colors duration-500 motion-reduce:transition-none",
                vivo ? "stroke-primary/70" : "stroke-input/60"
              )}
            />
          </svg>
          <div className="flex w-full flex-col items-center gap-2">
            <Barra className="w-[55%]" />
            <Barra className="w-[38%] bg-sunken/70" />
          </div>
          <span className={cn("h-7 w-[60%] rounded-[8px]", azul(vivo))} />
        </motion.div>
      </div>
    </motion.div>
  )
}
