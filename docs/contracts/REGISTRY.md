# Registry Validator

## Doel

De Registry validator beheert alle registraties in IDSee:
- Professionals (dierenartsen, chippers)
- Fokkers
- Dieren

## Datum Types

### ProfessionalRegistry
```aiken
ProfessionalRegistry { professionals: List<CertifiedProfessional> }
```
Lijst van alle geregistreerde professionals.

### BreederRegistry
```aiken
BreederRegistry { breeders: List<Breeder> }
```
Lijst van alle erkende fokkers.

### AnimalRegistry
```aiken
AnimalRegistry { animals: List<Animal> }
```
Lijst van alle geregistreerde dieren.

---

## Acties (Redeemers)

### Professional Management (alleen admin)

```aiken
RegisterProfessional { professional: CertifiedProfessional }
SuspendProfessional { pubkey_hash: PubKeyHash }
```

**Validatie:**
- Alleen admin wallet mag uitvoeren
- Professional moet uniek zijn
- Credentials moeten geldig zijn

### Breeder Management (door inspector)

```aiken
RegisterBreeder { breeder: Breeder }
SuspendBreeder { pubkey_hash: PubKeyHash }
```

**Validatie:**
- Uitvoerder moet `BreederInspector` zijn
- Inspector moet `Active` status hebben
- Fokker moet uniek zijn

### Animal Registration (door vet/chipper)

```aiken
RegisterAnimal { animal: Animal }
```

**Validatie:**
- Uitvoerder moet `Veterinarian` of `Chipper` zijn
- Professional moet `Active` status hebben
- Chip ID moet uniek zijn
- Fokker moet bestaan en `Active` zijn
- Moeder (indien opgegeven) moet geregistreerd zijn

---

## Helper Functies

### is_professional_valid
```aiken
pub fn is_professional_valid(
  professional: CertifiedProfessional,
  current_time: Timestamp,
) -> Bool
```
Controleert of professional actief en niet verlopen is.

### is_breeder_valid
```aiken
pub fn is_breeder_valid(
  breeder: Breeder,
  current_time: Timestamp,
) -> Bool
```
Controleert of fokker gecertificeerd en actief is.

### verify_certified_origin
```aiken
pub fn verify_certified_origin(
  animal: Animal,
  breeders: List<Breeder>,
  professionals: List<CertifiedProfessional>,
  current_time: Timestamp,
) -> Bool
```
Verifieert volledige afkomst:
1. Dier is geregistreerd
2. Fokker is erkend
3. Registratie door geldige professional

---

## Transactie Voorbeelden

### Nieuwe Fokker Registreren

```
Input:
  - BreederRegistry UTxO
  - Inspector signature

Redeemer:
  RegisterBreeder {
    breeder: {
      pubkey_hash: "abc123...",
      registration_id: "NL-FOK-12345",
      kennel_name: "Happy Paws",
      status: Active,
      certified_until: 1735689600000
    }
  }

Output:
  - Updated BreederRegistry met nieuwe fokker
```

### Pup Registreren

```
Input:
  - AnimalRegistry UTxO
  - BreederRegistry UTxO (reference)
  - ProfessionalRegistry UTxO (reference)
  - Veterinarian signature

Redeemer:
  RegisterAnimal {
    animal: {
      chip_id: "528140000123456",
      mother_chip_id: Some("528140000111111"),
      breeder_hash: "abc123...",
      registered_by: "vet456...",
      registration_date: 1701360000000,
      breed: "Labrador Retriever",
      birth_date: 1698768000000
    }
  }

Output:
  - Updated AnimalRegistry met nieuwe pup
```
