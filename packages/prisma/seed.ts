import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KifCover database...');

  // Seed insurance products
  const products = [
    {
      name: 'Auto Comprehensive',
      category: 'AUTO' as const,
      basePrice: 1200,
      coverageAmount: 500000,
      durationDays: 365,
      description: 'Full vehicle protection against accidents, theft, and third-party liability.',
      features: JSON.stringify(['Accident coverage', 'Theft protection', 'Third-party liability', 'Roadside assistance']),
    },
    {
      name: 'Health Basic',
      category: 'HEALTH' as const,
      basePrice: 800,
      coverageAmount: 200000,
      durationDays: 365,
      description: 'Essential medical coverage for hospitalisation and outpatient care.',
      features: JSON.stringify(['Hospitalisation', 'Outpatient visits', 'Emergency care', 'Prescription drugs']),
    },
    {
      name: 'Travel International',
      category: 'TRAVEL' as const,
      basePrice: 350,
      coverageAmount: 1000000,
      durationDays: 30,
      description: 'Comprehensive travel protection for international trips.',
      features: JSON.stringify(['Medical evacuation', 'Trip cancellation', 'Baggage loss', '24/7 assistance']),
    },
    {
      name: 'Gadget Shield',
      category: 'GADGET' as const,
      basePrice: 200,
      coverageAmount: 50000,
      durationDays: 365,
      description: 'Protect your smartphone and electronics from damage and theft.',
      features: JSON.stringify(['Accidental damage', 'Theft', 'Liquid damage', 'Screen protection']),
    },
    {
      name: 'Life Term 10yr',
      category: 'LIFE' as const,
      basePrice: 600,
      coverageAmount: 1000000,
      durationDays: 3650,
      description: '10-year term life insurance for financial peace of mind.',
      features: JSON.stringify(['Death benefit', 'Terminal illness cover', 'Disability rider', 'Premium waiver']),
    },
    {
      name: 'Agriculture Crop',
      category: 'AGRICULTURE' as const,
      basePrice: 450,
      coverageAmount: 300000,
      durationDays: 180,
      description: 'Crop insurance for smallholder and commercial farmers.',
      features: JSON.stringify(['Drought protection', 'Flood coverage', 'Pest & disease', 'Yield guarantee']),
    },
  ];

  for (const p of products) {
    await prisma.insuranceProduct.upsert({
      where: { id: p.name }, // not ideal but works for seeding
      update: {},
      create: p as any,
    });
  }

  console.log(`✅ Seeded ${products.length} insurance products`);

  // Seed a demo platform admin
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.hash('Admin@kifcover2024', 12);

  await prisma.user.upsert({
    where: { email: 'admin@kifcover.et' },
    update: {},
    create: {
      email: 'admin@kifcover.et',
      firstName: 'KifCover',
      lastName: 'Admin',
      passwordHash: hash,
      role: 'PLATFORM_ADMIN',
      kycStatus: 'VERIFIED',
    },
  });

  console.log('✅ Seeded admin user: admin@kifcover.et / Admin@kifcover2024');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
