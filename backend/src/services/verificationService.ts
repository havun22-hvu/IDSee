import { prisma } from '../db.js';
import type { ScoreFactors, VerifyResult } from '../types/index.js';
import { scoreFromFactors, UserFraudStatus } from './riskScore.js';
import { worstFraudStatus, worstCardStatus, CardStatus } from './fraudPolicy.js';

/**
 * Derive the buyer risk score for a chip (by its privacy hash).
 *
 * The score is DERIVED on each request, never stored — so a fraud-cascade
 * (fase 3) that changes an owner's status is reflected immediately without
 * touching animal rows.
 */
export async function calculateRiskScore(chipIdHash: string): Promise<VerifyResult> {
  const animal = await prisma.animal.findUnique({
    where: { chipIdHash },
    include: {
      registrations: {
        include: {
          user: { select: { verificationStatus: true, fraudStatus: true, cardStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const factors: ScoreFactors = {
    found: !!animal,
    chainConfirmed: false,
    breederVerified: false,
    motherKnown: !!animal?.motherChipHash,
    disputed: false,
  };

  let registrationDate: Date | undefined;
  // Cascade: take the worst fraud flag among the chain's registrants.
  let ownerFraudStatus: UserFraudStatus = 'LEREN';
  // Cascade: take the worst card (§4) among the chain's registrants.
  let ownerCardStatus: CardStatus = 'GEEN';

  if (animal) {
    const confirmed = animal.registrations.find((r) => r.status === 'CONFIRMED');
    factors.chainConfirmed = !!confirmed;
    factors.disputed = animal.registrations.some((r) => r.status === 'DISPUTED');
    factors.breederVerified = confirmed?.user?.verificationStatus === 'VERIFIED';
    registrationDate = confirmed?.createdAt ?? animal.registrations[0]?.createdAt;

    const flags = animal.registrations
      .map((r) => r.user?.fraudStatus as UserFraudStatus | undefined)
      .filter((s): s is UserFraudStatus => !!s);
    ownerFraudStatus = worstFraudStatus(flags.length ? flags : ['LEREN']);

    const cards = animal.registrations
      .map((r) => r.user?.cardStatus as CardStatus | undefined)
      .filter((s): s is CardStatus => !!s);
    ownerCardStatus = worstCardStatus(cards.length ? cards : ['GEEN']);
  }

  // chipId teruggeven we niet in plaintext bij niet-gevonden; bij gevonden is het al gehasht opgeslagen.
  return {
    chipId: '',
    riskScore: scoreFromFactors(factors, ownerFraudStatus, ownerCardStatus),
    factors,
    registrationDate,
  };
}
