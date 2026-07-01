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
const PG_HOST  = isDocker ? 'postgres-{db}' : 'localhost';
const PG_PASS  = process.env.POSTGRES_PASSWORD || 'kifcover123';
const PRISMA   = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const services = [
  { name: 'svc-auth',      db: 'kif_auth',      port: isDocker ? 5432 : 5432 },
  { name: 'svc-users',     db: 'kif_users',     port: isDocker ? 5432 : 5433 },
  { name: 'svc-products',  db: 'kif_products',  port: isDocker ? 5432 : 5434 },
  { name: 'svc-quotes',    db: 'kif_quotes',    port: isDocker ? 5432 : 5435 },
  { name: 'svc-policies',  db: 'kif_policies',  port: isDocker ? 5432 : 5436 },
  { name: 'svc-claims',    db: 'kif_claims',    port: isDocker ? 5432 : 5437 },
  { name: 'svc-payments',  db: 'kif_payments',  port: isDocker ? 5432 : 5438 },
  { name: 'svc-kyc',       db: 'kif_kyc',       port: isDocker ? 5432 : 5439 },
  { name: 'svc-partners',  db: 'kif_partners',  port: isDocker ? 5432 : 5440 },
  { name: 'svc-analytics', db: 'kif_analytics', port: isDocker ? 5432 : 5441 },
];

let ok = 0, skipped = 0, failed = 0;
const root = path.join(__dirname, '..');

for (const { name, db, port } of services) {
  const schema = path.join(root, 'apps', name, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schema)) {
    console.log(`⚠️  SKIP ${name} — no prisma/schema.prisma`);
    skipped++;
    continue;
  }

  const host = isDocker ? `postgres-${name.replace('svc-', '')}` : 'localhost';
  const url  = `postgresql://postgres:${PG_PASS}@${host}:${port}/${db}`;

  console.log(`\n▶  ${name}  →  ${db}  (${host}:${port})`);
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
