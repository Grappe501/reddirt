# Campaign Event Ledger — approval email & calendar roadmap

**Sprint mapping:** Sprints 2–5 in [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) · status in [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md) · deps in [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md).

Captured from Steve (May 2026). **Calendar surfaces + drilldown + package builder** are documented in `CAMPAIGN_CALENDAR_OPERATING_SYSTEM.md`. Email send, reply parsing, and GCal sync remain future.

## Future approval automation

When a **tentative** event is added to the campaign calendar:

1. System generates an **approval package** (summary, AI assumptions, missing fields, conflicts, travel estimate, recommended decision).
2. Package is emailed to **candidate** and **campaign manager** (not sent yet).
3. Recipients can:
   - **Reply by email** with approve / deny / hold / requested edits.
   - Open a **secure link** to `/admin/campaign-events/workbench` (future auth-gated).
   - Review **one event** or a **filtered batch** (sort by date, type, status, conflicts).
4. **AI agent** (future) parses inbound replies, updates `CampaignEventLedgerRecord` / fact card, completes approval job.
5. On approval → promote to **official campaign calendar** (Google write/sync — future).
6. **Confirmation email** to everyone involved (automation list below).

### Automation needs (email sequences)

See also `CE_LEDGER_AUTOMATION_NEEDS.md`:

- Confirmed event email to everyone involved
- Pre-event prep sequence
- Volunteer reminder
- Candidate briefing
- Post-event hot wash reminder
- Reimbursement follow-up
- Host thank-you email

### Workbench URL (target)

`https://<production-host>/admin/campaign-events/workbench`

Query params (future): `period`, `status`, `decision`, `recordId` for deep links from email.

## Future calendar surface

Campaign calendar must support:

| View | Scope |
|------|--------|
| Full campaign | Now → Election Day |
| Month | Monthly grid |
| Week | Weekly grid |
| Day | Daily agenda |
| Hourly | Hour-level drilldown |

Every event drilldown includes:

- Notes
- Travel
- Team communication
- Prep / run of show
- Updates
- Documents

CE-LEDGER-3 adds **placeholder chips only** on the workbench page.

## What CE-LEDGER-3 built

- `/admin/campaign-events/workbench` — filter, sort, table, batch queue scaffold
- Reuses `EventReviewModal` per row
- Approval package preview panel (no send)
- No inbound email parser, no Google Calendar write, no automations
