---
title: Midnight Network — Overzicht
type: reference
scope: idsee
last_check: 2026-05-30
source: https://docs.midnight.network / https://academy.midnight.network
---

# Midnight Network — Overzicht

## Wat is Midnight?

Midnight is een **privacy-first blockchain** die is gebouwd als sidechain van Cardano. Het maakt het mogelijk om te *bewijzen dat iets waar is* zonder te *onthullen wie je bent of wat de onderliggende data is*.

Kerngedachte: **Zero-Knowledge Proofs (ZK-proofs)** — cryptografisch bewijs dat een statement klopt, zonder de invoergegevens te laten zien.

## Waarom Midnight voor IDSee?

| Vraag | Zonder Midnight | Met Midnight |
|-------|----------------|--------------|
| Is deze fokker erkend? | "Ja, Jan de Vries KvK 12345" — privacy geschonden | "Ja" — cryptografisch bewezen, anoniem |
| Is dit dier ingeënt? | Gezondheidsdata zichtbaar | "Ja, vaccinatiebewijs aanwezig" — niets gelekt |
| Is deze chipper gecertificeerd? | Naam/BIG-nummer zichtbaar | "Gecertificeerd" — bewijs zonder identiteit |

## Architectuur: Dubbele State

Midnight werkt met twee lagen:

```
┌─────────────────────────────────────────────────────────┐
│  PUBLIEKE STATE (on-chain, zichtbaar voor iedereen)     │
│  • ZK-proofs (128 bytes, compact)                       │
│  • Merkle tree roots                                    │
│  • Nullifiers (om dubbel gebruik te voorkomen)          │
│  • Verificatieresultaten (true/false)                   │
└─────────────────────────────────────────────────────────┘
          ▲ alleen cryptografische bewijzen
          │
┌─────────────────────────────────────────────────────────┐
│  PRIVATE STATE (lokaal, nooit on-chain)                 │
│  • Fokker identiteit                                    │
│  • Chip ID's                                            │
│  • Gezondheidsrecords                                   │
│  • BIG-nummers / KvK-nummers                           │
└─────────────────────────────────────────────────────────┘
```

## Hoe ZK-proofs werken in Midnight

1. **Gebruiker heeft privédata** (bijv. fokker-ID + erkenningsnummer)
2. **Lokale berekening** — Compact contract runt op gebruikersmachine
3. **ZK-proof gegenereerd** — wiskundig bewijs dat de berekening correct was
4. **Proof naar blockchain** — 128 bytes, geen privédata
5. **Validator verifieert** — in milliseconden, zonder private data te zien
6. **On-chain: alleen het resultaat** — "gecertificeerd: ja/nee"

## Kachina Proving System

Midnight gebruikt **Kachina** als ZK-bewijs systeem (gebouwd op zk-SNARKs):
- **zk-SNARK** = Zero-Knowledge Succinct Non-Interactive Argument of Knowledge
- Proof is altijd 128 bytes, ongeacht complexiteit van de berekening
- **Non-interactief** — prover genereert proof zelfstandig, geen heen-en-weer communicatie
- Gebaseerd op **Universally Composable (UC) security model**

## Compact Taal

Smart contracts worden geschreven in **Compact** — een TypeScript-achtige DSL:
- Compileert naar ZK-circuits (wiskundige beperkingen)
- Geen cryptografie-expertise nodig
- Gescheiden: circuit code (validatielogica) vs. off-chain code (applicatielogica)
- Zie `COMPACT-LANGUAGE.md` voor syntax en patronen

## SDK & Tooling

| Tool | Doel |
|------|------|
| **Midnight.js** (v4.0.4) | TypeScript SDK — contracts deployen, aanroepen, state beheren |
| **Compact compiler** | `.compact` bestanden → ZK-circuits |
| **Lace wallet** | Browser wallet voor Midnight (nodig voor DApp connector) |
| **Midnight Indexer API** | GraphQL — blockchain data opvragen |
| **Proof providers** | HTTP of DApp connector — proof generatie |
| **Devnet/Testnet** | Testomgeving met valueless tokens |

## Tokens

- **DUST** — shielded, niet-overdraagbaar, verbruikbaar — betaalt transactiekosten
- **NIGHT** — governance token
- Voor IDSee: backend genereert proofs, gebruiker hoeft nooit tokens te beheren

## Roadmap Status (per 30 mei 2026)

| Fase | Status |
|------|--------|
| Hilo — NIGHT token op Cardano | ✅ Afgerond |
| Kolu — Gefedereerd Mainnet (DApps live) | ✅ Actief (Q1 2026) |
| Mahalu — Incentivized mainnet + SPO's | 🔜 Q2 2026 |
| Ua — Volledige decentralisatie + bridges | 📅 Q3 2026 |

**Timing voor IDSee is goed:** Mainnet is actief, we kunnen al bouwen en deployen.

## Relevante Links

- Documentatie: https://docs.midnight.network
- Academy: https://academy.midnight.network
- GitHub: https://github.com/midnightntwrk
- Forum: https://forum.midnight.network
- Discord: https://discord.com/invite/midnightnetwork
- MCP server: https://docs.midnight.network/ai-integration (102 repositories geïndexeerd)
