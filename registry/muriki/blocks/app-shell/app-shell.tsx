"use client"

// A moldura dos apps do hub: o rail à esquerda e o palco à direita. É o
// desenho do Code (design/muriki-code, rail() e rail_compacto()) montado
// sobre o `sidebar` da casa, e o mesmo esqueleto que o Backoffice tinha
// montado sozinho.
//
// Não sabe de roteador nem de API. Cada item chega pronto: rótulo, ícone,
// se está ativo, e o elemento que navega em `render` (o <Link> do app) ou
// um `href`. Recolhido, o rail vira a coluna de ícones do rail_compacto —
// é o eixo `collapsible="icon"` do Sidebar, com o tooltip de cada item.
import type { ReactElement, ReactNode } from "react"
import { ArrowsLeftRightIcon, GearSixIcon } from "@phosphor-icons/react"

import {
  Sidebar,
  SidebarContent,
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  /** Idioma e tema, na linha acima do usuário. */
  utilities?: ReactNode
  user?: AppShellUser
  /** A engrenagem ao lado do usuário. */
  settings?: {
    label: string
    render?: ReactElement
    href?: string
    onClick?: () => void
  }
  /** Rótulo do botão que abre o menu no celular. */
  menuLabel?: string
  defaultOpen?: boolean
  className?: string
  children: ReactNode
}

function navega(item: { render?: ReactElement; href?: string }) {
  if (item.render) return item.render
  return item.href ? <a href={item.href} /> : undefined
}

function Item({ item }: { item: AppShellNavItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        isActive={item.active}
        aria-current={item.active ? "page" : undefined}
        onClick={item.onClick}
        render={navega(item)}
        className={cn(!item.active && "text-muted-foreground")}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        {item.trailing}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppShell({
  product,
  groups,
  footerItems = [],
  utilities,
  user,
  settings,
  menuLabel = "Menu",
  defaultOpen = true,
  className,
  children,
}: AppShellProps) {
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
          {product.onSwitch ? (
            <SidebarMenuButton
              size="lg"
              tooltip={product.switchLabel ?? product.name}
              aria-label={product.switchLabel}
              onClick={product.onSwitch}
              className="h-12"
            >
              {marca}
              <ArrowsLeftRightIcon
                aria-hidden
                className="text-muted-foreground"
              />
            </SidebarMenuButton>
          ) : (
            <div className="flex h-12 items-center gap-2.5 px-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              {marca}
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          {groups.map((group, i) => (
            <SidebarGroup key={group.label ?? i} className="py-1">
              {group.label ? (
                <SidebarGroupLabel className="h-[30px] px-2.5 font-mono text-[10px] font-normal tracking-[0.2em] text-muted-foreground">
                  {group.label}
                </SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => (
                    <Item key={item.key} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="gap-0.5">
          {footerItems.length > 0 ? (
            <SidebarMenu className="gap-0.5">
              {footerItems.map((item) => (
                <Item key={item.key} item={item} />
              ))}
            </SidebarMenu>
          ) : null}
          {footerItems.length > 0 && (utilities || user) ? (
            <SidebarSeparator className="mx-1 my-2 bg-muted" />
          ) : null}
          {utilities ? (
            <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:flex-col [&>*:first-child]:flex-1 group-data-[collapsible=icon]:[&>*:first-child]:flex-none">
              {utilities}
            </div>
          ) : null}
          {user ? (
            <div className="flex h-11 items-center gap-1 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-col-reverse">
              <UserLink user={user} />
              {settings ? <Settings settings={settings} /> : null}
            </div>
          ) : null}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* No celular o rail vira gaveta, e alguém precisa abri-la. */}
        <header className="flex h-12 items-center gap-2 px-4 md:hidden">
          <SidebarTrigger aria-label={menuLabel} />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
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
    "flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-[8px] px-2 outline-hidden ring-ring focus-visible:ring-2 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:p-1"
  const alvo = navega(user)
  if (!alvo) return <div className={classe}>{conteudo}</div>
  return (
    <SidebarMenuButton
      render={alvo}
      tooltip={user.name}
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
