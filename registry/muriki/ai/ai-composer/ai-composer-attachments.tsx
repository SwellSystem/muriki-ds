"use client"

/**
 * Fileira de anexos do composer.
 *
 * Fica DENTRO da moldura do campo, acima do texto — não flutuando por cima
 * nem numa barra separada embaixo. O anexo é parte da mensagem que está
 * sendo escrita; tirar ele de dentro do campo sugere que é outra coisa.
 */
import { File, X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useAiLabel } from "@/components/ai/ai-labels"

export interface AiAttachment {
  id: string
  name: string
  /** Tamanho já formatado ("1,2 MB"). O bloco não decide unidade. */
  sizeLabel?: string
  /** URL de preview. Quando vier, a miniatura substitui o ícone. */
  previewUrl?: string
}

export interface AiComposerAttachmentsProps {
  items: AiAttachment[]
  onRemove?: (id: string) => void
  className?: string
}

export function AiComposerAttachments({
  items,
  onRemove,
  className,
}: AiComposerAttachmentsProps) {
  const label = useAiLabel()
  if (items.length === 0) return null

  return (
    <ul
      data-slot="ai-composer-attachments"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "group/attachment flex max-w-[220px] items-center gap-1.5 rounded-[7px]",
            "bg-sunken py-1 pr-1 pl-1.5"
          )}
        >
          {item.previewUrl ? (
            <img
              src={item.previewUrl}
              alt=""
              className="size-4 shrink-0 rounded-[3px] object-cover"
            />
          ) : (
            <File aria-hidden size={13} weight="regular" className="shrink-0 text-muted-foreground/60" />
          )}
          <span className="truncate text-[11.5px] text-muted-foreground">{item.name}</span>
          {item.sizeLabel ? (
            <span className="shrink-0 font-mono text-[9.5px] text-muted-foreground/45 tabular-nums">
              {item.sizeLabel}
            </span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`${label("composer.remove_attachment")}: ${item.name}`}
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-[4px]",
                "text-muted-foreground/50 transition-colors",
                "hover:bg-foreground/[0.06] hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              )}
            >
              <X aria-hidden size={10} weight="bold" />
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
