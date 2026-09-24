/**
 * Muriki PDF Theme — a marca no papel.
 *
 * O tema do pdfcn com as cores do DS acertadas para impressão: papel
 * branco puro (o creme da tela vira tinta cara e cinza no laser), a tinta
 * azulada do logo como texto forte, o azul como destaque e o amarelo só em
 * detalhe. Geist no corpo e nos títulos, e Geist Mono nos códigos e rótulos,
 * como na tela.
 *
 * É a fonte única: backoffice, platform e Code desenham PDF com este tema,
 * e ninguém mantém cópia local em lib/pdf-themes.
 */
import type { PdfcnTheme } from "@/types/pdf-themes"

import { defaultPrimitives } from "@/lib/pdf-themes/primitives"

export const MURIKI_BLUE = "#0E53CF"
export const MURIKI_YELLOW = "#FCCD08"
export const MURIKI_INK = "#051124"
/** A família mono dos rótulos e códigos. Registre a fonte com este nome no render. */
export const MURIKI_MONO = '"Geist Mono"'

export const murikiTheme: PdfcnTheme = {
  colors: {
    accent: MURIKI_YELLOW,
    background: "#ffffff",
    border: "#e3e1da",
    destructive: "#b42318",
    foreground: "#1f2a37",
    info: MURIKI_BLUE,
    muted: "#f5f3ee",
    mutedForeground: "#5b6573",
    primary: MURIKI_BLUE,
    primaryForeground: "#ffffff",
    success: "#1f7a4d",
    warning: "#9a5b00",
  },
  name: "muriki",
  page: {
    orientation: "portrait",
    size: "A4",
  },
  primitives: defaultPrimitives,
  spacing: {
    componentGap: 14,
    page: {
      marginBottom: 48,
      marginLeft: 48,
      marginRight: 48,
      marginTop: 48,
    },
    paragraphGap: 8,
    sectionGap: 24,
  },
  typography: {
    body: {
      fontFamily: "Geist",
      fontSize: 10.5,
      lineHeight: 1.55,
    },
    heading: {
      fontFamily: "Geist",
      fontSize: {
        h1: 26,
        h2: 18,
        h3: 15,
        h4: 13,
        h5: 12,
        h6: 11,
      },
      fontWeight: 600,
      lineHeight: 1.15,
    },
  },
}
