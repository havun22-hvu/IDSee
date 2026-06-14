import type { RiskScore, ScoreFactors } from '../../types';

const SCORE_META: Record<RiskScore, { label: string; icon: string; description: string }> = {
  GROEN: {
    label: 'Groen',
    icon: '🟢',
    description: 'De herkomstketen is volledig verifieerbaar.',
  },
  ORANJE: {
    label: 'Oranje',
    icon: '🟠',
    description: 'De keten is deels verifieerbaar; één of meer schakels zijn onbekend of zwak.',
  },
  ROOD: {
    label: 'Rood',
    icon: '🔴',
    description: 'De keten sluit niet: herkomst ontbreekt of is niet te verifiëren.',
  },
};

// Factors worden neutraal als feiten getoond — nooit als beschuldiging.
const FACTOR_LABELS: { key: keyof ScoreFactors; label: string; invert?: boolean }[] = [
  { key: 'found', label: 'Geregistreerd in IDSee' },
  { key: 'chainConfirmed', label: 'Registratie bevestigd' },
  { key: 'breederVerified', label: 'Fokker geverifieerd' },
  { key: 'motherKnown', label: 'Moeder bekend' },
  { key: 'disputed', label: 'Registratie betwist', invert: true },
];

export function RiskScoreBadge({ score, factors }: { score: RiskScore; factors: ScoreFactors }) {
  const meta = SCORE_META[score];

  return (
    <div className="risk-score">
      <div className={`risk-score-badge risk-${score.toLowerCase()}`}>
        <span className="risk-icon" aria-hidden="true">{meta.icon}</span>
        <span className="risk-label">{meta.label}</span>
      </div>
      <p className="risk-description">{meta.description}</p>

      <ul className="risk-factors">
        {FACTOR_LABELS.map(({ key, label, invert }) => {
          const raw = factors[key];
          // For "disputed" a true value is the negative one.
          const positive = invert ? !raw : raw;
          return (
            <li key={key} className={positive ? 'factor-ok' : 'factor-missing'}>
              <span aria-hidden="true">{positive ? '✓' : '–'}</span>{' '}
              <span className="factor-label">{label}</span>
            </li>
          );
        })}
      </ul>

      <p className="risk-disclaimer">
        Deze score drukt de <strong>verifieerbaarheid</strong> van de herkomst uit, geen
        oordeel over een persoon.
      </p>
    </div>
  );
}
