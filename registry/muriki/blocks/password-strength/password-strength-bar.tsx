"use client"

/**
 * Barra de força de senha.
 *
 * Quatro segmentos num trilho afundado (--sunken), preenchidos com a cor
 * da severidade: destructive, warning, success. Sem relevo no segmento —
 * numa faixa de 4px, sombra vira sujeira, a mesma regra do checkbox.
 *
 * ALTURA CONSTANTE, e isso é regra, não detalhe. Este bloco vive embaixo
 * do campo de senha numa tela que precisa caber sem rolar: se ele crescer
 * ao receber o primeiro caractere, empurra o botão de entrar para fora da
 * dobra bem na hora em que a pessoa vai clicar nele. Por isso o espaço é
 * reservado desde o início e o conteúdo apenas aparece — os requisitos são
 * uma fileira só, não uma lista empilhada.
 *
 * A palavra da força ("Forte", "Média") não vira linha de texto: ela já
 * está na cor e no preenchimento da barra, e é anunciada por
 * `aria-valuetext` para quem não vê nenhum dos dois.
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
  /** Mostra a fileira de requisitos abaixo da barra. */
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
  const vazio = strength === "empty"

  return (
    <div
      // vazio ocupa o mesmo espaço e não pinta nada: sem salto de layout
      // no primeiro caractere, e sem trilho vazio prometendo um erro que
      // ninguém cometeu.
      className={cn("flex flex-col gap-1.5", vazio && "invisible", className)}
      aria-hidden={vazio || undefined}
    >
      <div
        role="meter"
        aria-label={t("password_strength.meter")}
        aria-valuemin={0}
        aria-valuemax={TOTAL_SEGMENTS}
        aria-valuenow={filled}
        aria-valuetext={vazio ? undefined : t(`password_strength.${strength}`)}
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
      {requirements ? (
        <ul
          className="flex flex-wrap gap-x-2.5 gap-y-1"
          aria-label={t("password_strength.requirements")}
        >
          {checkPasswordRequirements(password).map((req) => (
            <li
              key={req.id}
              className={cn(
                "flex items-center gap-1 font-mono text-[10px] leading-[14px] tracking-wide",
                req.met ? "text-success" : "text-muted-foreground"
              )}
            >
              {req.met ? (
                <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 13 4.5 4.5L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-3 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
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
