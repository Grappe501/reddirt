import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildSymbolSnapshot, downloadSymbolJpg, downloadSymbolSnapshot, drawSymbolJpg, symbolJpgFilename, symbolSnapshotFilename } from '../src/symbol-download.js';

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
  assert.equal(symbolJpgFilename(snapshot), 'trading-lab-NVDA-live.jpg');
});

test('symbol download refuses live-money payloads', () => {
  assert.throws(() => downloadSymbolSnapshot({ symbol: 'SPY', ordersEnabled: true }), /live-money/i);
});

test('jpg download refuses live-money payloads', async () => {
  await assert.rejects(() => downloadSymbolJpg({ symbol: 'SPY', ordersEnabled: true }), /live-money/i);
});

test('jpg card paints the symbol price and donate URL', () => {
  const texts = [];
  const ctx = {
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    drawImage() {},
    fillText(text) { texts.push(String(text)); },
    fillStyle: '',
    strokeStyle: '',
    font: '',
    lineWidth: 1,
    lineJoin: '',
    lineCap: '',
  };
  drawSymbolJpg(ctx, {
    symbol: 'NVDA',
    mode: 'LIVE',
    price: 214.13,
    bars: [{ close: 200, low: 190, high: 210 }, { close: 214, low: 200, high: 220 }],
  });
  const painted = texts.join(' ');
  assert.match(painted, /NVDA/);
  assert.match(painted, /\$214\.13/);
  assert.match(painted, /kellygrappe\.com\/donate/);
});

test('every individual sign page exposes a JPG download', async () => {
  const source = await readFile(new URL('../src/phase3-main.js', import.meta.url), 'utf8');
  assert.match(source, /Download JPG/);
  assert.match(source, /downloadSymbolJpg/);
  assert.match(source, /data-download-symbol="\$\{state\.selected\}"/);
  assert.match(source, /aria-label="Download \$\{s\} JPG"/);
});
