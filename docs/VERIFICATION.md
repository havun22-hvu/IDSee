# IDSee Verificatie Systeem

## Overzicht

IDSee gebruikt een gedecentraliseerd verificatiesysteem waarbij de community zelf verantwoordelijk is voor verificatie. Geen centrale autoriteit - de gebruikers bepalen.

## Gebruikersrollen

| Rol | Verificatie vereist | Identificatie |
|-----|---------------------|---------------|
| Koper | Nee | Geen - alleen chipnummer opzoeken |
| Fokker | Ja | UBN nummer (RVO) |
| Dierenarts | Ja | Diergeneeskunderegister nummer |
| Chipper | Ja | RVO Chippersregister nummer |

## Verificatie Levels

### Level 1: Email Verificatie
- Bevestig email adres via verificatie link
- Basis toegang tot platform
- Kan nog geen registraties doen

### Level 2: Professioneel ID
- Voer officieel registratienummer in:
  - Fokker: UBN nummer
  - Dierenarts: Diergeneeskunderegister nummer
  - Chipper: RVO Chippersregister nummer
- Systeem slaat dit op voor transparantie
- Nog steeds wachtend op peer verificatie

### Level 3: Peer Verificatie
- Een bestaande geverifieerde professional kan je uitnodigen/verifiëren
- De verificeerder zet **credits als borg** in
- Als de nieuwe professional fraude pleegt:
  - Borg wordt verbeurd
  - Beide accounts worden gemarkeerd
- Reputatieketen: transparant wie wie heeft geverifieerd

## Peer Verificatie Mechanisme

```
Bestaande Professional                 Nieuwe Professional
        │                                      │
        │◄──── Vraagt verificatie aan ─────────┤
        │      (met prof. ID)                  │
        │                                      │
        ├──── Zet 10 credits als borg ────────►│
        │                                      │
        ├──── Verifieert ─────────────────────►│
        │                                      │
        ▼                                      ▼
   Status: VERIFIED                    Status: VERIFIED
   Borg: vastgezet 30 dagen           Kan nu registreren
```

### Borg Systeem
- Verificeerder zet credits in als borg (bijv. 10 credits)
- Borg blijft 30 dagen vastgezet
- Na 30 dagen zonder problemen: borg vrijgegeven
- De borg dient als **commitment** dat verificaties serieus zijn — niet als
  straf-/inkomstenmechanisme

> **Belangrijk (zie `PROPOSITION.md` §4):** het oude model "borg verbeurd → naar
> platform pool" is **verlaten**. Fraude wordt niet via een geldstroom afgehandeld
> maar via een **reputatie-cascade met menselijke bevestiging** (zie hieronder).

## Dubbele Bevestiging voor Registraties

Elke dierregistratie vereist bevestiging van meerdere partijen.

### Registratie Flow

```
Stap 1: Dierenarts/Chipper registreert
┌─────────────────────────────────────┐
│ Chipnummer: 528-1234-5678-9012      │
│ Diersoort: Hond                     │
│ Ras: Labrador                       │
│ Geboortedatum: 2024-03-15           │
│ Moeder chip: 528-1111-2222-3333     │
│ Fokker UBN: 123456                  │
└─────────────────────────────────────┘
         │
         ▼
Stap 2: Notificatie naar Fokker
┌─────────────────────────────────────┐
│ 📧 Nieuwe registratie wacht op      │
│    bevestiging                      │
│                                     │
│ Chip: 528-1234-5678-9012            │
│ Geregistreerd door: Dr. Jansen      │
│                                     │
│ [Bevestigen] [Afwijzen]             │
└─────────────────────────────────────┘
         │
         ▼
Stap 3: Fokker bevestigt
┌─────────────────────────────────────┐
│ ✓ "Ja, dit is mijn pup"             │
│                                     │
│ OF                                  │
│                                     │
│ ✗ "Nee, dit klopt niet"             │
│   Reden: _______________            │
└─────────────────────────────────────┘
         │
         ▼
Stap 4: Blockchain registratie
┌─────────────────────────────────────┐
│ Status: CONFIRMED                   │
│ Bevestigd door:                     │
│   - Dierenarts (registratie)        │
│   - Fokker (bevestiging)            │
│ TX Hash: abc123...                  │
└─────────────────────────────────────┘
```

### Afwijzing Flow

Als fokker afwijst:
1. Registratie krijgt status `DISPUTED`
2. Dierenarts/chipper krijgt notificatie
3. Kan correctie indienen of escaleren
4. Bij herhaalde afwijzingen: onderzoek

## Registratie Statussen

| Status | Betekenis |
|--------|-----------|
| PENDING | Wacht op bevestiging fokker |
| CONFIRMED | Beide partijen akkoord, op blockchain |
| DISPUTED | Fokker heeft afgewezen |
| CANCELLED | Geannuleerd door registreerder |

## Fraude-respons: bevestiging + cascade

> Status: **geïmplementeerd v1** (B-traject fase 3). Een geverifieerde dierenarts
> beoordeelt signalen op `/fraud-review`; bevestiging triggert de cascade
> (`fraudService.assessUserFraudStatus`) die `User.fraudStatus` zet. Omdat de
> risico-score wordt afgeleid, werkt dit direct door naar alle dieren van die persoon.
> Drempels staan in `SystemConfig` (defaults: oranje=2, rood=4, blokkade=10, venster=1 jr).
>
> **Meld-ingang:** professionals melden een signaal op `/report-signal` (via chipnummer;
> de backend leidt de betrokken registrant af, zodat de melder geen interne id nodig heeft).
>
> **Zachte koper-signalen:** een koper kan na een **betaalde** check een onregelmatigheid
> melden vanaf de resultaatpagina (`POST /verify/report-soft`, gekoppeld aan de PAID-sessie
> tegen spam, geen account nodig). Dit wordt een `FraudReport` met `source = BUYER` en
> `reporterId = null`. Het telt **niet** automatisch mee: net als elk signaal moet een
> geverifieerde dierenarts het eerst bevestigen vóór de cascade reageert (§4). De arts ziet
> "Koper-signaal" vs "Professional" in de review.
>
> **Nog open (§9):** een puur-zachte aggregatie op dier-niveau (meerdere onbevestigde
> koper-signalen → tijdelijke waarschuwing zonder arts) is nog niet geïmplementeerd.

In plaats van een geldelijke afhandeling werkt fraude via een **reputatie-cascade**:

1. Een signaal ontstaat (koper-melding, ontbrekende schakel, of arts-observatie zoals
   een omgekat buitenlands paspoort).
2. **Alleen een geverifieerde dierenarts bevestigt** dat het een fraudesignaal is —
   dit voorkomt dat een concurrent iemand kapotmaakt met valse claims.
3. Na bevestiging cascadeert de flag naar **alle aanmeldingen van die persoon**.
4. Naar de koper toe vertaalt dit zich als **verlaagde verifieerbaarheid** (oranje/rood),
   **nooit** als publieke beschuldiging van een identificeerbaar persoon (via ZKP anoniem).

### Graduele escalatie (leervermogen vóór sanctie)

| Fase | Trigger | Effect |
|------|---------|--------|
| Leren | Eerste onregelmatigheden | 🟢 blijft; professional krijgt feedback |
| Waarschuwing | Na *x* herhalingen | 🟠 oranje, patroon zichtbaar |
| Sanctie | Voortdurende herhaling | 🔴 rood |
| Blokkade | Schaal commerciële handelaar (bijv. >10 illegale imports) | Aanmelden onmogelijk |

Doel = de **commerciële illegale handelaar** raken op **patroon en volume**, niet de
eerlijke fokker die een fout maakt. Drempels zijn parameters, nog te ijken (§9).

## Koper-uitkomst: risico-score

> Status: **geïmplementeerd** (B-traject fase 1). `GET /verify/:chipId` geeft een
> `riskScore` (🟢/🟠/🔴) + transparante `factors`. De score drukt **verifieerbaarheid**
> uit, geen schuld (propositie §3). Score wordt **afgeleid** (`verificationService.ts` →
> `scoreFromFactors`), nooit opgeslagen, zodat de fraude-cascade direct doorwerkt.

| Score | Betekenis | Wanneer (fase 1) |
|-------|-----------|------------------|
| 🟢 Groen | Keten volledig geverifieerd | gevonden + bevestigde registratie + fokker geverifieerd + moeder bekend |
| 🟠 Oranje | Keten deels verifieerbaar; schakel onbekend of zwak | onbekend dier, nog niet bevestigd, moeder onbekend of fokker niet geverifieerd |
| 🔴 Rood | Keten sluit niet, of bij een bevestigd fraudesignaal | registratie betwist (DISPUTED), of eigenaar geflagd ROOD/BLOKKADE (fase 3) |

De `factors` (found, chainConfirmed, breederVerified, motherKnown, disputed) worden
neutraal als feiten getoond — nooit als beschuldiging.

### Betaalde check (€2)

> Status: **geïmplementeerd v1** met demo-provider. De koper betaalt €2 vóór de score
> (PROPOSITION.md §6). Flow: `POST /verify/initiate-check` → betalen → frontend pollt
> `GET /verify/check-status/:sessionId` → na `PAID` geeft `GET /verify/result/:sessionId`
> de score (402 zolang niet betaald).
>
> Een **demo-payment-provider** (`paymentService.ts`) draait zonder credentials —
> analoog aan de blockchain-demo-mode. Echte Mollie wordt later geactiveerd achter
> `PAYMENT_PROVIDER=mollie` + `MOLLIE_API_KEY` (vereist dependency + sleutel).
>
> De directe `GET /verify/:chipId` bestaat nog voor interne/legacy-doeleinden en moet
> in productie afgeschermd of rate-limited worden.

## Transparantie & anonimiteit

- Verificaties en registraties zijn **op blockchain vastgelegd** als hashes/proofs
- Identiteiten van fokker/arts/chipper blijven **anoniem via ZKP** — er is géén
  publiek "wie-verifieerde-wie"-register en geen publiek oordeel over een persoon
- Het systeem bewijst *dát* een schakel geverifieerd is, niet *wie* het is

## Bootstrapping: Eerste Gebruikers

Probleem: Wie verifieert de eerste professionals?

Oplossing:
1. **Genesis verificatie**: Eerste 10-20 professionals worden geverifieerd via:
   - Handmatige check tegen officiële registers
   - Inleg van 100 credits als commitment
2. Deze "genesis" professionals kunnen daarna anderen verifiëren
3. Na lancering: volledig peer-to-peer

## Samenvatting

- **Geen centrale autoriteit** - community verifieert zichzelf
- **Financiële incentive** - borg zorgt voor serieuze verificaties
- **Dubbele bevestiging** - fokker en professional moeten beiden akkoord
- **Transparant** - alles traceerbaar op blockchain
