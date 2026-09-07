// Rótulo editorial mono com o filete decorativo. O comprimento do filete é
// FIXO de propósito: com `flex-1` ele variava conforme o tamanho do rótulo,
// e duas seções vizinhas terminavam com réguas de tamanhos diferentes.
import { cn } from "@/lib/utils"

export interface OnboardingSectionLabelProps {
  id?: string
  label: string
  className?: string
}

export function OnboardingSectionLabel({
  id,
  label,
  className,
}: OnboardingSectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        id={id}
        className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase"
      >
        {label}
      </span>
      <span aria-hidden className="h-px w-8 bg-primary/60" />
      <span aria-hidden className="h-px w-32 bg-border/60" />
    </div>
  )
}
