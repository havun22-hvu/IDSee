# IDSee Documentatie

> Privacy-bewarende verificatie van dierlijke afkomst — webapp met blockchain onder de motorkap (Cardano nu, Midnight ZK gepland)

## Inhoudsopgave

### Project Overzicht
- [README](../README.md) - Project introductie en quick start
- [ARCHITECTURE](./ARCHITECTURE.md) - Technische architectuur
- [DEVELOPMENT](./DEVELOPMENT.md) - Ontwikkelfases en roadmap
- [CHANGELOG](./CHANGELOG.md) - Versiegeschiedenis
- [VERIFICATION](./VERIFICATION.md) - Verificatie- en bevestigingssysteem

### Backend (Node.js/Express + Prisma)
- [Backend Setup](./backend/SETUP.md) - Installatie, database, seed

### Frontend (React/TypeScript/Vite)
- [Frontend Setup](./frontend/SETUP.md) - Installatie en dev-server
- [Components](./frontend/COMPONENTS.md) - React componenten
- [Auth](./frontend/AUTH.md) - JWT-authenticatie en rollen

### Smart Contracts (Aiken — geschreven, nog niet gedeployed)
- [Types](./contracts/TYPES.md) - Datastructuren en types
- [Registry](./contracts/REGISTRY.md) - Registry validator
- [Verification](./contracts/VERIFICATION.md) - Verificatie-validator
- [Governance](./contracts/GOVERNANCE.md) - Governance-model

### Midnight ZK (gepland)
- [Overview](./midnight/OVERVIEW.md) - Wat is Midnight en waarom
- [Integratieplan](./midnight/INTEGRATION-PLAN.md) - Fasering richting ZK-proofs
- [ZK-patterns](./midnight/ZK-PATTERNS.md) - Gebruikte ZK-patronen
- [Compact-taal](./midnight/COMPACT-LANGUAGE.md) - Smart-contracttaal
- [Hoskinson-context](./midnight/HOSKINSON-CONTEXT.md) - Achtergrond

### Handleidingen
- [Koper](./guides/KOPER.md) - Handleiding voor kopers
- [Fokker](./guides/FOKKER.md) - Handleiding voor fokkers
- [Dierenarts](./guides/DIERENARTS.md) - Handleiding voor dierenartsen
- [Credits](./guides/CREDITS.md) - Credits-systeem uitleg

---

## Quick Start

```bash
# Backend (API op http://localhost:8006)
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (webapp op http://localhost:5173)
cd frontend
npm install
npm run dev
```

---

## Project Status (2026-06-13)

| Component | Status | Toelichting |
|-----------|--------|-------------|
| Database (Prisma/SQLite) | ✅ Af | 8 modellen, migration + seed |
| Auth (JWT + rollen) | ✅ Af | 5 rollen, RBAC, credits-middleware |
| Backend API | ✅ Grotendeels | ~22 endpoints; enkele TODO-stubs |
| Frontend webapp | ✅ Af | 12 pagina's, alle rollen |
| Verificatie/bevestiging | ✅ Af | Backend + frontend (`Verification`, `Confirmations`, `AnimalDetail`) |
| Blockchain (Cardano) | 🟡 Demo mode | Fake `demo_tx_*`, Lucid nog niet gekoppeld |
| Aiken contracts | 🟡 Geschreven | 5 `.ak`-bestanden, nog niet gedeployed |
| Payments (Mollie) | ❌ Niet af | Uitgecommentarieerd; dev-mode geeft credits |
| Email | ❌ Niet af | Token wordt gelogd i.p.v. verstuurd |
| Midnight ZK | 🔵 Gepland | Zie integratieplan |
| Tests | 🟡 Opgezet | Jest (backend, 19) + Vitest (frontend, 7); kritieke paden gedekt |

---

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt |
| Blockchain (registratie-proof) | Cardano (demo mode, Lucid later) |
| Privacy-laag (gepland) | Midnight ZK (Compact) |
| Smart contracts | Aiken |
| Payments | Mollie (iDEAL, creditcard) |
