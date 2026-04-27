# IDSee — Claude Instructions

> **Type:** Pet Origin Verification webapp — privacy-preserving, blockchain-backed
> **Stack:** React + TypeScript + Vite (frontend) / Node.js + Express + Prisma (backend) / Cardano (blockchain)
> **Onveranderlijke regels:** zie HavunCore `CLAUDE.md` (6 Onschendbare Regels) — eerst raadplegen.
> **Detail-context:** `README.md` + `HANDOVER.md` + `docs/`

## De 6 Onschendbare Regels

1. NOOIT code schrijven zonder KB + kwaliteitsnormen te raadplegen
2. NOOIT features/UI-elementen verwijderen zonder instructie
3. NOOIT credentials/keys/env aanraken
4. ALTIJD tests draaien voor én na wijzigingen (kritieke paden 100% gedekt, zinvolheid > coverage-%)
5. ALTIJD toestemming vragen bij grote wijzigingen
6. NOOIT een falende test "fixen" door de assertion te wijzigen — eerst oorzakenonderzoek (VP-17)

## Werkwijze

LEES → DENK → DOE → DOCUMENTEER. Bij twijfel: vraag en wacht op antwoord.
Volledig: `HavunCore/docs/kb/runbooks/claude-werkwijze.md`.

## Project basics

- **Buyers:** verifiëren puppy via chipnummer — gratis, geen account
- **Professionals:** breeders/vets/chippers registreren dieren via credits-systeem
- **Blockchain:** Cardano voor immutable proof (demo mode, Lucid later)
- **Payments:** Mollie (iDEAL + creditcard)

## Lokaal starten

```bash
cd backend && npm install && npm run dev      # API server
cd frontend && npm install && npm run dev     # React webapp (Vite)
```

## Havun Standaarden (verplicht — zie HavunCore KB)

Bij elke code-wijziging gelden de centrale Havun-normen. Lees bij twijfel de relevante doc:

| Norm | Centrale doc |
|------|-------------|
| 6 Onschendbare Regels | `HavunCore/CLAUDE.md` |
| Auth-standaard (magic + bio/QR + wachtwoord-optin) | `HavunCore/docs/kb/reference/authentication-methods.md` |
| Test-quality policy (kritieke paden 100 %, MSI ≥ 80 %) | `HavunCore/docs/kb/reference/test-quality-policy.md` |
| Quality standards (>80 % coverage nieuwe code, form requests, rate-limit) | `HavunCore/docs/kb/reference/havun-quality-standards.md` |
| Productie-deploy eisen (SSL/SecHeaders/Mozilla/Hardenize/Internet.nl) | `HavunCore/docs/kb/reference/productie-deploy-eisen.md` |
| V&K-systeem (qv:scan + qv:log) | `HavunCore/docs/kb/reference/qv-scan-latest.md` |
| Test-repair anti-pattern (VP-17) | `HavunCore/docs/kb/runbooks/test-repair-anti-pattern.md` |
| Universal login screen | `HavunCore/docs/kb/patterns/universal-login-screen.md` |
| Werkwijze + beschermingslagen + DO NOT REMOVE | `HavunCore/docs/kb/runbooks/claude-werkwijze.md` |

> **Bij twijfel:** `cd D:/GitHub/HavunCore && php artisan docs:search "<onderwerp>"`
