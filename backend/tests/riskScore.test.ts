import { scoreFromFactors } from '../src/services/riskScore.js';
import type { ScoreFactors } from '../src/types/index.js';

// A fully-sound chain; individual tests weaken one factor at a time.
const sound: ScoreFactors = {
  found: true,
  chainConfirmed: true,
  breederVerified: true,
  motherKnown: true,
  disputed: false,
};

describe('scoreFromFactors', () => {
  it('GROEN when the chain is complete and the owner is clean', () => {
    expect(scoreFromFactors(sound)).toBe('GROEN');
  });

  it('ORANJE when the animal is unknown (no data is not guilt)', () => {
    expect(scoreFromFactors({ ...sound, found: false })).toBe('ORANJE');
  });

  it('ORANJE when there is no confirmed registration yet', () => {
    expect(scoreFromFactors({ ...sound, chainConfirmed: false })).toBe('ORANJE');
  });

  it('ORANJE when the breeder is not verified', () => {
    expect(scoreFromFactors({ ...sound, breederVerified: false })).toBe('ORANJE');
  });

  it('ORANJE when the mother is unknown', () => {
    expect(scoreFromFactors({ ...sound, motherKnown: false })).toBe('ORANJE');
  });

  it('ROOD when a registration is disputed', () => {
    expect(scoreFromFactors({ ...sound, disputed: true })).toBe('ROOD');
  });

  describe('owner fraud status (fase 3 hook)', () => {
    it('ROOD when the owner is flagged ROOD', () => {
      expect(scoreFromFactors(sound, 'ROOD')).toBe('ROOD');
    });

    it('ROOD when the owner is BLOKKADE', () => {
      expect(scoreFromFactors(sound, 'BLOKKADE')).toBe('ROOD');
    });

    it('ORANJE when the owner is ORANJE but the chain is otherwise sound', () => {
      expect(scoreFromFactors(sound, 'ORANJE')).toBe('ORANJE');
    });

    it('GROEN when the owner is LEREN (default)', () => {
      expect(scoreFromFactors(sound, 'LEREN')).toBe('GROEN');
    });

    it('fraud ROOD overrides an otherwise unknown animal', () => {
      // A flagged owner is ROOD even if this particular animal is unknown.
      expect(scoreFromFactors({ ...sound, found: false }, 'ROOD')).toBe('ROOD');
    });
  });

  describe('professional card status (§4)', () => {
    it('GROEN when the confirming professional has no card', () => {
      expect(scoreFromFactors(sound, 'LEREN', 'GEEN')).toBe('GROEN');
    });

    it('downgrades GROEN to ORANJE on a gele kaart (confirmation weighs lighter)', () => {
      expect(scoreFromFactors(sound, 'LEREN', 'GEEL')).toBe('ORANJE');
    });

    it('downgrades GROEN to ORANJE on a rode kaart (confirmation no longer carries)', () => {
      expect(scoreFromFactors(sound, 'LEREN', 'ROOD')).toBe('ORANJE');
    });

    it('a card never overrides a harder ROOD signal', () => {
      // disputed chain stays ROOD regardless of card.
      expect(scoreFromFactors({ ...sound, disputed: true }, 'LEREN', 'GEEL')).toBe('ROOD');
    });
  });
});
