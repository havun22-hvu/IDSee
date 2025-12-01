# Governance - Democratisch Ziektebeheer

## Concept: Zelfregulerend Endorsement Systeem

Volledig decentraal, geen admin of aansturing van bovenaf. Dierenartsen bepalen zelf welke erfelijke ziektes relevant zijn door te **endorsen** (aanvinken) of **uitvinken**.

---

## Hoe werkt het?

### Ziekte Aankaarten
```
1. Dierenarts wil ziekte toevoegen
2. Systeem checkt: bestaat deze al? (naam + diersoort)
   → Ja: toon bestaande, bied optie om te endorsen
   → Nee: maak nieuwe aan
3. Maker wordt automatisch eerste endorser
4. Andere dierenartsen kunnen endorsen/uitvinken
```

### Drempel voor Activatie
```
Actief wanneer:
  endorsements >= 20% van actieve dierenartsen

Inactief wanneer:
  endorsements < 20%
```

Het systeem schaalt automatisch mee met het aantal deelnemers.

---

## Data Structuren

### HereditaryDisease

```aiken
pub type HereditaryDisease {
  disease_id: ByteArray,
  name: ByteArray,                    // e.g. "Hip Dysplasia"
  description_hash: ByteArray,        // IPFS hash details
  applicable_species: List<ByteArray>,// e.g. ["dog", "cat"]
  applicable_breeds: List<ByteArray>, // e.g. ["labrador", "german_shepherd"] or ["all"]
  created_by: PubKeyHash,
  created_at: Timestamp,
  endorsements: List<PubKeyHash>,     // Who endorsed this
}
```

### Rasgebonden aandoeningen

```
Voorbeeld 1: Heupdysplasie
  species: ["dog"]
  breeds: ["all"]  // Alle hondenrassen

Voorbeeld 2: Brachycefaal Syndroom
  species: ["dog"]
  breeds: ["french_bulldog", "pug", "bulldog", "boston_terrier"]

Voorbeeld 3: HCM (hartziekte)
  species: ["cat"]
  breeds: ["maine_coon", "ragdoll", "british_shorthair"]
```

### Matching bij kruisingen

Bij kruisingen worden BEIDE ouderrassen gecheckt:

```aiken
fn get_applicable_diseases(animal: Animal, diseases: List<HereditaryDisease>) -> List<HereditaryDisease> {
  let animal_breeds = get_breeds_from_animal(animal)

  list.filter(diseases, fn(d) {
    list.has(d.applicable_breeds, "all") ||
    list.any(animal_breeds, fn(b) { list.has(d.applicable_breeds, b) })
  })
}

fn get_breeds_from_animal(animal: Animal) -> List<ByteArray> {
  when animal.breed_info is {
    SingleBreed { breed } -> [breed]
    CrossBreed { breed_a, breed_b } -> [breed_a, breed_b]  // Beide rassen!
  }
}
```

**Voorbeeld:**
```
Labradoodle = Crossbreed { breed_a: "Labrador", breed_b: "Poodle" }

Relevante tests:
- Heupdysplasie (Labrador risico)
- PRA oogziekte (beide rassen risico)
- Patella luxatie (Poodle risico)
```

### DiseaseTestResult

```aiken
pub type DiseaseTestResult {
  animal_chip_id: ChipId,
  disease_id: ByteArray,
  result: TestResult,
  tested_by: PubKeyHash,
  test_date: Timestamp,
  lab_reference: Option<ByteArray>,
  certificate_hash: ByteArray,
}

pub type TestResult {
  Clear         // Vrij van ziekte
  Carrier       // Drager, niet aangedaan
  Affected      // Heeft de ziekte
  Unknown       // Onduidelijk
}
```

---

## Acties

### Ziekte Toevoegen

```aiken
AddDisease {
  name: ByteArray,
  description_hash: ByteArray,
  applicable_species: List<ByteArray>,
  applicable_breeds: List<ByteArray>    // ["all"] of specifieke rassen
}
```

Validatie:
- Moet actieve dierenarts zijn
- Combinatie naam + diersoort + ras moet uniek zijn
- Maker wordt automatisch eerste endorser

```aiken
fn validate_add_disease(disease, existing_diseases, professionals, tx) -> Bool {
  let creator = get_signer(tx)

  // Must be active veterinarian
  expect is_active_veterinarian(creator, professionals)

  // Check if disease already exists (name + species + breeds overlap)
  let already_exists = list.any(
    existing_diseases,
    fn(d) {
      d.name == disease.name &&
      has_overlapping_species(d.applicable_species, disease.applicable_species) &&
      has_overlapping_breeds(d.applicable_breeds, disease.applicable_breeds)
    }
  )
  expect !already_exists

  True
}

fn has_overlapping_breeds(a: List<ByteArray>, b: List<ByteArray>) -> Bool {
  // "all" overlaps with everything
  list.has(a, "all") || list.has(b, "all") ||
  list.any(a, fn(breed) { list.has(b, breed) })
}
```

### Endorsen (Aanvinken)

```aiken
EndorseDisease {
  disease_id: ByteArray
}
```

Validatie:
- Moet actieve dierenarts zijn
- Mag niet al geëndorsed hebben

### Endorsement Intrekken (Uitvinken)

```aiken
WithdrawEndorsement {
  disease_id: ByteArray
}
```

Validatie:
- Moet eerder geëndorsed hebben
- Altijd toegestaan

### Test Registreren

```aiken
RegisterTestResult {
  result: DiseaseTestResult
}
```

Validatie:
- Moet actieve dierenarts zijn
- Ziekte moet actief zijn (genoeg endorsements)

---

## Status Berekening

```aiken
fn is_disease_active(disease: HereditaryDisease, total_vets: Int) -> Bool {
  let endorsement_count = list.length(disease.endorsements)
  let threshold = total_vets * 20 / 100  // 20%

  endorsement_count >= threshold
}
```

| Actieve dierenartsen | Minimum endorsements (20%) |
|---------------------|---------------------------|
| 10 | 2 |
| 25 | 5 |
| 50 | 10 |
| 100 | 20 |
| 500 | 100 |
| 1000 | 200 |

Volledig dynamisch: groeit en krimpt met de community.

---

## Voorbeeld Flow

```
Situatie: 50 actieve dierenartsen → drempel = 10 (20%)

Dag 1:
  Dr. Jansen wil "Heupdysplasie (HD)" toevoegen voor honden
  → Systeem checkt: bestaat niet
  → Aangemaakt, Jansen = eerste endorser
  → Endorsements: 1/10 = Inactief

Week 1-2:
  9 andere dierenartsen endorsen HD
  → Endorsements: 10/10 = 20%
  → Status: ACTIEF ✓
  → HD-testen kunnen nu geregistreerd worden

Week 3:
  Dr. Peters wil ook "Heupdysplasie" toevoegen
  → Systeem: "Deze bestaat al voor honden"
  → Toont bestaande entry, optie om te endorsen

Jaar 2:
  Community groeit naar 100 dierenartsen
  → Nieuwe drempel: 20 (20%)
  → HD heeft nog steeds 10 endorsements
  → Status: INACTIEF (10 < 20)
  → Bestaande testresultaten blijven bewaard
  → Meer dierenartsen moeten endorsen om te reactiveren

Jaar 3:
  25 dierenartsen endorsen HD
  → Status: ACTIEF ✓ (25 >= 20)
```

---

## Voordelen van dit Systeem

| Aspect | Voordeel |
|--------|----------|
| Geen admin | Volledig zelfregulerend, geen aansturing van bovenaf |
| Dynamisch | Schaalt automatisch mee met community grootte |
| Democratisch | 20% consensus nodig, voorkomt willekeur |
| Duplicaat-check | Voorkomt dubbele entries |
| Reversibel | Ziektes kunnen komen én gaan op basis van relevantie |
| Transparant | Iedereen ziet endorsements |
| Data behoud | Testresultaten blijven altijd bewaard |

---

## UI Concept

```
┌──────────────────────────────────────────────────────────┐
│  Erfelijke Ziektes                             [+ Nieuw] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Heupdysplasie (HD)                    47 👍  [Actief]│
│     🐕 Honden · Alle rassen                              │
│     [Endorsed ✓] [Bekijk details]                        │
│                                                          │
│  ✅ Brachycefaal Syndroom                 52 👍  [Actief]│
│     🐕 Honden · Franse Bulldog, Mops, Bulldog, Boston    │
│     [Endorse] [Bekijk details]                           │
│                                                          │
│  ✅ HCM (Hypertrofe Cardiomyopathie)      31 👍  [Actief]│
│     🐈 Katten · Maine Coon, Ragdoll, Brits Korthaar      │
│     [Endorsed ✓] [Bekijk details]                        │
│                                                          │
│  ✅ Patella Luxatie                       23 👍  [Actief]│
│     🐕 Honden · Chihuahua, Yorkshire, Pomeranian         │
│     🐈 Katten · Alle rassen                              │
│     [Endorse] [Bekijk details]                           │
│                                                          │
│  ⚪ Degeneratieve Myelopathie              3 👍 [Inactief]│
│     🐕 Honden · Duitse Herder, Boxer, Pembroke Corgi     │
│     [Endorse] [Bekijk details]                           │
│                                                          │
└──────────────────────────────────────────────────────────┘

Filter: [Alle diersoorten ▼] [Alle rassen ▼] [Actief/Inactief ▼]
```

---

## Privacy

| Gegeven | Zichtbaar | Reden |
|---------|-----------|-------|
| Wie endorst | Publiek | Transparantie |
| Testresultaten | Privé (ZK) | Medische privacy |
| Lab certificaten | Eigenaar + vet | Vertrouwelijk |

---

## Stakeholders

IDSee is een hulpmiddel voor verschillende partijen:

| Stakeholder | Rol | Belang |
|-------------|-----|--------|
| **Kopers** | Verificatie | Zekerheid over gezonde afkomst |
| **Fokverenigingen** | Kwaliteitsbewaking | Rasstandaard, fokbeleid |
| **Verzekeraars** | Risicobeoordeling | Premieberekening, claims |
| **Dierenartsen** | Registratie & governance | Medische expertise |

### Nog uit te werken

- [ ] Rol van fokverenigingen in governance (meestemmen?)
- [ ] Toegang voor verzekeraars (alleen lezen? betaald?)
- [ ] Koper-interface (wat zien zij precies?)
- [ ] Integratie met bestaande stamboeken (Raad van Beheer etc.)

---

## Parameters - Ook Democratisch

Zelfs de drempel kan democratisch aangepast worden via hetzelfde endorsement principe:

```aiken
pub type GovernanceParameter {
  param_id: ByteArray,
  name: ByteArray,              // e.g. "endorsement_threshold"
  current_value: Int,           // e.g. 20
  proposed_value: Option<Int>,  // e.g. Some(25)
  endorsements_for_change: List<PubKeyHash>,
}
```

### Hoe werkt het?

```
1. Dierenarts stelt nieuwe waarde voor (bijv. 25% ipv 20%)
2. Andere dierenartsen kunnen dit endorsen
3. Bij 50% endorsement → waarde wordt aangepast
4. Hogere drempel (50%) voor systeemwijzigingen dan voor ziektes (20%)
```

### Initiële waarden (bij launch)

| Parameter | Startwaarde | Aanpasbaar door |
|-----------|-------------|-----------------|
| `endorsement_threshold` | 20% | 50% van dierenartsen |
| `parameter_change_threshold` | 50% | 66% van dierenartsen |

Zo is het hele systeem zelfregulerend, inclusief de regels zelf.
