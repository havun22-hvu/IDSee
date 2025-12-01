import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type RoleType = 'BUYER' | 'BREEDER' | 'VET' | 'CHIPPER';

const ROLE_INFO: Record<RoleType, { label: string; idLabel: string; idPlaceholder: string }> = {
  BUYER: { label: 'Koper', idLabel: '', idPlaceholder: '' },
  BREEDER: { label: 'Fokker', idLabel: 'KvK nummer', idPlaceholder: '12345678' },
  VET: { label: 'Dierenarts', idLabel: 'BIG nummer', idPlaceholder: '99123456789' },
  CHIPPER: { label: 'Chipper', idLabel: 'NVWA certificaat', idPlaceholder: 'NVWA-2024-001' },
};

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RoleType>('BUYER');
  const [professionalId, setProfessionalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn');
      return;
    }

    if (role !== 'BUYER' && !professionalId) {
      setError(`${ROLE_INFO[role].idLabel} is verplicht`);
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        role,
        professionalId: role !== 'BUYER' ? professionalId : undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Account aanmaken</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Wachtwoord</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Ik ben een</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as RoleType)}
            >
              {Object.entries(ROLE_INFO).map(([value, info]) => (
                <option key={value} value={value}>{info.label}</option>
              ))}
            </select>
          </div>

          {role !== 'BUYER' && (
            <div className="form-group">
              <label htmlFor="professionalId">{ROLE_INFO[role].idLabel}</label>
              <input
                type="text"
                id="professionalId"
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                placeholder={ROLE_INFO[role].idPlaceholder}
                required
              />
              <small className="form-hint">
                Je account wordt geverifieerd voordat je kunt registreren.
              </small>
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Laden...' : 'Registreren'}
          </button>
        </form>

        <p className="auth-footer">
          Al een account? <Link to="/login">Inloggen</Link>
        </p>
      </div>
    </div>
  );
}
