import { COMPETITION_PROOF_FINGERPRINTS, COMPETITION_PROOF_IDS } from './competition-db-proof.mjs';
import { competitionRecord } from '../../src/v6-competition-persistence.js';
import {
  activateFoundingCohortFromRehearsal,
  completeLaunchRehearsal,
  IMMUTABLE_HISTORY_SURFACES,
  mutateImmutableHistory,
  openRehearsalIncident,
  readRehearsalStatus,
  rollbackRehearsalIncident,
  startLaunchRehearsal,
} from './competition-rehearsal.mjs';

export const REHEARSAL_PROOF_IDS = Object.freeze({
  rehearsal: 'v7-09-launch-rehearsal',
  incident: 'v7-09-rehearsal-incident',
  cohort: COMPETITION_PROOF_IDS.cohort,
});

async function ensureProofCohort(db) {
  const cohort = competitionRecord({
    id: COMPETITION_PROOF_IDS.cohort,
    status: 'PROOF',
    rulesFingerprint: COMPETITION_PROOF_FINGERPRINTS.rules,
    scoringFingerprint: COMPETITION_PROOF_FINGERPRINTS.scoring,
    aiSealFingerprint: COMPETITION_PROOF_FINGERPRINTS.aiSeal,
    startsAt: null,
  });
  await db.pool.query(
    `insert into trading_lab.competition_cohorts (
      id, status, rules_fingerprint, scoring_fingerprint, ai_seal_fingerprint, starts_at
    ) values ($1,$2,$3,$4,$5,$6)
    on conflict (id) do update set status = excluded.status`,
    [cohort.id, cohort.status, cohort.rulesFingerprint, cohort.scoringFingerprint, cohort.aiSealFingerprint, cohort.startsAt],
  );
}

export async function runLaunchRehearsalProof(db) {
  await ensureProofCohort(db);
  const started = await startLaunchRehearsal(db, {
    cohortId: REHEARSAL_PROOF_IDS.cohort,
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    operatorId: 'operator-v7-09',
  });
  let immutableHistoryProtected = false;
  try {
    await mutateImmutableHistory(db, {
      rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
      surface: 'FILLS',
    });
  } catch (error) {
    immutableHistoryProtected = /immutable/i.test(String(error.message));
  }
  try {
    await mutateImmutableHistory(db, {
      rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
      surface: 'AI_SEAL',
    });
  } catch (error) {
    immutableHistoryProtected = immutableHistoryProtected && /immutable/i.test(String(error.message));
  }
  await openRehearsalIncident(db, {
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    incidentId: REHEARSAL_PROOF_IDS.incident,
    operatorId: 'operator-v7-09',
    kind: 'LAUNCH_REHEARSAL',
    reason: 'Dress rehearsal incident rollback.',
  });
  const rolled = await rollbackRehearsalIncident(db, {
    incidentId: REHEARSAL_PROOF_IDS.incident,
    operatorId: 'operator-v7-09',
  });
  let realCohortActivationRejected = false;
  try {
    await activateFoundingCohortFromRehearsal();
  } catch (error) {
    realCohortActivationRejected = /cannot activate/i.test(String(error.message));
  }
  const completed = await completeLaunchRehearsal(db, {
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    operatorId: 'operator-v7-09',
    humanCount: 0,
  });
  const status = await readRehearsalStatus(db, REHEARSAL_PROOF_IDS.cohort);
  const realCohortActivated = status.cohortStatus === 'ACTIVE' || status.cohortStatus === 'LOCKED' || completed.realCohortActivated;
  return {
    ok: Boolean(
      started.ok
      && immutableHistoryProtected
      && rolled.incidentRollbackProven
      && rolled.immutableHistoryProtected
      && realCohortActivationRejected
      && completed.ok
      && completed.foundingCohortLaunchAuthorized === false
      && !realCohortActivated
      && status.rehearsalRan
    ),
    proofType: 'founding-cohort-rehearsal-proof',
    target: 'netlify-database',
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    rehearsalState: completed.rehearsalState,
    rehearsalExercised: true,
    rehearsalIsNotLaunch: true,
    incidentRollbackProven: Boolean(rolled.incidentRollbackProven),
    immutableHistoryProtected,
    immutableSurfaces: [...IMMUTABLE_HISTORY_SURFACES],
    realCohortActivationRejected,
    realCohortActivated: false,
    cohortStatus: status.cohortStatus,
    foundingCohortLaunchAuthorized: false,
    automaticLaunch: false,
    ordersEnabled: false,
    realMoney: false,
    simulationOnly: true,
  };
}
