import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';
import { generateToken } from '../../src/middleware/auth.js';
import { hashChipId } from '../../src/services/blockchain.js';

const app = createApp();

// Unique fixtures so we never clash with seed data in the copied dev.db.
const CHIP = '900000000000777';
let subjectId: string;
let vetId: string;
let reporterId: string;
let animalId: string;

beforeAll(async () => {
  const subject = await prisma.user.create({
    data: {
      email: 'itest-subject@x.nl',
      passwordHash: 'x',
      role: 'CHIPPER',
      verificationStatus: 'VERIFIED',
      fraudStatus: 'LEREN',
    },
  });
  subjectId = subject.id;

  const vet = await prisma.user.create({
    data: {
      email: 'itest-vet@x.nl',
      passwordHash: 'x',
      role: 'VET',
      verificationStatus: 'VERIFIED',
    },
  });
  vetId = vet.id;

  const reporter = await prisma.user.create({
    data: { email: 'itest-reporter@x.nl', passwordHash: 'x', role: 'BUYER' },
  });
  reporterId = reporter.id;

  const animal = await prisma.animal.create({
    data: {
      chipIdHash: hashChipId(CHIP),
      species: 'dog',
      breed: 'Labrador',
      motherChipHash: hashChipId('900000000000111'),
    },
  });
  animalId = animal.id;

  await prisma.registration.create({
    data: {
      userId: subjectId,
      animalId,
      dataHash: 'd',
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const token = (id: string, role: string) =>
  generateToken({ userId: id, email: `${id}@x`, role });

describe('paid check flow (gating)', () => {
  it('blocks the result until payment, then returns a score', async () => {
    const init = await request(app).post('/verify/initiate-check').send({ chipId: CHIP });
    expect(init.status).toBe(200);
    const { sessionId, checkoutUrl } = init.body;
    expect(sessionId).toBeTruthy();
    expect(checkoutUrl).toBeNull(); // demo provider

    // Result before the status is settled → 402.
    const early = await request(app).get(`/verify/result/${sessionId}`);
    expect(early.status).toBe(402);

    // Demo provider settles on status poll.
    const status = await request(app).get(`/verify/check-status/${sessionId}`);
    expect(status.body.status).toBe('PAID');

    const result = await request(app).get(`/verify/result/${sessionId}`);
    expect(result.status).toBe(200);
    expect(['GROEN', 'ORANJE', 'ROOD']).toContain(result.body.riskScore);
  });
});

describe('soft buyer signal', () => {
  it('requires a PAID session', async () => {
    const res = await request(app)
      .post('/verify/report-soft')
      .send({ sessionId: 'does-not-exist', description: 'iets klopt niet' });
    expect(res.status).toBe(403);
  });

  it('creates a BUYER-sourced report after a paid check', async () => {
    const init = await request(app).post('/verify/initiate-check').send({ chipId: CHIP });
    const { sessionId } = init.body;
    await request(app).get(`/verify/check-status/${sessionId}`); // settle (demo PAID)

    const res = await request(app)
      .post('/verify/report-soft')
      .send({ sessionId, description: 'moeder lijkt niet te kloppen' });
    expect(res.status).toBe(201);

    const report = await prisma.fraudReport.findFirst({
      where: { subjectUserId: subjectId, source: 'BUYER' },
    });
    expect(report).toBeTruthy();
    expect(report?.reporterId).toBeNull();
  });
});

describe('fraud cascade (end-to-end)', () => {
  it('a sound chain scores GROEN before any signal', async () => {
    const res = await request(app)
      .get(`/verify/${CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.status).toBe(200);
    expect(res.body.riskScore).toBe('GROEN');
  });

  it('only a verified vet may see/confirm signals', async () => {
    const res = await request(app)
      .get('/fraud/pending')
      .set('Authorization', `Bearer ${token(reporterId, 'BUYER')}`);
    expect(res.status).toBe(403);
  });

  it('two vet-confirmed signals flip the subject to ORANJE and cascade to the score', async () => {
    // File two signals about the subject.
    for (let i = 0; i < 2; i++) {
      const r = await request(app)
        .post('/fraud/report')
        .set('Authorization', `Bearer ${token(reporterId, 'BUYER')}`)
        .send({ subjectUserId: subjectId, type: 'ontbrekende_schakel', description: `signal ${i}` });
      expect(r.status).toBe(201);
    }

    // Vet confirms both.
    const pending = await request(app)
      .get('/fraud/pending')
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(pending.body.length).toBeGreaterThanOrEqual(2);

    for (const report of pending.body) {
      await request(app)
        .post(`/fraud/${report.id}/confirm`)
        .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    }

    // Subject is now flagged (orange threshold = 2).
    const subject = await prisma.user.findUnique({ where: { id: subjectId } });
    expect(subject?.fraudStatus).toBe('ORANJE');

    // The cascade shows in the derived score for the subject's animal.
    const res = await request(app)
      .get(`/verify/${CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.body.riskScore).toBe('ORANJE');
  });
});

describe('professional notes / card system (§4)', () => {
  // Fresh subject + animal so the fraud cascade above does not interfere.
  const NOTE_CHIP = '900000000000888';
  let noteSubjectId: string;

  beforeAll(async () => {
    const subject = await prisma.user.create({
      data: {
        email: 'itest-note-subject@x.nl',
        passwordHash: 'x',
        role: 'CHIPPER',
        verificationStatus: 'VERIFIED',
      },
    });
    noteSubjectId = subject.id;

    const animal = await prisma.animal.create({
      data: {
        chipIdHash: hashChipId(NOTE_CHIP),
        species: 'dog',
        motherChipHash: hashChipId('900000000000222'),
      },
    });
    await prisma.registration.create({
      data: {
        userId: noteSubjectId,
        animalId: animal.id,
        dataHash: 'd',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  });

  it('refuses a note from a non-vet/non-admin', async () => {
    const res = await request(app)
      .post('/fraud/note')
      .set('Authorization', `Bearer ${token(reporterId, 'BUYER')}`)
      .send({ subjectUserId: noteSubjectId, type: 'chip_mismatch', description: 'x' });
    expect(res.status).toBe(403);
  });

  it('a sound chain scores GROEN before any note', async () => {
    const res = await request(app)
      .get(`/verify/${NOTE_CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.body.riskScore).toBe('GROEN');
  });

  it('three vet notes raise a gele kaart and downgrade the score to ORANJE', async () => {
    for (let i = 0; i < 3; i++) {
      const r = await request(app)
        .post('/fraud/note')
        .set('Authorization', `Bearer ${token(vetId, 'VET')}`)
        .send({ subjectUserId: noteSubjectId, type: 'chip_mismatch', description: `note ${i}` });
      expect(r.status).toBe(201);
    }

    const subject = await prisma.user.findUnique({ where: { id: noteSubjectId } });
    expect(subject?.cardStatus).toBe('GEEL');

    const res = await request(app)
      .get(`/verify/${NOTE_CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.body.riskScore).toBe('ORANJE');
  });
});
