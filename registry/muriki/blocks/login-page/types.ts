import type { ComponentType, ReactNode } from "react"
import type { IconWeight } from "@phosphor-icons/react"

/** Subconjunto das props dos ícones do Phosphor — qualquer ícone deles serve. */
export interface LoginProviderIconProps {
  size?: number
  weight?: IconWeight
  className?: string
}

export interface LoginProvider {
  id: string
  label: string
  icon: ComponentType<LoginProviderIconProps>
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginCodeInput {
  code: string
  trustDevice: boolean
}

/**
 * O que o app devolve ao bloco. `credentials` cai embaixo da senha,
 * `code` embaixo do código do segundo fator, `other` embaixo do botão.
 * `twoFactor: true` no sucesso abre o painel de código em vez de fechar.
 */
export type LoginResult =
  | { ok: true; twoFactor?: boolean }
  | { ok: false; reason: "credentials" | "code" | "other"; message?: string }

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<LoginResult> | LoginResult
  onVerifyCode?: (input: LoginCodeInput) => Promise<LoginResult> | LoginResult
  /** Provedor largo, acima dos outros. `null` esconde. Padrão: Google. */
  primaryProvider?: LoginProvider | null
  /** Fileira compacta. Padrão: Microsoft, GitHub, Passkey, SSO. */
  providers?: LoginProvider[]
  onProvider?: (id: string) => void
  onForgotPassword?: () => void
  onCreateAccount?: () => void
  /** Pendência de fora do formulário — o bootstrap do workspace, por exemplo. */
  busy?: boolean
  busyLabel?: string
  passwordMinLength?: number
  onPasswordVisibilityChange?: (visible: boolean) => void
  className?: string
}

export interface LoginPageProps
  extends Omit<LoginFormProps, "className" | "onPasswordVisibilityChange"> {
  /** Marca no canto — normalmente o mascote. O registry não carrega binário: vem do app. */
  brand?: ReactNode
  /** Entra no lugar de `brand` enquanto a senha está visível (o mascote fecha os olhos). */
  brandHidden?: ReactNode
  /** O mascote grande espiando pelo canto do painel. Padrão: `brand`. */
  mascot?: ReactNode
  /** Padrão: `brandHidden`. */
  mascotHidden?: ReactNode
  /** Canto superior direito — troca de tema, idioma. */
  utilities?: ReactNode
  year?: number
  className?: string
}
