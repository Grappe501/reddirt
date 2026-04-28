# Candidate communication command board — plan (V2.15)

## Intent

Kelly needs a **single orientation surface** on `/admin/ask-kelly` to see where **social performance**, **email**, **text**, **one-to-one comms**, and **Campaign Organizing Hub** (e.g. Discord when provisioned) live—without this console sending anything or bypassing approvals.

## Current implementation (scaffold)

- **UI:** `AskKellyCandidateCommunicationBoard` inside `AskKellyCommandConsole`.
- **Behavior:** **Navigation only** — links to existing admin routes; **no** send buttons, **no** new vendors, **no** migrations.

## Routes wired (RedDirt)

| Need | Route |
|------|--------|
| Social drafts / workbench | `/admin/workbench/social` |
| Comms hub (plans, ops) | `/admin/workbench/comms` |
| Broadcasts (email/SMS programs) | `/admin/workbench/comms/broadcasts` |
| Email queue (items) | `/admin/workbench/email-queue` (available from comms context; not duplicated on every card) |
| Campaign workbench (threads / lanes) | `/admin/workbench` |
| Content / orchestrator inbox | `/admin/inbox` |
| Ask Kelly console | `/admin/ask-kelly` |

### Campaign management URLs (same RedDirt deployment — not sister-app lanes)

| Surface | Route |
|---------|-------|
| County briefings index | `/county-briefings` |
| Pope drill-down briefing | `/county-briefings/pope` |
| County intelligence (admin) | `/admin/county-intelligence` |
| Volunteer pathways (public) | `/get-involved` |
| Volunteer sheet intake (admin) | `/admin/volunteers/intake` |

Aliases such as **`/countyWorkbench`** / **`volunteerPage`** / **`/dist*-briefing*`** are naming targets for future App Router parity; briefing + volunteer work today resolves through the routes above (`docs/CANDIDATE_LIVE_DASHBOARD_READINESS_PLAN.md` §5).

## Campaign Organizing Hub (e.g. Discord)

- **Campaign-owned** coordination—Discord (or similar) stays **invite-managed** outside this scaffold until ops provisions a link.
- **Card state:** Planned / setup-needed until an approved `NEXT_PUBLIC_*` invite URL or internal doc link is provisioned **with counsel/ops** (no in-app URL today).
- **Link-out only** for third-party chat—**no** runtime imports from other product folders; **county** and **volunteer** routes in the table above are first-party RedDirt.

## What the candidate expects next

| Priority | Capability | Notes |
|----------|------------|-------|
| P0 | **Social stats visible at a glance** | Requires **live metrics integration** (aggregates from `SocialContent*` / analytics tables or external platform APIs)—**not invented** in Ask Kelly. |
| P1 | **Channel health** | Same data layer—future slice. |
| P2 | **Message queue / approval queue** | Surface drafts pending compliance—reuse comms/workbench models. |

## Compliance

- **Mass email and SMS** remain **approval- and compliance-gated** (`Comms`/broadcast tooling; counsel workflow).
- **No voter-row or donor-detail** exposure through this scaffold.

## Risks

- Treating console links as “send” — copy must stay **review-first** (done in card text).
- Premature Discord deep link — **blocked** until policy + env exist.

## References

- `prisma/schema.prisma` — `SocialContentItem`, `Communication*`, `EmailWorkflowItem`, etc.
- `src/app/admin/(board)/workbench/social/page.tsx` — social workbench data.
- `src/app/admin/(board)/workbench/comms/page.tsx` — comms hub.
