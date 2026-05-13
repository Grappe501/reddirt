# Volunteer & field organizing platform (RedDirt)

This document describes the **public** volunteer experience and how it ties to canonical field content (`field-structure/`), external campaign URLs (legacy **www.kellygrappe.com** until relaunch), and planned **Google Workspace** email automation.

## Volunteer Operating System (VOS)

Implementation: `src/components/dashboard/vos/*`, mock data `src/lib/dashboard/mock-data.ts`, shared types `src/types/dashboard.ts`, workspace resolution `src/lib/dashboard/team-workspace.ts`.

### Team dashboard — `/dashboard/team/[teamSlug]`

Primary surface for a **three-person operating team** (Events, Social Media, Power of 5 / VR). Tabs cover overview, events, social, messages, metrics, resources, and **Power of 5 / VR** (relational turnout + voter registration lane).

| Route | Purpose |
|--------|---------|
| `/dashboard/team/[teamSlug]` | Team overview: status, weekly briefing, **Build your team** (invitations), comms, KPIs, roster, events preview, downstream tree. |
| `/dashboard/team/[teamSlug]/events` | Events coordinator lane (mock + future live board). |
| `/dashboard/team/[teamSlug]/social-media` | Social coordinator lane. |
| `/dashboard/team/[teamSlug]/power-of-5` | Power of 5 / VR module: reuses `PowerOf5DashboardPanel`, Reach-style contact grid, goals, monthly programs, KPIs. |
| `/dashboard` | Legacy personal VOS entry; may redirect or deep-link into a team workspace. |

**Demo teams (mock, no DB):**

- **Active triad:** `VOLUNTEER_OS_DEMO_TEAM_SLUG` / `PROTOTYPE_TEAM_SLUG` → Creek County Liberty 104 (three core roles filled).
- **Building solo triad:** `MOCK_SOLO_BUILDING_TEAM_SLUG` in `mock-data.ts` → Rogers County Resolve 315 (one member + sample invitations).

**Mock viewer / HQ preview (overview only):**

- `?as=<volunteerId>` — act as a specific roster member for invitation visibility (mock teams).
- `?staff=1` — campaign administrator view (sees all invitations per privacy rules).

### Team lifecycle statuses

Displayed on the overview tab (`building`, `active`, `expanding`, `dormant`, `archived`). Mock and Prisma-backed teams both carry `lifecycleStatus` when known; otherwise a helper derives a display status from roster + downstream count (`deriveTeamLifecycleStatus` in `invitation-privacy.ts`).

| Status | Typical meaning |
|--------|------------------|
| `building` | 1–2 members; core triad not complete. |
| `active` | Events, Social, and Power of 5 / VR roles filled. |
| `expanding` | Downstream teams launching. |
| `dormant` / `archived` | Paused or closed workspace. |

### One-person team start

A valid team may begin with **one** volunteer. That person uses the Team Dashboard immediately and privately invites the other two coordinators. **Build your team** surfaces open lanes, missing-role cards, mock invite recording (demo), or server actions when `isDatabaseBacked` is true.

### Private invitation workflow (Phase 2)

Types: `TeamBuildInvitation`, `TeamBuildInviteStatus`, `TeamInviteCoreRole` in `src/types/dashboard.ts`.

- **Statuses:** `drafted`, `sent`, `accepted`, `declined`, `expired`, `canceled`.
- **Roles (intended):** Events Coordinator, Social Media Coordinator, Power of 5 / Voter Registration Coordinator.
- **Fields:** id, teamId, email, intendedRole, invitedByMemberId, status, optional note, createdAt, respondedAt, `visibleToMemberIds`.

**Privacy rule (important):**

If an invite is **not** accepted — including `drafted`, `sent`, `declined`, `expired`, or `canceled` — **only the inviter and campaign administrators** should see that row in UI. **Accepted** invites are visible to the full triad so everyone knows who joined. Implementation: `computeInvitationVisibility`, `filterInvitationsForViewer` in `src/lib/dashboard/invitation-privacy.ts`; server mapping for Prisma rows in `map-prisma-ops-team.ts`.

UI building blocks: `TeamBuildPanel`, `TeamInviteForm` (mock), `TeamInvitationList`, `MissingRoleCard`.

Database-backed invites use `sendVolunteerOpsTeamInviteAction` (no optional `note` persisted yet — schema unchanged).

### Email confirmation & access model (planned)

Documented in code comments on `team-workspace.ts`. Target flow:

1. Volunteer signs up on public intake.
2. System creates or assigns a `VolunteerOpsTeam` and stable `slug`.
3. Volunteer receives confirmation email.
4. Time-limited link establishes session (`vos_team_access` or future OAuth).
5. User lands on `/dashboard/team/[teamSlug]`.
6. Teammates invite others; acceptance joins the same dashboard.

**Production:** use signed, expiring tokens (httpOnly cookies), rate limits, audit logs, and a proper transactional email provider — never commit secrets. Magic links are **not** fully implemented in this pass unless global auth already covers them.

### Three-person teams vs Power of 5 networks

| Concept | What it is |
|---------|------------|
| **Operating triad** | Three coordinators sharing the Team Dashboard (Events, Social, P5/VR). |
| **Power of 5** | Each volunteer’s relational turnout / voter-registration network (often 5 core contacts). |

Interested **P5 contacts** who want to volunteer officially are routed to **`/volunteer`**, which provisions the triad — they are not auto-merged into someone else’s P5 list.

### P5 / VR monthly events

Team module encourages:

1. **Community Outreach Social Hour** — regional Power of 5 gathering; add to Events when scheduled.
2. **Voter Registration Event** — monthly VR push; add to Events when scheduled.

Mock **Add to events board** buttons live on the Power of 5 tab until the Events API is wired.

## Public routes

| Route | Purpose |
|--------|---------|
| `/volunteer` | Guided onboarding: hero, how it works, 3-person team builder, roles, signup CTA (external live form), resources links, QR/share footer. |
| `/volunteer/resources` | **Volunteer Resource Library** — categorized downloads and links; missing files show “Coming soon.” |
| `/resources/volunteer` | Optional alias → **301-style** redirect to `/volunteer/resources` (Next `redirect()`). |
| `/field-playbook` | Full public Markdown field manual (same source as admin reader; volunteer-safe chrome). |

No public route above requires admin authentication.

## Centralized links: `src/lib/campaign-links.ts`

- **`CAMPAIGN_WEBSITE_URL`** — `https://www.kellygrappe.com` by default; override with `NEXT_PUBLIC_CAMPAIGN_WEBSITE_URL`.
- **`VOLUNTEER_SIGNUP_URL`** — Live volunteer intake until RedDirt owns the form. Default: `${CAMPAIGN_WEBSITE_URL}/get-involved#volunteer`. Override: **`NEXT_PUBLIC_VOLUNTEER_SIGNUP_EXTERNAL`** (full URL).
- **`DONATE_URL`**, **`CONTACT_URL`**, **`GET_INVOLVED_URL`** — Align messaging with the current public site; donate also honors `NEXT_PUBLIC_DONATE_EXTERNAL_URL` when set.
- **`buildVolunteerSignupUrl(role?)`** — Appends `?role=` **before** the URL hash so anchors stay valid (e.g. `.../get-involved?role=events#volunteer`).
- **Role query values:** `events`, `social-media`, `power-of-5`, `not-sure` (see `VOLUNTEER_ROLE_QUERY`).

Onboarding components should **import URLs from this module** (not hardcode kellygrappe.com strings).

## Resource catalog: `src/lib/volunteer-resources.ts`

- **`VOLUNTEER_RESOURCE_CATEGORIES`** — Section titles for the library.
- **`VOLUNTEER_RESOURCES`** — Typed list: title, description, category, `href`, optional `fileType` / `fileSize`, **`comingSoon`**.
- **`getVolunteerResourcesByCategory()`** — Groups rows for rendering.

## Static asset folders: `public/resources/`

Placeholder tree for future PDFs and printables (may be empty until assets ship):

- `public/resources/getting-started/`
- `public/resources/team-building/`
- `public/resources/roles/`
- `public/resources/weekly-operations/`
- `public/resources/recruitment/` (includes planned `volunteer-qr-code.pdf` — **coming soon** in data)
- `public/resources/printables/`
- `public/resources/playbook/`

Each folder should contain a `.gitkeep` so empty dirs stay in git until files ship.

## Canonical field copy: `field-structure/playbook/`

Markdown chapters are loaded via `src/lib/field-playbook/load-field-playbook-md.ts` and `md-manifest.ts`. Both `/field-playbook` and `/admin/field-playbook` read the same files; admin adds staff chrome.

## Email automation plan (Google Workspace)

**Not implemented in code yet.** Intended behavior once automation is live:

1. Volunteer submits **live** form (currently on KellyGrappe.com; later may move in-app).
2. Welcome email.
3. Role-specific onboarding sequence (mapped from `?role=` when supported).
4. Team-building guidance.
5. Links to **`/volunteer/resources`** and **`/field-playbook`**.
6. Follow-up reminders.

**Code / comments:** See top-of-file note in `src/lib/campaign-links.ts`. Until relaunch, the **existing** public form remains authoritative; RedDirt only links to it and passes optional query params for future use.

## Related RedDirt modules

- `src/components/volunteer/*` — Onboarding UI, resource library UI, signup CTA.
- `src/config/external-campaign.ts` — Older helpers (e.g. on-site `/get-involved#volunteer` when RedDirt **is** the site). Prefer **`campaign-links.ts`** for **absolute** KellyGrappe.com URLs during the hybrid period.

## Launch checklist (for Burt / eng)

- [ ] Confirm **exact** live volunteer URL if not `…/get-involved#volunteer`.
- [ ] Set `NEXT_PUBLIC_VOLUNTEER_SIGNUP_EXTERNAL` in production when URL changes.
- [ ] Upload PDFs / QR asset; flip **`comingSoon: false`** and real file sizes in `volunteer-resources.ts`.
- [ ] Wire Google Workspace automation to form submissions when RedDirt or Zapier-like bridge owns events.
- [ ] When auth ships: bind confirmation + team invite emails to signed magic links with expiry and replay protection.
