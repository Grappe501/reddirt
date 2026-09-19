import { COMPETITION_PROOF_IDS } from './competition-db-proof.mjs';
import { IDENTITY_PROOF_IDS } from './competition-identity-proof.mjs';
import {
  assignFoundingHuman,
  isFabricatedIdentity,
  lockFoundingRoster,
  readFoundingReadiness,
} from './competition-founding.mjs';

export async function runFoundingHumanProof(db) {
  let fabricatedAssignmentRejected = false;
  let fabricatedLockRejected = false;
  try {
    await assignFoundingHuman(db, {
      cohortId: COMPETITION_PROOF_IDS.cohort,
      identityId: IDENTITY_PROOF_IDS.identity,
      operatorId: 'operator-v7-08',
    });
  } catch (error) {
    fabricatedAssignmentRejected = /fabricated/i.test(String(error.message));
  }
  try {
    await lockFoundingRoster(db, {
      cohortId: COMPETITION_PROOF_IDS.cohort,
      operatorId: 'operator-v7-08',
    });
  } catch (error) {
    fabricatedLockRejected = /ten actual verified humans/i.test(String(error.message))
      || /not found/i.test(String(error.message));
  }
  const readiness = await readFoundingReadiness(db, COMPETITION_PROOF_IDS.cohort);
  return {
    ok: fabricatedAssignmentRejected && fabricatedLockRejected && readiness.foundingHumansReady === false,
    proofType: 'founding-human-readiness-proof',
    target: 'netlify-database',
    fabricatedIdentity: IDENTITY_PROOF_IDS.identity,
    fabricatedIdentityDetected: isFabricatedIdentity(IDENTITY_PROOF_IDS.identity),
    fabricatedAssignmentRejected,
    fabricatedLockRejected,
    fabricatedUsersCountAsProof: false,
    foundingHumans: readiness.foundingHumans,
    foundingHumansReady: readiness.foundingHumansReady,
    rosterLocked: readiness.rosterLocked,
    readiness: readiness.readiness,
    foundingCohortLaunchAuthorized: false,
    automaticLaunch: false,
    ordersEnabled: false,
    realMoney: false,
    simulationOnly: true,
  };
}
