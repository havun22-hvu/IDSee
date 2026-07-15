# IDSee — Claude Instructions

> **Type:** Pet Origin Verification webapp — privacy-preserving, blockchain-backed
> **Stack:** React + TypeScript + Vite (frontend) / Node.js + Express + Prisma (backend) / Cardano (blockchain)
> **Onveranderlijke regels:** zie HavunCore `CLAUDE.md` (6 Onschendbare Regels) — eerst raadplegen.
> **Detail-context:** `README.md` + `HANDOVER.md` + `docs/`

## ⛔ Kritieke Gedragsregels (herhaling = overtreding)

| Situatie | Wat Claude doet |
|----------|----------------|
| **Overleg/discussie** | Luisteren, analyseren, samenvatten + plan maken — NOOIT halverwege code schrijven. Code pas na expliciet "ga maar". |
| **Technische beslissing** | Zelf beslissen, kort melden wat er gedaan is — NOOIT vragen aan Henk. |
| **MD bijwerken** (handover/context/KB) | Gewoon doen — NOOIT "mag ik dit documenteren?" vragen. |

## Rolverdeling & Werkwijze (Havun-standaard)

| Situatie | Wat Claude doet |
|----------|----------------|
| **Rolverdeling** | Henk = architect + tester. Claude = implementer (code, docs, geautom. tests, commits, deploys). |
| **Vragen** | UITSLUITEND in planningsfase (MD/plan). Na "ga maar" → volledig autonoom. Open handover-items → direct beginnen, NOOIT "wil je daarmee beginnen?" vragen. Nooit vragen: "Mag ik X?", "Zal ik Y doen?", "Wat moet ik als volgende doen?", "Zal ik eerst A of eerst B doen?" — bij volgordekeuze altijd de beste optie zelf kiezen en starten. |
| **Per-agendapunt** | Na elk punt: geautom. tests draaien → V&K check → /simplify → MD docs+planning+handover bijwerken → commit+push → volgende punt. |
| **Issues** | Direct oplossen bij /start. HIGH=fixen, MEDIUM=evalueren, LOW=auto-ignore. Nooit laten ophopen. |
| **Testen** | Claude draait geautomatiseerde tests (PHPUnit/Jest). Praktische browser-test = Henk, op zijn eigen moment. |

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

> **Leidend document:** `docs/PROPOSITION.md` — bij conflict wint de propositie.

- **Buyers:** verifiëren puppy via chipnummer (geen account) → **risico-score**
  🟢/🟠/🔴; **€2 per check** (primaire inkomstenstroom)
- **Professionals:** breeders/vets/chippers registreren dieren via credits-systeem
- **Fraude-respons:** arts-bevestigde reputatie-cascade, gradueel (leren→oranje→rood→blokkade)
- **Positionering:** *beter alternatief* voor het wettelijke register — **geen** vervangingsclaim
- **Blockchain:** Cardano voor immutable proof (demo mode, Lucid later); Midnight ZKP voor anonieme score
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
| Productie-deploy eisen (SSL/SecHeaders/Mozilla/Hardenize/Internet.nl + OS+app-hardening) | `HavunCore/docs/kb/reference/productie-deploy-eisen.md` |
| V&K-systeem (qv:scan + qv:log) | `HavunCore/docs/kb/reference/qv-scan-latest.md` |
| Test-repair anti-pattern (VP-17) | `HavunCore/docs/kb/runbooks/test-repair-anti-pattern.md` |
| Universal login screen | `HavunCore/docs/kb/patterns/universal-login-screen.md` |
| Werkwijze + beschermingslagen + DO NOT REMOVE | `HavunCore/docs/kb/runbooks/claude-werkwijze.md` |

> **Bij twijfel:** `cd D:/GitHub/HavunCore && php artisan docs:search "<onderwerp>"`


## AI Werkwijze — Gemini + Claude

- **`/arch [opdracht]`** — Gemini blauwdruk genereren (groot contextvenster)
- **`/mpc ga maar`** — blauwdruk uitvoeren
- Blauwdruk landt in `.claude/blueprint.md`, `/start` detecteert dit automatisch

Zie `docs/kb/runbooks/gemini-claude-workflow.md` voor de volledige pipeline.

## MD-docs schrijven — hou ze leesbaar voor Claude

Een te lang doc wordt niet gelezen: het verdringt andere docs uit de context, en de KB indexeert
alleen het **begin** van een bestand (~2000-8000 tekens) — alles daarna is onvindbaar via `docs:search`.

- **Max:** KB-doc/runbook 200 regels · CLAUDE.md 120 · plan/blueprint 300 · handover 15-30 regels per sessie
- **Hiërarchie:** conclusie + status bovenaan, tabel in het midden, onderbouwing onderaan
- **Te groot?** Splitsen in index + deeldocs. Niet persen tot telegramstijl — onleesbaar is niet kort
- **Handover:** er is er **één** en die werk je **bij** — nooit een sessieblok toevoegen.
  Afgeronde taken eruit, nieuwe erbij. Levende status, geen logboek (git bewaart de historie)

Volledig: `HavunCore/docs/kb/standards/md-doc-grootte.md`
