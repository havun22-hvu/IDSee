// Registry validator for IDSee
// Manages registration of professionals, breeders, and animals

use aiken/collection/list
use idsee/contracts/types.{
  Animal,
  Breeder,
  CertifiedProfessional,
  ChipId,
  PubKeyHash,
  RegistrationStatus,
  Timestamp,
  Active,
}

/// Registry datum - stored on-chain
pub type RegistryDatum {
  // Registry for professionals
  ProfessionalRegistry { professionals: List<CertifiedProfessional> }
  // Registry for breeders
  BreederRegistry { breeders: List<Breeder> }
  // Registry for animals
  AnimalRegistry { animals: List<Animal> }
}

/// Actions that can be performed on the registry
pub type RegistryAction {
  // Professional management (by admin)
  RegisterProfessional { professional: CertifiedProfessional }
  SuspendProfessional { pubkey_hash: PubKeyHash }

  // Breeder management (by inspector)
  RegisterBreeder { breeder: Breeder }
  SuspendBreeder { pubkey_hash: PubKeyHash }

  // Animal registration (by vet/chipper)
  RegisterAnimal { animal: Animal }

  // Verification (read-only, no state change)
  VerifyOrigin { chip_id: ChipId }
}

/// Check if a professional is active and valid
pub fn is_professional_valid(
  professional: CertifiedProfessional,
  current_time: Timestamp,
) -> Bool {
  and {
    professional.status == Active,
    professional.valid_until > current_time,
  }
}

/// Check if a breeder is active and certified
pub fn is_breeder_valid(breeder: Breeder, current_time: Timestamp) -> Bool {
  and {
    breeder.status == Active,
    breeder.certified_until > current_time,
  }
}

/// Find professional by pubkey hash
pub fn find_professional(
  professionals: List<CertifiedProfessional>,
  pubkey_hash: PubKeyHash,
) -> Option<CertifiedProfessional> {
  list.find(professionals, fn(p) { p.pubkey_hash == pubkey_hash })
}

/// Find breeder by pubkey hash
pub fn find_breeder(
  breeders: List<Breeder>,
  pubkey_hash: PubKeyHash,
) -> Option<Breeder> {
  list.find(breeders, fn(b) { b.pubkey_hash == pubkey_hash })
}

/// Find animal by chip ID
pub fn find_animal(animals: List<Animal>, chip_id: ChipId) -> Option<Animal> {
  list.find(animals, fn(a) { a.chip_id == chip_id })
}

/// Verify animal has certified origin
/// Returns True if:
/// 1. Animal is registered
/// 2. Breeder is certified
/// 3. Registered by valid professional
pub fn verify_certified_origin(
  animal: Animal,
  breeders: List<Breeder>,
  professionals: List<CertifiedProfessional>,
  current_time: Timestamp,
) -> Bool {
  // Find the breeder
  when find_breeder(breeders, animal.breeder_hash) is {
    None -> False
    Some(breeder) ->
      // Find the registering professional
      when find_professional(professionals, animal.registered_by) is {
        None -> False
        Some(professional) ->
          and {
            is_breeder_valid(breeder, current_time),
            is_professional_valid(professional, current_time),
          }
      }
  }
}

// Main validator - to be expanded with full transaction validation
validator registry {
  spend(
    datum: Option<RegistryDatum>,
    _redeemer: RegistryAction,
    _own_ref: Data,
    _tx: Data,
  ) {
    // Basic validation - datum must exist
    when datum is {
      None -> False
      Some(_d) -> {
        // TODO: Implement full validation logic
        // - Check signatures
        // - Validate state transitions
        // - Verify professional credentials
        True
      }
    }
  }

  else(_) {
    fail
  }
}
