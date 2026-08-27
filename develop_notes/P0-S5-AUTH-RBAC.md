# P0-S5 — Authentication, RBAC & Event Operations Access Control

## Architecture

P0-S5 extends RedDirt's existing production identity and campaign-tenancy spine rather than creating a second auth system.

```text
Google OAuth
  -> Supabase Auth UUID
  -> canonical RedDirt User
  -> canonical CampaignMembership for kelly-sos-2026
  -> membership status
  -> CampaignTenantRole
  -> Event PM permission registry
  -> protected server component / route handler
  -> actor-attributed audit record
```

Supabase Auth remains the identity provider. PostgreSQL/Prisma remains the application database. `CampaignTenant` and `CampaignMembership` are the pre-existing canonical tenancy models and are reused by this slice.

## Important production boundary

RedDirt previously removed `supabase.auth.getUser()` from Edge middleware because that network call timed out on Netlify. P0-S5 preserves that hardening. Event PM authentication and authorization execute in Node server components and route handlers. Public `/events` remains public.

The existing campaign-tenancy selection cookie remains context only; it is never trusted as authorization. Event PM authority is resolved from the authenticated Supabase session and database membership.

## Database changes

Migration `20260826011500_event_pm_auth_rbac` extends the existing schema:

- `User.supabaseUserId` nullable unique binding to the external Supabase UUID.
- Existing `CampaignTenantRole` gains `EVENT_MANAGER`, `COMMUNICATIONS`, `ORGANIZER`, and `VOLUNTEER_COORDINATOR` while preserving `TREASURER` and `OPERATOR` compatibility roles.
- Existing `CampaignMembership` gains `status`, `invitedAt`, `acceptedAt`, and `updatedAt`.
- Existing memberships default to `ACTIVE` so the migration does not silently disable current campaign users.
- `CampaignMembershipStatus`: `INVITED`, `ACTIVE`, `SUSPENDED`, `DISABLED`.
- `EventPmAuditLog` records tenant, actor, action, entity, metadata, and timestamp with foreign keys to the canonical campaign tenant and user.

P0-S5 accesses the additive authorization fields through typed Prisma raw SQL. This avoids introducing a duplicate application user or membership table and lets the existing large Prisma model continue to serve as RedDirt's canonical domain model. A future general tenancy normalization pass may promote these additive fields into broader generated Prisma delegates, but Event PM does not depend on a parallel ORM model.

## Identity binding

A valid Google/Supabase login does **not** create campaign access.

When a Supabase UUID is not yet bound, the server will bind it by verified email only if:

1. a canonical RedDirt `User` already exists for that email, and
2. that user already has a canonical `CampaignMembership` for `kelly-sos-2026`.

A random authenticated Google account therefore cannot self-enroll. Once bound, the unique Supabase UUID is the durable external identity key; email is not treated as the permanent identity key.

## Roles and permissions

Event PM's primary role vocabulary is:

- `OWNER`
- `ADMIN`
- `CAMPAIGN_MANAGER`
- `EVENT_MANAGER`
- `COMMUNICATIONS`
- `ORGANIZER`
- `VOLUNTEER_COORDINATOR`
- `VOLUNTEER`
- `VIEWER`

Existing canonical `TREASURER` and `OPERATOR` roles remain supported for compatibility and are mapped centrally rather than crashing or bypassing authorization.

The canonical Event PM permission registry lives in `src/lib/event-pm/auth/permissions.ts`. Server code asks for permissions such as `event.view_all`, `event_project.update`, and `event_task.assign`; browser-supplied role/user values never grant authority.

Campaign-wide `/admin/events` currently requires `event.view_all`. Assigned-event roles receive `event.view_assigned` and are intentionally blocked from the statewide command center until the later assignment-scoping slice provides their narrower surface.

## Membership states

- `INVITED` -> authenticated but pending; denied operational access.
- `ACTIVE` -> permissions evaluated normally.
- `SUSPENDED` -> denied.
- `DISABLED` -> denied.

HTTP semantics are explicit:

- `401` = no valid authenticated session.
- `403` = authenticated but not permitted.
- `503` = auth/authorization infrastructure unavailable.

## Server helpers

`src/lib/event-pm/auth/server.ts` provides:

- `resolveCurrentActor()`
- `requireEventPmPermission()`
- `logEventPmAudit()`
- safe HTTP error translation

`src/lib/event-pm/auth/permissions.ts` provides:

- canonical permission constants
- centralized role-to-permission mapping
- membership-state enforcement
- `can()` and `assertActorPermission()`

The resolved actor includes canonical RedDirt user ID, Supabase UUID, email, tenant ID, membership ID, role, status, and calculated permissions.

## OAuth entry and callback

- `/admin/event-pm-login` starts Google OAuth through the existing Supabase browser helper.
- `/auth/callback` exchanges the code using the existing Supabase server helper.
- callback continuation is restricted to an internal `/admin/*` path; external and protocol-relative redirects are rejected.
- `/auth/logout` is POST-only.

The target Supabase/Google configuration must allow each intended environment's exact `/auth/callback` URL. Do not weaken redirect security with arbitrary origins.

## First OWNER bootstrap

There is no public first-user bootstrap and no automatic OWNER grant.

After the migration, an operator deliberately promotes an already verified canonical RedDirt user:

```bash
npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com
```

If the Supabase UUID is already known, it can be bound in the same deliberate operation:

```bash
npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com 00000000-0000-0000-0000-000000000000
```

The script refuses to create a new canonical user. It ensures the canonical `kelly-sos-2026` tenant exists and upserts that user's canonical membership as `OWNER` + `ACTIVE`.

## Protected infrastructure proof

`/admin/events` is the first Event PM surface protected by the new authority graph. It is intentionally infrastructure-level UI, not the P1 command center design.

`GET /api/admin/events/auth-proof` requires campaign-wide event read permission and returns only safe actor metadata.

`POST /api/admin/events/auth-proof` requires `event_project.update` and writes an actor-attributed `EventPmAuditLog` record. It proves an authorized mutation path without changing an event.

## Security invariants

- Never trust a browser-provided role, user ID, tenant ID, membership, or assignment as authority.
- Never expose a Supabase service-role credential to the browser.
- Never store passwords in RedDirt.
- Do not authorize from the non-httpOnly campaign selector cookie.
- No state-changing GET endpoints.
- Public event pages stay public while operational notes, staffing, tasks, communications, expenses, contact data, and security details stay private.
- Preserve canonical campaign-event lifecycle spelling `CANCELLED`.

## Validation gate

The existing GitHub Actions quality gate provisions a fresh PostgreSQL 15 database and now runs:

```bash
npm ci
npx prisma migrate deploy
npx tsx scripts/test-event-pm-auth-rbac.ts
npm run check
```

The focused P0-S5 test proves:

- anonymous permission check rejects as 401
- invited/suspended/disabled memberships reject as 403
- VIEWER cannot mutate events
- VOLUNTEER cannot enter campaign-wide Event PM
- CAMPAIGN_MANAGER receives Event PM management permission
- Supabase UUID uniqueness is enforced by PostgreSQL
- duplicate `(tenantId, userId)` membership is rejected
- audit actor attribution survives its foreign-key relationship

The test creates only temporary `.invalid` users and a temporary test tenant, then removes them. It does not seed demo campaign data.

## Existing systems intentionally preserved

Legacy RedDirt admin surfaces may continue using `ADMIN_SECRET` / `requireAdminPage`. P0-S5 does not perform a flag-day rewrite of unrelated admin authentication. The Event PM surface proves the production Supabase + canonical membership path first, allowing later migrations of other surfaces to be deliberate.

Public `/events`, the current campaign event data model, campaign communications, volunteer systems, and event lifecycle semantics are not rewritten in P0-S5.

## Deployment sequence

1. feature branch
2. clean-database CI migration
3. focused security integrity test
4. full repository check/build
5. GitHub-triggered Netlify Deploy Preview
6. preview smoke gate
7. merge to `main`
8. existing GitHub -> Netlify production workflow
9. production smoke gate

Do not advance to P1 until these gates are closed or any remaining environment/operator blocker is explicitly recorded.

## Next slice

`P1 — Event Project Manager Command Center UI Shell`
