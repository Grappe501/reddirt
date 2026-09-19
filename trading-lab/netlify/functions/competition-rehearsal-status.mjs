import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { readRehearsalStatus, REHEARSAL_DEFAULT_COHORT } from '../lib/competition-rehearsal.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return competitionJson(405, { ok: false, message: 'GET required.' });
  }

  try {
    const result = await readRehearsalStatus(
      getTradingLabDatabase(),
      event.queryStringParameters?.cohortId || REHEARSAL_DEFAULT_COHORT,
    );
    return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Launch rehearsal status failed:', redactDatabaseText(error?.message || error));
    return competitionJson(error.statusCode || (classified.databaseEnvironmentAvailable ? 500 : 503), {
      ok: false,
      proofType: 'founding-cohort-rehearsal-status',
      rehearsalIsNotLaunch: true,
      foundingCohortLaunchAuthorized: false,
      ...classified,
      message: error.statusCode ? error.message : 'Launch rehearsal status failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
