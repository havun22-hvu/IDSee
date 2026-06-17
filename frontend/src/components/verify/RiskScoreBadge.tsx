import type { RiskScore, ScoreFactors } from '../../types';

const SCORE_META: Record<RiskScore, { label: string; icon: string; description: string }> = {
  GROEN: {
    label: 'Groen',
    icon: '🟢',
    description: 'De herkomstketen is volledig verifieerbaar.',
  },
  BLAUW: {
    label: 'Geverifieerde import',
    icon: '🔵',
    description:
      'Geen NL-fok, maar de buitenlandse herkomst is traceerbaar en door een geverifieerde dierenarts gecontroleerd.',
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
type FactorLabel = { key: keyof ScoreFactors; label: string; invert?: boolean };

// NL-keten: toon de moeder-koppeling. Import (§3a): toon de import-schakel i.p.v.
// "moeder bekend", anders zou een eerlijke importeur een misleidend "–" zien.
const BASE_LABELS: FactorLabel[] = [
  { key: 'found', label: 'Geregistreerd in IDSee' },
  { key: 'chainConfirmed', label: 'Registratie bevestigd' },
  { key: 'breederVerified', label: 'Professional geverifieerd' },
];
const NL_LABELS: FactorLabel[] = [
  { key: 'motherKnown', label: 'Moeder bekend' },
  { key: 'ubnPresent', label: 'UBN-houder vastgelegd' },
  { key: 'breederConfirmed', label: 'Door fokker bevestigd' },
];
const IMPORT_LABELS: FactorLabel[] = [{ key: 'importVerified', label: 'Import gecontroleerd & traceerbaar' }];
const TAIL_LABELS: FactorLabel[] = [{ key: 'disputed', label: 'Registratie betwist', invert: true }];

export function RiskScoreBadge({ score, factors }: { score: RiskScore; factors: ScoreFactors }) {
  const meta = SCORE_META[score];
  const FACTOR_LABELS: FactorLabel[] = [
    ...BASE_LABELS,
    ...(factors.imported ? IMPORT_LABELS : NL_LABELS),
    ...TAIL_LABELS,
  ];

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
