import type * as React from "react"

import type { RowAction } from "@/components/blocks/row-actions/row-actions"

export type { RowAction }

export interface ResourceColumn<T> {
  /** Chave estável; é também o que vai em `sort.columnId`. */
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Largura da coluna em CSS (`"120px"`, `"20%"`). Sem largura, divide o que sobra. */
  width?: string
  /** `end` para número e dinheiro: alinhado pela direita, dígitos tabulares. */
  align?: "start" | "end"
  /** Mostra o controle de ordenar no cabeçalho. Quem ordena é o caller. */
  sortable?: boolean
  /** Some abaixo desse breakpoint. A primeira coluna nunca some. */
  hideBelow?: "sm" | "md" | "lg"
}

export interface ResourceSort {
  columnId: string
  direction: "asc" | "desc"
}

/** Paginação por número: a API devolve o total e aceita pular de página. */
export interface ResourcePagePagination {
  mode?: "page"
  /** Começa em 1. */
  page: number
  pageSize: number
  /** Total de linhas no servidor, não só na página. */
  total: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

/**
 * Paginação por cursor: a API devolve `nextCursor` e nada de total. Sem
 * total não há "1–50 de 1.284" nem números de página — só anterior, próxima
 * e o tamanho. O caller guarda a pilha de cursores para poder voltar.
 */
export interface ResourceCursorPagination {
  mode: "cursor"
  pageSize: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  /** Número da página atual, só para o rótulo "Página N". Sem ele, o rótulo some. */
  page?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export type ResourcePagination = ResourcePagePagination | ResourceCursorPagination

export interface ResourceStatusTab {
  value: string
  label: string
  count?: number
}
