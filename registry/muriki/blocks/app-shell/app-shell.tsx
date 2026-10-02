"use client"

// A moldura dos apps do hub: o rail à esquerda e o palco à direita. É o
// desenho do Code (design/muriki-code, rail() e rail_compacto()) montado
// sobre o `sidebar` da casa, e o mesmo esqueleto que o Backoffice tinha
// montado sozinho.
//
// Não sabe de roteador nem de API. Cada item chega pronto: rótulo, ícone,
// se está ativo, e o elemento que navega em `render` (o <Link> do app) ou
// um `href`. Recolhido, o rail vira a coluna de ícones do rail_compacto —
// é o eixo `collapsible="icon"` do Sidebar. Passar o mouse (ou o foco) num
// grupo abre o flyout ao lado: o cartão com o rótulo e os itens do grupo,
// clicáveis, sem abrir o rail. O
// botão de recolher mora no topo do rail (o SidebarControls da casa); no
// celular, o rail vira gaveta e o gatilho vai para o topo do palco.
//
// O palco já vem com o respiro do desenho (32px em cima, 40px dos lados no
// desktop): as telas não resolvem isso cada uma. `stageClassName` ajusta,
// ex.: um max-width.
import { cloneElement, isValidElement, useEffect, type ReactElement, type ReactNode } from "react"
import { ArrowsLeftRightIcon, CaretRightIcon, GearSixIcon, ListIcon, SignOutIcon, XIcon } from "@phosphor-icons/react"
import { PreviewCard } from "@base-ui/react/preview-card"

import {
  Sidebar,
  SidebarContent,
  SidebarControls,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface AppShellNavItem {
  /** Chave estável da lista. */
  key: string
  label: string
  icon: ReactNode
  active?: boolean
  /** O elemento que navega, ex.: <Link to="/plans" />. Ganha de `href`. */
  render?: ReactElement
  href?: string
  onClick?: () => void
  /** À direita do rótulo: o ponto do Peer, o selo do plano. Some recolhido. */
  trailing?: ReactNode
  /**
   * O ícone em destaque, no amarelo da marca: o ícone do Phosphor vira
   * duotone e a camada de fundo ganha o --accent cheio, com o traço na
   * tinta do amarelo (--accent-foreground), escura nos dois temas. Amarelo
   * só no traço sumiria no claro; traço na cor do texto sumia no escuro,
   * claro em cima do amarelo. Um item por rail.
   */
  accent?: boolean
  /**
   * A tela ainda não existe: o item aparece esmaecido, com o selo mono
   * "em breve", não navega e é anunciado como desativado. Recolhido, o
   * selo aparece no flyout do grupo. O rótulo vem do
   * i18n (app_shell.soon) ou de `soonLabel` no AppShell.
   */
  soon?: boolean
}

export interface AppShellNavGroup {
  /** Rótulo mono do grupo, ex.: "Aprender". Sem rótulo, o grupo não tem título. */
  label?: string
  items: AppShellNavItem[]
}

export interface AppShellUser {
  name: string
  /** A segunda linha: o email no Code, o papel no Backoffice. */
  detail?: string
  /** O Avatar da casa, ou as iniciais num círculo. */
  avatar: ReactNode
  /** Onde o nome leva, ex.: <Link to="/account" />. */
  render?: ReactElement
  href?: string
  /** O nome acessível e o tooltip do link, ex.: "Minha conta". Sem isto, o nome da pessoa. */
  label?: string
}

export interface AppShellProps {
  product: {
    name: string
    /** A linha de baixo, ex.: "conta Muriki". */
    detail?: string
    logo: ReactNode
    /** Com isto, o topo vira botão de trocar de produto do hub. */
    onSwitch?: () => void
    switchLabel?: string
  }
  groups: AppShellNavGroup[]
  /** Os itens do pé, acima da régua: Peer, Plano. */
  footerItems?: AppShellNavItem[]
  /**
   * O seletor de idioma (o LanguageSwitcher), na linha acima do usuário, com a largura que sobra.
   * Recolhido, o app-shell liga o `compact` dele sozinho.
   */
  language?: ReactElement
  /** Os outros botões da linha, como o tema. Sem `language`, entram na linha do usuário, antes do sair. */
  utilities?: ReactNode
  user?: AppShellUser
  /** A engrenagem ao lado do usuário. */
  settings?: {
    label: string
    render?: ReactElement
    href?: string
    onClick?: () => void
  }
  /**
   * Sair da conta: o botão com a porta, ao lado da engrenagem. Recolhido,
   * vira ícone com tooltip. O rótulo vem do i18n (app_shell.sign_out).
   */
  onSignOut?: () => void
  /** Rótulo do botão que abre o menu no celular. Sem isto, vem do i18n (app_shell.open_menu). */
  menuLabel?: string
  /**
   * O nome da tela na barra de topo do celular, ao lado do logo (ex.: "Clientes").
   * Sem isto, vai o nome do produto.
   */
  mobileTitle?: ReactNode
  /** A ponta direita da barra de topo do celular: o avatar da conta, uma ação da tela. */
  mobileEnd?: ReactNode
  /** O selo dos itens `soon`. Sem isto, vem do i18n (app_shell.soon). */
  soonLabel?: string
  defaultOpen?: boolean
  className?: string
  /** O palco: padding do desenho por padrão; aqui entra um max-width, por exemplo. */
  stageClassName?: string
  /**
   * A faixa no topo do palco, em todas as telas: o aviso que pede ação e
   * não se dispensa, ex.: <SubscriptionStatus tone="overdue" …/> do
   * plans-page com "Atualizar pagamento". Some quando o app tira.
   */
  banner?: ReactNode
  /**
   * O selo do ambiente, à direita do rótulo do primeiro grupo, ex.:
   * <Badge tone="green" dot>dev</Badge>. Em produção o app não passa.
   */
  environment?: ReactNode
  children: ReactNode
}

function navega(item: { render?: ReactElement; href?: string }) {
  if (item.render) return item.render
  return item.href ? <a href={item.href} /> : undefined
}

function iconeDoItem(item: AppShellNavItem) {
  if (!item.accent || !isValidElement<{ weight?: string }>(item.icon)) return item.icon
  return cloneElement(item.icon, { weight: "duotone" })
}

function Item({ item, soonLabel }: { item: AppShellNavItem; soonLabel: string }) {
  if (item.soon) {
    // Sem destino e sem clique, mas ainda com hover: o flyout do rail
    // recolhido precisa dele. Por isso não usa o aria-disabled do botão,
    // que tira os eventos do ponteiro.
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled="true"
          data-soon=""
          onClick={(event) => event.preventDefault()}
          className="cursor-default text-muted-foreground/70 hover:bg-transparent aria-disabled:pointer-events-auto aria-disabled:opacity-100 [&_svg]:opacity-60"
        >
          {iconeDoItem(item)}
          <span className="flex-1">{item.label}</span>
          {item.trailing}
          <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted-foreground uppercase">
            {soonLabel}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={item.active}
        aria-current={item.active ? "page" : undefined}
        onClick={item.onClick}
        render={navega(item)}
        className={cn(
          !item.active && "text-muted-foreground",
          // a camada duotone do Phosphor é o path com opacity: vira o amarelo cheio, e o traço
          // leva a tinta do amarelo, não a do texto (que no escuro é clara e some no amarelo)
          item.accent &&
            "[&_svg]:text-accent-foreground [&_svg_[opacity]]:fill-accent [&_svg_[opacity]]:opacity-100"
        )}
      >
        {iconeDoItem(item)}
        <span className="flex-1">{item.label}</span>
        {item.trailing}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// Recolhido, o grupo inteiro é o gatilho: o cartão abre à direita da coluna, alinhado ao topo do
// grupo, com o rótulo e os mesmos itens do rail aberto (a contagem, o selo, o em breve). O rail
// não se mexe. No portal, fora do rail, os itens não pegam o encolhido do collapsible="icon".
function FlyoutDoGrupo({
  label,
  items,
  soonLabel,
  children,
}: {
  label?: string
  items: AppShellNavItem[]
  soonLabel: string
  children: ReactElement
}) {
  const { state, isMobile } = useSidebar()
  if (state !== "collapsed" || isMobile || items.length === 0) return children
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger delay={90} closeDelay={200} render={<div />}>
        {children}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner side="right" align="start" sideOffset={12} className="isolate z-50">
          <PreviewCard.Popup
            data-slot="app-shell-flyout"
            className={cn(
              "flex w-56 origin-(--transform-origin) flex-col rounded-[var(--radius-float)] bg-popover p-1.5 text-sm text-popover-foreground shadow-[var(--float)] outline-none",
              "transition-[opacity,transform] duration-100 ease-out",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
            )}
          >
            {label ? (
              <span className="flex h-[30px] items-center px-2.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {label}
              </span>
            ) : null}
            <SidebarMenu className="gap-0.5">
              {items.map((item) => (
                <Item key={item.key} item={item} soonLabel={soonLabel} />
              ))}
            </SidebarMenu>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  )
}

export function AppShell({
  product,
  groups,
  footerItems = [],
  language,
  utilities,
  user,
  settings,
  onSignOut,
  menuLabel,
  mobileTitle,
  mobileEnd,
  soonLabel,
  defaultOpen = true,
  className,
  stageClassName,
  banner,
  environment,
  children,
}: AppShellProps) {
  const t = useTranslate()
  const emBreve = soonLabel ?? t("app_shell.soon")
  useBarraDaJanela()
  const utilidadesComUsuario = !language && Boolean(utilities) && Boolean(user)
  const marca = (
    <>
      <span className="flex size-[30px] shrink-0 [&>*]:size-full">
        {product.logo}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-[13.5px] font-semibold text-foreground-strong">
          {product.name}
        </span>
        {product.detail ? (
          <span className="truncate text-[11px] text-muted-foreground">
            {product.detail}
          </span>
        ) : null}
      </span>
    </>
  )

  return (
    <SidebarProvider defaultOpen={defaultOpen} className={className}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-2.5 pt-3 pb-1.5">
          {/* Marca e recolher na mesma linha; recolhido, empilham. */}
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
            {product.onSwitch ? (
              <SidebarMenuButton
                size="lg"
                tooltip={product.switchLabel ?? product.name}
                aria-label={product.switchLabel}
                onClick={product.onSwitch}
                className="h-12 min-w-0 flex-1"
              >
                {marca}
                <ArrowsLeftRightIcon
                  aria-hidden
                  className="text-muted-foreground"
                />
              </SidebarMenuButton>
            ) : (
              <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 px-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                {marca}
              </div>
            )}
            <SidebarControls />
            <FecharNoCelular />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {groups.map((group, i) => (
            <SidebarGroup key={group.label ?? i} className="py-1">
              {/* Recolhido, o rótulo some; o traço de 24px separa a marca e os grupos. */}
              <span
                aria-hidden
                className="mx-auto my-1.5 hidden h-px w-6 shrink-0 bg-muted group-data-[collapsible=icon]:block"
              />
              {group.label || (i === 0 && environment) ? (
                <SidebarGroupLabel className="h-[30px] justify-between gap-2 px-2.5 font-mono text-[10px] font-normal tracking-[0.2em] text-muted-foreground">
                  <span className="truncate">{group.label}</span>
                  {i === 0 ? environment : null}
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <FlyoutDoGrupo label={group.label} items={group.items} soonLabel={emBreve}>
                  <SidebarMenu className="gap-0.5">
                    {group.items.map((item) => (
                      <Item key={item.key} item={item} soonLabel={emBreve} />
                    ))}
                  </SidebarMenu>
                </FlyoutDoGrupo>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="gap-0.5">
          {footerItems.length > 0 ? (
            <FlyoutDoGrupo items={footerItems} soonLabel={emBreve}>
              <SidebarMenu className="gap-0.5">
                {footerItems.map((item) => (
                  <Item key={item.key} item={item} soonLabel={emBreve} />
                ))}
              </SidebarMenu>
            </FlyoutDoGrupo>
          ) : null}
          {footerItems.length > 0 && (language || utilities || user) ? (
            <SidebarSeparator className="mx-1 my-2 bg-muted" />
          ) : null}
          {/* Sem idioma, a linha de cima teria só o tema, solta: as utilities vão para a linha do
              usuário, antes da engrenagem e do sair, como no menu antigo do Backoffice. */}
          {language || (utilities && !utilidadesComUsuario) ? (
            <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:flex-col">
              {language ? <IdiomaDoRail language={language} /> : null}
              {utilities}
            </div>
          ) : null}
          {user ? (
            <UsuarioNoCelular
              user={user}
              utilities={utilidadesComUsuario ? utilities : undefined}
              settings={settings}
              onSignOut={onSignOut}
            />
          ) : null}
          {user ? (
            <div className="flex h-11 items-center gap-1 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-col max-md:hidden">
              <UserLink user={user} />
              {utilidadesComUsuario ? (
                <span className="flex shrink-0 items-center gap-1 text-muted-foreground group-data-[collapsible=icon]:flex-col [&_button]:size-8">
                  {utilities}
                </span>
              ) : null}
              {settings ? <Settings settings={settings} /> : null}
              {onSignOut ? (
                <SidebarMenuButton
                  onClick={onSignOut}
                  aria-label={t("app_shell.sign_out")}
                  // em objeto, o tooltip aparece também com o rail aberto
                  tooltip={{ children: t("app_shell.sign_out") }}
                  className="size-8! shrink-0 justify-center px-0! text-muted-foreground"
                >
                  <SignOutIcon aria-hidden data-motion="nudge" />
                </SidebarMenuButton>
              ) : null}
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* No celular o rail vira gaveta: a barra de topo tem o botão que a abre, o logo com o
            nome da tela e, na ponta, a conta. */}
        <header
          data-slot="app-shell-mobile-bar"
          className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-rail px-2 shadow-[inset_0_-1px_0_var(--border)] md:hidden"
        >
          <AbrirMenu label={menuLabel ?? t("app_shell.open_menu")} />
          <span className="flex size-7 shrink-0 [&>*]:size-full">{product.logo}</span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground-strong">
            {mobileTitle ?? product.name}
          </span>
          {mobileEnd ? <div className="flex shrink-0 items-center gap-1 pr-2">{mobileEnd}</div> : null}
        </header>
        <div
          data-slot="app-shell-stage"
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col gap-6 px-4 pt-4 pb-8 md:px-10 md:pt-8",
            stageClassName
          )}
        >
          {banner}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function IdiomaDoRail({ language }: { language: ReactElement }) {
  // O invólucro é que tem a largura: o Base UI põe um foco-guarda antes do gatilho quando o menu
  // abre, e uma regra de :first-child na linha fazia o seletor encolher e andar. Recolhido, o
  // seletor vira o compacto (globo e sigla).
  const { state, isMobile } = useSidebar()
  const recolhido = state === "collapsed" && !isMobile
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 group-data-[collapsible=icon]:flex-none",
        // aberto, o seletor é a linha inteira com o conteúdo à esquerda (o botao_idioma do desenho);
        // o alvo é o botão, não os foco-guardas que o menu põe ao lado
        !recolhido && "[&>button]:w-full [&>button]:justify-start [&>button]:px-2.5"
      )}
    >
      {cloneElement(language as ReactElement<{ compact?: boolean }>, { compact: recolhido })}
    </div>
  )
}

function AbrirMenu({ label }: { label: string }) {
  const { setOpenMobile } = useSidebar()
  return (
    <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)} aria-label={label} className="size-10 shrink-0">
      <ListIcon aria-hidden className="size-5" />
    </Button>
  )
}

function FecharNoCelular() {
  // Na gaveta do celular, o fechar fica no lugar do recolher (que só existe no rail)
  const { isMobile, setOpenMobile } = useSidebar()
  const t = useTranslate()
  if (!isMobile) return null
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpenMobile(false)}
      aria-label={t("app_shell.close_menu")}
      className="size-10 shrink-0 text-muted-foreground"
    >
      <XIcon aria-hidden className="size-[18px]" />
    </Button>
  )
}

function UsuarioNoCelular({
  user,
  utilities,
  settings,
  onSignOut,
}: {
  user: AppShellUser
  utilities?: ReactNode
  settings?: AppShellProps["settings"]
  onSignOut?: () => void
}) {
  // O pé da gaveta no celular: a conta numa linha inteira com a seta, e embaixo o tema e o sair
  // como dois botões de meia largura, com alvo de toque de 40px
  const { isMobile } = useSidebar()
  const t = useTranslate()
  if (!isMobile) return null
  const alvo = navega(user)
  const conteudo = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center [&>*]:size-full">{user.avatar}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-foreground-strong">{user.name}</span>
        {user.detail ? <span className="block truncate text-[12px] text-muted-foreground">{user.detail}</span> : null}
      </span>
      {alvo ? <CaretRightIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  )
  const linha = "flex h-14 w-full items-center gap-3 rounded-[10px] px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
  return (
    <div data-slot="app-shell-mobile-account" className="flex flex-col gap-2 pt-1">
      {alvo
        ? cloneElement(alvo as ReactElement<Record<string, unknown>>, {
            className: cn(linha, "hover:bg-secondary"),
            "aria-label": user.label ?? user.name,
            children: conteudo,
          })
        : <div className={linha}>{conteudo}</div>}
      {utilities || settings || onSignOut ? (
        <div className="grid auto-cols-fr grid-flow-col gap-2">
          {utilities ? (
            <div className="flex [&>*]:h-11 [&>*]:w-full [&>*]:rounded-[10px] [&>*]:shadow-[inset_0_0_0_1px_var(--input)]">
              {utilities}
            </div>
          ) : null}
          {settings ? (
            <Button
              variant="outline"
              render={navega(settings)}
              onClick={settings.onClick}
              className="h-11 w-full"
            >
              <GearSixIcon aria-hidden />
              {settings.label}
            </Button>
          ) : null}
          {onSignOut ? (
            <Button variant="outline" onClick={onSignOut} className="h-11 w-full">
              <SignOutIcon aria-hidden />
              {t("app_shell.sign_out_short")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function UserLink({ user }: { user: AppShellUser }) {
  const conteudo = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center [&>*]:size-full">
        {user.avatar}
      </span>
      <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <span className="block truncate text-[13px] font-medium text-foreground-strong">
          {user.name}
        </span>
        {user.detail ? (
          <span className="block truncate text-[11px] text-muted-foreground">
            {user.detail}
          </span>
        ) : null}
      </span>
    </>
  )
  const classe =
    // recolhido, o avatar desce para o fim da coluna: tema, engrenagem e sair ficam acima dele
    "flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-[8px] px-2 outline-hidden ring-ring focus-visible:ring-2 group-data-[collapsible=icon]:order-last group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:p-1"
  const alvo = navega(user)
  if (!alvo) return <div className={classe}>{conteudo}</div>
  return (
    <SidebarMenuButton
      render={alvo}
      aria-label={user.label ?? user.name}
      tooltip={{ children: user.label ?? user.name }}
      className={cn(classe, "px-2")}
    >
      {conteudo}
    </SidebarMenuButton>
  )
}

function Settings({ settings }: { settings: NonNullable<AppShellProps["settings"]> }) {
  // Sem texto, então o nome vai no aria-label e no tooltip nativo.
  return (
    <SidebarMenuButton
      render={navega(settings)}
      onClick={settings.onClick}
      aria-label={settings.label}
      title={settings.label}
      className="size-8! shrink-0 justify-center px-0! text-muted-foreground"
    >
      <GearSixIcon aria-hidden data-motion="turn" />
    </SidebarMenuButton>
  )
}

// A barra da janela só aparece enquanto a pessoa rola: o tema a deixa fina e na cor do texto, e
// transparente quando o html marca data-scroll="idle". Aqui a marca vira "active" a cada rolagem e
// volta a "idle" um pouco depois da última. Sem o AppShell, a barra fica fina e discreta, à vista.
function useBarraDaJanela() {
  useEffect(() => {
    const raiz = document.documentElement
    let espera: ReturnType<typeof setTimeout> | undefined
    raiz.dataset.scroll = "idle"
    const rolou = () => {
      raiz.dataset.scroll = "active"
      clearTimeout(espera)
      espera = setTimeout(() => {
        raiz.dataset.scroll = "idle"
      }, 900)
    }
    window.addEventListener("scroll", rolou, { passive: true })
    return () => {
      window.removeEventListener("scroll", rolou)
      clearTimeout(espera)
      delete raiz.dataset.scroll
    }
  }, [])
}
