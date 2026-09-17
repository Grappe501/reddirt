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
];

const forbidden = [
  /process\.env\.(?:DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL)/,
  /NEXT_PUBLIC_MARKETLAB_SUPABASE_URL/,
  /@supabase\//,
  /createClient\s*\(/,
];

test('all durable Trading Lab functions use Netlify Database', async () => {
  for (const name of durableFunctions) {
    const source = await readFile(join(functionsDir, name), 'utf8');
    assert.match(source, /from ['"]@netlify\/database['"]/, `${name} must import @netlify/database`);
    assert.match(source, /getDatabase\s*\(/, `${name} must obtain its database through getDatabase()`);
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
  assert.doesNotMatch(source, /^\s*(?:DATABASE_URL|DIRECT_URL|TRADING_LAB_DATABASE_URL)\s*=/m);
});
