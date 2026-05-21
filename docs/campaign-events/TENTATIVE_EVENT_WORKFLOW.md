# Tentative event workflow (website intake)

## Lane definition

Website submissions enter the **tentative** Campaign Event OS lane until an operator approves and (later) promotes to official Google Calendar.

## Visibility

| Surface | Tentative website events |
|---------|-------------------------|
| Campaign Events Workbench | ✅ badges: Tentative, Website, Needs review |
| Month Review Wizard | ✅ modes: `website_intake_only`, `needs_intake_review`, `duplicate_risk`, `intake_conflict` |
| Travel log | ✅ candidates; not in **finalized** reimbursement until `decision: approved` |
| Month readiness | ✅ via shared row loaders |
| Candidate / CM dashboards | ✅ intake queue stats |
| Campaign calendar OS | ✅ tentative calendar status on row |

## Excluded until approved

- Official reimbursement report **approved** table (`isReimbursementEligible`)
- Google Calendar write (Sprint 3–5)
- Approval email send (Sprint 4)

## Operator actions

1. Open workbench or month review → filter website / needs intake review
2. Review → `EventReviewModal` shows `IntakeAiSummaryCard`
3. Edit fact card sections → save
4. Decision: approve / deny / hold / request info (`review-meta`)
5. Drilldown: `/admin/campaign-events/{recordId}`

## Promotion path (future)

`tentative` → review complete → `CONFIRMED` → `officialCalendarId` + `googleSyncStatus` (Sprint 5).

`resolveCalendarLanes()` lists promotion blockers including review status and Google not linked.
