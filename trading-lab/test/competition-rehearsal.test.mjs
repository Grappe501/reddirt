import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activateFoundingCohortFromRehearsal,
  completeLaunchRehearsal,
  IMMUTABLE_HISTORY_SURFACES,
  mutateImmutableHistory,
  openRehearsalIncident,
  readRehearsalStatus,
  rollbackRehearsalIncident,
  startLaunchRehearsal,
} from '../netlify/lib/competition-rehearsal.mjs';
import { runLaunchRehearsalProof, REHEARSAL_PROOF_IDS } from '../netlify/lib/competition-rehearsal-proof.mjs';
import { COMPETITION_PROOF_FINGERPRINTS, COMPETITION_PROOF_IDS } from '../netlify/lib/competition-db-proof.mjs';
import { handleRequest as run } from '../netlify/functions/competition-rehearsal-run.mjs';
import { handleRequest as incident } from '../netlify/functions/competition-rehearsal-incident.mjs';
import { handleRequest as status } from '../netlify/functions/competition-rehearsal-status.mjs';

function createFakeRehearsalDb({ status = 'PROOF' } = {}) {
  const store = {
    cohorts: new Map([[COMPETITION_PROOF_IDS.cohort, {
      id: COMPETITION_PROOF_IDS.cohort,
      status,
      rules_fingerprint: COMPETITION_PROOF_FINGERPRINTS.rules,
      scoring_fingerprint: COMPETITION_PROOF_FINGERPRINTS.scoring,
      ai_seal_fingerprint: COMPETITION_PROOF_FINGERPRINTS.aiSeal,
    }]]),
    rehearsals: new Map(),
    incidents: new Map(),
    locks: new Map(),
    audits: [],
    fillCount: 1,
    creditCount: 1,
  };

  const query = async (sql, params = []) => {
    const text = String(sql);
    if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
    if (/insert into trading_lab\.competition_cohorts/i.test(text)) {
      store.cohorts.set(params[0], {
        id: params[0],
        status: params[1],
        rules_fingerprint: params[2],
        scoring_fingerprint: params[3],
        ai_seal_fingerprint: params[4],
      });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_cohorts c/i.test(text) && /fill_count/i.test(text)) {
      const row = store.cohorts.get(params[0]);
      return {
        rows: row ? [{
          ...row,
          fill_count: store.fillCount,
          credit_count: store.creditCount,
        }] : [],
      };
    }
    if (/select status from trading_lab\.competition_cohorts/i.test(text)
      || /select id, status from trading_lab\.competition_cohorts/i.test(text)) {
      const row = store.cohorts.get(params[0]);
      return { rows: row ? [{ id: row.id, status: row.status }] : [] };
    }
    if (/insert into trading_lab\.competition_rehearsals/i.test(text)) {
      store.rehearsals.set(params[0], {
        id: params[0],
        cohort_id: params[1],
        operator_id: params[2],
        state: 'DRESS',
        real_cohort_activated: false,
        founding_cohort_launch_authorized: false,
        started_at: '2026-09-19T00:00:00.000Z',
        cohort_status: store.cohorts.get(params[1])?.status,
      });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_rehearsals r/i.test(text)) {
      const row = [...store.rehearsals.values()].find((item) => item.cohort_id === params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_rehearsals where id/i.test(text)) {
      const row = store.rehearsals.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/update trading_lab\.competition_rehearsals/i.test(text) && /INCIDENT_OPEN/i.test(text)) {
      const row = store.rehearsals.get(params[0]);
      if (row) row.state = 'INCIDENT_OPEN';
      return { rows: [] };
    }
    if (/update trading_lab\.competition_rehearsals/i.test(text) && /ROLLED_BACK/i.test(text)) {
      const row = store.rehearsals.get(params[0]);
      if (row) row.state = 'ROLLED_BACK';
      return { rows: [] };
    }
    if (/update trading_lab\.competition_rehearsals/i.test(text) && /COMPLETE/i.test(text)) {
      const row = store.rehearsals.get(params[0]);
      if (row) row.state = 'COMPLETE';
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_history_locks/i.test(text)) {
      store.locks.set(`${params[1]}:${params[2]}`, {
        id: params[0],
        rehearsal_id: params[1],
        surface: params[2],
        fingerprint: params[3],
        locked: true,
        mutable: false,
      });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_history_locks where rehearsal_id = \$1 and surface/i.test(text)) {
      const row = store.locks.get(`${params[0]}:${params[1]}`);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_history_locks where rehearsal_id/i.test(text)) {
      return {
        rows: [...store.locks.values()]
          .filter((row) => row.rehearsal_id === params[0])
          .sort((a, b) => a.surface.localeCompare(b.surface)),
      };
    }
    if (/insert into trading_lab\.competition_incidents/i.test(text)) {
      store.incidents.set(params[0], {
        id: params[0],
        rehearsal_id: params[1],
        cohort_id: params[2],
        kind: params[3],
        status: 'OPEN',
        reason: params[4],
        history_mutated: false,
      });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_incidents where id/i.test(text)) {
      const row = store.incidents.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_incidents where rehearsal_id/i.test(text)) {
      return { rows: [...store.incidents.values()].filter((row) => row.rehearsal_id === params[0]) };
    }
    if (/update trading_lab\.competition_incidents/i.test(text)) {
      const row = store.incidents.get(params[0]);
      if (row) {
        row.status = 'ROLLED_BACK';
        row.history_mutated = false;
      }
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_audit/i.test(text)) {
      store.audits.push({ id: params[0], action: params[1] });
      return { rows: [] };
    }
    return { rows: [] };
  };

  return {
    store,
    pool: {
      connect: async () => ({ query, release() {} }),
      query,
    },
  };
}

test('dress rehearsal uses production workflow without activating the real cohort', async () => {
  const db = createFakeRehearsalDb();
  const started = await startLaunchRehearsal(db, {
    cohortId: COMPETITION_PROOF_IDS.cohort,
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    operatorId: 'operator-v7-09',
  });
  assert.equal(started.rehearsalState, 'DRESS');
  assert.equal(started.realCohortActivated, false);
  assert.equal(started.foundingCohortLaunchAuthorized, false);
  assert.equal(started.cohortStatus, 'PROOF');
  assert.deepEqual(started.immutableSurfaces, [...IMMUTABLE_HISTORY_SURFACES]);
  await assert.rejects(() => activateFoundingCohortFromRehearsal(), /cannot activate/);
});

test('incident rollback preserves locked history and does not launch', async () => {
  const db = createFakeRehearsalDb();
  await startLaunchRehearsal(db, {
    cohortId: COMPETITION_PROOF_IDS.cohort,
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    operatorId: 'operator-v7-09',
  });
  await assert.rejects(
    () => mutateImmutableHistory(db, { rehearsalId: REHEARSAL_PROOF_IDS.rehearsal, surface: 'FILLS' }),
    /immutable/,
  );
  const opened = await openRehearsalIncident(db, {
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    incidentId: REHEARSAL_PROOF_IDS.incident,
    operatorId: 'operator-v7-09',
    reason: 'Rollback drill.',
  });
  assert.equal(opened.incidentStatus, 'OPEN');
  const rolled = await rollbackRehearsalIncident(db, {
    incidentId: REHEARSAL_PROOF_IDS.incident,
    operatorId: 'operator-v7-09',
  });
  assert.equal(rolled.incidentRollbackProven, true);
  assert.equal(rolled.immutableHistoryProtected, true);
  assert.equal(rolled.foundingCohortLaunchAuthorized, false);
  assert.equal(db.store.locks.size, IMMUTABLE_HISTORY_SURFACES.length);
  const completed = await completeLaunchRehearsal(db, {
    rehearsalId: REHEARSAL_PROOF_IDS.rehearsal,
    operatorId: 'operator-v7-09',
    humanCount: 0,
  });
  assert.equal(completed.rehearsalState, 'COMPLETE');
  assert.equal(completed.rehearsalIsNotLaunch, true);
  const ready = await readRehearsalStatus(db, COMPETITION_PROOF_IDS.cohort);
  assert.equal(ready.rehearsalRan, true);
  assert.equal(ready.realCohortActivated, false);
});

test('production rehearsal proof refuses launch and records rollback', async () => {
  const db = createFakeRehearsalDb();
  const proof = await runLaunchRehearsalProof(db);
  assert.equal(proof.ok, true);
  assert.equal(proof.rehearsalIsNotLaunch, true);
  assert.equal(proof.incidentRollbackProven, true);
  assert.equal(proof.immutableHistoryProtected, true);
  assert.equal(proof.realCohortActivated, false);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
  assert.equal(proof.cohortStatus, 'PROOF');
});

test('rehearsal handlers reject launch and stay method-safe', async () => {
  const launch = JSON.parse((await run({ httpMethod: 'POST', body: JSON.stringify({ launch: true }) })).body);
  const activate = JSON.parse((await incident({ httpMethod: 'POST', body: JSON.stringify({ activateRealCohort: true }) })).body);
  const method = JSON.parse((await status({ httpMethod: 'POST' })).body);
  assert.equal(launch.ok, false);
  assert.match(launch.message, /launch|activate/i);
  assert.equal(activate.ok, false);
  assert.match(activate.message, /activate|launch/i);
  assert.equal(method.ok, false);
});
