import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhase3BRuntime } from '../src/phase3b-runtime.js';

function fakeStorage() {
  const map = new Map();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k) };
}

test('runtime captures synchronized observations and breadth', () => {
  const runtime = createPhase3BRuntime({ storage: fakeStorage() });
  const signals = {
    SPY: { ready: true, score: 75, action: 'BUY', features: { vwap: 99, sma20: 98, momentum5: .01, momentum20: .01, realizedVolatility: .004 } },
    QQQ: { ready: true, score: 65, action: 'WAIT', features: { vwap: 199, sma20: 198, momentum5: .005, momentum20: .008, realizedVolatility: .005 } },
  };
  runtime.captureMarket({ mode: 'REPLAY', symbols: ['SPY','QQQ'], signalFor: (s) => signals[s], priceFor: (s) => s === 'SPY' ? 100 : 200, quoteFor: () => ({}), providerTimeFor: () => '10:00' });
  const status = runtime.status();
  assert.equal(status.observations, 2);
  assert.equal(status.symbols, 2);
  assert.equal(status.breadth.aboveVwapPct, 1);
  assert.equal(status.regime, 'TRENDING_RISK_ON');
});

test('runtime persists decisions and fictional trades', () => {
  const runtime = createPhase3BRuntime({ storage: fakeStorage() });
  runtime.decision({ actor: 'HUMAN', symbol: 'SPY', providerTime: '10:01', action: 'BUY', score: 72 });
  runtime.trade({ actor: 'HUMAN', symbol: 'SPY', providerTime: '10:01', side: 'BUY', price: 100, shares: 2 });
  assert.equal(runtime.status().decisions, 1);
  assert.equal(runtime.status().trades, 1);
  assert.match(runtime.exportJson(), /reddirt-trading-lab-market-memory-v1/);
});
