"use client"

/**
 * Muriki Sheet — painel que entra pela borda.
 *
 * É o Dialog vestido de outro jeito, não outro primitivo: mesma
 * acessibilidade, mesmo foco preso, mesmo Esc. O Base UI tem `Drawer`, mas
 * ele é gaveta de baixo com swipe e ponto de encaixe — coisa de mobile. O
 * painel lateral do detalhe de task, do filtro e das configurações é isto
 * aqui.
 *
 * Encostado na borda, o painel perde o raio DAQUELE lado: um card
 * arredondado grudado na parede parece descolado. A sombra é a mesma
 * `--float-strong` do diálogo, e a parte dela que cai fora da tela o
 * próprio viewport corta.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

/**
 * As mesmas duas anatomias do Dialog, pela mesma razão: um painel com
 * conteúdo longo e partes precisa de faixa e filete; um painel curto vive
 * bem só com padding. Existir aqui também é o que impede o consumidor de
 * zerar o padding na mão e, junto, zerar o raio e o filete do token —
 * foi exatamente o que aconteceu no modal de task.
 */
type SheetAnatomy = "padded" | "framed"

const AnatomyCtx = React.createContext<SheetAnatomy>("padded")

function useAnatomy() {
  return React.useContext(AnatomyCtx)
}

type SheetSide = "right" | "left" | "bottom"

const SIDE: Record<SheetSide, string> = {
  right: [
    "inset-y-0 right-0 h-dvh w-full max-w-md rounded-l-[var(--radius-float)]",
    "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  ].join(" "),
  left: [
    "inset-y-0 left-0 h-dvh w-full max-w-md rounded-r-[var(--radius-float)]",
    "data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  ].join(" "),
  bottom: [
    "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-[var(--radius-float)]",
    "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
  ].join(" "),
}

function Sheet(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

interface SheetContentProps extends DialogPrimitive.Popup.Props {
  side?: SheetSide
  showClose?: boolean
  closeLabel?: string
  /** `padded` (padrão) é solto; `framed` divide em faixas com filete. */
  anatomy?: SheetAnatomy
}

function SheetContent({
  className,
  children,
  side = "right",
  showClose = true,
  closeLabel = "Fechar",
  anatomy = "padded",
  ...props
}: SheetContentProps) {
  const framed = anatomy === "framed"
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-[var(--scrim)]",
          "transition-opacity duration-200 ease-out",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )}
      />
      <AnatomyCtx.Provider value={anatomy}>
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        data-anatomy={anatomy}
        className={cn(
          "fixed z-50 flex flex-col bg-popover text-popover-foreground outline-none",
          framed ? "gap-0 overflow-hidden" : "gap-4 p-5",
          "shadow-[var(--float-strong)]",
          "transition-transform duration-200 ease-out",
          SIDE[side],
          className
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className={cn(
              "absolute top-3.5 right-3.5 inline-flex size-7 items-center justify-center rounded-[7px]",
              "text-muted-foreground outline-none transition-colors",
              "hover:bg-secondary hover:text-foreground-strong",
              "focus-visible:ring-[3px] focus-visible:ring-ring/35"
            )}
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
      </AnatomyCtx.Provider>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1.5 pr-8",
        framed && "shrink-0 px-5 py-4 shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
      {...props}
    />
  )
}

/** Uma seção do miolo estruturado, igual à do Dialog. */
function SheetSection({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-section"
      className={cn(
        "flex flex-col gap-3 px-5 py-4 shadow-[inset_0_-1px_0_var(--border)] last:shadow-none",
        className
      )}
      {...props}
    />
  )
}

/** O miolo rola; cabeçalho e rodapé ficam. */
function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto",
        framed ? "" : "-mx-5 px-5",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        framed && "shrink-0 px-5 py-4 shadow-[inset_0_1px_0_var(--border)]",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-base leading-tight font-semibold tracking-[-0.01em] text-foreground-strong",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-[13px] leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetSection,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
