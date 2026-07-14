#!/usr/bin/env node
// Thin JS wrapper — delegates to the TypeScript seed script
const { execSync } = require('child_process')
const path = require('path')

const tsNode = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'ts-node')
const seedFile = path.join(__dirname, 'seed.ts')

execSync(`"${tsNode}" "${seedFile}"`, {
  stdio: 'inherit',
  env: { ...process.env },
})
