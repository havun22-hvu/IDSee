---
title: IDSee Handover
type: claude
scope: idsee
last_updated: 2026-07-15
---

# IDSee — Handover

> **Één handover, bijwerken — nooit een sessieblok toevoegen.** Levende status, geen logboek.
> Afgerond = weg (git bewaart het). Max ~120 regels. Regel:
> `HavunCore/docs/kb/standards/md-doc-grootte.md`.

**Status:** ⏸️ GEPARKEERD (Henk, 02-07-2026) — het demo-prototype werkt end-to-end en het
inhoudelijke model is uitgekristalliseerd, maar het project wacht op een markttoets (klantgesprekken
B2B/B2G) vóór er nog een regel code bij komt. "Nog lang niet aan de beurt."
**Branch:** master (schoon, laatste inhoudelijke commit 20-06-2026)

## Waar het project stond bij het parkeren

Het prototype draait volledig lokaal: webapp (React/Vite) + backend (Express/Prisma/SQLite) +
een gesimuleerde blockchain. De teststack is groen, geverifieerd op 15-07-2026: backend 66 unit +
23 integration, frontend 21 tests.

Inhoudelijk is het herkomst- en scoremodel af en geïmplementeerd conform `docs/PROPOSITION.md`
(leidend document — bij conflict wint dat boven alle andere docs). De score kent vier uitkomsten:
🟢 groen (moeder + UBN + houder-bevestiging + geverifieerde arts), 🔵 geverifieerde import,
🟠 oranje en 🔴 rood (een NL-claim zónder moeder is rood). Daaromheen werken de fraude-cascade op
arts-bevestigde signalen, het notitie-/kaartensysteem op de professional, de €2-check met
betaalpoort, en volume-per-UBN als objectief feit. De positionering is bewust *positief
herkomstbewijs*: een fraudeur haalt geen groen, in plaats van dat hij rood gemaakt wordt.

De grootste openstaande beweging is strategisch, niet technisch. Op 18-06-2026 is besloten dat
B2C (een koper-app) een te zwak fundament is — fraudeurs doen niet mee en de niet-stamboom-koper
is prijsbewust. De richting is verschoven naar **B2B/B2G**: verzekeraars, marktplaatsen, NVWA/LNV.
Daarbij hoort `docs/BUSINESSPLAN.md` fase 1 = **klantvalidatie, 3 tot 5 gesprekken, expliciet
GEEN nieuwe code**, met een Go/No-Go aan het eind. Het project is geparkeerd vóór die gesprekken
gevoerd zijn. Wie hier weer instapt begint dus bij het telefoonnummer, niet bij de editor.

Twee dingen waren bij het parkeren echt onaf. Er liep een **brainstorm over de privacy- en
deploy-architectuur** die nooit is afgemaakt (`docs/PRIVACY-ARCHITECTUUR.md`, WIP); die
convergeerde richting Midnight met een dunne betaal-/rate-limit-poort, maar de kernvraag stond
nog open: mag en kan IDSee een OK schrijven of uitlezen bij de officiële chipdatabank? Daarnaast
stond er een **onbeantwoorde kernvraag over de rol** van IDSee (zie onder).

## Open — als het weer aan de beurt is

**Eerst, vóór alle code — fase 1 klantvalidatie.** 3 tot 5 gesprekken met partners uit
`docs/BUSINESSPLAN.md`, met `docs/PROPOSAL.md` (extern) en `docs/PITCH.md` (praatplaat) als
materiaal. Daarna pas Go/No-Go. Een gesprekshandleiding per klanttype bestaat nog niet en kan
gemaakt worden.

**De open kernvraag (Henk denkt na — NIET voor Claude om te beslissen):** welke rol is
onafneembaar naast de bestaande regelingen? De beroepsgroep snapt "afkomst moet kloppen" snel
zelf, en de overheid belt een groot IT-bedrijf zodra ze het invoeren. De lijn tot nu toe: de rol
zit in het principe-bewijs (werkend simpel prototype + het argument uit `docs/WAAROM-SIMPEL.md`)
plus vakautoriteit en draagvlak — moeilijker af te pakken dan techniek of data. Drie opties op
tafel, niets gekozen: (1) protocol plus beroepsgroep, (2) techniek-leverancier, (3) volledige dienst.

**Technische schuld die klaarligt** — vier concrete punten, elk geverifieerd tegen de code op
15-07: de echte Prisma-migratie ontbreekt (alles ging via `db push`), `@mollie/api-client` staat in
de verkeerde `package.json` (schone `npm ci` in `backend/` breekt), Cardano staat hard in demo mode
(`const demoMode = true`, geen env-schakelaar), en het opslag-eindbeeld staat nog niet in de docs.
Details + bewijs: **`docs/technische-schuld.md`**.


**Inhoudelijke vragen die openstaan — uitgewerkt in `PROPOSITION.md` §9, hier alleen de kop:**
dual-flag eigenaar versus registrant zuiver scheiden (vereist account-koppeling van de fokker);
import-uitzondering Spanje/Griekenland voor asiel/stichting (Henk denkt na); toestemming-
intrekking versus check-op-koopmoment verankeren; multi-account/multi-UBN clustering (fase 2);
code afslanken naar de minimale dataset (`Animal` draagt nu meer dan identifiers, koppeling en
bevestiging — apart traject); escalatie-parameters ijken (kan pas met echte data); DPIA plus
juridische review vóór productie.

**Wachtend op Henk (geen code meer nodig, alles staat klaar achter env-vlaggen):** Mollie
aanzetten via `PAYMENT_PROVIDER=mollie` + `MOLLIE_API_KEY`, en e-mail via `EMAIL_PROVIDER=smtp` +
de `SMTP_*`-waarden. Zie `backend/.env.example`.

## Vaste context voor dit project

**Midnight Network (ZK-proofs).** Fokkers, dierenartsen en chippers bewijzen hun certificering
zonder hun identiteit prijs te geven. De contracttaal is **Compact**, een TypeScript-achtige DSL —
dus nadrukkelijk **geen Rust** — en de SDK is Midnight.js. De backend genereert proofs
server-side; gebruikers zien nooit iets van de blockchain. Fase 0 is de Academy-cursus, vóór
implementatie. Docs: `docs/midnight/` (OVERVIEW, ZK-PATTERNS, COMPACT-LANGUAGE, INTEGRATION-PLAN).
Rolverdeling: Cardano = immutable registratie-proof, Midnight = privacylaag voor anonieme
professional-verificatie — complementair, geen of/of. Nuance uit de B2B/B2G-pivot: voor B2B/B2G is
blockchain **niet noodzakelijk**; het is een optionele bewijslaag, geen fundament.

**Praktijkfeiten die de propositie dragen (door Henk als praktiserend dierenarts gevalideerd).**
De wet eist chip plus aanmelding binnen 7 weken door de fokker, maar dat is een fokker-*claim*,
geen geverifieerde moeder-koppeling. De moeder-chip wordt bij aanmelding wél gemeld, maar
ongecontroleerd (de eigenaar geeft het nummer op) en komt **niet in het pup-paspoort**.
Communiceer dit precies: niet "I&R legt de moeder niet vast" (onjuist), wél "een ongecontroleerd
opgegeven nummer, niet in het paspoort". Kort: I&R heeft een *veld*, IDSee een *getuige*. De
moeder is alleen fysiek aanwezig bij het **nest-bezoek** (vaccineren en chippen) — daar zit het
verificatiemoment én het operationele risico (BUSINESSPLAN risico #6: de dekking hangt aan die
bezoeken). Het EU-paspoort wordt afgegeven door een gemachtigde dierenarts, los van de
I&R-databank. **Stamboomdieren (Raad van Beheer) vallen buiten scope** — afstamming daar is al
geborgd; IDSee mikt op het ongeborgde niet-stamboom-segment: kruisingen, gelegenheidsnestjes,
import.

**Valkuilen.** De `CHIP_HASH_PEPPER` mag **nooit** gewijzigd worden na ingebruikname: alle
bestaande chip-hashes worden er ongeldig door. Hij is verplicht in productie (min. 16 tekens);
dev en test vallen terug op een vaste waarde. De score meet **verifieerbaarheid van de keten,
niet schuld** — dat is de juridische kern (§5) en het moet ook zo gecommuniceerd worden. De
Cardano-pool is wél kostendekking maar uitdrukkelijk **geen anoniem betaalkanaal** (witwasrisico).

**Werkwijze.** Gemini is de architect (groot contextvenster, blauwdrukken via `/arch`), Claude de
validator en executor (implementatie via `/mpc`). Flow: `/arch [opdracht]` →
`.claude/blueprint.md` → `/mpc ga maar`.
