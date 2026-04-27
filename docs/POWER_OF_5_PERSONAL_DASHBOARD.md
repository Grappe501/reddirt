# Power of 5 — personal dashboard

**Lane:** `RedDirt/`  
**Route:** `/dashboard` (public site shell via `src/app/(site)/dashboard/page.tsx`)  
**Status:** UI complete on **demo data** — no authentication, no Prisma, no voter file, no production Power of 5 aggregates.

## Purpose

The personal dashboard is the volunteer-facing home for **relationship-first organizing**: who is in your intentional circle, how your team is pacing, what conversations just happened, what follow-ups are due, and how your work ladders into broader impact — without shame-based public rankings or exposed private data.

## What ships in this build

| Area | Behavior |
|------|----------|
| **Data** | Static demo object `PERSONAL_DASHBOARD_DEMO` in `src/lib/power-of-5/personal-dashboard-demo.ts`. All names are synthetic (given name + initial). |
| **Auth** | None — page is public; banner states demo mode. |
| **Privacy** | No household maps, no voter identifiers, no imports from admin voter tools. |

## Components

| Component | File | Shows |
|-----------|------|--------|
| **MyFivePanel** | `src/components/dashboard/personal/MyFivePanel.tsx` | Power of 5 slots, per-person status (open → committed), last-touch copy, circle fill meter. |
| **MyTeamPanel** | `src/components/dashboard/personal/MyTeamPanel.tsx` | Team progress: active members vs goal, **conversations this week** vs weekly goal, open follow-ups count, consistency streak. |
| **MyImpactPanel** | `src/components/dashboard/personal/MyImpactPanel.tsx` | Impact ladder chapter (reuses `IMPACT_LADDER_STEPS` from `src/lib/power-of-5/onboarding-demo.ts`), personal conversation count, invites extended, **estimated trusted reach** (explicitly demo/narrative). |
| **MyTasksPanel** | `src/components/dashboard/personal/MyTasksPanel.tsx` | **Follow-ups** queue with priority and due labels; **recent conversations** log (outcome + summary). |

Composition and chrome: `src/components/dashboard/personal/PersonalDashboardView.tsx` (demo banner, header, responsive 2-column grid).

Shared visual language: `CountySectionHeader`, `countyDashboardCardClass`, `CountySourceBadge` from the county dashboard shell for consistency with OIS / command views.

## Demo content mapping (requirements → UI)

- **Team progress** — `MyTeamPanel` progress bars and stat tiles.  
- **Conversations** — `MyTasksPanel` “Recent conversations” list; counts also surface on team strip.  
- **Follow-ups** — `MyTasksPanel` “Open follow-ups” list.  
- **Impact** — `MyImpactPanel` ladder + KPI trio (conversations, invites, estimated reach).

## Related routes

- Leader rollup placeholder: `/dashboard/leader`  
- Public organizing intelligence: `/organizing-intelligence`  
- Operator hub (admin, gated): `/admin/organizing-intelligence`

## Next steps (not in this pass)

- Session + tenant/campaign scope; replace demo payload with API or RSC loaders.  
- Mutations: complete task, log conversation, update five — with audit and consent rules.  
- Tie “team” to real roster rules (without surfacing voter PII to volunteers).  
- Optional: embed onboarding deep-link from `src/components/onboarding/power-of-5/*` for empty states.

## Files touched (reference)

- `src/lib/power-of-5/personal-dashboard-demo.ts` — types + `PERSONAL_DASHBOARD_DEMO`  
- `src/components/dashboard/personal/*` — panels + barrel  
- `src/app/(site)/dashboard/page.tsx` — page entry
