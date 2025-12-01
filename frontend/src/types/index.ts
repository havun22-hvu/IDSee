export type UserRole = 'BUYER' | 'BREEDER' | 'VET' | 'CHIPPER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  credits: number;
  verificationStatus: VerificationStatus;
  professionalId?: string;
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

export interface ApiError {
  error: string;
  required?: number;
  current?: number;
}
