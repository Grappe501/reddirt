import test from 'node:test';
import assert from 'node:assert/strict';
import { runAccessibilitySmoke, runMobileSmoke, runReleaseSmoke } from '../src/release-smoke.js';
import { collectShippedSmoke } from '../scripts/write-check-proof.mjs';

test('accessibility smoke fails unnamed buttons and missing live regions', () => {
  const r = runAccessibilitySmoke({ indexHtml: '<html><head><title>x</title></head></html>', appSource: '<button></button>', panelsHtml: '' });
  assert.equal(r.ok, false);
  assert.ok(r.failures.length > 0);
});

test('mobile smoke requires viewport, breakpoints, and 44px actions', () => {
  const r = runMobileSmoke({ indexHtml: '<html></html>', css: 'body{color:red}' });
  assert.equal(r.ok, false);
});

test('shipped Trading Lab markup and CSS pass mobile and accessibility smoke', async () => {
  const smoke = await collectShippedSmoke();
  assert.equal(smoke.accessibility.ok, true, smoke.accessibility.failures.join(' '));
  assert.equal(smoke.mobile.ok, true, smoke.mobile.failures.join(' '));
  assert.equal(runReleaseSmoke({}).ok, false);
});
