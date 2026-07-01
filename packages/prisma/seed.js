const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const products = [
  { name: 'Auto Comprehensive', category: 'AUTO', basePrice: 1200, coverageAmount: 500000, durationDays: 365, description: 'Full vehicle protection against accidents, theft, and third-party liability.', features: JSON.stringify(['Accident coverage', 'Theft protection', 'Third-party liability', 'Roadside assistance']) },
  { name: 'Health Basic', category: 'HEALTH', basePrice: 800, coverageAmount: 200000, durationDays: 365, description: 'Essential medical coverage for hospitalisation and outpatient care.', features: JSON.stringify(['Hospitalisation', 'Outpatient visits', 'Emergency care', 'Prescription drugs']) },
  { name: 'Travel International', category: 'TRAVEL', basePrice: 350, coverageAmount: 1000000, durationDays: 30, description: 'Comprehensive travel protection for international trips.', features: JSON.stringify(['Medical evacuation', 'Trip cancellation', 'Baggage loss', '24/7 assistance']) },
  { name: 'Gadget Shield', category: 'GADGET', basePrice: 200, coverageAmount: 50000, durationDays: 365, description: 'Protect your smartphone and electronics from damage and theft.', features: JSON.stringify(['Accidental damage', 'Theft', 'Liquid damage', 'Screen protection']) },
  { name: 'Life Term 10yr', category: 'LIFE', basePrice: 600, coverageAmount: 1000000, durationDays: 3650, description: '10-year term life insurance for financial peace of mind.', features: JSON.stringify(['Death benefit', 'Terminal illness cover', 'Disability rider', 'Premium waiver']) },
  { name: 'Agriculture Crop', category: 'AGRICULTURE', basePrice: 450, coverageAmount: 300000, durationDays: 180, description: 'Crop insurance for smallholder and commercial farmers.', features: JSON.stringify(['Drought protection', 'Flood coverage', 'Pest & disease', 'Yield guarantee']) },
];

async function main() {
  console.log('🌱 Seeding KifCover database...');
  let created = 0;
  for (const p of products) {
    const exists = await prisma.insuranceProduct.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.insuranceProduct.create({ data: p });
      created++;
    }
  }
  console.log(`✅ ${created} products created (${products.length - created} already existed)`);

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
  console.log('✅ Admin user: admin@kifcover.et / Admin@kifcover2024');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
