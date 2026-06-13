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

### Openstaande items (prioriteit hoog → laag)

1. **Mollie-betalingen** — nu uitgecommentarieerd; dev-mode geeft credits direct ⚠️ env/credentials
2. **E-mailservice** — token wordt gelogd i.p.v. verstuurd ⚠️ SMTP-credentials
3. **Tests** — geen Jest/Vitest aanwezig ⚠️ nieuwe dependencies
4. **Cardano uit demo mode** — Lucid + Blockfrost koppelen, contracts deployen ⚠️ env/credentials
5. **Midnight ZK** — gepland, zie `docs/midnight/INTEGRATION-PLAN.md` (architect-traject `/arch`)

> De 5 resterende items vereisen credentials/env, nieuwe dependencies of een
> architect-blauwdruk — telkens eerst overleg met Henk.

### Security (uit `/start` audit)
- backend: `bcrypt`-keten high-severity (vereist `npm audit fix --force`, breaking)
- frontend: `react-router-dom` 3× high (veilig op te lossen via `npm audit fix`)

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
