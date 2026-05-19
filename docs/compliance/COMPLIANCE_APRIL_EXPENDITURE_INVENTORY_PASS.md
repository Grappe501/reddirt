# April expenditure and check inventory — pass report

**Lane:** `RedDirt-main-travel-ledger`  
**Generated:** 2026-05-19  
**Commit (inventory run):** `9ead0eb` (pre-commit; new commit follows this pass)

## Mission outcome

Built a reviewable April 2026 expenditure/check inventory that lists uploaded checks, bank ledger debits, conservative match gaps, address flags (no fabrication), and operator review prompts.

## Counts (from `npm run compliance:april-expenditure-inventory`)

| Metric | Count |
| --- | ---: |
| Uploaded checks / check records | 44 |
| April ledger expenditures | 56 |
| Exact matches | 8 |
| Likely matches | 0 |
| Unmatched uploaded checks | 36 |
| Unmatched ledger expenditures | 48 |
| Missing address flags | 72 |
| Ambiguous match groups | 0 |

## Major discrepancies

- **36 uploaded check records** have no paired April ledger expenditure (many are check images only or contribution-side checks — expected until vision/field entry).
- **48 ledger debits** have no uploaded check/receipt pairing (card/POS and fees dominate).
- Only **8 exact** amount/date (±$0.01, ±3 days) pairings — no auto-resolution of uncertain items.
- **72 address gap flags** — identification only; no addresses invented.

## Outputs

| Artifact | Path |
| --- | --- |
| JSON (gitignored) | `data/compliance/ai/april-expenditure-inventory.json` |
| Markdown report | `docs/compliance/COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md` |
| Scripts | `npm run compliance:april-expenditure-inventory`, `:qa` |

## UI

- Command center and April26 hub show **April expenditure inventory** counts (uploaded checks, ledger expenditures, matched, unmatched ledger, missing addresses).

## Next human review actions

1. Walk **COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md** section 1 against physical check images in `Compliance/April26`.
2. Walk section 2 against bank statement / `bank-april-2026.csv` (local only — not committed).
3. Use section 5 operator list: confirm check images, resolve unmatched ledger lines, find vendor addresses where flagged (do not enter guessed addresses).
4. Re-run `npm run compliance:april-expenditure-inventory` after field entry or new imports.

## QA results

| Command | Result |
| --- | --- |
| `compliance:april-expenditure-inventory` | OK |
| `compliance:april-expenditure-inventory:qa` | OK — schema, totals reconcile, no donor PII patterns, no fabricated addresses |
| `compliance:qa-reconciliation` | OK |
| `compliance:qa-filing` | OK (filing still red — expected) |
| `compliance:ai-brain` | OK — rehearsal_ready |
| `compliance:ai-expert` | OK — 57% completion |
| `typecheck` | OK |
| `lint` | OK (warnings only, pre-existing) |
| `build` | OK |

## WorkflowIntake / `/api/forms`

Not in scope for this slice — no change.

## Days 4–7 compression

Safe to continue parallel work; this inventory unblocks human compare-to-source before address entry. Filing remains blocked on reconciliation and documentation per existing gates.
