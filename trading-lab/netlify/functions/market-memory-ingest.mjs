import { getTradingLabDatabase } from '../lib/database.mjs';
import { asNetlifyFunction } from '../lib/netlify-function.mjs';

const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify(body) });
const COLLECTIONS = ['observations', 'regimes', 'decisions', 'trades', 'experimentRuns', 'sourceHealth'];
const asJson = (value) => JSON.stringify(value ?? {});
const now = () => new Date().toISOString();

export function durableMemoryConfig() {
  return { configured: true, target: 'netlify-database', branchAware: true };
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

export async function writeMemoryBatch(db, collections) {
  let acceptedRows = 0;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of collections.experimentRuns || []) {
      await client.query(`insert into trading_lab.experiment_runs (id,started_at,ended_at,mode,strategy_version,universe_version,cost_model,metadata) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb) on conflict (id) do update set ended_at=excluded.ended_at, strategy_version=excluded.strategy_version, universe_version=excluded.universe_version, cost_model=excluded.cost_model, metadata=excluded.metadata`, [r.id, r.startedAt || r.started_at || now(), r.endedAt || r.ended_at || null, r.mode || 'UNKNOWN', r.strategyVersion || r.strategy_version || null, r.universeVersion || r.universe_version || null, asJson(r.costModel || r.cost_model), asJson(r.metadata)]); acceptedRows++;
    }
    for (const r of collections.observations || []) {
      await client.query(`insert into trading_lab.market_observations (id,experiment_run_id,mode,symbol,provider_time,ingested_at,price,bid,ask,volume,evidence_score,action,regime,features) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb) on conflict (id) do nothing`, [r.id, r.experimentRunId || null, r.mode || 'UNKNOWN', r.symbol, r.providerTime, r.ingestedAt || now(), r.price ?? null, r.bid ?? null, r.ask ?? null, r.volume ?? null, r.score ?? r.evidenceScore ?? null, r.action ?? null, r.regime ?? null, asJson(r.features)]); acceptedRows++;
    }
    for (const r of collections.regimes || []) {
      await client.query(`insert into trading_lab.market_regimes (experiment_run_id,provider_time,ingested_at,regime,breadth) values ($1,$2,$3,$4,$5::jsonb)`, [r.experimentRunId || null, r.providerTime, r.ingestedAt || now(), r.regime, asJson(r.breadth)]); acceptedRows++;
    }
    for (const r of collections.decisions || []) {
      await client.query(`insert into trading_lab.decision_events (id,experiment_run_id,actor,symbol,provider_time,ingested_at,action,score,confidence,executed,evidence) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb) on conflict (id) do nothing`, [r.id, r.experimentRunId || null, r.actor, r.symbol, r.providerTime || null, r.ingestedAt || now(), r.action, r.score ?? null, r.confidence ?? null, r.executed ?? null, asJson({ reasons:r.reasons || [], counterEvidence:r.counterEvidence || [] })]); acceptedRows++;
    }
    for (const r of collections.trades || []) {
      await client.query(`insert into trading_lab.paper_trades (id,experiment_run_id,actor,side,symbol,provider_time,ingested_at,price,shares,costs,metadata) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb) on conflict (id) do nothing`, [r.id, r.experimentRunId || null, r.actor, r.side, r.symbol, r.providerTime || null, r.ingestedAt || now(), r.price ?? null, r.shares ?? null, asJson(r.costs), asJson(r.metadata)]); acceptedRows++;
    }
    for (const r of collections.sourceHealth || []) {
      await client.query(`insert into trading_lab.data_source_health (ingested_at,provider,feed,mode,ok,latency_ms,detail) values ($1,$2,$3,$4,$5,$6,$7::jsonb)`, [r.ingestedAt || now(), r.provider || null, r.feed || null, r.mode || null, r.ok ?? null, r.latencyMs ?? null, asJson(r.detail || { error:r.error || null })]); acceptedRows++;
    }
    await client.query('COMMIT');
    return acceptedRows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function handleRequest(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, message: 'POST required.' });
  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, message: 'Invalid JSON.' }); }
  const validation = validateMemoryBatch(payload);
  if (!validation.ok) return json(400, { ok: false, ...validation });
  try {
    const db = getTradingLabDatabase();
    const acceptedRows = await writeMemoryBatch(db, payload.collections);
    return json(200, { ok: true, configured: true, target: 'netlify-database', branchAware: true, ordersEnabled: false, acceptedRows });
  } catch (error) {
    console.error('Market Memory Netlify Database ingest failed:', error?.message || error);
    return json(500, { ok: false, configured: true, target: 'netlify-database', ordersEnabled: false, acceptedRows: 0, message: 'Market Memory database write failed.' });
  }
}

export default asNetlifyFunction(handleRequest);
