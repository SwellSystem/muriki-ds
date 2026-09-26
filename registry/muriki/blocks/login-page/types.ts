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
  /** `backup` quando a pessoa usou um código de backup em vez do app. */
  kind: "totp" | "backup"
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
  /** Barra de força embaixo da senha (reserva a altura desde o início). `false` tira a barra e o espaço dela. Padrão: true. */
  showPasswordStrength?: boolean
  /**
   * "Usar um código de backup" no passo do código: o campo troca para o
   * formato do backup (letras e números, vale uma vez) e `onVerifyCode`
   * recebe `kind: "backup"`. Padrão: false.
   */
  allowBackupCode?: boolean
  /** Caixa "Lembrar de mim". `false` esconde e envia `rememberMe: false`. Padrão: true. */
  showRememberMe?: boolean
  /** Caixa "Confiar neste dispositivo" no segundo fator. `false` esconde e envia `trustDevice: false`. Padrão: true. */
  showTrustDevice?: boolean
  /**
   * O navegador está com o pedido da passkey aberto (WebAuthn). A coluna
   * troca para a espera: a digital, "aguardando" e as saídas. Controlado
   * pelo app, que liga no `onProvider("passkey")` e desliga quando o
   * pedido volta. O que foi digitado no email fica guardado. Padrão: false.
   */
  passkeyPending?: boolean
  /** "Pedir de novo": a janela do navegador sumiu ou a pessoa cancelou. Sem ele, o botão some. */
  onRetryPasskey?: () => void
  /** "Usar email e senha": volta ao formulário. Sem ele, o link some. */
  onCancelPasskey?: () => void
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
