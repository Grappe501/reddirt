import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import {
  classifyDatabaseFailure,
  getTradingLabDatabase,
  inspectDatabaseEnvironment,
  redactDatabaseText,
} from '../lib/database.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  },
  body: JSON.stringify(sanitizePublicProof(body))
});

export const REQUIRED_TABLES = [
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
  'calibration_lessons',
  'competition_cohorts',
  'competition_members',
  'competition_portfolios',
  'competition_fills',
  'research_credit_ledger',
];

const FORBIDDEN_PUBLIC_KEYS = /connectionstring|password|username|user|token|secret|database_url|netlify_db_url|^host$/i;

export function sanitizePublicProof(body) {
  const safe = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (FORBIDDEN_PUBLIC_KEYS.test(key)) continue;
    safe[key] = value;
  }
  return safe;
}

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
        (select count(*)::int from trading_lab.strategy_versions) as strategy_versions,
        (select count(*)::int from trading_lab.competition_cohorts) as competition_cohorts,
        (select count(*)::int from trading_lab.competition_members) as competition_members,
        (select count(*)::int from trading_lab.competition_portfolios) as competition_portfolios,
        (select count(*)::int from trading_lab.competition_fills) as competition_fills,
        (select count(*)::int from trading_lab.research_credit_ledger) as research_credits
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

function proofBase(env) {
  return {
    proofType: 'production-database-readiness',
    target: 'netlify-database',
    branchAware: true,
    ordersEnabled: false,
    databaseEnvironmentAvailable: env.databaseEnvironmentAvailable,
    databaseConnectionEstablished: false,
    schemaExists: false,
    requiredTableCount: REQUIRED_TABLES.length,
    presentRequiredTableCount: 0,
    missingTables: REQUIRED_TABLES,
  };
}

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { ok: false, ordersEnabled: false, message: 'GET required.' });
  }

  const env = inspectDatabaseEnvironment();
  const base = proofBase(env);

  if (!env.databaseEnvironmentAvailable) {
    return json(503, {
      ...base,
      ok: false,
      failureClass: 'database-environment-unavailable',
      checkedAt: new Date().toISOString()
    });
  }

  try {
    const db = getTradingLabDatabase();
    const proof = await readProductionDatabaseProof(db);
    const ok = proof.schemaExists && proof.missingTables.length === 0;
    let failureClass = null;
    if (!proof.schemaExists) failureClass = 'schema-absent';
    else if (proof.missingTables.length > 0) failureClass = 'required-tables-absent';

    return json(ok ? 200 : 503, {
      ...base,
      ok,
      databaseConnectionEstablished: true,
      failureClass,
      ...proof,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Production database proof failed:', redactDatabaseText(error?.message || error));
    return json(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ...base,
      ok: false,
      ...classified,
      message: 'Production database proof failed.',
      checkedAt: new Date().toISOString()
    });
  }
}

export default asNetlifyFunction(handleRequest);
