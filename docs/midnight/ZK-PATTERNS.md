---
title: ZK Privacy Patronen — Midnight
type: reference
scope: idsee
last_check: 2026-05-30
source: https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private
---

# ZK Privacy Patronen voor IDSee

## Kernprincipe

In Midnight: **alles dat als argument aan een `ledger`-operatie wordt meegegeven is publiek zichtbaar** — behalve `HistoricMerkleTree` data types. Privédata wordt nooit rechtstreeks on-chain gezet.

## Patroon 1: Hash/Commitment

Sla alleen een hash/commitment op, nooit de ruwe data.

```
// On-chain (publiek):
commitment = persistentCommit(fokker_id, random_blinding_factor)

// Off-chain (privé):
fokker_id, random_blinding_factor  ← nooit on-chain!
```

**`persistentHash`** — voor binaire data  
**`persistentCommit`** — voor willekeurige types + randomness (voorkomt gissen én correlatie van identieke waarden)

## Patroon 2: Merkle Tree Lidmaatschap

Bewijs dat een waarde in een set zit zonder te onthullen wélke waarde.

```
// On-chain: alleen de Merkle root
merkle_root = MerkleTree<1024, FokkerEntry>

// ZK-proof bewijst: "mijn fokker_id zit in deze boom"
// Onthult NIET welke entry het is
```

Gebruik: **`MerkleTree<n, T>`** of **`HistoricMerkleTree<n, T>`**

In IDSee: registry van erkende fokkers/dierenartsen/chippers → alleen de root on-chain.

## Patroon 3: Commitment + Nullifier (Single-Use Tokens)

Combinatie voor eenmalig gebruik — voorkomt dubbel gebruik terwijl identiteit verborgen blijft.

```
// Commitment = bewijs van bestaan (in Merkle tree)
commitment = hash(secret_data + randomness)

// Nullifier = verbruiksmarker (in Set)
nullifier = hash(commitment + nullifier_key)

// Proof bewijst:
// 1. commitment zit in Merkle tree
// 2. nullifier is nog niet gebruikt
// 3. nullifier hoort bij dit commitment
// → Niets anders onthuld
```

**Domain separators** verplicht: commitment_hash ≠ nullifier_hash voor identieke data.

## Patroon 4: Selective Disclosure

Bewijs specifieke claims zonder alle data te onthullen.

**IDSee use case:**
```
Private: { fokker_id: "F12345", kvk: "87654321", erkenning: "NVWA-2024" }
Public:  { is_erkend_fokker: true }

// Bewijs: erkenning.status == "actief" && erkenning.geldig_tot > vandaag
// Onthult: alleen true/false
```

## IDSee Circuits

### Circuit 1: ProfessionalCertifiedProof

Bewijst dat een professional (fokker/dierenarts/chipper) gecertificeerd is.

```
Private inputs:
  - professional_id (hash van echte ID)
  - professional_type (fokker | dierenarts | chipper)
  - certification_data (erkenningsnummer, vervaldatum)
  - merkle_path (pad in de registry boom)

Public inputs:
  - registry_merkle_root (huidig)
  - current_timestamp

Output:
  - is_certified: bool
  - certification_type: string (niet de persoon, wel het type)
```

### Circuit 2: AnimalOriginProof

Bewijst dat een dier van een erkende fokker komt.

```
Private inputs:
  - chip_id (hash)
  - breeder_commitment
  - registration_merkle_path

Public inputs:
  - animal_registry_root
  - breeder_registry_root

Output:
  - has_certified_origin: bool
```

### Circuit 3: HealthRecordProof

Bewijst aanwezigheid van gezondheidsrecord type.

```
Private inputs:
  - chip_id (hash)
  - health_records (encrypted)
  - vet_commitment

Public inputs:
  - record_type (bijv. "rabies_vaccine")
  - registry_root
  - current_date

Output:
  - record_exists: bool
  - record_valid: bool (niet verlopen)
```

## Privacy Garanties per Rol

| Gegeven | Zichtbaar voor wie | Beschermd door |
|---------|-------------------|----------------|
| Fokker naam/adres | Niemand (niet eens admin) | ZK commitment |
| KvK/erkenningsnummer | Niemand | ZK commitment |
| BIG-nummer dierenarts | Niemand | ZK commitment |
| Chip ID | Backend (encrypted) | Hash on-chain |
| Vaccinatiedata | Niemand publiek | ZK + encryptie |
| "Is erkend?" resultaat | Iedereen | Publiek (dat is het doel) |
| "Dier ingeënt?" resultaat | Eigenaar + koper | Publiek na query |

## Backend Rol

De gebruiker hoeft nooit zelf ZK-proofs te genereren. De backend:

1. Ontvangt formulierdata van professional
2. Slaat versleuteld op in database
3. Genereert ZK-proof server-side (Midnight.js + proof provider)
4. Stuurt proof naar Midnight blockchain
5. Slaat tx_hash op in database
6. Bevestigt aan gebruiker

Gebruiker ziet: "✓ Registratie opgeslagen" — blockchain/ZK volledig onzichtbaar.
