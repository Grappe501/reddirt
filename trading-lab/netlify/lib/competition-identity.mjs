import { createHash, randomUUID } from 'node:crypto';
import { canEnterCohort, createCompetitionIdentity, evaluateIdentityIntegrity } from '../../src/v5-verified-human-identity.js';
import { claimInvitation, issueInvitation } from '../../src/v5-invitation-vouch-graph.js';
import { onboardingState } from '../../src/v6-competition-lobby.js';

const USERNAME = /^[a-z0-9][a-z0-9-]{1,22}[a-z0-9]$/;

export function hashContactHandle(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;
  return createHash('sha256').update(normalized).digest('hex');
}

export function publicIdentity(row = {}) {
  const identity = createCompetitionIdentity({
    identityId: row.identity_id || row.identityId,
    inviteId: row.invite_id || row.inviteId,
    username: row.username,
    emailVerified: Boolean(row.email_verified ?? row.emailVerified),
    phoneVerified: Boolean(row.phone_verified ?? row.phoneVerified),
  });
  const integrity = {
    eligible: row.review_required === true ? false : true,
    reviewRequired: Boolean(row.review_required ?? row.reviewRequired),
  };
  const entry = canEnterCohort(identity, {
    eligible: integrity.eligible && Boolean(row.rules_accepted ?? row.rulesAccepted),
    reviewRequired: integrity.reviewRequired,
  });
  return {
    identityId: identity.identityId,
    username: identity.username,
    state: row.review_required ? 'REVIEW_REQUIRED' : identity.state,
    emailVerified: identity.emailVerified,
    phoneVerified: identity.phoneVerified,
    rulesAccepted: Boolean(row.rules_accepted ?? row.rulesAccepted),
    invitationValid: true,
    governmentIdStored: false,
    creditCardRequired: false,
    activeCompetitionIdentity: row.active_competition_identity !== false,
    reviewRequired: Boolean(row.review_required ?? row.reviewRequired),
    cohortEligible: entry.allowed,
    foundingHuman: false,
  };
}

export function humanBindingAllowsFill(row, sessionLive = false) {
  if (!row) return false;
  if (row.owner_type && row.owner_type !== 'HUMAN') return false;
  const view = publicIdentity(row);
  return view.state === 'COMPETITION_VERIFIED'
    && view.rulesAccepted
    && view.activeCompetitionIdentity
    && !view.reviewRequired
    && sessionLive === true;
}

export function publicBindingContract() {
  const onboarding = onboardingState({});
  return {
    ok: true,
    proofType: 'competition-identity',
    bindingReady: true,
    governmentIdRequired: false,
    creditCardRequired: false,
    oneActiveCompetitionIdentity: true,
    escalatedReviewRoutine: false,
    foundingCohortLaunchAuthorized: false,
    foundingHuman: false,
    identity: null,
    onboarding,
    simulationOnly: true,
  };
}

function requireId(value, label) {
  const id = String(value || '').trim();
  if (!id || id.length > 80) throw Object.assign(new Error(`${label} is required.`), { statusCode: 400 });
  return id;
}

function requireUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  if (!USERNAME.test(username)) throw Object.assign(new Error('Username must be 3-24 letters, numbers, or hyphens.'), { statusCode: 400 });
  return username;
}

export async function writeCompetitionInvitation(db, input = {}) {
  const invitation = issueInvitation({
    inviteId: requireId(input.inviteId, 'inviteId'),
    inviterIdentityId: requireId(input.inviterIdentityId, 'inviterIdentityId'),
    issuedAt: input.issuedAt || new Date().toISOString(),
    expiresAt: input.expiresAt || null,
  });
  await db.pool.query(
    `insert into trading_lab.competition_invitations (
      invite_id, inviter_identity_id, invitee_identity_id, state, issued_at, expires_at, cash_value, transferable, sellable
    ) values ($1,$2,null,'ISSUED',$3,$4,0,false,false)
    on conflict (invite_id) do nothing`,
    [invitation.inviteId, invitation.inviterIdentityId, invitation.issuedAt, invitation.expiresAt],
  );
  const existing = await db.pool.query(
    'select invite_id, state, inviter_identity_id, cash_value, transferable, sellable from trading_lab.competition_invitations where invite_id = $1',
    [invitation.inviteId],
  );
  const row = existing.rows[0];
  if (!row) throw Object.assign(new Error('Invitation was not persisted.'), { statusCode: 500 });
  return {
    ok: true,
    proofType: 'competition-invitation',
    invitation: {
      inviteId: row.invite_id,
      state: row.state,
      cashValue: 0,
      transferable: false,
      sellable: false,
    },
    simulationOnly: true,
  };
}

export async function readCompetitionIdentity(db, { identityId, sessionId } = {}) {
  if (!identityId && !sessionId) return publicBindingContract();
  const result = sessionId
    ? await db.pool.query(
      `select i.*, (s.revoked_at is null) as session_live, s.session_id
       from trading_lab.competition_sessions s
       join trading_lab.competition_identities i on i.identity_id = s.identity_id
       where s.session_id = $1`,
      [sessionId],
    )
    : await db.pool.query(
      `select i.*, exists(
         select 1 from trading_lab.competition_sessions s
         where s.identity_id = i.identity_id and s.revoked_at is null
       ) as session_live, null as session_id
       from trading_lab.competition_identities i
       where i.identity_id = $1`,
      [identityId],
    );
  const row = result.rows[0];
  if (!row) throw Object.assign(new Error('Identity not found.'), { statusCode: 404 });
  const identity = publicIdentity(row);
  return {
    ok: true,
    proofType: 'competition-identity',
    bindingReady: true,
    governmentIdRequired: false,
    creditCardRequired: false,
    oneActiveCompetitionIdentity: true,
    escalatedReviewRoutine: false,
    foundingCohortLaunchAuthorized: false,
    foundingHuman: false,
    identity,
    onboarding: onboardingState({
      invitationValid: identity.invitationValid,
      emailVerified: identity.emailVerified,
      phoneVerified: identity.phoneVerified,
      username: identity.username,
      rulesAccepted: identity.rulesAccepted,
    }),
    sessionLive: Boolean(row.session_live),
    simulationOnly: true,
  };
}

async function countHandleIdentities(client, column, hash, exceptId) {
  if (!hash) return 0;
  const qualified = column === 'phone_handle_hash' ? 'phone_handle_hash' : 'email_handle_hash';
  const result = await client.query(
    `select count(*)::int as n
     from trading_lab.competition_identities
     where ${qualified} = $1 and identity_id <> $2 and active_competition_identity = true`,
    [hash, exceptId],
  );
  return Number(result.rows[0]?.n || 0);
}

export async function writeCompetitionIdentityBind(db, input = {}) {
  const identityId = requireId(input.identityId, 'identityId');
  const inviteId = requireId(input.inviteId, 'inviteId');
  const username = requireUsername(input.username);
  const emailHash = hashContactHandle(input.emailHandle);
  const phoneHash = hashContactHandle(input.phoneHandle);
  const emailVerified = Boolean(input.emailVerified);
  const phoneVerified = Boolean(input.phoneVerified);
  const rulesAccepted = Boolean(input.rulesAccepted);
  const rulesFingerprint = rulesAccepted ? String(input.rulesFingerprint || '').trim() : '';
  if (rulesAccepted && !rulesFingerprint) {
    throw Object.assign(new Error('rulesFingerprint is required when rules are accepted.'), { statusCode: 400 });
  }

  const identity = createCompetitionIdentity({
    identityId,
    inviteId,
    username,
    emailVerified,
    phoneVerified,
  });

  const client = await db.pool.connect();
  try {
    await client.query('begin');
    const invite = await client.query(
      'select * from trading_lab.competition_invitations where invite_id = $1 for update',
      [inviteId],
    );
    const inviteRow = invite.rows[0];
    if (!inviteRow) throw Object.assign(new Error('Invitation not found.'), { statusCode: 404 });
    if (inviteRow.state === 'CLAIMED' && inviteRow.invitee_identity_id && inviteRow.invitee_identity_id !== identityId) {
      throw Object.assign(new Error('Invitation is already bound to another identity.'), { statusCode: 409 });
    }
    if (inviteRow.state === 'ISSUED') {
      claimInvitation({
        inviteId: inviteRow.invite_id,
        inviterIdentityId: inviteRow.inviter_identity_id,
        issuedAt: inviteRow.issued_at,
        expiresAt: inviteRow.expires_at,
        state: 'ISSUED',
        cashValue: 0,
        transferable: false,
        sellable: false,
      }, { inviteeIdentityId: identityId, claimedAt: new Date().toISOString() });
      await client.query(
        `update trading_lab.competition_invitations
         set state = 'CLAIMED', invitee_identity_id = $2, claimed_at = now()
         where invite_id = $1`,
        [inviteId, identityId],
      );
    }

    const emailCount = await countHandleIdentities(client, 'email_handle_hash', emailHash, identityId);
    const phoneCount = await countHandleIdentities(client, 'phone_handle_hash', phoneHash, identityId);
    const usernameClash = await client.query(
      'select identity_id from trading_lab.competition_identities where username = $1 and identity_id <> $2',
      [username, identityId],
    );
    if (usernameClash.rows[0]) {
      throw Object.assign(new Error('Username is already bound to another competition identity.'), { statusCode: 409 });
    }

    const activeIdentityCount = 1 + emailCount + phoneCount;
    const portfolios = await client.query(
      'select count(*)::int as n from trading_lab.competition_portfolios where owner_id = $1',
      [identityId],
    );
    const integrity = evaluateIdentityIntegrity({
      activeIdentityCount,
      portfolioCountInCohort: Number(portfolios.rows[0]?.n || 0),
      riskSignals: Array.isArray(input.riskSignals) ? input.riskSignals : [],
    });
    if (emailCount > 0 || phoneCount > 0) {
      throw Object.assign(new Error('One human may hold only one active competition identity.'), { statusCode: 409 });
    }

    const reviewRequired = integrity.reviewRequired;
    const persistedState = reviewRequired ? 'REVIEW_REQUIRED' : identity.state;
    await client.query(
      `insert into trading_lab.competition_identities (
        identity_id, invite_id, username, email_handle_hash, phone_handle_hash,
        email_verified, phone_verified, rules_accepted, rules_fingerprint, state,
        government_id_stored, credit_card_required, active_competition_identity, review_required
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,false,true,$11)
      on conflict (identity_id) do update set
        username = excluded.username,
        email_handle_hash = excluded.email_handle_hash,
        phone_handle_hash = excluded.phone_handle_hash,
        email_verified = excluded.email_verified,
        phone_verified = excluded.phone_verified,
        rules_accepted = excluded.rules_accepted,
        rules_fingerprint = excluded.rules_fingerprint,
        state = excluded.state,
        review_required = excluded.review_required`,
      [
        identityId,
        inviteId,
        username,
        emailHash,
        phoneHash,
        emailVerified,
        phoneVerified,
        rulesAccepted,
        rulesFingerprint || null,
        persistedState,
        reviewRequired,
      ],
    );

    const liveSession = await client.query(
      'select session_id from trading_lab.competition_sessions where identity_id = $1 and revoked_at is null order by created_at desc limit 1',
      [identityId],
    );
    const sessionId = liveSession.rows[0]?.session_id || input.sessionId || `sess_${randomUUID()}`;
    if (!liveSession.rows[0]) {
      await client.query(
        `insert into trading_lab.competition_sessions (session_id, identity_id)
         values ($1,$2)
         on conflict (session_id) do update set last_seen_at = now(), revoked_at = null`,
        [sessionId, identityId],
      );
    } else {
      await client.query(
        'update trading_lab.competition_sessions set last_seen_at = now() where session_id = $1',
        [sessionId],
      );
    }

    await client.query(
      `insert into trading_lab.competition_audit (
        id, action, actor_type, cohort_id, portfolio_id, detail, orders_enabled, real_money
      ) values ($1,$2,'HUMAN',null,null,$3::jsonb,false,false)
      on conflict (id) do nothing`,
      [
        `audit:identity:${identityId}`,
        reviewRequired ? 'IDENTITY_REVIEW_REQUIRED' : 'IDENTITY_BOUND',
        JSON.stringify({
          identityId,
          inviteId,
          state: persistedState,
          rulesAccepted,
          reviewRequired,
          governmentIdStored: false,
          creditCardRequired: false,
        }),
      ],
    );

    await client.query('commit');
    const view = publicIdentity({
      identity_id: identityId,
      invite_id: inviteId,
      username,
      email_verified: emailVerified,
      phone_verified: phoneVerified,
      rules_accepted: rulesAccepted,
      review_required: reviewRequired,
      active_competition_identity: true,
    });
    return {
      ok: true,
      proofType: 'competition-identity-bind',
      identity: view,
      onboarding: onboardingState({
        invitationValid: true,
        emailVerified,
        phoneVerified,
        username,
        rulesAccepted,
      }),
      session: { id: sessionId },
      integrity: {
        eligible: integrity.eligible,
        reviewRequired: integrity.reviewRequired,
        automaticPermanentBan: false,
        escalatedReviewRoutine: false,
      },
      cohortEntry: canEnterCohort(identity, {
        eligible: integrity.eligible && rulesAccepted,
        reviewRequired: integrity.reviewRequired,
      }),
      foundingHuman: false,
      simulationOnly: true,
    };
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // Preserve the original bind/validation error.
    }
    throw error;
  } finally {
    client.release();
  }
}
