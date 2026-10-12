"use client"

/**
 * O campo de um nome único do Platform: o @usuário (UsernameField) e, no WorkspaceForm, o slug do
 * workspace. Os dois são o mesmo campo com outra régua (F1 e F2 de handles.ts) e outro afixo.
 *
 * O valor sai normalizado a cada tecla (`trim` + minúsculas), e é isso que a pessoa vê. O formato
 * é validado aqui, na hora, e tem precedência: com o formato errado o campo mostra `invalid` com o
 * motivo (curto, longo, o caractere que não pode, ou a forma) e ignora o `status` do app, que nem
 * deve consultar a API. Com o formato certo, o estado é o do app (verificando, livre, ocupado,
 * reservado, não conferido), mas só para o valor que a API respondeu (`statusFor`): com outro
 * valor o campo está verificando (handleStatus, em handles.ts).
 *
 * Cada estado tem um ícone no fim do campo e uma frase embaixo. A frase está ligada ao campo pelo
 * aria-describedby do Field; a de erro é um alerta e põe o campo em aria-invalid, e as outras
 * mudam numa região viva, para o leitor de tela ouvir "verificando" e "livre".
 */
import type { ReactNode } from "react"
import {
  CheckCircleIcon,
  InfoIcon,
  LockSimpleIcon,
  SpinnerGapIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  SLUG_LIMITS,
  USERNAME_LIMITS,
  badCharacter,
  handleIssue,
  handleStatus,
  normalizeHandle,
  type HandleKind,
  type HandleStatus,
} from "./handles"

const LIMITES = { username: USERNAME_LIMITS, slug: SLUG_LIMITS } as const

// a frase embaixo do campo, maior que a do Field (11.5px): aqui ela explica a regra e precisa ser lida
export const DICA = "text-[13px] leading-[18px]"

const ERROS: HandleStatus[] = ["taken", "reserved", "invalid"]

const ICONES: Partial<Record<HandleStatus, ReactNode>> = {
  checking: <SpinnerGapIcon aria-hidden className="animate-spin" />,
  available: <CheckCircleIcon aria-hidden weight="fill" className="text-success" />,
  taken: <XCircleIcon aria-hidden weight="fill" className="text-destructive" />,
  reserved: <LockSimpleIcon aria-hidden weight="bold" className="text-destructive" />,
  invalid: <WarningCircleIcon aria-hidden weight="fill" className="text-destructive" />,
  // não conferido não é erro: ícone neutro
  unchecked: <InfoIcon aria-hidden className="text-muted-foreground" />,
}

export interface HandleFieldProps {
  kind: HandleKind
  value: string
  onChange: (normalized: string) => void
  status: HandleStatus
  /** O valor normalizado que a API respondeu: `status` só vale quando é igual a `value`. */
  statusFor?: string
  label: ReactNode
  /** O afixo antes do valor: "@" ou o endereço do workspace. */
  prefix: ReactNode
  /** A dica no estado `idle`. Sem isto, a régua do formato. */
  description?: ReactNode
  disabled?: boolean
  className?: string
}

/** O campo comum ao @usuário e ao slug. Interno ao bloco: o app usa UsernameField e WorkspaceForm. */
export function HandleField({
  kind,
  value,
  onChange,
  status,
  statusFor,
  label,
  prefix,
  description,
  disabled,
  className,
}: HandleFieldProps) {
  const t = useTranslate()
  const limites = LIMITES[kind]
  const estado = handleStatus(kind, value, status, statusFor)
  const erro = ERROS.includes(estado)

  let frase: ReactNode
  if (estado === "invalid") {
    // sem motivo local, o inválido veio da API: o formato é a única leitura possível
    const m = handleIssue(kind, value) ?? "format"
    if (m === "format") frase = t(`platform.identity.${kind}.format`)
    else if (m === "character") frase = t(`platform.identity.${kind}.character`, { char: badCharacter(kind, value) })
    else frase = t(`platform.identity.handle.${m}`, limites)
  } else if (estado === "unchecked") {
    frase = t("platform.identity.handle.unchecked")
  } else if (estado === "idle") {
    frase = description ?? t(`platform.identity.${kind}.hint`, limites)
  } else {
    frase = t(`platform.identity.${kind}.${estado}`, { value })
  }

  return (
    <Field invalid={erro} disabled={disabled} className={className} data-slot="handle-field" data-status={estado}>
      <FieldLabel>{label}</FieldLabel>
      <InputGroup
        size="touch"
        start={prefix}
        end={ICONES[estado]}
        value={value}
        onChange={(e) => onChange(normalizeHandle(e.target.value))}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="font-mono"
      />
      {erro ? (
        <FieldError className={DICA}>{frase}</FieldError>
      ) : (
        <FieldDescription aria-live="polite" className={cn(DICA, estado === "available" && "text-success")}>
          {frase}
        </FieldDescription>
      )}
    </Field>
  )
}

export interface UsernameFieldProps {
  /** Já normalizado: o app guarda o que `onChange` devolve. */
  value: string
  onChange: (normalized: string) => void
  /** A disponibilidade, do app. O formato inválido o campo mostra sozinho. */
  status: HandleStatus
  /** O `username` da resposta de disponibilidade: `status` só vale para ele. */
  statusFor?: string
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}

/** O @usuário da conta Muriki no Platform: "@" na frente, minúsculas e o estado da disponibilidade. */
export function UsernameField({ label, ...props }: UsernameFieldProps) {
  const t = useTranslate()
  return <HandleField kind="username" prefix="@" label={label ?? t("platform.identity.username.label")} {...props} />
}
