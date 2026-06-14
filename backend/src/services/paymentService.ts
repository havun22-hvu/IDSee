import crypto from 'crypto';
import { createMollieClient, MollieClient } from '@mollie/api-client';

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

// Real Mollie payments (iDEAL/creditcard). Activated via env; needs MOLLIE_API_KEY.
class MollieProvider implements PaymentProvider {
  readonly name = 'mollie';
  private client: MollieClient;

  constructor(apiKey: string) {
    this.client = createMollieClient({ apiKey });
  }

  async createPayment(amountCents: number, description: string, redirectUrl: string): Promise<CreatedPayment> {
    const payment = await this.client.payments.create({
      amount: { currency: 'EUR', value: (amountCents / 100).toFixed(2) },
      description,
      redirectUrl,
      ...(process.env.BACKEND_URL && {
        webhookUrl: `${process.env.BACKEND_URL}/payment/webhook`,
      }),
    });
    return {
      providerPaymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl() ?? null,
    };
  }

  async getStatus(providerPaymentId: string): Promise<PaymentStatus> {
    const payment = await this.client.payments.get(providerPaymentId);
    if (payment.status === 'paid') return 'PAID';
    if (['failed', 'canceled', 'expired'].includes(payment.status)) return 'FAILED';
    return 'PENDING';
  }
}

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;

  if (process.env.PAYMENT_PROVIDER === 'mollie') {
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      throw new Error('PAYMENT_PROVIDER=mollie maar MOLLIE_API_KEY ontbreekt');
    }
    provider = new MollieProvider(apiKey);
    return provider;
  }

  provider = new DemoProvider();
  return provider;
}

export const CHECK_PRICE_CENTS = 200; // €2
