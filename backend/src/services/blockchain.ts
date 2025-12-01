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

export function hashChipId(chipId: string): string {
  const normalized = chipId.replace(/[-\s]/g, '').toUpperCase();
  return hashData(normalized);
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
