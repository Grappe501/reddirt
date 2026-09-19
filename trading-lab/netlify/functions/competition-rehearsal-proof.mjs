import { asNetlifyFunction } from '../lib/netlify-function.mjs';
import { classifyDatabaseFailure, getTradingLabDatabase, redactDatabaseText } from '../lib/database.mjs';
import { runLaunchRehearsalProof } from '../lib/competition-rehearsal-proof.mjs';
import { competitionJson } from '../lib/competition-http.mjs';

export async function handleRequest(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return competitionJson(405, { ok: false, message: 'POST required.' });
  }

  try {
    const proof = await runLaunchRehearsalProof(getTradingLabDatabase());
    return competitionJson(proof.ok ? 200 : 503, { ...proof, checkedAt: new Date().toISOString() });
  } catch (error) {
    const classified = classifyDatabaseFailure(error);
    console.error('Launch rehearsal proof failed:', redactDatabaseText(error?.message || error));
    return competitionJson(classified.databaseEnvironmentAvailable ? 500 : 503, {
      ok: false,
      proofType: 'founding-cohort-rehearsal-proof',
      rehearsalIsNotLaunch: true,
      incidentRollbackProven: false,
      immutableHistoryProtected: false,
      realCohortActivated: false,
      foundingCohortLaunchAuthorized: false,
      ...classified,
      message: 'Launch rehearsal proof failed.',
      checkedAt: new Date().toISOString(),
    });
  }
}

export default asNetlifyFunction(handleRequest);
