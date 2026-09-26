"use client"

// As sessões da conta: onde ela está conectada, a atual marcada, e
// encerrar uma (DELETE /auth/sessions/{id}) ou todas as outras (POST
// /auth/sessions/revoke-others). Sem step-up. A confirmação é o
// alert-dialog da casa; o texto diz o que sai e o que fica.
import { useState } from "react"
import { LaptopIcon, SignOutIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslate } from "@/lib/i18n"

import { AccountCard } from "./account-card"

export interface AccountSession {
  id: string
  /** Navegador e sistema, ex.: "Safari · iOS" (o app lê do userAgent). */
  device: string
  ip?: string | null
  /** Já formatado, ex.: "ontem, 08:12". */
  lastSeen: string
  current?: boolean
}

export interface AccountSessionsCardProps {
  sessions: AccountSession[]
  onRevoke: (session: AccountSession) => void
  onRevokeOthers: () => void
  className?: string
}

export function AccountSessionsCard({ sessions, onRevoke, onRevokeOthers, className }: AccountSessionsCardProps) {
  const t = useTranslate()
  const [alvo, setAlvo] = useState<AccountSession | "outras" | null>(null)
  const outras = sessions.filter((s) => !s.current)

  return (
    <>
      <AccountCard
        title={t("account.sessions.title")}
        description={t("account.sessions.description")}
        className={className}
        action={
          outras.length > 0 ? (
            <Button onClick={() => setAlvo("outras")}>
              <SignOutIcon />
              {t("account.sessions.revoke_others")}
            </Button>
          ) : null
        }
      >
        <ul className="flex flex-col">
          {sessions.map((s) => (
            <li key={s.id} className="flex min-h-11 items-center gap-3 py-1 shadow-[inset_0_-1px_0_var(--muted)]">
              <LaptopIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground-strong">{s.device}</span>
              {s.ip ? <span className="hidden font-mono text-xs text-muted-foreground md:block">{s.ip}</span> : null}
              <span className="hidden w-44 text-[12.5px] text-muted-foreground sm:block">
                {t("account.sessions.last_seen", { when: s.lastSeen })}
              </span>
              <span className="flex w-28 justify-end">
                {s.current ? (
                  <Badge tone="green" dot>
                    {t("account.sessions.current")}
                  </Badge>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setAlvo(s)}>
                    {t("account.sessions.revoke")}
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </AccountCard>

      <AlertDialog open={alvo !== null} onOpenChange={(open) => !open && setAlvo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alvo === "outras"
                ? t("account.sessions.revoke_others_title", { count: outras.length })
                : alvo
                  ? t("account.sessions.revoke_title", { device: alvo.device })
                  : null}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alvo === "outras"
                ? t("account.sessions.revoke_others_hint", { devices: outras.map((s) => s.device).join(", ") })
                : t("account.sessions.revoke_hint")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("account.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (alvo === "outras") onRevokeOthers()
                else if (alvo) onRevoke(alvo)
              }}
            >
              {alvo === "outras"
                ? t("account.sessions.revoke_others_confirm", { count: outras.length })
                : t("account.sessions.revoke_confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
