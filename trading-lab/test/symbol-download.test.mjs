import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSymbolSnapshot, downloadSymbolSnapshot, symbolSnapshotFilename } from '../src/symbol-download.js';

test('every symbol snapshot stays fictional and named for download', () => {
  const snapshot = buildSymbolSnapshot({
    symbol: 'NVDA',
    mode: 'LIVE',
    price: 214.13,
    providerTime: '2026-09-17T18:26:00.000Z',
    bars: [{ time: '2026-09-17T18:25:00.000Z', close: 214 }],
    signal: { action: 'BUY', score: 68 },
  });
  assert.equal(snapshot.ordersEnabled, false);
  assert.equal(snapshot.fictionalOnly, true);
  assert.equal(snapshot.symbol, 'NVDA');
  assert.equal(symbolSnapshotFilename(snapshot), 'trading-lab-NVDA-live.json');
});

test('symbol download refuses live-money payloads', () => {
  assert.throws(() => downloadSymbolSnapshot({ symbol: 'SPY', ordersEnabled: true }), /live-money/i);
});
