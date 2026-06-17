import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskScoreBadge } from './RiskScoreBadge';
import type { ScoreFactors } from '../../types';

const soundFactors: ScoreFactors = {
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

describe('RiskScoreBadge import label (§3a)', () => {
  it('renders the 🔵 import label and the import factor instead of the mother', () => {
    render(
      <RiskScoreBadge
        score="BLAUW"
        factors={{ ...soundFactors, motherKnown: false, imported: true, importVerified: true }}
      />
    );
    expect(screen.getByText('Geverifieerde import')).toBeInTheDocument();
    expect(screen.getByText('Import gecontroleerd & traceerbaar')).toBeInTheDocument();
    expect(screen.queryByText('Moeder bekend')).not.toBeInTheDocument();
  });
});

describe('RiskScoreBadge', () => {
  it('renders the green label and a verifiability disclaimer (not guilt)', () => {
    render(<RiskScoreBadge score="GROEN" factors={soundFactors} />);
    expect(screen.getByText('Groen')).toBeInTheDocument();
    expect(screen.getByText(/verifieerbaarheid/i)).toBeInTheDocument();
  });

  it('shows a disputed registration as a missing/negative factor', () => {
    render(
      <RiskScoreBadge score="ROOD" factors={{ ...soundFactors, disputed: true }} />
    );
    expect(screen.getByText('Rood')).toBeInTheDocument();
    // "Registratie betwist" is inverted: disputed=true means the factor is NOT ok.
    const item = screen.getByText('Registratie betwist').closest('li');
    expect(item).toHaveClass('factor-missing');
  });

  it('marks an unknown animal factor as missing', () => {
    render(
      <RiskScoreBadge score="ORANJE" factors={{ ...soundFactors, found: false }} />
    );
    const item = screen.getByText('Geregistreerd in IDSee').closest('li');
    expect(item).toHaveClass('factor-missing');
  });
});
