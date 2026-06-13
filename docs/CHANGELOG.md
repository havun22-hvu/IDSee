# Changelog

Alle belangrijke wijzigingen aan IDSee worden hier gedocumenteerd.

## [0.5.0] - 2026-06-13

### Toegevoegd
- **Verificatie-flow (frontend):** `Verification.tsx` — e-mailverificatie,
  verificatie-aanvraag indienen, peer-verificatie met credits-borg en borg vrijgeven
- **Bevestigingen (frontend):** `Confirmations.tsx` — fokker bevestigt of wijst
  registraties van dierenartsen/chippers af, inclusief historie
- **Dier-detailpagina:** `AnimalDetail.tsx` op route `/animals/:id`
- Navigatie en dashboard-acties uitgebreid voor de nieuwe pagina's
- `emailVerified` toegevoegd aan `GET /auth/me`
- **Teststack opgezet:**
  - Backend: Jest + ts-jest — 19 tests voor blockchain-hashing (privacy-kritiek)
    en auth-middleware/JWT (security-kritiek)
  - Frontend: Vitest + Testing Library — 7 tests voor de API-client (token,
    401-afhandeling, foutparsing) en de `AnimalDetail`-pagina
  - `npm test` in beide mappen

### Opgelost
- Build was kapot door ontbrekende `src/vite-env.d.ts` (`import.meta.env`
  werd door `tsc` niet herkend) — bestand toegevoegd

---

## [0.4.0] - 2024-12-01

### Architectuurwijziging
- **Pivot naar webapp + backend.** De eerdere frontend-only opzet met directe
  wallet-integratie (CIP-30, Lucid in de browser) is vervangen door een klassieke
  webapp met een eigen backend. Blockchain is nu volledig server-side en onzichtbaar
  voor gebruikers — geen wallet meer nodig. De componenten `WalletConnect`,
  `useWallet` en `lucid.ts` uit v0.2.0/v0.3.0 zijn daarmee komen te vervallen.

### Toegevoegd
- **Backend (Node.js/Express + Prisma):**
  - REST API op `http://localhost:8006`, SQLite database, JWT-auth met rollen
    (BUYER, BREEDER, VET, CHIPPER, ADMIN)
  - Routes: auth, animals, verify, credits, verification, confirmations, admin
  - Credits-systeem met bundels, transacties en peer-verificatie-borg
  - Blockchain-service in demo mode (gesimuleerde `demo_tx_*` hashes)
- **Frontend (React/Vite):**
  - 9 pagina's: Home, Login, Register, Verify, Dashboard, Animals,
    RegisterAnimal, Credits, Admin
  - Rol-specifieke Header en Dashboard, `ProtectedRoute` met RBAC
  - `AuthContext` + fetch-gebaseerde API-client
- **Verificatiesysteem:** email-verificatie, peer-verificatie met credits-borg,
  dubbele bevestiging door fokker (backend gereed, frontend-flow nog te bouwen)

### Bekende beperkingen
- Mollie-betalingen uitgecommentarieerd (dev-mode geeft credits direct)
- E-mail wordt naar console gelogd i.p.v. verstuurd
- Cardano draait permanent in demo mode (Lucid/Blockfrost nog niet gekoppeld)
- Geen geautomatiseerde tests

---

## [0.3.0] - 2024-12-01

### Toegevoegd
- **Demo Mode:** Frontend werkt nu zonder Blockfrost API key
  - Mock verificatie resultaten voor UI testen
  - Demo badge in wallet component
  - Console logging voor development

- **Wallet Integratie:**
  - Native CIP-30 API ondersteuning
  - Werkt met Nami, Eternl en Lace wallets
  - Adres en balans weergave

### Gewijzigd
- `lucid.ts` vereenvoudigd voor demo mode
- `useWallet.ts` gebruikt nu direct wallet API
- WalletConnect toont DEMO badge wanneer geen API key

---

## [0.2.0] - 2024-11-30

### Toegevoegd
- **Contracts uitgebreid:**
  - `validation.ak` - Validatie helpers en regels
  - `health.ak` - Health records validator
  - `verification.ak` - Verificatie logica voor afkomst

- **Frontend volledig opgezet:**
  - React componenten (WalletConnect, VerifyAnimal)
  - Custom hooks (useWallet, useVerification)
  - Lucid integratie voor Cardano
  - TypeScript types matching Aiken contracts

### Gewijzigd
- App.tsx herschreven met component-gebaseerde architectuur
- Verbeterde chip ID formattering (XXX-XXXX-XXXX-XXXX)

---

## [0.1.0] - 2024-11-30

### Toegevoegd
- Initiële projectstructuur aangemaakt
- Aiken smart contract basis met types en registry validator
- Documentatie structuur opgezet
- Frontend package.json met Lucid dependency

### Datastructuren gedefinieerd
- `Animal` - Geregistreerd dier met chip ID
- `Breeder` - Erkende fokker
- `CertifiedProfessional` - Dierenarts/Chipper
- `HealthRecord` - Gezondheidsgegevens

---

## Roadmap

### Volgende stappen
- [ ] Frontend-pagina's voor verificatie- en bevestigingsflow (backend gereed)
- [ ] Animal-detailpagina (`/animals/:id` — route ontbreekt nog)
- [ ] Mollie-betalingen activeren (webhook + checkout)
- [ ] E-mailservice koppelen (verificatie- en notificatiemails)
- [ ] Geautomatiseerde tests (Jest backend, Vitest frontend)
- [ ] Cardano uit demo mode halen: Lucid + Blockfrost, contracts deployen op Preview
- [ ] Midnight ZK-integratie (zie `docs/midnight/INTEGRATION-PLAN.md`)
