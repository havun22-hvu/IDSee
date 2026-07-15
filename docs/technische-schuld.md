---
title: IDSee — technische schuld (bij het parkeren, 15-07-2026)
type: reference
scope: idsee
last_check: 2026-07-15
---

# IDSee — technische schuld die klaarligt

> Uit `.claude/handover.md` gehaald om die leesbaar te houden (max 120 regels).
> **Status:** IDSee is geparkeerd (Henk, 02-07). Dit is wat een volgende sessie moet weten vóór
> er weer code bij komt. Elk punt is op 15-07 geverifieerd tegen de code, niet overgenomen op
> gevoel.

**Technische schuld die klaarligt (geverifieerd 15-07-2026):**

- **Echte Prisma-migratie ontbreekt.** `backend/prisma/migrations/` bevat alleen
  `20251201195154_init`, en die is aantoonbaar verouderd: hij maakt nog `HealthRecord` aan
  (inmiddels geschrapt) en mist `CheckTransaction`, `FraudReport`, `ImportRecord`,
  `ProfessionalNote`, `SystemConfig`, `PeerVerification` en `VerificationRequest`. Al het
  schemawerk sinds december is via `prisma db push` gegaan omdat de migrate-tooling
  non-interactief is vanuit Claude. Vóór CI of productie moet dit een echte migratie worden:
  `cd backend && npx prisma migrate dev --name fraud_payment` (moet Henk zelf draaien).
- **`@mollie/api-client` staat in de verkeerde `package.json`.** De dependency staat in de
  root-`package.json` (die verder niets bevat — per ongeluk daar ontstaan), terwijl
  `backend/src/services/paymentService.ts` hem top-level importeert. Lokaal werkt dat alleen
  omdat Node hem via de parent-`node_modules` vindt; een schone `cd backend && npm ci` breekt
  hierop. Verplaats hem naar `backend/package.json` en ruim de root-package.json op.
  (Nieuw gevonden 15-07, stond nog nergens genoteerd.)
- **Cardano staat hard in demo mode.** `backend/src/services/blockchain.ts` heeft
  `const demoMode = true;` gehardcodeerd — geen env-schakelaar. Echte registratie vereist
  `BLOCKFROST_KEY` + `WALLET_SEED` én het weghalen van die constante. De Aiken-contracten zijn
  geschreven, nooit gedeployed.
- **Midnight ZK-migratie.** Volledig ongestart; fase 0 = Academy-cursus (zie vaste context).
- **Frontend dev-only audit.** `vite` staat op `^5.0.0` met 5 dev-only advisories; fix = `vite@8`
  (drie majors), bewust uitgesteld. Productie-deps zijn schoon: `npm audit --omit=dev` geeft
  0 vulnerabilities in frontend én backend.

**Doc-werk dat nog openstaat:**

- **Opslag-eindbeeld verwerken in de docs.** Henk's keuze (19-06): de data hoort uiteindelijk bij
  de partner of overheid (NVWA/databank), IDSee levert het mechanisme en wordt nadrukkelijk géén
  concurrerend eigen register. Maar dat is het *eindbeeld*, niet het beginpunt: demo en pilot
  draaien tot een deal op een eigen managed database, dus de opslaglaag moet verwisselbaar
  gebouwd worden (logica los van opslag — `src/db.ts` heeft die scheiding al deels).
  Geverifieerd: dit staat nog steeds **niet** in `BUSINESSPLAN.md` §6 of `PROPOSITION.md` §3b.
- **Stale plan-bestanden opruimen:** `.claude/blueprint.md` (B-traject, 14 juni),
  `.claude/plan-b-traject.md` en `.claude/plan-herkomstmodel.md` zijn alle drie uitgevoerd en
  gecommit. Git bewaart de historie; ze kunnen weg.
