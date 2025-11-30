# Frontend Setup

## Vereisten

- Node.js v18 of hoger
- npm of yarn
- Cardano wallet browser extension (Nami, Eternl, Lace)

---

## Installatie

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output in `dist/` folder.

---

## Projectstructuur

```
frontend/
├── src/
│   ├── components/     # React componenten
│   │   ├── WalletConnect.tsx
│   │   ├── VerifyAnimal.tsx
│   │   ├── RegisterAnimal.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useLucid.ts
│   │   └── useRegistry.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── lib/            # Utilities
│   │   └── lucid.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Configuratie

### Environment Variables

Maak `.env.local`:

```env
VITE_NETWORK=Preview  # Preview, Preprod, of Mainnet
VITE_BLOCKFROST_KEY=your_api_key
```

### Blockfrost API

1. Ga naar [blockfrost.io](https://blockfrost.io)
2. Maak gratis account
3. Maak nieuw project (Preview network voor testen)
4. Kopieer API key naar `.env.local`

---

## Dependencies

| Package | Doel |
|---------|------|
| `@lucid-evolution/lucid` | Cardano interactie |
| `react` | UI framework |
| `react-router-dom` | Routing |
| `vite` | Build tool |
| `typescript` | Type checking |

---

## Scripts

| Command | Beschrijving |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
