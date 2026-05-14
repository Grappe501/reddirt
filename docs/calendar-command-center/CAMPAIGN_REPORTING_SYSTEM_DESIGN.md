# Campaign Reporting System Design

The reporting system should turn the Kelly calendar, county operations, GOTV goals, coverage plans, staffing, materials, and agent readiness into exportable staff reports. Reports are read-only by default. No outbound sending happens in the reporting layer.

## Calendar Reports

- Weekly schedule settlement report.
- Next 14 days decision report.
- Schedule conflict report.
- Work exception report.
- Overnight/travel load report.
- Google sync readiness report.
- Tentative vs confirmed report.

## Event Reports

- Events needing Kelly decision.
- Events needing local coverage.
- Events needing volunteer lead.
- Events needing table permission.
- Events ready to cover.
- Post-event follow-up report.
- Events missing county/location/host.
- Event success playbook report.

## Volunteer/Staffing Reports

- Staffing gap by event.
- Staffing gap by county.
- Volunteer lead needed.
- Callout draft report.
- Reminder draft report.
- Confirmed volunteers by event.
- No-show/check-in later report.

## Materials Reports

- Push cards needed.
- Fans needed.
- Branded mints needed.
- Tablecloth/banner allocation.
- Material shortage report.
- Pack list by weekend route.
- Materials by county/event type.

## County Reports

- County target report.
- County visit gap report.
- County coverage score.
- County follow-up needed.
- County local guide gap.
- County event pipeline.
- County facts missing-data report.

## GOTV/Field Ops Reports

- 5,000 commitment allocation.
- Commitment gap by county.
- House-party goal report.
- Relational coverage estimate.
- Phone/postcard/text capacity estimates.
- Community access support needs.
- Local guide needs.

## AI/Agent Reports

- Agent tool suite report.
- Missing data report.
- Preflight report.
- Capabilities ledger report.
- Readiness over time.
- Top next actions.

## Custom Reports

Saved report definitions should include:

- Name and description.
- Data source or joined sources.
- Filters.
- Columns.
- Sort order.
- Chart type.
- Export format: CSV and JSON first.
- Owner and review status.

The Kelly agent should support “ask for a custom report” and “save this as a report template.” The agent may draft the definition and preview the result, but a human approves saved templates and any future distribution. Reports do not send emails, SMS, public posts, press releases, or calendar changes.
