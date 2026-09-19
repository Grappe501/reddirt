import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { writeCompetitionFill } from '../lib/competition-api.mjs';
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
    const result = await writeCompetitionFill(getTradingLabDatabase(), parsed.value);
    return competitionJson(result.ok ? 200 : 503, { ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    const status = error.statusCode || (/insufficient|cannot sell|Invalid|required|source/i.test(String(error.message)) ? 400 : (classified.databaseEnvironmentAvailable ? 500 : 503));
    console.error('Competition fill failed:', redactDatabaseText(error?.message || error));
    return competitionJson(status, {
      ok: false,
      proofType: 'competition-fill',
      ...classified,
      message: status < 500 ? error.message : 'Competition fill failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
