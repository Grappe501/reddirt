# April 2026 review workflow

1. **Ingest** — Run `compliance:april26:dry` then `compliance:april26:ingest` (vision optional).
2. **Dashboard** — Open `/admin/compliance/april26` for counts, blockers, and review shortcuts.
3. **Lightning Approval** — Queue `April 2026 Compliance Review` (`april-2026-compliance-review`). Every AI/OCR field is draft; officer must verify employer, occupation, address, amounts, and dates.
4. **Money center** — Staged movements prefixed `april26-` appear in `/admin/compliance/money`.
5. **Reconciliation** — When bank CSV is present, match payout net deposits and receipt/expense pairs in `/admin/compliance/reconciliation`. All matches stay **candidate** until approved and locked.
6. **Filing** — Unapproved records are excluded from filing export. Treasurer/counsel sign-off required; not legal certification.

## Review buttons (dashboard)

Contributions, expenses, receipts, checks/cash, in-kind, payout batches, and the full workbench link into existing RedDirt routes.
