import { useState, FormEvent } from 'react';
import { api } from '../lib/api';

const SIGNAL_TYPES = [
  { value: 'omgekat_paspoort', label: 'Omgekat buitenlands paspoort' },
  { value: 'ontbrekende_schakel', label: 'Ontbrekende schakel in de keten' },
  { value: 'dubbele_registratie', label: 'Dubbele / verdachte registratie' },
  { value: 'herkomst_onbekend', label: 'Herkomst niet te herleiden' },
  { value: 'overig', label: 'Overig' },
];

export function ReportSignal() {
  const [type, setType] = useState(SIGNAL_TYPES[0].value);
  const [chipId, setChipId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Geef een beschrijving van het signaal');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await api.reportFraud({
        type,
        description: description.trim(),
        chipId: chipId.trim() || undefined,
      });
      setMessage('Signaal ingediend. Een geverifieerde dierenarts beoordeelt het.');
      setChipId('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-signal-page">
      <h1>Onregelmatigheid melden</h1>
      <p className="page-intro">
        Meld een signaal over de herkomstketen van een dier. Een <strong>geverifieerde
        dierenarts</strong> beoordeelt het voordat het effect heeft — dit voorkomt valse
        claims. Een bevestigd signaal verlaagt de verifieerbaarheid van de keten, nooit
        als publiek oordeel over een persoon.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type signaal</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            {SIGNAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="chipId">Chipnummer betrokken dier (optioneel)</label>
          <input
            id="chipId"
            type="text"
            value={chipId}
            onChange={(e) => setChipId(e.target.value)}
            placeholder="528-1234-5678-9012"
          />
          <small className="form-hint">
            Vul je dit in, dan koppelen we het signaal aan de juiste registratie.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Beschrijving</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Beschrijf wat je hebt waargenomen"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Indienen...' : 'Signaal indienen'}
        </button>
      </form>
    </div>
  );
}
