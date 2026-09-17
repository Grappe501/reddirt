const COLLECTIONS = ['observations', 'regimes', 'decisions', 'trades', 'experimentRuns', 'sourceHealth'];

export function createDurableSyncState() {
  return {
    enabled: false,
    status: 'LOCAL_ONLY',
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastError: null,
    acknowledged: Object.fromEntries(COLLECTIONS.map((name) => [name, new Set()])),
  };
}

export function buildDurableBatch(memory, syncState, maxPerCollection = 250) {
  const collections = {};
  for (const name of COLLECTIONS) {
    const rows = Array.isArray(memory?.[name]) ? memory[name] : [];
    const seen = syncState.acknowledged[name] || new Set();
    collections[name] = rows.filter((row, index) => !seen.has(row.id || `${name}:${index}`)).slice(-maxPerCollection);
  }
  return {
    schema: 'reddirt-trading-lab-market-memory-v1',
    generatedAt: new Date().toISOString(),
    collections,
  };
}

export function acknowledgeDurableBatch(syncState, batch) {
  for (const name of COLLECTIONS) {
    const seen = syncState.acknowledged[name] || (syncState.acknowledged[name] = new Set());
    for (const [index, row] of (batch.collections?.[name] || []).entries()) seen.add(row.id || `${name}:${index}`);
  }
  syncState.lastSuccessAt = new Date().toISOString();
  syncState.lastError = null;
  syncState.status = 'SYNCED';
}

export function durableSyncSummary(syncState) {
  return {
    enabled: syncState.enabled,
    status: syncState.status,
    lastAttemptAt: syncState.lastAttemptAt,
    lastSuccessAt: syncState.lastSuccessAt,
    lastError: syncState.lastError,
  };
}

export async function syncDurableMemory(memory, syncState, { endpoint = '/.netlify/functions/market-memory-ingest', fetchImpl = globalThis.fetch } = {}) {
  syncState.lastAttemptAt = new Date().toISOString();
  const batch = buildDurableBatch(memory, syncState);
  const count = Object.values(batch.collections).reduce((sum, rows) => sum + rows.length, 0);
  if (!count) return { ok: true, skipped: true, count: 0 };
  if (typeof fetchImpl !== 'function') return { ok: false, skipped: true, count, reason: 'No fetch implementation.' };
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(batch),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.message || `Durable sync failed: ${response.status}`);
    acknowledgeDurableBatch(syncState, batch);
    syncState.enabled = body.configured !== false;
    return { ok: true, count, body };
  } catch (error) {
    syncState.status = 'LOCAL_ONLY';
    syncState.lastError = error.message;
    return { ok: false, count, error: error.message };
  }
}

export { COLLECTIONS as DURABLE_COLLECTIONS };
