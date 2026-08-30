"use client"

import * as React from "react"
import { DotsThree } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type RowAction = {
  /** Chave estável. Não é exibida. */
  id: string
  /**
   * O verbo. OBRIGATÓRIO: vira o tooltip E o aria-label.
   * Ícone sem rótulo é adivinhação — e leitor de tela não vê desenho.
   */
  label: string
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
  /** Aparece no tooltip e no menu. Ex.: "E", "⌘D". */
  shortcut?: string
  /** Vai para o fim, depois de um separador, com a cor destrutiva. */
  destructive?: boolean
  disabled?: boolean
}

export interface RowActionsProps extends React.ComponentProps<"div"> {
  actions: RowAction[]
  /**
   * Quantas ficam visíveis como ícone. O resto cai no menu de "mais".
   * No toque, passe 0: sem hover, uma barra de cinco ícones não cabe.
   */
  inlineCount?: number
  /**
   * Por padrão as ferramentas só aparecem no hover da linha ou quando algo
   * dentro delas recebe foco. Ligue em telas de toque, onde hover não existe.
   */
  alwaysVisible?: boolean
  /** Rótulo do gatilho de "mais". */
  moreLabel?: string
}

/**
 * Barra de ferramentas de linha — zero texto, só ícone.
 *
 * Requer que a linha (tr/div) tenha a classe `group/row`: a barra usa
 * `group-hover/row` para aparecer. E ela ocupa o lugar dos metadados, então
 * a linha não muda de altura quando o cursor chega.
 */
function RowActions({
  actions, inlineCount = 4, alwaysVisible = false, moreLabel = "Mais ações", className, ...props
}: RowActionsProps) {
  const safe = actions.filter((a) => !a.disabled || true)
  const inline = safe.filter((a) => !a.destructive).slice(0, inlineCount)
  const overflow = safe.filter((a) => !inline.includes(a))
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div
      data-slot="row-actions"
      className={cn(
        "inline-flex items-center gap-px",
        !alwaysVisible &&
          "opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100 data-[menu-open=true]:opacity-100",
        className
      )}
      data-menu-open={menuOpen || undefined}
      {...props}
    >
      {inline.map((action) => (
        <Tooltip key={action.id}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={action.label}
                disabled={action.disabled}
                onClick={action.onSelect}
                className="text-muted-foreground"
              >
                <action.icon className="size-[15px]" />
              </Button>
            }
          />
          <TooltipContent>
            {action.label}
            {action.shortcut ? (
              <span className="ml-1.5 font-mono text-[11px] opacity-60">{action.shortcut}</span>
            ) : null}
          </TooltipContent>
        </Tooltip>
      ))}

      {overflow.length > 0 ? (
        <>
          {inline.length > 0 ? (
            <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          ) : null}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={moreLabel} className="text-muted-foreground">
                  <DotsThree className="size-[15px]" weight="bold" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              {overflow.map((action, i) => (
                <React.Fragment key={action.id}>
                  {action.destructive && i > 0 && !overflow[i - 1]?.destructive ? (
                    <DropdownMenuSeparator />
                  ) : null}
                  <DropdownMenuItem
                    disabled={action.disabled}
                    onClick={action.onSelect}
                    variant={action.destructive ? "destructive" : "default"}
                  >
                    <action.icon className="size-4" />
                    {action.label}
                    {action.shortcut ? (
                      <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </div>
  )
}

export { RowActions }
