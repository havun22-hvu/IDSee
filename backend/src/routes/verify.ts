import { Router } from 'express';
import { prisma } from '../index.js';
import { hashChipId, verifyOnChain, isDemoMode } from '../services/blockchain.js';
import { VerifyResult } from '../types/index.js';

const router = Router();

// GET /verify/:chipId - Public endpoint, no auth required
router.get('/:chipId', async (req, res) => {
  try {
    const { chipId } = req.params;

    if (!chipId || chipId.length < 10) {
      return res.status(400).json({ error: 'Ongeldig chipnummer' });
    }

    // Hash the chip ID for lookup
    const chipIdHash = hashChipId(chipId);

    // Look up in database
    const animal = await prisma.animal.findUnique({
      where: { chipIdHash },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
          include: {
            user: {
              select: {
                role: true,
                verificationStatus: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!animal) {
      const result: VerifyResult = {
        found: false,
        certified: false,
        breederVerified: false,
        motherKnown: false,
      };
      return res.json(result);
    }

    // Check blockchain (optional verification)
    let blockchainVerified = false;
    if (!isDemoMode()) {
      const onChainResult = await verifyOnChain(chipIdHash);
      blockchainVerified = onChainResult.found;
    } else {
      blockchainVerified = true; // Demo mode: assume verified
    }

    // Check if breeder is verified
    const registration = animal.registrations[0];
    const breederVerified = registration?.user?.verificationStatus === 'VERIFIED';

    const result: VerifyResult = {
      found: true,
      certified: blockchainVerified && breederVerified,
      breederVerified,
      motherKnown: !!animal.motherChipHash,
      registrationDate: registration?.createdAt,
    };

    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verificatie mislukt' });
  }
});

// GET /verify/:chipId/details - For authenticated users with permission
router.get('/:chipId/details', async (req, res) => {
  // TODO: Add auth and permission check
  // This endpoint could return more details for insurance companies, etc.
  res.status(501).json({ error: 'Nog niet geïmplementeerd' });
});

export default router;
