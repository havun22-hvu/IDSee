---
title: IDSee Handover
type: claude
scope: idsee
last_updated: 2026-06-13
---

# IDSee — Handover

> Vul dit aan aan het einde van elke sessie.

## Huidige status

**Branch:** master (schoon)

**Demo-prototype werkt end-to-end** (webapp + backend + demo-blockchain).
Zie `docs/INDEX.md` voor de volledige status-tabel.

### Afgerond (13 juni 2026)

- [x] **Frontend verificatie-flow** — `Verification.tsx`: e-mailverificatie,
      aanvraag indienen, peer-verificatie met borg, borg vrijgeven
- [x] **Frontend bevestigingen** — `Confirmations.tsx`: fokker bevestigt/wijst af + historie
- [x] **Animal-detailpagina** — `AnimalDetail.tsx` op route `/animals/:id`
- [x] Bijvangst: `vite-env.d.ts` toegevoegd (build was kapot op `import.meta.env`);
      `emailVerified` toegevoegd aan `GET /auth/me`
- [x] **Teststack** — Jest (backend, 19 tests) + Vitest (frontend, 7 tests).
      `npm test` in beide mappen. Kritieke paden: hashing, JWT/rolchecks, API-client.

### Openstaande items (prioriteit hoog → laag)

1. **Mollie-betalingen** — nu uitgecommentarieerd; dev-mode geeft credits direct ⚠️ env/credentials
2. **E-mailservice** — token wordt gelogd i.p.v. verstuurd ⚠️ SMTP-credentials
3. **Cardano uit demo mode** — Lucid + Blockfrost koppelen, contracts deployen ⚠️ env/credentials
4. **Midnight ZK** — gepland, zie `docs/midnight/INTEGRATION-PLAN.md` (architect-traject `/arch`)
5. **Testdekking uitbreiden** — integration tests met test-DB (supertest + Prisma)

> De 5 resterende items vereisen credentials/env, nieuwe dependencies of een
> architect-blauwdruk — telkens eerst overleg met Henk.

### Security (uit `/start` audit)
- backend: `bcrypt`-keten high-severity (vereist `npm audit fix --force`, breaking)
- frontend: `react-router-dom` 3× high (veilig op te lossen via `npm audit fix`)

### B-traject geïmplementeerd (14 juni 2026)

Alle docs afgestemd op `docs/PROPOSITION.md` (leidend), en het B-traject gebouwd in
3 fasen (plan: `.claude/plan-b-traject.md`):

- **Fase 1 — risico-score** 🟢/🟠/🔴 in `/verify` (`riskScore.ts` + `verificationService.ts`)
- **Fase 3 — fraude-cascade** arts-bevestigd, gradueel (`fraudService.ts`, `FraudReview.tsx`)
- **Fase 2 — €2-betaling** met demo-provider (`paymentService.ts`, `CheckTransaction`)

Tests: backend 43 / frontend 16, beide builds groen. Schema via `prisma db push`
(migrate is non-interactief hier — een echte migratie genereren is een open punt voor CI/prod).

**Nog open (v1.1 / overleg):**
- Echte Mollie activeren: `@mollie/api-client` (dependency) + `MOLLIE_API_KEY` (.env) ⚠️ overleg
- Meld-ingang in UI voor fraudesignalen (nu API-only `POST /fraud/report`)
- Integration tests met test-DB (402-gating, cascade end-to-end)
- `GET /verify/:chipId` afschermen in productie (gratis-lek naast de betaalde flow)
- ZK-migratie (Midnight) — zie `PROPOSITION.md` §9 + blueprint §4

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
