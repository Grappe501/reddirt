import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { runCompetitionIdentityProof } from '../lib/competition-identity-proof.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return competitionJson(405, { ok: false, message: 'POST required.' });
  }

  try {
    const proof = await runCompetitionIdentityProof(getTradingLabDatabase());
    return competitionJson(proof.ok ? 200 : 503, { ...proof, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Competition identity proof failed:', redactDatabaseText(error?.message || error));
    return competitionJson(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ok: false,
      proofType: 'competition-identity-write-readback',
      invitationVisible: false,
      identityVisible: false,
      sessionVisible: false,
      foundingHuman: false,
      foundingCohortLaunchAuthorized: false,
      ...classified,
      message: 'Competition identity proof failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
