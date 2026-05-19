# Compliance AI operating model

The compliance AI is the **operating brain** — it leads prioritization and inspection, but **cannot bypass** human, legal, source, or Steve gates.

## What the AI may do automatically

- Run read-only inspectors (`compliance:ai-brain`, QA scripts, handoff JSON)  
- Generate **redacted** next-action and risk reports  
- Suggest queue burn-down order and near-eligible fixes  
- Summarize filing blockers, bank readiness, storage health  
- Draft operator briefs (`COMPLIANCE_AI_BRAIN_BRIEF.md`)  
- Point to routes and npm commands  

## What requires human review

- Any **approval**, **reject**, or **needs info** on workbench items  
- **Rule topic** mark-reviewed on Rules page (campaign workflow, not legal advice)  
- **rule_review** item approval — override + documented reason only  
- Reconciliation **lock** or **reject** of ambiguous matches  
- Filing package **export** and treasurer sign-off  
- Interpreting Arkansas rules for legal compliance  

## What requires Steve approval

- **DB migration** apply, cutover, `COMPLIANCE_DB_MIGRATED`  
- Production **Supabase** bucket policy changes  
- Changing confidence thresholds or batch rules  
- Cross-lane integrations  

## What requires source files

- **Bank credits** — treasurer export CSV **or** validated rows in `data/compliance/imports/bank/*.analysis.json` (admin import). A missing `bank-april-2026.csv` file does **not** mean bank data is absent if chunks exist.  
- GoodChange CSV, receipt/check images on disk  
- Ethics workbook if used  
- Real donor/bank data stays out of git  

## What requires browser/operator confirmation

- Visual evidence on workbench  
- Launch rehearsal checklist  
- Netlify production verify  
- Storage RLS manual verification in Supabase dashboard  

## What must never be automated

- `batch_approve_rule_review`  
- Lowering confidence below **98%** for batch  
- Marking filing **green** while blockers exist  
- Inventing bank transactions or CSV rows  
- Committing `data/compliance/tasks/*.json`  
- Unredacted donor exports  
- DB migration without approved plan  
- Auto legal certification  

## Rule review decisions

1. Human reviews topic on `/admin/compliance/rules` with official sources linked.  
2. Record initials + note on topic.  
3. Queue `rule_review` items: single approve with override referencing topic review — **not** batch.  
4. QA: `qa-approval` ensures batch eligible excludes rule_review.

## Confidence interpretation

- **&lt;98%:** Not batch-eligible; complete fields and evidence.  
- **≥98%:** May become batch-eligible if no rule_review, blockers, high_risk, source_update_pending, etc.  
- AI must not “round up” confidence.

## How filing gates turn green

Each blocker on filing readiness has a `greenCondition` tied to **source-backed** state (bank file, queue cleared, rules reviewed, storage probe, hard gates). Filing overall green only when `buildFilingReadinessReport` and hard gates agree — never by script override.

## How the AI chooses next actions

1. Run `buildComplianceBrainSnapshot`.  
2. `buildComplianceNextActions` — priority: bank → recon → rules → queue → storage → DB → rehearsal.  
3. Respect `blockedBy` dependencies.  
4. Emit risks for anything that tempts unsafe shortcuts.  

## Commands

| Command | Use |
|---------|-----|
| `compliance:ai-brain` | Full snapshot + JSON + brief |
| `compliance:ai-daily-brief` | Operator morning brief |
| `compliance:ai-next-actions` | Actions only |
| `compliance:ai-risk-report` | Risks only |
| `compliance:ai-launch-readiness` | Launch checklist score |
| `compliance:ai-brain:qa` | Schema validation |
| `compliance:ai-expert` | Expert snapshot + coaches + completion progress |
| `compliance:ai-expert:qa` | Expert artifact schema validation |
| `compliance:ai-progress-chart` | `completion-progress.json` + progress matrix doc |
| `compliance:ai-operator-coach` | Step-by-step operator workflow |
| `compliance:ai-filing-coach` | Filing blocker coach |
| `compliance:ai-rule-coach` | Arkansas rule topic coach |
| `compliance:ai-reconciliation-coach` | Bank recon coach |
| `compliance:ai-ux-audit` | Route UX audit JSON |
| `compliance:ai-market-plan` | Market readiness summary |

## Expert v2 (guided operator)

The expert layer adds **why** and **step-by-step coaches** on top of the brain snapshot. It must:

- Explain blockers in plain English  
- Lead with one next action (command center)  
- Distinguish automate vs human vs Steve vs source file  
- Never certify legal compliance  

## Related

- `COMPLIANCE_STATE_OF_BUILD.md`  
- `COMPLIANCE_COMPLETION_PLAN.md`  
- `/admin/compliance/command-center`
