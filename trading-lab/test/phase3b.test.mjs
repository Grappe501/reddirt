import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarketMemory, recordObservation, computeBreadth, classifyRegime, memorySummary } from '../src/market-memory.js';
import { normalizeProviderTime } from '../src/data/historical.js';

test('market memory deduplicates observations and preserves dual timestamps', () => {
  const memory = createMarketMemory({ maxObservations: 10 });
  const observation = { mode: 'LIVE', symbol: 'SPY', providerTime: '2026-09-16T20:00:00Z', ingestedAt: '2026-09-16T20:00:01Z', price: 600, score: 72, features: { momentum20: 0.01 } };
  assert.equal(recordObservation(memory, observation), true);
  assert.equal(recordObservation(memory, observation), false);
  assert.equal(memory.observations.length, 1);
  assert.equal(memory.observations[0].providerTime, observation.providerTime);
  assert.equal(memory.observations[0].ingestedAt, observation.ingestedAt);
});

test('breadth measures participation and ranks leaders', () => {
  const items = [
    { symbol: 'SPY', price: 101, signal: { ready: true, score: 80, features: { vwap: 100, sma20: 99, momentum5: .01 } } },
    { symbol: 'QQQ', price: 99, signal: { ready: true, score: 40, features: { vwap: 100, sma20: 100, momentum5: -.01 } } },
    { symbol: 'XLK', price: 102, signal: { ready: true, score: 70, features: { vwap: 101, sma20: 100, momentum5: .005 } } },
  ];
  const breadth = computeBreadth(items);
  assert.equal(breadth.count, 3);
  assert.equal(breadth.aboveVwapPct, 2 / 3);
  assert.equal(breadth.aboveSma20Pct, 2 / 3);
  assert.equal(breadth.leaders[0].symbol, 'SPY');
});

test('regime classification combines benchmark and participation', () => {
  const benchmarkSignal = { ready: true, features: { momentum20: .01, realizedVolatility: .005 } };
  const breadth = { ready: true, aboveSma20Pct: .75 };
  assert.equal(classifyRegime({ benchmarkSignal, breadth }), 'TRENDING_RISK_ON');
});

test('summary reports accumulated institutional memory', () => {
  const memory = createMarketMemory();
  recordObservation(memory, { mode: 'REPLAY', symbol: 'SPY', providerTime: '09:30', price: 100 });
  recordObservation(memory, { mode: 'REPLAY', symbol: 'QQQ', providerTime: '09:30', price: 200 });
  assert.deepEqual(memorySummary(memory).symbols, 2);
  assert.equal(memorySummary(memory).observations, 2);
  assert.equal(memory.observations[0].providerTime, normalizeProviderTime('09:30'));
  assert.ok(Number.isFinite(Date.parse(memory.observations[0].providerTime)));
});
