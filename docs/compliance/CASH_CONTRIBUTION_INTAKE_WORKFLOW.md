# Cash Contribution Intake Workflow

## Pass 1 Scope

Cash Contribution Intake is a JSON fallback subsystem under `/admin/compliance/cash`.

It stages cash contributions for human review only. It does not auto-finalize contributions, certify legal compliance, store ID images, or mark records filing-ready without approval.

## Routes

- `/admin/compliance/cash`
- `/admin/compliance/cash/new`
- `/admin/compliance/cash/review`
- `/admin/compliance/cash/batches`
- `/admin/compliance/cash/settings`
- `/admin/compliance/cash/slip`

## Campaign Working Policy

Current configurable defaults:

- Max cash contribution amount: `$100`
- ID required: `true`
- Contributor information required: `true`
- Human review required: `true`

Rule source note: the exact Arkansas cash-specific threshold language still needs verification by campaign counsel/compliance officer.

## Storage

- `data/compliance/cash/staged-cash-contributions.json`
- `data/compliance/cash/cash-intake-audit-log.json`
- `data/compliance/cash/cash-deposit-batches.json`
- `data/compliance/cash/cash-policy.json`
- `data/compliance/cash/uploads/` ignored for future private images

## AI/OCR Posture

OCR is advisory only. If OpenAI is unavailable or image retention has not been approved, intake falls back to manual entry and marks OCR confidence as low.

AI cannot approve contributions, certify ID, decide legal compliance, alter source images, or hide missing fields.

## Pass 2 Needs

- Database-backed cash contribution staging.
- Object storage policy for bill/slip images.
- Treasurer-approved ID evidence retention setting.
- Conversion into the final compliance ledger.
- Bank reconciliation against cash deposit batches.
