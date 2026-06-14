import { Router } from 'express';
import { prisma } from '../db.js';
import { getPaymentProvider } from '../services/paymentService.js';

const router = Router();

// POST /payment/webhook - used by redirect-based providers (Mollie). The demo
// provider settles via lazy polling in /verify/check-status, so this is a no-op
// there. Never trust the payload's status: re-fetch from the provider.
router.post('/webhook', async (req, res) => {
  try {
    const providerPaymentId = req.body?.id || req.body?.providerPaymentId;
    if (!providerPaymentId) {
      return res.status(400).json({ error: 'Geen betaling-id' });
    }

    const tx = await prisma.checkTransaction.findFirst({
      where: { providerPaymentId },
    });
    if (!tx) return res.status(404).json({ error: 'Transactie niet gevonden' });

    const status = await getPaymentProvider().getStatus(providerPaymentId);
    await prisma.checkTransaction.update({
      where: { id: tx.id },
      data: { status, paidAt: status === 'PAID' ? new Date() : tx.paidAt },
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook verwerking mislukt' });
  }
});

export default router;
