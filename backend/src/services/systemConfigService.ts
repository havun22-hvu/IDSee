import { prisma } from '../db.js';
import {
  DEFAULT_THRESHOLDS,
  FraudThresholds,
  DEFAULT_CARD_THRESHOLDS,
  CardThresholds,
} from './fraudPolicy.js';

/**
 * Reads cascade thresholds from SystemConfig, falling back to code defaults so
 * the system works without seeding. Keys:
 *   fraud_orange_threshold, fraud_red_threshold, fraud_block_threshold
 */
export async function getThresholds(): Promise<FraudThresholds> {
  const keys = ['fraud_orange_threshold', 'fraud_red_threshold', 'fraud_block_threshold'];
  const rows = await prisma.systemConfig.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, parseInt(r.value, 10)]));

  const pick = (key: string, fallback: number) => {
    const v = map.get(key);
    return v !== undefined && !Number.isNaN(v) ? v : fallback;
  };

  return {
    orange: pick('fraud_orange_threshold', DEFAULT_THRESHOLDS.orange),
    red: pick('fraud_red_threshold', DEFAULT_THRESHOLDS.red),
    block: pick('fraud_block_threshold', DEFAULT_THRESHOLDS.block),
  };
}

export async function setThresholds(t: FraudThresholds): Promise<void> {
  const entries: [string, number][] = [
    ['fraud_orange_threshold', t.orange],
    ['fraud_red_threshold', t.red],
    ['fraud_block_threshold', t.block],
  ];
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.systemConfig.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
}

/**
 * Card thresholds (PROPOSITION.md §4). Keys:
 *   card_yellow_threshold, card_red_threshold
 */
export async function getCardThresholds(): Promise<CardThresholds> {
  const keys = ['card_yellow_threshold', 'card_red_threshold'];
  const rows = await prisma.systemConfig.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, parseInt(r.value, 10)]));

  const pick = (key: string, fallback: number) => {
    const v = map.get(key);
    return v !== undefined && !Number.isNaN(v) ? v : fallback;
  };

  return {
    yellow: pick('card_yellow_threshold', DEFAULT_CARD_THRESHOLDS.yellow),
    red: pick('card_red_threshold', DEFAULT_CARD_THRESHOLDS.red),
  };
}

export async function setCardThresholds(t: CardThresholds): Promise<void> {
  const entries: [string, number][] = [
    ['card_yellow_threshold', t.yellow],
    ['card_red_threshold', t.red],
  ];
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.systemConfig.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
}
