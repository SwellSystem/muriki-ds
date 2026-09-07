import type { LoginProviderIconProps } from "./types"

/**
 * Logo institucional da Microsoft (quatro quadrados, monocromática).
 * Inline para herdar `currentColor` e responder às classes `text-*`,
 * como os ícones do Phosphor ao lado dela.
 */
export function MicrosoftLogo({ size = 16, className }: LoginProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
    >
      <path d="M7.462 0H0v7.19h7.462zM16 0H8.538v7.19H16zM7.462 8.211H0V16h7.462zm8.538 0H8.538V16H16z" />
    </svg>
  )
}
