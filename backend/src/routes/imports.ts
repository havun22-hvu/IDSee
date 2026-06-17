import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { hashChipId } from '../services/blockchain.js';

const router = Router();

// The IMPORT chain link is laid by a verified NL-vet (PROPOSITION.md §3a).
function requireVerifiedVet(req: AuthRequest, res: Response, next: NextFunction) {
  const u = req.user;
  if (!u || u.role !== 'VET' || u.verificationStatus !== 'VERIFIED') {
    return res
      .status(403)
      .json({ error: 'Alleen een geverifieerde dierenarts mag een import-schakel vastleggen' });
  }
  next();
}

const importSchema = z.object({
  chipId: z.string().min(10, 'Chipnummer moet minimaal 10 tekens zijn'),
  countryOfOrigin: z.string().min(2, 'Land van herkomst is verplicht'),
  foreignOriginId: z.string().optional(),
  euPassportNumber: z.string().optional(),
  passportConverted: z.boolean().optional(),
  vetCheckedDocuments: z.boolean().optional(),
});

// POST /imports - record an import link for an already-registered animal.
// The vet attests they physically checked the import papers, so the record is
// CONFIRMED on creation. A complete + traceable import yields 🔵 to the buyer.
router.post('/', authenticateToken, requireVerifiedVet, async (req: AuthRequest, res: Response) => {
  try {
    const data = importSchema.parse(req.body);
    const animal = await prisma.animal.findUnique({
      where: { chipIdHash: hashChipId(data.chipId) },
    });
    if (!animal) {
      return res
        .status(404)
        .json({ error: 'Registreer het dier eerst voordat je de import-schakel vastlegt' });
    }

    const record = await prisma.importRecord.upsert({
      where: { animalId: animal.id },
      create: {
        animalId: animal.id,
        recordedById: req.user!.id,
        countryOfOrigin: data.countryOfOrigin,
        foreignOriginId: data.foreignOriginId,
        euPassportNumber: data.euPassportNumber,
        passportConverted: data.passportConverted ?? false,
        vetCheckedDocuments: data.vetCheckedDocuments ?? false,
        status: 'CONFIRMED',
      },
      update: {
        recordedById: req.user!.id,
        countryOfOrigin: data.countryOfOrigin,
        foreignOriginId: data.foreignOriginId,
        euPassportNumber: data.euPassportNumber,
        passportConverted: data.passportConverted ?? false,
        vetCheckedDocuments: data.vetCheckedDocuments ?? false,
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({ message: 'Import-schakel vastgelegd', recordId: record.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Import record error:', error);
    res.status(500).json({ error: 'Kon import-schakel niet vastleggen' });
  }
});

export default router;
