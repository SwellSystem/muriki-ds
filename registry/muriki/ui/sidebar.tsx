/* oxlint-disable react-refresh/only-export-components */
/**
 * Muriki Sidebar.
 *
 * DOIS EIXOS, e eles não são a mesma lista. POSIÇÃO diz onde o rail mora —
 * encostado na borda ou flutuando como cartão; LARGURA diz quanto ele
 * mostra — rótulos ou só ícones. Colapsar um rail flutuante é uma
 * combinação legítima, e a mais útil em tela apertada: se os dois virassem
 * valores de uma lista só, ela deixaria de existir.
 *
 * TRÊS COISAS, não duas, e vale nomear direito: POSIÇÃO (encostado ou
 * flutuando) e LARGURA (rótulos ou ícones) são os eixos; `enablePinning` é
 * um COMPORTAMENTO em cima deles — desafixado, o rail some e volta quando o
 * mouse encosta na borda. Por isso ele é opt-in: um rail que se esconde
 * sozinho não serve a toda tela.
 *
 * O corte: `inset` saiu (o conteúdo virava cartão dentro de uma moldura que
 * não era superfície de nada) e o sistema de flyout de grupo saiu junto —
 * era uma feature inteira, com contexto exportado, que nada acionava. E o
 * `SidebarRail` saiu — uma segunda faixa invisível na borda que recolhia o
 * menu, sem rótulo e fora do tab order, ocupando as MESMAS coordenadas da
 * faixa que revela o rail desafixado. Recolher agora tem um botão visível.
 *
 * O RAIL USA A ESCALA DA CASA, e essa foi a última coisa portada sem
 * conferir. O item de nav vinha do platform com 40px de altura, 16px de
 * texto (17px acima de 1536px), ícone de 18px (20px acima de 1536px) e raio
 * de 8,4px; o seletor de workspace vinha com 64px, virando 80px em tela
 * larga. Nenhum desses números existe no sistema — as alturas são
 * 24/28/32/36/44, o raio é altura ÷ 4 e o texto de controle é 13px. O rail
 * era a única superfície da casa fora da régua, e por isso parecia grande
 * demais ao lado de qualquer outra coisa na mesma tela.
 *
 * Agora o item é 36px/raio 9/13px/ícone 16 (o `lg` da casa, porque item de
 * nav é alvo frequente), o sub-item é 28px/raio 7, e o seletor de workspace
 * é 44px/raio 11 — o piso de toque, que é o que uma linha dupla pede. As
 * regras `2xl:` saíram: nav que cresce com a janela não é uma decisão do
 * sistema, é um resto de outro projeto.
 *
 * RECOLHIDO, SÓ O ÍCONE DA FRENTE SOBREVIVE. A regra antiga escondia
 * apenas spans de texto puro, então qualquer coisa depois do rótulo — o
 * caret do seletor de workspace, um contador, uma seta — continuava no
 * fluxo e só sumia por causa do `overflow-hidden` do botão. O resultado era
 * um caret cortado ao meio pela borda do rail. Agora todo filho que não é o
 * primeiro some no modo ícone, que é o que "recolhido" quer dizer.
 *
 * HOVER E ATIVO SÃO A MESMA FAMÍLIA. O hover vinha `bg-muted`, um neutro
 * amarelado, sobre um rail que está no nível do cartão — dava uma mancha
 * cinza que não conversava com o azul do item ativo. Agora o hover é a
 * mesma tinta do ativo com metade da força: passar o mouse prenuncia o
 * estado selecionado em vez de anunciar outro.
 *
 * O RAIL FICA DO LADO DE FORA DO CONTEÚDO. No claro é acima da página
 * (0.998 contra 0.968), no escuro é abaixo (0.152 contra 0.175) — a
 * moldura toma a borda da rampa e o palco fica no meio. Quem decide isso é
 * o token `--rail`, não este arquivo.
 *
 * A BORDA LIVRE É UMA SÓ, e é a do cursor do view-toggle: filete desenhado
 * POR DENTRO mais uma elevação ambiente curta. Desenhar por dentro é o que
 * faz a linha abraçar o raio e não somar ao tamanho da caixa, e é a
 * diferença entre uma aresta e um contorno.
 *
 * ERAM DUAS. O container trazia um `border-r` de verdade e o interno trazia
 * o filete por dentro, empilhados no mesmo pixel — o mesmo defeito que o
 * Sheet já tinha mostrado quando o modal de task chegou. Só se percebia
 * medindo: apagar uma das duas não mudava nada na tela. Ficou a de dentro,
 * e no `--border`, não no `--input`: o filete do cursor é forte porque a
 * peça é pequena; correndo a altura inteira da tela ele vira régua.
 *
 * Só na borda LIVRE. O filete do cursor é `inset 0 0 0 1px`, que corre pelos
 * quatro lados; numa peça que toca três bordas da tela isso vira um
 * contorno de janela. É a mesma armadilha que o diálogo em tela cheia já
 * tinha mostrado.
 *
 * SOLTO, O RAIL DEIXA DE SER MOLDURA. Nas variantes que descolam da borda —
 * `floating` e o rail desafixado — a superfície passa a ser a do cartão e a
 * sombra volta. É a mesma família de raciocínio de "encostado não tem
 * raio": o que a peça é depende de estar ou não tocando a parede.
 *
 * ENCOSTADO NÃO TEM RAIO. O rail toca três bordas da tela, e arredondar só
 * a quarta o faz parecer um cartão que não chegou na parede. É a mesma
 * regra que o Sheet já declara — o painel perde o raio do lado encostado —
 * e que este componente contradizia. Flutuando, o raio volta: aí a peça
 * está solta de verdade.
 *
 * O rail NÃO tem paleta própria. O shadcn traz oito tokens `--sidebar-*`
 * que são cópias quase iguais das cores base, e manter duas paletas é
 * garantir que uma hora elas divergem.
 *
 * Ele é a PEÇA ELEVADA, e usa exatamente o relevo do cursor do ViewToggle
 * — a mesma física, no tamanho de uma tela. No claro a peça está por cima:
 * card branco descendo sombra sobre o papel do conteúdo. No escuro ela
 * assenta como encaixe, mais escura que a página, com o fio de luz na
 * aresta de baixo por dentro. É a regra 04 da prancha do escuro aplicada
 * ao shell inteiro.
 *
 * O conteúdo, do outro lado, é sempre o papel: `--background`.
 *
 * As duas medidas do rail (`--sidebar-width`, `--sidebar-width-icon`)
 * continuam locais: são geometria deste componente, não cor do sistema.
 */
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PushPinIcon,
  PushPinSimpleIcon,
  SidebarIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react"

/**
 * O rail vira gaveta abaixo de 768px. O hook vive aqui e não num
 * `hooks/use-mobile` solto: é uma medida DESTE componente, e um arquivo a
 * menos para o consumidor caçar depois do `shadcn add`.
 */
const MOBILE_BREAKPOINT = 768

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_PINNED_COOKIE_NAME = "sidebar_pinned"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
// 13.75rem = 220px. Eram 256 (o padrão do shadcn, e o mesmo do platform)
// para 92px de conteúdo: ícone 16, respiro 10 e o rótulo mais largo com 66.
// Sobravam 163px de coluna vazia, e o fundo do item ativo era uma laje de
// 235px ao lado de 66px de texto.
const SIDEBAR_WIDTH = "13.75rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  pinned: boolean
  setPinned: (pinned: boolean) => void
  togglePin: () => void
  /** Se o eixo de POSIÇÃO está ligado. Desligado, o rail só encosta. */
  enablePinning: boolean
  floating: boolean
  setFloating: (floating: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)


function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  enablePinning = false,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  enablePinning?: boolean
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Pin é o segundo eixo (independente do recolher): desafixada, a sidebar sai
  // do fluxo e flutua por cima. É opt-in (`enablePinning`) — só sidebars que
  // expõem o controle de fixar entram no eixo; as demais (ex.: settings shell)
  // ficam sempre fixadas e ignoram o cookie, senão herdariam um overlay
  // escondido sem como reverter. Lazy-init do cookie pra restaurar a preferência.
  const [pinned, _setPinned] = React.useState(() => {
    if (!enablePinning || typeof document === "undefined") return true
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${SIDEBAR_PINNED_COOKIE_NAME}=([^;]+)`)
    )
    return match ? match[1] !== "false" : true
  })
  const setPinned = React.useCallback(
    (value: boolean) => {
      if (!enablePinning) return
      _setPinned(value)
      document.cookie = `${SIDEBAR_PINNED_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [enablePinning]
  )
  // O "revelar" do overlay flutuante (desafixado). Mora no provider pra que o
  // togglePin possa mantê-lo aberto no MESMO update que desafixa — senão há um
  // frame escondido e o mouse-leave dispara espúrio na troca de layout (rail).
  const [floating, setFloating] = React.useState(false)
  const togglePin = React.useCallback(() => {
    if (!enablePinning) return
    _setPinned((previous) => {
      const next = !previous
      document.cookie = `${SIDEBAR_PINNED_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      // Ao desafixar, o mouse ainda está sobre a sidebar: mantém aberta (o
      // mouse-leave esconde quando sair).
      if (!next) setFloating(true)
      return next
    })
  }, [enablePinning])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      pinned,
      setPinned,
      togglePin,
      enablePinning,
      floating,
      setFloating,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      pinned,
      setPinned,
      togglePin,
      enablePinning,
      floating,
    ]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full ",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile,
    pinned,
    floating,
    setFloating,
  } = useSidebar()
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Re-avalia o hide do overlay desafixado: se o mouse não voltou para a
  // sidebar, esconde.
  React.useEffect(() => {
    if (pinned) return
    const el = containerRef.current
    // Não esconde se o mouse ainda está sobre ela ou se há foco (teclado) dentro
    // — ex.: desafixar pelo botão via teclado mantém o contexto de navegação.
    if (el && !el.matches(":hover") && !el.contains(document.activeElement)) {
      setFloating(false)
    }
  }, [pinned, setFloating])

  // O reveal/hide do overlay flutuante vai inline: transform/opacity/transition
  // direto no elemento vencem qualquer utility/cascade do Tailwind, garantindo
  // a transição lateral (o `transition-[left,width]` base não cobre transform).
  const hiddenTransform =
    side === "right"
      ? "translateX(calc(100% + 1rem))"
      : "translateX(calc(-100% - 1rem))"
  const floatStyle: React.CSSProperties | undefined =
    !pinned && !isMobile
      ? {
          transform: floating ? "translateX(0)" : hiddenTransform,
          opacity: floating ? 1 : 0,
          pointerEvents: floating ? "auto" : "none",
          transition:
            "transform 400ms cubic-bezier(0.33, 1.2, 0.45, 1), opacity 260ms ease, box-shadow 300ms ease",
        }
      : undefined

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col text-foreground", "bg-rail shadow-[2px_0_10px_-7px_rgba(0,0,0,0.30),inset_-1px_0_0_var(--border)] dark:shadow-[2px_0_12px_-7px_rgba(0,0,0,0.7),inset_-1px_0_0_oklch(0.285_0.005_107)] data-[side=right]:shadow-[-2px_0_10px_-7px_rgba(0,0,0,0.30),inset_1px_0_0_var(--border)] dark:data-[side=right]:shadow-[-2px_0_12px_-7px_rgba(0,0,0,0.7),inset_1px_0_0_oklch(0.285_0.005_107)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-card p-0 text-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navegação principal.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-pinned={pinned ? "true" : "false"}
      data-floating={!pinned && floating ? "true" : "false"}
      data-slot="sidebar"
    >
      {/* Zona de gatilho na borda: desafixada, encostar aqui revela a sidebar. */}
      {!pinned ? (
        <div
          data-slot="sidebar-edge"
          aria-hidden
          onMouseEnter={() => setFloating(true)}
          className="fixed inset-y-0 z-40 hidden w-3 group-data-[side=left]:left-0 group-data-[side=right]:right-0 md:block"
        />
      ) : null}
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[pinned=false]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        ref={containerRef}
        onMouseLeave={(event) => {
          // portalizado, então mover o mouse pra ele dispara este leave.
          // Esconder ao sair com o mouse — exceto quando há foco POR TECLADO
          // (focus-visible) dentro. Foco vindo de clique (ex.: clicar num item
          // de nav) NÃO segura o overlay aberto.
          const active = document.activeElement
          let keyboardFocusInside = false
          if (
            active instanceof HTMLElement &&
            event.currentTarget.contains(active)
          ) {
            try {
              keyboardFocusInside = active.matches(":focus-visible")
            } catch {
              keyboardFocusInside = false
            }
          }
          if (!keyboardFocusInside) setFloating(false)
        }}
        onFocusCapture={() => {
          // Teclado: tabular pra dentro revela o overlay (senão o foco entraria
          // num cartão invisível/fora de tela).
          if (!pinned) setFloating(true)
        }}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setFloating(false)
          }
        }}
        style={floatStyle ? { ...floatStyle, ...style } : style}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          // Eixo "pin": desafixada, vira um CARTÃO flutuante (margem, cantos
          // arredondados, sombra) — fiel ao mock. O reveal/hide (transform +
          // opacity + transição) é controlado inline via `floatStyle`.
          "group-data-[pinned=false]:inset-y-2! group-data-[pinned=false]:z-30 group-data-[pinned=false]:h-auto! group-data-[pinned=false]:overflow-hidden group-data-[pinned=false]:bg-card! group-data-[pinned=false]:rounded-[var(--radius-float)]! group-data-[pinned=false]:border! group-data-[pinned=false]:border-border/45! group-data-[pinned=false]:shadow-xl group-data-[pinned=false]:data-[side=left]:left-2! group-data-[pinned=false]:data-[side=right]:right-2!",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="relative flex size-full flex-col bg-rail shadow-[2px_0_10px_-7px_rgba(0,0,0,0.30),inset_-1px_0_0_var(--border)] dark:shadow-[2px_0_12px_-7px_rgba(0,0,0,0.7),inset_-1px_0_0_oklch(0.285_0.005_107)] data-[side=right]:shadow-[-2px_0_10px_-7px_rgba(0,0,0,0.30),inset_1px_0_0_var(--border)] dark:data-[side=right]:shadow-[-2px_0_12px_-7px_rgba(0,0,0,0.7),inset_1px_0_0_oklch(0.285_0.005_107)] group-data-[variant=floating]:bg-card group-data-[variant=floating]:rounded-[var(--radius-float)] group-data-[variant=floating]:border group-data-[variant=floating]:border-border/35 group-data-[variant=floating]:shadow-[0_18px_45px_-32px_oklch(var(--foreground))] group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-border/35"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <SidebarIcon />
      <span className="sr-only">Recolher menu</span>
    </Button>
  )
}

function SidebarControls({ className, ...props }: React.ComponentProps<"div">) {
  const { toggleSidebar, togglePin, pinned, state, isMobile, enablePinning } =
    useSidebar()

  if (isMobile) return null
  const colapsado = state === "collapsed"

  return (
    <div
      data-slot="sidebar-controls"
      className={cn(
        "flex shrink-0 items-center gap-0.5",
        "group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex-col",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleSidebar}
        aria-label={colapsado ? "Expandir menu" : "Recolher menu"}
        title={colapsado ? "Expandir menu" : "Recolher menu"}
        className="text-muted-foreground"
      >
        <SidebarSimpleIcon aria-hidden size={16} />
      </Button>
      {/* Sem o eixo de posição ligado, o botão de fixar seria um botão morto. */}
      {enablePinning ? (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={togglePin}
        aria-label={pinned ? "Soltar menu" : "Fixar menu"}
        title={pinned ? "Soltar menu" : "Fixar menu"}
        className={cn("text-muted-foreground", !pinned && "text-primary")}
      >
        {pinned ? (
          <PushPinSimpleIcon aria-hidden size={16} />
        ) : (
          <PushPinIcon aria-hidden size={16} weight="fill" />
        )}
      </Button>
      ) : null}
    </div>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2.5 group-data-[collapsible=icon]:px-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-2.5 group-data-[collapsible=icon]:px-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "mx-2 bg-border/25 data-[orientation=horizontal]:w-auto",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col px-2.5 py-2 group-data-[collapsible=icon]:px-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-[11px] font-semibold tracking-[0.07em] text-foreground/60 uppercase ring-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  })
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground ring-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-secondary hover:text-foreground-strong focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(
        "flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:gap-1",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button relative flex w-full items-center gap-2.5 overflow-hidden rounded-[9px] px-2.5 text-left text-[13px] whitespace-nowrap text-foreground ring-ring outline-hidden transition-colors duration-150 group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:rounded-[9px] group-data-[collapsible=icon]:px-0! hover:bg-primary-subtle/50 group-data-[collapsible=icon]:hover:bg-primary-subtle/50 focus-visible:ring-2 active:bg-primary/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:bg-primary/10 data-open:text-foreground data-active:bg-primary-subtle data-active:text-primary-subtle-foreground data-active:before:absolute data-active:before:top-2 data-active:before:bottom-2 data-active:before:left-0 data-active:before:w-[3px] data-active:before:rounded-full data-active:before:bg-primary group-data-[collapsible=icon]:data-active:before:hidden data-active:hover:bg-primary-subtle/70 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:not(:has(*))]:truncate group-data-[collapsible=icon]:[&>*:not(:first-child)]:hidden",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "border border-border bg-card hover:border-primary/40",
      },
      size: {
        /** 36px, raio 9 — o `lg` da casa. Item de nav é alvo frequente. */
        default: "h-9",
        /** 28px, raio 7 — o `sm` da casa. */
        sm: "h-7 rounded-[7px] text-[12.5px]",
        /**
         * 44px, raio 11 — o piso de toque da casa, usado pelo seletor de
         * workspace, que empilha duas linhas. Era `h-16` (64px) crescendo
         * para 80px no 2xl: um controle maior que qualquer outro do sistema.
         */
        lg: "h-11 rounded-[11px] text-[13px] group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:px-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()
  const noTooltip = !tooltip
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        // order — o teclado navega pelos ícones do trilho (o trigger).
      },
      props
    ),
    render: noTooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  })

  if (noTooltip) {
    return comp
  }

  // Tooltips "ricos" (objeto vindo de hintTooltip) aparecem também na sidebar
  // EXPANDIDA — fiel ao design. Tooltips simples (string: switcher, feedback)
  // continuam só no rail pra não poluir.
  const tooltipIsRich = typeof tooltip === "object"

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  // Delay vive no Provider (no base-ui o Root não aceita delay/closeDelay).
  // Rápido no rail (90ms), com respiro no expandido (360ms) — igual ao mock.
  return (
    <TooltipProvider delay={state === "collapsed" ? 90 : 360} closeDelay={0}>
      <Tooltip>
        {comp}
        <TooltipContent
          side="right"
          align="center"
          sideOffset={8}
          hidden={isMobile || (!tooltipIsRich && state !== "collapsed")}
          {...tooltip}
        />
      </Tooltip>
    </TooltipProvider>
  )
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground ring-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-foreground-strong peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-secondary hover:text-foreground-strong focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-foreground-strong aria-expanded:opacity-100 md:opacity-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  })
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-foreground-strong peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-foreground-strong",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-border/50 px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md"
    isActive?: boolean
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "relative flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-[7px] px-2 text-foreground/90 ring-ring outline-hidden transition-colors duration-150 group-data-[collapsible=icon]:hidden hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 active:bg-primary/10 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-[12.5px] data-[size=sm]:text-[12px] data-active:bg-primary-subtle data-active:text-primary-subtle-foreground data-active:before:absolute data-active:before:top-1 data-active:before:bottom-1 data-active:before:left-0 data-active:before:w-[2px] data-active:before:rounded-full data-active:before:bg-primary [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarControls,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
