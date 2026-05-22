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
- `CountyHotWashImpactAnalysis` — post-event vs goals  

## Human gates

- Read-only on countyWorkbench  
- No voter file writes  
- County memory enrichment is **advisory** until human save  

## Test

`npm run agents:test-county-intelligence`
