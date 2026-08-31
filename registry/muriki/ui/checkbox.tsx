/**
 * Muriki Checkbox.
 *
 * VAZIO é um encaixe — um espaço à espera, com a mesma direção de luz do
 * resto. MARCADO é preenchimento sólido da marca, sem relevo nenhum: numa
 * caixa de 16px, sombra vira sujeira, não profundidade. É o mesmo limite
 * que separa relevo de textura no botão.
 *
 * Base UI, não Radix — o resto do sistema é Base UI, e misturar as duas
 * bibliotecas de primitivos custa em bundle e em comportamento de foco.
 */
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] outline-none transition-colors",
        "after:absolute after:-inset-2.5",
        "relative",
        // vazio: encaixe
        "data-unchecked:bg-sunken data-unchecked:shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_var(--input)]",
        "dark:data-unchecked:shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_0_0_1px_oklch(0.325_0.006_107)]",
        // marcado e indeterminado: preenchimento chapado, sem relevo
        "data-checked:bg-primary data-checked:text-primary-foreground",
        "data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        "focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
        render={(p, state) => (
          <span {...p}>
            {state.indeterminate ? (
              <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" aria-hidden>
                <path d="M6 12h12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 13 4.5 4.5L19 7" />
              </svg>
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
