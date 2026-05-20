# Compliance AI diagnosis

Commit ad4f8b4 · Filing **red**

Filing red is honest. Overwhelming queue is structural. Use Ernie workflow + audit spreadsheet, not generic queue first.

## Why is filing red?

**Answer:** 10 blocker(s) on filing readiness; hard gates and rule coverage incomplete.

**Root cause:** Source-backed gates: rules, queue backlog, reconciliation, storage, human sign-off.

Owner: compliance_officer · Severity: critical

## Why does the queue feel overwhelming?

**Answer:** 221 open items including 44 rule_review rows; batch eligible is 0.

**Root cause:** April26 ingest created one row per image/topic; rule_review cannot batch; 98% confidence gate.

Owner: operator · Severity: high

## Why is batch eligible 0?

**Answer:** Confidence threshold ≥98%, rule_review excluded, blockers/evidence required.

**Root cause:** By design — prevents unsafe mass approval.

Owner: ai_assist · Severity: medium

## Why are checks hard to audit?

**Answer:** 36 unmatched checks; images need SOS board extract; 10 SOS rows missing required fields.

**Root cause:** Multi-check photos; approval queue only has reviewNote per image.

Owner: ernie · Severity: high

## Why are in-kind photos hard to review?

**Answer:** Each photo lists dozens of items; queue has 3 photo rows vs 49 spreadsheet lines.

**Root cause:** Wrong tool for line items — use Ozark auction page + audit CSV.

Owner: ernie · Severity: high

## Why may production differ from local?

**Answer:** April26 folder and check workbook JSON are local; Netlify lacks COMPLIANCE_APRIL26_DIR unless synced.

**Root cause:** Environment data gap — not a logic bug.

Owner: steve · Severity: high

Regenerate: `npm run compliance:ai-diagnose`