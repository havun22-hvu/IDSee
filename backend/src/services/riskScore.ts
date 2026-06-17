import type { RiskScore, ScoreFactors } from '../types/index.js';
import type { CardStatus } from './fraudPolicy.js';

/**
 * Risk score logic — PURE (no DB, no side effects) so it is fully unit-testable.
 *
 * The score expresses how well the origin chain can be VERIFIED, not guilt
 * (zie PROPOSITION.md §3/§4). Owner fraud status (B-track fase 3) feeds in as a
 * parameter; defaults to LEREN so fase 1 works before the fraud model exists.
 * The card status of the confirming professional (§4) feeds in the same way:
 * a yellow/red card means their confirmation can no longer carry the chain to
 * GROEN — verifiability via this person is weakened, not a guilt verdict.
 */

export type UserFraudStatus = 'LEREN' | 'ORANJE' | 'ROOD' | 'BLOKKADE';

export function scoreFromFactors(
  f: ScoreFactors,
  ownerFraudStatus: UserFraudStatus = 'LEREN',
  ownerCardStatus: CardStatus = 'GEEN'
): RiskScore {
  // Harde negatieve signalen → ROOD (keten sluit aantoonbaar niet). Geldt ook
  // voor import: een importeur in een bevestigd fraudepatroon (volume) → ROOD (§3a).
  if (ownerFraudStatus === 'ROOD' || ownerFraudStatus === 'BLOKKADE') return 'ROOD';
  if (f.found && f.disputed) return 'ROOD';

  if (!f.found) return 'ORANJE'; // dier onbekend in IDSee — afwezigheid ≠ fout

  // Geïmporteerd dier: gescoord op de IMPORT-schakel, NIET op een (buitenlandse)
  // NL-moeder. Een naïeve "geen NL-moeder = oranje/rood" zou de eerlijke importeur
  // straffen — dat mag niet (§3a). Een volledige, traceerbare import → 🔵 BLAUW.
  if (f.imported) {
    if (ownerFraudStatus === 'ORANJE') return 'ORANJE';
    if (ownerCardStatus === 'GEEL' || ownerCardStatus === 'ROOD') return 'ORANJE';
    // Herkomst onbekend / paspoort omgezet zonder traceerbare bron → ORANJE.
    return f.importVerified ? 'BLAUW' : 'ORANJE';
  }

  // NL-claim zonder bekende moeder: de keten sluit aantoonbaar niet → ROOD (§3/§4).
  if (!f.motherKnown) return 'ROOD';

  // NL-keten met moeder, maar een zwakke/ontbrekende schakel → ORANJE
  if (!f.chainConfirmed) return 'ORANJE';
  if (!f.breederVerified) return 'ORANJE';
  if (!f.ubnPresent) return 'ORANJE';        // geen UBN-houder vastgelegd
  if (!f.breederConfirmed) return 'ORANJE';  // UBN-houder bevestigde nog niet
  if (ownerFraudStatus === 'ORANJE') return 'ORANJE';
  // Gele/rode kaart op de bevestigende professional: bevestiging weegt te licht
  // om de keten naar GROEN te dragen (§4).
  if (ownerCardStatus === 'GEEL' || ownerCardStatus === 'ROOD') return 'ORANJE';

  // Volledige, sluitende NL-keten (moeder + UBN + houder-bevestiging + geverifieerde arts) → GROEN
  return 'GROEN';
}
