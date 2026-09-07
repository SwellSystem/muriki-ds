"use client"

/**
 * Muriki AlertDialog.
 *
 * O diálogo que INTERROMPE: não fecha por clique fora nem por Esc, porque
 * a pergunta que ele faz não tem resposta implícita.
 *
 * É AQUI que o vermelho cheio mora. A regra do botão diz que `solid` é
 * exceção declarada, uma por tela, e que destrutiva no geral é tingida —
 * a exceção da exceção é este diálogo: quando a tela inteira existe para
 * confirmar um estrago, o botão que o confirma é sólido. Passe
 * `variant="solid"` no seu botão de ação, ou use `AlertDialogAction`, que
 * já vem vestido.
 */
import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { WarningIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogClose(props: AlertDialogPrimitive.Close.Props) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
}

function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        className={cn(
          "fixed inset-0 z-50 bg-[var(--scrim)]",
          "transition-opacity duration-150 ease-out",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )}
      />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
          "flex-col gap-4 sm:max-w-md",
          "rounded-lg bg-popover p-5 text-popover-foreground shadow-[var(--float-strong)] outline-none",
          "transition-[opacity,transform] duration-150 ease-out",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  )
}

/**
 * O cabeçalho traz o sinal de alerta tingido. Círculo de fundo tênue, não
 * bloco cheio: a cor cheia é do botão que confirma, e dois vermelhos
 * sólidos na mesma caixa cancelam um ao outro.
 */
function AlertDialogHeader({
  className,
  icon = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon?: boolean }) {
  return (
    <div data-slot="alert-dialog-header" className={cn("flex gap-3", className)} {...props}>
      {icon ? (
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive-subtle text-destructive-subtle-foreground"
        >
          <WarningIcon className="size-[18px]" weight="bold" />
        </span>
      ) : null}
      <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
    </div>
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-base leading-tight font-semibold tracking-[-0.01em] text-foreground-strong",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-[13px] leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Sai sem fazer nada. Filete, como toda ação secundária do sistema. */
function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <AlertDialogPrimitive.Close
      render={<Button variant="outline" size="lg" className={cn("sm:w-auto", className)} />}
      {...props}
    />
  )
}

/** Confirma o estrago. Sólido — é a exceção declarada deste diálogo. */
function AlertDialogAction({
  className,
  destructive = true,
  ...props
}: React.ComponentProps<typeof Button> & { destructive?: boolean }) {
  return (
    <AlertDialogPrimitive.Close
      render={
        <Button
          variant="solid"
          size="lg"
          className={cn(
            destructive &&
              "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/35",
            "sm:w-auto",
            className
          )}
        />
      }
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
}
