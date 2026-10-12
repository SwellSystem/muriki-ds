/**
 * As contas puras da página de Cobrança (billing-overview). Nenhuma mexe em preço: o valor da próxima
 * cobrança vem pronto da API (F12). Aqui só se decide o desenho das duas barras (a dos assentos e a dos
 * dias do teste), o corte da grade das pessoas e a data segura, a partir dos números e das datas que a
 * API manda.
 */

export type SeatSegmentKind = "active" | "minimum" | "leaving" | "trial"

export interface SeatSegment {
  kind: SeatSegmentKind
  /** Quantos assentos o segmento representa: 1 na barra de um por assento; mais quando a barra agrupa. */
  weight: number
}

/** Acima disso, a barra deixa de ter um segmento por assento e vira um segmento por tipo, proporcional. */
export const SEAT_BAR_MAX_SEGMENTS = 40

// um número da API como contagem: negativo, fração ou não finito não quebra a barra nem a grade
const inteiro = (n: number) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)

/**
 * A barra dos assentos. Fora do teste, um segmento por assento pago: os pagos de quem continua, os do
 * mínimo do plano que passam dos ativos (`minSeats`, R24: a API cobra `max(ativos, min_seats)`) e, no
 * fim, os de quem sai na renovação (pagos − max(ativos, mínimo), hachurados). No teste ninguém paga: um
 * segmento por ativo. Com muitos assentos, os segmentos se juntam por tipo, com o peso de cada um.
 */
export function seatBarSegments(
  { active, paid, trial = false, minSeats }: { active: number; paid: number; trial?: boolean; minSeats?: number | null },
  max: number = SEAT_BAR_MAX_SEGMENTS
): SeatSegment[] {
  const ativos = inteiro(active)
  const pagos = inteiro(paid)
  // o piso cobrado: nunca abaixo dos ativos nem do mínimo do plano (ausente = 1, que os ativos já cobrem)
  const piso = Math.max(ativos, inteiro(minSeats ?? 0))
  const grupos: [SeatSegmentKind, number][] = trial
    ? [["trial", ativos]]
    : // quem sai continua pago até a renovação; quem entrou no meio já é cobrado (proporcional), então pagos ≥ ativos
      [
        ["active", Math.min(ativos, pagos)],
        ["minimum", Math.max(0, Math.min(pagos, piso) - ativos)],
        ["leaving", Math.max(0, pagos - piso)],
      ]
  const total = grupos.reduce((soma, [, n]) => soma + n, 0)
  if (total > max) return grupos.filter(([, n]) => n > 0).map(([kind, n]) => ({ kind, weight: n }))
  return grupos.flatMap(([kind, n]) => Array.from({ length: n }, () => ({ kind, weight: 1 })))
}

/**
 * A grade das pessoas, com corte em `max` células. O total sai dos ativos da API (`active`, mais quem
 * sai), não do tamanho da lista: o app pode passar só uma página de `people`. Quem sai (`leaving`)
 * sempre aparece antes do corte; os ativos ocupam as vagas que sobram, e o resto vira "mais N".
 */
export function seatGrid<P>(
  { people, leaving, active }: { people: P[]; leaving: P[]; active: number },
  max: number
): { people: P[]; leaving: P[]; more: number } {
  const total = Math.max(inteiro(active), people.length) + leaving.length
  const espaco = total > max ? max - 1 : max
  const visiveis = people.slice(0, Math.max(0, espaco - leaving.length))
  return { people: visiveis, leaving, more: total - visiveis.length - leaving.length }
}

/**
 * A data no Intl do idioma ("12 de nov." ou, com `year`, "12 de nov. de 2026"), ou `null` quando ela não
 * é uma data válida: quem chama esconde o trecho com a data, e a página não cai.
 */
export function formatBillingDate(
  value: string | Date | null | undefined,
  locale: string,
  { year = false }: { year?: boolean } = {}
): string | null {
  if (value === null || value === undefined || value === "") return null
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return null
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", ...(year ? { year: "numeric" } : null) }).format(d)
}

export type TrialDayKind = "past" | "today" | "left"

export interface TrialProgress {
  /** Os dias do teste (14). */
  total: number
  /** Os dias até o fim, contando de agora (o número grande); 0 quando acabou. */
  remaining: number
  /** Um por dia: os que passaram, o de hoje e os que faltam. */
  days: TrialDayKind[]
  /** O índice do dia de hoje na barra, ou `null` quando o teste já acabou. */
  todayIndex: number | null
}

const DIA = 24 * 60 * 60 * 1000

/**
 * A barra dos dias do teste, só para exibir: os dias que faltam saem do fim do teste (`endsAt`) e de
 * agora; o de hoje é o primeiro depois dos que passaram. Com 14 dias até o fim, hoje é o 1º da barra.
 */
export function trialProgress(endsAt: string | Date, now: string | Date, totalDays = 14): TrialProgress {
  const total = Number.isFinite(totalDays) && totalDays > 0 ? Math.floor(totalDays) : 14
  const fim = new Date(endsAt).getTime()
  const agora = new Date(now).getTime()
  const restam = Number.isFinite(fim) && Number.isFinite(agora) ? Math.ceil((fim - agora) / DIA) : 0
  const remaining = Math.min(total, Math.max(0, restam))
  const todayIndex = remaining > 0 ? total - remaining : null
  const days = Array.from({ length: total }, (_, i): TrialDayKind =>
    todayIndex === null || i < todayIndex ? "past" : i === todayIndex ? "today" : "left"
  )
  return { total, remaining, days, todayIndex }
}
