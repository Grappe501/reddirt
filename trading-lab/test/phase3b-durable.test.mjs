import test from 'node:test';
import assert from 'node:assert/strict';
import { createDurableSyncState, buildDurableBatch, acknowledgeDurableBatch } from '../src/durable-memory.js';
import { durableMemoryConfig, validateMemoryBatch, handler } from '../netlify/functions/market-memory-ingest.mjs';

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

test('durable database is isolated behind its own environment variable', () => {
  assert.equal(durableMemoryConfig({ DATABASE_URL: 'campaign-db' }).configured, false);
  assert.equal(durableMemoryConfig({ TRADING_LAB_DATABASE_URL: 'dedicated-db' }).configured, true);
});

test('ingest endpoint fails closed before dedicated database is configured', async () => {
  const prior = process.env.TRADING_LAB_DATABASE_URL;
  delete process.env.TRADING_LAB_DATABASE_URL;
  try {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ schema: 'reddirt-trading-lab-market-memory-v1', collections: { observations: [], regimes: [], decisions: [], trades: [], experimentRuns: [], sourceHealth: [] } }) });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 503);
    assert.equal(body.configured, false);
    assert.equal(body.ordersEnabled, false);
  } finally {
    if (prior === undefined) delete process.env.TRADING_LAB_DATABASE_URL; else process.env.TRADING_LAB_DATABASE_URL = prior;
  }
});
