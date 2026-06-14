import dotenv from 'dotenv';
import { createApp } from './app.js';
import { prisma } from './db.js';
import { initBlockchain } from './services/blockchain.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = createApp();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

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

// Re-export so existing `from '../index.js'` imports keep working during migration.
export { prisma };
