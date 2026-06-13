export type UserRole = 'BUYER' | 'BREEDER' | 'VET' | 'CHIPPER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  credits: number;
  verificationStatus: VerificationStatus;
  professionalId?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface VerifyResult {
  found: boolean;
  certified: boolean;
  breederVerified: boolean;
  motherKnown: boolean;
  registrationDate?: string;
}

export interface Animal {
  id: string;
  species: string;
  breed?: string;
  birthDate?: string;
  motherKnown?: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  registeredAt: string;
  confirmedAt?: string;
  txHash?: string;
}

export interface CreditBundle {
  id: string;
  credits: number;
  price: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'REFUND';
  description?: string;
  createdAt: string;
}

export interface AnimalDetail extends Animal {
  motherKnown?: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  professionalId: string;
  professionalType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PeerVerification {
  id: string;
  verifierId: string;
  verifiedId: string;
  bondAmount: number;
  bondStatus: 'LOCKED' | 'RELEASED' | 'FORFEITED';
  bondLockedUntil: string;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  releasedAt?: string;
}

export interface PendingConfirmation {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'FAILED';
  breederConfirmed: boolean;
  breederRejectedReason?: string;
  createdAt: string;
  txHash?: string;
  animal: {
    id: string;
    species: string;
    breed?: string;
    birthDate?: string;
  };
  user?: {
    email: string;
    role: string;
    professionalId?: string;
  };
}

export interface ApiError {
  error: string;
  required?: number;
  current?: number;
}
