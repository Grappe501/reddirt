# 00 — System audit (Election Plan + Executive Book)

**Audit date:** 2026-06-16  
**Branch context:** Kelly SOS feature work on `RedDirt/`

## Build pipeline — green

| Command | Result |
|---------|--------|
| `npm run election-plan:build` | 75 counties · 40 cities → `data/election-plan/election-plan-workbench.snapshot.json` |
| `npm run campaign-brain:executive-book:completion` | 6 deliverables · 4 owners TBD · 8 influence categories · 6 contact seeds |
| `npm run election-plan:search:build` | 1,282 search entries |
| `npm run election-plan:audit:routes` | **909 / 909 catalog hrefs resolve** (68 static + dynamic portal routes) |

The route audit script lives at `scripts/election-plan/audit-portal-routes.ts` and is wired as `election-plan:audit:routes`. It validates every href in the admin catalog, executive book chapters, platform planks, volunteer academy, and smoke-test doorway.

## Link wiring — complete at route level

All catalog-linked URLs resolve to a `page.tsx` under `src/app/election-plan/(portal)/`, including dynamic segments:

- `[countySlug]`, `[slug]` (cities, workbenches, campuses, academy)
- `[clusterId]` (battlefield, lanes-overview)
- `[eventSlug]`, `[eventId]`, `[meetingId]`

**Critic note:** Route existence ≠ content depth. Many pages render with snapshot data only; see [03-PAGE-TIER-MATRIX.md](./03-PAGE-TIER-MATRIX.md).

## Pilot smoke — INCOMPLETE (expected)

Primary gate: **Jacksonville city** + **Grassroots & Guitar Strings event**

| Path | Status | Blockers |
|------|--------|----------|
| Jacksonville `/election-plan/workbenches/jacksonville` | INCOMPLETE | Community Lead, first event, AAR |
| G&G `/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings` | PARTIAL | Event Chair, AAR (seed + committee + run-of-show pass) |
| Sherwood city (optional) | PARTIAL | Community Lead, AAR |

DB pool warnings during smoke (`max clients reached`) are environmental — reduce parallel Prisma upserts or run with a quiet DB session. Smoke still printed path status and exited 0.

## UI critic pass

### Fixed this pass

1. **Fundraising entry “Continue to website”** — `HomeDonateFloatingGate.tsx`: larger type (`text-base` / `sm:text-lg`), clearer label.
2. **`.ep-warning` panels** — explicit `color: var(--ep-navy)` so inherited muted navy does not wash out on tinted red background.
3. **`.ep-hero` safeguard** — any accidental `text-[var(--ep-navy-muted)]` inside hero flips to white/85% opacity.

### Recurring contrast pattern to watch

- `--ep-navy-muted` (#1a3559) on `--ep-cream` / white: **OK**
- Same token on navy hero, glass cards over navy, or warning tint: **risky** — prefer `text-white/75` on dark, `#3d5270` on light tinted panels
- Sidebar nav inactive items use muted navy on white: **OK**

Run a visual pass on: Executive Book hub warning card, county playbook guardrail banners, workbench defect log on mobile.

## Executive Book completion audit

From `docs/strategic-plan/plurality-victory-plan/executive-book-v1/executive-book-completion-audit.json`:

- **Status:** `operational_assign_owners`
- **Unassigned owners:** 4 (GOTV war room lead, etc.)
- **Labor Day deadline:** 2026-09-07

Chapters render with live scorecard overlays where sourced; ownership matrix links to `/election-plan/leadership/responsibility-matrix`.

## Back-of-house (admin)

| Surface | Role |
|---------|------|
| `/admin/election-plan` | Full portal link catalog + smoke doorway |
| Form intake → WorkflowIntake | Day 3 slice (public forms → Kelly DB → operator queue) |
| Community workbench DB | Pilot paths above |
| Netlify build | `scripts/netlify-build.sh` → migrate → `election-plan:build` → `next build` |

## Search index stale excerpts

Three search excerpts still mention legacy placeholder names from **source markdown docs** (not portal UI):

- Campaign Operations Mode doc
- Candidate Review Hardening Checklist
- Monday Morning Operating Document

Rebuild search after updating those docs (Phase 2 in upgrade plan).

## Remaining blockers before Days 4–7 compression

1. Jacksonville pilot path incomplete in production UI
2. G&G Event Chair + AAR pending
3. Four executive-book operational owners unassigned
4. PPEN A.0b not started (blocks coalition enrollment UI)
5. Compliance admin still uses legacy route slug `/admin/compliance/ernie` (rename deferred)

**Days 4–7 compression:** Safe for **content leveling + UI polish** in parallel with pilot completion. **Not safe** to skip PPEN A.0b before coalition enrollment or fake person records.
