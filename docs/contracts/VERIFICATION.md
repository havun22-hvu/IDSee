# Verificatie & Privacy (Midnight)

## Huidige Status

**Let op:** Zero-Knowledge verificatie via Midnight is nog in ontwikkeling. Dit document beschrijft de geplande implementatie.

---

## Probleem

Huidige verificatie onthult te veel informatie:
- Fokker identiteit wordt zichtbaar
- Chip ID is traceerbaar
- Gezondheidsdata is publiek

## Oplossing: Zero-Knowledge Proofs

Met Midnight kunnen we **bewijzen** zonder te **onthullen**:

```
Vraag: "Is deze pup van een erkende fokker?"

Zonder ZK:
  → Response: "Ja, fokker Jan de Vries, KvK 12345678"
  → Privacy geschonden!

Met ZK:
  → Response: "Ja" (cryptografisch bewijs)
  → Geen andere informatie gelekt
```

---

## Geplande ZK Circuits

### 1. CertifiedOriginProof

Bewijst dat een dier afkomstig is van erkende fokker.

**Private inputs:**
- `animal_chip_id`
- `breeder_registration_id`
- `professional_registration_id`

**Public inputs:**
- `registry_merkle_root`

**Output:**
- `is_valid: bool`

### 2. HealthRecordExistsProof

Bewijst dat een dier een bepaald type gezondheidsrecord heeft.

**Private inputs:**
- `animal_chip_id`
- `health_records`

**Public inputs:**
- `record_type`
- `registry_merkle_root`

**Output:**
- `exists: bool`
- `record_date: Timestamp` (optioneel)

### 3. ProfessionalValidProof

Bewijst dat een professional gecertificeerd is.

**Private inputs:**
- `professional_registration_id`
- `professional_type`

**Public inputs:**
- `registry_merkle_root`
- `current_time`

**Output:**
- `is_valid: bool`

---

## Midnight Integratie Roadmap

### Fase 1: Data Voorbereiding
- [ ] Merkle tree implementatie voor registries
- [ ] Hash functies compatible met ZK circuits
- [ ] Off-chain data opslag (encrypted IPFS)

### Fase 2: Circuit Ontwikkeling
- [ ] CertifiedOriginProof circuit in Rust
- [ ] Testen met Midnight testnet
- [ ] Gas/resource optimalisatie

### Fase 3: Integratie
- [ ] Frontend verificatie flow
- [ ] Proof generatie in browser (WebAssembly)
- [ ] Cardano <-> Midnight bridge

---

## Technische Details

### Merkle Tree Structuur

```
                    Root
                   /    \
              Hash_AB    Hash_CD
              /    \      /    \
          Hash_A  Hash_B  Hash_C  Hash_D
            |       |       |       |
         Animal1 Animal2 Animal3 Animal4
```

Voordeel: Bewijs dat een dier in registry staat zonder alle dieren te onthullen.

### Data Hashing

```rust
// Midnight circuit (Rust pseudo-code)
fn hash_animal(animal: Animal) -> Hash {
    poseidon_hash([
        animal.chip_id,
        animal.breeder_hash,
        animal.registration_date,
    ])
}
```

---

## Privacy Garanties

| Gegeven | Zichtbaar voor | Beschermd door |
|---------|---------------|----------------|
| Chip ID | Eigenaar, Dierenarts | ZK proof |
| Fokker identiteit | Fokker zelf | ZK proof |
| Gezondheidsdata | Eigenaar, Dierenarts | Encryptie + ZK |
| Verificatie resultaat | Iedereen | N.v.t. (publiek) |

---

## Referenties

- [Midnight Documentation](https://midnight.network/docs)
- [Zero-Knowledge Proofs Explained](https://zkproof.org/)
- [Cardano Sidechains](https://docs.cardano.org/sidechains/)
