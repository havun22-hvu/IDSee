import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance, separate from the server bootstrap so that
// services/routes can be imported (and tested) without starting the HTTP server.
// Tests can point at a separate database via DATABASE_URL.
export const prisma = process.env.DATABASE_URL
  ? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  : new PrismaClient();
