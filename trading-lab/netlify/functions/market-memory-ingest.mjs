const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify(body) });
const COLLECTIONS = ['observations', 'regimes', 'decisions', 'trades', 'experimentRuns', 'sourceHealth'];

export function durableMemoryConfig(env = process.env) {
  return {
    configured: Boolean(env.TRADING_LAB_DATABASE_URL),
    target: env.TRADING_LAB_DATABASE_URL ? 'dedicated-postgres' : 'unconfigured',
  };
}

export function validateMemoryBatch(payload) {
  if (!payload || payload.schema !== 'reddirt-trading-lab-market-memory-v1') return { ok: false, message: 'Unsupported market-memory schema.' };
  if (!payload.collections || typeof payload.collections !== 'object') return { ok: false, message: 'Missing collections.' };
  let count = 0;
  for (const name of COLLECTIONS) {
    const rows = payload.collections[name] || [];
    if (!Array.isArray(rows)) return { ok: false, message: `Invalid ${name} collection.` };
    if (rows.length > 250) return { ok: false, message: `${name} exceeds the 250-row ingest limit.` };
    count += rows.length;
  }
  if (count > 1500) return { ok: false, message: 'Batch exceeds total ingest limit.' };
  return { ok: true, count };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'POST required.' });
  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, message: 'Invalid JSON.' }); }
  const validation = validateMemoryBatch(payload);
  if (!validation.ok) return json(400, { ok: false, ...validation });
  const config = durableMemoryConfig();
  if (!config.configured) {
    return json(503, {
      ok: false,
      configured: false,
      ordersEnabled: false,
      message: 'Durable Market Memory is prepared but not connected. Set a dedicated TRADING_LAB_DATABASE_URL only after the database target is approved and provisioned.',
    });
  }

  // Hard gate: schema and endpoint are intentionally prepared before a database driver is installed.
  // A later infrastructure slice will add the dedicated Postgres adapter after target selection.
  return json(501, {
    ok: false,
    configured: true,
    ordersEnabled: false,
    acceptedRows: 0,
    message: 'Dedicated database target is configured, but the Postgres writer adapter has not been enabled yet.',
  });
}
