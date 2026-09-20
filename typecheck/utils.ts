// Sombra do `@/lib/utils` do shadcn — existe só para o `tsc` do registry ter
// o que resolver. No projeto de quem instala, este arquivo vem do item
// `utils` do shadcn, e é ele que vale.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
