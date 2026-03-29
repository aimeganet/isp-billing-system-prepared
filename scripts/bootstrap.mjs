#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envExamplePath = resolve(projectRoot, '.env.example');
const envPath = resolve(projectRoot, '.env');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, inlineValue] = token.slice(2).split('=');
    const nextValue = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
    const key = rawKey.trim();
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    if (nextValue !== undefined) {
      args[key] = nextValue;
      i += 1;
      continue;
    }
    args[key] = true;
  }
  return args;
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return new Map();
  const raw = readFileSync(filePath, 'utf8');
  const envMap = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^"|"$/g, '');
    envMap.set(key, value);
  }
  return envMap;
}

function writeEnvFile(filePath, envMap) {
  const lines = [
    '# Generated / updated by scripts/bootstrap.mjs',
    '',
    `DATABASE_URL="${envMap.get('DATABASE_URL') || 'file:./dev.db'}"`,
    `REMOTE_DATABASE_URL="${envMap.get('REMOTE_DATABASE_URL') || ''}"`,
    '',
    '# Remote sync target. Leave empty to disable online sync.',
    `REMOTE_SYNC_URL="${envMap.get('REMOTE_SYNC_URL') || ''}"`,
    `SYNC_SHARED_SECRET="${envMap.get('SYNC_SHARED_SECRET') || ''}"`,
    `ENABLE_SYNC="${envMap.get('ENABLE_SYNC') || 'false'}"`,
    '',
    '# Auth',
    `AUTH_COOKIE_NAME="${envMap.get('AUTH_COOKIE_NAME') || 'isp_auth_session'}"`,
    `DEFAULT_ADMIN_EMAIL="${envMap.get('DEFAULT_ADMIN_EMAIL') || 'admin@local.test'}"`,
    `DEFAULT_ADMIN_PASSWORD="${envMap.get('DEFAULT_ADMIN_PASSWORD') || 'ChangeMe123!'}"`,
    '',
    '# Settings',
    `USE_PHONE_AS_IDENTIFIER="${envMap.get('USE_PHONE_AS_IDENTIFIER') || 'false'}"`,
    `AUTO_SEND_INVOICES="${envMap.get('AUTO_SEND_INVOICES') || 'false'}"`,
    `ALLOW_MANUAL_SEND="${envMap.get('ALLOW_MANUAL_SEND') || 'true'}"`,
    `REQUIRE_SCREENSHOT_FOR_WALLETS="${envMap.get('REQUIRE_SCREENSHOT_FOR_WALLETS') || 'true'}"`,
    `DEFAULT_MESSAGE_CHANNEL="${envMap.get('DEFAULT_MESSAGE_CHANNEL') || 'WHATSAPP'}"`,
    `DEFAULT_SUBSCRIPTION_DAYS="${envMap.get('DEFAULT_SUBSCRIPTION_DAYS') || '30'}"`,
    `MOCK_MESSAGE_DELIVERY="${envMap.get('MOCK_MESSAGE_DELIVERY') || 'true'}"`,
    '',
    '# Optional messaging credentials',
    `WHATSAPP_API_URL="${envMap.get('WHATSAPP_API_URL') || ''}"`,
    `WHATSAPP_API_TOKEN="${envMap.get('WHATSAPP_API_TOKEN') || ''}"`,
    `TELEGRAM_BOT_TOKEN="${envMap.get('TELEGRAM_BOT_TOKEN') || ''}"`,
    `TELEGRAM_CHAT_API_URL="${envMap.get('TELEGRAM_CHAT_API_URL') || ''}"`,
    '',
  ];
  writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function run(command, args, options = {}) {
  const isWindows = process.platform === 'win32';
  const actualCommand = isWindows && command === 'npm' ? 'npm.cmd' : command;
  console.log(`\n> ${actualCommand} ${args.join(' ')}`);
  const result = spawnSync(actualCommand, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${actualCommand} ${args.join(' ')}`);
  }
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const skipInstall = Boolean(args['skip-install']);
  const skipSeed = Boolean(args['skip-seed']);
  const skipRemoteDb = Boolean(args['skip-remote-db']);

  if (!existsSync(envPath)) {
    writeFileSync(envPath, readFileSync(envExamplePath, 'utf8'), 'utf8');
    console.log('Created .env from .env.example');
  }

  const envMap = readEnvFile(envPath);
  if (!envMap.get('DATABASE_URL')) envMap.set('DATABASE_URL', 'file:./dev.db');
  if (typeof args['remote-db-url'] === 'string') envMap.set('REMOTE_DATABASE_URL', args['remote-db-url']);
  if (typeof args['remote-sync-url'] === 'string') envMap.set('REMOTE_SYNC_URL', args['remote-sync-url']);
  if (typeof args['sync-secret'] === 'string') envMap.set('SYNC_SHARED_SECRET', args['sync-secret']);
  if (args['enable-sync']) envMap.set('ENABLE_SYNC', 'true');
  if (args['disable-sync']) envMap.set('ENABLE_SYNC', 'false');
  if (args['phone-id']) envMap.set('USE_PHONE_AS_IDENTIFIER', 'true');
  if (typeof args['admin-email'] === 'string') envMap.set('DEFAULT_ADMIN_EMAIL', args['admin-email']);
  if (typeof args['admin-password'] === 'string') envMap.set('DEFAULT_ADMIN_PASSWORD', args['admin-password']);
  if (args['random-id']) envMap.set('USE_PHONE_AS_IDENTIFIER', 'false');
  writeEnvFile(envPath, envMap);

  ensureDir(resolve(projectRoot, 'storage'));
  ensureDir(resolve(projectRoot, 'storage', 'imports'));
  ensureDir(resolve(projectRoot, 'storage', 'screenshots'));
  ensureDir(resolve(projectRoot, 'storage', 'tmp'));
  ensureDir(resolve(projectRoot, 'public'));

  if (!skipInstall) {
    run('npm', ['install']);
  } else {
    console.log('\nSkipping npm install because --skip-install was used.');
  }

  run('npm', ['run', 'db:generate']);
  run('npm', ['run', 'db:push']);

  if (!skipSeed) {
    run('npm', ['run', 'db:seed']);
  } else {
    console.log('\nSkipping seed because --skip-seed was used.');
  }

  const remoteDbUrl = envMap.get('REMOTE_DATABASE_URL');
  if (remoteDbUrl && !skipRemoteDb) {
    run('node', ['scripts/prisma-remote.mjs', 'push']);
  } else if (!remoteDbUrl) {
    console.log('\nNo REMOTE_DATABASE_URL configured; skipping remote database initialization.');
  } else {
    console.log('\nSkipping remote database initialization because --skip-remote-db was used.');
  }

  console.log('\nBootstrap complete.');
  console.log('Next steps:');
  console.log('1) Review .env and fill any optional messaging values.');
  console.log('2) Start the app with: npm run dev');
  console.log('3) Open http://localhost:3000');
}

main();
