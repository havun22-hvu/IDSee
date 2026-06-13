import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { PendingConfirmation } from '../types';

export function Confirmations() {
  const [pending, setPending] = useState<PendingConfirmation[]>([]);
  const [history, setHistory] = useState<PendingConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pendingData, historyData] = await Promise.all([
        api.getPendingConfirmations(),
        api.getConfirmationHistory(),
      ]);
      setPending(pendingData);
      setHistory(historyData);
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
      const res = await api.confirmRegistration(id);
      setMessage(res.message);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    if (!reason.trim()) {
      setError('Geef een reden voor afwijzing op');
      return;
    }
    setActionId(id);
    setError('');
    setMessage('');
    try {
      const res = await api.rejectRegistration(id, reason.trim());
      setMessage(res.message);
      setRejectingId(null);
      setReason('');
      await loadData();
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
    <div className="confirmations-page">
      <h1>Bevestigingen</h1>
      <p className="page-intro">
        Dierenartsen en chippers registreren dieren onder jouw UBN. Bevestig of de
        registratie klopt — pas daarna wordt deze definitief op de blockchain vastgelegd.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <section className="pending-section">
        <h2>Wachtend op bevestiging ({pending.length})</h2>

        {pending.length === 0 ? (
          <p className="empty-state">Geen registraties wachten op je bevestiging.</p>
        ) : (
          <div className="confirmation-list">
            {pending.map((reg) => (
              <div key={reg.id} className="dashboard-card confirmation-card">
                <div className="confirmation-info">
                  <div className="animal-info">
                    <span className="animal-species">{reg.animal.species}</span>
                    {reg.animal.breed && <span className="animal-breed">{reg.animal.breed}</span>}
                  </div>
                  <dl className="info-list">
                    {reg.animal.birthDate && (
                      <>
                        <dt>Geboortedatum</dt>
                        <dd>{new Date(reg.animal.birthDate).toLocaleDateString('nl-NL')}</dd>
                      </>
                    )}
                    {reg.user && (
                      <>
                        <dt>Geregistreerd door</dt>
                        <dd>{reg.user.email} ({getRoleName(reg.user.role)})</dd>
                      </>
                    )}
                    <dt>Aangemeld op</dt>
                    <dd>{new Date(reg.createdAt).toLocaleDateString('nl-NL')}</dd>
                  </dl>
                </div>

                {rejectingId === reg.id ? (
                  <div className="reject-form">
                    <label htmlFor={`reason-${reg.id}`}>Reden voor afwijzing</label>
                    <textarea
                      id={`reason-${reg.id}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Bijv. dit dier komt niet uit mijn nest"
                      rows={2}
                    />
                    <div className="actions">
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleReject(reg.id)}
                        disabled={actionId === reg.id}
                      >
                        Definitief afwijzen
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => { setRejectingId(null); setReason(''); }}
                        disabled={actionId === reg.id}
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="actions">
                    <button
                      className="btn-small btn-success"
                      onClick={() => handleConfirm(reg.id)}
                      disabled={actionId === reg.id}
                    >
                      Bevestigen
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => { setRejectingId(reg.id); setError(''); }}
                      disabled={actionId === reg.id}
                    >
                      Afwijzen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="history-section">
        <h2>Geschiedenis</h2>
        {history.length === 0 ? (
          <p className="empty-state">Nog geen bevestigingsgeschiedenis.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dier</th>
                <th>Status</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {history.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.animal.species}{reg.animal.breed ? ` — ${reg.animal.breed}` : ''}</td>
                  <td>
                    <span className={`status-badge status-${reg.status.toLowerCase()}`}>
                      {getStatusLabel(reg.status)}
                    </span>
                    {reg.breederRejectedReason && (
                      <span className="reject-reason" title={reg.breederRejectedReason}> ⓘ</span>
                    )}
                  </td>
                  <td>{new Date(reg.createdAt).toLocaleDateString('nl-NL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    BREEDER: 'Fokker',
    VET: 'Dierenarts',
    CHIPPER: 'Chipper',
  };
  return names[role] || role;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'In behandeling',
    CONFIRMED: 'Bevestigd',
    DISPUTED: 'Afgewezen',
    FAILED: 'Mislukt',
  };
  return labels[status] || status;
}
