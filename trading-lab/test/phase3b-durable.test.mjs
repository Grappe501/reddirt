import test from 'node:test';
import assert from 'node:assert/strict';
import { createDurableSyncState, buildDurableBatch, acknowledgeDurableBatch } from '../src/durable-memory.js';
import { durableMemoryConfig, validateMemoryBatch } from '../netlify/functions/market-memory-ingest.mjs';

test('durable batch mirrors normalized browser collections', () => {
  const state = createDurableSyncState();
  const memory = { observations: [{ id: 'o1' }], regimes: [], decisions: [{ id: 'd1' }], trades: [], experimentRuns: [], sourceHealth: [] };
  const batch = buildDurableBatch(memory, state);
  assert.equal(batch.schema, 'reddirt-trading-lab-market-memory-v1');
  assert.equal(batch.collections.observations.length, 1);
  assert.equal(batch.collections.decisions.length, 1);
  acknowledgeDurableBatch(state, batch);
  assert.equal(buildDurableBatch(memory, state).collections.observations.length, 0);
});

test('durable ingest validates schema and bounded collections', () => {
  const valid = validateMemoryBatch({ schema: 'reddirt-trading-lab-market-memory-v1', collections: { observations: [], regimes: [], decisions: [], trades: [], experimentRuns: [], sourceHealth: [] } });
  assert.deepEqual(valid, { ok: true, count: 0 });
  assert.equal(validateMemoryBatch({ schema: 'wrong', collections: {} }).ok, false);
});

test('durable memory targets branch-aware Netlify Database without manual connection strings', () => {
  const config = durableMemoryConfig();
  assert.equal(config.configured, true);
  assert.equal(config.target, 'netlify-database');
  assert.equal(config.branchAware, true);
});

test('durable ingest keeps batch limits fail-closed', () => {
  const observations = Array.from({ length: 251 }, (_, i) => ({ id: `o${i}` }));
  const result = validateMemoryBatch({ schema: 'reddirt-trading-lab-market-memory-v1', collections: { observations, regimes: [], decisions: [], trades: [], experimentRuns: [], sourceHealth: [] } });
  assert.equal(result.ok, false);
  assert.match(result.message, /250-row/);
});
