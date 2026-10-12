"use client"

/**
 * A prévia ao vivo do primeiro acesso (CA4b, CA4c): a janela do produto que está nascendo, montando-se
 * enquanto a pessoa preenche. Sem barra de endereço (o endereço fica só no campo do slug): no topo,
 * a logo da Muriki e o produto da escolha, Muriki Projects (`team`) ou Muriki Focus (`personal`);
 * logo abaixo, o nome do workspace em destaque e uma frase que diz o que nasce, com o @usuário.
 * Sem nome, o lugar do nome mostra apagado o mesmo exemplo do campo ("Acme Labs", "Meu espaço").
 *
 * A prévia não confere nada: mostra o `username` que receber. Quem a usa passa só o @ que pode
 * aparecer (o PlatformOnboardingIdentity passa o @ livre, verificando ou não conferido, nunca o
 * ocupado, o reservado ou o inválido); sem ele, a frase sai sem @ e o lugar "você" fica neutro.
 *
 * O resto são esqueletos sem nome (as funcionalidades não estão definidas e a prévia não promete
 * nada), com a anatomia do produto: colunas e lugares para o time no Projects, uma lista de tarefas
 * pessoais e o dia no Focus. No Focus não há lugares: é de uma pessoa só. As partes azuis (como o Pro de "Planos carregando") só ganham a cor quando o
 * nome chega: antes disso a janela é toda cinza, à espera. Esqueleto parado, sem a varredura do
 * Skeleton, porque aqui nada está carregando.
 *
 * O movimento responde a cada dado: as letras do nome entram uma a uma, a frase troca com um
 * cross-fade quando o @ aparece, e a troca Projects↔Focus sai e entra em sequência. Com
 * `prefers-reduced-motion`, tudo troca na hora, sem animação.
 *
 * A altura é a do conteúdo, medida pela altura da janela (`vh`): os painéis terminam onde o conteúdo
 * termina, sem fundo vazio, e encolhem nas telas baixas. Para não passar do palco, o pai limita a
 * altura (`max-h-full`); o que sobrar some por baixo, sem rolar.
 * É decorativa: `aria-hidden`, nada focável, sem clique. O leitor de tela já tem os campos.
 *
 * Com `people` (o passo de convidar, só no Projects), os lugares vazios viram você e quem está
 * chegando: as iniciais, com o anel tracejado de pendente, e embaixo do nome uma fileira com cada
 * pessoa e o papel (o cartão "Você" com `youRole`, padrão Owner). Quem chega entra com o mesmo
 * movimento; passando de três, as duas primeiras ficam e o resto vira "+N", igual nos lugares e na
 * fileira.
 *
 * A prévia viva: com o nome escrito, a janela ganha vida num loop calmo (ciclos de 6 a 9 s, com pausas).
 * Antes do nome ela fica parada, para não competir com as letras e o acender do azul; o primeiro
 * movimento espera essa reação assentar. No Projects, um cartão é erguido, desliza da primeira para a
 * segunda coluna e volta, e as colunas fecham e abrem o espaço (layout animation). No Focus, a
 * primeira tarefa é marcada (o check enche), desce para junto das feitas, e a feita mais antiga sai
 * enquanto uma nova chega. Nos dois há um cartão de "IA trabalhando": um esqueleto com uma faísca, um
 * brilho passando e as linhas se preenchendo uma a uma, sem texto. Os passos andam por um timer (o
 * setState fica no callback, nunca no corpo do efeito); o resto é animação declarativa. Com
 * `prefers-reduced-motion` nada disso anda: fica o quadro parado, com as linhas da IA a meio.
 */
import { useEffect, useState } from "react"
import { SparkleIcon } from "@phosphor-icons/react"
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Transition, type Variants } from "framer-motion"

import { MurikiLogo } from "@/components/ui/muriki-logo"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { workspaceNameExample } from "./workspace-form"

export type WorkspaceAudience = "team" | "personal"

/** O produto que cada escolha abre. Nome de marca: não traduz. */
export const AUDIENCE_PRODUCT: Record<WorkspaceAudience, string> = {
  team: "Muriki Projects",
  personal: "Muriki Focus",
}

// a curva de saída da casa (a do flyout e dos ícones do rail)
const SUAVE: Transition = { duration: 0.32, ease: [0.16, 1, 0.3, 1] }

/** Quem está chegando (o convidar): o nome de exibição e o papel, já traduzido. */
export interface WorkspacePreviewPerson {
  /** A chave estável (o e-mail, no convidar). Sem ela, vale o nome. */
  id?: string
  name: string
  role: string
}

// quantas pessoas cabem na fileira e nos lugares antes do "+N"
const VISIVEIS = 3

// passando de VISIVEIS, a última casa vira "+N": as mesmas pessoas nos lugares e na fileira
function visiveisDe(pessoas: WorkspacePreviewPerson[]) {
  return pessoas.length > VISIVEIS ? pessoas.slice(0, VISIVEIS - 1) : pessoas
}

export interface WorkspacePreviewProps {
  /** Para quem é: Muriki Projects (`team`) ou Muriki Focus (`personal`). */
  audience: WorkspaceAudience
  workspaceName: string
  /** O @ que pode aparecer (quem usa decide). Sem ele, a frase fica sem @ e o lugar "você", neutro. */
  username?: string
  /** Quem está chegando, no passo de convidar. Sem isto, os lugares do time ficam vazios. */
  people?: WorkspacePreviewPerson[]
  /** O papel de quem convida no cartão "Você", já traduzido. Padrão: Owner. */
  youRole?: string
  className?: string
}

export function WorkspacePreview({ audience, workspaceName, username, people, youRole, className }: WorkspacePreviewProps) {
  const t = useTranslate()
  const reduzir = useReducedMotion() ?? false
  const nome = workspaceName.trim()
  // o dado chegou: as partes azuis acendem
  const vivo = nome !== ""
  const frase = !vivo ? "empty" : `${audience}${username ? "_user" : ""}`
  // no convidar a frase conta quem chega (sem nome não há convidar)
  const chegando = audience === "team" && people ? people : undefined
  const chaveFrase = chegando && vivo ? "team_people" : frase

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
                {vivo ? <Letreiro texto={nome} reduzir={reduzir} /> : t(workspaceNameExample(audience))}
              </h2>
              <div className="grid min-h-10 text-[clamp(0.8125rem,1.7vh,0.9375rem)] leading-5 text-muted-foreground">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.p
                    key={chegando && vivo ? `people:${chegando.length}` : frase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="line-clamp-2 max-w-[52ch] text-pretty [grid-area:1/1]"
                  >
                    {chegando && vivo
                      ? t(`platform.identity.preview.${chaveFrase}`, { count: chegando.length })
                      : t(`platform.identity.preview.${frase}`, { username: `@${username}` })}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {audience === "team" ? (
                <Lugares key="lugares" voce={!!username} inicial={username?.[0]} chegando={chegando} />
              ) : null}
            </AnimatePresence>
          </div>

          {chegando ? <Time pessoas={chegando} inicial={username?.[0]} papel={youRole} /> : null}

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

/** Os lugares do time no canto: você (azul quando o @ aparece) e os lugares vazios de quem vem no
 * próximo passo. Só no Projects. No convidar, os vazios viram as iniciais de quem chega. */
function Lugares({ voce, inicial, chegando }: { voce: boolean; inicial?: string; chegando?: WorkspacePreviewPerson[] }) {
  const visiveis = chegando ? visiveisDe(chegando) : []
  const sobra = chegando ? chegando.length - visiveis.length : 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="mt-2 flex shrink-0 items-center"
    >
      {chegando ? (
        <>
          <Inicial letra={inicial} voce className="size-8 text-[13px]" />
          {/* ninguém ainda: os lugares vazios esperam quem você chamar */}
          {chegando.length === 0
            ? [0, 1, 2].map((i) => <span key={i} className="ml-2 size-8 rounded-full border-[1.5px] border-dashed border-input" />)
            : null}
          <AnimatePresence initial={false}>
            {visiveis.map((p) => (
              <motion.span key={p.id ?? p.name} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="ml-2 flex">
                <Inicial letra={p.name[0]} className="size-8 text-[13px]" />
              </motion.span>
            ))}
          </AnimatePresence>
          {sobra > 0 ? (
            <span className="ml-2 flex size-8 items-center justify-center rounded-full bg-sunken text-[12px] font-semibold text-muted-foreground tabular-nums">
              +{sobra}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span className={cn("size-8 rounded-full", azul(voce, true))} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="ml-1.5 size-8 rounded-full border-[1.5px] border-dashed border-input" />
          ))}
        </>
      )}
    </motion.div>
  )
}

/** A inicial de uma pessoa: você em azul cheio; quem foi convidado, azul claro com o anel tracejado de pendente. */
function Inicial({ letra, voce = false, className }: { letra?: string; voce?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold uppercase",
        voce
          ? "bg-primary text-primary-foreground"
          : "bg-[color-mix(in_oklab,var(--primary)_16%,var(--card))] text-primary-subtle-foreground outline-[1.5px] outline-offset-2 outline-primary/55 outline-dashed",
        className
      )}
    >
      {letra}
    </span>
  )
}

/** A fileira do time no convidar: você (com o seu papel) e quem chega, cada um com o papel; o resto vira "+N". */
function Time({ pessoas, inicial, papel }: { pessoas: WorkspacePreviewPerson[]; inicial?: string; papel?: string }) {
  const t = useTranslate()
  // a fileira nunca ganha uma segunda linha
  const visiveis = visiveisDe(pessoas)
  const sobra = pessoas.length - visiveis.length
  const cartao = "flex min-w-0 items-center gap-2.5 rounded-[10px] px-2.5 py-2"
  return (
    <div className="grid shrink-0 grid-cols-4 gap-2">
      <div className={cn(cartao, "bg-sunken/70")}>
        <Inicial letra={inicial} voce className="size-[26px] text-[11px]" />
        <Pessoa nome={t("platform.identity.preview.you")} papel={papel ?? t("platform.identity.preview.you_role")} />
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {visiveis.map((p) => (
          <motion.div
            key={p.id ?? p.name}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(cartao, "bg-sunken/45")}
          >
            <Inicial letra={p.name[0]} className="size-[26px] text-[11px]" />
            <Pessoa nome={p.name} papel={p.role} />
          </motion.div>
        ))}
      </AnimatePresence>
      {sobra > 0 ? (
        <div className={cn(cartao, "justify-center bg-sunken/45 text-[13px] font-medium text-muted-foreground")}>
          {t("platform.identity.preview.more", { count: sobra })}
        </div>
      ) : null}
    </div>
  )
}

function Pessoa({ nome, papel }: { nome: string; papel: string }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-[13px] leading-[17px] font-medium text-foreground-strong">{nome}</span>
      <span className="truncate text-[11.5px] leading-[15px] text-muted-foreground">{papel}</span>
    </span>
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
  const fase = useCiclo(ARRASTO, vivo && !reduzir) % ARRASTO.length
  // o cartão "b" vai para o topo da segunda coluna nas fases 2 a 4 e volta; erguido enquanto viaja
  const naSegunda = fase >= 2 && fase <= 4
  const erguido = fase === 1 || fase === 2 || fase === 4 || fase === 5
  const colunas = [
    { ids: naSegunda ? ["a", "c"] : ["a", "b", "c"], titulo: "w-16" },
    { ids: naSegunda ? ["b", "d", "e"] : ["d", "e"], titulo: "w-20" },
    { ids: ["f"], titulo: "w-12", ia: true },
  ]
  return (
    <motion.div
      variants={grupo}
      initial="oculto"
      animate="visivel"
      exit="saida"
      className="flex min-h-0 flex-col gap-[clamp(0.75rem,2vh,1.25rem)]"
    >
      <Faixa vivo={vivo} abas={["w-16", "w-12", "w-14"]} item={item} />
      {/* cada coluna termina no último cartão, como num quadro de verdade */}
      <div className="grid min-h-0 grid-cols-3 items-start gap-3">
        {colunas.map((coluna, c) => (
          <motion.div
            key={c}
            layout
            variants={item}
            transition={{ layout: MUDA }}
            // a coluna que leva o cartão erguido fica por cima da outra durante a viagem
            style={{ borderRadius: 12, zIndex: coluna.ids.includes("b") ? 1 : 0 }}
            className="relative flex min-h-0 flex-col gap-[clamp(0.5rem,1.4vh,0.75rem)] bg-sunken/55 p-2.5"
          >
            <motion.div layout="position" transition={{ layout: MUDA }} className="flex shrink-0 items-center gap-2 px-1 pt-0.5">
              <span className={cn("size-2 rounded-full", c === 0 ? azul(vivo, true) : "bg-input/70")} />
              <Barra className={coluna.titulo} />
              <span className="ml-auto h-4 w-5 rounded-full bg-card" />
            </motion.div>
            {coluna.ids.map((id) => {
              const [a, b] = CARTOES[id]
              const destaque = id === "a"
              const arrastado = id === "b"
              return (
                <motion.div
                  key={id}
                  layout="position"
                  layoutId={arrastado ? "arrastado" : undefined}
                  initial={false}
                  animate={
                    arrastado
                      ? { rotate: erguido ? 2.5 : 0, scale: erguido ? 1.035 : 1, boxShadow: erguido ? SOMBRA_ERGUIDO : SOMBRA_CARTAO }
                      : undefined
                  }
                  transition={{ layout: MUDA, default: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                  className={cn(
                    CARTAO,
                    !arrastado && "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
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
                </motion.div>
              )
            })}
            {coluna.ia ? (
              <div className={cn(CARTAO, "gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]")}>
                <Brilho animar={vivo && !reduzir} />
                <Faisca vivo={vivo} animar={vivo && !reduzir} />
                <LinhasIA larguras={["84%", "66%", "42%"]} vivo={vivo} animar={vivo && !reduzir} />
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const CARTAO =
  "relative flex h-[clamp(4.5rem,11vh,6.5rem)] shrink-0 flex-col gap-2 overflow-hidden rounded-[9px] bg-card p-[clamp(0.5rem,1.3vh,0.75rem)]"
// as linhas de cada cartão do quadro, pela chave estável
const CARTOES: Record<string, [string, string]> = {
  a: ["78%", "52%"],
  b: ["64%", "40%"],
  c: ["70%", "46%"],
  d: ["58%", "72%"],
  e: ["82%", "36%"],
  f: ["66%", "48%"],
}
// as duas sombras com o mesmo número de camadas, para o motion interpolar
const SOMBRA_CARTAO = "0 1px 2px rgba(0,0,0,0.05), 0 0 0 rgba(0,0,0,0)"
const SOMBRA_ERGUIDO = "0 2px 6px rgba(0,0,0,0.08), 0 14px 28px -8px rgba(0,0,0,0.22)"
// a mudança de lugar (o cartão viajando, a lista reordenando): devagar, sem pressa
const MUDA: Transition = { duration: 0.9, ease: [0.45, 0, 0.2, 1] }

// os passos da vida, em ms. Projects: parado, ergue, viaja, assenta na segunda; ergue, volta (≈ 8 s)
const ARRASTO = [2600, 450, 1000, 2600, 450, 1000] as const
// Focus: parado, o check enche, a tarefa desce (≈ 6,5 s)
const MARCAR = [2400, 1300, 2700] as const

/**
 * O relógio da prévia viva: um contador que anda um passo de cada vez, cada passo com a sua duração.
 * O setState fica no callback do timer, nunca síncrono no efeito. Desligado (sem nome ou com
 * movimento reduzido), o contador volta ao zero: o quadro parado.
 */
function useCiclo(duracoes: readonly number[], ativo: boolean) {
  const [passo, setPasso] = useState(0)
  useEffect(() => {
    if (!ativo) return
    let atual = 0
    let relogio: ReturnType<typeof setTimeout>
    const andar = () => {
      relogio = setTimeout(() => {
        atual += 1
        setPasso(atual)
        andar()
      }, duracoes[atual % duracoes.length])
    }
    andar()
    return () => {
      clearTimeout(relogio)
      setPasso(0)
    }
  }, [ativo, duracoes])
  return ativo ? passo : 0
}

// "IA trabalhando": as linhas enchem uma a uma, ficam, somem juntas e recomeçam. O quadro 0 é o
// parado (as primeiras cheias, a última vazia), então o loop começa e termina nele. 8 s por volta.
const IA_TEMPOS = [0, 0.04, 0.16, 0.62, 0.7, 0.71, 0.74, 0.8, 0.86, 0.92, 1]
const IA_ENCHE = [
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
  [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
]
const IA_SOME = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1]
const IA_VOLTA: Transition = { duration: 8, times: IA_TEMPOS, ease: "easeInOut", repeat: Infinity, delay: 1.2 }

/** As linhas do cartão da IA: um trilho apagado e, por cima, o preenchimento que cresce da esquerda. */
function LinhasIA({
  larguras,
  vivo,
  animar,
  fina = false,
  className,
}: {
  larguras: string[]
  vivo: boolean
  animar: boolean
  fina?: boolean
  className?: string
}) {
  // com duas linhas, valem as duas últimas da tabela
  const enche = IA_ENCHE.slice(IA_ENCHE.length - larguras.length)
  return (
    <div className={cn("flex min-w-0 flex-col", fina ? "gap-1.5" : "gap-2", className)}>
      {larguras.map((largura, i) => (
        <span key={largura} style={{ width: largura }} className={cn("block shrink-0 overflow-hidden rounded-full bg-sunken/45", fina ? "h-1.5" : "h-2")}>
          <motion.span
            initial={false}
            animate={animar ? { scaleX: enche[i], opacity: IA_SOME } : { scaleX: enche[i][0], opacity: 1 }}
            transition={animar ? IA_VOLTA : { duration: 0 }}
            className={cn("block h-full w-full origin-left rounded-full", azul(vivo))}
          />
        </span>
      ))}
    </div>
  )
}

/** O brilho que passa pelo cartão da IA, devagar e com pausa. */
function Brilho({ animar }: { animar: boolean }) {
  if (!animar) return null
  return (
    <motion.span
      initial={{ x: "-100%" }}
      animate={{ x: "260%" }}
      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.4, delay: 1.2 }}
      className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-primary/10 to-transparent"
    />
  )
}

/** A faísca da IA: azul com o nome, pulsando de leve. */
function Faisca({ vivo, animar, className }: { vivo: boolean; animar: boolean; className?: string }) {
  return (
    <motion.span
      initial={false}
      animate={animar ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1, 0.92] } : { opacity: 1, scale: 1 }}
      transition={animar ? { duration: 2.8, ease: "easeInOut", repeat: Infinity } : { duration: 0 }}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center transition-colors duration-500 motion-reduce:transition-none",
        vivo ? "text-primary/75" : "text-input",
        className
      )}
    >
      <SparkleIcon weight="fill" className="size-3.5" />
    </motion.span>
  )
}

/**
 * Muriki Focus: o trabalho de uma pessoa. À esquerda, a lista: em cima a linha da IA trabalhando,
 * depois as tarefas por fazer e, embaixo, a feita (em azul);
 * à direita, o anel do dia com o arco azul e a ação principal e, embaixo, a agenda de hoje. As duas
 * colunas têm a mesma altura, a da lista.
 */
// as tarefas, pela chave estável (o índice): a largura da linha de cada uma
const TAREFAS = ["68%", "54%", "76%", "44%", "60%", "50%"]
const LINHA =
  "flex h-[clamp(2.25rem,5.4vh,3rem)] shrink-0 items-center gap-3 rounded-[9px] bg-card px-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"

function Lista({ vivo, reduzir }: { vivo: boolean; reduzir: boolean }) {
  const { grupo, item } = variantes(reduzir)
  const animar = vivo && !reduzir
  const passo = useCiclo(MARCAR, animar)
  // a volta r: por fazer r+1..r+4, feita r. Na fase 1 o check de r+1 enche; na 2, r+1 desce para
  // junto das feitas. Na volta seguinte, r sai e r+5 chega: sempre seis linhas (com a da IA)
  const r = Math.floor(passo / MARCAR.length)
  const fase = passo % MARCAR.length
  const id = (n: number) => n % TAREFAS.length
  const porFazer = [1, 2, 3, 4].map((n) => id(r + n))
  const feitas = fase === 0 ? [id(r)] : [porFazer[0], id(r)]
  const ordem = fase === 2 ? [...porFazer.slice(1), porFazer[0], id(r)] : [...porFazer, id(r)]
  // o arco do anel: 38% da volta de um círculo de raio 42
  const volta = 2 * Math.PI * 42
  return (
    <motion.div
      variants={grupo}
      initial="oculto"
      animate="visivel"
      exit="saida"
      className="flex min-h-0 flex-col gap-[clamp(0.75rem,2vh,1.25rem)]"
    >
      <Faixa vivo={vivo} abas={["w-14", "w-10"]} item={item} />
      <div className="grid min-h-0 grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-3">
        <motion.div
          variants={item}
          className="relative flex min-h-0 flex-col gap-[clamp(0.375rem,1.1vh,0.625rem)] rounded-[12px] bg-sunken/55 p-2.5"
        >
          <div className="flex shrink-0 items-center gap-2 px-1 pt-0.5 pb-0.5">
            <span className={cn("size-2 rounded-full", azul(vivo, true))} />
            <Barra className="w-14" />
            <span className="ml-auto h-4 w-5 rounded-full bg-card" />
          </div>
          <div className={cn(LINHA, "relative overflow-hidden")}>
            <Brilho animar={animar} />
            <Faisca vivo={vivo} animar={animar} />
            <LinhasIA larguras={["62%", "38%"]} vivo={vivo} animar={animar} fina className="flex-1" />
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            {ordem.map((t) => {
              const feita = feitas.includes(t)
              return (
                <motion.div
                  key={t}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ layout: MUDA, default: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                  className={LINHA}
                >
                  {/* o check: a caixa vazia e, por cima, o azul que enche do meio */}
                  <span className="relative size-4 shrink-0 rounded-[5px] shadow-[inset_0_0_0_1.5px_var(--input)]">
                    <motion.span
                      initial={false}
                      animate={{ scale: feita ? 1 : 0, opacity: feita ? 1 : 0 }}
                      transition={{ duration: 0.45, ease: [0.34, 1.4, 0.64, 1] }}
                      className={cn("absolute inset-0 rounded-[5px]", azul(vivo, true))}
                    />
                  </span>
                  <Barra
                    largura={TAREFAS[t]}
                    className={cn("min-w-0 shrink transition-colors duration-500 motion-reduce:transition-none", feita && "bg-sunken/60")}
                  />
                  <span className={cn("ml-auto h-4 w-10 shrink-0 rounded-full", t === 2 ? azul(vivo) : "bg-sunken")} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={item} className="flex min-h-0 flex-col gap-3">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(0.75rem,2vh,1.125rem)] rounded-[12px] bg-sunken/55 p-4">
            <svg viewBox="0 0 100 100" className="aspect-square w-[min(70%,clamp(4.5rem,12vh,7.5rem))] -rotate-90">
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
          </div>
          {/* a agenda de hoje: duas horas marcadas, a primeira tingida */}
          <div className="flex shrink-0 flex-col gap-2 rounded-[12px] bg-sunken/55 p-2.5">
            <div className="flex items-center gap-2 px-1 pt-0.5">
              <span className="size-2 rounded-full bg-input/70" />
              <Barra className="w-12" />
            </div>
            {["62%", "48%"].map((largura, i) => (
              <div key={largura} className="flex h-7 items-center gap-2.5 rounded-[8px] bg-card px-2.5">
                <span className={cn("h-3.5 w-1 shrink-0 rounded-full", i === 0 ? azul(vivo, true) : "bg-sunken")} />
                <Barra largura={largura} className="min-w-0 shrink" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
