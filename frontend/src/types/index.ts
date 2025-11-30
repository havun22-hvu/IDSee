// Core types mirroring Aiken contracts

export type ChipId = string;
export type RegistrationId = string;
export type PubKeyHash = string;
export type Timestamp = number;

export type RegistrationStatus = 'Active' | 'Suspended' | 'Revoked';

export type ProfessionalType = 'Veterinarian' | 'Chipper' | 'BreederInspector';

export interface CertifiedProfessional {
  pubkeyHash: PubKeyHash;
  registrationId: RegistrationId;
  professionalType: ProfessionalType;
  status: RegistrationStatus;
  validUntil: Timestamp;
}

export interface Breeder {
  pubkeyHash: PubKeyHash;
  registrationId: RegistrationId;
  kennelName: string;
  status: RegistrationStatus;
  certifiedUntil: Timestamp;
}

export interface Animal {
  chipId: ChipId;
  motherChipId?: ChipId;
  breederHash: PubKeyHash;
  registeredBy: PubKeyHash;
  registrationDate: Timestamp;
  breed: string;
  birthDate: Timestamp;
}

export type HealthRecordType =
  | 'Vaccination'
  | 'HealthCheck'
  | 'GeneticTest'
  | 'Treatment'
  | 'Surgery';

export interface HealthRecord {
  animalChipId: ChipId;
  recordedBy: PubKeyHash;
  recordDate: Timestamp;
  recordType: HealthRecordType;
  recordHash: string;
}

export interface VerificationResult {
  chipId: ChipId;
  found: boolean;
  certifiedOrigin: boolean;
  registeredMother: boolean;
  validProfessional: boolean;
  registrationDate?: Timestamp;
  breed?: string;
}

// Wallet types
export type WalletName = 'nami' | 'eternl' | 'lace' | 'flint';

export interface WalletState {
  connected: boolean;
  address: string | null;
  walletName: WalletName | null;
}
