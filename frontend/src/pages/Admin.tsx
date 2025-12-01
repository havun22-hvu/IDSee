import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminStats {
  users: number;
  animals: number;
  pendingVerifications: number;
  totalCreditsInSystem: number;
  walletBalance: number;
  demoMode: boolean;
}

interface PendingUser {
  id: string;
  email: string;
  role: string;
  professionalId: string;
  createdAt: string;
}

export function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsData, pendingData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingUsers(),
      ]);
      setStats(statsData);
      setPendingUsers(pendingData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(userId: string, status: 'VERIFIED' | 'REJECTED') {
    setActionLoading(userId);
    try {
      await api.verifyUser(userId, status);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      // Reload stats
      const newStats = await api.getAdminStats();
      setStats(newStats);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {stats?.demoMode && (
        <div className="alert alert-info">
          Demo modus actief - blockchain transacties worden gesimuleerd.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.users ?? 0}</div>
          <div className="stat-label">Gebruikers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.animals ?? 0}</div>
          <div className="stat-label">Dieren</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.pendingVerifications ?? 0}</div>
          <div className="stat-label">Wachtend</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalCreditsInSystem ?? 0}</div>
          <div className="stat-label">Credits in systeem</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.walletBalance?.toFixed(2) ?? 0} ADA</div>
          <div className="stat-label">Wallet balans</div>
        </div>
      </div>

      <section className="pending-section">
        <h2>Wachtende verificaties</h2>

        {pendingUsers.length === 0 ? (
          <p className="empty-state">Geen wachtende verificaties.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>ID</th>
                <th>Aangemeld</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.role)}</td>
                  <td><code>{user.professionalId}</code></td>
                  <td>{new Date(user.createdAt).toLocaleDateString('nl-NL')}</td>
                  <td className="actions">
                    <button
                      className="btn-small btn-success"
                      onClick={() => handleVerify(user.id, 'VERIFIED')}
                      disabled={actionLoading === user.id}
                    >
                      Goedkeuren
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleVerify(user.id, 'REJECTED')}
                      disabled={actionLoading === user.id}
                    >
                      Afwijzen
                    </button>
                  </td>
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
