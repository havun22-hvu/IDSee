import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { CreditBundle, CreditTransaction } from '../types';

export function Credits() {
  const { user, refreshUser } = useAuth();
  const [bundles, setBundles] = useState<CreditBundle[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bundlesData, transactionsData] = await Promise.all([
        api.getCreditBundles(),
        api.getCreditTransactions(),
      ]);
      setBundles(bundlesData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load credits data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(bundleId: string) {
    setPurchasing(bundleId);
    setMessage('');

    try {
      const result = await api.purchaseCredits(bundleId);

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.success) {
        setMessage('Credits toegevoegd!');
        await refreshUser();
        await loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Aankoop mislukt');
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="credits-page">
      <h1>Credits</h1>

      <div className="credits-balance">
        <span className="balance-label">Huidige balans</span>
        <span className="balance-amount">{user?.credits ?? 0}</span>
        <span className="balance-unit">credits</span>
      </div>

      {message && (
        <div className={`alert ${message.includes('mislukt') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <section className="bundles-section">
        <h2>Credits kopen</h2>
        <div className="bundles-grid">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="bundle-card">
              <div className="bundle-credits">{bundle.credits}</div>
              <div className="bundle-label">credits</div>
              <div className="bundle-price">€{bundle.price}</div>
              <div className="bundle-per-credit">
                €{(bundle.price / bundle.credits).toFixed(2)} per credit
              </div>
              <button
                className="btn-primary btn-full"
                onClick={() => handlePurchase(bundle.id)}
                disabled={purchasing !== null}
              >
                {purchasing === bundle.id ? 'Laden...' : 'Kopen'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="history-section">
        <h2>Transactiegeschiedenis</h2>
        {transactions.length === 0 ? (
          <p className="empty-state">Nog geen transacties.</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Type</th>
                <th>Omschrijving</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString('nl-NL')}</td>
                  <td>{getTypeName(tx.type)}</td>
                  <td>{tx.description || '-'}</td>
                  <td className={tx.amount > 0 ? 'positive' : 'negative'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    PURCHASE: 'Aankoop',
    USAGE: 'Gebruikt',
    REFUND: 'Terugbetaling',
  };
  return names[type] || type;
}
