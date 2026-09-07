"use client"

/**
 * Muriki Select.
 *
 * Duas metades com dois donos. O GATILHO é campo: mesma superfície
 * `--field`, mesmo filete, mesma altura e mesmo raio do Input — parado numa
 * coluna de formulário, ele tem que ser irmão do campo de texto, não
 * primo do botão. A LISTA é superfície flutuante: `--float`, raio de
 * recipiente, item de 28px — a mesma peça do dropdown.
 *
 * O caret não gira ao abrir. Ele diz "aqui tem mais", não "estou aberto":
 * quem diz isso é a lista aparecendo.
 *
 * Base UI, então o valor é do TIPO que você passar — número, objeto,
 * qualquer coisa —, não a string que o `<select>` nativo obriga.
 */
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const triggerVariants = cva(
  [
    "flex w-full min-w-0 select-none items-center justify-between gap-2",
    "bg-field text-foreground outline-none transition-[background-color,box-shadow] duration-100",
    "data-[placeholder]:text-muted-foreground/70",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:bg-secondary data-disabled:opacity-70",
    "shadow-[inset_0_0_0_1px_var(--input)]",
    "hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--input)_86%,var(--foreground))]",
    "focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] focus-visible:ring-[3px] focus-visible:ring-ring/20",
    "data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] data-invalid:ring-[3px] data-invalid:ring-destructive/15",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-7 rounded-[7px] px-2.5 text-[0.78rem]",
        default: "h-8 rounded-[8px] px-[11px] text-[0.8125rem]",
        lg: "h-9 rounded-[9px] px-3 text-sm",
        touch: "h-11 rounded-[11px] px-3.5 text-base md:text-[0.9375rem]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  return <SelectPrimitive.Root {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & VariantProps<typeof triggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(triggerVariants({ size, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <CaretDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectValue(props: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectContent({
  className,
  children,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "align" | "side" | "sideOffset">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignItemWithTrigger={false}
        className="isolate z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto",
            "rounded-[var(--radius-float)] bg-popover p-1 text-popover-foreground shadow-[var(--float)] outline-none",
            "transition-[opacity,transform] duration-100 ease-out",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-8 pl-2",
        "text-[13px] leading-5 outline-none",
        "data-highlighted:bg-secondary data-highlighted:text-foreground-strong",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex items-center justify-center">
            <CheckIcon className="size-3.5 text-primary" weight="bold" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  )
}

function SelectGroup(props: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  triggerVariants as selectTriggerVariants,
}
