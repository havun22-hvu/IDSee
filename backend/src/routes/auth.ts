import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
  role: z.enum(['BUYER', 'BREEDER', 'VET', 'CHIPPER']).default('BUYER'),
  professionalId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return res.status(400).json({ error: 'Email is al geregistreerd' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        professionalId: data.professionalId,
        verificationStatus: data.role === 'BUYER' ? 'VERIFIED' : 'PENDING',
        credits: data.role === 'BUYER' ? 0 : 5, // Professionals krijgen 5 gratis credits
      },
      select: {
        id: true,
        email: true,
        role: true,
        credits: true,
        verificationStatus: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registratie mislukt' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    // Check password
    const valid = await bcrypt.compare(data.password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        verificationStatus: user.verificationStatus,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Inloggen mislukt' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        role: true,
        credits: true,
        verificationStatus: true,
        professionalId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kon gebruiker niet ophalen' });
  }
});

export default router;
