"use client"

/**
 * Muriki Modal — a mesma conversa, na forma que couber na tela.
 *
 * Diálogo e sheet não são duas decisões de produto, são a mesma decisão em
 * duas larguras: no desktop a caixa vem ao centro, no celular ela sobe pela
 * borda de baixo, onde o polegar alcança. Quem escreve a tela não deveria
 * ter que decidir isso duas vezes, nem duplicar o conteúdo em dois ramos.
 *
 * Por isso o Modal é UM componente com as duas formas. `Dialog` e `Sheet`
 * continuam existindo para quem precisa forçar uma delas — um painel
 * lateral de filtro é sheet no desktop também, e não vira modal nunca.
 *
 * A troca é por largura de viewport, medida com `matchMedia` e lida por
 * `useSyncExternalStore` — que tem instantâneo de servidor próprio, então
 * o HTML renderizado no servidor é sempre a forma de diálogo e a hidratação
 * não briga. O primeiro quadro no celular pode nascer diálogo e virar
 * sheet; como o modal começa fechado, ninguém vê.
 */
import * as React from "react"

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/** Abaixo disto, a caixa vira sheet. É o `sm` do Tailwind. */
export const MODAL_BREAKPOINT = 640

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }
}

function useIsCompact(breakpoint: number) {
  const query = `(max-width: ${breakpoint - 1}px)`
  return React.useSyncExternalStore(
    React.useMemo(() => subscribe(query), [query]),
    () => window.matchMedia(query).matches,
    // No servidor não existe largura: assume a forma de diálogo.
    () => false
  )
}

interface ModalContext {
  compact: boolean
}

const Ctx = React.createContext<ModalContext>({ compact: false })

export interface ModalProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, eventDetails: unknown) => void
  /** Largura em px abaixo da qual vira sheet. Padrão: 640. */
  breakpoint?: number
  children?: React.ReactNode
}

function Modal({ breakpoint = MODAL_BREAKPOINT, children, ...props }: ModalProps) {
  const compact = useIsCompact(breakpoint)
  const Root = compact ? Sheet : Dialog
  return (
    <Ctx.Provider value={{ compact }}>
      {/* A chave força a remontagem ao trocar de forma: as duas raízes têm
          estado interno próprio, e reaproveitar a árvore deixaria foco e
          animação pela metade. */}
      <Root key={compact ? "sheet" : "dialog"} {...(props as object)}>
        {children}
      </Root>
    </Ctx.Provider>
  )
}

function useModal() {
  return React.useContext(Ctx)
}

function ModalTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  const { compact } = useModal()
  const Part = compact ? SheetTrigger : DialogTrigger
  return <Part {...props} />
}

function ModalClose(props: React.ComponentProps<typeof DialogClose>) {
  const { compact } = useModal()
  const Part = compact ? SheetClose : DialogClose
  return <Part {...props} />
}

export interface ModalContentProps
  extends React.ComponentProps<typeof DialogContent> {
  /** Classe extra só na forma de sheet — a de baixo costuma pedir altura. */
  sheetClassName?: string
}

function ModalContent({ className, sheetClassName, ...props }: ModalContentProps) {
  const { compact } = useModal()
  if (compact) {
    return <SheetContent side="bottom" className={cn(className, sheetClassName)} {...props} />
  }
  return <DialogContent className={className} {...props} />
}

function ModalHeader(props: React.ComponentProps<"div">) {
  const { compact } = useModal()
  const Part = compact ? SheetHeader : DialogHeader
  return <Part {...props} />
}

function ModalBody(props: React.ComponentProps<"div">) {
  const { compact } = useModal()
  const Part = compact ? SheetBody : DialogBody
  return <Part {...props} />
}

function ModalFooter(props: React.ComponentProps<"div">) {
  const { compact } = useModal()
  const Part = compact ? SheetFooter : DialogFooter
  return <Part {...props} />
}

function ModalTitle(props: React.ComponentProps<typeof DialogTitle>) {
  const { compact } = useModal()
  const Part = compact ? SheetTitle : DialogTitle
  return <Part {...props} />
}

function ModalDescription(props: React.ComponentProps<typeof DialogDescription>) {
  const { compact } = useModal()
  const Part = compact ? SheetDescription : DialogDescription
  return <Part {...props} />
}

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  useModal,
}
