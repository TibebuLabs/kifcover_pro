#!/usr/bin/env node
/**
 * KifCover Pro — Single-DB Migration Runner
 *
 * All 5 services share ONE PostgreSQL database: kifdb
 * Each service has its own prisma/schema.prisma pointing to the same DB.
 *
 * Usage:
 *   node infrastructure/migrate-all.js            # local dev
 *   node infrastructure/migrate-all.js --docker   # inside Docker
 */
const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const isDocker = process.argv.includes('--docker');
const PG_PASS  = process.env.POSTGRES_PASSWORD || 'kifcover123';
const PG_USER  = process.env.POSTGRES_USER     || 'postgres';
const HOST     = isDocker ? 'postgres' : 'localhost';
const PORT     = process.env.POSTGRES_PORT || 5432;
const DB       = 'kifdb';
const PRISMA   = path.join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const DATABASE_URL = `postgresql://${PG_USER}:${PG_PASS}@${HOST}:${PORT}/${DB}`;

// The 5 services, each with a separate Prisma schema that all target kifdb
const services = [
  'svc-auth',
  'svc-customer',
  'svc-insurer',
  'svc-partner',
  'svc-admin',
];

let ok = 0, skipped = 0, failed = 0;
const root = path.join(__dirname, '..');

console.log(`\n🔄  KifCover DB Migration — target: ${DB} @ ${HOST}:${PORT}\n`);

for (const name of services) {
  const schema = path.join(root, 'apps', name, 'prisma', 'schema.prisma');

  if (!fs.existsSync(schema)) {
    console.log(`⚠️  SKIP ${name} — prisma/schema.prisma not found`);
    skipped++;
    continue;
  }

  console.log(`▶  ${name}  →  ${DB}`);
  try {
    execSync(`"${PRISMA}" migrate deploy --schema="${schema}"`, {
      env: { ...process.env, DATABASE_URL },
      stdio: 'inherit',
    });
    console.log(`✅  ${name}\n`);
    ok++;
  } catch {
    console.error(`❌  ${name} FAILED\n`);
    failed++;
  }
}

console.log('═'.repeat(50));
console.log(`  Results: ${ok} ok  |  ${skipped} skipped  |  ${failed} failed`);
console.log('═'.repeat(50));
if (failed > 0) process.exit(1);
