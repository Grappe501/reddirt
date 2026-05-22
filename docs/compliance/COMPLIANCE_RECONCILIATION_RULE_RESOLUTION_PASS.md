# Reconciliation review and rule resolution pass

## Delivered

### Reconciliation workbench (`/admin/compliance/reconciliation`)

- Treasurer panels for **high-confidence**, **ambiguous**, and **unmatched** bank credits from rehearsal data.
- **Create draft** actions only — treasurer must approve and lock on match detail (no auto-resolve).
- Ambiguous flow requires explicit payout pick with confirmation.
- Progress metrics on page and command center.

### Rule review workflow (`/admin/compliance/rules`)

- Decision workflow panel listing all `rule_review` queue items with links to topic + workbench item.
- `?focus={topicId}` highlights topic card.
- Marking topic reviewed syncs related queue items to `needs_review` with suggested note (does not auto-approve).

### Command center

- Reconciliation progress card: % reviewed, ambiguous/unmatched draft counts, locked matches.

### Production bank import

- Netlify warning on bank import page.
- `docs/compliance/COMPLIANCE_NETLIFY_BANK_IMPORT.md`

### Filing blockers

- `recon-review` blocker when rehearsal items remain.
- `rule-review-topics` blocker when topics pending Rules review.

### Scripts

- `npm run compliance:reconciliation-review-report`
- `npm run compliance:rule-resolution-report`

## Guards preserved

- No batch `rule_review`
- No auto-resolve ambiguous credits
- No fake filing green
- Confidence gates unchanged

## Next operator steps

1. Work ambiguous/unmatched on reconciliation page.
2. Complete Rules topic reviews, then individual queue approvals.
3. Re-import bank CSV on Netlify after each deploy if using filesystem staging.
