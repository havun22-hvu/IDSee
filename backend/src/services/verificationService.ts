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
      importRecord: {
        include: {
          recordedBy: { select: { verificationStatus: true, fraudStatus: true, cardStatus: true } },
        },
      },
    },
  });

  const ir = animal?.importRecord;
  const factors: ScoreFactors = {
    found: !!animal,
    chainConfirmed: false,
    breederVerified: false,
    motherKnown: !!animal?.motherChipHash,
    disputed: false,
    imported: !!ir,
    // Import volledig & traceerbaar: arts zag papieren, land + traceerbare
    // herkomst-id bekend, bevestigd, en de arts is geverifieerd (§3a).
    importVerified:
      !!ir &&
      ir.status === 'CONFIRMED' &&
      ir.vetCheckedDocuments &&
      !!ir.countryOfOrigin &&
      !!ir.foreignOriginId &&
      ir.recordedBy?.verificationStatus === 'VERIFIED',
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

    // The import recorder counts as a chain participant too — their fraud/card
    // status cascades like any registrant's (§3a/§4).
    const flags = [
      ...animal.registrations.map((r) => r.user?.fraudStatus),
      ir?.recordedBy?.fraudStatus,
    ].filter((s): s is UserFraudStatus => !!s);
    ownerFraudStatus = worstFraudStatus(flags.length ? flags : ['LEREN']);

    const cards = [
      ...animal.registrations.map((r) => r.user?.cardStatus),
      ir?.recordedBy?.cardStatus,
    ].filter((s): s is CardStatus => !!s);
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
