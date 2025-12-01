# IDSee Types - Datastructuren

## Overzicht

Dit document beschrijft alle datastructuren die gebruikt worden in de IDSee smart contracts.

## Basis Types

### ChipId
```aiken
pub type ChipId = ByteArray
```
15-cijferig ISO chipnummer voor dieridentificatie.

### RegistrationId
```aiken
pub type RegistrationId = ByteArray
```
Uniek registratienummer voor professionals (BIG-nummer, NVWA certificaat).

### PubKeyHash
```aiken
pub type PubKeyHash = ByteArray
```
Cardano publieke sleutel hash voor on-chain identiteit.

---

## Entiteiten

### CertifiedProfessional (Gecertificeerde Professional)

Dierenartsen en chippers die dieren mogen registreren.

```aiken
pub type CertifiedProfessional {
  pubkey_hash: PubKeyHash,        // Cardano wallet
  registration_id: RegistrationId, // BIG/NVWA nummer
  professional_type: ProfessionalType,
  status: RegistrationStatus,
  valid_until: Timestamp,
}
```

**Types professionals:**
- `Veterinarian` - BIG-geregistreerde dierenarts
- `Chipper` - NVWA-gecertificeerde chipper
- `BreederInspector` - Stamboek inspecteur

---

### Breeder (Fokker)

Erkende hondenfokkers.

```aiken
pub type Breeder {
  pubkey_hash: PubKeyHash,
  registration_id: RegistrationId,
  kennel_name: ByteArray,
  status: RegistrationStatus,
  certified_until: Timestamp,
}
```

**Registratie vereisten:**
- Ingeschreven bij erkend stamboek (Raad van Beheer)
- Of: KvK-registratie als fokker
- Gekeurd door `BreederInspector`

---

### Animal (Dier)

Geregistreerd dier met afkomstgegevens.

```aiken
pub type Animal {
  chip_id: ChipId,
  mother_chip_id: Option<ChipId>,
  breeder_hash: PubKeyHash,
  registered_by: PubKeyHash,
  registration_date: Timestamp,
  breed_info: BreedInfo,
  birth_date: Timestamp,
  birth_place: ByteArray,    // City/town of birth
  birth_country: ByteArray,  // ISO 3166-1 alpha-2 country code (e.g. "NL")
}

pub type BreedInfo {
  SingleBreed { breed: ByteArray }              // Eén ras
  CrossBreed { breed_a: ByteArray, breed_b: ByteArray }  // Kruising
}
```

**Voorbeelden:**
```
Eén ras:   SingleBreed { breed: "Labrador" }
Kruising:  CrossBreed { breed_a: "Labrador", breed_b: "Poodle" }
```

Of het dier stamboom heeft is niet relevant - de testuitslagen bepalen de gezondheid.

**Registratie flow:**
1. Pup wordt geboren bij erkende fokker
2. Dierenarts/chipper plaatst chip
3. Chip wordt gekoppeld aan moeder
4. Registratie on-chain met fokker-link

---

### HealthRecord (Gezondheidsgegevens)

Medische gegevens vastgelegd door dierenarts.

```aiken
pub type HealthRecord {
  animal_chip_id: ChipId,
  recorded_by: PubKeyHash,
  record_date: Timestamp,
  record_type: HealthRecordType,
  record_hash: ByteArray,  // IPFS hash van details
}
```

**Record types:**
- `Vaccination` - Vaccinaties
- `HealthCheck` - Algemene controle
- `GeneticTest` - DNA/genetische test
- `Treatment` - Behandeling
- `Surgery` - Operatie

---

## Status Types

### RegistrationStatus
```aiken
pub type RegistrationStatus {
  Active     // Actief en geldig
  Suspended  // Tijdelijk geschorst
  Revoked    // Definitief ingetrokken
}
```

---

## Verificatie

### VerificationClaim

Wat kan bewezen worden zonder details te onthullen:

```aiken
pub type VerificationClaim {
  CertifiedOrigin { animal_chip_id: ChipId }
  RegisteredMother { animal_chip_id: ChipId }
  HasHealthRecord { animal_chip_id: ChipId, record_type: HealthRecordType }
  CertifiedProfessional { registration_id: RegistrationId }
}
```

**Voorbeeld gebruik:**
- Koper vraagt: "Is deze pup van erkende fokker?"
- Systeem bewijst: JA/NEE (geen andere data)
