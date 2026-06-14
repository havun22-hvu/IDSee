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

### Docs getoetst aan PROPOSITION.md (14 juni 2026)

Alle docs zijn afgestemd op `docs/PROPOSITION.md` (leidend). Doorgevoerd: €2 risico-score
i.p.v. gratis booleans, borg-pool verwijderd → arts-bevestigde cascade, gen-1 wallet-
instructies weg, positionering "beter alternatief / geen vervangingsclaim".

**Nog open — B-traject (code, vereist `/arch`-blauwdruk):**
- Risico-score 🟢/🟠/🔴 in `/verify` (nu nog booleans in `VerifyResult`/`verify.ts`)
- Fraude-cascade + graduele flag + arts-bevestiging (datamodel + ZK-statements)
- €2 koper-betaling (Mollie) — hangt aan het payments-item
- Zie `PROPOSITION.md` §9 voor de open ontwerppunten (drempels, ZK, DPIA)

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
