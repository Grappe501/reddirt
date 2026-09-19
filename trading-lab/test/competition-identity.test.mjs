import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashContactHandle,
  humanBindingAllowsFill,
  publicBindingContract,
  publicIdentity,
  readCompetitionIdentity,
  writeCompetitionIdentityBind,
  writeCompetitionInvitation,
} from '../netlify/lib/competition-identity.mjs';
import { runCompetitionIdentityProof, IDENTITY_PROOF_IDS } from '../netlify/lib/competition-identity-proof.mjs';
import { handleRequest as invitation } from '../netlify/functions/competition-invitation.mjs';
import { handleRequest as bind } from '../netlify/functions/competition-identity-bind.mjs';
import { handleRequest as identity } from '../netlify/functions/competition-identity.mjs';
import { rejectForbiddenWrite, sanitizePublicCompetition } from '../netlify/lib/competition-http.mjs';

function createFakeIdentityDb() {
  const store = {
    invitations: new Map(),
    identities: new Map(),
    sessions: new Map(),
    portfolios: [],
    audits: [],
  };

  const query = async (sql, params = []) => {
    const text = String(sql);
    if (/^begin$/i.test(text.trim()) || /^commit$/i.test(text.trim()) || /^rollback$/i.test(text.trim())) return { rows: [] };
    if (/insert into trading_lab\.competition_invitations/i.test(text)) {
      if (!store.invitations.has(params[0])) {
        store.invitations.set(params[0], {
          invite_id: params[0],
          inviter_identity_id: params[1],
          invitee_identity_id: null,
          state: 'ISSUED',
          issued_at: params[2],
          expires_at: params[3],
          cash_value: 0,
          transferable: false,
          sellable: false,
        });
      }
      return { rows: [] };
    }
    if (/select invite_id, state, inviter_identity_id, cash_value/i.test(text)) {
      const row = store.invitations.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/from trading_lab\.competition_invitations where invite_id/i.test(text)) {
      const row = store.invitations.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (/update trading_lab\.competition_invitations/i.test(text)) {
      const row = store.invitations.get(params[0]);
      if (row) {
        row.state = 'CLAIMED';
        row.invitee_identity_id = params[1];
        row.claimed_at = '2026-09-19T00:00:00.000Z';
      }
      return { rows: [] };
    }
    if (/email_handle_hash = \$1|phone_handle_hash = \$1/i.test(text)) {
      const column = /email_handle_hash/.test(text) ? 'email_handle_hash' : 'phone_handle_hash';
      const n = [...store.identities.values()].filter((row) => row[column] === params[0] && row.identity_id !== params[1] && row.active_competition_identity).length;
      return { rows: [{ n }] };
    }
    if (/from trading_lab\.competition_identities where username/i.test(text)) {
      return { rows: [...store.identities.values()].filter((row) => row.username === params[0] && row.identity_id !== params[1]) };
    }
    if (/from trading_lab\.competition_portfolios where owner_id/i.test(text)) {
      return { rows: [{ n: store.portfolios.filter((row) => row.owner_id === params[0]).length }] };
    }
    if (/insert into trading_lab\.competition_identities/i.test(text)) {
      store.identities.set(params[0], {
        identity_id: params[0],
        invite_id: params[1],
        username: params[2],
        email_handle_hash: params[3],
        phone_handle_hash: params[4],
        email_verified: params[5],
        phone_verified: params[6],
        rules_accepted: params[7],
        rules_fingerprint: params[8],
        state: params[9],
        government_id_stored: false,
        credit_card_required: false,
        active_competition_identity: true,
        review_required: params[10],
      });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_sessions s/i.test(text) && /where s\.session_id/i.test(text)) {
      const session = [...store.sessions.values()].find((row) => row.session_id === params[0]);
      if (!session) return { rows: [] };
      return { rows: [{ ...store.identities.get(session.identity_id), session_live: !session.revoked_at, session_id: session.session_id }] };
    }
    if (/from trading_lab\.competition_identities i/i.test(text) && /where i\.identity_id/i.test(text)) {
      const row = store.identities.get(params[0]);
      if (!row) return { rows: [] };
      const session = [...store.sessions.values()].find((item) => item.identity_id === row.identity_id);
      const live = Boolean(session && !session.revoked_at);
      return { rows: [{ ...row, session_live: live, session_id: session?.session_id || null }] };
    }
    if (/from trading_lab\.competition_sessions where identity_id/i.test(text)) {
      const live = [...store.sessions.values()].find((row) => row.identity_id === params[0] && !row.revoked_at);
      return { rows: live ? [live] : [] };
    }
    if (/insert into trading_lab\.competition_sessions/i.test(text)) {
      store.sessions.set(params[0], { session_id: params[0], identity_id: params[1], revoked_at: null });
      return { rows: [] };
    }
    if (/update trading_lab\.competition_sessions set last_seen_at/i.test(text)) {
      return { rows: [] };
    }
    if (/insert into trading_lab\.competition_audit/i.test(text)) {
      store.audits.push({ id: params[0], action: params[1] });
      return { rows: [] };
    }
    if (/from trading_lab\.competition_identities i/i.test(text) && /join trading_lab\.competition_sessions s/i.test(text)) {
      const row = store.identities.get(params[0]);
      const session = [...store.sessions.values()].find((item) => item.identity_id === params[0]);
      return { rows: row && session ? [{ ...row, session_id: session.session_id, session_live: !session.revoked_at }] : [] };
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

test('public identity never includes contact handles or government ID', () => {
  const view = publicIdentity({
    identity_id: 'h1',
    invite_id: 'i1',
    username: 'player1',
    email_verified: true,
    phone_verified: true,
    rules_accepted: true,
    email_handle_hash: 'abc',
    phone_handle_hash: 'def',
  });
  assert.equal(view.state, 'COMPETITION_VERIFIED');
  assert.equal(view.governmentIdStored, false);
  assert.equal(view.creditCardRequired, false);
  assert.equal(view.foundingHuman, false);
  assert.equal('email_handle_hash' in view, false);
  assert.equal('phone' in view, false);
});

test('public binding contract starts at invitation and does not require a card', () => {
  const contract = publicBindingContract();
  assert.equal(contract.identity, null);
  assert.equal(contract.onboarding.next, 'INVITATION');
  assert.equal(contract.governmentIdRequired, false);
  assert.equal(contract.creditCardRequired, false);
  assert.equal(contract.escalatedReviewRoutine, false);
  assert.equal(contract.foundingCohortLaunchAuthorized, false);
});

test('contact handles are hashed and not reversible in storage', () => {
  const hash = hashContactHandle('v7-04-proof@wealth-builder.test');
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(hash, /wealth-builder\.test/);
});

test('risk signals require review rather than routine escalated signup', async () => {
  const db = createFakeIdentityDb();
  await writeCompetitionInvitation(db, {
    inviteId: 'invite-1',
    inviterIdentityId: 'inviter-1',
    issuedAt: '2026-09-19T00:00:00.000Z',
  });
  const result = await writeCompetitionIdentityBind(db, {
    identityId: 'human-1',
    inviteId: 'invite-1',
    username: 'player-one',
    emailHandle: 'player-one@wealth-builder.test',
    phoneHandle: '+10000000001',
    emailVerified: true,
    phoneVerified: true,
    rulesAccepted: true,
    rulesFingerprint: 'rules-1',
    riskSignals: ['DEVICE_RELATIONSHIP'],
  });
  assert.equal(result.identity.reviewRequired, true);
  assert.equal(result.identity.state, 'REVIEW_REQUIRED');
  assert.equal(result.integrity.automaticPermanentBan, false);
  assert.equal(result.integrity.escalatedReviewRoutine, false);
  assert.equal(result.cohortEntry.allowed, false);
  assert.equal(result.foundingHuman, false);
  assert.equal(humanBindingAllowsFill(db.store.identities.get('human-1'), true), false);
});

test('verified bind persists invitation, identity, session, and audit', async () => {
  const db = createFakeIdentityDb();
  const proof = await runCompetitionIdentityProof(db);
  assert.equal(proof.ok, true);
  assert.equal(proof.invitationVisible, true);
  assert.equal(proof.identityVisible, true);
  assert.equal(proof.sessionVisible, true);
  assert.equal(proof.rawContactStored, false);
  assert.equal(proof.foundingHuman, false);
  assert.equal(proof.foundingCohortLaunchAuthorized, false);
  assert.equal(proof.identity.username, IDENTITY_PROOF_IDS.username);
  assert.equal(proof.onboarding.readyForCohort, true);
  assert.equal(db.store.audits[0].action, 'IDENTITY_BOUND');
  const stored = db.store.identities.get(IDENTITY_PROOF_IDS.identity);
  assert.doesNotMatch(String(stored.email_handle_hash), /@/);
  assert.equal(humanBindingAllowsFill({ ...stored, session_live: true }, true), true);
});

test('one human cannot bind a second active identity on the same contact handles', async () => {
  const db = createFakeIdentityDb();
  await writeCompetitionInvitation(db, { inviteId: 'i1', inviterIdentityId: 'inviter', issuedAt: 't' });
  await writeCompetitionInvitation(db, { inviteId: 'i2', inviterIdentityId: 'inviter', issuedAt: 't' });
  await writeCompetitionIdentityBind(db, {
    identityId: 'h1',
    inviteId: 'i1',
    username: 'first-player',
    emailHandle: 'same@wealth-builder.test',
    phoneHandle: '+10000000011',
    emailVerified: true,
    phoneVerified: true,
    rulesAccepted: true,
    rulesFingerprint: 'rules',
  });
  await assert.rejects(
    () => writeCompetitionIdentityBind(db, {
      identityId: 'h2',
      inviteId: 'i2',
      username: 'second-player',
      emailHandle: 'same@wealth-builder.test',
      phoneHandle: '+10000000012',
      emailVerified: true,
      phoneVerified: true,
      rulesAccepted: true,
      rulesFingerprint: 'rules',
    }),
    /one active competition identity/i,
  );
});

test('identity GET without a session returns the public join contract', async () => {
  const db = createFakeIdentityDb();
  const result = await readCompetitionIdentity(db, {});
  assert.equal(result.identity, null);
  assert.equal(result.onboarding.next, 'INVITATION');
});

test('identity handlers reject launch, cards, and government ID storage', async () => {
  const launch = JSON.parse((await bind({ httpMethod: 'POST', body: JSON.stringify({ launch: true }) })).body);
  const card = JSON.parse((await invitation({ httpMethod: 'POST', body: JSON.stringify({ creditCardRequired: true }) })).body);
  const gov = rejectForbiddenWrite({ governmentIdStored: true });
  assert.equal(launch.ok, false);
  assert.equal(card.ok, false);
  assert.match(launch.message, /launch/i);
  assert.match(card.message, /Credit cards/i);
  assert.match(gov || '', /Government ID/i);
  const method = JSON.parse((await identity({ httpMethod: 'POST' })).body);
  assert.equal(method.ok, false);
});

test('identity responses cannot leak contact handles or connection secrets', () => {
  const leaked = sanitizePublicCompetition({
    ok: true,
    email: 'secret@example.test',
    phone: '555',
    emailHandle: 'secret@example.test',
    connectionString: 'postgres://user:pass@host/db',
    identity: { username: 'player1', emailVerified: true },
  });
  assert.equal('email' in leaked, false);
  assert.equal('phone' in leaked, false);
  assert.equal('emailHandle' in leaked, false);
  assert.equal('connectionString' in leaked, false);
  assert.equal(leaked.identity.username, 'player1');
});
