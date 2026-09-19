import { addVerifiedHuman, createCohort, COHORT_HUMAN_CAPACITY } from '../../src/v5-cohort-lobby.js';
import { assessHumanIntegrity, recordIntegrityDecision } from '../../src/v5-human-integrity-engine.js';
import { foundingCohortReadiness } from '../../src/v5-founding-cohort-launch.js';
import { canEnterCohort, createCompetitionIdentity, evaluateIdentityIntegrity } from '../../src/v5-verified-human-identity.js';
import { COMPETITION_PROOF_IDS } from './competition-db-proof.mjs';
import { IDENTITY_PROOF_IDS } from './competition-identity-proof.mjs';

export const FOUNDING_CAPACITY = COHORT_HUMAN_CAPACITY;
const FABRICATED = /(?:^|[-_])proof(?:[-_]|$)|synthetic-|wb-proof-/i;
const FABRICATED_IDS = new Set([
  COMPETITION_PROOF_IDS.human,
  IDENTITY_PROOF_IDS.identity,
  IDENTITY_PROOF_IDS.inviter,
]);

export function isFabricatedIdentity(identityId) {
  const id = String(identityId || '');
  return !id || FABRICATED_IDS.has(id) || FABRICATED.test(id);
}

export function publicFoundingAssignment(row = {}) {
  return {
    identityId: row.identity_id || row.identityId,
    username: row.username || null,
    integrityClear: Boolean(row.integrity_clear ?? row.integrityClear),
    foundingHuman: true,
  };
}

function requireId(value, label) {
  const id = String(value || '').trim();
  if (!id || id.length > 80) throw Object.assign(new Error(`${label} is required.`), { statusCode: 400 });
  return id;
}

function identityEligible(row) {
  if (!row) return { allowed: false, reason: 'IDENTITY_NOT_FOUND' };
  if (isFabricatedIdentity(row.identity_id)) return { allowed: false, reason: 'FABRICATED_IDENTITY' };
  const identity = createCompetitionIdentity({
    identityId: row.identity_id,
    inviteId: row.invite_id,
    username: row.username,
    emailVerified: row.email_verified,
    phoneVerified: row.phone_verified,
  });
  const integrity = evaluateIdentityIntegrity({
    activeIdentityCount: 1,
    portfolioCountInCohort: 1,
    riskSignals: [],
  });
  integrity.reviewRequired = Boolean(row.review_required) || integrity.reviewRequired;
  integrity.eligible = integrity.eligible && !row.review_required;
  const entry = canEnterCohort(identity, {
    eligible: integrity.eligible && Boolean(row.rules_accepted),
    reviewRequired: integrity.reviewRequired,
  });
  if (!entry.allowed) return entry;
  if (row.latest_decision !== 'CLEAR') {
    return { allowed: false, reason: 'INTEGRITY_REVIEW_REQUIRED' };
  }
  return { allowed: true, reason: 'ELIGIBLE' };
}

export async function readFoundingReadiness(db, cohortId) {
  const id = cohortId ? requireId(cohortId, 'cohortId') : null;
  const assignments = await db.pool.query(
    `select a.identity_id, a.integrity_clear, i.username
     from trading_lab.competition_founding_assignments a
     join trading_lab.competition_identities i on i.identity_id = a.identity_id
     ${id ? 'where a.cohort_id = $1' : ''}
     order by a.assigned_at asc`,
    id ? [id] : [],
  );
  const real = assignments.rows.filter((row) => !isFabricatedIdentity(row.identity_id));
  const roster = id
    ? await db.pool.query(
      'select state, locked, founding_cohort_launch_authorized from trading_lab.competition_founding_rosters where cohort_id = $1',
      [id],
    )
    : { rows: [] };
  const count = real.length;
  const readiness = foundingCohortReadiness({
    gates: {
      TEN_VERIFIED_HUMANS: count === FOUNDING_CAPACITY,
      INTEGRITY_CLEAR: count === FOUNDING_CAPACITY && real.every((row) => row.integrity_clear),
    },
    humanCount: count,
  });
  return {
    ok: true,
    proofType: 'founding-human-readiness',
    cohortId: id,
    foundingHumans: count,
    seatsLeft: Math.max(0, FOUNDING_CAPACITY - count),
    rosterState: roster.rows[0]?.state || (count === FOUNDING_CAPACITY ? 'FULL' : 'FILLING'),
    rosterLocked: Boolean(roster.rows[0]?.locked),
    foundingHumansReady: count === FOUNDING_CAPACITY && real.every((row) => row.integrity_clear),
    humans: real.map(publicFoundingAssignment),
    readiness,
    fabricatedUsersCountAsProof: false,
    foundingCohortLaunchAuthorized: false,
    simulationOnly: true,
  };
}

export async function writeFoundingIntegrityReview(db, input = {}) {
  const identityId = requireId(input.identityId, 'identityId');
  const reviewerId = requireId(input.reviewerId, 'reviewerId');
  const decision = String(input.decision || '').toUpperCase();
  if (!['CLEAR', 'HOLD', 'ESCALATE'].includes(decision)) {
    throw Object.assign(new Error('Integrity decision must be CLEAR, HOLD, or ESCALATE.'), { statusCode: 400 });
  }
  if (isFabricatedIdentity(identityId)) {
    throw Object.assign(new Error('Fabricated identities cannot receive founding integrity clearance.'), { statusCode: 409 });
  }
  const assessment = assessHumanIntegrity({
    identityId,
    signals: Array.isArray(input.signals) ? input.signals : [],
  });
  const recorded = recordIntegrityDecision({
    assessment,
    reviewerId,
    decision,
    reason: String(input.reason || '').trim() || 'Operator integrity review.',
    decidedAt: input.decidedAt || new Date().toISOString(),
  });
  const reviewRequired = decision !== 'CLEAR';
  await db.pool.query(
    `insert into trading_lab.competition_integrity_reviews (
      id, identity_id, reviewer_id, decision, reason, decided_at, automatic
    ) values ($1,$2,$3,$4,$5,$6,false)`,
    [
      input.reviewId || `review:${identityId}:${recorded.decidedAt}`,
      identityId,
      reviewerId,
      decision,
      recorded.reason,
      recorded.decidedAt,
    ],
  );
  await db.pool.query(
    `update trading_lab.competition_identities
     set review_required = $2,
         state = case
           when $2 then 'REVIEW_REQUIRED'
           when email_verified and phone_verified then 'COMPETITION_VERIFIED'
           else state
         end
     where identity_id = $1`,
    [identityId, reviewRequired],
  );
  await db.pool.query(
    `insert into trading_lab.competition_audit (
      id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
    ) values ($1,$2,'HUMAN',null,null,$3::jsonb,false,false)
    on conflict (id) do nothing`,
    [
      `audit:integrity:${identityId}:${recorded.decidedAt}`,
      reviewRequired ? 'INTEGRITY_HOLD' : 'INTEGRITY_CLEAR',
      JSON.stringify({ identityId, decision, automaticPermanentBan: false }),
    ],
  );
  return {
    ok: true,
    proofType: 'founding-integrity-review',
    review: {
      identityId,
      decision,
      reviewRequired,
      automaticPermanentBan: false,
      automatic: false,
    },
    foundingCohortLaunchAuthorized: false,
    simulationOnly: true,
  };
}

async function loadAssignableIdentity(client, identityId) {
  const result = await client.query(
    `select i.*, (
       select r.decision from trading_lab.competition_integrity_reviews r
       where r.identity_id = i.identity_id
       order by r.decided_at desc limit 1
     ) as latest_decision
     from trading_lab.competition_identities i
     where i.identity_id = $1`,
    [identityId],
  );
  return result.rows[0];
}

export async function assignFoundingHuman(db, input = {}) {
  const cohortId = requireId(input.cohortId, 'cohortId');
  const identityId = requireId(input.identityId, 'identityId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  if (isFabricatedIdentity(identityId)) {
    throw Object.assign(new Error('Fabricated identities cannot be assigned as founding humans.'), { statusCode: 409 });
  }

  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const cohort = await client.query(
      'select id, status from trading_lab.competition_cohorts where id = $1 for update',
      [cohortId],
    );
    if (!cohort.rows[0]) throw Object.assign(new Error('Cohort not found.'), { statusCode: 404 });
    if (cohort.rows[0].status === 'LOCKED' || cohort.rows[0].status === 'ACTIVE') {
      throw Object.assign(new Error('Founding roster cannot be changed on a launched or locked cohort.'), { statusCode: 409 });
    }
    await client.query(
      `insert into trading_lab.competition_founding_rosters (
        cohort_id, state, locked, founding_cohort_launch_authorized
      ) values ($1,'FILLING',false,false)
      on conflict (cohort_id) do nothing`,
      [cohortId],
    );
    const roster = await client.query(
      'select state, locked from trading_lab.competition_founding_rosters where cohort_id = $1 for update',
      [cohortId],
    );
    if (roster.rows[0]?.locked) {
      throw Object.assign(new Error('Founding roster is already locked at 10/10.'), { statusCode: 409 });
    }
    const identity = await loadAssignableIdentity(client, identityId);
    const eligible = identityEligible(identity);
    if (!eligible.allowed) {
      throw Object.assign(new Error(eligible.reason === 'FABRICATED_IDENTITY'
        ? 'Fabricated identities cannot be assigned as founding humans.'
        : 'Identity is not verified, integrity-clear, and rules-accepted.'), { statusCode: 409 });
    }
    const existing = await client.query(
      'select identity_id from trading_lab.competition_founding_assignments where cohort_id = $1 order by assigned_at',
      [cohortId],
    );
    let draft = createCohort({ cohortId, sequence: 1 });
    for (const row of existing.rows) {
      draft = addVerifiedHuman(draft, { identityId: row.identity_id, verified: true, integrityEligible: true });
    }
    draft = addVerifiedHuman(draft, { identityId, verified: true, integrityEligible: true });
    await client.query(
      `insert into trading_lab.competition_founding_assignments (
        cohort_id, identity_id, integrity_clear, fabricated
      ) values ($1,$2,true,false)`,
      [cohortId, identityId],
    );
    await client.query(
      `insert into trading_lab.competition_members (cohort_id, human_id, verified)
       values ($1,$2,true)
       on conflict (cohort_id, human_id) do update set verified = true`,
      [cohortId, identityId],
    );
    await client.query(
      `insert into trading_lab.competition_portfolios (
        id, cohort_id, owner_id, owner_type, starting_cash, cash
      ) values ($1,$2,$3,'HUMAN',100000,100000)
      on conflict (id) do nothing`,
      [`founding:${cohortId}:${identityId}`.slice(0, 80), cohortId, identityId],
    );
    const full = draft.state === 'FULL';
    await client.query(
      `update trading_lab.competition_founding_rosters
       set state = $2, locked = false, founding_cohort_launch_authorized = false
       where cohort_id = $1`,
      [cohortId, full ? 'FULL' : 'FILLING'],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'FOUNDING_ASSIGNED','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:founding-assign:${cohortId}:${identityId}`,
        cohortId,
        JSON.stringify({ identityId, operatorId, foundingHumans: draft.humanIdentityIds.length, fabricated: false }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-human-assign',
      cohortId,
      identityId,
      foundingHuman: true,
      foundingHumans: draft.humanIdentityIds.length,
      seatsLeft: FOUNDING_CAPACITY - draft.humanIdentityIds.length,
      rosterState: full ? 'FULL' : 'FILLING',
      rosterLocked: false,
      foundingCohortLaunchAuthorized: false,
      simulationOnly: true,
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original assignment/validation error.
    }
    if (/duplicate|unique/i.test(String(error.message))) {
      throw Object.assign(new Error('One human may hold only one founding assignment.'), { statusCode: 409 });
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function lockFoundingRoster(db, input = {}) {
  const cohortId = requireId(input.cohortId, 'cohortId');
  const operatorId = requireId(input.operatorId, 'operatorId');
  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const roster = await client.query(
      'select * from trading_lab.competition_founding_rosters where cohort_id = $1 for update',
      [cohortId],
    );
    if (!roster.rows[0]) throw Object.assign(new Error('Founding roster not found.'), { statusCode: 404 });
    const assigned = await client.query(
      'select identity_id, integrity_clear from trading_lab.competition_founding_assignments where cohort_id = $1',
      [cohortId],
    );
    const real = assigned.rows.filter((row) => !isFabricatedIdentity(row.identity_id) && row.integrity_clear);
    if (real.length !== FOUNDING_CAPACITY) {
      throw Object.assign(new Error('Founding roster locks only at exactly ten actual verified humans.'), { statusCode: 409 });
    }
    await client.query(
      `update trading_lab.competition_founding_rosters
       set state = 'ROSTER_LOCKED', locked = true, locked_at = now(), founding_cohort_launch_authorized = false
       where cohort_id = $1`,
      [cohortId],
    );
    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,'FOUNDING_ROSTER_LOCKED','HUMAN',$2,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:founding-lock:${cohortId}`,
        cohortId,
        JSON.stringify({ operatorId, foundingHumans: real.length, launchAuthorized: false }),
      ],
    );
    await client.query('commit');
    return {
      ok: true,
      proofType: 'founding-roster-lock',
      cohortId,
      foundingHumans: real.length,
      rosterLocked: true,
      rosterState: 'ROSTER_LOCKED',
      foundingCohortLaunchAuthorized: false,
      automaticLaunch: false,
      simulationOnly: true,
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original lock/validation error.
    }
    throw error;
  } finally {
    client.release();
  }
}
