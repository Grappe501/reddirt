# Campaign OS — usability pass (county links, countdown, AI tools, planner)

**Lane:** `RedDirt/` only. **County product:** `countyWorkbench/` (sister app — link via URL, no cross-lane imports).

## County workbench links

| Surface | Behavior |
|---------|----------|
| Event workbench county column | Clickable → `/admin/counties/[slug]` |
| Event drilldown header | County link when `factCard.where.county` resolved |
| Calendar chips / day / agenda | County link on event when county known |

**Slug resolution:** `resolveRegistryCountyFromLabel()` → `ARKANSAS_COUNTY_REGISTRY` (75 counties).

**Outbound (when `NEXT_PUBLIC_COUNTY_WORKBENCH_URL` set):**

- `https://{portal}/counties/{slug}/dashboard-v2` — canonical operator dashboard (countyWorkbench)
- `https://{portal}/counties/{slug}/intelligence` — data-readiness view

**RedDirt bridge:** `/admin/counties/[slug]` — placeholder panels (leaders, goals, census, contacts, events, notes) + outbound links. **No invented people or data.**

**Public RedDirt:** `/counties/[slug]` · **OIS:** `/organizing-intelligence/counties/[slug]`

See `countyWorkbench/docs/COUNTY_WORKBENCH_ROUTE_INVENTORY.md` for the full countyWorkbench route map.

## Election Day countdown widget

- Component: `AdminElectionCountdownWidget`
- Mounted on **all** `/admin/*` pages via `src/app/admin/layout.tsx`
- Election date: `ELECTION_DAY_2026` = `2026-11-03` (`src/lib/campaign-dates.ts`)
- Draggable, position + minimized state in `localStorage` (`reddirt-admin-election-countdown-v1`)

## AI Agent Tool Package (master inventory)

- Route: `/admin/campaign-events/ai-tools`
- Catalog: `src/lib/campaign-events/ai-tools-master-catalog.ts` (22 lifecycles, 80+ tools)
- Docs: `AI_AGENT_TOOL_PACKAGE_MASTER.md`
- Filters: lifecycle, status, priority, human-approval required, search

## Monthly Travel Ledger Report

- Route: `/admin/campaign-events/travel-report?month=YYYY-MM` (default `2026-03`)
- Docs: `MONTHLY_TRAVEL_LEDGER_REPORT.md`
- CSV export functional; PDF/email/reimbursement packet buttons scaffolded only
- Send scaffold panels with default candidate recipients (not sent)

## Candidate and campaign manager dashboards

- `/admin/candidate-dashboard` — `CANDIDATE_DASHBOARD.md`
- `/admin/campaign-manager-dashboard` — `CAMPAIGN_MANAGER_DASHBOARD.md`
- Approval recipients: `APPROVAL_RECIPIENTS_AND_EMAIL_SCAFFOLD.md`

## Multi-month ledger seeding (March + April)

- `CAMPAIGN_EVENTS_MONTH_SEEDING.md`
- `npm run campaign-events:seed-march` · `npm run campaign-events:seed-april` · `npm run campaign-events:seed-month -- YYYY-MM`
- Month nav chips on workbench, review, travel report, dashboards
- Month readiness: `/admin/campaign-events/month-readiness?month=2026-04` — `MONTH_READINESS_AND_APRIL_COMPLETION.md`

## Franklin planner mode

- Component: `FranklinPlannerScaffold`
- On: `/admin/campaign-calendar/day`, `/admin/campaign-calendar/agenda`
- Panels: priorities, candidate schedule, CM notes, calls, travel, prep, blocked, hot wash, tomorrow prep
- Notes: `localStorage` per date (`campaign-planner-{ymd}`) — not synced to DB

## Functional vs not built

| Built | Not built |
|-------|-----------|
| County links + admin bridge | Google Calendar write/sync |
| Countdown widget | Email send / inbound parse |
| AI tools inventory page | SMS, voter-file, postcards |
| Planner UI + local notes | Full host portal auth |
| | FIN-1, PDF, April, receipt dashboard |

## Month Review Wizard

See **`MONTH_REVIEW_WIZARD.md`** — `/admin/campaign-events/review` with setup dashboard + one-event approval workbench.

## Related

- `CAMPAIGN_CALENDAR_OPERATING_SYSTEM.md`
- `CE_LEDGER_APPROVAL_AND_CALENDAR_ROADMAP.md`
- `MONTH_REVIEW_WIZARD.md`
