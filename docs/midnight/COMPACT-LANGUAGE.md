---
title: Compact Taal — Referentie voor IDSee
type: reference
scope: idsee
last_check: 2026-05-30
source: https://docs.midnight.network/compact
---

# Compact Taal

## Wat is Compact?

Compact is Midnight's eigen programmeertaal voor smart contracts. Het is **TypeScript-achtig** (niet Rust!) en compileert naar ZK-circuits.

```
Compact source (.compact) → Compact compiler → ZK-circuits → Midnight blockchain
```

Geen cryptografie-expertise nodig — de compiler vertaalt de logica naar ZK-constraints.

## Twee Soorten Code in een Contract

```
// 1. CIRCUIT CODE — wordt ZK-circuit (privéberekeningen)
circuit function verify_professional(
  private professional_id: Field,
  private certification: Bytes<32>
): Boolean {
  // Logica hier is privé, alleen het resultaat is publiek
  let commitment = persistentCommit(professional_id, certification);
  return merkle_verify(commitment, ledger.registry_root);
}

// 2. LEDGER CODE — on-chain state (publiek zichtbaar)
ledger {
  registry_root: Field,           // Merkle root van registry
  nullifiers: Set<Field>,         // Gebruikte tokens (privacy-preserving)
  certifications_count: Counter,  // Publieke teller
}
```

## Fundamentele Types

| Type | Omschrijving |
|------|-------------|
| `Field` | Priemveld element (basis van ZK-circuits) |
| `Boolean` | true/false |
| `Bytes<n>` | n bytes |
| `UInt<n>` | Unsigned integer, n bits |
| `MerkleTree<n, T>` | Merkle boom, n leaves, type T |
| `HistoricMerkleTree<n, T>` | Zoals MerkleTree maar met historische roots |
| `Set<T>` | Verzameling voor nullifiers |
| `StateMap<K, V>` | Key-value state opslag |

## Privacy Keywords

```compact
// private = nooit on-chain, alleen in ZK-circuit
circuit function example(private secret: Field): Boolean { ... }

// ledger = publiek on-chain
ledger {
  public_root: Field,
}

// witness = data die de prover aanlevert (privé)
witness {
  my_credential: Bytes<64>,
}
```

## Ingebouwde Cryptografische Functies

```compact
// Hash functies (Poseidon — ZK-vriendelijk)
persistentHash(data: Bytes<n>): Field
persistentCommit(value: T, randomness: Field): Field

// Merkle operaties
merkle_verify(leaf: Field, root: Field, path: MerklePath): Boolean

// Elliptische curve (voor handtekeningen)
ec_add(p1: CurvePoint, p2: CurvePoint): CurvePoint
ec_mul(scalar: Field, point: CurvePoint): CurvePoint
```

## Voorbeeld: ProfessionalCertified Contract

```compact
// IDSee: bewijs dat een professional gecertificeerd is
// (vereenvoudigd voorbeeld)

ledger {
  // Merkle root van alle erkende professionals
  certified_registry_root: Field,
  // Bijgehouden nullifiers (voorkomt dubbel gebruik)
  used_proofs: Set<Field>,
}

// Circuit: privéberekening, resultaat is publiek
circuit function is_certified(
  private professional_id: Field,
  private certification_hash: Bytes<32>,
  private merkle_path: MerklePath,
  private nullifier_key: Field
): Boolean {
  // 1. Maak commitment van de professional
  let commitment = persistentCommit(professional_id, certification_hash);
  
  // 2. Bewijs dat commitment in registry staat
  let in_registry = merkle_verify(
    commitment,
    ledger.certified_registry_root,
    merkle_path
  );
  
  // 3. Maak nullifier (domein-separator prefix voorkomt gelijkheid met commitment)
  let nullifier = persistentHash([0x01, nullifier_key, commitment]);
  
  // 4. Bewijs dat nullifier nog niet gebruikt is
  let not_used = !ledger.used_proofs.contains(nullifier);
  
  return in_registry && not_used;
}

// Entry point: wordt aangeroepen via Midnight.js
export transaction prove_certification() {
  // Roept circuit aan, genereert ZK-proof
  assert is_certified(...witness values...);
  // Voeg nullifier toe (voorkomt hergebruik)
  ledger.used_proofs.insert(current_nullifier);
}
```

## Midnight.js Integratie (TypeScript)

```typescript
import { Contract, deployContract, callContract } from '@midnight-ntwrk/midnight-js-contracts';
import { createHttpProofProvider } from '@midnight-ntwrk/midnight-js-proof-provider';

// Contract deployen
const contract = await deployContract(wallet, {
  contractPath: './dist/certified_registry.zkir',
  initialState: {
    certified_registry_root: computeMerkleRoot(certifiedProfessionals),
    used_proofs: new Set(),
  }
});

// Proof genereren en transactie versturen
const result = await callContract(wallet, contract, 'prove_certification', {
  // Private inputs (alleen lokaal, nooit on-chain)
  professional_id: hashProfessionalId(userId),
  certification_hash: hashCertification(certData),
  merkle_path: getMerklePath(userId, certifiedRegistry),
  nullifier_key: generateNullifierKey(),
});

// result.is_certified === true/false (publiek on-chain resultaat)
```

## Development Workflow

```bash
# 1. Compact compiler installeren (via Midnight toolchain)
npm install -g @midnight-ntwrk/compact-compiler

# 2. Contract compileren
compact-compiler ./contracts/certified_registry.compact

# 3. Output: .zkir bestand (ZK intermediate representation)
# → Klaar voor deployment via Midnight.js

# 4. Lokaal testen (Devnet)
midnight-devnet start
# → Draait lokale testomgeving
```

## Belangrijke Beperkingen

- Cross-contract interactie is **nog in ontwikkeling** (mei 2026)
- Compact is TypeScript-achtig maar **niet identiek aan TypeScript**
- ZK-circuits hebben geen toegang tot externe data (alleen witness + ledger)
- Transactie merging: momenteel alleen als minimaal één partij geen contract calls heeft

## Zie Ook

- `ZK-PATTERNS.md` — Privacy patronen voor IDSee use cases
- `INTEGRATION-PLAN.md` — Stap-voor-stap integratie roadmap
- https://docs.midnight.network/compact — Officiële referentie
