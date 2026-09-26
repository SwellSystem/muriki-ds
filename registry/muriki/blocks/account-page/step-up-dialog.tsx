"use client"

// "Confirme que é você": o diálogo das ações sensíveis. A API aceita a
// senha OU o código do app (POST /auth/step-up), e a confirmação vale
// alguns minutos. Com `destructive`, o mesmo diálogo é o de excluir a
// conta: título e frase do estrago, e o botão vermelho cheio.
//
// Controlado: o app abre, recebe a credencial por `onConfirm`, chama a API
// e fecha quando der certo. Não fecha sozinho no clique — um step-up que
// falha precisa mostrar o erro no mesmo lugar.
import { useState, type FormEvent } from "react"
import { LockSimpleIcon, TrashIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type StepUpCredential = { password: string } | { code: string }

export interface StepUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (credential: StepUpCredential) => void
  pending?: boolean
  error?: string
  /** Sem título, é o "Confirme que é você". */
  title?: string
  description?: string
  confirmLabel?: string
  /** Excluir conta: ícone de lixeira e botão vermelho cheio. */
  destructive?: boolean
  /** Sem app autenticador ligado, não oferece o código. Padrão: true. */
  allowCode?: boolean
}

export function StepUpDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
  error,
  title,
  description,
  confirmLabel,
  destructive = false,
  allowCode = true,
}: StepUpDialogProps) {
  const t = useTranslate()
  const [modo, setModo] = useState<"password" | "code">("password")
  const [senha, setSenha] = useState("")
  const [codigo, setCodigo] = useState("")

  function limpar(next: boolean) {
    if (!next) {
      setSenha("")
      setCodigo("")
      setModo("password")
    }
    onOpenChange(next)
  }

  function enviar(event?: FormEvent) {
    event?.preventDefault()
    if (modo === "password" && senha) onConfirm({ password: senha })
    if (modo === "code" && codigo.length === 6) onConfirm({ code: codigo })
  }

  const Icone = destructive ? TrashIcon : LockSimpleIcon

  return (
    <Dialog open={open} onOpenChange={limpar}>
      <DialogContent>
        <form onSubmit={enviar} className="flex flex-col gap-4">
          <DialogHeader className="flex-row items-start gap-3.5">
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[18px]",
                destructive ? "bg-tone-red text-tone-red-foreground" : "bg-primary-subtle text-primary-subtle-foreground"
              )}
            >
              <Icone />
            </span>
            <div className="flex flex-col gap-1.5">
              <DialogTitle>{title ?? t("account.step_up.title")}</DialogTitle>
              <DialogDescription>{description ?? t("account.step_up.description")}</DialogDescription>
            </div>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-2">
            {modo === "password" ? (
              <Field invalid={!!error}>
                <FieldLabel>{t("account.step_up.password")}</FieldLabel>
                <Input
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="font-mono"
                />
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
            ) : (
              <Field invalid={!!error}>
                <FieldLabel>{t("account.step_up.code")}</FieldLabel>
                <OtpInput
                  length={6}
                  autoFocus
                  value={codigo}
                  onValueChange={setCodigo}
                  onComplete={(v) => !pending && onConfirm({ code: v })}
                  invalid={!!error}
                  disabled={pending}
                />
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
            )}
            {allowCode ? (
              <Button
                type="button"
                variant="link"
                className="self-start"
                onClick={() => setModo(modo === "password" ? "code" : "password")}
              >
                {modo === "password" ? t("account.step_up.use_code") : t("account.step_up.use_password")}
              </Button>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" onClick={() => limpar(false)} disabled={pending}>
              {t("account.cancel")}
            </Button>
            <Button
              type="submit"
              variant="solid"
              size="lg"
              loading={pending}
              className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              {confirmLabel ?? t("account.step_up.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
