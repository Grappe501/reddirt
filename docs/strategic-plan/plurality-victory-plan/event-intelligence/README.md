# Master Event Intelligence Layer

> **Status:** Generated — scheduling engine foundation
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT

**Do not build Weeks 1–20 until this layer is verified and merged with opportunity clusters.**

---

## Event categories

| Category | Events | Status |
| -------- | -----: | ------ |
| [County Fairs](./county-fairs/README.md) | 75 | populated |
| [Festivals](./festivals/README.md) | 0 | scaffold |
| [Chamber Events](./chambers/README.md) | 0 | scaffold |
| [Rotary Clubs](./rotary-clubs/README.md) | 0 | scaffold |
| [Lions Clubs](./lions-clubs/README.md) | 0 | scaffold |
| [Farm Bureau](./farm-bureau/README.md) | 0 | scaffold |
| [Volunteer Fire Departments](./volunteer-fire-departments/README.md) | 0 | scaffold |
| [Faith Events](./faith-events/README.md) | 0 | scaffold |
| [County Clerk Events](./county-clerk-events/README.md) | 0 | scaffold |
| [Campus & School Events](./campus-school/README.md) | 92 | populated |
| [Civic & Community](./civic-community/README.md) | 150 | populated |

---

## Priority for SOS race

**County clerk events** have disproportionate value — build clerk relationship calendar alongside fairs and festivals.

---

## Data sources

- `data/calendar-command-center/community-opportunities-2026.normalized.json` (317 rows)
- `data/calendar-command-center/arkansas-county-fairs-2026.normalized.json` (75 fairs)
- `data/calendar-command-center/festival-leads.verified.json`

---

## Regenerate

`npm run strategic-plan:events:build`
