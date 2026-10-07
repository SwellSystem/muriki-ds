/**
 * O exercício carregando, com o formato do ExerciseWorkspace: o cabeçalho (o voltar e a trilha, o
 * título, os chips e as duas ações), a coluna de 372px (460px no xl, 520px no 2xl) com o enunciado, a explicação e as dicas, e a
 * moldura do editor (a lateral de 248px com a árvore e os testes, as abas, as linhas numeradas e a
 * barra de status). Abaixo de lg, empilha como a tela. E a lição no painel lateral
 * (ExerciseLessonSkeleton), que abre a partir do exercício.
 *
 * A barra de cada linha mora numa caixa com a altura da linha real. Tudo é aria-hidden; o movimento
 * é o do Skeleton, parado com prefers-reduced-motion.
 */
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { CARTAO } from "./exercise-workspace"

function LinhaDeTexto({ h, className }: { h: number; className?: string }) {
  return (
    <span className="flex items-center" style={{ height: h }}>
      <Skeleton className={cn("h-[0.7em] min-h-2", className)} style={{ fontSize: h * 0.75 }} />
    </span>
  )
}

/** O cabeçalho de uma seção recolhível (38px, a seta e o rótulo mono). */
function CabecaDeSecao({ w = "w-24", fim }: { w?: string; fim?: boolean }) {
  return (
    <div className="flex h-[38px] shrink-0 items-center gap-2 pr-3 pl-3.5">
      <Skeleton className="size-3 rounded-[3px]" />
      <LinhaDeTexto h={14} className={w} />
      {fim ? <Skeleton className="ml-auto h-5 w-20 rounded-[4px]" /> : null}
    </div>
  )
}

export function ExerciseWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden data-slot="exercise-workspace-skeleton" className={cn("flex min-w-0 flex-col gap-[18px] lg:h-full lg:min-h-0", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <LinhaDeTexto h={28} className="w-72 max-w-full" />
          <span className="flex h-8 items-center md:h-[34px]">
            <Skeleton className="h-[0.7em] w-[min(520px,80%)]" style={{ fontSize: 26 }} />
          </span>
          <span className="flex flex-wrap gap-1.5">
            {["w-16", "w-20", "w-24", "w-24"].map((w, i) => (
              <Skeleton key={i} className={cn("h-[22px] rounded-[4px]", w)} />
            ))}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-40 rounded-[9px]" />
          <Skeleton className="h-9 w-36 rounded-[9px]" />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
        <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:w-[372px] lg:shrink-0 xl:w-[460px] 2xl:w-[520px]">
          <div className={cn(CARTAO, "flex flex-col lg:min-h-[160px] lg:flex-1")}>
            <CabecaDeSecao />
            <div className="flex flex-col gap-3 px-4 pb-4">
              <span className="flex flex-col">
                {["w-[96%]", "w-[90%]", "w-[60%]"].map((w, i) => (
                  <LinhaDeTexto key={i} h={22} className={w} />
                ))}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {["w-24", "w-24", "w-20", "w-32"].map((w, i) => (
                  <Skeleton key={i} className={cn("h-6 rounded-[5px]", w)} />
                ))}
              </span>
              <span className="flex flex-col">
                <LinhaDeTexto h={18} className="w-40" />
                {["w-[88%]", "w-[76%]", "w-[82%]", "w-[58%]"].map((w, i) => (
                  <LinhaDeTexto key={i} h={20} className={w} />
                ))}
              </span>
            </div>
          </div>
          <div className={cn(CARTAO, "flex flex-col")}>
            <CabecaDeSecao w="w-32" fim />
            <div className="flex flex-col gap-2.5 px-4 pb-4">
              <span className="flex flex-col">
                <LinhaDeTexto h={21} className="w-[85%]" />
                <LinhaDeTexto h={21} className="w-[40%]" />
              </span>
              <Skeleton className="h-[92px] w-full rounded-[8px]" />
              <LinhaDeTexto h={16} className="w-[60%]" />
            </div>
          </div>
          <div className={cn(CARTAO, "flex flex-col")}>
            <CabecaDeSecao w="w-16" />
            <div className="flex items-center gap-2.5 pr-3 pb-3 pl-4">
              <Skeleton className="size-4 rounded-full" />
              <span className="min-w-0 flex-1">
                <LinhaDeTexto h={20} className="w-32" />
              </span>
              <Skeleton className="h-8 w-28 rounded-[8px]" />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-card shadow-xs lg:flex-1 lg:flex-row">
          <div className="flex shrink-0 flex-col border-muted bg-rail max-lg:border-b lg:w-[248px] lg:border-r">
            <CabecaDeSecao w="w-16" />
            <div className="flex flex-col gap-0.5 px-2 pb-2">
              {[0, 1, 2, 2, 1, 2, 1].map((nivel, i) => (
                <span key={i} className="flex h-7 items-center gap-2" style={{ paddingLeft: 8 + nivel * 12 }}>
                  <Skeleton className="size-3.5 rounded-[3px]" />
                  <Skeleton className={cn("h-2.5", ["w-28", "w-12", "w-32", "w-24", "w-14", "w-36", "w-24"][i])} />
                </span>
              ))}
            </div>
            <div className="border-t border-muted">
              <CabecaDeSecao w="w-14" fim />
              <div className="flex flex-col gap-px px-1.5 pb-2.5">
                {["w-[70%]", "w-[60%]", "w-[66%]", "w-[52%]", "w-[74%]"].map((w, i) => (
                  <span key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="size-3 rounded-full" />
                    <span className="min-w-0 flex-1">
                      <LinhaDeTexto h={17} className={w} />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex min-h-[420px] min-w-0 flex-1 flex-col">
            <div className="flex h-10 shrink-0 items-center gap-3 border-b border-muted pr-2 pl-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="ml-auto h-7 w-32 rounded-[7px]" />
            </div>
            <div className="flex flex-1 flex-col py-3.5">
              {["w-[46%]", "", "w-[58%]", "", "w-[72%]", "w-[64%]", "w-[30%]", "w-[54%]", "w-[60%]", "w-[8%]", "w-[40%]", "w-[6%]"].map((w, i) => (
                <span key={i} className="flex h-6 items-center">
                  <span className="flex w-12 shrink-0 justify-end pr-4">
                    <Skeleton className="h-2.5 w-3.5" />
                  </span>
                  {w ? <Skeleton className={cn("h-2.5", w)} /> : null}
                </span>
              ))}
            </div>
            <div className="flex h-[30px] shrink-0 items-center gap-3.5 border-t border-muted px-4">
              <Skeleton className="h-2.5 w-36" />
              <Skeleton className="h-2.5 w-24 max-sm:hidden" />
              <Skeleton className="ml-auto h-2.5 w-48 max-md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A lição no painel lateral, carregando: o título, os parágrafos e um bloco de código. Vai no SheetBody. */
export function ExerciseLessonSkeleton({ className }: { className?: string }) {
  const paragrafo = (linhas: string[]) => (
    <span className="flex flex-col">
      {linhas.map((w, i) => (
        <LinhaDeTexto key={i} h={22} className={w} />
      ))}
    </span>
  )
  return (
    <div aria-hidden data-slot="exercise-lesson-skeleton" className={cn("flex flex-col gap-4", className)}>
      {paragrafo(["w-[96%]", "w-[92%]", "w-[88%]", "w-[44%]"])}
      <LinhaDeTexto h={24} className="w-40" />
      {paragrafo(["w-[94%]", "w-[86%]", "w-[60%]"])}
      <Skeleton className="h-[104px] w-full rounded-lg" />
      {paragrafo(["w-[90%]", "w-[96%]", "w-[52%]"])}
      <Skeleton className="h-[80px] w-full rounded-lg" />
    </div>
  )
}
