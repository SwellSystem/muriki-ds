/**
 * Muriki Progress.
 *
 * O trilho é um encaixe — a mesma receita do switch e do ViewToggle — e o
 * preenchimento é a marca subindo dentro dele. Sem sombra no preenchimento:
 * ele está DENTRO do sulco, não por cima.
 */
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root data-slot="progress" value={value} {...props}>
      <ProgressPrimitive.Track
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-sunken",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.09),inset_0_0_0_1px_var(--border)]",
          "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_0_0_1px_oklch(0.325_0.006_107)]",
          className
        )}
      >
        <ProgressPrimitive.Indicator className="h-full rounded-full bg-primary transition-[width] duration-300" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
