"use client"

/**
 * Muriki LabelPicker — etiquetas com cor.
 *
 * O GATILHO MOSTRA AS ETIQUETAS como badges com ponto (até `maxTags`,
 * depois "+N"). Vazio, é o ícone de etiqueta com o placeholder apagado. O
 * botão é fantasma, como o do PeoplePicker: mora em célula e em painel, não
 * em coluna de formulário.
 *
 * COR DE ETIQUETA É SÓ IDENTIFICAÇÃO. O `tone` é um dos nove tons do Badge;
 * vermelho aqui não quer dizer "urgente" (isso é prioridade).
 *
 * CRIAR NA HORA. Com `onCreate`, o que se digita e não existe vira o último
 * item, "Criar etiqueta “x”". O picker não inventa cor nem id: quem usa cria
 * a etiqueta e devolve em `labels` e em `value`.
 *
 * A LISTA É O COMBOBOX DO BASE UI com a busca dentro do painel. Marcar não
 * fecha nem limpa a busca; `Esc` ou clicar fora fecha.
 */
import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { CheckIcon, MagnifyingGlassIcon, PlusIcon, TagIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import type { BadgeTone } from "@/components/ui/badge-variants"
import { buttonVariants } from "@/components/ui/button-variants"

export interface PickerLabel {
  id: string
  name: string
  /** Um dos nove tons do Badge. Padrão cinza. */
  tone?: BadgeTone
}

export interface LabelPickerProps {
  labels: PickerLabel[]
  value?: string[]
  onChange?: (value: string[]) => void
  /** Digitou uma etiqueta que não existe: "Criar etiqueta “x”". Quem usa cria e passa de volta. */
  onCreate?: (name: string) => void
  /** Passou disso, vira "+N". Padrão 2. */
  maxTags?: number
  placeholder?: string
  size?: "xs" | "sm" | "default"
  align?: "start" | "center" | "end"
  disabled?: boolean
  searchPlaceholder?: string
  "aria-label"?: string
  className?: string
}

const CRIAR = "__muriki-create"

const PONTO: Record<BadgeTone, string> = {
  gray: "bg-tone-gray-dot",
  blue: "bg-tone-blue-dot",
  cyan: "bg-tone-cyan-dot",
  green: "bg-tone-green-dot",
  yellow: "bg-tone-yellow-dot",
  orange: "bg-tone-orange-dot",
  red: "bg-tone-red-dot",
  pink: "bg-tone-pink-dot",
  purple: "bg-tone-purple-dot",
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
}

function LabelPicker({
  labels, value = [], onChange, onCreate, maxTags = 2, placeholder, size = "sm", align = "start",
  disabled, searchPlaceholder, className, ...props
}: LabelPickerProps) {
  const t = useTranslate()
  const porId = React.useMemo(() => new Map(labels.map((l) => [l.id, l])), [labels])
  const [busca, setBusca] = React.useState("")

  const digitado = busca.trim()
  const podeCriar =
    !!onCreate && digitado !== "" && !labels.some((l) => normalizar(l.name) === normalizar(digitado))
  const ids = React.useMemo(
    () => (podeCriar ? [...labels.map((l) => l.id), CRIAR] : labels.map((l) => l.id)),
    [labels, podeCriar]
  )
  const escolhidas = value.map((id) => porId.get(id)).filter((l): l is PickerLabel => !!l)
  const rotulo = props["aria-label"] ?? t("label_picker.label")

  return (
    <Combobox.Root<string, true>
      items={ids}
      multiple
      value={value}
      onValueChange={(proximo) => {
        if (proximo.includes(CRIAR)) {
          onCreate?.(digitado)
          setBusca("")
          return
        }
        onChange?.(proximo)
      }}
      inputValue={busca}
      // marcar não limpa a busca: escolhe-se várias da mesma pesquisa
      onInputValueChange={(v, detalhes) => {
        if (!detalhes.isItemPress) setBusca(v)
      }}
      itemToStringLabel={(id) => (id === CRIAR ? digitado : porId.get(id)?.name ?? id)}
      filter={(id, consulta) =>
        id === CRIAR || !consulta || normalizar(porId.get(id)?.name ?? "").includes(normalizar(consulta))
      }
      disabled={disabled}
    >
      <Combobox.Trigger
        data-slot="label-picker"
        aria-label={rotulo}
        className={cn(
          buttonVariants({ variant: "ghost", size }),
          "max-w-full min-w-0 justify-start gap-1 px-1.5 font-normal data-popup-open:bg-secondary",
          className
        )}
      >
        {escolhidas.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <TagIcon className="size-3.5" />
            {placeholder ?? t("label_picker.placeholder")}
          </span>
        ) : (
          <>
            {escolhidas.slice(0, maxTags).map((l) => (
              <Badge key={l.id} tone={l.tone ?? "gray"} size="sm" dot className="min-w-0">
                <span className="truncate">{l.name}</span>
              </Badge>
            ))}
            {escolhidas.length > maxTags ? (
              <span className="ml-0.5 text-[12.5px] text-muted-foreground tabular-nums">
                +{escolhidas.length - maxTags}
              </span>
            ) : null}
          </>
        )}
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner align={align} sideOffset={6} className="isolate z-50 outline-none">
          <Combobox.Popup
            aria-label={rotulo}
            className={cn(
              "flex w-60 max-w-(--available-width) origin-(--transform-origin) flex-col",
              "rounded-[var(--radius-float)] bg-popover p-1 text-popover-foreground shadow-[var(--float)] outline-none",
              "transition-[opacity,transform,filter] duration-150 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[starting-style]:blur-[2px]",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:blur-[2px]"
            )}
          >
            <div className="mb-1 flex items-center gap-2 border-b border-divider px-2 pt-0.5 pb-1">
              <MagnifyingGlassIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <Combobox.Input
                placeholder={searchPlaceholder ?? t("label_picker.search")}
                className="h-7 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Combobox.Empty>
              <p className="px-2 py-2.5 text-[12.5px] text-muted-foreground">{t("label_picker.empty")}</p>
            </Combobox.Empty>
            <Combobox.List className="flex max-h-[min(280px,calc(var(--available-height)-80px))] flex-col gap-px overflow-y-auto overscroll-contain muriki-scroll empty:hidden">
              {(id: string) => {
                const item = cn(
                  "group/item relative flex h-8 cursor-default select-none items-center gap-2.5 rounded-md px-2 text-[13px] outline-none",
                  "data-highlighted:bg-secondary data-highlighted:text-foreground-strong"
                )
                if (id === CRIAR) {
                  return (
                    <Combobox.Item key={id} value={id} className={item}>
                      <PlusIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">
                        {t("label_picker.create", { name: digitado })}
                      </span>
                    </Combobox.Item>
                  )
                }
                const l = porId.get(id)
                return (
                  <Combobox.Item key={id} value={id} className={item}>
                    <span
                      aria-hidden
                      className="grid size-4 shrink-0 place-items-center rounded-[4px] bg-muted text-primary-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_20%,transparent)] group-data-selected/item:bg-primary group-data-selected/item:shadow-none"
                    >
                      <CheckIcon weight="bold" className="size-[11px] opacity-0 group-data-selected/item:opacity-100" />
                    </span>
                    <span aria-hidden className={cn("size-2 shrink-0 rounded-full", PONTO[l?.tone ?? "gray"])} />
                    <span className="min-w-0 flex-1 truncate">{l?.name ?? id}</span>
                  </Combobox.Item>
                )
              }}
            </Combobox.List>
            {value.length > 0 ? (
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-divider px-2 pt-2 pb-1 text-[12.5px] text-muted-foreground">
                <span>{t("label_picker.selected", { count: value.length })}</span>
                <button
                  type="button"
                  onClick={() => onChange?.([])}
                  className="font-medium text-primary outline-none hover:underline focus-visible:underline"
                >
                  {t("label_picker.clear")}
                </button>
              </div>
            ) : null}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

export { LabelPicker }
