import * as React from "react"
import { createRoot } from "react-dom/client"
import { AnimatePresence, motion } from "framer-motion"
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { ptBR as ptBRdatas } from "date-fns/locale"
import { ptBR } from "react-day-picker/locale"
import { ArrowSquareOut, ArrowsClockwise, ArrowsIn, ArrowsOut, CalendarBlank, CaretDoubleLeft, CaretDoubleRight, CaretDown, CaretLeft, CaretRight, Check, CircleNotch, Clock, Command, DotsThree, Envelope, FileText, FlowArrow, GearSix, Globe, Kanban, LinkSimple, List, ListChecks, ListNumbers, MagnifyingGlass, MicrosoftOutlookLogo, MicrosoftTeamsLogo, Moon, NotePencil, Plus, PushPin, PushPinSlash, ShootingStar, SignOut, Sun, Target, TextAlignLeft, Trash, Users, VideoCamera, X } from "@phosphor-icons/react"

import { KanbanBoard, type KanbanColumnSpec, type KanbanTask } from "@/components/blocks/kanban/kanban-board"
import { LanguageSwitcher } from "@/components/blocks/language-switcher/language-switcher"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ViewToggle } from "@/components/ui/view-toggle"

/* A home do Focus (abre no workspace pessoal; o de empresa abre no Work).

   O sidebar é o mesmo em todos os módulos: o cabeçalho É o módulo ("Muriki ·
   Focus"), que abre o dropdown dos 4 módulos; logo embaixo, a barra de ações
   (⌘K); a navegação do módulo, sem títulos; fora da home, os próximos
   eventos. Três modos: fixo, recolhido (só ícones) e flutuante (some e
   aparece por cima ao chegar na borda).

   A home cabe numa tela, sem rolar a página: à esquerda o mês e as tarefas
   (abas de tipo e páginas do tamanho que couber); à direita o calendário
   (mês, semana, dia, agenda; atalhos M, S, D, A; rola por dentro) ou o
   kanban das tarefas, num toggle só de ícones; e o calendário cheio.

   O evento abre num modal: data e hora, dia inteiro, calendário (as contas
   vinculadas e o Muriki), o link da reunião (Zoom, Meet, Teams) e a pauta da
   call. Referência do calendário: o Event Calendar da Origin UI (comp-542),
   sem o arrastar e soltar por enquanto.

   Sem API ainda: os dados são de exemplo. Hoje é domingo, 8 de novembro de
   2026, 10:20. */

const CURVA = [0.16, 1, 0.3, 1] as [number, number, number, number]
const CHEGADA = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
const troca = {
  initial: { opacity: 0, filter: "blur(14px)", y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } },
  exit: { opacity: 0, filter: "blur(14px)", y: -10 },
  transition: { duration: 0.42, ease: CURVA },
}
const fmt = (d: Date, f: string) => format(d, f, { locale: ptBRdatas })

// ── os dados de exemplo ──────────────────────────────────────────────────

const AGORA = new Date(2026, 10, 8, 10, 20)
const em = (dia: number, h: number, m = 0) => new Date(2026, 10, dia, h, m)

interface Conta {
  id: string
  nome: string
  detalhe: string
  tom: string
  provedor: "muriki" | "google" | "outlook" | "icloud" | "ics"
}
// cresce quando a pessoa conecta outro calendário (ModalConectar)
const CONTAS: Conta[] = [
  { id: "muriki", nome: "Muriki", detalhe: "eventos dos workspaces", tom: "blue", provedor: "muriki" },
  { id: "google", nome: "Google", detalhe: "guilherme@gmail.com", tom: "green", provedor: "google" },
  { id: "outlook", nome: "Outlook", detalhe: "guilherme@acmelabs.com", tom: "purple", provedor: "outlook" },
]
/** O evento toca o dia: começa até o fim dele e termina depois do começo dele. */
const noDia = (e: { ini: Date; fim: Date }, d: Date) => +e.ini <= +new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59) && +e.fim >= +new Date(d.getFullYear(), d.getMonth(), d.getDate())
const tomDaConta = (id: string) => CONTAS.find((c) => c.id === id)?.tom ?? "gray"

interface Evento {
  id: string
  titulo: string
  ini: Date
  fim: Date
  conta: string
  diaInteiro?: boolean
  link?: string
  pauta?: string[]
  descricao?: string
  /** Os códigos das tarefas ligadas ao evento (ex.: MUR-100, MUR-101). */
  tarefas?: string[]
  /** Quem participa, com a resposta de cada um. */
  participantes?: Participante[]
  /** Quem convidou, quando o evento é de outra pessoa: aí não se edita nem se exclui. */
  organizador?: string
  resposta?: Resposta
}
type Resposta = "sim" | "talvez" | "nao" | "pendente"
interface Participante {
  nome: string
  email: string
  resposta: Resposta
}
// as pessoas que o Focus já conhece (dos workspaces), para sugerir ao convidar
const PESSOAS: Omit<Participante, "resposta">[] = [
  { nome: "Ana Moura", email: "ana@acmelabs.com" },
  { nome: "Rafael Silva", email: "rafael@acmelabs.com" },
  { nome: "Bia Costa", email: "bia@muriki.com" },
  { nome: "João Pereira", email: "joao@muriki.com" },
  { nome: "Lúcia Prado", email: "lucia@acmelabs.com" },
]

function eventosIniciais(): Evento[] {
  const es: Evento[] = []
  let n = 0
  const add = (e: Omit<Evento, "id">) => es.push({ ...e, id: `e${++n}` })
  // a daily do Acme Labs, de segunda a sexta
  for (let d = 1; d <= 30; d++) {
    const dow = new Date(2026, 10, d).getDay()
    if (dow >= 1 && dow <= 5) add({ titulo: "Daily do Acme Labs", ini: em(d, 9, 30), fim: em(d, 10), conta: "muriki", link: "https://meet.google.com/abc-defg-hij", organizador: "Ana Moura", resposta: "sim" })
  }
  add({ titulo: "Planning da sprint", ini: em(3, 10), fim: em(3, 11), conta: "muriki", link: "https://meet.google.com/xyz-plan", pauta: ["O que entra na sprint 12", "Capacidade do time"] })
  add({ titulo: "Academia", ini: em(3, 7), fim: em(3, 8), conta: "google" })
  add({ titulo: "1:1 com a Ana", ini: em(4, 14), fim: em(4, 14, 30), conta: "outlook", link: "https://acmelabs.zoom.us/j/8812345678" })
  add({ titulo: "Review do onboarding", ini: em(5, 16), fim: em(5, 17), conta: "muriki" })
  add({ titulo: "Academia", ini: em(6, 7), fim: em(6, 8), conta: "google" })
  add({ titulo: "Demo para a Acme", ini: em(7, 15), fim: em(7, 16), conta: "muriki" })
  add({ titulo: "Almoço de família", ini: em(8, 12, 30), fim: em(8, 14), conta: "google", descricao: "Na casa da vó. Levar a sobremesa." })
  add({ titulo: "Call com o cliente", ini: em(8, 15), fim: em(8, 15, 45), conta: "outlook", link: "https://acmelabs.zoom.us/j/9934455667", pauta: ["Escopo do checkout", "Prazo da entrega", "Valor do plano anual"], organizador: "Rafael Silva", resposta: "pendente", tarefas: ["ACM-12"], participantes: [{ nome: "Rafael Silva", email: "rafael@acmelabs.com", resposta: "sim" }, { nome: "Ana Moura", email: "ana@acmelabs.com", resposta: "talvez" }] })
  add({ titulo: "Refinamento", ini: em(10, 11), fim: em(10, 12), conta: "muriki", link: "https://meet.google.com/ref-inam-ento", tarefas: ["MUR-100", "MUR-101"], pauta: ["Quebrar a MUR-100 em partes", "Estimar"], participantes: [{ nome: "Bia Costa", email: "bia@muriki.com", resposta: "sim" }, { nome: "João Pereira", email: "joao@muriki.com", resposta: "pendente" }] })
  add({ titulo: "Corrida no parque", ini: em(8, 17, 30), fim: em(8, 18, 30), conta: "google" })
  add({ titulo: "Entrevista: dev front", ini: em(10, 14), fim: em(10, 15), conta: "outlook", link: "https://teams.microsoft.com/l/meetup-join/19%3a" })
  add({ titulo: "Almoço com a Bia", ini: em(12, 12, 30), fim: em(12, 13, 30), conta: "google" })
  add({ titulo: "Reunião de design", ini: em(12, 14), fim: em(12, 15), conta: "muriki" })
  add({ titulo: "Aula de inglês", ini: em(12, 19), fim: em(12, 20), conta: "google" })
  add({ titulo: "Viagem a BH", ini: em(18, 0), fim: em(20, 23, 59), conta: "google", diaInteiro: true })
  add({ titulo: "Conferência de design", ini: em(11, 0), fim: em(12, 23, 59), conta: "outlook", diaInteiro: true })
  add({ titulo: "Aniversário da Ana", ini: em(13, 0), fim: em(13, 23, 59), conta: "muriki", diaInteiro: true })
  add({ titulo: "Feriado: Consciência Negra", ini: em(20, 0), fim: em(20, 23, 59), conta: "google", diaInteiro: true })
  add({ titulo: "Aniversário da Bia", ini: em(25, 0), fim: em(25, 23, 59), conta: "google", diaInteiro: true })
  return es
}

/* As origens das tarefas: os logos do Simple Icons (CC0 1.0, simpleicons.org), na cor da marca.
   O Codex usa o logo da OpenAI. O e-mail sem marca é o envelope do Phosphor. */
const ORIGENS = {
  jira: { nome: "Jira", cor: "#0052CC", d: "M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" },
  slack: { nome: "Slack", cor: "#4A154B", d: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" },
  whatsapp: { nome: "WhatsApp", cor: "#25D366", d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
  linkedin: { nome: "LinkedIn", cor: "#0A66C2", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  gmail: { nome: "Gmail", cor: "#EA4335", d: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" },
  claude: { nome: "Claude", cor: "#D97757", d: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" },
  codex: { nome: "Codex", cor: "#412991", d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" },
  gemini: { nome: "Gemini", cor: "#8E75B2", d: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" },
} as const

const LOGO_GOOGLE_CALENDAR = "M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"
// const LOGO_ZOOM = "M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z"
const LOGO_MEET = "M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z"
const LOGO_ICLOUD = "M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"

type Origem = keyof typeof ORIGENS | "email"

/** De onde a tarefa veio: o logo da marca num ladrilho claro (lê igual nos dois temas), ou o
    envelope para um e-mail sem marca. */
function IconeOrigem({ o }: { o: Origem }) {
  const nome = o === "email" ? "e-mail" : ORIGENS[o].nome
  return (
    <span title={`Veio do ${nome}`} aria-label={`Veio do ${nome}`} className="grid size-[18px] shrink-0 place-items-center rounded-[5px] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
      {o === "email" ? (
        <Envelope size={12} weight="fill" color="#5f6368" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-3" aria-hidden>
          <path d={ORIGENS[o].d} fill={ORIGENS[o].cor} />
        </svg>
      )}
    </span>
  )
}

interface Workspace {
  nome: string
  inicial: string
  tom: string
  pessoal?: boolean
}
const PESSOAL: Workspace = { nome: "Pessoal", inicial: "G", tom: "yellow", pessoal: true }
const ACME: Workspace = { nome: "Acme Labs", inicial: "A", tom: "blue" }
const MURIKI_WS: Workspace = { nome: "Muriki", inicial: "M", tom: "purple" }
interface Tarefa {
  id: string
  /** O código da tarefa: o prefixo do projeto (ACM, SIT…) ou, nas pessoais, o do @ (GUI). */
  codigo: string
  titulo: string
  ws: Workspace
  projeto?: string
  prioridade: "urgent" | "high" | "medium" | "low" | "none"
  estado: "todo" | "doing" | "done"
  prazo: string
  /** De onde veio, quando não nasceu aqui: Jira, Slack, WhatsApp, LinkedIn, e-mail ou um agente. */
  origem?: Origem
}
const TAREFAS_INICIAIS: Tarefa[] = [
  { id: "t1", codigo: "ACM-12", titulo: "Revisar o fluxo de cobrança", ws: ACME, projeto: "Cobrança", prioridade: "urgent", estado: "doing", prazo: "hoje", origem: "jira" },
  { id: "t2", codigo: "GUI-3", titulo: "Ligar para a contadora", ws: PESSOAL, prioridade: "medium", estado: "todo", prazo: "hoje", origem: "whatsapp" },
  { id: "t11", codigo: "MUR-100", titulo: "Refinamento do backlog do Platform", ws: MURIKI_WS, projeto: "Platform", prioridade: "high", estado: "todo", prazo: "ter" },
  { id: "t12", codigo: "MUR-101", titulo: "Desenhar o calendário do Focus", ws: MURIKI_WS, projeto: "Platform", prioridade: "medium", estado: "doing", prazo: "qua" },
  { id: "t3", codigo: "SIT-4", titulo: "Revisar o texto da home", ws: MURIKI_WS, projeto: "Site", prioridade: "low", estado: "todo", prazo: "hoje", origem: "claude" },
  { id: "t10", codigo: "GUI-7", titulo: "Responder o recrutador", ws: PESSOAL, prioridade: "medium", estado: "todo", prazo: "hoje", origem: "linkedin" },
  { id: "t4", codigo: "ONB-4", titulo: "Gravar o vídeo do primeiro acesso", ws: ACME, projeto: "Onboarding", prioridade: "high", estado: "doing", prazo: "seg", origem: "slack" },
  { id: "t5", codigo: "GUI-5", titulo: "Estudar o capítulo de filas", ws: PESSOAL, projeto: "Estudos", prioridade: "low", estado: "todo", prazo: "ter", origem: "gemini" },
  { id: "t6", codigo: "GUI-6", titulo: "Mandar a fatura de outubro", ws: PESSOAL, projeto: "Freela", prioridade: "high", estado: "todo", prazo: "ter", origem: "email" },
  { id: "t7", codigo: "ACM-15", titulo: "Carência de quem passa do limite", ws: ACME, projeto: "Cobrança", prioridade: "medium", estado: "todo", prazo: "qua", origem: "codex" },
  { id: "t8", codigo: "GUI-8", titulo: "Trocar o óleo do carro", ws: PESSOAL, prioridade: "none", estado: "todo", prazo: "sex" },
  { id: "t9", codigo: "GUI-2", titulo: "Pagar o boleto do coworking", ws: PESSOAL, prioridade: "none", estado: "done", prazo: "ontem" },
]

const CONTA_PESSOA = { nome: "Guilherme Teodoro", email: "guilherme@muriki.com" }

function useFocus(avisar: (t: string) => void) {
  const [eventos, setEventos] = React.useState(eventosIniciais)
  const [visiveis, setVisiveis] = React.useState<Set<string>>(() => new Set(CONTAS.map((c) => c.id)))
  const [pref, setPref] = React.useState<Preferencias>(PREF_INICIAL)
  const [tarefas, setTarefas] = React.useState(TAREFAS_INICIAIS)
  const [notas, setNotas] = React.useState<string[]>(["Levar o raio-x no dentista.", "Perguntar à Ana se o cupom vale no anual."])
  return {
    todosEventos: eventos,
    eventos: eventos.filter((e) => visiveis.has(e.conta)),
    visiveis,
    alternarConta: (id: string) =>
      setVisiveis((v) => {
        const n = new Set(v)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      }),
    salvarEvento: (e: Evento) => {
      setEventos((es) => (es.some((x) => x.id === e.id) ? es.map((x) => (x.id === e.id ? e : x)) : [...es, e]))
      setVisiveis((v) => new Set(v).add(e.conta))
    },
    excluirEvento: (id: string) => setEventos((es) => es.filter((e) => e.id !== id)),
    pref,
    mudarPref: (x: Partial<Preferencias>) => setPref((p) => ({ ...p, ...x })),
    mudarCor: (id: string, tom: string) => {
      const c = CONTAS.find((x) => x.id === id)
      if (c) c.tom = tom
      setVisiveis((v) => new Set(v))
    },
    desconectar: (id: string) => {
      const i = CONTAS.findIndex((x) => x.id === id)
      if (i >= 0) CONTAS.splice(i, 1)
      setEventos((es) => es.filter((e) => e.conta !== id))
      setVisiveis((v) => {
        const n = new Set(v)
        n.delete(id)
        return n
      })
    },
    conectar: (c: Conta) => {
      CONTAS.push(c)
      setVisiveis((v) => new Set(v).add(c.id))
      // os eventos de exemplo da conta nova, nesta semana
      setEventos((es) => [...es, { id: `${c.id}-1`, titulo: "Feira do bairro", ini: em(9, 8), fim: em(9, 9), conta: c.id }, { id: `${c.id}-2`, titulo: "Jantar com os amigos", ini: em(13, 20), fim: em(13, 22), conta: c.id }, { id: `${c.id}-3`, titulo: "Aniversário do pai", ini: em(16, 0), fim: em(16, 23, 59), conta: c.id, diaInteiro: true }])
    },
    tarefas,
    setTarefas,
    alternarTarefa: (id: string) =>
      setTarefas((ts) =>
        ts.map((t) => {
          if (t.id !== id) return t
          if (t.estado !== "done") avisar(`Feita: ${t.titulo}`)
          return { ...t, estado: t.estado === "done" ? "todo" : "done" }
        })
      ),
    adicionarTarefa: (titulo: string) => setTarefas((ts) => [{ id: `t${Date.now()}`, codigo: `GUI-${ts.filter((t) => t.ws.pessoal).length + 4}`, titulo, ws: PESSOAL, prioridade: "none", estado: "todo", prazo: "hoje" }, ...ts]),
    notas,
    anotar: (t: string) => setNotas((ns) => [t, ...ns]),
    recomecar: () => {
      setEventos(eventosIniciais())
      setVisiveis(new Set(CONTAS.map((c) => c.id)))
      setTarefas(TAREFAS_INICIAIS)
    },
  }
}
type Focus = ReturnType<typeof useFocus>

// ── peças ────────────────────────────────────────────────────────────────

function Revela({ texto, atraso = 0, passo = 0.04 }: { texto: string; atraso?: number; passo?: number }) {
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

function Chega({ texto, className }: { texto: string; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={texto} initial={{ opacity: 0.2, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }} transition={CHEGADA} className={className}>
        {texto}
      </motion.span>
    </AnimatePresence>
  )
}

function Etiqueta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase ${className}`}>{children}</span>
}

function Tecla({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-border bg-background px-1 font-mono text-[10.5px] text-muted-foreground">{children}</kbd>
}

function Hoje31({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9h17M8 3v3M16 3v3" strokeLinecap="round" />
      <text x="12" y="17.6" textAnchor="middle" fontSize="7.6" fontWeight="700" fill="currentColor" stroke="none" fontFamily="Geist, system-ui, sans-serif">
        31
      </text>
    </svg>
  )
}

function Concluir({ feita, onClick }: { feita: boolean; onClick: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={feita} aria-label={feita ? "Desmarcar" : "Concluir"} onClick={onClick} className={`grid size-[18px] shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-300 ${feita ? "bg-primary text-primary-foreground" : "shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--muted-foreground)_60%,transparent)] hover:shadow-[inset_0_0_0_1.5px_var(--primary)]"}`}>
      <AnimatePresence initial={false}>
        {feita ? (
          <motion.span initial={{ opacity: 0, filter: "blur(4px)", scale: 0.6 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25, ease: CURVA }}>
            <Check size={11} weight="bold" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}

/** De onde vem o link da reunião, pelo endereço. */
function salaDe(link?: string) {
  if (!link) return null
  if (/zoom\.us/.test(link)) return "Zoom"
  if (/meet\.google/.test(link)) return "Google Meet"
  if (/teams\.(microsoft|live)/.test(link)) return "Teams"
  return "Link"
}

// ── o calendário ─────────────────────────────────────────────────────────

type Visao = "mes" | "semana" | "dia" | "agenda"
const HORA_PX = 52

/** O logo da conta de onde o evento vem: o Muriki, o Google Calendar, o Outlook, o iCloud, ou o
    elo do link .ics. Pequeno, na cor da marca. */
function LogoConta({ conta, tamanho = 14 }: { conta: string; tamanho?: number }) {
  const prov = CONTAS.find((c) => c.id === conta)?.provedor ?? "ics"
  if (prov === "muriki") return <MurikiLogo style={{ width: tamanho + 2, height: tamanho + 2 }} className="shrink-0" />
  if (prov === "outlook") return <MicrosoftOutlookLogo size={tamanho} weight="fill" color="#0078D4" className="shrink-0" />
  if (prov === "ics") return <LinkSimple size={tamanho} className="shrink-0 text-muted-foreground" />
  return (
    <svg viewBox="0 0 24 24" style={{ width: tamanho, height: tamanho }} className="shrink-0" aria-hidden>
      <path d={prov === "google" ? LOGO_GOOGLE_CALENDAR : LOGO_ICLOUD} fill={prov === "google" ? "#4285F4" : "#3693F3"} />
    </svg>
  )
}

/** O logo da sala da reunião, pelo link. */
function LogoSala({ link, tamanho = 13 }: { link?: string; tamanho?: number }) {
  const sala = salaDe(link)
  if (sala === "Teams") return <MicrosoftTeamsLogo size={tamanho} weight="fill" color="#5059C9" className="shrink-0" />
  // o logo do Zoom é a palavra, ilegível desse tamanho: a câmera no quadradinho azul dele
  if (sala === "Zoom")
    return (
      // dentro de botão, o Button força o tamanho dos svgs: o tamanho vai no style, que vence a regra
      <span className="grid shrink-0 place-items-center rounded-[4px]" style={{ width: tamanho, height: tamanho, minWidth: tamanho, background: "#0B5CFF" }}>
        <VideoCamera weight="fill" color="white" style={{ width: Math.round(tamanho * 0.68), height: Math.round(tamanho * 0.68) }} />
      </span>
    )
  if (sala === "Google Meet")
    return (
      <svg viewBox="0 0 24 24" style={{ width: tamanho, height: tamanho }} className="shrink-0" aria-hidden>
        <path d={LOGO_MEET} fill="#00897B" />
      </svg>
    )
  return sala ? <VideoCamera size={tamanho} className="shrink-0" /> : null
}

/** Um evento no calendário. Três formas:
    - bloco (semana e dia): o papel claro tingido da cor da conta, o fio dela à esquerda, o título, a
      hora em mono e, no canto, o logo da conta e o da sala quando tem reunião;
    - linha (mês e listas): o ponto da cor, a hora e o título, sem caixa, como a agenda de papel;
    - pílula (dia inteiro): a cor cheia da conta.
    O que já passou fica apagado; o que está acontecendo agora ganha o anel. */
function BlocoEvento({ e, abrir, compacto = false, rico = false, dia, style, className = "" }: { e: Evento; abrir: (e: Evento) => void; compacto?: boolean; rico?: boolean; dia?: Date; style?: React.CSSProperties; className?: string }) {
  const tom = tomDaConta(e.conta)
  const passado = e.fim < AGORA
  const agora = e.ini <= AGORA && e.fim > AGORA
  const forma = e.diaInteiro ? "pilula" : className.includes("absolute") ? "bloco" : "linha"
  const alto = typeof style?.height === "number" ? style.height : 0
  const abrirEste = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    abrir(e)
  }
  const chegada = { initial: { opacity: 0, filter: "blur(10px)" }, animate: { opacity: passado ? 0.5 : 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }, exit: { opacity: 0, filter: "blur(10px)" }, transition: { duration: 0.4, ease: CURVA } }

  if (forma === "linha")
    return (
      <motion.button type="button" onClick={abrirEste} {...chegada} className={`group relative flex w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-[3px] text-left leading-tight outline-none hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-primary ${compacto ? "text-[11.5px]" : "text-[13px]"} ${className}`} style={style}>
        <span className="size-[7px] shrink-0 rounded-full" style={{ background: `var(--tone-${tom}-dot)` }} />
        <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground tabular-nums">{fmt(e.ini, "HH:mm")}</span>
        <span className="min-w-0 flex-1 truncate text-foreground">{e.titulo}</span>
        {e.link && !compacto ? <LogoSala link={e.link} tamanho={12} /> : null}
      </motion.button>
    )

  if (forma === "pilula") {
    const dotP = `var(--tone-${tom}-dot)`
    const continuaAntes = dia ? !isSameDay(e.ini, dia) : false
    const continuaDepois = dia ? !isSameDay(e.fim, dia) : false
    const mostraTitulo = !dia || !continuaAntes || isSameDay(dia, inicioSemana(dia))
    // o contorno só nas pontas: onde a faixa emenda com o dia vizinho, sem costura
    const linhaP = `color-mix(in oklab, ${dotP} 30%, transparent)`
    return (
      <motion.button
        type="button"
        onClick={abrirEste}
        {...chegada}
        className={`${className.includes("absolute") ? "" : "relative z-[1]"} flex h-[22px] min-w-0 items-center gap-1.5 px-2 text-left text-[12px] leading-none font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary ${continuaAntes ? "rounded-l-none" : "rounded-l-[6px]"} ${continuaDepois ? "rounded-r-none" : "rounded-r-[6px]"} ${className}`}
        style={{ ...(dia ? { marginLeft: continuaAntes ? -7 : 0, marginRight: continuaDepois ? -7 : 0, width: `calc(100% + ${(continuaAntes ? 7 : 0) + (continuaDepois ? 7 : 0)}px)`, flexShrink: 0 } : null), background: `color-mix(in oklab, ${dotP} var(--veu, 9%), var(--card))`, boxShadow: [`inset 0 1px 0 ${linhaP}`, `inset 0 -1px 0 ${linhaP}`, continuaAntes ? "" : `inset 1px 0 0 ${linhaP}`, continuaDepois ? "" : `inset -1px 0 0 ${linhaP}`].filter(Boolean).join(", "), ...style }}
      >
        {mostraTitulo ? (
          <>
            <span className="size-[7px] shrink-0 rounded-full" style={{ background: dotP }} />
            <span className="truncate">{e.titulo}</span>
          </>
        ) : null}
      </motion.button>
    )
  }

  // o bloco: uma forma só para todo evento, o retângulo de canto 6 chapado na cor da conta, sem
  // borda e sem barra; o curto (até 30 min) é uma linha só, com a hora na frente
  const curto = alto <= 42
  const hora = `${fmt(e.ini, "HH:mm")}–${fmt(e.fim, "HH:mm")}`
  // o papel (escolhido), com um véu da cor da conta para dizer de onde vem: o fundo é o papel com
  // 9% da cor (mais no escuro, pelo --veu), o contorno fino na cor, o texto na tinta escura e o ponto
  const dot = `var(--tone-${tom}-dot)`
  const pendente = e.resposta === "pendente"
  const pele: React.CSSProperties = {
    ...(pendente ? { outline: `1px dashed color-mix(in oklab, ${dot} 70%, transparent)`, outlineOffset: -1 } : null),
    background: pendente ? "var(--card)" : `color-mix(in oklab, ${dot} var(--veu, 9%), var(--card))`,
    color: "var(--foreground)",
    boxShadow: agora ? `0 0 0 1.5px ${dot}` : `inset 0 0 0 1px color-mix(in oklab, ${dot} 30%, transparent), 0 1px 2px rgb(0 0 0 / 0.04)`,
  }
  const pontoPapel = <span className="size-[7px] shrink-0 self-center rounded-full" style={{ background: dot }} />
  return (
    <motion.button
      type="button"
      onClick={abrirEste}
      {...chegada}
      className={`group flex min-w-0 flex-col overflow-hidden rounded-[6px] px-2 text-left leading-[1.25] outline-none transition-[filter] duration-200 hover:brightness-[0.97] focus-visible:ring-2 focus-visible:ring-primary ${curto ? "justify-center" : "py-1.5"} ${className}`}
      style={{ ...pele, ...style }}
    >
      {curto ? (
        <span className="flex min-w-0 items-baseline gap-1.5 text-[12px]">
          {pontoPapel}
          <span className="shrink-0 tabular-nums opacity-70">{fmt(e.ini, "HH:mm")}</span>
          <span className="min-w-0 truncate font-medium">{e.titulo}</span>
          {rico && e.link ? (
            <a href={e.link} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} className="ml-1 inline-flex shrink-0 items-center gap-1 font-medium underline decoration-current/30 underline-offset-2 hover:decoration-current">
              <LogoSala link={e.link} tamanho={12} /> Entrar no {salaDe(e.link)}
            </a>
          ) : null}
        </span>
      ) : (
        <>
          <span className={`min-w-0 font-medium ${alto > 58 ? "line-clamp-2" : "truncate"} ${compacto ? "text-[12.5px]" : "text-[13.5px]"}`}>{e.titulo}</span>
          {rico ? null : (
            <span className="flex min-w-0 items-center gap-1.5 pt-0.5 text-[11.5px] tabular-nums opacity-75">
              {pontoPapel}
              <span className="truncate">
                {hora}
                {e.tarefas?.length ? ` · ${e.tarefas[0]}${e.tarefas.length > 1 ? ` +${e.tarefas.length - 1}` : ""}` : ""}
              </span>
            </span>
          )}
        </>
      )}
      {/* no dia, com espaço: a hora, de onde vem, a sala com "Entrar" e a pauta resumida */}
      {rico && !curto ? (
        <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-[12px]">
          <span className="tabular-nums opacity-70">{hora}</span>
          <span className="inline-flex items-center gap-1 opacity-80">
            <LogoConta conta={e.conta} tamanho={12} /> {CONTAS.find((c) => c.id === e.conta)?.nome}
          </span>
          {e.tarefas?.length ? <span className="font-mono text-[11px] opacity-80">{e.tarefas.join(", ")}</span> : null}
          {e.participantes?.length ? <span className="opacity-80">· {e.participantes.length + 1} pessoas</span> : null}
          {pendente ? <span className="opacity-80">· convite de {e.organizador}, sem resposta</span> : null}
          {e.link ? (
            <a href={e.link} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} className="inline-flex items-center gap-1 font-medium underline decoration-current/30 underline-offset-2 hover:decoration-current">
              <LogoSala link={e.link} tamanho={12} /> Entrar no {salaDe(e.link)}
            </a>
          ) : null}
        </span>
      ) : null}
      {rico && e.pauta && alto > 64 ? (
        <span className="flex min-w-0 flex-col gap-0.5 pt-1.5 text-[12px] opacity-80">
          {e.pauta.slice(0, Math.max(1, Math.floor((alto - 50) / 18))).map((p, i) => (
            <span key={p} className="truncate tabular-nums">
              {i + 1}. {p}
            </span>
          ))}
        </span>
      ) : rico && e.descricao && alto > 64 ? (
        <span className="truncate pt-1.5 text-[12px] opacity-80">{e.descricao}</span>
      ) : null}
    </motion.button>
  )
}

function VisaoMes({ f, data, abrir, criar }: { f: Focus; data: Date; abrir: (e: Evento) => void; criar: (d: Date) => void }) {
  const ini = inicioSemana(startOfMonth(data))
  const fim = fimSemana(endOfMonth(data))
  const dias: Date[] = []
  for (let d = ini; d <= fim; d = addDays(d, 1)) dias.push(d)
  const semanas = dias.length / 7
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {dias.slice(0, 7).map((d) => (
          <span key={d.toISOString()} className="py-2 text-center font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
            {fmt(d, "EEE")}
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${semanas}, minmax(92px, 1fr))` }}>
        {dias.map((d) => {
          const doDia = f.eventos.filter((e) => noDia(e, d)).sort((a, b) => Number(!a.diaInteiro) - Number(!b.diaInteiro) || +a.ini - +b.ini)
          const hoje = isSameDay(d, AGORA)
          const fora = !isSameMonth(d, data)
          return (
            <div key={d.toISOString()} role="button" tabIndex={-1} onClick={() => criar(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9))} className={`group flex min-h-0 flex-col gap-1 border-r border-b border-border/70 p-1.5 transition-colors hover:bg-primary/[0.03] [&:nth-child(7n)]:border-r-0 ${fora ? "bg-secondary/30" : ""}`}>
              <span className={`grid size-6 place-items-center self-start rounded-full text-[12px] tabular-nums ${hoje ? "bg-primary font-semibold text-primary-foreground" : fora ? "text-muted-foreground/60" : "text-foreground"}`}>{fmt(d, "d")}</span>
              <AnimatePresence initial={false}>
                {doDia.slice(0, 2).map((e) => (
                  <BlocoEvento key={e.id} e={e} abrir={abrir} compacto dia={d} />
                ))}
              </AnimatePresence>
              {doDia.length > 2 ? (
                <Popover>
                  <PopoverTrigger
                    render={
                      <button type="button" onClick={(ev) => ev.stopPropagation()} className="self-start rounded px-1 text-[11.5px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                        + {doDia.length - 2} mais
                      </button>
                    }
                  />
                  <PopoverContent className="w-60">
                    <div className="flex flex-col gap-1">
                      <span className="pb-1 text-[13px] font-medium text-foreground-strong">{fmt(d, "EEEE, d 'de' MMMM")}</span>
                      {doDia.map((e) => (
                        <BlocoEvento key={e.id} e={e} abrir={abrir} />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Semana e dia: a régua das 24 horas, que rola por dentro e abre nas 7h. */
function VisaoHoras({ f, dias, abrir, criar }: { f: Focus; dias: Date[]; abrir: (e: Evento) => void; criar: (d: Date) => void }) {
  const rolagem = React.useRef<HTMLDivElement>(null)
  // abre nas 7h; de novo no quadro seguinte e um pouco depois, porque a troca de visão anima e a
  // altura da caixa ainda pode não estar pronta no primeiro quadro
  React.useLayoutEffect(() => {
    const ir = () => {
      if (rolagem.current) rolagem.current.scrollTop = (minutosDoDia(PREF.expediente[0]) / 60) * HORA_PX - 8
    }
    ir()
    const q = requestAnimationFrame(ir)
    const t = setTimeout(ir, 120)
    return () => (cancelAnimationFrame(q), clearTimeout(t))
  }, [])
  const varios = dias.length > 1
  // a faixa "dia todo": cada evento de dia inteiro numa raia, do primeiro ao último dia que ele
  // toca nesta tela; as raias empilham quando dois se cruzam
  const inteiros = f.eventos
    .filter((e) => e.diaInteiro && dias.some((d) => noDia(e, d)))
    .sort((a, b) => +a.ini - +b.ini)
    .map((e) => ({ e, de: dias.findIndex((d) => noDia(e, d)), ate: dias.length - 1 - [...dias].reverse().findIndex((d) => noDia(e, d)) }))
  const raias: number[] = []
  const comRaia = inteiros.map((x) => {
    let r = raias.findIndex((fimDaRaia) => fimDaRaia < x.de)
    if (r < 0) r = raias.length
    raias[r] = x.ate
    return { ...x, raia: r }
  })
  const nRaias = Math.max(1, raias.length)
  const minutosDe = (d: Date) => d.getHours() * 60 + d.getMinutes()
  return (
    <div className="flex h-full flex-col">
      {varios ? (
        <div className="flex border-b border-border pl-12">
          {dias.map((d) => (
            <span key={d.toISOString()} className={`flex flex-1 flex-col items-center py-1.5 text-[12px] ${isSameDay(d, AGORA) ? "text-primary" : "text-muted-foreground"}`}>
              <span className="text-[12px]">{fmt(d, "EEE").replace(".", "")}</span>
              <span className={`grid size-7 place-items-center rounded-full text-[14px] ${isSameDay(d, AGORA) ? "bg-primary font-semibold text-primary-foreground" : "text-foreground"}`}>{fmt(d, "d")}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex border-b border-border">
        <span className="flex w-12 shrink-0 items-center justify-end pr-2 text-[10.5px] whitespace-nowrap text-muted-foreground">dia todo</span>
        <div className="relative flex-1 transition-[height] duration-300" style={{ height: nRaias * 26 + 6 }}>
          <AnimatePresence initial={false}>
            {comRaia.map(({ e, de, ate, raia }) => (
              <BlocoEvento
                key={e.id}
                e={e}
                abrir={abrir}
                compacto
                className="absolute"
                style={{ top: 3 + raia * 26, left: `calc(${(de / dias.length) * 100}% + 3px)`, width: `calc(${((ate - de + 1) / dias.length) * 100}% - 6px)` }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div ref={rolagem} className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: 24 * HORA_PX }}>
          <div className="relative w-12 shrink-0">
            {Array.from({ length: 24 }, (_, h) =>
              h ? (
                <span key={h} className="absolute right-2.5 -mt-[7px] text-[11px] text-muted-foreground tabular-nums" style={{ top: h * HORA_PX }}>
                  {String(h).padStart(2, "0")}h
                </span>
              ) : null
            )}
          </div>
          <div className="relative flex flex-1">
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="pointer-events-none absolute inset-x-0 h-px bg-border/60" style={{ top: h * HORA_PX }} />
            ))}
            {dias.map((d) => (
              <div key={d.toISOString()} className="relative flex-1 border-l border-border/50 first:border-l-0">
                {Array.from({ length: 48 }, (_, i) => (
                  <button key={i} type="button" tabIndex={-1} aria-label={`Criar evento às ${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`} onClick={() => criar(new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(i / 2), i % 2 ? 30 : 0))} className="absolute inset-x-0 rounded-md transition-colors hover:bg-primary/[0.06]" style={{ top: (i * HORA_PX) / 2, height: HORA_PX / 2 }} />
                ))}
                <AnimatePresence initial={false}>
                  {f.eventos
                    .filter((e) => !e.diaInteiro && isSameDay(e.ini, d))
                    .map((e) => {
                      const top = (minutosDe(e.ini) / 60) * HORA_PX
                      const alt = Math.max(((minutosDe(e.fim) - minutosDe(e.ini)) / 60) * HORA_PX - 2, 22)
                      return <BlocoEvento key={e.id} e={e} abrir={abrir} compacto={varios} rico={!varios} className={`absolute right-[3px] left-[3px] ${varios ? "" : "max-w-[680px]"}`} style={{ top: top + 1, height: alt - 1 }} />
                    })}
                </AnimatePresence>
                {isSameDay(d, AGORA) ? (
                  <div className="pointer-events-none absolute inset-x-0 flex items-center" style={{ top: (minutosDe(AGORA) / 60) * HORA_PX }}>
                    <span className="-ml-1 size-2 rounded-full bg-destructive" />
                    <span className="h-px flex-1 bg-destructive" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisaoAgenda({ f, data, abrir }: { f: Focus; data: Date; abrir: (e: Evento) => void }) {
  const dias = Array.from({ length: 14 }, (_, i) => addDays(data, i)).filter((d) => f.eventos.some((e) => noDia(e, d)))
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {dias.map((d) => (
        <div key={d.toISOString()} className="flex gap-4 border-b border-border/70 px-3 py-3">
          <span className={`flex w-14 shrink-0 flex-col ${isSameDay(d, AGORA) ? "text-primary" : "text-muted-foreground"}`}>
            <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase">{fmt(d, "EEE")}</span>
            <span className="text-[22px] leading-none font-light">{fmt(d, "d")}</span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {f.eventos
              .filter((e) => noDia(e, d))
              .sort((a, b) => +a.ini - +b.ini)
              .map((e) => (
                <button key={e.id} type="button" onClick={() => abrir(e)} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-secondary/60">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: `var(--tone-${tomDaConta(e.conta)}-dot)` }} />
                  <span className="w-24 shrink-0 font-mono text-[11.5px] text-muted-foreground tabular-nums">{e.diaInteiro ? "dia inteiro" : `${fmt(e.ini, "HH:mm")}–${fmt(e.fim, "HH:mm")}`}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{e.titulo}</span>
                  {e.link ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
                      <VideoCamera size={13} /> {salaDe(e.link)}
                    </span>
                  ) : null}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ROTULO_VISAO: Record<Visao, string> = { mes: "Mês", semana: "Semana", dia: "Dia", agenda: "Agenda" }
const TECLA_VISAO: Record<Visao, string> = { mes: "M", semana: "S", dia: "D", agenda: "A" }

function tituloDoPeriodo(v: Visao, d: Date) {
  if (v === "mes") return fmt(d, "MMMM 'de' yyyy")
  if (v === "dia") return fmt(d, "EEEE, d 'de' MMMM")
  if (v === "agenda") return `A partir de ${fmt(d, "d 'de' MMM")}`
  const a = inicioSemana(d)
  const b = fimSemana(d)
  return `${fmt(a, "d")} – ${fmt(b, "d 'de' MMM 'de' yyyy")}`
}

/** As contas que aparecem no calendário, e "Conectar conta". */
function FiltroCalendarios({ f, abrirConectar, abrirConfig }: { f: Focus; abrirConectar: () => void; abrirConfig: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" aria-label="Calendários" className="text-muted-foreground">
            <span className="flex -space-x-1">
              {CONTAS.filter((c) => f.visiveis.has(c.id)).map((c) => (
                <span key={c.id} className="size-2.5 rounded-full ring-2 ring-card" style={{ background: `var(--tone-${c.tom}-dot)` }} />
              ))}
            </span>
            <span className="max-2xl:sr-only">Calendários</span>
            <CaretDown size={12} />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Calendários</DropdownMenuLabel>
          {CONTAS.map((c) => (
            <DropdownMenuCheckboxItem key={c.id} checked={f.visiveis.has(c.id)} onCheckedChange={() => f.alternarConta(c.id)} className="gap-2.5 py-1.5">
              <span className="size-2.5 rounded-full" style={{ background: `var(--tone-${c.tom}-dot)` }} />
              <span className="flex flex-col">
                <span className="text-[13.5px]">{c.nome}</span>
                <span className="text-[11.5px] text-muted-foreground">{c.detalhe}</span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={abrirConectar} className="text-primary">
          <Plus /> Conectar conta
        </DropdownMenuItem>
        <DropdownMenuItem onClick={abrirConfig}>
          <GearSix /> Configurações do calendário
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── as configurações do calendário ───────────────────────────────────────

/** As preferências do calendário (no app, da API, por pessoa). O calendário lê daqui. */
interface Preferencias {
  contaPadrao: string
  duracao: number
  salaAuto: "nenhuma" | "meet" | "zoom" | "teams"
  aviso: number
  semanaComeca: 0 | 1
  expediente: [string, string]
  fimDeSemana: boolean
  fuso: string
}
const PREF_INICIAL: Preferencias = { contaPadrao: "google", duracao: 30, salaAuto: "nenhuma", aviso: 10, semanaComeca: 0, expediente: ["08:00", "18:00"], fimDeSemana: true, fuso: "America/Sao_Paulo" }
// o espelho das preferências que os componentes do calendário leem (o App atualiza a cada render)
let PREF: Preferencias = PREF_INICIAL
const inicioSemana = (d: Date) => startOfWeek(d, { locale: ptBRdatas, weekStartsOn: PREF.semanaComeca })
const fimSemana = (d: Date) => endOfWeek(d, { locale: ptBRdatas, weekStartsOn: PREF.semanaComeca })

const TONS = ["blue", "green", "purple", "orange", "pink", "cyan", "yellow", "red"]
const FUSOS = [
  { v: "America/Sao_Paulo", r: "São Paulo (GMT−3)" },
  { v: "America/Manaus", r: "Manaus (GMT−4)" },
  { v: "Europe/Lisbon", r: "Lisboa (GMT+0)" },
  { v: "America/New_York", r: "Nova York (GMT−5)" },
]

/** Um bloco das configurações: o título, a frase do que ele faz e as linhas. */
function Bloco({ titulo, texto, children, i }: { titulo: string; texto: string; children: React.ReactNode; i: number }) {
  return (
    <motion.section initial={{ opacity: 0, filter: "blur(10px)", y: 8 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } }} transition={{ duration: 0.5, ease: CURVA, delay: 0.1 + i * 0.08 }} className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-[16px] font-medium text-foreground-strong">{titulo}</h2>
        <p className="text-[13px] leading-snug text-muted-foreground">{texto}</p>
      </div>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
    </motion.section>
  )
}

/** Uma linha de configuração: o rótulo e a explicação à esquerda, o controle à direita. */
function Ajuste({ rotulo, texto, children }: { rotulo: string; texto?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3.5">
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] text-foreground">{rotulo}</span>
        {texto ? <span className="text-[12.5px] text-muted-foreground">{texto}</span> : null}
      </span>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  )
}

/** Uma conta conectada: o logo, o nome, a cor (um toque troca), mostrar ou não, a sincronização e
    o menu de desconectar. A conta do Muriki não sai: é a dos eventos dos workspaces. */
function LinhaConta({ c, f, avisar }: { c: Conta; f: Focus; avisar: (t: string) => void }) {
  const [sincronizando, setSincronizando] = React.useState(false)
  const [quando, setQuando] = React.useState(c.provedor === "muriki" ? "agora" : "há 2 min")
  return (
    <motion.div layout initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", height: 0 }} transition={{ duration: 0.35, ease: CURVA }} className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
        <LogoConta conta={c.id} tamanho={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14px] text-foreground">{c.nome}</span>
        <span className="flex items-center gap-1.5 truncate text-[12.5px] text-muted-foreground">
          {c.detalhe}
          <span aria-hidden>·</span>
          <Chega texto={sincronizando ? "sincronizando…" : `sincronizado ${quando}`} />
        </span>
      </span>
      {/* a cor da conta: o ponto abre as opções */}
      <Popover>
        <PopoverTrigger
          render={
            <button type="button" aria-label={`Cor de ${c.nome}`} className="grid size-8 place-items-center rounded-lg hover:bg-secondary">
              <motion.span layout className="size-3.5 rounded-full ring-2 ring-card" style={{ background: `var(--tone-${c.tom}-dot)`, boxShadow: `0 0 0 1px var(--tone-${c.tom}-dot)` }} />
            </button>
          }
        />
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-1.5">
            {TONS.map((t) => (
              <button key={t} type="button" aria-label={t} onClick={() => f.mudarCor(c.id, t)} className="grid size-7 place-items-center rounded-full transition-transform hover:scale-110" style={{ background: `var(--tone-${t}-dot)` }}>
                {c.tom === t ? <Check size={12} weight="bold" color="white" /> : null}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Switch checked={f.visiveis.has(c.id)} onCheckedChange={() => f.alternarConta(c.id)} aria-label={`Mostrar ${c.nome}`} />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Sincronizar ${c.nome}`}
        onClick={() => {
          setSincronizando(true)
          setTimeout(() => (setSincronizando(false), setQuando("agora")), 1200)
        }}
        className="text-muted-foreground"
      >
        <ArrowsClockwise size={16} className={sincronizando ? "animate-spin" : ""} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={`Mais opções de ${c.nome}`} className="text-muted-foreground">
              <DotsThree size={18} weight="bold" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem onClick={() => avisar(`Abrindo ${c.nome} para escolher os calendários (estudo)`)}>Escolher calendários</DropdownMenuItem>
          {c.provedor === "muriki" ? null : (
            <DropdownMenuItem
              onClick={() => {
                f.desconectar(c.id)
                avisar(`${c.nome} desconectado`)
              }}
              className="text-destructive"
            >
              Desconectar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

function ConfigCalendario({ f, avisar, abrirConectar, voltar }: { f: Focus; avisar: (t: string) => void; abrirConectar: () => void; voltar: () => void }) {
  const p = f.pref
  const muda = (x: Partial<Preferencias>) => f.mudarPref(x)
  const contaPadrao = CONTAS.find((c) => c.id === p.contaPadrao) ?? CONTAS[0]
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[920px] flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2">
          <button type="button" onClick={voltar} className="flex w-fit items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
            <CaretLeft size={12} /> Hoje
          </button>
          <h1 className="text-[30px] font-light tracking-[-0.03em] text-foreground-strong md:text-[36px]">
            <Revela texto="Configurações do calendário" />
          </h1>
        </div>

        <Bloco i={0} titulo="Contas" texto="Os calendários que o Focus junta: os eventos dos seus workspaces e as contas que você conectar.">
          <AnimatePresence initial={false}>
            {CONTAS.map((c) => (
              <LinhaConta key={c.id} c={c} f={f} avisar={avisar} />
            ))}
          </AnimatePresence>
          <button type="button" onClick={abrirConectar} className="flex items-center gap-2 px-4 py-3 text-left text-[14px] font-medium text-primary hover:bg-secondary/40">
            <Plus size={15} weight="bold" /> Conectar outra conta
          </button>
        </Bloco>

        <Bloco i={1} titulo="Novos eventos" texto="Como um evento já nasce quando você cria pelo calendário ou pela barra ⌘K.">
          <Ajuste rotulo="Calendário padrão" texto="Onde o evento novo vai parar.">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogoConta conta={contaPadrao.id} tamanho={14} /> <Chega texto={contaPadrao.nome} /> <CaretDown size={12} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuRadioGroup value={p.contaPadrao} onValueChange={(v) => muda({ contaPadrao: v as string })}>
                  {CONTAS.map((c) => (
                    <DropdownMenuRadioItem key={c.id} value={c.id} className="gap-2">
                      <LogoConta conta={c.id} tamanho={14} /> {c.nome}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Ajuste>
          <Ajuste rotulo="Duração">
            <ViewToggle size="sm" value={String(p.duracao)} onChange={(v) => muda({ duracao: Number(v) })} ariaLabel="Duração" options={[15, 30, 45, 60].map((m) => ({ value: String(m), label: m === 60 ? "1 h" : `${m} min` }))} />
          </Ajuste>
          <Ajuste rotulo="Reunião automática" texto="Cria a sala junto com o evento.">
            <ViewToggle
              size="sm"
              value={p.salaAuto}
              onChange={(v) => muda({ salaAuto: v })}
              ariaLabel="Reunião automática"
              options={[
                { value: "nenhuma", label: "Nenhuma" },
                { value: "meet", icon: <LogoSala link={novaSala("meet")} tamanho={14} />, label: "Meet" },
                { value: "zoom", icon: <LogoSala link={novaSala("zoom")} tamanho={14} />, label: "Zoom" },
                { value: "teams", icon: <LogoSala link={novaSala("teams")} tamanho={14} />, label: "Teams" },
              ]}
            />
          </Ajuste>
          <Ajuste rotulo="Avisar antes" texto="Notificação no navegador e no celular.">
            <ViewToggle size="sm" value={String(p.aviso)} onChange={(v) => muda({ aviso: Number(v) })} ariaLabel="Avisar antes" options={[0, 5, 10, 30].map((m) => ({ value: String(m), label: m === 0 ? "Não" : `${m} min` }))} />
          </Ajuste>
        </Bloco>

        <Bloco i={2} titulo="Exibição" texto="Como o calendário se arruma na tela.">
          <Ajuste rotulo="A semana começa no">
            <ViewToggle size="sm" value={String(p.semanaComeca)} onChange={(v) => muda({ semanaComeca: Number(v) as 0 | 1 })} ariaLabel="Começo da semana" options={[{ value: "0", label: "Domingo" }, { value: "1", label: "Segunda" }]} />
          </Ajuste>
          <Ajuste rotulo="Horário de trabalho" texto="O calendário abre no começo dele.">
            <Input type="time" value={p.expediente[0]} onChange={(e) => muda({ expediente: [e.target.value, p.expediente[1]] })} aria-label="Começa" className={`w-[96px] ${campoSutil}`} />
            <span className="text-muted-foreground">–</span>
            <Input type="time" value={p.expediente[1]} onChange={(e) => muda({ expediente: [p.expediente[0], e.target.value] })} aria-label="Termina" className={`w-[96px] ${campoSutil}`} />
          </Ajuste>
          <Ajuste rotulo="Mostrar o fim de semana" texto="Na semana, sábado e domingo.">
            <Switch checked={p.fimDeSemana} onCheckedChange={(v) => muda({ fimDeSemana: Boolean(v) })} aria-label="Mostrar o fim de semana" />
          </Ajuste>
          <Ajuste rotulo="Fuso horário">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe size={14} /> {FUSOS.find((x) => x.v === p.fuso)!.r} <CaretDown size={12} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuRadioGroup value={p.fuso} onValueChange={(v) => muda({ fuso: v as string })}>
                  {FUSOS.map((x) => (
                    <DropdownMenuRadioItem key={x.v} value={x.v}>
                      {x.r}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Ajuste>
        </Bloco>
      </div>
    </div>
  )
}

// ── o modal do evento ────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0")
const minutosDoDia = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))
const paraData = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const paraHora = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const juntar = (data: string, hora: string) => {
  const [a, m, d] = data.split("-").map(Number)
  const [h, mi] = hora.split(":").map(Number)
  return new Date(a, m - 1, d, h, mi)
}

/** Uma linha do modal do evento: o ícone à esquerda, sempre na mesma coluna, e o campo. */
function LinhaModal({ icone, children, alinhar = "center" }: { icone: React.ReactNode; children: React.ReactNode; alinhar?: "center" | "start" }) {
  return (
    <div className={`flex gap-3 ${alinhar === "start" ? "items-start" : "items-center"}`}>
      <span className={`grid w-5 shrink-0 place-items-center text-muted-foreground ${alinhar === "start" ? "pt-2" : ""}`}>{icone}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

const campoSutil = "h-9 border-transparent bg-secondary/50 shadow-none hover:bg-secondary focus-visible:bg-card"

/** Gera um link de exemplo da sala escolhida (no app, a API cria a reunião na conta da pessoa). */
const novaSala = (s: "meet" | "zoom" | "teams") => (s === "meet" ? "https://meet.google.com/nov-ento-agr" : s === "zoom" ? "https://muriki.zoom.us/j/4021998837" : "https://teams.microsoft.com/l/meetup-join/19%3anovo")

// as durações prontas: escolher uma calcula o fim a partir do começo
const DURACOES = [15, 30, 45, 60, 90]
const rotuloDuracao = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`)
const somarMin = (hora: string, m: number) => {
  const t = Math.min(minutosDoDia(hora) + m, 23 * 60 + 59)
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`
}

const RESPOSTAS: { v: Resposta; rotulo: string }[] = [
  { v: "sim", rotulo: "Vou" },
  { v: "talvez", rotulo: "Talvez" },
  { v: "nao", rotulo: "Não vou" },
]

/** As tarefas ligadas ao evento: uma linha por tarefa (código, título, workspace) e "Vincular
    tarefa", que busca pelo código ou pelo título entre as abertas que ainda não estão ligadas. */
function VincularTarefas({ f, codigos, mudar, travado }: { f: Focus; codigos: string[]; mudar: (c: string[]) => void; travado?: boolean }) {
  const [busca, setBusca] = React.useState("")
  const ligadas = codigos.map((c) => f.tarefas.find((x) => x.codigo === c)).filter((x): x is Tarefa => Boolean(x))
  const lista = f.tarefas.filter((x) => x.estado !== "done" && !codigos.includes(x.codigo) && (x.codigo + " " + x.titulo).toLowerCase().includes(busca.trim().toLowerCase())).slice(0, 6)
  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence initial={false}>
        {ligadas.map((t) => (
          <motion.span key={t.codigo} layout initial={{ opacity: 0, filter: "blur(8px)", height: 0 }} animate={{ opacity: 1, filter: "blur(0px)", height: "auto" }} exit={{ opacity: 0, filter: "blur(8px)", height: 0 }} transition={{ duration: 0.3, ease: CURVA }} className="flex h-9 items-center gap-2 rounded-lg bg-secondary/50 pr-1 pl-2.5 text-[14px]">
            <span className="font-mono text-[11.5px] text-muted-foreground">{t.codigo}</span>
            <span className="min-w-0 flex-1 truncate text-foreground">{t.titulo}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
              <span className="grid size-3.5 place-items-center rounded-[3px] text-[8px] font-semibold" style={{ background: `var(--tone-${t.ws.tom})`, color: `var(--tone-${t.ws.tom}-foreground)` }}>
                {t.ws.inicial}
              </span>
              {t.ws.nome}
            </span>
            {travado ? <span className="w-1" /> : (
              <Button variant="ghost" size="icon" aria-label={`Desvincular ${t.codigo}`} onClick={() => mudar(codigos.filter((c) => c !== t.codigo))} className="text-muted-foreground">
                <X size={14} />
              </Button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
      {travado ? (ligadas.length ? null : <span className="text-[13px] text-muted-foreground">Nenhuma tarefa vinculada</span>) : (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
                <Plus /> {ligadas.length ? "Vincular mais uma tarefa" : "Vincular tarefas"}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-80 p-1.5">
            <Input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Código ou título (ex.: MUR-100)" className={campoSutil} />
            <div className="mt-1 flex max-h-64 flex-col overflow-y-auto">
              {lista.map((x) => (
                <button key={x.id} type="button" onClick={() => (mudar([...codigos, x.codigo]), setBusca(""))} className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13.5px] hover:bg-secondary">
                  <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">{x.codigo}</span>
                  <span className="min-w-0 flex-1 truncate">{x.titulo}</span>
                </button>
              ))}
              {lista.length ? null : <span className="px-2 py-3 text-[13px] text-muted-foreground">Nenhuma tarefa com “{busca}”.</span>}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

const COR_RESPOSTA: Record<Resposta, string> = { sim: "var(--success)", talvez: "var(--tone-yellow-dot)", nao: "var(--destructive)", pendente: "var(--muted-foreground)" }
const TEXTO_RESPOSTA: Record<Resposta, string> = { sim: "vai", talvez: "talvez", nao: "não vai", pendente: "sem resposta" }

/** Os participantes: você (ou quem organizou) primeiro, cada um com a inicial, o nome e a resposta;
    convidar por nome ou e-mail, com as pessoas dos seus workspaces sugeridas. */
function Participantes({ lista, mudar, travado, organizador, minhaResposta = "sim" }: { lista: Participante[]; mudar: (p: Participante[]) => void; travado?: boolean; organizador?: string; minhaResposta?: Resposta }) {
  const [texto, setTexto] = React.useState("")
  const busca = texto.trim().toLowerCase()
  const sugestoes = busca ? PESSOAS.filter((p) => !lista.some((x) => x.email === p.email) && (p.nome + " " + p.email).toLowerCase().includes(busca)).slice(0, 4) : []
  const emailNovo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto.trim()) && !lista.some((x) => x.email === texto.trim()) && !sugestoes.some((p) => p.email === texto.trim())
  const convidar = (p: Omit<Participante, "resposta">) => {
    mudar([...lista, { ...p, resposta: "pendente" }])
    setTexto("")
  }
  // quem organiza primeiro; no convite, você logo depois, com a sua resposta
  const todos: (Participante & { voce?: boolean; org?: boolean })[] = organizador
    ? [{ nome: organizador, email: "", resposta: "sim", org: true }, { nome: "Você", email: CONTA_PESSOA.email, resposta: minhaResposta, voce: true }, ...lista.filter((p) => p.nome !== organizador)]
    : [{ nome: "Você", email: CONTA_PESSOA.email, resposta: "sim", voce: true, org: true }, ...lista]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {todos.map((p) => (
            <motion.div key={p.nome + p.email} layout initial={{ opacity: 0, filter: "blur(8px)", height: 0 }} animate={{ opacity: 1, filter: "blur(0px)", height: "auto" }} exit={{ opacity: 0, filter: "blur(8px)", height: 0 }} transition={{ duration: 0.3, ease: CURVA }} className="group flex h-9 items-center gap-2.5 rounded-lg px-1.5 text-[14px] hover:bg-secondary/40">
              <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-primary-subtle text-[10.5px] font-semibold text-primary-subtle-foreground">
                {p.nome[0]}
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card" style={{ background: COR_RESPOSTA[p.resposta] }} />
              </span>
              <span className="min-w-0 truncate text-foreground">{p.nome}</span>
              <span className="truncate text-[12px] text-muted-foreground">{p.org ? "organiza" : TEXTO_RESPOSTA[p.resposta]}</span>
              {travado || p.voce || p.org ? null : (
                <button type="button" aria-label={`Tirar ${p.nome}`} onClick={() => mudar(lista.filter((x) => x.email !== p.email))} className="ml-auto text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <X size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {travado ? null : (
        <div className="relative">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              if (sugestoes[0]) convidar(sugestoes[0])
              else if (emailNovo) convidar({ nome: texto.trim().split("@")[0], email: texto.trim() })
            }}
            placeholder="Convidar por nome ou e-mail"
            className="h-9 w-full rounded-lg bg-transparent px-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground hover:bg-secondary/40 focus:bg-secondary/50"
          />
          <AnimatePresence>
            {sugestoes.length || emailNovo ? (
              <motion.div initial={{ opacity: 0, filter: "blur(6px)", y: -4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.2, ease: CURVA }} className="absolute inset-x-0 top-10 z-10 flex flex-col rounded-xl border border-border bg-card p-1 shadow-lg">
                {sugestoes.map((p) => (
                  <button key={p.email} type="button" onClick={() => convidar(p)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13.5px] hover:bg-secondary">
                    <span className="grid size-6 place-items-center rounded-full bg-primary-subtle text-[10.5px] font-semibold text-primary-subtle-foreground">{p.nome[0]}</span>
                    <span className="flex-1">{p.nome}</span>
                    <span className="text-[12px] text-muted-foreground">{p.email}</span>
                  </button>
                ))}
                {emailNovo ? (
                  <button type="button" onClick={() => convidar({ nome: texto.trim().split("@")[0], email: texto.trim() })} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13.5px] hover:bg-secondary">
                    <Plus size={14} className="text-muted-foreground" /> Convidar {texto.trim()}
                  </button>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/** Criar e editar evento. De cima para baixo: o título; logo embaixo, em qual calendário; o
    quando (dia, começo e a duração pronta, que calcula o fim; o dia inteiro na mesma fileira das
    durações); a reunião; os participantes; as tarefas vinculadas; a pauta; a descrição.
    Evento de outra pessoa, para o qual você foi convidado: não se edita nem se exclui. Você
    responde (vou, talvez, não vou) e pode só tirar do seu calendário. */
function ModalEvento({ evento, fechar, f, avisar }: { evento: Evento | null; fechar: () => void; f: Focus; avisar: (t: string) => void }) {
  const novo = evento ? !f.todosEventos.some((e) => e.id === evento.id) : true
  const convidado = Boolean(evento?.organizador)
  const [titulo, setTitulo] = React.useState("")
  const [data, setData] = React.useState("2026-11-08")
  const [ini, setIni] = React.useState("10:00")
  const [duracao, setDuracao] = React.useState(30)
  const [inteiro, setInteiro] = React.useState(false)
  const [dataFim, setDataFim] = React.useState("2026-11-08")
  const [conta, setConta] = React.useState("google")
  const [link, setLink] = React.useState("")
  const [colando, setColando] = React.useState(false)
  const [tarefasEv, setTarefasEv] = React.useState<string[]>([])
  const [participantes, setParticipantes] = React.useState<Participante[]>([])
  const [pauta, setPauta] = React.useState<string[]>([])
  const [tema, setTema] = React.useState("")
  const [descricao, setDescricao] = React.useState("")
  const [resposta, setResposta] = React.useState<Resposta>("pendente")
  React.useEffect(() => {
    if (!evento) return
    setTitulo(evento.titulo)
    setData(paraData(evento.ini))
    setIni(paraHora(evento.ini))
    setDuracao(Math.max(15, Math.round((+evento.fim - +evento.ini) / 60000)))
    setInteiro(Boolean(evento.diaInteiro))
    setDataFim(paraData(evento.fim))
    setConta(evento.conta)
    setLink(evento.link ?? (novo && PREF.salaAuto !== "nenhuma" ? novaSala(PREF.salaAuto) : ""))
    setColando(false)
    setTarefasEv(evento.tarefas ?? [])
    setParticipantes(evento.participantes ?? [])
    setPauta(evento.pauta ?? [])
    setTema("")
    setDescricao(evento.descricao ?? "")
    setResposta(evento.resposta ?? "pendente")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento])
  const fim = somarMin(ini, duracao)
  const sala = salaDe(link.trim() || undefined)
  const contaAtual = CONTAS.find((c) => c.id === conta) ?? CONTAS[0]
  const pronto = titulo.trim().length > 0
  function salvar() {
    if (!evento || !pronto) return
    f.salvarEvento({ ...evento, titulo: titulo.trim(), ini: juntar(data, inteiro ? "00:00" : ini), fim: inteiro ? juntar(dataFim < data ? data : dataFim, "23:59") : juntar(data, fim), conta, diaInteiro: inteiro, link: link.trim() || undefined, tarefas: tarefasEv.length ? tarefasEv : undefined, participantes: participantes.length ? participantes : undefined, pauta: pauta.length ? pauta : undefined, descricao: descricao.trim() || undefined })
    avisar(novo ? `Evento criado no ${contaAtual.nome}` : "Evento salvo")
    fechar()
  }
  function responder(r: Resposta) {
    if (!evento) return
    setResposta(r)
    f.salvarEvento({ ...evento, resposta: r })
    avisar(r === "sim" ? "Você confirmou presença" : r === "talvez" ? "Você respondeu talvez" : "Você recusou o convite")
  }
  return (
    <Modal open={evento !== null} onOpenChange={(o) => !o && fechar()}>
      <ModalContent className="sm:max-w-[540px]">
        <ModalHeader className="sr-only">
          <ModalTitle>{novo ? "Novo evento" : "Evento"}</ModalTitle>
          <ModalDescription>{evento ? fmt(juntar(data, "12:00"), "EEEE, d 'de' MMMM") : ""}</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 pt-1">
            {/* o título e, logo embaixo, em qual calendário */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <span className="grid w-5 shrink-0 place-items-center">
                  <motion.span layout className="h-6 w-[4px] rounded-full" style={{ background: `var(--tone-${contaAtual.tom}-dot)` }} />
                </span>
                {convidado ? (
                  <span className="min-w-0 flex-1 truncate text-[22px] font-light tracking-[-0.02em] text-foreground-strong">{titulo}</span>
                ) : (
                  <input autoFocus={novo} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Adicionar título" className="h-10 min-w-0 flex-1 bg-transparent text-[22px] font-light tracking-[-0.02em] text-foreground-strong outline-none placeholder:text-muted-foreground/70" />
                )}
              </div>
              <div className="pl-8">
                {convidado ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <LogoConta conta={conta} tamanho={13} /> {contaAtual.nome} · convite de <span className="text-foreground">{evento?.organizador}</span>
                  </span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button type="button" className="-ml-1.5 inline-flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          <LogoConta conta={conta} tamanho={13} />
                          <Chega texto={contaAtual.nome} />
                          <span className="text-muted-foreground/80">{contaAtual.detalhe}</span>
                          <CaretDown size={11} />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="start" className="min-w-72">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Em qual calendário</DropdownMenuLabel>
                        {CONTAS.map((c) => (
                          <DropdownMenuItem key={c.id} onClick={() => setConta(c.id)} className="gap-2.5 py-1.5">
                            <LogoConta conta={c.id} tamanho={16} />
                            <span className="flex flex-col">
                              <span className="text-[13.5px]">{c.nome}</span>
                              <span className="text-[11.5px] text-muted-foreground">{c.detalhe}</span>
                            </span>
                            <span className="ml-auto size-2.5 rounded-full" style={{ background: `var(--tone-${c.tom}-dot)` }} />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* convite: a resposta no lugar de editar */}
            {convidado ? (
              <LinhaModal icone={<Check size={17} />}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[13.5px] text-foreground">Você vai?</span>
                  <ViewToggle size="sm" value={resposta === "pendente" ? "nenhuma" : resposta} onChange={(v) => v !== "nenhuma" && responder(v as Resposta)} ariaLabel="Responder o convite" options={RESPOSTAS.map((r) => ({ value: r.v, label: r.rotulo }))} />
                </div>
              </LinhaModal>
            ) : null}

            {/* quando: o dia, o começo e a duração pronta; o fim sai sozinho */}
            <LinhaModal icone={<Clock size={17} />} alinhar="start">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Input type="date" disabled={convidado} value={data} onChange={(e) => setData(e.target.value)} aria-label="Dia" className={`w-[148px] ${campoSutil}`} />
                  <AnimatePresence initial={false} mode="popLayout">
                    {inteiro ? (
                      <motion.span key="ate" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.3, ease: CURVA }} className="flex items-center gap-1.5">
                        <span className="text-[13px] text-muted-foreground">até</span>
                        <Input type="date" disabled={convidado} value={dataFim < data ? data : dataFim} min={data} onChange={(e) => setDataFim(e.target.value)} aria-label="Último dia" className={`w-[148px] ${campoSutil}`} />
                      </motion.span>
                    ) : (
                      <motion.span key="horas" initial={{ opacity: 0, filter: "blur(6px)", width: 0 }} animate={{ opacity: 1, filter: "blur(0px)", width: "auto" }} exit={{ opacity: 0, filter: "blur(6px)", width: 0 }} transition={{ duration: 0.3, ease: CURVA }} className="flex items-center gap-1.5 overflow-hidden">
                        <Input type="time" disabled={convidado} value={ini} onChange={(e) => setIni(e.target.value)} aria-label="Começa" className={`w-[96px] ${campoSutil}`} />
                        <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                          até <Chega texto={fim} className="text-foreground tabular-nums" />
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {convidado ? null : (
                  <div className="flex flex-wrap items-center gap-1">
                    {DURACOES.map((m) => {
                      const on = !inteiro && duracao === m
                      return (
                        <button key={m} type="button" onClick={() => (setInteiro(false), setDuracao(m))} className={`h-7 rounded-md px-2.5 text-[12.5px] tabular-nums transition-colors ${on ? "bg-primary-subtle font-medium text-primary-subtle-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                          {rotuloDuracao(m)}
                        </button>
                      )
                    })}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <button type="button" onClick={() => setInteiro(!inteiro)} className={`h-7 rounded-md px-2.5 text-[12.5px] transition-colors ${inteiro ? "bg-primary-subtle font-medium text-primary-subtle-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      Dia inteiro
                    </button>
                  </div>
                )}
              </div>
            </LinhaModal>

            <LinhaModal icone={sala ? <LogoSala link={link} tamanho={16} /> : <VideoCamera size={17} />}>
              <AnimatePresence mode="wait" initial={false}>
                {link && !colando ? (
                  <motion.div key="sala" {...troca} className="flex h-9 items-center gap-2 rounded-lg bg-secondary/50 pr-1 pl-2.5">
                    <span className="text-[14px] text-foreground">{sala === "Link" ? "Reunião" : sala}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-muted-foreground">{link.replace(/^https?:\/\//, "")}</span>
                    {novo ? null : (
                      <Button variant="ghost" size="sm" render={<a href={link} target="_blank" rel="noreferrer" />} className="text-primary">
                        Entrar <ArrowSquareOut />
                      </Button>
                    )}
                    {convidado ? null : (
                      <Button variant="ghost" size="icon" aria-label="Tirar a reunião" onClick={() => setLink("")} className="text-muted-foreground">
                        <X size={14} />
                      </Button>
                    )}
                  </motion.div>
                ) : convidado ? (
                  <motion.span key="sem" {...troca} className="text-[13px] text-muted-foreground">
                    Sem reunião
                  </motion.span>
                ) : colando ? (
                  <motion.div key="colar" {...troca}>
                    <Input autoFocus value={link} onChange={(e) => setLink(e.target.value)} onBlur={() => setColando(false)} onKeyDown={(e) => e.key === "Enter" && setColando(false)} placeholder="Cole o link do Zoom, Meet ou Teams" className={campoSutil} />
                  </motion.div>
                ) : (
                  <motion.div key="botoes" {...troca} className="-ml-2 flex flex-wrap items-center gap-0.5">
                    {(["meet", "zoom", "teams"] as const).map((x) => (
                      <Button key={x} variant="ghost" size="sm" onClick={() => setLink(novaSala(x))} className="text-muted-foreground">
                        <LogoSala link={novaSala(x)} tamanho={14} /> {x === "meet" ? "Meet" : x === "zoom" ? "Zoom" : "Teams"}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setColando(true)} className="text-muted-foreground">
                      <LinkSimple /> Colar link
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </LinhaModal>

            {/* quem participa, com a resposta de cada um */}
            <LinhaModal icone={<Users size={17} />} alinhar="start">
              <Participantes lista={participantes} mudar={setParticipantes} travado={convidado} organizador={evento?.organizador} minhaResposta={resposta} />
            </LinhaModal>

            {/* as tarefas ligadas ao evento (ex.: o refinamento da MUR-100 e da MUR-101) */}
            <LinhaModal icone={<ListChecks size={17} />} alinhar="start">
              <VincularTarefas f={f} codigos={tarefasEv} mudar={setTarefasEv} travado={convidado} />
            </LinhaModal>

            <LinhaModal icone={<ListNumbers size={17} />} alinhar="start">
              <div className="flex flex-col gap-1">
                <AnimatePresence initial={false}>
                  {pauta.map((p, i) => (
                    <motion.div key={p + i} layout initial={{ opacity: 0, filter: "blur(8px)", height: 0 }} animate={{ opacity: 1, filter: "blur(0px)", height: "auto" }} exit={{ opacity: 0, filter: "blur(8px)", height: 0 }} transition={{ duration: 0.3, ease: CURVA }} className="group flex h-8 items-center gap-2.5 rounded-lg px-2 text-[14px] hover:bg-secondary/50">
                      <span className="w-3 text-[12px] text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="flex-1 text-foreground">{p}</span>
                      {convidado ? null : (
                        <button type="button" aria-label={`Tirar "${p}" da pauta`} onClick={() => setPauta(pauta.filter((_, j) => j !== i))} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {convidado ? (
                  pauta.length ? null : <span className="pt-2 text-[13px] text-muted-foreground">Sem pauta</span>
                ) : (
                  <input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tema.trim()) {
                        e.preventDefault()
                        setPauta([...pauta, tema.trim()])
                        setTema("")
                      }
                    }}
                    placeholder={pauta.length ? "Mais um tema e Enter" : "Pauta da call: um tema e Enter"}
                    className="h-9 rounded-lg bg-transparent px-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground hover:bg-secondary/40 focus:bg-secondary/50"
                  />
                )}
              </div>
            </LinhaModal>

            {convidado && !descricao ? null : (
              <LinhaModal icone={<TextAlignLeft size={17} />} alinhar="start">
                <Textarea readOnly={convidado} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" rows={2} className="min-h-[60px] border-transparent bg-transparent shadow-none hover:bg-secondary/40 focus-visible:bg-secondary/50" />
              </LinhaModal>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          {convidado ? (
            <>
              <Button
                variant="ghost"
                className="mr-auto text-muted-foreground"
                onClick={() => {
                  if (evento) f.excluirEvento(evento.id)
                  avisar("Tirado do seu calendário. O evento continua para os outros.")
                  fechar()
                }}
              >
                Tirar do meu calendário
              </Button>
              <Button variant="solid" onClick={fechar}>
                Pronto
              </Button>
            </>
          ) : (
            <>
              {novo ? null : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Excluir o evento"
                  title="Excluir"
                  className="mr-auto text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (evento) f.excluirEvento(evento.id)
                    avisar("Evento excluído")
                    fechar()
                  }}
                >
                  <Trash />
                </Button>
              )}
              <Button variant="ghost" onClick={fechar}>
                Cancelar
              </Button>
              <Button variant="solid" disabled={!pronto} onClick={salvar}>
                {novo ? "Criar evento" : "Salvar"}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ── as tarefas ───────────────────────────────────────────────────────────

/** As tarefas do lado: as abas de tipo e as páginas do tamanho que couber
    (a home não rola). */
function PainelTarefas({ f }: { f: Focus }) {
  const [tipo, setTipo] = React.useState<"todas" | "pessoais" | "projetos">("todas")
  const [pagina, setPagina] = React.useState(0)
  const [porPagina, setPorPagina] = React.useState(4)
  const [texto, setTexto] = React.useState("")
  const caixa = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    if (!caixa.current) return
    const ro = new ResizeObserver(([e]) => setPorPagina(Math.max(2, Math.floor(e.contentRect.height / 50))))
    ro.observe(caixa.current)
    return () => ro.disconnect()
  }, [])
  // a ida ao servidor, simulada: abrir, trocar de aba e de página passam pelo skeleton
  const [carregando, setCarregando] = React.useState(true)
  React.useEffect(() => {
    setCarregando(true)
    const t = setTimeout(() => setCarregando(false), 650)
    return () => clearTimeout(t)
  }, [tipo, pagina])
  const lista = f.tarefas.filter((t) => (tipo === "todas" ? true : tipo === "pessoais" ? t.ws.pessoal : !t.ws.pessoal)).sort((a, b) => Number(a.estado === "done") - Number(b.estado === "done"))
  const paginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const p = Math.min(pagina, paginas - 1)
  const vis = lista.slice(p * porPagina, p * porPagina + porPagina)
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* as abas são o cabeçalho da lista: o filete de linha das Tabs da casa, com quantas abertas tem
          em cada uma (a contagem chega desfocada quando muda) */}
      <Tabs
        value={tipo}
        onValueChange={(v) => {
          setTipo(v as typeof tipo)
          setPagina(0)
        }}
      >
        <TabsList variant="line" className="gap-5">
          {(
            [
              ["todas", "Todas"],
              ["pessoais", "Pessoais"],
              ["projetos", "Projetos"],
            ] as const
          ).map(([v, rotulo]) => {
            const n = f.tarefas.filter((t) => t.estado !== "done" && (v === "todas" ? true : v === "pessoais" ? t.ws.pessoal : !t.ws.pessoal)).length
            return (
              <TabsTrigger key={v} value={v} className="gap-1.5 text-[14px]">
                {rotulo}
                <Chega texto={String(n)} className="font-mono text-[11px] text-muted-foreground tabular-nums" />
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
      <label className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-muted-foreground transition-colors focus-within:bg-secondary/70 hover:bg-secondary/40">
        <Plus size={15} />
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && texto.trim()) {
              f.adicionarTarefa(texto.trim())
              setTexto("")
              setPagina(0)
            }
          }}
          placeholder="Nova tarefa"
          className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground-strong outline-none placeholder:text-muted-foreground"
        />
      </label>
      <div ref={caixa} className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${tipo}-${p}-${carregando}`} initial={{ opacity: 0, filter: "blur(8px)", y: 6 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(8px)", y: -6 }} transition={{ duration: 0.3, ease: CURVA }} className="flex flex-col">
            {carregando
              ? // o molde de cada linha que vem: as mesmas peças, nos mesmos lugares, do tamanho do texto
                // de cada tarefa, e a cor do workspace dela; o brilho desce linha a linha
                vis.map((t, i) => {
                  const subtitulo = t.ws.pessoal ? (t.projeto ?? "Pessoal") : `${t.ws.nome}${t.projeto ? ` · ${t.projeto}` : ""}`
                  const d = i * 0.08
                  return (
                    <div key={t.id} className="flex h-[50px] items-center gap-2.5 px-2">
                      <span className="size-[18px] shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--muted-foreground)_25%,transparent)]" />
                      <span className="flex min-w-0 flex-1 flex-col gap-[7px]">
                        <Osso atraso={d} className="h-[11px] max-w-full rounded-[4px]" style={{ width: Math.min(t.titulo.length * 6.6, 200) }} />
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Osso atraso={d} className="h-[9px] rounded-[3px]" style={{ width: t.codigo.length * 6.3 }} />
                          <Osso atraso={d} className="size-3.5 shrink-0 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--tone-${t.ws.tom}) 75%, var(--card))` }} />
                          <Osso atraso={d} azul className="h-[9px] max-w-full rounded-[3px]" style={{ width: Math.min(subtitulo.length * 5.8, 140) }} />
                        </span>
                      </span>
                      {t.origem ? (
                        <Osso atraso={d} className="size-[18px] shrink-0 rounded-[5px]" />
                      ) : null}
                      <span className="flex w-8 shrink-0 justify-end">
                        <Osso atraso={d} className="h-[9px] rounded-[3px]" style={{ width: t.prazo.length * 6.3 }} />
                      </span>
                    </div>
                  )
                })
              : null}
            {carregando ? null : vis.map((t) => (
              <div key={t.id} className="flex h-[50px] items-center gap-2.5 rounded-lg px-2 hover:bg-secondary/50">
                <Concluir feita={t.estado === "done"} onClick={() => f.alternarTarefa(t.id)} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`truncate text-[13.5px] ${t.estado === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.titulo}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <span className="shrink-0 font-mono text-[10.5px] text-foreground/70">{t.codigo}</span>
                    <span className="grid size-3.5 shrink-0 place-items-center rounded-[3px] text-[8px] font-semibold" title={t.ws.nome} style={{ background: `var(--tone-${t.ws.tom})`, color: `var(--tone-${t.ws.tom}-foreground)` }}>
                      {t.ws.inicial}
                    </span>
                    <span className="truncate">
                      {t.ws.pessoal ? (t.projeto ?? "Pessoal") : `${t.ws.nome}${t.projeto ? ` · ${t.projeto}` : ""}`}
                    </span>
                  </span>
                </span>
                {t.origem ? <IconeOrigem o={t.origem} /> : null}
                <span className="w-8 shrink-0 text-right font-mono text-[10.5px] text-muted-foreground">{t.prazo}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {paginas > 1 ? (
        <div className="flex shrink-0 items-center justify-between border-t border-border pt-2">
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {p * porPagina + 1}–{Math.min(lista.length, (p + 1) * porPagina)} de {lista.length}
          </span>
          <span className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Página anterior" disabled={p === 0} onClick={() => setPagina(p - 1)}>
              <CaretLeft />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Próxima página" disabled={p >= paginas - 1} onClick={() => setPagina(p + 1)}>
              <CaretRight />
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  )
}

const COLUNAS_KANBAN: KanbanColumnSpec[] = [
  { id: "todo", name: "A fazer", color: null },
  { id: "doing", name: "Fazendo", color: "var(--tone-blue-dot)" },
  { id: "done", name: "Feito", color: "var(--success)" },
]

function KanbanTarefas({ f }: { f: Focus }) {
  const cards: KanbanTask[] = f.tarefas.map((t) => ({ slug: t.codigo, title: t.titulo, description: `${t.ws.nome}${t.projeto ? ` · ${t.projeto}` : ""}${t.origem ? ` · via ${t.origem === "email" ? "e-mail" : ORIGENS[t.origem].nome}` : ""}`, priority: t.prioridade, progress: t.estado === "done" ? 100 : t.estado === "doing" ? 50 : 0, timeLabel: t.prazo, statusId: t.estado }))
  return (
    // as colunas do KanbanBoard têm largura fixa (w-72): aqui elas esticam para encher o espaço; no
    // registry, isso vira uma opção do bloco
    <div className="h-full overflow-auto p-3 [&_[role=list]>*]:w-auto [&_[role=list]>*]:min-w-64 [&_[role=list]>*]:flex-1">
      <KanbanBoard
        columns={COLUNAS_KANBAN}
        tasks={cards}
        onTasksChange={(ks) => f.setTarefas((ts) => ks.map((k) => ({ ...ts.find((t) => t.codigo === k.slug)!, estado: k.statusId as Tarefa["estado"] })))}
        onToggleDone={(slug) => f.alternarTarefa(f.tarefas.find((t) => t.codigo === slug)!.id)}
      />
    </div>
  )
}

// ── a home ───────────────────────────────────────────────────────────────

/** A troca de período passa pelo desfoque, com direção: o que sai vai para um lado desfocando, o que
    entra chega do outro, desfocado, e assenta. */
const trocaPeriodo = {
  entra: (dir: number) => ({ opacity: 0, filter: "blur(12px)", x: dir * 32 }),
  fica: { opacity: 1, filter: "blur(0px)", x: 0, transitionEnd: { filter: "none" } },
  sai: (dir: number) => ({ opacity: 0, filter: "blur(12px)", x: dir * -32 }),
}

function chaveDoPeriodo(v: Visao, d: Date) {
  if (v === "mes") return fmt(d, "yyyy-MM")
  if (v === "semana") return fmt(inicioSemana(d), "yyyy-MM-dd")
  return fmt(d, "yyyy-MM-dd")
}

/** O mês do lado: o Calendar da casa, com os pontinhos das contas nos dias que têm evento. */
function MesComCores({ f, data, escolher, visao }: { f: Focus; data: Date; escolher: (d: Date) => void; visao: Visao }) {
  const ini = inicioSemana(data)
  const semana = Array.from({ length: 7 }, (_, i) => addDays(ini, i))
  return (
    <div className="shrink-0 rounded-2xl border border-border bg-card p-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
    <Calendar
      weekStartsOn={PREF.semanaComeca}
      modifiers={{ semana: visao === "semana" ? semana : [], semanaIni: visao === "semana" ? [semana[0]] : [], semanaFim: visao === "semana" ? [semana[6]] : [], fimDeSemana: { dayOfWeek: [0, 6] } }}
      modifiersClassNames={{ semana: "bg-primary-subtle/70", semanaIni: "rounded-l-lg", semanaFim: "rounded-r-lg", fimDeSemana: "[&_button]:text-muted-foreground" }}
      mode="single"
      locale={ptBR}
      selected={data}
      onSelect={(d) => d && escolher(d)}
      month={data}
      onMonthChange={escolher}
      className="w-full p-0"
      components={{
        DayButton: ({ day, modifiers, children, ...props }) => {
          void modifiers
          const contas = [...new Set(f.eventos.filter((e) => noDia(e, day.date)).map((e) => e.conta))].slice(0, 3)
          return (
            <button {...props} style={{ ...props.style, position: "relative" }}>
              <span className="-translate-y-[3px]">{children}</span>
              {contas.length ? (
                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[4px] flex justify-center gap-[3px]">
                  {contas.map((c) => (
                    <span key={c} className="size-[4px] rounded-full" style={{ background: `var(--tone-${tomDaConta(c)}-dot)` }} />
                  ))}
                </span>
              ) : null}
            </button>
          )
        },
      }}
    />
    </div>
  )
}

/** Um osso do skeleton: a forma do que vai chegar, com o brilho passando. */
function Osso({ className = "", style, azul = false, atraso = 0 }: { className?: string; style?: React.CSSProperties; azul?: boolean; atraso?: number }) {
  return (
    <span className={`relative block overflow-hidden ${className.includes("rounded") ? "" : "rounded-md"} ${className}`} style={{ background: azul ? "color-mix(in oklab, var(--primary) 18%, var(--card))" : "color-mix(in oklab, var(--muted-foreground) 16%, var(--card))", ...style }}>
      <motion.span aria-hidden className="absolute inset-y-0 w-1/2" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--card) 70%, transparent), transparent)" }} initial={{ x: "-100%" }} animate={{ x: "300%" }} transition={{ duration: 1.3, ease: "easeInOut", repeat: Infinity, delay: atraso }} />
    </span>
  )
}

/** O esqueleto do calendário e do quadro, no molde de cada visão. */
function Esqueleto({ tipo }: { tipo: Visao | "kanban" }) {
  if (tipo === "kanban")
    return (
      <div className="flex h-full gap-3 p-3">
        {[4, 2, 1].map((n, c) => (
          <div key={c} className="flex flex-1 flex-col gap-2.5 rounded-lg bg-muted/40 p-3">
            <Osso className="h-3 w-24" />
            {Array.from({ length: n }, (_, i) => (
              <Osso key={i} azul className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    )
  if (tipo === "mes")
    return (
      <div className="grid h-full grid-cols-7 grid-rows-5 gap-px p-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-1.5">
            <Osso className="size-5 rounded-full" />
            {i % 3 === 0 ? <Osso azul className="h-4 w-full" /> : null}
            {i % 5 === 1 ? <Osso azul className="h-4 w-2/3" /> : null}
          </div>
        ))}
      </div>
    )
  if (tipo === "agenda")
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <Osso className="h-10 w-12" />
            <div className="flex flex-1 flex-col gap-2">
              <Osso azul className="h-4 w-3/4" />
              <Osso azul className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  const cols = tipo === "dia" ? 1 : 7
  return (
    <div className="relative flex h-full gap-1 p-2 pl-14">
      {/* a régua das horas por trás, para os ossos caírem no lugar */}
      {Array.from({ length: 14 }, (_, i) => (
        <span key={`h${i}`} className="pointer-events-none absolute right-0 left-0 flex items-center gap-2 pl-2" style={{ top: `${(i / 14) * 100}%` }}>
          <Osso className="h-2 w-8 rounded-sm" />
          <span className="h-px flex-1 bg-border/60" />
        </span>
      ))}
      {Array.from({ length: cols }, (_, c) => (
        <div key={c} className="relative flex-1">
          {[0.1, 0.32, 0.55].map((t, i) => ((c + i) % 3 === 2 ? null : <Osso key={i} azul className="absolute inset-x-1 rounded-lg" style={{ top: `${t * 100 + ((c * 7) % 12)}%`, height: `${8 + ((c + i) % 3) * 4}%` }} />))}
        </div>
      ))}
    </div>
  )
}

function Home({ f, avisar, controle }: { f: Focus; avisar: (t: string) => void; controle: Controle }) {
  const { visao, setVisao, data, setData, modo, setModo, cheio, setCheio, abrirEvento, abrirConectar, abrirConfig } = controle
  const [dir, setDir] = React.useState(1)
  const proximo = f.eventos.filter((e) => !e.diaInteiro && isSameDay(e.ini, AGORA) && e.ini > AGORA).sort((a, b) => +a.ini - +b.ini)[0]
  const criar = (d: Date) => abrirEvento({ id: `e${Date.now()}`, titulo: "", ini: d, fim: new Date(+d + PREF.duracao * 60000), conta: PREF.contaPadrao })
  const irPara = (d: Date) => {
    setDir(+d >= +data ? 1 : -1)
    setData(d)
  }
  const andar = (n: number) => irPara(visao === "mes" ? addMonths(data, n) : addDays(data, n * (visao === "semana" ? 7 : visao === "agenda" ? 14 : 1)))
  const semana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana(data), i)).filter((d) => PREF.fimDeSemana || (d.getDay() !== 0 && d.getDay() !== 6))
  // a ida ao servidor, simulada: cada período, visão ou o quadro novo passa pelo skeleton
  const chave = modo === "kanban" ? "kanban" : `${visao}-${chaveDoPeriodo(visao, data)}`
  const [carregando, setCarregando] = React.useState(true)
  React.useEffect(() => {
    setCarregando(true)
    const t = setTimeout(() => setCarregando(false), 520)
    return () => clearTimeout(t)
  }, [chave])

  // o calendário ou o quadro, e a tela inteira: controles da página, não da barra do calendário
  const trocaModo = <ViewToggle size="sm" value={modo} onChange={setModo} ariaLabel="Ver o calendário ou o quadro" options={[{ value: "calendario", icon: <Hoje31 className="size-4" />, ariaLabel: "Calendário" }, { value: "kanban", icon: <Kanban size={16} />, ariaLabel: "Quadro das tarefas" }]} />
  const telaInteira = (
    <Button variant="ghost" size="sm" onClick={() => setCheio(!cheio)} className="gap-1.5 text-muted-foreground" title={cheio ? "Sair da tela inteira (Esc)" : "Tela inteira"}>
      {cheio ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
      <span className="sr-only">{cheio ? "Sair da tela inteira" : "Tela inteira"}</span>
    </Button>
  )

  return (
    <div className={`flex h-full min-h-0 flex-col ${cheio ? "" : "gap-5"}`}>
      <AnimatePresence initial={false}>
        {cheio ? null : (
          <motion.div key="saudacao" initial={{ opacity: 0, height: 0, filter: "blur(8px)" }} animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }} exit={{ opacity: 0, height: 0, filter: "blur(8px)" }} transition={{ duration: 0.4, ease: CURVA }} className="flex shrink-0 items-end gap-4 overflow-hidden">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Etiqueta>
                <Chega texto={`${f.eventos.filter((e) => isSameDay(e.ini, AGORA)).length} eventos · ${f.tarefas.filter((t) => t.estado !== "done" && t.prazo === "hoje").length} tarefas hoje`} />
              </Etiqueta>
              <h1 className="truncate text-[24px] leading-tight font-light tracking-[-0.025em] text-foreground-strong md:text-[28px]">
                <Revela texto="Bom dia, Guilherme." />{" "}
                <span className="text-muted-foreground">
                  <Revela texto={proximo ? `O próximo: ${proximo.titulo}, às ${fmt(proximo.ini, "HH:mm")}.` : "Nada mais na agenda hoje."} atraso={0.2} />
                </span>
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex min-h-0 flex-1 ${cheio ? "" : "gap-6"}`}>
        {/* à esquerda: o mês e as tarefas */}
        <AnimatePresence initial={false}>
          {cheio ? null : (
            <motion.aside key="lado" initial={{ opacity: 0, width: 0, filter: "blur(8px)" }} animate={{ opacity: 1, width: 288, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0, width: 0, filter: "blur(8px)" }} transition={{ duration: 0.45, ease: CURVA }} className="hidden min-h-0 shrink-0 flex-col gap-4 overflow-hidden lg:flex">
              <MesComCores f={f} data={data} visao={visao} escolher={(d) => (setModo("calendario"), irPara(d))} />
              <PainelTarefas f={f} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* à direita: o calendário (ou o quadro), que rola por dentro */}
        <motion.section layout transition={{ duration: 0.45, ease: CURVA }} className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card ${cheio ? "" : "rounded-2xl border border-border"}`}>
          <div className={`flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 transition-[padding] duration-300 ${cheio ? "md:pl-[72px]" : ""}`}>
            {modo === "calendario" ? (
              <>
                <Button variant="outline" size="sm" onClick={() => irPara(AGORA)}>
                  Hoje
                </Button>
                <span className="flex">
                  <Button variant="ghost" size="icon" aria-label="Anterior" onClick={() => andar(-1)}>
                    <CaretLeft />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Seguinte" onClick={() => andar(1)}>
                    <CaretRight />
                  </Button>
                </span>
                <Chega texto={tituloDoPeriodo(visao, data)} className="min-w-0 truncate text-[15px] font-medium text-foreground-strong first-letter:uppercase" />
                <span className="ml-auto flex items-center gap-1.5">
                  <FiltroCalendarios f={f} abrirConectar={abrirConectar} abrirConfig={abrirConfig} />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Chega texto={ROTULO_VISAO[visao]} /> <CaretDown size={12} />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuRadioGroup value={visao} onValueChange={(v) => setVisao(v as Visao)}>
                        {(Object.keys(ROTULO_VISAO) as Visao[]).map((v) => (
                          <DropdownMenuRadioItem key={v} value={v} className="justify-between">
                            {ROTULO_VISAO[v]} <Tecla>{TECLA_VISAO[v]}</Tecla>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="solid" size="sm" onClick={() => criar(new Date(+AGORA + 40 * 60000))} className="max-md:hidden">
                    <Plus weight="bold" /> Novo evento
                  </Button>
                </span>
              </>
            ) : (
              <span className="px-1 text-[15px] font-medium text-foreground-strong">Quadro das tarefas</span>
            )}
            {/* o calendário ou o quadro, e a tela inteira: juntos, depois de um fio, no fim da barra */}
            <span className={`flex items-center gap-1.5 border-l border-border pl-2 max-md:hidden ${modo === "calendario" ? "" : "ml-auto"}`}>
              {trocaModo}
              {telaInteira}
            </span>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={carregando ? dir : 0}>
              <motion.div key={`${chave}-${carregando ? "osso" : "pronto"}`} custom={carregando ? dir : 0} variants={trocaPeriodo} initial="entra" animate="fica" exit="sai" transition={{ duration: 0.42, ease: CURVA }} className="absolute inset-0">
                {carregando ? <Esqueleto tipo={modo === "kanban" ? "kanban" : visao} /> : modo === "kanban" ? <KanbanTarefas f={f} /> : visao === "mes" ? <VisaoMes f={f} data={data} abrir={abrirEvento} criar={criar} /> : visao === "agenda" ? <VisaoAgenda f={f} data={data} abrir={abrirEvento} /> : <VisaoHoras f={f} dias={visao === "dia" ? [data] : semana} abrir={abrirEvento} criar={criar} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>
      </div>

      {/* celular: criar evento no lugar do polegar */}
      <Button variant="solid" size="touch" className="w-full shrink-0 md:hidden" onClick={() => criar(new Date(+AGORA + 40 * 60000))}>
        <Plus weight="bold" /> Novo evento
      </Button>
      {void avisar}
    </div>
  )
}

// ── conectar outro calendário ────────────────────────────────────────────

const PROVEDORES = [
  { id: "google", nome: "Google Calendar", cor: "#4285F4", tom: "pink", conta: "guilherme.pessoal@gmail.com", cals: ["Pessoal", "Aniversários", "Feriados no Brasil"] },
  { id: "outlook", nome: "Outlook", cor: "#0078D4", tom: "cyan", conta: "guilherme@freela.com.br", cals: ["Calendário", "Clientes"] },
  { id: "icloud", nome: "iCloud", cor: "#3693F3", tom: "orange", conta: "guilherme@icloud.com", cals: ["Casa", "Família"] },
  { id: "ics", nome: "Link .ics ou CalDAV", cor: "", tom: "yellow", conta: "", cals: [] },
] as const
type Provedor = (typeof PROVEDORES)[number]

function LogoProvedor({ p }: { p: Provedor }) {
  if (p.id === "outlook") return <MicrosoftOutlookLogo size={20} weight="fill" color={p.cor} />
  if (p.id === "ics") return <LinkSimple size={20} className="text-muted-foreground" />
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d={p.id === "google" ? LOGO_GOOGLE_CALENDAR : LOGO_ICLOUD} fill={p.cor} />
    </svg>
  )
}

/** Conectar um calendário: escolher o provedor, autorizar (aqui simulado) e escolher quais
    calendários da conta entram. Cada passo troca pelo desfoque. */
function ModalConectar({ aberto, fechar, f, avisar }: { aberto: boolean; fechar: () => void; f: Focus; avisar: (t: string) => void }) {
  const [passo, setPasso] = React.useState<"escolher" | "autorizando" | "calendarios">("escolher")
  const [prov, setProv] = React.useState<Provedor | null>(null)
  const [marcados, setMarcados] = React.useState<Set<string>>(new Set())
  const [link, setLink] = React.useState("")
  React.useEffect(() => {
    if (aberto) {
      setPasso("escolher")
      setProv(null)
      setLink("")
    }
  }, [aberto])
  function escolher(p: Provedor) {
    setProv(p)
    setMarcados(new Set(p.cals.slice(0, 2)))
    if (p.id === "ics") return setPasso("calendarios")
    setPasso("autorizando")
    setTimeout(() => setPasso("calendarios"), 1400)
  }
  function conectar() {
    if (!prov) return
    const nome = prov.id === "ics" ? "Calendário por link" : prov.nome
    f.conectar({ id: `${prov.id}-${Date.now()}`, nome, detalhe: prov.id === "ics" ? link : prov.conta, tom: prov.tom, provedor: prov.id })
    avisar(prov.id === "ics" ? "Calendário conectado pelo link" : `${prov.nome} conectado: ${marcados.size} ${marcados.size === 1 ? "calendário" : "calendários"}`)
    fechar()
  }
  return (
    <Modal open={aberto} onOpenChange={(o) => !o && fechar()}>
      <ModalContent className="sm:max-w-[480px]">
        <ModalHeader>
          <ModalTitle>Conectar um calendário</ModalTitle>
          <ModalDescription>Os eventos dele aparecem no Focus, na cor que você escolher.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={passo} {...troca} className="min-h-[220px]">
              {passo === "escolher" ? (
                <div className="flex flex-col gap-2">
                  {PROVEDORES.map((p) => (
                    <button key={p.id} type="button" onClick={() => escolher(p)} className="flex h-14 items-center gap-3 rounded-xl border border-border px-3.5 text-left transition-colors hover:bg-secondary/50">
                      <span className="grid size-9 place-items-center rounded-lg bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
                        <LogoProvedor p={p} />
                      </span>
                      <span className="flex flex-1 flex-col">
                        <span className="text-[14px] font-medium text-foreground-strong">{p.nome}</span>
                        <span className="text-[12px] text-muted-foreground">{p.id === "ics" ? "Qualquer calendário com link público" : "Entrar e autorizar"}</span>
                      </span>
                      <CaretRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : passo === "autorizando" && prov ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
                    <LogoProvedor p={prov} />
                  </span>
                  <span className="flex items-center gap-2 text-[14px] text-foreground">
                    <CircleNotch size={16} className="animate-spin text-primary" /> Esperando a autorização no {prov.nome}…
                  </span>
                  <span className="max-w-[34ch] text-[12.5px] text-muted-foreground">Uma janela do {prov.nome} abre para você entrar e permitir que o Muriki leia a agenda.</span>
                </div>
              ) : prov ? (
                <div className="flex flex-col gap-3">
                  {prov.id === "ics" ? (
                    <>
                      <span className="text-[13px] text-muted-foreground">Link do calendário (.ics, webcal ou CalDAV)</span>
                      <Input autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://… ou webcal://…" />
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-[13px] text-foreground">
                        <Check size={14} weight="bold" className="text-[var(--success)]" /> Conectado como <b className="font-medium">{prov.conta}</b>
                      </span>
                      <span className="pt-1 text-[13px] text-muted-foreground">Quais calendários entram no Focus</span>
                      {prov.cals.map((c) => (
                        <label key={c} className="flex items-center gap-3 rounded-lg px-1 py-1.5 text-[14px]">
                          <Concluir feita={marcados.has(c)} onClick={() => setMarcados((m) => { const n = new Set(m); if (n.has(c)) n.delete(c); else n.add(c); return n })} />
                          {c}
                        </label>
                      ))}
                    </>
                  )}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </ModalBody>
        <ModalFooter>
          {passo === "escolher" ? null : (
            <Button variant="ghost" className="mr-auto" onClick={() => setPasso("escolher")}>
              <CaretLeft /> Outro provedor
            </Button>
          )}
          <Button variant="ghost" onClick={fechar}>
            Cancelar
          </Button>
          {passo === "calendarios" ? (
            <Button variant="solid" disabled={prov?.id === "ics" ? !/^(https?|webcal):\/\//.test(link.trim()) : marcados.size === 0} onClick={conectar}>
              Conectar
            </Button>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function EmBreve({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-3">
      <Etiqueta>Próximo passo</Etiqueta>
      <h1 className="text-[34px] font-light tracking-[-0.03em] text-foreground-strong md:text-[44px]">{titulo}</h1>
      <p className="max-w-[48ch] text-[15px] text-muted-foreground">{texto}</p>
    </div>
  )
}

// ── a barra de ações (⌘K) ────────────────────────────────────────────────

interface Acao {
  id: string
  grupo: string
  rotulo: string
  icone: React.ReactNode
  dica?: string
  fazer: () => void
}

function BarraDeAcoes({ aberta, fechar, acoes, eventos, abrirEvento, criarDoTexto }: { aberta: boolean; fechar: () => void; acoes: Acao[]; eventos: Evento[]; abrirEvento: (e: Evento) => void; criarDoTexto: (tipo: "tarefa" | "nota", t: string) => void }) {
  const [q, setQ] = React.useState("")
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    if (aberta) {
      setQ("")
      setI(0)
    }
  }, [aberta])
  const busca = q.trim().toLowerCase()
  // o que bate com a busca vem primeiro; criar uma tarefa ou nota com o texto vem depois
  const lista: Acao[] = [
    ...acoes.filter((a) => !busca || a.rotulo.toLowerCase().includes(busca)),
    ...(busca
      ? [
          { id: "q-tarefa", grupo: "Criar com o texto", rotulo: `Nova tarefa: ${q.trim()}`, icone: <ListChecks size={16} />, fazer: () => criarDoTexto("tarefa", q.trim()) },
          { id: "q-nota", grupo: "Criar com o texto", rotulo: `Nota rápida: ${q.trim()}`, icone: <NotePencil size={16} />, fazer: () => criarDoTexto("nota", q.trim()) },
        ]
      : []),
    ...eventos
      .filter((e) => busca && e.titulo.toLowerCase().includes(busca))
      .slice(0, 4)
      .map((e) => ({ id: e.id, grupo: "Eventos", rotulo: e.titulo, dica: fmt(e.ini, "d MMM, HH:mm"), icone: <CalendarBlank size={16} />, fazer: () => abrirEvento(e) })),
  ]
  const sel = Math.min(i, Math.max(lista.length - 1, 0))
  const executar = (a?: Acao) => {
    if (!a) return
    fechar()
    setTimeout(a.fazer, 60)
  }
  return (
    <AnimatePresence>
      {aberta ? (
        <motion.div key="barra" className="fixed inset-0 z-[70] flex justify-center bg-black/25 px-4 pt-[14vh] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fechar}>
          <motion.div role="dialog" aria-label="Barra de ações" initial={{ opacity: 0, y: 12, filter: "blur(12px)", scale: 0.98 }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, y: 8, filter: "blur(12px)", scale: 0.98 }} transition={{ duration: 0.35, ease: CURVA }} onClick={(e) => e.stopPropagation()} className="flex h-fit max-h-[60vh] w-full max-w-[580px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex h-13 items-center gap-3 border-b border-border px-4">
              <MagnifyingGlass size={18} className="text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setI(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setI((sel + 1) % Math.max(lista.length, 1))
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setI((sel - 1 + lista.length) % Math.max(lista.length, 1))
                  } else if (e.key === "Enter") executar(lista[sel])
                  else if (e.key === "Escape") fechar()
                }}
                placeholder="Buscar ou fazer algo…"
                className="h-12 flex-1 bg-transparent text-[15px] text-foreground-strong outline-none placeholder:text-muted-foreground"
              />
              <Tecla>Esc</Tecla>
            </div>
            <div className="min-h-0 overflow-y-auto p-1.5">
              {lista.length === 0 ? <p className="px-3 py-6 text-center text-[13.5px] text-muted-foreground">Nada com “{q}”.</p> : null}
              {lista.map((a, k) => (
                <React.Fragment key={a.id}>
                  {k === 0 || lista[k - 1].grupo !== a.grupo ? <Etiqueta className="block px-3 pt-2.5 pb-1">{a.grupo}</Etiqueta> : null}
                  <button type="button" onMouseEnter={() => setI(k)} onClick={() => executar(a)} className={`relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] ${k === sel ? "text-foreground-strong" : "text-foreground"}`}>
                    {k === sel ? <motion.span layoutId="barra-sel" className="absolute inset-0 rounded-lg bg-secondary" transition={{ type: "spring", stiffness: 500, damping: 35 }} /> : null}
                    <span className="relative text-muted-foreground">{a.icone}</span>
                    <span className="relative flex-1 truncate">{a.rotulo}</span>
                    {a.dica ? <span className="relative font-mono text-[11px] text-muted-foreground">{a.dica}</span> : null}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

// ── o sidebar ────────────────────────────────────────────────────────────

type Modulo = "focus" | "work" | "docs" | "canvas"
const MODULOS: { id: Modulo; nome: string; icone: React.ReactNode; detalhe: string }[] = [
  { id: "focus", nome: "Focus", icone: <Target size={18} />, detalhe: "A sua agenda, de todos os espaços" },
  { id: "work", nome: "Work", icone: <Kanban size={18} />, detalhe: "Projetos e tarefas do time" },
  { id: "docs", nome: "Docs", icone: <FileText size={18} />, detalhe: "Documentos e páginas" },
  { id: "canvas", nome: "Canvas", icone: <FlowArrow size={18} />, detalhe: "Quadros e arquitetura" },
]
type Pagina = "hoje" | "tarefas" | "notas" | "config"
const NAV_FOCUS: { id: Pagina; nome: string; icone: React.ReactNode }[] = [
  { id: "hoje", nome: "Hoje", icone: <Hoje31 className="size-[18px]" /> },
  { id: "tarefas", nome: "Tarefas", icone: <ListChecks size={18} /> },
  { id: "notas", nome: "Notas", icone: <NotePencil size={18} /> },
]
type ModoSidebar = "fixo" | "recolhido" | "flutuante"

// a navegação dos outros módulos, só para ver a troca: as telas deles vêm depois
const NAV_OUTROS: Record<Exclude<Modulo, "focus">, { id: string; nome: string; icone: React.ReactNode }[]> = {
  work: [
    { id: "inicio", nome: "Início", icone: <Kanban size={18} /> },
    { id: "projetos", nome: "Projetos", icone: <ListChecks size={18} /> },
    { id: "membros", nome: "Membros", icone: <Target size={18} /> },
  ],
  docs: [
    { id: "inicio", nome: "Início", icone: <FileText size={18} /> },
    { id: "paginas", nome: "Páginas", icone: <NotePencil size={18} /> },
  ],
  canvas: [
    { id: "inicio", nome: "Início", icone: <FlowArrow size={18} /> },
    { id: "quadros", nome: "Quadros", icone: <Kanban size={18} /> },
  ],
}

/** Os próximos eventos no sidebar, fora da home: primeiro os ossos no molde de cada evento, depois
    cada um chega desfocado, um depois do outro. */
function Proximos({ eventos, ir }: { eventos: Evento[]; ir: () => void }) {
  const [carregando, setCarregando] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setCarregando(false), 480)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, filter: "blur(8px)" }} transition={{ duration: 0.4, ease: CURVA }} className="flex flex-col gap-1 overflow-hidden border-t border-border pt-4">
      {eventos.map((e, i) =>
        carregando ? (
          <div key={e.id} className="flex items-start gap-2.5 px-2.5 py-1.5">
            <Osso atraso={i * 0.08} className="mt-1 size-2 rounded-full" style={{ background: `color-mix(in oklab, var(--tone-${tomDaConta(e.conta)}-dot) 35%, var(--card))` }} />
            <span className="flex flex-1 flex-col gap-1.5">
              <Osso atraso={i * 0.08} className="h-[11px] rounded-[4px]" style={{ width: Math.min(e.titulo.length * 6.4, 170) }} />
              <Osso atraso={i * 0.08} azul className="h-[9px] rounded-[3px]" style={{ width: e.link ? 104 : 68 }} />
            </span>
          </div>
        ) : (
          <motion.button key={e.id} type="button" onClick={ir} initial={{ opacity: 0, filter: "blur(8px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0, transitionEnd: { filter: "none" } }} transition={{ duration: 0.45, ease: CURVA, delay: i * 0.07 }} className="flex items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-secondary/60">
            <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: `var(--tone-${tomDaConta(e.conta)}-dot)` }} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] text-foreground">{e.titulo}</span>
              <span className="font-mono text-[10.5px] text-muted-foreground tabular-nums">
                {fmt(e.ini, "HH:mm")}–{fmt(e.fim, "HH:mm")}
                {e.link ? ` · ${salaDe(e.link)}` : ""}
              </span>
            </span>
          </motion.button>
        )
      )}
    </motion.div>
  )
}

interface Nav {
  modulo: Modulo
  setModulo: (m: Modulo) => void
  pagina: Pagina
  setPagina: (p: Pagina) => void
}

function ItemNav({ ativo, icone, nome, onClick, trailing, recolhido }: { ativo: boolean; icone: React.ReactNode; nome: string; onClick: () => void; trailing?: React.ReactNode; recolhido: boolean }) {
  return (
    <button type="button" title={recolhido ? nome : undefined} aria-label={recolhido ? nome : undefined} onClick={onClick} aria-current={ativo ? "page" : undefined} className={`relative flex h-9 items-center gap-3 rounded-lg text-left text-[14px] transition-colors ${recolhido ? "w-10 justify-center self-center" : "w-full px-2.5"} ${ativo ? "font-medium text-primary-subtle-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
      {ativo ? (
        <motion.span layoutId="nav-ativo" className="absolute inset-0 rounded-lg bg-primary-subtle" transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          {recolhido ? null : <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
        </motion.span>
      ) : null}
      <span className={`relative grid size-5 shrink-0 place-items-center ${ativo ? "text-primary" : ""}`}>{icone}</span>
      {recolhido ? null : (
        <motion.span initial={{ opacity: 0, filter: "blur(6px)", x: -4 }} animate={{ opacity: 1, filter: "blur(0px)", x: 0 }} transition={CHEGADA} className="relative flex-1 truncate">
          {nome}
        </motion.span>
      )}
      {trailing && !recolhido ? <span className="relative">{trailing}</span> : null}
    </button>
  )
}

/** O cabeçalho do sidebar É o módulo: "Muriki" e o nome do módulo, que abre
    o dropdown dos módulos. */
function CabecaModulo({ nav, recolhido }: { nav: Nav; recolhido: boolean }) {
  const atual = MODULOS.find((m) => m.id === nav.modulo)!
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" aria-label={`Muriki ${atual.nome}. Trocar de módulo`} className={`flex min-w-0 items-center gap-2.5 rounded-xl text-left transition-colors hover:bg-secondary/60 ${recolhido ? "size-10 justify-center self-center" : "h-12 flex-1 px-1.5"}`}>
            <MurikiLogo className="size-8 shrink-0" />
            {recolhido ? null : (
              <>
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-[10px] leading-none tracking-[0.14em] text-muted-foreground uppercase">Muriki</span>
                  <Chega texto={atual.nome} className="text-[17px] leading-tight font-semibold text-foreground-strong" />
                </span>
                <CaretDown size={13} className="ml-0.5 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="start" side={recolhido ? "right" : "bottom"} className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Módulos</DropdownMenuLabel>
          {MODULOS.map((m) => (
            <DropdownMenuItem key={m.id} onClick={() => nav.setModulo(m.id)} className="gap-3 py-2">
              <span className={nav.modulo === m.id ? "text-primary" : "text-muted-foreground"}>{m.icone}</span>
              <span className="flex flex-col">
                <span className="text-[13.5px] text-foreground-strong">{m.nome}</span>
                <span className="text-[11.5px] text-muted-foreground">{m.detalhe}</span>
              </span>
              {nav.modulo === m.id ? <Check size={14} className="ml-auto text-primary" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Os dois botões do sidebar: o alfinete (fixo ou flutuante) e recolher (só os ícones). */
function BotoesSidebar({ modo, setModo, recolhido }: { modo: ModoSidebar; setModo: (m: ModoSidebar) => void; recolhido: boolean }) {
  const flutuante = modo === "flutuante"
  return (
    <span className={`flex shrink-0 ${recolhido ? "flex-col" : ""}`}>
      <Button variant="ghost" size="icon" aria-label={flutuante ? "Fixar o menu" : "Soltar o menu (flutuante)"} title={flutuante ? "Fixar" : "Soltar"} onClick={() => setModo(flutuante ? "fixo" : "flutuante")} className="text-muted-foreground">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={flutuante ? "solto" : "fixo"} initial={{ opacity: 0, filter: "blur(6px)", rotate: -20 }} animate={{ opacity: 1, filter: "blur(0px)", rotate: 0 }} exit={{ opacity: 0, filter: "blur(6px)", rotate: 20 }} transition={{ duration: 0.25, ease: CURVA }}>
            {flutuante ? <PushPinSlash size={17} /> : <PushPin size={17} weight="fill" />}
          </motion.span>
        </AnimatePresence>
      </Button>
      {flutuante ? null : (
        <Button variant="ghost" size="icon" aria-label={recolhido ? "Abrir o menu" : "Recolher o menu"} title={recolhido ? "Abrir" : "Recolher"} onClick={() => setModo(recolhido ? "fixo" : "recolhido")} className="text-muted-foreground">
          {recolhido ? <CaretDoubleRight size={16} /> : <CaretDoubleLeft size={16} />}
        </Button>
      )}
    </span>
  )
}

interface PropsSidebar {
  nav: Nav
  f: Focus
  modo: ModoSidebar
  setModo: (m: ModoSidebar) => void
  abrirBarra: () => void
  escuro: boolean
  setEscuro: (v: boolean) => void
  idioma: string
  setIdioma: (v: string) => void
  avisar: (t: string) => void
  gaveta?: boolean
}

function Sidebar({ nav, f, modo, setModo, abrirBarra, escuro, setEscuro, idioma, setIdioma, avisar, gaveta = false }: PropsSidebar) {
  const r = modo === "recolhido" && !gaveta
  const abertas = f.tarefas.filter((t) => t.estado !== "done").length
  const proximos = f.eventos.filter((e) => !e.diaInteiro && isSameDay(e.ini, AGORA) && e.fim > AGORA).sort((a, b) => +a.ini - +b.ini).slice(0, 3)
  return (
    <div className={`flex h-full flex-col gap-4 pt-3 pb-3 ${r ? "px-2" : "px-3"}`}>
      <div className={`flex items-center gap-1 ${r ? "flex-col" : ""}`}>
        <CabecaModulo nav={nav} recolhido={r} />
        {gaveta ? null : <BotoesSidebar modo={modo} setModo={setModo} recolhido={r} />}
      </div>

      {/* a barra de ações, a mesma em todos os módulos */}
      <button type="button" onClick={abrirBarra} title={r ? "Buscar ou fazer algo (⌘K)" : undefined} aria-label="Buscar ou fazer algo" className={`flex h-9 items-center gap-2.5 rounded-lg border border-border bg-background text-[13.5px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground ${r ? "w-10 justify-center self-center" : "px-2.5"}`}>
        <MagnifyingGlass size={16} />
        {r ? null : (
          <>
            <span className="flex-1 text-left">Buscar ou fazer</span>
            <span className="flex gap-0.5">
              <Tecla>
                <Command size={10} />
              </Tecla>
              <Tecla>K</Tecla>
            </span>
          </>
        )}
      </button>

      <AnimatePresence mode="wait">
        <motion.div key={nav.modulo} {...troca} className="flex flex-col gap-5">
          {/* a navegação do módulo: os itens chegam desfocados, um depois do outro, a cada troca de módulo */}
          <div className={`flex flex-col gap-0.5 ${r ? "items-center" : ""}`}>
            {(nav.modulo === "focus" ? NAV_FOCUS : NAV_OUTROS[nav.modulo]).map((n, i) => (
              <motion.div key={n.id} className={r ? "" : "w-full"} initial={{ opacity: 0, filter: "blur(8px)", x: -6 }} animate={{ opacity: 1, filter: "blur(0px)", x: 0, transitionEnd: { filter: "none" } }} transition={{ duration: 0.42, ease: CURVA, delay: 0.08 + i * 0.05 }}>
                <ItemNav
                  recolhido={r}
                  ativo={nav.modulo === "focus" ? nav.pagina === n.id : i === 0}
                  icone={n.icone}
                  nome={n.nome}
                  onClick={() => (nav.modulo === "focus" ? nav.setPagina(n.id as Pagina) : undefined)}
                  trailing={n.id === "tarefas" ? <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{abertas}</span> : n.id === "notas" ? <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{f.notas.length}</span> : undefined}
                />
              </motion.div>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {nav.modulo === "focus" && nav.pagina !== "hoje" && !r ? <Proximos key="proximos" eventos={proximos} ir={() => nav.setPagina("hoje")} /> : null}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className={`mt-auto flex flex-col gap-2 ${r ? "items-center" : ""}`}>
        <button type="button" title={r ? "Ultimate · 12 dias de teste" : undefined} onClick={() => avisar("Abrindo a Cobrança (estudo)")} className={`flex h-9 items-center gap-2.5 rounded-lg text-left text-[13.5px] text-foreground hover:bg-secondary/60 ${r ? "w-10 justify-center" : "px-2.5"}`}>
          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
            <ShootingStar size={13} weight="fill" />
          </span>
          {r ? null : (
            <>
              <span className="flex-1 truncate">Ultimate</span>
              <span className="font-mono text-[11px] text-muted-foreground">12 dias</span>
            </>
          )}
        </button>
        <div className="h-px w-full bg-border" />
        <div className={`flex items-center gap-1 ${r ? "flex-col" : ""}`}>
          {r ? null : <LanguageSwitcher value={idioma} options={IDIOMAS} onValueChange={setIdioma} label="Idioma" />}
          <Button variant="ghost" size="icon" aria-label={escuro ? "Tema escuro. Mudar para o claro" : "Tema claro. Mudar para o escuro"} onClick={() => setEscuro(!escuro)} className={`text-muted-foreground ${r ? "" : "ml-auto"}`}>
            {escuro ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
        </div>
        <div className={`flex items-center gap-2.5 ${r ? "" : "px-1"}`}>
          <span title={r ? CONTA_PESSOA.nome : undefined} className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
            G
          </span>
          {r ? null : (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13.5px] font-medium text-foreground-strong">{CONTA_PESSOA.nome}</span>
                <span className="truncate text-[12px] text-muted-foreground">{CONTA_PESSOA.email}</span>
              </span>
              <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => avisar("Saindo… (estudo)")} className="text-muted-foreground">
                <SignOut size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── o aviso ──────────────────────────────────────────────────────────────

function useAviso() {
  const [texto, setTexto] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!texto) return
    const t = setTimeout(() => setTexto(null), 2600)
    return () => clearTimeout(t)
  }, [texto])
  const aviso = (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[80] flex justify-center">
      <AnimatePresence>
        {texto ? (
          <motion.div key={texto} initial={{ opacity: 0, y: 16, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 8, filter: "blur(12px)" }} transition={{ duration: 0.45, ease: CURVA }} className="flex max-w-[90vw] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground-strong shadow-lg">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check size={13} weight="bold" />
            </span>
            <span className="truncate">{texto}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
  return [aviso, setTexto] as const
}

// ── o app ────────────────────────────────────────────────────────────────

const IDIOMAS = [
  { value: "pt-BR", label: "Português" },
  { value: "en-US", label: "English" },
  { value: "es-ES", label: "Español" },
]

interface Controle {
  visao: Visao
  setVisao: (v: Visao) => void
  data: Date
  setData: (d: Date) => void
  modo: "calendario" | "kanban"
  setModo: (m: "calendario" | "kanban") => void
  cheio: boolean
  setCheio: (v: boolean) => void
  abrirEvento: (e: Evento) => void
  abrirConectar: () => void
  abrirConfig: () => void
}

function App() {
  const h = location.hash
  const solo = h.includes("solo")
  const [escuro, setEscuro] = React.useState(() => {
    if (h.includes("escuro")) return true
    const tema = document.documentElement.dataset.theme
    return tema ? tema === "dark" : matchMedia("(prefers-color-scheme: dark)").matches
  })
  const [celular, setCelular] = React.useState(() => h.includes("cel"))
  const [idioma, setIdioma] = React.useState("pt-BR")
  const [modulo, setModulo] = React.useState<Modulo>("focus")
  const [pagina, setPagina] = React.useState<Pagina>(() => (h.includes("config") ? "config" : h.includes("fora") ? "tarefas" : "hoje"))
  const [modoSidebar, setModoSidebar] = React.useState<ModoSidebar>(() => (h.includes("recolhido") ? "recolhido" : h.includes("flutuante") ? "flutuante" : "fixo"))
  const [flutuando, setFlutuando] = React.useState(false)
  const [gaveta, setGaveta] = React.useState(false)
  const [barra, setBarra] = React.useState(() => h.includes("barra"))
  const [visao, setVisao] = React.useState<Visao>(() => (h.includes("mes") ? "mes" : h.includes("dia") ? "dia" : h.includes("agenda") ? "agenda" : "semana"))
  const [data, setData] = React.useState(AGORA)
  const [modo, setModo] = React.useState<"calendario" | "kanban">(() => (h.includes("kanban") ? "kanban" : "calendario"))
  const [cheio, setCheio] = React.useState(() => h.includes("cheio"))
  const [evento, setEvento] = React.useState<Evento | null>(null)
  const [rodada, setRodada] = React.useState(0)
  const [aviso, avisar] = useAviso()
  const f = useFocus(avisar)
  PREF = f.pref
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", escuro)
  }, [escuro])
  React.useEffect(() => {
    if (!solo) history.replaceState(null, "", `#focus${escuro ? "-escuro" : ""}${celular ? "-cel" : ""}`)
  }, [escuro, celular, solo])
  React.useEffect(() => {
    if (h.includes("evento")) setEvento(f.todosEventos.find((e) => e.titulo === "Call com o cliente" && isSameDay(e.ini, AGORA)) ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // os atalhos: ⌘K abre a barra de ações; M, S, D, A trocam a visão; Esc sai do calendário cheio
  React.useEffect(() => {
    const ouvir = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setBarra((b) => !b)
        return
      }
      const alvo = e.target as HTMLElement
      if (barra || evento || alvo.closest("input, textarea, [contenteditable], [role=dialog]")) return
      if (e.key === "Escape" && cheio) telaInteira(false)
      const v = ({ m: "mes", s: "semana", d: "dia", a: "agenda" } as Record<string, Visao>)[e.key.toLowerCase()]
      if (v && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setModo("calendario")
        setVisao(v)
      }
    }
    window.addEventListener("keydown", ouvir)
    return () => window.removeEventListener("keydown", ouvir)
  }, [barra, evento, cheio])

  const nav: Nav = {
    modulo,
    setModulo: (m) => {
      setModulo(m)
      setPagina("hoje")
      setGaveta(false)
    },
    pagina,
    setPagina: (p) => {
      setModulo("focus")
      setPagina(p)
      setGaveta(false)
    },
  }
  // tela inteira: o calendário toma todo o espaço da janela, sem sidebar, sem coluna, sem margem
  const telaInteira = (v: boolean) => setCheio(v)
  const [conectando, setConectando] = React.useState(false)
  const controle: Controle = { visao, setVisao, data, setData, modo, setModo, cheio, setCheio: telaInteira, abrirEvento: setEvento, abrirConectar: () => setConectando(true), abrirConfig: () => nav.setPagina("config") }
  const acoes: Acao[] = [
    { id: "novo-evento", grupo: "Criar", rotulo: "Novo evento", icone: <CalendarBlank size={16} />, fazer: () => setEvento({ id: `e${Date.now()}`, titulo: "", ini: new Date(+AGORA + 40 * 60000), fim: new Date(+AGORA + 70 * 60000), conta: "google" }) },
    { id: "nova-tarefa", grupo: "Criar", rotulo: "Nova tarefa", icone: <ListChecks size={16} />, fazer: () => avisar("Escreva o título na barra e Enter") },
    { id: "ir-hoje", grupo: "Ir para", rotulo: "Hoje", icone: <Hoje31 className="size-4" />, fazer: () => nav.setPagina("hoje") },
    { id: "ir-tarefas", grupo: "Ir para", rotulo: "Tarefas", icone: <ListChecks size={16} />, fazer: () => nav.setPagina("tarefas") },
    { id: "ir-notas", grupo: "Ir para", rotulo: "Notas", icone: <NotePencil size={16} />, fazer: () => nav.setPagina("notas") },
    ...MODULOS.filter((m) => m.id !== modulo).map((m) => ({ id: `mod-${m.id}`, grupo: "Módulos", rotulo: `Abrir o ${m.nome}`, icone: m.icone, fazer: () => nav.setModulo(m.id) })),
    ...(Object.keys(ROTULO_VISAO) as Visao[]).map((v) => ({ id: `ver-${v}`, grupo: "Calendário", rotulo: `Ver ${ROTULO_VISAO[v].toLowerCase()}`, dica: TECLA_VISAO[v], icone: <CalendarBlank size={16} />, fazer: () => (setModo("calendario"), setVisao(v), nav.setPagina("hoje")) })),
    { id: "cheio", grupo: "Calendário", rotulo: cheio ? "Sair da tela inteira" : "Tela inteira", icone: <ArrowsOut size={16} />, fazer: () => telaInteira(!cheio) },
    { id: "config", grupo: "Calendário", rotulo: "Configurações do calendário", icone: <GearSix size={16} />, fazer: () => nav.setPagina("config") },
    { id: "conectar", grupo: "Calendário", rotulo: "Conectar um calendário", icone: <LinkSimple size={16} />, fazer: () => setConectando(true) },
    { id: "tema", grupo: "Preferências", rotulo: escuro ? "Tema claro" : "Tema escuro", icone: escuro ? <Sun size={16} /> : <Moon size={16} />, fazer: () => setEscuro(!escuro) },
  ]

  const propsSidebar: PropsSidebar = { nav, f, modo: modoSidebar, setModo: (m) => (setModoSidebar(m), setFlutuando(false)), abrirBarra: () => setBarra(true), escuro, setEscuro, idioma, setIdioma, avisar }

  const painel = (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg max-md:hidden">
      <ViewToggle value={celular ? "cel" : "web"} onChange={(v) => setCelular(v === "cel")} options={[{ value: "web", label: "Web" }, { value: "cel", label: "Celular" }]} ariaLabel="Tela" />
      <Button
        variant="ghost"
        onClick={() => {
          f.recomecar()
          setPagina("hoje")
          setModulo("focus")
          setData(AGORA)
          setRodada(rodada + 1)
        }}
      >
        Recomeçar
      </Button>
    </div>
  )

  if (celular && !solo)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background pb-20">
        <iframe key={`${escuro}-${rodada}`} title="Celular" src={`${location.href.split("#")[0]}#focus-solo-dia${escuro ? "-escuro" : ""}`} className="h-[844px] w-[390px] rounded-[28px] bg-background" style={{ boxShadow: "0 0 0 8px var(--card), 0 0 0 9px var(--border), 0 40px 80px -30px rgb(0 0 0 / 0.35)" }} />
        {painel}
      </div>
    )

  const tela =
    modulo !== "focus" ? (
      <EmBreve titulo={`Home do ${MODULOS.find((m) => m.id === modulo)!.nome}`} texto="Cada módulo tem a sua home e a sua navegação. Esta vem depois do Focus." />
    ) : pagina === "hoje" ? (
      <Home f={f} avisar={avisar} controle={controle} />
    ) : pagina === "config" ? (
      <ConfigCalendario f={f} avisar={avisar} abrirConectar={() => setConectando(true)} voltar={() => nav.setPagina("hoje")} />
    ) : pagina === "tarefas" ? (
      <EmBreve titulo="Tarefas" texto="A lista de tarefas, com lista, kanban e timeline, os componentes que já temos. É o próximo passo; aqui dá para ver o sidebar fora da home, com os próximos eventos." />
    ) : (
      <EmBreve titulo="Notas" texto="Todas as notas rápidas, e as que viraram tarefa ou evento." />
    )

  const larguraFixa = modoSidebar === "recolhido" ? 64 : 256
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {/* fixo e recolhido: o sidebar no fluxo; na tela inteira ele sai e vira o flutuante */}
      {modoSidebar !== "flutuante" ? (
        <motion.aside initial={false} animate={{ width: cheio ? 0 : larguraFixa, opacity: cheio ? 0 : 1 }} transition={{ duration: 0.4, ease: CURVA }} className="hidden h-full shrink-0 overflow-hidden border-border bg-[var(--lateral)] md:block" style={{ borderRightWidth: cheio ? 0 : 1 }}>
          <Sidebar {...propsSidebar} />
        </motion.aside>
      ) : null}
      {/* flutuante (e a tela inteira, em qualquer modo): o Muriki no canto é a porta do menu, que chega
          por cima ao passar o mouse nele ou na borda */}
      {modoSidebar === "flutuante" || cheio ? (
        <>
          <div className="fixed inset-y-0 left-0 z-40 hidden w-3 md:block" onMouseEnter={() => setFlutuando(true)} />
          <motion.button
            type="button"
            aria-label="Abrir o menu"
            onMouseEnter={() => setFlutuando(true)}
            onClick={() => setFlutuando(true)}
            initial={{ opacity: 0, x: -12, filter: "blur(8px)" }}
            animate={{ opacity: flutuando ? 0 : 1, x: flutuando ? -8 : 0, filter: flutuando ? "blur(6px)" : "blur(0px)" }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.3, ease: CURVA }}
            className={`fixed z-40 hidden items-center gap-1 rounded-xl border border-border bg-card py-1 pr-1.5 pl-1 shadow-sm md:flex ${cheio ? "top-[7px] left-2" : "top-4 left-4"}`}
          >
            <MurikiLogo className="size-7" />
            <CaretRight size={12} weight="bold" className="text-muted-foreground" />
          </motion.button>
          <AnimatePresence>
            {flutuando ? (
              <motion.aside key="flutua" onMouseLeave={() => setFlutuando(false)} initial={{ x: -24, opacity: 0, filter: "blur(10px)" }} animate={{ x: 0, opacity: 1, filter: "blur(0px)" }} exit={{ x: -24, opacity: 0, filter: "blur(10px)" }} transition={{ duration: 0.35, ease: CURVA }} className="fixed top-2 bottom-2 left-2 z-50 hidden w-[256px] overflow-hidden rounded-2xl border border-border bg-[var(--lateral)] shadow-2xl md:block">
                <Sidebar {...propsSidebar} />
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}

      {/* celular: a barra de topo e a gaveta */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur md:hidden">
        <Button variant="ghost" size="icon" aria-label="Abrir o menu" onClick={() => setGaveta(true)}>
          <List size={20} />
        </Button>
        <span className="flex flex-1 items-center gap-2 text-[15px] font-semibold text-foreground-strong">
          <MurikiLogo className="size-6" /> {MODULOS.find((m) => m.id === modulo)!.nome}
        </span>
        <Button variant="ghost" size="icon" aria-label="Buscar ou fazer algo" onClick={() => setBarra(true)}>
          <MagnifyingGlass size={19} />
        </Button>
      </div>
      <AnimatePresence>
        {gaveta ? (
          <>
            <motion.div key="veu" className="fixed inset-0 z-40 bg-black/30 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGaveta(false)} />
            <motion.aside key="gaveta" className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] border-r border-border bg-[var(--lateral)] md:hidden" initial={{ x: "-100%", filter: "blur(8px)" }} animate={{ x: 0, filter: "blur(0px)" }} exit={{ x: "-100%", filter: "blur(8px)" }} transition={{ duration: 0.45, ease: CURVA }}>
              <Sidebar {...propsSidebar} gaveta />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ${cheio ? "p-0 pt-14 md:p-0" : `px-4 pt-[72px] pb-4 md:px-6 md:pt-5 md:pb-5 ${modoSidebar === "flutuante" ? "md:pl-[76px]" : ""}`}`}>
        <div className="min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={`${modulo}-${pagina}-${rodada}`} {...troca} className="h-full">
              {tela}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BarraDeAcoes aberta={barra} fechar={() => setBarra(false)} acoes={acoes} eventos={f.todosEventos} abrirEvento={(e) => (nav.setPagina("hoje"), setEvento(e))} criarDoTexto={(tipo, t) => (tipo === "tarefa" ? (f.adicionarTarefa(t), avisar(`Tarefa criada: ${t}`)) : (f.anotar(t), avisar("Nota salva")))} />
      <ModalEvento evento={evento} fechar={() => setEvento(null)} f={f} avisar={avisar} />
      <ModalConectar aberto={conectando} fechar={() => setConectando(false)} f={f} avisar={avisar} />
      {solo ? null : painel}
      {aviso}
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
