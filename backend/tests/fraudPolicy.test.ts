import {
  assessFraudStatus,
  worstFraudStatus,
  DEFAULT_THRESHOLDS,
} from '../src/services/fraudPolicy.js';

describe('assessFraudStatus (defaults: orange=2, red=4, block=10)', () => {
  it('stays LEREN below the orange threshold (learning margin)', () => {
    expect(assessFraudStatus(0)).toBe('LEREN');
    expect(assessFraudStatus(1)).toBe('LEREN');
  });

  it('escalates to ORANJE at the orange threshold', () => {
    expect(assessFraudStatus(2)).toBe('ORANJE');
    expect(assessFraudStatus(3)).toBe('ORANJE');
  });

  it('escalates to ROOD at the red threshold', () => {
    expect(assessFraudStatus(4)).toBe('ROOD');
    expect(assessFraudStatus(9)).toBe('ROOD');
  });

  it('escalates to BLOKKADE at the block threshold', () => {
    expect(assessFraudStatus(10)).toBe('BLOKKADE');
    expect(assessFraudStatus(50)).toBe('BLOKKADE');
  });

  it('keeps BLOKKADE permanent regardless of count', () => {
    // Even if confirmed signals drop out of the window, a block does not lift automatically.
    expect(assessFraudStatus(0, DEFAULT_THRESHOLDS, 'BLOKKADE')).toBe('BLOKKADE');
  });

  it('respects custom thresholds', () => {
    const strict = { orange: 1, red: 2, block: 5 };
    expect(assessFraudStatus(1, strict)).toBe('ORANJE');
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
