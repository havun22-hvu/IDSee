---
title: IDSee Handover
type: claude
scope: idsee
last_updated: 2026-06-15
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

> ⚠️ De bovenstaande "Afgerond 13 juni"-lijst en de oorspronkelijke openstaande/
> security-items zijn **ingehaald** door het werk van 14 juni (zie hieronder):
> Mollie + e-mail (env-gated), integration-tests en security (0 vulns) zijn gedaan.
> Nog wél open: Cardano uit demo mode + Midnight ZK. Actuele stand: "Nog open" verderop.

### B-traject geïmplementeerd (14 juni 2026)

Alle docs afgestemd op `docs/PROPOSITION.md` (leidend), en het B-traject gebouwd in
3 fasen (plan: `.claude/plan-b-traject.md`):

- **Fase 1 — risico-score** 🟢/🟠/🔴 in `/verify` (`riskScore.ts` + `verificationService.ts`)
- **Fase 3 — fraude-cascade** arts-bevestigd, gradueel (`fraudService.ts`, `FraudReview.tsx`)
- **Fase 2 — €2-betaling** met demo-provider (`paymentService.ts`, `CheckTransaction`)

Tests: backend 43 / frontend 16, beide builds groen. Schema via `prisma db push`
(migrate is non-interactief hier — een echte migratie genereren is een open punt voor CI/prod).

**Afgerond (vervolg 14 juni):**
- [x] Meld-ingang fraudesignaal in UI (`/report-signal`, melden via chipnummer)
- [x] `GET /verify/:chipId` achter auth (gratis-lek gedicht)
- [x] `dev.db` uit git + `.gitignore` gefixt
- [x] **db/app-refactor**: `src/db.ts` (gedeelde prisma) + `src/app.ts` (createApp) — server-start los
- [x] **Integration tests** (`jest.integration.config.cjs`): 402-gating + cascade end-to-end
- [x] **Mollie-provider** (env-gated) + **SMTP-emailservice** (env-gated) — code-compleet, demo default
- [x] **Security**: productie-deps **0 vulnerabilities** (jws/express/bcrypt@6/nodemailer@9)

- [x] **Zachte koper-signalen**: koper meldt na betaalde check (`POST /verify/report-soft`),
      `source=BUYER`, telt pas na arts-bevestiging
- [x] **Admin drempel-UI**: cascade-drempels instelbaar via `/admin` (GET/PUT `/admin/config`)

Tests: backend 47 unit + 10 integration / frontend 19, alles groen.

**Nog open — vereist JOUW actie (geen code meer):**
- Mollie aanzetten: `.env` → `PAYMENT_PROVIDER=mollie` + `MOLLIE_API_KEY` (key bij Mollie ophalen)
- E-mail aanzetten: `.env` → `EMAIL_PROVIDER=smtp` + `SMTP_*` (zie `.env.example`)
- Echte Prisma-migratie genereren: `! cd backend && npx prisma migrate dev --name fraud_payment`
  (tooling is non-interactief vanuit Claude; nu via `db push`)

### Strategie-verfijning PROPOSITION.md (14 juni 2026, avond)

Inhoudelijke sessie met Henk (architect + praktiserend dierenarts) — `docs/PROPOSITION.md`
flink uitgebreid. Géén code, puur strategie/ontwerp. Kernbeslissingen vastgelegd:

- **Positionering = beter alternatief** (geen vervangingsclaim wettelijk register).
- **Score = verifieerbaarheid van de keten, NIET schuld** (juridische kern, §5).
- **Graduele escalatie**: leren → 🟠 → 🔴 → blokkade. Doel = commerciële volume-handelaar
  (>10 pups), NIET de eerlijke fokker/kruimeldief. Op patroon+volume, niet één incident.
- **§3a — De keten die moet sluiten**: kracht zit in moeder-chip ↔ pup-chip, gelegd door
  een **onafhankelijke geverifieerde arts/chipper** (niet de fokker zelf).
- **Legale import = eigen label 🔵 "Geverifieerde import"** (geen kleur op NL-schaal),
  vastgelegd door geverifieerde NL-arts via aparte `IMPORT`-schakel. Onderscheid
  legaal/illegaal = verifieerbaarheid buitenlandse herkomst, niet wel/geen NL-moeder.
- **UBN-analyse**: UBN is locatie/dierziekte-systeem, geen herkomst-/anti-fraude. Het
  versterkt IDSee (officiële identifier om keten aan te hangen + bewijst dat
  registratie ≠ verifieerbare keten).
- **§10 — 30%-adoptievraag**: waarde zit in afwezigheid; netwerkeffect aan VRAAGkant
  (kopers), niet aanbodkant. Faalscenario eerlijk: voorlichtingsstrijd, niet techniek.
- **§11 — Organisatie**: stichting als schild (4 redenen), géén zelf-bevestiging van
  fraude door oprichter, **oprichtersvordering €60/u (~500u ≈ €30k), geen plafond**,
  afbetaling via harde waterval (kosten → reserve → max 30% overschot), €100/mnd
  AI-onkosten. Cardano-pool = wél kostendekking, GÉÉN anoniem betaalkanaal (witwas).

**DATAMODEL-GEVOLGEN voor implementatie (nog te doen):**
- `IMPORT`-schakeltype náást moeder↔pup-koppeling als geldige ketensluiting
- 🔵-label apart van groen/oranje/rood in scorelogica + frontend
- Onderscheid *feit* (paspoort omgezet) vs. *bevestigd signaal* in datamodel

> ⚠️ Deze sessie raakte alleen `docs/PROPOSITION.md`. De code (riskScore, fraudService,
> payment) van eerder vandaag reflecteert deze verfijningen nog NIET volledig — bij
> volgende code-ronde: import-label 🔵 + datamodel-gevolgen verwerken.

**Nog open — later:**
- ZK-migratie (Midnight) — `PROPOSITION.md` §9 + blueprint §4 (eigen `/arch`-traject)
- Frontend dev-only audit: 5 advisories in vite/vitest; fix = `vite@8` (3 majors) — uitgesteld
- "Zachte" koper-signalen (melden zonder account) — §9
- DPIA + juridische review vóór productie — §9

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
