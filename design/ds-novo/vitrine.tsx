import * as React from "react"
import { createRoot } from "react-dom/client"
import { toast } from "sonner"
import { Bell, Copy, Gear, MagnifyingGlass, Plus, SquaresFour, Rows, Trash } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { OtpInput } from "@/components/ui/otp-input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChoiceCardGroup, ChoiceCard } from "@/components/ui/choice-card"
import { ChoiceChips } from "@/components/ui/choice-chips"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewToggle } from "@/components/ui/view-toggle"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { BackLink } from "@/components/ui/back-link"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { QrCode } from "@/components/ui/qr-code"
import { MurikiLogo } from "@/components/ui/muriki-logo"
import { BrandLogo } from "@/components/ui/brand-logo"
import { LevelScale } from "@/components/ui/level-scale"
import { Toaster } from "@/components/ui/sonner"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { MetricCard } from "@/components/blocks/metric-card/metric-card"
import { StatusPill } from "@/components/blocks/status-pill/status-pill"
import { PriorityFlag } from "@/components/blocks/priority-flag/priority-flag"
import { BarChart } from "@/components/blocks/bar-chart/bar-chart"
import { AreaChart } from "@/components/blocks/area-chart/area-chart"
import { BarList } from "@/components/blocks/bar-list/bar-list"

const TONS = ["gray", "blue", "cyan", "green", "yellow", "orange", "red", "pink", "purple"] as const
const MESES = ["mai", "jun", "jul", "ago", "set", "out"]
const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`

function useClasse(nome: string, ligado: boolean) {
  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle(nome, ligado)
  }, [nome, ligado])
}

/** Uma seção da vitrine: placa de vidro com título. */
function Secao({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-5 rounded-[var(--radius)] bg-card p-5 shadow-sm ${className}`}>
      <h2 className="text-sm font-semibold text-foreground-strong">{titulo}</h2>
      {children}
    </section>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] text-muted-foreground">{rotulo}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

/** Amostra de cor: o token pintado e o nome dele. */
function Amostra({ token, nome }: { token: string; nome?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-12 w-full rounded-[calc(var(--radius)-4px)] shadow-[inset_0_0_0_1px_var(--divider)]"
        style={{ background: `var(--${token})` }}
      />
      <span className="font-mono text-[10.5px] leading-tight text-muted-foreground">{nome ?? token}</span>
    </div>
  )
}

function Paleta() {
  return (
    <Secao titulo="Paleta Muriki">
      <Linha rotulo="marca e estado">
        <div className="grid w-full grid-cols-8 gap-3">
          <Amostra token="primary" />
          <Amostra token="primary-subtle" />
          <Amostra token="accent" nome="accent (amarelo)" />
          <Amostra token="destructive" />
          <Amostra token="destructive-subtle" />
          <Amostra token="success" />
          <Amostra token="warning" />
          <Amostra token="ring" />
        </div>
      </Linha>
      <Linha rotulo="superfícies (no vidro, translúcidas)">
        <div className="grid w-full grid-cols-8 gap-3">
          <Amostra token="background" />
          <Amostra token="rail" />
          <Amostra token="card" />
          <Amostra token="popover" />
          <Amostra token="field" />
          <Amostra token="secondary" />
          <Amostra token="sunken" />
          <Amostra token="foreground" nome="foreground (tinta)" />
        </div>
      </Linha>
      <Linha rotulo="série de dados">
        <div className="grid w-full grid-cols-8 gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <Amostra key={n} token={`chart-${n}`} />
          ))}
        </div>
      </Linha>
      <Linha rotulo="nove tons: fundo · tinta · ponto">
        <div className="grid w-full grid-cols-9 gap-3">
          {TONS.map((t) => (
            <div key={t} className="flex flex-col gap-1.5">
              <div
                className="flex h-12 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-4px)] text-xs font-medium"
                style={{ background: `var(--tone-${t})`, color: `var(--tone-${t}-foreground)` }}
              >
                <span className="size-2 rounded-full" style={{ background: `var(--tone-${t}-dot)` }} />
                Aa
              </div>
              <span className="font-mono text-[10.5px] text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </Linha>
    </Secao>
  )
}

function Botoes() {
  const variantes = ["outline", "primary", "secondary", "ghost", "link", "destructive", "solid"] as const
  return (
    <Secao titulo="Botões">
      <Linha rotulo="variantes">
        {variantes.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </Linha>
      <Linha rotulo="tamanhos">
        {(["xs", "sm", "default", "lg", "touch"] as const).map((s) => (
          <Button key={s} size={s} variant="primary">
            {s}
          </Button>
        ))}
      </Linha>
      <Linha rotulo="ícone · efeito wipe · carregando · desligado">
        <Button size="icon-sm" variant="ghost" aria-label="Copiar">
          <Copy />
        </Button>
        <Button size="icon" aria-label="Busca">
          <MagnifyingGlass />
        </Button>
        <Button size="icon-lg" variant="primary" aria-label="Novo">
          <Plus />
        </Button>
        <Button size="icon" variant="destructive" aria-label="Excluir">
          <Trash />
        </Button>
        <Button effect="wipe">Entrar com Google</Button>
        <Button variant="primary" disabled>
          <Spinner size="sm" /> Salvando
        </Button>
        <Button disabled>Desligado</Button>
      </Linha>
    </Secao>
  )
}

function Rotulos() {
  return (
    <Secao titulo="Badges, status e prioridade">
      <Linha rotulo="tons (soft)">
        {TONS.map((t) => (
          <Badge key={t} tone={t}>
            {t}
          </Badge>
        ))}
      </Linha>
      <Linha rotulo="outline · dashed · sm · contador">
        <Badge variant="outline">frontend</Badge>
        <Badge variant="dashed">sem prazo</Badge>
        <Badge tone="blue" size="sm">
          sm
        </Badge>
        <Badge tone="red" count>
          3
        </Badge>
        <Badge tone="purple" count size="sm">
          12
        </Badge>
      </Linha>
      <Linha rotulo="status">
        <StatusPill status="backlog" label="Backlog" />
        <StatusPill status="todo" label="A fazer" />
        <StatusPill status="doing" label="Fazendo" />
        <StatusPill status="done" label="Feito" />
        <StatusPill status="blocked" label="Bloqueada" />
      </Linha>
      <Linha rotulo="prioridade">
        <PriorityFlag level="low" label="Baixa" variant="pill" />
        <PriorityFlag level="medium" label="Média" variant="pill" />
        <PriorityFlag level="high" label="Alta" variant="pill" />
        <PriorityFlag level="urgent" label="Urgente" variant="pill" />
      </Linha>
      <Linha rotulo="nível">
        <LevelScale level="pleno" declared="senior" label />
      </Linha>
    </Secao>
  )
}

function Campos() {
  const [data, setData] = React.useState("2026-10-30")
  return (
    <Secao titulo="Campos">
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Título</FieldLabel>
          <Input placeholder="Descreva a tarefa" />
          <FieldDescription>Aparece no quadro e na notificação.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Valor</FieldLabel>
          <InputGroup start="R$" end="/mês" defaultValue="249,00" />
        </Field>
        <Field>
          <FieldLabel>Prioridade</FieldLabel>
          <Select defaultValue="media" items={{ alta: "Alta", media: "Média", baixa: "Baixa" }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Prazo</FieldLabel>
          <DatePicker value={data} onValueChange={setData} clearable />
        </Field>
        <Field className="col-span-2">
          <FieldLabel>Descrição</FieldLabel>
          <Textarea placeholder="O que precisa ser feito, e por quê" maxLength={280} showCount rows={3} />
        </Field>
        <Field className="col-span-2">
          <FieldLabel>Código de verificação</FieldLabel>
          <OtpInput length={6} defaultValue="482" />
        </Field>
        <Field className="col-span-2">
          <FieldLabel>Com erro</FieldLabel>
          <Input aria-invalid defaultValue="email@" />
        </Field>
      </div>
    </Secao>
  )
}

function Selecao() {
  const [vista, setVista] = React.useState<"grade" | "lista">("grade")
  return (
    <Secao titulo="Seleção">
      <div className="grid grid-cols-2 gap-5">
        <Linha rotulo="checkbox">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked /> Avisar o time
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox /> Só para mim
          </label>
        </Linha>
        <Linha rotulo="switch">
          <label className="flex items-center gap-2 text-sm">
            <Switch defaultChecked /> Bloquear
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" /> Pequeno
          </label>
        </Linha>
        <Linha rotulo="radio">
          <RadioGroup defaultValue="mensal" className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="mensal" /> Mensal
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="anual" /> Anual
            </label>
          </RadioGroup>
        </Linha>
        <Linha rotulo="view toggle">
          <ViewToggle
            value={vista}
            onChange={setVista}
            ariaLabel="Visualização"
            options={[
              { value: "grade", label: "Grade", icon: <SquaresFour /> },
              { value: "lista", label: "Lista", icon: <Rows /> },
            ]}
          />
        </Linha>
        <Linha rotulo="abas (line · enclosed)">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Visão geral</TabsTrigger>
              <TabsTrigger value="b">Atividade</TabsTrigger>
              <TabsTrigger value="c">Ajustes</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="a">
            <TabsList variant="enclosed">
              <TabsTrigger value="a">Dia</TabsTrigger>
              <TabsTrigger value="b">Semana</TabsTrigger>
              <TabsTrigger value="c">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </Linha>
      </div>
      <Linha rotulo="choice card">
        <ChoiceCardGroup defaultValue="pro" className="grid w-full grid-cols-3 gap-3">
          <ChoiceCard value="starter" title="Starter" description="Para começar sozinho." />
          <ChoiceCard value="pro" title="Pro" description="O time inteiro no mesmo quadro." />
          <ChoiceCard value="enterprise" title="Enterprise" description="SSO e auditoria." disabled />
        </ChoiceCardGroup>
      </Linha>
      <Linha rotulo="choice chips">
        <ChoiceChips
          soonLabel="em breve"
          defaultValue={["ts", "go"]}
          groups={[
            {
              label: "Linguagens",
              items: [
                { value: "ts", label: "TypeScript" },
                { value: "py", label: "Python" },
                { value: "go", label: "Go" },
                { value: "rust", label: "Rust", soon: true },
              ],
            },
          ]}
        />
      </Linha>
    </Secao>
  )
}

function Navegacao() {
  return (
    <Secao titulo="Navegação e feedback">
      <Linha rotulo="breadcrumb · voltar">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Projetos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Cobrança</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tarefa 14</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <BackLink href="#">Voltar para o quadro</BackLink>
      </Linha>
      <Separator />
      <Linha rotulo="progresso · spinner">
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <Progress value={68} />
          </div>
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
        </div>
      </Linha>
      <Linha rotulo="skeleton">
        <div className="flex w-full items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </Linha>
      <Linha rotulo="toast · tooltip · avatar">
        <Button onClick={() => toast.success("Tarefa publicada", { description: "O time foi avisado." })}>
          <Bell /> Mostrar toast
        </Button>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Ajustes" />}>
            <Gear />
          </TooltipTrigger>
          <TooltipContent>Ajustes do projeto</TooltipContent>
        </Tooltip>
        <AvatarGroup>
          {["GT", "AM", "RS", "LP"].map((n) => (
            <Avatar key={n}>
              <AvatarFallback>{n}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </Linha>
      <Linha rotulo="marca">
        <MurikiLogo className="size-9" />
        <MurikiLogo eyes="closed" className="size-9" />
        {(["ts", "py", "go", "docker", "postgres", "aws"] as const).map((b) => (
          <BrandLogo key={b} brand={b} size={32} tile />
        ))}
      </Linha>
    </Secao>
  )
}

function Superficies() {
  return (
    <Secao titulo="Superfícies que flutuam">
      <div className="flex flex-wrap gap-2">
        <Dialog defaultOpen={location.hash.includes("dialogo")}>
          <DialogTrigger render={<Button variant="primary" />}>Diálogo</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Arquivar o projeto?</DialogTitle>
              <DialogDescription>As tarefas ficam só para leitura. Dá para desarquivar depois.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button />}>Cancelar</DialogClose>
              <DialogClose render={<Button variant="solid" />}>Arquivar</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>Confirmação</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir a tarefa?</AlertDialogTitle>
              <AlertDialogDescription>Não dá para desfazer. Os comentários vão junto.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Sheet>
          <SheetTrigger render={<Button />}>Painel lateral</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Tarefa 14</SheetTitle>
              <SheetDescription>Revisar o fluxo de cobrança</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <div className="flex flex-col gap-3 text-sm">
                <StatusPill status="doing" label="Fazendo" />
                <p className="text-muted-foreground">O painel abre por cima da página, em vidro.</p>
              </div>
            </SheetBody>
            <SheetFooter>
              <SheetClose render={<Button variant="solid" />}>Fechar</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Popover>
          <PopoverTrigger render={<Button />}>Popover</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Prazo</PopoverTitle>
            <PopoverDescription>Vence em 3 dias, sexta às 18h.</PopoverDescription>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuItem>Mover para…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Secao>
  )
}

function Dados() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Receita do mês" value="R$ 41.920" detail="recebido até hoje" trend={{ value: "+6,8%", direction: "up" }} />
        <MetricCard label="Tarefas abertas" value="128" detail="em 9 projetos" trend={{ value: "−12", direction: "down", good: true }} />
        <MetricCard label="Pessoas ativas" value="37" detail="de 40 no plano" live />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Secao titulo="Receita por mês">
          <BarChart
            ariaLabel="Receita por mês"
            labels={MESES}
            series={[
              { key: "novos", label: "Novos", values: [12, 15, 14, 18, 21, 24] },
              { key: "renov", label: "Renovações", values: [20, 21, 23, 22, 25, 27] },
            ]}
            formatValue={(v) => reais(v * 1000)}
            formatTick={(v) => `${v}k`}
            current={5}
          />
        </Secao>
        <Secao titulo="Pessoas ativas">
          <AreaChart
            ariaLabel="Pessoas ativas por mês"
            labels={MESES}
            series={[{ key: "ativas", label: "Ativas", values: [18, 22, 25, 29, 33, 37] }]}
            formatValue={(v) => `${v} pessoas`}
            current={5}
          />
        </Secao>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-4">
        <Secao titulo="Tarefas por projeto">
          <BarList
            items={[
              { key: "cob", label: "Cobrança", value: 42 },
              { key: "app", label: "App", value: 31 },
              { key: "site", label: "Site", value: 24 },
              { key: "api", label: "API", value: 18 },
              { key: "ops", label: "Operação", value: 9 },
            ]}
          />
        </Secao>
        <Secao titulo="Calendário">
          <Calendar mode="single" selected={new Date(2026, 9, 30)} defaultMonth={new Date(2026, 9, 1)} />
        </Secao>
        <Secao titulo="QR code">
          <QrCode value="otpauth://totp/Muriki:gt?secret=JBSWY3DPEHPK3PXP" size={150} logo={<MurikiLogo />} label="QR do autenticador" />
        </Secao>
      </div>
    </>
  )
}

function Lista() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-sm font-semibold text-foreground-strong">Lista tingida: role e ela passa por baixo do cabeçalho de vidro</h2>
      {Array.from({ length: 9 }, (_, i) => {
        const tom = TONS[(i % 8) + 1]
        return (
          <div key={i} className={`flex items-center justify-between rounded-[var(--radius)] bg-tone-${tom} px-5 py-4 text-tone-${tom}-foreground`}>
            <span className="text-sm font-medium">Tarefa {i + 1} · revisar o fluxo de cobrança</span>
            <Badge tone={tom}>{tom}</Badge>
          </div>
        )
      })}
    </section>
  )
}

function Vitrine() {
  const [modo, setModo] = React.useState(() => (location.hash.includes("papel") ? "papel" : location.hash.includes("vidro") ? "vidro" : "blur"))
  const [escuro, setEscuro] = React.useState(() => location.hash.includes("escuro"))
  useClasse("muriki-vidro", modo === "vidro")
  useClasse("muriki-blur", modo === "blur")
  useClasse("dark", escuro)

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh text-foreground">
        <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col gap-1 bg-rail p-3 shadow-[2px_0_10px_-7px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 px-2 pt-1 pb-4 text-sm font-semibold text-foreground-strong">
            <MurikiLogo className="size-6" /> Muriki
          </div>
          {["Paleta", "Botões", "Badges", "Campos", "Seleção", "Navegação", "Superfícies", "Dados"].map((item, i) => (
            <div
              key={item}
              className={
                "rounded-lg px-2.5 py-1.5 text-[0.8125rem] " +
                (i === 0 ? "bg-secondary font-medium text-foreground-strong" : "text-muted-foreground")
              }
            >
              {item}
            </div>
          ))}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5 p-8">
          <header data-blur className="sticky top-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] bg-card px-5 py-3 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground-strong">{modo === "blur" ? "Blur" : modo === "vidro" ? "Vidro" : "Papel"}</h1>
              <p className="text-sm text-muted-foreground">Todos os componentes do ui/ e os blocos de dado, com a paleta da Muriki.</p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </header>

          <Paleta />
          <div className="grid grid-cols-2 gap-5">
            <Botoes />
            <Rotulos />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Campos />
            <Selecao />
          </div>
          <div className="grid grid-cols-[1.4fr_1fr] gap-5">
            <Navegacao />
            <Superficies />
          </div>
          <Dados />
          <Lista />
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}

createRoot(document.getElementById("root")!).render(<Vitrine />)
