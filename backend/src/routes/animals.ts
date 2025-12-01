import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { requireCredits, deductCredits } from '../middleware/credits.js';
import { hashChipId, hashData, registerOnChain } from '../services/blockchain.js';
import { CREDIT_COSTS } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const registerAnimalSchema = z.object({
  chipId: z.string().min(10, 'Chipnummer moet minimaal 10 tekens zijn'),
  species: z.string().min(1, 'Diersoort is verplicht'),
  breed: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  motherChipId: z.string().optional(),
});

// POST /animals - Register a new animal
router.post(
  '/',
  requireRole(['BREEDER', 'VET', 'CHIPPER']),
  requireCredits(CREDIT_COSTS.REGISTER_ANIMAL),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = registerAnimalSchema.parse(req.body);

      // Hash chip ID
      const chipIdHash = hashChipId(data.chipId);

      // Check if animal already exists
      const existing = await prisma.animal.findUnique({
        where: { chipIdHash },
      });

      if (existing) {
        return res.status(400).json({ error: 'Dit chipnummer is al geregistreerd' });
      }

      // Hash mother chip if provided
      const motherChipHash = data.motherChipId
        ? hashChipId(data.motherChipId)
        : null;

      // Create registration data hash
      const registrationData = JSON.stringify({
        chipIdHash,
        species: data.species,
        breed: data.breed,
        registeredBy: req.userId,
        timestamp: Date.now(),
      });
      const dataHash = hashData(registrationData);

      // Create animal and registration in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create animal
        const animal = await tx.animal.create({
          data: {
            chipIdHash,
            species: data.species,
            breed: data.breed,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            motherChipHash,
          },
        });

        // Create registration (pending blockchain confirmation)
        const registration = await tx.registration.create({
          data: {
            userId: req.userId!,
            animalId: animal.id,
            dataHash,
            status: 'PENDING',
          },
        });

        return { animal, registration };
      });

      // Register on blockchain (async, don't wait)
      registerOnChain(dataHash)
        .then(async (txHash) => {
          // Update registration with tx hash
          await prisma.registration.update({
            where: { id: result.registration.id },
            data: {
              txHash,
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
          });
          console.log(`Animal ${result.animal.id} confirmed on chain: ${txHash}`);
        })
        .catch(async (error) => {
          console.error('Blockchain registration failed:', error);
          await prisma.registration.update({
            where: { id: result.registration.id },
            data: { status: 'FAILED' },
          });
        });

      // Deduct credits
      await deductCredits(req.userId!, CREDIT_COSTS.REGISTER_ANIMAL, 'Dier registratie');

      res.status(201).json({
        id: result.animal.id,
        status: 'pending',
        message: 'Registratie wordt verwerkt',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Register animal error:', error);
      res.status(500).json({ error: 'Registratie mislukt' });
    }
  }
);

// GET /animals - Get user's registered animals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.userId },
      include: {
        animal: {
          select: {
            id: true,
            species: true,
            breed: true,
            birthDate: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const animals = registrations.map((reg) => ({
      id: reg.animal.id,
      species: reg.animal.species,
      breed: reg.animal.breed,
      birthDate: reg.animal.birthDate,
      status: reg.status,
      registeredAt: reg.createdAt,
      txHash: reg.txHash,
    }));

    res.json(animals);
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({ error: 'Kon dieren niet ophalen' });
  }
});

// GET /animals/:id - Get single animal details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findFirst({
      where: {
        animalId: id,
        userId: req.userId,
      },
      include: {
        animal: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Dier niet gevonden' });
    }

    res.json({
      id: registration.animal.id,
      species: registration.animal.species,
      breed: registration.animal.breed,
      birthDate: registration.animal.birthDate,
      motherKnown: !!registration.animal.motherChipHash,
      status: registration.status,
      txHash: registration.txHash,
      registeredAt: registration.createdAt,
      confirmedAt: registration.confirmedAt,
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Kon dier niet ophalen' });
  }
});

export default router;
