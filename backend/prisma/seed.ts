import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idsee.nl' },
    update: {},
    create: {
      email: 'admin@idsee.nl',
      passwordHash: adminPassword,
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
      credits: 9999,
    },
  });
  console.log('Created admin:', admin.email);

  // Create test breeder
  const breederPassword = await bcrypt.hash('fokker123', 12);
  const breeder = await prisma.user.upsert({
    where: { email: 'fokker@test.nl' },
    update: {},
    create: {
      email: 'fokker@test.nl',
      passwordHash: breederPassword,
      role: 'BREEDER',
      professionalId: 'KVK-12345678',
      verificationStatus: 'VERIFIED',
      credits: 50,
    },
  });
  console.log('Created breeder:', breeder.email);

  // Create test vet
  const vetPassword = await bcrypt.hash('dierenarts123', 12);
  const vet = await prisma.user.upsert({
    where: { email: 'vet@test.nl' },
    update: {},
    create: {
      email: 'vet@test.nl',
      passwordHash: vetPassword,
      role: 'VET',
      professionalId: 'BIG-99123456789',
      verificationStatus: 'VERIFIED',
      credits: 100,
    },
  });
  console.log('Created vet:', vet.email);

  // Create test chipper (verified)
  const chipperPassword = await bcrypt.hash('chipper123', 12);
  const chipper = await prisma.user.upsert({
    where: { email: 'chipper@test.nl' },
    update: {},
    create: {
      email: 'chipper@test.nl',
      passwordHash: chipperPassword,
      role: 'CHIPPER',
      professionalId: 'NVWA-2024-001',
      verificationStatus: 'VERIFIED',
      credits: 50,
    },
  });
  console.log('Created chipper:', chipper.email);

  // Create test animals with demo hashes
  const demoAnimals = [
    {
      chipIdHash: 'demo_528140000123456',
      species: 'dog',
      breed: 'Labrador Retriever',
      birthDate: new Date('2024-03-15'),
    },
    {
      chipIdHash: 'demo_528140000234567',
      species: 'dog',
      breed: 'Golden Retriever',
      birthDate: new Date('2024-05-20'),
      motherChipHash: 'demo_528140000111111',
    },
    {
      chipIdHash: 'demo_528140000345678',
      species: 'cat',
      breed: 'Maine Coon',
      birthDate: new Date('2024-01-10'),
    },
  ];

  for (const animalData of demoAnimals) {
    const animal = await prisma.animal.upsert({
      where: { chipIdHash: animalData.chipIdHash },
      update: {},
      create: animalData,
    });

    // Create confirmed registration
    await prisma.registration.upsert({
      where: {
        id: `reg-${animal.chipIdHash}`,
      },
      update: {},
      create: {
        id: `reg-${animal.chipIdHash}`,
        userId: breeder.id,
        animalId: animal.id,
        dataHash: `hash_${animal.chipIdHash}`,
        txHash: `demo_tx_${animal.chipIdHash}`,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    console.log('Created animal:', animal.species, animal.breed);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
