"use client"

/**
 * Criar e editar são o MESMO sheet — vazio ou preenchido. E o que tira
 * acesso ou apaga passa pelo ResourceConfirmDialog, nunca por um botão solto
 * dentro do formulário.
 *
 * O sheet é a anatomia `framed` do DS: título em faixa, seções com filete,
 * miolo que rola e rodapé preso com a ação sólida. O conteúdo inteiro é um
 * <form>, então Enter num campo envia e o botão de salvar é `type=submit`.
 */
import * as React from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetSection,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useResourceLabel } from "./labels"

export interface ResourceFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** As seções (ResourceFormSection). */
  children: React.ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitLabel?: string
  cancelLabel?: string
  /** Trava o botão e põe o spinner nele enquanto salva; o rótulo fica. */
  submitting?: boolean
  submitDisabled?: boolean
  /** À esquerda do rodapé: "Editado por Ana há 3 dias". */
  footerNote?: React.ReactNode
  /** Largura do painel em telas grandes. */
  size?: "default" | "lg"
  /** Solto das bordas, como no desenho do backoffice. Padrão: true. */
  floating?: boolean
}

export function ResourceFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  cancelLabel,
  submitting = false,
  submitDisabled = false,
  footerNote,
  size = "default",
  floating = true,
}: ResourceFormSheetProps) {
  const t = useResourceLabel()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent anatomy="framed" floating={floating} className={cn(size === "lg" ? "sm:max-w-xl" : "sm:max-w-[520px]")}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            if (!submitting) onSubmit(e)
          }}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <SheetBody>{children}</SheetBody>
          <SheetFooter className="items-center">
            {footerNote ? <span className="mr-auto text-xs text-muted-foreground">{footerNote}</span> : null}
            <Button type="button" variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
              {cancelLabel ?? t("resource.cancel")}
            </Button>
            <Button type="submit" variant="solid" size="lg" loading={submitting} disabled={submitDisabled}>
              {submitLabel ?? t("resource.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export interface ResourceFormSectionProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Rótulo da seção: mono, caixa alta, como na prancha. */
  title: React.ReactNode
  description?: React.ReactNode
}

export function ResourceFormSection({ title, description, className, children, ...props }: ResourceFormSectionProps) {
  return (
    <SheetSection className={cn("gap-3.5 py-5", className)} {...props}>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </SheetSection>
  )
}

export interface ResourceConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  /** Diga o que acontece e o que NÃO acontece ("a assinatura fica como está"). */
  description: React.ReactNode
  /** Campos extras: motivo, "cancelar também a assinatura"… */
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  /** Vermelho cheio. Desligue para confirmações que não destroem nada. */
  destructive?: boolean
  pending?: boolean
}

export function ResourceConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = true,
  pending = false,
}: ResourceConfirmDialogProps) {
  const t = useResourceLabel()
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader icon={destructive}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children ? <div className="flex flex-col gap-3">{children}</div> : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? t("resource.cancel")}</AlertDialogCancel>
          {/* Botão comum, não o Close: o diálogo só fecha quando o caller mudar `open` — se a ação falhar, ele fica. */}
          <Button
            variant="solid"
            size="lg"
            loading={pending}
            onClick={() => void onConfirm()}
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/35",
              "sm:w-auto"
            )}
          >
            {confirmLabel ?? t("resource.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
