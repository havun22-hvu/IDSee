import { prisma } from '../index.js';
import type { ScoreFactors, VerifyResult } from '../types/index.js';
import { scoreFromFactors, UserFraudStatus } from './riskScore.js';

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
          user: { select: { verificationStatus: true } },
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
  // Fase 3 haak: leid de fraudestatus van de registrant af (nu nog niet aanwezig → LEREN).
  const ownerFraudStatus: UserFraudStatus = 'LEREN';

  if (animal) {
    const confirmed = animal.registrations.find((r) => r.status === 'CONFIRMED');
    factors.chainConfirmed = !!confirmed;
    factors.disputed = animal.registrations.some((r) => r.status === 'DISPUTED');
    factors.breederVerified = confirmed?.user?.verificationStatus === 'VERIFIED';
    registrationDate = confirmed?.createdAt ?? animal.registrations[0]?.createdAt;
  }

  // chipId teruggeven we niet in plaintext bij niet-gevonden; bij gevonden is het al gehasht opgeslagen.
  return {
    chipId: '',
    riskScore: scoreFromFactors(factors, ownerFraudStatus),
    factors,
    registrationDate,
  };
}
