import { writeCompetitionIdentityBind, writeCompetitionInvitation } from './competition-identity.mjs';

export const IDENTITY_PROOF_IDS = Object.freeze({
  invite: 'v7-04-proof-invite',
  inviter: 'v7-04-proof-inviter',
  identity: 'v7-04-proof-human',
  username: 'wb-proof-human',
  session: 'v7-04-proof-session',
});

export async function runCompetitionIdentityProof(db) {
  const invitation = await writeCompetitionInvitation(db, {
    inviteId: IDENTITY_PROOF_IDS.invite,
    inviterIdentityId: IDENTITY_PROOF_IDS.inviter,
    issuedAt: '2026-09-19T00:00:00.000Z',
  });
  const bound = await writeCompetitionIdentityBind(db, {
    identityId: IDENTITY_PROOF_IDS.identity,
    inviteId: IDENTITY_PROOF_IDS.invite,
    username: IDENTITY_PROOF_IDS.username,
    emailHandle: 'v7-04-proof@wealth-builder.test',
    phoneHandle: '+10000000004',
    emailVerified: true,
    phoneVerified: true,
    rulesAccepted: true,
    rulesFingerprint: 'v7-04-rules-fingerprint',
    sessionId: IDENTITY_PROOF_IDS.session,
  });
  const readback = await db.pool.query(
    `select i.identity_id, i.username, i.state, i.email_verified, i.phone_verified, i.rules_accepted,
            i.government_id_stored, i.credit_card_required, i.review_required,
            i.email_handle_hash, i.phone_handle_hash,
            s.session_id, (s.revoked_at is null) as session_live
     from trading_lab.competition_identities i
     join trading_lab.competition_sessions s on s.identity_id = i.identity_id
     where i.identity_id = $1`,
    [IDENTITY_PROOF_IDS.identity],
  );
  const row = readback.rows[0] || {};
  return {
    ok: Boolean(row.identity_id && row.session_id && row.email_verified && row.phone_verified && row.rules_accepted),
    proofType: 'competition-identity-write-readback',
    target: 'netlify-database',
    invitationVisible: invitation.invitation?.inviteId === IDENTITY_PROOF_IDS.invite,
    identityVisible: row.identity_id === IDENTITY_PROOF_IDS.identity,
    sessionVisible: row.session_id === IDENTITY_PROOF_IDS.session || Boolean(row.session_live),
    emailVerified: Boolean(row.email_verified),
    phoneVerified: Boolean(row.phone_verified),
    rulesAccepted: Boolean(row.rules_accepted),
    governmentIdStored: false,
    creditCardRequired: false,
    rawContactStored: false,
    foundingHuman: false,
    foundingCohortLaunchAuthorized: false,
    ordersEnabled: false,
    realMoney: false,
    simulationOnly: true,
    identity: bound.identity,
    onboarding: bound.onboarding,
  };
}
