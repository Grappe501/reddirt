# Campaign calendar DB audit (generated 2026-05-13T21:35:38.526Z)
## Workbook
- Path: C:/Users/User/Downloads/Kelly_Grappe_Travel_Calendar_to_July_4_2026.xlsx
- Calendar Import rows processed: 213
## Prisma connectivity
- Connected: false
- Note: 
Invalid `prisma.county.findMany()` invocation in
H:\SOSWebsite\RedDirt\scripts\travel-calendar-xlsx-reconcile.ts:209:21

  206 const since = new Date("2025-11-01T00:00:00.000Z");
  207 const until = new Date("2026-07-05T23:59:59.999Z");
  208 const [counties, events, festivals, googleRows] = await Promise.all([
→ 209   prisma.county.findMany(
The column `counties.slug` does not exist in the current database.
- If the error mentions missing columns, local DATABASE_URL likely lags the Prisma schema; align migrations or point at Kelly-Grappe-App read replica for reconcile.
- Counties loaded: 0
- CampaignEvent in window: 0
- ArkansasFestivalIngest in window: 0
- GoogleCalendarEventRecord sample: 0
## Calendar Import reconciliation
- Rows with CampaignEvent match: 0
- Rows without confident match: 213
## Festival leads
- verified_in_burt_db: 0
- needs_confirmation / other: 23
## County meetings
- Tentative placeholder rows emitted: 75 (DPA scrape + county confirmation still required)
## Top 15 counties (spreadsheet priority, de-emphasizing abundant-opportunity fillers except Tier 1)
1. Clark — score 20 — Tier 1 - protect anchor
2. Columbia — score 20 — Tier 1 - protect anchor
3. Conway — score 20 — Tier 1 - protect anchor
4. Drew — score 20 — Tier 1 - protect anchor
5. Desha — score 19 — Tier 1 - protect anchor
6. Montgomery — score 18 — Tier 1 - protect anchor
7. Bradley — score 17 — Tier 1 - protect anchor
8. Carroll — score 17 — Tier 1 - protect anchor
9. Baxter — score 13 — Tier 1 - fill first
10. Dallas — score 13 — Tier 1 - fill first
11. Howard — score 13 — Tier 1 - fill first
12. Independence — score 13 — Tier 1 - fill first
13. Lafayette — score 13 — Tier 1 - fill first
14. Chicot — score 12 — Tier 1 - fill first
15. Crittenden — score 12 — Tier 1 - fill first
## Outputs
- H:\SOSWebsite\RedDirt\data\calendar-command-center\calendar-items.normalized.json
- H:\SOSWebsite\RedDirt\data\calendar-command-center\county-priority-snapshot.json
- H:\SOSWebsite\RedDirt\data\calendar-command-center\festival-leads.verified.json
- H:\SOSWebsite\RedDirt\data\calendar-command-center\county-meetings.tentative.json