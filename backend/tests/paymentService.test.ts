import { getPaymentProvider, CHECK_PRICE_CENTS } from '../src/services/paymentService.js';

describe('paymentService (demo provider)', () => {
  it('charges €2 (200 cents)', () => {
    expect(CHECK_PRICE_CENTS).toBe(200);
  });

  it('defaults to the demo provider without credentials', () => {
    const provider = getPaymentProvider();
    expect(provider.name).toBe('demo');
  });

  it('creates a payment with a demo id and no redirect', async () => {
    const payment = await getPaymentProvider().createPayment(200, 'test', 'http://x');
    expect(payment.providerPaymentId).toMatch(/^demo_pay_[0-9a-f]{16}$/);
    expect(payment.checkoutUrl).toBeNull();
  });

  it('reports demo payments as immediately PAID', async () => {
    expect(await getPaymentProvider().getStatus('demo_pay_x')).toBe('PAID');
  });
});
