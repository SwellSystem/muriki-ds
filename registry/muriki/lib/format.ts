// Formatos de data e número que Code e Backoffice mostram iguais.
//
// O i18n do DS não guarda o idioma (o app injeta só o `t`), então o locale chega por parâmetro:
// no app, o mesmo do i18next (i18n.language).

type DataDeEntrada = Date | string | number

/**
 * A data curta dos desenhos: "31 dez 2026" em pt-BR, "31 dic 2026" em es, "Dec 31, 2026" em en.
 *
 * O Intl dá "31 de dez. de 2026" em pt-BR; aqui saem o "de" e o ponto do mês. Nos idiomas em que
 * o Intl já não põe palavra entre as partes (en, es), a ordem e a pontuação dele ficam.
 */
export function formatShortDate(
  date: DataDeEntrada,
  locale: string,
  options: { timeZone?: string } = {}
): string {
  return dataCurta(date, locale, options.timeZone, true)
}

/**
 * Data e hora curtas, sem o ano, para o que aconteceu há pouco: "23 set, 11:20" em pt-BR,
 * "Sep 23, 11:20 AM" em en, "23 sept, 11:20" em es. A data segue a regra da data curta, a hora é
 * a do Intl, e as duas se juntam com vírgula no lugar do "às" / "at".
 */
export function formatShortDateTime(
  date: DataDeEntrada,
  locale: string,
  options: { timeZone?: string } = {}
): string {
  // relógio de 24 horas com dois dígitos ("09:40"); no de 12, sem o zero ("9:40 AM")
  const ciclo = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle
  const hora = new Intl.DateTimeFormat(locale, {
    hour: ciclo === "h11" || ciclo === "h12" ? "numeric" : "2-digit",
    minute: "2-digit",
    timeZone: options.timeZone,
  }).format(new Date(date))
  return `${dataCurta(date, locale, options.timeZone, false)}, ${hora}`
}

function dataCurta(date: DataDeEntrada, locale: string, timeZone: string | undefined, comAno: boolean) {
  const partes = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: comAno ? "numeric" : undefined,
    timeZone,
  }).formatToParts(new Date(date))

  const temPalavra = partes.some((p) => p.type === "literal" && /\p{L}/u.test(p.value))
  if (!temPalavra) return partes.map((p) => p.value).join("")

  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ""
  const dia = `${parte("day")} ${parte("month").replace(/\.$/, "")}`
  return comAno ? `${dia} ${parte("year")}` : dia
}
