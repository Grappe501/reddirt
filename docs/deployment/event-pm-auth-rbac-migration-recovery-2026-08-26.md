# Event PM Auth/RBAC Migration Recovery — 2026-08-26/27

## Failed migration

`20260826011500_event_pm_auth_rbac`

## Original PostgreSQL failure

```text
Database error code: 42703
ERROR: column "campaignKey" does not exist
(at index creation — ComputeIndexAttrs)
```

Prisma `_prisma_migrations` at failure:

- `started_at`: 2026-08-26 06:06:11 UTC
- `finished_at`: null
- `applied_steps_count`: 0
- `rolled_back_at`: null (until recovery)

## Root cause

The **first** version of this migration (commit `347ba3d7`) attempted to:

1. `CREATE TABLE IF NOT EXISTS "CampaignMembership"` with a new `campaignKey`-based shape
2. Then create indexes on `"CampaignMembership"("campaignKey", ...)`

Production already had `"CampaignMembership"` from `20260521140000_campaign_tenancy_foundation` with columns `tenantId` / `userId` / `role` — **no** `campaignKey`.

`CREATE TABLE IF NOT EXISTS` therefore no-oped. The subsequent index on `campaignKey` failed with 42703.

A later fix (`4a55bff3`) rewrote the migration to **alter** the canonical `CampaignTenant` / `CampaignMembership` spine instead of inventing a parallel membership table. Production still held the failed Prisma record from the original SQL (checksum matched the broken file).

## Production state before repair

**ZERO APPLICATION**

Evidence:

- `applied_steps_count = 0`
- No `User.supabaseUserId`
- No `CampaignMembershipStatus`
- No Event PM membership columns / indexes
- No `EventPmAuditLog`
- No indexes mentioning `campaignKey`

PostgreSQL transactional apply rolled back; only the failed `_prisma_migrations` row remained (P3009).

## Recovery performed

1. Worktree at `feat/p0-s5-auth-rbac` @ `4a55bff3` (fixed `migration.sql`)
2. `prisma migrate resolve --rolled-back 20260826011500_event_pm_auth_rbac` (Prisma 5.22.0)
3. `prisma migrate deploy` — applied fixed migration successfully
4. `prisma migrate status` — Database schema is up to date
5. `prisma validate` — valid
6. `prisma generate` — run in recovery worktree

**Did not** use `--applied` (would have been incorrect for zero application).

**Did not** reset the database, drop schemas, delete tables, or bypass Netlify P3009 safety.

## Production state after repair

Intended objects now present:

- `User.supabaseUserId` + unique index
- `CampaignMembershipStatus` enum
- `CampaignMembership.status` / `invitedAt` / `acceptedAt` / `updatedAt`
- tenantId status/role indexes
- `EventPmAuditLog` + indexes
- New `CampaignTenantRole` values: `EVENT_MANAGER`, `COMMUNICATIONS`, `ORGANIZER`, `VOLUNTEER_COORDINATOR`

## Database data loss

**NONE**

## Migrations

Healthy: schema up to date after applying the fixed Event PM auth/RBAC migration. Prior contact-intelligence migrations remained applied.

## Preventative recommendations

1. Never introduce a second `CampaignMembership` shape when tenancy foundation already owns that table — extend in place.
2. Prefer CI that runs `migrate deploy` against a DB already carrying production migration history (or a restored prod clone) before Netlify production.
3. After any failed production migration: inspect `_prisma_migrations.logs` and object existence **before** `--applied`.
4. Separate migration `DIRECT_URL` from runtime session pooler when practical (infrastructure follow-up; not part of this emergency repair).

## Secrets

No connection strings or credentials are recorded in this document.
