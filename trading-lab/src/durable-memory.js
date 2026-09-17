const COLLECTIONS = ['observations', 'regimes', 'decisions', 'trades', 'experimentRuns', 'sourceHealth'];
const SYNC_KEY = 'reddirt:trading-lab:durable-sync:v1';

export function createDurableSyncState(storage = globalThis.localStorage) {
  let saved = {};
  try { saved = JSON.parse(storage?.getItem?.(SYNC_KEY) || '{}') || {}; } catch {}
  return {
    enabled: saved.enabled ?? true,
    status: saved.status || 'READY',
    lastAttemptAt: saved.lastAttemptAt || null,
    lastSuccessAt: saved.lastSuccessAt || null,
    lastError: null,
    acknowledged: Object.fromEntries(COLLECTIONS.map((name) => [name, new Set(saved.acknowledged?.[name] || [])])),
    remote: saved.remote || null,
    storage,
    syncing: false,
  };
}

export function persistDurableSyncState(syncState) {
  try {
    syncState.storage?.setItem?.(SYNC_KEY, JSON.stringify({
      enabled: syncState.enabled,
      status: syncState.status,
      lastAttemptAt: syncState.lastAttemptAt,
      lastSuccessAt: syncState.lastSuccessAt,
      acknowledged: Object.fromEntries(COLLECTIONS.map((name) => [name, [...(syncState.acknowledged[name] || [])].slice(-5000)])),
      remote: syncState.remote,
    }));
  } catch {}
}

export function buildDurableBatch(memory, syncState, maxPerCollection = 250) {
  const collections = {};
  for (const name of COLLECTIONS) {
    const rows = Array.isArray(memory?.[name]) ? memory[name] : [];
    const seen = syncState.acknowledged[name] || new Set();
    collections[name] = rows.filter((row, index) => !seen.has(row.id || `${name}:${index}`)).slice(-maxPerCollection);
  }
  return { schema: 'reddirt-trading-lab-market-memory-v1', generatedAt: new Date().toISOString(), collections };
}

export function acknowledgeDurableBatch(syncState, batch) {
  for (const name of COLLECTIONS) {
    const seen = syncState.acknowledged[name] || (syncState.acknowledged[name] = new Set());
    for (const [index, row] of (batch.collections?.[name] || []).entries()) seen.add(row.id || `${name}:${index}`);
  }
  syncState.lastSuccessAt = new Date().toISOString();
  syncState.lastError = null;
  syncState.status = 'SYNCED';
  persistDurableSyncState(syncState);
}

export function durableSyncSummary(syncState) {
  return { enabled: syncState.enabled, status: syncState.status, lastAttemptAt: syncState.lastAttemptAt, lastSuccessAt: syncState.lastSuccessAt, lastError: syncState.lastError, remote: syncState.remote };
}

export async function syncDurableMemory(memory, syncState, { endpoint = '/.netlify/functions/market-memory-ingest', fetchImpl = globalThis.fetch } = {}) {
  if (!syncState.enabled || syncState.syncing) return { ok: true, skipped: true, count: 0 };
  syncState.syncing = true;
  syncState.status = 'SYNCING';
  syncState.lastAttemptAt = new Date().toISOString();
  const batch = buildDurableBatch(memory, syncState);
  const count = Object.values(batch.collections).reduce((sum, rows) => sum + rows.length, 0);
  if (!count) { syncState.syncing = false; persistDurableSyncState(syncState); return { ok: true, skipped: true, count: 0 }; }
  if (typeof fetchImpl !== 'function') { syncState.syncing = false; return { ok: false, skipped: true, count, reason: 'No fetch implementation.' }; }
  try {
    const response = await fetchImpl(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(batch) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.message || `Durable sync failed: ${response.status}`);
    acknowledgeDurableBatch(syncState, batch);
    syncState.enabled = body.configured !== false;
    return { ok: true, count, body };
  } catch (error) {
    syncState.status = 'LOCAL_ONLY'; syncState.lastError = error.message; persistDurableSyncState(syncState);
    return { ok: false, count, error: error.message };
  } finally { syncState.syncing = false; }
}

export async function readDurableStatus(syncState, { endpoint = '/.netlify/functions/market-memory-status', fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') return { ok: false, error: 'No fetch implementation.' };
  try {
    const response = await fetchImpl(endpoint, { headers: { accept: 'application/json' } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.message || `Status read failed: ${response.status}`);
    syncState.remote = body;
    if (syncState.status !== 'SYNCING') syncState.status = 'SYNCED';
    syncState.lastError = null;
    persistDurableSyncState(syncState);
    return body;
  } catch (error) {
    syncState.lastError = error.message;
    persistDurableSyncState(syncState);
    return { ok: false, error: error.message };
  }
}

export function startDurableLoop(memory, syncState, { intervalMs = 15000, onUpdate = () => {} } = {}) {
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    await syncDurableMemory(memory, syncState);
    await readDurableStatus(syncState);
    onUpdate(durableSyncSummary(syncState));
  };
  run();
  const timer = setInterval(run, intervalMs);
  return () => { stopped = true; clearInterval(timer); };
}

export { COLLECTIONS as DURABLE_COLLECTIONS };
