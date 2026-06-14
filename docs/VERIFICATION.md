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

> Status: **ontworpen, nog niet geïmplementeerd** (B-traject, zie `PROPOSITION.md` §4
> en de open punten §9). De huidige code kent peer-verificatie en fokker-bevestiging,
> nog niet de cascade en de risico-score.

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

> Status: **gepland** — de huidige `/verify` geeft losse booleans; de propositie (§3)
> legt vast dat de koper één **risico-score** 🟢/🟠/🔴 krijgt die **verifieerbaarheid**
> uitdrukt, geen schuld.

| Score | Betekenis |
|-------|-----------|
| 🟢 Groen | Keten volledig geverifieerd, geen ontbrekende schakel |
| 🟠 Oranje | Keten deels verifieerbaar; schakel onbekend of zwak |
| 🔴 Rood | Keten sluit niet, of schakel hoort bij een bevestigd fraudesignaal |

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
