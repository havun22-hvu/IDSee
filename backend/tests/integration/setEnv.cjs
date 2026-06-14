// Runs before each integration test file: point Prisma at the test database
// copy (db.ts reads DATABASE_URL) and use a fixed JWT secret.
// SQLite relative file: paths resolve against the schema dir (backend/prisma/).
process.env.DATABASE_URL = 'file:./test-integration.db';
process.env.JWT_SECRET = 'integration-test-secret';
