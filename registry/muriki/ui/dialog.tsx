"use client"

/**
 * Muriki Dialog.
 *
 * A superfície mais alta do sistema: `--float-strong`. O véu é `--scrim`,
 * tinta do sistema e não preto puro — preto sobre papel quente esverdeia.
 *
 * Raio de recipiente (14px). O diálogo é o recipiente por excelência: o
 * contraste com o controle seco de dentro (raio 6px) é o que o olho lê
 * como "isto contém aquilo".
 *
 * O botão de fechar é um `ghost` de ícone com rótulo — a regra do sistema
 * vale aqui como vale na barra de ações: ícone sem rótulo é adivinhação.
 */
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/** O véu. Some junto com o diálogo, no mesmo tempo. */
function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-[var(--scrim)]",
        "transition-opacity duration-150 ease-out",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

interface DialogContentProps extends DialogPrimitive.Popup.Props {
  /** Esconde o X do canto — para diálogos que só saem por decisão. */
  showClose?: boolean
  closeLabel?: string
}

function DialogContent({
  className,
  children,
  showClose = true,
  closeLabel = "Fechar",
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
          "max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-y-auto sm:max-w-lg",
          "rounded-lg bg-popover p-5 text-popover-foreground shadow-[var(--float-strong)] outline-none",
          "transition-[opacity,transform] duration-150 ease-out",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className={cn(
              "absolute top-3.5 right-3.5 inline-flex size-7 items-center justify-center rounded-[6px]",
              "text-muted-foreground outline-none transition-colors",
              "hover:bg-secondary hover:text-foreground-strong",
              "focus-visible:ring-[3px] focus-visible:ring-ring/35"
            )}
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-8", className)}
      {...props}
    />
  )
}

/**
 * O rodapé empilha invertido no mobile: a ação principal fica embaixo, ao
 * alcance do polegar, e no desktop volta para a direita.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-base leading-tight font-semibold tracking-[-0.01em] text-foreground-strong",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-[13px] leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
