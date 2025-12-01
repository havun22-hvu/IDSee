import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../index.js';

export function requireCredits(amount: number) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Niet ingelogd' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { credits: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'Gebruiker niet gevonden' });
      }

      if (user.credits < amount) {
        return res.status(402).json({
          error: 'Onvoldoende credits',
          required: amount,
          current: user.credits,
        });
      }

      req.creditCost = amount;
      next();
    } catch (error) {
      console.error('Credits check failed:', error);
      return res.status(500).json({ error: 'Kon credits niet controleren' });
    }
  };
}

export async function deductCredits(userId: string, amount: number, description: string) {
  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: 'USAGE',
        description,
      },
    }),
  ]);
}
