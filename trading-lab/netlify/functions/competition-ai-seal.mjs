import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { readCompetitionAiSeal, writeCompetitionAiSeal } from '../lib/competition-ai.mjs';
import { competitionJson, parseCompetitionBody, rejectForbiddenWrite } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  const method = event.httpMethod || 'GET';
  if (method !== 'GET' && method !== 'POST') {
    return competitionJson(405, { ok: false, message: 'GET or POST required.' });
  }

  try {
    if (method === 'GET') {
      const result = await readCompetitionAiSeal(
        getTradingLabDatabase(),
        event.queryStringParameters?.cohortId || '',
      );
      return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
    }

    const parsed = parseCompetitionBody(event.body);
    if (!parsed.ok) return competitionJson(400, { ok: false, message: parsed.message });
    const forbidden = rejectForbiddenWrite(parsed.value);
    if (forbidden) return competitionJson(403, { ok: false, message: forbidden });
    if (parsed.value.mutationAllowed === true) {
      return competitionJson(403, { ok: false, message: 'Sealed AI configuration cannot be mutated.' });
    }

    const result = await writeCompetitionAiSeal(getTradingLabDatabase(), parsed.value);
    return competitionJson(200, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition AI seal failed:', redactDatabaseText(error?.message || error));
    return competitionJson(error.statusCode || (classified.databaseEnvironmentAvailable ? 500 : 503), {
      ok: false,
      proofType: 'competition-ai-seal',
      mutationAllowed: false,
      ...classified,
      message: error.statusCode ? error.message : 'Competition AI seal failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
