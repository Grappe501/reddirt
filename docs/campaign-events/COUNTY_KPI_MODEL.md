# County KPI Model

**Types:** `src/lib/agents/county-intelligence/county-kpi-types.ts`

## CountyNormalizedKpi fields

Registration, voter contact, Power of 5, volunteer, event, donation goals/currents/progress, readiness scores, weaknesses, opportunities, recommended actions, source links.

## Source labeling

| `goalSource` | Meaning |
|--------------|---------|
| `planning-estimate` | State-aligned 2022 Gov vote-share proxy |
| `county-workbench-csv` | Coverage/readiness from dashboard-v2 audit |
| `not-connected` | Governance sheet missing |

## Scores (0–100)

- **countyReadinessScore** — completion + profile depth + QA  
- **fieldStrengthScore** — field ops capacity proxy  
- **persuasionOpportunityScore** — Dem base size proxy  
- **turnoutRiskScore** — higher for shell counties  

Progress fields stay `null` until RedDirt `CountyVoterMetrics` or countyWorkbench goals adapter connects.
