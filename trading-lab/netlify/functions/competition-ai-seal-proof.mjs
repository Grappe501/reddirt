import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { runCompetitionAiSealProof } from '../lib/competition-ai-proof.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return competitionJson(405, { ok: false, message: 'POST required.' });
  }

  try {
    const proof = await runCompetitionAiSealProof(getTradingLabDatabase());
    return competitionJson(proof.ok ? 200 : 503, { ...proof, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition AI seal proof failed:', redactDatabaseText(error?.message || error));
    return competitionJson(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ok: false,
      proofType: 'competition-ai-seal-write-readback',
      sealVisible: false,
      sealValid: false,
      mutationBlocked: false,
      foundingCohort: false,
      foundingCohortLaunchAuthorized: false,
      ...classified,
      message: 'Competition AI seal proof failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
