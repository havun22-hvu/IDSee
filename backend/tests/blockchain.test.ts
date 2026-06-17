import {
  hashData,
  hashChipId,
  verifyOnChain,
  registerOnChain,
  getWalletBalance,
  isDemoMode,
} from '../src/services/blockchain.js';

describe('hashData', () => {
  it('produces a stable 64-char sha256 hex digest', () => {
    const hash = hashData('hello');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for identical input', () => {
    expect(hashData('same')).toBe(hashData('same'));
  });

  it('differs for different input', () => {
    expect(hashData('a')).not.toBe(hashData('b'));
  });
});

describe('hashChipId', () => {
  it('normalises dashes, spaces and casing before hashing', () => {
    // Privacy-critical: the same physical chip must always map to one hash.
    const canonical = hashChipId('528210000123456');
    expect(hashChipId('528-2100-0012-3456')).toBe(canonical);
    expect(hashChipId('528 2100 0012 3456')).toBe(canonical);
    expect(hashChipId('528210000123456'.toLowerCase())).toBe(canonical);
  });

  it('hashes distinct chip numbers to distinct values', () => {
    expect(hashChipId('111111111111111')).not.toBe(hashChipId('222222222222222'));
  });

  it('never returns the raw chip number (no plaintext leak)', () => {
    const chip = '528210000123456';
    expect(hashChipId(chip)).not.toContain(chip);
  });

  it('is peppered (HMAC), not a plain sha256 of the chip — not brute-forceable', () => {
    // AVG §5: a plain hash of an enumerable 15-digit number is reversible.
    // The digest must differ from an unsalted sha256 of the normalised chip.
    const chip = '528210000123456';
    expect(hashChipId(chip)).not.toBe(hashData(chip));
  });
});

describe('verifyOnChain (demo mode)', () => {
  it('finds hashes prefixed with demo_', async () => {
    const result = await verifyOnChain('demo_abc');
    expect(result.found).toBe(true);
    expect(result.txHash).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('does not find arbitrary hashes', async () => {
    const result = await verifyOnChain('deadbeef');
    expect(result.found).toBe(false);
    expect(result.txHash).toBeUndefined();
  });
});

describe('registerOnChain (demo mode)', () => {
  it('returns a demo_tx_ prefixed transaction id', async () => {
    const tx = await registerOnChain('somehash');
    expect(tx).toMatch(/^demo_tx_[0-9a-f]{32}$/);
  });

  it('returns a unique id per call', async () => {
    const [a, b] = await Promise.all([registerOnChain('h'), registerOnChain('h')]);
    expect(a).not.toBe(b);
  });
});

describe('demo helpers', () => {
  it('reports demo mode', () => {
    expect(isDemoMode()).toBe(true);
  });

  it('returns the demo wallet balance', async () => {
    expect(await getWalletBalance()).toBe(1000000000n);
  });
});
