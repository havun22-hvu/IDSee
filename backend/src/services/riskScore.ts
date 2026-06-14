import type { RiskScore, ScoreFactors } from '../types/index.js';

/**
 * Risk score logic — PURE (no DB, no side effects) so it is fully unit-testable.
 *
 * The score expresses how well the origin chain can be VERIFIED, not guilt
 * (zie PROPOSITION.md §3/§4). Owner fraud status (B-track fase 3) feeds in as a
 * parameter; defaults to LEREN so fase 1 works before the fraud model exists.
 */

export type UserFraudStatus = 'LEREN' | 'ORANJE' | 'ROOD' | 'BLOKKADE';

export function scoreFromFactors(
  f: ScoreFactors,
  ownerFraudStatus: UserFraudStatus = 'LEREN'
): RiskScore {
  // Harde negatieve signalen → ROOD (keten sluit aantoonbaar niet)
  if (ownerFraudStatus === 'ROOD' || ownerFraudStatus === 'BLOKKADE') return 'ROOD';
  if (f.found && f.disputed) return 'ROOD';

  // Onbekend of zwakke schakel → ORANJE (verifieerbaarheid onvolledig)
  if (!f.found) return 'ORANJE';
  if (!f.chainConfirmed) return 'ORANJE';
  if (!f.breederVerified || !f.motherKnown) return 'ORANJE';
  if (ownerFraudStatus === 'ORANJE') return 'ORANJE';

  // Volledige, sluitende keten → GROEN
  return 'GROEN';
}
