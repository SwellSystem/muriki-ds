"use client"

/**
 * Barra de força de senha.
 *
 * Quatro segmentos num trilho afundado (--sunken), preenchidos com a cor
 * da severidade: destructive, warning, success. Sem relevo no segmento —
 * numa faixa de 4px, sombra vira sujeira, a mesma regra do checkbox.
 *
 * `requirements` liga a lista de requisitos, que só aparece quando há
 * senha digitada: antes disso é ruído, depois é o mapa do que falta.
 */
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import {
  checkPasswordRequirements,
  getPasswordStrength,
  getStrengthSegments,
  type PasswordStrength,
} from "./password-strength"

const TOTAL_SEGMENTS = 4

const FILL: Record<PasswordStrength, string> = {
  empty: "",
  weak: "bg-destructive",
  medium: "bg-warning",
  strong: "bg-success",
  "very-strong": "bg-success",
}

export interface PasswordStrengthBarProps {
  password: string
  /** Mostra a lista de requisitos enquanto houver senha digitada. */
  requirements?: boolean
  className?: string
}

export function PasswordStrengthBar({
  password,
  requirements = false,
  className,
}: PasswordStrengthBarProps) {
  const t = useTranslate()
  const strength = getPasswordStrength(password)
  const filled = getStrengthSegments(strength)
  const label = strength === "empty" ? "" : t(`password_strength.${strength}`)

  // Campo vazio não tem força para medir: um trilho vazio abaixo do campo é
  // ruído, e ainda promete um erro que ninguém cometeu. A barra nasce no
  // primeiro caractere.
  if (strength === "empty") return null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="meter"
        aria-label={t("password_strength.meter")}
        aria-valuemin={0}
        aria-valuemax={TOTAL_SEGMENTS}
        aria-valuenow={filled}
        aria-valuetext={label || undefined}
        className="flex gap-1.5"
      >
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < filled ? FILL[strength] : "bg-sunken"
            )}
          />
        ))}
      </div>
      {label ? (
        <p className="text-[11.5px] leading-[15px] text-muted-foreground">{label}</p>
      ) : null}
      {requirements && password ? (
        <ul
          className="flex flex-col gap-0.5 pt-0.5"
          aria-label={t("password_strength.requirements")}
        >
          {checkPasswordRequirements(password).map((req) => (
            <li
              key={req.id}
              className={cn(
                "flex items-center gap-1.5 font-mono text-[10px] tracking-wider",
                req.met ? "text-success" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 13 4.5 4.5L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              )}
              <span>{t(`password_strength.requirement.${req.id}`)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
