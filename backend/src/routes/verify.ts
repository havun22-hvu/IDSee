import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { hashChipId } from '../services/blockchain.js';
import { calculateRiskScore } from '../services/verificationService.js';
import { getPaymentProvider, CHECK_PRICE_CENTS } from '../services/paymentService.js';
import { reportFraud } from '../services/fraudService.js';

const router = Router();

// POST /verify/initiate-check - start a paid check (€2). Returns a sessionId and,
// for redirect-based providers, a checkoutUrl. Unknown chips are NOT rejected:
// "onbekend" is a valid (oranje) outcome the buyer pays to learn (PROPOSITION.md §3/§7).
router.post('/initiate-check', async (req, res) => {
  try {
    const { chipId } = req.body;
    if (!chipId || chipId.length < 10) {
      return res.status(400).json({ error: 'Ongeldig chipnummer' });
    }

    const chipIdHash = hashChipId(chipId);
    const sessionId = crypto.randomUUID();
    const provider = getPaymentProvider();
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?session=${sessionId}`;
    const payment = await provider.createPayment(CHECK_PRICE_CENTS, 'IDSee herkomstcheck', redirectUrl);

    await prisma.checkTransaction.create({
      data: {
        sessionId,
        chipIdHash,
        amount: CHECK_PRICE_CENTS,
        provider: provider.name,
        providerPaymentId: payment.providerPaymentId,
        checkoutUrl: payment.checkoutUrl,
      },
    });

    res.json({ sessionId, checkoutUrl: payment.checkoutUrl });
  } catch (error) {
    console.error('Initiate check error:', error);
    res.status(500).json({ error: 'Kon check niet starten' });
  }
});

// GET /verify/check-status/:sessionId - frontend polls this. Lazily pulls the
// provider status so the demo flow works without a webhook.
router.get('/check-status/:sessionId', async (req, res) => {
  try {
    const tx = await prisma.checkTransaction.findUnique({
      where: { sessionId: req.params.sessionId },
    });
    if (!tx) return res.status(404).json({ error: 'Sessie niet gevonden' });

    if (tx.status === 'PENDING' && tx.providerPaymentId) {
      const status = await getPaymentProvider().getStatus(tx.providerPaymentId);
      if (status !== 'PENDING') {
        await prisma.checkTransaction.update({
          where: { id: tx.id },
          data: { status, paidAt: status === 'PAID' ? new Date() : null },
        });
        return res.json({ status });
      }
    }

    res.json({ status: tx.status });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ error: 'Kon status niet ophalen' });
  }
});

// GET /verify/result/:sessionId - the score, released only after payment.
router.get('/result/:sessionId', async (req, res) => {
  try {
    const tx = await prisma.checkTransaction.findUnique({
      where: { sessionId: req.params.sessionId },
    });
    if (!tx) return res.status(404).json({ error: 'Sessie niet gevonden' });
    if (tx.status !== 'PAID') {
      return res.status(402).json({ error: 'Betaling nog niet voltooid' });
    }

    const result = await calculateRiskScore(tx.chipIdHash);
    await prisma.checkTransaction.update({
      where: { id: tx.id },
      data: { scoreShown: true },
    });

    res.json(result);
  } catch (error) {
    console.error('Verify result error:', error);
    res.status(500).json({ error: 'Kon resultaat niet ophalen' });
  }
});

// POST /verify/report-soft - a buyer flags an irregularity after a paid check,
// without an account. Tied to a PAID session (anti-spam). It becomes a "soft"
// signal (source BUYER) that a verified vet still has to confirm before it
// counts toward the cascade (PROPOSITION.md §4/§9).
router.post('/report-soft', async (req, res) => {
  try {
    const { sessionId, description } = req.body;
    if (!sessionId || !description) {
      return res.status(400).json({ error: 'Sessie en beschrijving zijn verplicht' });
    }

    const tx = await prisma.checkTransaction.findUnique({ where: { sessionId } });
    if (!tx || tx.status !== 'PAID') {
      return res.status(403).json({ error: 'Melden kan alleen na een betaalde check' });
    }

    const animal = await prisma.animal.findUnique({ where: { chipIdHash: tx.chipIdHash } });
    if (!animal) {
      return res.status(404).json({ error: 'Geen geregistreerd dier voor dit chipnummer' });
    }

    await reportFraud({
      source: 'BUYER',
      type: 'koper_melding',
      description,
      animalId: animal.id,
    });

    res.status(201).json({ message: 'Bedankt. Een dierenarts beoordeelt je melding.' });
  } catch (error: any) {
    // e.g. animal has no registrant to attribute the signal to
    res.status(400).json({ error: error.message || 'Kon melding niet indienen' });
  }
});

// GET /verify/:chipId - direct score for authenticated users (internal / legacy).
// The public buyer flow goes through the paid endpoints above; this one is behind
// auth so the score is not given away for free.
router.get('/:chipId', authMiddleware, async (req, res) => {
  try {
    const { chipId } = req.params;
    if (!chipId || chipId.length < 10) {
      return res.status(400).json({ error: 'Ongeldig chipnummer' });
    }

    const chipIdHash = hashChipId(chipId);
    const result = await calculateRiskScore(chipIdHash);
    result.chipId = chipId;

    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

export default router;
