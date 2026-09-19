import { foundingCohortReadiness, lockFoundingCohort } from '../../src/v5-founding-cohort-launch.js';
import { authorizeLaunch, launchChecklist, READ_ONLY_HISTORY } from '../../src/v6-admin-operations.js';

export const IMMUTABLE_HISTORY_SURFACES = READ_ONLY_HISTORY;
export const REHEARSAL_DEFAULT_COHORT = 'v7-02-competition-db-proof';

function requireId(value, label) {
  const id = String(value || '').trim();
  if (!id || id.length > 80) throw Object.assign(new Error(`${label} is required.`), { statusCode: 400 });
  return id;
}

function rehearsalFlags() {
  return {
    realCohortActivated: false,
    rehearsalIsNotLaunch: true,
    foundingCohortLaunchAuthorized: false,
    automaticLaunch: false,
    ordersEnabled: false,
    realMoney: false,
    simulationOnly: true,
  };
}

export function assertHistoryImmutable(surface) {
  const name = String(surface || '').toUpperCase();
  if (IMMUTABLE_HISTORY_SURFACES.includes(name)) {
    throw Object.assign(new Error(`${name} is immutable competition history and cannot be rewritten.`), { statusCode: 409 });
  }
  throw Object.assign(new Error('Unknown history surface.'), { statusCode: 400 });
}

export function refuseRehearsalLaunch(input = {}) {
  if (input.launch === true || input.activate === true || input.foundingCohortLaunchAuthorized === true) {
    throw Object.assign(new Error('Dress rehearsal cannot authorize founding-cohort launch.'), { statusCode: 409 });
  }
  if (input.realCohortActivated === true || input.activateRealCohort === true) {
    throw Object.assign(new Error('Dress rehearsal cannot activate the real founding cohort.'), { statusCode: 409 });
  }
}

export async function activateFoundingCohortFromRehearsal() {
  throw Object.assign(new Error('Dress rehearsal cannot activate the founding cohort.'), { statusCode: 409 });
}

async function snapshotSurfaces(client, cohortId) {
  const cohort = await client.query(
    `select
       c.id,
       c.status,
       c.rules_fingerprint,
       c.scoring_fingerprint,
       c.ai_seal_fingerprint,
       (select count(*)::int
        from trading_lab.competition_fills f
        join trading_lab.competition_portfolios p on p.id = f.portfolio_id
        where p.cohort_id = c.id) as fill_count,
       (select count(*)::int from trading_lab.research_credit_ledger) as credit_count
     from trading_lab.competition_cohorts c
     where c.id = $1
     for update`,
    [cohortId],
  );
  const row = cohort.rows[0];
  if (!row) throw Object.assign(new Error('Cohort not found.'), { statusCode: 404 });
  if (row.status === 'ACTIVE' || row.status === 'LOCKED') {
    throw Object.assign(new Error('Rehearsal cannot run against an already launched founding cohort.'), { statusCode: 409 });
  }
  return {
    cohort: row,
    locks: [
      ['FILLS', `fills:${row.fill_count}`],
      ['FROZEN_DECISIONS', 'frozen-decisions:protected'],
      ['AI_SEAL', `ai-seal:${row.ai_seal_fingerprint}`],
      ['RULES_FINGERPRINT', `rules:${row.rules_fingerprint}`],
      ['SCORING_FINGERPRINT', `scoring:${row.scoring_fingerprint}`],
      ['CREDIT_LEDGER', `credits:${row.credit_count}`],
    ],
  };
}

async function writeHistoryLocks(client, rehearsalId, locks) {
  for (const [surface, fingerprint] of locks) {
    await client.query(
      `insert into trading_lab.competition_history_locks (
        id, rehearsal_id, surface, fingerprint, locked, mutable
      ) values ($1,$2,$3,$4,true,false)
      on conflict (rehearsal_id, surface) do nothing`,
      [`lock:${rehearsalId}:${surface}`, rehearsalId, surface, fingerprint],
    );
  }
}

export async function startLaunchRehearsal(db, input = {}) {
  refuseRehearsalLaunch(input);
  const cohortId = requireId(input.cohortId || REHEARSAL_DEFAULT_COHORT, 'cohortId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  const rehearsalId = requireId(input.rehearsalId || `rehearsal:${cohortId}`, 'rehearsalId');
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const snapshot = await snapshotSurfaces(client, cohortId);
    await client.query(
      `insert into trading_lab.competition_rehearsals (
        id, cohort_id, operator_id, state, real_cohort_activated, founding_cohort_launch_authorized
      ) values ($1,$2,$3,'DRESS',false,false)
      on conflict (id) do update set operator_id = excluded.operator_id`,
      [rehearsalId, cohortId, operatorId],
    );
    await writeHistoryLocks(client, rehearsalId, snapshot.locks);
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'REHEARSAL_STARTED','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:rehearsal-start:${rehearsalId}`,
        cohortId,
        JSON.stringify({ rehearsalId, operatorId, realCohortActivated: false, launchAuthorized: false }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-cohort-rehearsal',
      rehearsalId,
      cohortId,
      rehearsalState: 'DRESS',
      immutableSurfaces: [...IMMUTABLE_HISTORY_SURFACES],
      cohortStatus: snapshot.cohort.status,
      ...rehearsalFlags(),
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original rehearsal error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function mutateImmutableHistory(db, input = {}) {
  const rehearsalId = requireId(input.rehearsalId, 'rehearsalId');
  const surface = String(input.surface || '').toUpperCase();
  const lock = await db.pool.query(
    'select surface, locked, mutable, fingerprint from trading_lab.competition_history_locks where rehearsal_id = $1 and surface = $2',
    [rehearsalId, surface],
  );
  if (!lock.rows[0]) {
    assertHistoryImmutable(surface);
  }
  if (lock.rows[0].locked || lock.rows[0].mutable === false) {
    throw Object.assign(new Error(`${surface} is immutable competition history and cannot be rewritten.`), {
      statusCode: 409,
      fingerprint: lock.rows[0].fingerprint,
    });
  }
  throw Object.assign(new Error(`${surface} is immutable competition history and cannot be rewritten.`), { statusCode: 409 });
}

export async function openRehearsalIncident(db, input = {}) {
  refuseRehearsalLaunch(input);
  const rehearsalId = requireId(input.rehearsalId, 'rehearsalId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  const incidentId = requireId(input.incidentId || `incident:${rehearsalId}`, 'incidentId');
  const reason = String(input.reason || '').trim() || 'Launch rehearsal incident.';
  const kind = String(input.kind || 'LAUNCH_REHEARSAL').toUpperCase();
  if (!['LAUNCH_REHEARSAL', 'HISTORY_MUTATION', 'OPERATIONAL'].includes(kind)) {
    throw Object.assign(new Error('Incident kind is not allowed.'), { statusCode: 400 });
  }
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const rehearsal = await client.query(
      'select id, cohort_id, state from trading_lab.competition_rehearsals where id = $1 for update',
      [rehearsalId],
    );
    if (!rehearsal.rows[0]) throw Object.assign(new Error('Rehearsal not found.'), { statusCode: 404 });
    await client.query(
      `insert into trading_lab.competition_incidents (
        id, rehearsal_id, cohort_id, kind, status, reason, history_mutated
      ) values ($1,$2,$3,$4,'OPEN',$5,false)
      on conflict (id) do update set status = 'OPEN', reason = excluded.reason`,
      [incidentId, rehearsalId, rehearsal.rows[0].cohort_id, kind, reason],
    );
    await client.query(
      `update trading_lab.competition_rehearsals
       set state = 'INCIDENT_OPEN', real_cohort_activated = false, founding_cohort_launch_authorized = false
       where id = $1`,
      [rehearsalId],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'REHEARSAL_INCIDENT_OPEN','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:rehearsal-incident:${incidentId}`,
        rehearsal.rows[0].cohort_id,
        JSON.stringify({ rehearsalId, incidentId, operatorId, kind }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-rehearsal-incident',
      rehearsalId,
      incidentId,
      incidentStatus: 'OPEN',
      rehearsalState: 'INCIDENT_OPEN',
      historyMutated: false,
      ...rehearsalFlags(),
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original incident error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function rollbackRehearsalIncident(db, input = {}) {
  refuseRehearsalLaunch(input);
  const incidentId = requireId(input.incidentId, 'incidentId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const incident = await client.query(
      'select * from trading_lab.competition_incidents where id = $1 for update',
      [incidentId],
    );
    if (!incident.rows[0]) throw Object.assign(new Error('Incident not found.'), { statusCode: 404 });
    const locksBefore = await client.query(
      'select surface, fingerprint, locked, mutable from trading_lab.competition_history_locks where rehearsal_id = $1 order by surface',
      [incident.rows[0].rehearsal_id],
    );
    await client.query(
      `update trading_lab.competition_incidents
       set status = 'ROLLED_BACK', rolled_back_at = now(), history_mutated = false
       where id = $1`,
      [incidentId],
    );
    await client.query(
      `update trading_lab.competition_rehearsals
       set state = 'ROLLED_BACK', real_cohort_activated = false, founding_cohort_launch_authorized = false
       where id = $1`,
      [incident.rows[0].rehearsal_id],
    );
    const locksAfter = await client.query(
      'select surface, fingerprint, locked, mutable from trading_lab.competition_history_locks where rehearsal_id = $1 order by surface',
      [incident.rows[0].rehearsal_id],
    );
    const historyPreserved = JSON.stringify(locksBefore.rows) === JSON.stringify(locksAfter.rows)
      && locksAfter.rows.length === IMMUTABLE_HISTORY_SURFACES.length
      && locksAfter.rows.every((row) => row.locked && row.mutable === false);
    if (!historyPreserved) {
      throw Object.assign(new Error('Incident rollback cannot rewrite immutable competition history.'), { statusCode: 409 });
    }
    const cohort = await client.query(
      'select id, status from trading_lab.competition_cohorts where id = $1',
      [incident.rows[0].cohort_id],
    );
    if (cohort.rows[0]?.status === 'ACTIVE' || cohort.rows[0]?.status === 'LOCKED') {
      throw Object.assign(new Error('Dress rehearsal cannot leave the founding cohort launched.'), { statusCode: 409 });
    }
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'REHEARSAL_INCIDENT_ROLLBACK','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:rehearsal-rollback:${incidentId}`,
        incident.rows[0].cohort_id,
        JSON.stringify({
          rehearsalId: incident.rows[0].rehearsal_id,
          incidentId,
          operatorId,
          historyPreserved: true,
          realCohortActivated: false,
        }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-rehearsal-rollback',
      rehearsalId: incident.rows[0].rehearsal_id,
      incidentId,
      incidentStatus: 'ROLLED_BACK',
      rehearsalState: 'ROLLED_BACK',
      incidentRollbackProven: true,
      immutableHistoryProtected: true,
      historyLocks: locksAfter.rows.map((row) => row.surface),
      cohortStatus: cohort.rows[0]?.status || null,
      ...rehearsalFlags(),
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original rollback error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function completeLaunchRehearsal(db, input = {}) {
  refuseRehearsalLaunch(input);
  const rehearsalId = requireId(input.rehearsalId, 'rehearsalId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  const checklist = launchChecklist(input.checklist || {});
  const authorization = authorizeLaunch(checklist, { operatorApproved: false });
  const readiness = foundingCohortReadiness({
    gates: checklist.checks,
    humanCount: Number(input.humanCount || 0),
  });
  if (authorization.authorized || readiness.launchAuthorized) {
    throw Object.assign(new Error('Dress rehearsal cannot authorize founding-cohort launch.'), { statusCode: 409 });
  }
  try {
    lockFoundingCohort({
      readiness,
      cohortId: input.cohortId || REHEARSAL_DEFAULT_COHORT,
      startAt: 'denied',
      rulesFingerprint: 'denied',
      aiSealFingerprint: 'denied',
      scoringFingerprint: 'denied',
      lockedAt: 'denied',
    });
    throw Object.assign(new Error('Dress rehearsal cannot lock the founding cohort.'), { statusCode: 409 });
  } catch (error) {
    if (error.statusCode === 409) throw error;
  }
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const rehearsal = await client.query(
      'select id, cohort_id from trading_lab.competition_rehearsals where id = $1 for update',
      [rehearsalId],
    );
    if (!rehearsal.rows[0]) throw Object.assign(new Error('Rehearsal not found.'), { statusCode: 404 });
    const cohort = await client.query(
      'select status from trading_lab.competition_cohorts where id = $1',
      [rehearsal.rows[0].cohort_id],
    );
    if (cohort.rows[0]?.status === 'ACTIVE' || cohort.rows[0]?.status === 'LOCKED') {
      throw Object.assign(new Error('Dress rehearsal cannot complete as a founding-cohort launch.'), { statusCode: 409 });
    }
    await client.query(
      `update trading_lab.competition_rehearsals
       set state = 'COMPLETE', completed_at = now(), real_cohort_activated = false, founding_cohort_launch_authorized = false
       where id = $1`,
      [rehearsalId],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'REHEARSAL_COMPLETE','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:rehearsal-complete:${rehearsalId}`,
        rehearsal.rows[0].cohort_id,
        JSON.stringify({ rehearsalId, operatorId, launchAuthorized: false, realCohortActivated: false }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-cohort-rehearsal-complete',
      rehearsalId,
      cohortId: rehearsal.rows[0].cohort_id,
      rehearsalState: 'COMPLETE',
      readiness,
      launchAuthorization: authorization,
      ...rehearsalFlags(),
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original complete error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function readRehearsalStatus(db, cohortId = REHEARSAL_DEFAULT_COHORT) {
  const id = requireId(cohortId, 'cohortId');
  const rehearsal = await db.pool.query(
    `select r.*, c.status as cohort_status
     from trading_lab.competition_rehearsals r
     join trading_lab.competition_cohorts c on c.id = r.cohort_id
     where r.cohort_id = $1
     order by r.started_at desc
     limit 1`,
    [id],
  );
  const row = rehearsal.rows[0];
  const locks = row
    ? await db.pool.query(
      'select surface, fingerprint, locked, mutable from trading_lab.competition_history_locks where rehearsal_id = $1 order by surface',
      [row.id],
    )
    : { rows: [] };
  const incidents = row
    ? await db.pool.query(
      'select id, kind, status, history_mutated from trading_lab.competition_incidents where rehearsal_id = $1 order by opened_at desc',
      [row.id],
    )
    : { rows: [] };
  return {
    ok: true,
    proofType: 'founding-cohort-rehearsal-status',
    cohortId: id,
    rehearsalId: row?.id || null,
    rehearsalState: row?.state || 'NONE',
    rehearsalRan: Boolean(row),
    cohortStatus: row?.cohort_status || null,
    immutableSurfaces: locks.rows.map((item) => item.surface),
    immutableHistoryProtected: locks.rows.length === IMMUTABLE_HISTORY_SURFACES.length
      && locks.rows.every((item) => item.locked && item.mutable === false),
    openIncidents: incidents.rows.filter((item) => item.status === 'OPEN').length,
    rolledBackIncidents: incidents.rows.filter((item) => item.status === 'ROLLED_BACK').length,
    ...rehearsalFlags(),
  };
}
