import { prisma } from '../db.js';
import { assessFraudStatus, assessCardStatus, CardStatus } from './fraudPolicy.js';
import { getThresholds, getCardThresholds } from './systemConfigService.js';
import { hashChipId } from './blockchain.js';
import type { UserFraudStatus } from './riskScore.js';

// Confirmed signals only count within this window (PROPOSITION.md §9 — parameter).
const REVIEW_WINDOW_DAYS = 365;

/**
 * File a fraud signal. The reporter is any authenticated user; the subject is
 * the professional whose chain is questioned. If only an animalId is given, the
 * subject is derived from that animal's registrant (keeps the reporter from
 * needing to know an otherwise-anonymous user id).
 */
export async function reportFraud(params: {
  reporterId?: string; // null/undefined for anonymous buyer signals
  source?: string; // PROFESSIONAL (default) | BUYER
  type: string;
  description: string;
  subjectUserId?: string;
  animalId?: string;
  chipId?: string;
}) {
  let subjectUserId = params.subjectUserId;
  let animalId = params.animalId;

  // Resolve the animal from a chip number so the reporter never needs an
  // internal id (keeps the registrant otherwise anonymous).
  if (!animalId && params.chipId) {
    const animal = await prisma.animal.findUnique({
      where: { chipIdHash: hashChipId(params.chipId) },
    });
    if (!animal) {
      throw new Error('Geen dier gevonden voor dit chipnummer');
    }
    animalId = animal.id;
  }

  if (!subjectUserId && animalId) {
    const reg = await prisma.registration.findFirst({
      where: { animalId },
      orderBy: { createdAt: 'desc' },
    });
    subjectUserId = reg?.userId;
  }

  if (!subjectUserId) {
    throw new Error('Kon de betrokken professional niet bepalen');
  }

  return prisma.fraudReport.create({
    data: {
      reporterId: params.reporterId ?? null,
      source: params.source ?? 'PROFESSIONAL',
      subjectUserId,
      animalId,
      type: params.type,
      description: params.description,
    },
  });
}

export async function getPendingReports() {
  return prisma.fraudReport.findMany({
    where: { status: 'PENDING_VET_REVIEW' },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Confirm a report. A SIGNAAL (default) escalates the fraud cascade; a FEIT is
 * recorded as a neutral verified observation that NEVER counts as an accusation
 * (PROPOSITION.md §9) — e.g. a legal passport conversion. Confirming a FEIT
 * therefore does not change the subject's fraud status.
 */
export async function confirmFraud(
  reportId: string,
  vetId: string,
  note?: string,
  category: 'SIGNAAL' | 'FEIT' = 'SIGNAAL'
) {
  const report = await prisma.fraudReport.findUnique({ where: { id: reportId } });
  if (!report || report.status !== 'PENDING_VET_REVIEW') {
    throw new Error('Melding niet gevonden of al beoordeeld');
  }

  await prisma.fraudReport.update({
    where: { id: reportId },
    data: {
      status: 'CONFIRMED',
      category,
      confirmedById: vetId,
      reviewNote: note,
      confirmationDate: new Date(),
    },
  });

  // Cascade: re-assess the subject. Only confirmed SIGNALS count — a FEIT leaves
  // the status unchanged. The risk score is derived per request, so updating the
  // user's fraudStatus automatically flows to all their animals.
  const newStatus = await assessUserFraudStatus(report.subjectUserId);
  return { reportId, subjectUserId: report.subjectUserId, category, newStatus };
}

export async function rejectFraud(reportId: string, vetId: string, note?: string) {
  const report = await prisma.fraudReport.findUnique({ where: { id: reportId } });
  if (!report || report.status !== 'PENDING_VET_REVIEW') {
    throw new Error('Melding niet gevonden of al beoordeeld');
  }

  await prisma.fraudReport.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      confirmedById: vetId,
      reviewNote: note,
      confirmationDate: new Date(),
    },
  });
  return { reportId };
}

/**
 * Recompute a user's fraud status from their confirmed signals in the window.
 * Returns the new status.
 */
export async function assessUserFraudStatus(userId: string): Promise<UserFraudStatus> {
  const since = new Date(Date.now() - REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const count = await prisma.fraudReport.count({
    where: {
      subjectUserId: userId,
      status: 'CONFIRMED',
      category: 'SIGNAAL', // FEIT-confirmations are neutral and never cascade (§9)
      confirmationDate: { gte: since },
    },
  });

  const thresholds = await getThresholds();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const current = (user?.fraudStatus as UserFraudStatus) ?? 'LEREN';
  const newStatus = assessFraudStatus(count, thresholds, current);

  await prisma.user.update({
    where: { id: userId },
    data: {
      fraudStatus: newStatus,
      lastFraudAssessment: new Date(),
      // A blocked professional is also suspended from registering.
      isSuspended: newStatus === 'BLOKKADE' ? true : user?.isSuspended ?? false,
    },
  });

  return newStatus;
}

/**
 * Record a verified discrepancy note on a professional (PROPOSITION.md §4).
 * Notes only ever come from an admin or a verified vet — never a bare buyer
 * complaint. Adding one re-assesses the professional's card status.
 */
export async function addProfessionalNote(params: {
  subjectUserId?: string;
  createdById: string;
  type: string;
  description: string;
  animalId?: string;
  chipId?: string;
}) {
  let subjectUserId = params.subjectUserId;
  let animalId = params.animalId;

  if (!animalId && params.chipId) {
    const animal = await prisma.animal.findUnique({
      where: { chipIdHash: hashChipId(params.chipId) },
    });
    if (!animal) {
      throw new Error('Geen dier gevonden voor dit chipnummer');
    }
    animalId = animal.id;
  }

  if (!subjectUserId && animalId) {
    const reg = await prisma.registration.findFirst({
      where: { animalId },
      orderBy: { createdAt: 'desc' },
    });
    subjectUserId = reg?.userId;
  }

  if (!subjectUserId) {
    throw new Error('Kon de betrokken professional niet bepalen');
  }

  const note = await prisma.professionalNote.create({
    data: {
      subjectUserId,
      createdById: params.createdById,
      type: params.type,
      description: params.description,
    },
  });

  const newCardStatus = await assessUserCardStatus(subjectUserId);
  return { note, subjectUserId, newCardStatus };
}

/**
 * Recompute a professional's card status from their total notes. Returns the
 * new card status. Unlike fraud signals, notes do not expire by default — a
 * pattern of discrepancies is cumulative (window can be added as a parameter).
 */
export async function assessUserCardStatus(userId: string): Promise<CardStatus> {
  const count = await prisma.professionalNote.count({
    where: { subjectUserId: userId },
  });

  const thresholds = await getCardThresholds();
  const newStatus = assessCardStatus(count, thresholds);

  await prisma.user.update({
    where: { id: userId },
    data: { cardStatus: newStatus, lastCardAssessment: new Date() },
  });

  return newStatus;
}
