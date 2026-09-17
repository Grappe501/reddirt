import { DONATE_QR_SVG } from './donate-qr.js';

export function buildSymbolSnapshot({
  symbol,
  mode,
  price,
  providerTime,
  bar = null,
  bars = [],
  quote = null,
  signal = null,
} = {}) {
  return {
    schema: 'reddirt-trading-lab-symbol-snapshot-v1',
    exportedAt: new Date().toISOString(),
    ordersEnabled: false,
    fictionalOnly: true,
    symbol,
    mode: mode || 'UNKNOWN',
    price: Number(price) || null,
    providerTime: providerTime || null,
    bar,
    quote,
    signal,
    bars: Array.isArray(bars) ? bars.slice(-120) : [],
  };
}

export function symbolSnapshotFilename(snapshot) {
  const symbol = String(snapshot?.symbol || 'symbol').replace(/[^A-Za-z0-9._-]/g, '');
  const mode = String(snapshot?.mode || 'unknown').toLowerCase();
  return `trading-lab-${symbol}-${mode}.json`;
}

export function downloadSymbolSnapshot(snapshot, createObjectURL = globalThis.URL?.createObjectURL, revokeObjectURL = globalThis.URL?.revokeObjectURL) {
  if (snapshot?.ordersEnabled === true) throw new Error('Symbol download refuses live-money payloads.');
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  if (typeof createObjectURL !== 'function') return { ok: false, filename: symbolSnapshotFilename(snapshot) };
  const url = createObjectURL(blob);
  const anchor = globalThis.document?.createElement?.('a');
  if (anchor) {
    anchor.href = url;
    anchor.download = symbolSnapshotFilename(snapshot);
    anchor.click();
  }
  revokeObjectURL?.(url);
  return { ok: true, filename: symbolSnapshotFilename(snapshot) };
}

export function symbolJpgFilename(snapshot) {
  const symbol = String(snapshot?.symbol || 'symbol').replace(/[^A-Za-z0-9._-]/g, '');
  const mode = String(snapshot?.mode || 'unknown').toLowerCase();
  return `trading-lab-${symbol}-${mode}.jpg`;
}

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

export function drawSymbolJpg(ctx, snapshot = {}, qrImage = null, width = 1200, height = 800) {
  const symbol = String(snapshot.symbol || 'SYMBOL');
  const mode = String(snapshot.mode || 'UNKNOWN');
  const price = Number.isFinite(Number(snapshot.price)) ? formatUsd(snapshot.price) : '--';
  const bars = Array.isArray(snapshot.bars) ? snapshot.bars.filter((bar) => Number.isFinite(Number(bar?.close))) : [];
  ctx.fillStyle = '#071018';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#7e95a9';
  ctx.font = '700 22px Inter, Segoe UI, sans-serif';
  ctx.fillText('REDDIRT / TRADING LAB', 48, 56);
  ctx.fillStyle = '#e8edf4';
  ctx.font = '800 84px Inter, Segoe UI, sans-serif';
  ctx.fillText(symbol, 48, 150);
  ctx.font = '700 48px Inter, Segoe UI, sans-serif';
  ctx.fillText(price, 48, 220);
  ctx.fillStyle = '#91a1b0';
  ctx.font = '600 22px Inter, Segoe UI, sans-serif';
  ctx.fillText(`${mode} · fictional research only`, 48, 262);
  if (bars.length) {
    const lows = bars.map((bar) => Number(bar.low ?? bar.close));
    const highs = bars.map((bar) => Number(bar.high ?? bar.close));
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const range = Math.max(max - min, 0.01);
    const left = 48;
    const top = 300;
    const chartWidth = width - 96;
    const chartHeight = 360;
    ctx.strokeStyle = '#183040';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      const y = top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + chartWidth, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#73b7d5';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    bars.forEach((bar, index) => {
      const x = left + (index / Math.max(bars.length - 1, 1)) * chartWidth;
      const y = top + chartHeight - ((Number(bar.close) - min) / range) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  if (qrImage) ctx.drawImage(qrImage, width - 188, height - 188, 140, 140);
  ctx.fillStyle = '#dce5ed';
  ctx.font = '600 20px Inter, Segoe UI, sans-serif';
  ctx.fillText('Donate: https://www.kellygrappe.com/donate', 48, height - 48);
}

export async function renderSymbolJpgBlob(snapshot, { documentImpl = globalThis.document, ImageImpl = globalThis.Image } = {}) {
  if (snapshot?.ordersEnabled === true) throw new Error('Symbol download refuses live-money payloads.');
  const canvas = documentImpl?.createElement?.('canvas');
  if (!canvas?.getContext) return null;
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  let qrImage = null;
  if (typeof ImageImpl === 'function') {
    qrImage = await new Promise((resolve) => {
      const image = new ImageImpl();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DONATE_QR_SVG)}`;
    });
  }
  drawSymbolJpg(ctx, snapshot, qrImage);
  if (typeof canvas.toBlob !== 'function') return null;
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

export async function downloadSymbolJpg(snapshot, createObjectURL = globalThis.URL?.createObjectURL, revokeObjectURL = globalThis.URL?.revokeObjectURL) {
  if (snapshot?.ordersEnabled === true) throw new Error('Symbol download refuses live-money payloads.');
  const filename = symbolJpgFilename(snapshot);
  const blob = await renderSymbolJpgBlob(snapshot);
  if (!blob || typeof createObjectURL !== 'function') return { ok: false, filename };
  const url = createObjectURL(blob);
  const anchor = globalThis.document?.createElement?.('a');
  if (anchor) {
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  }
  revokeObjectURL?.(url);
  return { ok: true, filename };
}
