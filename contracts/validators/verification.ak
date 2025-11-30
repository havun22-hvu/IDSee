// Verification validator for IDSee
// Read-only verification of animal origins (no state changes)

use aiken/collection/list
use idsee/contracts/types.{
  Animal,
  Breeder,
  CertifiedProfessional,
  ChipId,
  HealthRecord,
  HealthRecordType,
  PubKeyHash,
  Timestamp,
  Active,
  VerificationClaim,
  CertifiedOrigin,
  RegisteredMother,
  HasHealthRecord,
}
use idsee/contracts/validation.{
  is_future_timestamp,
}

/// Verification result
pub type VerificationResult {
  Valid
  Invalid { reason: ByteArray }
  NotFound
}

/// Verify certified origin claim
pub fn verify_certified_origin(
  chip_id: ChipId,
  animals: List<Animal>,
  breeders: List<Breeder>,
  professionals: List<CertifiedProfessional>,
  current_time: Timestamp,
) -> VerificationResult {
  // Find the animal
  when list.find(animals, fn(a) { a.chip_id == chip_id }) is {
    None -> NotFound
    Some(animal) -> {
      // Find the breeder
      when list.find(breeders, fn(b) { b.pubkey_hash == animal.breeder_hash }) is {
        None -> Invalid { reason: "Breeder not found" }
        Some(breeder) -> {
          // Check breeder is valid
          if breeder.status != Active {
            Invalid { reason: "Breeder not active" }
          } else if !is_future_timestamp(breeder.certified_until, current_time) {
            Invalid { reason: "Breeder certification expired" }
          } else {
            // Find the registering professional
            when
              list.find(
                professionals,
                fn(p) { p.pubkey_hash == animal.registered_by },
              )
            is {
              None -> Invalid { reason: "Professional not found" }
              Some(professional) ->
                if professional.status != Active {
                  Invalid { reason: "Professional not active" }
                } else {
                  Valid
                }
            }
          }
        }
      }
    }
  }
}

/// Verify registered mother claim
pub fn verify_registered_mother(
  chip_id: ChipId,
  animals: List<Animal>,
  current_time: Timestamp,
) -> VerificationResult {
  // Find the animal
  when list.find(animals, fn(a) { a.chip_id == chip_id }) is {
    None -> NotFound
    Some(animal) ->
      when animal.mother_chip_id is {
        None -> Invalid { reason: "No mother registered" }
        Some(mother_id) ->
          // Find mother in registry
          when list.find(animals, fn(a) { a.chip_id == mother_id }) is {
            None -> Invalid { reason: "Mother not in registry" }
            Some(_mother) -> Valid
          }
      }
  }
}

/// Verify health record exists
pub fn verify_health_record(
  chip_id: ChipId,
  record_type: HealthRecordType,
  records: List<HealthRecord>,
  professionals: List<CertifiedProfessional>,
  current_time: Timestamp,
) -> VerificationResult {
  // Find matching records
  let matching =
    list.filter(
      records,
      fn(r) { r.animal_chip_id == chip_id && r.record_type == record_type },
    )

  when matching is {
    [] -> NotFound
    [record, ..] -> {
      // Verify the recording professional
      when
        list.find(professionals, fn(p) { p.pubkey_hash == record.recorded_by })
      is {
        None -> Invalid { reason: "Recording professional not found" }
        Some(professional) ->
          if professional.status != Active {
            Invalid { reason: "Recording professional not active" }
          } else {
            Valid
          }
      }
    }
  }
}

/// Process a verification claim
pub fn process_claim(
  claim: VerificationClaim,
  animals: List<Animal>,
  breeders: List<Breeder>,
  professionals: List<CertifiedProfessional>,
  health_records: List<HealthRecord>,
  current_time: Timestamp,
) -> VerificationResult {
  when claim is {
    CertifiedOrigin { animal_chip_id } ->
      verify_certified_origin(
        animal_chip_id,
        animals,
        breeders,
        professionals,
        current_time,
      )
    RegisteredMother { animal_chip_id } ->
      verify_registered_mother(animal_chip_id, animals, current_time)
    HasHealthRecord { animal_chip_id, record_type } ->
      verify_health_record(
        animal_chip_id,
        record_type,
        health_records,
        professionals,
        current_time,
      )
    _ -> Invalid { reason: "Unknown claim type" }
  }
}

// This is a read-only "validator" - used for off-chain verification
// No on-chain spending, just helper functions for the frontend
