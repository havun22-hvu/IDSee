export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface VerifyResult {
  found: boolean;
  certified: boolean;
  breederVerified: boolean;
  motherKnown: boolean;
  registrationDate?: Date;
}

export interface CreditBundle {
  id: string;
  credits: number;
  price: number;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
  { id: 'starter', credits: 10, price: 9 },
  { id: 'professional', credits: 50, price: 40 },
  { id: 'enterprise', credits: 200, price: 140 },
];

export const CREDIT_COSTS = {
  REGISTER_ANIMAL: 1,
  REGISTER_NEST: 3,
  HEALTH_RECORD: 1,
  CHIP_LINK: 1,
} as const;
