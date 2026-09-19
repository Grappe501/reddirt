import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const functionsDir = join(root, 'netlify', 'functions');
const durableFunctions = [
  'market-memory-ingest.mjs',
  'market-memory-status.mjs',
  'market-memory-analogues.mjs',
  'market-memory-outcomes.mjs',
  'learning-cycle.mjs',
  'learning-history.mjs',
  'calibration-cycle.mjs',
  'calibration-history.mjs',
  'production-db-proof.mjs',
  'production-write-proof.mjs',
];

const forbidden = [
  /process\.env\.(?:DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL)/,
  /NEXT_PUBLIC_MARKETLAB_SUPABASE_URL/,
  /@supabase\//,
  /createClient\s*\(/,
];

test('all durable Trading Lab functions use the shared Netlify Database adapter', async () => {
  for (const name of durableFunctions) {
    const source = await readFile(join(functionsDir, name), 'utf8');
    assert.match(source, /from ['"]\.\.\/lib\/database\.mjs['"]/, `${name} must import the shared database adapter`);
    assert.match(source, /getTradingLabDatabase\s*\(/, `${name} must obtain its database through getTradingLabDatabase()`);
    assert.doesNotMatch(source, /from ['"]@netlify\/database['"]/, `${name} must not call @netlify/database directly`);
    assert.doesNotMatch(source, /export async function handler\b/, `${name} must not export a Lambda-compat handler`);
    assert.match(source, /export default asNetlifyFunction\(handleRequest\)/, `${name} must deploy as a modern Netlify Function`);
  }
});

test('Trading Lab functions never fall back to campaign/Supabase connection strings', async () => {
  const names = (await readdir(functionsDir)).filter((name) => name.endsWith('.mjs'));
  for (const name of names) {
    const source = await readFile(join(functionsDir, name), 'utf8');
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${name} violates the Trading Lab database boundary`);
  }
});

test('environment template documents connectionless Netlify Database boundary', async () => {
  const source = await readFile(join(root, '.env.example'), 'utf8');
  assert.match(source, /@netlify\/database/);
  assert.doesNotMatch(source, /^\s*(?:DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL|NETLIFY_DB_URL)\s*=/m);
});

test('Netlify Database migrations use the official number_slug names', async () => {
  const migrationsDir = join(root, 'netlify', 'database', 'migrations');
  const names = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(names, [
    '001_market-memory',
    '002_learning-ledger',
    '003_strategy-lineage',
    '004_calibration',
    '005_multi-agent-research-store',
    '006_agent-career-ledger',
  ]);
  for (const name of names) {
    assert.match(name, /^\d+_[a-z0-9_-]+$/, `${name} is not a valid Netlify Database migration name`);
    await readFile(join(migrationsDir, name, 'migration.sql'), 'utf8');
  }
});

test('required production tables are declared in Netlify migrations', async () => {
  const { REQUIRED_TABLES } = await import('../netlify/functions/production-db-proof.mjs');
  const migrationsDir = join(root, 'netlify', 'database', 'migrations');
  const names = (await readdir(migrationsDir)).filter((name) => !name.startsWith('.'));
  let sql = '';
  for (const name of names) {
    sql += await readFile(join(migrationsDir, name, 'migration.sql'), 'utf8');
  }
  for (const table of REQUIRED_TABLES) {
    assert.match(sql, new RegExp(`trading_lab\\.${table}\\b`), `${table} must be created by a Netlify Database migration`);
  }
});

test('migrations do not use unquoted PostgreSQL reserved role keywords', async () => {
  const migrationsDir = join(root, 'netlify', 'database', 'migrations');
  const names = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  let sql = '';
  for (const name of names) {
    sql += await readFile(join(migrationsDir, name, 'migration.sql'), 'utf8');
  }
  const withoutComments = sql.replace(/--[^\n]*/g, '');
  assert.doesNotMatch(withoutComments, /(?<!")\bcurrent_role\b(?!")/i);
  assert.doesNotMatch(withoutComments, /(?<!")\bcurrent_user\b(?!")/i);
  assert.doesNotMatch(withoutComments, /(?<!")\bsession_user\b(?!")/i);
});
