-- V7-04 Verified Human Binding.
-- Store invitation, verification flags, username, rules acceptance, and
-- session state. Do not store raw email, phone, government ID, or cards.
-- Do not use reserved role keywords as unquoted column names.
create table if not exists trading_lab.competition_invitations (
  invite_id text primary key,
  inviter_identity_id text not null,
  invitee_identity_id text,
  state text not null check (state in ('ISSUED', 'CLAIMED')),
  issued_at timestamptz not null,
  claimed_at timestamptz,
  expires_at timestamptz,
  cash_value numeric not null default 0 check (cash_value = 0),
  transferable boolean not null default false check (transferable = false),
  sellable boolean not null default false check (sellable = false)
);

create table if not exists trading_lab.competition_identities (
  identity_id text primary key,
  invite_id text not null references trading_lab.competition_invitations(invite_id),
  username text not null,
  email_handle_hash text,
  phone_handle_hash text,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  rules_accepted boolean not null default false,
  rules_fingerprint text,
  state text not null,
  government_id_stored boolean not null default false check (government_id_stored = false),
  credit_card_required boolean not null default false check (credit_card_required = false),
  active_competition_identity boolean not null default true,
  review_required boolean not null default false,
  created_at timestamptz not null default now(),
  unique (invite_id),
  unique (username)
);

create unique index if not exists competition_identities_email_hash_uidx
  on trading_lab.competition_identities(email_handle_hash)
  where email_handle_hash is not null;

create unique index if not exists competition_identities_phone_hash_uidx
  on trading_lab.competition_identities(phone_handle_hash)
  where phone_handle_hash is not null;

create table if not exists trading_lab.competition_sessions (
  session_id text primary key,
  identity_id text not null references trading_lab.competition_identities(identity_id),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists competition_sessions_identity_live_idx
  on trading_lab.competition_sessions(identity_id)
  where revoked_at is null;
