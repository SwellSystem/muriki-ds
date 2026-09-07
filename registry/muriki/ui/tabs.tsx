"use client"

/**
 * Muriki Tabs.
 *
 * ABA NÃO É VIEW TOGGLE, e essa é a decisão que dá a forma. O toggle troca
 * a FORMA de ver a mesma coisa — lista ou board, claro ou escuro — e por
 * isso tem trilho, cursor que desliza e pill. A aba troca O QUE se vê:
 * cada painel tem conteúdo próprio, e nada desliza de um para o outro.
 *
 * Então a aba padrão é `line`: filete embaixo da ativa, sem trilho, sem
 * pastilha. Some a competição visual entre as duas peças, e o pill fica
 * reservado ao toggle, onde ele significa alguma coisa.
 *
 * `enclosed` existe para o caso denso — abas dentro de um card já cheio,
 * onde o filete some no meio de outros filetes. Aí ela pega o trilho
 * afundado do sistema, mas com raio de CONTROLE: sem o pill, não vira
 * cópia do toggle.
 *
 * Base UI, e nenhuma classe `dark:` — o relevo do trilho vem de `--sunken`,
 * que já é mais escuro que o fundo nos dois temas.
 *
 * Dois seletores do Base UI que não são o que parecem, e que falham em
 * SILÊNCIO — a classe compila, não dá erro e não pinta nada:
 *   · a orientação sai em `data-orientation`, não em `data-horizontal`;
 *     use `data-[orientation=horizontal]:`.
 *   · a aba ativa sai em `data-active`, não em `data-selected`.
 */
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn("group/tabs flex gap-3 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    "group/tabs-list inline-flex w-fit items-center",
    "group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch",
  ].join(" "),
  {
    variants: {
      variant: {
        /**
         * Filete embaixo da ativa. O trilho é a própria linha do sistema.
         *
         * O TRILHO DISSOLVE NAS PONTAS. A lista é `w-fit`, então a linha
         * tinha começo e fim visíveis e lia como um traço solto embaixo das
         * abas. Dissolvida ela vira trilho: sustenta o filete da ativa sem
         * ela mesma virar um objeto. É a forma `soft` do Separator, aqui em
         * pseudo-elemento porque box-shadow não aceita máscara.
         *
         * `before` e não `after`: o filete da aba ativa é um `after` do
         * gatilho, e o pseudo-elemento do pai pintaria por cima dele.
         */
        line: [
          "relative gap-4",
          "before:pointer-events-none before:absolute before:bg-border",
          "group-data-[orientation=horizontal]/tabs:before:inset-x-0 group-data-[orientation=horizontal]/tabs:before:bottom-0 group-data-[orientation=horizontal]/tabs:before:h-px",
          "group-data-[orientation=horizontal]/tabs:before:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
          "group-data-[orientation=vertical]/tabs:gap-1",
          "group-data-[orientation=vertical]/tabs:before:inset-y-0 group-data-[orientation=vertical]/tabs:before:right-0 group-data-[orientation=vertical]/tabs:before:w-px",
          "group-data-[orientation=vertical]/tabs:before:[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
        ].join(" "),
        /** Trilho afundado, para quando o filete se perderia. */
        enclosed:
          "gap-0.5 rounded-[10px] bg-sunken p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07),inset_0_0_0_1px_var(--border)]",
      },
    },
    defaultVariants: { variant: "line" },
  }
)

function TabsList({
  className,
  variant = "line",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "text-[13px] font-medium text-muted-foreground transition-colors outline-none",
        "hover:text-foreground data-active:text-foreground-strong",
        "focus-visible:ring-[3px] focus-visible:ring-ring/35",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // line: o filete da ativa cobre a linha do trilho, por cima
        "group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:rounded-t-[8px] group-data-[variant=line]/tabs-list:px-0.5",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bg-primary group-data-[variant=line]/tabs-list:after:opacity-0",
        "group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:after:-bottom-px group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:after:h-0.5",
        "group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:after:-right-px group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:after:w-0.5",
        "group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        // enclosed: a ativa é a peça elevada dentro do trilho
        "group-data-[variant=enclosed]/tabs-list:h-7 group-data-[variant=enclosed]/tabs-list:rounded-[7px] group-data-[variant=enclosed]/tabs-list:px-3",
        "group-data-[variant=enclosed]/tabs-list:data-active:bg-card",
        "group-data-[variant=enclosed]/tabs-list:data-active:shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_0_0_1px_var(--input)]",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  /** Nome do shadcn, para quem chega migrando. */
  TabsPanel as TabsContent,
  tabsListVariants,
}
