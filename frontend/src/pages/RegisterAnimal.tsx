import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function RegisterAnimal() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [chipId, setChipId] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [motherChipId, setMotherChipId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.registerAnimal({
        chipId,
        species,
        breed: breed || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
        motherChipId: motherChipId || undefined,
      });

      // Refresh user to update credits
      await refreshUser();

      navigate('/animals');
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  }

  const hasEnoughCredits = (user?.credits ?? 0) >= 1;

  return (
    <div className="register-animal-page">
      <h1>Dier registreren</h1>

      {!hasEnoughCredits && (
        <div className="alert alert-warning">
          Je hebt niet genoeg credits. <a href="/credits">Koop credits</a> om door te gaan.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="chipId">Chipnummer *</label>
          <input
            type="text"
            id="chipId"
            value={chipId}
            onChange={(e) => setChipId(e.target.value)}
            placeholder="528-1234-5678-9012"
            required
            minLength={10}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="species">Diersoort *</label>
            <select
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
            >
              <option value="dog">Hond</option>
              <option value="cat">Kat</option>
              <option value="rabbit">Konijn</option>
              <option value="other">Anders</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Ras</label>
            <input
              type="text"
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Labrador Retriever"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Geboortedatum</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="motherChipId">Chipnummer moeder (optioneel)</label>
          <input
            type="text"
            id="motherChipId"
            value={motherChipId}
            onChange={(e) => setMotherChipId(e.target.value)}
            placeholder="528-1234-5678-0000"
          />
          <small className="form-hint">
            Als de moeder ook geregistreerd is, wordt er een link gemaakt.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/animals')}
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !hasEnoughCredits}
          >
            {loading ? 'Bezig...' : 'Registreren (1 credit)'}
          </button>
        </div>
      </form>
    </div>
  );
}
