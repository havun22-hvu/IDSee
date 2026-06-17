import { scoreFromFactors } from '../src/services/riskScore.js';
import type { ScoreFactors } from '../src/types/index.js';

// A fully-sound chain; individual tests weaken one factor at a time.
const sound: ScoreFactors = {
  found: true,
  chainConfirmed: true,
  breederVerified: true,
  motherKnown: true,
  ubnPresent: true,
  breederConfirmed: true,
  disputed: false,
  imported: false,
  importVerified: false,
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

  it('ROOD when the mother is unknown on an NL claim (chain does not close)', () => {
    expect(scoreFromFactors({ ...sound, motherKnown: false })).toBe('ROOD');
  });

  it('ORANJE when the UBN holder is missing', () => {
    expect(scoreFromFactors({ ...sound, ubnPresent: false })).toBe('ORANJE');
  });

  it('ORANJE when the UBN holder has not confirmed yet', () => {
    expect(scoreFromFactors({ ...sound, breederConfirmed: false })).toBe('ORANJE');
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

  describe('import link / 🔵 label (§3a)', () => {
    // An imported pup: no NL-moeder, scored on its import link instead.
    const imported: ScoreFactors = {
      ...sound,
      motherKnown: false,
      imported: true,
      importVerified: true,
    };

    it('BLAUW when the import link is complete and traceable', () => {
      expect(scoreFromFactors(imported)).toBe('BLAUW');
    });

    it('does not punish a missing NL-moeder on an imported pup', () => {
      // The same factors without the import flag would be ROOD (NL-claim, no mother).
      expect(scoreFromFactors({ ...sound, motherKnown: false })).toBe('ROOD');
      // With a verified import link it is BLAUW — the importer is not punished.
      expect(scoreFromFactors(imported)).toBe('BLAUW');
    });

    it('ORANJE when imported but origin is not verifiable (omgekat zonder bron)', () => {
      expect(scoreFromFactors({ ...imported, importVerified: false })).toBe('ORANJE');
    });

    it('ROOD when the importer is in a confirmed fraud pattern (volume)', () => {
      expect(scoreFromFactors(imported, 'ROOD')).toBe('ROOD');
    });

    it('ORANJE when the importer is ORANJE-flagged', () => {
      expect(scoreFromFactors(imported, 'ORANJE')).toBe('ORANJE');
    });

    it('ORANJE when the recording vet has a card', () => {
      expect(scoreFromFactors(imported, 'LEREN', 'GEEL')).toBe('ORANJE');
    });
  });
});
