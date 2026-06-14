const fs = require('fs');
const path = require('path');

// Copy the dev database (which already has the full pushed schema) to an
// isolated test database, so integration tests never touch dev data.
module.exports = async () => {
  const prismaDir = path.resolve(__dirname, '../../prisma');
  const source = path.join(prismaDir, 'dev.db');
  const target = path.join(prismaDir, 'test-integration.db');

  if (!fs.existsSync(source)) {
    throw new Error('prisma/dev.db ontbreekt — run "npx prisma db push" eerst');
  }
  fs.copyFileSync(source, target);
};
