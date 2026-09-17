import test from 'node:test';
import assert from 'node:assert/strict';
import { WRITE_PROOF_IDS, runProductionWriteProof } from '../netlify/lib/write-proof.mjs';
import { handleRequest, sanitizePublicProof } from '../netlify/functions/production-write-proof.mjs';
import { handleRequest as calibrationHistory } from '../netlify/functions/calibration-history.mjs';

function createFakeDb() {
  const ids = new Set();
  const client = {
    query: async (sql, params = []) => {
      const text = String(sql);
      if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
      if (/insert into trading_lab\.market_observations/i.test(text)) ids.add(`obs:${params[0]}`);
      if (/insert into trading_lab\.learning_cycles/i.test(text)) ids.add(`learn:${params[0]}`);
      if (/insert into trading_lab\.calibration_cycles/i.test(text)) ids.add(`cal:${params[0]}`);
      if (/from trading_lab\.market_observations where id=\$1/i.test(text)) {
        return { rows: [{ present: ids.has(`obs:${params[0]}`) }] };
      }
      if (/from trading_lab\.learning_cycles where id=\$1/i.test(text)) {
        return { rows: [{ present: ids.has(`learn:${params[0]}`) }] };
      }
      if (/from trading_lab\.calibration_cycles where id=\$1/i.test(text)) {
        return { rows: [{ present: ids.has(`cal:${params[0]}`) }] };
      }
      return { rows: [] };
    },
    release() {},
  };
  return {
    pool: {
      connect: async () => client,
      query: client.query,
    },
  };
}

test('write proof is POST-only and never enables orders', async () => {
  const denied = JSON.parse((await handleRequest({ httpMethod: 'GET' })).body);
  assert.equal(denied.ok, false);
  assert.equal(denied.ordersEnabled, false);
  assert.match(denied.message, /POST required/i);
});

test('write proof persists market memory, learning, and calibration then reads them back', async () => {
  const proof = await runProductionWriteProof(createFakeDb());
  assert.equal(proof.ok, true);
  assert.equal(proof.ordersEnabled, false);
  assert.equal(proof.marketMemoryWriteVisible, true);
  assert.equal(proof.learningCyclePersisted, true);
  assert.equal(proof.calibrationCyclePersisted, true);
  assert.equal(proof.proofIds.observation, WRITE_PROOF_IDS.observation);
  assert.equal(proof.proofIds.learning, WRITE_PROOF_IDS.learning);
  assert.equal(proof.proofIds.calibration, WRITE_PROOF_IDS.calibration);
});

test('write proof response cannot leak connection secrets', () => {
  const leaked = sanitizePublicProof({
    ok: true,
    ordersEnabled: false,
    connectionString: 'postgres://user:pass@host/db',
    password: 'secret',
    host: 'db.internal',
    marketMemoryWriteVisible: true,
  });
  assert.equal('connectionString' in leaked, false);
  assert.equal('password' in leaked, false);
  assert.equal('host' in leaked, false);
  assert.equal(leaked.ordersEnabled, false);
  assert.equal(leaked.marketMemoryWriteVisible, true);
});

test('calibration history is GET-only and keeps orders disabled', async () => {
  const denied = JSON.parse((await calibrationHistory({ httpMethod: 'POST' })).body);
  assert.equal(denied.ok, false);
  assert.equal(denied.ordersEnabled, false);
  assert.match(denied.message, /GET required/i);
});
