// Portado do muriki-platform sem redesenhar.
//
// O seletor de modos era um segmentado montado à mão: cápsula com trilho,
// pastilha branca elevada no ativo e sombra escrita no lugar. A casa já tem
// exatamente essa peça — o ViewToggle, com a pill que desliza e o relevo
// que muda de meio entre os temas. Aqui ele é só vestido de três modos.
//
// É o caso legítimo de ícone sem rótulo no ViewToggle: são três opções, e
// três nunca é confundido com um switch. O `ariaLabel` de cada uma continua
// obrigatório, pela mesma regra do RowActions.
import { CardsThree, FrameCorners, SidebarSimple } from "@phosphor-icons/react"

import { ViewToggle } from "@/components/ui/view-toggle"
import { useTranslate } from "@/lib/i18n"

import type { TaskModalMode } from "./task-modal-types"

export interface TaskModeSwitchProps {
  mode: TaskModalMode
  onModeChange: (mode: TaskModalMode) => void
  className?: string
}

export function TaskModeSwitch({
  mode,
  onModeChange,
  className,
}: TaskModeSwitchProps) {
  const t = useTranslate()
  return (
    <ViewToggle<TaskModalMode>
      ariaLabel={t("task_modal.mode.group")}
      size="sm"
      value={mode}
      onChange={onModeChange}
      className={className}
      options={[
        {
          value: "central",
          ariaLabel: t("task_modal.mode.central"),
          icon: <CardsThree aria-hidden weight="bold" />,
        },
        {
          value: "drawer",
          ariaLabel: t("task_modal.mode.drawer"),
          icon: <SidebarSimple aria-hidden weight="bold" />,
        },
        {
          value: "full",
          ariaLabel: t("task_modal.mode.full"),
          icon: <FrameCorners aria-hidden weight="bold" />,
        },
      ]}
    />
  )
}
