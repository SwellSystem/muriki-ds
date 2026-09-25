"use client"

/**
 * Muriki OTP Input — o código de verificação, um quadrado por dígito.
 *
 * Os quadrados são desenho; quem recebe o teclado é UM <input> de verdade,
 * transparente, por cima deles. Assim colar o código inteiro, o
 * autocomplete `one-time-code` do sistema e o gerenciador de senhas
 * funcionam sem truque, e o leitor de tela lê um campo só, não seis.
 *
 * Cada quadrado é o campo do sistema em miniatura: superfície `--field`,
 * filete por dentro. Vazio o filete é leve, preenchido é cheio, e o da vez
 * ganha a tinta da marca com o anel de foco — é ali que o próximo dígito
 * cai. Inválido, todos os filetes viram destrutivo.
 *
 * Dentro de um <Field> do DS, label e descrição chegam sozinhos: o input é
 * o Input do Base UI.
 */
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

export interface OtpInputProps
  extends Omit<React.ComponentProps<typeof InputPrimitive>, "value" | "defaultValue" | "onChange" | "size" | "type"> {
  /** Quantos quadrados. 6 é o TOTP padrão; 4 para PIN e código por SMS curto. */
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Chamado uma vez quando o último quadrado é preenchido. */
  onComplete?: (value: string) => void
  /** `numeric` só aceita dígitos e abre o teclado numérico no celular. */
  mode?: "numeric" | "alphanumeric"
  invalid?: boolean
  size?: "default" | "lg"
  /**
   * Um traço a cada N quadrados: `3` desenha 3 + traço + 3. O código de 6
   * dígitos lido em dois pedaços é o que a pessoa copia do email sem errar.
   * Só desenho — o campo continua um só.
   */
  groupSize?: number
  /**
   * Os quadrados dividem a largura do pai em vez de ter largura fixa. É o
   * código de uma coluna estreita e centrada (onboarding-step `narrow`): o
   * código ocupa a mesma largura do botão embaixo dele.
   */
  fullWidth?: boolean
}

const LIMPA = {
  numeric: (v: string) => v.replace(/\D/g, ""),
  alphanumeric: (v: string) => v.replace(/[^0-9a-z]/gi, "").toUpperCase(),
}

function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  mode = "numeric",
  invalid = false,
  size = "default",
  groupSize,
  fullWidth = false,
  disabled,
  className,
  onFocus,
  onBlur,
  ...props
}: OtpInputProps) {
  const [interno, setInterno] = React.useState(defaultValue)
  const [foco, setFoco] = React.useState(false)
  const atual = (value ?? interno).slice(0, length)
  const vez = Math.min(atual.length, length - 1)

  function mudar(bruto: string) {
    const limpo = LIMPA[mode](bruto).slice(0, length)
    if (value === undefined) setInterno(limpo)
    onValueChange?.(limpo)
    if (limpo.length === length && atual.length < length) onComplete?.(limpo)
  }

  return (
    <div
      data-slot="otp-input"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn("relative flex gap-2", fullWidth ? "w-full" : "w-fit", disabled && "opacity-60", className)}
    >
      {Array.from({ length }, (_, i) => {
        const ativo = foco && i === vez && atual.length < length
        const traco = groupSize && i > 0 && i % groupSize === 0
        return (
          <React.Fragment key={i}>
          {traco ? <span aria-hidden className="h-0.5 w-3 shrink-0 self-center rounded-full bg-input" /> : null}
          <div
            aria-hidden
            data-active={ativo || undefined}
            data-filled={atual[i] ? true : undefined}
            className={cn(
              "flex items-center justify-center bg-field font-mono font-medium text-foreground-strong",
              "transition-[box-shadow] duration-100",
              size === "lg" ? "h-14 w-12 rounded-[12px] text-2xl" : "h-12 w-10 rounded-[10px] text-xl",
              fullWidth && "w-auto min-w-0 flex-1",
              "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--input)_45%,var(--field))]",
              "data-[filled]:shadow-[inset_0_0_0_1px_var(--input)]",
              "data-[active]:shadow-[inset_0_0_0_1px_var(--primary)] data-[active]:ring-[3px] data-[active]:ring-ring/20",
              invalid && "shadow-[inset_0_0_0_1px_var(--destructive)] data-[filled]:shadow-[inset_0_0_0_1px_var(--destructive)]"
            )}
          >
            {atual[i] ?? (ativo ? <span className="h-5 w-px animate-pulse bg-foreground" /> : null)}
          </div>
          </React.Fragment>
        )
      })}
      <InputPrimitive
        data-slot="otp-input-control"
        type="text"
        inputMode={mode === "numeric" ? "numeric" : "text"}
        autoComplete="one-time-code"
        pattern={mode === "numeric" ? "[0-9]*" : undefined}
        maxLength={length}
        spellCheck={false}
        value={atual}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => mudar(e.target.value)}
        onFocus={(e) => {
          setFoco(true)
          // o cursor sempre no fim: o próximo dígito cai no quadrado da vez
          const n = e.currentTarget.value.length
          e.currentTarget.setSelectionRange(n, n)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFoco(false)
          onBlur?.(e)
        }}
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  )
}

export { OtpInput }
