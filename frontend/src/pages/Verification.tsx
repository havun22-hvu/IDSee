import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { VerificationRequest, PeerVerification } from '../types';

export function Verification() {
  const { user, refreshUser } = useAuth();

  if (!user) return null;

  return (
    <div className="verification-page">
      <h1>Verificatie</h1>

      <EmailVerificationSection verified={!!user.emailVerified} onChange={refreshUser} />

      {user.verificationStatus !== 'VERIFIED' && (
        <RequestSection user={user} onChange={refreshUser} />
      )}

      {user.verificationStatus === 'VERIFIED' && (
        <>
          <PeerVerifySection onChange={refreshUser} />
          <MyVerificationsSection onChange={refreshUser} />
        </>
      )}
    </div>
  );
}

// ===== Email verificatie =====
function EmailVerificationSection({ verified, onChange }: { verified: boolean; onChange: () => Promise<void> }) {
  const [token, setToken] = useState('');
  const [devToken, setDevToken] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSend() {
    setSending(true);
    setError('');
    setMessage('');
    try {
      const res = await api.sendVerificationEmail();
      setMessage(res.message);
      if (res.devToken) setDevToken(res.devToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (!token.trim()) {
      setError('Vul de verificatietoken in');
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await api.verifyEmail(token.trim());
      setMessage(res.message);
      await onChange();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (verified) {
    return (
      <section className="dashboard-card">
        <h3>E-mailadres</h3>
        <p><span className="status-badge status-verified">Geverifieerd</span></p>
      </section>
    );
  }

  return (
    <section className="dashboard-card">
      <h3>Stap 1 — E-mailadres verifiëren</h3>
      <p>Verifieer eerst je e-mailadres voordat je een verificatieaanvraag indient.</p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {devToken && (
        <div className="alert alert-info">
          Demo: gebruik deze token — <code>{devToken}</code>
        </div>
      )}

      <button className="btn-secondary" onClick={handleSend} disabled={sending}>
        {sending ? 'Versturen...' : 'Verificatie-email versturen'}
      </button>

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="email-token">Verificatietoken</label>
        <input
          id="email-token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Plak de token uit de e-mail"
        />
      </div>
      <button className="btn-primary" onClick={handleVerify}>Verifieer e-mailadres</button>
    </section>
  );
}

// ===== Verificatieaanvraag indienen =====
function RequestSection({ user, onChange }: { user: { professionalId?: string; role: string; emailVerified?: boolean }; onChange: () => Promise<void> }) {
  const [professionalId, setProfessionalId] = useState(user.professionalId || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!professionalId.trim()) {
      setError('Vul je professionele registratienummer in');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await api.submitVerificationRequest(professionalId.trim(), user.role);
      setMessage(res.message);
      await onChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card">
      <h3>Stap 2 — Verificatie aanvragen</h3>
      <p>
        Je account staat op <strong>in behandeling</strong>. Dien een aanvraag in;
        een al geverifieerde professional of de beheerder beoordeelt deze.
      </p>

      {!user.emailVerified && (
        <div className="alert alert-warning">Verifieer eerst je e-mailadres (stap 1).</div>
      )}
      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prof-id">{getIdLabel(user.role)}</label>
          <input
            id="prof-id"
            type="text"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            disabled={!user.emailVerified}
          />
        </div>
        <button className="btn-primary" type="submit" disabled={submitting || !user.emailVerified}>
          {submitting ? 'Indienen...' : 'Aanvraag indienen'}
        </button>
      </form>
    </section>
  );
}

// ===== Peer-verificatie (anderen verifiëren) =====
function PeerVerifySection({ onChange }: { onChange: () => Promise<void> }) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setRequests(await api.getVerificationRequests());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: string) {
    setActionId(id);
    setError('');
    setMessage('');
    try {
      const res = await api.peerVerify(id);
      setMessage(`${res.message} — borg van ${res.bondAmount} credits vastgezet.`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await onChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="pending-section">
      <h2>Collega's verifiëren</h2>
      <p className="page-intro">
        Je zet 10 credits als borg in om een collega te verifiëren. De borg komt na
        30 dagen weer vrij als alles in orde is.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {loading ? (
        <div className="loading">Laden...</div>
      ) : requests.length === 0 ? (
        <p className="empty-state">Geen openstaande verificatieaanvragen.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Registratienummer</th>
              <th>Aangevraagd</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{getRoleName(r.professionalType)}</td>
                <td><code>{r.professionalId}</code></td>
                <td>{new Date(r.createdAt).toLocaleDateString('nl-NL')}</td>
                <td className="actions">
                  <button
                    className="btn-small btn-success"
                    onClick={() => handleVerify(r.id)}
                    disabled={actionId === r.id}
                  >
                    Verifiëren (10 credits borg)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ===== Mijn verificaties + borg vrijgeven =====
function MyVerificationsSection({ onChange }: { onChange: () => Promise<void> }) {
  const [verifications, setVerifications] = useState<PeerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setVerifications(await api.getMyVerifications());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRelease(id: string) {
    setActionId(id);
    setError('');
    setMessage('');
    try {
      const res = await api.releaseBond(id);
      setMessage(res.message);
      await load();
      await onChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) return null;
  if (verifications.length === 0) return null;

  return (
    <section className="history-section">
      <h2>Mijn verificaties</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Borg</th>
            <th>Status</th>
            <th>Vrij vanaf</th>
            <th>Actie</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map((v) => {
            const releasable = v.bondStatus === 'LOCKED' && new Date(v.bondLockedUntil) <= new Date();
            return (
              <tr key={v.id}>
                <td>{v.bondAmount} credits</td>
                <td>
                  <span className={`status-badge status-${v.bondStatus.toLowerCase()}`}>
                    {getBondLabel(v.bondStatus)}
                  </span>
                </td>
                <td>{new Date(v.bondLockedUntil).toLocaleDateString('nl-NL')}</td>
                <td className="actions">
                  {v.bondStatus === 'LOCKED' && (
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => handleRelease(v.id)}
                      disabled={!releasable || actionId === v.id}
                      title={releasable ? '' : 'Borg is nog vergrendeld'}
                    >
                      Borg vrijgeven
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function getIdLabel(role: string): string {
  const labels: Record<string, string> = {
    BREEDER: 'KvK-nummer',
    VET: 'BIG-nummer',
    CHIPPER: 'NVWA-certificaatnummer',
  };
  return labels[role] || 'Registratienummer';
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    BREEDER: 'Fokker',
    VET: 'Dierenarts',
    CHIPPER: 'Chipper',
  };
  return names[role] || role;
}

function getBondLabel(status: string): string {
  const labels: Record<string, string> = {
    LOCKED: 'Vergrendeld',
    RELEASED: 'Vrijgegeven',
    FORFEITED: 'Verbeurd',
  };
  return labels[status] || status;
}
