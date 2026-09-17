import { getDatabase } from '@netlify/database';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  },
  body: JSON.stringify(body)
});

const REQUIRED_TABLES = [
  'experiment_runs',
  'market_observations',
  'market_regimes',
  'decision_events',
  'paper_trades',
  'data_source_health',
  'learning_cycles',
  'strategy_evaluations',
  'learning_lessons',
  'strategy_versions',
  'calibration_cycles',
  'feature_evidence',
  'calibration_lessons'
];

export async function readProductionDatabaseProof(db) {
  const schema = await db.pool.query(`
    select exists(
      select 1 from information_schema.schemata where schema_name = 'trading_lab'
    ) as schema_exists
  `);

  const tables = await db.pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'trading_lab'
    order by table_name
  `);

  const present = tables.rows.map((row) => row.table_name);
  const missing = REQUIRED_TABLES.filter((name) => !present.includes(name));

  let counts = null;
  if (schema.rows[0]?.schema_exists && missing.length === 0) {
    const result = await db.pool.query(`
      select
        (select count(*)::int from trading_lab.market_observations) as observations,
        (select count(*)::int from trading_lab.learning_cycles) as learning_cycles,
        (select count(*)::int from trading_lab.calibration_cycles) as calibration_cycles,
        (select count(*)::int from trading_lab.strategy_versions) as strategy_versions
    `);
    counts = result.rows[0];
  }

  return {
    schemaExists: Boolean(schema.rows[0]?.schema_exists),
    requiredTableCount: REQUIRED_TABLES.length,
    presentRequiredTableCount: REQUIRED_TABLES.length - missing.length,
    missingTables: missing,
    counts
  };
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { ok: false, message: 'GET required.' });
  }

  try {
    const db = getDatabase();
    const proof = await readProductionDatabaseProof(db);
    const ok = proof.schemaExists && proof.missingTables.length === 0;
    return json(ok ? 200 : 503, {
      ok,
      proofType: 'production-database-readiness',
      target: 'netlify-database',
      branchAware: true,
      ordersEnabled: false,
      ...proof,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Production database proof failed:', error?.message || error);
    return json(500, {
      ok: false,
      proofType: 'production-database-readiness',
      target: 'netlify-database',
      ordersEnabled: false,
      message: 'Production database proof failed.',
      checkedAt: new Date().toISOString()
    });
  }
}
