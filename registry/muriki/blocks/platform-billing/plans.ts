/**
 * As contas puras dos cartões de plano (SeatPlanCards). Nenhuma mexe em preço cobrado: o preço vem
 * pronto da API, e o "a partir de" do Enterprise é só exibição (a mesma exceção do SeatsPreview, F12).
 */

export type SeatPlanPeriod = "monthly" | "yearly"

/** O selo de estado ao lado do nome: o teste vence o plano atual (no teste, o plano atual é o do teste). */
export type SeatPlanStatus = "trial" | "current" | null

export function seatPlanStatus(
  key: string,
  { currentPlan, trialPlan }: { currentPlan?: string | null; trialPlan?: string | null }
): SeatPlanStatus {
  if (trialPlan && trialPlan === key) return "trial"
  if (currentPlan && currentPlan === key) return "current"
  return null
}

/**
 * O piso do plano com mínimo de assentos ("a partir de R$ 490/mês" no Enterprise): mínimo × preço por
 * pessoa, em centavos. Só exibição; sem mínimo (ausente, 0, 1 ou não finito) ou sem preço, não há piso.
 */
export function seatPlanFloor(
  pricePerSeat: { monthly: number; yearly: number } | null,
  minSeats: number | null | undefined,
  period: SeatPlanPeriod
): number | null {
  if (!pricePerSeat || minSeats == null || !Number.isFinite(minSeats) || minSeats <= 1) return null
  return pricePerSeat[period] * minSeats
}
