import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { runProductionWriteProof } from '../lib/write-proof.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  },
  body: JSON.stringify(sanitizePublicProof(body))
});

const FORBIDDEN_PUBLIC_KEYS = /connectionstring|password|username|token|secret|database_url|netlify_db_url|^host$/i;

export function sanitizePublicProof(body) {
  const safe = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (FORBIDDEN_PUBLIC_KEYS.test(key)) continue;
    safe[key] = value;
  }
  return safe;
}

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json(405, { ok: false, ordersEnabled: false, message: 'POST required.' });
  }

  try {
    const proof = await runProductionWriteProof(getTradingLabDatabase());
    return json(proof.ok ? 200 : 503, {
      ...proof,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Production write proof failed:', redactDatabaseText(error?.message || error));
    return json(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ok: false,
      proofType: 'production-database-write-readback',
      target: 'netlify-database',
      ordersEnabled: false,
      marketMemoryWriteVisible: false,
      learningCyclePersisted: false,
      calibrationCyclePersisted: false,
      failedStage: error?.failedStage || null,
      ...classified,
      message: 'Production write proof failed.',
      checkedAt: new Date().toISOString()
    });
  }
}

export default asNetlifyFunction(handleRequest);
