import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { readCompetitionPortfolio } from '../lib/competition-api.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return competitionJson(405, { ok: false, message: 'GET required.' });
  }

  try {
    const portfolioId = event.queryStringParameters?.portfolioId || '';
    const result = await readCompetitionPortfolio(getTradingLabDatabase(), portfolioId);
    return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition portfolio failed:', redactDatabaseText(error?.message || error));
    return competitionJson(error.statusCode || (classified.databaseEnvironmentAvailable ? 500 : 503), {
      ok: false,
      proofType: 'competition-portfolio',
      portfolio: null,
      ...classified,
      message: error.statusCode ? error.message : 'Competition portfolio failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
