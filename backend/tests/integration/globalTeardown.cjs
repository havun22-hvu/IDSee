const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const target = path.resolve(__dirname, '../../prisma/test-integration.db');
  for (const f of [target, `${target}-journal`]) {
    if (fs.existsSync(f)) fs.rmSync(f);
  }
};
