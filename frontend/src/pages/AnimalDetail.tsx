import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { AnimalDetail as AnimalDetailType } from '../types';

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<AnimalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadAnimal(id);
  }, [id]);

  async function loadAnimal(animalId: string) {
    try {
      const data = await api.getAnimal(animalId);
      setAnimal(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  if (error || !animal) {
    return (
      <div className="animal-detail-page">
        <div className="error-message">{error || 'Dier niet gevonden'}</div>
        <Link to="/animals" className="link-subtle">← Terug naar mijn dieren</Link>
      </div>
    );
  }

  return (
    <div className="animal-detail-page">
      <Link to="/animals" className="link-subtle">← Terug naar mijn dieren</Link>

      <div className="page-header">
        <h1>{animal.species}{animal.breed ? ` — ${animal.breed}` : ''}</h1>
        <span className={`status-badge status-${animal.status.toLowerCase()}`}>
          {getStatusLabel(animal.status)}
        </span>
      </div>

      <div className="dashboard-card">
        <h3>Gegevens</h3>
        <dl className="info-list">
          <dt>Diersoort</dt>
          <dd>{animal.species}</dd>
          {animal.breed && (
            <>
              <dt>Ras</dt>
              <dd>{animal.breed}</dd>
            </>
          )}
          {animal.birthDate && (
            <>
              <dt>Geboortedatum</dt>
              <dd>{new Date(animal.birthDate).toLocaleDateString('nl-NL')}</dd>
            </>
          )}
          <dt>Moeder bekend</dt>
          <dd>{animal.motherKnown ? 'Ja' : 'Nee'}</dd>
          <dt>Geregistreerd op</dt>
          <dd>{new Date(animal.registeredAt).toLocaleDateString('nl-NL')}</dd>
          {animal.confirmedAt && (
            <>
              <dt>Bevestigd op</dt>
              <dd>{new Date(animal.confirmedAt).toLocaleDateString('nl-NL')}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="dashboard-card">
        <h3>Blockchain</h3>
        {animal.txHash ? (
          <dl className="info-list">
            <dt>Status</dt>
            <dd><span className="tx-indicator" title="Op blockchain">⛓️</span> Vastgelegd</dd>
            <dt>Transactie</dt>
            <dd><code className="tx-hash">{animal.txHash}</code></dd>
          </dl>
        ) : (
          <p className="empty-state">
            Nog niet op de blockchain vastgelegd
            {animal.status === 'PENDING' && ' — wordt verwerkt.'}
          </p>
        )}
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'In behandeling',
    CONFIRMED: 'Bevestigd',
    DISPUTED: 'Betwist',
    FAILED: 'Mislukt',
  };
  return labels[status] || status;
}
