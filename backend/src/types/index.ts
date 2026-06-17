export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Koper-risico-score: drukt verifieerbaarheid van de herkomstketen uit, geen schuld.
// BLAUW = 🔵 "Geverifieerde import" — een eigen label, geen kleur op de NL-schaal (§3a).
export type RiskScore = 'GROEN' | 'BLAUW' | 'ORANJE' | 'ROOD';

// Transparante, feitelijke onderbouwing van de score (geen schuld-taal).
export interface ScoreFactors {
  found: boolean;          // dier bekend in IDSee
  chainConfirmed: boolean; // er is een bevestigde (CONFIRMED) registratie
  breederVerified: boolean;// registrerende professional is geverifieerd
  motherKnown: boolean;    // moederdier (chip) bekend
  ubnPresent: boolean;     // UBN-houder van de moeder vastgelegd (§4)
  breederConfirmed: boolean;// UBN-houder bevestigde nest/moeder (dubbele bevestiging)
  disputed: boolean;       // een registratie is betwist (DISPUTED)
  imported: boolean;       // dier heeft een IMPORT-schakel (§3a)
  importVerified: boolean; // import-schakel volledig: traceerbare herkomst + arts-controle
}

export interface VerifyResult {
  chipId: string;
  riskScore: RiskScore;
  factors: ScoreFactors;
  registrationDate?: Date;
}

export interface CreditBundle {
  id: string;
  credits: number;
  price: number;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
  { id: 'starter', credits: 10, price: 9 },
  { id: 'professional', credits: 50, price: 40 },
  { id: 'enterprise', credits: 200, price: 140 },
];

export const CREDIT_COSTS = {
  REGISTER_ANIMAL: 1,
  REGISTER_NEST: 3,
  HEALTH_RECORD: 1,
  CHIP_LINK: 1,
} as const;
