import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';
import { generateToken } from '../../src/middleware/auth.js';
import { hashChipId } from '../../src/services/blockchain.js';

const app = createApp();

// Unique fixtures so we never clash with seed data in the copied dev.db.
const CHIP = '900000000000999';
let vetId: string;
let buyerId: string;
let animalId: string;

beforeAll(async () => {
  const vet = await prisma.user.create({
    data: {
      email: 'itest-import-vet@x.nl',
      passwordHash: 'x',
      role: 'VET',
      verificationStatus: 'VERIFIED',
    },
  });
  vetId = vet.id;

  const buyer = await prisma.user.create({
    data: { email: 'itest-import-buyer@x.nl', passwordHash: 'x', role: 'BUYER' },
  });
  buyerId = buyer.id;

  // An imported pup: registered, confirmed, but NO NL-mother chip.
  const animal = await prisma.animal.create({
    data: { chipIdHash: hashChipId(CHIP), species: 'dog', motherChipHash: null },
  });
  animalId = animal.id;
  await prisma.registration.create({
    data: { userId: vetId, animalId, dataHash: 'd', status: 'CONFIRMED', confirmedAt: new Date() },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const token = (id: string, role: string) =>
  generateToken({ userId: id, email: `${id}@x`, role });

describe('import link / 🔵 (§3a)', () => {
  it('an import pup without an import link reads as a broken NL chain → ROOD', async () => {
    // No import record yet + no NL-mother = NL-claim that does not close → ROOD.
    // Recording the import link below reveals it is a verified import → BLAUW.
    const res = await request(app)
      .get(`/verify/${CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.body.riskScore).toBe('ROOD');
  });

  it('refuses an import link from a non-vet', async () => {
    const res = await request(app)
      .post('/imports')
      .set('Authorization', `Bearer ${token(buyerId, 'BUYER')}`)
      .send({ chipId: CHIP, countryOfOrigin: 'BE' });
    expect(res.status).toBe(403);
  });

  it('a complete, traceable import link makes the score BLAUW, not ORANJE', async () => {
    const rec = await request(app)
      .post('/imports')
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`)
      .send({
        chipId: CHIP,
        countryOfOrigin: 'BE',
        foreignOriginId: 'BE-FOK-12345',
        euPassportNumber: 'BE0001',
        passportConverted: false,
        vetCheckedDocuments: true,
      });
    expect(rec.status).toBe(201);

    const res = await request(app)
      .get(`/verify/${CHIP}`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(res.body.riskScore).toBe('BLAUW');
    expect(res.body.factors.imported).toBe(true);
    expect(res.body.factors.importVerified).toBe(true);
  });
});

describe('toerekening: vet-gecontroleerde import die fout blijkt (§4 scenario 2)', () => {
  const CHIP2 = '900000000000901';
  let ownerId: string;

  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: { email: 'itest-import-owner@x.nl', passwordHash: 'x', role: 'CHIPPER', verificationStatus: 'VERIFIED' },
    });
    ownerId = owner.id;
    const animal = await prisma.animal.create({
      data: { chipIdHash: hashChipId(CHIP2), species: 'dog', motherChipHash: null },
    });
    // Owner registered the animal; a DIFFERENT vet recorded the import as checked.
    await prisma.registration.create({
      data: { userId: ownerId, animalId: animal.id, dataHash: 'd', status: 'CONFIRMED', confirmedAt: new Date() },
    });
    await prisma.importRecord.create({
      data: {
        animalId: animal.id,
        recordedById: vetId,
        countryOfOrigin: 'BE',
        foreignOriginId: 'BE-X',
        vetCheckedDocuments: true,
        status: 'CONFIRMED',
      },
    });
  });

  it('attributes the discrepancy to BOTH the owner and the vet who stamped akkoord', async () => {
    const r = await request(app)
      .post('/fraud/report')
      .set('Authorization', `Bearer ${token(buyerId, 'BUYER')}`)
      .send({ chipId: CHIP2, type: 'omgekat_paspoort', description: 'boekje klopt niet' });
    expect(r.status).toBe(201);

    const confirmed = await request(app)
      .post(`/fraud/${r.body.report.id}/confirm`)
      .set('Authorization', `Bearer ${token(vetId, 'VET')}`);
    expect(confirmed.status).toBe(200);
    // Owner is the subject; the vet who checked the import is the co-subject.
    expect(confirmed.body.subjectUserId).toBe(ownerId);
    expect(confirmed.body.coSubjectProfessionalId).toBe(vetId);
  });
});
