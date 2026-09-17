import { getTradingLabDatabase } from '../lib/database.mjs';
import { asNetlifyFunction } from '../lib/netlify-function.mjs';

const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify(body) });

export async function readMemoryStatus(db) {
  const { rows } = await db.pool.query(`
    select
      (select count(*)::int from trading_lab.market_observations) observations,
      (select count(*)::int from trading_lab.market_regimes) regimes,
      (select count(*)::int from trading_lab.decision_events) decisions,
      (select count(*)::int from trading_lab.paper_trades) trades,
      (select count(*)::int from trading_lab.experiment_runs) experiment_runs,
      (select count(*)::int from trading_lab.data_source_health) source_health,
      (select max(ingested_at) from trading_lab.market_observations) latest_observation_at,
      (select max(ingested_at) from trading_lab.decision_events) latest_decision_at,
      (select max(ingested_at) from trading_lab.paper_trades) latest_trade_at
  `);
  return rows[0];
}

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') return json(405, { ok: false, message: 'GET required.' });
  try {
    const db = getTradingLabDatabase();
    const counts = await readMemoryStatus(db);
    return json(200, { ok: true, target: 'netlify-database', branchAware: true, ordersEnabled: false, counts, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Market Memory status read failed:', error?.message || error);
    return json(500, { ok: false, target: 'netlify-database', ordersEnabled: false, message: 'Market Memory database read failed.' });
  }
}

export default asNetlifyFunction(handleRequest);
