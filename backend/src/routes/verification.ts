import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Bond amount for peer verification (in credits)
const VERIFICATION_BOND = 10;
const BOND_LOCK_DAYS = 30;

// ===== EMAIL VERIFICATION =====

// Send verification email (called after registration)
router.post('/email/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is al geverifieerd' });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: token,
        emailVerifyExpires: expires,
      },
    });

    // TODO: Send actual email via email service
    // For now, log the token (development only)
    console.log(`Email verification token for ${user.email}: ${token}`);

    res.json({
      message: 'Verificatie email verzonden',
      // In development, return token for testing
      ...(process.env.NODE_ENV !== 'production' && { devToken: token }),
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ error: 'Kon verificatie email niet verzenden' });
  }
});

// Verify email with token
router.post('/email/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is verplicht' });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Ongeldige of verlopen token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    res.json({ message: 'Email succesvol geverifieerd' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

// ===== VERIFICATION REQUESTS =====

// Submit verification request (for professionals)
router.post('/request', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { professionalId, professionalType } = req.body;

    if (!professionalId || !professionalType) {
      return res.status(400).json({ error: 'Professioneel ID en type zijn verplicht' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    if (!user.emailVerified) {
      return res.status(400).json({ error: 'Verifieer eerst je email' });
    }

    if (user.verificationStatus === 'VERIFIED') {
      return res.status(400).json({ error: 'Je bent al geverifieerd' });
    }

    // Check for existing request
    const existing = await prisma.verificationRequest.findUnique({
      where: { userId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Je hebt al een aanvraag ingediend' });
    }

    // Create verification request
    const request = await prisma.verificationRequest.create({
      data: {
        userId,
        professionalId,
        professionalType,
      },
    });

    // Update user with professional info
    await prisma.user.update({
      where: { id: userId },
      data: {
        professionalId,
        professionalType,
      },
    });

    res.json({
      message: 'Verificatie aanvraag ingediend',
      request,
    });
  } catch (error) {
    console.error('Submit verification request error:', error);
    res.status(500).json({ error: 'Kon aanvraag niet indienen' });
  }
});

// Get pending verification requests (for verified professionals)
router.get('/requests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Must be verified professional to see requests
    if (user.verificationStatus !== 'VERIFIED' || user.role === 'BUYER') {
      return res.status(403).json({ error: 'Niet geautoriseerd' });
    }

    const requests = await prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ error: 'Kon aanvragen niet ophalen' });
  }
});

// ===== PEER VERIFICATION =====

// Verify another professional (peer verification)
router.post('/peer/:requestId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const verifier = req.user!;
    const { requestId } = req.params;

    // Must be verified professional
    if (verifier.verificationStatus !== 'VERIFIED' || verifier.role === 'BUYER') {
      return res.status(403).json({ error: 'Je moet zelf geverifieerd zijn' });
    }

    // Check if suspended
    if (verifier.isSuspended) {
      return res.status(403).json({ error: 'Je account is geschorst' });
    }

    // Check available credits for bond
    const availableCredits = verifier.credits - verifier.lockedCredits;
    if (availableCredits < VERIFICATION_BOND) {
      return res.status(400).json({
        error: `Je hebt minimaal ${VERIFICATION_BOND} credits nodig als borg`,
      });
    }

    // Get verification request
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Aanvraag niet gevonden of al behandeld' });
    }

    // Can't verify yourself
    if (request.userId === verifier.id) {
      return res.status(400).json({ error: 'Je kunt jezelf niet verifiëren' });
    }

    // Lock bond and create peer verification
    const bondLockedUntil = new Date(Date.now() + BOND_LOCK_DAYS * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      // Lock credits
      prisma.user.update({
        where: { id: verifier.id },
        data: {
          lockedCredits: { increment: VERIFICATION_BOND },
        },
      }),

      // Create peer verification record
      prisma.peerVerification.create({
        data: {
          verifierId: verifier.id,
          verifiedId: request.userId,
          bondAmount: VERIFICATION_BOND,
          bondLockedUntil,
        },
      }),

      // Update verification request
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedById: verifier.id,
          reviewedAt: new Date(),
        },
      }),

      // Verify the user
      prisma.user.update({
        where: { id: request.userId },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedById: verifier.id,
          verifiedAt: new Date(),
          verificationBond: VERIFICATION_BOND,
        },
      }),

      // Log transaction
      prisma.creditTransaction.create({
        data: {
          userId: verifier.id,
          amount: 0, // Not spending, just locking
          type: 'BOND_LOCKED',
          description: `Borg voor verificatie van gebruiker ${request.userId}`,
        },
      }),
    ]);

    res.json({
      message: 'Gebruiker succesvol geverifieerd',
      bondAmount: VERIFICATION_BOND,
      bondLockedUntil,
    });
  } catch (error) {
    console.error('Peer verification error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

// Get my verifications (who I verified)
router.get('/my-verifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const verifications = await prisma.peerVerification.findMany({
      where: { verifierId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(verifications);
  } catch (error) {
    console.error('Get my verifications error:', error);
    res.status(500).json({ error: 'Kon verificaties niet ophalen' });
  }
});

// Release bond (after lock period)
router.post('/release-bond/:verificationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { verificationId } = req.params;

    const verification = await prisma.peerVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification || verification.verifierId !== userId) {
      return res.status(404).json({ error: 'Verificatie niet gevonden' });
    }

    if (verification.bondStatus !== 'LOCKED') {
      return res.status(400).json({ error: 'Borg is al vrijgegeven of verbeurd' });
    }

    if (new Date() < verification.bondLockedUntil) {
      return res.status(400).json({
        error: `Borg kan pas worden vrijgegeven na ${verification.bondLockedUntil.toLocaleDateString('nl-NL')}`,
      });
    }

    await prisma.$transaction([
      // Release locked credits
      prisma.user.update({
        where: { id: userId },
        data: {
          lockedCredits: { decrement: verification.bondAmount },
        },
      }),

      // Update verification
      prisma.peerVerification.update({
        where: { id: verificationId },
        data: {
          bondStatus: 'RELEASED',
          status: 'COMPLETED',
          releasedAt: new Date(),
        },
      }),
    ]);

    res.json({ message: 'Borg succesvol vrijgegeven' });
  } catch (error) {
    console.error('Release bond error:', error);
    res.status(500).json({ error: 'Kon borg niet vrijgeven' });
  }
});

export default router;
