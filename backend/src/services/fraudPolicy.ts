import type { UserFraudStatus } from './riskScore.js';

/**
 * Fraud cascade policy — PURE (no DB) so it is fully unit-testable.
 *
 * The flag is graduated and based on the VOLUME of vet-confirmed signals over a
 * window, not a single incident (PROPOSITION.md §4). Below the orange threshold
 * a user stays LEREN (green) — the "learning" margin for honest mistakes.
 */

export interface FraudThresholds {
  orange: number;
  red: number;
  block: number;
}

// Voorlopige defaults (PROPOSITION.md §9) — overschrijfbaar via SystemConfig.
export const DEFAULT_THRESHOLDS: FraudThresholds = {
  orange: 2,
  red: 4,
  block: 10,
};

export function assessFraudStatus(
  confirmedCount: number,
  thresholds: FraudThresholds = DEFAULT_THRESHOLDS,
  current: UserFraudStatus = 'LEREN'
): UserFraudStatus {
  // BLOKKADE is permanent — alleen handmatig op te heffen (buiten scope v1).
  if (current === 'BLOKKADE') return 'BLOKKADE';
  if (confirmedCount >= thresholds.block) return 'BLOKKADE';
  if (confirmedCount >= thresholds.red) return 'ROOD';
  if (confirmedCount >= thresholds.orange) return 'ORANJE';
  return 'LEREN';
}

const SEVERITY: Record<UserFraudStatus, number> = {
  LEREN: 0,
  ORANJE: 1,
  ROOD: 2,
  BLOKKADE: 3,
};

// Bij meerdere betrokken personen in een keten telt de zwaarste flag.
export function worstFraudStatus(statuses: UserFraudStatus[]): UserFraudStatus {
  return statuses.reduce<UserFraudStatus>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    'LEREN'
  );
}
