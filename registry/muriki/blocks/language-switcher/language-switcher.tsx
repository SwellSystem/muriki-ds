"use client"

/**
 * Muriki LanguageSwitcher.
 *
 * MENU, NÃO CICLO. Um botão que troca a cada clique esconde as opções e faz
 * quem quer o terceiro idioma passar pelo segundo — numa língua que talvez
 * não leia. Aqui o clique abre a lista inteira e a escolha é direta.
 *
 * Cada idioma aparece NO PRÓPRIO idioma ("Español", não "Espanhol"): quem
 * está perdido numa língua estrangeira procura o nome da sua. O `lang` em
 * cada item faz o leitor de tela pronunciar certo.
 *
 * `compact` mostra a sigla embaixo do globo, para trilho recolhido.
 */
import { CaretDownIcon, GlobeIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface LanguageOption {
  /** Tag BCP 47: "pt-BR", "en-US". Vai no `lang` do item. */
  value: string
  /** O nome no próprio idioma: "Português", "English", "Español". */
  label: string
  /** Sigla para o modo `compact`. Padrão: as duas primeiras letras do value. */
  short?: string
}

export interface LanguageSwitcherProps {
  value: string
  options: LanguageOption[]
  onValueChange: (value: string) => void
  /** "Idioma", no idioma atual. Título do menu e começo do aria-label. */
  label: string
  compact?: boolean
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function LanguageSwitcher({
  value,
  options,
  onValueChange,
  label,
  compact = false,
  align = "end",
  side = "bottom",
  className,
}: LanguageSwitcherProps) {
  const atual = options.find((o) => o.value === value) ?? options[0]
  const sigla = atual?.short ?? atual?.value.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={compact ? "icon-lg" : "default"}
            aria-label={`${label}: ${atual?.label ?? ""}`}
            className={cn(
              "text-muted-foreground",
              compact && "h-auto flex-col gap-0.5 py-1.5 font-mono text-[9px] tracking-[0.08em]",
              className
            )}
          >
            <GlobeIcon aria-hidden />
            {compact ? (
              <span aria-hidden>{sigla}</span>
            ) : (
              <>
                <span>{atual?.label}</span>
                <CaretDownIcon aria-hidden className="size-3 opacity-60" />
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align={align} side={side} className="min-w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onValueChange(v as string)}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value} lang={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
