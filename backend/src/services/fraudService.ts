import { prisma } from '../index.js';
import { assessFraudStatus } from './fraudPolicy.js';
import { getThresholds } from './systemConfigService.js';
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
  reporterId: string;
  type: string;
  description: string;
  subjectUserId?: string;
  animalId?: string;
}) {
  let subjectUserId = params.subjectUserId;

  if (!subjectUserId && params.animalId) {
    const reg = await prisma.registration.findFirst({
      where: { animalId: params.animalId },
      orderBy: { createdAt: 'desc' },
    });
    subjectUserId = reg?.userId;
  }

  if (!subjectUserId) {
    throw new Error('Kon de betrokken professional niet bepalen');
  }

  return prisma.fraudReport.create({
    data: {
      reporterId: params.reporterId,
      subjectUserId,
      animalId: params.animalId,
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

export async function confirmFraud(reportId: string, vetId: string, note?: string) {
  const report = await prisma.fraudReport.findUnique({ where: { id: reportId } });
  if (!report || report.status !== 'PENDING_VET_REVIEW') {
    throw new Error('Melding niet gevonden of al beoordeeld');
  }

  await prisma.fraudReport.update({
    where: { id: reportId },
    data: {
      status: 'CONFIRMED',
      confirmedById: vetId,
      reviewNote: note,
      confirmationDate: new Date(),
    },
  });

  // Cascade: re-assess the subject. The risk score is derived per request, so
  // updating the user's fraudStatus automatically flows to all their animals.
  const newStatus = await assessUserFraudStatus(report.subjectUserId);
  return { reportId, subjectUserId: report.subjectUserId, newStatus };
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
