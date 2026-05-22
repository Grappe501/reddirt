# County Intelligence Engine

**Code:** `src/lib/agents/county-intelligence/`

## Pipeline

```text
county-workbench-adapter (read CSV/JSON)
        ↓
county-kpi-types (CountyNormalizedKpi)
        ↓
county-intelligence-engine (rank, plans, summaries)
        ↓
power-of-five-engine (relational gaps)
        ↓
UI panels + event/hot wash helpers
```

## Outputs

- `StatewideCountyIntelligence` — heat list, weak/opportunity counties  
- `CountyIntelligenceSummary` — event drilldown “why here”  
- `CountyActionPlan` — per-county prioritized actions  
- `CountyActionPackage` — operator task package (V2)  
- `CountyHotWashImpactV2` — post-event vs goals + next county action  
- `FieldManagerDailyCountyPlan` — daily statewide field guidance  

## V2 surfaces

- `/admin/county-intelligence` — statewide command center (`CountyCommandCenterPanel`)
- Copilots — `county-copilot-applications.ts` merged into role copilot briefs
- Event drilldown — `EventCountyPlanningGuidance` on planning tab
- Hot wash — `analyzeCountyHotWashImpactV2`

## Related docs

- [`COUNTY_COPILOT_APPLICATIONS.md`](./COUNTY_COPILOT_APPLICATIONS.md)
- [`COUNTY_ACTION_PACKAGE_SYSTEM.md`](./COUNTY_ACTION_PACKAGE_SYSTEM.md)
- [`COUNTY_TRAINING_MODULES.md`](./COUNTY_TRAINING_MODULES.md)
- [`COUNTY_DASHBOARD_MODULES.md`](./COUNTY_DASHBOARD_MODULES.md)

## Human gates

- Read-only on countyWorkbench  
- No voter file writes  
- County memory enrichment is **advisory** until human save  

## Tests

- `npm run agents:test-county-intelligence` (V1 bridge, 20 tools)
- `npm run agents:test-county-copilots` (V2 packages, copilots, 15 tools, modules)
