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
