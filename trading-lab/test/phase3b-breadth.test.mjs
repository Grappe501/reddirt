import test from 'node:test';
import assert from 'node:assert/strict';
import { BREADTH_SYMBOLS, cleanSymbols } from '../netlify/functions/provider.mjs';
import { CORE_UNIVERSE, INDEX_UNIVERSE, SECTOR_UNIVERSE, LIVE_UNIVERSE, universeTier, prioritizedSeedSymbols } from '../src/market-universe.js';

test('live breadth universe contains 25 unique supported symbols', () => {
  assert.equal(BREADTH_SYMBOLS.length, 25);
  assert.equal(new Set(BREADTH_SYMBOLS).size, 25);
  assert.deepEqual(LIVE_UNIVERSE, BREADTH_SYMBOLS);
});

test('provider accepts expanded sector and large-cap symbols but rejects unknowns', () => {
  assert.deepEqual(cleanSymbols('SPY,XLK,MSFT,FAKE,XLK'), ['SPY', 'XLK', 'MSFT']);
});

test('universe tiers keep core, index and sector roles explicit', () => {
  assert.ok(CORE_UNIVERSE.includes('SPY'));
  assert.ok(INDEX_UNIVERSE.includes('IWM'));
  assert.ok(SECTOR_UNIVERSE.includes('XLF'));
  assert.equal(universeTier('SPY'), 'CORE');
  assert.equal(universeTier('IWM'), 'INDEX');
  assert.equal(universeTier('XLF'), 'SECTOR');
  assert.equal(universeTier('MSFT'), 'LARGE_CAP');
});

test('seed priority puts selected and core symbols before breadth-only names', () => {
  const symbols = prioritizedSeedSymbols('MSFT');
  assert.equal(symbols[0], 'MSFT');
  assert.ok(symbols.indexOf('SPY') < symbols.indexOf('XLF'));
  assert.equal(new Set(symbols).size, 25);
});
