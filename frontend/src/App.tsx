// IDSee - Main Application

import { WalletConnect, VerifyAnimal } from "./components";
import { useWallet, useVerification } from "./hooks";

function App() {
  const wallet = useWallet();
  const verification = useVerification(wallet.lucid);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>IDSee</h1>
        <p style={styles.subtitle}>
          Privacy-bewarende verificatie van dierlijke afkomst
        </p>
      </header>

      <main style={styles.main}>
        {/* Wallet Section */}
        <WalletConnect
          availableWallets={wallet.availableWallets}
          connected={wallet.connected}
          address={wallet.address}
          balance={wallet.balance}
          walletName={wallet.walletName}
          loading={wallet.loading}
          error={wallet.error}
          demoMode={wallet.demoMode}
          onConnect={wallet.connect}
          onDisconnect={wallet.disconnect}
        />

        {/* Verification Section */}
        <VerifyAnimal
          onVerify={verification.verify}
          result={verification.result}
          loading={verification.loading}
          error={verification.error}
          onReset={verification.reset}
        />

        {/* Info Cards */}
        <div style={styles.infoGrid}>
          <InfoCard
            title="Voor Kopers"
            description="Controleer of een pup afkomstig is van een erkende fokker voordat je koopt."
            icon="🔍"
          />
          <InfoCard
            title="Voor Fokkers"
            description="Bewijs de legitimiteit van je fokkerij zonder persoonlijke gegevens te delen."
            icon="🏠"
          />
          <InfoCard
            title="Voor Dierenartsen"
            description="Registreer dieren en gezondheidsgegevens direct op de blockchain."
            icon="⚕️"
          />
        </div>
      </main>

      <footer style={styles.footer}>
        <p>
          IDSee is een DApp op de Cardano blockchain met toekomstige Midnight
          integratie voor Zero-Knowledge privacy.
        </p>
        <p style={styles.techStack}>
          <strong>Stack:</strong> Aiken | TypeScript | React | Lucid
        </p>
      </footer>
    </div>
  );
}

function InfoCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div style={styles.infoCard}>
      <span style={styles.infoIcon}>{icon}</span>
      <h3 style={styles.infoTitle}>{title}</h3>
      <p style={styles.infoDescription}>{description}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#1a365d",
    margin: 0,
  },
  subtitle: {
    color: "#4a5568",
    fontSize: "1.1rem",
    marginTop: "0.5rem",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  infoCard: {
    padding: "1.5rem",
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    textAlign: "center",
  },
  infoIcon: {
    fontSize: "2rem",
  },
  infoTitle: {
    margin: "0.75rem 0 0.5rem",
    color: "#2d3748",
  },
  infoDescription: {
    margin: 0,
    color: "#718096",
    fontSize: "0.9rem",
  },
  footer: {
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
    color: "#718096",
    fontSize: "0.875rem",
  },
  techStack: {
    marginTop: "0.5rem",
  },
};

export default App;
