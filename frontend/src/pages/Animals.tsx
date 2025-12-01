import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Animal } from '../types';

export function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnimals();
  }, []);

  async function loadAnimals() {
    try {
      const data = await api.getAnimals();
      setAnimals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="animals-page">
      <div className="page-header">
        <h1>Mijn dieren</h1>
        <Link to="/animals/new" className="btn-primary">
          + Nieuw dier
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {animals.length === 0 ? (
        <div className="empty-state">
          <p>Je hebt nog geen dieren geregistreerd.</p>
          <Link to="/animals/new" className="btn-primary">
            Eerste dier registreren
          </Link>
        </div>
      ) : (
        <div className="animals-grid">
          {animals.map((animal) => (
            <Link to={`/animals/${animal.id}`} key={animal.id} className="animal-card-link">
              <div className="animal-card">
                <div className="animal-header">
                  <span className="animal-species">{animal.species}</span>
                  <span className={`status-badge status-${animal.status.toLowerCase()}`}>
                    {getStatusLabel(animal.status)}
                  </span>
                </div>
                {animal.breed && <p className="animal-breed">{animal.breed}</p>}
                <div className="animal-footer">
                  <span className="animal-date">
                    {new Date(animal.registeredAt).toLocaleDateString('nl-NL')}
                  </span>
                  {animal.txHash && (
                    <span className="tx-indicator" title="Op blockchain">⛓️</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'In behandeling',
    CONFIRMED: 'Bevestigd',
    FAILED: 'Mislukt',
  };
  return labels[status] || status;
}
