// Core types for IDSee pet verification system

/// Unique chip identifier (15-digit ISO standard)
pub type ChipId = ByteArray

/// Registration identifier for professionals
pub type RegistrationId = ByteArray

/// Public key hash for on-chain identity
pub type PubKeyHash = ByteArray

/// Timestamp as POSIX time (milliseconds)
pub type Timestamp = Int

/// Status of a registration
pub type RegistrationStatus {
  Active
  Suspended
  Revoked
}

/// Certified professional who can register animals
pub type CertifiedProfessional {
  pubkey_hash: PubKeyHash,
  registration_id: RegistrationId,
  professional_type: ProfessionalType,
  status: RegistrationStatus,
  valid_until: Timestamp,
}

/// Types of certified professionals
pub type ProfessionalType {
  Veterinarian    // Licensed vet (BIG registered)
  Chipper         // Certified chip implanter (NVWA)
  BreederInspector // Kennel club inspector
}

/// Registered breeder
pub type Breeder {
  pubkey_hash: PubKeyHash,
  registration_id: RegistrationId,
  kennel_name: ByteArray,
  status: RegistrationStatus,
  certified_until: Timestamp,
}

/// Registered animal (dog)
pub type Animal {
  chip_id: ChipId,
  mother_chip_id: Option<ChipId>,
  breeder_hash: PubKeyHash,
  registered_by: PubKeyHash,      // Professional who registered
  registration_date: Timestamp,
  breed: ByteArray,
  birth_date: Timestamp,
}

/// Health record entry
pub type HealthRecord {
  animal_chip_id: ChipId,
  recorded_by: PubKeyHash,        // Veterinarian
  record_date: Timestamp,
  record_type: HealthRecordType,
  record_hash: ByteArray,         // Hash of detailed record (off-chain)
}

/// Types of health records
pub type HealthRecordType {
  Vaccination
  HealthCheck
  GeneticTest
  Treatment
  Surgery
}

/// Verification request - what can be proven without revealing details
pub type VerificationClaim {
  // Prove animal is from certified breeder
  CertifiedOrigin { animal_chip_id: ChipId }
  // Prove mother is registered
  RegisteredMother { animal_chip_id: ChipId }
  // Prove has specific health record type
  HasHealthRecord { animal_chip_id: ChipId, record_type: HealthRecordType }
  // Prove professional is certified
  CertifiedProfessional { registration_id: RegistrationId }
}
