# Compliance AI intelligence brief

Generated: 2026-05-20T03:49:04.363Z · Commit: ad4f8b4

| Metric | Value |
|--------|-------|
| Filing | **red** |
| Completion | 57% |
| QA | 66 (yellow) |
| Open queue | 221 |
| Batch eligible | 0 |
| Rule review | 44 |

## Diagnosis
Filing red is honest. Overwhelming queue is structural. Use Ernie workflow + audit spreadsheet, not generic queue first.

## Top 5 critical path
1. **Complete April audit spreadsheet (human_answer columns)** (ernie) — critical
2. **Extract and verify all physical checks on SOS board** (ernie) — critical
3. **Enter Ozark auction in-kind lines in SOS** (ernie) — high
4. **Resolve ambiguous and unmatched bank credits** (treasurer) — high
5. **Complete Rules page topic reviews** (compliance_officer) — high

## Data quality
Overall: 36/100

## Unsafe shortcuts (never)
- batch approve rule review
- lower confidence threshold below 98
- fake filing green
- invent bank csv or transactions
- commit data compliance tasks json
- export unredacted donor names
- apply db migration without steve approval
- bypass storage or rls gates

Regenerate: `npm run compliance:ai-intelligence`