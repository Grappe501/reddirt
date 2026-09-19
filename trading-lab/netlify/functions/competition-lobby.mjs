import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { readCompetitionLobby } from '../lib/competition-api.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return competitionJson(405, { ok: false, message: 'GET required.' });
  }

  try {
    const lobby = await readCompetitionLobby(getTradingLabDatabase());
    return competitionJson(200, { ...lobby, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition lobby failed:', redactDatabaseText(error?.message || error));
    return competitionJson(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ok: false,
      proofType: 'competition-lobby',
      cohorts: [],
      ...classified,
      message: 'Competition lobby failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
