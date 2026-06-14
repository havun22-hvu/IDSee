> **Gemini blauwdruk** — gegenereerd 2026-06-14 10:55 · project: idsee · bron: havun:gemini (--include-source)
> Opdracht: B-traject uit PROPOSITION.md (risico-score, fraude-cascade, Mollie-betaling)

# Blauwdruk — B-traject IDSee

Dit ontwerp beschrijft de implementatie van de B-traject features: Koper-risico-score, Fraude-respons, en Koper-betaalt-check, rekening houdend met de gespecificeerde stack (Node/Express/Prisma/SQLite backend, React+TypeScript+Vite frontend) en open ontwerppunten. Het is gefaseerd opgesteld, nu implementeerbaar en voorbereid op toekomstige ZK-integratie.

---

## 1. Algemene Uitgangspunten & Overwegingen

*   **Authenticatie & Autorisatie:** Een robuust authenticatiesysteem (bijv. JWT) is essentieel, vooral voor dierenarts-specifieke functionaliteit en eventuele beheerdersfuncties. Verondersteld wordt dat dit reeds (deels) aanwezig is, of deel uitmaakt van een A-traject.
*   **Privacy (AVG/GDPR):** Fraudegerelateerde gegevens zijn gevoelig. Toegang hiertoe moet strikt gerecontroleerd worden. De `User.fraudStatus` is intern en mag niet direct publiek zijn; het beïnvloedt de publieke `Animal.riskScore`.
*   **Configureerbaarheid:** Drempels voor fraudecascade en Mollie-instellingen worden extern configureerbaar gemaakt (via `SystemConfig` tabel of omgevingsvariabelen).
*   **Foutafhandeling & Logging:** Robuuste foutafhandeling en logging zijn cruciaal, met name voor betalingen en kritieke fraudefuncties.

---

## 2. Prisma Datamodel Uitbreidingen (`prisma/schema.prisma`)

We breiden het datamodel uit om de nieuwe functionaliteiten te ondersteunen.

```prisma
// Enum voor Koper-risico-score
enum RiskScore {
  GROEN
  ORANJE
  ROOD
}

// Enum voor gebruiker's fraudestatus (reputatie-cascade)
enum UserFraudStatus {
  LEREN   // Initiële status, geen bekende fraude
  ORANJE  // Enkele fraudemelding(en), in onderzoek of met lichte impact
  ROOD    // Ernstige of meerdere fraudemeldingen, sterke impact op verifieerbaarheid
  BLOKKADE // Geblokkeerd wegens herhaalde/ernstige fraude
}

// Enum voor de status van een verificatie-check transactie
enum CheckStatus {
  PENDING   // Wachten op betaling
  PAID      // Betaling succesvol
  FAILED    // Betaling mislukt
  REFUNDED  // Betaling terugbetaald (optioneel, voor robuustheid)
}

// Enum voor de status van een fraudemelding
enum FraudReportStatus {
  PENDING_VET_REVIEW // Wacht op beoordeling door dierenarts
  CONFIRMED_BY_VET   // Bevestigd door dierenarts
  REJECTED_BY_VET    // Afgewezen door dierenarts
}

model User {
  id               String          @id @default(uuid())
  email            String          @unique
  hashedPassword   String?
  name             String?
  isVerifiedVet    Boolean         @default(false) // Geeft aan of de gebruiker een geverifieerde dierenarts is
  fraudStatus      UserFraudStatus @default(LEREN) // Reputatie-cascade voor de gebruiker/eigenaar
  lastFraudAssessment DateTime?    // Datum laatste fraudebeoordeling

  // Relaties
  reportedFraud    FraudReport[]   @relation("Reporter")
  confirmedFraud   FraudReport[]   @relation("Confirmer")
  ownedAnimals     Animal[]        @relation("Owner") // Alle dieren die deze gebruiker bezit of heeft bezeten
  checkTransactions CheckTransaction[] // Alle checks geïnitieerd door deze gebruiker (indien ingelogd)
}

model Animal {
  id               String          @id @default(uuid())
  chipNumber       String          @unique // Of een ander uniek dier-ID
  name             String?
  species          String?
  // ... andere diergegevens

  // Nieuwe velden
  riskScore        RiskScore       @default(GROEN) // De berekende risicoscore voor dit dier
  lastRiskScoreUpdate DateTime     @default(now()) // Datum van laatste score update

  // Relaties
  ownerId          String // Huidige eigenaar
  owner            User            @relation("Owner", fields: [ownerId], references: [id])
  fraudReports     FraudReport[]
}

model CheckTransaction {
  id                String      @id @default(uuid())
  sessionId         String?     // UUID om anonieme check-sessies te traceren
  userId            String?     // Optioneel: als de gebruiker is ingelogd
  user              User?       @relation(fields: [userId], references: [id])
  chipNumber        String      // Het chipnummer dat is gecheckt
  amount            Int         // Bedrag in centen (bijv. 200 voor 2 euro)
  currency          String      @default("EUR")
  status            CheckStatus @default(PENDING)
  molliePaymentId   String?     // ID van de Mollie betaling
  mollieCheckoutUrl String?     // De URL waar de gebruiker naartoe moet voor betaling
  riskScoreDisplayed Boolean    @default(false) // Geeft aan of de score al is getoond na betaling
  createdAt         DateTime    @default(now())
  paidAt            DateTime?
  displayValidUntil DateTime?   // Optioneel: hoe lang de getoonde score geldig is
}

model FraudReport {
  id                 String          @id @default(uuid())
  reporterId         String          // ID van de gebruiker die de melding doet
  reporter           User            @relation("Reporter", fields: [reporterId], references: [id])
  reportedOwnerId    String          // ID van de eigenaar waarover de melding gaat
  reportedOwner      User            @relation(fields: [reportedOwnerId], references: [id])
  animalId           String          // ID van het dier waar de melding betrekking op heeft
  animal             Animal          @relation(fields: [animalId], references: [id])
  type               String          // Type fraude (bijv. "dubbele_registratie", "valse_identiteit", "gestolen_dier")
  description        String          // Gedetailleerde beschrijving van de fraude
  status             FraudReportStatus @default(PENDING_VET_REVIEW)
  confirmedById      String?         // ID van de dierenarts die de melding heeft bevestigd
  confirmer          User?           @relation("Confirmer", fields: [confirmedById], references: [id])
  confirmationDate   DateTime?
  createdAt          DateTime        @default(now())
}

// Systeem configuratie voor drempelwaarden en andere parameters
model SystemConfig {
  key   String @id
  value String
}
```

---

## 3. Gefaseerde Blauwdruk voor Implementatie

### Fase 1: Koper-risico-score (Vervanging van booleans)

**Doel:** De huidige booleans in `/verify` vervangen door een `RiskScore` (Groen/Oranje/Rood). Dit drukt de verifieerbaarheid uit, NIET schuld.

**Backend (`Node/Express/Prisma`):**
1.  **`/src/types/verify.ts`:**
    ```typescript
    export enum RiskScore {
      GROEN = 'GROEN',
      ORANJE = 'ORANJE',
      ROOD = 'ROOD',
    }
    export interface VerifyResult {
      chipNumber: string;
      riskScore: RiskScore;
      message?: string; // Optionele toelichting
    }
    ```
2.  **`/src/services/verificationService.ts` (nieuw):**
    *   Een functie die de `RiskScore` berekent op basis van de verificatiestappen.
    *   Voorbeeldlogica:
        *   `isRegistered: boolean` (dier geregistreerd)
        *   `isOwnerVerified: boolean` (eigenaar identiteit geverifieerd)
        *   `isChainComplete: boolean` (herkomstketen compleet)
        *   `isChainConsistent: boolean` (herkomstketen consistent)
        *   **Implementatie:**
            *   Als `!isRegistered` of `!isOwnerVerified` of `!isChainComplete` => `ROOD`.
            *   Als `!isChainConsistent` => `ORANJE`.
            *   Anders => `GROEN`.
            *   *Toevoeging voor Fraude:* In Fase 3 zal hier ook de `Animal.riskScore` en `Owner.fraudStatus` worden meegenomen.
3.  **`/src/routes/verify.ts` (aangepast):**
    *   De endpoint `/verify` (of `/verify/:chipNumber`) wordt aangepast om de `verificationService` aan te roepen en een `VerifyResult` object terug te geven met de `riskScore`.
    *   Voor nu zal deze endpoint *direct* de score teruggeven. In Fase 2 zal dit worden geïntegreerd met de betaling.

**Frontend (`React/TypeScript/Vite`):**
1.  **`/src/types/verify.ts`:** Match de backend types.
2.  **`/src/components/VerifyResultDisplay.tsx` (aangepast):**
    *   Update de component die de `VerifyResult` toont. In plaats van booleans, toon de `riskScore` (bijv. met een gekleurde achtergrond, icoon, of tekst).
    *   `if (riskScore === RiskScore.GROEN)` -> groen display
    *   `if (riskScore === RiskScore.ORANJE)` -> oranje display
    *   `if (riskScore === RiskScore.ROOD)` -> rood display
3.  **`/src/pages/Verify.tsx` (aangepast):**
    *   Roept de aangepaste `/verify` endpoint aan en passed de resultaten door aan `VerifyResultDisplay`.

### Fase 2: Koper betaalt 2 euro per check via Mollie

**Doel:** De gebruiker betaalt 2 euro via Mollie (iDEAL/creditcard) voordat de `RiskScore` wordt getoond.

**Backend (`Node/Express/Prisma`):**
1.  **Prisma Schema:** `CheckTransaction` model en `CheckStatus` enum (zie sectie 2).
2.  **`/src/services/mollieService.ts` (nieuw):**
    *   Verantwoordelijk voor interactie met de Mollie API.
    *   `createPayment(amount: number, description: string, redirectUrl: string, webhookUrl: string): Promise<{ paymentId: string, checkoutUrl: string }>`.
    *   `getPaymentStatus(paymentId: string): Promise<MolliePaymentStatus>`.
3.  **`/src/routes/verify.ts` (aangepast):**
    *   **Nieuw Endpoint: `POST /verify/initiate-check`**
        *   Input: `{ chipNumber: string }`
        *   Logica:
            1.  Genereer een `sessionId` (UUID) voor deze check.
            2.  Controleer of het `chipNumber` überhaupt bestaat in het systeem. Zo niet, retourneer direct een foutmelding (geen betaling nodig).
            3.  Maak een `CheckTransaction` in de database met `status: PENDING`. Sla `sessionId` en `chipNumber` op.
            4.  Roep `mollieService.createPayment` aan (2 euro, beschrijving, `redirectUrl` naar frontend `check-status` pagina, `webhookUrl` naar `POST /mollie/webhook`).
            5.  Update de `CheckTransaction` met `molliePaymentId` en `mollieCheckoutUrl`.
            6.  Retourneer `{ sessionId: string, mollieCheckoutUrl: string }`.
    *   **Nieuw Endpoint: `GET /verify/check-status/:sessionId`**
        *   Input: `sessionId`
        *   Logica: Haal `CheckTransaction` op. Retourneer `{ status: CheckStatus }`. Frontend pollt dit.
    *   **Aangepast Endpoint: `GET /verify/result/:sessionId`**
        *   Input: `sessionId`
        *   Logica:
            1.  Haal `CheckTransaction` op.
            2.  **Als `status !== PAID`:** Retourneer fout (bijv. 402 Payment Required).
            3.  **Als `riskScoreDisplayed === true`:** Retourneer de eerder berekende en opgeslagen score (cache of `CheckTransaction` veld, indien gewenst). Dit voorkomt herberekening en mogelijk extra kosten/belasting bij het herladen van de pagina.
            4.  **Anders:**
                a.  Haal het `chipNumber` uit de `CheckTransaction`.
                b.  Roep `verificationService.calculateRiskScore(chipNumber)` aan.
                c.  Update `CheckTransaction.riskScoreDisplayed = true`.
                d.  Retourneer de berekende `VerifyResult`.
4.  **`/src/routes/mollie.ts` (nieuw):**
    *   **Nieuw Endpoint: `POST /mollie/webhook`**
        *   Logica:
            1.  Ontvang de Mollie webhook payload (bevat `id` van de betaling).
            2.  **Cruciaal:** Roep `mollieService.getPaymentStatus(paymentId)` aan om de *echte* status van Mollie op te halen (vertrouw de webhook payload zelf niet volledig i.v.m. spoofing).
            3.  Update de `CheckTransaction` met de Mollie status (PAID, FAILED, etc.).
            4.  Retourneer een 200 OK.

**Frontend (`React/TypeScript/Vite`):**
1.  **`/src/pages/VerifyPage.tsx` (aangepast):**
    *   Inputveld voor chipnummer.
    *   `onSubmit`: Roept `POST /verify/initiate-check` aan.
    *   Bij succes: Sla `sessionId` op (bijv. in `localStorage` of `URL parameters`) en navigeer naar `mollieCheckoutUrl` (of open in nieuw tabblad/popup).
    *   Nieuw scherm/component voor `check-status`:
        *   Haalt `sessionId` uit URL/storage.
        *   Start een polling-mechanisme (`setInterval`) dat `GET /verify/check-status/:sessionId` aanroept.
        *   Zodra `status === PAID`: Stop polling, roep `GET /verify/result/:sessionId` aan en toon de `VerifyResultDisplay`.
        *   Afhandeling van `FAILED` status, foutmeldingen, etc.

### Fase 3: Fraude-respons (Arts-bevestigde reputatie-cascade)

**Doel:** Een graduele fraude-flag op basis van patroon en volume over tijd, bevestigd door een geverifieerde dierenarts, cascaderend naar alle aanmeldingen van dezelfde persoon. Drempels zijn configureerbaar.

**Backend (`Node/Express/Prisma`):**
1.  **Prisma Schema:** `User.fraudStatus`, `FraudReport` model, `UserFraudStatus`, `FraudReportStatus` en `SystemConfig` (zie sectie 2).
2.  **`/src/services/systemConfigService.ts` (nieuw):**
    *   Functie om configureerbare parameters op te halen (bijv. `getThreshold(key: string)`).
    *   Voorbeelden: `fraud_orange_threshold`, `fraud_red_threshold`, `fraud_block_threshold`, `fraud_review_period_days`.
3.  **`/src/services/fraudService.ts` (nieuw):**
    *   `reportFraud(reporterId: string, reportedOwnerId: string, animalId: string, type: string, description: string): Promise<FraudReport>`: Maakt een nieuwe `FraudReport` aan met `PENDING_VET_REVIEW`.
    *   `confirmFraud(reportId: string, vetId: string): Promise<FraudReport>`:
        *   Update `FraudReport` naar `CONFIRMED_BY_VET`.
        *   Triggert direct een `assessUserFraudStatus(reportedOwnerId)` (zie hieronder).
    *   `rejectFraud(reportId: string, vetId: string, reason: string): Promise<FraudReport>`:
        *   Update `FraudReport` naar `REJECTED_BY_VET`.
    *   `assessUserFraudStatus(ownerId: string): Promise<User>`:
        *   **De kern van de cascade-logica.**
        *   Haalt alle `CONFIRMED_BY_VET` `FraudReport`s op voor `ownerId` binnen de `fraud_review_period_days` (uit `SystemConfig`).
        *   Telt het volume (`N`).
        *   Past de drempelwaarden toe (uit `SystemConfig`):
            *   `N >= block_threshold` => `UserFraudStatus.BLOKKADE`
            *   `N >= red_threshold` => `UserFraudStatus.ROOD`
            *   `N >= orange_threshold` => `UserFraudStatus.ORANJE`
            *   Anders => `UserFraudStatus.LEREN` (tenzij de status al `BLOKKADE` was, die is permanent)
        *   Update `User.fraudStatus` en `User.lastFraudAssessment`.
        *   **Cascade naar dieren:** Wanneer `User.fraudStatus` verandert, *moet* de `Animal.riskScore` van *alle* dieren (actueel en voormalig) die aan deze eigenaar gekoppeld zijn, opnieuw worden berekend via `verificationService.calculateRiskScore`. Dit kan asynchroon gebeuren voor performantie.
4.  **`/src/cron/fraudAssessor.ts` (nieuw):**
    *   Een achtergrondtaak (bijv. dagelijkse cron job) die `fraudService.assessUserFraudStatus` aanroept voor alle gebruikers met `fraudStatus` die nog niet `BLOKKADE` is, of wiens `lastFraudAssessment` ouder is dan X dagen.
5.  **`/src/routes/fraud.ts` (nieuw):**
    *   `POST /fraud/report` (Authenticatie vereist):
        *   Input: `{ animalId: string, reportedOwnerId: string, type: string, description: string }`
        *   Logica: Roept `fraudService.reportFraud` aan.
    *   `GET /fraud/reports/pending-vet-review` (Authenticatie + `isVerifiedVet` vereist):
        *   Logica: Haal alle `FraudReport`s op met `status: PENDING_VET_REVIEW`.
    *   `POST /fraud/report/:reportId/confirm` (Authenticatie + `isVerifiedVet` vereist):
        *   Logica: Roept `fraudService.confirmFraud` aan met `vetId` van de geauthenticeerde gebruiker.
    *   `POST /fraud/report/:reportId/reject` (Authenticatie + `isVerifiedVet` vereist):
        *   Logica: Roept `fraudService.rejectFraud` aan.
6.  **`/src/services/verificationService.ts` (aangepast, Fase 1):**
    *   De `calculateRiskScore` functie moet nu ook rekening houden met de `User.fraudStatus` van de huidige eigenaar van het dier.
    *   Voorbeeld:
        *   Als `owner.fraudStatus === UserFraudStatus.BLOKKADE` => `RiskScore.ROOD`.
        *   Als `owner.fraudStatus === UserFraudStatus.ROOD` => `RiskScore.ROOD`.
        *   Als `owner.fraudStatus === UserFraudStatus.ORANJE` => `RiskScore.ORANJE` (of `ROOD` afhankelijk van beleid).
        *   Anders (naast bestaande verificatielogica) => `GROEN`/`ORANJE`/`ROOD` zoals in Fase 1.
    *   Dit zorgt ervoor dat de fraudestatus van de eigenaar direct impact heeft op de publieke verifieerbaarheidsscore van het dier.

**Frontend (`React/TypeScript/Vite`):**
1.  **`/src/components/FraudReportForm.tsx` (nieuw):**
    *   Een formulier waar gebruikers (ingelogd) of dierenartsen (geverifieerd) fraude kunnen melden voor een dier/eigenaar.
    *   Roept `POST /fraud/report` aan.
2.  **`/src/pages/VetDashboard.tsx` (nieuw, afgeschermd voor `isVerifiedVet`):**
    *   Toont een lijst van `FraudReport`s met `status: PENDING_VET_REVIEW`.
    *   Mogelijkheid om details te bekijken en een melding te `confirm` of `reject` (roept `/fraud/report/:reportId/confirm` of `reject` aan).
3.  **`/src/pages/VerifyPage.tsx` (aangepast):**
    *   De `VerifyResultDisplay` toont de uiteindelijke `riskScore`, die nu (impliciet) beïnvloed kan zijn door de `User.fraudStatus` van de eigenaar. Er wordt geen directe "eigenaar is fraudeur" melding getoond omwille van privacy, enkel de impact op de verifieerbaarheid van het dier.

---

## 4. ZK-compatibiliteit

De gepresenteerde architectuur is ontworpen om de logica te scheiden van de onderliggende data. Dit maakt een overgang naar ZK-technologie in de toekomst soepeler.

*   **Huidige situatie:** Alle controles en berekeningen vinden server-side plaats op basis van direct toegankelijke databasegegevens.
*   **Toekomstige ZK-integratie:**
    *   **Koper-risico-score:** In plaats van de backend die zelf de verifieerbaarheid controleert, zou een ZK-proof kunnen worden gegenereerd (door een geautoriseerde partij of zelfs de eigenaar) die bewijst: "Dit dier is geregistreerd en de herkomstketen is geldig, zonder de volledige keten publiek te maken." De backend zou dan de ZK-proof verifiëren en op basis daarvan de `RiskScore` bepalen.
    *   **Fraude-respons (Dierenarts-bevestiging):** Het bewijs dat een gebruiker een geverifieerde dierenarts is (`isVerifiedVet`) zou een ZK-proof kunnen zijn ("Bewijs dat ik een geverifieerde dierenarts ben zonder mijn identiteit te onthullen"). Ook de bevestiging van fraudemeldingen zou met ZK-proofs kunnen werken ("Bewijs dat ik N fraudemeldingen voor deze eigenaar heb bevestigd, zonder de details van de meldingen te onthullen").
    *   **Betalingsbewijs:** Een ZK-proof zou kunnen bewijzen dat een betaling van 2 euro voor een check is gedaan, zonder de identiteit van de betaler of de specifieke transactiegegevens openbaar te maken.

De `RiskScore` en `UserFraudStatus` definities blijven hetzelfde; enkel de *manier waarop* deze worden berekend of bewezen, verandert van directe database-operaties naar verificatie van ZK-proofs. Dit betekent dat de API-endpoints en frontend-interacties grotendeels intact kunnen blijven, terwijl de interne backend-logica wordt aangepast.
