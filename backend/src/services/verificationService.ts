import { prisma } from '../db.js';
import type { ScoreFactors, VerifyResult, UbnVolume } from '../types/index.js';
import { scoreFromFactors, UserFraudStatus } from './riskScore.js';
import { worstFraudStatus, worstCardStatus, CardStatus } from './fraudPolicy.js';

const VOLUME_WINDOW_DAYS = 365;

/**
 * Objectief volume per UBN (PROPOSITION.md §4a): pups + verschillende moeders in
 * de laatste 12 mnd. Geen norm-toetsing, geen oordeel — puur het getal.
 */
export async function getUbnVolume(breederUbn: string): Promise<UbnVolume> {
  const since = new Date(Date.now() - VOLUME_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const regs = await prisma.registration.findMany({
    where: { breederUbn, createdAt: { gte: since } },
    select: { animal: { select: { motherChipHash: true } } },
  });
  const dams = new Set(regs.map((r) => r.animal?.motherChipHash).filter(Boolean));
  return { pupCount: regs.length, damCount: dams.size };
}

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
    ubnPresent: false,
    breederConfirmed: false,
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
  let breederUbn: string | null = null;
  let breederUserId: string | null = null;

  if (animal) {
    const confirmed = animal.registrations.find((r) => r.status === 'CONFIRMED');
    breederUbn = confirmed?.breederUbn ?? null;
    breederUserId = confirmed?.breederUserId ?? null;
    factors.chainConfirmed = !!confirmed;
    factors.disputed = animal.registrations.some((r) => r.status === 'DISPUTED');
    factors.breederVerified = confirmed?.user?.verificationStatus === 'VERIFIED';
    factors.ubnPresent = !!confirmed?.breederUbn;        // UBN-houder van de moeder vastgelegd
    factors.breederConfirmed = !!confirmed?.breederConfirmed; // UBN-houder bevestigde nest/moeder
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

  // Volume als objectief feit (§4a) — alleen voor een UBN-houder die vrijwillig
  // meedoet en toestemming gaf (AVG-grond).
  let ubnVolume: UbnVolume | undefined;
  if (breederUbn && breederUserId) {
    const breeder = await prisma.user.findUnique({
      where: { id: breederUserId },
      select: { idseeConsent: true },
    });
    if (breeder?.idseeConsent) {
      ubnVolume = await getUbnVolume(breederUbn);
    }
  }

  // chipId teruggeven we niet in plaintext bij niet-gevonden; bij gevonden is het al gehasht opgeslagen.
  return {
    chipId: '',
    riskScore: scoreFromFactors(factors, ownerFraudStatus, ownerCardStatus),
    factors,
    registrationDate,
    ubnVolume,
  };
}
