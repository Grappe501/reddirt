import test from 'node:test';
import assert from 'node:assert/strict';
import { liveShadowEvidence, MIN_LIVE_SHADOW_OBSERVATIONS } from '../src/live-shadow.js';
import { sessionProofs } from '../src/release-proof.js';

const liveRows = Array.from({ length: MIN_LIVE_SHADOW_OBSERVATIONS }, (_, i) => ({
  mode: 'LIVE',
  symbol: 'SPY',
  providerTime: new Date(Date.UTC(2026, 8, 17, 14, i)).toISOString(),
  price: 500 + i,
}));

test('live shadow stays closed without credentials or LIVE observations', () => {
  const missing = liveShadowEvidence({ health: { configured: false, ordersEnabled: false }, observations: [] });
  assert.equal(missing.ok, false);
  assert.match(missing.detail, /not configured/i);
  const replayOnly = liveShadowEvidence({
    health: { configured: true, providerReachable: true, ordersEnabled: false },
    observations: [{ mode: 'REPLAY', symbol: 'SPY', providerTime: '09:30', price: 100 }],
  });
  assert.equal(replayOnly.ok, false);
});

test('live shadow opens only after a fictional live snapshot', () => {
  const r = liveShadowEvidence({
    health: { configured: true, providerReachable: true, ordersEnabled: false },
    observations: liveRows,
  });
  assert.equal(r.ok, true);
  assert.equal(r.observationCount, MIN_LIVE_SHADOW_OBSERVATIONS);
  const proofs = sessionProofs({ liveShadow: r });
  assert.equal(proofs.liveShadow, true);
});

test('live shadow cannot pass when orders are enabled', () => {
  const r = liveShadowEvidence({
    health: { configured: true, providerReachable: true, ordersEnabled: true },
    observations: liveRows,
  });
  assert.equal(r.ok, false);
  assert.equal(sessionProofs({ liveShadow: r }).liveShadow, false);
});
