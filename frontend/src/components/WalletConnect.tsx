// Wallet connection component

import type { SupportedWallet } from "../lib/lucid";

interface WalletConnectProps {
  availableWallets: SupportedWallet[];
  connected: boolean;
  address: string | null;
  balance: string | null;
  walletName: SupportedWallet | null;
  loading: boolean;
  error: string | null;
  onConnect: (wallet: SupportedWallet) => void;
  onDisconnect: () => void;
}

const walletIcons: Record<SupportedWallet, string> = {
  nami: "🦊",
  eternl: "🌙",
  lace: "💎",
};

export function WalletConnect({
  availableWallets,
  connected,
  address,
  balance,
  walletName,
  loading,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  if (connected && address) {
    return (
      <div style={styles.container}>
        <div style={styles.connectedInfo}>
          <span style={styles.walletIcon}>
            {walletName && walletIcons[walletName]}
          </span>
          <div>
            <div style={styles.walletName}>{walletName}</div>
            <div style={styles.address}>
              {address.slice(0, 12)}...{address.slice(-8)}
            </div>
            {balance && <div style={styles.balance}>{balance} ADA</div>}
          </div>
        </div>
        <button onClick={onDisconnect} style={styles.disconnectBtn}>
          Verbreken
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Verbind Wallet</h3>

      {error && <div style={styles.error}>{error}</div>}

      {availableWallets.length === 0 ? (
        <p style={styles.noWallet}>
          Geen wallet gevonden. Installeer Nami, Eternl of Lace.
        </p>
      ) : (
        <div style={styles.walletList}>
          {availableWallets.map((wallet) => (
            <button
              key={wallet}
              onClick={() => onConnect(wallet)}
              disabled={loading}
              style={styles.walletBtn}
            >
              <span style={styles.walletIcon}>{walletIcons[wallet]}</span>
              <span>{wallet.charAt(0).toUpperCase() + wallet.slice(1)}</span>
            </button>
          ))}
        </div>
      )}

      {loading && <div style={styles.loading}>Verbinden...</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  title: {
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    color: "#2d3748",
  },
  connectedInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  walletIcon: {
    fontSize: "1.5rem",
  },
  walletName: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  address: {
    fontSize: "0.75rem",
    color: "#718096",
    fontFamily: "monospace",
  },
  balance: {
    fontSize: "0.875rem",
    color: "#38a169",
    fontWeight: "500",
  },
  disconnectBtn: {
    marginTop: "0.75rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  walletList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  walletBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#f7fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  noWallet: {
    color: "#718096",
    fontSize: "0.875rem",
  },
  loading: {
    marginTop: "0.5rem",
    color: "#718096",
  },
  error: {
    padding: "0.5rem",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "4px",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  },
};
