# Kelly Across Arkansas — Steve Review Sheet

**Generated:** 2026-08-06T15:42:51.728Z  
**Canonical data:** `src/data/kelly-county-visits/kelly-county-visits.ts`  
**Public page:** `/arkansas-visits`

## Snapshot

| Metric | Count |
| --- | ---: |
| Total records in ledger | 343 |
| Public records | 206 |
| Public completed stops | 190 |
| Public scheduled stops | 16 |
| Unique counties completed (visited) | 51 |
| Unique counties scheduled only (not yet visited) | 1 |
| Unresolved public county assignments | 7 |

### Excluded from public page (by status)

| Status | Count |
| --- | ---: |
| canceled | 47 |
| duplicate | 1 |
| needs-review | 47 |
| private | 41 |
| virtual | 1 |

These include virtual, private (incl. house fundraisers), declined/canceled, travel/lodging placeholders, and non-public needs-review rows held for later merges.

## Unresolved public records

Fill the blank columns. Keep `includeOnPublicPage: true` only if the stop should remain public.

| Date | Original calendar heading | City/location clue | Current counties | Steve correction | Add another county? | Keep public? |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-03-28 | Grassroots and guitar strings | — | *(empty)* |  |  |  |
| 2026-05-17 | Bishop Arnold Magnolia; Tabernacle of Faith Wynne at 3 PM | — | *(empty)* |  |  |  |
| 2026-05-21 | Third Thursday Benton; Arkansas Times Tacos & Tequilas | — | *(empty)* |  |  |  |
| 2026-06-03 | Extension Homemakers Club Convention | — | *(empty)* |  |  |  |
| 2026-06-27 | King Kennedy dinner; verify location | — | *(empty)* |  |  |  |
| 2026-06-27 | Pioneer Heritage Festival | Norfork | Baxter |  |  |  |
| 2026-07-23 | HSV dems meeting | — | *(empty)* |  |  |  |

## Likely multi-county trips to review

| Dates | Working title | Candidate counties | Notes |
| --- | --- | --- | --- |
| 2026-04-18 → 2026-04-20 | Mountain Home / Yellville corridor | Baxter, Marion | Keep as separate stops unless Steve wants one multi-county row |
| 2026-06-11 → 2026-06-14 | Pink Tomato / Mountain View / South AR | Bradley, Drew, Stone | Conflict headings present — do not auto-merge |
| 2026-03-21 → 2026-03-23 | Camden immersion | Ouachita | Multi-day; one county unless other stops proven |
| 2026-05-16 → 2026-05-18 | Magnolia immersion | Columbia | Magnolia/Wynne conflict row still needs Steve call |
| 2026-07-11 → 2026-07-13 | Benton County volunteer corridor | Benton | Multiple events same county OK |
| 2026-07-26 → 2026-07-27 | Mississippi County immersion | Mississippi | |
| 2026-06-27 | Pioneer Heritage Festival | Baxter vs Searcy | Locked row lists Norfork/Baxter; presence conflict noted |
| 2026-07-23 | HSV Dems meeting | Garland and/or Saline | Hot Springs Village spans county lines |

## How to edit

1. Open `src/data/kelly-county-visits/kelly-county-visits.ts`
2. Find the stop by `id` or date + title
3. Set `counties: ["CountyName"]` using spellings from `arkansas-counties.ts`
4. Set `status: "completed"` or `"scheduled"`
5. Set `includeOnPublicPage: false` to hide
6. Run `npm run visits:validate` then preview `/arkansas-visits`

See also: `KELLY_COUNTY_VISIT_PAGE_EDITOR_GUIDE.md`
