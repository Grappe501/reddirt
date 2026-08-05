# Kelly County Visit — Local Evidence Audit (Pass 1)

**Date:** 2026-08-05  
**Window searched:** 2025-11-01 → 2026-11-03  
**Scope:** Read-only search under `H:\SOSWebsite` campaign folders

## Bulk sources found

| Source | Approx. records | Role |
| --- | ---: | --- |
| `RedDirt/data/campaign-media/calendar-presence.json` | 367 | ICS-derived operator calendar |
| `RedDirt/data/calendar-command-center/calendar-items.normalized.json` | 257 (116 county-touch) | Spreadsheet + ICS normalized |
| `RedDirt/data/calendar-command-center/public-campaign-calendar.snapshot.json` | 118 | Public planning snapshot |
| `RedDirt/data/campaign-brain/locked-events-steve.json` | 41 | Leadership-locked backbone |
| `RedDirt/data/campaign-brain/county-visit-log.json` | 5 | Manual confirmed visits |
| `campaign information for ingestion/arkansas_county_visits_FINAL.xlsx` | 75 counties × Visit 1–5 | County visit ledger (contacts present — **not published**) |
| `kelly-travel-reimbursement/data/calendar-events.raw.json` | 239 | ICS mirror (may contain Zoom/addresses — not published raw) |
| `Kelly-calendar/data/` | drafts only | No full live dump |

## Seeding rules applied

- Accepted / plainly completed travel → `completed` when date &lt; 2026-08-05
- Future accepted travel → `scheduled`
- Declined / Exclude → not public visits
- Virtual / Zoom → `virtual`, off public page
- Private fundraisers / house parties / leadership retreats → `private`, off public page
- Travel / lodging blocks → held off public page
- Exact title+date duplicates consolidated
- Uncertain counties → `counties: []`, `needs-review` (or held off public when presence-only)
- Contact names, phones, emails, Zoom links, lodging details omitted from public fields

## Seed outcome (Pass 1 generator)

| Metric | Count |
| --- | ---: |
| Total records in canonical file | 330 |
| Public-facing (`includeOnPublicPage: true`) | ~190 |
| Needing county review (public unresolved) | ~22 |
| Held non-public (private/virtual/travel/exclude) | ~140 |

## Representative confirmed / likely public stops

| Date | Title | County | Confidence | Status | Source |
| --- | --- | --- | --- | --- | --- |
| 2025-12-13 | Koffee with Kelly | Pope | likely | completed | calendar-items |
| 2025-12-14 | NAACP Jacksonville Branch Christmas Party & Meeting | Pulaski | likely | completed | calendar-items |
| 2026-02-07 | Van Buren County Candidate Forum / Pie Auction | Van Buren | likely | completed | calendar-items |
| 2026-04-11 | Mena picnic / Polk County visit | Polk | confirmed | completed | visit-log + xlsx + photo notes |
| 2026-05-02 | Toad Suck Daze | Faulkner | confirmed | completed | visit-log |
| 2026-05-16 | Magnolia Blossom Festival immersion | Columbia | confirmed | completed | visit-log |
| 2026-05-18 | Pulaski County Dems | Pulaski | confirmed | completed | visit-log |
| 2026-06-07 | Cave City visit | Sharp | confirmed | completed | visit-log |
| 2026-06-07 | Dardanelle visit | Yell | confirmed | completed | visit-log |
| 2026-06-26 | SOS Debate – Annual Press Convention | Carroll | likely | completed | locked-events |
| 2026-08-05 | NWA Senior Dems | Washington | likely | scheduled | locked-events |
| 2026-08-12 | Arkadelphia visit | Clark | likely | scheduled | locked-events |
| 2026-09-15 | Pope County Fair | Pope | likely | scheduled | locked-events / presence |

## Intentionally not published (examples)

| Date | Title | Reason |
| --- | --- | --- |
| 2026-06-16 | Quitman fundraiser (variants) | Private house fundraiser |
| 2026-06-28 | Volunteer leadership retreat | Internal / private |
| various | Drive to Magnolia / lodging nights | Travel support blocks |
| various | Zoom / DPA Hub virtual | Not a county visit |
| spreadsheet cells | Contact / chair names | PII — dates+counties only seeded |

## Pass 2 expectation

Final Google Calendar inventory will merge into the same `kellyCampaignStops` array. Keep uncertain and multi-county rows; do not restructure the page.
