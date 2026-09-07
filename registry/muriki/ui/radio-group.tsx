"use client"

/**
 * Muriki RadioGroup.
 *
 * O radio é o checkbox redondo, e não por acaso: a linguagem é a MESMA.
 * Vazio é encaixe, marcado é preenchimento chapado da marca, sem relevo —
 * numa peça de 16px, sombra vira sujeira. O que muda é só o raio e o que
 * mora dentro: um ponto em vez de um tique.
 *
 * A diferença que importa não é visual, é de contrato: checkbox é
 * independente, radio é excludente. Por isso o item aqui não existe solto,
 * só dentro de um `RadioGroup` — que é quem carrega o `name` e o valor.
 */
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex flex-col gap-2.5", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "peer relative size-4 shrink-0 rounded-full outline-none transition-colors",
        // alvo de toque maior que o desenho, como no checkbox
        "after:absolute after:-inset-2.5",
        // vazio: encaixe
        "data-unchecked:bg-sunken data-unchecked:shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_var(--input)]",
        "dark:data-unchecked:shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_0_0_1px_oklch(0.325_0.006_107)]",
        // marcado: chapado, sem relevo
        "data-checked:bg-primary data-checked:text-primary-foreground",
        "focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
        render={(p) => (
          <span {...p}>
            <span className="size-1.5 rounded-full bg-current" />
          </span>
        )}
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
