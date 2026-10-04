/**
 * Muriki screen skeletons — o carregamento com o formato das telas que o Code monta com as próprias
 * peças: Início (o primeiro dia), Trilhas, uma trilha e o catálogo de exercícios.
 *
 * Cada um copia as colunas, as quebras por largura (sm, md, lg, xl) e as alturas da tela carregada
 * do app (muriki-code-platform: features/home/first-day, features/tracks/tracks-screen e
 * track-screen, features/exercises/exercises-screen), para nada pular quando os dados chegam. As
 * peças do DS que aparecem nessas telas trazem o próprio esqueleto ao lado delas (LevelProfile,
 * TrackProgress e as da Evolução).
 *
 * A barra de cada linha de texto mora numa caixa com a altura da linha real; larguras variadas leem
 * como texto. O movimento é o do Skeleton: uma varredura só na página, parada com
 * prefers-reduced-motion. Tudo é `aria-hidden`: o app anuncia o carregamento (aria-busy na região).
 */
import type * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Uma linha de texto carregando: a caixa tem a altura da linha real; a barra, a da letra. */
function LinhaDeTexto({ h, className }: { h: number; className?: string }) {
  return (
    <span className="flex items-center" style={{ height: h }}>
      <Skeleton className={cn("h-[0.7em] min-h-2", className)} style={{ fontSize: h * 0.75 }} />
    </span>
  )
}

/** O cartão padrão das telas do Code. */
function Cartao({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex min-w-0 flex-col rounded-xl bg-card shadow-sm", className)}>{children}</div>
}

/** O rótulo mono das seções (CAPTION: 10px, caixa alta). */
function Rotulo({ className }: { className?: string }) {
  return <LinhaDeTexto h={15} className={cn("w-28", className)} />
}

function Cabecalho({ sub = true, fixo = false, voltar = false }: { sub?: boolean; fixo?: boolean; voltar?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {voltar ? <LinhaDeTexto h={28} className="w-24" /> : null}
      <span className={cn("block", fixo ? "h-[34px]" : "h-[30px] md:h-[34px]")}>
        <span className="flex h-full items-center">
          <Skeleton className="h-[0.7em] w-[min(320px,70%)]" style={{ fontSize: 34 * 0.75 }} />
        </span>
      </span>
      {sub ? <LinhaDeTexto h={20} className="w-[min(560px,90%)]" /> : null}
    </div>
  )
}

// ── Início (o primeiro dia) ─────────────────────────────────────────────────

/** O Início carregando: o próximo passo, "O que você nos contou", a grade do Code, a competência e o Playground. */
export function FirstDaySkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden data-slot="first-day-skeleton" className={cn("flex flex-col gap-[22px]", className)}>
      <Cabecalho fixo />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <Cartao className="gap-4 px-6 py-[22px] lg:flex-[1.6]">
          <Rotulo />
          <div className="flex flex-col gap-2">
            <LinhaDeTexto h={28} className="w-[60%]" />
            <LinhaDeTexto h={20} className="w-[92%]" />
            <LinhaDeTexto h={20} className="w-[48%]" />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Skeleton className="h-11 w-44 rounded-[11px]" />
            <Skeleton className="h-11 w-32 rounded-[11px]" />
          </div>
        </Cartao>
        <Cartao className="gap-3.5 px-[22px] py-[18px] lg:flex-1">
          <div className="flex items-center justify-between">
            <Rotulo className="w-36" />
            <LinhaDeTexto h={16} className="w-12" />
          </div>
          {[
            ["w-16", "w-20", "w-24"],
            ["w-20", "w-14", "w-[72px]", "w-16"],
            ["w-28", "w-24"],
          ].map((chips, g) => (
            <div key={g} className="flex flex-col gap-1.5">
              <LinhaDeTexto h={14} className="w-20" />
              <div className="flex flex-wrap gap-1.5">
                {chips.map((w, i) => (
                  <Skeleton key={i} className={cn("h-6 rounded-full", w)} />
                ))}
              </div>
            </div>
          ))}
        </Cartao>
      </div>
      <div className="flex flex-col gap-3">
        <Rotulo className="w-32" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Cartao key={i} className="gap-2 p-4">
              <span className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-[4px]" />
                <LinhaDeTexto h={20} className={["w-20", "w-24", "w-16", "w-28", "w-20"][i]} />
              </span>
              <span className="flex flex-col">
                <LinhaDeTexto h={18} className="w-[94%]" />
                <LinhaDeTexto h={18} className="w-[86%]" />
                <LinhaDeTexto h={18} className="w-[40%]" />
              </span>
              <span className="flex min-h-6 items-center">
                <Skeleton className="h-3 w-12" />
              </span>
            </Cartao>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <Cartao className="gap-2.5 px-[22px] py-4 lg:flex-[1.6]">
          <Rotulo />
          <span className="flex items-center gap-3">
            <span className="flex gap-[3px]">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-1.5 w-[18px] rounded-[2px]" />
              ))}
            </span>
            <span className="min-w-0 flex-1">
              <LinhaDeTexto h={19} className="w-[70%]" />
            </span>
          </span>
        </Cartao>
        <Cartao className="gap-2.5 px-[22px] py-4 lg:flex-1">
          <span className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-[4px]" />
            <LinhaDeTexto h={20} className="w-24" />
            <span className="ml-auto flex gap-1.5">
              <Skeleton className="h-[22px] w-10 rounded-[4px]" />
              <Skeleton className="h-[22px] w-10 rounded-[4px]" />
            </span>
          </span>
          <span className="flex flex-col">
            <LinhaDeTexto h={19} className="w-[92%]" />
            <LinhaDeTexto h={19} className="w-[50%]" />
          </span>
          <Skeleton className="h-8 w-32 rounded-[8px]" />
        </Cartao>
      </div>
    </div>
  )
}

// ── Trilhas ─────────────────────────────────────────────────────────────────

export type TrackCardKind = "track" | "locked" | "soon"

export interface TracksSkeletonProps {
  /** Os cartões da grade, na ordem. Padrão: duas trilhas, uma bloqueada e duas em breve. */
  cards?: TrackCardKind[]
  className?: string
}

/** Trilhas carregando: o cartão de continuar com o minimapa e a grade de trilhas (normal, bloqueada, em breve). */
export function TracksSkeleton({ cards = ["track", "track", "locked", "soon", "soon"], className }: TracksSkeletonProps) {
  return (
    <div aria-hidden data-slot="tracks-skeleton" className={cn("flex flex-col gap-5", className)}>
      <Cabecalho />
      <Cartao className="gap-3 px-4 py-[18px] md:px-6 md:py-5">
        <div className="flex items-center justify-between">
          <Rotulo />
          <Skeleton className="h-[22px] w-24 rounded-[4px]" />
        </div>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-7 lg:gap-y-4">
          <div className="flex flex-col gap-1">
            <LinhaDeTexto h={20} className="w-36" />
            <span className="block h-[26px] md:h-7">
              <span className="flex h-full items-center">
                <Skeleton className="h-[0.7em] w-[70%]" style={{ fontSize: 21 }} />
              </span>
            </span>
            <LinhaDeTexto h={20} className="w-[44%]" />
          </div>
          {/* o minimapa: 420 × 140, 3:1 */}
          <div className="flex w-full flex-col gap-1 rounded-xl bg-sidebar px-3.5 pt-3 pb-1.5 lg:row-span-2 lg:w-[440px]">
            <div className="flex items-center justify-between">
              <LinhaDeTexto h={14} className="w-24" />
              <LinhaDeTexto h={14} className="w-8" />
            </div>
            <Skeleton className="aspect-[3/1] w-full rounded-lg" />
          </div>
          <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center">
            <Skeleton className="h-11 w-full rounded-[11px] lg:w-44" />
            <span className="flex items-center gap-2.5 lg:w-[200px]">
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <LinhaDeTexto h={16} className="w-8" />
            </span>
          </div>
        </div>
      </Cartao>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((tipo, i) => (
          <Cartao key={i} className="gap-2.5 px-5 py-[18px]">
            <span className="flex items-center gap-2">
              <Skeleton className="h-[22px] w-24 rounded-[4px]" />
              {tipo !== "track" ? <Skeleton className="ml-auto h-[22px] w-20 rounded-[4px]" /> : null}
            </span>
            <LinhaDeTexto h={24} className={["w-[64%]", "w-[52%]", "w-[72%]"][i % 3]} />
            <span className="flex flex-col">
              <LinhaDeTexto h={19} className="w-[94%]" />
              <LinhaDeTexto h={19} className="w-[56%]" />
            </span>
            {tipo === "locked" ? (
              <span className="flex flex-col gap-2 rounded-[10px] bg-sunken px-3.5 py-3">
                <LinhaDeTexto h={18} className="w-[70%]" />
                <LinhaDeTexto h={16} className="w-[85%]" />
              </span>
            ) : null}
            {tipo === "soon" ? null : (
              <span className="mt-auto flex justify-end pt-1">
                <LinhaDeTexto h={20} className="w-20" />
              </span>
            )}
          </Cartao>
        ))}
      </div>
    </div>
  )
}

// ── Uma trilha ──────────────────────────────────────────────────────────────

export interface TrackSkeletonProps {
  /** Quantas competências na lista de níveis. Padrão: 4. */
  levels?: number
  className?: string
}

/**
 * Uma trilha carregando: o voltar e o título, o cartão do caminho com o mapa (440px no largo, em pé
 * no celular), o "agora" e os níveis. No celular o "agora" vem primeiro, como na tela.
 */
export function TrackSkeleton({ levels = 4, className }: TrackSkeletonProps) {
  return (
    <div aria-hidden data-slot="track-skeleton" className={cn("flex flex-col gap-5", className)}>
      <Cabecalho voltar sub={false} />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <Cartao className="order-2 px-4 pt-4 pb-3 md:px-[22px] md:pt-[18px] md:pb-2.5 lg:order-none lg:col-span-2">
          <div className="flex flex-col gap-2.5 pb-3 md:flex-row md:items-center md:justify-between">
            <Rotulo />
            <Skeleton className="h-8 w-full rounded-full md:w-44" />
          </div>
          <Skeleton className="h-[560px] w-full rounded-lg md:h-[440px]" />
        </Cartao>
        <Cartao className="order-1 gap-2 px-4 py-4 md:px-[22px] lg:order-none">
          <Rotulo className="w-16" />
          <LinhaDeTexto h={24} className="w-[60%]" />
          <LinhaDeTexto h={19} className="w-[80%]" />
          <Skeleton className="mt-1 h-11 w-full rounded-[11px] md:w-44" />
        </Cartao>
        <Cartao className="order-3 gap-2.5 px-[22px] py-[18px] lg:order-none">
          <Rotulo className="w-20" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2.5">
            {Array.from({ length: levels }, (_, i) => (
              <div key={i} className="contents">
                <LinhaDeTexto h={20} className={["w-[70%]", "w-[54%]", "w-[62%]", "w-[46%]"][i % 4]} />
                <span className="flex gap-[3px]">
                  {[0, 1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-1.5 w-[18px] rounded-[2px]" />
                  ))}
                </span>
                <LinhaDeTexto h={20} className="w-14" />
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  )
}

// ── Catálogo de exercícios ──────────────────────────────────────────────────

const COLUNAS_DO_CATALOGO = "md:grid md:grid-cols-[minmax(0,1fr)_110px_130px_196px] md:items-center md:gap-3.5"

/** O catálogo carregando: a busca, os filtros, as abas e as linhas (cartões no celular, uma tabela no md). */
export function ExerciseCatalogSkeleton({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden data-slot="exercise-catalog-skeleton" className={cn("flex flex-col gap-[18px]", className)}>
      <Cabecalho />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        <Skeleton className="h-10 w-full rounded-[8px] md:h-8 md:w-[300px]" />
        <div className="flex gap-2">
          {["w-24", "w-28", "w-20"].map((w, i) => (
            <Skeleton key={i} className={cn("h-8 rounded-full", w)} />
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {["w-24", "w-28", "w-20"].map((w, i) => (
          <Skeleton key={i} className={cn("h-8 rounded-[8px]", w)} />
        ))}
      </div>
      <div className="flex flex-col gap-3 md:gap-0 md:overflow-hidden md:rounded-xl md:bg-card md:shadow-sm">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-2 rounded-[14px] bg-card px-4 py-3.5 shadow-sm md:min-h-14 md:rounded-none md:px-[18px] md:py-2 md:shadow-none",
              COLUNAS_DO_CATALOGO,
              i > 0 && "md:border-t md:border-muted"
            )}
          >
            <span className="flex flex-col">
              <LinhaDeTexto h={22} className={["w-[64%]", "w-[50%]", "w-[72%]", "w-[44%]"][i % 4]} />
              <LinhaDeTexto h={16} className="w-[36%]" />
            </span>
            {/* no celular, o selo vem antes do nível; no md, a ordem da tabela */}
            <span className="max-md:order-3">
              <LinhaDeTexto h={18} className="w-16" />
            </span>
            <Skeleton className="h-[22px] w-24 rounded-[4px] max-md:order-2" />
            <span className="flex items-center justify-between border-t border-muted pt-2.5 max-md:order-4 md:border-t-0 md:pt-0">
              <Skeleton className="h-[22px] w-20 rounded-[4px]" />
              <LinhaDeTexto h={20} className="w-16" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
