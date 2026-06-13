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

### Openstaande items (prioriteit hoog → laag)

1. **Frontend verificatie-flow** — pagina's voor email-/peer-verificatie (backend gereed)
2. **Frontend bevestigingen** — fokker bevestigt/wijst registratie af (backend gereed)
3. **Animal-detailpagina** — `/animals/:id` route ontbreekt (link leidt naar 404)
4. **Mollie-betalingen** — nu uitgecommentarieerd; dev-mode geeft credits direct
5. **E-mailservice** — token wordt gelogd i.p.v. verstuurd
6. **Tests** — geen Jest/Vitest aanwezig
7. **Cardano uit demo mode** — Lucid + Blockfrost koppelen, contracts deployen
8. **Midnight ZK** — gepland, zie `docs/midnight/INTEGRATION-PLAN.md`

### Security (uit `/start` audit)
- backend: `bcrypt`-keten high-severity (vereist `npm audit fix --force`, breaking)
- frontend: `react-router-dom` 3× high (veilig op te lossen via `npm audit fix`)

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
