import { useState, FormEvent } from 'react';
import { api } from '../lib/api';
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
          {result.found ? (
            <>
              <div className={`result-status ${result.certified ? 'status-success' : 'status-warning'}`}>
                {result.certified ? '✓ Geverifieerd' : '⚠ Gedeeltelijk geverifieerd'}
              </div>

              <div className="result-details">
                <div className="result-item">
                  <span className={result.found ? 'check' : 'cross'}>
                    {result.found ? '✓' : '✗'}
                  </span>
                  <span>Geregistreerd in systeem</span>
                </div>

                <div className="result-item">
                  <span className={result.breederVerified ? 'check' : 'cross'}>
                    {result.breederVerified ? '✓' : '✗'}
                  </span>
                  <span>Fokker geregistreerd</span>
                </div>

                <div className="result-item">
                  <span className={result.motherKnown ? 'check' : 'cross'}>
                    {result.motherKnown ? '✓' : '✗'}
                  </span>
                  <span>Moeder bekend</span>
                </div>

                {result.registrationDate && (
                  <div className="result-item">
                    <span className="info">ℹ</span>
                    <span>Geregistreerd op {new Date(result.registrationDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="result-status status-error">
              ✗ Niet gevonden
              <p className="result-message">
                Dit chipnummer is niet geregistreerd in ons systeem.
                Dit kan betekenen dat het dier niet via IDSee is geregistreerd.
              </p>
            </div>
          )}

          <button onClick={handleReset} className="btn-secondary btn-full">
            Nieuwe verificatie
          </button>
        </div>
      )}
    </div>
  );
}
