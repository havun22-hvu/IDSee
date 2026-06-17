# IDSee — Propositie & Strategie

> Sturend document. Bij conflict met andere docs wint dit document.
> Vastgelegd 13 juni 2026 · auteur: Henk (architect, praktiserend dierenarts) + Claude

Dit document legt vast **waarom** IDSee bestaat, **hoe** het werkt voor de gebruiker,
**of** het juridisch houdbaar is, en **wat** het verdienmodel is. README, ARCHITECTURE
en VERIFICATION worden hierop afgestemd, niet andersom.

---

## 1. Het probleem dat het verplichte register níét oplost

De wettelijk verplichte registratie (chip + databank, aangewezen portalen) is in de
praktijk grotendeels **theater**:

- Het belast vooral **goedwillende** fokkers met administratie.
- Bad guys omzeilen het triviaal: een boekje met stempel, een enting erbij, en de
  geïmporteerde pup heeft een "Nederlands paspoortje".
- Niet goed ingevulde **buitenlandse paspoorten worden door reguliere dierenartsen
  legaal omgezet** in een Nederlands paspoort. Dat is niet eens verboden.
- Het register controleert **papierwerk-vooraf**, maar zegt niets over de
  **werkelijke herkomst** en biedt **geen detecteerbaarheid van fraude over de tijd**.

**Kernobservatie:** het probleem is niet een gebrek aan registratie. Het probleem is
dat registratie **geen verifieerbare keten** is en **niet leert** van fraude.

## 2. Positionering — beter alternatief, niet een aanvulling

IDSee positioneert zich expliciet als het **betere alternatief**: een herkomstketen
die wél sluit en die **fraude retroactief zichtbaar maakt**.

Waar het verplichte register een momentopname op papier is, is IDSee een
**verifieerbaarheids-netwerk** dat:

1. de hele keten vastlegt (fokker → moeder → arts/chipper → pup), en
2. bij bevestigde fraude **alle andere aanmeldingen van dezelfde persoon** signaleert.

> Juridische nuance (zie §5): "beter alternatief" is een **marketing-/product**positie.
> IDSee claimt nergens het wettelijke register te vervangen of te ontheffen. Wettelijke
> verplichtingen blijven gelden; IDSee biedt aanvullende, sterkere zekerheid.

## 3. Hoe het werkt voor de gebruiker

### Koper (de massa — betaalt per check)
1. Voert chipnummer in. Geen account nodig.
2. Krijgt één uitkomst: een **risico-score** (🟢 groen / 🔵 import / 🟠 oranje / 🔴 rood).
3. Betaalt **€2** per check (zie §6).

De score drukt **verifieerbaarheid van de herkomstketen** uit — **niet schuld**:

| Score | Betekenis |
|-------|-----------|
| 🟢 Groen | **NL-keten sluit, per nest/pup:** moeder-chip gekoppeld, UBN-houder (vrijwillig deelnemer + toestemming) bevestigt nest/moeder, en de koppeling is gelegd door een geverifieerde, niet-geflagde arts/chipper. |
| 🔵 Geverifieerde import | Geen NL-fok, maar de buitenlandse herkomst is traceerbaar én door een geverifieerde NL-arts gecontroleerd (§3a). **Eigen label, geen afwaardering** — de koper weegt zelf. |
| 🟠 Oranje | Verifieerbaarheid onvolledig: dier niet in IDSee (onbekend ≠ fout), of import zonder traceerbare bron. Géén schuldoordeel. |
| 🔴 Rood | Keten sluit aantoonbaar niet: **NL-claim zonder bekende moeder**, of een schakel die hoort bij een **structureel** (3× niet-hersteld) bevestigd patroon (§4). |

**Groen geldt per nest/pup, niet per teef.** Elke pup vereist een verse moeder-koppeling
die de arts bij dít nest legde; een moeder-chip wordt niet hergebruikt over nesten.

Een fraudeur scoort vanzelf rood/oranje **omdat zijn keten niet sluit**, niet omdat
het systeem hem "fraudeur" noemt. Hij hoeft niet rood *gemaakt* te worden — hij **haalt
simpelweg geen groen**. Dit onderscheid is juridisch essentieel (§5).

> **Positionering (aangescherpt 17 juni 2026):** import is wettelijk toegestaan en de
> NVWA handhaaft zwak — IDSee jaagt daarom **geen handelaren**, maar levert **positief
> bewijs** dat een pup een gewone NL-fok / gelegenheidsnestje is. De waarde zit in het
> groene bewijs (en de afwezigheid ervan, §10), niet in een rood persoonsoordeel.

### Professional (fokker / dierenarts / chipper — betaalt met credits)
- Registreert dieren en schakels in de keten tegen credits.
- Wordt geverifieerd via peer-verificatie (bestaand mechanisme, zie VERIFICATION.md).
- Een **geverifieerde dierenarts** kan een **fraudesignaal bevestigen** (zie §4).

## 3a. De keten die moet sluiten — het hart van IDSee

De waarde van IDSee zit **niet** in "is deze pup aangemeld?" (dat zou een gewoon register
zijn — net als het UBN). De waarde zit erin of de **herkomstketen aantoonbaar sluit**, en
of die sluiting door een **onafhankelijke, geverifieerde professional** is gelegd.

### De drie schakels

| Schakel | Wie | Wat |
|---------|-----|-----|
| Moeder + fokker | Fokker (met UBN) | Het nest / de moeder hoort bij deze fokkerslocatie. |
| **Moeder ↔ pup** | **Dierenarts / chipper (geverifieerd)** | **Checkt de moeder fysiek, leest haar chip, en koppelt de moeder-chip aan de pup-chip.** |
| Verificatie | Geverifieerde professional | De koppeling draagt de identiteit van wie haar legde. |

### Waarom de moeder↔pup-koppeling de kracht is

De fokker claimt **niet** zelf "dit is de moeder". Een **onafhankelijke, geverifieerde
professional** ziet de moeder op locatie, leest haar chip en koppelt die aan de pup-chip.
Een geverifieerde getuige-op-locatie, geen papieren bewering. Daardoor:

- Een handelaar kan **niet zelf** een moeder verzinnen — er moet een geverifieerde
  arts/chipper zijn die de moeder daadwerkelijk gezien en gechipt heeft.
- Een **geïmporteerde pup heeft geen NL-moeder met chip** in het systeem → de keten
  sluit niet → oranje/rood. Een vals paspoort regelen kan; een geverifieerde
  moeder-koppeling op locatie niet.
- Het **schaalt tegen volume:** voor élke pup zou een geverifieerde moeder-koppeling
  gefabriceerd moeten worden. Bij 10+ pups onmogelijk zonder dat een arts meewerkt — en
  die arts hangt zijn eigen geverifieerde reputatie eraan (en valt onder de cascade, §4).

> Dit raakt exact de **commerciële volume-handelaar** en spaart de eerlijke fokker /
> kruimeldief (§4). Het is het mechanisme dat het verplichte register en het UBN missen.

### Datamodel-eis

"Keten sluit" = de pup-registratie verwijst naar een **moeder-chip die in het systeem
bestaat**, **én** die koppeling is gelegd door een **geverifieerde, niet-geflagde**
professional. Zonder die koppeling zijn het losse records en is IDSee toch weer een gewoon
register.

> **Communicatie-grens:** de koper checkt of de **keten verifieerbaar sluit** — IDSee
> wijst **geen** malafide handel áán (§5). Een handelaar scoort vanzelf rood omdat zijn
> keten niet sluit, niet omdat IDSee "malafide" roept. Dit onderscheid is de juridische
> bescherming; verlies het niet in de communicatie naar kopers.

### Legaal geïmporteerde pup — de import-schakel

Een legaal geïmporteerde pup heeft **geen NL-moeder met chip** in het systeem; de moeder
zit in het buitenland. De naïeve regel "geen NL-moeder = rood" zou **elke legale import
rood kleuren** en juist de eerlijke importeur straffen. Dat mag niet.

Het onderscheid tussen legaal en illegaal is **niet** "wel/geen NL-moeder" (die hebben ze
geen van beide), maar de **verifieerbaarheid van de buitenlandse herkomst**:

| | Legale import | Illegale import |
|---|---|---|
| Buitenlandse herkomst | Traceerbaar: bekende buitenlandse fokker/herkomst-ID, geldig EU-paspoort | Onbekend / omgekat paspoort / geen traceerbare bron |
| Wie legt het vast | Geverifieerde NL-dierenarts die invoer + papieren fysiek controleert | Niemand, of papier-only |

**Oplossing: een aparte ketenschakel `IMPORT`**, vastgelegd door een **geverifieerde
NL-dierenarts** (consistent met de moeder-koppeling; de pup komt in de praktijk toch bij
een arts). De schakel bevat: land van herkomst, buitenlandse fokker-/herkomst-identifier
(zo traceerbaar mogelijk), EU-paspoortnummer + of het origineel of omgezet is, en de
bevestiging dat de arts de invoerpapieren zag.

**Score-effect — import is een eigen label, geen kleur op de NL-schaal:**

| Situatie | Uitkomst voor de koper |
|----------|------------------------|
| NL-geboren, moeder↔pup-koppeling sluit | 🟢 Groen |
| Geïmporteerd + import-schakel volledig (traceerbare herkomst + arts-controle) | 🔵 **Geverifieerde import** (eigen label) |
| Geïmporteerd, herkomst onbekend / paspoort omgezet zonder traceerbare bron | 🟠 Oranje |
| Geïmporteerd + onderdeel van bevestigd fraudepatroon (volume) | 🔴 Rood |

> **Waarom een eigen label en geen kleur:** het perst import niet in "minder dan groen",
> maar toont de koper eerlijk: *dit is geen NL-fok, maar de import is wél geverifieerd*.
> De koper weegt zelf. Een eerlijke importeur die transparant registreert haalt 🔵 — geen
> straf. De handelaar die importeert zonder traceerbare bron zakt naar 🟠, en bij
> volume/patroon naar 🔴. Exact het doel: de commerciële illegale handelaar raken, de
> legale importeur sparen.

## 3b. Dataminimalisatie — wat IDSee wél en niet opslaat

**Uitgangspunt (architect):** IDSee kan en wil **niet decennialang een grote database met
dierdata onderhouden**. Dat hoeft ook niet — de echte gegevens leven al elders (chip in de
chipdatabank, fokkerlocatie via UBN/RVO, arts in het beroepsregister).

### De arts/chipper is de bron van waarheid
IDSee bevraagt die brondatabases **niet** via een API. De waarde komt van de **getuigenis
van een geverifieerde professional**: de arts/chipper checkt fysiek dat **moeder én pup in
Nederland zijn en hier geboren**, leest de chips, en **bevestigt** de koppeling
moeder-chip ↔ pup-chip. Het bewijs is de bevestiging-op-locatie, niet een
database-koppeling.

### Wat IDSee dan opslaat — minimaal
| Wel opslaan | Niet opslaan |
|-------------|--------------|
| Identifiers: chip pup, chip moeder, UBN fokker, registratienr. arts/chipper | Namen, adressen, volledige persoonsdossiers |
| De koppeling tussen die identifiers | Gezondheidsdossiers als bulk-data |
| De bevestiging ("geverifieerde arts X: moeder+pup, NL-geboren, datum Y") | Gerepliceerde brondata uit RVO/chipdatabank |
| Hash/proof als anker | — |

Via **ZKP** kan IDSee bewijzen *"de keten sluit en is bevestigd door een geverifieerde
arts"* zónder de identifiers zelf prijs te geven. Dit verzoent de wens "geen grote
database onderhouden" met de AVG-keuze (§5: persoonsgegevens niet on-chain).

### Externe controleerbaarheid achteraf
Chipnummers zijn op internet te controleren en via UBN is zichtbaar waar dieren zijn. Die
controle is **niet geautomatiseerd** (geen scrapen — fragiel en mogelijk niet toegestaan),
maar gebeurt via **koper/community-melding + handmatige admin-controle**. Een discrepantie
tussen de bevestiging en de werkelijkheid levert een **notitie** op de professional op —
dit voedt het kaartensysteem in §4.

> **Eerlijke kanttekening (vertrouwensmodel):** de blockchain bewijst niet "de pup is écht
> NL-geboren" — hij bewijst "een geverifieerde arts heeft dit onveranderlijk bevestigd op
> datum X". Het vertrouwen leunt op de **arts + de cascade + de externe controle achteraf**
> (§4), niet op de chain zelf. Een corrupte arts kan fout bevestigen; het notitie-/
> kaartensysteem en de cascade vangen dat op. Wees hierover eerlijk in de communicatie.

## 4. Fraude-respons: discrepantie, herstel, cascade

> **Herzien 17 juni 2026.** Het model draait niet om "fraude bewijzen" maar om
> **niet-herstelde discrepanties** over de tijd. Het systeem hoeft vooraf niet te weten
> of iets een vergissing of zwendel is — **het gedrag erna bepaalt het**: een vergissing
> wordt rechtgezet, zwendel niet.

### Toegang: alleen volledig geverifieerde professionals

Een arts/chipper met een niet-afgeronde verificatie **kan niets aanmelden, melden of
bevestigen**. Daardoor heeft elke schakel per definitie een geverifieerde getuige; er is
geen "arts niet geverifieerd"-tussengeval in de score.

### Vergissing vs. zwendel = wel/niet herstellen

1. Een **discrepantie** ontstaat (koper-melding, ontbrekende schakel, of arts-observatie
   zoals een chip/boekje dat niet klopt) en krijgt status **OPEN** na verificatie door een
   geverifieerde arts of admin. Een kale koper-klacht telt niet vóór die verificatie.
2. **Herstellen kan alleen de arts/chipper** — nooit de eigenaar/importeur zelf. Herstel =
   de gegevens verbeteren en de keten alsnog door een geverifieerde professional laten
   sluiten. Een gesloten discrepantie krijgt status **HERSTELD** en **telt niet meer**.
3. Een zwendelaar **kan niet herstellen** (geen echte, arts-geverifieerde moeder) → de
   discrepantie blijft OPEN en stapelt op.

> Daarom telt de cascade **open, niet-herstelde** discrepanties — niet "aantal meldingen".
> De eerlijke fout verdwijnt na herstel; de structurele houdt stand.

### Toerekening — melder vrij, veroorzaker draagt

Een discrepantie wordt toegerekend aan:

- **(a) de eigenaar / UBN-houder** — altijd; het is zijn dier en herkomst;
- **(b) de professional die de betwiste schakel als "gecontroleerd & akkoord" vastlegde**
  (de `vetCheckedDocuments`-vlag op de import/koppeling). Tekende hij twijfel aan of meldde
  hij juist de fout, dan is hij **melder** → géén toerekening.

De **melder/ontdekker krijgt nooit een flag** — anders meldt niemand meer. Voorbeeld:
een arts die een importpup met een fout boekje *signaleert* blijft vrij (alleen de
importeur krijgt het); een arts die de pup zélf als kloppend aanmeldde en bij wie het
boekje achteraf fout blijkt, **deelt** in de discrepantie (samen met de eigenaar).

### Escalatie — leren, dan structureel

| Niveau | Trigger | Effect |
|--------|---------|--------|
| **Leren** | 1–2 open discrepanties | Geen sanctie. Feedback + externe controle (NVWA / Raad van Beheer) en ondersteuning waar nodig. Score van andere dieren ongemoeid. |
| **Structureel → 🔴 Rood** | **3 open** discrepanties | Cascade naar alle aanmeldingen van de betrokkene(n). **Arts/chipper én UBN-houder gaan samen voor de bijl.** |

Er is bewust **geen aparte oranje-persoon-stap**: oranje is een keten-/pup-score, niet een
trap op de persoon. Tijdens een open discrepantie toont de betrokken pup sowieso al zijn
echte (niet-groene) keten-score.

> **Drempel = 3 is een parameter** (§9), te ijken op data — en per **schakeltype**: veel
> NL-nestjes (drukke plattelandsarts) is normaal, veel *importpups* is zelf een signaal om
> in de gaten te houden. Geldt voor **vrijwillige deelnemers met toestemming** (zie hieronder).

### Subject = vrijwillige deelnemer (juridische grond)

De UBN-houder **doet vrijwillig mee, verbindt zich aan IDSee en geeft toestemming** — dat
is de AVG-grondslag om hem als cascade-subject te mogen flaggen. Wie niet meedoet wordt
**niet geflagd**; die is gewoon "onbekend/afwezig" en haalt geen groen. Alleen een
zwendelaar heeft moeite met meedoen — zijn weigering wórdt het signaal (§10), zonder dat
we hem beschuldigen.

> De cascade werkt via ZKP: het systeem bewijst "deze schakel hoort bij een structureel
> patroon" zonder de identiteit van fokker of arts publiek prijs te geven (§5).

## 4a. Volume als objectief feit — de binnenlandse producent

Een **binnenlandse** puppy-producent kan aan álle keten-eisen voldoen (echte teven, UBN,
arts-koppeling, geen import) en tóch niet netjes fokken. Onze keten-verificatie geeft die
terecht **groen op herkomst** — want de herkomst klopt. Dierenwelzijn/fokkwaliteit is een
**andere as** (NVWA / LID-terrein) waar IDSee bewust van afblijft.

Wat we **wel** kunnen, zonder een oordeel te vellen: het **volume en de frequentie per UBN**
tonen als **objectief feit**:

> *"Onder dit UBN geregistreerd: X pups · Y nesten · Z teven (afgelopen 12 mnd)."*

Een gelegenheidsnestje (1–2 nesten) ziet er meetbaar anders uit dan een producent
(tientallen). De **koper trekt zelf de conclusie** (§10). Dit feit:

- **kleurt de score niet rood** — dat zou een welzijnsoordeel impliceren (buiten onze
  competentie, juridisch risico);
- staat **naast** de score als transparant gegeven;
- **IDSee toetst niet aan een eigen norm** — geen "binnen/buiten de norm"-label. Puur het
  getal. Wie wat acceptabel vindt, bepaalt de koper (en extern: Raad van Beheer / wet),
  niet IDSee of de oprichter (§11).
- AVG: alleen voor **deelnemende** fokkers met toestemming; niet-deelnemers staan er niet in.

> **Eerlijke grens (§10):** een producent die op papier binnen alles blijft maar de honden
> slecht behandelt, ontsnapt — IDSee ziet de keten, niet de stal. Geen welzijnsinspectie;
> dat pretenderen we niet.

## 5. Wettelijke houdbaarheid

| Risico | Behandeling |
|--------|-------------|
| **AVG — chipnummer als persoonsgegeven** | Dataminimalisatie (§3b): IDSee bewaart alleen identifiers + koppeling + bevestiging + proof, géén gerepliceerde persoonsdossiers. Chip- en persoons-ID's alleen als hash on-chain. |
| **AVG — recht op vergetelheid vs. immutable blockchain** | Persoonsgegevens staan **niet** on-chain. On-chain staan alleen hashes/proofs; verwijderen van de off-chain sleutel maakt de hash betekenisloos ("crypto-shredding"). |
| **Smaad / onrechtmatige daad jegens fokker/arts** | Score drukt **verifieerbaarheid** uit, geen schuld. Geen publiek oordeel over een identificeerbaar persoon. Identiteiten blijven anoniem via ZKP. |
| **Concurrentie-misbruik (valse fraudeclaims)** | Harde cascade vereist bevestiging door een geverifieerde dierenarts (§4). Koper-signalen alleen zijn "zacht", op dier-niveau. |
| **Suggestie van vervanging wettelijk register** | Docs stellen expliciet: IDSee ontheft geen wettelijke plicht (§2). |

> ⚠️ Dit is een product-/ontwerpanalyse, **geen juridisch advies**. Vóór productie:
> AVG-toets (DPIA) en juridische review van de score-communicatie en aansprakelijkheid
> bij een onjuiste score.

## 6. Verdienmodel

Twee inkomstenstromen, met de **koper als primaire** stroom:

### Koper — pay-per-check (primair)
- **€2 per chip-check.** Een impulsaankoop bij een aanschaf van €1.000+.
- Schaalt met het aantal koop-transacties, niet met het kleine aantal fokkers.
- Optioneel later: gratis "groen/onbekend"-basischeck, €2 voor de volledige
  geverifieerde score (freemium-haak voor adoptie).

### Professional — credits (secundair)
- Registratie van schakels tegen credits (zie CREDITS.md).
- Bundels blijven het instrument; prijzen heroverwegen zodra koper-omzet de basis is.

### Marge-aandachtspunten (nog door te rekenen)
- ADA tx-fees + server-wallet-kosten per registratie/proof.
- Midnight ZK-proof-generatie: kosten per proof nog onbekend.
- Break-even-analyse volgt in een aparte doorrekening.

## 7. Koud-start (eerlijk over fase 1)

De kracht (cascade over alle dieren van een fraudeur) werkt pas bij **voldoende
dekking en voldoende geverifieerde dierenartsen**. In het begin:

- **Fase 1:** IDSee is vooral een **transparante, verifieerbare herkomstketen**.
  Veel checks geven "onbekend/oranje" simpelweg omdat de data er nog niet is.
- **Fase 2:** met volume + geverifieerde artsen wordt de fraude-detectie en de
  cascade onderscheidend — pas dán is "beter alternatief" een harde claim.

Eerste artsen via genesis-verificatie (zie VERIFICATION.md §Bootstrapping).

## 8. Vastgelegde beslissingen

| # | Beslissing |
|---|-----------|
| 1 | Positionering = **beter alternatief**, juridisch zorgvuldig (geen vervangingsclaim). |
| 2 | Fraude-cascade vereist **bevestiging door geverifieerde dierenarts**. |
| 3 | Koper-output = **risico-score** (🟢 groen / 🔵 geverifieerde import / 🟠 oranje / 🔴 rood). |
| 4 | Score = **verifieerbaarheid**, niet schuld. |
| 5 | Score wordt via **Midnight ZKP** afgeleid; fokker/arts blijven anoniem. |
| 6 | Koper betaalt **€2 per check** (primaire inkomstenstroom). |
| 7 | Cascade = **open/niet-herstelde discrepanties** (herzien 17 juni); herstel **alleen door arts/chipper**; **3 open = structureel = rood**; geen aparte oranje-persoon-stap. |
| 8 | Doel = **commerciële illegale handelaar** buitenspel; eerlijke fokker/kruimeldief gespaard. |
| 9 | Positionering = **positief NL-herkomstbewijs**, geen handelaar-jacht; de fraudeur *haalt geen groen* i.p.v. *wordt rood gemaakt* (17 juni). |
| 10 | Cascade-subject = **arts/chipper + UBN-houder**, beide **vrijwillige deelnemers met toestemming** (AVG-grond); niet-deelnemers worden niet geflagd. |
| 11 | **Volume per UBN** als objectief feit getoond (geen welzijnsoordeel, geen norm-toetsing); koper concludeert zelf. |
| 12 | Moeder-check **per nest/pup**, niet per teef; herstel = arts legt keten alsnog, eigenaar kan niet zelf corrigeren. |

## 9. Open punten

- [ ] ZK-statements exact definiëren (welke feiten voeden de score → ZK-PATTERNS.md).
- [ ] Break-even doorrekenen (ADA + proof-kosten vs. €2/check).
- [x] Datamodel: onderscheid *feit* (paspoort omgezet, herkomst onbekend) vs.
      *bevestigd signaal* — zodat een legale paspoort-omzetting geen beschuldiging wordt.
      → `FraudReport.category` (SIGNAAL/FEIT); een arts bevestigt als feit (neutraal,
      cascadeert niet) of als signaal. Alleen SIGNAAL telt in de cascade (17 juni 2026).
- [ ] DPIA + juridische review vóór productie.
- [ ] Drempels/levels voor "zachte" koper-signalen op dier-niveau.
- [ ] **Escalatie-parameters ijken:** leer-marge (1–2 open), structureel-drempel (3 open),
      per **schakeltype** (NL-nest normaal vs. import-volume verdacht). Op data ijken.
- [x] Onderscheid *vergissing* vs. *patroon* meetbaar maken → **wel/niet herstellen**:
      een vergissing wordt door de arts rechtgezet (telt niet meer), zwendel blijft OPEN
      en stapelt naar 3 = structureel (§4, herzien 17 juni).
- [ ] **Import-uitzondering Spanje/Griekenland** (asiel/stichtings-import): valt voorlopig
      onder de IMPORT-schakel → 🔵 mits geregistreerde organisatie + traceerbare herkomst.
      Aparte uitzonderingsstatus nog te bepalen (Henk denkt na).
- [ ] **Toestemming-intrekking vs. immutable check:** trekt een fokker zijn toestemming in
      ná verkoop, dan mag het groen van al-verkochte pups niet met terugwerkende kracht
      wegvallen → de **bevestiging-op-koopmoment** verankeren, los van latere intrekking (§5).
- [ ] **Code afslanken naar minimale dataset (§3b):** kern = identifiers + koppeling +
      bevestiging + proof. **`HealthRecord` schrappen** (geen gezondheidsdata — besloten
      17 juni). Rest van de afslank apart implementatietraject.
- [x] **Notitie-/kaartensysteem (§4)** bouwen: melding → verificatie → notitie → geel → rood,
      gekoppeld aan de bestaande fraude-cascade. Kaarten-drempels als parameters.
      → `ProfessionalNote` + `User.cardStatus` (GEEN/GEEL/ROOD); notitie alleen door
      admin/geverifieerde arts; een gele/rode kaart waardeert de score van de keten af
      (GROEN→ORANJE). Drempels via `/admin/config/cards` (17 juni 2026).
- [ ] Vertrouwensmodel documenteren naar gebruikers: chain bewijst "arts bevestigde",
      niet "pup is écht NL" — eerlijk communiceren (§3b kanttekening).

---

## 10. Werkzaamheid & adoptierisico (de eerlijke 30%-vraag)

**De kritische noot:** welwillende mensen schrijven zich in en gebruiken de app;
niet-welwillende mensen niet. Stel dat 30% de app gebruikt — hoe nuttig is hij dan nog?
De fraudeur, juist de doelgroep, meldt zijn illegaal geïmporteerde pup niet aan.

**Het antwoord — de waarde zit in de afwezigheid, niet in de aanwezigheid.**
IDSee is geen vrijwillig keurmerk waar "erin staan = goed". Het is een
**koper-gedreven vraagsysteem**. De koper betaalt €2 en stelt actief de vraag. De
uitkomst is niet "staat-ie erin → goed", maar:

- 🟢 Volledige keten → koop met vertrouwen.
- 🔴 / "geen sluitende keten / onbekend" → **waarom staat deze pup er niet in?**

Bij voldoende adoptie aan de **vraagkant** draait de bewijslast om: "niet in IDSee"
wordt **verdacht** in plaats van neutraal — zoals een tweedehands auto zonder
onderhoudshistorie. De fraudeur hoeft niet mee te doen; **zijn weigering om mee te doen
wórdt het signaal.**

**Cruciaal inzicht:** het netwerkeffect zit aan de **vraagkant (kopers)**, niet aan de
aanbodkant (fokkers). Je hebt geen 100% van de fokkers nodig — je hebt genoeg *kopers*
nodig die de check als vanzelfsprekend zien. De vraagkant is veel groter en makkelijker
te activeren dan de aanbodkant.

**Drie voorwaarden — en het faalscenario:**

1. Kopers vragen het massaal (de €2-check moet normaal worden).
2. "Onbekend" wordt als negatief gelezen (publieksbekendheid: "geen IDSee = wegblijven").
3. Meedoen wordt een verkoopvoordeel voor de eerlijke fokker (groene keten verkoopt
   beter → de aanbodkant volgt vanzelf).

> **Faalscenario, eerlijk:** vóór massabekendheid is "onbekend" gewoon "onbekend", niet
> "verdacht". In die koud-start is IDSee een gewoon (en dus zwak) keurmerk. De
> moeilijkste opgave is **niet technisch** (de ZKP bouwen) maar een **voorlichtings- en
> distributiestrijd**: kopers leren altijd naar IDSee te vragen. Slaagt die niet, dan
> blijft de app bij 30% inderdaad beperkt nuttig.

---

## 11. Organisatie, vergoeding & anonimiteit

### Organisatievorm — stichting als schild
IDSee draait onder een **stichting** (geen BV, geen winstuitkering). Dat dient vier
doelen tegelijk, die de oprichter expliciet noemde:

| Reden | Hoe de stichting het oplost |
|-------|------------------------------|
| Bescherming tegen handelaren | Klachten/druk richten zich op de rechtspersoon, niet op de oprichter persoonlijk of zijn praktijk. |
| Belangenconflict vermijden | De oprichter ontwerpt het systeem, maar **bevestigt zelf geen fraude** (zie hieronder). |
| Scheiding van praktijk | Aparte rechtspersoon, eigen naam/IBAN/KvK, los van de dierenartspraktijk. |
| Vrijheid om kritisch te zijn | De stichting bekritiseert het falende register, niet "dierenarts X" persoonlijk. |

> **Anonimiteit is nooit gegarandeerd.** Bank, KvK, Belastingdienst en UBO-register
> kennen de oprichter hoe dan ook; bij een procedure kan de identiteit boven water komen.
> De stichting verlaagt het risico en geeft afstand — ze maakt niet onzichtbaar. Plan
> erop dat de naam ooit bekend wordt.

### Structurele scheiding — geen zelf-bevestiging
Het grootste risico is niet vindbaarheid maar **belangenconflict**. Daarom: de oprichter
bouwt de regels, maar de **fraude-bevestigende artsen zijn een onafhankelijke,
geverifieerde pool** (§4). Dit moet structureel in het ontwerp zitten, niet alleen in de
presentatie — anders valt het systeem om zodra één zaak voor de rechter komt.

### Het principe — verdienen aan het wérk, niet aan het systeem
Spanning die de oprichter zelf benoemde: een democratisch, zelfbesturend systeem met één
persoon die de winst opstrijkt, is een contradictie. Oplossing: de stichting keert geen
winst uit; de oprichter wordt **vergoed voor geleverd werk**, niet beloond als eigenaar.
Overschot vloeit terug in het systeem (lagere kosten, voorlichting, reserve).

### Vergoeding — oprichtersvordering, geen opdracht, geen startkapitaal
Er is **geen startkapitaal** en het is **geen betaalde opdracht**. De oprichter bouwt nu
op eigen tijd, uit overtuiging ("eindelijk een systeem dat wél werkt"). De gewerkte uren
worden **wél geadministreerd** als een **achtergestelde oprichtersvordering** op de
stichting, langzaam af te betalen zodra er omzet is.

| Post | Afspraak |
|------|----------|
| Uurtarief (bouw + onderhoud) | **€60/uur** (reëel: een uur met meerdere AI-agents levert meer op dan een gewoon dev-uur) |
| AI-onkosten | ~**€100/maand**, declarabel als onkost |
| Voorbereidingsuren (schatting) | ~**500 uur** → ~**€30.000** beginvordering |
| Plafond op uren | **Geen** — alle gewerkte uren tellen |
| Vorm | Achtergestelde lening / rekening-courant oprichter → stichting |

**Afbetaling via een harde waterval** (zo kan de vordering het systeem nooit verstikken):

1. Eerst: lopende kosten dekken (hosting, blockchain-tx, betaal- en proof-kosten, e-mail).
2. Dan: een **reserve** opbouwen (buffer voor tegenvallers).
3. Pas daarna: afbetaling oprichtersvordering, **gemaximeerd op bijv. 30% van het
   maandoverschot**.

> **Waarborgen bij 'geen urenplafond'** (anders ontstaat alsnog het "oprichter =
> grootste schuldeiser"-verwijt): (a) urenregistratie **transparant en controleerbaar**
> door het bestuur (`/wu`), en (b) de **waterval is hard** — afbetaling alleen uit
> overschot, met maand-plafond. Met deze twee waarborgen is "alle uren tellen"
> verdedigbaar: de oprichter krijgt **terugbetaald wat hij erin stak**, op een tempo dat
> het systeem aankan — geen winst, geen verstikking.

### Cardano-pool — wél kostendekking, géén anoniem betaalkanaal
Een IDSee **stake pool** kan een klein neveneffect zijn (community-binding, beetje ADA om
eigen tx-kosten te dekken). Maar het is **geen** instrument om klantgeld anoniem te
ontvangen: kopers betalen fiat (iDEAL/creditcard) — dat komt nooit een pool binnen; een
nieuwe pool levert nauwelijks op; en euro's "wegsluizen" via crypto om de rechtspersoon
te omzeilen is juist een **witwas-signaal** dat het juridische risico vergróót. Het geld
loopt transparant via de stichting. Daar zit de bescherming — niet in een crypto-omweg.

### Inkomstenbronnen (definitief)
Twee, meer niet:
1. **Koper:** €2 per chip-check (primair, schaalt met kopers).
2. **Professional:** credits per pup-/schakel-inschrijving (secundair).

> **Haalbaarheid zonder startkapitaal:** ~100 transacties/maand dekt de vaste hosting;
> daarboven bouwt de stichting reserve en pas daarna wordt de oprichtersvordering
> afgelost. Haalbaar — **mits** de kosten-per-transactie (blockchain + ZK-proof) **onder**
> de marge per €2-check blijven. Dat is het enige echte risico en moet hard doorgerekend
> (zie open punt: break-even).
