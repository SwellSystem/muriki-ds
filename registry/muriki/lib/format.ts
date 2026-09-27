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
  const partes = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: options.timeZone,
  }).formatToParts(new Date(date))

  const temPalavra = partes.some((p) => p.type === "literal" && /\p{L}/u.test(p.value))
  if (!temPalavra) return partes.map((p) => p.value).join("")

  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ""
  return `${parte("day")} ${parte("month").replace(/\.$/, "")} ${parte("year")}`
}
