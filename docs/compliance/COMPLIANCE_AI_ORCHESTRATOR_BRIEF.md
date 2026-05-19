# Compliance AI orchestrator brief

Generated: 2026-05-19T23:22:51.695Z · Commit: `39e3441`

## Program summary

Filing red, launch rehearsal_ready, 57% complete. 221 open approvals; 12 recon items; 44 rule topics pending.

## Next best action

**Resolve ambiguous and unmatched bank credits** (treasurer)

Highest priority safe action: 12 rehearsal item(s) block honest reconciliation closure. Treasurer must pick payouts or create investigation drafts.

- Why: 12 rehearsal item(s) block honest reconciliation closure. Treasurer must pick payouts or create investigation drafts.
- Expected impact: Up to 12 rehearsal credit(s) move toward draft → approve → lock.
- Link: /admin/compliance/reconciliation
- Command: `npm run compliance:reconciliation-review-report`

## Today's work plan

1. [treasurer] Resolve ambiguous and unmatched bank credits
2. [human] Complete Rules page topic reviews
3. [operator] Review unmatched bank lines
4. [human] Review unverified rule topics
5. [operator] Burn down approval queue

## Changes since last pass

- (none)

## Unsafe shortcuts (never automate)

- batch approve rule review
- lower confidence threshold below 98
- fake filing green
- invent bank csv or transactions
- commit data compliance tasks json
- export unredacted donor names
- apply db migration without steve approval
- bypass storage or rls gates
- auto certify legal compliance
- delete approval or filing records

## Decision guard

- All guards passed: **true**
- Production bank verified: **true**
- Production bank import verified via env or validated chunks on this host.

## Regenerate

```bash
npm run compliance:ai-orchestrator
npm run compliance:ai-orchestrator:qa
```
