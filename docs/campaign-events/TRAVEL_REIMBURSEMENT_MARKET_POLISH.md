# Travel reimbursement — market polish checklist

Use this for demo readiness and go-live gating.

## Demo script (Steve)

1. Open **Campaign manager dashboard** → reimbursement cards for Mar / Apr / May.
2. **Tentative travel log** (`travel-log?month=2026-04`) → filter “Needs approval”.
3. **Approve travel** → review wizard with plain labels (Approve travel, Deny travel, Hold, Send for more information).
4. After approve/deny, confirm row leaves “needs approval” filter.
5. **Edit / correct** one row → event drilldown banner → save → totals refresh on report.
6. **Official reimbursement request** → print preview → CSV download.
7. Repeat month chips for March and May MTD.

## Polish completed (this pass)

- [x] March / April / May month chips on reimbursement routes
- [x] Four-step workflow nav (log → review → report → reimbursement)
- [x] Tentative travel log with filters and review entry links
- [x] Date-range review (`start` / `end` query params)
- [x] Travel-focused wizard summary and button labels
- [x] Approved/denied queue removal in `travel_needs_approval` mode
- [x] Official reimbursement page with print CSS, CSV, JSON
- [x] Dashboard reimbursement cards (candidate + CM)
- [x] Nav links in campaign-events shell
- [x] Documentation set (this folder)

## Still scaffold / not built

- [ ] PDF server export
- [ ] Email to candidate / CM
- [ ] Google Calendar write-back
- [ ] FIN-1 reimbursement bridge
- [ ] Compliance packet / receipt matching
- [ ] Website `/schedule` → ledger intake bridge

## Go-live readiness (honest)

**Functional for internal demo and operator execution** when DB is seeded and approvals are completed per month.

**Not** a substitute for compliance filing or bank reimbursement until FIN-1 / packet work is explicitly scoped.
