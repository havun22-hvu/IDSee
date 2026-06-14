import { prisma } from '../db.js';
import { DEFAULT_THRESHOLDS, FraudThresholds } from './fraudPolicy.js';

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
