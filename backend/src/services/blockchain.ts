import crypto from 'crypto';

/**
 * Blockchain Service - Demo Mode
 *
 * In development draait alles in demo mode.
 * Voor echte blockchain integratie: npm install @lucid-evolution/lucid
 * Zie docs/DEVELOPMENT.md voor meer info.
 */

const demoMode = true;

export async function initBlockchain(): Promise<void> {
  console.log('⚠️  Blockchain running in demo mode');
  console.log('   Voor echte blockchain: configureer BLOCKFROST_KEY en WALLET_SEED');
}

export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Privacy pepper for chip-id hashing (PROPOSITION.md §5 — AVG).
 *
 * Chip numbers live in a small, enumerable space (15-digit ISO), so a plain
 * SHA-256 digest is reversible by brute force. We HMAC them with a server-side
 * secret so the digest cannot be reversed without the pepper. In production the
 * pepper is mandatory; in dev/test a stable fallback keeps hashes reproducible.
 */
function getChipPepper(): string {
  const pepper = process.env.CHIP_HASH_PEPPER;
  if (pepper && pepper.length >= 16) return pepper;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CHIP_HASH_PEPPER ontbreekt of is te kort (min. 16 tekens) — vereist in productie'
    );
  }
  return 'idsee-dev-pepper-do-not-use-in-production';
}

export function hashChipId(chipId: string): string {
  const normalized = chipId.replace(/[-\s]/g, '').toUpperCase();
  return crypto.createHmac('sha256', getChipPepper()).update(normalized).digest('hex');
}

export async function registerOnChain(dataHash: string): Promise<string> {
  console.log('Demo mode: simulating blockchain registration');
  // Simuleer een korte delay zoals bij echte blockchain
  await new Promise(resolve => setTimeout(resolve, 500));
  return `demo_tx_${crypto.randomBytes(16).toString('hex')}`;
}

export async function verifyOnChain(chipIdHash: string): Promise<{
  found: boolean;
  txHash?: string;
  timestamp?: Date;
}> {
  // Demo mode: chips die beginnen met 'demo_' worden altijd gevonden
  const found = chipIdHash.startsWith('demo_');

  return {
    found,
    txHash: found ? `demo_verify_${crypto.randomBytes(8).toString('hex')}` : undefined,
    timestamp: found ? new Date() : undefined,
  };
}

export async function getWalletBalance(): Promise<bigint> {
  return 1000000000n; // 1000 ADA in demo mode
}

export function isDemoMode(): boolean {
  return demoMode;
}
