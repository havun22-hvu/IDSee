# Plan — Herkomst-/score-/cascademodel (herziening 17 juni 2026)

> Sturend: `docs/PROPOSITION.md` §3, §3a, §4, §4a (herzien 17 juni). Dit plan zet die
> docs om in code. Fase 3 (MPC) start pas na expliciet "ga maar".

## Uitgangspunt
Dit is een **herontwerp van de net (vandaag) gebouwde cascade/score**, geen losse
aanvulling. Fundament blijft (chip-HMAC, ImportRecord+`vetCheckedDocuments`, feit/signaal,
`ProfessionalNote`/`cardStatus`, pure score-functie). De **teller-semantiek** en
**toerekening/score-grenzen** veranderen wezenlijk.

## Stappen (elk = atomic commit, tests voor + na)

### Stap 0 — `HealthRecord` schrappen
- `schema.prisma`: model `HealthRecord` + `Animal.healthRecords` relatie weg.
- `npx prisma db push` + generate. Geen code/seed/tests raken het (geverifieerd).
- **Risico:** nihil.

### Stap 1 — Score-grenzen herzien (rood = NL-claim zonder moeder)
- `types/index.ts` (backend + frontend): `ScoreFactors` verfijnen — voeg `ubnPresent`,
  `breederConfirmed` toe (UBN-houder bevestigde nest/moeder).
- `riskScore.ts` (pure):
  - `found && !imported && !motherKnown` → **ROOD** (was ORANJE).
  - GROEN vereist nu: `motherKnown && ubnPresent && breederConfirmed && breederVerified`.
  - Import/cascade/kaart-takken ongemoeid.
- `verificationService.ts`: lever de nieuwe factoren (UBN op registratie, breederConfirmed).
- `RiskScoreBadge.tsx`: rood-tekst aanscherpen ("keten sluit niet: moeder onbekend").
- **Tests:** `riskScore.test.ts` — geen-moeder = ROOD; groen-eisen uitgebreid. Integration
  `verifyFraud`/`imports` herijken op nieuwe groen-voorwaarden.
- **Risico:** verse NL-registratie zonder moeder is direct rood (gewenst); UI moet "koppel
  moeder" duidelijk maken. Bestaande seed/tests moeten breederConfirmed zetten voor groen.

### Stap 2 — Discrepantie: open/herstel + toerekening + drempel 3
- `schema.prisma` `FraudReport`: + `resolvedAt DateTime?`, `resolvedById String?`,
  `coSubjectProfessionalId String?` (de arts die "akkoord" stempelde; melder ≠ subject).
- `fraudPolicy.ts`: `DEFAULT_THRESHOLDS` → leren <3, **rood ≥3**, geen oranje-stap
  (orange == red == 3, of herstructureer naar {learn, red, block}); block hoger houden.
- `fraudService.ts`:
  - `assessUserFraudStatus`: tel `CONFIRMED && category=SIGNAAL && resolvedAt=null`.
  - `confirmFraud`: toerekening — bij een `vetCheckedDocuments`-schakel ook de arts als
    co-subject; herbereken status van eigenaar **én** arts.
  - **nieuw** `resolveFraud(id, professionalId)` — alleen arts/chipper; zet `resolvedAt`;
    herbereken cascade (teller daalt).
- `routes/fraud.ts`: `POST /fraud/:id/resolve` (geverifieerde arts/chipper).
- **Tests:** 2 open = leren (niet oranje); 3 open = rood; resolve verlaagt terug; melder
  krijgt geen flag, vetChecked-arts wel.
- **Risico:** herziet de bestaande "2 confirmed → ORANJE"-integratietest (wordt leren/rood).

### Stap 3 — Moeder per nest/pup + UBN verplicht + residency + consent
- `schema.prisma`: `Registration.breederUbn` verplicht maken voor NL; `motherResidency`
  (EIGEN_LOCATIE | BIJ_DERDE). `User.idseeConsent Boolean @default(false)` (UBN-houder
  vrijwillig + toestemming = AVG-grond voor flag/volume-tonen).
- `animals.ts`/`confirmations.ts`: UBN bij registratie; moeder-koppeling **per registratie/
  pup** (geen globale teef-hergebruik over actieve nesten); breederConfirmed = houder-bevestiging.
- Score (stap 1) leest breederConfirmed/UBN.
- **Tests:** groen vereist UBN + houder-bevestiging; BIJ_DERDE met bevestiging blijft groen.

### Stap 4 — Volume per UBN als objectief feit
- `verificationService.ts` of nieuw `ubnStatsService.ts`: tel pups/nesten/teven per
  `breederUbn` (12 mnd). Geen norm-toetsing.
- Expose in verify-result (`ubnVolume`) of apart endpoint; **alleen voor deelnemers met
  consent**.
- Frontend: toon naast de score als feit ("X pups · Y nesten · Z teven, 12 mnd").
- **Tests:** telling klopt; geen consent → niet getoond.

## Volgorde & afhankelijkheden
0 → 1 → 2 → 3 → 4. Stap 1 hangt op de nieuwe factoren; stap 3 vult breederConfirmed/UBN die
stap 1 leest (stap 1 kan met defaults eerst, stap 3 scherpt aan). Stap 2 staat los van 1/3.

## Bewust buiten scope (fase 2-maas, PROPOSITION §9)
- Multi-account / multi-UBN clustering.
- Echte ZKP (nu demo); anonimisering is conceptueel.
- Import-uitzondering Spanje/Griekenland (Henk denkt na).
- Toestemming-intrekking vs. verankerde check-op-koopmoment.
- Brede §3b-dataminimalisatie (alleen HealthRecord nu).

## Definition of done
Backend unit + integration groen, frontend build + tests groen, na elke stap commit+push.
Score-semantiek matcht PROPOSITION §3/§4 exact.
