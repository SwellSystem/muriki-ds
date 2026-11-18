"use client"

/**
 * Muriki PeoplePicker — quem é o responsável (um ou vários).
 *
 * O GATILHO É O AVATAR. Não é campo: na célula da tabela, na linha da lista
 * e no painel da tarefa o que se lê é o rosto de quem cuida, então o botão
 * é fantasma, do tamanho do avatar. `showName` põe o nome ao lado, para o
 * painel da tarefa; sem isso, só o avatar.
 *
 * SEM RESPONSÁVEL É UM CÍRCULO TRACEJADO, no lugar onde o avatar vai entrar.
 * Tracejado é o sinal do sistema para "não existe ainda" (o mesmo do badge
 * `dashed`). No modo de um só, o primeiro item da lista é "Sem responsável".
 *
 * "VOCÊ" VEM PRIMEIRO. Passe `me` e a pessoa que usa sobe para o topo,
 * marcada "Você": atribuir a si mesmo é o caso mais comum.
 *
 * A LISTA É O COMBOBOX DO BASE UI com a busca dentro do painel: teclado,
 * listbox e anúncio de leitor de tela vêm de lá. A busca procura no nome e
 * no e-mail. No modo de vários, marcar não fecha nem limpa a busca: dá para
 * escolher três pessoas da mesma pesquisa. `Esc` ou clicar fora fecha.
 */
import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useTranslate } from "@/lib/i18n"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button-variants"

export interface PickerPerson {
  id: string
  name: string
  /** URL da foto. Sem ela, as iniciais sobre um tom tirado do nome. */
  avatar?: string
  email?: string
  /** Segunda linha no item (cargo, time). Quem é `me` mostra "Você". */
  description?: string
}

interface PeoplePickerBase {
  people: PickerPerson[]
  /** O id de quem usa: vem primeiro na lista, marcado "Você". */
  me?: string
  /** O nome ao lado do avatar (painel da tarefa). Sem isso, só o avatar. */
  showName?: boolean
  /** Passou disso, vira "+N". Padrão 3. */
  maxAvatars?: number
  /** Padrão "Sem responsável". */
  noneLabel?: string
  size?: "xs" | "sm" | "default"
  align?: "start" | "center" | "end"
  disabled?: boolean
  searchPlaceholder?: string
  "aria-label"?: string
  className?: string
}

export type PeoplePickerProps = PeoplePickerBase &
  (
    | { multiple?: false; value?: string | null; onChange?: (value: string | null) => void }
    | { multiple: true; value?: string[]; onChange?: (value: string[]) => void }
  )

const NENHUM = "__muriki-none"

// mesmos oito tons do Badge, sem o cinza: cinza é de ausência, não de gente
const TONS = [
  "bg-tone-blue text-tone-blue-foreground",
  "bg-tone-green text-tone-green-foreground",
  "bg-tone-purple text-tone-purple-foreground",
  "bg-tone-orange text-tone-orange-foreground",
  "bg-tone-cyan text-tone-cyan-foreground",
  "bg-tone-pink text-tone-pink-foreground",
  "bg-tone-yellow text-tone-yellow-foreground",
  "bg-tone-red text-tone-red-foreground",
]

function tomDoNome(nome: string) {
  let soma = 0
  for (let i = 0; i < nome.length; i++) soma = (soma * 31 + nome.charCodeAt(i)) >>> 0
  return TONS[soma % TONS.length]
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return "?"
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function PersonAvatar({ person, className }: { person: PickerPerson; className?: string }) {
  return (
    <Avatar size="sm" className={cn("size-5", className)} title={person.name}>
      {person.avatar ? <AvatarImage src={person.avatar} alt="" /> : null}
      <AvatarFallback className={cn("text-[9px] font-medium", tomDoNome(person.name))}>
        {iniciais(person.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function PeoplePicker(props: PeoplePickerProps) {
  const {
    people, me, showName = false, maxAvatars = 3, size = "sm", align = "start",
    disabled, searchPlaceholder, className,
  } = props
  const multiple = props.multiple === true
  const t = useTranslate()
  const noneLabel = props.noneLabel ?? t("people_picker.none")

  const pessoas = React.useMemo(
    () => (me ? [...people].sort((a, b) => Number(b.id === me) - Number(a.id === me)) : people),
    [people, me]
  )
  const porId = React.useMemo(() => new Map(pessoas.map((p) => [p.id, p])), [pessoas])
  const ids = React.useMemo(
    () => (multiple ? pessoas.map((p) => p.id) : [NENHUM, ...pessoas.map((p) => p.id)]),
    [pessoas, multiple]
  )

  const escolhidos: string[] = props.multiple
    ? props.value ?? []
    : props.value == null ? [] : [props.value]
  const escolhidas = escolhidos.map((id) => porId.get(id)).filter((p): p is PickerPerson => !!p)

  const [busca, setBusca] = React.useState("")

  function mudar(proximo: string | string[] | null) {
    if (props.multiple) props.onChange?.((proximo as string[] | null) ?? [])
    else props.onChange?.(proximo == null || proximo === NENHUM ? null : (proximo as string))
  }

  const rotulo =
    props["aria-label"] ?? (multiple ? t("people_picker.label_many") : t("people_picker.label_one"))

  return (
    <Combobox.Root<string, boolean>
      items={ids}
      multiple={multiple}
      value={multiple ? escolhidos : (escolhidos[0] ?? NENHUM)}
      onValueChange={(v) => mudar(v as string | string[] | null)}
      inputValue={busca}
      // no modo de vários, marcar não limpa a busca: escolhe-se várias da mesma pesquisa
      onInputValueChange={(v, detalhes) => {
        if (!detalhes.isItemPress) setBusca(v)
      }}
      itemToStringLabel={(id) => (id === NENHUM ? noneLabel : porId.get(id)?.name ?? id)}
      filter={(id, consulta) => {
        if (!consulta) return true
        if (id === NENHUM) return normalizar(noneLabel).includes(normalizar(consulta))
        const p = porId.get(id)
        return !!p && normalizar(`${p.name} ${p.email ?? ""}`).includes(normalizar(consulta))
      }}
      disabled={disabled}
    >
      <Combobox.Trigger
        data-slot="people-picker"
        aria-label={rotulo}
        className={cn(
          buttonVariants({ variant: "ghost", size }),
          "max-w-full min-w-0 justify-start gap-1.5 px-1.5 font-normal data-popup-open:bg-secondary",
          className
        )}
      >
        {escolhidas.length === 0 ? (
          <>
            <span aria-hidden className="size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-input" />
            {showName ? <span className="truncate text-muted-foreground">{noneLabel}</span> : null}
          </>
        ) : (
          <>
            <span className="flex shrink-0 items-center">
              {escolhidas.slice(0, maxAvatars).map((p) => (
                <PersonAvatar key={p.id} person={p} className="-ml-1.5 ring-2 ring-background first:ml-0" />
              ))}
            </span>
            {escolhidas.length > maxAvatars ? (
              <span className="text-[12.5px] text-muted-foreground tabular-nums">
                +{escolhidas.length - maxAvatars}
              </span>
            ) : null}
            {showName ? (
              <span className="truncate">
                {escolhidas.length === 1
                  ? escolhidas[0].name
                  : t("people_picker.count", { count: escolhidas.length })}
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
              "flex w-64 max-w-(--available-width) origin-(--transform-origin) flex-col",
              "rounded-[var(--radius-float)] bg-popover p-1 text-popover-foreground shadow-[var(--float)] outline-none",
              "transition-[opacity,transform,filter] duration-150 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[starting-style]:blur-[2px]",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:blur-[2px]"
            )}
          >
            <div className="mb-1 flex items-center gap-2 border-b border-divider px-2 pt-0.5 pb-1">
              <MagnifyingGlassIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <Combobox.Input
                placeholder={searchPlaceholder ?? t("people_picker.search")}
                className="h-7 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Combobox.Empty>
              <p className="px-2 py-2.5 text-[12.5px] text-muted-foreground">{t("people_picker.empty")}</p>
            </Combobox.Empty>
            <Combobox.List className="flex max-h-[min(280px,calc(var(--available-height)-80px))] flex-col gap-px overflow-y-auto overscroll-contain muriki-scroll empty:hidden">
              {(id: string) => {
                const p = porId.get(id)
                const descricao = p ? (p.id === me ? t("people_picker.you") : p.description) : undefined
                return (
                  <Combobox.Item
                    key={id}
                    value={id}
                    className={cn(
                      "group/item relative flex min-h-8 cursor-default select-none items-center gap-2.5 rounded-md px-2 py-1 text-[13px] outline-none",
                      "data-highlighted:bg-secondary data-highlighted:text-foreground-strong"
                    )}
                  >
                    {multiple ? (
                      <span
                        aria-hidden
                        className="grid size-4 shrink-0 place-items-center rounded-[4px] bg-muted text-primary-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_20%,transparent)] group-data-selected/item:bg-primary group-data-selected/item:shadow-none"
                      >
                        <CheckIcon weight="bold" className="size-[11px] opacity-0 group-data-selected/item:opacity-100" />
                      </span>
                    ) : null}
                    {p ? (
                      <PersonAvatar person={p} />
                    ) : (
                      <span aria-hidden className="size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-input" />
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{p ? p.name : noneLabel}</span>
                      {descricao ? (
                        <span className="truncate text-[12px] leading-4 text-muted-foreground">{descricao}</span>
                      ) : null}
                    </span>
                    {multiple ? null : (
                      <Combobox.ItemIndicator className="flex shrink-0">
                        <CheckIcon weight="bold" className="size-3.5 text-primary" />
                      </Combobox.ItemIndicator>
                    )}
                  </Combobox.Item>
                )
              }}
            </Combobox.List>
            {multiple && escolhidos.length > 0 ? (
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-divider px-2 pt-2 pb-1 text-[12.5px] text-muted-foreground">
                <span>{t("people_picker.selected", { count: escolhidos.length })}</span>
                <button
                  type="button"
                  onClick={() => mudar([])}
                  className="font-medium text-primary outline-none hover:underline focus-visible:underline"
                >
                  {t("people_picker.clear")}
                </button>
              </div>
            ) : null}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

export { PeoplePicker }
