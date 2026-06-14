import { useState, useEffect, FormEvent } from 'react';
import { api } from '../lib/api';
import { RiskScoreBadge } from '../components/verify/RiskScoreBadge';
import type { VerifyResult } from '../types';

type Phase = 'idle' | 'starting' | 'paying';

export function Verify() {
  const [chipId, setChipId] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  // Resume a session returned by a redirect-based provider (?session=).
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('session');
    if (s) {
      setSessionId(s);
      setPhase('paying');
    }
  }, []);

  // Poll payment status, then fetch the result once paid. Polls immediately so
  // the demo provider (instantly PAID) resolves without a visible delay.
  useEffect(() => {
    if (!sessionId || phase !== 'paying') return;
    let active = true;
    let timer: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const { status } = await api.getCheckStatus(sessionId!);
        if (!active) return;
        if (status === 'PAID') {
          clearInterval(timer);
          const r = await api.getCheckResult(sessionId!);
          if (!active) return;
          setResult(r);
          setPhase('idle');
        } else if (status === 'FAILED') {
          clearInterval(timer);
          setError('Betaling mislukt of geannuleerd.');
          setPhase('idle');
        }
      } catch (err: any) {
        if (!active) return;
        clearInterval(timer);
        setError(err.message || 'Kon status niet ophalen');
        setPhase('idle');
      }
    }

    poll();
    timer = setInterval(poll, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [sessionId, phase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setPhase('starting');
    try {
      const { sessionId: sid, checkoutUrl } = await api.initiateCheck(chipId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // real provider redirect
        return;
      }
      setSessionId(sid);
      setPhase('paying');
    } catch (err: any) {
      setError(err.message || 'Kon check niet starten');
      setPhase('idle');
    }
  }

  function handleReset() {
    setChipId('');
    setResult(null);
    setError('');
    setSessionId(null);
    setPhase('idle');
  }

  const busy = phase !== 'idle';

  return (
    <div className="verify-page">
      <h1>Verifieer een dier</h1>
      <p className="page-description">
        Voer het chipnummer in en betaal €2 voor een herkomstcheck. Je krijgt een
        risico-score die de verifieerbaarheid van de herkomst weergeeft.
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
              disabled={busy}
            />
            <small className="form-hint">
              Het chipnummer staat op het paspoort of vraag je op bij de fokker/dierenarts.
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={busy}>
            {phase === 'idle' && 'Verifieer (€2)'}
            {phase === 'starting' && 'Betaling starten...'}
            {phase === 'paying' && 'Betaling verwerken...'}
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
