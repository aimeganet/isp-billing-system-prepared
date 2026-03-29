#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const checks = [
  { label: '.env file', path: '.env' },
  { label: 'Prisma schema (local)', path: 'prisma/schema.prisma' },
  { label: 'Prisma schema (remote)', path: 'prisma/schema.postgres.prisma' },
  { label: 'Storage directory', path: 'storage' },
  { label: 'README', path: 'README.md' },
  { label: 'Agent handoff prompt', path: 'docs/04-AGENT-CONTINUATION-PROMPT.md' },
];

console.log('Project doctor report\n');
for (const check of checks) {
  const ok = existsSync(resolve(projectRoot, check.path));
  console.log(`${ok ? 'OK' : 'MISSING'}  ${check.label}`);
}

const envPath = resolve(projectRoot, '.env');
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf8');
  console.log('\nEnv preview:');
  for (const key of ['DATABASE_URL', 'REMOTE_DATABASE_URL', 'ENABLE_SYNC', 'REMOTE_SYNC_URL']) {
    const match = raw.match(new RegExp(`^${key}="?(.*)"?$`, 'm'));
    console.log(`- ${key}: ${match ? match[1] : '(not set)'}`);
  }
}
