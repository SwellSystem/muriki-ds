/**
 * Muriki Toaster.
 *
 * O que este arquivo carrega de sistema é o MAPA DE SEVERIDADE: qual token
 * pinta qual variante. Info é neutro (popover), success e warning são
 * tingidos como os badges, e error é o único sólido — um erro precisa
 * interromper, e é a mesma lógica que dá ao diálogo o direito de usar a
 * variante sólida do botão.
 *
 * Não decide o tema: passe `theme` como prop, do seu provider. Assim o
 * componente não conhece a infraestrutura do app que o hospeda.
 */
import { cn } from "@/lib/utils"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react"

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn("toaster group", className)}
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <WarningIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !mx-auto !max-w-[min(100vw-2rem,22rem)]",
          title: "!text-sm !font-medium !leading-snug",
          description:
            "!line-clamp-1 !text-[11px] !leading-snug !opacity-80 !font-mono !tracking-wide",
          actionButton:
            "!rounded-[6px] !px-2.5 !py-1 !text-xs !font-medium !shadow-[inset_0_0_0_1px_currentColor] !opacity-90 hover:!opacity-100",
          // Mapeia as variantes `rich` do Sonner para tokens da paleta
          // OKLCh do muriki — `!` pra vencer os defaults inline do Sonner.
          info: "!bg-popover !text-popover-foreground !border-border [&_[data-description]]:text-muted-foreground",
          success:
            "!bg-success/25 !text-success !border-success/50 shadow-sm [&_[data-description]]:text-success/80",
          warning:
            "!bg-warning/20 !text-warning !border-warning/40 shadow-sm [&_[data-description]]:text-warning/80",
          error:
            "!bg-destructive/85 !text-destructive-foreground !border-destructive/90 !shadow-md [&_svg]:text-destructive-foreground [&_[data-description]]:text-destructive-foreground/75 [&_[data-button]]:!border-destructive-foreground/30 [&_[data-button]]:!bg-destructive-foreground/15 [&_[data-button]]:!text-destructive-foreground [&_[data-button]]:hover:!bg-destructive-foreground/25",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
