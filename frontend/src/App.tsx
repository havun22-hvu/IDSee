import { useState } from 'react'
import type { WalletState } from './types'

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    walletName: null,
  })

  const [chipId, setChipId] = useState('')
  const [verifying, setVerifying] = useState(false)

  async function connectWallet(name: 'nami' | 'eternl' | 'lace') {
    try {
      const cardano = (window as any).cardano
      if (!cardano?.[name]) {
        alert(`${name} wallet niet gevonden. Installeer de browser extensie.`)
        return
      }

      const api = await cardano[name].enable()
      // In production: setup Lucid here

      setWallet({
        connected: true,
        address: 'addr_test1...', // Would come from Lucid
        walletName: name,
      })
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  function disconnectWallet() {
    setWallet({
      connected: false,
      address: null,
      walletName: null,
    })
  }

  async function verifyAnimal() {
    if (!chipId || chipId.length < 15) {
      alert('Voer een geldig 15-cijferig chipnummer in')
      return
    }

    setVerifying(true)
    // TODO: Implement actual verification via Lucid
    setTimeout(() => {
      setVerifying(false)
      alert('Verificatie functionaliteit wordt nog geïmplementeerd')
    }, 1000)
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a365d' }}>IDSee</h1>
        <p style={{ color: '#4a5568' }}>Privacy-bewarende verificatie van dierlijke afkomst</p>
      </header>

      {/* Wallet Section */}
      <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h2>Wallet</h2>
        {wallet.connected ? (
          <div>
            <p>Verbonden met: <strong>{wallet.walletName}</strong></p>
            <p style={{ fontSize: '0.875rem', color: '#718096' }}>{wallet.address}</p>
            <button onClick={disconnectWallet} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Verbinding verbreken
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => connectWallet('nami')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Nami
            </button>
            <button onClick={() => connectWallet('eternl')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Eternl
            </button>
            <button onClick={() => connectWallet('lace')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Lace
            </button>
          </div>
        )}
      </section>

      {/* Verification Section */}
      <section style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h2>Pup Verifiëren</h2>
        <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
          Voer het chipnummer in om de afkomst te verifiëren
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="528-XXXX-XXXX-XXXX"
            value={chipId}
            onChange={(e) => setChipId(e.target.value.replace(/\D/g, ''))}
            maxLength={15}
            style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
          />
          <button
            onClick={verifyAnimal}
            disabled={verifying}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              cursor: verifying ? 'wait' : 'pointer'
            }}
          >
            {verifying ? 'Bezig...' : 'Verifiëren'}
          </button>
        </div>
      </section>

      {/* Info Section */}
      <footer style={{ marginTop: '2rem', color: '#718096', fontSize: '0.875rem' }}>
        <p>
          IDSee is een DApp op de Cardano blockchain voor het verifiëren van de
          legitieme afkomst van pups met behoud van privacy.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Tech:</strong> Aiken (Smart Contracts) | TypeScript + React | Lucid
        </p>
      </footer>
    </div>
  )
}

export default App
