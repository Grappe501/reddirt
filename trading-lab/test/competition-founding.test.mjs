import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignFoundingHuman,
  isFabricatedIdentity,
  lockFoundingRoster,
  readFoundingReadiness,
  writeFoundingIntegrityReview,
} from '../netlify/lib/competition-founding.mjs';
import { runFoundingHumanProof } from '../netlify/lib/competition-founding-proof.mjs';
import { IDENTITY_PROOF_IDS } from '../netlify/lib/competition-identity-proof.mjs';
import { COMPETITION_PROOF_IDS } from '../netlify/lib/competition-db-proof.mjs';
import { handleRequest as assign } from '../netlify/functions/competition-founding-assign.mjs';
import { handleRequest as review } from '../netlify/functions/competition-founding-review.mjs';
import { handleRequest as readiness } from '../netlify/functions/competition-founding-readiness.mjs';

function createFakeFoundingDb() {
  const store = {
    cohorts: new Map([[COMPETITION_PROOF_IDS.cohort, { id: COMPETITION_PROOF_IDS.cohort, status: 'PROOF' }]]),
    identities: new Map(),
    reviews: [],
    rosters: new Map(),
    assignments: new Map(),
    members: new Map(),
    portfolios: new Map(),
    audits: [],
  };

  const query = async (sql, params = []) => {
    const text = String(sql);
    if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
    if (/from trading_lab\.competition_cohorts where id/i.test(text)) {
      const row = store.cohorts.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/insert into trading_lab\.competition_founding_rosters/i.test(text)) {
      if (!store.rosters.has(params[0])) store.rosters.set(params[0], { cohort_id: params[0], state: 'FILLING', locked: false });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_founding_rosters where cohort_id/i.test(text)) {
      const row = store.rosters.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_identities i/i.test(text) && /where i\.identity_id/i.test(text)) {
      const row = store.identities.get(params[0]);
      if (!row) return { rows: [] };
      const latest = [...store.reviews].reverse().find((item) => item.identity_id === row.identity_id);
      return { rows: [{ ...row, latest_decision: latest?.decision || null }] };
    }
    if (/from trading_lab\.competition_founding_assignments a/i.test(text)) {
      const rows = [...store.assignments.values()].filter((row) => !params[0] || row.cohort_id === params[0]);
      return { rows: rows.map((row) => ({ ...row, username: store.identities.get(row.identity_id)?.username })) };
    }
    if (/select identity_id from trading_lab\.competition_founding_assignments where cohort_id/i.test(text)
      || /select identity_id, integrity_clear from trading_lab\.competition_founding_assignments where cohort_id/i.test(text)) {
      return { rows: [...store.assignments.values()].filter((row) => row.cohort_id === params[0]) };
    }
    if (/insert into trading_lab\.competition_founding_assignments/i.test(text)) {
      const key = `${params[0]}:${params[1]}`;
      if ([...store.assignments.values()].some((row) => row.identity_id === params[1])) {
        throw new Error('duplicate key value violates unique constraint');
      }
      store.assignments.set(key, { cohort_id: params[0], identity_id: params[1], integrity_clear: params[2] !== false });
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_members/i.test(text)) {
      store.members.set(`${params[0]}:${params[1]}`, { cohort_id: params[0], human_id: params[1], verified: true });
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_portfolios/i.test(text)) {
      store.portfolios.set(params[0], { id: params[0], cohort_id: params[1], owner_id: params[2] });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_founding_rosters/i.test(text) && /ROSTER_LOCKED/i.test(text)) {
      const row = store.rosters.get(params[0]);
      if (row) Object.assign(row, { state: 'ROSTER_LOCKED', locked: true });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_founding_rosters/i.test(text)) {
      const row = store.rosters.get(params[0]);
      if (row) row.state = params[1];
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_integrity_reviews/i.test(text)) {
      store.reviews.push({
        id: params[0],
        identity_id: params[1],
        reviewer_id: params[2],
        decision: params[3],
        reason: params[4],
        decided_at: params[5],
      });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_identities/i.test(text)) {
      const row = store.identities.get(params[0]);
      if (row) {
        row.review_required = params[1];
        if (params[1]) row.state = 'REVIEW_REQUIRED';
        else if (row.email_verified && row.phone_verified) row.state = 'COMPETITION_VERIFIED';
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
    seedIdentity(id, extras = {}) {
      store.identities.set(id, {
        identity_id: id,
        invite_id: `invite-${id}`,
        username: id.replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'player',
        email_verified: true,
        phone_verified: true,
        rules_accepted: true,
        review_required: false,
        state: 'COMPETITION_VERIFIED',
        ...extras,
      });
    },
    pool: {
      connect: async () => ({ query, release() {} }),
      query,
    },
  };
}

test('fabricated proof identities never count as founding humans', () => {
  assert.equal(isFabricatedIdentity(IDENTITY_PROOF_IDS.identity), true);
  assert.equal(isFabricatedIdentity(COMPETITION_PROOF_IDS.human), true);
  assert.equal(isFabricatedIdentity('human-alpha-1'), false);
});

test('production proof rejects fabricated assignment and does not invent ten humans', async () => {
  const db = createFakeFoundingDb();
  const proof = await runFoundingHumanProof(db);
  assert.equal(proof.ok, true);
  assert.equal(proof.fabricatedAssignmentRejected, true);
  assert.equal(proof.fabricatedUsersCountAsProof, false);
  assert.equal(proof.foundingHumans, 0);
  assert.equal(proof.foundingHumansReady, false);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
  assert.ok(proof.readiness.missing.includes('TEN_VERIFIED_HUMANS'));
});

test('operator review and assignment fill a roster and lock only at 10/10', async () => {
  const db = createFakeFoundingDb();
  for (let i = 1; i <= 10; i += 1) {
    const identityId = `human-alpha-${i}`;
    db.seedIdentity(identityId);
    await writeFoundingIntegrityReview(db, {
      identityId,
      reviewerId: 'operator-v7-08',
      decision: 'CLEAR',
      reason: 'Integrity clear for founding roster.',
      decidedAt: `2026-09-19T00:00:0${i % 10}.000Z`,
    });
    const assigned = await assignFoundingHuman(db, {
      cohortId: COMPETITION_PROOF_IDS.cohort,
      identityId,
      operatorId: 'operator-v7-08',
    });
    assert.equal(assigned.foundingHuman, true);
  }
  const locked = await lockFoundingRoster(db, {
    cohortId: COMPETITION_PROOF_IDS.cohort,
    operatorId: 'operator-v7-08',
  });
  assert.equal(locked.rosterLocked, true);
  assert.equal(locked.foundingHumans, 10);
  assert.equal(locked.foundingCohortLaunchAuthorized, false);
  const ready = await readFoundingReadiness(db, COMPETITION_PROOF_IDS.cohort);
  assert.equal(ready.foundingHumans, 10);
  assert.equal(ready.foundingHumansReady, true);
  assert.equal(ready.foundingCohortLaunchAuthorized, false);
});

test('integrity hold and fabricated IDs cannot enter the founding roster', async () => {
  const db = createFakeFoundingDb();
  db.seedIdentity('human-held-1');
  await writeFoundingIntegrityReview(db, {
    identityId: 'human-held-1',
    reviewerId: 'operator-v7-08',
    decision: 'HOLD',
    reason: 'Relationship signal needs review.',
    decidedAt: '2026-09-19T00:00:00.000Z',
  });
  await assert.rejects(
    () => assignFoundingHuman(db, {
      cohortId: COMPETITION_PROOF_IDS.cohort,
      identityId: 'human-held-1',
      operatorId: 'operator-v7-08',
    }),
    /not verified|integrity/i,
  );
  await assert.rejects(
    () => assignFoundingHuman(db, {
      cohortId: COMPETITION_PROOF_IDS.cohort,
      identityId: IDENTITY_PROOF_IDS.identity,
      operatorId: 'operator-v7-08',
    }),
    /fabricated/i,
  );
});

test('founding handlers reject launch and stay method-safe', async () => {
  const launch = JSON.parse((await assign({ httpMethod: 'POST', body: JSON.stringify({ launch: true }) })).body);
  const method = JSON.parse((await readiness({ httpMethod: 'POST' })).body);
  const reviewDenied = JSON.parse((await review({ httpMethod: 'GET' })).body);
  assert.equal(launch.ok, false);
  assert.match(launch.message, /launch/i);
  assert.equal(method.ok, false);
  assert.equal(reviewDenied.ok, false);
});
