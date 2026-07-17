/**
 * KifCover Pro — Single-DB Seed Script
 * Seeds all data into kifdb via each service's Prisma client.
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:kifcover123@localhost:5432/kifdb" npx ts-node packages/prisma/seed.ts
 *   # or via yarn:
 *   yarn db:seed
 */

import bcrypt from 'bcryptjs'

// Each service has its own generated Prisma client pointing at kifdb
import { PrismaClient as AuthPrisma }     from '../../node_modules/.prisma/svc-auth-client'
import { PrismaClient as CustomerPrisma } from '../../node_modules/.prisma/svc-customer-client'
import { PrismaClient as InsurerPrisma }  from '../../node_modules/.prisma/svc-insurer-client'
import { PrismaClient as PartnerPrisma }  from '../../node_modules/.prisma/svc-partner-client'

const DB = process.env.DATABASE_URL || 'postgresql://postgres:kifcover123@localhost:5432/kifdb'

const authDb     = new AuthPrisma({ datasources: { db: { url: DB } } })
const customerDb = new CustomerPrisma({ datasources: { db: { url: DB } } })
const insurerDb  = new InsurerPrisma({ datasources: { db: { url: DB } } })
const partnerDb  = new PartnerPrisma({ datasources: { db: { url: DB } } })

// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  { email: 'admin@kifcover.et',   firstName: 'KifCover',  lastName: 'Admin',     role: 'PLATFORM_ADMIN'     as const, kycStatus: 'VERIFIED' as const, password: 'Admin@kifcover2024' },
  { email: 'demo@kifcover.et',    firstName: 'Abebe',     lastName: 'Kebede',    role: 'CUSTOMER'           as const, kycStatus: 'PENDING'  as const, password: 'demo123' },
  { email: 'partner@kifcover.et', firstName: 'Acme',      lastName: 'Fintech',   role: 'PARTNER_ADMIN'      as const, kycStatus: 'VERIFIED' as const, password: 'partner123' },
  { email: 'insurer@kifcover.et', firstName: 'EIC',       lastName: 'Insurance', role: 'INSURANCE_PROVIDER' as const, kycStatus: 'VERIFIED' as const, password: 'insurer123' },
  { email: 'verified@test.et',    firstName: 'Tigist',    lastName: 'Haile',     role: 'CUSTOMER'           as const, kycStatus: 'VERIFIED' as const, password: 'test123' },
]

async function seedUsers() {
  console.log('\n👤 Seeding users…')
  const ids: Record<string, string> = {}

  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12)

    // svc-auth owns the credentials (including passwordHash)
    const auth = await authDb.user.upsert({
      where:  { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, role: u.role, kycStatus: u.kycStatus },
      create: { email: u.email, firstName: u.firstName, lastName: u.lastName, passwordHash: hash, role: u.role, kycStatus: u.kycStatus },
    })

    // svc-customer has the same user table (no passwordHash in service, but schema includes it for Prisma model sync)
    await customerDb.user.upsert({
      where:  { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, role: u.role, kycStatus: u.kycStatus },
      create: { id: auth.id, email: u.email, firstName: u.firstName, lastName: u.lastName, passwordHash: hash, role: u.role, kycStatus: u.kycStatus },
    })

    // KYC record for verified users
    if (u.kycStatus === 'VERIFIED') {
      await customerDb.kycRecord.upsert({
        where:  { userId: auth.id },
        update: { status: 'VERIFIED' as any },
        create: { userId: auth.id, status: 'VERIFIED' as any },
      })
    }

    ids[u.email] = auth.id
    console.log(`  ✅ ${u.role.padEnd(20)} ${u.email} / ${u.password}`)
  }
  return ids
}

// ─── Insurance Products ───────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'Auto Comprehensive',   slug: 'auto-comprehensive',
    description: 'Full vehicle protection against accidents, theft, and third-party liability.',
    category: 'AUTO' as const, basePrice: 1200, coverageAmount: 500000, durationDays: 365,
    features:   ['Accident coverage', 'Theft protection', 'Third-party liability', 'Roadside assistance'],
    exclusions: ['Racing', 'DUI incidents'],
    pricingRules: [
      { ruleKey: 'vehicleAge',       operator: 'gt',   value: '5',    multiplier: 0.15 },
      { ruleKey: 'highRiskLocation', operator: 'bool', value: 'true', multiplier: 0.20 },
    ],
  },
  {
    name: 'Health Essential',     slug: 'health-essential',
    description: 'Essential medical coverage for hospitalisation and outpatient care.',
    category: 'HEALTH' as const, basePrice: 800, coverageAmount: 200000, durationDays: 365,
    features:   ['Hospitalisation', 'Emergency care', 'Outpatient visits', 'Prescription drugs'],
    exclusions: ['Cosmetic procedures', 'Pre-existing (year 1)'],
    pricingRules: [
      { ruleKey: 'age',                    operator: 'gt',   value: '50',   multiplier: 0.10 },
      { ruleKey: 'hasPreExistingCondition', operator: 'bool', value: 'true', multiplier: 0.25 },
    ],
  },
  {
    name: 'Travel International', slug: 'travel-international',
    description: 'Comprehensive travel protection for international trips.',
    category: 'TRAVEL' as const, basePrice: 350, coverageAmount: 1000000, durationDays: 30,
    features:   ['Medical evacuation', 'Trip cancellation', 'Baggage loss', '24/7 assistance'],
    exclusions: ['War zones', 'Extreme sports'],
    pricingRules: [
      { ruleKey: 'travelDays', operator: 'gt', value: '14', multiplier: 0.05 },
    ],
  },
  {
    name: 'Gadget Shield',        slug: 'gadget-shield',
    description: 'Protect your smartphone and electronics from damage and theft.',
    category: 'GADGET' as const, basePrice: 200, coverageAmount: 50000, durationDays: 365,
    features:   ['Accidental damage', 'Theft', 'Liquid damage', 'Screen protection'],
    exclusions: ['Intentional damage'],
    pricingRules: [],
  },
  {
    name: 'Life Term 10yr',       slug: 'life-term-10yr',
    description: '10-year term life insurance for financial peace of mind.',
    category: 'LIFE' as const, basePrice: 600, coverageAmount: 1000000, durationDays: 3650,
    features:   ['Death benefit', 'Terminal illness cover', 'Disability rider', 'Premium waiver'],
    exclusions: ['Suicide (year 1)'],
    pricingRules: [
      { ruleKey: 'age',    operator: 'gt',   value: '45',   multiplier: 0.15 },
      { ruleKey: 'smoker', operator: 'bool', value: 'true', multiplier: 0.20 },
    ],
  },
  {
    name: 'Agriculture Crop',     slug: 'agriculture-crop',
    description: 'Crop insurance for smallholder and commercial farmers.',
    category: 'AGRICULTURE' as const, basePrice: 450, coverageAmount: 300000, durationDays: 180,
    features:   ['Drought protection', 'Flood coverage', 'Pest & disease', 'Yield guarantee'],
    exclusions: ['Negligence'],
    pricingRules: [
      { ruleKey: 'floodZone', operator: 'bool', value: 'true', multiplier: 0.25 },
    ],
  },
  {
    name: 'SME Business Shield',  slug: 'sme-business-shield',
    description: 'Comprehensive business insurance for small and medium enterprises.',
    category: 'SME' as const, basePrice: 2500, coverageAmount: 2000000, durationDays: 365,
    features:   ['Property damage', 'Business interruption', 'Liability coverage', 'Employee benefits'],
    exclusions: ['Fraud', 'War & terrorism'],
    pricingRules: [],
  },
]

async function seedProducts() {
  console.log('\n📦 Seeding insurance products…')
  for (const { pricingRules, ...p } of PRODUCTS) {
    const product = await insurerDb.insuranceProduct.upsert({
      where:  { slug: p.slug },
      update: { ...p, features: p.features as any, exclusions: p.exclusions as any, status: 'PUBLISHED', isActive: true },
      create: { ...p, features: p.features as any, exclusions: p.exclusions as any, status: 'PUBLISHED', isActive: true },
    })
    for (const rule of pricingRules) {
      const existing = await insurerDb.pricingRule.findFirst({ where: { productId: product.id, ruleKey: rule.ruleKey } })
      if (!existing) {
        await insurerDb.pricingRule.create({ data: { productId: product.id, ...rule } })
      }
    }
    console.log(`  ✅ ${p.name}`)
  }
}

// ─── Partners ─────────────────────────────────────────────────────────────────

const PARTNERS = [
  { name: 'Acme Fintech',  slug: 'acme-fintech',  webhookUrl: 'https://acme.example.com/webhook',  commissionRate: 0.15 },
  { name: 'RideEt',        slug: 'rideet',         webhookUrl: 'https://rideet.example.com/webhook', commissionRate: 0.12 },
  { name: 'CBE Birr Bank', slug: 'cbe-birr',       webhookUrl: 'https://cbe.example.com/webhook',    commissionRate: 0.10 },
]

async function seedPartners() {
  console.log('\n🤝 Seeding partners…')
  for (const p of PARTNERS) {
    await partnerDb.partner.upsert({
      where:  { slug: p.slug },
      update: { status: 'APPROVED' as any, isActive: true },
      create: { ...p, status: 'APPROVED' as any, isActive: true },
    })
    console.log(`  ✅ ${p.name}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 KifCover Pro — Seeding kifdb\n')
  try {
    await seedUsers()
    await seedProducts()
    await seedPartners()

    console.log('\n🎉 Seed complete!')
    console.log('\nDemo credentials:')
    console.log('  Admin:    admin@kifcover.et   / Admin@kifcover2024')
    console.log('  Customer: demo@kifcover.et    / demo123')
    console.log('  Partner:  partner@kifcover.et / partner123')
    console.log('  Insurer:  insurer@kifcover.et / insurer123')
  } catch (e) {
    console.error('\n❌ Seed failed:', e)
    process.exit(1)
  } finally {
    await Promise.all([
      authDb.$disconnect(),
      customerDb.$disconnect(),
      insurerDb.$disconnect(),
      partnerDb.$disconnect(),
    ])
  }
}

main()
