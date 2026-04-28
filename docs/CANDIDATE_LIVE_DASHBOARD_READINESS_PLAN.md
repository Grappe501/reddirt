# Candidate live dashboard readiness plan

**Lane:** RedDirt · **Audience:** Operators + Kelly’s team — **do not commit secrets**; `.env`/Netlify vars per `.env.example` only.

---

## 1. Authentication — how admins log in today

| Mechanism | Detail |
|-----------|--------|
| **Gate** | `ADMIN_SECRET` must be set; middleware redirects non-login `/admin/*` when missing (`src/middleware.ts`). |
| **Login UI** | `GET /admin/login` — passphrase form (`src/app/admin/login/page.tsx`). |
| **Verification** | `adminLoginAction` compares **SHA-256 hash** of submitted password to **SHA-256 hash of ADMIN_SECRET** (`hashEqual(password, secret)`) — i.e. the env value effectively acts as passphrase material (see `src/app/admin/actions.ts`). |
| **Session** | HMAC-signed token in **httpOnly** cookie `reddirt_admin_session`; 7-day max-age (`src/lib/admin/session.ts`). |
| **Page guard** | `requireAdminPage()` / `assertAdminApi()` — `(board)` layout calls `requireAdminPage()` (`src/app/admin/(board)/layout.tsx`). |

**Separate:** Relational tier uses `RELATIONAL_USER_SESSION_*` (`relational/login`) — distinct from admin.

### Candidate-specific login?

- **No** separate role flag or candidate-only JWT today — one **shared admin session** cookie for everyone who passes the passphrase.

### Recommended direction (no backdoor)

| Option | Safety |
|--------|--------|
| **Keep single `/admin/login`** | Rotate/high-entropy passphrase; share only via secure channel — **no bypass of secret**. |
| **`/admin/candidate-login`** | Would be cosmetic only unless it sets the **same** cookie via the **same** `adminLoginAction` or a duplicated server action — **prefer not** unless product needs separate UX; **still requires** passphrase or separately issued **`CANDIDATE_ADMIN_PASSWORD`** hashed same way (**new env**, reviewed by ops). |

**Bypass email authorization:** There is **no** email OTP in core admin login — bypass is irrelevant; **do not** weaken `ADMIN_SECRET` or add predictable defaults.

---

## 2. Voter identity (`voter_id` / `VoterRecord`)

### Schema

- `VoterRecord` — canonical voter file row (`src/lib/../prisma`): **id** as primary key (`cuid`/string per migration), SOS-style **`voterIds`**/`source` fields as modeled.
- `User.linkedVoterRecordId` → optional link to **`VoterRecord`** for CRM users.

### Lookup today

| Path | Behavior |
|------|----------|
| **`/admin/voters/[id]/model`** | Staff voter model/profile — **`id` = internal `VoterRecord.id`**, gated by existing admin auth. Not a fuzzy “search Kelly.” |
| **`campaignAssistLookupStub`** | `throw` — **explicitly disabled** (`src/lib/voter-file/campaign-assist-lookup.ts`). |
| **`/admin/voter-import`** | Snapshot listing + CLI import — operational, **not** self-service voter search. |

### Candidate “find herself” safely

- **Not supported** as an open search in Ask Kelly/candidate-only UI in this codebase.
- **Future:** Rate-limited, audited **self** lookup (name + DOB + county) matching **≤1 row** → display **masked** confirmation + Link to VoterView — **needs product + counsel**; **`campaignAssistLookup`** stub sketches constraints.

### Storing Kelly’s voter row

- Prefer **`User` (Kelly)** `linkedVoterRecordId = <VoterRecord.id>` once staff verifies match — **no migration required** for the link field if `User` already exists.

---

## 3. KPI / dashboard routes

| Route | Reality |
|-------|---------|
| **`/admin/insights`** | **Placeholder** (“No charts in this script”) — not the primary KPI surface. |
| **`/admin/orchestrator`** | **Live aggregates** — platform connections, pending inbound counts, recent items/decisions (`prisma`). **Best “command center”** link for tonight. |
| **`/admin/content-graph`** | **Live grouped counts** (by platform/status) — editorial/content pipeline view. |
| **`/admin/feed`** | Live feed scaffold (verify in-nav). |
| **Social stats on `/admin/ask-kelly`** | **Not wired** — “connection pending”; use **`/admin/workbench/social`**. |

**Recommendation:** Candidate board quick-access **Command center → `/admin/orchestrator`** (labeled honestly as orchestrator / operational metrics, not “full analytics”). Full cross-channel KPIs remain **future work**.

---

## 4. Live integrations (code audit — verify env per deploy)

| Integration | Where in code | Env (see `.env.example`) | Sends live? |
|-------------|----------------|---------------------------|-----------|
| **SendGrid** | Webhooks `/api/webhooks/sendgrid`; comms execution `send-execution.ts` | `SENDGRID_*`, webhook PEM | Sends only via **controlled** send paths after queue/approval UX — **routes exist** |
| **Twilio** | `/api/webhooks/twilio`; opt-out handlers | `TWILIO_*` | Same — **delivery** webhooks live when configured |
| **Gmail (staff)** | `/api/gmail/oauth/*`, Workbench Gmail mode | Gmail OAuth vars + actor user | Human 1:1 send actions when connected |
| **Google Calendar sync** | Calendar HQ (`GoogleCalendarSyncBlock` mentions `GOOGLE_CALENDAR_*`) | Client id/secret on server | Sync/publish flows — **scoped** calendar features |
| **Campaign Organizing Hub / Discord** | **No** embedded invite in admin UI; coordination is campaign-owned. **County briefing** and **volunteer** URLs are first-party RedDirt routes (see §5) | N/A | N/A |

**Netlify/production:** Confirm each variable exists in hosting env — **patterns in code do not imply production keys are loaded.**

---

## 5. Campaign management routes (RedDirt CMS)

These are **campaign-owned** surfaces in this repo—**not** non-campaign external lanes relative to Kelly’s RedDirt deployment.

| Name / alias | In this build |
|--------------|----------------|
| **`/county-briefings`** | **Live** — `src/app/county-briefings/` (index + nested pages). |
| **`/county-briefings/pope`** | **Live**. |
| **`/admin/county-intelligence`** | **Live** — operator county intel. |
| **`/get-involved`** | **Live** — public volunteer / pathways entry. |
| **`/admin/volunteers/intake`** | **Live** — volunteer sheet intake. |
| **`/countyWorkbench`** | **Live alias** — **`next.config.ts`** redirects (non-permanent) → **`/county-briefings`**. Optional **`NEXT_PUBLIC_COUNTY_WORKBENCH_URL`** still adds outbound hub parity when set. |
| **`/distipope-briefing`** | **Live alias** — redirect → **`/county-briefings/pope`**. Repo-root **`dist-pope-briefing/`** remains a static packaging mirror. |
| **`/dist-county-briefings`** | **Live alias** — redirect → **`/county-briefings`**. Repo-root **`dist-county-briefings/`** remains static packaging. |
| **`/volunteerPage`** | **Live alias** — redirect → **`/get-involved`**. Staff intake stays **`/admin/volunteers/intake`**. |

Ask Kelly’s system guide **`ASK_KELLY_SYSTEM_ROUTES`** exposes the live paths above for onboarding copy.

---

## 6. What is safe “tonight” vs blocked

### Safer tonight

- Admin session with **`ADMIN_SECRET`** set and rotated posture.
- **Orchestrator** + **Content graph** for **aggregate** situational awareness.
- **Workbench / comms** with **approval discipline** — no new send buttons added in scaffolding passes.

### Blocked / not ready

- **Public voter search** for candidate onboarding.
- **Unified “full KPI dashboard” charts** (`/admin/insights` empty).
- **Campaign Organizing Hub** (e.g. Discord) stays invite-managed until ops drops a sanctioned link **inside** Ask Kelly/onboarding—not a mismatched portal name. Core **county** and **volunteer** URLs are already first-party (`§5`).

---

## 7. References

- `src/lib/admin/session.ts` — cookie semantics.
- `src/app/admin/actions.ts` — `adminLoginAction`.
- `src/middleware.ts` — ADMIN_SECRET routing.
- `prisma/schema.prisma` — `User.linkedVoterRecordId`, `VoterRecord`.
