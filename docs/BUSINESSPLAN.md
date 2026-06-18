# IDSee — Businessplan (B2B / B2G)

> Intern document. Strategie, gaten, rol. Niet voor externe partijen — daarvoor: `PROPOSAL.md`.
> Opgesteld 18 juni 2026 · Henk (architect, praktiserend dierenarts) + Claude
> Leidend blijft `PROPOSITION.md` — dit plan vertaalt die propositie naar een B2B/B2G-route.

---

## 0. Kern in drie zinnen

IDSee is een **herkomst-verificatielaag** voor honden zonder stamboom: een geverifieerde
dierenarts koppelt moeder-chip aan pup-chip op locatie, waardoor de herkomst aantoonbaar
sluit — iets wat het EU-paspoort en de wettelijke databank nu níét borgen. Na analyse is
de eindklant **niet de consument** (B2C is te zwak: fraudeurs doen niet mee, eerlijke
fokkers tonen de moeder zelf), maar **organisaties die herkomst op schaal en op afstand
moeten beoordelen** (B2B) of **de bevoegde instanties zelf** (B2G). De rol van IDSee is
die van **techniek-leverancier en bewijs-van-concept**, niet die van concurrent van het
wettelijke systeem.

---

## 1. Het probleem (bevestigd, scherp)

- EU-paspoort wordt afgegeven door een **gemachtigde dierenarts**, los van de
  chip-/eigenaar-registratie in de aangewezen databank.
- Niemand in die keten borgt de **herkomst** (de koppeling naar de moeder/oorsprong).
  Buitenlandse paspoorten worden legaal omgezet; papier is makkelijk te regelen.
- Het **ongeborgde segment** = niet-stamboom pups (kruisingen, gelegenheidsnestjes,
  import). Stamboomdieren (Raad van Beheer) vallen buiten scope — daar is afstamming al
  geborgd.
- Dit segment is precies waar de malafide commerciële handel zit, en waar geen enkele
  partij nu een betrouwbaar herkomst-signaal heeft.

## 2. Waarom B2B/B2G i.p.v. B2C

| Doelgroep | Waarom (niet) | Verdict |
|-----------|---------------|---------|
| **B2C (koper)** | Fraudeur doet niet mee; eerlijke fokker toont de moeder live; niet-stamboom-koper is prijsbewust en geen kenner. Waarde hangt op massa-adoptie die we niet sturen. | ⚠️ Te zwak als fundament |
| **B2B** | Verzekeraars, marktplaatsen, asielen beoordelen dieren **op schaal/op afstand** — "moeder tonen" is geen optie. Zij kunnen het niet zelf oplossen. | ✅ Kansrijk |
| **B2G** | NVWA / LNV / databank-beheerder missen exact deze herkomst-laag. Risico: zij kopiëren het. Kans: wij leveren de blauwdruk/techniek. | ✅ Hoogste hefboom, traagste traject |

## 3. Doelgroepen B2B/B2G — wie, waarom, betalingsbereidheid

| Klant | Probleem dat wij oplossen | Betaalt voor | Bereidheid |
|-------|---------------------------|--------------|------------|
| **Verzekeraars (huisdier)** | Risico/herkomst onbekend bij polis-aanvraag | Lager schaderisico, betere acceptatie | Hoog — schade is geld |
| **Online marktplaatsen** | Malafide advertenties; reputatie- en wetgevingsdruk | Keurmerk-API, onderscheid, compliance | Midden–hoog |
| **Asielen / opvang** | Herkomst binnengebracht dier onbekend | Tracering | Laag budget |
| **NVWA / LNV / databank** | Geen herkomst-borging in keten | Blauwdruk, techniek, handhavingssignaal | Hoog mandaat, traag |
| **Brancheorganisaties / Dibevo e.d.** | Sectorimago, zelfregulering | Keurmerk-infrastructuur | Midden |

## 4. Wat we al hebben (assets)

- Werkend **demo-prototype**: backend (Node/Express/Prisma), frontend (React), risico-score
  🟢🔵🟠🔴, IMPORT-schakel, fraude-cascade, notitie-/kaartensysteem, volume-per-UBN.
- Doordachte, juridisch zorgvuldige **propositie** (`PROPOSITION.md`) — geen schuldoordeel,
  AVG-bewust, dataminimalisatie.
- **Domeinkennis uit de praktijk** (Henk = dierenarts) — het schaarste-goed: weten hoe het
  echt werkt, niet hoe het op papier zou moeten.
- Geautomatiseerde tests, schone security (0 vulns productie-deps).

## 5. Wat ONTBREEKT (eerlijk) en wat we eraan doen

| # | Gat | Impact | Wat we eraan doen |
|---|-----|--------|-------------------|
| 1 | **Geen gevalideerde klant.** Niemand heeft "ja, ik betaal" gezegd. | Existentieel | **Eerst** 3–5 verkennende B2B/B2G-gesprekken (zie §7), vóór verder bouwen. |
| 2 | **Geen koppeling met officiële bronnen** (chipdatabank, UBN, paspoort-uitgifte). | Hoog | Uitzoeken of/hoe API-koppeling mag; alternatief: arts voert in (model staat al in §3b). **NB:** we concurreren niet met I&R — I&R legt een fokker-*claim* vast, IDSee een arts-*waarneming* op het nest-moment (zie PROPOSITION §3a). |
| 3 | **Bevoegdheid/mandaat.** Wie zegt dat een IDSee-arts-bevestiging "geldt"? | Hoog (B2G) | Positioneren als aanvulling, niet vervanging; in B2G-gesprek de juridische status agenderen. |
| 4 | **Geen jurist/DPIA.** AVG-claims zijn nu zelf-analyse. | Hoog vóór productie | DPIA + juridische review inplannen vóór eerste betalende inzet. |
| 5 | **Henk is single point of failure** (tijd, kennis, gezondheid). | Midden | Stichting + bestuur (§11 PROPOSITION); kennis vastleggen in docs; eventueel mede-bouwer. |
| 6 | **Geen go-to-market / sales.** Henk is arts, geen verkoper. | Midden | Klein, gericht netwerk via de beroepsgroep eerst; later partner of bestuurslid met B2B-ervaring. |
| 7 | **Schaalbaarheid arts-pool.** Het model leunt op geverifieerde artsen die meedoen. | Midden–hoog | Via beroepsnetwerk/KNMvD verkennen; het feit dat de arts dit tóch al doet (paspoort) verlaagt de drempel. |
| 8 | **Verdienmodel B2B/B2G nog niet doorgerekend.** | Midden | Per klanttype een prijsmodel schetsen na de eerste gesprekken (abonnement/API-call/licentie). |

## 6. Onze rol — wat spelen wij?

Drie mogelijke rollen, niet wederzijds uitsluitend; volgorde = oplopend mandaat:

1. **Bouwer/leverancier (nu).** Wij bouwen en draaien de herkomst-verificatielaag en bieden
   die als dienst/API aan B2B-klanten. Henk = domein + bouw; stichting = drager.
2. **Standaard-zetter / blauwdruk (B2G-ambitie).** Wij bewijzen dat het werkt en leveren
   het concept/de techniek aan NVWA/LNV/databank — als adviseur of leverancier. Henk's
   arts-autoriteit is hier de troef.
3. **Kennis-/data-autoriteit.** Op termijn: de partij die het meest weet over herkomst-
   patronen in het ongeborgde segment — waardevol voor toezicht, verzekering, sector.

> **Principe blijft (§11):** geen winst-opstrijken; stichting; vergoeding voor werk via
> oprichtersvordering. B2B/B2G-inkomsten dekken kosten, reserve, en daarna de vordering.

## 7. Plan van aanpak — fasen

### Fase 1 — Klantvalidatie (nu, 0 nieuwe code) — *6–8 weken*
- 3–5 gesprekken: min. 1 verzekeraar, 1 marktplaats, 1 publieke partij (NVWA/LNV/databank
  of KNMvD als ingang).
- Doel: **vraagbevestiging**, niet verkoop. Vraag: "hebben jullie dit probleem, lossen
  jullie het nu op, en zou een herkomst-signaal waarde hebben?"
- Instrument: `PROPOSAL.md` (1-pager + demo).
- **Go/No-Go:** minstens 1 partij met serieuze interesse → Fase 2. Anders: heroverwegen.

### Fase 2 — Pilot met 1 partner — *3–6 maanden*
- Eén betalende of co-developing partner. Scope klein houden (één use-case, één regio).
- Pas hier: bepalen of API-koppeling met bronnen nodig/mogelijk is; DPIA starten.
- Prototype aanpassen aan de échte eis van die partner (niet speculatief).

### Fase 3 — Opschalen / B2G-gesprek — *6–12 maanden*
- Met pilot-bewijs naar de bevoegde instanties: "het werkt, hier is het bewijs."
- Verdienmodel verharden; bestuur/partner aantrekken voor sales/schaal.

## 8. Risico's (top 5)

1. **Niemand betaalt** → ondervangen door Fase 1 vóór bouw.
2. **Overheid kopieert het** → positioneer als leverancier/blauwdruk, niet concurrent.
3. **Arts-pool komt niet van de grond** → leun op "de arts doet dit tóch al" + beroepsnetwerk.
4. **Henk overbelast** → stichting + kennis in docs + mede-bouwer/bestuur.
5. **Juridisch (AVG/aansprakelijkheid)** → DPIA + review vóór betalende inzet.
6. **Dekking hangt aan het nest-bezoek.** Groen kan alleen waar de arts/chipper de moeder
   op locatie ziet (vóór 7 weken). Losse-pup-/import-handelingen leveren geen groen — dat
   is bedoeld (het signaal), maar het betekent dat de dekking afhangt van het aantal
   nest-bezoeken. → Aanhechten aan het verplichte nest-bezoek dat tóch al plaatsvindt
   (vaccineren + chippen); via beroepsnetwerk artsen/chippers werven (zie PROPOSITION §3a).

## 9. Wat ik (Claude) nu kan opleveren

- ✅ `PROPOSAL.md` — externe 1-pager/pitch voor B2B/B2G (hieronder als apart doc).
- Gesprekshandleiding per klanttype (verzekeraar / marktplaats / publiek) — op verzoek.
- Verdienmodel-schets per klanttype zodra Fase 1 input geeft.
- Demo presentabel maken (alleen UI-politoer, geen features) — op verzoek.

> **Volgende stap = mensen bellen, geen code schrijven.** Het plan staat of valt bij
> Fase 1. Alles wat ik bouw vóór een bevestigde klant is risico, geen voortgang.
