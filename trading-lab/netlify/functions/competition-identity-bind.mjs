import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { writeCompetitionIdentityBind } from '../lib/competition-identity.mjs';
import { competitionJson, parseCompetitionBody, rejectForbiddenWrite } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return competitionJson(405, { ok: false, message: 'POST required.' });
  }

  const parsed = parseCompetitionBody(event.body);
  if (!parsed.ok) return competitionJson(400, { ok: false, message: parsed.message });
  const forbidden = rejectForbiddenWrite(parsed.value);
  if (forbidden) return competitionJson(403, { ok: false, message: forbidden });

  try {
    const result = await writeCompetitionIdentityBind(getTradingLabDatabase(), parsed.value);
    return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition identity bind failed:', redactDatabaseText(error?.message || error));
    return competitionJson(error.statusCode || (classified.databaseEnvironmentAvailable ? 500 : 503), {
      ok: false,
      proofType: 'competition-identity-bind',
      ...classified,
      message: error.statusCode ? error.message : 'Competition identity bind failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
