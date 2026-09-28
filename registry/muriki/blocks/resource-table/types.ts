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
  hideBelow?: "sm" | "md" | "lg" | "xl" | "2xl"
  /**
   * O papel da coluna quando a tabela vira cartões (tela abaixo de md, ou
   * contêiner com menos de 28rem). `title` é a linha de cima (avatar, nome, e-mail ou
   * código); `subtitle` vai logo embaixo, em tom apagado; `meta` entra na
   * linha de fatos como "Rótulo valor"; `status` fica na linha do título, à
   * direita (o selo ao lado do código ou do valor); `footer` fica no pé do
   * cartão (features, um "Editar"); `hidden` some. Sem isto, a primeira
   * coluna é `title` e as outras são `meta`.
   */
  mobile?: "title" | "subtitle" | "meta" | "status" | "footer" | "hidden"
  /** O rótulo na linha de fatos do cartão. Sem ele, vai o `header`. */
  mobileLabel?: React.ReactNode
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
