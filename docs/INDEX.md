# IDSee Documentatie

> Privacy-bewarende verificatie van dierlijke afkomst op Cardano/Midnight

## Inhoudsopgave

### Project Overzicht
- [README](../README.md) - Project introductie en quick start
- [ARCHITECTURE](./ARCHITECTURE.md) - Technische architectuur
- [CHANGELOG](./CHANGELOG.md) - Versiegeschiedenis

### Contracts (Aiken)
- [Types](./contracts/TYPES.md) - Datastructuren en types
- [Registry](./contracts/REGISTRY.md) - Registry validator uitleg
- [Verification](./contracts/VERIFICATION.md) - Verificatie logica (Midnight)

### Frontend (React/TypeScript)
- [Setup](./frontend/SETUP.md) - Frontend installatie
- [Components](./frontend/COMPONENTS.md) - React componenten
- [Auth](./frontend/AUTH.md) - Authenticatie en wallet integratie

### Handleidingen
- [Fokker](./guides/FOKKER.md) - Handleiding voor fokkers
- [Dierenarts](./guides/DIERENARTS.md) - Handleiding voor dierenartsen
- [Koper](./guides/KOPER.md) - Handleiding voor kopers

---

## Quick Start

```bash
# Frontend starten (demo mode)
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Project Status

| Component | Status | Versie |
|-----------|--------|--------|
| Contracts | Basis compleet | 0.2.0 |
| Frontend | Werkend (demo) | 0.3.0 |
| Wallet | CIP-30 integratie | 0.3.0 |
| Midnight ZK | Gepland | - |

---

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Smart Contracts | Aiken |
| Privacy Layer | Midnight (planned) |
| Frontend | React + TypeScript |
| Blockchain | Cardano (Lucid) |
| Build Tool | Vite |
