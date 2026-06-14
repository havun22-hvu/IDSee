import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { FraudReport } from '../types';

export function FraudReview() {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setReports(await api.getPendingFraudReports());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(id: string) {
    setActionId(id);
    setError('');
    setMessage('');
    try {
      const res = await api.confirmFraud(id, notes[id]);
      setMessage(`Signaal bevestigd. Verifieerbaarheid van de betrokken keten is nu: ${res.newStatus}.`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setActionId(id);
    setError('');
    setMessage('');
    try {
      await api.rejectFraud(id, notes[id]);
      setMessage('Signaal afgewezen.');
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="fraud-review-page">
      <h1>Fraudesignalen beoordelen</h1>
      <p className="page-intro">
        Als geverifieerde dierenarts beoordeel je gemelde signalen. Alleen jouw bevestiging
        zet een hard signaal — dit voorkomt dat valse claims iemand onterecht raken. Bevestiging
        verlaagt de <strong>verifieerbaarheid</strong> van de keten, nooit een publiek oordeel
        over een persoon.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {reports.length === 0 ? (
        <p className="empty-state">Geen openstaande signalen.</p>
      ) : (
        <div className="confirmation-list">
          {reports.map((r) => (
            <div key={r.id} className="dashboard-card confirmation-card">
              <div className="confirmation-info">
                <div className="animal-info">
                  <span className="animal-species">{r.type}</span>
                  <span className={`status-badge ${r.source === 'BUYER' ? 'status-warning' : 'status-active'}`}>
                    {r.source === 'BUYER' ? 'Koper-signaal' : 'Professional'}
                  </span>
                </div>
                <p>{r.description}</p>
                <dl className="info-list">
                  <dt>Gemeld op</dt>
                  <dd>{new Date(r.createdAt).toLocaleDateString('nl-NL')}</dd>
                </dl>
              </div>

              <div className="reject-form">
                <label htmlFor={`note-${r.id}`}>Notitie (optioneel)</label>
                <textarea
                  id={`note-${r.id}`}
                  value={notes[r.id] || ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                  rows={2}
                />
                <div className="actions">
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleConfirm(r.id)}
                    disabled={actionId === r.id}
                  >
                    Bevestigen als fraudesignaal
                  </button>
                  <button
                    className="btn-small btn-secondary"
                    onClick={() => handleReject(r.id)}
                    disabled={actionId === r.id}
                  >
                    Afwijzen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
