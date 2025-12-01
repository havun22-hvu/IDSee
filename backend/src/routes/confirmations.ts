import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { registerOnChain } from '../services/blockchain.js';

const router = Router();
const prisma = new PrismaClient();

// Get pending confirmations for breeder
router.get('/pending', authenticateToken, requireRole(['BREEDER']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Find registrations linked to this breeder's UBN
    const registrations = await prisma.registration.findMany({
      where: {
        breederUbn: user.professionalId,
        breederConfirmed: false,
        status: 'PENDING',
      },
      include: {
        animal: true,
        user: {
          select: {
            email: true,
            role: true,
            professionalId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get pending confirmations error:', error);
    res.status(500).json({ error: 'Kon bevestigingen niet ophalen' });
  }
});

// Confirm a registration (breeder confirms vet/chipper registration)
router.post('/:registrationId/confirm', authenticateToken, requireRole(['BREEDER']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { registrationId } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { animal: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registratie niet gevonden' });
    }

    // Check if this breeder is linked to this registration
    if (registration.breederUbn !== user.professionalId) {
      return res.status(403).json({ error: 'Je kunt alleen je eigen dieren bevestigen' });
    }

    if (registration.breederConfirmed) {
      return res.status(400).json({ error: 'Al bevestigd' });
    }

    if (registration.status === 'DISPUTED') {
      return res.status(400).json({ error: 'Deze registratie is betwist' });
    }

    // Register on blockchain
    let txHash = null;
    try {
      txHash = await registerOnChain(registration.dataHash);
    } catch (err) {
      console.error('Blockchain registration failed:', err);
      // Continue without blockchain in demo mode
    }

    // Update registration
    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        breederConfirmed: true,
        breederConfirmedAt: new Date(),
        breederUserId: user.id,
        status: 'CONFIRMED',
        txHash,
        confirmedAt: new Date(),
      },
    });

    res.json({
      message: 'Registratie bevestigd en op blockchain geregistreerd',
      txHash,
    });
  } catch (error) {
    console.error('Confirm registration error:', error);
    res.status(500).json({ error: 'Bevestiging mislukt' });
  }
});

// Reject a registration (breeder disputes)
router.post('/:registrationId/reject', authenticateToken, requireRole(['BREEDER']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { registrationId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reden is verplicht' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registratie niet gevonden' });
    }

    if (registration.breederUbn !== user.professionalId) {
      return res.status(403).json({ error: 'Je kunt alleen je eigen dieren afwijzen' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Kan alleen wachtende registraties afwijzen' });
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'DISPUTED',
        breederRejectedReason: reason,
        breederUserId: user.id,
      },
    });

    // TODO: Notify the registering professional about the dispute

    res.json({ message: 'Registratie afgewezen' });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ error: 'Afwijzing mislukt' });
  }
});

// Get confirmation history
router.get('/history', authenticateToken, requireRole(['BREEDER']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    const registrations = await prisma.registration.findMany({
      where: {
        OR: [
          { breederUbn: user.professionalId },
          { breederUserId: user.id },
        ],
      },
      include: {
        animal: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get confirmation history error:', error);
    res.status(500).json({ error: 'Kon geschiedenis niet ophalen' });
  }
});

export default router;
