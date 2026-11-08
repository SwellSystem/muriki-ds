import * as React from "react"
import { createRoot } from "react-dom/client"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Check, CircleNotch, Moon, Sun, X } from "@phosphor-icons/react"

import { MurikiLogo } from "@/components/ui/muriki-logo"
import { Button } from "@/components/ui/button"
import { ViewToggle } from "@/components/ui/view-toggle"
import { LanguageSwitcher } from "@/components/blocks/language-switcher/language-switcher"
import { InviteForm, SeatsPreview, type InviteRow } from "@/components/blocks/platform-members/invite-form"

/* O primeiro acesso do Platform no DS novo (o motion com desfoque, a
   revelação, a forma). O fluxo é o do registry, como é: (1) o @usuário e
   os termos, (2) o workspace de equipe, opcional, (3) convidar, que só
   aparece se a equipe foi criada. Pular a equipe leva direto ao fim.

   Recusado até aqui: stepper em faixas (faixas não são para tudo); coluna,
   palco e o formulário numa placa na frente de um app falso desfocado (o
   app falso atrapalha e promete um layout que não é o do sistema). O erro
   foi a composição: o formulário de sempre numa caixa.

   Agora, sem caixa e sem stepper, dois jeitos (painel do canto):
   · O mascote conduz — o Muriki pergunta, a resposta é digitada como texto
     grande e vira um recibo; ele pisca, fecha os olhos enquanto confere e
     balança quando algo não serve. Um toque no recibo volta.
   · A frase se completa — uma frase grande que se revela palavra por
     palavra e recebe o que a pessoa digita; a próxima oração aparece
     desfocada como pista. Um toque num valor azul volta.
   Cada um com o seu celular (painel: Web | Celular, moldura de 390).

   Peças copiadas do faixas.tsx (o estudo monta a página sozinho). */

const CURVA = [0.16, 1, 0.3, 1] as [number, number, number, number]
const CHEGADA = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
const troca = {
  initial: { opacity: 0, filter: "blur(14px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } },
  exit: { opacity: 0, filter: "blur(14px)", y: -10 },
  transition: { duration: 0.42, ease: CURVA },
}
const placa = (fundo = "var(--ds-placa-1)") => ({
  background: fundo,
  backdropFilter: "blur(30px) saturate(1.3)",
  WebkitBackdropFilter: "blur(30px) saturate(1.3)",
  boxShadow: "inset 0 0 0 1px var(--ds-fio)",
})
function Atmosfera() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[var(--ds-chao)]">
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

function Avatar({ iniciais, tom, pequeno = false }: { iniciais: string; tom?: string; pequeno?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-mono ring-1 ring-[var(--ds-fio)] ${pequeno ? "size-7 text-[10px]" : "size-8 text-[10.5px]"}`}
      style={tom ? { background: `var(--tone-${tom})`, color: `var(--tone-${tom}-foreground)` } : { background: "var(--ds-placa-2)", color: "var(--ds-tinta)" }}
    >
      {iniciais}
    </span>
  )
}

/** O texto que muda chega desfocado (o nome na prévia, o resumo da faixa). */
function Chega({ texto, className, style }: { texto: string; className?: string; style?: React.CSSProperties }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={texto} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA} className={className} style={style}>
        {texto}
      </motion.span>
    </AnimatePresence>
  )
}

/** O botão: com `carregando`, o texto sai desfocado e o giro entra. */
function Botao({ children, solido = false, fantasma = false, desligado = false, carregando = false, responsivo = false, submit = false, onClick }: { children: React.ReactNode; solido?: boolean; fantasma?: boolean; desligado?: boolean; carregando?: boolean; responsivo?: boolean; submit?: boolean; onClick?: () => void }) {
  return (
    <button
      type={submit ? "submit" : "button"}
      disabled={submit && (desligado || carregando)}
      onClick={() => !desligado && !carregando && onClick?.()}
      aria-disabled={desligado || carregando}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[14px] whitespace-nowrap transition-[background-color,box-shadow,transform,opacity] duration-300 active:scale-[0.98] ${responsivo ? "max-md:h-12 max-md:w-full" : ""}`}
      style={{
        opacity: desligado ? 0.45 : 1,
        cursor: desligado ? "not-allowed" : "pointer",
        ...(solido
          ? { background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: desligado ? "none" : "0 8px 22px -8px color-mix(in oklab, var(--primary) 60%, transparent)" }
          : fantasma
            ? { color: "var(--ds-tinta-2)" }
            : { background: "var(--ds-placa-2)", color: "var(--ds-tinta)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }),
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={carregando ? "giro" : "texto"} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.25, ease: CURVA }} className="flex items-center gap-2">
          {carregando ? <CircleNotch size={18} className="animate-spin" /> : children}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function Marca({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={() => onChange(!on)} className="flex items-start gap-2.5 text-left text-[13.5px] leading-5" style={{ color: "var(--ds-tinta-2)" }}>
      <span className="mt-px grid size-[18px] shrink-0 place-items-center rounded-[5px] transition-[background-color,box-shadow] duration-200" style={on ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1.5px var(--ds-fio-forte)" }}>
        <AnimatePresence initial={false}>
          {on ? (
            <motion.span initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} transition={{ duration: 0.25, ease: CURVA }}>
              <Check size={12} weight="bold" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span>{children}</span>
    </button>
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
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center">
      <AnimatePresence>
        {texto ? (
          <motion.div key={texto} initial={{ opacity: 0, y: 16, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 8, filter: "blur(12px)" }} transition={{ duration: 0.45, ease: CURVA }} className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-[14px]" style={{ ...placa("var(--ds-placa-forte)"), boxShadow: "inset 0 0 0 1px var(--ds-fio), 0 24px 50px -20px var(--ds-sombra)", color: "var(--ds-tinta-forte)" }}>
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

// ── o fluxo (o mesmo nas três opções) ────────────────────────────────────

type Estado = "vazio" | "curto" | "formato" | "verificando" | "livre" | "ocupado" | "reservado"
type Papel = "maintainer" | "member" | "guest"
interface Convite {
  id: number
  email: string
  papel: Papel
}

const CONTA = { nome: "Guilherme Teodoro", iniciais: "GT", email: "guilherme@muriki.com" } // do cadastro (POST /auth/sign-up)
const USUARIOS_OCUPADOS = ["guilherme", "ana", "rafael"]
const RESERVADOS = ["admin", "muriki", "suporte"]
const ENDERECOS_OCUPADOS = ["acme", "muriki-labs"]
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())
const slugDe = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)

/** O @usuário e o endereço passam pela mesma conferência: o formato na
    hora, e "está livre?" depois de uma pausa na digitação. */
function useConferir(valor: string, formato: RegExp, ocupados: string[]) {
  const [estado, setEstado] = React.useState<Estado>("vazio")
  React.useEffect(() => {
    if (!valor) return setEstado("vazio")
    if (valor.length < 3) return setEstado("curto")
    if (!formato.test(valor)) return setEstado("formato")
    setEstado("verificando")
    const t = setTimeout(() => setEstado(RESERVADOS.includes(valor) ? "reservado" : ocupados.includes(valor) ? "ocupado" : "livre"), 650)
    return () => clearTimeout(t)
  }, [valor, formato, ocupados])
  return estado
}

const FORMATO_USUARIO = /^[a-z][a-z0-9]*([._][a-z0-9]+)*$/
const FORMATO_ENDERECO = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

function useFluxo() {
  const h = location.hash
  // #p2, #p3 e #pronto abrem o fluxo já adiantado, com o que veio antes preenchido
  const adiante = h.includes("pronto") ? 3 : h.includes("p3") ? 2 : h.includes("p2") ? 1 : 0
  const [passo, setPasso] = React.useState(adiante)
  const [usuario, setUsuario] = React.useState(adiante ? "guilherme.t" : "")
  const [termos, setTermos] = React.useState(adiante > 0)
  const [nome, setNome] = React.useState(adiante > 1 ? "Acme Labs" : "")
  const [endereco, setEndereco] = React.useState<string | null>(null)
  const [pulouEquipe, setPulouEquipe] = React.useState(false)
  const [convites, setConvites] = React.useState<Convite[]>(
    adiante > 2
      ? [
          { id: 1, email: "ana@acmelabs.com", papel: "maintainer" },
          { id: 2, email: "rafael@acmelabs.com", papel: "member" },
        ]
      : [{ id: 1, email: "", papel: "member" }]
  )
  const [pulouConvite, setPulouConvite] = React.useState(false)
  const [entrou, setEntrou] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)

  const slug = endereco ?? slugDe(nome)
  const estUsuario = useConferir(usuario, FORMATO_USUARIO, USUARIOS_OCUPADOS)
  const estEndereco = useConferir(slug, FORMATO_ENDERECO, ENDERECOS_OCUPADOS)
  const validos = convites.filter((c) => emailOk(c.email))

  const prontoPasso = [estUsuario === "livre" && termos, nome.trim().length > 0 && estEndereco === "livre", validos.length > 0]
  // o quanto do passo da vez já está preenchido, de 0 a 1 (o stepper B enche com isto)
  const preenchido = [((estUsuario === "livre" ? 1 : 0) + (termos ? 1 : 0)) / 2, ((nome.trim() ? 1 : 0) + (estEndereco === "livre" ? 1 : 0)) / 2, validos.length ? 1 : 0, 1]

  function avancar(para: number) {
    setEnviando(true)
    setTimeout(() => {
      setEnviando(false)
      setPasso(para)
    }, 700)
  }

  return {
    passo,
    setPasso,
    usuario,
    setUsuario: (v: string) => setUsuario(v.toLowerCase().replace(/\s/g, "")),
    estUsuario,
    termos,
    setTermos,
    nome,
    setNome,
    slug,
    setEndereco: (v: string) => setEndereco(v.toLowerCase().replace(/\s/g, "-")),
    estEndereco,
    convites,
    setConvites,
    validos,
    pulouEquipe,
    pulouConvite,
    enviando,
    entrou,
    entrar: () => setEntrou(true),
    prontoPasso,
    preenchido,
    enviar: () => {
      if (!prontoPasso[passo] || enviando) return
      if (passo === 1) setPulouEquipe(false)
      if (passo === 2) setPulouConvite(false)
      avancar(passo + 1)
    },
    enviarConvites: () => {
      setPulouConvite(false)
      avancar(3)
    },
    pularEquipe: () => {
      setPulouEquipe(true)
      setPasso(3)
    },
    pularConvite: () => {
      setPulouConvite(true)
      setPasso(3)
    },
    recomecar: () => {
      setPasso(0)
      setUsuario("")
      setTermos(false)
      setNome("")
      setEndereco(null)
      setConvites([{ id: 1, email: "", papel: "member" }])
      setPulouEquipe(false)
      setPulouConvite(false)
      setEntrou(false)
    },
  }
}
type Fluxo = ReturnType<typeof useFluxo>

const PASSOS = [
  { nome: "Seu espaço", obrigatorio: true, titulo: "Crie o seu espaço", sub: "Ele nasce com o seu nome e o seu @usuário. Um workspace de equipe vem depois, se você quiser." },
  { nome: "Equipe", obrigatorio: false, titulo: "Crie um workspace de equipe", sub: "Para trabalhar com outras pessoas. É opcional: o seu espaço pessoal já está pronto." },
  { nome: "Convites", obrigatorio: false, titulo: "Chame o seu time", sub: "Quem entrar já chega com o papel certo. Dá para fazer depois, em Membros." },
]

const situacaoDe = (f: Fluxo, i: number) => (f.passo > i ? ((i === 1 && f.pulouEquipe) || (i === 2 && (f.pulouEquipe || f.pulouConvite)) ? "pulado" : "feito") : f.passo === i ? "agora" : "depois")

function linhaUsuario(f: Fluxo) {
  const e = f.estUsuario
  if (e === "vazio") return { texto: "De 3 a 30 caracteres: letras, números, ponto e sublinhado.", tom: "neutro" as const }
  if (e === "curto") return { texto: "Use pelo menos 3 caracteres.", tom: "erro" as const }
  if (e === "formato") return { texto: "Comece com uma letra. Ponto e sublinhado só entre letras ou números.", tom: "erro" as const }
  if (e === "verificando") return { texto: "Verificando se está livre…", tom: "neutro" as const, girando: true }
  if (e === "ocupado") return { texto: "Esse @usuário já é de outra pessoa.", tom: "erro" as const }
  if (e === "reservado") return { texto: "Esse @usuário é reservado. Escolha outro.", tom: "erro" as const }
  return { texto: `@${f.usuario} está livre.`, tom: "bom" as const }
}
function linhaEndereco(f: Fluxo) {
  const e = f.estEndereco
  if (e === "vazio") return { texto: "De 3 a 40 caracteres: letras, números e hífen.", tom: "neutro" as const }
  if (e === "curto") return { texto: "Use pelo menos 3 caracteres.", tom: "erro" as const }
  if (e === "formato") return { texto: "Comece com uma letra. O hífen só entre letras ou números.", tom: "erro" as const }
  if (e === "verificando") return { texto: "Verificando se está livre…", tom: "neutro" as const, girando: true }
  if (e === "ocupado") return { texto: "Esse endereço já é de outro workspace.", tom: "erro" as const }
  if (e === "reservado") return { texto: "Esse endereço é reservado. Escolha outro.", tom: "erro" as const }
  return { texto: "Endereço livre.", tom: "bom" as const }
}
const erroDe = (e: Estado) => e === "curto" || e === "formato" || e === "ocupado" || e === "reservado"

const PAPEIS: { v: Papel; rotulo: string }[] = [
  { v: "maintainer", rotulo: "Maintainer" },
  { v: "member", rotulo: "Member" },
  { v: "guest", rotulo: "Guest" },
]

// ── peças das duas opções ────────────────────────────────────────────────

/** O texto que se revela palavra por palavra, cada uma chegando desfocada
    (a revelação da rivio). `atraso` empurra o começo. */
function Revela({ texto, atraso = 0, passo = 0.045 }: { texto: string; atraso?: number; passo?: number }) {
  return (
    <>
      {texto.split(" ").map((p, i) => (
        <motion.span key={`${p}-${i}`} className="inline-block whitespace-pre" initial={{ opacity: 0, filter: "blur(10px)", y: 6 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.5, ease: CURVA, delay: atraso + i * passo }}>
          {p + " "}
        </motion.span>
      ))}
    </>
  )
}

/** Um campo que é texto: sem caixa, do tamanho do que se digita, com um fio
    embaixo que acende em azul no foco. Mede pela sombra invisível do texto. */
function CampoTexto({ valor, onChange, placeholder, prefixo, erro = false, autoFocus = false, onEnter, className = "" }: { valor: string; onChange: (v: string) => void; placeholder: string; prefixo?: string; erro?: boolean; autoFocus?: boolean; onEnter?: () => void; className?: string }) {
  const [foco, setFoco] = React.useState(false)
  return (
    <span className={`relative inline-flex items-baseline ${className}`}>
      {prefixo ? <span style={{ color: "var(--ds-tinta-2)" }}>{prefixo}</span> : null}
      <span className="relative inline-block">
        <span aria-hidden className="invisible whitespace-pre">{valor || placeholder}</span>
        <input
          value={valor}
          placeholder={placeholder}
          autoFocus={autoFocus}
          spellCheck={false}
          autoCapitalize="none"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
          className="absolute inset-0 w-full min-w-[1ch] bg-transparent outline-none placeholder:text-[var(--ds-fio-forte)]"
          style={{ color: erro ? "var(--destructive)" : "var(--primary)", font: "inherit", letterSpacing: "inherit" }}
        />
      </span>
      <motion.span aria-hidden className="absolute right-0 -bottom-1 left-0 h-[2px] origin-left rounded-full" initial={false} animate={{ scaleX: foco || valor ? 1 : 0.35, opacity: foco ? 1 : 0.5 }} transition={{ duration: 0.4, ease: CURVA }} style={{ background: erro ? "var(--destructive)" : foco ? "var(--primary)" : "var(--ds-fio-forte)", boxShadow: foco ? "0 0 12px color-mix(in oklab, var(--primary) 45%, transparent)" : "none" }} />
    </span>
  )
}

/** A linha de estado embaixo de um campo (verificando, livre, ocupado),
    trocando pelo desfoque com a saída curta. */
function Estado({ linha }: { linha: { texto: string; tom: "neutro" | "bom" | "erro"; girando?: boolean } }) {
  const cor = linha.tom === "erro" ? "var(--destructive)" : linha.tom === "bom" ? "var(--success)" : "var(--ds-tinta-2)"
  return (
    <span className="block min-h-[20px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={linha.texto} initial={{ opacity: 0, filter: "blur(6px)", y: -3 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.18 } }} transition={{ duration: 0.35, ease: CURVA }} className="flex items-center gap-1.5 text-[13px] leading-5" style={{ color: cor }}>
          {linha.girando ? <CircleNotch size={12} className="animate-spin" /> : linha.tom === "bom" ? <Check size={12} weight="bold" /> : null}
          {linha.texto}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** O botão de seguir, que no celular fica preso embaixo, na largura toda. */
function Seguir({ children, desligado, carregando, onClick, extra, submit = false }: { children: React.ReactNode; desligado?: boolean; carregando?: boolean; onClick?: () => void; extra?: React.ReactNode; submit?: boolean }) {
  return (
    <div className="flex flex-col gap-1 max-md:sticky max-md:bottom-0 max-md:-mx-4 max-md:mt-auto max-md:px-4 max-md:pt-6 max-md:pb-[max(16px,env(safe-area-inset-bottom))] max-md:bg-[linear-gradient(to_top,var(--ds-chao)_72%,transparent)] md:flex-row md:items-center md:gap-3">
      <Botao solido responsivo submit={submit} desligado={desligado} carregando={carregando} onClick={onClick}>
        {children}
      </Botao>
      {extra}
    </div>
  )
}

// ── Opção 1 · o mascote conduz ───────────────────────────────────────────

/** O Muriki: pisca sozinho de vez em quando, fecha os olhos enquanto
    "pensa" (verificando), dá um pulinho quando fala, e balança quando algo
    não serve. */
function Mascote({ pensando = false, falou, nao = false, tamanho = 44 }: { pensando?: boolean; falou: string | number; nao?: boolean; tamanho?: number }) {
  const [piscou, setPiscou] = React.useState(false)
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const ciclo = () => {
      t = setTimeout(() => {
        setPiscou(true)
        setTimeout(() => setPiscou(false), 140)
        ciclo()
      }, 2600 + Math.random() * 2600)
    }
    ciclo()
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.span key={`${falou}-${nao}`} className="inline-block shrink-0" initial={nao ? { x: 0 } : { y: 0, scale: 0.96 }} animate={nao ? { x: [0, -5, 5, -3, 3, 0] } : { y: [0, -6, 0], scale: 1 }} transition={{ duration: nao ? 0.45 : 0.5, ease: CURVA }}>
      <MurikiLogo eyes={pensando || piscou ? "closed" : "open"} style={{ width: tamanho, height: tamanho }} />
    </motion.span>
  )
}

/** Uma fala do Muriki: o mascote à esquerda e o texto se revelando. As
    falas antigas ficam mais claras, não desfocadas (parado é nítido). */
function Fala({ texto, antiga = false, mascote }: { texto: string; antiga?: boolean; mascote?: React.ReactNode }) {
  return (
    <div className="flex gap-3.5 md:gap-4" style={{ opacity: antiga ? 0.5 : 1, transition: "opacity 0.5s" }}>
      <span className="w-9 shrink-0 pt-0.5 md:w-11">{mascote}</span>
      <p className="text-[20px] leading-[1.35] font-light tracking-[-0.015em] md:text-[24px]" style={{ color: "var(--ds-tinta-forte)" }}>
        {antiga ? texto : <Revela texto={texto} />}
      </p>
    </div>
  )
}

/** A resposta já dada: um recibo à direita, em mono, que assenta desfocado.
    Um toque volta para aquele passo. */
function Recibo({ children, voltar }: { children: React.ReactNode; voltar: () => void }) {
  return (
    <motion.button type="button" onClick={voltar} initial={{ opacity: 0, filter: "blur(10px)", y: 8 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.5, ease: CURVA }} className="group flex items-center gap-2 self-end rounded-full py-2 pr-2 pl-3.5 font-mono text-[12px] tracking-[0.04em]" style={{ background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1px var(--ds-fio)", color: "var(--ds-tinta-forte)" }}>
      {children}
      <span className="grid size-6 place-items-center rounded-full transition-colors" style={{ background: "var(--tone-blue)", color: "var(--tone-blue-foreground)" }}>
        <Check size={11} weight="bold" />
      </span>
    </motion.button>
  )
}

function OpcaoMascote({ f, avisar }: { f: Fluxo; avisar: (t: string) => void }) {
  const [querEquipe, setQuerEquipe] = React.useState<boolean | null>(f.passo > 1 ? true : null)
  const fim = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [f.passo, querEquipe])
  const primeiro = CONTA.nome.split(" ")[0]
  const pensando = (f.passo === 0 && f.estUsuario === "verificando") || (f.passo === 1 && f.estEndereco === "verificando") || f.enviando
  const nao = (f.passo === 0 && erroDe(f.estUsuario) && f.estUsuario !== "curto") || (f.passo === 1 && erroDe(f.estEndereco) && f.estEndereco !== "curto")
  const daVez = (i: number) => f.passo === i
  const mascote = <Mascote pensando={pensando} nao={nao} falou={`${f.passo}-${querEquipe}`} />

  const falaEquipe = "Pronto, o seu espaço pessoal já existe. Você trabalha com um time?"
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col gap-7 px-4 pt-24 pb-6 md:gap-8 md:pt-[16vh] md:pb-24">
      {/* 1 · o @usuário */}
      <Fala texto={`Oi, ${primeiro}. Eu sou o Muriki. Vamos montar o seu espaço: como o time vai te chamar aqui?`} antiga={!daVez(0)} mascote={daVez(0) ? mascote : <MurikiLogo className="size-9 md:size-11" />} />
      {daVez(0) ? (
        <motion.div {...troca} className="flex flex-1 flex-col gap-5 pl-[50px] md:flex-none md:pl-[60px]">
          <div className="flex flex-col gap-2">
            <CampoTexto prefixo="@" valor={f.usuario} onChange={f.setUsuario} placeholder="seu.nome" erro={erroDe(f.estUsuario)} autoFocus onEnter={f.enviar} className="text-[28px] font-light tracking-[-0.02em] md:text-[34px]" />
            <Estado linha={linhaUsuario(f)} />
          </div>
          <Marca on={f.termos} onChange={f.setTermos}>
            Li e aceito os <span style={{ color: "var(--ds-tinta-forte)" }}>termos de uso</span> e a <span style={{ color: "var(--ds-tinta-forte)" }}>política de privacidade</span>.
          </Marca>
          <Seguir desligado={!f.prontoPasso[0]} carregando={f.enviando} onClick={f.enviar}>
            Esse sou eu <ArrowRight size={14} />
          </Seguir>
        </motion.div>
      ) : (
        <Recibo voltar={() => f.setPasso(0)}>@{f.usuario} · termos aceitos</Recibo>
      )}

      {/* 2 · a equipe */}
      {f.passo >= 1 ? <Fala texto={falaEquipe} antiga={!daVez(1)} mascote={daVez(1) ? mascote : <MurikiLogo className="size-9 md:size-11" />} /> : null}
      {daVez(1) ? (
        <motion.div {...troca} className="flex flex-1 flex-col gap-5 pl-[50px] md:flex-none md:pl-[60px]">
          <AnimatePresence mode="wait" initial={false}>
            {querEquipe ? (
              <motion.div key="nome" {...troca} className="flex flex-1 flex-col gap-5">
                <p className="text-[15px]" style={{ color: "var(--ds-tinta-2)" }}>
                  <Revela texto="Que bom. Como ele se chama?" />
                </p>
                <div className="flex flex-col gap-2">
                  <CampoTexto valor={f.nome} onChange={f.setNome} placeholder="Acme Labs" autoFocus onEnter={f.enviar} className="text-[28px] font-light tracking-[-0.02em] md:text-[34px]" />
                  <Estado linha={f.slug ? { ...linhaEndereco(f), texto: f.estEndereco === "livre" ? `muriki.app/${f.slug} está livre.` : linhaEndereco(f).texto } : { texto: "O endereço sai do nome. Dá para mudar depois.", tom: "neutro" }} />
                </div>
                <Seguir desligado={!f.prontoPasso[1]} carregando={f.enviando} onClick={f.enviar} extra={<Botao fantasma responsivo onClick={() => setQuerEquipe(null)}>Voltar</Botao>}>
                  Criar o {f.nome.trim() || "workspace"} <ArrowRight size={14} />
                </Seguir>
              </motion.div>
            ) : (
              <motion.div key="escolha" {...troca} className="flex flex-col gap-2.5 md:flex-row">
                {[
                  { r: "Sim, com um time", d: "Cria um workspace de equipe", on: () => setQuerEquipe(true) },
                  { r: "Agora não, só eu", d: "Dá para criar depois", on: f.pularEquipe },
                ].map((o) => (
                  <button key={o.r} type="button" onClick={o.on} className="group flex flex-col items-start gap-1 rounded-[12px] px-4 py-3.5 md:flex-1 text-left transition-[box-shadow,transform] active:scale-[0.99]" style={{ background: "var(--ds-placa-forte)", boxShadow: "inset 0 0 0 1px var(--ds-fio)" }}>
                    <span className="text-[15px]" style={{ color: "var(--ds-tinta-forte)" }}>
                      {o.r}
                    </span>
                    <span className="text-[13px]" style={{ color: "var(--ds-tinta-2)" }}>
                      {o.d}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : f.passo > 1 ? (
        <Recibo voltar={() => (f.setPasso(1), setQuerEquipe(!f.pulouEquipe ? true : null))}>{f.pulouEquipe ? "só eu, por enquanto" : `${f.nome} · muriki.app/${f.slug}`}</Recibo>
      ) : null}

      {/* 3 · os convites */}
      {f.passo >= 2 && !f.pulouEquipe ? <Fala texto={`Quem mais vem para o ${f.nome}? Pode colar vários e-mails de uma vez, eu levo os convites.`} antiga={!daVez(2)} mascote={daVez(2) ? mascote : <MurikiLogo className="size-9 md:size-11" />} /> : null}
      {daVez(2) ? (
        <motion.div {...troca} className="flex flex-1 flex-col gap-5 pl-[50px] md:flex-none md:pl-[60px]">
          <PassoConvites f={f} pular="Depois eu chamo" />
        </motion.div>
      ) : f.passo > 2 && !f.pulouEquipe ? (
        <Recibo voltar={() => f.setPasso(2)}>{f.pulouConvite ? "convites depois" : `${f.validos.length} ${f.validos.length === 1 ? "convite" : "convites"} a caminho`}</Recibo>
      ) : null}

      {/* o fim */}
      {f.passo === 3 ? (
        <>
          <Fala texto={f.pulouEquipe ? TEM_TESTE ? `Tudo certo. O seu espaço começa com ${TESTE_DIAS} dias do Ultimate, sem cartão. Um time dá para criar quando quiser.` : "Tudo certo. O seu espaço está pronto, e um time dá para criar quando quiser." : `Tudo certo. O ${f.nome} ${TEM_TESTE ? `começa com ${TESTE_DIAS} dias do Enterprise, sem cartão` : "nasce no Free"}${f.pulouConvite ? "" : ", e os convites já saíram"}. Os planos ficam na Cobrança, quando você quiser.`} mascote={<Mascote pensando falou="fim" />} />
          <motion.div {...troca} className="flex flex-1 flex-col pl-[50px] md:pl-[60px]">
            <Seguir onClick={() => avisar("Abrindo o Platform…")}>
              Entrar no Platform <ArrowRight size={14} />
            </Seguir>
          </motion.div>
        </>
      ) : null}
      <div ref={fim} />
    </div>
  )
}

// ── Opção 2 · a frase que se completa ────────────────────────────────────

/** Um valor já dado dentro da frase: em azul, e um toque volta para ele. */
function Dado({ children, voltar }: { children: React.ReactNode; voltar: () => void }) {
  return (
    <motion.button type="button" onClick={voltar} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={CHEGADA} className="inline underline decoration-[var(--ds-fio-forte)] decoration-1 underline-offset-[0.18em] transition-colors hover:decoration-[var(--primary)]" style={{ color: "var(--primary)", font: "inherit" }}>
      {children}
    </motion.button>
  )
}

/** O que vem depois, como pista: a próxima oração, desfocada e clara —
    as pontas desfocadas do título da rivio. */
function Pista({ texto }: { texto: string }) {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.28 }} transition={{ duration: 0.8, delay: 0.6 }} className="pointer-events-none select-none" style={{ filter: "blur(7px)", color: "var(--ds-tinta-2)" }}>
      {" "}
      {texto}
    </motion.span>
  )
}

/* O teste e o Free como a API e o registry contam. O workspace não escolhe
   plano ao nascer: POST /platform/workspaces começa sozinho o teste do plano
   de topo (Enterprise no time, Ultimate no pessoal), um por pessoa e por
   tipo, sem cartão; sem direito ao teste, nasce no Free. Os planos e o
   checkout ficam dentro do produto (SeatPlanCards, CheckoutPage, a contagem
   do teste na Cobrança). No onboarding, o contexto do plano é o SeatsPreview
   do passo de convidar, como hoje. `#semteste` mostra quem já usou o teste. */
const TESTE_DIAS = 14 // trialDays do Enterprise e do Ultimate (GET /plans)
const TEM_TESTE = !location.hash.includes("semteste")
const LIMITE_FREE = 5 // platform.max_members do Free e do Pro no time, do admin (o SeatsPreview diz 5 hoje)

/** O passo de convidar com os componentes de hoje: o InviteForm (colar
    vários, papel por linha, limite do Free) e o SeatsPreview (o cartão de
    pessoas no plano, com o teste). Só o pé é nosso. */
function PassoConvites({ f, pular }: { f: Fluxo; pular: string }) {
  const rows: InviteRow[] = f.convites.filter((c) => c.email).map((c) => ({ email: c.email, role: c.papel }))
  const setRows = (rs: InviteRow[]) => f.setConvites(rs.map((r, i) => ({ id: i + 1, email: r.email, papel: r.role as Papel })))
  return (
    <div className="flex flex-col gap-4">
      {/* você, o primeiro do time: o nome e o e-mail da conta, no molde das linhas do convite */}
      <motion.div initial={{ opacity: 0, filter: "blur(10px)", y: 6 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } }} transition={{ duration: 0.5, ease: CURVA, delay: 0.15 }} className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">{CONTA.nome[0]}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{CONTA.nome}</span>
          <span className="truncate text-[13px] text-muted-foreground">{CONTA.email}</span>
        </span>
        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[12px] text-muted-foreground">Owner · você</span>
      </motion.div>
    <InviteForm
      rows={rows}
      onRowsChange={setRows}
      viewerRole="owner"
      onSubmit={(rs) => {
        setRows(rs)
        f.enviarConvites()
      }}
      limit={TEM_TESTE ? undefined : { max: LIMITE_FREE, used: 1 }}
      submitting={f.enviando}
      footer={({ count, disabled }) => (
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, filter: "blur(12px)", y: 8 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } }} transition={{ duration: 0.55, ease: CURVA, delay: 0.3 }}>
            <SeatsPreview workspaceName={f.nome} people={[{ name: CONTA.nome }, ...rows.map((r) => ({ name: r.email }))]} freeLimit={LIMITE_FREE} planName="Pro" trialPlanName="Enterprise" trialDays={TEM_TESTE ? TESTE_DIAS : null} />
          </motion.div>
          <Seguir submit desligado={disabled} carregando={f.enviando} extra={<Botao fantasma responsivo onClick={f.pularConvite}>{pular}</Botao>}>
            {count > 1 ? `Convidar ${count} pessoas` : count === 1 ? "Convidar 1 pessoa" : "Convidar"} <ArrowRight size={14} />
          </Seguir>
        </div>
      )}
    />
    </div>
  )
}

/** O que o Muriki diz em cima da frase: a dica, o estado da conferência e
    o erro, na voz dele. Também diz se está "pensando" e se é um não. */
function falaDoMuriki(f: Fluxo): { texto: string; pensando?: boolean; nao?: boolean } {
  const primeiro = CONTA.nome.split(" ")[0]
  if (f.enviando) return { texto: "Só um instante…", pensando: true }
  if (f.passo === 0) {
    const e = f.estUsuario
    if (e === "vazio") return { texto: `Oi, ${primeiro}! Eu sou o Muriki. Escolhe como o time vai te chamar.` }
    if (e === "curto") return { texto: "Mais uns caracteres: são pelo menos 3." }
    if (e === "formato") return { texto: "Começa com uma letra; ponto e sublinhado só entre letras ou números.", nao: true }
    if (e === "verificando") return { texto: "Deixa eu ver se está livre…", pensando: true }
    if (e === "ocupado") return { texto: "Esse já tem dono. Tenta outro?", nao: true }
    if (e === "reservado") return { texto: "Esse é reservado. Tenta outro?", nao: true }
    return { texto: f.termos ? `@${f.usuario} é seu. Pode seguir.` : `@${f.usuario} está livre! Falta só aceitar os termos.` }
  }
  if (f.passo === 1) {
    const e = f.estEndereco
    if (!f.nome.trim()) return { texto: "O seu espaço pessoal já existe. Trabalha com um time? Se não, pode pular." }
    if (e === "verificando") return { texto: `Vendo se muriki.app/${f.slug} está livre…`, pensando: true }
    if (e === "ocupado") return { texto: "Esse endereço já é de outro time. Muda um pouquinho o nome?", nao: true }
    if (e === "reservado") return { texto: "Esse endereço é reservado. Muda um pouquinho o nome?", nao: true }
    if (e === "livre") return { texto: TEM_TESTE ? `muriki.app/${f.slug} é de vocês. O ${f.nome.trim()} começa com ${TESTE_DIAS} dias do Enterprise, sem cartão.` : `muriki.app/${f.slug} é de vocês. O ${f.nome.trim()} nasce no Free, com até ${LIMITE_FREE} pessoas.` }
    return { texto: "Use letras e números no nome." }
  }
  if (f.passo === 2) {
    const n = f.validos.length
    if (!n) return { texto: `Quem mais vem para o ${f.nome}? Pode colar vários e-mails de uma vez.` }
    if (!TEM_TESTE && n >= LIMITE_FREE - 1) return { texto: `Lotou o Free: ${LIMITE_FREE} com você. Para mais gente, depois é só mudar de plano.` }
    return { texto: n === 1 ? "Um na lista. O papel dá para trocar ali do lado." : `${n} na lista. Eu levo os convites.` }
  }
  if (f.pulouEquipe) return { texto: TEM_TESTE ? `Pronto! O seu espaço começa com ${TESTE_DIAS} dias do Ultimate. Quando quiser um time, é só criar.` : "Pronto! O seu espaço está montado. Quando quiser um time, é só criar.", pensando: true }
  return { texto: TEM_TESTE ? `Pronto! O ${f.nome} começa com ${TESTE_DIAS} dias do Enterprise. Os planos ficam na Cobrança, sem pressa.` : `Pronto! O ${f.nome} está no Free, com até ${LIMITE_FREE} pessoas. Os planos ficam na Cobrança.`, pensando: true }
}

/** O Muriki em cima da frase: o mascote e a fala dele, que troca se
    revelando palavra por palavra. */
function MurikiFala({ f }: { f: Fluxo }) {
  const fala = falaDoMuriki(f)
  return (
    <div className="flex min-h-[52px] items-start gap-3 md:items-center">
      <Mascote pensando={fala.pensando} nao={fala.nao} falou={fala.texto} tamanho={40} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={fala.texto} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} className="max-w-[560px] pt-1.5 text-[15px] leading-snug md:pt-0 md:text-[16px]" style={{ color: fala.nao ? "var(--destructive)" : "var(--ds-tinta)" }}>
          <Revela texto={fala.texto} passo={0.03} />
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function OpcaoFrase({ f, avisar, comMuriki = false }: { f: Fluxo; avisar: (t: string) => void; comMuriki?: boolean }) {
  const i = f.passo
  const nomes = f.validos.map((c) => c.email.split("@")[0].replace(/^./, (l) => l.toUpperCase()))
  const listaNomes = nomes.length <= 1 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`
  const passada = "color-mix(in oklab, var(--ds-tinta-forte) 55%, transparent)"
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1040px] flex-col px-4 pt-24 pb-6 md:justify-center md:px-10 md:pt-16 md:pb-24">
      {comMuriki ? <MurikiFala f={f} /> : <Etiqueta cor="var(--tone-blue-dot)">{i < 3 ? `Primeiro acesso · ${i + 1} de 3` : "Primeiro acesso · pronto"}</Etiqueta>}

      <h1 className="mt-6 text-[34px] leading-[1.12] font-light tracking-[-0.035em] md:mt-8 md:text-[60px]" style={{ color: "var(--ds-tinta-forte)" }}>
        {/* 1 · o @usuário */}
        <span style={{ color: i > 0 ? passada : undefined, transition: "color 0.6s" }}>
          <Revela texto="Aqui, você é" />
        </span>
        {i === 0 ? (
          <CampoTexto prefixo="@" valor={f.usuario} onChange={f.setUsuario} placeholder="seu.nome" erro={erroDe(f.estUsuario)} autoFocus onEnter={f.enviar} />
        ) : (
          <Dado voltar={() => f.setPasso(0)}>@{f.usuario}</Dado>
        )}
        <span style={{ color: i > 0 ? passada : undefined }}>.</span>
        {i === 0 ? <Pista texto="Você trabalha com o time" /> : null}

        {/* 2 · a equipe */}
        {i >= 1 ? (
          f.pulouEquipe && i > 1 ? (
            <span style={{ color: passada }}>
              {" "}
              <Revela texto="Por enquanto," /><Dado voltar={() => f.setPasso(1)}>só você</Dado>.
            </span>
          ) : (
            <>
              <span style={{ color: i > 1 ? passada : undefined, transition: "color 0.6s" }}>
                {" "}
                <Revela texto="Você trabalha com o time" />
              </span>
              {i === 1 ? (
                <CampoTexto valor={f.nome} onChange={f.setNome} placeholder="Acme Labs" autoFocus onEnter={f.enviar} />
              ) : (
                <Dado voltar={() => f.setPasso(1)}>{f.nome}</Dado>
              )}
              {i === 1 ? <Pista texto="e vai chamar" /> : null}
            </>
          )
        ) : null}

        {/* 3 · os convites */}
        {i >= 2 && !f.pulouEquipe ? (
          i === 2 ? (
            <span>
              <Revela texto=", e vai chamar" />
              {listaNomes ? (
                <Chega texto={listaNomes} style={{ color: "var(--primary)" }} />
              ) : (
                <span style={{ color: "var(--ds-fio-forte)" }}>…</span>
              )}
              .
            </span>
          ) : f.pulouConvite ? (
            <span style={{ color: passada }}>.</span>
          ) : (
            <span style={{ color: passada }}>
              <Revela texto=", e chamou" /><Dado voltar={() => f.setPasso(2)}>{listaNomes}</Dado>.
            </span>
          )
        ) : null}

        {/* o fim */}
        {i === 3 ? (
          <span>
            {" "}
            <Revela texto="Tudo pronto." atraso={0.3} />
          </span>
        ) : null}
      </h1>

      {/* embaixo da frase: o estado, o que falta e a ação */}
      <AnimatePresence mode="wait">
        <motion.div key={i} {...troca} className={`mt-8 flex flex-1 flex-col gap-5 md:mt-10 md:flex-none ${i === 2 ? "md:max-w-[620px]" : "md:max-w-[560px]"}`}>
          {i === 0 ? (
            <>
              {comMuriki ? null : <Estado linha={linhaUsuario(f)} />}
              <Marca on={f.termos} onChange={f.setTermos}>
                Li e aceito os <span style={{ color: "var(--ds-tinta-forte)" }}>termos de uso</span> e a <span style={{ color: "var(--ds-tinta-forte)" }}>política de privacidade</span>.
              </Marca>
              <Seguir desligado={!f.prontoPasso[0]} carregando={f.enviando} onClick={f.enviar}>
                Seguir <ArrowRight size={14} />
              </Seguir>
            </>
          ) : i === 1 ? (
            <>
              {comMuriki ? null : <Estado linha={f.slug ? { ...linhaEndereco(f), texto: f.estEndereco === "livre" ? `muriki.app/${f.slug} está livre.` : linhaEndereco(f).texto } : { texto: "Um workspace de equipe, opcional. O endereço sai do nome.", tom: "neutro" }} />}
              <Seguir desligado={!f.prontoPasso[1]} carregando={f.enviando} onClick={f.enviar} extra={<Botao fantasma responsivo onClick={f.pularEquipe}>Só eu, por enquanto</Botao>}>
                Criar o time <ArrowRight size={14} />
              </Seguir>
            </>
          ) : i === 2 ? (
            <>
              <PassoConvites f={f} pular="Chamo depois" />
            </>
          ) : (
            <Seguir onClick={() => avisar("Abrindo o Platform…")}>
              Entrar no Platform <ArrowRight size={14} />
            </Seguir>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── o app ────────────────────────────────────────────────────────────────

const IDIOMAS = [
  { value: "pt-BR", label: "Português" },
  { value: "en-US", label: "English" },
  { value: "es-ES", label: "Español" },
]

type Opcao = "mascote" | "frase" | "juntos"
const OPCOES: { v: Opcao; rotulo: string }[] = [
  { v: "juntos", rotulo: "Juntos" },
  { v: "mascote", rotulo: "Mascote" },
  { v: "frase", rotulo: "Frase" },
]

function App() {
  const h = location.hash
  // "solo": a página dentro da moldura de celular, sem o painel
  const solo = h.includes("solo")
  const [opcao, setOpcao] = React.useState<Opcao>(() => (h.includes("frase") ? "frase" : h.includes("mascote") ? "mascote" : "juntos"))
  // o tema: o do hash, senão o de quem vê (o data-theme da página publicada, ou o do sistema)
  const [escuro, setEscuro] = React.useState(() => {
    if (h.includes("escuro")) return true
    const tema = document.documentElement.dataset.theme
    return tema ? tema === "dark" : matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [celular, setCelular] = React.useState(() => h.includes("cel"))
  const [rodada, setRodada] = React.useState(0)
  // o idioma: no estudo os textos são só em português; no app vêm do i18n (pt, en, es)
  const [idioma, setIdioma] = React.useState("pt-BR")
  const f = useFluxo()
  const [aviso, avisar] = useAviso()
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", escuro)
  }, [escuro])
  React.useEffect(() => {
    if (!solo) history.replaceState(null, "", `#${opcao}${escuro ? "-escuro" : ""}${celular ? "-cel" : ""}`)
  }, [opcao, escuro, celular, solo])

  // o painel do estudo com os componentes do sistema: o ViewToggle (o mesmo do Code: a cápsula e o
  // cursor que desliza com mola) e o Button
  const painel = (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
      <ViewToggle value={opcao} onChange={setOpcao} options={OPCOES.map((o) => ({ value: o.v, label: o.rotulo }))} ariaLabel="Opção do estudo" />
      <ViewToggle value={celular ? "cel" : "web"} onChange={(v) => setCelular(v === "cel")} options={[{ value: "web", label: "Web" }, { value: "cel", label: "Celular" }]} ariaLabel="Tela" />
      <Button
        variant="ghost"
        onClick={() => {
          f.recomecar()
          setRodada(rodada + 1)
        }}
      >
        Recomeçar
      </Button>
    </div>
  )

  if (celular && !solo)
    return (
      <div className="flex min-h-dvh items-center justify-center pb-20">
        <Atmosfera />
        <iframe key={`${opcao}-${escuro}-${rodada}`} title="Celular" src={`${location.href.split("#")[0]}#${opcao}-solo${escuro ? "-escuro" : ""}`} className="h-[844px] w-[390px] rounded-[28px]" style={{ boxShadow: "0 0 0 8px var(--ds-placa-forte), 0 0 0 9px var(--ds-fio), 0 40px 80px -30px var(--ds-sombra)" }} />
        {painel}
      </div>
    )

  return (
    <div className="relative min-h-dvh text-[var(--ds-tinta)]">
      <Atmosfera />
      {/* o topo não tem fundo próprio nem fica fixo: o fundo da página corre por baixo dele, inteiro */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center px-4 md:h-16 md:px-8" style={{ color: "var(--ds-tinta-forte)" }}>
        {/* a marca e as utilidades do app (PlatformBrand e ScreenUtilities do muriki-platform):
            o logo com "Muriki Platform", o idioma (LanguageSwitcher) e o tema */}
        <span className="flex items-center gap-2.5 whitespace-nowrap">
          <MurikiLogo className="size-7 shrink-0" />
          <span className="text-sm font-semibold text-foreground-strong">Muriki Platform</span>
        </span>
        <span className="ml-auto flex items-center gap-1">
          <LanguageSwitcher value={idioma} options={IDIOMAS} onValueChange={setIdioma} label="Idioma" />
          <Button variant="ghost" size="icon" aria-label={escuro ? "Tema escuro. Mudar para o claro" : "Tema claro. Mudar para o escuro"} onClick={() => setEscuro(!escuro)} className="text-muted-foreground">
            {escuro ? <Sun aria-hidden size={18} /> : <Moon aria-hidden size={18} />}
          </Button>
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={`${opcao}-${rodada}`} {...troca}>
          {opcao === "mascote" ? <OpcaoMascote f={f} avisar={avisar} /> : <OpcaoFrase f={f} avisar={avisar} comMuriki={opcao === "juntos"} />}
        </motion.div>
      </AnimatePresence>

      {solo ? null : painel}
      {aviso}
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
