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

/**
 * Duas anatomias, e a diferença é onde mora o respiro.
 *
 * `padded` é o diálogo solto: uma pergunta curta com dois botões, padding
 * na caixa inteira e nada de divisórias. É o padrão.
 *
 * `framed` é o diálogo ESTRUTURADO, do modal de criar evento e do detalhe
 * de task: a caixa não tem padding próprio, o título vive numa faixa com
 * filete embaixo, o miolo rola entre seções separadas por filete e o
 * rodapé fica preso lá embaixo. Quando o conteúdo é longo e tem partes, a
 * divisória faz o trabalho que o espaço em branco não dá conta.
 */
type DialogAnatomy = "padded" | "framed"

const AnatomyCtx = React.createContext<DialogAnatomy>("padded")

function useAnatomy() {
  return React.useContext(AnatomyCtx)
}

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
  /** `padded` (padrão) é solto; `framed` divide em faixas com filete. */
  anatomy?: DialogAnatomy
  /**
   * Cobre a janela inteira. Quando cobre, DEIXA DE PAIRAR: sai o raio, sai a
   * sombra e sai o filete do `--float`. Aquele filete é desenhado por dentro,
   * então numa peça do tamanho exato da tela ele vira um contorno correndo
   * pelas quatro bordas — e uma superfície que é a página não precisa se
   * anunciar como peça sobre a página.
   */
  fullscreen?: boolean
}

function DialogContent({
  className,
  children,
  showClose = true,
  closeLabel = "Fechar",
  anatomy = "padded",
  fullscreen = false,
  ...props
}: DialogContentProps) {
  const framed = anatomy === "framed"
  return (
    <DialogPortal>
      <DialogBackdrop />
      <AnatomyCtx.Provider value={anatomy}>
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-anatomy={anatomy}
        data-fullscreen={fullscreen || undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col",
          fullscreen
            ? "h-dvh max-h-none w-screen max-w-none rounded-none shadow-none"
            : "max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] rounded-[var(--radius-float)] shadow-[var(--float-strong)] sm:max-w-lg",
          framed ? "gap-0 overflow-hidden" : "gap-4 overflow-y-auto p-5",
          "bg-popover text-popover-foreground outline-none",
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
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 pr-8",
        framed && "shrink-0 px-5 py-4 shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Uma seção do miolo estruturado. O filete embaixo separa uma parte da
 * outra; a última não leva filete, senão o corpo termina com uma linha
 * solta antes do rodapé.
 */
function DialogSection({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-section"
      className={cn(
        "flex flex-col gap-3 px-5 py-4 shadow-[inset_0_-1px_0_var(--border)] last:shadow-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * O miolo rola; cabeçalho e rodapé ficam. Sem ele, um diálogo alto rola
 * inteiro e o título sai da tela — que é o que o platform resolvia na mão
 * em cada tela, com p-0 no content e fundo próprio no cabeçalho.
 */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto",
        // no solto o corpo precisa vazar o padding da caixa para a barra de
        // rolagem encostar na borda; no estruturado a caixa não tem padding
        framed ? "" : "-mx-5 px-5",
        className
      )}
      {...props}
    />
  )
}

/**
 * O rodapé empilha invertido no mobile: a ação principal fica embaixo, ao
 * alcance do polegar, e no desktop volta para a direita.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  const framed = useAnatomy() === "framed"
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        framed && "shrink-0 px-5 py-4 shadow-[inset_0_1px_0_var(--border)]",
        className
      )}
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
  DialogSection,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
