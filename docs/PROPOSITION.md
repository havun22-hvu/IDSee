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
2. Krijgt één uitkomst: een **risico-score** (groen / oranje / rood).
3. Betaalt **€2** per check (zie §6).

De score drukt **verifieerbaarheid van de herkomstketen** uit — **niet schuld**:

| Score | Betekenis |
|-------|-----------|
| 🟢 Groen | Keten volledig ZK-geverifieerd: moeder geregistreerd, arts/chipper geverifieerd en niet-geflagd, geen ontbrekende schakel. |
| 🟠 Oranje | Keten deels verifieerbaar; één of meer schakels onbekend of zwak (bijv. import, paspoort omgezet zonder traceerbare bron). |
| 🔴 Rood | Keten sluit niet: ontbrekende of niet-verifieerbare herkomst, of een schakel die hoort bij een bevestigd fraudesignaal. |

Een fraudeur scoort vanzelf rood/oranje **omdat zijn keten niet sluit**, niet omdat
het systeem hem "fraudeur" noemt. Dit onderscheid is juridisch essentieel (§5).

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

## 4. Fraude-respons: bevestiging + cascade

Het zwakke punt van het oude model ("borg naar platform pool") is vervangen door een
**reputatie-cascade met menselijke bevestiging**:

1. Een signaal ontstaat (koper-melding, ontbrekende schakel, of arts-observatie zoals
   een omgekat buitenlands paspoort).
2. **Alleen een geverifieerde dierenarts bevestigt** dat het een fraudesignaal is.
   Dit voorkomt dat een concurrent iemand kapotmaakt met valse claims.
3. Na bevestiging cascadeert de flag intern naar **alle aanmeldingen van die persoon**:
   toekomstige én bestaande dieren krijgen een waarschuwing in hun keten.
4. Naar de koper toe vertaalt die cascade zich als **verlaagde verifieerbaarheid**
   (oranje/rood), **nooit** als publieke beschuldiging van een identificeerbaar persoon.

> De cascade werkt via ZKP: het systeem bewijst "deze schakel hoort bij een bevestigd
> fraudesignaal" zonder de identiteit van fokker of arts prijs te geven.

### Graduele escalatie — leervermogen vóór sanctie

De flag is **niet binair**. Het doel is de **commerciële illegale handelaar** (de
volume-importeur) buitenspel te zetten — **niet** de eerlijke fokker die een fout maakt,
en **niet** de kruimeldief. Een vergissing in het registreren is menselijk en mogelijk.
Daarom escaleert het systeem stapsgewijs en geeft het eerst een **kans om zich te
bekwamen**:

| Fase | Trigger | Effect op score van betrokken dieren |
|------|---------|--------------------------------------|
| **Leren** | Eerste paar onregelmatigheden | Blijft 🟢/neutraal. De professional krijgt feedback: "registratie onvolledig — zo doe je het goed". |
| **Waarschuwing** | Na *x* herhaalde onregelmatigheden | 🟠 Oranje. Patroon zichtbaar, nog geen sanctie. |
| **Sanctie** | Bij voortdurende herhaling | 🔴 Rood. |
| **Blokkade** | Schaal van een commerciële handelaar (bijv. >10 illegaal geïmporteerde pups) | Verdere aanmeldingen onmogelijk. |

Sleutelprincipe: escalatie is gebaseerd op **patroon en volume over de tijd**, niet op
één incident. Dit is precies waarom IDSee de handelaar raakt en de eerlijke fokker
spaart — en het versterkt de juridische lijn (§5): het systeem reageert op een
*meetbaar patroon van niet-sluitende ketens*, niet op een persoonlijk schuldoordeel.

> Drempels (*x*, het import-plafond, de leer-marge) zijn **parameters**, geen vaste
> getallen. Ze worden geijkt op echte data; voorlopige waarden staan in §9.

## 5. Wettelijke houdbaarheid

| Risico | Behandeling |
|--------|-------------|
| **AVG — chipnummer als persoonsgegeven** | Chip- en persoons-ID's alleen als hash on-chain; persoonsgegevens encrypted off-chain in database. |
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
| 3 | Koper-output = **risico-score** (groen/oranje/rood). |
| 4 | Score = **verifieerbaarheid**, niet schuld. |
| 5 | Score wordt via **Midnight ZKP** afgeleid; fokker/arts blijven anoniem. |
| 6 | Koper betaalt **€2 per check** (primaire inkomstenstroom). |
| 7 | Flag is **gradueel** (leren → oranje → rood → blokkade), niet binair. |
| 8 | Doel = **commerciële illegale handelaar** buitenspel; eerlijke fokker/kruimeldief gespaard. |

## 9. Open punten

- [ ] ZK-statements exact definiëren (welke feiten voeden de score → ZK-PATTERNS.md).
- [ ] Break-even doorrekenen (ADA + proof-kosten vs. €2/check).
- [ ] Datamodel: onderscheid *feit* (paspoort omgezet, herkomst onbekend) vs.
      *bevestigd signaal* — zodat een legale paspoort-omzetting geen beschuldiging wordt.
- [ ] DPIA + juridische review vóór productie.
- [ ] Drempels/levels voor "zachte" koper-signalen op dier-niveau.
- [ ] **Escalatie-parameters ijken:** leer-marge (aantal "vergissingen" vóór oranje),
      *x* herhalingen vóór rood, import-plafond (voorlopig >10 pups → blokkade).
- [ ] Onderscheid *vergissing* vs. *patroon* meetbaar maken (welke signalen tellen mee,
      over welke tijdvenster, met welk gewicht).

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
