---
title: IDSee Handover
type: claude
scope: idsee
last_updated: 2026-06-17
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

**DATAMODEL-GEVOLGEN voor implementatie — ✅ verwerkt 17 juni 2026 (zie hieronder).**

### §3b/§4/§5/§9-ronde (17 juni 2026)

Code volledig nagekeken tegen `PROPOSITION.md` §3b, §4, §5, §9 + de openstaande
datamodel-gevolgen. Vier punten in volgorde geïmplementeerd (elk eigen commit):

1. **§5 — chip-hash gepepperd.** `hashChipId` was kale SHA-256 (brute-force-baar op
   15-cijferig chipnummer) → nu **HMAC met `CHIP_HASH_PEPPER`** (verplicht in prod,
   dev/test-fallback). `.env.example` bijgewerkt. ⚠️ pepper NOOIT wijzigen na ingebruikname.
2. **§4 — notitie-/kaartensysteem.** `ProfessionalNote` + `User.cardStatus`
   (GEEN/GEEL/ROOD). Notitie alleen door admin/geverifieerde arts (`POST /fraud/note`).
   Gele/rode kaart waardeert de keten-score af (GROEN→ORANJE). Drempels configureerbaar
   via `/admin/config/cards` (default geel=3, rood=6).
3. **§3a — 🔵 Geverifieerde import + IMPORT-schakel.** `RiskScore` kreeg `BLAUW`;
   `ImportRecord` (land, traceerbare herkomst-id, EU-paspoort + omgezet-vlag, arts-controle),
   `POST /imports` (geverifieerde arts). Geïmporteerde pup wordt op de import-schakel
   gescoord i.p.v. een (buitenlandse) moeder — eerlijke importeur wordt niet meer gestraft.
   Frontend: 🔵-badge, import-bewuste factoren, `RegisterImport`-pagina + arts-navlink.
4. **§9 — feit vs. bevestigd signaal.** `FraudReport.category` (SIGNAAL/FEIT). Arts kan
   een melding als **neutraal feit** vastleggen (legale paspoort-omzetting = geen
   beschuldiging, cascadeert niet). Alleen CONFIRMED **SIGNAAL** telt in de cascade.

Tests: backend **64 unit + 19 integration**, frontend **21** — alles groen.

### Herkomstmodel-herziening (17 juni 2026, MPC fase 1→3)

Inhoudelijk overleg (zie `docs/PROPOSITION.md` §3/§3a/§4/§4a, herzien) → plan
(`.claude/plan-herkomstmodel.md`) → code in 5 stappen (elk eigen commit):

- **Stap 0:** `HealthRecord` model geschrapt (geen gezondheidsdata, §3b).
- **Stap 1:** score-grenzen herzien — **NL-claim zonder moeder → 🔴 ROOD** (was oranje);
  GROEN vereist nu moeder + UBN + houder-bevestiging + geverifieerde arts. Factoren
  `ubnPresent`/`breederConfirmed` toegevoegd.
- **Stap 2:** cascade = **open/niet-herstelde** discrepanties; `resolveFraud` (alleen
  arts/chipper, nooit eigenaar); drempels herstructureerd naar `{red:3, block:10}`,
  **geen oranje-persoon-stap**. `FraudReport.resolvedAt/resolvedById/coSubjectProfessionalId`.
- **Stap 3:** `Registration.motherResidency` (EIGEN_LOCATIE/BIJ_DERDE = feit), `User.idseeConsent`;
  **dual-flag toerekening** — bij vet-gecontroleerde import-schakel deelt de arts (scenario 2),
  cascade-teller telt subject OF co-subject. UBN + verblijf in `RegisterAnimal`.
- **Stap 4:** **volume per UBN** als objectief feit (pups + moeders, 12 mnd), alleen bij
  `idseeConsent`; getoond onder de score (geen oordeel, §4a).

Positionering aangescherpt: **positief NL-herkomstbewijs**, geen handelaar-jacht — de
fraudeur *haalt geen groen* i.p.v. *wordt rood gemaakt*. Score nu 🟢/🔵/🟠/🔴.

Tests na deze ronde: backend **66 unit + 23 integration**, frontend **21** — groen.

**Nog open — later:**
- **Dual-flag eigenaar vs. registrant zuiver scheiden** — nu valt de UBN-houder vaak samen
  met de registrant; volledige scheiding vereist account-koppeling van de fokker.
- **Import-uitzondering Spanje/Griekenland** (asiel/stichting) — §9, Henk denkt na.
- **Toestemming-intrekking vs. check-op-koopmoment verankeren** — §9.
- Multi-account/multi-UBN clustering (fase 2); echte ZKP (nu demo).

### Lopende brainstorm: privacy- & deploy-architectuur (17 juni 2026, WIP)

Open ontwerpdiscussie — **morgen verder**. Volledige vastlegging met alle voors/tegens
en Henk's gewenste eindbeeld in **`docs/PRIVACY-ARCHITECTUUR.md`**. Kern: server vs.
on-chain; chip/UBN = (indirect) persoonsgegeven; ZKP/Midnight maakt inhoud anoniem maar
lost het **orakel-/enumeratieprobleem** niet op; de **€2-check is de rate-limit**;
convergeert voorlopig naar **Midnight (shielded ZK-OK) + een dunne betaal/rate-limit-poort**.
Open vraag #1: mag/kan IDSee een OK schrijven/uitlezen bij de officiële chipdatabank?
- ZK-migratie (Midnight) — `PROPOSITION.md` §9 + blueprint §4 (eigen `/arch`-traject)
- Frontend dev-only audit: 5 advisories in vite/vitest; fix = `vite@8` (3 majors) — uitgesteld
- **Code afslanken naar minimale dataset (§3b)** — HealthRecord/Animal dragen meer dan
  identifiers+koppeling+bevestiging; apart implementatietraject (§9).
- Escalatie-parameters ijken op echte data (leer-marge, tijdvenster, gewicht per signaal) — §9
- DPIA + juridische review vóór productie — §9
- `.claude/blueprint.md` (B-traject, 14 juni) is uitgevoerd/stale — kan opgeruimd.

## Architectuurprincipes

- Gemini = architect (groot contextvenster, blauwdrukken via `/arch`)
- Claude = validator + executor (implementatie via `/mpc`)
- Blueprint flow: `/arch [opdracht]` → `.claude/blueprint.md` → `/mpc ga maar`
- Blockchain-rolverdeling: Cardano = immutable registratie-proof; Midnight = privacy-laag
  voor anonieme professional-verificatie (complementair, geen of/of)
