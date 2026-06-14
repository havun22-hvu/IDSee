import { useState, FormEvent } from 'react';
import { api } from '../lib/api';
import { RiskScoreBadge } from '../components/verify/RiskScoreBadge';
import type { VerifyResult } from '../types';

export function Verify() {
  const [chipId, setChipId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await api.verify(chipId);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Verificatie mislukt');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setChipId('');
    setResult(null);
    setError('');
  }

  return (
    <div className="verify-page">
      <h1>Verifieer een dier</h1>
      <p className="page-description">
        Voer het chipnummer in om te controleren of het dier geregistreerd en traceerbaar is.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="verify-form">
          <div className="form-group">
            <label htmlFor="chipId">Chipnummer</label>
            <input
              type="text"
              id="chipId"
              value={chipId}
              onChange={(e) => setChipId(e.target.value)}
              placeholder="528-1234-5678-9012"
              required
              minLength={10}
            />
            <small className="form-hint">
              Het chipnummer staat op het paspoort of kun je opvragen bij de fokker/dierenarts.
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Controleren...' : 'Verifieer'}
          </button>
        </form>
      ) : (
        <div className="verify-result">
          <RiskScoreBadge score={result.riskScore} factors={result.factors} />

          {result.registrationDate && (
            <p className="result-meta">
              Geregistreerd op {new Date(result.registrationDate).toLocaleDateString('nl-NL')}
            </p>
          )}

          <button onClick={handleReset} className="btn-secondary btn-full">
            Nieuwe verificatie
          </button>
        </div>
      )}
    </div>
  );
}
