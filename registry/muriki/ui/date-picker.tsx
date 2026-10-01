"use client"

/**
 * Muriki DatePicker e DateRangePicker — o campo de data da casa, no lugar do
 * <input type="date">, que pinta o calendário do sistema operacional, em
 * inglês ou em português conforme a máquina, e não muda com o tema.
 *
 * O GATILHO É UM CAMPO. Mesma superfície, filete, raio e alturas do
 * InputGroup, com o calendário como afixo à esquerda: numa linha de
 * formulário ele não pode parecer um botão no meio de campos. Por baixo é
 * um <button>, porque não se digita a data, se escolhe.
 *
 * DENTRO DE UM <Field> ELE É O CONTROLE. O gatilho é o Field.Control do
 * Base UI: o FieldLabel aponta para ele, o FieldError entra no
 * aria-describedby e o `invalid` do Field acende o filete vermelho, como em
 * qualquer Input.
 *
 * O VALOR É TEXTO "AAAA-MM-DD", o mesmo do input nativo e da API: nada de
 * Date atravessando fuso. Vazio é "". min e max no mesmo formato.
 *
 * PERÍODO É UM CAMPO SÓ. Dois campos ligados ("De", "Até") obrigam a pessoa
 * a abrir dois calendários e a conferir de cabeça se o fim veio depois do
 * começo. Um gatilho com o período inteiro, e dois meses lado a lado, mostra
 * o intervalo pintado: o primeiro clique marca o começo, o segundo o fim, e
 * se o segundo vier antes os dois trocam de lugar.
 *
 * O texto do gatilho é a data curta da casa (formatShortDate): "31 dez 2026".
 */
import * as React from "react"
import { CalendarBlank } from "@phosphor-icons/react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { enUS, es, ptBR } from "react-day-picker/locale"

import { cn } from "@/lib/utils"
import { formatShortDate } from "@/lib/date-format"
import { useTranslate } from "@/lib/i18n"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Size = "sm" | "default" | "lg"

// as alturas do InputGroup: o gatilho tem que alinhar com os campos da mesma linha
const alturas: Record<Size, string> = {
  sm: "h-7 gap-1.5 rounded-[7px] px-2.5 text-[0.78rem]",
  default: "h-8 gap-2 rounded-[8px] px-[11px] text-[0.8125rem]",
  lg: "h-9 gap-2 rounded-[9px] px-3 text-sm",
}

// ── datas em texto ──────────────────────────────────────────────────────

/** "2026-12-31" → a meia-noite local desse dia. Vazio ou malformado → undefined. */
function lerData(valor: string | undefined): Date | undefined {
  const m = valor ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor) : null
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined
}

/** O dia local, de volta em "AAAA-MM-DD". */
function escreverData(data: Date): string {
  const d = (n: number) => String(n).padStart(2, "0")
  return `${data.getFullYear()}-${d(data.getMonth() + 1)}-${d(data.getDate())}`
}

function localeDoCalendario(locale: string) {
  if (locale.startsWith("es")) return es
  if (locale.startsWith("en")) return enUS
  return ptBR
}

function limites(min?: string, max?: string) {
  const antes = lerData(min)
  const depois = lerData(max)
  return [...(antes ? [{ before: antes }] : []), ...(depois ? [{ after: depois }] : [])]
}

// ── o gatilho ───────────────────────────────────────────────────────────

interface GatilhoProps {
  ref?: React.Ref<HTMLButtonElement>
  id?: string
  size: Size
  disabled?: boolean
  texto: string | null
  placeholder: string
  className?: string
}

function Gatilho({ ref, id, size, disabled, texto, placeholder, className }: GatilhoProps) {
  return (
    <PopoverTrigger
      // o id vai no Field.Control: é ele que o registra para o FieldLabel
      render={<FieldPrimitive.Control id={id} render={<button type="button" ref={ref} />} />}
      disabled={disabled}
      data-slot="date-picker-trigger"
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center bg-field text-left text-foreground outline-none",
        "transition-[background-color,box-shadow] duration-100",
        "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--input)_45%,var(--field))]",
        "hover:shadow-[inset_0_0_0_1px_var(--input)]",
        // aberto, o campo fica aceso como em foco: o calendário é dele
        "focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "data-popup-open:shadow-[inset_0_0_0_1px_var(--primary)] data-popup-open:ring-[3px] data-popup-open:ring-ring/20",
        "aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-70",
        alturas[size],
        className
      )}
    >
      <span
        data-slot="input-group-addon"
        className="flex shrink-0 items-center text-muted-foreground [&_svg]:size-[15px]"
      >
        <CalendarBlank aria-hidden />
      </span>
      <span className={cn("min-w-0 flex-1 truncate", !texto && "text-muted-foreground/70")}>
        {texto ?? placeholder}
      </span>
    </PopoverTrigger>
  )
}

function Limpar({ onClick }: { onClick: () => void }) {
  const t = useTranslate()
  return (
    <div className="border-t border-muted p-1.5">
      <button
        type="button"
        onClick={onClick}
        className="h-7 w-full rounded-[7px] text-[0.78rem] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        {t("date_picker.clear")}
      </button>
    </div>
  )
}

// ── data única ──────────────────────────────────────────────────────────

export interface DatePickerProps {
  /** "AAAA-MM-DD"; vazio é "". */
  value: string
  onValueChange: (value: string) => void
  /** O primeiro dia que se pode escolher, "AAAA-MM-DD". */
  min?: string
  /** O último dia que se pode escolher, "AAAA-MM-DD". */
  max?: string
  /** Mostra "Limpar" embaixo do calendário, para o campo que pode ficar vazio. */
  clearable?: boolean
  /** Sem isto, "Escolher data". */
  placeholder?: string
  /** O idioma do calendário e do texto do gatilho. Sem isto, pt-BR. */
  locale?: string
  size?: Size
  disabled?: boolean
  id?: string
  ref?: React.Ref<HTMLButtonElement>
  className?: string
}

export function DatePicker({
  value,
  onValueChange,
  min,
  max,
  clearable,
  placeholder,
  locale = "pt-BR",
  size = "default",
  disabled,
  id,
  ref,
  className,
}: DatePickerProps) {
  const t = useTranslate()
  const [aberto, setAberto] = React.useState(false)
  const data = lerData(value)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <Gatilho
        ref={ref}
        id={id}
        size={size}
        disabled={disabled}
        texto={data ? formatShortDate(data, locale) : null}
        placeholder={placeholder ?? t("date_picker.placeholder")}
        className={className}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={data}
          defaultMonth={data ?? lerData(min)}
          onSelect={(dia) => {
            if (!dia) return
            onValueChange(escreverData(dia))
            setAberto(false)
          }}
          disabled={limites(min, max)}
          locale={localeDoCalendario(locale)}
          className="p-2"
        />
        {clearable && value ? (
          <Limpar
            onClick={() => {
              onValueChange("")
              setAberto(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

// ── período ─────────────────────────────────────────────────────────────

export interface DateRange {
  /** "AAAA-MM-DD"; vazio é "". */
  from: string
  /** "AAAA-MM-DD"; vazio é "". */
  to: string
}

export interface DateRangePickerProps extends Omit<DatePickerProps, "value" | "onValueChange"> {
  value: DateRange
  onValueChange: (value: DateRange) => void
  /** Quantos meses lado a lado. Sem isto, 2 (um embaixo do outro no celular). */
  numberOfMonths?: number
}

export function DateRangePicker({
  value,
  onValueChange,
  min,
  max,
  clearable,
  placeholder,
  locale = "pt-BR",
  size = "default",
  disabled,
  id,
  ref,
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  const t = useTranslate()
  const [aberto, setAberto] = React.useState(false)
  // o começo já marcado, à espera do fim; enquanto ele existe, é ele que se vê
  const [comeco, setComeco] = React.useState<Date | null>(null)
  const de = lerData(value.from)
  const ate = lerData(value.to)
  const texto = de && ate ? `${formatShortDate(de, locale)} – ${formatShortDate(ate, locale)}` : null
  const abrir = (v: boolean) => {
    setAberto(v)
    setComeco(null)
  }
  return (
    <Popover open={aberto} onOpenChange={abrir}>
      <Gatilho
        ref={ref}
        id={id}
        size={size}
        disabled={disabled}
        texto={texto}
        placeholder={placeholder ?? t("date_picker.range_placeholder")}
        className={className}
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          // com dois meses lado a lado, o dia de fora repetiria o vizinho, pintado no período
          showOutsideDays={false}
          selected={comeco ? { from: comeco, to: undefined } : de && ate ? { from: de, to: ate } : undefined}
          // o mês do fim fica à direita: o período que termina hoje não abre com um mês inteiro bloqueado
          defaultMonth={ate ? new Date(ate.getFullYear(), ate.getMonth() - (numberOfMonths - 1), 1) : (de ?? lerData(min))}
          // os cliques decidem, não o estado do react-day-picker: 1º marca o começo, 2º fecha
          onSelect={(_, dia) => {
            if (!comeco) {
              setComeco(dia)
              return
            }
            const [a, b] = dia < comeco ? [dia, comeco] : [comeco, dia]
            onValueChange({ from: escreverData(a), to: escreverData(b) })
            abrir(false)
          }}
          disabled={limites(min, max)}
          locale={localeDoCalendario(locale)}
          className="p-2"
        />
        {clearable && (value.from || value.to) ? (
          <Limpar
            onClick={() => {
              onValueChange({ from: "", to: "" })
              abrir(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
