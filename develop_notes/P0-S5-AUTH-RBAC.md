# P0-S5 — Authentication, RBAC & Event Operations Access Control

## Status and boundary

P0-S5 adds the Event Project Manager security foundation without replacing RedDirt's existing authentication or admin systems. Supabase Auth remains the identity provider. The existing canonical `User` table remains the application person record. Event PM authorization is a separate, explicit campaign-membership layer.

The implementation deliberately does **not** put `supabase.auth.getUser()` back into Edge middleware. RedDirt previously removed that network call from the Edge path because it timed out on Netlify. Event PM authorization therefore runs in Node server components/route handlers.

Public `/events` remains public. The protected proof surface is `/admin/events`.

## Identity and authorization flow

```text
Google OAuth
  -> Supabase Auth user UUID
  -> verified email bootstrap match (only for a pre-provisioned campaign member)
  -> persistent User.supabaseUserId binding
  -> CampaignMembership
  -> role
  -> centralized permission registry
  -> protected Event PM server operation
```

A successful Supabase login does not create campaign authority. If the authenticated UUID is not already bound, the server may bind it by verified email **only when a matching canonical `User` already has a `CampaignMembership`**. A random authenticated account therefore cannot self-enroll.

## Membership states

- `INVITED`: authenticated identity may exist, but operational access is pending.
- `ACTIVE`: permissions are evaluated normally.
- `SUSPENDED`: access denied.
- `DISABLED`: access denied.

## Roles

`OWNER`, `ADMIN`, `CAMPAIGN_MANAGER`, `EVENT_MANAGER`, `COMMUNICATIONS`, `ORGANIZER`, `VOLUNTEER_COORDINATOR`, `VOLUNTEER`, `VIEWER`.

The canonical mapping lives in `src/lib/event-pm/auth/permissions.ts`. Application code must ask for permissions, not compare arbitrary role strings in UI code.

Campaign-wide Event PM entry currently requires `event.view_all`. This admits OWNER, ADMIN, CAMPAIGN_MANAGER, and VIEWER (read-only), while blocking VOLUNTEER and assigned-event-only roles from the statewide command center. Later event-assignment slices can use `event.view_assigned` for scoped pages.

## Database objects

Migration `20260826011500_event_pm_auth_rbac` adds:

- nullable, unique `User.supabaseUserId`
- PostgreSQL enum `CampaignAccessRole`
- PostgreSQL enum `CampaignMembershipStatus`
- `CampaignMembership`
- `EventPmAuditLog`
- foreign keys and lookup/audit indexes

The Event PM auth module uses typed Prisma raw-query result shapes at this boundary. This keeps the existing canonical `User` model and Prisma client intact while allowing the additive authorization records to be migration-managed without creating a second user system.

## Server helpers

`src/lib/event-pm/auth/server.ts` provides:

- `resolveCurrentActor()`
- `requireEventPmPermission()`
- `logEventPmAudit()`
- safe HTTP auth-error translation

`src/lib/event-pm/auth/permissions.ts` provides:

- canonical `PERMISSIONS`
- role -> permission mapping
- membership-state enforcement
- `can()` / `assertActorPermission()`

401 means no valid authenticated session. 403 means authenticated but not authorized. 503 is reserved for unavailable auth/authorization infrastructure.

## OAuth routes

- `/admin/event-pm-login` — Google OAuth entry for Event PM
- `/auth/callback` — exchanges the Supabase OAuth code and only accepts safe internal `/admin/*` next paths
- `/auth/logout` — POST-only logout

Provider configuration must allow the environment's exact `/auth/callback` URL. Do not add arbitrary wildcard redirect origins.

## First OWNER bootstrap

There is no public "first user becomes owner" behavior.

After applying the migration, deliberately bootstrap an existing canonical campaign user:

```bash
npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com
```

Optionally provide the known Supabase user UUID as the second argument to bind it immediately:

```bash
npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com 00000000-0000-0000-0000-000000000000
```

The script refuses to create a new canonical `User`. The operator must verify the intended person first.

## Protected proof surface

`GET /api/admin/events/auth-proof` requires `event.view_all` and returns only safe actor metadata.

`POST /api/admin/events/auth-proof` requires `event_project.update` and writes an attributed `EventPmAuditLog` record. It is an infrastructure proof only; it does not mutate an event.

## Security rules

- Never authorize from role, user ID, campaign ID, or assignment values supplied by the browser.
- Never expose Supabase service-role credentials in client code.
- Never store passwords in RedDirt.
- Do not use the campaign-tenancy selector cookie as an authorization source.
- Keep mutations off GET endpoints.
- Preserve public event pages and prevent internal staffing/tasks/comms data from entering public APIs.
- Preserve canonical campaign event lifecycle spelling `CANCELLED`.

## Validation

CI runs a clean PostgreSQL service, applies all Prisma migrations, then executes:

```bash
npx tsx scripts/test-event-pm-auth-rbac.ts
npm run check
```

The P0-S5 test proves:

- anonymous permission checks -> 401
- pending/suspended/disabled membership -> 403
- VIEWER cannot mutate events
- VOLUNTEER cannot enter campaign-wide Event PM
- CAMPAIGN_MANAGER can perform Event PM management permission checks
- Supabase UUID uniqueness at the database layer
- duplicate campaign membership rejection
- audit actor foreign-key attribution

OAuth end-to-end smoke testing still requires configured Supabase/Google redirect credentials in the target Netlify environment; no credentials belong in the repository.

## Known compatibility posture

Legacy RedDirt admin surfaces may continue using `ADMIN_SECRET`/`requireAdminPage`. P0-S5 does not silently rewrite those gates. `/admin/events` is the first Event PM surface using the production Supabase + campaign-membership authority graph, allowing later slices to migrate other admin surfaces deliberately instead of causing a flag-day auth change.

## Next slice

Do not advance automatically. After P0-S5 is validated and deployed, the queued slice is:

`P1 — Event Project Manager Command Center UI Shell`.
