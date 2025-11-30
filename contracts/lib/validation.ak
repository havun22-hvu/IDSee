// Validation helpers for IDSee

use aiken/collection/list
use idsee/contracts/types.{
  Animal,
  Breeder,
  CertifiedProfessional,
  ChipId,
  HealthRecord,
  PubKeyHash,
  RegistrationStatus,
  Timestamp,
  Active,
  ProfessionalType,
  Veterinarian,
  Chipper,
  BreederInspector,
}

/// Validate chip ID format (should be 15 bytes for ISO standard)
pub fn is_valid_chip_id(chip_id: ChipId) -> Bool {
  builtin.length_of_bytearray(chip_id) == 15
}

/// Check if timestamp is in the past (valid registration date)
pub fn is_past_timestamp(timestamp: Timestamp, current_time: Timestamp) -> Bool {
  timestamp <= current_time
}

/// Check if timestamp is in the future (valid expiration)
pub fn is_future_timestamp(timestamp: Timestamp, current_time: Timestamp) -> Bool {
  timestamp > current_time
}

/// Validate professional can register animals
pub fn can_register_animals(professional: CertifiedProfessional) -> Bool {
  when professional.professional_type is {
    Veterinarian -> True
    Chipper -> True
    BreederInspector -> False
  }
}

/// Validate professional can register breeders
pub fn can_register_breeders(professional: CertifiedProfessional) -> Bool {
  when professional.professional_type is {
    BreederInspector -> True
    _ -> False
  }
}

/// Check if animal registration is valid
pub fn validate_animal_registration(
  animal: Animal,
  breeder: Breeder,
  professional: CertifiedProfessional,
  current_time: Timestamp,
) -> Bool {
  and {
    // Chip ID must be valid format
    is_valid_chip_id(animal.chip_id),
    // Registration date must be in the past
    is_past_timestamp(animal.registration_date, current_time),
    // Birth date must be before registration
    animal.birth_date < animal.registration_date,
    // Breeder must be active
    breeder.status == Active,
    breeder.certified_until > current_time,
    // Professional must be active and authorized
    professional.status == Active,
    professional.valid_until > current_time,
    can_register_animals(professional),
    // Breeder hash must match
    animal.breeder_hash == breeder.pubkey_hash,
    // Registered by must match professional
    animal.registered_by == professional.pubkey_hash,
  }
}

/// Check if mother is properly linked
pub fn validate_mother_link(
  animal: Animal,
  animals: List<Animal>,
  current_time: Timestamp,
) -> Bool {
  when animal.mother_chip_id is {
    None -> True  // No mother link is valid (imported animals)
    Some(mother_id) -> {
      // Mother must exist in registry
      when list.find(animals, fn(a) { a.chip_id == mother_id }) is {
        None -> False
        Some(mother) -> {
          and {
            // Mother must be older than puppy
            mother.registration_date < animal.registration_date,
            // Mother birth date must be reasonable (at least 1 year before puppy)
            // 31536000000 ms = 1 year
            mother.birth_date + 31536000000 < animal.birth_date,
          }
        }
      }
    }
  }
}

/// Validate health record
pub fn validate_health_record(
  record: HealthRecord,
  animal: Animal,
  professional: CertifiedProfessional,
  current_time: Timestamp,
) -> Bool {
  and {
    // Record must be for existing animal
    record.animal_chip_id == animal.chip_id,
    // Professional must be a veterinarian
    professional.professional_type == Veterinarian,
    // Professional must be active
    professional.status == Active,
    professional.valid_until > current_time,
    // Record date must be valid
    is_past_timestamp(record.record_date, current_time),
    // Record must be after animal registration
    record.record_date >= animal.registration_date,
    // Recorded by must match professional
    record.recorded_by == professional.pubkey_hash,
  }
}

/// Count animals by breeder
pub fn count_animals_by_breeder(
  animals: List<Animal>,
  breeder_hash: PubKeyHash,
) -> Int {
  list.foldr(
    animals,
    0,
    fn(animal, count) {
      if animal.breeder_hash == breeder_hash {
        count + 1
      } else {
        count
      }
    },
  )
}

/// Get all animals by breeder
pub fn get_animals_by_breeder(
  animals: List<Animal>,
  breeder_hash: PubKeyHash,
) -> List<Animal> {
  list.filter(animals, fn(a) { a.breeder_hash == breeder_hash })
}
