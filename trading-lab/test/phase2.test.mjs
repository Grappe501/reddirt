import test from 'node:test';
import assert from 'node:assert/strict';

import { cleanFeed, cleanSymbols, providerConfig } from '../netlify/functions/provider.mjs';
import { handler as healthHandler } from '../netlify/functions/market-health.mjs';
import { makeSyntheticSeries } from '../src/data/historical.js';

test('synthetic replay models a 390-minute regular session', () => {
  const bars = makeSyntheticSeries('SPY');
  assert.equal(bars.length, 390);
  assert.equal(bars[0].time, '09:30');
  assert.equal(bars.at(-1).time, '15:59');
});

test('market symbol allowlist removes unsupported and duplicate symbols', () => {
  assert.deepEqual(cleanSymbols('spy,QQQ,spy,TSLA,NVDA,FAKE'), ['SPY', 'QQQ', 'TSLA', 'NVDA']);
});

test('invalid feed falls back to IEX', () => {
  assert.equal(cleanFeed('not-a-feed'), 'iex');
});

test('provider config never needs to expose secrets to describe readiness', () => {
  const config = providerConfig({ ALPACA_KEY_ID: 'key', ALPACA_SECRET_KEY: 'secret', ALPACA_DATA_FEED: 'iex' });
  assert.equal(config.configured, true);
  assert.equal(config.provider, 'alpaca');
  assert.equal(config.feed, 'iex');
});

test('health endpoint fails safely when credentials are missing', async () => {
  const priorKey = process.env.ALPACA_KEY_ID;
  const priorSecret = process.env.ALPACA_SECRET_KEY;
  delete process.env.ALPACA_KEY_ID;
  delete process.env.ALPACA_SECRET_KEY;

  try {
    const response = await healthHandler({ queryStringParameters: { probe: '0' } });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 503);
    assert.equal(body.configured, false);
    assert.equal(body.ordersEnabled, false);
    assert.equal('key' in body, false);
    assert.equal('secret' in body, false);
  } finally {
    if (priorKey === undefined) delete process.env.ALPACA_KEY_ID; else process.env.ALPACA_KEY_ID = priorKey;
    if (priorSecret === undefined) delete process.env.ALPACA_SECRET_KEY; else process.env.ALPACA_SECRET_KEY = priorSecret;
  }
});
