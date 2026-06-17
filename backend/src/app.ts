import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import animalsRoutes from './routes/animals.js';
import verifyRoutes from './routes/verify.js';
import creditsRoutes from './routes/credits.js';
import adminRoutes from './routes/admin.js';
import verificationRoutes from './routes/verification.js';
import confirmationsRoutes from './routes/confirmations.js';
import fraudRoutes from './routes/fraud.js';
import paymentRoutes from './routes/payment.js';
import importsRoutes from './routes/imports.js';

// Builds the Express app without starting it — importable by tests (supertest).
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/auth', authRoutes);
  app.use('/animals', animalsRoutes);
  app.use('/verify', verifyRoutes);
  app.use('/credits', creditsRoutes);
  app.use('/admin', adminRoutes);
  app.use('/verification', verificationRoutes);
  app.use('/confirmations', confirmationsRoutes);
  app.use('/fraud', fraudRoutes);
  app.use('/payment', paymentRoutes);
  app.use('/imports', importsRoutes);

  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

  return app;
}
