# Rule topic review packet

Human review packet for Arkansas compliance **rule topics** that block campaign reliance until marked reviewed on `/admin/compliance/rules`. This is **not** legal certification — source-reviewed for campaign workflow only.

## Generate fresh counts

```bash
npm run compliance:rule-topic-packet
```

Writes redacted JSON (gitignored): `data/compliance/reports/rule-topic-review-packet.json`

## Why review is required

- `rule_review` approval queue items reference topics not yet verified in the rules corpus audit
- Batch approval **excludes** `rule_review` always
- Single-item approve requires override reason when blockers include rule review
- QA: `compliance:qa-approval` asserts rule_review cannot batch

## Topic list (structure)

Each entry in the JSON export includes:

| Field | Meaning |
|-------|---------|
| `topicId` | Corpus topic key |
| `label` | Human label |
| `verified` | Whether marked reviewed on Rules UI |
| `approvalItemsAffected` | Count of `rule_review` items tied to topic (no donor names) |
| `whyReviewRequired` | Campaign workflow requirement |
| `evidenceAvailable` | Official/campaign sources indexed |
| `unresolvedQuestion` | Next action from corpus audit |
| `recommendedDecisionFormat` | How to record decision |
| `qaGuard` | Override + no batch |

**Expected:** ~13 topics with `verified: false` until operator completes Rules page review.

## Recommended human decision format

1. Open `/admin/compliance/rules` → topic
2. Read linked official/campaign sources
3. Record initials + short note on topic (campaign workflow)
4. Mark topic **reviewed for campaign compliance workflow**
5. Re-run `npm run compliance:rule-topic-packet` — `unverifiedCount` should decrease

Do **not** batch-approve `rule_review` queue items to skip this.

## How QA proves rule_review was not bypassed

- `scripts/compliance/qa-approval-workbench.ts` — batch eligibility excludes `rule_review`
- `approval-guards.ts` / `approval-actions.ts` — override required
- Handoff JSON reports `batchEligible: 0` while rule topics unverified
- Operator export v2 flags `rule_review` in burn-down **start order** first

## Recording decisions

- Rules UI review state (preferred)
- Per-item override reason on workbench when approving despite rule_review blocker (document which topic was reviewed)

## Related

- `ARKANSAS_RULE_SOURCE_AUDIT.md`
- `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md`
