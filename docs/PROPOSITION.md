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
