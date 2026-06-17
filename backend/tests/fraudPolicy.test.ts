import {
  assessFraudStatus,
  worstFraudStatus,
  DEFAULT_THRESHOLDS,
  assessCardStatus,
  worstCardStatus,
} from '../src/services/fraudPolicy.js';

describe('assessFraudStatus (defaults: red=3, block=10 — geen oranje-stap)', () => {
  it('stays LEREN below the red threshold (1-2 open = learning margin)', () => {
    expect(assessFraudStatus(0)).toBe('LEREN');
    expect(assessFraudStatus(1)).toBe('LEREN');
    expect(assessFraudStatus(2)).toBe('LEREN');
  });

  it('escalates straight to ROOD at the red threshold (3 = structureel)', () => {
    expect(assessFraudStatus(3)).toBe('ROOD');
    expect(assessFraudStatus(9)).toBe('ROOD');
  });

  it('never returns ORANJE (no person-level orange step)', () => {
    for (let n = 0; n <= 9; n++) expect(assessFraudStatus(n)).not.toBe('ORANJE');
  });

  it('escalates to BLOKKADE at the block threshold', () => {
    expect(assessFraudStatus(10)).toBe('BLOKKADE');
    expect(assessFraudStatus(50)).toBe('BLOKKADE');
  });

  it('keeps BLOKKADE permanent regardless of count', () => {
    // Even if open discrepancies drop out, a block does not lift automatically.
    expect(assessFraudStatus(0, DEFAULT_THRESHOLDS, 'BLOKKADE')).toBe('BLOKKADE');
  });

  it('respects custom thresholds', () => {
    const strict = { red: 2, block: 5 };
    expect(assessFraudStatus(1, strict)).toBe('LEREN');
    expect(assessFraudStatus(2, strict)).toBe('ROOD');
    expect(assessFraudStatus(5, strict)).toBe('BLOKKADE');
  });
});

describe('worstFraudStatus', () => {
  it('returns LEREN for an all-clean chain', () => {
    expect(worstFraudStatus(['LEREN', 'LEREN'])).toBe('LEREN');
  });

  it('returns the most severe flag in the chain', () => {
    expect(worstFraudStatus(['LEREN', 'ORANJE', 'LEREN'])).toBe('ORANJE');
    expect(worstFraudStatus(['ORANJE', 'ROOD'])).toBe('ROOD');
    expect(worstFraudStatus(['ROOD', 'BLOKKADE', 'ORANJE'])).toBe('BLOKKADE');
  });

  it('defaults to LEREN for an empty chain', () => {
    expect(worstFraudStatus([])).toBe('LEREN');
  });
});

describe('assessCardStatus (defaults: yellow=3, red=6)', () => {
  it('stays GEEN below the yellow threshold', () => {
    expect(assessCardStatus(0)).toBe('GEEN');
    expect(assessCardStatus(2)).toBe('GEEN');
  });

  it('escalates to GEEL at the yellow threshold', () => {
    expect(assessCardStatus(3)).toBe('GEEL');
    expect(assessCardStatus(5)).toBe('GEEL');
  });

  it('escalates to ROOD at the red threshold', () => {
    expect(assessCardStatus(6)).toBe('ROOD');
    expect(assessCardStatus(20)).toBe('ROOD');
  });

  it('respects custom thresholds', () => {
    const strict = { yellow: 1, red: 2 };
    expect(assessCardStatus(1, strict)).toBe('GEEL');
    expect(assessCardStatus(2, strict)).toBe('ROOD');
  });
});

describe('worstCardStatus', () => {
  it('returns GEEN for a chain with no cards', () => {
    expect(worstCardStatus(['GEEN', 'GEEN'])).toBe('GEEN');
    expect(worstCardStatus([])).toBe('GEEN');
  });

  it('returns the most severe card in the chain', () => {
    expect(worstCardStatus(['GEEN', 'GEEL'])).toBe('GEEL');
    expect(worstCardStatus(['GEEL', 'ROOD', 'GEEN'])).toBe('ROOD');
  });
});
