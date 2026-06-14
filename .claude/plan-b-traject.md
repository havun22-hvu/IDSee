# Plan — B-traject (risico-score, fraude-cascade, €2-betaling)

> Afgeleid van `.claude/blueprint.md` (Gemini) + getoetst aan `docs/PROPOSITION.md` (leidend)
> en het **bestaande** Prisma-schema. Status: ter goedkeuring — nog niet uitgevoerd.

## Correcties op de Gemini-blauwdruk (verplicht)

De blauwdruk ging uit van een fictief datamodel. Dit plan corrigeert dat:

| Blauwdruk | Werkelijkheid (volgen) |
|-----------|------------------------|
| Prisma `enum RiskScore {...}` | SQLite kent geen enums → **`String` + comment** (projectstijl) |
| `Animal.chipNumber` (plaintext) | Bestaand `Animal.chipIdHash` (privacy/AVG §5) — **niet wijzigen** |
| `User.ownedAnimals @relation("Owner")` | Persoon-koppeling via `Registration.userId` + `Registration.breederUserId` |
| Nieuw `User.fraudStatus/isVerifiedVet` los | Hergebruik bestaande `role==='VET' && verificationStatus==='VERIFIED'`, `warningCount`, `isSuspended`; voeg alleen `fraudStatus` toe |
| Mollie direct live | **Demo-payment-provider** nu (geen credentials); echte Mollie later via env + dependency (overleg) |

## Scope & volgorde

Drie fasen. **Fase 1 is fundament** (score), Fase 3 bouwt erop (cascade beïnvloedt score),
Fase 2 (betaling) is grotendeels onafhankelijk maar zit in dezelfde verify-flow.

Voorgestelde volgorde: **Fase 1 → Fase 3 → Fase 2**. Reden: score + cascade zijn volledig
autonoom bouwbaar en testbaar; de betaling (Fase 2) heeft een demo-provider nodig en raakt
later credentials, dus die isoleren we als laatste.

---

## Fase 1 — Risico-score (vervangt booleans) ✅ AFGEROND (14 juni 2026)

> Geïmplementeerd: `riskScore.ts` (pure `scoreFromFactors`) + `verificationService.ts`
> (`calculateRiskScore`), `verify.ts` geeft nu `{ chipId, riskScore, factors }`,
> frontend `RiskScoreBadge` + `Verify.tsx`. Tests: 11 backend (Jest) + 1 component
> (Vitest). Build groen.

**Datamodel** (`schema.prisma`): geen verplichte wijziging. Score wordt **afgeleid**, niet
opgeslagen (voorkomt stale data). Optioneel later cachen.

**Backend:**
- `src/services/verificationService.ts` (nieuw): `calculateRiskScore(chipIdHash, ownerFraudStatus?)`
  → `'GROEN' | 'ORANJE' | 'ROOD'`. Regels (configureerbaar, voorlopig):
  - 🔴 ROOD: niet gevonden, of keten sluit niet (geen CONFIRMED registratie), of eigenaar `fraudStatus` ROOD/BLOKKADE
  - 🟠 ORANJE: gevonden maar schakel zwak (moeder onbekend, of breeder niet VERIFIED, of eigenaar ORANJE)
  - 🟢 GROEN: gevonden + CONFIRMED + breeder VERIFIED + moeder bekend + eigenaar LEREN
- `src/routes/verify.ts`: `GET /verify/:chipId` geeft nu `{ chipId, riskScore, factors }`
  i.p.v. losse booleans. `factors` = transparante onderbouwing (geen schuld-taal).
- `src/types/index.ts`: `VerifyResult` → `{ chipId, riskScore, factors }`.

**Frontend:**
- `src/components/verify/RiskScoreBadge.tsx` (nieuw): groen/oranje/rood weergave.
- `src/pages/Verify.tsx`: toon score + factortoelichting i.p.v. de boolean-lijst.
- `src/types/index.ts`: `VerifyResult` bijwerken.

**Tests:** `verificationService.test.ts` (Jest) — alle score-uitkomsten; `Verify`/badge (Vitest).

**Docs:** VERIFICATION.md "Koper-uitkomst" van "gepland" → "geïmplementeerd".

---

## Fase 3 — Fraude-cascade (arts-bevestigd, gradueel) ✅ AFGEROND (14 juni 2026)

> Geïmplementeerd: `fraudPolicy.ts` (pure cascade + worstFraudStatus), `fraudService.ts`,
> `systemConfigService.ts`, `routes/fraud.ts` (report/pending/confirm/reject, alleen VET),
> `calculateRiskScore` weegt `fraudStatus` mee, frontend `FraudReview.tsx` + nav/route.
> Schema: `User.fraudStatus`, `FraudReport`, `SystemConfig` (via `prisma db push`).
> Tests: 9 backend (drempels/leer-marge/blokkade/ergste-flag) + 3 component. Geen cron (v1).
> **Open v1.1:** meld-ingang in de UI (nu API-only).

**Datamodel** (`schema.prisma`, strings):
- `User.fraudStatus String @default("LEREN")` // LEREN, ORANJE, ROOD, BLOKKADE
- `User.lastFraudAssessment DateTime?`
- nieuw `FraudReport` model: reporterId, reportedUserId, animalId?, type, description,
  status ("PENDING_VET_REVIEW"/"CONFIRMED"/"REJECTED"), confirmedById?, confirmationDate?, createdAt
- nieuw `SystemConfig { key String @id, value String }` voor drempels
- migration + seed voorlopige drempels (PROPOSITION §9): orange=2, red=4, block=10, window=365d

**Backend:**
- `src/services/systemConfigService.ts` (nieuw): `getThreshold(key)`.
- `src/services/fraudService.ts` (nieuw): `reportFraud`, `confirmFraud` (alleen VET+VERIFIED),
  `rejectFraud`, `assessUserFraudStatus(userId)` = kern-cascade:
  - tel CONFIRMED reports binnen window → bepaal fraudStatus via drempels
  - **leer-marge:** onder orange-drempel blijft LEREN (groen) + feedback-flag
  - cascade: bij statuswijziging → score van alle dieren van die persoon herberekend
    (via `Registration.userId`/`breederUserId` → animal → calculateRiskScore)
- `src/routes/fraud.ts` (nieuw): `POST /fraud/report` (auth), `GET /fraud/pending` (VET),
  `POST /fraud/:id/confirm` (VET), `POST /fraud/:id/reject` (VET).
- `verificationService.calculateRiskScore` weegt `owner.fraudStatus` mee (Fase 1-haak).

**Frontend:**
- `src/pages/FraudReview.tsx` (nieuw, route `/fraud-review`, alleen VET): lijst pending +
  confirm/reject (hergebruik confirmation-card-patroon).
- `src/components/verify/FraudReportButton.tsx` (optioneel): melding doen vanaf detail.
- Header/Dashboard: link voor geverifieerde dierenarts.

**Bewust NIET nu:** cron-job (`fraudAssessor`) — `assessUserFraudStatus` triggert al bij
confirm; periodieke herbeoordeling is een latere optimalisatie.

**Tests:** `fraudService.test.ts` — drempels, leer-marge, cascade, alleen-VET-bevestigt.

**Docs:** VERIFICATION.md fraude-sectie "ontworpen" → "geïmplementeerd (v1)".

---

## Fase 2 — €2-betaling (demo-provider nu, Mollie later) ✅ AFGEROND (14 juni 2026)

> Geïmplementeerd: `paymentService.ts` (provider-abstractie, DemoProvider default,
> Mollie env-gated), `CheckTransaction` model, `verify.ts` (initiate-check/check-status/
> result met 402-gating), `routes/payment.ts` (webhook), frontend `Verify.tsx`
> (initiate → poll → score). Tests: 4 backend (demo-provider) + 3 component (betaal-flow).
> **Open:** echte Mollie (dependency `@mollie/api-client` + `MOLLIE_API_KEY`) — overleg.
> Integration tests met test-DB (402-gating end-to-end) → v1.1.

**Datamodel** (`schema.prisma`, strings):
- nieuw `CheckTransaction`: id, sessionId, chipId, amount(centen=200), currency,
  status ("PENDING"/"PAID"/"FAILED"), provider, providerPaymentId?, checkoutUrl?,
  scoreShown Boolean, createdAt, paidAt?

**Backend:**
- `src/services/paymentService.ts` (nieuw): provider-abstractie. **DemoProvider** (default,
  geen credentials): markeert direct PAID met fake checkout — analoog aan blockchain demo mode.
  **MollieProvider** (later, achter `PAYMENT_PROVIDER=mollie` + `MOLLIE_API_KEY` env).
- `src/routes/verify.ts`:
  - `POST /verify/initiate-check` {chipId} → bestaat chip? → maak CheckTransaction PENDING →
    provider.createPayment(200) → `{ sessionId, checkoutUrl }`
  - `GET /verify/check-status/:sessionId` → `{ status }` (frontend pollt)
  - `GET /verify/result/:sessionId` → 402 als niet PAID; anders calculateRiskScore + scoreShown=true
- `src/routes/payment.ts` (nieuw): `POST /payment/webhook` → provider.getStatus → update transactie.

**Frontend:**
- `src/pages/Verify.tsx`: chipnummer → initiate-check → (demo: direct door / Mollie: redirect)
  → poll check-status → bij PAID result tonen.

**⚠️ Overleg-moment (niet autonoom):** echte Mollie vereist `@mollie/api-client` (dependency)
+ `MOLLIE_API_KEY` (.env). Demo-provider levert de volledige werkende flow zonder die twee;
activering van echte Mollie doen we pas na jouw akkoord + sleutel.

**Tests:** `paymentService.test.ts` (demo-flow), `verify` betaal-gating (402 vóór PAID).

---

## Risico's

| Risico | Mitigatie |
|--------|-----------|
| Score-regels zijn deels beleid | Configureerbaar (SystemConfig); voorlopige defaults, ijken op data (§9) |
| Cascade kan veel dieren herberekenen | Score wordt afgeleid (niet opgeslagen) → herberekening = goedkoop; async indien nodig |
| Mollie-credentials ontbreken | Demo-provider; echte Mollie geïsoleerd achter env-flag |
| AVG (fraudegegevens) | `fraudStatus` intern; koper ziet alleen score, nooit persoon (§5); DPIA blijft open punt |
| Breaking change `VerifyResult` | Frontend + backend samen wijzigen; tests dekken het |

## Open punten voor Henk (business)
- Akkoord op de **voorlopige drempels** (orange=2, red=4, block=10, window=1jr)?
- Akkoord op **demo-provider nu, Mollie later**?
- Alles in **één keer** (3 fasen) of fase-voor-fase met tussentijdse review?
