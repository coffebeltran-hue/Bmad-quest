/** Deterministic, shared rules for mission purchases and Party Mode decisions. */
export const MISSION_COSTS = [5, 13] as const;
export const PARTY_COSTS = [2, 8] as const;
export const EMERGENCY_GRANT = 20;
export const EMERGENCY_QUALITY_PENALTY = 7;

/** A purchase is only valid when the balance can cover its complete cost. */
export function canAfford(balance: number, cost: number): boolean {
  return Number.isFinite(balance) && Number.isFinite(cost) && cost >= 0 && balance >= cost;
}

/** Apply a credit delta. Return null rather than silently granting a free purchase. */
export function applyCreditDelta(balance: number, delta: number): number | null {
  if (!Number.isFinite(delta)) return null;
  const cost = Math.max(0, -delta);
  if (!canAfford(balance, cost)) return null;
  return Math.max(0, balance + delta);
}

/** Enable assistance only when the next action is unaffordable and not previously assisted. */
export function canRequestFunding(
  balance: number, minimumCost: number, checkpoint: string, used: readonly string[]
): boolean {
  return Number.isFinite(balance) && balance < minimumCost && !used.includes(checkpoint);
}

/**
 * Emergency short-term work brings in 20 credits, but costs 7 quality points.
 * Tracking by checkpoint prevents infinite grants on the same mission/debate.
 */
export function fundEmergency(
  budget: { credits: number; quality: number; fundingUsed: string[] },
  checkpoint: string,
  minimumCost: number
): { credits: number; quality: number; fundingUsed: string[] } | null {
  if (!canRequestFunding(budget.credits, minimumCost, checkpoint, budget.fundingUsed)) return null;
  return {
    credits: budget.credits + EMERGENCY_GRANT,
    quality: Math.max(0, budget.quality - EMERGENCY_QUALITY_PENALTY),
    fundingUsed: [...budget.fundingUsed, checkpoint]
  };
}
