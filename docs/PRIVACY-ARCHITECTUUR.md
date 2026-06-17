# Privacy- & deploy-architectuur — brainstorm (WIP)

> **Status:** open brainstorm, gestart 17 juni 2026. **Nog geen besluit.** Morgen verder.
> Dit document vangt de gedachtegang, alle voors/tegens, en het gewenste eindbeeld.
> Sturend blijft `PROPOSITION.md`; dit is verkennend.
>
> ⚠️ Geen juridisch advies. Alle AVG-conclusies hieronder zijn indicatief en horen
> hard getoetst in een **DPIA vóór productie** (PROPOSITION §5/§9).

## 1. De centrale vraag
Gebruiken we een **server** (backend + DB) of zetten we de app/logica **on-chain**
(decentraal)? Henk wil een ijzersterk plan met **geen/minimaal onderhoud** en
**volledige wettelijke compliance**.

## 2. Henk's gewenste eindbeeld (de wens)
- Zo **anoniem mogelijk**: naar buiten alleen een **OK** (🟢) afgeven — of niet (🟠/🔴).
- **IDSee bewaart zelf niets/minimaal**; persoonsgegevens blijven idealiter **lokaal**
  bij de gebruiker (de professional/fokker op zijn eigen device).
- Werking: de apps maken een **token** van pup + moeder waarin het chipnummer is
  verwerkt; de **controleur (arts/chipper)** reproduceert datzelfde token en zet het
  op **OK**; dat OK landt **on-chain** (gedacht: **Midnight**) en/of bij de
  chipdatabank van de pup.
- Koper voert een **willekeurig chipnummer** in → krijgt 🟢/🟠/🔴.
- **Minimaal onderhoud**, geen grote database om decennia te beheren (sluit aan op §3b).

## 3. AVG-kern (waar het telkens op terugkomt)
- **Chip / UBN / registratienummer zijn vrijwel zeker persoonsgegevens** (indirect
  identificeerbaar via chipdatabank/RVO/beroepsregister). Het feit dat de "echte"
  data elders staat, maakt onze nummers juist *identificeerbaar* (Breyer-arrest,
  HvJ EU C-582/14). Een nummer i.p.v. naam = **pseudonimisering, geen anonimisering**
  → valt onder de AVG.
- **Correctie op een aanname:** persoons*gegevens* achter een chip staan in NL **niet
  vrij online** — het chip-*bestaan* is opvraagbaar, naam/adres zijn afgeschermd
  (alleen bevoegden). Dus IDSee's OK voegt geen persoonsonthulling toe.
- **Koper-flow is al minimaal:** het ingevoerde chipnummer wordt gehasht (HMAC+pepper)
  en **niet als plaintext bewaard** (alleen `chipIdHash` in `CheckTransaction`). Output
  = een afgeleide kleur. Verdedigbare framing: *"minimale, vluchtige, toestemmings-
  gebaseerde verwerking; alleen hashes/proofs persistent"* — **niet** "geen AVG".

## 4. Bouwstenen — voors & tegens

### A. Server + DB (huidige opzet)
- ➕ Werkt nu; auth, payments, score-afleiding, fraude-cascade, privacy-hashing.
- ➕ Pepper blijft **server-secret** → chip-hashes niet brute-forcebaar.
- ➖ Single point; onderhoud; IDSee is verwerker van (pseudonieme) persoonsgegevens.

### B. Local-first (data op device van de professional)
- ➕ Voor de **invoerkant** haalbaar: arts-app houdt plaintext lokaal, publiceert
  alleen een proof → onze opslag-footprint ≈ nul aan die kant.
- ➖ Werkt **niet voor de koper-check**: prover ≠ verifier. De koper heeft alleen een
  chipnummer, niet de telefoon van de fokker — hij moet *andermans* keten checken
  zonder die persoon erbij. Vereist een gedeelde, opzoekbare laag.

### C. Token / commitment-model (Henk's voorstel)
- ➕ Cryptografisch netjes: token = afgeleide van de chip; controleur reproduceert +
  ondertekent "OK". Geen plaintext nodig in de attestatie.
- ➖ **Catch-22:** als fokker-, controleur- én koper-app hetzelfde token uit de chip
  moeten maken, kan het **geen effectief geheim** bevatten →
  `hash(chip)` zonder geheim = **brute-forcebaar** (15-cijferige ruimte). Mét geheim
  in de client = geen geheim meer.
- ➖ Gevolg: een **publieke** token-lijst ≈ pseudonieme chiplijst.
- ➕ Nuance (Henk terecht): brute-force onthult **geen persoon**, alleen "chip X heeft
  OK". Het echte risico is **enumeratie van de dataset**, geen persoonslek.

### D. Midnight (ZK / shielded on-chain)
- ➕ Lost **inhoud + identiteit anoniem** op (alleen een OK, niet wie/welke keten).
- ➕ **Shielded state** → geen publiek-downloadbare lijst (doodt bulk-scrape-enumeratie).
- ➖ Lost de **orakel-vraag niet op:** de functie is "vreemde voert willekeurig nummer
  in → ja/nee", dus inherent **nummer-voor-nummer bevraagbaar**. Anonimiteit van de
  betrokkene ≠ niet-enumereerbaar.
- ➖ Jong/early; **proof-kosten per check** = open break-even-vraag (§6); draait nu niet.

### E. OK terugschrijven naar de bestaande chipdatabank
- ➕ Meest **AVG-arm + onderhoudsarm**: IDSee bewaart de koppeling niet; data blijft
  waar die al hoort (§3b). IDSee = enkel **uitgever van de attestatie**.
- ➖ Hangt volledig op **institutionele toegang** (mag/kan IDSee een geverifieerd OK
  schrijven/uitlezen bij de aangewezen databank?) — politiek/contractueel, geen code.
  §1/§10 zijn juist sceptisch over afhankelijkheid van bestaande spelers.

## 5. Terugkerende crux (geldt voor élke variant)
1. **Prover ≠ verifier:** de koper checkt andermans keten zonder die persoon erbij →
   er moet een gedeelde, opzoekbare laag zijn.
2. **Catch-22 van de lookup-sleutel:** zonder geheim = enumereerbaar; met geheim = de
   vreemde koper kan niet matchen.
3. **Orakel-effect:** een dienst die "willekeurig nummer → ja/nee" geeft, is per
   definitie nummer-voor-nummer te bevragen. ZK/Midnight verandert dat niet.

## 6. Het sterkste anti-enumeratie-mechanisme: de €2
Niemand betaalt om miljoenen chipnummers af te lopen. **De €2-check ís de rate-limit**
— hij beschermt de dataset, niet alleen de omzet. **Maar:** dat werkt alleen als de
check door een **betaal-/rate-limit-poort** loopt. Een koper-app die *direct* on-chain
(Midnight) queryt, omzeilt de €2 → enumeratie + gratis-check terug.

## 7. Voorlopige convergentie (nog te bevestigen)
Het lijkt te convergeren naar een **hybride**:
- **Midnight**: shielded attestaties + ZK-OK (anonimiteit van inhoud/identiteit, geen
  publieke lijst).
- **Dunne poort (server)**: €2-betaling (fiat/iDEAL kan sowieso niet client-side) +
  gated, rate-limited query. Bewaart de keten-data **niet** — is enkel poort.
- **Invoerkant** zo veel mogelijk local-first (proof op device → publiceren).
- Resultaat ≈ Henk's wens: "zo anoniem mogelijk, bewaar bijna niets" — met de eerlijke
  kanttekening dat een **dunne poort blijft bestaan** (fiat + rate-limit). "Puur
  on-chain, geen server" is niet haalbaar.

## 8. Open vragen voor morgen
1. **Chipdatabank-toegang** (variant E): mag/kan IDSee een geverifieerd OK
   schrijven naar / uitlezen uit de officiële chipdatabank? → bepaalt of het meest
   ijzersterke model haalbaar is.
2. **Acceptabel enumeratie-risico?** Is "iemand kan via betaalde checks achterhalen
   welke chips OK hebben" een probleem? De €2 + rate-limit zijn de rem.
3. **Midnight proof-kosten** per check vs. de €2-marge (break-even, §6).
4. **Hoeveel mag de dunne poort zien/bewaren?** (vluchtige lookup vs. niets — evt.
   PIR/oblivious lookup, maar duur).
5. **Toestemming-intrekking vs. immutable OK** on-chain (recht op vergetelheid; §5).
6. **Hosting van de PWA** (CDN vs. IPFS) — los van de logica-vraag.

## 9. Wat dit níét verandert aan de huidige code
De huidige implementatie (server + DB + demo-chain) blijft de werkende basis. Dit is
een richting voor de **ZK-migratie** (§9), geen herbouw op korte termijn.
