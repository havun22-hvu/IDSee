import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          IDSee
        </Link>

        <nav className="nav">
          {/* Koper of niet ingelogd: alleen verifieer */}
          {(!user || user.role === 'BUYER') && (
            <Link to="/verify" className="nav-link">Verifieer</Link>
          )}

          {user && user.role === 'BUYER' && (
            <button onClick={logout} className="btn-logout">
              Uitloggen
            </button>
          )}

          {/* Fokker menu */}
          {user && user.role === 'BREEDER' && (
            <>
              <Link to="/dashboard" className="nav-link">Overzicht</Link>
              <Link to="/animals" className="nav-link">Mijn Dieren</Link>
              <Link to="/animals/new" className="nav-link">Registreren</Link>
              <div className="user-menu">
                <Link to="/credits" className="credits-badge">
                  {user.credits} credits
                </Link>
                <button onClick={logout} className="btn-logout">
                  Uitloggen
                </button>
              </div>
            </>
          )}

          {/* Dierenarts menu */}
          {user && user.role === 'VET' && (
            <>
              <Link to="/dashboard" className="nav-link">Overzicht</Link>
              <Link to="/animals" className="nav-link">Registraties</Link>
              <Link to="/animals/new" className="nav-link">Nieuw Dier</Link>
              <div className="user-menu">
                <Link to="/credits" className="credits-badge">
                  {user.credits} credits
                </Link>
                <button onClick={logout} className="btn-logout">
                  Uitloggen
                </button>
              </div>
            </>
          )}

          {/* Chipper menu */}
          {user && user.role === 'CHIPPER' && (
            <>
              <Link to="/dashboard" className="nav-link">Overzicht</Link>
              <Link to="/animals" className="nav-link">Chips</Link>
              <Link to="/animals/new" className="nav-link">Chip Registreren</Link>
              <div className="user-menu">
                <Link to="/credits" className="credits-badge">
                  {user.credits} credits
                </Link>
                <button onClick={logout} className="btn-logout">
                  Uitloggen
                </button>
              </div>
            </>
          )}

          {/* Admin menu */}
          {user && user.role === 'ADMIN' && (
            <>
              <Link to="/admin" className="nav-link">Beheer</Link>
              <Link to="/dashboard" className="nav-link">Overzicht</Link>
              <button onClick={logout} className="btn-logout">
                Uitloggen
              </button>
            </>
          )}

          {/* Niet ingelogd */}
          {!user && (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Inloggen</Link>
              <Link to="/register" className="btn-primary">Account maken</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
