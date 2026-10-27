import * as React from "react"
import { createRoot } from "react-dom/client"
import { ChartBar, Kanban, ListChecks, House, Users, Plus } from "@phosphor-icons/react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/blocks/app-shell/app-shell"
import { TaskTable } from "@/components/blocks/task-table"
import type { TaskTableTask } from "@/components/blocks/task-table"
import { KanbanBoard } from "@/components/blocks/kanban"
import type { KanbanTask } from "@/components/blocks/kanban/kanban-card"

const TITULOS = [
  "Revisar o fluxo de cobrança",
  "Migrar webhooks do Stripe",
  "Ajustar o onboarding do time",
  "Tela de membros com carência",
  "Corrigir o filtro por prazo",
  "Exportar relatório em PDF",
  "Atalho de teclado para nova tarefa",
  "Notificação de menção no comentário",
]
const STATUS = ["active", "progress", "blocked", "done"] as const
const PRIORIDADES = ["urgent", "high", "medium", "low", "none"] as const
const DONOS = [
  { initials: "GT", tone: "a1" as const },
  { initials: "AM", tone: "a2" as const },
  { initials: "RS", tone: "a3" as const },
  { initials: "LP", tone: "a4" as const },
]

/** Épicos com tarefas e subtarefas: o desenho de árvore da tabela. */
function tarefas(epicos: number): TaskTableTask[] {
  const lista: TaskTableTask[] = []
  let n = 1
  for (let e = 0; e < epicos; e++) {
    const epico = `e${e}`
    lista.push({ id: epico, code: `MUR-${n++}`, title: `Épico ${e + 1} · ${TITULOS[e % TITULOS.length]}`, depth: 0, kind: "epic", status: "progress", childGroupId: `g${e}`, progress: { done: 3, total: 6 } })
    for (let t = 0; t < 6; t++) {
      lista.push({
        id: `${epico}-t${t}`,
        code: `MUR-${n++}`,
        title: TITULOS[(e + t) % TITULOS.length],
        depth: 1,
        kind: "task",
        status: STATUS[(e + t) % STATUS.length],
        owner: DONOS[(e + t) % DONOS.length],
        priority: PRIORIDADES[(e * 3 + t) % PRIORIDADES.length],
        due: `${10 + t} Nov`,
        parentId: epico,
        lastChild: t === 5,
      })
    }
  }
  return lista
}

const COLUNAS = [
  { id: "backlog", name: "Backlog", color: null },
  { id: "todo", name: "A fazer", color: "var(--tone-gray-dot)" },
  { id: "doing", name: "Fazendo", color: "var(--tone-blue-dot)" },
  { id: "review", name: "Revisão", color: "var(--tone-purple-dot)" },
  { id: "done", name: "Feito", color: "var(--tone-green-dot)" },
]

function cards(total: number): KanbanTask[] {
  return Array.from({ length: total }, (_, i) => ({
    slug: `MUR-${i + 1}`,
    title: TITULOS[i % TITULOS.length],
    description: i % 3 === 0 ? "Com o time de produto, antes da sprint." : undefined,
    priority: (["urgent", "high", "medium", "low", "none"] as const)[i % 5],
    progress: i % 7 === 0 ? 100 : (i * 13) % 90,
    timeLabel: `${(i % 9) + 1}d`,
    statusId: COLUNAS[i % COLUNAS.length].id,
  }))
}

function useClasse(nome: string, ligado: boolean) {
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle(nome, ligado)
  }, [nome, ligado])
}

function Tela() {
  const hash = location.hash
  const [modo, setModo] = React.useState(() => (hash.includes("papel") ? "papel" : hash.includes("blur") ? "blur" : "vidro"))
  const [passo, setPasso] = React.useState<number | null>(null)
  const [escuro, setEscuro] = React.useState(() => hash.includes("escuro"))
  const [vista, setVista] = React.useState(() => (hash.includes("quadro") ? "quadro" : "lista"))
  const [lista] = React.useState(() => tarefas(10))
  const [marcadas, setMarcadas] = React.useState<Set<string>>(() => new Set(["e0-t1", "e0-t2", "e1-t0"]))
  const [quadro, setQuadro] = React.useState(() => cards(Number(new URLSearchParams(location.search).get("cards") ?? 200)))
  useClasse("muriki-vidro", modo === "vidro")
  useClasse("muriki-blur", modo === "blur")
  useClasse("dark", escuro)

  const item = (key: string, label: string, icon: React.ReactNode, active = false) => ({ key, label, icon, active, href: "#" })

  return (
    <TooltipProvider>
      <AppShell
        product={{ name: "Muriki", detail: "Platform", logo: <MurikiLogo className="size-6" /> }}
        groups={[
          { items: [item("inicio", "Início", <House />), item("tarefas", "Tarefas", <ListChecks />, true), item("quadros", "Quadros", <Kanban />)] },
          { label: "Time", items: [item("membros", "Membros", <Users />), item("relatorios", "Relatórios", <ChartBar />)] },
        ]}
        user={{ name: "Guilherme T.", detail: "Admin", avatar: <Avatar size="sm"><AvatarFallback>GT</AvatarFallback></Avatar> }}
        settings={{ label: "Ajustes", href: "#" }}
      >
        <div className="flex min-w-0 flex-col">
          <header data-vidro data-blur className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-3 shadow-[inset_0_-1px_0_var(--border)]">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight text-foreground-strong">Cobrança</h1>
              <Tabs value={vista} onValueChange={(v) => setVista(v as string)}>
                <TabsList variant="enclosed">
                  <TabsTrigger value="lista">Lista</TabsTrigger>
                  <TabsTrigger value="quadro">Quadro</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={modo} onValueChange={(v) => setModo(v as string)}>
                <TabsList>
                  <TabsTrigger value="papel">Papel</TabsTrigger>
                  <TabsTrigger value="vidro">Vidro</TabsTrigger>
                  <TabsTrigger value="blur">Blur</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={escuro ? "escuro" : "claro"} onValueChange={(v) => setEscuro(v === "escuro")}>
                <TabsList>
                  <TabsTrigger value="claro">Claro</TabsTrigger>
                  <TabsTrigger value="escuro">Escuro</TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog>
                <DialogTrigger render={<Button variant="solid" size="sm" />}>
                  <Plus /> Nova tarefa
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova tarefa</DialogTitle>
                    <DialogDescription>Entra no quadro Cobrança, na coluna A fazer.</DialogDescription>
                  </DialogHeader>
                  <Field>
                    <FieldLabel>Título</FieldLabel>
                    <Input placeholder="O que precisa ser feito" />
                  </Field>
                  <DialogFooter>
                    <DialogClose render={<Button />}>Cancelar</DialogClose>
                    <DialogClose render={<Button variant="solid" />} onClick={() => toast.success("Tarefa criada", { description: "MUR-61 entrou em A fazer." })}>
                      Criar
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <div className="flex flex-col gap-4 p-6">
            {/* Blur de foco: o tour de onboarding. O passo marcado fica nítido, os outros saem de foco. */}
            <div data-foco className="grid grid-cols-3 gap-3">
              {["Convide o time", "Crie o primeiro quadro", "Ligue o Stripe"].map((t, i) => (
                <div
                  key={t}
                  data-em-foco={passo === i || undefined}
                  className="flex items-center justify-between rounded-[var(--radius)] bg-card px-4 py-3 shadow-sm"
                >
                  <span className="text-sm font-medium text-foreground-strong">
                    {i + 1}. {t}
                  </span>
                  <Button size="xs" variant={passo === i ? "solid" : "outline"} onClick={() => setPasso(passo === i ? null : i)}>
                    {passo === i ? "Concluir" : "Focar"}
                  </Button>
                </div>
              ))}
            </div>
            <div key={vista} data-blur-in>
            {vista === "lista" ? (
              <TaskTable
                tasks={lista}
                searchPlaceholder="Buscar tarefa"
                newTaskLabel="Nova tarefa"
                onNewTask={() => {}}
                checkedTaskIds={marcadas}
                onCheckedChange={(id, sim) =>
                  setMarcadas((atual) => {
                    const nova = new Set(atual)
                    if (sim) nova.add(id)
                    else nova.delete(id)
                    return nova
                  })
                }
              />
            ) : (
              <KanbanBoard columns={COLUNAS} tasks={quadro} onTasksChange={setQuadro} />
            )}
            </div>
          </div>
        </div>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  )
}

createRoot(document.getElementById("root")!).render(<Tela />)
