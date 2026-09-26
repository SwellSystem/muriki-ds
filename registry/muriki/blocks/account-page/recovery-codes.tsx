"use client"

// Os dez códigos de backup, que aparecem uma vez: a lista numerada em mono,
// Copiar e Baixar PDF (o PDF é do app, com o pdf-recovery-codes da casa), e
// o "guardei" que libera o Concluir. Serve ao fim do "ativar 2FA" e ao
// "gerar códigos novos".
import { useState } from "react"
import { CopyIcon, FilePdfIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslate } from "@/lib/i18n"

export interface RecoveryCodesProps {
  codes: readonly string[]
  /** Sem isto, o botão Copiar usa a área de transferência direto. */
  onCopy?: (text: string) => void
  onDownloadPdf?: () => void
  downloadingPdf?: boolean
  /** Chamado a cada mudança do "guardei"; o diálogo usa para liberar o Concluir. */
  onSavedChange?: (saved: boolean) => void
}

export function RecoveryCodes({ codes, onCopy, onDownloadPdf, downloadingPdf = false, onSavedChange }: RecoveryCodesProps) {
  const t = useTranslate()
  const [guardei, setGuardei] = useState(false)
  const texto = codes.join("\n")

  return (
    <div className="flex flex-col gap-3.5">
      <ol
        aria-label={t("account.recovery.list")}
        className="grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-[10px] bg-secondary px-4.5 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
      >
        {codes.map((code, i) => (
          <li key={code} className="flex items-center gap-2.5 font-mono text-sm tracking-[0.04em] text-foreground-strong">
            <span className="w-4 text-right text-[10.5px] text-muted-foreground">{i + 1}</span>
            {code}
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        {onDownloadPdf ? (
          <Button loading={downloadingPdf} onClick={onDownloadPdf}>
            <FilePdfIcon />
            {t("account.recovery.download_pdf")}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => (onCopy ? onCopy(texto) : void navigator.clipboard?.writeText(texto))}>
          <CopyIcon />
          {t("account.recovery.copy")}
        </Button>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-foreground">
        <Checkbox
          checked={guardei}
          onCheckedChange={(v) => {
            setGuardei(v === true)
            onSavedChange?.(v === true)
          }}
        />
        {t("account.recovery.saved")}
      </label>
    </div>
  )
}
