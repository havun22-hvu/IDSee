import { useState, FormEvent } from 'react';
import { api } from '../lib/api';

// De IMPORT-schakel (§3a): een geverifieerde NL-dierenarts legt de traceerbare
// buitenlandse herkomst vast. Een volledige, traceerbare import levert de koper
// een 🔵 "Geverifieerde import" — een eigen label, geen afwaardering.
export function RegisterImport() {
  const [chipId, setChipId] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [foreignOriginId, setForeignOriginId] = useState('');
  const [euPassportNumber, setEuPassportNumber] = useState('');
  const [passportConverted, setPassportConverted] = useState(false);
  const [vetCheckedDocuments, setVetCheckedDocuments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chipId.trim() || !countryOfOrigin.trim()) {
      setError('Chipnummer en land van herkomst zijn verplicht');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await api.recordImport({
        chipId: chipId.trim(),
        countryOfOrigin: countryOfOrigin.trim(),
        foreignOriginId: foreignOriginId.trim() || undefined,
        euPassportNumber: euPassportNumber.trim() || undefined,
        passportConverted,
        vetCheckedDocuments,
      });
      setMessage('Import-schakel vastgelegd. Bij volledige, traceerbare herkomst toont de koper 🔵.');
      setForeignOriginId('');
      setEuPassportNumber('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-signal-page">
      <h1>Import-schakel vastleggen</h1>
      <p className="page-intro">
        Voor een legaal geïmporteerde pup zonder NL-moeder. Als <strong>geverifieerde
        dierenarts</strong> controleer je de invoerpapieren en leg je de traceerbare
        buitenlandse herkomst vast. Registreer het dier eerst via <em>Dieren → Nieuw</em>.
        Een volledige, traceerbare import krijgt het label <strong>🔵 Geverifieerde import</strong>.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="chipId">Chipnummer pup</label>
          <input
            id="chipId"
            type="text"
            value={chipId}
            onChange={(e) => setChipId(e.target.value)}
            placeholder="528-1234-5678-9012"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Land van herkomst</label>
          <input
            id="country"
            type="text"
            value={countryOfOrigin}
            onChange={(e) => setCountryOfOrigin(e.target.value)}
            placeholder="bijv. BE, DE, HU"
          />
        </div>

        <div className="form-group">
          <label htmlFor="originId">Buitenlandse fokker-/herkomst-identifier</label>
          <input
            id="originId"
            type="text"
            value={foreignOriginId}
            onChange={(e) => setForeignOriginId(e.target.value)}
            placeholder="traceerbare bron-ID"
          />
          <small className="form-hint">
            Zonder traceerbare bron blijft de score oranje — de herkomst is dan niet te verifiëren.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="passport">EU-paspoortnummer (optioneel)</label>
          <input
            id="passport"
            type="text"
            value={euPassportNumber}
            onChange={(e) => setEuPassportNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={passportConverted}
              onChange={(e) => setPassportConverted(e.target.checked)}
            />{' '}
            Het EU-paspoort is omgezet naar een NL-paspoort
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={vetCheckedDocuments}
              onChange={(e) => setVetCheckedDocuments(e.target.checked)}
            />{' '}
            Ik heb de invoerpapieren fysiek gecontroleerd
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Vastleggen...' : 'Import-schakel vastleggen'}
        </button>
      </form>
    </div>
  );
}
