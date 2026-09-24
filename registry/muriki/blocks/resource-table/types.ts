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

export interface ResourcePagination {
  /** Começa em 1. */
  page: number
  pageSize: number
  /** Total de linhas no servidor, não só na página. */
  total: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export interface ResourceStatusTab {
  value: string
  label: string
  count?: number
}
