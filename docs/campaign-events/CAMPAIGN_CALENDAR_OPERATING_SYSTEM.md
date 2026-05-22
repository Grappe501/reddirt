# Campaign Calendar — Operating System Architecture

**Master build order:** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) (Sprints 0–10) · [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md) · [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md).

The campaign calendar is the **campaign operating system**, not a passive schedule. Each `CampaignEventLedgerRecord` is simultaneously:

| Object | Current surface |
|--------|-----------------|
| Travel | Fact card Travel + travel ledger parallel path |
| Operations | Drilldown Run of Show / Day view slots |
| Communication | `_communication` thread in factCard JSON |
| Approval | Workbench + approval package builder |
| Reimbursement | Miles + $ on record |
| Knowledge | Fact card sections + AI inference |
| Automation | Placeholder timeline (not built) |

## County links (events → county operations)

- Resolver: `src/lib/county/county-workbench-event-links.ts`
- Admin bridge: `/admin/counties/[slug]` (placeholder panels + links to **countyWorkbench** when `NEXT_PUBLIC_COUNTY_WORKBENCH_URL` is set)
- Canonical sister routes: `/counties/{slug}/dashboard-v2`, `/counties/{slug}/intelligence` — see `countyWorkbench/docs/COUNTY_WORKBENCH_ROUTE_INVENTORY.md`

## Election countdown

Floating widget on all `/admin/*` pages — see `CAMPAIGN_OS_USABILITY_PASS.md`.

## AI tools & planner

- `/admin/campaign-events/ai-tools` — tool lifecycle inventory
- Franklin planner scaffolding on day + agenda calendar views

## Routes (admin)

| Route | Purpose |
|-------|---------|
| `/admin/campaign-calendar/timeline` | Now → Election Day (quiet gaps compressed) |
| `/admin/campaign-calendar/month` | Monthly grid |
| `/admin/campaign-calendar/week` | Weekly columns + travel/lane |
| `/admin/campaign-calendar/day` | Operational day detail |
| `/admin/campaign-calendar/agenda` | Dense execution list |
| `/admin/campaign-events/workbench` | Batch review queue |
| `/admin/campaign-events/ai-tools` | AI Agent Tool Package (roadmap) |
| `/admin/campaign-events/[recordId]` | Event drilldown home |
| `/admin/counties/[slug]` | County ops bridge → countyWorkbench |
| `/admin/campaign-calendar/approval-package/[recordId]` | Package preview |

## Data source

- `CampaignEventLedgerRecord` (Prisma) seeded from `data/calendar-command-center/calendar-items.normalized.json`
- Loader: `loadCampaignCalendarSurface()` — all records through Election Day
- No Google Calendar write/sync in this pass

## Tentative vs official calendar model

Internal lanes (`calendar-lane.ts`):

- **tentative** — draft / hold events
- **official** — confirmed public campaign calendar
- **personal_admin** — personal/admin imports
- **imported_only** — normalized import not yet promoted

Each row shows **source lane → target lane** and **promotion eligibility** with blockers (review incomplete, Google not linked, etc.). Prisma fields `tentativeCalendarId`, `officialCalendarId`, `calendarStatus` reserved for future GCal IDs.

## Approval package lifecycle

Statuses (`approval-timeline.ts`):

1. `tentative_created`
2. `under_review`
3. `awaiting_candidate`
4. `awaiting_campaign_manager`
5. `approved` / `denied` / `hold`
6. `promoted_to_official_calendar`

Builder: `buildApprovalPackage()` → normalized `ApprovalPackagePayload` (no email send).

**Future email workflow** (not built):

- Tentative event created → package generated → candidate + CM emailed
- Secure workbench/drilldown links + reply-by-email parser
- AI extracts approve/deny/hold from replies → updates fact card → promotes to official calendar
- Confirmation email + pre-event automation sequence

## Event intelligence

Per-event deterministic inference (`infer-event-assumptions.ts`) — **never bulk**:

- City, county, venue, host, audience, staffing, materials, setup, travel
- House Meet & Greet: cross-aisle outreach, relaxed setup, minimal volunteers, Zoom optional, recurring potential

## Communication thread

Stored in `factCard._communication`:

```ts
{ id, at, author, noteType, body }
```

Types: internal, event_update, logistics, campaign_manager, candidate, volunteer, host.

## Automation roadmap

See `CE_LEDGER_AUTOMATION_NEEDS.md` and `CE_LEDGER_APPROVAL_AND_CALENDAR_ROADMAP.md`.

Planned per event (drilldown Automation tab): prep sequence, volunteer reminders, reimbursement follow-up, host thank-you — **no automations running yet**.

## Explicitly not built

- Google Calendar write/sync
- Inbound email parsing / send
- April period
- FIN-1 bridge
- PDF export
- Receipts system
- Full chat platform
