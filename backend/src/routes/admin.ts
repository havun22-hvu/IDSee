import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { getWalletBalance, isDemoMode } from '../services/blockchain.js';
import {
  getThresholds,
  setThresholds,
  getCardThresholds,
  setCardThresholds,
} from '../services/systemConfigService.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminOnly);

const thresholdsSchema = z.object({
  orange: z.number().int().min(1),
  red: z.number().int().min(1),
  block: z.number().int().min(1),
});

const cardThresholdsSchema = z.object({
  yellow: z.number().int().min(1),
  red: z.number().int().min(1),
});

// GET /admin/config - current fraud-cascade + card thresholds
router.get('/config', async (_req: AuthRequest, res: Response) => {
  try {
    const [fraud, cards] = await Promise.all([getThresholds(), getCardThresholds()]);
    res.json({ ...fraud, cards });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Kon configuratie niet ophalen' });
  }
});

// PUT /admin/config - update thresholds (must be orange < red < block)
router.put('/config', async (req: AuthRequest, res: Response) => {
  try {
    const t = thresholdsSchema.parse(req.body);
    if (!(t.orange < t.red && t.red < t.block)) {
      return res.status(400).json({ error: 'Drempels moeten oplopen: oranje < rood < blokkade' });
    }
    await setThresholds(t);
    res.json({ message: 'Drempels bijgewerkt', thresholds: t });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Kon configuratie niet bijwerken' });
  }
});

// PUT /admin/config/cards - update card thresholds (must be yellow < red)
router.put('/config/cards', async (req: AuthRequest, res: Response) => {
  try {
    const t = cardThresholdsSchema.parse(req.body);
    if (!(t.yellow < t.red)) {
      return res.status(400).json({ error: 'Drempels moeten oplopen: geel < rood' });
    }
    await setCardThresholds(t);
    res.json({ message: 'Kaart-drempels bijgewerkt', cards: t });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update card config error:', error);
    res.status(500).json({ error: 'Kon kaart-configuratie niet bijwerken' });
  }
});

// GET /admin/stats - Dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [
      userCount,
      animalCount,
      pendingVerifications,
      totalCredits,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.animal.count(),
      prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.user.aggregate({ _sum: { credits: true } }),
    ]);

    let walletBalance = 0n;
    try {
      walletBalance = await getWalletBalance();
    } catch (e) {
      // Ignore wallet errors
    }

    res.json({
      users: userCount,
      animals: animalCount,
      pendingVerifications,
      totalCreditsInSystem: totalCredits._sum.credits ?? 0,
      walletBalance: Number(walletBalance) / 1_000_000, // Convert lovelace to ADA
      demoMode: isDemoMode(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Kon statistieken niet ophalen' });
  }
});

// GET /admin/users - List all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.verificationStatus = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        professionalId: true,
        verificationStatus: true,
        credits: true,
        createdAt: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Kon gebruikers niet ophalen' });
  }
});

// GET /admin/users/pending - List pending verifications
router.get('/users/pending', async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        email: true,
        role: true,
        professionalId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Pending users error:', error);
    res.status(500).json({ error: 'Kon lijst niet ophalen' });
  }
});

// POST /admin/users/:id/verify - Verify a professional
const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  reason: z.string().optional(),
});

router.post('/users/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = verifySchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { verificationStatus: status },
      select: {
        id: true,
        email: true,
        role: true,
        verificationStatus: true,
      },
    });

    // TODO: Send email notification to user

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

// POST /admin/credits/grant - Give credits to user
const grantSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  reason: z.string().min(1),
});

router.post('/credits/grant', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, reason } = grantSchema.parse(req.body);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount,
          type: 'REFUND', // Using REFUND for admin grants
          description: `Admin: ${reason}`,
        },
      }),
    ]);

    res.json({ success: true, granted: amount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Grant credits error:', error);
    res.status(500).json({ error: 'Credits toekennen mislukt' });
  }
});

// GET /admin/registrations - List all registrations
router.get('/registrations', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: {
          select: { email: true, role: true },
        },
        animal: {
          select: { species: true, breed: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(registrations);
  } catch (error) {
    console.error('List registrations error:', error);
    res.status(500).json({ error: 'Kon registraties niet ophalen' });
  }
});

export default router;
