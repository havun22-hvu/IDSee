import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';
import { generateToken } from '../../src/middleware/auth.js';

const app = createApp();
// adminOnly uses authMiddleware (no DB lookup), so a token with role ADMIN suffices.
const adminToken = generateToken({ userId: 'admin-itest', email: 'a@x', role: 'ADMIN' });

afterAll(async () => {
  // Reset thresholds so other suites see the code defaults again.
  await prisma.systemConfig.deleteMany({
    where: { key: { in: ['fraud_orange_threshold', 'fraud_red_threshold', 'fraud_block_threshold'] } },
  });
  await prisma.$disconnect();
});

describe('admin fraud thresholds', () => {
  it('rejects non-admins', async () => {
    const res = await request(app).get('/admin/config');
    expect(res.status).toBe(401);
  });

  it('returns the default thresholds', async () => {
    const res = await request(app)
      .get('/admin/config')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ orange: 2, red: 4, block: 10 });
  });

  it('updates thresholds when they ascend', async () => {
    const res = await request(app)
      .put('/admin/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orange: 3, red: 5, block: 12 });
    expect(res.status).toBe(200);

    const check = await request(app)
      .get('/admin/config')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(check.body).toEqual({ orange: 3, red: 5, block: 12 });
  });

  it('rejects non-ascending thresholds', async () => {
    const res = await request(app)
      .put('/admin/config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orange: 5, red: 3, block: 10 });
    expect(res.status).toBe(400);
  });
});
