import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DONATE_URL, donateQrMarkup, pricedHtml } from '../src/donate-qr.js';

test('donate QR opens the official Kelly Grappe donate page', () => {
  const html = donateQrMarkup();
  assert.equal(DONATE_URL, 'https://www.kellygrappe.com/donate');
  assert.match(html, /href="https:\/\/www\.kellygrappe\.com\/donate"/);
  assert.match(html, /class="donate-qr"/);
  assert.match(html, /aria-label="Donate to Kelly Grappe"/);
  assert.match(html, /<svg[\s\S]*<\/svg>/);
  assert.doesNotMatch(html, /ordersEnabled["']\s*:\s*true/);
});

test('priced markup keeps missing quotes as dashes and attaches QR to real prices', () => {
  assert.equal(pricedHtml(null), '--');
  assert.equal(pricedHtml(undefined), '--');
  assert.match(pricedHtml(214.13), /\$214\.13/);
  assert.match(pricedHtml(214.13), /kellygrappe\.com\/donate/);
});

test('every shipped price surface in the live lab points at the donate QR', async () => {
  const source = await readFile(new URL('../src/phase3-main.js', import.meta.url), 'utf8');
  assert.match(source, /donateQrMarkup/);
  assert.match(source, /pricedHtml/);
  assert.match(source, /function symbolCard[\s\S]*donateQrMarkup/);
  assert.match(source, /function portfolioCard[\s\S]*pricedHtml\(s\.equity\)/);
  assert.match(source, /Price[\s\S]*pricedHtml\(price\(state\.selected\)\)/);
  assert.match(source, /Bid[\s\S]*pricedHtml\(q\.bid\)/);
  assert.match(source, /Ask[\s\S]*pricedHtml\(q\.ask\)/);
  assert.match(source, /VWAP[\s\S]*pricedHtml\(f\.vwap\)/);
  assert.match(source, /function tradeRows[\s\S]*pricedHtml\(t\.price\)/);
});
