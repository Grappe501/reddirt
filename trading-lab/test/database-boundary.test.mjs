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
  'production-db-proof.mjs',
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
