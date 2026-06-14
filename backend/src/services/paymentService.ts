import crypto from 'crypto';

/**
 * Payment provider abstraction. Mirrors the blockchain demo-mode pattern: a
 * DemoProvider runs without any credentials so the full €2 flow works locally,
 * and a real Mollie provider can be activated later behind env flags
 * (PAYMENT_PROVIDER=mollie + MOLLIE_API_KEY) — that step needs a dependency and
 * a key, so it is intentionally not wired here.
 */

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface CreatedPayment {
  providerPaymentId: string;
  checkoutUrl: string | null; // null = no redirect needed (demo)
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(amountCents: number, description: string, redirectUrl: string): Promise<CreatedPayment>;
  getStatus(providerPaymentId: string): Promise<PaymentStatus>;
}

// Demo: no real payment. The "payment" is considered settled immediately, just
// like blockchain demo mode returns a fake tx.
class DemoProvider implements PaymentProvider {
  readonly name = 'demo';

  async createPayment(): Promise<CreatedPayment> {
    return {
      providerPaymentId: `demo_pay_${crypto.randomBytes(8).toString('hex')}`,
      checkoutUrl: null,
    };
  }

  async getStatus(): Promise<PaymentStatus> {
    return 'PAID';
  }
}

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;

  if (process.env.PAYMENT_PROVIDER === 'mollie') {
    // Real Mollie needs @mollie/api-client + MOLLIE_API_KEY. Fail loudly until wired.
    throw new Error(
      'Mollie provider niet geactiveerd: installeer @mollie/api-client en zet MOLLIE_API_KEY'
    );
  }

  provider = new DemoProvider();
  return provider;
}

export const CHECK_PRICE_CENTS = 200; // €2
