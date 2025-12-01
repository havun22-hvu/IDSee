import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>IDSee</h1>
        <p className="hero-subtitle">
          Controleer de herkomst van je nieuwe huisdier
        </p>
        <Link to="/verify" className="btn-primary btn-large">
          Verifieer nu
        </Link>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3>Voor Kopers</h3>
          <p>Controleer of een pup traceerbaar is en van een geregistreerde fokker komt. Gratis en zonder account.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🏠</span>
          <h3>Voor Fokkers</h3>
          <p>Registreer je nesten en pups. Bewijs de legitimiteit van je fokkerij aan potentiele kopers.</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">⚕️</span>
          <h3>Voor Dierenartsen</h3>
          <p>Registreer chips en gezondheidsgegevens. Alles wordt veilig opgeslagen op de blockchain.</p>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Hoe werkt het?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Vraag het chipnummer</h4>
            <p>Vraag de fokker of dierenarts om het chipnummer van het dier</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Voer het in</h4>
            <p>Voer het chipnummer in op onze verificatiepagina</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Bekijk resultaat</h4>
            <p>Zie direct of het dier geregistreerd en traceerbaar is</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Professional?</h2>
        <p>Registreer als fokker, dierenarts of chipper en begin met registreren.</p>
        <Link to="/register" className="btn-secondary">
          Account aanmaken
        </Link>
      </section>
    </div>
  );
}
