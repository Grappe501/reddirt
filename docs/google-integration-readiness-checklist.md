# Google integration — readiness checklist (audit)

This document is a **read-only audit** of the current RedDirt code (no redesign). Use it to configure Google Cloud and deployment env in one pass.

---

## 1. Exact expected redirect URIs (as implemented)

These must be registered in the **Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client → Authorized redirect URIs**.

### Calendar (`CalendarSource` OAuth)

| Source | Value |
|--------|--------|
| **If `GOOGLE_CALENDAR_REDIRECT_URI` is set** | The **exact** string in that variable (trailing slash matters if you include it; code does not normalize). |
| **If `GOOGLE_CALENDAR_REDIRECT_URI` is unset** | `{NEXT_PUBLIC_SITE_URL with trailing slash removed}/api/calendar/google/callback` — see `src/lib/calendar/env.ts`. |
| **If `NEXT_PUBLIC_SITE_URL` is also unset** | Resolves to empty string; `isGoogleCalendarConfigured()` is false — OAuth cannot start. |

**Route handler:** `GET` — `src/app/api/calendar/google/callback/route.ts`  
**Query params used:** `code`, `state` (must equal a `CalendarSource.id`), `error` (optional).

### Gmail (staff workbench / `StaffGmailAccount`)

| Source | Value |
|--------|--------|
| **If `GOOGLE_GMAIL_REDIRECT_URI` is set** | The **exact** string in that variable. |
| **If unset** | `{NEXT_PUBLIC_SITE_URL with trailing slash removed}/api/gmail/oauth/callback` — see `src/lib/integrations/gmail/env.ts`. |
| **If `NEXT_PUBLIC_SITE_URL` is unset** | Resolves to empty; `isGmailOAuthConfigured()` is false. |

**Route handler:** `GET` — `src/app/api/gmail/oauth/callback/route.ts`  
**Query params used:** `code`, `state` (must equal a `User.id` for the staff actor), `error` (optional).

### Not OAuth redirects (infrastructure URLs)

| Purpose | URL pattern |
|--------|-------------|
| **Calendar push webhook** (registered by API) | `{webHookBase}/api/calendar/google/webhook` where `webHookBase` is `NEXT_PUBLIC_SITE_URL` (with slash stripped) in cron, or `request.url` origin in other call paths — see `registerOrRenewWatchForSource` in `src/lib/calendar/google-sync-engine.ts`. **Must be HTTPS in production** for Google to deliver notifications. |
| **Gmail “start” link** (browser only) | Same-origin `GET` `/api/gmail/oauth/start` — this **redirects** the browser to Google’s consent screen; it is **not** an Authorized redirect URI in the console. |

**Examples (replace domain):**

- `https://your-production-host/api/calendar/google/callback`
- `https://your-production-host/api/gmail/oauth/callback`
- `http://localhost:3000/api/calendar/google/callback` and `http://localhost:3000/api/gmail/oauth/callback` (if using local `NEXT_PUBLIC_SITE_URL`)

---

## 2. Exact environment variable names

### Calendar (OAuth + client construction)

| Variable | Required for Calendar OAuth? | Notes |
|----------|------------------------------|--------|
| `GOOGLE_CALENDAR_CLIENT_ID` | **Yes** (with secret + non-empty redirect) | No fallback to Gmail vars. |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | **Yes** | — |
| `GOOGLE_CALENDAR_REDIRECT_URI` | **No** (optional) | If omitted, default built from `NEXT_PUBLIC_SITE_URL` (see above). |
| `NEXT_PUBLIC_SITE_URL` | **Effectively required** if `GOOGLE_CALENDAR_REDIRECT_URI` is unset | Public site base; also used for webhook base in cron. |

**Implementation:** `src/lib/calendar/env.ts`, `src/lib/integrations/google/auth.ts` (throws if not fully configured).

### Gmail (OAuth; client id/secret **fall back** to Calendar)

| Variable | Required? | Notes |
|----------|-----------|--------|
| `GOOGLE_GMAIL_CLIENT_ID` | **No** if `GOOGLE_CALENDAR_CLIENT_ID` is set | Falls back: `GOOGLE_GMAIL_CLIENT_ID` → `GOOGLE_CALENDAR_CLIENT_ID`. |
| `GOOGLE_GMAIL_CLIENT_SECRET` | **No** if Calendar secret is set | Falls back: `GOOGLE_GMAIL_CLIENT_SECRET` → `GOOGLE_CALENDAR_CLIENT_SECRET`. |
| `GOOGLE_GMAIL_REDIRECT_URI` | **No** if `NEXT_PUBLIC_SITE_URL` is set | Falls back: explicit URI → `NEXT_PUBLIC_SITE_URL` + `/api/gmail/oauth/callback`. |
| `NEXT_PUBLIC_SITE_URL` | **Effectively required** if Gmail redirect is unset and no explicit `GOOGLE_GMAIL_REDIRECT_URI` | — |

**Implementation:** `src/lib/integrations/gmail/env.ts`.

**Staff identity for Gmail (not Google Cloud, but required by app):**

| Variable | Purpose |
|----------|--------|
| `ADMIN_ACTOR_USER_EMAIL` | Must match a `User.email` in the DB. `getAdminActorUserId()` (see `src/lib/admin/actor.ts`) resolves this user for `state` in Gmail OAuth and for sends. If unset, “Connect staff Gmail” cannot attribute the mailbox. |

### Calendar automation (not OAuth)

| Variable | Required? | Notes |
|----------|-----------|--------|
| `CALENDAR_CRON_SECRET` | **Yes** to call the cron route securely | `GET /api/calendar/google/cron-sync?key=...` — see `src/app/api/calendar/google/cron-sync/route.ts`. If unset, **all** requests get `401`. |
| `NEXT_PUBLIC_SITE_URL` | Used in cron for `baseUrl()` when renewing watches | Default fallback in cron: `http://localhost:3000` if empty — **wrong** for production if unset; set explicitly in prod. |

### Optional / not wired to Google client for this feature set

- `.env.example` also mentions `COMMS_BROADCAST_CRON_SECRET`, SendGrid/Twilio keys, etc. — not part of Google API auth but needed for other comms.

**Gap:** `GOOGLE_GMAIL_*` is **not** listed in `.env.example` at the time of this audit; only calendar vars are. Add manually when setting up Gmail (see table above).

---

## 3. Exact OAuth scopes requested (current code)

### Calendar

**File:** `src/lib/integrations/google/oauth.ts`

- `https://www.googleapis.com/auth/calendar`

(Used for: `getGoogleCalendarAuthUrl` → `generateAuthUrl`, and `createOAuth2Client` for `calendar` API calls.)

### Gmail

**File:** `src/lib/integrations/gmail/oauth.ts`

- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.readonly`

(Used for: staff send + `users.getProfile` after connect.)

**Google Cloud:** Enable **Google Calendar API** and **Gmail API** (and OAuth consent screen with these scopes) for the same or linked projects as appropriate to your org policy.

---

## 4. Admin routes and UI entry points (after env + console setup)

### Calendar

| Step | Where |
|------|--------|
| Open Calendar HQ / week UI | `/admin/workbench/calendar` (and related calendar views) |
| **“Google Calendar connect”** | `src/components/admin/calendar-hq/EventExecutionPanel.tsx` — `startGoogleCalendarOAuthAction` with hidden `sourceId` = `firstSourceId` (a `CalendarSource` from context). **Disabled** if `isGoogleCalendarConfigured()` is false. |
| After successful OAuth | Redirect: `/admin/workbench/calendar?connected=1` |
| Calendar errors | `?error=` query from callback (`oauth`, `source`, `token`, or Google’s `error` param) |

**Note:** A `CalendarSource` row must exist (e.g. seed) so `state` in the callback resolves to a real source; connect button only appears if `firstSourceId` is set.

### Gmail

| Step | Where |
|------|--------|
| **“Connect staff Gmail”** (link) | `src/app/admin/(board)/workbench/page.tsx` — `href="/api/gmail/oauth/start"` (full page navigation). |
| Prerequisite | Logged-in **admin** session (`ADMIN_SESSION_COOKIE`); `isGmailOAuthConfigured()`; `ADMIN_ACTOR_USER_EMAIL` must resolve to a `User` id. |
| After success | Redirect: `/admin/workbench?gmail=1` |
| Failure redirects | `?error=gmail_not_configured`, `gmail_needs_actor`, `gmail_oauth`, `gmail_user`, `gmail_token`, or Google `error` |

### Operational (not clicked by humans for OAuth)

- **Webhook:** `POST /api/calendar/google/webhook` — Google servers call this; no admin button.
- **Cron sync:** `GET /api/calendar/google/cron-sync?key={CALENDAR_CRON_SECRET}` — scheduler (e.g. every minute) in production.

---

## 5. Token storage, refresh, and persistence (audit)

| Concern | Calendar | Gmail |
|---------|----------|--------|
| **Storage** | `CalendarSource.oauthJson` (Prisma `Json`) — full `getToken()` payload | `StaffGmailAccount.oauthJson` (same pattern) |
| **Offline access** | `access_type: "offline"` + `prompt: "consent"` in `getGoogleCalendarAuthUrl` | Same in `getGmailAuthUrlForStaffUser` |
| **Client used for API** | `createOAuth2Client()` from calendar env, then `setCredentials()` with stored tokens — `src/lib/integrations/google/calendar.ts` | `createGmailOAuth2Client()` from Gmail env, `setCredentials()` — `src/lib/integrations/gmail/gmail-api.ts` |
| **Refresh** | `googleapis` + `google-auth-library`: if `refresh_token` is present, the client will refresh `access_token` on demand for API calls. | Same. |
| **Persistence after refresh** | **Not implemented:** no `on('tokens')` handler writing refreshed tokens back to the DB. In practice, a valid `refresh_token` is enough for the client to obtain new access tokens in process memory; if you need rotated refresh tokens or multi-replica **persisted** access tokens, that would be a follow-up. |
| **Hard failure** | `getCalendarApiForSource` throws if `refresh_token` is missing in stored JSON | `getGmailAuthForUser` returns null if no refresh/access token |

---

## 6. Manual Google Cloud setup (checklist)

- [ ] **OAuth consent screen** (External or Internal) with the scopes listed in section 3.
- [ ] **Enable APIs:** Google Calendar API; Gmail API (if using staff Gmail).
- [ ] **OAuth 2.0 Client ID** type **Web application** (or appropriate type your team uses) with:
  - [ ] **Authorized redirect URIs:** every URI from section 1 you will use (prod + local + staging).
  - [ ] If using one client for both Calendar and Gmail: **both** callback paths on the same client.
- [ ] **For Calendar push:** webhook URL must be **publicly reachable over HTTPS** and match what `registerOrRenewWatchForSource` registers (`…/api/calendar/google/webhook`). Google Cloud’s “Test” or domain verification may apply depending on consent screen type.
- [ ] **Production env:** set `NEXT_PUBLIC_SITE_URL` to the canonical public origin (no trailing slash is stripped in code, but a trailing slash is removed when building default redirect URIs — be consistent in the console with what the app will send).

---

## 7. Missing code/config blockers before production (audit)

| Item | Severity | Notes |
|------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` missing in production | **High** | Default calendar redirect empty; cron `baseUrl()` falls back to `http://localhost:3000` — webhooks/redirects wrong. |
| `CALENDAR_CRON_SECRET` unset | **High** for automated sync/renewal | Cron route always 401. |
| No `refresh_token` in DB after first connect | **High** for long-term | User must re-consent with `prompt: "consent"`; if Google returns no refresh token, API calls will eventually fail. |
| Token refresh not written back to DB | **Low–Medium** | Usually OK with `refresh_token`; watch for policy changes and multi-region persistence needs. |
| `ADMIN_ACTOR_USER_EMAIL` unset for Gmail | **High** for Gmail | Connect flow redirects with `gmail_needs_actor`. |
| `CalendarSource` missing for calendar OAuth | **High** for connect button | `state` must match an existing `CalendarSource.id`. |
| **Gmail not documented in `.env.example`** | **Low** (docs gap) | Add when convenient to avoid copy-paste errors. |
| Webhook `POST` only | **N/A** | Google Calendar push uses POST; no GET verification route in this codebase. |

---

## 8. File reference (where behavior lives)

| Area | Path |
|------|------|
| Calendar env | `src/lib/calendar/env.ts` |
| OAuth2 client (Calendar) | `src/lib/integrations/google/auth.ts` |
| Calendar auth URL + code exchange | `src/lib/integrations/google/oauth.ts` |
| Calendar callback | `src/app/api/calendar/google/callback/route.ts` |
| Webhook | `src/app/api/calendar/google/webhook/route.ts` |
| Cron sync + watch renewal | `src/app/api/calendar/google/cron-sync/route.ts` |
| Gmail env + fallback to Calendar id/secret | `src/lib/integrations/gmail/env.ts` |
| Gmail auth URL + code exchange | `src/lib/integrations/gmail/oauth.ts` |
| Gmail start (admin gate) | `src/app/api/gmail/oauth/start/route.ts` |
| Gmail callback + DB write | `src/app/api/gmail/oauth/callback/route.ts` |
| Watch URL construction | `src/lib/calendar/google-sync-engine.ts` (`registerOrRenewWatchForSource`) |
| Server action: Calendar connect | `src/app/admin/calendar-hq-actions.ts` — `startGoogleCalendarOAuthAction` |
| Admin UI: Calendar connect | `src/components/admin/calendar-hq/EventExecutionPanel.tsx` |
| Admin UI: Gmail link | `src/app/admin/(board)/workbench/page.tsx` |
| Staff user resolution | `src/lib/admin/actor.ts` |

---

*Generated from codebase audit; update this file if integration behavior changes.*
