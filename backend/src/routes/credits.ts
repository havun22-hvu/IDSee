import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { CREDIT_BUNDLES } from '../types/index.js';

const router = Router();

// GET /credits/bundles - Public, get available bundles
router.get('/bundles', (req, res) => {
  res.json(CREDIT_BUNDLES);
});

// All other routes require auth
router.use(authMiddleware);

// GET /credits - Get current balance
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { credits: true },
    });

    res.json({ credits: user?.credits ?? 0 });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Kon credits niet ophalen' });
  }
});

// GET /credits/transactions - Get transaction history
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Kon transacties niet ophalen' });
  }
});

// POST /credits/purchase - Start purchase flow
const purchaseSchema = z.object({
  bundleId: z.string(),
});

router.post('/purchase', async (req: AuthRequest, res: Response) => {
  try {
    const { bundleId } = purchaseSchema.parse(req.body);

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) {
      return res.status(400).json({ error: 'Onbekende bundel' });
    }

    // TODO: Integrate with Mollie
    // For now, simulate immediate purchase (dev mode)
    if (process.env.NODE_ENV === 'development') {
      // Add credits directly in dev mode
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.userId },
          data: { credits: { increment: bundle.credits } },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: req.userId!,
            amount: bundle.credits,
            type: 'PURCHASE',
            description: `${bundle.credits} credits (dev mode)`,
          },
        }),
      ]);

      return res.json({
        success: true,
        message: 'Credits toegevoegd (dev mode)',
        credits: bundle.credits,
      });
    }

    // Production: Create Mollie payment
    // const mollie = require('@mollie/api-client')({ apiKey: process.env.MOLLIE_API_KEY });
    // const payment = await mollie.payments.create({
    //   amount: { currency: 'EUR', value: bundle.price.toFixed(2) },
    //   description: `IDSee ${bundle.credits} credits`,
    //   redirectUrl: `${process.env.FRONTEND_URL}/credits/success`,
    //   webhookUrl: `${process.env.API_URL}/credits/webhook`,
    //   metadata: { userId: req.userId, bundleId, credits: bundle.credits },
    // });
    // res.json({ checkoutUrl: payment.getCheckoutUrl() });

    res.status(501).json({
      error: 'Betalingen nog niet geconfigureerd',
      hint: 'Set NODE_ENV=development voor test mode',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Aankoop mislukt' });
  }
});

// POST /credits/webhook - Mollie webhook
router.post('/webhook', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing payment ID' });
    }

    // TODO: Verify with Mollie and add credits
    // const mollie = require('@mollie/api-client')({ apiKey: process.env.MOLLIE_API_KEY });
    // const payment = await mollie.payments.get(id);
    // if (payment.status === 'paid') {
    //   const { userId, credits } = payment.metadata;
    //   await prisma.user.update(...);
    //   await prisma.creditTransaction.create(...);
    // }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

export default router;
