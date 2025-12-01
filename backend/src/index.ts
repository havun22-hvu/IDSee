import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import animalsRoutes from './routes/animals.js';
import verifyRoutes from './routes/verify.js';
import creditsRoutes from './routes/credits.js';
import adminRoutes from './routes/admin.js';
import verificationRoutes from './routes/verification.js';
import confirmationsRoutes from './routes/confirmations.js';
import { initBlockchain } from './services/blockchain.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/animals', animalsRoutes);
app.use('/verify', verifyRoutes);
app.use('/credits', creditsRoutes);
app.use('/admin', adminRoutes);
app.use('/verification', verificationRoutes);
app.use('/confirmations', confirmationsRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected');

    // Initialize blockchain
    await initBlockchain();
    console.log('✅ Blockchain initialized');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export { prisma };
