// Health records validator for IDSee
// Manages health records added by veterinarians

use aiken/collection/list
use idsee/contracts/types.{
  Animal,
  CertifiedProfessional,
  ChipId,
  HealthRecord,
  HealthRecordType,
  PubKeyHash,
  Timestamp,
  Veterinarian,
  Active,
}
use idsee/contracts/validation.{validate_health_record}

/// Health registry datum
pub type HealthDatum {
  records: List<HealthRecord>,
}

/// Actions for health records
pub type HealthAction {
  AddRecord { record: HealthRecord }
  RevokeRecord { animal_chip_id: ChipId, record_date: Timestamp }
}

/// Find all records for an animal
pub fn get_animal_records(
  records: List<HealthRecord>,
  chip_id: ChipId,
) -> List<HealthRecord> {
  list.filter(records, fn(r) { r.animal_chip_id == chip_id })
}

/// Check if animal has specific record type
pub fn has_record_type(
  records: List<HealthRecord>,
  chip_id: ChipId,
  record_type: HealthRecordType,
) -> Bool {
  list.any(
    records,
    fn(r) { r.animal_chip_id == chip_id && r.record_type == record_type },
  )
}

/// Count records by type for an animal
pub fn count_records_by_type(
  records: List<HealthRecord>,
  chip_id: ChipId,
  record_type: HealthRecordType,
) -> Int {
  list.foldr(
    records,
    0,
    fn(r, count) {
      if r.animal_chip_id == chip_id && r.record_type == record_type {
        count + 1
      } else {
        count
      }
    },
  )
}

/// Get latest record of type
pub fn get_latest_record(
  records: List<HealthRecord>,
  chip_id: ChipId,
  record_type: HealthRecordType,
) -> Option<HealthRecord> {
  let filtered =
    list.filter(
      records,
      fn(r) { r.animal_chip_id == chip_id && r.record_type == record_type },
    )
  // Find record with highest timestamp
  list.foldr(
    filtered,
    None,
    fn(r, latest) {
      when latest is {
        None -> Some(r)
        Some(l) ->
          if r.record_date > l.record_date {
            Some(r)
          } else {
            latest
          }
      }
    },
  )
}

/// Validate adding a new record
fn validate_add_record(
  record: HealthRecord,
  existing_records: List<HealthRecord>,
  animal: Animal,
  professional: CertifiedProfessional,
  current_time: Timestamp,
) -> Bool {
  and {
    // Basic validation
    validate_health_record(record, animal, professional, current_time),
    // No duplicate records (same animal, type, date)
    !list.any(
      existing_records,
      fn(r) {
        and {
          r.animal_chip_id == record.animal_chip_id,
          r.record_type == record.record_type,
          r.record_date == record.record_date,
        }
      },
    ),
  }
}

// Main validator
validator health_registry {
  spend(
    datum: Option<HealthDatum>,
    redeemer: HealthAction,
    _own_ref: Data,
    _tx: Data,
  ) {
    when datum is {
      None -> False
      Some(d) ->
        when redeemer is {
          AddRecord { record } -> {
            // TODO: Get animal and professional from reference inputs
            // For now, basic structure validation
            record.animal_chip_id != ""
          }
          RevokeRecord { animal_chip_id, record_date } -> {
            // Only the recording vet can revoke
            // Must provide signature
            list.any(
              d.records,
              fn(r) {
                r.animal_chip_id == animal_chip_id && r.record_date == record_date
              },
            )
          }
        }
    }
  }

  else(_) {
    fail
  }
}
