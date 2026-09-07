// Portado do muriki-platform sem redesenhar.
import { CloudArrowUp, File as FileIcon, Trash } from "@phosphor-icons/react"
import { useRef, useState } from "react"

import { useTranslate } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { TaskModalSection } from "./task-modal-section"
import type { TaskModalAttachment } from "./task-modal-types"

export interface TaskModalAttachmentsProps {
  attachments: TaskModalAttachment[]
  /** Chamado com os arquivos escolhidos/soltos. O upload real é do consumidor. */
  onAddFiles?: (files: File[]) => void
  onRemove: (id: string) => void
}

/**
 * Anexos: lista de arquivos já vinculados + dropzone. O componente só dispara
 * `onAddFiles`/`onRemove`; persistência e upload ficam no consumidor.
 */
export function TaskModalAttachments({
  attachments,
  onAddFiles,
  onRemove,
}: TaskModalAttachmentsProps) {
  const t = useTranslate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const emit = (fileList: FileList | null) => {
    if (fileList === null || fileList.length === 0) return
    onAddFiles?.(Array.from(fileList))
  }

  return (
    <TaskModalSection
      icon={CloudArrowUp}
      title={t("task_modal.attachments.title")}
      count={attachments.length === 0 ? undefined : attachments.length}
    >
      {attachments.length > 0 && (
        <ul className="mb-2.5 flex flex-col gap-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2"
            >
              <FileIcon
                size={19}
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground">
                {attachment.name}
              </span>
              {attachment.size !== undefined && (
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  {attachment.size}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(attachment.id)}
                aria-label={t("task_modal.attachments.remove")}
                className="shrink-0 text-muted-foreground hover:bg-destructive-subtle hover:text-destructive-subtle-foreground"
              >
                <Trash size={13} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          emit(event.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-3.5 text-center transition-colors",
          "hover:border-primary-subtle-border hover:bg-secondary",
          over && "border-primary bg-primary-subtle"
        )}
      >
        <CloudArrowUp size={20} aria-hidden className="text-muted-foreground" />
        <span className="text-xs text-foreground">
          <span className="font-semibold text-primary">
            {t("task_modal.attachments.cta")}
          </span>{" "}
          {t("task_modal.attachments.drop_hint")}
        </span>
        <span className="text-[10.5px] text-muted-foreground">
          {t("task_modal.attachments.constraints")}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        aria-label={t("task_modal.attachments.cta")}
        onChange={(event) => emit(event.currentTarget.files)}
      />
    </TaskModalSection>
  )
}
