import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { readFoundingReadiness } from '../lib/competition-founding.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

const COMPETITION_DEFAULT_COHORT = 'v7-02-competition-db-proof';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return competitionJson(405, { ok: false, message: 'GET required.' });
  }

  try {
    const result = await readFoundingReadiness(
      getTradingLabDatabase(),
      event.queryStringParameters?.cohortId || COMPETITION_DEFAULT_COHORT,
    );
    return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Founding readiness failed:', redactDatabaseText(error?.message || error));
    return competitionJson(error.statusCode || (classified.databaseEnvironmentAvailable ? 500 : 503), {
      ok: false,
      proofType: 'founding-human-readiness',
      foundingHumansReady: false,
      foundingCohortLaunchAuthorized: false,
      ...classified,
      message: error.statusCode ? error.message : 'Founding readiness failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
