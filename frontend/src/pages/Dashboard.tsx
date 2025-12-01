import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { Animal } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnimals();
  }, []);

  async function loadAnimals() {
    try {
      const data = await api.getAnimals();
      setAnimals(data);
    } catch (err) {
      console.error('Failed to load animals:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isProfessional = user.role !== 'BUYER';
  const isPending = user.verificationStatus === 'PENDING';

  return (
    <div className="dashboard-page">
      <h1>{getDashboardTitle(user.role)}</h1>

      {isPending && (
        <div className="alert alert-warning">
          Je account wacht op verificatie. Je kunt nog geen registraties doen.
        </div>
      )}

      <div className="dashboard-grid">
        {/* Credits card - alleen voor professionals */}
        {isProfessional && (
          <div className="dashboard-card">
            <h3>Credits</h3>
            <div className="credits-display">
              <span className="credits-amount">{user.credits}</span>
              <span className="credits-label">beschikbaar</span>
            </div>
            <Link to="/credits" className="btn-secondary">
              Credits kopen
            </Link>
          </div>
        )}

        {/* Role-specific quick actions */}
        <div className="dashboard-card">
          <h3>Snelle acties</h3>
          <div className="quick-actions">
            {user.role === 'BUYER' && (
              <Link to="/verify" className="action-link">
                Dier verifiëren
              </Link>
            )}
            {user.role === 'BREEDER' && !isPending && (
              <>
                <Link to="/animals/new" className="action-link">
                  Pup registreren
                </Link>
                <Link to="/animals" className="action-link">
                  Mijn dieren bekijken
                </Link>
              </>
            )}
            {user.role === 'VET' && !isPending && (
              <>
                <Link to="/animals/new" className="action-link">
                  Nieuw dier registreren
                </Link>
                <Link to="/animals" className="action-link">
                  Registraties bekijken
                </Link>
              </>
            )}
            {user.role === 'CHIPPER' && !isPending && (
              <>
                <Link to="/animals/new" className="action-link">
                  Chip registreren
                </Link>
                <Link to="/animals" className="action-link">
                  Mijn chips bekijken
                </Link>
              </>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="action-link">
                Gebruikers beheren
              </Link>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="dashboard-card">
          <h3>Account</h3>
          <dl className="info-list">
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Rol</dt>
            <dd>{getRoleName(user.role)}</dd>
            <dt>Status</dt>
            <dd>
              <span className={`status-badge status-${user.verificationStatus.toLowerCase()}`}>
                {getStatusName(user.verificationStatus)}
              </span>
            </dd>
            {user.professionalId && (
              <>
                <dt>Registratie ID</dt>
                <dd>{user.professionalId}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Recent registrations */}
      {isProfessional && (
        <section className="recent-section">
          <div className="section-header">
            <h2>Recente registraties</h2>
            <Link to="/animals" className="link-subtle">Bekijk alle</Link>
          </div>

          {loading ? (
            <div className="loading">Laden...</div>
          ) : animals.length === 0 ? (
            <div className="empty-state">
              <p>Je hebt nog geen dieren geregistreerd.</p>
              {!isPending && (
                <Link to="/animals/new" className="btn-primary">
                  Eerste dier registreren
                </Link>
              )}
            </div>
          ) : (
            <div className="animals-list">
              {animals.slice(0, 5).map((animal) => (
                <div key={animal.id} className="animal-card">
                  <div className="animal-info">
                    <span className="animal-species">{animal.species}</span>
                    {animal.breed && <span className="animal-breed">{animal.breed}</span>}
                  </div>
                  <div className="animal-meta">
                    <span className={`status-badge status-${animal.status.toLowerCase()}`}>
                      {animal.status}
                    </span>
                    <span className="animal-date">
                      {new Date(animal.registeredAt).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    BUYER: 'Koper',
    BREEDER: 'Fokker',
    VET: 'Dierenarts',
    CHIPPER: 'Chipper',
    ADMIN: 'Administrator',
  };
  return names[role] || role;
}

function getStatusName(status: string): string {
  const names: Record<string, string> = {
    PENDING: 'In behandeling',
    VERIFIED: 'Geverifieerd',
    REJECTED: 'Afgewezen',
  };
  return names[status] || status;
}

function getDashboardTitle(role: string): string {
  const titles: Record<string, string> = {
    BUYER: 'Mijn verificaties',
    BREEDER: 'Fokkers Dashboard',
    VET: 'Dierenarts Dashboard',
    CHIPPER: 'Chipper Dashboard',
    ADMIN: 'Beheer Dashboard',
  };
  return titles[role] || 'Dashboard';
}
