# County Workbench Deep Inventory

**Sister lane:** `H:\SOSWebsite\countyWorkbench`  
**Bridge:** `RedDirt/src/lib/agents/county-intelligence/county-workbench-adapter.ts` (read-only)  
**Authority:** `countyWorkbench/docs/COUNTY_WORKBENCH_ROUTE_INVENTORY.md`

Steve-approved integration: filesystem read of reports + JSON; **no** `import` from `countyWorkbench/src`.

---

## Summary

| Area | Count / status |
|------|----------------|
| App routes | ~77 `page.tsx` |
| Export APIs | 15 GET `export/route.ts` |
| Counties | 75 in `countyIndex.ts` |
| Full profiles wired | 6 (pope, garland, jefferson, faulkner, pulaski, saline) |
| Shell counties | 69 + scaffolds |
| Prisma / live DB | **None** in countyWorkbench |
| Registration goals adapter | **Stub** — all null until sheet/DB |
| RedDirt bridge (this pass) | CSV coverage + state-aligned JSON + QA JSON |

---

## Data sources consumed by Campaign OS adapter

| Path (under countyWorkbench) | Purpose | Refresh |
|------------------------------|---------|---------|
| `reports/dashboard-v2/dashboard-v2-county-coverage.csv` | Per-county field completion, profile depth | `npm run audit:dashboard-v2` |
| `src/data/arkansasStateAlignedTargets2022.json` | Planning vote targets by county | Script-generated |
| `reports/full-profile-qa/full-profile-qa-summary.json` | Connected/promotable profiles | `audit:full-profile-qa` |
| `reports/county-intelligence/region-intelligence-summary.json` | Region rollups | generate scripts |
| `counties/arkansas/countyIndex.ts` | 75-county registry (not parsed at runtime — CSV mirrors slugs) | Human |

---

## Route families (operator + public)

### Public Pope hub
`/`, `/workbench`, `/how-we-win`, `/registration-goal`, `/pathway-to-victory`, `/community-organizing`, `/resources` — KPI deck, **50k registration** ambition, **Power of 5** copy.

### County operator (`/counties/[slug]/*`)
- `dashboard-v2` — field-first dashboard model  
- `intelligence` — taxonomy + KPIs (goals null until connected)  
- `analysis`, `path-to-victory`, `leader`, `campaign-manager`  
- Source intake, profile scaffolds, calendar/email tools  

### Statewide tools (`/counties/tools/*`)
`intelligence`, `dashboard-v2`, `regional-rollout`, `source-intake`, `schedule`, `email-center` — each with CSV/JSON export.

---

## KPI / scoring formulas (countyWorkbench)

| Engine | Formula |
|--------|---------|
| County intelligence | `dataQualityScore = verified/total×100`; `sourceCoverage = (verified+sourced)/total×100` |
| Readiness | Profile sections verified ÷ required |
| Dashboard V2 tab | `verifiedFields/totalFields×100` |
| State-aligned targets | `countyTarget50 = statewideThreshold50 × (county Dem Gov 2022 ÷ state Dem Gov 2022)` |

Campaign OS **labels planning-estimate** when using state-aligned proxy for registration/Power of 5.

---

## Power of 5

- Product copy: `/how-we-win`, `/resources`, `/community-organizing`, field playbook role `power-of-five-evangelist`  
- Intelligence field: `registration.relationalGoal` (adapter not connected)  
- RedDirt: `power-of-five-engine.ts` — statewide 50k planning target, per-county share from state-aligned weights  

---

## AI agent should learn

| From | Learn |
|------|-------|
| Coverage CSV | Which counties are shell vs full, completion %, weaknesses |
| State-aligned JSON | Relative persuasion opportunity by county |
| QA JSON | Which profiles are safe to cite |
| Region rollup | Regional averages, goal connection gaps |
| Event ledger (RedDirt) | Where events happen vs weak counties |
| Hot wash (RedDirt) | Whether event advanced county goals |

---

## Campaign OS relationship

| RedDirt surface | countyWorkbench link |
|-----------------|----------------------|
| `/admin/ai-command-center` | Statewide county panel |
| `/admin/campaign-manager-dashboard` | Compact county attention |
| `/admin/candidate-dashboard` | Compact county attention |
| `/admin/campaign-events/workbench` | Priority counties |
| `/admin/campaign-events/[recordId]` | Event county context card |
| `/admin/counties/[slug]` | Portal URL bridge |

---

## Blockers to full intelligence

1. Governance registration sheet not connected (`registrationGoals.ts` all null)  
2. `county-dashboard-field-records.json` empty  
3. No live API — refresh requires re-export CSV/JSON  
4. 69 shell counties — weak data until intake  

See `COUNTY_INTELLIGENCE_ENGINE.md` for RedDirt-side behavior.
