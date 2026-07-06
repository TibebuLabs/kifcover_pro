#!/usr/bin/env node
/**
 * Runs `prisma migrate deploy` for every microservice against its own DB.
 * Uses migrate deploy (non-interactive) — safe for CI/CD and automation.
 *
 * Usage (local):  node infrastructure/migrate-all.js
 * Usage (Docker): node infrastructure/migrate-all.js --docker
 *
 * With --docker flag, hostnames use Docker service names (postgres-auth etc.)
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isDocker = process.argv.includes('--docker');
const PG_PASS  = process.env.POSTGRES_PASSWORD || (isDocker ? 'kifcover123' : '13d2144');
const PRISMA   = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const services = [
  { name: 'svc-auth',      db: 'kif_auth' },
  { name: 'svc-users',     db: 'kif_users' },
  { name: 'svc-products',  db: 'kif_products' },
  { name: 'svc-quotes',    db: 'kif_quotes' },
  { name: 'svc-policies',  db: 'kif_policies' },
  { name: 'svc-claims',    db: 'kif_claims' },
  { name: 'svc-payments',  db: 'kif_payments' },
  { name: 'svc-kyc',       db: 'kif_kyc' },
  { name: 'svc-partners',  db: 'kif_partners' },
  { name: 'svc-analytics', db: 'kif_analytics' },
];

let ok = 0, skipped = 0, failed = 0;
const root = path.join(__dirname, '..');

for (const { name, db } of services) {
  const schema = path.join(root, 'apps', name, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schema)) {
    console.log(`⚠️  SKIP ${name} — no prisma/schema.prisma`);
    skipped++;
    continue;
  }

  const host = isDocker ? `postgres-${name.replace('svc-', '')}` : 'localhost';
  const url  = `postgresql://postgres:${PG_PASS}@${host}:5432/${db}`;

  console.log(`\n▶  ${name}  →  ${db}  (${host}:5432)`);
  try {
    execSync(`"${PRISMA}" migrate deploy --schema="${schema}"`, {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'inherit',
    });
    console.log(`✅  ${name}`);
    ok++;
  } catch {
    console.error(`❌  ${name} FAILED`);
    failed++;
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`  Migrations: ${ok} ok  |  ${skipped} skipped  |  ${failed} failed`);
console.log(`═══════════════════════════════════════`);
if (failed > 0) process.exit(1);
