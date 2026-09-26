"use client"

// As passkeys: a lista (nome, sincronizada ou só neste aparelho, criada
// em), renomear na própria linha (PATCH /auth/passkeys/{id}, 1 a 120
// caracteres) e remover — o app abre o StepUpDialog destrutivo com o texto
// de remover. Adicionar é um diálogo de quatro estados: o nome e onde
// guardar → siga o navegador (WebAuthn aberto) → criada, ou nada foi
// criado (NotAllowedError) com "Tentar de novo".
import { useState, type FormEvent } from "react"
import { CheckIcon, FingerprintIcon, PencilSimpleIcon, TrashIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ChoiceCard, ChoiceCardGroup } from "@/components/ui/choice-card"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { AccountCard } from "./account-card"

export interface AccountPasskey {
  id: string
  name: string | null
  /** deviceType "multiDevice": sincroniza pelo iCloud ou pelo Google. */
  synced: boolean
  /** Já formatado, ex.: "21 de setembro". */
  createdAt: string
}

export interface AccountPasskeysCardProps {
  passkeys: AccountPasskey[]
  onAdd: () => void
  onRename: (id: string, name: string) => void
  /** O id sendo salvo; a linha fica em espera. */
  renamingId?: string | null
  onRemove: (passkey: AccountPasskey) => void
  className?: string
}

export function AccountPasskeysCard({
  passkeys,
  onAdd,
  onRename,
  renamingId = null,
  onRemove,
  className,
}: AccountPasskeysCardProps) {
  const t = useTranslate()
  const [editando, setEditando] = useState<string | null>(null)

  return (
    <AccountCard
      title={t("account.passkeys.title")}
      description={t("account.passkeys.description")}
      className={className}
      action={<Button onClick={onAdd}>{t("account.passkeys.add")}</Button>}
    >
      {passkeys.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{t("account.passkeys.empty")}</p>
      ) : (
        <ul className="flex flex-col">
          {passkeys.map((pk) => {
            const nome = pk.name ?? t("account.passkeys.unnamed")
            return (
              <li key={pk.id} className="flex min-h-12 items-center gap-3 py-1.5 shadow-[inset_0_-1px_0_var(--muted)]">
                <FingerprintIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                {editando === pk.id ? (
                  <Renomear
                    inicial={pk.name ?? ""}
                    salvando={renamingId === pk.id}
                    onCancel={() => setEditando(null)}
                    onSave={(novo) => {
                      onRename(pk.id, novo)
                      setEditando(null)
                    }}
                  />
                ) : (
                  <>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13.5px] text-foreground-strong">{nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {pk.synced ? t("account.passkeys.synced") : t("account.passkeys.this_device")}
                      </span>
                    </span>
                    <span className="hidden text-[12.5px] text-muted-foreground sm:block">
                      {t("account.passkeys.created_at", { date: pk.createdAt })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${t("account.passkeys.rename")} ${nome}`}
                      title={t("account.passkeys.rename")}
                      onClick={() => setEditando(pk.id)}
                      loading={renamingId === pk.id}
                    >
                      <PencilSimpleIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${t("account.passkeys.remove")} ${nome}`}
                      title={t("account.passkeys.remove")}
                      onClick={() => onRemove(pk)}
                    >
                      <TrashIcon />
                    </Button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </AccountCard>
  )
}

function Renomear({
  inicial,
  salvando,
  onSave,
  onCancel,
}: {
  inicial: string
  salvando: boolean
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const t = useTranslate()
  const [nome, setNome] = useState(inicial)
  const valido = nome.trim().length >= 1 && nome.trim().length <= 120

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (valido) onSave(nome.trim())
  }

  return (
    <form onSubmit={enviar} className="flex min-w-0 flex-1 items-center gap-2">
      <Input
        aria-label={t("account.passkeys.name")}
        autoFocus
        maxLength={120}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        className="h-8 flex-1"
      />
      <Button type="button" variant="ghost" size="icon" aria-label={t("account.cancel")} onClick={onCancel}>
        <XIcon />
      </Button>
      <Button type="submit" variant="primary" size="icon" aria-label={t("account.passkeys.save_name")} loading={salvando} disabled={!valido}>
        <CheckIcon />
      </Button>
    </form>
  )
}

export type AddPasskeyState = "form" | "browser" | "done" | "cancelled"
export type PasskeyAttachment = "platform" | "cross-platform"

export interface AddPasskeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: AddPasskeyState
  /** Sugestão de nome, ex.: o aparelho que o navegador informa. */
  defaultName?: string
  /** O app chama generate-register-options (name, authenticatorAttachment) e o startRegistration. */
  onCreate: (values: { name: string; attachment: PasskeyAttachment }) => void
  onRetry: () => void
}

export function AddPasskeyDialog({ open, onOpenChange, state, defaultName = "", onCreate, onRetry }: AddPasskeyDialogProps) {
  const t = useTranslate()
  const [nome, setNome] = useState(defaultName)
  const [onde, setOnde] = useState<PasskeyAttachment>("platform")
  const [criada, setCriada] = useState("")

  function enviar(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) return
    setCriada(nome.trim())
    onCreate({ name: nome.trim(), attachment: onde })
  }

  function fechar(next: boolean) {
    if (!next) setNome(defaultName)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="sm:max-w-[520px]">
        {state === "form" ? (
          <form onSubmit={enviar} className="flex flex-col gap-4">
            <Cabeca icone={<FingerprintIcon />} titulo={t("account.passkeys.add")} texto={t("account.passkeys.add_hint")} />
            <DialogBody className="flex flex-col gap-4">
              <Field>
                <FieldLabel>{t("account.passkeys.name")}</FieldLabel>
                <Input autoFocus maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
                <FieldDescription>{t("account.passkeys.name_hint")}</FieldDescription>
              </Field>
              <ChoiceCardGroup
                value={onde}
                onValueChange={(v) => setOnde(v as PasskeyAttachment)}
                aria-label={t("account.passkeys.where")}
              >
                <ChoiceCard value="platform" title={t("account.passkeys.platform")} description={t("account.passkeys.platform_hint")} />
                <ChoiceCard value="cross-platform" title={t("account.passkeys.key")} description={t("account.passkeys.key_hint")} />
              </ChoiceCardGroup>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="lg" onClick={() => fechar(false)}>
                {t("account.cancel")}
              </Button>
              <Button type="submit" variant="solid" size="lg" disabled={!nome.trim()}>
                {t("account.passkeys.create")}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {state === "browser" ? (
          <>
            <Cabeca icone={<FingerprintIcon />} titulo={t("account.passkeys.browser_title")} texto={t("account.passkeys.browser_hint")} status />
            <DialogFooter>
              <Button variant="outline" size="lg" onClick={() => fechar(false)}>
                {t("account.cancel")}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {state === "done" ? (
          <>
            <Cabeca
              icone={<CheckIcon />}
              tom="success"
              titulo={t("account.passkeys.done_title")}
              texto={t("account.passkeys.done_hint", { name: criada || defaultName })}
              status
            />
            <DialogFooter>
              <Button variant="solid" size="lg" onClick={() => fechar(false)}>
                {t("account.passkeys.done")}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {state === "cancelled" ? (
          <>
            <Cabeca icone={<XIcon />} tom="attention" titulo={t("account.passkeys.cancelled_title")} texto={t("account.passkeys.cancelled_hint")} status />
            <DialogFooter>
              <Button variant="outline" size="lg" onClick={() => fechar(false)}>
                {t("account.cancel")}
              </Button>
              <Button variant="solid" size="lg" onClick={onRetry}>
                {t("account.passkeys.retry")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function Cabeca({
  icone,
  titulo,
  texto,
  tom = "primary",
  status = false,
}: {
  icone: React.ReactNode
  titulo: string
  texto: string
  tom?: "primary" | "success" | "attention"
  status?: boolean
}) {
  return (
    <DialogHeader className="flex-row items-start gap-3.5">
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[18px]",
          tom === "primary" && "bg-primary-subtle text-primary-subtle-foreground",
          tom === "success" && "bg-tone-green text-tone-green-foreground",
          tom === "attention" && "bg-tone-orange text-tone-orange-foreground"
        )}
      >
        {icone}
      </span>
      <div role={status ? "status" : undefined} className="flex flex-col gap-1.5">
        <DialogTitle>{titulo}</DialogTitle>
        <DialogDescription>{texto}</DialogDescription>
      </div>
    </DialogHeader>
  )
}
