"use client"

/**
 * As partes de resposta do exercício de arquitetura além dos números (ExerciseAnswerNumbers), na
 * mesma coluna e no mesmo cartão recolhível, entre o enunciado e a explicação:
 *
 * - ExerciseAnswerChoices (`answerSpec.choices`): marcar todas as certas. As opções vêm na ordem
 *   servida (a dos ids opacos) e `onChange` devolve os ids marcados nessa ordem.
 * - ExerciseAnswerOrder (`answerSpec.order`): pôr os itens em ordem. `items` é a ordem atual (a
 *   servida, no começo, que nunca é a resposta); arrastar pela alça ou subir e descer pelos botões, que
 *   são o caminho do teclado. `onChange` devolve todos os ids na ordem nova.
 *
 * Nenhum dos dois diz o que é certo: só o que a pessoa marcou ou ordenou.
 */
import * as React from "react"
import { DndContext, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowDownIcon, ArrowUpIcon, DotsSixVerticalIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslate } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { CARTAO, ExerciseSection, TITULO_DO_CARTAO, type ExerciseCollapsibleProps } from "./exercise-workspace"

/** Uma opção de `choices` ou um item de `order`: o id opaco e o rótulo já traduzido. */
export interface ExerciseAnswerOption {
  id: string
  label: React.ReactNode
}

// ── Marque as certas (choices) ─────────────────────────────────────────

export interface ExerciseAnswerChoicesProps extends ExerciseCollapsibleProps {
  /** `answerSpec.choices.prompt`. */
  prompt: React.ReactNode
  options: ExerciseAnswerOption[]
  /** Os ids marcados. */
  selected: string[]
  onChange: (ids: string[]) => void
  /** A nota embaixo. Sem isto, "Marque todas as certas…". */
  note?: React.ReactNode
  readOnly?: boolean
  className?: string
}

export function ExerciseAnswerChoices({
  prompt,
  options,
  selected,
  onChange,
  note,
  readOnly,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseAnswerChoicesProps) {
  const t = useTranslate()
  const base = React.useId()
  const marcadas = new Set(selected)
  const mudar = (id: string, marcada: boolean) => {
    const proximas = new Set(marcadas)
    if (marcada) proximas.add(id)
    else proximas.delete(id)
    onChange(options.filter((o) => proximas.has(o.id)).map((o) => o.id))
  }
  return (
    <ExerciseSection
      data-slot="exercise-answer-choices"
      title={t("exercise_workspace.choices.title")}
      end={
        <span className="pr-1 font-mono text-[11px] text-muted-foreground">
          {t("exercise_workspace.choices.count", { count: marcadas.size })}
        </span>
      }
      divider={false}
      titleClassName={TITULO_DO_CARTAO}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn(CARTAO, className)}
      bodyClassName="flex flex-col gap-2.5 px-4 pb-4"
    >
      <fieldset className="m-0 flex flex-col gap-1 border-0 p-0" aria-describedby={`${base}-nota`}>
        <legend className="mb-1.5 p-0 text-[13.5px] leading-5 font-medium text-foreground-strong">{prompt}</legend>
        {options.map((o) => {
          const id = `${base}-${o.id}`
          return (
            <label
              key={o.id}
              htmlFor={id}
              className={cn(
                "-mx-2 flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] leading-5 text-foreground",
                readOnly ? "cursor-default" : "cursor-pointer hover:bg-muted"
              )}
            >
              <Checkbox
                id={id}
                checked={marcadas.has(o.id)}
                onCheckedChange={(v) => mudar(o.id, v)}
                readOnly={readOnly}
                className="mt-0.5"
              />
              <span className="min-w-0">{o.label}</span>
            </label>
          )
        })}
      </fieldset>
      <span id={`${base}-nota`} className="text-xs text-muted-foreground">
        {note ?? t("exercise_workspace.choices.note")}
      </span>
    </ExerciseSection>
  )
}

// ── Ponha em ordem (order) ─────────────────────────────────────────────

export interface ExerciseAnswerOrderProps extends ExerciseCollapsibleProps {
  /** `answerSpec.order.prompt`. */
  prompt: React.ReactNode
  /** Os itens na ordem atual. */
  items: ExerciseAnswerOption[]
  /** Todos os ids, na ordem nova. */
  onChange: (ids: string[]) => void
  /** A nota embaixo. Sem isto, "Arraste pela alça…". */
  note?: React.ReactNode
  readOnly?: boolean
  className?: string
}

export function ExerciseAnswerOrder({
  prompt,
  items,
  onChange,
  note,
  readOnly,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
}: ExerciseAnswerOrderProps) {
  const t = useTranslate()
  const base = React.useId()
  // o arrasto é do ponteiro; o teclado e o leitor de tela usam os botões de subir e descer
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )
  const [aviso, setAviso] = React.useState("")
  const ids = items.map((i) => i.id)
  const mover = (de: number, para: number) => {
    if (para < 0 || para >= ids.length || de === para) return
    onChange(arrayMove(ids, de, para))
    setAviso(t("exercise_workspace.order.moved", { from: de + 1, to: para + 1 }))
  }
  const soltar = ({ active, over }: DragEndEvent) => {
    if (!over) return
    mover(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }
  return (
    <ExerciseSection
      data-slot="exercise-answer-order"
      title={t("exercise_workspace.order.title")}
      end={
        <span className="pr-1 font-mono text-[11px] text-muted-foreground">
          {t("exercise_workspace.order.count", { count: items.length })}
        </span>
      }
      divider={false}
      titleClassName={TITULO_DO_CARTAO}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn(CARTAO, className)}
      bodyClassName="flex flex-col gap-2.5 px-4 pb-4"
    >
      <span id={`${base}-pergunta`} className="text-[13.5px] leading-5 font-medium text-foreground-strong">
        {prompt}
      </span>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={soltar}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol aria-labelledby={`${base}-pergunta`} className="m-0 flex list-none flex-col gap-1.5 p-0">
            {items.map((item, i) => (
              <ItemDaOrdem
                key={item.id}
                item={item}
                posicao={i}
                total={items.length}
                readOnly={readOnly}
                onMover={(para) => mover(i, para)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <span aria-live="polite" className="sr-only">
        {aviso}
      </span>
      <span className="text-xs text-muted-foreground">{note ?? t("exercise_workspace.order.note")}</span>
    </ExerciseSection>
  )
}

function ItemDaOrdem({
  item,
  posicao,
  total,
  readOnly,
  onMover,
}: {
  item: ExerciseAnswerOption
  posicao: number
  total: number
  readOnly?: boolean
  onMover: (para: number) => void
}) {
  const t = useTranslate()
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: readOnly,
  })
  // o React move o li com o botão focado, e no topo ou no fim o botão desliga: depois de mover, o foco
  // volta ao botão do mesmo sentido no lugar novo, ou ao outro do mesmo item se esse desligou
  const moverPeloBotao = (evento: React.MouseEvent<HTMLButtonElement>, sentido: "up" | "down") => {
    const lista = evento.currentTarget.closest("ol")
    onMover(sentido === "up" ? posicao - 1 : posicao + 1)
    requestAnimationFrame(() => {
      const li = lista?.querySelector(`[data-item="${globalThis.CSS.escape(item.id)}"]`)
      const mesmo = li?.querySelector<HTMLButtonElement>(`button[data-dir="${sentido}"]`)
      const outro = li?.querySelector<HTMLButtonElement>(`button[data-dir="${sentido === "up" ? "down" : "up"}"]`)
      ;(mesmo && !mesmo.disabled ? mesmo : outro)?.focus()
    })
  }
  return (
    <li
      ref={setNodeRef}
      data-item={item.id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative flex items-center gap-1.5 rounded-lg bg-sunken py-1 pr-1 pl-1 text-[13.5px] leading-5 text-foreground",
        isDragging && "z-10 bg-card shadow-md"
      )}
    >
      {/* a alça é só do ponteiro: os botões ao lado fazem o mesmo pelo teclado */}
      <span
        ref={setActivatorNodeRef}
        {...(readOnly ? {} : listeners)}
        aria-hidden
        className={cn(
          "flex h-7 w-5 shrink-0 touch-none items-center justify-center text-muted-foreground",
          readOnly ? "opacity-40" : "cursor-grab active:cursor-grabbing"
        )}
      >
        <DotsSixVerticalIcon weight="bold" className="size-3.5" />
      </span>
      <span className="w-4 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{posicao + 1}</span>
      <span className="min-w-0 flex-1 py-1">{item.label}</span>
      {readOnly ? null : (
        <span className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            data-dir="up"
            disabled={posicao === 0}
            onClick={(e) => moverPeloBotao(e, "up")}
            aria-label={t("exercise_workspace.order.up", { n: posicao + 1 })}
          >
            <ArrowUpIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            data-dir="down"
            disabled={posicao === total - 1}
            onClick={(e) => moverPeloBotao(e, "down")}
            aria-label={t("exercise_workspace.order.down", { n: posicao + 1 })}
          >
            <ArrowDownIcon aria-hidden />
          </Button>
        </span>
      )}
    </li>
  )
}
