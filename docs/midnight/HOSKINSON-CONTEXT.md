---
title: Midnight — Charles Hoskinson Context (video samenvatting)
type: reference
scope: idsee
last_check: 2026-05-30
source: Midnight YouTube — Unshielded Ep.1 + Midnight Summit 2025 Keynote
---

# Charles Hoskinson over Midnight

## Waarom bestaande blockchains falen op privacy

**Absolute transparantie is een bedrijfsprobleem.** Bitcoin en Ethereum zijn volledig publiek — geen enkel bedrijf kan functioneren als salarissen, leveranciersdata en interne transacties voor iedereen zichtbaar zijn.

**Pseudonimiteit is een illusie.** Gebruikers denken anoniem te zijn, maar via:
- Blockchain-analyse (Chainalysis e.a.)
- Gecentraliseerde exchanges (Coinbase, Binance — KYC)
- *Linkability* (koppeling van adressen aan transacties)

...is bijna altijd te achterhalen wie iemand is. Dit is precies het IDSee-probleem: fokkers/dierenartsen willen niet publiek traceerbaar zijn op de blockchain.

---

## De drie pijlers van Midnight

### 1. DIDs & Disclosure Regimes (Atala PRISM)

Selectieve, binaire beweringen:
- "Ben je ouder dan 21?" → **ja/nee**, zonder geboortedatum te onthullen
- "Ben je een erkende fokker?" → **ja/nee**, zonder naam/KvK te onthullen
- "Is dit dier ingeënt?" → **ja/nee**, zonder gezondheidsdata te tonen

Onderliggende technologie: Decentralized Identifiers (DIDs), gebaseerd op Atala PRISM (al bestaand Cardano project).

### 2. Private Smart Contracts — Kachina

- Framework ontwikkeld in 2020
- Contracts hebben **publieke EN private state** tegelijk
- Developers schrijven gewone TypeScript-achtige code (Compact)
- Het netwerk berekent zelf wat publiek blijft en wat privaat wordt
- Geen cryptografie-expertise nodig voor de developer

### 3. Multi-Resource Consensus (MRC / Minotaur)

- Midnight kan **meerdere consensusmechanismen** koppelen: PoW, PoS, PoH
- Werkt als **universele Layer 2** voor: Bitcoin, Ethereum, Solana, Cardano
- Gebruikers kunnen betalen met hun eigen tokens (ETH, SOL, ADA) — geen migratie nodig

**IDSee relevantie:** We zijn niet gelimiteerd tot Cardano. De backend kan Midnight aanspreken ongeacht welke chain de gebruiker gebruikt.

---

## "Settlement is Compliance" — Algoritmische Regulering

Hoskinson's kernidee voor gereguleerde DeFi:

```
Gebruiker stuurt transactie naar DEX
  + ZK-proof dat zij aan de wet voldoen
  
Netwerk verifieert de proof — ziet NOOIT de identiteitsdata
Transactie is direct compliant bij afwikkeling
Geen centrale poortwachter nodig
```

**IDSee parallel:** Een koper verifieert een dier:
- Ontvangt ZK-proof dat fokker erkend is
- Ziet NOOIT wie de fokker is
- Is direct compliant met dierenwelzijnsregels

---

## Hawaiian Launch Roadmap — Status per 30 mei 2026

| Fase | Naam | Inhoud | Status |
|------|------|--------|--------|
| 1 | **Hilo** | NIGHT token als Cardano Native Asset (Glacier Drop), uitrol op Cardano exchanges | ✅ Afgerond |
| 2 | **Kolu** | Gefedereerd Midnight Mainnet — DApps live brengen | ✅ Q1 2026 — ACTIEF |
| 3 | **Mahalu** | Geïncentiveerd mainnet, Cardano SPO's valideren blokken | 🔜 Q2 2026 — Nu of binnenkort |
| 4 | **Ua** | Volledige decentralisatie, trustless Cardano↔Midnight bridge, ETH/SOL/BTC interop | 📅 Q3 2026 |

**Conclusie voor IDSee:** Het gefedereerde mainnet (Kolu) is al actief. DApps kunnen live. We zitten in de ideale timing om te beginnen — Mahalu (volledige SPO-validatie) en Ua (full decentralisatie) komen eraan.

---

## Codebase & Ecosysteem

Midnight leent technologie van:
- **Halo 2** (Zcash) — ZK-proof systeem
- **Aptos** — runtime componenten
- **Concordium** — identity layer
- **Substrate** (Polkadot) — blockchain framework

Niemand hoeft te migreren. Midnight is een extensie, geen vervanging.

---

## Private DAOs

Met Midnight mogelijk:
- **Anonieme stemmen** in DAO's
- **Afgeschermde interne HR** (salarissen niet publiek)
- **Private governance**

**Aeterna relevantie:** Als Aeterna DAO-achtige structuren gebruikt (bijv. stemmen over regels/bestuur), kan Midnight dit privé maken.

---

## Token

- **$NIGHT** — governance token, gedistribueerd via Glacier Drop (Cardano Native Asset)
- **Eerlijke distributie** — geen VC's, geen token sales
- Community mining via Scavenger Hunt (repliceerde 2,5 jaar Bitcoin mining in 21 dagen)
- **DUST** — transactiekosten token (shielded, verbruikbaar)

Voor IDSee: backend absorbeert DUST kosten → gebruiker betaalt in credits (€), nooit in crypto.
