# Cursor script — Phase 8: Google Contacts

Active lane: RedDirt (worktree `H:\SOSWebsite\RedDirt-contact-intel`)
Branch: `feat/contact-intelligence-v1`
Phase: 8 — Google Contacts
One objective: Ingest saved Google Contacts from multiple accounts into Contact Intelligence using the same match/preview/commit rules.

Allowed paths:
- `src/lib/contact-intel/google-contacts/**`
- `src/app/admin/contact-intel/sources/**`
- additive Prisma only
- `docs/contact-intelligence/**`

Forbidden:
- Ingesting Gmail participants
- Ingesting Other contacts unless Steve explicitly expands scope
- Auto-merge on name
- Sends
- Writing into EmailContactProfile as the primary store

Reuse: `normalizeEmail`, `normalizePhone`, Phase 2 matcher; existing `GoogleContactRecord` may be a source adapter, not the library of record.

Steps:
1. Connect accounts.
2. Pull saved contacts as source rows (original payload retained).
3. Preview new/update/conflict.
4. Commit with provenance = google-contacts + account email.

Acceptance: a synthetic/test contact with email+phone lands on one person; name-only contacts without email/phone are INVALID.

Stop if: the People API scope would also pull mail contents.
