# County Workbench Full Stack Audit

**Date:** 2026-05-31 · **Lane:** RedDirt/

## 1. What exists

| Layer | Status |
|-------|--------|
| 75-county registry (`arkansas-county-registry.ts`) | Real SSOT |
| Public routes `/counties/[slug]` | 75/75 resolve |
| Dashboard v2 (Pope, Pulaski, Faulkner) | Real UI |
| Workbench FS bridge | Real when `COUNTY_WORKBENCH_ROOT` set |
| Governed public brief JSON (75 files) | Generated, NON_PUBLISHABLE |
| Prisma `County` + `CountyCampaignStats` | Canonical goals path |
| Admin `/admin/county-intelligence` | Statewide command + factory panel |
| County factory (this pass) | JSON fact store, profiles, briefs, agent |

## 2. What is real vs shell

- **Real depth:** 6 full workbench profiles, 3 v2 dashboards, registry identity for all 75
- **Shell (69 counties):** ~5% workbench completion, no validators/media/events indexed
- **PUBLIC_BRIEF_READY:** 0 by design

## 3. Duplicated systems

1. RedDirt v2 dashboards vs sister `countyWorkbench` portal
2. `countyPublicBriefGenerator` vs factory briefs vs Kim Hammer NSI county briefings
3. Three readiness matrices (workbench CSV, executive JSON, memory audit)

## 4. Split-brain risks

- Planning vote target proxy ≠ `CountyCampaignStats.registrationGoal`
- Sync adapter path may not merge canonical goals on all dashboards
- Executive readiness scores ≠ workbench CSV completion

## 5. Data sources

| Source | Wired? |
|--------|--------|
| Registry | Yes (factory seed) |
| Workbench CSV/JSON | Bridge only |
| Prisma goals | Read-only, admin write |
| Census/BLS/SOS | Deferred (Pass C1–C3) |
| Local validators/media | Manual (Pass C6–C8) |

## 6. All 75 counties status

See factory rollup after `npm run county:factory:all`. Expect majority SHELL profiles until ingestion passes complete.

## 7. Fastest path before debate (2 weeks)

1. `npm run county:factory:all`
2. Pass C2: SOS registration import
3. Pass C6–C7: events + media for travel counties
4. Pass C9–C10: message + debate county packets
5. Human-verify canonical goals in `/admin/counties/[slug]` — never via factory
