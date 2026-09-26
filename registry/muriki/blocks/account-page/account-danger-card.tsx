"use client"

// Excluir a conta Muriki: o cartão de contorno vermelho e, ao clicar, o
// StepUpDialog destrutivo — a exclusão pede a senha (ou o código) na mesma
// caixa que explica o estrago. O app recebe a credencial, faz o step-up e
// chama POST /auth/account/delete.
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"
import { StepUpDialog, type StepUpCredential } from "./step-up-dialog"

export interface AccountDangerCardProps {
  onDelete: (credential: StepUpCredential) => void
  deleting?: boolean
  error?: string
  /** Sem app autenticador, a confirmação é só por senha. */
  allowCode?: boolean
  className?: string
}

export function AccountDangerCard({
  onDelete,
  deleting = false,
  error,
  allowCode = true,
  className,
}: AccountDangerCardProps) {
  const t = useTranslate()
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <AccountCard
        tone="danger"
        title={t("account.delete.title")}
        description={t("account.delete.description")}
        className={className}
        action={
          <Button
            variant="solid"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => setAberto(true)}
          >
            {t("account.delete.button")}
          </Button>
        }
      />
      <StepUpDialog
        open={aberto}
        onOpenChange={setAberto}
        onConfirm={onDelete}
        pending={deleting}
        error={error}
        destructive
        allowCode={allowCode}
        title={t("account.delete.confirm_title")}
        description={t("account.delete.confirm_description")}
        confirmLabel={t("account.delete.confirm")}
      />
    </>
  )
}
