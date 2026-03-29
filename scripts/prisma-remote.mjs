#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envPath = resolve(projectRoot, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    throw new Error('.env not found. Run bootstrap first or copy .env.example to .env.');
  }

  const env = {};
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^"|"$/g, '');
    env[key] = value;
  }
  return env;
}

function runPrisma(args, env) {
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['prisma', ...args], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: env.REMOTE_DATABASE_URL,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Remote Prisma command failed: prisma ${args.join(' ')}`);
  }
}

function main() {
  const action = process.argv[2] || 'push';
  const env = loadEnv();

  if (!env.REMOTE_DATABASE_URL) {
    throw new Error('REMOTE_DATABASE_URL is empty in .env. Configure it first.');
  }

  if (action === 'push') {
    runPrisma(['db', 'push', '--schema', 'prisma/schema.postgres.prisma'], env);
    return;
  }

  if (action === 'generate') {
    runPrisma(['generate', '--schema', 'prisma/schema.postgres.prisma'], env);
    return;
  }

  throw new Error(`Unsupported action: ${action}. Use "push" or "generate".`);
}

main();
